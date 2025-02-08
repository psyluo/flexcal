import React from 'react';
import styled from 'styled-components';

interface LogoProps {
  size?: number;
}

const LogoText = styled.div<LogoProps>`
  font-size: ${props => props.size ? `${props.size/2}px` : '32px'};
  font-weight: bold;
  color: #7c3aed;
`;

export const Logo: React.FC<LogoProps> = ({ size = 24 }) => {
  return (
    <LogoText size={size}>
      FC
    </LogoText>
  );
}; 