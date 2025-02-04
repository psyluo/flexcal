import React from 'react';
import styled from 'styled-components';
import { useDroppable } from '@dnd-kit/core';
import { CalendarEvent } from '../../types';
import EventItem from '../EventItem';

const EventListContainer = styled.div.attrs({
  className: 'event-list-container'
})`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  position: relative;
  padding: 4px;
`;

const EventRow = styled.div.attrs({
  className: 'event-row'
})`
  display: flex;
  width: 100%;
  min-height: 60px;
  border-radius: 4px;
  
  &:hover {
    background-color: #f5f5f5;
  }
`;

interface EventListProps {
  events: CalendarEvent[];
  onEditEvent: (event: CalendarEvent) => void;
  areaType: 'thisWeek' | 'general';
}

const EventList: React.FC<EventListProps> = ({
  events,
  onEditEvent,
  areaType,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `${areaType}-area`,
    data: { type: areaType }
  });

  return (
    <EventListContainer ref={setNodeRef} data-testid={`${areaType}-event-list`}>
      {events.map(event => {
        return (
          <EventRow key={event.id} data-testid={`event-row-${event.id}`}>
            <EventItem
              event={event}
              onEdit={onEditEvent}
            />
          </EventRow>
        );
      })}
    </EventListContainer>
  );
};

export default EventList; 