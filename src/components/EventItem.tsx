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
  // 使用 ref 来保存最新的 onEdit 函数
  const onEditRef = React.useRef(onEdit);
  
  // 更新 ref 当 onEdit 改变时
  React.useEffect(() => {
    onEditRef.current = onEdit;
  }, [onEdit]);

  console.log('EventItem rendering:', { 
    eventId: event.id, 
    hasOnEdit: !!onEdit 
  });

  // 使用 ref 来追踪点击状态
  const clickRef = React.useRef({
    isClick: true,
    timeout: null as any
  });

  const {attributes, listeners, setNodeRef, transform} = useDraggable({
    id: event.id,
    data: {
      event,
      type: event.type
    }
  });

  // 分离拖拽和点击事件
  const eventHandlers = React.useMemo(() => ({
    onMouseDown: (e: React.MouseEvent) => {
      clickRef.current.isClick = true;
      // 设置一个短暂的延时，如果在这个时间内发生移动，则不是点击
      clickRef.current.timeout = setTimeout(() => {
        clickRef.current.isClick = false;
      }, 200);
      listeners.onMouseDown?.(e as any);
    },
    onMouseMove: (e: React.MouseEvent) => {
      if (clickRef.current.isClick) {
        clickRef.current.isClick = false;
        clearTimeout(clickRef.current.timeout);
      }
      listeners.onMouseMove?.(e as any);
    },
    onMouseUp: (e: React.MouseEvent) => {
      clearTimeout(clickRef.current.timeout);
      if (clickRef.current.isClick) {
        console.log('EventItem click detected:', { 
          eventId: event.id,
          hasOnEdit: !!onEditRef.current
        });
        e.stopPropagation();
        if (onEditRef.current) {
          onEditRef.current(event);
        }
      }
      listeners.onMouseUp?.(e as any);
    }
  }), [event, listeners]);

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
      {...attributes}
      {...eventHandlers}
      {...listeners}
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