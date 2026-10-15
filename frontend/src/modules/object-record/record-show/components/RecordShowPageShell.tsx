import { type ErrorLike } from '@apollo/client';
import { type ReactNode } from 'react';
import { t } from '@lingui/core/macro';
import { SkeletonLoader } from '@/activities/components/SkeletonLoader';
import { EmptyState } from '@/ui/feedback/empty-state/components/EmptyState';
import { PageCardHeader } from '@/ui/layout/page/components/PageCardHeader';
import { Button } from 'twenty-ui/primitives/input';
import { isDefined } from 'twenty-shared/utils';

import { TimelineActivityContext } from '@/activities/timeline-activities/contexts/TimelineActivityContext';
import { WorkspaceRouteUnavailable } from '@/app/routing/components/WorkspaceRouteUnavailable';
import { RecordShowCommandMenu } from '@/command-menu-item/components/RecordShowCommandMenu';
import { CommandMenuComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuComponentInstanceContext';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { RecordComponentInstanceContextsWrapper } from '@/object-record/components/RecordComponentInstanceContextsWrapper';
import { PageLayoutRecordPageRenderer } from '@/object-record/record-show/components/PageLayoutRecordPageRenderer';
import { RecordShowPageResourceEffect } from '@/object-record/record-show/components/RecordShowPageResourceEffect';
import { RecordShowPageSSESubscribeEffect } from '@/object-record/record-show/components/RecordShowPageSSESubscribeEffect';
import { computeRecordShowComponentInstanceId } from '@/object-record/record-show/utils/computeRecordShowComponentInstanceId';
import { type RecordShowPageHeaderTitleMode } from '@/object-record/record-show/types/RecordShowPageHeaderTitleMode';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { SidePanelToggleButton } from '@/side-panel/components/SidePanelToggleButton';
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import { useWorkspaceSurfaceScopedComponentInstanceId } from '@/ui/layout/hooks/useWorkspaceSurfaceScopedComponentInstanceId';
import { PageCardLayout } from '@/ui/layout/page/components/PageCardLayout';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { RecordShowPageHeader } from '~/pages/object-record/RecordShowPageHeader';
import { RecordShowPageTitle } from '~/pages/object-record/RecordShowPageTitle';

type RecordShowPageShellProps = {
  objectNameSingular: string;
  objectRecordId: string;
  record: ObjectRecord | undefined;
  loading: boolean;
  error?: ErrorLike;
  onRetry?: () => Promise<unknown>;
  headerActions?: ReactNode;
  headerTitleMode?: RecordShowPageHeaderTitleMode;
  isRecordIdentifierBarHidden?: boolean;
};

export const RecordShowPageShell = ({
  objectNameSingular,
  objectRecordId,
  record,
  loading,
  error,
  onRetry,
  headerActions,
  headerTitleMode,
  isRecordIdentifierBarHidden = false,
}: RecordShowPageShellProps) => {
  const isInSidePanel = useWorkspaceSurface().type === 'side-panel';
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );

  const recordShowComponentInstanceId =
    useWorkspaceSurfaceScopedComponentInstanceId(
      computeRecordShowComponentInstanceId(objectRecordId),
    );

  const resourceEffect = (
    <RecordShowPageResourceEffect
      loading={loading || isDefined(error)}
      record={record}
      recordId={objectRecordId}
    />
  );

  if (!isDefined(record) && isDefined(error)) {
    return (
      <>
        {resourceEffect}
        <EmptyState.Root>
          <EmptyState.Content>
            <EmptyState.Title>{t`This record could not load`}</EmptyState.Title>
            <EmptyState.Description>{t`Check your connection and try again. If the problem continues, contact your workspace administrator.`}</EmptyState.Description>
          </EmptyState.Content>
          {onRetry && (
            <Button
              onClick={() => void onRetry().catch(() => undefined)}
              loading={loading}
            >{t`Retry`}</Button>
          )}
        </EmptyState.Root>
      </>
    );
  }

  if (!isDefined(record) && loading) {
    return (
      <PageCardLayout header={<PageCardHeader title={t`Loading record`} />}>
        <SkeletonLoader />
      </PageCardLayout>
    );
  }

  if (!isDefined(record)) {
    return (
      <>
        {resourceEffect}
        <WorkspaceRouteUnavailable>{t`This record is unavailable. It may have been deleted or you may not have access. Return to the module to find another record.`}</WorkspaceRouteUnavailable>
      </>
    );
  }

  return (
    <RecordComponentInstanceContextsWrapper
      componentInstanceId={recordShowComponentInstanceId}
    >
      <CommandMenuComponentInstanceContext.Provider
        value={{ instanceId: recordShowComponentInstanceId }}
      >
        {resourceEffect}
        <RecordShowPageTitle
          objectNameSingular={objectNameSingular}
          objectRecordId={objectRecordId}
        />
        <PageCardLayout
          header={
            <RecordShowPageHeader
              objectNameSingular={objectNameSingular}
              objectRecordId={objectRecordId}
              titleMode={headerTitleMode}
            >
              {!isInSidePanel && (
                <>
                  <RecordShowCommandMenu />
                  {!isLayoutCustomizationModeEnabled && (
                    <SidePanelToggleButton />
                  )}
                  {headerActions}
                </>
              )}
            </RecordShowPageHeader>
          }
        >
          <TimelineActivityContext.Provider
            value={{
              recordId: objectRecordId,
            }}
          >
            <PageLayoutRecordPageRenderer
              targetRecordIdentifier={{
                id: objectRecordId,
                targetObjectNameSingular: objectNameSingular,
              }}
              isRecordIdentifierBarHidden={isRecordIdentifierBarHidden}
            />
            <RecordShowPageSSESubscribeEffect
              objectNameSingular={objectNameSingular}
              recordId={objectRecordId}
            />
          </TimelineActivityContext.Provider>
        </PageCardLayout>
      </CommandMenuComponentInstanceContext.Provider>
    </RecordComponentInstanceContextsWrapper>
  );
};
