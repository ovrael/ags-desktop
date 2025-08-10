export class Communication {

    public static printInfo(message: string, file: string | undefined = undefined) {
        Communication.printMessage("ℹ️", message, file);
    }
    public static printSuccess(message: string, file: string | undefined = undefined) {
        Communication.printMessage("✅", message, file);
    }

    public static printWarning(message: string, file: string | undefined = undefined) {
        Communication.printMessage("⚠️", message, file);
    }

    public static printError(message: string, file: string | undefined = undefined) {
        Communication.printMessage("💥", message, file);
    }

    private static printMessage(icon: string, message: string, file: string | undefined = undefined) {
        const fileText = file === undefined ? "" : `[${file}]`;
        console.log(`[${icon}]${fileText} ${message}`);
    }

}