import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";

// Lazy: the build collects page data without Firebase credentials, so only initialize on first use.
function getAdminAuth(): Auth {
  if (!getApps().length) {
    try {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID as string,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL as string,
          // Replace escaped newline characters and strip quotes if any
          privateKey: (process.env.FIREBASE_PRIVATE_KEY as string)
            ?.replace(/^"|"$/g, "")
            ?.replace(/\\n/g, "\n"),
        }),
      });
    } catch (error) {
      console.error("Firebase admin initialization error", error);
    }
  }
  return getAuth();
}

export const adminAuth = new Proxy({} as Auth, {
  get(_target, property) {
    const auth = getAdminAuth();
    const value = Reflect.get(auth, property, auth);
    return typeof value === "function" ? value.bind(auth) : value;
  },
});
