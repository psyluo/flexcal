import React from 'react';
import styled from 'styled-components';
import { CalendarEvent } from '../types';
import { format, addMinutes, parse } from 'date-fns';

const DialogOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;

const DialogContent = styled.div`
  background: white;
  padding: 24px;
  border-radius: 8px;
  min-width: 400px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 0 0 4px #4CAF50;
  position: relative;
  z-index: 10000;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 24px;
`;

const Button = styled.button<{ $danger?: boolean }>`
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background: ${props => props.$danger ? '#dc3545' : '#0d6efd'};
  color: white;
  cursor: pointer;

  &:hover {
    background: ${props => props.$danger ? '#c82333' : '#0b5ed7'};
  }
`;

const FormRow = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
`;

const FormColumn = styled.div`
  flex: 1;
`;

interface EventDialogProps {
  event: CalendarEvent;
  onClose: () => void;
  onSave: (event: CalendarEvent) => void;
  onDelete: (eventId: string) => void;
}

const EventDialog: React.FC<EventDialogProps> = ({
  event,
  onClose,
  onSave,
  onDelete
}) => {
  console.log('EventDialog: rendering with props:', { event, onClose, onSave, onDelete });

  if (!event) {
    console.error('EventDialog: No event provided');
    return null;
  }

  React.useEffect(() => {
    console.log('EventDialog: mounted');
    document.body.style.overflow = 'hidden';
    return () => {
      console.log('EventDialog: unmounted');
      document.body.style.overflow = 'auto';
    };
  }, []);

  const [title, setTitle] = React.useState(event.title);
  const [date, setDate] = React.useState(format(new Date(event.date), 'yyyy-MM-dd'));
  const [startTime, setStartTime] = React.useState(event.startTime || '');
  const [duration, setDuration] = React.useState(event.duration?.toString() || '30');

  // 计算结束时间
  const endTime = React.useMemo(() => {
    if (!startTime) return '';
    try {
      const [hours, minutes] = startTime.split(':').map(Number);
      const startDate = new Date();
      startDate.setHours(hours, minutes, 0);
      const endDate = addMinutes(startDate, parseInt(duration));
      return format(endDate, 'HH:mm');
    } catch (e) {
      return '';
    }
  }, [startTime, duration]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedEvent: CalendarEvent = {
      ...event,
      title,
      date: new Date(date),
      duration: parseInt(duration)
    };

    // 如果有开始时间，设置为 scheduled 类型
    if (startTime) {
      updatedEvent.type = 'scheduled';
      updatedEvent.startTime = startTime;
    } else {
      updatedEvent.type = 'pool';
      delete updatedEvent.startTime;
    }

    onSave(updatedEvent);
  };

  return (
    <DialogOverlay onClick={onClose}>
      <DialogContent onClick={e => e.stopPropagation()}>
        <h2 style={{ marginTop: 0, marginBottom: 16 }}>Edit Event</h2>
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>Title *</Label>
            <Input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </FormGroup>

          <FormRow>
            <FormColumn>
              <FormGroup>
                <Label>Date *</Label>
                <Input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  required
                />
              </FormGroup>
            </FormColumn>
            <FormColumn>
              <FormGroup>
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  step="900" // 15分钟步进
                />
              </FormGroup>
            </FormColumn>
          </FormRow>

          <FormRow>
            <FormColumn>
              <FormGroup>
                <Label>Duration (minutes) *</Label>
                <Input
                  type="number"
                  value={duration}
                  onChange={e => setDuration(e.target.value)}
                  min="15"
                  step="15"
                  required
                />
              </FormGroup>
            </FormColumn>
            <FormColumn>
              <FormGroup>
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={endTime}
                  disabled
                />
              </FormGroup>
            </FormColumn>
          </FormRow>

          <ButtonGroup>
            <Button type="submit">Save</Button>
            <Button 
              type="button" 
              $danger 
              onClick={() => onDelete(event.id)}
            >
              Delete
            </Button>
          </ButtonGroup>
        </form>
      </DialogContent>
    </DialogOverlay>
  );
};

export default EventDialog; 