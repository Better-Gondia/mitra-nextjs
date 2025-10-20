"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface MobileLookupModalProps {
  onClose: () => void;
  onUserFound: (slug: string) => void;
  onUserNotFound: () => void;
}

interface UserLookupResponse {
  success: boolean;
  user?: {
    id: number;
    name: string;
    slug: string;
    mobile: string;
    createdAt: string;
  };
  error?: string;
}

export function MobileLookupModal({
  onClose,
  onUserFound,
  onUserNotFound,
}: MobileLookupModalProps) {
  const [mobile, setMobile] = useState("");

  const lookupUserMutation = useMutation({
    mutationFn: async (mobileNumber: string): Promise<UserLookupResponse> => {
      const response = await apiRequest("POST", "/api/users/lookup", {
        mobileNumber,
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success && data.user) {
        onUserFound(data.user.slug);
      } else {
        onUserNotFound();
      }
    },
    onError: () => {
      onUserNotFound();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mobile.length === 10) {
      lookupUserMutation.mutate(mobile);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-[#075E54] to-[#008F6F] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">📱</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Enter Your Mobile Number
          </h2>
          <p className="text-gray-600 text-sm">
            We'll help you find your account and view your complaints
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="block text-sm font-medium mb-2">
              Mobile Number
            </Label>
            <div className="flex justify-center items-center">
              <span className="bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg p-1.5 text-gray-600">
                +91
              </span>
              <Input
                type="tel"
                className="flex-1 border border-gray-300 rounded-r-lg rounded-l-none focus:border-green-500"
                placeholder="Enter mobile number"
                maxLength={10}
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                required
                disabled={lookupUserMutation.isPending}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Enter your 10-digit mobile number
            </p>
          </div>

          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              onClick={onClose}
              disabled={lookupUserMutation.isPending}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-[#075E54] to-[#008F6F] text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              disabled={mobile.length !== 10 || lookupUserMutation.isPending}
            >
              {lookupUserMutation.isPending ? (
                <>
                  <Spinner className="w-4 h-4 mr-2" />
                  Looking up...
                </>
              ) : (
                "Find Account"
              )}
            </Button>
          </div>
        </form>

        {lookupUserMutation.error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">
              Failed to lookup user. Please try again.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
