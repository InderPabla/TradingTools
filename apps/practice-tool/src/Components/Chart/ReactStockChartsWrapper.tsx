//https://github.com/rrag/react-stockcharts/issues/519

import React from "react";
import { ChartDataSet, ChartSelection } from "./Commom/ChartUtils";
import { scaleTime } from "d3-scale";
import { format } from "d3-format";
import { timeFormat } from "d3-time-format";
import { ChartCanvas, Chart } from "react-stockcharts";
import { CandlestickSeries, BarSeries } from "react-stockcharts/lib/series";
import { XAxis, YAxis } from "react-stockcharts/lib/axes";
import { last, timeIntervalBarWidth } from "react-stockcharts/lib/utils";
import { lastVisibleItemBasedZoomAnchor } from "react-stockcharts/lib/utils/zoomBehavior"
import { candlestickTimeToD3Time} from "../../Common/Utils";
import { EdgeIndicator } from "react-stockcharts/lib/coordinates";
import { discontinuousTimeScaleProvider } from "react-stockcharts/lib/scale";
import { COLOR } from "../../Common/ColorConst";
import { min as d3Min, max as d3Max } from 'd3-array';

export interface ReactStockChartsWrapperProps {
    renderKey:string;

    width:number;
    height:number;

    selection:ChartSelection;
    data:ChartDataSet;

    type?:string;
}

export interface ReactStockChartsWrapperState {
    panEvent:boolean;
}

export class ReactStockChartsWrapper extends React.Component<ReactStockChartsWrapperProps,ReactStockChartsWrapperState> {

	public static defaultProps = {
        type: "svg",
    };

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

	render() {
        const { panEvent } = this.state;
        const { width, height, data, selection, type, renderKey} = this.props;
        const xDateAccessor = d => d.date;

		const intervalFunction = candlestickTimeToD3Time(selection.candlestickDuration);

		const totalChartHeight = height;
		const chartHeight = height*0.7;
		const chartVolumeHeight = height*0.25;
		const chartWidth = width;

        

		return (
        <React.Fragment key={renderKey}>
            <ChartCanvas 
                panEvent={panEvent}
                clamp={false}
                zoomAnchor={lastVisibleItemBasedZoomAnchor}

                //xExtents={[d3Min, this.dateD3MaxPlusPadding]}
                    //new Date(data.candle[data.candle.length-1].date.getTime()+(1000*5*60))

                height={totalChartHeight}
                ratio={1}
                width={chartWidth}
                margin={{ left: 0, right: 40, top: 0, bottom: 5 }}
                type={type}
                seriesName={selection.ticker}
                data={data.candle}
                xAccessor={xDateAccessor}
                xScale={scaleTime()}
                displayXAccessor={xDateAccessor}
                xScaleProvider={discontinuousTimeScaleProvider}>
                    
                <Chart  
                    id={1} 
                    origin={(w, h) => [0, 0]} 
                    yExtents={d => [d.high, d.low]} 
                    padding={{ top: 20, bottom: 20 }}
                    
                    height={chartHeight}>
                    <XAxis 
                        axisAt="bottom" 
                        orient="bottom"
                        ticks={10} 
                        innerTickSize={chartHeight*-1} 
                        tickStrokeOpacity={0.2}
                        tickStroke={COLOR.WHITE}
                        tickFormat={timeFormat("%H:%M")}
                        
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

                    <CandlestickSeries 
                        width={timeIntervalBarWidth(intervalFunction)}
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
                    <BarSeries yAccessor={d => d.volume} 
                        fill={(d) => d.close > d.open ? COLOR.LIMEGREEN : COLOR.RED} 
                        width={timeIntervalBarWidth(intervalFunction)}
                    />
                </Chart>
                
            </ChartCanvas>
        </React.Fragment>)
	}



}
