import { Logger } from "winston";
import { CommonServiceBase } from "../../../../libs/common/service/common-service-base";
import fs from 'fs';
import { SessionInfo } from 'practice-tool-types';


export class SessionService extends CommonServiceBase {

    private static sessionMap:Map<string,SessionInfo> = new Map();

    constructor(logger:Logger) {
        super(logger);
    }

    public static findSessionIdExists(sessionId:string) {
        return SessionService.sessionMap.has(sessionId);
    }
    
    public static getSession(sessionId:string) {
        return SessionService.sessionMap.get(sessionId);
    }

    public static createSession(sessionId:string, tradingDay:string) {
        let info:SessionInfo = {
            sessionId:sessionId,
            tradingDay:tradingDay,
            isRunning:false,
        }
        SessionService.addSession(sessionId,info);
        return SessionService.getSession(sessionId);
    }

    private static addSession (sessionId:string,info:SessionInfo) {
        SessionService.sessionMap.set(sessionId,info);
    }

}