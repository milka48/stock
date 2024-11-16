from fastapi import APIRouter
from typing import Optional
from pydantic import BaseModel
from fastapi import HTTPException
import matplotlib.pyplot as plt
import io
import pandas as pd
import yfinance as yf
import numpy as np
from typing import List
from ..lib.analysis import get_stock_code, get_full_stock_info, get_stock_prices_360_days#, predict_next_day_price


router = APIRouter()

# rsi구하는 공식
def calculate_rsi(data):
    # 가격 변화 계산
    delta = data.diff(1)  # Close 컬럼에 종가가 있다고 가정

    window=14

    # 상승과 하락 분리
    gain = delta.where(delta > 0, 0)
    loss = -delta.where(delta < 0, 0)

    # 평균 상승 및 하락 계산 (초기값은 14일 이동 평균 사용)
    avg_gain = gain.rolling(window=window, min_periods=1).mean()
    avg_loss = loss.rolling(window=window, min_periods=1).mean()

    # RS 및 RSI 계산
    rs = avg_gain / avg_loss
    rsi = 100 - (100 / (1 + rs))

    return round((rsi.iloc[-1].item()),2)

#페이지별 데이터 모델

class Stock(BaseModel):
    stock_id : str
    stock_name : str
    price : float

#/stock-page에 넘겨주는 모델 : 필터링해서 전송 get
class StockPage(BaseModel):
    stock : List[Stock]

#filter에서 데이터 받아오는 모델 post
class Metrics(BaseModel):
    checked : bool
    value : float

class Filter(BaseModel):
    PER : Metrics
    PBR : Metrics
    ROE : Metrics
    RSI : Metrics
    marcap : Metrics #시가총액

#result 페이지에 넘겨주는 모델 get
class Result(BaseModel):
    # stock_name : str
    price : float
    dod : float
    change_rate : float
    per : float
    pbr : float
    roe : float
    rsi : float
    recommend : bool
    commend : str
    #exepect_close : float
    annual_ret : float
    volatility : float

#지표 딕셔너리 전역변수
global_filter = Filter(
    PER = Metrics(
        checked = False,
        value = 0
    ),
    PBR = Metrics(
        checked = False,
        value = 0
    ),
    ROE = Metrics(
        checked = False,
        value = 0
    ),
    RSI = Metrics(
        checked = False,
        value = 0
    ),
    marcap = Metrics(
        checked = False,
        value = 0
    )
)

#비즈니스 로직

# 주식 선택 화면(/select)
def get_filtered_stocks(stock_page : StockPage):

    stock_list = []

    for i in (stock_page.stock):

        data_code = i.stock_id + ".KS"
        data = get_full_stock_info(data_code)
        

        stock_id = i.stock_id
        stock_name = i.stock_name
        price = data['종가']    #종가
        marcap = data['시가총액']
        eps = data['당기순이익'] / data['총주식수']   
        per = price / eps
        bps = data['순자산'] / data['총주식수']
        pbr = price / bps
        roe = round((data['ROE'] * 100),2)

        close = yf.download(data_code, start="2019-01-03")["Adj Close"]
        rsi = calculate_rsi(close)   
        
        # 필터링 조건
        filtered = True
        if global_filter.PER.checked and per > global_filter.PER.value:
            filtered = False
        if global_filter.PBR.checked and pbr > global_filter.PBR.value:
            filtered = False
        if global_filter.ROE.checked and roe < global_filter.ROE.value:
            filtered = False
        if global_filter.RSI.checked and rsi < global_filter.RSI.value:
            filtered = False
        if global_filter.marcap.checked and marcap < global_filter.marcap.value:
            filtered = False

        if(filtered):
            stock_list.append(Stock(stock_id=stock_id, stock_name=stock_name, price=price))

    return stock_list

@router.post("/stock_page")
def select(stock_page : StockPage):

    stocks = get_filtered_stocks(stock_page)  # 여기에 실제 데이터 가져오기 로직이 들어감
    stock_page = StockPage(stock=stocks)

    return stock_page


# 필터 지표 값 받아오기(/filter)
@router.post("/filter")
def filter(updated_filter : Filter):
    
    global global_filter
    global_filter = updated_filter

    return {"message" : "Metric saved succesfully"}

@router.get("/filter")
def filter():

    return global_filter


# 분석 결과 화면(/result)
@router.get("/analysis/result/{stock_id}", response_model=Result)
def result(stock_id : str):
    
    #stock_id로 db에서 찾기
    # data_code = get_stock_code(stock_id) + ".KS"
    data_code = str(stock_id) + ".KS"
    data = get_full_stock_info(data_code)
    
    #기업 위험도 계산
    close = yf.download(data_code, start="2019-01-03")["Adj Close"]
    returns = close.pct_change().dropna()
    
    annual_ret = round((returns.mean() * 250), 2)
    volatility = round((returns.std() * np.sqrt(250)), 2)


    # stock_name = data.itmsNm    #종목이름
    price = data['종가']    #종가
    dod = data['dod']
    change_rate = data['등락률']    #등락률
    eps = data['당기순이익'] / data['총주식수'] 
    per = round((price / eps),2)
    bps = data['순자산'] / data['총주식수']
    pbr = round((price / bps),2)
    roe = data['ROE'] * 100
    rsi = (calculate_rsi(close))


    stock_prices_360_days = get_stock_prices_360_days(data_code)
    stock_value=stock_prices_360_days['종가']
    # exepect_close = float(predict_next_day_price(stock_value))
    # exepect_close = round(exepect_close, 2)
    
    commend_txt = ""

    
    if(per < 5 and pbr < 1 and roe > 10):
        recommend = True
        commend_txt += "PER과 PBR 값이 작고 ROE 값이 큰 것으로 보아 해당 주식은 과소평가되어 있어 성장 가능성이 높습니다.\n"
        if(rsi > 70):
            commend_txt += "하지만 RSI 값이 너무 커 현재 주식이 단기적인 과매수 상태이므로 상황을 조금 지켜보는 것이 나아 보입니다.\n"
        elif(rsi < 30):
            commend_txt += "또한, RSI 값이 너무 작아 주식이 과매도 상태이므로 높은 수익률을 기대할 수 있습니다.\n"
    else:
        recommend = False
        pre = False
        if(per >=5):
            pre = True
            commend_txt += "PER과 "
        if(pbr >= 1):
            pre = True
            commend_txt += "PBR 값이 "
        if(roe <= 10):
            if(pre):
                commend_txt += "크고 ROE 값이 작은 것으로 보아 주식의 성장 가능성을 보장하기 어렵습니다.\n"
            else:
                commend_txt += "ROE 값이 작은 것으로 보아 주식의 성장 가능성을 보장하기 어렵습니다.\n"
        else:
            commend_txt += "크기 때문에 주식의 성장 가능성을 확신하기 어렵습니다.\n"
        if(rsi > 70):
            commend_txt += "또한, RSI 값이 너무 커 현재 주식이 과매수 상태이므로 매수를 하기엔 무리가 있습니다.\n"
        elif(rsi < 30):
            commend_txt += "하지만 RSI 값이 너무 작아 주식이 과매도 상태이므로 단기적인 이익을 얻을 순 있을 것 같습니다.\n"
    
    
    result = Result(
        # stock_name = stock_name,
        price = price,
        change_rate = change_rate,
        dod = dod,
        per = per,
        pbr = pbr,
        roe = roe,
        rsi = rsi,
        recommend = recommend,
        commend = commend_txt,
        #exepect_close = exepect_close,
        annual_ret = annual_ret,
        volatility = volatility
    )

    return result



