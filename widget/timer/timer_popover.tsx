import { Gtk } from "ags/gtk4";
import { timerVariables } from "./timer_variables";
import { Accessor, createState, For, State, With } from "ags";
import { SaveTimerWindow } from "./save_timer_window";
import { TimerUtils } from "./timer_utils";
import { SavedTimer } from "./saved_timer";
import { ReorderDirection, TimerDigit } from "./timer_enums";
import { TimerDigits } from "./timer_digit";
import { configuration } from "../../app";
import { icons } from "../../models/texts/text_icons";

let inEditSavedTimersMode: State<boolean> = createState(false);
let timerSeconds: TimerDigits = new TimerDigits();
const digitLabels: Gtk.Label[] = [];

export default function TimerPopover() {
  timerSeconds = new TimerDigits(configuration.timer.defaultTimerTimeSeconds);

  return (
    <popover
      autohide={true}
      hasArrow={false}
      class={"timer-popover"}
      onClosed={() => {
        inEditSavedTimersMode[1](false);
      }}
      widthRequest={400}
      marginEnd={60}
      marginBottom={30}
      hexpand={false}
    >
      <box
        orientation={Gtk.Orientation.VERTICAL}
        widthRequest={400}
        hexpand={false}
      >
        {createRunningTimers()}
        {createMainInterface()}
        {createSavedTimers()}
      </box>
    </popover>
  );

  function createTimeEntry() {
    const timeEntryBox = new Gtk.Box({
      orientation: Gtk.Orientation.HORIZONTAL,
      hexpand: true,
      halign: Gtk.Align.CENTER,
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
      cssClasses: ["timer-popover-label-digit"],
    });
    const separatorLabel2 = new Gtk.Label({
      label: ":",
      cssClasses: ["timer-popover-label-digit"],
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
      cssClasses: ["timer-popover-label-digit"],
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

  function createTimeEntryBackground() {
    const timeEntryBox = new Gtk.Box({
      orientation: Gtk.Orientation.HORIZONTAL,
      hexpand: true,
      halign: Gtk.Align.CENTER,
    });

    const hoursBox = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL });
    const hourLabel1 = new Gtk.Label({
      label: "0",
      cssClasses: ["timer-popover-label-digit-background"],
    });
    const hourLabel2 = new Gtk.Label({
      label: "0",
      cssClasses: ["timer-popover-label-digit-background"],
    });
    hoursBox.append(hourLabel1);
    hoursBox.append(hourLabel2);

    const minutesBox = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL });
    const minutesLabel1 = new Gtk.Label({
      label: "0",
      cssClasses: ["timer-popover-label-digit-background"],
    });
    const minutesLabel2 = new Gtk.Label({
      label: "0",
      cssClasses: ["timer-popover-label-digit-background"],
    });
    minutesBox.append(minutesLabel1);
    minutesBox.append(minutesLabel2);

    const secondsBox = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL });
    const secondsLabel1 = new Gtk.Label({
      label: "0",
      cssClasses: ["timer-popover-label-digit-background"],
    });
    const secondsLabel2 = new Gtk.Label({
      label: "0",
      cssClasses: ["timer-popover-label-digit-background"],
    });
    secondsBox.append(secondsLabel1);
    secondsBox.append(secondsLabel2);

    const separatorLabel = new Gtk.Label({
      label: ":",
      cssClasses: ["timer-popover-label-digit"],
    });
    const separatorLabel2 = new Gtk.Label({
      label: ":",
      cssClasses: ["timer-popover-label-digit"],
    });

    timeEntryBox.append(hoursBox);
    timeEntryBox.append(separatorLabel);
    timeEntryBox.append(minutesBox);
    timeEntryBox.append(separatorLabel2);
    timeEntryBox.append(secondsBox);
    return timeEntryBox;
  }

  function createSavedTimers() {
    return (
      <box
        orientation={Gtk.Orientation.VERTICAL}
        cssClasses={["timer-popover-saved-timers-container"]}
      >
        <box cssClasses={[""]}>
          <With value={timerVariables.savedTimers[0]}>
            {(savedTimers) =>
              savedTimers.length > 0 && (
                <box orientation={Gtk.Orientation.HORIZONTAL}>
                  <label
                    hexpand
                    cssClasses={["container-label"]}
                    label={configuration.texts[0]((t) => `${t.timer.saved}`)}
                  />

                  <button
                    name={"Edit saved timers btn"}
                    class={"timer-popover-edit-timers-button small-button"}
                    label={inEditSavedTimersMode[0]((v) =>
                      v ? icons.back : icons.edit
                    )}
                    vexpand={false}
                    hexpand={false}
                    widthRequest={40}
                    heightRequest={20}
                    onClicked={() => {
                      inEditSavedTimersMode[1]((v) => !v);
                    }}
                    tooltipText={inEditSavedTimersMode[0]((v) =>
                      v
                        ? configuration.texts[0](
                            (t) => t.timer.exitEditMode
                          ).get()
                        : configuration.texts[0](
                            (t) => t.timer.enterEditMode
                          ).get()
                    )}
                  ></button>
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
                marginTop={10}
              >
                {createMoveSaveTimerButtonBox(item)}
                {item.createLabel()}
                {createSaveTimerActionButton(item)}
              </box>
            )}
          </For>
        </box>

        <button
          name={"Create saved timers btn"}
          class={"timer-popover-add-timer-button"}
          label={configuration.texts[0]((t) => `${icons.plus} ${t.timer.add}`)}
          marginTop={10}
          hexpand
          onClicked={() => {
            SaveTimerWindow.create();
          }}
        ></button>
      </box>
    );
  }

  function createMoveSaveTimerButtonBox(savedTimer: SavedTimer) {
    return (
      <box name={"Move timer btn container outer"}>
        <With value={inEditSavedTimersMode[0]}>
          {(canEdit) =>
            canEdit && (
              <box name={"Move timer btn container inner"}>
                <With value={timerVariables.savedTimers[0]}>
                  {(timers) =>
                    timers.length > 1 && (
                      <box
                        name={"Move timer btn container inner inner"}
                        orientation={Gtk.Orientation.VERTICAL}
                        hexpand={false}
                        vexpand={false}
                        widthRequest={30}
                        heightRequest={20}
                      >
                        {timers.indexOf(savedTimer) > 0 && (
                          <button
                            name={"move up button"}
                            label={icons.arrowUp}
                            widthRequest={30}
                            heightRequest={10}
                            valign={Gtk.Align.FILL}
                            vexpand={true}
                            cssClasses={[
                              "timer-popover-move-timer-button",
                              "small-button",
                            ]}
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
                            name={"move down button"}
                            label={icons.arrowDown}
                            widthRequest={30}
                            heightRequest={10}
                            valign={Gtk.Align.FILL}
                            vexpand={true}
                            cssClasses={[
                              "timer-popover-move-timer-button",
                              "small-button",
                            ]}
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

  function createSaveTimerActionButton(savedTimer: SavedTimer) {
    return (
      <box name={"Saved timer action btn container"}>
        <With value={inEditSavedTimersMode[0]}>
          {(canEdit) =>
            canEdit ? (
              <button
                name={"Delete saved timer btn"}
                class={"timer-popover-remove-timer-button small-button"}
                label={icons.close}
                vexpand={false}
                hexpand={false}
                widthRequest={40}
                heightRequest={20}
                onClicked={async () => {
                  await removeTimer(savedTimer);
                }}
              ></button>
            ) : (
              <button
                name={"Start saved timer btn"}
                class={"timer-popover-start-button small-button"}
                label={icons.play}
                vexpand={false}
                hexpand={false}
                widthRequest={40}
                heightRequest={20}
                onClicked={() => {
                  savedTimer.runTimer();
                }}
              ></button>
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
      <box>
        <With value={timerVariables.timersData[0]}>
          {(td) =>
            td.runningTimers > 0 && (
              <box orientation={Gtk.Orientation.VERTICAL} marginBottom={30}>
                <label
                  cssClasses={["container-label"]}
                  label={configuration.texts[0]((t) => `${t.timer.running}`)}
                />
                <box orientation={Gtk.Orientation.VERTICAL} vexpand={true}>
                  <For each={timerVariables.runningTimers[0]}>
                    {(item, index: Accessor<number>) =>
                      index((i) => item.createLabel(i)).get()
                    }
                  </For>
                </box>
              </box>
            )
          }
        </With>
      </box>
    );
  }

  function createMainInterface() {
    return (
      <box orientation={Gtk.Orientation.VERTICAL} marginBottom={30}>
        <box hexpand>
          <overlay cssClasses={["timer-popover-label-digit-container"]}>
            <box hexpand $type="overlay">
              {createTimeEntry()}
            </box>
            <box hexpand>{createTimeEntryBackground()}</box>
          </overlay>
        </box>
        <button
          class={"timer-popover-start-button"}
          onClicked={() => {
            TimerUtils.runTimer(timerSeconds.getAllSeconds());
          }}
          hexpand
        >
          <label
            label={configuration.texts[0](
              (t) => `${icons.play} ${t.timer.run}`
            )}
          />
        </button>
      </box>
    );
  }
}
