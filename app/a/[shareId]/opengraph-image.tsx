import { ImageResponse } from "next/og";
import { loadSharedAnalysisByShareId } from "@/lib/persistence";
import { siteName } from "@/lib/social";
import { truncateCopy } from "@/lib/utils";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

type SharedImageProps = {
  params: Promise<{
    shareId: string;
  }>;
};

export default async function SharedOpenGraphImage({ params }: SharedImageProps) {
  const { shareId } = await params;
  const record = await loadSharedAnalysisByShareId(shareId);
  const title = record?.analysis.company.displayName ?? "Saved post-mortem draft";
  const summary = truncateCopy(
    record?.analysis.overview ??
      "Structured for reporting review, not direct publication.",
    170,
  );
  const modeLabel =
    record?.analysis.sourceMode === "demo" ? "Demo Mode sample" : "Saved permalink";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          height: "100%",
          width: "100%",
          background: "#f4efe6",
          color: "#18231f",
          padding: "44px",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            display: "flex",
            width: "100%",
            border: "1px solid #d6c7af",
            background: "#fffdf9",
            boxShadow: "inset 0 0 0 12px #f7f1e8",
            padding: "34px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              width: "100%",
              border: "1px solid #e3d7c6",
              padding: "34px 38px",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  fontFamily: "system-ui, sans-serif",
                  fontSize: 22,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "#58625b",
                }}
              >
                <div
                  style={{
                    width: "44px",
                    height: "1px",
                    background: "#58625b",
                  }}
                />
                {modeLabel}
              </div>
              <div style={{ fontSize: 78, lineHeight: 1.02, maxWidth: 860 }}>{title}</div>
              <div
                style={{
                  fontFamily: "system-ui, sans-serif",
                  fontSize: 30,
                  lineHeight: 1.45,
                  color: "#47524b",
                  maxWidth: 920,
                }}
              >
                {summary}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingTop: "24px",
                borderTop: "1px solid #e3d7c6",
                fontFamily: "system-ui, sans-serif",
                fontSize: 24,
                color: "#58625b",
              }}
            >
              <div>{siteName}</div>
              <div>Structured for editorial review</div>
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
