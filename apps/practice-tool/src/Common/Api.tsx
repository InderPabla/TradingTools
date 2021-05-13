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

        let chartData:ChartContinousData[] = dataJson.map((v:any,index:number)=>{
            let tick = {
              date: new Date(parseInt(v.date)*1000),
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