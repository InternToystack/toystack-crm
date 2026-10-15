import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { navigationMenuItemsDraftState } from '@/navigation-menu-item/common/states/navigationMenuItemsDraftState';
import { filterWorkspaceNavigationMenuItems } from '@/navigation-menu-item/common/utils/filterWorkspaceNavigationMenuItems';
import { navigationMenuItemsSelector } from '@/navigation-menu-item/common/states/navigationMenuItemsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

import { isDefined } from 'twenty-shared/utils';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

type NavigationMenuItemsData = {
  navigationMenuItems: NavigationMenuItem[];
  workspaceNavigationMenuItems: NavigationMenuItem[];
  currentWorkspaceMemberId: string | undefined;
  currentUserWorkspaceId: string | undefined;
};

export const useNavigationMenuItemsData = (): NavigationMenuItemsData => {
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const currentWorkspaceMemberId = currentWorkspaceMember?.id;
  const navigationMenuItemsFromState = useAtomStateValue(
    navigationMenuItemsSelector,
  );
  // Remove this filter to restore the saved Workflows folder in navigation.
  const isVisibleNavigationMenuItem = (item: NavigationMenuItem) =>
    item.type !== NavigationMenuItemType.FOLDER ||
    !['workflow', 'workflows'].includes(item.name?.trim().toLowerCase() ?? '');
  const navigationMenuItems = navigationMenuItemsFromState.filter(
    isVisibleNavigationMenuItem,
  );
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );
  const navigationMenuItemsDraft = useAtomStateValue(
    navigationMenuItemsDraftState,
  );

  const userNavigationMenuItems = navigationMenuItems.filter((item) =>
    isDefined(item.userWorkspaceId),
  );

  const workspaceNavigationMenuItemsFromState =
    filterWorkspaceNavigationMenuItems(navigationMenuItems);

  const workspaceNavigationMenuItems =
    isLayoutCustomizationModeEnabled && isDefined(navigationMenuItemsDraft)
      ? navigationMenuItemsDraft.filter(isVisibleNavigationMenuItem)
      : workspaceNavigationMenuItemsFromState;

  return {
    navigationMenuItems: userNavigationMenuItems,
    workspaceNavigationMenuItems,
    currentWorkspaceMemberId,
    currentUserWorkspaceId:
      currentWorkspaceMember?.userWorkspaceId ?? undefined,
  };
};
