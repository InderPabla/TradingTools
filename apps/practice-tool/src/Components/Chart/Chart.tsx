//https://github.com/rrag/react-stockcharts/issues/519

import React from "react";
import { CANDLESTICK_DURATION } from '../../Common/Constant';
import './Chart.css';
import { Dropdown, DropdownButton, FormControl, InputGroup, Button } from "react-bootstrap";
import { ChartContinousData, ChartSelection, isChartSelectionValid } from "./Commom/ChartUtils";
import { ChartDataLoader } from "../../Common/DataLoader/ChartDataLoader";
import {ReactStockChartsWrapper} from "./ReactStockChartsWrapper";
import { genUniqueKey } from "../../Common/Utils";
import { AggregatedTradeLog, ChartOrchestrator, TradeLog, TradingActionType } from './Commom/ChartOrchestrator';
import { ChartSet } from "./Commom/ChartSet";
import e from "cors";

export interface ChartProps {
	chartKey:string;
    selection:ChartSelection;

	onTickerChanged:(chartKey:string,ticker:string)=>void;
	onTickerSelected:(chartKey:string)=>void;
	onCandleStickDurationSelected:(chartKey:string,duration:string)=>void;

	notifyErrorChartLoadingData:(sel:ChartSelection)=>void;
	notifySuccessChartLoadingData:(sel:ChartSelection)=>void;

	sell:(log:TradeLog)=>void;
	buy:(log:TradeLog)=>void;

	isClockRunning:boolean;
	initialActiveClock:Date;
	dataLoader:ChartDataLoader;

	logs:TradeLog[]
}

export interface ChartState {
	activeSelection?:ChartSelection;
	activeClock:Date;
	orch:ChartOrchestrator;
	aggLogs:AggregatedTradeLog;
}

export class Chart extends React.Component<ChartProps,ChartState> {
	private divChartMainContent: HTMLDivElement;

	public static defaultProps = {

    };

	constructor(props:ChartProps) {
		super(props);
		this.divChartMainContent = null;
		this.state = { activeSelection:null, orch:null, activeClock:null, aggLogs:null };
	}

	async componentDidMount() { }

	componentWillUnmount() { }
	
	shouldComponentUpdate(nextProps: Readonly<ChartProps>, nextState: Readonly<ChartState>):boolean {
		return nextProps.chartKey!==this.props.chartKey;
	}

	async componentDidUpdate(prevProps:ChartProps, prevState:ChartState) {
		if(prevProps.chartKey===this.props.chartKey) return;
		
		const { selection:curPropSel } = this.props;
		const { activeSelection:curActiveSel } = this.state;

		function _shouldFetchSelectionData():boolean {
			if(!isChartSelectionValid(curPropSel)) return false;
			return curActiveSel==null 
				|| curActiveSel.candlestickDuration!==curPropSel.candlestickDuration 
				|| curActiveSel.ticker!==curPropSel.ticker 
				|| curActiveSel.tradingDayTime.getTime()!==curPropSel.tradingDayTime.getTime();
		}
		
		if(_shouldFetchSelectionData()) await this.onShouldFetchSelectionData();
	}

	private async onShouldFetchSelectionData() {
		const { selection, initialActiveClock } = this.props;
		const activeSelection = {...selection};
		const { dataLoader, notifyErrorChartLoadingData, notifySuccessChartLoadingData } = this.props;
		let orch:ChartOrchestrator = null;

		const completeSetData = await dataLoader.getData(activeSelection); 
		const realtimeSetData = await dataLoader.getData({...activeSelection,candlestickDuration:CANDLESTICK_DURATION.SEC_5});

		if(!completeSetData) {
			notifyErrorChartLoadingData(activeSelection);
		}
		else {
			//initilize ChartOrchestrator
			orch = new ChartOrchestrator(activeSelection.ticker,initialActiveClock,completeSetData,realtimeSetData);
			notifySuccessChartLoadingData(activeSelection);
		}

		this.setState({ activeSelection, orch, activeClock:new Date(initialActiveClock) },()=>{
			this.forceUpdate();
		});
	}

	public onClockUpdate(newTime:Date) {
		const { orch, activeSelection, activeClock:oldTime } = this.state;
		if(!orch || !oldTime || !activeSelection) return;

		const oldTimeTs = oldTime.getTime();
		const newTimeTs = newTime.getTime();

		if(newTimeTs<=oldTimeTs) return;

		orch.update(newTime);

		this.aggregatedTradeLog();
		this.setState({activeClock:newTime},()=>{
			this.forceUpdate();
		});
	}

	private isChartActive():boolean {
		const { activeSelection, orch } = this.state;

		return isChartSelectionValid(activeSelection) !=null
			&& this.divChartMainContent != null
			&& orch!=null;
	}

	private buy(quantity:number) {
		let candle = this.state.orch.getCurrentCandle();
		this.props.buy({ticker:this.props.selection.ticker,
						action:'BUY',
						quantity,
						price:candle.close,
						date:candle.date});
	}

	private sell(quantity:number) {
		let candle = this.state.orch.getCurrentCandle();
		this.props.sell({ticker:this.props.selection.ticker,
			action:'SELL',
			quantity,
			price:candle.close,
			date:candle.date});
	}


	// export interface TradeLog {
	// 	ticker:string;
	// 	price:number;
	// 	action:TradingActionType;
	// 	quantity:number;
	// 	date:Date;
	// }

	/**
	 * $100 BUY 100
	 * AO:100, TOP: $100, TP: $100
	 * 
	 * 
	 * 
	 * 
	 * @returns 
	 */
	public aggregatedTradeLog() {
		let { logs } = this.props;
		let { orch } = this.state;
		if(!orch) return;
		
		let actionQuantity = (log:TradeLog)=>(log.action==='SELL'?-1:1)*log.quantity;
		let basePrice = (oldPrice:number,newPrice:number,oldOpen:number,newOpen:number) => (Math.abs(oldOpen)*oldPrice + Math.abs(newOpen)*newPrice)/(Math.abs(newOpen)+Math.abs(oldOpen));
		let calcProfit = (closeOnType:TradingActionType,closeQuantity:number,oldPrice:number,newPrice:number)=>(closeOnType==='SELL'?-1:1)*Math.abs(closeQuantity)*(newPrice-oldPrice);

		let currentPrice = orch.getCurrentPrice() 
		let currentProfits = 0;
		let currentOpen = 0;
		currentOpen = logs.reduce((pr,cr)=>pr+actionQuantity(cr),0);

		let activeOpen:number;
		let baseTradePrice:number;

		for(let i = 0; i < logs.length; i++) {
			let log = logs[i];

			let newOpen = actionQuantity(log);
			let newPrice = log.price;
			
			if(i===0 || activeOpen === 0) {
				activeOpen = actionQuantity(log);
				baseTradePrice = newPrice;
			}
			else if(activeOpen!=0){
				let updatedOpen = newOpen + activeOpen;
				
				//In long, adding to long
				if(activeOpen > 0 && updatedOpen > activeOpen) {
					baseTradePrice = basePrice(baseTradePrice,newPrice,activeOpen,newOpen);
				}
				//In long, closing position by adding short
				else if(activeOpen > 0 && updatedOpen < activeOpen) {
					//Overall position still long
					if(updatedOpen>=0) {
						currentProfits += calcProfit('BUY',newOpen,baseTradePrice,newPrice);
					}
					//Overall position switched to short
					else {
						currentProfits += calcProfit('BUY',activeOpen,baseTradePrice,newPrice);
						baseTradePrice = newPrice;
					}
				}
				//In short, adding to short
				else if(activeOpen < 0 && updatedOpen < activeOpen) {
					baseTradePrice = basePrice(baseTradePrice,newPrice,activeOpen,newOpen);
				}
				//In short, closing position by adding long
				else if(activeOpen < 0 && updatedOpen > activeOpen) {
					//Overall position still short
					if(updatedOpen<=0) {
						currentProfits += calcProfit('SELL',newOpen,baseTradePrice,newPrice);
					}
					//Overall position switched to long
					else {
						currentProfits += calcProfit('SELL',activeOpen,baseTradePrice,newPrice);
						baseTradePrice = newPrice;
					}
				}

				activeOpen = updatedOpen;
			}

			//Last bit is still in a trade currently
			if(i===logs.length-1 && activeOpen!=0) {
				currentProfits += activeOpen*(currentPrice-baseTradePrice);
			}

			//console.log(i,newOpen,newPrice,"::::",activeOpen,currentProfits)
		}

		

		
		this.setState({aggLogs:{currentProfits:parseFloat(currentProfits.toFixed(2)),currentOpen,currentPrice}});
	}

	render() {
        const { selection, chartKey, onTickerChanged, onTickerSelected, onCandleStickDurationSelected } = this.props;
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
						onClick={()=>{this.buy(300)}}
						disabled={!_isChartActive}>300</Button>
					<Button 
						className="chart-trade-button chart-sell-button" 
						variant="primary" 
						size="sm"
						onClick={()=>{this.sell(300)}}
						disabled={!_isChartActive}>-300</Button>

					<Button 
						className="chart-trade-button chart-buy-button" 
						variant="primary" 
						size="sm"
						onClick={()=>{this.buy(200)}}
						disabled={!_isChartActive}>200</Button>
					<Button 
						className="chart-trade-button chart-sell-button" 
						variant="primary" 
						size="sm"
						onClick={()=>{this.sell(200)}}
						disabled={!_isChartActive}>-200</Button>

					<Button 
						className="chart-trade-button chart-buy-button" 
						variant="primary" 
						size="sm"
						onClick={()=>{this.buy(100)}}
						disabled={!_isChartActive}>100</Button>
					<Button 
						className="chart-trade-button chart-sell-button" 
						variant="primary" 
						size="sm"
						onClick={()=>{this.sell(100)}}
						disabled={!_isChartActive}>-100</Button>	

					{this.state.aggLogs && <p className="chart-id-name">Profits: {this.state.aggLogs.currentProfits}, Open:{this.state.aggLogs.currentOpen}</p>}
					<p className="chart-id-name">{selection.chartId}</p>
                </div>

				<div ref={(ref) => this.divChartMainContent = ref} className="chart-main-content" >
					{this.renderMainChartContent()}
                </div>
            </div>
        </React.Fragment>);
	}

	private renderMainChartContent() {
		const { chartKey, logs } = this.props;
		const { orch, activeSelection } = this.state;

		const shouldRenderChart = isChartSelectionValid(activeSelection) != null 
								&& this.divChartMainContent != null && orch!=null;

		if(!shouldRenderChart) return null;

		const activeSet = orch.getActiveSet();

		
		return (<React.Fragment>
			<ReactStockChartsWrapper 
				width={this.divChartMainContent.clientWidth} 
				height={this.divChartMainContent.clientHeight}
				data={activeSet.getCandles()}
				selection={activeSelection}
				buyPrices={logs.filter(v=>v.action==='BUY').map(v=>v.price)}
				sellPrices={logs.filter(v=>v.action==='SELL').map(v=>v.price)}
			/>
		</React.Fragment>);
	}

}
