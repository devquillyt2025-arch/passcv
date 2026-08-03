import coreWebVitals from 'eslint-config-next/core-web-vitals';
import typescript from 'eslint-config-next/typescript';

/**
 * Flat config, replacing .eslintrc.json.
 *
 * Next 16 removed the `next lint` command and ESLint 10 defaults to flat
 * config, so the old `{ "extends": ["next/core-web-vitals", "next/typescript"] }`
 * eslintrc no longer applies. The upgrade codemod has a transform for this
 * (next-lint-to-eslint-cli) but it crashes on Windows paths containing spaces,
 * so this is the equivalent done by hand — same two configs, same rules.
 */
export default [
  ...coreWebVitals,
  ...typescript,
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'scratch/**',
      'scripts/**',
      'assets/**',
      'public/**',
      // One-off maintenance scripts at the repo root. `next lint` only ever
      // covered the app source directories, so `eslint .` newly surfaces these;
      // ignoring them keeps the lint scope equivalent to before the upgrade.
      'refactor-ast.ts',
      'patch.js',
      'update_inputs.js',
      'update_inputs_accent.js',
    ],
  },
];
