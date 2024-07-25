const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    'https://farm-shop-deploy.vercel.app/backend',
    createProxyMiddleware({
      target: "https://farm-shop-deploy.vercel.app",
      changeOrigin: true,
    })
  );
};
