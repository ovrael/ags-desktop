import app from "ags/gtk4/app";
import { Astal, Gtk } from "ags/gtk4";
import AstalNotifd from "gi://AstalNotifd";
import NotificationPopup from "./notification_popup";
import { createBinding, For, createState, onCleanup } from "ags";
import GLib from "gi://GLib";
import Adw from "gi://Adw";
import { configuration } from "../../app";

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

    if (notification.expireTimeout === -1) {
      if (
        notification.urgency === AstalNotifd.Urgency.LOW &&
        configuration.notification.defaultTimeoutForUrgency.low >= 0
      ) {
        notification.expireTimeout =
          configuration.notification.defaultTimeoutForUrgency.low;
      }
      if (
        notification.urgency === AstalNotifd.Urgency.NORMAL &&
        configuration.notification.defaultTimeoutForUrgency.normal >= 0
      ) {
        notification.expireTimeout =
          configuration.notification.defaultTimeoutForUrgency.normal;
      }
      if (
        notification.urgency === AstalNotifd.Urgency.CRITICAL &&
        configuration.notification.defaultTimeoutForUrgency.critical >= 0
      ) {
        notification.expireTimeout =
          configuration.notification.defaultTimeoutForUrgency.critical;
      }
    }

    console.log(`${notification.summary} ${notification.body}`);

    try {
      if (replaced && notifications.get().some((n) => n.id === id)) {
        setNotifications((ns) =>
          ns.map((n) => (n.id === id ? notification : n))
        );
      } else {
        setNotifications((ns) => [notification, ...ns]);
      }
    } catch (error) {
      console.log(`Error when setNotifications: ${error}`);
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
    try {
      setNotifications((ns) => ns.filter((n) => n.id !== id));
    } catch (error) {
      console.log(`Error when setNotifications: ${error}`);
    }
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
