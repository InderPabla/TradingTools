import { SessionInfo } from "practice-tool-types";

export class SessionInfoWrapper implements SessionInfo {

    sessionId: string;
    isRunning: boolean;
    tradingDay: string;
    clock:Date;
    pnl:number;

    constructor(sessionInfo?:SessionInfo) {
        if(sessionInfo) {
           this.sync(sessionInfo);
        }
    }

    /**
     * Multiplatform state changes
     * @param sessionInfo 
     */
    public setSessionInfo(sessionInfo:SessionInfo,isCrossPlatformChange:boolean) {
        if(isCrossPlatformChange) {
            this.sessionId = sessionInfo.sessionId;
            this.isRunning = sessionInfo.isRunning;
            this.tradingDay = sessionInfo.tradingDay;
            this.clock = new Date(sessionInfo.clock);
        }
        else {
            this.pnl = sessionInfo.pnl;
        }
    }

    public sync(sessionInfo:SessionInfo) {
        this.setSessionInfo(sessionInfo,true);
        this.setSessionInfo(sessionInfo,false);
    }


    public isServerSideSession():boolean {
        return !!this.sessionId;
    }

}