"use server";

import { Language } from "@/types";

const serverJSON = {
  complaint_submitted_success: {
    english:
      "✅ Complaint submitted successfully! Your complaint ID is complaintId. We'll keep you updated on the progress.",
    hindi:
      "✅ शिकायत सफलतापूर्वक दर्ज हो गई है! आपकी शिकायत ID complaintId है। हम आपको प्रगति की जानकारी देते रहेंगे।",
    marathi:
      "✅ तक्रार यशस्वीरित्या नोंदवली गेली आहे! तुमची तक्रार आयडी complaintId आहे. आम्ही तुम्हाला प्रगतीची माहिती देत राहू.",
  },
  complaint: {
    english: "Complaint",
    hindi: "शिकायत",
    marathi: "तक्रार",
  },
  suggestion: {
    english: "Suggestion",
    hindi: "सुझाव",
    marathi: "सूचना",
  },
};

interface transaleData {
  complaintId: string;
}

export const translateServer = async (
  key: keyof typeof serverJSON,
  language: Language,
  data?: transaleData
) => {
  let mess = serverJSON[key][language];

  if (key == "complaint_submitted_success") {
    mess = mess.split("complaintId").join(data?.complaintId);
  }
  return mess ?? serverJSON[key]["english"];
};
