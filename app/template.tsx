/** Plain wrapper. (It used to fade every page in; that delayed the first paint and the largest content, which hurts Core Web Vitals.) */
export default function Template({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
