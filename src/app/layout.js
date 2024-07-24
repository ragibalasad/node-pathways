import "../app/globals.css";

export const metadata = {
  title: "Node Pathways",
  description: "",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
