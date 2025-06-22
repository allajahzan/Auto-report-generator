import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AuthContextProvider } from "./context/auth-context.tsx";
import NotificationContextProvider from "./context/notification-context.tsx";

createRoot(document.getElementById("root")!).render(
  <NotificationContextProvider>
    <AuthContextProvider>
      <App />
    </AuthContextProvider>
  </NotificationContextProvider>
);
