"use client";

import { useMessages } from "@/store/messages";
import { Complaint, Section, User, ChatMessage } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import { Button } from "./ui/button";
import { ComplaintCard } from "./ComplaintCard";
import { BookAlert, Plus } from "lucide-react";
import { useBot } from "@/store/bot";
import { useRefetch } from "@/store/refetch";
import { toast } from "sonner";
import { Spinner } from "./ui/spinner";
import { translate } from "@/lib/translator";
import { useLanguage } from "@/store/language";
import { apiRequest } from "@/lib/queryClient";

interface PaginatedComplaintsResponse {
  data: {
    complaints: Complaint[];
    count: number;
    totalCount: number;
    hasMore: boolean;
    currentPage: number;
    totalPages: number;
  };
}

export const AllChats = ({
  user,
}: {
  user?: string | null;
  handleSectionChange?: (sec: Section) => void;
}) => {
  const setMessages = useMessages((state) => state.setMessages);
  // const resetToInitial = useMessages((state) => state.resetToInitial);
  const setBotState = useBot((state) => state.setBotState);
  const language = useLanguage((state) => state.language);
  const { refetch, setRefetch } = useRefetch();
  const [allComplaints, setAllComplaints] = useState<Complaint[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const {
    data: complaintsData,
    isLoading,
    refetch: refetchData,
  } = useQuery<PaginatedComplaintsResponse>({
    queryKey: [`/api/complaints?userSlug=${user}&&fetch=my`],
    queryFn: async () => {
      const response = await apiRequest(
        "GET",
        `/api/complaints?userSlug=${user}&&fetch=my&&page=${currentPage}&&limit=10`
      );
      return response.json();
    },
  });

  useEffect(() => {
    if (complaintsData) {
      if (currentPage === 1) {
        setAllComplaints(complaintsData.data.complaints);
        setHasMore(complaintsData.data.hasMore);
      }
      //   } else {
      //     setAllComplaints((prev) => [
      //       ...prev,
      //       ...complaintsData.data.complaints,
      //     ]);
      //   }
      //   setHasMore(complaintsData.data.hasMore);
    }
  }, [complaintsData]);

  useEffect(() => {
    if (refetch) {
      setRefetch(false);
      setCurrentPage(1);
      refetchData();
    }
  }, [refetch]);

  const loadMoreComplaints = async () => {
    if (!hasMore || isLoadingMore) return;

    setIsLoadingMore(true);
    const nextPage = currentPage + 1;

    try {
      const response = await apiRequest(
        "GET",
        `/api/complaints?userSlug=${user}&&fetch=my&&page=${nextPage}&&limit=10`
      );
      const data = await response.json();

      setAllComplaints((prev) => [...prev, ...data.data.complaints]);
      setHasMore(data.data.hasMore);
      setCurrentPage(nextPage);
    } catch (error) {
      toast.error("Failed to load more complaints");
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleNavigateToChat = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Open WhatsApp with the specified phone number and "Hi" message
    const phoneNumber = "+917875441601";
    const message = "Hi";
    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/\+/g, "")}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  if (isLoading && currentPage === 1) {
    return <Spinner blur />;
  }

  return (
    <>
      {/* Header */}
      <div className="bg-white text-gray-700 px-4 py-2.5 flex items-center  sticky top-0 z-10  justify-between">
        <div className="font-semibold text-md flex gap-1.5 justify-center align-middle">
          <BookAlert className="mt-0.5" />
          <span>{translate("my_complaints", language)}</span>
        </div>
        {allComplaints && allComplaints.length > 0 && (
          <Button
            className="bg-[#075E54] hover:bg-[#0f5a51]  transition-colors shadow-md text-white"
            onClick={handleNavigateToChat}
          >
            <Plus /> {translate("new_complaint", language)}
          </Button>
        )}
      </div>
      <div className="max-w-11/12 mx-auto text-gray-700  min-h-[85dvh] flex flex-col bg-[#E5DDD5]  rounded-lg">
        {/* Complaints List */}
        {allComplaints && allComplaints.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-16">
            <div className="text-7xl mb-4 animate-bounce">📋</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {translate("no_complaints_yet", language)}
            </h3>
            <p className="text-gray-500 mb-6 text-center max-w-xs">
              {translate("submit_first_complaint", language)}
            </p>

            <Button
              className="bg-[#075E54] hover:bg-[#0f5a51]  transition-colors shadow-md text-white"
              onClick={handleNavigateToChat}
            >
              <Plus /> {translate("new_complaint", language)}
            </Button>
          </div>
        ) : (
          <ScrollArea className="h-[82dvh] py-1.5 ">
            {allComplaints?.map((complaint: Complaint) => (
              <ComplaintCard complaint={complaint} key={complaint.id} />
            ))}
            <div className="my-2" />
            {hasMore ? (
              <div className="w-full flex justify-center p-4 my-5 mb-20">
                <Button
                  className="w-9/12 bg-[#075E54] text-white hover:bg-[#075E54]"
                  onClick={loadMoreComplaints}
                  disabled={isLoadingMore}
                >
                  {isLoadingMore
                    ? translate("loading_more_complaints", language)
                    : translate("load_more", language)}
                </Button>
              </div>
            ) : (
              <div className="my-28" />
            )}
            <ScrollBar orientation="vertical" color="black" />
          </ScrollArea>
        )}
      </div>
    </>
  );
};
