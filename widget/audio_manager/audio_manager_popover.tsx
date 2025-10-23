import {
  Accessor,
  createBinding,
  createComputed,
  createConnection,
  createState,
  For,
  onCleanup,
  With,
} from "ags";
import { Astal, Gtk } from "ags/gtk4";
import Wp from "gi://AstalWp";
import { icons } from "../../models/texts/text_icons";
import AstalWp from "gi://AstalWp?version=0.1";
import Pango from "gi://Pango?version=1.0";
import { configuration } from "../../app";

export function AudioManagerPopover() {
  enum TabName {
    OUTPUT,
    INPUT,
  }

  const wpReady = createState(false);
  const wp = Wp.get_default();

  const currentTabName = createState(TabName.OUTPUT);
  const texts = configuration.getTexts().audioManager;

  const readyHandler = wp.connect("ready", () => {
    console.log("ready");
    wpReady[1](true);
  });

  onCleanup(() => {
    wp.disconnect(readyHandler);
  });

  return (
    <popover
      name={"Sound status popover"}
      autohide={true}
      hasArrow={false}
      class={"widget-popover"}
      marginEnd={60}
      marginBottom={30}
    >
      <box orientation={Gtk.Orientation.VERTICAL}>
        <With value={wpReady[0]}>
          {(ready) => {
            if (!ready) {
              return (
                <box>
                  <label label={texts.waitingForDevice}></label>
                </box>
              );
            }

            return (
              <box orientation={Gtk.Orientation.VERTICAL}>
                <box>
                  <button
                    label={`${icons.speakerTab} ${texts.output}`}
                    class={currentTabName[0]((t) =>
                      t === TabName.OUTPUT
                        ? "audio-button active"
                        : "audio-button"
                    )}
                    hexpand
                    onClicked={() => currentTabName[1](TabName.OUTPUT)}
                  ></button>
                  <button
                    label={`${icons.microphoneTab} ${texts.input}`}
                    class={currentTabName[0]((t) =>
                      t === TabName.INPUT
                        ? "audio-button active"
                        : "audio-button"
                    )}
                    hexpand
                    onClicked={() => currentTabName[1](TabName.INPUT)}
                  ></button>
                </box>
                <box widthRequest={300} heightRequest={400}>
                  <box
                    visible={currentTabName[0]((t) => t === TabName.OUTPUT)}
                    orientation={Gtk.Orientation.VERTICAL}
                  >
                    {createOutputStreamsCustomization()}
                    {createOutputDevicesCustomization()}
                  </box>
                  <box
                    visible={currentTabName[0]((t) => t === TabName.INPUT)}
                    orientation={Gtk.Orientation.VERTICAL}
                  >
                    {createInputStreamsCustomization()}
                    {createInputDevicesCustomization()}
                  </box>
                </box>
              </box>
            );
          }}
        </With>
      </box>
    </popover>
  );

  //#region Output
  function getVolumeIcon(isMuted: boolean, volume: number) {
    if (isMuted === true) return icons.volumeMute;
    if (volume < 0.3) return icons.volumeLow;
    if (volume < 0.7) return icons.volumeMid;
    return icons.volumeHigh;
  }

  function createOutputStreamsCustomization() {
    const streams = createBinding(
      wp.audio,
      "streams"
    )((all) =>
      all
        .filter((s) => s.mediaRole !== AstalWp.MediaRole.NOTIFICATION)
        .sort((a, b) => a.id - b.id)
    );

    const speakers = createBinding(
      wp.audio,
      "speakers"
    )((s) => s.sort((a, b) => a.id - b.id));

    const speakersListModel = speakers(
      (all) =>
        new Gtk.StringList({
          strings: all.map((s) => `${s.description}`),
        })
    );

    return (
      <box orientation={Gtk.Orientation.VERTICAL} marginTop={20}>
        <label css={"font-size: 28px;"} label={texts.streams}></label>
        <label
          css={"font-size: 16px;"}
          label={texts.noStreams}
          visible={streams((all) => all.length === 0)}
        ></label>
        <scrolledwindow
          vexpand
          hexpand
          propagateNaturalHeight
          minContentHeight={200}
          maxContentHeight={300}
          minContentWidth={100}
          vscrollbarPolicy={Gtk.PolicyType.AUTOMATIC}
          hscrollbarPolicy={Gtk.PolicyType.NEVER}
        >
          <box
            orientation={Gtk.Orientation.VERTICAL}
            vexpand
            hexpand
            marginEnd={30}
          >
            <For each={streams}>
              {(stream) => {
                const mute = createBinding(stream, "mute");
                const volume = createBinding(stream, "volume");
                const muteVolumeControl = createComputed([mute, volume]);
                const targetEndpoint = createBinding(stream, "targetEndpoint");
                let autoChange = false;

                return (
                  <box
                    orientation={Gtk.Orientation.VERTICAL}
                    marginTop={20}
                    vexpand
                  >
                    <label
                      xalign={0.0}
                      widthChars={30}
                      maxWidthChars={30}
                      ellipsize={Pango.EllipsizeMode.END}
                      tooltipText={`${configuration.getTexts().general.name}: ${
                        stream.name
                      }\n${configuration.getTexts().general.description}: ${
                        stream.description
                      }`}
                      label={`${stream.description} - ${stream.name}`}
                    ></label>
                    <box>
                      <button onClicked={() => stream.set_mute(!stream.mute)}>
                        <With value={muteVolumeControl}>
                          {(value) => (
                            <label
                              cssClasses={["sound-level-mute-button"]}
                              label={getVolumeIcon(value[0], value[1])}
                            ></label>
                          )}
                        </With>
                      </button>
                      <slider
                        sensitive={mute((m) => !m)}
                        hexpand
                        min={0}
                        max={1}
                        value={volume}
                        class={"volume-slider"}
                        onChangeValue={({ value }) => stream.set_volume(value)}
                        marginEnd={6}
                      ></slider>
                      <label
                        widthChars={3}
                        label={volume.as((v) => (v * 100).toFixed())}
                      ></label>
                    </box>
                    <box>
                      <With value={targetEndpoint}>
                        {(target) => {
                          if (target == undefined) target = wp.defaultSpeaker;
                          if (target == undefined) return <box></box>;

                          autoChange = true;

                          const selectedIndex = speakers((all) => {
                            let index = all.findIndex(
                              (s) => s.id === target.id
                            );

                            if (index < 0) {
                              index = all.findIndex(
                                (s) => s.isDefault === true
                              );
                            }

                            return index >= 0 ? index : 0;
                          });

                          setTimeout(() => (autoChange = false), 0);

                          return (
                            <box>
                              <label label={`${texts.outputDevice}:`}></label>
                              <Gtk.DropDown
                                model={speakersListModel}
                                cssClasses={["devices-dropdown"]}
                                selected={selectedIndex}
                                onNotifySelected={(dropdown, y) => {
                                  if (autoChange) return;

                                  const selected = dropdown.selected;
                                  const all = speakers.get();
                                  if (selected >= all.length || selected < 0)
                                    return;
                                  const selectedDevice = all[selected];
                                  if (!selectedDevice) return;

                                  if (
                                    stream.targetEndpoint == undefined ||
                                    stream.targetEndpoint.id !==
                                      selectedDevice.id
                                  ) {
                                    stream.set_target_endpoint(selectedDevice);
                                  }
                                }}
                              ></Gtk.DropDown>
                            </box>
                          );
                        }}
                      </With>
                    </box>
                  </box>
                );
              }}
            </For>
          </box>
        </scrolledwindow>
      </box>
    );
  }

  function createOutputDevicesCustomization() {
    const speakers = createBinding(wp.audio, "speakers");

    return (
      <box
        orientation={Gtk.Orientation.VERTICAL}
        marginTop={30}
        marginBottom={15}
      >
        <label css={"font-size: 28px;"} label={texts.devices}></label>
        <scrolledwindow
          vexpand
          hexpand
          propagateNaturalHeight
          minContentHeight={150}
          maxContentHeight={200}
          minContentWidth={100}
          vscrollbarPolicy={Gtk.PolicyType.AUTOMATIC}
          hscrollbarPolicy={Gtk.PolicyType.NEVER}
        >
          <box
            orientation={Gtk.Orientation.VERTICAL}
            vexpand
            hexpand
            marginEnd={30}
          >
            <For each={speakers((s) => s.sort((a, b) => a.id - b.id))}>
              {(speaker: AstalWp.Endpoint) => {
                const volume = createBinding(speaker, "volume");
                const mute = createBinding(speaker, "mute");
                const muteVolumeControl = createComputed([mute, volume]);

                return (
                  <box orientation={Gtk.Orientation.VERTICAL} marginTop={20}>
                    <label
                      widthChars={30}
                      maxWidthChars={30}
                      ellipsize={Pango.EllipsizeMode.END}
                      tooltipText={`${configuration.getTexts().general.name}: ${
                        speaker.name
                      }\n${configuration.getTexts().general.description}: ${
                        speaker.description
                      }`}
                      xalign={0}
                      label={`${speaker.description}`}
                    ></label>
                    <box>
                      <button onClicked={() => speaker.set_mute(!speaker.mute)}>
                        <With value={muteVolumeControl}>
                          {(value) => (
                            <label
                              cssClasses={["sound-level-mute-button"]}
                              label={getVolumeIcon(value[0], value[1])}
                            ></label>
                          )}
                        </With>
                      </button>
                      <slider
                        sensitive={mute((m) => !m)}
                        class={"volume-slider"}
                        hexpand
                        min={0}
                        max={1}
                        value={volume.as((v) => Math.round(v * 100) / 100)}
                        onChangeValue={({ value }) => speaker.set_volume(value)}
                        marginEnd={6}
                      ></slider>

                      <label
                        widthChars={3}
                        label={volume.as((v) => (v * 100).toFixed())}
                      ></label>
                    </box>
                  </box>
                );
              }}
            </For>
          </box>
        </scrolledwindow>
      </box>
    );
  }
  //#endregion

  //#region Input
  function createInputStreamsCustomization() {
    const recorders = createBinding(
      wp.audio,
      "recorders"
    )((all) =>
      all
        .filter((s) => s.mediaRole !== AstalWp.MediaRole.NOTIFICATION)
        .sort((a, b) => a.id - b.id)
    );

    const microphones = createBinding(wp.audio, "microphones");
    const microphonesListModel = microphones(
      (all) =>
        new Gtk.StringList({
          strings: all.map((m) => `${m.description}`),
        })
    );

    return (
      <box orientation={Gtk.Orientation.VERTICAL} marginTop={20}>
        <label css={"font-size: 28px;"} label={texts.records}></label>
        <label
          css={"font-size: 16px;"}
          label={texts.noRecords}
          visible={recorders((all) => all.length === 0)}
        ></label>
        <scrolledwindow
          vexpand
          hexpand
          propagateNaturalHeight
          minContentHeight={200}
          maxContentHeight={300}
          minContentWidth={100}
          vscrollbarPolicy={Gtk.PolicyType.AUTOMATIC}
          hscrollbarPolicy={Gtk.PolicyType.NEVER}
        >
          <box
            orientation={Gtk.Orientation.VERTICAL}
            vexpand
            hexpand
            marginEnd={30}
          >
            <For each={recorders}>
              {(record) => {
                const mute = createBinding(record, "mute");
                const volume = createBinding(record, "volume");
                const targetEndpoint = createBinding(record, "targetEndpoint");
                let autoChange = false;

                return (
                  <box
                    orientation={Gtk.Orientation.VERTICAL}
                    marginTop={20}
                    vexpand
                  >
                    <label
                      xalign={0.0}
                      widthChars={30}
                      maxWidthChars={30}
                      ellipsize={Pango.EllipsizeMode.END}
                      tooltipText={`${configuration.getTexts().general.name}: ${
                        record.name
                      }\n${configuration.getTexts().general.description}: ${
                        record.description
                      }`}
                      label={`${record.description} - ${record.name}`}
                    ></label>
                    <box>
                      <button onClicked={() => record.set_mute(!record.mute)}>
                        <label
                          cssClasses={["sound-level-mute-button"]}
                          label={mute((m) =>
                            m === true ? icons.microphoneMute : icons.microphone
                          )}
                        ></label>
                      </button>
                      <slider
                        sensitive={mute((m) => !m)}
                        class={"volume-slider"}
                        hexpand
                        min={0}
                        max={1}
                        value={volume}
                        onChangeValue={({ value }) => record.set_volume(value)}
                        marginEnd={6}
                      ></slider>
                      <label
                        widthChars={3}
                        label={volume.as((v) => (v * 100).toFixed())}
                      ></label>
                    </box>
                    <box>
                      <With value={targetEndpoint}>
                        {(target) => {
                          if (target == undefined)
                            target = wp.defaultMicrophone;
                          if (target == undefined) return <box></box>;

                          autoChange = true;

                          const selectedIndex = microphones((all) => {
                            let index = all.findIndex(
                              (s) => s.id === target.id
                            );

                            if (index < 0) {
                              index = all.findIndex(
                                (s) => s.isDefault === true
                              );
                            }

                            return index >= 0 ? index : 0;
                          });

                          setTimeout(() => (autoChange = false), 0);

                          return (
                            <box>
                              <label label={`${texts.inputDevice}:`}></label>
                              <Gtk.DropDown
                                model={microphonesListModel}
                                cssClasses={["devices-dropdown"]}
                                selected={selectedIndex}
                                onNotifySelected={(dropdown, y) => {
                                  if (autoChange) return;

                                  const selected = dropdown.selected;
                                  const all = microphones.get();
                                  if (all.length <= selected || selected < 0)
                                    return;
                                  const selectedDevice = all[selected];
                                  if (!selectedDevice) return;

                                  if (
                                    record.targetEndpoint == undefined ||
                                    record.targetEndpoint.id !==
                                      selectedDevice.id
                                  ) {
                                    record.set_target_endpoint(selectedDevice);
                                  }
                                }}
                              ></Gtk.DropDown>
                            </box>
                          );
                        }}
                      </With>
                    </box>
                  </box>
                );
              }}
            </For>
          </box>
        </scrolledwindow>
      </box>
    );
  }

  function createInputDevicesCustomization() {
    const microphones = createBinding(wp.audio, "microphones");

    return (
      <box
        orientation={Gtk.Orientation.VERTICAL}
        marginTop={30}
        marginBottom={15}
      >
        <label css={"font-size: 28px;"} label={texts.devices}></label>
        <scrolledwindow
          vexpand
          hexpand
          propagateNaturalHeight
          minContentHeight={150}
          maxContentHeight={200}
          minContentWidth={100}
          vscrollbarPolicy={Gtk.PolicyType.AUTOMATIC}
          hscrollbarPolicy={Gtk.PolicyType.NEVER}
        >
          <box
            orientation={Gtk.Orientation.VERTICAL}
            vexpand
            hexpand
            marginEnd={30}
          >
            <For each={microphones((s) => s.sort((a, b) => a.id - b.id))}>
              {(speaker: AstalWp.Endpoint) => {
                const volume = createBinding(speaker, "volume");
                const mute = createBinding(speaker, "mute");

                return (
                  <box orientation={Gtk.Orientation.VERTICAL} marginTop={20}>
                    <label
                      widthChars={30}
                      maxWidthChars={30}
                      ellipsize={Pango.EllipsizeMode.END}
                      tooltipText={`${configuration.getTexts().general.name}: ${
                        speaker.name
                      }\n${configuration.getTexts().general.description}: ${
                        speaker.description
                      }`}
                      xalign={0}
                      label={`${speaker.description}`}
                    ></label>
                    <box>
                      <button onClicked={() => speaker.set_mute(!speaker.mute)}>
                        <label
                          cssClasses={["sound-level-mute-button"]}
                          label={mute((m) =>
                            m === true ? icons.microphoneMute : icons.microphone
                          )}
                        ></label>
                      </button>
                      <slider
                        sensitive={mute((m) => !m)}
                        hexpand
                        class={"volume-slider"}
                        min={0}
                        max={1}
                        value={volume.as((v) => Math.round(v * 100) / 100)}
                        onChangeValue={({ value }) => speaker.set_volume(value)}
                        marginEnd={6}
                      ></slider>

                      <label
                        widthChars={3}
                        label={volume.as((v) => (v * 100).toFixed())}
                      ></label>
                    </box>
                  </box>
                );
              }}
            </For>
          </box>
        </scrolledwindow>
      </box>
    );
  }
  //#endregion
}
