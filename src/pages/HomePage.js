import Container from "../components/Container";
import styles from "./HomePage.module.css";
import { useNavigate } from "react-router-dom";

function HomePage() {
  const navigate = useNavigate();
  const startbutton = () => {
    navigate("/stock-page");
  };
  return (
    <>
      <div className={styles.bg} />
      <Container className={styles.container}>
        <div className={styles.texts}>
          <p className={styles.description}>포트폴리오 추천 및 리스크 예측</p>
          <h1 className={styles.heading}>
            <strong>Pro-포폴</strong>
          </h1>
          <div className={styles.button}>
            <button className={styles.startButton} onClick={startbutton}>
              시작하기
            </button>
          </div>
        </div>
      </Container>
    </>
  );
}

export default HomePage;
