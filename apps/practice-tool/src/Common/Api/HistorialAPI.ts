import { CommonAPI } from "../CommonAPI";
import { isUnixTime, toDayOpenTime } from "../Utils";
import { ChartContinousData, ChartSelection } from "../../Components/Chart/Commom/ChartUtils";
var csv=require("csvtojson");

const PATH_API = `${process.env.REACT_APP_PRACTICE_TOOL_MS}/historical`;

export class HistorialAPI extends CommonAPI {

    /**
     * TODO DO PROPER ERROR HANDLING
     */
    public static async getContinousData(sel:ChartSelection) {
        let tradingDayTime = sel.tradingDayTime.toISOString().split('T')[0];
        let fetched = await fetch(`${PATH_API}/candles/${sel.ticker}/${sel.candlestickDuration}/${tradingDayTime}/csv`,
         { headers : { 'Content-Type': 'application/json', 'Accept': 'application/json' } });
        if(fetched.status>=400) throw fetched;
        let body = await fetched.json();
        return await HistorialAPI.parseCsvToChartContinous(body.result);
    }

    /**
     * TODO DO PROPER ERROR HANDLING
     */
    public static async getContinousDataFromPublicCsvFile(path:string,file:string):Promise<ChartContinousData[]> {
        let _path = path.endsWith('/') || path.endsWith('\\')?path.substr(0,path.length-1):path;
        _path = _path.startsWith('/') || _path.endsWith('\\')?_path.substr(1,_path.length):_path;
        let fetched = await fetch(`/${_path}/${file}`,
         { headers : { 'Content-Type': 'application/json', 'Accept': 'application/csv' } });
        if(fetched.status>=400) throw fetched;
        let dataCsv = await fetched.text();
        return await HistorialAPI.parseCsvToChartContinous(dataCsv);
    }

    public static async parseCsvToChartContinous(dataCsv:string) {
        let dataJson:any[] = await csv({noheader: false,headers: ['date','open','high','low','close','average','volume','count']}).fromString(dataCsv);
        if(dataJson.length===0) return [];
        const isUnix = isUnixTime(dataJson[0].date);
        let chartData:ChartContinousData[] = dataJson.map((v:any,index:number)=>{
            let date:Date = null;
            if(isUnix) {
                date = new Date(parseInt(v.date)*1000);
            }
            else {
                let strDate:string = v.date;
                let year = strDate.substr(0,4);
                let month = strDate.substr(4,2);
                let day = strDate.substr(6,2);
                date = toDayOpenTime(new Date(`${year}-${month}-${day}`),true);
            }
        
            let tick = {
                date: date,
                open: parseFloat(v.open), high: parseFloat(v.high), low: parseFloat(v.low), close: parseFloat(v.close),
                volume: parseInt(v.volume)*100, average: parseInt(v.average), count: parseInt(v.count),
            }
            return tick;
        });

        return chartData;
    }
}