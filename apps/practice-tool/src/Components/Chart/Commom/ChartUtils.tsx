import { AggregatedTradeLog, ChartOrchestrator, TradeLog, TradingActionType } from "./ChartOrchestrator";

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

export function aggregatedTradeLogs(currentPrice:number,logs:TradeLog[]):AggregatedTradeLog {

	let actionQuantity = (log:TradeLog)=>(log.action==='SELL'?-1:1)*log.quantity;
	let basePrice = (oldPrice:number,newPrice:number,oldOpen:number,newOpen:number) => (Math.abs(oldOpen)*oldPrice + Math.abs(newOpen)*newPrice)/(Math.abs(newOpen)+Math.abs(oldOpen));
	let calcProfit = (closeOnType:TradingActionType,closeQuantity:number,oldPrice:number,newPrice:number)=>(closeOnType==='SELL'?-1:1)*Math.abs(closeQuantity)*(newPrice-oldPrice);
	
	let currentProfits = 0;
	let currentOpen = 0;
	currentOpen = logs.reduce((pr,cr)=>pr+actionQuantity(cr),0);

	let activeOpen:number;
	let baseTradePrice:number;

	for(let i = 0; i < logs.length; i++) {
		let log = logs[i];

		let newOpen = actionQuantity(log);
		let newPrice = log.price;
		
		if(i===0 || activeOpen === 0) {
			activeOpen = actionQuantity(log);
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

	return {currentProfits:parseFloat(currentProfits.toFixed(2)),currentOpen,currentPrice};
}

export function aggregatPnL(aggLogs:Map<string,AggregatedTradeLog>) {
	return  Array.from(aggLogs.keys()).reduce((pv,cv)=>aggLogs.get(cv).currentProfits+pv,0);
}