// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");
const path = require("node:path");

const projectRoot = __dirname;
const repoRoot = path.resolve(projectRoot, "..");

const config = getDefaultConfig(projectRoot);

// The Convex backend is shared with the web app and lives in ../convex, so its
// generated `api.js` (which imports `convex/server`) sits outside this project
// root. Metro only resolves files inside known watch folders.
config.watchFolders = [repoRoot];

// Make sure the generated module and the app both use this project's copy of
// the `convex` package instead of the one hoisted in ../node_modules.
config.resolver.extraNodeModules = {
  convex: path.resolve(projectRoot, "node_modules", "convex"),
  ...config.resolver.extraNodeModules,
};

module.exports = config;
