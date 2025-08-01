export function createTimeLeft(timeInSeconds: number): string {
    const hours = timeInSeconds / 3600;
    timeInSeconds = timeInSeconds % 3600;
    const minutes = timeInSeconds / 60;
    const seconds = timeInSeconds % 60;

    return `${formatTimeNumber(hours)}.${formatTimeNumber(minutes)}.${formatTimeNumber(seconds)}`;
}

function formatTimeNumber(timeNumber: number): string {
    return Math.floor(timeNumber).toString().padStart(2, '0');
}