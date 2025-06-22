import { Routes, Route, Navigate } from "react-router-dom";
import GetStartedPage from "@/pages/auth/get-started";
import CommonLayout from "@/layout/common-layout";
import { useAuth } from "@/context/auth-context";
import DashbaordCoordinatorPage from "@/pages/coordinator/dashboard";

// CoordinatorRoute
function CoordinatorRoute() {
    // Auth context
    const { connection, phoneNumber, groupId } = useAuth();

    return (
        <Routes>
            <Route element={<CommonLayout />}>
                <Route path="" element={connection ? <Navigate to={`/${phoneNumber}/${groupId}`} /> : <GetStartedPage />} />
                <Route path={`/:phoneNumber/:groupId`} element={connection ? <DashbaordCoordinatorPage /> : <Navigate to={"/"} />} />
            </Route>
        </Routes>
    );
}

export default CoordinatorRoute;
