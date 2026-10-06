import { Strategy, type StrategyHandler } from 'serwist';

interface NetworkOnlyWithRetryOptions {
  /** Total fetch attempts (default 3). */
  maxAttempts?: number;
  /** Base delay in ms; doubles each retry (default 280). */
  retryDelayMs?: number;
}

/**
 * Network-only strategy with short retries for flaky mobile radios.
 * Never writes to Cache API — safe for /dashboard and /api.
 */
export class NetworkOnlyWithRetry extends Strategy {
  private readonly maxAttempts: number;
  private readonly retryDelayMs: number;

  constructor(options: NetworkOnlyWithRetryOptions = {}) {
    super();
    this.maxAttempts = Math.max(1, options.maxAttempts ?? 3);
    this.retryDelayMs = Math.max(50, options.retryDelayMs ?? 280);
  }

  protected async _handle(request: Request, handler: StrategyHandler): Promise<Response> {
    let lastError: unknown;

    for (let attempt = 0; attempt < this.maxAttempts; attempt++) {
      try {
        const response = await handler.fetch(attempt === 0 ? request : request.clone());
        return response;
      } catch (error) {
        lastError = error;
        if (attempt < this.maxAttempts - 1) {
          await new Promise((resolve) => setTimeout(resolve, this.retryDelayMs * 2 ** attempt));
        }
      }
    }

    throw lastError;
  }
}
