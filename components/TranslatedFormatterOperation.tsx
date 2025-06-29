// components/TranslatedText.tsx

import { useI18n } from "@/i18n/i18n";

interface TranslatedFormatterOperationProps {
  i18nKey: string;
}

const TranslatedFormatterOperation: React.FC<TranslatedFormatterOperationProps> = ({ i18nKey }) => {
  const { t } = useI18n();
  return t(i18nKey);
};

export default TranslatedFormatterOperation;