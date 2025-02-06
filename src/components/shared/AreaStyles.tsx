export const AreaContent = styled.div`
  flex: 1;
  min-height: 60px;  // 设置最小高度
  padding: 4px;      // 统一内边距
  display: flex;     // 使用 flex 布局
  flex-direction: column;
  gap: 4px;         // 使用 gap 统一间距
  background-color: #f5f5f5;
  border-radius: 4px;
  transition: background-color 0.2s;
`;

export const AreaContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;         // 区域内部间距
  padding: 8px;     // 外部边距
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.12);
`; 