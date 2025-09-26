import { icons } from "../../models/texts/text_icons";

export class WeatherData {
    public time: string = "";
    public time2: string = ""; // f.q. day name
    public isDay: boolean = true;
    public code: number = -1;
    public icon: string = '';
    public temperature: number = 0;
    public temperatureUnit: string = '';
    public precipitationProbability: number = 0;
    private cssClass: string = '';

    public getClass(forButton: boolean = false) {
        return forButton ? this.cssClass : this.cssClass.replace('button', 'icon');
    }

    public updateStyle() {

        // Default
        this.icon = this.isDay ? icons.daySun : icons.nightMoon;
        this.cssClass = this.isDay ? "weather-button-sun" : "weather-button-moon";

        // From most alarming to least

        // Thunderstorm
        if (this.code >= 90) {
            this.icon = this.isDay ? icons.dayThunderstorm : icons.nightThunderstorm;
            this.cssClass = "weather-button-thunderstorm";
            return;
        }

        // Snow
        if (
            (this.code >= 70 && this.code < 80) ||
            (this.code >= 85 && this.code < 90)
        ) {
            this.icon = this.isDay ? icons.daySnow : icons.nightSnow;
            this.cssClass = "weather-button-snow";
            return;
        }

        // Rain
        if (
            (this.code >= 80 && this.code < 85) ||
            (this.code >= 50 && this.code < 70)
        ) {
            this.icon = this.isDay ? icons.dayRain : icons.nightRain;
            this.cssClass = "weather-button-rain";
            return;
        }

        // Overcast
        if (this.code === 3) {
            this.icon = icons.cloudyFull;
            this.cssClass = "weather-button-cloud-full";
            return;
        }

        // Partly cloudy
        if (this.code === 2) {
            this.icon = this.isDay ? icons.dayCloudyMid : icons.nightCloudyMid;
            this.cssClass = "weather-button-cloud-mid";
            return;
        }

        // Clear sky
        if (this.code <= 1) {
            this.icon = this.isDay ? icons.daySun : icons.nightMoon;
            this.cssClass = this.isDay ? "weather-button-sun" : "weather-button-moon";
            return;
        }
    }
}