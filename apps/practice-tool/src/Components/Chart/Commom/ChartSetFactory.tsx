import { ChartContinousData } from "practice-tool-types";
import { ActiveChartSet, ChartIndicator, ChartSet, ChartSetType, VWAPIndicator } from "./ChartSet";

export class ChartSetFactory {

    private compCandles:ChartContinousData[];
    private realCandles:ChartContinousData[];
    private date:Date;
    private indicators:ChartIndicator[];

    constructor(date:Date,indicators:ChartIndicator[],compCandles:ChartContinousData[],realCandles:ChartContinousData[]) {
        this.date = date;
        this.indicators = indicators;
        this.compCandles = compCandles;
        this.realCandles = realCandles;
    }
    
    /**
     * Create non animation charts
     * @param chartType 
     * @returns 
     */
    public getNonActiveChartSet(chartType:ChartSetType):ChartSet {
        if(chartType==='COMPLETE') {
            return new ChartSet(chartType,this.compCandles,[]);
        }
        else if(chartType==='REALTIME') {
            return this.realCandles?new ChartSet(chartType,this.realCandles,[]):null;
        }
        else {
            throw new Error(`ChartSetType: ${chartType} is invalid.`)
        }
    } 

    /**
     * Create Active Chart for animation
     * @returns 
     */
    public getActiveChartSet():ActiveChartSet {
        const compSet = this.getNonActiveChartSet('COMPLETE');
        const realSet = this.getNonActiveChartSet('REALTIME');
        const compIndex = compSet.getClosestDateIndex(0,this.date)-1; //1 candles before just incase
        const realIndex = realSet?realSet.getClosestDateIndex(0,this.date):-1;
        let active = new ActiveChartSet('ACTIVE',this.indicators
                                        ,compIndex,realIndex
                                        ,compSet,realSet);
        active.animateForward(this.date);
        return active;
    }

}