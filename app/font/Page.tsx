"use client"
import { useState } from "react";

export default function FontUploader() {
  const [fontName, setFontName] = useState<string | null>(null);

  const handleFontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const file = e.target.files[0];
    if (!file) return;

    const fontUrl = URL.createObjectURL(file);
    const name = "UploadedFont";

    const style = document.createElement("style");
    style.innerHTML = `
      @font-face {
        font-family: '${name}';
        src: url(${fontUrl});
      }
    `;
    document.head.appendChild(style);

    setFontName(name);
  }

  return (
    <div style={{ padding: 20, fontFamily: fontName || "sans-serif" }}>
      <input
        type="file"
        accept=".ttf,.otf,.woff,.woff2"
        onChange={handleFontUpload}
      />

      <p style={{ marginTop: 20, fontSize: 24 }}>
        The quick brown fox jumps over the lazy dog
      </p>

      <p>
        Lorem ipsum dolor sit amet, fonts are fun.
      </p>
    </div>
  );
}
