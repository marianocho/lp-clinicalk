# Clínica LK — primeira versão

Landing page da Clínica LK com narrativa durante a rolagem, implante 3D interativo e dentição ilustrativa e foco em agendamento de avaliação.

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

- Benefício, especialidade e contato aparecem no início; localização detalhada ao final.
- Experiência, Laboratório Kim e centro radiológico apresentam os diferenciais.
- A abertura tem três cenas fixas: a rolagem gira, aproxima, separa e reúne o implante, enquanto o conteúdo muda dentro da mesma composição.
- O tratamento fica fixo em três capítulos: raios escaneiam dentes em holograma; quatro dentes holográficos se encaixam em uma dentição sólida; o sorriso fechado aparece com acabamento suave. Não há mastigação, mandíbula ou oval fixo. A rolagem controla toda a sequência, inclusive o retorno.
- A abertura usa creme e bege. A sequência do tratamento e o contato usam azul noturno, com contrastes em marfim e champanhe.
- Os indicadores de cena permitem ir diretamente a um capítulo. “Pular a animação” leva às histórias dos pacientes. O cabeçalho mantém acesso ao agendamento.
- Galerias horizontais de histórias reais e da estrutura da clínica, com cartões amplos, indicadores, setas, toque e teclado. Vídeos de Cida, Pedro e Bárbara em modal; vídeo explicativo da Dra. Fabiana na seção da equipe.
- Estrutura, equipe, primeira consulta, perguntas frequentes e localização completam o percurso.
- WhatsApp acessível no cabeçalho, nas seções de decisão e em botão flutuante.

## Arquivos

- `index.html`: conteúdo, semântica e metadados.
- `src/style.css`: identidade visual e comportamento responsivo.
- `src/main.js`: navegação, modais, observação da rolagem e contato.
- `src/dental-scene.js`: modelo procedural e renderização com Three.js.
- `src/dental-arch-scene.js`: composição SVG em camadas, holograma, raios, encaixe e dentição fechada.
- `src/galleries.js`: carrosséis com rolagem nativa, controles e estado acessível.
- `src/refinements.css`: refinamentos de capítulos, navegação, galerias e dentição.
- `src/theme.css`: cores creme e azul noturno.
- `src/scroll-cinema.js` e `src/cinema.css`: cenas fixas, transições, progresso e navegação da animação.
- `public/`: identidade, fotos reais e fontes locais.
- `docs/estrategia.md`: pesquisa, fontes e decisões de conteúdo.

## Contato, dados e mídia

Os botões usam o WhatsApp `+55 11 99263-5157`, confirmado no código do fluxo público de agendamento original. O telefone fixo publicado é `(11) 2478-2058`. Abrir o WhatsApp prepara a mensagem; o visitante confirma o envio na plataforma.

Não há formulário, backend, integração com o webhook do site original, cookies de rastreamento ou gravação de dados pessoais. O evento local `lk:contact` informa a posição do botão e fica disponível para uma futura integração de métricas. Nenhum evento é enviado a serviços externos.

Os vídeos são carregados de `clinicalk.com.br` somente quando solicitados. As fotos, logos e fontes estão locais. O implante 3D tem alternativa vetorial para falha de WebGL. A dentição do tratamento usa uma imagem ilustrativa gerada com Imagegen (`public/images/dentition-closed-v1.png`), com transparência e máscaras SVG. As animações pausam fora da área visível ou com a aba oculta. O conteúdo e os links principais são HTML e continuam acessíveis sem a cena 3D.

As cenas usam rolagem nativa e `position: sticky`, sem interceptar gestos, travar a roda do mouse ou instalar bibliotecas de suavização. Com movimento reduzido, JavaScript desabilitado ou tela com menos de 600px de altura, o conteúdo volta à leitura sequencial. Os painéis que estão fora de cena ficam fora da ordem de foco.

## Base editorial

Conteúdo factual, identidade e mídia: [site oficial da Clínica LK](https://clinicalk.com.br), consultado em 2 de novembro de 2026. As alegações de experiência e pacientes são as publicadas pela própria clínica. Não foram criados depoimentos, preços, avaliações numéricas ou garantias de resultado.

Referências visuais: [Apple AirPods Pro](https://www.apple.com/airpods-pro/) e [Lusion](https://lusion.co/). A interação de rolagem foi refinada a partir de [Möbius](https://mobius.framer.website/), conforme o feedback do projeto. O refinamento mais recente usa [Apple MacBook Pro](https://www.apple.com/macbook-pro/proled-xdr-display/) como referência de navegação, divisão de seções e carrosséis. A implementação e o modelo 3D do implante são próprios. O prompt e a origem do novo ativo de dentição estão em `docs/estrategia.md`.
