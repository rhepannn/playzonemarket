import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [listings, setListings] = useState([]);
  const [chatRooms, setChatRooms] = useState([]);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);

  // Fetch public listings (no auth needed)
  const fetchListings = useCallback(async () => {
    const { data, error } = await supabase
      .from('listings')
      .select('*, profiles!listings_seller_id_fkey(id, full_name, username, is_verified, rating, reviews_count)')
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    if (error) console.error('fetchListings error:', error);
    setListings(data || []);
  }, []);

  // Search listings server-side
  const searchListings = useCallback(async (filters) => {
    try {
      let q = supabase
        .from('listings')
        .select('*, profiles!listings_seller_id_fkey(id, full_name, username, is_verified, rating, reviews_count)')
        .eq('status', 'active');

      if (filters.game && filters.game !== 'all') {
        q = q.eq('game', filters.game);
      }
      if (filters.query) {
        q = q.ilike('title', `%${filters.query}%`);
      }
      if (filters.minPrice) {
        q = q.gte('price', Number(filters.minPrice));
      }
      if (filters.maxPrice) {
        q = q.lte('price', Number(filters.maxPrice));
      }

      if (filters.sortBy === 'price-low') {
        q = q.order('price', { ascending: true });
      } else if (filters.sortBy === 'price-high') {
        q = q.order('price', { ascending: false });
      } else {
        q = q.order('created_at', { ascending: false });
      }

      const { data, error } = await q;
      if (error) throw error;
      
      setListings(data || []);
      return data;
    } catch (err) {
      console.error('searchListings error:', err);
      return [];
    }
  }, []);

  // Fetch profile for logged-in user
  const fetchProfile = useCallback(async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    return data;
  }, []);

  // Fetch chat rooms (both as buyer or seller)
  const fetchChatRooms = useCallback(async (userId) => {
    const { data } = await supabase
      .from('chat_rooms')
      .select(`
        *,
        listings(id, title, game),
        buyer:profiles!chat_rooms_buyer_id_fkey(id, full_name, username),
        seller:profiles!chat_rooms_seller_id_fkey(id, full_name, username)
      `)
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
      .order('created_at', { ascending: false });
    setChatRooms(data || []);
  }, []);

  // Initialize on mount
  useEffect(() => {
    const minLoadingTime = 2000;
    const startTime = Date.now();

    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          if (profile) setUser({ ...profile, email: session.user.email });
          await fetchChatRooms(session.user.id);
        }
        await fetchListings();
      } catch (err) {
        console.error('Init error:', err);
      }
      const elapsed = Date.now() - startTime;
      setTimeout(() => setInitialLoading(false), Math.max(0, minLoadingTime - elapsed));
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        if (profile) setUser({ ...profile, email: session.user.email });
        await fetchChatRooms(session.user.id);
      } else {
        setUser(null);
        setChatRooms([]);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchListings, fetchProfile, fetchChatRooms]);

  // AUTH
  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const register = async (email, password, fullName, role = 'buyer') => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, username: email.split('@')[0], role }
      }
    });
    if (error) throw error;
    return data;
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Supabase logout error:', error);
    } finally {
      setUser(null);
      setSession(null);
      setChatRooms([]);
      // Force clear local storage keys just in case supabase auth session is stuck
      localStorage.removeItem('supabase.auth.token');
      const keys = Object.keys(localStorage);
      keys.forEach(k => {
        if (k.startsWith('sb-') && k.endsWith('-auth-token')) {
          localStorage.removeItem(k);
        }
      });
    }
  };

  // LISTINGS / PRODUCTS
  const addListing = async (listingData) => {
    if (!user) throw new Error('Must be logged in');
    const { data, error } = await supabase
      .from('listings')
      .insert([{ ...listingData, seller_id: user.id, status: 'active' }])
      .select()
      .single();
    if (error) throw error;
    setListings(prev => [data, ...prev]);
    return data;
  };

  const updateListing = async (id, updates) => {
    const { data, error } = await supabase
      .from('listings')
      .update(updates)
      .eq('id', id)
      .eq('seller_id', user.id)
      .select()
      .single();
    if (error) throw error;
    setListings(prev => prev.map(l => l.id === id ? data : l));
    return data;
  };

  const deleteListing = async (id) => {
    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', id)
      .eq('seller_id', user.id);
    if (error) throw error;
    setListings(prev => prev.filter(l => l.id !== id));
  };

  // CHAT
  const openOrCreateChatRoom = async (sellerId, listingId) => {
    if (!user) throw new Error('Must be logged in');

    // Check existing room
    const { data: existing } = await supabase
      .from('chat_rooms')
      .select('id')
      .eq('buyer_id', user.id)
      .eq('seller_id', sellerId)
      .eq('listing_id', listingId)
      .single();

    if (existing) return existing.id;

    // Create new room
    const { data: newRoom, error } = await supabase
      .from('chat_rooms')
      .insert([{ buyer_id: user.id, seller_id: sellerId, listing_id: listingId }])
      .select(`
        *,
        listings(id, title, game),
        buyer:profiles!chat_rooms_buyer_id_fkey(id, full_name, username),
        seller:profiles!chat_rooms_seller_id_fkey(id, full_name, username)
      `)
      .single();

    if (error) throw error;
    setChatRooms(prev => [newRoom, ...prev]);
    return newRoom.id;
  };

  // CART (local)
  const addToCart = (product) => setCart(prev => [...prev, product]);
  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id));
  const toggleWishlist = (product) => {
    setWishlist(prev =>
      prev.find(i => i.id === product.id)
        ? prev.filter(i => i.id !== product.id)
        : [...prev, product]
    );
  };

  const addNotification = (title, type = 'info') => {
    setNotifications(prev => [{
      id: `notif_${Date.now()}`, title, type,
      timestamp: new Date().toISOString(), read: false
    }, ...prev]);
  };

  return (
    <AppContext.Provider value={{
      user, session, loading: initialLoading,
      listings, chatRooms, cart, wishlist, notifications,
      login, logout, register,
      fetchListings, searchListings, fetchChatRooms,
      addListing, updateListing, deleteListing,
      openOrCreateChatRoom,
      addToCart, removeFromCart, toggleWishlist,
      addNotification,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
