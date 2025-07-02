export function PageNotFound() {
    return (
        <div className="h-screen w-full flex justify-center items-center">
            <div className="flex items-center gap-2 animate-bounce">
                <h1 className="text-xl font-semibold text-white">404</h1>
                <div className="h-6 w-1 bg-white"></div>
                <h1 className="text-xl font-semibold text-white">
                    Page Not Found
                </h1>
            </div>
        </div>
    );
}
