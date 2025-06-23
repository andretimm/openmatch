import { useState, useEffect } from 'react';

/**
 * Hook customizado para detectar se a largura da tela corresponde a um dispositivo móvel.
 *
 * @param {number} maxWidth - A largura máxima em pixels para ser considerado móvel. O padrão é 768.
 * @returns {boolean} Retorna `true` se a largura da tela for menor ou igual a `maxWidth`, caso contrário `false`.
 */
export function useIsMobile(maxWidth: number = 768): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    // A verificação do `window` é crucial para garantir que o código
    // só será executado no lado do cliente (client-side), evitando erros no Next.js durante
    // a renderização no servidor (server-side rendering - SSR).
    if (typeof window === 'undefined') {
      return;
    }

    const handleResize = (): void => {
      setIsMobile(window.innerWidth <= maxWidth);
    };

    // Define o estado inicial assim que o componente é montado no cliente
    handleResize();

    // Adiciona um ouvinte de evento para redimensionamento da janela
    window.addEventListener('resize', handleResize);

    // Função de limpeza: remove o ouvinte de evento quando o componente for desmontado
    // Isso é importante para evitar vazamentos de memória.
    return (): void => {
      window.removeEventListener('resize', handleResize);
    };
  }, [maxWidth]); // O efeito será re-executado se o `maxWidth` mudar

  return isMobile;
}