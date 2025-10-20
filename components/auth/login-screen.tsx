import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface LoginScreenProps {
  onNext: (mobile: string) => void;
}

export default function LoginScreen({ onNext }: LoginScreenProps) {
  const [mobile, setMobile] = useState("");
  // const { toast } = useToast();
  const queryClient = useQueryClient();

  const sendOtpMutation = useMutation({
    mutationFn: async (mobileNumber: string) => {
      await apiRequest("POST", "/api/auth/send-otp", { mobile: mobileNumber });
    },
    onSuccess: () => {
      // toast({
      //   title: "OTP Sent",
      //   description: "Please check your mobile for the verification code",
      // });
      onNext(mobile);
    },
    onError: (error: Error) => {
      // toast({
      //   title: "Error",
      //   description: error.message,
      //   variant: "destructive",
      // });
    },
  });

  const demoLoginMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/auth/demo-login", {});
      return response.json();
    },
    onSuccess: () => {
      // toast({
      //   title: "Demo Login Successful",
      //   description: "Welcome to Better Gondia Mitra!",
      // });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error: Error) => {
      // toast({
      //   title: "Demo Login Failed",
      //   description: error.message,
      //   variant: "destructive",
      // });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mobile.length !== 10) {
      // toast({
      //   title: "Invalid Mobile",
      //   description: "Please enter a valid 10-digit mobile number",
      //   variant: "destructive",
      // });
      return;
    }

    sendOtpMutation.mutate(mobile);
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="whatsapp-green text-white p-4 text-center">
        <h1 className="text-xl font-semibold">Better Gondia Mitra</h1>
        <p className="text-sm opacity-90 mt-1">Your Voice, Your City</p>
      </div>

      {/* Login Form */}
      <div className="flex-1 flex flex-col justify-center px-6">
        <div className="text-center mb-8">
          <div className="w-24 h-24 whatsapp-green rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-city text-white text-3xl"></i>
          </div>
          <h2 className="text-2xl font-semibold  mb-2">
            Welcome to Better Gondia
          </h2>
          <p className="whatsapp-gray">
            Help make your city better by reporting civic issues
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="block text-sm font-medium  mb-2">
              Mobile Number
            </Label>
            <div className="flex">
              <span className="bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg px-3 py-3 whatsapp-gray">
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
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full whatsapp-green text-white py-3 rounded-lg font-medium hover:bg-green-600 transition-colors"
            disabled={sendOtpMutation.isPending}
          >
            {sendOtpMutation.isPending ? "Sending..." : "Send OTP"}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            onClick={() => demoLoginMutation.mutate()}
            disabled={demoLoginMutation.isPending}
          >
            {demoLoginMutation.isPending
              ? "Logging in..."
              : "Skip Login (Demo)"}
          </Button>
        </form>

        <p className="text-xs whatsapp-gray text-center mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
