import { cx } from '@linaria/core';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';

export const StyledCell = styled.div<{
  backgroundColor: string;
  borderColor: string;
  isDragging?: boolean;
  isSelected?: boolean;
  fontColor: string;
  hasRightBorder?: boolean;
  hasBottomBorder?: boolean;
}>`
  background: ${({ backgroundColor, isDragging }) =>
    isDragging ? 'transparent' : backgroundColor};

  border-bottom: 1px solid
    ${({ borderColor, hasBottomBorder, isDragging }) =>
      hasBottomBorder && !isDragging ? borderColor : 'transparent'};
  border-right: ${({ borderColor, hasRightBorder }) =>
    hasRightBorder ? `1px solid ${borderColor}` : 'none'};

  color: ${({ fontColor }) => fontColor};

  @media (hover: hover) {
    &:hover {
      background: ${({ isSelected, isDragging, backgroundColor }) =>
        isDragging
          ? 'transparent'
          : isSelected
            ? backgroundColor
            : themeCssVariables.background.secondary};
    }
  }

  padding: 0;

  text-align: left;
`;

export const RecordTableCellStyleWrapper = ({
  children,
  isSelected,
  isDragging,
  hasRightBorder = true,
  hasBottomBorder = true,
  widthClassName,
  ...divProps
}: {
  className?: string;
  children?: ReactNode;
  isSelected?: boolean;
  isDragging?: boolean;
  hasRightBorder?: boolean;
  hasBottomBorder?: boolean;
  widthClassName: string;
} & React.ComponentProps<'div'>) => {
  const theme = useTheme();

  const tdBackgroundColor = isSelected
    ? theme.accent.quaternary
    : theme.background.primary;

  const borderColor = theme.border.color.light;

  const fontColor = theme.font.color.primary;

  return (
    <StyledCell
      isDragging={isDragging}
      isSelected={isSelected}
      backgroundColor={tdBackgroundColor}
      borderColor={borderColor}
      fontColor={fontColor}
      hasRightBorder={hasRightBorder}
      hasBottomBorder={hasBottomBorder}
      // oxlint-disable-next-line react/jsx-props-no-spreading
      {...divProps}
      className={cx('table-cell', widthClassName)}
    >
      {children}
    </StyledCell>
  );
};
