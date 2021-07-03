import { Logger } from "winston";
import { CommonServiceBase } from "../../../../libs/common/service/common-service-base";
import * as HUE_ENV from '../../../../dev-tools/hue_test/.env.json';
import * as Color from 'color';
import axios, {AxiosInstance} from 'axios';

export type ColorMapFunction = (value:number,minValue:number,maxValue:number,fromColor:Color,toColor:Color)=>Color;

function interpolateColor(fromColor:Color,toColor:Color) {
    return (z:number)=> {
        try {
            let _z = z<0?0:z>1?1:z;
            let fromColorArr = fromColor.array();
            let toColorArr = toColor.array();
            let rDiff = (toColorArr[0]-fromColorArr[0])*_z;
            let bDiff = (toColorArr[1]-fromColorArr[1])*_z;
            let gDiff = (toColorArr[2]-fromColorArr[2])*_z;

            return Color.rgb(rDiff+fromColorArr[0],bDiff+fromColorArr[1],gDiff+fromColorArr[1]);
        }
        catch(err) {
           return null;
        }
    }
}


let _LerpFunction:ColorMapFunction = (value:number,minValue:number,maxValue:number,fromColor:Color,toColor:Color):Color =>{
    const i = interpolateColor(fromColor,toColor);
    let z = (value-minValue)/(maxValue-minValue);
    let col =  i(z);

    if(!col) 
        throw new Error(`ErrorLerp: Color not found for value=${value}.`);

    return col;
}


export class HueColorService extends CommonServiceBase {
    public static Green:Color = Color.rgb(0,255,0);
    public static Red:Color = Color.rgb(255,0,0);

    public static LerpColor:ColorMapFunction = _LerpFunction;

    private username_secret_key:string|null = null;
    private hue_env_url:string|null = null;

    private lightsId:string[] = ["9","10"];
    
    constructor(logger:Logger) {
        super(logger);
        let hueEnv:any = HUE_ENV;
        this.username_secret_key = hueEnv.username_secret_key; 
        this.hue_env_url = hueEnv.hue_env_url;
        if(this.hue_env_url && !this.hue_env_url.endsWith('/')) {
            this.hue_env_url+='/';
        }
    }

    public async changeAllLights(color:Color) {
        for(let i = 0; i < this.lightsId.length;i++)
            await this.changeLightColor(color,i);
    }

    /**
     * Change Color: 
     * - Make Axios API call to: PUT <hue_env_url>/api/<username_secret_key>/lights/<light_id>/state
     * - body: {"on":true, "sat":254, "bri":100,"hue":40000}
     * @param color 
     * @param lightId
     */
    public async changeLightColor(color:Color,lightIndex:number) {
        const hsv = color.hsv().unitArray();
        const url = `${this.hue_env_url}api/${this.username_secret_key}/lights/${this.lightsId[lightIndex]}/state`;
        const payload = {
            "on":true, 
            "sat":parseInt((255-hsv[1]*255)+""), 
            "bri":parseInt((255-hsv[2]*255)+""), 
            "hue":parseInt((hsv[0]*65535)+""), 
         
            // "sat":254, 
            // "bri":254,
            // "hue":0,
        }
        console.log("===============================")
        console.log("===============================")
        console.log("===============================")
        console.log("===============================",lightIndex,JSON.stringify(payload))

        try {
            let resp = await axios.put(url,payload);

            console.log("=====",resp.data)
            this.logger.info(`Light Index: ${lightIndex} Color Changed. Resp=${JSON.stringify(resp.data)}`);
        }
        catch(err) {
            console.log(err)
            this.logger.error(`ErrorLightChange: color=${color.rgb()}, stack=${err}`);
        }

    }

}