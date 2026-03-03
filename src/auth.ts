import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true, // Required for Vercel and similar hosts
  providers: [
    Credentials({
      credentials: {
        email: { label: "אימייל", type: "email" },
        password: { label: "סיסמה", type: "password" },
      },
      authorize: async (credentials) => {
        const email = process.env.ADMIN_EMAIL;
        const password = process.env.ADMIN_PASSWORD;
        if (!email || !password) {
          console.error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env");
          return null;
        }
        if (
          credentials?.email === email &&
          credentials?.password === password
        ) {
          return { id: "admin", email, name: "Admin" };
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/admin/login",
  },
});
