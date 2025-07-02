const taskKeywords = {
    Audio: [/task:\s*audio/i],
    Writing: [/task:\s*writing/i],
    Listening: [/task:\s*listening/i],
};

// Detext task type
export const detectTaskType = (text: string): string | null => {
    for (const [type, patterns] of Object.entries(taskKeywords)) {
        if (patterns.some((rx) => rx.test(text))) {
            return type;
        }
    }
    return null;
};