import { useState, createContext, useEffect } from "react";
import axios from "axios";

export const HeadBlockContext = createContext();
export const HeadBlockContextProvider = ({ children }) => {
<<<<<<< HEAD
  const [head_block_data, setHead_block_data] = useState(null);
  const [head_block, setHead_block] = useState("");
=======
  const [head_block, setHead_block] = useState("");
  const [head_block_data, setHead_block_data] = useState([]);
>>>>>>> 7efaf0620017e63760595dfddc85e167fc663d3c
  const [feed_price, set_feed_price] = useState("");
  const [reward_fund, set_reward_fund] = useState("");

  // 192.168.5.118 -steem7
  // 192.168.4.250 -steem10
  // Get reward funds
<<<<<<< HEAD
=======

>>>>>>> 7efaf0620017e63760595dfddc85e167fc663d3c
  useEffect(() => {
    axios({
      method: "post",
      url: "https://api.hive.blog",
      data: {
        jsonrpc: "2.0",
        method: "database_api.get_reward_funds",
        id: 1,
      },
    }).then((res) => set_reward_fund(res?.data?.result.funds[0]));
  }, []);
  // Get feed price
  useEffect(() => {
    axios({
      method: "post",
      url: "https://api.hive.blog",
      data: {
        jsonrpc: "2.0",
        method: "database_api.get_current_price_feed",
        id: 1,
      },
    }).then((res) => set_feed_price(res?.data?.result));
  }, []);

  //   Get head block number
  useEffect(() => {
    axios({
      method: "post",
      url: "https://api.hive.blog",
      data: {
        jsonrpc: "2.0",
        method: "database_api.get_dynamic_global_properties",
        id: 1,
      },
    }).then((res) => setHead_block(res?.data?.result));
  }, []);

  const current_head_block = head_block?.head_block_number;
  const vesting_fund = Number(head_block?.total_vesting_fund_hive?.amount);
  const vesting_shares = Number(head_block?.total_vesting_shares?.amount);

  //Get head block data
<<<<<<< HEAD

  useEffect(() => {
    if (current_head_block) {
      axios({
        method: "post",
        url: `http://192.168.4.250:3000/rpc/get_ops_by_block`,
=======
  useEffect(() => {
    if (head_block !== "") {
      axios({
        method: "post",
        url: "http://192.168.5.126:3002/rpc/get_ops_by_block",
>>>>>>> 7efaf0620017e63760595dfddc85e167fc663d3c
        headers: { "Content-Type": "application/json" },
        data: {
          _block_num: current_head_block,
          _filter: [],
        },
      }).then((res) => setHead_block_data(res?.data.reverse()));
    }
<<<<<<< HEAD
    // return () => setHead_block_data(null);
  }, [current_head_block]);
=======
  }, [head_block, current_head_block]);
>>>>>>> 7efaf0620017e63760595dfddc85e167fc663d3c

  return (
    <HeadBlockContext.Provider
      value={{
        reward_fund: reward_fund,
        feed_price: feed_price,
        vesting_fund: vesting_fund,
        vesting_shares: vesting_shares,
        head_block: head_block,
        head_block_data: head_block_data,
<<<<<<< HEAD
        setHead_block: setHead_block,
        set_feed_price: set_feed_price,
        set_reward_fund: set_reward_fund,
=======
>>>>>>> 7efaf0620017e63760595dfddc85e167fc663d3c
      }}
    >
      {children}
    </HeadBlockContext.Provider>
  );
};
