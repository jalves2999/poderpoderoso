const WORLD_REGIONS = [

  /* ================================================================
     1. GRANDE PLANÍCIE SUDESTE
     ================================================================ */
  {
    id: "planicie-sudeste",
    name: "Grande Planície Sudeste",
    icon: "🌾",
    summary: "Vastas extensões de campos abertos onde raças e tribos variadas coexistem em territórios pouco explorados. A região é marcada pela presença do Vulcão de Karloth ao norte, onde o lendário Dragão Dourado repousa desde o fim da Batalha Colossal. Ruínas da Era Élfica e cavernas inexploradas guardam relíquias de um mundo que não existe mais.",

    reinos: [
      {
        name: "Confederação das Planícies",
        historia: "Fundada por tribos humanas, orcs e goblins que ocuparam os territórios após a retirada dos elfos. Não há governante central — um Conselho de Chefes se reúne nas estações para resolver disputas e organizar defesa comum. Os membros mais antigos descrevem a planície como 'o que sobrou do mundo antigo, ainda esperando ser descoberto'.",
        racas: ["Humanos tribais", "Orcs das planícies", "Goblins nômades", "Halflings mercadores"],
        conflitos: "Disputas por território entre tribos crescentes. Expedições de exploração que encontram relíquias élfica que ninguém sabe como usar — e alguns querem vender para os Araltos do Deus Marcado. Um clã orc foi corrompido por um fragmento do Deus Marcado encontrado em uma caverna.",
        npcs: ["Chefe Voran Pedra-Vermelha (orc)", "Mercadora Lissa Pé-Leve (halfling)", "Xamã Erkha (humana)"]
      },
      {
        name: "Povo de Karloth — Karlacs",
        historia: "Uma raça única surgida após a Batalha Colossal: os Karlacs habitam a cidade construída sobre a Grande Salamandra Karlac, que vive em círculos eternos pelo Deserto Carmesim — mas sua origem está nas planícies sul, onde a salamandra retorna periodicamente. Os Karlacs têm pele avermelhada e vivem em harmonia completa com sua montaria viva, guiando a salamandra com rituais que só eles conhecem.",
        racas: ["Karlacs (humanos modificados pela presença da salamandra)"],
        conflitos: "Tensão com tribos que tentam caçar nas rotas da salamandra. Rumores de que um Aralto quer dominar Karlac para usar o calor de seu corpo como arma.",
        npcs: ["Grande Karlac Yorven (líder supremo)", "Ritualista Amka (guia da salamandra)"]
      }
    ],

    cidades: [
      {
        name: "Vila de Pedra Vermelha",
        historia: "Assentamento no pé do Vulcão de Karloth, construído com pedra da montanha que tem tonalidade avermelhada devido ao calor interno. Os habitantes vivem sob o brilho dourado que o Dragão Dourado emite do alto do vulcão — uma luz que, segundo os mais velhos, os protege de criaturas das trevas à noite.",
        npcs: [
          { nome: "Ferreiro Durn", cargo: "Forjador do Vulcão", desc: "Usa o calor natural do vulcão para forjar. Criou itens que nenhum outro ferreiro consegue replicar. Suspeita que a rocha vermelha do vulcão tem propriedades mágicas relacionadas ao Dragão." }
        ],
        itens: ["Aço Vulcânico (material raro — mais resistente, guarda calor)", "Pedra de Lava (componente alquímico)", "Espelhos para Sinalizar ao Dragão (ferramenta de explorador)", "Mapas de Cavernas Parcialmente Exploradas"]
      },
      {
        name: "Entreposto das Tribos — Cruzamento Vivo",
        historia: "Não é uma cidade fixa, mas um entreposto permanente no cruzamento das rotas tribais. Tendas e estruturas semi-permanentes abrigam comerciantes de todas as raças. É o único lugar onde tribos rivais coexistem pacificamente — violar a paz do Cruzamento é o único crime punido por todas as tribos igualmente.",
        npcs: [
          { nome: "Oráculo Sem Nome", cargo: "Sábio itinerante", desc: "Aparece no Cruzamento a cada lua cheia. Diz conhecer a história completa da Batalha Colossal. Fala sobre o Dragão Dourado como se o conhecesse pessoalmente — e provavelmente conhece." }
        ],
        itens: ["Qualquer item comum (mercado variado)", "Relíquias Élfica (venda clandestina — ilegais em Akaen)", "Ervas das Planícies (componentes de cura)", "Informações (o oráculo vende conhecimento por histórias, não por ouro)"]
      }
    ],

    dungeons: [
      {
        name: "Cavernas da Era Élfica",
        dificuldade: 3,
        historia: "Sistema de cavernas abaixo das planícies onde os elfos escravizavam as outras raças antes da Primeira Era. As paredes ainda têm correntes e ganchos. Criaturas das trevas ocuparam os níveis inferiores, mas o nível mais fundo — lacrado por magia élfica que enfrentece — ainda guarda registros do domínio élfico e itens que os elfos deixaram para trás.",
        monstros: ["Goblin Batedeira (dif.1)", "Lobo das Trevas (dif.2)", "Golem de Pedra Antiga — construto élfico (dif.2)", "Guardião Élfico Remanescente (dif.3)"],
        itens: ["Runa Élfica de Escravidão (item de missão — proibido)", "Espada Élfica Antiga (arma rara)", "Registros da Era Élfica (história do mundo)", "Amuleto de Controle Mental Élfico (único — perigoso)"]
      },
      {
        name: "O Ninho do Dragão Dourado",
        dificuldade: 5,
        historia: "O vulcão de Karloth não é apenas um vulcão — é o lar escolhido do Dragão Dourado desde que Jurgmund partiu desse mundo. A criatura não é hostil por natureza, mas sua presença é tão avassaladora que aproximar-se sem intenção pura causa Amedrontamento automático. Dizem que quem prova ser digno recebe do dragão um fragmento de escama dourada — material do qual itens Ancestrais podem ser criados.",
        monstros: ["Nenhum — o Dragão afasta qualquer criatura do vulcão", "O Dragão Dourado de Karloth (dif.5 se hostilizado — não é um encontro de combate padrão)"],
        itens: ["Escama do Dragão Dourado (material ancestral — 100% se digno, 0% se forçar)", "Fragmento de Chama Eterna (componente lendário)", "Memória da Batalha Colossal (o dragão pode revelar o que viu)"]
      }
    ],

    locais_interesse: [
      {
        name: "Círculos de Karlac — As Rotas da Salamandra",
        historia: "O chão do deserto carmesim ao sul mostra marcas circulares permanentes onde a Grande Salamandra Karlac caminha há 500 anos. A areia nessas trilhas é mais vermelha que em qualquer outro lugar — impregnada de calor e de energia residual dos restos do Deus Marcado que a salamandra consome. Xamãs dizem que caminhar nos Círculos durante a noite revela visões da Batalha Colossal."
      },
      {
        name: "A Estátua Partida do Primeiro Herói",
        historia: "Nas planícies centrais, metade de uma estátua colossal permanece de pé. A outra metade desapareceu na formação do Grande Lago Central durante a batalha. A estátua representa o herói guerreiro que liderou os humanos contra o Deus Marcado — seu nome foi deliberadamente apagado pelos Araltos, que odeiam que um mortal tenha sido crucial para a derrota de seu deus. Quem decifrar a inscrição na base descobrirá o nome e a localização de um item que pertenceu ao herói."
      }
    ],

    npcs: [
      {
        name: "O Dragão Dourado de Karloth",
        historia: "Criatura de origem desconhecida que descansa no vulcão de Karloth desde a partida de Jurgmund. Não é um dragão comum — tem olhos de âmbar e escamas que emitem luz dourada visível de qualquer ponto das planícies. Não fala com mortais frequentemente, mas quando fala é em verdades absolutas. Alguns acreditam que é um aspecto de Jurgmund que ficou no mundo; outros, que é a consciência coletiva de todos os humanos que morreram na Batalha Colossal.",
        nivel: 25,
        itens: ["Escama Dourada (material ancestral)", "Chama Eterna (fogo que não apaga, guardado em sua garganta)"],
        conhecimentos: [
          "A história completa da Batalha Colossal — incluindo o nome de cada herói e o que cada um sacrificou",
          "A localização dos cinco itens Ancestrais no mundo atual",
          "O verdadeiro objetivo dos Araltos do Deus Marcado nesta era — e como derrotá-los",
          "Onde está o último elfo do mundo — e por que está escondido"
        ]
      },
      {
        name: "Xamã Erkha",
        historia: "Humana de 60 anos, descendente direta de um dos guerreiros que lutou na Batalha Colossal ao lado de Jurgmund. Carrega no braço uma marca em forma de cobra que apareceu no dia do nascimento. Lidera a tribo mais respeitada das planícies e serve de intérprete quando o Dragão Dourado decide falar com mortais — o que acontece uma vez por geração.",
        nivel: 8,
        itens: ["Cajado do Ancestral (arma mágica — herdada de seu bisavô que lutou na Batalha)", "Amuleto da Cobra Dupla", "Diário das Gerações (história oral escrita — missão)"],
        conhecimentos: [
          "Rituais para aproximar-se do Dragão Dourado sem provocar Amedrontamento",
          "A localização das Cavernas da Era Élfica e como passar pelo nível lacrado",
          "O nome do clã orc corrompido pelo fragmento do Deus Marcado — e onde está o fragmento"
        ]
      }
    ]
  },

  /* ================================================================
     2. MONTANHAS DE ATRELON
     ================================================================ */
  {
    id: "montanhas-atrelon",
    name: "Montanhas de Atrelon",
    icon: "⛰",
    summary: "Onde a cabeça de Jurgmund caiu após a Batalha Colossal, transformando-se ao longo de 500 anos no Castelo da Cobra — uma formação rochosa em espiral que imita a anatomia de uma cobra colossal e serve como lar dos Serpentarianos, humanos meio-cobra que veneram Jurgmund como divindade criadora. A região é fria, mística e controlada por um líder que não sabe que está sendo manipulado por um Aralto.",

    reinos: [
      {
        name: "Reino dos Serpentarianos",
        historia: "Quando a cabeça de Jurgmund tocou as montanhas de Atrelon, a energia colossal transformou a rocha em estruturas que lembram ossos e escamas em escala arquitetônica. Os primeiros humanos que habitaram essas estruturas foram gradualmente transformados ao longo das gerações — pele levemente escamosa, olhos com pupila vertical, capacidade de sentir calor com a língua. Chamam-se Serpentarianos e consideram a transformação uma bênção de Jurgmund.",
        racas: ["Serpentarianos (humanos meio-cobra)", "Kobolds (nas partes mais profundas do castelo)"],
        conflitos: "O Rei Serpentariano atual, Vassk, foi infiltrado por um Aralto que se apresentou como emissário de Jurgmund. Vassk acredita que está expandindo o reino em nome da cobra sagrada, mas está sendo guiado para conflito com os Reinos de Akaen. A população começa a suspeitar que algo está errado quando Vassk ordena ataques a caravanas humanas.",
        npcs: ["Rei Vassk (influenciado por Aralto)", "Alta Sacerdotisa Sss'era (oposta ao Aralto)", "O Aralto Sussurrante (identidade desconhecida)"]
      }
    ],

    cidades: [
      {
        name: "Castelo da Cobra — Espiral de Atrelon",
        historia: "A 'cidade' dos Serpentarianos é inteiramente o Castelo da Cobra — uma estrutura orgânica de rocha que cresceu sobre os restos de Jurgmund durante cinco séculos. Não há distinção entre palácio, cidade e templo — tudo é parte do mesmo organismo de pedra. As câmaras internas pulsam levemente com energia residual da cobra colossal. Visitantes externos relatam sentir que a estrutura está viva e observando.",
        npcs: [
          { nome: "Alta Sacerdotisa Sss'era", cargo: "Guardiã do Templo de Jurgmund", desc: "Serpentariana de 80 anos com escamas douradas — sinal de devoção extrema. Sabe que o emissário que influencia Vassk não é o que afirma ser, mas não tem provas suficientes para agir. Procura aventureiros discretos que possam investigar." },
          { nome: "Arquiteto Hess", cargo: "Estudioso da Estrutura", desc: "Humano externo que estuda o Castelo há 10 anos. Descobriu que a estrutura ainda cresce — milímetros por ano. Acredita que Jurgmund não está completamente morta, apenas dormindo." }
        ],
        itens: ["Escama de Cobra Sagrada (material mágico)", "Elixir da Transformação Parcial (permite sentir calor com a língua por 1 dia)", "Veneno de Serpentariano (raro — diferente de outros venenos)", "Mapa dos Corredores Internos do Castelo"]
      }
    ],

    dungeons: [
      {
        name: "Câmaras Profundas do Crânio",
        dificuldade: 4,
        historia: "O nível mais fundo do Castelo da Cobra, onde a cabeça de Jurgmund realmente repousou durante a queda. A pedra aqui é diferente — mais escura, quase translúcida, e emite calor constante. Os Kobolds que habitam esses níveis consideram as câmaras sagradas e atacam qualquer intruso. O Aralto Sussurrante usa essas câmaras para seus rituais — mas ninguém do reino sabe.",
        monstros: ["Kobolds Guardiões (dif.2)", "Serpente Colossal Menor — nascida da energia de Jurgmund (dif.3)", "Grande Sacerdote Kobold (dif.3)", "O Aralto Sussurrante (dif.4 — encontro de missão)"],
        itens: ["Fragmento do Crânio de Jurgmund (material ancestral — item de missão)", "Essência de Cobra Colossal (reagente lendário)", "Provas das atividades do Aralto (missão — liberta Vassk)", "Presas da Rainha (arma rara)"]
      },
      {
        name: "Ruínas Pré-Batalha nas Montanhas",
        dificuldade: 2,
        historia: "Antes da Batalha Colossal, estas montanhas eram habitadas por elfos que usavam os picos para observar e controlar territórios. As ruínas desse período ainda existem, espalhadas entre as formações rochosas do Castelo. Contêm fragmentos da história que os Serpentarianos não conhecem — os elfos sabiam o que Jurgmund era e tentaram se preparar para a batalha.",
        monstros: ["Goblin Batedeira (dif.1)", "Lobo das Trevas (dif.2)", "Golem de Pedra — construto élfico remanescente (dif.2)"],
        itens: ["Registros Élficos da Era Pré-Batalha (história — missão)", "Arma Élfica Antiga", "Cristal de Observação Élfico (permite ver a longas distâncias)", "Fragmento de Armadura Élfica (material)"]
      }
    ],

    locais_interesse: [
      {
        name: "A Espiral Central — Olho da Cobra",
        historia: "No centro do Castelo existe uma câmara circular aberta para o céu, onde as paredes formam uma espiral perfeita que concentra a luz da lua em um único ponto no centro. Os Serpentarianos chamam este ponto de Olho de Jurgmund. Quando a lua cheia ilumina o ponto central, a pedra ao redor brilha com luz azul-esverdeada e qualquer Serpentariano presente pode 'ouvir' Jurgmund — não em palavras, mas em sentimentos e imagens. O Aralto Sussurrante falsificou essas visões para manipular Vassk."
      },
      {
        name: "O Pescoço de Atrelon — A Passagem Proibida",
        historia: "A formação rochosa que representa o pescoço de Jurgmund é uma passagem estreita entre duas montanhas que, segundo os Serpentarianos, é proibido cruzar — pois seria 'cortar a cobra'. Na prática, a passagem leva a um vale do outro lado das montanhas que nenhum Serpentariano explorou em cinco séculos. Quem cruzou e voltou descreve um vale com flora completamente diferente e uma temperatura inexplicavelmente quente — como se algo abaixo do solo ainda vivesse."
      }
    ],

    npcs: [
      {
        name: "Alta Sacerdotisa Sss'era",
        historia: "Líder religiosa dos Serpentarianos, de 80 anos e escamas douradas — sinal máximo de devoção. Dedicou sua vida a interpretar os sinais de Jurgmund na estrutura do Castelo. Descobriu que as 'mensagens' que o emissário traz ao Rei contradizem tudo que Jurgmund sempre comunicou antes. Está sendo vigiada pelo Aralto e precisa de aliados externos para agir.",
        nivel: 11,
        itens: ["Cajado Sagrado de Jurgmund (herdado por 400 anos)", "Vestes da Sacerdotisa da Cobra", "Diário das Contradições (prova das manipulações do Aralto — missão)"],
        conhecimentos: [
          "Como identificar o Aralto Sussurrante — ele não projeta sombra ao meio-dia",
          "O ritual correto para comunicação real com Jurgmund (vs a falsificação do Aralto)",
          "Localização das Câmaras Profundas do Crânio e como entrar sem acordar os Kobolds"
        ]
      },
      {
        name: "O Aralto Sussurrante",
        historia: "Um dos servos do Deus Marcado que sobreviveu à Batalha Colossal. Apresentou-se ao Rei Vassk como emissário de Jurgmund há 15 anos — usando magia de ilusão e profundo conhecimento do culto da cobra para ser convincente. Seu objetivo é usar os Serpentarianos como exército para atacar os Reinos de Akaen, criando um conflito que enfraqueça o continente o suficiente para que o Deus Marcado seja revivido novamente.",
        nivel: 16,
        itens: ["Máscara da Ilusão (imita qualquer rosto)", "Amuleto do Deus Marcado — Oculto", "Dente do Primeiro Lobo (item lendário que usa para rituais)"],
        conhecimentos: [
          "A localização de outros Araltos no continente (se capturado e interrogado)",
          "O ritual de revivificação do Deus Marcado — e o que falta para completá-lo",
          "As fraquezas reais dos Serpentarianos que pretende explorar"
        ]
      }
    ]
  },

  /* ================================================================
     3. DESERTO CARMESIM
     ================================================================ */
  {
    id: "deserto-carmesim",
    name: "Deserto Carmesim",
    icon: "🏜",
    summary: "O deserto mais estranho do mundo — a areia é vermelha porque a Grande Salamandra Karlac, que cresce sem parar consumindo os restos do Deus Marcado espalhados pelo solo, caminha em círculos eternos pelo território há 500 anos. O calor de seu corpo tingiu a areia e o solo de carmesim. A cidade dos Karlacs — construída sobre a salamandra viva — é a única civilização permanente no deserto.",

    reinos: [
      {
        name: "Cidade Viva de Karlac — O Reino Ambulante",
        historia: "Não existe em ponto fixo no mapa — está onde Karlac está. Os Karlacs construíram uma cidade completa sobre o dorso da salamandra: casas de osso e couro tratado, praças abertas entre as escamas coossais, e um templo no alto da cabeça da criatura. A cidade move-se continuamente em círculos, mas tão devagar que os habitantes raramente notam o movimento. Nasceu como acampamento de sobreviventes que encontraram refúgio na criatura logo após a Batalha Colossal e nunca mais desceram.",
        racas: ["Karlacs (humanos de pele avermelhada — modificados pelo calor de Karlac)", "Alguns humanos das planícies que vivem como comerciantes itinerantes"],
        conflitos: "Karlac cresce. Cada vez que completa um círculo, é levemente maior. A cidade precisa se expandir junto, mas os recursos são limitados. Alguns Karlacs acreditam que quando Karlac for grande o suficiente, irá além do deserto e isso destruiria os reinos ao redor. Outros acreditam que é vontade do destino.",
        npcs: ["Grande Karlac Yorven (governante)", "Ritualista Amka (guia espiritual)", "Construtor Gral (engenheiro da cidade viva)"]
      }
    ],

    cidades: [
      {
        name: "Posto de Comércio de Areia Vermelha",
        historia: "O único ponto fixo no deserto — um oásis onde caravanas esperam a passagem de Karlac para fazer comércio com a cidade viva. Quando Karlac passa, os comerciantes têm aproximadamente duas horas para subir à cidade, negociar e descer antes que a salamandra se afaste. É o único lugar no mundo onde compras precisam ser planejadas em torno do horário de passagem de uma criatura colossal.",
        npcs: [
          { nome: "Comerciante Vrex", cargo: "Dono do posto", desc: "Karlac de 50 anos que desceu da cidade há 20 anos para montar o posto. Conhece o horário e rota de Karlac com precisão de minutos. Vende equipamento para sobreviver no deserto e informações sobre a cidade viva." }
        ],
        itens: ["Equipamento de Sobrevivência no Deserto", "Calor de Karlac Engarrafado (componente alquímico — aquecer qualquer líquido)", "Escama Menor de Karlac (material — resistente ao fogo)", "Mapa das Rotas Circulares de Karlac"]
      }
    ],

    dungeons: [
      {
        name: "Ossos do Deus Marcado — Minas Carmesim",
        dificuldade: 3,
        historia: "O deserto vermelho não é apenas areia — é areia misturada com fragmentos do corpo do Deus Marcado, espalhados pelo continente durante a Batalha Colossal. Em alguns pontos, onde a concentração é maior, os restos se cristalizaram em formações subterrâneas. Karlac consome esses cristais em sua rota, mas alguns bolsões foram selados por desabamentos. Criaturas corrompidas pela energia do Deus Marcado habitam essas minas.",
        monstros: ["Guerreiro Cultista da Marca — corrompidos (dif.2)", "Lobo das Trevas (dif.2)", "Cobra-Rainha Jovem — mutada pelo Deus Marcado (dif.3)"],
        itens: ["Cristal do Deus Marcado (material perigoso — pode ser arma ou veneno ou componente ritual)", "Essência Corrompida (reagente)", "Fragmento de Osso do Deus Marcado (item de missão)", "Armadura de Escamas de Dragão Réplica (achado em ruína)"]
      }
    ],

    locais_interesse: [
      {
        name: "O Centro do Círculo — Onde Tudo Começou",
        historia: "O ponto exato onde os restos do Deus Marcado se concentraram após a Batalha Colossal. A areia no centro do círculo de Karlac é mais vermelha que qualquer outra — quase negra-carmesim. Plantas não crescem. Animais evitam instintivamente. Karlacs em transe conseguem 'ver' a batalha quando meditam no centro. Xamãs de outras regiões que vieram estudar o local relatam sentir a 'presença fraca' do Deus Marcado — não morto, não vivo, apenas... aguardando."
      },
      {
        name: "As Costas de Karlac — Vista do Alto",
        historia: "Subir às costas de Karlac é uma experiência que poucos externos conseguem — os Karlacs não permitem visitas sem propósito claro. Quem chega ao alto vê o deserto carmesim de uma altura de quase 50 metros, com a cidade viva ao redor e o horizonte avermelhado em todas as direções. Diz-se que do alto das costas é possível ver, nos dias mais claros, o brilho dourado do Dragão nas montanhas a leste. Também é possível perceber que o círculo que Karlac faz é ligeiramente menor a cada geração — ela está convergindo para o centro."
      }
    ],

    npcs: [
      {
        name: "Grande Karlac Yorven",
        historia: "Governante da Cidade Viva, de 55 anos, com pele completamente avermelhada e olhos amarelos — mais transformado que qualquer outro Karlac. Governa com sabedoria adquirida pelo contato constante com Karlac, que os Karlacs acreditam que transmite memórias e visões por vibração. Preocupado com o crescimento contínuo da salamandra e o que isso significa para o continente.",
        nivel: 9,
        itens: ["Lança das Escamas (arma feita com escama de Karlac — imune ao fogo)", "Armadura de Karlac (couro reforçado com escamas)", "Fragmento de Memória de Karlac (cristal que contém visões)"],
        conhecimentos: [
          "Karlac está convergindo para o centro do círculo — em aproximadamente 200 anos, chegará ao ponto de maior concentração do Deus Marcado. O que acontecerá é desconhecido",
          "Localização dos bolsões de cristal do Deus Marcado não consumidos por Karlac",
          "O Deus Marcado não está completamente morto — Karlac sente isso em cada cristal que consome"
        ]
      },
      {
        name: "Ritualista Amka",
        historia: "Guia espiritual dos Karlacs, de 40 anos. Dedica-se a interpretar os tremores e movimentos de Karlac como comunicação da criatura. Descobriu algo alarmante: recentemente Karlac mudou ligeiramente sua rota — não muito, imperceptível para não-especialistas — como se estivesse evitando algo ou indo em direção a algo.",
        nivel: 6,
        itens: ["Cajado de Escama (canaliza calor de Karlac como energia mágica)", "Tônico das Costas (permite ouvir os tremores de Karlac por 24h)", "Diário das Mudanças de Rota (missão)"],
        conhecimentos: [
          "A mudança de rota de Karlac começou há 3 anos — coincide com a primeira atividade do Aralto nas Montanhas de Atrelon",
          "Há um bolsão de cristal do Deus Marcado nas Minas Carmesim que Karlac consistentemente evita — o único",
          "Ritual para 'conversar' com Karlac através de vibração — requer tocar o solo diretamente"
        ]
      }
    ]
  },

  /* ================================================================
     4. GRANDE LAGO CENTRAL
     ================================================================ */
  {
    id: "grande-lago",
    name: "Grande Lago Central",
    icon: "🌊",
    summary: "Formado quando o centro do continente foi rasgado pela Batalha Colossal, o Grande Lago tem tão de lado a lado que não se vê a outra margem do centro. Foi altamente contaminado pelo caos da batalha, mas a Tartaruga Magnalaga — ser ancestral que habitava as profundezas — absorveu toda a contaminação e se transformou em uma nova criatura colossal. Agora repousa no centro do lago, com anões que construíram uma cidadela sobre seu casco.",

    reinos: [
      {
        name: "Cidadela dos Anões do Casco — Magnalaga Superior",
        historia: "Quando a Tartaruga absorveu a contaminação, cresceu até atingir proporções colossais e subiu à superfície — provavelmente por instinto de sobrevivência. Os anões que habitavam as margens do lago, vendo a tartaruga emergir como uma ilha de pedra viva, interpretaram como sinal divino e construíram sobre ela. A cidadela existe há 490 anos. Os anões desenvolveram técnicas de construção únicas para lidar com superfícies vivas que se movem levemente.",
        racas: ["Anões do Casco (adaptados à vida sobre superfície viva)", "Alguns halflings marinheiros"],
        conflitos: "A tartaruga mergulha periodicamente — por períodos que variam de horas a dias. A cidadela tem sistemas de âncoras e vedação para sobreviver esses momentos. O maior medo anão é que Magnalaga mergulhe definitivamente e não volte. Rumores de que um Aralto está tentando 'contaminar' novamente o lago para forçar a tartaruga a emergir permanentemente.",
        npcs: ["Rei Anão Burrak Pedra-Dura", "Engenheira Hrissa (especialista em construção viva)", "Mergulhador Lendário Konn"]
      },
      {
        name: "Comunidades das Margens",
        historia: "Cidades e vilas humanas nas margens do lago que surgiram para explorar a pesca e o comércio com a Cidadela. Vivem em paz relativa mas com medo constante: o lago, mesmo purificado pela tartaruga, ainda guarda criaturas que vieram das profundezas durante a contaminação e nunca foram para o fundo novamente.",
        racas: ["Humanos pescadores", "Elfos costeiros (raríssimos — uns poucos sobreviventes do genocídio do Deus Marcado)"],
        conflitos: "Tensão entre os anões do casco (que controlam acesso à tartaruga e cobram pedágio) e as comunidades marginais. Avistamentos crescentes de criaturas das profundezas. Um elfo das margens foi assassinado — possivelmente por Araltos, que odeiam elfos como o Deus Marcado odiava.",
        npcs: ["Prefeita Lena (margem sul)", "O Último Elfo — Tharion (em fuga)"]
      }
    ],

    cidades: [
      {
        name: "Cidadela do Casco",
        historia: "Construída inteiramente sobre o dorso da Tartaruga Magnalaga, a Cidadela é uma obra-prima de engenharia anã — e de fé. O casco da tartaruga tem textura de pedra antiga, mas pulsa com calor suave e, segundo os anões mais sensíveis, 'respira'. As estruturas são construídas com sistemas de amortecimento para os movimentos da tartaruga. Quando ela mergulha, a cidadela sela-se hermeticamente em menos de 10 minutos — os anões praticam esse procedimento mensalmente.",
        npcs: [
          { nome: "Rei Burrak Pedra-Dura", cargo: "Rei dos Anões do Casco", desc: "Anão de 120 anos que governa com pragmatismo absoluto. Sabe mais sobre Magnalaga que qualquer pessoa viva — inclusive que ela está 'acordando' lentamente nos últimos 50 anos." },
          { nome: "Engenheira Hrissa", cargo: "Chefe de Construção", desc: "Inventou os sistemas de selagem que permitem ao povo sobreviver os mergulhos. Descobriu que o casco está crescendo — a cidadela precisará ser expandida ou parte dela abandonada em 30 anos." }
        ],
        itens: ["Pedra Viva do Casco (material único — combina propriedades de pedra e osso)", "Âncora de Emergência (dispositivo para mergulho)", "Cerveja Anã do Casco (efeito especial: resistência a dano aquático por 4h)", "Mapas das Profundezas do Lago (parciais — até onde os anões mergulharam)"]
      },
      {
        name: "Porto da Margem Sul",
        historia: "Maior cidade marginal, com 20.000 habitantes. Principal ponto de comércio com a Cidadela do Casco. O mercado de peixe é o maior do continente, mas em segundo plano existe comércio de criaturas capturadas das profundezas — vivas, para pesquisa; mortas, para alquimia. A última vez que Magnalaga emergiu por mais de uma semana, a cidade foi temporariamente inundada.",
        npcs: [
          { nome: "Konn, o Mergulhador Lendário", cargo: "Explorador das Profundezas", desc: "Humano de 45 anos com pulmões artificialmente expandidos por uma poção experimental. Chegou mais fundo no lago que qualquer outro ser vivo (exceto a própria Magnalaga). Viu algo no fundo que não quer falar." }
        ],
        itens: ["Equipamento de Mergulho Avançado", "Criaturas das Profundezas (vivas — para pesquisa ou combate)", "Óleo de Profundeza (luz nas trevas aquáticas por 4h)", "A Carta de Konn (missão — o que ele viu no fundo do lago)"]
      }
    ],

    dungeons: [
      {
        name: "As Profundezas — O Fundo Contaminado",
        dificuldade: 4,
        historia: "Magnalaga absorveu a contaminação da superfície e da maioria das profundezas, mas há uma região no fundo do lago — a fissura original aberta pela Batalha Colossal — que permanece contaminada. Criaturas bizarras evoluíram nessa área nos últimos 500 anos. Konn viu o que está no fundo mais profundo da fissura e recusou-se a mergulhar novamente. Segundo ele, não é uma criatura — é um buraco que 'respira'.",
        monstros: ["Criaturas Aquáticas Mutadas (dif.2-3)", "Serpente das Profundezas (dif.3)", "Guardião da Fissura — criatura de 500 anos (dif.4)"],
        itens: ["Fragmento da Fissura (pedra do fundo — material único com propriedades desconhecidas)", "Essência Contaminada (reagente perigoso)", "O que está no buraco que respira (item de missão — descoberta que muda a campanha)"]
      }
    ],

    locais_interesse: [
      {
        name: "O Casco de Magnalaga — Superfície da Tartaruga",
        historia: "As partes do casco não cobertas pela Cidadela são um ambiente único: textura de pedra antiga, mas com musgo bioluminescente que não existe em nenhum outro lugar do mundo. Anões mais velhos dizem que o musgo 'conta histórias' — padrões específicos aparecem que correspondem a eventos importantes. O padrão que apareceu três meses atrás não foi identificado por ninguém ainda."
      },
      {
        name: "A Margem do Genocídio — Memorial Élfico",
        historia: "Na margem norte do lago existe um trecho onde nenhuma vegetação cresce desde a Batalha Colossal. Os poucos elfos sobreviventes que habitam a região mantêm um memorial silencioso: pedras arranjadas em padrões que representam os clãs élficos exterminados pelo Deus Marcado. O último elfo livre, Tharion, visita o memorial toda lua nova e desaparece antes que alguém possa falar com ele. Os Araltos procuram ativamente o memorial para destruí-lo."
      }
    ],

    npcs: [
      {
        name: "Rei Burrak Pedra-Dura",
        historia: "Anão de 120 anos que nunca viveu em solo fixo — nasceu, cresceu e governou sobre a tartaruga. Tem uma ligação que beira o espiritual com Magnalaga: sente quando ela vai mergulhar antes de qualquer sinal físico, e acredita que ela está tentando comunicar algo que os anões não conseguem entender ainda.",
        nivel: 12,
        itens: ["Machado do Casco (forjado com osso de Magnalaga)", "Armadura de Pedra Viva (única)", "Sinalizador de Emergência de Mergulho (dispositivo anão)"],
        conhecimentos: [
          "Magnalaga está acordando — os mergulhos ficaram mais frequentes nos últimos 50 anos, como se ela estivesse procurando algo",
          "O musgo bioluminescente do casco mostrou um padrão novo que parece ser uma localização geográfica — mas ninguém sabe onde",
          "Há anões que desapareceram explorando o fundo do lago perto da Fissura — sem rastro"
        ]
      },
      {
        name: "Tharion — O Último Elfo",
        historia: "Elfo de 600 anos e único sobrevivente direto da era em que elfos dominavam o mundo. Não participou do regime de escravidão — era jovem e pertencia a uma facção minoritária que se opunha às práticas. Sobreviveu ao Deus Marcado escondendo sua natureza. Vive disfarçado como humano idoso nas margens do lago, guardando memórias de um mundo que ninguém mais lembra.",
        nivel: 14,
        itens: ["Arco Élfico Ancestral (item único de seu povo)", "Grimório Élfico (magias pré-humanas — nível 4-5)", "Anel de Disfarce (parece humano permanentemente)"],
        conhecimentos: [
          "A história verdadeira da Era Élfica — incluindo por que os elfos escravizavam outras raças (e se havia uma razão além de poder)",
          "O paradeiro de artefatos élficos escondidos antes do Deus Marcado destruir os clãs",
          "Por que o Deus Marcado odiava especificamente os elfos — uma informação que mudaria como os personagens entendem o conflito atual"
        ]
      }
    ]
  },

  /* ================================================================
     5. REINOS DE AKAEN
     ================================================================ */
  {
    id: "reinos-akaen",
    name: "Reinos de Akaen",
    icon: "🏛",
    summary: "O coração político do continente, onde humanos, orcs e goblins construíram seus maiores reinos após a libertação da Era Élfica. Cinco dos maiores reinos têm fundadores heróis — um guerreiro, um mago, um arqueiro, um ladino e um clérigo que lutaram ao lado de Jurgmund na Batalha Colossal. 500 anos depois, esses reinos carregam o nome ou o legado de seus fundadores. O maior risco atual é um dos reinos sendo subvertido por um Aralto que trabalha para reedificar o domínio do Deus Marcado.",

    reinos: [
      {
        name: "Reino de Valdris — Fundado pelo Guerreiro",
        historia: "Valdris, o guerreiro que primeiro organizou os humanos contra os elfos e depois liderou a vanguarda contra o Deus Marcado, fundou este reino com a filosofia de que força sem propósito é tirania. 500 anos depois, o Reino de Valdris é o maior do continente e mantém um exército permanente — não para conquista, mas porque Valdris previu que o Deus Marcado voltaria. Seu diário profético, guardado na capital, descreve com detalhe perturbador o presente.",
        racas: ["Humanos (maioria)", "Orcs (integrados como cidadãos plenos)", "Goblins (ainda lutam por reconhecimento)"],
        conflitos: "O Rei atual, descendente de Valdris, encontrou uma página do diário que não havia sido lida — e que nomeia um traidor. Um dos cinco conselheiros reais é descrito como 'aquele que sorri com a boca de Lobo'. Ninguém sabe quem é o Aralto infiltrado.",
        npcs: ["Rei Edric de Valdris (descendente do herói)", "General Marka (chefe militar)", "Arquivista Drem (guarda o diário de Valdris)"]
      },
      {
        name: "Reino de Arcath — Fundado pelo Mago",
        historia: "A maga Arcath foi a primeira humana a aprender magia de verdade — ela descobriu que os elfos não tinham poder inato, mas um método de canalização que podiam ensinar. Ensinou todos os humanos que quiseram aprender, democratizando a magia. Seu reino é o mais academicamente avançado do continente, com a maior biblioteca e a única escola de magia pública.",
        racas: ["Humanos", "Meio-elfos (raros mas aceitos)", "Alguns gnomos"],
        conflitos: "A escola de magia encontrou um grimório de origem desconhecida que contém magias que não deveriam existir — e está sendo estudado em segredo. Três estudantes desapareceram após trabalhar com o grimório.",
        npcs: ["Grande Maga Sela (diretora da escola)", "Estudante Corvus (sobrevivente dos três que trabalharam com o grimório)"]
      },
      {
        name: "Reino de Ferrath — Fundado pelo Arqueiro",
        historia: "Ferrath, o arqueiro que abateu o núcleo de poder do Deus Marcado com uma flecha dourada (que alguns dizem ter sido fabricada pelo próprio Dragão Dourado), fundou um reino de caçadores e exploradores. Ferrath era famoso por explorar territórios que ninguém ousava entrar. Seu reino é o mais distribuído geograficamente — muitas vilas espalhadas, ligadas por rotas de caça.",
        racas: ["Humanos", "Meio-orcs", "Elfos das florestas (pouquíssimos)"],
        conflitos: "Um grupo de caçadores de Ferrath encontrou rastros de Lobo do Vazio nas florestas do norte — criaturas que só aparecem quando o Deus Marcado está ativo. O Rei de Ferrath não quer acreditar; o capitão de guarda quer agir.",
        npcs: ["Rei Harren de Ferrath", "Capitã Lyss da Guarda (quer investigar os rastros)"]
      },
      {
        name: "Reino de Sombrath — Fundado pelo Ladino",
        historia: "A ladina Sombrath foi espião durante toda a guerra, infiltrando os elfos e depois o séquito do Deus Marcado. Fundou um reino onde informação é a moeda mais valiosa. Sombrath é o segundo maior reino e o mais influente diplomaticamente — sua rede de informantes cobre todo o continente.",
        racas: ["Humanos", "Goblins (excelentes espiões — tratados com igualdade plena aqui)", "Halflings"],
        conflitos: "Um Aralto está operando dentro de Sombrath — não apenas infiltrado, mas potencialmente ocupando posição de poder. A rede de informantes do reino detectou atividade que contradiz os relatórios oficiais. O Rei de Sombrath está sendo manipulado ou é o Aralto.",
        npcs: ["Rei Dorin de Sombrath (suspeito)", "Espiã Mira (faz duplo jogo)", "Informante Kin (fonte dos alertas)"]
      },
      {
        name: "Reino de Sanctum — Fundado pelo Clérigo",
        historia: "O clérigo Sanctum curou os feridos de toda a Batalha Colossal — humanos, orcs, goblins e, dizem alguns registros, até a própria Jurgmund antes da cobra partir. Fundou um reino baseado em cura e neutralidade. Sanctum é território neutro diplomático — nenhuma guerra pode ser declarada em solo sanctumense.",
        racas: ["Humanos (clérigos e médicos)", "Todas as raças (em hospitais e templos)"],
        conflitos: "Alguém está envenenando os suprimentos medicinais de Sanctum — metodicamente, de formas que passam despercebidas até o momento de uso em batalha. Os Araltos sabem que desabilitar Sanctum deixaria o continente sem capacidade de cura em uma guerra.",
        npcs: ["Alta Clérigo Vessa (investiga o envenenamento)", "Mensageiro Anonymus (fonte dos alertas)"]
      }
    ],

    cidades: [
      {
        name: "Valdris — Capital do Maior Reino",
        historia: "Cidade de 100.000 habitantes construída ao redor da Fortaleza do Guerreiro — a casa original de Valdris, que se tornou palácio real. No centro da cidade existe a estátua de Valdris apontando em direção às Montanhas de Atrelon — dizem que no dia da Batalha Colossal, Valdris ficou nessa posição por horas observando Jurgmund lutar. A página do diário que foi encontrada está guardada na Fortaleza sob proteção máxima.",
        npcs: [
          { nome: "Arquivista Drem", cargo: "Guardião do Diário de Valdris", desc: "Goblin de 60 anos que dedica sua vida a preservar os escritos do fundador. É o único que leu todas as páginas do diário — e a página nova o perturbou profundamente. Procura alguém de fora da corte para revelar o que descobriu." }
        ],
        itens: ["Equipamento Militar de Primeira Linha", "Cópia do Diário de Valdris (versão pública — a página nova não está incluída)", "Armas Históricas da Batalha Colossal (museu — inalienáveis)", "Informação: a página nova do diário (obtida com Drem)"]
      },
      {
        name: "Arcath — Cidade da Magia",
        historia: "Cidade acadêmica onde metade da população é estudante ou pesquisadora. A Torre de Arcath — 40 andares, construída pela fundadora com magia — ainda está de pé e é o edifício mais alto do continente. O grimório misterioso está guardado no décimo subsolo da Torre, que requer 5 senhas diferentes para acessar e mesmo assim deixou três estudantes desaparecerem.",
        npcs: [
          { nome: "Corvus", cargo: "Estudante Sobrevivente", desc: "Jovem de 22 anos, o único dos três que trabalhava com o grimório que não desapareceu. Não conta o que viu mas tem pesadelos todas as noites e está estudando rituais de proteção com urgência." }
        ],
        itens: ["Grimórios de Todos os Níveis (loja especializada)", "Componentes Mágicos Raros", "Acesso à Biblioteca de Arcath (mediante pesquisa documentada)", "O Grimório Misterioso (missão — mas acessar é perigoso)"]
      }
    ],

    dungeons: [
      {
        name: "As Ruínas de Ouro — Palácio Élfico Original",
        dificuldade: 3,
        historia: "Antes dos humanos libertarem as outras raças, os elfos tinham um palácio central em Akaen de onde coordenavam o domínio. O palácio foi destruído durante a Primeira Era, mas suas fundações ainda existem abaixo da capital de Valdris. Os elfos esconderam seus registros mais importantes nas câmaras inferiores — incluindo, segundo rumores, a técnica original de canalização mágica que Arcath aprendeu com eles.",
        monstros: ["Golem Élfico Remanescente (dif.2)", "Armadilhas Mágicas Élficas (dif.3)", "Fantasma do Último Governador Élfico (dif.3 — pode negociar)"],
        itens: ["A Técnica Original da Magia Élfica (grimório de missão — pode mudar o sistema mágico do mundo)", "Artefatos Élficos do Regime (itens poderosos mas moralmente questionáveis)", "Registros do Regime Élfico (história completa — missão)"]
      },
      {
        name: "Catacumbas de Sombrath — A Rede Oculta",
        dificuldade: 4,
        historia: "Abaixo de Sombrath existe uma rede de túneis usada pela fundadora para movimentar espiões. Hoje o Aralto que opera no reino usa esses mesmos túneis para seus próprios propósitos. Encontros aqui são imprevisíveis — você pode encontrar um espião de Sombrath, um agente do Aralto, ou ambos sem saber a diferença.",
        monstros: ["Espiões de Sombrath — podem ser aliados ou inimigos (dif.2)", "Agentes do Aralto — humanos transformados (dif.3)", "O Aralto de Sombrath (dif.4 — encontro de missão)"],
        itens: ["Registros de Operações do Aralto (missão — prova do que está acontecendo)", "Equipamento de Espionagem Avançado", "A Identidade Real do Rei Dorin (missão — é ele o Aralto, ou está sendo controlado?)"]
      }
    ],

    locais_interesse: [
      {
        name: "Os Cinco Marcos dos Heróis",
        historia: "Em cinco pontos do território de Akaen existem marcos de pedra colocados pelos próprios heróis fundadores no dia em que decidiram fundar reinos em vez de continuar nômades. Cada marco tem uma inscrição diferente — não sobre o passado, mas sobre o futuro. O marco de Valdris diz: 'Quando o Lobo rugir pela segunda vez, os cinco marcos revelarão o caminho.' Ninguém entendeu o que isso significa até que os primeiros sinais dos Araltos começaram a aparecer. Os marcos começaram a brilhar levemente à noite."
      },
      {
        name: "A Árvore de Jurgmund — Monumento em Sanctum",
        historia: "No centro de Sanctum existe uma árvore que não estava lá antes da Batalha Colossal. Cresceu no dia seguinte ao fim da batalha, de uma semente que ninguém plantou, no local onde o clérigo Sanctum realizou sua última cura. A árvore é do tipo mais raro do mundo — não existe outra como ela. Suas folhas têm propriedades curativas que amplificam qualquer magia de cura realizada sob sua sombra. Os Araltos sabem disso e a árvore está na lista de alvos."
      }
    ],

    npcs: [
      {
        name: "Arquivista Drem",
        historia: "Goblin de 60 anos, descendente de um dos goblins que o guerreiro Valdris libertou pessoalmente durante a guerra. Sua família jurou lealdade eterna a Valdris — e Drem honra esse juramento guardando o diário. A página nova, encontrada em um compartimento secreto durante uma restauração, descreve alguém no presente que corresponde a um dos cinco conselheiros reais de forma perturbadora.",
        nivel: 3,
        itens: ["Cópia pessoal do diário completo (incluindo a página nova)", "Chave do Arquivo Profundo", "Anel de Autenticação de Valdris (prova de que foi dado ao antepassado de Drem pelo próprio guerreiro)"],
        conhecimentos: [
          "O conteúdo da página nova do diário — e qual conselheiro ela descreve",
          "Localização do compartimento secreto de Valdris na Fortaleza onde pode haver mais páginas",
          "A profecia completa de Valdris sobre o retorno do Deus Marcado — nunca tornada pública"
        ]
      },
      {
        name: "O Último Elfo — Tharion",
        historia: "O mesmo elfo das margens do Grande Lago que visita o memorial. Tharion era jovem quando sua espécie dominava o mundo — pertencia à facção oposta, aquela que acreditava que elfos e outras raças deveriam coexistir. Sobreviveu ao Deus Marcado porque, ironicamente, se opor ao regime élfico o colocou nas margens da sociedade élfica quando o Deus Marcado atacou. Vive disfarçado e observa. Há 500 anos. Cansado, mas não pronto para parar.",
        nivel: 17,
        itens: ["Arco Élfico da Serpente Alada (item mágico — usou na Batalha Colossal)", "Grimório Élfico Completo (único exemplar)", "Memória Élfica (cristal com 600 anos de história pessoal)"],
        conhecimentos: [
          "Por que o Deus Marcado odiava os elfos: os elfos descobriram como destruí-lo permanentemente — o Deus Marcado os eliminou antes que usassem o conhecimento. Esse conhecimento ainda existe, escondido na mente de Tharion",
          "A localização dos cinco itens Ancestrais — Tharion os viu serem criados durante a Batalha Colossal",
          "O nome verdadeiro de cada Aralto — ele os conheceu quando ainda serviam ao Deus Marcado antes da batalha"
        ]
      },
      {
        name: "Grande Maga Sela",
        historia: "Diretora da Escola de Arcath há 30 anos, descendente direta de um dos primeiros alunos da fundadora Arcath. Está aterrorizada com o grimório encontrado mas não consegue pará-lo — ou destruí-lo. Cada vez que tenta destruir, o grimório aparece de volta no mesmo lugar. Está convicta de que o grimório foi 'plantado' por alguém que sabia que seria encontrado.",
        nivel: 13,
        itens: ["Orbe do Conhecimento Infinito (herança acadêmica)", "Cajado da Tempestade Arcana (versão simplificada da escola)", "Registros de Estudo do Grimório Misterioso (missão)"],
        conhecimentos: [
          "O grimório contém magias que só seriam possíveis combinando magia humana com poder do Deus Marcado — alguém colaborou",
          "Os três estudantes desaparecidos não morreram — foram transportados para algum lugar. As assinaturas mágicas de suas partidas ainda estão no subsolo da Torre",
          "A escola tem um infiltrado — alguém com acesso às senhas do décimo subsolo que não deveria ter esse acesso"
        ]
      }
    ]
  }

];

/* ================================================================
   RENDERIZAÇÃO — acordeão aninhado
   ================================================================ */

document.addEventListener("DOMContentLoaded", () => {
  renderRegions();

  // Delegação de eventos — acordeão em qualquer nível
  document.getElementById("regions-container").addEventListener("click", e => {
    const trigger = e.target.closest("[data-accordion]");
    if (!trigger) return;
    e.stopPropagation();
    const panel = trigger.nextElementSibling;
    if (!panel || !panel.classList.contains("accordion-panel")) return;
    const isOpen = trigger.classList.contains("open");
    // Fecha irmãos do mesmo nível
    const parent = trigger.parentElement;
    parent.querySelectorAll(":scope > [data-accordion].open").forEach(t => {
      if (t !== trigger) {
        t.classList.remove("open");
        t.nextElementSibling?.classList.remove("open");
      }
    });
    trigger.classList.toggle("open", !isOpen);
    panel.classList.toggle("open", !isOpen);
  });
});

function renderRegions() {
  const container = document.getElementById("regions-container");
  container.innerHTML = WORLD_REGIONS.map(region => `
    <div class="region-block">
      <button class="accordion-trigger region-trigger" data-accordion>
        <span class="region-icon">${region.icon}</span>
        <span class="region-name">${region.name}</span>
        <span class="accordion-arrow">▾</span>
      </button>
      <div class="accordion-panel">
        <p class="region-summary">${region.summary}</p>
        ${renderSubSections(region)}
      </div>
    </div>
  `).join("");
}

function renderSubSections(region) {
  const sections = [
    { key: "reinos",          icon: "👑", label: "Reinos",            render: renderReino },
    { key: "cidades",         icon: "🏘", label: "Cidades",           render: renderCidade },
    { key: "dungeons",        icon: "⚔", label: "Dungeons",          render: renderDungeon },
    { key: "locais_interesse",icon: "🗿", label: "Locais de Interesse",render: renderLocalInteresse },
    { key: "npcs",            icon: "🧙", label: "NPCs",              render: renderNPC }
  ];

  return sections.filter(s => region[s.key]?.length).map(s => `
    <div class="subsection-block">
      <button class="accordion-trigger subsection-trigger" data-accordion>
        <span class="subsection-icon">${s.icon}</span>
        <span class="subsection-label">${s.label}</span>
        <span class="subsection-count">${region[s.key].length}</span>
        <span class="accordion-arrow">▾</span>
      </button>
      <div class="accordion-panel">
        ${region[s.key].map(item => renderEntry(item, s.render)).join("")}
      </div>
    </div>
  `).join("");
}

function renderEntry(item, renderFn) {
  const title = item.name;
  return `
    <div class="entry-block">
      <button class="accordion-trigger entry-trigger" data-accordion>
        ${entryBadge(item)}
        <span class="entry-name">${title}</span>
        <span class="accordion-arrow">▾</span>
      </button>
      <div class="accordion-panel entry-panel">
        ${renderFn(item)}
      </div>
    </div>
  `;
}

function entryBadge(item) {
  if (item.dificuldade) {
    const colors = { 1: "#6a9e50", 2: "#c8a020", 3: "#c0601a", 4: "#b03030", 5: "#6b0000" };
    return `<span class="entry-badge" style="background:${colors[item.dificuldade] || '#888'}">${"☠".repeat(item.dificuldade)}</span>`;
  }
  if (item.nivel) return `<span class="entry-badge entry-badge-npc">Nv. ${item.nivel}</span>`;
  return "";
}

function renderReino(r) {
  return `
    <div class="entry-content">
      <p class="entry-historia">${r.historia}</p>
      <div class="entry-row"><span class="entry-label">Raças presentes</span><span>${r.racas.join(", ")}</span></div>
      <div class="entry-row entry-row-alert"><span class="entry-label">⚡ Conflitos</span><span>${r.conflitos}</span></div>
      ${r.npcs?.length ? `<div class="entry-row"><span class="entry-label">NPCs principais</span><span>${r.npcs.join(", ")}</span></div>` : ""}
    </div>`;
}

function renderCidade(c) {
  return `
    <div class="entry-content">
      <p class="entry-historia">${c.historia}</p>
      ${c.npcs?.length ? `
        <div class="entry-section-title">Personagens</div>
        ${c.npcs.map(n => `
          <div class="entry-npc-inline">
            <span class="entry-npc-name">${n.nome}</span>
            <span class="entry-npc-cargo">${n.cargo}</span>
            <p class="entry-npc-desc">${n.desc}</p>
          </div>`).join("")}` : ""}
      ${c.itens?.length ? `
        <div class="entry-section-title">Itens disponíveis</div>
        <ul class="entry-list">${c.itens.map(i => `<li>${i}</li>`).join("")}</ul>` : ""}
    </div>`;
}

function renderDungeon(d) {
  const diffLabel = { 1:"Fácil", 2:"Equilibrado", 3:"Desafiador", 4:"Muito Forte", 5:"Chefe/Lenda" };
  return `
    <div class="entry-content">
      <div class="entry-row"><span class="entry-label">Dificuldade</span><span>${"☠".repeat(d.dificuldade)} ${diffLabel[d.dificuldade] || ""}</span></div>
      <p class="entry-historia">${d.historia}</p>
      ${d.monstros?.length ? `
        <div class="entry-section-title">Monstros encontrados</div>
        <ul class="entry-list">${d.monstros.map(m => `<li>${m}</li>`).join("")}</ul>` : ""}
      ${d.itens?.length ? `
        <div class="entry-section-title">Itens & Recompensas</div>
        <ul class="entry-list">${d.itens.map(i => `<li>${i}</li>`).join("")}</ul>` : ""}
    </div>`;
}

function renderLocalInteresse(l) {
  return `<div class="entry-content"><p class="entry-historia">${l.historia}</p></div>`;
}

function renderNPC(n) {
  return `
    <div class="entry-content">
      <p class="entry-historia">${n.historia}</p>
      <div class="entry-row"><span class="entry-label">Nível</span><span>${n.nivel}</span></div>
      ${n.itens?.length ? `
        <div class="entry-section-title">Itens</div>
        <ul class="entry-list">${n.itens.map(i => `<li>${i}</li>`).join("")}</ul>` : ""}
      ${n.conhecimentos?.length ? `
        <div class="entry-section-title">💡 Conhecimentos (podem passar aos jogadores)</div>
        <ul class="entry-list entry-list-conhecimentos">${n.conhecimentos.map(c => `<li>${c}</li>`).join("")}</ul>` : ""}
    </div>`;
}
