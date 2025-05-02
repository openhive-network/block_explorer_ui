// utils/PageTitles.ts
import { Eye, Filter } from "lucide-react";
import * as React from "react";

interface InfoContent {
  [key: string]: React.ReactNode;
}

const WitnessInfo = () => (
  <div>
    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
      What are Hive Witnesses?
    </h2>

    <p className="text-gray-700 dark:text-gray-300 mb-4">
      Hive Witnesses are the elected representatives who ensure the chain
      operates with integrity, but also actively shape its direction through key
      decisions.
    </p>
    <p className="text-gray-700 dark:text-gray-300 mb-4">
      Imagine Hive as a thriving, decentralized city. Witnesses are the city
      council, the construction crews, and the security force all rolled into
      one. <br />
      They not only keep the city running (producing blocks, maintaining nodes),
      but also decide on important policies like road construction (parameter
      setting) and the value of the city&apos;s currency (price feeds).
    </p>

    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
      Key Functions:
    </h3>

    <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4">
      <li>
        <span className="font-medium">Block Production:</span> They are
        responsible for creating new blocks on the Hive blockchain, confirming
        transactions and securing the network.
      </li>
      <li>
        <span className="font-medium">Network Maintenance:</span> They operate
        and maintain powerful servers that keep the Hive network running
        reliably.
      </li>
      <li>
        <span className="font-medium">Parameter Setting:</span> They participate
        in setting key parameters of the Hive blockchain, such as block size,
        account creation fees, and HBD interest rates (APR).
      </li>
      <li>
        <span className="font-medium">Price Feeds:</span> They provide price
        feeds for HIVE and HBD, which are crucial for the operation of the
        decentralized stablecoin.
      </li>
    </ul>
  </div>
);

const BlocksInfo = () => (
  <ul className="list-disc list-inside">
    <li>
      This page displays a list of blocks on the Hive blockchain, ordered from
      newest to oldest. Each row represents a single block and provides key
      information about it.
    </li>
    <li>
      Click the <Eye className="inline-block align-middle h-4 w-4" /> eye icon
      on the left of each row to view additional details about a specific block.
    </li>
    <li>
      Use the <Filter className="inline-block align-middle h-4 w-4" /> funnel
      icon at the top to access filters and narrow down the list of blocks based
      on different criteria.
    </li>
    <li>Hover over Reward value for matching value in HP.</li>
  </ul>
);

const BalanceHistoryInfo: React.FC = () => (
  <ul className="list-disc list-inside">
    <li>
      This page displays the balance history of a given Hive account for a
      selected coin and time range. It provides a visual representation of how
      your balance has changed over time. By default, results are displayed for
      the last month.
    </li>
    <li>
      Click the <Filter className="inline-block align-middle h-4 w-4" /> icon at
      the top to access filters and narrow down the records.
    </li>
    <li>
      The chart displays your balance, with values granular by day to show daily
      changes in balance.
    </li>
    <li>
      Use the slider below the chart to zoom and focus on specific time
      intervals for a more detailed view.
    </li>
  </ul>
);

const TranscationDetails: React.FC = () => (
  <ul className="list-disc list-inside">
    <li>
      This page displays the transaction details of a given transaction hash
    </li>
    <li>
      Click the toggle switch to include the virtual operations in the
      operations table below
    </li>
    <li>
      You can change the setting from Data View in the main menu to view data in
      other formats
    </li>
  </ul>
);

const pageTitlesInfo: InfoContent = {
  "Hive Witnesses": <WitnessInfo />,
  "Hive Blocks": <BlocksInfo />,
  "Balance History": <BalanceHistoryInfo />,
  "Transaction Details": <TranscationDetails />,
};

export default pageTitlesInfo;
