import {
  Accessor,
  createBinding,
  createComputed,
  createState,
  For,
  With,
} from "ags";
import { Astal, Gtk } from "ags/gtk4";
import { interval } from "ags/time";
import AstalIO from "gi://AstalIO?version=0.1";
import Network from "gi://AstalNetwork";
import { configuration } from "../../app";
import { icons } from "../../models/texts/text_icons";
import GLib from "gi://GLib?version=2.0";
import { CurrentConnectionStatus } from "./current_connection_status";

type NetworkProps = {
  network: Network.Network;
};

export function NetworkStatusPopover({ network }: NetworkProps) {
  let scanWifiInterval: AstalIO.Time | undefined;

  const wifi = createBinding(network, "wifi");
  const primary = createBinding(network, "primary");

  const useWifi = createComputed(
    [wifi, primary],
    (a: Network.Wifi, b: Network.Primary) => {
      if (a == undefined || a == null) return false;
      if (b !== Network.Primary.WIFI) return false;
      return true;
    }
  );

  return (
    <popover
      autohide={false}
      hasArrow={false}
      class={"widget-popover"}
      widthRequest={500}
      marginEnd={60}
      marginBottom={30}
      onShow={() => {
        scanWifiInterval = interval(5000, () => {
          const wifiValue = wifi.get();
          if (wifiValue !== undefined && wifiValue.enabled) network.wifi.scan();
        });
      }}
      onClosed={() => {
        if (scanWifiInterval !== undefined) {
          scanWifiInterval.cancel();
          scanWifiInterval = undefined;
        }
      }}
    >
      <box orientation={Gtk.Orientation.VERTICAL}>
        <box>{CurrentConnectionStatus({ network })}</box>

        <box
          visible={wifi(Boolean)}
          orientation={Gtk.Orientation.HORIZONTAL}
          halign={Gtk.Align.CENTER}
          marginTop={20}
          marginBottom={10}
        >
          <label label={"Wifi "}></label>
          <switch
            cssClasses={["network-wifi-switch"]}
            active={wifi((w) => w.enabled)}
            onNotifyActive={(self) => {
              network.wifi.set_enabled(self.state);
            }}
          ></switch>
        </box>

        <box visible={useWifi}>
          <With value={wifi}>
            {(wifi) => {
              return (
                <box>
                  <With value={createBinding(wifi, "state")}>
                    {(state: Network.DeviceState) => {
                      if (isWifiOk(state)) {
                        return accessPointsList();
                      } else {
                        return (
                          <box>
                            <label
                              label={
                                configuration.getTexts().network.wifiUnavailable
                              }
                            ></label>
                          </box>
                        );
                      }
                    }}
                  </With>
                </box>
              );
            }}
          </With>
        </box>
      </box>
    </popover>
  );

  function isWifiOk(state: Network.DeviceState) {
    return (
      state !== null &&
      state !== undefined &&
      state !== Network.DeviceState.UNKNOWN &&
      state !== Network.DeviceState.UNAVAILABLE &&
      state !== Network.DeviceState.UNMANAGED
    );
  }

  function accessPointsList() {
    const savedConnections: string[] = getSavedConnections();
    const filterAccessPoints = (arr: Network.AccessPoint[]) => {
      return arr
        .filter((ap) => !!ap.ssid && ap !== network.wifi.activeAccessPoint)
        .sort((a, b) => b.strength - a.strength);
    };
    const wifiAvailableNetworks = createBinding(
      network.wifi,
      "accessPoints"
    )(filterAccessPoints);

    return (
      <box orientation={Gtk.Orientation.VERTICAL}>
        <label
          cssClasses={["container-label"]}
          label={configuration.texts[0](
            (t) => `${t.network.availableNetworksLabel}`
          )}
        />
        <box orientation={Gtk.Orientation.VERTICAL} marginTop={10}>
          <With value={wifiAvailableNetworks}>
            {(aps) =>
              (aps.length > 0 && (
                <scrolledwindow heightRequest={200}>
                  <box orientation={Gtk.Orientation.VERTICAL} marginEnd={6}>
                    <For each={wifiAvailableNetworks(filterAccessPoints)}>
                      {(ap: Network.AccessPoint) =>
                        createAccessPointLabel(ap, savedConnections)
                      }
                    </For>
                  </box>
                </scrolledwindow>
              )) || (
                <box>
                  <label
                    cssClasses={["label-text"]}
                    label={configuration.texts[0](
                      (t) => `${t.network.searchNetworks}`
                    )}
                  ></label>
                  <label
                    cssClasses={["label-icon"]}
                    label={icons.searchNetworks}
                  ></label>
                </box>
              )
            }
          </With>
          {/* <With value={wifiAvailableNetworks}>
            {(aps: Network.AccessPoint[]) => {
              // console.log(`${aps.length} available access points`);

              if (aps.length === 0) {
                return (
                  <box>
                    <label
                      halign={Gtk.Align.CENTER}
                      cssClasses={["label-text"]}
                      label={configuration.texts[0](
                        (t) => `${t.network.searchNetworks}`
                      )}
                    ></label>
                    <label
                      halign={Gtk.Align.CENTER}
                      cssClasses={["label-icon"]}
                      label={icons.searchNetworks}
                    ></label>
                  </box>
                );
              } else {
                return (
                  <scrolledwindow heightRequest={200}>
                    <box orientation={Gtk.Orientation.VERTICAL} marginEnd={6}>
                      <For each={wifiAvailableNetworks}>
                        {(ap: Network.AccessPoint) =>
                          createAccessPointLabel(ap, savedConnections)
                        }
                      </For>
                    </box>
                  </scrolledwindow>
                );
              }
            }}
          </With> */}
        </box>
      </box>
    );
  }

  function getSavedConnections(): string[] {
    const connections: string[] = [];

    network.client.connections.forEach((connection) => {
      if (connection != undefined) {
        let connectionName = "";
        const wirelessSetting = connection.get_setting_wireless();
        if (wirelessSetting != undefined) {
          const ssidByteArray = wirelessSetting.get_ssid();
          const ssidArray = ssidByteArray.toArray(); // number[]
          connectionName = new TextDecoder("utf-8").decode(
            new Uint8Array(ssidArray)
          );
        }

        const connectionSetting = connection.get_setting_connection();
        if (
          connectionName !== "" &&
          connectionSetting &&
          connectionSetting.timestamp > 0
        ) {
          connections.push(connectionName);
        }
      }
    });

    return connections;
  }

  function createAccessPointLabel(
    ap: Network.AccessPoint,
    savedConnections: string[]
  ) {
    const signalStrengthThreshold = Math.floor(ap.strength / 25);
    let strengthIcon = icons.signalStrength0;
    switch (signalStrengthThreshold) {
      case 0:
        strengthIcon = icons.signalStrength0;
        break;
      case 1:
        strengthIcon = icons.signalStrength1;
        break;

      case 2:
        strengthIcon = icons.signalStrength2;
        break;

      case 3:
      case 4:
        strengthIcon = icons.signalStrength3;
        break;

      default:
        strengthIcon = icons.signalStrength0;
        break;
    }

    const passwordIcon = ap.requiresPassword ? icons.lock : icons.lockOpen;
    const passwordIconColor =
      "access-point-label-icon-" +
      (passwordIcon === icons.lock ? "bad" : "good");

    const speedIcon =
      ap.frequency < 4000 ? icons.networkSpeedSlow : icons.networkSpeedFast;
    const speedIconColor =
      "access-point-label-icon-" +
      (speedIcon === icons.networkSpeedSlow ? "bad" : "good");

    const savedIcon = savedConnections.includes(ap.ssid)
      ? icons.save
      : icons.unknownNetwork;
    const savedIconColor =
      "access-point-label-icon-" +
      (savedIcon === icons.unknownNetwork ? "bad" : "good");

    return (
      <box
        vexpand={false}
        cssClasses={["access-point-container"]}
        tooltipText={`${ap.ssid} ${ap.strength}/100`}
      >
        <box cssClasses={["access-point-label-container"]} marginEnd={10}>
          <label
            xalign={0}
            marginEnd={6}
            cssClasses={["label-icon"]}
            label={`${strengthIcon}`}
          ></label>
          <label
            xalign={0}
            yalign={0.6}
            hexpand
            marginEnd={6}
            cssClasses={["label-text"]}
            label={`${ap.ssid}`}
          ></label>
          <label
            xalign={0}
            marginEnd={6}
            cssClasses={["label-icon", speedIconColor]}
            label={`${speedIcon}`}
          ></label>
          <label
            xalign={0}
            marginEnd={6}
            cssClasses={["label-icon", savedIconColor]}
            label={`${savedIcon}`}
          ></label>
          <label
            xalign={0}
            marginEnd={6}
            cssClasses={["label-icon", passwordIconColor]}
            label={`${passwordIcon}`}
          ></label>
        </box>
        <button
          cssClasses={["network-connect-button"]}
          label={configuration.texts[0]((t) => t.network.connectButtonLabel)}
          onClicked={async () => {
            connectToAccessPoint(ap);
          }}
        ></button>
      </box>
    );
  }

  async function connectToAccessPoint(ap: Network.AccessPoint) {
    let pw: string | null = null;

    // if(ap.requiresPassword === false)
    // {
    //   network.client.add_connection_async()
    // }

    if (ap.get_connections().length == 0 && ap.requiresPassword) {
      // popup asking for password
    }

    return new Promise((resolve, reject) => {
      ap.activate(pw, (_, res) => {
        try {
          resolve(ap.activate_finish(res));
        } catch (error) {
          reject(error);
        }
      });
    });
  }
}
