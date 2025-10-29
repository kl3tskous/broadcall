import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      twitter_id: string
      twitter_username: string | null
      twitter_name: string
      profile_image_url: string | null
      banner_image_url: string | null
      bio: string | null
      telegram_id: string | null
      telegram_username: string | null
      wallet_address: string | null
      joined_waitlist: boolean
    } & DefaultSession["user"]
  }
}
