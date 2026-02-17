export class CalendarEvent {

    public date: string = ""; // DD-MM-RRRR

    constructor(day: string | number, month: string | number, year: string | number) {
        this.date = `${day}-${month}-${year}`;

        console.log(`Created event on ${this.date}`);
    }

    public static createDate(day: string | number, month: string | number, year: string | number) {
        return `${day}-${month}-${year}`;
    }

}