import React from 'react';
import styled from 'styled-components';
import { format } from 'date-fns';

const SwitcherContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
`;

const Button = styled.button`
  padding: 8px 16px;
  border: 1px solid #e0e0e0;
  background: white;
  cursor: pointer;
  border-radius: 4px;
  
  &:hover {
    background: #f5f5f5;
  }
`;

const CurrentWeek = styled.div`
  margin: 0 24px;
  font-size: 16px;
  font-weight: 500;
`;

interface WeekSwitcherProps {
  currentDate: Date;
  onPrevWeek: () => void;
  onNextWeek: () => void;
}

const WeekSwitcher: React.FC<WeekSwitcherProps> = ({
  currentDate,
  onPrevWeek,
  onNextWeek,
}) => {
  const monthYear = format(currentDate, 'MMMM yyyy');
  
  return (
    <SwitcherContainer>
      <Button onClick={onPrevWeek}>&lt; Previous Week</Button>
      <CurrentWeek>{monthYear}</CurrentWeek>
      <Button onClick={onNextWeek}>Next Week &gt;</Button>
    </SwitcherContainer>
  );
};

export default WeekSwitcher; 