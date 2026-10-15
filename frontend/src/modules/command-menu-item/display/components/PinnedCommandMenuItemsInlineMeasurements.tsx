import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { PINNED_COMMAND_MENU_ITEMS_GAP } from '@/command-menu-item/display/constants/PinnedCommandMenuItemsGap';
import { interpolateCommandMenuItemFields } from '@/command-menu-item/display/utils/interpolateCommandMenuItemFields';
import { CommandMenuButton } from '@/command-menu/components/CommandMenuButton';
import { NodeDimension } from '@/ui/utilities/dimensions/components/NodeDimension';
import { COMMAND_MENU_DEFAULT_ICON } from '@/workflow/workflow-trigger/constants/CommandMenuDefaultIcon';
import { styled } from '@linaria/react';
import { useContext } from 'react';
import { useIcons } from 'twenty-ui/icon';
import {
  EngineComponentKey,
  type CommandMenuItemFieldsFragment,
} from '~/generated-metadata/graphql';

type ElementDimensions = {
  width: number;
  height: number;
};

type PinnedCommandMenuItemsInlineMeasurementsProps = {
  pinnedCommandMenuItems: CommandMenuItemFieldsFragment[];
  shouldHideCommandMenuItemLabel: (commandMenuItemId: string) => boolean;
  onPinnedCommandMenuItemDimensionChange: (
    commandMenuItemKey: string,
  ) => (dimensions: ElementDimensions) => void;
};

const StyledHiddenMeasurementsContainer = styled.div`
  display: flex;
  gap: ${PINNED_COMMAND_MENU_ITEMS_GAP}px;
  pointer-events: none;
  position: absolute;
  top: -9999px;
  visibility: hidden;
`;

export const PinnedCommandMenuItemsInlineMeasurements = ({
  pinnedCommandMenuItems,
  shouldHideCommandMenuItemLabel,
  onPinnedCommandMenuItemDimensionChange,
}: PinnedCommandMenuItemsInlineMeasurementsProps) => {
  const { getIcon } = useIcons();
  const { commandMenuContextApi } = useContext(CommandMenuContext);

  return (
    <StyledHiddenMeasurementsContainer>
      {pinnedCommandMenuItems.map((item) => {
        const { iconKey, label, shortLabel } = interpolateCommandMenuItemFields(
          item,
          commandMenuContextApi,
        );

        const Icon = getIcon(iconKey, COMMAND_MENU_DEFAULT_ICON);

        return (
          <NodeDimension
            key={item.id}
            onDimensionChange={onPinnedCommandMenuItemDimensionChange(item.id)}
          >
            <CommandMenuButton
              command={{
                key: `${item.id}-inline-measurement`,
                label,
                shortLabel,
                Icon,
              }}
              isPrimaryAction={
                item.engineComponentKey ===
                  EngineComponentKey.CREATE_NEW_RECORD ||
                item.engineComponentKey ===
                  EngineComponentKey.COMPOSE_CAMPAIGN ||
                item.engineComponentKey ===
                  EngineComponentKey.SEND_MESSAGE_CAMPAIGN ||
                item.engineComponentKey === EngineComponentKey.NEW_AI_CHAT
              }
              shouldHideLabel={shouldHideCommandMenuItemLabel(item.id)}
            />
          </NodeDimension>
        );
      })}
    </StyledHiddenMeasurementsContainer>
  );
};
