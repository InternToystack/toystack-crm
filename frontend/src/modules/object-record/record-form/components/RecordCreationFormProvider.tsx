import { RecordCreationFormModal } from '@/object-record/record-form/components/RecordCreationFormModal';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { useSidePanelHistory } from '@/side-panel/hooks/useSidePanelHistory';
import { useToast } from 'twenty-ui/components';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { RecordCreationFormCancellationEffect } from '@/object-record/record-form/components/RecordCreationFormCancellationEffect';
import {
  RecordCreationFormContextProvider,
  type RecordCreationFormContextValue,
} from '@/object-record/record-form/contexts/RecordCreationFormContext';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { recordCreationFormRequestComponentState } from '@/side-panel/pages/record-creation-form/states/recordCreationFormRequestComponentState';
import { t } from '@lingui/core/macro';
import { useStore } from 'jotai';
import { type ReactNode, useCallback, useMemo, useState } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconPlus } from 'twenty-ui/icon';
import { v4 } from 'uuid';

type PendingRecordCreation = {
  requestId: string;
  createRecord: (draftRecord: Partial<ObjectRecord>) => Promise<ObjectRecord>;
  resolve: (createdRecord: ObjectRecord | null) => void;
  isSettling: boolean;
  presentation: 'side-panel' | 'modal';
};

type RecordCreationFormProviderProps = {
  children: ReactNode;
};

export const RecordCreationFormProvider = ({
  children,
}: RecordCreationFormProviderProps) => {
  const store = useStore();
  const { openDialog, closeDialog } = useDialog();
  const { enqueueToast } = useToast();
  const { removePageFromSidePanelHistory } = useSidePanelHistory();
  const { navigateSidePanelMenu } = useSidePanelMenu();

  const [pendingRecordCreations, setPendingRecordCreations] = useState<
    PendingRecordCreation[]
  >([]);

  const settleRecordCreationDraft = useCallback(
    async ({
      requestId,
      draftRecord,
    }: {
      requestId: string;
      draftRecord: Partial<ObjectRecord> | null;
    }) => {
      const pendingRecordCreation = pendingRecordCreations.find(
        (candidate) => candidate.requestId === requestId,
      );

      if (
        !isDefined(pendingRecordCreation) ||
        pendingRecordCreation.isSettling
      ) {
        return;
      }

      if (draftRecord === null) {
        if (pendingRecordCreation.presentation === 'modal')
          closeDialog(requestId);
        pendingRecordCreation.resolve(null);

        setPendingRecordCreations((previousPendingRecordCreations) =>
          previousPendingRecordCreations.filter(
            (candidate) => candidate.requestId !== requestId,
          ),
        );

        return;
      }

      setPendingRecordCreations((previousPendingRecordCreations) =>
        previousPendingRecordCreations.map((candidate) =>
          candidate.requestId === requestId
            ? { ...candidate, isSettling: true }
            : candidate,
        ),
      );

      let createdRecord: ObjectRecord;

      try {
        createdRecord = await pendingRecordCreation.createRecord(draftRecord);
      } catch (error) {
        setPendingRecordCreations((previousPendingRecordCreations) =>
          previousPendingRecordCreations.map((candidate) =>
            candidate.requestId === requestId
              ? { ...candidate, isSettling: false }
              : candidate,
          ),
        );

        enqueueToast(getToastOptionsFromError({ error }));

        return;
      }

      if (pendingRecordCreation.presentation === 'modal')
        closeDialog(requestId);
      else removePageFromSidePanelHistory(requestId);

      pendingRecordCreation.resolve(createdRecord);

      setPendingRecordCreations((previousPendingRecordCreations) =>
        previousPendingRecordCreations.filter(
          (candidate) => candidate.requestId !== requestId,
        ),
      );
    },
    [
      enqueueToast,
      pendingRecordCreations,
      removePageFromSidePanelHistory,
      closeDialog,
    ],
  );

  const requestRecordCreation = useCallback(
    ({
      objectMetadataItem,
      initialDraftRecord,
      createRecord,
      presentation = 'side-panel',
    }: {
      objectMetadataItem: EnrichedObjectMetadataItem;
      initialDraftRecord?: Partial<ObjectRecord>;
      presentation?: 'side-panel' | 'modal';
      createRecord: (
        draftRecord: Partial<ObjectRecord>,
      ) => Promise<ObjectRecord>;
    }) => {
      const requestId = v4();

      store.set(
        recordCreationFormRequestComponentState.atomFamily({
          instanceId: requestId,
        }),
        {
          requestId,
          objectMetadataId: objectMetadataItem.id,
          initialDraftRecord: initialDraftRecord ?? {},
        },
      );

      return new Promise<ObjectRecord | null>((resolve) => {
        setPendingRecordCreations((previousPendingRecordCreations) => [
          ...previousPendingRecordCreations,
          {
            requestId,
            createRecord,
            resolve,
            isSettling: false,
            presentation,
          },
        ]);

        if (presentation === 'modal') {
          openDialog(requestId);
          return;
        }
        navigateSidePanelMenu({
          page: SidePanelPages.RecordCreationForm,
          pageTitle: t`Create ${objectMetadataItem.labelSingular}`,
          pageIcon: IconPlus,
          pageId: requestId,
        });
      });
    },
    [navigateSidePanelMenu, store, openDialog],
  );

  const cancelPendingRecordCreation = useCallback(
    ({ requestId }: { requestId: string }) => {
      settleRecordCreationDraft({ requestId, draftRecord: null });
    },
    [settleRecordCreationDraft],
  );

  const contextValue = useMemo<RecordCreationFormContextValue>(
    () => ({ requestRecordCreation, settleRecordCreationDraft }),
    [requestRecordCreation, settleRecordCreationDraft],
  );

  return (
    <RecordCreationFormContextProvider value={contextValue}>
      {children}
      {pendingRecordCreations.map(({ requestId, presentation, isSettling }) =>
        presentation === 'modal' ? (
          <RecordCreationFormModal
            key={requestId}
            requestId={requestId}
            isSubmitting={isSettling}
            onCancel={() => cancelPendingRecordCreation({ requestId })}
          />
        ) : (
          <RecordCreationFormCancellationEffect
            key={requestId}
            requestId={requestId}
            onCancel={cancelPendingRecordCreation}
          />
        ),
      )}
    </RecordCreationFormContextProvider>
  );
};
