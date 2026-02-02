import { useMemo } from 'react';
import { addDays, startOfWeek, startOfDay, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CalendarDay } from './CalendarDay';
import { Task, TaskCompletion, TaskSkip, getDayProgress } from '@/hooks/useTasks';

interface CalendarGridProps {
  today: Date;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  tasks: Task[];
  completions: TaskCompletion[];
  skips: TaskSkip[];
  isLocked: boolean;
  onToggleLock: () => void;
  weekOffset: number;
  onChangeWeekOffset: (offset: number) => void;
}

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function CalendarGrid({ 
  today, 
  selectedDate, 
  onSelectDate, 
  tasks, 
  completions, 
  skips,
  isLocked,
  onToggleLock,
  weekOffset,
  onChangeWeekOffset,
}: CalendarGridProps) {
  // Calculate the earliest week we can scroll to
  const minWeekOffset = useMemo(() => {
    const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 });
    
    // Find earliest task start date
    let earliestDate: Date | null = null;
    if (tasks.length > 0) {
      const taskDates = tasks.map(t => parseISO(t.start_date));
      earliestDate = taskDates.reduce((earliest, date) => 
        date < earliest ? date : earliest
      , taskDates[0]);
    }
    
    // Minimum 6 weeks before current week (3 default + 3 extra)
    const minDefaultOffset = -6;
    
    if (earliestDate) {
      const earliestWeekStart = startOfWeek(earliestDate, { weekStartsOn: 1 });
      const weeksBack = Math.floor((currentWeekStart.getTime() - earliestWeekStart.getTime()) / (7 * 24 * 60 * 60 * 1000));
      // Allow scrolling to the week containing earliest task, with 3 weeks buffer before it
      return Math.min(minDefaultOffset, -(weeksBack + 3));
    }
    
    return minDefaultOffset;
  }, [tasks, today]);

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

  const canScrollBack = weekOffset > minWeekOffset;
  const canScrollForward = weekOffset < 0;

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Navigation Controls */}
      {!isLocked && (
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onChangeWeekOffset(weekOffset - 1)}
            disabled={!canScrollBack}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onChangeWeekOffset(weekOffset + 1)}
            disabled={!canScrollForward}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

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
