export interface QuestionField {
  key: string;
  label: string;
  placeholder: string;
  type: "text" | "textarea" | "list";
}

export interface DiscoveryStep {
  number: number;
  title: string;
  subtitle: string;
  description: string;
  fields: QuestionField[];
}

export const DISCOVERY_STEPS: DiscoveryStep[] = [
  {
    number: 1,
    title: "The Business",
    subtitle: "What do you do?",
    description:
      "Tell us about your product or service. Be specific — what do you sell and how does it work?",
    fields: [
      {
        key: "business_name",
        label: "Business / Brand Name",
        placeholder: "e.g., Acme Health Solutions",
        type: "text",
      },
      {
        key: "business_description",
        label: "What do you sell? How does it work?",
        placeholder:
          "Describe your product or service in plain language. What does a customer actually get? How is it delivered?",
        type: "textarea",
      },
      {
        key: "business_price",
        label: "Price point(s)",
        placeholder: "e.g., $297/month, $2,500 one-time, free trial + $49/mo",
        type: "text",
      },
    ],
  },
  {
    number: 2,
    title: "The Customer",
    subtitle: "Who is your hero?",
    description:
      "Who are the distinct audiences you serve? The customer is the hero of the story — we need to understand who they are and what they want.",
    fields: [
      {
        key: "audience_primary",
        label: "Primary audience",
        placeholder:
          "Who is your main customer? Be specific — job title, life stage, situation.",
        type: "textarea",
      },
      {
        key: "audience_secondary",
        label: "Secondary audience (optional)",
        placeholder:
          "Do you serve a second distinct group? Describe them here.",
        type: "textarea",
      },
      {
        key: "customer_desire",
        label: "What do they want? (in survival-relevant terms)",
        placeholder:
          "What is the ONE thing your customer wants most? Frame it in terms of survival: money, time, safety, status, relationships.",
        type: "textarea",
      },
    ],
  },
  {
    number: 3,
    title: "The Problem",
    subtitle: "What's the villain?",
    description:
      "Every hero has a problem. Define the external, internal, and philosophical layers of your customer's pain. Name the villain — the root cause.",
    fields: [
      {
        key: "external_problem",
        label: "External Problem (the tangible, surface-level issue)",
        placeholder:
          'e.g., "They can\'t find qualified candidates fast enough" or "Their website doesn\'t generate leads"',
        type: "textarea",
      },
      {
        key: "internal_problem",
        label: "Internal Problem (how it makes them FEEL)",
        placeholder:
          'e.g., "They feel overwhelmed and behind," "They\'re embarrassed by their outdated messaging"',
        type: "textarea",
      },
      {
        key: "philosophical_problem",
        label: 'Philosophical Problem (why it\'s simply WRONG)',
        placeholder:
          'Start with "People shouldn\'t have to..." or "Everyone deserves..."',
        type: "textarea",
      },
      {
        key: "villain",
        label: "The Villain (the root cause — a force, not a person)",
        placeholder:
          'e.g., "Outdated hiring processes," "Information overload," "The complexity of modern marketing"',
        type: "text",
      },
    ],
  },
  {
    number: 4,
    title: "The Guide",
    subtitle: "Empathy + Authority",
    description:
      'You are the guide — Yoda, not Luke. Show the customer you understand their pain (empathy) and prove you can help (authority). Remember: everything you say about yourself serves the customer\'s story.',
    fields: [
      {
        key: "empathy_statement",
        label: "Empathy Statement",
        placeholder:
          '"We understand what it\'s like to..." — Show you\'ve been where they are or deeply understand their struggle.',
        type: "textarea",
      },
      {
        key: "authority_credentials",
        label: "Authority & Credentials",
        placeholder:
          "Years of experience, number of customers served, certifications, results achieved, notable clients, media mentions.",
        type: "textarea",
      },
      {
        key: "authority_testimonial",
        label: "Best customer testimonial or result (optional)",
        placeholder:
          'A specific quote or result that proves you deliver. e.g., "After working with us, XYZ Corp increased revenue by 40% in 6 months."',
        type: "textarea",
      },
    ],
  },
  {
    number: 5,
    title: "The Plan",
    subtitle: "Make it simple",
    description:
      "Give the hero a clear, simple plan. 3-4 steps max. This removes confusion and makes taking action feel safe and easy.",
    fields: [
      {
        key: "plan_step_1",
        label: "Step 1",
        placeholder:
          'e.g., "Schedule a free consultation" or "Sign up and complete your profile"',
        type: "text",
      },
      {
        key: "plan_step_2",
        label: "Step 2",
        placeholder:
          'e.g., "We build your custom strategy" or "Choose your plan"',
        type: "text",
      },
      {
        key: "plan_step_3",
        label: "Step 3",
        placeholder:
          'e.g., "Launch and watch your results grow" or "Start seeing results in weeks"',
        type: "text",
      },
      {
        key: "plan_step_4",
        label: "Step 4 (optional)",
        placeholder: "Only if needed. 3 steps is usually ideal.",
        type: "text",
      },
    ],
  },
  {
    number: 6,
    title: "The Stakes",
    subtitle: "Failure & Success",
    description:
      "Stories need stakes. What happens if the hero doesn't act? And what does their life look like when they succeed?",
    fields: [
      {
        key: "failure_state",
        label: "What failure are they avoiding?",
        placeholder:
          '"Without this, you\'ll continue to..." — Paint the honest negative outcome. Not fear-mongering, just real stakes.',
        type: "textarea",
      },
      {
        key: "success_state",
        label: "What does success look like?",
        placeholder:
          "Be specific: What does their life / business / day look like AFTER they use your product? The aspirational identity.",
        type: "textarea",
      },
    ],
  },
  {
    number: 7,
    title: "Your Story",
    subtitle: "The Origin of Empathy",
    description:
      "Every guide has a backstory. What happened that made you care about this problem? This isn't about opening with your story — it's about deepening trust after the relationship is established.",
    fields: [
      {
        key: "origin_struggle",
        label: "The Hole — What struggle led you to this work?",
        placeholder:
          "What pain did you (or your first customer) face? This should be the SAME hole your customer is in.",
        type: "textarea",
      },
      {
        key: "origin_tool",
        label: "The Tool — What did you create to get out?",
        placeholder:
          "What product, service, or framework did you build? How did it solve the problem?",
        type: "textarea",
      },
      {
        key: "origin_mission",
        label: "The Mission — Why did this become your life's work?",
        placeholder:
          '"I couldn\'t stop thinking about the people still stuck in that hole..." — Frame it as calling, not career move.',
        type: "textarea",
      },
      {
        key: "origin_dark_moment",
        label: "The Dark Moment (optional but powerful)",
        placeholder:
          "Was there a time everything nearly fell apart? A setback, a failure, a crisis? This creates the emotional peak of your story.",
        type: "textarea",
      },
    ],
  },
  {
    number: 8,
    title: "Differentiator",
    subtitle: "What makes you unlike anything else?",
    description:
      "Identify the ONE thing that sets you apart and the biggest objection people have. These are critical for your messaging.",
    fields: [
      {
        key: "differentiator",
        label: "Key Differentiator",
        placeholder:
          "What is the ONE thing you have that nobody else does? A unique method, exclusive access, proprietary technology, a specific guarantee?",
        type: "textarea",
      },
      {
        key: "main_objection",
        label: "Biggest Objection",
        placeholder:
          'What\'s the #1 reason people don\'t buy? e.g., "It\'s too expensive," "I can do this myself," "I\'ve tried something like this before"',
        type: "textarea",
      },
      {
        key: "objection_answer",
        label: "How do you answer that objection?",
        placeholder:
          "In 1-2 sentences, what's your best rebuttal to the objection above?",
        type: "textarea",
      },
    ],
  },
  {
    number: 9,
    title: "Details",
    subtitle: "Specifics & Channels",
    description:
      "Specifics always beat generalities. Let's capture the concrete details and where you need to show up.",
    fields: [
      {
        key: "timeline",
        label: "Timeline to results",
        placeholder:
          'How long does it take for a customer to see results? e.g., "4-8 weeks," "Same day," "Within your first session"',
        type: "text",
      },
      {
        key: "guarantee",
        label: "Guarantee or risk-reducer (optional)",
        placeholder:
          'e.g., "30-day money-back guarantee," "Free trial," "Pay only when you see results"',
        type: "text",
      },
      {
        key: "platforms",
        label: "Marketing platforms you use",
        placeholder:
          "e.g., LinkedIn, Instagram, YouTube, Email, Website, Facebook, X/Twitter",
        type: "text",
      },
      {
        key: "cta_direct",
        label: "Direct CTA (primary action)",
        placeholder:
          'What do you want the customer to DO? e.g., "Schedule a Call," "Buy Now," "Enroll Today"',
        type: "text",
      },
      {
        key: "cta_transitional",
        label: "Transitional CTA (softer ask)",
        placeholder:
          'For those not ready to buy yet. e.g., "Download the Free Guide," "Watch the Demo," "Take the Quiz"',
        type: "text",
      },
    ],
  },
];
