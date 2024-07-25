const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/backend',
    createProxyMiddleware({
      target: process.env.REACT_APP_BACKEND_ORIGIN,
      changeOrigin: true,
    })
  );
};
