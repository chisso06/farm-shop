// import logo from './logo.svg';
import { React } from 'react';
import {
  RouterProvider,
  createBrowserRouter
} from 'react-router-dom';
import './App.css';
import { Footer, Header } from './components';
import { About, Cart, FAQ, Product, Products, Top } from './pages';

const router = createBrowserRouter([
  { path: '/', element: <Top /> },
  { path: '/about', element: <About/> },
  { path: '/products', element: <Products/> },
  { path: '/products/:productId', element: <Product/> },
  { path: '/cart', element: <Cart/> },
  { path: '/faq', element: <FAQ/> }
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
