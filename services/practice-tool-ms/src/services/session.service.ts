import { Logger } from "winston";
import { CommonServiceBase } from "../../../../libs/common/service/common-service-base";
import { SessionInfo } from 'practice-tool-types';
import {v4 as uuidv4} from 'uuid';

export class SessionInfoData {
    private sessionInfo:SessionInfo;
    private clockUpdateInterval:NodeJS.Timeout|null;
    private systemTimeAtUnpause:Date|null;
    private clockDuringUnpause:Date|null;
    private clockSpeed:number = 1;
    private static CLOCK_SPEED:number = 1;
    private static CLOCK_RESET_TIME:number = 1000;

    constructor(sessionInfo:SessionInfo) {
        this.sessionInfo = sessionInfo;
        this.clockUpdateInterval = null;
        this.sessionInfo.isRunning = false;
        this.clockDuringUnpause = null;
        this.systemTimeAtUnpause = null;
        this.clockSpeed = SessionInfoData.CLOCK_SPEED;
        this.updateClock = this.updateClock.bind(this);
    }

    public getSessionInfo() {
        return this.sessionInfo;
    }

    public isSessionRunning() {
        return this.clockUpdateInterval!=null;
    }

    public startSession() {
        if(this.isSessionRunning()) return;
        this.systemTimeAtUnpause = new Date();
        this.clockDuringUnpause = this.sessionInfo.clock;
        this.clockUpdateInterval = setInterval(this.updateClock,SessionInfoData.CLOCK_RESET_TIME);
        this.sessionInfo.isRunning = true;
    }

    public stopSession() {
        if(this.clockUpdateInterval) clearInterval(this.clockUpdateInterval);
        this.clockUpdateInterval = null;
        this.systemTimeAtUnpause = null;
        this.clockDuringUnpause = null;
        this.sessionInfo.isRunning = false;
    }

    public updateClock() {
        if(!this.systemTimeAtUnpause || !this.clockDuringUnpause) {
            
            throw new Error(`Session Id: ${this.sessionInfo.sessionId}. Unexpected senario where System Time At Unpause or Clock During Unpause are null.`);
        }
        const newDate = new Date();
        const msDiff = newDate.getTime() - this.systemTimeAtUnpause.getTime();
        this.sessionInfo.clock = new Date(this.clockDuringUnpause.getTime() + msDiff*this.clockSpeed);
    }

    public updateClockSpeed(clockSpeed:number) {
        this.clockSpeed = clockSpeed;
    }
}

export class SessionService extends CommonServiceBase {
    
    private static sessionMap:Map<string,SessionInfoData> = new Map();

    constructor(logger:Logger) {
        super(logger);
    }

    public static findSessionIdExists(sessionId:string):boolean {
        return SessionService.sessionMap.has(sessionId);
    }
    
    public static getSession(sessionId:string):SessionInfo|null {
        let data = SessionService.sessionMap.get(sessionId);
        if(data) return data.getSessionInfo();
        return null;
    }

    public static startSessionClock(sessionId:string) {
        let data = SessionService.sessionMap.get(sessionId);
        if(data) {
            if(!data.isSessionRunning()) {
                data.startSession();
            }
        }

        return SessionService.getSession(sessionId);
    }

    public static updateClockSpeed(sessionId:string,clockSpeed:number) {
        let data = SessionService.sessionMap.get(sessionId);
        if(data) {
            data.updateClockSpeed(clockSpeed);
        }
        return SessionService.getSession(sessionId);
    }

    public static stopSessionClock(sessionId:string) {
        let data = SessionService.sessionMap.get(sessionId);
        if(data) {
            if(data.isSessionRunning()) {
                data.stopSession();
            }
        }
        return SessionService.getSession(sessionId);
    }

    public static createSession(tradingDay:string,initialClock:Date) {
        let info:SessionInfo = {
            sessionId:uuidv4().substr(0,8),
            tradingDay:tradingDay,
            isRunning:false,
            clock:new Date(initialClock),
        }
        SessionService.addSession(info.sessionId,info);
        return SessionService.getSession(info.sessionId);
    }

    private static addSession (sessionId:string,info:SessionInfo) {
        SessionService.sessionMap.set(sessionId,new SessionInfoData(info));
    }
}