import app from "ags/gtk4/app"
import mainStyle from "./styles/main.scss"
import { Bar } from "./widget/Bar"
import { TimerUtils } from "./widget/Timer/TimerUtils";
import { SoundPlayer } from "./utils/SoundPlayer";
import { Configuration } from "./models/configuration/configuration";

const monitors = app.get_monitors();
let mainMonitor = monitors.filter(m => m.description.includes("AW3423DWF"))[0];
if (mainMonitor == undefined)
  mainMonitor = monitors[monitors.length - 1];

export let configuration: Configuration = await Configuration.Create();
export function updateConfiguration(newConfiguration: Configuration) {
  configuration = newConfiguration;
}


await TimerUtils.loadTimersFromFile();
await SoundPlayer.init();

app.start({
  css: mainStyle,
  main() {
    Bar(mainMonitor)
    // Bar(app.get_monitors()[1])
    // app.get_monitors().map(MainBar)
  },
})