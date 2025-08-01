import { execAsync, Process, subprocess } from "ags/process";
import { Communication } from "./Communication";

export class SoundPlayer {
    private static playerCommand: string | null = null;

    public static async init() {
        const candidates = ["mpv", "ffplay", "paplay", "pw-play", "aplay"];
        for (const cmd of candidates) {
            try {
                const result = await execAsync(["which", cmd]);
                if (result.trim()) {
                    SoundPlayer.playerCommand = cmd;
                    break;
                }
            } catch {
            }
        }

        if (!SoundPlayer.playerCommand) {
            Communication.printError(`Cannot find any sound player package, please install one of those: mpv, ffplay, paplay`, 'SoundPlayer');
        } else {
            Communication.printSuccess(`Package '${SoundPlayer.playerCommand}' was chosen to manage sounds`, 'SoundPlayer');
        }
    }

    public static playSound(filePath: string): Process | undefined {
        if (!SoundPlayer.playerCommand) {
            Communication.printError(`Cannot play. Player is not found, please ensure one of those packages is installed: mpv, ffplay, paplay`, 'SoundPlayer');
            return undefined;
        }

        const cmd = SoundPlayer.playerCommand;
        let args: string[] = [];

        switch (cmd) {
            case "paplay":
            case "pw-play":
            case "aplay":
                args = [cmd, filePath];
                break;
            case "mpv":
                args = [cmd, "--no-terminal", "--volume=100", "--loop-file=inf", filePath];
                break;
            case "ffplay":
                args = [cmd, "-nodisp", "-autoexit", "-loglevel", "quiet", "-loop", "9999", filePath];
                break;
            default:
                Communication.printError(`Cannot play. Player is not found, please ensure one of those packages is installed: mpv, ffplay, paplay`, 'SoundPlayer');
                return;
        }

        return subprocess(
            args,
            (out) => console.log(out),
            (err) => console.error(err), // optional
        )
    }
}
