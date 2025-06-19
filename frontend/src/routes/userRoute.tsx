import { Routes, Route } from "react-router-dom";
import GetStartedPage from "@/pages/auth/get-started";
import AuthLayout from "@/layout/auth-layout";

// UserRoute
function UserRoute() {
    return (
        <Routes>
            <Route element={<AuthLayout/>}>
             <Route path="" element={<GetStartedPage />} />
            </Route>
            <Route path="/about" element={<h1>About Page</h1>} />
        </Routes>
    );
}

export default UserRoute;
