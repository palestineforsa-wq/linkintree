// Next.js 15 instrumentation hook. Loaded once per runtime; routes Sentry
// init to the appropriate config based on where this code runs. Sentry v10
// auto-wires its onRequestError handler via the build plugin — no manual
// re-export is needed (and no longer exported from the package).

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}
