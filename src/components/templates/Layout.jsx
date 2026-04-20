import React from "react";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[var(--med-bg)] via-blue-50 to-blue-100 font-sans">
      {children}
    </div>
  );
}
