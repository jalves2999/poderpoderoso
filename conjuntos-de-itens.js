/* ======================================================================
   CONJUNTOS DE ITENS (SETS) — cole em data.js

   Cada item tem o campo:
     setName:      nome do conjunto entre parênteses no display
     setBonus:     objeto { pieces: N, ability: "nome", effect: "desc" }
                   pieces = quantas peças equipadas ativam o bônus

   Para exibir: ao lado do nome da arma coloque o setName entre parênteses
   Ex: "Adaga de Ferro (Sanguinária)"

   Para integrar no array correto:
     Armas de 1M  → WEAPONS_ONE_HAND
     Armas de 2M  → WEAPONS_TWO_HAND
     Armaduras    → ARMORS
     Escudos      → SHIELDS
     Acessórios   → ACCESSORIES

   O campo setBonusNote é redundante com setBonus para facilitar leitura
   humana diretamente no glossário sem processar o objeto.
   ====================================================================== */

/* ──────────────────────────────────────────────────────────────────────
   GUERREIRO — 3 conjuntos
   Estilos: Berserker (dano extremo), Muralha (tanque/proteção), Duelista
   ────────────────────────────────────────────────────────────────────── */

/* SET 1 — BERSERKER: duas armas pesadas + acessório de ira */
const SET_GUERREIRO_BERSERKER = [
  {
    tier: "magico",
    setName: "Berserker",
    setBonus: { pieces: 3, ability: "Ira Sem Limite", effect: "Uma vez por batalha, ao abater um inimigo com 0 HP, pode imediatamente repetir o dano do ataque (sem re-rolar, usa o valor já obtido) num segundo inimigo em alcance corpo a corpo. Não consome Ação." },
    setBonusNote: "3 peças: Ira Sem Limite — ao abater um inimigo, repete o dano num segundo alvo sem re-rolar dados.",
    name: "Machado de Dois Gumes (Berserker)",
    dmg: "1d12 + 1d8",
    req: "FOR",
    weight: 8,
    defenseDegrade: null,
    slot: ["primary"],
    heavyTwoHanded: true,
    story: "Forjado por um ferreiro que perdeu sua família durante a Grande Invasão. Cada golpe tem a brutalidade de alguém que não tem mais nada a perder. O cabo é envolto em couro manchado de sangue seco que nunca lava.",
    note: "Ao reduzir um inimigo a 0 HP, ganha +1d6 de dano no próximo ataque deste turno automaticamente."
  },
  {
    tier: "magico",
    setName: "Berserker",
    setBonus: { pieces: 3, ability: "Ira Sem Limite", effect: "Uma vez por batalha, ao abater um inimigo com 0 HP, pode imediatamente repetir o dano do ataque (sem re-rolar) num segundo inimigo em alcance corpo a corpo. Não consome Ação." },
    setBonusNote: "3 peças: Ira Sem Limite — ao abater um inimigo, repete o dano num segundo alvo sem re-rolar dados.",
    name: "Armadura de Placas Sangrentas (Berserker)",
    physDefense: 7,
    magDefense: 0,
    weight: 22,
    movePenalty: 2,
    req: "FOR",
    story: "Placas que absorveram tanto sangue ao longo de batalhas que o metal mudou de cor permanentemente. Dizem que o portador ouve sussurros dos inimigos abatidos que pede mais.",
    note: "A cada inimigo abatido em combate, o portador ganha +1d4 de dano temporário (não acumula além de +1d8 total) até o fim do combate."
  },
  {
    tier: "magico",
    setName: "Berserker",
    setBonus: { pieces: 3, ability: "Ira Sem Limite", effect: "Uma vez por batalha, ao abater um inimigo com 0 HP, pode imediatamente repetir o dano do ataque (sem re-rolar) num segundo inimigo em alcance corpo a corpo. Não consome Ação." },
    setBonusNote: "3 peças: Ira Sem Limite — ao abater um inimigo, repete o dano num segundo alvo sem re-rolar dados.",
    name: "Cinto de Garras de Lobo (Berserker)",
    weight: 0.5,
    effect: "Ao iniciar o combate, ganha +1d4 de Fúria automática. Ao usar qualquer habilidade de Fúria, o custo é reduzido em 1 (mínimo 1).",
    story: "Presas de Lobo Alfa montadas em couro reforçado. Guerreiros que o usam relatam sentir o instinto de caça ativar antes mesmo de ver o inimigo."
  }
];

/* SET 2 — MURALHA: escudo lendário + armadura pesada + amuleto */
const SET_GUERREIRO_MURALHA = [
  {
    tier: "lendario",
    setName: "Muralha de Durrak",
    setBonus: { pieces: 3, ability: "Bastião Inabalável", effect: "Uma vez por batalha, quando um aliado adjacente receberia dano letal (que o reduziria a 0 HP), você pode declarar Interposição como Reação gratuita: absorve todo o dano no lugar do aliado. Você testa Resistência (normal); se passar, absorve apenas metade." },
    setBonusNote: "3 peças: Bastião Inabalável — Reação gratuita para absorver dano letal de aliado adjacente.",
    name: "Escudo da Vanguarda de Durrak (Muralha de Durrak)",
    physDefense: 6,
    weight: 9,
    penalty: "−1 Movimento",
    slot: ["shield"],
    story: "Um dos escudos sobreviventes das muralhas de Durrak. Cada arranhão na superfície representa um ataque que não chegou ao guerreiro atrás dele. Nenhum soldado que o carregou morreu em batalha — mas todos os que morreram não o tinham.",
    note: "Escudo Bash com este escudo causa +1d6 extra. Aliados adjacentes ganham +1d4 de Defesa Física (passivo, não acumula com Guardião de Flanco)."
  },
  {
    tier: "lendario",
    setName: "Muralha de Durrak",
    setBonus: { pieces: 3, ability: "Bastião Inabalável", effect: "Uma vez por batalha, quando um aliado adjacente receberia dano letal (que o reduziria a 0 HP), você pode declarar Interposição como Reação gratuita: absorve todo o dano no lugar do aliado. Você testa Resistência (normal); se passar, absorve apenas metade." },
    setBonusNote: "3 peças: Bastião Inabalável — Reação gratuita para absorver dano letal de aliado adjacente.",
    name: "Armadura de Ferro Negro de Durrak (Muralha de Durrak)",
    physDefense: 9,
    magDefense: 2,
    weight: 30,
    movePenalty: 3,
    req: "FOR alta",
    story: "Liga de minério negro extraído sob Durrak antes de a cidade cair. O ferreiro que a finalizou foi o último a sair das forjas enquanto a cidade ruía acima dele.",
    note: "Quando HP cair abaixo de 25%, ganha +1d8 de Defesa Física automaticamente até o fim do combate. Imune a Derrubada enquanto estiver de pé."
  },
  {
    tier: "raro",
    setName: "Muralha de Durrak",
    setBonus: { pieces: 3, ability: "Bastião Inabalável", effect: "Uma vez por batalha, quando um aliado adjacente receberia dano letal (que o reduziria a 0 HP), você pode declarar Interposição como Reação gratuita: absorve todo o dano no lugar do aliado. Você testa Resistência (normal); se passar, absorve apenas metade." },
    setBonusNote: "3 peças: Bastião Inabalável — Reação gratuita para absorver dano letal de aliado adjacente.",
    name: "Bracelete de Ferro do Guardião (Muralha de Durrak)",
    weight: 0.6,
    effect: "+1d4 de Defesa Física. Uma vez por combate, ao ser alvo de um Ataque de Oportunidade, pode cancelá-lo automaticamente levantando o braço (sem custo de Ação).",
    story: "Bracelete forjado pelos guardas da vanguarda de Durrak. Cada soldado de elite recebia um ao ser promovido."
  }
];

/* SET 3 — DUELISTA: espada leve + sem escudo + capa de evasão */
const SET_GUERREIRO_DUELISTA = [
  {
    tier: "magico",
    setName: "Lâmina Livre",
    setBonus: { pieces: 2, ability: "Fluxo de Combate", effect: "Quando você acerta dois ataques no mesmo turno contra o mesmo inimigo, o terceiro ataque naquele turno (se houver) causa dano máximo automaticamente (não rola dados — usa o valor máximo de cada dado de dano)." },
    setBonusNote: "2 peças: Fluxo de Combate — dois acertos no mesmo turno → terceiro ataque causa dano máximo automaticamente.",
    name: "Estoque do Duelo (Lâmina Livre)",
    dmg: "1d8 + 1d4",
    req: "DEX",
    weight: 2,
    defenseDegrade: 1,
    slot: ["primary", "secondary"],
    story: "Espada de duelo usada em 40 confrontos individuais sem uma única derrota. O fabricante gravou uma runa de precisão na lâmina após o 10º duelo, como reconhecimento de que a arma merecia mais que mãos comuns.",
    note: "Quando mão secundária está livre (sem arma nem escudo): +1 na Chance de Defesa. Ataques com vantagem adicionam +1d4 ao dano."
  },
  {
    tier: "magico",
    setName: "Lâmina Livre",
    setBonus: { pieces: 2, ability: "Fluxo de Combate", effect: "Quando você acerta dois ataques no mesmo turno contra o mesmo inimigo, o terceiro ataque naquele turno (se houver) causa dano máximo automaticamente (não rola dados — usa o valor máximo de cada dado de dano)." },
    setBonusNote: "2 peças: Fluxo de Combate — dois acertos no mesmo turno → terceiro ataque causa dano máximo automaticamente.",
    name: "Capa de Esgrima (Lâmina Livre)",
    weight: 1,
    effect: "+1d4 na Chance de Esquiva. Uma vez por combate, ao errar um ataque, pode imediatamente tentar um segundo ataque no mesmo alvo como Reação (sem custo de Ação).",
    story: "Capa levíssima usada por mestres de esgrima da escola Vael. O tecido interno é forrado com escamas de serpente que se expandem ao detectar impactos, criando uma leve barreira física."
  }
];

/* ──────────────────────────────────────────────────────────────────────
   MAGO — 3 conjuntos
   Estilos: Destruidor (dano puro), Arquimago (controle + slots), Sangue Arcano (vida ↔ mana)
   ────────────────────────────────────────────────────────────────────── */

/* SET 1 — DESTRUIDOR: cajado + vestes + anel de amplificação */
const SET_MAGO_DESTRUIDOR = [
  {
    tier: "lendario",
    setName: "Cólera Arcana",
    setBonus: { pieces: 3, ability: "Sobrecarga Elemental", effect: "Uma vez por batalha, ao conjurar uma magia de dano de nível 3 ou superior, pode declarar Sobrecarga: a magia causa +1 dado extra do maior dado que já usa (ex: se usa 3d10, adiciona +1d10). Você sofre 1d6 de dano de retaliação arcana." },
    setBonusNote: "3 peças: Sobrecarga Elemental — magia de dano Nv3+ ganha +1 dado extra, você sofre 1d6 de retaliação.",
    name: "Cajado da Tempestade Arcana (Cólera Arcana)",
    dmg: "1d10 + 1d8",
    req: "INT",
    weight: 4,
    defenseDegrade: null,
    slot: ["primary"],
    heavyTwoHanded: true,
    story: "Derivado dos estudos sobre o Cajado da Tormenta do Lich de Atrelon. Um aprendiz conseguiu replicar parcialmente o processo de imbuição glacial, mas sem o século de refinamento do original. O resultado é violento, instável e perigoso de empunhar.",
    note: "Magias de área conjuradas com este cajado aumentam o raio em +1 hex. Uma vez por sessão, ao errar uma magia, pode re-conjurá-la instantaneamente sem gastar Slot."
  },
  {
    tier: "magico",
    setName: "Cólera Arcana",
    setBonus: { pieces: 3, ability: "Sobrecarga Elemental", effect: "Uma vez por batalha, ao conjurar uma magia de dano de nível 3 ou superior, pode declarar Sobrecarga: a magia causa +1 dado extra do maior dado que já usa. Você sofre 1d6 de dano de retaliação arcana." },
    setBonusNote: "3 peças: Sobrecarga Elemental — magia de dano Nv3+ ganha +1 dado extra, você sofre 1d6 de retaliação.",
    name: "Vestes da Tempestade (Cólera Arcana)",
    physDefense: 1,
    magDefense: 6,
    weight: 2,
    movePenalty: 0,
    req: "INT",
    story: "Tecidas com fios de relâmpago solidificado — um processo arcano que existe em apenas três grimórios no mundo. O tecido crackita suavemente com estática ao toque.",
    note: "Ao sofrer dano mágico, ganha +1 de MP automaticamente (máx. 2 por combate desta forma). Magias de fogo e relâmpago adicionam +1d4 de dano."
  },
  {
    tier: "raro",
    setName: "Cólera Arcana",
    setBonus: { pieces: 3, ability: "Sobrecarga Elemental", effect: "Uma vez por batalha, ao conjurar uma magia de dano de nível 3 ou superior, pode declarar Sobrecarga: a magia causa +1 dado extra do maior dado que já usa. Você sofre 1d6 de dano de retaliação arcana." },
    setBonusNote: "3 peças: Sobrecarga Elemental — magia de dano Nv3+ ganha +1 dado extra, você sofre 1d6 de retaliação.",
    name: "Anel da Fúria Arcana (Cólera Arcana)",
    weight: 0.1,
    effect: "+1 Slot de Magia. Magias de dano de nível 1 e 2 adicionam +1d4 ao dano (passivo).",
    story: "Anel criado por um mago que acreditava que o único uso legítimo da magia era a destruição. Morreu praticando o que pregava."
  }
];

/* SET 2 — ARQUIMAGO: orbe + grimório + capa de sabedoria */
const SET_MAGO_ARQUIMAGO = [
  {
    tier: "lendario",
    setName: "Arcana Suprema",
    setBonus: { pieces: 3, ability: "Memória Perfeita", effect: "Uma vez por sessão, ao usar o último Slot de Magia, recupera imediatamente 1d4 Slots de Magia (rola o dado). Pode usar essa recuperação mesmo após conjurar a magia que consumiu o último Slot." },
    setBonusNote: "3 peças: Memória Perfeita — ao usar o último Slot de Magia, recupera 1d4 Slots imediatamente (1x/sessão).",
    name: "Orbe do Conhecimento Infinito (Arcana Suprema)",
    dmg: "1d6 + 1d4",
    req: "INT/SAB",
    weight: 1,
    defenseDegrade: 2,
    slot: ["primary", "secondary"],
    story: "Esfera de cristal que contém, aprisionada em seu centro, a mente de um arquimago que preferiu se transformar em conhecimento puro a morrer. A esfera responde a perguntas em sussurros que só o portador ouve.",
    note: "+2 Slots de Magia enquanto equipado. Uma vez por dia, ao estudar o orbe por 10 minutos, o portador aprende uma magia de nível 1 ou 2 para usar naquele dia sem Slot (desaparece ao descansar)."
  },
  {
    tier: "magico",
    setName: "Arcana Suprema",
    setBonus: { pieces: 3, ability: "Memória Perfeita", effect: "Uma vez por sessão, ao usar o último Slot de Magia, recupera imediatamente 1d4 Slots de Magia. Pode usar essa recuperação mesmo após conjurar a magia que consumiu o último Slot." },
    setBonusNote: "3 peças: Memória Perfeita — ao usar o último Slot de Magia, recupera 1d4 Slots imediatamente (1x/sessão).",
    name: "Grimório do Arquimago (Arcana Suprema)",
    dmg: "—",
    req: "INT",
    weight: 2,
    defenseDegrade: 2,
    slot: ["secondary"],
    story: "Encadernado em couro de criatura do plano arcano e escrito em tinta feita de pó de cristal de mana. As páginas reescrevem-se sozinhas à medida que o portador aprende novas magias.",
    note: "+1 Slot de Magia. Reduz o tempo de conjuração de magias de nível 3 em 1 turno (mínimo 1 Ação). Magias de controle (imobilização, domínio, ilusão) adicionam +1d4 à CD de resistência do alvo."
  },
  {
    tier: "magico",
    setName: "Arcana Suprema",
    setBonus: { pieces: 3, ability: "Memória Perfeita", effect: "Uma vez por sessão, ao usar o último Slot de Magia, recupera imediatamente 1d4 Slots de Magia. Pode usar essa recuperação mesmo após conjurar a magia que consumiu o último Slot." },
    setBonusNote: "3 peças: Memória Perfeita — ao usar o último Slot de Magia, recupera 1d4 Slots imediatamente (1x/sessão).",
    name: "Manto do Arquimago (Arcana Suprema)",
    physDefense: 2,
    magDefense: 5,
    weight: 2,
    movePenalty: 0,
    req: "INT",
    story: "Manto azul-profundo costurado com runas de proteção pelos alunos de uma academia arcana como presente ao seu mestre. O mestre o deixou para o mais talentoso dos seus, e assim passou de geração em geração.",
    note: "+1d6 em testes de Arcanismo e Concentração. Uma vez por combate, ao ser alvo de uma magia inimiga, pode realizar um Contra-feitiço como Reação (testa INT dificil; se passar, a magia falha sem efeito)."
  }
];

/* SET 3 — SANGUE ARCANO: varinha sanguínea + vestes vivas + anel vital */
const SET_MAGO_SANGUEARC = [
  {
    tier: "magico",
    setName: "Sangue Arcano",
    setBonus: { pieces: 2, ability: "Sacrifício de Força", effect: "Uma vez por combate, pode gastar 10 HP (voluntariamente, sem teste) para conjurar qualquer magia conhecida de nível 1–3 sem gastar Slot de Magia. O dano ou efeito da magia conjurada desta forma ganha +1d6." },
    setBonusNote: "2 peças: Sacrifício de Força — gasta 10 HP para conjurar magia Nv1-3 sem Slot, com +1d6 extra.",
    name: "Varinha de Sangue Vivo (Sangue Arcano)",
    dmg: "1d6 + 1d4",
    req: "INT/SAB",
    weight: 1,
    defenseDegrade: 2,
    slot: ["primary", "secondary"],
    story: "Esculpida a partir do coração petrificado de uma criatura mágica que canalizava energia vital como se fosse mana. A varinha pulsa suavemente ao toque, como se ainda estivesse viva.",
    note: "Ao conjurar uma magia, pode escolher pagar com HP em vez de Slot (1 HP por nível da magia). Ao fazer isso, a magia ganha +1d4 de dano/cura."
  },
  {
    tier: "magico",
    setName: "Sangue Arcano",
    setBonus: { pieces: 2, ability: "Sacrifício de Força", effect: "Uma vez por combate, pode gastar 10 HP para conjurar qualquer magia conhecida de nível 1–3 sem gastar Slot de Magia. A magia conjurada desta forma ganha +1d6." },
    setBonusNote: "2 peças: Sacrifício de Força — gasta 10 HP para conjurar magia Nv1-3 sem Slot, com +1d6 extra.",
    name: "Vestes de Carne Arcana (Sangue Arcano)",
    physDefense: 3,
    magDefense: 4,
    weight: 2,
    movePenalty: 0,
    req: "INT",
    story: "Vestes que reagem ao estado físico do portador — ficam mais densas quando ele está ferido, canalizando a dor em energia mágica. Inventadas por um mago que sobreviveu a uma batalha sem nenhuma magia, só com vontade.",
    note: "Quando HP cai abaixo de 50%, ganha +1 de MP por turno automaticamente. Quando abaixo de 25% HP, magias conjuradas ganham +1d6 de dano ou cura."
  }
];

/* ──────────────────────────────────────────────────────────────────────
   ARQUEIRO — 3 conjuntos
   Estilos: Caçador (dano focado + marcação), Atirador de Elite (precisão extrema), Explorador (mobilidade + furtividade)
   ────────────────────────────────────────────────────────────────────── */

/* SET 1 — CAÇADOR DA MARCA */
const SET_ARQUEIRO_CACADOR = [
  {
    tier: "lendario",
    setName: "Caçador da Marca",
    setBonus: { pieces: 3, ability: "Presa Marcada para Morte", effect: "Ao usar Marcar Alvo (habilidade de Arqueiro) num inimigo, o alvo fica Marcado permanentemente pelo combate (não há duração). O primeiro ataque à distância de cada turno contra o Marcado não precisa rolar dado de acerto — acerta automaticamente." },
    setBonusNote: "3 peças: Presa Marcada para Morte — Marcar Alvo sem duração; primeiro ataque/turno contra o Marcado é acerto automático.",
    name: "Arco do Rastreador Eterno (Caçador da Marca)",
    dmg: "1d10 + 1d6",
    range: 16,
    req: "DEX",
    weight: 3,
    defenseDegrade: null,
    slot: ["primary"],
    story: "Criado por um caçador que passou 40 anos rastreando uma única presa — uma criatura de outro plano que havia devorado sua família. Quando finalmente a encontrou, o arco disparou antes mesmo que ele ordenasse. Nunca precisou falhar.",
    note: "Alvos Marcados sofrem +1d8 de dano de cada ataque. Ao matar um alvo Marcado, recupera 1 de Foco automaticamente."
  },
  {
    tier: "magico",
    setName: "Caçador da Marca",
    setBonus: { pieces: 3, ability: "Presa Marcada para Morte", effect: "Ao usar Marcar Alvo num inimigo, o alvo fica Marcado permanentemente pelo combate. O primeiro ataque à distância de cada turno contra o Marcado é acerto automático (sem rolar dado de acerto)." },
    setBonusNote: "3 peças: Presa Marcada para Morte — Marcar Alvo sem duração; primeiro ataque/turno contra o Marcado é acerto automático.",
    name: "Armadura de Caça (Caçador da Marca)",
    physDefense: 4,
    magDefense: 1,
    weight: 6,
    movePenalty: 0,
    req: "DEX",
    story: "Armadura leve feita com materiais coletados em caçadas, cada peça de uma criatura diferente abatida pelo portador. A mistura de texturas cria um padrão que dificulta a leitura das intenções de movimento.",
    note: "+1d4 em testes de Furtividade e Percepção. Enquanto equipada, se o portador não se moveu no turno anterior, ganha +1d6 no dano do primeiro disparo deste turno."
  },
  {
    tier: "raro",
    setName: "Caçador da Marca",
    setBonus: { pieces: 3, ability: "Presa Marcada para Morte", effect: "Ao usar Marcar Alvo num inimigo, o alvo fica Marcado permanentemente pelo combate. O primeiro ataque à distância de cada turno contra o Marcado é acerto automático (sem rolar dado de acerto)." },
    setBonusNote: "3 peças: Presa Marcada para Morte — Marcar Alvo sem duração; primeiro ataque/turno contra o Marcado é acerto automático.",
    name: "Aljava do Caçador (Caçador da Marca)",
    weight: 1,
    effect: "Aljava mágica: nunca fica sem flechas (recarrega 1 flecha por turno automaticamente). Flechas geradas causam +1d4 de dano contra alvos Marcados.",
    story: "Aljava que aprende os padrões de munição do portador e os replica a partir de energia cinética do ambiente. Inventada por um arqueiro que ficou sem flechas no momento mais crítico de sua vida e jurou que nunca mais aconteceria."
  }
];

/* SET 2 — ATIRADOR DE ELITE */
const SET_ARQUEIRO_ELITE = [
  {
    tier: "lendario",
    setName: "Olho de Águia",
    setBonus: { pieces: 2, ability: "Tiro Impossível", effect: "Uma vez por batalha, pode declarar Tiro Impossível antes de atacar: a flecha ignora qualquer cobertura (total ou parcial), obstáculo, invisibilidade ou ilusão, e não pode ser bloqueada por escudo. Se acertar, causa o dobro do dano normal." },
    setBonusNote: "2 peças: Tiro Impossível — 1x/batalha, ignora coberturas e escudos, dano dobrado se acertar.",
    name: "Arco da Visão Perfeita (Olho de Águia)",
    dmg: "1d12 + 1d6 + 1d4",
    range: 20,
    req: "DEX alta",
    weight: 2,
    defenseDegrade: null,
    slot: ["primary"],
    story: "Feito de madeira de uma árvore que cresceu no topo da montanha mais alta do continente, onde o ar é tão claro que os picos parecem tocáveis. O arco nunca desalinha — cada flecha encontra seu caminho.",
    note: "Tiro Certeiro (habilidade de Arqueiro) usado com este arco ignora toda a Defesa Física do alvo, não apenas metade."
  },
  {
    tier: "magico",
    setName: "Olho de Águia",
    setBonus: { pieces: 2, ability: "Tiro Impossível", effect: "Uma vez por batalha, pode declarar Tiro Impossível antes de atacar: a flecha ignora qualquer cobertura, obstáculo, invisibilidade ou ilusão, e não pode ser bloqueada por escudo. Se acertar, causa o dobro do dano normal." },
    setBonusNote: "2 peças: Tiro Impossível — 1x/batalha, ignora coberturas e escudos, dano dobrado se acertar.",
    name: "Luneta de Precisão Arcana (Olho de Águia)",
    weight: 0.3,
    effect: "+1d6 em testes de Percepção visual. Elimina a penalidade de distância longa em ataques à distância. Uma vez por combate, ao usar Tiro de Precisão, pode atacar um alvo que não está em linha de visão direta desde que o portador já o tenha visto neste combate.",
    story: "Luneta criada por um ex-atirador de elite que ficou cego de um olho em batalha. Passou 20 anos desenvolvendo esta lente para compensar o que perdeu — e no fim enxergava mais longe que qualquer pessoa com visão perfeita."
  }
];

/* SET 3 — EXPLORADOR SOMBRIO */
const SET_ARQUEIRO_EXPLORADOR = [
  {
    tier: "magico",
    setName: "Sombra da Floresta",
    setBonus: { pieces: 3, ability: "Disparo Fantasma", effect: "Ao atacar de uma posição de Furtividade (sem ser visto), o ataque não revela a posição do portador — pode fazer até 2 ataques furtivos por combate antes de ser localizado. O segundo ataque furtivo do mesmo turno causa +1d8 de dano adicional." },
    setBonusNote: "3 peças: Disparo Fantasma — 2 ataques furtivos antes de ser detectado; segundo ataque furtivo +1d8.",
    name: "Arco Sombrio do Explorador (Sombra da Floresta)",
    dmg: "1d8 + 1d6",
    range: 12,
    req: "DEX/AGI",
    weight: 2,
    defenseDegrade: null,
    slot: ["primary"],
    story: "Arco pintado de negro com extrato de planta noturna. Não emite som ao disparar — as flechas cortam o ar em silêncio absoluto, deixando inimigos confusos sobre a origem do ataque.",
    note: "Ataques realizados de posição furtiva ou após Passo nas Sombras adicionam +1d6 de dano. Não emite luz nem reflexo."
  },
  {
    tier: "magico",
    setName: "Sombra da Floresta",
    setBonus: { pieces: 3, ability: "Disparo Fantasma", effect: "Ao atacar de uma posição de Furtividade, o ataque não revela a posição do portador — pode fazer até 2 ataques furtivos por combate antes de ser localizado. O segundo ataque furtivo do mesmo turno causa +1d8 de dano adicional." },
    setBonusNote: "3 peças: Disparo Fantasma — 2 ataques furtivos antes de ser detectado; segundo ataque furtivo +1d8.",
    name: "Armadura de Sombras (Sombra da Floresta)",
    physDefense: 3,
    magDefense: 1,
    weight: 4,
    movePenalty: -1,
    req: "AGI",
    story: "Armadura de couro que absorve a luz ao redor, criando uma leve penumbra ao redor do portador. Desenvolvida pelos Exploradores da Floresta Profunda para sobreviver na escuridão entre as árvores.",
    note: "+1d6 em testes de Furtividade. +1 Movimento (a penalidade já está incluída como bônus líquido: movePenalty: -1 significa +1 Movimento). Ao entrar em Furtividade, o custo de Ação é reduzido em 1."
  },
  {
    tier: "raro",
    setName: "Sombra da Floresta",
    setBonus: { pieces: 3, ability: "Disparo Fantasma", effect: "Ao atacar de uma posição de Furtividade, o ataque não revela a posição do portador — pode fazer até 2 ataques furtivos por combate antes de ser localizado. O segundo ataque furtivo do mesmo turno causa +1d8 de dano adicional." },
    setBonusNote: "3 peças: Disparo Fantasma — 2 ataques furtivos antes de ser detectado; segundo ataque furtivo +1d8.",
    name: "Botas do Fantasma (Sombra da Floresta)",
    weight: 0.8,
    effect: "+1 Movimento. Passos completamente silenciosos — testes de Furtividade baseados em som têm +1d6. Pode se mover através de Terreno Difícil sem penalidade de Movimento (ignora lama, pedras, areia, neve).",
    story: "Botas feitas com pele de uma criatura que habita a fronteira entre o mundo material e o plano das sombras. Não deixam pegadas em nenhuma superfície."
  }
];

/* ──────────────────────────────────────────────────────────────────────
   LADINO — 3 conjuntos
   Estilos: Sanguinário (velocidade + abate), Envenenador (veneno acumulativo), Ilusionista (esquiva + truques)
   ────────────────────────────────────────────────────────────────────── */

/* SET 1 — SANGUINÁRIO */
const SET_LADINO_SANGUINARIO = [
  {
    tier: "magico",
    setName: "Sanguinária",
    setBonus: { pieces: 2, ability: "Ataque na Veia", effect: "Uma vez por batalha, ao abater um inimigo, pode imediatamente repetir o dano do ataque num segundo inimigo em alcance corpo a corpo ou em alcance de lançamento. Não rola novos dados — usa exatamente o mesmo valor de dano que abateu o primeiro inimigo. Não consome Ação." },
    setBonusNote: "2 peças: Ataque na Veia — ao abater um inimigo, repete o valor de dano num segundo alvo (sem re-rolar). Sem custo de Ação.",
    name: "Adaga de Ferro (Sanguinária)",
    dmg: "1d6 + 1d4",
    req: "DEX",
    weight: 1,
    defenseDegrade: 2,
    slot: ["primary", "secondary"],
    story: "Adaga simples que foi afiada e re-afiada tantas vezes que o metal ficou fino como papel. Qualquer ferimento causado por ela sangra continuamente — o metal tem alguma propriedade que impede a coagulação natural.",
    note: "Acertos causam Sangramento: 1d4 de dano no início do turno do alvo por 2 rodadas (acumula, máx 2 aplicações)."
  },
  {
    tier: "magico",
    setName: "Sanguinária",
    setBonus: { pieces: 2, ability: "Ataque na Veia", effect: "Uma vez por batalha, ao abater um inimigo, pode imediatamente repetir o dano do ataque num segundo inimigo em alcance corpo a corpo ou em alcance de lançamento. Não rola novos dados — usa exatamente o mesmo valor de dano. Não consome Ação." },
    setBonusNote: "2 peças: Ataque na Veia — ao abater um inimigo, repete o valor de dano num segundo alvo (sem re-rolar). Sem custo de Ação.",
    name: "Capa de Escamas (Sanguinária)",
    weight: 1,
    effect: "+1d4 na Chance de Esquiva. Uma vez por combate, ao reduzir um inimigo a 0 HP, pode se mover 2 hexágonos imediatamente como Reação gratuita (para fora do alcance corpo a corpo ou para trás de cobertura).",
    story: "Capa forrada com escamas de serpente do pântano, cada uma costurada individualmente. O ladino que a criou dizia que as escamas eram de cobras que ele mesmo havia matado com as mãos — e ninguém duvidava."
  }
];

/* SET 2 — ENVENENADOR */
const SET_LADINO_VENENO = [
  {
    tier: "lendario",
    setName: "Morte Sussurrada",
    setBonus: { pieces: 3, ability: "Veneno na Corrente", effect: "Enquanto um inimigo estiver sob qualquer efeito de veneno do portador, todos os aliados que atacarem aquele inimigo adicionam +1d4 de dano de veneno automaticamente nos seus ataques (o veneno já enfraqueceu as defesas). Este bônus passa de inimigo para inimigo quando o veneno é aplicado em um novo alvo." },
    setBonusNote: "3 peças: Veneno na Corrente — inimigos envenenados pelo portador ficam vulneráveis: aliados ganham +1d4 de dano de veneno automático.",
    name: "Garra Dentada (Morte Sussurrada)",
    dmg: "1d6 + 1d4",
    req: "DEX/AGI",
    weight: 1,
    defenseDegrade: 2,
    slot: ["primary", "secondary"],
    story: "Arma com dentes na lâmina que retêm veneno mais eficientemente que qualquer adaga comum. Criada por um envenenador profissional que considerava a morte limpa um desperdício de potencial.",
    note: "Aplica veneno mesmo que o alvo tenha resistência a veneno (reduz, mas não imuniza). Ao aplicar Golpe Envenenado, a duração do veneno é +1 rodada extra."
  },
  {
    tier: "magico",
    setName: "Morte Sussurrada",
    setBonus: { pieces: 3, ability: "Veneno na Corrente", effect: "Enquanto um inimigo estiver sob qualquer efeito de veneno do portador, todos os aliados que atacarem aquele inimigo adicionam +1d4 de dano de veneno automaticamente." },
    setBonusNote: "3 peças: Veneno na Corrente — inimigos envenenados ficam vulneráveis: aliados ganham +1d4 de dano de veneno.",
    name: "Manto do Assassino (Morte Sussurrada)",
    physDefense: 2,
    magDefense: 2,
    weight: 2,
    movePenalty: 0,
    req: "AGI",
    story: "Manto de uma guilda de assassinos que não existe mais oficialmente. Os bolsos internos foram costurados para carregar frascos de veneno sem que estilhaços de vidro quebrado atinjam o portador em caso de acidente.",
    note: "+2 às Cargas de Veneno máximas. Ao usar Passo nas Sombras, pode aplicar uma dose de veneno numa arma simultaneamente sem gastar Ação adicional."
  },
  {
    tier: "magico",
    setName: "Morte Sussurrada",
    setBonus: { pieces: 3, ability: "Veneno na Corrente", effect: "Enquanto um inimigo estiver sob qualquer efeito de veneno do portador, todos os aliados que atacarem aquele inimigo adicionam +1d4 de dano de veneno automaticamente." },
    setBonusNote: "3 peças: Veneno na Corrente — inimigos envenenados ficam vulneráveis: aliados ganham +1d4 de dano de veneno.",
    name: "Anel do Alquimista Sombrio (Morte Sussurrada)",
    weight: 0.1,
    effect: "Reservatório oculto: armazena 2 doses de veneno no próprio anel, liberáveis com um toque (sem Ação). Venenos aplicados com esta dose causam +1d6 extra e duram +1 rodada.",
    story: "Anel com compartimento secreto que parece decorativo mas é funcionalmente uma seringa miniaturizada. Vários nobres morreram sem saber que apertaram a mão de quem os mataria."
  }
];

/* SET 3 — ILUSIONISTA DAS SOMBRAS */
const SET_LADINO_ILUSAO = [
  {
    tier: "magico",
    setName: "Véu de Névoa",
    setBonus: { pieces: 2, ability: "Sombra Dupla", effect: "Uma vez por batalha, ao ser alvo de um ataque, pode criar uma ilusão instantânea de si mesmo como Reação gratuita: o atacante rola novamente o dado de ataque e usa o pior resultado dos dois. Se ambos os resultados forem acerto, o dano é reduzido à metade." },
    setBonusNote: "2 peças: Sombra Dupla — Reação gratuita ao ser atacado: atacante re-rola e usa o pior resultado. Se dois acertos, dano pela metade.",
    name: "Adaga da Névoa (Véu de Névoa)",
    dmg: "1d6 + 1d4",
    req: "DEX/AGI",
    weight: 1,
    defenseDegrade: 2,
    slot: ["primary", "secondary"],
    story: "Lâmina imbuída com essência de criatura do plano da névoa. Quando sacada rapidamente, libera uma leve bruma que confunde a percepção de profundidade dos inimigos por um instante.",
    note: "Ataques feitos como parte de Emboscada adicionam +1d6 de dano e aplicam −1d4 na Chance de Acerto do alvo por 1 rodada (desorientação)."
  },
  {
    tier: "magico",
    setName: "Véu de Névoa",
    setBonus: { pieces: 2, ability: "Sombra Dupla", effect: "Uma vez por batalha, ao ser alvo de um ataque, pode criar uma ilusão instantânea de si mesmo como Reação gratuita: o atacante re-rola e usa o pior resultado. Se ambos os resultados forem acerto, o dano é reduzido à metade." },
    setBonusNote: "2 peças: Sombra Dupla — Reação gratuita ao ser atacado: atacante re-rola e usa o pior resultado. Se dois acertos, dano pela metade.",
    name: "Manto de Espelhos (Véu de Névoa)",
    weight: 1,
    effect: "+1d6 na Chance de Esquiva. Uma vez por dia, ao ativar o manto (sem custo de Ação), cria 2 ilusões idênticas ao portador por 3 rodadas: inimigos devem testar INT (normal) para atacar o portador real (falha = atacam uma ilusão, que some ao ser atingida).",
    story: "Manto forrado com centenas de fragmentos de espelho mágico. Ao se mover, o reflexo cria figuras fantasmas que demoram um instante para desaparecer — ilusões naturais causadas pelo movimento."
  }
];

/* ──────────────────────────────────────────────────────────────────────
   CLÉRIGO — 3 conjuntos
   Estilos: Guardião da Fé (suporte protetor), Punidor Sagrado (dano + cura híbrido), Arauto da Cobra (veneno sagrado + neutralização)
   ────────────────────────────────────────────────────────────────────── */

/* SET 1 — GUARDIÃO DA FÉ */
const SET_CLERIGO_GUARDIAO = [
  {
    tier: "lendario",
    setName: "Guardião da Fé",
    setBonus: { pieces: 3, ability: "Graça Divina", effect: "Uma vez por sessão, ao que qualquer aliado visível receber dano que o reduziria a 0 HP, pode declarar Graça Divina como Reação gratuita: aquele aliado estabiliza automaticamente em 1 HP e ganha +1d8 de HP temporário que dura até o fim do combate. O Clérigo gasta 3 de Fé (ou o máximo disponível, se menor)." },
    setBonusNote: "3 peças: Graça Divina — Reação gratuita salva aliado de 0 HP (estabiliza em 1 HP + 1d8 temp), custa 3 Fé.",
    name: "Maça Sagrada de Proteção (Guardião da Fé)",
    dmg: "1d8 + 1d4",
    req: "FOR/SAB",
    weight: 4,
    defenseDegrade: 1,
    slot: ["primary", "secondary"],
    story: "Maça abençoada que pulsa com energia de proteção — quando usada para defender um aliado bloqueando fisicamente um ataque, o portador não sofre o dano. Pertenceu a um Clérigo que usou o próprio corpo para salvar seu grupo três vezes na mesma batalha.",
    note: "Quando usada com Escudo Bash (perícia de combate), a maçada pode simultaneamente curar 1d4 HP de um aliado adjacente."
  },
  {
    tier: "magico",
    setName: "Guardião da Fé",
    setBonus: { pieces: 3, ability: "Graça Divina", effect: "Uma vez por sessão, ao que qualquer aliado visível receber dano que o reduziria a 0 HP, pode declarar Graça Divina como Reação gratuita: aquele aliado estabiliza em 1 HP e ganha +1d8 HP temporário. O Clérigo gasta 3 de Fé." },
    setBonusNote: "3 peças: Graça Divina — Reação gratuita salva aliado de 0 HP (1 HP + 1d8 temp), custa 3 Fé.",
    name: "Escudo da Providência Divina (Guardião da Fé)",
    physDefense: 5,
    weight: 6,
    penalty: "Nenhuma",
    slot: ["shield"],
    story: "Escudo com o símbolo de uma divindade da proteção gravado em relevo. Quando o portador usa uma magia de cura enquanto segura o escudo, a cura adicionalmente se propaga em 1d4 HP para o aliado mais próximo.",
    note: "Enquanto equipado, magias de cura do portador adicionam +1d4 de cura automaticamente. Muralha Viva (perícia de combate) usada com este escudo adiciona o dobro do bônus de Defesa ao aliado protegido."
  },
  {
    tier: "magico",
    setName: "Guardião da Fé",
    setBonus: { pieces: 3, ability: "Graça Divina", effect: "Uma vez por sessão, ao que qualquer aliado visível receber dano que o reduziria a 0 HP, pode declarar Graça Divina como Reação gratuita: aquele aliado estabiliza em 1 HP e ganha +1d8 HP temporário. O Clérigo gasta 3 de Fé." },
    setBonusNote: "3 peças: Graça Divina — Reação gratuita salva aliado de 0 HP (1 HP + 1d8 temp), custa 3 Fé.",
    name: "Vestes Sagradas do Guardião (Guardião da Fé)",
    physDefense: 3,
    magDefense: 4,
    weight: 3,
    movePenalty: 0,
    req: "SAB",
    story: "Vestes que aumentam a percepção do portador do sofrimento alheio — o Clérigo sente instintivamente quando um aliado está em perigo mortal, mesmo sem vê-lo diretamente.",
    note: "Bônus de Cura do Clérigo (2×SAB) é aplicado +1d6 adicional nas magias Curar Feridas e Cura Maior. Estabilizar (habilidade de classe) pode ser usado a distância de até 3 hex."
  }
];

/* SET 2 — PUNIDOR SAGRADO */
const SET_CLERIGO_PUNIDOR = [
  {
    tier: "magico",
    setName: "Punição Sagrada",
    setBonus: { pieces: 2, ability: "Golpe Redentor", effect: "Uma vez por batalha, ao usar Repreensão Sagrada ou Punição Divina (magia), pode simultaneamente curar um aliado visível em metade do dano causado ao inimigo (arredondado para baixo). A cura é automática — não exige Ação extra." },
    setBonusNote: "2 peças: Golpe Redentor — ao usar Repreensão/Punição, cura aliado em metade do dano causado. Sem custo de Ação.",
    name: "Martelo da Expiação (Punição Sagrada)",
    dmg: "1d10 + 1d6",
    req: "FOR/SAB",
    weight: 5,
    defenseDegrade: 1,
    slot: ["primary"],
    story: "Martelo que foi usado para selar o túmulo de um herói. A energia sagrada do ritual impregneu no metal — cada golpe libera um fragmento daquela benção, que procura a ferida mais próxima para curar.",
    note: "Acertos em mortos-vivos ou criaturas extraplanares causam +1d8 de dano sagrado extra. Uma vez por combate, ao acertar um inimigo que afetou negativamente um aliado neste turno, o ataque é Crítico automático."
  },
  {
    tier: "magico",
    setName: "Punição Sagrada",
    setBonus: { pieces: 2, ability: "Golpe Redentor", effect: "Uma vez por batalha, ao usar Repreensão Sagrada ou Punição Divina, pode simultaneamente curar um aliado visível em metade do dano causado. A cura é automática sem custo de Ação." },
    setBonusNote: "2 peças: Golpe Redentor — ao usar Repreensão/Punição, cura aliado em metade do dano causado. Sem custo de Ação.",
    name: "Símbolo Sagrado da Redenção (Punição Sagrada)",
    weight: 0.3,
    effect: "+1d4 de Fé máxima. Repreensão Sagrada (habilidade de classe) ganha +1d6 de dano. Uma vez por dia, ao usar Imposição de Mãos, pode curar 1d10 HP extra de um alvo e remover 1 condição negativa além do efeito normal.",
    story: "Símbolo de uma ordem de Clérigos que acreditava que a melhor forma de proteger era a destruição do mal. Cada um dos membros carregava um símbolo como este — e todos eles morreram em batalha, como pedido."
  }
];

/* SET 3 — ARAUTO DA COBRA */
const SET_CLERIGO_COBRA = [
  {
    tier: "magico",
    setName: "Arauto de Jurgmund",
    setBonus: { pieces: 3, ability: "Bênção da Serpente Sagrada", effect: "Uma vez por batalha, ao curar um aliado, pode dividir a cura entre até 3 alvos (distribui livremente o total de cura). Adicionalmente, cada alvo curado desta forma fica imune a veneno e doenças por 3 rodadas e ganha +1d4 em testes de Resistência." },
    setBonusNote: "3 peças: Bênção da Serpente Sagrada — divide cura entre até 3 alvos; curados ficam imunes a veneno por 3 rodadas e ganham +1d4 em Resistência.",
    name: "Cajado Sagrado de Jurgmund (Arauto de Jurgmund)",
    dmg: "1d8 + 1d4",
    req: "SAB/INT",
    weight: 3,
    defenseDegrade: null,
    slot: ["primary"],
    heavyTwoHanded: true,
    story: "Cajado esculpido em madeira de uma árvore que cresceu no centro de Serpentara, envolvido por cobra sagrada que o guarda há décadas. Canaliza tanto energia de cura quanto veneno purificado.",
    note: "Magias de cura conjuradas com este cajado adicionam +1d8 de cura. Magias de veneno do clérigo adicionam +1d6 de dano. Uma vez por sessão, pode converter toda a cura de uma magia em dano de veneno sagrado (ou vice-versa)."
  },
  {
    tier: "magico",
    setName: "Arauto de Jurgmund",
    setBonus: { pieces: 3, ability: "Bênção da Serpente Sagrada", effect: "Uma vez por batalha, ao curar um aliado, pode dividir a cura entre até 3 alvos. Cada alvo curado fica imune a veneno por 3 rodadas e ganha +1d4 em testes de Resistência." },
    setBonusNote: "3 peças: Bênção da Serpente Sagrada — divide cura entre até 3 alvos; curados ficam imunes a veneno por 3 rodadas e ganham +1d4 em Resistência.",
    name: "Vestes da Sacerdotisa da Cobra (Arauto de Jurgmund)",
    physDefense: 3,
    magDefense: 5,
    weight: 3,
    movePenalty: 0,
    req: "SAB",
    story: "Vestes rituais das sacerdotisas de Jurgmund, bordadas com padrões de escamas. O tecido é impregnado com veneno purificado que protege o portador de toxinas externas.",
    note: "Imunidade a venenos naturais. +1d6 em testes de Medicina e Religião. Purificar (magia de Clérigo) remove até 3 efeitos negativos em vez de 2."
  },
  {
    tier: "raro",
    setName: "Arauto de Jurgmund",
    setBonus: { pieces: 3, ability: "Bênção da Serpente Sagrada", effect: "Uma vez por batalha, ao curar um aliado, pode dividir a cura entre até 3 alvos. Cada alvo curado fica imune a veneno por 3 rodadas e ganha +1d4 em testes de Resistência." },
    setBonusNote: "3 peças: Bênção da Serpente Sagrada — divide cura entre até 3 alvos; curados ficam imunes a veneno por 3 rodadas e ganham +1d4 em Resistência.",
    name: "Amuleto da Cobra Dupla (Arauto de Jurgmund)",
    weight: 0.4,
    effect: "+1d4 de Fé máxima. Uma vez por dia, ao fazer contato com um inimigo ou aliado com veneno ativo, pode Transferir o veneno (tirar do aliado e aplicar no inimigo, ou vice-versa) sem teste. O veneno transferido tem sua duração reiniciada.",
    story: "Amuleto com duas cobras entrelaçadas em prata, símbolo da dualidade de Jurgmund: veneno e cura são a mesma força. Quem entende isso domina ambos."
  }
];

/* ──────────────────────────────────────────────────────────────────────
   LISTA CONSOLIDADA — todos os itens de todos os sets

   Para integrar:
   1. Itens de armadura vão em ARMORS
   2. Itens de arma de 1M vão em WEAPONS_ONE_HAND
   3. Itens de arma de 2M vão em WEAPONS_TWO_HAND
   4. Itens de escudo vão em SHIELDS
   5. Itens sem slot (acessórios) vão em ACCESSORIES
      Regra: se tem "physDefense" E "weight" E não tem "slot" → ARMORS
             se tem "slot" com "primary"/"secondary" → WEAPONS
             se tem "physDefense" E "slot: ['shield']" → SHIELDS
             caso contrário → ACCESSORIES

   O campo "setName" é novo — o app pode exibi-lo ao lado do nome
   na ficha e no glossário para identificar o conjunto.
   O campo "setBonus" pode ser lido para destacar o bônus de set ativo.
   ────────────────────────────────────────────────────────────────────── */

const ALL_SET_ITEMS = [
  // Guerreiro
  ...SET_GUERREIRO_BERSERKER,
  ...SET_GUERREIRO_MURALHA,
  ...SET_GUERREIRO_DUELISTA,
  // Mago
  ...SET_MAGO_DESTRUIDOR,
  ...SET_MAGO_ARQUIMAGO,
  ...SET_MAGO_SANGUEARC,
  // Arqueiro
  ...SET_ARQUEIRO_CACADOR,
  ...SET_ARQUEIRO_ELITE,
  ...SET_ARQUEIRO_EXPLORADOR,
  // Ladino
  ...SET_LADINO_SANGUINARIO,
  ...SET_LADINO_VENENO,
  ...SET_LADINO_ILUSAO,
  // Clérigo
  ...SET_CLERIGO_GUARDIAO,
  ...SET_CLERIGO_PUNIDOR,
  ...SET_CLERIGO_COBRA,
];

/*
  TOTAIS:
  Guerreiro: 3 sets × (2-3 peças) = 8 itens
  Mago:      3 sets × (2-3 peças) = 8 itens
  Arqueiro:  3 sets × (2-3 peças) = 8 itens
  Ladino:    3 sets × (2-3 peças) = 7 itens
  Clérigo:   3 sets × (2-3 peças) = 8 itens
  Total: 39 itens / 15 sets / 5 classes
*/
