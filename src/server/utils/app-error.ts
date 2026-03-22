export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;
  public readonly expose: boolean;

  public constructor(
    message: string,
    statusCode = 400,
    options?: {
      code?: string;
      details?: unknown;
      expose?: boolean;
    }
  ) {
    super(message);

    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = options?.code ?? 'application_error';
    this.details = options?.details;
    this.expose = options?.expose ?? statusCode < 500;
  }
}
