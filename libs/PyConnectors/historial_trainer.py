# -*- coding: utf-8 -*-
"""
Created on Sun Apr 17 18:50:43 2022

@author: InderTheGreat
"""

#https://www.tensorflow.org/install/gpu
#https://www.tensorflow.org/install/docker

import numpy as np
import pandas as pd
import tensorflow as tf
import keras
#from keras import backend as K
#from tensorflow.python.client import device_lib
print(tf.__version__)
print(keras.__version__)
#print(K.tensorflow_backend._get_available_gpus())
print("Num GPUs Available: ", len(tf.config.list_physical_devices('GPU')))
#print(device_lib.list_local_devices())



class DataPointEncoderNet(tf.keras.Model):

  def __init__(self,input_size=10,output_size=5):
    super().__init__()
    self.dense1 = tf.keras.layers.Dense(input_size, activation=tf.nn.tanh)
    self.dense2 = tf.keras.layers.Dense(output_size, activation=tf.nn.sigmoid)

  def call(self, inputs):
    x = self.dense1(inputs)
    return self.dense2(x)

#5192, 5319

inputSize = 10
outputSize = 5
filePath = 'D:/Users/InderTheGreat/Documents/Github/TradingTools/services/practice-tool-ms/public/data/'
file5sec = 'NIO-2022-04-14-23-59-59-DAY_1-SEC_5.csv'
file1min = 'NIO-2022-04-14-23-59-59-DAY_2-MIN_1.csv'
file5min = 'NIO-2022-04-14-23-59-59-DAY_4-MIN_5.csv'
file15min= 'NIO-2022-04-14-23-59-59-WEEK_2-MIN_15.csv'
file1day = 'NIO-2022-04-14-23-59-59-WEEK_26-DAY_1.csv'
def filePathGen(file):
    return filePath+file
frame5sec = pd.read_csv(filePathGen(file1min))
frame1min = pd.read_csv(filePathGen(file5sec))
frame5min = pd.read_csv(filePathGen(file5min))
frame15min= pd.read_csv(filePathGen(file15min))
frame1day = pd.read_csv(filePathGen(file1day))

todayRow = frame1day.tail(1)
print(todayRow)
date = "2022-04-14"

realtivePrice = todayRow.get("open").values[0]
print(f"Relative Price: {realtivePrice}")




def test1():
    dpen1 = DataPointEncoderNet(input_size=inputSize,output_size=outputSize)
    inputData = np.array(np.full(inputSize,1))
    inputData = tf.ones((1, inputSize))
    
    inputData = np.ndarray(shape=(1,inputSize))
    
    inputData.fill(1)
    print("Input1")
    print(inputData)
    result = dpen1.call(inputData)
    print("Output1")
    print(result)
    
    inputData.fill(10)
    print("Input1")
    print(inputData)
    result = dpen1.call(inputData)
    print("Output1")
    print(result)
    
    inputData.fill(100)
    print("Input1")
    print(inputData)
    result = dpen1.call(inputData)
    print("Output1")
    print(result)
    
    inputData.fill(1)
    print("Input1")
    print(inputData)
    result = dpen1.call(inputData)
    print("Output1")
    print(result)




