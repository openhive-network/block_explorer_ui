import { ChevronDown, Filter } from "lucide-react";
import * as React from "react";

interface LocalizedInfo {
  en: React.ReactNode;
  es: React.ReactNode;
  it: React.ReactNode;
  de: React.ReactNode;
  pt: React.ReactNode;
  fr: React.ReactNode;
  pl: React.ReactNode;
  zh: React.ReactNode;
  ja: React.ReactNode;
  ro: React.ReactNode;
  ar: React.ReactNode;
}

interface InfoContent {
  [key: string]: Partial<LocalizedInfo>; // Use Partial<> as not all languages might be available for all keys
}

// =================================================================
// English Components (Original)
// =================================================================
const WitnessInfoEn: React.FC = () => (
  <div>
    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
      What are Hive Witnesses?
    </h2>
    <p className="text-gray-700 dark:text-gray-300 mb-4">
      Hive Witnesses are the elected representatives who ensure the chain operates with integrity, but also actively shape its direction through key decisions.
    </p>
    <p className="text-gray-700 dark:text-gray-300 mb-4">
      Imagine Hive as a thriving, decentralized city. Witnesses are the city council, the construction crews, and the security force all rolled into one. <br />
      They not only keep the city running (producing blocks, maintaining nodes), but also decide on important policies like road construction (parameter setting) and the value of the city's currency (price feeds).
    </p>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
      Key Functions:
    </h3>
    <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4">
      <li><span className="font-medium">Block Production:</span> They are responsible for creating new blocks on the Hive blockchain, confirming transactions and securing the network.</li>
      <li><span className="font-medium">Network Maintenance:</span> They operate and maintain powerful servers that keep the Hive network running reliably.</li>
      <li><span className="font-medium">Parameter Setting:</span> They participate in setting key parameters of the Hive blockchain, such as block size, account creation fees, and HBD interest rates (APR).</li>
      <li><span className="font-medium">Price Feeds:</span> They provide price feeds for HIVE and HBD, which are crucial for the operation of the decentralized stablecoin.</li>
    </ul>
  </div>
);
const BlocksInfoEn: React.FC = () => (
  <ul className="list-disc list-inside">
    <li>This page displays a list of blocks on the Hive blockchain, ordered from newest to oldest. Each row represents a single block and provides key information about it.</li>
    <li>Click the <ChevronDown className="inline-block align-middle h-4 w-4" /> icon on the end of each row to view additional details about block operations.</li>
    <li>Use the <Filter className="inline-block align-middle h-4 w-4" /> funnel icon at the top to access filters and narrow down the list of blocks based on different criteria.</li>
    <li>Hover over Reward value for matching value in HP.</li>
  </ul>
);
const BalanceHistoryInfoEn: React.FC = () => (
  <ul className="list-disc list-inside">
    <li>This page displays the balance history of a given Hive account for a selected coin and time range. It provides a visual representation of how your balance has changed over time. By default, results are displayed for the last month.</li>
    <li>Click the <Filter className="inline-block align-middle h-4 w-4" /> icon at the top to access filters and narrow down the records.</li>
    <li>The chart displays your balance, with values granular by day to show daily changes in balance.</li>
    <li>Use the slider below the chart to zoom and focus on specific time intervals for a more detailed view.</li>
  </ul>
);
const TransactionDetailsInfoEn: React.FC = () => (
  <ul className="list-disc list-inside">
    <li>This page displays the transaction details of a given transaction hash</li>
    <li>Click the toggle switch to include the virtual operations in the operations table below</li>
    <li>You can change the setting from Data View in the main menu to view data in other formats</li>
  </ul>
);
// src/components/info/ProposalsInfo.tsx

const ProposalsInfoEn: React.FC = () => (
  <div>
    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
      What is the Hive Proposal System (DHF)?
    </h2>
    <p className="text-gray-700 dark:text-gray-300 mb-4">
      The Hive Proposal System, also known as the Decentralized Hive Fund (DHF), is a community-driven funding mechanism that allocates a portion of the blockchain's daily inflation to projects that benefit the ecosystem.
    </p>
    <p className="text-gray-700 dark:text-gray-300 mb-4">
      Think of it as a decentralized grant program for the Hive ecosystem. Instead of a central committee, Hive stakeholders vote with their staked HIVE to decide which development, marketing, or community projects receive funding directly from the blockchain.
    </p>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
      Key Concepts:
    </h3>
    <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4">
      <li><span className="font-medium">Funding Source:</span> The DHF is funded by 10% of Hive's daily inflation, creating a continuous "Daily Budget" to support the ecosystem's growth.</li>
      <li><span className="font-medium">The Return Proposal (Funding Threshold):</span> This is a special proposal (ID #0) that receives all unallocated funds from the Daily Budget. For any other proposal to be funded, it must receive more votes than this Return Proposal. This mechanism sets a dynamic, community-decided funding threshold.</li>
      <li><span className="font-medium">Stake-Weighted Voting:</span> Votes on proposals are weighted by Hive Power (staked HIVE). The more stake a user has, the more influence their vote carries, ensuring that those most invested in the platform have the greatest say in its development.</li>
      <li><span className="font-medium">Open to All:</span> Any user can submit a proposal for a fee, making it a permissionless system for anyone to request funding for an idea that could add value to Hive.</li>
    </ul>
  </div>
);

// =================================================================
// Spanish Components (Original)
// =================================================================
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
        <li><span className="font-medium">Producción de Bloques:</span> Son responsables de crear nuevos bloques en la blockchain de Hive, confirmando transacciones y asegurando la red.</li>
        <li><span className="font-medium">Mantenimiento de la Red:</span> Operan y mantienen servidores potentes que mantienen la red de Hive funcionando de manera confiable.</li>
        <li><span className="font-medium">Configuración de Parámetros:</span> Participan en la configuración de parámetros clave de la blockchain de Hive, como el tamaño del bloque, las tarifas de creación de cuentas y las tasas de interés de HBD (APR).</li>
        <li><span className="font-medium">Fuentes de Precios:</span> Proporcionan fuentes de precios para HIVE y HBD, que son cruciales para el funcionamiento de la stablecoin descentralizada.</li>
      </ul>
    </div>
);
const BlocksInfoEs: React.FC = () => (
  <ul className="list-disc list-inside">
    <li>Esta página muestra una lista de bloques en la blockchain de Hive, ordenados del más nuevo al más antiguo. Cada fila representa un solo bloque y proporciona información clave sobre él.</li>
    <li>Haz clic en el icono <ChevronDown className="inline-block align-middle h-4 w-4" /> al final de cada fila para ver detalles adicionales sobre las operaciones del bloque.</li>
    <li>Usa el icono del embudo <Filter className="inline-block align-middle h-4 w-4" /> en la parte superior para acceder a los filtros y reducir la lista de bloques según diferentes criterios.</li>
    <li>Pasa el cursor sobre el valor de Recompensa para ver el valor correspondiente en HP.</li>
  </ul>
);
const BalanceHistoryInfoEs: React.FC = () => (
  <ul className="list-disc list-inside">
    <li>Esta página muestra el historial de saldos de una cuenta de Hive dada para una moneda y un rango de tiempo seleccionados. Proporciona una representación visual de cómo ha cambiado tu saldo con el tiempo. Por defecto, los resultados se muestran para el último mes.</li>
    <li>Haz clic en el icono <Filter className="inline-block align-middle h-4 w-4" /> en la parte superior para acceder a los filtros y reducir los registros.</li>
    <li>El gráfico muestra tu saldo, con valores granulares por día para mostrar los cambios diarios en el saldo.</li>
    <li>Usa el control deslizante debajo del gráfico para hacer zoom y enfocarte en intervalos de tiempo específicos para una vista más detallada.</li>
  </ul>
);
const TransactionDetailsInfoEs: React.FC = () => (
  <ul className="list-disc list-inside">
    <li>Esta página muestra los detalles de la transacción de un hash de transacción dado.</li>
    <li>Haz clic en el interruptor para incluir las operaciones virtuales en la tabla de operaciones a continuación.</li>
    <li>Puedes cambiar la configuración desde Vista de Datos en el menú principal para ver los datos en otros formatos.</li>
  </ul>
);

const ProposalsInfoEs: React.FC = () => (
  <div>
    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
      ¿Qué es el Sistema de Propuestas de Hive (DHF)?
    </h2>
    <p className="text-gray-700 dark:text-gray-300 mb-4">
      El Sistema de Propuestas de Hive, también conocido como el Fondo Descentralizado de Hive (DHF), es un mecanismo de financiación impulsado por la comunidad que asigna una porción de la inflación diaria de la blockchain a proyectos que benefician al ecosistema.
    </p>
    <p className="text-gray-700 dark:text-gray-300 mb-4">
      Piénsalo como un programa de subvenciones descentralizado para el ecosistema de Hive. En lugar de un comité central, los stakeholders de Hive votan con su HIVE en stake para decidir qué proyectos de desarrollo, marketing o comunitarios reciben financiación directamente desde la blockchain.
    </p>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
      Conceptos Clave:
    </h3>
    <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4">
      <li><span className="font-medium">Fuente de Financiación:</span> El DHF se financia con el 10% de la inflación diaria de Hive, creando un 'Presupuesto Diario' continuo para apoyar el crecimiento del ecosistema.</li>
      <li><span className="font-medium">La Propuesta de Retorno (Umbral de Financiación):</span> Esta es una propuesta especial (ID #0) que recibe todos los fondos no asignados del Presupuesto Diario. Para que cualquier otra propuesta sea financiada, debe recibir más votos que esta Propuesta de Retorno. Este mecanismo establece un umbral de financiación dinámico decidido por la comunidad.</li>
      <li><span className="font-medium">Votación Ponderada por Stake:</span> Los votos en las propuestas se ponderan por Hive Power (HIVE en stake). Cuanto más stake tiene un usuario, más influencia tiene su voto, asegurando que los más invertidos en la plataforma tengan la mayor voz en su desarrollo.</li>
      <li><span className="font-medium">Abierto para Todos:</span> Cualquier usuario puede presentar una propuesta por una tarifa, convirtiéndolo en un sistema sin permisos para que cualquiera solicite financiación para una idea que pueda agregar valor a Hive.</li>
    </ul>
  </div>
);
//communities info
//english
const CommunitiesPageInfoEn: React.FC = () => (
  <ul className="list-disc list-inside space-y-1">
    <li>
      This page displays a list of Hive communities, showing their name, title, 
      and subscriber count.
    </li>
    <li>
      Use the search input to filter communities by name, and the sort dropdown 
      to order communities by rank, activity, or other criteria.
    </li>
    <li>
      Click on a community card to view detailed information or open the subscribers dialog.
    </li>
    <li>
      Infinite scrolling loads more communities as you scroll down, ensuring 
      easy browsing of the full community list.
    </li>
    <li>
      This page helps users discover active communities and understand their 
      size and engagement within the Hive ecosystem.
    </li>
  </ul>
);
//spanish
const CommunitiesPageInfoEs: React.FC = () => (
  <ul className="list-disc list-inside space-y-1">
    <li>
      Esta página muestra una lista de comunidades de Hive, con su nombre, título 
      y número de suscriptores.
    </li>
    <li>
      Usa la barra de búsqueda para filtrar comunidades por nombre, y el menú 
      desplegable de orden para clasificarlas por rango, actividad u otros criterios.
    </li>
    <li>
      Haz clic en una tarjeta de comunidad para ver información detallada o abrir 
      el diálogo de suscriptores.
    </li>
    <li>
      El desplazamiento infinito carga más comunidades a medida que bajas, lo que 
      permite explorar fácilmente la lista completa.
    </li>
    <li>
      Esta página ayuda a los usuarios a descubrir comunidades activas y conocer 
      su tamaño y nivel de participación en el ecosistema Hive.
    </li>
  </ul>
);
//italian
const CommunitiesPageInfoIt: React.FC = () => (
  <ul className="list-disc list-inside space-y-1">
    <li>
      Questa pagina mostra un elenco delle comunità di Hive, con nome, titolo 
      e numero di iscritti.
    </li>
    <li>
      Usa la barra di ricerca per filtrare le comunità per nome e il menu a 
      tendina per ordinarle per rango, attività o altri criteri.
    </li>
    <li>
      Clicca su una scheda comunità per vedere maggiori informazioni o aprire 
      la finestra degli iscritti.
    </li>
    <li>
      Lo scorrimento infinito carica altre comunità mentre navighi verso il basso, 
      rendendo semplice esplorare l’elenco completo.
    </li>
    <li>
      Questa pagina aiuta gli utenti a scoprire comunità attive e a comprendere 
      dimensioni e coinvolgimento all’interno dell’ecosistema Hive.
    </li>
  </ul>
);
//german
const CommunitiesPageInfoDe: React.FC = () => (
  <ul className="list-disc list-inside space-y-1">
    <li>
      Diese Seite zeigt eine Liste von Hive-Communities mit Name, Titel und 
      Anzahl der Abonnenten.
    </li>
    <li>
      Verwende das Suchfeld, um Communities nach Namen zu filtern, und das 
      Sortiermenü, um sie nach Rang, Aktivität oder anderen Kriterien zu ordnen.
    </li>
    <li>
      Klicke auf eine Community-Karte, um detaillierte Informationen anzuzeigen 
      oder den Abonnenten-Dialog zu öffnen.
    </li>
    <li>
      Mit dem unendlichen Scrollen werden beim Herunterblättern automatisch weitere 
      Communities geladen, sodass die gesamte Liste leicht durchstöbert werden kann.
    </li>
    <li>
      Diese Seite hilft Nutzern, aktive Communities zu entdecken und deren Größe 
      und Engagement im Hive-Ökosystem zu verstehen.
    </li>
  </ul>
);
//portuguese
const CommunitiesPageInfoPt: React.FC = () => (
  <ul className="list-disc list-inside space-y-1">
    <li>
      Esta página exibe uma lista de comunidades do Hive, mostrando nome, título 
      e número de assinantes.
    </li>
    <li>
      Use a barra de pesquisa para filtrar comunidades pelo nome e o menu de 
      ordenação para organizá-las por ranking, atividade ou outros critérios.
    </li>
    <li>
      Clique em um cartão de comunidade para ver informações detalhadas ou abrir 
      a janela de assinantes.
    </li>
    <li>
      A rolagem infinita carrega mais comunidades conforme você desce, facilitando 
      a navegação por toda a lista.
    </li>
    <li>
      Esta página ajuda os usuários a descobrir comunidades ativas e entender 
      seu tamanho e engajamento no ecossistema Hive.
    </li>
  </ul>
);
//french
const CommunitiesPageInfoFr: React.FC = () => (
  <ul className="list-disc list-inside space-y-1">
    <li>
      Cette page affiche une liste des communautés Hive, avec leur nom, titre 
      et nombre d’abonnés.
    </li>
    <li>
      Utilisez la barre de recherche pour filtrer les communautés par nom et 
      le menu déroulant pour les trier par rang, activité ou autres critères.
    </li>
    <li>
      Cliquez sur une carte de communauté pour voir plus d’informations ou ouvrir 
      la fenêtre des abonnés.
    </li>
    <li>
      Le défilement infini charge automatiquement plus de communautés lorsque 
      vous descendez, ce qui permet d’explorer facilement la liste complète.
    </li>
    <li>
      Cette page aide les utilisateurs à découvrir les communautés actives et à 
      comprendre leur taille et leur engagement dans l’écosystème Hive.
    </li>
  </ul>
);
//polish
const CommunitiesPageInfoPl: React.FC = () => (
  <ul className="list-disc list-inside space-y-1">
    <li>
      Ta strona wyświetla listę społeczności Hive, pokazując ich nazwę, tytuł 
      i liczbę subskrybentów.
    </li>
    <li>
      Użyj pola wyszukiwania, aby filtrować społeczności według nazwy, oraz menu 
      sortowania, aby uporządkować je według rankingu, aktywności lub innych kryteriów.
    </li>
    <li>
      Kliknij kartę społeczności, aby zobaczyć szczegółowe informacje lub otworzyć 
      okno subskrybentów.
    </li>
    <li>
      Funkcja nieskończonego przewijania ładuje kolejne społeczności podczas 
      przewijania w dół, co ułatwia przeglądanie pełnej listy.
    </li>
    <li>
      Ta strona pomaga użytkownikom odkrywać aktywne społeczności i zrozumieć 
      ich wielkość oraz zaangażowanie w ekosystemie Hive.
    </li>
  </ul>
);
//chinese
const CommunitiesPageInfoZh: React.FC = () => (
  <ul className="list-disc list-inside space-y-1">
    <li>
      本页面显示 Hive 社区列表，包括社区名称、标题和订阅人数。
    </li>
    <li>
      使用搜索栏按名称筛选社区，并通过排序菜单按照排名、活跃度或其他条件排序。
    </li>
    <li>
      点击社区卡片即可查看详细信息或打开订阅者窗口。
    </li>
    <li>
      向下滚动时会自动加载更多社区，方便浏览完整的社区列表。
    </li>
    <li>
      此页面帮助用户发现活跃的社区，并了解其规模和在 Hive 生态系统中的参与度。
    </li>
  </ul>
);
//japanese
const CommunitiesPageInfoJa: React.FC = () => (
  <ul className="list-disc list-inside space-y-1">
    <li>
      このページでは Hive のコミュニティ一覧を表示し、各コミュニティの名前、タイトル、
      登録者数が確認できます。
    </li>
    <li>
      検索バーを使って名前でコミュニティを絞り込み、並び替えメニューでランクや活動度
      などの基準で並べ替えることができます。
    </li>
    <li>
      コミュニティカードをクリックすると詳細情報を確認したり、登録者ダイアログを開いたり
      できます。
    </li>
    <li>
      無限スクロールにより下にスクロールすると自動的にさらに多くのコミュニティが読み込まれ、
      一覧を簡単に探索できます。
    </li>
    <li>
      このページはユーザーがアクティブなコミュニティを見つけ、その規模や Hive エコシステムに
      おける参加度を理解するのに役立ちます。
    </li>
  </ul>
);
//romanian
const CommunitiesPageInfoRo: React.FC = () => (
  <ul className="list-disc list-inside space-y-1">
    <li>
      Această pagină afișează o listă a comunităților Hive, cu numele, titlul și 
      numărul de abonați pentru fiecare.
    </li>
    <li>
      Folosește bara de căutare pentru a filtra comunitățile după nume și meniul 
      de sortare pentru a le ordona după rang, activitate sau alte criterii.
    </li>
    <li>
      Fă clic pe o cartelă de comunitate pentru a vedea informații detaliate sau 
      pentru a deschide fereastra abonaților.
    </li>
    <li>
      Derularea infinită încarcă mai multe comunități pe măsură ce cobori, ceea ce 
      face explorarea listei complete mai ușoară.
    </li>
    <li>
      Această pagină îi ajută pe utilizatori să descopere comunități active și să 
      înțeleagă dimensiunea și gradul lor de implicare în ecosistemul Hive.
    </li>
  </ul>
);
//arabic
const CommunitiesPageInfoAr: React.FC = () => (
  <ul className="list-disc list-inside space-y-1" dir="rtl">
    <li>
      تعرض هذه الصفحة قائمة بمجتمعات Hive، مع اسم كل مجتمع، العنوان وعدد المشتركين فيه.
    </li>
    <li>
      استخدم شريط البحث لتصفية المجتمعات حسب الاسم، وقائمة الفرز لترتيبها حسب الترتيب،
      النشاط أو معايير أخرى.
    </li>
    <li>
      اضغط على بطاقة المجتمع لعرض المزيد من المعلومات أو لفتح نافذة المشتركين.
    </li>
    <li>
      يحمّل التمرير اللانهائي المزيد من المجتمعات عند النزول لأسفل، مما يسهل استكشاف القائمة الكاملة.
    </li>
    <li>
      تساعد هذه الصفحة المستخدمين على اكتشاف المجتمعات النشطة وفهم حجمها ومستوى المشاركة
      في نظام Hive البيئي.
    </li>
  </ul>
);






//top holders info
// --- English (en) ---
const TopHoldersInfoEn: React.FC = () => (
  <ul className="list-disc list-inside space-y-1">
    <li>
      This page displays the top holders of Hive coins (HIVE, HBD, and VESTS),
      ranked by their balance. Each row shows the account, rank, and value held.
    </li>
    <li>
      Use the <Filter className="inline-block align-middle h-4 w-4" /> funnel
      icon at the top to apply filters such as coin type and balance type.
    </li>
    <li>
      For VESTS, equivalent Hive Power (HP) is shown to make the values easier
      to interpret.
    </li>
    <li>
      This list helps track large stakeholders and gain insights into
      distribution across the Hive ecosystem.
    </li>
  </ul>
);

// --- Spanish (es) ---
const TopHoldersInfoEs: React.FC = () => (
  <ul className="list-disc list-inside space-y-1">
    <li>
      Esta página muestra a los principales poseedores de monedas de Hive
      (HIVE, HBD y VESTS), ordenados por su saldo. Cada fila presenta la cuenta,
      el rango y el valor mantenido.
    </li>
    <li>
      Use el icono <Filter className="inline-block align-middle h-4 w-4" /> de
      embudo en la parte superior para aplicar filtros como tipo de moneda y
      tipo de saldo.
    </li>
    <li>
      Para VESTS, se muestra el equivalente en Hive Power (HP) para facilitar la
      interpretación.
    </li>
    <li>
      Esta lista ayuda a rastrear a los grandes participantes y comprender la
      distribución en el ecosistema Hive.
    </li>
  </ul>
);

// --- Italian (it) ---
const TopHoldersInfoIt: React.FC = () => (
  <ul className="list-disc list-inside space-y-1">
    <li>
      Questa pagina mostra i principali detentori di monete Hive (HIVE, HBD e
      VESTS), ordinati per saldo. Ogni riga indica l’account, la posizione e il
      valore detenuto.
    </li>
    <li>
      Utilizza l’icona <Filter className="inline-block align-middle h-4 w-4" />{" "}
      a forma di imbuto in alto per applicare filtri come tipo di moneta e tipo
      di saldo.
    </li>
    <li>
      Per i VESTS viene mostrato l’equivalente in Hive Power (HP) per
      facilitare la comprensione dei valori.
    </li>
    <li>
      L’elenco consente di monitorare i grandi stakeholder e di analizzare la
      distribuzione nell’ecosistema Hive.
    </li>
  </ul>
);

// --- German (de) ---
const TopHoldersInfoDe: React.FC = () => (
  <ul className="list-disc list-inside space-y-1">
    <li>
      Diese Seite zeigt die größten Inhaber von Hive-Coins (HIVE, HBD und
      VESTS), sortiert nach ihrem Guthaben. Jede Zeile enthält Konto, Rang und
      Wert.
    </li>
    <li>
      Verwenden Sie das{" "}
      <Filter className="inline-block align-middle h-4 w-4" />{" "}
      Trichtersymbol oben, um Filter wie Münztyp und Saldoart anzuwenden.
    </li>
    <li>
      Für VESTS wird das entsprechende Hive Power (HP) angezeigt, um die Werte
      leichter verständlich zu machen.
    </li>
    <li>
      Diese Liste hilft, große Stakeholder zu verfolgen und die Verteilung im
      Hive-Ökosystem besser zu verstehen.
    </li>
  </ul>
);

// --- Portuguese (pt) ---
const TopHoldersInfoPt: React.FC = () => (
  <ul className="list-disc list-inside space-y-1">
    <li>
      Esta página mostra os principais detentores de moedas Hive (HIVE, HBD e
      VESTS), classificados pelo saldo. Cada linha apresenta a conta, a
      classificação e o valor detido.
    </li>
    <li>
      Use o ícone{" "}
      <Filter className="inline-block align-middle h-4 w-4" /> de funil no topo
      para aplicar filtros como tipo de moeda e tipo de saldo.
    </li>
    <li>
      Para VESTS, o equivalente em Hive Power (HP) é exibido para facilitar a
      interpretação.
    </li>
    <li>
      Esta lista ajuda a acompanhar grandes participantes e a compreender a
      distribuição no ecossistema Hive.
    </li>
  </ul>
);

// --- French (fr) ---
const TopHoldersInfoFr: React.FC = () => (
  <ul className="list-disc list-inside space-y-1">
    <li>
      Cette page affiche les principaux détenteurs de monnaies Hive (HIVE, HBD
      et VESTS), classés par solde. Chaque ligne indique le compte, le rang et
      la valeur détenue.
    </li>
    <li>
      Utilisez l’icône{" "}
      <Filter className="inline-block align-middle h-4 w-4" /> d’entonnoir en
      haut pour appliquer des filtres tels que le type de monnaie et le type de
      solde.
    </li>
    <li>
      Pour les VESTS, l’équivalent en Hive Power (HP) est affiché afin de
      faciliter la lecture des valeurs.
    </li>
    <li>
      Cette liste permet de suivre les principaux acteurs et de mieux
      comprendre la distribution dans l’écosystème Hive.
    </li>
  </ul>
);

// --- Polish (pl) ---
const TopHoldersInfoPl: React.FC = () => (
  <ul className="list-disc list-inside space-y-1">
    <li>
      Ta strona pokazuje największych posiadaczy monet Hive (HIVE, HBD i VESTS),
      uporządkowanych według salda. Każdy wiersz zawiera konto, pozycję i wartość.
    </li>
    <li>
      Użyj ikony{" "}
      <Filter className="inline-block align-middle h-4 w-4" /> lejka u góry, aby
      zastosować filtry takie jak typ monety i rodzaj salda.
    </li>
    <li>
      Dla VESTS wyświetlany jest odpowiednik w Hive Power (HP), aby ułatwić
      interpretację wartości.
    </li>
    <li>
      Lista ta pomaga śledzić głównych uczestników i zrozumieć dystrybucję w
      ekosystemie Hive.
    </li>
  </ul>
);

// --- Chinese (Simplified) (zh) ---
const TopHoldersInfoZh: React.FC = () => (
  <ul className="list-disc list-inside space-y-1">
    <li>
      此页面显示 Hive 代币 (HIVE、HBD 和 VESTS) 的最大持有者，按余额排名。每行显示账户、排名和持有金额。
    </li>
    <li>
      使用顶部的{" "}
      <Filter className="inline-block align-middle h-4 w-4" /> 漏斗图标来筛选，如代币类型和余额类型。
    </li>
    <li>
      对于 VESTS，会显示等值的 Hive Power (HP)，以便更容易理解。
    </li>
    <li>
      此列表有助于跟踪主要持有人并了解 Hive 生态系统中的分布情况。
    </li>
  </ul>
);

// --- Japanese (ja) ---
const TopHoldersInfoJa: React.FC = () => (
  <ul className="list-disc list-inside space-y-1">
    <li>
      このページでは、Hive コイン (HIVE、HBD、VESTS) の最大保有者が残高順に表示されます。各行にはアカウント、順位、保有額が表示されます。
    </li>
    <li>
      上部の{" "}
      <Filter className="inline-block align-middle h-4 w-4" /> ファネルアイコンを使って、コインの種類や残高の種類などでフィルタできます。
    </li>
    <li>
      VESTS の場合は、理解しやすいように Hive Power (HP) に換算した値が表示されます。
    </li>
    <li>
      このリストは主要なステークホルダーを追跡し、Hive エコシステムにおける分布を理解するのに役立ちます。
    </li>
  </ul>
);

// --- Romanian (ro) ---
const TopHoldersInfoRo: React.FC = () => (
  <ul className="list-disc list-inside space-y-1">
    <li>
      Această pagină afișează principalii deținători de monede Hive (HIVE, HBD
      și VESTS), ordonați după sold. Fiecare rând prezintă contul, rangul și
      valoarea deținută.
    </li>
    <li>
      Folosiți pictograma{" "}
      <Filter className="inline-block align-middle h-4 w-4" /> de filtru din
      partea de sus pentru a aplica filtre precum tipul monedei și tipul de sold.
    </li>
    <li>
      Pentru VESTS, este afișat echivalentul în Hive Power (HP) pentru a facilita
      interpretarea.
    </li>
    <li>
      Această listă ajută la urmărirea marilor participanți și la înțelegerea
      distribuției în ecosistemul Hive.
    </li>
  </ul>
);

// --- Arabic (ar) ---
const TopHoldersInfoAr: React.FC = () => (
  <ul className="list-disc list-inside space-y-1">
    <li>
      تعرض هذه الصفحة كبار الحائزين لعملات Hive (HIVE و HBD و VESTS)، مرتبين حسب
      الرصيد. كل صف يُظهر الحساب والترتيب والقيمة المحتفظ بها.
    </li>
    <li>
      استخدم أيقونة{" "}
      <Filter className="inline-block align-middle h-4 w-4" /> على شكل قمع في
      الأعلى لتطبيق فلاتر مثل نوع العملة ونوع الرصيد.
    </li>
    <li>
      بالنسبة لـ VESTS، يتم عرض ما يعادله في Hive Power (HP) لتسهيل الفهم.
    </li>
    <li>
      تساعد هذه القائمة على تتبع كبار المساهمين وفهم توزيع الحصص في نظام Hive البيئي.
    </li>
  </ul>
);



// =================================================================
// 2. NEWLY ADDED LANGUAGE COMPONENTS
// =================================================================

// --- Italian (it) ---
const WitnessInfoIt: React.FC = () => (
  <div>
    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Cosa sono i Testimoni di Hive?</h2>
    <p className="text-gray-700 dark:text-gray-300 mb-4">I Testimoni di Hive sono i rappresentanti eletti che garantiscono l'integrità della catena, ma che ne modellano attivamente la direzione attraverso decisioni chiave.</p>
    <p className="text-gray-700 dark:text-gray-300 mb-4">Immagina Hive come una città prospera e decentralizzata. I Testimoni sono il consiglio comunale, le squadre di costruzione e le forze di sicurezza, tutto in uno.<br />Non solo mantengono la città in funzione (producendo blocchi, mantenendo nodi), ma decidono anche su politiche importanti come la costruzione di strade (impostazione dei parametri) e il valore della valuta della città (fonti di prezzo).</p>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Funzioni Chiave:</h3>
    <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4">
      <li><span className="font-medium">Produzione di Blocchi:</span> Sono responsabili della creazione di nuovi blocchi sulla blockchain di Hive, confermando le transazioni e proteggendo la rete.</li>
      <li><span className="font-medium">Manutenzione della Rete:</span> Operano e mantengono server potenti che assicurano il funzionamento affidabile della rete Hive.</li>
      <li><span className="font-medium">Impostazione dei Parametri:</span> Partecipano all'impostazione di parametri chiave della blockchain di Hive, come la dimensione del blocco, le commissioni di creazione degli account e i tassi di interesse HBD (APR).</li>
      <li><span className="font-medium">Fonti di Prezzo:</span> Forniscono fonti di prezzo per HIVE e HBD, cruciali per il funzionamento della stablecoin decentralizzata.</li>
    </ul>
  </div>
);
const BlocksInfoIt: React.FC = () => (
  <ul className="list-disc list-inside">
    <li>Questa pagina mostra un elenco di blocchi sulla blockchain di Hive, ordinati dal più recente al più vecchio. Ogni riga rappresenta un singolo blocco e fornisce informazioni chiave su di esso.</li>
    <li>Fai clic sull'icona <ChevronDown className="inline-block align-middle h-4 w-4" /> alla fine di ogni riga per visualizzare dettagli aggiuntivi sulle operazioni del blocco.</li>
    <li>Usa l'icona a imbuto <Filter className="inline-block align-middle h-4 w-4" /> in alto per accedere ai filtri e restringere l'elenco dei blocchi in base a criteri diversi.</li>
    <li>Passa il mouse sul valore della Ricompensa per il valore corrispondente in HP.</li>
  </ul>
);
const BalanceHistoryInfoIt: React.FC = () => (
    <ul className="list-disc list-inside">
        <li>Questa pagina mostra la cronologia del saldo di un dato account Hive per una moneta e un intervallo di tempo selezionati. Fornisce una rappresentazione visiva di come il tuo saldo è cambiato nel tempo. Per impostazione predefinita, vengono visualizzati i risultati dell'ultimo mese.</li>
        <li>Fai clic sull'icona <Filter className="inline-block align-middle h-4 w-4" /> in alto per accedere ai filtri e restringere i record.</li>
        <li>Il grafico mostra il tuo saldo, con valori granulari per giorno per mostrare le variazioni giornaliere del saldo.</li>
        <li>Usa lo slider sotto il grafico per ingrandire e concentrarti su intervalli di tempo specifici per una visualizzazione più dettagliata.</li>
    </ul>
);
const TransactionDetailsInfoIt: React.FC = () => (
    <ul className="list-disc list-inside">
        <li>Questa pagina mostra i dettagli della transazione di un dato hash di transazione.</li>
        <li>Fai clic sull'interruttore per includere le operazioni virtuali nella tabella delle operazioni sottostante.</li>
        <li>Puoi cambiare l'impostazione da Vista Dati nel menu principale per visualizzare i dati in altri formati.</li>
    </ul>
);

const ProposalsInfoIt: React.FC = () => (
  <div>
    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
      Cos'è il Sistema di Proposte di Hive (DHF)?
    </h2>
    <p className="text-gray-700 dark:text-gray-300 mb-4">
      Il Sistema di Proposte di Hive, noto anche come Fondo Decentralizzato di Hive (DHF), è un meccanismo di finanziamento guidato dalla comunità che assegna una parte dell'inflazione giornaliera della blockchain a progetti che beneficiano l'ecosistema.
    </p>
    <p className="text-gray-700 dark:text-gray-300 mb-4">
      Pensalo come un programma di sovvenzioni decentralizzato per l'ecosistema di Hive. Invece di un comitato centrale, gli stakeholder di Hive votano con i loro HIVE in stake per decidere quali progetti di sviluppo, marketing o comunitari ricevono finanziamenti direttamente dalla blockchain.
    </p>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
      Concetti Chiave:
    </h3>
    <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4">
      <li><span className="font-medium">Fonte di Finanziamento:</span> Il DHF è finanziato dal 10% dell'inflazione giornaliera di Hive, creando un 'Budget Giornaliero' continuo per sostenere la crescita dell'ecosistema.</li>
      <li><span className="font-medium">La Proposta di Ritorno (Soglia di Finanziamento):</span> Questa è una proposta speciale (ID #0) che riceve tutti i fondi non allocati dal Budget Giornaliero. Affinché qualsiasi altra proposta venga finanziata, deve ricevere più voti di questa Proposta di Ritorno. Questo meccanismo imposta una soglia di finanziamento dinamica decisa dalla comunità.</li>
      <li><span className="font-medium">Voto Ponderato per Stake:</span> I voti sulle proposte sono ponderati in base all'Hive Power (HIVE in stake). Maggiore è lo stake di un utente, maggiore è l'influenza del suo voto, garantendo che coloro che hanno investito di più nella piattaforma abbiano la voce più importante nel suo sviluppo.</li>
      <li><span className="font-medium">Aperto a Tutti:</span> Qualsiasi utente può presentare una proposta a pagamento, rendendolo un sistema senza permessi per chiunque voglia richiedere finanziamenti per un'idea che potrebbe aggiungere valore a Hive.</li>
    </ul>
  </div>
);

// --- German (de) ---
const WitnessInfoDe: React.FC = () => (
  <div>
    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Was sind Hive-Zeugen?</h2>
    <p className="text-gray-700 dark:text-gray-300 mb-4">Hive-Zeugen (Witnesses) sind die gewählten Vertreter, die sicherstellen, dass die Chain integer funktioniert, aber auch durch wichtige Entscheidungen aktiv ihre Richtung gestalten.</p>
    <p className="text-gray-700 dark:text-gray-300 mb-4">Stellen Sie sich Hive als eine blühende, dezentrale Stadt vor. Zeugen sind der Stadtrat, die Bautrupps und die Sicherheitskräfte in einem.<br />Sie halten nicht nur die Stadt am Laufen (indem sie Blöcke produzieren und Knoten warten), sondern entscheiden auch über wichtige Richtlinien wie den Straßenbau (Parametereinstellung) und den Wert der städtischen Währung (Preis-Feeds).</p>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Schlüsselfunktionen:</h3>
    <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4">
      <li><span className="font-medium">Blockproduktion:</span> Sie sind für die Erstellung neuer Blöcke auf der Hive-Blockchain verantwortlich, bestätigen Transaktionen und sichern das Netzwerk.</li>
      <li><span className="font-medium">Netzwerkwartung:</span> Sie betreiben und warten leistungsstarke Server, die das Hive-Netzwerk zuverlässig am Laufen halten.</li>
      <li><span className="font-medium">Parametereinstellung:</span> Sie beteiligen sich an der Festlegung wichtiger Parameter der Hive-Blockchain, wie Blockgröße, Gebühren für die Kontoerstellung und HBD-Zinssätze (APR).</li>
      <li><span className="font-medium">Preis-Feeds:</span> Sie liefern Preis-Feeds für HIVE und HBD, die für den Betrieb des dezentralen Stablecoins von entscheidender Bedeutung sind.</li>
    </ul>
  </div>
);
const BlocksInfoDe: React.FC = () => (
  <ul className="list-disc list-inside">
    <li>Diese Seite zeigt eine Liste von Blöcken auf der Hive-Blockchain, geordnet vom neuesten zum ältesten. Jede Zeile repräsentiert einen einzelnen Block und liefert wichtige Informationen dazu.</li>
    <li>Klicken Sie auf das <ChevronDown className="inline-block align-middle h-4 w-4" />-Symbol am Ende jeder Zeile, um zusätzliche Details zu den Blockoperationen anzuzeigen.</li>
    <li>Verwenden Sie das <Filter className="inline-block align-middle h-4 w-4" />-Trichter-Symbol oben, um auf Filter zuzugreifen und die Liste der Blöcke nach verschiedenen Kriterien einzugrenzen.</li>
    <li>Fahren Sie mit der Maus über den Belohnungswert, um den entsprechenden Wert in HP zu sehen.</li>
  </ul>
);
const BalanceHistoryInfoDe: React.FC = () => (
    <ul className="list-disc list-inside">
        <li>Diese Seite zeigt den Kontostandverlauf eines bestimmten Hive-Kontos für eine ausgewählte Münze und einen bestimmten Zeitraum an. Sie bietet eine visuelle Darstellung, wie sich Ihr Kontostand im Laufe der Zeit verändert hat. Standardmäßig werden die Ergebnisse für den letzten Monat angezeigt.</li>
        <li>Klicken Sie auf das <Filter className="inline-block align-middle h-4 w-4" />-Symbol oben, um auf Filter zuzugreifen und die Datensätze einzugrenzen.</li>
        <li>Das Diagramm zeigt Ihren Kontostand an, wobei die Werte tagesgenau sind, um tägliche Änderungen des Kontostands darzustellen.</li>
        <li>Verwenden Sie den Schieberegler unter dem Diagramm, um zu zoomen und sich auf bestimmte Zeitintervalle für eine detailliertere Ansicht zu konzentrieren.</li>
    </ul>
);
const TransactionDetailsInfoDe: React.FC = () => (
    <ul className="list-disc list-inside">
        <li>Diese Seite zeigt die Transaktionsdetails eines bestimmten Transaktions-Hashes an.</li>
        <li>Klicken Sie auf den Umschalter, um die virtuellen Operationen in die unten stehende Operationstabelle aufzunehmen.</li>
        <li>Sie können die Einstellung von Datenansicht im Hauptmenü ändern, um Daten in anderen Formaten anzuzeigen.</li>
    </ul>
);

const ProposalsInfoDe: React.FC = () => (
  <div>
    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
      Was ist das Hive-Vorschlagssystem (DHF)?
    </h2>
    <p className="text-gray-700 dark:text-gray-300 mb-4">
      Das Hive-Vorschlagssystem, auch bekannt als der Dezentralisierte Hive-Fonds (DHF), ist ein von der Community gesteuerter Finanzierungsmechanismus, der einen Teil der täglichen Inflation der Blockchain für Projekte bereitstellt, die dem Ökosystem zugutekommen.
    </p>
    <p className="text-gray-700 dark:text-gray-300 mb-4">
      Stellen Sie es sich wie ein dezentrales Förderprogramm für das Hive-Ökosystem vor. Anstelle eines zentralen Komitees stimmen die Hive-Stakeholder mit ihrem gestaketen HIVE ab, um zu entscheiden, welche Entwicklungs-, Marketing- oder Community-Projekte direkt von der Blockchain finanziert werden.
    </p>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
      Schlüsselkonzepte:
    </h3>
    <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4">
      <li><span className="font-medium">Finanzierungsquelle:</span> Der DHF wird durch 10 % der täglichen Inflation von Hive finanziert, wodurch ein kontinuierliches 'Tagesbudget' zur Unterstützung des Wachstums des Ökosystems entsteht.</li>
      <li><span className="font-medium">Der Rückgabevorschlag (Finanzierungsschwelle):</span> Dies ist ein spezieller Vorschlag (ID #0), der alle nicht zugewiesenen Mittel aus dem Tagesbudget erhält. Damit ein anderer Vorschlag finanziert wird, muss er mehr Stimmen als dieser Rückgabevorschlag erhalten. Dieser Mechanismus setzt eine dynamische, von der Community beschlossene Finanzierungsschwelle.</li>
      <li><span className="font-medium">Stake-gewichtete Abstimmung:</span> Die Stimmen für Vorschläge werden nach Hive Power (gestaketem HIVE) gewichtet. Je mehr Stake ein Benutzer hat, desto mehr Einfluss hat seine Stimme, was sicherstellt, dass diejenigen, die am meisten in die Plattform investiert haben, das größte Mitspracherecht bei ihrer Entwicklung haben.</li>
      <li><span className="font-medium">Offen für Alle:</span> Jeder Benutzer kann gegen eine Gebühr einen Vorschlag einreichen, was es zu einem erlaubnisfreien System macht, in dem jeder eine Finanzierung für eine Idee beantragen kann, die Hive einen Mehrwert bringen könnte.</li>
    </ul>
  </div>
);

// --- Portuguese (pt) ---
const WitnessInfoPt: React.FC = () => (
  <div>
    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">O que são as Testemunhas do Hive?</h2>
    <p className="text-gray-700 dark:text-gray-300 mb-4">As Testemunhas do Hive são os representantes eleitos que garantem que a cadeia opere com integridade, mas também moldam ativamente sua direção através de decisões-chave.</p>
    <p className="text-gray-700 dark:text-gray-300 mb-4">Imagine o Hive como uma cidade próspera e descentralizada. As Testemunhas são a câmara municipal, as equipes de construção e a força de segurança, tudo em um.<br />Elas não apenas mantêm a cidade funcionando (produzindo blocos, mantendo nós), mas também decidem sobre políticas importantes como a construção de estradas (configuração de parâmetros) e o valor da moeda da cidade (feeds de preço).</p>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Funções Principais:</h3>
    <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4">
      <li><span className="font-medium">Produção de Blocos:</span> São responsáveis por criar novos blocos na blockchain do Hive, confirmando transações e protegendo a rede.</li>
      <li><span className="font-medium">Manutenção da Rede:</span> Operam e mantêm servidores potentes que mantêm a rede Hive funcionando de forma confiável.</li>
      <li><span className="font-medium">Configuração de Parâmetros:</span> Participam na configuração de parâmetros-chave da blockchain do Hive, como o tamanho do bloco, taxas de criação de contas e taxas de juros do HBD (APR).</li>
      <li><span className="font-medium">Feeds de Preço:</span> Fornecem feeds de preço para HIVE e HBD, que são cruciais para o funcionamento da stablecoin descentralizada.</li>
    </ul>
  </div>
);
const BlocksInfoPt: React.FC = () => (
  <ul className="list-disc list-inside">
    <li>Esta página exibe uma lista de blocos na blockchain do Hive, ordenados do mais novo para o mais antigo. Cada linha representa um único bloco e fornece informações-chave sobre ele.</li>
    <li>Clique no ícone <ChevronDown className="inline-block align-middle h-4 w-4" /> no final de cada linha para ver detalhes adicionais sobre as operações do bloco.</li>
    <li>Use o ícone de funil <Filter className="inline-block align-middle h-4 w-4" /> na parte superior para acessar filtros e restringir a lista de blocos com base em diferentes critérios.</li>
    <li>Passe o mouse sobre o valor da Recompensa para ver o valor correspondente em HP.</li>
  </ul>
);
const BalanceHistoryInfoPt: React.FC = () => (
    <ul className="list-disc list-inside">
        <li>Esta página exibe o histórico de saldo de uma determinada conta Hive para uma moeda e um intervalo de tempo selecionados. Ela fornece uma representação visual de como seu saldo mudou ao longo do tempo. Por padrão, os resultados são exibidos para o último mês.</li>
        <li>Clique no ícone <Filter className="inline-block align-middle h-4 w-4" /> na parte superior para acessar filtros и restringir os registros.</li>
        <li>O gráfico exibe seu saldo, com valores granulares por dia para mostrar as mudanças diárias no saldo.</li>
        <li>Use o controle deslizante abaixo do gráfico para ampliar e focar em intervalos de tempo específicos para uma visualização mais detalhada.</li>
    </ul>
);
const TransactionDetailsInfoPt: React.FC = () => (
    <ul className="list-disc list-inside">
        <li>Esta página exibe os detalhes da transação de um determinado hash de transação.</li>
        <li>Clique no botão de alternância para incluir as operações virtuais na tabela de operações abaixo.</li>
        <li>Você pode alterar a configuração de Visualização de Dados no menu principal para ver os dados em outros formatos.</li>
    </ul>
);

const ProposalsInfoPt: React.FC = () => (
  <div>
    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
      O que é o Sistema de Propostas da Hive (DHF)?
    </h2>
    <p className="text-gray-700 dark:text-gray-300 mb-4">
      O Sistema de Propostas da Hive, também conhecido como Fundo Descentralizado da Hive (DHF), é um mecanismo de financiamento impulsionado pela comunidade que aloca uma parte da inflação diária da blockchain para projetos que beneficiam o ecossistema.
    </p>
    <p className="text-gray-700 dark:text-gray-300 mb-4">
      Pense nele como um programa de subsídios descentralizado para o ecossistema da Hive. Em vez de um comitê central, os stakeholders da Hive votam com seu HIVE em stake para decidir quais projetos de desenvolvimento, marketing ou comunitários recebem financiamento diretamente da blockchain.
    </p>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
      Conceitos-Chave:
    </h3>
    <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4">
      <li><span className="font-medium">Fonte de Financiamento:</span> O DHF é financiado por 10% da inflação diária da Hive, criando um 'Orçamento Diário' contínuo para apoiar o crescimento do ecossistema.</li>
      <li><span className="font-medium">A Proposta de Retorno (Limite de Financiamento):</span> Esta é uma proposta especial (ID #0) que recebe todos os fundos não alocados do Orçamento Diário. Para que qualquer outra proposta seja financiada, ela deve receber mais votos do que esta Proposta de Retorno. Este mecanismo estabelece um limite de financiamento dinâmico decidido pela comunidade.</li>
      <li><span className="font-medium">Votação Ponderada por Stake:</span> Os votos nas propostas são ponderados pelo Hive Power (HIVE em stake). Quanto mais stake um usuário tiver, mais influência seu voto carrega, garantindo que aqueles mais investidos na plataforma tenham a maior voz em seu desenvolvimento.</li>
      <li><span className="font-medium">Aberto a Todos:</span> Qualquer usuário pode enviar uma proposta mediante o pagamento de uma taxa, tornando-o um sistema sem permissão para que qualquer pessoa solicite financiamento para uma ideia que possa agregar valor à Hive.</li>
    </ul>
  </div>
);

// --- French (fr) ---
const WitnessInfoFr: React.FC = () => (
  <div>
    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Que sont les Témoins Hive ?</h2>
    <p className="text-gray-700 dark:text-gray-300 mb-4">Les Témoins Hive sont les représentants élus qui garantissent l'intégrité de la chaîne, mais qui façonnent aussi activement sa direction par des décisions clés.</p>
    <p className="text-gray-700 dark:text-gray-300 mb-4">Imaginez Hive comme une ville prospère et décentralisée. Les Témoins sont le conseil municipal, les équipes de construction et les forces de sécurité, tout en un.<br />Ils ne se contentent pas de faire fonctionner la ville (en produisant des blocs, en maintenant des nœuds), mais décident également de politiques importantes comme la construction de routes (paramétrage) et la valeur de la monnaie de la ville (flux de prix).</p>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Fonctions Clés :</h3>
    <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4">
      <li><span className="font-medium">Production de Blocs :</span> Ils sont responsables de la création de nouveaux blocs sur la blockchain Hive, de la confirmation des transactions et de la sécurisation du réseau.</li>
      <li><span className="font-medium">Maintenance du Réseau :</span> Ils exploitent et maintiennent des serveurs puissants qui assurent le fonctionnement fiable du réseau Hive.</li>
      <li><span className="font-medium">Paramétrage :</span> Ils participent à la définition des paramètres clés de la blockchain Hive, tels que la taille des blocs, les frais de création de compte et les taux d'intérêt HBD (APR).</li>
      <li><span className="font-medium">Flux de Prix :</span> Ils fournissent des flux de prix pour HIVE et HBD, qui sont cruciaux pour le fonctionnement de la stablecoin décentralisée.</li>
    </ul>
  </div>
);
const BlocksInfoFr: React.FC = () => (
  <ul className="list-disc list-inside">
    <li>Cette page affiche une liste de blocs de la blockchain Hive, classés du plus récent au plus ancien. Chaque ligne représente un seul bloc et fournit des informations clés à son sujet.</li>
    <li>Cliquez sur l'icône <ChevronDown className="inline-block align-middle h-4 w-4" /> à la fin de chaque ligne pour afficher des détails supplémentaires sur les opérations du bloc.</li>
    <li>Utilisez l'icône en forme d'entonnoir <Filter className="inline-block align-middle h-4 w-4" /> en haut pour accéder aux filtres et affiner la liste des blocs en fonction de différents critères.</li>
    <li>Passez la souris sur la valeur de la récompense pour voir la valeur correspondante en HP.</li>
  </ul>
);
const BalanceHistoryInfoFr: React.FC = () => (
    <ul className="list-disc list-inside">
        <li>Cette page affiche l'historique du solde d'un compte Hive donné pour une devise et une période sélectionnées. Elle fournit une représentation visuelle de l'évolution de votre solde au fil du temps. Par défaut, les résultats sont affichés pour le dernier mois.</li>
        <li>Cliquez sur l'icône <Filter className="inline-block align-middle h-4 w-4" /> en haut pour accéder aux filtres et affiner les enregistrements.</li>
        <li>Le graphique affiche votre solde, avec des valeurs granulaires par jour pour montrer les variations quotidiennes du solde.</li>
        <li>Utilisez le curseur sous le graphique pour zoomer et vous concentrer sur des intervalles de temps spécifiques pour une vue plus détaillée.</li>
    </ul>
);
const TransactionDetailsInfoFr: React.FC = () => (
    <ul className="list-disc list-inside">
        <li>Cette page affiche les détails de la transaction pour un hash de transaction donné.</li>
        <li>Cliquez sur le commutateur pour inclure les opérations virtuelles dans le tableau des opérations ci-dessous.</li>
        <li>Vous pouvez modifier le paramètre de Vue des Données dans le menu principal pour afficher les données dans d'autres formats.</li>
    </ul>
);
const ProposalsInfoFr: React.FC = () => (
  <div>
    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
      Qu'est-ce que le Système de Propositions de Hive (DHF) ?
    </h2>
    <p className="text-gray-700 dark:text-gray-300 mb-4">
      Le Système de Propositions de Hive, également connu sous le nom de Fonds Décentralisé de Hive (DHF), est un mécanisme de financement communautaire qui alloue une partie de l'inflation quotidienne de la blockchain à des projets qui bénéficient à l'écosystème.
    </p>
    <p className="text-gray-700 dark:text-gray-300 mb-4">
      Considérez-le comme un programme de subventions décentralisé pour l'écosystème Hive. Au lieu d'un comité central, les parties prenantes de Hive votent avec leur HIVE en stake pour décider quels projets de développement, de marketing ou communautaires reçoivent un financement directement de la blockchain.
    </p>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
      Concepts Clés :
    </h3>
    <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4">
      <li><span className="font-medium">Source de Financement :</span> Le DHF est financé par 10 % de l'inflation quotidienne de Hive, créant un 'Budget Quotidien' continu pour soutenir la croissance de l'écosystème.</li>
      <li><span className="font-medium">La Proposition de Retour (Seuil de Financement) :</span> C'est une proposition spéciale (ID #0) qui reçoit tous les fonds non alloués du Budget Quotidien. Pour qu'une autre proposition soit financée, elle doit recevoir plus de votes que cette Proposition de Retour. Ce mécanisme établit un seuil de financement dynamique décidé par la communauté.</li>
      <li><span className="font-medium">Vote Pondéré par le Stake :</span> Les votes sur les propositions sont pondérés par le Hive Power (HIVE en stake). Plus un utilisateur a de stake, plus son vote a d'influence, garantissant que ceux qui sont le plus investis dans la plateforme ont le plus leur mot à dire dans son développement.</li>
      <li><span className="font-medium">Ouvert à Tous :</span> Tout utilisateur peut soumettre une proposition moyennant des frais, ce qui en fait un système sans permission pour quiconque souhaite demander un financement pour une idée qui pourrait ajouter de la valeur à Hive.</li>
    </ul>
  </div>
);

// --- Polish (pl) ---
const WitnessInfoPl: React.FC = () => (
  <div>
    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Kim są Świadkowie Hive?</h2>
    <p className="text-gray-700 dark:text-gray-300 mb-4">Świadkowie Hive to wybrani przedstawiciele, którzy zapewniają integralność działania łańcucha, ale także aktywnie kształtują jego kierunek poprzez kluczowe decyzje.</p>
    <p className="text-gray-700 dark:text-gray-300 mb-4">Wyobraź sobie Hive jako kwitnące, zdecentralizowane miasto. Świadkowie to rada miasta, ekipy budowlane i siły bezpieczeństwa w jednym.<br />Nie tylko utrzymują miasto w ruchu (produkując bloki, utrzymując węzły), ale także decydują o ważnych politykach, takich jak budowa dróg (ustawianie parametrów) i wartość miejskiej waluty (feedy cenowe).</p>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Kluczowe Funkcje:</h3>
    <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4">
      <li><span className="font-medium">Produkcja Bloków:</span> Są odpowiedzialni za tworzenie nowych bloków w blockchainie Hive, potwierdzanie transakcji i zabezpieczanie sieci.</li>
      <li><span className="font-medium">Utrzymanie Sieci:</span> Obsługują i utrzymują potężne serwery, które zapewniają niezawodne działanie sieci Hive.</li>
      <li><span className="font-medium">Ustawianie Parametrów:</span> Biorą udział w ustalaniu kluczowych parametrów blockchaina Hive, takich jak rozmiar bloku, opłaty za tworzenie kont i stopy procentowe HBD (APR).</li>
      <li><span className="font-medium">Feedy Cenowe:</span> Dostarczają feedy cenowe dla HIVE i HBD, które są kluczowe dla działania zdecentralizowanego stablecoina.</li>
    </ul>
  </div>
);
const BlocksInfoPl: React.FC = () => (
  <ul className="list-disc list-inside">
    <li>Ta strona wyświetla listę bloków w blockchainie Hive, posortowaną od najnowszego do najstarszego. Każdy wiersz reprezentuje pojedynczy blok i dostarcza kluczowych informacji na jego temat.</li>
    <li>Kliknij ikonę <ChevronDown className="inline-block align-middle h-4 w-4" /> na końcu każdego wiersza, aby wyświetlić dodatkowe szczegóły dotyczące operacji w bloku.</li>
    <li>Użyj ikony lejka <Filter className="inline-block align-middle h-4 w-4" /> na górze, aby uzyskać dostęp do filtrów i zawęzić listę bloków na podstawie różnych kryteriów.</li>
    <li>Najedź kursorem na wartość Nagrody, aby zobaczyć odpowiadającą jej wartość w HP.</li>
  </ul>
);
const BalanceHistoryInfoPl: React.FC = () => (
    <ul className="list-disc list-inside">
        <li>Ta strona wyświetla historię salda danego konta Hive dla wybranej monety i zakresu czasowego. Przedstawia wizualną reprezentację zmian salda w czasie. Domyślnie wyświetlane są wyniki za ostatni miesiąc.</li>
        <li>Kliknij ikonę <Filter className="inline-block align-middle h-4 w-4" /> na górze, aby uzyskać dostęp do filtrów i zawęzić rekordy.</li>
        <li>Wykres wyświetla Twoje saldo z wartościami o granulacji dziennej, aby pokazać codzienne zmiany salda.</li>
        <li>Użyj suwaka pod wykresem, aby powiększyć i skupić się na określonych przedziałach czasowych w celu uzyskania bardziej szczegółowego widoku.</li>
    </ul>
);
const TransactionDetailsInfoPl: React.FC = () => (
    <ul className="list-disc list-inside">
        <li>Ta strona wyświetla szczegóły transakcji dla danego hasha transakcji.</li>
        <li>Kliknij przełącznik, aby uwzględnić operacje wirtualne w poniższej tabeli operacji.</li>
        <li>Możesz zmienić ustawienie z Widoku Danych w menu głównym, aby wyświetlić dane w innych formatach.</li>
    </ul>
);
const ProposalsInfoPl: React.FC = () => (
  <div>
    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
      Czym jest System Propozycji Hive (DHF)?
    </h2>
    <p className="text-gray-700 dark:text-gray-300 mb-4">
      System Propozycji Hive, znany również jako Zdecentralizowany Fundusz Hive (DHF), to mechanizm finansowania napędzany przez społeczność, który przeznacza część dziennej inflacji blockchain na projekty przynoszące korzyści ekosystemowi.
    </p>
    <p className="text-gray-700 dark:text-gray-300 mb-4">
      Pomyśl o tym jak o zdecentralizowanym programie grantowym dla ekosystemu Hive. Zamiast centralnego komitetu, interesariusze Hive głosują za pomocą swojego HIVE w stake, aby zdecydować, które projekty rozwojowe, marketingowe lub społecznościowe otrzymają finansowanie bezpośrednio z blockchaina.
    </p>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
      Kluczowe Pojęcia:
    </h3>
    <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4">
      <li><span className="font-medium">Źródło Finansowania:</span> DHF jest finansowany z 10% dziennej inflacji Hive, tworząc ciągły 'Budżet Dzienny' na wspieranie wzrostu ekosystemu.</li>
      <li><span className="font-medium">Propozycja Zwrotna (Próg Finansowania):</span> Jest to specjalna propozycja (ID #0), która otrzymuje wszystkie nieprzydzielone środki z Budżetu Dziennego. Aby jakakolwiek inna propozycja została sfinansowana, musi otrzymać więcej głosów niż ta Propozycja Zwrotna. Ten mechanizm ustala dynamiczny, decydowany przez społeczność próg finansowania.</li>
      <li><span className="font-medium">Głosowanie Ważone Stakiem:</span> Głosy na propozycje są ważone przez Hive Power (HIVE w stake). Im więcej stake'u ma użytkownik, tym większy wpływ ma jego głos, zapewniając, że najbardziej zaangażowani w platformę mają największy wpływ na jej rozwój.</li>
      <li><span className="font-medium">Otwarty dla Wszystkich:</span> Każdy użytkownik może złożyć propozycję za opłatą, co czyni go systemem bez pozwoleń dla każdego, kto chce ubiegać się o finansowanie pomysłu, który mógłby dodać wartość do Hive.</li>
    </ul>
  </div>
);
// --- Chinese (zh) ---
const WitnessInfoZh: React.FC = () => (
  <div>
    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">什么是Hive见证人？</h2>
    <p className="text-gray-700 dark:text-gray-300 mb-4">Hive见证人是选举出的代表，他们确保链的完整性运作，并通过关键决策积极塑造其发展方向。</p>
    <p className="text-gray-700 dark:text-gray-300 mb-4">想象一下Hive是一个繁荣的去中心化城市。见证人集市议会、建筑队和安全部队于一身。<br />他们不仅保持城市运行（生产区块、维护节点），还决定重要政策，如道路建设（参数设置）和城市货币的价值（价格信息流）。</p>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">主要职能：</h3>
    <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4">
      <li><span className="font-medium">区块生产：</span>他们负责在Hive区块链上创建新区块，确认交易并保护网络安全。</li>
      <li><span className="font-medium">网络维护：</span>他们运营和维护强大的服务器，以保持Hive网络的可靠运行。</li>
      <li><span className="font-medium">参数设置：</span>他们参与设置Hive区块链的关键参数，如区块大小、账户创建费和HBD利率（APR）。</li>
      <li><span className="font-medium">价格信息流：</span>他们提供HIVE和HBD的价格信息流，这对于去中心化稳定币的运作至关重要。</li>
    </ul>
  </div>
);
const BlocksInfoZh: React.FC = () => (
  <ul className="list-disc list-inside">
    <li>此页面显示Hive区块链上的区块列表，按从新到旧的顺序排列。每一行代表一个区块，并提供其关键信息。</li>
    <li>单击每行末尾的 <ChevronDown className="inline-block align-middle h-4 w-4" /> 图标，查看有关区块操作的更多详细信息。</li>
    <li>使用顶部的 <Filter className="inline-block align-middle h-4 w-4" /> 漏斗图标访问筛选器，并根据不同标准缩小区块列表范围。</li>
    <li>将鼠标悬停在奖励值上，可查看相应的HP值。</li>
  </ul>
);
const BalanceHistoryInfoZh: React.FC = () => (
    <ul className="list-disc list-inside">
        <li>此页面显示给定Hive账户在选定代币和时间范围内的余额历史。它直观地展示了您的余额随时间的变化。默认情况下，显示上个月的结果。</li>
        <li>单击顶部的 <Filter className="inline-block align-middle h-4 w-4" /> 图标访问筛选器并缩小记录范围。</li>
        <li>图表显示您的余额，其值按天细分，以显示每日余额变化。</li>
        <li>使用图表下方的滑块进行缩放，并专注于特定时间间隔以获取更详细的视图。</li>
    </ul>
);
const TransactionDetailsInfoZh: React.FC = () => (
    <ul className="list-disc list-inside">
        <li>此页面显示给定交易哈希的交易详情。</li>
        <li>单击切换开关以在下面的操作表中包含虚拟操作。</li>
        <li>您可以从主菜单的数据视图更改设置，以其他格式查看数据。</li>
    </ul>
);
const ProposalsInfoZh: React.FC = () => (
  <div>
    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
      什么是 Hive 提案系统 (DHF)？
    </h2>
    <p className="text-gray-700 dark:text-gray-300 mb-4">
      Hive 提案系统，也称为去中心化 Hive 基金 (DHF)，是一个由社区驱动的资金机制，它将区块链每日通胀的一部分分配给有益于生态系统的项目。
    </p>
    <p className="text-gray-700 dark:text-gray-300 mb-4">
      可以把它看作是 Hive 生态系统的一个去中心化资助计划。没有中央委员会，而是由 Hive 的利益相关者用他们质押的 HIVE 进行投票，以决定哪些开发、营销或社区项目能直接从区块链获得资金。
    </p>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
      核心概念：
    </h3>
    <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4">
      <li><span className="font-medium">资金来源：</span>DHF 的资金来自 Hive 每日通胀的 10%，形成一个持续的“每日预算”，以支持生态系统的增长。</li>
      <li><span className="font-medium">返回提案（资金门槛）：</span>这是一个特殊的提案（ID #0），它会接收每日预算中所有未分配的资金。任何其他提案想要获得资助，其得票数必须超过这个返回提案。该机制设定了一个由社区决定的动态资金门槛。</li>
      <li><span className="font-medium">权益加权投票：</span>提案的投票由 Hive Power（质押的 HIVE）加权。用户持有的权益越多，其投票的影响力就越大，确保了对平台投入最多的人在其发展中拥有最大的发言权。</li>
      <li><span className="font-medium">向所有人开放：</span>任何用户只需支付一笔费用即可提交提案，这是一个无需许可的系统，任何人都可以为一个可能为 Hive 增加价值的想法申请资金。</li>
    </ul>
  </div>
);
// --- Japanese (ja) ---
const WitnessInfoJa: React.FC = () => (
  <div>
    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Hiveの証人とは？</h2>
    <p className="text-gray-700 dark:text-gray-300 mb-4">Hiveの証人（ウィットネス）は、チェーンが誠実に運営されることを保証する選挙で選ばれた代表者であり、主要な決定を通じてその方向性を積極的に形成します。</p>
    <p className="text-gray-700 dark:text-gray-300 mb-4">Hiveを活気ある分散型の都市だと想像してみてください。証人は市議会、建設作業員、警備隊を兼ね備えた存在です。<br />彼らは都市の運営（ブロックの生成、ノードの維持）を維持するだけでなく、道路建設（パラメータ設定）や都市の通貨価値（価格フィード）などの重要な政策も決定します。</p>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">主な機能：</h3>
    <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4">
      <li><span className="font-medium">ブロックの生成：</span>Hiveブロックチェーン上で新しいブロックを作成し、トランザクションを承認し、ネットワークを保護する責任があります。</li>
      <li><span className="font-medium">ネットワークの維持：</span>Hiveネットワークを安定して稼働させる強力なサーバーを運用・維持します。</li>
      <li><span className="font-medium">パラメータ設定：</span>ブロックサイズ、アカウント作成手数料、HBDの利率（APR）など、Hiveブロックチェーンの主要なパラメータ設定に参加します。</li>
      <li><span className="font-medium">価格フィード：</span>分散型ステーブルコインの運用に不可欠なHIVEとHBDの価格フィードを提供します。</li>
    </ul>
  </div>
);
const BlocksInfoJa: React.FC = () => (
  <ul className="list-disc list-inside">
    <li>このページには、Hiveブロックチェーン上のブロックのリストが新しいものから古いものへと順に表示されます。各行は単一のブロックを表し、それに関する主要な情報を提供します。</li>
    <li>各行の最後にある<ChevronDown className="inline-block align-middle h-4 w-4" />アイコンをクリックすると、ブロックのオペレーションに関する追加の詳細が表示されます。</li>
    <li>上部にある<Filter className="inline-block align-middle h-4 w-4" />じょうごアイコンを使用してフィルターにアクセスし、さまざまな基準に基づいてブロックのリストを絞り込みます。</li>
    <li>報酬の値にカーソルを合わせると、対応するHPの値が表示されます。</li>
  </ul>
);
const BalanceHistoryInfoJa: React.FC = () => (
    <ul className="list-disc list-inside">
        <li>このページには、選択されたコインと期間における特定のHiveアカウントの残高履歴が表示されます。時間の経過とともに残高がどのように変化したかを視覚的に示します。デフォルトでは、先月の結果が表示されます。</li>
        <li>上部の<Filter className="inline-block align-middle h-4 w-4" />アイコンをクリックしてフィルターにアクセスし、記録を絞り込みます。</li>
        <li>チャートには、日々の残高変動を示すために日単位で詳細化された残高が表示されます。</li>
        <li>チャートの下のスライダーを使用して、特定の期間にズームインして詳細なビューを表示します。</li>
    </ul>
);
const TransactionDetailsInfoJa: React.FC = () => (
    <ul className="list-disc list-inside">
        <li>このページには、特定のトランザクションハッシュのトランザクション詳細が表示されます。</li>
        <li>下のオペレーションテーブルに仮想オペレーションを含めるには、トグルスイッチをクリックします。</li>
        <li>メインメニューのデータビューから設定を変更して、他の形式でデータを表示できます。</li>
    </ul>
);
const ProposalsInfoJa: React.FC = () => (
  <div>
    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
      Hive提案システム（DHF）とは何ですか？
    </h2>
    <p className="text-gray-700 dark:text-gray-300 mb-4">
      Hive提案システムは、分散型Hive基金（DHF）としても知られ、コミュニティ主導の資金調達メカニズムであり、ブロックチェーンの毎日のインフレの一部をエコシステムに利益をもたらすプロジェクトに割り当てます。
    </p>
    <p className="text-gray-700 dark:text-gray-300 mb-4">
      Hiveエコシステムのための分散型助成金プログラムと考えてください。中央委員会ではなく、HiveのステークホルダーがステークしたHIVEで投票し、どの開発、マーケティング、またはコミュニティプロジェクトがブロックチェーンから直接資金を受け取るかを決定します。
    </p>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
      主な概念：
    </h3>
    <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4">
      <li><span className="font-medium">資金源：</span>DHFはHiveの毎日のインフレの10％から資金を供給され、エコシステムの成長を支援するための継続的な「日次予算」を作成します。</li>
      <li><span className="font-medium">リターン提案（資金調達の閾値）：</span>これは、日次予算から未割り当ての資金をすべて受け取る特別な提案（ID #0）です。他の提案が資金提供を受けるためには、このリターン提案よりも多くの票を獲得する必要があります。このメカニズムは、コミュニティによって決定される動的な資金調達の閾値を設定します。</li>
      <li><span className="font-medium">ステーク加重投票：</span>提案への投票はHiveパワー（ステークしたHIVE）によって加重されます。ユーザーが持つステークが多いほど、その投票の影響力は大きくなり、プラットフォームに最も投資している人々がその開発において最も大きな発言権を持つことを保証します。</li>
      <li><span className="font-medium">誰にでも公開：</span>どのユーザーも手数料を支払うことで提案を提出でき、Hiveに価値をもたらす可能性のあるアイデアに対して誰でも資金を要求できるパーミッションレスなシステムです。</li>
    </ul>
  </div>
);
// --- Romanian (ro) ---
const WitnessInfoRo: React.FC = () => (
  <div>
    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Ce sunt Martorii Hive?</h2>
    <p className="text-gray-700 dark:text-gray-300 mb-4">Martorii Hive sunt reprezentanții aleși care se asigură că rețeaua funcționează cu integritate, dar și modelează activ direcția acesteia prin decizii cheie.</p>
    <p className="text-gray-700 dark:text-gray-300 mb-4">Imaginați-vă Hive ca pe un oraș prosper, descentralizat. Martorii sunt consiliul local, echipele de construcții și forța de securitate, toate la un loc.<br />Ei nu numai că mențin orașul în funcțiune (producând blocuri, întreținând noduri), dar decid și asupra politicilor importante, cum ar fi construcția de drumuri (setarea parametrilor) și valoarea monedei orașului (feed-uri de preț).</p>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Funcții Cheie:</h3>
    <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4">
      <li><span className="font-medium">Producția de Blocuri:</span> Sunt responsabili pentru crearea de noi blocuri în blockchain-ul Hive, confirmând tranzacțiile și securizând rețeaua.</li>
      <li><span className="font-medium">Întreținerea Rețelei:</span> Operează și întrețin servere puternice care mențin rețeaua Hive funcțională în mod fiabil.</li>
      <li><span className="font-medium">Setarea Parametrilor:</span> Participă la setarea parametrilor cheie ai blockchain-ului Hive, cum ar fi dimensiunea blocului, taxele de creare a conturilor și ratele dobânzii HBD (DAE).</li>
      <li><span className="font-medium">Feed-uri de Preț:</span> Furnizează feed-uri de preț pentru HIVE și HBD, care sunt cruciale pentru funcționarea stablecoin-ului descentralizat.</li>
    </ul>
  </div>
);
const BlocksInfoRo: React.FC = () => (
  <ul className="list-disc list-inside">
    <li>Această pagină afișează o listă de blocuri din blockchain-ul Hive, ordonate de la cel mai nou la cel mai vechi. Fiecare rând reprezintă un singur bloc și oferă informații cheie despre acesta.</li>
    <li>Faceți clic pe pictograma <ChevronDown className="inline-block align-middle h-4 w-4" /> de la capătul fiecărui rând pentru a vizualiza detalii suplimentare despre operațiunile blocului.</li>
    <li>Utilizați pictograma pâlnie <Filter className="inline-block align-middle h-4 w-4" /> din partea de sus pentru a accesa filtrele și a restrânge lista de blocuri pe baza diferitelor criterii.</li>
    <li>Treceți cu mouse-ul peste valoarea Recompensei pentru valoarea corespunzătoare în HP.</li>
  </ul>
);
const BalanceHistoryInfoRo: React.FC = () => (
    <ul className="list-disc list-inside">
        <li>Această pagină afișează istoricul soldului unui anumit cont Hive pentru o monedă și un interval de timp selectate. Oferă o reprezentare vizuală a modului în care soldul dvs. s-a schimbat în timp. În mod implicit, rezultatele sunt afișate pentru ultima lună.</li>
        <li>Faceți clic pe pictograma <Filter className="inline-block align-middle h-4 w-4" /> din partea de sus pentru a accesa filtrele și a restrânge înregistrările.</li>
        <li>Graficul afișează soldul dvs., cu valori granulare pe zi pentru a arăta modificările zilnice ale soldului.</li>
        <li>Utilizați glisorul de sub grafic pentru a mări și a vă concentra pe intervale de timp specifice pentru o vizualizare mai detaliată.</li>
    </ul>
);
const TransactionDetailsInfoRo: React.FC = () => (
    <ul className="list-disc list-inside">
        <li>Această pagină afișează detaliile tranzacției pentru un anumit hash de tranzacție.</li>
        <li>Faceți clic pe comutator pentru a include operațiunile virtuale în tabelul de operațiuni de mai jos.</li>
        <li>Puteți schimba setarea din Vizualizare Date în meniul principal pentru a vizualiza datele în alte formate.</li>
    </ul>
);
const ProposalsInfoRo: React.FC = () => (
  <div>
    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
      Ce este Sistemul de Propuneri Hive (DHF)?
    </h2>
    <p className="text-gray-700 dark:text-gray-300 mb-4">
      Sistemul de Propuneri Hive, cunoscut și ca Fondul Descentralizat Hive (DHF), este un mecanism de finanțare condus de comunitate care alocă o parte din inflația zilnică a blockchain-ului către proiecte ce aduc beneficii ecosistemului.
    </p>
    <p className="text-gray-700 dark:text-gray-300 mb-4">
      Gândiți-vă la el ca la un program de granturi descentralizat pentru ecosistemul Hive. În loc de un comitet central, deținătorii de interese (stakeholders) din Hive votează cu HIVE-ul lor pus la stake pentru a decide ce proiecte de dezvoltare, marketing sau comunitare primesc finanțare direct de pe blockchain.
    </p>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
      Concepte Cheie:
    </h3>
    <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4">
      <li><span className="font-medium">Sursa de Finanțare:</span> DHF este finanțat din 10% din inflația zilnică a Hive, creând un 'Buget Zilnic' continuu pentru a sprijini creșterea ecosistemului.</li>
      <li><span className="font-medium">Propunerea de Retur (Pragul de Finanțare):</span> Aceasta este o propunere specială (ID #0) care primește toate fondurile nealocate din Bugetul Zilnic. Pentru ca orice altă propunere să fie finanțată, trebuie să primească mai multe voturi decât această Propunere de Retur. Acest mecanism stabilește un prag de finanțare dinamic, decis de comunitate.</li>
      <li><span className="font-medium">Vot Ponderat cu Miza (Stake):</span> Voturile pentru propuneri sunt ponderate în funcție de Hive Power (HIVE pus la stake). Cu cât un utilizator are o miză mai mare, cu atât votul său are mai multă influență, asigurând că cei mai investiți în platformă au cel mai important cuvânt de spus în dezvoltarea sa.</li>
      <li><span className="font-medium">Deschis Tuturor:</span> Orice utilizator poate trimite o propunere contra unei taxe, făcându-l un sistem fără permisiuni pentru oricine dorește să solicite finanțare pentru o idee care ar putea adăuga valoare Hive.</li>
    </ul>
  </div>
);

// --- Arabic (ar) ---
const WitnessInfoAr: React.FC = () => (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        ما هم شهود Hive؟
      </h2>
      <p className="text-gray-700 dark:text-gray-300 mb-4">
        شهود Hive هم الممثلون المنتخبون الذين يضمنون عمل السلسلة بنزاهة، ويقومون أيضًا بتشكيل اتجاهها بفاعلية من خلال القرارات الرئيسية.
      </p>
      <p className="text-gray-700 dark:text-gray-300 mb-4">
        تخيل Hive كمدينة مزدهرة ولامركزية. الشهود هم مجلس المدينة، وفرق البناء، وقوات الأمن، كل ذلك في كيان واحد. <br />
        إنهم لا يحافظون على تشغيل المدينة فقط (بإنتاج البلوكات وصيانة العُقد)، بل يقررون أيضًا سياسات هامة مثل بناء الطرق (إعدادات المعلمات) وقيمة عملة المدينة (تغذية الأسعار).
      </p>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        الوظائف الرئيسية:
      </h3>
      <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4">
        <li><span className="font-medium">إنتاج البلوكات:</span> هم المسؤولون عن إنشاء بلوكات جديدة على بلوك تشين Hive، وتأكيد المعاملات، وتأمين الشبكة.</li>
        <li><span className="font-medium">صيانة الشبكة:</span> يقومون بتشغيل وصيانة خوادم قوية تحافظ على تشغيل شبكة Hive بشكل موثوق.</li>
        <li><span className="font-medium">إعداد المعلمات:</span> يشاركون في تحديد المعلمات الرئيسية لبلوك تشين Hive، مثل حجم البلوك، ورسوم إنشاء الحسابات، ومعدلات الفائدة على HBD (APR).</li>
        <li><span className="font-medium">تغذية الأسعار:</span> يقدمون تغذية أسعار لـ HIVE و HBD، وهي حاسمة لتشغيل العملة المستقرة اللامركزية.</li>
      </ul>
    </div>
);

const BlocksInfoAr: React.FC = () => (
  <ul className="list-disc list-inside">
    <li>تعرض هذه الصفحة قائمة بالبلوكات في بلوك تشين Hive، مرتبة من الأحدث إلى الأقدم. يمثل كل صف بلوكاً واحداً ويوفر معلومات أساسية عنه.</li>
    <li>انقر على أيقونة <ChevronDown className="inline-block align-middle h-4 w-4" /> في نهاية كل صف لعرض تفاصيل إضافية حول عمليات البلوك.</li>
    <li>استخدم أيقونة القمع <Filter className="inline-block align-middle h-4 w-4" /> في الأعلى للوصول إلى المرشحات وتضييق قائمة البلوكات بناءً على معايير مختلفة.</li>
    <li>مرر الفأرة فوق قيمة المكافأة لمعرفة القيمة المقابلة لها بـ HP.</li>
  </ul>
);

const BalanceHistoryInfoAr: React.FC = () => (
    <ul className="list-disc list-inside">
        <li>تعرض هذه الصفحة سجل الرصيد لحساب Hive معين لعملة وفترة زمنية محددة. وهي توفر تمثيلاً مرئياً لكيفية تغير رصيدك بمرور الوقت. بشكل افتراضي، يتم عرض نتائج الشهر الماضي.</li>
        <li>انقر على أيقونة <Filter className="inline-block align-middle h-4 w-4" /> في الأعلى للوصول إلى المرشحات وتضييق السجلات.</li>
        <li>يعرض الرسم البياني رصيدك، مع قيم مفصلة يومياً لإظهار التغيرات اليومية في الرصيد.</li>
        <li>استخدم شريط التمرير أسفل الرسم البياني للتكبير والتركيز على فترات زمنية محددة للحصول على عرض أكثر تفصيلاً.</li>
    </ul>
);

const TransactionDetailsInfoAr: React.FC = () => (
    <ul className="list-disc list-inside">
        <li>تعرض هذه الصفحة تفاصيل المعاملة لهاش معاملة معين.</li>
        <li>انقر على مفتاح التبديل لتضمين العمليات الافتراضية في جدول العمليات أدناه.</li>
        <li>يمكنك تغيير الإعداد من "عرض البيانات" في القائمة الرئيسية لعرض البيانات بتنسيقات أخرى.</li>
    </ul>
);

export const ProposalsInfoAr: React.FC = () => (
  <div>
    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
      ما هو نظام مقترحات Hive (DHF)؟
    </h2>
    <p className="text-gray-700 dark:text-gray-300 mb-4">
      نظام مقترحات Hive، المعروف أيضًا باسم صندوق Hive اللامركزي (DHF)، هو آلية تمويل يقودها المجتمع تخصص جزءًا من التضخم اليومي للبلوك تشين للمشاريع التي تفيد النظام البيئي.
    </p>
    <p className="text-gray-700 dark:text-gray-300 mb-4">
      فكر فيه كبرنامج منح لامركزي لنظام Hive البيئي. بدلاً من لجنة مركزية، يصوت أصحاب المصلحة في Hive باستخدام عملات HIVE المكدسة لديهم (المحصصة) لتحديد أي من مشاريع التطوير أو التسويق أو المشاريع المجتمعية تتلقى تمويلاً مباشراً من البلوك تشين.
    </p>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
      المفاهيم الأساسية:
    </h3>
    <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4">
      <li><span className="font-medium">مصدر التمويل:</span> يتم تمويل DHF بنسبة 10٪ من التضخم اليومي لـ Hive، مما يخلق "ميزانية يومية" مستمرة لدعم نمو النظام البيئي.</li>
      <li><span className="font-medium">مقترح الإرجاع (عتبة التمويل):</span> هذا مقترح خاص (معرف #0) يتلقى جميع الأموال غير المخصصة من الميزانية اليومية. لكي يتم تمويل أي مقترح آخر، يجب أن يحصل على أصوات أكثر من مقترح الإرجاع هذا. هذه الآلية تضع عتبة تمويل ديناميكية يقررها المجتمع.</li>
      <li><span className="font-medium">التصويت المرجح بالحصص:</span> يتم ترجيح الأصوات على المقترحات بواسطة قوة Hive (HIVE المكدسة). كلما زادت حصة المستخدم، زاد تأثير صوته، مما يضمن أن يكون للمستثمرين الأكبر في المنصة القول الفصل في تطويرها.</li>
      <li><span className="font-medium">مفتوح للجميع:</span> يمكن لأي مستخدم تقديم مقترح مقابل رسوم، مما يجعله نظامًا لا يتطلب إذنًا لأي شخص لطلب تمويل لفكرة يمكن أن تضيف قيمة إلى Hive.</li>
    </ul>
  </div>
);

// =================================================================
// 3. Final Populated Object
// =================================================================
const pageTitlesInfo: InfoContent = {
  "pageTitle.hiveWitnesses": {
    en: <WitnessInfoEn />,
    es: <WitnessInfoEs />,
    it: <WitnessInfoIt />,
    de: <WitnessInfoDe />,
    pt: <WitnessInfoPt />,
    fr: <WitnessInfoFr />,
    pl: <WitnessInfoPl />,
    zh: <WitnessInfoZh />,
    ja: <WitnessInfoJa />,
    ro: <WitnessInfoRo />,
    ar: <WitnessInfoAr/>
  },
  "pageTitle.hiveBlocks": {
    en: <BlocksInfoEn />,
    es: <BlocksInfoEs />,
    it: <BlocksInfoIt />,
    de: <BlocksInfoDe />,
    pt: <BlocksInfoPt />,
    fr: <BlocksInfoFr />,
    pl: <BlocksInfoPl />,
    zh: <BlocksInfoZh />,
    ja: <BlocksInfoJa />,
    ro: <BlocksInfoRo />,
    ar: <BlocksInfoAr/>
  },
  "pageTitle.balanceHistory": {
    en: <BalanceHistoryInfoEn />,
    es: <BalanceHistoryInfoEs />,
    it: <BalanceHistoryInfoIt />,
    de: <BalanceHistoryInfoDe />,
    pt: <BalanceHistoryInfoPt />,
    fr: <BalanceHistoryInfoFr />,
    pl: <BalanceHistoryInfoPl />,
    zh: <BalanceHistoryInfoZh />,
    ja: <BalanceHistoryInfoJa />,
    ro: <BalanceHistoryInfoRo />,
    ar : <BalanceHistoryInfoAr/>
  },
  "pageTitle.transactionDetails": {
    en: <TransactionDetailsInfoEn />,
    es: <TransactionDetailsInfoEs />,
    it: <TransactionDetailsInfoIt />,
    de: <TransactionDetailsInfoDe />,
    pt: <TransactionDetailsInfoPt />,
    fr: <TransactionDetailsInfoFr />,
    pl: <TransactionDetailsInfoPl />,
    zh: <TransactionDetailsInfoZh />,
    ja: <TransactionDetailsInfoJa />,
    ro: <TransactionDetailsInfoRo />,
    ar: <TransactionDetailsInfoAr/>
  },
  "pageTitle.proposals": {
    en: <ProposalsInfoEn />,
    es: <ProposalsInfoEs />,
    it: <ProposalsInfoIt />,
    de: <ProposalsInfoDe />,
    pt: <ProposalsInfoPt />,
    fr: <ProposalsInfoFr />,
    pl: <ProposalsInfoPl />,
    zh: <ProposalsInfoZh />,
    ja: <ProposalsInfoJa />,
    ro: <ProposalsInfoRo />,
    ar: <ProposalsInfoAr/>
  },
  "pageTitle.topHolders": {
  en: <TopHoldersInfoEn />,
  es: <TopHoldersInfoEs />,
  it: <TopHoldersInfoIt />,
  de: <TopHoldersInfoDe />,
  pt: <TopHoldersInfoPt />,
  fr: <TopHoldersInfoFr />,
  pl: <TopHoldersInfoPl />,
  zh: <TopHoldersInfoZh />,
  ja: <TopHoldersInfoJa />,
  ro: <TopHoldersInfoRo />,
  ar: <TopHoldersInfoAr />
},
  "pageTitle.communities": {
    en: <CommunitiesPageInfoEn />,
    es: <CommunitiesPageInfoEs />,
    it: <CommunitiesPageInfoIt />,
    de: <CommunitiesPageInfoDe />,
    pt: <CommunitiesPageInfoPt />,
    fr: <CommunitiesPageInfoFr />,
    pl: <CommunitiesPageInfoPl />,
    zh: <CommunitiesPageInfoZh />,
    ja: <CommunitiesPageInfoJa />,
    ro: <CommunitiesPageInfoRo />,
    ar: <CommunitiesPageInfoAr />
  },



  
};

export default pageTitlesInfo;