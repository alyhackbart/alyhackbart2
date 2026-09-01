/*
  ALYHACKBART.COM CONTENT FILE

  Edit this file to change website wording, services, prices, packages,
  portfolio details, contact information, policies, FAQs, and media paths.

  After editing, run: node scripts/build-site.mjs
  The generated index.html is the SEO-ready version served in production.
*/
const SITE_CONTENT = {
  site: {
    url: "https://alyhackbart.com",
    name: "Aly Hackbart",
    domainName: "AlyHackbart.com",
    title: "Aly Hackbart | San Diego Video Editing and Social Content",
    description: "San Diego video editing, social content production, restaurant content, event coverage, and intimate celebration films by Aly Hackbart.",
    socialImage: "assets/og-image.webp",
    updated: "2026-09-01",
    googleSiteVerification: "",
    googleAnalyticsId: ""
  },

  business: {
    name: "Aly Hackbart",
    location: "San Diego, California",
    email: "alysonhackbart@gmail.com",
    publicEmail: "",
    serviceArea: "San Diego and nearby communities, with select travel available",
    areaServed: ["San Diego", "San Diego County"]
  },

  hero: {
    eyebrow: "San Diego · Editing · Social Content · Events",
    headline: "Video content that feels polished, current, and easy to share.",
    introduction: "Aly Hackbart creates and edits video for San Diego businesses, restaurants, creators, events, and couples who want strong content without a complicated production process.",
    primaryAction: "Browse packages",
    secondaryAction: "View sample work",
    video: "assets/media/hero-reel.mp4",
    poster: "assets/media/hero-poster.webp",
    fallbackVideo: "reel",
    fallbackPoster: "hero",
    videoLabel: "Concept reel",
    videoNote: "Sample imagery",
    disclosure: "This reel uses concept imagery to show the visual direction Aly is building toward. It is not client work.",
    proof: [
      { title: "Based in San Diego", detail: "Serving local clients" },
      { title: "Built for social", detail: "Vertical and horizontal delivery" },
      { title: "Flexible support", detail: "Editing, capture, or both" }
    ]
  },

  work: {
    eyebrow: "Sample work",
    headline: "A preview of the work Aly is building toward.",
    introduction: "These concept images demonstrate possible project directions while Aly builds her real portfolio. They do not represent paid client work.",
    featuredCredit: {
      eyebrow: "Professional portfolio",
      title: "6 Days Stranded on an Island",
      description: "A television production Aly worked on, presented here as part of her professional portfolio.",
      videoId: "eSkU9LMWX38",
      videoUrl: "https://www.youtube.com/watch?v=eSkU9LMWX38",
      channel: "Survival Games TV"
    },
    projects: [
      {
        title: "Restaurant and hospitality content",
        description: "Food, atmosphere, staff, menu launches, and social-first storytelling.",
        services: "Filming · Editing · Social cuts",
        image: "assets/media/restaurant.webp",
        fallbackImage: "assets/media/restaurant.webp",
        fallbackKey: "restaurant",
        alt: "Concept image of a restaurant content shoot at golden hour",
        layout: "wide",
        sample: true
      },
      {
        title: "Creator and social content",
        description: "Short-form video designed for Reels, TikTok, Shorts, and brand channels.",
        services: "Capture · Edit · Captions",
        image: "assets/media/creator.webp",
        fallbackImage: "assets/media/creator.webp",
        fallbackKey: "creator",
        alt: "Concept image of a creator recording social content in a bright coastal setting",
        layout: "portrait",
        sample: true
      },
      {
        title: "Event highlight films",
        description: "Openings, parties, pop-ups, performances, and community gatherings.",
        services: "Coverage · Recap · Social cuts",
        image: "assets/media/event.webp",
        fallbackImage: "assets/media/event.webp",
        fallbackKey: "event",
        alt: "Concept image of a lively San Diego coastal event at sunset",
        layout: "landscape",
        sample: true
      },
      {
        title: "Elopements and intimate celebrations",
        description: "Limited, story-focused coverage for elopements, micro-weddings, and intimate celebrations.",
        services: "Limited coverage · Highlight edit",
        image: "assets/media/wedding.webp",
        fallbackImage: "assets/media/wedding.webp",
        fallbackKey: "wedding",
        alt: "Concept image of a couple at a small coastal celebration during golden hour",
        layout: "wide",
        sample: true
      }
    ],
    invitation: {
      eyebrow: "San Diego restaurants",
      headline: "Have a restaurant that should look this good online?",
      description: "Aly is building a focused restaurant and hospitality portfolio and welcomes inquiries from local teams that need fresh social video.",
      action: "Ask about restaurant content"
    }
  },

  services: {
    eyebrow: "Services",
    headline: "Video support for businesses, creators, events, and celebrations.",
    introduction: "Introductory starting points for San Diego projects. Final quotes depend on shoot time, deliverables, location, turnaround, and revisions.",
    note: "These are introductory planning prices, not fixed quotes. Travel, rush delivery, extra crew, licensed assets, raw footage handoff, and larger productions are quoted separately.",
    items: [
      {
        title: "Video editing",
        description: "Reels, TikTok, YouTube, promos, interviews, event recaps, and client-supplied footage.",
        price: "From $150"
      },
      {
        title: "Social content production",
        description: "Short-form filming and editing for creators and local businesses.",
        price: "From $450"
      },
      {
        title: "Restaurant and hospitality content",
        description: "Food, atmosphere, staff, behind-the-scenes, menu launches, and social video.",
        price: "From $650"
      },
      {
        title: "Event coverage",
        description: "Capture and recap videos for openings, parties, pop-ups, performances, and branded events.",
        price: "From $750"
      },
      {
        title: "Elopements and intimate celebrations",
        description: "Limited coverage for elopements, micro-weddings, and small celebrations. Availability and scope are confirmed case by case.",
        price: "Custom quote"
      },
      {
        title: "Ongoing content support",
        description: "Recurring filming and editing for a consistent monthly content rhythm.",
        price: "From $1,200/mo"
      }
    ]
  },

  packages: {
    eyebrow: "Packages",
    headline: "Clear starting points for the work Aly wants to do most.",
    introduction: "Choose a package as a baseline. Aly can tailor the final scope around your project, timeline, and platforms.",
    items: [
      {
        name: "Social Edit",
        price: "$150",
        description: "For creators or businesses that already have footage and need one polished short-form video.",
        featured: false,
        formValue: "Social Edit",
        features: [
          "One final edit up to 60 seconds",
          "One organized folder of client-supplied footage",
          "One delivery aspect ratio",
          "Basic color, audio, captions, or simple text",
          "Standard turnaround of about 5 business days",
          "One revision round"
        ]
      },
      {
        name: "Content Session",
        price: "$650",
        description: "For a restaurant, local business, or creator that needs a focused batch of fresh social content.",
        featured: true,
        formValue: "Content Session",
        features: [
          "Up to two hours on location",
          "One San Diego location",
          "Three short-form edited videos",
          "Vertical social delivery",
          "Color, audio, and basic captions",
          "Standard turnaround of 7 to 10 business days",
          "One revision round"
        ]
      },
      {
        name: "Event Recap",
        price: "$750",
        description: "For launches, parties, pop-ups, performances, and community events that need a fast highlight piece.",
        featured: false,
        formValue: "Event Recap",
        features: [
          "Up to two hours of coverage",
          "One San Diego location",
          "One 45 to 60-second highlight edit",
          "Two short social cutdowns",
          "Music, color, and basic audio polish",
          "Standard turnaround of about 10 business days",
          "One revision round"
        ]
      }
    ],
    custom: {
      eyebrow: "Elopements and ongoing work",
      headline: "Some projects need a custom scope.",
      description: "Elopements, intimate celebrations, monthly content, multi-location shoots, longer events, travel, and larger edit packages are quoted around the actual needs of the project.",
      action: "Request a custom quote"
    },
    addOns: [
      "Additional short-form edit",
      "Additional filming hour",
      "Additional location",
      "Horizontal or square version",
      "Advanced captions or motion graphics",
      "Raw footage handoff",
      "Rush turnaround",
      "Extended or paid advertising usage"
    ],
    note: "Add-ons are quoted after Aly reviews the footage, schedule, licensing, and delivery requirements. Final scope, payment schedule, and usage terms are confirmed in writing before work begins."
  },

  process: {
    eyebrow: "How it works",
    headline: "Simple from first message to final files.",
    introduction: "A clear scope, organized feedback, and platform-ready delivery keep the process manageable.",
    steps: [
      { title: "Tell Aly what you need", description: "Share the project, location, target date, platforms, and final videos you have in mind." },
      { title: "Confirm the scope", description: "Aly confirms deliverables, schedule, price, turnaround, payment schedule, and revision rounds before work starts." },
      { title: "Create", description: "Aly films, edits, or handles both depending on the approved project scope." },
      { title: "Review and deliver", description: "You send consolidated feedback and receive final files for the agreed platforms." }
    ]
  },

  faq: {
    eyebrow: "Frequently asked questions",
    headline: "The practical details, before you book.",
    introduction: "These are Aly's current planning defaults. Every project receives a written scope with its exact deliverables, schedule, and terms.",
    items: [
      {
        question: "How long does delivery take?",
        answer: "Short social edits usually take about 5 business days. Filmed content and event packages usually take 7 to 14 business days. Larger projects and rush requests receive a custom schedule."
      },
      {
        question: "How many revisions are included?",
        answer: "The listed packages include one consolidated revision round. Additional revisions or a major change in direction are quoted separately."
      },
      {
        question: "Is a deposit required?",
        answer: "A booking retainer is usually required to reserve a filming date or begin a larger edit. The amount and payment schedule are shown in the written proposal."
      },
      {
        question: "How far outside San Diego do you travel?",
        answer: "Local San Diego projects are the primary focus. Travel, parking, permits, and projects outside the immediate area are quoted based on the location and schedule."
      },
      {
        question: "Do I receive the raw footage?",
        answer: "Raw footage is not included unless it is listed in the approved scope. A raw footage handoff can be added when storage, organization, and usage terms are agreed in advance."
      },
      {
        question: "Are captions included?",
        answer: "Basic captions are included when they are listed in the package. Custom typography, detailed animation, or advanced motion graphics are separate add-ons."
      },
      {
        question: "Who handles music licensing?",
        answer: "When music is included, Aly uses properly licensed music that fits the agreed use. Tell Aly before the project if the video will run as a paid advertisement or needs broader commercial usage."
      },
      {
        question: "What happens if a shoot needs to be rescheduled?",
        answer: "Contact Aly as soon as possible. The written proposal confirms the rescheduling and cancellation terms for that project, including any non-recoverable costs."
      }
    ]
  },

  policies: {
    eyebrow: "Policies and project details",
    headline: "Clear expectations protect the project.",
    introduction: "The final proposal controls each booking. These summaries explain the normal starting point.",
    items: [
      {
        title: "Booking and payment",
        description: "A project is reserved after the written scope is accepted and any required booking retainer is paid."
      },
      {
        title: "Feedback and revisions",
        description: "Feedback should be consolidated into one response. Work outside the approved scope may require a revised quote."
      },
      {
        title: "Rescheduling and cancellation",
        description: "Provide as much notice as possible. Non-recoverable costs and work already completed remain payable."
      },
      {
        title: "Usage and licensing",
        description: "The proposal identifies intended platforms and usage. Paid advertising, third-party licensing, or expanded campaigns may require additional terms."
      },
      {
        title: "Travel and locations",
        description: "Travel, parking, permits, venue fees, and additional locations are quoted when they apply."
      },
      {
        title: "Files and storage",
        description: "Final deliverables are supplied in the agreed formats. Raw footage and long-term project storage are not included unless stated."
      }
    ],
    note: "This website provides general planning information, not the final contract for a project."
  },

  about: {
    eyebrow: "About Aly",
    headline: "San Diego-based editor and content creator.",
    body: "Aly Hackbart creates social video, edits existing footage, and captures events for local businesses, restaurants, creators, and couples. Her approach is collaborative, detail-focused, and built around making content that feels natural to the person or brand behind it.",
    note: "Available for local business, restaurant, creator, event, and intimate celebration projects in San Diego and nearby communities.",
    monogram: "AH",
    portrait: "assets/media/aly-portrait.webp",
    portraitAlt: "Portrait of Aly Hackbart",
    behindScenes: "",
    behindScenesAlt: "Aly Hackbart working on a video project",
    placeholder: "San Diego video editor and content creator"
  },

  contact: {
    eyebrow: "Start a project",
    headline: "Tell Aly what you want to make.",
    introduction: "Share what you need, when you need it, and the budget range you have in mind. Aly will reply by email to confirm availability and next steps.",
    formEndpoint: "https://formsubmit.co/251d51551e089c4c1000323b75ae9878",
    formSubject: "New AlyHackbart.com project inquiry",
    thankYouUrl: "https://alyhackbart.com/thanks.html",
    formSourceUrl: "https://alyhackbart.com/#contact",
    autoresponse: "Thanks for reaching out to Aly Hackbart. Your project inquiry was received, and Aly will reply as soon as possible.",
    projectTypes: [
      "Social Edit",
      "Content Session",
      "Restaurant or hospitality content",
      "Event Recap",
      "Elopement or intimate celebration",
      "Monthly content support",
      "Other or custom project"
    ],
    budgets: [
      "Under $500",
      "$500 to $1,000",
      "$1,000 to $2,500",
      "$2,500 to $5,000",
      "$5,000+",
      "Not sure yet"
    ]
  },

  privacy: {
    title: "Privacy Notice | Aly Hackbart",
    description: "Privacy information for AlyHackbart.com and its project inquiry form.",
    effectiveDate: "August 31, 2026"
  }
};

if (typeof window !== "undefined") window.SITE_CONTENT = SITE_CONTENT;
if (typeof module !== "undefined" && module.exports) module.exports = SITE_CONTENT;
