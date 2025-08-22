import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { HybridStorage } from '@/lib/storage/hybrid-storage';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          // Check if user exists in our system or create new family
          const family = await HybridStorage.getOrCreateFamily(user.email!);
          
          // Store user info
          if (!family.parentEmail) {
            await HybridStorage.updateFamily({
              parentEmail: user.email!,
              parentName: user.name!,
              parentAvatar: user.image || null
            });
          }
          
          return true;
        } catch (error) {
          console.error('Error during sign in:', error);
          return false;
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user?.email) {
        // Add user role and family info to session
        const family = await HybridStorage.getOrCreateFamily(session.user.email);
        session.user.role = 'parent';
        session.user.familyId = family.id;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.role = 'parent';
      }
      return token;
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};