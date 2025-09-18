import { WeatherData } from "./weather_data";

export class LocalizationWeatherData {

    public name: string = "";
    public isMain: boolean = false;
    public current: WeatherData = new WeatherData();
    public hourly: WeatherData[] = [] as WeatherData[];
    public daily: WeatherData[] = [] as WeatherData[];

    constructor(name: string, isMain: boolean) {
        this.name = name;
        this.isMain = isMain;
    }

    updateWeather(current: WeatherData, hourly: WeatherData[], daily: WeatherData[]) {
        this.current = current;
        this.hourly = hourly;
        this.daily = daily;
    }
}