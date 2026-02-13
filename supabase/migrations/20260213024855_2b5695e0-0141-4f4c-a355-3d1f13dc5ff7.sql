
-- Add user_id to tasks
ALTER TABLE public.tasks ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
DELETE FROM public.tasks WHERE user_id IS NULL;
ALTER TABLE public.tasks ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.tasks ALTER COLUMN user_id SET DEFAULT auth.uid();

-- Add user_id to task_completions
ALTER TABLE public.task_completions ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
DELETE FROM public.task_completions WHERE user_id IS NULL;
ALTER TABLE public.task_completions ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.task_completions ALTER COLUMN user_id SET DEFAULT auth.uid();

-- Add user_id to task_skips
ALTER TABLE public.task_skips ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
DELETE FROM public.task_skips WHERE user_id IS NULL;
ALTER TABLE public.task_skips ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.task_skips ALTER COLUMN user_id SET DEFAULT auth.uid();

-- Replace RLS policies on tasks
DROP POLICY IF EXISTS "Anyone can create tasks" ON public.tasks;
DROP POLICY IF EXISTS "Anyone can delete tasks" ON public.tasks;
DROP POLICY IF EXISTS "Anyone can update tasks" ON public.tasks;
DROP POLICY IF EXISTS "Anyone can view tasks" ON public.tasks;

CREATE POLICY "Users can view own tasks" ON public.tasks FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can create own tasks" ON public.tasks FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own tasks" ON public.tasks FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete own tasks" ON public.tasks FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Replace RLS policies on task_completions
DROP POLICY IF EXISTS "Anyone can create completions" ON public.task_completions;
DROP POLICY IF EXISTS "Anyone can delete completions" ON public.task_completions;
DROP POLICY IF EXISTS "Anyone can view completions" ON public.task_completions;

CREATE POLICY "Users can view own completions" ON public.task_completions FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can create own completions" ON public.task_completions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own completions" ON public.task_completions FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Replace RLS policies on task_skips
DROP POLICY IF EXISTS "Anyone can create skips" ON public.task_skips;
DROP POLICY IF EXISTS "Anyone can delete skips" ON public.task_skips;
DROP POLICY IF EXISTS "Anyone can view skips" ON public.task_skips;

CREATE POLICY "Users can view own skips" ON public.task_skips FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can create own skips" ON public.task_skips FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own skips" ON public.task_skips FOR DELETE TO authenticated USING (user_id = auth.uid());
