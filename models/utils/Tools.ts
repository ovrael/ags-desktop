export class Tools {

    public static formatString(text: string, ...args: any[]) {
        if (args.length === 0)
            return text;

        for (let i = 0; i < args.length; i++) {
            text = text.replace(`{${i}}`, args[i]);
        }

        return text;
    }
}