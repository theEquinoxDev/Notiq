import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#fcefd8",
              color: "#180c04",
              borderRadius: "0",
              fontSize: "12px",
              fontFamily: "DM Mono, monospace",
              padding: "10px 14px",
              boxShadow: "0 4px 24px rgba(180,120,64,0.15)",
              border: "1px solid #b87840",
            },
            success: {
              iconTheme: { primary: "#386820", secondary: "#fcefd8" },
            },
            error: {
              iconTheme: { primary: "#c02818", secondary: "#fcefd8" },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
