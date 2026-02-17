export class NotificationConfiguration {
    public defaultTimeoutForUrgency = {
        "low": 5000,
        "normal": 10000,
        "critical": -1
    }
    public historyEntries: number = 100;
    public historyPath: string = `data/notification/history.json`;
}