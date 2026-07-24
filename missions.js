"use strict";

/* ================================================================
   MISSÕES ALEATÓRIAS DE AETHER
   Estrutura por dificuldade: facil | normal | dificil
   Cada missão tem: inimigos do bestiário, recompensas do database,
   armadilhas, puzzles hexagonais, NPCs e descrição para o Mestre
   ================================================================ */

const MISSIONS = [

  /* ══════════════════════════════════════════════════════
     FÁCEIS — Perigo baixo, recompensas menores
     ══════════════════════════════════════════════════════ */
  {
    id: "m-ratoeira-goblin",
    title: "A Ratoeira dos Goblins",
    difficulty: "facil",
    icon: "🐀",
    tags: ["floresta", "armadilha", "stealth"],
    hook: "Um mercador chegou à taverna com a orelha cortada. Goblins tomaram o atalho da floresta — pedem pedágio ou matam. Ele oferece recompensa por limpar o caminho.",
    summary: "Ninho de goblins num bosque próximo. Pequeno mas armadilhado ao extremo.",
    start: "O grupo encontra o atalho da floresta. Antes de avançar 100 metros, galhos suspeitos cobrem o chão.",
    areas: [
      {
        name: "Entrada do Bosque",
        description: "Caminho estreito com folhas secas cobrindo o chão.",
        trap: {
          name: "Rede Suspensa",
          trigger: "Pisar na folhagem",
          effect: "Rede lança 1d3 personagens para cima (3m). Queda: 1d6 dano. AGI normal para agarrar galho.",
          detect: "Percepção (difícil) antes de entrar, ou DEX ao pisar."
        },
        hex: null
      },
      {
        name: "Clareira Central",
        description: "6 goblins jogando dados ao redor de uma fogueira. Não percebem chegada furtiva.",
        hex: {
          layout: "6x4",
          terrain: ["fogueira (hex 3,2 — bloqueia linha de visão)", "tocos de árvore (3 hexes — cobertura parcial)", "tenda de goblin (2x2 hexes)"],
          hint: "Ataque furtivo elimina 2 goblins antes do combate começar (Percepção deles vs. Furtividade do grupo)."
        },
        enemies: [
          { name: "Goblin Comum", qty: 4, diff: 1 },
          { name: "Feiticeiro Goblin", qty: 1, diff: 2, note: "Fica na tenda, usa Maldição do Azar como abertura" }
        ],
        trap: null
      },
      {
        name: "Toca do Líder",
        description: "Toca cavada numa raiz gigante. Cheiro de coisas roubadas.",
        puzzle: {
          type: "Fechadura de Ramos",
          description: "Três ramos entrelaçados trancam o baú. Cada ramo tem entalhes com números: 3, 7, 2. A combinação é a soma dos entalhes na ordem correta.",
          solution: "Girar pelo ramo do meio (7), depois esquerdo (3), depois direito (2). Qualquer outra ordem trava mais forte (penalidade: 1d4 dano nas mãos).",
          hint: "Percepção (normal) revela marcas de dedos mostrando a ordem usada pelos goblins."
        },
        npc: null,
        loot_here: ["Moedas roubadas do mercador (2d20 ouro)", "Kit de ferramentas de armadilha (item raro)"]
      }
    ],
    npcs: [
      {
        name: "Zek, o Goblin Covarde",
        role: "Benéfico (se poupado)",
        personality: "Trêmulo, gagueja muito. Não quer morrer.",
        info: "Sabe onde os goblins escondem um segundo tesouro na área e revela em troca da vida. Pode se tornar informante da cidade."
      }
    ],
    enemies_summary: [
      { name: "Goblin Comum", qty: "4-6", diff: 1 },
      { name: "Feiticeiro Goblin", qty: 1, diff: 2 }
    ],
    rewards: [
      { type: "moedas", desc: "3d20 moedas de ouro (tesouro do mercador + poupança do bando)" },
      { type: "item", desc: "Kit de Ferramentas de Armadilha (item raro — DEX +1d4 para armar/desarmar armadilhas)" },
      { type: "pericia", desc: "Oportunidade: aprender Armadilhas como perícia geral (treinamento com o kit)" },
      { type: "bonus", desc: "Gratidão do mercador: desconto permanente de 20% na loja dele" }
    ],
    master_notes: "Missão ideal para grupo nível 1. Enfatize as armadilhas — o Feiticeiro Goblin é perigoso se o grupo não for furtivo. Zek pode ser um NPC recorrente hilário se poupado.",
    duration: "1 sessão (3-4 horas)"
  },

  {
    id: "m-entrega-errada",
    title: "A Entrega Errada",
    difficulty: "facil",
    icon: "📦",
    tags: ["cidade", "social", "investigação"],
    hook: "Um encomendeiro contratou o grupo para entregar uma caixa lacrada ao Mago Teldris, do outro lado da cidade. 'Não abram.' A caixa faz ruídos estranhos.",
    summary: "Missão de entrega que esconde um pequeno dragão bebê dentro da caixa. O mago não é quem parece.",
    start: "O grupo recebe a caixa de madeira furada (para 'ventilação') e o endereço. A rota corta três bairros diferentes.",
    areas: [
      {
        name: "Mercado Central",
        description: "Movimentado. Um inspetor fiscal para o grupo para taxar 'mercadorias não declaradas'.",
        npc: {
          name: "Inspetor Graun",
          role: "Traiçoeiro (parcialmente)",
          personality: "Corrupto. Quer suborno de 5 moedas ou confisca a caixa 'para análise'.",
          resolution: "Pagar (5 ouro), persuadir (SAB difícil), intimidar (FOR normal), ou desviar por rua alternativa (+10 minutos)."
        },
        trap: null
      },
      {
        name: "Rua dos Magos",
        description: "A caixa começa a se mexer MUITO. A tampa levanta levemente — olho dourado espia.",
        puzzle: {
          type: "Contenção do Bebê",
          description: "O dracônico bebê quer sair. O grupo tem 3 rodadas antes que ele abra a caixa e role pelo mercado.",
          solution: "Segurar a tampa (FOR normal), distrair com comida (qualquer item de comida no inventário), ou conjurar Silêncio/Sono. Cada falha: o bebê faz mais barulho, +1d4 NPCs curiosos se aproximam.",
          hint: "Percepção: a caixa tem o símbolo de Sanctum impresso ao fundo — não foi feita pelo encomendeiro."
        }
      },
      {
        name: "Casa de Teldris",
        description: "Grande demais para um mago comum. Dois capangas na entrada.",
        npc: {
          name: "Teldris, o 'Mago'",
          role: "Traiçoeiro",
          personality: "Educado demais. Dinheiro fácil demais. Quer o dracônico para 'estudos' — na verdade é traficante de criaturas raras.",
          resolution: "Entregar (missão cumprida mas moralmente questionável), recusar (combate com capangas Dif.2 × 2), ou negociar (INT difícil — exige 50 ouro e liberação do bebê)."
        }
      }
    ],
    npcs: [
      { name: "Bebê Dracônico (sem nome)", role: "Neutro/Simpático", personality: "Curioso, destrutivo acidentalmente. Se alimentado, segue o grupo por 1 semana." },
      { name: "Encomendeiro Real", role: "Benéfico (se encontrado de volta)", personality: "Assustado — não sabia o que tinha na caixa, foi enganado por Teldris." }
    ],
    enemies_summary: [
      { name: "Capangas de Teldris", qty: 2, diff: 2 },
      { name: "Teldris (se confrontado)", qty: 1, diff: 2, note: "Mago Renegado com magias de controle" }
    ],
    rewards: [
      { type: "item", desc: "Anel de Comunicação com Animais (recompensa do encomendeiro arrependido) — Raro" },
      { type: "bonus", desc: "O bebê dracônico como familiar temporário (1 semana — fornece +1d4 em testes de intimidação)" },
      { type: "benção", desc: "Bênção de Boa Sorte (Tobi aprecia cuidar do pequeno)" },
      { type: "moedas", desc: "30 moedas (pagamento original) + 20 extras se encontrarem Teldris às autoridades" }
    ],
    master_notes: "Missão leve e social. O bebê dracônico é engraçado — ele destrói pelo menos 1 objeto por cena. Teldris pode ser vilão recorrente se fugir.",
    duration: "1 sessão"
  },

  {
    id: "m-fantasma-moinho",
    title: "O Fantasma do Velho Moinho",
    difficulty: "facil",
    icon: "👻",
    tags: ["assombrado", "investigação", "morto-vivo"],
    hook: "O moinho no campo parou de funcionar há 3 dias. O moleiro diz que ouve choros à noite. Ninguém entra. Precisa de grãos moídos em 2 dias ou a aldeia passa fome.",
    summary: "Um espectro menor prende o moinho — na verdade o filho morto do moleiro, que escondeu um segredo antes de morrer.",
    start: "O grupo chega ao moinho ao entardecer. Porta rangendo. Farinha espalhada no chão formando padrão estranho.",
    areas: [
      {
        name: "Andar Térreo",
        description: "Engrenagens paradas. Farinha no chão forma... letras? Borradas demais para ler.",
        puzzle: {
          type: "Mensagem na Farinha",
          description: "As letras na farinha são espelhadas — o fantasma as escreveu do seu plano. Seguram um espelho (qualquer superfície polida) sobre a farinha para ler: 'PAREDE LESTE TIJOLO SOLTO'.",
          solution: "Inspecionar a parede leste (Percepção normal) revela um tijolo falso. Atrás: uma carta de amor nunca enviada e 15 moedas de ouro."
        }
      },
      {
        name: "Segundo Andar",
        description: "Temperatura cai 10 graus ao subir a escada. O Espectro Menor aparece.",
        enemies: [{ name: "Espectro Menor (filho do moleiro)", qty: 1, diff: 1, note: "Não ataca se o grupo mostrar a carta. Ataca se tentarem forçar saída." }],
        npc: {
          name: "Espectro de Marius (filho do moleiro)",
          role: "Neutro — pode tornar-se benéfico",
          personality: "Confuso. Não sabe que está morto. Pede para entregar a carta a uma mulher na aldeia.",
          resolution: "Mostrar a carta: o fantasma reconhece e descansa (missão principal resolvida sem combate). Derrotá-lo: funciona mas moleiro fica devastado."
        }
      }
    ],
    npcs: [
      { name: "Moleiro Braun", role: "Benéfico", personality: "Velho, triste. Paga bem. Se soubessem que é o filho, pagaria com item familiar." },
      { name: "Lena, a Jovem", role: "Benéfico", personality: "A destinatária da carta. Chora ao receber. Recompensa com colar da família." }
    ],
    enemies_summary: [
      { name: "Espectro Menor (Marius)", qty: 1, diff: 1 }
    ],
    rewards: [
      { type: "item", desc: "Colar da Família Braun — Raro (sempre quente, +1 em resistência a maldições de frio)" },
      { type: "moedas", desc: "25 moedas (moleiro) + 10 (Lena, tudo que tem)" },
      { type: "pericia", desc: "Aprender Etiqueta / Conhecimento Local como perícia se interagirem profundamente com a comunidade" },
      { type: "benção", desc: "Bênção de Sono Reparador (Marius agradecido abençoa o grupo de outro plano)" }
    ],
    master_notes: "Missão emocional. Se o grupo resolver sem violência, o moleiro se torna aliado permanente. Mencione o cheiro de pão fresco no início para contraste com o frio do segundo andar.",
    duration: "1 sessão curta"
  },

  {
    id: "m-porco-de-ouro",
    title: "O Porco de Ouro",
    difficulty: "facil",
    icon: "🐷",
    tags: ["comédia", "perseguição", "cidade"],
    hook: "Um porco alquímico fugiu do laboratório do Professor Venz. O porco come metal — e já devorou 3 ferramentas, um sino da praça e está indo em direção à ferraria. 'PEGUEM ELE ANTES QUE COMA A BIGORNA!'",
    summary: "Perseguição cômica por uma cidade com um porco que cospe pedaços de metal derretido e cresce a cada coisa que come.",
    start: "O grupo avista o porco (tamanho de um labrador, brilhando levemente) virando uma esquina com o sino no focinho.",
    areas: [
      {
        name: "Praça do Mercado",
        hex: {
          layout: "8x5",
          terrain: ["bancas de mercado (cobertura)", "fonte central (obstáculo)", "escada (elevação)", "saída norte e sul"],
          hint: "O porco se move aleatoriamente (1d6 por direção) a menos que alguém jogue comida na frente dele. AGI normal para interceptar antes de comer a fonte."
        },
        trap: { name: "Cuspe Metálico", trigger: "Ficar a 1 hex do porco sem cobertura", effect: "1d4 dano de metal fundido + Queimando (1d4/rodada)", detect: "Porco infla o peito antes de cuspir — Percepção normal avisa." }
      },
      {
        name: "Rua da Ferraria",
        description: "Ferreiro em pânico jogando baldes d'água (não ajuda).",
        puzzle: {
          type: "Contenção do Porco",
          description: "O porco precisa ser atraído para uma armadilha. Professor Venz (que chegou correndo) grita que o único atrativo é VIDRO — o único material que o porco não come, mas ama morder.",
          solution: "Conseguir vidro (quebrar uma janela, pegar frasco do inventário) e jogar no chão leva o porco direto para a armadilha do Professor. FOR normal para segurar a gaiola enquanto o porco entra."
        }
      }
    ],
    npcs: [
      { name: "Prof. Venz", role: "Benéfico (caótico)", personality: "Gênio desastrado. Animado demais com os 'dados coletados'. Recompensa generosamente mas pede que não contem para ninguém." }
    ],
    enemies_summary: [
      { name: "Porco Alquímico (não é inimigo — é perseguição)", qty: 1, diff: 1, note: "Só ataca se encurralado. Estatísticas de Urso Cinzento mas com cuspe de fogo" }
    ],
    rewards: [
      { type: "item", desc: "Poção de Transmutação Metálica (Prof. Venz cria na hora) — Raro (converte 1kg de metal comum em metal de qualidade superior)" },
      { type: "item", desc: "Ferramenta de Alquimia (garantia de Venz) — desconto de 30% em poções dele" },
      { type: "moedas", desc: "20 moedas + comida grátis na taverna (o dono do sino ficou agradecido)" }
    ],
    master_notes: "Missão de comédia pura. Deixe o porco comer pelo menos 1 item de valor baixo do inventário de algum jogador para criar momento memorável. O Prof. Venz pode ser fornecedor de poções para campanhas longas.",
    duration: "1 sessão curta"
  },

  {
    id: "m-carta-perdida",
    title: "A Carta do General",
    difficulty: "facil",
    icon: "📜",
    tags: ["político", "social", "stealth"],
    hook: "Um mensageiro real desmaiou na taverna. Carta diplomática urgente para o General Hartuk precisa chegar em 6 horas. O mensageiro está envenenado e não pode andar. A carta não pode ser lida por ninguém.",
    summary: "Entrega simples que se complica quando o grupo descobre que dois grupos querem a carta — e motivos muito diferentes.",
    start: "Carta lacrada com o selo real. O caminho passa pela Ponte dos Negociantes — território neutro, mas vigiado.",
    areas: [
      {
        name: "Ponte dos Negociantes",
        description: "Dois homens encostados ao parapeito observam quem passa.",
        npc: {
          name: "Agentes do Barão Dusk",
          role: "Traiçoeiro",
          personality: "Profissionais. Oferecem 50 ouro pela carta. 'Não precisa saber para quê.'",
          resolution: "Vender (50 ouro, consequências futuras na campanha), recusar (perseguição de 2 agentes Dif.2), enganar (dar carta falsa — INT difícil)."
        }
      },
      {
        name: "Quartel do General",
        description: "Portão com 4 guardas. Precisam da carta + identificação do mensageiro (que o grupo não tem).",
        puzzle: {
          type: "Protocolo de Verificação",
          description: "Os guardas usam um sistema de senha/contrassenha rotativa. O mensageiro sussurrou algo antes de desmaiar: 'Corvos cantam quando neva.'",
          solution: "Usar a senha ('Corvos cantam quando neva') funciona. Sem ela: precisam convencer o Capitão (SAB difícil) ou mostrar o selo real na carta sem quebrá-lo (DEX difícil)."
        }
      }
    ],
    npcs: [
      { name: "Mensageiro Rael", role: "Benéfico", personality: "Agradecido ao acordar. Dá uma ficha de agente real — pode ser usada para entrar em locais restritos 1 vez." },
      { name: "General Hartuk", role: "Benéfico (austero)", personality: "Não demonstra emoção mas respeita eficiência. Oferece favor futuro em vez de ouro." }
    ],
    enemies_summary: [
      { name: "Agentes do Barão (se recusarem venda)", qty: 2, diff: 2 }
    ],
    rewards: [
      { type: "item", desc: "Ficha de Agente Real (do mensageiro) — acesso a 1 local restrito à escolha" },
      { type: "bonus", desc: "Favor do General Hartuk — pode ser usado como aliado uma vez na campanha" },
      { type: "moedas", desc: "40 moedas (pagamento formal do exército)" },
      { type: "info", desc: "A carta era sobre um movimento de tropas — o grupo agora sabe de movimento militar secreto (plot hook)" }
    ],
    master_notes: "Missão política. Os Agentes do Barão Dusk são excelentes para plot hooks futuros. A carta pode conter informação que o Mestre use mais adiante.",
    duration: "1 sessão"
  },

  /* ══════════════════════════════════════════════════════
     NORMAIS — Perigo moderado, recompensas significativas
     ══════════════════════════════════════════════════════ */
  {
    id: "m-tumba-arqueologa",
    title: "A Tumba da Arqueóloga",
    difficulty: "normal",
    icon: "⚱",
    tags: ["dungeon", "armadilha", "puzzle", "morto-vivo"],
    hook: "A Professora Linde Ash não voltou de uma expedição à tumba do Nobre Arkal. Seu assistente veio em pânico — ela foi há 3 dias. 'Ela encontrou algo grande. Eu vi a luz da tocha pela entrada e depois... silêncio.'",
    summary: "Tumba de 3 andares com armadilhas progressivas, um necromante errante que chegou antes e Linde viva mas presa.",
    start: "Entrada da tumba: porta de pedra entreaberta. Pegadas de botas entrando, nenhuma saindo.",
    areas: [
      {
        name: "Salão de Entrada (Andar 1)",
        description: "Hieróglifos nas paredes. Três pedestais com estátuas faltando partes.",
        trap: {
          name: "Dardos da Guarda Eterna",
          trigger: "Pisar nos 4 tiles do centro do salão (marcados com símbolo diferente)",
          effect: "Dardos disparados de ambas as paredes: 2d6 dano por dardo (2 dardos por personagem). AGI difícil para esquivar.",
          detect: "Percepção (normal) identifica os furos nas paredes. INT (normal) identifica os tiles diferentes."
        },
        hex: {
          layout: "8x6",
          terrain: ["3 pedestais (obstáculos, cobertura parcial)", "4 tiles armadilhados (hex 3,3 / 4,3 / 3,4 / 4,4)", "nicho nas paredes leste e oeste (saída de dardos)"],
          hint: "Contornar pelos hexes das bordas evita completamente a armadilha."
        }
      },
      {
        name: "Câmara do Necromante (Andar 2)",
        description: "Cheiro de osso queimado. 4 esqueletos guardam o necromante que lê o grimório de Arkal.",
        enemies: [
          { name: "Esqueleto Guerreiro", qty: 3, diff: 1 },
          { name: "Necromante Errante", qty: 1, diff: 3, note: "Tem o Grimório de Arkal — não vai abandoná-lo facilmente" }
        ],
        npc: {
          name: "Necromante Zaeris",
          role: "Traiçoeiro",
          personality: "Arrogante. Quer o grimório para si. Pode ser negociado SE o grupo prometer não o reportar às autoridades.",
          resolution: "Combate, negociar (cópia do grimório vs. o original), ou deixar sair (ele leva o grimório — consequências futuras)."
        },
        hex: {
          layout: "10x7",
          terrain: ["sarcófagos abertos (cobertura pesada)", "pilar central com braseiro (luz, bloqueia movimento)", "porta para andar 3 (trancada, necromante tem chave)"],
          hint: "Necromante fica atrás dos sarcófagos. Esqueletos formam linha de frente."
        }
      },
      {
        name: "Cela Secreta (Andar 3)",
        description: "Linde presa atrás de grade de ossos magicamente fundidos.",
        puzzle: {
          type: "Grade de Ossos",
          description: "A grade tem 6 ossos cruzados. Cada osso tem um número gravado. Tirá-los na ordem errada causa 1d6 de dano. A ordem correta é a sequência de Arkal: os números em ordem crescente.",
          solution: "Os números são 7, 2, 9, 4, 1, 6. Ordem crescente: 1, 2, 4, 6, 7, 9. INT (normal) para perceber o padrão. Força (normal) remove cada osso após descobrir a ordem.",
          hint: "Linde, do outro lado da grade, já descobriu a ordem — ela grita os números se o grupo perguntar."
        }
      }
    ],
    npcs: [
      { name: "Prof. Linde Ash", role: "Benéfica", personality: "Pesquisadora apaixonada. Furiosa com o necromante. Pode ensinar habilidades de conhecimento ao grupo." }
    ],
    enemies_summary: [
      { name: "Esqueleto Guerreiro", qty: 3, diff: 1 },
      { name: "Necromante Errante", qty: 1, diff: 3 }
    ],
    rewards: [
      { type: "item", desc: "Grimório de Arkal (magia rara: Levantar Morto de nível 3 — versão melhorada)" },
      { type: "magia", desc: "Aprende 'Invocar Esqueleto Arqueiro' se ficar com o grimório" },
      { type: "moedas", desc: "60 moedas (Linde paga) + tesouro de Arkal (3d20 ouro em joias antigas)" },
      { type: "pericia", desc: "Linde pode ensinar Arqueologia/Conhecimento Élfico como perícia especial" }
    ],
    master_notes: "A armadilha de dardos é séria — avise com os símbolos nas paredes. Zaeris é excelente como vilão recorrente. O grimório pode ser o MacGuffin de uma campanha maior.",
    duration: "2 sessões"
  },

  {
    id: "m-cacada-lobisomem",
    title: "A Caçada ao Lobisomem",
    difficulty: "normal",
    icon: "🌕",
    tags: ["investigação", "floresta", "armadilha", "moral"],
    hook: "Três ovelhas mortas. Uma cabana destroçada. E o ferreiro do vilarejo desapareceu há dois dias. Todos suspeitos, todos com medo. A lua cheia é em 4 dias.",
    summary: "Missão de investigação que revela que o lobisomem é alguém querido do vilarejo. Combate ou cura?",
    start: "O grupo chega ao vilarejo de Bruma. Tensão no ar. As pessoas se olham desconfiadas.",
    areas: [
      {
        name: "Vilarejo de Bruma",
        description: "Investigação social. 5 suspeitos, cada um com álibi parcial.",
        puzzle: {
          type: "Investigação Social",
          description: "5 suspeitos: o ferreiro sumido, a curandeira que saiu tarde, o caçador que ficou quieto, o padre nervoso, a criança que 'viu algo'. Cada conversa dá 1 pista.",
          solution: "Pistas levam ao celeiro do caçador Dron: pegadas de pata enorme + pelos longos + a capa rasgada de Dron. Dron é o lobisomem — mas não sabe, acorda toda manhã sem memória.",
          hint: "INT (difícil) conecta todas as pistas sem falar com todos. SAB (normal) percebe que o padre sabe mais do que diz."
        }
      },
      {
        name: "Floresta dos Pinheiros (à noite)",
        description: "Dron transformado, assustado e confuso, encurralado entre árvores.",
        hex: {
          layout: "10x8",
          terrain: ["pinheiros densos (cobertura pesada, 40% do campo)", "riacho (hex 5 — difícil de cruzar)", "clareira central (onde Dron está)", "armadilha de caçador (hexes 2,4 e 7,3)"],
          hint: "Dron (Lobisomem Dif.3) tem fúria lunar — +1d8 dano e mais ataques. Prata e fogo são as únicas fraquezas."
        },
        enemies: [{ name: "Lobisomem (Dron transformado)", qty: 1, diff: 3, note: "Fúria Lunar ativa — noite de lua cheia" }],
        trap: { name: "Armadilha de Caçador (do próprio Dron)", trigger: "Pisar no hex marcado", effect: "Alvo fica Preso (imóvel, FOR normal para escapar como Ação)", detect: "Rastrear (normal) ou Percepção (difícil)" }
      },
      {
        name: "Decisão Final",
        description: "Dron derrotado (abaixo de 30% HP) transforma de volta em humano confuso e chorando.",
        npc: {
          name: "Dron o Caçador",
          role: "Neutro (vítima da maldição)",
          personality: "Devastado. Não sabe o que fez. 'Matem-me se precisarem.'",
          resolution: "Matar (os aldeões agradecem, Dron pede), curar (Antídoto de Lycantrofia — requer ingredientes raros), ou prender até encontrar cura."
        }
      }
    ],
    npcs: [
      { name: "Padre Meln", role: "Ambíguo", personality: "Sabia de Dron há 1 semana. Guardou segredo para protegê-lo. Tem um livro sobre lycantrofia." },
      { name: "Dron, o Caçador", role: "Neutro/Trágico", personality: "Homem bom preso numa maldição que não pediu." }
    ],
    enemies_summary: [
      { name: "Lobisomem (Dron)", qty: 1, diff: 3 },
      { name: "Lobos da floresta (se o combate durar 4+ rodadas)", qty: 3, diff: 1 }
    ],
    rewards: [
      { type: "item", desc: "Pele de Lobisomem (material raro — armadura especial ou componente alquímico)" },
      { type: "item", desc: "Livro de Lycantrofia do Padre (contém receita do Antídoto — quest secundária)" },
      { type: "moedas", desc: "50 moedas + casa do vilarejo disponível para o grupo usar como base" },
      { type: "maldição", desc: "Se mordido durante o combate sem tratamento: Lycantrofia (maldição média — missão para curar)" },
      { type: "benção", desc: "Se curarem Dron: Bênção da Lua Cheia (Aethea aprecia compaixão — +1d6 em testes noturnos)" }
    ],
    master_notes: "A missão é moral acima de tudo. Não há solução fácil. Dron curado pode tornar-se aliado poderoso. Se matarem, o vilarejo agradece mas algo parece... incompleto.",
    duration: "2 sessões"
  },

  {
    id: "m-heranca-maldita",
    title: "A Herança Maldita",
    difficulty: "normal",
    icon: "🏚",
    tags: ["assombrado", "puzzle", "morto-vivo", "armadilha"],
    hook: "Um jovem herdou a mansão do tio excêntrico. Mas ninguém fica lá mais de uma noite. O tabelião oferece 100 moedas para alguém 'limpar' a mansão e confirmar que está habitável.",
    summary: "Mansão de 4 andares onde o tio está preso como fantasma raivoso — mas sua raiva tem uma causa legítima e uma solução não-violenta.",
    start: "Mansão nas bordas da cidade. Janelas escuras. O jardim cresceu por dentro das paredes.",
    areas: [
      {
        name: "Jardim (Exterior)",
        description: "Plantas carnívoras pequenas cresceram por todo o jardim.",
        trap: { name: "Raízes Agarradoras", trigger: "Mover pela grama sem caminho de pedra", effect: "Raízes prendem tornozelo: Preso (FOR normal para escapar, Ação). 1d4 por rodada de plantas mordendo.", detect: "Percepção (normal) vê as plantas se movendo levemente." }
      },
      {
        name: "Sala de Jantar (Andar 1)",
        description: "Mesa posta para um jantar que nunca aconteceu. Talheres voam sozinhos.",
        hex: {
          layout: "8x6",
          terrain: ["mesa longa central (obstáculo)", "cadeiras (cobertura leve)", "janelas (saída de emergência)", "lustre (pode cair — Percepção difícil para ver rachaduras)"],
          hint: "Os talheres atacam qualquer um que tocar nos pratos. Percepção difícil: há um envelope embaixo do prato principal."
        },
        trap: { name: "Talheres Voadores", trigger: "Tocar nos pratos da mesa", effect: "1d6 de talheres atacam (1d4 cada) quem tocou. AGI normal para desviar de metade.", detect: "SAB (normal) sente a energia hostil antes de tocar." }
      },
      {
        name: "Biblioteca (Andar 2)",
        description: "Livros organizados por sistema incompreensível. Um livro vermelho pulsa.",
        puzzle: {
          type: "Diário do Tio",
          description: "O livro vermelho é o diário do Tio Vernes. Mas está em código: cada 3ª palavra da direita para a esquerda. Levanta informação sobre porque ele está preso.",
          solution: "Com INT (normal): lê o código. Descobre: o sobrinho (o que contratou o grupo) falsificou o testamento. O tio sabe. O tio está furioso. O testamento verdadeiro está na chaminé.",
          hint: "SAB (difícil) sente que o livro quer ser lido — flutua para as mãos de quem for sábio."
        }
      },
      {
        name: "Sótão (Andar 4)",
        description: "O Fantasma do Tio Vernes emerge furioso ao ver o grupo.",
        npc: {
          name: "Fantasma de Vernes",
          role: "Neutro/Benéfico (se informado)",
          personality: "Raivoso. Grita sobre traição. Mas ao ver o testamento verdadeiro — ou ao ouvir que o grupo descobriu a fraude — relaxa completamente.",
          resolution: "Combater (Espectro Faminto Dif.2, muito difícil sem magia): ele se reconstitui. Apresentar o testamento verdadeiro: o fantasma descansa e abençoa o grupo. Voltar ao tabelião com a fraude: o sobrinho é preso."
        },
        enemies: [{ name: "Fantasma de Vernes (se atacado)", qty: 1, diff: 2 }]
      }
    ],
    npcs: [
      { name: "Tabelião Grenn", role: "Traiçoeiro parcial", personality: "Sabia da fraude, foi pago para ignorar. Fica nervoso ao ver o grupo retornar com informação." },
      { name: "Sobrinho Eredin", role: "Traiçoeiro", personality: "Confiante demais. Não esperava que a mansão 'estivesse ocupada por espírito inteligente'." }
    ],
    enemies_summary: [
      { name: "Plantas Carnívoras do Jardim", qty: 4, diff: 1 },
      { name: "Fantasma de Vernes (se combate)", qty: 1, diff: 2 }
    ],
    rewards: [
      { type: "item", desc: "A Mansão em si (testamento verdadeiro dá a Vernes quem ele quiser — ele doa ao grupo se ajudarem)" },
      { type: "moedas", desc: "100 moedas (tabelião) + conteúdo da mansão (estimativa: 200 moedas em objetos de valor)" },
      { type: "magia", desc: "Biblioteca de Vernes: 1d3 magias aleatórias de nível 1-3 nos grimórios" },
      { type: "benção", desc: "Bênção de Vernes: Sono Reparador permanente (o fantasma protege o sono dos que o ajudaram)" }
    ],
    master_notes: "A reviravolta do testamento é o coração da missão. Dê pistas cedo (sobrinho nervoso demais, tabelião desconfortável). A mansão como recompensa pode mudar a campanha inteiramente.",
    duration: "2 sessões"
  },

  {
    id: "m-arena-sangue",
    title: "A Arena de Sangue",
    difficulty: "normal",
    icon: "⚔",
    tags: ["arena", "combate", "social", "escolha"],
    hook: "O grupo é abordado por um representante do Lorde Marcino. Há uma arena de combate underground. 'Lutem por nós neste torneio — ou revelamos que vocês estão sendo procurados pelo xerife.' (Verdade ou blefe — Mestre decide.)",
    summary: "Três rodadas de arena com inimigos progressivos. Mas os outros lutadores não são todos inimigos — alguns são forçados como o grupo.",
    start: "Arena subterrânea. 200 espectadores. O grupo entra pela saída sul. Ao norte: a caixa do Lorde Marcino.",
    areas: [
      {
        name: "Rodada 1 — A Apresentação",
        description: "Dois mercenários contratados. Querem dinheiro, não morte — podem ser convencidos.",
        hex: {
          layout: "12x8", terrain: ["arena circular (sem obstáculos)", "areia (terreno normal)", "grades das bordas (paredes — sem saída)", "caixa do lorde (fora do campo — varanda ao norte)"],
          hint: "Rodada 1 é para o grupo se apresentar à plateia. Matança é mais aplaudida que rendição, mas rendição é possível."
        },
        enemies: [
          { name: "Mercenário de Elite", qty: 2, diff: 3 }
        ],
        npc: { name: "Mercenários (dupla)", role: "Neutro", personality: "Profissionais. Aceitem rendição se perceberem desvantagem. 'Não é pessoal.'" }
      },
      {
        name: "Rodada 2 — A Surpresa",
        description: "Anunciam um 'monstro especial'. É uma Quimera Jovem — mas ela parece ferida e assustada.",
        enemies: [{ name: "Quimera Jovem (ferida — 50% HP)", qty: 1, diff: 3, note: "Está sofrendo. Se o grupo não atacar e usar SAB (difícil), ela para de atacar e fica confusa." }],
        npc: { name: "Quimera (sem nome)", role: "Neutro/Vítima", personality: "Animal sofrendo. Se calmar: sente que o grupo não é ameaça. Se libertada: recompensa narrativa." }
      },
      {
        name: "Rodada 3 — O Campeão",
        description: "Golem de Pedra Antiga do Lorde. Mas o grupo pode descobrir o controle.",
        puzzle: {
          type: "Controle do Golem",
          description: "O Lorde usa um medalhão de ativação. INT (difícil) durante o combate: o grupo percebe que o Golem hesita toda vez que o Lorde se distrai (trocando de posição para mostrar). Com DEX (normal): pode roubar o medalhão de um dos capangas na borda.",
          solution: "Com o medalhão: o Golem para imediatamente. Sem: combate normal (Golem de Pedra Antiga Dif.2 mas com Def.7)."
        },
        enemies: [{ name: "Golem de Pedra Antiga", qty: 1, diff: 2 }]
      }
    ],
    npcs: [
      { name: "Lorde Marcino", role: "Traiçoeiro", personality: "Elegante e cruel. Aplaudiu a Quimera sofrendo. Tem informações valiosas sobre um item que o grupo pode querer." },
      { name: "Gerente da Arena (Piet)", role: "Benéfico secreto", personality: "Envergonhado com o que faz. Quer sair mas tem dívidas. Pode ajudar a criar saída se o grupo confiar nele." }
    ],
    enemies_summary: [
      { name: "Mercenário de Elite", qty: 2, diff: 3 },
      { name: "Quimera Jovem", qty: 1, diff: 3 },
      { name: "Golem de Pedra Antiga", qty: 1, diff: 2 }
    ],
    rewards: [
      { type: "moedas", desc: "200 moedas (prêmio do torneio) + apostas (se jogadores apostarem em si mesmos: 3x o valor)" },
      { type: "item", desc: "Armadura do Campeão (do campeão anterior no vestiário) — item mágico" },
      { type: "bonus", desc: "Reputação de arena — reconhecido em tavernas, +1d4 em interações com guerreiros e mercenários" },
      { type: "item", desc: "Medalhão do Golem (se roubado) — controla o Golem como aliado por 1 missão" },
      { type: "benção", desc: "Se libertarem a Quimera: Bênção de Lâmina Sagrada (energia da criatura nobre agradecida)" }
    ],
    master_notes: "A Quimera é o coração moral da missão. Lutadores que a poupam ganham o aplauso mais alto da plateia (inclusive bandidos têm coração). Marcino é vilão de campanha excelente.",
    duration: "2 sessões"
  },

  /* ══════════════════════════════════════════════════════
     DIFÍCEIS — Alto perigo, recompensas poderosas
     ══════════════════════════════════════════════════════ */
  {
    id: "m-torre-do-mago",
    title: "A Torre do Mago Louco",
    difficulty: "dificil",
    icon: "🗼",
    tags: ["dungeon", "puzzle", "armadilha", "magia"],
    hook: "A Torre de Eldrath ficou silenciosa há 1 mês. Antes, luzes coloridas apareciam toda noite. Agora: nada. A Academia de Magos oferece 300 moedas e acesso ao acervo de Eldrath para quem descobrir o que aconteceu.",
    summary: "Torre de 7 andares, cada um com um desafio mágico único criado pelo próprio Eldrath. No topo: Eldrath preso em seu próprio feitiço.",
    start: "A porta da torre está aberta. Cheiro de ozônio e algo queimado. No chão: um lenço de Eldrath e um bilhete 'NÃO ENTREM SEM PREPARAÇÃO'.",
    areas: [
      {
        name: "Andar 1 — O Espelho Infinito",
        description: "Sala com 12 espelhos. 11 mostram reflexo correto. 1 mostra reflexo atrasado.",
        puzzle: {
          type: "Espelho do Tempo",
          description: "O espelho atrasado mostra o que estava na sala 10 minutos atrás. Ao entrar, o grupo vê uma versão anterior deles mesmos tentando resolver o puzzle. A saída está bloqueada por um campo de força que só abre se alguém tocar o espelho atrasado ao mesmo tempo que seu reflexo toca.",
          solution: "Sincronizar o toque: esperar o reflexo levantar a mão, então tocar simultaneamente. Se não conseguirem: 1d4 espelhos criam cópias espectrais (Dif.1, HP 20, copiam os movimentos).",
          hint: "SAB (normal) percebe que o reflexo atrasado repete o padrão dos últimos 10 minutos continuamente."
        }
      },
      {
        name: "Andar 3 — O Labirinto de Gelo",
        description: "Sala coberta de gelo. Paredes de gelo se movem a cada 30 segundos.",
        hex: {
          layout: "10x10",
          terrain: ["paredes de gelo (se movem, redesenhe a cada rodada)", "plataforma central aquecida (segura)", "saída norte (muda de posição)"],
          hint: "AGI (normal) por rodada para não ficar preso quando as paredes movem. INT (difícil) para prever o padrão de movimento e chegar à saída em 3 rodadas sem erros."
        },
        trap: { name: "Parede de Gelo Móvel", trigger: "Ficar num hex quando a parede se move", effect: "1d8 de impacto + Preso sob o gelo (FOR difícil para sair, 1d6/rodada de frio)", detect: "Percepção (difícil) ouve o gelo rangendo 1 segundo antes." }
      },
      {
        name: "Andar 5 — A Câmara dos Elementos",
        description: "Quatro guardiões elementais: Fogo, Gelo, Trovão, Terra. Mas apenas um é real.",
        puzzle: {
          type: "Guardião Real",
          description: "Três são ilusões perfeitas. O real muda posição lentamente (as ilusões são perfeitas mas não se movem sozinhas entre os testes). INT (difícil) ou SAB (normal) ao observar por 1 rodada completa sem agir.",
          solution: "Atacar o real: ele combate de verdade (Elemental de Terra Dif.3). Atacar ilusão: ela desaparece mas se reconstitui na rodada seguinte. Quem identificar o real e oferecer um item de seu elemento (pedra para Terra): o elemental se curva e abre a passagem."
        },
        enemies: [{ name: "Elemental de Terra (o real)", qty: 1, diff: 3 }]
      },
      {
        name: "Andar 7 — Eldrath Aprisionado",
        description: "O velho mago está preso dentro de um cristal de magia que ele mesmo criou acidentalmente.",
        puzzle: {
          type: "Cristal de Aprisionamento",
          description: "O cristal responde a 5 toques específicos em sequência (como acordes). Eldrath, de dentro do cristal, pode murmurar a sequência mas sua voz está distorcida.",
          solution: "INT (difícil) para decifrar a sequência distorcida. Alternativa: a sequência está codificada nas notas de Eldrath espalhadas pelos andares anteriores (pistas que o Mestre planta nos puzzles anteriores). Toque errado: descarga de energia (2d8 em raio 2 hex)."
        },
        npc: { name: "Eldrath", role: "Benéfico", personality: "Humilhado mas grato. Ensina magias raras ao grupo como agradecimento. Não conta para ninguém como ficou preso." }
      }
    ],
    npcs: [
      { name: "Eldrath, Archmago", role: "Benéfico", personality: "Orgulhoso mas honesto. Cometeu erro e admite. Oferece aprendizado como recompensa." }
    ],
    enemies_summary: [
      { name: "Cópias Espectrais (andar 1)", qty: "1d4", diff: 1 },
      { name: "Elemental de Terra", qty: 1, diff: 3 },
      { name: "Guardião de Gelo (andar 3, se falhar 3+ vezes)", qty: 1, diff: 2 }
    ],
    rewards: [
      { type: "magia", desc: "Eldrath ensina 2 magias de nível 4-5 à escolha do grupo (de seu acervo pessoal)" },
      { type: "item", desc: "Varinha de Eldrath (item lendário — +1d10 em ataques de magia, +2 Slots temporários/combate)" },
      { type: "moedas", desc: "300 moedas (Academia) + acervo de Eldrath (livros raros, componentes — valor 500 moedas em ingredientes)" },
      { type: "benção", desc: "Bênção de Canal de Mana Pura (Eldrath abençoa os conjuradores do grupo)" }
    ],
    master_notes: "Use os puzzles como oportunidade para mostrar que INT e SAB valem tanto quanto combate. Eldrath é ótimo como mentor de campanha longa — conhece história do mundo profundamente.",
    duration: "3 sessões"
  },

  {
    id: "m-fissura-corrompida",
    title: "Descida à Fissura Corrompida",
    difficulty: "dificil",
    icon: "🌋",
    tags: ["dungeon", "corrompido", "Deus Marcado", "armadilha", "boss"],
    hook: "Uma fissura abriu no campo a 2 dias da cidade. Dela saem criaturas corrompidas toda noite. A cidade tem 5 dias antes de ser invadida em massa. 'Alguém precisa descer e selar a fonte.'",
    summary: "Fissura de 4 níveis que vai se aprofundando em corrupção do Deus Marcado. No fundo: um fragmento físico da Marca que precisa ser destruído ou contido.",
    start: "A fissura tem 3 metros de diâmetro. Cheiro de enxofre e algo doce/podre ao mesmo tempo. Sons metálicos de baixo.",
    areas: [
      {
        name: "Nível 1 — Borda da Fissura",
        description: "Pedras flutuando. Gravidade levemente errada. Sombras se movem contra a luz.",
        trap: { name: "Campo de Corrupção", trigger: "Qualquer personagem com maldição ativa entra no campo", effect: "A maldição se intensifica: efeitos dobrados por 1 hora. Sem maldição: teste SAB (normal) ou ganha Pesadelo Perpétuo como maldição temporária (1 sessão).", detect: "Clérigo percebe automaticamente. Outros: SAB (difícil)." },
        enemies: [
          { name: "Urso Corrompido pela Marca", qty: 1, diff: 3 },
          { name: "Zumbi Abissal", qty: 2, diff: 3 }
        ]
      },
      {
        name: "Nível 2 — Câmara dos Sussurros",
        description: "Paredes que sussurram memórias. Cada personagem ouve sua pior memória.",
        puzzle: {
          type: "Câmara dos Ecos",
          description: "A câmara usa memórias para paralisar. Cada personagem testa SAB (difícil) ou fica Paralisado por 2 rodadas (ouvindo a memória). O puzzle: as vozes são vulneráveis a som real — cantar, gritar, fazer barulho físico interrompe a câmara por 3 rodadas.",
          solution: "Fazer barulho coletivo (todos na rodada usam Ação para fazer som): a câmara fica muda por 3 rodadas, permitindo passagem. Alternativa: Clérigo usa Luz Sagrada para purificar (cancela completamente)."
        },
        npc: { name: "Espírito Aprisionado (na câmara)", role: "Benéfico", personality: "Alma presa pela Marca há décadas. Se libertada (Clérigo usa Drenar Corrupção ou equivalente): dá informação sobre o Fragmento no fundo e ponto fraco do Golem da Marca." }
      },
      {
        name: "Nível 3 — Campo de Batalha Corrompido",
        description: "Soldados mortos de batalha antiga se levantam em loop. O campo se regenera.",
        hex: {
          layout: "14x10",
          terrain: ["cadáveres espalhados (mortos-vivos emergem dos hexes marcados — 1 por rodada)", "coluna central corrompida (fonte da regeneração)", "saída sul (passagem estreita, 2 hexes de largura)", "área de cristal da Marca (hexes 7,5 e 7,6 — campo de força)"],
          hint: "Destruir a Coluna Central (HP 40, Def 5) para a regeneração. Sem isso: novos mortos-vivos surgem infinitamente."
        },
        enemies: [
          { name: "Cavaleiro Esquelético", qty: 2, diff: 3 },
          { name: "Esqueleto Guerreiro", qty: "infinito (mas para se coluna for destruída)", diff: 1 }
        ]
      },
      {
        name: "Nível 4 — O Fragmento da Marca",
        description: "Câmara final. O Fragmento: cristal negro do tamanho de uma cabeça, pulsando. O Golem da Marca guarda.",
        enemies: [
          { name: "Golem da Marca", qty: 1, diff: 4, note: "Boss do nível. Núcleo vulnerável no peito (−2 acerto para mirar, dano duplo)." }
        ],
        puzzle: {
          type: "Selamento do Fragmento",
          description: "O Fragmento não pode ser destruído por meios físicos. Opções: (1) Clérigo usa Ritual de Purificação (3 rodadas de concentração enquanto outros defendem), (2) qualquer personagem usa item sagrado de qualquer divindade (o item é destruído), (3) um personagem se une ao Fragmento voluntariamente — elimina o Fragmento mas aplica Maldição 'Olhar do Deus Marcado' permanentemente.",
          solution: "Todas as três opções funcionam com consequências diferentes. O Mestre nunca diz qual é 'certa'."
        }
      }
    ],
    npcs: [
      { name: "Espírito Aprisionado", role: "Benéfico", personality: "Calmo e triste. Agradece a libertação com informação crucial." },
      { name: "Aralto da Marca (chega no fim)", role: "Traiçoeiro", personality: "Surge quando o grupo sela o Fragmento. 'Interessante. Vocês destruíram meses de trabalho. Nos encontraremos de novo.'" }
    ],
    enemies_summary: [
      { name: "Urso Corrompido", qty: 1, diff: 3 },
      { name: "Zumbi Abissal", qty: 2, diff: 3 },
      { name: "Cavaleiro Esquelético", qty: 2, diff: 3 },
      { name: "Golem da Marca", qty: 1, diff: 4 }
    ],
    rewards: [
      { type: "item", desc: "Cristal da Marca (se não destruído) — pode ser item de quest ou material para arma anti-corrupção" },
      { type: "moedas", desc: "300 moedas da cidade + propriedades confiscadas dos corrompidos (valor 200)" },
      { type: "magia", desc: "Espírito liberto ensina Drenar Energia ou Forma Lich Parcial (habilidade de subclasse como magia)" },
      { type: "maldição", desc: "Quem selou voluntariamente: Maldição 'Olhar do Deus Marcado' (poderosa) — pode ser quest de campanha para remover" },
      { type: "benção", desc: "Quem purou com item sagrado e perdeu: Bênção 'Escolhido da Divindade' (a divindade reconhece o sacrifício)" }
    ],
    master_notes: "Esta missão muda a campanha. O Aralto no final é o vilão principal se o Mestre quiser. O Fragmento destruído ou contido tem consequências mundiais. Prepare o que vem depois.",
    duration: "3-4 sessões"
  },

  {
    id: "m-dragao-do-norte",
    title: "O Dragão do Norte",
    difficulty: "dificil",
    icon: "🐉",
    tags: ["dragão", "diplomacia", "armadilha", "escolha moral"],
    hook: "O Dracônico Vermelho Tharak tomou o Forte do Norte. 40 soldados dentro, 200 civis evacuados mas sem comida. 'Matem o dragão' — diz o General. 'Tharak está doente e assustado' — diz um sobrevivente que fugiu.",
    summary: "Negociação ou confronto com um dracônico maior que está doente e em pânico, não malévolo. O 'vilão' é uma vítima.",
    start: "Forte do Norte: portal destruído. Sons de metal amassado. Um rugido ocasional. Os soldados dentro estão vivos — Tharak os prendeu mas não os matou.",
    areas: [
      {
        name: "Pátio Externo",
        description: "Escombros de torres. Dracônicos Menores (filhotes de Tharak) patrulham nervosamente.",
        npc: { name: "Filhotes de Tharak (3)", role: "Neutro", personality: "Assustados. Protetores. Atacam se ameaçados mas fogem se Tharak ordenar. Podem ser acalmados com DEX (normal) e comida." },
        enemies: [{ name: "Dracônico Menor", qty: 3, diff: 3, note: "Fogem com 40% HP — filhotes, não guerreiros" }]
      },
      {
        name: "Grande Salão (Interior)",
        description: "Tharak enrolado ao redor dos soldados como 'proteção' (do ponto de vista dele). Os soldados discordam.",
        puzzle: {
          type: "Negociação com o Dragão",
          description: "Tharak fala. Está doente — escamas caindo, olhos amarelos. 'Os humanos trouxeram a doença. Eu preciso deles para quando eu morrer — os filhotes precisam de proteção.' É tragicamente equivocado.",
          solution: "SAB (difícil) + explicação: a doença não é dos soldados (é mágica — rastreável à Fissura Corrompida). Se o grupo prometer tratar Tharak E proteger os filhotes, ele libera todos. Combate: Tharak doente ainda é Dif.5."
        },
        npc: { name: "Tharak, Dracônico Vermelho", role: "Neutro/Trágico", personality: "Pai assustado. Mal-entendeu tudo. Está sofrendo. A raiva é medo disfarçado." }
      },
      {
        name: "Câmara do Tesouro",
        description: "Tharak abre voluntariamente se o grupo ajudá-lo. 'Tome o que precisar. Os filhotes não precisarão disso se estiverem seguros.'",
        trap: { name: "Armadilha de Honra", trigger: "Pegar mais do que Tharak ofereceu", effect: "Tharak sente (percepção dracônica infalível). Negociação quebra. Combate imediato com Tharak furioso (+2d8 de dano por traição).", detect: "Não tem como detectar — é uma escolha moral, não uma armadilha física." }
      }
    ],
    npcs: [
      { name: "Tharak", role: "Neutro (torna-se aliado se ajudado)", personality: "O 'monstro' da missão que é apenas um pai doente e assustado." },
      { name: "Capitão Vrenn (soldado preso)", role: "Benéfico", personality: "Quer matar Tharak. Mas mudará de ideia se o grupo encontrar solução pacífica. Pode tornar-se aliado militar." },
      { name: "General (via mensageiro)", role: "Traiçoeiro parcial", personality: "Quer vitória militar. Se o grupo resolver pacificamente, ele não paga o bônus mas não pode recusar a recompensa básica." }
    ],
    enemies_summary: [
      { name: "Dracônico Menor (filhotes)", qty: 3, diff: 3 },
      { name: "Tharak (se combate)", qty: 1, diff: 5, note: "Doente — 70% das estatísticas normais. Ainda devastador." }
    ],
    rewards: [
      { type: "item", desc: "Escama de Tharak (doada voluntariamente) — material lendário para armadura com resistência a fogo" },
      { type: "item", desc: "Tesouro de Tharak (com permissão): 3 itens raros à escolha do Mestre + 500 moedas em ouro antigo" },
      { type: "bonus", desc: "Tharak curado = aliado permanente de campanha (dracônico adulto deve favores ao grupo)" },
      { type: "benção", desc: "Bênção 'Sangue de Herói' (divindades notam o ato de compaixão épico)" },
      { type: "maldição", desc: "Se matarem Tharak: os filhotes fogem. Em 6 meses de campanha: voltam adultos para vingança." }
    ],
    master_notes: "Esta missão exige que os jogadores resistam ao impulso de matar. Dê a Tharak uma personalidade rica — mostre as escamas caindo, a tosse ocasional, o olhar nos filhotes. A tragédia humaniza o monstro.",
    duration: "2-3 sessões"
  }
,

  /* ══════════════════════════════════════════════════════
     NOVAS MISSÕES FÁCEIS
     ══════════════════════════════════════════════════════ */

  {
    id: "m-rival-arqueiro",
    title: "O Duelo do Arqueiro",
    difficulty: "facil",
    icon: "🏹",
    tags: ["competição", "social", "habilidade"],
    hook: "Um arqueiro bêbado na taverna desafiou o grupo: 'Aposto 30 moedas que nenhum de vocês acerta 3 alvos consecutivos a 15 passos enquanto eu canto desafinado.' Simples. Exceto que ele é o Campeão Regional de Tiro ao Alvo.",
    summary: "Competição de habilidade que esconde um segredo: o arqueiro está arruinado e precisa desesperadamente perder para pagar uma dívida com o crime organizado.",
    start: "A taverna se esvaziou para ver. 5 alvos de madeira foram erguidos no pátio. O arqueiro sourri — sobrancelhas levantadas.",
    areas: [
      {
        name: "Rounds de Classificação",
        description: "Três rounds: tiro parado, tiro em movimento, tiro de olhos vendados. O arqueiro acerta todos com facilidade provocativa.",
        puzzle: {
          type: "Padrão de Fraqueza",
          description: "SAB ou Percepção (normal) após o 1º round: o arqueiro gela levemente quando mira o alvo mais à direita. INT (difícil) conecta: ele está deliberadamente errando o terceiro alvo por 1 milímetro — parece acerto mas pontuação menor.",
          solution: "Confrontar discretamente (SAB difícil): ele admite a situação da dívida. Pode ser aliado se o grupo o ajudar com o crime organizado depois."
        }
      },
      {
        name: "Round Final — A Provocação",
        description: "O NPC dos Cobradores chega durante o round final e senta na primeira fila, olhando fixo pro arqueiro.",
        npc: {
          name: "Cobrador Mors",
          role: "Traiçoeiro",
          personality: "Silencioso. Carrasco de bolso. A presença dele deixa o arqueiro em pânico visível se o grupo prestar atenção."
        }
      }
    ],
    npcs: [
      { name: "Arqueiro Campeão Vael", role: "Benéfico (se ajudado)", personality: "Orgulhoso mas desesperado. Tem medo mas não pede ajuda — recusa é cultural." },
      { name: "Cobrador Mors", role: "Traiçoeiro", personality: "Trabalha para a Guilda das Sombras. Não ameaça abertamente — só aparece." }
    ],
    enemies_summary: [
      { name: "Cobrador Mors + 2 capangas (se provoc.)", qty: 3, diff: 2 }
    ],
    rewards: [
      { type: "moedas", desc: "30 moedas da aposta + 50 se ajudarem Vael com a dívida (ele paga o que pode)" },
      { type: "pericia", desc: "Vael ensina Pontaria Avançada — +1d4 em ataques à distância (treino de 1 semana)" },
      { type: "item", desc: "Arco de Vael (item mágico, raro) — se ele abandonar a competição por gratidão" },
      { type: "bonus", desc: "Contato na Guilda das Sombras (Mors pode ser subornado por informação futura)" }
    ],
    master_notes: "O duelo em si é resolvido por rolagem de DEX/AGI. O drama está na percepção do esquema de Vael. Um grupo que só luta vai ganhar a aposta mas perder a história.",
    duration: "1 sessão curta"
  },

  {
    id: "m-formiga-gigante",
    title: "O Formigueiro Debaixo da Cidade",
    difficulty: "facil",
    icon: "🐜",
    tags: ["dungeon-pequeno", "armadilha", "natureza"],
    hook: "O piso da padaria cedeu durante a madrugada. Embaixo: um formigueiro gigantesco de formigas do tamanho de cachorros. A padeira está presa no porão rodeada de formigas que, estranhamente, não a atacaram ainda.",
    summary: "Formigueiro subterrâneo com rainha que foi perturbada por construção. As formigas defendem — não atacam por natureza. Solução violenta e pacífica disponíveis.",
    start: "Buraco de 1,5m no piso da padaria. Escada improvisada. Sons de mandíbulas clicando abaixo.",
    areas: [
      {
        name: "Túneis Superiores",
        hex: {
          layout: "8x6",
          terrain: ["túneis de terra (teto baixo — criaturas grandes têm −1 Ação)", "câmara de ovos (3x3, intocáveis — provocar = todas as formigas atacam)", "saída norte (bloqueada por rainha)"],
          hint: "Formigas não atacam quem não ameaçar ovos. Mover devagar (metade do Movimento) não as provoca."
        },
        enemies: [{ name: "Formiga Gigante (defensiva)", qty: 4, diff: 1, note: "Só atacam se ameaçadas ou se alguém tocar nos ovos" }]
      },
      {
        name: "Câmara da Rainha",
        description: "A padeira sentada numa pedra com formigas ao redor — mas nenhuma tocou nela. A rainha gigante observa o grupo.",
        puzzle: {
          type: "Comunicação com a Rainha",
          description: "A rainha não é agressiva — ela está esperando. SAB (difícil) ou Druida automaticamente: a rainha quer comida. A construção acima destruiu seus caminhos de forrageamento. Ela está com fome.",
          solution: "Trazer comida abundante (qualquer alimento do inventário × 5 itens): a rainha aceita, abre passagem para a padeira sair e migra o formigueiro para o jardim externo em 3 dias. Combate: matar a rainha dispersa o formigueiro mas destrói o porão."
        },
        npc: { name: "Padeira Elma", role: "Benéfica", personality: "Assustada mas calma. Descobriu que as formigas a respeitas e ficou curiosa — nunca foi atacada." }
      }
    ],
    npcs: [
      { name: "Padeira Elma", role: "Benéfica", personality: "Grãs pancada com insetos desde criança. Ficou fascinada em vez de em pânico. Recompensa generosamente." }
    ],
    enemies_summary: [
      { name: "Formiga Gigante da Caverna", qty: "4-8", diff: 1, note: "Só atacam se provocadas" },
      { name: "Rainha das Formigas (se combate)", qty: 1, diff: 2 }
    ],
    rewards: [
      { type: "item", desc: "Mel de Formiga Gigante (5 frascos) — ingrediente alquímico raro (+1d6 em poções de cura se usado)" },
      { type: "moedas", desc: "25 moedas (Elma) + pão grátis para sempre na padaria" },
      { type: "bonus", desc: "Se resolução pacífica: Rainha deixa 1 formiga bebê como 'presente' — familiar exótico inofensivo que detecta venenos" },
      { type: "pericia", desc: "Druida ou quem comunicou com a rainha: aprende Comunicação com Insetos (habilidade narrativa única)" }
    ],
    master_notes: "Missão de surpresa — a ameaça não é real se o grupo não agir como predador. Elma sentada cercada de formigas sem medo é uma imagem forte de abertura.",
    duration: "1 sessão curta"
  },

  {
    id: "m-ator-e-ladrao",
    title: "O Ator e o Ladrão",
    difficulty: "facil",
    icon: "🎭",
    tags: ["social", "investigação", "stealth", "comédia"],
    hook: "O anel de noivado do nobre Aldric foi roubado durante a peça de teatro que ele financiou. 200 pessoas assistiam. O diretor está histérico. 'Era a única cópia!' (Mentira — mas ele acredita.)",
    summary: "Investigação nos bastidores de um teatro onde todos têm motivo, alibi e drama excessivo. O ladrão é o ator principal, mas por razão simpática.",
    start: "Palco vazio. Camarim com atores gritando uns com os outros. O segurança bloqueou todas as saídas.",
    areas: [
      {
        name: "Palco e Plateia",
        description: "200 testemunhas que viram 'tudo' e se contradizem completamente.",
        puzzle: {
          type: "Triangulação de Testemunhos",
          description: "5 testemunhos que o grupo precisa filtrar: (1) nobre distraído, (2) criança que realmente viu, (3) rival do nobre mentindo, (4) atriz apaixonada pelo ladrão cobrindo, (5) segurança que dormiu.",
          solution: "INT (normal) compara os 5 relatos: só a criança e o segurança (que acordou na hora certa) têm relatos consistentes. Direção: bastidor esquerdo durante o ato 2."
        }
      },
      {
        name: "Camarim do Ator Principal",
        description: "Ator Draven está se maquiando para 'segunda peça'. DEX (normal) nota algo quadrado na pochete do figurino.",
        npc: {
          name: "Draven, o Ator",
          role: "Traiçoeiro (com motivo simpático)",
          personality: "Dramático mesmo quando culpado. 'Você não entende! O anel pertencia à minha mãe — o nobre a roubou há 20 anos!'",
          resolution: "Verificar: INT (difícil) ou encontrar evidências no camarim — o anel tem o brasão da família de Draven gravado por dentro. O nobre é que roubou primeiro."
        }
      }
    ],
    npcs: [
      { name: "Draven, o Ator", role: "Ambíguo", personality: "Ladrão tecnicamente, vítima historicamente. A moral é do grupo." },
      { name: "Nobre Aldric", role: "Traiçoeiro disfarçado de vítima", personality: "Confiante demais. Fica nervoso ao ver o anel ser examinado de perto." },
      { name: "Criança Testemunha", role: "Benéfica", personality: "Única testemunha honesta. Diz exatamente o que viu sem rodeios." }
    ],
    enemies_summary: [],
    rewards: [
      { type: "moedas", desc: "50 moedas do nobre (se entregarem o anel) OU 30 moedas de Draven (se ficarem com ele — tudo que tem)" },
      { type: "item", desc: "Anel da Família Draven (item único narrativo) — história de campanha se investigado" },
      { type: "bonus", desc: "Draven grato: ingresso vitalício + pode ensinar Disfarce como perícia" },
      { type: "bonus", desc: "Nobre Aldric como inimigo (se exposto) — vilão social menor de campanha" }
    ],
    master_notes: "Sem combate. Investigação pura. O momento de revelar a gravação interna do anel é o clímax. Deixe a moral com os jogadores — não há resposta certa.",
    duration: "1 sessão"
  },

  /* ══════════════════════════════════════════════════════
     NOVAS MISSÕES NORMAIS
     ══════════════════════════════════════════════════════ */

  {
    id: "m-mercado-negro",
    title: "O Mercado das Sombras",
    difficulty: "normal",
    icon: "🌑",
    tags: ["infiltração", "social", "stealth", "crime"],
    hook: "Um boticário foi sequestrado por tentar vender ervas proibidas no mercado negro local. Sua filha pede ajuda: 'Ele foi idiota mas não merece morrer. Entrem, negociem, tirem ele de lá.' O mercado funciona no subsolo do porto toda madrugada.",
    summary: "Infiltração no mercado negro controlado pela Guilda das Sombras. Múltiplas rotas, disfarce necessário, e a descoberta de que o boticário estava sendo extorquido, não voluntário.",
    start: "Doca sul. Madrugada. Uma senha precisam obter de qualquer informante da cidade (Persuasão normal) ou observando por 1 hora.",
    areas: [
      {
        name: "Entrada do Mercado",
        description: "Dois guardas com lanterna. Senha verbal + reconhecimento de rosto (ou disfarce).",
        trap: { name: "Vigia no Telhado", trigger: "Tentar entrar sem senha ou aparecer suspeito", effect: "Apito de alerta — 4 guardas da Guilda chegam em 2 rodadas (Mercenários Dif.3)", detect: "Percepção (difícil) vê sombra no telhado antes de entrar." }
      },
      {
        name: "Salão Principal",
        hex: {
          layout: "12x8",
          terrain: ["barracas de venda (cobertura)", "saída de emergência (nordeste, trancada)", "escada para cela (sul)", "vigia central no mezanino (visão total)"],
          hint: "O vigia no mezanino tem visão de 80% do salão. Furtividade só é possível perto das barracas. Disfarce eliminadas as restrições de movimento."
        },
        npc: {
          name: "Mestra Korin — líder do mercado",
          role: "Traiçoeiro (razoável)",
          personality: "Pragmática. Não mata sem necessidade — só quando é negócio. Ouve propostas de negócio.",
          resolution: "Pagar resgate (80 moedas), negociar serviço futuro (missão secundária para Guilda), ou roubar a chave da cela (DEX difícil, detectável)."
        }
      },
      {
        name: "Cela do Boticário",
        description: "Alquimista Fenn está furioso — não assustado. 'Eles me forçaram! Três meses de extorsão!'",
        npc: {
          name: "Alquimista Fenn",
          role: "Benéfico (inocente do crime que pensa)",
          personality: "Arrogante, orgulhoso, mas genuinamente vítima. Tem informações sobre outros negócios da Guilda que podem ser leverage."
        }
      }
    ],
    npcs: [
      { name: "Mestra Korin", role: "Ambígua", personality: "Vilã funcional. Pode ser aliada se o grupo provar valor. Nunca pessoal." },
      { name: "Alquimista Fenn", role: "Benéfico", personality: "Muito orgulhoso para agradecer adequadamente. Dívida enorme que expressam mal." }
    ],
    enemies_summary: [
      { name: "Guardas da Guilda (se alertados)", qty: 4, diff: 2 },
      { name: "Mercenário de Elite (guarda de Korin)", qty: 2, diff: 3 }
    ],
    rewards: [
      { type: "item", desc: "Poção de Invisibilidade (Fenn cria como agradecimento, 1 hora de duração) — Mágico" },
      { type: "item", desc: "Kit de Ferramentas de Arrombamento (da Guilda, roubável) — DEX +1d4 em arrombamento" },
      { type: "bonus", desc: "Contato na Guilda das Sombras (Korin, se negociado) — informação sobre contratos e movimentos criminosos" },
      { type: "moedas", desc: "60 moedas da filha de Fenn + desconto permanente de 40% na botica de Fenn" },
      { type: "maldição", desc: "Se Korin for traída após acordo: Maldição do Azar Acumulado (Guilda tem feiticeiros)" }
    ],
    master_notes: "Missão de infiltração. Enfatize que violência atrai mais guardas. Korin é excelente NPC recorrente — pragmática o suficiente para ser tanto aliada quanto inimiga.",
    duration: "2 sessões"
  },

  {
    id: "m-crianca-perdida",
    title: "A Criança que Falava com Pedras",
    difficulty: "normal",
    icon: "🪨",
    tags: ["investigação", "magia", "emocional", "morto-vivo"],
    hook: "Uma criança de 8 anos desapareceu nas ruínas fora da cidade. Seus pais dizem que ela 'ouvia vozes das pedras' desde que acharam um cristal brilhante no campo. Dois dias desaparecida.",
    summary: "A criança foi atraída por um Elemental de Terra benevolente que encontrou o cristal. Mas as ruínas têm outros habitantes que não são benevolentes.",
    start: "Ruínas de fortaleza élfica. 200 anos abandonada. Pedras que parecem arrumar-se sozinhas quando ninguém olha diretamente.",
    areas: [
      {
        name: "Jardim das Ruínas",
        description: "Pegadas infantis na lama. Mas também marcas de arasto que desaparecem — como se algo muito pesado tivesse sido movido.",
        trap: { name: "Pedra Rolante Mágica", trigger: "Correr pelas ruínas sem observar", effect: "Pedra que se move autonomamente: 1d8 de impacto + Derrubado. Pode ser evitada: AGI normal após Percepção (normal) que alerta.", detect: "Percepção (normal): as pedras têm padrão de movimento — se movem quando não há ameaça, param quando há." }
      },
      {
        name: "Câmara Central (Subterrânea)",
        description: "A criança Mira sentada numa pedra, conversando animadamente com... uma rocha enorme que oscila levemente.",
        npc: {
          name: "Terrox — Elemental de Terra Jovem",
          role: "Benéfico",
          personality: "Curioso sobre humanos. Encontrou Mira e a trouxe para 'mostrar as ruínas'. Não sabia que isso seria problema. Gentil mas enorme.",
          resolution: "SAB (normal): ele está assustado com o grupo armado. Aproximar sem armas e sentar (DEX normal para se conter) permite conversa. Terrox devolve Mira feliz e oferece presente."
        },
        enemies: [{ name: "Terrox (se atacado)", qty: 1, diff: 3, note: "Só ataca em defesa de Mira ou de si mesmo" }]
      },
      {
        name: "Galeria Norte (Caminho de Volta)",
        description: "Zumbis de soldados élficos da época da queda se levantam ao som de passos — eram guardiões.",
        hex: {
          layout: "10x6",
          terrain: ["pilares élficos (cobertura pesada)", "chão em colapso (3 hexes — 1d6 cair se pisar, AGI normal)", "saída (nordeste)"],
          hint: "Terrox pode abrir um caminho alternativo pelo chão se o grupo tiver sua confiança — ele simplesmente escava."
        },
        enemies: [
          { name: "Esqueleto Guerreiro", qty: 3, diff: 1 },
          { name: "Zumbi Comum", qty: 2, diff: 1 }
        ]
      }
    ],
    npcs: [
      { name: "Mira, a Criança", role: "Benéfica", personality: "Não tem medo de nada. Vai explicar que 'o Terrox é legal' e ficar brava se o grupo for indelicado com ele." },
      { name: "Terrox, Elemental de Terra", role: "Benéfico", personality: "Como uma criança enorme feita de pedra. Aprendeu 3 palavras em comum. Aprende rápido se alguém tiver paciência." }
    ],
    enemies_summary: [
      { name: "Esqueleto Guerreiro", qty: 3, diff: 1 },
      { name: "Zumbi Comum", qty: 2, diff: 1 },
      { name: "Terrox (somente se atacado)", qty: 1, diff: 3 }
    ],
    rewards: [
      { type: "item", desc: "Cristal de Terrox (presente) — Pedra de Alma: +5 HP máximo, em terreno natural regen 1 HP/turno" },
      { type: "moedas", desc: "40 moedas dos pais de Mira (tudo que tinham)" },
      { type: "bonus", desc: "Terrox como aliado narrativo — pode ser convocado 1x por mês para ajuda em terreno natural (cava, move pedras, informa sobre subterrâneos)" },
      { type: "benção", desc: "Bênção Vigor Abençoado (Thurgomur aprecia quem respeita elementais de terra)" }
    ],
    master_notes: "A emoção do encontro com Terrox é o coração. Faça-o se comunicar com gestos e palavras truncadas antes de melhorar ao longo da conversa. Mira 'traduzindo' é hilária.",
    duration: "1-2 sessões"
  },

  {
    id: "m-navio-fantasma",
    title: "O Navio Sem Tripulação",
    difficulty: "normal",
    icon: "⛵",
    tags: ["naval", "morto-vivo", "puzzle", "assombrado"],
    hook: "Um navio mercante entrou no porto sem velas abertas e sem ninguém no convés. A carga está intacta. Os camarotes estão trancados por dentro. Ninguém ouviu nada durante a noite. As autoridades do porto pedem investigação antes de tocar no navio.",
    summary: "Navio assombrado onde a tripulação foi transformada em espíritos pela magia de uma Caixa de Música amaldiçoada no porão. A música os prendeu mas também os protegeu de algo pior.",
    start: "Cais 7. Navio de 30 metros. Cheiro de sal e algo mais — flores? À noite. O convés está perfeitamente limpo.",
    areas: [
      {
        name: "Convés Principal",
        description: "Tudo no lugar. Nenhum sinal de luta. Mas a bússola gira sozinha.",
        puzzle: {
          type: "Bússola do Destino",
          description: "A bússola não aponta para o norte — aponta para o porão. INT (normal): é uma bússola mágica sintonizada com magia, não com norte magnético.",
          solution: "Seguir a bússola leva ao porão em vez dos camarotes — atalho para a fonte do problema."
        }
      },
      {
        name: "Camarotes (Andares Inferiores)",
        description: "Trancados por dentro. Gritos abafados? Não — é música? Ao forçar entrada: camarote vazio mas a cama está feita como se alguém levantou há pouco.",
        npc: {
          name: "Espíritos da Tripulação (12 membros)",
          role: "Benéfico (desesperado)",
          personality: "Presos na forma de sussurros. Aparecem como sombras translúcidas ao por do sol. Tentam comunicar: 'Porão. Música. Não parem a música ainda.'",
          resolution: "SAB (normal): entender o aviso. A música está os mantendo presos mas também mantendo algo PIOR selado no porão junto com eles."
        }
      },
      {
        name: "Porão do Navio",
        description: "A Caixa de Música: pequena, prata, toca uma melodia de ninar eternamente. Ao redor: marcas de garras no assoalho — antigas, de uma criatura que tentou sair.",
        puzzle: {
          type: "A Escolha da Caixa",
          description: "Parar a música: tripulação é libertada MAS a criatura no espaço entre os mundos também é. Deixar tocando: tripulação fica presa eternamente. Terceira opção: Bardo ou conjurador pode reprogramar a melodia (SAB crítico) para prender apenas a criatura e liberar a tripulação.",
          solution: "Parar: combate com Banshee (o que estava preso). Reprogramar: SAB crítico + 3 rodadas de concentração enquanto os espíritos ajudam defendendo. Deixar: missão fracassa moralmente."
        },
        enemies: [{ name: "Banshee (se música parada sem reprogramar)", qty: 1, diff: 4 }]
      }
    ],
    npcs: [
      { name: "Capitã Voss (espírito)", role: "Benéfica", personality: "Autoritária mesmo como sombra translúcida. 'Resolvam isso. Temos carga para entregar.'" }
    ],
    enemies_summary: [
      { name: "Banshee (condicional)", qty: 1, diff: 4 },
      { name: "Espíritos Hostis (se música parada sem cuidado)", qty: "1d4", diff: 1 }
    ],
    rewards: [
      { type: "item", desc: "Caixa de Música Reprogramada (Mágico) — pode ser usada 1x/dia para criar área de silêncio 5x5 hex por 3 rodadas" },
      { type: "item", desc: "Carga do navio (liberada pela Capitã Voss): especiarias e tecidos raros, valor 200 moedas" },
      { type: "bonus", desc: "Capitã Voss (liberta) como contato naval — acesso a rotas e transporte marítimo" },
      { type: "magia", desc: "Reprogramar a Caixa ensina ao Bardo/conjurador Aprisionamento Sônico (nova magia nível 3)" }
    ],
    master_notes: "A escolha da caixa é o coração. Deixe os espíritos da tripulação darem pistas, não respostas. A Banshee presa é uma ameaça genuína — reforce isso com as marcas de garras.",
    duration: "2 sessões"
  },

  {
    id: "m-olimpiadas-goblins",
    title: "As Olimpíadas dos Goblins",
    difficulty: "normal",
    icon: "🏆",
    tags: ["competição", "social", "comédia", "habilidade"],
    hook: "A Chefia Goblin enviou pergaminho formal (com muitos erros ortográficos) convidando representantes humanos para 'As Olimpíadas Sagradas de Tobi'. Participar é diplomaticamente importante — os goblins controlam a única ponte entre duas regiões. Ganhar é opcional. Sobreviver às provas é recomendado.",
    summary: "Festival de provas físicas e de habilidade criado por goblins, para goblins, com regras que mudam quando os goblins estão perdendo. Diplomacia e humor são mais úteis que força.",
    start: "Aldeia goblin decorada com bandeirolas de tecido roubado. 300 goblins nas arquibancadas. Música de flauta desafinada. O árbitro é um goblin de 1 metro usando chapéu de mago roubado.",
    areas: [
      {
        name: "Prova 1 — Corrida do Lodo",
        hex: {
          layout: "14x4",
          terrain: ["lodo (4 hexes centrais — movimento pela metade)", "trampolim goblin (hex 3,2 — lança 3 hexes para frente)", "armadilha de rede (hex 10 — AGI normal ou Preso)", "linha de chegada (hex 14)"],
          hint: "Os corredores goblins trapaceiam abertamente — empurram, usam atalhos, jogam lodo. O árbitro ignora. A plateia aplaude trapaças goblins e vaia trapaças humanas. DEX/AGI contest."
        }
      },
      {
        name: "Prova 2 — Lançamento de Tobi",
        description: "Lançar uma estátua de Tobi (de barro, 2kg) o mais longe possível. Simples. Exceto que a estátua morde.",
        trap: { name: "Tobi Morde", trigger: "Pegar a estátua sem luvas", effect: "Mordida: 1d4 de dano e −1d4 na rolagem de lançamento (surpresa). Luvas: sem penalidade.", detect: "Percepção (fácil): a estátua está olhando diferente a cada vez que você olha para ela." }
      },
      {
        name: "Prova Final — Charada do Rei",
        description: "O Rei Goblin Zikzik faz uma charada. 'O que é meu mas vocês usam mais do que eu?' — pausa dramática enorme — '...Meu nome! HA!'",
        puzzle: {
          type: "Charada Goblin",
          description: "O rei continua com 3 charadas progressivamente mais absurdas. A última não tem resposta certa — ele muda a resposta dependendo de quão bem recebida for.",
          solution: "INT (normal) percebe que Zikzik quer aprovação, não resposta certa. Rir na hora certa (SAB normal) ou elogiar a charada (Persuasão normal) faz ele declarar vitória partilhada."
        },
        npc: { name: "Rei Zikzik", role: "Benéfico (se bem-humorado)", personality: "Orgulhoso, barulhento, genuinamente quer que a cerimônia seja boa. Detesta perder mas ama uma boa festa." }
      }
    ],
    npcs: [
      { name: "Rei Zikzik", role: "Benéfico (com cautela)", personality: "Muda de regras quando perde mas fica feliz quando todos se divertem. Pragmático à sua maneira." }
    ],
    enemies_summary: [
      { name: "Goblins Furiosos (se grupo trapacear errado)", qty: 6, diff: 1 }
    ],
    rewards: [
      { type: "moedas", desc: "50 moedas + uso gratuito da ponte por 1 ano" },
      { type: "item", desc: "Troféu das Olimpíadas (objeto único) — reconhecido por goblins em toda região como símbolo de aliança" },
      { type: "bonus", desc: "Aliança com a Chefia Goblin — 200 goblins como aliados improváveis numa batalha futura" },
      { type: "bonus", desc: "Rei Zikzik como contato: sabe coisas surpreendentemente úteis sobre rotas comerciais (e sobre aonde foram parar 47 itens roubados)" }
    ],
    master_notes: "Missão de comédia e diplomacia. As provas são rolagens de habilidade mas o contexto absurdo é o que importa. Zikzik virar aliado é o prêmio verdadeiro.",
    duration: "1 sessão longa"
  },

  /* ══════════════════════════════════════════════════════
     NOVAS MISSÕES DIFÍCEIS
     ══════════════════════════════════════════════════════ */

  {
    id: "m-juiz-morto",
    title: "O Julgamento do Morto",
    difficulty: "dificil",
    icon: "⚖",
    tags: ["político", "morto-vivo", "puzzle", "escolha moral"],
    hook: "O Grande Juiz Theron morreu antes de proferir o veredito no julgamento mais importante da região: o herdeiro do trono é acusado de envenenar o rei anterior. 'Nós precisamos que ele diga o veredito. Qualquer... forma que isso seja possível.'",
    summary: "O grupo precisa ressuscitar temporariamente o espírito do Juiz para que ele profira o veredito. Mas o juiz foi envenenado antes de morrer — e sabe quem fez.",
    start: "Câmara mortuária do Palácio de Justiça. O corpo do Juiz Theron em câmara fria. Um Necromante de Sanctum oferece serviços. 'Posso trazê-lo de volta por 10 minutos. Não mais. Escolham as perguntas com cuidado.'",
    areas: [
      {
        name: "Câmara de Investigação (Antes da Ressurreição)",
        description: "O grupo tem 2 horas para reunir evidências antes de chamar o juiz — caso contrário, o espírito pode ser manipulado por informações que o grupo não verificou.",
        puzzle: {
          type: "Preparação do Julgamento",
          description: "3 depoimentos contraditórios, 2 documentos suspeitos, 1 testemunha que some quando o grupo se aproxima. O puzzle é determinar que perguntas fazer ao Juiz nos 10 minutos de ressurreição.",
          solution: "INT (difícil) ou investigação de todos os 3 elementos: a testemunha sumida é o VERDADEIRO envenenador — não o herdeiro. O herdeiro é inocente. Mas revelar isso derruba a nobreza que financiou o julgamento."
        }
      },
      {
        name: "A Ressurreição",
        description: "O Juiz Theron, transparente e severo, emerge. '10 minutos. Façam valer.'",
        npc: {
          name: "Espírito do Juiz Theron",
          role: "Benéfico (imparcial absoluto)",
          personality: "Não tem agenda pessoal. Só quer justiça. Responde perguntas com total honestidade mas só o que é perguntado — não elabora. Se o grupo fez a investigação, tem as perguntas certas.",
          resolution: "Com as evidências certas: Theron profere veredito que exonera o herdeiro e implica o verdadeiro culpado. Sem investigação: o grupo desperdiça o tempo com perguntas erradas."
        }
      },
      {
        name: "A Fuga (Após o Veredito)",
        description: "O Conselheiro Mrak (o verdadeiro culpado, presente na sala) ataca antes que o veredito possa ser documentado.",
        hex: {
          layout: "12x8",
          terrain: ["tribunal (mesas — cobertura)", "galeria superior (arqueiros de Mrak — 3 posições)", "porta sul (saída para o povo)", "saída do juiz (selada magicamente até fim da sessão)"],
          hint: "Mrak tem 4 guardas pessoais (Dif.2) + 3 arqueiros no andar superior (Dif.1). Objetivo: proteger o escrivão enquanto ele documenta o veredito (3 rodadas de escrita)."
        },
        enemies: [
          { name: "Guardas de Mrak", qty: 4, diff: 2 },
          { name: "Arqueiros do Conselheiro", qty: 3, diff: 1 },
          { name: "Mrak (se enfrentado diretamente)", qty: 1, diff: 3 }
        ]
      }
    ],
    npcs: [
      { name: "Conselheiro Mrak", role: "Traiçoeiro", personality: "O assassino original. Calculista. Foge se em desvantagem clara — volta com mais recursos." },
      { name: "Herdeiro Inocente", role: "Benéfico", personality: "Assustado, grato, tem poder real se for ao trono. Aliado de campanha poderoso." }
    ],
    enemies_summary: [
      { name: "Guardas de Mrak", qty: 4, diff: 2 },
      { name: "Arqueiros", qty: 3, diff: 1 },
      { name: "Conselheiro Mrak", qty: 1, diff: 3 }
    ],
    rewards: [
      { type: "moedas", desc: "500 moedas (tesouro real, liberado pelo herdeiro agradecido)" },
      { type: "item", desc: "Selo Real (item único) — garante audiência imediata com qualquer nobre do reino" },
      { type: "bonus", desc: "O Herdeiro ao trono como aliado político permanente — favor significativo uma vez por campanha" },
      { type: "magia", desc: "O Necromante de Sanctum ensina Levantar Campeão ou Invocar Banshee como gratidão" },
      { type: "maldição", desc: "Se o grupo favorecer Mrak: Maldição do Peso das Almas (Theron amaldiçoa da outra vida)" }
    ],
    master_notes: "A investigação prévia É a missão. O combate é consequência. Grupos que pulam a investigação têm o espírito do Juiz disponível mas as perguntas erradas — e desperdiçam o único recurso.",
    duration: "3 sessões"
  },

  {
    id: "m-corcunda-de-aether",
    title: "A Montanha que Respira",
    difficulty: "dificil",
    icon: "🏔",
    tags: ["exploração", "elemental", "puzzle", "natureza", "boss"],
    hook: "A Montanha de Atrelon começou a tremer — não earthquakes, mas pulsações rítmicas, como uma respiração. Aldeões nas encostas ouviram vozes dentro da pedra. Um Druida ancião diz apenas: 'Ela acordou. Não deveria ter acordado ainda. Isso não é natural.'",
    summary: "No coração da montanha existe um Espírito Primordial da Terra que estava em sono milenar. Algo — ou alguém — o acordou prematuramente. O grupo precisa descobrir o que, acalmar o espírito e selar a câmara antes que as erupções comecem.",
    start: "Encosta norte de Atrelon. Fenda aberta por tremor recente — nunca existiu antes. Ar quente saindo. Sons de pedra rangendo como palavras.",
    areas: [
      {
        name: "Corredor de Entrada (Nível 1)",
        description: "Pedras que se reorganizam quando o grupo passa — testando intenções.",
        trap: {
          name: "Pedras Julgadoras",
          trigger: "Carregar arma desembainhada na entrada",
          effect: "Pedras formam muro bloqueante (HP 60, Def 8). Se o grupo embainha as armas, o muro abre. Se lutam, mais pedras surgem indefinidamente.",
          detect: "SAB (normal): a reorganização das pedras segue o olhar — elas notam as armas."
        }
      },
      {
        name: "Câmara dos Fragmentos (Nível 2)",
        description: "5 fragmentos de cristal negro espalhados — cada um com uma memória do Espírito. Tocar revela visão.",
        puzzle: {
          type: "Memórias do Espírito",
          description: "Cada fragmento mostra: (1) O sono milenar, (2) O primeiro tremor que acordou, (3) Uma figura com tocha descendo a montanha há 3 semanas, (4) A tocha tocando um cristal vermelho específico, (5) O cristal vermelho ainda presente — 2 níveis abaixo.",
          solution: "INT (normal) conecta: alguém deliberadamente acordou o Espírito tocando o cristal ativador. A figura nas visões é identificável — é o Aralto que reaparece da Fissura Corrompida (ligação com missão anterior se o grupo jogou)."
        }
      },
      {
        name: "Lago de Lava (Nível 3)",
        hex: {
          layout: "14x10",
          terrain: ["plataformas de pedra (ilhas — 3m² cada)", "lago de lava (dano 3d8 por rodada em contato)", "pontes naturais instáveis (Dif AGI normal por cruzamento, 1d4 colapsam aleatoriamente)", "cristal vermelho (centro — hex 7,5)"],
          hint: "Elemental do Fogo Primordial guarda o cristal (Dif.4). Portadores de itens de Vermelhão: elemental reconhece e não ataca. Druida com Forma Selvagem: forma de pássaro voa sobre o lago."
        },
        enemies: [{ name: "Espírito do Fogo Primordial", qty: 1, diff: 4, note: "Guarda o cristal vermelho ativador. Não é inimigo por natureza — está protegendo o espírito primordial." }]
      },
      {
        name: "Câmara do Coração (Nível 4)",
        description: "O Espírito Primordial: uma presença enorme de pedra e memória, confuso e com dor.",
        puzzle: {
          type: "Acalmar o Espírito",
          description: "Não é combate — é comunicação. O Espírito comunica por tremores e imagens de pedra. Ele está com dor (o cristal ativador foi sua âncora de sono — remover vai livrá-lo da dor mas também o deixará acordado). O grupo precisa decidir: (1) Recriar o sono (o cristal deve ser destruído de forma ritual pelo Druida — 5 rodadas de ritual), (2) Deixar acordar completamente (o Espírito fica ativo — tremores controlados, mas a montanha muda) ou (3) Encontrar um 3º caminho (SAB crítico + algum elemento do grupo que conecte os dois mundos).",
          solution: "Todas funcionam com consequências. O ritual precisa de 5 rodadas — o Aralto aparece para interromper nos últimos 2 rodadas."
        },
        enemies: [{ name: "Aralto da Marca — Forma Menor", qty: 1, diff: 3, note: "Aparece nos 2 últimos rounds do ritual para interromper" }]
      }
    ],
    npcs: [
      { name: "Druida Ancião Faryn", role: "Benéfico", personality: "Não pode entrar — está velho demais. Dá orientação, não soluções. 'A montanha julgará suas intenções antes de qualquer pedra se mover.'" }
    ],
    enemies_summary: [
      { name: "Espírito do Fogo Primordial", qty: 1, diff: 4 },
      { name: "Aralto da Marca", qty: 1, diff: 3 }
    ],
    rewards: [
      { type: "item", desc: "Fragmento do Coração da Montanha (material único) — pode ser forjado em Armadura ou Arma com propriedades de Elemental de Terra" },
      { type: "magia", desc: "O Espírito Primordial (se acalmado) ensina Fúria da Natureza ou Chamado da Tempestade ao Druida/conjurador" },
      { type: "moedas", desc: "Os aldeões se organizam: 300 moedas de contribuição coletiva + alojamento permanente em Atrelon" },
      { type: "benção", desc: "Se ritual de sono: Bênção Canal de Mana Pura (Thurgomur bendiz quem protegeu sua montanha)" },
      { type: "bonus", desc: "Se Espírito acordado: a montanha 'responde' ao grupo — nunca haverá avalanche ou colapso de caverna que os prejudique em Atrelon" }
    ],
    master_notes: "Esta missão é sobre escolhas com peso real. O Espírito Primordial deve ser apresentado com dignidade — não é monstro, é consciência antiga com dor. O Aralto aparecendo nos últimos 2 rounds cria tensão sem ser barato.",
    duration: "3-4 sessões"
  },

  /* ══════════════════════════════════════════════════════════════
     NOVAS MISSÕES — Sistema de Moedas (bronze/prata/ouro/platina)
     ══════════════════════════════════════════════════════════════ */

  /* ── FÁCEIS ─────────────────────────────────────────────────── */

  {
    id: "m-ervas-da-velha",
    title: "As Ervas da Velha Mirna",
    difficulty: "facil",
    icon: "🌿",
    tags: ["coleta", "floresta", "NPC", "druida"],
    hook: "A herborista Mirna não consegue mais caminhar até a floresta. Precisa de três ervas raras para preparar remédio para dez crianças doentes. 'Pago o que tenho. Não é muito.'",
    summary: "Coleta de ervas numa floresta com fauna hostil menor e um Druida recluso que pode ser aliado.",
    start: "Floresta dos Pinheiros Brancos. Mapa tosco de Mirna marca três regiões. Uma está riscada com 'aqui mora algo'.",
    areas: [
      {
        name: "Clareira das Flores Azuis",
        description: "Primeira erva fácil de achar. Mas aranhas gigantes usam as flores como camuflagem.",
        enemies: [{ name: "Aranha Gigante da Caverna", qty: 2, diff: 2, note: "Defensivas, recuam após 1 morte" }],
        trap: { name: "Teia no Chão", trigger: "Mover pela clareira sem Percepção (normal)", effect: "Preso (FOR normal, Ação livre). Aranhas detectam vibração imediatamente e reagem.", detect: "Percepção (normal) vê brilho tênue das teias ao sol." }
      },
      {
        name: "Riacho das Pedras Cantantes",
        description: "Segunda erva cresce nas pedras úmidas. O riacho canta de verdade — sons musicais saindo das pedras.",
        puzzle: {
          type: "Pedras Musicais",
          description: "A erva só floresce quando a pedra central é tocada na sequência correta (3 notas — as pedras adjacentes dão pistas visuais: coloração diferente). Tocar errado: 1d4 de choque elétrico e a erva murcha por 10 minutos.",
          solution: "INT (normal) ou SAB (normal — instinto): pedra verde, pedra azul, pedra branca. Bardo ou Druida: automático.",
          hint: "A coloração das pedras menores ao redor da central indica a ordem."
        }
      },
      {
        name: "Gruta do Recluso",
        description: "Terceira erva 'aqui mora algo' = um Druida velho que plantou o jardim sagrado.",
        npc: {
          name: "Druida Holt",
          role: "Benéfico (com condição)",
          personality: "Rabugento. Não dá a erva de graça. 'Façam algo útil primeiro — há uma armadilha de caçadores prendendo um lobo há dois dias a 200 metros daqui.'",
          resolution: "Libertar o lobo (FOR normal para a armadilha, AGI normal para não ser mordido): Holt dá erva + ensina habilidade."
        }
      }
    ],
    npcs: [
      { name: "Mirna, Herborista", role: "Benéfica", personality: "Pequena, determinada, dá tudo que tem sem piscar." },
      { name: "Holt, Druida Recluso", role: "Benéfico (condicional)", personality: "Odeia visitas mas tem código de honra rígido. Fica aliado permanente se o grupo respeitar a floresta." }
    ],
    enemies_summary: [{ name: "Aranha Gigante da Caverna", qty: 2, diff: 2 }],
    rewards: [
      { type: "bronze", desc: "40 moedas de bronze (Mirna — tudo que tem, dá até o cobre)" },
      { type: "prata",  desc: "8 moedas de prata (Holt, se o grupo libertar o lobo e recusar as ervas como pagamento — gesto honrado)" },
      { type: "item",   desc: "Kits de Primeiros Socorros ×3 (Mirna prepara como bônus — ervas processadas)" },
      { type: "pericia", desc: "Holt ensina Herbologia / Sobrevivência em Floresta (+1d6 em coleta e identificação de plantas)" },
      { type: "bonus",  desc: "Lobo liberto torna-se protetor silencioso do grupo na floresta — avisa de perigos 1x/sessão" }
    ],
    master_notes: "Missão humilde e emocional. Mirna pagando bronze com dignidade é mais impactante do que ouro descuidado. Holt pode ser mentor de Druidas do grupo.",
    duration: "1 sessão"
  },

  {
    id: "m-rio-envenenado",
    title: "O Rio que Mata Peixes",
    difficulty: "facil",
    icon: "🐟",
    tags: ["investigação", "coleta", "alquimia", "NPC"],
    hook: "Os pescadores da aldeia de Margem encontraram 200 peixes mortos rio acima. 'Algo vem da mina abandonada. Temos família para alimentar.' O prefeito local oferece o que pode.",
    summary: "Investigação de contaminação de rio que leva a uma mina abandonada onde cristais alquímicos estão vazando. E um Gnoll Guerreiro usou a mina como abrigo.",
    start: "Rio Mara. Cheiro químico leve vindo do norte. Peixes mortos boiando. Caminho de terra leva à encosta.",
    areas: [
      {
        name: "Beira do Rio",
        description: "Amostras de água: esverdeadas. Pegadas no barro — botas humanas e algo maior com garras.",
        puzzle: {
          type: "Análise da Contaminação",
          description: "INT (normal) ou Alquimista automaticamente: a cor e o cheiro indicam Cristal de Mana Bruta dissolvendo em água. Inofensivo para humanos mas tóxico para peixes. Fonte: corrente que vem do norte.",
          solution: "Seguir a corrente leva direto à mina. Sem o teste: o grupo encontra a mina mas não sabe o que procurar dentro."
        }
      },
      {
        name: "Mina Abandonada",
        hex: {
          layout: "10x6",
          terrain: ["suporte de madeira (cobertura pesada)", "poça de água esverdeada (hex 4,3 — não entrar: causa Enjoo 2 rodadas)", "cristal exposto (hex 7,2 — fonte do problema)", "saída de emergência (norte)"],
          hint: "O Gnoll não sabe que está causando o problema — está bebendo a água do poço interno e ficando cada vez mais agressivo (a mana o enlouqueceu levemente)."
        },
        enemies: [{ name: "Gnoll Guerreiro", qty: 1, diff: 2, note: "Confuso e agitado pela mana na água. Pode ser acalmado (SAB difícil) ou combatido." }],
        npc: {
          name: "Gnoll Gorrak",
          role: "Neutro (vítima da mana)",
          personality: "Agressivo mas não cruel. Se o grupo o cura (Poção de Cura ou Antídoto) ele é grato à sua maneira — vira guarda silencioso da aldeia em troca de comida.",
          resolution: "Curar: aliado improvável. Combater: fim do problema. Negociar sem cura: possível com SAB difícil mas ele volta agressivo em 2 dias."
        }
      }
    ],
    npcs: [
      { name: "Prefeito Aldus", role: "Benéfico", personality: "Honesto sobre a falta de recursos. Paga em bronze mas garante alojamento e comida." },
      { name: "Gnoll Gorrak", role: "Neutro", personality: "Mal-humorado mas com código de honra. Dívida por cura = proteção." }
    ],
    enemies_summary: [{ name: "Gnoll Guerreiro (Gorrak)", qty: 1, diff: 2 }],
    rewards: [
      { type: "bronze", desc: "60 moedas de bronze (aldeia inteira contribuindo)" },
      { type: "prata",  desc: "5 moedas de prata (prefeito pede emprestado da cidade vizinha para complementar)" },
      { type: "item",   desc: "Cristal de Mana Bruta (removido da mina — componente mágico valioso para Alquimistas e Magos)" },
      { type: "bonus",  desc: "Gorrak curado: patrulha silenciosa da aldeia — alertas de 1 ameaça externa por sessão" },
      { type: "bonus",  desc: "Permissão de usar a mina abandonada como base ou oficina de alquimia" }
    ],
    master_notes: "O Cristal de Mana Bruta já existe no database — bom para reforçar continuidade. Gorrak curado é recompensa narrativa que pode aparecer em missões futuras como aliado surpresa.",
    duration: "1 sessão"
  },

  {
    id: "m-carteiro-morto",
    title: "A Última Rota do Carteiro",
    difficulty: "facil",
    icon: "📮",
    tags: ["investigação", "social", "morto-vivo", "emocional"],
    hook: "O carteiro Beld não chegou à cidade em 3 dias. Sua mula voltou sozinha. A bolsa de cartas ainda está na sela — todas as cartas intactas. 'Onde está o Beld?' O serviço postal oferece recompensa em prata.",
    summary: "Beld foi morto por Zumbi Abissal mas seu espírito ainda carrega as cartas — literalmente. O fantasma quer entregar as correspondências antes de descansar.",
    start: "Estrada do Leste. Marca de queda no barro. Sangue antigo. E um envelope brilhando levemente no chão — que não estava lá há um segundo.",
    areas: [
      {
        name: "Estrada do Leste — Local do Ataque",
        description: "Rastros levam aos arbustos. Zumbi Abissal ainda patrulha a área.",
        enemies: [{ name: "Zumbi Abissal", qty: 1, diff: 3, note: "Matou Beld. Se destruído: espírito de Beld pode ser visto claramente." }]
      },
      {
        name: "Rota de Entrega (4 destinos)",
        description: "O Fantasma de Beld aparece — translúcido, uniforme de carteiro, bolsa de cartas às costas. Quer escolta para entregar as 4 cartas antes de descansar.",
        npc: {
          name: "Fantasma do Carteiro Beld",
          role: "Benéfico",
          personality: "Profissional mesmo morto. 'A correspondência precisa ser entregue. São compromissos.' Não aceita descansar antes de entregar tudo.",
          resolution: "Escoltar Beld pelos 4 destinos (4 cenas sociais breves) — cada entrega revela um pedaço da história de Beld e da comunidade. Na última: ele sorri e some."
        },
        puzzle: {
          type: "4 Cartas, 4 Histórias",
          description: "Cada carta tem uma situação: (1) Carta de amor não correspondida, (2) Notícia de morte para família, (3) Contrato comercial urgente, (4) Carta de perdão de filho para pai. O grupo deve decidir como cada entrega é feita — e pode ler as cartas (Beld permite, afinal ele as leu acidentalmente 'para conferir o destinatário').",
          solution: "Não há solução certa. As reações dos NPCs variam. Beld comenta cada uma com sabedoria simples de carteiro."
        }
      }
    ],
    npcs: [
      { name: "Fantasma de Beld", role: "Benéfico", personality: "Humilde, pontual, sente falta do filho. Última entrega é a carta para o próprio filho — não sabia que estava na bolsa." }
    ],
    enemies_summary: [{ name: "Zumbi Abissal", qty: 1, diff: 3 }],
    rewards: [
      { type: "prata", desc: "15 moedas de prata (serviço postal — pagamento formal por conclusão da rota)" },
      { type: "prata", desc: "5 moedas de prata extras (gratidão do destinatário da carta 3 — o contrato foi fechado por causa da entrega)" },
      { type: "item",  desc: "Lanterna de Cristal Arcano (pertencia a Beld — o filho a entrega como agradecimento)" },
      { type: "benção", desc: "Bênção de Sono Reparador (Beld abençoa de onde estiver — um carteiro honrado tem gratidão duradoura)" }
    ],
    master_notes: "Missão emocional pesada. A última carta sendo para o próprio filho de Beld deve ser guardada para o final silencioso. Nenhuma rolagem necessária para as entregas — só interpretação.",
    duration: "1 sessão"
  },

  /* ── NORMAIS ────────────────────────────────────────────────── */

  {
    id: "m-torneio-ferreiros",
    title: "O Torneio dos Ferreiros de Thurgomur",
    difficulty: "normal",
    icon: "🔨",
    tags: ["competição", "crafting", "social", "anão"],
    hook: "O grande torneio anual dos ferreiros anões foi sabotado — 3 dos 5 participantes encontraram suas obras danificadas na noite anterior à apresentação. O prêmio é um item ancestral de Thurgomur. Os suspeitos são os outros 2 ferreiros que não foram sabotados.",
    summary: "Investigação de sabotagem num torneio com lógica de eliminação. O sabotador é um aprendiz com motivo trágico.",
    start: "Salão dos Ferreiros de Durrak. Cheiro de metal e orgulho ferido. Três anões furiosos exibem obras danificadas.",
    areas: [
      {
        name: "Salão das Obras",
        description: "Três obras danificadas: espada com rachadura, escudo amassado, armadura com fivelas removidas. O dano é cirúrgico — não vandalismo.",
        puzzle: {
          type: "Perfil do Sabotador",
          description: "INT (difícil): o dano nas três obras foi feito com a mesma ferramenta (marca de mordente específico). Apenas ferreiros têm esse mordente. SAB (normal): quem sabe que dano mínimo arruína uma obra sem destruí-la? Um ferreiro experiente — ou um aprendiz muito bem treinado.",
          solution: "Investigar os dois não-sabotados: ferreiro Brak (suspeito óbvio, arrogante) e aprendiz Sim (quieto, presente na véspera). Sim tem o mordente manchado de metal — mas chora ao ser confrontado. Sua obra foi destruída no ano passado pelo campeão atual por inveja. Isto é vingança."
        }
      },
      {
        name: "Oficina Secreta de Sim",
        description: "Escondida no porão. A obra que Sim destruiu do campeão está lá — ele não conseguiu descartá-la. E também: a obra mais bonita do torneio, que Sim nunca ia apresentar por medo.",
        npc: {
          name: "Aprendiz Sim",
          role: "Ambíguo",
          personality: "18 anos, talento imenso, trauma real. Não arrependido mas não sem culpa. 'O campeão destruiu minha obra no ano passado e riu. Ninguém fez nada.'",
          resolution: "Denunciar (torneio suspenso, Sim punido mas campeão também por backstory): justiça fria. Apresentar a obra de Sim como participante (com permissão): ele vence legitimamente. Mediar entre Sim e os sabotados: reparação manual das obras como punição e aprendizado."
        }
      }
    ],
    npcs: [
      { name: "Mestre Anão Durrak IV", role: "Benéfico (árbitro)", personality: "Justo, rígido. Aceita qualquer solução que honre Thurgomur." },
      { name: "Aprendiz Sim", role: "Ambíguo", personality: "O melhor ferreiro do torneio que nunca participou por medo e vergonha." }
    ],
    enemies_summary: [],
    rewards: [
      { type: "prata",  desc: "30 moedas de prata (recompensa do torneio pela resolução)" },
      { type: "ouro",   desc: "2 moedas de ouro extras (Mestre Durrak, se Sim for tratado com justiça e não apenas punido)" },
      { type: "item",   desc: "Pedra de Afiação Rúnica (presente de Sim após resolução — bênção de Thurgomur na pedra)" },
      { type: "item",   desc: "Acesso ao forgemaster: qualquer arma ou armadura do grupo recebe +1 dano ou +1 Defesa permanente (trabalho de Sim como reparação)" },
      { type: "benção", desc: "Bênção Vigor Abençoado (Thurgomur aprecia quem resolve disputas com honra)" }
    ],
    master_notes: "Sem combate. O prêmio verdadeiro é Sim como aliado e acesso ao ferreiro. A obra que Sim escondeu no porão deve ser descrita como genuinamente extraordinária — isso valida o personagem.",
    duration: "1-2 sessões"
  },

  {
    id: "m-floresta-corromp-druida",
    title: "O Druida que Deu Errado",
    difficulty: "normal",
    icon: "🌑",
    tags: ["floresta", "corrompido", "Deus Marcado", "moral", "druida"],
    hook: "Árvores da Floresta de Wren estão morrendo em círculo crescente. No centro do círculo: a cabana do Druida Lyss, que sumiu há duas semanas. Os animais da floresta estão se comportando estranhamente — defendendo o centro em vez de fugir dele.",
    summary: "O Druida Lyss tentou usar a habilidade Moldar Terreno perto de uma área de corrupção do Deus Marcado e foi parcialmente corrompido. Ainda está vivo. Ainda é ele. Mas está mudando.",
    start: "Borda da floresta: árvores com marcas pretas nas cascas. Silêncio incomum — pássaros não cantam. Um Treant Jovem bloqueia o caminho, hesitante.",
    areas: [
      {
        name: "Borda Corrompida",
        description: "O Treant não ataca — está confuso. Metade das raízes dele estão pretas. Ele obedece Lyss mas também ao Deus Marcado.",
        enemies: [{ name: "Treant Jovem (corrompido parcialmente)", qty: 1, diff: 2, note: "Para de atacar se alguém mostrar que não quer destruir a floresta (SAB normal) ou usar Moldar Terreno/Forma Selvagem." }],
        npc: {
          name: "Treant Jovem",
          role: "Neutro/Vítima",
          personality: "Confuso. Fica parado ao invés de atacar se o grupo não for ameaçador. Pode ser purificado por Clérigo (Remove Maldição nível 2+)."
        }
      },
      {
        name: "Clareira Central — Cabana de Lyss",
        hex: {
          layout: "10x8",
          terrain: ["cabana (centro, 3x2 hexes)", "árvores mortas (cobertura mas caem — AGI normal ao usar)", "círculo de pedras corrompidas (raio 2 — campo de corrupção, −1d4 em testes para não-Clérigos)", "nascente seca (hex 5,7)"],
          hint: "Lyss está dentro. Urso Corrompido pela Marca patrulha externo. Corvo Espião pode ser invocado para verificar o interior sem entrar no círculo."
        },
        enemies: [{ name: "Urso Corrompido pela Marca", qty: 1, diff: 3 }]
      },
      {
        name: "Interior da Cabana",
        description: "Lyss sentado no chão, olhos metade dourados metade negros. Garras começando. Ainda fala.",
        npc: {
          name: "Druida Lyss",
          role: "Benéfico (em perigo)",
          personality: "Lúcido em 70%. Sabe o que está acontecendo. 'Não me matem ainda. Posso ser salvo. Mas precisam destruir a pedra no centro do círculo — foi ela que iniciou.'",
          resolution: "Destruir Pedra da Corrupção (HP 30, Def 0, mas protegida por campo — Clérigo ou item sagrado reduz campo, DEX difícil para tocar sem o campo reduzido): Lyss começa a reverter. Usar Elixir da Ressurreição (item único) ou qualquer cura mágica de nível 3+ enquanto a pedra é destruída: cura completa em 1d4 horas."
        },
        puzzle: {
          type: "Sequência de Purificação",
          description: "A pedra tem 4 símbolos. Devem ser apagados na ordem oposta que foram ativados (Lyss diz a ordem de ativação — ordem de remoção é inversa). Clérigo pode fazer automaticamente. Outros: SAB difícil ou ajuda de Lyss.",
          solution: "Com Lyss orientando: SAB normal (ele guia). Sem Lyss: SAB crítico."
        }
      }
    ],
    npcs: [
      { name: "Druida Lyss", role: "Benéfico", personality: "Humilde sobre o erro. 'Fui arrogante. Pensei que podia purificar sozinho.' Grato além das palavras." }
    ],
    enemies_summary: [
      { name: "Treant Jovem Corrompido", qty: 1, diff: 2 },
      { name: "Urso Corrompido pela Marca", qty: 1, diff: 3 }
    ],
    rewards: [
      { type: "prata", desc: "20 moedas de prata (Lyss entrega tudo que tem guardado)" },
      { type: "ouro",  desc: "1 moeda de ouro (cristal de mana pura que Lyss mantinha 'para emergência')" },
      { type: "magia", desc: "Lyss ensina Moldar Terreno ou Forma Selvagem ao Druida do grupo (transmissão direta de conhecimento)" },
      { type: "item",  desc: "Pedra da Corrupção destruída: Fragmento Purificado (material — componente para ritual de anti-corrupção)" },
      { type: "bonus", desc: "Lyss como mentor permanente de Druidas e conhecedor de áreas corrompidas da região" },
      { type: "maldição", desc: "Quem tocar a Pedra sem proteção: Maldição Marca de Sangue temporária (1 sessão — sangra ao usar habilidades)" }
    ],
    master_notes: "Lyss ainda sendo ele mesmo enquanto muda é o coração da cena. Descreva os olhos oscilando, os momentos de clareza. A decisão de destruir a pedra vs. salvar Lyss primeiro é intencional.",
    duration: "2 sessões"
  },

  {
    id: "m-prisao-de-gelo",
    title: "A Prisão de Gelo",
    difficulty: "normal",
    icon: "🧊",
    tags: ["dungeon", "gelo", "armadilha", "puzzle", "inimigo elemental"],
    hook: "Uma prisioneira de guerra importante foi transferida para a Fortaleza de Gelo no norte. O grupo foi contratado para extraí-la — por quem é ambíguo (Mestre escolhe: facção aliada, família, espionagem). 'Entrem, peguem, saiam. 3 dias antes da neve fechar as passagens.'",
    summary: "Fortaleza de gelo de 3 andares com guardas humanos e elementais invocados. A prisioneira tem sua própria agenda — que pode complicar a extração.",
    start: "Fortaleza Gelada. Entrada guardada por dois soldados. Temperatura −20°C. Janelas seladas por placas de gelo 30cm.",
    areas: [
      {
        name: "Muralha Externa",
        description: "4 soldados, rotação a cada hora. Torre de vigia com Golem de Gelo.",
        hex: {
          layout: "14x8",
          terrain: ["muralha (hex bordas — escalar: FOR normal)", "portão (hex 7,1 — trancado, DEX difícil ou FOR crítico)", "torre noroeste (Golem de Gelo sentinela)", "sombra do parapeito (cobertura para Furtividade)"],
          hint: "Furtividade (difícil) permite passar pelos soldados em hora de rotação. Golem de Gelo não dorme mas tem campo visual de 180° — ponto cego por 3 rodadas durante rotação."
        },
        enemies: [
          { name: "Soldados da Guarda", qty: 4, diff: 2 },
          { name: "Golem de Gelo", qty: 1, diff: 2, note: "Só ativa se alarme for disparado" }
        ],
        trap: { name: "Alarme de Gelo", trigger: "Mover a mais de 2 hex por rodada no pátio", effect: "Cristais de gelo na parede detectam vibração — sino soa. Golem ativa + 4 soldados adicionais chegam em 2 rodadas.", detect: "Percepção (difícil) nota os cristais. INT (normal) identifica como sistema de detecção." }
      },
      {
        name: "Corredor Interno (Andar 2)",
        description: "Paredes de gelo translúcidas — sombras visíveis através. Um guarda caminha do outro lado da parede.",
        puzzle: {
          type: "Navegação pelas Sombras",
          description: "O corredor tem seções onde o piso é gelo translúcido — guardas abaixo veem sombras. Mover sem projetar sombra nessas seções: AGI (difícil) ou rastejar (metade da velocidade, AGI normal).",
          solution: "Lanterna de Cristal Arcano apagada ou Passo Silencioso (magia) elimina a penalidade completamente. Névoa Cinzenta (magia) cobre as seções por 3 rodadas."
        }
      },
      {
        name: "Cela da Prisioneira",
        description: "Kapitsa, a prisioneira, está... bem. Sorrindo. 'Demorou mais do que esperava.'",
        npc: {
          name: "Kapitsa, Espiã",
          role: "Ambíguo",
          personality: "Foi presa de propósito para descobrir rotinas da fortaleza. Tem informações valiosas mas quer mais 3 horas dentro para completar a missão. 'Saiam e voltem amanhã às 2h da madrugada.'",
          resolution: "Aceitar (missão fica mais complexa mas Kapitsa entrega mapa completo da fortaleza e informação estratégica), recusar e extrair à força (ela coopera mas desaprovadoramente), ou reportar ao contratante primeiro (possível traição — Mestre decide)."
        }
      }
    ],
    npcs: [
      { name: "Kapitsa, Espiã", role: "Ambígua", personality: "Competente, divertida com o caos. Sempre 3 passos à frente — ou pelo menos acredita que está." }
    ],
    enemies_summary: [
      { name: "Soldados da Guarda", qty: "6-10", diff: 2 },
      { name: "Golem de Gelo", qty: 1, diff: 2 },
      { name: "Comandante da Fortaleza (se alarme)", qty: 1, diff: 3 }
    ],
    rewards: [
      { type: "ouro",  desc: "5 moedas de ouro (contratante, pagamento acordado)" },
      { type: "ouro",  desc: "3 moedas de ouro extras (Kapitsa, se o grupo aceitar as 3 horas extras — informação vale mais)" },
      { type: "item",  desc: "Mapa Arcano da Fortaleza de Gelo (Kapitsa — Pergaminho de Mapa Arcano, 'presente de gratidão')" },
      { type: "item",  desc: "Poção de Resistência ao Fogo (encontrada nos aposentos do Comandante)" },
      { type: "bonus", desc: "Kapitsa como contato de inteligência — informações sobre movimentos militares 1x/campanha" }
    ],
    master_notes: "Kapitsa muda a dinâmica de uma missão de resgate para 'quem usa quem'. O grupo percebe que eles também foram usados — isso pode irritar ou divertir, dependendo da mesa.",
    duration: "2 sessões"
  },

  /* ── DIFÍCEIS ───────────────────────────────────────────────── */

  {
    id: "m-conselho-de-reis",
    title: "O Conselho dos Cinco Reinos",
    difficulty: "dificil",
    icon: "👑",
    tags: ["político", "social", "investigação", "stealth", "diplomacia"],
    hook: "Os representantes dos Cinco Reinos se reúnem pela primeira vez em 50 anos para o Tratado de Paz. Dois dias antes do evento: um assassino com a marca dos Araltos foi capturado tentando entrar. Um dos representantes é o alvo. O grupo é contratado como segurança de alto escalão. 'Descubram quem e parem antes que aconteça durante o Conselho.'",
    summary: "Missão de espionagem invertida — o grupo protege e investiga ao mesmo tempo. O assassino já está dentro. E um dos representantes não é quem diz ser.",
    start: "Palácio Neutro de Aldvak. 5 alas, 5 delegações, 200 funcionários. O grupo tem acesso a tudo mas autoridade questionável — cada delegação tem seu próprio protocolo.",
    areas: [
      {
        name: "Ala das Delegações",
        description: "5 alas, cada uma com 4-8 pessoas. O grupo tem 6 horas para investigar antes do jantar de abertura.",
        puzzle: {
          type: "Perfil do Assassino",
          description: "Pistas distribuídas: (1) Marca dos Araltos vista por servo — ala sul, (2) Veneno específico encontrado no depósito — origem Atrelon, (3) Um dos 'diplomatas' tem cicatriz consistente com treinamento de combate, (4) Horário impossível de um alibi — alguém mentiu, (5) Carta em código encontrada no lixo da ala leste.",
          solution: "INT (difícil) conecta todas: o 'assessor' da delegação de Atrelon é o assassino. SAB (normal) percebe que o alvo verdadeiro não é o representante óbvio — é o único que pode impedir o tratado. A carta em código confirma: o Deus Marcado quer o Tratado impedido."
        }
      },
      {
        name: "Jantar de Abertura",
        hex: {
          layout: "16x10",
          terrain: ["mesa principal (centro)", "varandas laterais (arqueiros escondidos — detectável)", "cozinha (acesso restrito)", "saída de emergência (cada canto)"],
          hint: "O assassino age durante o discurso principal. O grupo tem 2 rodadas de aviso (se investigaram bem) ou 0 rodadas (se não investigaram). 200 inocentes presentes — violência indiscriminada tem consequências diplomáticas."
        },
        enemies: [
          { name: "Mercenário de Elite (assassino)", qty: 1, diff: 3 },
          { name: "Arqueiros Aralto (suporte — varandas)", qty: 3, diff: 2 }
        ],
        trap: { name: "Veneno no Vinho", trigger: "Representante alvo beber sem que grupo previna", effect: "Representante fica Incapacitado em 3 rodadas (morre em 6 sem antídoto). Antídoto ou Imposição das Mãos resolve.", detect: "Percepção (difícil) nota odor levemente diferente. Anel de Comunicação com Animais: o cão da cozinha está evitando a garrafa específica." }
      },
      {
        name: "Perseguição ao Assessor Falso",
        description: "O assassino foge pelos telhados ao ser identificado.",
        hex: {
          layout: "12x6",
          terrain: ["telhados (terreno irregular — AGI normal por rodada)", "escotilhas (descida rápida)", "plataforma de observação (elevação — vantagem em ranged)"],
          hint: "AGI (difícil) para alcançar. Alternativa: Passo Dimensional (magia) ou Flecha de Sombras bloqueiam a fuga. Se capturado: tem informações sobre os Araltos."
        },
        enemies: [{ name: "Mercenário de Elite (fugindo)", qty: 1, diff: 3, note: "Quer fugir, não lutar — usa Ações de Movimento. Se encurralado: combate total." }]
      }
    ],
    npcs: [
      { name: "Representante Mira de Atrelon (o alvo real)", role: "Benéfico", personality: "Inteligente, suspeita do próprio assessor mas sem evidência. Aliada se o grupo confiar nela cedo." },
      { name: "Assessor Falso (assassino)", role: "Traiçoeiro", personality: "Profissional impecável até ser descoberto. Informações sobre os Araltos em troca de vida." }
    ],
    enemies_summary: [
      { name: "Mercenário de Elite (assassino)", qty: 1, diff: 3 },
      { name: "Arqueiros Aralto", qty: 3, diff: 2 }
    ],
    rewards: [
      { type: "ouro",    desc: "10 moedas de ouro (contratante — pagamento de segurança)" },
      { type: "ouro",    desc: "5 moedas de ouro extras (Representante Mira, pessoal — 'o assessor estava me seguindo há meses')" },
      { type: "platina", desc: "1 moeda de platina (Conselho unificado — bônus coletivo se o tratado for assinado)" },
      { type: "item",    desc: "Ficha de Agente Real (emitida pelos 5 reinos em conjunto — validade ampla)" },
      { type: "bonus",   desc: "Reputação diplomática: acesso a qualquer capital dos Cinco Reinos sem questionamento" },
      { type: "bonus",   desc: "Assassino capturado: informações de inteligência sobre Araltos (plot hook de campanha)" }
    ],
    master_notes: "A investigação das 6 horas define o sucesso. Grupos que pulem direto para o jantar vão reagir em vez de agir. Ponha NPCs secundários dando pistas se o grupo for passivo — o Conselho importa demais para falhar.",
    duration: "3 sessões"
  },

  {
    id: "m-biblioteca-proibida",
    title: "A Biblioteca que Devora Leitores",
    difficulty: "dificil",
    icon: "📚",
    tags: ["dungeon", "puzzle", "magia", "armadilha", "ilusão"],
    hook: "Três eruditos entraram na Biblioteca Proibida de Valdris e não saíram. A Biblioteca foi selada há 200 anos após 'incidente com conhecimento proibido'. O Archibaldo da Academia oferece enorme recompensa: 'Resgatem os estudiosos E tragam o Codex Primordial. Não leiam o Codex.'",
    summary: "Biblioteca de 5 salas onde cada sala é um desafio de conhecimento. O Codex está vivo e quer ser lido. Os eruditos foram 'absorvidos' como guardiões de suas salas favoritas.",
    start: "Grande porta de carvalho negro com 12 fechaduras. Todas abertas — alguém passou recentemente. Dentro: cheiro de poeira e algo floral impossível para um lugar fechado há 200 anos.",
    areas: [
      {
        name: "Sala 1 — Aritmética dos Antigos",
        description: "Piso com números gravados. Caminhar nos números errados: elétrico.",
        puzzle: {
          type: "Sequência Numérica",
          description: "O chão tem 25 tiles numerados de 1 a 25. O caminho seguro são os números primos na ordem crescente. Trafegar fora dos primos: 1d8 de choque por tile errado.",
          solution: "2, 3, 5, 7, 11, 13, 17, 19, 23. INT (normal): reconhece primos. Sem o teste: tentativa e erro com cada falha custando 1d8.",
          hint: "Um dos eruditos gravou os primeiros 4 números na entrada com giz antes de ser absorvido."
        }
      },
      {
        name: "Sala 2 — Galeria das Ilusões",
        description: "Uma sala com 7 cópias idênticas do mesmo livro em 7 pedestais. Apenas um é real.",
        enemies: [{ name: "Erudito Absorvido #1 (guardião ilusório)", qty: 1, diff: 2, note: "Usa magias de ilusão — Disfarce Menor, Névoa Cinzenta. Derrotado: vira pó e o erudito acorda confuso no chão." }],
        puzzle: {
          type: "O Livro Real",
          description: "SAB (difícil) ou toque físico nos 7 livros: 6 passam a mão. O real tem peso. Alternativamente: Passo Silencioso revela aura mágica nos falsos. Luneta de Alcance (item) vê as ilusões através do vidro.",
          solution: "Tocar o livro real sem abri-lo libera o erudito. Abrir: 1d4 de dano psíquico por frase lida."
        }
      },
      {
        name: "Sala 3 — O Labirinto de Citações",
        description: "Uma sala com 200 portas. Na parede: 'A porta certa é a que contém a resposta à sua última pergunta sincera.'",
        puzzle: {
          type: "Introspectivo",
          description: "Não há teste. Cada personagem deve dizer em voz alta a última pergunta sincera que fez (o jogador decide). A porta correspondente ao tema da pergunta abre. Portas erradas: câmaras de eco que repetem a pergunta distorcida para sempre (AGI normal para sair antes de fechar).",
          solution: "Momento de roleplay puro. O Mestre decide qual porta corresponde a qual pergunta tematicamente. Não há resposta errada — apenas não-sincera."
        },
        npc: {
          name: "Erudito Absorvido #2",
          role: "Benéfico",
          personality: "Passou 2 dias respondendo perguntas sinceras para encontrar a porta certa. Sabe a resposta para qualquer pergunta que o grupo tiver mas só responde com outra pergunta."
        }
      },
      {
        name: "Sala 5 — O Codex Primordial",
        description: "O livro flutua. Brilha. Parece respirar. O Erudito #3 está lendo — ou sendo lido.",
        npc: {
          name: "Erudito Absorvido #3 (em transe)",
          role: "Neutro",
          personality: "Levitando 1 metro do chão. Murmura parágrafos. Não responde. Largar o Codex o libera — mas ele vai querer voltar."
        },
        puzzle: {
          type: "Fechar o Codex",
          description: "O Codex não pode ser fechado à força (SAB (crítico) para resistir à compulsão de ler ao tentar fechá-lo). Alternativas: (1) Bolsa Antimagia (já existe no data.js) envolve o Codex, suprimindo o campo, (2) Anulação Mágica (magia nível 4) fecha permanentemente, (3) Um personagem lê a primeira e a última página em voz alta simultaneamente com outro — o Codex fecha ao ser 'completado'.",
          solution: "Opção 3 é dramática: ambos fazem SAB (difícil) ou recebem 2d8 de dano psíquico mas o Codex fecha. Bolsa Antimagia é a solução 'segura' mas impede o Archibaldo de estudá-lo depois."
        }
      }
    ],
    npcs: [
      { name: "O Codex Primordial", role: "Ambíguo", personality: "Não é malévolo — é compulsório. Quer ser lido porque foi escrito para ser lido. Ler um parágrafo: +1 em INT permanente, mas SAB (difícil) para parar de ler." }
    ],
    enemies_summary: [
      { name: "Erudito Absorvido #1 (guardião ilusório)", qty: 1, diff: 2 },
      { name: "Manifestação de Conhecimento (sala 4, se o Mestre quiser)", qty: 1, diff: 3 }
    ],
    rewards: [
      { type: "ouro",    desc: "8 moedas de ouro (Archibaldo — pagamento padrão)" },
      { type: "ouro",    desc: "4 moedas de ouro extras (eruditos resgatados, famílias pagam separado)" },
      { type: "platina", desc: "1 moeda de platina (Archibaldo, se o Codex for entregue intacto e fechado)" },
      { type: "magia",   desc: "Ler 1 parágrafo do Codex controladamente: aprende qualquer magia de nível 1-4 à escolha (+2d8 dano psíquico como custo)" },
      { type: "item",    desc: "Bolsa Antimagia (encontrada na sala 3 — um erudito anterior a deixou como solução)" },
      { type: "benção",  desc: "Bênção Mente Acurada (para conjuradores que resistiram ao Codex sem lê-lo — domínio mental reconhecido)" }
    ],
    master_notes: "A Sala 3 (portas de perguntas sinceras) é a mais impactante se os jogadores se engajarem. Não force — mas dê tempo. O Codex querendo ser lido deve parecer tentador, não ameaçador. A oferta de +1 INT permanente é real e válida — deixe eles escolherem.",
    duration: "3 sessões"
  },

  {
    id: "m-guerra-duas-cidades",
    title: "A Guerra que Ninguém Quer",
    difficulty: "dificil",
    icon: "🏙",
    tags: ["político", "social", "investigação", "stealth", "escolha épica"],
    hook: "As cidades de Margem e Caravela estão a 3 dias de guerra. O motivo: um assassinato. O prefeito de Margem foi encontrado morto na fronteira com o símbolo de Caravela na mão. Caravela nega. O grupo é contratado por um mercador que perderia tudo na guerra: 'Descubram a verdade. Temos 3 dias.'",
    summary: "O assassinato foi encenado por uma terceira parte — a Guilda das Sombras, que lucra com a guerra. O grupo precisa reunir evidências, descobrir o mandante e fazer as duas cidades acreditarem antes do conflito estourar.",
    start: "Fronteira entre Margem e Caravela. Bandeiras de ambos os lados. Soldados dos dois lados se olhando. O grupo tem movimento livre por ser 'investigadores neutros' — por enquanto.",
    areas: [
      {
        name: "Cena do Crime (Fronteira)",
        description: "O corpo foi removido mas o local ainda tem vestígios. 3 investigadores diferentes já estiveram aqui e chegaram a conclusões diferentes.",
        puzzle: {
          type: "Reconstrução do Crime",
          description: "SAB (normal): o prefeito não foi morto aqui — foi movido. INT (difícil): a posição do corpo é muito conveniente, como se alguém o colocou para ser achado. DEX (normal) examinando o chão: trilha de pegadas de carroça vem da direção de um terceiro local.",
          solution: "Seguir a trilha leva ao armazém da Guilda das Sombras 2km a oeste. A trilha some após chuva (pressão de tempo: 36 horas antes de ser apagada)."
        }
      },
      {
        name: "Armazém da Guilda das Sombras",
        description: "2 guardas. Dentro: documentos, ouro de ambas as cidades, e o símbolo forjado usado no assassinato.",
        enemies: [
          { name: "Mercenário de Elite (guarda Guilda)", qty: 2, diff: 3 }
        ],
        npc: {
          name: "Coordenador da Guilda (Sax)",
          role: "Traiçoeiro",
          personality: "Foge se perceber que o grupo tem evidências suficientes. 'Vocês não têm ideia de quem está atrás disso.' (Insinua que os Araltos financiaram a operação.)",
          resolution: "Capturar: prova viva. Deixar fugir com documentos: documentos são prova. Matar: só os documentos restam — suficiente mas sem testemunho."
        }
      },
      {
        name: "Convencer Ambas as Cidades",
        description: "O grupo tem documentos e possivelmente Sax. Precisa convencer simultaneamente os dois líderes antes que ordens de ataque sejam dadas.",
        puzzle: {
          type: "Diplomacia Dupla",
          description: "Dois líderes, dois pontos de vista, 2 horas de janela. Opções: (1) Reunião conjunta (os dois no mesmo lugar — difícil de arranjar, SAB crítico + INT difícil, mas convence ambos de uma vez), (2) Reuniões separadas (SAB difícil × 2 — cada líder em separado), (3) Apresentação pública (todos os cidadãos como audiência — espetacular, INT difícil, resultado irreversível mas poderoso).",
          solution: "Qualquer opção funciona com rolagens diferentes. O Mestre pode adicionar complicação: Sax envia segundo agente para assassinar um dos líderes durante a reunião."
        }
      }
    ],
    npcs: [
      { name: "Prefeita Interina de Margem", role: "Benéfico (com desconfiança)", personality: "Quer paz mas quer mais provar que Caravela errou. Muda de posição com evidências irrefutáveis." },
      { name: "General de Caravela", role: "Benéfico (com honra)", personality: "Militar de verdade — odeia guerra desnecessária. Mais fácil de convencer que a Prefeita se as evidências forem apresentadas militarmente." },
      { name: "Sax (Coordenador da Guilda)", role: "Traiçoeiro", personality: "Calculista, sem remorso. Cita mentalmente o custo de cada coisa, inclusive da própria morte." }
    ],
    enemies_summary: [
      { name: "Guardas da Guilda", qty: 2, diff: 3 },
      { name: "Agente Assassino (segundo de Sax)", qty: 1, diff: 3 }
    ],
    rewards: [
      { type: "ouro",    desc: "8 moedas de ouro (mercador — o conflito evitado salvou seus negócios)" },
      { type: "ouro",    desc: "5 moedas de ouro (Prefeita Interina — gratidão formal)" },
      { type: "ouro",    desc: "5 moedas de ouro (General de Caravela — pagamento de honra)" },
      { type: "platina", desc: "2 moedas de platina (bônus conjunto se nenhuma gota de sangue entre as cidades for derramada)" },
      { type: "bonus",   desc: "Herói de duas cidades: acesso livre em Margem e Caravela, alojamento permanente em ambas" },
      { type: "bonus",   desc: "Sax capturado: revelação de que Araltos financiaram — informação de campanha de alto impacto" },
      { type: "item",    desc: "Documentos da Guilda: mapa de operações criminosas em 6 cidades da região" }
    ],
    master_notes: "A pressão de tempo (3 dias, 36h de trilha, 2h de diplomacia) deve ser real e comunicada claramente. Grupos que passam tempo demais em qualquer passo perdem a janela. A platina como bônus de zero sangue é o incentivo para diplomacia sobre violência.",
    duration: "3 sessões"
  }

];
