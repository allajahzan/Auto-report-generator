import { cn } from "@/lib/utils";
import { Link, Outlet } from "react-router-dom";

// Auth layout Component
function AuthLayout() {
    return (
        <div
            className={cn(
                "h-screen w-screen bg-my-bg-dark",
                "[background-size:20px_20px]",
                "[background-image:radial-gradient(rgba(255,255,255,0.15)_1px,transparent_1px)]"
            )}
        >
            <Outlet />

            <div className="fixed p-8 w-full flex flex-col items-center bottom-0 text-white">
                <p>
                    Crafted with 🤍 by{" "}
                    <Link className="text-blue-300" to={""}>
                        Ahsan allaj pk
                    </Link>{" "}
                    | 🔓 Open-Source on{" "}
                    <Link className="text-blue-300" to={""}>
                        GitHub
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default AuthLayout;
