import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme';

type TopBarProps = {
  className?: string;
  leftComponent?: ReactNode;
  rightComponent?: ReactNode;
  bottomComponent?: ReactNode;
  displayBottomBorder?: boolean;
};

const StyledContainer = styled.div`
  border-bottom: none;
  display: flex;
  flex-direction: column;

  margin: 0 ${themeCssVariables.spacing[8]};
`;

const StyledTopBar = styled.div`
  align-items: center;

  box-sizing: border-box;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 12px;
  padding: 8px 0;
  font-weight: ${themeCssVariables.font.weight.medium};
  min-height: 52px;
  justify-content: space-between;
  margin-left: ${themeCssVariables.spacing[1]};
  padding-right: 0;

  z-index: 7;
  button {
    min-height: 36px;
    font-size: 14px;
  }
`;

const StyledLeftSection = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  min-width: 0;
`;

const StyledRightSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  font-weight: ${themeCssVariables.font.weight.regular};
  gap: ${themeCssVariables.betweenSiblingsGap};
`;

export const TopBar = ({
  className,
  leftComponent,
  rightComponent,
  bottomComponent,
}: TopBarProps) => (
  <StyledContainer className={className}>
    <StyledTopBar>
      <StyledLeftSection>{leftComponent}</StyledLeftSection>
      <StyledRightSection>{rightComponent}</StyledRightSection>
    </StyledTopBar>
    {bottomComponent}
  </StyledContainer>
);
