import ForgotPasswordForm from "./_component/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <main className="flex-1 grid place-items-center px-4 py-8 sm:py-14">
      <div className="w-full max-w-[440px]">
        <div className="card p-6 sm:p-9">
          <ForgotPasswordForm />
        </div>
      </div>
    </main>
  );
}
