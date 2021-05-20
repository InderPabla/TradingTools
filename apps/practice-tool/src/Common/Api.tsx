import { ChartContinousData } from "../Components/Chart/Commom/ChartUtils";
var csv=require("csvtojson");

type IAjaxErrorType = 'UNEXPECTED_ERROR'|'NOT_FOUND'|'BAD_REQUEST';

export interface IAjaxError {
    status?:number;
    type?:IAjaxErrorType;
    message:string;
}

export interface IAjaxDataError<T> {
    data:T;
    err:IAjaxError;
}

type PromiseVoid = ()=>Promise<void>;
type OnError = (err:IAjaxError)=>Promise<void>;

export class CommonAPI {

    private static unexpectedIAjaxError(message?:string):IAjaxError {
        return {status:null,type:'UNEXPECTED_ERROR',message:message || 'Unexpected error fetching resource'};
    }

    private static notFoundIAjaxError(message?:string):IAjaxError {
        return {status:404,type:'NOT_FOUND',message:message || 'Resource not found'};
    }

    private static badRequestAjaxError(message?:string):IAjaxError {
        return {status:400,type:'BAD_REQUEST',message:message || 'Invalid Resource request'};
    }

    public static async ajaxHandler(func:PromiseVoid,onError:OnError) {
        try {
            await func();
        }
        catch(err) {
            if(err) {
                if(err.status===400) {
                    await onError(CommonAPI.badRequestAjaxError(err.message));
                }
                else if(err.status===404) {
                    await onError(CommonAPI.notFoundIAjaxError(err.message));
                }
                else {
                    await onError(CommonAPI.unexpectedIAjaxError(err.message));
                } 
            }
            else {
                await onError(CommonAPI.unexpectedIAjaxError());
            }
        }
    }

    public static async getContinousDataFromPublicCsvFile(path:string,file:string):Promise<ChartContinousData[]> {
        let _path = path.endsWith('/') || path.endsWith('\\')?path.substr(0,path.length-1):path;
        _path = _path.startsWith('/') || _path.endsWith('\\')?_path.substr(1,_path.length):_path;

        let fetched = await fetch(`/${_path}/${file}`,{
            headers : { 
              'Content-Type': 'application/json',
              'Accept': 'application/csv'
            }
        });

        if(fetched.status>=400) {
            throw fetched;
        }

        let dataCsv = await fetched.text();

        let dataJson:any[] = await csv({
          noheader: false,
          headers: ['date','open','high','low','close','average','volume','count']
        }).fromString(dataCsv);

        if(dataJson.length===0) return [];

        //Unix generally starts with 16 (1620979200), maybe not for older data
        //TODO: Try to determine correctly if the timestamp is unix!
        const firstDate = dataJson[0].date;
        const isUnixTime = (firstDate as string).startsWith('16') && firstDate.length>=10;

        let chartData:ChartContinousData[] = dataJson.map((v:any,index:number)=>{
            let date:Date = null;
            if(isUnixTime) {
                date = new Date(parseInt(v.date)*1000);
            }
            else {
                let strDate:string = v.date;
                let year = strDate.substr(0,4);
                let month = strDate.substr(4,2);
                let day = strDate.substr(6,2);
                date = new Date(`${year}-${month}-${day}`);
                //Converting from GMT to local EST time 
                //Example: "2020-11-18 00:00:00" => "2020-11-17 20:00:00 EST"
                //We want to add the local offset to keep exactly "2020-11-18 00:00:00" format 
                date.setTime(date.getTime()+date.getTimezoneOffset()*60*1000);   
                date.setHours(4);
                date.setMinutes(0);
                date.setSeconds(0);
                date.setMilliseconds(0);
            }
         
            let tick = {
              date: date,
              open: parseFloat(v.open),
              high: parseFloat(v.high),
              low: parseFloat(v.low),
              close: parseFloat(v.close),
              volume: parseInt(v.volume)*100,
              average: parseInt(v.average),
              count: parseInt(v.count),
            }
            return tick;
        });

        return chartData;
    }


}