export class TimerConfiguration {
    public defaultTimerTimeSeconds: number = 600;
    public maxRunningTimers: number = 10;
    public savedTimersFilePath: string = `data/timer/saved_timers.json`;
    public alarmSoundFilePath: string = "data/timer/timer_alarm_sound_WRONG.mp3";
    public alarmSoundLengthInSeconds: number = 60;
}