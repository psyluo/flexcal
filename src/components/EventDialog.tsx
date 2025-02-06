import React, { useState } from 'react';
import styled from 'styled-components';
import { Dialog, DialogContent, TextField, DialogActions, Button, FormControlLabel, Checkbox } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { CalendarEvent, EventType } from '../types';
import { format } from 'date-fns';

const ClearButton = styled.button`
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin-left: 8px;

  &:hover {
    color: #f44336;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const FieldWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
`;

interface EventDialogProps {
  event: CalendarEvent;
  onClose: () => void;
  onSave: (event: CalendarEvent) => void;
  onDelete?: (event: CalendarEvent) => void;
}

const EventDialog: React.FC<EventDialogProps> = ({
  event,
  onClose,
  onSave,
  onDelete,
}) => {
  const [title, setTitle] = useState(event.title);
  const [description, setDescription] = useState(event.description || '');
  const [date, setDate] = useState<Date | null>(event.date ? new Date(event.date) : null);
  const [startTime, setStartTime] = useState(event.startTime || '');
  const [duration, setDuration] = useState(event.duration || 30);
  const [isThisWeek, setIsThisWeek] = useState(event.type === 'thisWeek');

  // 根据当前状态推导事件类型
  const deriveEventType = (
    hasDate: boolean,
    hasTime: boolean,
    isThisWeek: boolean
  ): EventType => {
    if (hasDate && hasTime) return 'scheduled';
    if (hasDate) return 'pool';
    if (isThisWeek) return 'thisWeek';
    return 'general';
  };

  const handleSave = () => {
    const type = deriveEventType(!!date, !!startTime, isThisWeek);
    onSave({
      ...event,
      title,
      description,
      type,
      date: date ? format(date, 'yyyy-MM-dd') : undefined,
      startTime: startTime || undefined,
      duration: type === 'scheduled' ? duration : undefined,
    });
  };

  const handleThisWeekChange = (checked: boolean) => {
    setIsThisWeek(checked);
    if (checked) {
      // 如果勾选"本周"，清除日期和时间
      setDate(null);
      setStartTime('');
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            margin="normal"
          />
          
          <TextField
            fullWidth
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={3}
            margin="normal"
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={isThisWeek}
                onChange={(e) => handleThisWeekChange(e.target.checked)}
              />
            }
            label="This Week"
            style={{ marginTop: 16, marginBottom: 16 }}
          />

          <FieldWrapper>
            <DatePicker
              label="Date"
              value={date}
              onChange={setDate}
              slotProps={{ textField: { fullWidth: true } }}
            />
            <ClearButton onClick={() => setDate(null)}>
              <svg viewBox="0 0 24 24">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </ClearButton>
          </FieldWrapper>

          <FieldWrapper>
            <TimePicker
              label="Start Time"
              value={startTime ? new Date(`2000-01-01T${startTime}`) : null}
              onChange={(date) => setStartTime(date ? format(date, 'HH:mm') : '')}
              disabled={!date}
              slotProps={{ textField: { fullWidth: true } }}
            />
            <ClearButton onClick={() => setStartTime('')} disabled={!date}>
              <svg viewBox="0 0 24 24">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </ClearButton>
          </FieldWrapper>

          <TextField
            fullWidth
            label="Duration (minutes)"
            type="number"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            disabled={!date || !startTime}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          {onDelete && !event.id.startsWith('new-') && (
            <Button onClick={() => onDelete(event)} color="error">
              Delete
            </Button>
          )}
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={!title}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default EventDialog; 