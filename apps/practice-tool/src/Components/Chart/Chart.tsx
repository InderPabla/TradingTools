//https://github.com/rrag/react-stockcharts/issues/519

import React from "react";
import { CANDLESTICK_DURATION } from '../../Common/Constant';
import './Chart.css';
import { Dropdown, DropdownButton, FormControl, InputGroup } from "react-bootstrap";
import { ChartContinousData, ChartSelection, isChartSelectionValid } from "./Commom/ChartUtils";
import { ChartDataLoader } from "../../Common/DataLoader/ChartDataLoader";
import ReactStockChartsWrapper from "./ReactStockChartsWrapper";
import { genUniqueKey } from "../../Common/Utils";
import { ChartOrchestrator } from './Commom/ChartOrchestrator';
import { ChartSet } from "./Commom/ChartSet";

export interface ChartProps {
	chartKey:string;
    selection:ChartSelection;

	onTickerChanged:(chartKey:string,ticker:string)=>void;
	onTickerSelected:(chartKey:string)=>void;
	onCandleStickDurationSelected:(chartKey:string,duration:string)=>void;

	notifyErrorChartLoadingData:(sel:ChartSelection)=>void;
	notifySuccessChartLoadingData:(sel:ChartSelection)=>void;

	dataLoader:ChartDataLoader;
}

export interface ChartState {
	activeSelection?:ChartSelection;
	activeClock:Date;
	orch:ChartOrchestrator;
}

export class Chart extends React.Component<ChartProps,ChartState> {
	private divChartMainContent: HTMLDivElement;

	public static defaultProps = {

    };

	constructor(props:ChartProps) {
		super(props);
		this.divChartMainContent = null;
		this.state = { activeSelection:null, orch:null, activeClock:null, };
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
		const { selection } = this.props;
		const activeSelection = {...selection};
		const { dataLoader, notifyErrorChartLoadingData, notifySuccessChartLoadingData } = this.props;
		const renderChartKey = genUniqueKey();
		let orch:ChartOrchestrator = null;

		const completeSetData = await dataLoader.getData(activeSelection); 
		const realtimeSetData = await dataLoader.getData({...activeSelection,candlestickDuration:CANDLESTICK_DURATION.SEC_5});

		if(!completeSetData) {
			notifyErrorChartLoadingData(activeSelection);
		}
		else {
			orch = new ChartOrchestrator(activeSelection.tradingDayTime,completeSetData,realtimeSetData);
			notifySuccessChartLoadingData(activeSelection);
		}

		this.setState({ activeSelection, orch, activeClock:new Date(activeSelection.tradingDayTime) },()=>{
			this.forceUpdate();
		});
	}

	public onClockUpdate(newTime:Date) {
		const { orch, activeSelection, activeClock:oldTime } = this.state;
		if(!orch || !oldTime || !activeSelection) return;

		const oldTimeTs = oldTime.getTime();
		const newTimeTs = newTime.getTime();

		if(newTimeTs<=oldTimeTs) return;

		const renderChartKey = genUniqueKey();
		orch.update(newTime);

		this.setState({activeClock:newTime},()=>{
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
			/>
		</React.Fragment>);
	}

}
