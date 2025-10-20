"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { StatusUpdate } from "@/types";
import { X, ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { Spinner } from "./ui/spinner";
import { useSession } from "next-auth/react";
import { cn, isAdmin } from "@/lib/clientUtils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { appSession } from "@/lib/auth";
import { storeFileInS3 } from "@/app/actions/s3";
import { translate } from "@/lib/translator";
import { useLanguage } from "@/store/language";

export default function StatusSection() {
  const [selectedStatus, setSelectedStatus] = useState<StatusUpdate | null>(
    null
  );
  const [progress, setProgress] = useState(0); // 0 to 100
  const [isPaused, setIsPaused] = useState(false);
  // const [currentStatusIndex, setCurrentStatusIndex] = useState(0);

  const [currentIndex, setCurrentIndex] = useState(0);
  const session = useSession() as unknown as appSession;
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    imageUrl: "",
    videoUrl: "",
    file: null as File | null,
  });
  const [submitting, setSubmitting] = useState(false);
  const language = useLanguage((state) => state.language);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [duration, setDuration] = useState<number | null>(null);

  useEffect(() => {
    console.log("vide use eff ::::");
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      console.log("vide duration:::::::::::: ", video.duration);
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [videoRef, selectedStatus]);

  useEffect(() => {
    if (isPaused || !selectedStatus || selectedStatus.videoUrl) return;
    console.log("useEffect ran :::: ");
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          // setCurrentIndex((prev) => prev + 1);
          nextStatus();
          return 0; // Reset for next status
        }
        return prev + 1; // increase 1% every 50ms → 5s total
      });
    }, 50); // 50ms × 100 = 5s

    return () => clearInterval(interval);
  }, [isPaused, currentIndex, selectedStatus]);

  const { data: statusUpdates, isLoading } = useQuery<StatusUpdate[]>({
    queryKey: ["/api/status/updates"],
  });

  const addStatusMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/status/updates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to add status");
      return res.json();
    },
    onSuccess: () => {
      setShowAddModal(false);
      setForm({
        title: "",
        description: "",
        imageUrl: "",
        videoUrl: "",
        file: null,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/status/updates"] });
    },
  });

  const deleteStatusMutation = useMutation({
    mutationFn: async (statusId: number) => {
      const res = await fetch(`/api/status/updates?id=${statusId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/status/updates"] });
    },
  });

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  const openStatus = (status: StatusUpdate, index: number) => {
    setSelectedStatus(status);
    setCurrentIndex(index);
  };

  const closeStatus = () => {
    setSelectedStatus(null);
  };

  const handlePause = () => setIsPaused(true);
  const handleResume = () => setIsPaused(false);

  const handleDeleteStatus = (statusId: number) => {
    if (confirm("Are you sure you want to delete this status?")) {
      deleteStatusMutation.mutate(statusId);
    }
  };

  const nextStatus = () => {
    if (statusUpdates && currentIndex < statusUpdates.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setSelectedStatus(statusUpdates[nextIndex]);
    } else {
      setCurrentIndex(0);
      setSelectedStatus(null);
    }
  };

  const prevStatus = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      setSelectedStatus(statusUpdates![prevIndex]);
    }
  };

  // Handle file upload and set imageUrl
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm((f) => ({ ...f, file }));
      // Upload to S3 and get URL
      try {
        const url = await storeFileInS3(file);
        if (!url) throw new Error("Failed to upload image");

        const fileExtension = url.split(".").pop()?.toLowerCase();
        if (
          ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(
            fileExtension || ""
          )
        ) {
          setForm((f) => ({
            ...f,
            imageUrl: process.env.NEXT_PUBLIC_CLOUDFRONT_URL + "/" + url,
          }));
        } else if (
          ["mp4", "avi", "mov", "webm"].includes(fileExtension || "")
        ) {
          setForm((f) => ({
            ...f,
            videoUrl: process.env.NEXT_PUBLIC_CLOUDFRONT_URL + "/" + url,
          }));
        }
      } catch (err) {
        alert("Image upload failed");
      }
    }
  };

  if (isLoading) {
    return (
      <Spinner text="Loading status updates" blur />
      // <div className="h-full flex items-center justify-center">
      //   <div className="text-center">
      //     <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
      //     <p className="text-gray-500">Loading status updates...</p>
      //   </div>
      // </div>
    );
  }

  return (
    <>
      <div className="h-full flex flex-col">
        {/* Status Header */}
        <div className="bg-white px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="font-semibold ">{translate("status", language)}</h2>
            <p className="text-sm whatsapp-gray">
              {translate("stay_updated_with_better_gondia", language)}
            </p>
          </div>
          {/* {isAdmin(session.data?.user?.role) && (
            <Button size="sm" onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4 mr-1" /> Add Status
            </Button>
          )} */}
        </div>

        {/* Status Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Status Stories */}
          <div className="flex gap-5 mb-6">
            {/* My Status */}
            {isAdmin(session.data?.user?.role) && (
              <Button
                className="flex flex-col items-center status-ring-viewed w-16 h-16 mb-2 rounded-full p-0"
                onClick={() => setShowAddModal(true)}
              >
                {/* <div className="status-ring-viewed w-16 h-16"> */}
                <div className=" bg-gray-200 w-16 h-16 rounded-full flex items-center justify-center m-0">
                  <Plus className="w-10 h-10 text-gray-500" size={50} />
                </div>
                {/* </div> */}
              </Button>
            )}

            {/* Admin Status Updates */}
            {statusUpdates?.map((status, index) => (
              <div
                key={status.id}
                className="flex flex-col items-center cursor-pointer relative"
                onClick={() => openStatus(status, index)}
              >
                <div className="status-ring-viewed border-2 border-green-500 w-16 h-16 mb-2">
                  <img
                    src={
                      status.imageUrl ||
                      "https://d2jow4rnitzfmr.cloudfront.net/e2c40e62-f8c3-44f0-bb48-d6258079243c_logopng.png"
                    }
                    alt={status.title}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                {/* Delete button for admins */}
                {isAdmin(session.data?.user?.role) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteStatus(status.id);
                    }}
                    className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center transition-colors"
                    title="Delete status"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
                {/* <p className="text-xs  text-center">
                  {status.title.slice(0, 10)}...
                </p> */}
              </div>
            ))}
          </div>

          {/* Recent Updates */}
          <div className="space-y-4">
            <h3 className="font-medium ">Recent Updates</h3>

            {statusUpdates?.map((update) => (
              <div
                key={update.id}
                className="bg-white rounded-lg p-4 border border-gray-200 relative"
              >
                {/* Delete button for admins */}
                {isAdmin(session.data?.user?.role) && (
                  <button
                    onClick={() => handleDeleteStatus(update.id)}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 w-8 h-8 flex items-center justify-center transition-colors z-40"
                    title="Delete status"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 whatsapp-green rounded-full flex items-center justify-center">
                      <i className="fas fa-shield-alt text-white text-xs"></i>
                    </div>
                    <div>
                      <p className="font-medium text-sm ">Better Gondia</p>
                      <p className="text-xs whatsapp-gray">
                        {formatTimeAgo(update.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {update.imageUrl && (
                  <img
                    src={update.imageUrl}
                    alt={update.title}
                    className="w-full h-48 object-cover rounded-lg mb-3"
                  />
                )}

                {update.videoUrl && (
                  <video
                    ref={videoRef}
                    src={update.videoUrl}
                    controls
                    muted={false}
                    className="object-cover rounded-lg mb-3"
                    style={{ maxWidth: "100%", height: "auto" }}
                  />
                )}

                <p className="text-sm  mb-2">
                  <strong>{update.title}</strong>
                </p>
                {update.description && (
                  <p className="text-sm whatsapp-gray">{update.description}</p>
                )}
              </div>
            ))}

            {(!statusUpdates || statusUpdates.length === 0) && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-image text-gray-400 text-2xl"></i>
                </div>
                <h3 className="font-medium text-gray-900 mb-2">
                  No Status Updates
                </h3>
                <p className="text-gray-500 text-sm">
                  Check back later for civic updates and resolved complaints!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Viewer Modal */}
      {selectedStatus && (
        <div
          className="fixed inset-0 bg-black z-40"
          onMouseDown={handlePause}
          onMouseUp={handleResume}
          onTouchStart={handlePause}
          onTouchEnd={handleResume}
        >
          <div className="flex flex-col h-[100dvh]">
            {/* Status Header */}
            <div
              className={cn(
                "flex items-center justify-between p-2 text-white",
                selectedStatus.videoUrl && "absolute z-50 w-full"
              )}
            >
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeStatus}
                  className="p-2 text-white hover:bg-white hover:bg-opacity-10"
                >
                  <X className="w-6 h-6" />
                </Button>
                {/* Delete button for admins in modal */}
                {isAdmin(session.data?.user?.role) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      handleDeleteStatus(selectedStatus.id);
                      closeStatus();
                    }}
                    className="p-2 text-red-400 hover:bg-red-500 hover:bg-opacity-20"
                    title="Delete status"
                  >
                    <Trash2 className="w-6 h-6" />
                  </Button>
                )}
              </div>
              {!selectedStatus.videoUrl && (
                <div className="flex-1 mx-4">
                  {/* <div className="h-1 bg-gray-600 rounded-full">
                  <div className="h-1 bg-white rounded-full status-progress"></div>
                </div> */}
                  <div className="w-full h-1 bg-gray-300">
                    <div
                      className="h-1 bg-blue-500 transition-all duration-50"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={prevStatus}
                  disabled={currentIndex === 0}
                  className="p-2 text-white hover:bg-white hover:bg-opacity-10 disabled:opacity-50"
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={nextStatus}
                  disabled={
                    !statusUpdates || currentIndex === statusUpdates.length - 1
                  }
                  className="p-2 text-white hover:bg-white hover:bg-opacity-10 disabled:opacity-50"
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </div>
            </div>

            {/* Status Content */}
            <div className="flex-1 flex items-center justify-center">
              {selectedStatus.imageUrl && (
                <img
                  src={selectedStatus.imageUrl}
                  alt={selectedStatus.title}
                  className="max-w-full max-h-full object-contain"
                />
              )}
              {selectedStatus.videoUrl && (
                <video
                  ref={videoRef}
                  src={selectedStatus.videoUrl}
                  controls
                  autoPlay
                  className="object-cover rounded-lg mb-3"
                  style={{ maxWidth: "100%", height: "auto" }}
                />
              )}
              {/* // ) : (
              //   <div className="text-white text-center">
              //     <p className="text-lg">{selectedStatus.title}</p>
              //     {selectedStatus.description && (
              //       <p className="text-sm opacity-75 mt-2">
              //         {selectedStatus.description}
              //       </p>
              //     )}
              //   </div>
              // )} */}
            </div>

            {/* Status Footer */}
            <div className="p-4 text-white">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-8 h-8 whatsapp-green rounded-full flex items-center justify-center">
                  <i className="fas fa-shield-alt text-xs"></i>
                </div>
                <div>
                  <p className="font-medium text-sm">Better Gondia</p>
                  <p className="text-xs opacity-75">
                    {formatTimeAgo(selectedStatus.createdAt)}
                  </p>
                </div>
              </div>
              <div>{selectedStatus.title}</div>
              <div className="text-sm">{selectedStatus.description}</div>
            </div>
          </div>
        </div>
      )}
      {/* Add Status Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-40 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
              onClick={() => setShowAddModal(false)}
            >
              <X className="w-6 h-6" />
            </button>
            <h3 className="font-semibold mb-6 text-lg text-center">
              Add Status Update
            </h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setSubmitting(true);
                addStatusMutation.mutate(
                  {
                    title: form.title,
                    description: form.description,
                    imageUrl: form.imageUrl,
                    videoUrl: form.videoUrl,
                  },
                  { onSettled: () => setSubmitting(false) }
                );
              }}
              className="space-y-4"
            >
              <input
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Title"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                required
              />
              <textarea
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Description"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
              />
              <div>
                <label className="block mb-2 font-medium">Image</label>
                <input
                  type="file"
                  accept="image/*,video/*"
                  className="w-full border rounded-lg px-3 py-2"
                  onChange={handleFileChange}
                />
                {form.imageUrl && (
                  <div className="mt-3 flex justify-center max-h-40">
                    <img
                      src={form.imageUrl}
                      alt="Preview"
                      className="max-h-40 rounded-lg border"
                    />
                  </div>
                )}
                {form.videoUrl && (
                  <div className="mt-3 flex justify-center max-h-40">
                    <video src={form.videoUrl} controls />
                  </div>
                )}
              </div>
              <div className="flex gap-2 justify-end mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    submitting ||
                    !form.title ||
                    (!form.imageUrl && !form.videoUrl)
                  }
                >
                  {submitting ? "Adding..." : "Add"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
