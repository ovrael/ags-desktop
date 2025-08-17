export class TimersData {
  public runningTimers: number = 0;
  public doneTimers: number = 0;

  public getUndoneCount() {
    return this.runningTimers - this.doneTimers;
  }

  public updateRunningTimers(change: number): TimersData {
    if (Math.abs(change) !== 1) return this;

    const newData = new TimersData();
    newData.runningTimers = this.runningTimers + change;
    newData.doneTimers = this.doneTimers;
    return newData;
  }

  public updateDoneTimers(change: number): TimersData {
    if (Math.abs(change) !== 1) return this;

    const newData = new TimersData();
    newData.runningTimers = this.runningTimers;
    newData.doneTimers = this.doneTimers + change;
    return newData;
  }
}
