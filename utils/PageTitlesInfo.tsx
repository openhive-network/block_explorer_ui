import { ChevronDown, Filter } from "lucide-react";
import * as React from "react";
interface LocalizedInfo {
  en: React.ReactNode;
  es: React.ReactNode; 

}

interface InfoContent {
  [key: string]: LocalizedInfo; // Key is still the titleKey
}

const WitnessInfoEn: React.FC = () => (
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

const BlocksInfoEn: React.FC = () => (
  <ul className="list-disc list-inside">
    <li>
      This page displays a list of blocks on the Hive blockchain, ordered from
      newest to oldest. Each row represents a single block and provides key
      information about it.
    </li>
    <li>
      Click the <ChevronDown className="inline-block align-middle h-4 w-4" /> icon
      on the end of each row to view additional details about block operations.
    </li>
    <li>
      Use the <Filter className="inline-block align-middle h-4 w-4" /> funnel
      icon at the top to access filters and narrow down the list of blocks based
      on different criteria.
    </li>
    <li>Hover over Reward value for matching value in HP.</li>
  </ul>
);

const BalanceHistoryInfoEn: React.FC = () => (
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

const TransactionDetailsInfoEn: React.FC = () => (
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

const WitnessInfoEs: React.FC = () => (
  <div>
    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
      ¿Qué son los Testigos de Hive?
    </h2>
    <p className="text-gray-700 dark:text-gray-300 mb-4">
      Los Testigos de Hive son los representantes elegidos que aseguran que la cadena opere con integridad, pero también moldean activamente su dirección a través de decisiones clave.
    </p>
    <p className="text-gray-700 dark:text-gray-300 mb-4">
      Imagina Hive como una ciudad próspera y descentralizada. Los Testigos son el ayuntamiento, los equipos de construcción y las fuerzas de seguridad, todo en uno. <br />
      No solo mantienen la ciudad en funcionamiento (produciendo bloques, manteniendo nodos), sino que también deciden sobre políticas importantes como la construcción de carreteras (configuración de parámetros) y el valor de la moneda de la ciudad (fuentes de precios).
    </p>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
      Funciones Clave:
    </h3>
    <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4">
      <li>
        <span className="font-medium">Producción de Bloques:</span> Son responsables de crear nuevos bloques en la blockchain de Hive, confirmando transacciones y asegurando la red.
      </li>
      <li>
        <span className="font-medium">Mantenimiento de la Red:</span> Operan y mantienen servidores potentes que mantienen la red de Hive funcionando de manera confiable.
      </li>
      <li>
        <span className="font-medium">Configuración de Parámetros:</span> Participan en la configuración de parámetros clave de la blockchain de Hive, como el tamaño del bloque, las tarifas de creación de cuentas y las tasas de interés de HBD (APR).
      </li>
      <li>
        <span className="font-medium">Fuentes de Precios:</span> Proporcionan fuentes de precios para HIVE y HBD, que son cruciales para el funcionamiento de la stablecoin descentralizada.
      </li>
    </ul>
  </div>
);

const BlocksInfoEs: React.FC = () => (
  <ul className="list-disc list-inside">
    <li>
      Esta página muestra una lista de bloques en la blockchain de Hive, ordenados del más nuevo al más antiguo. Cada fila representa un solo bloque y proporciona información clave sobre él.
    </li>
    <li>
      Haz clic en el icono <ChevronDown className="inline-block align-middle h-4 w-4" /> al final de cada fila para ver detalles adicionales sobre las operaciones del bloque.
    </li>
    <li>
      Usa el icono del embudo <Filter className="inline-block align-middle h-4 w-4" /> en la parte superior para acceder a los filtros y reducir la lista de bloques según diferentes criterios.
    </li>
    <li>Pasa el cursor sobre el valor de Recompensa para ver el valor correspondiente en HP.</li>
  </ul>
);


const BalanceHistoryInfoEs: React.FC = () => (
  <ul className="list-disc list-inside">
    <li>
      Esta página muestra el historial de saldos de una cuenta de Hive dada para una moneda y un rango de tiempo seleccionados. Proporciona una representación visual de cómo ha cambiado tu saldo con el tiempo. Por defecto, los resultados se muestran para el último mes.
    </li>
    <li>
      Haz clic en el icono <Filter className="inline-block align-middle h-4 w-4" /> en la parte superior para acceder a los filtros y reducir los registros.
    </li>
    <li>
      El gráfico muestra tu saldo, con valores granulares por día para mostrar los cambios diarios en el saldo.
    </li>
    <li>
      Usa el control deslizante debajo del gráfico para hacer zoom y enfocarte en intervalos de tiempo específicos para una vista más detallada.
    </li>
  </ul>
);

const TransactionDetailsInfoEs: React.FC = () => (
  <ul className="list-disc list-inside">
    <li>
      Esta página muestra los detalles de la transacción de un hash de transacción dado.
    </li>
    <li>
      Haz clic en el interruptor para incluir las operaciones virtuales en la tabla de operaciones a continuación.
    </li>
    <li>
      Puedes cambiar la configuración desde Vista de Datos en el menú principal para ver los datos en otros formatos.
    </li>
  </ul>
);

const pageTitlesInfo: InfoContent = {
  "pageTitle.hiveWitnesses": {
    en: <WitnessInfoEn />,
    es: <WitnessInfoEs />,
  },
  "pageTitle.hiveBlocks": {
    en: <BlocksInfoEn />,
    es: <BlocksInfoEs />
  },
  "pageTitle.balanceHistory": {
    en: <BalanceHistoryInfoEn />,
    es: <BalanceHistoryInfoEs />,
  },
  "pageTitle.transactionDetails": {
    en: <TransactionDetailsInfoEn />,
    es: <TransactionDetailsInfoEs />,
  },
};

export default pageTitlesInfo;