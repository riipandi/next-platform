import { PrismaAdapter } from '@next-auth/prisma-adapter'
import type { NextAuthOptions } from 'next-auth'
import NextAuth from 'next-auth'
import GitHubProvider from 'next-auth/providers/github'

import prisma from '@/libraries/prisma'

if (!process.env.GITHUB_ID || !process.env.GITHUB_SECRET)
  throw new Error('Failed to initialize Github authentication')

export const authOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          gh_username: profile.login,
          email: profile.email,
          image: profile.avatar_url
        }
      }
    })
  ],
  secret: process.env.SECRET,
  pages: {
    signIn: `/login`,
    verifyRequest: `/login`,
    error: '/login' // Error code passed in query string as ?error=
  },
  adapter: PrismaAdapter(prisma),
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
        username: user.username
      }
    })
  }
} as NextAuthOptions

export default NextAuth(authOptions)
