
import * as React from 'react';
import classNames from 'classnames';
import {Container,Row,Col, DropdownButton, Dropdown, Button} from 'react-bootstrap';
import { CANDLESTICK_DURATION } from '../../Common/Constant';
import { downloadDataToFile, genUniqueKey, toDayTradingTime, convertJsonToCsvString } from '../../Common/Utils';
import { Chart } from '../../Components/Chart/Chart';
import { TopBar } from '../../Components/TopBar/TopBar';
import './PracticeTool.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ChartSelectionSuper, toChartRenderRowMeta } from './Common/PracticeToolUtils';
import Datetime from "react-datetime";
import "react-datetime/css/react-datetime.css";
import moment from 'moment';
import { aggregatedTradeLogs, ChartSelection } from '../../Components/Chart/Commom/ChartUtils';
import { ServiceChartDataLoader } from '../../Common/DataLoader/ChartDataLoader';
import { TradingClock } from '../../Common/TradingClock/TradingClock';
import { SessionInfo } from 'practice-tool-types';
import { SessionInfoModal } from '../../Components/Modal/SessionInfo/SessionInfoModal';
import { IndicatorInfoModal } from '../../Components/Modal/IndicatorInfo/IndicatorInfoModal';
import {  AggregatedTradeLog, ChartOrchestrator, TradeLog } from '../../Components/Chart/Commom/ChartOrchestrator';
import { SessionInfoWrapper } from '../../Common/TradingClock/SessionInfoWrapper';
import { SessionTradingClock } from '../../Common/TradingClock/SessionTradingClock';
import { CommonTradingClock, VALID_CLOCK_SPEED_MULTIPLIERS } from '../../Common/TradingClock/CommonTradingClock';
import { ChartIndicator, ChartIndicatorKeyMetadata, ChartIndicatorMetadata, ExpMovingAverageIndicator, MovingAverageIndicator, VWAPIndicator } from '../../Components/Chart/Commom/ChartSet';
import { HueAPI } from '../../Common/Api/HueAPI';

const DEFAULT_NUM_OF_CHARTS = 2;
const VALID_CHART_SIZES = [1,2,4,5,6,10];
const DEFAULT_CANDLESTICK_DURATION = CANDLESTICK_DURATION.MIN_5;


export interface PracticeToolProps {

}

export interface PriceType {
 BUY:number[],
 SELL:number[],
 MARK:number[],
}

export interface PracticeToolState {
    chartDataArr:ChartSelectionSuper[];
    tradingDayTime:Date;
    tradingClock:CommonTradingClock;

    showSessionInfoModal:boolean;
    showIndiactorInfoModal:boolean;
    
    sessionInfoWrapper:SessionInfoWrapper;

    tradeLogs:TradeLog[],

    indicators:ChartIndicator[],

    aggLogsMap:Map<string,AggregatedTradeLog>,

    lights:string[],

    maxAccountEquity:number;
    priceMarkerMap:Map<string,PriceType>,
}

export class PracticeTool extends React.Component<PracticeToolProps,PracticeToolState> {
    
    private notifyAllChartsReset = () => toast.info(`All charts reset.`);
    private notifyChartSizeChanged = () => toast.info(`Charts size changed.`);
    private notifyChartTickerChanged = (chartId:string,ticker:string) => toast.info(`${chartId} ticker changed to ${ticker}.`);
    private notifyTradingDayChanged = (tradingDayTime:Date) => toast.info(`Trading day changed to ${tradingDayTime.toDateString()}.`);
    private notifyChartDurationChanged = (chartId:string, duration:string) => toast.info(`${chartId} duration changed to ${duration}.`);
    private notifyClockSpeedChanged = (speed:number) => toast.info(`Clock speed changed to ${speed}x.`);
    private notifyErrorChartLoadingData = (sel:ChartSelection) => toast.error(`Error: Unable to load ${sel.chartId} data.`);
    private notifySuccessChartLoadingData = (sel:ChartSelection) => toast.success(`Successful loading ${sel.chartId} data.`);
    private notifyClockState = (isClockRunning:boolean) => toast.info(isClockRunning?'Clock started.':'Clock paused.');
    private notifySessionInfo = (info:SessionInfo) => toast.info(info.sessionId?'Running Server session.':'Running Client session.');
    private notifyErrorSessionInfo = (message:string) => toast.error(`Error: ${message}`)

    private dataLoader:ServiceChartDataLoader;

    constructor(props) {
        super(props);
        let tradingDayTime = toDayTradingTime(new Date(),false);
        let tradingClock = new TradingClock(tradingDayTime,this.clockUpdate);
        let chartDataArr:ChartSelectionSuper[] = [];
        this.dataLoader = new ServiceChartDataLoader();

        for(let i = 0; i <DEFAULT_NUM_OF_CHARTS;i++) 
            chartDataArr.push(this.getNewChart(DEFAULT_CANDLESTICK_DURATION,tradingDayTime));

        const indicators:ChartIndicator[] = [
                                                new VWAPIndicator(), 
                                                new ExpMovingAverageIndicator(new ChartIndicatorMetadata("",ExpMovingAverageIndicator,
                                                    [new ChartIndicatorKeyMetadata("","period",9)])),
                                                new ExpMovingAverageIndicator(new ChartIndicatorMetadata("",ExpMovingAverageIndicator,
                                                    [new ChartIndicatorKeyMetadata("","period",12)])),
                                                    new MovingAverageIndicator(new ChartIndicatorMetadata("",MovingAverageIndicator,
                                                    [new ChartIndicatorKeyMetadata("","period",2)])),
                                            ];
        this.state = { chartDataArr, tradingDayTime, tradingClock
            ,showSessionInfoModal: true, showIndiactorInfoModal: false
            ,tradeLogs:[], sessionInfoWrapper:null, indicators
            ,aggLogsMap:new Map(), lights:[], maxAccountEquity:15000,priceMarkerMap:new Map()}; 
    }

    componentDidMount() {
		window.addEventListener("keydown", this.keyDownEvent, false);
		window.addEventListener("keyup", this.keyUpEvent, false);
	}
	
	componentWillUnmount() {
		window.removeEventListener("keydown", this.keyDownEvent, false);
		window.removeEventListener("keyup", this.keyUpEvent, false);
	}

	private keyDownEvent = (event) => {
		if(event.code==='KeyP') {
           
		}
	}

	private keyUpEvent = (event) => {
		if(event.code==='KeyP') {
            //this.state.tradingClock.toggleClock();
		}
	}
 

    private onPriceClicked = (ticker:string,price:number,clickType:"MARK"|"BUY"|"SELL",callback:Function) => {
        const {priceMarkerMap} = this.state;
        if(!priceMarkerMap.has(ticker)) priceMarkerMap.set(ticker,{BUY:[],SELL:[],MARK:[]});
        priceMarkerMap.get(ticker)[clickType].push(price);
        priceMarkerMap.get(ticker)[clickType].sort();
        this.setState({priceMarkerMap},()=>{callback();});
    }

    private eventLog = (ticker:string, quantity:number, orch:ChartOrchestrator)=> {
        //Forced 1 second delay!
        setTimeout(()=>{
            const { tradeLogs, aggLogsMap } = this.state; 
            const candle = orch.getCurrentCandle();
            const spread = orch.getSpread(3);
            const spreadUpdate = quantity>0?spread:-spread;
            const log:TradeLog = {
                quantity,ticker,
                date:candle.date,
                price:candle.close + spreadUpdate
            }
            tradeLogs.push(log);
            ChartOrchestrator.updateTradeLog(log);
            aggLogsMap.set(log.ticker
                        ,aggregatedTradeLogs(ticker,ChartOrchestrator.getCurrentPrice(log.ticker),tradeLogs.filter(v=>v.ticker===log.ticker)));
    
            this.setState({});
        },1000);
       
    }

    private onChartDataLoad = async (chartKey:string):Promise<void> => {
        const { dataLoader } = this;
        const { tradingClock, tradeLogs,indicators } = this.state;
        let chart = this.state.chartDataArr.find(v=>v.chartKey===chartKey) as ChartSelectionSuper;
        const activeSelection = {...chart.chartSelection, tradingDayTime: new Date(tradingClock.getClock())};
        const realtimeSelection = {...activeSelection,candlestickDuration:CANDLESTICK_DURATION.SEC_5}
		const orch = await ChartOrchestrator.getInstance(activeSelection,realtimeSelection
                                                        ,{date:tradingClock.getClock(),dataLoader
                                                            ,logs:tradeLogs.filter(v=>v.ticker===activeSelection.ticker)
                                                            ,indicators
                                                        });
        if(orch) {
            this.notifySuccessChartLoadingData(activeSelection);
            chart.orch = orch;
            chart.chartKey = genUniqueKey();
            this.setState({});
        }
        else {
            this.notifyErrorChartLoadingData(activeSelection);
        }
    }

    private clockUpdate = async () => {
        const { aggLogsMap, tradeLogs } = this.state;
        let pnl:number = 0;

        if(this.state.tradingClock.wasClockPaused()) {
            this.notifyClockState(false);
        }

        if(this.state.tradingClock.wasClockUnpaused()) {
            this.notifyClockState(true);
        }

        const tickers = Array.from(aggLogsMap.keys());
        for(let ticker of tickers) {
            var currentPrice = ChartOrchestrator.getCurrentPrice(ticker);
            var previousPrice = ChartOrchestrator.getPreviousPrice(ticker);
            const aggLog = aggregatedTradeLogs(ticker,currentPrice,tradeLogs.filter(v=>v.ticker===ticker));
            aggLogsMap.set(ticker,aggLog);
            pnl += aggLog.currentProfits;

            
        }

        this.setState({},async ()=>{
            ChartOrchestrator.update(this.state.tradingClock.getClock());

            if(this.state.lights.length>0) {
                try{   
                    const maxLoss = -300;
                    const maxProfit = 300;
                    const pnlNorm = Math.max(Math.min((pnl-maxLoss)/(maxProfit-maxLoss),1),0)
    
                    const color = { r: (255.0*(1.0-pnlNorm))
                                    ,g:(255.0*pnlNorm)
                                    ,b:(255.0*(1.0-Math.abs((0.5-pnlNorm)/0.5)))
                                };
    
                    await HueAPI.postChangeHueRgbColor(color,this.state.lights);
                }
                catch(err) {
                    console.log(err);
                }
            }
            
            for(let chart of this.state.chartDataArr)
                chart.chart.onClockUpdate(null);
    
            this.setState({});
        });
       
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
            orch:null,
            chart:null,
        };
    }

    private onClockSpeedSelected = async (speed:any) => {
        const { tradingClock } = this.state;
        const newSpeed:number = parseInt(speed);
        const curSpeed:number = tradingClock.getClockSpeedMultipler();
        if(newSpeed!==curSpeed) {
            await tradingClock.setClockSpeedMultiplier(newSpeed);
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
            tradingClock.changeClock(newTradingDayTime);
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

    private onSaveSelectionInfo = (sessionInfoWrapper:SessionInfoWrapper,lights:string[]) => {
        let { tradingDayTime, tradingClock } = this.state;
        //tradingDayTime = toDayTradingTime(new Date(sessionInfo.tradingDay),true);
        tradingDayTime = sessionInfoWrapper.clock;
        let newTradingClock:CommonTradingClock = sessionInfoWrapper.isServerSideSession()
                                                    ?new SessionTradingClock(tradingDayTime,this.clockUpdate,sessionInfoWrapper)
                                                    :tradingClock;
        newTradingClock.setClock(tradingDayTime);
        this.setState({showSessionInfoModal:false,tradingDayTime,sessionInfoWrapper,tradingClock:newTradingClock,lights},()=>{
            this.notifySessionInfo(sessionInfoWrapper);
            this.onTradingDayTimeChanged(tradingDayTime);
        });
    }

    private onSaveIndicatorInfo = (indicators:ChartIndicator[]) => {
        ChartOrchestrator.updateIndicators(indicators);
        this.resetAllChart();
        this.setState({indicators,showIndiactorInfoModal:false});
    }

    private openIndicatorModal = () => {
        this.setState({showIndiactorInfoModal:true});
    }

    private getActiveCaptialInTrade():number {
        const {aggLogsMap} = this.state;
        return Array.from(aggLogsMap.keys()).reduce((pv:number,ticker:string)=>{
            const agg = aggLogsMap.get(ticker);
            return pv+(Math.abs(agg.currentOpen)*agg.baseTradePrice);
        },0)
    }

    public render() {
        const { tradingClock, showSessionInfoModal, tradeLogs, sessionInfoWrapper } = this.state;
        const isClockRunning = tradingClock.isClockRunning();
        const pauseplayClass = classNames('pauseplay-chart','fa',{'paused fa-pause':isClockRunning,'playing fa-play':!isClockRunning});
        const clockClass = classNames('clock-chart',{'paused':isClockRunning,'playing':!isClockRunning});
        const disabled = false;//sessionInfoWrapper!=null;// && sessionInfoWrapper.isServerSideSession();

        return (
            <React.Fragment>
                <div id="practice-tool" style={{height:"100vh"}}>
                    <TopBar title="Practice Tool" icon="book">
                        {!showSessionInfoModal && <React.Fragment>
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
                                    inputProps={{disabled:disabled}}
                                    initialValue={this.state.tradingDayTime}
                                    onChange={(value)=>{this.onTradingDayTimeChanged(moment(value).toDate())}}  
                                />
                                <i className={`refresh-chart fa fa-refresh`} onClick={this.resetAllChartsInState}/>
                                <i className={pauseplayClass} onClick={tradingClock.toggleClock}/>
                                <p className={clockClass}>{moment(tradingClock.getClock()).format('hh:mm:ss A')}</p>
                                <DropdownButton 
                                    disabled={disabled}
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
                                <Button 
                                    className="indicator-button" 
                                    variant="primary" 
                                    size="sm"
                                    onClick={()=>{this.openIndicatorModal()}}
                                    disabled={false}><i className="fa fa-flask"/></Button>	
                                <Button 
                                    className="download-trade-log-button" 
                                    variant="primary" 
                                    size="sm"
                                    onClick={()=>{downloadDataToFile(`TradeLog-${new Date().toLocaleString()}.csv`,convertJsonToCsvString(tradeLogs))}}
                                    disabled={!tradeLogs || tradeLogs.length===0}><i className="fa fa-dollar"/><i className="fa fa-dollar"/><i className="fa fa-dollar"/></Button>	
                                <p className="active-capital-info">Active: ${this.getActiveCaptialInTrade().toFixed(2)}</p>
                            </div>
                            <p className="session-id">{!!sessionInfoWrapper.sessionId?`SERVER: ${sessionInfoWrapper.sessionId}`:'CLIENT'}</p>
                        </React.Fragment>
                        }
                    </TopBar>
                    <div className="practice-tool-container-outter">
                        <Container fluid={true} className="practice-tool-container">
                            {!showSessionInfoModal && this.renderCharts()}
                        </Container>
                    </div>
                </div>

                {this.renderNonPageEmbedded()}
            </React.Fragment>
        );
    }
    
    public renderCharts() {
        const {chartDataArr, tradingClock, tradeLogs, aggLogsMap, priceMarkerMap} = this.state;
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
                                    onChartDataLoad={this.onChartDataLoad}
                                    orch={chartData.orch}
     
                                    tradingClock={tradingClock}
                                    tradeEvent={this.eventLog}
                                    logs={tradeLogs.filter(v=>v.ticker===chartData.chartSelection.ticker)}
                                    markedPrices={priceMarkerMap.get(chartData.chartSelection.ticker)?.MARK|| []}
                                    sellPrices={priceMarkerMap.get(chartData.chartSelection.ticker)?.SELL|| []}
                                    buyPrices={priceMarkerMap.get(chartData.chartSelection.ticker)?.BUY|| []}
                                    aggLog={aggLogsMap.get(chartData.chartSelection.ticker)}

                                    onPriceClicked={this.onPriceClicked}
                                /> 
                            </div>
                        </Col>);
                    })}
                </Row>);
            })}
        </React.Fragment>);
    }

    private renderNonPageEmbedded() {
        const { showSessionInfoModal, showIndiactorInfoModal, indicators } = this.state;

        return (
            <React.Fragment>
                <ToastContainer
                    autoClose={2000}
                    hideProgressBar={false}
                    newestOnTop={true}
                    closeOnClick
                />
                
                {showSessionInfoModal && <SessionInfoModal 
                    show={showSessionInfoModal} 
                    save={this.onSaveSelectionInfo}
                    onError={this.notifyErrorSessionInfo}
                />}

                {showIndiactorInfoModal && <IndicatorInfoModal 
                    show={showIndiactorInfoModal} 
                    save={this.onSaveIndicatorInfo}
                    initialIndicator={indicators}
                />}
            </React.Fragment>
        );
    } 
}
