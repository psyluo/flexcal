import styled from 'styled-components';

export const AreaContainer = styled.div.attrs({
  className: 'area-container'
})`
  display: flex;
  flex-direction: column;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  position: relative;
  overflow: visible;
`;

export const AreaHeader = styled.div.attrs({
  className: 'area-header'
})`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #e0e0e0;
  background-color: #fafafa;
`;

export const AreaContent = styled.div.attrs({
  className: 'area-content'
})`
  background-color: white;
  min-height: 200px;
  max-height: 400px;
  padding: 12px;
  flex: 1;
  overflow-y: auto;
  position: relative;
  display: flex;
  flex-direction: column;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f8f8f8;
  }
`;

export const AreaTitle = styled.div.attrs({
  className: 'area-title'
})`
  font-size: 16px;
  font-weight: 500;
`;

export const AddButton = styled.button.attrs({
  className: 'add-button'
})`
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