"use server";

// Helper function to send WhatsApp confirmation message
export async function sendWhatsAppConfirmation(
  mobileNo: string,
  message: string
): Promise<void> {
  try {
    const whatsappResponse = await fetch(process.env.GO_4_WHATSAPP_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customerMobileNo: mobileNo,
        message: message,
      }),
    });

    if (!whatsappResponse.ok) {
      console.error(
        "WhatsApp confirmation failed:",
        await whatsappResponse.text()
      );
    } else {
      console.log("WhatsApp confirmation sent successfully");
    }
  } catch (whatsappError) {
    console.error("Error sending WhatsApp confirmation:", whatsappError);
  }
}
