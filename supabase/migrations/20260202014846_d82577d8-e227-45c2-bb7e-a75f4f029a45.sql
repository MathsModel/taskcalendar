-- Add sort_order column to tasks table for drag-and-drop reordering
ALTER TABLE public.tasks 
ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0;