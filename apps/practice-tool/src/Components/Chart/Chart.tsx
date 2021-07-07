//https://github.com/rrag/react-stockcharts/issues/519

import React from "react";
import { CANDLESTICK_DURATION } from '../../Common/Constant';
import './Chart.css';
import { Dropdown, DropdownButton, FormControl, InputGroup, Button } from "react-bootstrap";
import { aggregatedTradeLogs, ChartSelection, isChartSelectionValid } from "./Commom/ChartUtils";
import { ChartDataLoader } from "../../Common/DataLoader/ChartDataLoader";
import {ReactStockChartsWrapper} from "./ReactStockChartsWrapper";
import { candlestickTimeToSeconds, genUniqueKey } from "../../Common/Utils";
import { AggregatedTradeLog, ChartOrchestrator, TradeLog } from './Commom/ChartOrchestrator';
import { ChartSet } from "./Commom/ChartSet";
import { CommonTradingClock } from "../../Common/TradingClock/CommonTradingClock";

export interface ChartProps {
	chartKey:string;
    selection:ChartSelection;
	orch:ChartOrchestrator;
	tradingClock:CommonTradingClock;
	logs:TradeLog[];
	aggLog:AggregatedTradeLog;

	onTickerChanged:(chartKey:string,ticker:string)=>void;
	onTickerSelected:(chartKey:string)=>void;
	onCandleStickDurationSelected:(chartKey:string,duration:string)=>void;
	onChartDataLoad:(chartKey:string)=>Promise<void>;
	tradeEvent:(log:TradeLog)=>void;
}

export interface ChartState {
	showTradeMarkers:boolean;
}

export class Chart extends React.Component<ChartProps,ChartState> {
	private divChartMainContent: HTMLDivElement;

	public static defaultProps = {

    };

	constructor(props:ChartProps) {
		super(props);
		this.divChartMainContent = null;
		this.state = { showTradeMarkers:true };
	}

	async componentDidMount() { }

	componentWillUnmount() { }
	
	shouldComponentUpdate(nextProps: Readonly<ChartProps>, nextState: Readonly<ChartState>):boolean {
		return nextProps.chartKey!==this.props.chartKey;
	}

	async componentDidUpdate(prevProps:ChartProps, prevState:ChartState) {
		if(prevProps.chartKey===this.props.chartKey) return;
		const { selection:curPropSel, orch } = this.props;
		const curActiveSel = orch?orch.getActiveSelection():null;
		function _shouldFetchSelectionData():boolean {
			if(!isChartSelectionValid(curPropSel)) return false;
			return curActiveSel==null 
				|| orch == null
				|| curActiveSel.candlestickDuration!==curPropSel.candlestickDuration 
				|| curActiveSel.ticker!==curPropSel.ticker
		}
		if(_shouldFetchSelectionData()) await this.onFetchSelectionData();
	}

	private async onFetchSelectionData() {
		await this.props.onChartDataLoad(this.props.chartKey);	
	}

	public onClockUpdate(aggLog:AggregatedTradeLog) {
		if(!this.isChartActive()) return;
		const {orch,logs} = this.props; 

		//this.aggregatedTradeLog();
		// let aggLog = orch?aggregatedTradeLogs(ChartOrchestrator.getCurrentPrice(orch.getActiveSelection().ticker),logs):null;

		this.setState({},()=>{
			this.forceUpdate();
		});
	}

	private isChartActive():boolean {
		const { orch } = this.props;
		const activeSelection = orch?orch.getActiveSelection():null;
		return isChartSelectionValid(activeSelection) !=null
			&& this.divChartMainContent != null
			&& orch!=null;
	}

	private tradeEvent(quantity:number) {
		let candle = this.props.orch.getCurrentCandle();
		this.props.tradeEvent({ticker:this.props.selection.ticker,
						quantity,
						price:candle.close,
						date:candle.date});
	}


	private toggleShowTradeMarkers() {
		this.setState({showTradeMarkers:!this.state.showTradeMarkers});
	}

	render() {
        const { selection, chartKey, onTickerChanged, onTickerSelected, onCandleStickDurationSelected, aggLog } = this.props;
		const _isChartActive = this.isChartActive();
        let candlestickDurationTitle = selection.candlestickDuration || 'Duration';
		const chartDivId = `${chartKey}-duration-dropdown`;
		
		return (<React.Fragment key={`fragment-chart-${chartKey}`}>
            <div className="chart-container">
                <div className="chart-topbar">
					<DropdownButton 
						id={chartDivId} 
						title={candlestickDurationTitle} 
						size="sm"
						onSelect={(_duration)=>{onCandleStickDurationSelected(chartKey,_duration as string)}}>
						{Object.keys(CANDLESTICK_DURATION).map((_duration)=> {
							return <Dropdown.Item 
										key={`${chartDivId}-${_duration}`}
										eventKey={_duration}>{_duration}</Dropdown.Item>;
						})}
					</DropdownButton>
					<InputGroup>
						<FormControl 
							className="chart-ticker-form-control"
							placeholder="" 
							onKeyUp={(event)=> {
								event.stopPropagation();
								event.nativeEvent.stopImmediatePropagation();
							}}
							onChange={(event)=>{
								onTickerChanged(chartKey,event.target.value)
							}}
							onKeyPress={(event)=>{
								if(event.code==='Enter') onTickerSelected(chartKey)
							}}
							defaultValue={selection.ticker} 
						/>
					</InputGroup>
					<Button 
						className="chart-trade-button chart-buy-button" 
						variant="primary" 
						size="sm"
						onClick={()=>{this.tradeEvent(300)}}
						disabled={!_isChartActive}>300</Button>
					<Button 
						className="chart-trade-button chart-sell-button" 
						variant="primary" 
						size="sm"
						onClick={()=>{this.tradeEvent(-300)}}
						disabled={!_isChartActive}>-300</Button>

					<Button 
						className="chart-trade-button chart-buy-button" 
						variant="primary" 
						size="sm"
						onClick={()=>{this.tradeEvent(200)}}
						disabled={!_isChartActive}>200</Button>
					<Button 
						className="chart-trade-button chart-sell-button" 
						variant="primary" 
						size="sm"
						onClick={()=>{this.tradeEvent(-200)}}
						disabled={!_isChartActive}>-200</Button>

					<Button 
						className="chart-trade-button chart-buy-button" 
						variant="primary" 
						size="sm"
						onClick={()=>{this.tradeEvent(100)}}
						disabled={!_isChartActive}>100</Button>
					<Button 
						className="chart-trade-button chart-sell-button" 
						variant="primary" 
						size="sm"
						onClick={()=>{this.tradeEvent(-100)}}
						disabled={!_isChartActive}>-100</Button>	
					<Button 
						className="chart-trade-button chart-show-trades-button" 
						variant="primary" 
						size="sm"
						onClick={()=>{this.toggleShowTradeMarkers()}}
						disabled={!_isChartActive}><span className="fa fa-eye"/> T</Button>	

					{aggLog && <p className="chart-id-name">{this.displayProfit(aggLog.currentProfits)}, {this.displayOpen(aggLog.currentOpen)}</p>}
					{/* <p className="chart-id-name">{selection.chartId}</p> */}
                </div>

				<div ref={(ref) => this.divChartMainContent = ref} className="chart-main-content" >
					{this.renderMainChartContent()}
                </div>
            </div>
        </React.Fragment>);
	}

	private displayProfit(profit:number) {
		let style = profit<0?{color:"red"}:{color:"limegreen"};
		return <span style={style}>Profits: {profit.toFixed(2)}</span>
	}

	private displayOpen(open:number) {
		let style = open<0?{color:"red"}:{color:"limegreen"};
		return <span style={style}>Open: {open}</span>
	}

 	private renderMainChartContent() {
		const { chartKey, logs, orch, selection } = this.props;

		const shouldRenderChart = isChartSelectionValid(selection) 
								&& this.divChartMainContent != null && orch!=null;

		if(!shouldRenderChart) return null;

		const activeSet = orch.getActiveSet();
		const candles = activeSet.getCandles();

		return (<React.Fragment>
			<ReactStockChartsWrapper 
				width={this.divChartMainContent.clientWidth} 
				height={this.divChartMainContent.clientHeight}
				data={candles}
				indicators={activeSet.getIndicators()}
				selection={selection}
				showTradeMarkers={this.state.showTradeMarkers}
				buyPrices={[]}
				sellPrices={[]}
			/>
		</React.Fragment>);
	}

}
