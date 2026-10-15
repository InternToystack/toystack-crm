import { useState, type ReactNode } from 'react';
import { Temporal } from 'temporal-polyfill';
import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { Button } from 'twenty-ui/primitives/input';
import { SkeletonLoader } from '@/activities/components/SkeletonLoader';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useReadableObjectMetadataItems } from '@/object-metadata/hooks/useReadableObjectMetadataItems';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { DateDisplay } from '@/ui/field/display/components/DateDisplay';
import { DateTimeDisplay } from '@/ui/field/display/components/DateTimeDisplay';
import { EmptyState } from '@/ui/feedback/empty-state/components/EmptyState';
import { NavigationButton } from '@/ui/input/components/NavigationButton';
import { PageCardHeader } from '@/ui/layout/page/components/PageCardHeader';
import { PageCardLayout } from '@/ui/layout/page/components/PageCardLayout';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';
import {
  IconBuildingSkyscraper,
  IconUsers,
  IconTarget,
  IconCheckbox,
  IconNotes,
  IconArrowRight,
} from 'twenty-ui/icon';
import { useLingui } from '@lingui/react/macro';
import { Link } from 'react-router-dom';
import { AppPath, type RecordGqlOperationFilter } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';
import { InlineBanner } from 'twenty-ui/components';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--t-spacing-6);
  overflow-y: auto;
  padding: var(--t-spacing-8);
`;

const StyledActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--t-spacing-2);
`;

const StyledGrid = styled.div`
  display: grid;
  gap: 24px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  grid-template-areas:
    'taskMetric opportunityMetric noteMetric'
    'opportunity opportunity task'
    'opportunity opportunity note';
  align-items: start;
  @media (max-width: 1050px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-template-areas:
      'taskMetric opportunityMetric'
      'noteMetric noteMetric'
      'opportunity task'
      'opportunity note';
  }
  @media (max-width: 700px) {
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas: 'taskMetric' 'opportunityMetric' 'noteMetric' 'task' 'opportunity' 'note';
  }
`;

const StyledSection = styled.section<{ sectionName: string }>`
  grid-area: ${({ sectionName }) => sectionName};
  background: var(--t-background-primary);
  border: 1px solid var(--t-border-color-medium);
  border-radius: 8px;
  min-width: 0;
  overflow: hidden;
`;

const StyledHeading = styled.h2`
  color: var(--t-font-color-primary);
  font-size: 16px;
  font-weight: var(--t-font-weight-semi-bold);
  margin: 0;
`;

const StyledDescription = styled.p`
  color: var(--t-font-color-secondary);
  font-size: 14px;
  line-height: var(--t-text-line-height-lg);
  margin: 0 0 var(--t-spacing-4);
`;

const StyledRow = styled(Link)`
  align-items: flex-start;
  border: 1px solid var(--t-border-color-medium);

  border-radius: 8px;
  margin: 12px 16px;
  background: var(--t-background-primary);
  color: var(--t-font-color-primary);
  display: flex;
  flex-direction: column;
  font-size: 15px;
  justify-content: space-between;
  gap: var(--t-spacing-3);
  min-width: 0;
  padding: var(--t-spacing-4) var(--t-spacing-5);
  text-decoration: none;

  &:hover {
    background: var(--t-background-secondary);
    border-color: var(--t-border-color-strong);
    box-shadow: ${themeCssVariables.boxShadow.light};
  }

  &:focus-visible {
    outline: 2px solid var(--t-color-blue11);
    outline-offset: 2px;
  }
`;

const StyledDate = styled.div`
  color: var(--t-font-color-secondary);
  font-size: 12px;
  max-width: 100%;
  flex-shrink: 0;
`;

const StyledColumn = styled.div`
  display: contents;
`;

const StyledMetric = styled.div<{ sectionName: string }>`
  grid-area: ${({ sectionName }) => sectionName + 'Metric'};
  background: var(--t-background-primary);
  border: 1px solid var(--t-border-color-medium);
  border-radius: 8px;
  padding: var(--t-spacing-4);
  color: var(--t-font-color-secondary);
  font-size: 14px;
  svg {
    color: var(--t-color-blue11);
    background: var(--t-color-blue3);
    box-sizing: content-box;
    border-radius: 8px;
    padding: 6px;
  }
  & > div {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  strong {
    color: var(--t-font-color-primary);
    display: block;
    font-size: 24px;
    font-weight: var(--t-font-weight-semi-bold);
    margin: var(--t-spacing-3) 0 var(--t-spacing-2);
  }
`;

const StyledSectionHeader = styled.div`
  padding: var(--t-spacing-5);
  border-bottom: 1px solid var(--t-border-color-medium);
  display: flex;
  flex-direction: column;
  gap: var(--t-spacing-3);
  p {
    margin: 0;
  }
`;

const StyledSectionTitle = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: var(--t-spacing-2);
`;

const StyledSectionBody = styled.div`
  min-height: 0;
  > div:not(a) {
    padding: var(--t-spacing-5);
  }
`;

const StyledWelcome = styled.div`
  padding: 20px;
  background: linear-gradient(
    120deg,
    var(--t-background-primary),
    var(--t-background-secondary)
  );
  border: 1px solid var(--t-border-color-medium);
  border-left: 3px solid var(--t-color-blue9);
  border-radius: 8px;
  color: var(--t-font-color-primary);
  align-items: flex-start;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: var(--t-spacing-4);
  h2 {
    color: var(--t-font-color-primary);
    font-size: 24px;
    font-weight: var(--t-font-weight-semi-bold);
    letter-spacing: -0.4px;
    margin: 0 0 var(--t-spacing-2);
  }
  p {
    margin: 0;
  }
`;

const StyledSectionFooter = styled.div`
  padding: 8px 16px;
  border-top: 1px solid var(--t-border-color-light);
  display: flex;
  justify-content: flex-end;
`;
const StyledShortcuts = styled.nav`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 20px;
  background: var(--t-background-primary);
  border: 1px solid var(--t-border-color-medium);
  border-radius: 8px;
  & > div {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 12px;
    width: 100%;
  }
  & a {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    border: 1px solid var(--t-border-color-medium);
    background: var(--t-background-primary);
    border-radius: 8px;
    color: var(--t-font-color-secondary);
    text-decoration: none;
    font-size: 14px;
  }
  & a {
    transition:
      border-color 150ms ease,
      box-shadow 150ms ease;
  }
  & a:hover {
    background: var(--t-background-secondary);
    border-color: var(--t-border-color-strong);
    box-shadow: ${themeCssVariables.boxShadow.light};
  }
  & a:focus-visible {
    outline: 2px solid var(--t-color-blue11);
  }
`;

type HomeRecordSectionProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  title: string;
  description: string;
  summaryDescription: string;
  emptyMessage: string;
  labelField: 'title' | 'name';
  dateField: 'dueAt' | 'closeDate' | 'updatedAt';
  filter?: RecordGqlOperationFilter;
  ascending?: boolean;
  children?: ReactNode;
};

const HomeRecordSection = ({
  objectMetadataItem,
  title,
  description,
  summaryDescription,
  emptyMessage,
  labelField,
  dateField,
  filter,
  ascending = true,
  children,
}: HomeRecordSectionProps) => {
  const { t } = useLingui();
  const [showAllRecords, setShowAllRecords] = useState(false);
  const { records, totalCount, loading, error, refetch } = useFindManyRecords({
    objectNameSingular: objectMetadataItem.nameSingular,
    filter,
    orderBy: [{ [dateField]: ascending ? 'AscNullsLast' : 'DescNullsLast' }],
    recordGqlFields: { id: true, [labelField]: true, [dateField]: true },
    limit: 5,
    fetchPolicy: 'cache-and-network',
  });

  const renderRow = (record: ObjectRecord) => (
    <StyledRow
      key={record.id}
      to={getAppPath(AppPath.RecordShowPage, {
        objectNameSingular: objectMetadataItem.nameSingular,
        objectRecordId: record.id,
      })}
    >
      <OverflowingTextWithTooltip text={record[labelField] || t`Untitled`} />
      <StyledDate>
        {dateField === 'closeDate' ? (
          <DateDisplay value={record[dateField]} />
        ) : (
          <DateTimeDisplay value={record[dateField]} />
        )}
      </StyledDate>
    </StyledRow>
  );

  return (
    <StyledColumn>
      <StyledMetric
        sectionName={objectMetadataItem.nameSingular}
        aria-busy={loading}
      >
        <div>
          {objectMetadataItem.labelPlural}
          {objectMetadataItem.nameSingular === 'task' ? (
            <IconCheckbox size={22} />
          ) : objectMetadataItem.nameSingular === 'opportunity' ? (
            <IconTarget size={22} />
          ) : (
            <IconNotes size={22} />
          )}
        </div>
        <strong>
          {loading || error || totalCount === undefined ? '—' : totalCount}
        </strong>
        {summaryDescription}
      </StyledMetric>
      <StyledSection
        sectionName={objectMetadataItem.nameSingular}
        aria-label={title}
        aria-description={description}
        aria-busy={loading}
      >
        <StyledSectionHeader>
          <StyledSectionTitle>
            <StyledHeading>{title}</StyledHeading>
            <NavigationButton
              to={getAppPath(AppPath.RecordIndexPage, {
                objectNamePlural: objectMetadataItem.namePlural,
              })}
              variant="ghost"
              size="sm"
            >{t`View all`}</NavigationButton>
          </StyledSectionTitle>
          {children}
        </StyledSectionHeader>
        <StyledSectionBody>
          {error ? (
            <InlineBanner
              color="danger"
              message={t`This section could not load. Check your connection and try again.`}
              button={{
                title: t`Retry`,
                onClick: () => void refetch().catch(() => undefined),
                disabled: loading,
              }}
            />
          ) : loading && records.length === 0 ? (
            <SkeletonLoader />
          ) : records.length === 0 ? (
            <EmptyState.Content>
              <EmptyState.Description>{emptyMessage}</EmptyState.Description>
            </EmptyState.Content>
          ) : (
            <>
              {records.slice(0, showAllRecords ? 5 : 3).map(renderRow)}
              {records.length > 3 && (
                <StyledSectionFooter>
                  <Button
                    variant="ghost"
                    color="neutral"
                    size="sm"
                    aria-expanded={showAllRecords}
                    onClick={() => setShowAllRecords(!showAllRecords)}
                  >
                    {showAllRecords ? t`Show less` : t`Show more`}
                  </Button>
                </StyledSectionFooter>
              )}
            </>
          )}
        </StyledSectionBody>
      </StyledSection>
    </StyledColumn>
  );
};

export const HomeDashboardPage = () => {
  const { t } = useLingui();
  const { readableObjectMetadataItems } = useReadableObjectMetadataItems();
  const member = useAtomStateValue(currentWorkspaceMemberState);
  const [taskPeriod, setTaskPeriod] = useState('upcoming');
  const { timeZone } = useDateTimeFormat();
  const today = Temporal.Now.zonedDateTimeISO(timeZone).startOfDay();
  const tomorrow = today.add({ days: 1 });
  const taskDueFilters =
    taskPeriod === 'all'
      ? []
      : taskPeriod === 'today'
        ? [
            { dueAt: { gte: today.toInstant().toString() } },
            { dueAt: { lt: tomorrow.toInstant().toString() } },
          ]
        : taskPeriod === 'overdue'
          ? [{ dueAt: { lt: today.toInstant().toString() } }]
          : [{ dueAt: { lt: today.add({ days: 7 }).toInstant().toString() } }];
  const nextWeek = new Date();
  nextWeek.setUTCHours(23, 59, 59, 999);
  nextWeek.setUTCDate(nextWeek.getUTCDate() + 7);

  const task = readableObjectMetadataItems.find(
    (item) => item.nameSingular === 'task',
  );
  const opportunity = readableObjectMetadataItems.find(
    (item) => item.nameSingular === 'opportunity',
  );
  const note = readableObjectMetadataItems.find(
    (item) => item.nameSingular === 'note',
  );
  const hasFields = (
    item: EnrichedObjectMetadataItem | undefined,
    names: string[],
  ) =>
    item &&
    names.every((name) =>
      item.readableFields.some((field) => field.name === name),
    );

  const canShowTasks =
    task && member && hasFields(task, ['title', 'dueAt', 'status', 'assignee']);
  const canShowOpportunities =
    opportunity && hasFields(opportunity, ['name', 'closeDate', 'stage']);
  const canShowNotes = note && hasFields(note, ['title', 'updatedAt']);

  return (
    <PageCardLayout
      header={
        <PageCardHeader title={t`Dashboard`} showPageHeading="navigation" />
      }
    >
      <StyledContent>
        <StyledWelcome>
          <div>
            <h2>{t`Welcome back, ${member?.name?.firstName || t`there`}`}</h2>
            <StyledDescription>{t`Your CRM at a glance. Open a record to continue where you left off.`}</StyledDescription>
          </div>
          <StyledDate>
            <DateDisplay value={today.toPlainDate().toString()} />
          </StyledDate>
        </StyledWelcome>
        <StyledShortcuts aria-label={t`Workspace shortcuts`}>
          <StyledHeading>{t`Jump back into work`}</StyledHeading>
          <div>
            {[
              { name: 'company', icon: IconBuildingSkyscraper },
              { name: 'person', icon: IconUsers },
              { name: 'opportunity', icon: IconTarget },
              { name: 'task', icon: IconCheckbox },
            ].map(({ name, icon: Icon }) => {
              const item = readableObjectMetadataItems.find(
                (object) => object.nameSingular === name,
              );
              return item ? (
                <Link
                  key={name}
                  to={getAppPath(AppPath.RecordIndexPage, {
                    objectNamePlural: item.namePlural,
                  })}
                >
                  <Icon size={18} />
                  {item.labelPlural}
                  <IconArrowRight size={14} />
                </Link>
              ) : null;
            })}
          </div>
        </StyledShortcuts>
        <StyledGrid>
          {canShowTasks && task && member && (
            <HomeRecordSection
              objectMetadataItem={task}
              title={t`Your tasks`}
              summaryDescription={t`Open tasks assigned to you`}
              description={t`Open tasks assigned to you, ordered by due date.`}
              emptyMessage={t`No open tasks match this shortcut. My tasks also includes tasks without a due date.`}
              labelField="title"
              dateField="dueAt"
              filter={{
                and: [
                  { assigneeId: { eq: member.id } },
                  { status: { in: ['TODO', 'IN_PROGRESS'] } },
                  ...taskDueFilters,
                ],
              }}
            >
              <StyledActions role="group" aria-label={t`Task shortcuts`}>
                {[
                  { value: 'upcoming', label: t`Upcoming / overdue` },
                  { value: 'all', label: t`My tasks` },
                  { value: 'today', label: t`Due today` },
                  { value: 'overdue', label: t`Overdue` },
                ].map(({ value, label }) => (
                  <Button
                    key={value}
                    size="sm"
                    variant={taskPeriod === value ? 'soft' : 'ghost'}
                    color="neutral"
                    aria-pressed={taskPeriod === value}
                    onClick={() => setTaskPeriod(value)}
                  >
                    {label}
                  </Button>
                ))}
              </StyledActions>
            </HomeRecordSection>
          )}
          {canShowOpportunities && opportunity && (
            <HomeRecordSection
              objectMetadataItem={opportunity}
              title={t`Opportunities needing attention`}
              summaryDescription={t`Closing soon or overdue`}
              description={t`Deals closing within seven days or overdue, excluding the Customer stage.`}
              emptyMessage={t`No opportunities have a close date in this period. Opportunities without a close date are available in Opportunities.`}
              labelField="name"
              dateField="closeDate"
              filter={{
                and: [
                  { stage: { neq: 'CUSTOMER' } },
                  { closeDate: { lte: nextWeek.toISOString().slice(0, 10) } },
                ],
              }}
            />
          )}
          {canShowNotes && note && (
            <HomeRecordSection
              objectMetadataItem={note}
              title={t`Recent notes`}
              summaryDescription={t`Notes you can access`}
              description={t`Your latest notes and conversation updates.`}
              emptyMessage={t`No notes yet. Add notes to your records to keep track of conversations and updates.`}
              labelField="title"
              dateField="updatedAt"
              ascending={false}
            />
          )}
        </StyledGrid>
        {!canShowTasks && !canShowOpportunities && !canShowNotes && (
          <EmptyState.Content>
            <EmptyState.Title>{t`No overview available`}</EmptyState.Title>
            <EmptyState.Description>{t`You do not have access to the objects used by this overview. Use your sidebar to open available modules.`}</EmptyState.Description>
          </EmptyState.Content>
        )}
      </StyledContent>
    </PageCardLayout>
  );
};
