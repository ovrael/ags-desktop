import { Accessor, createBinding, createState, For, With } from "ags";
import { Astal, Gtk } from "ags/gtk4";
import { interval } from "ags/time";
import AstalIO from "gi://AstalIO?version=0.1";
import Network from "gi://AstalNetwork";
import { icons } from "../../models/texts/text_icons";
import Gio from "gi://Gio";
import { monitorFile, readFile } from "ags/file";
import { InternetSpeed } from "./internet_speed";
import { configuration } from "../../app";

type NetworkProps = {
  network: Network.Network;
};

export function CurrentConnectionStatus({ network }: NetworkProps) {
  const primaryConnectionType = createBinding(network, "primary");
  const downloadSpeed = createState(new InternetSpeed());
  const uploadSpeed = createState(new InternetSpeed());

  // interval(InternetSpeed.IntervalTimestamp, updateConnectionStats);
  interval(1000, updateConnectionStats);

  return (
    <box>
      <With value={primaryConnectionType}>
        {(primary) => {
          switch (primary) {
            case Network.Primary.WIFI:
              return createCurrentWifi(network);

            case Network.Primary.WIRED:
              return createCurrentWired(network);
          }

          return (
            <box>
              <label label={"Unknown network type"}></label>
            </box>
          );
        }}
      </With>
    </box>
  );

  function createCurrentWifi(network: Network.Network) {
    const wifiBinding = createBinding(network, "wifi");

    return (
      <box cssClasses={["current-connection-container"]}>
        <With value={wifiBinding}>
          {(wifi) => {
            return (
              <box cssClasses={["current-connection-data-container"]} hexpand>
                <label
                  cssClasses={["current-connection-icon"]}
                  label={icons.wifiConnectionMax}
                  marginEnd={30}
                ></label>
                <box hexpand orientation={Gtk.Orientation.VERTICAL}>
                  <box valign={Gtk.Align.START}>
                    <With value={createBinding(network.wifi, "ssid")}>
                      {(ssid: string) => {
                        return (
                          <label
                            valign={Gtk.Align.START}
                            xalign={0}
                            hexpand
                            cssClasses={["label-text"]}
                            label={ssid}
                          ></label>
                        );
                      }}
                    </With>
                  </box>

                  <box
                    tooltipText={configuration.getTexts().network.downloadSpeed}
                    marginEnd={20}
                  >
                    <With value={downloadSpeed[0]}>
                      {(speed) => {
                        return (
                          <box orientation={Gtk.Orientation.HORIZONTAL}>
                            <label
                              xalign={0}
                              marginEnd={5}
                              cssClasses={["label-icon"]}
                              label={icons.download}
                            ></label>
                            <label
                              xalign={1}
                              yalign={0.75}
                              widthChars={11} // 6 number + 5 unit
                              cssClasses={["label-text"]}
                              label={speed.getSpeed()}
                            ></label>
                          </box>
                        );
                      }}
                    </With>
                  </box>

                  <box
                    tooltipText={configuration.getTexts().network.uploadSpeed}
                  >
                    <With value={uploadSpeed[0]}>
                      {(speed) => {
                        return (
                          <box orientation={Gtk.Orientation.HORIZONTAL}>
                            <label
                              xalign={0}
                              marginEnd={5}
                              cssClasses={["label-icon"]}
                              label={icons.upload}
                            ></label>
                            <label
                              xalign={1}
                              yalign={0.75}
                              cssClasses={["label-text"]}
                              widthChars={11} // 6 number + 5 unit
                              label={speed.getSpeed()}
                            ></label>
                          </box>
                        );
                      }}
                    </With>
                  </box>

                  <box>
                    <With value={createBinding(wifi, "strength")}>
                      {(strength: number) => {
                        return (
                          <box orientation={Gtk.Orientation.HORIZONTAL}>
                            <label
                              valign={Gtk.Align.START}
                              cssClasses={["label-text"]}
                              label={"Strenght"}
                              marginEnd={10}
                            ></label>
                            <levelbar
                              vexpand
                              hexpand
                              cssClasses={["network-strength-bar"]}
                              orientation={Gtk.Orientation.HORIZONTAL}
                              value={strength / 100}
                            />
                          </box>
                        );
                      }}
                    </With>
                  </box>
                </box>
              </box>
            );
          }}
        </With>
      </box>
    );
  }

  function createCurrentWired(network: Network.Network) {
    const wiredBinding = createBinding(network, "wired");
    return (
      <box>
        <With value={wiredBinding}>
          {(wired) => {
            return (
              <box cssClasses={["current-connection-data-container"]} hexpand>
                <label
                  cssClasses={["current-connection-icon"]}
                  label={icons.wifiConnectionMax}
                ></label>
                <box hexpand orientation={Gtk.Orientation.VERTICAL}>
                  <label
                    valign={Gtk.Align.START}
                    hexpand
                    cssClasses={["label-text"]}
                    label={"Connected to ethernet"}
                  ></label>
                  <label
                    valign={Gtk.Align.START}
                    hexpand
                    cssClasses={["label-text"]}
                    label={"Speed: " + wired.speed}
                  ></label>
                </box>
              </box>
            );
          }}
        </With>
      </box>
    );
  }

  function updateConnectionStats() {
    // Get interface name e.g. wlan0
    let connectionInterface = "";
    for (let i = 0; i < network.client.primaryConnection.devices.length; i++) {
      const device = network.client.primaryConnection.devices[i];
      if (device.state === Network.DeviceState.ACTIVATED) {
        connectionInterface = device.interface;
        break;
      }
    }
    if (connectionInterface.length === 0) return;

    // Get text line with connection data
    const netdevFilepath = "/proc/net/dev";
    const content = readFile(netdevFilepath);

    if (content === undefined || content.length === 0) return;

    const lines = content.split("\n");

    let interfaceLine = "";
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trimStart();
      if (line.startsWith(connectionInterface)) {
        interfaceLine = line;
        break;
      }
    }

    const elements: string[] = interfaceLine.split(":");
    if (elements.length !== 2) return;

    const stats = elements[1].split(" ").filter((t) => t.length > 0);
    if (stats.length <= 8) return;

    const downloadBytes: number = parseInt(stats[0], 10);
    const uploadBytes: number = parseInt(stats[8], 10);

    downloadSpeed[1]((v) => v.update(downloadBytes));
    uploadSpeed[1]((v) => v.update(uploadBytes));
  }
}
