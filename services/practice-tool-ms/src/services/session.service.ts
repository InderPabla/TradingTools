import { Logger } from "winston";
import { CommonServiceBase } from "../../../../libs/common/service/common-service-base";
import fs from 'fs';
import { SessionInfo } from 'practice-tool-types';
import {v4 as uuidv4} from 'uuid';

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

    public static createSession(tradingDay:string) {
        let info:SessionInfo = {
            sessionId:uuidv4().substr(0,8),
            tradingDay:tradingDay,
            isRunning:false,
        }
        SessionService.addSession(info.sessionId,info);
        return SessionService.getSession(info.sessionId);
    }

    private static addSession (sessionId:string,info:SessionInfo) {
        SessionService.sessionMap.set(sessionId,info);
    }

}