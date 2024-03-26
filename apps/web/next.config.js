const path = require("path");

module.exports = {
  reactStrictMode: true,
  // transpilePackages: ["@repo/ui"], // NOTE: this is not needed anymore, kept only as example
  output: "standalone",
  experimental: {
    outputFileTracingRoot: path.join(__dirname, "../../"),
  },
};
