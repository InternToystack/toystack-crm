import { renderHook } from '@testing-library/react';
import { useRecordFormFieldMetadataItems } from '@/object-record/record-form/hooks/useRecordFormFieldMetadataItems';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

jest.mock('@/object-record/hooks/useObjectPermissionsForObject');
jest.mock('@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue', () => ({useAtomFamilySelectorValue: () => null}));
it('builds a form from editable readable fields when no form layout exists', () => {
  const item = getMockObjectMetadataItemOrThrow('company');
  const name = item.fields.find((field) => field.name === 'name')!;
  const domain = item.fields.find((field) => field.name === 'domainName')!;
  jest.mocked(useObjectPermissionsForObject).mockReturnValue({restrictedFields: {[domain.id]: {canUpdate: false}}} as ReturnType<typeof useObjectPermissionsForObject>);
  const {result} = renderHook(() => useRecordFormFieldMetadataItems({objectMetadataItem: {...item, updatableFields: item.fields, readableFields: item.fields}}));
  expect(result.current.recordFormFieldMetadataItems[0].id).toBe(name.id);
  expect(result.current.recordFormFieldMetadataItems.some((field) => field.id === domain.id)).toBe(false);
  expect(result.current.recordFormFieldMetadataItems.some((field) => ['id', 'createdAt', 'createdBy'].includes(field.name))).toBe(false);
});
