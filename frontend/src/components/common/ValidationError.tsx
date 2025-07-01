// Inteface for Props
interface PropsType {
    error: string;
}

// Validation error Component
export function ValidationError({ error }: PropsType) {
    return (
        <p className="relative -top-1 font-medium text-xs text-red-600">{error}</p>
    );
}
