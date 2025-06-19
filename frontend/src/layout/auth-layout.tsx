import { cn } from "@/lib/utils";
import { Outlet } from "react-router-dom";

// Auth layout Component
function AuthLayout() {
    return (
        <div
            className={cn(
                "h-screen flex flex-col bg-my-bg-dark",
                "[background-size:20px_20px]",
                "[background-image:radial-gradient(rgba(255,255,255,0.15)_1px,transparent_1px)]"
            )}
        >
            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center overflow-auto">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="p-4 w-full text-center text-white text-base">
                Crafted with 🤍 by{" "}
                <a
                    className="text-blue-300 underline-offset-2 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://github.com/allajahzan"
                >
                    Ahsan allaj pk
                </a>{" "}
                | 🔓 open-source on{" "}
                <a
                    className="text-blue-300 underline-offset-2 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://github.com/allajahzan/auto-report-generator"
                >
                    GitHub
                </a>
            </footer>
        </div>
    );
}

export default AuthLayout;
