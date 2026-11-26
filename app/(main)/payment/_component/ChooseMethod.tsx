export default function ChooseMethod() {
  return (
    <section className="card p-5 sm:p-7">
      <div className="flex items-start gap-3 mb-6">
        <span className="step-no">1</span>
        <div>
          <h2 className="font-display font-bold text-xl leading-tight">
            পেমেন্ট মাধ্যম বাছাই করুন
          </h2>
          <p className="text-sm text-mute mt-0.5">
            যেকোনো একটি থেকে Send Money করুন
          </p>
        </div>
      </div>
      <div
        id="methods"
        className="grid grid-cols-1 sm:grid-cols-3 gap-3"
        role="radiogroup"
        aria-label="পেমেন্ট মাধ্যম"
      />
    </section>
  );
}
