import React from 'react';
import { CalendarEvent } from '../types';
import { AreaContainer, AreaHeader, AreaTitle, AreaContent, AddButton } from './shared/AreaStyles';
import EventList from './shared/EventList';
import { useDroppable } from '@dnd-kit/core';

interface GeneralAreaProps {
  events: CalendarEvent[];
  onEditEvent: (event: CalendarEvent) => void;
  onCreateEvent: () => void;
}

const GeneralArea: React.FC<GeneralAreaProps> = ({
  events,
  onEditEvent,
  onCreateEvent,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: 'general-area',
    data: { type: 'general' }
  });

  return (
    <AreaContainer>
      <AreaHeader>
        <AreaTitle>General</AreaTitle>
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
          areaType="general"
        />
      </AreaContent>
    </AreaContainer>
  );
};

export default GeneralArea; 