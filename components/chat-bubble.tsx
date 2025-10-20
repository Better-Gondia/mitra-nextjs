import { BotLogo } from "./BotLogo";

export const ChatBubble = () => {
  return (
    <div className="flex items-start space-x-2 mb-8">
      <BotLogo />
      <div className="bg-white chat-bubble-left p-3 shadow-md relative">
        <div className="flex space-x-1 items-center py-1">
          <div className="w-2 h-2 bg-gray-500 rounded-full typing-indicator"></div>
          <div
            className="w-2 h-2 bg-gray-500 rounded-full typing-indicator"
            style={{ animationDelay: "0.2s" }}
          ></div>
          <div
            className="w-2 h-2 bg-gray-500 rounded-full typing-indicator"
            style={{ animationDelay: "0.4s" }}
          ></div>
        </div>
        {/* <div className="absolute -bottom-1 -left-1 w-0 h-0 border-r-[8px] border-r-white border-b-[8px] border-b-transparent"></div> */}
      </div>
    </div>
  );
};
