import { styled } from '@linaria/react';
import { useState } from 'react';
import { useLingui } from '@lingui/react/macro';
import { Button } from 'twenty-ui/primitives/input';
import { RecordIndexCollection } from '@/object-record/record-index/components/RecordIndexCollection';

import { RecordBoardContainer } from '@/object-record/record-board/components/RecordBoardContainer';
import { RecordIndexTableContainer } from '@/object-record/record-index/components/RecordIndexTableContainer';
import { recordIndexViewTypeState } from '@/object-record/record-index/states/recordIndexViewTypeState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';

import { RecordIndexCalendarContainer } from '@/object-record/record-index/components/RecordIndexCalendarContainer';
import { RecordIndexEmptyStateNotShared } from '@/object-record/record-index/components/RecordIndexEmptyStateNotShared';
import { RecordIndexFiltersToContextStoreEffect } from '@/object-record/record-index/components/RecordIndexFiltersToContextStoreEffect';
import { useHasCurrentViewNonReadableFields } from '@/object-record/record-index/hooks/useHasCurrentViewNonReadableFields';
import { RecordListContainer } from '@/object-record/record-list/components/RecordListContainer';
import { ViewType } from '@/views/types/ViewType';
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme';

const StyledContainer = styled.div<{ isMain: boolean; isCollection?: boolean }>`
  background: ${({ isCollection }) =>
    isCollection
      ? themeCssVariables.background.secondary
      : themeCssVariables.background.primary};
  border: ${({ isMain, isCollection }) =>
    isMain && !isCollection
      ? `1px solid ${themeCssVariables.border.color.medium}`
      : 'none'};
  border-radius: ${({ isMain }) => (isMain ? '12px' : '0')};
  box-sizing: border-box;
  flex: 1;
  min-height: 0;
  margin: ${({ isMain }) =>
    isMain
      ? `0 ${themeCssVariables.spacing[8]} ${themeCssVariables.spacing[8]}`
      : '0'};
  max-width: ${({ isMain }) =>
    isMain ? `calc(100% - ${themeCssVariables.spacing[8]} * 2)` : '100%'};
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    margin: 0;
    max-width: 100%;
    border-radius: 0;
  }
  display: flex;
  flex-direction: column;
  height: auto;
  overflow: hidden;
  width: 100%;
`;

const StyledContainerWithPadding = styled.div`
  box-sizing: border-box;
  flex: 1;
  margin-left: ${themeCssVariables.spacing[2]};
  min-height: 0;
`;

const StyledLayoutSwitcher = styled.div`
  & > button[aria-pressed='true'] {
    box-shadow: inset 0 -2px ${themeCssVariables.color.blue9};
  }
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 4px 0;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  margin-bottom: 4px;
`;

export const RecordIndexContainer = () => {
  const { t } = useLingui();
  const [showTable, setShowTable] = useState(false);
  const surface = useWorkspaceSurface();
  const recordIndexViewType = useAtomComponentStateValue(
    recordIndexViewTypeState,
  );

  const { recordIndexId, objectMetadataItem, objectNameSingular } =
    useRecordIndexContextOrThrow();

  const { hasCurrentViewNonReadableFields, nonReadableViewFieldInfo } =
    useHasCurrentViewNonReadableFields(objectMetadataItem);

  const hasCollection =
    surface.type === 'main' && recordIndexViewType === ViewType.TABLE;
  const collectionLabel =
    objectNameSingular === 'opportunity'
      ? t`Pipeline`
      : objectMetadataItem.labelPlural;

  return (
    <StyledContainer
      isMain={surface.type === 'main'}
      isCollection={hasCollection && !showTable}
    >
      {hasCurrentViewNonReadableFields ? (
        <RecordIndexEmptyStateNotShared
          nonReadableViewFieldInfo={nonReadableViewFieldInfo}
        />
      ) : (
        <>
          <RecordIndexFiltersToContextStoreEffect />
          {hasCollection && (
            <StyledLayoutSwitcher role="group" aria-label={t`Record layout`}>
              <Button
                size="sm"
                color="neutral"
                variant={!showTable ? 'soft' : 'ghost'}
                aria-pressed={!showTable}
                onClick={() => setShowTable(false)}
              >
                {collectionLabel}
              </Button>
              <Button
                size="sm"
                color="neutral"
                variant={showTable ? 'soft' : 'ghost'}
                aria-pressed={showTable}
                onClick={() => setShowTable(true)}
              >{t`Table / bulk edit`}</Button>
            </StyledLayoutSwitcher>
          )}
          {hasCollection && !showTable && <RecordIndexCollection />}
          {recordIndexViewType === ViewType.TABLE &&
            (!hasCollection || showTable) && (
              <RecordIndexTableContainer recordTableId={recordIndexId} />
            )}
          {recordIndexViewType === ViewType.KANBAN && (
            <StyledContainerWithPadding>
              <RecordBoardContainer
                recordBoardId={recordIndexId}
                viewBarId={recordIndexId}
                objectNameSingular={objectNameSingular}
              />
            </StyledContainerWithPadding>
          )}
          {recordIndexViewType === ViewType.CALENDAR && (
            <StyledContainerWithPadding>
              <RecordIndexCalendarContainer />
            </StyledContainerWithPadding>
          )}
          {recordIndexViewType === ViewType.LIST && (
            <StyledContainerWithPadding>
              <RecordListContainer
                objectNameSingular={objectNameSingular}
                viewBarInstanceId={recordIndexId}
              />
            </StyledContainerWithPadding>
          )}
        </>
      )}
    </StyledContainer>
  );
};
