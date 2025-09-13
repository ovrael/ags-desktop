import { createState } from "ags";
import { WeatherData } from "./weather_data";

export class LocalizationWeatherData {

    public name: string = "";
    public current: WeatherData = new WeatherData();
    public hourly: WeatherData[] = [] as WeatherData[];
    public daily: WeatherData[] = [] as WeatherData[];

    constructor(name: string) {
        this.name = name;
    }

    updateWeather(current: WeatherData, hourly: WeatherData[], daily: WeatherData[]) {
        this.current = current;
        this.hourly = hourly;
        this.daily = daily;
    }
}