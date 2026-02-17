import app from "ags/gtk4/app"
import mainStyle from "./styles/main.scss"
import { bar } from "./widget/bar"
import { TimerUtils } from "./widget/timer/timer_utils";
import { SoundPlayer } from "./models/utils/sound_player";
import { Configuration } from "./models/configuration/configuration";
import Adw from "gi://Adw";
import { weatherApi } from "./widget/weather/weather_api";
import NotificationManager from "./widget/notification_manager/notification_manager";
import { AudioManagerVolumeWindow } from "./widget/audio_manager/audio_manager_volume_window";
import { createState } from "ags";
import { timeout, Timer } from "ags/time";
import { ChangeBluetoothDeviceAliasWindow } from "./widget/bluetooth_manager/change_bluetooth_device_alias_window";

const monitors = app.get_monitors();
let mainMonitor = monitors.filter(m => m.description?.includes("AW3423DWF"))[0];
if (mainMonitor == undefined)
  mainMonitor = monitors[monitors.length - 1];

export let configuration: Configuration = await Configuration.create();
await weatherApi.init();
await TimerUtils.loadTimersFromFile();
await SoundPlayer.init();


// const styleManager = Adw.StyleManager.get_default();
// styleManager.colorScheme = Adw.ColorScheme.FORCE_DARK;

// const audioVolumeWindowVisible = createState<boolean>(false);
const closeWindowTimeoutTime: number = 2000;
let closeWindowTimeout: Timer | undefined;



app.start({
  css: mainStyle,

  requestHandler(argv: string[], response: (response: string) => void) {
    const [cmd, arg, ...rest] = argv

    switch (cmd) {
      case "volumeChange":
        onVolumeChange();
        break;

      default:
        response("request unknown");
        break;
    }

    response(`Request ${cmd} handled`);
  },
  main() {
    bar(mainMonitor)
    NotificationManager()
    AudioManagerVolumeWindow()
    // ChangeBluetoothDeviceAliasWindow()
    // Bar(app.get_monitors()[1])
    // app.get_monitors().map(MainBar)
  },
})

function onVolumeChange() {

  const audioVolumeLevelWindow = app.get_window("AudioVolumeLevelWindow");

  if (audioVolumeLevelWindow == undefined)
    return;

  audioVolumeLevelWindow.show();

  if (closeWindowTimeout !== undefined) {
    closeWindowTimeout.cancel();
    closeWindowTimeout = undefined;
  }

  closeWindowTimeout = timeout(closeWindowTimeoutTime, () => {
    audioVolumeLevelWindow.hide();
  });
}
