import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './context/AuthContext';
import { StoreSettingsProvider } from './context/StoreSettingsContext';
import { ToastProvider } from './context/ToastContext';
import { WishlistProvider } from './context/WishlistContext';
import { CartProvider } from './context/CartContext';

function App() {
  return (
    <AuthProvider>
      <StoreSettingsProvider>
        <ToastProvider>
          <WishlistProvider>
            <CartProvider>
              <AppRoutes />
            </CartProvider>
          </WishlistProvider>
        </ToastProvider>
      </StoreSettingsProvider>
    </AuthProvider>
  );
}

export default App;
