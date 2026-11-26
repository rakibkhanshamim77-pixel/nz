import mongoose, { Document, Model, Schema, Types } from "mongoose";
import bcryptjs from "bcryptjs";
import { normalizeBDPhone, BD_PHONE_REGEX } from "@/app/utils/phone";
export { normalizeBDPhone, BD_PHONE_REGEX };

/** Empty strings become undefined so sparse unique indexes don't collide on "". */
const emptyToUndefined = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? undefined : v;

// ─── User Roles ───────────────────────────────────────────────────────────────

export enum UserRole {
  USER = "user",
  ADMIN = "admin",
  MODERATOR = "moderator",
}

// ─── Address ──────────────────────────────────────────────────────────────────

export interface IAddress {
  _id?: Types.ObjectId;
  label: string;
  name: string;
  phone: string;
  address: string;
  district: string;
  city: string;
  isDefault: boolean;
}

// ─── User Interface ───────────────────────────────────────────────────────────

export interface IUser {
  /** Required — the login identity. Stored as 01XXXXXXXXX. */
  phone: string;
  isPhoneVerified: boolean;

  /** Optional profile fields */
  name?: string;
  email?: string;
  isEmailVerified: boolean;
  profileImage?: string;

  /** Only used for admin / staff password login. Customers log in with OTP. */
  password?: string;

  /** Google OAuth sub — set when the user signs in with Google. */
  googleId?: string;

  role: UserRole;
  permissions?: string[];
  isActive: boolean;

  addresses?: IAddress[];

  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserDocument extends IUser, Document {
  comparePassword(password: string): Promise<boolean>;
  hashPassword(): Promise<void>;
}

export interface IUserModel extends Model<IUserDocument> {
  findByPhone(phone: string): Promise<IUserDocument | null>;
  findByEmail(email: string): Promise<IUserDocument | null>;
  /** Finds the user for a verified phone, or creates one. Used right after OTP success. */
  findOrCreateByPhone(phone: string): Promise<IUserDocument>;
  /** Finds the user by googleId, or creates one. Used after Google OAuth. */
  findOrCreateByGoogle(profile: { googleId: string; email: string; name?: string; picture?: string }): Promise<IUserDocument>;
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const AddressSchema = new Schema<IAddress>({
  label: { type: String, required: true, trim: true, maxlength: 50 },
  name: { type: String, required: true, trim: true, maxlength: 50 },
  phone: {
    type: String,
    required: true,
    trim: true,
    set: normalizeBDPhone,
    match: [BD_PHONE_REGEX, "বৈধ বাংলাদেশি ফোন নম্বর প্রদান করুন"],
  },
  address: { type: String, required: true, trim: true, maxlength: 500 },
  district: { type: String, default: "", maxlength: 80 },
  city: { type: String, default: "", maxlength: 80 },
  isDefault: { type: Boolean, default: false },
});

const UserSchema = new Schema<IUserDocument, IUserModel>(
  {
    phone: {
      type: String,
      unique: true,
      sparse: true, // Google-only users have no phone; international users store dial+number
      trim: true,
      set: (v: unknown) => {
        if (!v || typeof v !== "string" || v.trim() === "") return undefined;
        return v.trim();
      },
    },

    isPhoneVerified: { type: Boolean, default: false },

    name: {
      type: String,
      trim: true,
      set: emptyToUndefined,
      minlength: [2, "নাম কমপক্ষে ২ অক্ষরের হতে হবে"],
      maxlength: [50, "নাম ৫০ অক্ষরের বেশি হতে পারবে না"],
    },

    email: {
      type: String,
      unique: true,
      sparse: true, // many users can have no email
      lowercase: true,
      trim: true,
      set: emptyToUndefined,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
        "অনুগ্রহ করে একটি বৈধ ইমেইল ঠিকানা প্রদান করুন",
      ],
    },

    isEmailVerified: { type: Boolean, default: false },

    profileImage: { type: String, default: undefined },

    password: { type: String, select: false, minlength: 8 },

    googleId: { type: String, unique: true, sparse: true, default: undefined },

    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },

    permissions: { type: [String], default: [] },

    isActive: { type: Boolean, default: true },

    addresses: { type: [AddressSchema], default: [] },

    lastLogin: { type: Date, default: null },
  },
  { timestamps: true },
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
// phone and email already get indexes from `unique`.

UserSchema.index({ createdAt: -1 });

// ─── Password Methods (admin only) ────────────────────────────────────────────

UserSchema.methods.comparePassword = async function (
  password: string,
): Promise<boolean> {
  if (!this.password) return false;
  return bcryptjs.compare(password, this.password);
};

UserSchema.methods.hashPassword = async function (): Promise<void> {
  if (!this.password) return;
  this.password = await bcryptjs.hash(this.password, 12);
};

// ─── Static Methods ───────────────────────────────────────────────────────────

UserSchema.statics.findByPhone = function (phone: string) {
  return this.findOne({ phone: normalizeBDPhone(phone) });
};

UserSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email: email.trim().toLowerCase() });
};

UserSchema.statics.findOrCreateByGoogle = async function ({
  googleId,
  email,
  name,
  picture,
}: {
  googleId: string;
  email: string;
  name?: string;
  picture?: string;
}) {
  // Try to find by googleId first, then by email (to link existing accounts)
  let user = await this.findOne({ googleId });
  if (!user) {
    user = await this.findOne({ email: email.trim().toLowerCase() });
  }
  if (user) {
    // Attach googleId if not set, update profile fields
    const update: Record<string, unknown> = { lastLogin: new Date() };
    if (!user.googleId) update.googleId = googleId;
    if (!user.name && name) update.name = name;
    if (!user.profileImage && picture) update.profileImage = picture;
    if (!user.isEmailVerified) update.isEmailVerified = true;
    Object.assign(user, update);
    await user.save();
    return user;
  }
  return this.create({
    isPhoneVerified: false,
    email: email.trim().toLowerCase(),
    isEmailVerified: true,
    name,
    profileImage: picture,
    googleId,
    lastLogin: new Date(),
  });
};

UserSchema.statics.findOrCreateByPhone = async function (phone: string) {
  const normalized = normalizeBDPhone(phone);
  return this.findOneAndUpdate(
    { phone: normalized },
    {
      $set: { isPhoneVerified: true, lastLogin: new Date() },
      $setOnInsert: { phone: normalized },
    },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  );
};

// ─── Model Export ─────────────────────────────────────────────────────────────

const User =
  (mongoose.models.User as IUserModel) ||
  mongoose.model<IUserDocument, IUserModel>("User", UserSchema);

export default User;
