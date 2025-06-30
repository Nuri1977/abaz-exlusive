"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ModalWrapperProps {
  openModal: boolean;
  setOpenModal: (open: boolean) => void;
  titleText: string;
  buttonTest: string;
  onButtonClick: () => void;
  children: React.ReactNode;
}

const ModalWrapper: React.FC<ModalWrapperProps> = ({
  openModal,
  setOpenModal,
  titleText,
  buttonTest,
  onButtonClick,
  children,
}) => {
  return (
    <Dialog open={openModal} onOpenChange={setOpenModal}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{titleText}</DialogTitle>
        </DialogHeader>
        {children}
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onButtonClick}>
            {buttonTest}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModalWrapper;
