-- ===================================
-- KruCraft LMS - Complete Supabase Schema
-- 32 ตาราง · รันใน Supabase SQL Editor
-- ===================================

-- =====================
-- CORE TABLES
-- =====================

create table if not exists profiles (
  id uuid references auth.users primary key,
  full_name text,
  avatar_url text,
  role text default 'student', -- student | instructor | admin
  created_at timestamptz default now()
);

create table if not exists courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  thumbnail_url text,
  price numeric default 0,
  original_price numeric,
  sale_ends_at timestamptz,
  enrolled_count integer default 0,
  review_count integer default 0,
  review_avg numeric default 5.0,
  faq jsonb default '[]',
  what_you_learn jsonb default '[]',
  requirements jsonb default '[]',
  promo_video_url text,
  instructor_id uuid references profiles(id),
  is_published boolean default false,
  created_at timestamptz default now()
);

create table if not exists modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references courses(id) on delete cascade,
  title text not null,
  sequence integer not null,
  created_at timestamptz default now()
);

create table if not exists lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid references modules(id) on delete cascade,
  course_id uuid references courses(id) on delete cascade,
  title text not null,
  type text default 'video', -- video | quiz | pdf | live
  bunny_video_path text,
  pdf_url text,
  sequence integer not null,
  is_free_preview boolean default false,
  created_at timestamptz default now()
);

create table if not exists enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  course_id uuid references courses(id),
  enrolled_at timestamptz default now(),
  unique(user_id, course_id)
);

create table if not exists user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  lesson_id uuid references lessons(id),
  is_completed boolean default false,
  actual_watch_seconds integer default 0,
  last_watched_position integer default 0,
  updated_at timestamptz default now(),
  unique(user_id, lesson_id)
);

-- =====================
-- PRODUCTS & PAYMENTS
-- =====================

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  thumbnail_url text,
  file_url text,
  price numeric default 0,
  original_price numeric,
  sale_ends_at timestamptz,
  download_count integer default 0,
  max_downloads integer default 40,
  is_featured boolean default false,
  review_count integer default 0,
  review_avg numeric default 5.0,
  faq jsonb default '[]',
  what_you_get jsonb default '[]',
  file_items jsonb default '[]',
  seller_id uuid references profiles(id),
  commission_rate numeric default 0.7,
  category text default 'worksheet', -- worksheet | ebook | template | resource
  is_published boolean default false,
  created_at timestamptz default now()
);

create table if not exists purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  product_id uuid references products(id),
  amount_paid numeric,
  seller_amount numeric,
  platform_amount numeric,
  download_count integer default 0,
  max_downloads integer default 40,
  download_token text,
  purchased_at timestamptz default now(),
  unique(user_id, product_id)
);

create table if not exists payment_slips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  item_type text not null, -- course | product
  item_id uuid not null,
  amount numeric not null,
  slip_url text not null,
  status text default 'pending', -- pending | approved | rejected
  admin_note text,
  reviewed_by uuid references profiles(id),
  reviewed_at timestamptz,
  referral_code text,
  created_at timestamptz default now()
);

-- =====================
-- CERTIFICATES & EXAMS
-- =====================

create table if not exists certificates (
  id uuid primary key default gen_random_uuid(),
  cert_id text unique not null,
  user_id uuid references profiles(id),
  course_id uuid references courses(id),
  pdf_url text,
  is_valid boolean default true,
  issued_at timestamptz default now()
);

create table if not exists exam_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  course_id uuid references courses(id),
  score numeric not null,
  passing_score numeric default 70,
  passed_at timestamptz default now()
);

-- =====================
-- QUIZ SYSTEM
-- =====================

create table if not exists quizzes (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid references lessons(id) on delete cascade,
  course_id uuid references courses(id) on delete cascade,
  created_by uuid references profiles(id),
  title text not null default 'แบบทดสอบ',
  pass_score integer default 70,
  created_at timestamptz default now()
);

create table if not exists quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid references quizzes(id) on delete cascade,
  question text not null,
  type text default 'single', -- single | multi | truefalse
  options jsonb not null default '[]',
  explanation text,
  order_num integer default 0
);

create table if not exists quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid references quizzes(id),
  user_id uuid references profiles(id),
  answers jsonb not null default '{}',
  score integer,
  passed boolean,
  submitted_at timestamptz default now()
);

-- =====================
-- AFFILIATE
-- =====================

create table if not exists affiliates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  referral_code text unique not null,
  commission_rate numeric default 0.3,
  created_at timestamptz default now()
);

create table if not exists affiliate_payouts (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid references affiliates(id),
  order_id text,
  commission_amount numeric,
  status text default 'pending', -- pending | paid | rejected
  created_at timestamptz default now()
);

-- =====================
-- DISCOUNT CODES
-- =====================

create table if not exists discount_codes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  discount_type text not null default 'percent', -- percent | fixed
  discount_value numeric not null default 10,
  min_price numeric default 0,
  max_uses integer default null,
  used_count integer default 0,
  applies_to text default 'all', -- all | course | product
  is_active boolean default true,
  expires_at timestamptz default null,
  created_at timestamptz default now()
);

create table if not exists discount_code_usages (
  id uuid primary key default gen_random_uuid(),
  code_id uuid references discount_codes(id) on delete cascade,
  user_id uuid references profiles(id),
  item_type text,
  item_id uuid,
  discount_amount numeric,
  created_at timestamptz default now()
);

-- =====================
-- CREDIT SYSTEM
-- =====================

create table if not exists credit_wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) unique,
  balance integer default 0,
  total_earned integer default 0,
  total_spent integer default 0,
  updated_at timestamptz default now()
);

create table if not exists credit_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  type text not null, -- topup | spend | refund | bonus | admin_adjust
  amount integer not null,
  balance_after integer not null,
  description text,
  ref_type text,
  ref_id text,
  created_at timestamptz default now()
);

create table if not exists credit_pricing (
  id uuid primary key default gen_random_uuid(),
  action text unique not null,
  credits_cost integer not null default 1,
  label text,
  is_active boolean default true
);

-- =====================
-- BUNDLES
-- =====================

create table if not exists course_bundles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  thumbnail_url text,
  original_price numeric not null,
  bundle_price numeric not null,
  instructor_id uuid references profiles(id),
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists bundle_courses (
  bundle_id uuid references course_bundles(id) on delete cascade,
  course_id uuid references courses(id) on delete cascade,
  primary key (bundle_id, course_id)
);

-- =====================
-- DISCUSSIONS
-- =====================

create table if not exists lesson_discussions (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid references lessons(id) on delete cascade,
  course_id uuid references courses(id) on delete cascade,
  user_id uuid references profiles(id),
  parent_id uuid references lesson_discussions(id),
  content text not null,
  is_pinned boolean default false,
  created_at timestamptz default now()
);

-- =====================
-- WISHLIST
-- =====================

create table if not exists wishlists (
  user_id uuid references profiles(id) on delete cascade,
  course_id uuid references courses(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, course_id)
);

-- =====================
-- DOCUMENTS & TOOLS
-- =====================

create table if not exists user_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  template_type text not null default 'research',
  title text not null,
  subtitle text,
  teacher_name text,
  school_name text,
  subject_group text,
  grade_level text,
  academic_year text,
  content jsonb default '{}',
  font_family text default 'TH Sarabun New',
  theme text default 'academic',
  status text default 'draft',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists gem_links (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  url text not null default 'https://gemini.google.com/app',
  icon_svg text,
  gradient text default 'from-blue-500 to-cyan-400',
  access_level text default 'all', -- all | instructor | admin
  sort_order integer default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- =====================
-- SYSTEM
-- =====================

create table if not exists site_settings (
  key text primary key,
  value text not null,
  updated_by uuid references profiles(id),
  updated_at timestamptz default now()
);

create table if not exists activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  action text not null,
  detail text,
  ip_address text,
  created_at timestamptz default now()
);

create table if not exists video_token_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  lesson_id uuid references lessons(id),
  token_expires_at timestamptz,
  created_at timestamptz default now()
);

-- =====================
-- ROW LEVEL SECURITY
-- =====================

alter table profiles enable row level security;
alter table courses enable row level security;
alter table modules enable row level security;
alter table lessons enable row level security;
alter table enrollments enable row level security;
alter table user_progress enable row level security;
alter table products enable row level security;
alter table purchases enable row level security;
alter table payment_slips enable row level security;
alter table certificates enable row level security;
alter table exam_results enable row level security;
alter table quizzes enable row level security;
alter table quiz_questions enable row level security;
alter table quiz_attempts enable row level security;
alter table affiliates enable row level security;
alter table affiliate_payouts enable row level security;
alter table discount_codes enable row level security;
alter table discount_code_usages enable row level security;
alter table credit_wallets enable row level security;
alter table credit_transactions enable row level security;
alter table credit_pricing enable row level security;
alter table course_bundles enable row level security;
alter table bundle_courses enable row level security;
alter table lesson_discussions enable row level security;
alter table wishlists enable row level security;
alter table user_documents enable row level security;
alter table gem_links enable row level security;
alter table site_settings enable row level security;
alter table activity_logs enable row level security;

-- =====================
-- AUTO-CREATE PROFILE
-- =====================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =====================
-- ATOMIC CREDIT FUNCTIONS
-- =====================

create or replace function spend_credits(
  p_user_id uuid, p_amount int, p_description text,
  p_ref_type text default null, p_ref_id text default null
) returns table(success boolean, new_balance int, error_message text) as $$
declare v_balance int; v_new_balance int;
begin
  select balance into v_balance from credit_wallets where user_id = p_user_id for update;
  if v_balance is null then
    insert into credit_wallets (user_id, balance) values (p_user_id, 0) on conflict (user_id) do nothing;
    v_balance := 0;
  end if;
  if v_balance < p_amount then
    return query select false, v_balance, format('เครดิตไม่เพียงพอ (ต้องใช้ %s, คงเหลือ %s)', p_amount, v_balance);
    return;
  end if;
  v_new_balance := v_balance - p_amount;
  update credit_wallets set balance = v_new_balance, total_spent = total_spent + p_amount, updated_at = now() where user_id = p_user_id;
  insert into credit_transactions (user_id, type, amount, balance_after, description, ref_type, ref_id) values (p_user_id, 'spend', -p_amount, v_new_balance, p_description, p_ref_type, p_ref_id);
  return query select true, v_new_balance, null::text;
end;
$$ language plpgsql security definer;

create or replace function add_credits(
  p_user_id uuid, p_amount int, p_description text,
  p_type text default 'topup', p_ref_type text default null, p_ref_id text default null
) returns int as $$
declare v_new_balance int;
begin
  insert into credit_wallets (user_id, balance, total_earned) values (p_user_id, p_amount, p_amount)
  on conflict (user_id) do update set balance = credit_wallets.balance + p_amount, total_earned = credit_wallets.total_earned + p_amount, updated_at = now()
  returning balance into v_new_balance;
  insert into credit_transactions (user_id, type, amount, balance_after, description, ref_type, ref_id) values (p_user_id, p_type, p_amount, v_new_balance, p_description, p_ref_type, p_ref_id);
  return v_new_balance;
end;
$$ language plpgsql security definer;
