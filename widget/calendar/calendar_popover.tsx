import { createComputed, createState, With } from "ags";
import { Gdk, Gtk } from "ags/gtk4";
import { exec, execAsync } from "ags/process";
import { icons } from "../../models/texts/text_icons";
import { cursors } from "../../models/utils/cursors";
import { CalendarEvent } from "./calendar_event";
import { writeFileAsync } from "ags/file";
import { configuration } from "../../app";

export function CalendarPopover() {
  const [getDate, setDate] = createState([] as number[]);
  const [getMonthDiff, setMonthDiff] = createState(0);
  const [getYearDiff, setYearDiff] = createState(0);
  const [getEvents, setEvents] = createState([] as CalendarEvent[]);

  const dateData = createComputed([
    getDate,
    getMonthDiff,
    getYearDiff,
    getEvents,
  ]);

  const getMonthLength = (month: number, year: number) => {
    switch (month) {
      case 1:
      case 3:
      case 5:
      case 7:
      case 8:
      case 10:
      case 12:
      case 0:
        return 31;

      case 4:
      case 6:
      case 9:
      case 11:
        return 30;

      case 2:
        return (
          28 +
          ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 1 : 0)
        );

      default:
        return 31;
    }
  };

  const monthNames = [
    "Styczeń",
    "Luty",
    "Marzec",
    "Kwiecień",
    "Maj",
    "Czerwiec",
    "Lipiec",
    "Sierpień",
    "Wrzesień",
    "Październik",
    "Listopad",
    "Grudzień",
  ];

  const monthNameMaxWidth = monthNames.toSorted(
    (a, b) => b.length - a.length
  )[0].length;

  return (
    <popover
      name={"Calendar popover"}
      autohide={false}
      hasArrow={false}
      class={"widget-popover"}
      marginBottom={30}
      onShow={async () => {
        await updateDate();
      }}
    >
      <box orientation={Gtk.Orientation.VERTICAL} spacing={20}>
        <box>
          <label label={"Calendar"}></label>
        </box>
        {/* <box>
          <Gtk.Calendar></Gtk.Calendar>
        </box> */}

        <box spacing={20} orientation={Gtk.Orientation.VERTICAL}>
          {/* DATE CHANGER */}
          <box
            orientation={Gtk.Orientation.HORIZONTAL}
            marginStart={10}
            marginEnd={10}
          >
            {/* MONTH */}
            <box spacing={4} halign={Gtk.Align.START}>
              <button
                label={icons.arrowLeft}
                cursor={cursors.pointer}
                onClicked={() => {
                  setMonthDiff((d) => (d + 11) % 12);
                }}
              />
              <box>
                <With value={getDate}>
                  {(date) => {
                    if (date.length === 0) return <box></box>;
                    return (
                      <label
                        widthChars={monthNameMaxWidth}
                        label={getMonthDiff((d) => {
                          const monthIndex = (date[1] + d - 1) % 12;
                          return monthNames[monthIndex];
                        })}
                      />
                    );
                  }}
                </With>
              </box>
              <button
                label={icons.arrowRight}
                cursor={cursors.pointer}
                onClicked={() => {
                  setMonthDiff((d) => (d + 1) % 12);
                }}
              />
            </box>
            {/* YEAR */}
            <box spacing={4} halign={Gtk.Align.END} hexpand>
              <button
                label={icons.arrowLeft}
                cursor={cursors.pointer}
                onClicked={() => {
                  setYearDiff((d) => d - 1);
                }}
              />
              <box>
                <With value={getDate}>
                  {(date) => {
                    if (date.length === 0) return <box></box>;
                    return (
                      <label
                        label={getYearDiff((d) => `${date[2] + d}`)}
                        widthChars={6}
                      />
                    );
                  }}
                </With>
              </box>
              <button
                label={icons.arrowRight}
                cursor={cursors.pointer}
                onClicked={() => {
                  setYearDiff((d) => d + 1);
                }}
              />
            </box>
          </box>
          <box>
            <With value={dateData}>
              {([date, monthDiff, yearDiff, events]) => {
                if (date.length === 0) return <box></box>;
                return createCalendar(date, monthDiff, yearDiff, events);
              }}
            </With>
          </box>
        </box>
      </box>
    </popover>
  );

  async function updateDate() {
    try {
      console.log(`Updating date...`);
      const date = await execAsync(`date +"%d-%m-%Y"`);

      const parts = date.split("-");
      if (parts.length === 3) {
        setDate([Number(parts[0]), Number(parts[1]), Number(parts[2])]);
        console.log(`Date updated!`);
      }
    } catch (error) {
      console.log("Cannot update date, error: " + error);
    }
  }

  function createWeek() {
    return new Gtk.Box({
      orientation: Gtk.Orientation.HORIZONTAL,
      spacing: 4,
    });
  }

  function createDay(
    label: string,
    boxCssClasses: string[],
    inCurrentMonth: boolean
  ) {
    return (
      <button
        cssClasses={boxCssClasses}
        cursor={inCurrentMonth ? cursors.pointer : cursors.default}
        canTarget={inCurrentMonth}
        onClicked={async () => {
          if (inCurrentMonth === false) return;
          await createEvent(label);
        }}
      >
        <label label={label} widthChars={4}></label>
      </button>
    ) as Gtk.Button;
  }

  async function createEvent(day: string) {
    const year = getDate.get()[2] + getYearDiff.get();
    const month = ((getDate.get()[1] + getMonthDiff.get() + 11) % 12) + 1;

    const events = [...getEvents.get(), new CalendarEvent(day, month, year)];
    setEvents(events);

    const eventsJson = JSON.stringify(events);
    await writeFileAsync(configuration.calendar.savedEventsPath, eventsJson);
  }

  function createCalendar(
    date: number[],
    monthDiff: number,
    yearDiff: number,
    events: CalendarEvent[]
  ) {
    if (date.length === 0) return;

    const weeksCount = 6;
    const daysCount = 7;

    const dayOfMonth = date[0];
    const month = ((date[1] + monthDiff + 11) % 12) + 1;
    const year = date[2] + yearDiff;

    const previousMonthLength = getMonthLength((month + 11) % 12, year);
    const currentMonthLength = getMonthLength(month, year);

    const calendar = new Gtk.Box({
      spacing: 6,
      orientation: Gtk.Orientation.VERTICAL,
    });

    const dayNamesRow = createWeek();

    const dayNames = ["pn", "wt", "śr", "cz", "pt", "sb", "nd"];
    dayNames.forEach((dName) => {
      const day = createDay(
        dName,
        ["calendar-day", "calendar-day-name"],
        false
      );
      dayNamesRow.append(day);
    });

    calendar.append(dayNamesRow);

    const daysGrid = new Gtk.Grid({ columnSpacing: 4, rowSpacing: 4 });

    let dayCounter = 0;
    const startMonthDay = new Date(
      Date.UTC(year, (month - 1) % 12, 1)
    ).getUTCDay(); // 0..6 (0 = sunday)
    const start = ((startMonthDay - 1 + 6) % 7) + 1;

    // Previous month
    for (let i = 0; i < start; i++) {
      const day = createDay(
        `${previousMonthLength - start + i + 1}`,
        ["calendar-day", "calendar-day-previous-month"],
        false
      );
      daysGrid.attach(
        day,
        dayCounter % daysCount,
        dayCounter / daysCount,
        1,
        1
      );
      dayCounter++;
    }

    // Current month
    for (let i = 0; i < currentMonthLength; i++) {
      const date = CalendarEvent.createDate(i + 1, month, year);

      let dayCssClasses = [`calendar-day-current-month`];
      if (i + 1 === dayOfMonth && monthDiff % 12 === 0 && yearDiff === 0)
        dayCssClasses = [`calendar-day-current-month-day`];

      if (events.some((e) => e.date === date)) {
        dayCssClasses.push("calendar-day-event");
      }

      dayCssClasses.push("calendar-day");

      const day = createDay(`${i + 1}`, dayCssClasses, true);
      daysGrid.attach(
        day,
        dayCounter % daysCount,
        dayCounter / daysCount,
        1,
        1
      );
      dayCounter++;
    }

    // Next month
    const nextMonthDaysCount = weeksCount * daysCount - dayCounter;
    for (let i = 0; i < nextMonthDaysCount; i++) {
      const day = createDay(
        `${i + 1}`,
        ["calendar-day", "calendar-day-next-month"],
        false
      );
      daysGrid.attach(
        day,
        dayCounter % daysCount,
        dayCounter / daysCount,
        1,
        1
      );
      dayCounter++;
    }

    calendar.append(daysGrid);
    return calendar;
  }
}
