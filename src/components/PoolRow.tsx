import React from 'react';
import styled from 'styled-components';
import { isSameDay } from 'date-fns';
import { CalendarEvent } from '../types';
import EventItem from './EventItem';
import { useDroppable } from '@dnd-kit/core';
import { POOL_HEIGHT } from '../constants';

const PoolContainer = styled.div`
  display: grid;
  grid-template-columns: 60px repeat(7, 1fr);
  min-height: ${POOL_HEIGHT}px;
  height: auto;
  border-bottom: 1px solid #e0e0e0;
  background-color: #fafaf8;
`;

const TimeCell = styled.div`
  padding: 8px;
  border-right: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  background-color: #fafaf8;
`;

const PoolTitle = styled.div`
  font-weight: 500;
  font-size: 16px;
`;

const PoolCell = styled.div<{ $isOver?: boolean }>`
  border-right: 1px solid #e0e0e0;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: ${POOL_HEIGHT}px;
  height: auto;
  background-color: ${props => props.$isOver ? 
    'rgba(234, 238, 233, 0.5)' : 
    'transparent'
  };
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(234, 238, 233, 0.3);
  }
`;

interface PoolRowProps {
  events: CalendarEvent[];
  dates: Date[];
  onEditEvent: (event: CalendarEvent) => void;
  onCreateEvent: (date: Date) => void;
}

const PoolRow: React.FC<PoolRowProps> = ({ events, dates, onEditEvent, onCreateEvent }) => {
  return (
    <PoolContainer>
      <TimeCell>
        <PoolTitle>This Day</PoolTitle>
      </TimeCell>
      {dates.map(date => {
        const { setNodeRef, isOver } = useDroppable({
          id: `pool-${date.toISOString()}`,
          data: {
            date,
            type: 'pool'
          }
        });

        return (
          <PoolCell 
            key={date.toISOString()} 
            ref={setNodeRef}
            $isOver={isOver}
            onClick={() => onCreateEvent(date)}
          >
            {events
              .filter(event => event.date && isSameDay(new Date(event.date), date))
              .map(event => (
                <EventItem 
                  key={event.id} 
                  event={event} 
                  isPool={true}
                  onEdit={(e) => {
                    onEditEvent(e);
                  }}
                />
              ))}
          </PoolCell>
        );
      })}
    </PoolContainer>
  );
};

export default PoolRow; 