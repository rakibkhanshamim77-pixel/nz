import type { Metadata } from "next";
import { Bricolage_Grotesque, Noto_Sans_Bengali } from "next/font/google";
import CartProvider from "@/lib/CartProvider";
import ToastProvider from "@/lib/ToastProvider";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["500", "700", "800"],
  variable: "--font-bricolage",
  display: "swap",
});

const notoBengali = Noto_Sans_Bengali({
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-bengali",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Neeshanz - Next Level Tees",
  description:
    "Discover premium T-shirts that blend modern style, comfort & confidence. Upgrade your everyday look with Neeshanz.",
  keywords: [
    "Online Shopping Bangladesh",
    "Fashion Store Bangladesh",
    "Online Clothing Shop Bangladesh",
    "Best Online Fashion Store in Bangladesh",
    "Men's Clothing Bangladesh",
    "Women's Clothing Bangladesh",
    "Trendy Clothes in Bangladesh",
    "Affordable Clothing Bangladesh",
    "Online Dress Shopping Bangladesh",
  ],
  authors: [{ name: "Md Shamim Mia" }],
  creator: "Md Shamim Mia",
  publisher: "Neeshanz",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || ""),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "bn_BD",
    url: "/",
    siteName: "Neeshanz",
    title: "Neeshanz - Next Level Tees",
    description:
      "Shop Neeshanz for trendy fashion, stylish clothing, and everyday comfort. Discover quality outfits that combine modern style, affordability, and comfort. Free delivery available.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Neeshanz - Next Level Tees",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Neeshanz - Next Level Tees",
    description: "Premium quality t-shirts with modern designs.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add your verification codes here
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://neeshanz.com",
      name: "Neeshanz",
      alternateName: ["Neeshanz Fashion", "neeshanz.com", "neeshanz"],
      url: "https://neeshanz.com",
      description:
        "Discover premium T-shirts that blend modern style, comfort & confidence. Upgrade your everyday look with Neeshanz.",
      publisher: {
        "@id": "https://neeshanz.com",
      },
      inLanguage: ["en-BD", "bn-BD"],
    },
    {
      "@type": "OnlineStore",
      "@id": "https://neeshanz.com",
      name: "Neeshanz",
      alternateName: "Neeshanz Fashion",
      url: "https://neeshanz.com",
      description:
        "Discover premium T-shirts that blend modern style, comfort & confidence. Upgrade your everyday look with Neeshanz.",
      logo: {
        "@type": "ImageObject",
        url: "https://neeshanz.com/logo.png",
        width: 512,
        height: 512,
      },
      image: "https://neeshanz.com/logo.png",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme');if(t==='dark')document.documentElement.dataset.theme='dark';else if(t==='light')delete document.documentElement.dataset.theme;}catch(e){}`,
          }}
        />
        {/* Neeshanz Website SEO Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteJsonLd).replace(/</g, "\\u003c"),
          }}
        />
      </head>
      <body
        className={`${bricolage.variable} ${notoBengali.variable} antialiased bg-bg text-ink`}
      >
        <CartProvider>
          <ToastProvider>{children}</ToastProvider>
        </CartProvider>
      </body>
    </html>
  );
}
