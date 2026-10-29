// Server component to force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
