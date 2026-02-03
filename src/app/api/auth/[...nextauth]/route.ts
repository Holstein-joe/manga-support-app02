import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
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
        ...(process.env.NODE_ENV === 'development' ? [
            {
                id: 'credentials',
                name: 'Dev Login',
                type: 'credentials',
                credentials: {},
                authorize: async () => {
                    // Return a mock user for development
                    // This email should match ALLOWED_EMAIL if set, or just be valid
                    const devEmail = process.env.ALLOWED_EMAIL || "dev@example.com";

                    // Find or create the dev user in the DB to ensure ID exists
                    let user = await prisma.user.findUnique({ where: { email: devEmail } });
                    if (!user) {
                        user = await prisma.user.create({
                            data: {
                                email: devEmail,
                                name: "Dev User",
                                image: "https://placehold.co/100x100?text=Dev",
                            }
                        });
                    }
                    return user;
                }
            } as any
        ] : []),
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
