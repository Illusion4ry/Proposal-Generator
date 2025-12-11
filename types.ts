export enum PlanType {
  ESSENTIALS = 'TaxDome Essentials',
  PRO = 'TaxDome Pro',
  BUSINESS = 'TaxDome Business'
}

export interface OnboardingPackage {
  id: string;
  name: string;
  price: number;
  priceDisplay: string;
  idealFor: string;
  features: string[];
}

export interface FirmData {
  firmName: string;
  firmSize: number;
  contactName: string;
  language: 'English' | 'Spanish';
  selectedPlan: PlanType;
  selectedOnboarding: OnboardingPackage;
  features: string[];
  transcript: string;
  additionalContext: string;
}

export interface ProposalContent {
  executiveSummary: {
    title: string;
    body: string; // HTML string allowed for rich text
    keyBenefits: string[];
  };
  quote: {
    planName: string;
    pricePerUser: string;
    billingFrequency: string; // e.g., "billed annually"
    softwareTotal: string;
    onboarding: {
      name: string;
      price: string;
      features: string[];
    };
    totalAnnualCost: string; // Grand total (Software + Onboarding)
    featuresList: string[];
    closingStatement: string;
  };
}

export interface SavedProposal {
  id: string;
  createdAt: number;
  lastModified: number;
  firmData: FirmData;
  content: ProposalContent;
}

export const FEATURE_CATEGORIES = {
  "Client Experience": [
    "Client Portal",
    "Mobile App (White-labeled)",
    "Secure Client Chats",
    "Organizers & Intake Forms",
    "Multi-language Support"
  ],
  "Workflow & Automation": [
    "Workflow Automation",
    "Kanban Project Management",
    "Auto-reminders",
    "Task Management",
    "Job Statuses & Templates"
  ],
  "Documents & Signatures": [
    "Unlimited Document Storage",
    "Unlimited e-Signatures",
    "PDF Editor",
    "KBA (Knowledge-Based Auth)",
    "Smart Categorization"
  ],
  "Billing & Revenue": [
    "Proposals & Engagement Letters",
    "Invoicing & Payments",
    "Time Tracking & WIP",
    "Recurring Invoices"
  ],
  "Integrations & Tech": [
    "QuickBooks Online Integration",
    "IRS Transcripts Integration",
    "Email Sync",
    "Zapier Integration",
    "AI-Powered Reporting"
  ]
};

export const ONBOARDING_PACKAGES: OnboardingPackage[] = [
  {
    id: 'group',
    name: 'Group Onboarding',
    price: 0,
    priceDisplay: 'Free',
    idealFor: 'Self-starters',
    features: ['Live 1-hour sessions (Mon-Thu)', 'Group-led by Customer Success']
  },
  {
    id: 'guided',
    name: 'Guided Onboarding',
    price: 999,
    priceDisplay: '$999',
    idealFor: 'Growing firms',
    features: ['1 hr kickoff + 5 consultations', '1 custom workflow setup', 'Dedicated Manager (90 days)']
  },
  {
    id: 'enhanced',
    name: 'Enhanced',
    price: 1999,
    priceDisplay: '$1,999',
    idealFor: 'Firms needing strategy',
    features: ['1 hr kickoff + 8 consultations', 'Up to 2 workflows setup', 'Senior Manager (120 days)']
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 3499,
    priceDisplay: '$3,499',
    idealFor: 'Enterprise speed',
    features: ['Done-for-you setup (full)', 'Private Slack Channel', 'Senior Manager (60-90 days)', 'Go live within 3 weeks']
  }
];