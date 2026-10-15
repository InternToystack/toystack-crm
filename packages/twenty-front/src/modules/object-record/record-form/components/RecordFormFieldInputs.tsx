import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { formatFieldMetadataItemAsFieldDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsFieldDefinition';
import { getFieldMetadataItemGqlFieldName } from '@/object-metadata/utils/getFieldMetadataItemGqlFieldName';
import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { t } from '@lingui/core/macro';
import { FormFieldInput } from '@/object-record/record-field/ui/components/FormFieldInput';
import { getRecordFormFieldInputSettings } from '@/object-record/record-form/utils/getRecordFormFieldInputSettings';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { styled } from '@linaria/react';
import { type JsonValue } from 'type-fest';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledFieldList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[5]};
  & details {
    border-top: 1px solid ${themeCssVariables.border.color.light};
    padding-top: 20px;
  }
  & summary {
    cursor: pointer;
    color: ${themeCssVariables.color.blue11};
    margin-bottom: 20px;
    font-size: 14px;
  }
  & details > div {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
`;

type RecordFormFieldInputsProps = {
  compact?: boolean;
  objectMetadataItem: EnrichedObjectMetadataItem;
  fieldMetadataItems: FieldMetadataItem[];
  draftRecord: Partial<ObjectRecord>;
  onFieldValueChange: (gqlFieldName: string, value: JsonValue) => void;
  onFieldValueClear: (gqlFieldName: string) => void;
};

export const RecordFormFieldInputs = ({
  objectMetadataItem,
  compact = false,
  fieldMetadataItems,
  draftRecord,
  onFieldValueChange,
  onFieldValueClear,
}: RecordFormFieldInputsProps) => {
  const isPrimary = (field: FieldMetadataItem) =>
    !compact ||
    !field.isNullable ||
    field.id === objectMetadataItem.labelIdentifierFieldMetadataId ||
    field.name === 'domainName' ||
    [
      FieldMetadataType.TEXT,
      FieldMetadataType.FULL_NAME,
      FieldMetadataType.SELECT,
      FieldMetadataType.DATE,
      FieldMetadataType.DATE_TIME,
      FieldMetadataType.RELATION,
      FieldMetadataType.MORPH_RELATION,
      FieldMetadataType.RICH_TEXT,
    ].includes(field.type);
  const renderField = (fieldMetadataItem: FieldMetadataItem) => {
    const gqlFieldName = getFieldMetadataItemGqlFieldName(fieldMetadataItem);

    if (
      compact &&
      fieldMetadataItem.type === FieldMetadataType.LINKS &&
      fieldMetadataItem.name === 'domainName'
    ) {
      const links = draftRecord[gqlFieldName];
      return (
        <FormTextFieldInput
          key={fieldMetadataItem.id}
          label={fieldMetadataItem.label}
          defaultValue={links?.primaryLinkUrl ?? ''}
          placeholder="example.com"
          onChange={(url) =>
            onFieldValueChange(gqlFieldName, {
              ...links,
              primaryLinkLabel: links?.primaryLinkLabel ?? '',
              primaryLinkUrl: url,
              secondaryLinks: links?.secondaryLinks ?? [],
            })
          }
        />
      );
    }
    return (
      <FormFieldInput
        key={fieldMetadataItem.id}
        field={formatFieldMetadataItemAsFieldDefinition({
          field: fieldMetadataItem,
          objectMetadataItem,
          showLabel: true,
        })}
        defaultValue={draftRecord[gqlFieldName]}
        onChange={(value) => onFieldValueChange(gqlFieldName, value)}
        onClear={() => onFieldValueClear(gqlFieldName)}
        settings={getRecordFormFieldInputSettings(fieldMetadataItem.type)}
      />
    );
  };
  const extraFields = fieldMetadataItems.filter((field) => !isPrimary(field));
  return (
    <StyledFieldList>
      {fieldMetadataItems.filter(isPrimary).map(renderField)}
      {extraFields.length > 0 && (
        <details>
          <summary>{t`Additional details`}</summary>
          <div>{extraFields.map(renderField)}</div>
        </details>
      )}
    </StyledFieldList>
  );
};
