const topicRegex = /topic:\s*(.+)/i;

// Detext isTopic
export const detectIsTopic = (text: string): string => {
    if (topicRegex.test(text)) {
        return text.split(":")[1].trim();
    } else {
        return "";
    }
};
