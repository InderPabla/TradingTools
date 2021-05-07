export interface ChartRenderMeta {
    chartIndex:number;
    numberOfColumns:number;
}

export interface ChartRenderRowMeta {
    chartRenderMeta:ChartRenderMeta[],
    heightPercent:number;
    numberOfRows:number;
}

export function toChartRenderRowMeta(numberOfCharts:number):ChartRenderRowMeta[] {

    switch(numberOfCharts) {
        case 1: return [
                        {
                            chartRenderMeta:[{chartIndex:0,numberOfColumns:12}]
                            ,heightPercent:100,numberOfRows:12
                        }
                       ];
        case 2: return [
                        {
                            chartRenderMeta:[{chartIndex:0,numberOfColumns:6},{chartIndex:1,numberOfColumns:6}]
                            ,heightPercent:100,numberOfRows:12
                        }
                       ];
        case 4: return [
                        {
                            chartRenderMeta:[{chartIndex:0,numberOfColumns:6},{chartIndex:1,numberOfColumns:6}]
                            ,heightPercent:50,numberOfRows:12
                        },
                        {
                            chartRenderMeta:[{chartIndex:2,numberOfColumns:6},{chartIndex:3,numberOfColumns:6}]
                            ,heightPercent:50,numberOfRows:12
                        }
                       ];
        case 5: return [
                        {
                            chartRenderMeta:[{chartIndex:3,numberOfColumns:6},{chartIndex:4,numberOfColumns:6}]
                            ,heightPercent:50,numberOfRows:12
                        },
                        {
                            chartRenderMeta:[{chartIndex:0,numberOfColumns:4},{chartIndex:1,numberOfColumns:4},{chartIndex:2,numberOfColumns:4}]
                            ,heightPercent:50,numberOfRows:12
                        },
                       ];
        case 6: return [
                        {
                            chartRenderMeta:[{chartIndex:0,numberOfColumns:4},{chartIndex:1,numberOfColumns:4},{chartIndex:2,numberOfColumns:4}]
                            ,heightPercent:50,numberOfRows:12
                        },
                        {
                            chartRenderMeta:[{chartIndex:3,numberOfColumns:4},{chartIndex:4,numberOfColumns:4},{chartIndex:5,numberOfColumns:4}]
                            ,heightPercent:50,numberOfRows:12
                        }
                       ];
        default: throw new Error(`Invalid Chart Size: ${numberOfCharts}`);
    }
}