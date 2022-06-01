import React, { useContext } from "react";
import { Row, Col } from "react-bootstrap";
// import { Link } from "react-router-dom";
// import HighlightedJSON from "../components/HighlightedJSON";
import { TranasctionContext } from "../contexts/transactionContext";
// import GetOperations from "../operations";
import OpCard from "../components/OpCard";

export default function Transaction_Page({ transaction, setTitle }) {
  // setTitle(`HAF | Transaction`);
  const { transData } = useContext(TranasctionContext);
  // const trnasToJson = JSON.stringify(transData, null, 2);

  // const [seconds, setSeconds] = useState(60);

  // const timeout = setTimeout(() => {
  //   setSeconds(seconds - 1);
  // }, 1000);

  // if (seconds <= 0) {
  //   clearTimeout(timeout);
  //   window.location.reload();
  // }

  /* {transData === null ? (
    <p>
      Note : New transactions need time to show up. <br></br>Transaction
      will be shown in : {seconds}{" "}
    </p>
  ) : ( */
  // console.log(transData);
  // <>

  return (
    <>
      {!transData ? (
        "Loading"
      ) : transData === null ? (
        "No data"
      ) : (
        <>
          <h1>Transaction Page</h1> <h4>Transaction ID : {transaction}</h4>
          <Row className="mt-5 justify-content-center">
            <Col sm={6}>
              {transData?.operations?.map((op, i) => (
                <OpCard block={op} index={i} full_trx={transData} trx_id={transaction} />
              ))}
            </Col>
          </Row>
          {/* <Row className="mt-5 justify-content-center">
            <Col sm={6}>
              <div
                style={{
                  // width: "50vw",
                  height: "60vh",
                  wordBreak: "break-word",
                  whiteSpace: "pre-wrap",
                  overflow: "auto",
                  background: "#091B4B",
                  borderRadius: "25px",
                  padding: "20px",
                }}
                className="transaction__json"
              >
                <HighlightedJSON json={transData} />
              </div>
            </Col>
          </Row> */}
        </>
      )}
    </>
  );

  /* )} */
}
