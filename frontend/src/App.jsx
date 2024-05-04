// import logo from './logo.svg';
import { React } from 'react';
import {
  RouterProvider,
  createBrowserRouter
} from 'react-router-dom';
import './App.css';
import { Footer, Header, Toast } from './components';
import { ToastContext, useToast } from './functions/ToastFunc';
import {
  About,
  AdminPage,
  Cart,
  FAQ,
  OrderCompleted,
  OrderForm,
  Product,
  Products,
  Top
} from './pages';

window.onpageshow = function(event) {
	if (event.persisted) {
		 window.location.reload();
	}
};

function App() {
  const router = createBrowserRouter([
    { path: '/', element: <Top /> },
    { path: '/about', element: <About /> },
    { path: '/products', element: <Products /> },
    { path: '/products/:product_id', element: <Product /> },
    { path: '/cart', element: <Cart /> },
    { path: '/faq', element: <FAQ /> },
    { path: '/order-form', element: <OrderForm />},
    { path: '/order-completed', element: <OrderCompleted />},
    // { path: '/order-processing', element: <OrderProcessing />},
    { path: '/admin/', element: <AdminPage />},
    { path: '/admin/:page', element: <AdminPage />}
  ]);

  return (
    <ToastContext.Provider value={useToast()}>
      <Header />
      <Toast />
      <RouterProvider router={router} />
      <Footer />
    </ToastContext.Provider>
  );
}

export default App;