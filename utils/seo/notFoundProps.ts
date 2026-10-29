import type { ServerResponse } from "http";
import { notFoundMeta } from "./index";
import { seoText } from "./seoStrings";

// notFound: true answers 500 in this repo, so a missing page renders its own 404.
export const notFoundProps = (res: ServerResponse) => {
  res.statusCode = 404;
  return { props: { meta: notFoundMeta(seoText("seo.notFound.title")) } };
};
