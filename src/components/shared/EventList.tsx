import React from 'react';
import styled from 'styled-components';
import { useDroppable } from '@dnd-kit/core';
import { CalendarEvent } from '../../types';
import EventItem from '../EventItem';

const EventListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-height: 100%;
  width: 100%;
  box-sizing: border-box;
  
  // 移除这些可能导致问题的样式
  // & > *:first-child {
  //   margin-top: 0;
  // }
  
  // & > *:last-child {
  //   margin-bottom: 0;
  // }
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
    <EventListContainer 
      ref={setNodeRef} 
      data-testid={`${areaType}-event-list`}
      style={{
        backgroundColor: isOver ? 'rgba(0, 0, 0, 0.05)' : undefined
      }}
    >
      {events.map(event => (
        <EventItem
          key={event.id}
          event={event}
          onEdit={onEditEvent}
        />
      ))}
    </EventListContainer>
  );
};

export default EventList; 