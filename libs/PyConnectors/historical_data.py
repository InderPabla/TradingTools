from BrokerConnector import InteractiveBrokerConnector
from BrokerConnector import CandleStickDuration
from BrokerConnector import TimeDuration
import time
import pandas as pd 
import datetime 


#TODO: Convert the date into unix timestamp
def savedata(_path,_data,_ticker,_end_date,_time_duration,_stick_duration,_header):
    if(len(_data)==0):
        print("Returning due to 0 length of data")
        return
    print(_data)
    _filename = _ticker+'-'+_end_date.strftime("%Y-%m-%d-%H-%M-%S")+"-"+_time_duration.name+'-'+_stick_duration.name+'.csv'
    print("Saving to",_filename)
    pd.DataFrame(_data).to_csv(_path+_filename,header=_header,index=False)


####################
#https://interactivebrokers.github.io/tws-api/historical_limitations.html

#Port:7497 for TWS, 4002 fpr IB Gateway
ibkr = InteractiveBrokerConnector({'ip_address':'127.0.0.1','port':4002,'client_id':1238})

header = ['date','open','high','low','close','average','volume','count']
path = 'D:/Users/InderTheGreat/Documents/Github/TradingTools/services/practice-tool-ms/public/data/'


tickers = ['NIO','X','AAPL','AMD','QQQ','SPY','MARA']
end_date = datetime.datetime(2021, 2, 2, 23, 59, 59)

#Get and save 5 seconds, 1 min and 5 mins
time_durations = [TimeDuration.WEEK_26,TimeDuration.DAY_3,TimeDuration.DAY_1,TimeDuration.DAY_1]
candlestick_durations = [CandleStickDuration.DAY_1,CandleStickDuration.MIN_5,CandleStickDuration.MIN_1,CandleStickDuration.SEC_5]


for ticker in tickers:
    for i in range(0,len(candlestick_durations)):
        data = ibkr.historicdata(ticker,time_durations[i],candlestick_durations[i],end_date=end_date,include_non_trading_hours=True)
        savedata(path,data,ticker,end_date,time_durations[i],candlestick_durations[i],header)


ibkr.close()


