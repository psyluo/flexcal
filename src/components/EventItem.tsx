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
  background-color: #f5f5f5;
  color: #1976d2;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s, background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: #e0e0e0;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const EventItemContainer = styled.div<EventItemContainerProps>`
  ${props => {
    if (props.$top !== undefined && props.$height !== undefined) {
      // 日历格子中的事件样式
      return `
        position: absolute;
        top: ${props.$top}px;
        height: ${props.$height}px;
        left: 0;
        right: 0;
        margin: 0 8px;
        padding: 4px 8px;
        background-color: #e3f2fd;
        border: 1px solid #1976d2;
        opacity: ${props.$isDragging ? 0.3 : 1};
      `;
    } else {
      // Pool、ThisWeek 和 General 事件共用样式
      return `
        position: relative;
        width: calc(100% - 16px);
        margin: 4px 8px;
        min-height: ${HOUR_HEIGHT / 2}px;
        padding: 4px 8px;
        background-color: #e3f2fd;
        border: 1px solid #1976d2;
      `;
    }
  }}

  border-radius: 4px;
  cursor: pointer;
  user-select: none;
  z-index: ${props => props.$isDragging ? 9999 : 1};
  pointer-events: auto;  // 确保容器可以接收事件

  &:hover {
    background-color: #bbdefb;
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
  height: 6px;
  cursor: ns-resize;
  background: transparent;
  ${props => props.$position === 'top' ? 'top: -3px' : 'bottom: -3px'};
  z-index: 5;  // 增加 z-index 确保在拖拽区域之上

  &:hover {
    background: rgba(0, 0, 0, 0.1);
  }

  &:active {
    background: rgba(0, 0, 0, 0.2);
  }
`;

const DraggableArea = styled.div`
  position: relative;
  height: 100%;
  width: 100%;
  pointer-events: auto;  // 改为 auto
`;

const EventContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  pointer-events: auto;  // 确保内容可以点击
`;

interface EventItemProps {
  event: CalendarEvent;
  isPool?: boolean;
  isDragging?: boolean;
  onEdit?: (event: CalendarEvent) => void;
  onResize?: (event: CalendarEvent, newStartTime?: string, newDuration?: number) => void;
  style?: React.CSSProperties;
}

// 添加这些辅助函数
const calculateTop = (startTime?: string): number | undefined => {
  if (!startTime) return undefined;
  
  const [hours, minutes] = startTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes;
  return totalMinutes * (HOUR_HEIGHT / 60);  // 更精确的计算
};

const calculateHeight = (duration?: number): number | undefined => {
  if (!duration) return undefined;
  return duration * (HOUR_HEIGHT / 60);  // 更精确的计算
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

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(event);
  };

  return (
    <EventItemContainer
      $isPool={isPool}
      $isDragging={isDragging}
      $top={!isDragging && event.type === 'scheduled' ? calculateTop(event.startTime) : undefined}
      $height={event.type === 'scheduled' ? calculateHeight(event.duration) : undefined}
    >
      <EditButtonWrapper>
        <EditButton onClick={handleEditClick}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M14.06 9.02l.92.92L5.92 19H5v-.92l9.06-9.06M17.66 3c-.25 0-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29zm-3.6 3.19L3 17.25V21h3.75L17.81 9.94l-3.75-3.75z" />
          </svg>
        </EditButton>
      </EditButtonWrapper>
      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          ...style,
          ...(isDragging ? {} : transform ? {
            transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
          } : {})
        }}
      >
        <DraggableArea>
          <EventContent>
            <div>{event.title}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {event.startTime && `${event.startTime}, `}
              {event.duration && `${event.duration}min`}
            </div>
          </EventContent>
        </DraggableArea>
      </div>
    </EventItemContainer>
  );
};

export default EventItem; 