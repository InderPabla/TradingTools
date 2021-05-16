import { ChartContinousData, } from "./ChartUtils";

interface IChartAnimate {
    animateForward(date:Date):void;
    useRealtime():boolean;
}

type ChartSetType = 'ACTIVE'|'REALTIME'|'COMPLETE';

export class ChartSet {
    
    private candles:ChartContinousData[];
    private chartType:string;

    constructor(chartType:string, candles:ChartContinousData[]) {
        this.candles = candles;
        this.chartType = chartType;
    }

    public getCandles():ChartContinousData[] {
        return this.candles;
    }

    public setCandles(candles:ChartContinousData[]) {
        this.candles = candles;
    }

    public addCandle(candle:ChartContinousData) {
        this.candles.push(candle);
    }

    public setCandleAtIndex(index:number,candle:ChartContinousData) {
        this.candles[index] = candle;
    }

    public size() {
        return this.candles.length;
    }

    public getCandleAtIndex(index:number) {
        return this.candles[index];
    }

    /**
     * Return the closest index to where the date match was found
     * @param startIndex 
     * @param date 
     * @returns Index at which the closest match to the date was found
     */
    public getClosestDateIndex(startIndex:number, date:Date):number {
        let ms:number = date.getTime();
        let newIndex:number = startIndex;
        let size:number = this.size();
        for(let i = startIndex;i<size;i++) {
            if(this.candles[i].date.getTime()<=ms) newIndex = i;
            else break;
        }
        return newIndex;
    }

    /**
     * Candles between index range (inclusive start and end index)
     * @param startIndex 
     * @param endIndex 
     */
    public getCandlesBetweenRange(startIndex:number, endIndex:number):ChartContinousData[] {
        return this.candles.slice(startIndex,endIndex+1);
    }

    public static applyRealToBase(base:ChartContinousData,realtime:ChartContinousData):ChartContinousData {
        return {
            date:base.date,
            low: Math.min(base.low,realtime.low),
            high: Math.max(base.high,realtime.high),
            open: base.open,
            close: realtime.close,
            volume: base.volume + realtime.volume,
            count: base.count + realtime.count,
            average: (base.average+realtime.average)/2.0,
        };
    }
}

export class ActiveChartSet extends ChartSet implements IChartAnimate {
    private compSet:ChartSet;
    private realSet:ChartSet;
    private compIndex:number;
    private realIndex:number;

    constructor(chartType:string,compIndex:number,realIndex:number,compSet:ChartSet,realSet:ChartSet) {
        super(chartType,compSet.getCandlesBetweenRange(0,compIndex));
        this.compSet = compSet;
        this.realSet = realSet;
        this.compIndex = compIndex;
        this.realIndex = realIndex;
    }

    /**
     * Should use real time to animate?
     * @returns 
     */
    public useRealtime():boolean {
        return this.realSet != null;
    }

    /**
     * Animate the candles forward
     * @param date 
     * @override
     */
    public animateForward(date:Date) {
        const useReal = this.useRealtime();
        const cIdx = this.compSet.getClosestDateIndex(this.compIndex,date);
        const rIdx = useReal?this.realSet.getClosestDateIndex(this.realIndex,date):-1; //1 candles before just incase

        //console.log('size before',this.compIndex,this.realIndex,cIdx,rIdx,this.size(),this.getCandles()[this.size()-1]);
        if(cIdx>this.compIndex) {
            for(let i = this.compIndex+1; i<=cIdx; i++) {
                const cCan = this.compSet.getCandleAtIndex(i);
                const precCan = this.compSet.getCandleAtIndex(i-1);
                if(useReal && i===cIdx) {
                    const rCan = this.realSet.getCandleAtIndex(rIdx);   
                    this.addCandle({...rCan,date:cCan.date});
                }
                else {
                    this.addCandle({...cCan});
                }

                this.setCandleAtIndex(i-1,{...precCan}); 
            }
            
        }
        else if(useReal && rIdx>this.realIndex){
            const lastIndex = this.size()-1;
            const aCan = this.getCandleAtIndex(lastIndex);
            const rCan = this.realSet.getCandleAtIndex(rIdx);   
            const nCan = ChartSet.applyRealToBase(aCan,rCan)
            this.setCandleAtIndex(lastIndex,{...nCan}); 
        }
      //  console.log('size after',this.size(),this.getCandles()[this.size()-1]);
        this.compIndex = cIdx;
        this.realIndex = rIdx;
    }
}

export class ChartSetFactory {

    private compCandles:ChartContinousData[];
    private realCandles:ChartContinousData[];
    private date:Date;

    constructor(date:Date,compCandles:ChartContinousData[],realCandles:ChartContinousData[]) {
        this.date = date;
        this.compCandles = compCandles;
        this.realCandles = realCandles;
    }

    public getNonActiveChartSet(chartType:ChartSetType):ChartSet {
        if(chartType==='COMPLETE') {
            return new ChartSet(chartType,this.compCandles);
        }
        else if(chartType==='REALTIME') {
            return this.realCandles?new ChartSet(chartType,this.realCandles):null;
        }
        else {
            throw new Error(`ChartSetType: ${chartType} is invalid.`)
        }
    } 

    public getActiveChartSet():ActiveChartSet {
        const compSet = this.getNonActiveChartSet('COMPLETE');
        const realSet = this.getNonActiveChartSet('REALTIME');
        const compIndex = compSet.getClosestDateIndex(0,this.date)-1; //1 candles before just incase
        const realIndex = realSet?realSet.getClosestDateIndex(0,this.date):-1;
        let active = new ActiveChartSet('ACTIVE',compIndex,realIndex,compSet,realSet);
        active.animateForward(this.date);
        return active;
    }

}



























//  /**
//      * 
//      * @param start 
//      * @param ms 
//      * @returns 
//      */
//   public getClosestDateIndex(start:number, ms:number):number {
//     let newIndex:number = start;
//     for(let i = start;i<this.candles.length;i++) {
//         if(this.candles[i].date.getTime()<=ms) newIndex = i;
//         else break;
//     }
//     return newIndex;
// }

// /**
//  * Update the last candle 
//  * @param realtime 
//  * @returns 
//  */
// public animateForward(realtime:ChartContinousData) {
//     const lastIndex = this.size() - 1;
//     let base:ChartContinousData = this.candles[lastIndex];
//     this.setCandleAtIndex(lastIndex,{
//         date:base.date,
//         low: Math.min(base.low,realtime.low),
//         high: Math.max(base.high,realtime.high),
//         open: base.open,
//         close: realtime.close,
//         volume: base.volume + realtime.volume,
//         count: base.count + realtime.count,
//         average: (base.average+realtime.average)/2.0,
//     });
// }

// public animateBackward(rIndex:number,realtimes:ChartContinousData[]) {
//     let last = {...this.candles[this.size()-1]};
//     let lastDate = last.date;
//     while(rIndex>=0) {
//         let r = realtimes[rIndex];
//         if(lastDate.getTime()>r.date.getTime()){
//             last.low = Math.max(last.low,r.low);
//             last.high = Math.min(last.high,r.high);
//             last.open = last.close;
//             last.close = r.open;
//             last.volume -= r.volume
//             last.count -= r.count;
//             last.average = (r.average + last.average)/2;
//             lastDate = r.date;
//         }
//         else {
//             break;
//         }
//         rIndex--;
//     }

//     const lastIndex = this.size() - 1;
//     this.setCandleAtIndex(lastIndex,last);
// }








