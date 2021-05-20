//https://github.com/rrag/react-stockcharts/issues/519

import React from "react";
import { ChartContinousData, ChartSelection } from "./Commom/ChartUtils";
import { scaleTime } from "d3-scale";
import { format } from "d3-format";
import { timeFormat } from "d3-time-format";
import { ChartCanvas, Chart } from "react-stockcharts";
import { CandlestickSeries, BarSeries } from "react-stockcharts/lib/series";
import { XAxis, YAxis } from "react-stockcharts/lib/axes";
import { last, timeIntervalBarWidth } from "react-stockcharts/lib/utils";
import { lastVisibleItemBasedZoomAnchor } from "react-stockcharts/lib/utils/zoomBehavior"
import { candlestickTimeToD3Time } from "../../Common/Utils";
import { EdgeIndicator, MouseCoordinateY, MouseCoordinateX, CrossHairCursor } from "react-stockcharts/lib/coordinates";
import { discontinuousTimeScaleProvider } from "react-stockcharts/lib/scale";
import { COLOR } from "../../Common/ColorConst";
import { min as d3Min, max as d3Max } from 'd3-array';
import { ChartSet } from "./Commom/ChartSet";
import { fitWidth } from "react-stockcharts/lib/helper";
import { start } from "node:repl";

interface ReactStockChartsWrapperProps {
    width:number;
    height:number;
    selection:ChartSelection;
    data:ChartContinousData[];
    type?:string;
}

interface ReactStockChartsWrapperState {
    panEvent:boolean;
}

class ReactStockChartsWrapper extends React.Component<ReactStockChartsWrapperProps,ReactStockChartsWrapperState> {

	public static defaultProps = {
        type: "svg",
    };

    private chartCanvas:ChartCanvas;

    constructor(props:ReactStockChartsWrapperProps) {
        super(props);
        this.state = { panEvent:false }
    }

	componentDidMount() {
		window.addEventListener("keydown", this.keyDownEvent, false);
		window.addEventListener("keyup", this.keyUpEvent, false);
	}
	
	componentWillUnmount() {
		window.removeEventListener("keydown", this.keyDownEvent, false);
		window.removeEventListener("keyup", this.keyUpEvent, false);
	}

	keyDownEvent = (event) => {
		if(event.code==='KeyX') {
            if(!this.state.panEvent) this.setState({panEvent:true});
		}
	}

	keyUpEvent = (event) => {
		if(event.code==='KeyX') {
            if(this.state.panEvent) this.setState({panEvent:false});
		}
	}

    private dateD3MaxPlusPadding = (values:Date[], valueof:Function):Date => {
        return new Date(d3Max(values, valueof).getTime()+(1000*5*60));
    }

    shouldComponentUpdate(nextProps: Readonly<ReactStockChartsWrapperProps>, nextState: Readonly<ReactStockChartsWrapperState>):boolean {
		return true;
	}
    
    componentDidUpdate() {
        if(!this.chartCanvas) {
            this.setState(()=>{
                this.forceUpdate();
            });
        }
    }

	render() {
        const { panEvent } = this.state;
        const { width, height, data:initialData, selection, type} = this.props;
		const intervalFunction = candlestickTimeToD3Time(selection.candlestickDuration);
		const totalChartHeight = height;
		const chartHeight = height*0.7;
		const chartVolumeHeight = height*0.25;
		const chartWidth = width;
        const xDateAccessor = d=>d.date;
        const leftMargin = initialData[0].close.toString().split(".")[0].length===3?50:40;

        const xScaleProvider = discontinuousTimeScaleProvider.inputDateAccessor(xDateAccessor);
		const {
			data,
			xScale,
			xAccessor,
			displayXAccessor,
		} = xScaleProvider(initialData);

        let startIndex = data.length-100;
        startIndex = startIndex<0?0:startIndex;
        let endIndex = data.length-1;
        let showExtra = true;

        if(this.chartCanvas) {
            const plotData = this.chartCanvas.state.plotData;
            const plotStartIndex = plotData[0].idx.index;
            const plotEndIndex = plotData[plotData.length-1].idx.index;
            const dataEndIndex = endIndex;
            
            //This looks like a werid state to be in. The chart paramters could have been changed!
            //Don't do anything and let's just view the last ~100 candles
            if(plotStartIndex>=endIndex) {
                showExtra = true;
            }

            //Looks good
            else {
                startIndex = plotStartIndex;

                //Keep watching the current candle
                if(dataEndIndex-plotEndIndex>=2) {
                    endIndex = plotEndIndex;
                    showExtra = false;
                }
                //View the new candle
                else {
                    endIndex = dataEndIndex;
                    showExtra = true;
                }
            }
        }
        else {
            showExtra = true;
        }
        
        if(showExtra) endIndex++; //show 1 more candle area

        let xExtents=[startIndex,endIndex];

		return (
        <React.Fragment>
            <ChartCanvas ref={(ref) => this.chartCanvas = ref}

                data={data}
                xAccessor={xAccessor}
                xScale={xScale}
                displayXAccessor={displayXAccessor}
                xExtents = {xExtents}
  
                panEvent={panEvent}
                clamp={false}
                zoomAnchor={lastVisibleItemBasedZoomAnchor}
                height={totalChartHeight}
                ratio={1}
                width={chartWidth}
                margin={{ left: 0, right: leftMargin, top: 0, bottom: 5 }}
                type={type}
                seriesName={selection.ticker}>
                
                <Chart  
                    id={1} 
                    origin={(w, h) => [0, 0]} 
                    yExtents={d => [d.high, d.low]} 
                    padding={{ top: 20, bottom: 20 }}
                    height={chartHeight}>
                    <XAxis 
                       
                        ticks={20} 
                        innerTickSize={chartHeight*-1} 
                        outerTickSize={chartHeight*-1}

                        axisAt="bottom" 
                        orient="bottom"
                        tickStrokeOpacity={0.2}
                        tickStroke={COLOR.WHITE}
                        
                        tickFormat={(index:number)=>{
                            let date = timeFormat("%H:%M")(data[index].date);
                            if(date === "04:00") {
                                return timeFormat("%m/%d")(data[index].date);
                            }
                            return date;
                        }}
                        stroke={COLOR.WHITE}
                    />
                    <YAxis 
                        axisAt="right" 
                        orient="right" 
                        ticks={15} 
                        innerTickSize={chartWidth*-1} 
                        tickStrokeOpacity={0.2}
                        tickStroke={COLOR.WHITE}
                        tickFormat={format(".2f")}
                        stroke={COLOR.WHITE}
                    />
                    <MouseCoordinateY
						at="right"
						orient="right"
						displayFormat={format(".2f")} 
                    />
                    <CandlestickSeries 
                        //width={timeIntervalBarWidth(intervalFunction)}
                        wickStroke={COLOR.WHITE}
                        stroke={(d)=> {
                            let diff = Math.abs(d.close-d.open);
                            if(diff<=0.01) return COLOR.YELLOW;
                            return d.close > d.open ? COLOR.LIMEGREEN : COLOR.RED
                        }}
                        fill={function fill(d) {
                            let diff = Math.abs(d.close-d.open);
                            if(diff<=0.01) return COLOR.YELLOW;
                            return d.close > d.open ? COLOR.LIMEGREEN : COLOR.RED;
                        }}
                        opacity={1}
                    />
                </Chart>
                
                <Chart id={2} origin={(w, h) => [0, h - chartVolumeHeight]} height={chartVolumeHeight} yExtents={d => [d.volume,0]}>
                    <YAxis 
                        axisAt="right" 
                        orient="right" 
                        ticks={5} 
                        tickFormat={format(".2s")}
                        tickStroke={COLOR.WHITE}
                        stroke={COLOR.WHITE}
                    />
                    <MouseCoordinateX
						at="bottom"
						orient="top"
						displayFormat={timeFormat("%Y-%m-%d %H:%M")} 
                    />
                    <BarSeries yAccessor={d => d.volume} 
                        fill={(d) => d.close > d.open ? COLOR.LIMEGREEN : COLOR.RED} 
                        //width={timeIntervalBarWidth(intervalFunction)}
                    />
                </Chart>
                <CrossHairCursor stroke={COLOR.WHITE} opacity={0.75}/>
            </ChartCanvas>
        </React.Fragment>)
	}



}

export default fitWidth(ReactStockChartsWrapper);