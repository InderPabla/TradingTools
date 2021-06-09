from BrokerConnector import InteractiveBrokerConnector
from BrokerConnector import CandleStickDuration
from BrokerConnector import TimeDuration
import time
import pandas as pd 
import datetime 


#TODO: Convert the date into unix timestamp
def savedata(_path,_data,_header,_filename):
    if(len(_data)==0):
        print("Returning due to 0 length of data")
        return
    #print(_data)
    
    print("Saving to",_filename)
    pd.DataFrame(_data).to_csv(_path+_filename,header=_header,index=False)


####################
#https://interactivebrokers.github.io/tws-api/historical_limitations.html

#Port:7497 for TWS, 4002 fpr IB Gateway
ibkr = InteractiveBrokerConnector({'ip_address':'127.0.0.1','port':4002,'client_id':1234})

header = ['date','open','high','low','close','average','volume','count']
path = 'D:/Users/InderTheGreat/Documents/Github/TradingTools/services/practice-tool-ms/public/data/'


tickers = ['NIO','X','LUV','SNAP','LIZI','MGNI','TIGR','SPY','QQQ']
end_date = datetime.datetime(2021, 2, 5, 23, 59, 59)

#Get and save 5 seconds, 1 min and 5 mins
time_durations = [TimeDuration.WEEK_26,TimeDuration.DAY_3,TimeDuration.DAY_1,TimeDuration.DAY_1]
candlestick_durations = [CandleStickDuration.DAY_1,CandleStickDuration.MIN_5,CandleStickDuration.MIN_1,CandleStickDuration.SEC_5]

#time_durations = [TimeDuration.DAY_1]
#candlestick_durations = [CandleStickDuration.SEC_1]

for ticker in tickers:
    for i in range(0,len(candlestick_durations)):
        candle_dur = candlestick_durations[i]
        time_dur = time_durations[i]
        
        if(candle_dur.name==CandleStickDuration.SEC_1.name):
            time_dur = TimeDuration.MIN_30
            _end_dates = [datetime.datetime(2021, 2, 5, 9, 30, 00), datetime.datetime(2021, 2, 5, 10, 00, 00)
                          ,datetime.datetime(2021, 2, 5, 10, 30, 00), datetime.datetime(2021, 2, 5, 11, 00, 00)
                          ,datetime.datetime(2021, 2, 5, 11, 30, 00)]
            
            for _ed in _end_dates:
                try:
                    filename = ticker+'-'+_ed.strftime("%Y-%m-%d-%H-%M-%S")+"-"+time_dur.name+'-'+candle_dur.name+'.csv'  
                    data = ibkr.historicdata(ticker,time_dur,candle_dur,end_date=_ed,include_non_trading_hours=True)
                    savedata(path,data,header,filename)
                except:
                    print("Error fetching:"+filename)
        else:
          try:
              filename = ticker+'-'+end_date.strftime("%Y-%m-%d-%H-%M-%S")+"-"+time_dur.name+'-'+candle_dur.name+'.csv'  
              data = ibkr.historicdata(ticker,time_dur,candle_dur,end_date=end_date,include_non_trading_hours=True)
              savedata(path,data,header,filename)
          except:
              print("Error fetching:"+filename)
        
        
ibkr.close()


