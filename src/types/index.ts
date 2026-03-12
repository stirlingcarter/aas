export type CommitmentStatus =
  | 'draft'
  | 'pending_payment'
  | 'active'
  | 'pending_verification'
  | 'under_review'
  | 'approved'
  | 'denied'
  | 'expired'
  | 'failed';

export interface Profile {
  id: string;
  display_name: string | null;
  stripe_customer_id: string | null;
  created_at: string;
}

export interface Commitment {
  id: string;
  user_id: string;
  goal_description: string;
  amount_cents: number;
  deadline: string;
  status: CommitmentStatus;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  created_at: string;
  verified_at: string | null;
  review_completed_at: string | null;
}

export interface Verification {
  id: string;
  commitment_id: string;
  achievement_pct: number;
  description: string;
  submitted_at: string;
}

export interface Appeal {
  id: string;
  commitment_id: string;
  reason: string;
  status: 'pending' | 'approved';
  submitted_at: string;
  resolved_at: string | null;
}

export interface CommitmentWithVerification extends Commitment {
  verification?: Verification | null;
  appeal?: Appeal | null;
}

export const STATUS_LABELS: Record<CommitmentStatus, string> = {
  draft: 'Draft',
  pending_payment: 'Awaiting Payment',
  active: 'Active',
  pending_verification: 'Ready to Verify',
  under_review: 'Under Review',
  approved: 'Approved',
  denied: 'Denied',
  expired: 'Expired',
  failed: 'Failed',
};

export const STATUS_COLORS: Record<CommitmentStatus, string> = {
  draft: 'text-text-dim bg-surface',
  pending_payment: 'text-warning bg-warning-dim/30',
  active: 'text-accent bg-accent-dim/30',
  pending_verification: 'text-warning bg-warning-dim/30',
  under_review: 'text-text-muted bg-surface',
  approved: 'text-accent bg-accent-dim/30',
  denied: 'text-danger bg-danger-dim/30',
  expired: 'text-danger bg-danger-dim/30',
  failed: 'text-danger bg-danger-dim/30',
};
