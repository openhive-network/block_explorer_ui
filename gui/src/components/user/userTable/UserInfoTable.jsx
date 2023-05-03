import React from "react";
import { Row, Col, Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import styles from "./userTable.module.css";

export default function UserInfoTable({ user_info }) {
  const keys = user_info && Object.keys(user_info);

  return (
    <div className={styles.userInfoContainer}>
      {keys?.map((key, index) => {
        const render_key = () => {
<<<<<<< HEAD
          if (["recovery_account", "reset_account"].includes(key)) {
            return <Link to={`/user/${user_info[key]}`}>{user_info[key]}</Link>;
          }
          if (["url"].includes(key)) {
            return (
              <a href={user_info[key]} target="_blank" rel="noreferrer">
                {user_info[key]}
              </a>
            );
=======
          if (
            ["recovery_account", "reset_account", "owner", "url"].includes(key)
          ) {
            return <Link to={`/user/${user_info[key]}`}>{user_info[key]}</Link>;
>>>>>>> 7efaf0620017e63760595dfddc85e167fc663d3c
          } else return user_info[key];
        };

        return (
          <Card key={index} className={styles.userInfoCard}>
            <Card.Body className={styles.userCardBody}>
              <Row>
                <Col>{key}</Col>
                <Col className={styles.userCardValueCol}>
                  {typeof user_info?.[key] != "string"
                    ? JSON.stringify(user_info?.[key])
                    : render_key()}
                </Col>
              </Row>
            </Card.Body>
          </Card>
        );
      })}
    </div>
  );
}
