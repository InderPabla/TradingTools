
import * as React from 'react';
import {Container,Row,Col, DropdownButton, Dropdown} from 'react-bootstrap';
import { CANDLESTICK_DURATION } from '../../Common/Constant';
import { genUniqueKey, getTodayTradingDay } from '../../Common/Utils';
import { Chart, ChartSelection } from '../../Components/Chart/Chart';
import { TopBar } from '../../Components/TopBar/TopBar';
import './PracticeTool.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { toChartRenderRowMeta } from './PracticeToolUtils';

const DEFAULT_NUM_OF_CHARTS = 2;
const VALID_CHART_SIZES = [1,2,4,5,6];
const DEFAULT_CANDLESTICK_DURATION = CANDLESTICK_DURATION.MIN_5;

export interface PracticeToolProps {

}

export interface ChartSelectionSuper {
    chartKey:string;
    chartSelection:ChartSelection;
}

export interface PracticeToolState {
    chartDataArr:ChartSelectionSuper[];
    
}



export class PracticeTool extends React.Component<PracticeToolProps,PracticeToolState> {
    
    private tradingDay:Date;
    
    private notifyAllChartsReset = () => toast.info(`Charts reset.`);
    private notifyChartReset = (chartId:string) => toast.info(`${chartId} reset.`);
    private notifyChartSizeChanged = () => toast.info(`Charts size changed.`);
    private notifyChartTickerChanged = (chartId:string,ticker:string) => toast.info(`${chartId} ticker changed to ${ticker}.`);
    
   

    constructor(props) {
        super(props);
        this.tradingDay = getTodayTradingDay();
        let chartDataArr:ChartSelectionSuper[] = [];
        for(let i = 0; i <DEFAULT_NUM_OF_CHARTS;i++) 
            chartDataArr.push(this.getNewChart());
        this.state = { 
          chartDataArr,
        }
    }

    async componentDidMount() {

    }

    private getChartWithChartKey(chartKey:string):ChartSelectionSuper {
        let chart = this.state.chartDataArr.find(v=>v.chartKey===chartKey) as ChartSelectionSuper;
        return chart;
    }

    private getChartWithChartId(chartId:string):ChartSelectionSuper {
        let chart = this.state.chartDataArr.find(v=>v.chartSelection.chartId===chartId) as ChartSelectionSuper;
        return chart;
    }

    private getNewChart():ChartSelectionSuper {
        console.log(this.state);
        return {
            chartKey: genUniqueKey(),

            chartSelection: {
                chartId:genUniqueKey(),
                candlestickDuration:DEFAULT_CANDLESTICK_DURATION, 
                tradingDay:new Date(this.tradingDay),
                // ticker:"MVIS", tradingDay:"2021/04/28",
            }
        };
    }

    private onChangeChartSize = (numberOfChartsStr:any) => {
        let chartDataArr = this.state.chartDataArr;
        
        const newNumberOfCharts:number = parseInt(numberOfChartsStr);
        const currentNumberOfCharts:number = chartDataArr.length;
        const chartDiff = Math.abs(newNumberOfCharts-currentNumberOfCharts);

        if(chartDiff>0) {
            if(currentNumberOfCharts<newNumberOfCharts) {
                for(let i = 0; i <chartDiff;i++) 
                    chartDataArr.push(this.getNewChart());
            }
            else {
                for(let i = 0; i <chartDiff;i++) 
                    chartDataArr.pop();
            }

            for(let chart of chartDataArr){
                chart.chartKey = genUniqueKey();
            }
        }

        this.notifyChartSizeChanged();
        this.resetAllChart();
        this.setState({});
    }
    
    private resetAllChart = () => {
        let chartDataArr = this.state.chartDataArr;
        for(let chart of chartDataArr)
            chart.chartKey = genUniqueKey();

        this.notifyAllChartsReset();
        this.setState({});
    }

    private resetChart = (key:string) => {
        let chart = this.getChartWithChartKey(key);
        chart.chartKey = genUniqueKey();
        this.notifyChartReset(chart.chartSelection.chartId);
        this.setState({});
    }

    private onTickerChanged = (key:string, ticker:string) =>{
        let chart = this.getChartWithChartKey(key);
        chart.chartSelection.ticker=ticker?ticker.toUpperCase():ticker;
        this.setState({});
    }

    private onTickerSelected = (key:string) => {
        let chart = this.getChartWithChartKey(key);
        if(chart.chartSelection.ticker) {
            this.notifyChartTickerChanged(chart.chartSelection.chartId,chart.chartSelection.ticker);
            this.resetChart(key);
        }
    }

    public render() {
        return (
            <React.Fragment>
                <div id="practice-tool" style={{height:"100vh"}}>
                    <TopBar title="Practice Tool" icon="book">
                        <div className="practice-tool-chart-dropdown-container">
                            <DropdownButton 
                                id="practice-tool-chart-dropdown-button" 
                                title={`${this.state.chartDataArr.length} Charts`} 
                                size="sm"
                                onSelect={this.onChangeChartSize}>
                                {VALID_CHART_SIZES.map((numberOfCharts)=> {
                                    return <Dropdown.Item 
                                                key={`practice-tool-chart-dropdown-button-${numberOfCharts}`} 
                                                eventKey={numberOfCharts.toString()}>{numberOfCharts}</Dropdown.Item>;
                                })}
                            </DropdownButton>

                            <i className={`refresh-chart fa fa-refresh`} onClick={this.resetAllChart}/>
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
        const {chartDataArr} = this.state;
        const renderMeta = toChartRenderRowMeta(chartDataArr.length);
        
        return (<React.Fragment>
            {renderMeta.map((row,index)=> {
                return (<Row key={`chart-row-key-${index}`} xl={row.numberOfRows} noGutters={true} className="flex-nowrap practice-tool-row" style={{height:`${row.heightPercent}%`}}>
                    {row.chartRenderMeta.map((col,index)=>{
                        const chartData = chartDataArr[col.chartIndex];
                        return (<Col key={`chart-col-key-${index}`} xl={col.numberOfColumns} className="practice-tool-col-container">
                            <div className="practice-tool-col">
                                <Chart 
                                    chartKey={chartData.chartKey} 
                                    selection={chartData.chartSelection}
                                    onTickerChanged={this.onTickerChanged}
                                    onTickerSelected={this.onTickerSelected}
                                /> 
                            </div>
                        </Col>);
                    })}
                </Row>);
            })}
        </React.Fragment>);
    }
  }
