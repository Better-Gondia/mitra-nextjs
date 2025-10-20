"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "nextjs-toploader/app";

export function UserNotFoundPage() {
  const router = useRouter();

  const handleCreateComplaint = () => {
    // Redirect to WhatsApp with the complaint creation message
    const phoneNumber = "+917875441601";
    const message = "Hi";
    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/\+/g, "")}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-[#E5DDD5] to-[#F0F0F0] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Logo/Icon */}
          <div className="w-20 h-20 bg-gradient-to-br from-[#075E54] to-[#008F6F] rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-white text-3xl">🏛️</span>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Account Not Found
          </h1>

          {/* Description */}
          <div className="text-gray-600 mb-8 space-y-3">
            <p>
              We couldn't find an account associated with that mobile number.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
              <h3 className="font-semibold text-blue-900 mb-2">
                About Better Gondia Mitra
              </h3>
              <p className="text-blue-800 text-sm">
                Better Gondia Mitra is a platform where you can:
              </p>
              <ul className="text-blue-800 text-sm mt-2 space-y-1">
                <li>• Create complaints about local issues</li>
                <li>• Track the status of your complaints</li>
                <li>• Support other community complaints</li>
                <li>• Make suggestions for improvements</li>
              </ul>
            </div>

            <p className="text-sm">
              To get started, create your first complaint through WhatsApp!
            </p>
          </div>

          {/* Action Button */}
          <Button
            onClick={handleCreateComplaint}
            className="w-full bg-gradient-to-r from-[#075E54] to-[#008F6F] text-white py-4 rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity shadow-lg"
          >
            <span className="flex items-center justify-center space-x-2">
              <span>📱</span>
              <span>+ Create Complaint</span>
            </span>
          </Button>

          {/* Additional Info */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              After creating your first complaint, you'll get a personal link to
              track your issues.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Better Gondia Mitra - Making Gondia Better Together
          </p>
        </div>
      </div>
    </div>
  );
}
