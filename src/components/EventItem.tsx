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
        border: 1px solid #1976d2;  // 添加深蓝色边框
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
        border: 1px solid #1976d2;  // 添加深蓝色边框
      `;
    }
  }}

  border-radius: 4px;
  cursor: pointer;
  user-select: none;
  z-index: ${props => props.$isDragging ? 9999 : 1};

  &:hover {
    background-color: #bbdefb;
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
`;

const EventContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  ${props => props.$isScheduled && `
    position: relative;
    height: 100%;
    pointer-events: none;
  `}
`;

interface EventItemProps {
  event: CalendarEvent;
  isPool?: boolean;
  isDragging?: boolean;
  onEdit?: (event: CalendarEvent) => void;
  onResize?: (event: CalendarEvent, newStartTime?: string, newDuration?: number) => void;
}

const EventItem: React.FC<EventItemProps> = ({
  event,
  isPool = false,
  isDragging = false,
  onEdit,
  onResize
}) => {
  // 使用 ref 来追踪 resize 状态，避免异步更新问题
  const resizeRef = React.useRef({
    isResizing: false,
    startY: 0,
    startMinutes: 0,
    startDuration: 0,
    handle: '' as 'top' | 'bottom' | ''
  });

  const handleResizeStart = (e: React.MouseEvent, handle: 'top' | 'bottom') => {
    e.preventDefault();
    e.stopPropagation();

    // 计算初始时间
    const [hours, minutes] = (event.startTime || '00:00').split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    
    resizeRef.current = {
      isResizing: true,
      startY: e.clientY,
      startMinutes,
      startDuration: event.duration || 30,
      handle
    };
    
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
  };

  const handleResizeMove = (e: MouseEvent) => {
    if (!resizeRef.current.isResizing || !onResize) {
      console.log('Resize move ignored:', { 
        isResizing: resizeRef.current.isResizing, 
        hasOnResize: !!onResize 
      });
      return;
    }
    
    const dy = e.clientY - resizeRef.current.startY;
    const dMinutes = Math.round(dy / (HOUR_HEIGHT / 2)) * 30;
    
    console.log('Resize move:', {
      dy,
      dMinutes,
      handle: resizeRef.current.handle,
      startDuration: resizeRef.current.startDuration,
      startMinutes: resizeRef.current.startMinutes
    });

    if (resizeRef.current.handle === 'bottom') {
      // 拖动底部：只改变持续时间
      const newDuration = Math.max(30, resizeRef.current.startDuration + dMinutes);
      console.log('Bottom resize:', { newDuration });
      onResize(event, undefined, newDuration);
    } else {
      // 拖动顶部：同时改变开始时间和持续时间
      const newStartMinutes = resizeRef.current.startMinutes + dMinutes;
      const newDuration = resizeRef.current.startDuration - dMinutes;
      
      console.log('Top resize:', { newStartMinutes, newDuration });
      
      if (newStartMinutes >= 0 && newStartMinutes < 24 * 60 && newDuration >= 30) {
        const hours = Math.floor(newStartMinutes / 60);
        const minutes = newStartMinutes % 60;
        const newStartTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        onResize(event, newStartTime, newDuration);
      }
    }
  };

  const handleResizeEnd = () => {
    console.log('Resize end');
    resizeRef.current.isResizing = false;
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
  };

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
    >
      {!isPool && (
        <>
          <ResizeHandle 
            $position="top"
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleResizeStart(e, 'top');
            }}
          />
          <ResizeHandle 
            $position="bottom"
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleResizeStart(e, 'bottom');
            }}
          />
        </>
      )}
      <DraggableArea
        {...attributes}
        {...eventHandlers}
        {...listeners}
        data-testid={`event-item-${event.id}`}
      >
        <EventContent>
          <div>{event.title}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {event.startTime && `${event.startTime}, `}
            {event.duration && `${event.duration}min`}
          </div>
        </EventContent>
      </DraggableArea>
    </EventItemContainer>
  );
};

export default EventItem; 