import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './context/AuthContext';
import { StoreSettingsProvider } from './context/StoreSettingsContext';

function App() {
  return (
    <AuthProvider>
      <StoreSettingsProvider>
        <AppRoutes />
      </StoreSettingsProvider>
    </AuthProvider>
  );
}

export default App;
