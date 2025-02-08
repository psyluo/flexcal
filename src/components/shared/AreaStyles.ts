import styled from 'styled-components';

interface EventListContainerProps {
  $isOver?: boolean;
}

// 定义并导出主题色
export const THEME = {
  // 主色
  primary: '#9333ea',      // 更深的紫色
  primaryLight: '#a855f7', // 亮紫色
  primaryDark: '#7e22ce',  // 暗紫色
  
  // 强调色
  accent: '#f97316',       // 橙色
  accentLight: '#fb923c',  // 浅橙色
  accentSecondary: '#3b82f6', // 蓝色
  
  // 背景色
  bgPrimary: '#ffffff',    // 主背景
  bgSecondary: '#faf5ff',  // 带紫色的浅色背景
  bgHover: '#f3e8ff',      // 更明显的紫色悬浮背景
  
  // 事件相关
  eventBg: {
    purple: '#f3e8ff',     // 紫色事件
    orange: '#fff7ed',     // 橙色事件
    blue: '#eff6ff',       // 蓝色事件
  },
  eventBorder: {
    purple: '#d8b4fe',     // 紫色边框
    orange: '#fdba74',     // 橙色边框
    blue: '#93c5fd',       // 蓝色边框
  },
  eventHover: {
    purple: '#e9d5ff',     // 紫色悬浮
    orange: '#fed7aa',     // 橙色悬浮
    blue: '#bfdbfe',       // 蓝色悬浮
  },
  
  // 文字颜色
  textPrimary: '#1e293b',   // 主要文字
  textSecondary: '#64748b', // 次要文字
  textLight: '#ffffff',     // 亮色文字
  
  // 边框
  border: '#e2e8f0',        // 通用边框
  borderLight: '#f1f5f9',   // 浅色边框

  // 更新为更偏蓝的色调
  teal: {
    primary: '#0891b2',    // 更蓝的主色 (原来是 #0d9488)
    dark: '#0e7490',       // 更蓝的深色 (原来是 #0f766e)
    light: '#06b6d4',      // 更蓝的浅色 (原来是 #14b8a6)
  },
};

export const AreaContainer = styled.div.attrs(props => ({
  'data-testid': 'area-container',
  'data-area-type': props.className || 'unknown',
  'data-role': 'area-container',
  className: 'area-container'
}))`
  display: flex;
  flex-direction: column;
  width: 240px;
  border: none;
  border-radius: 4px;
  position: relative;
  overflow: visible;
  background: white;
`;

export const AreaHeader = styled.div.attrs({
  'data-testid': 'area-header',
  'data-role': 'area-header',
  className: 'area-header'
})`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: linear-gradient(135deg, 
    ${THEME.teal.light} -20%, 
    ${THEME.teal.dark} 120%);  // 扩大渐变范围
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 5px;

  &:hover {
    background: linear-gradient(135deg, 
      ${THEME.teal.primary} -20%, 
      ${THEME.teal.light} 120%);  // hover 时也扩大渐变范围
  }
`;

export const AreaContent = styled.div.attrs({
  'data-testid': 'area-content',
  'data-role': 'area-content',
  className: 'area-content'
})`
  background-color: white;
  min-height: 200px;
  padding: 5px 0 0 0;
  flex: 1;
  overflow-y: auto;
  position: relative;
  display: flex;
  flex-direction: column;
  transition: background-color 0.2s;
  height: auto;
  width: 100%;

  &:hover {
    background-color: ${THEME.hover};
  }
`;

export const AreaTitle = styled.div.attrs({
  className: 'area-title'
})`
  font-size: 16px;
  font-weight: 600;
  color: ${THEME.textLight};
  letter-spacing: 0.3px;
`;

export const AddButton = styled.button.attrs({
  className: 'add-button'
})`
  width: 26px;
  height: 26px;
  border-radius: 13px;
  border: none;
  background-color: rgba(255, 255, 255, 0.15);
  color: ${THEME.textLight};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  line-height: 1;
  padding: 0;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.25);
    transform: translateY(-1px);
  }
`;

export const EventListContainer = styled.div.attrs({
  className: 'event-list-container'
})<EventListContainerProps>`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  min-height: 100%;
  position: relative;
  padding: 16px;
  background-color: ${props => props.$isOver ? THEME.bgHover : THEME.bgPrimary};
  transition: all 0.2s ease;

  &:hover {
    background-color: ${THEME.bgSecondary};
  }
`;

// ... (之前的其他样式定义) 