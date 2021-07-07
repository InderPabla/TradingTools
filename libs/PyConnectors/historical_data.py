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

print(__name__)
if __name__ == '__main__':
    ####################
    #https://interactivebrokers.github.io/tws-api/historical_limitations.html
    
    #Port:7497 for TWS, 4002 fpr IB Gateway
    ibkr = InteractiveBrokerConnector({'ip_address':'127.0.0.1','port':4002,'client_id':1236})
    
    header = ['date','open','high','low','close','average','volume','count']
    path = 'D:/Users/InderTheGreat/Documents/Github/TradingTools/services/practice-tool-ms/public/data/'
    
    today_year = 2021
    today_month = 7
    today_day = 6
    
 
    #'QQQ','SPY','ZM','FB',
    #'QQQ','SPY','NIO','BBBY','X','AMD','MU','OXY','SPCE','XPEV','ABNB','CCIV','MRIN','MEDS'
    #'QQQ','SPY','NIO','OCGN','AMC',TIGR
    tickers = ['DIDI','AMD','RIOT','WISH','XPEV','SPCE']
    primary_exchange = {'ALF':'NASDAQ','SPCE':'NYSE','ABNB':'NASDAQ'}
    
    end_date = datetime.datetime(today_year, today_month, today_day, 23, 59, 59)
    
    #Get and save 5 i0seconds, 1 min and 5 mins
    time_durations = [TimeDuration.WEEK_26,TimeDuration.DAY_4,TimeDuration.DAY_2
                      ,TimeDuration.DAY_1,TimeDuration.MIN_30]
    candlestick_durations = [CandleStickDuration.DAY_1,CandleStickDuration.MIN_5,CandleStickDuration.MIN_1
                             ,CandleStickDuration.SEC_5,CandleStickDuration.SEC_1]
    
    #time_durations = [TimeDuration.DAY_1]
    #candlestick_durations = [CandleStickDuration.SEC_1]
    
    for i in range(0,len(tickers)):
        ticker = tickers[i]
        pe = None if ticker not in primary_exchange else primary_exchange[ticker]
        for i in range(0,len(candlestick_durations)):
            candle_dur = candlestick_durations[i]
            time_dur = time_durations[i]
            
            if(candle_dur.name==CandleStickDuration.SEC_1.name):
                time_dur = TimeDuration.MIN_30
                _end_dates = [datetime.datetime(today_year, today_month, today_day, 9, 30, 00)
                              ,datetime.datetime(today_year, today_month, today_day, 10, 00, 00)
                              ,datetime.datetime(today_year, today_month, today_day, 10, 30, 00)
                              ,datetime.datetime(today_year, today_month, today_day, 11, 00, 00)
                              ,datetime.datetime(today_year, today_month, today_day, 11, 30, 00)]
                
                for _ed in _end_dates:
                    try:
                        filename = ticker+'-'+_ed.strftime("%Y-%m-%d-%H-%M-%S")+"-"+time_dur.name+'-'+candle_dur.name+'.csv'  
                        data = ibkr.historicdata(ticker,time_dur,candle_dur,end_date=_ed,include_non_trading_hours=True,primary_exchange=pe)
                        savedata(path,data,header,filename)
                    except:
                        print("Error fetching:"+filename)
            else:
              try:
                  filename = ticker+'-'+end_date.strftime("%Y-%m-%d-%H-%M-%S")+"-"+time_dur.name+'-'+candle_dur.name+'.csv'  
                  data = ibkr.historicdata(ticker,time_dur,candle_dur,end_date=end_date,include_non_trading_hours=True,primary_exchange=pe)
                  savedata(path,data,header,filename)
              except:
                  print("Error fetching:"+filename)
            
            
    ibkr.close()


