import { Accessor, createComputed, createState, For } from "ags";
import { Gtk } from "ags/gtk4";
import { configuration } from "../../app";
import { WeatherData } from "./weather_data";
import { weatherApi } from "./weather_api";
import { Tools } from "../../models/utils/tools";
import { LocalizationWeatherData } from "./localization_weather_data";
import { DateTools } from "../../models/utils/date_tools";
import { icons } from "../../models/texts/text_icons";

export function WeatherPopover() {
  const currentLocalization = createState("LocalizationTab0");
  const tabNameTemplate = "LocalizationTab{0}";

  return (
    <popover
      name={"Weather popover"}
      autohide
      hasArrow={false}
      class={"widget-popover"}
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
            <box>
              <For each={weatherApi.localizationWeathers[0]}>
                {(
                  localization: LocalizationWeatherData,
                  index: Accessor<number>
                ) => (
                  <box
                    visible={createComputed([index, currentLocalization[0]])(
                      (v) => Tools.formatString(tabNameTemplate, v[0]) === v[1]
                    )}
                  >
                    <box orientation={Gtk.Orientation.HORIZONTAL} spacing={12}>
                      <box orientation={Gtk.Orientation.VERTICAL} spacing={4}>
                        <label
                          cssClasses={["weather-panel-label"]}
                          label={"Current"}
                          xalign={0}
                        ></label>
                        <box cssClasses={["weather-panel"]} vexpand>
                          {createCurrentWeather(localization)}
                        </box>
                      </box>
                      <box
                        orientation={Gtk.Orientation.VERTICAL}
                        spacing={12}
                        vexpand
                      >
                        <box
                          orientation={Gtk.Orientation.VERTICAL}
                          spacing={4}
                          vexpand
                        >
                          <label
                            cssClasses={["weather-panel-label"]}
                            label={"Hourly"}
                            xalign={0}
                          ></label>
                          <box
                            vexpand
                            cssClasses={["weather-panel"]}
                            overflow={Gtk.Overflow.HIDDEN}
                          >
                            <scrolledwindow
                              vexpand
                              hexpand
                              minContentHeight={100}
                              minContentWidth={100}
                              vscrollbarPolicy={Gtk.PolicyType.NEVER}
                              hscrollbarPolicy={Gtk.PolicyType.ALWAYS}
                            >
                              {createHourlyWeather(localization.hourly)}
                            </scrolledwindow>
                          </box>
                        </box>
                        <box orientation={Gtk.Orientation.VERTICAL} spacing={4}>
                          <label
                            cssClasses={["weather-panel-label"]}
                            label={"Daily"}
                            xalign={0}
                          ></label>
                          <box cssClasses={["weather-panel"]}>
                            {createDailyWeather(localization.daily)}
                          </box>
                        </box>
                      </box>
                    </box>
                  </box>
                )}
              </For>
            </box>
          </box>
        </box>
      </box>
    </popover>
  );

  function createWeatherStackPageButton(
    index: number,
    localization: LocalizationWeatherData
  ): Gtk.Button {
    const button = new Gtk.Button({ hexpand: true });
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
    const box = new Gtk.Box({
      orientation: Gtk.Orientation.VERTICAL,
      valign: Gtk.Align.CENTER,
    });

    const iconLabel = new Gtk.Label();
    iconLabel.label = localization.current.icon;
    iconLabel.cssClasses = [
      "current-weather-icon",
      localization.current.getClass(),
    ];
    box.append(iconLabel);

    const temperatureLabel = new Gtk.Label();
    temperatureLabel.label = `${localization.current.temperature} ${localization.current.temperatureUnit}`;
    box.append(temperatureLabel);

    const precipitationLabel = new Gtk.Label();
    precipitationLabel.label = `${icons.precipitationProbability} ${localization.current.precipitationProbability} %`;
    box.append(precipitationLabel);

    return box;
  }

  function createHourlyWeather(forecast: WeatherData[]): Gtk.Box {
    const box = new Gtk.Box({
      orientation: Gtk.Orientation.HORIZONTAL,
      spacing: 12,
      cssClasses: [""],
    });

    for (let i = 0; i < forecast.length; i++) {
      const hourBox = new Gtk.Box({
        orientation: Gtk.Orientation.VERTICAL,
        cssClasses: ["weather-time-panel"],
      });

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

      const iconLabel = new Gtk.Label();
      iconLabel.label = forecast[i].icon;
      iconLabel.cssClasses = ["weather-icon-hourly", forecast[i].getClass()];
      hourBox.append(iconLabel);

      const temperatureLabel = new Gtk.Label();
      temperatureLabel.label = `${forecast[i].temperature} ${forecast[i].temperatureUnit}`;
      hourBox.append(temperatureLabel);

      const precipitationLabel = new Gtk.Label();
      precipitationLabel.label = `${icons.precipitationProbability} ${forecast[i].precipitationProbability} %`;
      hourBox.append(precipitationLabel);

      box.append(hourBox);
    }

    return box;
  }

  function createDailyWeather(forecast: WeatherData[]): Gtk.Box {
    const box = new Gtk.Box({
      orientation: Gtk.Orientation.HORIZONTAL,
      spacing: 6,
    });

    for (let i = 0; i < forecast.length; i++) {
      const dayBox = new Gtk.Box({
        orientation: Gtk.Orientation.VERTICAL,
        cssClasses: ["weather-time-panel"],
        width_request: 100,
      });

      // Time is YYYY-MM-DD format
      const date = new Date(forecast[i].time);
      const dayName = new Gtk.Label();
      dayName.label = DateTools.getDayName(date);
      dayBox.append(dayName);

      const dateLabel = new Gtk.Label();
      dateLabel.label = DateTools.toShortFormatDate(
        date,
        configuration.general.dateFormat
      );
      dayBox.append(dateLabel);

      const iconLabel = new Gtk.Label();
      iconLabel.label = forecast[i].icon;
      iconLabel.cssClasses = ["weather-icon-daily", forecast[i].getClass()];
      dayBox.append(iconLabel);

      const temperatureLabel = new Gtk.Label();
      temperatureLabel.label = `${forecast[i].temperature} ${forecast[i].temperatureUnit}`;
      dayBox.append(temperatureLabel);

      const precipitationLabel = new Gtk.Label();
      precipitationLabel.label = `${icons.precipitationProbability} ${forecast[i].precipitationProbability} %`;
      dayBox.append(precipitationLabel);

      box.append(dayBox);
    }

    return box;
  }
}
