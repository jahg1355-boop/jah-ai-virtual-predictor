
export const metadata = {
  title: "JAH AI VIRTUAL PREDICTOR",
  description: "AI-assisted SportyBet virtual football screenshot analysis."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{
        margin: 0,
        background: "#080d0a",
        color: "#f4f8f4",
        fontFamily: "Arial, sans-serif"
      }}>
        {children}
      </body>
    </html>
  );
}
