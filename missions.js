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
      { type: "ouro", desc: "30 moedas da aposta + 50 se ajudarem Vael com a dívida (ele paga o que pode)" },
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
      { type: "ouro", desc: "25 moedas (Elma) + pão grátis para sempre na padaria" },
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
      { type: "ouro", desc: "50 moedas do nobre (se entregarem o anel) OU 30 moedas de Draven (se ficarem com ele — tudo que tem)" },
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
      { type: "ouro", desc: "60 moedas da filha de Fenn + desconto permanente de 40% na botica de Fenn" },
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
      { type: "ouro", desc: "40 moedas dos pais de Mira (tudo que tinham)" },
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
      { type: "ouro", desc: "50 moedas + uso gratuito da ponte por 1 ano" },
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
      { type: "ouro", desc: "500 moedas (tesouro real, liberado pelo herdeiro agradecido)" },
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
      { type: "ouro", desc: "Os aldeões se organizam: 300 moedas de contribuição coletiva + alojamento permanente em Atrelon" },
      { type: "benção", desc: "Se ritual de sono: Bênção Canal de Mana Pura (Thurgomur bendiz quem protegeu sua montanha)" },
      { type: "bonus", desc: "Se Espírito acordado: a montanha 'responde' ao grupo — nunca haverá avalanche ou colapso de caverna que os prejudique em Atrelon" }
    ],
    master_notes: "Esta missão é sobre escolhas com peso real. O Espírito Primordial deve ser apresentado com dignidade — não é monstro, é consciência antiga com dor. O Aralto aparecendo nos últimos 2 rounds cria tensão sem ser barato.",
    duration: "3-4 sessões"
  }
];
