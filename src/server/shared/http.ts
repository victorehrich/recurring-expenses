import { NextResponse } from "next/server";
import { AppError } from "./errors";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function created<T>(data: T) {
  return NextResponse.json(data, { status: 201 });
}

export function fail(message: string, status = 500) {
  return NextResponse.json({ error: message }, { status });
}

export function failFrom(error: unknown, fallbackStatus = 500) {
  if (error instanceof AppError) {
    return fail(error.message, error.status);
  }
  if (error instanceof Error) {
    // Mongoose CastError (ObjectId inválido) vira 400 para manter contrato
    if (error.name === "CastError") {
      return fail(error.message, 400);
    }
    // ValidationError do Mongoose vira 400
    if (error.name === "ValidationError") {
      return fail(error.message, 400);
    }
    return fail(error.message, fallbackStatus);
  }
  return fail("Erro interno", fallbackStatus);
}
