import React, { useContext, useEffect } from "react";
import MainPage from "../../../pages/mainPage/MainPage";
import BlockPage from "../../../pages/blockPage/BlockPage";
import UserPage from "../../../pages/userPage/UserPage";
import TransactionPage from "../../../pages/transactionPage/TransactionPage";
<<<<<<< HEAD
import WitnessesPage from "../../../pages/witnessPage/WitnessesPage";
import CommentsPage from "../../../pages/commentsPage/CommentsPage";
=======
import WitnessesPage from "../../../pages/WitnessesPage";
>>>>>>> 7efaf0620017e63760595dfddc85e167fc663d3c
import { Routes, Route } from "react-router-dom";
import ErrorPage from "../../../pages/ErrorPage";
import { UserProfileContext } from "../../../contexts/userProfileContext";
import { BlockContext } from "../../../contexts/blockContext";
import { TranasctionContext } from "../../../contexts/transactionContext";
import { useLocation } from "react-router-dom";
import styles from "./content.module.css";
export default function Content() {
  const { userProfile, setUserProfile } = useContext(UserProfileContext);
  const { blockNumber, setBlockNumber } = useContext(BlockContext);
  const { transactionId, setTransactionId } = useContext(TranasctionContext);

  let location = useLocation();
  const user = location.pathname.split("/user/").pop();
  const block = Number(location.pathname.split("/block/").pop());
  const transaction = location.pathname.split("/transaction/").pop();
  useEffect(() => {
    if ((user && transaction) !== "/" && block !== "NaN") {
      if (location.pathname.includes("user")) {
        setUserProfile(user);
      }
      if (location.pathname.includes("block")) {
        setBlockNumber(block);
      }
      if (location.pathname.includes("transaction")) {
        setTransactionId(transaction);
      }
    }
  }, [
    user,
    block,
    location,
    transaction,
    setUserProfile,
    setBlockNumber,
    setTransactionId,
  ]);

  return (
    <div className={styles.content}>
      <Routes>
        <Route exact path="/" element={<MainPage />} />
        <Route
<<<<<<< HEAD
          path={blockNumber && `block/${blockNumber}`}
=======
          path={`block/${blockNumber}`}
>>>>>>> 7efaf0620017e63760595dfddc85e167fc663d3c
          element={
            <BlockPage setBlockNumber={setBlockNumber} block_nr={blockNumber} />
          }
        />
        <Route
<<<<<<< HEAD
          path={userProfile && `user/${userProfile}`}
          element={<UserPage user={userProfile} />}
        />
        <Route
          path={transactionId && `transaction/${transactionId}`}
          element={<TransactionPage transaction={transactionId} />}
        />
        <Route path="/comments" element={<CommentsPage />} />
=======
          path={`user/${userProfile}`}
          element={<UserPage user={userProfile} />}
        />
        <Route
          path={`transaction/${transactionId}`}
          element={<TransactionPage transaction={transactionId} />}
        />
>>>>>>> 7efaf0620017e63760595dfddc85e167fc663d3c
        <Route path="witnesses" element={<WitnessesPage />} />
        <Route path="error" element={<ErrorPage />} />
      </Routes>
    </div>
  );
}
