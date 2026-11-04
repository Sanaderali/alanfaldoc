import NextLink from "next/link";
import type { ComponentProps } from "react";

/**
 * Same as next/link, but it does NOT fetch the target page the moment the link scrolls into view.
 * The page being visited loads first; <IdlePrefetch /> then fetches the other pages quietly, one at a time, once the browser is idle.
 */
export default function Link({ prefetch = false, ...rest }: ComponentProps<typeof NextLink>) {
  return <NextLink prefetch={prefetch} {...rest} />;
}
