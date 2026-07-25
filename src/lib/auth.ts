import { AuthOptions, DefaultSession, DefaultUser } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: 'Admin' | 'Doctor' | 'Receptionist' | 'Patient';
      nationality: 'Indian' | 'Non-Indian';
      yogiExperienceMonths: number;
      gender: 'Male' | 'Female';
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    role: 'Admin' | 'Doctor' | 'Receptionist' | 'Patient';
    nationality: 'Indian' | 'Non-Indian';
    yogiExperienceMonths: number;
    gender: 'Male' | 'Female';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: 'Admin' | 'Doctor' | 'Receptionist' | 'Patient';
    nationality: 'Indian' | 'Non-Indian';
    yogiExperienceMonths: number;
    gender: 'Male' | 'Female';
  }
}

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'yogi@gmail.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter an email and password');
        }

        await dbConnect();
        // Find user by email or username
        const input = credentials.email.trim();
        const user = await User.findOne({
          $or: [{ email: input }, { email: input.toLowerCase() }],
        });
        if (!user) {
          throw new Error('No account found with these credentials');
        }

        if (!user.passwordHash) {
          throw new Error('Please sign in with Google for this account');
        }

        // Validate password
        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) {
          throw new Error('Incorrect password');
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          nationality: user.nationality,
          yogiExperienceMonths: user.yogiExperienceMonths,
          gender: user.gender,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          await dbConnect();
          const email = user.email?.toLowerCase();
          if (!email) return false;

          const existingUser = await User.findOne({ email });
          if (!existingUser) {
            // Create a new Patient user for Google sign-in
            await User.create({
              name: user.name || 'Google User',
              email,
              role: 'Patient',
              yogiExperienceMonths: 12, // Default to eligible for IPD (1+ year)
              nationality: 'Indian', // Default
              gender: 'Male', // Default, they can change it later
              contactNumber: '', // Default empty
            });
          } else if (user.name && !existingUser.name) {
            existingUser.name = user.name;
            await existingUser.save();
          }
        } catch (error) {
          console.error('Error during Google sign-in creation:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        // Check if user object from authorize() has custom fields (CredentialsProvider)
        if ('role' in user) {
          token.id = user.id;
          token.role = user.role;
          token.nationality = user.nationality;
          token.yogiExperienceMonths = user.yogiExperienceMonths;
          token.gender = user.gender;
        }
      }

      // Keep OAuth sessions synced with the database so admin access can be
      // granted simply by adding the person's email in the admin screen.
      if (token.email) {
        await dbConnect();
        const dbUser = await User.findOne({ email: token.email.toLowerCase() });
        if (dbUser) {
          token.id = dbUser._id.toString();
          token.role = dbUser.role;
          token.nationality = dbUser.nationality;
          token.yogiExperienceMonths = dbUser.yogiExperienceMonths;
          token.gender = dbUser.gender;
          token.name = dbUser.name;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.nationality = token.nationality;
        session.user.yogiExperienceMonths = token.yogiExperienceMonths;
        session.user.gender = token.gender;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login', // custom sign-in page if needed
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development-only-replace-in-prod',
};
