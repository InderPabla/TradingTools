//https://github.com/rrag/react-stockcharts/issues/519

import React from "react";
import { ChartSelection } from "./Commom/ChartUtils";
import { scaleTime } from "d3-scale";
import { format } from "d3-format";
import { timeFormat } from "d3-time-format";
import { ChartCanvas, Chart } from "react-stockcharts";
import { CandlestickSeries, BarSeries, LineSeries, TriangleMarker } from "react-stockcharts/lib/series";
import { XAxis, YAxis } from "react-stockcharts/lib/axes";
import { last, timeIntervalBarWidth } from "react-stockcharts/lib/utils";
import { lastVisibleItemBasedZoomAnchor } from "react-stockcharts/lib/utils/zoomBehavior"
import { candlestickTimeToD3Time } from "../../Common/Utils";
import { EdgeIndicator, MouseCoordinateY, MouseCoordinateX, CrossHairCursor } from "react-stockcharts/lib/coordinates";
import { discontinuousTimeScaleProvider } from "react-stockcharts/lib/scale";
import { COLOR } from "../../Common/ColorConst";
import { min as d3Min, max as d3Max } from 'd3-array';
import { ChartContinousDataSuper, ChartIndicator } from "./Commom/ChartSet";
import { fitWidth } from "react-stockcharts/lib/helper";
import { start } from "node:repl";

interface ReactStockChartsWrapperProps {
    width:number;
    height:number;
    selection:ChartSelection;
    data:ChartContinousDataSuper[];
    indicators:ChartIndicator[];
    buyPrices:number[],
    sellPrices:number[],
    type?:string;
    fontSize?:number;
}

interface ReactStockChartsWrapperState {
    panEvent:boolean;
}

export class ReactStockChartsWrapper extends React.Component<ReactStockChartsWrapperProps,ReactStockChartsWrapperState> {

	public static defaultProps = {
        type: "svg",
        fontSize:10,
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
        const { width, height, data:initialData, selection, type, buyPrices, sellPrices, fontSize
        ,indicators} = this.props;

		const intervalFunction = candlestickTimeToD3Time(selection.candlestickDuration);
        const xDateAccessor = d=>d.date;
        const xScaleProvider = discontinuousTimeScaleProvider.inputDateAccessor(xDateAccessor);
		const {
			data,
			xScale,
			xAccessor,
			displayXAccessor,
		} = xScaleProvider(initialData);

        const rightCanvasMargin = initialData[0].close.toString().split(".")[0].length===3?40:33;
		const totalChartHeight = height;
		const chartHeight = height*0.75;
		const chartVolumeHeight = height*0.2;
		const chartWidth = width;

        let startIndex = data.length-100;
        startIndex = startIndex<0?0:startIndex;
        let endIndex = data.length-1;
        let showExtra = false;

        
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
                margin={{ left: 0, right: rightCanvasMargin, top: 0, bottom: 5 }}
                type={type}
                seriesName={selection.ticker}>
                
                <Chart  
                    id={1} 
                    origin={(w, h) => [0, 0]} 
                    yExtents={d => [d.high, d.low]} 
                    padding={{ top: 20, bottom: 20 }}
                    height={chartHeight}>
                    <XAxis 
                        fontSize={fontSize}
                        // ticks={20} 

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
                        fontSize={fontSize}
                        // ticks={15} 

                        axisAt="right" 
                        orient="right" 
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
                        dx={-10}
                        fill={COLOR.WHITE}
                        textFill={COLOR.BLACK}
                    />
                    <CandlestickSeries 
                        //width={timeIntervalBarWidth(intervalFunction)}

                        candleStrokeWidth={1}
                        widthRatio={0.8}
                        wickStroke={COLOR.WHITE}
                        stroke={(d)=> {
                            let diff = Math.abs(d.close-d.open);
                            if(diff<=0.01) return COLOR.YELLOW;
                            return d.close > d.open ? COLOR.GREEN_HEX : COLOR.RED
                        }}
                        fill={function fill(d) {
                            let diff = Math.abs(d.close-d.open);
                            if(diff<=0.01) return COLOR.YELLOW;
                            return d.close > d.open ? COLOR.GREEN_HEX : COLOR.RED;
                        }}
                        opacity={1}
                    />
                    
                    {indicators.map(v=>v.getRenderKeys().map(r=><LineSeries yAccessor={d=>d[r]}/>))}

                    {Array.from(new Set(buyPrices)).map((price)=> {
                        return <EdgeIndicator
                            key = {`edge-indicator-${price}`}
                            itemType="first"
                            orient="left"
                            edgeAt="left"
                            yAccessor={d=>price}
                            lineStroke={COLOR.LIMEGREEN}
                            lineStrokeWidth={1}
                            lineOpacity={1}
                            lineWidth={34}
                            rectHeight={0}
                            arrowWidth={0}
                            rectWidth={0}
                            fontSize={0}
                        />
                    })}

                    {Array.from(new Set(sellPrices)).map((price)=> {
                        return <EdgeIndicator
                            key = {`edge-indicator-${price}`}
                            itemType="first"
                            orient="left"
                            edgeAt="left"
                            yAccessor={d=>price}
                            lineStroke={COLOR.RED}
                            lineStrokeWidth={1}
                            lineOpacity={1}
                            lineWidth={34}
                            rectHeight={0}
                            arrowWidth={0}
                            rectWidth={0}
                            fontSize={0}
                        />
                    })}

                </Chart>
                
                <Chart id={2} origin={(w, h) => [0, h - chartVolumeHeight]} height={chartVolumeHeight} yExtents={d => [d.volume,0]}>
                    <YAxis 
                        fontSize={fontSize}
                        
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
                    opacity={1}
                        fill={(d) => d.close > d.open ? COLOR.GREEN_HEX : COLOR.RED} 
                        //width={timeIntervalBarWidth(intervalFunction)}
                    />
                </Chart>
                <CrossHairCursor stroke={COLOR.WHITE} opacity={0.75}/>
            </ChartCanvas>
        </React.Fragment>)
	}



}

fitWidth(ReactStockChartsWrapper) as ReactStockChartsWrapper;