import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft } from "lucide-react";

interface OTPScreenProps {
  mobile: string;
  onNext: (isNewUser: boolean) => void;
  onBack: () => void;
}

export default function OTPScreen({ mobile, onNext, onBack }: OTPScreenProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  // const { toast } = useToast();

  const verifyOtpMutation = useMutation({
    mutationFn: async (otpCode: string) => {
      const response = await apiRequest("POST", "/api/auth/verify-otp", {
        mobile,
        otp: otpCode,
      });
      return response.json();
    },
    onSuccess: (data) => {
      // toast({
      //   title: "OTP Verified",
      //   description: "Successfully verified your mobile number",
      // });
      onNext(data.isNewUser);
    },
    onError: (error: Error) => {
      // toast({
      //   title: "Verification Failed",
      //   description: error.message,
      //   variant: "destructive",
      // });
    },
  });

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      // toast({
      //   title: "Invalid OTP",
      //   description: "Please enter the complete 6-digit OTP",
      //   variant: "destructive",
      // });
      return;
    }

    verifyOtpMutation.mutate(otpCode);
  };

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  return (
    <div className="fixed inset-0 bg-white z-50">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="whatsapp-green text-white p-4 flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="mr-4 text-white hover:bg-white hover:bg-opacity-10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Verify Phone Number</h1>
        </div>

        {/* OTP Form */}
        <div className="flex-1 flex flex-col justify-center px-6">
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold whatsapp-dark mb-2">
              Enter OTP
            </h2>
            <p className="whatsapp-gray">
              We've sent a 6-digit code to +91 {mobile}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex justify-center space-x-3">
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  className="w-12 h-12 text-center border border-gray-300 rounded-lg text-xl font-semibold focus:border-green-500"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                />
              ))}
            </div>

            <Button
              type="submit"
              className="w-full whatsapp-green text-white py-3 rounded-lg font-medium hover:bg-green-600 transition-colors"
              disabled={verifyOtpMutation.isPending}
            >
              {verifyOtpMutation.isPending ? "Verifying..." : "Verify OTP"}
            </Button>

            <div className="text-center">
              <p className="whatsapp-gray text-sm">Didn't receive code?</p>
              <Button
                variant="link"
                className="text-green-600 font-medium text-sm p-0"
              >
                Resend OTP
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
