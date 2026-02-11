import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Task } from '@/hooks/useTasks';

interface DeleteTaskDialogProps {
  task: Task;
  onDeleteAll: () => void;
  onEndTask: () => void;
  onDeleteToday: () => void;
}

export function DeleteTaskDialog({ task, onDeleteAll, onEndTask, onDeleteToday }: DeleteTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const isRepeating = task.repeat_type !== 'none';

  const handleDeleteAll = () => {
    onDeleteAll();
    setOpen(false);
  };

  const handleEndTask = () => {
    onEndTask();
    setOpen(false);
  };

  const handleDeleteToday = () => {
    onDeleteToday();
    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Task</AlertDialogTitle>
          <AlertDialogDescription>
            {isRepeating
              ? "This is a repeating task. Would you like to delete it just for today, or delete all future occurrences?"
              : "Are you sure you want to delete this task? This action cannot be undone."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className={isRepeating ? "flex-col sm:flex-row gap-2" : ""}>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          {isRepeating ? (
            <>
              <Button variant="outline" onClick={handleDeleteToday}>
                Just Today
              </Button>
              <AlertDialogAction
                onClick={handleEndTask}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete All Future
              </AlertDialogAction>
            </>
          ) : (
            <AlertDialogAction
              onClick={handleDeleteAll}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
