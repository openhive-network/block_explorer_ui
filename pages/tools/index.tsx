import type { GetServerSideProps } from "next";

// /tools lands on the first tab.
export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: { destination: "/tools/compare", permanent: false },
});

const ToolsIndex = () => null;

export default ToolsIndex;
