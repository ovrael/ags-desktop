import { RunningTimer } from "./running_timer";
import { createState, State } from "ags";
import { SavedTimer } from "./saved_timer";
import { TimersData } from "./timers_data";

export type TimerStates = {
  runningTimers: State<RunningTimer[]>;
  savedTimers: State<SavedTimer[]>;
  timersData: State<TimersData>;
};

export const timerVariables: TimerStates = {
  runningTimers: createState([] as RunningTimer[]), // 0 running timers at the beggining
  savedTimers: createState([] as SavedTimer[]),
  timersData: createState(new TimersData()),
};
