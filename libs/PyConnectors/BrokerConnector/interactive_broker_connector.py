import threading
import time
import datetime
from enum import Enum

from .broker_connector import BrokerConnector
from .broker_connector import BrokerType
from .broker_connector import TimeDuration
from .broker_connector import CandleStickDuration

from ibapi.client import EClient
from ibapi.wrapper import EWrapper 
from ibapi.contract import Contract
from ibapi.ticktype import TickTypeEnum

class InteractiveBrokerConnector(BrokerConnector):
    
    def __init__(self,args):
        self.__ibkr_api = None
        self.__api_thread = None
        
        BrokerConnector.__init__(self,BrokerType.IBKR,args)         
    
    ######### Initilization Functions ##########
    
    def __init_broker__(self,args):
        self.__ibkr_api = _InteractiveBrokerAPI()
        self.__ibkr_api.connect(args['ip_address'], args['port'], args['client_id'])
        
        self.__api_thread = threading.Thread(target=self.__run_loop__, daemon=True)
        self.__api_thread.start()
        
        time.sleep(2)
        
        print("Interactive Brokers Initilized")
    
    def close(self):
        self.__ibkr_api.disconnect()
        time.sleep(1)
        print("Interactive Brokers Disconnected")
        
    def __run_loop__(self):
        self.__ibkr_api.run()
        
    ######### Data Functions ##########
    
    '''
    Static Market Data (NOT STREAMING)
    '''
    def marketdata(self, ticker):
        reqId = _IBKR_RequestType.MARKET.value
        data = []
        contract = self.__ibkr_api.stockcontract(ticker)
        
        self.__ibkr_api.createRequest(reqId)
        self.__ibkr_api.reqMktData(reqId, contract, '', False, False, [])
        
        data_len = 0
        while(True):
            time.sleep(2)
            data = self.__ibkr_api.getRequest(reqId)

            if(data_len == len(data)):
                break
            else:
                data_len = len(data)   

        self.__ibkr_api.deleteRequest(reqId)
        
        return data
        
    '''
    Static Historic Data (NOT STREAMING)
    '''  
    def historicdata(self,ticker:str,time_duration:TimeDuration,candlestick_duration:CandleStickDuration,end_date:datetime.datetime=None,include_non_trading_hours=True,is_unix_timestamp=True,primary_exchange=None):
        reqId = _IBKR_RequestType.HISTORICAL.value
        data = []
        contract = self.__ibkr_api.stockcontract(ticker,primary_exchange)

        #yyyymmdd HH:mm:ss ttt (Example: "20210331 23:59:59 GMT" )
        #Always generating for eastern standard time: 20210331 23:59:59 EST 
        END_DATE = '' if end_date is None else end_date.strftime("%Y%m%d %H:%M:%S")+' EST'
        
        #0 = all trading data
        #1 = only regualr trading hours data
        RTH = 0 if include_non_trading_hours else 1
        
        #1 =  yyyymmdd{space}{space}hh:mm:dd
        #2 = Unix timestamp since 1/1/1970 GMT
        FORMAT_DATE = 2 if is_unix_timestamp else 1
        
        #1 D
        TIME_DURATION = self.timeduration(time_duration)
        
        #5 mins
        CANDLESTICK_DURATION = self.candlestickduration(candlestick_duration)

        DATATYPE = 'TRADES'
    
        self.__ibkr_api.resetHistoric()
        self.__ibkr_api.createRequest(reqId)
        self.__ibkr_api.reqHistoricalData(reqId,contract,END_DATE,TIME_DURATION,CANDLESTICK_DURATION,DATATYPE,RTH,FORMAT_DATE,False,[])
        
        while(True):
            if(self.__ibkr_api.hasHistoricEnded()):
                break
            
        data = self.__ibkr_api.getRequest(reqId)
        self.__ibkr_api.deleteRequest(reqId)
        
        return data
            
        
   
class _IBKR_RequestType(Enum):
    MARKET = 1
    HISTORICAL = 2
    
class _InteractiveBrokerAPI(EWrapper, EClient):
     
     def __init__(self):
         EClient.__init__(self, self)
         self.__requestData = {}
         self.__historialEnd = False
    
    ######### Helper Functions ##########
     
     def hasHistoricEnded(self):
         return self.__historialEnd
     
     def resetHistoric(self):
         self.__historialEnd = False
         
     def createRequest(self,reqId):
         self.__requestData[reqId] = []
         
     def addRequestData(self,reqId,data):
         if(reqId in self.__requestData):
             self.__requestData[reqId].append(data)  
         
     def getRequest(self,reqId):
         data = self.__requestData[reqId]
         return data
     
     def deleteRequest(self,reqId):
         if(reqId in self.__requestData):
             del self.__requestData[reqId]
         
     def stockcontract(self,ticker,primary_exchange=None):
        contract = Contract()
        contract.symbol = ticker
        contract.secType = 'STK'
        contract.exchange = 'SMART'
        contract.currency = 'USD'
        if(primary_exchange is not None):
            contract.primaryExchange = primary_exchange;
        return contract      
         
    ######### Data Called Functions ##########
         
     def tickPrice(self, reqId, tickType, price, attrib):
         data = [TickTypeEnum.to_str(tickType),price]
         self.addRequestData(reqId,data)
    
     def historicalData(self, reqId, bar):
        '''
        {'date': '1617220500', 'open': 122.14, 'high': 122.36, 'low': 122.0, 'close': 122.19, 'volume': 71478, 'barCount': 36755, 'average': 122.148}
        '''
        data = [bar.date,bar.open,bar.high,bar.low,bar.close,bar.average,bar.volume,bar.barCount]
        self.addRequestData(reqId,data)
        self.__historialEnd = False
        
     def historicalDataEnd(self, reqId: int, start: str, end: str):
        super().historicalDataEnd(reqId, start, end)
        print("HistoricalDataEnd. ReqId:", reqId, "from", start, "to", end)
        self.__historialEnd = True
        
     #Error List: https://interactivebrokers.github.io/tws-api/message_codes.html
     def error(self, reqId: int, errorCode: int, errorMessage: str):
        super().error(reqId, errorCode, errorMessage)
        #TODO: Error handling is required!
        #TODO: Throwing error?
        
        #Historical market data Service error message.
        if(errorCode == 162):
            print("Historical market data Service error message. Stopping historical data collection.");
            
        
        if((not (errorCode == -1)) and errorCode < 2000 ):
            self.__historialEnd = True
            raise Exception("IBKR Error:"+str(errorCode)+", "+errorMessage)
 
