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

    public getClockSpeedMultipler() { return super.getClockSpeedMultipler(); }

    public async setClockSpeedMultiplier(clockSpeedMultiplier:number) {
        try {
            let sessionInfo = await SessionAPI.patchChangeClockSpeedSession(this.sessionInfo.sessionId,clockSpeedMultiplier);
            this.setSessionInfo(sessionInfo,true);
            await super.setClockSpeedMultiplier(clockSpeedMultiplier);
        }
        catch(err) {
            console.log(err);
        }
    }

    public getSessionInfoWrapper() { return this.sessionInfo; }

    private setSessionInfo(sessionInfo:SessionInfo,isCrossPlatformChange:boolean):void {
        this.sessionInfo.setSessionInfo(sessionInfo,isCrossPlatformChange);
        if(isCrossPlatformChange) this.setClock(this.sessionInfo.clock);
        console.log(this.sessionInfo);
    }

    public async onClockUpdate() {
        if(this.lock) return;
        this.lock = true;

        try {
            let sessionInfo = await SessionAPI.getSession(this.sessionInfo.sessionId);
            this.setSessionInfo(sessionInfo,true);
        }
        catch(err) {
            console.log(err);
        }

        this.lock = false;
    }

    public async shouldPauseClock(): Promise<boolean> {
        try {
            let sessionInfo = await SessionAPI.putStopSession(this.sessionInfo.sessionId);
            this.setSessionInfo(sessionInfo,true);
        }
        catch(err) {
            console.log(err);
        }

        return true;
    }
    public async shouldUnpauseClock(): Promise<boolean> {
        try {
            let sessionInfo = await SessionAPI.putStartSession(this.sessionInfo.sessionId);
            this.setSessionInfo(sessionInfo,true);
        }
        catch(err) {
            console.log(err);
        }

        return true;
    }

    public getResetTime(): number { return 1000; }

}