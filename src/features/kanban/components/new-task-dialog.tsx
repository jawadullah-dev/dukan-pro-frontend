'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useTaskStore } from '../utils/store';
import { useT } from '@/i18n/use-t';

export default function NewTaskDialog() {
  const addTask = useTaskStore((state) => state.addTask);
  const [open, setOpen] = useState(false);
  const [titleError, setTitleError] = useState<string | null>(null);
  const t = useT();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    if (!form.reportValidity()) return;
    const formData = new FormData(form);
    const { title, description } = Object.fromEntries(formData);

    if (typeof title !== 'string' || typeof description !== 'string') return;
    if (!title.trim()) {
      setTitleError(t('kanban.taskTitleRequired'));
      return;
    }
    setTitleError(null);
    addTask(title, description);
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setTitleError(null);
      }}
    >
      <DialogTrigger render={<Button variant='secondary' size='sm' />}>
        {t('kanban.addNewTask')}
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>{t('kanban.addNewTaskTitle')}</DialogTitle>
          <DialogDescription>{t('kanban.dialogDescription')}</DialogDescription>
        </DialogHeader>
        <form id='task-form' className='grid gap-4 py-4' onSubmit={handleSubmit}>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Input
              id='title'
              name='title'
              placeholder={t('kanban.taskTitlePlaceholder')}
              aria-label={t('kanban.taskTitle')}
              required
              aria-invalid={!!titleError}
              aria-describedby={titleError ? 'task-title-error' : undefined}
              className='col-span-4'
            />
            {titleError && (
              <p id='task-title-error' role='alert' className='text-destructive col-span-4 text-sm'>
                {titleError}
              </p>
            )}
          </div>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Textarea
              id='description'
              name='description'
              placeholder={t('kanban.taskDescriptionPlaceholder')}
              aria-label={t('kanban.taskDescription')}
              className='col-span-4'
            />
          </div>
        </form>
        <DialogFooter>
          <Button type='submit' size='sm' form='task-form'>
            {t('kanban.addTask')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
