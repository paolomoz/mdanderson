/* subscription — publications SFMC newsletter form. Unlike the govfa-hosted
   subscribe-to-* embeds (fa-embed-loader), the live page renders this form
   inline and drives it with the site's SFMC AJAX handler — analytics-coupled
   machinery the replica deliberately does not replay (same policy as the
   loader's open-telemetry omission). The form submits natively to the
   verbatim govfa.net workflow-processor action — live's no-JS path. */

export default function decorate() {}
