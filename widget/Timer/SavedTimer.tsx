import { Accessor, With } from "ags";
import { createTimeLeft } from "./TimerHelperFunctions";
import { Gtk } from "ags/gtk4";
import { TimerUtils } from "./TimerUtils";
import { TIMER_CONSTANTS } from "../../models/constants/timerConstants";

export class SavedTimer {
  public name: string = "";
  public startSeconds: number = 0;

  constructor(name: string, secondsToCount: number) {
    this.name = name;
    this.startSeconds = secondsToCount;
  }

  public createLabel(inEditMode: Accessor<boolean>) {
    return (
      <box name={"Saved timer label"} orientation={Gtk.Orientation.HORIZONTAL}>
        <label
          label={`${this.name}`}
          widthChars={
            TIMER_CONSTANTS.NAME_LENGTH + TIMER_CONSTANTS.LABEL_SAFESPACE_CHARS
          }
          xalign={1.0}
          marginEnd={10}
        />
        <label
          label={`󱎫 ${createTimeLeft(this.startSeconds)}`}
          widthChars={
            TIMER_CONSTANTS.TIME_LENGTH + TIMER_CONSTANTS.LABEL_SAFESPACE_CHARS
          }
          xalign={0.0}
          hexpand
        />
        <box name={"Start saved timer btn container"}>
          <With value={inEditMode}>
            {(editMode) =>
              !editMode && (
                <button
                  name={"Start saved timer btn"}
                  class={"timer-popover-start-button small-button"}
                  label={""}
                  vexpand={false}
                  hexpand={false}
                  widthRequest={40}
                  heightRequest={20}
                  onClicked={() => {
                    this.runTimer();
                  }}
                ></button>
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
