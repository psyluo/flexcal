import React from 'react';
import styled from 'styled-components';
import { format, isSameDay } from 'date-fns';
import { CalendarEvent } from '../types';
import EventItem from './EventItem';
import { HOUR_HEIGHT, HEADER_HEIGHT } from '../constants';
import { useDroppable } from '@dnd-kit/core';

const WeekViewContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

const HeaderRow = styled.div`
  display: grid;
  grid-template-columns: 60px repeat(7, 1fr);
  border-bottom: 1px solid #e0e0e0;
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
  height: ${HOUR_HEIGHT}px;
  box-sizing: border-box; // 确保边框和内边距包含在高度内
  border-bottom: 1px solid #f0f0f0;
  padding: 4px 8px;
  font-size: 12px;
  color: #666;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    left: 60px;
    right: 0;
    top: 0;
    border-top: 1px solid #f0f0f0;
    z-index: 1;
  }
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

interface WeekViewProps {
  events: CalendarEvent[];
  dates: Date[];
}

const WeekView: React.FC<WeekViewProps> = ({ events, dates }) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <WeekViewContainer>
      <HeaderRow>
        <HeaderCell />
        {dates.map(date => (
          <HeaderCell key={date.toISOString()}>
            <div className="day-name">{format(date, 'EEE')}</div>
            <div className="date">{format(date, 'MM/dd')}</div>
          </HeaderCell>
        ))}
      </HeaderRow>
      
      <TimeGridContainer className="time-grid-container">
        <TimeColumn>
          {hours.map(hour => (
            <TimeSlot key={hour}>
              {`${hour.toString().padStart(2, '0')}:00`}
            </TimeSlot>
          ))}
        </TimeColumn>
        
        {dates.map(date => {
          const dropId = `day-${date.toISOString()}`;
          const { setNodeRef, isOver } = useDroppable({
            id: dropId,
            data: {
              date,
              type: 'scheduled'
            }
          });

          const handleRef = (node: HTMLDivElement | null) => {
            setNodeRef(node);
            if (node) {
              // 获取时间网格容器
              const timeGridContainer = node.closest('.time-grid-container');
              const timeGridRect = timeGridContainer?.getBoundingClientRect() || { top: 0, left: 0 };
              const rect = node.getBoundingClientRect();
              
              node.dataset.id = dropId;
              node.dataset.rect = JSON.stringify({
                // 存储相对于时间网格的位置
                gridTop: timeGridRect.top,
                columnTop: rect.top,
                height: rect.height
              });
            }
          };

          return (
            <DayColumn 
              key={date.toISOString()} 
              ref={handleRef}
              $isOver={isOver}
            >
              <TimeMarker $top={0} color="red" /> {/* 0小时 */}
              <TimeMarker $top={1} color="green" /> {/* 1小时 */}
              {events
                .filter(event => isSameDay(new Date(event.date), date))
                .map(event => (
                  <EventItem 
                    key={event.id} 
                    event={event}
                  />
                ))}
            </DayColumn>
          );
        })}
      </TimeGridContainer>
    </WeekViewContainer>
  );
};

export default WeekView; 