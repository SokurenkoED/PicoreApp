export type EnSectionSlug =
  | 'ai-photoshoots'
  | 'ready-looks'
  | 'animate-photo'
  | 'blog'
  | 'reviews'
  | 'faq'
  | 'partnerships';

type MegaColumnLink = {
  label: string;
  href: string;
};

type MegaColumn = {
  title: string;
  links: MegaColumnLink[];
};

type MegaFeatured = {
  badge: string;
  title: string;
  description: string;
  image: string;
  href: string;
};

type MegaMenu = {
  title: string;
  viewAllHref: string;
  columns: MegaColumn[];
  featured: MegaFeatured;
};

type SectionExample = {
  image: string;
  title: string;
  description: string;
};

type SectionFaq = {
  question: string;
  answer: string;
};

export type EnSection = {
  slug: EnSectionSlug;
  label: string;
  href: `/${string}`;
  pageTitle: string;
  pageDescription: string;
  heroTitle: string;
  heroLead: string;
  seoLead: string;
  outcomes: string[];
  examples: SectionExample[];
  faqs: SectionFaq[];
  mega?: MegaMenu;
};

export const enSections: EnSection[] = [
  {
    slug: 'ai-photoshoots',
    label: 'AI Photoshoots',
    href: '/ai-photoshoots',
    pageTitle: 'AI Photoshoots Online',
    pageDescription: 'Curated AI photoshoot scenarios for personal brand, business, and social media.',
    heroTitle: 'AI photoshoots for every goal and visual mood',
    heroLead:
      'Choose a scenario that matches your identity: studio, office, city, business-ready and seasonal concepts.',
    seoLead:
      'This page is built as an SEO hub with scenarios, visual examples and direct entry to generation flow.',
    outcomes: [
      'Scenarios for personal brand, CV, creator profiles and social media.',
      'Fast path: choose concept, upload photos, get a complete visual set.',
      'Consistent visual language across scenes, angles and outputs.'
    ],
    examples: [
      {
        image: '/samples/minimal-studio-1.svg',
        title: 'Studio AI photoshoot',
        description: 'Clean lighting, neutral background and focus on face and styling.'
      },
      {
        image: '/samples/corporate-headshots-2.svg',
        title: 'Business portraits',
        description: 'Professional visuals for LinkedIn, websites and sales decks.'
      },
      {
        image: '/samples/travel-lifestyle-1.svg',
        title: 'Urban lifestyle',
        description: 'Natural atmosphere with dynamic frames for content marketing.'
      },
      {
        image: '/samples/cinematic-portrait-2.svg',
        title: 'Cinematic portrait',
        description: 'Deeper light and stronger character for premium positioning.'
      }
    ],
    faqs: [
      {
        question: 'How many photos should I upload to start?',
        answer: 'We recommend 8 to 15 varied portraits. Better variety means more stable output quality.'
      },
      {
        question: 'Can I pick a style for a specific platform?',
        answer: 'Yes. Scenarios are suitable for Instagram, LinkedIn, Telegram, websites and ads.'
      },
      {
        question: 'How long does generation usually take?',
        answer: 'Most jobs are ready in a few minutes. You can track progress inside the app.'
      }
    ],
    mega: {
      title: 'All AI photoshoots',
      viewAllHref: '/ai-photoshoots',
      columns: [
        {
          title: 'Popular scenes',
          links: [
            { label: 'In studio', href: '/ai-photoshoots#studio' },
            { label: 'In office', href: '/ai-photoshoots#office' },
            { label: 'On the street', href: '/ai-photoshoots#street' },
            { label: 'By the window', href: '/ai-photoshoots#window' },
            { label: 'In a cafe', href: '/ai-photoshoots#cafe' }
          ]
        },
        {
          title: 'Seasonal ideas',
          links: [
            { label: 'Spring look', href: '/ai-photoshoots#spring' },
            { label: 'Summer vibe', href: '/ai-photoshoots#summer' },
            { label: 'Autumn city', href: '/ai-photoshoots#autumn' },
            { label: 'Winter studio', href: '/ai-photoshoots#winter' },
            { label: 'Holiday set', href: '/ai-photoshoots#holiday' }
          ]
        },
        {
          title: 'Business use cases',
          links: [
            { label: 'For experts', href: '/ai-photoshoots#expert' },
            { label: 'For teams', href: '/ai-photoshoots#team' },
            { label: 'For portfolios', href: '/ai-photoshoots#portfolio' },
            { label: 'For resume', href: '/ai-photoshoots#resume' },
            { label: 'For ads', href: '/ai-photoshoots#ads' }
          ]
        }
      ],
      featured: {
        badge: 'Popular',
        title: 'Studio photoshoot',
        description: 'A universal setup for portrait, business and social channels.',
        image: '/samples/minimal-studio-1.svg',
        href: '/ai-photoshoots#studio'
      }
    }
  },
  {
    slug: 'ready-looks',
    label: 'Ready Looks',
    href: '/ready-looks',
    pageTitle: 'Ready Looks for AI Photos',
    pageDescription: 'A catalog of ready visual looks for business, lifestyle and editorial content.',
    heroTitle: 'Ready looks: pick your style in under a minute',
    heroLead:
      'Skip concept brainstorming. Use pre-built visual bundles and get a coherent photo series faster.',
    seoLead:
      'This page shortens the path from intent to purchase by grouping the most requested style directions.',
    outcomes: [
      'Pre-built looks for personal brand, creator funnels and ads.',
      'Predictable visual quality thanks to tested presets.',
      'Faster launch of paid campaigns and content production.'
    ],
    examples: [
      {
        image: '/templates/style-card-1.svg',
        title: 'Clean light',
        description: 'Minimal studio feel for expert and corporate positioning.'
      },
      {
        image: '/templates/style-card-2.svg',
        title: 'Warm film',
        description: 'Cinematic warmth for lifestyle and storytelling formats.'
      },
      {
        image: '/templates/style-card-3.svg',
        title: 'Soft editorial',
        description: 'Editorial balance for premium brand presentation.'
      },
      {
        image: '/templates/style-card-4.svg',
        title: 'Rich contrast',
        description: 'High-contrast setup for eye-catching ad creative.'
      }
    ],
    faqs: [
      {
        question: 'Can I adapt a look to my brand style guide?',
        answer: 'Yes. You can tune mood, color direction and retouching intensity to match your brand.'
      },
      {
        question: 'Are ready looks suitable for paid ads?',
        answer: 'Yes. Many looks are optimized for conversion-oriented social ad placements.'
      },
      {
        question: 'Can I test several looks in one workflow?',
        answer: 'Yes. Run multiple generations and compare visual performance across channels.'
      }
    ],
    mega: {
      title: 'Ready looks catalog',
      viewAllHref: '/ready-looks',
      columns: [
        {
          title: 'Personal brand',
          links: [
            { label: 'Expert', href: '/ready-looks#expert' },
            { label: 'Premium', href: '/ready-looks#premium' },
            { label: 'Dynamic', href: '/ready-looks#dynamic' },
            { label: 'Classic', href: '/ready-looks#classic' },
            { label: 'Casual', href: '/ready-looks#casual' }
          ]
        },
        {
          title: 'Business',
          links: [
            { label: 'Corporate', href: '/ready-looks#corporate' },
            { label: 'Consultant', href: '/ready-looks#consultant' },
            { label: 'Courses', href: '/ready-looks#courses' },
            { label: 'Marketplace', href: '/ready-looks#marketplace' },
            { label: 'Pitch deck', href: '/ready-looks#pitch' }
          ]
        },
        {
          title: 'Creative',
          links: [
            { label: 'Cinematic', href: '/ready-looks#cinematic' },
            { label: 'Fashion', href: '/ready-looks#fashion' },
            { label: 'Retro', href: '/ready-looks#retro' },
            { label: 'Street', href: '/ready-looks#street' },
            { label: 'Art', href: '/ready-looks#art' }
          ]
        }
      ],
      featured: {
        badge: 'Top pick',
        title: 'Soft editorial',
        description: 'One of the strongest converting directions for creator and fashion funnels.',
        image: '/templates/style-card-3.svg',
        href: '/ready-looks#editorial'
      }
    }
  },
  {
    slug: 'animate-photo',
    label: 'Animate Photo',
    href: '/animate-photo',
    pageTitle: 'Animate Photo with AI',
    pageDescription: 'Turn static photos into motion-ready visual assets for social and ads.',
    heroTitle: 'Animate photos and turn stills into dynamic visuals',
    heroLead:
      'Use AI motion effects to add depth, expression and engagement to static photos for social and performance.',
    seoLead:
      'A dedicated landing page for animate-photo queries with practical examples and direct conversion actions.',
    outcomes: [
      'Motion visuals for Reels, Shorts, Stories and ad funnels.',
      'Video-first creatives for creator pages and launch campaigns.',
      'Faster production cycle without a video crew.'
    ],
    examples: [
      {
        image: '/templates/before-after-1.svg',
        title: 'Portrait with camera motion',
        description: 'Subtle parallax and micro-expression for natural video feel.'
      },
      {
        image: '/templates/before-after-2.svg',
        title: 'Emotional short clip',
        description: 'Light and atmosphere shifts to increase visual depth.'
      },
      {
        image: '/samples/dramatic-light-1.svg',
        title: 'Cinematic animation',
        description: 'Useful for launch announcements and high-intent creative.'
      },
      {
        image: '/samples/beauty-closeup-1.svg',
        title: 'Beauty motion',
        description: 'Soft movement patterns for a premium, controlled look.'
      }
    ],
    faqs: [
      {
        question: 'Do I need editing skills to animate photos?',
        answer: 'No. You choose the scenario and the motion logic is generated automatically.'
      },
      {
        question: 'Can I use outputs for paid advertising?',
        answer: 'Yes, these outputs are intended for commercial social and digital formats.'
      },
      {
        question: 'Can I start from mobile?',
        answer: 'Yes. Upload references and launch generation directly from your mobile browser.'
      }
    ],
    mega: {
      title: 'Photo animation scenarios',
      viewAllHref: '/animate-photo',
      columns: [
        {
          title: 'Social formats',
          links: [
            { label: 'Reels cover', href: '/animate-photo#reels' },
            { label: 'Stories', href: '/animate-photo#stories' },
            { label: 'Shorts', href: '/animate-photo#shorts' },
            { label: 'Telegram content', href: '/animate-photo#telegram' },
            { label: 'YouTube preview', href: '/animate-photo#youtube' }
          ]
        },
        {
          title: 'Business use',
          links: [
            { label: 'Ads', href: '/animate-photo#ads' },
            { label: 'Landing pages', href: '/animate-photo#landing' },
            { label: 'Course cards', href: '/animate-photo#courses' },
            { label: 'CRM visual', href: '/animate-photo#crm' },
            { label: 'Presentations', href: '/animate-photo#presentations' }
          ]
        },
        {
          title: 'Effects',
          links: [
            { label: 'Smooth camera', href: '/animate-photo#camera' },
            { label: 'Light accents', href: '/animate-photo#lights' },
            { label: 'Micro-motion', href: '/animate-photo#micro' },
            { label: 'Cinema effect', href: '/animate-photo#cinema' },
            { label: 'Soft zoom', href: '/animate-photo#zoom' }
          ]
        }
      ],
      featured: {
        badge: 'New',
        title: 'Dynamic portrait',
        description: 'Turn a static image into a short, engaging motion visual.',
        image: '/templates/before-after-2.svg',
        href: '/animate-photo#reels'
      }
    }
  },
  {
    slug: 'blog',
    label: 'Blog',
    href: '/blog',
    pageTitle: 'Picoria Blog',
    pageDescription: 'Guides, benchmarks and use cases for AI photoshoot workflows.',
    heroTitle: 'Blog about AI photoshoots, growth and visual strategy',
    heroLead:
      'We publish practical guides and trend breakdowns to help teams scale conversion-ready visual content.',
    seoLead:
      'The blog covers informational intent and supports commercial pages with internal links and user education.',
    outcomes: [
      'Practical playbooks for marketers and creators.',
      'Decision frameworks for visual strategy and channels.',
      'Real workflow examples from launch to conversion.'
    ],
    examples: [
      {
        image: '/templates/hero-shot-1.svg',
        title: 'How to choose a style for your funnel',
        description: 'A quick method for mapping visuals to paid and organic traffic stages.'
      },
      {
        image: '/templates/hero-shot-2.svg',
        title: 'AI visuals for expert offers',
        description: 'Ways to package expert identity across site, social and ads.'
      },
      {
        image: '/samples/streetwear-editorial-1.svg',
        title: 'Build a monthly visual content plan',
        description: 'How to prepare a month of visuals in one production cycle.'
      },
      {
        image: '/samples/retro-film-1.svg',
        title: 'Visual trends for this year',
        description: 'What styles are actually performing across social feeds right now.'
      }
    ],
    faqs: [
      {
        question: 'How often do you publish new posts?',
        answer: 'Usually weekly. We focus on practical updates, benchmarks and real use cases.'
      },
      {
        question: 'Can I use these guides with my team?',
        answer: 'Yes. Most articles are written as operational checklists and workflows.'
      },
      {
        question: 'Do you publish multi-industry case studies?',
        answer: 'Yes. We cover creators, education, agencies, services and e-commerce.'
      }
    ]
  },
  {
    slug: 'reviews',
    label: 'Reviews',
    href: '/reviews',
    pageTitle: 'Picoria Reviews',
    pageDescription: 'Customer reviews and practical feedback on AI photoshoot quality and speed.',
    heroTitle: 'Customer reviews of Picoria AI photoshoots',
    heroLead:
      'Feedback from founders, marketers and creators using AI visuals for growth and sales operations.',
    seoLead:
      'Reviews build trust and reduce hesitation before purchase, improving both SEO signals and conversion.',
    outcomes: [
      'Real proof of output quality from production usage.',
      'Cross-industry examples of business adoption.',
      'Social proof for first-time buyers and teams.'
    ],
    examples: [
      {
        image: '/templates/testimonial-1.svg',
        title: 'Growth marketer',
        description: '"Visual quality improved while production time dropped significantly."'
      },
      {
        image: '/templates/testimonial-2.svg',
        title: 'Course producer',
        description: '"We use these visuals in ads and landing pages with stable conversion."'
      },
      {
        image: '/templates/testimonial-3.svg',
        title: 'Agency owner',
        description: '"Our team now covers visual production without studio dependency."'
      },
      {
        image: '/samples/corporate-headshots-1.svg',
        title: 'HR team',
        description: '"We standardized team profile visuals in one workday."'
      }
    ],
    faqs: [
      {
        question: 'Are reviews moderated?',
        answer: 'Yes, we publish verified feedback with clear context and expected outcomes.'
      },
      {
        question: 'Can I submit my review?',
        answer: 'Yes. After usage you can submit feedback and examples through support.'
      },
      {
        question: 'Do you have B2B customer reviews?',
        answer: 'Yes. Clients include agencies, education teams and product businesses.'
      }
    ]
  },
  {
    slug: 'faq',
    label: 'Questions & Answers',
    href: '/faq',
    pageTitle: 'Picoria Questions & Answers',
    pageDescription: 'FAQ on setup, uploads, generation time, usage rights and workflow.',
    heroTitle: 'Questions & answers about launching AI photoshoots',
    heroLead:
      'Key answers about pricing, source photos, privacy and commercial usage of generated content.',
    seoLead:
      'A dedicated FAQ page helps both SEO and support by shortening time to decision for new users.',
    outcomes: [
      'Fast answers before and after payment.',
      'Transparent rules for quality, timing and privacy.',
      'Clear launch instructions without support dependency.'
    ],
    examples: [
      {
        image: '/samples/tech-founder-1.svg',
        title: 'Launch in 5 minutes',
        description: 'A simple flow from signup to first generated batch.'
      },
      {
        image: '/samples/tech-founder-2.svg',
        title: 'How to pick a plan',
        description: 'A practical way to choose credits by output volume.'
      },
      {
        image: '/samples/fitness-pro-1.svg',
        title: 'Commercial usage',
        description: 'Where and how generated visuals can be used safely.'
      },
      {
        image: '/samples/fitness-pro-2.svg',
        title: 'Privacy policy',
        description: 'How uploaded references are processed and protected.'
      }
    ],
    faqs: [
      {
        question: 'Can I use generated photos in ads?',
        answer: 'Yes, generated content can be used in commercial channels under platform policies.'
      },
      {
        question: 'Are source photos removed after generation?',
        answer: 'We follow minimal-retention principles and provide data removal on request.'
      },
      {
        question: 'What if output quality is not what I expected?',
        answer: 'Try another style or more varied source photos. This usually improves the result quickly.'
      }
    ]
  },
  {
    slug: 'partnerships',
    label: 'Partnerships',
    href: '/partnerships',
    pageTitle: 'Partnerships with Picoria',
    pageDescription: 'Partnership programs for agencies, experts, education teams and special projects.',
    heroTitle: 'Partnerships: integrations, campaigns and B2B workflows',
    heroLead:
      'We collaborate with agencies, creators, education teams and brands that need scalable AI visual production.',
    seoLead:
      'This page captures high-intent B2B demand with clear collaboration models and conversion paths.',
    outcomes: [
      'Partner terms for agencies and production teams.',
      'Co-branded campaigns and special visual projects.',
      'Integration options for education and internal products.'
    ],
    examples: [
      {
        image: '/samples/luxury-fashion-1.svg',
        title: 'Agency partnership',
        description: 'We support client delivery pipelines with predictable visual output.'
      },
      {
        image: '/samples/luxury-fashion-2.svg',
        title: 'Creator collaborations',
        description: 'Visual packs for expert funnels and educational programs.'
      },
      {
        image: '/samples/wedding-classic-1.svg',
        title: 'White-label models',
        description: 'Optional workflows aligned with your own brand layer.'
      },
      {
        image: '/samples/wedding-classic-2.svg',
        title: 'B2B operations',
        description: 'Recurring visual production for teams and product ecosystems.'
      }
    ],
    faqs: [
      {
        question: 'Which partnership formats are available?',
        answer: 'Referral, agency tiers, white-label and joint launch formats are available.'
      },
      {
        question: 'Are there agency-specific conditions?',
        answer: 'Yes. Agencies can get priority workflows and volume-based terms.'
      },
      {
        question: 'How can I submit a partnership request?',
        answer: 'Send your proposal via support chat in the app and we will follow up with details.'
      }
    ]
  }
];

export const enSectionsMap = new Map<EnSectionSlug, EnSection>(enSections.map((item) => [item.slug, item]));

export const enHeaderItems = enSections.map(({ slug, label, href, mega }) => ({
  slug,
  label,
  href,
  mega
}));

export const enSectionPaths = enSections.map((section) => section.href);

export function getEnSectionBySlug(slug: string): EnSection | undefined {
  return enSectionsMap.get(slug as EnSectionSlug);
}
