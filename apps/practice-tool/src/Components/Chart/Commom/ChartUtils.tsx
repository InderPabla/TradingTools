import { AggregatedTradeLog, ChartOrchestrator, TradeLog } from "./ChartOrchestrator";

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

export function aggregatedTradeLogs(ticker:string, currentPrice:number,logs:TradeLog[]):AggregatedTradeLog {

	let basePrice = (oldPrice:number,newPrice:number,oldOpen:number,newOpen:number) => (Math.abs(oldOpen)*oldPrice + Math.abs(newOpen)*newPrice)/(Math.abs(newOpen)+Math.abs(oldOpen));
	let calcProfit = (closeOnType:string,closeQuantity:number,oldPrice:number,newPrice:number)=>(closeOnType==='SELL'?-1:1)*Math.abs(closeQuantity)*(newPrice-oldPrice);
	
	let currentProfits = 0;
	let currentOpen = 0;
	let commissions = 0;

	currentOpen = logs.reduce((pr,cr)=>pr+cr.quantity,0);

	let activeOpen:number;
	let baseTradePrice:number;
	for(let i = 0; i < logs.length; i++) {
		let log = logs[i];

		let newOpen = log.quantity;
		let newPrice = log.price;
		

		const PER_SHARE_COMMISSION = Math.abs(newOpen)*0.01;
		const MIN_COMMISSION = 1.0;
		const MAX_COMMISSION = Math.abs(newOpen)*newPrice*(0.5/100.0);

		commissions += Math.min(Math.max(MIN_COMMISSION,PER_SHARE_COMMISSION),MAX_COMMISSION);

		if(i===0 || activeOpen === 0) {
			activeOpen = log.quantity;
			baseTradePrice = newPrice;
		}
		else if(activeOpen!=0){
			let updatedOpen = newOpen + activeOpen;
			
			//In long, adding to long
			if(activeOpen > 0 && updatedOpen > activeOpen) {
				baseTradePrice = basePrice(baseTradePrice,newPrice,activeOpen,newOpen);
			}
			//In long, closing position by adding short
			else if(activeOpen > 0 && updatedOpen < activeOpen) {
				//Overall position still long
				if(updatedOpen>=0) {
					currentProfits += calcProfit('BUY',newOpen,baseTradePrice,newPrice);
				}
				//Overall position switched to short
				else {
					currentProfits += calcProfit('BUY',activeOpen,baseTradePrice,newPrice);
					baseTradePrice = newPrice;
				}
			}
			//In short, adding to short
			else if(activeOpen < 0 && updatedOpen < activeOpen) {
				baseTradePrice = basePrice(baseTradePrice,newPrice,activeOpen,newOpen);
			}
			//In short, closing position by adding long
			else if(activeOpen < 0 && updatedOpen > activeOpen) {
				//Overall position still short
				if(updatedOpen<=0) {
					currentProfits += calcProfit('SELL',newOpen,baseTradePrice,newPrice);
				}
				//Overall position switched to long
				else {
					currentProfits += calcProfit('SELL',activeOpen,baseTradePrice,newPrice);
					baseTradePrice = newPrice;
				}
			}

			activeOpen = updatedOpen;
		}

		//Last bit is still in a trade currently
		if(i===logs.length-1 && activeOpen!=0) {
			currentProfits += activeOpen*(currentPrice-baseTradePrice);
		}
	}

	return {currentProfits:parseFloat(currentProfits.toFixed(2)),currentOpen,currentPrice,baseTradePrice,ticker,commissions};
}

export function aggregatPnL(aggLogs:Map<string,AggregatedTradeLog>) {
	return  Array.from(aggLogs.keys()).reduce((pv,cv)=>aggLogs.get(cv).currentProfits+pv,0);
}