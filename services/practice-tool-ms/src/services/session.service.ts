import { Logger } from "winston";
import { CommonServiceBase } from "../../../../libs/common/service/common-service-base";
import fs from 'fs';
import { SessionInfo } from 'practice-tool-types';
import {v4 as uuidv4} from 'uuid';

export class SessionInfoData {
    private sessionInfo:SessionInfo;

    private updater:NodeJS.Timeout|null;

    constructor(sessionInfo:SessionInfo) {
        this.sessionInfo = sessionInfo;
        this.updater = null;
        this.sessionInfo.isRunning = false;
        this.updateClock = this.updateClock.bind(this);
    }

    public getSessionInfo() {
        return this.sessionInfo;
    }

    public isSessionRunning() {
        return this.updater!=null;
    }

    public startSession() {
        this.updater = setInterval(this.updateClock,1000);
        this.sessionInfo.isRunning = true;
    }

    public stopSession() {
        if(this.updater) clearInterval(this.updater);
        this.sessionInfo.isRunning = false;
    }

    public updateClock() {
        
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