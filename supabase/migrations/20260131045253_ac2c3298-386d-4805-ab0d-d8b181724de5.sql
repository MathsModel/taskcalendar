-- Tasks table for storing task definitions
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  start_date DATE NOT NULL,
  repeat_type TEXT NOT NULL DEFAULT 'none' CHECK (repeat_type IN ('none', 'daily', 'weekly')),
  repeat_day INTEGER CHECK (repeat_day >= 0 AND repeat_day <= 6) -- 0=Sunday, 6=Saturday
);

-- Task completions table for tracking which tasks are done on which dates
CREATE TABLE public.task_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  completed_date DATE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(task_id, completed_date)
);

-- Enable Row Level Security (open access since no auth)
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_completions ENABLE ROW LEVEL SECURITY;

-- Public read/write access for tasks (no auth required)
CREATE POLICY "Anyone can view tasks" ON public.tasks FOR SELECT USING (true);
CREATE POLICY "Anyone can create tasks" ON public.tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update tasks" ON public.tasks FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete tasks" ON public.tasks FOR DELETE USING (true);

-- Public read/write access for completions
CREATE POLICY "Anyone can view completions" ON public.task_completions FOR SELECT USING (true);
CREATE POLICY "Anyone can create completions" ON public.task_completions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete completions" ON public.task_completions FOR DELETE USING (true);

-- Index for faster date queries
CREATE INDEX idx_task_completions_date ON public.task_completions(completed_date);
CREATE INDEX idx_tasks_start_date ON public.tasks(start_date);