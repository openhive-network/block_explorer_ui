import { useState, createContext, useEffect } from "react";
import axios from "axios";

export const TranasctionContext = createContext();

export const TranasctionContextProvider = ({ children }) => {
  const [transData, setTransData] = useState(null);
  const [transactionId, setTransactionId] = useState("");
<<<<<<< HEAD

  useEffect(() => {
    if (transactionId) {
      axios({
        method: "post",
        url: `http://192.168.4.250:3000/rpc/get_transaction`,
=======
  // 192.168.5.118 -steem7
  // 192.168.4.250 -steem10
  /// Get transaction Data

  useEffect(() => {
    if (transactionId !== "") {
      axios({
        method: "post",
        url: "http://192.168.5.126:3002/rpc/get_transaction",
>>>>>>> 7efaf0620017e63760595dfddc85e167fc663d3c
        headers: { "Content-Type": "application/json" },
        data: { _trx_hash: transactionId },
      }).then((res) => setTransData(res?.data));
    }
<<<<<<< HEAD
    return () => setTransData(null);
  }, [transactionId]);
=======
  }, [transactionId, setTransData]);
>>>>>>> 7efaf0620017e63760595dfddc85e167fc663d3c

  return (
    <TranasctionContext.Provider
      value={{
        transData: transData,
        setTransData: setTransData,
        transactionId: transactionId,
        setTransactionId: setTransactionId,
      }}
    >
      {children}
    </TranasctionContext.Provider>
  );
};
