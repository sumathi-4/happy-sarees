import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './context/AuthContext';
import { StoreSettingsProvider } from './context/StoreSettingsContext';
import { WishlistProvider } from './context/WishlistContext';
import { CartProvider } from './context/CartContext';

function App() {
  return (
    <AuthProvider>
      <StoreSettingsProvider>
        <WishlistProvider>
          <CartProvider>
            <AppRoutes />
          </CartProvider>
        </WishlistProvider>
      </StoreSettingsProvider>
    </AuthProvider>
  );
}

export default App;
