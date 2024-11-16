import React, { useState, useEffect } from "react";
import Container from "../components/Container";
import { useNavigate } from "react-router-dom";
import styles from "./FilterPage.module.css";

function FilterPage() {
  const navigate = useNavigate();

  const [filters, setFilters] = useState(() => {
    const savedFilters = sessionStorage.getItem("filters");
    return savedFilters
      ? JSON.parse(savedFilters)
      : {
          PER: { checked: false, value: "" },
          PBR: { checked: false, value: "" },
          ROE: { checked: false, value: "" },
          RSI: { checked: false, value: "" },
          marcap: { checked: false, value: "" },
        };
  });

  useEffect(() => {
    const fetchFilters = async () => {
      const response = await fetch("/filter.json"); 
      const data = await response.json();
      setFilters(data); 
    };
    fetchFilters();
  }, []);

  useEffect(() => {
    sessionStorage.setItem("filters", JSON.stringify(filters));
  }, [filters]);

  const setbutton = () => {
    navigate("/stock-page");
  };

  const handleCheckboxChange = (e, key) => {
    setFilters({
      ...filters,
      [key]: { ...filters[key], checked: e.target.checked },
    });
  };

  const handleInputChange = (e, key) => {
    setFilters({
      ...filters,
      [key]: { ...filters[key], value: e.target.value },
    });
  };

  return (
    <>
      <div className={styles.bg} />
      <Container>
        <div className={styles.set}>
          <div className={styles.filterSet}>
            <div className={styles.filterSetTitle}>
              <p>필터 설정</p>
            </div>

            <div className={styles.filterSetDec}>
              {["PER", "PBR", "ROE", "RSI", "marcap"].map((filter) => (
                <div className={styles.filterItem} key={filter}>
                  <label className={styles.customCheckbox}>
                    <input
                      type="checkbox"
                      name="filter"
                      checked={filters[filter].checked}
                      onChange={(e) => handleCheckboxChange(e, filter)}
                    />
                    <span className={styles.checkboxMark}></span>
                    {filter}
                  </label>
                  <input
                    type="text"
                    placeholder="입력해주세요"
                    value={filters[filter].value}
                    onChange={(e) => handleInputChange(e, filter)}
                    className={styles.inputField}
                    disabled={!filters[filter].checked}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className={styles.button}>
          <button className={styles.setButton} onClick={setbutton}>
            설정하기
          </button>
        </div>
      </Container>
    </>
  );
}

export default FilterPage;
