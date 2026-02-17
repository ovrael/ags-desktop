class TextIcons {


  //#region General
  public readonly plus: string = "󰐕";
  public readonly close: string = "󰅖";
  public readonly play: string = "";
  public readonly pause: string = "";
  public readonly arrowUp: string = "";
  public readonly arrowDown: string = "";
  public readonly arrowLeft: string = "";
  public readonly arrowRight: string = "";
  public readonly back: string = "󰭜";
  public readonly edit: string = "";
  public readonly save: string = "󰆓";
  public readonly warn: string = "";

  //#endregion

  //#region Timer
  public readonly alarmFinished: string = "󱜞";
  public readonly alarmOn: string = "󰞏";
  public readonly alarmClock: string = "󰔛";
  public readonly hourglass: string = "󰔟";
  //#endregion

  //#region Network status
  public readonly searchNetworks: string = "󰜏";

  // State
  public readonly wifiConnectionMax: string = "";
  public readonly wiredConnection: string = "󰈀";
  public readonly noConnection: string = "󰅛";

  // Properties
  public readonly unknownNetwork: string = "󱙃";
  public readonly lock: string = "";
  public readonly lockOpen: string = "";
  public readonly networkSpeedSlow: string = "󰾆";
  public readonly networkSpeedFast: string = "󰓅";

  // Speeds
  public readonly signalStrength0: string = "󰢿";
  public readonly signalStrength1: string = "󰢼";
  public readonly signalStrength2: string = "󰢽";
  public readonly signalStrength3: string = "󰢾";

  // Stats
  public readonly download: string = "";
  public readonly upload: string = "";

  //#endregion

  //#region Weahter

  // nf_weather_

  public readonly cloudyFull: string = "";
  public readonly precipitationProbability: string = "";

  // DAY
  public readonly daySun: string = "";
  public readonly dayCloudyMid: string = "";
  public readonly dayRain: string = "";
  public readonly daySnow: string = "";
  public readonly dayThunderstorm: string = "";

  // NIGHT
  public readonly nightMoon: string = "";
  public readonly nightCloudyMid: string = "";
  public readonly nightRain: string = "";
  public readonly nightSnow: string = "";
  public readonly nightThunderstorm: string = "";

  //#endregion

  //#region Audio control
  public readonly volumeMute: string = "";
  public readonly volumeLow: string = "";
  public readonly volumeMid: string = "";
  public readonly volumeHigh: string = "";

  public readonly speakerTab: string = "󰓃";
  public readonly microphoneTab: string = "";

  public readonly microphone: string = "";
  public readonly microphoneMute: string = "";
  //#endregion

  //#region Bluetooth control
  public readonly bluetoothOn: string = "󰂯";
  public readonly bluetoothOff: string = "󰂲";

  public readonly trust: string = "󰕥";
  public readonly untrust: string = "󰦞";

  public readonly paired: string = "";
  public readonly unpaired: string = "";

  public readonly blocked: string = "󰂭";
  public readonly unblocked: string = "";

  public readonly connect: string = "󰚥";
  public readonly connecting: string = "󱘖";
  public readonly disconnect: string = "󰚦";

  public readonly pairedTab: string = "";
  public readonly unpairedTab: string = "";

  public readonly bluetoothBattery: string = "󰥉";

  // device icons
  public readonly defaultBluetoothDevice: string = "";
  public readonly bluetoothDevices: Record<string, string> = {
    "computer": "󰇄",
    "audio-headset": "󰋎",
    "audio-headphones": "󰋋",
    "input-gaming": "󰊴",
    "input-mouse": "󰍽",
    "input-keyboard": "󰌌",
    "input-tablet": "󰓶",
    "phone": "",
    "microphone": "󰍬",
  }

  //#endregion

  //#region Workspace control
  public readonly currentWorkspace: string = "󰝤";
  public readonly emptyWorkspace: string = "󰝣";
  //#endregion
}
export const icons: TextIcons = new TextIcons();