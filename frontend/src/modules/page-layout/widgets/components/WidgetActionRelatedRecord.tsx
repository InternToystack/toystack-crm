import { type RelatedRecordActionBinding } from '@/activities/types/RelatedRecordAction';
import { WidgetCardHeaderActionButton } from '@/page-layout/widgets/widget-card/components/WidgetCardHeaderActionButton';
import { Button } from 'twenty-ui/primitives/input';
import { IconPlus } from 'twenty-ui/icon';

type WidgetActionRelatedRecordProps = {
  binding: RelatedRecordActionBinding;
  showLabel?: boolean;
};

export const WidgetActionRelatedRecord = ({
  binding,
  showLabel = false,
}: WidgetActionRelatedRecordProps) => {
  const { action, supportElement } = binding;

  if (!action.isVisible) {
    return null;
  }

  return (
    <>
      {supportElement}
      {showLabel ? (
        <Button
          size="sm"
          variant="ghost"
          startIcon={<IconPlus />}
          title={action.disabledReason ?? action.label}
          onClick={action.execute}
          disabled={action.disabled}
        >
          {action.label}
        </Button>
      ) : (
        <WidgetCardHeaderActionButton
          Icon={IconPlus}
          label={action.disabledReason ?? action.label}
          onClick={action.execute}
          disabled={action.disabled}
        />
      )}
    </>
  );
};
