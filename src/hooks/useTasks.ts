import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, isAfter, isSameDay, getDay, parseISO, differenceInDays } from 'date-fns';

export interface Task {
  id: string;
  title: string;
  created_at: string;
  start_date: string;
  end_date: string | null;
  repeat_type: 'none' | 'daily' | 'weekly' | 'fortnightly';
  repeat_day: number | null;
  sort_order: number;
}

export interface TaskCompletion {
  id: string;
  task_id: string;
  completed_date: string;
  completed_at: string;
}

export interface TaskSkip {
  id: string;
  task_id: string;
  skipped_date: string;
  created_at: string;
}

export function useTasks() {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Task[];
    },
  });
}

export function useTaskCompletions() {
  return useQuery({
    queryKey: ['task_completions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('task_completions')
        .select('*');
      
      if (error) throw error;
      return data as TaskCompletion[];
    },
  });
}

export function useTaskSkips() {
  return useQuery({
    queryKey: ['task_skips'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('task_skips')
        .select('*');
      
      if (error) throw error;
      return data as TaskSkip[];
    },
  });
}

export function useSkipTaskForDate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ taskId, date }: { taskId: string; date: Date }) => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const { data, error } = await supabase
        .from('task_skips')
        .insert([{ task_id: taskId, skipped_date: dateStr }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task_skips'] });
    },
  });
}

export function useAddTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (task: {
      title: string;
      start_date: string;
      repeat_type: 'none' | 'daily' | 'weekly' | 'fortnightly';
      repeat_day?: number;
    }) => {
      const { data, error } = await supabase
        .from('tasks')
        .insert([task])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ taskId, updates }: {
      taskId: string;
      updates: {
        title: string;
        repeat_type: 'none' | 'daily' | 'weekly' | 'fortnightly';
        repeat_day?: number | null;
      };
    }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update({
          title: updates.title,
          repeat_type: updates.repeat_type,
          repeat_day: updates.repeat_day,
        })
        .eq('id', taskId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task_completions'] });
    },
  });
}

export function useEndTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ taskId, endDate }: { taskId: string; endDate: string }) => {
      const { error } = await supabase
        .from('tasks')
        .update({ end_date: endDate } as any)
        .eq('id', taskId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useReorderTasks() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (orderedTaskIds: string[]) => {
      // Update each task's sort_order based on its position
      const updates = orderedTaskIds.map((id, index) => 
        supabase
          .from('tasks')
          .update({ sort_order: index })
          .eq('id', id)
      );
      
      await Promise.all(updates);
    },
    onMutate: async (orderedTaskIds) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      
      const previousTasks = queryClient.getQueryData<Task[]>(['tasks']);
      
      // Optimistically update with new order
      queryClient.setQueryData<Task[]>(['tasks'], (old = []) => {
        const taskMap = new Map(old.map(t => [t.id, t]));
        return orderedTaskIds
          .map((id, index) => {
            const task = taskMap.get(id);
            if (task) return { ...task, sort_order: index };
            return null;
          })
          .filter((t): t is Task => t !== null);
      });
      
      return { previousTasks };
    },
    onError: (err, variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks'], context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useToggleCompletion() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ taskId, date, isCompleted }: { 
      taskId: string; 
      date: Date; 
      isCompleted: boolean;
    }) => {
      const dateStr = format(date, 'yyyy-MM-dd');
      
      if (isCompleted) {
        // Remove completion
        const { error } = await supabase
          .from('task_completions')
          .delete()
          .eq('task_id', taskId)
          .eq('completed_date', dateStr);
        
        if (error) throw error;
        return { action: 'removed', taskId, dateStr };
      } else {
        // Add completion
        const { data, error } = await supabase
          .from('task_completions')
          .insert([{ task_id: taskId, completed_date: dateStr }])
          .select()
          .single();
        
        if (error) throw error;
        return { action: 'added', taskId, dateStr, data };
      }
    },
    onMutate: async ({ taskId, date, isCompleted }) => {
      const dateStr = format(date, 'yyyy-MM-dd');
      
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['task_completions'] });
      
      // Snapshot previous value
      const previousCompletions = queryClient.getQueryData<TaskCompletion[]>(['task_completions']);
      
      // Optimistically update
      queryClient.setQueryData<TaskCompletion[]>(['task_completions'], (old = []) => {
        if (isCompleted) {
          // Remove the completion
          return old.filter(c => !(c.task_id === taskId && c.completed_date === dateStr));
        } else {
          // Add a temporary completion
          return [...old, {
            id: `temp-${Date.now()}`,
            task_id: taskId,
            completed_date: dateStr,
            completed_at: new Date().toISOString(),
          }];
        }
      });
      
      return { previousCompletions };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousCompletions) {
        queryClient.setQueryData(['task_completions'], context.previousCompletions);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['task_completions'] });
    },
  });
}

export function getTasksForDate(tasks: Task[], date: Date, today: Date, skips: TaskSkip[] = []): Task[] {
  const dateStr = format(date, 'yyyy-MM-dd');
  
  return tasks.filter(task => {
    // Check if task is skipped for this date
    const isSkipped = skips.some(s => s.task_id === task.id && s.skipped_date === dateStr);
    if (isSkipped) {
      return false;
    }
    
    const startDate = parseISO(task.start_date);
    
    // Task shouldn't appear before its start date (recurring tasks only go forward)
    if (isAfter(startDate, date) && !isSameDay(startDate, date)) {
      return false;
    }

    // Task shouldn't appear on or after its end date
    if (task.end_date) {
      const endDate = parseISO(task.end_date);
      if (isAfter(date, endDate) || isSameDay(date, endDate)) {
        return false;
      }
    }
    
    // Non-repeating tasks only show on their start date
    if (task.repeat_type === 'none') {
      return isSameDay(startDate, date);
    }
    
    // Daily tasks show every day from start date onwards
    if (task.repeat_type === 'daily') {
      return true;
    }
    
    // Weekly tasks show on matching day of week from start date onwards
    if (task.repeat_type === 'weekly' && task.repeat_day !== null) {
      return getDay(date) === task.repeat_day;
    }
    
    // Fortnightly tasks show every 14 days from start date
    if (task.repeat_type === 'fortnightly') {
      const daysDiff = differenceInDays(date, startDate);
      return daysDiff >= 0 && daysDiff % 14 === 0;
    }
    
    return false;
  });
}

export interface DayProgress {
  status: 'none' | 'complete' | 'partial' | 'incomplete' | 'future';
  total: number;
  completed: number;
  progress: number; // 0 to 1
}

export function getDayProgress(
  tasks: Task[], 
  completions: TaskCompletion[], 
  date: Date,
  today: Date,
  skips: TaskSkip[] = []
): DayProgress {
  const dayTasks = getTasksForDate(tasks, date, today, skips);
  
  if (dayTasks.length === 0) {
    return { status: 'none', total: 0, completed: 0, progress: 0 };
  }
  
  // Future dates with tasks
  if (isAfter(date, today) && !isSameDay(date, today)) {
    return { status: 'future', total: dayTasks.length, completed: 0, progress: 0 };
  }
  
  const dateStr = format(date, 'yyyy-MM-dd');
  const completedCount = dayTasks.filter(task => 
    completions.some(c => c.task_id === task.id && c.completed_date === dateStr)
  ).length;
  
  const progress = dayTasks.length > 0 ? completedCount / dayTasks.length : 0;
  
  let status: 'none' | 'complete' | 'partial' | 'incomplete' | 'future';
  if (completedCount === 0) status = 'incomplete';
  else if (completedCount === dayTasks.length) status = 'complete';
  else status = 'partial';
  
  return { status, total: dayTasks.length, completed: completedCount, progress };
}

export function getCompletionStatus(
  tasks: Task[], 
  completions: TaskCompletion[], 
  date: Date,
  today: Date,
  skips: TaskSkip[] = []
): 'none' | 'complete' | 'partial' | 'incomplete' | 'future' {
  return getDayProgress(tasks, completions, date, today, skips).status;
}
