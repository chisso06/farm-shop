// import logo from './logo.svg';
import { React } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import {
  RouterProvider,
  createBrowserRouter
} from 'react-router-dom';
import './App.css';
import { Footer, Header, Toast } from './components';
import { ToastContext, useToast } from './functions/context/ToastFunc';
import {
  About,
  AdminPage,
  Cart,
  ErrorPage,
  FAQ,
  OrderCompleted,
  OrderForm,
  Product,
  Products,
  Test,
  Top
} from './pages';

window.onpageshow = function(event) {
	if (event.persisted) {
		 window.location.reload();
	}
};

function App() {
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
      path: '/admin/',
      element: <ErrorBoundary fallback={<ErrorPage />}><AdminPage /></ErrorBoundary>
    },
    {
      path: '/admin/:page',
      element: <ErrorBoundary fallback={<ErrorPage />}><AdminPage /></ErrorBoundary>
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
    <ToastContext.Provider value={useToast()}>
      <Header />
      <Toast />
      <RouterProvider router={router} />
      <Footer />
    </ToastContext.Provider>
  );
};

export default App;