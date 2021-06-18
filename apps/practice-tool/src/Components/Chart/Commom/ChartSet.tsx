import { ChartContinousData } from "practice-tool-types";
import { TradeLog } from "./ChartOrchestrator";

export interface ChartContinousDataSuper extends ChartContinousData{
    trades:TradeLog[];
}

interface IChartAnimate {
    animateForward(date:Date):void;
    useRealtime():boolean;
}

export type ChartSetType = 'ACTIVE'|'REALTIME'|'COMPLETE';


export abstract class ChartIndicator {
    private renderKeys:string[] = [];
    public addRenderKey(key:string) {
        this.renderKeys.push(key)
    }
    public getRenderKeys(){
        return this.renderKeys;
    }
    public abstract update(candles:ChartContinousDataSuper[],index:number);
}

export class VWAPIndicator extends ChartIndicator{
   
    private period:number;
    private static VWAP_RENDER_KEY_NAME:string = 'vwap';

    constructor(period:number) {
        super();
        this.period = period;
        this.addRenderKey(this.VWAP_RENDER_KEY);
    }

    get VWAP_RENDER_KEY () {
        return `${VWAPIndicator.VWAP_RENDER_KEY_NAME}${this.period}`;
    }

    public update(candles:ChartContinousDataSuper[],index:number) {
        const candle = candles[index];
        const price = (candle.high + candle.low + candle.close)/3;

        let vwapCandle = candle as any;
        vwapCandle._totalPriceVolume = candle.volume*price;
        vwapCandle._totalVolume = candle.volume;

        if(index>0){
            const previousCandle = candles[index-1];
            const previousVwapCandle = previousCandle as any;
            const isLessThan3Hours = (candle.date.getTime()-previousCandle.date.getTime())/1000 < 3*3600;
            if(isLessThan3Hours) {
                vwapCandle._totalPriceVolume += previousVwapCandle._totalPriceVolume;
                vwapCandle._totalVolume += previousVwapCandle._totalVolume;
            }
        }
        
        vwapCandle[this.VWAP_RENDER_KEY]  = vwapCandle._totalPriceVolume/vwapCandle._totalVolume;
        
    }
}

export class ChartSet {
    
    private candles:ChartContinousDataSuper[];
    private chartType:ChartSetType;
    private indicators:ChartIndicator[];

    constructor(chartType:ChartSetType, candles:ChartContinousData[], indicators:ChartIndicator[]) {
        this.candles = [];
        this.chartType = chartType;
        this.indicators = indicators;
        
        if(this.indicators.length===0) {
            this.candles = candles.map((v)=>{return {...v,trades:[]}});
        }
        else {
            for(let can of candles)
                this.addCandle({...can,trades:[]});
        }
    }

    public getCandles():ChartContinousDataSuper[] {
        return this.candles;
    }

    public getIndicators():ChartIndicator[] {
        return this.indicators;
    }

    public addCandle(candle:ChartContinousDataSuper) {
        this.candles.push(candle);
        this.updateIndicator(this.candles.length-1);
    }

    public setCandleAtIndex(index:number,candle:ChartContinousDataSuper) {
        this.candles[index] = candle;
        this.updateIndicator(index);
    }

    private updateIndicator(index:number) {
        for(let ind of this.indicators) {

            ind.update(this.candles,index);
        }
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
    public static applyRealToBase(base:ChartContinousDataSuper,realtime:ChartContinousDataSuper):ChartContinousDataSuper {
        return {
            date:base.date,
            low: Math.min(base.low,realtime.low),
            high: Math.max(base.high,realtime.high),
            open: base.open,
            close: realtime.close,
            volume: base.volume + realtime.volume,
            count: base.count + realtime.count,
            average: (base.average+realtime.average)/2.0,
            trades: base.trades,
        };
    }
}

export class ActiveChartSet extends ChartSet implements IChartAnimate {
    private compSet:ChartSet;
    private realSet:ChartSet;
    private compIndex:number;
    private realIndex:number;

    constructor(chartType:ChartSetType,indicators:ChartIndicator[]
        ,compIndex:number,realIndex:number
        ,compSet:ChartSet,realSet:ChartSet
    ) {
        super(chartType,compSet.getCandlesBetweenRange(0,compIndex),indicators);
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

                this.setCandleAtIndex(i-1,{...preCan,trades:this.getCandleAtIndex(i-1).trades}); 
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

