module.exports = {
  apps: [
    {
      name: 'api-nodejs-fastify',
      script: 'src/index.mjs',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
