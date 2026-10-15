import { CoreObjectNameSingular, FeatureFlagKey } from 'twenty-shared/types';

import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';

export const useNavigationObjectMetadataItems = () => {
  // Remove this filter to restore the workflow modules in navigation.
  const hiddenWorkflowObjects: string[] = [
    CoreObjectNameSingular.Workflow,
    CoreObjectNameSingular.WorkflowRun,
    CoreObjectNameSingular.WorkflowVersion,
  ];
  const objectMetadataItems = useAtomStateValue(
    objectMetadataItemsSelector,
  ).filter((item) => !hiddenWorkflowObjects.includes(item.nameSingular));
  const isWorkflowCoreIndexPageEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_WORKFLOW_CORE_INDEX_PAGE_ENABLED,
  );

  if (!isWorkflowCoreIndexPageEnabled) {
    return objectMetadataItems;
  }

  return objectMetadataItems.filter(
    (objectMetadataItem) =>
      objectMetadataItem.nameSingular !==
      CoreObjectNameSingular.WorkflowVersion,
  );
};
