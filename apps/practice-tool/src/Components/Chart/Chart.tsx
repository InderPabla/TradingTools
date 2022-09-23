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

const SHARE_SIZES = ["1","5","10","20","50","100","200","300","500","1000"];

export interface ChartProps {
	chartKey:string;
    selection:ChartSelection;
	orch:ChartOrchestrator;
	tradingClock:CommonTradingClock;
	logs:TradeLog[];
	aggLog:AggregatedTradeLog;
	markedPrices:number[];
	buyPrices:number[];
	sellPrices:number[];
	onTickerChanged:(chartKey:string,ticker:string)=>void;
	onTickerSelected:(chartKey:string)=>void;
	onCandleStickDurationSelected:(chartKey:string,duration:string)=>void;
	onChartDataLoad:(chartKey:string)=>Promise<void>;
	tradeEvent:(ticker:string,quantity:number,orch:ChartOrchestrator)=>void;
	viewOrderHistory:(ticker:string)=>void;
	onPriceClicked:(ticker:string,price:number,clickType:"MARK"|"BUY"|"SELL",callback:Function)=>void;
}

export interface ChartState {
	showTradeMarkers:boolean;
	shareSize:number;
}

export class Chart extends React.Component<ChartProps,ChartState> {
	private divChartMainContent: HTMLDivElement;

	public static defaultProps = {

    };

	constructor(props:ChartProps) {
		super(props);
		this.divChartMainContent = null;
		this.state = { showTradeMarkers:true,shareSize:50 };
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
		this.props.tradeEvent(this.props.selection.ticker,quantity,this.props.orch);
	}

	private buyEvent() {
		this.tradeEvent(this.state.shareSize);
	}

	private sellEvent() {
		this.tradeEvent(this.state.shareSize*-1);
	}

	private toggleShowTradeMarkers() {
		this.setState({showTradeMarkers:!this.state.showTradeMarkers});
	}

	private viewOrderHistory() {
		const {viewOrderHistory,selection} = this.props;
		viewOrderHistory(selection.ticker);
	}

	private onShareSizeChanged(_shareSize:string) {
		if(_shareSize)
			this.setState({shareSize:parseInt(_shareSize)});
	}

	render() {
        const { selection, chartKey, onTickerChanged, onTickerSelected, onCandleStickDurationSelected, aggLog, buyPrices, sellPrices } = this.props;
		const { shareSize } = this.state;
		const _isChartActive = this.isChartActive();
        const candlestickDurationTitle = selection.candlestickDuration || 'Duration';
		const chartDivId = `${chartKey}-duration-dropdown`;
		const  viewOrderDisabled:boolean = !_isChartActive || (buyPrices.length + sellPrices.length) == 0

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
								if(event.code==='Enter' || event.key==='Enter') 
									onTickerSelected(chartKey)
							}}
							defaultValue={selection.ticker} 
						/>
					</InputGroup>
					<Button 
						className="chart-trade-button chart-buy-button" 
						variant="primary" 
						size="sm"
						onClick={()=>{this.buyEvent()}}
						disabled={!_isChartActive}>Buy</Button>
					<Button 
						className="chart-trade-button chart-sell-button" 
						variant="primary" 
						size="sm"
						onClick={()=>{this.sellEvent()}}
						disabled={!_isChartActive}>Sell</Button>
					<DropdownButton 
						id={chartDivId} 
						title={shareSize.toString()} 
						size="sm"
						onSelect={(_size)=>{this.onShareSizeChanged(_size)}}>
						{SHARE_SIZES.map((_size)=> {
							return <Dropdown.Item 
										key={`${chartDivId}-${_size}`}
										eventKey={_size}>{_size}</Dropdown.Item>;
						})}
					</DropdownButton>
					<Button 
						className="chart-trade-button chart-show-trades-button" 
						variant="primary" 
						size="sm"
						onClick={()=>{this.toggleShowTradeMarkers()}}
						disabled={!_isChartActive}><span className="fa fa-eye"/> T</Button>	
					<Button 
						className="chart-trade-button chart-show-orders-button" 
						variant="primary" 
						size="sm"
						onClick={()=>{this.viewOrderHistory()}}
						disabled={viewOrderDisabled}><span className="fa fa-gavel"/> O</Button>	

					{aggLog && <p className="chart-id-name">{this.displayProfit(aggLog.currentProfits,aggLog.commissions)}, {this.displayOpen(aggLog.currentOpen)}</p>}
					{/* <p className="chart-id-name">{selection.chartId}</p> */}
                </div>

				<div ref={(ref) => this.divChartMainContent = ref} className="chart-main-content" >
					{this.renderMainChartContent()}
                </div>
            </div>
        </React.Fragment>);
	}

	private onPriceClicked = (price:number,clickType:"MARK"|"BUY"|"SELL") => {
		const roundedPrice = parseFloat(price.toFixed(2));
		this.props.onPriceClicked(this.props.selection.ticker,roundedPrice,clickType,()=>{
			this.setState({},()=>{
				this.forceUpdate();
			});
		});
	}

	private displayProfit(profit:number,commission:number) {
		const truePnL = profit-commission;
		let style = truePnL<0?{color:"red"}:{color:"limegreen"};
		return <span style={style}>P&L: {truePnL.toFixed(2)}, Com: {commission}</span>
	}

	private displayOpen(open:number) {
		let style = open<0?{color:"red"}:{color:"limegreen"};
		return <span style={style}>Open: {open}</span>
	}

 	private renderMainChartContent() {
		const { chartKey, logs, orch, selection, markedPrices, buyPrices, sellPrices } = this.props;

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
				markedPrices={markedPrices}
				buyPrices={buyPrices}
				sellPrices={sellPrices}
				onPriceClicked={this.onPriceClicked}
			/>
		</React.Fragment>);
	}

}
