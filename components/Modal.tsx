import React, { useState } from "react";
import BalanceHistoryChart from "@/components/balanceHistory/BalanceHistoryChart";
import useBalanceHistory from "@/hooks/api/balanceHistory/useBalanceHistory";

interface BalanceHistoryModalProps {
  username: string;
  coinType?: "HIVE" | "VESTS" | "HBD";
  onClose: () => void;
}

const BalanceHistoryModal: React.FC<BalanceHistoryModalProps> = ({
  username,
  coinType = "HIVE",
  onClose,
}) => {
  const [selectedCoinType, setSelectedCoinType] = useState<"HIVE" | "VESTS" | "HBD">(coinType);

  const { accountBalanceHistory, isAccountBalanceHistoryLoading, isAccountBalanceHistoryError } =
    useBalanceHistory(username, selectedCoinType, 1, 100, "asc");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-3xl p-4 bg-white dark:bg-gray-800 rounded shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">{username} Balance History</h2>
          <button onClick={onClose} className="text-red-500 font-bold">X</button>
        </div>

        {/* Coin selection */}
        <div className="mb-4 flex gap-2">
          {["HIVE", "VESTS", "HBD"].map((coin) => (
            <button
              key={coin}
              onClick={() => setSelectedCoinType(coin as "HIVE" | "VESTS" | "HBD")}
              className={`px-3 py-1 rounded ${
                selectedCoinType === coin
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-black hover:bg-gray-300 dark:bg-gray-600 dark:text-white hover:dark:bg-gray-500"
              }`}
            >
              {coin}
            </button>
          ))}
        </div>

        {/* Content */}
        {isAccountBalanceHistoryLoading ? (
          <p>Loading balance history...</p>
        ) : isAccountBalanceHistoryError ? (
          <p>Error loading balance history.</p>
        ) : !accountBalanceHistory?.operations_result?.length ? (
          <p>No balance history available.</p>
        ) : (
          <div className="w-full h-80">
            <BalanceHistoryChart
              hiveBalanceHistoryData={selectedCoinType === "HIVE" ? accountBalanceHistory.operations_result : undefined}
              vestsBalanceHistoryData={selectedCoinType === "VESTS" ? accountBalanceHistory.operations_result : undefined}
              hbdBalanceHistoryData={selectedCoinType === "HBD" ? accountBalanceHistory.operations_result : undefined}
              className="h-80 w-full"
              quickView={false}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default BalanceHistoryModal;
