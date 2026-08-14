import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const BCRYPT_HASH = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    disabled: { type: Boolean, default: false },
    lastActivityAt: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

userSchema.pre("save", function refusePlaintextPassword() {
  const doc = this as {
    password?: unknown;
    passwordHash?: string;
    isModified: (path: string) => boolean;
  };
  if ("password" in doc) {
    delete doc.password;
  }
  if (doc.isModified("passwordHash") && doc.passwordHash && !BCRYPT_HASH.test(doc.passwordHash)) {
    throw new Error("Refusing to store a non-bcrypt password hash");
  }
});

userSchema.set("toJSON", {
  transform(_doc, ret: Record<string, unknown>) {
    delete ret.passwordHash;
    delete ret.password;
    return ret;
  },
});

export type UserDocument = InferSchemaType<typeof userSchema> & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const User: Model<UserDocument> =
  mongoose.models.User || mongoose.model<UserDocument>("User", userSchema);
