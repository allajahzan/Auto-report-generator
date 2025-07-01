import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AuthContextProvider } from "./context/AuthContext.tsx";
import { NotificationContextProvider } from "./context/NotificationContext.tsx";

createRoot(document.getElementById("root")!).render(
  <NotificationContextProvider>
    <AuthContextProvider>
      <App />
    </AuthContextProvider>
  </NotificationContextProvider>
);
