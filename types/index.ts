import { Decimal } from "@prisma/client/runtime/library";

export interface MediaObject {
  url: string;
  filename: string;
  extension: string;
  type: "image" | "video" | "other";
}

export type AuthStep = "language" | "login" | "otp" | "profile" | "complete";
export type Section = "my-issues" | "community" | "status";
export type Language = "english" | "hindi" | "marathi";
export type Gender = "Male" | "Female" | "Other";

export interface SessionUser {
  id: string;
  email?: string;
  name?: string;
  role?: "ADMIN" | "SUPERADMIN" | "USER";
}

export interface User {
  id?: number;
  name: string;
  age: number;
  gender: Gender;
  mobile: string;
  email?: string;
  address: string;
  ward?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserData {
  id: string;
  name: string;
  authStep: AuthStep;
  language: Language;
}

export interface Complaint {
  id: number;
  complaintId: string;
  userId: number;
  title?: string | null;
  description?: string | null;
  category?: string | null;
  subcategory?: string | null;
  taluka?: string | null;
  location?: string | null;
  latitude?: Decimal | null;
  longitude?: Decimal | null;
  status: string;
  priority?: string | null;
  department?: string | null;
  type?: string | null;
  language?: string | null;

  media?: MediaObject[];

  isMediaApproved: boolean;
  isPublic: boolean;
  coSignCount: number;
  reportCount?: number;
  isCoSigned: boolean;
  isReported: boolean;
  linkedComplaintIds?: string[];

  createdAt: string;
  updatedAt: string;
}

export type CoSignVars = {
  userSlug: string;
  shouldApprove: boolean;
  complaintId: number;
};

export interface ChatMessage {
  id: number;
  userId?: number;
  complaintId?: number;
  content: string;
  messageType: "user" | "bot" | "system";
  isRead: boolean;
  createdAt: string;
}

export interface StatusUpdate {
  id: number;
  title: string;
  description?: string;
  imageUrl?: string;
  videoUrl?: string;
  complaintId?: number;
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
}

export interface ComplaintFormData {
  title: string;
  description: string;
  category: string;
  location?: string | null;
  latitude?: string | null;
  longitude?: string | null;
  media?: MediaObject[];
}

export interface OTPFormData {
  mobile: string;
  otp: string;
}

export interface ProfileFormData {
  name: string;
  age: number;
  gender: Gender | "";

  mobile: string;
  address: string;

  // firstName: string;
  // lastName: string;
}

export type Visibility = "MEDIA" | "COMPLAINT";

export type ReportReason =
  | "INAPPROPRIATE_CONTENT"
  | "MISLEADING_OR_FALSE_INFO"
  | "SPAM_OR_DUPLICATE"
  | "PRIVACY_VIOLATION"
  | "HARASSMENT_OR_HATE_SPEECH"
  | "OTHER";

export interface ReportVars {
  userSlug: string;
  complaintId: number;
  reportReason: ReportReason;
  text?: string;
}
