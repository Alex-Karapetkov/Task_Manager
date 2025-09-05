// database to store users

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getUserByEmail, verifyPassword, createUser } from "../../../lib/db";

import type { NextAuthOptions  } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { Session } from "next-auth";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text", placeholder: "you@example.com" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const user = await getUserByEmail(credentials.email);
                if (!user) return null;

                const isValid = await verifyPassword(user, credentials.password);
                if (!isValid) return null;

                // return user object to store in session
                return { id: user.id, name: user.username, email: user.email };
            },
        }),
    ],

    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, user }: { token: JWT; user?: any }) {
            if (user) token.id = (user as any).id;
            return token;
        },
        async session({ session, token }: { session: Session; token: JWT }) {
            if (token && session.user) (session.user as any).id = token.id as string;
            return session;
        },
    },
    pages: {
        signIn: "/auth/signin",     // optional custom signin page
    },
    secret: process.env.NEXTAUTH_SECRET || "supersecret",
};

export default NextAuth(authOptions);