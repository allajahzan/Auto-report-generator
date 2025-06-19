import { Routes, Route, Navigate } from "react-router-dom";

// AdminRoute
function AdminRoute() {
    return (
        <Routes>
            <Route path="" element={<Navigate to={"/admin/login"} />} />
            <Route path="login" element={<h1>Admin login page</h1>} />
        </Routes>
    );
}

export default AdminRoute;
