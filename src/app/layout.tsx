import { Toaster } from "react-hot-toast";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster
          position="top-right"
          reverseOrder={false}
          toastOptions={{
            duration: 1500,
            style: {
              fontFamily: "inherit",
              fontSize: "0.95rem",
              borderRadius: "12px",
              padding: ".8rem",
              fontWeight: 500,
              color: "#fff",
              boxShadow: "0 4px 10px #0000002d",
            },
            success: {
              style: {
                background: "#16a34a",
              },
              iconTheme: {
                primary: "#fff",
                secondary: "#16a34a",
              },
            },
            error: {
              style: {
                background: "#dc2626",
              },
              iconTheme: {
                primary: "#fff",
                secondary: "#dc2626",
              },
            },
            loading: {
              style: {
                background: "#2563eb",
              },
              iconTheme: {
                primary: "#fff",
                secondary: "#2563eb",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
