import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY
  ?.replace(/^"|"$/g, "")
  .replace(/\\n/g, "\n");

function createApp(): App {
  const existing = getApps()[0];
  if (existing) return existing;

  if (projectId && clientEmail && privateKey) {
    try {
      return initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
    } catch (error) {
      // A malformed key must not break the build; auth calls fail at runtime
      // until FIREBASE_PRIVATE_KEY is fixed in the project secrets.
      console.error("FIREBASE_PRIVATE_KEY inválida; autenticação indisponível até correção.", error);
    }
  }

  return initializeApp({ projectId: projectId || "celeriflow-build" });
}

export const adminAuth = getAuth(createApp());
