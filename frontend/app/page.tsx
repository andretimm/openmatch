"use client";

import { Button } from "@/app/_components/ui/button";
import { Card, CardContent } from "@/app/_components/ui/card";
import { ArrowLeft, GitBranch, Heart, Sparkles, Target } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { languages } from "./_constants/languages";
import { redirect } from "next/navigation";
import ClerkAuthArea from "./_components/login-area";

export default function Home() {
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);

  const handleLanguageToggle = (languageKey: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(languageKey)
        ? prev.filter((lang) => lang !== languageKey)
        : [...prev, languageKey]
    );
  };

  const handleShowIssues = () => {
    if (selectedLanguages.length > 0) {
      const tags = selectedLanguages.map((lang) => `tag=${lang}`).join("&");
      redirect(`/issues?${tags}`);
    }
  };

  return (
    <div className="relative container mx-auto px-6 py-12">
      <div className="absolute top-6 right-6 z-50">
        <ClerkAuthArea />
      </div>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-6 px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full border border-white/10">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            <span className="text-sm font-medium text-gray-300">
              Descubra projetos incríveis
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent leading-tight">
            Open Source
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Match
            </span>
          </h1>

          <p className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
            Descubra projeto incríveis do GitHub de forma divertida. Selecione
            suas tecnologias favoritas e encontre projetos perfeitos para
            contribuir.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {[
            {
              icon: Target,
              title: "Selecione",
              description: "Escolha uma ou mais tecnologias que você praticar",
              gradient: "from-blue-500 to-cyan-500",
            },
            {
              icon: GitBranch,
              title: "Explore",
              description:
                "Navegue por issues reais de projetos open source e encontre oportunidades para contribuir",
              gradient: "from-purple-500 to-pink-500",
            },
            {
              icon: Heart,
              title: "Contribua",
              description:
                "Salve issues que achar interessante e comece a contribuir",
              gradient: "from-green-500 to-emerald-500",
            },
          ].map((item, index) => (
            <Card
              key={index}
              className="bg-white/5 backdrop-blur-sm border-white/10"
            >
              <CardContent className="p-8 text-center">
                <div
                  className={`w-16 h-16 bg-gradient-to-r ${item.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">
                  {item.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-white">
            Escolha suas tecnologias
          </h2>
          <p className="text-gray-400 mb-10">
            Selecione uma ou mais linguagens que você gostaria de explorar
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-12">
            {languages.map((lang) => {
              const isSelected = selectedLanguages.includes(lang.key);
              return (
                <div
                  key={lang.key}
                  onClick={() => handleLanguageToggle(lang.key)}
                  className={`
                        relative p-6 rounded-2xl cursor-pointer transition-all duration-150 group
                        ${
                          isSelected
                            ? "bg-gradient-to-r " +
                              lang.color +
                              " shadow-2xl scale-105"
                            : "bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:scale-105"
                        }
                      `}
                >
                  <div className="text-center">
                    <div className="text-3xl mb-3">
                      <Image
                        src={lang.icon}
                        alt={lang.name}
                        width={32}
                        height={32}
                        className="inline-block"
                      />
                    </div>
                    <h3
                      className={`font-semibold ${
                        isSelected ? "text-white" : "text-gray-300"
                      }`}
                    >
                      {lang.name}
                    </h3>
                  </div>
                </div>
              );
            })}
          </div>

          <Button
            onClick={handleShowIssues}
            disabled={selectedLanguages.length === 0}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-12 py-4 text-lg font-semibold rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl hover:shadow-blue-500/25 transition-all duration-300"
          >
            Começar Exploração
            <ArrowLeft className="w-6 h-6 ml-3 rotate-180" />
          </Button>
        </div>
      </div>
    </div>
  );
}
