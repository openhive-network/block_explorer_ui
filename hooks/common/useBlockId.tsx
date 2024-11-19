import { useRouter } from "next/router";

const useBlockId = () => {
  const router = useRouter();
  const blockFromRouter = (router.query.blockId as string)?.replaceAll(",", "");

  const blockId = Number.isNaN(Number(blockFromRouter))
    ? blockFromRouter
    : Number(blockFromRouter);

  return { blockId };
};

export default useBlockId;
