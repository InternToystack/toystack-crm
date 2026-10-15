import { styled } from '@linaria/react';
import { AvatarOrIcon } from '@/ui/field/display/components/internal/AvatarOrIcon/AvatarOrIcon';
import { useRecordChipData } from '@/object-record/hooks/useRecordChipData';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useOpenRecordFromIndexView } from '@/object-record/record-index/hooks/useOpenRecordFromIndexView';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { RecordListRowField } from '@/object-record/record-list/components/RecordListRowField';
import { isFieldValueEmpty } from '@/object-record/record-field/ui/utils/isFieldValueEmpty';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';
import { IconArrowUpRight } from 'twenty-ui/icon';

const StyledExplorer = styled.div`
  max-width: 1160px;
  width: 100%;
`;
const StyledMap = styled.article`
  box-sizing: border-box;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(220px, 1.1fr) minmax(0, 1fr);
  gap: 20px;
  align-items: center;
  padding: 12px 0;
  min-height: 112px;
  border-bottom: 1px solid var(--t-border-color-light);
  &[data-empty='true'] {
    min-height: 84px;
    padding: 8px 0;
  }
  position: relative;
  &::before {
    content: '';
    position: absolute;
    left: 20%;
    right: 20%;
    top: 50%;
    height: 1px;
    background: var(--t-border-color-medium);
    z-index: 0;
  }
  & > * {
    position: relative;
    z-index: 1;
    background: var(--t-background-secondary);
  }
  @media (max-width: 800px) {
    grid-template-columns: minmax(0, 1fr);
    gap: 12px;
    &::before {
      display: none;
    }
    & > [data-company-identity] {
      grid-row: 1;
    }
  }
`;
const StyledIdentity = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  gap: 12px;
  text-align: left;
  padding: 6px 12px;
  & > div {
    min-width: 0;
  }
  & [data-company-website] {
    margin-top: 4px;
    font-size: 12px;
  }
  & > span {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 36px;
    width: 36px;
    height: 36px;
    border: 1px solid var(--t-border-color-medium);
    border-radius: 50%;
    & > * {
      transform: scale(1.3);
    }
  }
  & button {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    color: var(--t-font-color-primary);
    font: inherit;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    line-height: 1.4;
    text-align: left;
    overflow-wrap: anywhere;
    font-weight: 500;
    & svg {
      flex-shrink: 0;
      color: var(--t-font-color-secondary);
    }
    &:hover {
      color: var(--t-color-blue11);
    }
    &:focus-visible {
      outline: 2px solid var(--t-color-blue9);
      outline-offset: 4px;
    }
  }
  & small {
    color: var(--t-font-color-secondary);
    font-size: 12px;
  }
`;
const StyledConnections = styled.section`
  padding: 4px 0;
  & h3 {
    margin: 0 0 4px;
    font-size: 12px;
    font-weight: 500;
    color: var(--t-font-color-secondary);
  }
  & [data-related-avatar] {
    display: flex;
    flex: 0 0 18px;
    width: 18px;
    font-style: normal;
  }
  & p {
    margin: 4px 0;
    font-size: 12px;
    color: var(--t-font-color-tertiary);
    line-height: 1.6;
  }
  & button {
    display: flex;
    align-items: center;
    gap: 8px;
    text-align: left;
    font: inherit;
    font-size: 13px;
    line-height: 1.5;
    color: var(--t-font-color-primary);
    cursor: pointer;
    background: none;
    border: none;
    border-bottom: 1px solid var(--t-border-color-light);
    padding: 4px 0;
    width: 100%;
    & > span {
      min-width: 0;
      overflow-wrap: anywhere;
      flex: 1;
    }
    & > svg {
      flex-shrink: 0;
      opacity: 0;
    }
    &:hover {
      color: var(--t-color-blue11);
    }
    &:hover > svg {
      opacity: 1;
    }
    &:focus-visible {
      outline: 2px solid var(--t-color-blue9);
      outline-offset: 2px;
    }
  }
`;
const recordName = (record: ObjectRecord) =>
  typeof record.name === 'string'
    ? record.name
    : [record.name?.firstName, record.name?.lastName].filter(Boolean).join(' ');
const companyInitialName = (name: string) => name.replace(/^\[Demo\]\s*/, '');
const CompanyRelationshipRow = ({ selected }: { selected: ObjectRecord }) => {
  const { objectMetadataItem, fieldDefinitionByFieldMetadataItemId } =
    useRecordIndexContextOrThrow();
  const readable = (name: string) =>
    objectMetadataItem.readableFields.some((field) => field.name === name);
  const { recordChipData } = useRecordChipData({
    objectNameSingular: 'company',
    record: selected,
  });
  const { openRecordFromIndexView } = useOpenRecordFromIndexView();
  const { openRecordInSidePanel } = useOpenRecordInSidePanel();
  const visibleFields = useAtomComponentSelectorValue(
    visibleRecordFieldsComponentSelector,
  );
  const facts = visibleFields.flatMap((recordField) => {
    const fieldDefinition =
      fieldDefinitionByFieldMetadataItemId[recordField.fieldMetadataItemId];
    return fieldDefinition &&
      ['domainName'].includes(fieldDefinition.metadata.fieldName) &&
      !isFieldValueEmpty({
        fieldDefinition,
        fieldValue: selected[fieldDefinition.metadata.fieldName],
      })
      ? [{ recordField, fieldDefinition }]
      : [];
  });
  const connections = (
    field: 'people' | 'opportunities',
    objectName: 'person' | 'opportunity',
    label: string,
  ) => {
    if (!readable(field)) return null;
    const items = Array.isArray(selected[field])
      ? (selected[field] as ObjectRecord[])
      : undefined;
    return (
      <StyledConnections aria-label={label}>
        <h3>
          {label}
          {items ? ` · ${items.length}` : ''}
        </h3>
        {items?.length ? (
          items.slice(0, 1).map((record) => (
            <button
              key={record.id}
              onClick={() =>
                openRecordInSidePanel({
                  recordId: record.id,
                  objectNameSingular: objectName,
                  resetNavigationStack: true,
                })
              }
            >
              <i data-related-avatar>
                <AvatarOrIcon
                  isAvatarNeutral
                  name={recordName(record)}
                  colorSeed={record.id}
                  shape="circle"
                />
              </i>
              <span>{recordName(record) || 'Untitled'}</span>
              <IconArrowUpRight size={14} aria-hidden />
            </button>
          ))
        ) : (
          <p>
            {items
              ? '—'
              : 'Open the company to view linked records.'}
          </p>
        )}
        {items && items.length > 1 && (
          <button
            onClick={() => openRecordFromIndexView({ recordId: selected.id })}
          >
            +{items.length - 1} more
            <IconArrowUpRight size={14} aria-hidden />
          </button>
        )}
      </StyledConnections>
    );
  };
  return (
    <StyledMap
      aria-label={recordChipData.name || 'Untitled'}
      data-empty={!selected.people?.length && !selected.opportunities?.length}
    >
      {connections('people', 'person', 'Contacts') ?? <div />}
      <StyledIdentity data-company-identity>
        <span>
          <AvatarOrIcon
                  isAvatarNeutral
            name={companyInitialName(recordChipData.name || 'Untitled')}
            colorSeed={selected.id}
            shape={recordChipData.avatarShape}
            src={getAbsoluteImageUrl(recordChipData.avatarUrl ?? '')}
          />
        </span>
        <div>
          <button
            aria-label={`View company ${recordChipData.name || 'Untitled'}`}
            onClick={() => openRecordFromIndexView({ recordId: selected.id })}
          >
            {recordChipData.name || 'Untitled'}
            <IconArrowUpRight size={16} aria-hidden />
          </button>
          {facts.map(({ recordField, fieldDefinition }) => (
            <div data-company-website key={recordField.fieldMetadataItemId}>
              <RecordListRowField
                recordId={selected.id}
                recordField={recordField}
                fieldDefinition={fieldDefinition}
                maxWidth={240}
              />
            </div>
          ))}
        </div>
      </StyledIdentity>
      {connections('opportunities', 'opportunity', 'Opportunities') ?? <div />}
    </StyledMap>
  );
};

export const CompanyRelationshipExplorer = ({
  records,
}: {
  records: ObjectRecord[];
}) => (
  <StyledExplorer aria-label="Company relationships">
    {records.map((record) => (
      <CompanyRelationshipRow key={record.id} selected={record} />
    ))}
  </StyledExplorer>
);
