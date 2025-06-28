const taskKeywords = {
    Audio: [/task:🎙️/i],
    Writing: [/task:✍️/i],
    Listening: [/task:🎧/i],
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

const topicRegex = /topic:/i;

// Detext isTopic
export const detectIsTopic = (text: string): boolean => {
    return topicRegex.test(text);
};
