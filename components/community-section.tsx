import React, { useEffect, useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  User,
  Complaint,
  Visibility,
  CoSignVars,
  ReportVars,
  ReportReason,
  Section,
  ChatMessage,
} from "@/types";
import { Users, Search, Filter, X, LoaderCircle } from "lucide-react";
import { CommunityComplaintCard } from "./CommunityComplaintCard";
import { useSession } from "next-auth/react";
import { appSession } from "@/lib/auth";
import { Spinner } from "./ui/spinner";
// import { useLoaderStore } from "@/store/loader";
import { toast } from "sonner";
import { useModal } from "@/store/modal";
import { generateComplaintIdFromDate } from "@/lib/clientUtils";
import { useCompId } from "@/store/compId";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { translate } from "@/lib/translator";
import { useLanguage } from "@/store/language";
import { useMessages } from "@/store/messages";
import { useBot } from "@/store/bot";
import { useUserData } from "@/store/userData";

interface CommunitySectionProps {
  user?: string | null;
  handleSectionChange?: (sec: Section) => void;
}

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

// Common talukas in Gondia district
const TALUKA_OPTIONS = [
  "Gondia",
  "Goregaon",
  "Tirora",
  "Amgaon",
  "Arjuni Morgaon",
  "Deori",
  "Salekasa",
  "Sadak Arjuni",
  "All Talukas"
];

export default function CommunitySection({
  user,
  handleSectionChange,
}: CommunitySectionProps) {
  const session = useSession() as unknown as appSession;
  const setIsOpen = useModal((state) => state.setIsOpen);
  const compId = useCompId((state) => state.compId);
  const language = useLanguage((state) => state.language);
  const setMessages = useMessages((state) => state.setMessages);
  const setBotState = useBot((state) => state.setBotState);
  const { isAuthenticated } = useUserData();

  // For this app, if we have a user parameter, we consider the user authenticated
  const isUserAuthenticated = isAuthenticated || !!user;

  // Debug authentication state
  console.log(
    "CommunitySection - isAuthenticated:",
    isAuthenticated,
    "user:",
    user,
    "isUserAuthenticated:",
    isUserAuthenticated
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [allComplaints, setAllComplaints] = useState<Complaint[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // Filter and search states
  const [selectedTaluka, setSelectedTaluka] = useState<string>("All Talukas");
  const [searchInput, setSearchInput] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearching, setIsSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const { data: complaintsData, isLoading } =
    useQuery<PaginatedComplaintsResponse>({
      queryKey: ["/api/complaints", user, selectedTaluka, searchQuery, currentPage],
      queryFn: async () => {
        const params = new URLSearchParams({
          userSlug: user || "",
          fetch: "all",
          page: currentPage.toString(),
          limit: "10",
          ...(compId && { compId: compId.toString() }),
          ...(selectedTaluka !== "All Talukas" && { taluka: selectedTaluka }),
          ...(searchQuery && { search: searchQuery }),
        });
        
        const response = await apiRequest(
          "GET",
          `/api/complaints?${params.toString()}`
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
      // else {
      //   setAllComplaints((prev) => [
      //     ...prev,
      //     ...complaintsData.data.complaints,
      //   ]);
      // }
    }
  }, [complaintsData]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTaluka, searchQuery]);

  // Search handler
  const handleSearch = () => {
    setIsSearching(true);
    setSearchQuery(searchInput); // Only update the actual search query when button is clicked
    setCurrentPage(1);
    // The query will automatically refetch due to dependency change
    setTimeout(() => setIsSearching(false), 1000);
  };

  // Filter handler
  const handleTalukaFilter = (taluka: string) => {
    setSelectedTaluka(taluka);
    setCurrentPage(1);
  };

  const toggleVisibility = useMutation({
    mutationFn: async ({
      complaintId,
      value,
      type,
    }: {
      complaintId: number;
      value: boolean;
      type: Visibility;
    }) => {
      const id = toast.loading("Changing Visibility...");

      const response = await fetch("/api/visibility", {
        method: "PATCH",
        body: JSON.stringify({ complaintId, value, type }),
        credentials: "include",
      });
      if (!response.ok) {
        toast.error("Something went wrong !!", { id });
        throw new Error("Failed to create complaint");
      }
      toast.success("Done !!", { id });
      return response.json();
    },
  });

  const queryClient = useQueryClient();

  const coSignMutation = useMutation({
    mutationFn: async ({
      userSlug,
      shouldApprove,
      complaintId,
    }: CoSignVars) => {
      const id = toast.loading(
        shouldApprove ? "Co - Signing Complaint..." : "Removing Co - Sign"
      );
      const response = await apiRequest(
        "POST",
        `/api/complaints/${complaintId}/co-sign`,
        { userSlug, shouldApprove, complaintId }
      );
      toast.success(
        shouldApprove ? "Co - Sign Successfull!!" : "Removed Successfully!!",
        { id }
      );

      return response.json();
    },

    onMutate: async ({ shouldApprove, complaintId, userSlug }) => {
      const queryKey = ["/api/complaints", userSlug];

      await queryClient.cancelQueries({ queryKey });

      const prevData = queryClient.getQueryData<{
        data: { complaints: Complaint[] };
      }>(queryKey);

      queryClient.setQueryData(
        queryKey,
        (old: { data: { complaints: Complaint[] } }) => {
          if (!old) return old;

          const updatedComplaints = old.data.complaints.map((c) =>
            c.id === complaintId
              ? {
                  ...c,
                  isCoSigned: shouldApprove,
                  coSignCount:
                    c.coSignCount +
                    (shouldApprove && !c.isCoSigned
                      ? 1
                      : !shouldApprove && c.isCoSigned
                        ? -1
                        : 0),
                }
              : c
          );

          return { ...old, data: { complaints: updatedComplaints } };
        }
      );

      return { prevData, queryKey };
    },

    onError: (err, _vars, context) => {
      console.error("Co-sign mutation error:", err);
      toast.error("Failed to co-sign complaint");
      if (context?.prevData) {
        queryClient.setQueryData(context.queryKey, context.prevData);
      }
    },

    onSettled: () => {
      // No refetching, as requested
    },
  });

  // Report mutation
  const reportMutation = useMutation({
    mutationFn: async ({
      userSlug,
      complaintId,
      reportReason,
      text,
    }: ReportVars) => {
      const response = await apiRequest(
        "POST",
        `/api/complaints/${complaintId}/report`,
        { userSlug, complaintId, reportReason, text }
      );
      return response.json();
    },
    onMutate: async ({ userSlug, complaintId, reportReason, text }) => {
      const queryKey = ["/api/complaints", userSlug];

      await queryClient.cancelQueries({ queryKey });

      const prevData = queryClient.getQueryData<{
        data: { complaints: Complaint[] };
      }>(queryKey);
      toast.success("Complaint reported.");

      queryClient.setQueryData(
        queryKey,
        (old: { data: { complaints: Complaint[] } }) => {
          if (!old) return old;

          const updatedComplaints = old.data.complaints.map((c) =>
            c.id === complaintId
              ? {
                  ...c,
                  isReported: true,
                }
              : c
          );

          return { ...old, data: { complaints: updatedComplaints } };
        }
      );

      return { prevData, queryKey };
    },
    onSuccess: (_data, { complaintId }) => {
      // queryClient.invalidateQueries({ queryKey: ["/api/complaints", user] });
    },
    onError: () => {
      // toast.error("Failed to report complaint.");
    },
  });

  const loadMoreComplaints = async () => {
    if (!hasMore || isLoadingMore) return;

    setIsLoadingMore(true);
    const nextPage = currentPage + 1;

    try {
      const response = await apiRequest(
        "GET",
        `/api/complaints?userSlug=${user}&&fetch=all${
          compId ? `&&compId=${compId}` : ""
        }&&page=${nextPage}&&limit=10`
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

  const handleCoSign = (complaintId: number) => {
    console.log("handleCoSign called with:", {
      complaintId,
      isAuthenticated,
      isUserAuthenticated,
      user,
    });

    if (!isUserAuthenticated || !user) {
      toast.error("Please login to co-sign complaints");
      return;
    }

    const complaint = allComplaints.find((c) => c.id === complaintId);
    const shouldApprove = !complaint?.isCoSigned;

    console.log("Co-sign details:", {
      complaint: complaint?.id,
      isCoSigned: complaint?.isCoSigned,
      shouldApprove,
    });

    coSignMutation.mutate({
      complaintId,
      userSlug: user,
      shouldApprove,
    });
  };

  const handleToggleVisibility = (
    complaintId: number,
    value: boolean,
    type: Visibility
  ) => {
    toggleVisibility.mutate({ complaintId, value, type });
  };

  const handleReport = (complaintId: number, createdAt: string) => {
    if (!isUserAuthenticated || !user) {
      toast.error("Please login to report complaints");
      return;
    }
    setIsOpen(true, "Report", {
      complaintId: generateComplaintIdFromDate(complaintId, createdAt),
      confirmationFunction: (reportReason: string, text?: string) => {
        console.log("Reporting with ::::::: ", {
          userSlug: user,
          complaintId,
          reportReason: reportReason as ReportReason,
          text,
        });

        user &&
          reportMutation.mutate({
            userSlug: user,
            complaintId,
            reportReason: reportReason as ReportReason,
            text,
          });
      },
    });
  };

  const handleOpenExistingChat = (complaint: Complaint) => {
    try {
      if (!handleSectionChange) {
        toast.error("Navigation not available");
        return;
      }

      // Messages functionality removed

      // Check if user is admin and set appropriate state
      const isUserAdmin =
        session?.data?.user?.role === "ADMIN" ||
        session?.data?.user?.role === "SUPERADMIN";
      setBotState({
        step: isUserAdmin ? "admin" : "existing",
        complaintData: complaint,
      });
    } catch (e) {
      console.log("Error occurred", e);
      toast.error("Failed to open chat");
    }
  };

  // const getStatusColor = (status: string) => {
  //   const colors: Record<string, string> = {
  //     submitted: "bg-blue-100 text-blue-800",
  //     forwarded: "bg-yellow-100 text-yellow-800",
  //     resolved: "bg-green-100 text-green-800",
  //   };
  //   return colors[status] || "bg-gray-100 text-gray-800";
  // };

  // const getInitials = (firstName: string, lastName: string) => {
  // const getInitials = (name: string) => {
  //   const names = name.split(" ");
  //   return `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase();
  // };

  if (isLoading && currentPage === 1 && selectedTaluka === "All Talukas" && searchQuery === "") {
    return <Spinner blur />;
  }

  console.log("complaints ===== ", allComplaints);

  return (
    <div className="h-full flex flex-col">
      {/* Community Header */}
      <div className="bg-white px-4 py-2.5 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold ">
              {translate("gondia_public_wall", language)}
            </h2>
            <p className="text-sm ">
              {translate("see_what_others_are_reporting", language)}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            {showFilters ? translate("hide_filters", language) : translate("show_filters", language)}
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      {showFilters && (
        <div className="bg-white px-4 py-3 border-b border-gray-200 space-y-3">
          <div className="flex flex-col gap-3">
            {/* Taluka Filter */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {translate("filter_by_taluka", language)}
              </label>
              <Select value={selectedTaluka} onValueChange={handleTalukaFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={translate("select_taluka", language)} />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {TALUKA_OPTIONS.map((taluka) => (
                    <SelectItem key={taluka} value={taluka}>
                      {taluka === "All Talukas" ? translate("all_talukas", language) : taluka}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {translate("search_complaints", language)}
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder={translate("search_placeholder", language)}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                  className="flex-1"
                />
                <Button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="bg-[#075E54] text-white hover:bg-[#075E54]/90"
                >
                  {isSearching ? (
                    <LoaderCircle  className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Active Filters Display */}
          {(selectedTaluka !== "All Talukas" || searchQuery) && (
            <div className="flex flex-wrap gap-2">
              {selectedTaluka !== "All Talukas" && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 p-1">
                  {translate("filter_by_taluka", language)}: {selectedTaluka}
                  <button
                    onClick={() => handleTalukaFilter("All Talukas")}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {searchQuery && (
                <Badge variant="secondary" className="bg-green-100 text-green-800 p-1">
                  {translate("search_complaints", language)}: "{searchQuery}"
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSearchInput("");
                      setCurrentPage(1);
                    }}
                    className="ml-1 text-green-600 hover:text-green-800"
                  >
                    <X className="w-3 h-3 " />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>
      )}

      {/* Community Feed */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-4 p-4">
          {isLoading ? <LoaderCircle className="w-10 h-10 animate-spin absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-500" /> : allComplaints.map((complaint) => (
            <CommunityComplaintCard
              key={complaint.id}
              complaint={complaint}
              handleCoSign={handleCoSign}
              isLoading={coSignMutation.isPending}
              handleToggleVisibility={handleToggleVisibility}
              handleReport={handleReport}
              role={session?.data?.user?.role ?? "USER"}
              isShared={false}
              handleOpenExistingChat={handleOpenExistingChat}
              isAuthenticated={isUserAuthenticated}
            />
          ))}

          {(!allComplaints || allComplaints.length === 0) && !isLoading && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">
                {translate("no_public_complaints", language)}
              </h3>
              <p className="text-gray-500 text-sm">
                {translate("be_first_to_share", language)}
              </p>
            </div>
          )}
        </div>

        {hasMore && allComplaints.length > 0 ? (
          <div className="w-full flex justify-center">
            <Button
              className="w-9/12 m-auto my-5 mb-8  bg-[#075E54] text-white hover:bg-[#075E54]"
              onClick={loadMoreComplaints}
              disabled={isLoadingMore}
            >
              {isLoadingMore
                ? translate("loading_more_complaints", language)
                : translate("load_more", language)}
            </Button>
          </div>
        ) : (
          <div className="my-16" />
        )}
      </div>
    </div>
  );
}
