import { Accessor, With } from "ags";
import TimerPopover from "./timer_popover";
import { timerVariables } from "./timer_variables";
import { TimersData } from "./timers_data";
import { Gtk } from "ags/gtk4";
import { icons } from "../../models/texts/text_icons";

export function Timer() {
  return (
    <menubutton>
      <With value={timerVariables.timersData[0]}>
        {(td) => (
          <box cssClasses={["timer-button"]} overflow={Gtk.Overflow.HIDDEN}>
            {createLabel(td)}
          </box>
        )}
      </With>
      <TimerPopover />
    </menubutton>
  );

  function createLabel(timersData: TimersData) {
    if (timersData.runningTimers === 0)
      return (
        <label
          class={"timer-button-free timer-button-label"}
          label={icons.alarmClock}
        />
      );

    if (timersData.doneTimers === 0)
      return (
        <label
          class={"timer-button-running timer-button-label"}
          label={`${icons.hourglass} ${timersData.runningTimers}`}
        />
      );

    if (timersData.getUndoneCount() === 0)
      return (
        <label
          class={"timer-button-done timer-button-label"}
          label={`${icons.alarmOn} ${timersData.doneTimers}`}
        />
      );

    return (
      <box>
        <label
          class={"timer-button-running-as-left timer-button-label"}
          label={`${icons.hourglass} ${timersData.getUndoneCount()}`}
        />
        <label
          class={"timer-button-done-as-right timer-button-label"}
          label={`${icons.alarmOn} ${timersData.doneTimers}`}
        />
      </box>
    );
  }
}
