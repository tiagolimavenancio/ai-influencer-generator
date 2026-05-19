export const ZERNIO_BASE = process.env.ZERNIO_API_BASE || "https://zernio.com/api/v1";

export const MODEL_GENERATION_COST = 50;
export const POST_GENERATION_COST = 20;

export const FREE_PLAN_CREDITS = 300;

export const POSTS_PER_PAGE = 8;
export const MAX_VISIBLE_PAGES = 5;
export const MAX_REFERENCE_IMAGES = 3;
export const MAX_MODELS_SHOWN = 6;

export const LUMA_MOCK_DELAY = 2000;
export const LUMA_POLL_MAX_ATTEMPTS = 60;
export const LUMA_POLL_INTERVAL = 2000;
export const LUMA_DEFAULT_ASPECT_RATIO = "16:9";

export const ZERNIO_CONNECTION_POLL_MAX = 30;
export const ZERNIO_CONNECTION_POLL_INTERVAL = 3000;
export const ZERNIO_SYNC_DELAY = 1500;

export const SUBSCRIPTION_PLANS = {
  free: {
    id: "free",
    name: "Free",
    price: 0,
    credits: 300,
    description: "Best for trying the app",
    features: {
      monthlyCredits: "300 credits",
      aiCreationCost: "50 credits",
      postCreationCost: "20 credits",
      connectedAccounts: "1 account",
      autoPostScheduling: "Up to 5 scheduled posts",
    },
    stripePrice: 0,
  },
  standard: {
    id: "standard",
    name: "Standard",
    price: 9.99,
    credits: 2000,
    description: "Best for creators & small teams",
    features: {
      monthlyCredits: "2,000 credits/month",
      aiCreationCost: "50 credits",
      postCreationCost: "20 credits",
      connectedAccounts: "Up to 5 accounts",
      autoPostScheduling: "Unlimited scheduled posts",
    },
    stripePrice: 999,
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: 29.99,
    credits: 10000,
    description: "Best for power users & agencies",
    features: {
      monthlyCredits: "10,000 credits/month",
      aiCreationCost: "50 credits",
      postCreationCost: "20 credits",
      connectedAccounts: "Unlimited accounts",
      autoPostScheduling: "Unlimited scheduled posts",
    },
    stripePrice: 2999,
  },
} as const;

export type SubscriptionPlanId = keyof typeof SUBSCRIPTION_PLANS;

export const PLANS: Record<string, { amount: number; name: string; credits: number }> = {
  standard: { amount: 999, name: "Standard", credits: 2000 },
  pro: { amount: 2999, name: "Pro", credits: 10000 },
};

export const PLAN_CREDITS: Record<string, number> = {
  standard: 2000,
  pro: 10000,
};
