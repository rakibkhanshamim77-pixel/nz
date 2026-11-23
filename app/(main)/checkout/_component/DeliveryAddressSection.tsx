export default function DeliveryAddressSection() {
  return (
    <section className="card p-5 sm:p-7">
      <div className="flex items-start gap-3 mb-6">
        <span className="step-no">1</span>
        <div>
          <h2 className="font-display font-bold text-xl leading-tight">
            ডেলিভারি ঠিকানা
          </h2>
          <p className="text-sm text-mute mt-0.5">
            যে ঠিকানায় পণ্য পৌঁছাবে
          </p>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="field block">
          <span className="lbl">পুরো নাম *</span>
          <input
            id="name"
            className="inp"
            defaultValue="Md Shamim"
            autoComplete="name"
          />
        </label>
        <label className="field block">
          <span className="lbl">মোবাইল নম্বর *</span>
          <input
            id="phone"
            className="inp"
            inputMode="tel"
            placeholder="01XXXXXXXXX"
            autoComplete="tel"
          />
        </label>
        <label className="field block sm:col-span-2">
          <span className="lbl">
            ইমেইল <span className="font-medium text-mute">(ঐচ্ছিক)</span>
          </span>
          <input
            id="email"
            type="email"
            className="inp"
            defaultValue="rakibkhanshamim790@gmail.com"
            autoComplete="email"
          />
        </label>
        <label className="field block">
          <span className="lbl">বিভাগ *</span>
          <span className="select-wrap block">
            <select id="division" className="inp">
              <option value="">নির্বাচন করুন</option>
              <option>ঢাকা</option>
              <option>চট্টগ্রাম</option>
              <option>রাজশাহী</option>
              <option>খুলনা</option>
              <option>বরিশাল</option>
              <option>সিলেট</option>
              <option>রংপুর</option>
              <option>ময়মনসিংহ</option>
            </select>
          </span>
        </label>
        <label className="field block">
          <span className="lbl">জেলা / থানা *</span>
          <input
            id="district"
            className="inp"
            placeholder="যেমন: গাজীপুর, টঙ্গী"
          />
        </label>
        <label className="field block sm:col-span-2">
          <span className="lbl">সম্পূর্ণ ঠিকানা *</span>
          <textarea
            id="address"
            rows={3}
            className="inp"
            placeholder="বাড়ি নং, রোড, এলাকা"
            defaultValue={""}
          />
        </label>
        <label className="field block sm:col-span-2">
          <span className="lbl">
            অর্ডার নোট{" "}
            <span className="font-medium text-mute">(ঐচ্ছিক)</span>
          </span>
          <input
            id="note"
            className="inp"
            placeholder="ডেলিভারির আগে কল করুন…"
          />
        </label>
      </div>
      <p
        id="formErr"
        className="hidden mt-4 text-sm text-ink font-medium"
        role="alert"
      />
    </section>
  );
}
