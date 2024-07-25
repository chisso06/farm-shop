const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/backend',
    createProxyMiddleware({
      target: 'http://localhost:4242',
      changeOrigin: true,
    })
  );
};
