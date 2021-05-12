
type Data = {[key:string]:number};

export interface ChartSelection {
	chartId:string,

    candlestickDuration?:string,
	ticker?:string,
	tradingDayTime?:Date,
}

export interface ChartDataSet {
	candle:ChartContinousData[],
	inds?:ChartIndicator[],	
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

export interface ChartContinousData {
	date:Date,
	open:number,
	low:number,
	high:number,
	close:number,
	volume:number,
	average:number,
	count:number;
}

export function isChartSelectionValid(selection:ChartSelection):boolean {
	if(selection==null) return false;
    return selection.candlestickDuration!=null && selection.ticker!=null && selection.tradingDayTime!=null;           
}
