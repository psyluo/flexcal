import React, { useState } from 'react';
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

const DialogHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
`;

const DialogBody = styled.div`
  margin-bottom: 24px;
`;

const DialogFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: #dc3545;
  cursor: pointer;
`;

const SaveButton = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background: #0d6efd;
  color: white;
  cursor: pointer;
  margin-left: auto;

  &:disabled {
    background: #6c757d;
    cursor: not-allowed;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
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
  onDelete,
}) => {
  const [title, setTitle] = useState(event.title);
  const [date, setDate] = useState(event.date?.toISOString().split('T')[0] || '');
  const [startTime, setStartTime] = useState(event.startTime || '');
  const [duration, setDuration] = useState(event.duration || 30);
  const [roughTime, setRoughTime] = useState(event.roughTime || '');

  const handleSave = () => {
    const updatedEvent: CalendarEvent = {
      ...event,
      title,
      duration,
      ...(date ? { date: new Date(date) } : {}),
      ...(startTime ? { startTime } : {}),
      ...(roughTime ? { roughTime } : {})
    };
    onSave(updatedEvent);
  };

  return (
    <DialogOverlay onClick={onClose}>
      <DialogContent onClick={e => e.stopPropagation()}>
        <DialogHeader>
          <h2>{event.id.startsWith('new-') ? 'New Event' : 'Edit Event'}</h2>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </DialogHeader>

        <DialogBody>
          <FormGroup>
            <Label>Title *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Event title"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>Date</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </FormGroup>

          <FormGroup>
            <Label>Start Time</Label>
            <Input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </FormGroup>

          <FormGroup>
            <Label>Duration (minutes) *</Label>
            <Input
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              min="1"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>Rough Time</Label>
            <Select
              value={roughTime}
              onChange={(e) => setRoughTime(e.target.value)}
            >
              <option value="">Select time</option>
              <option value="this-week">This Week</option>
            </Select>
          </FormGroup>
        </DialogBody>

        <DialogFooter>
          {!event.id.startsWith('new-') && (
            <DeleteButton onClick={() => onDelete(event.id)}>
              Delete
            </DeleteButton>
          )}
          <SaveButton onClick={handleSave} disabled={!title || !duration}>
            Save
          </SaveButton>
        </DialogFooter>
      </DialogContent>
    </DialogOverlay>
  );
};

export default EventDialog; 