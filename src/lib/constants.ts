export const PLATFORM_FEE_RATE = 0.005; // 0.5%

export const STAKE_PRESETS = [
  { label: '$25', cents: 2500 },
  { label: '$50', cents: 5000 },
  { label: '$100', cents: 10000 },
  { label: '$250', cents: 25000 },
  { label: '$500', cents: 50000 },
];

export const MIN_STAKE_CENTS = 500; // $5
export const MAX_STAKE_CENTS = 100000; // $1000

export const MIN_DEADLINE_DAYS = 1;
export const MAX_DEADLINE_DAYS = 365;

export const REVIEW_STAGES = [
  'Claim received',
  'Assigned to accountability specialist',
  'Under evaluation',
  'Cross-referencing commitment parameters',
  'Consulting the vibes committee',
  'Final assessment pending',
];

export const APPROVAL_THRESHOLD_PCT = 50;

export const formatCents = (cents: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
};

export const formatDate = (iso: string): string => {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatDateTime = (iso: string): string => {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

export const daysUntil = (iso: string): number => {
  const now = new Date();
  const target = new Date(iso);
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
};

export const isPastDeadline = (iso: string): boolean => {
  return new Date(iso) <= new Date();
};
