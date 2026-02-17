import {
  Accessor,
  createBinding,
  createComputed,
  createState,
  With,
} from "ags";
import { Gdk, Gtk } from "ags/gtk4";
import { Tools } from "../../models/utils/tools";
import { BluetoothManagerPopover } from "./bluetooth_manager_popover";
import { icons } from "../../models/texts/text_icons";
import Bluetooth from "gi://AstalBluetooth";
import { cursors } from "../../models/utils/cursors";

export function BluetoothManager() {
  const bluetooth = Bluetooth.get_default();

  const adapters = createBinding(bluetooth, "adapters");
  const adapter = createBinding(bluetooth, "adapter");
  const adaptersData = createComputed([adapters, adapter]);

  return (
    <menubutton cursor={cursors.pointer}>
      <box cssClasses={["bluetooth-button"]} overflow={Gtk.Overflow.HIDDEN}>
        <With value={adaptersData}>
          {([adapters, adapter]) => {
            if (
              adapters.length === 0 ||
              adapters.filter((a) => a.powered === false).length ===
                adapters.length ||
              adapter == null ||
              adapter.powered === false
            ) {
              return (
                <box>
                  <label
                    widthChars={2}
                    class={"bar-button-label"}
                    label={icons.bluetoothOff}
                  />
                </box>
              );
            } else {
              return (
                <box>
                  <label
                    widthChars={2}
                    class={"bar-button-label"}
                    label={icons.bluetoothOn}
                  />
                </box>
              );
            }
          }}
        </With>
      </box>
      <BluetoothManagerPopover />
    </menubutton>
  );
}
