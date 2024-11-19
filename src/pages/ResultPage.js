// import React, { useState, useEffect } from "react";
// import Container from "../components/Container";
// import { useLocation, useNavigate, useParams } from "react-router-dom";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
//   Legend,
//   ReferenceLine,
// } from "recharts";
// import styles from "./ResultPage.module.css";

// function ResultPage() {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { companies } = location.state || { companies: [] };
//   const { stockId } = useParams(); // useParams를 사용하여 stockId 가져오기

//   const [results, setResults] = useState([]);
//   const [closingPrices, setClosingPrices] = useState([]);
//   const [timePeriod, setTimePeriod] = useState(360);

//   // 결과 fetch
//   useEffect(() => {
//     const fetchResults = async () => {
//       if (!companies || companies.length === 0) {
//         console.error("No companies to fetch results for.");
//         return;
//       }

//       const allResults = [];
//       const allPrices = [];

//       // stockId를 사용하여 특정 주식의 데이터만 가져오기
//       const encodedStockId = encodeURIComponent(stockId);
//       try {
//         const response = await fetch(`http://localhost:8000/analysis/result/${encodedStockId}`);
//         if (response.ok) {
//           const data = await response.json();
//           allResults.push(data);

//           // 주가 데이터도 저장
//           const prices = await fetchClosingPrices(encodedStockId);
//           allPrices.push(...prices);
//         } else {
//           console.error("Failed to fetch result for:", stockId);
//         }
//       } catch (error) {
//         console.error("Error fetching data:", error);
//       }

//       setResults(allResults);
//       setClosingPrices(allPrices);
//     };

//     fetchResults();
//   }, [companies, stockId]); // stockId를 의존성 배열에 추가

//   // 주가 데이터 fetch
//   // const fetchClosingPrices = async (company) => {
//   //   try {
//   //     const response = await fetch(`http://localhost:8000/analysis/closing-prices/${company}`);
//   //     if (response.ok) {
//   //       const data = await response.json();
//   //       return data.prices;
//   //     }
//   //   } catch (error) {
//   //     console.error("Error fetching closing prices:", error);
//   //   }
//   //   return [];
//   // };

//   const fetchClosingPrices = async (company) => {
//     try {
//         const response = await fetch(`http://localhost:8000/analysis/closing-prices/${company}`);
//         if (response.ok) {
//             const data = await response.json();
//             console.log("Closing Prices Data:", data); // 데이터 구조 확인
//             return data; // 필요한 데이터 구조에 맞게 수정
//         }
//     } catch (error) {
//         console.error("Error fetching closing prices:", error);
//     }
//     return []; // 기본값으로 빈 배열 반환
// };


//   // 차트 데이터 가공
//   const allData = closingPrices.map((price, index) => ({
//     date: `Day ${index + 1}`,
//     price: price,
//   }));

//   const filteredData = timePeriod === 60 ? allData.slice(-60) : timePeriod === 180 ? allData.slice(-180) : allData;

//   const backbutton = () => {
//     navigate("/result-page", { state: { companies: results } });
//   };

//   return (
//     <>
//       <div className={styles.bg} />
//       <Container>
//         {results.length > 0 && (
//           <div className={styles.set}>
//             <div className={styles.filterSet}>
//               <div className={styles.filterSetHeader}>
//                 {results.map((result, index) => (
//                   <div key={index} className={styles.filterSetTitle}>
//                     <p className={styles.companyName}>{result.stock_name}</p>
//                     <p className={styles.stockPrice}>{result.price} 원</p>
//                     <div className={styles.change}>
//                       <p className={styles.change1}>전일 대비</p>
//                       <p className={styles.change2}>+{result.dod} ({result.change_rate}%)</p>
//                     </div>
//                     <div className={styles.metrics}>
//                       <div className={styles.metric}>
//                         <p className={styles.metricType}>PER</p>
//                         <p className={styles.metricDetail}>{result.per}</p>
//                       </div>
//                       <div className={styles.metric}>
//                         <p className={styles.metricType}>PBR</p>
//                         <p className={styles.metricDetail}>{result.pbr}</p>
//                       </div>
//                       <div className={styles.metric}>
//                         <p className={styles.metricType}>ROE</p>
//                         <p className={styles.metricDetail}>{result.roe}%</p>
//                       </div>
//                       <div className={styles.metric}>
//                         <p className={styles.metricType}>RSI</p>
//                         <p className={styles.metricDetail}>{result.rsi}</p>
//                       </div>
//                       <div className={styles.metric}>
//                         <p className={styles.metricType}>내일의 종가</p>
//                         <p className={styles.metricDetail}>{result.rsi} 원</p>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//               <div className={styles.buttonGroup}>
//                 {[60, 180, 360].map(period => (
//                   <button
//                     key={period}
//                     className={styles.periodButton}
//                     onClick={() => setTimePeriod(period)}
//                     style={{ backgroundColor: timePeriod === period ? '#af52de' : '#ccc' }}
//                   >
//                     {period}일
//                   </button>
//                 ))}
//               </div>
//               <div className={styles.chart}>
//                 <ResponsiveContainer width="100%" height={350}>
//                   <LineChart data={filteredData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
//                     <CartesianGrid strokeDasharray="5 5" stroke="#ccc" />
//                     <XAxis dataKey="date" angle={-45} textAnchor="end" />
//                     <YAxis tickFormatter={(value) => `${value.toLocaleString()} 원`} />
//                     <Tooltip 
//                       contentStyle={{ backgroundColor: "#fff", border: "1px solid #ccc" }} 
//                       labelStyle={{ color: "#888" }} 
//                     />
//                     <Legend />
//                     <ReferenceLine
//                       y={filteredData[filteredData.length - 1]?.price}
//                       label={{
//                         value: "현재가",
//                         offset: 10
//                       }}
//                       stroke="red"
//                     />
//                     <Line 
//                       type="monotone" 
//                       dataKey="price" 
//                       stroke="#af52de" 
//                       strokeWidth={3} 
//                       dot={{ stroke: '#af52de', strokeWidth: 2, fill: '#fff' }} 
//                     />
//                   </LineChart>
//                 </ResponsiveContainer>
//               </div>
//             </div>

//             <div className={styles.set}>
//               <div className={styles.filterSet}>
//                 <div className={styles.CompanyTitle}>
//                   <p>위험도 평가</p>
//                 </div>
//                 <div className={styles.CompanyRec}>
//                   <p>기대 수익률, 수익률 변동성, 샤프지수</p>
//                 </div>
//                 <div className={styles.companyDetail}>
//                   <p>기대 수익률, 수익률 변동성, 샤프지수 등의 위험도 평가</p>
//                 </div>
//               </div>
//             </div>

//             <div className={styles.set}>
//               <div className={styles.filterSet}>
//                 <div className={styles.CompanyTitle}>
                  
//                   <p>{results[0].stock_name}에 대한 평가</p>
//                 </div>
//                 <div className={styles.CompanyRec}>
//                   <p>{results[0].recommend ? "추천합니다" : "비추천합니다"}</p>
//                 </div>
//                 <div className={styles.filterSetHeader}>
//                 {results.map((result, index) => (
//                 <div className={styles.companyDetail}>
//                   <p>
//                   {result.commend}
//                   </p>
//                   </div>
//                 ))}
//                 </div>
//               </div>
//             </div>

//             <div className={styles.button}>
//               <button className={styles.backButton} onClick={backbutton}>
//                 돌아가기
//               </button>
//             </div>
//           </div>
//         )}
//       </Container>
//     </>
//   );
// }

// export default ResultPage;




import React, { useState, useEffect } from "react";
import Container from "../components/Container";
import { useLocation, useNavigate, useParams } from "react-router-dom";
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
  const { stockId } = useParams();

  const [results, setResults] = useState([]);
  const [closingPrices, setClosingPrices] = useState([]);
  const [timePeriod, setTimePeriod] = useState(360);

  useEffect(() => {
    const fetchResults = async () => {
      if (!companies || companies.length === 0) {
        console.error("No companies to fetch results for.");
        return;
      }

      const allResults = [];
      const allPrices = [];

      const encodedStockId = encodeURIComponent(stockId);
      try {
        const response = await fetch(`http://localhost:8000/analysis/result/${encodedStockId}`);
        if (response.ok) {
          const data = await response.json();
          allResults.push(data);

          // 주가 데이터도 저장
          const prices = await fetchClosingPrices(encodedStockId);
          allPrices.push(...prices);
        } else {
          console.error("Failed to fetch result for:", stockId);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }

      setResults(allResults);
      setClosingPrices(allPrices);
    };

    fetchResults();
  }, [companies, stockId]);

  const fetchClosingPrices = async (company) => {
    try {
      const response = await fetch(`http://localhost:8000/analysis/closing-prices/${company}`);
      if (response.ok) {
        const data = await response.json();
        console.log("Closing Prices Data:", data); // 데이터 구조 확인
        return data; // 종가 데이터가 배열로 반환되어야 함
      }
    } catch (error) {
      console.error("Error fetching closing prices:", error);
    }
    return []; // 기본값으로 빈 배열 반환
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
                      <p className={styles.change2}>{result.dod} ({result.change_rate}%)</p>
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
                        <p className={styles.metricType}>예측 종가</p>
                        <p className={styles.metricDetail}>{result.price} 원</p> {/* 내일의 종가는 가격으로 수정 */}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className={styles.buttonGroup}>
                {[60, 180, 360].map(period => (
                  <button
                    key={period}
                    className={styles.periodButton}
                    onClick={() => setTimePeriod(period)}
                    style={{ backgroundColor: timePeriod === period ? '#af52de' : '#ccc' }}
                  >
                    {period}일
                  </button>
                ))}
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
                      y={filteredData[filteredData.length - 1]?.price}
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
                {results.map((result, index) => (
                <div className={styles.companyDetail}>
                  <p>기대 수익률: {result.annual_ret}</p>
                  <p>수익률 변동성: {result.volatility}</p>
                </div>
        ))}
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
                <div className={styles.filterSetHeader}>
                  {results.map((result, index) => (
                    <div className={styles.companyDetail} key={index}>
                      <p>{result.commend}</p>
                    </div>
                  ))}
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
