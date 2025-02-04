import React from 'react';
import styled from 'styled-components';
import { useDroppable } from '@dnd-kit/core';
import { CalendarEvent } from '../types';
import EventItem from './EventItem';

const TodoContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 8px;
`;

const TodoDroppable = styled.div<{ $isOver: boolean }>`
  min-height: 100%;
  padding: 8px;
  background-color: ${props => props.$isOver ? '#f0f0e0' : 'transparent'};
  transition: background-color 0.2s;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const EventWrapper = styled.div`
  margin: 4px 0;
`;

interface TodoAreaProps {
  events: CalendarEvent[];
  onEditEvent: (event: CalendarEvent) => void;
  onCreateEvent: () => void;
}

const TodoArea: React.FC<TodoAreaProps> = ({
  events,
  onEditEvent,
  onCreateEvent,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: 'todo-area',
    data: {
      type: 'todo'
    }
  });

  const handleClick = (e: React.MouseEvent) => {
    // 只有点击空白区域才创建新事件
    if ((e.target as HTMLElement).dataset.droppable === 'true') {
      onCreateEvent();
    }
  };

  return (
    <TodoContainer>
      <TodoDroppable
        ref={setNodeRef}
        $isOver={isOver}
        onClick={handleClick}
        data-droppable="true"
      >
        {events.map(event => (
          <EventWrapper key={event.id}>
            <EventItem
              event={event}
              onEdit={onEditEvent}
            />
          </EventWrapper>
        ))}
      </TodoDroppable>
    </TodoContainer>
  );
};

export default TodoArea; 