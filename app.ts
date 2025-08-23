import app from "ags/gtk4/app"
import mainStyle from "./styles/main.scss"
import { bar } from "./widget/bar"
import { TimerUtils } from "./widget/timer/timer_utils";
import { SoundPlayer } from "./models/utils/sound_player";
import { Configuration } from "./models/configuration/configuration";
import Adw from "gi://Adw";

const monitors = app.get_monitors();
let mainMonitor = monitors.filter(m => m.description.includes("AW3423DWF"))[0];
if (mainMonitor == undefined)
  mainMonitor = monitors[monitors.length - 1];

export let configuration: Configuration = await Configuration.create();
export function updateConfiguration(newConfiguration: Configuration) {
  configuration = newConfiguration;
}


await TimerUtils.loadTimersFromFile();
await SoundPlayer.init();


// const styleManager = Adw.StyleManager.get_default();
// styleManager.colorScheme = Adw.ColorScheme.FORCE_DARK;

app.start({
  css: mainStyle,
  main() {
    bar(mainMonitor)
    // Bar(app.get_monitors()[1])
    // app.get_monitors().map(MainBar)
  },
})