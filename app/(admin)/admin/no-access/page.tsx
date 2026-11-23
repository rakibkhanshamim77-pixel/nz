import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/app/utils/getUser";
import { effectivePermissions, firstAllowedModule, PERMISSIONS } from "@/db/permissions";
import AdminTopbar from "../../_components/AdminTopbar";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "No access – Neeshanz Admin" };

/**
 * Shown when a signed-in staff member opens a module they don't hold.
 * Requires no permission of its own, so it can never redirect-loop.
 */
export default async function NoAccessPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const granted = effectivePermissions(user);
  const fallback = firstAllowedModule(user);

  return (
    <div>
      <AdminTopbar title="No access" userName={user.name} userRole={user.role} />
      <main className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-[1400px]">
        <section className="card p-10 sm:p-14 text-center max-w-xl mx-auto mt-6">
          <div className="w-14 h-14 rounded-2xl bg-[var(--soft)] grid place-items-center mx-auto mb-4">
            <svg
              className="w-6 h-6 text-[var(--mute)]"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <rect x="5" y="11" width="14" height="10" rx="2" />
              <path d="M8 11V8a4 4 0 0 1 8 0v3" />
            </svg>
          </div>
          <h1 className="font-display font-extrabold text-2xl">You don&apos;t have access to this</h1>
          <p className="text-sm text-[var(--mute)] mt-2 leading-relaxed">
            Your account doesn&apos;t include this module. Ask an administrator if you think you should
            have it.
          </p>

          {granted.length > 0 ? (
            <div className="mt-6 text-left">
              <p className="flbl !mb-2 text-center">What you can access</p>
              <ul className="flex flex-wrap gap-2 justify-center">
                {granted.map((key) => (
                  <li key={key} className="badge ghost">
                    {PERMISSIONS[key].label}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-[var(--mute)] mt-5">
              No modules are assigned to your account yet.
            </p>
          )}

          <div className="flex flex-wrap gap-3 justify-center mt-7">
            {fallback && (
              <Link href={fallback} className="btn-solid">
                Go to my dashboard
              </Link>
            )}
            <Link href="/" className="btn-ghost">
              View store
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
