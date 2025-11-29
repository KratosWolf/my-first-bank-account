import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { getUserProfileDirect } from '../../../src/lib/getUserProfile';

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

      // Apenas redirecionar baseado no perfil após callback do Google
      if (url.includes('/api/auth/callback')) {
        // Retornar para o baseUrl para deixar o signIn callback processar
        return baseUrl;
      }

      // Se URL já for absoluta e do mesmo domínio, usar ela
      if (url.startsWith(baseUrl)) {
        return url;
      }

      // Default: redirecionar para home
      return baseUrl;
    },
    async signIn({ user, account, profile }) {
      // Log do usuário que está fazendo login
      console.log('🔐 SignIn callback:', {
        email: user.email,
        name: user.name,
        provider: account?.provider,
      });

      // Permitir login (validação será feita no redirect)
      return true;
    },
    async session({ session, token }) {
      if (session?.user && token?.sub) {
        (session.user as any).id = token.sub;
      }

      // Buscar perfil do usuário e adicionar à sessão
      if (session?.user?.email) {
        try {
          const userProfile = await getUserProfileDirect(session.user.email);
          if (userProfile) {
            (session.user as any).role = userProfile.role;
            (session.user as any).familyId = userProfile.familyId;
            (session.user as any).childId = userProfile.childId;
            (session.user as any).userName = userProfile.name;
            (session.user as any).avatar = userProfile.avatar;

            console.log('✅ Sessão enriquecida com perfil:', {
              email: session.user.email,
              role: userProfile.role,
              name: userProfile.name,
            });
          } else {
            console.warn('⚠️ Perfil não encontrado para:', session.user.email);
            (session.user as any).role = 'unauthorized';
          }
        } catch (error) {
          console.error('❌ Erro ao enriquecer sessão:', error);
          (session.user as any).role = 'error';
        }
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