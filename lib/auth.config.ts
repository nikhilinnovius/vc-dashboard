import type { AuthOptions } from "next-auth"
import Auth0Provider from "next-auth/providers/auth0"

export const authConfig: AuthOptions = {
  providers: [
    Auth0Provider({
      clientId: process.env.AUTH0_CLIENT_ID!,
      clientSecret: process.env.AUTH0_CLIENT_SECRET!,
      issuer: process.env.AUTH0_ISSUER,
      authorization: { params: { prompt: "login" } },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
    signOut: "/",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, account }) {
      if (account && account.access_token) {
        token.accessToken = account.access_token
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub
      }
      return session
    },
  },
  debug: process.env.NODE_ENV === "development",
}
