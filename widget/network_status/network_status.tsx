import { Accessor, createBinding, With } from "ags";
import { Gtk } from "ags/gtk4";
import { icons } from "../../models/texts/text_icons";
import Network from "gi://AstalNetwork";
import { NetworkStatusPopover } from "./network_status_popover";
import { Communication } from "../../models/utils/communication";

export function NetworkStatus() {
  const network: Network.Network = Network.get_default();
  const networkState = createBinding(network, "primary");

  return (
    <menubutton>
      <box cssClasses={["network-button"]} overflow={Gtk.Overflow.HIDDEN}>
        <With value={networkState}>
          {(state) => {
            if (state === null || state === undefined) {
              return null;
            }
            return createLabel(state);
          }}
        </With>
      </box>
      <NetworkStatusPopover network={network} />
    </menubutton>
  );

  function createLabel(networkType: Network.Primary) {
    try {
      let icon = icons.noConnection;
      switch (networkType) {
        case Network.Primary.UNKNOWN:
          icon = icons.noConnection;
          break;

        case Network.Primary.WIFI:
          icon = icons.wifiConnectionMax;
          break;

        case Network.Primary.WIRED:
          icon = icons.wiredConnection;
          break;

        default:
          icon = icons.noConnection;
          break;
      }

      return (
        <box>
          <label
            class={"network-button-good bar-button-label"}
            label={`${icon}`}
          />
        </box>
      );
    } catch (error) {
      Communication.printError(`ERROR create label: ${error}`),
        "network_status";

      return (
        <box>
          <label
            class={"network-button-good bar-button-label"}
            label={`${icons.noConnection} error`}
          />
        </box>
      );
    }
  }
}
