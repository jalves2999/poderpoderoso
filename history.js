"use strict";

/* ================================================================
   HISTÓRIA DO MUNDO DE AETHER
   Estrutura: 3 seções principais em acordeão
   Cada seção tem entradas em acordeão interno
   ================================================================ */

const WORLD_HISTORY = [

  /* ============================================================
     1. HISTÓRIA DO PASSADO
     ============================================================ */
  {
    id: "passado",
    icon: "📜",
    title: "História do Passado",
    entries: [
      {
        id: "era-elfica",
        badge: "era",
        badgeText: "Era Élfica",
        name: "O Domínio dos Elfos",
        content: {
          lore: `
            <p>Antes de qualquer reino humano existir, os elfos dominavam o mundo de Aether com uma superioridade que consideravam natural e inquestionável. Magos ancestrais de origem desconhecida, os elfos canalizavam energia mágica de maneiras que as outras raças jamais conseguiam replicar — ou assim acreditavam.</p>
            <p>Humanos, orcs, anões e goblins viviam como escravos. Não escravos de correntes, mas de propósito: cada raça foi atribuída a uma função. Humanos carregavam, construíam e morriam nas guerras dos elfos. Anões forjavam armamentos que nunca usariam. Orcs guardavam fronteiras de territórios que não eram seus. Goblins serviam como mensageiros, cozinheiros, e quando necessário, como escudos humanos.</p>
            <p>O que os elfos não sabiam — ou se recusavam a acreditar — era que o segredo de seu poder não era inato. Era um método. Uma técnica de canalização mágica que poderia, em princípio, ser ensinada.</p>
          `,
          fields: [
            { label: "Período", value: "Indeterminado — possivelmente milênios antes da Primeira Era" },
            { label: "Raças presentes", value: "Elfos (dominantes), Humanos, Orcs, Anões, Goblins (escravizados)" },
            { label: "Localização principal", value: "Palácio Central de Akaen (hoje, ruínas sob a capital de Valdris)" },
          ]
        }
      },
      {
        id: "primeira-era",
        badge: "era",
        badgeText: "Primeira Era",
        name: "A Libertação — Primeira Era Humana",
        content: {
          lore: `
            <p>Uma humana chamada Arcath descobriu o que os elfos escondiam: a magia não era dom de nascença. Era conhecimento. Ela observou, estudou e decifrou o sistema de canalização dos elfos durante anos de servidão como assistente de um mago élfico.</p>
            <p>Quando compreendeu, não guardou para si. Arcath ensinou todos que quiseram aprender. E ao ensinar, ela não criou apenas mágos — ela criou classes. O sistema de especialização que existe até hoje nasceu nesse período: o Guerreiro que canalizava força, o Mago que canalizava mente, o Arqueiro que canalizava precisão, o Ladino que canalizava sombra, o Clérigo que canalizava fé.</p>
            <p>Com poder nas mãos das raças escravizadas, a rebelião foi inevitável. O Guerreiro Valdris organizou os exércitos. A Ladina Sombrath infiltrou os palácios élficos. O Arqueiro Ferrath destruiu as torres de controle. O Clérigo Sanctum curou os feridos de ambos os lados — inclusive elfos que se renderam. E Arcath, do alto de suas magias, desmontou os sistemas de controle que mantinham as correntes invisíveis.</p>
            <p>A Primeira Era durou décadas de conflito gradual, não uma guerra de um único dia. Quando terminou, os elfos não foram exterminados — foram marginalizados. Humanos tomaram os territórios, fundaram reinos, e começaram a escrever sua própria história.</p>
          `,
          fields: [
            { label: "Heróis fundadores", value: "Arcath (Maga), Valdris (Guerreiro), Ferrath (Arqueiro), Sombrath (Ladina), Sanctum (Clérigo)" },
            { label: "Resultado", value: "Libertação das raças escravizadas; Fundação dos cinco Reinos de Akaen" },
            { label: "Legado", value: "O sistema de classes que existe até hoje; Os cinco Marcos dos Heróis espalhados por Akaen" },
          ]
        }
      },
      {
        id: "deus-marcado",
        badge: "evento",
        badgeText: "Evento Crítico",
        name: "O Retorno do Deus Marcado",
        content: {
          lore: `
            <p>O Deus Marcado é uma entidade dos tempos mais remotos de Aether — anterior aos elfos, anterior a qualquer registro. Sua natureza exata é desconhecida, mas dois fatos são certos: ele é do mal, e ele odeia os elfos com uma intensidade que vai além de qualquer rivalidade mundana. Os estudiosos especulam que os elfos fizeram algo a ele em eras tão antigas que nem eles mesmos lembravam — e o Deus Marcado nunca esqueceu.</p>
            <p>A campanha anterior se passou neste período. Um grupo de aventureiros foi recrutado pelos Araltos do Deus Marcado — os campeões da entidade — e eventualmente se tornaram eles mesmos Araltos. Através de suas ações, o Deus Marcado foi revivido.</p>
            <p>O resultado foi devastador para os elfos. A entidade varreu os clãs élficos com precisão cirúrgica, como se soubesse exatamente onde cada elfo estava escondido. Em questão de meses, uma raça que havia dominado o mundo por milênios foi reduzida a poucos sobreviventes dispersos.</p>
            <p>O que o Deus Marcado não contava era com Jurgmund.</p>
          `,
          fields: [
            { label: "Os Araltos", value: "Campeões do Deus Marcado. Humanos (e outras raças) que fizeram pacto com a entidade em troca de poder. Sobreviventes desta era são os vilões do presente." },
            { label: "Impacto nos elfos", value: "Virtual extinção. Apenas pouquíssimos sobreviveram, disfarçados entre outras raças. O último elfo conhecido é Tharion, escondido nas margens do Grande Lago Central." },
          ]
        }
      },
      {
        id: "batalha-colossal",
        badge: "evento",
        badgeText: "A Batalha Colossal",
        name: "Jurgmund Contra o Deus Marcado",
        content: {
          lore: `
            <p>Jurgmund é a Cobra Colossal que habitava o mundo de Aether desde tempos imemoriais — não uma criatura comum, mas um ser de escala que desafiava a compreensão. Ela havia vivido em silêncio por eras, observando civilizações nascerem e caírem. O retorno do Deus Marcado foi o primeiro evento em milênios que a fez agir.</p>
            <p>Cinco heróis mortais — os mesmos que lideraram a libertação da Primeira Era — lutaram ao lado de Jurgmund. Cada um contribuiu com o que sua classe oferecia de mais poderoso: o Guerreiro Valdris segurou a linha enquanto a cobra atacava; o Arqueiro Ferrath disparou a flecha que destruiu o núcleo de poder da entidade (dizem que a flecha foi forjada com uma escama do próprio Dragão Dourado); Arcath desmontou os rituais que mantinham o Deus Marcado no plano material; Sombrath matou três Araltos que tentavam reviver a entidade durante a batalha; e Sanctum curou a própria Jurgmund quando ela foi ferida — um ato que nenhum mortal havia feito antes.</p>
            <p>O Deus Marcado foi derrotado. Não morto — derrotado. Há uma diferença. E os restos de sua essência, espalhados pelo continente durante a batalha, não desapareceram.</p>
            <p>Jurgmund, ferida e exausta de um modo que cobras colossais não deveriam conseguir estar, partiu deste mundo. Seu corpo se dissipou, mas os locais onde suas partes tocaram a terra foram transformados permanentemente.</p>
          `,
          fields: [
            { label: "Consequências geográficas", value: "Grande Lago Central (abertura do continente), Montanhas de Atrelon com Castelo da Cobra (cabeça de Jurgmund), Deserto Carmesim (restos do Deus Marcado), Tartaruga Magnalaga no lago (absorveu contaminação)" },
            { label: "Dragão Dourado", value: "Um aspecto de Jurgmund que ficou no mundo. Repousa no Vulcão de Karloth e emite brilho dourado visível de qualquer ponto das planícies." },
            { label: "O Deus Marcado", value: "Derrotado mas não morto. Sua essência está nos cristais carmesins do deserto. A Salamandra Karlac os consome, crescendo indefinidamente. O que acontece quando ela consumir o último fragmento é desconhecido." },
          ]
        }
      },
    ]
  },

  /* ============================================================
     2. HISTÓRIA DO PRESENTE
     ============================================================ */
  {
    id: "presente",
    icon: "⚔",
    title: "História do Presente",
    entries: [
      {
        id: "500-anos",
        badge: "evento",
        badgeText: "500 anos depois",
        name: "O Mundo Atual",
        content: {
          lore: `
            <p>Quinhentos anos se passaram desde a Batalha Colossal. O mundo mudou, mas os ecos da batalha ainda moldam cada canto do continente.</p>
            <p>Os cinco Reinos de Akaen foram fundados pelos heróis e prosperam — com atrito crescente. O Reino de Sombrath, o segundo maior, foi silenciosamente infiltrado por um Aralto do Deus Marcado que manipula o rei há mais de uma geração. O diário profético do Guerreiro Valdris tem uma página nova que ninguém consegue explicar, descrevendo um traidor no coração do poder.</p>
            <p>As Montanhas de Atrelon abrigam os Serpentarianos — humanos transformados pela proximidade da cabeça de Jurgmund. Seu rei, Vassk, está sendo manipulado pelo Aralto Sussurrante, que se disfarça de emissário de Jurgmund para usar o povo da cobra como exército contra os reinos vizinhos.</p>
            <p>No Grande Lago Central, a Tartaruga Magnalaga está acordando. Seus mergulhos ficaram mais frequentes. Os anões do casco notam que ela parece estar procurando algo no fundo da Fissura — a cicatriz que a Batalha Colossal deixou no leito do lago.</p>
            <p>E nos cinco anos mais recentes, os Araltos começaram a se mover. Após 500 anos de silêncio, os sobreviventes do pacto com o Deus Marcado agem novamente. Cultistas aparecem em cidades. Fragmentos do Deus Marcado somem dos bolsões onde estavam selados. O círculo que a Salamandra Karlac traça está, imperceptivelmente, se fechando.</p>
          `,
          fields: [
            { label: "Ameaça principal", value: "Os Araltos do Deus Marcado — sobreviventes de 500 anos atrás que planejam o retorno da entidade" },
            { label: "Status dos elfos", value: "Virtualmente extintos. Tharion, o Último Elfo (600 anos), vive disfarçado nas margens do Grande Lago. Carrega o segredo de como destruir o Deus Marcado permanentemente." },
            { label: "Os cinco Marcos dos Heróis", value: "Espalhados por Akaen, começaram a brilhar à noite. A profecia de Valdris diz: 'Quando o Lobo rugir pela segunda vez, os cinco marcos revelarão o caminho.'" },
          ]
        }
      },
      {
        id: "inicio-campanha",
        badge: "evento",
        badgeText: "Início da Campanha",
        name: "A Primeira Sessão — Theodor, a Menina e a Maldição",
        content: {
          lore: `
            <p>Os jogadores começam como escravos de Theodor — um homem de meia-idade com aparência de mercador próspero e olhos que guardam um cansaço que vai além do corpo. Theodor os comprou ou capturou por razões que não explica completamente. Ele não é cruel, mas é firme: seus escravos trabalham, não fazem perguntas, e não tentam fugir.</p>
            <p>Junto com ele viaja uma garota de aproximadamente 12 anos, muda desde que foi encontrada — ela nunca fala, nunca chora, e seus olhos negros parecem observar tudo com uma inteligência que vai além da idade. Theodor a chama apenas de "a menina". Ela usa um colar simples de osso que parece velho o suficiente para ser um artefato.</p>
            <p>A caravana chega a uma pequena cidade chamada Margem das Pedras — um entreposto comercial entre as planícies e as montanhas. É tarde da noite. O céu está claro.</p>
            <p>Então os lobos chegam.</p>
            <p>Não são lobos comuns. São avermelhados — a cor errada, os olhos errados, o movimento errado. E junto com eles vem um homem encapuzado que não ataca Theodor nem os escravos. Ele quer a menina. Theodor parece saber quem é o homem. E quando os dois se encaram, algo muda no comportamento de Theodor.</p>
            <p>Ele se vira para seus escravos. Há algo no rosto dele — não arrependimento exatamente, mas reconhecimento de uma dívida antiga sendo paga.</p>
            <p>"Levem-na para a Cabeça da Cobra," ele diz. "Encontrem o Castelo dos Serpentarianos nas montanhas de Atrelon. Ela precisa usar o Colar do Coração da Serpente lá. Você saberão o que fazer quando chegarem."</p>
            <p>Ele não espera confirmação. Se vira para o homem encapuzado e avança. Seus escravos — agora ex-escravos — ficam com uma menina muda, uma missão que não pediram, e uma maldição nova que Theodor lançou neles antes de virar as costas.</p>
            <p>A maldição não é punição. É garantia.</p>
          `,
          fields: [
            { label: "Theodor", value: "Ex-escravo liberto que virou mercador. Conhece a menina de uma vida anterior. Sabe mais sobre o Colar do Coração da Serpente do que deixa transparecer. Motivo real para protegê-la: ainda desconhecido." },
            { label: "A Menina Muda", value: "Aproximadamente 12 anos. Nunca fala. Nunca demonstra medo — nem dos lobos, nem do homem encapuzado. Parece entender o que está acontecendo antes de qualquer adulto no grupo. Seu silêncio é intencional, não involuntário." },
            { label: "O Colar do Coração da Serpente", value: "Item de osso antigo que a menina usa. Parece simples mas emana uma energia que criaturas do Deus Marcado detectam. O que faz no Castelo da Cobra: ainda não revelado." },
            { label: "O Homem Encapuzado", value: "Um Arauto do Deus Marcado — diferente dos Araltos em poder, mas servo da mesma entidade. Veio especificamente pela menina. Não revela por quê." },
          ]
        }
      },
      {
        id: "maldicao-theodor",
        badge: "evento",
        badgeText: "Mecânica",
        name: "A Maldição dos Três Fios — Marca de Theodor",
        content: {
          lore: `
            <p>Antes de se virar para enfrentar o Arauto, Theodor faz um gesto rápido — não agressivo, quase carinhoso — na direção dos escravos que liberta. Um fio invisível os toca. A maldição que ele lança não é de ódio. É de necessidade.</p>
            <p>Theodor aprendeu este feitiço de um clérigo de Jurgmund que o ajudou décadas atrás. É chamado de Marca dos Três Fios — uma ligação entre o portador e uma tarefa, expressa em três condições progressivas que pioram com o tempo se a tarefa não avança.</p>
          `,
          curse: {
            name: "Marca dos Três Fios",
            description: "Uma maldição de obrigação — não de punição, mas de propósito. O portador sente a tarefa inacabada como uma presença constante. Os efeitos pioram quanto mais tempo passa sem progresso real em direção ao objetivo.",
            stages: [
              {
                num: "Fio 1 — A Lembrança",
                trigger: "Ativo desde o início. Permanente até a missão ser concluída.",
                effect: "O portador sonha toda noite com a menina em perigo. Não importa onde esteja ou o que tenha feito — os sonhos vêm. −1 em testes de Percepção (cansaço acumulado). Uma vez por sessão, o Mestre pode fazer o portador lembrar vívidamente da cena dos lobos e do rosto de Theodor, causando 1 turno de hesitação se estiver em combate."
              },
              {
                num: "Fio 2 — O Peso",
                trigger: "Ativa se passarem 7 dias sem progresso real (sem se mover em direção ao Castelo da Cobra ou sem ações relevantes para a missão).",
                effect: "O colar da menina começa a pulsar visivelmente quando o portador está por perto — como se a chamasse. −1d4 em todos os testes de Resistência mental (a maldição pesa na mente). O portador não consegue descanso longo completo fora de locais sagrados de Jurgmund — só recupera 50% do HP e Slots de Magia em descanso comum."
              },
              {
                num: "Fio 3 — O Corte",
                trigger: "Ativa se passarem 21 dias sem progresso real, ou se o portador ativamente abandonar a missão e se afastar da menina.",
                effect: "O fio se torna físico: uma marca vermelha em forma de serpente aparece no pulso do portador. −1d6 em todos os atributos até que a missão progrida. O portador começa a ouvir a voz de Theodor em momentos de silêncio — apenas dizendo o nome da menina, repetidamente. Perde 1d10 HP máximo por dia neste estágio."
              }
            ],
            removal: "A maldição se dissolve completamente quando a menina usar o Colar do Coração da Serpente no local correto dentro do Castelo da Cobra. No momento em que isso acontece, o portador sente os três fios se soltarem simultaneamente — e muitos descrevem a sensação como acordar de um sonho muito longo.",
            secret: "Theodor sabia que não poderia acompanhá-los. A maldição não é punição — é o único modo que ele encontrou de garantir que pessoas sem razão aparente para ajudar a menina teriam uma razão impossível de ignorar. Se os jogadores descobrirem isso (possivelmente falando com clérigos de Jurgmund ou estudando a marca), a natureza da maldição muda: ela ainda existe, mas o portador pode escolher resistir ao Fio 3 com uma força de vontade genuína — se tiver uma razão própria para continuar a missão."
          },
          fields: [
            { label: "Como identificar a maldição", value: "Qualquer Clérigo ou Mago com acesso a Identificar Magia (nível 2+) pode detectar os fios. Descrever completamente a maldição exige um Clérigo de Jurgmund (os únicos que conhecem este feitiço)." },
            { label: "Remoção parcial", value: "O Fio 2 pode ser suspenso (não removido) por até 3 dias se o portador realizar um ritual simples de Jurgmund — qualquer Serpentariano pode ensinar." },
          ]
        }
      }
    ]
  },

  /* ============================================================
     3. MISSÕES
     ============================================================ */
  {
    id: "missoes",
    icon: "🎯",
    title: "Missões",
    entries: [

      /* ── MISSÃO PRINCIPAL ──────────────────────────────────── */
      {
        id: "missao-coração-serpente",
        badge: "main",
        badgeText: "Principal",
        isMain: true,
        name: "O Coração da Serpente",
        content: {
          lore: `
            <p>A missão que define o início da campanha: levar a menina muda do entreposto de Margem das Pedras até o Castelo da Cobra nas Montanhas de Atrelon, onde ela deverá usar o Colar do Coração da Serpente em local ainda não totalmente revelado.</p>
            <p>A jornada atravessa as planícies sudeste (com perigos de tribos e criaturas dos restos do Deus Marcado), passa pelo vulcão de Karloth (onde o Dragão Dourado repousa e pode fornecer informações cruciais), e sobe as montanhas — onde os Serpentarianos têm fronteiras fechadas sob influência do Aralto Sussurrante.</p>
          `,
          mission: {
            dias: "Indefinido (a Maldição dos Três Fios aplica pressão crescente após 7 e 21 dias sem progresso)",
            dificuldade: "☠☠☠ Progressiva — começa em Dif.2 e escala até Dif.4 no Castelo",
            npcs: ["A Menina Muda (protetora — NPC acompanhante)", "Theodor (desaparecido após a cena inicial — pode ser reencontrado)", "Alta Sacerdotisa Sss'era (aliada em potencial nos Serpentarianos)", "Rei Vassk (obstáculo ou aliado, depende do Aralto Sussurrante)", "O Arauto do Deus Marcado (antagonista recorrente — perseguirá o grupo)"],
            recompensas: [
              "🔓 Remoção da Maldição dos Três Fios",
              "💰 Promessa de Theodor: baú com 500 peças de ouro guardado em Margem das Pedras (se ele sobreviver)",
              "🗡 Item: Insígnia de Passagem Serpentariana (acesso livre ao Castelo da Cobra)",
              "✨ Magia: Os Serpentarianos ensinam o Ritual da Cobra Sagrada (magia exclusiva de Jurgmund, nível 3)",
              "📖 Conhecimento: A Alta Sacerdotisa revela a localização de um dos cinco itens Ancestrais"
            ],
            inimigos: [
              { nome: "Lobo Avermelhado do Arauto", id: "lobo-das-trevas", diff: 2 },
              { nome: "Cultistas do Arauto (perseguição)", id: "cultista-aralto", diff: 2 },
              { nome: "Lobo do Vazio (confronto final próximo ao Castelo)", id: "lobo-do-vazio", diff: 4 },
              { nome: "O Arauto do Deus Marcado", id: "aralto-menor", diff: 3 },
              { nome: "Patrulheiros Serpentarianos (se não tiverem passagem)", id: "serpentariano-patrulheiro", diff: 1 },
            ],
            descricao: `
              <p><strong>Cena 1 — Margem das Pedras (Sessão 1):</strong> Os lobos avermelhados atacam a caravana. São lobos das trevas imbuídos com energia do Deus Marcado pelo Arauto. O Arauto não luta diretamente — tenta paralisar ou dominar a menina enquanto os lobos distraem. Theodor enfrenta o Arauto em combate singular — os jogadores só veem o começo, não o fim. A cidade sofre dano colateral moderado.</p>
              <p><strong>Puzzle 1 — A Menina Não Fala:</strong> A menina muda é um NPC enigmático. Ela se comunica por gestos, apontamentos e olhares. Para descobrir para onde exatamente no Castelo da Cobra levá-la, os jogadores precisam decodificar as pistas que ela dá. Um teste de Percepção (normal) nota que ela aponta consistentemente para o norte. Um teste de Investigação (difícil) ou conversa com um Clérigo de Jurgmund revela que ela busca a Câmara do Olho — a Espiral Central do Castelo que ilumina pela lua cheia.</p>
              <p><strong>Encontro 2 — O Dragão Dourado (opcional, alto risco/recompensa):</strong> O grupo pode desviar para o Vulcão de Karloth. O Dragão não ataca mas sua presença causa Amedrontamento automático. Com auxílio da Xamã Erkha ou um teste de SAB (crítico), é possível conversar. O dragão pode revelar: a identidade do Arauto perseguidor, a rota mais segura para o Castelo, e que a menina "carrega algo que não deveria existir mais neste mundo — mas que talvez precise existir ainda por um tempo".</p>
              <p><strong>Conflito 3 — A Fronteira Serpentariana:</strong> O Rei Vassk fechou as fronteiras sob influência do Aralto Sussurrante. Os jogadores podem: (A) Encontrar a Alta Sacerdotisa Sss'era que oferece passagem secreta em troca de investigarem as atividades do emissário falso; (B) Tentar passar pela força — enfrenta patrulheiros e possivelmente o sacerdote; (C) Encontrar o Vale Proibido (o Pescoço de Atrelon) que nenhum Serpentariano cruza — rota mais perigosa, sem oposição humana.</p>
              <p><strong>Clímax — O Castelo da Cobra:</strong> A Câmara do Olho, no centro do Castelo, só ilumina na lua cheia. Se o grupo chegou na hora certa, a menina usa o colar no ponto central da Espiral. O que acontece: a ser revelado pelo Mestre. O Arauto fará uma última tentativa de interrupção — chegando com o Lobo do Vazio.</p>
              <p><strong>Pós-missão:</strong> Seja qual for o resultado do colar, a maldição se dissolve. A menina, pela primeira vez, faz um som — não uma palavra, mas um som. E aponta para o norte, onde ficam os Reinos de Akaen.</p>
            `
          }
        }
      },

      /* ── MISSÃO SECUNDÁRIA 1 ───────────────────────────────── */
      {
        id: "missao-theodor",
        badge: "side",
        badgeText: "Secundária",
        name: "O Destino de Theodor",
        content: {
          lore: `
            <p>Theodor ficou para trás enfrentando o Arauto do Deus Marcado. Os jogadores não viram o fim do combate. Ele pode estar morto, capturado, ou ter fugido. Descobrir o que aconteceu e, se possível, encontrá-lo revela camadas importantes da história da menina e do Colar.</p>
          `,
          mission: {
            dias: "Pode ser iniciada a qualquer momento. Resolução ideal: antes ou depois do clímax principal.",
            dificuldade: "☠☠ Equilibrado a ☠☠☠ Desafiador",
            npcs: ["Theodor (alvo da missão)", "Moradores de Margem das Pedras (testemunhas)", "Um Cultista capturado (fonte de informação)"],
            recompensas: [
              "💰 500 peças de ouro do baú prometido (se Theodor estiver vivo)",
              "📖 História completa da menina — quem ela é, de onde veio, por que o Arauto a quer",
              "🗡 Item: A arma pessoal de Theodor (arma rara com história)",
              "🔑 Pista: localização de um agente dos Araltos em Margem das Pedras que espionou a caravana"
            ],
            inimigos: [
              { nome: "Cultistas do Arauto (guarda do local onde Theodor está)", id: "cultista-aralto", diff: 2 },
              { nome: "Arauto do Deus Marcado (se confrontado novamente)", id: "aralto-menor", diff: 3 },
            ],
            descricao: `
              <p><strong>Investigação em Margem das Pedras:</strong> Moradores viram o final do combate entre Theodor e o homem encapuzado. O Arauto não matou Theodor — levou-o. Por quê capturar em vez de matar? Porque Theodor sabe onde a menina veio e por que o Arauto a quer.</p>
              <p><strong>Local de cativeiro:</strong> Um celeiro abandonado fora da cidade, guardado por cultistas. Theodor está vivo mas ferido. Se resgatado, ele conta: a menina foi encontrada por ele há 5 anos dormindo sobre um altar de Jurgmund nas planícies. O colar estava nela quando acordou. Ela nunca falou desde então. Theodor não sabe o que o colar faz — só que clérigos de Jurgmund que ele consultou disseram que ela precisa levá-lo à "Cabeça da Cobra, na noite certa".</p>
              <p><strong>Segredo de Theodor:</strong> Ele foi escravo dos elfos antes da Primeira Era. Tem mais de 200 anos — um humano que encontrou um fragmento de Jurgmund na batalha original e absorveu energia suficiente para envelhecer lentamente. Está morrendo. Encontrar a menina foi a última tarefa que se impôs antes de descansar.</p>
            `
          }
        }
      },

      /* ── MISSÃO SECUNDÁRIA 2 ───────────────────────────────── */
      {
        id: "missao-dragao",
        badge: "side",
        badgeText: "Secundária",
        name: "A Audiência com o Dragão Dourado",
        content: {
          lore: `
            <p>O Dragão Dourado de Karloth é visível de quase qualquer ponto das planícies — um brilho dourado no topo do vulcão. A Xamã Erkha da tribo das planícies sabe como se aproximar dele com segurança. Uma audiência com o dragão oferece informações de valor inestimável — mas obter essa audiência exige provar-se digno.</p>
          `,
          mission: {
            dias: "3 a 7 dias para completar o desvio até o vulcão e obter a audiência",
            dificuldade: "☠☠ para chegar / ☠☠☠☠ social (o dragão não é um combate — é um teste de caráter)",
            npcs: ["Xamã Erkha (guia e intérprete)", "Dragão Dourado de Karloth (NPC informante)"],
            recompensas: [
              "📖 Revelação: localização de dois itens Ancestrais no mundo atual",
              "📖 Revelação: o verdadeiro objetivo dos Araltos nesta era",
              "✨ Dom: o dragão pode conceder uma Escama Dourada a quem provar dignidade genuína (material para item Ancestral)",
              "🔑 Pista: o nome verdadeiro do Arauto que persegue o grupo"
            ],
            inimigos: [
              { nome: "Karlac Filhote (na rota do vulcão)", id: "karlac-filhote", diff: 1 },
              { nome: "Lobo das Trevas (guardiões das planícies)", id: "lobo-das-trevas", diff: 2 },
            ],
            descricao: `
              <p><strong>Encontrar Erkha:</strong> A Xamã está no Cruzamento Vivo (entreposto tribal) ou pode ser encontrada seguindo os padrões de fumaça que seu povo usa para comunicação. Ela concorda em guiar o grupo ao vulcão apenas se eles completarem uma tarefa simples: recuperar um item sagrado roubado de sua tribo por um orc corrompido pelo Deus Marcado.</p>
              <p><strong>A Subida ao Vulcão:</strong> O calor aumenta progressivamente. Criaturas do deserto evitam a área — o calor do dragão as mantém afastadas. O Amedrontamento começa a 100 metros do topo. Resistência SAB (normal) para continuar subindo. Falha significa parar — não fugir, apenas parar. O teste pode ser repetido a cada rodada.</p>
              <p><strong>A Audiência:</strong> O dragão não fala inicialmente. Observa. O grupo precisa declarar sua intenção sem mentir — o dragão detecta falsidade automaticamente. Se a intenção for genuína (proteger a menina, não ganho pessoal), o dragão responde. As informações que ele oferece são verdades absolutas — e algumas podem ser perturbadoras (ex: "A menina não é uma menina. Ou não apenas isso.").</p>
              <p><strong>Teste de Dignidade (opcional, alto risco):</strong> Um jogador pode pedir a Escama Dourada. O dragão faz uma única pergunta — diferente para cada personagem, definida pelo Mestre com base no histórico do personagem. Resposta honesta = escama. Resposta evasiva ou falsa = o dragão simplesmente olha para o próximo personagem, sem punição.</p>
            `
          }
        }
      },

      /* ── MISSÃO SECUNDÁRIA 3 ───────────────────────────────── */
      {
        id: "missao-aralto-margem",
        badge: "side",
        badgeText: "Secundária",
        name: "O Espião em Margem das Pedras",
        content: {
          lore: `
            <p>O Arauto sabia exatamente quando a caravana de Theodor chegaria em Margem das Pedras. Alguém passou a informação. Há um agente dos Araltos na cidade — um morador comum que há anos reporta atividades suspeitas para a rede do Deus Marcado.</p>
          `,
          mission: {
            dias: "2 a 4 dias. Pode ser resolvida em paralelo com a missão principal antes de sair da cidade.",
            dificuldade: "☠☠ Equilibrado",
            npcs: ["Prefeito da cidade (autoridade local, não sabe do espião)", "Comerciante Lenna (suspeita #1 — muito curiosa sobre a caravana)", "Guarda Vero (suspeita #2 — estava de serviço na noite do ataque e sumiu por horas)"],
            recompensas: [
              "💰 150 peças de ouro (recompensa do prefeito por identificar o espião)",
              "📖 Mapa parcial das rotas de comunicação dos Araltos na região",
              "🗡 Acesso ao inventário do espião (itens comuns a raros, mais uma carta cifrada)",
              "🔑 A carta cifrada revela outro agente em cidade próxima ao caminho para Atrelon"
            ],
            inimigos: [
              { nome: "O Espião (combate apenas se descoberto e encurralado)", id: "cultista-aralto", diff: 2 },
              { nome: "Reforço do Arauto (se o espião conseguir avisar)", id: "lobo-das-trevas", diff: 2 },
            ],
            descricao: `
              <p><strong>Investigação social:</strong> Testes de Percepção, Investigação e Persuasão para coletar testemunhos. A cidade está nervosa após o ataque. Moradores falam facilmente sobre o que viram — mas algumas informações se contradizem.</p>
              <p><strong>Pistas físicas:</strong> Uma pegada específica leva a um celeiro nos fundos de um estabelecimento. No celeiro, um pássaro mensageiro morto com uma mensagem enviada logo após a chegada da caravana. A mensagem está em cifra simples (Investigação normal para decifrar).</p>
              <p><strong>Confronto:</strong> O espião é o Guarda Vero — um homem comum que foi cooptado há dois anos quando um filho seu ficou doente e um "médico" (cultista disfarçado) o curou em troca de favores futuros. Ele não é fanático. Está com medo. Se confrontado com habilidade (não com força), pode ser virado como informante — oferecendo informações sobre a rede dos Araltos em troca de proteção.</p>
            `
          }
        }
      },

      /* ── MISSÃO SECUNDÁRIA 4 ───────────────────────────────── */
      {
        id: "missao-serpentarianos",
        badge: "side",
        badgeText: "Secundária",
        name: "A Verdade do Emissário Falso",
        content: {
          lore: `
            <p>A Alta Sacerdotisa Sss'era dos Serpentarianos sabe que o emissário que influencia o Rei Vassk não é o que afirma ser. Ela precisa de provas para agir — e aventureiros externos são a única opção que não vai diretamente ao Rei (que não acreditaria em sua sacerdotisa sobre um "emissário de Jurgmund").</p>
          `,
          mission: {
            dias: "3 a 6 dias. Parte dela pode acontecer durante a infiltração no Castelo para a missão principal.",
            dificuldade: "☠☠☠ Desafiador a ☠☠☠☠ nas Câmaras Profundas",
            npcs: ["Alta Sacerdotisa Sss'era (contratante)", "Rei Vassk (alvo secundário — proteger ou libertar)", "O Aralto Sussurrante (antagonista principal desta missão)"],
            recompensas: [
              "🗡 Acesso ao arsenal sagrado dos Serpentarianos (itens de tier mágico com tema cobra)",
              "✨ Magia: Veneno Sagrado de Jurgmund ensinado pela Sacerdotisa",
              "📖 Diário do Aralto Sussurrante (revela localização de outros Araltos e o plano maior)",
              "🔑 Aliança: os Serpentarianos se tornam aliados — acesso livre ao Castelo e apoio militar futuro"
            ],
            inimigos: [
              { nome: "Kobolds Guardiões (Câmaras Profundas)", id: "serpentariano-patrulheiro", diff: 1 },
              { nome: "Sacerdote Serpentariano corrompido (guarda do emissário)", id: "serpentariano-sacerdote", diff: 3 },
              { nome: "O Aralto Sussurrante (confronto final)", id: "aralto-sussurrante", diff: 4 },
            ],
            descricao: `
              <p><strong>Briefing com Sss'era:</strong> A sacerdotisa encontra os aventureiros de forma discreta — ela não pode ser vista recrutando estrangeiros sem permissão do Rei. Ela explica: o "emissário" chegou há 15 anos e desde então as orações do Rei mudaram, suas decisões mudaram, e as cobras sagradas do templo ficam inquietas quando ele está por perto. Ela precisa de provas físicas — o Diário do Aralto ou qualquer item que o identifique como servo do Deus Marcado.</p>
              <p><strong>Puzzle — Identificar o Aralto:</strong> O Aralto Sussurrante usa Máscara de Ilusão. A Sacerdotisa já descobriu uma fraqueza: ele não projeta sombra ao meio-dia solar. Se os aventureiros puderem criá-lo em uma situação de sol direto, a ilusão falha por um instante. Um teste de Percepção (normal) neste momento o identifica definitivamente.</p>
              <p><strong>Infiltração nas Câmaras Profundas:</strong> O Diário está nas Câmaras mais funda do Castelo. Sss'era conhece uma passagem secundária. A jornada passa por Kobolds que veneram o espaço como sagrado — podem ser evitados com furtividade (AGI difícil) ou conversados com um Serpentariano presente.</p>
              <p><strong>Apresentar as provas:</strong> Com o Diário em mãos, Sss'era convoca o Conselho dos Sacerdotes. O Aralto, percebendo que foi descoberto, abandona o disfarce de Vassk e revela sua forma real para o combate final. O Rei Vassk, livre da influência, pode se tornar aliado poderoso — mas leva tempo para aceitar que foi manipulado por 15 anos.</p>
            `
          }
        }
      }
    ]
  }
];

/* ================================================================
   RENDERIZAÇÃO
   ================================================================ */

document.addEventListener("DOMContentLoaded", () => {
  renderHistory();

  document.getElementById("history-container").addEventListener("click", e => {
    const trigger = e.target.closest("[data-hist-toggle]");
    if (!trigger) return;
    e.stopPropagation();
    const targetId = trigger.dataset.histToggle;
    const panel = document.getElementById(targetId);
    if (!panel) return;
    const isOpen = trigger.classList.contains("open");
    // Fecha irmãos do mesmo nível
    const parent = trigger.parentElement;
    parent.querySelectorAll(":scope > [data-hist-toggle].open").forEach(t => {
      if (t !== trigger) {
        t.classList.remove("open");
        const p = document.getElementById(t.dataset.histToggle);
        p?.classList.remove("open");
      }
    });
    trigger.classList.toggle("open", !isOpen);
    panel.classList.toggle("open", !isOpen);
  });
});

function renderHistory() {
  const container = document.getElementById("history-container");
  container.innerHTML = WORLD_HISTORY.map(section => `
    <div class="hist-section-block">
      <button class="hist-section-trigger" data-hist-toggle="panel-${section.id}">
        <span class="hist-section-icon">${section.icon}</span>
        <span class="hist-section-name">${section.name || section.title}</span>
        <span class="hist-arrow">▾</span>
      </button>
      <div class="hist-section-panel" id="panel-${section.id}">
        ${section.entries.map(entry => renderEntry(section.id, entry)).join("")}
      </div>
    </div>
  `).join("");
}

function renderEntry(sectionId, entry) {
  const badgeClass = {
    era: "hist-badge-era", evento: "hist-badge-evento",
    main: "hist-badge-main", side: "hist-badge-side"
  }[entry.badge] || "";

  return `
    <div class="hist-entry-block ${entry.isMain ? "hist-mission-main" : ""}">
      <button class="hist-entry-trigger" data-hist-toggle="entry-${sectionId}-${entry.id}">
        <span class="hist-entry-badge ${badgeClass}">${entry.badgeText}</span>
        <span class="hist-entry-name">${entry.name}</span>
        <span class="hist-arrow">▾</span>
      </button>
      <div class="hist-entry-panel" id="entry-${sectionId}-${entry.id}">
        ${renderEntryContent(entry.content)}
      </div>
    </div>
  `;
}

function renderEntryContent(content) {
  if (!content) return "";
  const parts = [];

  // Lore narrativo
  if (content.lore) {
    parts.push(`<div class="hist-body"><div class="hist-lore">${content.lore}</div></div>`);
  }

  // Campos informativos
  if (content.fields?.length) {
    const fieldsHTML = content.fields.map(f => `
      <div class="hist-field-row">
        <span class="hist-field-label">${f.label}</span>
        <span>${f.value}</span>
      </div>`).join("");
    parts.push(`<div class="hist-body" style="padding-top:0">${fieldsHTML}</div>`);
  }

  // Maldição
  if (content.curse) {
    const c = content.curse;
    parts.push(`
      <div class="hist-body" style="padding-top:0">
        <div class="hist-curse-block">
          <div class="hist-curse-title">🔮 ${c.name}</div>
          <p style="font-size:13.5px;margin:0;color:var(--ink-soft);line-height:1.6;">${c.description}</p>
          ${c.stages.map((s, i) => `
            <div class="hist-curse-stage hist-curse-stage-${i+1}">
              <div class="hist-curse-stage-num">${s.num}</div>
              <div style="font-size:12px;color:var(--ink-soft);margin-bottom:4px;font-style:italic;">${s.trigger}</div>
              <div style="font-size:13px;">${s.effect}</div>
            </div>`).join("")}
          <div class="hist-field-row hist-field-green">
            <span class="hist-field-label">✅ Como Remover</span>
            <span>${c.removal}</span>
          </div>
          <div class="hist-field-row hist-field-blue">
            <span class="hist-field-label">🔑 Segredo do Mestre</span>
            <span>${c.secret}</span>
          </div>
        </div>
      </div>`);
  }

  // Dados de missão
  if (content.mission) {
    const m = content.mission;
    const monstersHTML = m.inimigos?.length ? `
      <div class="hist-section-title">⚔ Inimigos Possíveis (Bestiário)</div>
      <div class="hist-monsters">
        ${m.inimigos.map(e => `<span class="hist-monster-chip diff-chip-${e.diff}" title="${e.nome}">☠${"☠".repeat(e.diff-1)} ${e.nome}</span>`).join("")}
      </div>` : "";

    const rewardsHTML = m.recompensas?.length ? `
      <div class="hist-section-title">🎁 Recompensas</div>
      <div class="hist-rewards">
        ${m.recompensas.map(r => `<span class="hist-reward-chip">${r}</span>`).join("")}
      </div>` : "";

    const npcsHTML = m.npcs?.length ? `
      <div class="hist-section-title">🧙 NPCs Envolvidos</div>
      <ul class="hist-list">${m.npcs.map(n => `<li>${n}</li>`).join("")}</ul>` : "";

    const masterHTML = m.descricao ? `
      <div class="hist-master-box">
        <div class="hist-master-box-title">📋 Descrição Completa (para o Mestre)</div>
        <div style="font-size:13px;line-height:1.65;color:var(--ink);">${m.descricao}</div>
      </div>` : "";

    parts.push(`
      <div class="hist-body" style="padding-top:0">
        <div class="hist-field-row hist-field-alert">
          <span class="hist-field-label">⏱ Prazo</span>
          <span>${m.dias}</span>
        </div>
        <div class="hist-field-row">
          <span class="hist-field-label">💀 Dificuldade</span>
          <span>${m.dificuldade}</span>
        </div>
        ${npcsHTML}
        ${rewardsHTML}
        ${monstersHTML}
        ${masterHTML}
      </div>`);
  }

  return parts.join("");
}
