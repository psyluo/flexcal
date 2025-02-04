import React from 'react';
import { CalendarEvent } from '../types';
import { AreaContainer, AreaHeader, AreaTitle, AreaContent, AddButton } from './shared/AreaStyles';
import EventList from './shared/EventList';

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
  return (
    <AreaContainer>
      <AreaHeader>
        <AreaTitle>General</AreaTitle>
        <AddButton onClick={onCreateEvent}>+</AddButton>
      </AreaHeader>
      <AreaContent>
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