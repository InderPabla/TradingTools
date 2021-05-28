import { CommonAPI } from "../CommonAPI";
import { SessionInfo } from 'practice-tool-types';

const PATH_API = `${process.env.REACT_APP_PRACTICE_TOOL_MS}/session`;

export class SessionAPI extends CommonAPI {

    /**
     * TODO DO PROPER ERROR HANDLING
     * @param tradingDay 
     * @returns 
     */
    public static async getSession(sessionId:string):Promise<SessionInfo> {
        let fetched = await fetch(`${PATH_API}/${sessionId}`,
         { headers : { 'Content-Type': 'application/json', 'Accept': 'application/json' } });
        if(fetched.status>=400) throw fetched;
        let body = await fetched.json();
        return body.result;
    }

    /**
     * TODO DO PROPER ERROR HANDLING
     * @param tradingDay 
     * @returns 
     */
    public static async postCreateSession(tradingDay:string):Promise<SessionInfo> {
        let fetched = await fetch(`${PATH_API}`,
        {  
            method:'post', 
            headers : { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ tradingDay })
        });
        if(fetched.status>=400) throw fetched;
        let body = await fetched.json();
        return body.result;
    }
}