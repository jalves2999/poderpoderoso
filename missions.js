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
      { type: "ouro", desc: "3d20 moedas de ouro (tesouro do mercador + poupança do bando)" },
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
      { type: "ouro", desc: "30 moedas (pagamento original) + 20 extras se encontrarem Teldris às autoridades" }
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
      { type: "ouro", desc: "25 moedas (moleiro) + 10 (Lena, tudo que tem)" },
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
      { type: "ouro", desc: "20 moedas + comida grátis na taverna (o dono do sino ficou agradecido)" }
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
      { type: "ouro", desc: "40 moedas (pagamento formal do exército)" },
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
      { type: "ouro", desc: "60 moedas (Linde paga) + tesouro de Arkal (3d20 ouro em joias antigas)" },
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
      { type: "ouro", desc: "50 moedas + casa do vilarejo disponível para o grupo usar como base" },
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
      { type: "ouro", desc: "100 moedas (tabelião) + conteúdo da mansão (estimativa: 200 moedas em objetos de valor)" },
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
      { type: "ouro", desc: "200 moedas (prêmio do torneio) + apostas (se jogadores apostarem em si mesmos: 3x o valor)" },
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
      { type: "ouro", desc: "300 moedas (Academia) + acervo de Eldrath (livros raros, componentes — valor 500 moedas em ingredientes)" },
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
      { type: "ouro", desc: "300 moedas da cidade + propriedades confiscadas dos corrompidos (valor 200)" },
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
];
