import { Accessor, createBinding, createState, With } from "ags";
import { Gtk } from "ags/gtk4";
import { Tools } from "../../models/utils/tools";
import { AudioManagerPopover } from "./audio_manager_popover";
import { icons } from "../../models/texts/text_icons";
import Wp from "gi://AstalWp";

export function AudioManager() {
  const wp = Wp.get_default();
  const default_speaker = wp.audio.default_speaker;
  let systemVolume: Accessor<number> = createBinding(default_speaker, "volume");

  wp.connect("ready", () => {
    systemVolume = createBinding(default_speaker, "volume");
  });

  return (
    <menubutton>
      <box cssClasses={["sound-status-button"]} overflow={Gtk.Overflow.HIDDEN}>
        <With value={systemVolume}>{(volume) => createLabel(volume)}</With>
      </box>
      <AudioManagerPopover />
    </menubutton>
  );

  function createLabel(volume: number) {
    const volumeInt = (volume * 100).toFixed();

    if (volume < 0.3)
      return (
        <box>
          <label class={"bar-button-label"} label={`${icons.volumeLow}`} />
          <label label={volumeInt}></label>
        </box>
      );

    if (volume < 0.7)
      return (
        <box>
          <label class={"bar-button-label"} label={`${icons.volumeMid}`} />
          <label label={volumeInt}></label>
        </box>
      );

    return (
      <box>
        <label class={"bar-button-label"} label={`${icons.volumeHigh}`} />
        <label label={volumeInt}></label>
      </box>
    );
  }
}
