# MultiStream

MultiStream é uma aplicação web minimalista para assistir múltiplas transmissões da Twitch e do YouTube simultaneamente em uma única tela.

O usuário apenas cola o link de uma live e o sistema identifica automaticamente a plataforma, gera o player incorporado e adiciona ao grid. Não há chat, comentários, recomendações ou qualquer elemento que distraia, apenas o vídeo da transmissão.

A interface é totalmente focada na experiência de visualização, permitindo organizar os players livremente através de drag and drop, redimensionar cada transmissão conforme necessário e montar layouts personalizados com até 12 streams ao mesmo tempo.

Todos os layouts e transmissões são salvos automaticamente no navegador (localStorage), fazendo com que a configuração seja restaurada ao abrir o site novamente.

O visual deve ser moderno, escuro, limpo e minimalista, inspirado em ferramentas como Raycast, Vercel Dashboard e Linear, priorizando animações suaves, excelente experiência de uso e ausência de poluição visual.

O projeto será totalmente client-side, desenvolvido com React, Vite, TypeScript, Tailwind CSS, Zustand e react-grid-layout, sem necessidade de backend ou autenticação na primeira versão.
