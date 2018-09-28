import {Events} from "./Events";

export class Listening extends Events{

    public interop = true;
    public count =0;
    public events = void 0;

    public get id () {
        return this.listener._listenId;
    }

    constructor (public listener, public obj) {
    };
}