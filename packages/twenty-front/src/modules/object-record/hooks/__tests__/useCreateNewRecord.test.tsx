import { renderHook, act } from '@testing-library/react';
import { useCreateNewRecord } from '@/object-record/hooks/useCreateNewRecord';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const mockRequest = jest.fn();
const mockCreate = jest.fn();
const mockRlsInput = jest.fn(() => ({}));
jest.mock('@/ui/utilities/state/jotai/hooks/useAtomStateValue', () => ({
  useAtomStateValue: () => ({ id: 'me' }),
}));
jest.mock('jotai', () => ({
  ...jest.requireActual('jotai'),
  useStore: () => ({ set: jest.fn() }),
}));
jest.mock('@/side-panel/hooks/useOpenRecordInSidePanel', () => ({
  useOpenRecordInSidePanel: () => ({ openRecordInSidePanel: jest.fn() }),
}));
jest.mock('@/side-panel/hooks/useSidePanelMenu', () => ({
  useSidePanelMenu: () => ({ closeSidePanelMenu: jest.fn() }),
}));
jest.mock('@/ui/layout/hooks/useWorkspaceSurface', () => ({
  useWorkspaceSurface: () => ({ type: 'main' }),
}));
jest.mock('@/object-record/record-index/hooks/useResolveOpenRecordIn', () => ({
  useResolveOpenRecordIn: () => 'SIDE_PANEL',
}));
jest.mock('@/object-record/hooks/useCreateOneRecord', () => ({
  useCreateOneRecord: () => ({ createOneRecord: mockCreate }),
}));
jest.mock('@/object-record/record-store/hooks/useUpsertRecordsInStore', () => ({
  useUpsertRecordsInStore: () => ({ upsertRecordsInStore: jest.fn() }),
}));
jest.mock('@/object-record/record-form/hooks/useRecordCreationForm', () => ({
  useRecordCreationForm: () => ({
    isRecordCreationFormEnabled: true,
    requestRecordCreation: mockRequest,
  }),
}));
jest.mock('@/object-record/hooks/useBuildRecordInputFromRLSPredicates', () => ({
  useBuildRecordInputFromRLSPredicates: () => ({
    buildRecordInputFromRLSPredicates: mockRlsInput,
  }),
}));
jest.mock('~/hooks/useNavigateApp', () => ({
  useNavigateApp: () => jest.fn(),
}));

const task = getMockObjectMetadataItemOrThrow('task');
const editableTask = { ...task, updatableFields: task.fields };
beforeEach(() => {
  jest.clearAllMocks();
  mockRequest.mockResolvedValue(undefined);
  mockRlsInput.mockReturnValue({});
});

it('prefills an editable task assignee and permits explicitly clearing it', async () => {
  const { result } = renderHook(() =>
    useCreateNewRecord({ objectMetadataItem: editableTask }),
  );
  await act(async () => {
    await result.current.createNewRecord();
  });
  const request = mockRequest.mock.calls[0][0];
  expect(request.initialDraftRecord.assigneeId).toBe('me');
  await act(async () => {
    await request.createRecord({ assigneeId: null });
  });
  expect(mockCreate).toHaveBeenCalledWith(
    expect.objectContaining({ assigneeId: null }),
  );
});

it('preserves explicit, view and RLS defaults ahead of the current member', async () => {
  mockRlsInput.mockReturnValue({ assigneeId: 'rule-owner' });
  const { result } = renderHook(() =>
    useCreateNewRecord({
      objectMetadataItem: editableTask,
      buildRecordInput: () => ({ assigneeId: 'view-owner' }),
    }),
  );
  await act(async () => {
    await result.current.createNewRecord({ assigneeId: 'chosen-owner' });
  });
  expect(mockRequest.mock.calls[0][0].initialDraftRecord.assigneeId).toBe(
    'chosen-owner',
  );
  await act(async () => {
    await result.current.createNewRecord();
  });
  expect(mockRequest.mock.calls[1][0].initialDraftRecord.assigneeId).toBe(
    'view-owner',
  );
});

it.each(['task', 'company'])(
  'does not assign restricted tasks or other objects (%s)',
  async (name) => {
    const item = getMockObjectMetadataItemOrThrow(name);
    const { result } = renderHook(() =>
      useCreateNewRecord({
        objectMetadataItem: { ...item, updatableFields: [] },
      }),
    );
    await act(async () => {
      await result.current.createNewRecord();
    });
    expect(mockRequest.mock.calls[0][0].initialDraftRecord).not.toHaveProperty(
      'assigneeId',
    );
  },
);
