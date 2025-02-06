export const AreaContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.12);
  padding: 8px;
  
  // 添加这个样式确保子元素等宽
  & > * {
    width: 100%;
    box-sizing: border-box;
  }
`;

export const AreaHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 40px;
  padding: 0 8px;
`;

export const AreaContent = styled.div`
  flex: 1;
  min-height: 60px;
  background-color: #f5f5f5;
  border-radius: 4px;
  transition: background-color 0.2s;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 4px 8px;
`;

export const AreaTitle = styled.div`
  font-weight: 500;
  font-size: 16px;
`;

export const AddButton = styled.button`
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: none;
  background-color: #f5f5f5;
  color: #1976d2;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #e0e0e0;
  }
`; 