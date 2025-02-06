export type EventType = 'scheduled' | 'pool' | 'thisWeek' | 'general';

// 添加时间块相关的类型
export interface TimeBlock {
  hour: number;    // 24小时制
  minute: number;  // 0-59
}

export interface TimePosition extends TimeBlock {
  totalMinutes: number;
}

export interface DroppableData {
  date: Date;
  type: EventType;
  timeBlock: TimeBlock;
  position?: TimePosition;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  type: EventType;
  date?: string;        // YYYY-MM-DD 格式
  startTime?: string;   // HH:mm 格式
  duration?: number;    // 分钟
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