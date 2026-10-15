import { FieldDescriptionTooltip } from '@/object-record/record-field/ui/components/FieldDescriptionTooltip';
import { styled } from '@linaria/react';
import { useContext } from 'react';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';

import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useFieldFocus } from '@/object-record/record-field/ui/hooks/useFieldFocus';
import { RecordInlineCellValue } from '@/object-record/record-inline-cell/components/RecordInlineCellValue';

import { assertFieldMetadata } from '@/object-record/record-field/ui/types/guards/assertFieldMetadata';
import { isFieldText } from '@/object-record/record-field/ui/types/guards/isFieldText';
import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { Tooltip } from 'twenty-ui/primitives/surfaces';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { useRecordInlineCellContext } from './RecordInlineCellContext';

const StyledIconContainer = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  width: ${themeCssVariables.spacing[4]};

  svg {
    align-items: center;
    display: flex;
    height: ${themeCssVariables.spacing[4]};
    justify-content: center;
    width: ${themeCssVariables.spacing[4]};
  }
`;

const StyledLabelAndIconContainer = styled.div`
  align-items: center;
  align-self: flex-start;
  flex-shrink: 0;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  height: ${themeCssVariables.spacing[8]};
`;

const StyledValueContainer = styled.div<{ readonly: boolean }>`
  display: flex;
  min-width: 0;
  position: relative;
  user-select: text;
  width: 100%;
`;

const StyledLabelContainer = styled.div<{ width?: number }>`
  color: ${themeCssVariables.font.color.secondary};
  font-size: var(--record-field-label-size, ${themeCssVariables.font.size.md});
  width: ${({ width }) => (width !== undefined ? `${width}px` : 'auto')};
`;

const StyledInlineCellBaseContainer = styled.div<{ readonly: boolean }>`
  align-items: center;
  box-sizing: border-box;
  cursor: ${({ readonly }) => (readonly ? 'default' : 'pointer')};
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  height: fit-content;
  user-select: none;
  width: 100%;
`;

export const StyledSkeletonDiv = styled.div`
  height: ${themeCssVariables.spacing[8]};
`;

export const RecordInlineCellContainer = () => {
  const { readonly, IconLabel, label, labelWidth, showLabel } =
    useRecordInlineCellContext();
  const theme = useTheme();

  const { fieldDefinition, onMouseEnter, onMouseLeave, anchorId } =
    useContext(FieldContext);

  if (isFieldText(fieldDefinition)) {
    assertFieldMetadata(FieldMetadataType.TEXT, isFieldText, fieldDefinition);
  }

  const { setIsFocused } = useFieldFocus();

  const handleContainerMouseEnter = () => {
    if (!readonly) {
      setIsFocused(true);
    }
    onMouseEnter?.();
  };

  const handleContainerMouseLeave = () => {
    if (!readonly) {
      setIsFocused(false);
    }
    onMouseLeave?.();
  };

  return (
    <StyledInlineCellBaseContainer
      readonly={readonly ?? false}
      onMouseEnter={handleContainerMouseEnter}
      onMouseLeave={handleContainerMouseLeave}
    >
      {(IconLabel || label) && (
        <Tooltip
          content={label}
          disabled={showLabel}
          side="bottom"
          positionMethod="fixed"
          delay={TooltipDelay.shortDelay}
        >
          <StyledLabelAndIconContainer>
            {IconLabel && (
              <StyledIconContainer>
                <IconLabel stroke={theme.icon.stroke.sm} />
              </StyledIconContainer>
            )}
            {showLabel && (
              <StyledLabelContainer width={labelWidth}>
                <FieldDescriptionTooltip
                  label={label}
                  description={fieldDefinition?.metadata?.description}
                  fallback={
                    <OverflowingTextWithTooltip
                      text={label}
                      displayedMaxRows={1}
                    />
                  }
                />
              </StyledLabelContainer>
            )}
          </StyledLabelAndIconContainer>
        </Tooltip>
      )}
      <StyledValueContainer readonly={readonly ?? false} id={anchorId}>
        <RecordInlineCellValue />
      </StyledValueContainer>
    </StyledInlineCellBaseContainer>
  );
};
