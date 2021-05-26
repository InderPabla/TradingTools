import { CommonAPI } from "../CommonAPI";
import { SessionInfo } from 'practice-tool-types';

const PATH_API = `${process.env.REACT_APP_PRACTICE_TOOL_MS}/session`;

export class SessionAPI extends CommonAPI {

    public static async getSessionId(sessionId:string):Promise<SessionInfo> {
        let fetched = await fetch(`${PATH_API}/${sessionId}`,
         { headers : { 'Content-Type': 'application/json', 'Accept': 'application/json' } });
        if(fetched.status>=400) throw fetched;
        let body = await fetched.json();
        return body.result;
    }
}