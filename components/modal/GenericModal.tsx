import { Dialog } from "@/components/ui/dialog";

import { ModalType, useModal } from "@/store/modal";
import { AlertModal } from "./AlertModal";
import { FAQ } from "./FAQ";
import { Report } from "./Report";
import { LogIn, RefreshCcw, Route } from "lucide-react";
import { resetApp } from "@/lib/clientUtils";
import { useRouter } from "nextjs-toploader/app";
import { ReportBug } from "./ReportBug";
import { Social } from "./Social";
import { ProfileModal } from "./ProfileModal";
import { MobileLookupModal } from "./MobileLookupModal";

export function GenericModal() {
  const { isOpen, setIsOpen, modalType } = useModal();
  const router = useRouter();
  const getModalFromType = (type: ModalType) => {
    switch (type) {
      case "Reload":
        return (
          <AlertModal
            title="Your Session has expired."
            description={
              <>
                To proceed, reload the aplication and <br /> log in again to
                continue.
              </>
            }
            btn={
              <>
                <RefreshCcw /> Reload
              </>
            }
            onClick={resetApp}
          />
        );
      case "FAQ":
        return <FAQ />;
      case "Report":
        return <Report />;
      case "GoToHome":
        return (
          <AlertModal
            title={"Please Log in to continue."}
            description={
              <>
                For interacting with this Complaint, <br /> You need to log in
                to Better Gondia Mitra
              </>
            }
            btn={
              <>
                <LogIn /> Log In
              </>
            }
            onClick={() => {
              setIsOpen(false);
              router.push("/");
            }}
          />
        );
      case "ReportBug":
        return <ReportBug />;
      case "Social":
        return <ProfileModal onClose={() => setIsOpen(false)} />;
      case "MobileLookup":
        return (
          <MobileLookupModal
            onClose={() => setIsOpen(false)}
            onUserFound={(slug) => {
              setIsOpen(false);
              router.push(`/?user=${slug}`);
            }}
            onUserNotFound={() => {
              setIsOpen(false);
              router.push("/user-not-found");
            }}
          />
        );
    }
  };
  const comp = getModalFromType(modalType ?? "Reload");
  return (
    <Dialog open={isOpen} modal onOpenChange={setIsOpen}>
      {comp}
    </Dialog>
  );
}
