export type EventType = 'scheduled' | 'pool' | 'thisWeek' | 'general';

// 添加时间块相关的类型
export interface TimeBlock {
  hour: number;    // 24小时制
  minute: number;  // 0-59
}

export interface CalendarEvent {
  id: string;
  title: string;                // 必填
  duration: number;             // 必填，默认30分钟
  date?: Date;                  // scheduled 和 pool 必填
  startTime?: string;           // scheduled 必填
  endTime?: string;             // 选填，格式 "HH:mm"
  roughTime?: 'this-week';      // thisWeek 必填
  type: EventType;              // 必填
}

export interface DragState {
  type: EventType;
  sourceType: EventType;
  eventId: string;
  originalDate?: Date;
  originalStartTime?: string;
  originalDuration?: number;
  isDragging: boolean;
  currentPosition: {
    x: number;
    y: number;
  };
} 