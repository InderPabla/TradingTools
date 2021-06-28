import { CommonAPI } from "../CommonAPI";
import { SessionInfo } from 'practice-tool-types';

const PATH_API = `${process.env.REACT_APP_PRACTICE_TOOL_MS}/session`;

export class SessionAPI extends CommonAPI {

    /**
     * TODO DO PROPER ERROR HANDLING
     * @param sessionId 
     * @returns 
     */
    public static async getSession(sessionId:string):Promise<SessionInfo> {
        let fetched = await fetch(`${PATH_API}/${sessionId}`,
         { headers : { 'Content-Type': 'application/json', 'Accept': 'application/json' } });
        if(fetched.status>=400) throw fetched;
        let body = await fetched.json();
        let session:SessionInfo = body.result;
        session.clock = new Date(session.clock);
        return body.result;
    }

    /**
     * TODO DO PROPER ERROR HANDLING
     * @param tradingDay
     * @param initialClock
     * @returns 
     */
    public static async postCreateSession(tradingDay:string, initialClock:Date):Promise<SessionInfo> {
        let fetched = await fetch(`${PATH_API}`,
        {  
            method:'post', 
            headers : { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ tradingDay, initialClock })
        });
        if(fetched.status>=400) throw fetched;
        let body = await fetched.json();
        return body.result;
    }

    /**
     * TODO DO PROPER ERROR HANDLING
     * @param sessionId 
     * @returns 
     */
     public static async putStopSession(sessionId:string):Promise<SessionInfo> {
        let fetched = await fetch(`${PATH_API}/${sessionId}/stop`,
        {  
            method:'put', 
            headers : { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: null,
        });
        if(fetched.status>=400) throw fetched;
        let body = await fetched.json();
        return body.result;
    }

    /**
     * TODO DO PROPER ERROR HANDLING
     * @param sessionId
     * @param clockSpeed
     * @returns 
     */
     public static async patchChangeClockSpeedSession(sessionId:string, clockSpeed:number):Promise<SessionInfo> {
        let fetched = await fetch(`${PATH_API}/${sessionId}/clockSpeed`,
        {  
            method:'put', 
            headers : { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ clockSpeed })
        });
        if(fetched.status>=400) throw fetched;
        let body = await fetched.json();
        return body.result;
    }

    /**
     * TODO DO PROPER ERROR HANDLING
     * @param sessionId 
     * @returns 
     */
     public static async putStartSession(sessionId:string):Promise<SessionInfo> {
        let fetched = await fetch(`${PATH_API}/${sessionId}/start`,
        {  
            method:'put', 
            headers : { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: null,
        });
        if(fetched.status>=400) throw fetched;
        let body = await fetched.json();
        return body.result;
    }
}