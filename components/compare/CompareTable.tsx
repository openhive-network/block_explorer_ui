import React from "react";
import { CompareSection } from "@/utils/compare/types";
import { CompareAccountData } from "@/utils/compare/rowModel";
import CompareSectionView from "./CompareSection";
import CompareWealthComposition from "./CompareWealthComposition";
import CompareRadar from "./CompareRadar";
import CompareFootprintDonuts from "./CompareFootprintDonuts";
import ComparePowerFlow from "./ComparePowerFlow";

interface CompareTableProps {
  sections: CompareSection[];
  a: CompareAccountData;
  b: CompareAccountData;
  locale: string;
  t: (k: string) => string;
  rangeLabel?: string;
}

const CompareTable: React.FC<CompareTableProps> = ({
  sections,
  a,
  b,
  locale,
  t,
  rangeLabel,
}) => (
  <div>
    <CompareRadar a={a.account} b={b.account} sections={sections} t={t} />
    {sections.map((section) => (
      <React.Fragment key={section.id}>
        <CompareSectionView
          section={section}
          aAccount={a.account}
          bAccount={b.account}
          locale={locale}
          t={t}
          rangeLabel={rangeLabel}
        />
        {section.id === "wealth" && (
          <CompareWealthComposition a={a} b={b} locale={locale} t={t} />
        )}
        {section.id === "activity" && (
          <CompareFootprintDonuts a={a} b={b} t={t} />
        )}
        {section.id === "resources" && (
          <ComparePowerFlow a={a} b={b} locale={locale} t={t} />
        )}
      </React.Fragment>
    ))}
  </div>
);

export default CompareTable;
