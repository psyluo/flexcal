import React from 'react';
import { CalendarEvent } from '../types';
import { AreaContainer, AreaHeader, AreaTitle, AreaContent, AddButton } from './shared/AreaStyles';
import EventList from './shared/EventList';

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
  return (
    <AreaContainer data-testid="this-week-area">
      <AreaHeader data-testid="this-week-header">
        <AreaTitle>This Week</AreaTitle>
        <AddButton onClick={onCreateEvent}>+</AddButton>
      </AreaHeader>
      <AreaContent data-testid="this-week-content">
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