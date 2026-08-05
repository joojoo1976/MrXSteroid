-- ============================================================
-- CMS: blog_posts, cms_pages, faq_items (bilingual en/ar)
-- ============================================================

-- Blog posts (bilingual)
create table if not exists public.blog_posts (
    id uuid primary key default gen_random_uuid(),
    slug text unique not null,
    title_en text not null,
    title_ar text not null,
    excerpt_en text,
    excerpt_ar text,
    content_en text,
    content_ar text,
    category_en text not null default 'Blog',
    category_ar text not null default 'مدونة',
    cover_image_url text,
    author text,
    status text not null default 'draft' check (status in ('draft','published')),
    published_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Static pages (bilingual)
create table if not exists public.cms_pages (
    id uuid primary key default gen_random_uuid(),
    slug text unique not null,
    title_en text not null,
    title_ar text not null,
    content_en text,
    content_ar text,
    status text not null default 'draft' check (status in ('draft','published')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- FAQ items (bilingual)
create table if not exists public.faq_items (
    id uuid primary key default gen_random_uuid(),
    question_en text not null,
    question_ar text not null,
    answer_en text,
    answer_ar text,
    category_en text not null default 'General',
    category_ar text not null default 'عام',
    sort_order int not null default 0,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Keep updated_at fresh on edit (reuse handle_updated_at)
drop trigger if exists blog_posts_set_updated_at on public.blog_posts;
create trigger blog_posts_set_updated_at
    before update on public.blog_posts
    for each row execute function public.handle_updated_at();

drop trigger if exists cms_pages_set_updated_at on public.cms_pages;
create trigger cms_pages_set_updated_at
    before update on public.cms_pages
    for each row execute function public.handle_updated_at();

drop trigger if exists faq_items_set_updated_at on public.faq_items;
create trigger faq_items_set_updated_at
    before update on public.faq_items
    for each row execute function public.handle_updated_at();

-- created_at indexes for admin listing
create index if not exists blog_posts_created_at_idx on public.blog_posts (created_at desc);
create index if not exists cms_pages_created_at_idx on public.cms_pages (created_at desc);
create index if not exists faq_items_created_at_idx on public.faq_items (created_at desc);

-- ── RLS ─────────────────────────────────────────────────────
alter table public.blog_posts enable row level security;
alter table public.cms_pages enable row level security;
alter table public.faq_items enable row level security;

drop policy if exists "Admins can manage blog_posts" on public.blog_posts;
create policy "Admins can manage blog_posts" on public.blog_posts
    for all to authenticated
    using (coalesce((select role from public.profiles where id = auth.uid()), 'user') = 'admin')
    with check (coalesce((select role from public.profiles where id = auth.uid()), 'user') = 'admin');

drop policy if exists "Admins can manage cms_pages" on public.cms_pages;
create policy "Admins can manage cms_pages" on public.cms_pages
    for all to authenticated
    using (coalesce((select role from public.profiles where id = auth.uid()), 'user') = 'admin')
    with check (coalesce((select role from public.profiles where id = auth.uid()), 'user') = 'admin');

drop policy if exists "Admins can manage faq_items" on public.faq_items;
create policy "Admins can manage faq_items" on public.faq_items
    for all to authenticated
    using (coalesce((select role from public.profiles where id = auth.uid()), 'user') = 'admin')
    with check (coalesce((select role from public.profiles where id = auth.uid()), 'user') = 'admin');

-- Public can read published/active content (storefront)
drop policy if exists "Public can read published blog posts" on public.blog_posts;
create policy "Public can read published blog posts" on public.blog_posts
    for select using (status = 'published');

drop policy if exists "Public can read published pages" on public.cms_pages;
create policy "Public can read published pages" on public.cms_pages
    for select using (status = 'published');

drop policy if exists "Public can read active faq items" on public.faq_items;
create policy "Public can read active faq items" on public.faq_items
    for select using (is_active = true);
