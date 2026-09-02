import en from "@/i18n/en.json";

// SEO copy lives in the i18n lang files (English-only for now). This helper is
// used ONLY inside getServerSideProps, so importing en.json here never reaches
// the client bundle (Next strips getServerSideProps-only imports).
const dict = en as Record<string, string>;

export const seoText = (
  key: string,
  vars?: Record<string, string | number>
): string => {
  let s = dict[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      s = s.split(`{{${k}}}`).join(String(v));
    }
  }
  return s;
};
