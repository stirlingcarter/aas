interface ProgressBarProps {
  progress: number; // 0-100
  indeterminate?: boolean;
  className?: string;
}

export function ProgressBar({ progress, indeterminate = false, className = '' }: ProgressBarProps) {
  return (
    <div className={`w-full h-2 bg-surface rounded-full overflow-hidden ${className}`}>
      {indeterminate ? (
        <div className="h-full w-1/4 bg-accent rounded-full animate-progress" />
      ) : (
        <div
          className="h-full bg-accent rounded-full transition-all duration-500 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      )}
    </div>
  );
}
