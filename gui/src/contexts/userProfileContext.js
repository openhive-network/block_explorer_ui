import { useState, createContext, useEffect } from "react";
<<<<<<< HEAD
import axios from "axios";
import useDebounce from "../components/customHooks/useDebounce";
=======
// import moment from "moment";

import axios from "axios";
>>>>>>> 7efaf0620017e63760595dfddc85e167fc663d3c

export const UserProfileContext = createContext();
export const UserProfileContextProvider = ({ children }) => {
  const [userProfile, setUserProfile] = useState("");
  const [user_profile_data, setUser_profile_data] = useState(null);
  const [acc_history_limit, set_acc_history_limit] = useState(100);
  const [op_filters, set_op_filters] = useState([]);
  const [user_info, set_user_info] = useState("");
<<<<<<< HEAD
  const [op_types, set_op_types] = useState(null);
=======
  const [op_types, set_op_types] = useState([]);
>>>>>>> 7efaf0620017e63760595dfddc85e167fc663d3c
  const [pagination, set_pagination] = useState(-1);
  const [resource_credits, set_resource_credits] = useState({});
  const [startDateState, setStartDateState] = useState(null);
  const [endDateState, setEndDateState] = useState(null);

<<<<<<< HEAD
  const [opTypesLoading, setOpTypesLoading] = useState(false);
  const [userDataLoading, setUserDataLoading] = useState(false);

  const debouncePagination = useDebounce(pagination, 200);

  useEffect(() => {
    (async function () {
      setOpTypesLoading(true);
      try {
        if (userProfile) {
          axios({
            method: "post",
            url: `http://192.168.4.250:3000/rpc/get_acc_op_types`,
            headers: { "Content-Type": "application/json" },
            data: {
              _account: userProfile,
            },
          }).then((res) => set_op_types(res.data));
        }
      } catch (err) {
        console.log(err);
      } finally {
        setOpTypesLoading(false);
      }
    })();
  }, [userProfile]);

  useEffect(() => {
    if (userProfile) {
      const calc_limit =
        debouncePagination !== -1 && acc_history_limit > debouncePagination
          ? debouncePagination
          : acc_history_limit;

      (async function () {
        setUserDataLoading(true);
        try {
          await axios({
            method: "post",
            url: `http://192.168.4.250:3000/rpc/get_ops_by_account`,
            headers: { "Content-Type": "application/json" },
            data: {
              _account: userProfile,
              _top_op_id: debouncePagination,
              _limit: calc_limit,
              _filter: op_filters,
              _date_start: startDateState,
              _date_end: endDateState,
            },
          }).then((res) => setUser_profile_data(res?.data));
        } catch (err) {
          console.log(err);
        } finally {
          setUserDataLoading(false);
        }
      })();
    }
  }, [
    userProfile,
    debouncePagination,
    acc_history_limit,
    op_filters,
    startDateState,
    endDateState,
  ]);

  useEffect(() => {
    if (userProfile) {
      axios({
        method: "post",
        url: "http://192.168.4.250:3000/rpc/get_account",
        headers: { "Content-Type": "application/json" },
        data: { _account: userProfile },
      }).then((res) => set_user_info(res?.data));
    }
    return () => set_user_info("");
  }, [userProfile]);

  useEffect(() => {
    if (userProfile) {
      axios({
        method: "post",
        url: `http://192.168.4.250:3000/rpc/get_account_resource_credits`,
        headers: { "Content-Type": "application/json" },
        data: { _account: userProfile },
      }).then((res) => set_resource_credits(res?.data));
    }
    return () => set_resource_credits({});
  }, [userProfile]);
=======
  // console.log(userProfile);
  // 192.168.5.118 -steem7
  // 192.168.4.250 -steem10
  //Get available operation types for current user
  // console.log(endDateState);
  useEffect(() => {
    if (userProfile !== "") {
      axios({
        method: "post",
        url: "http://192.168.5.126:3002/rpc/get_acc_op_types",
        headers: { "Content-Type": "application/json" },
        data: {
          _account: userProfile,
        },
      }).then((res) => set_op_types(res.data));
    }
  }, [userProfile, set_op_types]);

  //  Get user profile data, user info, resource accounts
  const calc_limit =
    pagination !== -1 && acc_history_limit > pagination
      ? pagination
      : acc_history_limit;
  useEffect(() => {
    if (userProfile !== "") {
      axios({
        method: "post",
        url: "http://192.168.5.126:3002/rpc/get_ops_by_account",
        headers: { "Content-Type": "application/json" },
        data: {
          _account: userProfile,
          _top_op_id: pagination,
          _limit: calc_limit,
          _filter: op_filters,
          _date_start: startDateState,
          _date_end: endDateState,
        },
      }).then((res) => setUser_profile_data(res.data));
      axios({
        method: "post",
        url: "https://api.hive.blog",
        data: {
          jsonrpc: "2.0",
          method: "condenser_api.get_accounts",
          params: [[userProfile]],
          id: 1,
        },
      }).then((res) => set_user_info(res?.data?.result[0]));
      axios({
        method: "post",
        url: "https://api.hive.blog",
        data: {
          jsonrpc: "2.0",
          method: "rc_api.find_rc_accounts",
          params: { accounts: [userProfile] },
          id: 1,
        },
      }).then((res) => set_resource_credits(res?.data?.result?.rc_accounts[0]));
    }
  }, [
    userProfile,
    pagination,
    op_filters,
    acc_history_limit,
    setUser_profile_data,
    set_user_info,
    set_resource_credits,
    startDateState,
    endDateState,
    calc_limit,
  ]);
>>>>>>> 7efaf0620017e63760595dfddc85e167fc663d3c

  return (
    <UserProfileContext.Provider
      value={{
        resource_credits: resource_credits,
        set_pagination: set_pagination,
        pagination: pagination,
        userProfile: userProfile,
        setUser_profile_data: setUser_profile_data,
        user_profile_data: user_profile_data,
        setUserProfile: setUserProfile,
        set_acc_history_limit: set_acc_history_limit,
        acc_history_limit: acc_history_limit,
        set_op_filters: set_op_filters,
        user_info: user_info,
        op_types: op_types,
        op_filters: op_filters,
        startDateState: startDateState,
        setStartDateState: setStartDateState,
        endDateState: endDateState,
        setEndDateState: setEndDateState,
<<<<<<< HEAD
        opTypesLoading: opTypesLoading,
        userDataLoading: userDataLoading,
        debouncePagination: debouncePagination,
=======
>>>>>>> 7efaf0620017e63760595dfddc85e167fc663d3c
      }}
    >
      {children}
    </UserProfileContext.Provider>
  );
};
