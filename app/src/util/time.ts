const formatSeconds = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    return [
        hours > 0 ? `${hours}h` : '',
        minutes > 0 ? `${minutes}m` : '',
        secs > 0 ? `${secs}s` : ''
    ].filter(Boolean).join(' ');
}

const tsToDate = (timestamp: string): Date => {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
        throw new Error(`Invalid timestamp: ${timestamp}`);
    }

    return date;
}

const dateToTs = (date: Date): string => {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
        throw new Error(`Invalid date: ${date}`);
    }
    return date.toISOString();
}

const getDaysBetween = (start: Date, end: Date): number => {
    const startTs = start.getTime();
    const endTs = end.getTime();
    return Math.floor((endTs - startTs) / (1000 * 60 * 60 * 24));
}   

const getDaysAfter = (start: Date, days: number): Date => {
    const startTs = start.getTime();
    const newTs = startTs + (days * 1000 * 60 * 60 * 24);
    const newDate = new Date(newTs);
    if (isNaN(newDate.getTime())) {
        throw new Error(`Invalid date after adding days: ${newDate}`);
    }
    return newDate;
}

export {
    formatSeconds,
    tsToDate,
    dateToTs,
    getDaysBetween,
    getDaysAfter
}