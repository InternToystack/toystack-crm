import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { themeCssVariables } from 'twenty-ui/theme';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';

const StyledTitleWithSelectedRecords = styled.div`
  display: flex;
  align-items: center;
  flex-direction: row;
  min-width: 0;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledTitle = styled.div`
  color: ${themeCssVariables.font.color.primary};
  min-width: 0;
  padding-right: ${themeCssVariables.spacing['0.5']};
`;

const StyledSelectedRecordsCount = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  flex-shrink: 0;
  padding-left: ${themeCssVariables.spacing['0.5']};
`;

type RecordIndexPageHeaderTitleProps = {
  label: string;
  numberOfSelectedRecords: number;
};

export const RecordIndexPageHeaderTitle = ({
  label,
  numberOfSelectedRecords,
}: RecordIndexPageHeaderTitleProps) => {
  const { formatNumber } = useNumberFormat();

  if (numberOfSelectedRecords === 0) {
    return <OverflowingTextWithTooltip text={label} />;
  }

  return (
    <StyledTitleWithSelectedRecords>
      <StyledTitle>
        <OverflowingTextWithTooltip text={label} />
      </StyledTitle>
      <>{'->'}</>
      <StyledSelectedRecordsCount>
        {t`${formatNumber(numberOfSelectedRecords)} selected`}
      </StyledSelectedRecordsCount>
    </StyledTitleWithSelectedRecords>
  );
};
