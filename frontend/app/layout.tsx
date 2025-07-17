import { ptBR } from "@clerk/localizations";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { GoogleAnalytics } from "@next/third-parties/google";
import type { Metadata } from "next";
import { Toaster } from "@/app/_components/ui/sonner";
import "@/app/globals.css";

const siteUrl = "https://www.openmatch.io";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "OpenMatch: Encontre sua Primeira Contribuição Open Source",
    template: `%s | OpenMatch`,
  },
  description:
    "O OpenMatch conecta desenvolvedores iniciantes a issues e projetos de software livre no GitHub. Encontre a oportunidade perfeita e faça sua primeira contribuição para o mundo open source hoje mesmo!",
  keywords: [
    "open source",
    "código aberto",
    "primeira contribuição",
    "desenvolvedor iniciante",
    "GitHub",
    "issues para iniciantes",
    "projetos open source",
    "contribuir com software livre",
    "good first issue",
    "beginner friendly",
    "contribute to open source",
  ],
  authors: [{ name: "André Timm", url: "https://github.com/andretimm" }],
  creator: "André Timm",
  publisher: "André Timm",
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
  openGraph: {
    title: "OpenMatch: Sua Porta de Entrada para o Open Source",
    description:
      "Encontre projetos e issues no GitHub selecionados para iniciantes e faça sua primeira contribuição de forma guiada e amigável.",
    url: siteUrl,
    siteName: "OpenMatch",
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "OpenMatch - Conectando Desenvolvedores a Projetos Open Source",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OpenMatch: Encontre sua Primeira Contribuição Open Source",
    description:
      'A ponte entre desenvolvedores iniciantes e o universo do código aberto. Encontre sua "good first issue" aqui!',
    creator: "timm_dev",
    images: [`${siteUrl}/og-image.png`],
  },
  alternates: {
    canonical: "/",
    languages: {
      "pt-BR": "/pt-BR",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
      }}
      localization={ptBR}
    >
      <html lang="pt-BR">
        <head>
          <meta name="apple-mobile-web-app-title" content="Open Match" />
        </head>
        <body>
          <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent"></div>
            <div className="absolute top-1/4 left-1/4 w-48 h-48 md:w-96 md:h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-48 h-48 md:w-96 md:h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
            {children}
          </div>
          <Toaster />
        </body>
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID!} />
      </html>
    </ClerkProvider>
  );
}
