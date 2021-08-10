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
    
    today = datetime.date.today();
    today_year = today.year
    today_month = today.month
    today_day = today.day
    
 
    #'QQQ','SPY','NIO','AMC','AAPL','CCL','PLTR','AAL','QFIN','PLUG','TIGR','NVDA
    #'QQQ','SPY','NIO','SPCE','AAL','CCL','LEVI','HGEN','AAPL','AMD','AMC','TIGR','BA'
    #'SGOC','QQQ','SPY','NIO','SPCE','DIDI','PLTR','F','BAC','UPST'
    #'QQQ','SPY','NIO','SPCE','DIDI','DTSS','ATOS','OXY','PLUG','JZXN','XELA','AAPL'
    #'QQQ','SPY','NIO','SPCE','DIDI','AAPL','CCL','TLRY','BABA','NFLX','CHPT','XPEV'
    #'QQQ','SPY','NIO','SPCE','FUBO','CCIV','FGEN','ERIC','XELA','MRIN','LIZI','AAPL','NVDA','MRNA','X','SGOC','TSLA'
    #'QQQ','SPY','CCL','AAL', 'OXY', 'AMC', 'SPCE', 'CYTK', 'NIO', 'XELA', 'BB'
    #'QQQ','SPY','TAL','CCIV','CCL','SGOC','AHPI','MARA','AMC','SPCE','NIO'
    #'QQQ','SPY','MEDS','NURO','MARA','DKNG','CCL','KO','AMC','WISH','NIO'
    #'QQQ','SPY','NURO','DQ','MRIN','CLOV','MCRB','CLF','LUV','AAL','FFIE'
    #'QQQ','SPY','ALZN','NRXP','NURO','TAL','IPA','API','BEKE','TME','TIGR','NIO','XPEV'
    #'QQQ','SPY','MARA','RIOT','LAC','AMC','ATIP','BEKE'
    #'QQQ','SPY','MARA','INTC','NIO','AMC','CCL','XELA','AAL','BABA','AAPL'
    #'QQQ','SPY','MARA','NIO','CCL','TIGR','TLRY','SPRT'
    #'QQQ','SPY','DIDI','UBER','FLGC','NKLA','ARCC','NIO','QCOM','AMD'
    #'QQQ','SPY','PINS','NIO','XOM','LCID','ERYP','TAOP','SAVA','BILI','TLRY','AMD'
    #'QQQ','SPY','XPEV','NIO','AMD','AMC','LI','SAVA','AFRM','VXRT','PINS','EVK'
    #'QQQ','SPY','NIO','XPEV','AMD','UAA','BILI','PINS','BP','CRSR','AAPL'
    #'QQQ','SPY','NIO','ATVI','UBER','AMD','GM','AMC'
    #'QQQ','SPY','FSLY','UBER','AMC','SOFI','KPTI','MMAT'
    #'QQQ','SPY','PLUG','DKNG','OCGN','AMC','MVST','AMD','NIO'
    #'QQQ','SPY','MARA','DKNG','AMD','AMC','MVST','NIO'
    tickers = ['QQQ','SPY','FSR','AMC','PLUG','FCEL','ZEV','NIO']
    primary_exchange = {'ALF':'NASDAQ','SPCE':'NYSE','ABNB':'NASDAQ','MINM':'NASDAQ'}
    
    end_date = datetime.datetime(today_year, today_month, today_day, 23, 59, 59)

    time_durations = [TimeDuration.WEEK_26,TimeDuration.WEEK_2
                      ,TimeDuration.DAY_4,TimeDuration.DAY_2
                      ,TimeDuration.DAY_1,TimeDuration.MIN_30]
    candlestick_durations = [CandleStickDuration.DAY_1,CandleStickDuration.MIN_15
                             ,CandleStickDuration.MIN_5,CandleStickDuration.MIN_1
                             ,CandleStickDuration.SEC_5,CandleStickDuration.SEC_1]
    
    

    for i in range(0,len(tickers)):
        ticker = tickers[i]
        pe = None if ticker not in primary_exchange else primary_exchange[ticker]
        for i in range(0,len(candlestick_durations)):
            candle_dur = candlestick_durations[i]
            time_dur = time_durations[i]
            
            if(candle_dur.name==CandleStickDuration.SEC_1.name):
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


