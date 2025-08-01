import { Accessor, createState, State, With } from "ags";
import GLib from "gi://GLib";
import { createTimeLeft } from "./TimerHelperFunctions";
import { timerVariables } from "./TimerVariables";
import { Gtk } from "ags/gtk4";
import { Process } from "ags/process";
import { SoundPlayer } from "../../utils/SoundPlayer";
import { configuration } from "../../app";

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

  private pauseTimer() {
    this.isPaused[1]((v) => !v);
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

  public createLabel(index: number) {
    const [secondsGetter, secondsSetter] = this.secondsLeft;
    const [pauseGetter, pauseSetter] = this.isPaused;

    let content = <></>;
    if (secondsGetter.get() > 0) {
      content = (
        <button
          class=""
          onClicked={() => {
            this.pauseTimer();
          }}
          hexpand={true}
        >
          <label label={pauseGetter((paused) => (paused ? "" : ""))} />
        </button>
      );
    }

    const timerName = this.name ?? `#${index + 1}`;

    return (
      <box orientation={Gtk.Orientation.HORIZONTAL}>
        <box>
          <overlay>
            <levelbar
              cssClasses={["running-timer-bar"]}
              orientation={Gtk.Orientation.HORIZONTAL}
              hexpand
              value={secondsGetter((seconds) => {
                return 1 - seconds / this.startSeconds;
              })}
            />
            <label
              $type="overlay"
              cssClasses={["running-timer-label"]}
              vexpand
              hexpand
              label={secondsGetter(
                (seconds) =>
                  `${timerName}\t${createTimeLeft(
                    seconds
                  )} - ${this.createPercentageDone(seconds)} `
              )}
            ></label>
          </overlay>
        </box>
        <box>
          <With value={secondsGetter}>
            {(seconds) =>
              seconds > 0 && (
                <button
                  class=""
                  onClicked={() => {
                    this.pauseTimer();
                  }}
                >
                  <label
                    label={pauseGetter((paused) => (paused ? "" : ""))}
                  />
                </button>
              )
            }
          </With>
        </box>
        <box>
          <button
            onClicked={() => {
              this.removeTimer();
            }}
          >
            <label
              label={secondsGetter((seconds) => (seconds > 0 ? "" : "󱜞"))}
            />
          </button>
        </box>
      </box>
    );
  }

  createPercentageDone(secondsLeft: number) {
    const ratio = secondsLeft / this.startSeconds;
    return Math.floor(100 - ratio * 100);
  }
}
