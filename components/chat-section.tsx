"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { useToast } from "@/hooks/use-toast";
import { User, ChatMessage, Section, MediaObject } from "@/types";
import {
  Send,
  MapPin,
  Camera,
  Check,
  CheckCheck,
  Mic,
  MicOff,
} from "lucide-react";
import { useBot } from "@/store/bot";
import type { BotState } from "@/store/bot";
import { useMessages } from "@/store/messages";
import { toast } from "sonner";
import { ChatBubble } from "./chat-bubble";
import { BotLogo } from "./BotLogo";
import { Alert } from "@/components/message-alrert";
import { useUserData } from "@/store/userData";
import {
  generateComplaintIdFromDate,
  getBotMessage,
  getCategoryIcon,
  resetApp,
} from "@/lib/clientUtils";
import { useRefetch } from "@/store/refetch";
import { Textarea } from "./ui/textarea";
import { clientMessages } from "@/lib/client-messages";
import { useModal } from "@/store/modal";
import { generateComplaintPreview, translate } from "@/lib/translator";
import { useLanguage } from "@/store/language";

// Web Speech API type declarations
interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  length: number;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message: string;
}

interface ChatSectionProps {
  user: User;
}

export default function ChatSection({
  handleSectionChange,
  handleOpenNewChat,
}: {
  handleSectionChange: (sec: Section) => void;
  handleOpenNewChat: () => void;
}) {
  const [messageInput, setMessageInput] = useState("");
  const setRefetch = useRefetch((state) => state.setRefetch);
  const userData = useUserData((state) => state.userData);
  const { messages, addMessage, resetToInitial } = useMessages();
  const language = useLanguage((state) => state.language);
  const openModal = useModal((state) => state.setIsOpen);
  const { botState, setBotState } = useBot() as unknown as {
    botState: BotState;
    setBotState: (state: BotState) => void;
  };
  const [isRecording, setIsRecording] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Function to update complaint messages in database
  const updateComplaintMessages = async (
    complaintId: number,
    message: ChatMessage
  ) => {
    const finalMessages = [...messages, message];
    console.log("messages ========= ", finalMessages);
    try {
      const response = await fetch(`/api/complaints/${complaintId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: JSON.stringify(finalMessages),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update complaint messages");
      }
    } catch (error) {
      console.error("Error updating complaint messages:", error);
      toast.error("Failed to save message");
    }
  };

  // Function to change complaint status
  const changeComplaintStatus = async (
    complaintId: number,
    newStatus: string
  ) => {
    try {
      const response = await fetch(`/api/complaints/${complaintId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update complaint status");
      }

      // Add bot message about status change
      const statusMessage: ChatMessage = {
        id: Date.now(),
        content: `Status of your complaint has been changed to "${newStatus}"`,
        messageType: "bot",
        isRead: false,
        createdAt: new Date().toISOString(),
      };

      addMessage(statusMessage);

      // // Update the complaint messages in the database
      // updateComplaintMessages(complaintId);

      // Update bot state with new complaint data
      // if (botState.complaintData) {
      //   setBotState({
      //     ...botState,
      //     complaintData: {
      //       ...botState.complaintData,
      //       status: newStatus,
      //     },
      //   });
      // }

      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating complaint status:", error);
      toast.error("Failed to update status");
    }
  };

  const showTypingIndicator = (time: number) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
    }, time);
  };

  const createComplaintMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const id = toast.loading(translate("submitting_complaint", language));

      const response = await fetch("/api/complaints", {
        method: "POST",
        body: data,
        credentials: "include",
      });

      const res: { error?: string; complaintId: string } =
        await response.json();
      if (res.error) {
        toast.error(clientMessages(res.error, language), { id });
        if (res.error == "USER_NOT_FOUND") {
          openModal(true, "Reload", { confirmationFunction: resetApp });
        }
        throw new Error(res.error);
      }
      toast.success(translate("complaint_submitted_successfully", language), {
        id,
      });
      return res;
    },
    onSuccess: (response: { complaintId: string }) => {
      // queryClient.invalidateQueries({ queryKey: ["/api/complaints/my"] });
      // queryClient.invalidateQueries({ queryKey: ["/api/complaints/public"] });

      setBotState({ ...botState, step: "none" });

      // Add success message to chat
      setTimeout(() => {
        addBotMessage(
          // `✅ Complaint submitted successfully! Your complaint ID is ${generateComplaintIdFromDate(
          //   Number(response.complaintId)
          // )}. We'll keep you updated on the progress.`,
          translate("complaint_submitted_success", language, {
            complaintId: generateComplaintIdFromDate(
              Number(response.complaintId)
            ),
          }),
          500
        );
      }, 1000);

      setTimeout(() => {
        addBotMessage(`Call to action (to be framed in requirement).`, 500);
      }, 2500);

      setRefetch(true);

      setTimeout(() => {
        setBotState({ step: "done", complaintData: botState.complaintData });
      }, 3500);

      // toast({
      //   title: "Complaint Submitted",
      //   description: `Your complaint ${response.complaintId} has been registered successfully.`,
      // });
    },
    onError: (error: Error) => {
      console.error("Complaint submission error:", error);
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    // Add welcome message if no messages exist
    if (messages.length === 0) {
      const intro = translate("intro_message", language);
      const introBotMessage = getBotMessage(intro);
      addMessage(introBotMessage);
    }
    if (messages.length === 1)
      addBotMessage(translate("select_complaint_category", language));
  }, [messages.length]);

  let botMessageTimeout: ReturnType<typeof setTimeout> | null = null;
  const addBotMessage = (content: string | React.ReactNode, delay = 1500) => {
    // Cancel any previously scheduled message
    if (botMessageTimeout) {
      clearTimeout(botMessageTimeout);
      botMessageTimeout = null;
    }

    showTypingIndicator(delay);

    botMessageTimeout = setTimeout(() => {
      // @ts-ignore
      const botMessage = getBotMessage(content);
      addMessage(botMessage);
      botMessageTimeout = null; // Clear after execution
    }, delay);
  };

  // Function to run once we have text
  const finish = (voiceText: string) => {
    setMessageInput(voiceText);
    // const userMessage: ChatMessage = {
    //   id: Date.now(),
    //   userId: userData.id || 0,
    //   content: voiceText,
    //   messageType: "user",
    //   isRead: false,
    //   createdAt: new Date().toISOString(),
    // };

    // addMessage(userMessage);
    // setBotState({
    //   step: "location",
    //   complaintData: { ...botState.complaintData, description: voiceText },
    // });

    // setTimeout(() => {
    //   addBotMessage(
    //     "Thank you for the detailed description! Now, can you provide the location? You can share your current location, type the address manually, or skip this step."
    //   );
    // }, 500);
  };

  // Voice recording functions
  const startRecording = async () => {
    setIsRecording(true);

    // @ts-ignore
    const recognition = new (window.SpeechRecognition ||
      // @ts-ignore
      window.webkitSpeechRecognition)();
    recognition.lang = "en-US";
    recognition.start();

    // @ts-ignore
    recognition.onresult = async (event) => {
      const query = event.results[0][0].transcript;
      finish(query);
    };

    // @ts-ignore
    recognition.onerror = (event) => {
      toast.error(translate("speech_not_recognized", language));
      console.error("Speech recognition error", event.error);
    };
  };

  const stopRecording = () => {
    setIsRecording(false);

    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
      setMediaRecorder(null);

      // toast({
      //   title: "Recording Stopped",
      //   description: "Processing your voice message...",
      // });
    }
  };

  const handleSendMessage = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!messageInput.trim()) return;
    if (botState.step == "none") return;

    const userMessage: ChatMessage = {
      id: Date.now(),
      userId: userData.id || 0,
      content: messageInput,
      messageType: "user",
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    if (botState.step === "description") {
      // User provided detailed description
      if (!messageInput || messageInput.length < 20) {
        toast.error(translate("description_too_short", language));
        return;
      }
      if (messageInput.length > 500) {
        toast.error(translate("description_too_long", language));
        return;
      }
      setBotState({
        step: "location",
        complaintData: { ...botState.complaintData, description: messageInput },
      });

      addBotMessage(translate("ask_location", language));
    } else if (botState.step === "location") {
      // User provided location manually
      setBotState({
        step: "media",
        complaintData: { ...botState.complaintData, location: messageInput },
      });

      addBotMessage(translate("ask_media_upload", language));
    } else if (botState.step === "admin") {
      // Admin is replying to the chat
      const adminMessage: ChatMessage = {
        id: Date.now(),
        userId: userData.id || 0,
        content: messageInput,
        messageType: "bot", // Admin messages appear as bot messages
        isRead: false,
        createdAt: new Date().toISOString(),
      };

      addMessage(adminMessage);

      // Update the complaint messages in the database
      if (botState.complaintData?.id) {
        updateComplaintMessages(botState.complaintData.id, adminMessage);
      }

      // Don't add user message for admin replies
      handleInputChange("");
      return;
    }

    addMessage(userMessage);

    // setMessageInput("");
    handleInputChange("");
  };

  const handleCategorySelect = (
    category: "roads" | "water" | "electricity" | "sanitation"
  ) => {
    // const categoryMap: Record<string, string> = {
    //   roads: "Roads",
    //   water: "Water",
    //   electricity: "Electricity",
    //   sanitation: "Sanitation",
    // };

    const userMessage: ChatMessage = {
      id: Date.now(),
      userId: userData.id || 0,
      content: getCategoryIcon(category) + " " + translate(category, language),
      messageType: "user",
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    setBotState({
      step: "description",
      complaintData: { ...botState.complaintData, category },
    });

    addMessage(userMessage);

    addBotMessage(translate("ask_description", language));
  };

  const handleInputChange = (text: string) => {
    setMessageInput(text);
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto"; // Reset height
      textarea.style.height = `${text ? textarea.scrollHeight : 0}px`; // Set to scroll height
    }
  };

  const handleLocationAction = (action: string) => {
    if (action === "current") {
      if (!navigator.geolocation) {
        addBotMessage(translate("geolocation_not_supported", language));
        return;
      }

      addBotMessage(translate("fetching_location", language));

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setBotState({
            ...botState,
            step: "media",
            complaintData: {
              ...botState.complaintData,
              latitude: position.coords.latitude.toString(),
              longitude: position.coords.longitude.toString(),
              location: "Current Location",
            },
          });
          addBotMessage(translate("location_captured_add_media", language));
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            addBotMessage(
              translate("permission_denied_type_address", language)
            );
          } else {
            addBotMessage(translate("unable_to_retrieve_location", language));
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else if (action === "manual") {
      addBotMessage(translate("please_type_address", language));
    } else if (action === "skip") {
      setBotState({ ...botState, step: "media" });
      addBotMessage(translate("location_skipped_add_media", language));
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Client-side validation: max 4 files
    if (files.length > 4) {
      toast.error(translate("max_attachments", language));
      event.target.value = ""; // reset input
      return;
    }

    // Client-side validation: video file size
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith("video/")) {
        if (file.size > 100 * 1024 * 1024) {
          toast.error(translate("video_too_large", language));
          event.target.value = ""; // reset input
          return;
        }
      }
    }

    const formData = new FormData();
    const imageUrls: string[] = [];
    const videoUrls: string[] = [];

    // Add all files to form data
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    try {
      const id = toast.loading(translate("uploading_files", language));
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        toast.error(translate("upload_failed", language), { id });
        throw new Error("Upload failed");
      }
      toast.success(translate("upload_successful", language), { id });
      const data = await response.json();

      console.log("res data ========= ", data);

      // Separate image and video URLs
      data.urls.forEach((url: string) => {
        const fileExtension = url.split(".").pop()?.toLowerCase();
        if (
          ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(
            fileExtension || ""
          )
        ) {
          imageUrls.push(url);
        } else if (
          ["mp4", "avi", "mov", "webm"].includes(fileExtension || "")
        ) {
          videoUrls.push(url);
        }
      });

      setBotState({
        step: "preview",
        complaintData: {
          ...botState.complaintData,
          imageUrls: [
            ...(botState.complaintData.imageUrls || []),
            ...imageUrls,
          ],
          videoUrls: [
            ...(botState.complaintData.videoUrls || []),
            ...videoUrls,
          ],
        },
      });

      // const totalFiles = imageUrls.length + videoUrls.length;
      // const fileTypeText =
      //   imageUrls.length > 0 && videoUrls.length > 0
      //     ? "files"
      //     : imageUrls.length > 0
      //     ? "photos"
      //     : "videos";

      // addBotMessage(
      //   `${totalFiles} ${fileTypeText} uploaded! Here's a preview of your complaint:`
      // );
      showComplaintPreview();
    } catch (error) {
      console.error("Upload error:", error);
      // toast({
      //   title: "Upload Failed",
      //   description: "Failed to upload files. Please try again.",
      //   variant: "destructive",
      // });
    }
  };

  const showComplaintPreview = () => {
    const imageCount = botState.complaintData.imageUrls?.length || 0;
    const videoCount = botState.complaintData.videoUrls?.length || 0;
    //     const mediaInfo =
    //       imageCount > 0 || videoCount > 0
    //         ? `\n- Media: ${imageCount} photo(s), ${videoCount} video(s)`
    //         : "";

    //     const preview = `**Complaint Preview:**
    // - Issue: ${botState.complaintData.description}
    // - Category: ${botState.complaintData.category}
    // - Location: ${botState.complaintData.location || "Not specified"}
    // - Your Details: ${userData.name} • +91 ${userData.mobile}${mediaInfo}

    // Would you like to submit this complaint?
    //     `;

    const preview = generateComplaintPreview(
      language,
      botState,
      userData,
      imageCount,
      videoCount
    );

    setTimeout(() => {
      addBotMessage(preview);
    }, 500);
  };

  const handleComplaintSubmit = () => {
    // Ensure we have the required data
    if (
      !botState.complaintData.description ||
      !botState.complaintData.category
    ) {
      // toast({
      //   title: "Missing Information",
      //   description: "Please complete all required fields before submitting.",
      //   variant: "destructive",
      // });
      return;
    }

    const formData = new FormData();
    // formData.append("title", botState.complaintData.title);
    formData.append("userId", String(userData.id) || "0");
    formData.append("description", botState.complaintData.description);
    formData.append("messages", JSON.stringify(messages));
    formData.append("category", botState.complaintData.category);
    formData.append("isPublic", "true");

    if (botState.complaintData.location) {
      formData.append("location", botState.complaintData.location);
    }
    if (botState.complaintData.latitude) {
      formData.append("latitude", botState.complaintData.latitude);
    }
    if (botState.complaintData.longitude) {
      formData.append("longitude", botState.complaintData.longitude);
    }

    // Add media files
    if (
      botState.complaintData.media &&
      botState.complaintData.media.length > 0
    ) {
      botState.complaintData.media.forEach(
        (item: MediaObject, index: number) => {
          formData.append(`media[${index}]`, JSON.stringify(item));
        }
      );
    }

    formData.append("language", language);

    createComplaintMutation.mutate(formData);
  };

  const renderBotMessage = (message: ChatMessage) => {
    if (
      botState.step === "category" &&
      (message.content.includes("select the category") ||
        message.content.includes("श्रेणी चुनें") ||
        message.content.includes("श्रेणी निवडा"))
    ) {
      return (
        <div className="chat-bubble-received p-3 max-w-sm shadow-sm border border-gray-200">
          <p className="text-sm bg-white chat-bubble-left mb-3">
            {message.content}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              size="sm"
              variant="outline"
              className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
              onClick={() => handleCategorySelect("roads")}
            >
              🛣️ {translate("roads", language)}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
              onClick={() => handleCategorySelect("water")}
            >
              💧 {translate("water", language)}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100"
              onClick={() => handleCategorySelect("electricity")}
            >
              ⚡ {translate("electricity", language)}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
              onClick={() => handleCategorySelect("sanitation")}
            >
              🗑️ {translate("sanitation", language)}
            </Button>
          </div>
          <div className="flex items-center text-xs whatsapp-gray mt-2">
            <span className="flex items-center gap-1">
              Better Gondia Mitra
              <div className="w-3 h-3 rounded-full bg-blue-500 flex items-center justify-center">
                <Check className="w-2 h-2 text-white" />
              </div>
            </span>
            <span className="mx-1">•</span>
            <span>
              {new Date(message.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      );
    }

    if (
      botState.step === "location" &&
      (message.content.includes("provide the location") ||
        (message.content.includes("स्थान") &&
          message.content.includes("चरण")) ||
        message.content.includes("स्थान देऊ"))
    ) {
      return (
        <div className="chat-bubble-received p-3 max-w-sm shadow-sm  border border-gray-200">
          <p className="text-sm bg-white chat-bubble-left mb-3">
            {message.content}
          </p>
          <div className="space-y-2">
            <Button
              size="sm"
              variant="outline"
              className="w-full bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 flex items-center justify-center"
              onClick={() => handleLocationAction("current")}
            >
              <MapPin className="w-4 h-4 mr-2" />
              {translate("share_current_location", language)}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="w-full bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
              onClick={() => handleLocationAction("manual")}
            >
              {translate("type_address_manually", language)}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="w-full bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
              onClick={() => handleLocationAction("skip")}
            >
              {translate("skip_optional", language)}
            </Button>
          </div>
          <div className="flex items-center text-xs whatsapp-gray mt-2">
            <span className="flex items-center gap-1">
              Better Gondia Mitra
              <div className="w-3 h-3 rounded-full bg-blue-500 flex items-center justify-center">
                <Check className="w-2 h-2 text-white" />
              </div>
            </span>
            <span className="mx-1">•</span>
            <span>
              {new Date(message.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      );
    }

    if (
      botState.step === "media" &&
      (message.content.includes("photo or video") ||
        message.content.includes("फोटो या वीडियो") ||
        message.content.includes("फोटो किंवा व्हिडिओ"))
    ) {
      return (
        <div className="chat-bubble-received p-3 max-w-sm shadow-sm border border-gray-200">
          <p className="text-sm bg-white chat-bubble-left mb-3">
            {message.content}
          </p>
          <div className="space-y-2">
            <Button
              size="sm"
              variant="outline"
              className="w-full bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 flex items-center justify-center"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="w-4 h-4 mr-2" />
              {translate("add_photos_videos", language)}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="w-full bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
              onClick={() => {
                setBotState({
                  step: "preview",
                  complaintData: botState.complaintData,
                });
                showComplaintPreview();
              }}
            >
              {translate("skip_and_preview", language)}
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            className="hidden"
            onChange={handleFileUpload}
          />
          <div className="flex items-center text-xs whatsapp-gray mt-2">
            <span className="flex items-center gap-1">
              Better Gondia Mitra
              <div className="w-3 h-3 rounded-full bg-blue-500 flex items-center justify-center">
                <Check className="w-2 h-2 text-white" />
              </div>
            </span>
            <span className="mx-1">•</span>
            <span>
              {new Date(message.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      );
    }

    if (
      message.content.includes("Complaint Preview") ||
      message.content.includes("पूर्वावलोकन")
    ) {
      return (
        <div className="chat-bubble-received p-3 max-w-sm shadow-sm border border-gray-200">
          <div className="text-sm bg-white chat-bubble-left whitespace-pre-line mb-3">
            {message.content}
          </div>

          {/* Show uploaded files if any */}
          {(botState.complaintData.media?.length || 0) > 0 && (
            <div className="mb-3">
              <div className="text-xs text-gray-500 mb-2">
                {translate("uploaded_files", language)}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {botState.complaintData.media?.map(
                  (item: MediaObject, index: number) => {
                    if (item.type === "image") {
                      return (
                        <div key={`img-${index}`} className="relative">
                          <img
                            src={item.url}
                            alt={`${item.filename} - Uploaded image ${index + 1}`}
                            className="w-full object-cover rounded border"
                          />
                        </div>
                      );
                    } else if (item.type === "video") {
                      return (
                        <div key={`vid-${index}`} className="relative">
                          <video
                            src={item.url}
                            className="w-full object-cover rounded border"
                            controls
                          />
                        </div>
                      );
                    }
                    return null;
                  }
                )}
              </div>
            </div>
          )}

          {botState.step == "preview" && (
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 bg-gray-100 text-gray-700"
                disabled={createComplaintMutation.isPending}
                onClick={() => {
                  setBotState({
                    step: "category",
                    complaintData: {
                      title: botState.complaintData.title,
                      description: botState.complaintData.title,
                    },
                  });
                  // resetToInitial();
                  addBotMessage(
                    translate("edit_complaint_select_category", language)
                  );
                }}
              >
                {translate("edit", language)}
              </Button>
              <Button
                size="sm"
                className="flex-1 whatsapp-green text-white hover:bg-[#128C7E]"
                onClick={handleComplaintSubmit}
                disabled={createComplaintMutation.isPending}
              >
                {createComplaintMutation.isPending
                  ? translate("submitting", language)
                  : translate("submit", language)}
              </Button>
            </div>
          )}
          <div className="flex items-center text-xs whatsapp-gray mt-2">
            <span className="flex items-center gap-1">
              Better Gondia Mitra
              <div className="w-3 h-3 rounded-full bg-blue-500 flex items-center justify-center">
                <Check className="w-2 h-2 text-white" />
              </div>
            </span>
            <span className="mx-1">•</span>
            <span>
              {new Date(message.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      );
    }

    return (
      <div className="chat-bubble-received p-3 max-w-xs shadow-sm border border-gray-200">
        <p className="text-sm bg-white chat-bubble-left whitespace-pre-line">
          {message.content}
        </p>
        <div className="flex items-center text-xs whatsapp-gray mt-2">
          <span className="flex items-center gap-1">
            Better Gondia Mitra
            <div className="w-3 h-3 rounded-full bg-blue-500 flex items-center justify-center">
              <Check className="w-2 h-2 text-white" />
            </div>
          </span>
          <span className="mx-1">•</span>
          <span>
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div
      className="h-full flex flex-col  bg-[#E5DDD5]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23d4d4d4' fill-opacity='0.1' fill-rule='evenodd'%3E%3Cpath d='m0 40l40-40h-40v40z'/%3E%3C/g%3E%3C/svg%3E")`,
      }}
    >
      {/* {botState.step == "existing" && ( */}
      {/* <div className="bg-white w-full p-2">
        <Button onClick={(e) => handleSectionChange("my-issues")}>
          <ArrowLeft /> My Complaints
        </Button>
      </div> */}
      {/* )} */}
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-1 py-4 space-y-4">
        {/* <Background> */}
        {/* Welcome Message */}
        {/* <div className="flex justify-center">
          <div className="bg-yellow-100 border-l-4 border-yellow-400 px-4 py-2 rounded-r-lg max-w-10/12">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-yellow-800">
                Better Gondia Mitra
              </span>
              <div className="w-3 h-3 rounded-full bg-blue-500 flex items-center justify-center">
                <Check className="w-2 h-2 text-white" />
              </div>
            </div>
            <p className="text-sm text-yellow-800">
              Welcome! Type your complaint or issue to get started.
            </p>
          </div>
        </div> */}
        {messages.map((message, index) => (
          <div key={`${message.id}-${index}`}>
            {message.messageType === "bot" ? (
              <div className="flex items-start space-x-2">
                <BotLogo />
                {renderBotMessage(message)}
              </div>
            ) : (
              <div className="flex justify-end mr-2">
                <div className="chat-bubble-sent p-3 max-w-xs shadow-sm ">
                  <p className="text-sm chat-bubble-left break-all">
                    {message.content}
                  </p>
                  <div className="flex items-center justify-end text-xs mt-2 gap-1">
                    <span>
                      {new Date(message.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <CheckCheck className="w-4 h-4 text-blue-500" />
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        {isTyping && <ChatBubble />}
        {(botState.step == "done" ||
          botState.step == "existing" ||
          botState.step == "admin") && (
          // <></>
          <div className=" mb-1 flex flex-col gap-3">
            <Alert type="warning" className="w-11/12 m-auto">
              {botState.step === "admin"
                ? "Admin Mode - You can reply to this chat and change complaint status"
                : translate("chat_ended_start_new", language)}
            </Alert>

            <div className="flex justify-around items-center w-11/12 m-auto">
              {botState.step == "existing" && (
                <>
                  <Button
                    className="w-5/12"
                    variant={"default"}
                    onClick={() => handleSectionChange("my-issues")}
                  >
                    {translate("close", language)}
                  </Button>
                  <Button
                    className="bg-[#5cd388] w-5/12  hover:bg-[#25D366]"
                    onClick={() => {
                      handleOpenNewChat();
                      resetToInitial();
                    }}
                  >
                    {translate("new_complaint", language)}
                  </Button>
                </>
              )}
              {botState.step == "admin" && (
                <>
                  <Button
                    className="w-5/12"
                    variant={"default"}
                    onClick={() => handleSectionChange("community")}
                  >
                    Back to Community
                  </Button>
                  <Button
                    className="bg-[#5cd388] w-5/12  hover:bg-[#25D366]"
                    onClick={() => {
                      handleOpenNewChat();
                      resetToInitial();
                    }}
                  >
                    {translate("new_complaint", language)}
                  </Button>
                </>
              )}
              {botState.step == "done" && (
                <Button
                  className="w-8/12 m-auto text-yellow-800 border border-yellow-300  hover:bg-yellow-50"
                  variant={"default"}
                  onClick={() => {
                    handleSectionChange("my-issues");
                    // setRefetch(true);
                  }}
                >
                  {translate("view_my_complaints", language)}
                </Button>
              )}
            </div>
          </div>
          // <div className={`text-blue-800 border border-blue-300 bg-blue-50`}>
          //   <Info />
          //   <div>{"Change a few things up and try submitting again."}</div>
          // </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="">
        {!["done", "category", "media", "preview", "none"].includes(
          botState.step
        ) ? (
          <div className="">
            {/* Admin Status Change Controls */}
            {botState.step === "admin" && (
              <div className="bg-blue-50 p-3 border-b border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-800">
                    Admin Controls
                  </span>
                  <span className="text-xs text-blue-600">
                    Current Status:{" "}
                    {botState.complaintData?.status || "Unknown"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      changeComplaintStatus(
                        botState.complaintData?.id!,
                        "submitted"
                      )
                    }
                    className="text-xs"
                  >
                    Set Submitted
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      changeComplaintStatus(
                        botState.complaintData?.id!,
                        "forwarded"
                      )
                    }
                    className="text-xs"
                  >
                    Set Forwarded
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      changeComplaintStatus(
                        botState.complaintData?.id!,
                        "resolved"
                      )
                    }
                    className="text-xs"
                  >
                    Set Resolved
                  </Button>
                </div>
              </div>
            )}

            <div className="bg-[#F0F0F0] p-2 border-t border-gray-300">
              <form
                onSubmit={(e) => handleSendMessage(e)}
                className="flex space-x-2 justify-center items-center"
              >
                <div className="flex-1 relative">
                  <Textarea
                    ref={textareaRef}
                    value={messageInput}
                    onChange={(e) => handleInputChange(e.target.value)}
                    placeholder={
                      botState.step === "admin"
                        ? "Reply as admin..."
                        : "Describe your complaint in detail..."
                    }
                    className="w-full py-2 px-3 bg-white rounded-[20px] border border-gray-300  text-gray-900 text-[15px] min-h-[44px] max-h-[250px] break-words break-all overflow-x-auto max-w-full "
                    style={{
                      fontFamily: "system-ui, -apple-system, sans-serif",
                    }}
                  />
                </div>

                {(botState.step === "description" ||
                  botState.step === "admin" ||
                  botState.step === "location") &&
                messageInput.trim() ? (
                  <Button
                    type="submit"
                    className="bg-[#25D366] text-white p-2 h-10 w-10 rounded-full hover:bg-[#128C7E] transition-colors shadow-md"
                    disabled={!messageInput.trim()}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200 ${
                      isRecording
                        ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
                        : "bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200"
                    }`}
                    onClick={isRecording ? stopRecording : startRecording}
                  >
                    {isRecording ? (
                      <MicOff className="h-4 w-4" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </form>
            </div>

            {/* Voice Message Option */}

            {/* {botState.step === "description" && (
              <>
                <div className="flex items-center justify-center m-1">
                  <div className="text-xs whatsapp-gray mr-3">or</div>
                  <Button
                    className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200 ${
                      isRecording
                        ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
                        : "bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200"
                    }`}
                    onClick={isRecording ? stopRecording : startRecording}
                  >
                    {isRecording ? (
                      <>
                        <MicOff className="h-4 w-4" />
                        <span className="text-sm">Stop Recording</span>
                      </>
                    ) : (
                      <>
                        <Mic className="h-4 w-4" />
                        <span className="text-sm">Voice Message</span>
                      </>
                    )}
                  </Button>
                </div>

                {isRecording && (
                  <div className="text-center">
                    <div className="text-xs text-red-500 animate-pulse">
                      Recording... Speak clearly about your complaint
                    </div>
                  </div>
                )}
              </>
            )} */}
          </div>
        ) : (
          <></>
          // <div className="flex gap-2 w-full">
          //   <Button className="bg-whatsapp-green">View my complaints</Button>
          //   <Button variant={"secondary"}>Done</Button>
          // </div>
        )}
      </div>
    </div>
  );
}
