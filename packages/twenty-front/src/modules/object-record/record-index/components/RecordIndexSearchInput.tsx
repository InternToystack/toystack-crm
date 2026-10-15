import { anyFieldFilterValueComponentState } from '@/object-record/record-filter/states/anyFieldFilterValueComponentState';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { TextInput } from '@/ui/input/components/TextInput';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { IconSearch } from 'twenty-ui/icon';

const StyledSearch = styled.div`
  min-width: 180px;
  width: 280px;
  max-width: 100%;
  input {
    height: 40px;
    border-radius: 6px;
    font-size: 14px;
  }
`;

export const RecordIndexSearchInput = () => {
  const { t } = useLingui();
  const { objectMetadataItem } = useRecordIndexContextOrThrow();
  const [value, setValue] = useAtomComponentState(
    anyFieldFilterValueComponentState,
  );
  return (
    <StyledSearch>
      <TextInput
        fullWidth
        sizeVariant="lg"
        LeftIcon={IconSearch}
        aria-label={t`Search records`}
        placeholder={t`Search ${objectMetadataItem.labelPlural.toLowerCase()}...`}
        value={value}
        onChange={setValue}
      />
    </StyledSearch>
  );
};
