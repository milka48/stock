// src/components/LoadingPage.js

import React from "react";
import styles from "./Loading.module.css";
import Container from "./Container";
import { BeatLoader } from "react-spinners";

function LoadingPage({ loadingImage }) {
  return (
    <Container className={styles.container}>

      <div className={styles.textcontainer}>
        <p>분석중</p>

        <BeatLoader color="#af52de" size={50} className={styles.loader} />
      </div>
    </Container>
  );
}

export default LoadingPage;
