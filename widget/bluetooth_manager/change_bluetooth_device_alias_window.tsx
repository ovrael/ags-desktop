import { Accessor, createRoot } from "ags";
import { Astal, Gtk } from "ags/gtk4";
import Wp from "gi://AstalWp";
import { icons } from "../../models/texts/text_icons";
import app from "ags/gtk4/app";
import { configuration } from "../../app";
import { Tools } from "../../models/utils/tools";
import Bluetooth from "gi://AstalBluetooth";

export function ChangeBluetoothDeviceAliasWindow(device: Bluetooth.Device) {
  const entryBuffer = new Gtk.EntryBuffer({
    maxLength: 30,
  });

  const bluetoothTexts = configuration.texts[0]((t) => t.bluetoothManager);
  const generalTexts = configuration.texts[0]((t) => t.general);
  let windowReference: Gtk.Window;

  createRoot((dispose) => {
    return (
      <window
        name={"ChangeBluetoothDeviceAliasWindow"}
        onCloseRequest={dispose}
        application={app}
        title={bluetoothTexts((t) => t.changeAliasWindowTitle)}
        resizable={false}
        visible={true}
        defaultWidth={200}
        defaultHeight={100}
        exclusivity={Astal.Exclusivity.NORMAL}
        keymode={Astal.Keymode.ON_DEMAND}
        $={(self) => {
          windowReference = self;
        }}
      >
        <box orientation={Gtk.Orientation.VERTICAL}>
          <label
            widthChars={42}
            wrap={true}
            wrapMode={Gtk.WrapMode.WORD}
            label={bluetoothTexts((t) =>
              Tools.formatString(t.changeAliasWindowText, device.name)
            )}
          ></label>
          <Gtk.Entry
            buffer={entryBuffer}
            maxLength={30}
            maxWidthChars={36}
            placeholderText={device.alias === device.name ? "" : device.alias}
          ></Gtk.Entry>
          <box spacing={20}>
            <button
              label={generalTexts((t) => t.cancel)}
              onClicked={() => {
                windowReference.close();
              }}
            ></button>
            <button
              label={generalTexts((t) => t.change)}
              onClicked={() => {
                const newAlias = entryBuffer.text;
                device.set_alias(newAlias.trim());
                windowReference.close();
              }}
            ></button>
          </box>
        </box>
      </window>
    ) as Gtk.Window;
  });
}
