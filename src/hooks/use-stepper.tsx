import type { AnyFormApi } from '@tanstack/react-form';
import { useCallback, useState } from 'react';
import type { ZodTypeAny } from 'zod';

type HandleCancelOrBackOpts = {
  onBack?: VoidFunction;
  onCancel?: VoidFunction;
};

type StepState = {
  value: number;
  count: number;
  goToNextStep: () => void;
  goToPrevStep: () => void;
  goToStep: (step: number) => void;
  isCompleted: boolean;
};

export function applyStepIssues(
  form: Pick<AnyFormApi, 'setFieldMeta'> & { setErrorMap?(map: unknown): void },
  issues: ReadonlyArray<{ path: ReadonlyArray<PropertyKey>; message: string }>
) {
  const byField = new Map<string, string[]>();
  const pathless: string[] = [];
  for (const issue of issues) {
    const path = issue.path.reduce<string>(
      (acc, seg) =>
        typeof seg === 'number' ? `${acc}[${seg}]` : acc ? `${acc}.${String(seg)}` : String(seg),
      ''
    );
    if (!path) {
      pathless.push(issue.message);
      continue;
    }
    byField.set(path, [...(byField.get(path) ?? []), issue.message]);
  }
  for (const [path, messages] of byField) {
    form.setFieldMeta(path as never, (meta) => ({
      ...meta,
      isTouched: true,
      errorMap: { ...meta?.errorMap, onSubmit: messages.map((message) => ({ message })) }
    }));
  }

  if (pathless.length && form.setErrorMap) {
    form.setErrorMap({ onServer: pathless.join(' ') });
  }
}

type UseFormStepperOptions = {
  fullSchema?: ZodTypeAny;
};

export function useFormStepper(schemas: ZodTypeAny[], options?: UseFormStepperOptions) {
  const stepCount = schemas.length;
  const [currentStep, setCurrentStep] = useState(1);

  const goToNextStep = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, stepCount));
  }, [stepCount]);

  const goToPrevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }, []);

  const goToStep = useCallback(
    (step: number) => {
      setCurrentStep(Math.min(Math.max(step, 1), stepCount));
    },
    [stepCount]
  );

  const step: StepState = {
    value: currentStep,
    count: stepCount,
    goToNextStep,
    goToPrevStep,
    goToStep,
    isCompleted: currentStep === stepCount
  };

  const currentValidator = schemas[currentStep - 1];
  const isFirstStep = currentStep === 1;

  const triggerFormGroup = async (form: AnyFormApi) => {
    const fieldErrors = await form.validateAllFields('submit');
    for (const name of Object.keys(form.state.fieldMeta)) {
      form.setFieldMeta(name as never, (meta) => ({ ...meta, isTouched: true }));
    }
    const result = currentValidator.safeParse(form.state.values);
    if (!result.success) {
      applyStepIssues(form, result.error.issues);
    }
    const hasFieldErrors = fieldErrors.flat(Infinity).filter(Boolean).length > 0;
    if (!result.success || hasFieldErrors) {
      return { ...result, success: false as const };
    }
    return result;
  };

  const handleNextStepOrSubmit = async (form: AnyFormApi) => {
    const result = await triggerFormGroup(form);
    if (!result.success) {
      return;
    }

    if (currentStep < stepCount) {
      goToNextStep();
      return;
    }

    if (options?.fullSchema) {
      const full = options.fullSchema.safeParse(form.state.values);
      if (!full.success) {
        const failing = schemas.findIndex((s) => !s.safeParse(form.state.values).success);
        if (failing >= 0) {
          goToStep(failing + 1);

          setTimeout(() => {
            void form.handleSubmit();
          }, 0);
          return;
        }

        applyStepIssues(form, full.error.issues);
        return;
      }
    }

    await form.handleSubmit();
  };

  const handleCancelOrBack = (opts?: HandleCancelOrBackOpts) => {
    if (currentStep > 1) {
      opts?.onBack?.();
      goToPrevStep();
      return;
    }
    opts?.onCancel?.();
  };

  return {
    step,
    currentStep,
    isFirstStep,
    currentValidator,
    triggerFormGroup,
    handleNextStepOrSubmit,
    handleCancelOrBack
  };
}
