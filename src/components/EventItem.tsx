import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { useDraggable } from '@dnd-kit/core';
import { CalendarEvent } from '../types';
import { HOUR_HEIGHT } from '../constants';
import { THEME } from './shared/AreaStyles';

interface EventItemContainerProps {
  $top?: number;
  $height?: number;
  $isPool?: boolean;
  $isDragging?: boolean;
  type?: string;
}

const EditButtonWrapper = styled.div`
  position: absolute;
  top: 4px;
  right: 4px;
  z-index: 1000;
  pointer-events: auto;
`;

const EditButton = styled.button`
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: none;
  background-color: rgba(255, 255, 255, 0.8);
  color: ${THEME.primary};
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: white;
    color: ${THEME.primaryLight};
  }
`;

const EventItemContainer = styled.div<EventItemContainerProps>`
  position: ${props => props.$top !== undefined ? 'absolute' : 'relative'};
  top: ${props => props.$top !== undefined ? `${props.$top}px` : 'auto'};
  height: ${props => props.$height !== undefined ? `${props.$height}px` : 'auto'};
  width: ${props => props.$isPool ? 'calc(100% - 2px)' : 'calc(100% - 16px)'};
  margin: ${props => props.$isPool ? '0 1px' : '0 8px'};
  padding: 10px 14px;
  box-sizing: border-box;
  background-color: ${props => 
    props.type === 'scheduled' ? THEME.eventBg.purple :
    props.type === 'pool' ? THEME.eventBg.orange :
    THEME.eventBg.blue
  };
  border: 1px solid ${props => 
    props.type === 'scheduled' ? THEME.eventBorder.purple :
    props.type === 'pool' ? THEME.eventBorder.orange :
    THEME.eventBorder.blue
  };
  opacity: ${props => props.$isDragging ? 0.3 : 1};
  border-style: ${props => props.$isDragging ? 'dashed' : 'solid'};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${props => 
      props.type === 'scheduled' ? THEME.eventHover.purple :
      props.type === 'pool' ? THEME.eventHover.orange :
      THEME.eventHover.blue
    };
    transform: translateY(-1px);
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
  }

  &:hover ${EditButton} {
    opacity: 1;
  }
`;

// 添加新的样式组件
const ResizeHandle = styled.div<{ $position: 'top' | 'bottom' }>`
  position: absolute;
  left: 0;
  right: 0;
  height: 8px;
  cursor: ns-resize;
  background: transparent;
  ${props => props.$position === 'top' ? 'top: -4px' : 'bottom: -4px'};
  z-index: 1000;
  pointer-events: all;

  &:hover {
    background: rgba(0, 0, 0, 0.1);
  }

  &:active {
    background: rgba(0, 0, 0, 0.2);
  }
`;

const EventContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  pointer-events: auto;

  .event-title {
    font-weight: 500;
    color: ${THEME.textPrimary};
    font-size: 13px;
    line-height: 1.2;
  }

  .event-time {
    font-size: 11px;
    color: ${THEME.textSecondary};
    line-height: 1.2;
  }
`;

const DraggableWrapper = styled.div<{ $isDragging: boolean; $isResizing: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: ${props => props.$isResizing ? 'none' : 'auto'};
  transform: ${props => props.$isDragging ? 'none' : 'translate3d(0, 0, 0)'};
  cursor: move;
  width: 100%;
  height: 100%;
`;

interface EventItemProps {
  event: CalendarEvent;
  isPool?: boolean;
  isDragging?: boolean;
  onEdit?: (event: CalendarEvent) => void;
  onResize?: (event: CalendarEvent, newStartTime?: string, newDuration?: number) => void;
  style?: React.CSSProperties;
}

const calculateHeight = (duration?: number): number | undefined => {
  if (!duration) return undefined;
  // 一个格子是 30 分钟，高度是 HOUR_HEIGHT / 2
  // 所以 duration 分钟对应的高度应该是 duration * (HOUR_HEIGHT / 2) / 30
  return (duration * HOUR_HEIGHT) / 60;  // 修正：除以 60 而不是 30
};

const EventItem: React.FC<EventItemProps> = ({
  event,
  isPool = false,
  isDragging = false,
  onEdit,
  onResize,
  style,
}) => {
  const {attributes, listeners, setNodeRef, transform} = useDraggable({
    id: event.id,
    data: { event }
  });

  const [isResizing, setIsResizing] = useState(false);
  const initialY = useRef<number>(0);
  const initialTime = useRef<string | undefined>(event.startTime);
  const initialDuration = useRef<number | undefined>(event.duration);

  const calculatePosition = () => {
    if (event.type !== 'scheduled' || isDragging) {
      return undefined;
    }

    if (event.startTime) {
      const [hours, minutes] = event.startTime.split(':').map(Number);
      // 使用与 TimeBlockCell 相同的计算方式
      return hours * HOUR_HEIGHT + (minutes / 60) * HOUR_HEIGHT;
    }
    return undefined;
  };

  const top = calculatePosition();
  const height = event.type === 'scheduled' ? calculateHeight(event.duration) : undefined;

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(event);
  };

  const handleResizeStart = (e: React.MouseEvent, type: 'top' | 'bottom') => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsResizing(true);
    initialY.current = e.clientY;
    initialTime.current = event.startTime;
    initialDuration.current = event.duration;

    function onMouseMove(e: MouseEvent) {
      e.preventDefault();
      e.stopPropagation();
      
      const deltaY = e.clientY - initialY.current;
      const minutesChange = Math.round((deltaY / (HOUR_HEIGHT / 2))) * 30;

      if (type === 'top' && initialTime.current) {
        const [hours, minutes] = initialTime.current.split(':').map(Number);
        const totalMinutes = hours * 60 + minutes + minutesChange;
        const snappedTotalMinutes = Math.round(totalMinutes / 30) * 30;
        const newHours = Math.floor(snappedTotalMinutes / 60);
        const newMinutes = snappedTotalMinutes % 60;
        
        if (newHours >= 0 && newHours < 24) {
          const newStartTime = `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
          const newDuration = (initialDuration.current || 0) - minutesChange;
          
          if (newDuration >= 30) {
            onResize?.(event, newStartTime, newDuration);
          }
        }
      } else if (type === 'bottom') {
        const newDuration = Math.round(((initialDuration.current || 0) + minutesChange) / 30) * 30;
        if (newDuration >= 30) {
          onResize?.(event, event.startTime, newDuration);
        }
      }
    }

    function onMouseUp(e: MouseEvent) {
      e.preventDefault();
      e.stopPropagation();
      
      setIsResizing(false);
      
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    }

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  return (
    <EventItemContainer
      $isPool={isPool}
      $isDragging={isDragging}
      $top={top}
      $height={height}
      type={event.type}
      style={{
        ...style,
        position: isDragging ? 'absolute' : undefined,
      }}
    >
      <DraggableWrapper
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        $isDragging={isDragging}
        $isResizing={isResizing}
        style={{
          position: isDragging ? 'absolute' : 'relative',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          transform: transform ? 
            `translate3d(${transform.x}px, ${transform.y}px, 0)` : 
            undefined
        }}
      >
        <EventContent>
          <div className="event-title">{event.title}</div>
          <div className="event-time">
            {event.startTime && `${event.startTime}, `}
            {event.duration && `${event.duration}min`}
          </div>
        </EventContent>
      </DraggableWrapper>

      {/* 只在 scheduled 事件上显示调整手柄 */}
      {event.type === 'scheduled' && !isDragging && (
        <>
          <ResizeHandle 
            $position="top" 
            onMouseDown={(e) => handleResizeStart(e, 'top')}
          />
          <ResizeHandle 
            $position="bottom" 
            onMouseDown={(e) => handleResizeStart(e, 'bottom')}
          />
        </>
      )}

      <EditButtonWrapper>
        <EditButton onClick={handleEditClick}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M14.06 9.02l.92.92L5.92 19H5v-.92l9.06-9.06M17.66 3c-.25 0-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29zm-3.6 3.19L3 17.25V21h3.75L17.81 9.94l-3.75-3.75z" />
          </svg>
        </EditButton>
      </EditButtonWrapper>
    </EventItemContainer>
  );
};

export default EventItem; 