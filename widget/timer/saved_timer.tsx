import { Accessor } from "ags";
import { createTimeLeft } from "./timer_helper_functions";
import { Gtk } from "ags/gtk4";
import { TimerUtils } from "./timer_utils";
import { TIMER_CONSTANTS } from "../../models/constants/timer_constants";

export class SavedTimer {
  public name: string = "";
  public startSeconds: number = 0;

  constructor(name: string, secondsToCount: number) {
    this.name = name;
    this.startSeconds = secondsToCount;
  }

  public createLabel() {
    return (
      <box name={"Saved timer label"} orientation={Gtk.Orientation.HORIZONTAL}>
        <box cssClasses={["saved-timer-container"]} marginEnd={8}>
          <label
            label={`${this.name}`}
            widthChars={
              TIMER_CONSTANTS.NAME_LENGTH +
              TIMER_CONSTANTS.LABEL_SAFESPACE_CHARS
            }
            xalign={1.0}
            marginEnd={10}
          />
          <label
            label={`󱎫 ${createTimeLeft(this.startSeconds)}`}
            widthChars={
              TIMER_CONSTANTS.TIME_LENGTH +
              TIMER_CONSTANTS.LABEL_SAFESPACE_CHARS
            }
            xalign={0.0}
            hexpand
          />
        </box>
      </box>
    );
  }

  public runTimer() {
    TimerUtils.runTimer(this.startSeconds, this.name);
  }
}
