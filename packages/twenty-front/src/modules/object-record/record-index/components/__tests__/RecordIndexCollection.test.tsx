import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { fireEvent, render, screen } from '@testing-library/react';
import { messages } from '~/locales/generated/en';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { RecordIndexCollection } from '@/object-record/record-index/components/RecordIndexCollection';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecordIndexTableQuery } from '@/object-record/record-index/hooks/useRecordIndexTableQuery';

const mockOpenRecord = jest.fn();
const mockOpenRelatedRecord = jest.fn();
jest.mock('@/side-panel/hooks/useOpenRecordInSidePanel', () => ({
  useOpenRecordInSidePanel: () => ({
    openRecordInSidePanel: mockOpenRelatedRecord,
  }),
}));

jest.mock('@/object-record/record-index/contexts/RecordIndexContext');
jest.mock('@/object-record/record-index/hooks/useRecordIndexTableQuery');
jest.mock('@/object-record/hooks/useObjectPermissionsForObject', () => ({
  useObjectPermissionsForObject: () => ({ canReadObjectRecords: true }),
}));
jest.mock(
  '@/object-record/record-index/hooks/useOpenRecordFromIndexView',
  () => ({
    useOpenRecordFromIndexView: () => ({
      openRecordFromIndexView: mockOpenRecord,
    }),
  }),
);
jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue',
  () => ({ useAtomComponentSelectorValue: () => [] }),
);
jest.mock('@/object-record/hooks/useRecordChipData', () => ({
  useRecordChipData: ({ record }: { record: { name: string } }) => ({
    recordChipData: { name: record.name },
  }),
}));
jest.mock(
  '@/ui/field/display/components/internal/AvatarOrIcon/AvatarOrIcon',
  () => ({ AvatarOrIcon: () => null }),
);
jest.mock(
  '@/object-record/record-list/components/RecordListFieldTooltip',
  () => ({
    RecordListFieldTooltip: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
  }),
);
jest.mock(
  '@/object-record/record-list/components/RecordListSSESubscribeEffect',
  () => ({ RecordListSSESubscribeEffect: () => null }),
);
jest.mock(
  '@/object-record/record-list/components/RecordListUpsertRecordsInStoreEffect',
  () => ({ RecordListUpsertRecordsInStoreEffect: () => null }),
);
jest.mock(
  '@/object-record/record-list/components/RecordListEmptyState',
  () => ({ RecordListEmptyState: () => <span>Existing empty state</span> }),
);

const item = getMockObjectMetadataItemOrThrow('opportunity');
const stage = item.fields.find((field) => field.name === 'stage')!;
const firstStage = stage.options![0];
const nextStage = stage.options![1];
const records = [
  { id: 'one', name: 'First deal', stage: firstStage.value },
  { id: 'two', name: 'Second deal', stage: nextStage.value },
];
const fetchMore = jest.fn();
const refetch = jest.fn().mockResolvedValue({});

beforeEach(() => {
  jest.clearAllMocks();
  i18n.loadAndActivate({ locale: 'en', messages });
  jest.mocked(useRecordIndexContextOrThrow).mockReturnValue({
    objectNameSingular: 'opportunity',
    objectMetadataItem: { ...item, readableFields: item.fields },
    recordIndexId: 'index',
    viewBarInstanceId: 'index',
    fieldDefinitionByFieldMetadataItemId: {},
  } as unknown as ReturnType<typeof useRecordIndexContextOrThrow>);
  jest.mocked(useRecordIndexTableQuery).mockReturnValue({
    records,
    loading: false,
    totalCount: 80,
    hasNextPage: true,
    fetchMoreRecords: fetchMore,
    refetch,
  } as unknown as ReturnType<typeof useRecordIndexTableQuery>);
});
const show = () =>
  render(
    <I18nProvider i18n={i18n}>
      <RecordIndexCollection />
    </I18nProvider>,
  );

it('uses the existing query with a readable stage and separates records into lanes', () => {
  show();
  expect(useRecordIndexTableQuery).toHaveBeenCalledWith('opportunity', [
    stage.id,
  ]);
  expect(
    screen.getByRole('region', { name: firstStage.label }),
  ).toHaveTextContent('First deal');
  expect(
    screen.getByRole('region', { name: firstStage.label }),
  ).not.toHaveTextContent('Second deal');
  expect(screen.getByText('80')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Load more' }));
  expect(fetchMore).toHaveBeenCalledTimes(1);
});
it('does not request or group by a restricted stage field', () => {
  const context = jest.mocked(useRecordIndexContextOrThrow)();
  jest.mocked(useRecordIndexContextOrThrow).mockReturnValue({
    ...context,
    objectMetadataItem: {
      ...item,
      readableFields: item.fields.filter((field) => field.name !== 'stage'),
    },
  });
  show();
  expect(useRecordIndexTableQuery).toHaveBeenCalledWith('opportunity', []);
  expect(
    screen.queryByRole('region', { name: firstStage.label }),
  ).not.toBeInTheDocument();
  expect(screen.getByText('First deal')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Second deal' }));
  expect(screen.getByText('Second deal')).toBeInTheDocument();
  expect(screen.getByText('First deal')).toBeInTheDocument();
});
it('offers retry on query failure and keeps the existing empty-state handling', () => {
  jest.mocked(useRecordIndexTableQuery).mockReturnValue({
    ...jest.mocked(useRecordIndexTableQuery)('opportunity'),
    records: [],
    error: new Error('offline'),
  });
  const { unmount } = show();
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
  expect(refetch).toHaveBeenCalledTimes(1);
  unmount();
  jest.mocked(useRecordIndexTableQuery).mockReturnValue({
    ...jest.mocked(useRecordIndexTableQuery)('opportunity'),
    records: [],
    error: undefined,
    hasNextPage: false,
  });
  show();
  expect(screen.getByText('Existing empty state')).toBeInTheDocument();
});

it('focuses a stage locally and restores all stages without changing the query', () => {
  show();
  fireEvent.click(
    screen.getByRole('button', { name: `${nextStage.label} · 1` }),
  );
  expect(
    screen.queryByRole('region', { name: firstStage.label }),
  ).not.toBeInTheDocument();
  expect(
    screen.getByRole('region', { name: nextStage.label }),
  ).toHaveTextContent('Second deal');
  fireEvent.click(screen.getByRole('button', { name: 'All stages' }));
  expect(
    screen.getByRole('region', { name: firstStage.label }),
  ).toBeInTheDocument();
  expect(
    jest
      .mocked(useRecordIndexTableQuery)
      .mock.calls.every(
        ([name, extra]) => name === 'opportunity' && extra?.[0] === stage.id,
      ),
  ).toBe(true);
});

it('offers stage focus and restores all loaded stages', () => {
  const query = jest.mocked(useRecordIndexTableQuery)('opportunity');
  jest
    .mocked(useRecordIndexTableQuery)
    .mockReturnValue({ ...query, hasNextPage: false });
  show();
  fireEvent.click(screen.getByRole('button', { name: 'All stages' }));
  expect(screen.getAllByRole('region').length).toBeGreaterThanOrEqual(2);
  expect(
    screen.getByRole('region', { name: firstStage.label }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole('region', { name: nextStage.label }),
  ).toBeInTheDocument();
});

it('shows the pipeline and lets a stage progressively reveal its records', () => {
  const query = jest.mocked(useRecordIndexTableQuery)('opportunity');
  jest.mocked(useRecordIndexTableQuery).mockReturnValue({
    ...query,
    records: [
      ...Array.from({ length: 7 }, (_, index) => ({
        id: `deal-${index}`,
        name: `Deal ${index}`,
        stage: firstStage.value,
      })),
      records[1],
    ],
  } as unknown as ReturnType<typeof useRecordIndexTableQuery>);
  show();
  expect(screen.getAllByRole('region')).toHaveLength(1);
  fireEvent.click(
    screen.getByRole('button', { name: `${firstStage.label} · 7` }),
  );
  expect(screen.getAllByRole('region')).toHaveLength(1);
  expect(screen.queryByText('Deal 6')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Show more' }));
  expect(screen.getByText('Deal 6')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Show less' }));
  expect(screen.queryByText('Deal 6')).not.toBeInTheDocument();
  fireEvent.click(
    screen.getByRole('button', { name: `${nextStage.label} · 1` }),
  );
  expect(screen.getByText('Second deal')).toBeInTheDocument();
});

it('pages companies without hiding records and clamps the page when results shrink', () => {
  const context = jest.mocked(useRecordIndexContextOrThrow)();
  const company = getMockObjectMetadataItemOrThrow('company');
  jest.mocked(useRecordIndexContextOrThrow).mockReturnValue({
    ...context,
    objectNameSingular: 'company',
    objectMetadataItem: { ...company, readableFields: company.fields },
  });
  const query = jest.mocked(useRecordIndexTableQuery)('company');
  const companies = Array.from({ length: 18 }, (_, i) => ({
    id: `company-${i}`,
    name: `Company ${i}`,
  }));
  jest.mocked(useRecordIndexTableQuery).mockReturnValue({
    ...query,
    records: companies as unknown as typeof query.records,
    totalCount: 18,
    hasNextPage: false,
  });
  const view = show();
  expect(screen.getAllByRole('article')).toHaveLength(8);
  expect(screen.getAllByText('Company 0').length).toBeGreaterThan(0);
  fireEvent.click(screen.getByRole('button', { name: 'Next' }));
  expect(screen.queryByText('Company 0')).not.toBeInTheDocument();
  expect(screen.getAllByText('Company 8').length).toBeGreaterThan(0);
  fireEvent.click(screen.getByRole('button', { name: 'Next' }));
  expect(screen.getAllByText('Company 17').length).toBeGreaterThan(0);
  expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  jest.mocked(useRecordIndexTableQuery).mockReturnValue({
    ...query,
    records: companies.slice(0, 3) as unknown as typeof query.records,
    totalCount: 3,
    hasNextPage: false,
  });
  view.rerender(
    <I18nProvider i18n={i18n}>
      <RecordIndexCollection />
    </I18nProvider>,
  );
  expect(screen.getAllByRole('article')).toHaveLength(3);
  expect(screen.getAllByText('Company 0').length).toBeGreaterThan(0);
});

it('opens a deal directly with one title click', () => {
  show();
  fireEvent.click(screen.getByRole('button', { name: 'First deal' }));
  expect(mockOpenRecord).toHaveBeenCalledWith({ recordId: 'one' });
});

it('shows multiple company relationships and opens the correct linked record without owner filters', () => {
  const context = jest.mocked(useRecordIndexContextOrThrow)();
  const company = getMockObjectMetadataItemOrThrow('company');
  jest.mocked(useRecordIndexContextOrThrow).mockReturnValue({
    ...context,
    objectNameSingular: 'company',
    objectMetadataItem: { ...company, readableFields: company.fields },
  });
  const query = jest.mocked(useRecordIndexTableQuery)('company');
  const accounts = [
    {
      id: 'acme',
      name: 'Acme',
      people: [
        { id: 'person-1', name: { firstName: 'Rahul', lastName: 'Sharma' } },
        { id: 'person-2', name: { firstName: 'Second', lastName: 'Contact' } },
      ],
      opportunities: [{ id: 'deal-1', name: 'Annual renewal' }],
    },
    {
      id: 'orbit',
      name: 'Orbit',
      people: [],
      opportunities: [],
      accountOwner: { id: 'owner-1', name: 'Kunal Rasal' },
    },
  ];
  jest.mocked(useRecordIndexTableQuery).mockReturnValue({
    ...query,
    records: accounts as unknown as typeof query.records,
    totalCount: 2,
    hasNextPage: false,
  });
  show();
  expect(screen.queryByText('Kunal Rasal')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Rahul Sharma' }));
  expect(mockOpenRelatedRecord).toHaveBeenCalledWith({
    recordId: 'person-1',
    objectNameSingular: 'person',
    resetNavigationStack: true,
  });
  expect(screen.getAllByRole('article')).toHaveLength(2);
  expect(screen.getByText('Annual renewal')).toBeInTheDocument();
  expect(screen.getAllByText('—')).toHaveLength(2);
  expect(screen.queryByText('Second Contact')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /\+1 more/ }));
  expect(mockOpenRecord).toHaveBeenCalledWith({ recordId: 'acme' });
  fireEvent.click(screen.getByRole('button', { name: 'View company Orbit' }));
  expect(mockOpenRecord).toHaveBeenCalledWith({ recordId: 'orbit' });
});

it('presents tasks by attention date while retaining status filtering and native opening', () => {
  const taskItem = getMockObjectMetadataItemOrThrow('task');
  const status = taskItem.fields.find((field) => field.name === 'status')!;
  const dueAt = taskItem.fields.find((field) => field.name === 'dueAt')!;
  const todo = status.options!.find((option) => option.value !== 'DONE')!;
  jest.mocked(useRecordIndexContextOrThrow).mockReturnValue({
    ...jest.mocked(useRecordIndexContextOrThrow)(),
    objectNameSingular: 'task',
    objectMetadataItem: { ...taskItem, readableFields: taskItem.fields },
  });
  jest.mocked(useRecordIndexTableQuery).mockReturnValue({
    ...jest.mocked(useRecordIndexTableQuery)('task'),
    records: [
      { id: 'urgent', name: 'Call client', status: todo.value, dueAt: '2020-01-01T12:00:00Z' },
      { id: 'later', name: 'Prepare brief', status: todo.value, dueAt: '2099-01-01T12:00:00Z' },
      { id: 'draft', name: 'Plan rollout', status: todo.value },
      { id: 'done', name: 'Completed follow-up', status: 'DONE', dueAt: '2020-01-01T12:00:00Z' },
    ],
    hasNextPage: false,
  } as unknown as ReturnType<typeof useRecordIndexTableQuery>);
  show();
  expect(useRecordIndexTableQuery).toHaveBeenCalledWith('task', [status.id, dueAt.id]);
  expect(screen.getByRole('region', { name: 'Overdue' })).toHaveTextContent('Call client');
  expect(screen.getByRole('region', { name: 'Upcoming' })).toHaveTextContent('Prepare brief');
  expect(screen.getByRole('region', { name: 'No due date' })).toHaveTextContent('Plan rollout');
  expect(screen.queryByText('Completed follow-up')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'All tasks' }));
  expect(screen.getByRole('region', { name: 'Completed' })).toHaveTextContent('Completed follow-up');
  expect(screen.getByRole('region', { name: 'Overdue' })).not.toHaveTextContent('Completed follow-up');
  fireEvent.click(screen.getByRole('button', { name: 'Call client' }));
  expect(mockOpenRecord).toHaveBeenCalledWith({ recordId: 'urgent' });
});
