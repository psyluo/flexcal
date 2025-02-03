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
import { CalendarEvent } from '../types';
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
  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: '1',
      title: 'Meeting with Team',
      date: new Date(),
      startTime: '10:00',
      duration: 60,
      type: 'scheduled'
    },
    {
      id: '2',
      title: 'Lunch Break',
      date: new Date(),
      startTime: '12:00',
      duration: 60,
      type: 'scheduled'
    },
    {
      id: '3',
      title: 'Review PR',
      date: new Date(),
      type: 'pool'
    }
  ]);
  const [currentDate] = useState(new Date());
  const [activeEvent, setActiveEvent] = useState<CalendarEvent | null>(null);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveEvent(active.data.current?.event);
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
    setActiveEvent(null);
    const { active, over } = event;
    
    if (!over) return;

    const draggedEvent = active.data.current?.event as CalendarEvent;
    const targetDate = over.data.current?.date as Date;
    const targetType = over.data.current?.type as 'pool' | 'scheduled';

    if (draggedEvent && targetDate) {
      const newEvent = { ...draggedEvent, date: targetDate, type: targetType };
      
      if (targetType === 'scheduled') {
        const element = document.querySelector(`[data-id="${over.id}"]`);
        
        if (element) {
          // 获取时间网格容器
          const timeGridContainer = element.closest('.time-grid-container');
          if (timeGridContainer) {
            // 获取鼠标相对于时间网格容器的位置
            const containerRect = timeGridContainer.getBoundingClientRect();
            const scrollTop = timeGridContainer.scrollTop;
            
            // 计算Y坐标（减去头部高度）
            const y = event.activatorEvent.clientY - containerRect.top + scrollTop;
            
            // 转换为小时
            const hours = Math.floor(y / HOUR_HEIGHT);
            // 转换为分钟
            const minutes = Math.floor((y % HOUR_HEIGHT) / HOUR_HEIGHT * 60);
            // 对齐到30分钟
            const alignedMinutes = Math.round(minutes / 30) * 30;
            
            // 格式化时间
            const formattedHours = hours.toString().padStart(2, '0');
            const formattedMinutes = alignedMinutes.toString().padStart(2, '0');
            
            newEvent.startTime = `${formattedHours}:${formattedMinutes}`;
            newEvent.duration = draggedEvent.duration || 60;
            
            console.log('Time calculation:', {
              mouseY: event.activatorEvent.clientY,
              containerTop: containerRect.top,
              scrollTop,
              y,
              hours,
              minutes,
              alignedMinutes,
              finalTime: newEvent.startTime
            });
          }
        }
      } else {
        delete newEvent.startTime;
        delete newEvent.duration;
      }

      setEvents(prevEvents => 
        prevEvents.map(evt => 
          evt.id === draggedEvent.id ? newEvent : evt
        )
      );
    }
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
        <DragOverlay dropAnimation={{
          sideEffects: defaultDropAnimationSideEffects({
            styles: {
              active: {
                opacity: '0.5'
              }
            }
          })
        }}>
          {activeEvent ? (
            <EventItem 
              event={activeEvent}
              isPool={activeEvent.type === 'pool'}
            />
          ) : null}
        </DragOverlay>
      </CalendarContainer>
    </DndContext>
  );
};

export default Calendar; 