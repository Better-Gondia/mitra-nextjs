import { Flag, Share2, ThumbsUp } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Complaint, Visibility } from "@/types";
import {
  formatTimeAgo,
  generateComplaintIdFromDate,
  getCategoryIcon,
  getStatusColor,
  isAdmin,
} from "@/lib/clientUtils";
import { Role } from "@prisma/client/index-browser";
import { useEffect, useState } from "react";
import { Checkbox } from "./Checkbox";
import { translate } from "@/lib/translator";
import { useLanguage } from "@/store/language";

interface CommunityComplaintCardProps {
  complaint: Complaint;
  handleCoSign: (id: number) => void;
  isLoading: boolean;
  handleToggleVisibility: (
    id: number,
    isApproved: boolean,
    type: Visibility
  ) => void;
  handleReport: (complaintId: number, createdAt: string) => void;
  role: Role;
  isShared: boolean;
  handleOpenExistingChat: (mess: Complaint) => void;
  isAuthenticated?: boolean;
}

export const CommunityComplaintCard = ({
  complaint,
  handleCoSign,
  isLoading,
  handleToggleVisibility,
  handleReport,
  role,
  isShared,
  handleOpenExistingChat,
  isAuthenticated = true,
}: CommunityComplaintCardProps) => {
  const [isComplaintVisible, setIsComplaintVisible] = useState(false);
  const [isMediaVisible, setIsMediaVisible] = useState(false);
  const language = useLanguage((state) => state.language);
  // const setIsOpen = useModal((state) => state.setIsOpen);

  const handleComplaintCheckbox = () => {
    handleToggleVisibility(complaint.id, !isComplaintVisible, "COMPLAINT");
    setIsComplaintVisible(!isComplaintVisible);
  };

  const handleMediaCheckbox = () => {
    handleToggleVisibility(complaint.id, !isMediaVisible, "MEDIA");
    setIsMediaVisible(!isMediaVisible);
  };

  useEffect(() => {
    setIsComplaintVisible(complaint.isPublic);
    setIsMediaVisible(complaint.isMediaApproved);
  }, []);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      roads: "bg-blue-100 text-blue-800",
      water: "bg-blue-100 text-blue-800",
      electricity: "bg-yellow-100 text-yellow-800",
      sanitation: "bg-purple-100 text-purple-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  // const { isOpen: modalOpen, setIsOpen: setModalOpen } = useModal();
  return (
    <div
      key={complaint.id}
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold text-sm">
                {/* {getInitials(user.name)} */}
                👤
              </span>
            </div>
            <div>
              <p className="font-medium text-sm ">
                {generateComplaintIdFromDate(complaint.id, complaint.createdAt)}
              </p>
              <p className="text-xs ">
                {/* Ward {Math.floor(Math.random() * 5) + 1} •{" "} */}
                {formatTimeAgo(complaint.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(complaint.status)}>
              {complaint.status === "resolved" ? "RESOLVED" : complaint.status}
            </Badge>
          </div>
        </div>

        {/* Complaint Media */}
        {(complaint.isMediaApproved ||
          role == "ADMIN" ||
          role == "SUPERADMIN") &&
          complaint.media &&
          complaint.media.map((item) => {
            if (item.type === "image") {
              return (
                <img
                  src={item.url}
                  key={item.url}
                  alt={`Complaint image - ${item.filename}`}
                  className=" object-cover rounded-lg mb-3"
                />
              );
            } else if (item.type === "video") {
              return (
                <video
                  key={item.url}
                  src={item.url}
                  controls
                  className="object-cover rounded-lg mb-3"
                  style={{ maxWidth: "100%", height: "auto" }}
                />
              );
            }
            return null;
          })}

        {/* Complaint Text */}
        <p className="text-sm  mb-3">{complaint.description}</p>

        {/* Location */}
        {complaint.location && (
          <p className="text-sm  mb-3">📍 {complaint.location}</p>
        )}

        {/* Resolved Update */}
        {/* {complaint.isResolved && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
          <p className="text-sm text-green-800">
            ✅ <strong>Update:</strong> This issue has been resolved
            by the concerned department.
          </p>
          <p className="text-xs text-green-600 mt-1">
            Resolved • {formatTimeAgo(complaint.resolvedAt!)}
          </p>
        </div>
      )} */}

        {/* Action Buttons */}
        <div className="flex flex-col  items-center justify-between">
          <div className="flex items-center justify-between w-full">
            {isAuthenticated ? (
              <Button
                variant={complaint.isCoSigned ? "outline" : "default"}
                size="sm"
                className={`flex items-center space-x-1 ${
                  complaint.isCoSigned
                    ? "border-green-600 text-green-600 bg-green-50 hover:bg-green-100"
                    : "bg-green-600 text-white hover:bg-green-700 shadow-sm"
                }`}
                onClick={() => {
                  console.log(
                    "Co-sign button clicked for complaint:",
                    complaint.id
                  );
                  handleCoSign(complaint.id);
                }}
                disabled={isLoading}
              >
                <ThumbsUp
                  className={`w-4 h-4 ${
                    complaint.isCoSigned
                      ? "fill-current text-green-600"
                      : "text-white"
                  }`}
                />
                <span className="text-sm font-medium">
                  {complaint.isCoSigned
                    ? translate("co_signed", language)
                    : translate("co_sign", language)}{" "}
                  ({complaint.coSignCount})
                </span>
              </Button>
            ) : (
              <div className="flex items-center space-x-1 text-gray-500 bg-gray-50 px-3 py-1.5 rounded-md">
                <ThumbsUp className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {translate("co_sign", language)} ({complaint.coSignCount})
                </span>
              </div>
            )}

            {isAuthenticated ? (
              complaint.isReported ? (
                <span className="text-sm text-gray-500 ml-2">
                  {translate("reported", language)} ☑️
                </span>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-0.5 text-gray-500 hover:text-red-500 hover:bg-red-50"
                  onClick={() =>
                    handleReport(complaint.id, complaint.createdAt)
                  }
                  disabled={isLoading}
                >
                  <Flag className="w-4 h-4" />
                  <span className="text-sm">
                    {translate("report", language)}
                  </span>
                </Button>
              )
            ) : null}
            <Badge className={getCategoryColor(complaint.category || "")}>
              {getCategoryIcon(complaint.category || "")}{" "}
              {complaint.category &&
              ["roads", "water", "electricity", "sanitation"].includes(
                complaint.category
              )
                ? translate(complaint.category as any, language)
                : complaint.category || "General"}
            </Badge>
          </div>
          {!isShared && (
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-3 bg-green-50 border-green-400 text-green-700 hover:bg-green-100"
              onClick={() =>
                window.open(
                  `https://api.whatsapp.com/send?text=${encodeURIComponent(
                    `Check out the complaint ${generateComplaintIdFromDate(
                      complaint.id,
                      complaint.createdAt
                    )} in Better Gondia Mitra. \n` +
                      process.env.NEXT_PUBLIC_BASE_URL +
                      "/" +
                      complaint.id
                  )}`,
                  "_blank"
                )
              }
            >
              {translate("share_on_whatsapp", language)} <Share2 />
            </Button>
          )}
        </div>
      </div>

      {isAdmin(role) && (
        <div className="bg-red-100 border-red-300 text-red-700 p-3 flex flex-col">
          <div className="tracking-wide ">Admin Controls</div>
          <div className="w-full flex justify-between">
            <Checkbox
              key={1}
              checked={isComplaintVisible}
              onChange={handleComplaintCheckbox}
              label="Complaint Visibility"
              className="w-1/2"
            />
            <Checkbox
              key={2}
              checked={isMediaVisible}
              onChange={handleMediaCheckbox}
              label="Media Visibility"
              className="w-1/2"
            />
          </div>
          {/* <Button onClick={() => handleOpenExistingChat(complaint)}>
            Reply in Chat
          </Button> */}
        </div>
      )}
    </div>
  );
};
