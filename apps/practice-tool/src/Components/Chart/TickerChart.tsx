//https://github.com/rrag/react-stockcharts/issues/519

import React from "react";
import { scaleTime } from "d3-scale";
import { format } from "d3-format";
import { timeFormat } from "d3-time-format";
import { ChartCanvas, Chart } from "react-stockcharts";
import { CandlestickSeries, BarSeries, LineSeries } from "react-stockcharts/lib/series";
import { XAxis, YAxis } from "react-stockcharts/lib/axes";
import { last, timeIntervalBarWidth } from "react-stockcharts/lib/utils";
import { lastVisibleItemBasedZoomAnchor } from "react-stockcharts/lib/utils/zoomBehavior"
import { candlestickTimeToD3Time} from "../../Common/Utils";
import { ema, wma, sma, tma } from "react-stockcharts/lib/indicator";
import { EdgeIndicator } from "react-stockcharts/lib/coordinates";
import { COLOR } from "../../Common/ColorConst";
import { Button } from "react-bootstrap";

import './Chart.css';

export interface CandleStickData {
	date:Date,
	open:number,
	high:number,
	low:number,
	close:number,
	volume:number,
	count:number,
	vwap:number,
}
  
export interface CandleStickChartProps {
	type?:string;
	height:number;
	width:number;
	data:CandleStickData[],
	ratio?:number
	ticker:string,
	candlestickDuration:string,

	preMarketOpen:number,
    preMarketHigh:number,
    preMarketLow:number,

	uniqueKey:string,
}

export interface CandleStickChartState {
	panEvent:boolean
}

export class CandleStickChart extends React.Component<CandleStickChartProps,CandleStickChartState> {
	public static defaultProps = {
        type: "svg",
		preMarketOpen:-1,
		preMarketHigh:-1,
		preMarketLow:-1,
    };

	private canvasChartRef:ChartCanvas;

	constructor(props:CandleStickChartProps) {
		super(props);
		this.state = { 
			panEvent:false
		};

		this.keyDownEvent = this.keyDownEvent.bind(this);
		this.keyUpEvent = this.keyUpEvent.bind(this);
	}

	componentDidMount() {
		window.addEventListener("keydown", this.keyDownEvent, false);
		window.addEventListener("keyup", this.keyUpEvent, false);
	}
	
	componentWillUnmount() {
		window.removeEventListener("keydown", this.keyDownEvent, false);
		window.removeEventListener("keyup", this.keyUpEvent, false);
	}

	
	shouldComponentUpdate(nextProps: Readonly<CandleStickChartProps>, nextState: Readonly<CandleStickChartState>,nextContext: any):boolean {
		return nextProps.uniqueKey!==this.props.uniqueKey;
	}

	keyDownEvent (event) {
		if(event.code==='KeyX' && !this.state.panEvent) {
			this.setState({panEvent:true});
		}
	}

	keyUpEvent (event) {
		if(event.code==='KeyX' && this.state.panEvent) {
			this.setState({panEvent:false});
		}
	}

	resetYDomain = ()=> {
		if(this.canvasChartRef) {
			this.canvasChartRef.resetYDomain();
		}
	}
	
	render() {
		const { data,ticker } = this.props;
		if(data.length>0) return this.renderChart();
		return null;

		return (
			<div className="candlestick-chart-container">
				<div className="candlestick-chart-header">
					<h2>{ticker}</h2>
				</div>
				<div className="candlestick-chart-main">
					{data.length>0 && this.renderChart()}
					{data.length===0 && <h2>No Data</h2>}
				</div>
				<div className="candlestick-chart-footer">
					<h2>Footer</h2>
				</div>
			</div>
			
		);
	}

	renderChart() {
		const { type, width, data:initialData, ratio, ticker, candlestickDuration
		       ,preMarketOpen, preMarketLow, preMarketHigh, height} = this.props;

		const xDateAccessor = d => d.date;
		const closeAccessor = d => d.close;
		const openAccessor = d => d.open;

		const xExtents = [
			xDateAccessor(last(initialData)),
			xDateAccessor(initialData[initialData.length<100?0:initialData.length - 100])
		];

		const intervalFunction = candlestickTimeToD3Time(candlestickDuration);
		/* Accessor: ƒ (d) {return d.ema20;} */


		//https://rrag.github.io/react-stockcharts/documentation.html#/zoom_and_pan
		//Fork with zoomAnchor: https://github.com/reactivemarkets/react-financial-charts/blob/master/packages/stories/src/features/StockChart.tsx

		// const totalChartHeight = 600;
		// const chartHeight = totalChartHeight-200;
		// const chartVolumeHeight = 150;
		// const chartWidth = this.state.width-120;

		const totalChartHeight = height;
		const chartHeight = height*0.7;
		const chartVolumeHeight = height*0.25;
		const chartWidth = width;

		return (<React.Fragment>
			<ChartCanvas 
				ref={(ref) => this.canvasChartRef = ref}
				panEvent={this.state.panEvent}
				height={totalChartHeight}
				ratio={1}
				width={chartWidth}
				// margin={{ left: 0, right: 60, top: 10, bottom: 20 }}
				margin={{ left: 0, right: 40, top: 0, bottom: 5 }}
				// padding={{ left: 0, right: 0, top: 0, bottom: 0 }}
				type={type}
				seriesName={ticker}
				data={initialData}
				xAccessor={xDateAccessor}
				xScale={scaleTime()}
				displayXAccessor={xDateAccessor}
				//xExtents={xExtents}
				
				zoomAnchor={lastVisibleItemBasedZoomAnchor}

				onLoadMore={(start:Date,end:Date)=> {}}
				onSelect={(event:Object)=>{}}>
				

				<Chart id={1} origin={(w, h) => [0, 0]} yExtents={d => [d.high+0.25, d.low-0.25]} height={chartHeight}>
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
					
					<LineSeries yAccessor={d=>d.vwap}/>
					
					{preMarketOpen>-1 && <EdgeIndicator
						key = {`edge-indicator-${preMarketOpen}`}
						itemType="first"
						orient="left"
						edgeAt="left"
						yAccessor={d=>preMarketOpen}
						lineStroke={COLOR.LIMEGREEN}
						lineStrokeWidth={2}
						lineOpacity={1}
						lineWidth={34}
						rectHeight={0}
						arrowWidth={0}
						rectWidth={0}
						fontSize={0}
					/>}

					{preMarketLow>-1 && <EdgeIndicator
						key = {`edge-indicator-${preMarketLow}`}
						itemType="first"
						orient="left"
						edgeAt="left"
						yAccessor={d=>preMarketLow}
						lineStroke={COLOR.RED}
						lineStrokeWidth={1}
						lineOpacity={1}
						lineWidth={34}
						rectHeight={0}
						arrowWidth={0}
						rectWidth={0}
						fontSize={0}
					/>}

					{preMarketHigh>-1 && <EdgeIndicator
						key = {`edge-indicator-${preMarketHigh}`}
						itemType="first"
						orient="left"
						edgeAt="left"
						yAccessor={d=>preMarketHigh}
						lineStroke={COLOR.BLUE}
						lineStrokeWidth={1}
						lineOpacity={1}
						lineWidth={34}
						rectHeight={0}
						arrowWidth={0}
						rectWidth={0}
						fontSize={0}
					/>}
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
			{/* <div className="candlestick-chart-action">
				<Button variant="primary" onClick={this.resetYDomain} size={"sm"}>Reset Y Domain</Button>{' '}
			</div>			 */}
		</React.Fragment>);
	}
}
