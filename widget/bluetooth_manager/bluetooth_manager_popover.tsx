import {
  Accessor,
  createBinding,
  createComputed,
  createState,
  For,
  With,
} from "ags";
import { Gtk } from "ags/gtk4";
import Bluetooth from "gi://AstalBluetooth";
import { icons } from "../../models/texts/text_icons";
import { configuration } from "../../app";
import { cursors } from "../../models/utils/cursors";
import { ChangeBluetoothDeviceAliasWindow } from "./change_bluetooth_device_alias_window";
import Pango from "gi://Pango?version=1.0";

export function BluetoothManagerPopover() {
  const bluetooth = Bluetooth.get_default();
  const mainAdapter = createBinding(bluetooth, "adapter");
  const devices = createBinding(bluetooth, "devices");

  const pairedDevices = devices((d) => d.filter((p) => p.paired === true));
  const unpairedDevices = devices((d) =>
    d
      .filter((p) => p.paired === false)
      .sort((a, b) => {
        if (a.name == null) return -1;
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;
        return 0;
      })
  );

  const texts = configuration.getTexts().bluetoothManager;

  enum TabName {
    PAIRED,
    UNPAIRED,
  }
  const currentTabName = createState(TabName.PAIRED);

  return (
    <popover
      name={"Bluetooth manager popover"}
      autohide={false}
      hasArrow={false}
      class={"widget-popover"}
      marginEnd={60}
      marginBottom={30}
    >
      <box orientation={Gtk.Orientation.VERTICAL}>
        <box orientation={Gtk.Orientation.VERTICAL}>
          <box marginEnd={20} marginBottom={10}>
            <button
              label={`${icons.pairedTab} ${texts.paired}`}
              class={currentTabName[0]((t) =>
                t === TabName.PAIRED
                  ? "bluetooth-tab-button active"
                  : "bluetooth-tab-button"
              )}
              hexpand
              onClicked={() => currentTabName[1](TabName.PAIRED)}
              cursor={cursors.pointer}
            ></button>
            <button
              label={`${icons.unpairedTab} ${texts.unpaired}`}
              class={currentTabName[0]((t) =>
                t === TabName.UNPAIRED
                  ? "bluetooth-tab-button active"
                  : "bluetooth-tab-button"
              )}
              hexpand
              onClicked={() => currentTabName[1](TabName.UNPAIRED)}
              cursor={cursors.pointer}
            ></button>
          </box>
          <box
            widthRequest={300}
            heightRequest={400}
            hexpand={false}
            vexpand={false}
          >
            <box
              visible={currentTabName[0]((t) => t === TabName.PAIRED)}
              orientation={Gtk.Orientation.VERTICAL}
            >
              {createDevicesList(pairedDevices)}
            </box>
            <box
              visible={currentTabName[0]((t) => t === TabName.UNPAIRED)}
              orientation={Gtk.Orientation.VERTICAL}
              spacing={10}
            >
              {createDiscoverButton()}
              {createDevicesList(unpairedDevices)}
            </box>
          </box>
        </box>
      </box>
    </popover>
  );

  function createDiscoverButton() {
    return (
      <box orientation={Gtk.Orientation.VERTICAL} marginEnd={20}>
        <With value={mainAdapter}>
          {(adapter) => {
            const discovering = createBinding(adapter, "discovering");

            return (
              <box>
                <button
                  hexpand
                  visible={discovering((v) => !v)}
                  label={texts.searchForDevices + ` (${adapter.name})`}
                  cssClasses={["bluetooth-tab-button"]}
                  onClicked={() => {
                    try {
                      adapter.start_discovery();
                    } catch (error) {
                      console.log(
                        `Cant discover for bluetooth adapter ${adapter.name} (${adapter.alias}), error: ${error}`
                      );
                    }
                  }}
                  cursor={cursors.pointer}
                ></button>
                <button
                  hexpand
                  visible={discovering}
                  label={`${icons.unpairedTab} Searching...`}
                  cssClasses={["bluetooth-tab-button", "active"]}
                  cursor={cursors.processing}
                ></button>
              </box>
            );
          }}
        </With>
      </box>
    );
  }

  function createDevicesList(devices: Accessor<Bluetooth.Device[]>) {
    return (
      <scrolledwindow
        vexpand
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
          spacing={20}
          marginEnd={20}
        >
          <For each={devices}>{(device) => createDeviceBox(device)}</For>
        </box>
      </scrolledwindow>
    );
  }

  function createBatteryLevelBar(battery: Accessor<number>) {
    const levelBarBox = (
      <box heightRequest={10} spacing={10}>
        <With value={battery}>
          {(batteryValue) => {
            if (batteryValue >= 0 && batteryValue <= 1)
              return (
                <box heightRequest={10} spacing={10}>
                  <label label={icons.bluetoothBattery}></label>
                  <levelbar
                    cssClasses={["bluetooth-device-battery-bar"]}
                    heightRequest={10}
                    hexpand
                    minValue={0}
                    maxValue={1}
                    value={batteryValue}
                    $={(self) => {
                      try {
                        self.add_offset_value("verylow", 0.15);
                        self.add_offset_value("low", 0.25);
                        self.add_offset_value("mid", 0.35);
                        self.add_offset_value("high", 0.6);
                        self.add_offset_value("full", 1);
                      } catch (error) {}
                    }}
                  ></levelbar>
                  <label
                    widthChars={5}
                    label={battery((b) => `${(b * 100).toFixed()}%`)}
                  ></label>
                </box>
              );
          }}
        </With>
      </box>
    );

    return levelBarBox;
  }

  function createDeviceBox(device: Bluetooth.Device) {
    const connected = createBinding(device, "connected");
    const connecting = createBinding(device, "connecting");
    const alias = createBinding(device, "alias");
    const paired = createBinding(device, "paired");
    const trusted = createBinding(device, "trusted");
    const blocked = createBinding(device, "blocked");
    const battery = createBinding(device, "batteryPercentage");

    const showBattery = createComputed([connected, battery])(
      ([isConnected, batteryLevel]) =>
        isConnected === true && batteryLevel >= 0 && batteryLevel <= 100
    );

    let icon = icons.defaultBluetoothDevice;
    if (device.icon != null) {
      const customIcon = icons.bluetoothDevices[device.icon];
      if (customIcon !== undefined) icon = customIcon;
    }

    // console.log(`Create device for ${device.name} should show name: ${}`);

    return (
      <box orientation={Gtk.Orientation.VERTICAL} cssClasses={["device-box"]}>
        <box
          name={"bluetooth device labels"}
          orientation={Gtk.Orientation.HORIZONTAL}
          css={"padding: 0px 10px 0px 15px;"}
          spacing={15}
        >
          <label label={`${icon}`} css={"font-size:54px;"}></label>
          <box
            orientation={Gtk.Orientation.VERTICAL}
            hexpand
            valign={Gtk.Align.CENTER}
          >
            <box orientation={Gtk.Orientation.VERTICAL}>
              <label
                visible={alias((a) => a !== device.name)}
                xalign={0.0}
                widthChars={32}
                maxWidthChars={32}
                label={alias}
              ></label>
              <label
                xalign={0.0}
                widthChars={32}
                maxWidthChars={32}
                ellipsize={Pango.EllipsizeMode.END}
                visible={device.name != null}
                label={alias((a) =>
                  a !== device.name ? `(${device.name})` : device.name
                )}
                tooltipText={"Device name: " + device.name}
              ></label>
            </box>
            <box visible={showBattery}>{createBatteryLevelBar(battery)}</box>
          </box>
          <box
            name={"bluetooth device properties"}
            orientation={Gtk.Orientation.VERTICAL}
          >
            {devicePropertyBlocked()}
            {devicePropertyConnected()}
            {devicePropertyPaired()}
            {devicePropertyTrusted()}
          </box>
        </box>
        <box
          name={"bluetooth device actions"}
          orientation={Gtk.Orientation.HORIZONTAL}
        >
          {changeAliasButton()}
          {connectButton()}
          {trustButton()}
          {pairButton()}
          {blockButton()}
        </box>
      </box>
    );

    function devicePropertyBlocked() {
      return (
        <label
          cssClasses={["device-box-property-icon", "fg-bad"]}
          visible={blocked}
          label={icons.blocked}
          tooltipText={`Device is blocked.`}
        ></label>
      );
    }

    function devicePropertyConnected() {
      return (
        <label
          cssClasses={connected((v) => [
            `device-box-property-icon`,
            v ? "fg-good" : "fg-bad",
          ])}
          label={connected((v) =>
            v === true ? icons.connect : icons.disconnect
          )}
          tooltipText={connected(
            (v) =>
              `Device is ${
                v === true ? "" : "not "
              }connected to current device.`
          )}
        ></label>
      );
    }

    function devicePropertyPaired() {
      return (
        <label
          cssClasses={paired((v) => [
            `device-box-property-icon`,
            v ? "fg-good" : "fg-bad",
          ])}
          label={paired((v) => (v === true ? icons.paired : icons.unpaired))}
          tooltipText={paired(
            (v) =>
              `Device is ${v === true ? "" : "not "}paired with current device.`
          )}
        ></label>
      );
    }

    function devicePropertyTrusted() {
      return (
        <label
          cssClasses={trusted((v) => [
            `device-box-property-icon`,
            v ? "fg-good" : "fg-bad",
          ])}
          label={trusted((v) => (v === true ? icons.trust : icons.untrust))}
          tooltipText={trusted(
            (v) => `Device is ${v === true ? "" : "not "}trusted.`
          )}
        ></label>
      );
    }

    function changeAliasButton() {
      return (
        <button
          hexpand
          cssClasses={["device-box-button"]}
          visible={paired}
          cursor={cursors.pointer}
          onClicked={() => {
            ChangeBluetoothDeviceAliasWindow(device);
          }}
        >
          <box orientation={Gtk.Orientation.VERTICAL}>
            <label
              label={icons.edit}
              cssClasses={["device-box-button-icon", "fg-change"]}
            ></label>
            <label
              label={"ALIAS"}
              cssClasses={["device-box-button-text", "fg-change"]}
            ></label>
          </box>
        </button>
      );
    }

    function connectButton() {
      return (
        <button
          hexpand
          cssClasses={["device-box-button"]}
          visible={paired}
          cursor={connecting((v) => (v ? cursors.processing : cursors.pointer))}
          onClicked={async () => {
            try {
              if (connecting.get() === true) return;

              if (connected.get() === true) {
                console.log(`Disconnect device: ${device.name}`);

                device.disconnect_device((d) => {
                  if (d) {
                    console.log(`Disconnected ${device.name}`);
                  } else {
                    console.log(
                      `[WEIRD] Disconnect callback returned device as null.`
                    );
                  }
                });
              } else {
                console.log(`Connect with device: ${device.name}`);
                device.connect_device((d) => {
                  if (d) {
                    if (d.connected === true)
                      console.log(`Connected with ${device.name}`);
                    else console.log(`Cannot connect with ${device.name}`);
                  } else {
                    console.log(
                      `[WEIRD] Connect callback returned device as null.`
                    );
                  }
                });
              }
            } catch (error) {
              console.log(
                `Cannot connect/disconect device ${device.name}, error: ${error}`
              );
            }
          }}
        >
          <With value={connecting}>
            {(isConnecting) => {
              if (isConnecting === false) {
                return (
                  <box orientation={Gtk.Orientation.VERTICAL}>
                    <label
                      label={connected((v) =>
                        v ? icons.disconnect : icons.connect
                      )}
                      cssClasses={connected((v) => [
                        "device-box-button-icon",
                        v ? "fg-bad" : "fg-good",
                      ])}
                    ></label>
                    <label
                      label={connected((v) => (v ? `DISCONNECT` : `CONNECT`))}
                      cssClasses={connected((v) => [
                        "device-box-button-text",
                        v ? "fg-bad" : "fg-good",
                      ])}
                    ></label>
                  </box>
                );
              } else {
                return (
                  <box orientation={Gtk.Orientation.VERTICAL}>
                    <label
                      label={icons.connecting}
                      cssClasses={["device-box-button-icon", "fg-change"]}
                    ></label>
                    <label
                      label={"CONNECTING"}
                      cssClasses={["device-box-button-text", "fg-change"]}
                    ></label>
                  </box>
                );
              }
            }}
          </With>
        </button>
      );
    }

    function trustButton() {
      return (
        <button
          hexpand
          cssClasses={["device-box-button"]}
          visible={paired}
          cursor={cursors.pointer}
          onClicked={() => {
            console.log(`Trust/Untrust device: ${device.name}`);
            try {
              device.set_trusted(!trusted.get());
            } catch (error) {
              console.log(`Cannot trust/untrust device: ${device.name}`);
            }
          }}
        >
          <box orientation={Gtk.Orientation.VERTICAL}>
            <label
              label={trusted((v) => (v ? icons.untrust : icons.trust))}
              cssClasses={trusted((v) => [
                "device-box-button-icon",
                v ? "fg-bad" : "fg-good",
              ])}
            ></label>
            <label
              label={trusted((v) => (v === true ? `UNTRUST` : `TRUST`))}
              cssClasses={trusted((v) => [
                "device-box-button-text",
                v ? "fg-bad" : "fg-good",
              ])}
            ></label>
          </box>
        </button>
      );
    }

    function pairButton() {
      return (
        <button
          hexpand
          cssClasses={["device-box-button"]}
          visible={true}
          cursor={cursors.pointer}
          onClicked={async () => {
            try {
              if (paired.get() === true) {
                console.log(`Unpair device: ${device.name}`);
                mainAdapter.get().remove_device(device);
              } else {
                console.log(`Pair with device: ${device.name}`);
                device.pair();
              }
            } catch (error) {
              console.log(
                `Cannot pair/unpair device ${device.name}, error: ${error}`
              );
            }
          }}
          tooltipText={paired((v) =>
            v ? "Unpairing also removes device (from this list)" : "Pair device"
          )}
        >
          <box orientation={Gtk.Orientation.VERTICAL}>
            <label
              label={paired((v) => (v ? icons.close : icons.plus))}
              cssClasses={paired((v) => [
                "device-box-button-icon",
                v ? "fg-bad" : "fg-good",
              ])}
            ></label>
            <label
              label={paired((v) => (v ? `UNPAIR` : `PAIR`))}
              cssClasses={paired((v) => [
                "device-box-button-text",
                v ? "fg-bad" : "fg-good",
              ])}
            ></label>
          </box>
        </button>
      );
    }

    function blockButton() {
      return (
        <button
          hexpand
          cssClasses={["device-box-button-last"]}
          cursor={cursors.pointer}
          onClicked={() => {
            console.log(`Block/Unblock device: ${device.name}`);
          }}
        >
          <box orientation={Gtk.Orientation.VERTICAL}>
            <label
              label={blocked((v) => (v ? icons.unblocked : icons.blocked))}
              cssClasses={blocked((v) => [
                "device-box-button-icon",
                v ? "fg-good" : "fg-bad",
              ])}
            ></label>
            <label
              label={blocked((v) => (v ? `UNBLOCK` : `BLOCK`))}
              cssClasses={blocked((v) => [
                "device-box-button-text",
                v ? "fg-good" : "fg-bad",
              ])}
            ></label>
          </box>
        </button>
      );
    }
  }
}
