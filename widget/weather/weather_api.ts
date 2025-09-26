import { fetch } from "ags/fetch";
import { WeatherLocalization } from "./weather_localization";
import { WeatherData } from "./weather_data";
import { configuration } from "../../app";
import { interval, Time } from "ags/time";
import { createState } from "ags";
import { LocalizationWeatherData } from "./localization_weather_data";
import { Communication } from "../../models/utils/communication";
import { icons } from "../../models/texts/text_icons";

class WeatherApi {

    private localizations: WeatherLocalization[] = [];
    private temperatureUnit: string = "C";

    private readonly fetchIntervalTimeMs: number = 5 * 60_000; // Every 5min
    private fetchInterval: Time;

    public localizationWeathers = createState([] as LocalizationWeatherData[]);

    constructor() {
        this.fetchInterval = interval(this.fetchIntervalTimeMs, async () => {
            await this.fetchData();
        });
    }

    public async init() {

        const weatherConfig = configuration.weather;
        this.localizations = weatherConfig.localizations;
        this.temperatureUnit = weatherConfig.temperatureUnit;
        this.localizationWeathers[1](weatherConfig.localizations.map(l => new LocalizationWeatherData(l.name, l.isMain)));
        await this.fetchData();

        configuration.weatherState[0].subscribe(async () => {
            const currentState = configuration.weatherState[0].get();
            this.localizations = currentState.localizations;
            this.temperatureUnit = currentState.temperatureUnit;
            this.localizationWeathers[1](weatherConfig.localizations.map(l => new LocalizationWeatherData(l.name, l.isMain)));
            await this.fetchData();
        })
    }


    private async fetchData() {

        if (this.localizations.length === 0) {
            console.log('weather_api - fetchData() - no localizations');
            return;
        }

        const baseUrl = "https://api.open-meteo.com/v1/forecast";

        const latitudes = this.localizations.map(l => l.latitude).join(',');
        const longitudes = this.localizations.map(l => l.longitude).join(',');
        const currentParams = "&current=weather_code,temperature_2m,precipitation_probability,is_day";
        const hourlyParams = "&forecast_hours=21&past_hours=0&hourly=weather_code,temperature_2m,precipitation_probability,is_day"; // STARTS FROM CURRENT HOUR
        const dailyParams = "&daily=weather_code,temperature_2m_mean,precipitation_probability_mean"; // STARTS FROM CURRENT DAY
        let tempUnitParam = this.temperatureUnit === 'F' ? '&temperature_unit=fahrenheit' : '';
        const timezone = '&timezone=auto';

        const url = `${baseUrl}?latitude=${latitudes}&longitude=${longitudes}${currentParams}${hourlyParams}${dailyParams}${tempUnitParam}${timezone}`;

        let json = undefined;
        try {
            const response = await fetch(url);
            json = await response.json();
        } catch (error) {
            Communication.printError(`Cannot fetch weather data: ${error}`, "weather_api");
            return;
        }

        if (!Array.isArray(json)) {
            json = [json];
        }


        if (json.length !== this.localizations.length) {
            console.log(`json length (${json.length}) is different than localizations (${this.localizations.length}) `);
            console.log(json);
            return [];
        }

        const localizationWeathers: LocalizationWeatherData[] = [];

        for (let i = 0; i < json.length; i++) {
            const current = this.createCurrentWeatherData(json[i].current);
            const hourly = this.createMultipleWeatherData(json[i].hourly);
            const daily = this.createMultipleWeatherData(json[i].daily);

            // Check if in localization array bounds
            const name = configuration.weather.localizations.length > i ? configuration.weather.localizations[i].name : "";
            const isMain = configuration.weather.localizations.length > i ? configuration.weather.localizations[i].isMain : false;
            const forecast = new LocalizationWeatherData(name, isMain);
            forecast.updateWeather(current, hourly, daily);

            localizationWeathers.push(forecast);
        }

        this.localizationWeathers[1](localizationWeathers);
    }

    private createCurrentWeatherData(jsonField: any): WeatherData {
        const weather = new WeatherData();
        if (jsonField === undefined)
            return weather;

        weather.time = jsonField.time;
        weather.code = jsonField.weather_code;
        weather.isDay = jsonField.is_day;
        weather.temperature = jsonField.temperature_2m;
        weather.precipitationProbability = jsonField.precipitation_probability;
        weather.temperatureUnit = configuration.weather.temperatureUnit === "F" ? "°F" : "°C";
        weather.updateStyle();

        return weather;
    }

    private createMultipleWeatherData(jsonField: any): WeatherData[] {
        const weatherForecast: WeatherData[] = [];
        if (jsonField === undefined)
            return weatherForecast;

        if (jsonField.weather_code === undefined || !Array.isArray(jsonField.weather_code))
            return weatherForecast;

        const length = jsonField.weather_code.length;

        for (let i = 0; i < length; i++) {
            const weather = new WeatherData();
            weather.time = jsonField.time[i];
            weather.code = jsonField.weather_code[i];
            weather.isDay = jsonField.is_day !== undefined ? jsonField.is_day[i] : 1;
            weather.temperature = jsonField.temperature_2m !== undefined ? jsonField.temperature_2m[i] : jsonField.temperature_2m_mean[i];
            weather.precipitationProbability = jsonField.precipitation_probability !== undefined ? jsonField.precipitation_probability[i] : jsonField.precipitation_probability_mean[i];
            weather.temperatureUnit = configuration.weather.temperatureUnit === "F" ? "°F" : "°C";
            weather.updateStyle();
            weatherForecast.push(weather);
        }

        return weatherForecast;
    }
}

export const weatherApi: WeatherApi = new WeatherApi();