# Clínica LK — primeira versão

Landing page da Clínica LK com narrativa durante a rolagem, ilustração dental 3D original e foco em agendamento de avaliação.

## Executar

Requer Node.js 20.19+ ou 22.12+.

```bash
npm ci
npm run dev
```

O Vite informa a URL local. Para validar e gerar a versão estática:

```bash
npm run check
npm run build
npm run preview
```

A saída de produção fica em `dist/`. Pode ser servida por qualquer hospedagem estática. `.openai/hosting.json` identifica a publicação privada de revisão no Sites; o domínio original da clínica não é alterado.

## Experiência

- Benefício, especialidade, bairro e contato aparecem no início.
- Experiência, Laboratório Kim e centro radiológico apresentam os diferenciais.
- Três capítulos explicam suporte, personalização e retorno à rotina. Um modelo de implante e coroa se separa e se reúne acompanhando a rolagem. A legenda distingue essa ilustração da prótese protocolo de arcada completa.
- Histórias reais de Cida, Pedro e Bárbara, com vídeos em modal; vídeo explicativo da Dra. Fabiana na seção da equipe.
- Estrutura, equipe, primeira consulta, perguntas frequentes e localização completam o percurso.
- WhatsApp acessível no cabeçalho, nas seções de decisão e em botão flutuante.

## Arquivos

- `index.html`: conteúdo, semântica e metadados.
- `src/style.css`: identidade visual e comportamento responsivo.
- `src/main.js`: navegação, modais, observação da rolagem e contato.
- `src/dental-scene.js`: modelo procedural e renderização com Three.js.
- `public/`: identidade, fotos reais e fontes locais.
- `docs/estrategia.md`: pesquisa, fontes e decisões de conteúdo.

## Contato, dados e mídia

Os botões usam o WhatsApp `+55 11 99263-5157`, confirmado no código do fluxo público de agendamento original. O telefone fixo publicado é `(11) 2478-2058`. Abrir o WhatsApp prepara a mensagem; o visitante confirma o envio na plataforma.

Não há formulário, backend, integração com o webhook do site original, cookies de rastreamento ou gravação de dados pessoais. O evento local `lk:contact` informa a posição do botão e fica disponível para uma futura integração de métricas. Nenhum evento é enviado a serviços externos.

Os vídeos são carregados de `clinicalk.com.br` somente quando solicitados. As fotos, logos e fontes estão locais. O 3D tem alternativa vetorial para falha de WebGL, respeita a preferência por movimento reduzido e pausa fora da área visível ou com a aba oculta. O conteúdo e os links principais são HTML e continuam acessíveis sem a cena 3D.

## Base editorial

Conteúdo factual, identidade e mídia: [site oficial da Clínica LK](https://clinicalk.com.br), consultado em 2 de novembro de 2026. As alegações de experiência e pacientes são as publicadas pela própria clínica. Não foram criados depoimentos, preços, avaliações numéricas ou garantias de resultado.

Referências visuais: [Apple AirPods Pro](https://www.apple.com/airpods-pro/) e [Lusion](https://lusion.co/). A implementação e o modelo 3D são próprios.
