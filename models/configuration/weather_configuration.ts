import fetch from "ags/fetch";
import { WeatherLocalization } from "../../widget/weather/weather_localization";
import { readFileAsync, writeFileAsync } from "ags/file";
import { Communication } from "../utils/communication";

export class WeatherConfiguration {
    private static readonly MAX_LOCALIZATIONS = 10;
    public temperatureUnit: string = "C"; // C or F
    public showLocationName: boolean = true;
    public autogetLocalizationName: boolean = false;
    public savedAutogetNamesPath: string = `data/weather/found_localizations.json`;
    public localizations: WeatherLocalization[] = [];

    public static fromConfigFile(configFileWeather: WeatherConfiguration): WeatherConfiguration {
        const weather = new WeatherConfiguration();
        weather.showLocationName = configFileWeather.showLocationName;
        weather.autogetLocalizationName = configFileWeather.autogetLocalizationName;
        weather.localizations = configFileWeather.localizations;

        const MAX = WeatherConfiguration.MAX_LOCALIZATIONS;
        if (weather.localizations.length > MAX) {
            weather.localizations.splice(MAX, weather.localizations.length - MAX)
        }

        return weather;
    }

    public async checkLocalizationNames() {

        try {

            if (this.autogetLocalizationName === false)
                return;

            const autogetLocalizations: AutogetLocalization[] = await this.checkLocalizationNamesFromFile();

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
                } else if (address.town) {
                    this.localizations[i].name = address.town;
                } else if (address.village) {
                    this.localizations[i].name = address.village;
                }

                if (this.localizations[i].name.length > 0)
                    autogetLocalizations.push(new AutogetLocalization(this.localizations[i], i));
            }

            await this.saveNamesToFile(autogetLocalizations);
        } catch (error) {
            console.log('checkLocalizationNames');
            console.log(error);
        }
    }

    private async checkLocalizationNamesFromFile() {
        const autogetLocalizations: AutogetLocalization[] = await this.loadNamesFromFile();

        for (let i = 0; i < this.localizations.length; i++) {
            const loc = this.localizations[i];
            if (loc.name.length > 0) {
                continue;
            }

            const autogetLocalization = autogetLocalizations.find(l => l.index === i);
            if (autogetLocalization === undefined)
                continue;

            if (autogetLocalization.latitude === loc.latitude && autogetLocalization.longitude === loc.longitude) {
                this.localizations[i].name = autogetLocalization.name;
            } else {
                autogetLocalizations.splice(i, 1);
            }
        }

        return autogetLocalizations;
    }

    private async saveNamesToFile(autogetLocalizations: AutogetLocalization[]) {
        await writeFileAsync(
            this.savedAutogetNamesPath,
            JSON.stringify(autogetLocalizations, undefined, "\t")
        );
    }

    private async loadNamesFromFile(): Promise<AutogetLocalization[]> {
        try {
            const savedNames = await readFileAsync(this.savedAutogetNamesPath);
            return JSON.parse(savedNames) as AutogetLocalization[];
        } catch (error) {
            Communication.printError(
                "Cannot load autoget localization names from file => error: " + error,
                "WeatherConfiguration"
            );
        }
        return [];
    }
}

class AutogetLocalization {

    public name: string = "";
    public index: number = -1;
    public latitude: number = -1;
    public longitude: number = -1;

    constructor(localization: WeatherLocalization, index: number) {
        this.name = localization.name;
        this.index = index;
        this.latitude = localization.latitude;
        this.longitude = localization.longitude;
    }
}