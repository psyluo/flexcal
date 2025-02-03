import { format, parseISO, startOfDay } from 'date-fns';

export const formatEventTime = (date: Date, timeString: string): Date => {
  const [hours, minutes] = timeString.split(':').map(Number);
  const eventDate = startOfDay(date);
  eventDate.setHours(hours);
  eventDate.setMinutes(minutes);
  return eventDate;
};

export const getTimeString = (date: Date): string => {
  return format(date, 'HH:mm');
}; 