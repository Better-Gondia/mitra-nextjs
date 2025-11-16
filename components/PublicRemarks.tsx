"use client";

import { Remark } from "@/types";
import { formatTimeAgo } from "@/lib/clientUtils";
import { MessageSquare, User, Shield } from "lucide-react";
import { Badge } from "./ui/badge";
import { translate } from "@/lib/translator";
import { useLanguage } from "@/store/language";

interface PublicRemarksProps {
  remarks: Remark[];
  className?: string;
}

export function PublicRemarks({ remarks, className = "" }: PublicRemarksProps) {
  const language = useLanguage((state) => state.language);

  if (!remarks || remarks.length === 0) {
    return null;
  }

  const getRoleBadgeColor = (role: string) => {
    if (role === "ADMIN" || role === "SUPERADMIN") {
      return "bg-purple-100 text-purple-700 border-purple-200";
    }
    if (role?.includes("COLLECTOR") || role?.includes("DISTRICT")) {
      return "bg-blue-100 text-blue-700 border-blue-200";
    }
    if (
      role?.includes("DEPARTMENT") ||
      role?.includes("PWD") ||
      role?.includes("HEALTH")
    ) {
      return "bg-orange-100 text-orange-700 border-orange-200";
    }
    return "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getRoleDisplayName = (role: string) => {
    if (role === "ADMIN" || role === "SUPERADMIN") {
      return "Admin";
    }
    if (role?.includes("COLLECTOR")) {
      return "Collector Office";
    }
    if (role?.includes("DEPARTMENT")) {
      return "Department";
    }
    return role?.replace(/_/g, " ") || "Official";
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
        <MessageSquare className="w-4 h-4 text-blue-600" />
        <span>
          {translate("public_remarks", language)} ({remarks.length})
        </span>
      </div>

      <div className="space-y-3">
        {remarks.map((remark) => (
          <div
            key={remark.id}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                {remark.user?.name?.[0]?.toUpperCase() || (
                  <User className="w-5 h-5" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="font-semibold text-gray-900 text-sm">
                    {remark.user?.name || "Official"}
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-xs px-2 py-0.5 ${getRoleBadgeColor(
                      remark.role
                    )}`}
                  >
                    <Shield className="w-3 h-3 mr-1 inline" />
                    {getRoleDisplayName(remark.role)}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {formatTimeAgo(remark.createdAt)}
                  </span>
                </div>

                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {remark.notes}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
