export class AppError extends Error {
  readonly status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
  }

  static notFound(message = "Não encontrado") {
    return new AppError(message, 404);
  }

  static badRequest(message: string) {
    return new AppError(message, 400);
  }

  static unauthorized(message = "Não autorizado") {
    return new AppError(message, 401);
  }
}
