import { isFieldValueEmpty } from '@/object-record/record-field/ui/utils/isFieldValueEmpty';
import { formatFieldMetadataItemAsFieldDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsFieldDefinition';
import { getFieldMetadataItemGqlFieldName } from '@/object-metadata/utils/getFieldMetadataItemGqlFieldName';
import { ObjectMetadataIcon } from '@/object-metadata/components/ObjectMetadataIcon';
import { HeaderIdentifier } from '@/ui/layout/page/components/HeaderIdentifier';
import { PageCardHeader } from '@/ui/layout/page/components/PageCardHeader';
import { SIDE_PANEL_FOCUS_ID } from '@/side-panel/constants/SidePanelFocusId';
import { currentFocusIdSelector } from '@/ui/utilities/focus/states/currentFocusIdSelector';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { RecordFormFieldInputs } from '@/object-record/record-form/components/RecordFormFieldInputs';
import { useRecordCreationFormSettle } from '@/object-record/record-form/hooks/useRecordCreationFormSettle';
import { useRecordFormFieldMetadataItems } from '@/object-record/record-form/hooks/useRecordFormFieldMetadataItems';
import { computeRecordFormCreateRecordInput } from '@/object-record/record-form/utils/computeRecordFormCreateRecordInput';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { recordCreationFormDraftComponentState } from '@/side-panel/pages/record-creation-form/states/recordCreationFormDraftComponentState';
import { recordCreationFormRequestComponentState } from '@/side-panel/pages/record-creation-form/states/recordCreationFormRequestComponentState';
import { SidePanelFooter } from '@/ui/layout/side-panel/components/SidePanelFooter';
import { useValidationRules } from '@/validation-rules/hooks/useValidationRules';
import { type DraftValidationRuleViolation } from '@/validation-rules/types/DraftValidationRuleViolation';
import { buildValidationRuleFieldDescriptors } from '@/validation-rules/utils/buildValidationRuleFieldDescriptors';
import { computeDraftValidationRuleViolations } from '@/validation-rules/utils/computeDraftValidationRuleViolations';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useState } from 'react';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { Key } from 'ts-key-enum';
import { type JsonValue } from 'type-fest';
import { isDefined } from 'twenty-shared/utils';
import { Dialog } from 'twenty-ui/primitives/surfaces';
import { IconX, IconPlus } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';

const StyledContainer = styled.div<{ isModal?: boolean }>`
  --record-form-control-height: ${({ isModal }) => (isModal ? '44px' : '32px')};
  --t-font-size-sm: 14px;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
`;

const StyledValidationRuleError = styled.div`
  background: ${themeCssVariables.background.danger};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.danger};
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

const StyledValidationRuleErrors = styled.div`
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing[2]};
  max-height: 30%;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

const StyledContent = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  min-height: 0;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[6]};
`;

export const SidePanelRecordCreationFormPage = ({
  isModal = false,
  onCancel,
}: {
  isModal?: boolean;
  onCancel?: () => void;
}) => {
  const recordCreationFormRequest = useAtomComponentStateValue(
    recordCreationFormRequestComponentState,
  );

  if (!isDefined(recordCreationFormRequest)) {
    return null;
  }

  return (
    <SidePanelRecordCreationForm
      isModal={isModal}
      onCancel={onCancel}
      requestId={recordCreationFormRequest.requestId}
      objectMetadataId={recordCreationFormRequest.objectMetadataId}
      initialDraftRecord={recordCreationFormRequest.initialDraftRecord}
    />
  );
};

const SidePanelRecordCreationForm = ({
  requestId,
  objectMetadataId,
  initialDraftRecord,
  isModal,
  onCancel,
}: {
  isModal?: boolean;
  onCancel?: () => void;
  requestId: string;
  objectMetadataId: string;
  initialDraftRecord: Partial<ObjectRecord>;
}) => {
  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: objectMetadataId,
  });

  const { objectMetadataItems } = useObjectMetadataItems();
  const theme = useTheme();

  const { settleRecordCreationDraft } = useRecordCreationFormSettle();

  const [recordCreationFormDraft, setRecordCreationFormDraft] =
    useAtomComponentState(recordCreationFormDraftComponentState);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationRuleViolations, setValidationRuleViolations] = useState<
    DraftValidationRuleViolation[]
  >([]);

  const { validationRules } = useValidationRules({ objectMetadataId });
  const currentFocusId = useAtomStateValue(currentFocusIdSelector);

  const draftRecord = recordCreationFormDraft ?? initialDraftRecord;

  const { recordFormFieldMetadataItems } = useRecordFormFieldMetadataItems({
    objectMetadataItem,
  });

  const labelField = recordFormFieldMetadataItems.find(
    (field) => field.id === objectMetadataItem.labelIdentifierFieldMetadataId,
  );
  const computeViolations = (draftRecordToCheck: Partial<ObjectRecord>) => [
    ...(isModal &&
    labelField &&
    isFieldValueEmpty({
      fieldDefinition: formatFieldMetadataItemAsFieldDefinition({
        field: labelField,
        objectMetadataItem,
      }),
      fieldValue:
        draftRecordToCheck[getFieldMetadataItemGqlFieldName(labelField)],
    })
      ? [
          {
            ruleId: 'record-name',
            message: t`Enter a name before creating this record.`,
          },
        ]
      : []),
    ...computeDraftValidationRuleViolations({
      validationRules,
      draftRecord: draftRecordToCheck,
      fields: buildValidationRuleFieldDescriptors({
        objectMetadataItem,
        objectMetadataItems,
      }),
      serverFilledFieldNames: objectMetadataItem.fields
        .filter(
          (fieldMetadataItem) =>
            fieldMetadataItem.isSystem ||
            isDefined(fieldMetadataItem.defaultValue),
        )
        .map((fieldMetadataItem) => fieldMetadataItem.name),
      now: new Date().toISOString(),
    }),
  ];

  const updateDraftRecord = (gqlFieldName: string, value: JsonValue) => {
    setRecordCreationFormDraft((previousDraftRecord) => ({
      ...(previousDraftRecord ?? initialDraftRecord),
      [gqlFieldName]: value,
    }));

    if (validationRuleViolations.length > 0) {
      setValidationRuleViolations(
        computeViolations({ ...draftRecord, [gqlFieldName]: value }),
      );
    }
  };

  const handleFieldValueChange = (gqlFieldName: string, value: JsonValue) => {
    updateDraftRecord(gqlFieldName, value);
  };

  const handleFieldValueClear = (gqlFieldName: string) => {
    updateDraftRecord(gqlFieldName, null);
  };

  const handleCreateClick = async () => {
    if (isSubmitting) {
      return;
    }

    if (isModal || validationRules.length > 0) {
      const draftViolations = computeViolations(draftRecord);

      setValidationRuleViolations(draftViolations);

      if (draftViolations.length > 0) {
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await settleRecordCreationDraft({
        requestId,
        draftRecord: computeRecordFormCreateRecordInput({
          draftRecord,
          fieldMetadataItems: recordFormFieldMetadataItems,
          objectMetadataItems,
        }),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerRef = useHotkeysOnFocusedElement({
    keys: [`${Key.Meta}+${Key.Enter}`, `${Key.Control}+${Key.Enter}`],
    focusId: currentFocusId ?? SIDE_PANEL_FOCUS_ID,
    callback: handleCreateClick,
    dependencies: [currentFocusId, handleCreateClick],
  });

  return (
    <StyledContainer
      isModal={isModal}
      ref={containerRef}
      style={
        isModal
          ? { height: 'auto', maxHeight: 'calc(100dvh - 64px)' }
          : undefined
      }
    >
      {isModal ? (
        <Dialog.Header
          style={{
            padding: '24px',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Dialog.Title
            style={{ fontSize: 22, textAlign: 'left' }}
          >{t`Create ${objectMetadataItem.labelSingular}`}</Dialog.Title>
          <Button
            variant="ghost"
            size="sm"
            aria-label={t`Cancel`}
            disabled={isSubmitting}
            onClick={onCancel}
          >
            <IconX />
          </Button>
        </Dialog.Header>
      ) : (
        <PageCardHeader
          title={
            <HeaderIdentifier
              icon={
                <ObjectMetadataIcon
                  objectMetadataItem={objectMetadataItem}
                  size={theme.icon.size.md}
                  stroke={theme.icon.stroke.sm}
                />
              }
              title={t`Create ${objectMetadataItem.labelSingular}`}
            />
          }
        />
      )}
      <StyledContent>
        <RecordFormFieldInputs
          compact={isModal}
          objectMetadataItem={objectMetadataItem}
          fieldMetadataItems={recordFormFieldMetadataItems}
          draftRecord={draftRecord}
          onFieldValueChange={handleFieldValueChange}
          onFieldValueClear={handleFieldValueClear}
        />
      </StyledContent>
      {validationRuleViolations.length > 0 && (
        <StyledValidationRuleErrors>
          {validationRuleViolations.map((violation) => (
            <StyledValidationRuleError key={violation.ruleId} role="alert">
              {violation.message}
            </StyledValidationRuleError>
          ))}
        </StyledValidationRuleErrors>
      )}
      <SidePanelFooter
        actions={[
          isModal && (
            <Button
              key="cancel-record"
              variant="outline"
              disabled={isSubmitting}
              onClick={onCancel}
            >{t`Cancel`}</Button>
          ),
          <Button
            key="create-record"
            startIcon={<IconPlus />}
            size="md"
            onClick={handleCreateClick}
            loading={isSubmitting}
            shortcut={['Mod', 'Enter']}
            data-testid="record-creation-form-create-button"
            variant="solid"
            color="accent"
          >{t`Create ${objectMetadataItem.labelSingular}`}</Button>,
        ]}
      />
    </StyledContainer>
  );
};
