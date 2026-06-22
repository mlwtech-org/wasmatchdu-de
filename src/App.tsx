import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Dashboard } from "./components/Dashboard";
import { Homepage } from "./components/Homepage";
import { Login } from "./components/Login";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { GoLive } from "./components/GoLive";
import { LivePlayer } from "./components/LivePlayer";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/go-live"
          element={
            <ProtectedRoute>
              <GoLive />
            </ProtectedRoute>
          }
        />
        <Route
          path="/live/:streamId"
          element={
            <ProtectedRoute>
              <LivePlayer />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
