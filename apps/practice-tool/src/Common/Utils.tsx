import { CANDLESTICK_DURATION } from "./Constant";
import { utcDay, utcMinute, utcHour, utcSecond  } from "d3-time";

/**
 * Return the largest data in accessor
 * @param data 
 * @param accessor 
 * @returns 
 */
export function largestInAccessor(data:Object[],accessor:Function) {
    let max:any = undefined;
    if(data.length>0){
        max = accessor(data[0])
    }
    for(let i = 1; i <data.length;i++) {
        let v = accessor(data[i]);
        if(v>max) max = v;
    }
    return max;
}

/**
 * Return the smallest data in accessor
 * @param data 
 * @param accessor 
 * @returns 
 */
 export function smallestInAccessor(data:Object[],accessor:Function) {
    let min:any = undefined;
    if(data.length>0){
        min = accessor(data[0])
    }
    for(let i = 1; i <data.length;i++) {
        let v = accessor(data[i]);
        if(min>v) min = v;
    }
    return min;
}

/**
 * Return d3 time function for a given duration
 * @param duration duration of candlestick
 * @returns 
 */
export function candlestickTimeToD3Time(duration:string):Function {
    switch(duration) {
        case CANDLESTICK_DURATION.SEC_5: return utcSecond.every(5);
        case CANDLESTICK_DURATION.MIN_1: return utcMinute.every(1);
        case CANDLESTICK_DURATION.MIN_5: return utcMinute.every(5);
        case CANDLESTICK_DURATION.MIN_15: return utcMinute.every(15);
        case CANDLESTICK_DURATION.HOUR_1: return utcHour.every(1);
        case CANDLESTICK_DURATION.HOUR_4: return utcHour.every(4);
        case CANDLESTICK_DURATION.DAY_1: return utcDay.every(1);
        default:
            throw new Error(`InvalidValue: ${duration} is not a valid duration.`);
    }
}

/**
 * Return number of seconds for a given duration
 * @param duration duration of candlestick
 * @returns number of seconds in the duration
 */
 export function candlestickTimeToSeconds(duration:string):number {
    switch(duration) {
        case CANDLESTICK_DURATION.SEC_5: return 5;
        case CANDLESTICK_DURATION.MIN_1: return 60;
        case CANDLESTICK_DURATION.MIN_5: return 60*5;
        case CANDLESTICK_DURATION.MIN_15: return 60*15;
        case CANDLESTICK_DURATION.HOUR_1: return 60*60*1;
        case CANDLESTICK_DURATION.HOUR_4: return 60*60*4;
        case CANDLESTICK_DURATION.DAY_1: return 60*60*24;
        default:
            throw new Error(`InvalidValue: ${duration} is not a valid duration.`);
    }
}


/**
 * Date specific information for file name and market open date
 * @param date yyyy/mm/dd format
 * @param ticker name of the ticker
 * @param realtimeDuration real time duration
 * @param animateDuration animate duration
 * @returns date specific info
 */
export function dateSpecifics(date:string, ticker:string, realtimeDuration:string, animateDuration:string) {
    
    function formatToFileName(_date:Date,_ticker:string,duration:string):string {
        let yyyy = _date.getFullYear() + '';
        let mm = _date.getMonth() + 1 + '';
        let dd = _date.getDate() + '';
        dd = dd.length<2?'0'+dd:dd;
        mm = mm.length<2?'0'+mm:mm;
        return `${ticker}-${yyyy}-${mm}-${dd}-23-59-59-DAY_1-${duration}.csv`;
    }

    let dayStart = new Date(date);

    let dayEnd = new Date(dayStart);
    dayEnd.setHours(23,59,59);

    let dayMarketOpen = new Date(dayStart);
    dayMarketOpen.setHours(9,30);

    let realtimeDurationSec = candlestickTimeToSeconds(realtimeDuration);
    let animateDurationSec = candlestickTimeToSeconds(animateDuration);
    let realtimePerAnimateCount = animateDurationSec/realtimeDurationSec;

    let realtimeFilename = formatToFileName(dayStart,ticker,realtimeDuration);
    let animateFilename = formatToFileName(dayStart,ticker,animateDuration);

    return {dayStart,dayEnd,dayMarketOpen,realtimePerAnimateCount,realtimeFilename,animateFilename}
}

/**
 * Generate random unique key
 * @returns Unique key string
 */
export function genUniqueKey():string {
    return '_' + Math.random().toString(36).substr(2, 9);
}