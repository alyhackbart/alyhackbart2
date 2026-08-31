/*
  ALYHACKBART.COM CONTENT FILE

  This is the main file to edit when you want to change website wording,
  services, prices, packages, portfolio details, or contact information.

  Keep quotation marks and commas in place. Replace only the text values.
  Media files live in assets/media. See EDITING-GUIDE.md for exact steps.
*/
window.SITE_CONTENT = {
  business: {
    name: "Aly Hackbart",
    location: "San Diego, California",
    email: "alysonhackbart@gmail.com",
    serviceArea: "Available for local projects and select travel"
  },

  hero: {
    eyebrow: "San Diego · Editing · Social Content · Events",
    headline: "Video content that feels polished, current, and easy to share.",
    introduction: "Aly Hackbart creates and edits video for San Diego businesses, restaurants, creators, events, and couples who want strong content without a complicated production process.",
    primaryAction: "Browse packages",
    secondaryAction: "View sample work",
    // Upload your files to assets/media, then add the paths here.
    video: "",
    poster: "",
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
    projects: [
      {
        title: "Restaurant and hospitality content",
        description: "Food, atmosphere, staff, menu launches, and social-first storytelling.",
        services: "Filming · Editing · Social cuts",
        image: "",
        fallback: "restaurant",
        alt: "Concept image of a restaurant content shoot at golden hour",
        layout: "wide",
        sample: true
      },
      {
        title: "Creator and social content",
        description: "Short-form video designed for Reels, TikTok, Shorts, and brand channels.",
        services: "Capture · Edit · Captions",
        image: "",
        fallback: "creator",
        alt: "Concept image of a creator recording social content in a bright coastal setting",
        layout: "portrait",
        sample: true
      },
      {
        title: "Event highlight films",
        description: "Openings, parties, pop-ups, performances, and community gatherings.",
        services: "Coverage · Recap · Social cuts",
        image: "",
        fallback: "event",
        alt: "Concept image of a lively San Diego coastal event at sunset",
        layout: "landscape",
        sample: true
      },
      {
        title: "Wedding and celebration films",
        description: "Story-focused coverage for weddings, elopements, and meaningful celebrations.",
        services: "Custom coverage · Highlight edit",
        image: "",
        fallback: "wedding",
        alt: "Concept image of a couple at a coastal wedding during golden hour",
        layout: "wide",
        sample: true
      }
    ]
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
        title: "Wedding and celebration films",
        description: "Custom coverage based on hours, ceremony needs, audio, and final edits.",
        price: "From $1,500"
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
          "Up to 60-second final edit",
          "Client-supplied footage",
          "Basic color and audio polish",
          "Captions or simple text",
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
          "Color, audio, and captions",
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
          "45 to 60-second highlight edit",
          "Two short social cutdowns",
          "Music, color, and audio polish",
          "One revision round"
        ]
      }
    ],
    custom: {
      eyebrow: "Weddings and ongoing work",
      headline: "Some projects need a custom scope.",
      description: "Wedding coverage, monthly content, multi-location shoots, longer events, travel, and larger edit packages are quoted around the actual needs of the project.",
      action: "Request a custom quote"
    }
  },

  process: {
    eyebrow: "How it works",
    headline: "Simple from first message to final files.",
    introduction: "A clear scope, organized feedback, and platform-ready delivery keep the process manageable.",
    steps: [
      { title: "Tell Aly what you need", description: "Share the project, location, target date, platforms, and final videos you have in mind." },
      { title: "Confirm the scope", description: "Aly confirms deliverables, schedule, price, turnaround, and revision rounds before work starts." },
      { title: "Create", description: "Aly films, edits, or handles both depending on the approved project scope." },
      { title: "Review and deliver", description: "You send consolidated feedback and receive final files for the agreed platforms." }
    ]
  },

  about: {
    eyebrow: "About Aly",
    headline: "San Diego-based editor and content creator.",
    body: "Aly Hackbart creates social video, edits existing footage, and captures events for local businesses, restaurants, creators, and couples. Her approach is collaborative, detail-focused, and built around making content that feels natural to the person or brand behind it.",
    note: "A real portrait and client work will replace the temporary portfolio assets as Aly builds her body of work.",
    monogram: "AH",
    portrait: "",
    portraitAlt: "Portrait of Aly Hackbart",
    placeholder: "Professional portrait coming soon"
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
      "Wedding or celebration film",
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
  }
};
