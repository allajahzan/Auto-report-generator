// Interface for Props
interface PropsType {
    message: string;
}

// Not found Component
export function NotFound({ message }: PropsType) {
    return (
        <p className="font-medium text-xs text-center tracking-wide text-white">
            {message}
        </p>
    );
}
