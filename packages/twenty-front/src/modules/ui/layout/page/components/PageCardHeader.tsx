import { useColorScheme } from '@/ui/theme/hooks/useColorScheme';
import { useSystemColorScheme } from '@/ui/theme/hooks/useSystemColorScheme';
import { Button } from 'twenty-ui/primitives/input';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { Link } from 'react-router-dom';
import {
  IconHome,
  IconChevronRight,
  IconMoon,
  IconSun,
  IconHelp,
} from 'twenty-ui/icon';
import { t } from '@lingui/core/macro';
import { APP_HEADER_HEIGHT } from '@/ui/layout/constants/AppHeaderHeight';
import { useNavigationDrawerExpanded } from '@/navigation/hooks/useNavigationDrawerExpanded';
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import { useWorkspaceSurfaceHeaderPortal } from '@/ui/layout/hooks/useWorkspaceSurfaceHeaderPortal';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { type BreadcrumbProps } from '@/ui/navigation/bread-crumb/types/BreadcrumbProps';
import { PAGE_ACTION_CONTAINER_CLICK_OUTSIDE_ID } from '@/ui/layout/page/constants/PageActionContainerClickOutsideId';
import { NavigationDrawerCollapseButton } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerCollapseButton';
import { useIsMobile } from 'twenty-ui/utilities';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

type PageCardHeaderProps = {
  showPageHeading?: boolean | 'navigation';
  links?: BreadcrumbProps['links'];
  breadcrumb?: ReactNode;
  icon?: ReactNode;
  title?: ReactNode;
  tag?: ReactNode;
  actionButton?: ReactNode;
  centerTitle?: boolean;
  titleColor?: string;
};

const StyledHeader = styled.div<{ centerTitle?: boolean }>`
  align-items: center;
  background-color: ${themeCssVariables.background.secondary};
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  box-sizing: border-box;
  column-gap: ${themeCssVariables.spacing[2]};
  display: grid;
  grid-template-columns: ${({ centerTitle }) =>
    centerTitle
      ? 'minmax(0, 1fr) minmax(0, auto) minmax(0, 1fr)'
      : 'minmax(0, auto) minmax(min-content, 1fr)'};
  min-height: ${APP_HEADER_HEIGHT}px;
  padding: 0 ${themeCssVariables.spacing[4]};
  width: 100%;
`;

const StyledLeft = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  grid-column: 1;
  min-width: 0;
  overflow: hidden;
  width: 100%;
`;

const StyledTitle = styled.div<{ titleColor?: string }>`
  align-items: center;
  color: ${({ titleColor }) =>
    titleColor ?? themeCssVariables.font.color.primary};
  display: flex;
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
`;

const StyledCenteredTitle = styled(StyledTitle)`
  grid-column: 2;
  justify-content: center;
  justify-self: stretch;
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
`;

const StyledRight = styled.div<{ centerTitle?: boolean }>`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  grid-column: ${({ centerTitle }) => (centerTitle ? 3 : 2)};
  justify-content: flex-end;
  justify-self: end;
  width: 100%;
`;

const StyledSurfaceTitle = styled(StyledTitle)`
  overflow: hidden;
  width: 100%;
`;

const StyledSurfaceActions = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledPageHeading = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.secondary};
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: ${themeCssVariables.spacing[4]};
  padding: 24px ${themeCssVariables.spacing[8]} 10px;
  > div:first-child {
    font-size: 24px;
    font-weight: ${themeCssVariables.font.weight.semiBold};
    letter-spacing: -0.3px;
  }
`;

const StyledCrumb = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  min-width: 0;
  color: ${themeCssVariables.font.color.secondary};
  font-size: 14px;
  a {
    color: inherit;
    display: flex;
  }
`;

const StyledProfileLink = styled(Link)`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing[2]};
  font-size: 14px;
  text-decoration: none;
  span:first-child {
    align-items: center;
    background: ${themeCssVariables.background.transparent.blue};
    border: 1px solid ${themeCssVariables.border.color.medium};
    border-radius: 50%;
    color: ${themeCssVariables.color.blue11};
    display: flex;
    height: 36px;
    justify-content: center;
    width: 36px;
  }
`;

const StyledPageActions = styled(StyledSurfaceActions)`
  flex-shrink: 1;
  justify-content: flex-end;
  min-width: 0;
  width: 100%;
`;

export const PageCardHeader = ({
  showPageHeading = false,
  links,
  breadcrumb,
  icon,
  title,
  tag,
  actionButton,
  centerTitle = false,
  titleColor,
}: PageCardHeaderProps) => {
  const member = useAtomStateValue(currentWorkspaceMemberState);
  const { colorScheme, setColorScheme } = useColorScheme();
  const systemColorScheme = useSystemColorScheme();
  const isDark =
    (colorScheme === 'System' ? systemColorScheme : colorScheme) === 'Dark';
  const isMobile = useIsMobile();
  const isNavigationDrawerExpanded = useNavigationDrawerExpanded();
  const workspaceSurface = useWorkspaceSurface();
  const workspaceSurfaceHeaderPortal = useWorkspaceSurfaceHeaderPortal();

  const hasTitleContent = isDefined(icon) || isDefined(title) || isDefined(tag);
  const shouldCenterTitle = centerTitle && hasTitleContent;

  const titleContent = (
    <>
      {icon}
      {isDefined(title) && title}
      {tag}
    </>
  );

  const surfaceTitleContent = isDefined(breadcrumb) ? (
    breadcrumb
  ) : hasTitleContent ? (
    titleContent
  ) : isDefined(links) ? (
    <Breadcrumb links={links} />
  ) : null;

  if (workspaceSurface.type === 'side-panel') {
    return (
      <>
        {isDefined(workspaceSurfaceHeaderPortal.title) &&
          isDefined(surfaceTitleContent) &&
          createPortal(
            <StyledSurfaceTitle titleColor={titleColor}>
              {surfaceTitleContent}
            </StyledSurfaceTitle>,
            workspaceSurfaceHeaderPortal.title,
          )}
        {isDefined(workspaceSurfaceHeaderPortal.actions) &&
          isDefined(actionButton) &&
          createPortal(
            <StyledSurfaceActions
              data-click-outside-id={PAGE_ACTION_CONTAINER_CLICK_OUTSIDE_ID}
            >
              {actionButton}
            </StyledSurfaceActions>,
            workspaceSurfaceHeaderPortal.actions,
          )}
      </>
    );
  }

  if (showPageHeading && !isMobile && !centerTitle) {
    return (
      <>
        <StyledHeader>
          <StyledCrumb>
            <NavigationDrawerCollapseButton
              direction={isNavigationDrawerExpanded ? 'left' : 'right'}
            />
            <Link to="/home" aria-label={t`Home`}>
              <IconHome size={18} />
            </Link>
            <IconChevronRight size={14} />
            {title}
          </StyledCrumb>
          <StyledRight>
            <Button
              variant="ghost"
              size="sm"
              href="https://docs.twenty.com"
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<IconHelp size={18} />}
            >{t`Help`}</Button>
            <Button
              variant="ghost"
              size="sm"
              aria-label={
                isDark ? t`Switch to Light mode` : t`Switch to Dark mode`
              }
              onClick={() => void setColorScheme(isDark ? 'Light' : 'Dark')}
            >
              {isDark ? <IconSun size={18} /> : <IconMoon size={18} />}
            </Button>
            <StyledProfileLink to="/settings/profile" aria-label={t`Profile`}>
              <span>{member?.name?.firstName?.slice(0, 1) || 'T'}</span>
              <span>{member?.name?.firstName || t`Profile`}</span>
            </StyledProfileLink>
          </StyledRight>
        </StyledHeader>
        {showPageHeading !== 'navigation' && (
          <StyledPageHeading>
            <StyledTitle titleColor={titleColor}>{titleContent}</StyledTitle>
            <StyledPageActions
              data-click-outside-id={PAGE_ACTION_CONTAINER_CLICK_OUTSIDE_ID}
            >
              {actionButton}
            </StyledPageActions>
          </StyledPageHeading>
        )}
      </>
    );
  }

  return (
    <StyledHeader centerTitle={shouldCenterTitle}>
      <StyledLeft>
        {!isMobile && !isNavigationDrawerExpanded && (
          <NavigationDrawerCollapseButton direction="right" />
        )}
        {isDefined(breadcrumb)
          ? breadcrumb
          : isDefined(links) && <Breadcrumb links={links} />}
        {!shouldCenterTitle && hasTitleContent && (
          <StyledTitle titleColor={titleColor}>{titleContent}</StyledTitle>
        )}
      </StyledLeft>
      {shouldCenterTitle && (
        <StyledCenteredTitle titleColor={titleColor}>
          {titleContent}
        </StyledCenteredTitle>
      )}
      <StyledRight
        centerTitle={shouldCenterTitle}
        data-click-outside-id={PAGE_ACTION_CONTAINER_CLICK_OUTSIDE_ID}
      >
        {actionButton}
      </StyledRight>
    </StyledHeader>
  );
};
