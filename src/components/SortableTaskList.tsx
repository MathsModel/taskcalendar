import { useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableTaskItem } from './SortableTaskItem';
import { Task, TaskCompletion } from '@/hooks/useTasks';

interface SortableTaskListProps {
  tasks: Task[];
  completions: TaskCompletion[];
  dateStr: string;
  isFuture: boolean;
  isPast: boolean;
  onToggleCompletion: (taskId: string, isCompleted: boolean) => void;
  onDeleteAll: (taskId: string) => void;
  onEndTask: (taskId: string) => void;
  onDeleteToday: (taskId: string) => void;
  onEdit: (taskId: string, updates: {
    title: string;
    repeat_type: 'none' | 'daily' | 'weekly' | 'fortnightly';
    repeat_day?: number | null;
  }) => void;
  onReorder: (orderedTaskIds: string[]) => void;
  allTasks: Task[];
}

export function SortableTaskList({
  tasks,
  completions,
  dateStr,
  isFuture,
  isPast,
  onToggleCompletion,
  onDeleteAll,
  onEndTask,
  onDeleteToday,
  onEdit,
  onReorder,
  allTasks,
}: SortableTaskListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const taskIds = useMemo(() => tasks.map(t => t.id), [tasks]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = tasks.findIndex(t => t.id === active.id);
      const newIndex = tasks.findIndex(t => t.id === over.id);
      
      // Reorder the day's tasks
      const reorderedDayTasks = arrayMove(tasks, oldIndex, newIndex);
      
      // Build the full ordered list: tasks not in today's view stay in place,
      // today's tasks get their new positions
      const dayTaskIds = new Set(tasks.map(t => t.id));
      const otherTasks = allTasks.filter(t => !dayTaskIds.has(t.id));
      
      // Merge: put day tasks at their current positions relative to all tasks
      const allOrderedIds = [...reorderedDayTasks, ...otherTasks]
        .sort((a, b) => {
          // Day tasks use their new order, others keep original
          const aIndex = reorderedDayTasks.findIndex(t => t.id === a.id);
          const bIndex = reorderedDayTasks.findIndex(t => t.id === b.id);
          if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
          return a.sort_order - b.sort_order;
        })
        .map(t => t.id);
      
      onReorder(allOrderedIds);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-2 w-full">
          {tasks.map(task => {
            const isCompleted = completions.some(
              c => c.task_id === task.id && c.completed_date === dateStr
            );
            return (
              <SortableTaskItem
                key={task.id}
                task={task}
                isCompleted={isCompleted}
                onToggle={() => onToggleCompletion(task.id, isCompleted)}
                onDeleteAll={() => onDeleteAll(task.id)}
                onEndTask={() => onEndTask(task.id)}
                onDeleteToday={() => onDeleteToday(task.id)}
                onEdit={onEdit}
                canComplete={!isFuture}
                isPast={isPast}
              />
            );
          })}
        </div>
      </SortableContext>
    </DndContext>
  );
}
