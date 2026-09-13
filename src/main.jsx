import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { LocationProvider } from "./context/LocationContext";
import { AuthProvider } from "./context/AuthContext";
import InitialLoader from "./components/InitialLoader";
import { CartProvider } from "./context/CartContext";
import { SiteSettingsProvider } from "./context/SiteSettingsContext";
import "./styles/premiumCustomer.css";
import "./styles/premiumVisuals.css";
import "./styles/luxuryHome.css";
import { HelmetProvider } from "react-helmet-async";
import AppErrorBoundary from "./components/AppErrorBoundary";

const root=document.getElementById("root");const application=(
  <AppErrorBoundary><HelmetProvider><BrowserRouter>
    <AuthProvider>
      <LocationProvider>
        <SiteSettingsProvider><CartProvider><InitialLoader><App /></InitialLoader></CartProvider></SiteSettingsProvider>
      </LocationProvider>
    </AuthProvider>
  </BrowserRouter></HelmetProvider></AppErrorBoundary>
);


if(root.hasChildNodes())hydrateRoot(root,application);else createRoot(root).render(application);



