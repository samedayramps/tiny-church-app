export const authConfig = {
  providers: ['email'],
  callbacks: {
    signIn: async ({ user, account, profile }) => {
      return true;
    },
    redirect: async ({ url, baseUrl }) => {
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  },
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/error',
    verifyRequest: '/verify-request',
  },
};

export const PROTECTED_ROUTES = [
  '/dashboard',
  '/settings',
  '/members',
  '/events',
  '/groups',
];

export const PUBLIC_ROUTES = [
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/verify-request',
  '/error',
]; 