// import logo from './logo.svg';
import { React } from 'react';
import {
  RouterProvider,
  createBrowserRouter
} from 'react-router-dom';
import './App.css';
import { Footer, Header } from './components';
import {
  About,
  Cart,
  FAQ,
  OrderCompleted,
  OrderForm,
  OrderProcessing,
  Product,
  Products,
  Top
} from './pages';

window.onpageshow = function(event) {
	if (event.persisted) {
		 window.location.reload();
	}
};

const router = createBrowserRouter([
  { path: '/', element: <Top /> },
  { path: '/about', element: <About /> },
  { path: '/products', element: <Products /> },
  { path: '/products/:product_id', element: <Product /> },
  { path: '/cart', element: <Cart /> },
  { path: '/faq', element: <FAQ /> },
  { path: '/order-form', element: <OrderForm />},
  { path: '/order-completed', element: <OrderCompleted />},
  { path: '/order-processing', element: <OrderProcessing />}
]);

function App() {
  return (
    <div>
      <Header />
      <RouterProvider router={router} />
      <Footer />
    </div>
  );
}

export default App;
