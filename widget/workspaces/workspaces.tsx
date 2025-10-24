import {
  createBinding,
  createComputed,
  createSettings,
  createState,
  For,
  With,
} from "ags";
import Hyprland from "gi://AstalHyprland";
import { configuration } from "../../app";
import { icons } from "../../models/texts/text_icons";
import { Gtk } from "ags/gtk4";

// Read order from configuration

export function Workspaces() {
  const hyprland = Hyprland.get_default();

  const workspaces = configuration.hyprworkspaces.workspaces;
  const maxLength = configuration.hyprworkspaces.workspaces
    .map((w) => w.length)
    .toSorted((a, b) => b - a)[0];
  const activeWorkspace = createBinding(hyprland, "focusedWorkspace");

  return (
    <box cssClasses={["workspaces-status"]} spacing={5}>
      <box>
        <label
          widthChars={maxLength + 2}
          label={activeWorkspace((w) => `${w.name ?? w.id}`)}
        ></label>
      </box>
      <box>
        <With value={activeWorkspace}>
          {(active) => {
            return (
              <box spacing={2}>
                {workspaces.map((w) => {
                  if (w === active.name) {
                    return (
                      <box valign={Gtk.Align.CENTER}>
                        <button
                          class={"workspace-button"}
                          valign={Gtk.Align.CENTER}
                        >
                          <label
                            yalign={0.5}
                            valign={Gtk.Align.CENTER}
                            label={icons.currentWorkspace}
                            class={"workspace-current"}
                          ></label>
                        </button>
                      </box>
                    );
                  } else {
                    return (
                      <box valign={Gtk.Align.CENTER}>
                        <button
                          class={"workspace-button"}
                          valign={Gtk.Align.CENTER}
                          onClicked={() => {
                            hyprland.dispatch("workspace", `name:${w}`);
                          }}
                        >
                          <label
                            yalign={0.5}
                            valign={Gtk.Align.CENTER}
                            label={icons.emptyWorkspace}
                            class={"workspace-empty"}
                          ></label>
                        </button>
                      </box>
                    );
                  }
                })}
              </box>
            );
          }}
        </With>
      </box>
    </box>
  );
}
