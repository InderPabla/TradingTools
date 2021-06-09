import { ChartContinousData } from "practice-tool-types";

interface ChartIndicatorData {
	name:string;
    color:string;
    renderKeys:string[];
}

interface VWAPData {
    _totalPrice:number;
    _totalVolume:number;
    vwap:number
}

interface IChartAnimate {
    animateForward(date:Date):void;
    useRealtime():boolean;
}

export type ChartSetType = 'ACTIVE'|'REALTIME'|'COMPLETE';

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

    /**
     * Create a new candle where the realtime candles has been applied on top of the base candle
     * @param base 
     * @param realtime 
     * @returns 
     */
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
    private indicators:ChartIndicatorData[];

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
        return this.realSet != null && this.realIndex>=0;
    }

    public getLastRealtimeCandle():ChartContinousData {
        return this.realSet != null ? this.realSet.getCandleAtIndex(this.realIndex) : this.getCandleAtIndex(this.compIndex);
    }

    /**
     * Animate the candles forward based on the given date
     * If realtime candles have been provided then the candle will 
     * animate only up to the real time index
     * @param newDate 
     * @override
     */
    public animateForward(newDate:Date) {
        const useReal = this.useRealtime();
        const cIdx = this.compSet.getClosestDateIndex(this.compIndex,newDate);
        const rIdx = useReal?this.realSet.getClosestDateIndex(this.realIndex,newDate):-1; //1 candles before just incase
        
        if(cIdx>this.compIndex) {
            for(let i = this.compIndex+1; i<=cIdx; i++) {
                const curCan = this.compSet.getCandleAtIndex(i);
                const preCan = this.compSet.getCandleAtIndex(i-1);
                if(useReal && i===cIdx) {
                    let curCanDateMs = curCan.date.getTime();
                    let rIdxCopy = rIdx;
                    while(true) {
                        let rCan = this.realSet.getCandleAtIndex(rIdxCopy); 
                        if(curCanDateMs<rCan.date.getTime()){
                            rIdxCopy--;
                            if(rIdxCopy<0) break;
                        }
                        else break; 
                    }
                    if(rIdxCopy<rIdx) rIdxCopy++;
                    let newCurCan = {...this.realSet.getCandleAtIndex(rIdxCopy)}
                    for(let j = rIdxCopy; j <= rIdx; j++) {
                        newCurCan = ChartSet.applyRealToBase(newCurCan,this.realSet.getCandleAtIndex(j));
                    }
                    this.addCandle({...newCurCan, open:curCan.open, date:curCan.date});
                }
                else {
                    this.addCandle({...curCan});
                }

                this.setCandleAtIndex(i-1,{...preCan}); 
            }
        }
        else if(useReal && rIdx>this.realIndex){
            const lastIndex = this.size()-1;
            const aCan = this.getCandleAtIndex(lastIndex);
            let nCan = {...aCan};
            for(let i = this.realIndex + 1; i <= rIdx; i++) {
                const rCan = this.realSet.getCandleAtIndex(i);   
                nCan = ChartSet.applyRealToBase(nCan,rCan);
            }
            this.setCandleAtIndex(lastIndex,{...nCan}); 
        }

        this.compIndex = cIdx;
        this.realIndex = rIdx;
    }
}

