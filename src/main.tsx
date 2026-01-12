// main.tsx
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom"; // <-- import this
import App from "./app/App.tsx";
import "./index.css";
import { NotificationProvider } from "./components/NotificationContext.tsx";

createRoot(document.getElementById("root")!).render(
    <BrowserRouter>
        <NotificationProvider>
            <App />
        </NotificationProvider>
    </BrowserRouter>
);
