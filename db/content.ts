/**
 * Content block types and defaults.
 * No mongoose here — safe to import from client and server.
 */

export interface AnnouncementContent {
  isEnabled: boolean;
  left: string;
  right: string;
  link: string;
  bgColor: string;
}

export interface SaleBannerContent {
  isEnabled: boolean;
  badge: string;
  title: string;
  subtitle: string;
  buttonText: string;
  link: string;
  bgFrom: string;
  bgTo: string;
  deadline: string; // ISO date string or ""
}

export interface NewsletterContent {
  isEnabled: boolean;
  title: string;
  description: string;
}

export interface DeliveryExchangeContent {
  paragraph1: string;
  paragraph2: string;
}

export interface StaticPageContent {
  body: string;
}

export interface SizeGuideContent {
  // visibility
  show_chart: boolean;
  show_measure: boolean;
  show_faq: boolean;
  // header
  headerTitle: string;
  headerSubtitle: string;
  // chart note
  chartNote: string;
  // t-shirt rows (6 sizes × 4 cols)
  ts_s_chest: string; ts_s_shoulder: string; ts_s_length: string; ts_s_sleeve: string;
  ts_m_chest: string; ts_m_shoulder: string; ts_m_length: string; ts_m_sleeve: string;
  ts_l_chest: string; ts_l_shoulder: string; ts_l_length: string; ts_l_sleeve: string;
  ts_xl_chest: string; ts_xl_shoulder: string; ts_xl_length: string; ts_xl_sleeve: string;
  ts_xxl_chest: string; ts_xxl_shoulder: string; ts_xxl_length: string; ts_xxl_sleeve: string;
  ts_xxxl_chest: string; ts_xxxl_shoulder: string; ts_xxxl_length: string; ts_xxxl_sleeve: string;
  // polo rows
  po_s_chest: string; po_s_shoulder: string; po_s_length: string; po_s_sleeve: string;
  po_m_chest: string; po_m_shoulder: string; po_m_length: string; po_m_sleeve: string;
  po_l_chest: string; po_l_shoulder: string; po_l_length: string; po_l_sleeve: string;
  po_xl_chest: string; po_xl_shoulder: string; po_xl_length: string; po_xl_sleeve: string;
  po_xxl_chest: string; po_xxl_shoulder: string; po_xxl_length: string; po_xxl_sleeve: string;
  po_xxxl_chest: string; po_xxxl_shoulder: string; po_xxxl_length: string; po_xxxl_sleeve: string;
  // shirt rows
  sh_s_chest: string; sh_s_shoulder: string; sh_s_length: string; sh_s_sleeve: string;
  sh_m_chest: string; sh_m_shoulder: string; sh_m_length: string; sh_m_sleeve: string;
  sh_l_chest: string; sh_l_shoulder: string; sh_l_length: string; sh_l_sleeve: string;
  sh_xl_chest: string; sh_xl_shoulder: string; sh_xl_length: string; sh_xl_sleeve: string;
  sh_xxl_chest: string; sh_xxl_shoulder: string; sh_xxl_length: string; sh_xxl_sleeve: string;
  sh_xxxl_chest: string; sh_xxxl_shoulder: string; sh_xxxl_length: string; sh_xxxl_sleeve: string;
  // how to measure (4 steps)
  measure_title: string;
  measure_subtitle: string;
  step1_title: string; step1_body: string;
  step2_title: string; step2_body: string;
  step3_title: string; step3_body: string;
  step4_title: string; step4_body: string;
  // FAQ (4 items)
  faq_title: string;
  faq1_q: string; faq1_a: string;
  faq2_q: string; faq2_a: string;
  faq3_q: string; faq3_a: string;
  faq4_q: string; faq4_a: string;
}

export interface AboutContent {
  // Section visibility toggles
  show_stats: boolean;
  show_story: boolean;
  show_milestones: boolean;
  show_missionQuote: boolean;
  show_process: boolean;
  show_values: boolean;
  show_why: boolean;
  show_testimonials: boolean;
  show_founder: boolean;
  show_faq: boolean;
  show_community: boolean;
  show_closing: boolean;
  // Hero
  heroTagline: string;
  heroSubtitle: string;
  // Stats
  stat1Value: string;
  stat1Label: string;
  stat2Value: string;
  stat2Label: string;
  stat3Value: string;
  stat3Label: string;
  // Story
  storyTitle: string;
  storyBody: string;
  // Mission quote
  missionQuote: string;
  missionAuthor: string;
  // Process
  processTitle: string;
  process1Icon: string;
  process1Title: string;
  process1Body: string;
  process2Icon: string;
  process2Title: string;
  process2Body: string;
  process3Icon: string;
  process3Title: string;
  process3Body: string;
  process4Icon: string;
  process4Title: string;
  process4Body: string;
  // Values
  value1Icon: string;
  value1Title: string;
  value1Body: string;
  value2Icon: string;
  value2Title: string;
  value2Body: string;
  value3Icon: string;
  value3Title: string;
  value3Body: string;
  // Why choose us
  whyTitle: string;
  why1Icon: string;
  why1Title: string;
  why1Body: string;
  why2Icon: string;
  why2Title: string;
  why2Body: string;
  why3Icon: string;
  why3Title: string;
  why3Body: string;
  why4Icon: string;
  why4Title: string;
  why4Body: string;
  // Founder note
  founderTitle: string;
  founderName: string;
  founderRole: string;
  founderNote: string;
  // Milestones
  milestonesTitle: string;
  milestone1Year: string;
  milestone1Title: string;
  milestone1Body: string;
  milestone2Year: string;
  milestone2Title: string;
  milestone2Body: string;
  milestone3Year: string;
  milestone3Title: string;
  milestone3Body: string;
  milestone4Year: string;
  milestone4Title: string;
  milestone4Body: string;
  // Testimonials
  testimonialsTitle: string;
  review1Name: string;
  review1Location: string;
  review1Stars: string;
  review1Body: string;
  review2Name: string;
  review2Location: string;
  review2Stars: string;
  review2Body: string;
  review3Name: string;
  review3Location: string;
  review3Stars: string;
  review3Body: string;
  // Community / social
  communityTitle: string;
  communityBody: string;
  communityFbLink: string;
  communityIgLink: string;
  // Mini FAQ
  faqTitle: string;
  faq1Q: string;
  faq1A: string;
  faq2Q: string;
  faq2A: string;
  faq3Q: string;
  faq3A: string;
  faq4Q: string;
  faq4A: string;
  // Closing
  closingTitle: string;
  closingBody: string;
}

export const CONTENT_DEFAULTS = {
  announcement: {
    isEnabled: true,
    left: "সারা বাংলাদেশে ফ্রি ডেলিভারি – ৳১৫০০ এর উপরে অর্ডারে",
    right: "কোড NZ10 দিয়ে প্রথম অর্ডারে ১০% ছাড়",
    link: "",
    bgColor: "#000000",
  } as AnnouncementContent,

  "sale-banner": {
    isEnabled: true,
    badge: "লিমিটেড অফার",
    title: "সব টি-শার্টে ৩৫% পর্যন্ত ছাড়",
    subtitle: "অফার শেষ হওয়ার আগেই আপনার পছন্দের কালার ও সাইজ বেছে নিন।",
    buttonText: "অফার দেখুন",
    link: "/shop?onSale=1",
    bgFrom: "#5a1730",
    bgTo: "#9b2c4a",
    deadline: "",
  } as SaleBannerContent,

  newsletter: {
    isEnabled: true,
    title: "নতুন কালেকশনের খবর আগে পান",
    description: "ইমেইল দিন, প্রথম অর্ডারে ১০% ছাড়ের কোড পাবেন।",
  } as NewsletterContent,

  "delivery-exchange": {
    paragraph1:
      "ঢাকার ভেতরে ৳৬০ (১–২ কার্যদিবস), ঢাকার বাইরে ৳১২০ (২–৪ কার্যদিবস)। ৳১,৫০০ বা তার বেশি অর্ডারে ডেলিভারি ফ্রি।",
    paragraph2:
      "সাইজ না মিললে পণ্য হাতে পাওয়ার ৭ দিনের মধ্যে ফ্রি এক্সচেঞ্জ। পণ্য অব্যবহৃত ও ট্যাগসহ থাকতে হবে।",
  } as DeliveryExchangeContent,

  about: {
    // Section visibility
    show_stats: true,
    show_story: true,
    show_milestones: true,
    show_missionQuote: true,
    show_process: true,
    show_values: true,
    show_why: true,
    show_testimonials: true,
    show_founder: true,
    show_faq: true,
    show_community: true,
    show_closing: true,
    // Hero
    heroTagline: "স্টাইল যেন হয় তোমার নিজের পরিচয়",
    heroSubtitle: "Neeshanz — বাংলাদেশের তরুণ প্রজন্মের জন্য তৈরি একটি ফ্যাশন ব্র্যান্ড, যেখানে প্রতিটি পোশাক বলে দেয় তুমি কে।",
    // Stats
    stat1Value: "১০,০০০+",
    stat1Label: "সন্তুষ্ট কাস্টমার",
    stat2Value: "৫০০+",
    stat2Label: "ডিজাইন কালেকশন",
    stat3Value: "৬৪টি",
    stat3Label: "জেলায় ডেলিভারি",
    // Story
    storyTitle: "আমাদের গল্প",
    storyBody: "২০২৩ সালে ঢাকার একটি ছোট্ট স্টুডিওতে Neeshanz-এর যাত্রা শুরু হয়। আমাদের লক্ষ্য ছিল একটাই — এমন পোশাক তৈরি করা যা বাংলাদেশের তরুণ-তরুণীদের আত্মপ্রকাশের মাধ্যম হয়ে উঠবে।\n\nসেই স্বপ্ন থেকেই আজ আমরা হাজার হাজার কাস্টমারের বিশ্বাস অর্জন করেছি। প্রতিটি পণ্য যত্ন ও ভালোবাসা দিয়ে তৈরি করা হয়, যেন তুমি সেরাটাই পাও।\n\nআমরা বিশ্বাস করি ফ্যাশন শুধু পোশাকের বিষয় নয় — এটি আত্মপ্রকাশের ভাষা। তাই আমরা এমন পোশাক তৈরি করি যা তোমার ব্যক্তিত্বকে ফুটিয়ে তোলে।",
    // Mission quote
    missionQuote: "আমাদের মিশন সহজ — প্রতিটি বাংলাদেশি তরুণকে এমন পোশাক দেওয়া যা তাকে আত্মবিশ্বাসী করে তোলে এবং তার নিজস্বতাকে উদযাপন করে।",
    missionAuthor: "Neeshanz Team",
    // Process
    processTitle: "আমরা কীভাবে কাজ করি",
    process1Icon: "✏",
    process1Title: "ডিজাইন",
    process1Body: "আমাদের ডিজাইনাররা বাংলাদেশের সংস্কৃতি ও আন্তর্জাতিক ট্রেন্ডকে মিলিয়ে অনন্য ডিজাইন তৈরি করেন।",
    process2Icon: "🧵",
    process2Title: "উৎপাদন",
    process2Body: "প্রিমিয়াম মানের কাপড় বেছে নিয়ে দক্ষ কারিগরদের হাতে প্রতিটি পোশাক তৈরি হয়।",
    process3Icon: "✔",
    process3Title: "মান নিয়ন্ত্রণ",
    process3Body: "প্রতিটি পণ্য পাঠানোর আগে কঠোর মান যাচাই প্রক্রিয়ার মধ্যে দিয়ে যায়।",
    process4Icon: "🚚",
    process4Title: "ডেলিভারি",
    process4Body: "সারা বাংলাদেশে দ্রুত ও নিরাপদ ডেলিভারি নিশ্চিত করা হয়।",
    // Values
    value1Icon: "✦",
    value1Title: "মানসম্পন্ন পোশাক",
    value1Body: "আমরা শুধু ট্রেন্ড অনুসরণ করি না — আমরা মান নিয়ে আপোষ করি না। প্রতিটি পোশাক উচ্চমানের কাপড় দিয়ে তৈরি।",
    value2Icon: "❤",
    value2Title: "কাস্টমার ফার্স্ট",
    value2Body: "আমাদের প্রতিটি সিদ্ধান্তের কেন্দ্রে থাকে তুমি। ৭ দিনের ফ্রি এক্সচেঞ্জ ও দ্রুত ডেলিভারি আমাদের প্রতিশ্রুতি।",
    value3Icon: "◈",
    value3Title: "বাংলাদেশি পরিচয়",
    value3Body: "আমরা গর্বিত যে আমাদের পোশাক বাংলাদেশে ডিজাইন ও তৈরি। দেশীয় শিল্পকে এগিয়ে নেওয়াই আমাদের অঙ্গীকার।",
    // Why choose us
    whyTitle: "কেন Neeshanz বেছে নেবেন?",
    why1Icon: "💎",
    why1Title: "প্রিমিয়াম কোয়ালিটি",
    why1Body: "সেরা মানের কাপড় ও উপকরণ ব্যবহার করে প্রতিটি পণ্য তৈরি।",
    why2Icon: "🔄",
    why2Title: "৭ দিনের ফ্রি এক্সচেঞ্জ",
    why2Body: "সাইজ না মিললে ৭ দিনের মধ্যে বিনামূল্যে এক্সচেঞ্জ করুন।",
    why3Icon: "🚀",
    why3Title: "দ্রুত ডেলিভারি",
    why3Body: "ঢাকায় ১–২ দিন, ঢাকার বাইরে ২–৪ দিনে ডেলিভারি।",
    why4Icon: "🛡",
    why4Title: "নিরাপদ পেমেন্ট",
    why4Body: "ক্যাশ অন ডেলিভারি ও অনলাইন পেমেন্ট — সম্পূর্ণ নিরাপদ।",
    // Founder note
    founderTitle: "প্রতিষ্ঠাতার কথা",
    founderName: "Neeshanz",
    founderRole: "Founder & CEO",
    founderNote: "আমি বিশ্বাস করি প্রতিটি মানুষের নিজস্ব একটি স্টাইল আছে — একটি পরিচয় আছে। Neeshanz সেই পরিচয়কে পোশাকের মাধ্যমে প্রকাশ করার সুযোগ দেয়। আমাদের প্রতিটি কাস্টমার আমাদের পরিবারের একজন সদস্য, এবং তাদের সন্তুষ্টিই আমাদের সবচেয়ে বড় পুরস্কার।",
    // Milestones
    milestonesTitle: "আমাদের যাত্রার ইতিহাস",
    milestone1Year: "২০২৩",
    milestone1Title: "যাত্রা শুরু",
    milestone1Body: "ঢাকার একটি ছোট স্টুডিও থেকে Neeshanz-এর পথচলা শুরু হয় মাত্র ১০টি ডিজাইন নিয়ে।",
    milestone2Year: "২০২৩",
    milestone2Title: "প্রথম ১০০০ অর্ডার",
    milestone2Body: "মাত্র ৬ মাসে আমরা ১০০০ অর্ডার সম্পন্ন করি এবং কাস্টমারদের ভালোবাসায় অভিভূত হই।",
    milestone3Year: "২০২৪",
    milestone3Title: "সারা দেশে বিস্তার",
    milestone3Body: "বাংলাদেশের ৬৪টি জেলায় ডেলিভারি নেটওয়ার্ক প্রতিষ্ঠা করা হয়।",
    milestone4Year: "২০২৫",
    milestone4Title: "১০,০০০+ কাস্টমার",
    milestone4Body: "আজ আমাদের ১০,০০০-এরও বেশি সন্তুষ্ট কাস্টমার আছেন — এটি আমাদের সবচেয়ে বড় অর্জন।",
    // Testimonials
    testimonialsTitle: "কাস্টমাররা যা বলেন",
    review1Name: "তানভীর হোসেন",
    review1Location: "ঢাকা",
    review1Stars: "5",
    review1Body: "কোয়ালিটি অসাধারণ! অর্ডার করার পরদিনই পেয়ে গেছি। প্যাকেজিং খুব সুন্দর ছিল এবং টি-শার্টের ফিটিং একদম পারফেক্ট। Neeshanz-কে সবাইকে রিকমেন্ড করব।",
    review2Name: "সুমাইয়া আক্তার",
    review2Location: "চট্টগ্রাম",
    review2Stars: "5",
    review2Body: "সাইজ একটু বড় হয়ে গিয়েছিল, কিন্তু ৭ দিনের মধ্যে ফ্রি এক্সচেঞ্জ করে দিয়েছে। কাস্টমার সার্ভিস অনেক ভালো। আর কাপড়ের মান সত্যিই প্রিমিয়াম।",
    review3Name: "রাফি আহমেদ",
    review3Location: "সিলেট",
    review3Stars: "5",
    review3Body: "আমি ৩ বার অর্ডার করেছি এখন পর্যন্ত। প্রতিবারই সময়মতো ডেলিভারি পেয়েছি। ডিজাইনগুলো অনেক ইউনিক এবং মানের সাথে দামের পার্থক্য খুব কম।",
    // Community
    communityTitle: "আমাদের কমিউনিটিতে যোগ দিন",
    communityBody: "আমাদের সোশ্যাল মিডিয়ায় ফলো করুন এবং নতুন কালেকশন, অফার ও ফ্যাশন টিপসের আপডেট সবার আগে পান। আমাদের কমিউনিটি প্রতিদিন বড় হচ্ছে!",
    communityFbLink: "https://facebook.com/neeshanz",
    communityIgLink: "https://instagram.com/neeshanz",
    // Mini FAQ
    faqTitle: "সাধারণ প্রশ্নোত্তর",
    faq1Q: "ডেলিভারি কতদিনে পাব?",
    faq1A: "ঢাকায় ১–২ কার্যদিবস এবং ঢাকার বাইরে ২–৪ কার্যদিবসের মধ্যে ডেলিভারি দেওয়া হয়।",
    faq2Q: "সাইজ না মিললে কী করব?",
    faq2A: "পণ্য হাতে পাওয়ার ৭ দিনের মধ্যে আমাদের সাথে যোগাযোগ করুন। পণ্য অব্যবহৃত ও ট্যাগসহ থাকলে বিনামূল্যে এক্সচেঞ্জ করা হবে।",
    faq3Q: "পেমেন্ট কীভাবে করব?",
    faq3A: "ক্যাশ অন ডেলিভারি (COD) এবং অনলাইন পেমেন্ট (bKash, Nagad, Card) উভয় পদ্ধতিতে পেমেন্ট করা যাবে।",
    faq4Q: "পণ্যের মান নিয়ে আপনারা কী নিশ্চয়তা দেন?",
    faq4A: "আমরা প্রতিটি পণ্য পাঠানোর আগে কঠোর মান যাচাই করি। পণ্যে কোনো ত্রুটি থাকলে সম্পূর্ণ বিনামূল্যে রিপ্লেসমেন্ট দেওয়া হবে।",
    // Closing
    closingTitle: "তোমার সাথে এই যাত্রায়",
    closingBody: "Neeshanz শুধু একটি ব্র্যান্ড নয় — এটি একটি আন্দোলন। যেখানে তুমি নিজেকে প্রকাশ করতে পারো, নিজের স্টাইলে, নিজের ভাষায়। আমাদের পরিবারের অংশ হতে আজই যোগ দাও।",
  } as AboutContent,

  "size-guide": {
    show_chart: true, show_measure: true, show_faq: true,
    headerTitle: "সাইজ গাইড",
    headerSubtitle: "সঠিক সাইজ বেছে নিতে নিচের চার্টটি দেখুন। মাপগুলো পোশাকের (গার্মেন্ট) মাপ, শরীরের মাপ নয়। সন্দেহ হলে এক সাইজ বড়টি নিন।",
    chartNote: "* সমস্ত মাপ সেন্টিমিটারে এবং ±১–২ সেমি পার্থক্য থাকতে পারে।",
    // t-shirt
    ts_s_chest: "৯৬",   ts_s_shoulder: "৪২", ts_s_length: "৬৮", ts_s_sleeve: "২০",
    ts_m_chest: "১০০",  ts_m_shoulder: "৪৪", ts_m_length: "৭০", ts_m_sleeve: "২১",
    ts_l_chest: "১০৪",  ts_l_shoulder: "৪৬", ts_l_length: "৭২", ts_l_sleeve: "২২",
    ts_xl_chest: "১০৮", ts_xl_shoulder: "৪৮", ts_xl_length: "৭৪", ts_xl_sleeve: "২৩",
    ts_xxl_chest: "১১২", ts_xxl_shoulder: "৫০", ts_xxl_length: "৭৬", ts_xxl_sleeve: "২৪",
    ts_xxxl_chest: "১১৬", ts_xxxl_shoulder: "৫২", ts_xxxl_length: "৭৮", ts_xxxl_sleeve: "২৫",
    // polo
    po_s_chest: "৯৮",   po_s_shoulder: "৪৩", po_s_length: "৭০", po_s_sleeve: "২২",
    po_m_chest: "১০২",  po_m_shoulder: "৪৫", po_m_length: "৭২", po_m_sleeve: "২৩",
    po_l_chest: "১০৬",  po_l_shoulder: "৪৭", po_l_length: "৭৪", po_l_sleeve: "২৪",
    po_xl_chest: "১১০", po_xl_shoulder: "৪৯", po_xl_length: "৭৬", po_xl_sleeve: "২৫",
    po_xxl_chest: "১১৪", po_xxl_shoulder: "৫১", po_xxl_length: "৭৮", po_xxl_sleeve: "২৬",
    po_xxxl_chest: "১১৮", po_xxxl_shoulder: "৫৩", po_xxxl_length: "৮০", po_xxxl_sleeve: "২৭",
    // shirt
    sh_s_chest: "১০০",  sh_s_shoulder: "৪৪", sh_s_length: "৭২", sh_s_sleeve: "৫৮",
    sh_m_chest: "১০৪",  sh_m_shoulder: "৪৬", sh_m_length: "৭৪", sh_m_sleeve: "৬০",
    sh_l_chest: "১০৮",  sh_l_shoulder: "৪৮", sh_l_length: "৭৬", sh_l_sleeve: "৬২",
    sh_xl_chest: "১১২", sh_xl_shoulder: "৫০", sh_xl_length: "৭৮", sh_xl_sleeve: "৬৪",
    sh_xxl_chest: "১১৬", sh_xxl_shoulder: "৫২", sh_xxl_length: "৮০", sh_xxl_sleeve: "৬৬",
    sh_xxxl_chest: "১২০", sh_xxxl_shoulder: "৫৪", sh_xxxl_length: "৮২", sh_xxxl_sleeve: "৬৮",
    // how to measure
    measure_title: "কীভাবে মাপবেন?",
    measure_subtitle: "সঠিক মাপ নিতে নিচের ধাপগুলো অনুসরণ করুন। একটি নরম ফিতা ব্যবহার করুন।",
    step1_title: "বুকের মাপ", step1_body: "বুকের সবচেয়ে চওড়া অংশের চারদিকে ফিতা মাপুন। ফিতা সমতল ও আঁটসাঁট থাকা উচিত।",
    step2_title: "কাঁধের মাপ", step2_body: "এক কাঁধের সীমা থেকে অন্য কাঁধের সীমা পর্যন্ত পিছনদিক থেকে মাপুন।",
    step3_title: "দৈর্ঘ্যের মাপ", step3_body: "কাঁধের উপরের অংশ থেকে পোশাকের নিচের প্রান্ত পর্যন্ত সোজা মাপুন।",
    step4_title: "হাতার মাপ", step4_body: "টি-শার্ট ও পোলোর ক্ষেত্রে হাতার প্রান্ত থেকে কাঁধের সেলাই পর্যন্ত মাপুন।",
    // FAQ
    faq_title: "সাধারণ প্রশ্ন",
    faq1_q: "সাইজ চার্ট কি পোশাকের মাপ নাকি শরীরের মাপ?", faq1_a: "উপরের চার্টটি পোশাকের (গার্মেন্ট) মাপ দেখাচ্ছে। নিজের শরীরের মাপ নিয়ে তার চেয়ে ৪–৬ সেমি বড় সাইজ বেছে নিন স্বাভাবিক ফিটের জন্য।",
    faq2_q: "দুটি সাইজের মাঝামাঝি থাকলে কোনটি নেব?", faq2_a: "স্লিম ফিট পছন্দ করলে ছোট সাইজ, আরামদায়ক ও রেগুলার ফিটের জন্য বড় সাইজটি নিন।",
    faq3_q: "ধোয়ার পর কি সাইজ পরিবর্তন হয়?", faq3_a: "আমাদের পোশাক প্রি-শ্রাংক ফেব্রিকে তৈরি। সঠিক তাপমাত্রায় ধুলে সংকোচন সর্বনিম্ন (প্রায় ১–২%) হয়।",
    faq4_q: "ভুল সাইজ অর্ডার করলে কি রিটার্ন করা যাবে?", faq4_a: "হ্যাঁ, পণ্য পাওয়ার ৭ দিনের মধ্যে অক্ষত অবস্থায় রিটার্ন বা এক্সচেঞ্জ করা যাবে।",
  } as SizeGuideContent,

  terms: {
    body: "শর্তাবলী এখানে লিখুন।",
  } as StaticPageContent,

  "return-policy": {
    body: "রিটার্ন পলিসি এখানে লিখুন।",
  } as StaticPageContent,

  privacy: {
    body: "প্রাইভেসি পলিসি এখানে লিখুন।",
  } as StaticPageContent,
} as const;

export type ContentSlug = keyof typeof CONTENT_DEFAULTS;

export function getContentDefault<S extends ContentSlug>(
  slug: S,
): (typeof CONTENT_DEFAULTS)[S] {
  return CONTENT_DEFAULTS[slug];
}
