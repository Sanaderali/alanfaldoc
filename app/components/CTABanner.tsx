/**
 * Retired: the site-wide call-to-action banner (WhatsApp / Contact us now / Call) is now rendered once for every page by
 * app/(site)/layout.tsx. Kept as an empty component so older imports keep working.
 */
export default function CTABanner(_props: { title?: string; text?: string } = {}) {
  void _props;
  return null;
}
