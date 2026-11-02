# Pesquisa e estratégia da primeira versão

## Contexto da clínica

Fonte principal: https://clinicalk.com.br e seu fluxo https://clinicalk.com.br/agendar/clinica-lk, consultados em 2 de novembro de 2026.

O site apresenta a LK como uma clínica de odontologia integrada no Paraíso, em São Paulo, com foco de aquisição em reabilitação oral e prótese protocolo. O público dessa página inclui pessoas que usam dentadura, perderam dentes ou sentem insegurança para mastigar, falar e sorrir.

Fatos publicados e aproveitados:

| Informação                                              | Origem no site atual                          | Uso na nova página                                    |
| ------------------------------------------------------- | --------------------------------------------- | ----------------------------------------------------- |
| Mais de 30 anos de experiência                          | Faixa de indicadores e apresentação da equipe | Faixa inicial e equipe                                |
| Mais de 1.000 pacientes reabilitados                    | Indicadores e destaque inicial                | Prova de confiança próxima ao primeiro CTA            |
| Laboratório Kim dentro da clínica                       | Diferenciais e estrutura                      | Destaque inicial, capítulo 2 e seção de estrutura     |
| Centro radiológico próprio, com tomografia e panorâmica | Diferenciais, avaliação e FAQ                 | Destaque inicial, capítulo 1 e estrutura              |
| Equipe multidisciplinar e Dr. Kim                       | Seção da equipe                               | Apresentação humana com foto original                 |
| Dra. Fabiana explica a reabilitação                     | Vídeo explicativo                             | Modal na seção da equipe                              |
| Casos de Cida, Pedro, Sung e vídeos de outros pacientes | Casos e depoimentos                           | Fotos originais, avatares e três depoimentos em vídeo |
| Rua Correia Dias, 392, Paraíso, São Paulo               | Localização e rodapé                          | Seção final com link de rota                          |
| Seg. a sex., 8h–19h                                     | Rodapé                                        | FAQ e contato                                         |
| CRO-CL 15601; RT Chang Kook Kim, CROSP 46581            | Seção da equipe e rodapé                      | Equipe e rodapé                                       |
| WhatsApp +55 11 99263-5157                              | Script do fluxo de agendamento                | Contato direto com mensagem preparada                 |
| Fixo (11) 2478-2058; clinicalk4@gmail.com               | Rodapé                                        | Links de telefone e e-mail                            |

O conteúdo original também menciona outras especialidades nos depoimentos. Elas não receberam destaque comercial nesta primeira página, que mantém o foco em reabilitação e prótese protocolo.

## Hipótese de conversão

O visitante precisa reconhecer rapidamente seu objetivo, entender por que confiar na clínica e encontrar uma ação simples. A hierarquia proposta é uma hipótese de design e conteúdo; ainda não há teste A/B nem evidência de aumento de conversão.

1. **Benefício e ação.** “Seu sorriso. Sua vida. De volta.” aborda a motivação; o texto de apoio esclarece reabilitação oral e prótese protocolo. Bairro e cidade qualificam o interesse geográfico. O CTA abre o WhatsApp, sem formulário prévio.
2. **Confiança perto da decisão.** Pacientes reabilitados, experiência e estrutura própria aparecem antes de explicações longas.
3. **Identificação.** Exemplos cotidianos ajudam a pessoa a reconhecer a situação sem diagnóstico automático.
4. **Entendimento visual.** O scrollytelling explica base, planejamento e função. O objeto se separa e se reúne; cada movimento acompanha uma ideia.
5. **Prova humana.** Depoimentos e fotos existentes dão concretude à apresentação, sem falas inventadas.
6. **Diferenciação.** Laboratório e exames próprios ganham uma seção que traduz sua relevância: proximidade entre profissionais, personalização e menos deslocamentos.
7. **Redução de incerteza.** Equipe, primeira avaliação, prazo, indicação e orçamento esclarecem o próximo passo.
8. **Contato e acesso.** WhatsApp, telefone, horário e mapa ajudam o visitante a agir.

Os CTAs foram posicionados antes e depois dos principais pontos de decisão. O botão flutuante aparece após a primeira tela e se recolhe perto da seção final de contato. Não foram usadas escassez artificial, avaliação “grátis”, promessa de prazo fixo ou garantia de resultado.

## Referências pesquisadas

O serviço de busca web estava indisponível; a pesquisa foi feita pelo navegador, com busca no Google e visita às páginas abaixo.

- **Apple AirPods Pro — https://www.apple.com/airpods-pro/**: produto em escala grande, alternância de capítulos e destaque dos benefícios. Aplicação: implante como elemento central e apresentação gradual do tratamento. Nenhum ativo ou código copiado.
- **Lusion — https://lusion.co/**: narrativa visual 3D, materiais, iluminação e espaços amplos. Aplicação: um modelo leve, interação sutil e composição com poucas distrações. Nenhum ativo ou código copiado.
- **Awwwards — resultados das coleções Scroll e Storytelling**: usados na descoberta de referências; sem reutilização de layouts ou dependência de recursos do serviço.

## Direção visual

Verde profundo, verde sálvia e marfim mantêm vínculo com a identidade da clínica. Jost preserva a fonte de apoio original; Cormorant Garamond cria contraste editorial nos títulos. Fotografias reais aproximam a experiência da equipe e dos pacientes. O 3D é uma ilustração procedural própria, independente de arquivos de modelo externos.

No celular, o contato antecede a ilustração. A narrativa usa uma área visual fixa superior e texto em sequência. O modelo de implante unitário é identificado como ilustração; a legenda explica que a prótese protocolo reabilita uma arcada sobre múltiplos implantes.

## Próxima medição

O evento local `lk:contact`, com a posição do CTA, permite integrar métricas depois da definição da ferramenta. Para avaliar a hipótese, acompanhar cliques por seção, conversas iniciadas, avaliações agendadas e qualidade dos contatos. A primeira versão não implementa rastreamento nem reaproveita o webhook de leads da página original.

## Refinamento da interação — referência Möbius

Após a avaliação da primeira versão, o projeto passou a usar https://mobius.framer.website/ como referência de comportamento. A referência foi aberta e percorrida no navegador; a identidade visual da LK foi preservada.

A abertura e a apresentação do tratamento agora usam cenas que permanecem fixas na tela. O deslocamento no documento funciona como uma linha do tempo: controla a rotação e a escala do modelo, a separação e a montagem das peças, a saída e a entrada dos textos. A animação volta ao rolar para cima. A rolagem não é interceptada.

Cada sequência tem três cenas e navegação direta. O tratamento também oferece uma opção para pular a animação. A versão sequencial permanece disponível com movimento reduzido, sem JavaScript ou em telas baixas. No celular, o botão flutuante se recolhe durante a cena do tratamento para liberar os controles; o agendamento permanece no cabeçalho.
