import time
from enum import Enum
import datetime

class BrokerType(Enum):
    IBKR = 1

class TimeDuration(Enum):
    MIN_2 = 1
    MIN_30 = 2
    HOUR_1 = 3
    HOUR_8 = 4
    DAY_1 = 5
    DAY_2 = 6
    DAY_3 = 7
    DAY_4 = 8
    DAY_5 = 9
    DAY_6 = 10
    WEEK_1 = 11
    WEEK_2 = 12
    WEEK_26 = 13

class CandleStickDuration(Enum):
    SEC_1 = 1
    SEC_5 = 2
    SEC_15 = 3
    SEC_30 = 4
    MIN_1 = 5
    MIN_2 = 6
    MIN_3 = 7
    MIN_5 = 8
    MIN_15 = 9
    MIN_30 = 10
    HOUR_1 = 11
    DAY_1 = 12


class BrokerConnector:
    
    def __init__(self,broker:BrokerType,args):
        self.broker = broker
        self.__init_broker__(args)

    def __init_broker__(self,args):
        a=1
        #raise NotImplemented('__init_broker__: initilize broker')
        
    def close(self):
        raise NotImplemented('close: close connection with broker')
     
    def marketdata(self,ticker):
        raise NotImplemented('marketdata: pull market data for a ticker')
        
    def historicdata(self,ticker:str,time_duration:TimeDuration,candlestick_duration:CandleStickDuration,end_date:datetime.datetime=None,include_non_trading_hours=True,is_unix_timestamp=True):
        raise NotImplemented('historicdata: pull market data for a ticker')
        
    def timeduration(self,duration:TimeDuration):
        switcher = {
            TimeDuration.MIN_2.value: "120 S",
            TimeDuration.MIN_30.value: "1800 S",
            TimeDuration.HOUR_1.value: "3600 S",
            TimeDuration.HOUR_8.value: "28800 S",
            TimeDuration.DAY_1.value: "1 D",
            TimeDuration.DAY_2.value: "2 D",
            TimeDuration.DAY_3.value: "3 D",
            TimeDuration.DAY_4.value: "4 D",
            TimeDuration.DAY_5.value: "5 D",
            TimeDuration.DAY_6.value: "6 D",
            TimeDuration.WEEK_1.value: "1 W",
            TimeDuration.WEEK_2.value: "2 W",
            TimeDuration.WEEK_26.value: "26 W"
        }

        value = switcher.get(duration.value,None)

        if(value is None):
            raise ValueError("timeduration: Invalid time duration",duration)
        
        return value  
    
    def candlestickduration(self,duration:CandleStickDuration):
        switcher = {
            CandleStickDuration.SEC_1.value: "1 secs",
            CandleStickDuration.SEC_5.value: "5 secs",
            CandleStickDuration.SEC_15.value: "15 secs",
            CandleStickDuration.SEC_30.value: "30 secs",
            CandleStickDuration.MIN_1.value: "1 min",
            CandleStickDuration.MIN_2.value: "2 mins",
            CandleStickDuration.MIN_3.value: "3 mins",
            CandleStickDuration.MIN_5.value: "5 mins",
            CandleStickDuration.MIN_15.value: "15 mins",
            CandleStickDuration.MIN_30.value: "30 mins",
            CandleStickDuration.HOUR_1.value: "1 hour",
            CandleStickDuration.DAY_1.value: "1 day"
        }

        value = switcher.get(duration.value,None)

        if(value is None):
            raise ValueError("candlestickduration: Invalid candle stick duration",duration)
        
        return value