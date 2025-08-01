import { RunningTimer } from "./RunningTimer";
import { createState, State } from "ags";
import { SavedTimer } from "./SavedTimer";
import { TimersData } from "./TimersData";

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
