import { Accessor, createState, For, With } from "ags";
import { Gtk } from "ags/gtk4";
import { configuration } from "../../app";
import { WeatherConfiguration } from "../../models/configuration/weather_configuration";
import { WeatherData } from "./weather_data";
import { icons } from "../../models/texts/text_icons";
import { WeatherIconStyle } from "./weather_icon_style";
import { weatherApi } from "./weather_api";
import { Tools } from "../../models/utils/tools";
import { LocalizationWeatherData } from "./localization_weather_data";
import { DateTools } from "../../models/utils/date_tools";

export function WeatherPopover() {
  const currentLocalization = createState("LocalizationTab0");
  const tabNameTemplate = "LocalizationTab{0}";

  return (
    <popover
      autohide={false}
      hasArrow={false}
      class={"widget-popover"}
      marginStart={60}
      marginBottom={30}
    >
      <box orientation={Gtk.Orientation.VERTICAL}>
        <box orientation={Gtk.Orientation.VERTICAL}>
          <box orientation={Gtk.Orientation.HORIZONTAL} marginBottom={10}>
            <For each={weatherApi.localizationWeathers[0]}>
              {(
                localization: LocalizationWeatherData,
                index: Accessor<number>
              ) => (
                <box>
                  {createWeatherStackPageButton(index.get(), localization)}
                </box>
              )}
            </For>
          </box>
          <box>
            <stack visibleChildName={currentLocalization[0]}>
              <For each={weatherApi.localizationWeathers[0]}>
                {(
                  localization: LocalizationWeatherData,
                  index: Accessor<number>
                ) => (
                  <box
                    $type="named"
                    name={Tools.formatString(tabNameTemplate, index.get())}
                    orientation={Gtk.Orientation.VERTICAL}
                    spacing={40}
                  >
                    <box orientation={Gtk.Orientation.VERTICAL}>
                      <label label={"Current weather"}></label>
                      {createCurrentWeather(localization)}
                    </box>
                    <box orientation={Gtk.Orientation.VERTICAL}>
                      <label label={"Hourly weather"}></label>
                      {createHourlyWeather(localization.hourly)}
                    </box>
                    <box orientation={Gtk.Orientation.VERTICAL}>
                      <label label={"Daily weather"}></label>
                      {createDailyWeather(localization.daily)}
                    </box>
                    {/* {createDailyWeather(localization.daily)} */}
                  </box>
                )}
              </For>
            </stack>
          </box>
        </box>
      </box>
    </popover>
  );

  function createWeatherStackPageButton(
    index: number,
    localization: LocalizationWeatherData
  ): Gtk.Button {
    const button = new Gtk.Button();
    const tabName = Tools.formatString(tabNameTemplate, index);

    button.label =
      localization.name.length === 0
        ? `${configuration.getTexts().weather.defaultLocationName} #${
            index + 1
          }`
        : localization.name;

    currentLocalization[0].subscribe(() => {
      button.cssClasses =
        currentLocalization[0].get() === tabName
          ? ["weather-localization-button", "weather-current-localization"]
          : ["weather-localization-button"];
    });

    button.cssClasses =
      currentLocalization[0].get() === tabName
        ? ["weather-localization-button", "weather-current-localization"]
        : ["weather-localization-button"];

    button.connect("clicked", () => {
      currentLocalization[1](tabName);
    });
    return button;
  }

  function createCurrentWeather(
    localization: LocalizationWeatherData
  ): Gtk.Box {
    const box = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL });

    // const nameLabel = new Gtk.Label();
    // nameLabel.label =
    //   localization.name.length === 0
    //     ? `${configuration.getTexts().weather.defaultLocationName} #${
    //         index + 1
    //       }`
    //     : localization.name;
    // page.append(nameLabel);

    const iconLabel = new Gtk.Label();
    iconLabel.label = localization.current.icon;
    iconLabel.cssClasses = [
      "current-weather-icon",
      localization.current.getClass(),
    ];
    box.append(iconLabel);

    const temperatureLabel = new Gtk.Label();
    temperatureLabel.label = `${localization.current.temperature} C`;
    box.append(temperatureLabel);

    const precipitationLabel = new Gtk.Label();
    precipitationLabel.label = `${localization.current.precipitationProbability} %`;
    box.append(precipitationLabel);

    return box;
  }

  function createHourlyWeather(forecast: WeatherData[]): Gtk.Box {
    const box = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL });

    for (let i = 0; i < forecast.length; i++) {
      const hourBox = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL });

      const iconLabel = new Gtk.Label();
      iconLabel.label = forecast[i].icon;
      iconLabel.cssClasses = ["current-weather-icon", forecast[i].getClass()];
      hourBox.append(iconLabel);

      const temperatureLabel = new Gtk.Label();
      temperatureLabel.label = `${forecast[i].temperature} C`;
      hourBox.append(temperatureLabel);

      const precipitationLabel = new Gtk.Label();
      precipitationLabel.label = `${forecast[i].precipitationProbability} %`;
      hourBox.append(precipitationLabel);

      // Time is YYYY-MM-DDTHH:MM format
      const timeParts: string[] = forecast[i].time.split("T");
      if (timeParts.length == 2) {
        const timeLabel = new Gtk.Label();
        const time: string = DateTools.formatTime(
          timeParts[1],
          configuration.general.timeFormat
        );
        timeLabel.label = `${time}`;
        hourBox.append(timeLabel);
      } // else - something weird happened

      box.append(hourBox);
    }

    return box;
  }

  function createDailyWeather(forecast: WeatherData[]): Gtk.Box {
    const box = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL });

    for (let i = 0; i < forecast.length; i++) {
      const dayBox = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL });

      const iconLabel = new Gtk.Label();
      iconLabel.label = forecast[i].icon;
      iconLabel.cssClasses = ["current-weather-icon", forecast[i].getClass()];
      dayBox.append(iconLabel);

      const temperatureLabel = new Gtk.Label();
      temperatureLabel.label = `${forecast[i].temperature} C`;
      dayBox.append(temperatureLabel);

      const precipitationLabel = new Gtk.Label();
      precipitationLabel.label = `${forecast[i].precipitationProbability} %`;
      dayBox.append(precipitationLabel);

      // Time is YYYY-MM-DD format
      const timeLabel = new Gtk.Label();
      const date = new Date(forecast[i].time);
      timeLabel.label = DateTools.toShortFormatDate(
        date,
        configuration.general.dateFormat
      );
      dayBox.append(timeLabel);

      box.append(dayBox);
    }

    return box;
  }
}
