import { configuration } from "../../app";

export class DateTools {
    public static formatDate(date: Date, format: string): string {
        const yyyy = String(date.getFullYear());
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const dd = String(date.getDate()).padStart(2, "0");

        format = format.toUpperCase();
        // sprawdzenie czy format zawiera 4xY, 2xM i 2xD
        const isValidFormat =
            /YYYY/.test(format) &&
            /MM/.test(format) &&
            /DD/.test(format);

        if (!isValidFormat) {
            format = "DD-MM-YYYY";
        }

        return format
            .replace("YYYY", yyyy)
            .replace("MM", mm)
            .replace("DD", dd);
    }

    public static toShortFormatDate(date: Date, format: string): string {
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const dd = String(date.getDate()).padStart(2, "0");
        format = format.toUpperCase();

        // sprawdzamy czy format zawiera YYYY, MM, DD
        const isValidFormat =
            /YYYY/.test(format) &&
            /MM/.test(format) &&
            /DD/.test(format) &&
            format.length === 10;

        if (!isValidFormat) {
            format = "DD-MM"; // fallback
        }

        const yearIndex = format.indexOf("YYYY")
        if (yearIndex === 0) { // YYYY is at the beggining
            format = format.slice(6);
        } else if (yearIndex === format.length - 4) { // YYYY is at the end
            format = format.slice(0, format.length - 5);
        } else { // YYYY is in the middle????
            format = format.replace("YYYY", "");
            format = format.slice(0, 3) + format.slice(4);
        }

        return format
            .replace("MM", mm)
            .replace("DD", dd);
    }

    public static getDayName(date: Date) {
        const names = configuration.getTexts().general.daysOfWeek;
        const dayIndex = (date.getDay() + 6) % 7;
        return names[dayIndex];
    }

    public static formatTime(time: string, format: string) {

        if (format === "24")
            return time;

        const timeParts = time.split(':');
        const hour = parseInt(timeParts[0]);

        if (hour >= 12) {
            const hourText = `${hour - 12}`.padStart(2, '0');
            return `${hourText}:${timeParts[1]} PM`;
        }
        else {
            const hourText = `${hour}`.padStart(2, '0');
            return `${hourText}:${timeParts[1]} AM`;
        }

    }
}