import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export default NextAuth({
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

      // Sempre redireciona para dashboard após signin bem-sucedido
      if (
        url === baseUrl ||
        url === `${baseUrl}/` ||
        url.includes('/api/auth/callback')
      ) {
        const dashboardUrl = `${baseUrl}/parent-dashboard`;
        console.log('Redirecting to parent dashboard:', dashboardUrl);
        return dashboardUrl;
      }

      // Se URL já for absoluta e do mesmo domínio, usar ela
      if (url.startsWith(baseUrl)) {
        return url;
      }

      // Caso contrário, redirecionar para parent dashboard
      return `${baseUrl}/parent-dashboard`;
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