"use client";

import { Button } from "@/components/ui/button";
import { Language } from "@/types";
import logo from "@/public/logo.svg";
import Image from "next/image";
import circle from "@/public/wavy-circle.svg";
import { motion } from "motion/react";

interface LanguageSelectionProps {
  onLanguageSelect: (language: Language) => void;
}

const box = {
  width: 100,
  height: 100,
  // backgroundColor: "#f5f5f5",
  borderRadius: 5,
};

export default function LanguageSelection({
  onLanguageSelect,
}: LanguageSelectionProps) {
  return (
    <div className="h-[100dvh] flex items-center justify-center whatsapp-bg">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
        <div className="text-center mb-8">
          {/* <motion.div
            animate={{
              scale: [1, 2, 2, 1, 1],
              rotate: [0, 0, 180, 180, 0],
              borderRadius: ["0%", "0%", "50%", "50%", "0%"],
            }}
            transition={{
              duration: 2,
              ease: "easeInOut",
              times: [0, 0.2, 0.5, 0.8, 1],
              repeat: Infinity,
              repeatDelay: 1,
            }}
            style={box}
          /> */}
          <div className="w-16 h-16  rounded-full flex items-center justify-center mx-auto mb-4">
            <motion.div
              className="absolute w-full h-full z-50"
              // initial={{ rotate: 0 }}
              // animate={{ rotate: 360 }}
              // transition={{ duration: 10 }}
              animate={{
                scale: [0.8, 0.95, 0.8, 0.95, 0.8],
                rotate: 360,
                // borderRadius: ["0%", "0%", "50%", "50%", "0%"],
              }}
              transition={{
                duration: 4,
                ease: "linear",
                // times: [0.2, 0.4, 0.6, 0.8, 1],
                repeat: Infinity,
                // repeatDelay: 1,
              }}
              style={box}
            >
              <Image
                className="absolute text-gray-600"
                src={circle}
                height={100}
                width={100}
                alt=""
                // animate={{
                //   rotate: 360,
                //   animationDuration: "10s",
                // }}
              />
            </motion.div>
            <Image src={logo} height={50} width={50} alt="logo" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Better Gondia Mitra</h1>
          <p className="whatsapp-gray text-sm">
            Choose your preferred language
          </p>
          <p className="whatsapp-gray text-sm mt-1">अपनी पसंदीदा भाषा चुनें</p>
          <p className="whatsapp-gray text-sm mt-1">तुमची आवडती भाषा निवडा</p>
        </div>

        <div className="space-y-3">
          <Button
            size="sm"
            variant="outline"
            className="w-full bg-green-50 border-green-400 text-green-700 hover:bg-green-100"
            onClick={() => onLanguageSelect("english")}
          >
            English
          </Button>

          <Button
            variant="outline"
            className="w-full bg-green-50 border-green-400 text-green-700 hover:bg-green-100"
            onClick={() => onLanguageSelect("hindi")}
          >
            हिंदी
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="w-full bg-green-50 border-green-400 text-green-700 hover:bg-green-100"
            onClick={() => onLanguageSelect("marathi")}
          >
            मराठी
          </Button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs whatsapp-gray">
            You can change language anytime in settings
          </p>
        </div>
      </div>
    </div>
  );
}
