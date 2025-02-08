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
import { CalendarEvent, TimeBlock, TimePosition } from '../types';
import WeekView from './WeekView';
import PoolRow from './PoolRow';
import EventItem from './EventItem';
import { POOL_HEIGHT, HOUR_HEIGHT, MINUTES_SNAP } from '../constants';
import EventDialog from './EventDialog';
import WeekSwitcher from './WeekSwitcher';
import ThisWeekArea from './ThisWeekArea';
import GeneralArea from './GeneralArea';
import { Transform } from '@dnd-kit/utilities';

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
  grid-template-columns: 300px 1fr;  // 这里控制侧边栏宽度
  min-width: 0;
  overflow: hidden;
  gap: 32px;
`;

const SideAreaContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: ${HEADER_HEIGHT}px;
  overflow-y: auto;
  max-height: calc(100vh - ${HEADER_HEIGHT}px - 32px);
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
      date: format(today, 'yyyy-MM-dd'),
      startTime: '10:00',
      type: 'scheduled'
    },
    {
      id: '2',
      title: 'Review Documents',
      duration: 30,
      date: format(today, 'yyyy-MM-dd'),
      type: 'pool'
    },
    {
      id: '3',
      title: 'Call Client',
      duration: 30,
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
    const draggedEvent = active.data.current?.event as CalendarEvent;
    
    if (draggedEvent && draggedEvent.startTime) {
      const [hours, minutes] = draggedEvent.startTime.split(':').map(Number);
      const totalMinutes = hours * 60 + minutes;
      
      const dragEvent = {
        ...draggedEvent,
        _dragMetadata: {
          originalStartTime: draggedEvent.startTime,
          originalTotalMinutes: totalMinutes
        }
      };

      setActiveEvent(dragEvent);
    } else {
      setActiveEvent(draggedEvent);
    }
  };

  const snapToGrid: Modifier = ({ transform }) => {
    if (!transform || activeEvent?.type !== 'scheduled') return transform;

    return {
      ...transform,
      y: Math.round(transform.y / (HOUR_HEIGHT / 2)) * (HOUR_HEIGHT / 2)  // 对齐到30分钟格子
    };
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
    if (!over) return;

    const draggedEvent = active.data.current?.event as CalendarEvent;
    const targetData = over.data.current as { type: string; date?: Date; position?: TimeBlock };

    setEvents(prevEvents => {
      return prevEvents.map(evt => {
        if (evt.id !== draggedEvent.id) return evt;

        const newEvent = { ...evt };
        
        // 更新事件类型
        newEvent.type = targetData.type as EventType;

        if (targetData.type === 'scheduled' && targetData.date) {
          // 确保更新日期
          newEvent.date = format(targetData.date, 'yyyy-MM-dd');
          if (targetData.position) {
            const { hour, minute } = targetData.position;
            newEvent.startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          }
        } else if (targetData.type === 'pool') {
          // pool 区域保留日期但清除时间
          newEvent.date = targetData.date ? format(targetData.date, 'yyyy-MM-dd') : undefined;
          newEvent.startTime = undefined;
        } else {
          // thisWeek 和 general 区域清除日期和时间
          newEvent.date = undefined;
          newEvent.startTime = undefined;
        }
        
        return newEvent;
      });
    });

    setActiveEvent(null);  // 确保清除活动事件
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
  };

  const handleCreateEvent = (date?: Date, timeBlock?: TimeBlock, type: EventType = 'scheduled') => {
    const newEvent: CalendarEvent = {
      id: `new-${Date.now()}`,
      title: '',
      type,
      // 只有 scheduled 和 pool 类型才设置日期
      date: (type === 'scheduled' || type === 'pool') && date ? 
        format(date, 'yyyy-MM-dd') : 
        undefined,
      // 只有 scheduled 类型才设置时间
      startTime: type === 'scheduled' && timeBlock ? 
        `${timeBlock.hour.toString().padStart(2, '0')}:${timeBlock.minute.toString().padStart(2, '0')}` : 
        undefined,
      duration: 30,
    };
    setEditingEvent(newEvent);
  };

  const isSaving = React.useRef(false);

  const handleSaveEvent = React.useCallback((event: CalendarEvent) => {
    if (isSaving.current) return;
    isSaving.current = true;

    if (event.id.startsWith('new-')) {
      const newId = `event-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setEvents(prev => [...prev, { ...event, id: newId }]);
    } else {
      setEvents(prev => prev.map(e => e.id === event.id ? event : e));
    }
    setEditingEvent(null);

    setTimeout(() => {
      isSaving.current = false;
    }, 100);
  }, []);

  const handleDeleteEvent = (eventId: string) => {
    setEvents(prevEvents => prevEvents.filter(evt => evt.id !== eventId));
    setEditingEvent(null);
  };

  const handleEventResize = (
    event: CalendarEvent,
    newStartTime?: string,
    newDuration?: number
  ) => {
    setEvents(prev => prev.map(evt => 
      evt.id === event.id 
        ? { ...evt, startTime: newStartTime, duration: newDuration }
        : evt
    ));
  };

  const handlePrevWeek = () => {
    setCurrentDate(prev => subWeeks(prev, 1));
  };

  const handleNextWeek = () => {
    setCurrentDate(prev => addWeeks(prev, 1));
  };

  // 修改 transform 修改器
  const adjustTransform = ({ transform }: { transform: Transform | null }) => {
    if (!transform) return transform;

    // 如果是 scheduled 类型的事件移动到 pool 区域
    if (activeEvent?.type === 'scheduled') {
      return {
        ...transform,
        // 不再强制 y = 0，允许垂直移动
        y: Math.round(transform.y / (HOUR_HEIGHT / 2)) * (HOUR_HEIGHT / 2)  // 保持网格对齐
      };
    }

    return transform;
  };

  return (
    <RootContainer>
      <DndContext 
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        modifiers={[adjustTransform, snapToGrid]}
      >
        <SidebarContainer>
          {/* 删除这里的 WeekSwitcher */}
        </SidebarContainer>

        <ContentContainer>
          <SideAreaContainer>
            <ThisWeekArea
              events={events.filter(e => e.type === 'thisWeek')}
              onEditEvent={handleEditEvent}
              onCreateEvent={() => handleCreateEvent(undefined, undefined, 'thisWeek')}
              onClick={() => handleCreateEvent(undefined, undefined, 'thisWeek')}
            />
            <GeneralArea
              events={events.filter(e => e.type === 'general')}
              onEditEvent={handleEditEvent}
              onCreateEvent={() => handleCreateEvent(undefined, undefined, 'general')}
              onClick={() => handleCreateEvent(undefined, undefined, 'general')}
            />
          </SideAreaContainer>

          {/* 日历主体部分占用剩余6列 */}
          <div style={{ gridColumn: '2' }}>
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

        <DragOverlay dropAnimation={null} modifiers={[snapToGrid]}>
          {activeEvent && (
            <EventItem 
              key={activeEvent.id}
              event={activeEvent}
              isPool={activeEvent.type === 'pool'}
              isDragging={true}
              style={{
                width: 'auto',
                opacity: 0.8,
                boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
                position: 'absolute',
                left: 0,
                right: 0,
                // 为非 scheduled 类型的事件设置固定高度
                height: activeEvent.type !== 'scheduled' ? `${HOUR_HEIGHT / 2}px` : undefined,
                minHeight: activeEvent.type !== 'scheduled' ? `${HOUR_HEIGHT / 2}px` : undefined
              }}
            />
          )}
        </DragOverlay>
      </DndContext>

      {editingEvent && (
        <EventDialog
          key={editingEvent.id}
          event={editingEvent}
          onClose={() => setEditingEvent(null)}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
        />
      )}
    </RootContainer>
  );
};

export default Calendar; 