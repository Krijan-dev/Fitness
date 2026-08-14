import mongoose from "mongoose";
import { getMongoUri, mongoConnectionOptions } from "@/lib/mongo-tls";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache ?? {
  conn: null,
  promise: null,
};

global.mongooseCache = cached;

export { getMongoUri, mongoConnectionOptions } from "@/lib/mongo-tls";

export async function connectMongo(): Promise<typeof mongoose> {
  const uri = getMongoUri();

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, mongoConnectionOptions(uri));
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
