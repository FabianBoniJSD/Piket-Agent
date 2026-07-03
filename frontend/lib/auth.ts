import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const username = typeof credentials?.username === 'string' ? credentials.username : ''
        const password = typeof credentials?.password === 'string' ? credentials.password : ''

        const expectedUsername = process.env.AUTH_USERNAME
        const expectedPassword = process.env.AUTH_PASSWORD

        if (!expectedUsername || !expectedPassword) {
          return null
        }

        if (username === expectedUsername && password === expectedPassword) {
          return {
            id: 'admin',
            name: 'Piket Admin',
          }
        }

        return null
      },
    }),
  ],
}
