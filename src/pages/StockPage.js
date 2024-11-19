// import React, { useState, useEffect } from "react";
// import Container from "../components/Container";
// import { useNavigate } from "react-router-dom";
// import styles from "./StockPage.module.css";
// import LoadingPage from "../components/Loading";

// function StockPage() {
//     const navigate = useNavigate();
//     const [selectedCompanies, setSelectedCompanies] = useState(() => {
//         const savedCompanies = sessionStorage.getItem("selectedCompanies");
//         return savedCompanies ? JSON.parse(savedCompanies) : [];
//     });
//     const [searchTerm, setSearchTerm] = useState("");
//     const [filteredStocks, setFilteredStocks] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [stocks, setStocks] = useState([]);

//     useEffect(() => {
//         sessionStorage.setItem("selectedCompanies", JSON.stringify(selectedCompanies));
//     }, [selectedCompanies]);

//     useEffect(() => {
//         const fetchStocks = async () => {
//             try {
//                 const response = await fetch("/stock_page.json"); // 경로 수정
//                 const data = await response.json();
//                 setStocks(data.stock);
//             } catch (error) {
//                 console.error("Error fetching stock data:", error);
//             }
//         };
//         fetchStocks();
//     }, []);

//     const handleChange = (event) => {
//         const value = event.target.value;
//         setSearchTerm(value);

//         if (value) {
//             const filtered = stocks.filter((stock) =>
//                 stock.stock_name.toLowerCase().includes(value.toLowerCase())
//             );
//             setFilteredStocks(filtered);
//         } else {
//             setFilteredStocks([]);
//         }
//     };

//     const handleSuggestionClick = (stock) => {
//         if (selectedCompanies.length >= 5) {
//             alert("5개까지만 선택할 수 있습니다.");
//             return;
//         }
//         if (!selectedCompanies.some(selected => selected.stock_id === stock.stock_id)) {
//             setSelectedCompanies(prev => [...prev, stock]); // stock 객체를 추가
//         }
//         setSearchTerm("");
//         setFilteredStocks([]);
//     };

//     const handleRemoveCompany = (stockId) => {
//         setSelectedCompanies(selectedCompanies.filter((item) => item.stock_id !== stockId));
//     };

//     const analyzebutton = async () => {
//         if (selectedCompanies.length > 0) {
//             setLoading(true);
//             console.log("Analyzing Companies:", selectedCompanies); // 분석할 기업 출력
//             try {
//                 const results = await Promise.all(
//                     selectedCompanies.map(async (company) => {
//                         const response = await fetch(`http://localhost:8000/analysis/result/${company.stock_id}`);
//                         if (response.ok) {
//                             const data = await response.json();
//                             console.log("Fetched Data for", company.stock_id, ":", data); // 데이터 출력
//                             return {
//                                 stock_id: company.stock_id, // stock_id 추가
//                                 stock_name: company.stock_name, // stock_name 추가
//                                 ...data // 나머지 데이터 추가
//                             };
//                         } else {
//                             console.error("Failed to fetch data for:", company);
//                             return null; // 실패한 경우 null 반환
//                         }
//                     })
//                 );

//                 const filteredResults = results.filter(result => result !== null);
//                 console.log("Filtered Results:", filteredResults); // 필터링된 결과 출력

//                 setLoading(false); // 로딩 종료

//                 if (filteredResults.length > 0) {
//                     const firstResult = filteredResults[0];
//                     console.log("First Result:", firstResult); // 첫 번째 결과 출력
//                     if (firstResult?.stock_id) {
//                         navigate(`/analysis/result/${firstResult.stock_id}`, { state: { companies: filteredResults } });
//                     } else {
//                         alert("분석할 수 있는 데이터가 없습니다."); // stock_id가 없는 경우 알림
//                     }
//                 } else {
//                     alert("분석할 수 있는 데이터가 없습니다."); // 데이터가 없는 경우 알림
//                 }
//             } catch (error) {
//                 console.error("Error fetching data:", error);
//                 setLoading(false); // 에러 발생 시 로딩 종료
//             }
//         } else {
//             alert("분석할 기업을 선택해 주세요."); // 선택된 기업이 없을 경우 알림
//         }
//     };

//     const recbutton = () => {
//         navigate("/filter-page");
//     };

//     const Card = ({ company, onRemove }) => (
//         <div className={styles.card}>
//             <div className={styles.cardContent}>
//                 <h3>{company.stock_name}</h3>
//             </div>
//             <button onClick={() => onRemove(company.stock_id)} className={styles.removeButton}>
//                 삭제
//             </button>
//         </div>
//     );

//     if (loading) return <LoadingPage />;

//     return (
//         <>
//             <div className={styles.bg} />
//             <Container>
//                 <div className={styles.searchContainer}>
//                     <input
//                         type="text"
//                         value={searchTerm}
//                         onChange={handleChange}
//                         className={styles.searchInput}
//                         placeholder="관심 기업명을 입력해주세요"
//                     />
//                     {filteredStocks.length > 0 && (
//                         <ul className={styles.suggestions}>
//                             {filteredStocks.map((stock) => (
//                                 <li
//                                     key={stock.stock_id}
//                                     onClick={() => handleSuggestionClick(stock)}
//                                     className={styles.suggestionItem}
//                                 >
//                                     {stock.stock_name}
//                                 </li>
//                             ))}
//                         </ul>
//                     )}
//                 </div>
//                 <div className={styles.set}>
//                     <div className={styles.stockRec}>
//                         <div className={styles.stockRecDes}>
//                             <p>관심 기업 / 종목</p>
//                             <button className={styles.recButton} onClick={recbutton}>
//                                 필터설정
//                             </button>
//                         </div>

//                         <div className={styles.cardContainer}>
//                             {selectedCompanies.length === 0 ? (
//                                 <p className={styles.placeholder}>
//                                     관심 기업/종목을 추가해주세요
//                                 </p>
//                             ) : (
//                                 selectedCompanies.map((company) => (
//                                     <Card key={company.stock_id} company={company} onRemove={handleRemoveCompany} />
//                                 ))
//                             )}
//                         </div>
//                     </div>
//                 </div>
//                 <div className={styles.button}>
//                     <button className={styles.analyzeButton} onClick={analyzebutton}>
//                         분석하기
//                     </button>
//                 </div>
//             </Container>
//         </>
//     );
// }

// export default StockPage;
import React, { useState, useEffect } from "react";
import Container from "../components/Container";
import { useNavigate } from "react-router-dom";
import styles from "./StockPage.module.css";
import LoadingPage from "../components/Loading";

function StockPage() {
    const navigate = useNavigate();
    const [selectedCompanies, setSelectedCompanies] = useState(() => {
        const savedCompanies = sessionStorage.getItem("selectedCompanies");
        return savedCompanies ? JSON.parse(savedCompanies) : [];
    });
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredStocks, setFilteredStocks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [stocks, setStocks] = useState([]);

    useEffect(() => {
        sessionStorage.setItem("selectedCompanies", JSON.stringify(selectedCompanies));
    }, [selectedCompanies]);

    useEffect(() => {
        const fetchStocks = async () => {
            try {
                const response = await fetch("/stock_page.json");
                const data = await response.json();
                setStocks(data.stock);
            } catch (error) {
                console.error("Error fetching stock data:", error);
            }
        };
        fetchStocks();
    }, []);

    const handleChange = (event) => {
        const value = event.target.value;
        setSearchTerm(value);

        if (value) {
            const filtered = stocks.filter((stock) =>
                stock.stock_name.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredStocks(filtered);
        } else {
            setFilteredStocks([]);
        }
    };

    const handleAddCompany = async () => {
        if (searchTerm) {
            try {
                const response = await fetch(`http://localhost:8000/analysis/stock_page`, {
                    method: 'POST', 
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ stock_name: searchTerm }) 
                });
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error("Error response:", errorText);
                    alert("API 호출에 실패했습니다: " + response.status);
                    return;
                }
                const data = await response.json();
                if (data.message) {
                    alert(data.message);
                } else {
                    if (!selectedCompanies.some(selected => selected.stock_id === data.stock_id)) {
                        setSelectedCompanies(prev => [...prev, {
                            stock_id: data.stock_id,
                            stock_name: data.stock_name,
                            price: data.price
                        }]);
                    } else {
                        alert("이미 추가된 기업입니다.");
                    }
                    setSearchTerm("");
                    setFilteredStocks([]);
                }
            } catch (error) {
                console.error("Error adding company:", error);
                alert("기업 추가 중 오류가 발생했습니다.");
            }
        }
    };
    
    

    const handleRemoveCompany = (stockId) => {
        setSelectedCompanies(selectedCompanies.filter((item) => item.stock_id !== stockId));
    };

    const analyzebutton = async () => {
        if (selectedCompanies.length > 0) {
            setLoading(true);
            try {
                const results = await Promise.all(
                    selectedCompanies.map(async (company) => {
                        const response = await fetch(`http://localhost:8000/analysis/result/${company.stock_id}`);
                        if (response.ok) {
                            const data = await response.json();
                            return {
                                stock_id: company.stock_id,
                                stock_name: company.stock_name,
                                price: company.price, // 가격 추가
                                ...data
                            };
                        } else {
                            return null;
                        }
                    })
                );

                const filteredResults = results.filter(result => result !== null);
                setLoading(false);

                if (filteredResults.length > 0) {
                    navigate(`/analysis/result`, { state: { companies: filteredResults } });
                } else {
                    alert("분석할 수 있는 데이터가 없습니다.");
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                setLoading(false);
            }
        } else {
            alert("분석할 기업을 선택해 주세요.");
        }
    };

    const recbutton = () => {
        navigate("/filter-page");
    };

    const Card = ({ company, onRemove }) => (
        <div className={styles.card}>
            <div className={styles.cardContent}>
                <h3>{company.stock_name}</h3>
                <p>가격: {company.price} 원</p> {/* 가격 표시 추가 */}
            </div>
            <button onClick={() => onRemove(company.stock_id)} className={styles.removeButton}>
                삭제
            </button>
        </div>
    );

    if (loading) return <LoadingPage />;

    return (
        <>
            <div className={styles.bg} />
            <Container>
                <div className={styles.searchContainer}>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleChange}
                        className={styles.searchInput}
                        placeholder="관심 기업명을 입력해주세요"
                    />
                    <button onClick={handleAddCompany} className={styles.addButton}>추가하기</button>
                    {filteredStocks.length > 0 && (
                        <ul className={styles.suggestions}>
                            {filteredStocks.map((stock) => (
                                <li key={stock.stock_id} className={styles.suggestionItem}>
                                    {stock.stock_name}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className={styles.set}>
                    <div className={styles.stockRec}>
                        <div className={styles.stockRecDes}>
                            <p>관심 기업 / 종목</p>
                            <button className={styles.recButton} onClick={recbutton}>
                                필터설정
                            </button>
                        </div>

                        <div className={styles.cardContainer}>
                            {selectedCompanies.length === 0 ? (
                                <p className={styles.placeholder}>
                                    관심 기업/종목을 추가해주세요
                                </p>
                            ) : (
                                selectedCompanies.map((company) => (
                                    <Card key={company.stock_id} company={company} onRemove={handleRemoveCompany} />
                                ))
                            )}
                        </div>
                    </div>
                </div>
                <div className={styles.button}>
                    <button className={styles.analyzeButton} onClick={analyzebutton}>
                        분석하기
                    </button>
                </div>
            </Container>
        </>
    );
}

export default StockPage;
