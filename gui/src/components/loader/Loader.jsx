<<<<<<< HEAD
import * as React from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

const DEFAULT_LOADER_STYLE = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100%",
};

export default function Loader({ containerStyle, loaderSize }) {
  return (
    <Box sx={containerStyle ?? DEFAULT_LOADER_STYLE}>
      <CircularProgress size={loaderSize} />
    </Box>
=======
import styles from "./loader.module.css";

export default function Loader() {
  return (
    <div className={styles.loader}>
      <div className={styles.gooey}>
        <span className={styles.dot}></span>
        <div className={styles.dots}>
          <span className={styles.x1}></span>
          <span className={styles.x1}></span>
          <span className={styles.x1}></span>
        </div>
      </div>
    </div>
>>>>>>> 7efaf0620017e63760595dfddc85e167fc663d3c
  );
}
