import { Accessor } from "ags";
import { Gtk } from "ags/gtk4";
import { NotificationHistoryPopover } from "./notification_history_popover";

export function NotificationHistory() {
  // const notifd = Notifd.get_default();

  // notifd.connect("notified", (_, id) => {
  //   const n = notifd.get_notification(id);
  //   print(n.summary, n.body);
  // });

  return (
    <box>
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
}
