import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { messages } from '~/locales/generated/en';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HomeDashboardPage } from '~/pages/home/HomeDashboardPage';
import { useReadableObjectMetadataItems } from '@/object-metadata/hooks/useReadableObjectMetadataItems';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

jest.mock('@/ui/field/display/components/DateDisplay', () => ({
  DateDisplay: ({ value }: { value: string }) => <span>{value}</span>,
}));
jest.mock('@/ui/field/display/components/DateTimeDisplay', () => ({
  DateTimeDisplay: ({ value }: { value: string }) => <span>{value}</span>,
}));
jest.mock('@/localization/hooks/useDateTimeFormat', () => ({
  useDateTimeFormat: () => ({
    timeZone: 'Asia/Kolkata',
    dateFormat: 'dd MMM yyyy',
    timeFormat: 'HH:mm',
  }),
}));
jest.mock('@/object-metadata/hooks/useReadableObjectMetadataItems');
jest.mock('@/object-record/hooks/useFindManyRecords', () => ({
  useFindManyRecords: jest.fn(),
}));
jest.mock('@/ui/utilities/state/jotai/hooks/useAtomStateValue', () => ({
  useAtomStateValue: () => ({ id: 'current-member' }),
}));
jest.mock('@/ui/layout/page/components/PageCardLayout', () => ({
  PageCardLayout: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

const objects = ['task', 'opportunity', 'note'].map((name) => {
  const item = getMockObjectMetadataItemOrThrow(name);
  return { ...item, readableFields: item.fields };
});

beforeEach(() => {
  jest.clearAllMocks();
  i18n.loadAndActivate({ locale: 'en', messages });
  jest
    .mocked(useReadableObjectMetadataItems)
    .mockReturnValue({ readableObjectMetadataItems: objects });
  jest.mocked(useFindManyRecords).mockReturnValue({
    records: [],
    totalCount: 12,
    loading: false,
    error: undefined,
    refetch: jest.fn(),
  } as unknown as ReturnType<typeof useFindManyRecords>);
});

it('uses bounded existing queries and scopes tasks to the current member', () => {
  render(
    <I18nProvider i18n={i18n}>
      <MemoryRouter>
        <HomeDashboardPage />
      </MemoryRouter>
    </I18nProvider>,
  );
  const calls = jest
    .mocked(useFindManyRecords)
    .mock.calls.map(([params]) => params);
  expect(calls).toHaveLength(3);
  expect(screen.getAllByText('12')).toHaveLength(3);
  expect(calls.every((params) => params.limit === 5)).toBe(true);
  expect(
    calls.find((params) => params.objectNameSingular === 'task')?.filter,
  ).toEqual({
    and: [
      { assigneeId: { eq: 'current-member' } },
      { status: { in: ['TODO', 'IN_PROGRESS'] } },
      { dueAt: { lt: expect.any(String) } },
    ],
  });
  expect(
    calls.find((params) => params.objectNameSingular === 'note')?.orderBy,
  ).toEqual([{ updatedAt: 'DescNullsLast' }]);
});

it('does not query an unreadable object or a restricted overview field', () => {
  jest.mocked(useReadableObjectMetadataItems).mockReturnValue({
    readableObjectMetadataItems: [
      {
        ...objects[1],
        readableFields: objects[1].readableFields.filter(
          (field) => field.name !== 'closeDate',
        ),
      },
    ],
  });
  render(
    <I18nProvider i18n={i18n}>
      <MemoryRouter>
        <HomeDashboardPage />
      </MemoryRouter>
    </I18nProvider>,
  );
  expect(useFindManyRecords).not.toHaveBeenCalled();
  expect(screen.getByText('No overview available')).toBeInTheDocument();
  expect(screen.queryByText('Your tasks')).not.toBeInTheDocument();
});

it('switches task periods using the user time zone and includes undated tasks in My tasks', () => {
  jest.useFakeTimers().setSystemTime(new Date('2026-10-13T10:00:00Z'));
  try {
    render(
      <I18nProvider i18n={i18n}>
        <MemoryRouter>
          <HomeDashboardPage />
        </MemoryRouter>
      </I18nProvider>,
    );
    const taskFilter = () =>
      jest
        .mocked(useFindManyRecords)
        .mock.calls.filter(([params]) => params.objectNameSingular === 'task')
        .at(-1)?.[0].filter;
    fireEvent.click(screen.getByRole('button', { name: 'Due today' }));
    expect(taskFilter()).toEqual({
      and: [
        { assigneeId: { eq: 'current-member' } },
        { status: { in: ['TODO', 'IN_PROGRESS'] } },
        { dueAt: { gte: '2026-10-12T18:30:00Z' } },
        { dueAt: { lt: '2026-10-13T18:30:00Z' } },
      ],
    });
    fireEvent.click(screen.getByRole('button', { name: 'Overdue' }));
    expect(taskFilter()).toEqual({
      and: [
        { assigneeId: { eq: 'current-member' } },
        { status: { in: ['TODO', 'IN_PROGRESS'] } },
        { dueAt: { lt: '2026-10-12T18:30:00Z' } },
      ],
    });
    fireEvent.click(screen.getByRole('button', { name: 'My tasks' }));
    expect(taskFilter()).toEqual({
      and: [
        { assigneeId: { eq: 'current-member' } },
        { status: { in: ['TODO', 'IN_PROGRESS'] } },
      ],
    });
    expect(screen.getByRole('button', { name: 'My tasks' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  } finally {
    jest.useRealTimers();
  }
});

it('keeps Home previews short and makes the remaining records available with a button', () => {
  jest.mocked(useFindManyRecords).mockReturnValue({
    records: Array.from({ length: 5 }, (_, index) => ({
      id: `record-${index}`,
      name: `Deal ${index}`,
      title: `Record ${index}`,
      dueAt: '2026-10-14T00:00:00Z',
      closeDate: '2026-10-14',
      updatedAt: '2026-10-14T00:00:00Z',
    })),
    totalCount: 5,
    loading: false,
    error: undefined,
    refetch: jest.fn(),
  } as unknown as ReturnType<typeof useFindManyRecords>);
  render(
    <I18nProvider i18n={i18n}>
      <MemoryRouter>
        <HomeDashboardPage />
      </MemoryRouter>
    </I18nProvider>,
  );
  const section = within(
    screen.getByRole('region', { name: 'Opportunities needing attention' }),
  );
  expect(section.getAllByRole('link')).toHaveLength(4);
  fireEvent.click(section.getByRole('button', { name: 'Show more' }));
  expect(section.getAllByRole('link')).toHaveLength(6);
  fireEvent.click(section.getByRole('button', { name: 'Show less' }));
  expect(section.getAllByRole('link')).toHaveLength(4);
});
