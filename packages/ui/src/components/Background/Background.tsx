export function Background() {
  return (
    <>
      {/* Base gradient */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, #121815 0%, #0A0D0B 70%)",
        }}
      />
      {/* Subtle green atmosphere glow */}
      <div
        className="fixed inset-0 z-[1] pointer-events-none opacity-[0.03]"
        style={{
          background:
            "radial-gradient(circle 600px at 50% -100px, #39FF6A, transparent)",
        }}
      />
      {/* Grid overlay */}
      <div
        className="fixed inset-0 z-[2] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(37,48,41,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(37,48,41,0.1) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
    </>
  );
}
