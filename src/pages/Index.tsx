import { useState, useMemo, useEffect } from 'react';
import { startOfDay } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { CalendarGrid } from '@/components/CalendarGrid';
import { TaskSidebar } from '@/components/TaskSidebar';
import { useTasks, useTaskCompletions, useTaskSkips, useAddTask, useDeleteTask, useToggleCompletion, useUpdateTask, useSkipTaskForDate, useReorderTasks } from '@/hooks/useTasks';
import { toast } from 'sonner';

const Index = () => {
  const today = useMemo(() => startOfDay(new Date()), []);
  const [selectedDate, setSelectedDate] = useState(today);
  const [isCalendarLocked, setIsCalendarLocked] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);
  const {
    data: tasks = [],
    isLoading: tasksLoading,
    error: tasksError
  } = useTasks();
  const {
    data: completions = [],
    isLoading: completionsLoading
  } = useTaskCompletions();
  const {
    data: skips = [],
    isLoading: skipsLoading
  } = useTaskSkips();
  const addTask = useAddTask();
  const deleteTask = useDeleteTask();
  const toggleCompletion = useToggleCompletion();
  const updateTask = useUpdateTask();
  const skipTask = useSkipTaskForDate();
  const reorderTasks = useReorderTasks();

  useEffect(() => {
    if (tasksError) {
      toast.error('Failed to load tasks');
    }
  }, [tasksError]);

  const handleAddTask = (task: {
    title: string;
    start_date: string;
    repeat_type: 'none' | 'daily' | 'weekly' | 'fortnightly';
    repeat_day?: number;
  }) => {
    addTask.mutate(task, {
      onSuccess: () => toast.success('Task added'),
      onError: () => toast.error('Failed to add task')
    });
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTask.mutate(taskId, {
      onSuccess: () => toast.success('Task deleted'),
      onError: () => toast.error('Failed to delete task')
    });
  };

  const handleSkipTaskForToday = (taskId: string) => {
    skipTask.mutate({ taskId, date: selectedDate }, {
      onSuccess: () => toast.success('Task skipped for today'),
      onError: () => toast.error('Failed to skip task')
    });
  };

  const handleEditTask = (taskId: string, updates: {
    title: string;
    repeat_type: 'none' | 'daily' | 'weekly' | 'fortnightly';
    repeat_day?: number | null;
  }) => {
    updateTask.mutate({ taskId, updates }, {
      onSuccess: () => toast.success('Task updated'),
      onError: () => toast.error('Failed to update task')
    });
  };

  const handleToggleCompletion = (taskId: string, isCompleted: boolean) => {
    toggleCompletion.mutate({
      taskId,
      date: selectedDate,
      isCompleted
    }, {
      onError: () => toast.error('Failed to update task')
    });
  };

  const handleReorderTasks = (orderedTaskIds: string[]) => {
    reorderTasks.mutate(orderedTaskIds, {
      onError: () => toast.error('Failed to reorder tasks')
    });
  };

  const handleToggleCalendarLock = () => {
    if (!isCalendarLocked) {
      // When locking, reset to default view
      setWeekOffset(0);
    }
    setIsCalendarLocked(!isCalendarLocked);
  };

  const handleChangeWeekOffset = (offset: number) => {
    setWeekOffset(offset);
  };

  const isLoading = tasksLoading || completionsLoading || skipsLoading;

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex items-center gap-3 px-6 py-4 border-b border-border bg-card">
        <div>
          <h1 className="text-xl font-bold">Task Calendar</h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Calendar Section */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
          {/* Calendar Grid */}
          <div className="flex-1 overflow-auto bg-card">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <CalendarGrid
                today={today}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                tasks={tasks}
                completions={completions}
                skips={skips}
                isLocked={isCalendarLocked}
                onToggleLock={handleToggleCalendarLock}
                weekOffset={weekOffset}
                onChangeWeekOffset={handleChangeWeekOffset}
              />
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 sm:w-96 flex-shrink-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-full bg-sidebar">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <TaskSidebar
              selectedDate={selectedDate}
              today={today}
              tasks={tasks}
              completions={completions}
              skips={skips}
              onAddTask={handleAddTask}
              onToggleCompletion={handleToggleCompletion}
              onDeleteTask={handleDeleteTask}
              onSkipTaskForToday={handleSkipTaskForToday}
              onEditTask={handleEditTask}
              onReorderTasks={handleReorderTasks}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;