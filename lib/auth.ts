import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import type { NextAuthOptions } from "next-auth";
import credentials from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    credentials({
      name: "Credentials",
      id: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await connectDB();
        const user = await User.findOne({
          email: credentials?.email,
        }).select("+password");

        if (!user) {
          throw new Error("Email no encontrado");
        }

        const isValid = await bcrypt.compare(credentials!.password, user.password);
        if (!isValid) {
          throw new Error("Contraseña incorrecta");
        }

        return user;
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      async profile(profile) {
        await connectDB();
        let user = await User.findOne({ email: profile.email });

        if (!user) {
          user = new User({
            email: profile.email,
            name: profile.name,
            image: profile.picture,
          });
          await user.save();
        } else {
          user.image = profile.picture; // Actualiza la imagen si ya existe el usuario
          await user.save();
        }

        return user;
      },
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      return baseUrl;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          ...session.user,
          name: token.name,
          email: token.email,
          image: token.image as string,
        };
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.image = user.image;
      }
      return token;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    maxAge: 24 * 60 * 60, // 24 hours
  },
};