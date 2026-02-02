-- Create a table for tracking skipped task occurrences
CREATE TABLE public.task_skips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  skipped_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(task_id, skipped_date)
);

-- Enable Row Level Security
ALTER TABLE public.task_skips ENABLE ROW LEVEL SECURITY;

-- Create policies for task_skips
CREATE POLICY "Anyone can view skips" 
ON public.task_skips 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create skips" 
ON public.task_skips 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can delete skips" 
ON public.task_skips 
FOR DELETE 
USING (true);