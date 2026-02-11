import { Check, Repeat, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Task } from '@/hooks/useTasks';
import { EditTaskDialog } from './EditTaskDialog';
import { DeleteTaskDialog } from './DeleteTaskDialog';

interface TaskItemProps {
  task: Task;
  isCompleted: boolean;
  onToggle: () => void;
  onDeleteAll: () => void;
  onEndTask: () => void;
  onDeleteToday: () => void;
  onEdit: (taskId: string, updates: {
    title: string;
    repeat_type: 'none' | 'daily' | 'weekly' | 'fortnightly';
    repeat_day?: number | null;
  }) => void;
  canComplete: boolean;
}

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function TaskItem({ task, isCompleted, onToggle, onDeleteAll, onEndTask, onDeleteToday, onEdit, canComplete }: TaskItemProps) {
  const getRepeatLabel = () => {
    if (task.repeat_type === 'daily') return 'Every day';
    if (task.repeat_type === 'weekly' && task.repeat_day !== null) {
      return `Every ${dayNames[task.repeat_day]}`;
    }
    if (task.repeat_type === 'fortnightly') return 'Every 2 weeks';
    return null;
  };

  const repeatLabel = getRepeatLabel();

  return (
    <div
      className={cn(
        "group w-full max-w-full min-w-0 rounded-lg border p-3 transition-all duration-200",
        "grid grid-cols-[auto,minmax(0,1fr),auto] items-start gap-2",
        isCompleted
          ? "bg-task-complete-bg border-task-complete-border"
          : "bg-card border-border hover:border-primary/30",
      )}
    >
      <button
        onClick={onToggle}
        disabled={!canComplete}
        className={cn(
          "flex-shrink-0 self-start w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200",
          isCompleted
            ? "bg-task-complete-border border-task-complete-border text-primary-foreground"
            : "border-muted-foreground/30 hover:border-primary",
          !canComplete && "opacity-50 cursor-not-allowed",
        )}
      >
        {isCompleted && <Check className="w-4 h-4" />}
      </button>

      <div className="min-w-0">
        <p
          className={cn(
            "font-medium leading-snug break-words whitespace-normal transition-all duration-200",
            isCompleted && "line-through text-muted-foreground",
          )}
        >
          {task.title}
        </p>

        {repeatLabel && (
          <div className="flex min-w-0 items-start gap-1 mt-1">
            <Repeat className="mt-0.5 w-3 h-3 flex-shrink-0 text-muted-foreground" />
            <span className="min-w-0 flex-1 text-xs leading-snug text-muted-foreground break-words whitespace-normal">
              {repeatLabel}
            </span>
          </div>
        )}

        {task.repeat_type === 'none' && (
          <div className="flex min-w-0 items-start gap-1 mt-1">
            <Calendar className="mt-0.5 w-3 h-3 flex-shrink-0 text-muted-foreground" />
            <span className="min-w-0 flex-1 text-xs leading-snug text-muted-foreground break-words whitespace-normal">
              One-time
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-shrink-0 self-start gap-1">
        <EditTaskDialog task={task} onEdit={onEdit} />
        <DeleteTaskDialog
          task={task}
          onDeleteAll={onDeleteAll}
          onEndTask={onEndTask}
          onDeleteToday={onDeleteToday}
        />
      </div>
    </div>
  );
}
