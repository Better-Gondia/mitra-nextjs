import { create } from "zustand";

export type ModalType =
  | "Reload"
  | "FAQ"
  | "Report"
  | "GoToHome"
  | "ReportBug"
  | "Social"
  | "MobileLookup";

interface ModalData {
  confirmationFunction?: (...args: string[]) => void;
  complaintId?: string;
}

export type ModalStore = {
  isOpen: boolean;
  modalType?: ModalType;
  data?: ModalData;
  setIsOpen: (val: boolean, type?: ModalType, data?: ModalData) => void;
};

export const useModal = create<ModalStore>()((set) => ({
  isOpen: false,
  setIsOpen: (val: boolean, type?: ModalType, data?: ModalData) =>
    set({ isOpen: val, modalType: type, data }),
}));

useModal.subscribe((state) => {
  console.log("Auth Step state updated:", state);
});
