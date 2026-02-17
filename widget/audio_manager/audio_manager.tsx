import { Accessor, createBinding, createState, With } from "ags";
import { Gtk } from "ags/gtk4";
import { AudioManagerPopover } from "./audio_manager_popover";
import { icons } from "../../models/texts/text_icons";
import Wp from "gi://AstalWp";
import { cursors } from "../../models/utils/cursors";

export function AudioManager() {
  const wp = Wp.get_default();
  const defaultSpeaker = wp.audio.default_speaker;
  let systemVolume: Accessor<number> = createBinding(defaultSpeaker, "volume");

  wp.connect("ready", () => {
    systemVolume = createBinding(defaultSpeaker, "volume");
  });

  return (
    <menubutton cursor={cursors.pointer}>
      <box cssClasses={["sound-status-button"]} overflow={Gtk.Overflow.HIDDEN}>
        <With value={systemVolume}>{(volume) => createLabel(volume)}</With>
      </box>
      <AudioManagerPopover />
    </menubutton>
  );

  function createLabel(volume: number) {
    const volumeText = (volume * 100).toFixed();

    let icon = icons.volumeHigh;
    if (volume < 0.2) icon = icons.volumeLow;
    else if (volume < 0.65) icon = icons.volumeMid;

    return (
      <box>
        <label widthChars={2} class={"bar-button-label"} label={icon} />
        <label widthChars={4} label={volumeText}></label>
      </box>
    );
  }
}
