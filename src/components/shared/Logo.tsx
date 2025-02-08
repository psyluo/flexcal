import React from 'react';
import styled from 'styled-components';
import logoImage from '../../assets/logo.png';  // 使用实际的 Logo 文件

interface LogoProps {
  size?: number;
}

const LogoImg = styled.img<LogoProps>`
  width: ${props => props.size || 24}px;
  height: ${props => props.size || 24}px;
  object-fit: contain;
`;

export const Logo: React.FC<LogoProps> = ({ size = 24 }) => {
  return (
    <LogoImg 
      src={logoImage}
      size={size}
      alt="FlexCal Logo"
    />
  );
}; 