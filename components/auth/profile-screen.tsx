import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Cross, X } from "lucide-react";
import { ProfileFormData, User } from "@/types";
import { toast } from "sonner";
import { useUserData } from "@/store/userData";
import { useAuthStep } from "@/store/authStep";
import { setCookie } from "cookies-next";
import { useSections } from "@/store/section";
import { useLoaderStore } from "@/store/loader";
import { translate } from "@/lib/translator";
import { useLanguage } from "@/store/language";
import { getRandom10DigitNumber, normalizeDigits } from "@/lib/clientUtils";

interface ProfileScreenProps {
  mobile: string;
  onNext: () => void;
  onBack?: () => void;
}

export default function ProfileScreen({
  mobile,
  onNext,
  onBack,
}: ProfileScreenProps) {
  const [formData, setFormData] = useState<ProfileFormData>({
    // firstName: "",
    // lastName: "",
    name: "",
    mobile,
    address: "",
    age: 0,
    gender: "",
  });
  const setUserData = useUserData((state) => state.setUserData);
  const setAuthStep = useAuthStep((state) => state.setAuthStep);
  const setSection = useSections((state) => state.setSection);
  const language = useLanguage((state) => state.language);

  // const { toast } = useToast();
  // const queryClient = useQueryClient();

  const completeProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const response = await apiRequest(
        "POST",
        "/api/auth/complete-profile",
        data
      );
      console.log("Profile creation response:", response, data);
      return response.json();
    },
    onSuccess: (res) => {
      // toast.success("Profile creation successfull!", {
      //   description: "Welcome to Better Gondia Mitra!",
      //   // action: {
      //   //   label: <X className="bg-transparent fill-white text-white" />,
      //   //   onClick: (id) => {
      //   //     toast.dismiss();
      //   //   },
      //   //   actionButtonStyle: {
      //   //     backgroundColor: "transparent",
      //   //     color: "transparent",
      //   //   },
      //   // },
      // });
      setSection("my-issues");
      console.log("Data recieved on success:", res);
      const savedUser = res.data;
      const newUser = { ...savedUser } as User;
      localStorage.setItem("userData", JSON.stringify(newUser));
      setUserData(newUser);
      setCookie("userId", newUser.id);

      setAuthStep("complete");
      localStorage.setItem("authStep", "complete");

      // queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      onNext();
    },
    onError: (error: Error) => {
      // toast({
      //   title: "Profile Creation Failed",
      //   description: error.message,
      //   variant: "destructive",
      // });
      const err = error.message.split('"');
      const message = err[err.length - 2];
      toast.error(message);
      console.log("Profile creation error:", message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.mobile ||
      !formData.address ||
      !formData.age ||
      !formData.gender
    ) {
      toast.error(translate("please_fill_all_fields", language));
      return;
    }

    // Name validation: more than 5 characters
    if (formData.name.trim().length <= 5) {
      toast.error(translate("name_min_length", language));
      return;
    }

    // Age validation: between 16 and 110
    const ageNum = Number(formData.age);
    if (isNaN(ageNum) || ageNum < 16 || ageNum > 110) {
      toast.error(translate("age_range", language));
      return;
    }

    const mobile = normalizeDigits(formData.mobile);

    console.log("mobile ========= ", mobile);

    if (!/^\d{10}$/.test(mobile)) {
      toast.error(translate("invalid_mobile", language));
      return;
    }

    // Address validation: more than 10 characters
    if (formData.address.trim().length <= 10) {
      toast.error(translate("address_min_length", language));
      return;
    }

    formData.mobile = mobile;

    completeProfileMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const fillRandomInfo = () => {
    const randomNames = [
      "John Smith",
      "Sarah Johnson",
      "Michael Brown",
      "Emily Davis",
      "David Wilson",
      "Lisa Anderson",
      "Robert Taylor",
      "Jennifer Martinez",
      "William Garcia",
      "Amanda Rodriguez",
    ];

    const randomAddresses = [
      "123 Main Street, Downtown Area, City Center, 441001",
      "456 Oak Avenue, Residential District, Suburban Area, 441002",
      "789 Pine Road, Business Quarter, Urban Zone, 441003",
      "321 Elm Street, Community Hub, Metropolitan Region, 441004",
      "654 Maple Drive, Cultural District, Civic Center, 441005",
    ];

    const randomGenders: Array<"Male" | "Female" | "Other"> = [
      "Male",
      "Female",
      "Other",
    ];

    const randomData: ProfileFormData = {
      name: randomNames[Math.floor(Math.random() * randomNames.length)],
      mobile: getRandom10DigitNumber(),
      address:
        randomAddresses[Math.floor(Math.random() * randomAddresses.length)],
      age: Math.floor(Math.random() * 84) + 16,
      gender: randomGenders[Math.floor(Math.random() * randomGenders.length)],
    };

    setFormData(randomData);

    // Auto-submit the form after filling random data
    setTimeout(() => {
      const submitEvent = new Event("submit", {
        bubbles: true,
        cancelable: true,
      });
      const form = document.querySelector("form");
      if (form) {
        form.dispatchEvent(submitEvent);
      }
    }, 1000);
  };

  return (
    <div className=" bg-white z-50 md:w-[400px] h-[100dvh]">
      <div className="flex flex-col h-full">
        {/* Header */}
        {onBack && (
          <div className="bg-[#075E54] text-white p-4 flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="mr-4 text-white hover:bg-white hover:bg-opacity-10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">
              {translate("complete_profile", language)}
            </h1>
          </div>
        )}

        {/* Profile Form */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="block text-sm font-medium  mb-2">
                {translate("name", language)} *
              </Label>
              <Input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-3 focus:outline-none focus:border-none "
                placeholder={translate("enter_name", language)}
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </div>

            <div className="flex gap-2 w-full justify-between">
              <div className="w-full">
                <Label className="block text-sm font-medium  mb-2">
                  {translate("age", language)} *
                </Label>
                <Input
                  type="number"
                  className="w-full border border-gray-300 rounded-lg px-3 py-3 focus:outline-none focus:border-none "
                  placeholder={translate("enter_age", language)}
                  value={formData.age}
                  onChange={(e) => handleInputChange("age", e.target.value)}
                  required
                />
              </div>

              <div className="w-full">
                <Label className="block text-sm font-medium  mb-2">
                  {translate("gender", language)} *
                </Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => handleInputChange("gender", value)}
                >
                  <SelectTrigger className="w-full border border-gray-300 rounded-lg px-3 py-3 ">
                    <SelectValue
                      placeholder={translate("select_gender", language)}
                    />
                  </SelectTrigger>
                  <SelectContent className="bg-white shadow-2xl">
                    <SelectItem value="Male">
                      {translate("male", language)}
                    </SelectItem>
                    <SelectItem value="Female">
                      {translate("female", language)}
                    </SelectItem>
                    <SelectItem value="Other">
                      {translate("other", language)}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="block text-sm font-medium  mb-2">
                {translate("phone_number", language)} *
              </Label>
              <Input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-3 focus:outline-none focus:border-none "
                placeholder={translate("enter_phone_number", language)}
                value={formData.mobile}
                onChange={(e) => handleInputChange("mobile", e.target.value)}
                required
              />
            </div>

            {/* <div>
              <Label className="block text-sm font-medium  mb-2">
                Last Name *
              </Label>
              <Input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-3 "
                placeholder="Enter your last name"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                required
              />
            </div> */}

            <div>
              <Label className="block text-sm font-medium  mb-2">
                {translate("address", language)} *
              </Label>
              <Textarea
                className="w-full border border-gray-300 rounded-lg px-3 py-3  h-20 resize-none"
                placeholder={translate("enter_complete_address", language)}
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                required
              />
            </div>
          </form>
        </div>

        {/* Bottom Button */}
        <div className="p-6 border-t border-gray-200 space-y-3">
          {/* Dev Button - Fill Random Info */}
          <Button
            type="button"
            onClick={fillRandomInfo}
            className="w-full bg-gray-600 text-white py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors text-sm"
            disabled={completeProfileMutation.isPending}
          >
            Fill Random Info (dev)
          </Button>

          <Button
            onClick={handleSubmit}
            className="w-full bg-[#075E54] text-white py-3 rounded-lg font-medium hover:bg-[#075E54] transition-colors"
            disabled={completeProfileMutation.isPending}
          >
            {completeProfileMutation.isPending
              ? translate("creating_profile", language)
              : translate("complete_setup", language)}
          </Button>
        </div>
      </div>
    </div>
  );
}
