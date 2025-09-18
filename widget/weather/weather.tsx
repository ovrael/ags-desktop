import { Accessor, With } from "ags";
import { Gtk } from "ags/gtk4";
import { icons } from "../../models/texts/text_icons";
import { WeatherPopover } from "./weather_popover";
import { WeatherLocalization } from "./weather_localization";
import { configuration } from "../../app";
import { weatherApi } from "./weather_api";

export function Weather() {
  const mainLocalization = weatherApi.localizationWeathers[0](
    (v) => v.find((l) => l.isMain) ?? v[0]
  );

  return (
    <box>
      <menubutton>
        <box cssClasses={["weather-button"]} overflow={Gtk.Overflow.HIDDEN}>
          <box
            cssClasses={mainLocalization((v) => [
              "weather-button-label-container",
              v.current.getClass(true),
            ])}
          >
            <label
              cssClasses={["bar-button-label"]}
              label={mainLocalization((v) => v.current.icon)}
            />
            <box>
              <With value={configuration.weatherState[0]}>
                {(state) => {
                  if (state.showLocationName === true) {
                    return <label label={mainLocalization((v) => v.name)} />;
                  } else return <box></box>;
                }}
              </With>
            </box>
            <label
              label={mainLocalization((v) => `${v.current.temperature}`)}
            />
            <label
              cssClasses={["bar-button-label"]}
              label={configuration.weatherState[0]((w) =>
                w.temperatureUnit === "F"
                  ? icons.fahrenheitUnit
                  : icons.celsiusUnit
              )}
            />
          </box>
        </box>
        <WeatherPopover />
      </menubutton>
    </box>
  );

  function checkLocalizations(localizations: WeatherLocalization[]) {
    const badLocalizations: string[] = [];

    for (let i = 0; i < localizations.length; i++) {
      if (!localizationIsGood(localizations[i])) {
        badLocalizations.push(localizations[i].name ?? `Localization ${i + 1}`);
      }
    }

    return badLocalizations;
  }

  function localizationIsGood(localization: WeatherLocalization) {
    if (Math.abs(localization.latitude) > 90) return false;

    if (Math.abs(localization.longitude) > 180) return false;

    return true;
  }
}
