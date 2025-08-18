import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SignIn from "./pages/signIn";
import SignUp from "./pages/signUp";
import Todo from "./pages/todo";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState(""); // store signed in user's name
  const [userId, setUserId] = useState<number | null>(null); // store signed in user's id

  if (!isLoggedIn) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/signup" element={<SignUp />} />
          <Route
            path="/signin"
            element={
              <SignIn
                onLogin={(id: number, name: string) => {
                  setIsLoggedIn(true);
                  setUserId(id);
                  setUserName(name);
                }}
              />
            }
          />
          <Route path="*" element={<Navigate to="/signin" />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/tasks"
          element={
            <Todo
              userId={userId!} // pass userId internally
              userName={userName}
              onLogout={() => setIsLoggedIn(false)}
            />
          }
        />
        <Route path="*" element={<Navigate to="/tasks" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
