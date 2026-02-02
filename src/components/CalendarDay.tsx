import { format, isToday } from 'date-fns';
import { cn } from '@/lib/utils';

interface CalendarDayProps {
  date: Date;
  status: 'none' | 'complete' | 'partial' | 'incomplete' | 'future';
  progress: number; // 0 to 1
  isSelected: boolean;
  onClick: () => void;
}

const statusStyles = {
  none: 'bg-task-none-bg border-task-none-border',
  complete: 'bg-task-complete-bg border-task-complete-border',
  partial: 'bg-task-partial-bg border-task-partial-border',
  incomplete: 'bg-task-incomplete-bg border-task-incomplete-border',
  future: 'bg-task-future-bg border-task-future-border',
};

const progressBarColors = {
  none: 'bg-task-none-border',
  complete: 'bg-task-complete-border',
  partial: 'bg-task-partial-border',
  incomplete: 'bg-task-incomplete-border',
  future: 'bg-task-future-border',
};

const progressBarBgColors = {
  none: 'bg-task-none-bg',
  complete: 'bg-task-complete-bg',
  partial: 'bg-muted',
  incomplete: 'bg-muted',
  future: 'bg-task-future-bg',
};

export function CalendarDay({ date, status, progress, isSelected, onClick }: CalendarDayProps) {
  const today = isToday(date);

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-between p-3 rounded-lg transition-all duration-200",
        "border-2 min-h-0",
        statusStyles[status],
        "hover:ring-2 hover:ring-primary/30",
        isSelected && "ring-2 ring-primary"
      )}
    >
      <div className="flex-1 flex items-center justify-center">
        <span className={cn(
          "text-xl font-semibold",
          today ? "text-primary" : "text-foreground"
        )}>
          {format(date, 'd')}
        </span>
      </div>
      
      {/* Progress bar */}
      <div className={cn(
        "w-full h-2 rounded-full overflow-hidden transition-colors duration-200",
        progressBarBgColors[status]
      )}>
        <div 
          className={cn(
            "h-full rounded-full transition-all duration-300",
            progressBarColors[status]
          )}
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </button>
  );
}
