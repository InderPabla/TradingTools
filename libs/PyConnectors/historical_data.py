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
    #today_year = 2022
    #today_month = 6
    #today_day = 17
    
    print("Year:"+str(today_year)+", Month:"+str(today_month)+", Day:"+str(today_day))
 
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
    #'QQQ','SPY','FSR','AMC','PLUG','FCEL','ZEV','NIO'
    #'QQQ','SPY','FUBO','X','SPCE','AMD','WW','OCGN'
    #'QQQ','SPY','OPEN','PLTR','BEKE','CLOV','SPCE','NIO'
    #'QQQ','SPY','WISH','SOFI','FUBO','SPCE','FSR','MARA','RKT','DKNG'
    #'QQQ','SPY','SONO','MARA','NIO','OXY','CCL','XPEV','AMD'
    #'QQQ','SPY','RBLX','BILI','AMD','NIO','AMC','PLUG'
    #'QQQ','SPY','TLRY','ALF','AMC','NIO','TIGR','ZIM'
    #'QQQ','SPY','M','KSS','NIO','PFE','CSCO'
    #'QQQ','SPY','FL','AMD','NIO','MARA','OXY','M'
    #'QQQ','SPY','MARA','RIOT','PFE','UBER','AMD','NIO'
    #'QQQ','SPY','CARA','BBY','NIO','PFE','AMC','VIPS'
    #'QQQ','SPY','AMC','SPCE','KC','DKNG','UBER'
    #'QQQ','SPY','INO','SAVA','AMC','NIO','SLQT','JWN','RIDE'
    #'QQQ','SPY','GPS','DVAX','SAVA','BIG','HPQ','YY','AMC','TKAT','SPRT','CEMI'
    #'QQQ','SPY','SPRT','WKHS','NURO','WISH','AMC','ATER'
    #'QQQ','SPY','ZEV','MARA','SPCE','RHE','ANY','CRSR','PDD','BILI'
    #'QQQ','SPY','SKLZ','LCID','NIO','XPEV','AMD','BBIG','SPRT','ELYS'
    #'QQQ','SPY','NKLA','RIOT','AEO','CHWY','BBIG','GSM','SQBG','ATER'
    #'QQQ','SPY','SAVA','DIDI','NIO','AMC','BBIG','CLOV'
    #'QQQ','SPY','IRNT','AMC','BTBT','IQ','SAVA','NIO'
    #'QQQ','SPY','FUBO','NIO','DKNG','AMC','CLOV','BBIG','SPRT'
    #'QQQ','SPY','NIO','AMC','BILI','BBIG','SPRT','HGEN'
    #'QQQ','SPY','AMC','OCGN','BLU','SPCE','MDXG','CCJ','SNAP','PTON','SPRT'
    #'QQQ','SPY','MARA','LCID','FCEL','SDC','RDHL','LIFE','ATER','NNVC'
    #'QQQ','SPY','MARA','HUT','LVS','AMC','LIFE','OCGN','FCEL','RBLX'
    #'QQQ','SPY','UBER','QS','AMC','LCID','PLTR','EDSA'
    #'QQQ','SPY','SAVA','SFIX','SOFI','VALE','LCID','WKHS','BBIG'
    #'QQQ','SPY','PLUG','AMC','LCID','AAL','ROKU','ATER','TLRY','MRM'
    #'QQQ','SPY','ATER','PLTR','TIGR','ANY','QS','AMC','LCID'
    #'QQQ','SPY','BBIG','OXY','CCL','AAL','RCAT','TSLA'
    #'QQQ','SPY','OXY','SAVA','AMC','MU','ALT','CCL','ALF','DBGI'
    #'QQQ','SPY','SPCE','LCID','BBBY','KSS','AMC','SOFI','MARA'
    #'QQQ','SPY','GM','MRK','AMC','OXY'VW
    #'QQQ','SPY','OXY','RIDE','OCGN','MARA','CCL'
    #'QQQ','SPY','NIO','BBIG','MRLV','TLRY'
    #'QQQ','SPY','AMD','AAPL','SHPW','NIO','IBM','TLRY','OXY','CAN','FCEL','HX'
    #'QQQ','SPY','NIO','FCEL','X','AMC','OCGN','PLUG'
    #'QQQ','SPY','FUTU','IRNT','LCID','MARA','LC','RFL','TIGR'
    #'QQQ','SPY','OCGN','X','NIO','LCID','XPEV','PLUG','ON','BBIG'
    #'QQQ','SPY','DKNG','PINS','OCGN','NIO','X','LCID'
    #'QQQ','SPY','MARA','NIO','X','BBBY','LCID','PLUG'
    #'QQQ','SPY','NIO','TLRY','BLNK','LCID','CPNG'
    #'QQQ','SPY','LCID','GOEV','PLUG','NIO','X'
    #'QQQ','SPY','LCID','NIO','X','CSCO'
    #'QQQ','SPY','LCID','NIO','OXY','CCL','TLRY','PLUG'
    #'QQQ','SPY','NIO','LCID','PLUG','MARA','LAC'
    #'QQQ','SPY','LCID','NIO','BBY','XPEV'
    #'QQQ','SPY','NIO','LCID','MU','PLAN','GPS','X'
    #'QQQ','SPY','NIO','CCL','AAL','X','BBIG','XPEV','TLRY'
    #'QQQ','SPY','NIO','CCL','AAL','X','OXY','XPEV','TLRY'
    #'QQQ','SPY','NIO','AAL','LCID','INTC','TWTR','PTON','SOFI'
    #'QQQ','SPY','NIO','AAL','LCID','INTC','X','PTON','SOFI'
    #'QQQ','SPY','NIO','AAL','LCID','INTC','X','OXY','TLRY'
    #'QQQ','SPY','NIO','AMC','LCID','XPEV','CCL','SPCE','NCLH'
    #'QQQ','SPY','NIO','RBLX','BFRI','BLU','X'
    #'QQQ','SPY','NIO','X','DAL','FCX','CCL','BCTX','AMC'
    #'QQQ','SPY','PFE','NIO','AMC','LCID','MP','X','BLPH'
    #'QQQ','SPY','AMC','CCL','PFE','NIO','MARA','LCID','X','RIOT'
    #'QQQ','SPY','AMC','CCL','PFE','NIO','MARA','LCID','X','SOPA'
    #'QQQ','SPY','AMC','LCID','CCL','NCLH','ALLK','NIO','X'
    #'QQQ','SPY','LCID','CCL','ALLK','NIO','JD','NKLA'
    #'QQQ','SPY','FCEL','MARA','RIOT','NIO','CCL','ISIG','PLUG'
    #'QQQ','SPY','NIO','VALE','ISIG','LCID','X'
    #'QQQ','SPY','NIO','CCL','SOFI','LCID','ISIG'
    #'QQQ','SPY','NIO','LCID','XPEV','F','X','CCL'
    #'QQQ','SPY','NIO','CCL','LCID','AMD'
    #'QQQ','SPY','NIO','F','X','AMD','LCID','PFE'
    #'QQQ','SPY','NIO','BBBY','NIO','OXY','F'
    #'QQQ','SPY','AMC','NIO','F','LCID','X','CCL'
    #'QQQ','SPY','F','TLRY','NIO','LCID','X'
    #'QQQ','SPY','NIO','SOFI','LCID','OCGN'
    #'QQQ','SPY','NIO','SPCE','LCID','OCGN','CCL'
    #'QQQ','SPY','SOFI','PDD','NIO','AAL','LAZR'
    #'QQQ','SPY','PTON','F','NIO','AAL'
    #'QQQ','SPY','NIO','LCID','AAL'
    #'QQQ','SPY','NIO','OXY','AAL'
    #'QQQ','SPY','NIO','OXY','AFRM'
    #'QQQ','SPY','NIO','OXY','AAL'
    #'QQQ','SPY','NIO','OXY','AAL','AMD'
    #'QQQ','SPY','NIO','AAL','FUTU','AMD'
    #'QQQ','SPY','NIO','OXY','AAL','BBBY','X'
    #'QQQ','SPY','NIO','OXY','TLRY','HOOD','X'
    #'QQQ','SPY','NIO','OXY','X','FUTU'
    #'QQQ','SPY','NIO','OXY','BILI','AAPL','FUTU','TIGR'
    #'QQQ','SPY','NIO','OXY','TWTR','SBUX'
    #'QQQ','SPY','NIO','OXY','CCL','PLUG'
    #'QQQ','SPY','NIO','TWTR','AMD','DELL'
    #'QQQ','SPY','NIO','OXY','AMD','CCL'
    #'QQQ','SPY','NIO','OXY','BILI','CCL','APA'
    #'QQQ','SPY','NIO','LCID','BILI','NVDA'
    #'QQQ','SPY','NIO','OXY','AMD','BILI'
    #'QQQ','SPY','NIO','AAL','TWTR','TSLA'
    #'QQQ','SPY','NIO','AAL','AMD'
    #'QQQ','SPY','NIO','OXY','AMD'
    #'QQQ','SPY','NIO','OXY','AMC'
    #'QQQ','SPY','NIO','OXY','TWTR','KSS'
    #'QQQ','SPY','NIO','OXY','TWTR','XPEV','FUTU','SAVE'
    #'QQQ','SPY','NIO','KSS','AFRM','AMZN','NVDA'
    #'QQQ','SPY','NIO','BILI','ROKU','PLUG','OXY'
    #'QQQ','SPY','NIO','BILI','AMZN','PLUG','OXY'
    #'QQQ','SPY','NIO','BILI','RBLX','COIN','OXY'
    #'QQQ','SPY','NIO','OXY','COIN','SQ','NVDA'
    #'QQQ','SPY','NIO','OXY','COIN','SQ','NVDA'
    #'QQQ','SPY','NIO','OXY','LI','COIN','AAL','AMZN'
    #'QQQ','SPY','NIO','OXY','RBLX','AMZN','EDU'
    #'QQQ','SPY','NIO','AMD','AAL','OXY','NVDA'
    #'QQQ','SPY','NIO','AMD','OXY','CCL','NVDA'
    tickers = ['QQQ','SPY','NIO','AMD','OXY','CCL','NVDA']
    primary_exchange = {'ALF':'NASDAQ','SPCE':'NYSE','ABNB':'NASDAQ','MINM':'NASDAQ','OPEN':'NASDAQ','CSCO':'NASDAQ','LIFE':'NASDAQ','RFL':'NYSE','TIGR':'NASDAQ','PLAN':'NYSE'}
    
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


