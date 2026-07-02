'use client';

export function Background() {
  return (
    <>
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 0%, var(--color-bg-panel) 0%, var(--color-bg-void) 70%)',
        }}
      />
      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(color-mix(in srgb, var(--color-pitch-green) 15%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--color-pitch-green) 15%, transparent) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.015]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, color-mix(in srgb, var(--color-pitch-green) 6%, transparent) 2px, color-mix(in srgb, var(--color-pitch-green) 6%, transparent) 4px)',
          backgroundSize: '100% 4px',
        }}
      />
      <div
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
        aria-hidden
      >
        <div
          className="absolute inset-0 animate-sweep-glow"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, color-mix(in srgb, var(--color-pitch-green-dim) 12%, transparent) 50%, transparent 100%)',
            width: '200%',
            marginLeft: '-50%',
          }}
        />
      </div>
    </>
  );
}
