import { ChartContinousData } from "practice-tool-types";
import { ChartDataLoader } from "../../../Common/DataLoader/ChartDataLoader";
import { candlestickTimeToSeconds } from "../../../Common/Utils";
import { ActiveChartSet, ChartIndicator, ChartSet } from "./ChartSet";
import { ChartSetFactory } from "./ChartSetFactory";
import { ChartSelection } from "./ChartUtils";

export type TradingActionType = 'BUY'|'SELL';

export interface TradeLog {
    ticker:string;
    price:number;
    action:TradingActionType;
    quantity:number;
    date:Date;
}

export interface AggregatedTradeLog {
    currentProfits:number;
    currentPrice:number;
    currentOpen:number;
}

export class ChartOrchestrator {

    private activeSelection:ChartSelection;
    private activeSet:ActiveChartSet;
    private static orchMap:Map<string,ChartOrchestrator>;

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

    public getCurrentCandle():ChartContinousData {
        return this.activeSet.getLastRealtimeCandle();
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

    public static updateTradeLog(log:TradeLog) {
        if(ChartOrchestrator.orchMap) {
            ChartOrchestrator.orchMap.forEach((v,k)=> {
                if(v.activeSelection.ticker===log.ticker)
                    v.updateTradeLog(log)
            })
        }
    }

    public static async getInstance(activeSelection:ChartSelection,realtimeSelection:ChartSelection
        ,args?:{date:Date,dataLoader:ChartDataLoader, logs:TradeLog[], indicators:ChartIndicator[]}):Promise<ChartOrchestrator> {
        let id = ChartOrchestrator.getId(activeSelection,realtimeSelection); 

        if(!ChartOrchestrator.orchMap) {
            ChartOrchestrator.orchMap = new Map(); 
        }

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
        if(ChartOrchestrator.orchMap) {
            ChartOrchestrator.orchMap.forEach((v,k)=> {v.update(newTime)})
        }
    }

    private static getId(activeSelection:ChartSelection,realtimeSelection:ChartSelection) {
        return activeSelection.ticker+activeSelection.candlestickDuration+realtimeSelection.ticker+realtimeSelection.candlestickDuration;
    }
}
