import { Gtk } from "ags/gtk4";
import { createPoll } from "ags/time";
import { CalendarPopover } from "./calendar_popover";
import { cursors } from "../../models/utils/cursors";

export function Calendar() {
  const time = createPoll("", 10 * 1000, `date +"%R%t%x"`);

  return (
    <menubutton cursor={cursors.pointer}>
      <box cssClasses={["calendar-button"]} overflow={Gtk.Overflow.HIDDEN}>
        <label marginStart={10} marginEnd={10} label={time}></label>
      </box>
      <CalendarPopover />
    </menubutton>
  );
}
