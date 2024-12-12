import React, { useState } from "react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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

const ACCORDION_SECTIONS = [
  { name: "Block Search", value: "block" },
  { name: "Account Search", value: "account" },
  { name: "Permalink Search", value: "comment-permlink" },
  { name: "Comment Search", value: "comment" },
];

const getAccordionContentByName = (name: string) => {
  switch (name) {
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

const renderAccordionItem = () => {
  return ACCORDION_SECTIONS.map(({ name, value }) => {
    return (
      <AccordionItem
        value={value}
        key={value}
      >
        <AccordionTrigger className="p-3 mb-2">{name}</AccordionTrigger>
        <AccordionContent className="px-2 flex flex-col gap-y-4">
          {getAccordionContentByName(name)}
        </AccordionContent>
      </AccordionItem>
    );
  });
};

const SearchesAccordionCard = () => {
  const [accordionValue, setAccordionValue] = useState<string>("block");

  return (
    <Card
      className="mt-4"
      data-testid="block-search-section"
    >
      <CardHeader>
        <CardTitle>Search</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion
          type="single"
          className="w-full"
          value={accordionValue}
          onValueChange={setAccordionValue}
        >
          {renderAccordionItem()}
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default SearchesAccordionCard;
