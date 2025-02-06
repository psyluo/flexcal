import React from 'react';
import styled from 'styled-components';
import { format, isSameDay, parseISO } from 'date-fns';
import { CalendarEvent, TimeBlock } from '../types';
import EventItem from './EventItem';
import { HOUR_HEIGHT, HEADER_HEIGHT } from '../constants';
import { useDroppable } from '@dnd-kit/core';

const WeekViewContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
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
  flex: 1;
  position: relative;
  overflow-y: auto;
`;

const TimeColumn = styled.div`
  border-right: 1px solid #e0e0e0;
`;

const DayColumn = styled.div<{ $isOver?: boolean }>`
  border-right: 1px solid #e0e0e0;
  min-height: ${HOUR_HEIGHT * 24}px;
  position: relative;
  box-sizing: border-box;
  background-color: ${props => props.$isOver ? '#f5f5f5' : 'transparent'};
  transition: background-color 0.2s;
`;

const TimeSlot = styled.div`
  height: ${HOUR_HEIGHT / 2}px;
  box-sizing: border-box;
  border-bottom: 1px dashed #f0f0f0;
  padding: 2px 8px;
  font-size: 12px;
  color: #666;
  position: relative;
  display: flex;
  align-items: center;
`;

const TimeMarker = styled.div<{ $top: number; color?: string }>`
  position: absolute;
  left: 0;
  right: 0;
  top: ${props => props.$top * HOUR_HEIGHT}px; // 使用小时数乘以HOUR_HEIGHT
  height: 2px;
  background-color: ${props => props.color || 'red'};
  opacity: 0.5;
  z-index: 2;
`;

const TimeBlockCell = styled.div<{ $isOver?: boolean }>`
  height: ${HOUR_HEIGHT / 2}px;
  box-sizing: border-box;
  border-bottom: 1px dashed #f0f0f0;
  position: relative;
  background-color: ${props => props.$isOver ? '#f5f5f5' : 'transparent'};
  transition: background-color 0.2s;
  padding: 0;
  margin: 0;
  z-index: 1;
  cursor: pointer;

  &:hover {
    background-color: #f8f8f8;
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
  // 生成48个半小时块
  const timeBlocks: TimeBlock[] = Array.from({ length: 48 }, (_, index) => ({
    hour: Math.floor(index / 2),
    minute: (index % 2) * 30
  }));

  // 格式化时间显示
  const formatTimeLabel = (block: TimeBlock): string => {
    const hour = block.hour.toString().padStart(2, '0');
    const minute = block.minute.toString().padStart(2, '0');
    return `${hour}:${minute}`;
  };

  const handleTimeBlockClick = (date: Date, block: TimeBlock) => {
    onCreateEvent(date, block);
  };

  return (
    <WeekViewContainer>
      <TimeGridContainer>
        <TimeColumn>
          {timeBlocks.map((block, index) => (
            <TimeSlot key={index}>
              {formatTimeLabel(block)}
            </TimeSlot>
          ))}
        </TimeColumn>
        
        {dates.map(date => (
          <DayColumn key={date.toISOString()}>
            {timeBlocks.map((block, index) => {
              const { setNodeRef, isOver } = useDroppable({
                id: `${date.toISOString()}-${block.hour}-${block.minute}`,
                data: {
                  date,
                  type: 'scheduled',
                  timeBlock: block,
                  blockIndex: index
                }
              });

              return (
                <TimeBlockCell
                  key={index}
                  ref={setNodeRef}
                  $isOver={isOver}
                  data-hour={block.hour}
                  data-minute={block.minute}
                  data-index={index}
                  onClick={() => handleTimeBlockClick(date, block)}
                  style={{
                    position: 'absolute',
                    top: `${index * (HOUR_HEIGHT / 2)}px`,
                    left: 0,
                    right: 0,
                    pointerEvents: 'all'
                  }}
                />
              );
            })}
            {events
              .filter(event => isSameDay(new Date(event.date), date))
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