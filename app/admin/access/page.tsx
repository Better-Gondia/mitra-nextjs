"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "nextjs-toploader/app";
import { AdminDropdown } from "@/components/admin/AdminDropdown";
import { appSession } from "@/lib/auth";

interface User {
  id: number;
  name: string;
  email?: string;
  role: "USER" | "ADMIN" | "SUPERADMIN";
  authType: "GOOGLE" | "DETAILS";
}

export default function AdminAccessPage() {
  const session = useSession() as unknown as appSession;
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // Get current user's ID
  const currentUserId = session.data?.user?.id
    ? parseInt(session.data.user.id)
    : null;

  useEffect(() => {
    if (session.status === "loading") return;
    const userRole = session.data?.user?.role;
    if (
      session.status !== "authenticated" ||
      !userRole ||
      userRole !== "SUPERADMIN"
    ) {
      router.replace("/");
    }
  }, [session.status, router]);

  useEffect(() => {
    if (session.status !== "authenticated") return;
    setLoading(true);
    // const id = toast.loading("Loading users...");
    fetch("/api/auth/user")
      .then((res) => res.json())
      .then((data) => {
        setUsers(data?.users || []);
        setLoading(false);
        // toast.success("Users loaded", { id });
      })
      .catch(() => {
        // toast.error("Failed to fetch users", { id });
        setLoading(false);
      });
  }, [session.status]);

  const handleRoleChange = async (
    id: number,
    newRole: "USER" | "ADMIN" | "SUPERADMIN"
  ) => {
    // Prevent changing to SUPERADMIN
    if (newRole === "SUPERADMIN") {
      toast.error("Cannot change role to SUPERADMIN");
      return;
    }

    // Prevent changing own role
    if (currentUserId && id === currentUserId) {
      toast.error("Cannot change your own role");
      return;
    }

    setUpdatingId(id);
    const toastId = toast.loading("Updating role...");
    try {
      const res = await fetch("/api/auth/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, role: newRole }),
      });
      const data = await res.json();
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === id ? { ...u, role: newRole } : u))
        );
        toast.success(`Role updated to ${newRole} for user ${id}`, {
          id: toastId,
        });
      } else {
        toast.error(data.error || "Failed to update role", { id: toastId });
      }
    } catch (e) {
      toast.error("Failed to update role", { id: toastId });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="h-[100dvh] bg-gradient-to-b from-[#f8fafc] to-[#e0e7ef] flex flex-col overflow-hidden">
      {/* Sticky header */}
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm flex-shrink-0">
        <ArrowLeft onClick={() => router.back()} />
        <h1 className="text-lg font-bold tracking-tight">
          Google Users Management
        </h1>
        {/* <span className="text-xs text-gray-500 font-mono">Admin Panel</span> */}
        <AdminDropdown />
      </header>
      <main className="flex-1 overflow-y-auto flex flex-col gap-4 max-w-md w-full mx-auto">
        {loading ? (
          <div className="flex-1 flex items-center justify-center p-4">
            <Spinner className="text-black" />
          </div>
        ) : users.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500 gap-2 p-4">
            <span className="text-5xl">👤</span>
            <span className="font-semibold">No Google users found</span>
          </div>
        ) : (
          <div className="flex flex-col gap-3 p-2 pb-24 mb-16">
            {users.map((user) => (
              <div
                key={user.id}
                className="rounded-xl bg-white shadow p-4 flex flex-col gap-2 border border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-200 to-blue-400 flex items-center justify-center text-lg font-bold text-white">
                    {user.name?.[0] || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate text-base">
                      {user.name} ({user.id})
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {user.email}
                    </div>
                  </div>
                  <div className="ml-2">
                    <select
                      value={user.role}
                      disabled={
                        updatingId === user.id ||
                        !!(currentUserId && user.id === currentUserId)
                      }
                      onChange={(e) =>
                        handleRoleChange(
                          user.id,
                          e.target.value as User["role"]
                        )
                      }
                      className="rounded px-2 py-1 border border-gray-300 text-xs focus:ring-2 focus:ring-blue-400 focus:outline-none bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                      <option value="COLLECTOR_TEAM">COLLECTOR_TEAM</option>
                      <option value="DEPARTMENT_TEAM">DEPARTMENT_TEAM</option>
                      <option value="SUPERINTENDENT_OF_POLICE">
                        SUPERINTENDENT_OF_POLICE
                      </option>
                      <option value="MP_RAJYA_SABHA">MP_RAJYA_SABHA</option>
                      {user.role === "SUPERADMIN" && (
                        <option value="SUPERADMIN" disabled>
                          SUPERADMIN
                        </option>
                      )}
                    </select>
                  </div>
                </div>
                {updatingId === user.id && (
                  <div className="flex gap-2 mt-1">
                    <button
                      className="flex-1 bg-gray-200 text-gray-500 rounded py-2 text-sm font-semibold cursor-not-allowed"
                      disabled
                    >
                      Updating...
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
