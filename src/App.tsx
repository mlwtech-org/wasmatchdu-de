import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

// Route-level code splitting — each page becomes its own JS chunk
// loaded only when the user navigates to that route.
const Homepage = lazy(() =>
  import("./components/Homepage").then((m) => ({ default: m.Homepage })),
);
const Login = lazy(() =>
  import("./components/Login").then((m) => ({ default: m.Login })),
);
const Dashboard = lazy(() =>
  import("./components/Dashboard").then((m) => ({ default: m.Dashboard })),
);
const GoLive = lazy(() =>
  import("./components/GoLive").then((m) => ({ default: m.GoLive })),
);
const LivePlayer = lazy(() =>
  import("./components/LivePlayer").then((m) => ({ default: m.LivePlayer })),
);
const ProtectedRoute = lazy(() =>
  import("./components/ProtectedRoute").then((m) => ({
    default: m.ProtectedRoute,
  })),
);

const PageLoader = () => (
  <div className="min-h-screen bg-slate-950 flex items-center justify-center">
    <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
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
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
