import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import db from "@/lib/db"

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const result = await db.execute({
                    sql: "SELECT * FROM users WHERE email = ?",
                    args: [credentials.email]
                });

                const user = result.rows[0];

                if (!user || !user.password) return null;

                const passwordsMatch = await compare(credentials.password, user.password);

                if (passwordsMatch) {
                    return { id: user.id, name: user.name, email: user.email };
                }

                return null;
            }
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account.provider === 'google') {
                const email = user.email;
                if (!email) return false;

                // Check if user exists
                const result = await db.execute({
                    sql: "SELECT * FROM users WHERE email = ?",
                    args: [email]
                });

                if (result.rows.length === 0) {
                    // Create user
                    await db.execute({
                        sql: "INSERT INTO users (email, name, image, provider) VALUES (?, ?, ?, ?)",
                        args: [email, user.name || '', user.image || '', 'google']
                    });
                }
            }
            return true;
        },
        async jwt({ token, user, account }) {
            // We want the database ID in the token, not just the email
            if (token.email) {
                const result = await db.execute({
                    sql: "SELECT id FROM users WHERE email = ?",
                    args: [token.email]
                });
                if (result.rows.length > 0) {
                    token.id = result.rows[0].id;
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (token?.id) {
                session.user.id = token.id;
            }
            return session;
        }
    },
    pages: {
        signIn: '/login', // Check if I should implement this custom page
    }
})
