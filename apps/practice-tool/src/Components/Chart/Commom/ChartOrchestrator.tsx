import { ActiveChartSet, ChartSet } from "./ChartSet";
import { ChartSetFactory } from "./ChartSetFactory";
import { ChartContinousData } from "./ChartUtils";

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

    private ticker:string;
    private activeSet:ActiveChartSet;

    constructor(ticker:string,date:Date,completeSetData:ChartContinousData[],realtimeSetData?:ChartContinousData[]) {
        this.ticker = ticker;
        this.activeSet = new ChartSetFactory(date,completeSetData,realtimeSetData).getActiveChartSet();
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
}
