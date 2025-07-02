import { Routes, Route, Navigate } from "react-router-dom";
import GetStartedPage from "@/pages/auth/GetStartedPage";
import { CommonLayout } from "@/layout/CommonLayout";
import { useAuth } from "@/context/AuthContext";
import { DashboardPage } from "@/pages/coordinator/DashboardPage";
import { PageNotFound404 } from "@/pages/error/PageNotFound";

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
                    path={"/:phoneNumber/:groupId"}
                    element={connection ? <DashboardPage /> : <Navigate to="/" />}
                />
                <Route path="*" element={<PageNotFound404/>} />
            </Route>
        </Routes>
    );
}

export default CoordinatorRoute;
