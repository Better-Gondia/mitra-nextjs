// WhatsappLikeWallpaper.tsx
import React from "react";

const wallpaperSVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160"
     stroke="#d6d1c3" stroke-width="1" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.6">
  <!-- Row 1 ------------------------------------------------------------ -->
  <circle cx="20"  cy="20"  r="8"/>
  <path d="M50 17 h22 a3 3 0 0 1 3 3 v6 a3 3 0 0 1 -3 3 h-22 z"/>          <!-- chat bubble -->
  <path d="M100 15 l10 10 -10 10 -10 -10 z"/>                            <!-- star -->
  <path d="M130 25 a10 12 -30 1 1 0 0.1"/>                               <!-- phone handset -->
  <!-- Row 2 ------------------------------------------------------------ -->
  <rect  x="10"  y="70" width="14" height="20" rx="3"/>                   <!-- user avatar -->
  <polygon points="60,80 70,70 80,80 70,90"/>                            <!-- paper plane -->
  <circle cx="110" cy="80" r="10" opacity="0.25"/>                       <!-- status ring -->
  <path   d="M140 70 q6 10 0 20 q-6 10 -12 0 q-6 -10 0 -20 z"/>          <!-- heart -->
  <!-- Row 3 ------------------------------------------------------------ -->
  <rect x="30" y="120" width="28" height="15" rx="2"/>                    <!-- location/map -->
  <path d="M85 125 h20 a1 1 0 0 1 1 1 v8 a1 1 0 0 1 -1 1 h-20 z"/>        <!-- mini-card -->
  <path d="M130 135 l6 6 m-6 0 l6 -6" stroke-width="2"/>                 <!-- ✕ icon -->
</svg>`.trim();

const encoded = encodeURIComponent(wallpaperSVG); // safest URI encoding

export const Background: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => (
  <div
    style={{
      minHeight: "100dvh",
      backgroundColor: "#F5EFE7", // base paper tint
      backgroundImage: `url("data:image/svg+xml,${encoded}")`,
      backgroundSize: "380px 380px", // adjust to taste
      backgroundRepeat: "repeat",
    }}
  >
    {children} {/* put your form / screens here */}
  </div>
);
