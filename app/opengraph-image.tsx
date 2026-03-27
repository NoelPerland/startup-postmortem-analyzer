import { ImageResponse } from "next/og";
import { siteName } from "@/lib/social";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
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
                Editorial research draft
              </div>
              <div style={{ fontSize: 80, lineHeight: 1.02, maxWidth: 860 }}>
                Startup Post-Mortem Analyzer
              </div>
              <div
                style={{
                  fontFamily: "system-ui, sans-serif",
                  fontSize: 30,
                  lineHeight: 1.45,
                  color: "#47524b",
                  maxWidth: 860,
                }}
              >
                Structured for reporting review, not direct publication.
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
              <div>Timeline - Failure factors - Open questions</div>
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
