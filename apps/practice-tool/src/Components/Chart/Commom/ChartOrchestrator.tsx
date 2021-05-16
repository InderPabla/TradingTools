import { ActiveChartSet, ChartSet, ChartSetFactory } from "./ChartSet";
import { ChartContinousData } from "./ChartUtils";

export class ChartOrchestrator {

    private activeSet:ActiveChartSet;

    constructor(date:Date,completeSetData:ChartContinousData[],realtimeSetData?:ChartContinousData[]) {
        this.activeSet = new ChartSetFactory(date,completeSetData,realtimeSetData).getActiveChartSet();
    }

    public getActiveSet():ChartSet {
        return this.activeSet;
    }

    public update(date:Date) {
        this.activeSet.animateForward(date);
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        // this.completeSet = new ChartSet(completeSetData);
        // this.realtimeSet = realtimeSetData?new ChartSet(realtimeSetData):null;
        
        
        // private completeSet:ChartSet;
        // private realtimeSet:ChartSet;
    
        // private index_complete:number = 0;
        // private index_real:number = 0;
    
        
        
        // const ms = time.getTime();
        // const cs = this.completeSet.getCandles();
        // const rs = this.realtimeSet?this.realtimeSet.getCandles():null;

        // const index_cs:number = this.completeSet.getClosestDateIndex(this.index_complete, ms);
        // const index_rs:number = rs?this.realtimeSet.getClosestDateIndex(this.index_real, ms):null;

        // if(!this.activeSet) {
        //     const activeCandle = cs.slice(0,index_cs);
        //     this.activeSet = new ChartSet(activeCandle);
        //     if(rs) this.activeSet.animateBackward(index_rs,rs);
            
        // }
        // else {
        //     this.activeSet.animateForward(index_rs,rs)
        // }
        
        // this.index_complete = index_cs;
        // this.index_real = index_rs;



        // let newToCompleteSetIndex:number = ChartOrchestrator.getClosestDateIndex(this.toCompleteSetIndex, ms, completeSetCandles);
        // let newRealtimeSetIndex:number = ChartOrchestrator.getClosestDateIndex(this.realtimeSetIndex, ms, realtimeSetCandles);

        // if(this.activeSet==null) {
        //     const activeCandle = completeSetCandles.slice(0,newToCompleteSetIndex+1);
        //     this.activeSet = new ChartSet(activeCandle);
        //     this.toCompleteSetIndex = newToCompleteSetIndex;
        //     this.realtimeSetIndex = newRealtimeSetIndex;
            
        //     return;
        // }

        // if(newToCompleteSetIndex>this.toCompleteSetIndex) {
        //     for(let i = this.toCompleteSetIndex+1; i<= newToCompleteSetIndex; i++) {
        //         if(realtimeSetCandles && i===newToCompleteSetIndex) {
        //             this.activeSet.addCandle({...realtimeSetCandles[newRealtimeSetIndex],date:completeSetCandles[i].date});
        //         }
        //         else {
        //             this.activeSet.addCandle({...this.toCompleteSetIndex[i]});
        //         }
        //         this.activeSet.setLastCandle({...completeSetCandles[i-1]});    
        //     }
            
        // }
        // else if(realtimeSetCandles && newRealtimeSetIndex>this.realtimeSetIndex){
        //     this.activeSet.updateLastCandle({...realtimeSetCandles[newRealtimeSetIndex]});
        // }

        // console.log(this.activeSet.getCandles(),newToCompleteSetIndex,newRealtimeSetIndex)
        
    }
}
