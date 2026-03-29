import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { getUserProfileDirect } from '../../../src/lib/getUserProfile';

export const authOptions: NextAuthOptions = {
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

      // Após callback do OAuth, redirecionar para página intermediária
      if (
        url.includes('/api/auth/callback') ||
        url.includes('/api/auth/signin')
      ) {
        // Redirecionar para index que fará o roteamento correto
        const indexUrl = `${baseUrl}/`;
        console.log('🔄 Redirecionando para index para roteamento:', indexUrl);
        return indexUrl;
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
      // Passar dados do token (já enriquecido) para a sessão
      if (session?.user && token?.sub) {
        (session.user as any).id = token.sub;
        (session.user as any).role = token.role;
        (session.user as any).familyId = token.familyId;
        (session.user as any).childId = token.childId;
        (session.user as any).userName = token.userName;
        (session.user as any).avatar = token.avatar;

        console.log('✅ Sessão construída do token:', {
          email: session.user.email,
          role: token.role,
          childId: token.childId,
        });
      }

      return session;
    },
    async jwt({ user, token, account, trigger }) {
      if (user && account) {
        token.uid = user.id;

        // Buscar perfil do usuário e adicionar ao token
        // Isso permite que redirect() tenha acesso ao role e childId
        try {
          const userProfile = await getUserProfileDirect(user.email!);
          if (userProfile) {
            token.role = userProfile.role;
            token.childId = userProfile.childId;
            token.familyId = userProfile.familyId;
            token.userName = userProfile.name;
            token.avatar = userProfile.avatar;

            console.log('✅ Token enriquecido com perfil:', {
              email: user.email,
              role: userProfile.role,
              childId: userProfile.childId,
            });
          } else {
            console.warn('⚠️ Perfil não encontrado para:', user.email);
            token.role = 'unauthorized';
          }
        } catch (error) {
          console.error('❌ Erro ao enriquecer token:', error);
          token.role = 'error';
        }
      }
      return token;
    },
  },
};

export default NextAuth(authOptions);
