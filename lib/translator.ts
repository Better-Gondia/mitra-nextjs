"use client";

import { BotState } from "@/store/bot";
import trJson from "./translate-data.json";
import { Language, User } from "@/types";
import { getCategoryIcon } from "./clientUtils";

interface transaleData {
  complaintId: string;
}

export const translate = (
  key: keyof typeof trJson,
  language: Language,
  data?: transaleData
) => {
  // Validate language parameter
  if (!language || !["english", "hindi", "marathi"].includes(language)) {
    console.warn(`Invalid language "${language}", falling back to english`);
    language = "english";
  }

  // Check if the key exists in trJson
  if (!trJson[key]) {
    console.warn(`Translation key "${key}" not found in translation data`);
    return key; // Return the key itself as fallback
  }

  // Check if the language exists for this key
  if (!trJson[key][language]) {
    console.warn(`Language "${language}" not found for key "${key}"`);
    return trJson[key]["english"] || key;
  }

  let mess = trJson[key][language];

  if (key == "complaint_submitted_success") {
    mess = mess.split("complaintId").join(data?.complaintId);
  }
  return mess ?? trJson[key]["english"];
};

const previewData = {
  english: {
    title: "Complaint Preview",
    issue: "Issue",
    category: "Category",
    location: "Location",
    notSpecified: "Not specified",
    yourDetails: "Your Details",
    media: "Media",
    photo: "photo(s)",
    video: "video(s)",
    submitPrompt: "Would you like to submit this complaint?",
  },
  hindi: {
    title: "शिकायत पूर्वावलोकन",
    issue: "समस्या",
    category: "श्रेणी",
    location: "स्थान",
    notSpecified: "निर्दिष्ट नहीं",
    yourDetails: "आपका विवरण",
    media: "मीडिया",
    photo: "फ़ोटो",
    video: "वीडियो",
    submitPrompt: "क्या आप इस शिकायत को सबमिट करना चाहेंगे?",
  },
  marathi: {
    title: "तक्रारीचे पूर्वावलोकन",
    issue: "समस्या",
    category: "श्रेणी",
    location: "स्थान",
    notSpecified: "निर्दिष्ट नाही",
    yourDetails: "तुमची माहिती",
    media: "माध्यम",
    photo: "फोटो",
    video: "व्हिडिओ",
    submitPrompt: "तुम्ही ही तक्रार सबमिट करू इच्छिता का?",
  },
};
export function generateComplaintPreview(
  lang: Language = "english",
  botState: BotState,
  userData: User,
  imageCount: number = 0,
  videoCount: number = 0
) {
  const t = previewData[lang];

  const mediaInfo =
    imageCount > 0 || videoCount > 0
      ? `\n- ${t.media}: ${imageCount} ${t.photo}, ${videoCount} ${t.video}`
      : "";

  const preview = `**${t.title}:**
- ${t.issue}: ${botState.complaintData.description}
- ${t.category}: ${getCategoryIcon(
    botState.complaintData.category ?? ""
  )} ${translate(botState.complaintData.category as any, lang)}
- ${t.location}: ${botState.complaintData.location || t.notSpecified}
- ${t.yourDetails}: ${userData.name} • +91 ${userData.mobile}${mediaInfo}

${t.submitPrompt}
  `;

  return preview;
}
