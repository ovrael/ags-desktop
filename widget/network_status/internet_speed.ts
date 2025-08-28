export class InternetSpeed {
    private bytes: number = 0;
    private bytesHistory: number[] = [];
    private static readonly MaxHistory: number = 8;

    private dataPerSecond: number = 0;
    private unit: string = "B/s"

    public getSpeed(): string {
        const data = Math.round((this.dataPerSecond + Number.EPSILON) * 100) / 100;
        return `${data} ${this.unit}`;
    }

    public update(newBytes: number): InternetSpeed {
        if (this.bytes > 0) {
            this.bytesHistory.push(newBytes - this.bytes);
            if (this.bytesHistory.length > InternetSpeed.MaxHistory)
                this.bytesHistory.shift();

            let sum = 0;
            this.bytesHistory.forEach(bytesData => {
                sum += bytesData;
            });

            const avg = sum / this.bytesHistory.length;
            this.computeSpeedAndUnit(avg);
        }

        const updated = new InternetSpeed();
        updated.bytes = newBytes;
        updated.bytesHistory = this.bytesHistory;
        updated.dataPerSecond = this.dataPerSecond;
        updated.unit = this.unit;
        return updated;
    }

    private computeSpeedAndUnit(data: number, unitIndex: number = 0) {

        if (unitIndex < 0) unitIndex = 0;

        const speedUnits: string[] = ["B/s", "kB/s", "MB/s", "GB/s"]
        if (data < 1000 || unitIndex === speedUnits.length - 1) {
            this.unit = speedUnits[unitIndex];
            this.dataPerSecond = data;
            return;
        }

        data /= 1000;
        unitIndex++;

        this.computeSpeedAndUnit(data, unitIndex);
    }
}