"use client";

import { AuthProvider } from "@/context/AuthContext";
import { store, persistor } from "@/store";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import LoadingOverlay from "@/components/spinner/loading-overlay";
import AuthGuard from "@/components/auth/AuthGuard";
import SplashScreen from "@/components/splash-screen/splashScreen";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={<SplashScreen />} persistor={persistor}>
        <AuthProvider>
          <AuthGuard
            fallback={
              <LoadingOverlay
                isLoading={true}
                message="Loading..."
                variant="wave"
                size="large"
                backdropBlur="md"
                spinnerColor="green"
                spinnerSize="md"
              />
            }
          >
            {children}
          </AuthGuard>
        </AuthProvider>
      </PersistGate>
    </Provider>
  );
}
