import { Gdk } from "ags/gtk4";

class Cursors {

    public readonly default: Gdk.Cursor = new Gdk.Cursor({ name: "default" });
    public readonly pointer: Gdk.Cursor = new Gdk.Cursor({ name: "pointer" });
    public readonly processing: Gdk.Cursor = new Gdk.Cursor({ name: "wait" });


    //#endregion
}
export const cursors: Cursors = new Cursors();