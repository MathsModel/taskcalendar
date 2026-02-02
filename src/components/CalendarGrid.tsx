import { useMemo } from 'react';
import { addDays, startOfWeek, startOfDay } from 'date-fns';
import { CalendarDay } from './CalendarDay';
import { Task, TaskCompletion, TaskSkip, getDayProgress } from '@/hooks/useTasks';

interface CalendarGridProps {
  today: Date;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  tasks: Task[];
  completions: TaskCompletion[];
  skips: TaskSkip[];
  weekOffset: number;
}

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function CalendarGrid({ 
  today, 
  selectedDate, 
  onSelectDate, 
  tasks, 
  completions, 
  skips,
  weekOffset,
}: CalendarGridProps) {
  const days = useMemo(() => {
    // Get the Monday of the current week
    const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 });
    
    // Apply week offset and go back 3 weeks from that position
    const offsetWeekStart = addDays(currentWeekStart, weekOffset * 7);
    const gridStart = addDays(offsetWeekStart, -21); // 3 weeks before the offset position
    
    const result: Date[] = [];
    for (let i = 0; i < 42; i++) {
      result.push(startOfDay(addDays(gridStart, i)));
    }
    
    return result;
  }, [today, weekOffset]);

  return (
    <div className="p-6 h-full flex flex-col">

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-3 mb-3">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide py-2"
          >
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-3 flex-1">
        {days.map((date, index) => {
          const dayProgress = getDayProgress(tasks, completions, date, today, skips);
          const isSelected = date.getTime() === selectedDate.getTime();
          
          return (
            <CalendarDay
              key={index}
              date={date}
              status={dayProgress.status}
              progress={dayProgress.progress}
              isSelected={isSelected}
              onClick={() => onSelectDate(date)}
            />
          );
        })}
      </div>
    </div>
  );
}
