import { Gtk } from "ags/gtk4";
import { timerVariables } from "./TimerVariables";
import { Accessor, createState, For, State, With } from "ags";
import { SaveTimerWindow } from "./SaveTimerWindow";
import { TimerUtils } from "./TimerUtils";
import { SavedTimer } from "./SavedTimer";
import { ReorderDirection, TimerDigit } from "./TimerEnums";
import { TimerDigits } from "./TimerDigits";
import { configuration } from "../../app";

let inEditSavedTimersMode: State<boolean> = createState(false);
let timerSeconds: TimerDigits = new TimerDigits();
const digitLabels: Gtk.Label[] = [];

export default function TimerPopover() {
  timerSeconds = new TimerDigits(configuration.timer.defaultTimerTimeSeconds);

  return (
    <popover
      autohide={true}
      hasArrow={false}
      onClosed={() => {
        inEditSavedTimersMode[1]((v) => false);
      }}
    >
      <box orientation={Gtk.Orientation.VERTICAL}>
        {createRunningTimers()}
        <box orientation={Gtk.Orientation.VERTICAL}>
          <box orientation={Gtk.Orientation.VERTICAL}>
            {createTimeEntry()}
            <button class="" onClicked={timerClicked} hexpand={true}>
              <label label={configuration.texts[0]((t) => t.runTimer)} />
            </button>
          </box>
          <button onClicked={openSaveTimerWindow} hexpand={true}>
            <label label={configuration.texts[0]((t) => t.addTimer)} />
          </button>
        </box>
        {createSavedTimers()}
      </box>
    </popover>
  );

  function createTimeEntry() {
    const timeEntryBox = new Gtk.Box({
      orientation: Gtk.Orientation.HORIZONTAL,
      cssClasses: ["save-timer-window-timeentry-box"],
    });

    const hoursBox = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL });
    const hourLabel1 = createTimeEntryDigitLabel(TimerDigit.Hour1);
    const hourLabel2 = createTimeEntryDigitLabel(TimerDigit.Hour2);
    hoursBox.append(hourLabel1);
    hoursBox.append(hourLabel2);

    const minutesBox = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL });
    const minutesLabel1 = createTimeEntryDigitLabel(TimerDigit.Minute1);
    const minutesLabel2 = createTimeEntryDigitLabel(TimerDigit.Minute2);
    minutesBox.append(minutesLabel1);
    minutesBox.append(minutesLabel2);

    const secondsBox = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL });
    const secondsLabel1 = createTimeEntryDigitLabel(TimerDigit.Second1);
    const secondsLabel2 = createTimeEntryDigitLabel(TimerDigit.Second2);
    secondsBox.append(secondsLabel1);
    secondsBox.append(secondsLabel2);

    const separatorLabel = new Gtk.Label({
      label: ":",
      cssClasses: ["save-timer-window-time-digit"],
    });
    const separatorLabel2 = new Gtk.Label({
      label: ":",
      cssClasses: ["save-timer-window-time-digit"],
    });

    timeEntryBox.append(hoursBox);
    timeEntryBox.append(separatorLabel);
    timeEntryBox.append(minutesBox);
    timeEntryBox.append(separatorLabel2);
    timeEntryBox.append(secondsBox);

    return timeEntryBox;
  }

  function createTimeEntryDigitLabel(digitIndex: TimerDigit): Gtk.Label {
    const digitLabel = new Gtk.Label({
      name: digitIndex.toString(),
      label: timerSeconds.getDigit(digitIndex),
      cssClasses: ["save-timer-window-time-digit"],
    });

    const scrollController = new Gtk.EventControllerScroll({
      name: "scrollController",
      flags: Gtk.EventControllerScrollFlags.VERTICAL,
    });

    scrollController.connect("scroll", (controller, dx, dy) => {
      timerSeconds.updateTime(digitIndex, -dy);
      digitLabels.forEach((label) => {
        label.label = timerSeconds.getDigit(
          label.name as unknown as TimerDigit
        );
      });
    });

    digitLabel.add_controller(scrollController);
    digitLabels.push(digitLabel);

    return digitLabel;
  }

  function timerClicked(): void {
    const seconds = timerSeconds.getAllSeconds();
    if (seconds <= 1) return;

    TimerUtils.runTimer(seconds);
  }

  function openSaveTimerWindow() {
    SaveTimerWindow.create();
  }

  function toggleEditMode() {
    inEditSavedTimersMode[1]((v) => !v);
  }

  function createSavedTimers() {
    return (
      <box orientation={Gtk.Orientation.VERTICAL}>
        <box>
          <With value={timerVariables.savedTimers[0]}>
            {(savedTimers) =>
              savedTimers.length > 0 && (
                <box orientation={Gtk.Orientation.HORIZONTAL}>
                  <label
                    label={configuration.texts[0](
                      (t) => `--- ${t.savedTimers} ---`
                    )}
                  />
                  <button
                    onClicked={toggleEditMode}
                    tooltipText={inEditSavedTimersMode[0]((v) =>
                      v
                        ? configuration.texts[0](
                            (t) => t.timerExitEditMode
                          ).get()
                        : configuration.texts[0](
                            (t) => t.timerEnterEditMode
                          ).get()
                    )}
                  >
                    <label
                      label={inEditSavedTimersMode[0]((v) => (v ? "󰭜" : ""))}
                    />
                  </button>
                </box>
              )
            }
          </With>
        </box>
        <box orientation={Gtk.Orientation.VERTICAL}>
          <For each={timerVariables.savedTimers[0]}>
            {(item, index: Accessor<number>) => (
              <box
                orientation={Gtk.Orientation.HORIZONTAL}
                cssClasses={["timer-popover-saved-timer"]}
              >
                {createMoveSaveTimerButtonBox(item)}
                {item.createLabel(inEditSavedTimersMode[0])}
                {createDeleteSaveTimerButton(item)}
              </box>
            )}
          </For>
        </box>
      </box>
    );
  }

  function createMoveSaveTimerButtonBox(savedTimer: SavedTimer) {
    return (
      <box>
        <With value={inEditSavedTimersMode[0]}>
          {(canEdit) =>
            canEdit && (
              <box>
                <With value={timerVariables.savedTimers[0]}>
                  {(timers) =>
                    timers && (
                      <box
                        orientation={Gtk.Orientation.VERTICAL}
                        hexpand={false}
                        vexpand={false}
                        widthRequest={30}
                        heightRequest={50}
                      >
                        {timers.indexOf(savedTimer) > 0 && (
                          <button
                            label={""}
                            hexpand={false}
                            vexpand={true}
                            widthRequest={30}
                            heightRequest={20}
                            onClicked={() => {
                              reorderSavedTimers(
                                ReorderDirection.UP,
                                savedTimer
                              );
                            }}
                          />
                        )}
                        {timers.indexOf(savedTimer) < timers.length - 1 && (
                          <button
                            label={""}
                            hexpand={false}
                            vexpand={true}
                            widthRequest={30}
                            heightRequest={20}
                            onClicked={() => {
                              reorderSavedTimers(
                                ReorderDirection.DOWN,
                                savedTimer
                              );
                            }}
                          />
                        )}
                      </box>
                    )
                  }
                </With>
              </box>
            )
          }
        </With>
      </box>
    );
  }

  function reorderSavedTimers(
    direction: ReorderDirection,
    savedTimer: SavedTimer
  ) {
    timerVariables.savedTimers[1]((timers) => {
      const index = timers.indexOf(savedTimer);
      const firstPartIndex = index - (direction == ReorderDirection.UP ? 1 : 0);
      const secondPartIndex =
        index + (direction == ReorderDirection.UP ? 0 : 1);

      let newOrder: SavedTimer[] = [];
      const firstPart = timers.slice(0, firstPartIndex);
      const timer1 = timers[firstPartIndex];
      const timer2 = timers[secondPartIndex];
      const secondPart = timers.slice(secondPartIndex + 1);

      newOrder.push(...firstPart);
      newOrder.push(timer2);
      newOrder.push(timer1);
      newOrder.push(...secondPart);

      return newOrder;
    });

    TimerUtils.saveTimersToFile();
  }

  function createDeleteSaveTimerButton(savedTimer: SavedTimer) {
    return (
      <box>
        <With value={inEditSavedTimersMode[0]}>
          {(canEdit) =>
            canEdit && (
              <box>
                <button
                  label={""}
                  onClicked={async () => {
                    await removeTimer(savedTimer);
                  }}
                ></button>
              </box>
            )
          }
        </With>
      </box>
    );
  }

  async function removeTimer(savedTimer: SavedTimer) {
    timerVariables.savedTimers[1]((v) => {
      const index = v.indexOf(savedTimer);
      const firstPart = v.slice(0, index);
      const secondPart = v.slice(index + 1);
      return firstPart.concat(secondPart);
    });

    await TimerUtils.saveTimersToFile();
  }

  function createRunningTimers() {
    return (
      <box orientation={Gtk.Orientation.VERTICAL}>
        <box>
          <With value={timerVariables.timersData[0]}>
            {(td) =>
              td.runningTimers > 0 && (
                <box>
                  <label
                    label={configuration.texts[0](
                      (t) => `--- ${t.runningTimers} ---`
                    )}
                  />
                </box>
              )
            }
          </With>
        </box>
        <box orientation={Gtk.Orientation.VERTICAL}>
          <For each={timerVariables.runningTimers[0]}>
            {(item, index: Accessor<number>) =>
              index((i) => item.createLabel(i)).get()
            }
          </For>
        </box>
      </box>
    );
  }
}
