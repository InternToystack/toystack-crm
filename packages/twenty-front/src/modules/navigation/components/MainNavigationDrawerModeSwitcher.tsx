import { useLocation } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { NAVIGATION_DRAWER_COLLAPSED_BUTTON_SIZE } from '@/ui/navigation/navigation-drawer/constants/NavigationDrawerCollapsedButtonSize';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { motion, useReducedMotion } from 'framer-motion';
import { Tooltip } from 'twenty-ui/primitives/surfaces';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';

import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { useActiveNavigationDrawerMode } from '@/navigation/hooks/useActiveNavigationDrawerMode';
import { useIsNavigationDrawerContentExpanded } from '@/navigation/hooks/useIsNavigationDrawerContentExpanded';
import { useNavigationDrawerModes } from '@/navigation/hooks/useNavigationDrawerModes';
import { useSwitchNavigationDrawerMode } from '@/navigation/hooks/useSwitchNavigationDrawerMode';
import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';
import { NAVIGATION_DRAWER_TABS } from '@/ui/navigation/states/navigationDrawerTabs';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsMobile } from 'twenty-ui/utilities';

// Expanded, the row matches the page card header so their borders read as one line.
const StyledSwitcher = styled.div<{ isExpanded: boolean }>`
  align-items: ${({ isExpanded }) => (isExpanded ? 'center' : 'flex-start')};
  border-bottom: none;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${({ isExpanded }) =>
    isExpanded
      ? themeCssVariables.spacing['0.5']
      : themeCssVariables.betweenSiblingsGap};
  height: ${({ isExpanded }) => 'auto'};
  min-width: 0;
`;

const StyledMode = styled.button<{ isActive: boolean; isExpanded: boolean }>`
  align-items: center;
  background: ${({ isActive }) =>
    isActive ? themeCssVariables.background.transparent.blue : 'transparent'};
  border: none;
  border-radius: ${({ isExpanded }) =>
    isExpanded
      ? themeCssVariables.border.radius.smRound
      : themeCssVariables.border.radius.mdRound};
  color: ${({ isActive }) =>
    isActive
      ? themeCssVariables.color.blue11
      : themeCssVariables.font.color.tertiary};
  corner-shape: round;
  cursor: pointer;
  display: flex;
  // Only the labelled mode may shrink: long translations otherwise push Settings off the drawer.
  flex-shrink: ${({ isActive, isExpanded }) =>
    isActive && isExpanded ? 1 : 0};
  font-family: inherit;
  font-size: 15px;
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${({ isActive, isExpanded }) =>
    isExpanded ? themeCssVariables.spacing[3] : '0'};
  height: ${({ isExpanded }) =>
    isExpanded
      ? themeCssVariables.spacing[11]
      : `${NAVIGATION_DRAWER_COLLAPSED_BUTTON_SIZE}px`};
  justify-content: ${({ isExpanded }) =>
    isExpanded ? 'flex-start' : 'center'};
  min-width: 0;
  padding: ${({ isExpanded }) =>
    isExpanded ? `0 ${themeCssVariables.spacing[3]}` : '0'};
  transition:
    background calc(${themeCssVariables.animation.duration.fast} * 1s) ease,
    color calc(${themeCssVariables.animation.duration.fast} * 1s) ease,
    gap calc(${themeCssVariables.animation.duration.normal} * 1s) ease;
  width: ${({ isExpanded }) =>
    isExpanded ? '100%' : `${NAVIGATION_DRAWER_COLLAPSED_BUTTON_SIZE}px`};

  &[aria-disabled='true'] {
    color: ${themeCssVariables.font.color.light};
    cursor: not-allowed;
  }

  &:hover:not([aria-disabled='true']) {
    background: ${({ isActive }) =>
      isActive
        ? themeCssVariables.background.transparent.blue
        : themeCssVariables.background.transparent.lighter};
    color: ${({ isActive }) =>
      isActive
        ? themeCssVariables.color.blue11
        : themeCssVariables.font.color.primary};
  }
`;

const StyledModeIcon = styled.span`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  height: ${themeCssVariables.spacing[4]};
  justify-content: center;
  width: ${themeCssVariables.spacing[4]};
`;

const StyledModeLabelBase = styled.span`
  display: block;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledModeLabel = motion.create(StyledModeLabelBase);

export const MainNavigationDrawerModeSwitcher = ({
  placement = 'all',
}: {
  placement?: 'all' | 'primary' | 'tools';
}) => {
  const { t } = useLingui();
  const { pathname } = useLocation();
  const theme = useTheme();

  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );
  const isMobile = useIsMobile();
  const isExpanded = useIsNavigationDrawerContentExpanded();
  const modes = useNavigationDrawerModes().filter(
    ({ mode }) =>
      placement === 'all' ||
      (placement === 'primary'
        ? mode === NAVIGATION_DRAWER_TABS.NAVIGATION_MENU
        : mode !== NAVIGATION_DRAWER_TABS.NAVIGATION_MENU),
  );
  const activeNavigationDrawerMode = useActiveNavigationDrawerMode();
  const { switchNavigationDrawerMode } = useSwitchNavigationDrawerMode();
  const shouldReduceMotion = useReducedMotion();

  if (modes.length === 0) {
    return null;
  }

  const shouldShowTooltips = !isExpanded && !isMobile;

  return (
    <StyledSwitcher
      isExpanded={isExpanded}
      role="group"
      aria-label={t`Navigation modes`}
    >
      {modes.map(({ Icon, label, mode }) => {
        const isActive =
          mode === activeNavigationDrawerMode &&
          (placement !== 'primary' || pathname === AppPath.Home);
        const isDisabled =
          mode !== NAVIGATION_DRAWER_TABS.NAVIGATION_MENU &&
          isLayoutCustomizationModeEnabled;

        return (
          <Tooltip
            key={mode}
            content={
              isDisabled
                ? mode === NAVIGATION_DRAWER_TABS.SETTINGS
                  ? t`Finish editing the layout to open Settings`
                  : t`Finish editing the layout to open AI`
                : label
            }
            disabled={!shouldShowTooltips && !isDisabled}
            delay={TooltipDelay.noDelay}
            side={isExpanded ? 'bottom' : 'right'}
            positionMethod="fixed"
          >
            <StyledMode
              type="button"
              isActive={isActive}
              isExpanded={isExpanded}
              aria-label={label}
              aria-current={isActive}
              aria-disabled={isDisabled}
              onClick={() => {
                if (isDisabled) {
                  return;
                }

                switchNavigationDrawerMode(mode);
              }}
            >
              <StyledModeIcon>
                <Icon size={theme.icon.size.md} />
              </StyledModeIcon>
              <StyledModeLabel
                initial={false}
                animate={{ width: isExpanded ? 'auto' : 0 }}
                transition={{
                  duration: shouldReduceMotion
                    ? 0
                    : theme.animation.duration.normal,
                  ease: 'easeInOut',
                }}
              >
                {placement === 'primary' ? t`Dashboard` : label}
              </StyledModeLabel>
            </StyledMode>
          </Tooltip>
        );
      })}
    </StyledSwitcher>
  );
};
