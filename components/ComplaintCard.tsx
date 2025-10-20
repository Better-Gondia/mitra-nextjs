"use client";

import {
  cn,
  formatTimeAgo,
  generateComplaintIdFromDate,
  getCategoryIcon,
  getStatusColor,
} from "@/lib/clientUtils";
import { Complaint, MediaObject } from "@/types";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader } from "./ui/card";
import {
  MapPin,
  Calendar,
  Image as ImageIcon,
  Video,
  File,
  Users,
  MessageSquare,
  Eye,
  EyeOff,
  Building2,
  MapPinIcon,
} from "lucide-react";
import { useState } from "react";

interface ComplaintCardProps {
  complaint: Complaint;
  handleOpenExistingChat?: (complaint: Complaint) => void;
}

export const ComplaintCard = ({ complaint }: ComplaintCardProps) => {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number | null>(
    null
  );

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
        return "🔓";
      case "assigned":
        return "👤";
      case "in_progress":
        return "⚡";
      case "resolved":
        return "✅";
      case "backlog":
        return "📋";
      case "need_details":
        return "❓";
      case "invalid":
        return "❌";
      default:
        return "📝";
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-700 border-red-200";
      case "normal":
      default:
        return "bg-blue-100 text-blue-700 border-blue-200";
    }
  };

  const getMediaIcon = (media: MediaObject) => {
    switch (media.type) {
      case "image":
        return <ImageIcon className="w-4 h-4" />;
      case "video":
        return <Video className="w-4 h-4" />;
      default:
        return <File className="w-4 h-4" />;
    }
  };

  const formatMediaSize = (filename: string) => {
    // Truncate filename if too long
    if (filename.length > 15) {
      const extension = filename.split(".").pop();
      const nameWithoutExt = filename.substring(0, filename.lastIndexOf("."));
      return nameWithoutExt.substring(0, 12) + "...." + extension;
    }
    return filename;
  };

  const truncateText = (text: string, maxLength: number = 170) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <Card className="w-full max-w-md mx-auto my-3 shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50">
      <CardHeader className="pb-3">
        {/* Primary Header - Complaint ID as main identifier */}
        <div className="">
          <div className="flex items-center justify-between ">
            <div className="flex items-center gap-3">
              {/* <span className="text-2xl">
                {getCategoryIcon(complaint.category || "general")}
              </span> */}
              <div>
                <h2 className="text-lg font-bold text-gray-900 font-mono">
                  {generateComplaintIdFromDate(
                    complaint.id,
                    complaint.createdAt
                  )}
                </h2>
                <p className="text-xs text-gray-500">
                  {formatTimeAgo(complaint.createdAt)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex flex-col gap-1">
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-700 border-green-200 text-xs"
                >
                  {complaint.category || "General"}
                </Badge>
                {complaint.subcategory && (
                  <Badge
                    variant="outline"
                    className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                  >
                    {complaint.subcategory}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Title if available */}
        {complaint.title && (
          <div className="mb-2">
            <h3 className="font-semibold text-gray-900 text-sm">
              {complaint.title}
            </h3>
          </div>
        )}

        {/* Status, Priority and Type */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              className={cn(
                "px-3 py-1.5 text-xs font-semibold",
                getStatusColor(complaint.status)
              )}
            >
              {getStatusIcon(complaint.status)}{" "}
              {complaint.status.replace("_", " ").toUpperCase()}
            </Badge>

            {/* Priority badge */}
            {complaint.priority && (
              <Badge
                className={cn(
                  "px-2 py-1 text-xs font-medium",
                  getPriorityColor(complaint.priority)
                )}
              >
                {complaint.priority === "HIGH" ? "🔴" : "🟡"}{" "}
                {complaint.priority}
              </Badge>
            )}

            {/* Type badge (Complaint/Suggestion) */}
            {complaint.type && (
              <Badge
                variant="outline"
                className="text-xs bg-purple-50 text-purple-700 border-purple-200"
              >
                {complaint.type === "SUGGESTION" ? "💡" : "⚠️"} {complaint.type}
              </Badge>
            )}
          </div>

          {/* Co-sign count if available */}
          {complaint.coSignCount > 0 && (
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <Users className="w-3 h-3" />
              <span>{complaint.coSignCount}</span>
            </div>
          )}
        </div>

        {/* <CardContent className="pt-0 space-y-4"> */}
        {/* Description */}
        <div className="mt-3">
          <p className="text-gray-700 text-sm leading-relaxed">
            {showFullDescription
              ? complaint.description
              : truncateText(complaint.description ?? "")}
          </p>
          {complaint.description && complaint.description.length > 120 && (
            <Button
              variant="ghost"
              size="sm"
              className="p-0 h-auto text-xs text-blue-600 hover:text-blue-800"
              onClick={() => setShowFullDescription(!showFullDescription)}
            >
              {showFullDescription ? "Show less" : "Show more"}
            </Button>
          )}
        </div>

        {/* Location and Department Info */}
        <div className="space-y-2 mt-3">
          {complaint.location && (
            <div className="flex items-start gap-2 bg-gray-50 rounded-lg">
              <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-gray-600 flex-1">
                {complaint.location}
              </p>
            </div>
          )}

          {/* Department and Taluka */}
          {(complaint.department || complaint.taluka) && (
            <div className="flex flex-wrap gap-2">
              {complaint.department && (
                <Badge
                  variant="outline"
                  className="text-xs bg-orange-50 text-orange-700 border-orange-200"
                >
                  🏛️ {complaint.department.replace("_", " ")}
                </Badge>
              )}
              {complaint.taluka && (
                <Badge
                  variant="outline"
                  className="text-xs bg-teal-50 text-teal-700 border-teal-200"
                >
                  🏘️ {complaint.taluka}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Media Attachments */}
        {complaint.media && complaint.media.length > 0 && (
          <div className="space-y-2 ">
            <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
              <File className="w-3 h-3 text-gray-500" />
              <span>Attachments ({complaint.media.length})</span>
              {/* {!complaint.isMediaApproved && (
                <Badge variant="outline" className="text-xs px-2 py-0.5">
                  <EyeOff className="w-3 h-3 mr-1" />
                  Pending Approval
                </Badge>
              )} */}
            </div>

            <div className="flex gap-2">
              {complaint.media.map((media, index) => (
                <div
                  key={index}
                  className="relative group cursor-pointer"
                  onClick={() => setSelectedMediaIndex(index)}
                >
                  <div className="aspect-video bg-white from-gray-50 to-gray-100 rounded-lg  flex items-center justify-center hover:border-gray-300 hover:shadow-md transition-all duration-200">
                    {media.type === "image" ? (
                      <div className="text-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center  mx-auto">
                          <ImageIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        {/* <p className="text-xs text-gray-600 font-medium">
                          Photo
                        </p> */}
                      </div>
                    ) : media.type === "video" ? (
                      <div className="text-center">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center  mx-auto">
                          <Video className="w-6 h-6 text-red-600" />
                        </div>
                        {/* <p className="text-xs text-gray-600 font-medium">
                          Video
                        </p> */}
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                          <File className="w-6 h-6 text-green-600" />
                        </div>
                        {/* <p className="text-xs text-gray-600 font-medium">
                          Document
                        </p> */}
                      </div>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-transparent bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all duration-200 flex items-center justify-center">
                    <div className="bg-white bg-opacity-90 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Eye className="w-4 h-4 text-gray-700" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Media preview modal */}
            {selectedMediaIndex !== null &&
              complaint.media &&
              complaint.media[selectedMediaIndex] && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden">
                    <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Media Preview
                        </h3>
                        <p className="text-sm text-gray-600">
                          {complaint.media[selectedMediaIndex].filename}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedMediaIndex(null)}
                        className="hover:bg-gray-200"
                      >
                        ✕
                      </Button>
                    </div>
                    <div className="p-4 max-h-[70vh] overflow-auto">
                      {complaint.media[selectedMediaIndex].type === "image" ? (
                        <div className="text-center">
                          <img
                            src={complaint.media[selectedMediaIndex].url}
                            alt={complaint.media[selectedMediaIndex].filename}
                            className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-lg mx-auto"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                              target.nextElementSibling?.classList.remove(
                                "hidden"
                              );
                            }}
                          />
                          <div className="hidden bg-gray-100 rounded-lg p-8 mt-4">
                            <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">
                              Image preview unavailable
                            </p>
                          </div>
                        </div>
                      ) : complaint.media[selectedMediaIndex].type ===
                        "video" ? (
                        <div className="text-center">
                          <video
                            src={complaint.media[selectedMediaIndex].url}
                            controls
                            className="max-w-full max-h-[60vh] rounded-lg shadow-lg mx-auto"
                            onError={(e) => {
                              const target = e.target as HTMLVideoElement;
                              target.style.display = "none";
                              target.nextElementSibling?.classList.remove(
                                "hidden"
                              );
                            }}
                          >
                            Your browser does not support the video tag.
                          </video>
                          <div className="hidden bg-gray-100 rounded-lg p-8 mt-4">
                            <Video className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">
                              Video preview unavailable
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="bg-gray-100 rounded-lg p-8">
                            <File className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-500 mb-4">
                              {complaint.media[
                                selectedMediaIndex
                              ].type.toUpperCase()}{" "}
                              file
                            </p>
                            <Button
                              onClick={() =>
                                window.open(
                                  complaint.media?.[selectedMediaIndex].url,
                                  "_blank"
                                )
                              }
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              Download File
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
          </div>
        )}

        {/* Footer Info */}
        {/* <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
            </div>
            {complaint.isPublic ? (
              <div className="flex items-center gap-1 text-green-600">
                <Eye className="w-3 h-3" />
                <span>Public</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-orange-600">
                <EyeOff className="w-3 h-3" />
                <span>Private</span>
              </div>
            )}
            {complaint.reportCount && complaint.reportCount > 0 && (
              <div className="flex items-center gap-1 text-red-600">
                <span>⚠️</span>
                <span>{complaint.reportCount} reports</span>
              </div>
            )}
          </div>

          {complaint.isCoSigned && (
            <Badge
              variant="outline"
              className="text-xs bg-blue-50 text-blue-700 border-blue-200"
            >
              <Users className="w-3 h-3 mr-1" />
              Co-signed
            </Badge>
          )}
        </div> */}
        {/* </CardContent>
         */}
      </CardHeader>
    </Card>
  );
};
