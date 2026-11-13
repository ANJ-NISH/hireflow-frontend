import { useEffect, useState } from "react";
import "./App.css";
import { AppRoutes } from "./routes/AppRoutes";
import { initAuth } from "./lib/auth";

function App() {
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    // Silently tries to restore a session from the httpOnly refreshToken cookie
    // before the app renders any routes, so a page refresh doesn't look logged-out
    // even though the in-memory access token was wiped by the reload.
    initAuth().finally(() => setAuthReady(true));
  }, []);

  if (!authReady) {
    // Brief loading state while we check for an existing session.
    // Keep this minimal — it only shows for a fraction of a second.
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return <AppRoutes />;
}

export default App;