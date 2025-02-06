import React from 'react';
import styled from 'styled-components';
import { format, isSameDay } from 'date-fns';
import { CalendarEvent } from '../types';
import EventItem from './EventItem';
import { useDroppable } from '@dnd-kit/core';

const PoolContainer = styled.div`
  display: grid;
  grid-template-columns: 60px repeat(7, 1fr);
  border-bottom: 2px solid #e0e0e0;
  min-height: 100px;
`;

const PoolLabel = styled.div`
  padding: 8px;
  border-right: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
`;

const POOL_HEIGHT = 100;

const PoolCell = styled.div<{ $isOver?: boolean }>`
  height: ${POOL_HEIGHT}px;
  border-right: 1px solid #e0e0e0;
  position: relative;
  box-sizing: border-box;
  background-color: ${props => props.$isOver ? 'rgba(0, 0, 0, 0.05)' : 'transparent'};
  transition: background-color 0.2s;

  &:hover {
    background-color: #f8f8f8;
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
      <PoolLabel>Pool</PoolLabel>
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
              .filter(event => isSameDay(new Date(event.date), date))
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