import { Accessor, With } from "ags";
import { createTimeLeft } from "./TimerHelperFunctions";
import { Gtk } from "ags/gtk4";
import { TimerUtils } from "./TimerUtils";

export class SavedTimer {
  public name: string = "";
  public startSeconds: number = 0;

  constructor(name: string, secondsToCount: number) {
    this.name = name;
    this.startSeconds = secondsToCount;
  }

  public createLabel(inEditMode: Accessor<boolean>) {
    return (
      <box orientation={Gtk.Orientation.HORIZONTAL}>
        <label label={`${this.name}`} />
        <label
          vexpand={true}
          hexpand={true}
          label={`${createTimeLeft(this.startSeconds)}`}
        />
        <box>
          <With value={inEditMode}>
            {(editMode) =>
              !editMode && (
                <box orientation={Gtk.Orientation.HORIZONTAL}>
                  <button
                    class=""
                    onClicked={() => {
                      this.runTimer();
                    }}
                    hexpand={true}
                  >
                    <label label={""} />
                  </button>
                </box>
              )
            }
          </With>
        </box>
      </box>
    );
  }

  private runTimer() {
    TimerUtils.runTimer(this.startSeconds, this.name);
  }
}
