import styled from 'styled-components';

export const AreaContainer = styled.div`
  border: 1px solid #e0e0e0;
  background: white;
  border-radius: 4px;
  overflow: hidden;
`;

export const AreaHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #e0e0e0;
  background-color: #fafafa;
`;

export const AreaTitle = styled.div`
  font-size: 16px;
  font-weight: 500;
`;

export const AddButton = styled.button`
  width: 24px;
  height: 24px;
  border-radius: 12px;
  border: none;
  background-color: #e3e3e3;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  line-height: 1;
  padding: 0;
  
  &:hover {
    background-color: #d4d4d4;
  }
`;

export const AreaContent = styled.div`
  padding: 16px;
  min-height: 80px;
`; 