import { TimerDigit } from "./TimerEnums";


export class TimerDigits {
    public hour1: number = 0;
    public hour2: number = 0;
    public minute1: number = 0;
    public minute2: number = 0;
    public second1: number = 0;
    public second2: number = 0;

    constructor(defaultTimeSeconds: number = 0) {
        const hours = Math.floor(defaultTimeSeconds / 3600);
        const minutes = Math.floor((defaultTimeSeconds % 3600) / 60);
        const seconds = Math.floor(defaultTimeSeconds % 60);

        this.hour1 = Math.floor(hours / 10);
        this.hour2 = Math.floor(hours % 10);

        this.minute1 = Math.floor(minutes / 10);
        this.minute2 = Math.floor(minutes % 10);

        this.second1 = Math.floor(seconds / 10);
        this.second2 = Math.floor(seconds % 10);
    }

    public updateTime(digit: TimerDigit, change: number): void {

        change = 0.125 * Math.sign(change);

        switch (digit) {
            case TimerDigit.Hour1:
                this.hour1 += change;
                break;

            case TimerDigit.Hour2:
                this.hour2 += change;
                break;

            case TimerDigit.Minute1:
                this.minute1 += change;
                break;

            case TimerDigit.Minute2:
                this.minute2 += change;
                break;

            case TimerDigit.Second1:
                this.second1 += change;
                break;

            case TimerDigit.Second2:
                this.second2 += change;
                break;

            default:
                break;
        }

        this.second2 = this.limitValue(this.second2, 10);
        this.second1 = this.limitValue(this.second1, 6);

        this.minute2 = this.limitValue(this.minute2, 10);
        this.minute1 = this.limitValue(this.minute1, 6);

        this.hour2 = this.limitValue(this.hour2, 10);
        this.hour1 = this.limitValue(this.hour1, 10);
    }

    private limitValue(value: number, max: number): number {
        if (value >= max) {
            return 0;
        }

        if (value < 0) {
            return max - 0.1;
        }
        return value;
    }


    public getDigit(digit: TimerDigit): string {
        switch (digit) {
            case TimerDigit.Hour1:
                return `${Math.floor(this.hour1)}`;

            case TimerDigit.Hour2:
                return `${Math.floor(this.hour2)}`;

            case TimerDigit.Minute1:
                return `${Math.floor(this.minute1)}`;

            case TimerDigit.Minute2:
                return `${Math.floor(this.minute2)}`;

            case TimerDigit.Second1:
                return `${Math.floor(this.second1)}`;

            case TimerDigit.Second2:
                return `${Math.floor(this.second2)}`;

            default:
                return `${Math.floor(0)}`;
        }
    }

    public getAllSeconds() {
        let allSeconds = Math.floor(this.second1) * 10 + Math.floor(this.second2);
        allSeconds += (Math.floor(this.minute1) * 10 + Math.floor(this.minute2)) * 60;
        allSeconds += (Math.floor(this.hour1) * 10 + Math.floor(this.hour2)) * 3600;
        return Math.floor(allSeconds);
    }
}