import { SessionInfo } from "practice-tool-types";

export class SessionInfoWrapper implements SessionInfo {

    sessionId: string;
    isRunning: boolean;
    tradingDay: string;
    clock:Date;

    constructor(sessionInfo?:SessionInfo) {
        if(sessionInfo) {
           this.setSessionInfo(sessionInfo);
        }
    }

    public setSessionInfo(sessionInfo:SessionInfo) {
        this.sessionId = sessionInfo.sessionId;
        this.isRunning = sessionInfo.isRunning;
        this.tradingDay = sessionInfo.tradingDay;
        this.clock = new Date(sessionInfo.clock);
    }

    public isServerSideSession():boolean {
        return !!this.sessionId;
    }
    
    
}