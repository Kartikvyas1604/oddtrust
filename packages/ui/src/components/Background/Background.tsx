import React from "react";

export function Background() {
  return (
    <>
      {/* gradient layer */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, #121815 0%, #0A0D0B 70%)",
        }}
      />

      {/* grid scanline overlay */}
      <div
        className="fixed inset-0 z-[1] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(37, 48, 41, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(37, 48, 41, 0.15) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* animated sweep */}
      <div
        className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="absolute inset-y-0 w-[40%] animate-sweep-glow opacity-[0.04]"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, #1E7A3E 50%, transparent 100%)",
          }}
        />
      </div>
    </>
  );
}
