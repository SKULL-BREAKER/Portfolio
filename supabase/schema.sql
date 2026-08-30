-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create a table for public profiles (matches auth.users 1-to-1)
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  headline text,
  about text,
  career_objective text,
  profile_image text,
  resume_file text,
  resume_original text,
  resume_downloads boolean default false,
  is_public boolean default true,
  status text default 'Available for opportunities',
  theme_settings jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table profiles enable row level security;
create policy "Public profiles are viewable by everyone." on profiles for select using (is_public = true);
create policy "Users can manage their own profile." on profiles for all using (auth.uid() = id);

-- Create social_links
create table social_links (
  id uuid default uuid_generate_v4() primary key,
  profile_id uuid references profiles(id) on delete cascade not null,
  platform text not null,
  display_name text not null,
  url text not null,
  icon text,
  description text,
  display_order integer default 0,
  is_public boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table social_links enable row level security;
create policy "Public social links are viewable by everyone." on social_links for select using (is_public = true);
create policy "Users can manage own social links." on social_links for all using (auth.uid() = profile_id);

-- Projects
create table projects (
  id uuid default uuid_generate_v4() primary key,
  profile_id uuid references profiles(id) on delete cascade not null,
  slug text unique not null,
  title text not null,
  short_description text not null,
  description text not null,
  image text,
  github_url text,
  live_url text,
  documentation_url text,
  technologies text not null,
  category text,
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  status text,
  is_featured boolean default false,
  display_order integer default 0,
  is_public boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table projects enable row level security;
create policy "Public projects are viewable by everyone." on projects for select using (is_public = true);
create policy "Users can manage own projects." on projects for all using (auth.uid() = profile_id);

-- Skills
create table skills (
  id uuid default uuid_generate_v4() primary key,
  profile_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  category text not null,
  proficiency text,
  years_of_exp numeric,
  icon text,
  display_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table skills enable row level security;
create policy "Public skills are viewable by everyone." on skills for select using (true);
create policy "Users can manage own skills." on skills for all using (auth.uid() = profile_id);

-- Certificates
create table certificates (
  id uuid default uuid_generate_v4() primary key,
  profile_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  organization text not null,
  issue_date timestamp with time zone not null,
  credential_id text,
  credential_url text,
  description text,
  file_url text not null,
  original_file_name text not null,
  mime_type text not null,
  size_bytes integer not null,
  display_order integer default 0,
  is_public boolean default true,
  allow_download boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table certificates enable row level security;
create policy "Public certificates are viewable by everyone." on certificates for select using (is_public = true);
create policy "Users can manage own certificates." on certificates for all using (auth.uid() = profile_id);

-- Education
create table education (
  id uuid default uuid_generate_v4() primary key,
  profile_id uuid references profiles(id) on delete cascade not null,
  institution text not null,
  degree text not null,
  department text,
  start_date timestamp with time zone not null,
  end_date timestamp with time zone,
  grade text,
  description text,
  institution_url text,
  achievements text,
  display_order integer default 0,
  is_public boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table education enable row level security;
create policy "Public education viewable by everyone." on education for select using (is_public = true);
create policy "Users can manage own education." on education for all using (auth.uid() = profile_id);

-- Experience
create table experience (
  id uuid default uuid_generate_v4() primary key,
  profile_id uuid references profiles(id) on delete cascade not null,
  company text not null,
  position text not null,
  start_date timestamp with time zone not null,
  end_date timestamp with time zone,
  is_current boolean default false,
  description text,
  company_url text,
  display_order integer default 0,
  is_public boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table experience enable row level security;
create policy "Public experience viewable by everyone." on experience for select using (is_public = true);
create policy "Users can manage own experience." on experience for all using (auth.uid() = profile_id);

-- Achievements
create table achievements (
  id uuid default uuid_generate_v4() primary key,
  profile_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  description text,
  date timestamp with time zone,
  display_order integer default 0,
  is_public boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table achievements enable row level security;
create policy "Public achievements viewable by everyone." on achievements for select using (is_public = true);
create policy "Users can manage own achievements." on achievements for all using (auth.uid() = profile_id);

-- Trigger to create a profile automatically when a user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, headline)
  values (new.id, 'Professional Portfolio');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Storage Bucket for Profile Images and Resumes
insert into storage.buckets (id, name, public) 
values ('portfolio_files', 'portfolio_files', true)
on conflict (id) do nothing;

-- Storage Policies
create policy "Public Access" 
on storage.objects for select 
using ( bucket_id = 'portfolio_files' );

create policy "Authenticated users can upload files" 
on storage.objects for insert 
with check ( bucket_id = 'portfolio_files' and auth.role() = 'authenticated' );

create policy "Users can update their own files"
on storage.objects for update
using ( bucket_id = 'portfolio_files' and auth.uid() = owner );

create policy "Users can delete their own files"
on storage.objects for delete
using ( bucket_id = 'portfolio_files' and auth.uid() = owner );
