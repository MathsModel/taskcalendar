import { format, isSameDay, isAfter } from 'date-fns';
import { CalendarDays, CheckCircle2, ListTodo } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SortableTaskList } from './SortableTaskList';
import { AddTaskDialog } from './AddTaskDialog';
import { Task, TaskCompletion, TaskSkip, getTasksForDate } from '@/hooks/useTasks';

interface TaskSidebarProps {
  selectedDate: Date;
  today: Date;
  tasks: Task[];
  completions: TaskCompletion[];
  skips: TaskSkip[];
  onAddTask: (task: {
    title: string;
    start_date: string;
    repeat_type: 'none' | 'daily' | 'weekly' | 'fortnightly';
    repeat_day?: number;
  }) => void;
  onToggleCompletion: (taskId: string, isCompleted: boolean) => void;
  onDeleteTask: (taskId: string) => void;
  onEndTask: (taskId: string) => void;
  onSkipTaskForToday: (taskId: string) => void;
  onEditTask: (taskId: string, updates: {
    title: string;
    repeat_type: 'none' | 'daily' | 'weekly' | 'fortnightly';
    repeat_day?: number | null;
  }) => void;
  onReorderTasks: (orderedTaskIds: string[]) => void;
}

export function TaskSidebar({
  selectedDate,
  today,
  tasks,
  completions,
  skips,
  onAddTask,
  onToggleCompletion,
  onDeleteTask,
  onEndTask,
  onSkipTaskForToday,
  onEditTask,
  onReorderTasks,
}: TaskSidebarProps) {
  const dayTasks = getTasksForDate(tasks, selectedDate, today, skips);
  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  
  const completedCount = dayTasks.filter(task =>
    completions.some(c => c.task_id === task.id && c.completed_date === dateStr)
  ).length;

  const isToday = isSameDay(selectedDate, today);
  const isPast = isAfter(today, selectedDate) && !isToday;
  const isFuture = isAfter(selectedDate, today);

  return (
    <div className="flex flex-col h-full bg-sidebar border-l border-sidebar-border">
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-2 mb-2">
          <CalendarDays className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">
            {isToday ? 'Today' : format(selectedDate, 'EEEE')}
          </h2>
        </div>
        <p className="text-muted-foreground">
          {format(selectedDate, 'MMMM d, yyyy')}
        </p>
        
        {dayTasks.length > 0 && (
          <div className="flex items-center gap-2 mt-4 p-3 bg-muted rounded-lg">
            <CheckCircle2 className="w-4 h-4 text-task-complete-border" />
            <span className="text-sm">
              {completedCount} of {dayTasks.length} completed
            </span>
          </div>
        )}
      </div>

      {/* Tasks List */}
      <ScrollArea className="flex-1 p-4 overflow-x-hidden">
        {dayTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ListTodo className="w-12 h-12 text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground text-sm">
              No tasks for this day
            </p>
            {!isPast && (
              <p className="text-muted-foreground/70 text-xs mt-1">
                Add a task to get started
              </p>
            )}
          </div>
        ) : (
          <SortableTaskList
            tasks={dayTasks}
            completions={completions}
            dateStr={dateStr}
            isFuture={isFuture}
            isPast={isPast}
            onToggleCompletion={onToggleCompletion}
            onDeleteAll={onDeleteTask}
            onEndTask={onEndTask}
            onDeleteToday={onSkipTaskForToday}
            onEdit={onEditTask}
            onReorder={onReorderTasks}
            allTasks={tasks}
          />
        )}
      </ScrollArea>

      {/* Add Task Button */}
      {!isPast && (
        <div className="p-4 border-t border-sidebar-border">
          <AddTaskDialog selectedDate={selectedDate} onAdd={onAddTask} />
        </div>
      )}
    </div>
  );
}
