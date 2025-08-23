import { Accessor, createBinding, createState, For, State, With } from "ags";
import { Astal, Gtk } from "ags/gtk4";
import { interval } from "ags/time";
import AstalIO from "gi://AstalIO?version=0.1";
import Network from "gi://AstalNetwork";
import { configuration } from "../../app";
import { icons } from "../../models/texts/text_icons";

type Props = {
  network: Network.Network;
};

export function NetworkStatusPopover({ network }: Props) {
  let scanWifiInterval: AstalIO.Time | undefined;

  const wifiState = createBinding(network.wifi, "state");
  const wifiAvailableNetworks = createBinding(network.wifi, "accessPoints");

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
          if (network.wifi !== undefined) network.wifi.scan();
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
        {currentNetwork()}
        <With value={wifiState}>
          {(state) => {
            if (isWifiOk(state)) {
              return accessPointsList();
            } else {
              return (
                <box>
                  <label label={"Wifi is currently unavailable"}></label>
                </box>
              );
            }
          }}
        </With>
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

  function currentNetwork() {
    const activeAccessPoint = createBinding(network.wifi, "activeAccessPoint");

    return (
      <box marginBottom={10}>
        <With value={activeAccessPoint}>
          {(ap) => {
            if (ap === null || ap === undefined)
              return (
                <box>
                  <label label={"There is no active connection"}></label>
                </box>
              );

            return (
              <box>
                <label label={"CURRENT NETWORK: " + ap.ssid}></label>
              </box>
            );
          }}
        </With>
      </box>
    );
  }

  function accessPointsList() {
    const filterAccessPoints = (arr: Network.AccessPoint[]) => {
      return arr
        .filter((ap) => !!ap.ssid && ap !== network.wifi.activeAccessPoint)
        .sort((a, b) => b.strength - a.strength);
    };

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
                  <box orientation={Gtk.Orientation.VERTICAL}>
                    <For each={wifiAvailableNetworks(filterAccessPoints)}>
                      {(ap: Network.AccessPoint) => createAccessPointLabel(ap)}
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
        </box>
      </box>
    );
  }

  function createAccessPointLabel(ap: Network.AccessPoint) {
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
    const frequency = ap.frequency > 4000 ? "5.0" : "2.4";

    return (
      <box
        vexpand={false}
        cssClasses={["access-point-container"]}
        tooltipText={`Signal strength: ${ap.strength}`}
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
            hexpand
            marginEnd={6}
            cssClasses={["label-text"]}
            label={`${ap.ssid}`}
          ></label>
          <label
            xalign={0}
            marginEnd={6}
            cssClasses={["label-text"]}
            label={`${frequency} GHz`}
          ></label>
          <label
            xalign={0}
            marginEnd={6}
            cssClasses={["label-icon"]}
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
