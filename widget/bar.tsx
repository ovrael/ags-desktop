import app from "ags/gtk4/app";
import { Astal, Gtk, Gdk } from "ags/gtk4";
import { execAsync } from "ags/process";
import { createPoll } from "ags/time";
import { Timer } from "./timer/timer";
import { NetworkStatus } from "./network_status/network_status";

export function bar(monitor: Gdk.Monitor) {
  if (monitor.description.includes("AW3423DWF")) {
    return mainBar(monitor);
  } else {
    return secondBar(monitor);
  }
}

function mainBar(monitor: Gdk.Monitor) {
  const time = createPoll("", 1000, "date");
  const { BOTTOM, LEFT, RIGHT } = Astal.WindowAnchor;

  return (
    <window
      visible
      name="bar"
      class="Bar"
      gdkmonitor={monitor}
      exclusivity={Astal.Exclusivity.EXCLUSIVE}
      anchor={BOTTOM | LEFT | RIGHT}
      application={app}
    >
      <centerbox cssName="centerbox">
        <box $type="start" hexpand halign={Gtk.Align.CENTER}>
          <label label="TO BE DONE -> workspaces or something else" />
        </box>

        <box $type="center">
          <menubutton class="clock" hexpand halign={Gtk.Align.CENTER}>
            <label label={time} />
            <popover>
              <Gtk.Calendar />
            </popover>
          </menubutton>
        </box>

        <box $type="end" hexpand halign={Gtk.Align.END}>
          <NetworkStatus />
          <Timer />
        </box>
      </centerbox>
    </window>
  );
}

function secondBar(monitor: Gdk.Monitor) {
  const time = createPoll("", 1000, "date");
  const { BOTTOM, LEFT, RIGHT } = Astal.WindowAnchor;
  let content = `${monitor.model} ${monitor.description}`;

  return (
    <window
      visible
      name="bar"
      class="Bar"
      gdkmonitor={monitor}
      exclusivity={Astal.Exclusivity.EXCLUSIVE}
      anchor={BOTTOM | LEFT | RIGHT}
      application={app}
    >
      <centerbox cssName="centerbox">
        <button
          $type="start"
          onClicked={() => execAsync("echo hello").then(console.log)}
          hexpand
          halign={Gtk.Align.CENTER}
        >
          <label label="Welcome to AGS!" />
        </button>

        <box
          $type="center"
          class="monitor-info"
          hexpand
          halign={Gtk.Align.CENTER}
        >
          <label label={content} />
        </box>

        <menubutton $type="end" hexpand halign={Gtk.Align.CENTER}>
          <label label={time} />
          <popover>
            <Gtk.Calendar />
          </popover>
        </menubutton>
      </centerbox>
    </window>
  );
}
