import requests
import yfinance as yf
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from tensorflow.python.keras import layers, models
from tensorflow.python.keras.models import Sequential
from tensorflow.python.keras.layers import Dense
# from tensorflow.python.keras.layers import LSTM



def get_stock_code(api_key, company_name):
    """
    공공데이터포털 API를 통해 기업명으로 종목 코드를 조회하는 함수
    """
    # 종목명으로 주가 정보를 조회하는 URL
    url = f"https://apis.data.go.kr/1160100/service/GetStockSecuritiesInfoService/getStockPriceInfo?serviceKey={api_key}&numOfRows=1&pageNo=1&resultType=json&itmsNm={company_name}"
    response = requests.get(url)
    
    if response.status_code == 200:
        data = response.json()
        items = data.get('response', {}).get('body', {}).get('items', {}).get('item', [])
        
        # 데이터가 존재하면 종목명과 종목코드 반환
        if items:
            stock_data = items[0]
            return stock_data.get('srtnCd')  # 종목코드 반환
        else:
            print(f"{company_name}에 대한 종목 코드를 찾을 수 없습니다.")
            return None
    else:
        print("공공데이터포털 API 호출 실패:", response.status_code)
        return None

def get_stock_prices_360_days(ticker):
    """
    주어진 티커(ticker)를 입력받아 최근 360일간의 종가, 시가, 저가, 고가를 리스트로 반환하는 함수
    """
    # Yahoo Finance에서 해당 종목의 Ticker 객체 생성
    stock_data = yf.Ticker(ticker)
    
    # 최근 1년치의 일별 주가 데이터 가져오기
    historical_data = stock_data.history(period="1y")
    
    # 종가, 시가, 고가, 저가 데이터를 리스트로 추출
    closing_prices = historical_data['Close'].tolist()
    opening_prices = historical_data['Open'].tolist()
    high_prices = historical_data['High'].tolist()
    low_prices = historical_data['Low'].tolist()
    
    # 결과를 딕셔너리 형태로 반환
    return {
        "종가": closing_prices,
        "시가": opening_prices,
        "고가": high_prices,
        "저가": low_prices
    }

def get_full_stock_info(ticker):
    """
    주어진 티커(ticker)를 입력받아 종가, 시가, 저가, 고가, 시가총액, 당기순이익, 총주식수를 반환하는 함수
    """
    # Yahoo Finance에서 해당 종목의 Ticker 객체 생성
    stock_data = yf.Ticker(ticker)
    
    # 주가 데이터 가져오기 (최근 5일 데이터를 가져와 최신 데이터 사용)
    historical_data = stock_data.history(period="5d")
    latest_data = historical_data.iloc[-1] if not historical_data.empty else None

    # 종목의 정보 가져오기
    info = stock_data.info
    
    # 데이터 추출
    result = {
        "종가": latest_data['Close'] if latest_data is not None else 'N/A',
        "시가": latest_data['Open'] if latest_data is not None else 'N/A',
        "고가": latest_data['High'] if latest_data is not None else 'N/A',
        "저가": latest_data['Low'] if latest_data is not None else 'N/A',
        "시가총액": info.get('marketCap', 'N/A'),
        "당기순이익": info.get('netIncomeToCommon', 'N/A'),
        "총주식수": info.get('sharesOutstanding', 'N/A'),
        "ROE": info.get('returnOnEquity', 'N/A'),
        "순자산" : info.get('netIncomeToCommon', 'N/A'),
        "dod" : float(info.get('currentPrice', 'N/A')) - float(info.get('previousClose', 'N/A')),
        "등락률" : ((float(info.get('currentPrice', 'N/A')) - float(info.get('previousClose', 'N/A'))) / info.get('previousClose', 'N/A') * 100)
    }
    
    return result

# def predict_next_day_price(closing_prices):
#     # 데이터 전처리
#     scaler = MinMaxScaler(feature_range=(0, 1))
#     scaled_data = scaler.fit_transform(np.array(closing_prices).reshape(-1, 1))

#     # 학습 데이터 생성 (60일 데이터로 다음날을 예측)
#     sequence_length = 60
#     x_train, y_train = [], []

#     for i in range(sequence_length, len(scaled_data)):
#         x_train.append(scaled_data[i-sequence_length:i, 0])
#         y_train.append(scaled_data[i, 0])

#     x_train, y_train = np.array(x_train), np.array(y_train)
#     x_train = np.reshape(x_train, (x_train.shape[0], x_train.shape[1], 1))

#     # LSTM 모델 구성
#     model = Sequential([
#         LSTM(units=50, return_sequences=True, input_shape=(x_train.shape[1], 1)),
#         LSTM(units=50, return_sequences=False),
#         Dense(units=25),
#         Dense(units=1)
#     ])

#     model.compile(optimizer='adam', loss='mean_squared_error')
#     model.fit(x_train, y_train, batch_size=1, epochs=10, verbose=1)

#     # 다음날 예측하기 위한 입력 데이터 생성 (마지막 60일 데이터)
#     last_60_days = scaled_data[-sequence_length:]
#     X_test = np.reshape(last_60_days, (1, sequence_length, 1))

#     # 예측 및 스케일 복원
#     predicted_price = model.predict(X_test)
#     predicted_price = scaler.inverse_transform(predicted_price)

#     return predicted_price[0][0]


