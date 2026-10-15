import { getTaskAgendaGroups } from '@/object-record/record-index/utils/getTaskAgendaGroups';
import { getActivityPreview } from '@/activities/utils/getActivityPreview';
import { CompanyRelationshipExplorer } from '@/object-record/record-index/components/CompanyRelationshipExplorer';
import { SkeletonLoader } from '@/activities/components/SkeletonLoader';
import { useRecordChipData } from '@/object-record/hooks/useRecordChipData';
import { AvatarOrIcon } from '@/ui/field/display/components/internal/AvatarOrIcon/AvatarOrIcon';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { isFieldValueEmpty } from '@/object-record/record-field/ui/utils/isFieldValueEmpty';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useOpenRecordFromIndexView } from '@/object-record/record-index/hooks/useOpenRecordFromIndexView';
import { useRecordIndexTableQuery } from '@/object-record/record-index/hooks/useRecordIndexTableQuery';
import { RecordListEmptyState } from '@/object-record/record-list/components/RecordListEmptyState';
import { RecordListFieldTooltip } from '@/object-record/record-list/components/RecordListFieldTooltip';
import { RecordListRowField } from '@/object-record/record-list/components/RecordListRowField';
import { RecordListSSESubscribeEffect } from '@/object-record/record-list/components/RecordListSSESubscribeEffect';
import { RecordListUpsertRecordsInStoreEffect } from '@/object-record/record-list/components/RecordListUpsertRecordsInStoreEffect';
import { RecordListContextProvider } from '@/object-record/record-list/contexts/RecordListContext';
import { RecordListComponentInstanceContext } from '@/object-record/record-list/states/contexts/RecordListComponentInstanceContext';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { styled } from '@linaria/react';
import { useState } from 'react';
import { useLingui } from '@lingui/react/macro';
import { InlineBanner } from 'twenty-ui/components';
import { Button } from 'twenty-ui/primitives/input';
import { IconArrowUpRight, IconFileText } from 'twenty-ui/icon';

const StyledCollection = styled.div`
  overflow: auto;
  padding: 4px 0 24px;
  flex: 1;
  min-height: 0;
  &[data-density='dense'] article[data-module='workflowRun'],
  &[data-density='dense'] article[data-module='workflowVersion'] {
    min-height: 52px;
    padding-top: 8px;
    padding-bottom: 8px;
  }
`;
const StyledRecords = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 1280px;
  box-sizing: border-box;
  &[data-module='company'] {
    display: flex;
    flex-direction: column;
    max-width: 1200px;
  }
  &[data-module='person'] {
    max-width: 1160px;
  }
  &[data-module='workflow'] {
    max-width: 1100px;
  }
  &[data-module='workflowRun'],
  &[data-module='workflowVersion'] {
    max-width: 1100px;
    border-left: 1px solid var(--t-border-color-medium);
    margin-left: 9px;
    padding-left: 20px;
  }
  &[data-module='dashboard'] {
    max-width: 1040px;
  }

  &[data-module='person'],
  &[data-module='workflow'],
  &[data-module='dashboard'] {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0 40px;
    max-width: 1120px;
  }
  &[data-module='person'] {
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 0 32px;
  }
  &[data-module='note'] {
    display: flex;
    flex-direction: column;
    max-width: 1160px;
  }
  &[data-module='dashboard'] {
    counter-reset: reports;
  }
  @media (max-width: 700px) {
    grid-template-columns: minmax(0, 1fr) !important;
  }
`;
const StyledTaskAgenda = styled.div`
  width: 100%;
  max-width: 1160px;
  & > section {
    display: grid;
    grid-template-columns: 138px minmax(0, 1fr);
    gap: 24px;
    padding: 16px 0 22px;
    border-top: 1px solid var(--t-border-color-light);
  }
  & h2 {
    margin: 14px 0 0;
    font-size: 12px;
    font-weight: 500;
    color: var(--t-font-color-secondary);
    display: flex;
    align-items: center;
    gap: 10px;
    & span { color: var(--t-font-color-tertiary); font-size: 11px; }
  }
  & [data-attention='today'] h2 { color: var(--t-color-blue11); }
  & [data-attention='today'] h2::before {
    content: '';
    width: 5px;
    height: 5px;
    background: var(--t-color-blue9);
    border-radius: 50%;
  }
  & [data-task-actions] { padding: 8px 10px; }
  @media (max-width: 700px) {
    & > section { grid-template-columns: minmax(0, 1fr); gap: 10px; }
    & h2 { margin: 0 10px; }
  }
`;
const StyledPipeline = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  max-width: 1280px;
  padding-bottom: 16px;
  min-width: 0;
  &[data-module='opportunity'][data-focused='false'] {
    flex-direction: row;
    overflow-x: auto;
    gap: 24px;
    & > section {
      flex: 0 0 280px;
    }
  }
  &[data-focused='true'] > section {
    max-width: 1120px;
  }
`;
const StyledLane = styled.section`
  width: 100%;
  min-width: 0;
  & > h2 {
    align-items: center;
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    margin: 0;
    padding: 10px 4px;
    border-bottom: 1px solid var(--t-border-color-medium);
    & > div {
      margin: 0;
    }
  }
  &[data-module='opportunity'] > h2 {
    border-top: 2px solid var(--t-border-color-medium);
    padding: 12px 0;
  }
  &[data-module='task'] > h2 {
    font-size: 12px;
    color: var(--t-font-color-secondary);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    border-bottom: 0;
  }
`;
const StyledLaneRows = styled.div`
  display: flex;
  flex-direction: column;
`;
const StyledRecordRow = styled.article`
  display: grid;
  grid-template-columns: minmax(220px, 1fr) minmax(0, 1fr);
  align-items: center;
  min-width: 0;
  min-height: 64px;
  border-bottom: 1px solid var(--t-border-color-light);
  padding: 8px 4px;
  box-sizing: border-box;
  &[data-module='company'] {
    grid-template-columns: minmax(0, 1fr) minmax(160px, 240px);
    min-height: 76px;
    padding: 14px 12px;
    &[data-sparse='true'] {
      min-height: 60px;
    }
    & > div:first-child {
      padding-right: 20px;
    }
    & > div:first-child button {
      font-size: 14px;
    }
    & > div:nth-child(2) {
      display: block;
      font-size: 12px;
      & > div > div:first-child {
        margin-bottom: 6px;
      }
    }
  }
  &[data-module='task'] {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(160px, 0.62fr);
    gap: 24px;
    min-height: 68px;
    padding: 14px 10px;
    & > div:first-child { padding-right: 0; }
    & > div:first-child button { font-size: 13px; font-weight: 500; }
    & > div:nth-child(2) {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 6px;
      font-size: 11px;
      & > div { display: flex; align-items: center; gap: 8px; }
      & > div > div:first-child { display: none; }
    }
    @media (max-width: 700px) {
      & > div:nth-child(2) { align-items: flex-start; flex-direction: row; }
    }
  }
  &[data-module='workflowRun'],
  &[data-module='workflowVersion'] {
    min-height: 56px;
    grid-template-columns: minmax(220px, 1fr) minmax(0, 360px);
    & > div:nth-child(2) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
  &[data-module='workflowRun'],
  &[data-module='workflowVersion'] {
    position: relative;
    &::before {
      content: '';
      position: absolute;
      left: -25px;
      top: 24px;
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--t-font-color-tertiary);
    }
  }
  &[data-module='person'] {
    display: block;
    min-height: 112px;
    padding: 22px 0;
    & > div:first-child {
      padding-right: 0;
    }
    & [data-record-avatar] {
      transform: scale(1.4);
      margin: 4px 8px 0 4px;
    }
    & > div:first-child > div {
      margin-left: 40px;
    }
    & > div:nth-child(2) {
      display: flex;
      margin: 10px 0 0 40px;
      font-size: 12px;
      & > div > div:first-child {
        display: none;
      }
    }
  }
  &[data-module='note'] {
    grid-template-columns: minmax(0, 1fr) 170px;
    gap: 28px;
    padding: 18px 12px;
    min-height: 92px;
    & [data-record-avatar] {
      color: var(--t-font-color-tertiary);
      flex: 0 0 22px;
      padding-top: 1px;
    }
    & > div:first-child { padding-right: 0; }
    & > div:first-child button {
      font-size: 14px;
      font-weight: 500;
      line-height: 1.5;
    }
    & [data-note-preview] {
      margin: 6px 0 0 32px;
      color: var(--t-font-color-secondary);
      font-size: 12px;
      line-height: 1.6;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    & > div:nth-child(2) {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 7px;
      color: var(--t-font-color-secondary);
      font-size: 11px;
      & > div > div:first-child { display: none; }
    }
    @media (max-width: 700px) {
      gap: 8px;
      & > div:nth-child(2) {
        flex-direction: row;
        align-items: center;
        margin-left: 32px;
        gap: 16px;
      }
    }
  }
  &[data-module='opportunity'] {
    display: block;
    padding: 18px 0;
    min-height: 114px;
    & > div:first-child {
      padding-right: 0;
    }
    & > div:nth-child(2) {
      display: flex;
      flex-wrap: wrap;
      gap: 10px 20px;
      margin: 12px 0 0 28px;
      font-size: 12px;
      & > div > div:first-child {
        display: none;
      }
    }
  }
  &[data-module='workflow'] {
    display: block;
    padding: 24px 0;
    min-height: 130px;
    & > div:nth-child(2) {
      margin: 18px 0 0 28px;
      padding-left: 16px;
      border-left: 2px solid var(--t-border-color-medium);
      grid-template-columns: repeat(2, minmax(0, 1fr));
      font-size: 12px;
    }
  }
  &[data-module='dashboard'] {
    display: block;
    position: relative;
    padding: 26px 0 26px 56px;
    min-height: 120px;
    counter-increment: reports;
    &::before {
      content: counter(reports, decimal-leading-zero);
      position: absolute;
      left: 0;
      top: 24px;
      font-size: 28px;
      font-weight: 300;
      color: var(--t-font-color-tertiary);
    }
    & [data-record-avatar] {
      display: none;
    }
    & > div:nth-child(2) {
      margin-top: 14px;
      font-size: 12px;
      & > div > div:first-child {
        display: none;
      }
    }
  }

  &[data-module='person'] {
    display: grid;
    grid-template-columns: minmax(180px, 1fr) minmax(200px, 1fr);
    min-height: 66px;
    padding: 12px 8px;
    & [data-record-avatar] {
      transform: none;
      margin: 0;
    }
    & > div:first-child > div {
      margin-left: 28px;
    }
    & > div:nth-child(2) {
      margin: 0;
    }
  }
  &[data-module='opportunity'] {
    display: grid;
    grid-template-columns: minmax(220px, 1fr) minmax(0, 1.25fr);
    align-items: center;
    min-height: 84px;
    padding: 16px 12px;
    & > div:nth-child(2) {
      margin: 0;
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 16px;
      font-size: 13px;
      & > div > div:first-child {
        display: block;
        font-size: 11px;
        margin-bottom: 6px;
      }
    }
    & button {
      font-weight: 500;
    }
  }
  &[data-selected='true'] {
    background: var(--t-color-blue3);
    & > div:first-child button {
      color: var(--t-color-blue11);
    }
  }
  &:hover {
    background: var(--t-background-transparent-light);
  }
  &[data-selected='true']:hover {
    background: var(--t-color-blue3);
  }
  @media (max-width: 700px) {
    grid-template-columns: minmax(0, 1fr) !important;
    gap: 6px;
    & > div:nth-child(2) {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    }
  }
`;
const StyledRowHeading = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  min-width: 0;
  padding-right: 24px;
`;
const StyledIdentityDetail = styled.div`
  margin: 5px 0 0 28px;
  font-size: 12px;
  & > div > div:first-child {
    display: none;
  }
`;
const StyledRecordTitle = styled.button`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: var(--t-font-color-primary);
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
  text-align: left;
  width: 100%;
  & [data-record-title] {
    flex: 1;
    min-width: 0;
    overflow-wrap: anywhere;
  }
  & [data-record-avatar] {
    flex: 0 0 18px;
    display: flex;
  }
  & > svg {
    flex-shrink: 0;
    color: var(--t-font-color-secondary);
    opacity: 0;
  }
  &:hover > svg {
    color: var(--t-color-blue9);
    opacity: 1;
  }
  &:focus-visible {
    outline: 2px solid var(--t-color-blue11);
    outline-offset: 4px;
  }
`;
const StyledFields = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  padding: 0;
  min-width: 0;
  & > div {
    min-width: 0;
    overflow: hidden;
  }
`;
const StyledLabel = styled.div`
  color: var(--t-font-color-secondary);
  font-size: 12px;
  margin-bottom: 4px;
`;
const StyledOverview = styled.div`
  &[data-module='task'] > div:first-child { display: none; }

  &[hidden] {
    display: none;
  }
  position: sticky;
  top: 0;
  z-index: 1;
  background: var(--t-background-secondary);
  padding: 8px 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
  font-size: 13px;
  color: var(--t-font-color-secondary);
  & strong {
    color: var(--t-font-color-primary);
    margin-left: 8px;
  }
  & label {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &[data-module='opportunity'] {
    display: block;
    padding: 4px 0 0;
    margin-bottom: 8px;
    & > div:first-child {
      display: none;
    }
    & > div:nth-child(2) {
      display: block;
    }
    & [role='group'] {
      display: flex;
      flex-wrap: wrap;
      gap: 4px 16px;
      border-bottom: 1px solid var(--t-border-color-medium);
      padding-bottom: 10px;
    }
    & [role='group'] > button {
      min-height: 38px;
      padding: 8px 14px;
    }
  }
`;
const StyledControls = styled.div`
  &[role='group'] > button[aria-pressed='true'] {
    box-shadow: inset 0 -2px var(--t-color-blue9);
  }
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
`;
const StyledCompanyPagination = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  max-width: 1200px;
  padding: 16px 12px;
  font-size: 12px;
  color: var(--t-font-color-secondary);
  & > span {
    margin-right: auto;
  }
`;
const StyledFooter = styled.div`
  display: flex;
  justify-content: center;
  padding: 16px;
  color: var(--t-font-color-secondary);
`;

const StyledDealWorkspace = styled.div`
  max-width: 1040px;
  width: 100%;
  & > section {
    margin-top: 20px;
  }
  & > section > h2 {
    font-size: 11px;
    font-weight: 500;
    color: var(--t-font-color-secondary);
    margin: 0 0 10px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
`;
const StyledContactGroup = styled.section`
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr);
  gap: 16px;
  max-width: 1080px;
  margin-bottom: 8px;
  & > h2 {
    font-size: 22px;
    font-weight: 400;
    color: var(--t-font-color-tertiary);
    margin: 12px 0 0;
  }
  @media (max-width: 700px) {
    grid-template-columns: 24px minmax(0, 1fr);
    gap: 8px;
  }
`;
const contactInitial = (record: ObjectRecord) => {
  const name =
    typeof record.name === 'string'
      ? record.name
      : record.name?.firstName || record.name?.lastName || '';
  return name.trim().charAt(0).toLocaleUpperCase() || '#';
};

const RecordCollectionRow = ({
  record,
  selected = false,
  onSelect,
}: {
  record: ObjectRecord;
  selected?: boolean;
  onSelect?: () => void;
}) => {
  const { t } = useLingui();
  const {
    objectNameSingular,
    labelIdentifierFieldMetadataItem,
    fieldDefinitionByFieldMetadataItemId,
  } = useRecordIndexContextOrThrow();
  const visibleFields = useAtomComponentSelectorValue(
    visibleRecordFieldsComponentSelector,
  );
  const { openRecordFromIndexView } = useOpenRecordFromIndexView();
  const { recordChipData } = useRecordChipData({ objectNameSingular, record });
  const fields = visibleFields.flatMap((recordField) => {
    const fieldDefinition =
      fieldDefinitionByFieldMetadataItemId[recordField.fieldMetadataItemId];
    if (
      !fieldDefinition ||
      recordField.fieldMetadataItemId ===
        labelIdentifierFieldMetadataItem?.id ||
      isFieldValueEmpty({
        fieldDefinition,
        fieldValue: record[fieldDefinition.metadata.fieldName],
      })
    )
      return [];
    return [{ recordField, fieldDefinition }];
  });
  const preferredFields: Record<string, string[]> = {
    person: ['emails', 'company', 'jobTitle'],
    company: ['domainName', 'accountOwner', 'address'],
    opportunity: ['amount', 'company', 'closeDate'],
    task: ['dueAt', 'assignee'],
    note: ['updatedAt', 'createdAt'],
    workflow: ['statuses', 'lastPublishedVersion', 'versions'],
    workflowRun: ['status', 'startedAt', 'endedAt'],
    workflowVersion: ['status', 'createdAt'],
    dashboard: ['updatedAt', 'createdAt'],
  };
  const priorities = preferredFields[objectNameSingular] ?? [];
  const preview = fields
    .filter((field) => {
      const name = field.fieldDefinition.metadata.fieldName;
      return priorities.length > 0
        ? priorities.includes(name)
        : !['body', 'bodyV2', 'createdBy', 'updatedBy', 'createdAt', 'updatedAt'].includes(name);
    })
    .sort((left, right) => {
      const rank = (field: (typeof fields)[number]) => {
        const index = priorities.indexOf(
          field.fieldDefinition.metadata.fieldName,
        );
        return index === -1 ? priorities.length : index;
      };
      return rank(left) - rank(right);
    })
    .slice(0, ['note', 'dashboard'].includes(objectNameSingular) ? 1 : objectNameSingular === 'opportunity' ? 3 : 2);
  const renderField = ({
    recordField,
    fieldDefinition,
  }: (typeof fields)[number]) => (
    <div key={recordField.fieldMetadataItemId}>
      <StyledLabel>{fieldDefinition.label}</StyledLabel>
      <RecordListRowField
        recordId={record.id}
        recordField={recordField}
        fieldDefinition={fieldDefinition}
        maxWidth={400}
      />
    </div>
  );
  const opportunityFields =
    objectNameSingular === 'opportunity'
      ? priorities.flatMap((name) => {
          const recordField = visibleFields.find(
            (visibleField) =>
              fieldDefinitionByFieldMetadataItemId[
                visibleField.fieldMetadataItemId
              ]?.metadata.fieldName === name,
          );
          const fieldDefinition =
            recordField &&
            fieldDefinitionByFieldMetadataItemId[
              recordField.fieldMetadataItemId
            ];
          return recordField && fieldDefinition
            ? [{ recordField, fieldDefinition }]
            : [];
        })
      : [];
  const identityField =
    ['person', 'company'].includes(objectNameSingular) &&
    ['emails', 'domainName'].includes(
      preview[0]?.fieldDefinition.metadata.fieldName,
    )
      ? preview[0]
      : undefined;
  const secondaryFields =
    objectNameSingular === 'company'
      ? []
      : identityField
        ? preview.slice(1)
        : preview;
  const notePreview =
    objectNameSingular === 'note'
      ? getActivityPreview(record.bodyV2?.blocknote ?? null).replace(/\s+/g, ' ').trim()
      : '';
  return (
    <StyledRecordRow
      data-module={objectNameSingular}
      data-selected={selected}
      data-sparse={preview.length === 0}
    >
      <StyledRowHeading>
        <StyledRecordTitle
          onClick={() => {
            onSelect?.();
            openRecordFromIndexView({ recordId: record.id });
          }}
        >
          {objectNameSingular !== 'task' && (
            <span data-record-avatar>
              {objectNameSingular === 'note' ? (
                <IconFileText size={20} aria-hidden />
              ) : (
                <AvatarOrIcon
                  isAvatarNeutral={objectNameSingular === 'person'}
                  name={recordChipData.name}
                  colorSeed={record.id}
                  shape={recordChipData.avatarShape}
                  src={getAbsoluteImageUrl(recordChipData.avatarUrl ?? '')}
                />
              )}
            </span>
          )}
          <span data-record-title>{recordChipData.name || t`Untitled`}</span>
          <IconArrowUpRight size={18} aria-hidden />
        </StyledRecordTitle>
        {objectNameSingular === 'company' && !identityField && (
          <StyledIdentityDetail>
            <StyledLabel>No website added</StyledLabel>
          </StyledIdentityDetail>
        )}
        {identityField && (
          <StyledIdentityDetail>
            {renderField(identityField)}
          </StyledIdentityDetail>
        )}
        {objectNameSingular === 'note' && (
          <p data-note-preview>{notePreview || t`No content yet`}</p>
        )}
      </StyledRowHeading>
      {objectNameSingular === 'opportunity' ? (
        <StyledFields>
          {opportunityFields.map(({ recordField, fieldDefinition }) =>
            isFieldValueEmpty({
              fieldDefinition,
              fieldValue: record[fieldDefinition.metadata.fieldName],
            }) ? (
              <div key={recordField.fieldMetadataItemId}>
                <StyledLabel>{fieldDefinition.label}</StyledLabel>
                <span>—</span>
              </div>
            ) : (
              renderField({ recordField, fieldDefinition })
            ),
          )}
        </StyledFields>
      ) : (
        secondaryFields.length > 0 && (
          <StyledFields>{secondaryFields.map(renderField)}</StyledFields>
        )
      )}
    </StyledRecordRow>
  );
};

export const RecordIndexCollection = () => {
  const [selectedRecordId, setSelectedRecordId] = useState<string>();
  const [selectedStage, setSelectedStage] = useState('focus');
  const [expandedStages, setExpandedStages] = useState<string[]>([]);
  const [hideEmptyStages, setHideEmptyStages] = useState(false);
  const { t } = useLingui();
  const {
    objectNameSingular,
    objectMetadataItem,
    viewBarInstanceId,
    recordIndexId,
  } = useRecordIndexContextOrThrow();
  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );
  const groupFieldName =
    objectNameSingular === 'opportunity'
      ? 'stage'
      : objectNameSingular === 'task'
        ? 'status'
        : undefined;
  const groupField = objectMetadataItem.readableFields.find(
    (field) => field.name === groupFieldName,
  );
  const taskDateFields =
    objectNameSingular === 'task'
      ? objectMetadataItem.readableFields.filter((field) => field.name === 'dueAt')
      : [];
  const notePreviewFields =
    objectNameSingular === 'note'
      ? objectMetadataItem.readableFields.filter((field) => field.name === 'bodyV2')
      : [];
  const companyConnectionFields =
    objectNameSingular === 'company'
      ? objectMetadataItem.readableFields.filter((field) =>
          ['people', 'opportunities'].includes(field.name),
        )
      : [];
  const {
    records,
    queryIdentifier,
    loading,
    error,
    totalCount,
    hasNextPage,
    fetchMoreRecords,
    refetch,
  } = useRecordIndexTableQuery(
    objectNameSingular,
    groupField
      ? [groupField.id, ...taskDateFields.map((field) => field.id)]
      : [...companyConnectionFields, ...notePreviewFields, ...taskDateFields].map((field) => field.id),
  );
  const [companyPagination, setCompanyPagination] = useState({
    key: queryIdentifier,
    page: 0,
  });
  const paginatedRecords = records;
  const paginationKey = queryIdentifier;
  const pageSize = objectNameSingular === 'person' ? 12 : 8;
  const companyPageCount = Math.max(
    1,
    Math.ceil(paginatedRecords.length / pageSize),
  );
  const companyPage =
    companyPagination.key === paginationKey
      ? Math.min(companyPagination.page, companyPageCount - 1)
      : 0;
  const collectionRecords = ['company', 'person', 'note'].includes(objectNameSingular)
    ? paginatedRecords.slice(
        companyPage * pageSize,
        (companyPage + 1) * pageSize,
      )
    : records;
  const lanes =
    groupField?.options?.map((option) => ({
      value: option.value,
      label: option.label,
      records: records.filter(
        (record) => record[groupField.name] === option.value,
      ),
    })) ?? [];
  const ungrouped = groupField
    ? records.filter(
        (record) =>
          !lanes.some((lane) => lane.value === record[groupField.name]),
      )
    : [];
  if (ungrouped.length)
    lanes.push({ value: '', label: t`Unassigned`, records: ungrouped });
  const activeStage =
    selectedStage === 'focus'
      ? (lanes.find((lane) => lane.records.length > 0)?.value ??
        lanes[0]?.value)
      : selectedStage;
  const visibleLanes = lanes.filter(
    (lane) =>
      (activeStage === 'all' || lane.value === activeStage) &&
      (!hideEmptyStages ||
        activeStage !== 'all' ||
        hasNextPage ||
        lane.records.length > 0),
  );
  const taskAgendaGroups = objectNameSingular === 'task'
    ? getTaskAgendaGroups(visibleLanes.flatMap((lane) => lane.records), {
        canReadDueDate: taskDateFields.length > 0,
        canReadStatus: !!groupField,
      })
    : [];
  const taskAgendaLabels: Record<string, string> = {
    overdue: 'Overdue', today: 'Today', upcoming: 'Upcoming',
    unscheduled: 'No due date', tasks: 'Tasks', completed: 'Completed',
  };
  const contactGroups = collectionRecords.reduce<Map<string, ObjectRecord[]>>(
    (groups, record) => {
      const initial = contactInitial(record);
      groups.set(initial, [...(groups.get(initial) ?? []), record]);
      return groups;
    },
    new Map(),
  );
  return (
    <RecordListComponentInstanceContext.Provider
      value={{ instanceId: recordIndexId }}
    >
      <RecordListContextProvider
        value={{
          objectNameSingular,
          objectMetadataItem,
          objectPermissions,
          viewBarInstanceId,
        }}
      >
        <RecordListSSESubscribeEffect />
        <RecordListUpsertRecordsInStoreEffect records={records} />
        <RecordListFieldTooltip>
          <StyledCollection
            data-module={objectNameSingular}
            data-grouped={!!groupField}
            data-density={records.length > 12 ? 'dense' : 'regular'}
          >
            <StyledOverview
              data-module={objectNameSingular}
              hidden={!groupField}
            >
              <div>
                {['opportunity', 'note'].includes(objectNameSingular)
                  ? objectMetadataItem.labelPlural
                  : t`Matching records`}
                <strong>
                  {loading && totalCount === undefined
                    ? '—'
                    : (totalCount ?? records.length)}
                </strong>
              </div>
              {groupField && (
                <StyledControls>
                  <StyledControls role="group" aria-label={t`Focus stage`}>
                    <Button
                      variant={activeStage === 'all' ? 'soft' : 'ghost'}
                      color="neutral"
                      size="sm"
                      aria-pressed={activeStage === 'all'}
                      onClick={() => setSelectedStage('all')}
                    >{objectNameSingular === 'task' ? 'All tasks' : t`All stages`}</Button>
                    {lanes.map((lane) => (
                      <Button
                        key={lane.value}
                        variant={activeStage === lane.value ? 'soft' : 'ghost'}
                        color="neutral"
                        size="sm"
                        aria-pressed={activeStage === lane.value}
                        onClick={() => setSelectedStage(lane.value)}
                      >
                        {lane.label} · {lane.records.length}
                      </Button>
                    ))}
                  </StyledControls>
                  {!['opportunity', 'task'].includes(objectNameSingular) && (
                    <label>
                      <input
                        type="checkbox"
                        checked={hideEmptyStages}
                        disabled={hasNextPage}
                        onChange={(event) =>
                          setHideEmptyStages(event.target.checked)
                        }
                      />
                      {t`Hide empty stages`}
                    </label>
                  )}
                </StyledControls>
              )}
            </StyledOverview>
            {error ? (
              <InlineBanner
                color="danger"
                message={t`Records could not load. Try again.`}
                button={{
                  title: t`Retry`,
                  onClick: () => void refetch().catch(() => undefined),
                  disabled: loading,
                }}
              />
            ) : loading && records.length === 0 ? (
              <SkeletonLoader />
            ) : records.length === 0 ? (
              <RecordListEmptyState />
            ) : groupField && objectNameSingular === 'opportunity' ? (
              <StyledDealWorkspace>
                {visibleLanes.map((lane) => (
                  <section key={lane.value} aria-label={lane.label}>
                    <h2>
                      {lane.label} · {lane.records.length}
                    </h2>
                    <div>
                      {lane.records
                        .slice(
                          0,
                          expandedStages.includes(lane.value) ? undefined : 5,
                        )
                        .map((record) => (
                          <RecordCollectionRow
                            key={record.id}
                            record={record}
                            selected={selectedRecordId === record.id}
                            onSelect={() => setSelectedRecordId(record.id)}
                          />
                        ))}
                    </div>
                    {lane.records.length === 0 && (
                      <StyledLabel>{t`No records in this stage`}</StyledLabel>
                    )}
                    {lane.records.length > 5 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        aria-expanded={expandedStages.includes(lane.value)}
                        onClick={() =>
                          setExpandedStages((current) =>
                            current.includes(lane.value)
                              ? current.filter((value) => value !== lane.value)
                              : [...current, lane.value],
                          )
                        }
                      >
                        {expandedStages.includes(lane.value)
                          ? t`Show less`
                          : t`Show more`}
                      </Button>
                    )}
                  </section>
                ))}
              </StyledDealWorkspace>
            ) : objectNameSingular === 'company' ? (
              <CompanyRelationshipExplorer records={collectionRecords} />
            ) : objectNameSingular === 'person' ? (
              <div>
                {[...contactGroups].map(([initial, contacts]) => (
                  <StyledContactGroup key={initial} aria-label={initial}>
                    <h2>{initial}</h2>
                    <div>
                      {contacts.map((record) => (
                        <RecordCollectionRow
                          key={record.id}
                          record={record}
                          selected={selectedRecordId === record.id}
                          onSelect={() => setSelectedRecordId(record.id)}
                        />
                      ))}
                    </div>
                  </StyledContactGroup>
                ))}
              </div>
            ) : groupField && objectNameSingular === 'task' ? (
              <StyledTaskAgenda aria-label="Task agenda">
                {taskAgendaGroups.length === 0 && <StyledLabel>No tasks in this status</StyledLabel>}
                {taskAgendaGroups.map((group) => (
                  <section key={group.key} aria-label={taskAgendaLabels[group.key]} data-attention={group.key}>
                    <h2>{taskAgendaLabels[group.key]} <span>{group.records.length}</span></h2>
                    <div>
                      {group.records.slice(0, expandedStages.includes(group.key) ? undefined : 5).map((record) => (
                        <RecordCollectionRow key={record.id} record={record}
                          selected={selectedRecordId === record.id}
                          onSelect={() => setSelectedRecordId(record.id)} />
                      ))}
                      {group.records.length > 5 && (
                        <div data-task-actions>
                          <Button size="sm" variant="ghost" color="neutral"
                            aria-expanded={expandedStages.includes(group.key)}
                            onClick={() => setExpandedStages((current) => current.includes(group.key)
                              ? current.filter((key) => key !== group.key) : [...current, group.key])}>
                            {expandedStages.includes(group.key) ? t`Show less` : t`Show more`}
                          </Button>
                        </div>
                      )}
                    </div>
                  </section>
                ))}
              </StyledTaskAgenda>
            ) : groupField ? (
              <StyledPipeline
                data-module={objectNameSingular}
                data-focused={activeStage !== 'all'}
              >
                {visibleLanes.map((lane) => (
                  <StyledLane
                    key={lane.value}
                    aria-label={lane.label}
                    data-module={objectNameSingular}
                  >
                    <h2>
                      {lane.label}
                      <StyledLabel>{lane.records.length}</StyledLabel>
                    </h2>
                    <StyledLaneRows>
                      {lane.records.length === 0 ? (
                        <StyledLabel>{t`No records in this stage`}</StyledLabel>
                      ) : (
                        lane.records
                          .slice(
                            0,
                            expandedStages.includes(lane.value) ? undefined : 5,
                          )
                          .map((record) => (
                            <RecordCollectionRow
                              key={record.id}
                              record={record}
                              selected={selectedRecordId === record.id}
                              onSelect={() => setSelectedRecordId(record.id)}
                            />
                          ))
                      )}
                      {lane.records.length > 5 && (
                        <Button
                          variant="ghost"
                          color="neutral"
                          size="sm"
                          aria-expanded={expandedStages.includes(lane.value)}
                          onClick={() =>
                            setExpandedStages((current) =>
                              current.includes(lane.value)
                                ? current.filter(
                                    (value) => value !== lane.value,
                                  )
                                : [...current, lane.value],
                            )
                          }
                        >
                          {expandedStages.includes(lane.value)
                            ? t`Show less`
                            : t`Show more`}
                        </Button>
                      )}
                    </StyledLaneRows>
                  </StyledLane>
                ))}
              </StyledPipeline>
            ) : (
              <StyledRecords data-module={objectNameSingular}>
                {collectionRecords.map((record) => (
                  <RecordCollectionRow
                    key={record.id}
                    record={record}
                    selected={selectedRecordId === record.id}
                    onSelect={() => setSelectedRecordId(record.id)}
                  />
                ))}
              </StyledRecords>
            )}
            {['company', 'person', 'note'].includes(objectNameSingular) &&
              paginatedRecords.length > pageSize &&
              !error && (
                <StyledCompanyPagination>
                  <span>
                    {companyPage * pageSize + 1}–
                    {Math.min(
                      (companyPage + 1) * pageSize,
                      paginatedRecords.length,
                    )}{' '}
                    / {totalCount ?? records.length}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={companyPage === 0}
                    onClick={() =>
                      setCompanyPagination({
                        key: paginationKey,
                        page: companyPage - 1,
                      })
                    }
                  >{t`Previous`}</Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={companyPage === companyPageCount - 1}
                    onClick={() =>
                      setCompanyPagination({
                        key: paginationKey,
                        page: companyPage + 1,
                      })
                    }
                  >{t`Next`}</Button>
                </StyledCompanyPagination>
              )}
            {hasNextPage && !error && (
              <StyledFooter>
                <Button
                  variant="outline"
                  loading={loading}
                  onClick={() => void fetchMoreRecords()}
                >{t`Load more`}</Button>
              </StyledFooter>
            )}
            {groupField && hasNextPage && (
              <StyledFooter>{t`Stage counts show loaded records. Load more to see the rest.`}</StyledFooter>
            )}
          </StyledCollection>
        </RecordListFieldTooltip>
      </RecordListContextProvider>
    </RecordListComponentInstanceContext.Provider>
  );
};
