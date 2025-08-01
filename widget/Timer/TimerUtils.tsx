import { readFileAsync, writeFileAsync } from "ags/file";
import { timerVariables } from "./TimerVariables";
import { SavedTimer } from "./SavedTimer";
import { RunningTimer } from "./RunningTimer";
import { configuration } from "../../app";

export class TimerUtils {
  public static async saveTimersToFile() {
    await writeFileAsync(
      configuration.timer.savedTimersFilePath,
      JSON.stringify(timerVariables.savedTimers[0].get(), undefined, "\t")
    );
  }

  public static async loadTimersFromFile() {
    const savedTimersJson = await readFileAsync(
      configuration.timer.savedTimersFilePath
    );
    try {
      const savedTimers: SavedTimer[] = JSON.parse(
        savedTimersJson
      ) as SavedTimer[];
      timerVariables.savedTimers[1](
        savedTimers.map((t) => new SavedTimer(t.name, t.startSeconds))
      );
    } catch (error) {
      console.log("Cannot create saved timers => error: " + error);
    }
  }

  public static runTimer(
    timeInSeconds: number,
    name: string | undefined = undefined
  ) {
    timerVariables.runningTimers[1]((v) => {
      if (v.length < configuration.timer.maxRunningTimers)
        return v.concat(new RunningTimer(timeInSeconds, name));
      return v;
    });
  }
}
