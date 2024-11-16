import React, { useState, useEffect } from "react";
import Container from "../components/Container";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";
import styles from "./ResultPage.module.css";

function ResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { companies } = location.state || { companies: [] };

  const [results, setResults] = useState([]);
  const [closingPrices, setClosingPrices] = useState([]);
  const [timePeriod, setTimePeriod] = useState(360);

  // 결과 fetch
  useEffect(() => {
    const fetchResults = async () => {
        if (!companies || companies.length === 0) {
            console.error("No companies to fetch results for.");
            return; // companies가 없으면 함수 종료
        }

        const allResults = [];
        for (const company of companies) {
            if (!company || !company.stock_id) {
                console.error("Invalid company data:", company);
                continue; // 유효하지 않은 회사 데이터가 있으면 건너뛰기
            }

            const encodedCompany = encodeURIComponent(company.stock_id); // URL 인코딩
            const response = await fetch(`http://localhost:8000/analysis/result/${encodedCompany}`);
            if (response.ok) {
                const data = await response.json();
                allResults.push(data);
                // 주가 데이터도 저장
                const prices = await fetchClosingPrices(encodedCompany);
                setClosingPrices((prev) => [...prev, ...prices]);
            } else {
                console.error("Failed to fetch result for:", company);
            }
        }
        setResults(allResults);
    };

    if (companies.length > 0) {
        fetchResults();
    }
}, [companies]);


  // 주가 데이터 fetch
  const fetchClosingPrices = async (company) => {
    const response = await fetch(`http://localhost:8000/analysis/closing-prices/${company}`); // 주가 데이터 API 엔드포인트
    if (response.ok) {
      const data = await response.json();
      return data.prices; // 주가 데이터 반환
    }
    return [];
  };

  // 차트 데이터 가공
  const allData = closingPrices.map((price, index) => ({
    date: `Day ${index + 1}`,
    price: price,
  }));

  const filteredData = timePeriod === 60 ? allData.slice(-60) : timePeriod === 180 ? allData.slice(-180) : allData;

  const backbutton = () => {
    navigate("/result-page", { state: { companies: results } });

  };

  return (
    <>
      <div className={styles.bg} />
      <Container>
        {results.length > 0 && (
          <div className={styles.set}>
            <div className={styles.filterSet}>
              <div className={styles.filterSetHeader}>
                {results.map((result, index) => (
                  <div key={index} className={styles.filterSetTitle}>
                    <p className={styles.companyName}>{result.stock_name}</p>
                    <p className={styles.stockPrice}>{result.price} 원</p>
                    <div className={styles.change}>
                      <p className={styles.change1}>전일 대비</p>
                      <p className={styles.change2}>+{result.dod} ({result.change_rate}%)</p>
                    </div>
                    <div className={styles.metrics}>
                      <div className={styles.metric}>
                        <p className={styles.metricType}>PER</p>
                        <p className={styles.metricDetail}>{result.per}</p>
                      </div>
                      <div className={styles.metric}>
                        <p className={styles.metricType}>PBR</p>
                        <p className={styles.metricDetail}>{result.pbr}</p>
                      </div>
                      <div className={styles.metric}>
                        <p className={styles.metricType}>ROE</p>
                        <p className={styles.metricDetail}>{result.roe}%</p>
                      </div>
                      <div className={styles.metric}>
                        <p className={styles.metricType}>RSI</p>
                        <p className={styles.metricDetail}>{result.rsi}</p>
                      </div>
                      <div className={styles.metric}>
                        <p className={styles.metricType}>내일의 종가</p>
                        <p className={styles.metricDetail}>{result.exepect_close} 원</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className={styles.buttonGroup}>
                <button
                  className={styles.periodButton}
                  onClick={() => setTimePeriod(60)}
                  style={{ backgroundColor: timePeriod === 60 ? '#af52de' : '#ccc' }}
                >
                  60일
                </button>
                <button
                  className={styles.periodButton}
                  onClick={() => setTimePeriod(180)}
                  style={{ backgroundColor: timePeriod === 180 ? '#af52de' : '#ccc' }}
                >
                  180일
                </button>
                <button
                  className={styles.periodButton}
                  onClick={() => setTimePeriod(360)}
                  style={{ backgroundColor: timePeriod === 360 ? '#af52de' : '#ccc' }}
                >
                  360일
                </button>
              </div>
              <div className={styles.chart}>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={filteredData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="5 5" stroke="#ccc" />
                    <XAxis dataKey="date" angle={-45} textAnchor="end" />
                    <YAxis tickFormatter={(value) => `${value.toLocaleString()} 원`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#fff", border: "1px solid #ccc" }} 
                      labelStyle={{ color: "#888" }} 
                    />
                    <Legend />
                    <ReferenceLine
                      y={filteredData[filteredData.length - 1].price}
                      label={{
                        value: "현재가",
                        offset: 10
                      }}
                      stroke="red"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="price" 
                      stroke="#af52de" 
                      strokeWidth={3} 
                      dot={{ stroke: '#af52de', strokeWidth: 2, fill: '#fff' }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className={styles.set}>
              <div className={styles.filterSet}>
                <div className={styles.CompanyTitle}>
                  <p>위험도 평가</p>
                </div>
                <div className={styles.CompanyRec}>
                  <p>기대 수익률, 수익률 변동성, 샤프지수</p>
                </div>
                <div className={styles.companyDetail}>
                  <p>기대 수익률, 수익률 변동성, 샤프지수 등의 위험도 평가</p>
                </div>
              </div>
            </div>

            <div className={styles.set}>
              <div className={styles.filterSet}>
                <div className={styles.CompanyTitle}>
                  <p>{results[0].stock_name}에 대한 평가</p>
                </div>
                <div className={styles.CompanyRec}>
                  <p>{results[0].recommend ? "추천합니다" : "비추천합니다"}</p>
                </div>
                <div className={styles.companyDetail}>
                  <p>
                    (비)추천에 대한 이유 설명 <br />
                    기준은 pbr &lt; 1, per &lt; 5, roe &gt; 10, rsi &lt; 30는 매수, rsi &gt; 70은 매도
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.button}>
              <button className={styles.backButton} onClick={backbutton}>
                돌아가기
              </button>
            </div>
          </div>

        )}
      </Container>
    </>
  );
}

export default ResultPage;
