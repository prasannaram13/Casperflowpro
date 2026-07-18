// The explicit extension lets Vercel trace and bundle the Express API with
// this serverless entry point. The former extensionless import was emitted as
// `../server` and failed at runtime on Vercel's ESM Node environment.
import app from "../server.ts";

export default app;
