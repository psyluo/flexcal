import React from 'react';
import styled from 'styled-components';
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

export default GeneralArea; 