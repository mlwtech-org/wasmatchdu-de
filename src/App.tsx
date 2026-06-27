import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { fetchAndActivate, getBoolean } from "firebase/remote-config";
import { remoteConfig } from "./lib/firebase";
import { usePlayerStore } from "./store/usePlayerStore";
import { AIAssistantOrb } from "./components/AIAssistantOrb";
import { useFetchChannels } from "./hooks/useFetchChannels";

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
const ProfileSelection = lazy(() =>
  import("./components/ProfileSelection").then((m) => ({
    default: m.ProfileSelection,
  })),
);
const CreateProfile = lazy(() =>
  import("./components/CreateProfile").then((m) => ({
    default: m.CreateProfile,
  })),
);
const ProtectedRoute = lazy(() =>
  import("./components/ProtectedRoute").then((m) => ({
    default: m.ProtectedRoute,
  })),
);
const AdminDashboard = lazy(() =>
  import("./components/AdminDashboard").then((m) => ({
    default: m.AdminDashboard,
  })),
);
const SportsHub = lazy(() =>
  import("./components/SportsHub").then((m) => ({
    default: m.SportsHub,
  })),
);
const ManageProfiles = lazy(() =>
  import("./components/ManageProfiles").then((m) => ({
    default: m.ManageProfiles,
  })),
);

const PageLoader = () => (
  <div className="min-h-screen bg-slate-950 flex items-center justify-center">
    <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
  </div>
);

function App() {
  const setTrendingEnabled = usePlayerStore(
    (state) => state.setTrendingEnabled,
  );

  useFetchChannels();

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        // Fetch values from Firebase Remote Config
        await fetchAndActivate(remoteConfig);
        const isTrendingEnabled = getBoolean(
          remoteConfig,
          "trending_streams_enabled",
        );
        setTrendingEnabled(isTrendingEnabled);
      } catch (err) {
        console.error("Failed to fetch remote config:", err);
      }
    };
    fetchConfig();
  }, [setTrendingEnabled]);

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/profile-selection"
            element={
              <Suspense fallback={<PageLoader />}>
                <ProfileSelection />
              </Suspense>
            }
          />
          <Route
            path="/create-profile"
            element={
              <Suspense fallback={<PageLoader />}>
                <CreateProfile />
              </Suspense>
            }
          />
          <Route
            path="/manage-profiles"
            element={
              <Suspense fallback={<PageLoader />}>
                <ManageProfiles />
              </Suspense>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sports"
            element={
              <ProtectedRoute>
                <div className="min-h-screen bg-black">
                  <SportsHub />
                </div>
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
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
      <AIAssistantOrb />
    </BrowserRouter>
  );
}

export default App;
