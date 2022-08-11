import { ChartContinousData } from "practice-tool-types";
import { TradeLog } from "./ChartOrchestrator";

export interface ChartContinousDataSuper extends ChartContinousData{
    trades:TradeLog[];
}

export const DUMMY_CHART_CANDLE:ChartContinousDataSuper = {
    open:0,high:0,low:0,close:0,count:0,trades:[],date:null,volume:0,average:0
}

interface IChartAnimate {
    animateForward(date:Date):void;
    useRealtime():boolean;
}

export type ChartSetType = 'ACTIVE'|'REALTIME'|'COMPLETE';

export class ChartIndicatorMetadata {
    private indicatorName:string;
    private classType:IndicatorClassType;
    private keyMeta:ChartIndicatorKeyMetadata[];

    constructor(indicatorName:string, classType:IndicatorClassType, keyMeta:ChartIndicatorKeyMetadata[]) {
        this.indicatorName = indicatorName;
        this.classType = classType;
        this.keyMeta = keyMeta;
    }

    public getKeysMeta() {
        return this.keyMeta;
    }

    public getIndicatorName() {
        return this.indicatorName;
    }

    public getClassType() {
        return this.classType;
    }
}

export class ChartIndicatorKeyMetadata {
    private friendlyName:string;
    private key:string;
    private defaultValue:number;
    private value:number;

    constructor(friendlyName:string, key:string, defaultValue:number) {
        this.friendlyName = friendlyName;
        this.key = key;
        this.defaultValue = defaultValue;
        this.value = defaultValue;
    }

    public getKey() {
        return this.key;
    }

    public getDefaultValue() {
        return this.defaultValue;
    }

    public getValue() {
        return this.value
    }

    public getFirendlyName():string {
        return this.friendlyName;
    }
} 

export abstract class ChartIndicator {
    private renderKeys:string[] = [];
    private meta:ChartIndicatorMetadata;

    constructor(meta:ChartIndicatorMetadata) {
        this.meta = meta;
    }

    public addRenderKey(key:string) {
        this.renderKeys.push(key)
    }

    public getRenderKeys(){
        return this.renderKeys;
    }

    public getMetadata() {
        return this.meta;
    }

    public abstract get UNIQUE_KEY():string;
    public abstract update(candles:ChartContinousDataSuper[],index:number);
    public static getDefaultMetadata():ChartIndicatorMetadata {
        throw new Error(`getDefaultMetadata function must be implemented by the child Indicator`);
    }

    public static applyMetadata(chart:ChartIndicator) {
        chart.meta.getKeysMeta().forEach(v=>chart[v.getKey()]=v.getValue());
    }
}

export class VWAPIndicator extends ChartIndicator{
    private period:number;
    constructor(meta?:ChartIndicatorMetadata) {
        super(meta || VWAPIndicator.getDefaultMetadata());
        ChartIndicator.applyMetadata(this);
        this.addRenderKey(this.VWAP_KEY);
    }

    private get VWAP_KEY () {
        return `vwap${this.period}`;
    }

    private get VWAP_TOTAL_PRICE_VOLUME () {
        return `_totalPriceVolume${this.period}`;
    }

    private get VWAP_TOTAL_VOLUME () {
        return `_totalVolume${this.period}`;
    }

    public get UNIQUE_KEY () {
        return this.VWAP_KEY;
    } 

    public update(candles:ChartContinousDataSuper[],index:number) {
        const candle = candles[index];
        const price = (candle.high + candle.low + candle.close)/3;
        
        let vwapCandle = candle as any;
        vwapCandle[this.VWAP_TOTAL_PRICE_VOLUME] = candle.volume*price;
        vwapCandle[this.VWAP_TOTAL_VOLUME] = candle.volume;

        if(index>=this.period){
            const previousCandle = candles[index-this.period];
            const previousVwapCandle = previousCandle as any;
            const isLessThan3Hours = (candle.date.getTime()-previousCandle.date.getTime())/1000 < 3*3600;
            if(isLessThan3Hours) {
                vwapCandle[this.VWAP_TOTAL_PRICE_VOLUME] += previousVwapCandle[this.VWAP_TOTAL_PRICE_VOLUME];
                vwapCandle[this.VWAP_TOTAL_VOLUME] += previousVwapCandle[this.VWAP_TOTAL_VOLUME];
            }
        }
        
        vwapCandle[this.VWAP_KEY]  = vwapCandle[this.VWAP_TOTAL_PRICE_VOLUME]/vwapCandle[this.VWAP_TOTAL_VOLUME];
    }

    public static getDefaultMetadata():ChartIndicatorMetadata {
        return new ChartIndicatorMetadata("VWAP",VWAPIndicator,[new ChartIndicatorKeyMetadata("VWAP Period","period",1)]);
    }
}

export class MovingAverageIndicator extends ChartIndicator{
    private period:number;
    constructor(meta?:ChartIndicatorMetadata) {
        super(meta || MovingAverageIndicator.getDefaultMetadata());
        ChartIndicator.applyMetadata(this);
        this.addRenderKey(this.SMA_KEY);
    }

    private get SMA_KEY () {
        return `sma${this.period}`;
    }

    public get UNIQUE_KEY () {
        return this.SMA_KEY;
    } 

    public update(candles:ChartContinousDataSuper[],index:number) {
        const candle = candles[index];
        let anyCandle = candle as any;
        let sma = candle.close;
 
        if(index>=this.period-1){
            sma = 0;
            for(let i=index-(this.period-1);i<=index;i++) {
                sma += candles[i].close;
            }
            sma /= this.period;
        }

        anyCandle[this.SMA_KEY] = sma;
    }

    public static getDefaultMetadata():ChartIndicatorMetadata {
        return new ChartIndicatorMetadata("SMA",MovingAverageIndicator,[new ChartIndicatorKeyMetadata("SMA Period","period",12)]);
    }
}

export class ExpMovingAverageIndicator extends ChartIndicator{
    private period:number;
    private multiplier:number;

    constructor(meta?:ChartIndicatorMetadata) {
        super(meta || ExpMovingAverageIndicator.getDefaultMetadata());
        ChartIndicator.applyMetadata(this);
        this.addRenderKey(this.EMA_KEY);

        this.multiplier = 2.0/(this.period+1);
    }

    private get EMA_KEY () {
        return `ema${this.period}`;
    }

    public get UNIQUE_KEY () {
        return this.EMA_KEY;
    } 

    public update(candles:ChartContinousDataSuper[],index:number) {
        const currentCandle = candles[index];
        let anyCurrentCandle = currentCandle as any;
        let currentEma = currentCandle.close;
 
        if(index>=this.period-1){
            let anyCandlePrevious = candles[index-1];
            currentEma = (currentCandle.close*this.multiplier) + (anyCandlePrevious[this.EMA_KEY]*(1.0-this.multiplier));
        }

        anyCurrentCandle[this.EMA_KEY] = currentEma;
    }

    public static getDefaultMetadata():ChartIndicatorMetadata {
        return new ChartIndicatorMetadata("EMA",ExpMovingAverageIndicator,[new ChartIndicatorKeyMetadata("EMA Period","period",12)]);
    }
}



export type IndicatorClassType = typeof VWAPIndicator | typeof MovingAverageIndicator | typeof ExpMovingAverageIndicator;
export const INDICATOR_CLASSES:IndicatorClassType[] = [VWAPIndicator,MovingAverageIndicator,ExpMovingAverageIndicator];

export class ChartIndicatorFactory {

    public static toIndicatorFromClassType(classType:IndicatorClassType,meta?:ChartIndicatorMetadata):ChartIndicator {
        if(classType === VWAPIndicator) {
            return new VWAPIndicator(meta);
        }
        else if(classType === MovingAverageIndicator) {
            return new MovingAverageIndicator(meta);
        }
        else if(classType === ExpMovingAverageIndicator) {
            return new ExpMovingAverageIndicator(meta);
        }

        throw new Error(`Invalid Indicator Class Type ${classType}`);
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
        
        for(let can of candles)
            this.addCandle({...can,trades:[]});
    }

    public addIndicator(_ind:ChartIndicator) {
        const existInd = this.indicators.find(v=>v.UNIQUE_KEY===_ind.UNIQUE_KEY);
        if(existInd==null) {
            this.indicators.push(_ind);
            this.candles.forEach((can,idx)=>{
                _ind.update(this.candles,idx);
            });
        }
    }

    public resetIndicators(_ind:ChartIndicator[]) {
        this.indicators = [];
        const validChartKeys = Object.keys(DUMMY_CHART_CANDLE);
        this.candles.forEach((can)=>{
            const allCandleKeys = Object.keys(can);
            allCandleKeys.forEach((k)=> {
                if(validChartKeys.indexOf(k)===-1) {
                    delete can[k];
                }
            });
        });
        _ind.forEach(v=>this.addIndicator(v));
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

    public getCurrentRealtimeCandle():ChartContinousData {
        return this.realSet != null ? this.realSet.getCandleAtIndex(this.realIndex) : this.getCandleAtIndex(this.compIndex);
    }

    public getPreviousRealtimeCandle():ChartContinousData {
        return this.realSet != null ? this.realSet.getCandleAtIndex(this.realIndex-1) : this.getCandleAtIndex(this.compIndex-1);
    }

    public getSpread(spreadRange:number):number {
        let spread = 0;
        let spreadCount = 0;

        if(this.realSet !=null && spreadRange>0) {
            let maxRealIndex = this.realIndex;
            let minRealIndex = this.realIndex-(spreadRange + 1);

            if(minRealIndex<0) minRealIndex = 0;

            for(let i = minRealIndex; i<=maxRealIndex; i++) {
                const can = this.realSet.getCandleAtIndex(i);
                spread += (can.high - can.low);
                spreadCount++;
            }

            if(spreadCount>0) spread = spread/spreadCount;
        }
    
        return spread;
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

