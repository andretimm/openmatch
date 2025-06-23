import Image from "next/image";
import Link from "next/link";

export default function ContribuaPage() {
  return (
    <div className="relative ">
      {/* Header otimizado */}
      <div className="w-full border-b border-slate-700/50">
        <div className="max-w-6xl mx-auto ">
          <Link href="/">
            <Image
              src="/openmatch.png"
              alt="OpenMatch"
              width={68}
              height={68}
              priority
            />
          </Link>
        </div>
      </div>
      <div className="max-w-3xl mx-auto  py-10">
        <h1 className="text-3xl font-bold text-white mb-6 flex items-center gap-2">
          🚀 Como contribuir em projetos open source no GitHub
        </h1>
        <ol className="list-decimal list-inside space-y-4 text-base text-gray-300 bg-slate-800/50 rounded-lg p-8 border border-slate-700/50 shadow-lg">
          <li>
            <span className="font-semibold text-white">
              Encontre uma issue:
            </span>{" "}
            Use o OpenMatch para encontrar uma issue interessante e adequada ao
            seu nível.
          </li>
          <li>
            <span className="font-semibold text-white">Leia a descrição:</span>{" "}
            Clique no link da issue para ler todos os detalhes no GitHub.
          </li>
          <li>
            <span className="font-semibold text-white">Comente na issue:</span>{" "}
            Se quiser trabalhar nela, comente algo como{" "}
            <span className="italic text-blue-300">
              &quot;Posso trabalhar nessa issue?&quot;
            </span>{" "}
            para avisar os mantenedores.
          </li>
          <li>
            <span className="font-semibold text-white">
              Faça um fork do repositório:
            </span>{" "}
            No GitHub, clique em{" "}
            <span className="italic text-blue-300">Fork</span> para criar uma
            cópia do projeto na sua conta.
          </li>
          <li>
            <span className="font-semibold text-white">
              Clone o repositório:
            </span>{" "}
            Copie o link do seu fork e rode{" "}
            <span className="font-mono bg-gray-700 px-1 rounded">
              git clone &lt;link&gt;
            </span>{" "}
            no seu computador.
          </li>
          <li>
            <span className="font-semibold text-white">Crie uma branch:</span>{" "}
            No terminal, rode{" "}
            <span className="font-mono bg-gray-700 px-1 rounded">
              git checkout -b minha-contribuicao
            </span>
            .
          </li>
          <li>
            <span className="font-semibold text-white">
              Implemente a solução:
            </span>{" "}
            Faça as alterações necessárias no código.
          </li>
          <li>
            <span className="font-semibold text-white">
              Faça commit e push:
            </span>{" "}
            Salve as mudanças com{" "}
            <span className="font-mono bg-gray-700 px-1 rounded">
              git commit
            </span>{" "}
            e envie para o GitHub com{" "}
            <span className="font-mono bg-gray-700 px-1 rounded">git push</span>
            .
          </li>
          <li>
            <span className="font-semibold text-white">
              Abra um Pull Request:
            </span>{" "}
            No GitHub, clique em{" "}
            <span className="italic text-blue-300">
              &quot;Compare & pull request&quot;
            </span>{" "}
            para enviar sua contribuição para revisão.
          </li>
          <li>
            <span className="font-semibold text-white">Aguarde feedback:</span>{" "}
            Os mantenedores podem pedir ajustes ou aprovar sua contribuição.
            Fique atento às notificações!
          </li>
        </ol>
        <div className="mt-6 text-xs text-gray-400">
          Dica: Não tenha medo de perguntar ou pedir ajuda nas issues! A
          comunidade open source é acolhedora com iniciantes.
        </div>
      </div>
    </div>
  );
}
