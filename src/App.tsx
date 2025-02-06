import React from 'react';
import styled from 'styled-components';
import Calendar from './components/Calendar';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const AppContainer = styled.div`
  height: 100vh;
  overflow: hidden; // 确保不会出现滚动条
  position: relative; // 添加这个以确保对话框定位正确
`;

const App: React.FC = () => {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <AppContainer>
        <Calendar />
      </AppContainer>
    </LocalizationProvider>
  );
};

export default App; 