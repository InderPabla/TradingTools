
import * as React from 'react';
import { CANDLESTICK_DURATION } from '../../Common/Constant';
import {CandleStickChart, CandleStickData} from '../../Components/Chart/TickerChart';
import { fitWidth } from "react-stockcharts/lib/helper";
import { dateSpecifics, genUniqueKey, largestInAccessor, smallestInAccessor } from '../../Common/Utils';
import { TypeChooser } from "react-stockcharts/lib/helper";

var csv=require("csvtojson");

/*JSON.parse(`["date":"2010-01-04T05:00:00.000Z","open":25.436282332605284,"high":25.835021381744056,"low":25.411360259406774,"close":25.710416,"volume":38409100,"split":"","dividend":"","absoluteChange":"","percentChange":""]`)
data.array.forEach(element => {
  element.date = new Date(element.date)
});*/

//"date":"2010-01-04T05:00:00.000Z","open":25.436282332605284,"high":25.835021381744056,"low":25.411360259406774,"close":25.710416,"volume":38409100,"split":"","dividend":"","absoluteChange":"","percentChange":""


export interface PracticeToolOLDProps {
  width:number;
  height:number;
}

export interface PracticeToolOLDState {
  animateCandleData:any[],
  realtimeCandleData:any[],
  activeData:any[],
  longTimeFrameActiveIndex:number,
  shorterTimeFrameActiveIndex:number,
  shortTimeFrameIntraIndex:number,
  animateDuration:string,
  ticker:string,

  preMarketOpen:number,
  preMarketHigh:number,
  preMarketLow:number,

  ticksInLongTimeFrame:number,

  uniqueKey:string,
}

export class PracticeToolOLD extends React.Component<PracticeToolOLDProps,PracticeToolOLDState> {

    constructor(props) {
      super(props);
      this.state = {
        animateCandleData:[],
        realtimeCandleData:[],
        activeData:[],
        longTimeFrameActiveIndex:-1,
        shorterTimeFrameActiveIndex:-1,
        shortTimeFrameIntraIndex:-1,
        animateDuration:CANDLESTICK_DURATION.MIN_5,
        ticker:'',

        preMarketOpen:-1,
        preMarketHigh:-1,
        preMarketLow:-1,
        ticksInLongTimeFrame:0,
        uniqueKey:'',
      }
    }

    async loadTickerDataFromFile(filename:string):Promise<CandleStickData[]> {
      let fetched = await fetch(`data/${filename}`)
      let dataCsv = await fetched.text()
      let dataJson:any[] = await csv({
        noheader: false,
        headers: ['date','open','high','low','close','average','volume','count']
      }).fromString(dataCsv)

      let totalVolumePrice = 0;
      let totalVolume = 0;

      let chartData:any[] = dataJson.map((v:any,index:number)=>{

        let tick = {
          date: new Date(parseInt(v.date)*1000),
          open: parseFloat(v.open),
          high: parseFloat(v.high),
          low: parseFloat(v.low),
          close: parseFloat(v.close),
          volume: parseInt(v.volume)*100,
          average: parseInt(v.average),
          count: parseInt(v.count),
          vwap:parseInt(v.average),
        }

        totalVolume += tick.volume;
        totalVolumePrice += (tick.volume*((tick.high+tick.low+tick.close)/3.0));

        tick.vwap = totalVolume===0?tick.vwap:totalVolumePrice/totalVolume;

        return tick;
      });

      return chartData;
    }

    /**
     * TODO: Re-write this logic there is double rendering of the same tick happening
     */
    startTicks() {
      setTimeout(()=>{
        let {activeData,animateCandleData,longTimeFrameActiveIndex,shorterTimeFrameActiveIndex
            ,shortTimeFrameIntraIndex,realtimeCandleData,ticksInLongTimeFrame} = this.state;
        const uniqueKey = genUniqueKey();

        if(shortTimeFrameIntraIndex===-1) {
          shortTimeFrameIntraIndex = 1;
          shorterTimeFrameActiveIndex+=ticksInLongTimeFrame;
          activeData.push(realtimeCandleData[shorterTimeFrameActiveIndex]);
        }
        else {
          //HARCODED CHECK 
          if(shortTimeFrameIntraIndex===ticksInLongTimeFrame){
            shortTimeFrameIntraIndex = -1;
            longTimeFrameActiveIndex++;
            activeData[activeData.length-1] = animateCandleData[longTimeFrameActiveIndex];
          }
          else {
            let oldTick:CandleStickData = {...activeData[activeData.length-1]};
            let nowTick:CandleStickData = realtimeCandleData[shorterTimeFrameActiveIndex+shortTimeFrameIntraIndex];
            nowTick.open = oldTick.open;
            nowTick.low = Math.min(oldTick.low,nowTick.low);
            nowTick.high = Math.max(oldTick.high,nowTick.high);
            nowTick.date = oldTick.date;
            nowTick.volume = nowTick.volume + oldTick.volume;
            nowTick.count = nowTick.count + oldTick.count;
            nowTick.vwap = oldTick.vwap
            activeData[activeData.length-1] = nowTick;
            shortTimeFrameIntraIndex++;
          }
        }

        this.setState({activeData,animateCandleData,longTimeFrameActiveIndex,shorterTimeFrameActiveIndex
                      ,shortTimeFrameIntraIndex,uniqueKey},()=>{

          if(activeData.length<animateCandleData.length)
            this.startTicks();
        });

      },1000);
    }

    async componentDidMount() {
      try {
        const ticker = "MVIS";
        const day = "2021/04/28";
        const realtimeDuration = CANDLESTICK_DURATION.SEC_5;
        const animateDuration = CANDLESTICK_DURATION.MIN_1;
        const specifics = dateSpecifics(day,ticker,realtimeDuration,animateDuration);
        const animateCandleData = await this.loadTickerDataFromFile(specifics.animateFilename);
        const realtimeCandleData = await this.loadTickerDataFromFile(specifics.realtimeFilename);
        
        //TODO: Premarket should be auto determined based on the day that is being loaded
        const lastPreMarketOpenTs = new Date("Fri Apr 28 2021 09:55:00 GMT-0400 (Eastern Daylight Time)").getTime();
        const longTimeFrameActiveIndex = animateCandleData.findIndex(v=>v.date.getTime()===lastPreMarketOpenTs);
        const shorterTimeFrameActiveIndex = realtimeCandleData.findIndex(v=>v.date.getTime()===lastPreMarketOpenTs);
        const shortTimeFrameIntraIndex = -1;
        const activeData = animateCandleData.slice(0,longTimeFrameActiveIndex+1);
        const preMarketOpen = activeData[0].open;
        const preMarketHigh = largestInAccessor(activeData,d=>d.high);
        const preMarketLow = smallestInAccessor(activeData,d=>d.low);

        const secondsInAnimate = (animateCandleData[1].date.getTime()-animateCandleData[0].date.getTime());
        const secondsInRealtime = (realtimeCandleData[1].date.getTime()-realtimeCandleData[0].date.getTime());
        const ticksInLongTimeFrame = secondsInAnimate/secondsInRealtime;

        const uniqueKey = genUniqueKey();

        this.setState({animateCandleData,realtimeCandleData,activeData,longTimeFrameActiveIndex,ticker
                      ,animateDuration,shorterTimeFrameActiveIndex,shortTimeFrameIntraIndex
                      ,preMarketOpen,preMarketHigh,preMarketLow,ticksInLongTimeFrame,uniqueKey});

        this.startTicks();
      }
      catch(err){
        
      }
    }

    public render() {
      const {activeData,ticker,animateDuration,preMarketHigh,preMarketLow,preMarketOpen,uniqueKey} = this.state;
      

      return (
        <React.Fragment>
          {/* <TypeChooser>
				    {type => 
              <CandleStickChart 
                data={activeData} 
                type={type}
                ticker={ticker} 
                candlestickDuration={animateDuration}

                preMarketOpen={preMarketOpen}
                preMarketLow={preMarketLow}
                preMarketHigh={preMarketHigh} 
              />}
			    </TypeChooser>   */}


          <CandleStickChart 
                width={this.props.width}
                height={this.props.height}
                
                data={activeData} 
                type={"svg"}
                ticker={ticker} 
                candlestickDuration={animateDuration}

                preMarketOpen={preMarketOpen}
                preMarketLow={preMarketLow}
                preMarketHigh={preMarketHigh} 

                uniqueKey={uniqueKey}
              />
        </React.Fragment>
      );
    }
  }
