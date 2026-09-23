/**
 * Echo Media Production — brand content.
 *
 * Single source of truth for every word on the public site. Content used to
 * live in a `site_content` table edited from the admin dashboard; it is now
 * fixed in code so the brand voice cannot drift. Edit here to change the site.
 *
 * Contact details are the exception — they change often and belong to whoever
 * runs the business, so they live in content/contact.json.
 */

import contactJson from "@/content/contact.json";

export type Bi = { en: string; ar: string };

/**
 * Bilingual list. The explicit annotation matters: without it `as const` gives
 * `en` and `ar` different literal tuple types and `pick()` can't unify them.
 */
export type BiList = { en: readonly string[]; ar: readonly string[] };

export type Phone = {
  number: string;
  label: Bi;
  /** Show a WhatsApp link alongside the tel: link. */
  whatsapp: boolean;
};

export type SocialLink = { name: string; url: string };

export type Contact = {
  email: string;
  phones: Phone[];
  social: SocialLink[];
  /**
   * Optional. Leave the strings empty and the site shows no address at all —
   * the footer block and the JSON-LD address are both dropped. Fill them in
   * only if you want to publish a physical location.
   */
  location?: Bi;
  address?: Bi;
  mapUrl?: string;
};

/**
 * Contact details, loaded from content/contact.json.
 *
 * The annotation is what makes the JSON safe to edit: if a required field is
 * removed or mistyped, the build fails with a clear error instead of the site
 * silently rendering "undefined".
 */
export const contact: Contact = contactJson;

export const brand = {
  name: "Echo Media Production",
  shortName: "echo",
  motto: "Leave an Echo.",
  contact,
} as const;

/** Strip spacing so a displayed number still makes a valid tel:/wa.me link. */
export function telHref(number: string) {
  return `tel:${number.replace(/[^\d+]/g, "")}`;
}

export function whatsappHref(number: string) {
  return `https://wa.me/${number.replace(/\D/g, "")}`;
}

/* ── Hero ─────────────────────────────────────────────────────────────── */

export const hero = {
  eyebrow: {
    en: "Creative Production House",
    ar: "بيت إنتاج إبداعي",
  } as Bi,
  /** Rendered as stacked display lines. */
  headline: {
    en: ["We don't", "create videos."],
    ar: ["إحنا مبنعملش", "فيديوهات."],
  } as BiList,
  body: {
    en: "We build visual experiences that move people and grow brands.",
    ar: "نصنع تجارب بصرية تحرّك الناس وتُنمّي العلامات التجارية.",
  } as Bi,
  ctaPrimary: { en: "See Our Work", ar: "شاهد أعمالنا" } as Bi,
  ctaSecondary: { en: "Art House Studio", ar: "استوديو آرت هاوس" } as Bi,
} as const;

/* ── Manifesto ────────────────────────────────────────────────────────── */

export const manifesto = {
  label: { en: "Manifesto", ar: "البيان" } as Bi,
  lines: {
    en: [
      "We don't believe in ads that are forgotten.",
      "Nor in videos produced just to be posted.",
      "We believe every film must leave a mark.",
      "Every frame must carry meaning.",
      "Every camera move must serve the idea.",
      "And every project is a chance to make something that outlives its runtime.",
      "We are not here to keep up with the market —",
      "we are here to leave our mark on it.",
    ],
    ar: [
      "نحن لا نؤمن بالإعلانات التي تُنسى.",
      "ولا بالفيديوهات التي تُنتج لمجرد النشر.",
      "نؤمن أن كل فيلم يجب أن يترك أثرًا.",
      "كل إطار يجب أن يحمل معنى.",
      "وكل حركة كاميرا يجب أن تخدم الفكرة.",
      "وكل مشروع هو فرصة لصناعة شيء يعيش أطول من مدته.",
      "لسنا هنا لنواكب السوق…",
      "بل لنترك بصمتنا فيه.",
    ],
  } as BiList,
} as const;

/* ── DNA: why we exist, vision, mission ───────────────────────────────── */

export const dna = {
  label: { en: "Our DNA", ar: "حمضنا النووي" } as Bi,
  whyWeExist: {
    title: { en: "Why We Exist", ar: "لماذا وُجدنا" } as Bi,
    body: {
      en: "Echo Media Production exists to redefine visual storytelling in the Arab world by creating films that don't just look beautiful — but leave a lasting impact.",
      ar: "وُجدت Echo Media Production لإعادة تعريف السرد البصري في العالم العربي، من خلال إنتاج أعمال لا تكتفي بالإبهار البصري، بل تترك أثرًا حقيقيًا في الناس.",
    } as Bi,
  },
  vision: {
    title: { en: "Vision", ar: "الرؤية" } as Bi,
    body: {
      en: "To become the Middle East's most respected creative production house, known for originality, discipline, and cinematic excellence.",
      ar: "أن نصبح بيت الإنتاج الإبداعي الأكثر احترامًا في الشرق الأوسط، معروفين بالأصالة والانضباط والتميّز السينمائي.",
    } as Bi,
    note: {
      en: "Not the biggest. The most respected.",
      ar: "ليس الأكبر… بل الأكثر احترامًا.",
    } as Bi,
  },
  mission: {
    title: { en: "Mission", ar: "الرسالة" } as Bi,
    body: {
      en: "We help meaningful brands tell stories that people remember — through strategy, cinematic production, and world-class execution.",
      ar: "نساعد العلامات التجارية ذات القيمة على رواية قصص يتذكرها الناس، عبر الاستراتيجية والإنتاج السينمائي والتنفيذ بمعايير عالمية.",
    } as Bi,
  },
} as const;

/* ── Positioning ──────────────────────────────────────────────────────── */

export const positioning = {
  label: { en: "Positioning", ar: "التموضع" } as Bi,
  negation: {
    en: "Echo Media Production is not a video production company.",
    ar: "Echo Media Production ليست شركة إنتاج فيديو.",
  } as Bi,
  affirmation: {
    en: "It is a creative production house that develops cinematic visual experiences for brands that have something worth saying.",
    ar: "إنها بيت إنتاج إبداعي يطوّر تجارب بصرية سينمائية لعلامات تجارية لديها ما يستحق أن يُقال.",
  } as Bi,
  differentiator: {
    title: {
      en: "We think before we shoot.",
      ar: "نحن نفكر قبل أن نصوّر.",
    } as Bi,
    body: {
      en: "We don't want to be known for shooting beautifully. We want to be known for thinking first. Before a camera comes out, there's a brand session, audience analysis, a message, and an idea. You pay for the thinking — not for hours on set.",
      ar: "لا نريد أن نُعرف بأننا نصوّر بشكل جميل، بل بأننا نفكر قبل أن نصوّر. قبل أن تخرج الكاميرا، هناك جلسة فهم للبراند، وتحليل للجمهور، واستخراج للرسالة، وبناء للفكرة. أنت تدفع مقابل التفكير والإبداع، لا مقابل عدد ساعات التصوير.",
    } as Bi,
    steps: {
      en: ["Brand discovery session", "Audience analysis", "Message extraction", "Idea development", "Only then — we shoot"],
      ar: ["جلسة فهم للبراند", "تحليل الجمهور", "استخراج الرسالة", "بناء الفكرة", "وبعدها فقط… نصوّر"],
    } as BiList,
  },
} as const;

/* ── Core values ──────────────────────────────────────────────────────── */

export const values = {
  label: { en: "Core Values", ar: "قيمنا" } as Bi,
  heading: {
    en: "Six principles behind every frame",
    ar: "ستة مبادئ وراء كل إطار",
  } as Bi,
  items: [
    {
      title: { en: "Integrity", ar: "النزاهة" } as Bi,
      body: { en: "We turn down any project that contradicts our principles.", ar: "لا نقبل مشروعًا يخالف مبادئنا." } as Bi,
    },
    {
      title: { en: "Originality", ar: "الأصالة" } as Bi,
      body: { en: "No imitation. Every project must carry the Echo signature.", ar: "ممنوع التقليد. كل مشروع لازم يكون له بصمة Echo." } as Bi,
    },
    {
      title: { en: "Discipline", ar: "الانضباط" } as Bi,
      body: { en: "Committed to deadlines, to execution, and to quality.", ar: "التزام بالمواعيد، والتنفيذ، والجودة." } as Bi,
    },
    {
      title: { en: "Craftsmanship", ar: "الحِرفية" } as Bi,
      body: { en: "Attention to detail — image, sound, lighting, colour. Everything.", ar: "الاهتمام بالتفاصيل: الصورة، الصوت، الإضاءة، اللون. كل حاجة." } as Bi,
    },
    {
      title: { en: "Impact", ar: "الأثر" } as Bi,
      body: { en: "We don't measure a film by views. We measure it by the mark it leaves.", ar: "لا نقيس نجاح الفيلم بعدد المشاهدات، بل بالأثر الذي يتركه." } as Bi,
    },
    {
      title: { en: "Growth", ar: "التطور" } as Bi,
      body: { en: "Every project has to teach us something new.", ar: "كل مشروع لازم يعلّمنا حاجة." } as Bi,
    },
  ],
} as const;

/* ── Brand architecture ───────────────────────────────────────────────── */

export const architecture = {
  label: { en: "Brand Architecture", ar: "هيكل العلامة" } as Bi,
  heading: { en: "Two houses. One standard.", ar: "بيتان. معيار واحد." } as Bi,
  divisions: [
    {
      name: { en: "Echo Media Production", ar: "Echo Media Production" } as Bi,
      tagline: { en: "The production house", ar: "بيت الإنتاج" } as Bi,
      href: "/",
      items: {
        en: ["Commercial Production", "Brand Films", "Social Media Production", "Podcasts", "Creative Strategy"],
        ar: ["الإنتاج التجاري", "أفلام العلامات التجارية", "إنتاج السوشيال ميديا", "البودكاست", "الاستراتيجية الإبداعية"],
      } as BiList,
    },
    {
      name: { en: "Art House Studio", ar: "استوديو آرت هاوس" } as Bi,
      tagline: { en: "The space", ar: "المساحة" } as Bi,
      href: "/art-house-studio",
      items: {
        en: ["Studio Rental", "Podcast Studio", "Photography", "Video Sets", "Workshops"],
        ar: ["تأجير الاستوديو", "استوديو البودكاست", "التصوير الفوتوغرافي", "بلاتوهات التصوير", "ورش العمل"],
      } as BiList,
    },
  ],
} as const;

/* ── Services (delivered as packages) ─────────────────────────────────── */

export const services = {
  label: { en: "Services", ar: "الخدمات" } as Bi,
  heading: { en: "Every service is a package", ar: "كل خدمة هي باقة متكاملة" } as Bi,
  body: {
    en: "Not a line item on an invoice — a complete process, from the first question to final delivery.",
    ar: "ليست بندًا في فاتورة، بل عملية كاملة من أول سؤال حتى التسليم النهائي.",
  } as Bi,
  items: [
    {
      name: { en: "Brand Film", ar: "فيلم العلامة التجارية" } as Bi,
      body: {
        en: "The full arc of a story about who you are — researched, written, shot, and graded.",
        ar: "القوس الكامل لقصة عن هويتك — بحث وكتابة وتصوير ومعالجة لونية.",
      } as Bi,
      steps: {
        en: ["Research", "Concept", "Script", "Production", "Editing", "Colour", "Delivery"],
        ar: ["البحث", "الفكرة", "السيناريو", "الإنتاج", "المونتاج", "التصحيح اللوني", "التسليم"],
      } as BiList,
    },
    {
      name: { en: "Commercial", ar: "الإعلان التجاري" } as Bi,
      body: {
        en: "High-impact commercial work built to sell a result, not to fill a slot.",
        ar: "عمل تجاري عالي التأثير مبني على بيع نتيجة، لا على ملء مساحة إعلانية.",
      } as Bi,
      steps: {
        en: ["Creative Direction", "Production", "Motion Graphics", "Sound Design"],
        ar: ["الإدارة الإبداعية", "الإنتاج", "الموشن جرافيك", "تصميم الصوت"],
      } as BiList,
    },
    {
      name: { en: "Podcast", ar: "البودكاست" } as Bi,
      body: {
        en: "A full show pipeline in our acoustically treated studio — from set to shorts.",
        ar: "منظومة إنتاج كاملة في استوديو معالَج صوتيًا — من البلاتوه حتى المقاطع القصيرة.",
      } as Bi,
      steps: {
        en: ["Studio", "3 Cameras", "Lighting", "Audio", "Editing", "Thumbnail", "Shorts"],
        ar: ["الاستوديو", "٣ كاميرات", "الإضاءة", "الصوت", "المونتاج", "الصورة المصغّرة", "المقاطع القصيرة"],
      } as BiList,
    },
  ],
} as const;

/* ── The Echo style ───────────────────────────────────────────────────── */

export const style = {
  label: { en: "The Echo Style", ar: "أسلوب Echo" } as Bi,
  heading: {
    en: "Nice shots and slow motion are not a film.",
    ar: "لقطات حلوة وسلو موشن… دي مش فيلم.",
  } as Bi,
  body: {
    en: "Anything that leaves this house carries all six of these. Never fewer.",
    ar: "أي عمل يخرج من هنا يحمل هذه الستة كاملة. ولا واحدة أقل.",
  } as Bi,
  steps: {
    en: ["Story", "Emotion", "Cinematic Lighting", "Movement", "Sound Design", "Strong Ending"],
    ar: ["القصة", "المشاعر", "إضاءة سينمائية", "الحركة", "تصميم الصوت", "نهاية قوية"],
  } as BiList,
} as const;

/* ── Process ──────────────────────────────────────────────────────────── */

export const workflow = {
  label: { en: "Process", ar: "منهج العمل" } as Bi,
  heading: { en: "Twelve steps. Every single project.", ar: "اثنتا عشرة خطوة. في كل مشروع." } as Bi,
  steps: {
    en: ["Inquiry", "Meeting", "Proposal", "Contract", "Research", "Creative", "Pre-Production", "Production", "Post-Production", "Review", "Delivery", "Follow-Up"],
    ar: ["الاستفسار", "الاجتماع", "العرض", "التعاقد", "البحث", "الإبداع", "التحضير", "الإنتاج", "ما بعد الإنتاج", "المراجعة", "التسليم", "المتابعة"],
  } as BiList,
} as const;

/* ── Who we work with ─────────────────────────────────────────────────── */

export const clients = {
  label: { en: "Who We Work With", ar: "مع من نعمل" } as Bi,
  heading: {
    en: "Brands that improve people's lives.",
    ar: "علامات تجارية تُحسّن حياة الناس.",
  } as Bi,
  body: {
    en: "We don't work with everyone. We work with brands that have something worth saying.",
    ar: "لا نعمل مع أي أحد. نعمل مع علامات لديها ما يستحق أن يُقال.",
  } as Bi,
  sectors: {
    en: ["Corporates", "Premium Restaurants", "Fashion", "Real Estate", "Technology", "Education", "Healthcare"],
    ar: ["الشركات", "المطاعم الراقية", "الأزياء", "العقارات", "التكنولوجيا", "التعليم", "الرعاية الصحية"],
  } as BiList,
} as const;

/* ── Goal ─────────────────────────────────────────────────────────────── */

export const goal = {
  label: { en: "2030", ar: "٢٠٣٠" } as Bi,
  question: { en: "Who makes cinematic ads?", ar: "مين يعمل إعلان سينمائي؟" } as Bi,
  answer: { en: "Echo.", ar: "Echo." } as Bi,
} as const;

/* ── Closing CTA ──────────────────────────────────────────────────────── */

export const cta = {
  heading: {
    en: "Do you have something worth saying?",
    ar: "هل لديك ما يستحق أن يُقال؟",
  } as Bi,
  body: {
    en: "Start with a conversation. We'll tell you honestly whether we're the right house for it.",
    ar: "ابدأ بمحادثة. سنخبرك بصراحة ما إذا كنا البيت المناسب لها.",
  } as Bi,
  button: { en: "Start a Project", ar: "ابدأ مشروعًا" } as Bi,
  href: "/contact",
} as const;

/* ── Contact page ─────────────────────────────────────────────────────── */

export const contactPage = {
  eyebrow: { en: "Contact", ar: "تواصل" } as Bi,
  heading: {
    en: "Tell us what you want to make.",
    ar: "احكِ لنا عمّا تريد صناعته.",
  } as Bi,
  body: {
    en: "Send us a message and we'll get back to you. Tell us about the brand, the project, and what you need.",
    ar: "أرسل لنا رسالة وسنعود إليك. أخبرنا عن العلامة والمشروع وما تحتاجه.",
  } as Bi,
  fields: {
    name: { en: "Your name", ar: "الاسم" } as Bi,
    email: { en: "Email", ar: "البريد الإلكتروني" } as Bi,
    phone: { en: "Phone (optional)", ar: "الهاتف (اختياري)" } as Bi,
    message: { en: "Your message", ar: "رسالتك" } as Bi,
  },
  submit: { en: "Send message", ar: "إرسال الرسالة" } as Bi,
  sending: { en: "Sending…", ar: "جارٍ الإرسال…" } as Bi,
  success: {
    en: "Thanks — your message is on its way. We'll be in touch.",
    ar: "شكرًا — وصلتنا رسالتك وسنتواصل معك قريبًا.",
  } as Bi,
  error: {
    en: "Something went wrong. Please try again.",
    ar: "حدث خطأ ما. حاول مرة أخرى.",
  } as Bi,
} as const;

/* ── Art House Studio ─────────────────────────────────────────────────── */

export const artHouse = {
  eyebrow: { en: "The Space", ar: "المساحة" } as Bi,
  title: { en: "Art House Studio", ar: "استوديو آرت هاوس" } as Bi,
  subtitle: {
    en: "Where the thinking becomes a frame.",
    ar: "حيث يتحوّل التفكير إلى إطار.",
  } as Bi,
  body: {
    en: "A fully equipped production space built for the standard Echo works to — cinema cameras, controlled lighting, treated sound, and an edit suite in the same building. Available to rent, or as the room your Echo project is made in.",
    ar: "مساحة إنتاج مجهّزة بالكامل مبنية على المعيار الذي تعمل به Echo — كاميرات سينمائية، وإضاءة محكومة، وصوت معالَج، وجناح مونتاج في المبنى نفسه. متاحة للإيجار، أو لتكون الغرفة التي يُصنع فيها مشروعك.",
  } as Bi,
  equipment: {
    heading: { en: "Equipment", ar: "المعدات" } as Bi,
    body: {
      en: "Tools chosen for control, not for a spec sheet.",
      ar: "أدوات مختارة من أجل التحكم، لا من أجل ورقة مواصفات.",
    } as Bi,
    items: [
      {
        name: { en: "Sony FX6 & Canon R5", ar: "Sony FX6 و Canon R5" } as Bi,
        body: { en: "Cinema-grade sensors for full-frame 4K capture.", ar: "حسّاسات بجودة سينمائية للتصوير بدقة 4K فل-فريم." } as Bi,
      },
      {
        name: { en: "Aputure Lighting", ar: "إضاءة Aputure" } as Bi,
        body: { en: "Professional LED with full colour control.", ar: "إضاءة LED احترافية مع تحكم كامل بالألوان." } as Bi,
      },
      {
        name: { en: "Rode Microphones", ar: "ميكروفونات Rode" } as Bi,
        body: { en: "Clean capture for dialogue, interview, and voice-over.", ar: "تسجيل نقي للحوار والمقابلات والتعليق الصوتي." } as Bi,
      },
      {
        name: { en: "DaVinci Resolve Suite", ar: "جناح DaVinci Resolve" } as Bi,
        body: { en: "Grading and finishing to broadcast standard.", ar: "تصحيح لوني وإنهاء بمعايير البث." } as Bi,
      },
      {
        name: { en: "Gimbal & Stabilisation", ar: "مثبتات وجيمبال" } as Bi,
        body: { en: "Movement that serves the shot, not the showreel.", ar: "حركة تخدم اللقطة، لا الشوريل." } as Bi,
      },
      {
        name: { en: "Treated Sound Room", ar: "غرفة صوت معالَجة" } as Bi,
        body: { en: "Acoustically controlled for podcast and VO.", ar: "معالَجة صوتيًا للبودكاست والتعليق الصوتي." } as Bi,
      },
    ],
  },
  offer: {
    heading: { en: "What the studio offers", ar: "ماذا يقدّم الاستوديو" } as Bi,
    items: [
      {
        name: { en: "Studio Rental", ar: "تأجير الاستوديو" } as Bi,
        body: { en: "Book the space by the day or half-day, crewed or bare.", ar: "احجز المساحة باليوم أو نصف اليوم، بطاقم أو بدونه." } as Bi,
      },
      {
        name: { en: "Podcast Studio", ar: "استوديو البودكاست" } as Bi,
        body: { en: "Three-camera setup, treated audio, ready to roll.", ar: "إعداد بثلاث كاميرات وصوت معالَج، جاهز للتسجيل." } as Bi,
      },
      {
        name: { en: "Photography", ar: "التصوير الفوتوغرافي" } as Bi,
        body: { en: "Product, portrait, and campaign work on controlled sets.", ar: "تصوير منتجات وبورتريه وحملات على بلاتوهات محكومة." } as Bi,
      },
      {
        name: { en: "Video Sets", ar: "بلاتوهات التصوير" } as Bi,
        body: { en: "Configurable backdrops and builds for commercial shoots.", ar: "خلفيات وتجهيزات قابلة للتعديل للتصوير التجاري." } as Bi,
      },
      {
        name: { en: "Workshops", ar: "ورش العمل" } as Bi,
        body: { en: "Hands-on sessions in the room where the work happens.", ar: "جلسات عملية في الغرفة التي يحدث فيها العمل." } as Bi,
      },
    ],
  },
} as const;

/* ── Founder ──────────────────────────────────────────────────────────── */

export const founder = {
  eyebrow: { en: "Founder", ar: "المؤسس" } as Bi,
  name: { en: "Mahmoud Mekky", ar: "محمود مكي" } as Bi,
  role: {
    en: "Founder & Creative Director",
    ar: "المؤسس والمدير الإبداعي",
  } as Bi,
  /** Set to a public image path or URL to replace the monogram placeholder. */
  photo: "",
  bio: {
    en: "Mahmoud Mekky founded Echo on a single conviction: that most brand video fails not in the camera, but in the thinking that came before it. Over a decade of commercial filmmaking, podcast production, and creative direction across the region, he has built the house around that idea — research first, camera last.",
    ar: "أسّس محمود مكي Echo على قناعة واحدة: أن معظم فيديوهات العلامات التجارية لا تفشل في الكاميرا، بل في التفكير الذي سبقها. وعبر أكثر من عقد في صناعة الأفلام التجارية وإنتاج البودكاست والإدارة الإبداعية في المنطقة، بنى البيت حول هذه الفكرة — البحث أولًا، والكاميرا أخيرًا.",
  } as Bi,
  quote: {
    en: "We are not here to keep up with the market. We are here to leave our mark on it.",
    ar: "لسنا هنا لنواكب السوق… بل لنترك بصمتنا فيه.",
  } as Bi,
  focus: {
    heading: { en: "Where he works", ar: "أين يعمل" } as Bi,
    items: [
      {
        title: { en: "Creative Direction", ar: "الإدارة الإبداعية" } as Bi,
        body: { en: "Shaping the idea and the visual language before a frame exists.", ar: "تشكيل الفكرة واللغة البصرية قبل وجود أي إطار." } as Bi,
      },
      {
        title: { en: "Commercial Filmmaking", ar: "صناعة الأفلام التجارية" } as Bi,
        body: { en: "Directing brand films and commercials end to end.", ar: "إخراج أفلام العلامات والإعلانات من البداية للنهاية." } as Bi,
      },
      {
        title: { en: "Podcast Production", ar: "إنتاج البودكاست" } as Bi,
        body: { en: "Building shows from format through distribution.", ar: "بناء البرامج من الشكل حتى التوزيع." } as Bi,
      },
      {
        title: { en: "Brand Strategy", ar: "استراتيجية العلامة" } as Bi,
        body: { en: "Aligning what gets made with what the business needs.", ar: "مواءمة ما يُصنع مع ما يحتاجه العمل." } as Bi,
      },
    ],
  },
} as const;

/* ── Navigation & footer ──────────────────────────────────────────────── */

export const nav = {
  links: [
    { label: { en: "Home", ar: "الرئيسية" } as Bi, href: "/" },
    { label: { en: "Work", ar: "الأعمال" } as Bi, href: "/portfolio" },
    { label: { en: "Studio", ar: "الاستوديو" } as Bi, href: "/art-house-studio" },
    { label: { en: "Founder", ar: "المؤسس" } as Bi, href: "/mahmoud-mekky" },
    { label: { en: "Contact", ar: "التواصل" } as Bi, href: "/contact" },
  ],
} as const;

export const footer = {
  tagline: {
    en: "A creative production house building visual experiences that move people and grow brands.",
    ar: "بيت إنتاج إبداعي يصنع تجارب بصرية تحرّك الناس وتُنمّي العلامات التجارية.",
  } as Bi,
  rights: {
    en: "All rights reserved.",
    ar: "جميع الحقوق محفوظة.",
  } as Bi,
} as const;
