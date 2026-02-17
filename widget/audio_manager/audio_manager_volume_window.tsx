import { Accessor, createBinding, createComputed } from "ags";
import { Astal, Gtk } from "ags/gtk4";
import Wp from "gi://AstalWp";
import { icons } from "../../models/texts/text_icons";
import app from "ags/gtk4/app";

export function AudioManagerVolumeWindow() {
  const wp = Wp.get_default();
  const endpoint = wp.audio.default_speaker;

  const volume = createBinding(endpoint, "volume");
  const mute = createBinding(endpoint, "mute");
  const muteVolumeControl = createComputed([mute, volume]);

  return (
    <window
      name={"AudioVolumeLevelWindow"}
      application={app}
      opacity={0.75}
      title={"volume"}
      cssClasses={["volume-window"]}
      resizable={false}
      defaultWidth={160}
      defaultHeight={50}
      modal={true}
      visible={false}
      focusable={false}
      canFocus={false}
      anchor={Astal.WindowAnchor.BOTTOM}
      marginBottom={80}
      hexpand={false}
      vexpand={false}
      canTarget={false}
      focusOnClick={false}
      layer={Astal.Layer.OVERLAY}
    >
      <box heightRequest={10} spacing={10}>
        <label
          css={"font-size:36px"}
          label={muteVolumeControl(([m, v]) => getVolumeIcon(m, v))}
          marginStart={10}
        ></label>
        <levelbar
          cssClasses={["volume-level-bar"]}
          vexpand={false}
          hexpand
          heightRequest={10}
          minValue={0}
          maxValue={1}
          value={volume}
          $={(self) => {
            self.add_offset_value("verylow", 0.15);
            self.add_offset_value(Gtk.LEVEL_BAR_OFFSET_LOW, 0.25);
            self.add_offset_value("mid", 0.75);
            self.add_offset_value(Gtk.LEVEL_BAR_OFFSET_HIGH, 0.85);
            self.add_offset_value(Gtk.LEVEL_BAR_OFFSET_FULL, 1);
          }}
        ></levelbar>
        <label
          label={volume((v) => (v * 100).toFixed())}
          widthChars={3}
          css={"font-size:14px"}
          marginEnd={10}
        ></label>
      </box>
    </window>
  ) as Gtk.Window;

  function getVolumeIcon(isMuted: boolean, volume: number) {
    if (isMuted === true) return icons.volumeMute;
    if (volume < 0.3) return icons.volumeLow;
    if (volume < 0.7) return icons.volumeMid;
    return icons.volumeHigh;
  }
}
