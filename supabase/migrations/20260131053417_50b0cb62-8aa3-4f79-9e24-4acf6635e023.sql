-- Allow newly added repeat type
ALTER TABLE public.tasks
  DROP CONSTRAINT IF EXISTS tasks_repeat_type_check;

ALTER TABLE public.tasks
  ADD CONSTRAINT tasks_repeat_type_check
  CHECK (repeat_type IN ('none', 'daily', 'weekly', 'fortnightly'));
