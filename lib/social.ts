import type { Metadata } from "next";
import type { StoredAnalysisRecord } from "@/domain/postmortem";
import { buildShareUrl } from "@/lib/share/strategy";
import { buildPublicUrl, resolvePublicOrigin, truncateCopy } from "@/lib/utils";

export const siteName = "Startup Post-Mortem Analyzer";
export const siteDescription =
  "A newsroom-style tool for generating structured first-draft startup post-mortems.";

export function buildDefaultMetadata(appUrl?: string): Metadata {
  const origin = resolvePublicOrigin(appUrl);
  const image = appUrl ? buildPublicUrl("/opengraph-image", appUrl) : "/opengraph-image";

  return {
    metadataBase: new URL(origin),
    title: {
      default: siteName,
      template: `%s | ${siteName}`,
    },
    description: siteDescription,
    openGraph: {
      title: siteName,
      description: siteDescription,
      type: "website",
      siteName,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: siteName,
      description: siteDescription,
      images: [image],
    },
    alternates: appUrl
      ? {
          canonical: resolvePublicOrigin(appUrl),
        }
      : undefined,
  };
}

export function buildSharedDraftDescription(record: StoredAnalysisRecord) {
  const overview = truncateCopy(record.analysis.overview, 170);
  const suffix =
    record.analysis.sourceMode === "demo"
      ? " Sample output from Demo Mode."
      : " First-draft analysis generated for editorial review.";

  return truncateCopy(
    `${overview} Structured for reporting review, not direct publication.${suffix}`,
    220,
  );
}

export function buildSharedDraftMetadata(
  record: StoredAnalysisRecord,
  appUrl?: string,
): Metadata {
  const origin = appUrl ? resolvePublicOrigin(appUrl) : undefined;
  const shareUrl = origin ? buildShareUrl(origin, record.shareId) : undefined;
  const image = appUrl
    ? buildPublicUrl(`/a/${record.shareId}/opengraph-image`, appUrl)
    : `/a/${record.shareId}/opengraph-image`;
  const description = buildSharedDraftDescription(record);
  const title = `${record.analysis.company.displayName} | ${siteName}`;

  return {
    title: record.analysis.company.displayName,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      siteName,
      url: shareUrl,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
    alternates: shareUrl
      ? {
          canonical: shareUrl,
        }
      : undefined,
  };
}
