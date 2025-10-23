import { createBinding, createComputed, For, With } from "ags";
import Hyprland from "gi://AstalHyprland";

// Read order from configuration

export function Workspaces() {
  const hyprland = Hyprland.get_default();
  const workspaces = createBinding(hyprland, "workspaces")((all) => all.sort());
  const activeWorkspace = createBinding(hyprland, "focusedWorkspace");
  const workspaceData = createComputed([workspaces, activeWorkspace]);

  return (
    <box cssClasses={["workspaces-status"]} spacing={20}>
      <box>
        <label
          widthChars={20}
          label={activeWorkspace((w) => `[${w.id}] ${w.name}`)}
        ></label>
      </box>
      <box>
        <With value={workspaceData}>
          {([all, active]) => {
            return (
              <box spacing={10}>
                {all.map((w) => {
                  if (w === active) {
                    return (
                      <box>
                        <label label={""} css={"color:red;"}></label>
                      </box>
                    );
                  } else {
                    return (
                      <box>
                        <button
                          onClicked={() => {
                            hyprland.dispatch("workspace", `${w.name ?? w.id}`);
                          }}
                        >
                          <label label={""} css={"color:white;"}></label>
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
