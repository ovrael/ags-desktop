import { Accessor, createBinding, createState, With } from "ags";
import { Gtk } from "ags/gtk4";
import { Tools } from "../../models/utils/tools";
import { SoundStatusPopover } from "./sound_status_popover";
import { icons } from "../../models/texts/text_icons";
import Wp from "gi://AstalWp";

export function SoundStatus() {
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
      <SoundStatusPopover />
    </menubutton>
  );

  function createLabel(volume: number) {
    if (volume < 0.3)
      return <label class={"bar-button-label"} label={`${icons.volumeLow}`} />;

    if (volume < 0.7)
      return <label class={"bar-button-label"} label={`${icons.volumeMid}`} />;

    return <label class={"bar-button-label"} label={`${icons.volumeHigh}`} />;
  }
}
