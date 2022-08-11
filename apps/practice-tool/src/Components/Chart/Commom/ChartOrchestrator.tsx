import { ChartContinousData } from "practice-tool-types";
import { ChartDataLoader } from "../../../Common/DataLoader/ChartDataLoader";
import { candlestickTimeToSeconds } from "../../../Common/Utils";
import { ActiveChartSet, ChartIndicator, ChartSet } from "./ChartSet";
import { ChartSetFactory } from "./ChartSetFactory";
import { ChartSelection } from "./ChartUtils";

export interface TradeLog {
    ticker:string;
    price:number;
    quantity:number;
    date:Date;
}

export interface AggregatedTradeLog {
    ticker:string;
    currentProfits:number;
    currentPrice:number;
    currentOpen:number;
    baseTradePrice:number;
    commissions:number;
}

export class ChartOrchestrator {

    private activeSelection:ChartSelection;
    private activeSet:ActiveChartSet;
    private static orchMap:Map<string,ChartOrchestrator> = new Map();
    private static orchForCurrentPrice:Map<string,ChartOrchestrator> = new Map();

    private constructor(activeSelection:ChartSelection,date:Date,indicators:ChartIndicator[],completeSetData:ChartContinousData[],realtimeSetData?:ChartContinousData[]) {
        this.activeSelection = activeSelection;
        this.activeSet = new ChartSetFactory(date,indicators,completeSetData,realtimeSetData).getActiveChartSet();
    }

    public getActiveSelection() {
        return this.activeSelection;
    }

    public getActiveSet():ActiveChartSet {
        return this.activeSet;
    }

    public getCurrentPrice():number {
        return this.getCurrentCandle().close;
    }

    public getPreviousPrice():number {
        return this.activeSet.getPreviousRealtimeCandle().close;
    }

    public getCurrentCandle():ChartContinousData {
        return this.activeSet.getCurrentRealtimeCandle();
    }

    /**
     * Get Price spread (not accurate)
     * @param spreadRange Average price spread on eaither (Ex:2 spread would be spread -2 and +2 index of high-low)
     * @returns 
     */
    public getSpread(spreadRange:number):number {
        return this.activeSet.getSpread(spreadRange);
    }

    public resetIndicators(indicators:ChartIndicator[]):void {
        this.activeSet.resetIndicators(indicators);
    }

    public setIndicators(indicators:ChartIndicator[]):void {
        indicators.forEach(v=>this.activeSet.addIndicator(v));
    }

    /**
     * Update chart given new date
     * @param newDate 
     */
    public update(newDate:Date) {
        this.activeSet.animateForward(newDate); 
    }

    public updateTradeLog(log:TradeLog) {
        let candles = this.activeSet.getCandles();

        const minSeconds = candlestickTimeToSeconds(this.activeSelection.candlestickDuration);

		for(let i = 0; i<candles.length;i++) {
			const can = candles[i];
			const canAny = can as any;
			const canTime = can.date.getTime();
			const logTime = log.date.getTime();	
			if(logTime>=canTime && (logTime-canTime)/1000<=minSeconds) {
				if(!canAny.trades) canAny.trades = [];
				canAny.trades.push(log);
                break;
			}
		}
    }
    
    public static getCurrentPrice(ticker:string) {
        if(ChartOrchestrator.orchForCurrentPrice.has(ticker)) 
            return ChartOrchestrator.orchForCurrentPrice.get(ticker).getCurrentPrice();
            
        let keys = Array.from(ChartOrchestrator.orchMap.keys());
        for(let key of keys) {
            let orch = ChartOrchestrator.orchMap.get(key);
            if(ChartOrchestrator.orchMap.get(key).activeSelection.ticker===ticker) {
                ChartOrchestrator.orchForCurrentPrice.set(ticker,orch);
                return orch.getCurrentPrice();
            }
        }
        return null;
    }

    public static getPreviousPrice(ticker:string) {
        if(ChartOrchestrator.orchForCurrentPrice.has(ticker)) 
            return ChartOrchestrator.orchForCurrentPrice.get(ticker).getPreviousPrice();
        return null;
    }

    public static updateTradeLog(log:TradeLog) {
        ChartOrchestrator.orchMap.forEach((v,k)=> {
            if(v.activeSelection.ticker===log.ticker)
                v.updateTradeLog(log)
        });
    }

    public static updateIndicators(indicators:ChartIndicator[]) {
        ChartOrchestrator.orchMap.forEach((v,k)=> {
            v.resetIndicators(indicators);
        });
    }
    
    public static async getInstance(activeSelection:ChartSelection,realtimeSelection:ChartSelection
        ,args?:{date:Date,dataLoader:ChartDataLoader, logs:TradeLog[], indicators:ChartIndicator[]}):Promise<ChartOrchestrator> {
        let id = ChartOrchestrator.getId(activeSelection,realtimeSelection); 

        if(!ChartOrchestrator.orchMap.has(id)) {
            if(!args) return null;
            const completeSetData = await args.dataLoader.getData(activeSelection); 
            const realtimeSetData = await args.dataLoader.getData(realtimeSelection);
            if(!completeSetData) return null;    
            let newOrch = new ChartOrchestrator(activeSelection,args.date,args.indicators,completeSetData,realtimeSetData);
            for(let log of args.logs) {
                newOrch.updateTradeLog(log);
            }
            ChartOrchestrator.orchMap.set(id,newOrch);
        }

        return ChartOrchestrator.orchMap.get(id);
    }

    public static hasInstance(activeSelection:ChartSelection,realtimeSelection:ChartSelection) {
        let id = ChartOrchestrator.getId(activeSelection,realtimeSelection);
        return ChartOrchestrator.orchMap!=null && ChartOrchestrator.orchMap.has(id);
    }

    public static update (newTime:Date) {
        ChartOrchestrator.orchMap.forEach((v,k)=> {v.update(newTime)})
    }

    private static getId(activeSelection:ChartSelection,realtimeSelection:ChartSelection) {
        return activeSelection.ticker+activeSelection.candlestickDuration+realtimeSelection.ticker+realtimeSelection.candlestickDuration;
    }
}
