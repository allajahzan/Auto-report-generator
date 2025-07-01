import { Routes, Route, Navigate } from "react-router-dom";
import GetStartedPage from "@/pages/auth/GetStartedPage";
import { CommonLayout } from "@/layout/CommonLayout";
import { useAuth } from "@/context/AuthContext";
import { DashbaordPage } from "@/pages/coordinator/DashboardPage";

// Coordinator route
function CoordinatorRoute() {
    // Auth context
    const { connection, phoneNumber, groupId } = useAuth();

    return (
        <Routes>
            <Route element={<CommonLayout />}>
                <Route
                    path=""
                    element={
                        connection ? (
                            <Navigate to={`/${phoneNumber}/${groupId}`} />
                        ) : (
                            <GetStartedPage />
                        )
                    }
                />
                <Route
                    path={`/:phoneNumber/:groupId`}
                    element={
                        connection ? <DashbaordPage /> : <Navigate to={"/"} />
                    }
                />
            </Route>
        </Routes>
    );
}

export default CoordinatorRoute;
