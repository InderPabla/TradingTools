from BrokerConnector import InteractiveBrokerConnector
from BrokerConnector import CandleStickDuration
from BrokerConnector import TimeDuration
import time
import pandas as pd 
import datetime 

def savedata():
    if(len(data)==0):
        print("Returning due to 0 length of data")
        return
    
    print("Saving to",filename)
    path = "D:/Users/InderTheGreat/Documents/Github/TradingTools/apps/practice-tool/public/data/"
    pd.DataFrame(data).to_csv(path+filename,header=header,index=False)


####################
#https://interactivebrokers.github.io/tws-api/historical_limitations.html
ticker = "MVIS"
end_date = datetime.datetime(2021, 4, 28, 23, 59, 59)
time_duration = TimeDuration.DAY_1
candlestick_duration = CandleStickDuration.SEC_5

####################
filename = ticker+'-'+end_date.strftime("%Y-%m-%d-%H-%M-%S")+"-"+time_duration.name+'-'+candlestick_duration.name+'.csv'
header = ['date','open','high','low','close','average','volume','count']
data = []

####################
ibkr = InteractiveBrokerConnector({'ip_address':'127.0.0.1','port':7497,'client_id':1236})
print("=====FETCHING HISTORIC DATA=====")
data = ibkr.historicdata(ticker,time_duration,candlestick_duration,end_date=end_date,include_non_trading_hours=True)
print(data)
savedata()
print("=====FETCHED HISTORIC DATA=====")


ibkr.close()


