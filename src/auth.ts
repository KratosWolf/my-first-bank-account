import NextAuth, { NextAuthConfig } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

// NextAuth v4 compatible configuration
export const authOptions: NextAuthConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      console.log('NextAuth redirect:', { url, baseUrl });

      // Always redirect to dashboard after successful signin
      if (
        url === baseUrl ||
        url === `${baseUrl}/` ||
        url.includes('/api/auth/callback')
      ) {
        const dashboardUrl = `${baseUrl}/dashboard`;
        console.log('Redirecting to dashboard:', dashboardUrl);
        return dashboardUrl;
      }

      // If URL is absolute and same domain, use it
      if (url.startsWith(baseUrl)) {
        return url;
      }

      // Otherwise, redirect to dashboard
      return `${baseUrl}/dashboard`;
    },
    async session({ session, token }) {
      if (session?.user && token?.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ user, token }) {
      if (user) {
        token.uid = user.id;
      }
      return token;
    },
  },
};

export default NextAuth(authOptions);
