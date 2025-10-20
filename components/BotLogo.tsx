import logo from "@/public/logo.svg";
import Image from "next/image";

export const BotLogo = () => {
  return (
    <div className="w-8 h-8 bg-white  rounded-full flex items-center justify-center flex-shrink-0 m-2">
      <Image src={logo} height={50} width={50} alt="logo" className="p-0.5" />
    </div>
  );
};
