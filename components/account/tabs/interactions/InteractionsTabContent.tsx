import { Dispatch, SetStateAction, useEffect } from "react";
import { useRouter } from "next/router";
import { Loader2 } from "lucide-react";

import useCommentSearch from "@/hooks/api/common/useCommentSearch";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import AccountPageInteractionSearch from "./AccountPageInteractionSearch";
import NoResult from "@/components/NoResult";
import useURLParams from "@/hooks/common/useURLParams";
import InteractionsTabResult from "./InteractionsTabResult";
import { cn, convertBooleanArrayToIds } from "@/lib/utils";
import { DEFAULT_PARAMS } from "./AccountPageInteractionSearch";
import { getLocalStorage } from "@/utils/LocalStorage";
import { useI18n } from "@/i18n/i18n";
import FilterChipsBar, { FilterChip } from "@/components/ui/FilterChipsBar";
import useOperationsTypes from "@/hooks/api/common/useOperationsTypes";
import { getOperationButtonTitle } from "@/utils/UI";
import { useSearchesContext } from "@/contexts/SearchesContext";

interface InteractionsTabContentProps {
  isVisible: boolean;
  setIsVisible: Dispatch<SetStateAction<boolean>>;
  setIsFiltersActive: Dispatch<SetStateAction<boolean>>;
  isFiltersActive: boolean;
}

const InteractionsTabContent: React.FC<InteractionsTabContentProps> = ({
  isVisible,
  setIsVisible,
  setIsFiltersActive,
  isFiltersActive,
}) => {
  const { t } = useI18n();
  const router = useRouter();

  const accountNameFromRoute = (router.query.accountName as string)?.replace(
    "@",
    ""
  );

  const { paramsState, setParams } = useURLParams(DEFAULT_PARAMS, [
    "accountName",
  ]);
  const { operationsTypes } = useOperationsTypes();
  const { setCommentPaginationPage, setSelectedCommentSearchOperationTypes } =
    useSearchesContext();

  // A link like ?filters=1 decodes to no types; sending an empty list makes
  // the API return nothing, so "no types" means no type filter at all.
  const selectedTypeIds = convertBooleanArrayToIds(paramsState.filters ?? []);

  const props = {
    ...paramsState,
    operationTypes: selectedTypeIds.length ? selectedTypeIds : null,
    accountName: accountNameFromRoute,
  } as any;

  const {
    commentSearchData,
    isCommentSearchDataLoading,
    isCommentSearchDataFetching,
    refetchCommentSearchData,
  } = useCommentSearch(props);

  const buildCommentSearchView = () => {
    if (!commentSearchData) return;
    if (!isCommentSearchDataFetching && !commentSearchData?.total_operations) {
      return (
        <div>
          <NoResult />
        </div>
      );
    } else if (isCommentSearchDataLoading || isCommentSearchDataFetching) {
      return (
        <div className="flex justify-center text-center items-center">
          <Loader2 className="animate-spin mt-1 text-text h-12 w-12 ms-3 ..." />
        </div>
      );
    } else {
      return <InteractionsTabResult data={commentSearchData} />;
    }
  };

  // Don't show filters section if only account name is present
  useEffect(() => {
    Object.keys(DEFAULT_PARAMS).forEach((key) => {
      if (key === "accountName") return;

      const param = paramsState[key as keyof typeof DEFAULT_PARAMS];
      const defaultParam = DEFAULT_PARAMS[key as keyof typeof DEFAULT_PARAMS];

      const visibleFilters =
        (isFiltersActive &&
          getLocalStorage("is_interactions_filters_visible", true)) ??
        true;

      if (param !== defaultParam) {
        setIsFiltersActive(true);
        setIsVisible(visibleFilters);
      }
    });
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsState, isFiltersActive]);

  const typesTitle = getOperationButtonTitle(
    selectedTypeIds,
    operationsTypes,
    t
  );
  const hasTypeFilter = (selectedTypeIds?.length ?? 0) > 0;
  const permlink: string | undefined = paramsState.permlink;

  const chips: FilterChip[] = [
    ...(permlink
      ? [
          {
            key: "permlink",
            label: t("activeFilters.permlink", { value: permlink }),
            onRemove: () =>
              setParams({
                ...paramsState,
                permlink: undefined,
                pageNumber: 1,
              } as any),
          },
        ]
      : []),
    {
      key: "types",
      label:
        (selectedTypeIds?.length ?? 0) > 1
          ? typesTitle
          : t("activeFilters.labelValue", {
              label: t("operationTypesDialog.operationTypes"),
              value: hasTypeFilter ? typesTitle : t("operationTypesDialog.all"),
            }),
      onRemove: hasTypeFilter
        ? () => {
            setSelectedCommentSearchOperationTypes(null);
            setCommentPaginationPage(1);
            setParams({ ...paramsState, filters: null, pageNumber: 1 } as any);
          }
        : undefined,
    },
  ];

  return (
    <TabsContent value="interactions">
      <FilterChipsBar
        sticky
        chips={chips}
        onExpand={() => setIsVisible(true)}
        isLoading={isCommentSearchDataFetching}
      />
      <Card
        className={cn(
          "mb-4 overflow-hidden transition-all duration-500 ease-in max-h-0 opacity-0",
          {
            "max-h-full opacity-100": isVisible,
          }
        )}
      >
        <CardHeader>
          <CardTitle className="text-start">{t("common.filters")}</CardTitle>
        </CardHeader>
        <CardContent>
          <AccountPageInteractionSearch
            setIsFiltersActive={setIsFiltersActive}
            refetchCommentSearchData={refetchCommentSearchData}
            isCommentSearchDataLoading={isCommentSearchDataFetching}
          />
        </CardContent>
      </Card>
      {buildCommentSearchView()}
    </TabsContent>
  );
};

export default InteractionsTabContent;
