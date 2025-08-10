import { readFile } from "ags/file";
import { TimerTexts } from "./timerTexts";
import { GeneralTexts } from "./generalTexts";

export class LocaliztionTexts {

    public readonly general: GeneralTexts = new GeneralTexts();
    public readonly timer: TimerTexts = new TimerTexts();


    constructor(language: string = "en") {

        if (language.length !== 2)
            return;

        const texts = readFile(`data/localization/${language}.json`);
        return JSON.parse(texts) as LocaliztionTexts;
    }
}