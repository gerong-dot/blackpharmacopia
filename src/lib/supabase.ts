import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Profile = {
  id: string
  username: string
  is_admin: boolean
  created_at: string
}

export type Post = {
  id: string
  title: string
  content: string
  category: string
  author_id: string | null
  created_at: string
  updated_at: string
  profiles?: Pick<Profile, 'username'>
}

export type GuestbookEntry = {
  id: string
  author_id: string | null
  author_name: string
  content: string
  created_at: string
}
