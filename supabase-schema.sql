-- ===================================
-- KruCraft LMS - Supabase SQL Schema
-- รันใน Supabase SQL Editor
-- ===================================

-- profiles (ผูกกับ auth.users)
create table profiles (
  id uuid references auth.users primary key,
  full_name text,
  avatar_url text,
  role text default 'student', -- student | instructor | admin
  created_at timestamptz default now()
);

-- courses
create table courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  thumbnail_url text,
  price numeric default 0,
  instructor_id uuid references profiles(id),
  is_published boolean default false,
  created_at timestamptz default now()
);

-- modules
create table modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references courses(id) on delete cascade,
  title text not null,
  sequence integer not null,
  created_at timestamptz default now()
);

-- lessons
create table lessons (
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

-- enrollments
create table enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  course_id uuid references courses(id),
  enrolled_at timestamptz default now(),
  unique(user_id, course_id)
);

-- user_progress
create table user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  lesson_id uuid references lessons(id),
  is_completed boolean default false,
  actual_watch_seconds integer default 0,
  last_watched_position integer default 0,
  updated_at timestamptz default now(),
  unique(user_id, lesson_id)
);

-- exam_results
create table exam_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  course_id uuid references courses(id),
  score numeric not null,
  passing_score numeric default 70,
  passed_at timestamptz default now()
);

-- certificates
create table certificates (
  id uuid primary key default gen_random_uuid(),
  cert_id text unique not null,
  user_id uuid references profiles(id),
  course_id uuid references courses(id),
  pdf_url text,
  is_valid boolean default true,
  issued_at timestamptz default now()
);

-- affiliate
create table affiliates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  referral_code text unique not null,
  commission_rate numeric default 0.3,
  created_at timestamptz default now()
);

create table affiliate_payouts (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid references affiliates(id),
  order_id text,
  commission_amount numeric,
  status text default 'pending',
  created_at timestamptz default now()
);

-- discount_codes (โค้ดส่วนลด)
create table discount_codes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  discount_type text not null default 'percent', -- percent | fixed
  discount_value numeric not null default 10,
  min_price numeric default 0,
  max_uses integer default null, -- null = unlimited
  used_count integer default 0,
  applies_to text default 'all', -- all | course | product
  is_active boolean default true,
  expires_at timestamptz default null,
  created_at timestamptz default now()
);

-- discount_code_usages (บันทึกการใช้โค้ด)
create table discount_code_usages (
  id uuid primary key default gen_random_uuid(),
  code_id uuid references discount_codes(id) on delete cascade,
  user_id uuid references profiles(id),
  item_type text, -- course | product
  item_id uuid,
  discount_amount numeric,
  created_at timestamptz default now()
);

-- video_token_logs
create table video_token_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  lesson_id uuid references lessons(id),
  token_expires_at timestamptz,
  created_at timestamptz default now()
);

-- ===================================
-- Row Level Security
-- ===================================
alter table profiles enable row level security;
alter table enrollments enable row level security;
alter table user_progress enable row level security;
alter table certificates enable row level security;

create policy "users can read own profile"
  on profiles for select using (auth.uid() = id);

create policy "users can update own profile"
  on profiles for update using (auth.uid() = id);

create policy "users can read own enrollments"
  on enrollments for select using (auth.uid() = user_id);

create policy "users can insert own enrollments"
  on enrollments for insert with check (auth.uid() = user_id);

create policy "users can read own progress"
  on user_progress for select using (auth.uid() = user_id);

create policy "users can upsert own progress"
  on user_progress for insert with check (auth.uid() = user_id);

create policy "users can update own progress"
  on user_progress for update using (auth.uid() = user_id);

create policy "anyone can verify certificate"
  on certificates for select using (true);

-- ===================================
-- Auto-create profile on signup
-- ===================================
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
