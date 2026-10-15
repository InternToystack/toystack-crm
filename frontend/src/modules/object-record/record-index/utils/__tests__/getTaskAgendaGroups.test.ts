import { getTaskAgendaGroups } from '../getTaskAgendaGroups';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

const now = new Date(2026, 9, 15, 12);
const settings = { now, canReadDueDate: true, canReadStatus: true };
const task = (id: string, dueAt: Date | null, status = 'TODO') =>
  ({ __typename: 'Task', id, dueAt: dueAt?.toISOString(), status }) as ObjectRecord;

it('groups by local calendar days and preserves the query order within a group', () => {
  const records = [
    task('later', new Date(2026, 9, 16)),
    task('today-evening', new Date(2026, 9, 15, 23)),
    task('yesterday', new Date(2026, 9, 14, 23, 59)),
    task('today-midnight', new Date(2026, 9, 15)),
    task('no-date', null),
  ];
  expect(getTaskAgendaGroups(records, settings).map((group) => [group.key, group.records.map((record) => record.id)]))
    .toEqual([
      ['overdue', ['yesterday']],
      ['today', ['today-evening', 'today-midnight']],
      ['upcoming', ['later']],
      ['unscheduled', ['no-date']],
    ]);
});

it('keeps completed tasks out of overdue and tolerates invalid dates', () => {
  const records = [task('done', new Date(2026, 9, 1), 'DONE'), { __typename: 'Task', id: 'invalid', dueAt: 'bad date' } as ObjectRecord];
  expect(getTaskAgendaGroups(records, settings).map((group) => group.key)).toEqual(['unscheduled', 'completed']);
});

it('does not classify using restricted date or status values', () => {
  const records = [task('restricted', new Date(2026, 9, 1), 'DONE')];
  expect(getTaskAgendaGroups(records, { now, canReadDueDate: false, canReadStatus: false }))
    .toEqual([{ key: 'tasks', records }]);
});
