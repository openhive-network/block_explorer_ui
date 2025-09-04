import Link from "next/link";

import { config } from "@/Config";
import CustomPagination from "@/components//CustomPagination";
import JumpToPage from "@/components//JumpToPage";
import OperationsTable from "@/components//OperationsTable";
import { convertCommentsOperationResultToTableOperations } from "@/lib/utils";
import useOperationsFormatter from "@/hooks/common/useOperationsFormatter";
import { useSearchesContext } from "@/contexts/SearchesContext";
import { Button } from "@/components/ui/button";
import { getCommentPageLink } from "@/components/home/searches/utils/commentSearchHelpers";
import { trimAccountName } from "@/utils/StringUtils";
import Hive from "@/types/Hive";
import useURLParams from "@/hooks/common/useURLParams";
import { DEFAULT_PARAMS } from "./AccountPageInteractionSearch";
import { useI18n } from "@/i18n/i18n";

interface InteractionsTabResultProps {
  data: Hive.CommentOperationResponse | null | undefined;
}

const InteractionsTabResult: React.FC<InteractionsTabResultProps> = ({
  data,
}) => {
  const { t } = useI18n();
  const { commentPaginationPage, setCommentPaginationPage, searchRanges } =
    useSearchesContext();
  const { paramsState, setParams } = useURLParams(DEFAULT_PARAMS, [
    "accountName",
  ]);

  const accountName = trimAccountName(paramsState.accountName ?? "");

  const commentPageLink = getCommentPageLink({
    ...searchRanges,
    ...paramsState,
    accountName,
  });

  const formattedCommentOperations = useOperationsFormatter(data);

  if (!data) return;

  const formattedOperations = convertCommentsOperationResultToTableOperations(
    formattedCommentOperations?.operations_result
  );

  const unformattedOperations = convertCommentsOperationResultToTableOperations(
    data?.operations_result
  );

  const changeCommentSearchPagination = (newPageNum: number) => {
    const newSearchProps = {
      ...paramsState,
      accountName,
      pageNumber: newPageNum,
    };
    setCommentPaginationPage(newPageNum);
    setParams(newSearchProps);
  };

  return (
    <>
      <div>
        <div className="flex flex-wrap justify-between items-center bg-theme p-2 sticky z-20 top-[3.2rem] md:top-[4rem] rounded-t">
          <div className="flex justify-end w-full md:justify-end items-end">
            <Link href={commentPageLink}>
              <Button data-testid="go-to-result-page">
                {t("common.goToResultPage")}
              </Button>
            </Link>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-2 flex-1 justify-center w-full">
            <CustomPagination
              currentPage={paramsState.pageNumber ?? commentPaginationPage}
              totalCount={data.total_operations}
              pageSize={config.standardPaginationSize}
              onPageChange={changeCommentSearchPagination}
            />
            <JumpToPage
              currentPage={paramsState.pageNumber ?? commentPaginationPage}
              onPageChange={changeCommentSearchPagination}
              totalCount={data.total_operations}
              pageSize={config.standardPaginationSize}
            />
          </div>
        </div>
        <OperationsTable
          operationCount={data.total_operations}
          operations={formattedOperations}
          unformattedOperations={unformattedOperations}
          referrer={t("accountOperationViewTabs.interactions").toLowerCase()}
          accountName={accountName}
        />
      </div>
    </>
  );
};

export default InteractionsTabResult;
