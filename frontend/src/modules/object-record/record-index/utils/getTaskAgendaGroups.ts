import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

export const getTaskAgendaGroups = (
  records: ObjectRecord[],
  { canReadDueDate, canReadStatus, now = new Date() }: {
    canReadDueDate: boolean;
    canReadStatus: boolean;
    now?: Date;
  },
) => {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const groups = new Map<string, ObjectRecord[]>();
  for (const record of records) {
    const due = canReadDueDate && record.dueAt ? new Date(record.dueAt) : null;
    const key = canReadStatus && record.status === 'DONE'
      ? 'completed'
      : !canReadDueDate
        ? 'tasks'
        : !due || Number.isNaN(due.getTime())
          ? 'unscheduled'
          : due < today
            ? 'overdue'
            : due < tomorrow
              ? 'today'
              : 'upcoming';
    groups.set(key, [...(groups.get(key) ?? []), record]);
  }
  // Preserve the saved query order within each attention group.
  return ['overdue', 'today', 'upcoming', 'unscheduled', 'tasks', 'completed']
    .filter((key) => groups.has(key))
    .map((key) => ({ key, records: groups.get(key)! }));
};
