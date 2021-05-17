import { ActiveChartSet, ChartSet } from "./ChartSet";
import { ChartSetFactory } from "./ChartSetFactory";
import { ChartContinousData } from "./ChartUtils";

export class ChartOrchestrator {

    private activeSet:ActiveChartSet;

    constructor(date:Date,completeSetData:ChartContinousData[],realtimeSetData?:ChartContinousData[]) {
        this.activeSet = new ChartSetFactory(date,completeSetData,realtimeSetData).getActiveChartSet();
    }

    public getActiveSet():ChartSet {
        return this.activeSet;
    }

    /**
     * Update chart given new date
     * @param newDate 
     */
    public update(newDate:Date) {
        this.activeSet.animateForward(newDate); 
    }
}
