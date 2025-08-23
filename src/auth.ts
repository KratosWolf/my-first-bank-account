import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
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

      // Sempre redireciona para dashboard após signin bem-sucedido
      if (
        url === baseUrl ||
        url === `${baseUrl}/` ||
        url.includes('/api/auth/callback')
      ) {
        const dashboardUrl = `${baseUrl}/dashboard`;
        console.log('Redirecting to dashboard:', dashboardUrl);
        return dashboardUrl;
      }

      // Se URL já for absoluta e do mesmo domínio, usar ela
      if (url.startsWith(baseUrl)) {
        return url;
      }

      // Caso contrário, redirecionar para dashboard
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
});
