import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "@/lib/prisma"
import { NextAuthOptions } from "next-auth"

export const dynamic = "force-dynamic";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma) as any,
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    useSecureCookies: true,
    cookies: {
        sessionToken: {
            name: `__Secure-next-auth.session-token`,
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: true,
            },
        },
    },
    callbacks: {
        signIn: async ({ user }) => {
            const allowedEmail = process.env.ALLOWED_EMAIL;
            if (allowedEmail && user.email !== allowedEmail) {
                return false; // Deny sign in
            }
            return true; // Allow sign in
        },
        session: async ({ session, user }) => {
            if (session.user) {
                (session.user as any).id = user.id;
            }
            return session;
        },
    },
    pages: {
        signIn: '/',
    },
    trustHost: true, // Trust proxy headers for HTTPS
} as NextAuthOptions

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
