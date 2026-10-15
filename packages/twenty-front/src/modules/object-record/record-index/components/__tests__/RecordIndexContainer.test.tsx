import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { fireEvent, render, screen } from '@testing-library/react';
import { messages } from '~/locales/generated/en';
import { RecordIndexContainer } from '@/object-record/record-index/components/RecordIndexContainer';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { ViewType } from '@/views/types/ViewType';

jest.mock('@/object-record/record-index/contexts/RecordIndexContext');
jest.mock('@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue');
jest.mock('@/ui/layout/hooks/useWorkspaceSurface', () => ({
  useWorkspaceSurface: () => ({ type: 'main' }),
}));
jest.mock(
  '@/object-record/record-index/hooks/useHasCurrentViewNonReadableFields',
  () => ({
    useHasCurrentViewNonReadableFields: () => ({
      hasCurrentViewNonReadableFields: false,
    }),
  }),
);
jest.mock(
  '@/object-record/record-index/components/RecordIndexFiltersToContextStoreEffect',
  () => ({ RecordIndexFiltersToContextStoreEffect: () => null }),
);
jest.mock(
  '@/object-record/record-index/components/RecordIndexCollection',
  () => ({ RecordIndexCollection: () => <div>Card collection</div> }),
);
jest.mock(
  '@/object-record/record-index/components/RecordIndexTableContainer',
  () => ({ RecordIndexTableContainer: () => <div>Existing table</div> }),
);
jest.mock(
  '@/object-record/record-board/components/RecordBoardContainer',
  () => ({ RecordBoardContainer: () => <div>Existing Kanban</div> }),
);
jest.mock(
  '@/object-record/record-index/components/RecordIndexCalendarContainer',
  () => ({ RecordIndexCalendarContainer: () => <div>Existing calendar</div> }),
);
jest.mock('@/object-record/record-list/components/RecordListContainer', () => ({
  RecordListContainer: () => <div>Existing list</div>,
}));

beforeEach(() => {
  i18n.loadAndActivate({ locale: 'en', messages });
  jest.mocked(useAtomComponentStateValue).mockReturnValue(ViewType.TABLE);
});
const show = (name: string) => {
  jest
    .mocked(useRecordIndexContextOrThrow)
    .mockReturnValue({
      recordIndexId: 'index',
      objectNameSingular: name,
      objectMetadataItem: {},
    } as ReturnType<typeof useRecordIndexContextOrThrow>);
  return render(
    <I18nProvider i18n={i18n}>
      <RecordIndexContainer />
    </I18nProvider>,
  );
};
it.each([
  'company',
  'person',
  'opportunity',
  'task',
  'note',
  'dashboard',
  'workflow',
  'workflowRun',
  'workflowVersion',
  'customObject',
])('opens %s in a collection and retains bulk editing access', (name) => {
  show(name);
  expect(screen.getByText('Card collection')).toBeInTheDocument();
  expect(screen.queryByText('Existing table')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Table / bulk edit' }));
  expect(screen.getByText('Existing table')).toBeInTheDocument();
});
it.each([
  [ViewType.KANBAN, 'Existing Kanban'],
  [ViewType.CALENDAR, 'Existing calendar'],
  [ViewType.LIST, 'Existing list'],
])('preserves specialised saved views: %s', (type, label) => {
  jest.mocked(useAtomComponentStateValue).mockReturnValue(type);
  show('company');
  expect(screen.getByText(label)).toBeInTheDocument();
  expect(screen.queryByText('Card collection')).not.toBeInTheDocument();
});
