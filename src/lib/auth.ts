import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { object, string, ZodError } from "zod";
import { isEqualToHashedPassword } from "@/core/security/isEqualToHashedPassword";

const signInSchema = object({
  username: string({ required_error: "Usuario es requerido" }).min(
    1,
    "Usuario es requerido"
  ),
  password: string({ required_error: "Contraseña es requerida" })
    .min(1, "Contraseña es requerida")
    .min(8, "Contraseña minima de 8 caracteres")
    .max(32, "Contraseña maxima de 32 caracteres"),
});

declare module "next-auth" {
  /**
   * Returned by `auth`, `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's postal address. */
      id: string;
      companyId: string;
      /**
       * By default, TypeScript merges new interface properties and overwrites existing ones.
       * In this case, the default session user properties will be overwritten,
       * with the new ones defined above. To keep the default session user properties,
       * you need to add them back into the newly declared interface.
       */
    } & DefaultSession["user"];
  }

  interface JWT extends Record<string, unknown> {
    name?: string | null;
    email?: string | null;
    picture?: string | null;
    sub?: string;
    iat?: number;
    exp?: number;
    jti?: string;

    //Plus
    id: string;
    companyId: string;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // @ts-expect-error The user type (User) is it not including the types added on the Session type, thats why it marks that companyId is undefined
        token.companyId = user.companyId;
      }
      return token;
    },
    session({ session, token }) {
      //(..., user)
      // `session.user.address` is now a valid property, and will be type-checked
      // in places like `useSession().data.user` or `auth().user`
      session.user.id = token.id as string;
      session.user.companyId = token.companyId as string;
      return session;
    },
  },
  providers: [
    Credentials({
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      credentials: {
        username: { label: "username", type: "text" },
        password: { label: "password", type: "text" },
      },
      authorize: async (credentials) => {
        try {
          const { username, password } = await signInSchema.parseAsync(
            credentials
          );

          // FIXME: Ojo con esto, aqui tendria que estar el domain
          const userFetched = await fetch(
            process.env.FETCH_PATH_URL! + "/api/getuser?username=" + username
          );

          if (!userFetched.json) {
            return null;
          }

          const user = await userFetched.json();

          if (user.status == "inactive") {
            throw new Error("Este usuario esta bloqueado");
          }

          const isCorrectPassword = isEqualToHashedPassword(
            password,
            user.password
          );

          if (!isCorrectPassword) {
            throw new Error("Usuario o Contraseña Incorrecta");
          }

          return {
            id: user.id,
            name: user.name,
            username: user.username,
            companyId: user.companyId,
          };
        } catch (error) {
          if (error instanceof ZodError) {
            // Return `null` to indicate that the credentials are invalid
            return null;
          }
          return null;
        }
      },
    }),
  ],
});
