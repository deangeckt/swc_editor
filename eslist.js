module.exports = {
    env: {
        browser: true,
        es6: true,
        node: true,
    },
    extends: ['eslint:recommended', 'plugin:prettier/recommended'],
    globals: {
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly',
    },
    parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module',
    },
    rules: {
        // we only want single quotes
        quotes: ['error', 'single'],
        // we want to force semicolons
        semi: ['error', 'always'],
        // we use 4 spaces to indent our code
        indent: ['error', 4],
        // we want to avoid useless spaces
    },
};