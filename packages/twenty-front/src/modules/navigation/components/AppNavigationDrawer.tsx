import { styled } from '@linaria/react';
import { useIsSettingsDrawer } from '@/navigation/hooks/useIsSettingsDrawer';

import { MainNavigationDrawerContent } from '@/navigation/components/MainNavigationDrawerContent';
import { MainNavigationDrawerModeSwitcher } from '@/navigation/components/MainNavigationDrawerModeSwitcher';
import { NavigationDrawerModeTransition } from '@/navigation/components/NavigationDrawerModeTransition';
import { SettingsNavigationDrawerContent } from '@/navigation/components/SettingsNavigationDrawerContent';
import { NavigationDrawer } from '@/ui/navigation/navigation-drawer/components/NavigationDrawer';
import { NavigationDrawerFixedContent } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerFixedContent';
import { useIsMobile } from 'twenty-ui/utilities';

const StyledTools = styled.div`
  border-top: 1px solid var(--t-border-color-medium);
  padding-top: 12px;
  flex-shrink: 0;
`;

export type AppNavigationDrawerProps = {
  className?: string;
};

export const AppNavigationDrawer = ({
  className,
}: AppNavigationDrawerProps) => {
  const isMobile = useIsMobile();
  const isSettingsDrawer = useIsSettingsDrawer();

  // The main navigation is the home page on mobile, not a drawer.
  if (isMobile && !isSettingsDrawer) {
    return null;
  }

  return (
    <NavigationDrawer className={className}>
      {/* Mobile switches modes from the bottom navigation bar instead. */}
      {!isMobile && (
        <NavigationDrawerFixedContent>
          <MainNavigationDrawerModeSwitcher placement="primary" />
        </NavigationDrawerFixedContent>
      )}

      <NavigationDrawerModeTransition>
        {isSettingsDrawer ? (
          <SettingsNavigationDrawerContent />
        ) : (
          <MainNavigationDrawerContent />
        )}
      </NavigationDrawerModeTransition>
      {!isMobile && (
        <StyledTools>
          <NavigationDrawerFixedContent>
            <MainNavigationDrawerModeSwitcher placement="tools" />
          </NavigationDrawerFixedContent>
        </StyledTools>
      )}
    </NavigationDrawer>
  );
};
