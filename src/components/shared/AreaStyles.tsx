import styled from 'styled-components';

interface EventListContainerProps {
  $isOver?: boolean;
}

export const AreaContainer = styled.div.attrs(props => ({
  'data-testid': 'area-container',
  'data-area-type': props.className || 'unknown',
  'data-role': 'area-container',
  className: 'area-container'
}))`
  display: flex;
  flex-direction: column;
  width: 300px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  box-sizing: border-box;
  position: relative;
`;
AreaContainer.displayName = 'AreaContainer';

export const AreaHeader = styled.div.attrs({
  'data-testid': 'area-header',
  'data-role': 'area-header',
  className: 'area-header'
})`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 40px;
  padding: 0 16px;
  width: 100%;
  box-sizing: border-box;
  background: #fafafa;
  border-bottom: 1px solid #e0e0e0;
`;
AreaHeader.displayName = 'AreaHeader';

export const AreaContent = styled.div.attrs({
  'data-testid': 'area-content',
  'data-role': 'area-content',
  className: 'area-content'
})`
  background-color: white;
  min-height: 200px;
  max-height: 400px;
  padding: 0;
  flex: 1;
  overflow-y: auto;
  position: relative;
  display: flex;
  flex-direction: column;
  transition: background-color 0.2s;
  height: 100%;
  width: 100%;

  &:hover {
    background-color: #f8f8f8;
  }
`;
AreaContent.displayName = 'AreaContent';

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

export const EventListContainer = styled.div.attrs({
  className: 'event-list-container'
})<EventListContainerProps>`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  height: 100%;
  position: relative;
  padding: 12px;
  box-sizing: border-box;
  background-color: ${props => props.$isOver ? 'rgba(0, 0, 0, 0.05)' : 'transparent'};
  transition: background-color 0.2s;

  &:hover {
    background-color: #f8f8f8;
  }
`;