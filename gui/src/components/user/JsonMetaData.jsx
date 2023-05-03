import React from "react";
import styles from "./userStyles.module.css";
import HighlightedJSON from "../customJson/HighlightedJSON";

export default function JsonMetaData({ user_info }) {
  return (
    <>
<<<<<<< HEAD
      {user_info.length && user_info.json_metadata ? (
        <div className={styles.grayContainer}>
          <h3>JSON metadata</h3>
          <pre className={styles.jsonMetaData}>
            <HighlightedJSON json={user_info.json_metadata} />
=======
      {user_info?.json_metadata ? (
        <div className={styles.grayContainer}>
          <h3>JSON metadata</h3>
          <pre className={styles.jsonMetaData}>
            <HighlightedJSON json={JSON.parse(user_info?.json_metadata)} />
>>>>>>> 7efaf0620017e63760595dfddc85e167fc663d3c
          </pre>
        </div>
      ) : (
        ""
      )}
    </>
  );
}
