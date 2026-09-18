import { spawnSync } from "node:child_process";
import { generateKeyPairSync } from "node:crypto";
// The suite creates its own in-memory PostgreSQL fixture; it never uses DATABASE_URL.
// A temporary local key satisfies Firebase's import-time credential parser. No authentication call is made.
const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048, privateKeyEncoding: { type: "pkcs8", format: "pem" }, publicKeyEncoding: { type: "spki", format: "pem" } });
const result = spawnSync(process.execPath, ["--import", "tsx", "--test", "--test-concurrency=1", "tests/frotas.integration.test.ts"], { stdio: "inherit", env: { ...process.env, DATABASE_URL: "postgresql://fixture:fixture@127.0.0.1:1/fleet_fixture", FIREBASE_PROJECT_ID: "fleet-fixture", FIREBASE_CLIENT_EMAIL: "fixture@fleet-fixture.iam.gserviceaccount.com", FIREBASE_PRIVATE_KEY: privateKey } });
process.exit(result.status ?? 1);
