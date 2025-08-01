import { Accessor, With } from "ags";
import TimerPopover from "./TimerPopover";
import { timerVariables } from "./TimerVariables";
import { TimersData } from "./TimersData";
import { Gtk } from "ags/gtk4";

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
        <label class={"timer-button-free timer-button-label"} label={"󰔛"} />
      );

    if (timersData.doneTimers === 0)
      return (
        <label
          class={"timer-button-running timer-button-label"}
          label={`󰔟 ${timersData.runningTimers}`}
        />
      );

    if (timersData.getUndoneCount() === 0)
      return (
        <label
          class={"timer-button-done timer-button-label"}
          label={`󰞏 ${timersData.doneTimers}`}
        />
      );

    return (
      <box>
        <label
          class={"timer-button-running-as-left timer-button-label"}
          label={`󰔟 ${timersData.getUndoneCount()}`}
        />
        <label
          class={"timer-button-done-as-right timer-button-label"}
          label={`󰞏 ${timersData.doneTimers}`}
        />
      </box>
    );
  }
}
