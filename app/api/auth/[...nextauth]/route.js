import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import User from "@/models/user";
import dbConnect from "@/lib/db";


export const authOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await dbConnect();
        const user = await User.findOne({ email: credentials.email });

        console.log("=========== User Found: ======", user);

        if (!user) throw new Error("User not found!");

        const isMatch = await bcrypt.compare(credentials.password, user.password);
        if (!isMatch) throw new Error("Invalid password!");

        return { id: user._id.toString(), name: user.name, email: user.email, role: user.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      console.log("JWT Callback - User:", user);
      if (user) {
        token.id = user.id; // ✅ Ensure ID is stored in token
        token.role = user.role;
      }
      console.log("JWT Token After Processing:", token);
      return token;
    },
    async session({ session, token }) {
      console.log("Session Callback - Token:", token);
      session.user.id = token.id; // ✅ Ensure ID is passed to session
      session.user.role = token.role;
      console.log("Session Data (Backend):", session);
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
