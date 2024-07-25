const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/backend',
    createProxyMiddleware({
      target: "https://farm-shop-deploy.vercel.app",
      changeOrigin: true,
    })
  );
};
