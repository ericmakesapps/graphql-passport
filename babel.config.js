module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
        },
      },
    ],
    '@babel/typescript',
  ],
  env: {
    test: {
      plugins: ['@babel/plugin-transform-runtime'],
    },
  },
};
