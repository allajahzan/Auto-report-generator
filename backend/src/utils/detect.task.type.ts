const taskKeywords = {
    Audio: [/task:audio/i],
    Writing: [/task:writing/i],
    Listening: [/task:listening/i],
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