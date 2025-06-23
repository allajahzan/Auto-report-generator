// Interface for Props
interface PropsType {
    message: string;
}

// Not found Component
function NotFound({ message }: PropsType) {
    return (
        <div className="min-h-full bg-my-bg-dark flex items-center justify-center rounded-2xl shadow">
            <p className="font-medium text-sm text-white">{message}</p>
        </div>
    );
}

export default NotFound;
