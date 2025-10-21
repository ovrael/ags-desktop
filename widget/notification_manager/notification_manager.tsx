import app from "ags/gtk4/app";
import { Astal, Gtk } from "ags/gtk4";
import AstalNotifd from "gi://AstalNotifd";
import NotificationPopup from "./notification_popup";
import { createBinding, For, createState, onCleanup } from "ags";
import GLib from "gi://GLib";
import Adw from "gi://Adw";

export default function NotificationManager() {
  const monitors = createBinding(app, "monitors");

  const notifd = AstalNotifd.get_default();
  notifd.ignoreTimeout = false;

  const [notifications, setNotifications] = createState(
    new Array<AstalNotifd.Notification>()
  );

  const notifiedHandler = notifd.connect("notified", (_, id, replaced) => {
    console.log("NOTIFIED");
    const notification = notifd.get_notification(id);
    console.log(`${notification.summary} ${notification.body}`);

    if (replaced && notifications.get().some((n) => n.id === id)) {
      setNotifications((ns) => ns.map((n) => (n.id === id ? notification : n)));
    } else {
      setNotifications((ns) => [notification, ...ns]);
    }
  });

  function getReason(reason: AstalNotifd.ClosedReason) {
    switch (reason) {
      case AstalNotifd.ClosedReason.CLOSED:
        return "closed";
      case AstalNotifd.ClosedReason.DISMISSED_BY_USER:
        return "dismissed";
      case AstalNotifd.ClosedReason.EXPIRED:
        return "expired";
      case AstalNotifd.ClosedReason.UNDEFINED:
      default:
        return "undefined";
    }
  }

  const resolvedHandler = notifd.connect("resolved", (n, id, reason) => {
    console.log(
      `Reason: ${getReason(
        reason
      )}, Resolving id: ${id}, notifications: ${n.notifications
        .map((n) => n.id)
        .join(", ")}`
    );
    const x = notifications((n) => n.find((n2) => n2.id === id));
    const n2 = x.get();
    console.log(`${n2?.summary} ${n2?.body}`);

    setNotifications((ns) => ns.filter((n) => n.id !== id));
  });

  onCleanup(() => {
    notifd.disconnect(notifiedHandler);
    notifd.disconnect(resolvedHandler);
  });

  return (
    <For each={monitors}>
      {(monitor) => (
        <window
          $={(self) => onCleanup(() => self.destroy())}
          gdkmonitor={monitor}
          css={`
            background-color: transparent;
          `}
          visible={notifications((ns) => ns.length > 0)}
          anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.RIGHT}
        >
          <box
            orientation={Gtk.Orientation.VERTICAL}
            css={`
              background-color: transparent;
            `}
            spacing={10}
          >
            <For each={notifications}>
              {(notification) => (
                <NotificationPopup notification={notification} />
              )}
            </For>
          </box>
        </window>
      )}
    </For>
  );
}
