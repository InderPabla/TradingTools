import { CommonAPI } from "../CommonAPI";

const PATH_API = `${process.env.REACT_APP_PRACTICE_TOOL_MS}/hue-color`;

export class HueAPI extends CommonAPI {

    /**
     * TODO DO PROPER ERROR HANDLING
     * @param color
     * @returns 
     */
    public static async postChangeHueRgbColor(color:{r:number,g:number,b:number},lights:string[]):Promise<void> {
        let fetched = await fetch(`${PATH_API}/changeRgbColor`,
        {  
            method:'post', 
            headers : { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({color,lights})
        });
        if(fetched.status>=400) throw fetched;
        let body = await fetched.json();
        return body.result;
    }

}