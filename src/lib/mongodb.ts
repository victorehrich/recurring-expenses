import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Defina a variável de ambiente MONGODB_URI (veja o arquivo .env.example)."
  );
}

// Cache de conexão para evitar reconectar a cada chamada de API em dev/serverless.
type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global._mongooseCache ?? {
  conn: null,
  promise: null,
};
global._mongooseCache = cached;

export async function connectToDatabase() {
  if (cached.conn) return cached.conn;

  cached.promise ??= mongoose.connect(MONGODB_URI as string, {
      bufferCommands: false,
    });

  cached.conn = await cached.promise;
  return cached.conn;
}
