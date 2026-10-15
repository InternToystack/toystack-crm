import { RecordCreationFormModal } from '@/object-record/record-form/components/RecordCreationFormModal';
import { recordCreationFormDraftComponentState } from '@/side-panel/pages/record-creation-form/states/recordCreationFormDraftComponentState';
import { RecordCreationFormProvider } from '@/object-record/record-form/components/RecordCreationFormProvider';
import { useRecordCreationFormContextOrThrow } from '@/object-record/record-form/contexts/RecordCreationFormContext';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import {
  sidePanelNavigationStackState,
  type SidePanelNavigationStackItem,
} from '@/side-panel/states/sidePanelNavigationStackState';
import { act, renderHook } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { type ReactNode } from 'react';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

jest.mock(
  '@/object-record/record-form/components/RecordCreationFormModal',
  () => ({ RecordCreationFormModal: jest.fn(() => null) }),
);
const mockOpenDialog = jest.fn();
const mockCloseDialog = jest.fn();
jest.mock('@/ui/layout/dialog/hooks/useDialog', () => ({
  useDialog: () => ({
    openDialog: mockOpenDialog,
    closeDialog: mockCloseDialog,
  }),
}));

const mockNavigateSidePanelMenu = jest.fn();
const mockCloseSidePanelMenu = jest.fn();

jest.mock('@/side-panel/hooks/useSidePanelMenu', () => ({
  useSidePanelMenu: () => ({
    navigateSidePanelMenu: mockNavigateSidePanelMenu,
    closeSidePanelMenu: mockCloseSidePanelMenu,
  }),
}));
jest.mock('twenty-ui/components', () => ({
  ...jest.requireActual('twenty-ui/components'),
  useToast: () => ({ enqueueToast: jest.fn() }),
}));

const setup = () => {
  const store = createStore();
  mockNavigateSidePanelMenu.mockImplementation(
    (page: SidePanelNavigationStackItem) => {
      store.set(isSidePanelOpenedState.atom, true);
      store.set(sidePanelNavigationStackState.atom, [page]);
    },
  );
  const wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>
      <RecordCreationFormProvider>{children}</RecordCreationFormProvider>
    </Provider>
  );
  return {
    ...renderHook(useRecordCreationFormContextOrThrow, { wrapper }),
    store,
  };
};

beforeEach(() => jest.clearAllMocks());

it('removes the form from deeper in the history when the user moved on before creation finished', async () => {
  const { result, store } = setup();
  let completeCreation: (record: ObjectRecord) => void = () => {};
  const createRecord = jest.fn(
    () =>
      new Promise<ObjectRecord>((resolve) => {
        completeCreation = resolve;
      }),
  );
  act(() => {
    void result.current.requestRecordCreation({
      objectMetadataItem: getMockObjectMetadataItemOrThrow('company'),
      createRecord,
    });
  });
  const [formPage] = store.get(sidePanelNavigationStackState.atom);
  let submission: Promise<void> | undefined;
  act(() => {
    submission = result.current.settleRecordCreationDraft({
      requestId: formPage.pageId,
      draftRecord: { name: 'Test' },
    });
  });
  await act(async () => {
    await result.current.settleRecordCreationDraft({
      requestId: formPage.pageId,
      draftRecord: { name: 'Test' },
    });
  });
  expect(createRecord).toHaveBeenCalledTimes(1);

  const otherPage = { ...formPage, pageId: 'other-page' };
  act(() => {
    store.set(sidePanelNavigationStackState.atom, [formPage, otherPage]);
  });
  await act(async () => {
    completeCreation({ id: 'created-company', __typename: 'Company' });
    await submission;
  });

  expect(mockCloseSidePanelMenu).not.toHaveBeenCalled();
  expect(store.get(sidePanelNavigationStackState.atom)).toEqual([otherPage]);
});

it('keeps the failed creation draft and allows one successful retry', async () => {
  const { result, store } = setup();
  const draft = { name: 'Keep this draft' };
  const createdRecord = { id: 'created-company', __typename: 'Company' };
  const createRecord = jest
    .fn()
    .mockRejectedValueOnce(new Error('Failed to fetch'))
    .mockResolvedValueOnce(createdRecord);
  let creation: Promise<ObjectRecord | null> | undefined;
  act(() => {
    creation = result.current.requestRecordCreation({
      objectMetadataItem: getMockObjectMetadataItemOrThrow('company'),
      createRecord,
    });
  });
  const [page] = store.get(sidePanelNavigationStackState.atom);
  const draftAtom = recordCreationFormDraftComponentState.atomFamily({
    instanceId: page.pageId,
  });
  store.set(draftAtom, draft);
  await act(async () => {
    await result.current.settleRecordCreationDraft({
      requestId: page.pageId,
      draftRecord: draft,
    });
  });
  expect(store.get(draftAtom)).toEqual(draft);
  expect(store.get(sidePanelNavigationStackState.atom)).toEqual([page]);
  await act(async () => {
    await result.current.settleRecordCreationDraft({
      requestId: page.pageId,
      draftRecord: draft,
    });
  });
  await expect(creation).resolves.toEqual(createdRecord);
  expect(createRecord).toHaveBeenCalledTimes(2);
  expect(mockCloseSidePanelMenu).toHaveBeenCalledTimes(1);
});

it('opens a modal without creating a blank record and cancels without a mutation', async () => {
  const { result } = setup();
  const createRecord = jest.fn();
  let creation: Promise<ObjectRecord | null>;
  act(() => {
    creation = result.current.requestRecordCreation({
      objectMetadataItem: getMockObjectMetadataItemOrThrow('company'),
      presentation: 'modal',
      createRecord,
    });
  });
  expect(mockNavigateSidePanelMenu).not.toHaveBeenCalled();
  expect(mockOpenDialog).toHaveBeenCalledTimes(1);
  expect(createRecord).not.toHaveBeenCalled();
  const requestId = mockOpenDialog.mock.calls[0][0];
  expect(RecordCreationFormModal).toHaveBeenCalled();
  await act(async () => {
    await result.current.settleRecordCreationDraft({
      requestId,
      draftRecord: null,
    });
  });
  expect(await creation!).toBeNull();
  expect(createRecord).not.toHaveBeenCalled();
  expect(mockCloseDialog).toHaveBeenCalledWith(requestId);
});

it('keeps the modal open on a failed save and closes after retry succeeds', async () => {
  const { result } = setup();
  const record = { id: 'created', __typename: 'Company' };
  const createRecord = jest
    .fn()
    .mockRejectedValueOnce(new Error('Failed to fetch'))
    .mockResolvedValueOnce(record);
  let creation: Promise<ObjectRecord | null>;
  act(() => {
    creation = result.current.requestRecordCreation({
      objectMetadataItem: getMockObjectMetadataItemOrThrow('company'),
      presentation: 'modal',
      createRecord,
    });
  });
  const requestId = mockOpenDialog.mock.calls[0][0];
  await act(async () => {
    await result.current.settleRecordCreationDraft({
      requestId,
      draftRecord: { name: 'Keep draft' },
    });
  });
  expect(mockCloseDialog).not.toHaveBeenCalled();
  await act(async () => {
    await result.current.settleRecordCreationDraft({
      requestId,
      draftRecord: { name: 'Keep draft' },
    });
  });
  expect(await creation!).toEqual(record);
  expect(createRecord).toHaveBeenLastCalledWith({ name: 'Keep draft' });
  expect(mockCloseDialog).toHaveBeenCalledWith(requestId);
});
