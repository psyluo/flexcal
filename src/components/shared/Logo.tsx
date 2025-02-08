import React from 'react';
import styled from 'styled-components';
import logoImage from '../../assets/logo.png';

interface LogoProps {
  size?: number;
}

const LogoImg = styled.img<LogoProps>`
  width: ${props => props.size || 24}px;
  height: ${props => props.size || 24}px;
  object-fit: contain;  // 保持宽高比
`;

export const Logo: React.FC<LogoProps> = ({ size = 24 }) => {
  return (
    <LogoImg 
      src={logoImage}
      size={64}
      alt="FlexCal Logo"
    />
  );
}; 