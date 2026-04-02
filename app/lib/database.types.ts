// Auto-maintained database types for HomePlate
// Reflects supabase/schema.sql

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

// ---- Row types (what comes back from SELECT) ----

export interface User {
  id: string
  email: string
  name: string | null
  avatar_url: string | null
  bio: string | null
  phone: string | null
  city: string | null
  state: string | null
  zip: string | null
  lat: number | null
  lng: number | null
  rating_avg: number
  review_count: number
  follower_count: number
  following_count: number
  top_cook_badge: boolean
  stripe_account_id: string | null
  permit_status: 'none' | 'pending' | 'verified'
  is_suspended: boolean
  requires_admin_approval: boolean
  created_at: string
  updated_at: string
}

export interface Follow {
  follower_id: string
  following_id: string
  created_at: string
}

export interface Listing {
  id: string
  user_id: string
  title: string
  description: string | null
  cuisine_tag: string | null
  emoji: string | null
  allergens: string[]
  photo_urls: string[]
  video_url: string | null
  quantity_total: number
  quantity_left: number
  price_cents: number
  made_at: string | null
  expires_at: string | null
  pickup_start: string | null
  pickup_end: string | null
  lat: number | null
  lng: number | null
  city: string | null
  state: string | null
  status: 'draft' | 'active' | 'hidden' | 'expired' | 'sold_out'
  report_count: number
  is_flagged: boolean
  recipe_id: string | null
  created_at: string
  updated_at: string
}

export interface Recipe {
  id: string
  listing_id: string | null
  user_id: string
  title: string | null
  ingredients: RecipeIngredient[]
  steps: RecipeStep[]
  cook_time_mins: number | null
  servings: number | null
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface RecipeIngredient {
  name: string
  amount: string
  unit: string
}

export interface RecipeStep {
  step_number: number
  instruction: string
}

export interface Exchange {
  id: string
  listing_id: string
  requester_id: string
  provider_id: string
  quantity: number
  pickup_time: string | null
  message: string | null
  status: 'pending' | 'confirmed' | 'completed' | 'reviewed' | 'cancelled'
  payment_intent_id: string | null
  amount_cents: number
  created_at: string
  updated_at: string
}

export interface Review {
  id: string
  exchange_id: string
  reviewer_id: string
  reviewee_id: string
  stars_taste: number
  stars_safety: number
  stars_packaging: number
  stars_punctuality: number
  stars_avg: number
  comment: string | null
  created_at: string
}

export interface Report {
  id: string
  listing_id: string
  reporter_id: string
  reason: 'spam' | 'unsafe' | 'inappropriate' | 'mislabeled' | 'other'
  details: string | null
  created_at: string
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  body: string
  is_read: boolean
  created_at: string
}

export interface SavedListing {
  user_id: string
  listing_id: string
  created_at: string
}

// ---- Insert types (what you send for INSERT) ----

export type UserInsert = Pick<User, 'id' | 'email'> &
  Partial<Omit<User, 'id' | 'email' | 'rating_avg' | 'review_count' | 'created_at' | 'updated_at'>>

export type ListingInsert = Pick<Listing, 'user_id' | 'title'> &
  Partial<Omit<Listing, 'id' | 'user_id' | 'title' | 'created_at' | 'updated_at'>>

export type ExchangeInsert = Pick<Exchange, 'listing_id' | 'requester_id' | 'provider_id' | 'quantity'> &
  Partial<Omit<Exchange, 'id' | 'created_at' | 'updated_at'>>

export type ReviewInsert = Omit<Review, 'id' | 'stars_avg' | 'created_at'>

export type MessageInsert = Pick<Message, 'conversation_id' | 'sender_id' | 'body'>

// ---- Joined / enriched types (for UI) ----

export interface ListingWithCook extends Listing {
  users: Pick<User, 'id' | 'name' | 'avatar_url' | 'rating_avg' | 'review_count' | 'top_cook_badge' | 'city'>
}

export interface ExchangeWithDetails extends Exchange {
  listings: Pick<Listing, 'id' | 'title' | 'cuisine_tag' | 'photo_urls' | 'price_cents' | 'pickup_start' | 'pickup_end'>
  requester: Pick<User, 'id' | 'name' | 'avatar_url'>
  provider: Pick<User, 'id' | 'name' | 'avatar_url'>
}

// ---- Supabase Database type (for createClient generic) ----

export interface Database {
  public: {
    Tables: {
      users: { Row: User; Insert: UserInsert; Update: Partial<UserInsert> }
      listings: { Row: Listing; Insert: ListingInsert; Update: Partial<ListingInsert> }
      recipes: { Row: Recipe; Insert: Omit<Recipe, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Recipe> }
      exchanges: { Row: Exchange; Insert: ExchangeInsert; Update: Partial<ExchangeInsert> }
      reviews: { Row: Review; Insert: ReviewInsert; Update: never }
      reports: { Row: Report; Insert: Omit<Report, 'id' | 'created_at'>; Update: never }
      messages: { Row: Message; Insert: MessageInsert; Update: Partial<Pick<Message, 'is_read'>> }
      saved_listings: { Row: SavedListing; Insert: Omit<SavedListing, 'created_at'>; Update: never }
      follows: { Row: Follow; Insert: Omit<Follow, 'created_at'>; Update: never }
    }
  }
}
