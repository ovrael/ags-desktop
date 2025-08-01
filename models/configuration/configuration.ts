import { monitorFile, readFileAsync } from "ags/file";
import { TimerConfiguration } from "./timerConfiguration";
import { GeneralConfiguration } from "./generalConfiguration";
import { LocaliztionTexts } from "../../data/localization/localizationTexts";
import Gio from "gi://Gio";
import { Communication } from "../../utils/Communication";
import { createState, State } from "ags";
import { configuration, updateConfiguration } from "../../app";

const CONFIG_PATH = "config/config.json"

export class Configuration {

    private static instance: Configuration | undefined = undefined;

    public general: GeneralConfiguration = new GeneralConfiguration();
    public timer: TimerConfiguration = new TimerConfiguration();

    public texts: State<LocaliztionTexts> = createState(new LocaliztionTexts(""));
    public getTexts() { return this.texts[0].get(); };

    private fileMonitor: Gio.FileMonitor | undefined = undefined;

    private constructor() {

    }

    public static async Create(): Promise<Configuration> {
        if (Configuration.instance !== undefined)
            return Configuration.instance;

        const configJson = await readFileAsync(`${CONFIG_PATH}`);
        const fileConfig = JSON.parse(configJson) as Configuration;

        const config = new Configuration();
        config.general.languageCode = fileConfig.general.languageCode;

        config.texts[1](new LocaliztionTexts(config.general.languageCode));

        config.timer.defaultTimerTimeSeconds = fileConfig.timer.defaultTimerTimeSeconds;
        config.timer.maxRunningTimers = fileConfig.timer.maxRunningTimers;
        config.timer.alarmSoundFilePath = fileConfig.timer.alarmSoundFilePath;
        config.timer.alarmSoundLengthInSeconds = fileConfig.timer.alarmSoundLengthInSeconds;

        config.addFileMonitorHandler();

        Configuration.instance = config;

        return config;
    }

    private addFileMonitorHandler() {

        if (this.fileMonitor !== undefined)
            return;


        this.fileMonitor = monitorFile(`${CONFIG_PATH}`, async (file: string, event: Gio.FileMonitorEvent) => {
            switch (event) {

                // Can read file, update configuration
                case Gio.FileMonitorEvent.CHANGES_DONE_HINT:
                case Gio.FileMonitorEvent.CREATED:
                case Gio.FileMonitorEvent.MOVED_IN:
                    await this.update();
                    break;

                // Do nothing
                case Gio.FileMonitorEvent.CHANGED:
                case Gio.FileMonitorEvent.ATTRIBUTE_CHANGED:
                case Gio.FileMonitorEvent.DELETED:
                case Gio.FileMonitorEvent.MOVED:
                case Gio.FileMonitorEvent.MOVED_OUT:
                case Gio.FileMonitorEvent.PRE_UNMOUNT:
                case Gio.FileMonitorEvent.RENAMED:
                case Gio.FileMonitorEvent.UNMOUNTED:
                    break;


                default:
                    Communication.printWarning("Config file changed but event is not handled.");
                    break;
            }
        })
    }

    private async update() {
        const configJson = await readFileAsync(`${CONFIG_PATH}`);
        const fileConfig = JSON.parse(configJson) as Configuration;
        this.texts[1](new LocaliztionTexts(fileConfig.general.languageCode));

    }

    public static async GetInstance() {
        if (Configuration.instance !== undefined)
            return Configuration.instance;
        return Configuration.Create();
    }
}
