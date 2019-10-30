module.exports = {
  presets: ['@babel/preset-env', '@babel/typescript'],
  env: {
    test: {
      plugins: ['@babel/plugin-transform-runtime'],
    },
  },
};
