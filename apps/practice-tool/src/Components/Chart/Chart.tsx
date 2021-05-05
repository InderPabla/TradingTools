//https://github.com/rrag/react-stockcharts/issues/519

import React from "react";
import { scaleTime } from "d3-scale";
import { format } from "d3-format";
import { timeFormat } from "d3-time-format";
import { ChartCanvas, Chart as ReactStockCharts } from "react-stockcharts";
import { CandlestickSeries, BarSeries, LineSeries } from "react-stockcharts/lib/series";
import { XAxis, YAxis } from "react-stockcharts/lib/axes";
import { last, timeIntervalBarWidth } from "react-stockcharts/lib/utils";
import { lastVisibleItemBasedZoomAnchor } from "react-stockcharts/lib/utils/zoomBehavior"
import { candlestickTimeToD3Time} from "../../Common/Utils";
import { EdgeIndicator } from "react-stockcharts/lib/coordinates";
import { COLOR } from "../../Common/ColorConst";
import { CANDLESTICK_DURATION } from '../../Common/Constant';
import './Chart.css';
import { Dropdown, DropdownButton } from "react-bootstrap";
import { PracticeToolOLD } from "../../Page/PracticeToolOLD/PracticeToolOLD";

export interface ChartSelection {
    candlestickDuration:string;
	ticker:string;
	day:string;
}

export interface ChartProps {
	id:string;
    selection:ChartSelection;
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

	componentDidMount() {
		window.addEventListener("keydown", this.keyDownEvent, false);
		window.addEventListener("keyup", this.keyUpEvent, false);
		this.forceUpdate();
	}
	
	componentWillUnmount() {
		window.removeEventListener("keydown", this.keyDownEvent, false);
		window.removeEventListener("keyup", this.keyUpEvent, false);
	}

	componentDidUpdate(prevProps:ChartProps, prevState:ChartProps) {
		if(prevProps.id!==this.props.id) {
			this.forceUpdate();
		}
	}
	
	shouldComponentUpdate(nextProps: Readonly<ChartProps>, nextState: Readonly<ChartState>,nextContext: any):boolean {
		return nextProps.id!==this.props.id;
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

        const { selection, id } = this.props;


        let candlestickDurationTitle = selection.candlestickDuration || 'Duration';
		const chartId = `${id}-duration-dropdown`;
		return (<React.Fragment key={`fragment-${id}`}>
            <div id={id} className="chart-container">
                <div className="chart-topbar">
					<DropdownButton id={chartId} title={candlestickDurationTitle} size="sm">
						{Object.keys(CANDLESTICK_DURATION).map((key)=> {
							return <Dropdown.Item key={`${chartId}-${key}`}>{key}</Dropdown.Item>;
						})}
					</DropdownButton>
                </div>
                <div ref={(ref) => this.divChartMainContent = ref} className="chart-main-content" >
					{this.divChartMainContent && <PracticeToolOLD 
							width={this.divChartMainContent.clientWidth} 
							height={this.divChartMainContent.clientHeight}
							ticker={selection.ticker}
							day={selection.day}
						/>}
                </div>
            </div>
        </React.Fragment>);
	}

}
