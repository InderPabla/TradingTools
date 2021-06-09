
type Data = {[key:string]:number};

export interface ChartSelection {
	chartId:string,

    candlestickDuration?:string,
	ticker?:string,
	tradingDayTime?:Date,
}

export interface ChartIndicator {
	name:string,
	id:string,
	data:Data[],
}

export interface VWAP extends ChartIndicator{
	data:VWAPData[],
}	

export interface VWAPData extends Data {
	_totalVolume:number,
	_totalVolumePrice:number,
	vwap:number,
}

export function isChartSelectionValid(selection:ChartSelection):boolean {
	if(selection==null) return false;
    return selection.candlestickDuration!=null && selection.ticker!=null && selection.tradingDayTime!=null;           
}
