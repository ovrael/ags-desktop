import {
  Accessor,
  createBinding,
  createComputed,
  createState,
  With,
} from "ags";
import { Gtk } from "ags/gtk4";
import Wp from "gi://AstalWp";
import { icons } from "../../models/texts/text_icons";

export function SoundStatusPopover() {
  const wpReady = createState(false);
  const wp = Wp.get_default();
  const defaultSpeaker = wp.audio.default_speaker;

  let systemVolume = createBinding(defaultSpeaker, "volume");
  let isMuted = createBinding(defaultSpeaker, "mute");
  let speakerData = createComputed([systemVolume, isMuted]);

  wp.connect("ready", () => {
    console.log("ready");
    wpReady[1](true);
    systemVolume = createBinding(defaultSpeaker, "volume");
    isMuted = createBinding(defaultSpeaker, "mute");
    speakerData = createComputed([systemVolume, isMuted]);
  });

  return (
    <popover
      name={"Sound status popover"}
      autohide={false}
      hasArrow={false}
      class={"widget-popover"}
      marginBottom={30}
    >
      <box orientation={Gtk.Orientation.VERTICAL}>
        <label label={"Sound status popover"}></label>
        <With value={wpReady[0]}>
          {(ready) =>
            (ready && createVolumeChange()) || (
              <box>
                <label label={"Waiting for sound device"}></label>
              </box>
            )
          }
        </With>
      </box>
    </popover>
  );

  function createVolumeChange() {
    return (
      <box>
        <button onClicked={() => defaultSpeaker.set_mute(!defaultSpeaker.mute)}>
          <With value={speakerData}>
            {(value) => (
              <label
                cssClasses={["sound-level-mute-button"]}
                label={getIcon(value[1], value[0])}
              ></label>
            )}
          </With>
        </button>
        <slider
          hexpand
          min={0}
          max={1}
          step={0.2}
          value={systemVolume}
          onValueChanged={(source) => {
            defaultSpeaker.set_volume(source.value);
          }}
        ></slider>
        <label label={systemVolume.as((v) => (v * 100).toFixed())}></label>
      </box>
    );
  }

  function getIcon(isMuted: boolean, volume: number) {
    if (isMuted === true) return icons.volumeMute;
    if (volume < 0.3) return icons.volumeLow;
    if (volume < 0.7) return icons.volumeMid;
    return icons.volumeHigh;
  }
}
