import { logBase } from "../Utils";
import { CommonTradingClock } from "./CommonTradingClock";

const MAX_RESET_MS = 1000;
const MIN_RESET_MS = 100;

export class TradingClock extends CommonTradingClock{

    constructor(clock:Date,update:Function) {
        super(clock,update)
    }
    
    public async shouldPauseClock(): Promise<boolean> {
        return true;
    }

    public async shouldUnpauseClock(): Promise<boolean> {
        return true;
    }

    public getResetTime() {
        return Math.max(MAX_RESET_MS/(logBase(this.getClockSpeedMultipler(),2.15)+1),MIN_RESET_MS);
    }

    public async onClockUpdate() {
        const newDate = new Date();
        const msDiff = newDate.getTime() - this.getSystemTimeAtUnpause().getTime();
        this.setClock(new Date(this.getClockDuringUnpause().getTime() + msDiff*this.getClockSpeedMultipler()));
    }
}