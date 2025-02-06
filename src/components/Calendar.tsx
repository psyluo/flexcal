import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { startOfWeek, addDays, format, addWeeks, subWeeks } from 'date-fns';
import { 
  DndContext, 
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  Active,
  Over,
  Modifier,
} from '@dnd-kit/core';
import { CalendarEvent, TimeBlock } from '../types';
import WeekView from './WeekView';
import PoolRow from './PoolRow';
import EventItem from './EventItem';
import { POOL_HEIGHT, HOUR_HEIGHT, MINUTES_SNAP } from '../constants';
import EventDialog from './EventDialog';
import WeekSwitcher from './WeekSwitcher';
import ThisWeekArea from './ThisWeekArea';
import GeneralArea from './GeneralArea';

export const HEADER_HEIGHT = 50; // 日期行高度

const RootContainer = styled.div`
  display: flex;
  height: 100vh;
  padding: 16px;
  gap: 16px;
  overflow: hidden;  // 防止整体滚动
`;

const SidebarContainer = styled.div`
  width: 60px;  // 与时间列宽度相同
  flex-shrink: 0;
`;

const ContentContainer = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  min-width: 0;
  overflow: hidden;
  gap: 32px;  // 从 16px 增加到 32px，增加列间距
`;

const SideAreaContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: ${HEADER_HEIGHT}px;
  overflow-y: auto;  // 允许侧边区域滚动
  max-height: calc(100vh - ${HEADER_HEIGHT}px - 32px);  // 减去头部高度和padding
`;

const MainContainer = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  height: 100vh;  // 设置高度
  overflow: hidden;  // 防止整体滚动
`;

const FixedHeader = styled.div`
  position: sticky;
  top: 0;
  background: white;
  z-index: 4;
  border-bottom: 1px solid #e0e0e0;
`;

const HeaderRow = styled.div`
  display: grid;
  grid-template-columns: 60px repeat(7, 1fr);
  border-bottom: 1px solid #e0e0e0;
`;

const HeaderCell = styled.div`
  padding: 8px;
  text-align: center;
  border-right: 1px solid #e0e0e0;
  height: ${HEADER_HEIGHT}px;
  
  .day-name {
    font-weight: bold;
  }
  
  .date {
    font-size: 12px;
    color: #666;
  }
`;

const ScrollableContent = styled.div`
  flex: 1;
  overflow-y: auto;  // 允许内容区域滚动
  min-height: 0;     // 重要：允许flex子项收缩
`;

const MainCalendarContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  overflow: hidden;
`;

const Calendar: React.FC = () => {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);
  
  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: '1',
      title: 'Meeting with Team',
      duration: 60,
      date: today,
      startTime: '10:00',
      type: 'scheduled'
    },
    {
      id: '2',
      title: 'Review Documents',
      duration: 30,
      date: today,
      type: 'pool'
    },
    {
      id: '3',
      title: 'Call Client',
      duration: 30,
      roughTime: 'this-week',
      type: 'thisWeek'
    },
    {
      id: '4',
      title: 'Update Portfolio',
      duration: 120,
      type: 'general'
    }
  ]);
  const [activeEvent, setActiveEvent] = useState<CalendarEvent | null>(null);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  // 使用 weekStartsOn 确保周一开始
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const draggedEvent = active.data.current?.event;
    setActiveEvent(draggedEvent);
  };

  const snapToGrid = (minutes: number): number => {
    const snapTo = MINUTES_SNAP;
    return Math.round(minutes / snapTo) * snapTo;
  };

  const getTimeFromYPosition = (y: number): string => {
    // 每小时60px，直接用像素值计算分钟
    const totalMinutes = Math.floor(y);
    const snappedMinutes = snapToGrid(totalMinutes);
    const hours = Math.floor(snappedMinutes / 60);
    const minutes = snappedMinutes % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    // 添加调试日志
    console.log('Drag end:', {
      active: {
        id: active.id,
        data: active.data.current
      },
      over: over ? {
        id: over.id,
        data: over.data.current
      } : null
    });

    if (!over) {
      setActiveEvent(null);
      return;
    }

    const draggedEvent = active.data.current?.event as CalendarEvent;
    const targetType = over.data.current?.type as EventType;
    const targetDate = over.data.current?.date as Date;
    const timeBlock = over.data.current?.timeBlock as TimeBlock;

    if (draggedEvent) {
      const newEvent = { ...draggedEvent };
      newEvent.type = targetType;

      // 根据目标类型设置或清除属性
      switch (targetType) {
        case 'scheduled':
          newEvent.date = targetDate;
          if (timeBlock) {
            newEvent.startTime = `${timeBlock.hour.toString().padStart(2, '0')}:${timeBlock.minute.toString().padStart(2, '0')}`;
          }
          delete newEvent.roughTime;
          break;
        
        case 'pool':
          newEvent.date = targetDate;
          delete newEvent.startTime;
          delete newEvent.roughTime;
          break;
        
        case 'thisWeek':
          delete newEvent.date;
          delete newEvent.startTime;
          newEvent.roughTime = 'this-week';
          break;
        
        case 'general':
          delete newEvent.date;
          delete newEvent.startTime;
          delete newEvent.roughTime;
          break;
      }

      setEvents(prevEvents => 
        prevEvents.map(evt => 
          evt.id === draggedEvent.id ? newEvent : evt
        )
      );
    }
    
    setActiveEvent(null);
  };

  const handleEditEvent = (event: CalendarEvent) => {
    console.log('handleEditEvent called with:', {
      event,
      currentEditingEvent: editingEvent,  // 添加当前编辑状态
      willSetEditingEvent: event
    });
    setEditingEvent(event);
  };

  const handleCreateEvent = (date?: Date, timeBlock?: TimeBlock, specificType?: EventType) => {
    let eventType: EventType;
    if (specificType) {
      eventType = specificType;
    } else if (timeBlock) {
      eventType = 'scheduled';
    } else if (date) {
      eventType = 'pool';
    } else {
      eventType = 'general';
    }

    const newEvent: CalendarEvent = {
      id: `new-${Date.now()}`,
      title: 'New Event',
      duration: 30,
      type: eventType
    };

    if (date) {
      newEvent.date = date;
    }

    if (timeBlock) {
      newEvent.startTime = `${timeBlock.hour.toString().padStart(2, '0')}:${timeBlock.minute.toString().padStart(2, '0')}`;
    }

    if (eventType === 'thisWeek') {
      newEvent.roughTime = 'this-week';
    }

    setEditingEvent(newEvent);
  };

  const handleSaveEvent = (updatedEvent: CalendarEvent) => {
    setEvents(prevEvents =>
      prevEvents.map(evt =>
        evt.id === updatedEvent.id ? updatedEvent : evt
      )
    );
    setEditingEvent(null);
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(prevEvents => prevEvents.filter(evt => evt.id !== eventId));
    setEditingEvent(null);
  };

  const handleEventResize = (event: CalendarEvent, newStartTime?: string, newDuration?: number) => {
    setEvents(prevEvents =>
      prevEvents.map(evt => {
        if (evt.id !== event.id) return evt;
        
        const updatedEvent = { ...evt };
        if (newStartTime !== undefined) {
          updatedEvent.startTime = newStartTime;
        }
        if (newDuration !== undefined) {
          updatedEvent.duration = newDuration;
        }
        return updatedEvent;
      })
    );
  };

  const handlePrevWeek = () => {
    setCurrentDate(prev => subWeeks(prev, 1));
  };

  const handleNextWeek = () => {
    setCurrentDate(prev => addWeeks(prev, 1));
  };

  const adjustTransparency: Modifier = ({ transform, dragging }) => {
    return {
      ...transform,
      scaleX: 1,
      scaleY: 1,
      opacity: dragging ? 0.2 : 1,
    };
  };

  return (
    <RootContainer>
      <DndContext 
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        modifiers={[adjustTransparency]}
      >
        <SidebarContainer>
          {/* 时间列 */}
        </SidebarContainer>

        <ContentContainer>
          <SideAreaContainer>
            <ThisWeekArea
              events={events.filter(e => e.type === 'thisWeek')}
              onEditEvent={handleEditEvent}
              onCreateEvent={() => handleCreateEvent(undefined, undefined, 'thisWeek')}
            />
            <GeneralArea
              events={events.filter(e => e.type === 'general')}
              onEditEvent={handleEditEvent}
              onCreateEvent={() => handleCreateEvent(undefined, undefined, 'general')}
            />
          </SideAreaContainer>

          {/* 日历主体部分占用剩余6列 */}
          <div style={{ gridColumn: '2 / 8' }}>
            <MainContainer>
              <WeekSwitcher
                currentDate={currentDate}
                onPrevWeek={handlePrevWeek}
                onNextWeek={handleNextWeek}
              />
              <MainCalendarContainer>
                <FixedHeader>
                  <HeaderRow>
                    <HeaderCell />
                    {weekDays.map(date => (
                      <HeaderCell key={date.toISOString()}>
                        <div className="day-name">{format(date, 'EEE')}</div>
                        <div className="date">{format(date, 'MM/dd')}</div>
                      </HeaderCell>
                    ))}
                  </HeaderRow>
                  <PoolRow 
                    events={events.filter(e => e.type === 'pool')}
                    dates={weekDays}
                    onEditEvent={handleEditEvent}
                    onCreateEvent={handleCreateEvent}
                  />
                </FixedHeader>
                
                <ScrollableContent>
                  <WeekView 
                    events={events.filter(e => e.type === 'scheduled')}
                    dates={weekDays}
                    onEditEvent={handleEditEvent}
                    onCreateEvent={handleCreateEvent}
                    onResizeEvent={handleEventResize}
                  />
                </ScrollableContent>
              </MainCalendarContainer>
            </MainContainer>
          </div>
        </ContentContainer>

        <DragOverlay dropAnimation={null}>
          {activeEvent && (
            <EventItem 
              event={activeEvent}
              isPool={activeEvent.type === 'pool'}
              isDragging={true}
              style={{
                width: 'auto',
                position: 'relative',
                transform: 'none',
              }}
            />
          )}
        </DragOverlay>
      </DndContext>

      {editingEvent && (
        <EventDialog
          key={editingEvent.id}
          event={editingEvent}
          onClose={() => {
            console.log('Dialog closing');  // 添加日志
            setEditingEvent(null);
          }}
          onSave={(event) => {
            console.log('Saving event:', event);  // 添加日志
            if (event.id.startsWith('new-')) {
              setEvents(prev => [...prev, { ...event, id: `event-${Date.now()}` }]);
            } else {
              setEvents(prev => prev.map(e => e.id === event.id ? event : e));
            }
            setEditingEvent(null);
          }}
          onDelete={handleDeleteEvent}
        />
      )}
    </RootContainer>
  );
};

export default Calendar; 