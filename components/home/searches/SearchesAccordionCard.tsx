import { Card, CardContent } from "@/components/ui/card";
import CardHeaderWithLink from "@/components/ui/CardHeaderWithLink";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import BlockSearch from "./BlockSearch";
import AccountSearch from "./AccountSearch";
import CommentsPermlinkSearch from "./CommentPermlinkSearch";
import CommentsSearch from "./CommentsSearch";
import { useSearchesContext } from "@/contexts/SearchesContext";
import { useI18n } from "@/i18n/i18n";

const ACCORDION_SECTIONS_KEYS = [
  {
    nameKey: "searchesAccordionCard.blockSearch",
    value: "block",
    originalName: "Block Search",
  },
  {
    nameKey: "searchesAccordionCard.accountSearch",
    value: "account",
    originalName: "Account Search",
  },
  {
    nameKey: "searchesAccordionCard.permalinkSearch",
    value: "comment-permlink",
    originalName: "Permalink Search",
  },
  {
    nameKey: "searchesAccordionCard.commentSearch",
    value: "comment",
    originalName: "Comment Search",
  },
];

const getAccordionContentByName = (originalName: string) => {
  switch (originalName) {
    case "Block Search":
      return <BlockSearch />;
      break;
    case "Account Search":
      return <AccountSearch />;
      break;
    case "Permalink Search":
      return <CommentsPermlinkSearch />;
      break;
    case "Comment Search":
      return <CommentsSearch />;
  }
};

const SearchesAccordionCard = () => {
  const { activeSearchSection, setActiveSearchSection } = useSearchesContext();
  const { t } = useI18n();

  const renderAccordionItem = () => {
    return ACCORDION_SECTIONS_KEYS.map(({ nameKey, value, originalName }) => {
      return (
        <AccordionItem value={value} key={value}>
          <AccordionTrigger className="px-3 py-2 mb-1">
            {t(nameKey)}
          </AccordionTrigger>
          <AccordionContent className="px-2 flex flex-col gap-y-3">
            {getAccordionContentByName(originalName)}
          </AccordionContent>
        </AccordionItem>
      );
    });
  };

  return (
    <Card data-testid="block-search-section">
      <CardHeaderWithLink title={t("searchesAccordionCard.searchTitle")} />
      <CardContent className="px-2 pt-2 pb-2">
        <Accordion
          type="single"
          className="w-full"
          value={activeSearchSection}
          onValueChange={setActiveSearchSection}
        >
          {renderAccordionItem()}
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default SearchesAccordionCard;
