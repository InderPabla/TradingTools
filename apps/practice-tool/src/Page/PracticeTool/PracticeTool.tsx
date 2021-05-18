
import * as React from 'react';
import classNames from 'classnames';
import {Container,Row,Col, DropdownButton, Dropdown} from 'react-bootstrap';
import { CANDLESTICK_DURATION } from '../../Common/Constant';
import { genUniqueKey, getTodayTradingDayTime } from '../../Common/Utils';
import { Chart } from '../../Components/Chart/Chart';
import { TopBar } from '../../Components/TopBar/TopBar';
import './PracticeTool.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ChartSelectionSuper, toChartRenderRowMeta } from './Common/PracticeToolUtils';
import Datetime from "react-datetime";
import "react-datetime/css/react-datetime.css";
import moment from 'moment';
import { ChartContinousData, ChartSelection } from '../../Components/Chart/Commom/ChartUtils';
import { PublicFileChartDataLoader } from '../../Common/DataLoader/ChartDataLoader';
import { TradingClock, VALID_CLOCK_SPEED_MULTIPLIERS } from '../../Common/TradingClock/TradingClock';

const DEFAULT_NUM_OF_CHARTS = 2;
const VALID_CHART_SIZES = [1,2,4,5,6];
const DEFAULT_CANDLESTICK_DURATION = CANDLESTICK_DURATION.MIN_5;


export interface PracticeToolProps {

}

export interface PracticeToolState {
    chartDataArr:ChartSelectionSuper[];
    tradingDayTime:Date;
    tradingClock:TradingClock;
}

export class PracticeTool extends React.Component<PracticeToolProps,PracticeToolState> {
    
    private notifyAllChartsReset = () => toast.info(`All charts reset.`);
    private notifyChartSizeChanged = () => toast.info(`Charts size changed.`);
    private notifyChartTickerChanged = (chartId:string,ticker:string) => toast.info(`${chartId} ticker changed to ${ticker}.`);
    private notifyTradingDayChanged = (tradingDayTime:Date) => toast.info(`Trading day changed to ${tradingDayTime.toDateString()}.`);
    private notifyChartDurationChanged = (chartId:string, duration:string) => toast.info(`${chartId} duration changed to ${duration}.`);
    private notifyClockSpeedChanged = (speed:number) => toast.info(`Clock speed changed to ${speed}x.`);

    private notifyErrorChartLoadingData = (sel:ChartSelection) => toast.error(`Error loading ${sel.chartId} data.`);
    private notifySuccessChartLoadingData = (sel:ChartSelection) => toast.success(`Successful loading ${sel.chartId} data.`);

    private notifyClockState = (isClockRunning:boolean) => toast.info(isClockRunning?'Clock started.':'Clock paused.');
    private customCsvFileDataLoader:PublicFileChartDataLoader;
    
    constructor(props) {
        super(props);

        let tradingDayTime = getTodayTradingDayTime();
        let tradingClock = new TradingClock(tradingDayTime,this.clockUpdate);
        let chartDataArr:ChartSelectionSuper[] = [];
 
        this.customCsvFileDataLoader = new PublicFileChartDataLoader('data',(sel:ChartSelection)=> {
            const {tradingDayTime:_tradingDayTime,ticker,candlestickDuration} = sel;
            const yyyy = _tradingDayTime.getFullYear() + '';
            let mm = _tradingDayTime.getMonth() + 1 + '';
            let dd = _tradingDayTime.getDate() + '';
            dd = dd.length<2?'0'+dd:dd;
            mm = mm.length<2?'0'+mm:mm;
            let days = sel.candlestickDuration===CANDLESTICK_DURATION.MIN_5?'DAY_3':'DAY_1';
            return `${ticker}-${yyyy}-${mm}-${dd}-23-59-59-${days}-${candlestickDuration}.csv`;
        });

        for(let i = 0; i <DEFAULT_NUM_OF_CHARTS;i++) 
            chartDataArr.push(this.getNewChart(DEFAULT_CANDLESTICK_DURATION,tradingDayTime));

        this.state = { chartDataArr, tradingDayTime, tradingClock}; 
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
		if(event.code==='KeyP') {
           
		}
	}

	keyUpEvent = (event) => {
		if(event.code==='KeyP') {
            this.state.tradingClock.toggleClock();
		}
	}

    private clockUpdate = () => {
        if(this.state.tradingClock.wasClockPaused()) {
            this.notifyClockState(false);
        }
        if(this.state.tradingClock.wasClockUnpaused()) {
            this.notifyClockState(true);
        }
        for(let chart of this.state.chartDataArr)
            chart.chart.onClockUpdate(this.state.tradingClock.getClock());
        this.setState({});
    }

    private getChartWithChartKey(chartKey:string):ChartSelectionSuper {
        let chart = this.state.chartDataArr.find(v=>v.chartKey===chartKey) as ChartSelectionSuper;
        return chart;
    }

    private getChartWithChartId(chartId:string):ChartSelectionSuper {
        let chart = this.state.chartDataArr.find(v=>v.chartSelection.chartId===chartId) as ChartSelectionSuper;
        return chart;
    }

    private getNewChart(duration:string,tradingDay:Date):ChartSelectionSuper {
        return {
            chartKey: genUniqueKey(),
            chartSelection: {
                chartId:genUniqueKey(),
                candlestickDuration:duration, 
                tradingDayTime:tradingDay,
            },
            chart:null,
        };
    }

    private onClockSpeedSelected = (speed:any) => {
        const { tradingClock } = this.state;
        const newSpeed:number = parseInt(speed);
        const curSpeed:number = tradingClock.getClockSpeedMultipler();
        if(newSpeed!==curSpeed) {
            tradingClock.setClockSpeedMultiplier(newSpeed);
            this.setState({},()=>{
                this.notifyClockSpeedChanged(newSpeed);
            });
        }
    }

    private onChartSizeSelected = (numberOfChartsStr:any) => {
        let chartDataArr = this.state.chartDataArr;
        
        const newNumberOfCharts:number = parseInt(numberOfChartsStr);
        const currentNumberOfCharts:number = chartDataArr.length;
        const chartDiff = Math.abs(newNumberOfCharts-currentNumberOfCharts);

        if(chartDiff>0) {
            if(currentNumberOfCharts<newNumberOfCharts) {
                for(let i = 0; i <chartDiff;i++) 
                    chartDataArr.push(this.getNewChart(DEFAULT_CANDLESTICK_DURATION,this.state.tradingDayTime));
            }
            else {
                for(let i = 0; i <chartDiff;i++) 
                    chartDataArr.pop();
            }

            for(let chart of chartDataArr){
                chart.chartKey = genUniqueKey();
            }
        }

        this.resetAllChart();
        this.setState({},()=>{
            this.notifyChartSizeChanged();
            this.forceUpdate();
            this.resetAllChartsInState();
        });
    }
    
    private resetAllChartsInState = () => {
        this.resetAllChart();
        this.setState({},()=>{
            this.notifyAllChartsReset();
            this.forceUpdate();
        });
    }

    private resetAllChart = () => {
        for(let chart of this.state.chartDataArr) chart.chartKey = genUniqueKey(); 
    }

    private onTickerChanged = (chartKey:string, ticker:string) =>{
        let chart = this.getChartWithChartKey(chartKey);
        chart.chartSelection.ticker=ticker?ticker.toUpperCase():ticker;
        this.setState({});
    }

    private onTickerSelected = (chartKey:string) => {
        let chart = this.getChartWithChartKey(chartKey);
        if(chart.chartSelection.ticker) {
            this.notifyChartTickerChanged(chart.chartSelection.chartId,chart.chartSelection.ticker);
            chart.chartKey = genUniqueKey();
            this.setState({});
        }
    }

    private onTradingDayTimeChanged (newTradingDayTime:Date) {
        const { tradingDayTime, chartDataArr, tradingClock } = this.state;
        if(tradingDayTime.getTime() !== newTradingDayTime.getTime()) {
            for(let chart of chartDataArr) 
                chart.chartSelection.tradingDayTime = newTradingDayTime;
            this.resetAllChart();
            tradingClock.setClock(newTradingDayTime);
            this.setState({tradingDayTime:newTradingDayTime},()=>{
                this.notifyTradingDayChanged(newTradingDayTime);
            });
        }
    }

    private onCandleStickDurationSelected = (chartKey:string, duration:string) => {
        let chart = this.getChartWithChartKey(chartKey);
        if(chart.chartSelection.candlestickDuration!==duration) {
            chart.chartSelection.candlestickDuration = duration;
            chart.chartKey = genUniqueKey();
            this.notifyChartDurationChanged(chart.chartSelection.chartId,duration);
            this.setState({});
        }
    }

    public render() {
        const { tradingClock } = this.state;
        const isClockRunning = tradingClock.isClockRunning();
        const pauseplayClass = classNames('pauseplay-chart','fa',{'paused fa-pause':isClockRunning,'playing fa-play':!isClockRunning});
        const clockClass = classNames('clock-chart',{'paused':isClockRunning,'playing':!isClockRunning});

        return (
            <React.Fragment>
                <div id="practice-tool" style={{height:"100vh"}}>
                    <TopBar title="Practice Tool" icon="book">
                        <div className="practice-tool-chart-dropdown-container">
                            <DropdownButton 
                                id="practice-tool-chart-size-button" 
                                title={`${this.state.chartDataArr.length} Charts`} 
                                size="sm"
                                onSelect={this.onChartSizeSelected}>
                                {VALID_CHART_SIZES.map((numberOfCharts)=> {
                                    return <Dropdown.Item 
                                                key={`practice-tool-chart-dropdown-button-${numberOfCharts}`} 
                                                eventKey={numberOfCharts.toString()}>{numberOfCharts}</Dropdown.Item>;
                                })}
                            </DropdownButton>
                            <Datetime 
                                initialValue={this.state.tradingDayTime}
                                onChange={(value)=>{this.onTradingDayTimeChanged(moment(value).toDate())}}  
                            />
                            <i className={`refresh-chart fa fa-refresh`} onClick={this.resetAllChartsInState}/>
                            <i className={pauseplayClass} onClick={tradingClock.toggleClock}/>
                            <p className={clockClass}>{moment(tradingClock.getClock()).format('hh:mm:ss A')}</p>
                            <DropdownButton 
                                id="practice-tool-chart-clockspeed-button" 
                                title={`${this.state.tradingClock.getClockSpeedMultipler()}x`} 
                                size="sm"
                                onSelect={this.onClockSpeedSelected}>
                                {VALID_CLOCK_SPEED_MULTIPLIERS.map((speed)=> {
                                    return <Dropdown.Item 
                                                key={`practice-tool-chart-clockspeed-button-${speed}`} 
                                                eventKey={speed.toString()}>{speed}x</Dropdown.Item>;
                                })}
                            </DropdownButton>
                        </div>
     
                    </TopBar>
                    
                    <div className="practice-tool-container-outter">
                        <Container fluid={true} className="practice-tool-container">
                            {this.renderCharts()}
                        </Container>
                    </div>

                    <ToastContainer
                        autoClose={5000}
                        hideProgressBar={false}
                        newestOnTop={true}
                        closeOnClick
                    />
                </div>
            </React.Fragment>
        );
    }
    
    public renderCharts() {
        const {chartDataArr, tradingClock} = this.state;
        const renderMeta = toChartRenderRowMeta(chartDataArr.length);
        
        return (<React.Fragment>
            {renderMeta.map((row,index)=> {
                return (<Row key={`chart-row-key-${index}`} xl={row.numberOfRows} noGutters={true} className="flex-nowrap practice-tool-row" style={{height:`${row.heightPercent}%`}}>
                    {row.chartRenderMeta.map((col,index)=>{
                        const chartData = chartDataArr[col.chartIndex];
                        return (<Col key={`chart-col-key-${index}`} xl={col.numberOfColumns} className="practice-tool-col-container">
                            <div className="practice-tool-col">
                                <Chart 
                                    ref={(ref) => chartData.chart = ref}
                                    chartKey={chartData.chartKey} 
                                    selection={chartData.chartSelection}
                                    onTickerChanged={this.onTickerChanged}
                                    onTickerSelected={this.onTickerSelected}
                                    onCandleStickDurationSelected={this.onCandleStickDurationSelected}

                                    notifyErrorChartLoadingData={this.notifyErrorChartLoadingData}
                                    notifySuccessChartLoadingData={this.notifySuccessChartLoadingData}

                                    dataLoader={this.customCsvFileDataLoader}
                                /> 
                            </div>
                        </Col>);
                    })}
                </Row>);
            })}
        </React.Fragment>);
    }
  }
