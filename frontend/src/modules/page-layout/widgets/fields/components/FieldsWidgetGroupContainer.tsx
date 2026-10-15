import { styled } from '@linaria/react';
import { useState } from 'react';
import { Section } from 'twenty-ui/components';
import { IconChevronDown } from 'twenty-ui/icon';
import { Collapsible } from 'twenty-ui/primitives/layout';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';

const StyledGroup = styled.div`
  background: transparent;
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  margin-bottom: 12px;
  overflow: hidden;
`;
const StyledHeader = styled.button`
  align-items: center;
  background: transparent;
  border: 0;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.md};
  cursor: pointer;
  font: inherit;
  display: flex;
  min-height: ${themeCssVariables.spacing[8]};
  margin-bottom: 0;
  padding: 8px 12px;
  width: 100%;
  justify-content: space-between;

  &[aria-expanded='true'] {
    border-bottom: 2px solid ${themeCssVariables.color.blue9};
  }
  &[aria-expanded='true'] > div:first-child {
    color: ${themeCssVariables.color.blue11};
  }
  &:active {
    background: ${themeCssVariables.background.transparent.blue};
  }
  &:focus-visible {
    outline: 2px solid ${themeCssVariables.color.blue11};
    outline-offset: 2px;
  }
`;

const StyledTitleLabel = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledChevronWrapper = styled.div<{ isExpanded: boolean }>`
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  transform: ${({ isExpanded }) =>
    isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'};
  transition: transform
    calc(${themeCssVariables.animation.duration.normal} * 1s) ease;
`;

type FieldsWidgetGroupContainerProps = {
  children: React.ReactNode;
  title: string;
  defaultExpanded?: boolean;
};

export const FieldsWidgetGroupContainer = ({
  children,
  title,
  defaultExpanded = true,
}: FieldsWidgetGroupContainerProps) => {
  const theme = useTheme();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const handleToggleGroup = () =>
    setIsExpanded((previousIsExpanded) => !previousIsExpanded);

  return (
    <StyledGroup>
      <Section.Root>
        <StyledHeader
          type="button"
          aria-expanded={isExpanded}
          onClick={handleToggleGroup}
        >
          <StyledTitleLabel>{title}</StyledTitleLabel>
          <StyledChevronWrapper isExpanded={isExpanded}>
            <IconChevronDown
              size={theme.icon.size.md}
              stroke={theme.icon.stroke.sm}
            />
          </StyledChevronWrapper>
        </StyledHeader>
        <Collapsible isExpanded={isExpanded}>{children}</Collapsible>
      </Section.Root>
    </StyledGroup>
  );
};
