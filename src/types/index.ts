export type EventType = 'pool' | 'scheduled';

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  startTime?: string;  // HH:mm format
  duration?: number;   // in minutes
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