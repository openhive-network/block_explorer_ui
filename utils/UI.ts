import { MutableRefObject } from "react";

export const scrollTo = (ref: MutableRefObject<any>) => {
  ref.current?.scrollIntoView();
};
