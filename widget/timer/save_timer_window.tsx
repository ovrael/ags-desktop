import { Gtk } from "ags/gtk4";
import { timerVariables } from "./timer_variables";
import { SavedTimer } from "./saved_timer";
import { TimerUtils } from "./timer_utils";
import { TimerDigits } from "./timer_digit";
import { TimerDigit } from "./timer_enums";
import { configuration } from "../../app";
import { icons } from "../../models/texts/text_icons";

export class SaveTimerWindow {
  static instance: SaveTimerWindow | undefined = undefined;
  private window: Gtk.Window;

  private timerName: string = "";
  private timerSeconds: TimerDigits = new TimerDigits();
  private digitLabels: Gtk.Label[] = [];

  constructor() {
    this.window = Gtk.Window.new();
    this.window.resizable = false;
    this.window.defaultWidth = 400;
    this.window.defaultHeight = 200;
    this.window.widthRequest = 400;
    this.window.heightRequest = 200;
    this.window.title = "Create timer";
    this.window.child = this.createContent();
    this.window.cssClasses = ["create-save-timer-window"];

    this.window.connect("close-request", () => {
      SaveTimerWindow.instance = undefined;
      return false; // close window
    });

    this.window.present();
  }

  public static create() {
    if (SaveTimerWindow.instance === undefined) {
      SaveTimerWindow.instance = new SaveTimerWindow();
    } else {
      // Set focus somehow?
    }
  }

  private createContent(): Gtk.Widget {
    const content = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL });

    // Description
    const askLabel = new Gtk.Label();
    askLabel.label = configuration.getTexts().timer.saveAskLabel;
    content.append(askLabel);

    // Text entry
    const nameEntry = new Gtk.Entry();
    nameEntry.name = "UserEntry";
    nameEntry.maxLength = 16;
    nameEntry.marginTop = 20;
    nameEntry.placeholderText =
      configuration.getTexts().timer.saveNamePlaceholder;
    nameEntry.buffer.connect("inserted-text", (buffer) => {
      this.timerName = buffer.get_text();
    });
    nameEntry.buffer.connect("deleted-text", (buffer) => {
      this.timerName = buffer.get_text();
    });
    content.append(nameEntry);

    // Time entry
    const timeEntry = this.createTimeEntry();
    content.append(timeEntry);

    // Buttons { ADD | CANCEL }
    const buttonsBox = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL });
    const addButton = this.createAddButton();
    buttonsBox.append(addButton);
    const cancelButton = this.createCancelButton();
    buttonsBox.append(cancelButton);

    content.append(buttonsBox);

    return content;
  }

  private createTimeEntry(): Gtk.Box {
    const timeEntryContainer = new Gtk.Box({
      hexpand: true,
      marginTop: 40,
      marginBottom: 40,
    });

    const overlay = new Gtk.Overlay({
      hexpand: true,
      cssClasses: ["timer-popover-label-digit-container"],
    });

    const foregroundTimeEntryContainer = new Gtk.Box({
      hexpand: true,
      name: "save-window-time-entry-foreground",
    });

    foregroundTimeEntryContainer.append(this.createTimeEntryForeground());

    const backgroundTimeEntryContainer = new Gtk.Box({
      hexpand: true,
      name: "save-window-time-entry-background",
    });
    backgroundTimeEntryContainer.append(this.createTimeEntryBackground());

    overlay.add_overlay(foregroundTimeEntryContainer);
    overlay.set_child(backgroundTimeEntryContainer);

    timeEntryContainer.append(overlay);

    return timeEntryContainer;
  }

  private createTimeEntryForeground(): Gtk.Box {
    const timeEntryBox = new Gtk.Box({
      orientation: Gtk.Orientation.HORIZONTAL,
      hexpand: true,
      halign: Gtk.Align.CENTER,
    });

    const hoursBox = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL });
    const hourLabel1 = this.createTimeEntryDigitLabel(TimerDigit.Hour1);
    const hourLabel2 = this.createTimeEntryDigitLabel(TimerDigit.Hour2);
    hoursBox.append(hourLabel1);
    hoursBox.append(hourLabel2);

    const minutesBox = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL });
    const minutesLabel1 = this.createTimeEntryDigitLabel(TimerDigit.Minute1);
    const minutesLabel2 = this.createTimeEntryDigitLabel(TimerDigit.Minute2);
    minutesBox.append(minutesLabel1);
    minutesBox.append(minutesLabel2);

    const secondsBox = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL });
    const secondsLabel1 = this.createTimeEntryDigitLabel(TimerDigit.Second1);
    const secondsLabel2 = this.createTimeEntryDigitLabel(TimerDigit.Second2);
    secondsBox.append(secondsLabel1);
    secondsBox.append(secondsLabel2);

    const separatorLabel = new Gtk.Label({
      label: ":",
      cssClasses: ["timer-popover-label-digit"],
    });
    const separatorLabel2 = new Gtk.Label({
      label: ":",
      cssClasses: ["timer-popover-label-digit"],
    });

    timeEntryBox.append(hoursBox);
    timeEntryBox.append(separatorLabel);
    timeEntryBox.append(minutesBox);
    timeEntryBox.append(separatorLabel2);
    timeEntryBox.append(secondsBox);

    return timeEntryBox;
  }

  private createTimeEntryDigitLabel(digitIndex: TimerDigit): Gtk.Label {
    const digitLabel = new Gtk.Label({
      name: digitIndex.toString(),
      label: "0",
      cssClasses: ["timer-popover-label-digit"],
    });

    const scrollController = new Gtk.EventControllerScroll({
      name: "scrollController",
      flags: Gtk.EventControllerScrollFlags.VERTICAL,
    });

    scrollController.connect("scroll", (controller, dx, dy) => {
      this.timerSeconds.updateTime(digitIndex, -dy);
      this.digitLabels.forEach((label) => {
        label.label = this.timerSeconds.getDigit(
          label.name as unknown as TimerDigit
        );
      });
    });

    digitLabel.add_controller(scrollController);
    this.digitLabels.push(digitLabel);

    return digitLabel;
  }

  private createTimeEntryBackground() {
    const timeEntryBox = new Gtk.Box({
      orientation: Gtk.Orientation.HORIZONTAL,
      hexpand: true,
      halign: Gtk.Align.CENTER,
    });

    const hoursBox = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL });
    const hourLabel1 = new Gtk.Label({
      label: "0",
      cssClasses: ["timer-popover-label-digit-background"],
    });
    const hourLabel2 = new Gtk.Label({
      label: "0",
      cssClasses: ["timer-popover-label-digit-background"],
    });
    hoursBox.append(hourLabel1);
    hoursBox.append(hourLabel2);

    const minutesBox = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL });
    const minutesLabel1 = new Gtk.Label({
      label: "0",
      cssClasses: ["timer-popover-label-digit-background"],
    });
    const minutesLabel2 = new Gtk.Label({
      label: "0",
      cssClasses: ["timer-popover-label-digit-background"],
    });
    minutesBox.append(minutesLabel1);
    minutesBox.append(minutesLabel2);

    const secondsBox = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL });
    const secondsLabel1 = new Gtk.Label({
      label: "0",
      cssClasses: ["timer-popover-label-digit-background"],
    });
    const secondsLabel2 = new Gtk.Label({
      label: "0",
      cssClasses: ["timer-popover-label-digit-background"],
    });
    secondsBox.append(secondsLabel1);
    secondsBox.append(secondsLabel2);

    const separatorLabel = new Gtk.Label({
      label: ":",
      cssClasses: ["timer-popover-label-digit"],
    });
    const separatorLabel2 = new Gtk.Label({
      label: ":",
      cssClasses: ["timer-popover-label-digit"],
    });

    timeEntryBox.append(hoursBox);
    timeEntryBox.append(separatorLabel);
    timeEntryBox.append(minutesBox);
    timeEntryBox.append(separatorLabel2);
    timeEntryBox.append(secondsBox);
    return timeEntryBox;
  }

  private createAddButton(): Gtk.Button {
    const button = new Gtk.Button();
    button.label = icons.plus + " " + configuration.getTexts().general.add;
    button.hexpand = true;
    button.marginEnd = 12;
    button.cssClasses = ["timer-popover-start-button"];
    button.connect("clicked", async () => {
      const allSeconds = this.timerSeconds.getAllSeconds();
      if (
        this.timerName === undefined ||
        this.timerName.length === 0 ||
        allSeconds === 0
      ) {
        // WRONG DATA - INFORM USER
        return;
      }

      timerVariables.savedTimers[1]((v) => {
        return v.concat(new SavedTimer(this.timerName, allSeconds));
      });

      await TimerUtils.saveTimersToFile();

      this.window.close();
    });

    return button;
  }

  private createCancelButton(): Gtk.Button {
    const button = new Gtk.Button();
    button.label = icons.back + " " + configuration.getTexts().general.cancel;
    button.hexpand = true;
    button.cssClasses = ["timer-popover-remove-timer-button"];
    button.connect("clicked", () => {
      this.window.close();
    });
    return button;
  }
}
