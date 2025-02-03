import React from 'react';
import styled from 'styled-components';
import { useDraggable } from '@dnd-kit/core';
import { CalendarEvent } from '../types';
import { HOUR_HEIGHT, POOL_HEIGHT, HEADER_HEIGHT } from '../constants';

interface EventItemContainerProps {
  $top?: number;
  $height?: number;
  $isPool?: boolean;
  $isDragging?: boolean;
}

const EventItemContainer = styled.div<EventItemContainerProps>`
  position: ${props => props.$isPool ? 'relative' : 'absolute'};
  ${props => !props.$isPool && `
    top: ${props.$top}px;
    height: ${props.$height}px;
    left: 0;
    right: 0;
  `}
  width: calc(100% - 16px);
  margin: ${props => props.$isPool ? '4px 8px' : '0 8px'};
  background-color: #e3f2fd;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 14px;
  cursor: pointer;
  user-select: none;
  overflow: hidden;
  box-sizing: border-box;
  z-index: ${props => props.$isDragging ? 9999 : 1};
  
  &:hover {
    background-color: #bbdefb;
  }
`;

interface EventItemProps {
  event: CalendarEvent;
  isPool?: boolean;
}

const EventItem: React.FC<EventItemProps> = ({ event, isPool = false }) => {
  const {attributes, listeners, setNodeRef, transform, isDragging} = useDraggable({
    id: event.id,
    data: {
      event,
      type: event.type
    }
  });

  const getEventPosition = () => {
    if (isPool) return {};
    
    const startMinutes = event.startTime ? 
      parseInt(event.startTime.split(':')[0]) * 60 + parseInt(event.startTime.split(':')[1]) 
      : 0;
    
    const duration = event.duration || 60; // default 1 hour
    
    return {
      top: (startMinutes / 60) * HOUR_HEIGHT,
      height: (duration / 60) * HOUR_HEIGHT
    };
  };

  const { top, height } = getEventPosition();

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    opacity: isDragging ? 0.8 : undefined,
  } : undefined;

  return (
    <EventItemContainer
      ref={setNodeRef}
      $top={top}
      $height={height}
      $isPool={isPool}
      $isDragging={isDragging}
      style={style}
      {...attributes}
      {...listeners}
    >
      <div>{event.title}</div>
      {!isPool && event.startTime && (
        <div style={{ fontSize: '12px', color: '#666' }}>
          {event.startTime}
          {event.duration && ` (${event.duration}min)`}
        </div>
      )}
    </EventItemContainer>
  );
};

export default EventItem; 