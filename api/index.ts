import { createRequire } from "node:module";

// Vercel runs this function as ESM. The production build emits the Express
// API as CommonJS, so load that compiled artifact explicitly instead of
// importing the TypeScript source with an extensionless path.
const require = createRequire(import.meta.url);
const serverModule = require("../dist/server.cjs");
const app = serverModule.default ?? serverModule;

export default app;
