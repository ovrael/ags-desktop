import { Accessor, createState } from "ags";
import { Gtk } from "ags/gtk4";
import { NotificationHistoryPopover } from "./notification_history_popover";
import { configuration } from "../../app";
import { readFile, readFileAsync } from "ags/file";
import Notifd from "gi://AstalNotifd";

export function NotificationHistory() {
  const notifd = Notifd.get_default();

  notifd.connect("notified", (_, id) => {
    const n = notifd.get_notification(id);
    print(n.summary, n.body);
  });

  const historyPath = configuration.notification.historyPath;

  const [getHistory, setHistory] = createState([]);
  return (
    <box
      $={async () => {
        await readHistory(historyPath);
      }}
    >
      <menubutton>
        <box
          cssClasses={["notification-history-button"]}
          overflow={Gtk.Overflow.HIDDEN}
        >
          <box>
            <label class={"bar-button-label"} label={`󰈚`} />
          </box>
        </box>
        <NotificationHistoryPopover />
      </menubutton>
    </box>
  );

  async function readHistory(path: string) {
    const historyText = readFileAsync(path);
  }
}
