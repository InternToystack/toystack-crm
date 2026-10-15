import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useRelevantRecordsGqlFields } from '@/object-record/record-field/hooks/useRelevantRecordsGqlFields';
import { useFindManyRecordIndexTableParams } from '@/object-record/record-index/hooks/useFindManyRecordIndexTableParams';

export const useRecordIndexTableQuery = (
  objectNameSingular: string,
  additionalFieldMetadataIds: string[] = [],
) => {
  const params = useFindManyRecordIndexTableParams(objectNameSingular);

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const recordGqlFields = useRelevantRecordsGqlFields({
    objectMetadataItem,
    additionalFieldMetadataIds,
  });

  const {
    records,
    hasNextPage,
    queryIdentifier,
    loading,
    error,
    totalCount,
    fetchMoreRecords,
    refetch,
  } = useFindManyRecords({
    ...params,
    recordGqlFields,
  });

  return {
    records,
    loading,
    error,
    hasNextPage,
    queryIdentifier,
    totalCount,
    fetchMoreRecords,
    refetch,
  };
};
