import React, { useState, useRef, useEffect, useCallback } from 'react';
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
    // 所有事件共用的基础样式
    const baseStyles = `
      width: calc(100% - 16px);  // 保持一致的宽度计算
      margin: 0 8px;             // 两边 8px 外边距实现居中
      padding: 4px 8px;
      box-sizing: border-box;
      background-color: #e3f2fd;
      border: 1px solid #1976d2;
      ${props.$isDragging ? `
        opacity: 0.3;
        border-style: dashed;
      ` : `
        opacity: 1;
        border-style: solid;
        box-shadow: 0 1px 3px rgba(0,0,0,0.12);
      `}
    `;

    if (props.$top !== undefined && props.$height !== undefined) {
      // scheduled 事件特有的样式
      return `
        ${baseStyles}
        position: absolute;
        top: ${props.$top}px;
        height: ${props.$height}px;
        left: 0;
        right: 0;
      `;
    } else {
      // Pool、ThisWeek 和 General 事件的样式
      return `
        ${baseStyles}
        position: relative;
        min-height: ${HOUR_HEIGHT / 2}px;
        margin: 4px 8px;  // 保持垂直间距
      `;
    }
  }}

  border-radius: 4px;
  cursor: pointer;
  user-select: none;
  z-index: ${props => props.$isDragging ? 9999 : 1};
  transition: all 0.2s ease;

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

const DraggableWrapper = styled.div<{ $isDragging: boolean; $isResizing: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: ${props => props.$isResizing ? 'none' : 'auto'};  // 修正属性名
  transform: ${props => props.$isDragging ? 'none' : 'translate3d(0, 0, 0)'};
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
  const [resizeType, setResizeType] = useState<'top' | 'bottom' | null>(null);
  const initialY = useRef<number>(0);
  const initialTime = useRef<string | undefined>(event.startTime);
  const initialDuration = useRef<number | undefined>(event.duration);

  const calculatePosition = () => {
    // 只有 scheduled 类型的事件才需要计算位置
    if (event.type !== 'scheduled') {
      return undefined;
    }

    // 拖拽时不计算位置
    if (isDragging) {
      return 0;
    }

    if (event.startTime) {
      const [hours, minutes] = event.startTime.split(':').map(Number);
      const totalMinutes = hours * 60 + minutes;
      return totalMinutes * (HOUR_HEIGHT / 60);
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
    console.log('=== Resize Start ===', {
      type,
      eventId: event.id,
      initialY: e.clientY,
      startTime: event.startTime,
      duration: event.duration
    });

    e.preventDefault();
    e.stopPropagation();
    
    // 立即设置状态
    setIsResizing(true);
    setResizeType(type);
    initialY.current = e.clientY;
    initialTime.current = event.startTime;
    initialDuration.current = event.duration;

    function onMouseMove(e: MouseEvent) {
      e.preventDefault();
      e.stopPropagation();
      
      const deltaY = e.clientY - initialY.current;
      const minutesChange = Math.round((deltaY / (HOUR_HEIGHT / 2))) * 30;

      console.log('=== Mouse Move ===', {
        deltaY,
        minutesChange,
        currentY: e.clientY,
        initialY: initialY.current,
        type
      });

      if (type === 'top' && initialTime.current) {
        const [hours, minutes] = initialTime.current.split(':').map(Number);
        const totalMinutes = hours * 60 + minutes + minutesChange;
        const snappedTotalMinutes = Math.round(totalMinutes / 30) * 30;
        const newHours = Math.floor(snappedTotalMinutes / 60);
        const newMinutes = snappedTotalMinutes % 60;
        
        if (newHours >= 0 && newHours < 24) {
          const newStartTime = `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
          const newDuration = (initialDuration.current || 0) - minutesChange;
          
          console.log('=== Top Resize ===', {
            newStartTime,
            newDuration,
            minutesChange
          });

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
      
      console.log('=== Resize End ===');
      setIsResizing(false);
      setResizeType(null);
      
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    }

    // 使用 window 而不是 document
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  return (
    <EventItemContainer
      $isPool={isPool}
      $isDragging={isDragging}
      $top={top}
      $height={height}
      style={{
        ...style,
        position: isDragging ? 'absolute' : 'relative',
        top: typeof top === 'number' ? `${top}px` : undefined
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
          <div>{event.title}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
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