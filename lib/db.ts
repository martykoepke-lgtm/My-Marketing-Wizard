import { createClient, type Client } from "@libsql/client";
import { initSchema } from "./schema";

let _client: Client | null = null;
let _schemaReady: Promise<void> | null = null;

function getClient(): Client {
  if (!_client) {
    _client = createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return _client;
}

export async function getDb(): Promise<Client> {
  const client = getClient();
  if (!_schemaReady) {
    _schemaReady = initSchema(client);
  }
  await _schemaReady;
  return client;
}
