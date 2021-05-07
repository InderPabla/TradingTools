//https://github.com/rrag/react-stockcharts/issues/519

import React from "react";
import { CANDLESTICK_DURATION } from '../../Common/Constant';
import './Chart.css';
import { Dropdown, DropdownButton, FormControl, InputGroup } from "react-bootstrap";
import { PracticeToolOLD } from "../../Page/PracticeToolOLD/PracticeToolOLD";


export interface ChartSelection {
	chartId:string;
    candlestickDuration?:string;
	ticker?:string;
	tradingDay?:Date;
}

export interface ChartProps {
	chartKey:string;
    selection:ChartSelection;

	onTickerChanged:(key:string,ticker:string)=>void;
	onTickerSelected:(key:string)=>void;
}

export interface ChartState {

}

export class Chart extends React.Component<ChartProps,ChartState> {
	private divChartMainContent: HTMLDivElement | null;

	public static defaultProps = {

    };

	constructor(props:ChartProps) {
		super(props);
		
		this.divChartMainContent = null;

		this.state = { 
	
		};

		this.keyDownEvent = this.keyDownEvent.bind(this);
		this.keyUpEvent = this.keyUpEvent.bind(this);
	}

	async componentDidMount() {
		window.addEventListener("keydown", this.keyDownEvent, false);
		window.addEventListener("keyup", this.keyUpEvent, false);
		this.forceUpdate();
	}
	
	componentWillUnmount() {
		window.removeEventListener("keydown", this.keyDownEvent, false);
		window.removeEventListener("keyup", this.keyUpEvent, false);
	}

	async componentDidUpdate(prevProps:ChartProps, prevState:ChartState) {
		if(prevProps.chartKey!==this.props.chartKey) {
			this.forceUpdate();
		}
	}
	
	shouldComponentUpdate(nextProps: Readonly<ChartProps>, nextState: Readonly<ChartState>,nextContext: any):boolean {
		return nextProps.chartKey!==this.props.chartKey;
	}

	keyDownEvent (event) {
		if(event.code==='KeyX') {
			
		}
	}

	keyUpEvent (event) {
		if(event.code==='KeyX') {
		
		}
	}

	render() {
        const { selection, chartKey, onTickerChanged, onTickerSelected } = this.props;
		
        let candlestickDurationTitle = selection.candlestickDuration || 'Duration';
		const chartDivId = `${chartKey}-duration-dropdown`;
		return (<React.Fragment key={`fragment-chart-${chartKey}`}>
            <div className="chart-container">
                <div className="chart-topbar">
					<DropdownButton id={chartDivId} title={candlestickDurationTitle} size="sm">
						{Object.keys(CANDLESTICK_DURATION).map((key)=> {
							return <Dropdown.Item key={`${chartDivId}-${key}`}>{key}</Dropdown.Item>;
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
                </div>
                <div ref={(ref) => this.divChartMainContent = ref} className="chart-main-content" >
					{this.renderMainChartContent()}
                </div>
            </div>
        </React.Fragment>);
	}

	private renderMainChartContent() {
		const { selection, chartKey } = this.props;
		const shouldRenderChart = selection.ticker != null && selection.tradingDay != null && selection.candlestickDuration != null 
		 						&& this.divChartMainContent != null;
		
		if(!shouldRenderChart) return null;

		return (<React.Fragment key={`fragment-chart-main-${chartKey}`}>
				{/* {this.divChartMainContent && <PracticeToolOLD 
					width={this.divChartMainContent.clientWidth} 
					height={this.divChartMainContent.clientHeight}
					ticker={selection.ticker}
					tradingDay={selection.tradingDay}
				/>} */}
		</React.Fragment>);
	}

}
