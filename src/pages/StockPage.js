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
                const response = await fetch("/stock_page.json"); // 경로 수정
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

    const handleSuggestionClick = (stock) => {
        if (selectedCompanies.length >= 5) {
            alert("5개까지만 선택할 수 있습니다.");
            return;
        }
        if (!selectedCompanies.some(selected => selected.stock_id === stock.stock_id)) {
            setSelectedCompanies(prev => [...prev, stock]); // stock 객체를 추가
        }
        setSearchTerm("");
        setFilteredStocks([]);
    };

    const handleRemoveCompany = (stockId) => {
        setSelectedCompanies(selectedCompanies.filter((item) => item.stock_id !== stockId));
    };

    const analyzebutton = async () => {
        if (selectedCompanies.length > 0) {
            setLoading(true);
            console.log("Analyzing Companies:", selectedCompanies); // 분석할 기업 출력
            try {
                const results = await Promise.all(
                    selectedCompanies.map(async (company) => {
                        const response = await fetch(`http://localhost:8000/analysis/result/${company.stock_id}`);
                        if (response.ok) {
                            return await response.json();
                        } else {
                            console.error("Failed to fetch data for:", company);
                            return null;
                        }
                    })
                );
                
                setLoading(false);
                navigate("/result-page", { state: { companies: results } });
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
                    {filteredStocks.length > 0 && (
                        <ul className={styles.suggestions}>
                            {filteredStocks.map((stock) => (
                                <li
                                    key={stock.stock_id}
                                    onClick={() => handleSuggestionClick(stock)}
                                    className={styles.suggestionItem}
                                >
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
