"use client";

import FormSection, {
  FieldError,
} from "../../../products/_components/form/FormSection";
import { UserAvatar } from "../UserBadges";
import { USER_LIMITS } from "@/db/validation/user.validation";
import {
  PHONE_MAX,
  type UserFormErrors,
  type UserFormPatch,
} from "./userFormTypes";

interface Props {
  name: string;
  email: string;
  phone: string;
  profileImage: string;
  errors: UserFormErrors;
  onChange: (patch: UserFormPatch) => void;
}

export default function UserPersonalInfo({
  name,
  email,
  phone,
  profileImage,
  errors,
  onChange,
}: Props) {
  return (
    <FormSection
      id="sec-personal"
      title="Personal Information"
      description="Who this account belongs to"
      icon={
        <>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21a8 8 0 0 1 16 0" />
        </>
      }
    >
      <div className="grid sm:grid-cols-[auto_minmax(0,1fr)] gap-5 items-start mb-5">
        <div className=" place-items-center hidden">
          <UserAvatar
            name={name}
            phone={phone}
            image={profileImage.trim() || undefined}
            size={72}
            className="ring"
          />
        </div>
        <div>
          <label className="block">
            <input
              className="inp text-sm hidden"
              placeholder="https://cdn.example.com/avatars/name.jpg"
              autoComplete="off"
              spellCheck={false}
              value={profileImage}
              onChange={(e) => onChange({ profileImage: e.target.value })}
            />
          </label>

          {profileImage.trim() && (
            <button
              type="button"
              className="btn-ghost !h-9 !px-3 text-xs mt-1"
              onClick={() => onChange({ profileImage: "" })}
            >
              Remove photo
            </button>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block sm:col-span-2">
          <span className="flbl">Full Name</span>
          <input
            className={`inp ${errors.name ? "err" : ""}`}
            maxLength={USER_LIMITS.nameMax}
            placeholder="e.g. Nusrat Jahan"
            autoComplete="off"
            value={name}
            aria-invalid={!!errors.name}
            aria-describedby="name-err"
            onChange={(e) => onChange({ name: e.target.value })}
          />
          <span className="hint">
            <FieldError id="name-err" message={errors.name} />
          </span>
        </label>

        <label className="block">
          <span className="flbl">
            Email Address <span className="font-normal">(optional)</span>
          </span>
          <input
            type="email"
            className={`inp ${errors.email ? "err" : ""}`}
            maxLength={USER_LIMITS.emailMax}
            placeholder="name@neeshanz.com"
            autoComplete="off"
            value={email}
            aria-invalid={!!errors.email}
            aria-describedby="email-err"
            onChange={(e) => onChange({ email: e.target.value })}
          />
          <span className="hint">
            <FieldError id="email-err" message={errors.email} />
          </span>
        </label>

        <label className="block">
          <span className="flbl">Mobile Number *</span>
          <span className="relative block">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[var(--mute)] pointer-events-none">
              +88
            </span>
            <input
              className={`inp !pl-14 ${errors.phone ? "err" : ""}`}
              inputMode="numeric"
              maxLength={PHONE_MAX}
              placeholder="01XXXXXXXXX"
              autoComplete="off"
              value={phone}
              aria-invalid={!!errors.phone}
              aria-describedby="phone-err"
              onChange={(e) =>
                onChange({ phone: e.target.value.replace(/\D/g, "") })
              }
            />
          </span>
          <span className="hint">
            <FieldError id="phone-err" message={errors.phone} />
          </span>
        </label>
      </div>
      <p className="hint">
        This number is the login identity and must be unique.
      </p>
    </FormSection>
  );
}
