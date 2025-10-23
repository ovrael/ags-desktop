import AstalNotifd from "gi://AstalNotifd?version=0.1";

export class HistoryNotification {
    public time: string = "";
    public appName: string = "";
    public summary: string = "";
    public body: string = "";
    public urgency: AstalNotifd.Urgency = AstalNotifd.Urgency.NORMAL;

    public actions: AstalNotifd.Action[] = [];
}