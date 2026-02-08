import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import { auth as authConfig } from '@/lib/config/limits';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: authConfig.sessionMaxAge,
  },
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    authorized({ auth, request }) {
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
