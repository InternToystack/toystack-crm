import { SidePanelRecordCreationFormPage } from '@/side-panel/pages/record-creation-form/components/SidePanelRecordCreationFormPage';
import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { DialogInstance } from '@/ui/layout/dialog/components/DialogInstance';
import { Dialog } from 'twenty-ui/primitives/surfaces';

export const RecordCreationFormModal = ({
  requestId,
  isSubmitting,
  onCancel,
}: {
  requestId: string;
  isSubmitting: boolean;
  onCancel: () => void;
}) => (
  <DialogInstance
    dialogId={requestId}
    dismissible={!isSubmitting}
    onClose={onCancel}
    renderInDocumentBody
  >
    {(popupProps) => (
      <Dialog.Popup
        {...popupProps}
        size="lg"
        data-globally-prevent-click-outside
        style={{
          width: 'min(720px, calc(100vw - 32px))',
          maxHeight: 'calc(100dvh - 64px)',
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <SidePanelPageComponentInstanceContext.Provider
          value={{ instanceId: requestId }}
        >
          <SidePanelRecordCreationFormPage isModal onCancel={onCancel} />
        </SidePanelPageComponentInstanceContext.Provider>
      </Dialog.Popup>
    )}
  </DialogInstance>
);
