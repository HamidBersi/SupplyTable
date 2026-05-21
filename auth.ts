import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

/**
 * Hash PHC Argon2 : la chaîne contient des `$`. Next.js fait de l'expansion sur les
 * valeurs `.env*` (`$VAR`) et **casse** le hash si on colle le PHC en clair.
 * Préférer `AUTH_PASSWORD_HASH_BASE64` (voir `npm run hash-password`).
 */
export function phcHashFromEnv(): string | undefined {
  const b64 = process.env.AUTH_PASSWORD_HASH_BASE64?.trim();
  if (b64) {
    try {
      const decoded = Buffer.from(b64, "base64").toString("utf8").trim();
      if (decoded.startsWith("$argon2")) return decoded;
    } catch {
      return undefined;
    }
  }
  const raw = process.env.AUTH_PASSWORD_HASH?.trim();
  if (!raw) return undefined;
  return raw.replace(/\\\$/g, "$");
}

/** État de la config (page login, messages d’erreur). */
export function getAuthConfigStatus() {
  const email = process.env.AUTH_EMAIL?.trim().toLowerCase();
  const hash = phcHashFromEnv();
  return {
    ready: Boolean(email && hash),
    email: email ?? "",
  };
}

/**
 * Auth.js (next-auth v5) : session en cookie httpOnly ; Argon2 importé dynamiquement dans authorize.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  pages: { signIn: "/login" },
  session: { strategy: "jwt", maxAge: 60 * 60 * 12 },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        const email = typeof credentials?.email === "string" ? credentials.email : "";
        const password = typeof credentials?.password === "string" ? credentials.password : "";
        if (!email || !password) return null;

        const expected = process.env.AUTH_EMAIL?.trim().toLowerCase();
        const hash = phcHashFromEnv();
        if (!expected || !hash) return null;
        if (email.trim().toLowerCase() !== expected) return null;

        try {
          const { verify } = await import("argon2");
          if (!(await verify(hash, password))) return null;
        } catch {
          return null;
        }

        return {
          id: "1",
          email: email.trim(),
          name: "Utilisateur",
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user?.email) token.email = user.email;
      return token;
    },
    session({ session, token }) {
      if (session.user && token.email) session.user.email = token.email as string;
      return session;
    },
  },
});
