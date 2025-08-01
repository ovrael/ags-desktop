import { readFile } from "ags/file";

export class LocaliztionTexts {

    public readonly ADD: string = " Add";
    public readonly CANCEL: string  = " Cancel";

    public readonly addTimer: string = " Add timer";
    public readonly runTimer: string = " Run";
    public readonly timerEnterEditMode: string = "Enter edit mode";
    public readonly timerExitEditMode: string = "Exit edit mode";
    public readonly savedTimers: string = "Saved timers";
    public readonly runningTimers: string = "Runnings timers";

    public readonly saveTimerAskLabel: string = "Set timer's time and name to save it.";
    public readonly saveTimerNamePlaceholder: string = "Provide timer name eg. pizza, lesson, nap";


    constructor(language: string = "en") {

        if (language.length !== 2)
            return;

        const texts = readFile(`data/localization/${language}.json`);
        return JSON.parse(texts) as LocaliztionTexts;
    }
}