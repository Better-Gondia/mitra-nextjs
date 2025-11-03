"use server";

import { messages } from "@/lib/clientUtils";
import { Language } from "@prisma/client";
import axios from "axios";
import { NextResponse } from "next/server";

export async function sendWhatsAppText(
  phoneNumber: string,
  message: string
): Promise<boolean> {
  try {
    const response = await axios.post(`${process.env.WHATSAPP_TEXT_URL}`, {
      customerMobileNo: phoneNumber,
      type: "text",
      message: message,
    });

    return response.status === 200;
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    return false;
  }
}

export async function sendTemplateMessage(
  phoneNumber: string,
  templateId: string
): Promise<boolean> {
  try {
    const response = await axios.post(`${process.env.WHATSAPP_TEMPLATE_URL}`, {
      mobileNo: phoneNumber,
      templateId,
    });

    return response.status === 200;
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    return false;
  }
}

export async function sendLanguageSpecificTemplate(
  mobileNo: string,
  templateName:
    | "COMP_TYPE"
    | "TALUKA"
    | "CONFIRMATION"
    | "SUGGEST_END"
    | "INVALID_INPUT",
  language: Language
): Promise<void> {
  try {
    const template = `${language}_${templateName}`;
    await sendTemplateMessage(
      mobileNo,
      (process.env[template as keyof typeof process.env] as string) || ""
    );
  } catch (error) {
    console.error("Error sending WhatsApp template message:", error);
  }
}

export const sendInvalidMessageTemplate = async (
  mobileNo: string,
  language: Language = "ENGLISH"
) => {
  await sendLanguageSpecificTemplate(mobileNo, "INVALID_INPUT", language);
  return NextResponse.json({
    success: true,
    message: "Invalid Input",
  });
};

export const sendByeMessage = async(mobileNo: string, userMessage: "Bye For Now 👋🏻" | "फिर मिलेंगे 👋🏻" | "आत्तासाठी निरोप 👋") => {
  const languageMap = {
    "Bye For Now 👋🏻": Language.ENGLISH,
    "फिर मिलेंगे 👋🏻": Language.HINDI,
    "आत्तासाठी निरोप 👋": Language.MARATHI,
  }
  await sendWhatsAppText(mobileNo, messages[languageMap[userMessage]].BYE_FOR_NOW);
}