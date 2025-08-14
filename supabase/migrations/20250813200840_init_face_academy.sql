-- Face Academy Database Schema - Complete Setup
-- This migration sets up all tables, policies, and storage for the Face Academy app

-- 0) Extension for gen_random_uuid()
create extension if not exists pgcrypto;

-- 1) Tables
create table if not exists users (
  id uuid primary key,
  username text not null,
  email text,
  model_status text default 'not_trained' check (model_status in ('not_trained','training','trained','failed')),
  model_trained_at timestamp,
  created_at timestamp default now()
);

create table if not exists training_images (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  image_data text not null, -- Either storage path or base64 fallback
  image_type text default 'positive' check (image_type in ('anchor','positive','negative')),
  storage_path text, -- Path in Supabase Storage
  public_url text, -- Public URL for the stored image
  created_at timestamp default now()
);

-- 2) Indexes for performance
create index if not exists idx_users_username on users(username);
create index if not exists idx_users_model_status on users(model_status);
create index if not exists idx_training_images_user_id on training_images(user_id);
create index if not exists idx_training_images_type on training_images(image_type);

-- 3) Enable Row Level Security
alter table users enable row level security;
alter table training_images enable row level security;

-- 4) User table policies (safe to re-run)
drop policy if exists "Allow public to read users" on users;
drop policy if exists "Allow public to insert users" on users;
drop policy if exists "Allow public to update users" on users;

create policy "Allow public to read users"   
  on users for select using (true);
create policy "Allow public to insert users" 
  on users for insert with check (true);
create policy "Allow public to update users" 
  on users for update using (true);

-- 5) Training images table policies
drop policy if exists "Allow public to read training images" on training_images;
drop policy if exists "Allow public to insert training images" on training_images;
drop policy if exists "Allow public to update training images" on training_images;

create policy "Allow public to read training images"   
  on training_images for select using (true);
create policy "Allow public to insert training images" 
  on training_images for insert with check (true);
create policy "Allow public to update training images" 
  on training_images for update using (true);

-- 6) Create storage bucket if it doesn't exist
insert into storage.buckets (id, name, public) 
values ('training_images', 'training_images', true)
on conflict (id) do nothing;

-- 7) Storage policies for training images bucket
drop policy if exists "Public read training_images" on storage.objects;
drop policy if exists "Public upload training_images" on storage.objects;
drop policy if exists "Public delete training_images" on storage.objects;

create policy "Public read training_images"
  on storage.objects for select
  using (bucket_id = 'training_images');

create policy "Public upload training_images"
  on storage.objects for insert
  with check (bucket_id = 'training_images');

create policy "Public delete training_images"
  on storage.objects for delete
  using (bucket_id = 'training_images');

-- 8) Helper function for user stats (optional)
create or replace function get_user_stats()
returns table (
  total_users bigint,
  trained_models bigint,
  total_images bigint,
  avg_images_per_user numeric
) as $$
begin
  return query
  select 
    count(*)::bigint as total_users,
    count(case when model_status = 'trained' then 1 end)::bigint as trained_models,
    (select count(*)::bigint from training_images) as total_images,
    case 
      when count(*) > 0 then (select count(*)::numeric from training_images) / count(*)::numeric
      else 0::numeric
    end as avg_images_per_user
  from users;
end;
$$ language plpgsql;

-- Completion message
select '✅ Face Academy database setup completed successfully!' as status;
