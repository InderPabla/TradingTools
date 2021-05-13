//https://github.com/rrag/react-stockcharts/issues/519

import React from "react";
import { CANDLESTICK_DURATION } from '../../Common/Constant';
import './Chart.css';
import { Dropdown, DropdownButton, FormControl, InputGroup } from "react-bootstrap";
import { ChartContinousData, ChartDataSet, ChartSelection, isChartSelectionValid } from "./Commom/ChartUtils";
import { ChartDataLoader } from "../../Common/DataLoader/ChartDataLoader";
import { ReactStockChartsWrapper } from "./ReactStockChartsWrapper";
import { genUniqueKey } from "../../Common/Utils";

export interface ChartProps {
	chartKey:string;
    selection:ChartSelection;

	onTickerChanged:(chartKey:string,ticker:string)=>void;
	onTickerSelected:(chartKey:string)=>void;
	onCandleStickDurationSelected:(chartKey:string,duration:string)=>void;

	notifyErrorChartLoadingData:(sel:ChartSelection)=>void;
	notifySuccessChartLoadingData:(sel:ChartSelection)=>void;

	dataLoader:ChartDataLoader;

	initialClock:Date;
}

export interface ChartState {
	activeSelection?:ChartSelection;
	renderChartKey:string;

	activeClock:Date;
	
	completeSet:ChartDataSet;
	activeSet:ChartDataSet;
}

export class Chart extends React.Component<ChartProps,ChartState> {
	private divChartMainContent: HTMLDivElement;

	public static defaultProps = {

    };

	constructor(props:ChartProps) {
		super(props);
		this.divChartMainContent = null;
		this.state = { activeSelection:null, activeSet:null, completeSet:null, renderChartKey:genUniqueKey(), activeClock:null, };
	}

	async componentDidMount() { }

	componentWillUnmount() { }
	
	shouldComponentUpdate(nextProps: Readonly<ChartProps>, nextState: Readonly<ChartState>,nextContext: any):boolean {
		return nextProps.chartKey!==this.props.chartKey;
	}


	async componentDidUpdate(prevProps:ChartProps, prevState:ChartState) {
		if(prevProps.chartKey===this.props.chartKey) return;
		
		const { selection:curPropSel, initialClock } = this.props;
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

	public onClockUpdate(newClock:Date) {
		const { completeSet, activeSet, activeSelection, activeClock:oldClock } = this.state;
		if(!activeSet || !completeSet || !oldClock || !activeSelection) return;

		const oldClockTs = oldClock.getTime();
		const newClockTs = newClock.getTime();

		if(newClockTs<=oldClockTs) return;

		const completeSetTradingTimeIndex = completeSet.candle.findIndex(v=>v.date.getTime()>=newClockTs);
		activeSet.candle = completeSet.candle.slice(0,completeSetTradingTimeIndex)
		
		this.setState({activeClock:newClock,activeSet},()=>{
			this.forceUpdate();
		});
	}

	private async onShouldFetchSelectionData() {
		const { selection, initialClock } = this.props;
		const activeSelection = {...selection};
		const { dataLoader, notifyErrorChartLoadingData, notifySuccessChartLoadingData } = this.props;
		const tradingTimeMs = activeSelection.tradingDayTime.getTime();
		const renderChartKey = genUniqueKey();

		let activeSet:ChartDataSet = null;
		let completeSet:ChartDataSet = null;

		const loaded = await dataLoader.getData(activeSelection); 
		
		if(!loaded) {
			notifyErrorChartLoadingData(activeSelection);
		}
		else {
			completeSet = { candle:loaded };
			const completeSetTradingTimeIndex = completeSet.candle.findIndex(v=>v.date.getTime()>=tradingTimeMs);
			const activeCandle = completeSet.candle.slice(0,completeSetTradingTimeIndex);
			activeSet = { candle:activeCandle };
			notifySuccessChartLoadingData(activeSelection);
		}

		this.setState({ activeSelection, activeSet, completeSet, renderChartKey, activeClock:initialClock },()=>{
			this.forceUpdate();
		});
	}

	render() {
        const { selection, chartKey, onTickerChanged, onTickerSelected, onCandleStickDurationSelected } = this.props;
		
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
							onChange={(event)=>{onTickerChanged(chartKey,event.target.value)}}
							onKeyPress={(event)=>{if(event.code==='Enter') onTickerSelected(chartKey)}}
							defaultValue={selection.ticker} 
						/>
					</InputGroup>
					<p className="chart-id-name">{selection.chartId}</p>
                </div>
                <div ref={(ref) => this.divChartMainContent = ref} className="chart-main-content" >
					{this.renderMainChartContent()}
                </div>
            </div>
        </React.Fragment>);
	}

	private renderMainChartContent() {
		const { chartKey } = this.props;
		const { activeSet, activeSelection, renderChartKey } = this.state;

		const shouldRenderChart = activeSelection!=null && activeSelection.ticker != null && activeSelection.tradingDayTime != null 
								&& activeSelection.candlestickDuration != null && this.divChartMainContent != null 
								&& activeSet!=null && activeSet.candle!=null && activeSet.candle.length>0;

		if(!shouldRenderChart) return null;

		return (<React.Fragment key={`${renderChartKey}-${chartKey}`}>
			<ReactStockChartsWrapper 
				renderKey={renderChartKey}
				width={this.divChartMainContent.clientWidth} 
				height={this.divChartMainContent.clientHeight}
				data={activeSet}
				selection={activeSelection}
			/>
		</React.Fragment>);
	}

}
