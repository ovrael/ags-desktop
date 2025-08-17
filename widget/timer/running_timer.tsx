import { Accessor, createState, State, With } from "ags";
import GLib from "gi://GLib";
import { createTimeLeft } from "./timer_helper_functions";
import { timerVariables } from "./timer_variables";
import { Gtk } from "ags/gtk4";
import { Process } from "ags/process";
import { SoundPlayer } from "../../models/utils/sound_player";
import { configuration } from "../../app";
import { TIMER_CONSTANTS } from "../../models/constants/timer_constants";
import { NotificationSender } from "../../models/utils/notification_sender";
import { Tools } from "../../models/utils/tools";
import { icons } from "../../models/texts/text_icons";
import { NotificationIcon } from "../../models/enums/notification_icon";

export class RunningTimer {
  public name: string | undefined = undefined;

  public intervalReference: GLib.Source | undefined;
  public startSeconds: number = 0;
  public secondsLeft: State<number> = createState(0);
  public isRunning(): boolean {
    return this.intervalReference !== undefined;
  }
  public isPaused = createState<boolean>(false);

  private alarmSoundProcess: Process | undefined = undefined;
  private progressBarRef: Gtk.LevelBar | undefined = undefined;

  constructor(secondsToCount: number, name: string | undefined = undefined) {
    this.name = name;
    this.startSeconds = secondsToCount;
    this.secondsLeft = createState(secondsToCount);

    timerVariables.timersData[1]((v) => v.updateRunningTimers(1));

    this.intervalReference = setInterval(async () => {
      if (!this.isPaused[0].get()) this.changeSecondsLeft(-1);

      if (this.getSecondsLeft() <= 0) {
        this.finishTimer();
      }
    }, 1000); // 1 second. interval
  }

  private finishTimer() {
    this.intervalReference?.destroy();
    this.intervalReference = undefined;

    timerVariables.timersData[1]((v) => v.updateDoneTimers(1));

    this.alarmSoundProcess = SoundPlayer.playSound(
      configuration.timer.alarmSoundFilePath
    );

    const notificationText: string =
      this.name === undefined
        ? configuration.getTexts().timer.endNonameNotificationTitle
        : Tools.formatString(
            configuration.getTexts().timer.endNamedNotificationTitle,
            this.name
          );

    NotificationSender.send(
      notificationText,
      undefined,
      NotificationIcon.Timer
    );

    if (this.progressBarRef !== undefined) {
      this.progressBarRef.cssClasses = ["timer-done"];
    }

    setTimeout(() => {
      if (this.alarmSoundProcess !== undefined) {
        this.alarmSoundProcess.kill();
        this.alarmSoundProcess = undefined;
      }
    }, configuration.timer.alarmSoundLengthInSeconds * 1000);
  }

  public getStartSeconds(): number {
    return this.startSeconds;
  }

  public getSecondsLeft(): number {
    return this.secondsLeft[0].get();
  }

  public getSecondsLeft2(): State<number> {
    return this.secondsLeft;
  }

  public setSecondsLeft(newTimeLeft: number) {
    this.secondsLeft[1](newTimeLeft);
  }

  public changeSecondsLeft(timeChange: number) {
    if (timeChange === 0) return;
    this.secondsLeft[1]((v) => v + timeChange);
  }

  private toggleTimerPause() {
    this.isPaused[1]((v) => !v);
  }

  public createLabel(index: number) {
    const [secondsGetter, secondsSetter] = this.secondsLeft;
    const [pauseGetter, pauseSetter] = this.isPaused;

    const timerName = this.name ?? `#${index + 1}`;

    return (
      <box
        orientation={Gtk.Orientation.HORIZONTAL}
        hexpand
        vexpand
        marginTop={10}
      >
        <box name={"Pause/Play button container"}>
          <With value={secondsGetter}>
            {(seconds) =>
              seconds > 0 && (
                <button
                  name={"Start saved timer btn"}
                  class={pauseGetter((paused) =>
                    paused
                      ? "timer-popover-start-button small-button"
                      : "timer-popover-pause-timer-button small-button"
                  )}
                  label={pauseGetter((paused) =>
                    paused ? icons.play : icons.pause
                  )}
                  tooltipText={pauseGetter((paused) =>
                    paused
                      ? configuration.getTexts().timer.statePaused
                      : configuration.getTexts().timer.stateRunning
                  )}
                  vexpand={false}
                  hexpand={false}
                  widthRequest={40}
                  heightRequest={20}
                  marginEnd={10}
                  onClicked={() => {
                    this.toggleTimerPause();
                  }}
                ></button>
              )
            }
          </With>
        </box>

        <box
          name={"Timer progress container"}
          marginEnd={10}
          widthRequest={290}
        >
          <overlay vexpand hexpand>
            <levelbar
              vexpand
              hexpand
              cssClasses={["running-timer-bar"]}
              orientation={Gtk.Orientation.HORIZONTAL}
              value={secondsGetter((seconds) => {
                return 1 - seconds / this.startSeconds;
              })}
              $={(self) => {
                this.progressBarRef = self;
              }}
            />
            <box vexpand hexpand $type="overlay">
              <label
                class={"running-timer-label"}
                label={timerName}
                widthChars={
                  TIMER_CONSTANTS.NAME_LENGTH +
                  TIMER_CONSTANTS.LABEL_SAFESPACE_CHARS
                }
                xalign={1.0}
                marginEnd={10}
              />
              <label
                xalign={0.0}
                widthChars={
                  TIMER_CONSTANTS.TIME_LENGTH +
                  TIMER_CONSTANTS.LABEL_SAFESPACE_CHARS +
                  8
                }
                label={secondsGetter(
                  (seconds) =>
                    `${createTimeLeft(seconds)} - ${this.createPercentageDone(
                      seconds
                    )} `
                )}
              ></label>
            </box>
          </overlay>
        </box>

        <box name={"Remove running timer button container"}>
          <button
            name={"Start saved timer btn"}
            class={secondsGetter((seconds) =>
              seconds > 0
                ? "timer-popover-remove-timer-button small-button"
                : "timer-popover-remove-done-timer-button small-button"
            )}
            label={secondsGetter((seconds) =>
              seconds > 0 ? icons.close : icons.alarmFinished
            )}
            vexpand={false}
            hexpand={false}
            widthRequest={40}
            heightRequest={20}
            onClicked={() => {
              this.removeTimer();
            }}
          ></button>
        </box>
      </box>
    );
  }

  createPercentageDone(secondsLeft: number) {
    const ratio = secondsLeft / this.startSeconds;
    return Math.floor(100 - ratio * 100);
  }

  private removeTimer() {
    if (this.alarmSoundProcess !== undefined) {
      this.alarmSoundProcess.kill();
      this.alarmSoundProcess = undefined;
    }

    if (this.intervalReference !== undefined) {
      this.intervalReference?.destroy();
      this.intervalReference = undefined;
    }

    timerVariables.runningTimers[1]((v) => {
      const index = v.indexOf(this);
      const firstPart = v.slice(0, index);
      const secondPart = v.slice(index + 1);
      return firstPart.concat(secondPart);
    });

    timerVariables.timersData[1]((v) => v.updateRunningTimers(-1));

    if (this.secondsLeft[0].get() <= 0)
      timerVariables.timersData[1]((v) => v.updateDoneTimers(-1));
  }
}
