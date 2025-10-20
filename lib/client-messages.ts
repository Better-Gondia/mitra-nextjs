"use client";

import { Language } from "@/types";
import { translate } from "./translator";

export const clientMessages = (key: string, language: Language) => {
  switch (key) {
    case "USER_NOT_FOUND":
      return translate("session_expired", language);
    case "SERVER_ERROR":
      return translate("something_went_wrong", language);
  }
};
