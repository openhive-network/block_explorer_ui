import React, { useContext, useEffect } from "react";
<<<<<<< HEAD
import { Container, Row, Col, Card } from "react-bootstrap";
import { Typography } from "@mui/material";
=======
import { Row, Col } from "react-bootstrap";
>>>>>>> 7efaf0620017e63760595dfddc85e167fc663d3c
import { TranasctionContext } from "../../contexts/transactionContext";
import { BlockContext } from "../../contexts/blockContext";
import OpCard from "../../components/operations/operationCard/OpCard";
import Loader from "../../components/loader/Loader";
import { tidyNumber } from "../../functions/calculations";
import styles from "./transactionPage.module.css";
<<<<<<< HEAD
import HighlightedJSON from "../../components/customJson/HighlightedJSON";
=======
>>>>>>> 7efaf0620017e63760595dfddc85e167fc663d3c

export default function Transaction_Page({ transaction }) {
  document.title = `HAF | Transaction ${transaction}`;
  const { transData } = useContext(TranasctionContext);
  const { block_data, setBlockNumber } = useContext(BlockContext);
  useEffect(() => {
    if (transData || transData !== null) {
      setBlockNumber(transData?.block_num);
    }
  }, [transData, setBlockNumber]);
  const block_time = block_data?.[0]?.timestamp;

<<<<<<< HEAD
  const keys = transData && Object.keys(transData);

  const renderOperations = (operations) => {
    if (operations) {
      return operations?.map((operation) => (
        <Row
          style={{
            textAlign: "start",
            margin: "20px 0",
          }}
        >
          <Typography variant="h5" align="center" sx={{ color: "#ffac33" }}>
            {operation.type}
          </Typography>
          <HighlightedJSON json={operation.value} />
        </Row>
      ));
    }
  };

  const renderRawTransaction = (k) => {
    const renderKey = (data) => {
      return data;
    };
    if (k !== "operations") {
      if (typeof transData?.[k] != "string") {
        return JSON.stringify(transData?.[k]);
      } else {
        return renderKey(transData[k]);
      }
    }
  };
=======
>>>>>>> 7efaf0620017e63760595dfddc85e167fc663d3c
  return (
    <>
      {!transData ||
      transData === null ||
      block_data === null ||
      block_data.length === 0 ? (
        <Loader />
      ) : (
<<<<<<< HEAD
        <Container className={styles.container}>
          <Typography className={styles.text}>
=======
        <div className={styles.container}>
          <p className={styles.text}>
>>>>>>> 7efaf0620017e63760595dfddc85e167fc663d3c
            Transaction <span className={styles.number}>{transaction}</span>{" "}
            <br></br>
            Included in block{" "}
            <span className={styles.number}>
              {tidyNumber(transData?.block_num)}{" "}
            </span>
            at <span className={styles.number}>{block_time} UTC</span>
<<<<<<< HEAD
          </Typography>

          <Row className={styles.operationsContainer}>
            <Col>
              {transData?.operations?.map((op, i) => (
                <Row key={i}>
=======
          </p>

          <Row className="mt-5 justify-content-center">
            <Col md={6}>
              {transData?.operations?.map((op, i) => (
                <div key={i}>
>>>>>>> 7efaf0620017e63760595dfddc85e167fc663d3c
                  <OpCard
                    block={op}
                    full_trx={transData}
                    trx_id={transaction}
                  />
<<<<<<< HEAD
                </Row>
              ))}
            </Col>
          </Row>

          <Row className={styles.rawTransactionContainer}>
            <Typography variant="h4"> Raw transaction </Typography>
            <Row className={styles.infoContainer}>
              {keys?.map((key, index) => (
                <Card key={index} className={styles.infoCard}>
                  <Card.Body className={styles.cardBody}>
                    <Row>
                      <Col className={styles.cardKeyCol}>{key}</Col>
                      <Col className={styles.cardValueCol}>
                        {key === "operations"
                          ? renderOperations(transData?.operations)
                          : renderRawTransaction(key)}
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              ))}
            </Row>
          </Row>
        </Container>
=======
                </div>
              ))}
            </Col>
          </Row>
        </div>
>>>>>>> 7efaf0620017e63760595dfddc85e167fc663d3c
      )}
    </>
  );
}
