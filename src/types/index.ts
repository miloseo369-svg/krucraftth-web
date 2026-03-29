export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: "student" | "instructor" | "admin";
  created_at: string;
}

export interface Course {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  price: number;
  instructor_id: string;
  is_published: boolean;
  created_at: string;
  instructor?: Profile;
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  sequence: number;
  created_at: string;
  lessons?: Lesson[];
}

export interface Lesson {
  id: string;
  module_id: string;
  course_id: string;
  title: string;
  type: "video" | "quiz" | "pdf" | "live";
  bunny_video_path: string | null;
  pdf_url: string | null;
  sequence: number;
  is_free_preview: boolean;
  created_at: string;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  is_completed: boolean;
  actual_watch_seconds: number;
  last_watched_position: number;
  updated_at: string;
}

export interface ExamResult {
  id: string;
  user_id: string;
  course_id: string;
  score: number;
  passing_score: number;
  passed_at: string;
}

export interface Certificate {
  id: string;
  cert_id: string;
  user_id: string;
  course_id: string;
  pdf_url: string | null;
  is_valid: boolean;
  issued_at: string;
}

export interface Affiliate {
  id: string;
  user_id: string;
  referral_code: string;
  commission_rate: number;
  created_at: string;
}

export interface AffiliatePayout {
  id: string;
  affiliate_id: string;
  order_id: string;
  commission_amount: number;
  status: "pending" | "paid" | "rejected";
  created_at: string;
}

export interface Product {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  file_url: string;
  price: number;
  seller_id: string;
  commission_rate: number;
  is_published: boolean;
  category: "worksheet" | "ebook" | "template" | "resource";
  created_at: string;
  seller?: Profile;
}

export interface Purchase {
  id: string;
  user_id: string;
  product_id: string;
  amount_paid: number;
  seller_amount: number;
  platform_amount: number;
  stripe_session_id: string | null;
  purchased_at: string;
  product?: Product;
}

export interface PaymentSlip {
  id: string;
  user_id: string;
  item_type: "course" | "product";
  item_id: string;
  amount: number;
  slip_url: string;
  status: "pending" | "approved" | "rejected";
  admin_note: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  user?: Profile;
}

export interface SiteSetting {
  key: string;
  value: string;
  updated_by: string | null;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  detail: string | null;
  ip_address: string | null;
  created_at: string;
  user?: Profile;
}

export interface LessonAttachment {
  id: string;
  lesson_id: string;
  title: string;
  file_url: string;
  file_type: string;
  created_at: string;
}
