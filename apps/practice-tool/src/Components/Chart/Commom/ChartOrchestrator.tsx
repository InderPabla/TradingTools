import { ChartDataLoader } from "../../../Common/DataLoader/ChartDataLoader";
import { ActiveChartSet, ChartSet } from "./ChartSet";
import { ChartSetFactory } from "./ChartSetFactory";
import { ChartContinousData, ChartSelection } from "./ChartUtils";

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
    private realtimeSelection:ChartSelection;
    private activeSet:ActiveChartSet;
    private static orchMap:Map<string,ChartOrchestrator>;

    private constructor(activeSelection:ChartSelection,realtimeSelection:ChartSelection,date:Date,completeSetData:ChartContinousData[],realtimeSetData?:ChartContinousData[]) {
        this.activeSelection = activeSelection;
        this.realtimeSelection = realtimeSelection;
        this.activeSet = new ChartSetFactory(date,completeSetData,realtimeSetData).getActiveChartSet();
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

    public static async getInstance(activeSelection:ChartSelection,realtimeSelection:ChartSelection
        ,args?:{date:Date,dataLoader:ChartDataLoader}):Promise<ChartOrchestrator> {
        let id = ChartOrchestrator.getId(activeSelection,realtimeSelection); 

        if(!ChartOrchestrator.orchMap) {
            ChartOrchestrator.orchMap = new Map(); 
        }

        if(!ChartOrchestrator.orchMap.has(id)) {
            if(!args) return null;
            const completeSetData = await args.dataLoader.getData(activeSelection); 
            const realtimeSetData = await args.dataLoader.getData(realtimeSelection);
            if(!completeSetData) return null;    
            ChartOrchestrator.orchMap.set(id,new ChartOrchestrator(activeSelection,realtimeSelection,args.date,completeSetData,realtimeSetData));
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
