import { icons } from "../../models/texts/text_icons";

export class WeatherIconStyle {
    public icon: string = icons.daySun;
    public class: string = "weather-icon-sun";

    constructor(icon: string, buttonClass: string) {
        this.icon = icon;
        this.class = buttonClass;
    }
}