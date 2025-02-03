import React from 'react';
import styled from 'styled-components';
import Calendar from './components/Calendar';

const AppContainer = styled.div`
  height: 100vh;
  overflow: hidden; // 确保不会出现滚动条
  position: relative; // 添加这个以确保对话框定位正确
`;

const App: React.FC = () => {
  return (
    <AppContainer>
      <Calendar />
    </AppContainer>
  );
};

export default App; 