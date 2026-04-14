-- ==========================================
-- 1. PROFILES TABLE: TAMBAH KOLOM TRUST
-- ==========================================
-- Menambahkan kolom rating, is_verified, dan reviews_count ke tabel profiles jika belum ada
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS rating NUMERIC(3, 2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS reviews_count INTEGER DEFAULT 0;

-- ==========================================
-- 2. ENABLE ROW LEVEL SECURITY (RLS)
-- ==========================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 3. RLS POLICIES UNTUK PROFILES
-- ==========================================
-- Siapapun bisa melihat profile
CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles FOR SELECT
  USING ( true );

-- User hanya bisa update profilenya sendiri
CREATE POLICY "Users can insert their own profile."
  ON public.profiles FOR INSERT
  WITH CHECK ( auth.uid() = id );

CREATE POLICY "Users can update own profile."
  ON public.profiles FOR UPDATE
  USING ( auth.uid() = id );

-- ==========================================
-- 4. RLS POLICIES UNTUK LISTINGS
-- ==========================================
-- Siapapun bisa melihat listings
CREATE POLICY "Listings are viewable by everyone."
  ON public.listings FOR SELECT
  USING ( true );

-- Hanya user terautentikasi yang bisa membuat listing
CREATE POLICY "Users can create listings"
  ON public.listings FOR INSERT
  WITH CHECK ( auth.role() = 'authenticated' AND auth.uid() = seller_id );

-- Penjual hanya bisa mengupdate listingnya sendiri
CREATE POLICY "Sellers can update their own listings"
  ON public.listings FOR UPDATE
  USING ( auth.uid() = seller_id );

-- Penjual hanya bisa menghapus listingnya sendiri
CREATE POLICY "Sellers can delete their own listings"
  ON public.listings FOR DELETE
  USING ( auth.uid() = seller_id );


-- ==========================================
-- 5. RLS POLICIES UNTUK CHAT ROOMS
-- ==========================================
-- User hanya bisa melihat room dimana mereka adalah pembeli atau penjual
CREATE POLICY "Users can view their chat rooms"
  ON public.chat_rooms FOR SELECT
  USING ( auth.uid() = buyer_id OR auth.uid() = seller_id );

-- Insert chat room
CREATE POLICY "Users can create chat rooms"
  ON public.chat_rooms FOR INSERT
  WITH CHECK ( auth.role() = 'authenticated' AND auth.uid() = buyer_id );


-- ==========================================
-- 6. RLS POLICIES UNTUK MESSAGES
-- ==========================================
-- User hanya bisa melihat pesan di room yang mana mereka adalah partisipannya
CREATE POLICY "Users can view messages in their rooms"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_rooms 
      WHERE chat_rooms.id = messages.room_id 
      AND (chat_rooms.buyer_id = auth.uid() OR chat_rooms.seller_id = auth.uid())
    )
  );

-- Insert pesan
CREATE POLICY "Users can insert messages in their rooms"
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.chat_rooms 
      WHERE chat_rooms.id = messages.room_id 
      AND (chat_rooms.buyer_id = auth.uid() OR chat_rooms.seller_id = auth.uid())
    )
  );
