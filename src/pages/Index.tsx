import { useState, useMemo, useEffect } from 'react';
import { startOfDay, startOfWeek, parseISO, format } from 'date-fns';
import { Loader2, Lock, Unlock, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { CalendarGrid } from '@/components/CalendarGrid';
import { TaskSidebar } from '@/components/TaskSidebar';
import { useTasks, useTaskCompletions, useTaskSkips, useAddTask, useDeleteTask, useToggleCompletion, useUpdateTask, useSkipTaskForDate, useReorderTasks, useEndTask } from '@/hooks/useTasks';
import { toast } from 'sonner';

const Index = () => {
  const { signOut } = useAuth();
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
  const endTask = useEndTask();

  useEffect(() => {
    if (tasksError) {
      toast.error('Failed to load tasks');
    }
  }, [tasksError]);

  // Calculate the earliest week we can scroll to
  const minWeekOffset = useMemo(() => {
    const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 });
    
    let earliestDate: Date | null = null;
    if (tasks.length > 0) {
      const taskDates = tasks.map(t => parseISO(t.start_date));
      earliestDate = taskDates.reduce((earliest, date) => 
        date < earliest ? date : earliest
      , taskDates[0]);
    }
    
    const minDefaultOffset = -6;
    
    if (earliestDate) {
      const earliestWeekStart = startOfWeek(earliestDate, { weekStartsOn: 1 });
      const weeksBack = Math.floor((currentWeekStart.getTime() - earliestWeekStart.getTime()) / (7 * 24 * 60 * 60 * 1000));
      return Math.min(minDefaultOffset, -(weeksBack + 3));
    }
    
    return minDefaultOffset;
  }, [tasks, today]);

  const canScrollBack = weekOffset > minWeekOffset;
  const canScrollForward = weekOffset < 0;

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

  const handleEndTask = (taskId: string) => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    endTask.mutate({ taskId, endDate: dateStr }, {
      onSuccess: () => toast.success('Future occurrences removed'),
      onError: () => toast.error('Failed to update task')
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
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
        <h1 className="text-xl font-bold">Task Calendar</h1>
        <div className="flex items-center gap-1">
          {!isCalendarLocked && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleChangeWeekOffset(weekOffset - 1)}
                disabled={!canScrollBack}
                className="h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleChangeWeekOffset(weekOffset + 1)}
                disabled={!canScrollForward}
                className="h-8 w-8"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleCalendarLock}
            className="h-8 w-8"
          >
            {isCalendarLocked ? (
              <Lock className="h-4 w-4" />
            ) : (
              <Unlock className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={signOut}
            className="h-8 w-8"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
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
                weekOffset={weekOffset}
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
              onEndTask={handleEndTask}
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