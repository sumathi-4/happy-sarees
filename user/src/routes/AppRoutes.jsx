import { createBrowserRouter, RouterProvider, Outlet, Navigate } from 'react-router-dom';
import { PATHS } from './paths';
import Layout from '../components/Layout';
import Home from '../pages/Home';
import Shop from '../pages/Shop';
import ProductDetails from '../pages/ProductDetails';
import Wishlist from '../pages/Wishlist';
import Cart from '../pages/Cart';
import Checkout from '../pages/Checkout';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ForgotPassword from '../pages/ForgotPassword';
import VerifyOTP from '../pages/VerifyOTP';
import ResetPassword from '../pages/ResetPassword';
import Profile from '../pages/Profile';
import ProtectedRoute from './ProtectedRoute';
import About from '../pages/About';
import Contact from '../pages/Contact';
import SearchResults from '../pages/SearchResults';
import NotFound from '../pages/NotFound';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: PATHS.SHOP,
        element: <Shop />,
      },
      {
        path: PATHS.PRODUCT_DETAILS,
        element: <ProductDetails />,
      },
      {
        path: PATHS.WISHLIST,
        element: <Wishlist />,
      },
      {
        path: PATHS.CART,
        element: <Cart />,
      },
      {
        path: PATHS.CHECKOUT,
        element: <Checkout />,
      },
      {
        path: PATHS.LOGIN,
        element: <Login />,
      },
      {
        path: PATHS.REGISTER,
        element: <Register />,
      },
      {
        path: PATHS.FORGOT_PASSWORD,
        element: <ForgotPassword />,
      },
      {
        path: PATHS.VERIFY_OTP,
        element: <VerifyOTP />,
      },
      {
        path: PATHS.RESET_PASSWORD,
        element: <ResetPassword />,
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: PATHS.PROFILE,
            element: <Profile />,
          },
        ],
      },
      {
        path: PATHS.ABOUT,
        element: <About />,
      },
      {
        path: PATHS.CONTACT,
        element: <Contact />,
      },
      {
        path: PATHS.SEARCH,
        element: <SearchResults />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
]);

function AppRoutes() {
  return <RouterProvider router={router} />;
}

export default AppRoutes;
