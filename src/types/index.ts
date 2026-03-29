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
