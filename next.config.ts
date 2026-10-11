import type { NextConfig } from "next";

const isProductionBuild = process.env.NODE_ENV === "production";
const frameAncestors = "'self' https://lovable.dev https://*.lovable.dev https://*.lovable.app https://*.lovableproject.com";
const minimumBuildWorkerHeapMegabytes = 4096;
const heapOptionPattern = /--max[-_]old[-_]space[-_]size(?:=(\d+)|\s+(\d+))?/g;

function ensureMinimumBuildWorkerHeap() {
  const inheritedNodeOptions = process.env.NODE_OPTIONS?.trim() ?? "";
  let containsHeapOption = false;
  const nodeOptions = inheritedNodeOptions.replace(
    heapOptionPattern,
    (option, equalsValue, spacedValue) => {
      containsHeapOption = true;
      const configuredHeap = Number(equalsValue ?? spacedValue ?? 0);
      return configuredHeap >= minimumBuildWorkerHeapMegabytes
        ? option
        : `--max-old-space-size=${minimumBuildWorkerHeapMegabytes}`;
    },
  );

  process.env.NODE_OPTIONS = containsHeapOption
    ? nodeOptions
    : [nodeOptions, `--max-old-space-size=${minimumBuildWorkerHeapMegabytes}`].filter(Boolean).join(" ");
}

// Next starts TypeScript in a child process. This also covers deployments
// whose dashboard command invokes `next build` directly instead of npm run.
if (isProductionBuild) ensureMinimumBuildWorkerHeap();

const nextConfig: NextConfig = {
  // Lovable publishes the dist/ directory produced by the project build.
  distDir: "dist",
  typescript: {
    // Lovable build:dev runs in a memory-limited sandbox; typecheck runs separately.
    ignoreBuildErrors: process.env.SKIP_NEXT_TYPECHECK === "1",
    // The production build only needs application sources. Test fixtures and
    // operational scripts are checked by their own commands and can otherwise
    // exhaust the build worker heap on constrained CI machines.
    tsconfigPath: isProductionBuild ? "tsconfig.build.json" : "tsconfig.json",
  },
  turbopack: {
    root: process.cwd(),
  },
  // Publishing runs on a memory-limited builder: fewer parallel workers and no
  // server source maps keep the peak memory below the build machine limit.
  productionBrowserSourceMaps: false,
  experimental: {
    cpus: 2,
    serverSourceMaps: false,
  },
  outputFileTracingIncludes: {
    "/api/financeiro/relatorios": ["./node_modules/pdfkit/js/data/**/*"],
    "/api/frotas/relatorios": ["./node_modules/pdfkit/js/data/**/*"],
    "/api/saude/relatorios": ["./node_modules/pdfkit/js/data/**/*"],
  },
  async headers() {
    return [{
      source: "/:path*",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        // X-Frame-Options cannot allow-list origins; frame-ancestors restricts embedding
        // to the app itself and the Lovable editor preview.
        { key: "Content-Security-Policy", value: `frame-ancestors ${frameAncestors}` },
        { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=(self), payment=(), usb=()" },
        { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
        { key: "Content-Security-Policy-Report-Only", value: `default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors ${frameAncestors}; form-action 'self'; upgrade-insecure-requests` },
      ],
    }];
  },
};

export default nextConfig;
