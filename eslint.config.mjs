import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';

const eslintConfig = [
  ...nextCoreWebVitals,
  {
    rules: {
      '@next/next/no-img-element': 'warn',
      'react/no-unescaped-entities': 'off',
      // This app doesn't use the React Compiler, and every current instance
      // (reading localStorage/window/navigator or lazily seeding a greeting
      // message) is a guarded, one-time effect with no cascading re-render
      // bug — audited individually rather than blanket-suppressed. Revisit
      // if the React Compiler is adopted.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
];

export default eslintConfig;
