"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/app/(admin)/_components/AdminToast";
import { createUser, updateUser } from "@/db/actions/admin/user.admin.action";
import { PERMISSION_KEYS, type Permission, type Role } from "@/db/permissions";
import { validateUser, type UserFieldKey, type UserPayload } from "@/db/validation/user.validation";
import { useUnsavedChangesGuard } from "../../../products/_components/form/useUnsavedChangesGuard";
import UserAccountInfo from "./UserAccountInfo";
import UserFormActions, { USER_FORM_ID, UserDiscardDialog } from "./UserFormActions";
import UserPermissionSummary from "./UserPermissionSummary";
import UserPermissions from "./UserPermissions";
import UserPersonalInfo from "./UserPersonalInfo";
import UserPreview from "./UserPreview";
import UserRoleAssignment from "./UserRoleAssignment";
import type {
  UserFormErrors,
  UserFormInitial,
  UserFormPatch,
  UserFormState,
  ViewerContext,
} from "./userFormTypes";

interface Props {
  mode: "create" | "edit";
  viewer: ViewerContext;
  initial?: UserFormInitial;
}

const LIST_URL = "/admin/users";

/** Where each field error is shown, in on-page order — used to scroll to the first problem. */
const ERROR_SECTIONS: [UserFieldKey, string][] = [
  ["name", "sec-personal"],
  ["email", "sec-personal"],
  ["phone", "sec-personal"],
  ["isActive", "sec-account"],
  ["password", "sec-account"],
  ["role", "sec-role"],
  ["permissions", "sec-permissions"],
];

/** Which error keys a form change should clear. */
const PATCH_CLEARS: Partial<Record<keyof UserFormState, UserFieldKey[]>> = {
  role: ["role", "permissions", "password"],
  permissions: ["permissions"],
};

function initialState(initial?: UserFormInitial): UserFormState {
  if (!initial) {
    return {
      name: "",
      email: "",
      phone: "",
      profileImage: "",
      role: "user",
      permissions: [],
      isActive: true,
      password: "",
    };
  }
  return {
    name: initial.name,
    email: initial.email,
    phone: initial.phone,
    profileImage: initial.profileImage,
    role: initial.role,
    permissions: initial.permissions,
    isActive: initial.isActive,
    password: "",
  };
}

export default function UserForm({ mode, viewer, initial }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState<UserFormState>(() => initialState(initial));
  const [errors, setErrors] = useState<UserFormErrors>({});
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState("");
  const [shake, setShake] = useState(false);
  const [leaveTo, setLeaveTo] = useState<string | null>(null);

  const formRef = useRef(form);
  formRef.current = form;

  // Mirrors of the server-side escalation rules in user.admin.action.ts
  const isSelf = mode === "edit" && initial?.id === viewer.id;
  const canAssignAdmin = viewer.role === "admin";
  const grantable: Permission[] =
    viewer.role === "admin" ? [...PERMISSION_KEYS] : viewer.permissions;

  const update = useCallback((patch: UserFormPatch) => {
    setForm((f) => {
      const next = { ...f, ...patch };
      // Role decides whether permissions mean anything at all
      if (patch.role && patch.role !== f.role) {
        if (patch.role === "admin" || patch.role === "user") next.permissions = [];
      }
      return next;
    });
    setDirty(true);
    setErrors((prev) => {
      const keys = Object.keys(patch).flatMap(
        (k) => PATCH_CLEARS[k as keyof UserFormState] ?? [k as UserFieldKey],
      );
      if (!keys.some((k) => prev[k])) return prev;
      const next = { ...prev };
      keys.forEach((k) => delete next[k]);
      return next;
    });
  }, []);

  function fail(errs: UserFormErrors, message?: string) {
    setErrors(errs);
    const count = Object.keys(errs).length;
    toast.error(message ?? `Please fix ${count} field${count > 1 ? "s" : ""} before saving`);
    setShake(false);
    requestAnimationFrame(() => setShake(true));
    const first = ERROR_SECTIONS.find(([k]) => errs[k]);
    if (first) document.getElementById(first[1])?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function payloadFrom(f: UserFormState): UserPayload {
    return {
      name: f.name,
      email: f.email,
      phone: f.phone,
      role: f.role,
      permissions: f.permissions,
      isActive: f.isActive,
      ...(mode === "create" && f.role !== "user" ? { password: f.password } : {}),
    };
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;

    const f = formRef.current;
    const payload = payloadFrom(f);

    // Same validator the server runs, so most problems surface without a round trip
    const check = validateUser(payload, {
      mode,
      requirePassword: mode === "create" && f.role !== "user",
    });
    if (!check.ok) return fail(check.errors);

    setSaving(true);
    setProgress(mode === "create" ? "Creating account…" : "Saving changes…");
    try {
      const res =
        mode === "create"
          ? await createUser(payload)
          : await updateUser(initial!.id, payload, initial!.updatedAt);

      if (!res.ok) {
        if (res.fieldErrors && Object.keys(res.fieldErrors).length)
          return fail(res.fieldErrors, res.error);
        toast.error(res.error);
        return;
      }

      setDirty(false);
      const who = f.name.trim() || f.phone.trim();
      toast.success(mode === "create" ? `"${who}" was created` : "Account updated");
      router.push(LIST_URL);
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
      setProgress("");
    }
  }

  const blockNavigation = useCallback((href: string) => setLeaveTo(href), []);
  useUnsavedChangesGuard(dirty && !saving, blockNavigation);

  const cancel = () => (dirty ? setLeaveTo(LIST_URL) : router.push(LIST_URL));

  const leave = () => {
    const href = leaveTo ?? LIST_URL;
    setDirty(false);
    setLeaveTo(null);
    router.push(href);
  };

  return (
    <>
      <form id={USER_FORM_ID} noValidate onSubmit={onSubmit}>
        <fieldset
          disabled={saving}
          className="grid xl:grid-cols-[minmax(0,1fr)_360px] gap-5 sm:gap-6 items-start min-w-0 border-0 p-0 m-0"
        >
          <div className="space-y-5 sm:space-y-6 min-w-0">
            <UserPersonalInfo
              name={form.name}
              email={form.email}
              phone={form.phone}
              profileImage={form.profileImage}
              errors={errors}
              onChange={update}
            />

            <UserAccountInfo
              mode={mode}
              role={form.role}
              isActive={form.isActive}
              password={form.password}
              errors={errors}
              createdAt={initial?.createdAt}
              lastLogin={initial?.lastLogin}
              isPhoneVerified={initial?.isPhoneVerified}
              lockActive={isSelf}
              onChange={update}
            />

            <UserRoleAssignment
              role={form.role}
              errors={errors}
              canAssignAdmin={canAssignAdmin}
              locked={!!isSelf}
              onChange={(role: Role) => update({ role })}
            />

            <UserPermissions
              role={form.role}
              permissions={form.permissions}
              errors={errors}
              grantable={grantable}
              locked={!!isSelf}
              onChange={(permissions) => update({ permissions })}
            />
          </div>

          <aside className="space-y-5 sm:space-y-6 xl:sticky xl:top-24">
            <UserPreview form={form} isPhoneVerified={initial?.isPhoneVerified ?? false} />
            <UserPermissionSummary role={form.role} permissions={form.permissions} />
          </aside>
        </fieldset>
      </form>

      <UserFormActions
        dirty={dirty}
        saving={saving}
        progress={progress}
        shake={shake}
        submitLabel={mode === "create" ? "Create User" : "Save Changes"}
        onCancel={cancel}
      />

      <UserDiscardDialog open={leaveTo !== null} onStay={() => setLeaveTo(null)} onLeave={leave} />
    </>
  );
}
