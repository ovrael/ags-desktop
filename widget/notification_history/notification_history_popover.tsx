import { Accessor, createBinding, For } from "ags";
import { Gtk } from "ags/gtk4";
import Notifd from "gi://AstalNotifd";

export function NotificationHistoryPopover() {
  const notifd = Notifd.get_default();
  const notifications = createBinding(notifd, "notifications");

  return (
    <popover
      name={"notification history popover"}
      autohide={false}
      hasArrow={false}
      class={"widget-popover"}
      marginEnd={60}
      marginBottom={30}
    >
      <box orientation={Gtk.Orientation.VERTICAL}>
        <label label={"NOTIFICATIONS LIST"}></label>
        <box orientation={Gtk.Orientation.VERTICAL}>
          <For each={notifications((n) => n.sort((a, b) => a.time - b.time))}>
            {(notification: Notifd.Notification) => {
              return (
                <box orientation={Gtk.Orientation.VERTICAL}>
                  <label label={notification.body}></label>
                  <label label={notification.summary}></label>
                </box>
              );
            }}
          </For>
        </box>
      </box>
    </popover>
  );
}
