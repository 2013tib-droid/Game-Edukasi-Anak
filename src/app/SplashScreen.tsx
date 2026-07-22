// Shown while lazy chunks load. Keep it dependency-free and instant.
export default function SplashScreen() {
  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
      }}
    >
      <img
        src={`${import.meta.env.BASE_URL}assets/logo.svg`}
        alt=""
        width={88}
        height={88}
      />
      <p style={{ fontSize: 22, fontWeight: 700 }}>Memuat…</p>
    </div>
  );
}
