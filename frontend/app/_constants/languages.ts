export interface Language {
  name: string;
  key: string;
  color: string;
  icon: string;
}

export const languages: Language[] = [
  {
    name: "Python",
    key: "python",
    color: "from-blue-400 to-yellow-500",
    icon: "icons/python.svg",
  },
  {
    name: "JavaScript",
    key: "javascript",
    color: "from-yellow-400 to-yellow-500",
    icon: "icons/javascript.svg",
  },
  {
    name: "TypeScript",
    key: "typescript",
    color: "from-blue-500 to-blue-700",
    icon: "icons/typescript.svg",
  },
  {
    name: "HTML",
    key: "html",
    color: "from-red-400 to-red-600",
    icon: "icons/html.svg",
  },
  {
    name: "Java",
    key: "java",
    color: "from-orange-500 to-red-600",
    icon: "icons/java.svg",
  },
  {
    name: "PHP",
    key: "php",
    color: "from-pink-400 to-pink-600",
    icon: "icons/php.svg",
  },
  {
    name: "Ruby",
    key: "ruby",
    color: "from-rose-400 to-rose-600",
    icon: "icons/ruby.svg",
  },
  {
    name: "C#",
    key: "csharp",
    color: "from-purple-500 to-purple-700",
    icon: "icons/csharp.svg",
  },
  {
    name: "Go",
    key: "go",
    color: "from-cyan-400 to-cyan-600",
    icon: "icons/go.svg",
  },
  {
    name: "Rust",
    key: "rust",
    color: "from-orange-600 to-orange-800",
    icon: "icons/rust.svg",
  },
  {
    name: "Dart",
    key: "dart",
    color: "from-green-400 to-green-600",
    icon: "icons/dart.svg",
  },
  {
    name: "Kotlin",
    key: "kotlin",
    color: "from-violet-500 to-purple-600",
    icon: "icons/kotlin.svg",
  },
  {
    name: "Swift",
    key: "swift",
    color: "from-orange-400 to-red-500",
    icon: "icons/swift.svg",
  },
];
