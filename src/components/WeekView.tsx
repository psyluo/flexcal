import React from 'react';
import styled from 'styled-components';
import { format, isSameDay, parseISO } from 'date-fns';
import { CalendarEvent, TimeBlock, TimePosition } from '../types';
import EventItem from './EventItem';
import { HOUR_HEIGHT, HEADER_HEIGHT, MINUTES_SNAP } from '../constants';
import { useDroppable } from '@dnd-kit/core';

const WeekViewContainer = styled.div`
  flex: 1;
  overflow: hidden;
  position: relative;
`;

const HeaderRow = styled.div`
  display: grid;
  grid-template-columns: 60px repeat(7, 1fr);
  border-bottom: 1px solid #e0e0e0;
  background: white;
  position: sticky;
  top: 0;
  z-index: 3;
`;

const HeaderCell = styled.div`
  padding: 8px;
  text-align: center;
  border-right: 1px solid #e0e0e0;
  height: ${HEADER_HEIGHT}px;
  
  .day-name {
    font-weight: bold;
  }
  
  .date {
    font-size: 12px;
    color: #666;
  }
`;

const TimeGridContainer = styled.div`
  display: grid;
  grid-template-columns: 60px repeat(7, 1fr);
  min-height: ${24 * HOUR_HEIGHT}px;
  position: relative;
`;

const TimeColumn = styled.div`
  border-right: 1px solid #e0e0e0;
`;

const TimeSlot = styled.div`
  height: ${HOUR_HEIGHT / 2}px;
  padding: 0 8px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  color: #666;
  font-size: 12px;
`;

const DayColumn = styled.div`
  position: relative;
  border-right: 1px solid #e0e0e0;
  min-height: ${24 * HOUR_HEIGHT}px;
`;

const TimeBlockCell = styled.div<{ $isOver?: boolean }>`
  height: ${HOUR_HEIGHT / 2}px;
  background-color: ${props => props.$isOver ? 'rgba(0, 0, 0, 0.05)' : 'transparent'};
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;

  &:hover {
    background-color: rgba(0, 0, 0, 0.02);
  }
`;

interface WeekViewProps {
  events: CalendarEvent[];
  dates: Date[];
  onEditEvent: (event: CalendarEvent) => void;
  onCreateEvent: (date: Date, timeBlock?: TimeBlock) => void;
  onResizeEvent: (event: CalendarEvent, newStartTime?: string, newDuration?: number) => void;
}

const WeekView: React.FC<WeekViewProps> = ({
  events,
  dates,
  onEditEvent,
  onCreateEvent,
  onResizeEvent,
}) => {
  // 添加防重复标记
  const isCreating = React.useRef(false);

  // 生成48个半小时块
  const timeBlocks: TimePosition[] = Array.from({ length: 48 }, (_, index) => {
    // 每个时间块代表30分钟
    const totalMinutes = index * 30;
    // 计算小时和分钟
    const hour = Math.floor(totalMinutes / 60);
    const minute = totalMinutes % 60;
    // 确保分钟对齐到 MINUTES_SNAP
    const snappedMinute = Math.floor(minute / MINUTES_SNAP) * MINUTES_SNAP;
    
    return {
      hour,
      minute: snappedMinute,
      totalMinutes: hour * 60 + snappedMinute  // 使用对齐后的分钟重新计算总分钟数
    };
  });

  const formatTimeLabel = (block: TimeBlock): string => {
    const hour = block.hour.toString().padStart(2, '0');
    const minute = block.minute.toString().padStart(2, '0');
    return `${hour}:${minute}`;
  };

  const handleTimeBlockClick = (date: Date, timeBlock: TimeBlock) => {
    // 防止重复创建
    if (isCreating.current) return;
    isCreating.current = true;

    onCreateEvent?.(date, timeBlock);

    // 重置标记
    setTimeout(() => {
      isCreating.current = false;
    }, 100);
  };

  return (
    <WeekViewContainer>
      <TimeGridContainer>
        <TimeColumn>
          {timeBlocks.map((block) => (
            <TimeSlot key={block.totalMinutes}>
              {formatTimeLabel(block)}
            </TimeSlot>
          ))}
        </TimeColumn>
        
        {dates.map(date => (
          <DayColumn key={date.toISOString()}>
            {timeBlocks.map((block) => {
              const { setNodeRef, isOver } = useDroppable({
                id: `${format(date, 'yyyy-MM-dd')}-${block.hour}-${block.minute}`,
                data: {
                  type: 'scheduled',
                  date,
                  position: block
                }
              });

              // 计算实际的像素位置
              const top = block.totalMinutes * (HOUR_HEIGHT / 60);

              return (
                <TimeBlockCell
                  key={block.totalMinutes}
                  ref={setNodeRef}
                  $isOver={isOver}
                  onClick={() => handleTimeBlockClick(date, block)}
                  style={{
                    position: 'absolute',
                    top: `${top}px`,
                    left: 0,
                    right: 0
                  }}
                />
              );
            })}
            {events
              .filter(event => event.date && isSameDay(new Date(event.date), date))
              .map(event => (
                <EventItem 
                  key={event.id} 
                  event={event}
                  onEdit={onEditEvent}
                  onResize={onResizeEvent}
                />
              ))}
          </DayColumn>
        ))}
      </TimeGridContainer>
    </WeekViewContainer>
  );
};

export default WeekView; 