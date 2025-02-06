import React from 'react';
import { CalendarEvent } from '../types';
import { AreaContainer, AreaHeader, AreaTitle, AreaContent, AddButton } from './shared/AreaStyles';
import EventList from './shared/EventList';
import { useDroppable } from '@dnd-kit/core';

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
    id: 'thisWeek-area',
    data: { type: 'thisWeek' }
  });

  return (
    <AreaContainer>
      <AreaHeader>
        <AreaTitle>This Week</AreaTitle>
        <AddButton onClick={onCreateEvent}>+</AddButton>
      </AreaHeader>
      <AreaContent 
        ref={setNodeRef}
        style={{
          backgroundColor: isOver ? 'rgba(0, 0, 0, 0.05)' : undefined
        }}
      >
        <EventList
          events={events}
          onEditEvent={onEditEvent}
          areaType="thisWeek"
        />
      </AreaContent>
    </AreaContainer>
  );
};

export default ThisWeekArea; 