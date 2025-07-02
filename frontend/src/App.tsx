import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UserRoute from "./routes/coordinatorRoute";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";

// App
function App() {
    const queryClient = new QueryClient();
    return (
        <QueryClientProvider client={queryClient}>
            <Toaster />

            <Router>
                <Routes>
                    <Route path="/*" element={<UserRoute />} />
                </Routes>
            </Router>
        </QueryClientProvider>
    );
}

export default App;
