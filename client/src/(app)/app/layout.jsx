import React from "react";
import Header from "../../components/Header"
import Footer from "../../components/Footer"

export default function Layout({ children }) {
  return (
    <html lang="en">
        <Header />
            <body>{children}</body>
        <Footer />
    </html>
  );
}   