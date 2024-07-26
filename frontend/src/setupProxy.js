const { createProxyMiddleware } = require('http-proxy-middleware');
const uri = new URL(window.location.href);
const BACKEND_ORIGIN = process.env.REACT_APP_BACKEND_ORIGIN || uri.origin;

module.exports = function(app) {
  app.use(
    '/backend',
    createProxyMiddleware({
      target: BACKEND_ORIGIN,
      changeOrigin: true,
    })
  );
};
