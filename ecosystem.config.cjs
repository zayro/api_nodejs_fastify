module.exports = {
  apps: [
    {
      name: 'api-hv',
      script: 'src/index.mjs',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
