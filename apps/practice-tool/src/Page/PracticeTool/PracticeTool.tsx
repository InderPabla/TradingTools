
import * as React from 'react';
import {Container,Row,Col, DropdownButton, Dropdown} from 'react-bootstrap';
import { CANDLESTICK_DURATION } from '../../Common/Constant';
import { genUniqueKey } from '../../Common/Utils';
import { Chart, ChartSelection } from '../../Components/Chart/Chart';
import { TopBar } from '../../Components/TopBar/TopBar';
import { PracticeToolOLD } from '../PracticeToolOLD/PracticeToolOLD';
import './PracticeTool.css';

const DEFAULT_NUM_OF_CHARTS = 5;
const VALID_CHART_SIZES = [1,2,4,5,6];

export interface PracticeToolProps {

}

export interface ChartSelectionSuper {
    uniqueKey:string;
    chartSelection:ChartSelection;
}

export interface PracticeToolState {
    chartDataArr:ChartSelectionSuper[]
}

export interface ChartRenderMeta {
    chartIndex:number;
    numberOfColumns:number;
}

export interface ChartRenderRowMeta {
    chartRenderMeta:ChartRenderMeta[],
    heightPercent:number;
}

export class PracticeTool extends React.Component<PracticeToolProps,PracticeToolState> {

    constructor(props) {
      super(props);
      let chartDataArr:ChartSelectionSuper[] = [];
      for(let i = 0; i <DEFAULT_NUM_OF_CHARTS;i++) 
        chartDataArr.push(this.getNewChart())
      this.state = { chartDataArr }
    }

    async componentDidMount() {

    }

    private toChartRenderRowMeta():ChartRenderRowMeta[] {
        const {chartDataArr} = this.state;
        switch(chartDataArr.length) {
            case 1: return [{chartRenderMeta:[{chartIndex:0,numberOfColumns:12}],heightPercent:100}];
            case 2: return [{chartRenderMeta:[{chartIndex:0,numberOfColumns:6},{chartIndex:1,numberOfColumns:6}],heightPercent:100}];
            case 4: return [
                            {chartRenderMeta:[{chartIndex:0,numberOfColumns:6},{chartIndex:1,numberOfColumns:6}],heightPercent:50},
                            {chartRenderMeta:[{chartIndex:2,numberOfColumns:6},{chartIndex:3,numberOfColumns:6}],heightPercent:50}
                           ];
            case 5: return [
                {chartRenderMeta:[{chartIndex:3,numberOfColumns:6},{chartIndex:4,numberOfColumns:6}],heightPercent:50},
                            {chartRenderMeta:[{chartIndex:0,numberOfColumns:4},{chartIndex:1,numberOfColumns:4},{chartIndex:2,numberOfColumns:4}],heightPercent:50},
                           
                           ];
            case 6: return [
                            {chartRenderMeta:[{chartIndex:0,numberOfColumns:4},{chartIndex:1,numberOfColumns:4},{chartIndex:2,numberOfColumns:4}],heightPercent:50},
                            {chartRenderMeta:[{chartIndex:3,numberOfColumns:4},{chartIndex:4,numberOfColumns:4},{chartIndex:5,numberOfColumns:4}],heightPercent:50}
                           ];
            default: throw new Error(`Invalid Chart Size: ${chartDataArr.length}. Value number be on of ${VALID_CHART_SIZES.join(',')}`);
        }
    }

    private getNewChart():ChartSelectionSuper {
        return {uniqueKey:genUniqueKey(),chartSelection:{
            candlestickDuration:CANDLESTICK_DURATION.MIN_5,
            ticker:"MVIS",
            day:"2021/04/28",
        }};
    }

    private onChangeChartSize = (numberOfChartsStr:any) => {
        let chartDataArr = this.state.chartDataArr;
        
        const newNumberOfCharts:number = parseInt(numberOfChartsStr);
        const currentNumberOfCharts:number = chartDataArr.length;

        if(currentNumberOfCharts!==newNumberOfCharts) {
            this.resetChart();
            if(currentNumberOfCharts<newNumberOfCharts) {
                let chartsToAdd = newNumberOfCharts-currentNumberOfCharts;
                for(let i = 0; i <chartsToAdd;i++) 
                    chartDataArr.push(this.getNewChart());
            }
            else {
                let chartsToRemove = currentNumberOfCharts-newNumberOfCharts;
                for(let i = 0; i <chartsToRemove;i++) 
                    chartDataArr.pop();
            }
        }

        this.setState({});
    }

    private resetChart = () => {
        let chartDataArr = this.state.chartDataArr;
        for(let i = 0; i <chartDataArr.length;i++)
            chartDataArr[i].uniqueKey = genUniqueKey();
        this.setState({});
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
                                    return <Dropdown.Item key={`practice-tool-chart-dropdown-button-${numberOfCharts}`} eventKey={numberOfCharts.toString()}>{numberOfCharts}</Dropdown.Item>;
                                })}
                            </DropdownButton>
                            <i className={`refresh-chart fa fa-refresh`} onClick={this.resetChart}/>
                        </div>
     
                    </TopBar>
                    <div className="practice-tool-container-outter">
                        <Container fluid={true} className="practice-tool-container">
                            {this.renderCharts()}
                        </Container>
                    </div>
                    
                </div>
            </React.Fragment>
        );
    }

    public renderCharts() {
        const renderMeta = this.toChartRenderRowMeta();

        return (<React.Fragment>
            {renderMeta.map((row,index)=> {
                return (<Row key={`chart-row-key-${index}`} xl={12} noGutters={true} className="flex-nowrap practice-tool-row" style={{height:`${row.heightPercent}%`}}>
                    {row.chartRenderMeta.map((col,index)=>{
                        const chartData = this.state.chartDataArr[col.chartIndex];
                        return (<Col key={`chart-col-key-${index}`} xl={col.numberOfColumns} className="practice-tool-col-container">
                            <div className="practice-tool-col">
                                <Chart 
                                    id={chartData.uniqueKey} 
                                    selection={chartData.chartSelection}
                                /> 
                            </div>
                        </Col>);
                    })}
                </Row>);
            })}
        </React.Fragment>);
    }
  }
