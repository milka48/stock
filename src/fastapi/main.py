from typing import Optional
from fastapi import FastAPI
from .router.analysisRouter import router as analysisRouter
import datetime
from fastapi.staticfiles import StaticFiles
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from tensorflow.python.keras import layers, models


app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # 두 가지 출처 모두 허용
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],  # "*"로 설정하면 모든 출처 허용 (테스트 후 필요한 출처만 허용)
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

app.include_router(analysisRouter, prefix="/analysis")



if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)