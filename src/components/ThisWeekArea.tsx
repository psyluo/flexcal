import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { CalendarEvent } from '../types';
import EventItem from './EventItem';
import { 
  AreaContainer, 
  AreaHeader, 
  AreaTitle, 
  AreaContent,
  AddButton 
} from './shared/AreaStyles';

interface ThisWeekAreaProps {
  events: CalendarEvent[];
  onEditEvent: (event: CalendarEvent) => void;
  onCreateEvent: () => void;
}

const ThisWeekArea: React.FC<ThisWeekAreaProps> = ({
  events,
  onEditEvent,
  onCreateEvent,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: 'this-week-area',
    data: { type: 'thisWeek' }
  });

  return (
    <AreaContainer>
      <AreaHeader>
        <AreaTitle>This Week</AreaTitle>
        <AddButton onClick={onCreateEvent}>+</AddButton>
      </AreaHeader>
      <AreaContent ref={setNodeRef}>
        {events.map(event => (
          <EventItem
            key={event.id}
            event={event}
            onEdit={onEditEvent}
          />
        ))}
      </AreaContent>
    </AreaContainer>
  );
};

export default ThisWeekArea; 