"use client";

import React, { useState, useEffect } from "react";
import LanguageSelection from "@/components/language-selection";
import LoginScreen from "@/components/auth/login-screen";
import OTPScreen from "@/components/auth/otp-screen";
import ProfileScreen from "@/components/auth/profile-screen";
import CommunitySection from "@/components/community-section";
import StatusSection from "@/components/status-section";
import { AuthStep, Language, Section, User } from "@/types";
import { initUserData } from "@/lib/data";
import { useLanguage } from "@/store/language";
import { useTheme } from "next-themes";
import { AllChats } from "@/components/my-complaints";
import { BottomNavigation } from "@/components/bottom-navigation";
import { TopHeader } from "@/components/TopHeader";
import { useUserData } from "@/store/userData";
import { useAuthStep } from "@/store/authStep";
import { useBot } from "@/store/bot";
import { setCookie } from "cookies-next/client";
import { useSections } from "@/store/section";
import { useSearchParams } from "next/navigation";
import { useModal } from "@/store/modal";
import { GenericModal } from "./modal/GenericModal";
import { extractAndStoreUserSlug } from "@/lib/slug-utils";

export default function HomeComp() {
  const { authStep, setAuthStep } = useAuthStep();
  const { section, setSection } = useSections();
  const searchParams = useSearchParams();
  const user = searchParams.get("user");
  const setIsOpen = useModal((state) => state.setIsOpen);
  // const [hasUserOpened, setHasUserOpened] = useState<boolean>(false);
  const [pendingMobile, setPendingMobile] = useState<string>("");
  const setLanguage = useLanguage((state) => state.setLanguage);
  const setBotState = useBot((state) => state.setBotState);
  const { setTheme } = useTheme();

  const handleLanguageSelect = (language: Language) => {
    setAuthStep("complete");
    localStorage.setItem("authStep", "complete");

    setLanguage(language);
    localStorage.setItem("language", language);
  };
  // if (authStep === "language") {
  //   return <LanguageSelection onLanguageSelect={handleLanguageSelect} />;
  // }

  const handleAuthStepChange = (step: AuthStep, mobile?: string) => {
    // setAuthStep(step);
    // const updatedUserData: User = {
    //   ...userData,
    //   authStep: step,
    // };
    // setUserData(updatedUserData);
    setAuthStep(step);
    if (mobile) {
      setPendingMobile(mobile);
    }
  };

  const handleSectionChange = (section: Section) => {
    setSection(section);
    // setHasUserOpened(true);
  };

  // Extract and store user slug from URL parameters
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      extractAndStoreUserSlug(searchParams);
    }
  }, [searchParams]);

  // Check if user parameter is missing and show mobile lookup modal
  React.useEffect(() => {
    if (!user && typeof window !== "undefined") {
      // Only show modal if we're on the root path without user parameter
      const currentPath = window.location.pathname;
      if (currentPath === "/") {
        setIsOpen(true, "MobileLookup");
      }
    }
  }, [user, setIsOpen]);

  if (authStep === "login") {
    return (
      <LoginScreen onNext={(mobile) => handleAuthStepChange("otp", mobile)} />
    );
  }

  if (authStep === "otp") {
    return (
      <OTPScreen
        mobile={pendingMobile}
        onNext={(isNewUser) =>
          handleAuthStepChange(isNewUser ? "profile" : "complete")
        }
        onBack={() => handleAuthStepChange("login")}
      />
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-[#E5DDD5] z-20">
      <TopHeader />

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {section === "my-issues" && (
          <AllChats user={user} handleSectionChange={handleSectionChange} />
        )}

        {section === "community" && (
          <CommunitySection
            user={user}
            handleSectionChange={handleSectionChange}
          />
        )}
        {section === "status" && <StatusSection />}
      </div>

      <BottomNavigation
        currentSection={section}
        handleSectionChange={handleSectionChange}
      />

      {/* Generic Modal for mobile lookup */}
      <GenericModal />
    </div>
  );
}

export const Home = React.memo(HomeComp, () => {
  return true;
});
