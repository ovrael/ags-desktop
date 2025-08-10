import { execAsync } from "ags/process";
import { Communication } from "./Communication";
import { NotificationIcon } from "../enums/NotificationIcon";
import { configuration } from "../../app";



export class NotificationSender {
    private static cmd: string = "notify-send";
    private static pwd: string | undefined = undefined;

    public static async send(title: string, body: string | undefined = undefined, icon: NotificationIcon = NotificationIcon.Info, urgency: "low" | "normal" | "critical" = "normal") {
        Communication.printInfo(`Notification: ${title} - ${body}`)

        const iconPath = await configuration.getPwd() + "/icons/" + icon;
        const args: string[] = [this.cmd, `--icon=${iconPath}`, `--urgency=${urgency}`, "--app-name=OVRAEL_GTK_BAR", title];
        if (body !== undefined && body.length == 0) args.push(body);

        try {
            await execAsync(args);
        } catch (error) {
            Communication.printError(`Can't send notification ${title} - ${body}, ERROR=${error}`, "NotificationSender")
        }
    }
}
