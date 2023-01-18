import React, { useContext, useState } from "react";
import { UserProfileContext } from "../../contexts/userProfileContext";
import { WitnessContext } from "../../contexts/witnessContext";
import { Container, Col, Row } from "react-bootstrap";
import { Button, Pagination } from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import styles from "./userPage.module.css";
import UserProfileCard from "../../components/user/userCard/UserProfileCard";
import UserInfoTable from "../../components/user/userTable/UserInfoTable";
import MultiSelectFilters from "../../components/operations/filters/MultiSelectFilters";
import OpCard from "../../components/operations/operationCard/OpCard";
import Loader from "../../components/loader/Loader";
import {
  handleNextPage,
  handlePrevPage,
  clearFilters,
} from "../../functions/user_page_func";
import JsonMetaData from "../../components/user/JsonMetaData";
import PostingJsonMetaData from "../../components/user/PostingJsonMetaData";
import Authorities from "../../components/user/Authorities";
import WitnessProps from "../../components/user/WitnessProps";
import WitnessVotes from "../../components/user/WitnessVotes";
import { useEffect } from "react";
import usePrevious from "../../components/customHooks/usePrevious";

export default function User_Page({ user }) {
  document.title = `HAF | User ${user}`;
  const {
    user_profile_data,
    acc_history_limit,
    op_filters,
    set_pagination,
    pagination,
    user_info,
    startDateState,
    endDateState,
    set_op_filters,
    setStartDateState,
    setEndDateState,
    opTypesLoading,
    userDataLoading,
  } = useContext(UserProfileContext);
  const { witnessData } = useContext(WitnessContext);
  const [page, setPage] = useState(1);
  const [show_filters, set_show_filters] = useState(false);
  const [prevNextPage, setPrevNextPage] = useState([]);

  const user_witness = witnessData?.filter((w) => w.witness === user);
  // const max_trx_nr = (() => {
  //   if (userDataLoading) return 0;
  //   return user_profile_data?.[0]?.acc_operation_id;
  // })();

  // const last_trx_on_page =
  //   user_profile_data?.[acc_history_limit - 1]?.acc_operation_id;
  // localStorage.setItem("last_trx_on_page", last_trx_on_page);
  // localStorage.setItem("first_trx_on_page", max_trx_nr);
  // pagination === -1 && localStorage.setItem("trx_count_max", max_trx_nr);

  // const get_max_trx_num = localStorage.getItem("trx_count_max");
  // const get_last_trx_on_page = localStorage.getItem("last_trx_on_page");
  // const get_first_trx_on_page = localStorage.getItem("first_trx_on_page");
  const [maxTrxNum, setMaxTrxNum] = useState(0);
  const [firstTrxNum, setFirstTrxNum] = useState(0);
  const [lastTrxNum, setLastTrxNum] = useState(0);
  // const [count, setCount] = useState(0);
  const count = Math.ceil(maxTrxNum / acc_history_limit);
  const operationsMax = maxTrxNum - (page - 1) * acc_history_limit;

  const prevUser = usePrevious(user);
  const prevCount = usePrevious(count);

  const handleChange = async (e, p) => {
    setPage(p);
  };

  useEffect(() => {
    // if (user_profile_data) {
    // if (page === 1) {
    //   set_pagination(-1);
    // }
    set_pagination(page === 1 ? -1 : operationsMax);
    // }
  }, [page, operationsMax]);
  // console.log(prevUser);
  useEffect(() => {
    if (prevUser !== user) {
      setPage(1);
      set_pagination(-1);
      set_op_filters([]);
      // setFirstTrxNum(0);
    }
    // if (!userDataLoading) {
    const max_trx_nr = (() => {
      return user_profile_data?.[0]?.acc_operation_id;
    })();

    const last_trx_on_page =
      user_profile_data?.[acc_history_limit - 1]?.acc_operation_id;
    if (pagination === -1) {
      setMaxTrxNum(max_trx_nr);
      // setFirstTrxNum(max_trx_nr);
    } else {
      setFirstTrxNum(pagination === -1 ? 0 : pagination);
    }
    setLastTrxNum(last_trx_on_page);
    // }
  }, [
    setFirstTrxNum,
    prevUser,
    acc_history_limit,
    user_profile_data,
    user,
    pagination,
  ]);

  // useEffect(() => {
  //   const max_trx_nr = (() => {
  //     if (userDataLoading) return 0;
  //     return user_profile_data?.[0]?.acc_operation_id;
  //   })();
  //   if (pagination !== -1) {
  //     setFirstTrxNum(max_trx_nr);
  //   }
  // }, [userDataLoading, user_profile_data, pagination]);
  // useEffect(() => {
  //   // if (prevUser !== user) {
  //   setCount(Math.ceil(maxTrxNum / acc_history_limit));
  //   // }
  //   // return () => setCount(0);
  // }, [maxTrxNum, acc_history_limit]);

  console.log(pagination, firstTrxNum, lastTrxNum, maxTrxNum, prevUser, user);

  // useEffect(() => {
  //   if (!user_profile_data) {
  //     if (prevUser !== user) {
  //     }
  //   }
  // }, [prevUser, user]);

  return (
    <>
      {!user_profile_data || !user_info || opTypesLoading || userDataLoading ? (
        <Loader />
      ) : (
        <Container className={styles.user_page} fluid>
          <Row className="d-flex">
            <Col sm={12} md={5} lg={5} xl={3}>
              <UserProfileCard user={user} />
              <UserInfoTable user_info={user_info} />
              <JsonMetaData user_info={user_info} />
              <PostingJsonMetaData user_info={user_info} />
              <Authorities user_info={user_info} user_witness={user_witness} />
              <WitnessProps user_info={user_info} user_witness={user_witness} />
              <WitnessVotes user_info={user_info} />
            </Col>

            <Col sm={12} md={7} lg={7} xl={9}>
              <Row className="mt-3">
                <Col className="d-flex justify-content-between">
                  <div>
                    <p className={styles.operationsCount}>
                      Operations : {user_profile_data?.length}
                    </p>
                  </div>
                  {op_filters.length === 0 &&
                  startDateState === null &&
                  endDateState === null ? (
                    <Pagination
                      count={count}
                      size="large"
                      page={page}
                      variant="outlined"
                      shape="rounded"
                      onChange={handleChange}
                    />
                  ) : (
                    <>
                      <Button
                        onClick={() =>
                          handlePrevPage(
                            set_pagination,
                            prevNextPage,
                            setPrevNextPage
                          )
                        }
                      >
                        <ArrowBackIosNewIcon />
                      </Button>

                      {user_profile_data?.length !== acc_history_limit ? (
                        " "
                      ) : (
                        <Button
                          onClick={() =>
                            handleNextPage(
                              set_pagination,
                              lastTrxNum,
                              firstTrxNum,
                              setPrevNextPage
                            )
                          }
                        >
                          <ArrowForwardIosIcon />
                        </Button>
                      )}
                    </>
                  )}
                  {op_filters.length === 0 &&
                  startDateState === null &&
                  endDateState === null ? (
                    <div>
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => set_show_filters(!show_filters)}
                      >
                        Filters
                      </Button>
                      <MultiSelectFilters
                        show_filters={show_filters}
                        set_show_filters={set_show_filters}
                      />
                    </div>
                  ) : (
                    <div>
                      <Button
                        className="m-3"
                        variant="contained"
                        color="warning"
                        onClick={() => set_show_filters(!show_filters)}
                      >
                        Filters (active)
                      </Button>
                      <Button
                        onClick={() =>
                          clearFilters(
                            setEndDateState,
                            setStartDateState,
                            set_op_filters,
                            setPage
                          )
                        }
                        variant="contained"
                        color="secondary"
                      >
                        Clear filters
                      </Button>
                      <MultiSelectFilters
                        show_filters={show_filters}
                        set_show_filters={set_show_filters}
                      />
                    </div>
                  )}
                </Col>
              </Row>
              {user_profile_data?.length === 0
                ? "No operations found"
                : user_profile_data?.map((profile) => (
                    <Row key={profile.operation_id}>
                      <Col>
                        <OpCard block={profile} full_trx={profile} />
                      </Col>
                    </Row>
                  ))}
            </Col>
          </Row>
        </Container>
      )}
    </>
  );
}
