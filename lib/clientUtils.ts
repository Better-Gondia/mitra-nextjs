import { ChatMessage, Language } from "@/types";
import { Role } from "@prisma/client/index-browser";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ComplaintType, Language as PrismaLanguage } from "@prisma/client";
import { translateServer } from "./server-utils";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateComplaintIdFromDate(
  complaintId: number,
  createdAt: string | Date = new Date()
): string {
  const date = new Date(createdAt); // Works with ISO string or Date object

  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
  const yy = String(date.getFullYear()).slice(-2);

  const paddedId = String(complaintId).padStart(4, "0");

  return `BG-${dd}${mm}${yy}-${paddedId}`;
}

export function formatCreatedAtLabel(createdAt: string | Date): string {
  const date = new Date(createdAt);

  const options: Intl.DateTimeFormatOptions = {
    month: "short", // e.g., "Jul"
    day: "numeric", // e.g., "7"
    year: "numeric", // e.g., "2025"
  };

  const formattedDate = date.toLocaleDateString("en-US", options);
  return `🕒 ${formattedDate}`;
}

export const formatTimeAgo = (dateString: string) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInHours = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  );

  if (diffInHours < 1) return "Just now";
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  const days = Math.floor(diffInHours / 24);
  return `${days} ${days === 1 ? "day" : "days"} ago`;
};

export const getBotMessage = (content: string): ChatMessage => {
  return {
    id: Date.now(),
    content,
    messageType: "bot",
    isRead: false,
    createdAt: new Date().toISOString(),
  };
};

export const getCategoryIcon = (
  category: "roads" | "water" | "electricity" | "sanitation" | string
) => {
  const icons: Record<string, string> = {
    roads: "🛣️",
    water: "💧",
    electricity: "⚡",
    sanitation: "🗑️",
  };
  return icons[category] || "📝";
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "in_progress":
      return "bg-blue-100 text-blue-800";
    case "resolved":
      return "bg-green-100 text-green-800";
    case "closed":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const isAdmin = (role?: Role): boolean => {
  return role == "ADMIN" || role == "SUPERADMIN";
};

export const resetApp = () => {
  localStorage.removeItem("language");
  localStorage.removeItem("authStep");
  localStorage.removeItem("userData");
  window.location.reload();
};

export function normalizeDigits(str: string) {
  return str.replace(/[०-९]/g, (d) => String(d.charCodeAt(0) - 0x0966));
}

export function getRandom10DigitNumber() {
  let digits = "0123456789".split("");

  for (let i = digits.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [digits[i], digits[j]] = [digits[j], digits[i]];
  }

  if (digits[0] === "0") {
    for (let i = 1; i < digits.length; i++) {
      if (digits[i] !== "0") {
        [digits[0], digits[i]] = [digits[i], digits[0]];
        break;
      }
    }
  }

  return digits.slice(0, 10).join("");
}

export function getUserLoggedUrlMessage(
  language: PrismaLanguage,
  userSlug: string
): string {
  const messages = {
    [PrismaLanguage.ENGLISH]: `Please visit our website to track your complaint status. Thank you for trusting Better Gondia Mitra 🙏 \n \n👉 https://mitra.bettergondia.org?user=${userSlug}`,
    [PrismaLanguage.HINDI]: `अपनी शिकायत की स्थिति ट्रैक करने के लिए कृपया हमारी वेबसाइट पर जाएं। बैटर गोंदिया मित्र पर भरोसा करने के लिए धन्यवाद 🙏 \n \n👉 https://mitra.bettergondia.org?user=${userSlug}`,
    [PrismaLanguage.MARATHI]: `तुमच्या तक्रारीची स्थिती ट्रॅक करण्यासाठी कृपया आमच्या वेबसाइटला भेट द्या. बैटर गोंदिया मित्रावर विश्वास ठेवल्याबद्दल धन्यवाद 🙏 \n \n👉 https://mitra.bettergondia.org?user=${userSlug}`,
  };

  return messages[language] || messages[PrismaLanguage.ENGLISH];
}

export async function getWhatsappConfirmationMessage(
  language: PrismaLanguage,
  customerName: string,
  complaintType: ComplaintType,
  formattedComplaintId: string,
  taluka: string | null,
  description: string | null,
  location: string | null,
  mobileNo: string
): Promise<string> {
  const isSuggestion = complaintType === ComplaintType.SUGGESTION;
  const typeText = isSuggestion ? "suggestion" : "complaint";
  const typeEmoji = isSuggestion ? "💡" : "⚠️";
  const typeLabel = await translateServer(
    typeText,
    language.toLowerCase() as Language
  );

  const messages = {
    [PrismaLanguage.ENGLISH]: `✅ *${typeLabel} Successfully Submitted!*

Dear ${customerName},
Your ${typeText} has been successfully submitted to the Better Gondia Mitra.

📋 *${typeLabel} Details:*
• ${typeLabel} ID: *${formattedComplaintId}*
• Type: ${typeEmoji} ${typeLabel}
• Taluka: ${taluka || "Not specified"}
• Status: 🟢 Open (Under Review)

📝 *Description:*
${description || "No description provided"}

📍 *Location:* ${location || "Not specified"}

⏰ *Submission Time:* ${new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })}

📞 *Your Contact:* ${mobileNo}

💡 *Keep this ${typeLabel} ID safe for future reference!*

Thank you for taking the time to help improve Gondia! Your feedback is valuable to us. 🙏

*Better Gondia Mitra*`,

    [PrismaLanguage.HINDI]: `✅ *${typeLabel} सफलतापूर्वक जमा किया गया!*

प्रिय ${customerName},
आपकी ${typeLabel} बैटर गोंदिया मित्र को सफलतापूर्वक जमा की गई है।

📋 *${typeLabel} विवरण:*
• ${typeLabel} ID: *${formattedComplaintId}*
• प्रकार: ${typeEmoji} ${typeLabel}
• तालुका: ${taluka || "निर्दिष्ट नहीं"}
• स्थिति: 🟢 खुला (समीक्षा के तहत)

📝 *विवरण:*
${description || "कोई विवरण प्रदान नहीं किया गया"}

📍 *स्थान:* ${location || "निर्दिष्ट नहीं"}

⏰ *जमा करने का समय:* ${new Date().toLocaleString("hi-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })}

📞 *आपका संपर्क:* ${mobileNo}

💡 *भविष्य के संदर्भ के लिए इस ${typeLabel} ID को सुरक्षित रखें!*

गोंदिया को बेहतर बनाने में मदद करने के लिए समय निकालने के लिए धन्यवाद! आपकी प्रतिक्रिया हमारे लिए मूल्यवान है। 🙏

*बैटर गोंदिया मित्र*`,

    [PrismaLanguage.MARATHI]: `✅ *${typeLabel} यशस्वीरित्या नोंदणी केले!*

प्रिय ${customerName},
तुमची ${typeLabel} बैटर गोंदिया मित्राकडे यशस्वीरित्या नोंदणी केली गेली आहे.

📋 *${typeLabel} तपशील:*
• ${typeLabel} ID: *${formattedComplaintId}*
• प्रकार: ${typeEmoji} ${typeLabel}
• तालुका: ${taluka || "निर्दिष्ट नाही"}
• स्थिती: 🟢 उघडे (पुनरावलोकनाखाली)

📝 *वर्णन:*
${description || "कोणतेही वर्णन प्रदान केले नाही"}

📍 *स्थान:* ${location || "निर्दिष्ट नाही"}

⏰ *नोंदणी वेळ:* ${new Date().toLocaleString("mr-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })}

📞 *तुमचा संपर्क:* ${mobileNo}

💡 *भविष्यातील संदर्भासाठी ही ${typeLabel} ID सुरक्षित ठेवा!*

गोंदिया सुधारण्यात मदत करण्यासाठी वेळ काढल्याबद्दल धन्यवाद! तुमचा अभिप्राय आमच्यासाठी मौल्यवान आहे। 🙏

*बैटर गोंदिया मित्र*`,
  };

  return messages[language] || messages[PrismaLanguage.ENGLISH];
}

export function getShortConfirmationMessage(
  language: PrismaLanguage,
  customerName: string,
  formattedComplaintId: string
): string {
  const messages = {
    [PrismaLanguage.ENGLISH]: `Hello ${customerName}! 👋

Your complaint has been received.

📋 Complaint ID: *${formattedComplaintId}*
📅 Date: ${new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "long",
      day: "numeric",
    })}`,

    [PrismaLanguage.HINDI]: `नमस्ते ${customerName}! 👋

आपकी शिकायत प्राप्त हो गई है।

📋 शिकायत ID: *${formattedComplaintId}*
📅 तारीख: ${new Date().toLocaleString("hi-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "long",
      day: "numeric",
    })}`,

    [PrismaLanguage.MARATHI]: `नमस्कार ${customerName}! 👋

तुमची तक्रार प्राप्त झाली आहे.

📋 तक्रार ID: *${formattedComplaintId}*
📅 तारीख: ${new Date().toLocaleString("mr-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "long",
      day: "numeric",
    })}`,
  };

  return messages[language] || messages[PrismaLanguage.ENGLISH];
}

export const messages = {
  ENGLISH: {
    COMPLAINT_DESCRIPTION:
      "*COMPLAINT DETAILS* ✍🏻 \n\nYour input makes an impact! 💡\n\nPlease type details of your complaint below in *simple, clear words.*\n\n*One complaint* per message helps us act faster ✅",
    MEDIA_UPLOAD:
      "*PHOTO-VIDEO* 📸\n\nGot visuals of the problem?\n\nSend *photos or a short video* of the problem for faster action or simply type 'skip'.",
    LOCATION:
      "*LOCATION*📍\n\nPlease share or write the *exact location details* of the issue or simply type 'skip'.\n\nEg. Near ABC Building, XYZ Road, QRS Colony. Landmark: TUV Building_",
    CANCEL:
      "No worries! 🙏🏻\n\nJust type *Hello* to start over anytime after five minutes.\n\nBye! 👋🏻\n\nSee you again later!☺️",
    SUGGESTION_DESCRIPTION:
      "Got an idea?💡\n\n✍🏻 Share your suggestions/ideas in simple and clear words.\n\nAttach images/videos 📎 and location 📍 if relevant.",
    SUGGESTION_CONFIRMATION:
      "Your suggestion has been submitted successfully! 🎯\n\nWe’ll review it and get in touch with you if needed. 🙏🏻",
    BYE_FOR_NOW:
      "👋 Bye for now!\nYou can just say “Hello” anytime you want to share another complaint or suggestion. 😊",
  },
  HINDI: {
    COMPLAINT_DESCRIPTION:
      "*शिकायत विवरण* ✍🏻\n\nकृपया अपनी शिकायत साफ़ और आसान शब्दों में लिखें।\n\nएक संदेश में *एक ही शिकायत लिखें* ताकि हम जल्दी कार्यवाही कर सकें। 🙏🏻",
    MEDIA_UPLOAD:
      "*फोटो–वीडियो* 📸\n\nक्या आपके पास समस्या की तस्वीर या वीडियो है?\n\nजल्द कार्रवाई के लिए *फोटो या छोटा वीडियो* भेजें — या 'skip' लिखें।",
    LOCATION:
      "*स्थान* 📍\n\nकृपया समस्या का *सटीक स्थान* साझा करें या लिखें — या 'skip' लिखें।\n\nउदाहरण: ABC बिल्डिंग के पास, XYZ रोड, QRS कॉलोनी। लैंडमार्क: TUV बिल्डिंग_",
    CANCEL:
      "*कोई बात नहीं!* 🙂\n\nदोबारा शुरू करने के लिए *पाँच मिनट* बाद कभी भी 'Hello' लिखें।\n\nफिर मिलेंगे! 😊",
    SUGGESTION_DESCRIPTION:
      "*कोई सुझाव या विचार है?* 💡\n\n✍🏻 अपने सुझाव या विचार आसान और स्पष्ट शब्दों में लिखें।\n\n रूरत हो तो फोटो/वीडियो 📸 और स्थान 📍 भी जोड़ें।",
    SUGGESTION_CONFIRMATION:
      "*धन्यवाद!* 🎉\n\nआपका सुझाव सफलतापूर्वक प्राप्त हुआ! 🎯\n\nहम इसकी समीक्षा करेंगे और आवश्यकता होने पर आपसे संपर्क करेंगे। 🙏🏻\n\nफिर मिलेंगे! 😊",
    BYE_FOR_NOW:
      "👋 फिलहाल के लिए अलविदा!\nजब भी आप कोई और शिकायत या सुझाव भेजना चाहें, बस “Hello” लिख दीजिए। 😊",
  },
  MARATHI: {
    COMPLAINT_DESCRIPTION:
      "*तक्रार तपशील* ✍🏻\n\nकृपया तुमची तक्रार स्पष्ट आणि सोप्या शब्दांत लिहा.\n\nएका संदेशात *एकच तक्रार लिहा*, त्यामुळे आम्ही लवकर कारवाई करू शकतो. 🙏🏻",
    MEDIA_UPLOAD:
      "*फोटो-व्हिडिओ* 📸 \n\nसमस्येचा फोटो किंवा व्हिडिओ आहे का?\n\nजलद कारवाईसाठी *फोटो किंवा छोटा व्हिडिओ* पाठवा — किंवा 'skip' लिहा.",
    LOCATION:
      "*ठिकाण* 📍\n\nकृपया समस्येचे *अचूक ठिकाण* शेअर करा किंवा लिहा — किंवा 'skip' लिहा.\n\nउदा.: ABC बिल्डिंगजवळ, XYZ रोड, QRS कॉलनी. लँडमार्क: TUV बिल्डिंग_",
    CANCEL:
      "*काही हरकत नाही!* 🙂\n\nपुन्हा सुरू करण्यासाठी *पाच मिनिटांनंतर* कधीही 'Hello' टाइप करा.\n\nपुन्हा भेटूया! 😊",
    SUGGESTION_DESCRIPTION:
      "*काही सूचना किंवा कल्पना आहे का? *💡\n\n ✍🏻 तुमच्या सूचना किंवा कल्पना सोप्या आणि स्पष्ट शब्दांत लिहा.\n\nगरज असल्यास फोटो/व्हिडिओ 📸 आणि ठिकाण 📍 जोडा.",
    SUGGESTION_CONFIRMATION:
      "*धन्यवाद!* 🎉\n\nतुमची सूचना यशस्वीरित्या प्राप्त झाली! 🎯\n\nआम्ही तिची तपासणी करू आणि गरज असल्यास तुमच्याशी संपर्क करू. 🙏🏻\n\nपुन्हा भेटूया! 😊",
    BYE_FOR_NOW:
      "👋 आत्तासाठी निरोप!\nजेव्हा कधी तुम्हाला नवी तक्रार किंवा सूचना द्यायची असेल, तेव्हा फक्त “Hello” लिहा. 😊",
  },
};

export const isValidMessage = (message: string | null): boolean => {
  if (!message) return false;
  if (
    message.trim().length <= 5 &&
    message.trim().toLowerCase().includes("null")
  ) {
    return false;
  }
  return true;
};
