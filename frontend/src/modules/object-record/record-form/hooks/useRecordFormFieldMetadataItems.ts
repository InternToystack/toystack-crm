import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { computeRecordFormFieldMetadataItems } from '@/object-record/record-form/utils/computeRecordFormFieldMetadataItems';
import { recordFormPageLayoutByObjectMetadataIdFamilySelector } from '@/page-layout/states/selectors/recordFormPageLayoutByObjectMetadataIdFamilySelector';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { isDefined } from 'twenty-shared/utils';
import { FieldMetadataType, RelationType } from '~/generated-metadata/graphql';

export const useRecordFormFieldMetadataItems = ({
  objectMetadataItem,
}: {
  objectMetadataItem: EnrichedObjectMetadataItem;
}): { recordFormFieldMetadataItems: FieldMetadataItem[] } => {
  const recordFormPageLayout = useAtomFamilySelectorValue(
    recordFormPageLayoutByObjectMetadataIdFamilySelector,
    { objectMetadataId: objectMetadataItem.id },
  );

  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );

  if (!isDefined(recordFormPageLayout)) {
    const excludedNames = [
      'id',
      'position',
      'createdAt',
      'updatedAt',
      'deletedAt',
      'createdBy',
      'updatedBy',
      'searchVector',
      'lastContact',
      'lastContactItem',
    ];
    return {
      recordFormFieldMetadataItems: objectMetadataItem.updatableFields
        .filter(
          (field) =>
            field.isActive &&
            !excludedNames.includes(field.name) &&
            objectMetadataItem.readableFields.some(
              (readable) => readable.id === field.id,
            ) &&
            objectPermissions.restrictedFields[field.id]?.canUpdate !== false &&
            (field.type !== FieldMetadataType.RELATION ||
              field.relation?.type === RelationType.MANY_TO_ONE) &&
            (field.type !== FieldMetadataType.MORPH_RELATION ||
              field.morphRelations?.[0]?.type === RelationType.MANY_TO_ONE),
        )
        .sort(
          (a, b) =>
            Number(b.id === objectMetadataItem.labelIdentifierFieldMetadataId) -
            Number(a.id === objectMetadataItem.labelIdentifierFieldMetadataId),
        ),
    };
  }

  return {
    recordFormFieldMetadataItems: computeRecordFormFieldMetadataItems({
      recordFormPageLayout,
      fieldMetadataItems: objectMetadataItem.fields,
      restrictedFields: objectPermissions.restrictedFields,
    }),
  };
};
