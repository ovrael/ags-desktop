import { readFile } from "ags/file";
import { TimerTexts } from "./timer_texts";
import { GeneralTexts } from "./general_texts";
import { NetworkTexts } from "./network_texts";
import { WeatherTexts } from "./weather_texts";

export class LocaliztionTexts {

    public readonly general: GeneralTexts = new GeneralTexts();
    public readonly timer: TimerTexts = new TimerTexts();
    public readonly network: NetworkTexts = new NetworkTexts();
    public readonly weather: WeatherTexts = new WeatherTexts();


    constructor(language: string = "en") {

        if (language.length !== 2)
            return;

        const texts = readFile(`data/localization/${language}.json`);
        return JSON.parse(texts) as LocaliztionTexts;
    }
}