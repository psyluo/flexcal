import React, { useState } from 'react';
import styled from 'styled-components';
import { startOfWeek, addDays, format } from 'date-fns';
import { 
  DndContext, 
  DragEndEvent,
  DragOverlay,
  defaultDropAnimationSideEffects,
  DragStartEvent,
  DragMoveEvent,
} from '@dnd-kit/core';
import { CalendarEvent, TimeBlock } from '../types';
import WeekView from './WeekView';
import PoolRow from './PoolRow';
import EventItem from './EventItem';
import { POOL_HEIGHT, HOUR_HEIGHT, MINUTES_SNAP } from '../constants';

export const HEADER_HEIGHT = 50; // 日期行高度

const CalendarContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
`;

const PoolContainer = styled.div`
  display: grid;
  grid-template-columns: 60px repeat(7, 1fr);
  border-bottom: 2px solid #e0e0e0;
  height: ${POOL_HEIGHT}px;
  min-height: ${POOL_HEIGHT}px;
`;

const Calendar: React.FC = () => {
  // 确保使用本地时间
  const today = new Date();
  const [currentDate] = useState(today);
  
  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: '1',
      title: 'Meeting with Team',
      date: today, // 使用同一个时间对象
      startTime: '10:00',
      duration: 60,
      type: 'scheduled'
    },
    {
      id: '2',
      title: 'Lunch Break',
      date: today,
      startTime: '12:00',
      duration: 60,
      type: 'scheduled'
    },
    {
      id: '3',
      title: 'Review PR',
      date: today,
      type: 'pool'
    }
  ]);
  const [activeEvent, setActiveEvent] = useState<CalendarEvent | null>(null);

  // 使用 weekStartsOn 确保周一开始
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const draggedEvent = active.data.current?.event;
    setActiveEvent(draggedEvent);
  };

  const snapToGrid = (minutes: number): number => {
    const snapTo = MINUTES_SNAP;
    return Math.round(minutes / snapTo) * snapTo;
  };

  const getTimeFromYPosition = (y: number): string => {
    // 每小时60px，直接用像素值计算分钟
    const totalMinutes = Math.floor(y);
    const snappedMinutes = snapToGrid(totalMinutes);
    const hours = Math.floor(snappedMinutes / 60);
    const minutes = snappedMinutes % 60;
    
    // 添加调试信息
    console.log('Time calculation:', {
      y,
      totalMinutes,
      snappedMinutes,
      hours,
      minutes
    });
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveEvent(null);
      return; // 如果没有有效的放置位置，直接返回，保持原始事件
    }

    const draggedEvent = active.data.current?.event as CalendarEvent;
    const targetDate = over.data.current?.date as Date;
    const targetType = over.data.current?.type as 'pool' | 'scheduled';
    const timeBlock = over.data.current?.timeBlock as TimeBlock;

    if (draggedEvent && targetDate) {
      const newEvent = { 
        ...draggedEvent, 
        date: new Date(targetDate),
        type: targetType 
      };
      
      if (targetType === 'scheduled' && timeBlock) {
        newEvent.startTime = `${timeBlock.hour.toString().padStart(2, '0')}:${timeBlock.minute.toString().padStart(2, '0')}`;
        newEvent.duration = draggedEvent.duration || 30;
      } else {
        delete newEvent.startTime;
        delete newEvent.duration;
      }

      // 更新事件列表，替换原始事件
      setEvents(prevEvents => 
        prevEvents.map(evt => 
          evt.id === draggedEvent.id ? newEvent : evt
        )
      );
    }
    
    setActiveEvent(null);
  };

  return (
    <DndContext 
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <CalendarContainer>
        <PoolRow 
          events={events.filter(e => e.type === 'pool')}
          dates={weekDays}
        />
        <WeekView 
          events={events.filter(e => e.type === 'scheduled')}
          dates={weekDays}
        />
        <DragOverlay>
          {activeEvent && (
            <EventItem 
              event={activeEvent}
              isPool={activeEvent.type === 'pool'}
              isDragging={true}
            />
          )}
        </DragOverlay>
      </CalendarContainer>
    </DndContext>
  );
};

export default Calendar; 