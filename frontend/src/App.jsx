// import logo from './logo.svg';
import { React } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import {
  RouterProvider,
  createBrowserRouter
} from 'react-router-dom';
import './App.css';
import { Footer, Header, Loading, Toast } from './components';
import { LoadingContext, useLoading } from './functions/context/LoadingFunc';
import { ToastContext, useToast } from './functions/context/ToastFunc';
import {
  About,
  AdminArticle,
  AdminArticles,
  AdminBlog,
  AdminBlogs,
  AdminNews,
  AdminOrder,
  AdminOrders,
  AdminPage,
  AdminProduct,
  AdminProducts,
  AdminReview,
  AdminReviews,
  AdminShippingMethod,
  AdminShippingMethods,
  Article,
  Blog,
  Blogs,
  Cart,
  ErrorPage,
  FAQ,
  OrderCompleted,
  OrderForm,
  Product,
  Products,
  ReviewForm,
  Test,
  Top
} from './pages';

window.onpageshow = function(event) {
	if (event.persisted) {
		window.location.reload();
	}
};

const App = () => {
  const router = createBrowserRouter([
    {
      path: '/',
      element: <ErrorBoundary fallback={<ErrorPage />}><Top /></ErrorBoundary>
    },
    {
      path: '/about',
      element: <ErrorBoundary fallback={<ErrorPage />}><About /></ErrorBoundary>
    },
    {
      path: '/products',
      element: <ErrorBoundary fallback={<ErrorPage />}><Products /></ErrorBoundary>
    },
    {
      path: '/products/:product_id',
      element: <ErrorBoundary fallback={<ErrorPage />}><Product /></ErrorBoundary>
    },
    {
      path: '/cart',
      element: <ErrorBoundary fallback={<ErrorPage />}><Cart /></ErrorBoundary>
    },
    {
      path: '/blogs',
      element: <ErrorBoundary fallback={<ErrorPage />}><Blogs /></ErrorBoundary>
    },
    {
      path: '/blogs/:blog_id',
      element: <ErrorBoundary fallback={<ErrorPage />}><Blog /></ErrorBoundary>
    },
    {
      path: '/articles/:article_id',
      element: <ErrorBoundary fallback={<ErrorPage />}><Article /></ErrorBoundary>
    },
    {
      path: '/faq',
      element: <ErrorBoundary fallback={<ErrorPage />}><FAQ /></ErrorBoundary>
    },
    {
      path: '/order-form',
      element: <ErrorBoundary fallback={<ErrorPage />}><OrderForm /></ErrorBoundary>
    },
    {
      path: '/order-completed',
      element: <ErrorBoundary fallback={<ErrorPage />}><OrderCompleted /></ErrorBoundary>
    },
    {
      path: '/reviews/:ordered_product_id',
      element: <ErrorBoundary fallback={<ErrorPage />}><ReviewForm /></ErrorBoundary>
    },
    {
      path: '/admin/',
      element: <ErrorBoundary fallback={<ErrorPage />}><AdminPage /></ErrorBoundary>,
      children: [
        {
          path: '',
          element: <AdminOrders />,
        },
        {
          path: 'admin-orders',
          element: <AdminOrders />,
        },
        {
          path: 'admin-orders/:order_id',
          element: <AdminOrder />,
        },
        {
          path: 'admin-products',
          element: <AdminProducts />,
        },
        {
          path: 'admin-products/:product_id',
          element: <AdminProduct />,
        },
        {
          path: 'admin-blogs',
          element: <AdminBlogs />,
        },
        {
          path: 'admin-blogs/:blog_id',
          element: <AdminBlog />,
        },
        {
          path: 'articles',
          element: <AdminArticles />,
        },
        {
          path: 'articles/:article_id',
          element: <AdminArticle />,
        },
        {
          path: 'admin-reviews',
          element: <AdminReviews />,
        },
        {
          path: 'admin-reviews/:review_id',
          element: <AdminReview />,
        },
        {
          path: 'admin-shipping-methods',
          element: <AdminShippingMethods />,
        },
        {
          path: 'admin-shipping-methods/:method_id',
          element: <AdminShippingMethod />,
        },
        {
          path: 'admin-news',
          element: <AdminNews />,
        },
      ],
    },
    {
      path: '/test',
      element: <ErrorBoundary fallback={<ErrorPage />}><Test/></ErrorBoundary>
    },
    {
      path: '*',
      element: <ErrorPage />
    }
  ]);

  return (
    <LoadingContext.Provider value={useLoading()}>
    <ToastContext.Provider value={useToast()}>
      <Header />
      <Toast />
      <Loading />
      <RouterProvider router={router} />
      <Footer />
    </ToastContext.Provider>
    </LoadingContext.Provider>
  );
};

export default App;