import { Accessor, With } from "ags";
import { Gtk } from "ags/gtk4";
import { icons } from "../../models/texts/text_icons";
import { WeatherPopover } from "./weather_popover";
import { WeatherLocalization } from "./weather_localization";
import { configuration } from "../../app";
import { weatherApi } from "./weather_api";
import Pango from "gi://Pango";

export function Weather() {
  const mainLocalization = weatherApi.localizationWeathers[0](
    (v) => v.find((l) => l.isMain) ?? v[0]
  );

  return (
    <box>
      <menubutton>
        <box cssClasses={["weather-button"]} overflow={Gtk.Overflow.HIDDEN}>
          <box
            heightRequest={20}
            widthRequest={20}
            cssClasses={mainLocalization((v) => [
              "weather-button-label-container",
              v.current.getClass(true),
            ])}
          >
            <box overflow={Gtk.Overflow.HIDDEN} marginEnd={4}>
              <label
                valign={Gtk.Align.CENTER}
                halign={Gtk.Align.CENTER}
                cssClasses={["weather-button-status-label"]}
                label={mainLocalization((v) => v.current.icon)}
              />
            </box>
            <box>
              <With value={configuration.weatherState[0]}>
                {(state) => {
                  if (state.showLocationName === true) {
                    return (
                      <label
                        marginEnd={6}
                        cssClasses={["weather-button-name-label"]}
                        label={mainLocalization((v) => v.name)}
                      />
                    );
                  } else return <box></box>;
                }}
              </With>
            </box>
            <label
              cssClasses={["weather-button-temperature-label"]}
              label={mainLocalization(
                (v) => `${v.current.temperature} ${v.current.temperatureUnit}`
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
