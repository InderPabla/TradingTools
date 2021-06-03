import { SessionInfo } from "practice-tool-types";
import { SessionAPI } from "../Api/SessionAPI";
import { CommonTradingClock } from "./CommonTradingClock";
import { SessionInfoWrapper } from "./SessionInfoWrapper";

export class SessionTradingClock extends CommonTradingClock
{

    private sessionInfo:SessionInfoWrapper;
    private lock:boolean = false;

    constructor(clock:Date,update:Function,sessionInfo:SessionInfoWrapper) {
        super(clock,update);
        this.sessionInfo = sessionInfo;
    }

    public getClockSpeedMultipler() { return 1; }
    public setClockSpeedMultiplier(clockSpeedMultiplier:number) {}
    public getSessionInfoWrapper() { return this.sessionInfo; }

    public async onClockUpdate() {
        if(this.lock) return;
        this.lock = true;

        try {
            let sessionInfo = await SessionAPI.getSession(this.sessionInfo.sessionId);
            this.sessionInfo.setSessionInfo(sessionInfo);
            console.log(sessionInfo);
        }
        catch(err) {
            console.log(err);
        }

        this.lock = false;
    }

    public shouldPauseClock(): boolean {
        return true;
    }
    public shouldUnpauseClock(): boolean {
        return true;
    }

    public getResetTime(): number { return 1000; }

}