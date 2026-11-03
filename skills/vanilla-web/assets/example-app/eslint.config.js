import js from '@eslint/js';

export default [
  { ignores: ['node_modules/', 'test-results/', 'playwright-report/'] },
  js.configs.recommended,
  // tsc reports undeclared names with real browser and Node types.
  { rules: { 'no-undef': 'off' } },
];
