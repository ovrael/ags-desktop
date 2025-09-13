import { Accessor, createState, For, With } from "ags";
import { Gtk } from "ags/gtk4";
import { configuration } from "../../app";
import { WeatherConfiguration } from "../../models/configuration/weather_configuration";
import { WeatherData } from "./weather_data";
import { icons } from "../../models/texts/text_icons";
import { WeatherIconStyle } from "./weather_icon_style";
import { weatherApi } from "./weather_api";

type WeatherProps = {
  weatherAccessor: Accessor<WeatherData>;
};

export function WeatherPopover() {
  return (
    <popover
      autohide={false}
      hasArrow={false}
      class={"widget-popover"}
      widthRequest={500}
      marginEnd={60}
      marginBottom={30}
    >
      <box orientation={Gtk.Orientation.VERTICAL}>
        <label label={"POGODA"}></label>
        <box orientation={Gtk.Orientation.HORIZONTAL}>
          <For each={weatherApi.localizationWeathers[0]}>
            {(localization, index: Accessor<number>) => (
              <box
                orientation={Gtk.Orientation.VERTICAL}
                hexpand
                marginEnd={30}
              >
                <box>
                  <label
                    visible={localization.name.length > 0}
                    label={localization.name}
                  ></label>

                  <label
                    visible={localization.name.length === 0}
                    label={index.as(
                      (i) =>
                        `${
                          configuration.getTexts().weather.defaultLocationName
                        } #${i + 1}`
                    )}
                  ></label>
                </box>
                <label
                  cssClasses={[
                    "current-weather-icon",
                    localization.current.getClass(),
                  ]}
                  label={localization.current.icon}
                ></label>
                <label label={`${localization.current.temperature} C`}></label>
                <label
                  label={`${localization.current.precipitationProbability} %`}
                ></label>
              </box>
            )}
          </For>
        </box>
      </box>
    </popover>
  );

  function createIconStyle(weatherData: WeatherData): WeatherIconStyle {
    // return new WeatherStyle();
    // From most alarming to least

    // Thunderstorm
    if (weatherData.code >= 90) {
      return new WeatherIconStyle(
        weatherData.isDay ? icons.dayThunderstorm : icons.nightThunderstorm,
        "weather-icon-thunderstorm"
      );
    }

    // Snow
    if (
      (weatherData.code >= 70 && weatherData.code < 80) ||
      (weatherData.code >= 85 && weatherData.code < 90)
    ) {
      return new WeatherIconStyle(
        weatherData.isDay ? icons.daySnow : icons.nightSnow,
        "weather-icon-snow"
      );
    }

    // Rain
    if (
      (weatherData.code >= 80 && weatherData.code < 85) ||
      (weatherData.code >= 50 && weatherData.code < 70)
    ) {
      return new WeatherIconStyle(
        weatherData.isDay ? icons.dayRain : icons.nightRain,
        "weather-icon-rain"
      );
    }

    // Overcast
    if (weatherData.code === 3) {
      return new WeatherIconStyle(icons.cloudyFull, "weather-icon-cloud-full");
    }

    // Partly cloudy
    if (weatherData.code === 2) {
      return new WeatherIconStyle(
        weatherData.isDay ? icons.dayCloudyMid : icons.nightCloudyMid,
        "weather-icon-cloud-mid"
      );
    }

    // Clear sky
    if (weatherData.code <= 1) {
      return weatherData.isDay
        ? new WeatherIconStyle(icons.daySun, "weather-icon-sun")
        : new WeatherIconStyle(icons.nightMoon, "weather-icon-moon");
    }

    // Default
    return new WeatherIconStyle(icons.daySun, "weather-icon-sun");
  }
}
