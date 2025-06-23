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
    color: "from-blue-800 to-yellow-700",
    icon: "icons/python.svg",
  },
  {
    name: "JavaScript",
    key: "javascript",
    color: "from-yellow-700 to-yellow-800",
    icon: "icons/javascript.svg",
  },
  {
    name: "TypeScript",
    key: "typescript",
    color: "from-blue-900 to-blue-700",
    icon: "icons/typescript.svg",
  },
  {
    name: "HTML",
    key: "html",
    color: "from-red-800 to-red-700",
    icon: "icons/html.svg",
  },
  {
    name: "Java",
    key: "java",
    color: "from-orange-900 to-red-800",
    icon: "icons/java.svg",
  },
  {
    name: "PHP",
    key: "php",
    color: "from-purple-900 to-purple-700",
    icon: "icons/php.svg",
  },
  {
    name: "Ruby",
    key: "ruby",
    color: "from-rose-900 to-rose-700",
    icon: "icons/ruby.svg",
  },
  {
    name: "C#",
    key: "c#",
    color: "from-purple-800 to-purple-900",
    icon: "icons/csharp.svg",
  },
  {
    name: "Go",
    key: "go",
    color: "from-cyan-900 to-cyan-700",
    icon: "icons/go.svg",
  },
  {
    name: "Rust",
    key: "rust",
    color: "from-orange-900 to-orange-800",
    icon: "icons/rust.svg",
  },
  {
    name: "Dart",
    key: "dart",
    color: "from-green-900 to-green-700",
    icon: "icons/dart.svg",
  },
  {
    name: "Kotlin",
    key: "kotlin",
    color: "from-violet-900 to-purple-800",
    icon: "icons/kotlin.svg",
  },
  {
    name: "Swift",
    key: "swift",
    color: "from-orange-800 to-red-800",
    icon: "icons/swift.svg",
  },
];