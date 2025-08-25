import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SignIn from "./pages/signIn";
import SignUp from "./pages/signUp";
import Todo from "./pages/todo";
import ProtectedRoute from "./components/ProtectedRoute";
import { logout, isAuthenticated } from "./utils/auth";

function App() {
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState<number | null>(null);

  const handleLogout = () => {
    logout();
    setUserId(null);
    setUserName("");
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/signup" element={<SignUp />} />
        <Route
          path="/signin"
          element={
            isAuthenticated() ? (
              <Navigate to="/tasks" />
            ) : (
              <SignIn
                onLogin={(id: number, name: string) => {
                  setUserId(id);
                  setUserName(name);
                }}
              />
            )
          }
        />

        {/* Protected routes */}
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <Todo
                userId={userId!}
                userName={userName}
                onLogout={handleLogout}
              />
            </ProtectedRoute>
          }
        />

        {/* Catch-all redirect */}
        <Route
          path="*"
          element={
            isAuthenticated() ? (
              <Navigate to="/tasks" />
            ) : (
              <Navigate to="/signin" />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
