export type EventType = 'pool' | 'scheduled' | 'thisWeek' | 'general';

// 添加时间块相关的类型
export interface TimeBlock {
  hour: number;    // 24小时制
  minute: number;  // 0-59
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;      // 存储完整的日期对象
  startTime?: string;  // 24小时制，HH:mm 格式
  duration?: number;   // 分钟数
  endTime?: string;   // HH:mm format
  type: EventType;
}

export interface DragState {
  type: EventType;
  sourceType: EventType;
  eventId: string;
  originalDate: Date;
  originalStartTime?: string;
  originalDuration?: number;
  isDragging: boolean;
  currentPosition: {
    x: number;
    y: number;
  };
} 