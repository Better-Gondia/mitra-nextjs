import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import {
  X,
  MessageCircle,
  User,
  Share2,
  ArrowLeft,
  Target,
  FileText,
  Instagram,
  ExternalLink,
  Mail,
} from "lucide-react";
import logo from "@/public/logo.svg";
import { VerifiedCheck } from "../ui/blue-check";
import Image from "next/image";

// Simple VisuallyHidden component
const VisuallyHidden = ({ children }: { children: React.ReactNode }) => (
  <span className="sr-only">{children}</span>
);

interface ProfileModalProps {
  onClose: () => void;
}

export function ProfileModal({ onClose }: ProfileModalProps) {
  const user = {
    name: "Better Gondia Mitra",
    profileImage: "https://via.placeholder.com/150",
    email: "support@bettergondia.org",
  };

  return (
    <DialogContent className="bg-white h-[92dvh]  md:w-[350px] p-0 m-0">
      <VisuallyHidden>
        <DialogTitle>{user.name} Profile</DialogTitle>
        <DialogDescription>
          Profile information for {user.name}
        </DialogDescription>
      </VisuallyHidden>

      {/* WhatsApp-style Header */}
      <div className=" h-[90dvh]">
        <div className="bg-[#075E54] flex items-center space-x-2 shadow-sm p-4 h-[8dvh]">
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 p-1 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-white text-lg font-medium">Contact info</span>
        </div>
        <div className="overflow-y-auto flex-1  h-[82dvh]">
          {/* Profile Section */}
          <div className="bg-white px-6 py-6 text-center border-b border-gray-100">
            <div className="relative mb-4">
              <Avatar className="w-36 h-36 mx-auto cursor-pointer hover:scale-105 transition-transform shadow-lg border border-gray-200">
                <Image
                  src={logo}
                  className="m-auto"
                  width={150}
                  height={150}
                  alt="logo"
                />
                <AvatarFallback className="bg-gradient-to-br from-[#075E54] to-[#008F6F] text-white text-3xl font-bold shadow-inner">
                  BGM
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-3 right-[calc(50%-4.5rem)] w-7 h-7 bg-[#075E54] border-4 border-white rounded-full shadow-sm"></div>
            </div>

            <h2 className="text-gray-900 text-xl font-semibold mb-1 flex items-center justify-center">
              Better Gondia Mitra
              <span className="text-[#075E54] ml-1 text-lg">
                <VerifiedCheck />
              </span>
            </h2>
            <p className="text-gray-600 text-sm mb-6 font-medium">
              Making Gondia Better
            </p>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-6">
              <button
                onClick={() =>
                  window.open("mailto:support@bettergondia.org", "_blank")
                }
                className="flex flex-col items-center space-y-2 p-3 rounded-xl hover:bg-gray-50 transition-all duration-200"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <span className="text-gray-700 text-xs font-medium">Email</span>
              </button>

              <button
                onClick={() =>
                  window.open(
                    "https://whatsapp.com/channel/0029Va9JkvZ3WHTTubNstr1C",
                    "_blank"
                  )
                }
                className="flex flex-col items-center space-y-2 p-3 rounded-xl hover:bg-gray-50 transition-all duration-200"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-[#075E54] to-[#008F6F] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <span className="text-gray-700 text-xs font-medium">
                  Channel
                </span>
              </button>

              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: "Better Gondia Mitra",
                      text: "Making Gondia Better - Bridging the gap between administration and common people",
                      url: window.location.href,
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                  }
                }}
                className="flex flex-col items-center space-y-2 p-3 rounded-xl hover:bg-gray-50 transition-all duration-200"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow">
                  <Share2 className="w-6 h-6 text-white" />
                </div>
                <span className="text-gray-700 text-xs font-medium">Share</span>
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          {/* About Us Section */}
          <div className="bg-white px-6 py-5 border-b border-gray-100">
            <div className="flex items-start space-x-4">
              <div className="w-11 h-11 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-gray-700 text-sm mb-3 font-semibold">
                  📄 About Us
                </p>
                <p className="text-gray-800 text-base leading-relaxed">
                  Better Gondia Mitra is a citizen-driven platform to raise
                  civic issues like roads, water, electricity, and sanitation.
                  We ensure your voice reaches the right department with full
                  transparency.
                </p>
              </div>
            </div>
          </div>

          {/* Mission Section */}
          <div className="bg-white px-6 py-5 border-b border-gray-100">
            <div className="flex items-start space-x-4">
              <div className="w-11 h-11 bg-gradient-to-br from-green-50 to-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Target className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-gray-700 text-sm mb-3 font-semibold">
                  🤝 Our Mission
                </p>
                <p className="text-gray-800 text-base leading-relaxed">
                  Bridging the gap between the administration and the common
                  people.
                </p>
              </div>
            </div>
          </div>

          {/* Connect With Us Section */}
          <div className="bg-white px-6 py-5 border-b border-gray-100">
            <p className="text-gray-700 text-sm mb-4 font-semibold">
              🌐 Connect & Volunteer With Us
            </p>

            {/* Instagram */}
            <button
              onClick={() =>
                window.open(
                  "https://www.instagram.com/bettergondia?igsh=dTM1MGhoczV2em9j",
                  "_blank"
                )
              }
              className="flex items-center space-x-4 w-full p-4 hover:bg-gray-50 rounded-xl transition-all duration-200 mb-3 border border-gray-100 hover:border-gray-200"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-xl flex items-center justify-center shadow-md">
                <Instagram className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-gray-900 text-base font-medium">
                  📸 Instagram
                </p>
                <p className="text-[#075E54] text-sm flex items-center font-medium">
                  @BetterGondia
                  <ExternalLink className="w-3 h-3 ml-2" />
                </p>
              </div>
            </button>

            {/* WhatsApp Group */}
            <button
              onClick={() =>
                window.open(
                  "https://chat.whatsapp.com/KWMq7AXO8m5G90GeZoY9oM",
                  "_blank"
                )
              }
              className="flex items-center space-x-4 w-full p-4 hover:bg-gray-50 rounded-xl transition-all duration-200 mb-3 border border-gray-100 hover:border-gray-200"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-[#075E54] to-[#008F6F] rounded-xl flex items-center justify-center shadow-md">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-gray-900 text-base font-medium">
                  🔗 WhatsApp Group
                </p>
                <p className="text-[#075E54] text-sm flex items-center font-medium">
                  Join Group
                  <ExternalLink className="w-3 h-3 ml-2" />
                </p>
              </div>
            </button>

            {/* Volunteer */}
            <button
              onClick={() =>
                window.open("https://bettergondia.org/volunteer", "_blank")
              }
              className="flex items-center space-x-4 w-full p-4 hover:bg-gray-50 rounded-xl transition-all duration-200 border border-gray-100 hover:border-gray-200"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-md">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-gray-900 text-base font-medium">
                  🙋‍♂️ Volunteer
                </p>
                <p className="text-[#075E54] text-sm flex items-center font-medium">
                  Join Our Team
                  <ExternalLink className="w-3 h-3 ml-2" />
                </p>
              </div>
            </button>
          </div>

          {/* Footer Section */}
          <div className="bg-white px-6 py-5 text-center">
            <p className="text-gray-600 text-xs mb-2 flex items-center justify-center">
              Created With ♥️ by{" "}
              <span className="font-semibold ml-1 text-gray-700">
                Better Gondians
              </span>
            </p>
            <p className="text-gray-600 text-xs flex items-center justify-center">
              🚀 Supported by Aware{" "}
              <span className="font-semibold ml-1 text-gray-700">
                Citizens of Gondia
              </span>
            </p>
          </div>
        </div>
      </div>
    </DialogContent>
  );
}
