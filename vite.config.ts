import { defineConfig } from "vite-plus";

export default defineConfig({
  build: {
    emptyOutDir: true,
    minify: false,
    rollupOptions: {
      external: [/^node:/],
      output: {
        entryFileNames: "index.js",
        format: "es",
      },
    },
    ssr: "src/index.ts",
    target: "node24",
  },
  lint: {
    ignorePatterns: ["dist/**"],
    plugins: ["eslint", "typescript", "unicorn", "oxc", "import", "promise"],
    rules: {
      "import/no-duplicates": "error",
      "import/no-self-import": "error",
      "import/no-empty-named-blocks": "error",
      "import/first": "error",
      "import/no-mutable-exports": "error",
      "@typescript-eslint/consistent-type-assertions": [
        "error",
        { assertionStyle: "never" },
      ],
      "typescript/no-explicit-any": "error",
      "typescript/no-unsafe-argument": "error",
      "typescript/no-unsafe-assignment": "error",
      "typescript/no-unsafe-call": "error",
      "typescript/no-unsafe-function-type": "error",
      "typescript/no-unsafe-member-access": "error",
      "typescript/no-unsafe-return": "error",
      "typescript/no-unsafe-type-assertion": "error",
    },
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  run: {
    cache: true,
  },
  ssr: {
    noExternal: true,
  },
});
