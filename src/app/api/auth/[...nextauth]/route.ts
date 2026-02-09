import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import prisma from "@/lib/prisma"
import { NextAuthOptions } from "next-auth"

export const dynamic = "force-dynamic";

// --- Codespaces Support ---
// Automatically detect and set the URL when running in GitHub Codespaces
const isCodespaces = process.env.CODESPACES === 'true' || !!process.env.CODESPACE_NAME;

if (isCodespaces) {
    // 1. Try to construct the exact URL if possible
    if (process.env.CODESPACE_NAME && process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN) {
        // Construct the public URL: https://<name>-3000.<domain>
        const codespaceUrl = `https://${process.env.CODESPACE_NAME}-3000.${process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}`;

        // Set it, invalidating the localhost default
        if (!process.env.NEXTAUTH_URL || process.env.NEXTAUTH_URL.includes('localhost')) {
            process.env.NEXTAUTH_URL = codespaceUrl;
            console.log(`[Codespaces] Auto-configured NEXTAUTH_URL to: ${codespaceUrl}`);
        }
    } else {
        // 2. If we can't construct it but know we are in Codespaces (e.g. only CODESPACES=true is set),
        // unset localhost so NextAuth uses the Host header (trustHost: true).
        // This is crucial because .env often has NEXTAUTH_URL=http://localhost:3000
        if (process.env.NEXTAUTH_URL?.includes('localhost')) {
            console.log(`[Codespaces] Unsetting local NEXTAUTH_URL '''${process.env.NEXTAUTH_URL}''' to allow host header detection via trustHost.`);
            delete process.env.NEXTAUTH_URL;
        }
    }
}

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma) as any,
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
    useSecureCookies: process.env.NODE_ENV === "production",
    cookies: {
        sessionToken: {
            name: `${process.env.NODE_ENV === "production" ? "__Secure-" : ""}next-auth.session-token`,
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: process.env.NODE_ENV === "production",
            },
        },
    },
    callbacks: {
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
