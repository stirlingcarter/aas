import type { CommitmentStatus } from '../types';
import { STATUS_LABELS, STATUS_COLORS } from '../types';

interface BadgeProps {
  status: CommitmentStatus;
  className?: string;
}

export function Badge({ status, className = '' }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
        ${STATUS_COLORS[status]}
        ${className}
      `}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
