import fetch from "ags/fetch";
import { WeatherLocalization } from "../../widget/weather/weather_localization";

export class WeatherConfiguration {
    public temperatureUnit: string = "C"; // C or F
    public showLocationName: boolean = true;
    public autogetLocalizationName: boolean = false;
    public localizations: WeatherLocalization[] = [];

    public static fromConfigFile(configFileWeather: WeatherConfiguration): WeatherConfiguration {
        const weather = new WeatherConfiguration();
        weather.showLocationName = configFileWeather.showLocationName;
        weather.autogetLocalizationName = configFileWeather.autogetLocalizationName;
        weather.localizations = configFileWeather.localizations;
        return weather;
    }

    public async checkLocalizationNames() {
        if (this.autogetLocalizationName === false)
            return;


        for (let i = 0; i < this.localizations.length; i++) {
            const loc = this.localizations[i];
            if (loc.name.length > 0) {
                continue;
            }
            // https://nominatim.openstreetmap.org/reverse?lat=LAT&lon=LON&format=json

            const baseUrl = "https://nominatim.openstreetmap.org/reverse";
            const params = `lat=${loc.latitude}&lon=${loc.longitude}&format=json`;
            const url = `${baseUrl}?${params}`;

            const response = await fetch(url, { headers: { "User-Agent": "ovrael-astal-bar" } });
            const json = await response.json();

            if (json === undefined || json.error !== undefined && json.error.length > 0 || json.address === undefined) {
                continue;
            }



            const address = json.address;
            if (address.city) {
                this.localizations[i].name = address.city;
                continue;
            }

            if (address.town) {
                this.localizations[i].name = address.town;
                continue;
            }

            if (address.village) {
                this.localizations[i].name = address.village;
                continue;
            }
        }

    }
}