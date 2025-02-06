import React from 'react';
import { CalendarEvent } from '../types';
import { AreaContainer, AreaHeader, AreaTitle, AreaContent, AddButton } from './shared/AreaStyles';
import EventList from './shared/EventList';
import { useDroppable } from '@dnd-kit/core';
import styled from 'styled-components';

interface ThisWeekAreaProps {
  events: CalendarEvent[];
  onEditEvent: (event: CalendarEvent) => void;
  onCreateEvent: () => void;
  onClick: () => void;
}

const ThisWeekContainer = styled.div`
  padding: 0 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ThisWeekArea: React.FC<ThisWeekAreaProps> = ({
  events,
  onEditEvent,
  onCreateEvent,
  onClick,
}) => {
  console.log('ThisWeekArea: rendering with onEditEvent:', !!onEditEvent);

  const { setNodeRef, isOver } = useDroppable({
    id: 'thisWeek-area',
    data: { type: 'thisWeek' }
  });

  return (
    <AreaContainer onClick={onClick}>
      <AreaHeader>
        <AreaTitle>This Week</AreaTitle>
        <AddButton onClick={(e) => {
          e.stopPropagation();
          onCreateEvent();
        }}>+</AddButton>
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