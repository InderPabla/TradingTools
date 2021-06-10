import { Logger } from "winston";
import { CommonServiceBase } from "../../../../libs/common/service/common-service-base";
import fs from 'fs';
import { ChartContinousData } from "practice-tool-types";
var csv=require("csvtojson");

export interface CandleSelection {
    tradingDay:string;
    ticker:string;
    candlestickDuration:string;
}

export class HistorialService extends CommonServiceBase {
    constructor(logger:Logger) {
        super(logger);
    }

    private selectionToTimeDuration(sel:CandleSelection):string {
        if(sel.candlestickDuration==="MIN_5") return 'DAY_4';
        if(sel.candlestickDuration==="MIN_1") return 'DAY_2';
        if(sel.candlestickDuration==="DAY_1") return 'WEEK_26';
        return 'DAY_1';
    }

    //5 mins, 9:25 am => 25,26,27,28,29

    async getCandlestickDataOnSelection(sel:CandleSelection):Promise<ChartContinousData[]|null> {
        let filename:string = `${sel.ticker}-${sel.tradingDay}-23-59-59-${this.selectionToTimeDuration(sel)}-${sel.candlestickDuration}.csv`;
        let candleData = await this.getCandlestickDataFromFilename(filename);
        if(candleData==null) return null;

        //Temporarily concidering SEC_5 as realtime data
        //The goal is to stich 1 second data into this 5 second data
        if(sel.candlestickDuration === 'SEC_5') {
            // let realtimeFiles:string[] = [`${sel.ticker}-${sel.tradingDay}-09-29-59-MIN_30-SEC_1.csv`,`${sel.ticker}-${sel.tradingDay}-09-59-59-MIN_30-SEC_1.csv`
            //                      ,`${sel.ticker}-${sel.tradingDay}-10-29-59-MIN_30-SEC_1.csv`,`${sel.ticker}-${sel.tradingDay}-10-59-59-MIN_30-SEC_1.csv`];
            let realtimeFiles:string[] = [`${sel.ticker}-${sel.tradingDay}-09-30-00-MIN_30-SEC_1.csv`
                                          ,`${sel.ticker}-${sel.tradingDay}-10-00-00-MIN_30-SEC_1.csv`
                                          ,`${sel.ticker}-${sel.tradingDay}-10-30-00-MIN_30-SEC_1.csv`
                                          ,`${sel.ticker}-${sel.tradingDay}-11-00-00-MIN_30-SEC_1.csv`
                                          ,`${sel.ticker}-${sel.tradingDay}-11-30-00-MIN_30-SEC_1.csv`];

            for(let file of realtimeFiles) {
                let rtData = await this.getCandlestickDataFromFilename(file);
                if(rtData) {
                    let firstRtDate = rtData[0].date;
                    let lastRtDate = rtData[rtData.length-1].date;
                    let firstCandleIndex = -1;
                    let lastCandleIndex = -1
   
                    for(let i = 0;i<candleData.length;i++) {
                        const curcandle = candleData[i];
                        if(firstCandleIndex==-1 && firstRtDate.getTime()<curcandle.date.getTime()) {
                            firstCandleIndex = i-1;
                        }

                        if(lastCandleIndex==-1 && curcandle.date.getTime()>=lastRtDate.getTime()) {
                            lastCandleIndex = i-1; 
                        }

                        if(firstCandleIndex!=-1 && lastCandleIndex!=-1) {
                            break;
                        }
                    }

                    //Stiching 1 second into the 5 second
                    if(firstCandleIndex!=-1 && lastCandleIndex!=-1) {
                        let firstPart = candleData.slice(0,firstCandleIndex+1);
                        let lastPart = candleData.slice(lastCandleIndex,candleData.length);
                        candleData = [...firstPart,...rtData,...lastPart];
                    }
                }
            }
        }

        return candleData;
    }

    async getCandlestickDataFromFilename(filename:string):Promise<ChartContinousData[]|null> {
        
        let filePath = `${__dirname}/../../public/data/${filename}`;
        try {
            const csvData:string = await fs.readFileSync(filePath,'utf-8');
            const dataJson:any[] = await csv({noheader: false,headers: ['date','open','high','low','close','average','volume','count']})
                                        .fromString(csvData);
            const isUnix = HistorialService.isUnixTime(dataJson[0].date);

            const chartData:ChartContinousData[] = dataJson.map((v:any,index:number)=>{
                let date:Date;
                if(isUnix) {
                    date = new Date(parseInt(v.date)*1000);
                }
                else {
                    const strDate:string = v.date;
                    const year = strDate.substr(0,4);
                    const month = strDate.substr(4,2);
                    const day = strDate.substr(6,2);
                    date = HistorialService.toDayOpenTime(new Date(`${year}-${month}-${day}`),true);
                }
                const tick = {
                    date: date,
                    open: parseFloat(v.open), high: parseFloat(v.high), low: parseFloat(v.low), close: parseFloat(v.close),
                    volume: parseInt(v.volume)*100, average: parseInt(v.average), count: parseInt(v.count),
                }
                return tick;
            });

            return chartData;
        }
        catch(err) {
            this.logger.info(`Unable to fetch file: ${filePath}`,err);
            return null;
        }
    }

    private static toDayOpenTime(date:Date,applyTzOffset:boolean) {
        let _date = new Date(date);
        //Converting from GMT to local EST time 
        //Example: "2020-11-18 00:00:00" => "2020-11-17 20:00:00 EST"
        //We want to add the local offset to keep exactly "2020-11-18 00:00:00" format 
        if(applyTzOffset)
            _date.setTime(date.getTime()+date.getTimezoneOffset()*60*1000);
        _date.setHours(4);
        _date.setMinutes(0);
        _date.setSeconds(0);
        _date.setMilliseconds(0);
        return _date;
    }

    /**
     * Unix generally starts with 16 (1620979200), maybe not for older data
     * Try to determine correctly if the timestamp is unix!
     * @param time 
     */
    private static isUnixTime(time:string) {
        return time.length>=10;
    }

}