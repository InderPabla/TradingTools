import { CANDLESTICK_DURATION } from "./Constant";
import { utcDay, utcMinute, utcHour, utcSecond  } from "d3-time";

/**
 * Unix generally starts with 16 (1620979200), maybe not for older data
 * Try to determine correctly if the timestamp is unix!
 * @param time 
 */
export function isUnixTime(time:string) {
    return time.length>=10;
}

export function logBase(num:number,base:number):number {
    return Math.log(num)/Math.log(base);
}

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
 * Generate random unique key
 * @returns Unique key string
 */
export function genUniqueKey():string {
    return '_' + Math.random().toString(36).substr(2, 9);
}

export function toDayTradingTime(date:Date,applyTzOffset:boolean) {
    let _date = new Date(date);
    if(applyTzOffset)
        _date.setTime(date.getTime()+date.getTimezoneOffset()*60*1000);
    _date.setHours(9);
    _date.setMinutes(29);
    _date.setSeconds(0);
    _date.setMilliseconds(0);
    return _date;
}

export function toDayOpenTime(date:Date,applyTzOffset:boolean) {
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
 * Return yyyy-mm-dd format of given date
 * @param date 
 * @returns yyyy-mm-dd
 */
export function yyyymmdd(date:Date) {
    let yyyy = date.getFullYear() + '';
    let mm = date.getMonth() + 1 + '';
    let dd = date.getDate() + '';
    dd = dd.length<2?'0'+dd:dd;
    mm = mm.length<2?'0'+mm:mm;
    return `${yyyy}-${mm}-${dd}`;
}