import RegisterForm from "./_component/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="flex-1 grid place-items-center px-4 py-8 sm:py-14">
      <div className="w-full max-w-[440px]">
        <div className="card p-6 sm:p-9">
          <RegisterForm />
        </div>
        <p className="text-center text-sm text-mute mt-6 flex items-center justify-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <rect x={5} y={11} width={14} height={10} rx={2} />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          </svg>
          Your information is completely safe
        </p>
      </div>
    </main>
  );
}
