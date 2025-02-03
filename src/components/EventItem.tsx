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
  isDragging?: boolean;
  onEdit?: (event: CalendarEvent) => void;
}

const EventItem: React.FC<EventItemProps> = ({
  event,
  isPool = false,
  isDragging = false,
  onEdit
}) => {
  const [mouseState, setMouseState] = React.useState({
    isDown: false,
    startX: 0,
    startY: 0,
    moved: false
  });

  const {attributes, listeners, setNodeRef, transform} = useDraggable({
    id: event.id,
    data: {
      event,
      type: event.type
    }
  });

  const handleMouseDown = (e: React.MouseEvent) => {
    setMouseState({
      isDown: true,
      startX: e.clientX,
      startY: e.clientY,
      moved: false
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (mouseState.isDown) {
      const dx = Math.abs(e.clientX - mouseState.startX);
      const dy = Math.abs(e.clientY - mouseState.startY);
      if (dx > 3 || dy > 3) {
        setMouseState(prev => ({ ...prev, moved: true }));
      }
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (mouseState.isDown && !mouseState.moved) {
      onEdit?.(event);
    }

    setMouseState({
      isDown: false,
      startX: 0,
      startY: 0,
      moved: false
    });
  };

  const getEventPosition = () => {
    if (isPool || isDragging) return {};
    
    const startMinutes = event.startTime ? 
      parseInt(event.startTime.split(':')[0]) * 60 + parseInt(event.startTime.split(':')[1]) 
      : 0;
    
    const duration = event.duration || 30;
    const blockHeight = HOUR_HEIGHT / 2;
    const blockIndex = startMinutes / 30;
    
    return {
      top: blockIndex * blockHeight,
      height: (duration / 30) * blockHeight
    };
  };

  const { top, height } = getEventPosition();

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    opacity: isDragging ? 0.5 : undefined,
  } : undefined;

  return (
    <EventItemContainer
      ref={setNodeRef}
      $top={top}
      $height={height}
      $isPool={isPool}
      $isDragging={isDragging}
      style={style}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => setMouseState({
        isDown: false,
        startX: 0,
        startY: 0,
        moved: false
      })}
      {...attributes}
      data-testid={`event-item-${event.id}`}
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