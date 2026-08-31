/* ==========================================================================
   DATA.JS — Base de dados do sistema de RPG
   Todas as regras, classes, perícias, magias e equipamentos vivem aqui.
   ========================================================================== */

const ATTRS = ["FOR", "DEX", "AGI", "INT", "SAB"];

const ATTR_NAMES = {
  FOR: "Força",
  DEX: "Destreza",
  AGI: "Agilidade",
  INT: "Inteligência",
  SAB: "Sabedoria"
};

const ATTR_DESC = {
  FOR: "Dano físico, vida e capacidade de carga.",
  DEX: "Chance de acerto, chance de defesa e ações.",
  AGI: "Movimento, ações e reações em combate.",
  INT: "Slots de magia e perícias de conhecimento.",
  SAB: "Slots de magia, percepção e poder de cura."
};

const CREATION_ATTR_POINTS = 2;
const XP_PER_LEVEL = 1000;
const CARRY_BASE = 20;
const CARRY_PER_FOR = 5;
const ABILITY_MAX_LEVEL = 3;

/* ---------------------------------------------------------------------- */
/* CLASSES                                                                */
/* ---------------------------------------------------------------------- */

const CLASSES = {
  guerreiro: {
    name: "Guerreiro",
    icon: "⚔",
    role: "Dano físico sustentado, resistência e controle de linha de frente.",
    resource: "Fúria",
    resourceMax: 5,
    resourceDesc: "Ganha +1 ao acertar um ataque corpo a corpo ou ao receber dano. Reseta a 0 fora de combate.",
    startBonusAttr: "FOR",
    hpPerFor: 5, // 3 base + 2 extra
    hpPerForNote: "+2 HP extra por ponto de FOR (além da base universal de +3)",
    hpPerLevel: 10,
    carryPerLevel: 5,
    naturalDamageDie: "1d6",
    naturalDamageNote: "+1 dano natural a cada 2 pontos de FOR",
    forPerNaturalBonus: 2,
    skills: [
      { name: "Golpe Pesado", cost: "2 Fúria, 1 Ação", effect: "Próximo ataque corpo a corpo causa +1d6 de dano adicional.",
        levels: [
          { cost: "2 Fúria, 1 Ação", effect: "Próximo ataque corpo a corpo causa +1d6 de dano adicional." },
          { cost: "3 Fúria, 1 Ação", effect: "Próximo ataque corpo a corpo causa +2d6 de dano adicional." },
          { cost: "4 Fúria, 1 Ação", effect: "Próximo ataque corpo a corpo causa +3d6 de dano adicional e ignora 1 ponto de Defesa Física do alvo." }
        ] },
      { name: "Postura Defensiva", cost: "1 Fúria, 1 Ação", effect: "+1d4 na Chance de Defesa até o início do próximo turno; a 1ª defesa do turno não degrada.",
        levels: [
          { cost: "1 Fúria, 1 Ação", effect: "+1d4 na Chance de Defesa até o início do próximo turno; a 1ª defesa do turno não degrada." },
          { cost: "2 Fúria, 1 Ação", effect: "+1d6 na Chance de Defesa até o início do próximo turno; as 2 primeiras defesas do turno não degradam." },
          { cost: "3 Fúria, 1 Ação", effect: "+1d8 na Chance de Defesa até o início do próximo turno; nenhuma defesa do turno degrada." }
        ] },
      { name: "Golpe da Fúria Perfeita", cost: "2 Fúria, 1 Ação", effect: "Canaliza toda a raiva num único golpe. +3 na Chance de Crítico no próximo ataque. Se crítico: +1d10 dano bruto extra de impacto puro (além do bônus percentual normal).",
        levels: [
          { cost: "2 Fúria, 1 Ação", effect: "Próximo ataque: +3 Chance de Crítico. Crítico: +1d10 dano bruto." },
          { cost: "3 Fúria, 1 Ação", effect: "Próximo ataque: +4 Chance de Crítico. Crítico: +2d10 dano bruto + alvo testea FOR normal ou cai Derrubado." },
          { cost: "4 Fúria, 1 Ação", effect: "Próximo ataque: +5 Chance de Crítico. Crítico: +3d10 dano bruto + Derrubado (FOR difícil) + alvo perde 2 Def.Física até o próximo turno (armadura racha)." }
        ] },
      { name: "Contra-ataque", cost: "2 Fúria, 1 Reação", effect: "Ao defender com sucesso um ataque corpo a corpo, ataca o atacante de volta sem gastar Ação." },
      { name: "Fúria Sangrenta", cost: "3 Fúria, 1 Ação", effect: "Por 2 turnos: +1d6 no Dano Natural, mas −1d4 na Chance de Defesa." },
      { name: "Grito de Guerra", cost: "3 Fúria, 1 Ação", effect: "Aliados em até 2 hexágonos ganham +1d4 na Chance de Acerto até o fim da próxima rodada.",
        levels: [
          { cost: "3 Fúria, 1 Ação", effect: "Aliados em até 2 hexágonos ganham +1d4 na Chance de Acerto até o fim da próxima rodada." },
          { cost: "4 Fúria, 1 Ação", effect: "Aliados em até 3 hexágonos ganham +1d6 na Chance de Acerto até o fim da próxima rodada." },
          { cost: "5 Fúria, 1 Ação", effect: "Aliados em até 4 hexágonos ganham +1d6 na Chance de Acerto e +1d4 no Dano Natural até o fim da próxima rodada." }
        ] },
      { name: "Golpe Duplo", cost: "3 Fúria, 1 Ação", effect: "Realiza 2 ataques imediatos no mesmo alvo ou em alvos diferentes em alcance melee. Cada ataque rola dado de acerto e dano separadamente. Ambos podem ser críticos.",
        levels: [
          { cost: "3 Fúria, 1 Ação", effect: "2 ataques imediatos. Cada um rola acerto e dano separado. Ambos podem ser críticos." },
          { cost: "3 Fúria, 1 Ação", effect: "2 ataques imediatos. Se ambos acertarem o mesmo alvo: +1d8 de dano bônus no segundo (o encadeamento perfeito desequilibra o alvo)." },
          { cost: "3 Fúria, 1 Ação", effect: "2 ataques imediatos. Se ambos acertarem: +1d8 bônus no segundo. Se o primeiro for crítico: o segundo tem +3 na Chance de Crítico (a fúria do impacto guia a mão)." }
        ] },
      { name: "Última Resistência", cost: "5 Fúria (todos), 1 Ação", effect: "Com HP ≤ 25%, gasta toda a Fúria para curar 1d10 + FOR. Uso único por combate." }
    ],
    skillsClass: [
      { name: "Atletismo",             attr: "FOR/AGI", desc: "Escalar, nadar, correr com armadura pesada e realizar feitos físicos em combate e exploração.", example: "Escalar muralha de 6m com armadura; derrubar porta trancada com chute; nadar com cota de malha." },
      { name: "Intimidação",           attr: "FOR/SAB", desc: "Usar presença física e reputação para desestabilizar inimigos antes ou durante o combate.", example: "Fazer mercenários reconsiderarem o ataque só pelo porte; ameaçar informante para que fale." },
      { name: "Defesa com Armas Pesadas", attr: "FOR/AGI", desc: "Permite usar armas de 2 mãos para defender. Sem esta perícia, armas 2M não podem defender. Com ela: −2 na Chance de Defesa por ataque defendido.", example: "Usar a haste do Maul para aparar golpe de espada.", combat: true, mechanicalEffect: "enable_two_hand_defense", combatDesc: "Permite usar armas de 2 mãos para defender, com −2 na Chance de Defesa por ataque defendido (em vez de ser impossível)." },
      { name: "Golpe de Derrubada",    attr: "FOR/AGI", desc: "Ao acertar corpo a corpo: alvo testa FOR (normal) ou cai Derrubado por 1 rodada.", example: "Troll derrubado: aliados adjacentes ganham +1 na Chance de Acerto contra ele.", combat: true, combatDesc: "Ao acertar ataque corpo a corpo, declare 'Derrubada'. Alvo testa FOR (normal): falha → Derrubado 1 rodada." },
      { name: "Resistência de Campo", attr: "FOR/SAB", desc: "Suportar combate prolongado, manter posição sob pressão e ressurgir de estados debilitantes.", example: "Continuar com HP ≤ 25% sem penalidade extra; negar Derrubado gastando 1 Fúria em vez de Ação." },
      { name: "Pressão Tática",        attr: "INT/SAB", desc: "1x/rodada, Ação Livre: analisa inimigo — ataques tratam a DEX dele como 1 ponto menor por 2 rodadas.", example: "Estuda o Orc Berserker DEX 0: tratado como DEX −1, +1 na Chance de Acerto.", combat: true, combatDesc: "1x/rodada, Ação Livre: analisa 1 inimigo visível. Seus ataques contra ele têm DEX inimiga −1 por 2 rodadas." },
      { name: "Liderança de Campo", attr: "FOR/SAB", desc: "Coordenar aliados em combate ativo — posicionamento, ordens e cobertura. A voz que grita enquanto a lâmina corta.", example: "Ordenar recuo coordenado como Ação Livre; indicar flanco; manter formação sob ataque surpresa." }
    ],    spellsFull: null
  },

  mago: {
    name: "Mago",
    icon: "✦",
    role: "Dano arcano de alto impacto e controle de campo de batalha.",
    resource: "MP",
    resourceMax: null, // calculado: 10 + INT*2
    resourceDesc: "MP = 10 + (INT × 2). Recupera totalmente em descanso longo; 25% em descanso curto. Usado só nas habilidades de amplificação (a magia em si usa Slots).",
    startBonusAttr: "INT",
    hpPerFor: 2, // 3 base - 1
    hpPerForNote: "−1 HP por ponto de FOR (total +2 HP/ponto — fisicamente frágil)",
    hpPerLevel: 6,
    carryPerLevel: 2,
    naturalDamageDie: "1d4",
    naturalDamageNote: "Dano natural padrão, sem bônus de classe",
    forPerNaturalBonus: 0,
    skills: [
      { name: "Amplificar Dano", cost: "3 MP", effect: "A próxima magia ganha +1 dado extra do mesmo tipo já usado nela.",
        levels: [
          { cost: "3 MP", effect: "A próxima magia ganha +1 dado extra do mesmo tipo já usado nela." },
          { cost: "5 MP", effect: "A próxima magia ganha +2 dados extras do mesmo tipo já usado nela." },
          { cost: "7 MP", effect: "A próxima magia ganha +3 dados extras do mesmo tipo já usado nela e ignora 2 pontos de Defesa Mágica do alvo." }
        ] },
      { name: "Sentir a Morte", attr: "SAB/INT", desc: "Detectar mortos-vivos ocultos, almas presas, portais para o plano dos mortos e locais de morte violenta.", example: "Detectar fantasma invisível em raio 8 hex; sentir morte violenta numa sala; localizar entrada para o plano dos mortos." },
      { name: "Eco Arcano", cost: "5 MP", effect: "A próxima magia de alvo único também atinge um alvo adjacente, com metade do dano." },
      { name: "Escudo Arcano", cost: "3 MP, 1 Reação", effect: "Cria uma barreira que absorve os próximos 1d8 + INT de dano.",
        levels: [
          { cost: "3 MP, 1 Reação", effect: "Cria uma barreira que absorve os próximos 1d8 + INT de dano." },
          { cost: "4 MP, 1 Reação", effect: "Cria uma barreira que absorve os próximos 1d10 + INT de dano." },
          { cost: "5 MP, 1 Reação", effect: "Cria uma barreira que absorve os próximos 2d8 + INT de dano e reflete 2 pontos de dano ao atacante." }
        ] },
      { name: "Dreno de Mana", cost: "4 MP, 1 Ação", effect: "Toque (alcance 1): rouba 1d4 Slots de um inimigo conjurador, convertendo em 2 MP por slot." },
      { name: "Reciclagem Arcana", cost: "6 MP", effect: "Recupera 1 Slot de Magia já gasto neste combate. Uso único por combate." },
      { name: "Sobrecarga", cost: "8 MP", effect: "A próxima magia ignora metade da Defesa Mágica do alvo; você sofre 1d6 de dano de recuo." },
      { name: "Domínio dos Elementos", cost: "5 MP", effect: "Escolhe um elemento; por 3 rodadas, magias desse tipo causam +1d4 de dano.",
        levels: [
          { cost: "5 MP", effect: "Escolhe um elemento; por 3 rodadas, magias desse tipo causam +1d4 de dano." },
          { cost: "6 MP", effect: "Escolhe um elemento; por 4 rodadas, magias desse tipo causam +1d6 de dano." },
          { cost: "7 MP", effect: "Escolhe um elemento; por 5 rodadas, magias desse tipo causam +1d8 de dano e ignoram resistência elemental." }
        ] },
      { name: "Convergência Arcana", cost: "3 MP, 1 Ação de Magia", effect: "O Mago comprime a energia da próxima magia num ponto de perfeição absoluta. +3 na Chance de Crítico para a próxima magia (d10). Se a magia for crítica: além do dano crítico normal, o alvo perde −2 de Defesa Mágica permanente até o fim do combate (a convergência rasga a resistência mágica).",
        levels: [
          { cost: "3 MP, 1 Ação de Magia", effect: "Próxima magia: +3 Chance de Crítico. Crítico: alvo perde −2 Def.Mágica até fim do combate." },
          { cost: "4 MP, 1 Ação de Magia", effect: "Próxima magia: +4 Chance de Crítico. Crítico: alvo perde −3 Def.Mágica + −1 SAB temporária (a mente foi atingida no ponto certo)." },
          { cost: "5 MP, 1 Ação de Magia", effect: "Próxima magia: +5 Chance de Crítico. Crítico: alvo perde −4 Def.Mágica e fica Vulnerável a magias por 3 rodadas (recebe 25% mais dano mágico)." }
        ] }
    ],
    skillsClass: [
      { name: "Arcanismo",           attr: "INT",     desc: "Teoria mágica, identificação de feitiços, runas e criaturas mágicas.", example: "Identificar que o artefato é um Foco de Invocação; reconhecer feitiço como Ilusão de 3º nível." },
      { name: "Investigação",        attr: "INT",     desc: "Examinar ativamente pistas, decifrar textos arcanos e conectar informações dispersas.", example: "Decifrar mapa cifrado do culto; descobrir que dois eventos têm o mesmo culpado." },
      { name: "História",            attr: "INT",     desc: "Eventos históricos, reinos extintos, guerras e civilizações antigas de Aether.", example: "Saber que a torre era laboratório de arquimago desaparecido há 200 anos." },
      { name: "Percepção Mágica",    attr: "SAB/INT", desc: "Detectar auras mágicas, identificar encantamentos e sentir anomalias arcanas.", example: "Sentir que o espelho é um portal; identificar que o cofre tem feitiço de alarme.", combat: true, combatDesc: "Em combate: 1 Ação para identificar buffs/debuffs mágicos ativos no alvo e sua escola arcana." },
      { name: "Necromancia Arcana", attr: "INT/SAB", desc: "Controlar, invocar e manipular mortos-vivos tecnicamente. Entender a linha entre vida e morte como fronteira atravessável.", example: "Ritual de 10min para levantar morto como servo; identificar força de morto-vivo pela aura; estabilizar morto-vivo aliado." },
      { name: "Ritual Proibido",
        attr: "INT",
        desc: "Realizar rituais de necromancia fora de combate: levantar morto permanente, extrair alma, criar vínculo com entidade dos mortos, purificar ou corromper artefato.",
        example: "Ritual de 1h para levantar morto permanente (1/semana máximo); extrair alma de Frasco de Alma Aprisionada sem destruí-la; criar elo com fantasma como informante." },
      { name: "Sentir a Morte", attr: "SAB/INT", desc: "Detectar mortos-vivos ocultos, almas presas, portais para o plano dos mortos e locais de morte violenta.", example: "Detectar fantasma invisivel em raio 8 hex; sentir morte violenta numa sala; localizar entrada para o plano dos mortos." }],    spellsFull: [
      { name: "Mísseis Arcanos", level: 1, effect: "1d6 + 1d4 de dano mágico em alvo único (alcance 6).", castTime: "1 Ação (instantânea)", cooldown: "4 usos por batalha" },
      { name: "Toque Gélido", level: 1, effect: "1d8 de dano mágico (toque); reduz Movimento do alvo em 2 na próxima rodada.", castTime: "1 Ação (instantânea)", cooldown: "4 usos por batalha" },
      { name: "Mãos Faiscantes", level: 1, effect: "1d4 + 1d4 de dano elétrico em até 2 alvos adjacentes entre si (alcance 4).", castTime: "1 Ação (instantânea)", cooldown: "4 usos por batalha" },
      { name: "Bola de Fogo", level: 2, effect: "2d6 de dano mágico em área (raio 1).", castTime: "1 Ação (instantânea)", cooldown: "3 usos por batalha" },
      { name: "Lança Elétrica", level: 2, effect: "1d10 + 1d6 de dano mágico em linha reta (3 hexágonos).", castTime: "1 Ação (instantânea)", cooldown: "3 usos por batalha" },
      { name: "Névoa Cinzenta", level: 2, effect: "Cria uma nuvem de fumaça densa em raio 2 que bloqueia visão por 3 rodadas.", castTime: "1 Ação (instantânea)", cooldown: "3 usos por batalha" },
      { name: "Muralha de Gelo", level: 3, effect: "Barreira de 3 hexágonos bloqueando movimento/visão por 3 rodadas.", castTime: "1 turno completo de conjuração", cooldown: "1 uso por dia" },
      { name: "Tempestade de Lâminas Arcanas", level: 3, effect: "2d8 + 2d4 de dano em área (raio 2); ocupa o turno todo.", castTime: "1 turno completo de conjuração", cooldown: "1 uso por dia" },
      { name: "Ritual do Luar", level: 3, effect: "Paralisa um inimigo por 2 rodadas, desde que ele esteja sob luz da lua ou em ambiente externo noturno.", castTime: "2 turnos de conjuração ininterrupta", cooldown: "1 uso por dia" },
      { name: "Meteoro Menor", level: 4, effect: "3d10 de dano em área (raio 2), com 1 rodada de preparo visível ao alvo.", castTime: "2 turnos de concentração", cooldown: "1 uso por dia" },
      { name: "Anulação Mágica", level: 4, effect: "Remove 1 efeito mágico ativo de um alvo.", castTime: "1 Ação (instantânea)", cooldown: "1 uso por dia" },
      { name: "Grilhões de Sombra", level: 4, effect: "Imobiliza completamente um alvo por 1 rodada; ele pode tentar se soltar gastando uma Ação inteira.", castTime: "2 turnos de concentração", cooldown: "1 uso por 2 dias" },
      { name: "Cataclismo Arcano", level: 5, effect: "4d10 + 4d6 de dano em área (raio 3).", castTime: "3 turnos de concentração ininterrupta", cooldown: "1 uso por semana" },
      { name: "Portal Instantâneo", level: 5, effect: "Teletransporta você e até 2 aliados para ponto visível em 10 hexágonos.", castTime: "2 turnos de concentração", cooldown: "1 uso por semana" },
      { name: "Raio Negro", level: 5, effect: "2d20 de dano mágico puro em alvo único, ignorando metade da Defesa Mágica (alcance 8).", castTime: "3 turnos de concentração ininterrupta", cooldown: "1 uso por semana" }
    ]
  },

  arqueiro: {
    name: "Arqueiro",
    icon: "🏹",
    role: "Dano à distância sustentado e marcação de alvos prioritários.",
    resource: "Foco",
    resourceMax: 5,
    resourceDesc: "Ganha +1 ao acertar um ataque à distância. Reseta a 0 fora de combate.",
    startBonusAttr: "DEX",
    hpPerFor: 3, // padrão
    hpPerForNote: "+0 extra (total +3 HP/ponto de FOR, valor universal)",
    hpPerLevel: 8,
    carryPerLevel: 4,
    naturalDamageDie: "1d4",
    naturalDamageNote: "+1 dano natural a cada 3 pontos de FOR",
    forPerNaturalBonus: 3,
    skills: [
      { name: "Marcar Alvo", cost: "1 Foco, 1 Ação", effect: "Inimigo fica 'Marcado' por 3 rodadas; ataques à distância contra ele ganham +1d4 na Chance de Acerto.",
        levels: [
          { cost: "1 Foco, 1 Ação", effect: "Inimigo fica 'Marcado' por 3 rodadas; ataques à distância contra ele ganham +1d4 na Chance de Acerto." },
          { cost: "2 Foco, 1 Ação", effect: "Inimigo fica 'Marcado' por 4 rodadas; ataques à distância contra ele ganham +1d6 na Chance de Acerto." },
          { cost: "3 Foco, 1 Ação", effect: "Inimigo fica 'Marcado' por 5 rodadas; ataques à distância contra ele ganham +1d6 na Chance de Acerto e +1d6 de dano." }
        ] },
      { name: "Tiro Certeiro", cost: "2 Foco, 1 Ação", effect: "Próximo ataque à distância ignora metade da Defesa Física do alvo.",
        levels: [
          { cost: "2 Foco, 1 Ação", effect: "Próximo ataque à distância ignora metade da Defesa Física do alvo." },
          { cost: "3 Foco, 1 Ação", effect: "Próximo ataque à distância ignora toda a Defesa Física do alvo." },
          { cost: "4 Foco, 1 Ação", effect: "Próximo ataque à distância ignora toda a Defesa Física do alvo e é Acerto Crítico automático se acertar." }
        ] },
      { name: "Disparo Múltiplo", cost: "3 Foco, 1 Ação", effect: "Dispara contra até 2 alvos diferentes, cada um resolvido separadamente." },
      { name: "Tiro de Precisão", cost: "2 Foco, 1 Reação", effect: "Dispara imediatamente quando um inimigo entra em linha de visão." },
      { name: "Flecha Imobilizante", cost: "2 Foco, 1 Ação", effect: "Se acertar, reduz o Movimento do alvo em 3 na próxima rodada." },
      { name: "Reposicionamento Tático", cost: "1 Foco, 1 Ação", effect: "Move até metade do Movimento e dispara ao final, sem penalidade." },
      { name: "Chuva de Flechas", cost: "4 Foco, 1 Ação", effect: "Ataque em área (raio 1); cada criatura sofre um ataque individual.",
        levels: [
          { cost: "4 Foco, 1 Ação", effect: "Ataque em área (raio 1); cada criatura sofre um ataque individual." },
          { cost: "5 Foco, 1 Ação", effect: "Ataque em área (raio 2); cada criatura sofre um ataque individual." },
          { cost: "6 Foco, 1 Ação", effect: "Ataque em área (raio 2); cada criatura sofre dois ataques individuais." }
        ] },
      { name: "Tiro da Fissura", cost: "2 Foco, 1 Ação", effect: "O Arqueiro mira na junta da armadura, na garganta exposta, no olho — qualquer ponto onde a proteção falha. +3 na Chance de Crítico no próximo ataque à distância. Se crítico: o tiro ignora TODA a Defesa Física do alvo (o ponto vital não tem proteção).",
        levels: [
          { cost: "2 Foco, 1 Ação", effect: "Próximo disparo: +3 Chance de Crítico. Crítico: ignora toda a Def.Física." },
          { cost: "2 Foco, 1 Ação", effect: "Próximo disparo: +4 Chance de Crítico. Crítico: ignora toda Def.Física + alvo fica com −2 na Chance de Acerto por 2 rodadas (o ferimento atrapalha o foco)." },
          { cost: "2 Foco, 1 Ação", effect: "Próximo disparo: +5 Chance de Crítico. Crítico: ignora toda Def.Física e Mágica + alvo perde 1 Ação no próximo turno (o tiro no ponto vital o impede de agir plenamente)." }
        ] }
    ],
    skillsClass: [
      { name: "Percepção",       attr: "SAB",     desc: "Detectar alvos ocultos, emboscadas e detalhes sutis, especialmente à distância.", example: "Avistar Goblin espiando de rocha a 100m; perceber armadilha na trilha antes de pisar." },
      { name: "Sobrevivência",   attr: "SAB",     desc: "Rastrear criaturas, orientar-se na natureza, encontrar abrigo e recursos selvagens.", example: "Rastrear grupo de Orcs pela floresta; prever tempestade pelo comportamento dos pássaros." },
      { name: "Furtividade",     attr: "AGI/DEX", desc: "Mover-se silenciosamente para ganhar posição de tiro sem ser detectado.", example: "Aproximar-se do acampamento inimigo pelo barlavento para tiro sem alerta." },
      { name: "Natureza",        attr: "SAB",     desc: "Identificar criaturas, plantas, terrenos e fenômenos naturais. Essencial para caça.", example: "Saber que o pântano não suporta criatura Grande — forçar o Troll para lá." },
      { name: "Tiro em Movimento", attr: "DEX/AGI", desc: "Pode usar Ação de Movimento + Ação de Ataque à distância no mesmo turno sem −1 na Chance de Acerto.", example: "Reposiciona 3 hexes e atira com chance normal, sem a penalidade de movimento.", combat: true, combatDesc: "Pode usar Ação de Movimento + Ação de Ataque à distância no mesmo turno sem a penalidade de −1 na Chance de Acerto." },
      { name: "Tiro Preciso",    attr: "DEX/SAB", desc: "1x/combate: mira completa — ignora cobertura parcial e causa +1d6 de dano.", example: "O Goblin atrás da barricada: cobertura ignorada, +1d6 no acerto.", combat: true, combatDesc: "1x/combate: gaste a Ação de Combate inteira mirando (sem mover). Próximo tiro: ignora cobertura parcial e +1d6 de dano." },
      { name: "Leitura de Terreno",
        attr: "SAB/INT",
        desc: "Identificar posições vantajosas, ângulos de tiro, coberturas, flancos e pontos cegos. O Arqueiro Puro nunca atira sem conhecer o campo.",
        example: "Identificar único ângulo sem cobertura num campo de batalha; detectar emboscada pelo posicionamento errado de guardas; localizar atirador inimigo por som e trajetória." },
      { name: "Disparo em Condição Adversa",
        attr: "DEX/AGI",
        desc: "Atirar sem penalidade em condições adversas: vento forte, chuva intensa, escuridão parcial, montado em movimento, sob pressão de combate corpo a corpo.",
        example: "Atirar a plena velocidade de montaria sem penalidade; manter precisão em tempestade; realizar tiro de supressão enquanto Derrubado sem desvantagem adicional." }],    spellsFull: null
  },

  ladino: {
    name: "Ladino",
    icon: "🗡",
    role: "Dano explosivo em alvo único, furtividade e mobilidade.",
    resource: "Cargas de Veneno",
    resourceMax: 3,
    resourceDesc: "Começa cada dia com 3 cargas. Furtividade é um estado (Oculto/Detectado), não um medidor.",
    startBonusAttr: "AGI",
    hpPerFor: 3,
    hpPerForNote: "+0 extra (total +3 HP/ponto de FOR, valor universal)",
    hpPerLevel: 7,
    carryPerLevel: 3,
    naturalDamageDie: "1d4",
    naturalDamageNote: "+1 dano natural a cada 3 pontos de FOR; +1d6 e bônus de AGI em Ataques Furtivos",
    forPerNaturalBonus: 3,
    skills: [
      { name: "Golpe Envenenado", cost: "1 Carga, 1 Ação", effect: "Ataque corpo a corpo que aplica Veneno: 1d4 de dano contínuo por 3 rodadas.",
        levels: [
          { cost: "1 Carga, 1 Ação", effect: "Ataque corpo a corpo que aplica Veneno: 1d4 de dano contínuo por 3 rodadas." },
          { cost: "2 Cargas, 1 Ação", effect: "Ataque corpo a corpo que aplica Veneno: 1d6 de dano contínuo por 3 rodadas." },
          { cost: "3 Cargas, 1 Ação", effect: "Ataque corpo a corpo que aplica Veneno: 1d8 de dano contínuo por 4 rodadas." }
        ] },
      { name: "Passo nas Sombras", cost: "1 Ação", effect: "Move até o total sem provocar Ataques de Oportunidade, terminando em cobertura." },
      { name: "Emboscada", cost: "1 Ação", effect: "Se Oculto, move e ataca furtivamente sem revelar a posição antes do golpe." },
      { name: "Ponto Vital", cost: "1 Carga, 1 Ação", effect: "O Ladino estuda o alvo por 1 Ação e mapeia seu ponto fraco. Próximo ataque neste turno ou no seguinte: +3 na Chance de Crítico (d10). Se o ataque for crítico: o bônus de dano crítico dobra (100% em vez de 50%).",
        levels: [
          { cost: "1 Carga, 1 Ação", effect: "Próximo ataque: +3 na Chance de Crítico. Se crítico: dano crítico = 100%." },
          { cost: "1 Carga, 1 Ação", effect: "Próximo ataque: +4 na Chance de Crítico. Se crítico: dano crítico = 150%. Pode ser ativado como Reação no turno do aliado (se for Caçador Sombrio)." },
          { cost: "1 Carga, 1 Ação", effect: "Próximo ataque: +5 na Chance de Crítico. Se crítico: dano crítico = 200% e o alvo fica Atordoado por 1 rodada (o golpe no ponto vital o paralisa brevemente)." }
        ] },
      { name: "Reflexos de Gato", cost: "1 Reação", effect: "+2 na Chance de Defesa contra um ataque específico, mesmo desarmado." },
      { name: "Lâmina Cega", cost: "2 Cargas, 1 Ação", effect: "O Ladino entrega-se ao instinto: até o final deste turno, todos os ataques ganham +3 na Chance de Crítico. Cada crítico acertado recupera 1 Carga de Veneno.",
        levels: [
          { cost: "2 Cargas, 1 Ação", effect: "+3 Chance de Crítico neste turno. Cada crítico recupera 1 Carga." },
          { cost: "2 Cargas, 1 Ação", effect: "+4 Chance de Crítico neste turno. Cada crítico recupera 2 Cargas. Se 2+ críticos no turno: próximo turno mantém +2 na Chance de Crítico." },
          { cost: "2 Cargas, 1 Ação", effect: "+5 Chance de Crítico neste turno. Cada crítico recupera todas as Cargas gastas. 3+ críticos no mesmo turno: Êxtase de Lâmina — os próximos 2 turnos têm +3 Chance de Crítico automático." }
        ] },
      { name: "Golpe Duplo", cost: "1 Ação", effect: "2 ataques corpo a corpo no mesmo alvo, cada um com −1 na Chance de Acerto." },
      { name: "Sangramento Mortal", cost: "2 Cargas, 1 Ação", effect: "Se for Ataque Furtivo, aplica Sangramento: 1d6 contínuo por 3 rodadas.",
        levels: [
          { cost: "2 Cargas, 1 Ação", effect: "Se for Ataque Furtivo, aplica Sangramento: 1d6 contínuo por 3 rodadas." },
          { cost: "3 Cargas, 1 Ação", effect: "Se for Ataque Furtivo, aplica Sangramento: 1d8 contínuo por 3 rodadas." },
          { cost: "3 Cargas, 1 Ação", effect: "Se for Ataque Furtivo, aplica Sangramento: 2d6 contínuo por 4 rodadas." }
        ] }
    ],
    skillsClass: [
      { name: "Prestidigitação",      attr: "DEX",     desc: "Furtar objetos, esconder itens no corpo, abrir fechaduras e truques manuais de delicadeza extrema.", example: "Furtar a chave do carcereiro; esconder faca no cano da bota; abrir cela com grampo." },
      { name: "Furtividade",          attr: "AGI/DEX", desc: "Mover-se silenciosamente e permanecer oculto — a ferramenta mais importante do Ladino.", example: "Passar pela guarda dormindo; seguir o alvo pela cidade sem ser percebido." },
      { name: "Enganação",            attr: "SAB/DEX", desc: "Mentir, manipular e criar ilusões sociais com controle da linguagem corporal.", example: "Fingir ser mercador; convencer interrogador que o grupo estava apenas passando por ali." },
      { name: "Acrobacia",            attr: "AGI/DEX", desc: "Escapar de agarrões, rolar, equilibrar-se e mover-se em terrenos difíceis.", example: "Rolar entre as pernas do inimigo e reposicionar-se atrás dele em 1 Ação." },
      { name: "Investigação",         attr: "INT",     desc: "Encontrar pistas, passagens secretas e padrões ocultos — a versão ativa da Percepção.", example: "Descobrir passagem atrás de estante pelas marcas de atrito; conectar dois eventos." },
      { name: "Ferramentas de Ladrão", attr: "DEX",   desc: "Usar kit especializado para abrir fechaduras e desativar armadilhas mecânicas.", example: "Abrir sala do tesouro; desativar armadilha de setas do corredor antes de cruzar.", combat: true, combatDesc: "Em combate: 1 Ação para desativar armadilha mecânica ativa ou forçar mecanismo de porta trancada." }
    ],    spellsFull: null
  },

  clerigo: {
    name: "Clérigo",
    icon: "☩",
    role: "Cura, suporte de equipe e dano sagrado moderado.",
    resource: "Fé",
    resourceMax: null, // calculado: 8 + SAB
    resourceDesc: "Fé Máxima = 8 + SAB. Recupera totalmente em descanso longo; 50% em descanso curto.",
    startBonusAttr: "SAB",
    hpPerFor: 4, // 3 base + 1
    hpPerForNote: "+1 HP extra por ponto de FOR (total +4 HP/ponto)",
    hpPerLevel: 9,
    carryPerLevel: 4,
    naturalDamageDie: "1d4",
    naturalDamageNote: "Dano natural padrão, sem bônus de classe",
    forPerNaturalBonus: 0,
    skills: [
      { name: "Mãos Curativas", cost: "2 Fé, 1 Ação", effect: "Cura 1d6 + SAB de HP em alvo tocado (alcance 1).",
        levels: [
          { cost: "2 Fé, 1 Ação", effect: "Cura 1d6 + SAB de HP em alvo tocado (alcance 1)." },
          { cost: "3 Fé, 1 Ação", effect: "Cura 1d8 + SAB de HP em alvo tocado (alcance 1)." },
          { cost: "4 Fé, 1 Ação", effect: "Cura 1d10 + SAB de HP em alvo tocado (alcance 2)." }
        ] },
      { name: "Palavra de Cura", cost: "3 Fé, 1 Ação", effect: "Cura 1d4 + SAB em até 2 alvos dentro de 4 hexágonos." },
      { name: "Bênção", cost: "2 Fé, 1 Ação", effect: "Aliado ganha +1d4 na Chance de Acerto e +1d4 na Chance de Defesa por 3 rodadas.",
        levels: [
          { cost: "2 Fé, 1 Ação", effect: "Aliado ganha +1d4 na Chance de Acerto e +1d4 na Chance de Defesa por 3 rodadas." },
          { cost: "3 Fé, 1 Ação", effect: "Aliado ganha +1d6 na Chance de Acerto e +1d4 na Chance de Defesa por 3 rodadas." },
          { cost: "4 Fé, 1 Ação", effect: "Até 2 aliados em alcance 3 ganham +1d6 na Chance de Acerto e +1d6 na Chance de Defesa por 4 rodadas." }
        ] },
      { name: "Repreensão Sagrada", cost: "3 Fé, 1 Ação", effect: "2d6 de dano sagrado contra mortos-vivos (1d6 contra outras criaturas).",
        levels: [
          { cost: "3 Fé, 1 Ação", effect: "2d6 de dano sagrado contra mortos-vivos (1d6 contra outras criaturas)." },
          { cost: "4 Fé, 1 Ação", effect: "3d6 de dano sagrado contra mortos-vivos (1d8 contra outras criaturas)." },
          { cost: "5 Fé, 1 Ação", effect: "4d6 de dano sagrado contra mortos-vivos (2d6 contra outras criaturas); cega o alvo por 1 rodada." }
        ] },
      { name: "Escudo da Fé", cost: "2 Fé, 1 Reação", effect: "+3 de Defesa Física e Mágica fixa contra o próximo ataque." },
      { name: "Julgamento Sagrado", cost: "2 Fé, 1 Ação", effect: "O Clérigo pronuncia julgamento sobre o alvo — a divindade decide se o golpe seguinte será definidor. O próximo ataque (seu ou de aliado adjacente) tem +2 na Chance de Crítico. Se for crítico: o acerto é considerado Dano Sagrado e causa +1d8 extra de energia divina (ignora Defesa Mágica de criaturas corrompidas e mortos-vivos).",
        levels: [
          { cost: "2 Fé, 1 Ação", effect: "Próximo ataque próprio ou de aliado adjacente: +2 Chance de Crítico. Crítico: +1d8 dano sagrado." },
          { cost: "3 Fé, 1 Ação", effect: "Próximo ataque próprio ou de aliado em raio 3 hex: +3 Chance de Crítico. Crítico: +2d8 dano sagrado e o alvo fica Abalado por 1 rodada (−1d4 em todos os testes — a presença divina o perturba)." },
          { cost: "4 Fé, 1 Ação", effect: "Próximo ataque próprio ou de qualquer aliado visível: +4 Chance de Crítico. Crítico: +3d8 dano sagrado + Abalado por 2 rodadas. Mortos-vivos e servos do Deus Marcado testam Força de Vontade (difícil) ou ficam Aterrorizados por 1 rodada." }
        ] },
      { name: "Imposição de Mãos", cost: "4 Fé, 1 Ação", effect: "Remove veneno, doença ou maldição menor de um alvo tocado." },
      { name: "Ressurreição Menor", cost: "Toda a Fé (mín. 6), 1 Ação", effect: "1x/dia, restaura aliado caído há até 3 rodadas para 50% do HP máximo." }
    ],
    skillsClass: [
      { name: "Medicina",          attr: "SAB",     desc: "Tratar ferimentos, curar doenças, estabilizar aliados a 0 HP e aplicar primeiros socorros sem magia.", example: "Remover flecha envenenada; cauterizar ferimento para parar Sangramento; estabilizar aliado desmaiado." },
      { name: "Religião",          attr: "SAB/INT", desc: "Conhecimento dos deuses de Aether, rituais, símbolos sagrados, mortos-vivos e planos divinos.", example: "Reconhecer símbolo de Jurgmund; saber como afastar Espectro com oração." },
      { name: "Persuasão",         attr: "SAB",     desc: "Convencer de boa fé — negociar, ganhar confiança e influenciar com argumentos honestos.", example: "Convencer aldeões a confiar no grupo; mediar disputa entre fações rivais da cidade." },
      { name: "Força de Vontade",  attr: "INT/SAB", desc: "Resistir a efeitos mentais, dominação e pressão psicológica extrema.", example: "Resistir ao Sussurro da Dúvida; não ceder ao medo do Lamento da Banshee." },
      { name: "Conforto Espiritual", attr: "SAB", desc: "Restaurar mente e espírito de aliados traumatizados ou aterrorizados. Única no grupo.", example: "Remover Aterrorizado como Ação; curar trauma narrativo entre sessões; estabilizar aliado em colapso mental." },
      { name: "Exorcismo e Banimento", attr: "SAB/INT", desc: "Banir mortos-vivos, demônios e entidades do plano errado. Matar o corpo às vezes não basta.", example: "Forçar fantasma a partir sem combate físico; reduzir Resistência Mágica de mortos-vivos em 50%; identificar nome verdadeiro de entidade." },
      { name: "Imposição de Fé",
        attr: "SAB/FOR",
        desc: "Usar a fé como barreira física: bloquear avanço de mortos-vivos pela presença divina, forçar criaturas corrompidas a recuar e amplificar curas em campo de batalha.",
        example: "Forçar mortos-vivos Dif.1-2 a não se aproximar em raio 2 hex (SAB vs Dif); dobrar cura quando aliado está a 0 HP; criar zona sagrada temporária." }],    spellsFull: [
      { name: "Luz Sagrada", level: 1, effect: "1d6 de dano sagrado; cega criaturas das trevas por 1 rodada.", castTime: "1 Ação (instantânea)", cooldown: "4 usos por batalha" },
      { name: "Curar Feridas", level: 1, effect: "2d6 + SAB de cura em alvo único tocado.", castTime: "1 Ação (instantânea)", cooldown: "4 usos por batalha" },
      { name: "Proteção contra o Mal", level: 1, effect: "+1d4 na Chance de Defesa contra criaturas malignas por 3 rodadas.", castTime: "1 Ação (instantânea)", cooldown: "3 usos por sessão" },
      { name: "Toque Reconfortante", level: 1, effect: "Remove 1 rodada de Medo ou pânico de um aliado tocado, restaurando a calma.", castTime: "1 Ação (instantânea)", cooldown: "3 usos por sessão" },
      { name: "Círculo de Cura", level: 2, effect: "1d8 + SAB de cura distribuído entre até 3 aliados (raio 2).", castTime: "1 Ação (instantânea)", cooldown: "3 usos por batalha" },
      { name: "Punição Divina", level: 2, effect: "2d8 de dano sagrado; dobrado contra mortos-vivos.", castTime: "1 Ação (instantânea)", cooldown: "3 usos por batalha" },
      { name: "Aura de Proteção", level: 2, effect: "Aliados em raio 2 ganham +1 de Defesa Física e Mágica por 3 rodadas.", castTime: "1 Ação (instantânea)", cooldown: "3 usos por batalha" },
      { name: "Purificar", level: 3, effect: "Remove efeitos negativos contínuos de até 2 aliados.", castTime: "1 turno completo de conjuração", cooldown: "1 uso por dia" },
      { name: "Muralha Sagrada", level: 3, effect: "Barreira que bloqueia criaturas malignas por 3 rodadas.", castTime: "1 turno completo de conjuração", cooldown: "1 uso por dia" },
      { name: "Voto Silencioso", level: 3, effect: "Silencia um alvo por 2 rodadas, impedindo-o de conjurar magias com componente verbal.", castTime: "2 turnos de conjuração ininterrupta", cooldown: "1 uso por dia" },
      { name: "Cura Maior", level: 4, effect: "4d8 + SAB de cura; pode reanimar aliado a 0 HP.", castTime: "2 turnos de concentração", cooldown: "1 uso por dia" },
      { name: "Julgamento", level: 4, effect: "3d10 de dano sagrado em área (raio 1).", castTime: "2 turnos de concentração", cooldown: "1 uso por 2 dias" },
      { name: "Banimento", level: 4, effect: "Expulsa uma criatura extraplanar ou morto-vivo para outro plano por até 1 hora.", castTime: "2 turnos de concentração", cooldown: "1 uso por 2 dias" },
      { name: "Intervenção Divina", level: 5, effect: "Cura completa em todos os aliados em raio 3.", castTime: "3 turnos de concentração ininterrupta", cooldown: "1 uso por semana" },
      { name: "Juízo Final", level: 5, effect: "4d12 de dano sagrado em área (raio 2); aliados na área são curados em 2d6 em vez de sofrerem dano.", castTime: "3 turnos de concentração ininterrupta", cooldown: "1 uso por semana" }
    ]
  }
};

/* ---------------------------------------------------------------------- */
/* PERÍCIAS GERAIS (universais)                                          */
/* ---------------------------------------------------------------------- */

const GENERAL_SKILLS = [
  { name: "Montaria", attr: "DEX/AGI", desc: "Permite cavalgar com destreza, controlar montarias assustadas ou feridas, e realizar manobras de combate montado, como disparar flechas ou desembainhar armas em movimento.", example: "Atravessar um terreno acidentado a galope sem cair, ou fazer seu cavalo saltar uma cerca durante uma perseguição." },
  { name: "Ocultismo", attr: "INT/SAB", desc: "Reconhece rituais profanos, símbolos amaldiçoados, cultos secretos e criaturas sobrenaturais raras — o lado obscuro do mundo, diferente da magia acadêmica.", example: "Identificar que o círculo de pedras encontrado na floresta é um altar de invocação, ou reconhecer a marca de um culto demoníaco em uma adaga." },
  { name: "Negociação", attr: "SAB/FOR", desc: "Barganha preços, fecha acordos comerciais e medeia disputas financeiras — focada em transações, não em persuasão emocional.", example: "Conseguir um desconto de 30% num ferreiro relutante, ou negociar o resgate de um prisioneiro por uma soma menor." },
  { name: "Culinária", attr: "INT/SAB", desc: "Prepara refeições reconfortantes que concedem pequenos bônus temporários durante descansos, como +1 HP máximo por algumas horas.", example: "Cozinhar um ensopado de caça para o grupo antes de uma batalha importante, dando um fôlego extra a todos." },
  { name: "Navegação", attr: "INT/SAB", desc: "Orienta-se por mapas, posição das estrelas ou correntes marítimas, evitando que o grupo se perca em viagens longas.", example: "Traçar a rota mais segura por um pântano nebuloso sem bússola, guiando-se apenas pelas estrelas." },
  { name: "Idiomas e Linguística", attr: "INT", desc: "Permite aprender novos idiomas com mais facilidade e decifrar inscrições antigas, códigos simples e escritas estrangeiras.", example: "Traduzir um pergaminho élfico encontrado em uma ruína, ou decifrar um bilhete codificado de um espião." },
  { name: "Jogos de Azar", attr: "DEX/SAB", desc: "Vence apostas em jogos de cartas e dados, e identifica quando alguém está trapaceando na mesa.", example: "Ganhar uma rodada de pôquer contra um mercador desconfiado, ou notar que o dado do apostador está viciado." },
  { name: "Etiqueta e Nobreza", attr: "SAB/INT", desc: "Comporta-se adequadamente em cortes, banquetes e ambientes da aristocracia, evitando gafes sociais que possam gerar problemas.", example: "Saber qual garfo usar em um jantar com a nobreza local, ou se dirigir corretamente a um duque sem ofendê-lo." },
  { name: "Primeiros Socorros de Campo", attr: "SAB", desc: "Estabiliza feridos levemente fora de combate sem exigir treinamento médico avançado — mais básico que a Medicina do Clérigo.", example: "Estancar o sangramento de um aliado caído antes que ele perca consciência, usando apenas bandagens improvisadas." },
  { name: "Artesanato Geral", attr: "FOR/DEX", desc: "Produz e repara itens comuns não-mágicos: ferramentas, móveis simples, roupas e equipamentos de couro ou madeira.", example: "Consertar a roda quebrada de uma carroça no meio da estrada, ou fabricar uma corda nova a partir de fibras locais." },
  { name: "Conhecimento de Mercado", attr: "INT", desc: "Avalia o valor justo de itens, identifica falsificações comerciais e sabe onde encontrar compradores ou vendedores certos.", example: "Perceber que a 'espada antiga' vendida na feira é uma cópia barata, ou saber quem paga mais por gemas raras na cidade." },
  { name: "Resistência a Intempéries", attr: "FOR/SAB", desc: "Suporta frio extremo, calor escaldante, fome prolongada e privação de sono sem sofrer penalidades severas.", example: "Continuar marchando durante uma tempestade de neve sem sucumbir à hipotermia." },
  { name: "Domesticação Animal", attr: "SAB", desc: "Amansa e treina animais comuns (não criaturas mágicas ou monstruosas) para realizar tarefas simples e obedecer comandos.", example: "Treinar um lobo filhote resgatado para seguir comandos básicos e alertar sobre perigos." },
  { name: "Escalada e Rapel", attr: "FOR/AGI", desc: "Supera terrenos verticais com o uso de cordas, ganchos e equipamento apropriado, reduzindo o risco de queda.", example: "Escalar a muralha de uma fortaleza inimiga durante a noite usando uma corda com gancho." }
,

  /* ══════════════════════════════════════════════════════════════
     PERÍCIAS GERAIS — EXPANDIDAS PARA A PARTY
     Focadas em: Guerreiro Puro · Clérigo Puro · Arqueiro Puro · Mago Necromante
     ══════════════════════════════════════════════════════════════ */

  /* ── PARA O GUERREIRO PURO ──────────────────────────────────── */

  {
    name: "Manutenção de Armas e Armaduras",
    attr: "FOR/INT",
    desc: "Cuidar, reparar e otimizar equipamento de combate em campo. Um guerreiro que não mantém o equipamento é um guerreiro que vai enfrentar uma falha no pior momento possível.",
    example: "Afiar uma lâmina embotada entre combates (+1d4 de dano no próximo combate); remover ferrugem de armadura antes de mergulho no pântano; identificar fissura invisível numa espada que quebraria no próximo impacto crítico.",
    mechanics: "Treinado: durante descanso curto, pode restaurar 1 ponto de degrade de arma. Entre sessões: manutenção completa cancela penalidades acumuladas de desgaste. Excelente: pode melhorar temporariamente arma comum para funcionar como rara por 1 combate."
  },

  {
    name: "Leitura de Inimigo",
    attr: "FOR/SAB",
    desc: "Observar um adversário por breve momento e inferir seu nível de ameaça, estilo de luta e possíveis fraquezas. Veteranos de combate reconhecem padrões que iniciantes não veem.",
    example: "Identificar que um guarda está machucado no lado esquerdo pela forma como protege a costela; perceber que um monstro recua de fogo pelo ângulo que evita a tocha; calcular se um inimigo vale a luta antes de engajar.",
    mechanics: "1 Ação Livre (1x/combate): o Mestre revela HP aproximado, Dificuldade e 1 imunidade ou fraqueza do alvo observado. Treinado: 2 informações. Excelente: 3 informações mais o padrão de ataque."
  },

  {
    name: "Intimidação de Campo",
    attr: "FOR/SAB",
    desc: "Usar presença física, reputação e demonstração de força para dissuadir confrontos ou desmoralizar grupos de inimigos antes e durante o combate. Diferente de Intimidação — esta foca no grupo, não no indivíduo.",
    example: "Executar um inimigo de forma calculada para desmoralizar o grupo (SAB difícil ou Abalados 2 rodadas); exigir rendição de bandidos que claramente perderam sem precisar matar mais; manter moral baixo de sitiantes pela reputação.",
    mechanics: "Fora de combate: substituir combate por SAB (difícil) de inimigos Dif.1-2. Em combate: após kill, todos os inimigos em raio 4 hex testam SAB (normal) ou ficam Abalados 1 rodada (1x/combate, fora da habilidade de classe)."
  },

  /* ── PARA O CLÉRIGO PURO ─────────────────────────────────────── */

  {
    name: "Ritual Sagrado",
    attr: "SAB/INT",
    desc: "Conduzir cerimônias, abençoar locais, purificar objetos corrompidos e realizar sacramentos fora de combate. O Clérigo Puro não usa magia apenas em batalha — a fé é prática diária.",
    example: "Abençoar acampamento para que mortos-vivos não se aproximem durante a noite; purificar poço envenenado por influência demoníaca; realizar ritual fúnebre que impede o morto de se levantar como morto-vivo.",
    mechanics: "Treinado: abençoa área de raio 10 hex por 1 descanso longo — mortos-vivos Dif.1 não entram, Dif.2 testam SAB. Purificação: remove corrupção de objeto mágico (1 hora). Excelente: abençoa aliados com +1d4 em resistências por 1 sessão."
  },

  {
    name: "Conhecimento do Plano dos Mortos",
    attr: "SAB/INT",
    desc: "Entender a cosmologia dos mortos — como almas transitam, onde ficam presas, quais entidades habitam o limiar. Complementa Exorcismo com teoria; o Clérigo Puro sabe o porquê, não apenas o como.",
    example: "Identificar que uma alma está presa por objeto físico específico (não apenas 'assombrada'); reconhecer tipo de entidade pelo comportamento antes do combate; saber que este morto-vivo específico foi criado por magia e tem um vínculo que pode ser quebrado.",
    mechanics: "Pergunta ao Mestre: antes de enfrentar morto-vivo ou espírito, pode fazer 2 perguntas (3 se excelente) sobre sua natureza, origem e como destruí-lo permanentemente. Fora de combate: pode localizar almas perdidas em raio de 1 dia de caminhada."
  },

  {
    name: "Herbalismo Sagrado",
    attr: "SAB/INT",
    desc: "Identificar, colher e preparar ervas com propriedades curativas e purificadoras abençoadas. Diferente do herbalismo comum — o Clérigo sabe quais plantas crescem onde há presença divina e o que elas curam que medicina comum não cura.",
    example: "Preparar cataplasma que remove Veneno Comum sem magia; identificar flor sagrada de Aethea que só cresce em solo abençoado; criar incenso que facilita meditação restauradora (recupera +1d6 HP em descanso curto).",
    mechanics: "Entre sessões: prepara 1d4 doses de Erva Sagrada (remove 1 condição negativa de qualquer tipo, não-mágica). Treinado: 2d4 doses. Excelente: pode preparar dose que age como Antídoto Universal (funciona em venenos irremovíveis normalmente)."
  },

  /* ── PARA O ARQUEIRO PURO ────────────────────────────────────── */

  {
    name: "Camuflagem e Emboscada",
    attr: "AGI/SAB",
    desc: "Preparar posição de tiro furtiva, montar emboscada coordenada para o grupo e usar o terreno para desaparecer após o ataque. O Arqueiro Puro não apenas atira — controla quando e de onde.",
    example: "Preparar ponto de atirador em 5 minutos que concede +1d4 em ataques à distância enquanto não for revelado; coordenar emboscada do grupo (todos atacam com vantagem no 1º turno); desaparecer após tiro crítico sem ser rastreado por percepção normal.",
    mechanics: "Preparação (5min): próximo ataque à distância tem Acerto Automático (sem d10). Em emboscada coordenada: todos os aliados no 1º turno têm +2 Chance de Crítico. Treinado: posição de atirador sustenta 3 ataques antes de ser revelada."
  },

  {
    name: "Armadilhas e Rastejos",
    attr: "DEX/INT",
    desc: "Detectar, construir e desativar armadilhas — desde simples laços até mecanismos complexos. O Arqueiro conhece o terreno entre ele e o inimigo melhor que ninguém.",
    example: "Construir armadilha de laço que prende Dif.1-2 (sem teste de FOR para passar sem perceber); detectar armadilha de pedra antes do grupo cair; montar campo minado de armadilhas simples ao redor do acampamento antes de dormir.",
    mechanics: "Construção (10min): armadilha para Dif.1-2 (AGI difícil para perceber). Treinado: armadilha para Dif.3 ou múltiplas Dif.1 em área. Detectar: SAB (normal) vs armadilhas; treinado: detecta automaticamente se mover devagar."
  },

  {
    name: "Navegação por Estrelas",
    attr: "SAB/INT",
    desc: "Orientar o grupo usando posição estelar, vento, vegetação e outros marcos naturais — mesmo em terreno nunca visto, mesmo à noite. O Arqueiro Puro nunca se perde.",
    example: "Determinar direção precisa sem mapa em floresta densa à noite; prever clima das próximas 24h pela formação de nuvens e vento; identificar que o grupo foi desviado magicamente e qual a direção real do destino.",
    mechanics: "Passivo (treinado): o grupo nunca se perde por meios naturais. Ativo: SAB (normal) para detectar desvio mágico ou ilusão de terreno. Excelente: pode traçar rota que evita encontros aleatórios em 1 dia de viagem (o Arqueiro conhece os padrões de criaturas)."
  },

  {
    name: "Disfarce e Infiltração",
    attr: "DEX/SAB",
    desc: "Alterar aparência, imitar comportamento de guarda ou servo, e mover-se em locais restritos sem levantar suspeita. Útil quando o arco não resolve — e às vezes o Arqueiro precisa chegar perto sem ser visto.",
    example: "Passar por guarda de templo com uniforme improvisado e postura correta; imitar sotaque regional para não ser identificado como estrangeiro; entrar em festa nobre fingindo ser servo contratado.",
    mechanics: "SAB (normal) para disfarce básico (aparência). SAB (difícil) para imitar função específica (guarda, servo, sacerdote). Treinado: pode manter disfarce sob pressão moderada. Excelente: o disfarce resiste a interrogatório curto."
  },

  /* ── PARA O MAGO NECROMANTE ──────────────────────────────────── */

  {
    name: "Alquimia Sombria",
    attr: "INT/SAB",
    desc: "Criar substâncias que operam na fronteira entre química e magia: venenos específicos, reagentes para rituais de necromancia, conservantes para tecidos mortos, solventes para enchantamentos. O Necromante usa alquimia como extensão da magia.",
    example: "Criar dose de Veneno do Túmulo (irremovível por antídoto comum) a partir de Glândula de Veneno do Túmulo; preparar solução conservante que mantém corpo íntegro por 7 dias para ritual posterior; sintetizar reagente que torna Ritual Proibido 4 horas mais rápido.",
    mechanics: "Treinado: com materiais corretos, cria 1d4 doses de veneno raro por descanso longo. Pode preparar reagentes que reduzem custo de materiais de rituais em 50%. Excelente: cria venenos que mimetizam efeito de condições (Petrificado temporário, Confuso, etc.)."
  },

  {
    name: "Leitura de Presságios",
    attr: "INT/SAB",
    desc: "Interpretar sinais — movimentos de corvos, padrões de sangue, sonhos recorrentes, rachaduras em ossos queimados — como indicadores do que está por vir. O Necromante lida com a morte; a morte às vezes avisa.",
    example: "Identificar que o corvos na vila estão apontando para o leste há três dias — algo morreu ou vai morrer lá; interpretar sonho perturbador de um aliado como aviso de traição dentro do grupo; perceber que o padrão de mortes numa cidade segue uma progressão deliberada.",
    mechanics: "1x/sessão: o jogador faz uma pergunta sobre o futuro imediato (próxima sessão). O Mestre responde com uma pista críptica mas genuína. Treinado: 2 perguntas. Excelente: a resposta é direta em vez de críptica. Falha (SAB difícil): recebe pista falsa ou sem sentido."
  },

  {
    name: "Herbalismo Sombrio",
    attr: "INT/SAB",
    desc: "Conhecer plantas, fungos e substâncias que afetam a morte, o morrer e o pós-morte — cogumelos que crescem em cadáveres, ervas que facilitam o transe de contato com mortos, venenos que preservam em vez de destruir.",
    example: "Identificar cogumelo que cresce apenas em mortos-vivos — presença indica dungeon de necromante próximo; preparar chá de Flor do Esquecimento que facilita contato espiritual (bônus em Sentir a Morte por 1 hora); colher fungo preservante que mantém membro amputado reintegrável.",
    mechanics: "Identificar: reconhece automaticamente qualquer planta ou fungo relacionado à morte. Preparar: cria poção de Contato Espiritual (bônus em Sentir a Morte e Ritual Proibido por 1 hora). Treinado: identifica origem de morto-vivo por flora ao redor do corpo."
  },

  /* ── PARA A PARTY COMO GRUPO ─────────────────────────────────── */

  {
    name: "Avaliação de Itens Raros",
    attr: "INT/SAB",
    desc: "Estimar o valor real, a procedência e as propriedades de itens raros, mágicos e únicos — especialmente os que não aparecem em catálogos comuns. O grupo encontra muita coisa estranha; saber o que têm é poder.",
    example: "Identificar que o 'item comum' que o vendedor oferece é na verdade peça de um conjunto lendário; avaliar corretamente um acessório mágico sem precisar de identificação mágica; reconhecer que o 'cristal decorativo' é um Frasco de Alma Aprisionada.",
    mechanics: "Passivo: identifica tier e efeito básico de qualquer item sem identificação mágica. Treinado: identifica efeitos completos. Excelente: detecta maldição, vínculo ou origem de item mágico sem spell. Falha: recebe avaliação parcialmente incorreta (o Mestre decide qual parte)."
  },

  {
    name: "Viagem Furtiva",
    attr: "AGI/SAB",
    desc: "Mover o grupo inteiro através de território hostil sem ser detectado — coordenando ritmo, silêncio, cobertura e rota. Diferente de Furtividade individual: esta perícia só funciona em grupo.",
    example: "Guiar o grupo através de patrulha de cultistas sem combate; atravessar floresta com mortos-vivos à noite sem ser detectado pelo Sentido de Vibração; transportar aliado ferido (que faz barulho) através de área vigiada.",
    mechanics: "Toda a party recebe Furtividade funcional por 1 cena. SAB (normal) para terreno familiar; SAB (difícil) para território hostil ativo. Falha: 1 membro do grupo (mais ruidoso) é detectado. Excelente: furtividade funciona mesmo contra Sentido de Vibração e Percepção Mágica."
  },

  {
    name: "Acampamento Seguro",
    attr: "SAB/INT",
    desc: "Estabelecer acampamento defensável — escolher posição, montar sentinelas eficientes, criar sistema de alerta e garantir que o grupo descanse sem ser surpreendido. Em mundo com mortos-vivos e cultistas, dormir mal é morrer devagar.",
    example: "Identificar posição que maximiza visibilidade e minimiza flancos; montar sistema de alerta com fios e latas que acorda antes de qualquer furtividade funcionar; escolher local naturalmente protegido (cave, elevação, círculo de pedra).",
    mechanics: "Descanso longo: se usado, elimina chance de encontro aleatório noturno. Treinado: o grupo recupera +1d6 HP adicional no descanso (o sono é mais profundo e seguro). Excelente: mortos-vivos e criaturas noturnas Dif.1-2 evitam a área naturalmente."
  },

  {
    name: "Comércio de Itens Especiais",
    attr: "SAB/INT",
    desc: "Encontrar compradores e vendedores de itens que não aparecem em lojas comuns — partes de monstros, artefatos malditos, materiais de necromancia, relíquias religiosas proibidas. O mercado negro, o colecionador excêntrico, o templo que não faz perguntas.",
    example: "Encontrar comprador para Frasco de Alma Aprisionada sem alertar as autoridades; localizar vendedor de Glândula de Veneno do Túmulo em cidade que tecnicamente os proíbe; negociar com culto menor pela informação que só eles têm.",
    mechanics: "Em qualquer cidade de tamanho médio+: SAB (normal) para encontrar comprador/vendedor de item incomum em 1d4 horas. SAB (difícil) para itens muito restritos. Treinado: preço 20% melhor e mais rápido. Excelente: acesso a rede permanente de contatos em 3 cidades."
  }];

/* ---------------------------------------------------------------------- */
/* MAGIAS GERAIS (universais — aprendidas em grimórios)                  */
/* ---------------------------------------------------------------------- */

const GENERAL_SPELLS = [
  { name: "Mão Distante", level: 1, effect: "Traz um objeto pequeno e desacompanhado à mão (alcance 6).", castTime: "1 Ação (instantânea)", cooldown: "4 usos por sessão" },
  { name: "Reparo Menor", level: 1, effect: "Conserta um objeto pequeno quebrado (não mágico/grande).", castTime: "1 Ação (instantânea)", cooldown: "4 usos por sessão" },
  { name: "Luz", level: 1, effect: "Um objeto tocado emite luz suave por 1 hora (raio 3).", castTime: "1 Ação (instantânea)", cooldown: "4 usos por sessão" },
  { name: "Mensagem", level: 1, effect: "Envia uma frase curta a um alvo conhecido (alcance 15).", castTime: "1 Ação (instantânea)", cooldown: "4 usos por sessão" },
  { name: "Limpeza", level: 1, effect: "Remove sujeira, poeira ou cheiro leve de algo tocado.", castTime: "1 Ação (instantânea)", cooldown: "4 usos por sessão" },
  { name: "Mãos Hábeis", level: 1, effect: "+2 em perícias manuais por 10 minutos.", castTime: "1 Ação (instantânea)", cooldown: "3 usos por sessão" },
  { name: "Passo Silencioso", level: 1, effect: "Passos inaudíveis além de 1 hexágono por 10 minutos.", castTime: "1 Ação (instantânea)", cooldown: "3 usos por sessão" },
  { name: "Purificar Água e Comida", level: 1, effect: "Remove venenos não-mágicos de água/comida.", castTime: "1 Ação (instantânea)", cooldown: "4 usos por sessão" },
  { name: "Aquecer ou Resfriar Objeto", level: 1, effect: "Altera a temperatura de um objeto tocado (do gelado ao quente) por 10 minutos.", castTime: "1 Ação (instantânea)", cooldown: "4 usos por sessão" },
  { name: "Vínculo de Carga", level: 2, effect: "Reduz peso efetivo carregado em 50% por 1 hora.", castTime: "1 Ação (instantânea)", cooldown: "2 usos por sessão" },
  { name: "Identificar", level: 2, effect: "Revela propriedades mágicas básicas de um item tocado.", castTime: "1 Ação (instantânea)", cooldown: "2 usos por sessão" },
  { name: "Comunicação com Animais", level: 2, effect: "Conversa simples com um animal comum por 10 minutos.", castTime: "1 Ação (instantânea)", cooldown: "2 usos por sessão" },
  { name: "Trancar/Destrancar", level: 2, effect: "Tranca ou destranca uma porta/baú/portão comum tocado.", castTime: "1 Ação (instantânea)", cooldown: "2 usos por sessão" },
  { name: "Pequeno Conforto", level: 2, effect: "Cria abrigo temporário até o próximo descanso longo.", castTime: "1 Ação (instantânea)", cooldown: "1 uso por dia" },
  { name: "Visão Noturna Arcana", level: 2, effect: "Concede visão no escuro a um alvo tocado por 1 hora.", castTime: "1 Ação (instantânea)", cooldown: "2 usos por sessão" },
  { name: "Passos do Vento", level: 2, effect: "Aumenta o Movimento do conjurador em 3 hexágonos por 3 rodadas.", castTime: "1 Ação (instantânea)", cooldown: "2 usos por batalha" },
  { name: "Disfarce Menor", level: 3, effect: "Altera levemente a aparência do conjurador por 1 hora.", castTime: "1 turno completo de conjuração", cooldown: "1 uso por dia" },
  { name: "Sussurro do Vento", level: 3, effect: "Ouve conversas em raio de 10 hexágonos por 1 minuto.", castTime: "1 turno completo de conjuração", cooldown: "1 uso por dia" },
  { name: "Passo Dimensional", level: 3, effect: "Teletransporta o conjurador até 4 hexágonos para um ponto visível, ignorando obstáculos no caminho.", castTime: "1 Ação (instantânea)", cooldown: "2 usos por batalha" },
  { name: "Resistência Elemental", level: 3, effect: "Concede resistência a um tipo de dano elemental (reduz à metade) a um alvo tocado por 3 rodadas.", castTime: "1 Ação (instantânea)", cooldown: "1 uso por dia" },

  /* ── BUFFS ──────────────────────────────────────────────────────── */
  { name: "Agilidade de Combate", level: 1, category: "buff",
    effect: "Alvo tocado ganha +1 Ação de Movimento extra neste turno e no próximo. Não acumula com si mesmo.",
    castTime: "1 Ação (instantânea)", cooldown: "3 usos por batalha" },

  { name: "Mãos Firmes", level: 1, category: "buff",
    effect: "Alvo tocado adiciona +1d4 ao próximo ataque corpo a corpo que fizer neste turno. Desaparece ao fim do turno.",
    castTime: "1 Reação", cooldown: "4 usos por batalha" },

  { name: "Fúria Arcana", level: 2, category: "buff",
    effect: "Alvo tocado ganha +1d6 de dano em todos os ataques corpo a corpo por 3 rodadas. O alvo fica Vulnerável a dano mágico durante a duração.",
    castTime: "1 Ação (instantânea)", cooldown: "3 usos por batalha" },

  { name: "Escudo Arcano Aprimorado", level: 2, category: "buff",
    effect: "Alvo tocado ganha +1d4 de Defesa Física e +1d4 de Defesa Mágica por 4 rodadas. Os dados são rolados uma vez ao conjurar.",
    castTime: "1 Ação (instantânea)", cooldown: "3 usos por batalha" },

  { name: "Olhos do Predador", level: 2, category: "buff",
    effect: "Alvo tocado adiciona +1d6 em testes de Percepção e Pressentimento por 1 hora. Em batalha: não pode ser surpreendido e enxerga criaturas invisíveis em raio 4 hex.",
    castTime: "1 Ação (instantânea)", cooldown: "2 usos por sessão" },

  { name: "Aceleração Menor", level: 2, category: "buff",
    effect: "+1 Ação de ataque por turno durante 5 turnos. Ao final: Exausto Menor — o alvo perde 1 Ação no próximo turno (apenas um turno de penalidade).",
    castTime: "1 Ação de Magia", cooldown: "3 usos por batalha" },

  { name: "Aceleração", level: 3, category: "buff",
    effect: "+1 Ação de ataque por turno durante 8 turnos. Ao final: Exausto — o alvo perde todas as Ações por 1 turno completo (não pode atacar, mover ou reagir).",
    castTime: "1 Ação de Magia", cooldown: "2 usos por batalha" },

  { name: "Aceleração Superior", level: 4, category: "buff",
    effect: "+2 Ações de ataque por turno durante 4 rodadas. Ao final: Colapso de Adrenalina — o alvo perde um turno inteiro (0 Ações, 0 Reações, não pode ser protegido por aliados nesse turno).",
    castTime: "1 Ação de Magia", cooldown: "1 uso por batalha" },

  { name: "Corpo de Ferro", level: 3, category: "buff",
    effect: "Alvo tocado ganha Resistência Física: todo dano físico sofrido é reduzido em 1d6 (rola a cada golpe) por 4 rodadas ou até ser interrompido por dano mágico.",
    castTime: "1 Ação (instantânea)", cooldown: "1 uso por batalha" },

  { name: "Amplificar", level: 3, category: "buff",
    effect: "Escolhe um aliado visível. A próxima magia que ele conjurar terá seu efeito dobrado (dano, cura ou duração). Deve ser usada antes da magia alvo.",
    castTime: "1 Reação", cooldown: "1 uso por batalha" },

  { name: "Forma de Guerra", level: 4, category: "buff",
    effect: "Alvo tocado assume forma de guerra por 5 rodadas: +1d8 dano natural, +1 Ação de Combate extra por turno, imune a Medo, +1d6 em Resistência. Ao fim: alvo Prostrado por 1 rodada de exaustão.",
    castTime: "1 turno completo", cooldown: "1 uso por dia" },

  { name: "Transcendência Marcial", level: 5, category: "buff",
    effect: "Um aliado recebe por 4 rodadas: +1 Ação extra por turno, +1d12 em todos os ataques, +1d8 em defesas, imunidade a dano não-mágico, Regeneração de 1d8 HP/rodada. Após o fim: alvo cai a 1 HP e fica Inconsciente por 1 rodada.",
    castTime: "2 turnos de concentração ininterrupta", cooldown: "1 uso por semana" },

  /* ── RITUAIS ─────────────────────────────────────────────────────── */
  { name: "Ritual do Eco da Morte", level: 3, category: "ritual",
    effect: "Realizado sobre cadáver morto há menos de 24h. O conjurador faz até 3 perguntas ao espírito — obrigado a responder, mas pode ser vago. Requer objeto pessoal do morto.",
    castTime: "3 turnos ininterruptos (fora de combate)", cooldown: "1 uso por dia" },

  { name: "Ritual de Selamento", level: 3, category: "ritual",
    effect: "Sela porta, passagem ou área (até 3x3 hex) com glifo arcano. Criaturas que cruzem sem senha recebem 2d8 de dano e ficam Atordoadas por 1 rodada. Selo: 10 HP, Defesa 4, dura 1 semana.",
    castTime: "2 turnos ininterruptos (fora de combate)", cooldown: "1 uso por dia" },

  { name: "Ritual do Nome Verdadeiro", level: 4, category: "ritual",
    effect: "Requer pesquisa prévia (1h de estudo ou INT difícil). Pronuncia o Nome Verdadeiro de criatura inteligente visível: Dominada completamente por 1d4 rodadas (sem teste). Funciona uma vez por Nome.",
    castTime: "2 turnos de concentração ininterrupta", cooldown: "1 uso por semana por Nome" },

  { name: "Ritual da Tempestade Interior", level: 4, category: "ritual",
    effect: "Concentra por 3 turnos. Ao finalizar: tempestade de relâmpagos em área 5x5 hex visível causando 4d10 de dano elétrico a inimigos (aliados: 1d6). Se interrompido: 2d8 de dano reflexivo e perde a magia.",
    castTime: "3 turnos de concentração ininterrupta", cooldown: "1 uso por 2 dias" },

  { name: "Ritual de Ligação de Alma", level: 5, category: "ritual",
    effect: "Liga permanentemente a vida do conjurador à de um aliado consentidor. Ao qualquer um cair a 0 HP, o outro transfere metade do HP atual automaticamente. Ambos sentem quando o outro está em perigo. Quebrar voluntariamente custa 2d10 HP a ambos.",
    castTime: "10 minutos (fora de combate, consentimento mútuo)", cooldown: "Permanente (1 vínculo ativo)" },

  { name: "Ritual do Círculo de Karlac", level: 4, category: "ritual",
    effect: "Realizado na trilha de Karlac (Deserto Carmesim) ou com Fragmento de Memória de Karlac. O conjurador recebe uma visão do que Karlac está 'procurando' em seus círculos — informação de campanha. Em batalha: cria uma mancha de calor carmesim (3x3 hex) por 4 rodadas; criaturas do Deus Marcado na área sofrem 1d8 de dano extra por turno.",
    castTime: "2 turnos no local sagrado ou com o fragmento", cooldown: "1 uso por semana" },

  { name: "Ritual da Memória do Dragão", level: 5, category: "ritual",
    effect: "Requer Escama Dourada do Dragão ou ser no topo do Vulcão de Karloth. O conjurador acessa a memória da Batalha Colossal por 10 minutos. Pode escolher: (1) revelar a localização de qualquer item Ancestral; (2) aprender a fraqueza de um inimigo específico; ou (3) receber a bênção da Forma de Guerra de graça para um aliado hoje.",
    castTime: "1 hora de meditação (fora de combate)", cooldown: "1 uso por mês" },

  /* ── INVOCAÇÕES ──────────────────────────────────────────────────── */
  { name: "Invocar Familiar Arcano", level: 1, category: "invocacao",
    effect: "Invoca familiar Pequeno (corvo, rato, víbora — HP 6, Defesa 1). Pode explorar, escutar e transmitir visões ao conjurador (raio 30 hex). Dissolve-se se reduzido a 0 HP ou ao fim da sessão.",
    castTime: "1 Ação (instantânea)", cooldown: "1 uso por sessão" },

  { name: "Invocar Guardião de Pedra", level: 1, category: "invocacao",
    effect: "Invoca golem de pedra (HP 12, Def Física 4) que ocupa um hex. Pode atacar (1d4 de impacto) e bloquear passagem. Dissolve-se após 3 rodadas ou ao ser destruído. Requer um fragmento de pedra.",
    castTime: "1 Ação (instantânea)", cooldown: "3 usos por batalha" },

  { name: "Invocar Espírito Guerreiro", level: 2, category: "invocacao",
    effect: "Invoca espírito etéreo (HP 20, Def Física 2, Def Mágica 3, imune a veneno). Ataca com 1d8 de dano etéreo, age no turno do conjurador com 2 Ações. Dissolve-se após 4 rodadas ou 0 HP.",
    castTime: "1 Ação (instantânea)", cooldown: "2 usos por batalha" },

  { name: "Invocar Lobo das Névoas", level: 3, category: "invocacao",
    effect: "Condição: INT ou SAB ≥ 2 e ambiente sem luz solar direta. Invoca Lobo das Névoas (HP 45, Def 4/4, Esq 14, dano 1d8+1d4, aplica Medo). Age com 2 Ações e 1 Reação no turno do conjurador. Dura 5 rodadas.",
    castTime: "1 turno completo", cooldown: "1 uso por dia" },

  { name: "Invocar Cobras Sagradas de Jurgmund", level: 3, category: "invocacao",
    effect: "Condição: SAB ≥ 2. Invoca 1d4+1 cobras sagradas (HP 10, Def 2, Esq 14, dano 1d4 + Veneno Sagrado 1d6/2 rodadas). 3 ou mais atacando o mesmo alvo: teste Resistência (difícil) ou Paralisado 1 rodada. Dura 4 rodadas.",
    castTime: "1 turno completo", cooldown: "1 uso por dia" },

  { name: "Invocar Elemental Menor", level: 3, category: "invocacao",
    effect: "Condição: INT ou SAB ≥ 2, fragmento do elemento. Escolhe fogo, água, terra ou ar (HP 50, Def 5). Fogo: 1d10 fogo. Água: 1d8+Empurrar 2 hex. Terra: 1d10+Prostrado. Ar: 1d6+Cegante. Age com 2 Ações. Dura 4 rodadas.",
    castTime: "1 turno completo", cooldown: "1 uso por dia" },

  { name: "Invocar Guardião do Abismo", level: 4, category: "invocacao",
    effect: "Condição: Foco contínuo — gasta 1 Ação de Magia por turno para manter. Se não puder, dissolve-se. Invoca Guardião do Abismo Grande (HP 90, Def 7/6, dano 1d12+1d6 vazio, Rugido do Abismo 1x: Aterroriza raio 3 hex). Age com 3 Ações.",
    castTime: "2 turnos de concentração ininterrupta", cooldown: "1 uso por dia" },

  { name: "Invocar Filhote de Karlac", level: 3, category: "invocacao",
    effect: "Condição: SAB ≥ 2, fragmento de escama de Karlac. Invoca um Karlac Filhote (HP 30, Def Física 4, dano 1d8 fogo, Pele Quente: 1d4 dano a quem atacar corpo a corpo). Age com 2 Ações no turno do conjurador. Dura 4 rodadas. Em solo do Deserto Carmesim: dura 6 rodadas.",
    castTime: "1 turno completo", cooldown: "1 uso por dia" },

  { name: "Invocar Lobo do Vazio", level: 5, category: "invocacao",
    effect: "Condição: ritual de 1 turno + 4 de recurso de classe. Apenas à noite ou em local amaldiçoado. Invoca Lobo do Vazio (HP 130, Def 7/8, Passo do Vazio, Mordida da Alma −1 HP máx/3r, Regeneração 1d8/r). Age com 3 Ações e 2 Reações. Dura 4 rodadas.",
    castTime: "1 turno completo + custo de recurso", cooldown: "1 uso por semana" },

  { name: "Invocar a Serpente Imortal", level: 5, category: "invocacao",
    effect: "Condição: ritual de 1 turno + 4 de recurso. Apenas em templos de Jurgmund ou Serpentara. Invoca manifestação da Serpente Imortal Grande (HP 150, Def 8/10, Mordida Divina 2d10+1d8+Veneno 2d6/3r, Constrição 1d12/r, Muda Sagrada 1x: recupera 30 HP). Age com 3 Ações e 1 Reação. Dura 5 rodadas.",
    castTime: "1 turno completo + custo de recurso", cooldown: "1 uso por semana" },

  /* ── NOVAS MAGIAS NÍVEL 1 — utilitárias e de combate ──────── */

  { name: "Voz do Comando", level: 1, category: "utilidade",
    effect: "Pronuncia uma única palavra de comando (Cair, Parar, Largar, Fugir, Dormir) em voz alta. Um alvo visível a até 6 hex com INT ≤ 1 obedece instantaneamente sem teste. Alvos com INT 2+ testam SAB (normal) — se falharem, agem de acordo com o comando por 1 rodada. Criaturas do Deus Marcado são imunes.",
    castTime: "1 Ação (instantânea)", cooldown: "3 usos por combate" },

  { name: "Escudo de Faíscas", level: 1, category: "defesa",
    effect: "Conjura um campo de faíscas ao redor do conjurador. Qualquer atacante que acertar corpo a corpo leva 1d4 de dano elétrico automaticamente (sem teste). Dura 3 rodadas ou até ser derrubado por 10+ de dano em um único golpe.",
    castTime: "1 Ação (instantânea)", cooldown: "3 usos por combate" },

  { name: "Chama Livre", level: 1, category: "ataque",
    effect: "Projeta uma chama pequena a até 6 hex. Dano: 1d6 de fogo. Objetos inflamáveis atingidos pegam fogo. Se o alvo for de madeira, palha ou tecido, causa 1d6 extra. Não pode ser bloqueado por escudos.",
    castTime: "1 Ação (instantânea)", cooldown: "Ilimitado" },

  { name: "Mão de Gelo", level: 1, category: "ataque/controle",
    effect: "Toque: aplica 1d4 de dano de frio e reduz o Movimento do alvo em 2 por 2 rodadas (o frio enrijece). Resistência SAB (normal) anula a redução de Movimento mas não o dano.",
    castTime: "1 Ação (instantânea)", cooldown: "4 usos por combate" },

  { name: "Salto Arcano", level: 1, category: "mobilidade",
    effect: "O conjurador salta até 5 hex em linha reta, ignorando terreno difícil no percurso. Pode ser usado no próprio turno como deslocamento ou como Ação de Reação para sair de alcance antes de um ataque ser resolvido (custa 1 Reação).",
    castTime: "1 Ação / 1 Reação", cooldown: "3 usos por combate" },

  { name: "Sussurro Arcano", level: 1, category: "utilidade",
    effect: "Transmite uma mensagem de até 30 palavras para qualquer pessoa visível, sem emitir som. A mensagem chega como pensamento. Se usado em combate, pode transmitir ordem tática a aliados sem revelar posição. Alcance: visão direta.",
    castTime: "1 Ação de Magia", cooldown: "Ilimitado" },

  { name: "Veneno de Contato", level: 1, category: "ataque",
    effect: "Toque: aplica veneno fraco ao alvo. 1d4 de dano por rodada por 3 rodadas. Resistência SAB (normal) encerra o efeito. Pode ser aplicado em uma arma antes do combate — o próximo acerto com ela aplica o veneno sem custo de Ação adicional (1 uso).",
    castTime: "1 Ação de Magia", cooldown: "4 usos por combate" },

  { name: "Marca do Alvo", level: 1, category: "suporte",
    effect: "Marca um alvo visível com um glifo invisível (detectável por Arcanismo). Enquanto marcado, todos os aliados que atacarem o alvo ganham +1d4 de dano. A marca dura 4 rodadas ou até o alvo atingir 0 HP. Apenas um alvo pode estar marcado por conjurador por vez.",
    castTime: "1 Ação de Magia", cooldown: "3 usos por combate" },

  { name: "Raio Fragmentado", level: 1, category: "ataque",
    effect: "Dispara 2 raios arcanos menores. Cada raio causa 1d4 de dano e pode atingir alvos diferentes (até 8 hex). Role o acerto separado para cada raio. Se ambos atingirem o mesmo alvo, ele fica com −1d4 na Defesa Mágica por 1 rodada (raios simultâneos desorientam).",
    castTime: "1 Ação de Magia", cooldown: "Ilimitado" },

  /* ── NOVAS MAGIAS NÍVEL 2 — mais poderosas ────────────────── */

  { name: "Onda de Impacto", level: 2, category: "ataque/controle",
    effect: "Gera uma onda de força em cone de 3 hex de comprimento. Todos os alvos no cone sofrem 1d8 de dano contundente e são Empurrados 2 hex para trás. Resistência FOR (normal) anula o empurrão mas não o dano. Pode derrubar alvos menores (tamanho pequeno) automaticamente.",
    castTime: "1 Ação de Magia", cooldown: "3 usos por combate" },

  { name: "Nuvem de Névoa", level: 2, category: "controle/tática",
    effect: "Cria uma área densa de névoa em raio 4 hex ao redor de um ponto escolhido. Visão dentro da névoa fica limitada a 1 hex. Atacantes na névoa têm −1d6 na Chance de Acerto. Dura 4 rodadas ou até vento forte (vento natural não a dissipa — apenas ventanias ou magia de ar).",
    castTime: "1 Ação de Magia", cooldown: "2 usos por combate" },

  { name: "Âncora Arcana", level: 2, category: "controle",
    effect: "Escolhe um alvo visível a até 8 hex. Por 3 rodadas, o alvo não pode se mover mais de 2 hex por turno (como se estivesse carregando peso extremo). Resistência FOR (difícil) cancela. Não afeta criaturas voadoras nem etéreas.",
    castTime: "1 Ação de Magia", cooldown: "2 usos por combate" },

  { name: "Toque Curativo", level: 2, category: "cura",
    effect: "Cura 2d6 + SAB HP em um aliado tocado. Se o alvo estiver abaixo de 25% do HP máximo, a cura é dobrada (4d6 + SAB). Pode estabilizar automaticamente um aliado inconsciente sem rolar testes.",
    castTime: "1 Ação de Magia", cooldown: "3 usos por combate" },

  { name: "Armadura de Vento", level: 2, category: "defesa",
    effect: "Envolve o alvo tocado em correntes de vento por 3 rodadas: +1d6 na Esquiva e projéteis à distância têm 30% de chance de ser desviados (rola 1d10 — em 1, 2 ou 3, o projétil erra automaticamente). Não afeta ataques corpo a corpo.",
    castTime: "1 Ação de Magia", cooldown: "2 usos por combate" },

  { name: "Terreno Traiçoeiro", level: 2, category: "controle/tática",
    effect: "Encanta uma área de 3x3 hex por 4 rodadas. Qualquer criatura que se mover dentro da área gasta 1 Ação extra de Movimento por hex (terreno extremamente difícil) e testa AGI (normal) ou fica Derrubada ao entrar. Aliados designados pelo conjurador são imunes.",
    castTime: "1 Ação de Magia", cooldown: "2 usos por combate" },

  { name: "Drenar Energia", level: 2, category: "ataque/suporte",
    effect: "Toque ou alcance de 4 hex: drena 1d8 de HP do alvo e transfere metade (arredondado para baixo) para o conjurador como cura. Resistência SAB (difícil) anula a cura do conjurador mas não o dano. Criaturas do Deus Marcado sofrem 1d8 extra.",
    castTime: "1 Ação de Magia", cooldown: "3 usos por combate" },

  { name: "Glifo de Alarme", level: 2, category: "utilidade/defesa",
    effect: "Traça um glifo invisível em uma superfície tocada. Quando uma criatura não-designada cruzar o glifo, ele explode causando 2d6 de dano e aplicando Atordoado por 1 rodada (Resistência SAB normal cancela o Atordoado mas não o dano). O glifo pode ser preparado antes do combate e dura até 8 horas ou ser disparado.",
    castTime: "1 Ação de Magia (armadilha prévia) ou 2 Ações (combate)", cooldown: "2 usos por sessão" },


  /* ══════════════════════════════════════════════════════════
     MAGIAS AMALDIÇOADAS — Grande poder, grande custo
     ══════════════════════════════════════════════════════════ */

  { name: "Explosão de Mana", level: 5, category: "ataque/sacrifício", cursed: true,
    effect: "EXCLUSIVA DO BÁCULO DA EXPLOSÃO DE MANA. O conjurador sacrifica HP MÁXIMO permanentemente (não retorna com descanso). A cada 5 HP máx sacrificados, causa +1d20 de dano numa área 3x3 hex. Sem limite de sacrifício por conjuração. Se chegar a 0 HP máx, morre instantaneamente e o báculo explode causando o total de dano em raio 10 hex.",
    castTime: "1 Ação de Magia (sacrifício declarado antes)", cooldown: "Ilimitado — o custo é HP máximo permanente",
    note: "⚠ AMALDIÇOADA: Só conjurável com o Báculo da Explosão de Mana. Não pode ser aprendida por grimório." },

  { name: "Rito dos Pombos", level: 2, category: "buff/maldição", cursed: true,
    effect: "Garante que o próximo ataque feito pelo conjurador ou aliado visível seja Crítico Automático (dano máximo). MAS no turno SEGUINTE ao crítico, qualquer 20 natural nos dados do mesmo portador vira Falha Crítica — o equilíbrio cósmico se inverte.",
    castTime: "1 Ação de Magia", cooldown: "2 usos por combate",
    note: "⚠ AMALDIÇOADA: O ciclo de inversão não pode ser cancelado por magia. Usar o Rito durante a inversão cria novo Crítico mas a inversão dura mais 1 turno." },

  { name: "Invocação do Duplo Sombrio", level: 4, category: "invocação/maldição", cursed: true,
    effect: "Invoca uma cópia sombria do conjurador com 80% de suas estatísticas por 4 rodadas. O Duplo ataca aliados e inimigos aleatoriamente. O conjurador pode controlar o Duplo gastando 1 Ação de Magia por turno + Força de Vontade (difícil). Ao morrer, o Duplo explode: 2d10 sombrio em raio 3 hex.",
    castTime: "2 turnos de concentração", cooldown: "1 uso por semana",
    note: "⚠ AMALDIÇOADA: Se o Duplo matar um aliado, o conjurador ganha 1 nível de Corrupção da Marca permanentemente." },

  { name: "Pacto do Último Fôlego", level: 3, category: "buff/sacrifício", cursed: true,
    effect: "Por 5 rodadas: imune a Inconsciente, +1d12 em todos os ataques, +1d8 em todos os testes. Ao fim, o conjurador cai a 1 HP automaticamente e fica Incapacitado por 2 rodadas.",
    castTime: "1 Ação de Magia", cooldown: "1 uso por combate",
    note: "⚠ AMALDIÇOADA: Se o pacto terminar com menos de 20% HP, Força de Vontade (crítico) ou entra em fúria e ataca o aliado mais próximo por 1 rodada." },

  { name: "Despertar do Morto-Vivo", level: 3, category: "invocação/necromancia", cursed: true,
    effect: "Ressuscita um cadáver morto há menos de 1 hora como aliado Morto-Vivo (60% HP original, mantém habilidades físicas). O Morto-Vivo age com 2 Ações no turno do conjurador. Dura até o fim do combate.",
    castTime: "1 turno de concentração", cooldown: "1 uso por sessão",
    note: "⚠ AMALDIÇOADA: Se o Morto-Vivo matar um inimigo, o conjurador ganha 1d8 HP mas fica com olhos pretos por 24h — reconhecido como usuário de magia proibida." },

  { name: "Fissura Mental", level: 2, category: "controle/maldição", cursed: true,
    effect: "2d8 de dano psíquico a um alvo visível em até 10 hex. Alvo fica Confuso por 3 rodadas (1-2=ataca aliado mais próximo, 3-4=parado, 5-6=age normalmente). Resistência SAB (difícil) anula a Confusão mas não o dano.",
    castTime: "1 Ação de Magia", cooldown: "2 usos por combate",
    note: "⚠ AMALDIÇOADA: Se o conjurador falhar em qualquer teste nesta rodada, sofre 1d8 de dano psíquico — a fissura reflete parcialmente." },



  /* ══════════════════════════════════════════════════════════
     MAGIAS DIVINAS — Concedidas pelas divindades das raças
     Disponíveis apenas para portadores de itens sagrados
     da respectiva divindade ou com permissão do Mestre
     ══════════════════════════════════════════════════════════ */

  /* ── AETHEA — Deusa dos Elfos (Luz e Memória) ── */
  { name: "Claridade de Aethea", level: 3, category: "cura/buff", divine: "Aethea",
    effect: "Cria uma aura de luz dourada em raio 5 hex por 4 rodadas. Aliados na aura recuperam 1d6 HP por turno (passivo). Inimigos na aura têm −1d4 em testes de Resistência mental. Uma vez durante a duração: pode revelar a 'verdade' de uma mentira ou ilusão — desfaz disfarces e Ilusões de nível 3 ou menor automaticamente.",
    castTime: "1 Ação de Magia", cooldown: "1 uso por combate",
    note: "🌟 Só pode ser conjurada por portadores da Lágrima de Aethea, da Lâmina do Crepúsculo ou elfos com bênção ativa de Aethea." },

  { name: "Memória dos Elfos Caídos", level: 4, category: "invocação/buff", divine: "Aethea",
    effect: "Invoca as memórias de guerreiros elfos mortos na escravidão — não corpos, mas ecos que podem agir. Por 3 rodadas, 1d4 Ecos Élficos (HP 20, Def.3, Dano 1d8) aparecem ao lado do conjurador e agem em seu turno. Ao destruídos, cada Eco emite luz que cura 1d8 em aliados adjacentes.",
    castTime: "1 turno de concentração", cooldown: "1 uso por sessão",
    note: "🌟 Divina — os Ecos falam em élfico antigo antes de desaparecer. O Mestre pode usar isto para revelar fragmentos do lore élfico." },

  { name: "Luz Eterna de Aethea", level: 5, category: "cura/purificação", divine: "Aethea",
    effect: "O conjurador se transforma em pura luz por 1 rodada. Durante este estado: imune a todo dano, todos os aliados visíveis são curados em 3d10+SAB, todas as maldições de nível 3 ou menor são removidas de aliados em raio 8 hex, e todos os inimigos de origem corrupta (Araltos, undead, corrompidos) sofrem 4d10 de dano sagrado.",
    castTime: "2 turnos de concentração", cooldown: "1 uso por semana",
    note: "🌟 A magia mais sagrada de Aethea. Ao conjurar, o portador brilha com intensidade solar por 6 horas — não pode se esconder." },

  /* ── THURGOMUR — Deus dos Anões (Forja e Terra) ── */
  { name: "Punho de Thurgomur", level: 2, category: "ataque/controle", divine: "Thurgomur",
    effect: "Invoca um punho de pedra de 1 hex que emerge do chão sob um alvo visível a até 8 hex. Dano: 2d8 + o alvo é Derrubado automaticamente. O punho persiste por 2 rodadas como obstáculo (pode ser destruído com 15+ dano). Se o alvo já estiver Derrubado quando o punho emerge: dano é dobrado.",
    castTime: "1 Ação de Magia", cooldown: "3 usos por combate",
    note: "🌟 Portadores da Bigorna ou Couraça de Thurgomur podem usar gratuitamente após receber dano (1x/rodada)." },

  { name: "Fortaleza de Thurgomur", level: 3, category: "defesa/buff", divine: "Thurgomur",
    effect: "Cria uma barreira de pedra em linha de 4 hex (altura 2 hex) em qualquer orientação. A barreira tem 40 HP e Defesa Física 8. Aliados atrás da barreira têm cobertura total contra projéteis. Dura até ser destruída ou o combate acabar. Uma vez por combate: pode 'pulsar' a barreira — ela avança 2 hex empurrando inimigos que estejam em sua trajetória (2d6 dano + Empurrão).",
    castTime: "1 Ação de Magia", cooldown: "1 uso por combate",
    note: "🌟 Divina de Thurgomur — anões conjuram sem custo de slot (a terra sempre obedece filhos da pedra)." },

  /* ── THION — Deus dos Humanos (Ambição e Mudança) ── */
  { name: "Golpe da Mudança", level: 2, category: "ataque/buff", divine: "Thion",
    effect: "O próximo ataque do portador ignora TODA a Defesa do alvo (física e mágica). Se o ataque causar dano, o conjurador pode imediatamente trocar de posição com qualquer aliado visível (teleporte de troca). Thion acredita que cada golpe deve mudar alguma coisa.",
    castTime: "1 Ação de Magia", cooldown: "2 usos por combate",
    note: "🌟 Portadores da Moeda de Thion ou da Adaga do Conquistador aplicam esta magia sem custo de slot uma vez por combate." },

  { name: "Ambição de Thion", level: 4, category: "buff/transformação", divine: "Thion",
    effect: "O conjurador declara um objetivo ambicioso para este combate (ex: 'derrotar o chefe sozinho', 'proteger todos os aliados'). Por 5 rodadas, ganha bônus progressivo à medida que se aproxima do objetivo: +1d6 por rodada em que age em direção ao objetivo (acumula). Se completar o objetivo dentro das 5 rodadas: o bônus se torna permanente para este combate. Se falhar: perde 1d6 HP máximo temporariamente (retorna após descanso).",
    castTime: "1 Ação de Magia", cooldown: "1 uso por combate",
    note: "🌟 Thion só abençoa quem realmente tenta. Se o objetivo for muito fácil, o bônus é reduzido pela metade (o deus percebe quando está sendo enganado)." },

  /* ── RAS'KURU — Deus dos Orcs (Guerra e Resistência) ── */
  { name: "Rugido de Ras'kuru", level: 2, category: "controle/buff", divine: "Ras'kuru",
    effect: "O conjurador emite um rugido devastador. Todos os inimigos em raio 5 hex testam Força de Vontade (difícil) ou ficam Amedrontados por 3 rodadas. Aliados no mesmo raio ganham +1d6 de dano por 2 rodadas (o rugido inspira). Se o conjurador estiver abaixo de 50% HP: o raio dobra para 10 hex e a dificuldade sobe para Crítico.",
    castTime: "1 Ação de Magia", cooldown: "2 usos por combate",
    note: "🌟 Portadores do Dente de Ras'kuru ou da Capa de Sangue usam esta magia sem custo de Ação de Magia (sai como reação ao entrar em combate)." },

  { name: "Última Resistência de Ras'kuru", level: 3, category: "buff/sacrifício", divine: "Ras'kuru",
    effect: "Pode ser conjurada MESMO enquanto Inconsciente ou em estado de 0 HP. O conjurador retorna a 1 HP e por 3 rodadas torna-se imune a Inconsciente e Morte (qualquer dano que o reduziria a 0 HP é ignorado — o corpo rejeita a morte). No final das 3 rodadas: o conjurador cai Inconsciente automaticamente independente do HP atual. Ras'kuru exige que a batalha seja terminada ou alguém cuide do guerreiro.",
    castTime: "Reação (sem custo de Ação)", cooldown: "1 uso por sessão",
    note: "🌟 Só disponível para portadores de item de Ras'kuru ou orcs que sobreviveram a uma batalha com 1 HP de diferença." },

  /* ── TOBI — Deus dos Goblins (Travessura e Oportunidade) ── */
  { name: "Sorte do Goblin", level: 1, category: "utilidade/buff", divine: "Tobi",
    effect: "Tobi intervém. Uma vez neste turno, pode re-rolar qualquer dado (seu ou de um inimigo) e usar o resultado preferido. OU: faz qualquer objeto próximo 'cair no lugar certo' — uma chave cai de um bolso, uma faca desliza para a mão, uma porta estava destrancada. O Mestre decide o que é 'próximo' e 'lugar certo'.",
    castTime: "1 Ação de Magia (pode ser usada fora do turno como Reação)", cooldown: "3 usos por combate",
    note: "🌟 Portadores do Dado Viciado ou do Estilingue de Tobi têm 4 usos em vez de 3. Tobi aprecia usuários frequentes." },

  { name: "Travessura de Tobi", level: 2, category: "controle/utilidade", divine: "Tobi",
    effect: "Escolhe até 3 alvos visíveis. Cada alvo é afetado por uma travessura aleatória por 2 rodadas (1d6 por alvo): 1=Cego, 2=Surdo, 3=Escorregam (Derrubados), 4=Trocam de lugar entre si, 5=Atacam a si mesmos com dano mínimo, 6=Tobi aparece e assusta (Amedrontados). O conjurador não escolhe — Tobi decide.",
    castTime: "1 Ação de Magia", cooldown: "2 usos por combate",
    note: "🌟 Aviso de Tobi: pode afetar aliados se o Mestre rolar 1 natural para determinar os alvos. Tobi não garante precisão." },

  /* ── JURGMUND — Divindade dos Serpentarianos (A Cobra Colossal) ── */
  { name: "Veneno Sagrado de Jurgmund", level: 2, category: "ataque/debuff", divine: "Jurgmund",
    effect: "Aplica veneno sagrado em um alvo tocado ou a até 6 hex. O veneno é diferente do natural: não pode ser curado por antídotos mundanos — apenas magia sagrada o remove. Dano: 1d8 por rodada por 5 rodadas (se curado por magia, apenas interrompe; se curado por Clérigo de Jurgmund, remove completamente). Enquanto envenenado, o alvo não pode usar magias de cura.",
    castTime: "1 Ação de Magia", cooldown: "3 usos por combate",
    note: "🌟 Portadores de itens de Jurgmund adicionam +1d8 ao dano do veneno por rodada." },

  { name: "Forma da Cobra Sagrada", level: 4, category: "transformação/buff", divine: "Jurgmund",
    effect: "O conjurador assume parcialmente a forma de cobra por 5 rodadas: Movimento +4, Esquiva +4, pode se mover por espaços impossíveis (rachar paredes, água, altura), ataques corpo a corpo adicionam veneno automático (1d6/rodada, 3 rodadas) e o conjurador não pode ser Agarrado ou Paralisado (serpentes escapam de tudo). MAS enquanto na forma: não pode usar armas convencionais.",
    castTime: "1 turno de concentração", cooldown: "1 uso por combate",
    note: "🌟 Só conjurável por Serpentarianos ou por quem passou pela Câmara das Três Escamas." },

  { name: "Sussurro Profético de Jurgmund", level: 3, category: "utilidade/visão", divine: "Jurgmund",
    effect: "Jurgmund sussurra um fragmento do futuro próximo ao conjurador. O Mestre revela secretamente um evento que VAI acontecer nos próximos 10 minutos reais de jogo — sem revelar como evitá-lo. O conjurador então pode compartilhar ou não com o grupo. Uma vez por sessão: a visão pode ser de um evento mais distante (próxima sessão) — mas a visão fica mais fragmentada e difícil de interpretar.",
    castTime: "1 Ação de Magia (fora de combate preferível)", cooldown: "1 uso por sessão",
    note: "🌟 O Mestre usa esta magia para semear plot hooks ou avisar de perigos reais. Nunca deve ser uma armadilha — Jurgmund fala verdade." },

  /* ── VERMELHÃO — Deus dos Karlacs (O Fogo que Cresce) ── */
  { name: "Chama de Karloth", level: 2, category: "ataque/buff", divine: "Vermelhão",
    effect: "O conjurador envolve a si mesmo ou um aliado em chamas sagradas por 3 rodadas. Dano passivo: 1d6 a todo inimigo que atacar corpo a corpo o portador das chamas. Além disso, a cada rodada que a chama dura sem ser extinta, o dano sobe em +1d6 (acumula — rodada 1=1d6, rodada 2=2d6, rodada 3=3d6). Água e magia de frio tentam extinguir (1 turno de concentração do inimigo).",
    castTime: "1 Ação de Magia", cooldown: "2 usos por combate",
    note: "🌟 Portadores de itens de Vermelhão ativam esta magia gratuitamente ao receber dano de fogo pela primeira vez no combate." },

  { name: "Erupção do Vermelhão", level: 5, category: "ataque/área", divine: "Vermelhão",
    effect: "O conjurador canaliza o fogo interno de Vermelhão e libera em explosão: área 5x5 hex centralizada no conjurador. Dano: 3d10 + 1d6 por rodada que o conjurador passou neste combate (o fogo acumulado). O conjurador fica no centro mas é imune ao próprio fogo. Todos os objetos inflamáveis na área pegam fogo. O campo fica coberto de brasas por 2 rodadas (2d6 a quem cruzar).",
    castTime: "2 turnos de concentração", cooldown: "1 uso por combate",
    note: "🌟 Só conjurável por portadores da Chama-Viva de Karloth ou das Cinzas de Karloth Sagrado. O dano base é 3d10 mesmo sem rodadas acumuladas." },



  /* ══════════════════════════════════════════════════════════
     MAGIAS DAS SUBCLASSES
     ══════════════════════════════════════════════════════════ */

  /* ─── 💀 NECROMANTE ──────────────────────────────────────── */

  { name: "Exército dos Mortos", level: 4, category: "invocacao/necromancia", subclass: "necromante",
    effect: "Invoca 1d4+2 Esqueletos Guerreiros (HP 18, dano 1d8) ou Zumbis Comuns (HP 28, dano 1d6) de cadáveres presentes na área ou do chão em raio 6 hex. Os mortos-vivos agem no turno do conjurador. Duram até o fim do combate. Máximo de 6 mortos-vivos simultâneos com esta magia.",
    castTime: "2 turnos de concentração", cooldown: "1 uso por combate",
    note: "Subclasse Necromante: mortos-vivos invocados têm +25% HP e +1d4 de dano se o conjurador for Mago ou Clérigo." },

  { name: "Toque Necrótico", level: 2, category: "ataque/necromancia", subclass: "necromante",
    effect: "Toca um alvo (ou projeta a energia a até 3 hex): 2d8+INT de dano necrótico que não pode ser reduzido por Defesa Física. O alvo fica Enfraquecido por 2 rodadas (−1d4 em todos os ataques). Se o alvo morrer nos próximos 2 turnos, pode ser levantado como Zumbi Menor gratuitamente (sem custo de Slot).",
    castTime: "1 Ação de Magia", cooldown: "3 usos por combate",
    note: "Funciona como tentativa de pré-marcar alvos para o Levantar das Cinzas sem gastar recursos extras." },

  { name: "Pacto Sombrio", level: 3, category: "ritual/necromancia", subclass: "necromante",
    effect: "Fora de combate: realiza um pacto com um espírito de morto recente (até 24h). O espírito responde até 5 perguntas com informações que sabia em vida (Mestre determina o que sabe). Em combate: pode invocar o espírito por 3 rodadas como aliado etéreo (HP 30, dano 1d6 psíquico, intangível a físico).",
    castTime: "10 minutos (fora de combate) ou 2 Ações (combate)", cooldown: "1 uso por sessão",
    note: "O espírito não é obrigado a cooperar. Necromantes com Aura dos Sepulcros ativa ganham acesso automático ao espírito sem teste de persuasão." },

  { name: "Dreno de Alma", level: 5, category: "ataque/necromancia", subclass: "necromante",
    effect: "Projeta um feixe de energia necrótica a até 10 hex: 4d10+INT de dano sombrio. Se o alvo morrer com este golpe, sua alma é capturada em um cristal — o conjurador recupera todos os Slots de Magia e ganha +2d6 em todos os ataques por 3 rodadas. O cristal contém a alma até ser destruído ou libertado.",
    castTime: "1 Ação de Magia", cooldown: "1 uso por combate",
    note: "Capturar almas é considerado crime em Sanctum e heresia pelos Clérigos de Jurgmund. O cristal é detectável por qualquer Clérigo." },

  /* ─── 🎭 BARDO ───────────────────────────────────────────── */

  { name: "Balada do Caos", level: 3, category: "controle/buff", subclass: "bardo",
    effect: "Entoa uma melodia caótica por 3 rodadas (concentração): a cada rodada, rola 1d6 por aliado e inimigo em raio 6 hex — resultado determina efeito: 1=Confuso (age aleatoriamente), 2=Acelerado (+1 Ação), 3=Lento (−1 Ação), 4=Inspirado (+1d6 em ataques), 5=Amedrontado (recua), 6=Nada. O conjurador controla seus próprios aliados mas não os inimigos.",
    castTime: "1 Ação de Magia (mantém por rodada)", cooldown: "1 uso por combate",
    note: "Bardo com Performance de Batalha ativa: aliados afetados por 2 ou 4 têm o bônus dobrado." },

  { name: "Conto do Herói", level: 2, category: "buff", subclass: "bardo",
    effect: "Narra em voz alta as façanhas de um aliado visível — real ou inventada. Por 4 rodadas, o aliado acredita genuinamente que é um herói: +1d8 em todos os testes e ataques, imune a Medo, e ao matar um inimigo recupera 1d6 HP (o herói que o conto descreve não morre facilmente).",
    castTime: "1 Ação de Magia", cooldown: "2 usos por combate",
    note: "Pode ser usado no turno do aliado como Reação. Se o aliado falhar criticamente enquanto sob efeito: a 'decepção' do conto causa 1d4 de dano psíquico (narrativa tem consequências)." },

  { name: "Eco Ilusório", level: 1, category: "ilusão/utilidade", subclass: "bardo",
    effect: "Cria sons e imagens ilusórias perfeitas em raio 5 hex — passos, vozes, objetos visuais, multidões. Os ilusórios não causam dano mas são completamente convincentes. Inimigos que interagem testam INT (normal). Dura 5 minutos ou até o conjurador parar de se concentrar.",
    castTime: "1 Ação de Magia", cooldown: "Ilimitado (concentração)",
    note: "Combinado com Ilusão Magistral: as duas ilusões se complementam e a dificuldade de detectar sobe para INT (difícil)." },

  { name: "Sinfonia da Destruição", level: 5, category: "ataque/buff", subclass: "bardo",
    effect: "Canaliza toda a arte em destruição: por 4 rodadas, cada palavra ou som que o bardo emite causa 2d6 de dano sônico a todos em raio 4 hex (aliados imunes). Aliados no raio ganham +1d10 em ataques (inspirados pela intensidade). O bardo não pode usar outras magias durante a Sinfonia mas pode atacar normalmente.",
    castTime: "1 Ação de Magia", cooldown: "1 uso por combate",
    note: "Criaturas sem audição são imunes ao dano. Estruturas de vidro ou cristal na área são destruídas automaticamente." },

  /* ─── ⚔ PALADINO ─────────────────────────────────────────── */

  { name: "Juramento Sagrado", level: 2, category: "buff/ritual", subclass: "paladino",
    effect: "Declara um juramento em voz alta (ex: 'proteger este aliado', 'derrotar este inimigo'). Enquanto age em direção ao juramento: +1d8 em todos os ataques e +2 Defesa Física. Se quebrar o juramento voluntariamente: perde todos os bônus e perde 1d10 HP. Se cumprir: recupera todos os Slots de Magia.",
    castTime: "1 Ação de Magia", cooldown: "1 uso por combate",
    note: "O Mestre avalia se as ações são coerentes com o juramento. Um paladino não pode declarar o mesmo juramento duas vezes no mesmo combate." },

  { name: "Luz do Julgamento", level: 3, category: "ataque/defesa", subclass: "paladino",
    effect: "Projeta um raio de luz sagrada a até 8 hex: 3d8+SAB de dano sagrado. Criaturas corrompidas, mortas-vivas ou de origem demônica sofrem +2d8 adicional e ficam Cegas por 2 rodadas (sem resistência). Aliados no caminho do raio (linha) recuperam 1d6 HP ao serem tocados pela luz.",
    castTime: "1 Ação de Magia", cooldown: "2 usos por combate",
    note: "Com Punição Divina ativa: o dano base sobe para 4d8+SAB e o Cegamento dura 3 rodadas." },

  { name: "Imposição das Mãos", level: 1, category: "cura", subclass: "paladino",
    effect: "Toca um aliado: cura 2d6+SAB HP e remove 1 condição negativa (veneno, sangramento, medo, paralisia). Pode ser usada em si mesmo. 4 usos por combate — o poder vem da fé, não de Slots de Magia (não consome Slot).",
    castTime: "1 Ação de Magia ou Reação", cooldown: "4 usos por combate (não consome Slot)",
    note: "Com Fervor Sagrado nível 2+: pode usar Imposição das Mãos sem gastar Ação (como parte de qualquer outra ação) 1x por combate." },

  { name: "Martelo Divino", level: 4, category: "ataque", subclass: "paladino",
    effect: "Invoca um martelo de luz pura e o arremessa a até 10 hex: 4d8+SAB de dano sagrado em área 2x2 hex. Criaturas na área são Empurradas 2 hex e Derrubadas (sem teste). O martelo persiste por 2 rodadas — pode ser relançado como Ação Livre, mas dano cai para 2d8.",
    castTime: "1 Ação de Magia", cooldown: "1 uso por combate",
    note: "Com Aura de Proteção ativa: aliados na área de impacto recebem +2 Defesa Física por 2 rodadas (a luz os protege)." },

  /* ─── ⚗ ALQUIMISTA ───────────────────────────────────────── */

  { name: "Elixir de Batalha", level: 2, category: "buff", subclass: "alquimista",
    effect: "Cria e aplica instantaneamente um elixir em si mesmo ou em aliado adjacente: escolha 1 efeito — (a) +2d6 em todos os ataques por 3 rodadas, (b) recupera 3d8 HP imediatamente, (c) +2 Ações de Combate por 2 rodadas (com fadiga posterior: −1 Ação por 1 rodada). O elixir tem efeito imediato.",
    castTime: "1 Ação de Magia", cooldown: "3 usos por combate",
    note: "Alquimista com Criação de Poções nível 2+: pode criar elixires com 2 efeitos simultâneos (escolhe dois da lista)." },

  { name: "Névoa Ácida", level: 2, category: "controle/ataque", subclass: "alquimista",
    effect: "Lança um frasco de ácido que cria nuvem corrosiva em área 3x3 hex por 3 rodadas. Qualquer criatura que entrar ou permanecer na nuvem sofre 1d6 de ácido por rodada + −1 em toda Defesa Física (o ácido corrói equipamentos). Visibilidade na nuvem: 1 hex.",
    castTime: "1 Ação de Magia", cooldown: "2 usos por combate",
    note: "Com Bomba Alquímica: a Névoa Ácida pode ser combinada com uma Bomba de Fogo para criar uma explosão de fogo ácido (+1d8 de dano imediato a todos na área)." },

  { name: "Catalisador de Magia", level: 3, category: "buff/arcano", subclass: "alquimista",
    effect: "Cria e bebe (ou aplica em aliado) um catalisador arcano: a próxima magia conjurada pelo alvo tem seu dano ou cura dobrados, e não consome Slot de Magia. Efeito dura até a próxima magia ser usada ou 3 rodadas (o que vier primeiro).",
    castTime: "1 Ação de Magia", cooldown: "2 usos por combate",
    note: "Com Pergaminhos: um pergaminho usado sob efeito do Catalisador tem poder de nível +1 (magia de nível 2 equivale a nível 3)." },

  { name: "Grande Explosão Alquímica", level: 5, category: "ataque/área", subclass: "alquimista",
    effect: "Arremessa um grande frasco instável a até 10 hex: explode em área 5x5 hex causando 5d8 de dano (fogo + ácido + impacto simultâneos). Todos na área testam AGI (difícil) ou ficam Derrubados e Cegos por 1 rodada. O terreno na área fica coberto de resíduos ácidos por 2 rodadas (1d4 de dano ao cruzar).",
    castTime: "1 Ação de Magia", cooldown: "1 uso por combate",
    note: "Alquimista com Bomba Alquímica nível 3: pode lançar esta magia sem custo de Slot (o talento substitui o conhecimento arcano)." },

  /* ─── 🌿 DRUIDA ───────────────────────────────────────────── */

  { name: "Chamado da Tempestade", level: 4, category: "ataque/controle", subclass: "druida",
    effect: "Invoca uma tempestade local sobre a área de combate por 4 rodadas. A cada rodada: 1d4 raios caem em hexes aleatórios (Mestre rola posição), cada um causando 2d8 de dano elétrico. Terreno fica encharcado (−2 Movimento para todos). Criaturas de metal (armaduras pesadas) sofrem +1d6 por raio.",
    castTime: "2 Ações de Magia", cooldown: "1 uso por combate",
    note: "Druida com Moldar Terreno: pode direcionar 1 raio por rodada para um hex específico em vez de aleatório." },

  { name: "Enredar", level: 1, category: "controle", subclass: "druida",
    effect: "Raízes e trepadeiras emergem em área 3x3 hex em terreno natural. Todos no área testam AGI (normal) ou ficam Presos (imóveis) por 3 rodadas. Liberar: FOR (normal) por Ação. O terreno torna-se difícil mesmo após as raízes sumam. Animais e criaturas de natureza testam com dificuldade +1 grau para resistir.",
    castTime: "1 Ação de Magia", cooldown: "3 usos por combate",
    note: "Druida com Forma Selvagem: na forma animal, pode usar Enredar como Ação Livre (os instintos canalizam naturalmente)." },

  { name: "Pele de Pedra", level: 2, category: "defesa/buff", subclass: "druida",
    effect: "Endurece a pele de um aliado tocado com a resistência da rocha. Por 4 rodadas: +3 Defesa Física, resistência a dano cortante e perfurante (−2 por dado), e imunidade a Empurrão e Derrubada. A aparência muda levemente — pele acinzentada, textura pedregosa.",
    castTime: "1 Ação de Magia", cooldown: "2 usos por combate",
    note: "Com Cura da Natureza: ao aplicar Pele de Pedra e Cura da Natureza no mesmo aliado, o alvo também fica imune a veneno por 2 rodadas." },

  { name: "Fúria da Natureza", level: 5, category: "ataque/invocacao", subclass: "druida",
    effect: "A natureza responde à vontade do druida: em raio 8 hex, surgem simultaneamente — 2 Treants Jovens (HP 60, dano 1d10), o terreno torna-se completamente hostil a inimigos (terreno difícil + Enredar automático), e 1d4 raios de tempestade caem em inimigos (2d8 cada). Dura 3 rodadas.",
    castTime: "2 Ações de Magia", cooldown: "1 uso por sessão",
    note: "Só pode ser conjurada em terreno natural (floresta, campo, montanha, rio). Em dungeon ou cidade: não funciona." },

  /* ─── 🔥 BERSERKER ───────────────────────────────────────── */

  { name: "Grito de Guerra", level: 1, category: "buff/controle", subclass: "berserker",
    effect: "Solta um grito ensurdecedor. Todos os aliados em raio 5 hex ganham +1d6 em ataques por 2 rodadas (o grito inspira). Todos os inimigos em raio 5 hex testam SAB (normal) ou ficam Amedrontados por 1 rodada. Pode ser usada no começo do combate antes de agir (iniciativa livre).",
    castTime: "1 Ação Livre (no início do turno)", cooldown: "2 usos por combate",
    note: "Berserker em Fúria de Batalha: o Grito de Guerra tem raio dobrado (10 hex) e aliados recebem +1d8 em vez de +1d6." },

  { name: "Sangue por Poder", level: 2, category: "buff/sacrifício", subclass: "berserker",
    effect: "Sacrifica HP próprio para converter em poder bruto: gasta até 15 HP (não pode ir abaixo de 1 HP) — a cada 5 HP gastos, ganha +1d8 de dano nos próximos ataques por 3 rodadas. Máximo de 3d8 extra (15 HP gastos). O HP sacrificado não retorna com cura normal — apenas com descanso longo.",
    castTime: "1 Ação Livre", cooldown: "2 usos por combate",
    note: "Em Limiar da Morte (abaixo de 30% HP): o custo em HP é reduzido à metade (5 HP = +1d8, máximo 7 HP = 3d8)." },

  { name: "Impacto Devastador", level: 3, category: "ataque", subclass: "berserker",
    effect: "Concentra toda a raiva em um único golpe: o próximo ataque físico causa dano triplicado (todos os dados × 3) e o alvo é Empurrado 4 hex e Derrubado automaticamente. Se o alvo bater em uma parede ou outro inimigo: +1d10 de dano adicional. Após o golpe: o berserker fica com −1 Ação no próximo turno (exaustão do esforço).",
    castTime: "1 Ação Livre (ativa o próximo ataque)", cooldown: "1 uso por combate",
    note: "Combinado com Fúria de Batalha ativa: o dano triplicado inclui o +1d8 da Fúria no cálculo base." },

  { name: "Não Vou Cair", level: 4, category: "buff/sobrevivência", subclass: "berserker",
    effect: "Ativa uma determinação absoluta por 5 rodadas: o berserker torna-se completamente imune a ser reduzido a 0 HP (qualquer golpe que deveria matar reduz a 1 HP). Ganha +2d6 de dano em todos os ataques. No fim das 5 rodadas ou quando a magia encerra voluntariamente: cai Inconsciente automaticamente independente do HP atual.",
    castTime: "1 Ação Livre (qualquer turno, inclusive fora do turno)", cooldown: "1 uso por sessão",
    note: "Esta é a última linha do berserker. Não pode ser cancelada uma vez ativada — as 5 rodadas são completas ou a morte é aceita antecipadamente." }

,

  /* ══════════════════════════════════════════════════════════
     NOVAS MAGIAS — Invocação, Cura e Ataque
     ══════════════════════════════════════════════════════════ */

  /* ─── Invocação — Animais ──────────────────────────────── */

  { name: "Invocar Corvo Espião", level: 1, category: "invocacao",
    effect: "Invoca um corvo mágico aliado (HP 8, foge se atacado diretamente). Em combate: distrai 1 alvo por rodada — alvo tem −1d4 nos ataques tentando espantar o corvo. Fora de combate: voa em raio 200m e o conjurador vê e ouve através dele (concentração).",
    castTime: "1 Ação de Magia", cooldown: "Ilimitado (concentração)" },

  { name: "Invocar Urso Cinzento", level: 2, category: "invocacao",
    effect: "Invoca urso cinzento aliado (HP 55, dano 1d10+1d6, Def 4, 2 Ações/turno). 40% de chance de agarrar ao acertar — alvo testa FOR difícil para escapar. Permanece 4 rodadas.",
    castTime: "1 Ação de Magia", cooldown: "2 usos por combate" },

  { name: "Invocar Matilha de Lobos", level: 2, category: "invocacao",
    effect: "Invoca 1d4+1 lobos aliados (HP 22, dano 1d8, Mov 6, 1 Ação cada). Tática de matilha: 2+ lobos no mesmo alvo — o alvo testa AGI normal ou cai Derrubado. Permanecem 3 rodadas.",
    castTime: "1 Ação de Magia", cooldown: "1 uso por combate" },

  { name: "Invocar Águia Trovejante", level: 2, category: "invocacao",
    effect: "Invoca águia eletrizada (HP 35, dano 1d8+1d4 elétrico, altitude 4, Def 3). Cada acerto: alvo testa AGI normal ou fica Atordoado 1 rodada. Permanece 3 rodadas.",
    castTime: "1 Ação de Magia", cooldown: "2 usos por combate" },

  { name: "Invocar Pantera das Sombras", level: 3, category: "invocacao",
    effect: "Invoca pantera das sombras (HP 50, dano 1d10+1d8, Esquiva 18). Em área escura: invisível até atacar. O primeiro ataque por turno em que estava invisível é Crítico automático. Permanece 4 rodadas.",
    castTime: "1 Ação de Magia", cooldown: "1 uso por combate" },

  { name: "Invocar Crocodilo Colossal", level: 3, category: "invocacao",
    effect: "Invoca crocodilo colossal (HP 85, dano 2d8+1d6, Def 7, ocupa 2 hexes). Mandíbula de Ferro: ao acertar, alvo fica Agarrado e sofre 1d8 automático por rodada. Liberar: FOR crítico. Permanece 4 rodadas.",
    castTime: "1 Ação de Magia", cooldown: "1 uso por combate" },

  { name: "Invocar Touro Infernal", level: 4, category: "invocacao",
    effect: "Invoca touro em chamas (HP 100, dano 2d10+1d8, Def 6). Carga Imparável: mover 3+ hexes e atacar causa dano dobrado + Derrubado automático. Aura de fogo: 1d6 por rodada a criaturas a 1 hex. Permanece 4 rodadas.",
    castTime: "2 Ações de Magia", cooldown: "1 uso por combate" },

  { name: "Alcateia Primordial", level: 5, category: "invocacao",
    effect: "Invoca simultaneamente: 1 Urso (HP 80, dano 2d8), 2 Lobos (HP 35, dano 1d10 cada) e 1 Águia (HP 45, dano 1d8 elétrico, altitude 4). Todos agem no turno do conjurador. Druida com set Raiz e Ramo: +50% HP e +1d6 dano em todos. Permanecem até o fim do combate.",
    castTime: "2 Ações de Magia", cooldown: "1 uso por sessão" },

  /* ─── Invocação — Mortos-Vivos ─────────────────────────── */

  { name: "Invocar Esqueleto Arqueiro", level: 1, category: "invocacao",
    effect: "Invoca Esqueleto Arqueiro aliado (HP 16, dano 1d8 à distância alcance 8 hex, Def 2, 2 Ações de ataque por turno). Imune a veneno e dano psíquico. Permanece até ser destruído ou fim do combate.",
    castTime: "1 Ação de Magia", cooldown: "3 usos por combate" },

  { name: "Invocar Espectro Faminto", level: 2, category: "invocacao",
    effect: "Invoca espectro etéreo (HP 30, dano 1d8 psíquico que ignora Def Física, Esquiva 17). Imune a dano físico mundano. Drena 1d4 SAB ao acertar — se SAB do alvo chegar a 0, fica Inconsciente por 2 rodadas. Permanece 3 rodadas.",
    castTime: "1 Ação de Magia", cooldown: "2 usos por combate" },

  { name: "Invocar Cavaleiro Esquelético", level: 3, category: "invocacao",
    effect: "Invoca Cavaleiro Esquelético montado em cavalo-esqueleto (HP 70, dano 1d10+1d8, Def 6, Mov 8, 3 Ações). Carga Mortal: mover 4+ hexes e atacar = dano dobrado + Derrubado automático. Permanece 4 rodadas.",
    castTime: "1 Ação de Magia", cooldown: "1 uso por combate" },

  { name: "Invocar Banshee", level: 4, category: "invocacao",
    effect: "Invoca Banshee aliada (HP 55, dano 1d10 psíquico, Esquiva 19, intangível). Lamento da Banshee (1 Ação de Magia): todos em raio 4 hex testam SAB difícil ou ficam Aterrorizados por 2 rodadas. Imune a dano físico. Permanece 3 rodadas.",
    castTime: "1 Ação de Magia", cooldown: "1 uso por combate" },

  { name: "Levantar Campeão", level: 4, category: "invocacao",
    effect: "Levanta cadáver de guerreiro ou criatura mortos há menos de 1 hora como Campeão Morto-Vivo com 70% das estatísticas originais e habilidades físicas, 3 Ações por turno. Máximo 1 Campeão ativo por vez. Permanece até ser destruído ou fim do combate.",
    castTime: "1 turno de concentração", cooldown: "1 uso por sessão",
    note: "Necromante com Aura dos Sepulcros: 90% das estatísticas e mantém habilidades mágicas simples (nível 1-2)." },

  { name: "Horda dos Mortos", level: 5, category: "invocacao",
    effect: "Levanta todos os cadáveres em raio 8 hex simultaneamente (até 8 mortos-vivos). Cada um tem HP 40% e dano 60% do original, 1 Ação cada. Ao ser destruído: energia vai para os outros (+2 HP cada). Permanecem até o fim do combate.",
    castTime: "2 Ações de Magia", cooldown: "1 uso por sessão" },

  /* ─── Cura ─────────────────────────────────────────────── */

  { name: "Toque Restaurador", level: 1, category: "cura",
    effect: "Toca um aliado: cura 2d6+SAB HP e remove Sangramento. Pode ser usada em si mesmo.",
    castTime: "1 Ação de Magia", cooldown: "Ilimitado" },

  { name: "Escudo Vital", level: 2, category: "cura",
    effect: "Escudo de energia em torno de aliado por 3 rodadas: absorve até 15 de dano antes de quebrar. Quando quebra ou termina: aliado recupera HP igual à metade do dano total absorvido.",
    castTime: "1 Ação de Magia", cooldown: "3 usos por combate" },

  { name: "Pulso de Cura", level: 2, category: "cura",
    effect: "Onda curativa em raio 3 hex: cura 1d8+SAB HP em todos os aliados na área. Estabiliza aliados Inconscientes na área (retornam com 1 HP).",
    castTime: "1 Ação de Magia", cooldown: "2 usos por combate" },

  { name: "Regeneração Acelerada", level: 2, category: "cura",
    effect: "Aliado tocado recupera 1d6+SAB HP no início de cada turno por 4 rodadas. Remove Sangramento e Veneno comum ao ser aplicada. Nova aplicação reinicia o contador.",
    castTime: "1 Ação de Magia", cooldown: "2 usos por combate" },

  { name: "Bênção do Combate", level: 2, category: "buff",
    effect: "Aliado abençoado por 3 rodadas: recupera 1d4 HP ao acertar qualquer ataque. Ganha +1d4 em testes de resistência. Pode ser lançada no turno do aliado como Reação.",
    castTime: "1 Ação de Magia", cooldown: "2 usos por combate" },

  { name: "Cura Maior", level: 3, category: "cura",
    effect: "Restaura 4d8+SAB HP num aliado tocado ou a até 5 hex. Remove 2 condições negativas à escolha (veneno, paralisia, medo, cegueira, sangramento). Se o alvo estiver abaixo de 25% HP: cura adicional de 1d8.",
    castTime: "1 Ação de Magia", cooldown: "2 usos por combate" },

  { name: "Cura em Área", level: 3, category: "cura",
    effect: "Cura 2d8+SAB HP em todos os aliados visíveis em raio 5 hex simultaneamente. Remove Sangramento de todos. Aliados Inconscientes na área são estabilizados e retornam com 1 HP.",
    castTime: "1 Ação de Magia", cooldown: "1 uso por combate" },

  { name: "Ressurreição de Emergência", level: 4, category: "cura",
    effect: "Aliado Inconsciente ou morto há menos de 2 rodadas retorna com 2d10+SAB HP e fica imune a Inconsciente por 2 rodadas. Se ainda vivo com 0 HP: cura dobrada (4d10+SAB).",
    castTime: "1 Ação de Magia", cooldown: "1 uso por combate" },

  { name: "Cura Suprema", level: 5, category: "cura",
    effect: "Restaura completamente o HP máximo de um aliado tocado. Remove todas as condições negativas, venenos e maldições de nível 3 ou menor. Se estava Inconsciente: retorna com HP completo e ganha +1d10 em todos os testes por 3 rodadas.",
    castTime: "1 Ação de Magia", cooldown: "1 uso por combate" },

  /* ─── Ataque ────────────────────────────────────────────── */

  { name: "Dardo de Ácido", level: 1, category: "ataque",
    effect: "Projeta dardo de ácido a até 8 hex: 1d8+INT imediato + 1d4 de ácido por rodada por 2 rodadas. Cada acerto de ácido: −1 Def Física do alvo (acumula até −3).",
    castTime: "1 Ação de Magia", cooldown: "Ilimitado" },

  { name: "Fragmentos de Pedra", level: 1, category: "ataque",
    effect: "Saraivada de pedra em cone 3 hex: 1d6+INT em todos na área. Alvos com armadura leve ou nenhuma: +1d4 extra. AGI normal para metade.",
    castTime: "1 Ação de Magia", cooldown: "Ilimitado" },

  { name: "Flecha de Sombras", level: 2, category: "ataque",
    effect: "Flecha de energia sombria a até 10 hex: 2d6+INT que ignora completamente Def Física. Em área de sombra ou escuridão: +1d6 adicional.",
    castTime: "1 Ação de Magia", cooldown: "3 usos por combate" },

  { name: "Mão Fantasma Agressiva", level: 2, category: "ataque",
    effect: "Mão fantasmagórica agarra alvo a até 8 hex: 1d8+INT imediato. Alvo fica Agarrado por 2 rodadas (FOR difícil para escapar), sofre 1d6 de pressão por rodada e tem −1 Ação. A mão some se receber 10+ de dano.",
    castTime: "1 Ação de Magia", cooldown: "2 usos por combate" },

  { name: "Explosão Sônica", level: 2, category: "ataque",
    effect: "Onda de som destruidora em cone 4 hex: 2d6+INT de dano sônico. Alvos testam FOR normal ou ficam Atordoados 1 rodada. Criaturas sem audição são imunes. Objetos de vidro e cristal na área são destruídos automaticamente.",
    castTime: "1 Ação de Magia", cooldown: "2 usos por combate" },

  { name: "Tempestade de Gelos", level: 3, category: "ataque",
    effect: "Gelo cai em área 3x3 hex a até 10 hex: 2d8+INT de frio. Terreno coberto de gelo por 3 rodadas (AGI normal para não cair ao se mover). Alvos atingidos testam FOR normal ou ficam Lentos (−2 Movimento) por 2 rodadas.",
    castTime: "1 Ação de Magia", cooldown: "2 usos por combate" },

  { name: "Corrente de Raios", level: 3, category: "ataque",
    effect: "Raio salta de alvo em alvo: até 4 alvos em cadeia (cada um a no máximo 4 hex do anterior). Dano decrescente: 2d8+INT no primeiro, −1d4 por salto (2d8→2d4→1d8→1d4). Armadura metálica: dano máximo sem rolar dados.",
    castTime: "1 Ação de Magia", cooldown: "2 usos por combate" },

  { name: "Coluna de Fogo", level: 3, category: "ataque",
    effect: "Coluna de fogo em 1 hex a até 12 hex: 3d8+INT de dano. Alvos testam AGI normal ou ficam Queimando (1d6/rodada, 3 rodadas). A coluna persiste 2 rodadas — qualquer criatura que entrar sofre 2d6.",
    castTime: "1 Ação de Magia", cooldown: "2 usos por combate" },

  { name: "Chuva de Meteoros Menor", level: 4, category: "ataque",
    effect: "4 fragmentos incandescentes caem em hexes à escolha dentro de raio 10 hex. Cada fragmento: 2d8+INT de fogo+impacto. Alvo atingido por 2+ fragmentos fica Derrubado automaticamente.",
    castTime: "1 Ação de Magia", cooldown: "1 uso por combate" },

  { name: "Vórtice Arcano", level: 4, category: "ataque",
    effect: "Vórtice de energia arcana em área 3x3 hex por 3 rodadas. A cada rodada: 2d6+INT de dano + puxa todos 2 hex para o centro (FOR normal para resistir). Aliados podem ser excluídos do dano mas não do puxão.",
    castTime: "1 Ação de Magia", cooldown: "1 uso por combate" },

  { name: "Meteoro", level: 5, category: "ataque",
    effect: "Meteoro de rocha ardente cai em ponto visível a até 20 hex: 6d10+INT de fogo+impacto em área 4x4 hex. AGI crítico ou Derrubado e Queimando (2d6/rodada, 3 rodadas). Terreno coberto de fragmentos por 2 rodadas (1d8 ao cruzar). Visível em raio 500m.",
    castTime: "2 turnos de concentração", cooldown: "1 uso por sessão" },

  { name: "Feixe Desintegrador", level: 5, category: "ataque",
    effect: "Feixe de energia pura a até 15 hex: 5d10+INT de dano arcano. Se o alvo chegar a 0 HP: é desintegrado completamente (sem cadáver, impossível ressuscitar por meios comuns). SAB crítico para sobreviver com 1 HP em vez de desintegrar.",
    castTime: "1 Ação de Magia", cooldown: "1 uso por combate" }
,

  /* ═══════════════════════════════════════════════════════════════
     MAGIAS DE BUFF — MECÂNICAS DE CRÍTICO
     Cada magia cria uma condição que interage com o dado de crítico
     de forma única. Algumas aumentam a chance, outras mudam o que
     acontece quando o crítico ocorre — ricochete, garantia com custo,
     explosão em área, maldição reversa, e mais.
     ═══════════════════════════════════════════════════════════════ */

  /* ── NÍVEL 1 — Introdução ao crítico ampliado ─────────────────── */

  { name: "Olho Afiado",
    level: 1, category: "buff/crítico",
    effect: "Alvo (toque): +2 na Chance de Crítico (d10) por 3 rodadas. Simples e confiável — a primeira magia que um Mago aprende sobre precisão fatal.",
    castTime: "1 Ação de Magia",
    cooldown: "4 usos por batalha",
    critInteraction: "Bônus direto: +2 na Chance de Crítico do alvo.",
    note: "Buff de crítico base. Empilha com SAB e itens. Ideal para combinação com Ponto Vital do Ladino." },

  { name: "Lâmina Sedenta",
    level: 1, category: "buff/crítico",
    effect: "Arma do alvo (toque) fica 'sedenta' por 3 rodadas: o primeiro crítico acertado durante o buff cura o portador em 1d8+INT HP (o golpe perfeito alimenta a arma e ela devolve vitalidade). Após a cura, o buff é consumido.",
    castTime: "1 Ação de Magia",
    cooldown: "3 usos por batalha",
    critInteraction: "Ao acertar crítico: cura portador 1d8+INT HP. O buff é consumido após o primeiro crítico.",
    note: "Buff de sustento. Excelente para Guerreiros e Ladinos que precisam de recuperação em combate agressivo." },

  /* ── NÍVEL 2 — Efeitos de ricochete e propagação ─────────────── */

  { name: "Ressonância Crítica",
    level: 2, category: "buff/crítico",
    effect: "Alvo (toque, 4 rodadas): ao acertar um crítico, a energia do impacto ressoa e salta automaticamente para o inimigo mais próximo em até 2 hex do alvo original — causando 50% do dano crítico no segundo alvo (sem nova rolagem de acerto). Se não houver inimigo em 2 hex: a ressonância salta até 4 hex mas com 25% do dano.",
    castTime: "1 Ação de Magia",
    cooldown: "3 usos por batalha",
    critInteraction: "Crítico → dano salta automaticamente para inimigo mais próximo (2 hex: 50% do dano; 4 hex: 25%). Sem rolagem.",
    note: "Buff de propagação. Mais eficaz em combate denso. Não precisa de segundo ataque — o efeito é automático." },

  { name: "Eco de Sangue",
    level: 2, category: "buff/crítico",
    effect: "Alvo (toque, 3 rodadas): ao acertar um crítico, o eco do golpe se propaga em onda — todos os inimigos em raio 2 hex do alvo acertado sofrem 1d6+INT de dano de eco (não é físico nem mágico — é vibração pura, ignora ambas as defesas). O Eco não acerta aliados.",
    castTime: "1 Ação de Magia",
    cooldown: "2 usos por batalha",
    critInteraction: "Crítico → onda automática: todos inimigos em raio 2 hex sofrem 1d6+INT de dano de eco (ignora defesas).",
    note: "Versão de área do ricochete. Ideal para combate em cluster. O dano de eco é fixo — não aumenta com mais críticos no turno." },

  { name: "Golpe Fantasma",
    level: 2, category: "buff/crítico",
    effect: "Alvo (toque, 4 rodadas): ao acertar um crítico, um duplicado espectral do golpe aparece e repete o ataque uma vez no mesmo alvo — causando 1d8 de dano espectral (ignora Def.Física, usa Def.Mágica). O duplicado é automático, não gasta Ação e não pode ser crítico.",
    castTime: "1 Ação de Magia",
    cooldown: "3 usos por batalha",
    critInteraction: "Crítico → ataque fantasma automático: 1d8 espectral no mesmo alvo (ignora Def.Física, usa Def.Mágica). Sem nova rolagem.",
    note: "Crítico gera ataque extra fantasma. Sinergia com Arqueiro (Tiro da Fissura já ignora Def.Física — o fantasma adiciona dano mágico)." },

  /* ── NÍVEL 3 — Custo e garantia ──────────────────────────────── */

  { name: "Olho do Predador",
    level: 3, category: "buff/crítico",
    effect: "Alvo (toque): o próximo ataque do alvo é Crítico Garantido — o dado de crítico não precisa ser rolado (considerado automaticamente como 1). MAS: após o golpe crítico garantido, o alvo perde o próximo turno inteiro (o corpo entra em choque após liberar toda a energia de uma vez). O alvo pode recusar a magia antes de ser aplicada.",
    castTime: "1 Ação de Magia",
    cooldown: "2 usos por combate",
    critInteraction: "Próximo ataque = Crítico Automático. Custo: perde o próximo turno completamente (0 Ações).",
    note: "Alto risco, alto retorno. Com Ponto Vital + Olho do Predador: crítico garantido com 200% de dano extra + atordoa o alvo. O turno perdido é o preço." },

  { name: "Pacto do Último Golpe",
    level: 3, category: "buff/sacrifício/crítico",
    effect: "Alvo (toque, até fim do combate): o portador acumula cada dano recebido numa reserva de 'dívida de sangue'. Ao acertar um crítico: a reserva inteira é adicionada ao dano crítico como bônus fixo (dano recebido se transforma em dano causado). A reserva reseta após ser descarregada. Máximo de reserva: 40 HP.",
    castTime: "1 Ação de Magia",
    cooldown: "1 uso por combate",
    critInteraction: "Crítico → dano acumulado da reserva de 'dívida de sangue' é adicionado ao dano crítico. Máx 40 HP de bônus.",
    note: "Quanto mais o portador apanhar antes do crítico, mais letal o golpe. Combo devastador: deixar o aliado tomar dano conscientemente para acumular a reserva, então garantir o crítico com Olho do Predador." },

  { name: "Fúria do Relâmpago",
    level: 3, category: "buff/crítico",
    effect: "Alvo (toque, 4 rodadas): +3 na Chance de Crítico em todos os ataques. Ao acertar um crítico, pode imediatamente fazer 1 ataque adicional gratuito (sem custo de Ação) no mesmo alvo ou em outro a 1 hex. O ataque gratuito tem −2 na Chance de Acerto mas pode ser crítico normalmente.",
    castTime: "1 Ação de Magia",
    cooldown: "2 usos por combate",
    critInteraction: "+3 Chance de Crítico. Crítico → 1 ataque extra gratuito no mesmo turno (−2 Acerto, pode ser crítico).",
    note: "Sinergia máxima com Lâmina Cega do Ladino: +5 Lâmina Cega + +3 Fúria do Relâmpago = 8+ na Chance de Crítico. Se o extra também for crítico: terceiro ataque?" },

  /* ── NÍVEL 4 — Mecânicas únicas e arriscadas ──────────────────── */

  { name: "Maldição Invertida",
    level: 4, category: "buff/maldição/crítico",
    effect: "Alvo inimigo (alcance 5 hex): maldiz o alvo por 4 rodadas com a Inversão Crítica. Enquanto maldito: todo ataque contra o alvo que for FALHA CRÍTICA (resultado 10 no dado de crítico) é tratado como CRÍTICO MÁXIMO em vez de falha — o azar se inverte. A maldição não afeta outros efeitos de falha crítica (como a perda de Ação da habilidade do Guerreiro). O alvo não sabe que está maldito.",
    castTime: "1 Ação de Magia",
    cooldown: "2 usos por combate",
    critInteraction: "No alvo: resultado 10 no dado de crítico (pior resultado) = crítico máximo em vez de falha. A sorte se inverte.",
    note: "Magia de controle indireta — não buffa o aliado, amaldiçoa o inimigo. Quem atacar o alvo maldito não pode 'errar' no pior sentido — o 10 vira sucesso crítico." },

  { name: "Êxtase Letal",
    level: 4, category: "buff/crítico/sacrifício",
    effect: "Alvo (toque, 5 rodadas): +4 na Chance de Crítico e dano crítico = +100% (em vez de +50%). MAS cada crítico acertado causa 1d6 de dano ao próprio portador (o corpo não suporta a intensidade do impacto perfeito — retrocesso físico). O buff não pode ser cancelado antes de expirar. O portador pode ver os custos acontecendo mas não pode evitar.",
    castTime: "1 Ação de Magia",
    cooldown: "1 uso por combate",
    critInteraction: "+4 Chance de Crítico. Dano crítico = 100%. Custo: cada crítico causa 1d6 de dano ao portador.",
    note: "O buff mais poderoso de crítico disponível — mas autoflagela. Com Ladino de alta SAB (+3 base) + Êxtase Letal (+4): Crit 7+ no d10, 70%+ de chance, mas cada acerto perfeito dói." },

  /* ── NÍVEL 5 — Singulares ─────────────────────────────────────── */

  { name: "Convergência do Destino",
    level: 5, category: "buff/crítico/ritual",
    effect: "Alvo (toque, até fim do combate): o próximo crítico acertado pelo alvo tem dano multiplicado por 3 em vez de 1.5 (crítico triplo). Após o crítico triplo: o buff não pode ser reaplicado neste combate — o destino já se cumpriu. Se o combate terminar sem o crítico ocorrer: o buff persiste para o próximo combate da sessão.",
    castTime: "2 Ações de Magia",
    cooldown: "1 uso por sessão",
    critInteraction: "Próximo crítico do alvo = ×3 de dano (em vez de ×1.5). Buff consumido após o crítico. Persiste entre combates se não disparado.",
    note: "A magia de maior pico de dano do sistema. Combo: Pacto do Último Golpe (acumula reserva) + Olho do Predador (garante crítico) + Convergência do Destino (×3). Uma ação planejada para destruir um boss." },

  { name: "Tempestade de Críticos",
    level: 5, category: "buff/crítico/área",
    effect: "Todos os aliados visíveis (raio 8 hex): por 3 rodadas, todos ganham +2 na Chance de Crítico. Efeito adicional: se 2 aliados diferentes acertarem críticos no mesmo turno, um pulso de energia é liberado — todos os inimigos em raio 3 hex do ponto médio entre os dois críticos sofrem 2d8+INT de dano puro (energia da sincronia). O pulso é automático e não conta como Ação.",
    castTime: "2 Ações de Magia",
    cooldown: "1 uso por combate",
    critInteraction: "Buff em área: +2 Crit para todos. Sinergia: 2 críticos no mesmo turno → pulso de 2d8+INT automático em área entre eles.",
    note: "A magia de crítico mais cooperativa do sistema. Premia grupos que criam críticos simultaneamente. Com 3+ personagens com alta Chance de Crítico: múltiplos pulsos por turno são possíveis." },

  /* ═══════════════════════════════════════════════════════════════
     NOVAS MAGIAS — NÍVEL 4 E 5
     Cobertura: controle, teleporte, ilusão, proteção, debuff, campo
     ═══════════════════════════════════════════════════════════════ */

  /* ── NÍVEL 4 ─────────────────────────────────────────────────── */

  { name: "Aprisionamento Arcano",
    level: 4, category: "controle",
    effect: "Alvo visível em até 8 hex: correntes de energia arcana brotam do chão e o prendem. O alvo fica Imobilizado por 4 rodadas (não pode mover, mas pode atacar). FOR (difícil) para escapar gastando 1 Ação. Alvos de grande porte ou maior testam FOR (normal). Criaturas com DEX 5+ testam AGI no lugar de FOR.",
    castTime: "1 Ação de Magia",
    cooldown: "2 usos por combate" },

  { name: "Véu de Ilusão",
    level: 4, category: "ilusão",
    effect: "O conjurador — ou um aliado tocado — torna-se invisível por 3 rodadas. Ataques ou magias lançadas pelo alvo encerram a invisibilidade imediatamente. Inimigos com SAB 5+ ou habilidade de Percepção Treinada podem tentar SAB (difícil) para detectar a presença (mas não a posição exata).",
    castTime: "1 Ação de Magia",
    cooldown: "2 usos por combate" },

  { name: "Espelho de Batalha",
    level: 4, category: "ilusão/proteção",
    effect: "Cria 3 duplicatas ilusórias do conjurador adjacentes a ele. Cada ataque recebido pelo conjurador tem 50% de chance de atingir uma duplicata em vez dele (role d6: 1-3 = duplicata destruída, 4-6 = conjurador). Cada duplicata destruída remove uma das três chances. Dura até todas as duplicatas serem destruídas ou 5 rodadas.",
    castTime: "1 Ação de Magia",
    cooldown: "2 usos por combate" },

  { name: "Maldição do Peso de Pedra",
    level: 4, category: "debuff/controle",
    effect: "Alvo visível em até 8 hex: fica com o corpo gradualmente pesado como pedra por 4 rodadas. Efeito cumulativo: Rodada 1 — Movimento −3 hex. Rodada 2 — Movimento 0 (imóvel). Rodada 3 — −2 Ações de combate. Rodada 4 — apenas 1 Ação, todos os testes com −1d6. SAB (difícil) ao final de cada rodada para resistir ao próximo estágio.",
    castTime: "1 Ação de Magia",
    cooldown: "1 uso por combate" },

  { name: "Barreira Rúnica",
    level: 4, category: "proteção/campo",
    effect: "Erige uma parede de runas brilhantes em linha reta de 5 hex ou em arco de raio 3 hex (escolha ao conjurar). A barreira bloqueia projéteis físicos completamente. Magias que atravessam são reduzidas em −INT de dano. Criaturas podem atravessar gastando 3 Ações (a resistência mágica as desacelera). Dura 4 rodadas.",
    castTime: "1 Ação de Magia",
    cooldown: "1 uso por combate" },

  { name: "Distorção Temporal",
    level: 4, category: "controle/campo",
    effect: "Escolhe uma área de raio 3 hex. Dentro dela, o tempo fica perturbado por 4 rodadas: todas as criaturas na área perdem 1 Ação por turno (exceto o conjurador). Aliados podem ser excluídos (máximo de 2 excluídos). Criaturas Dif.3 ou menor precisam de INT (difícil) para perceber o efeito antes de entrar na área.",
    castTime: "1 Ação de Magia",
    cooldown: "1 uso por combate" },

  { name: "Passo Dimensional",
    level: 4, category: "teleporte",
    effect: "Teleporta-se instantaneamente para qualquer ponto visível em até 12 hex. Pode trazer um aliado consentidor adjacente. O teleporte não gasta Ação de Movimento — ocorre como parte da Ação de Magia. Ao chegar: pode imediatamente realizar 1 ataque ou lançar 1 magia (não precisa esperar o próximo turno).",
    castTime: "1 Ação de Magia",
    cooldown: "3 usos por combate" },

  /* ── NÍVEL 5 ─────────────────────────────────────────────────── */

  { name: "Grande Ilusão",
    level: 5, category: "ilusão/controle",
    effect: "Cria uma ilusão completa e convincente — uma criatura, um muro, um buraco, uma área em chamas — de até tamanho 5×5 hex. A ilusão tem som, aparência e temperatura simulados. Criaturas que interagem fisicamente percebem que é ilusão imediatamente. Observadores passivos testam INT (difícil) por turno para perceber. Dura até o conjurador perder concentração ou 6 rodadas.",
    castTime: "2 Ações de Magia",
    cooldown: "1 uso por combate" },

  { name: "Névoa da Discórdia",
    level: 5, category: "debuff/controle/área",
    effect: "Lança névoa psíquica em raio 6 hex. Por 4 rodadas: todas as criaturas na área (exceto o conjurador) precisam passar em SAB (normal) no início de cada turno ou atacam o aliado mais próximo em vez do inimigo. Criaturas que falham ficam Confusas por aquele turno. Saindo da névoa, o efeito cessa imediatamente.",
    castTime: "2 Ações de Magia",
    cooldown: "1 uso por combate" },

  { name: "Âncora do Plano",
    level: 5, category: "controle/proteção",
    effect: "Âncora planar em ponto do chão (raio 8 hex) por 5 rodadas: nenhuma criatura dentro da área pode teleportar, invocar criaturas, desaparecer, tornar-se intangível ou mudar de plano. Magias de deslocamento (Passo Dimensional, Passo das Sombras) falham automaticamente. O conjurador não é afetado. Criaturas que tentam resistir à âncora testam INT (crítico).",
    castTime: "1 Ação de Magia",
    cooldown: "1 uso por combate" },

  { name: "Muralha de Força",
    level: 5, category: "proteção/campo",
    effect: "Evoca uma parede invisível e intransponível de força pura em linha de 8 hex ou círculo de raio 4 hex. Projéteis, magias e físico são completamente bloqueados — nada passa. A muralha não tem HP: só desaparece ao final de 5 rodadas ou se o conjurador cair inconsciente. Uma vez posicionada, não pode ser movida.",
    castTime: "1 Ação de Magia",
    cooldown: "1 uso por combate" },

  { name: "Teleporte em Grupo",
    level: 5, category: "teleporte/utilidade",
    effect: "Teleporta o conjurador e até 4 aliados adjacentes para qualquer ponto visível em até 20 hex, ou para um local já visitado na sessão atual (não precisa de linha de visão para locais conhecidos). O teleporte ocorre no início do turno do conjurador, antes de qualquer Ação. Todos chegam adjacentes uns aos outros.",
    castTime: "2 Ações de Magia",
    cooldown: "1 uso por sessão" },

  { name: "Domínio do Campo",
    level: 5, category: "campo/controle",
    effect: "O conjurador declara controle absoluto sobre área de raio 10 hex por 3 rodadas. Durante este tempo, como Ação Livre por turno, pode: mover 1 aliado até 5 hex sem gastar a Ação deles; ou criar 1 obstáculo de rocha/gelo/chamas em 1 hex que bloqueia passagem por 1 rodada; ou desfazer 1 efeito de controle sobre qualquer aliado na área. Cada opção pode ser usada 1× por turno.",
    castTime: "2 Ações de Magia",
    cooldown: "1 uso por sessão" },

  /* ══════════════════════════════════════════════════════════════
     MAGIAS INSPIRADAS EM PATH OF EXILE
     Foco: geometria hexagonal, totens, auras, cadeias, orbes,
     áreas persistentes que evoluem e stacks de dano
     ══════════════════════════════════════════════════════════════ */

  /* ── NÍVEL 1 ─────────────────────────────────────────────────── */

  { name: "Orbe Congelante", level: 1, category: "ataque/área",
    effect: "Lança uma orbe de gelo que viaja 6 hex em linha reta, deixando um rastro de gelo em cada hex percorrido. Cada hex de rastro dura 2 rodadas: criaturas que entrarem ou terminarem o turno nele sofrem 1d4 de gelo e testam AGI (normal) ou têm o Movimento reduzido pela metade por 1 rodada. A orbe explode no hex final: 1d8+INT em raio 1 hex.",
    castTime: "1 Ação de Magia", cooldown: "4 usos por combate" },

  { name: "Faísca Ricochete", level: 1, category: "ataque/cadeia",
    effect: "Dispara 3 faíscas elétricas que ricocheteiam entre alvos. Primeira faísca: alvo escolhido em até 5 hex (1d6+INT). Cada faísca seguinte salta para o inimigo mais próximo em até 3 hex do anterior (1d6+INT cada). Se não houver alvo em alcance, a faísca dissipa. Nunca ricocheteia para aliados.",
    castTime: "1 Ação de Magia", cooldown: "4 usos por combate" },

  { name: "Totem de Chamas Menor", level: 1, category: "invocacao/totem",
    effect: "Crava um totem flamejante num hex adjacente. O totem tem 15 HP, Def.Física 3, não se move e dura 4 rodadas. No início de cada turno do conjurador, o totem dispara automaticamente uma chama em 1 inimigo em raio 5 hex: 1d6+INT de fogo. O totem não gasta Ação do conjurador para atacar. Inimigos podem destruí-lo.",
    castTime: "1 Ação de Magia", cooldown: "2 usos por combate" },

  /* ── NÍVEL 2 ─────────────────────────────────────────────────── */

  { name: "Terreno Profanado", level: 2, category: "campo/debuff",
    effect: "Corrompe uma área de raio 2 hex por 5 rodadas. Inimigos dentro sofrem 1d6 de dano no início de cada turno e recebem −1d4 em todos os testes. Aliados dentro recebem +1d4 em testes de resistência (o terreno reconhece o conjurador). A área pode ser expandida: cada nova conjuração adjacente estende o Terreno em +2 hex em vez de criar uma nova área.",
    castTime: "1 Ação de Magia", cooldown: "3 usos por combate" },

  { name: "Aura de Ódio", level: 2, category: "buff/aura",
    effect: "Aura persistente em raio 3 hex centrada no conjurador, que se move com ele. Enquanto ativa: todos os aliados na aura causam +1d6 de dano elemental adicional em todos os ataques. Custa 2 MP por rodada para manter (o conjurador escolhe desativar como Ação Livre). Não acumula com outras auras do mesmo tipo.",
    castTime: "1 Ação de Magia", cooldown: "Mantida enquanto houver MP" },

  { name: "Corrente de Gelo", level: 2, category: "ataque/cadeia/controle",
    effect: "Dispara uma corrente de gelo que atinge até 4 alvos em sequência (cada salto máximo 3 hex do anterior). Dano decrescente: 1º alvo 2d6+INT, 2º 2d6, 3º 1d8, 4º 1d6. Cada alvo atingido testa AGI (normal) ou tem Movimento reduzido em 2 hex por 2 rodadas. Se todos os 4 alvos forem atingidos: o último fica Congelado por 1 rodada.",
    castTime: "1 Ação de Magia", cooldown: "3 usos por combate" },

  { name: "Marca do Caçador", level: 2, category: "debuff/marca",
    effect: "Marca um alvo visível em até 8 hex por 5 rodadas. O alvo marcado: recebe +25% de dano de todas as fontes, não pode se tornar invisível, e sua posição é sempre conhecida pelo grupo (mesmo através de paredes). Se o alvo marcado morrer: o conjurador recupera 1d6 MP e a marca salta automaticamente para o inimigo vivo mais próximo (até 6 hex).",
    castTime: "1 Ação (instantânea)", cooldown: "3 usos por combate" },

  { name: "Passo Relâmpago", level: 2, category: "mobilidade/ataque",
    effect: "O conjurador se transforma em raio e viaja até 6 hex em linha reta até um hex visível. Todos os inimigos nos hexes atravessados sofrem 1d8+INT de dano elétrico (AGI normal para metade). Ao chegar: o conjurador pode realizar 1 ataque físico ou lançar 1 magia de nível 1 imediatamente sem gastar Ação adicional.",
    castTime: "1 Ação de Magia", cooldown: "3 usos por combate" },

  /* ── NÍVEL 3 ─────────────────────────────────────────────────── */

  { name: "Totem de Ancestral", level: 3, category: "invocacao/totem",
    effect: "Invoca um Totem Ancestral em hex visível até 5 hex. HP 40, Def.Física 6, dura 6 rodadas. O totem replica os ataques físicos do conjurador: sempre que o conjurador realiza um ataque físico, o totem realiza o mesmo ataque contra o alvo mais próximo dele (dano igual, rolagem separada). Máximo 1 totem ancestral por vez.",
    castTime: "1 Ação de Magia", cooldown: "2 usos por combate" },

  { name: "Chuva de Flechas Arcanas", level: 3, category: "ataque/área",
    effect: "Escolhe uma área de raio 3 hex em até 10 hex de distância. Por 3 rodadas, no início de cada turno do conjurador, a área é bombardeada: todos os inimigos dentro sofrem 2d8+INT de dano arcano (AGI difícil para metade). Aliados são excluídos automaticamente. A área não se move após conjurada.",
    castTime: "2 Ações de Magia", cooldown: "2 usos por combate" },

  { name: "Explosão em Cadeia", level: 3, category: "ataque/cadeia",
    effect: "Marca um alvo. Se ele morrer nos próximos 3 turnos, explode: 3d8+INT em raio 2 hex. Todos os inimigos mortos por essa explosão também explodem (reação em cadeia, dano decrescente 25% por elo). Se o alvo marcado não morrer em 3 turnos, a marca dissipa sem efeito.",
    castTime: "1 Ação de Magia", cooldown: "2 usos por combate" },

  { name: "Campo Estático", level: 3, category: "campo/controle",
    effect: "Cria um campo elétrico permanente de raio 3 hex por 5 rodadas. Inimigos que entrarem ou se moverem dentro do campo sofrem 1d8 de dano elétrico por hex movido (o movimento dispara descargas). Inimigos que ficarem parados não sofrem dano — mas testam INT (normal) ou perdem 1 Ação por rodada (a estática interfere). Aliados imunes.",
    castTime: "1 Ação de Magia", cooldown: "2 usos por combate" },

  { name: "Vulnerabilidade", level: 3, category: "debuff/maldição",
    effect: "Maldição de área: raio 4 hex, dura 4 rodadas. Todos os inimigos na área: Def.Física reduzida pela metade (arredondada para baixo), recebem +50% de dano de sangramento e veneno, e não podem se curar acima de 50% do HP máximo enquanto amaldiçoados. Novos inimigos que entrarem na área são afetados imediatamente.",
    castTime: "1 Ação de Magia", cooldown: "2 usos por combate" },

  /* ── NÍVEL 4 ─────────────────────────────────────────────────── */

  { name: "Tempestade de Fogo Persistente", level: 4, category: "ataque/campo",
    effect: "Área de raio 4 hex em até 12 hex. Dura 5 rodadas e cresce: rodada 1 = raio 4, rodada 2 = raio 5, rodada 3+ = raio 6. Todos os inimigos dentro sofrem 2d10+INT de fogo no início de cada turno (AGI difícil para metade) e ficam Queimando por 2 rodadas. O terreno afetado fica em brasas por 3 rodadas após o fim da magia (1d6 por hex atravessado).",
    castTime: "2 Ações de Magia", cooldown: "1 uso por combate" },

  { name: "Convocação de Espectros", level: 4, category: "invocacao",
    effect: "Invoca 3 Espectros de inimigos derrotados neste combate (Dif. igual ou menor que 3). Cada Espectro tem 50% do HP original, mantém 1 habilidade do monstro original, e dura 6 rodadas. Os Espectros agem no turno do conjurador (sem custo de Ação). Se não houver inimigos derrotados, invoca 3 Sombras genéricas (HP 25, 1d8+INT de dano).",
    castTime: "2 Ações de Magia", cooldown: "1 uso por combate" },

  { name: "Aura de Determinação", level: 4, category: "buff/aura",
    effect: "Aura em raio 4 hex que se move com o conjurador. Aliados dentro: +3 Def.Física, +2 Def.Mágica, imunes a Derrubado e Empurrado. Custa 4 MP por rodada. Ativo (1x enquanto a aura durar): Baluarte — todos os aliados na aura ficam imunes a dano por 1 turno completo (a aura absorve tudo, depois se dissipa e a magia termina).",
    castTime: "1 Ação de Magia", cooldown: "Mantida enquanto houver MP" },

  { name: "Ciclone Devorador", level: 4, category: "ataque/mobilidade",
    effect: "O conjurador gira em movimento contínuo por 3 rodadas. Durante o Ciclone: pode se mover até 4 hex por turno como Ação Livre, e todos os inimigos em hexes adjacentes ao caminho percorrido sofrem 2d8+INT de dano por rodada (sem rolagem de acerto — o ciclone simplesmente atinge). O conjurador não pode lançar outras magias durante o Ciclone, apenas mover e atacar fisicamente.",
    castTime: "1 Ação de Magia", cooldown: "1 uso por combate" },

  /* ── NÍVEL 5 ─────────────────────────────────────────────────── */

  { name: "Cadeia de Aniquilação", level: 5, category: "ataque/cadeia",
    effect: "Dispara um raio devastador que atinge até 8 alvos em cadeia (saltos de até 4 hex). Dano: 3d12+INT no primeiro alvo, reduzindo 15% a cada salto. A cadeia pode retornar ao mesmo alvo se não houver outros — cada retorno causa dano completo novamente. Inimigos atingidos 2+ vezes ficam Atordoados por 1 rodada. Aliados nunca são atingidos.",
    castTime: "2 Ações de Magia", cooldown: "1 uso por combate" },

  { name: "Campo de Aniquilação Total", level: 5, category: "campo/ataque",
    effect: "Marca uma área de raio 6 hex. A área permanece 4 rodadas e se comporta como zona morta: nenhuma cura funciona dentro dela, invocações não podem ser feitas, e todos os inimigos sofrem 3d10 de dano necrótico no início de cada turno (ignora Def.Física). Aliados dentro sofrem apenas 1d6 (o conjurador filtra parcialmente). O conjurador não pode sair da área enquanto a magia durar, ou ela se dissipa.",
    castTime: "2 Ações de Magia", cooldown: "1 uso por sessão" },

  { name: "Exército de Totens", level: 5, category: "invocacao/totem",
    effect: "Invoca 5 Totens simultâneos em hexes visíveis até 8 hex (o conjurador escolhe os hexes). Cada Totem: HP 30, Def.Física 5, dura 5 rodadas. Cada Totem dispara automaticamente por rodada em 1 inimigo em raio 6 hex: 2d8+INT de dano elemental (o conjurador escolhe o elemento de cada totem ao invocar). Os Totens não gastam Ações do conjurador.",
    castTime: "2 Ações de Magia", cooldown: "1 uso por combate" },

  { name: "Convergência Elemental", level: 5, category: "ataque/campo",
    effect: "Escolhe até 3 pontos no campo (raio 2 hex cada, até 12 hex de distância). Cada ponto recebe um elemento diferente: Fogo (2d10 + Queimando), Gelo (2d10 + Congelado 1 rodada), Raio (2d10 + Atordoado 1 rodada). Se dois pontos se sobrepuserem: a área de sobreposição recebe ambos os efeitos e +2d10 de dano extra. Se os três se sobrepuserem: Convergência Total — 6d10 na área tripla e todos os inimigos ali são Atordoados por 2 rodadas.",
    castTime: "2 Ações de Magia", cooldown: "1 uso por sessão" },

  { name: "Vórtice do Vazio", level: 5, category: "controle/campo",
    effect: "Cria um vórtice em hex visível até 10 hex. Por 4 rodadas: no início de cada turno, todos os inimigos em raio 6 hex são puxados 2 hex em direção ao centro do vórtice (FOR difícil para resistir). Inimigos no hex central ou adjacente sofrem 3d10 de dano necrótico por rodada. Objetos soltos, projéteis e magias de área menores que nível 4 são absorvidos pelo vórtice e anulados.",
    castTime: "2 Ações de Magia", cooldown: "1 uso por combate" }];

/* ---------------------------------------------------------------------- */
/* EQUIPAMENTOS                                                           */
/* slot: "primary" | "secondary" | "shield" | "armor" | "accessory"      */
/* defenseDegrade: null (não defende) | 0 (não degrada) | 1 | 2          */
/* ---------------------------------------------------------------------- */

/* ======================================================================
   COMPÊNDIO DE ITENS — sistema de tiers
   tier: "comum" | "raro" | "magico" | "lendario" | "unico" | "ancestral"
   • Tier exibido visualmente apenas a partir de "raro"
   • Ganhos de poder SEMPRE em dado, nunca valor fixo
   • story: descrição da história/origem do item (Mágico+)
   • uniqueAbility: habilidade exclusiva (Único)
   ====================================================================== */

const WEAPONS_ONE_HAND = [
  /* --- COMUNS --- */
  { tier: "comum", name: "Adaga", dmg: "1d4", req: "DEX", weight: 1, defenseDegrade: 2, slot: ["primary","secondary"], note: "Leve; ideal para Ladino." },
  { tier: "comum", name: "Espada Curta", dmg: "1d6", req: "DEX", weight: 3, defenseDegrade: 1, slot: ["primary","secondary"], note: "Equilibrada, boa para qualquer classe." },
  { tier: "comum", name: "Espada Longa", dmg: "1d8", req: "FOR/DEX", weight: 4, defenseDegrade: 1, slot: ["primary","secondary"], note: "Arma clássica de Guerreiro/Clérigo." },
  { tier: "comum", name: "Machado de Uma Mão", dmg: "1d8", req: "FOR", weight: 5, defenseDegrade: 1, slot: ["primary","secondary"], note: "Bom contra escudos de madeira." },
  { tier: "comum", name: "Maça de Guerra", dmg: "1d6", req: "FOR", weight: 4, defenseDegrade: 1, slot: ["primary","secondary"], note: "Arma de impacto; sem penalidade para Clérigo." },
  { tier: "comum", name: "Martelo de Uma Mão", dmg: "1d6", req: "FOR", weight: 4, defenseDegrade: 1, slot: ["primary","secondary"], note: "Versátil; pode ser arremessado até 4 hex sem penalidade." },
  { tier: "comum", name: "Machadinha", dmg: "1d6", req: "FOR/AGI", weight: 3, defenseDegrade: 1, slot: ["primary","secondary"], note: "Pode ser lançada como arma à distância (3 hex) sem penalidade." },

  /* --- RAROS --- */
  { tier: "raro", name: "Espada Serrilhada do Carniceiro", dmg: "1d8 + 1d4", req: "FOR", weight: 4, defenseDegrade: 1, slot: ["primary","secondary"],
    story: "Forjada por ferreiros de batalha do exército de Atrelon para maximizar ferimentos internos. A lâmina serrilhada causa sangramento que não cessa facilmente.",
    note: "Acertos causam Sangramento: 1d4 de dano extra no início do turno do alvo por 2 rodadas." },
  { tier: "raro", name: "Adaga dos Gêmeos da Serpente", dmg: "1d4 + 1d4", req: "DEX", weight: 1, defenseDegrade: 2, slot: ["primary","secondary"],
    story: "Criada em par pelos irmãos Vael e Vorn, artesãos consagrados a Jurgmund. Reza a lenda que cada lâmina guarda metade da alma dos criadores.",
    note: "Quando equipada como arma secundária junto de outra Adaga dos Gêmeos, ambas causam +1d4 de dano adicional." },

  /* --- MÁGICOS --- */
  { tier: "magico", name: "Lâmina do Uivo Solitário", dmg: "1d8 + 1d6", req: "FOR/DEX", weight: 4, defenseDegrade: 1, slot: ["primary","secondary"],
    story: "Temperada com o sangue de um lobo alfa sob a Lua da Marca, esta espada ressoa com o chamado do Deus Marcado. Guerreiros que a empunham relatam ouvir uivos distantes no silêncio da noite.",
    note: "Enquanto equipada, o portador ganha +1d4 em testes de Intimidação. Com HP abaixo de 30%, o dano sobe para 1d8 + 1d8." },
  { tier: "magico", name: "Garra de Jurgmund", dmg: "1d6 + 1d4", req: "DEX", weight: 2, defenseDegrade: 1, slot: ["primary","secondary"],
    story: "Uma adaga com empunhadura em forma de cobra dourada, abençoada pelos sacerdotes de Jurgmund em Serpentara. O veneno do metal nunca seca.",
    note: "Ataques aplicam Veneno de Jurgmund: 1d6 de dano no início de cada turno do alvo por 3 rodadas (cumulativo)." },

  /* --- LENDÁRIOS --- */
  { tier: "lendario", name: "Fang do Alfa", dmg: "1d10 + 1d6 + 1d4", req: "FOR/AGI", weight: 3, defenseDegrade: 1, slot: ["primary","secondary"],
    story: "Retirada do crânio de um Lobo do Vazio, criatura que surgiu na primeira vez que o Deus Marcado rasgou o véu entre os mundos. O osso foi moldado por um ferreiro que perdeu os dedos no processo — cada golpe libera um fragmento do rugido primordial.",
    note: "Uma vez por combate, ao acertar: o alvo deve testar Resistência (difícil) ou fica Amedrontado por 2 rodadas, sofrendo −1d4 em todos os testes. Passivo: +1d4 de dano contra criaturas do tipo Besta ou Monstruosidade." },

  /* --- ÚNICOS --- */

  /* --- MÁGICOS (novos) --- */
  { tier: "magico", name: "Espada da Meia-Lua Sangrenta", dmg: "1d12 + 1d6", req: "FOR/DEX", weight: 4, defenseDegrade: 1, slot: ["primary","secondary"],
    story: "Forjada com aço mesclado com sangue solidificado de um campeão do Deus Marcado. A lâmina muda de cor durante a lua cheia, tornando-se carmesim.",
    note: "Lua Cheia ou em Masmorra: +1d12 de dano extra. Fora disso: +1d6. O mestre define quando está 'sob influência lunar'." },
  { tier: "magico", name: "Punhal da Voragem", dmg: "1d6 + 1d4", req: "DEX", weight: 1, defenseDegrade: 2, slot: ["primary","secondary"],
    story: "Criado por um assassino que fez um pacto com Jurgmund para matar um rei serpente. A lâmina absorve a força vital de cada vítima.",
    note: "Ao matar um inimigo com este punhal, o portador recupera 1d6 HP." },

  /* --- LENDÁRIOS (novos) --- */
  { tier: "lendario", name: "Grande Espada do Crepúsculo", dmg: "1d20 + 1d8", req: "FOR alto", weight: 6, defenseDegrade: 0, slot: ["primary"],
    story: "Arma criada no momento exato de um eclipse que ocorreu durante a Grande Invasão de Atrelon. O ferreiro morreu no processo — a espada absorveu sua alma. O espírito ainda sussurra estratégias de batalha ao portador durante combates.",
    note: "Passivo: +1d8 de dano contra mortos-vivos e entidades de outro plano. Uma vez por combate: ataque extra gratuito ao reduzir um inimigo a 0 HP. Não degrada a Defesa enquanto equipada." },

  
  /* ── Raros com alto dano e desvantagens de balanceamento ── */
  { tier: "raro", name: "Machado da Ira Cega", dmg: "2d8 + 1d6", req: "FOR", weight: 6, defenseDegrade: 3, slot: ["primary"],
    story: "Forjado de ferro vulcânico de Karloth, a lâmina emite calor leve e canta um som grave ao cortar o ar.",
    note: "⚠ Após usar esta arma para atacar, você perde 1 Ação de Combate no próximo turno (o peso desequilibra). Compensa em dano bruto." },
  { tier: "raro", name: "Lâmina do Sangramento Vivo", dmg: "1d10 + 1d8", req: "DEX", weight: 3, defenseDegrade: 1, slot: ["primary","secondary"],
    story: "Espada com entalhes que retêm sangue do portador. Quando ativada, o sangue cobre a lâmina e amplifica o dano.",
    note: "⚠ Para usar o dado extra (1d8), o portador sofre 1d4 de dano a si mesmo antes de atacar. Se preferir, causa só 1d10 sem custo." },
  { tier: "raro", name: "Punhal da Abertura Vital", dmg: "2d6 + 1d4", req: "DEX/AGI", weight: 1, defenseDegrade: 2, slot: ["primary","secondary"],
    story: "Lâmina triangular que cria feridas que não fecham. Artesanato de um assassino que estudou anatomia por décadas.",
    note: "⚠ Acertos causam Sangramento (1d6/rodada, 3 rodadas). Em Falha Crítica (1 natural), o portador sofre o sangramento em si mesmo." },
  { tier: "raro", name: "Maul da Pedra Viva", dmg: "2d10", req: "FOR alto", weight: 15, defenseDegrade: null, slot: ["primary"], heavyTwoHanded: true,
    story: "Maul talhado de uma única pedra das Montanhas de Atrelon. Mais pesado que qualquer arma forjada.",
    note: "⚠ Usa DUAS Ações de Combate por ataque. Em compensação, ignora 3 pontos de Defesa Física do alvo." },
  { tier: "raro", name: "Espada do Eco Duplo", dmg: "1d10 + 1d8", req: "AGI/DEX", weight: 3, defenseDegrade: 1, slot: ["primary","secondary"],
    story: "Espada com lâmina vibrante que ressoa na segunda passagem. O segundo golpe aproveita o eco cinético do primeiro.",
    note: "⚠ Uma vez por turno, ao acertar, pode atacar o mesmo alvo imediatamente sem custo de Ação (metade do dano, sem rolar). Se errar o segundo ataque, perde 1 Reação nesta rodada." },
  { tier: "raro", name: "Cutelo da Exaustão", dmg: "2d6 + 1d6", req: "FOR/DEX", weight: 5, defenseDegrade: 2, slot: ["primary","secondary"],
    story: "Lâmina larga que drena energia do alvo. Útil contra criaturas resistentes — pesado demais para combates longos.",
    note: "⚠ Cada acerto aplica Exaustão Leve ao alvo (−1 Ação por 2 rodadas, máx −2). Após 4 ataques com esta arma no mesmo combate, o portador perde 1 Ação de Combate até o fim." },

/* --- ÚNICOS (novos) --- */
  { tier: "unico", name: "Garras da Alcateia", dmg: "1d12 + 1d12 + 1d6", req: "AGI/FOR", weight: 2, defenseDegrade: 1, slot: ["primary","secondary"],
    story: "Par de garras rituais criadas com as unhas de um Alfa do Vazio — criatura entre o mundo e o plano do Deus Marcado. Nenhum humano sobreviveu ao forjamento mais de uma vez. As garras reconhecem quem tem o Sangue da Marca.",
    uniqueAbility: "Uivo da Alcateia (1x/combate): ao acertar um ataque, o portador emite um uivo sobrenatural. Todos os aliados em até 6 hexágonos podem realizar imediatamente um ataque extra gratuito contra o mesmo alvo ou qualquer inimigo adjacente a eles. Os ataques extras usam o dano natural de cada aliado.",
    note: "Portadores sem o Sangue da Marca sofrem 1d6 de dano por turno enquanto empunham." },

  { tier: "unico", name: "Lâmina Partida de Elyon", dmg: "1d12 + 1d6", req: "FOR/DEX", weight: 5, defenseDegrade: 0, slot: ["primary"],
    story: "O general Elyon serviu ao Deus Marcado na Grande Invasão de Atrelon. Quando traiu seu senhor para proteger os civis de Durran, a espada foi quebrada como punição — e o fragmento sobrevivente conservou toda a fúria divina. Ninguém sabe onde está o outro pedaço.",
    uniqueAbility: "Julgamento do Traidor (1x/dia): ao acertar um ataque, você pode declarar Julgamento. O alvo sofre 3d10 de dano sagrado/profano adicional e fica Imóvel por 1 rodada. Você também recebe 1d6 de dano de retaliação divina.",
    note: "Não pode ser destruída por meios comuns. Defesa não degrada enquanto equipada." },

  /* --- SETS (arquivos anteriores integrados) --- */
  { tier: "magico", setName: "Berserker", name: "Machado de Dois Gumes (Berserker)", dmg: "1d12 + 1d8", req: "FOR", weight: 8, defenseDegrade: null, slot: ["primary"], heavyTwoHanded: false,
    story: "Forjado por um ferreiro que perdeu sua família durante a Grande Invasão élfica. Cada golpe carrega a brutalidade de quem não tem mais nada a perder.",
    note: "Ao reduzir um inimigo a 0 HP, ganha +1d6 de dano no próximo ataque deste turno. SET — Berserker (2/3): Ira Sem Limite.",
    setBonus: { pieces: 3, ability: "Ira Sem Limite", effect: "Ao abater um inimigo, repete o valor exato de dano num segundo alvo em alcance sem re-rolar dados. Sem custo de Ação. (1x/batalha)" } },

  { tier: "magico", setName: "Lâmina Livre", name: "Estoque do Duelo (Lâmina Livre)", dmg: "1d8 + 1d4", req: "DEX", weight: 2, defenseDegrade: 1, slot: ["primary","secondary"],
    story: "Espada de duelo com runa de precisão gravada pelo próprio criador após o décimo duelo vencido. Nunca falhou nas mãos certas.",
    note: "Mão secundária livre: +1 na Chance de Defesa. SET — Lâmina Livre (1/2): Fluxo de Combate.",
    setBonus: { pieces: 2, ability: "Fluxo de Combate", effect: "Dois acertos no mesmo turno contra o mesmo inimigo → terceiro ataque causa dano máximo automático." } },

  /* --- LENDÁRIOS: tema Aether --- */
  { tier: "lendario", name: "Espada da Cobra Partida", dmg: "1d10 + 1d8 + 1d6", req: "FOR/DEX", weight: 4, defenseDegrade: 0, slot: ["primary"],
    story: "Fragmentada da própria cobra de Jurgmund durante a Batalha Colossal, fundida com aço pelos primeiros Serpentarianos. A lâmina escamosa muda de cor com o humor do portador — prateada em paz, dourada em fúria.",
    note: "Passivo: +1d8 contra criaturas do Deus Marcado e Araltos. Ataques com esta arma não podem ser bloqueados por escudo comum (somente escudos mágicos). Imunidade a veneno enquanto equipada." },

  { tier: "lendario", name: "Garra do Karlac", dmg: "1d10 + 1d6", req: "FOR/AGI", weight: 3, defenseDegrade: 1, slot: ["primary","secondary"],
    story: "Criada a partir de uma garra espontaneamente desprendida de Karlac durante um de seus círculos. O metal ainda retém calor — nunca esfria completamente, e queima ao toque de quem não tem o sangue dos Karlacs.",
    note: "Dano de fogo adicional: +1d4 de fogo em cada acerto. Ao acertar um crítico (abaixo do limiar C), o alvo fica Incendiado por 2 rodadas (1d6 de fogo no início de cada turno). Portadores sem Sangue Karlac sofrem 1 de dano de fogo por turno ao empunhar." },

  /* --- ÚNICO: tema Aether --- */
  { tier: "unico", name: "Fang de Vassk — A Espada da Cobra Real", dmg: "1d12 + 1d10 + 1d6", req: "FOR/SAB", weight: 4, defenseDegrade: 0, slot: ["primary"],
    story: "A espada do Rei Vassk, forjada pelo próprio ferreiro do Castelo da Cobra com metal das câmaras do Crânio de Jurgmund. Vassk a empunhou por 30 anos de governo justo antes de ser corrompido. A lâmina ainda guarda fragmentos da Julgund — o brilho esverdeado pulsa levemente como respiração.",
    uniqueAbility: "Comando da Cobra Real (1x/combate): ao acertar, declara uma ordem de uma frase ao alvo. O alvo testa SAB (difícil); se falhar, obedece à ordem por 1 rodada sem perceber que está sendo controlado. Ordens impossíveis ou suicidas quebram o efeito automaticamente. Se o portador tiver as Provas do Aralto, pode usar 2x/combate.",
    note: "Obtida se Vassk for libertado (ele a oferece) ou derrotado. Não pode ser destruída por meios físicos — apenas pela vontade de Jurgmund." },

  /* ══════════════════════════════════════════════════════════
     ITENS AMALDIÇOADOS — Grande poder, grande custo
     ══════════════════════════════════════════════════════════ */

  /* ── ÚNICOS AMALDIÇOADOS — Armas de 1M ── */
  { tier: "unico", cursed: true,
    name: "Cabeça da Serpente", dmg: "1d8 + 1d4", req: "DEX", weight: 1, defenseDegrade: 1,
    slot: ["primary","secondary"], setName: "Serpentes Gêmeas",
    setBonus: { pieces: 2, ability: "Acúmulo Sanguíneo", effect: "Cada acerto no MESMO alvo acumula veneno: 1°=1d4, 2°=2d4, 3°=4d4, 4°=8d4, 5°=16d4 de veneno. Ao matar o alvo no 5° acúmulo, ele EXPLODE causando 16d4 de veneno a todos em raio 2 hex. Ao trocar de alvo o acúmulo reinicia." },
    setBonusNote: "2 peças: Acúmulo Sanguíneo — veneno multiplica por acerto no mesmo alvo, explode no 5° acúmulo.",
    story: "Uma das duas adagas rituais forjadas pelo Assassino Sem Nome, que matou 40 vítimas com as mesmas lâminas sem nunca trocar. As adagas 'aprendem' o veneno de cada alvo — quanto mais você ataca o mesmo inimigo, mais o veneno o conhece. Encontrada no bolso interno de um mensageiro morto às margens do Rio Carmesim, sem nenhuma pista de quem o enviou.",
    note: "⚠ AMALDIÇOADA: Enquanto equipada, o portador tem compulsão de atacar o mesmo alvo até a morte — ao iniciar combate, faz Força de Vontade (normal) ou é obrigado a focar o alvo mais próximo, ignorando ordens táticas. Nunca pode ser voluntariamente retirada do inventário enquanto houver um inimigo vivo no campo de visão.",
    curseDetails: "Dungeon de origem: Catacumbas do Assassino Sem Nome (sob Sombrath). O par completo está dividido — esta em circulação, a outra guardada pelo Chefe da Guilda." },

  { tier: "unico", cursed: true,
    name: "Corpo da Serpente", dmg: "1d8 + 1d4", req: "DEX", weight: 1, defenseDegrade: 1,
    slot: ["primary","secondary"], setName: "Serpentes Gêmeas",
    setBonus: { pieces: 2, ability: "Acúmulo Sanguíneo", effect: "Cada acerto no MESMO alvo acumula veneno: 1°=1d4, 2°=2d4, 3°=4d4, 4°=8d4, 5°=16d4 de veneno. Ao matar no 5° acúmulo, o alvo EXPLODE causando 16d4 a todos em raio 2 hex. Trocar de alvo reinicia o acúmulo." },
    setBonusNote: "2 peças: Acúmulo Sanguíneo — veneno multiplica por acerto no mesmo alvo, explode no 5° acúmulo.",
    story: "A segunda adaga do par. Enquanto separada da Cabeça da Serpente sente que algo está incompleto — o portador sonha com a outra adaga todas as noites, vendo fragmentos de memórias do Assassino Sem Nome. Encontrada selada em um cofre trancado com três fechaduras, na sala de armas pessoal do Chefe da Guilda de Sombrath.",
    note: "⚠ AMALDIÇOADA: Mesma maldição da Cabeça da Serpente. Quando as duas adagas são reunidas no mesmo portador, a maldição se intensifica: Força de Vontade agora é DIFÍCIL ou o portador entra em transe de combate até o alvo morrer.",
    curseDetails: "Parte do conjunto. Boss associado: Chefe da Guilda Kin Silêncio (dif.3) — Catacumbas de Sombrath." },

  { tier: "lendario", cursed: true,
    name: "Machado de Batalha dos Sentinelas de Kurak", dmg: "1d12 + 1d8", req: "FOR", weight: 7,
    defenseDegrade: 2, slot: ["primary"], heavyTwoHanded: false,
    story: "Forjado pelos Sentinelas de Kurak — ordem militar que defendeu a fronteira sul por 200 anos antes de ser aniquilada. O machado 'aprende' com cada combate, acumulando o ímpeto dos golpes bem-sucedidos. O último Sentinela morreu empunhando este machado, e dizem que o sangue na lâmina nunca secou completamente.",
    note: "⚠ AMALDIÇOADA — Ímpeto de Batalha: A cada acerto bem-sucedido CONSECUTIVO neste turno, adiciona +1d6 de dano (1°=+1d6, 2°=+2d6, 3°=+3d6, sem limite). MAS ao RECEBER qualquer dano: perde TODO o bônus acumulado E perde o próximo turno inteiro (o golpe quebra o ímpeto e causa desorientação temporária). Zero tolerância a dano — um arranhão zera tudo.",
    curseDetails: "Localização: Ruínas do Forte Kurak (Montanhas de Atrelon, dif.3). Boss: Último Sentinela Não-Morto (dif.4, imune a medo, usa o mesmo machado)." },

  { tier: "lendario", cursed: true,
    name: "Punhal do Eco Eterno", dmg: "2d6 + 1d8", req: "DEX", weight: 1, defenseDegrade: 1,
    slot: ["primary","secondary"],
    story: "Criado por um assassino que queria que cada golpe contasse duas vezes. O punhal copia o último ataque feito com ele — mas não distingue amigo de inimigo ao ecoar.",
    note: "⚠ AMALDIÇOADA — Eco Cópia: Imediatamente após qualquer ataque com este punhal (acerto ou erro), o punhal executa SOZINHO um segundo ataque idêntico num alvo ALEATÓRIO no raio 3 hex (inclui aliados). O portador não controla o eco. +1d8 de dano no acerto mas o risco de acertar aliados é real.",
    curseDetails: "Dungeon: Câmaras do Espelho Partido (dif.3). O punhal foi dividido em dois — o eco é o reflexo da outra metade." },


  /* ══════════════════════════════════════════════════════════
     ARMAS DIVINAS — Presenteadas pelas divindades
     ══════════════════════════════════════════════════════════ */

  /* ── AETHEA (Divindade dos Elfos — Deusa da Luz e Memória) ── */
  { tier: "ancestral", divine: "Aethea", race: "elfo",
    name: "Lâmina do Crepúsculo Eterno", dmg: "1d10 + 1d8 + 1d6", req: "DEX/INT", weight: 2, defenseDegrade: 0,
    slot: ["primary","secondary"],
    story: "Forjada pela própria Aethea na última aurora antes de os elfos serem escravizados. Aethea chorou ao forjá-la — as lágrimas caíram sobre o metal e solidificaram como gemas que nunca perderam o brilho. A lâmina foi enterrada junto com o primeiro elfo que foi capturado, como promessa de que a luz voltaria. Encontrada por arqueólogos que escavavam o Palácio Central de Akaen.",
    note: "🌟 DIVINO — Memória da Luz: a lâmina lembra todos os ataques bem-sucedidos do portador. Após 3 acertos no mesmo combate, o próximo ataque é guiado por Aethea — acerto automático (sem rolar), dano máximo de todos os dados. Uma vez por dia ao sol: pode invocar 'Claridade de Aethea' — todos os aliados em raio 6 hex são curados em 2d8 e ficam imunes a Medo por 3 rodadas.",
    curseDetails: "Localização: Câmara da Última Aurora (ruínas do Palácio élfico sob Akaen, dif.4). Só pode ser empunhada por quem carrega um item élfico ou tem sangue élfico." },

  /* ── THION (Divindade dos Humanos — Deus da Ambição e Mudança) ── */
  { tier: "ancestral", divine: "Thion", race: "humano",
    name: "Adaga do Conquistador", dmg: "1d8 + 1d6", req: "qualquer", weight: 1, defenseDegrade: 1,
    slot: ["primary","secondary"],
    story: "Thion não forjou esta adaga. Um humano a forjou — o primeiro humano a matar um elfo mago na Era da Escravidão. Thion tocou a lâmina naquele momento e a consagrou retroativamente. O deus da ambição acredita que ferramentas dos mortais valem mais que presentes divinos. A adaga passou por 47 mãos diferentes em 500 anos, cada dono adicionando uma marca na empunhadura.",
    note: "🌟 DIVINO — Ambição de Thion: o dano base aumenta permanentemente a cada nível do portador (+1d4 por nível, acumula — nível 5 = +5d4 além do base). Uma vez por combate: 'Golpe da Mudança' — o próximo ataque ignora TODA Defesa do alvo (física e mágica). O bônus de nível reseta se o portador abandonar voluntariamente uma missão pela segunda vez.",
    curseDetails: "Localização: Câmara das 47 Marcas (museu secreto em Sombrath). O dono anterior deve aceitar passar a adaga — não pode ser roubada de alguém vivo." },

  /* ── RAS'KURU (Divindade dos Orcs — Deus da Guerra e Resistência) ── */
  { tier: "ancestral", divine: "Ras'kuru", race: "orc",
    name: "Garra de Ras'kuru", dmg: "2d8 + 1d10", req: "FOR alto", weight: 5, defenseDegrade: 3,
    slot: ["primary"],
    story: "Ras'kuru perdeu a mão direita na primeira batalha que os orcs travaram ao lado de humanos contra os elfos. A mão caiu e no chão se transformou em esta garra de metal que nunca enferruja. Orcs acreditam que a garra é literalmente a mão do deus — que ele escolheu um orc para empunhá-la cada geração. O portador atual sente os sonhos de todos os portadores anteriores.",
    note: "🌟 DIVINO — Resistência de Ras'kuru: ao receber dano que reduziria o portador abaixo de 50% HP, pode declarar 'Resistência' (1x/combate) — o dano é reduzido à metade e o portador ganha +1d10 de dano nos próximos 2 turnos (raiva purificada). Passivo: imune a Derrubada e Atordoado. Se o portador morrer empunhando a Garra, todos os aliados em raio 6 hex ganham +2d8 de dano por 1 rodada (sacrifício inspira).",
    curseDetails: "Localização: Tumba do Último Chefe Orc (Grande Planície, dif.3). O guardião é um Orc ancestral não-morto que só entrega a garra se for derrotado em combate singular." },


  /* ══════════════════════════════════════════════════════════
     COMBOS DE SUBCLASSE — Armas de 1M
     ══════════════════════════════════════════════════════════ */

  /* ── SET: Manto do Necromante (3 peças) ── */
  { tier: "magico", subclass: "necromante", setName: "Manto do Necromante",
    name: "Ceifador (Manto do Necromante)", dmg: "1d8 + 1d6", req: "INT/SAB", weight: 2, defenseDegrade: 1,
    slot: ["primary","secondary"],
    story: "Uma foice curta forjada com osso de lich, temperada em névoa das catacumbas. A lâmina parece sempre levemente translúcida — como se existisse em dois planos ao mesmo tempo.",
    note: "A cada morte com esta lâmina: ganha 1 carga de Alma (máximo 3). Cada carga adiciona +1d4 de dano necrótico nos próximos ataques. Cargas se perdem ao fim do combate.",
    setBonus: { pieces: 3, ability: "Colheita das Almas",
      effect: "Com 3 cargas de Alma ativas: pode gastar todas para lançar Toque Necrótico gratuitamente (sem Slot) como Ação Livre. O próximo morto-vivo invocado neste combate tem HP dobrado." } },

  /* ── SET: O Alquimista Errante (3 peças) ── */
  { tier: "raro", subclass: "alquimista", setName: "O Alquimista Errante",
    name: "Daga de Extração (O Alquimista Errante)", dmg: "1d6 + 1d4", req: "DEX", weight: 0.8, defenseDegrade: 1,
    slot: ["primary","secondary"],
    story: "Daga com lâmina oca e serrilhada — ao perfurar, extrai automaticamente uma amostra da criatura (sangue, veneno, fluido). Alquimistas usam as amostras como ingredientes de alto nível.",
    note: "Acerto em criatura não-morta: extrai componente que serve como ingrediente raro (1x/criatura). Acerto em criatura venenosa: extrai dose de veneno que pode ser aplicada em arma ou frasco.",
    setBonus: { pieces: 3, ability: "Laboratório de Campo",
      effect: "Com 3 peças: pode criar qualquer poção do Nível 1 ou 2 como Ação de Combate (sem descanso longo, mas precisa de ingredientes coletados neste combate). 1x/combate." } },

,

  /* ─── SET: Lâmina das Runas — Runa-Lâmina (guerreiro+mago) 3p ─ */

  { tier: "raro", name: "Espada Rúnica de Valdris", dmg: "1d8+1d4", req: "FOR", weight: 3.5,
    slot: ["primary"], defenseDegrade: 1,
    setName: "Lâmina das Runas", subclass: "runa-lamina",
    effect: "Ao gravar uma Runa nesta espada: a Runa fica carregada (não consome Carga do turno). A primeira Runa carregada por combate é gratuita (não consome MP nem Fúria).",
    note: "1ª Runa por combate é gratuita. Runas nesta lâmina causam +1d4 extra ao detonar.",
    story: "Forjada em Valdris com inscrições de fragmentos de grimório. O ferreiro não entendia o que gravava — mas a espada entendeu." },

  { tier: "raro", name: "Adaga de Ancoragem Arcana", dmg: "1d4+1d4", req: "DEX", weight: 1,
    slot: ["primary","secondary"], defenseDegrade: 2,
    setName: "Lâmina das Runas", subclass: "runa-lamina",
    effect: "Ao usar esta adaga como secundária: se o portador tiver uma Runa ativa no corpo ou na arma primária, a adaga causa +1d6 arcano passivo em cada ataque. Se uma Runa detonar enquanto estiver empunhando a adaga: ganha +1 Esquiva na rodada.",
    note: "Com Runa ativa: +1d6 arcano passivo em ataques. Bônus de Esquiva ao detonar Runa.",
    story: "Pequena o suficiente para segurar na mão esquerda enquanto as runas brilham na direita." },

  /* ─── SET: Sombra Dupla — Caçador Sombrio (ladino+arqueiro) 3p ─ */

  { tier: "raro", name: "Faca do Silêncio", dmg: "1d6+1d4", req: "DEX", weight: 0.8,
    slot: ["primary","secondary"], defenseDegrade: 2,
    setName: "Sombra Dupla", subclass: "cacador-sombrio",
    effect: "Ataques com esta faca não produzem som. Se o portador estiver Furtivo: o acerto é automático contra alvos que não perceberam o portador (sem rolar d10). Ataques furtivos com esta faca: +1d8 adicional.",
    note: "Silenciosa. Em Furtividade contra alvos desavisados: acerto automático + +1d8 extra.",
    story: "O vendedor disse que ninguém jamais ouviu o dono desta faca atacar. O comprador perguntou se algum deles ainda estava vivo para confirmar." },

  { tier: "raro", name: "Adaga da Armadilha", dmg: "1d4+1d4", req: "DEX", weight: 0.7,
    slot: ["primary","secondary"], defenseDegrade: 2,
    setName: "Sombra Dupla", subclass: "cacador-sombrio",
    effect: "Ao cravar esta adaga num hex como Ação Livre: cria armadilha simples (1d6, Preso). Não gasta Carga de Veneno nem Foco. Pode ser combinada com Armadilha de Caçador — cravando a adaga no hex da armadilha existente: +1d4 ao dano e Sangramento adicional.",
    note: "Armadilha gratuita como Ação Livre 1x/combate. Aprimora Armadilha de Caçador existente.",
    story: "A lâmina tem entalhes que funcionam como anzol. Uma vez que entra num material mole — não sai sem custo." },

  /* ─── INSPIRADOS EM ELDEN RING — Armas de 1 Mão ─────────────── */

  { tier: "lendario", name: "Lâmina do Rio de Sangue",
    dmg: "1d8+1d6", req: "DEX", weight: 2.5,
    slot: ["primary"], defenseDegrade: 1,
    magicBonus: { attr: "DEX", attrValue: 1 },
    effect: "Cada acerto acumula 1 carga de Hemorragia no alvo (máx 5). Ao atingir 5 cargas: Hemorragia explode — alvo perde 15% do HP máximo atual instantaneamente (ignora Def.Física e Mágica). As cargas resetam após a explosão. Ataques com DEX 3+: acumula 2 cargas por acerto.",
    note: "+1 DEX passivo. 5 cargas → explosão de 15% HP máximo atual. DEX 3+: 2 cargas/acerto.",
    story: "Forjada por um ferreiro maldito do Deserto Carmesim que misturou o aço com o próprio sangue durante sete luas. Dizem que a lâmina sempre está levemente úmida, independente do clima. O ferreiro nunca foi visto novamente.",
    cursed: true },

  { tier: "lendario", name: "Adaga da Noite Estelar",
    dmg: "1d6+1d4", req: "DEX", weight: 0.8,
    slot: ["primary","secondary"], defenseDegrade: 2,
    effect: "Ao atacar alvo em Furtividade: o acerto é automático (sem rolar d10) e causa +2d8 de dano arcano adicional que ignora Def.Física. Em combate aberto: ao tirar 1 no d10, o dano arcano explode em nova Ação de Magia gratuita — lança magia de Nível 1 conhecida no mesmo alvo sem custo de recurso.",
    note: "Em Furtividade: acerto automático + 2d8 arcano. Crítico em combate aberto: magia Nível 1 gratuita no alvo.",
    story: "Encontrada na câmara mais alta das Ruínas de Atrelon, incrustada no teto como uma estrela artificial. Quem a pega sente que a escuridão ao redor ficou levemente mais útil." },

  { tier: "lendario", name: "Espada dos Cavaleiros Perfurados",
    dmg: "1d10+1d6", req: "FOR", weight: 4,
    slot: ["primary"], defenseDegrade: 1,
    magicBonus: { attr: "FOR", attrValue: 1 },
    effect: "Passivo: +1 FOR. Cada acerto que o portador recebe (não esquiva, não defende completamente) carrega a espada com 1 Espinho (+1d6 de dano, acumula até 3 Espinhos). Ao atacar com Espinhos ativos: todos os Espinhos disparam de uma vez no próximo acerto. A espada 'aprende' com a dor.",
    note: "+1 FOR. Acumula Espinhos ao receber dano (até 3×+1d6). Próximo ataque: todos os Espinhos disparam.",
    story: "Pertenceu a um cavaleiro que fez voto de sentir cada golpe que recebia para nunca subestimar o inimigo. O voto está na lâmina. Quem a empunha faz o voto também — quer saber disso ou não." },

  { tier: "lendario", name: "Cutelo da Blasfêmia Ardente",
    dmg: "1d8+1d6", req: "FOR", weight: 3.5,
    slot: ["primary"], defenseDegrade: 1,
    magicBonus: { attr: "FOR", attrValue: 1 },
    effect: "Passivo: ao matar um inimigo com esta arma, cura 2d6 HP e recupera 1 Fúria (Guerreiro/Berserker) ou 1 Fé (Clérigo/Paladino). Ativo (gasta 3 Fúria ou 3 Fé): lança Chama Blasfêmica — cone 4 hex de fogo sagrado corrompido, 2d8+FOR de dano, inimigos afetados testam Resistência (normal) ou ficam Queimando (1d6/rodada, 2 rodadas). 2 usos/combate.",
    note: "+1 FOR. Matar inimigo: +2d6 HP e +1 recurso. Chama Blasfêmica: cone 4 hex, 2d8+FOR, Queimando.",
    story: "O Clérigo que a forjou não sabia que a lâmina absorveria suas orações. Quando percebeu, as orações já não eram mais dele — eram da espada. Ele morreu sorrindo. A espada continuou." },

  { tier: "ancestral", name: "Lua Cheia Invertida",
    dmg: "1d8+1d6+1d4", req: "INT", weight: 2,
    slot: ["primary"], defenseDegrade: 1,
    magicBonus: { spellActions: 1, attr: "INT", attrValue: 2 },
    effect: "Passivo: +2 INT e +1 Ação de Magia. Ativo (custa 2 Ações de Magia): dispara Feixe de Lua — raio de energia pura a 8 hex de alcance, 3d8+INT de dano arcano. O alvo testea Força de Vontade (difícil) ou fica com Def.Mágica −4 por 3 rodadas (a luz da lua corrói a resistência mágica). Ao acertar ataque físico: +1d6 de dano arcano grátis se tiver MP disponível.",
    note: "+2 INT, +1 Ação de Magia. Feixe de Lua: 8 hex, 3d8+INT + Def.Mágica −4. Ataque físico: +1d6 arcano grátis.",
    story: "Forjada durante um eclipse completo nas Montanhas de Atrelon por um Mago que quis capturar o momento em que a lua e o sol se tocam. Funcionou. Ambos ficaram na lâmina." },

  /* ─── ARMAS COM BÔNUS DE CRÍTICO ─────────────────────────────── */

  { tier:"raro", name:"Adaga do Ponto Vital",
    dmg:"1d6+1d4", req:"DEX", weight:0.5,
    slot:["primary","secondary"], defenseDegrade:2,
    magicBonus:{ critChance:1 },
    effect:"Passivo: +1 na Chance de Crítico. A lâmina delgada foi forjada para encontrar juntas de armadura e nervos expostos — não para força bruta.",
    note:"+1 Chance de Crítico.",
    story:"Um cirurgião convertido em mercenário. A lâmina nunca mudou de propósito — apenas o alvo." },

  /* ─── LOOT DE MONSTROS — ARMAS 1M ────────────────────── */

  { tier:"raro", name:"Adagas Geminadas",
    dmg:"1d8", req:"DEX", weight:0.6,
    defenseDegrade:2, slot:["primary","secondary"],
    magicBonus:{ critChance:1 },
    effect:"Par inseparável. Cada Ação de ataque com estas adagas realiza 2 ataques separados. +1 na Chance de Crítico (d10). Foram criadas para a Executora — respondem melhor a quem ataca em série.",
    note:"2 ataques por Ação. +1 Chance de Crítico. Loot: A Executora Sem Nome.",
    story:"Não têm nome gravado. Só marcas de sangue que nunca saem." },

  { tier:"raro", name:"Espada Fantasmal",
    dmg:"1d12", req:"FOR/DEX", weight:3,
    defenseDegrade:1, slot:["primary","secondary"],
    effect:"Lâmina semitransparente de energia espectral. Críticos com esta arma aplicam Maldição do Acéfalo no alvo por 1 rodada — o alvo fica Confuso e pode atacar aliado.",
    note:"Crítico → Confusão no alvo. Loot: Cavaleiro Sem Cabeça.",
    story:"Pertenceu a um cavaleiro que perdeu a cabeça numa batalha que ninguém mais lembra." },

  /* ─── ARMAS DE ORC — 1 MÃO ─────────────────────────────────── */

  /* COMUNS */
  { tier:"comum", name:"Machadinha Orc",
    dmg:"1d6+1d4", req:"FOR", weight:3, defenseDegrade:2,
    slot:["primary","secondary"],
    note:"Produção orc bruta: desbalanceada mas eficaz. Ideal para guerreiros iniciantes em território orc." },

  { tier:"comum", name:"Clava de Osso Orc",
    dmg:"1d6", req:"FOR", weight:4, defenseDegrade:2,
    slot:["primary","secondary"],
    note:"Osso de criatura grande reforçado com pregos de ferro bruto. Derruba alvos menores facilmente. Acertos com vantagem (flanqueamento): alvo testa FOR (normal) ou fica Derrubado." },

  { tier:"comum", name:"Faca de Dente de Javali",
    dmg:"1d4+1d4", req:"DEX", weight:1, defenseDegrade:2,
    slot:["primary","secondary"],
    note:"Artesanato tradicional orc. Dente de javali-gigante montado em cabo de osso. Favorita de exploradores e caçadores orc." },

  /* RAROS */
  { tier:"raro", name:"Cutelo do Chefe de Clã",
    dmg:"1d8+1d6", req:"FOR", weight:5, defenseDegrade:1,
    slot:["primary","secondary"],
    story:"Pertenceu ao chefe de uma tribo da Planície Vermelha. Cada entalhe na lâmina representa um inimigo derrotado. Há muitos entalhes.",
    note:"Se o portador tiver FOR ≥ 3: o cutelo causa +1d4 de dano extra (a força bruta amplifica o corte desigual da lâmina). Acertos consecutivos no mesmo alvo (2+): +1 Chance de Crítico acumulativo." },

  { tier:"raro", name:"Crânio Esmagador de Grak",
    dmg:"1d8+1d4", req:"FOR", weight:6, defenseDegrade:1,
    slot:["primary","secondary"],
    story:"Grak era o campeão do Clã Dente de Ferro. Este martelo improvisado — um crânio de ogro montado em poste de carvalho — foi sua arma por treze anos.",
    note:"Acertos contra alvos com elmo ou capuz de metal: +1d6 extra de dano concussivo (o som do impacto ressoa internamente). Chance de Crítico +1 contra alvos com armadura pesada." },

  { tier:"raro", name:"Lança de Caça Orc",
    dmg:"1d8+1d4", req:"FOR/DEX", weight:2, defenseDegrade:1,
    slot:["primary","secondary"],
    story:"Orcs caçadores usam lanças balanceadas para abate rápido. Esta foi feita por uma mestre ferreiro orc e equilibra perfeitamente peso e alcance.",
    note:"Alcance 2 hex (em vez de 1). Pode ser arremessada (alcance 5 hex, perde a arma mas reaparece no hex de impacto). Ataques de oportunidade com esta lança não custam Reação." },

  /* MÁGICOS */
  { tier:"magico", name:"Presa da Hiena-Sangue",
    dmg:"1d8+1d6", req:"FOR/DEX", weight:3, defenseDegrade:1,
    slot:["primary","secondary"],
    magicBonus:{ attr:"FOR", attrValue:1 },
    story:"Forjada com a presa de uma Hiena-Sangue — criatura sagrada para o Clã da Lua Vermelha. A arma ressoa com o instinto predatório da besta.",
    note:"+1 FOR enquanto equipada. Ao acertar um alvo que já foi atingido neste turno: +1d6 de dano extra (instinto de bando — a arma responde ao cheiro de sangue fresco). Passivo: em combate com 3+ aliados, +1 Chance de Crítico." },

  { tier:"magico", name:"Garra do Warchief",
    dmg:"1d10+1d6", req:"FOR alto", weight:5, defenseDegrade:1,
    slot:["primary","secondary"],
    magicBonus:{ attr:"FOR", attrValue:1 },
    story:"Criada pelo ferreiro-xamã Vrak para o Warchief do Grande Clã. A lâmina canta em orc quando banhada em sangue inimigo — os mortos do portador cantam com ela.",
    note:"+1 FOR enquanto equipada. Req. FOR alto (≥3). A cada kill em combate: a Garra ganha +1d4 de dano bônus acumulativo (máximo +2d4). Os bônus se reiniciam após o combate. Em crítico: toda a dor acumulada explode — causa o dano normal do crítico mais todos os bônus de kills dobrados." },

  /* ══════════════════════════════════════════════════════════════
     SERPENTARIANOS E SACERDOTES DE JURGMUND
     Itens refinados — guerreiros de escama e magos místicos
     ══════════════════════════════════════════════════════════════ */

  /* ── ARMAS DE 1 MÃO ─────────────────────────────────────────── */

  /* COMUNS */
  { tier:"comum", name:"Estoque Serpentariano",
    dmg:"1d6", req:"DEX", weight:1.5, defenseDegrade:2,
    slot:["primary","secondary"],
    note:"Lâmina estreita e reta usada pelos patrulheiros serpentarianos de entrada. Forjada com liga de ferro e escama pulverizada — mais rígida que aço comum. A empunhadura imita a postura de uma cobra em repouso." },

  { tier:"comum", name:"Adaga Ritual de Jurgmund",
    dmg:"1d4+1d4", req:"DEX/SAB", weight:1, defenseDegrade:2,
    slot:["primary","secondary"],
    note:"Adaga cerimonial de aço prateado usada em rituais de Jurgmund. Pode ser usada em combate, mas é proibido matar com ela fora de cerimônia (cultistas não seguem essa regra). Sacerdotes e Clérigos ganham +1d4 em testes religiosos enquanto a carregam." },

  /* RAROS */
  { tier:"raro", name:"Lâmina da Escama Dourada",
    dmg:"1d8+1d4", req:"DEX", weight:2, defenseDegrade:1,
    slot:["primary","secondary"],
    story:"Forjada pelos ferreiros-sacerdotes de Serpentara com escamas da Cobra-Rainha dourada — criatura sagrada abatida uma única vez por geração para este propósito. A lâmina reluz em dourado quando banhada em veneno.",
    note:"Acertos aplicam Veneno Dourado de Jurgmund: 1d6 de veneno por 3 rodadas (SAB difícil para resistir). O veneno também reduz −1d4 em todos os testes do alvo enquanto ativo (a toxina embaralha o juízo)." },

  { tier:"raro", name:"Garra do Guardião da Escama",
    dmg:"1d8+1d6", req:"DEX/FOR", weight:3, defenseDegrade:1,
    slot:["primary","secondary"],
    story:"Arma exclusiva dos Guardiões da Escama — elite serpentariana que protege os santuários internos de Serpentara. A lâmina curva imita a trajetória de uma cobra atacando. Cada Guardião forja a própria.",
    note:"Em combate adjacente a um aliado serpentariano ou sacerdote de Jurgmund: +1 Chance de Crítico e +1d4 de dano extra (os Guardiões são treinados para trabalhar em par). Se o alvo estiver Envenenado: +1d6 de dano adicional por Ação (a lâmina amplifica a toxina já presente)." },

  { tier:"raro", name:"Fang Ritual — Dente de Julgamento",
    dmg:"1d6+1d4", req:"SAB/DEX", weight:1.5, defenseDegrade:1,
    slot:["primary","secondary"],
    story:"Usado pelos sacerdotes de Jurgmund nas cerimônias de Julgamento — o ritual em que um preso é ferido com o Fang e a serpente decide se ele merece viver. Se o veneno não matar em 3 dias, o réu é solto. Muitos sacerdotes 'ajudam o julgamento'.",
    note:"Passivo: acertos com este Fang aplicam Marca de Julgamento — o alvo fica marcado por 3 rodadas. Enquanto marcado, qualquer criatura serpentariana ou cobra aliada que atacar o alvo tem +2 Chance de Crítico. Ativo (1x/combate): Julgamento de Jurgmund — o ferimento pulsa com energia divina, causando 2d8 de dano sagrado que ignora toda defesa." },

  /* MÁGICOS */
  { tier:"magico", name:"Fang Sagrado de Vassk",
    dmg:"1d10+1d6", req:"DEX/SAB", weight:2, defenseDegrade:1,
    slot:["primary","secondary"],
    magicBonus:{ attr:"SAB", attrValue:1 },
    story:"Uma das três réplicas sagradas do Fang original de Vassk, o primeiro Rei Serpentariano. Guardada nos altares de Serpentara e concedida apenas a campeões. A lâmina está sempre quente ao toque.",
    note:"+1 SAB enquanto equipado. Veneno de Vassk: acertos aplicam toxina especial — 1d8 de veneno por turno por 4 rodadas, SAB crítico para resistir, imune a antídotos comuns (requer Cura Mágica Nv.3+). Críticos com este Fang: o veneno entra na corrente sanguínea imediatamente causando +2d8 extra e Abalado por 2 rodadas." },

  { tier:"magico", name:"Espiral do Oráculo — Lâmina Mística",
    dmg:"1d8+1d6", req:"INT/SAB", weight:2, defenseDegrade:1,
    slot:["primary","secondary"],
    magicBonus:{ attr:"INT", attrValue:1, spellActions:1 },
    story:"Criada pelos Oráculos Serpentarianos — os magos-sacerdotes que interpretam os movimentos das serpentes como profecia. A lâmina espiral não corta linearmente — corta em arco, como a trajetória de uma cobra.",
    note:"+1 INT, +1 Ação de Magia enquanto equipada. Pode ser usada para lançar magias que normalmente precisariam de cajado (trata como cajado mágico para efeitos de slot). Acertos com a Espiral desorientam: alvo perde 1 Ação no próximo turno (SAB difícil para resistir). Críticos: o corte em espiral causa Sangramento profundo — 1d8 por rodada, irremovível por meios físicos." },

  /* ══════════════════════════════════════════════════════════════
     ELFOS ANTIGOS — LENDÁRIO E ANCESTRAL
     Era anterior à escravidão — armas de Aethea e dos Elfos Primordiais
     Refinamento absoluto: cada item é memória, não apenas metal
     ══════════════════════════════════════════════════════════════ */

  /* ── ARMAS DE 1 MÃO ÉLFICAS ─────────────────────────────────── */

  /* LENDÁRIO */
  { tier:"lendario", divine:"Aethea", race:"elfo",
    name:"Lâmina do Véu Eterno",
    dmg:"1d12+1d8+1d4", req:"DEX/INT", weight:1.5, defenseDegrade:0,
    slot:["primary","secondary"],
    story:"Forjada pelos primeiros elfos-ferreiros antes mesmo de Aethea assumir forma divina. Existe há tanto tempo que seus entalhes rúnicos foram reescritos três vezes — cada camada conta uma guerra diferente. A lâmina não envelhece. O portador, sim.",
    effect:"Passivo: a lâmina é silenciosa absolutamente — ataques com ela nunca produzem som (útil em furtividade; Percepção auditiva é inútil contra ela). +1 Chance de Crítico. Ativo (2x/combate): Corte do Véu — o ataque atravessa a fronteira entre o plano físico e o etéreo; ignora TODA a Def.Física e Mágica. Crítico com Corte do Véu: o alvo fica Vulnerável a dano mágico (+50%) por 2 rodadas (o véu do alvo rasgou).",
    note:"Silenciosa absolutamente. +1 Crit. 2x/combate: ignora toda defesa. Crítico: +50% dano mágico por 2 rodadas." },

  { tier:"lendario", divine:"Aethea", race:"elfo",
    name:"Adaga das Estrelas Caídas",
    dmg:"1d10+1d8", req:"DEX/SAB", weight:1, defenseDegrade:1,
    slot:["primary","secondary"],
    story:"Cada vez que um elfo antigo morria na Era da Escravidão, uma estrela caía. Esta adaga foi forjada com metal de três dessas estrelas — metal que atravessou o firmamento e carrega a dor de três mortes élficas distintas. Aethea a abençoou em silêncio.",
    effect:"Passivo: acertos com esta adaga aplicam Marca Estelar — o alvo brilha levemente por 3 rodadas (invisibilidade é anulada; todos os ataques contra ele têm +1 Chance de Acerto). Ativo (1x/combate): as três estrelas explodem — o alvo sofre 3d8 de dano de luz sagrada que ignora toda defesa, e fica Cego por 1 rodada (SAB difícil para resistir à cegueira).",
    note:"+1 Acerto a todos vs alvo Marcado. 1x: 3d8 luz ignora defesa + cegueira 1 rodada." },

  /* ANCESTRAL */
  { tier:"ancestral", divine:"Aethea", race:"elfo",
    name:"Estilha da Primeira Lua",
    dmg:"1d12+1d10+1d6", req:"DEX/INT", weight:1.5, defenseDegrade:0,
    slot:["primary","secondary"],
    magicBonus:{ attr:"DEX", attrValue:2, attr2:"INT", attrValue2:2, critChance:2 },
    story:"Não foi forjada. Aethea a arrancou da face da primeira lua quando os elfos foram acorrentados, e ela caiu como uma estilha de luz sólida. Quem a carrega sente o peso de algo que não deveria existir no plano físico. Ela não tem cabo — a mão do portador simplesmente não é cortada.",
    effect:"Passivo: +2 DEX, +2 INT, +2 Chance de Crítico. Defesas com esta lâmina nunca reduzem a Chance de Esquiva (como escudo). Passivo: em noite aberta ou em ambientes com luz natural, o portador regenera 1 HP por rodada. Ativo (1x/combate): Lua em Estilhas — o portador desaparece por 1 turno inteiro (intangível, invisível) e reaparece em qualquer hex visível em raio 12 hex; o próximo ataque após reaparecer tem +4 Chance de Crítico e causa +2d10 extra de dano de luz.",
    note:"+2 DEX/INT, +2 Crit. Sem degrade de esquiva. Regen HP à noite. 1x: desaparece e reaparece — +4 Crit e +2d10 luz." },

  { tier:"ancestral", divine:"Aethea", race:"elfo",
    name:"Fang do Mago-Guerreiro de Akaen",
    dmg:"1d10+1d8+1d6", req:"DEX/INT", weight:2, defenseDegrade:0,
    slot:["primary","secondary"],
    magicBonus:{ attr:"DEX", attrValue:1, attr2:"INT", attrValue2:2, spellActions:1, critChance:1 },
    story:"Os Magos-Guerreiros de Akaen eram a elite elfica que combinava espada e magia com elegância que humanos e orcs consideravam impossível. Esta lâmina pertenceu ao último deles — Akaen em pessoa, segundo os registros que sobreviveram. Ela ainda lembra o dono.",
    effect:"Passivo: +1 DEX, +2 INT, +1 Ação de Magia, +1 Chance de Crítico. A lâmina pode canalizar magias — qualquer magia de dano lançada pelo portador pode ser entregue através de um ataque melee (não requer linha de visão; o toque aplica a magia diretamente). Ativo (2x/combate): Lâmina Arcana — o próximo ataque carrega uma magia já equipada sem gastar Slot adicional (a magia explode no contato).",
    note:"+1 DEX, +2 INT, +1 Ação Magia, +1 Crit. Magias via melee. 2x: próximo ataque entrega magia sem gastar Slot." },

  /* ══════════════════════════════════════════════════════════════
     ITENS DE CRIATURAS MÍTICAS
     Sem necessidade de lore direto — materiais impossíveis,
     criaturas lendárias, mecânicas únicas
     ══════════════════════════════════════════════════════════════ */

  /* ── ARMAS DE 1 MÃO ─────────────────────────────────────────── */

  { tier:"raro", name:"Faca de Dente de Basilisco",
    dmg:"1d8+1d4", req:"DEX", weight:1.5, defenseDegrade:1,
    slot:["primary","secondary"],
    story:"O dente de um basilisco é o único material que não se dissolve no próprio veneno da criatura. Esta faca foi talhada de um dente de basilisco adulto por um artesão que trabalhou com olhos vendados — dente de basilisco petrifica quem olha diretamente para ele fora do crânio.",
    note:"Acertos aplicam Toxina de Basilisco: alvo testa FOR (difícil) ou fica com −1 Movimento por 2 rodadas (a pele endurece levemente). 3 aplicações por combate. Se o mesmo alvo acumular 3 aplicações da toxina no mesmo combate: fica Petrificado por 1 turno (a toxina atingiu o limiar). A faca não pode ser afiada — o dente mantém a própria borda." },

  { tier:"raro", name:"Garra de Grifo",
    dmg:"1d8+1d6", req:"FOR/DEX", weight:2, defenseDegrade:1,
    slot:["primary","secondary"],
    story:"A garra traseira de um Grifo adulto, montada em cabo de madeira de cedro. Grifos perdem garras durante o emparelhamento — a fêmea arranca a garra do macho como prova de domínio. Esta veio de um macho que sobreviveu.",
    note:"Ataques com esta garra contam como dois: um corte e um gancho. Se ambos acertarem (2 Ações gastas no mesmo alvo em sequência): o alvo é Agarrado (Imóvel, FOR normal para escapar com 1 Ação). Enquanto agarrado: ataques adicionais com a Garra causam +1d8 extra. Em voo ou altura elevada: +1 Chance de Crítico (o Grifo caçava de cima)." },

  { tier:"magico", name:"Espora do Unicórnio",
    dmg:"1d8+1d6", req:"SAB/DEX", weight:1, defenseDegrade:1,
    slot:["primary","secondary"],
    magicBonus:{ attr:"SAB", attrValue:1 },
    story:"Não é o chifre inteiro — é um fragmento da ponta do chifre que se desprendeu naturalmente quando um unicórnio ancião passou por uma floresta densa. Nenhum unicórnio foi caçado. A floresta ainda existe. O unicórnio, dizem, passou apenas para verificar se o fragmento seria bem usado.",
    note:"+1 SAB. Passivo: a arma purifica — qualquer veneno ou maldição que afete o portador tem sua duração reduzida em 1 rodada por turno (venenado por 4 rodadas passa a 3, depois 2, depois 1). Acertos em criaturas corrompidas, mortas-vivas ou amaldiçoadas: +1d8 de dano sagrado extra. Ativo (1x/combate): a espora brilha — cura o portador em 1d6+SAB HP e remove 1 condição negativa imediatamente." },

  { tier:"lendario", name:"Chifre do Unicórnio — Espada",
    dmg:"1d10+1d8+1d4", req:"SAB/DEX", weight:1.5, defenseDegrade:0,
    slot:["primary","secondary"],
    story:"O chifre completo de um unicórnio que ofereceu sua própria vida ao portador anterior, que estava morrendo de uma doença incurável. O unicórnio curou a doença e morreu. O chifre foi transformado em espada pelo curado — que jurou usá-la apenas para proteger os que não conseguem se proteger. A espada lembra o juramento.",
    note:"Passivo: imune a veneno e maldições enquanto equipada. Passivo: ao curar um aliado a 0+ HP em combate (por qualquer meio), a espada ganha +1 Chance de Crítico cumulativo até o fim do combate (máximo +4). Ativo (2x/combate): Pureza Absoluta — o próximo ataque causa 2d10 de dano sagrado que ignora toda defesa e remove instantaneamente qualquer veneno, maldição ou condição negativa do alvo ALIADO tocado (pode ser usado em aliados em vez de inimigos, sem causar dano). Ativo (1x/sessão): ressuscita com 1 HP um aliado morto há menos de 1 turno — a espada pulsa com a memória do unicórnio que morreu por amor." },

  { tier:"unico", name:"Punho da Fênix — Luva-Arma",
    dmg:"1d10+1d8", req:"FOR/AGI", weight:0.5, defenseDegrade:1,
    slot:["primary","secondary"],
    story:"Não é uma arma comum. É uma luva forjada com penas de Fênix adulta tecidas em metal que não existe em catálogos de mineralogia. A pena central ainda arde — não queima a mão do portador, mas queima tudo o mais. O ferreiro que a fez não existe mais. Pergunta-se se era humano.",
    note:"Passivo: ataques causam +1d6 de dano de fogo extra. Passivo: ao ser reduzido a 0 HP, o portador não morre imediatamente — entra em Estado de Fênix por 1 turno (imóvel, mas vivo e intangível às chamas). No turno seguinte: ressurge com 35% HP e todos os aliados em raio 3 hex curam 1d8 HP (a ressurreição irradia). Pode ocorrer 1x por descanso longo. Ativo (1x/combate): o punho envolve-se em chamas absolutas — próximo soco causa 3d8 de fogo que ignora Def.Física e Mágica, e o alvo fica Queimando por 3 rodadas (1d8/rodada)." }];

const WEAPONS_TWO_HAND = [
  /* --- COMUNS --- */
  { tier: "comum", name: "Espada de Duas Mãos", dmg: "1d12 + 1d4", req: "FOR", weight: 7, defenseDegrade: null, slot: ["primary"], note: "Alto dano, sem defesa ativa.", heavyTwoHanded: true },
  { tier: "comum", name: "Machado Grande", dmg: "1d12 + 1d4", req: "FOR alto", weight: 9, defenseDegrade: null, slot: ["primary"], note: "Dano altíssimo.", heavyTwoHanded: true },
  { tier: "comum", name: "Martelo de Guerra", dmg: "1d10 + 1d4", req: "FOR", weight: 8, defenseDegrade: null, slot: ["primary"], note: "Bom contra armaduras pesadas.", heavyTwoHanded: true },
  { tier: "comum", name: "Lança", dmg: "1d10 + 1d4", req: "FOR/DEX", weight: 6, defenseDegrade: null, slot: ["primary"], note: "Alcance 2 hexágonos corpo a corpo.", heavyTwoHanded: true },
  { tier: "comum", name: "Alabarda", dmg: "1d10 + 1d6", req: "FOR", weight: 8, defenseDegrade: null, slot: ["primary"], note: "Alcance 2 hex; Ataques de Oportunidade a 2 hex.", heavyTwoHanded: true },
  { tier: "comum", name: "Foice de Guerra", dmg: "1d10 + 1d4", req: "FOR/AGI", weight: 6, defenseDegrade: null, slot: ["primary"], note: "Acerto Crítico atinge também um inimigo adjacente com 1d6.", heavyTwoHanded: true },

  /* --- RAROS --- */
  { tier: "raro", name: "Maul de Pedra Negra", dmg: "1d12 + 1d6 + 1d4", req: "FOR alto", weight: 12, defenseDegrade: null, slot: ["primary"],
    story: "Esculpido de um único bloco de obsidiana das Cavernas de Durrak, onde o calor do subsolo impregna a rocha com energia bruta. O primeiro golpe de cada combate sempre causa Atordoamento.",
    note: "Primeiro ataque do combate: o alvo perde 1 Ação no próximo turno (independente de acertar).", heavyTwoHanded: true },

  /* --- MÁGICOS --- */
  { tier: "magico", name: "Foice da Lua da Marca", dmg: "1d12 + 1d6 + 1d4", req: "FOR/AGI", weight: 6, defenseDegrade: null, slot: ["primary"],
    story: "Forjada sob a única Lua Vermelha que ocorre a cada 100 anos, quando o Deus Marcado ganha força suficiente para tingir o céu de carmesim. A foice corta não só a carne, mas o elo entre alma e corpo.",
    note: "Acerto Crítico: além de atingir um adjacente, aplica Maldição da Marca — alvo sofre 1d6 de dano no início de cada turno por 3 rodadas e não pode se curar enquanto Maldito.", heavyTwoHanded: true },


  /* --- MÁGICOS (novos) --- */
  { tier: "magico", name: "Báculo do Abismo Serpentino", dmg: "1d6", req: "INT/SAB", weight: 5, defenseDegrade: null, slot: ["primary"],
    story: "Criado nas profundezas de Serpentara a partir do vértice de uma caverna onde cobras sagradas de Jurgmund se reuniam para hibernar. O centro do báculo pulsa com veneno purificado.",
    note: "Magias de veneno conjuradas com este báculo adicionam +1d12. Uma vez por sessão: ao acertar um ataque, injeta Veneno do Abismo — 1d20 de dano distribuído por 5 rodadas.", heavyTwoHanded: true,
    charges: { max: 4, label: "Disparos", resetOn: "combate" },
    range: 4,
    effect: "Ação de Combate: gasta 1 Carga para disparar um raio de energia arcana a até 4 hex de distância. Dano: 1d6+INT. Sem Cargas restantes: a arma ainda pode ser usada em combate corpo a corpo pelo dano físico base.",
    note: "4 disparo(s) por combate. Dano: 1d6+INT, alcance 4 hex." },

  /* --- LENDÁRIOS (novos) --- */
  { tier: "lendario", name: "Malho do Trovão Petrificado", dmg: "1d12 + 1d12 + 1d6", req: "FOR alto", weight: 15, defenseDegrade: null, slot: ["primary"],
    story: "Um raio caiu no mesmo lugar por 40 dias consecutivos durante uma tempestade sobrenatural em Atrelon. Um anão encontrou o solo vitrificado e passou 10 anos moldando o martelo. A tormenta diz-se ter sido invocada pelo Lich das Montanhas como experimento.",
    note: "Ao acertar: cria uma onda de choque que empurra o alvo 2 hex e força todos os inimigos num raio de 2 hex a testar Resistência (difícil) ou cair prostrados. Dano de trovão +1d12 contra alvos usando armadura metálica.", heavyTwoHanded: true },


  /* --- RAROS/MÁGICOS: Ações de Magia e Combate (2M) --- */
  { tier: "raro", name: "Cajado do Trovador de Batalha", dmg: "1d6", req: "INT/SAB", weight: 3, defenseDegrade: null, slot: ["primary"], heavyTwoHanded: true,
    magicBonus: { spellActions: 1 },
    story: "Cajado que ecoa o som de batalha enquanto canaliza magia. Foi usado por um trovador-mago que compunha músicas durante os combates — e cada nota era uma magia.",
    note: "+1 Ação de Magia por rodada enquanto equipado. Todas as magias conjuradas com este cajado adicionam +1d4 ao efeito.",
    charges: { max: 3, label: "Disparos", resetOn: "combate" },
    range: 4,
    effect: "Ação de Combate: gasta 1 Carga para disparar um raio de energia arcana a até 4 hex de distância. Dano: 1d6+INT. Sem Cargas restantes: a arma ainda pode ser usada em combate corpo a corpo pelo dano físico base.",
    note: "3 disparo(s) por combate. Dano: 1d6+INT, alcance 4 hex." },
  { tier: "magico", name: "Báculo do Feiticeiro Guerreiro", dmg: "1d6", req: "INT/FOR", weight: 5, defenseDegrade: null, slot: ["primary"], heavyTwoHanded: true,
    magicBonus: { spellActions: 1, actions: 1 },
    story: "Criado para guerreiros que aprenderam magia com Arcath mas não queriam abrir mão do combate corpo a corpo. O báculo pode ser usado como arma ou como foco mágico — e o portador pode fazer os dois no mesmo turno.",
    note: "+1 Ação de Magia e +1 Ação de Combate por rodada. Permite conjurar e atacar corpo a corpo no mesmo turno sem penalidade.",
    charges: { max: 4, label: "Disparos", resetOn: "combate" },
    range: 4,
    effect: "Ação de Combate: gasta 1 Carga para disparar um raio de energia arcana a até 4 hex de distância. Dano: 1d6+INT. Sem Cargas restantes: a arma ainda pode ser usada em combate corpo a corpo pelo dano físico base.",
    note: "4 disparo(s) por combate. Dano: 1d6+INT, alcance 4 hex." },
  { tier: "lendario", name: "Lança do Herói Arqueiro — Réplica Enchanted", dmg: "1d12 + 1d10 + 1d4", req: "DEX/FOR", weight: 5, defenseDegrade: null, slot: ["primary"], heavyTwoHanded: true,
    magicBonus: { actions: 2 },
    story: "Réplica encantada da lança do Herói Arqueiro Ferrath. O original foi destruído na Batalha Colossal, mas forjadores de Arcath conseguiram recriar parte do encantamento estudando fragmentos encontrados nas planícies.",
    note: "+2 Ações de Combate e +1 Reação por rodada. Ataques com esta lança alcançam 3 hexágonos em corpo a corpo e 12 hexágonos como arma arremessada (retorna ao portador)." },

  /* ── Raros 2M com alto dano e desvantagens ── */
  { tier: "raro", name: "Alabarda do Vento Cortante", dmg: "1d12 + 1d10", req: "FOR/AGI", weight: 8, defenseDegrade: null, slot: ["primary"], heavyTwoHanded: true,
    story: "Lâmina em crescente que cria vácuo de ar ao girar. O giro é poderoso demais para ser controlado com precisão.",
    note: "⚠ Ataques atingem uma área de arco (até 2 inimigos adjacentes com uma Ação), mas o portador não pode usar Reações na rodada em que atacar com esta arma — o giro o desprotege completamente." },
  { tier: "raro", name: "Claymore do Colapso", dmg: "2d8 + 1d8", req: "FOR alto", weight: 10, defenseDegrade: null, slot: ["primary"], heavyTwoHanded: true,
    story: "Espada de duas mãos com lâmina que aumenta de peso ao descer — a inércia é brutal mas incontrolável.",
    note: "⚠ Após cada ataque (acerto ou erro), o portador move-se obrigatoriamente 1 hexágono na direção do alvo (sem custo de Ação, mas involuntário). Se houver parede/obstáculo, para. Se acertar, o alvo é Derrubado automaticamente além do dano." },
  { tier: "raro", name: "Bazão da Cobra Invertida", dmg: "1d12 + 1d8 + 1d4", req: "INT/SAB", weight: 4, defenseDegrade: null, slot: ["primary"], heavyTwoHanded: true,
    story: "Cajado de um sacerdote de Jurgmund que inverteu os rituais — canaliza veneno em vez de cura. O símbolo da cobra está de cabeça para baixo.",
    note: "⚠ Magias conjuradas com este cajado adicionam +1d8 de veneno ao dano ou +1d8 à cura. MAS uma vez por combate, ao rolar 1 natural em qualquer teste enquanto o cajado está equipado, o veneno vaza e o portador sofre 1d8 de veneno (não evitável)." },

  /* --- ÚNICOS --- */
  { tier: "unico", name: "Cajado da Tormenta", dmg: "1d6", req: "INT", weight: 5, defenseDegrade: null, slot: ["primary"],
    story: "Pertencia ao Lich das Montanhas de Atrelon, um necromante que fez um pacto com entidades do plano do gelo para estender sua vida além da morte. O cajado absorveu séculos de magia glacial e agora respira frio por conta própria. Quando o Lich foi derrotado, o cajado foi selado — mas nunca destruído.",
    uniqueAbility: "Nevasca de Atrelon (2x/dia, 1 Ação de Magia): cria uma nevasca que dura 5 turnos em TODO o campo de batalha. Durante a nevasca: todos os hexágonos se tornam Terreno Difícil (custo dobrado de Movimento), Chance de Acerto à distância recebe −1d4, e qualquer criatura que terminar seu turno na neve sem proteção sofre 1d6 de dano de frio.",
    note: "Conjura magias de frio sem gastar Slot de Magia. Passivo: o portador é imune a efeitos de frio e neve.", heavyTwoHanded: true,
    charges: { max: 5, label: "Disparos", resetOn: "combate" },
    range: 4,
    effect: "Ação de Combate: gasta 1 Carga para disparar um raio de energia arcana a até 4 hex de distância. Dano: 1d6+INT. Sem Cargas restantes: a arma ainda pode ser usada em combate corpo a corpo pelo dano físico base.",
    note: "5 disparo(s) por combate. Dano: 1d6+INT, alcance 4 hex." },
  /* --- SETS integrados --- */
  { tier: "magico", setName: "Cólera Arcana", name: "Cajado da Tempestade Arcana (Cólera Arcana)", dmg: "1d6", req: "INT", weight: 4, defenseDegrade: null, slot: ["primary"], heavyTwoHanded: true,
    story: "Derivado dos estudos sobre o Cajado da Tormenta do Lich de Atrelon. Replicação instável e perigosa — violento por natureza.",
    note: "Magias de área +1 hex de raio. Uma vez por sessão, ao errar uma magia, pode re-conjurar sem gastar Slot. SET — Cólera Arcana (1/3): Sobrecarga Elemental.",
    setBonus: { pieces: 3, ability: "Sobrecarga Elemental", effect: "Magia de dano Nv3+ ganha +1 dado extra do tipo maior que já usa. Você sofre 1d6 de retaliação arcana. (1x/batalha)" },
    charges: { max: 4, label: "Disparos", resetOn: "combate" },
    range: 4,
    effect: "Ação de Combate: gasta 1 Carga para disparar um raio de energia arcana a até 4 hex de distância. Dano: 1d6+INT. Sem Cargas restantes: a arma ainda pode ser usada em combate corpo a corpo pelo dano físico base.",
    note: "4 disparo(s) por combate. Dano: 1d6+INT, alcance 4 hex." },

  /* --- LENDÁRIOS: tema Aether --- */
  { tier: "lendario", name: "Malho dos Ossos de Magnalaga", dmg: "1d12 + 1d12 + 1d8", req: "FOR", weight: 14, defenseDegrade: null, slot: ["primary"], heavyTwoHanded: true,
    story: "Forjado a partir de um fragmento de osso que Magnalaga espontaneamente expeliu durante um mergulho. O anão Hrissa o reconheceu como sinal — levou 6 anos forjando. O martelo parece mais leve do que deveria e a superfície de contato muda de textura como pele viva.",
    note: "Ao acertar: onde o alvo impacta o chão ou parede, todos os inimigos em raio 2 hex testam Resistência (normal) ou ficam Prostrados. +1d8 de dano adicional contra construtos e criaturas com carapaça. Passivo: imune a efeitos de atordoamento por impacto." },

  { tier: "lendario", name: "Lança de Luz do Dragão Dourado", dmg: "1d12 + 1d10 + 1d6", req: "FOR/SAB", weight: 5, defenseDegrade: null, slot: ["primary"], heavyTwoHanded: true,
    story: "Segundo a lenda, a Xamã Erkha passou 30 dias meditando no topo do Vulcão de Karloth. No último dia, uma escama dourada rolou pela encosta até seus pés — e ela a fundiu em lança com a ajuda do Ferreiro Durn. O dragão nunca reclamou.",
    note: "Dano de luz: +1d6 de luz sagrada em cada acerto — causa dano dobrado contra criaturas do Deus Marcado, Araltos e mortos-vivos. Uma vez por dia: a lança emite um pulso de luz dourada (alcance 4 hex) que remove qualquer efeito de Corrupção ou Maldição da Marca de aliados na área." },

  /* --- ÚNICO: tema Aether --- */
  { tier: "unico", name: "Báculo do Crânio de Jurgmund", dmg: "1d6", req: "INT/SAB", weight: 5, defenseDegrade: null, slot: ["primary"], heavyTwoHanded: true,
    story: "Fragmento do próprio crânio de Jurgmund, moldado pelos primeiros Serpentarianos em forma de báculo. Pulsa com calor vivo e ocasionalmente emite sons que só quem empunha consegue ouvir — sussurros em língua de serpente que descrevem eventos que ainda não aconteceram.",
    uniqueAbility: "Profecia da Cobra (1x/sessão): ao conjurar uma magia, pode escolher ver o resultado antes de confirmar o gasto do Slot. Se o resultado não for satisfatório, pode cancelar a magia sem custo — mas fica Atordoado por 1 rodada pela sobrecarga profética. Não acumula com outras magias de visão.",
    note: "Magias de veneno e cobra conjuradas com este báculo adicionam +1d12. Imunidade completa a venenos enquanto equipado. Aliados em raio 3 hex ganham resistência a veneno (+1d4 de Defesa Mágica contra venenos).",
    charges: { max: 5, label: "Disparos", resetOn: "combate" },
    range: 4,
    effect: "Ação de Combate: gasta 1 Carga para disparar um raio de energia arcana a até 4 hex de distância. Dano: 1d6+INT. Sem Cargas restantes: a arma ainda pode ser usada em combate corpo a corpo pelo dano físico base.",
    note: "5 disparo(s) por combate. Dano: 1d6+INT, alcance 4 hex." },

  /* ── ÚNICOS AMALDIÇOADOS — Armas de 2M ── */
  { tier: "lendario", cursed: true,
    name: "Báculo da Explosão de Mana", dmg: "1d6", req: "INT alto", weight: 3,
    defenseDegrade: null, slot: ["primary"], heavyTwoHanded: true,
    story: "Criado por um mago que descobriu que HP é apenas mana condensada em carne. Usou o báculo durante 10 anos antes de morrer — não em batalha, mas de velhice precoce, com 34 anos de idade real mas aparência de 90. O báculo estava em perfeito estado ao seu lado.",
    note: "⚠ AMALDIÇOADA — Explosão de Mana: Ao conjurar a magia Explosão de Mana através deste báculo, o conjurador pode sacrificar HP permanentemente (não retorna com descanso — é HP máximo perdido para sempre). A cada 5 HP máx sacrificados, adiciona +1d20 de dano numa área 3x3 hex. Não há limite de sacrifício por conjuração. Se o conjurador chegar a 0 HP máx, morre instantaneamente e o báculo explode causando dano igual ao HP sacrificado em raio 10 hex.",
    curseDetails: "Localização: Torre do Arquimago Louco (Reinos de Akaen, dif.4). A magia Explosão de Mana só existe neste báculo — não pode ser aprendida por grimório.",
    charges: { max: 5, label: "Disparos", resetOn: "combate" },
    range: 4,
    effect: "Ação de Combate: gasta 1 Carga para disparar um raio de energia arcana a até 4 hex de distância. Dano: 1d6+INT. Sem Cargas restantes: a arma ainda pode ser usada em combate corpo a corpo pelo dano físico base.",
    note: "5 disparo(s) por combate. Dano: 1d6+INT, alcance 4 hex." },

  { tier: "unico", cursed: true,
    name: "Arco Celeste de Akaen", dmg: "2d10 + 1d8 + 1d4", req: "DEX/AGI", weight: 2,
    defenseDegrade: null, slot: ["primary"], heavyTwoHanded: true, range: 18,
    story: "Arco sem corda — as flechas aparecem de energia pura quando a intenção de disparar é formada. Pertenceu ao Arqueiro Herói Ferrath, que o usou para disparar a flecha que destruiu o núcleo do Deus Marcado. Mas o poder de criar flechas do nada vem de uma âncora: o portador doa seu movimento ao arco.",
    note: "⚠ AMALDIÇOADA — Ancorado: Não requer flechas e tem alcance 18 hex. MAS enquanto equipado, Movimento = 0 (o portador não pode se mover em combate de nenhuma forma — incluindo habilidades de movimento, empurrão involuntário ou qualquer deslocamento). Reações de movimento também são bloqueadas.",
    curseDetails: "Item único do Herói Ferrath. Localização: Arquivo Secreto dos Arcanistas de Akaen (dif.3). Para recuperá-lo é preciso resolver o enigma dos Cinco Marcos." },


  /* ── THURGOMUR (Divindade dos Anões — Deus da Forja e da Terra) ── */
  { tier: "ancestral", divine: "Thurgomur", race: "anão",
    name: "Martelo de Thurgomur — O Primeiro Golpe", dmg: "2d12 + 1d10", req: "FOR", weight: 12, defenseDegrade: null,
    slot: ["primary"], heavyTwoHanded: true,
    story: "O primeiro martelo que existiu — ou pelo menos os anões acreditam nisso. Thurgomur usou este martelo para bater a primeira pedra e criar as Montanhas de Atrelon. Depois o enterrou no núcleo da montanha como semente. Quando a Tartaruga Magnalaga absoveu a contaminação do Grande Lago, o vibração do processo fez o martelo subir à superfície pela primeira vez em 500 anos.",
    note: "🌟 DIVINO — Golpe da Criação: acertos com este martelo deixam marcas permanentes no campo de batalha — cada acerto cria um obstáculo de pedra de 1 hex (impassável, pode ser destruído com 20+ de dano). Passivo: o portador não pode ser movido contra sua vontade (raízes de pedra seguram). Uma vez por dia: 'Forja Divina' — toca um aliado e repara magicamente uma armadura ou arma quebrada E adiciona +1d6 de dano permanente a ela.",
    curseDetails: "Localização: Núcleo da Tartaruga Magnalaga (acessível apenas durante um mergulho de Magnalaga, dif.4). Os Anões do Casco são os guardiões — podem ser aliados ou obstáculos." },

  /* ── TOBI (Divindade dos Goblins — Deus da Travessura e Oportunidade) ── */
  { tier: "lendario", divine: "Tobi", race: "goblin",
    name: "Estilingue de Oportunidade de Tobi", dmg: "2d6 + 1d6", req: "DEX", weight: 0.5, defenseDegrade: null,
    slot: ["primary"], range: 10,
    story: "Tobi não é um deus sério. Ele é o que os goblins chamam de deus mas que todos os outros chamariam de 'problema'. O estilingue foi construído pelo Goblin Mais Sortudo que Existiu, que nunca teve mais que 3 moedas mas sempre aparecia com comida, informações valiosas e às vezes cavalos que claramente não eram seus. Tobi abençoou o estilingue porque achou graça.",
    note: "🌟 DIVINO — Oportunidade de Tobi: cada projétil disparado tem 25% de chance (1d4=1) de acertar TAMBÉM um segundo alvo aleatório no raio (Tobi sempre aproveita oportunidades). Passivo: ao usar Furtividade no mesmo turno, o dano é triplicado (sneak attack divino). Uma vez por sessão: 'Sorte do Goblin' — troca qualquer resultado de dado (seu ou do inimigo) por outro resultado à sua escolha.",
    curseDetails: "Localização: Toca do Goblin Mais Sortudo (qualquer cidade — Tobi move o item aleatoriamente entre sessões). O Mestre joga 1d6 no início de cada sessão para determinar onde está." },


  /* ══════════════════════════════════════════════════════════
     COMBOS DE SUBCLASSE — Armas de 2M
     ══════════════════════════════════════════════════════════ */

  /* ── SET: Voto de Aço e Luz (3 peças) — Paladino ── */
  { tier: "lendario", subclass: "paladino", setName: "Voto de Aço e Luz",
    name: "Martelo do Juramento (Voto de Aço e Luz)", dmg: "2d10 + 1d8", req: "FOR/SAB", weight: 9,
    defenseDegrade: null, slot: ["primary"], heavyTwoHanded: true,
    story: "Forjado num altar de Sanctum durante uma guerra que nunca deveria ter acontecido. O ferreiro era clérigo, o clérigo era guerreiro. O martelo carrega ambas as naturezas — esmaga como metal, queima como fé.",
    note: "Cada acerto adiciona +1d6 de dano sagrado. Se o portador tiver um juramento ativo (magia Juramento Sagrado): o bônus sobe para +1d8 e o alvo fica com −1 em resistências por 2 rodadas.",
    setBonus: { pieces: 3, ability: "Golpe do Juramento Cumprido",
      effect: "Com 3 peças: ao cumprir qualquer juramento durante o combate — o próximo acerto causa dano máximo em todos os dados + 3d8 sagrado extra e todos os aliados em raio 5 hex recuperam 1d10 HP." } },

  /* ── SET: Raiz e Ramo (3 peças) — Druida ── */
  { tier: "magico", subclass: "druida", setName: "Raiz e Ramo",
    name: "Cajado Raiz-Viva (Raiz e Ramo)", dmg: "1d6", req: "SAB/INT", weight: 3,
    defenseDegrade: null, slot: ["primary"], heavyTwoHanded: true,
    story: "Não foi forjado — cresceu. Um druida plantou o galho de uma árvore ancestral em solo sagrado e esperou 40 anos. Quando o retirou, a raiz ainda pulsava. Ainda pulsa.",
    note: "Ao conjurar Enredar ou Moldar Terreno: a área afetada aumenta em +1 hex em todas as direções. Ao invocar um animal: o animal invocado aparece com 1 nível de força extra (HP+10, dano +1d4).",
    setBonus: { pieces: 3, ability: "A Floresta Responde",
      effect: "Com 3 peças: 1x/combate como Ação Livre — o terreno em raio 6 hex torna-se favorável aos aliados (regen 2 HP/r, −2 Movimento inimigos, +1d4 nos testes de aliados). Dura 3 rodadas." },
    charges: { max: 4, label: "Disparos", resetOn: "combate" },
    range: 4,
    effect: "Ação de Combate: gasta 1 Carga para disparar um raio de energia arcana a até 4 hex de distância. Dano: 1d6+INT. Sem Cargas restantes: a arma ainda pode ser usada em combate corpo a corpo pelo dano físico base.",
    note: "4 disparo(s) por combate. Dano: 1d6+INT, alcance 4 hex." },

  /* ── SET: Fúria Encadeada (3 peças) — Berserker ── */
  { tier: "lendario", subclass: "berserker", setName: "Fúria Encadeada",
    name: "Machado Correntes (Fúria Encadeada)", dmg: "1d12 + 1d10 + 1d6", req: "FOR", weight: 10,
    defenseDegrade: null, slot: ["primary"], heavyTwoHanded: true,
    story: "Duas lâminas unidas por uma corrente de metal vivo — a corrente não foi fundida, cresceu. O forjador tentou separar as lâminas depois. Não conseguiu. Desistiu. Vendeu o par. O comprador descobriu que a corrente aumenta com a raiva do portador.",
    note: "Ataques com este machado podem acertar 2 alvos adjacentes com 1 Ação (a corrente estende o alcance). Em Fúria de Batalha: o bônus de +1d8 da Fúria se aplica a AMBOS os alvos do ataque duplo.",
    setBonus: { pieces: 3, ability: "Corrente Sem Fim",
      effect: "Com 3 peças: ao entrar em Fúria de Batalha, o efeito dura +2 rodadas extras. Ao sair da Fúria: pode escolher imediatamente entrar em Limiar da Morte (se a habilidade for conhecida) sem custo de ação." } },

,

  /* ─── SET: Lâmina das Runas — 3ª peça (Runa-Lâmina) ────────── */

  { tier: "lendario", name: "Greatsword das Runas Despertas", dmg: "1d12 + 1d10 + 1d4", req: "FOR", weight: 6,
    slot: ["primary"], defenseDegrade: 2, heavyTwoHanded: true,
    setName: "Lâmina das Runas", subclass: "runa-lamina",
    magicBonus: { attr: "FOR", attrValue: 1 },
    effect: "Runas gravadas nesta espada detonam em ÁREA (raio 2 hex) em vez de só no alvo atingido. +1 FOR enquanto equipada. Com set completo (Lâmina das Runas 3p): Fúria Arcana em raio 4 hex e Runas gratuitas por combate aumentam de 1 para 2.",
    note: "+1 FOR passivo. Runas explodem em área 2 hex. SET COMPLETO: +2 Runas gratuitas e Fúria Arcana raio 4.",
    story: "Encontrada num arsenal de Atrelon. As runas na lâmina mudavam ao ser tocadas — como se decidindo o que mostrar.",
    setBonus: "Lâmina das Runas (3p) — Detonação Total: Fúria Arcana atinge raio 4 hex; Runas gratuitas por combate = 2; ao entrar em Transcendência Rúnica: Runas ativas detonam gratuitamente." },

  /* ─── SET: Marca do Caçador — Caçador de Gigantes (guer+arq) 3p */

  { tier: "raro", name: "Lança do Abatimento", dmg: "1d10 + 1d6 + 1d4", req: "FOR", weight: 4.5,
    slot: ["primary"], defenseDegrade: 2,
    setName: "Marca do Caçador", subclass: "cacador-gigantes",
    effect: "Contra inimigos de tamanho Grande ou maior: causa +1d8 de dano extra e o alvo testa FOR (normal) ou perde 1 de Movimento por rodada (tendão cortado). Pode ser arremessada como alcance 5 hex (1 Ação, retorna na próxima rodada se no chão).",
    note: "Contra alvos Grandes+: +1d8 extra e reduz Movimento. Arremesso alcance 5 hex.",
    story: "Criada na tradição dos caçadores da Planície Sudeste. Ponta larga para maximizar o dano em estruturas grandes." },

  { tier: "lendario", name: "Maul do Gigante Caído", dmg: "2d8 + 1d8", req: "FOR", weight: 9,
    slot: ["primary"], defenseDegrade: 1, heavyTwoHanded: true,
    setName: "Marca do Caçador", subclass: "cacador-gigantes",
    magicBonus: { attr: "FOR", attrValue: 2 },
    effect: "Contra inimigos de tamanho Grande ou maior: dano TRIPLICADO no lugar de dobrado. +2 FOR passivo. Todo acerto contra inimigo Grande+ impõe −2 Def.Física por 2 rodadas (escamas, armadura ou ossos trincados). SET COMPLETO: Executar a Presa funciona com dano ×5 contra alvos Grandes+ abaixo de 50% HP.",
    note: "+2 FOR passivo. Contra Grandes+: dano ×3 e −2 Def.Física. SET COMPLETO: Executar dano ×5.",
    story: "Forjada com ossos de um Gigante das Pedras que morreu na Batalha Colossal. Pesa o suficiente para lembrar ao usuário que ele pode cair do mesmo jeito.",
    setBonus: "Marca do Caçador (3p) — Expertise de Abate: Anatomia de Besta revela ponto fraco automaticamente; Golpe de Abatimento custa 1 Fúria/Foco a menos; Executar a Presa causa dano ×5 contra alvos Grandes+ abaixo de 50% HP." },

  /* ─── INSPIRADOS EM ELDEN RING — Armas de 2 Mãos ────────────── */

  { tier: "lendario", name: "Martelo do Esmaga-Gigantes",
    dmg: "2d10+1d8", req: "FOR", weight: 14,
    slot: ["primary"], defenseDegrade: 1, heavyTwoHanded: true,
    magicBonus: { attr: "FOR", attrValue: 2 },
    effect: "Passivo: +2 FOR. Contra inimigos de tamanho Grande ou maior: dano TRIPLICADO e o alvo testea FOR (difícil) ou fica Derrubado e Atordoado por 1 rodada (perde todas as Ações). Contra inimigos de tamanho normal: dano normal mas o impacto força recuo de 2 hexes (FOR normal para resistir). Sem arma mais pesada no mundo — penalidade de −1 Ação de Combate permanente enquanto equipado.",
    note: "+2 FOR. Grandes+: dano ×3 + Derrubado e Atordoado. Normal: recua 2 hex. Penalidade: −1 Ação.",
    story: "Encontrado numa fortaleza de Gigantes das Pedras destruída na Grande Planície. Nenhum humano normal consegue levantá-lo. Quem consegue não precisa de mais nada." },

  { tier: "lendario", name: "Greatsword da Noite Negra",
    dmg: "1d12 + 1d10 + 1d6", req: "FOR", weight: 7,
    slot: ["primary"], defenseDegrade: 2, heavyTwoHanded: true,
    magicBonus: { attr: "FOR", attrValue: 1 },
    effect: "Passivo: +1 FOR. Ativo (custa 2 Fúria ou 2 MP): Onda de Trevas — aceno horizontal que lança projétil de energia sombria em linha reta de 6 hexes, atingindo TODOS no caminho. Dano: 2d8+FOR de dano sombrio (ignora Def.Física). Cada alvo testea Força de Vontade (normal) ou perde 1 Ação no próximo turno. 3 usos/combate.",
    note: "+1 FOR. Onda de Trevas: linha 6 hex, todos os alvos, 2d8+FOR sombrio, possível perda de Ação.",
    story: "Esculpida da pedra negra de uma cratera que caiu do céu há 300 anos. A pedra nunca esquentou mesmo após séculos. A espada também não. Quem a carrega sente um frio específico — não no corpo. Nos pensamentos." },

  { tier: "ancestral", name: "Lança do Pai dos Dragões",
    dmg: "2d10 + 1d10 + 1d6", req: "FOR", weight: 8,
    slot: ["primary"], defenseDegrade: 2, heavyTwoHanded: false,
    magicBonus: { attr: "FOR", attrValue: 2, attr2: "SAB", attrValue2: 1 },
    effect: "Passivo: +2 FOR. Ativo (custa 4 Fúria ou 4 Fé, 1 uso/combate): Chama do Ancestral — o portador ergue a lança e dela emerge chama dracônica. Todos os inimigos em raio 5 hex sofrem 4d10+FOR de dano de fogo. AGI (difícil) para metade. Após a chama: o portador ganha 2 Ações de Combate adicionais neste turno (adrenalina dracônica). Após o combate: portador fica Exausto (−1 Ação) por 1 hora.",
    note: "+2 FOR. Chama do Ancestral: raio 5 hex, 4d10+FOR, AGI difícil p/ metade. +2 Ações pós-chama. Exausto após.",
    story: "A lança que Tharak, o Dracônico Vermelho Adulto, guardava mesmo doente e sofrendo. Não é sua — ele a guarda para o verdadeiro dono. Quando questionado sobre quem seria, Tharak fecha os olhos e não responde." },

  { tier: "lendario", name: "Claíde dos Irmãos Gêmeos",
    dmg: "1d12 + 1d10 + 1d4", req: "FOR", weight: 6.5,
    slot: ["primary"], defenseDegrade: 2, heavyTwoHanded: true,
    effect: "Passivo situacional: ao matar um inimigo com esta arma, o próximo ataque (no mesmo turno ou no seguinte) tem Chance de Acerto +2 e causa +1d8 de dano (o segundo irmão acorda). Se o segundo ataque também matar: ambos os irmãos estão desperados — todos os ataques até o fim da rodada ganham +2d6. Ao errar um ataque: perde o bônus acumulado (o irmão morto recolhe o outro).",
    note: "Matar inimigo: +2 Acerto e +1d8. Segunda morte no turno: +2d6 em todos até fim da rodada. Erro: perde tudo.",
    story: "Dois irmãos forjaram uma espada só porque não conseguiam decidir qual seria o verdadeiro dono. A solução foi simples: nenhum dos dois. A espada escolhe quem a usa — e espera que seja alguém que entenda que duas mãos são mais eficientes que uma." },

  { tier: "lendario", name: "Machado da Ruína Eterna",
    dmg: "2d8 + 1d10 + 1d4", req: "FOR", weight: 9,
    slot: ["primary"], defenseDegrade: 1, heavyTwoHanded: true,
    magicBonus: { attr: "FOR", attrValue: 2 },
    effect: "Passivo: +2 FOR. Passivo de escalada: cada acerto consecutivo no mesmo alvo (sem errar, sem trocar de alvo) aumenta o dano em +1d6 acumulado (máx +3d6 = 4º acerto em diante). Ao errar ou trocar de alvo: o acúmulo reseta. Ativo (custa 3 Fúria): Ruína — golpe no chão que cria fissura em linha reta de 4 hexes, 2d10 de dano, todos testam AGI (normal) ou caem Derrubados.",
    note: "+2 FOR. Acertos consecutivos: +1d6 por acerto (máx +3d6). Ruína: fissura 4 hex, 2d10, Derrubado.",
    story: "Usada pelo último General do Exército da Ruína — uma força que ninguém nomeia mais. O General foi derrotado mas o machado não. Tem a habilidade disconcertante de estar levemente mais pesado cada dia que passa." },

  /* ─── LOOT DE MONSTROS — ARMAS 2M ────────────────────── */

  { tier:"raro", name:"A Espada do Gigante Caído",
    dmg:"1d12 + 1d6 + 1d4", req:"FOR alto", weight:9,
    defenseDegrade:1, slot:["primary"],
    effect:"Arma descomunal arrancada das costas de uma Aranha dos Túmulos. Já encantada com Toxina do Túmulo — acertos têm 30% de chance (d10 ≤ 3) de aplicar Veneno do Túmulo (1d8/rodada, 3 rodadas, SAB difícil para resistir, antídoto comum não funciona). Impossível de encobrir — todos veem que você a carrega.",
    note:"30% de Veneno do Túmulo por acerto. Req. FOR alto (≥3). Loot: Aranha dos Túmulos de Gigantes.",
    story:"Pertenceu a um gigante que nunca foi identificado. A aranha carregava como troféu. Agora você carrega." },

  { tier:"raro", name:"Corrente do Guardião",
    dmg:"1d10 + 1d6", req:"FOR", weight:6,
    defenseDegrade:1, slot:["primary"],
    effect:"Alcance de 3 hex (corrente de ferro antigo de 4 metros). Críticos aplicam Acorrentado no alvo (Imóvel, −2 Ações, FOR normal para escapar com 1 Ação). Não pode ser encantada — o ferro antigo rejeita magia nova.",
    note:"Alcance 3 hex. Crítico → Acorrentado. Não encantável. Loot: Guardião das Correntes.",
    story:"O Guardião nunca largou essas correntes em vida. E em morte, também não quis." },

  /* ─── ARMAS DE ORC — 2 MÃOS ─────────────────────────────────── */

  /* COMUNS */
  { tier:"comum", name:"Machadão de Guerra Orc",
    dmg:"1d12+1d6", req:"FOR", weight:9, defenseDegrade:null,
    slot:["primary"], heavyTwoHanded:true,
    note:"Machado de dois gumes forjado à mão em forja de clã. Desbalanceado para qualquer não-orc, mas eficaz com força bruta. Não-orcs com FOR < 2: −1 Ação adicional de penalidade." },

  { tier:"comum", name:"Poste de Osso Gigante",
    dmg:"1d10+1d6", req:"FOR", weight:8, defenseDegrade:null,
    slot:["primary"], heavyTwoHanded:true,
    note:"Fêmur de gigante jovem transformado em arma de guerra. Usado por orcs mais jovens como prova de força. Acertos derrubam alvos de tamanho médio ou menor (FOR normal para resistir)." },

  { tier:"comum", name:"Lança de Assalto Orc",
    dmg:"1d10+1d4", req:"FOR/DEX", weight:5, defenseDegrade:null,
    slot:["primary"],
    note:"Lança longa de carvalho com ponta de ferro bruto. Alcance 3 hex. Usada em cargas de infantaria orc — quando em formação com 2+ aliados: +1d4 de dano." },

  /* RAROS */
  { tier:"raro", name:"Grande Machado do Clã Dente de Ferro",
    dmg:"1d12+1d8+1d4", req:"FOR alto", weight:12, defenseDegrade:null,
    slot:["primary"], heavyTwoHanded:true,
    story:"O Clã Dente de Ferro forja seus machados de clã com o ferro das correntes que quebraram durante a Grande Libertação. Cada machado carrega o peso de uma geração.",
    note:"Req. FOR alto (≥3). Ao acertar: alvo testa FOR (difícil) ou perde 1 Ação no próximo turno (o impacto desequilibra). Em Crítico: o alvo é automaticamente Derrubado sem teste." },

  { tier:"raro", name:"Maul de Crânio Triplo",
    dmg:"2d8+1d6", req:"FOR alto", weight:14, defenseDegrade:null,
    slot:["primary"], heavyTwoHanded:true,
    story:"Três crânios de ogro fundidos em metal de clã e montados num cabo de osso de dragão. Cada crânio representa um clã subjugado. Pesa o equivalente a uma criança.",
    note:"Req. FOR alto (≥3). Ataques causam dano em área 1 hex — alvos adjacentes ao alvo principal sofrem metade do dano (AGI normal para evitar). Imune a ser desarmado." },

  { tier:"raro", name:"Lança Envenenada do Caçador Orc",
    dmg:"1d10+1d8", req:"FOR/DEX", weight:6, defenseDegrade:null,
    slot:["primary"],
    story:"Caçadores orc de elite empenam suas lanças com glândulas de víboras das Planícies Vermelhas. O veneno não mata — paralisa. Um alvo imóvel é presa fácil.",
    note:"Alcance 3 hex. Acertos aplicam Veneno do Caçador: alvo testa FOR (normal) ou perde 1 Ação no próximo turno por 2 rodadas. 3 aplicações por combate (sem recarga durante o combate)." },

  /* MÁGICOS */
  { tier:"magico", name:"Fúria do Warchief — Alabarda Orc",
    dmg:"1d12+1d10+1d4", req:"FOR alto", weight:10, defenseDegrade:null,
    slot:["primary"], heavyTwoHanded:true,
    magicBonus:{ attr:"FOR", attrValue:1 },
    story:"Forjada pelo xamã Drak'ul com ferro vulcânico e sangue do próprio Warchief. A arma grita em orc quando balançada — um grito de guerra que corta o silêncio antes do impacto.",
    note:"+1 FOR enquanto equipada. Req. FOR alto (≥3). Passivo: aliados em raio 2 hex com menos HP que o portador ganham +1d4 de dano (o Warchief protege os mais fracos). Ativo (2x/combate): golpe com grito de guerra — +2d6 de dano extra e alvo testa SAB (difícil) ou fica Aterrorizado por 1 rodada." },

  { tier:"magico", name:"Destruidor de Fortalezas",
    dmg:"2d8+1d8", req:"FOR alto", weight:15, defenseDegrade:null,
    slot:["primary"], heavyTwoHanded:true,
    magicBonus:{ hp:15 },
    story:"Maul orc usado na derrubada de três fortalezas durante a Guerra dos Clãs. Encantado para ignorar estruturas — e eventualmente também ignorou a distinção entre estrutura e armadura.",
    note:"+15 HP máximo enquanto equipado. Req. FOR alto (≥3). Ataques contra alvos com Def.Física ≥ 5: ignora metade da Def.Física (o maul foi feito para quebrar muros). Ativo (1x/combate): golpe de demolição — 3d10 de dano que ignora TODA a Def.Física do alvo." },

  /* ── ARMAS DE 2 MÃOS SERPENTARIANAS ─────────────────────────── */

  /* COMUNS */
  { tier:"comum", name:"Lança Cerimonial Serpentariana",
    dmg:"1d10+1d4", req:"FOR/DEX", weight:4, defenseDegrade:null,
    slot:["primary"],
    note:"Lança de madeira sagrada de Serpentara com ponta de osso de cobra-rainha endurecido. Usada em paradas e cerimônias, mas perfeitamente funcional em batalha. Alcance 2 hex. O fuste tem entalhes rúnicos que sussurram em sibilante." },

  { tier:"comum", name:"Bastão do Iniciado de Jurgmund",
    dmg: "1d6", req:"SAB/INT", weight:2, defenseDegrade:null,
    slot:["primary"],
    note:"Bastão de osso de cobra-rainha usado pelos iniciados nos rituais de Jurgmund antes de ascender ao posto de sacerdote. Conta como cajado para efeitos de magia (+1 Slot enquanto equipado). Levemente vibrante ao toque de quem tem SAB ≥ 2.",
    charges: { max: 2, label: "Disparos", resetOn: "combate" },
    range: 4,
    effect: "Ação de Combate: gasta 1 Carga para disparar um raio de energia arcana a até 4 hex de distância. Dano: 1d6+INT. Sem Cargas restantes: a arma ainda pode ser usada em combate corpo a corpo pelo dano físico base.",
    note: "2 disparo(s) por combate. Dano: 1d6+INT, alcance 4 hex." },

  /* RAROS */
  { tier:"raro", name:"Alabarda da Guarda Real Serpentariana",
    dmg:"1d12+1d8+1d4", req:"FOR/DEX", weight:7, defenseDegrade:null,
    slot:["primary"],
    story:"Usada exclusivamente pela Guarda Real do Rei Vassk. Cada unidade tem apenas doze lançadores — e cada um sabe o nome dos outros onze. Quando um morre, a alabarda é fundida e reforjada em uma nova pela Guarda restante.",
    note:"Alcance 3 hex. Ao matar um alvo com esta arma: todos os inimigos que viram o abate testam SAB (normal) ou ficam Abalados por 1 rodada (a execução precisa é intimidante). Em formação com outro portador desta arma: +1d8 de dano (a Guarda é treinada para batalhar em par)." },

  { tier:"raro", name:"Cajado do Sacerdote Maior",
    dmg: "1d6", req:"SAB/INT", weight:3, defenseDegrade:null,
    slot:["primary"],
    story:"Dado ao sacerdote que completa dez anos de serviço em Serpentara. Feito de vértebra de Cobra-Rainha empilhadas e fundidas com resina sagrada — flexível como cobra, rígido como doutrina.",
    note:"Conta como cajado mágico (+2 Slots enquanto equipado). Magias lançadas com este cajado custam −1 MP (mínimo 1). Ativo (2x/combate): Benção de Jurgmund — todos os aliados em raio 3 hex curam 1d6+SAB HP e ficam imunes a veneno por 2 rodadas.",
    charges: { max: 3, label: "Disparos", resetOn: "combate" },
    range: 4,
    effect: "Ação de Combate: gasta 1 Carga para disparar um raio de energia arcana a até 4 hex de distância. Dano: 1d6+INT. Sem Cargas restantes: a arma ainda pode ser usada em combate corpo a corpo pelo dano físico base.",
    note: "3 disparo(s) por combate. Dano: 1d6+INT, alcance 4 hex." },

  /* MÁGICOS */
  { tier:"magico", name:"Cajado do Oráculo dos Profundos",
    dmg: "1d6", req:"SAB/INT", weight:3, defenseDegrade:null,
    slot:["primary"],
    magicBonus:{ attr:"SAB", attrValue:2, attr2:"INT", attrValue2:1, spellActions:1, slots:2 },
    story:"Forjado com a vértebra da espinha dorsal da Serpente Imortal de Jurgmund — uma das três retiradas durante o sonho sagrado. O cajado não pertence a nenhum oráculo; ele escolhe o oráculo. Quando o portador morre, o cajado some.",
    note:"+2 SAB, +1 INT, +1 Ação de Magia, +2 Slots enquanto equipado. Magias de veneno ou serpente lançadas com este cajado têm dano dobrado. Passivo: o portador sente qualquer serpente em raio 20 hex e pode comunicar intenção simples a elas. Ativo (1x/sessão): Oráculo de Jurgmund — a serpente no cajado sussurra uma verdade sobre o futuro imediato (o Mestre revela algo sobre o próximo encontro ou decisão).",
    charges: { max: 4, label: "Disparos", resetOn: "combate" },
    range: 4,
    effect: "Ação de Combate: gasta 1 Carga para disparar um raio de energia arcana a até 4 hex de distância. Dano: 1d6+INT. Sem Cargas restantes: a arma ainda pode ser usada em combate corpo a corpo pelo dano físico base.",
    note: "4 disparo(s) por combate. Dano: 1d6+INT, alcance 4 hex." },

  { tier:"magico", name:"Lança Sagrada de Serpentara",
    dmg:"1d12+1d10+1d6", req:"FOR/SAB", weight:5, defenseDegrade:null,
    slot:["primary"],
    magicBonus:{ attr:"FOR", attrValue:1, attr2:"SAB", attrValue2:1 },
    story:"Uma das doze lanças sagradas mantidas no altar principal de Serpentara, usadas nas grandes caçadas sagradas. Cada uma tem o nome de uma das doze cobras-guardiãs fundadoras gravado na haste.",
    note:"+1 FOR, +1 SAB enquanto equipada. Alcance 3 hex. Acertos aplicam Veneno Sagrado: 1d8/rodada por 3 rodadas, imune a antídotos — mas aliados do portador podem curar com Cura Mágica. Críticos: a lança vibra com energia divina — +2d8 sagrado e o alvo fica Marcado por Jurgmund (serpentes aliadas têm +3 Chance de Crítico contra ele pelo restante do combate)." },

  /* ── ARMAS DE 2 MÃOS ÉLFICAS ─────────────────────────────────── */

  /* LENDÁRIO */
  { tier:"lendario", divine:"Aethea", race:"elfo",
    name:"Arco da Última Canção de Aethea",
    dmg:"1d12+1d10+1d6", req:"DEX alto", weight:2, defenseDegrade:null,
    slot:["primary"],
    story:"Aethea cantou enquanto os elfos eram escorraçados. Esta foi a última canção antes do silêncio — e o arco foi feito da madeira da árvore sob a qual ela cantou. A madeira ainda ressoa. Quem o tensiona ouve um fragmento da canção.",
    effect:"Passivo: não precisa de flechas — projéteis de luz são criados ao tensionar (infinitos). Projéteis de luz ignoram cobertura física (passam por paredes finas, sombras, obstáculos). +1 Chance de Crítico. Ativo (2x/combate): A Última Canção — dispara uma nota de luz em linha reta ilimitada que atinge TODOS os alvos no caminho. Cada alvo sofre 2d10+DEX de dano de luz (AGI difícil para metade). Aliados na linha são excluídos automaticamente.",
    note:"Projéteis infinitos de luz, ignoram cobertura. +1 Crit. 2x: linha ilimitada, todos os alvos, 2d10+DEX." },

  { tier:"lendario", divine:"Aethea", race:"elfo",
    name:"Cajado das Eras — Memória de Akaen",
    dmg: "1d6", req:"INT/SAB", weight:2.5, defenseDegrade:null,
    slot:["primary"],
    magicBonus:{ attr:"INT", attrValue:2, attr2:"SAB", attrValue2:1, spellActions:1, slots:3 },
    story:"O cajado de Akaen — o maior mago-arquiteto da civilização élfica, que desenhou as cidades que os escravizadores apagaram. Ele gravou nele toda a sua memória antes de morrer. O cajado lembra Akaen. Às vezes, Akaen fala através dele.",
    effect:"Passivo: +2 INT, +1 SAB, +1 Ação de Magia, +3 Slots. Magias de nível 1–3 lançadas com este cajado não consomem Slots (Akaen as conhece de cor). Passivo: o cajado sussurra estratégias — uma vez por turno como Ação Livre, o portador pode perguntar ao cajado sobre uma criatura visível e receber seu HP aproximado, imunidades e ponto fraco (o Mestre responde com precisão). Ativo (1x/combate): Arquitetura Arcana — cria estrutura de força mágica de até 6×6 hex (parede, plataforma, teto) que dura 5 rodadas. Inquebrável por meios físicos.",
    note:"+2 INT, +1 SAB, +1 Ação Magia, +3 Slots. Nv.1-3 grátis. Sussurro de Akaen: HP/imunidades/fraqueza. 1x: estrutura 6×6 hex.",
    charges: { max: 5, label: "Disparos", resetOn: "combate" },
    range: 4,
    effect: "Ação de Combate: gasta 1 Carga para disparar um raio de energia arcana a até 4 hex de distância. Dano: 1d6+INT. Sem Cargas restantes: a arma ainda pode ser usada em combate corpo a corpo pelo dano físico base.",
    note: "5 disparo(s) por combate. Dano: 1d6+INT, alcance 4 hex." },

  /* ANCESTRAL */
  { tier:"ancestral", divine:"Aethea", race:"elfo",
    name:"Espada Longa dos Primeiros Elfos",
    dmg:"1d12+1d10+1d8", req:"DEX/INT", weight:3, defenseDegrade:0,
    slot:["primary"],
    magicBonus:{ attr:"DEX", attrValue:2, attr2:"INT", attrValue2:2, critChance:2, dodge:2 },
    story:"Não tem nome em nenhuma língua viva. Os elfos que a forjaram usavam um idioma que não existe mais — destruído com eles. A lâmina tem entalhes que nenhum estudioso conseguiu decifrar. Aethea disse uma vez que a espada tem nome próprio. Ela não revelou qual.",
    effect:"Passivo: +2 DEX, +2 INT, +2 Chance de Crítico, +2 Chance de Esquiva. Ataques com esta espada nunca degradam a Chance de Esquiva do portador (como escudo). Passivo: ao esquivar perfeitamente (rolar 1 no d20), o portador pode realizar 1 ataque gratuito imediato no atacante (a elegância élfica transforma esquiva em contraataque). Ativo (1x/combate): Memória dos Primeiros — a espada libera toda a memória dos elfos que a usaram. Por 3 rodadas, o portador tem +4 Chance de Crítico, +4 Chance de Esquiva, e todos os seus ataques ignoram a metade da Def.Física.",
    note:"+2 DEX/INT, +2 Crit/Esquiva. Sem degrade. Esquiva perfeita → contraataque. 1x: +4 Crit/Esquiva, ignora metade def por 3 rodadas." },

  { tier:"ancestral", divine:"Aethea", race:"elfo",
    name:"Arco Estelar de Aethea — Original",
    dmg:"2d10+1d10+1d8", req:"DEX alto", weight:2, defenseDegrade:null,
    slot:["primary"],
    magicBonus:{ attr:"DEX", attrValue:3, critChance:2, dodge:1 },
    story:"Existe apenas um. O Arco Celeste de Akaen é uma réplica imperfeita deste. Aethea o carregava antes de se tornar deusa — era seu arco de caça quando ainda era mortal. Cada entalhe é uma memória de um animal caçado, uma pessoa amada, um céu visto. Ela o entregou ao último elfo primordial antes de ascender. Ele o enterrou em vez de usá-lo. Foi encontrado vazio.",
    effect:"Passivo: +3 DEX, +2 Chance de Crítico, +1 Chance de Esquiva. Projéteis infinitos de luz élfica — atravessam cobertura, muros finos e invisibilidade. Passivo: em noite aberta, todos os ataques com este arco têm Acerto Automático (d10 não é necessário — Aethea guia cada flecha). Ativo (1x/sessão): Chuva de Estrelas de Aethea — dispara 12 flechas de luz simultaneamente em alvos à escolha em raio 15 hex. Cada flecha causa 1d12+DEX de dano de luz e ignora toda defesa. O portador escolhe a distribuição.",
    note:"+3 DEX, +2 Crit, +1 Esquiva. À noite: acerto automático. 1x/sessão: 12 flechas, 1d12+DEX cada, ignora toda defesa." },

  /* ── ARMAS DE 2 MÃOS MÍTICAS ────────────────────────────────── */

  { tier:"raro", name:"Porrete de Crânio de Urso-Coruja",
    dmg:"1d12+1d8", req:"FOR", weight:9, defenseDegrade:null,
    slot:["primary"], heavyTwoHanded:true,
    story:"O Urso-Coruja é uma criatura impossível que não deveria existir biologicamente. Nenhum bestiarista conseguiu explicar por que existe. O crânio, igualmente impossível — parte osso de urso, parte cartilagem de coruja — é mais resistente que aço. Este porrete foi feito por um caçador que simplesmente achou o crânio no meio da floresta. Sem corpo. Sem rastro.",
    note:"Req: FOR ≥ 1. Acertos causam dano concussivo — alvo testa FOR (normal) ou fica Atordoado por 1 rodada (perde 1 Ação). Passivo: os olhos do crânio ainda veem (magicamente) — o portador tem Percepção automática em raio 5 hex e não pode ser surpreendido enquanto segura o porrete com as duas mãos. Críticos: o alvo fica Derrubado E Atordoado simultaneamente (o impacto é de outra ordem de grandeza)." },

  { tier:"raro", name:"Lança da Sereia — Espinha Dorsal",
    dmg:"1d10+1d8", req:"DEX/AGI", weight:3, defenseDegrade:null,
    slot:["primary"],
    story:"A espinha dorsal de uma Sereia-Guerreira que escolheu se tornar arma em vez de morrer na costa. O processo foi voluntário — as Sereias-Guerreiras não morrem de velhice, elas se transformam. A espinha mantém a flexibilidade do ser vivo e a rigidez do osso simultaneamente.",
    note:"Alcance 2 hex (a espinha é longa e curva). Passivo: em combate em água ou chuva intensa, todos os ataques com esta lança têm +1 Chance de Acerto e +1d6 de dano extra (a Sereia reconhece o elemento). Ativo (2x/combate): a lança emite um som subsônico — todos os inimigos em raio 4 hex testam SAB (normal) ou ficam Abalados por 2 rodadas (o Canto da Sereia ainda mora na espinha)." },

  { tier:"magico", name:"Cajado da Cauda de Quimera",
    dmg: "1d6", req:"INT/FOR", weight:5, defenseDegrade:null,
    slot:["primary"],
    magicBonus:{ attr:"INT", attrValue:1, spellActions:1 },
    story:"A cauda de uma Quimera é a parte mais esquecida da criatura — todos falam sobre as três cabeças. A cauda, porém, tem um veneno próprio diferente dos três pescoços, e mantém a energia das três naturezas (leão, cabra, serpente) em equilíbrio tenso. Este cajado foi feito por um alquimista que passou cinco anos tentando entender esse equilíbrio. Ele parou de tentar e simplesmente fez o cajado.",
    note:"+1 INT, +1 Ação de Magia. Passivo: magias de elementos diferentes (fogo, gelo, raio, veneno) lançadas com este cajado têm +1d6 de dano extra (a Quimera é três naturezas — aprecia variedade). Ativo (3x/combate): a cauda ativa uma das três naturezas aleatoriamente — role d6: 1-2 Rugido de Leão (2d6 de dano físico em cone 3 hex), 3-4 Cuspe da Cabra (alvo recebe −2 DEX por 2 rodadas), 5-6 Veneno da Serpente (1d8/rodada por 3 rodadas, SAB difícil).",
    charges: { max: 4, label: "Disparos", resetOn: "combate" },
    range: 4,
    effect: "Ação de Combate: gasta 1 Carga para disparar um raio de energia arcana a até 4 hex de distância. Dano: 1d6+INT. Sem Cargas restantes: a arma ainda pode ser usada em combate corpo a corpo pelo dano físico base.",
    note: "4 disparo(s) por combate. Dano: 1d6+INT, alcance 4 hex." },

  { tier:"lendario", name:"Mandíbula do Leviatã — Machado Duplo",
    dmg:"1d12+1d10+1d8", req:"FOR alto", weight:11, defenseDegrade:null,
    slot:["primary"], heavyTwoHanded:true,
    story:"Dois dentes da mandíbula superior de um Leviatã adulto, montados em paralelo num cabo de osso de baleia. O Leviatã não foi morto — perdeu esses dentes numa batalha contra outro Leviatã, e eles afundaram. Foram encontrados no fundo do mar por mergulhadores que não conseguem explicar como chegaram tão fundo e voltaram.",
    note:"Req. FOR alto (≥3). Ataques com este machado causam impacto de pressão — como uma mandíbula fechando. Cada acerto aplica 1 carga de Pressão do Leviatã. Com 3 cargas: o alvo sofre 2d10 de dano instantâneo que ignora toda defesa (a pressão acumulada colapsa). Passivo: o portador não afoga e pode respirar normalmente sob água (os dentes trazem o oceano consigo). Ativo (1x/combate): o machado emite onda de pressão em raio 4 hex — todos os alvos sofrem 1d12 de dano e testam FOR (difícil) ou são empurrados 3 hex para longe (o oceano expulsa)." },

  { tier:"unico", name:"Grande Machado de Crânio de Dragão Branco",
    dmg:"2d10+1d10+1d8", req:"FOR alto", weight:14, defenseDegrade:null,
    slot:["primary"], heavyTwoHanded:true,
    story:"O crânio completo de um Dragão Branco adulto montado num cabo de vértebra do mesmo dragão. O artesão que o fez era um anão que passou vinte anos caçando apenas este dragão específico, que havia destruído seu clã. Quando finalmente o matou, não sabia mais o que fazer. Fez isso. Há marcas no crânio de onde o anão bateu repetidas vezes mesmo depois de morto.",
    note:"Req. FOR alto (≥3). Ataques emitem gelo: +1d8 de dano de gelo extra. Cada acerto aplica 1 carga de Gelo Dragônico. Com 3 cargas: o alvo é Congelado por 2 rodadas (Imóvel, +50% dano físico). Passivo: imune ao frio e a ataques de gelo enquanto empunhado. Passivo: o crânio ainda ruge silenciosamente — intimidação automática em Dif.1 e 2 sem teste (eles simplesmente recuam). Ativo (1x/combate): Sopro de Crânio — o crânio emite Sopro de Gelo do Dragão em cone 8 hex, 3d10 de gelo que ignora Def.Física. Alvos que falhem em AGI (difícil) ficam Congelados." }];

const WEAPONS_MAGIC = [
  /* --- COMUNS --- */
  { tier: "comum", name: "Cajado de Batalha", dmg: "1d6", req: "INT", weight: 4, defenseDegrade: null, slot: ["primary"], note: "Conjura sem penalidade.", heavyTwoHanded: true,
    charges: { max: 2, label: "Disparos", resetOn: "combate" },
    range: 4,
    effect: "Ação de Combate: gasta 1 Carga para disparar um raio de energia arcana a até 4 hex de distância. Dano: 1d6+INT. Sem Cargas restantes: a arma ainda pode ser usada em combate corpo a corpo pelo dano físico base.",
    note: "2 disparo(s) por combate. Dano: 1d6+INT, alcance 4 hex." },
  { tier: "comum", name: "Varinha", dmg: "1d4", req: "INT/SAB", weight: 1, defenseDegrade: 2, slot: ["primary","secondary"], note: "Canaliza magias menores.",
    charges: { max: 2, label: "Disparos", resetOn: "combate" },
    range: 4,
    effect: "Ação de Combate: gasta 1 Carga para disparar um raio de energia arcana a até 4 hex de distância. Dano: 1d6+INT. Sem Cargas restantes: a arma ainda pode ser usada em combate corpo a corpo pelo dano físico base.",
    note: "2 disparo(s) por combate. Dano: 1d6+INT, alcance 4 hex." },
  { tier: "comum", name: "Grimório de Combate", dmg: "—", req: "INT", weight: 2, defenseDegrade: 2, slot: ["secondary"], note: "+1 Slot de Magia enquanto equipado." },
  { tier: "comum", name: "Orbe Arcano", dmg: "1d4", req: "INT/SAB", weight: 1, defenseDegrade: 2, slot: ["secondary"], note: "+1d4 em testes de Arcanismo enquanto equipado." },

  /* --- MÁGICOS --- */
  { tier: "magico", name: "Cetro da Cobra Dourada", dmg: "1d6 + 1d4", req: "INT/SAB", weight: 2, defenseDegrade: 2, slot: ["primary","secondary"],
    story: "Moldado por sacerdotes de Jurgmund a partir da muda de uma cobra sagrada. A cada ano, a escama cobre da empunhadura se renova, e o cetro fica levemente mais poderoso.",
    note: "Magias conjuradas com este cetro adicionam +1d4 de dano. Uma vez por sessão, ao conjurar uma magia de cura, a cura é dobrada." },

  /* --- LENDÁRIOS --- */
  { tier: "lendario", name: "Bastão das Entranhas do Mundo", dmg: "1d6", req: "INT/SAB", weight: 4, defenseDegrade: null, slot: ["primary"],
    story: "Encontrado nas profundezas abaixo de Serpentara, onde o calor da terra se mistura com a energia primordial de Jurgmund. Os anéis de cobra que formam seu cabo nunca param de se mover levemente — como se estivessem vivos.",
    note: "Passivo: +1d6 em todas as magias de veneno, terra ou natureza. Três vezes por dia, ao conjurar qualquer magia, pode adicionar um efeito de paralisia leve (alvo perde 1 Ação de Reação).", heavyTwoHanded: true,
    charges: { max: 5, label: "Disparos", resetOn: "combate" },
    range: 4,
    effect: "Ação de Combate: gasta 1 Carga para disparar um raio de energia arcana a até 4 hex de distância. Dano: 1d6+INT. Sem Cargas restantes: a arma ainda pode ser usada em combate corpo a corpo pelo dano físico base.",
    note: "5 disparo(s) por combate. Dano: 1d6+INT, alcance 4 hex." },

  /* ── DEUS DO VERMELHÃO (Divindade dos Karlacs — O Fogo que Cresce) ── */
  { tier: "ancestral", divine: "Vermelhão", race: "karlac",
    name: "Chama-Viva de Karloth", dmg: "2d8 + 1d12", req: "FOR/SAB", weight: 4, defenseDegrade: null,
    slot: ["primary"], heavyTwoHanded: true,
    story: "O Deus do Vermelhão não tem nome — os Karlacs o chamam de Vermelhão porque é a cor do fogo que consome os fragmentos do Deus Marcado. Este cajado foi formado espontaneamente na boca do Vulcão de Karloth quando a Grande Salamandra Karlac passou pela área pela primeira vez. Os Karlacs acreditam que o cajado é um pedaço do coração do vulcão que Vermelhão exteriorizou para o povo que vive nele.",
    note: "🌟 DIVINO — Fogo Crescente: a cada rodada de combate, o dano aumenta em +1d6 (acumula sem limite — rodada 1=+1d6, rodada 2=+2d6, rodada 3=+3d6...). Se o portador receber dano de fogo ou de fonte da Karlac: o acúmulo não é zerado — é dobrado (+2d6 por rodada no acúmulo). Uma vez por combate: 'Vermelhão Desperto' — libera todo o fogo acumulado em área 4x4 hex (dano = todo o dano acumulado até este momento).",
    curseDetails: "Localização: Boca do Vulcão de Karloth (acessível apenas durante erupção menor, dif.4). O Dragão Dourado é o guardião — não ataca, mas exige que o portador prove que entende a natureza do fogo crescente." },


  /* ══════════════════════════════════════════════════════════
     COMBOS DE SUBCLASSE — Armas Mágicas
     ══════════════════════════════════════════════════════════ */

  /* ── SET: Manto do Necromante (peça 2) ── */
  { tier: "magico", subclass: "necromante", setName: "Manto do Necromante",
    name: "Báculo de Osso Oco (Manto do Necromante)", dmg: "1d6", req: "INT", weight: 2.5,
    defenseDegrade: null, slot: ["primary"], heavyTwoHanded: false,
    story: "Feito com a espinha dorsal de um lich derrotado. O osso nunca esfriou completamente — ao toque, tem a temperatura exata de um corpo há uma hora morto. Conjuradores de necromância sentem os dedos formigarem ao segurar.",
    note: "Magias de necromancia conjuradas com este báculo têm alcance +2 hex e custo de Slot reduzido em 1 (mínimo 0). Pacto Sombrio: o espírito invocado tem HP dobrado.",
    setBonus: { pieces: 3, ability: "Colheita das Almas",
      effect: "Com 3 peças do Manto do Necromante: Colheita das Almas ativada (ver Ceifador)." },
    charges: { max: 4, label: "Disparos", resetOn: "combate" },
    range: 4,
    effect: "Ação de Combate: gasta 1 Carga para disparar um raio de energia arcana a até 4 hex de distância. Dano: 1d6+INT. Sem Cargas restantes: a arma ainda pode ser usada em combate corpo a corpo pelo dano físico base.",
    note: "4 disparo(s) por combate. Dano: 1d6+INT, alcance 4 hex." },

  /* ── SET: Voz e Melodia (3 peças) — Bardo ── */
  { tier: "raro", subclass: "bardo", setName: "Voz e Melodia",
    name: "Alaúde de Ossos de Dragão (Voz e Melodia)", dmg: "1d6 + 1d4", req: "SAB/DEX", weight: 1.5,
    defenseDegrade: null, slot: ["primary"], heavyTwoHanded: false, range: 6,
    story: "Construído por um bardo que viveu 3 anos numa caverna de dragão. Não o roubou — ficou, aprendeu a linguagem do dragão e pediu permissão para usar seus ossos quando morresse. O dragão disse não. O bardo esperou. O dragão morreu de velhice. O bardo ainda toca.",
    note: "Magias de buff do Bardo conjuradas enquanto empunha o Alaúde têm duração +1 rodada. Inspiração Bárdica: o bônus sobe de +1d6 para +1d8. Pode ser usada como arma ranged (projeta notas musicais).",
    setBonus: { pieces: 3, ability: "A Música que Move o Mundo",
      effect: "Com 3 peças: Performance de Batalha pode ser ativada como Ação Livre (sem custo de Ação de Magia). Ao encerrar a Performance: todos os aliados que estavam no raio recuperam 2d8 HP (a melodia final os restaura)." } },
,

  /* ═══════════════════════════════════════════════════════════════
     ARMAS MÁGICAS — Varinhas, Orbes, Cajados, Cetros, Livros, Focas
     Para classes mágicas (Mago, Clérigo, Bardo, Druida, etc.)
     slot: primary ou secondary; req: INT ou SAB
     charges: usos limitados de efeito especial por combate
     ═══════════════════════════════════════════════════════════════ */

  /* ─── MÁGICO ─────────────────────────────────────────────────── */

  { tier: "magico", name: "Varinha de Fogo", dmg: "1d4", req: "INT", weight: 0.3,
    slot: ["primary","secondary"], defenseDegrade: null,
    charges: { max: 5, label: "Disparos de Fogo", resetOn: "combate" },
    range: 4,
    effect: "Ação de Combate: gasta 1 Carga para disparar projétil de fogo a até 4 hex (alcance 4). Dano: 1d8+INT de fogo + Queimando (1d4/rodada, 2 rodadas). Sem Cargas: apenas o dano base 1d4 sem efeito de fogo.",
    note: "5 disparos de fogo por combate. Sem Cargas: perde o efeito especial mas ainda pode ser usada como varinha comum.",
    story: "Comprada num mercado de Valdris por moedas. Usada por aprendizes que ainda não controlam Bola de Fogo — mas já têm pressa em queimar coisas." },

  { tier: "magico", name: "Varinha de Gelo", dmg: "1d4", req: "INT", weight: 0.3,
    slot: ["primary","secondary"], defenseDegrade: null,
    charges: { max: 5, label: "Disparos de Gelo", resetOn: "combate" },
    range: 4,
    effect: "Ação de Combate: gasta 1 Carga para disparar projétil de gelo a até 4 hex. Dano: 1d6+INT de frio + Lento (−2 Movimento por 2 rodadas). Sem Cargas: apenas dano base 1d4.",
    note: "5 disparos de gelo por combate. Acertos acumulam — 2 acertos no mesmo alvo: Paralisado 1 rodada (FOR normal para resistir).",
    story: "Feita com água do Lago Central congelada no inverno de Durrak e canalizada em madeira de pinheiro cinzento. Fria ao toque. Sempre." },

  { tier: "magico", name: "Cajado do Raio", dmg: "1d6", req: "INT", weight: 3,
    slot: ["primary"], defenseDegrade: 2, heavyTwoHanded: false,
    charges: { max: 3, label: "Descargas de Raio", resetOn: "combate" },
    range: 4,
    effect: "Ação de Combate: gasta 1 Carga para disparar raio a até 4 hex. Dano: 2d8+INT de relâmpago. Se o alvo usar armadura metálica: dano máximo (sem rolagem). Sem Cargas: apenas dano físico 1d8.",
    note: "3 descargas de raio por combate. O raio salta para 1 alvo adjacente ao atingido: 1d6 de dano elétrico (sem custo de Carga).",
    story: "Forjada num pico de Atrelon durante tempestade. O madeireiro que cortou a árvore disse que o trovão pareceu concordar." },

  { tier: "magico", name: "Orbe das Sombras", dmg: "1d6", req: "INT", weight: 0.8,
    slot: ["primary","secondary"], defenseDegrade: null,
    charges: { max: 4, label: "Pulsos de Sombra", resetOn: "combate" },
    range: 4,
    effect: "Ação de Combate: gasta 1 Carga para disparar pulso de energia sombria a até 4 hex. Dano: 1d8+INT de dano psíquico (ignora Def.Física). Alvo testa SAB (normal) ou fica com −1d4 nos ataques por 1 rodada. Sem Cargas: dano base 1d6 físico.",
    note: "4 disparos por combate. Em área escura ou à noite: +1d6 extra de dano sombrio em cada disparo.",
    story: "Uma esfera negra que parece absorver a luz ao redor. Clérigos de Aethea ficam desconfortáveis perto dela. Isso diz algo." },

  { tier: "magico", name: "Grimório de Batalha", dmg: "—", req: "INT", weight: 1.5,
    slot: ["primary"], defenseDegrade: null,
    charges: { max: 3, label: "Leituras de Combate", resetOn: "combate" },
    range: 0,
    magicBonus: { spellActions: 1 },
    effect: "Passivo: +1 Ação de Magia por turno. Ativo (Ação de Magia, gasta 1 Carga): lê passagem do grimório — cria campo arcano 3x3 hex por 2 rodadas. Inimigos no campo: −1 em todos os testes. Aliados: +1d4 em magias lançadas de dentro do campo.",
    note: "+1 Ação de Magia permanente enquanto equipado. 3 ativações do campo por combate. Sem Cargas: o passivo continua ativo.",
    story: "Encadernado em couro de criatura que nunca foi identificada. Páginas se viram sozinhas no vento. Sempre apontando para o trecho certo." },

  { tier: "magico", name: "Cetro da Mente", dmg: "1d6", req: "SAB", weight: 1.2,
    slot: ["primary","secondary"], defenseDegrade: null,
    charges: { max: 4, label: "Pulsos Mentais", resetOn: "combate" },
    range: 4,
    magicBonus: { slots: 1 },
    effect: "Passivo: +1 Slot de Magia. Ação de Combate: gasta 1 Carga para disparar impulso mental a até 4 hex. Dano: 1d8+SAB psíquico. Alvo testa SAB (difícil) ou fica Confuso por 1 rodada (age aleatoriamente). Sem Cargas: apenas dano base 1d6.",
    note: "4 disparos mentais por combate. +1 Slot permanente enquanto equipado.",
    story: "Pertenceu a um inquisidor de Sanctum que interrogava hereges sem fazer uma única pergunta." },

  { tier: "magico", name: "Cristal de Cura", dmg: "—", req: "SAB", weight: 0.5,
    slot: ["primary","secondary"], defenseDegrade: null,
    charges: { max: 4, label: "Pulsos de Cura", resetOn: "combate" },
    range: 4,
    effect: "Ação de Combate: gasta 1 Carga para enviar pulso de cura a aliado visível a até 4 hex. Cura 1d8+SAB HP. Sem Cargas: apenas serve como foco para magias de cura (+1d4 em magias de cura do portador).",
    note: "4 curas à distância por combate. Não causa dano — é puramente ofensivo para aliados. Clérigos com este cristal: Palavra de Cura alcança +2 hex.",
    story: "Formado naturalmente numa nascente de Aethea. Clérigos da cidade o consideram relíquia. Este aqui foi comprado numa loja de penhores." },

  /* ─── RARO ───────────────────────────────────────────────────── */

  { tier: "raro", name: "Varinha do Relâmpago Furtivo", dmg: "1d4", req: "DEX", weight: 0.2,
    slot: ["primary","secondary"], defenseDegrade: null,
    charges: { max: 5, label: "Raios Furtivos", resetOn: "combate" },
    range: 4,
    effect: "Ação de Combate: gasta 1 Carga para disparar raio silencioso a até 4 hex. Dano: 1d6+DEX de relâmpago. O disparo não produz som nem luz visível — Furtividade não é comprometida ao disparar. Sem Cargas: dano base 1d4 silencioso.",
    note: "5 disparos silenciosos por combate. Bardo e Ladino: disparar não revela posição oculta.",
    story: "Favorita de assassinos que precisam matar à distância sem o barulho inconveniente de uma flecha." },

  { tier: "raro", name: "Orbe do Eco Arcano", dmg: "1d6", req: "INT", weight: 0.8,
    slot: ["primary","secondary"], defenseDegrade: null,
    charges: { max: 3, label: "Ecos", resetOn: "combate" },
    range: 4,
    magicBonus: { spellActions: 1 },
    effect: "Passivo: +1 Ação de Magia. Ativo (Ação de Combate, gasta 1 Carga): dispara projétil arcano a até 4 hex que causa 1d10+INT e depois retorna ao portador como Ação Livre — atacando um segundo alvo diferente em raio 2 hex do primeiro por 1d8+INT. Sem Cargas: dano base 1d6, sem ricochete.",
    note: "3 disparos com ricochete por combate. +1 Ação de Magia permanente. O segundo alvo não pode ser o mesmo que o primeiro.",
    story: "A esfera completa um círculo perfeito antes de retornar. Físicos de Valdris tentam explicar. Magos riem deles." },

  { tier: "raro", name: "Cajado das Raízes Vivas", dmg: "1d6", req: "SAB", weight: 3.5,
    slot: ["primary"], defenseDegrade: 2, heavyTwoHanded: false,
    charges: { max: 3, label: "Raízes", resetOn: "combate" },
    range: 4,
    effect: "Ação de Combate: gasta 1 Carga para invocar raízes em hex a até 4 hex. Todas as criaturas no hex e adjacentes: Presas (FOR normal para escapar, Ação). Dano inicial: 1d6+SAB. Raízes persistem por 2 rodadas — criaturas que entram também ficam Presas. Sem Cargas: dano físico 1d8.",
    note: "3 invocações de raízes por combate. Druidas com este cajado: Moldar Terreno custa 1 Foco/Fé a menos.",
    story: "Cortado da Floresta de Wren por Lyss antes de tudo dar errado. A madeira ainda cresce — milímetros por ano." },

  { tier: "raro", name: "Cetro do Juramento Partido", dmg: "1d6", req: "SAB", weight: 1.5,
    slot: ["primary","secondary"], defenseDegrade: null,
    charges: { max: 4, label: "Maldições do Juramento", resetOn: "combate" },
    range: 4,
    effect: "Ação de Combate: gasta 1 Carga para lançar maldição a alvo a até 4 hex. Por 3 rodadas: alvo tem −1d4 em todos os testes. 2 Cargas: −1d6 e Def.Física −2. 3 Cargas num mesmo alvo: Execrado (−1d8 em testes, Def −3, dura até fim do combate). Sem Cargas: dano base 1d6.",
    note: "4 Cargas de maldição por combate. Podem ser acumuladas no mesmo alvo para efeito crescente.",
    story: "Feito do cajado de um Paladino que rompeu seu juramento. A energia do juramento não foi a lugar nenhum — ficou no cetro." },

  { tier: "raro", name: "Grimório do Sangue Arcano", dmg: "—", req: "INT", weight: 1.5,
    slot: ["primary"], defenseDegrade: null,
    charges: { max: 3, label: "Sacrifícios Arcanos", resetOn: "combate" },
    range: 0,
    magicBonus: { slots: 2 },
    effect: "Passivo: +2 Slots de Magia. Ativo (Ação de Magia, gasta 1 Carga + 1d6 HP próprio): amplifica a próxima magia. Efeito: magia seguinte causa dano dobrado OU cura dobrada OU afeta o dobro de alvos. O HP pago não pode ser curado até o próximo descanso. Sem Cargas: passivo continua ativo.",
    note: "+2 Slots permanentes. 3 amplificações por combate — cada uma custa HP do portador.",
    story: "Páginas manchadas de sangue de proprietários anteriores. Não fica limpo por lavagem. Funciona melhor assim." },

  { tier: "raro", name: "Tomo da Inversão", dmg: "—", req: "INT", weight: 1.8,
    slot: ["primary"], defenseDegrade: null,
    charges: { max: 2, label: "Inversões", resetOn: "sessao" },
    range: 4,
    magicBonus: { slots: 1 },
    effect: "Passivo: +1 Slot de Magia. Ativo (Ação de Magia, gasta 1 Carga): inverte efeito de uma magia já lançada na rodada. Magia de dano vira cura do mesmo valor. Magia de debuff vira buff equivalente. Magia de controle do inimigo vira aliada. Apenas 2 usos por sessão — não por combate.",
    note: "+1 Slot permanente. 2 inversões por sessão inteira. Requer que uma magia já tenha sido lançada na rodada.",
    story: "A última página tem uma frase: 'Tudo pode ser lido ao contrário.' A primeira página repete a mesma frase de trás para frente." },

  /* ─── LENDÁRIO ───────────────────────────────────────────────── */

  { tier: "lendario", name: "Cajado da Tempestade Eterna", dmg: "1d6", req: "INT", weight: 4,
    slot: ["primary"], defenseDegrade: 2, heavyTwoHanded: false,
    charges: { max: 5, label: "Raios da Tempestade", resetOn: "combate" },
    range: 4,
    magicBonus: { spellActions: 1, slots: 2 },
    effect: "Passivo: +1 Ação de Magia e +2 Slots. Ativo (Ação de Combate, gasta 1 Carga): dispara raio em linha reta de até 5 hex — atinge TODOS os alvos na linha. Dano: 2d10+INT de relâmpago. Armadura metálica: dano automático máximo. 2 Cargas: relâmpago em área 3 hex de raio no ponto de impacto (2d10+INT, AGI normal para metade).",
    note: "5 raios por combate. Alcance 5 hex. Afeta linha inteira de inimigos. +1 Ação de Magia e +2 Slots permanentes.",
    story: "Caiu de Atrelon durante a Grande Tempestade de 300 anos atrás. A tempestade nunca parou de verdade — só ficou menor.",
    setName: "Cólera Arcana" },

  { tier: "lendario", name: "Orbe Primordial de Magnalaga", dmg: "1d10", req: "INT", weight: 1.2,
    slot: ["primary","secondary"], defenseDegrade: null,
    charges: { max: 4, label: "Pulsos Primordiais", resetOn: "combate" },
    range: 4,
    magicBonus: { slots: 3 },
    effect: "Passivo: +3 Slots de Magia. Ativo (Ação de Combate, gasta 1 Carga): dispara projétil de energia primordial a até 4 hex. Dano: 2d10+INT de dano arcano puro (ignora Def.Mágica). 3 Cargas no mesmo turno: implosão que puxa todos em raio 4 hex 2 hexes para o centro (FOR difícil para resistir) + 2d10+INT. 1 uso da implosão por combate.",
    note: "+3 Slots permanentes. 4 disparos. A implosão consome 3 Cargas mas pode ser devastadora em grupos.",
    story: "Encontrado na câmara mais profunda da Cidadela do Casco, dentro do casco de Magnalaga. Ela não ligou para a perda. Ou não percebeu." },

  { tier: "lendario", name: "Tomo do Fim dos Tempos", dmg: "—", req: "INT", weight: 2.5,
    slot: ["primary"], defenseDegrade: null,
    charges: { max: 1, label: "Proclamação Final", resetOn: "sessao" },
    range: 6,
    magicBonus: { spellActions: 2, slots: 3 },
    effect: "Passivo: +2 Ações de Magia e +3 Slots. Ativo (2 Ações de Magia, gasta a única Carga da sessão): Proclamação Final — lança a maldição máxima em todos os inimigos visíveis. Por 5 rodadas: −1d10 em todos os testes, Def.Física e Mágica −5, velocidade −3. Imunes: criaturas com SAB 8+. 1 uso por sessão.",
    note: "+2 Ações de Magia e +3 Slots permanentes. 1 Proclamação Final por sessão. Extremamente poderoso — use com sabedoria.",
    story: "Escrito em linguagem que não existia antes de o livro existir. Os estudiosos que tentaram traduzir ficaram 3 dias murmurando e depois nunca mais falaram das páginas finais." },

  /* ─── SETS DE ARMAS MÁGICAS ──────────────────────────────────── */

  /* Set: Chama e Gelo (2 peças — varinha + orbe complementares) */
  { tier: "raro", name: "Varinha da Chama Viva", dmg: "1d4", req: "INT", weight: 0.3,
    slot: ["primary","secondary"], defenseDegrade: null,
    charges: { max: 5, label: "Chamas Vivas", resetOn: "combate" },
    range: 4,
    setName: "Chama e Gelo",
    effect: "Ação de Combate: gasta 1 Carga para disparar chama persistente a até 4 hex. Dano: 1d8+INT de fogo. O hex atingido pega fogo — qualquer criatura que entrar ou ficar nele sofre 1d4 de fogo por rodada por 2 rodadas. Sem Cargas: dano base 1d6.",
    note: "5 disparos. Cria fogo persistente no hex. Com Orbe do Frio Eterno equipado como secundária: BÔNUS DE SET — cada disparo de fogo cancela Lento e cura 1d4 HP em aliados que tiverem a condição Queimando (a chama de cura).",
    story: "Gêmea do Orbe do Frio Eterno. Separadas há décadas. Funcionam melhor juntas — como todo par de opostos." },

  { tier: "raro", name: "Orbe do Frio Eterno", dmg: "1d6", req: "INT", weight: 0.7,
    slot: ["primary","secondary"], defenseDegrade: null,
    charges: { max: 5, label: "Pulsos de Gelo", resetOn: "combate" },
    range: 4,
    setName: "Chama e Gelo",
    effect: "Ação de Combate: gasta 1 Carga para disparar pulso de gelo a até 4 hex. Dano: 1d6+INT de frio. Alvos ficam Lentos (−2 Movimento, 2 rodadas). 2 acertos no mesmo alvo: Congelado (imóvel 1 rodada, FOR normal para resistir). Sem Cargas: dano base 1d6.",
    note: "5 disparos. Com Varinha da Chama Viva equipada como primária: BÔNUS DE SET — disparos de gelo em alvos Queimando causam +1d8 extra (choque térmico) e extinguem a chama.",
    story: "Gêmea da Varinha da Chama Viva. Sempre mais fria que o ambiente ao redor. Sempre procurando o par." },

  /* Set: Grimório do Archmago (3 peças — tomo + cajado + anel) */
  { tier: "lendario", name: "Tomo Arcano de Valdris", dmg: "—", req: "INT", weight: 2,
    slot: ["primary"], defenseDegrade: null,
    charges: { max: 3, label: "Capítulos de Batalha", resetOn: "combate" },
    range: 4,
    magicBonus: { spellActions: 1, slots: 2 },
    setName: "Grimório do Archmago",
    effect: "Passivo: +1 Ação de Magia e +2 Slots. Ativo (Ação de Magia, gasta 1 Carga): lê Capítulo de Batalha — aliados em raio 4 hex ganham +1d8 em magias por 3 rodadas. Sem Cargas: o passivo continua ativo.",
    note: "+1 Ação de Magia e +2 Slots permanentes. Com Cajado de Cristal Puro: BÔNUS 2 PEÇAS — +1 Slot adicional e Capítulos duram 4 rodadas.",
    story: "Volume II de uma coleção de 7. Os outros 6 estão em lugares que a Torre of Arcath preferia não divulgar." },

  { tier: "lendario", name: "Cajado de Cristal Puro", dmg: "1d6", req: "INT", weight: 3.5,
    slot: ["primary"], defenseDegrade: 1, heavyTwoHanded: false,
    charges: { max: 4, label: "Feixes de Cristal", resetOn: "combate" },
    range: 4,
    magicBonus: { slots: 2 },
    setName: "Grimório do Archmago",
    effect: "Passivo: +2 Slots. Ativo (Ação de Combate, gasta 1 Carga): dispara feixe de luz cristalina a até 5 hex. Dano: 1d10+1d6+INT de dano arcano. O feixe perfura — atinge todos na linha (cada um faz AGI normal para metade). Sem Cargas: dano base 1d8+1d6.",
    note: "+2 Slots permanentes. Com Tomo Arcano de Valdris: BÔNUS 2 PEÇAS — feixes perfurantes causam +1d6 por alvo adicional atingido. Com o Anel do Archmago: BÔNUS SET COMPLETO — 1x/sessão, lançar qualquer magia conhecida sem custo de Slot.",
    story: "Forjado da pedra cristalina do Pico de Atrelon. Reflete arco-íris em qualquer iluminação. Ainda assim, corta como faca." }
,

  /* ─── INSPIRADOS EM ELDEN RING — Armas Mágicas ──────────────── */

  { tier: "lendario", name: "Cetro do Senhor dos Espinhos",
    dmg: "1d8+1d6", req: "INT", weight: 2,
    slot: ["primary","secondary"], defenseDegrade: null,
    charges: { max: 4, label: "Espinhos Arcanos", resetOn: "combate" },
    range: 5,
    magicBonus: { spellActions: 1, slots: 2, attr: "INT", attrValue: 1 },
    effect: "Passivo: +1 INT, +1 Ação de Magia, +2 Slots. Ativo (1 Carga, alcance 5 hex): Chuva de Espinhos — projeta campo de espinhos de energia num raio de 2 hex em torno do alvo. Qualquer criatura que entrar ou sair da área sofre 1d8+INT de dano. O campo persiste 3 rodadas sem custo adicional. 2 Cargas: espinhos explodem ao fim das 3 rodadas (2d10 extra, área 3 hex).",
    note: "+1 INT, +1 Ação Magia, +2 Slots. Campo de espinhos 2 hex, 3 rodadas. 2 Cargas: explosão final 2d10.",
    story: "O Senhor dos Espinhos foi um Necromante que tentou aprisionar a morte num cetro. Conseguiu. A morte ficou com ele — pessoalmente, permanentemente, no cetro. Ele ainda está lá dentro de alguma forma. Às vezes o cetro faz perguntas." },

  { tier: "lendario", name: "Orbe da Lua Cheia de Rennala",
    dmg: "1d10+1d6", req: "INT", weight: 1,
    slot: ["primary","secondary"], defenseDegrade: null,
    charges: { max: 3, label: "Plenas da Lua", resetOn: "combate" },
    range: 6,
    magicBonus: { spellActions: 1, slots: 3, attr: "INT", attrValue: 2 },
    effect: "Passivo: +2 INT, +1 Ação de Magia, +3 Slots. Ativo (2 Cargas, alcance 6 hex): Plena da Lua — projétil de luz lunar pura. Dano: 3d8+INT de dano arcano. Alvo testea Força de Vontade (difícil) ou tem Def.Mágica reduzida à metade por 4 rodadas (a lua dissolve resistências mágicas). 1 Carga: Crescente Lunar, dano 2d6+INT sem o efeito de dissolução.",
    note: "+2 INT, +1 Ação Magia, +3 Slots. Plena da Lua (2 Cargas): 3d8+INT + Def.Mágica ÷2 por 4 rodadas.",
    story: "Rennala foi a maior arquimaga de Atrelon antes da Batalha Colossal. Este orbe era seu olho — ela o usava para ver magias em formação antes que existissem. Quando ela morreu, o orbe guardou o que ela via no último momento. Às vezes mostra." },

  { tier: "lendario", name: "Báculo do Profeta Sangrento",
    dmg: "1d6", req: "SAB", weight: 3,
    slot: ["primary"], defenseDegrade: 2, heavyTwoHanded: false,
    charges: { max: 3, label: "Profecias", resetOn: "sessao" },
    range: 4,
    magicBonus: { slots: 2, attr: "SAB", attrValue: 2 },
    effect: "Passivo: +2 SAB, +2 Slots. Ativo (1 Carga, 1 uso de Fé, alcance 5 hex): Profecia de Sangue — o portador sangra voluntariamente (perde 1d6 HP) para ver o próximo ataque do alvo. Por 2 rodadas: o portador sabe exatamente o que o alvo vai fazer — primeiro ataque do alvo é automaticamente bloqueado (sem rolar defesa). 3 Cargas/sessão — as profecias não renovam por combate, mas por sessão inteira.",
    note: "+2 SAB, +2 Slots. Profecia: perde 1d6 HP → bloqueia automaticamente 1 ataque do alvo por 2 rodadas. 3/sessão.",
    story: "O Profeta via o futuro em sangue — literalmente. Quanto mais sangrava, mais via. O báculo foi feito para conter o excesso das visões. Não funcionou completamente. Mas funcionou suficientemente para que ele vivesse até escolher parar." },

  { tier: "ancestral", name: "Grimório do Fim dos Dedos",
    dmg: "—", req: "INT", weight: 2.2,
    slot: ["primary"], defenseDegrade: null,
    charges: { max: 2, label: "Fragmentos do Fim", resetOn: "sessao" },
    range: 0,
    magicBonus: { spellActions: 2, slots: 4, attr: "INT", attrValue: 3 },
    effect: "Passivo: +3 INT, +2 Ações de Magia, +4 Slots. Ativo (2 Cargas, 2 Ações de Magia — 1 uso/sessão): O Fim Chegou — o portador abre o grimório na última página e lê em voz alta. Todos os inimigos visíveis sem exceção testam Força de Vontade (crítico — quase impossível): falha → perdem metade do HP atual instantaneamente (dano de entropia pura, ignora tudo). Sucesso → ficam com −1d10 em todos os testes por 3 rodadas. Após usar: o portador fica Exausto por 2 horas e 2 páginas do grimório apagam-se permanentemente. Quando não houver mais páginas, o grimório fecha sozinho.",
    note: "+3 INT, +2 Ações Magia, +4 Slots. O Fim Chegou: todos os inimigos visíveis perdem 50% HP (Força de Vontade crítico para resistir). 1/sessão. Apaga 2 páginas. Uso limitado.",
    story: "O grimório tem 40 páginas. Ninguém sabe quantas restam — a contagem muda. Quem o encontrou não quis continuar contando depois da terceira vez que o número diminuiu sem ter sido usado." }];

const WEAPONS_RANGED = [
  /* --- COMUNS --- */
  { tier: "comum", name: "Arco Curto", dmg: "1d6", range: 8, req: "DEX", weight: 3, defenseDegrade: null, slot: ["primary"], note: "Recarga rápida; padrão para iniciantes." },
  { tier: "comum", name: "Arco Longo", dmg: "1d8", range: 12, req: "DEX", weight: 4, defenseDegrade: null, slot: ["primary"], note: "Padrão do Arqueiro." },
  { tier: "comum", name: "Besta", dmg: "1d10", range: 10, req: "DEX/FOR", weight: 6, defenseDegrade: null, slot: ["primary"], note: "Recarregar custa 1 Ação extra." },
  { tier: "comum", name: "Besta de Repetição", dmg: "1d8", range: 9, req: "DEX", weight: 5, defenseDegrade: null, slot: ["primary"], note: "Não exige recarga entre disparos." },
  { tier: "comum", name: "Funda", dmg: "1d4", range: 6, req: "DEX", weight: 1, defenseDegrade: null, slot: ["primary"], note: "Munição barata; discreta em áreas urbanas." },
  { tier: "comum", name: "Adaga de Lançamento", dmg: "1d4", range: 4, req: "DEX", weight: 1, defenseDegrade: 2, slot: ["primary","secondary"], note: "Também usável corpo a corpo." },

  /* --- RAROS --- */
  { tier: "raro", name: "Arco das Raízes de Keln", dmg: "1d8 + 1d4", range: 14, req: "DEX", weight: 3, defenseDegrade: null, slot: ["primary"],
    story: "Curvado a partir de um galho da Árvore de Keln, planta sagrada dos druidas que cresce apenas onde o sangue de Lobo e Cobra se misturou no solo. O galho se curvou voluntariamente.",
    note: "Flechas disparadas deste arco ignoram Cobertura Parcial. Alcance máximo +2 hex." },

  /* --- MÁGICOS --- */
  { tier: "magico", name: "Arco Élfico da Serpente Alada", dmg: "1d8 + 1d6", range: 16, req: "DEX alto", weight: 2, defenseDegrade: null, slot: ["primary"],
    story: "Presenteado pelos elfos de Sylvara a um caçador que salvou um ninho de cobras sagradas de Jurgmund. A corda é tecida com cabelos de elfa e veneno solidificado — nunca arrebenta.",
    note: "Flechas envenenadas automaticamente: 1d4 de dano contínuo por 2 rodadas. Alcance superior: ignora penalidade de longo alcance." },


  /* --- MÁGICOS (novos) --- */
  { tier: "magico", name: "Besta das Correntes de Gelo", dmg: "1d12 + 1d8", range: 12, req: "DEX/FOR", weight: 6, defenseDegrade: null, slot: ["primary"],
    story: "Construída por um caçador de Atrelon que sobreviveu três invernos no planalto gelado sozinho. Encantou sua besta com fragmentos de gelo eterno das cavernas do Lich — o frio nunca derrete.",
    note: "Projéteis de gelo: acertos aplicam Lentidão (−1 Movimento por 2 rodadas, cumulativo até −3). Ao imobilizar um alvo completamente, ele congela por 1 rodada e não pode agir." },

  /* --- LENDÁRIOS (novos) --- */
  { tier: "lendario", name: "Arco do Plenilúnio da Marca", dmg: "1d20 + 1d8 + 1d4", range: 18, req: "DEX/SAB", weight: 3, defenseDegrade: null, slot: ["primary"],
    story: "Existe apenas uma cópia deste arco — ou assim se acredita. Feito com o osso do braço de um campeão do Deus Marcado que se sacrificou voluntariamente, a corda é feita com tendão de Lobo do Vazio. O arco canta levemente quando tensionado, um uivo suave que conforta aliados e aterroriza inimigos.",
    note: "Passivo: inimigos a até 10 hex que possam ouvir o portador atirar devem testar Resistência ao início do combate ou ficam com −1d4 na Chance de Acerto (medo instintivo). Disparos à distância máxima causam +1d12 de dano extra de impacto divino." },

  /* --- ÚNICOS --- */
  { tier: "unico", name: "Arco do Caçador Eterno", dmg: "1d10 + 1d8 + 1d4", range: 20, req: "DEX", weight: 3, defenseDegrade: null, slot: ["primary"],
    story: "Segundo a lenda, este arco foi criado pelo próprio Deus Marcado para seu primeiro campeão mortal — um caçador cujo nome foi apagado da história por ter desafiado um deus rival. O arco nunca ficou com um dono por mais de uma geração; sempre aparece nas mãos de quem mais precisa caçar algo que não deveria existir.",
    uniqueAbility: "Flecha da Fatalidade (1x/semana): uma flecha que não pode ser evitada ou bloqueada por meios normais. Se acertar, causa 5d10 de dano de luz e aplica Marca do Caçador — o alvo não pode se regenerar ou ser curado por 24 horas. Se errar a rolagem de acerto, a flecha simplesmente some.",
    note: "Passivo: ataques contra criaturas Marcadas ou Amaldiçoadas adicionam +1d8 de dano." },
  /* --- SETS integrados --- */
  { tier: "lendario", setName: "Caçador da Marca", name: "Arco do Rastreador Eterno (Caçador da Marca)", dmg: "1d10 + 1d6", range: 16, req: "DEX", weight: 3, defenseDegrade: null, slot: ["primary"],
    story: "Criado por um caçador que passou 40 anos rastreando uma única presa — criatura de outro plano. Quando a encontrou, o arco disparou antes mesmo da ordem.",
    note: "Alvos Marcados sofrem +1d8. Matar alvo Marcado recupera 1 Foco. SET — Caçador da Marca (1/3): Presa Marcada para Morte.",
    setBonus: { pieces: 3, ability: "Presa Marcada para Morte", effect: "Marcar Alvo dura o combate inteiro. Primeiro ataque à distância/turno contra o Marcado acerta automaticamente." } },

  /* --- LENDÁRIO: tema Aether --- */
  { tier: "lendario", name: "Arco das Asas Douradas", dmg: "1d12 + 1d8 + 1d4", range: 18, req: "DEX/SAB", weight: 2, defenseDegrade: null, slot: ["primary"],
    story: "Construído pelo herói Ferrath com a madeira de uma árvore que cresceu exatamente onde o Dragão Dourado poisou pela primeira vez após a Batalha Colossal. A madeira ainda carrega calor dourado que nunca esfria. Ferrath o usou para disparar a flecha que rompeu o núcleo do Deus Marcado.",
    note: "Réplica espiritual do arco original: flechas disparadas emitem brilho dourado visível no escuro. Passivo: +1d6 de luz sagrada em cada disparo. Ataques contra Araltos ou servos do Deus Marcado adicionam +1d10. Uma vez por sessão: disparo que não pode ser esquivado por criaturas corrompidas ou mortas-vivas." },

  /* --- ÚNICO: tema Aether --- */
  { tier: "unico", name: "Besta dos Círculos de Karlac", dmg: "1d12 + 1d8", range: 14, req: "DEX/FOR", weight: 6, defenseDegrade: null, slot: ["primary"],
    story: "Forjada pelos Karlacs com escama de Karlac filhote e osso de criatura do deserto, temperada no calor direto da cauda da grande salamandra. Nenhum Karlac a vendia — mas um aventureiro que salvou a Cidade Viva de um ataque recebeu-a como presente do Grande Karlac Yorven.",
    uniqueAbility: "Chama de Karlac (2x/dia): carrega uma flecha especial de fogo que ao acertar cria uma mancha de fogo no hexágono do alvo. A mancha dura 3 rodadas: qualquer criatura que entrar ou ficar na mancha sofre 2d8 de fogo por turno. Alvo atingido pela flecha sofre 3d10 de fogo imediato. O fogo de Karlac consome restos do Deus Marcado — criaturas corrompidas sofrem dano dobrado.",
    note: "Passivo: todas as flechas têm +1d4 de fogo. Imune ao calor do Deserto Carmesim e de criaturas de fogo enquanto equipada." },

  /* ── JULGMUND (Divindade dos Serpentarianos — A Cobra Colossal) ── */
  { tier: "ancestral", divine: "Jurgmund", race: "serpentariano",
    name: "Arco das Escamas de Jurgmund", dmg: "1d12 + 1d10", req: "DEX/SAB", weight: 3, defenseDegrade: null,
    slot: ["primary"], heavyTwoHanded: true, range: 16,
    story: "Três escamas de Jurgmund caíram durante a Batalha Colossal e foram encontradas por Serpentarianos que testemunharam o confronto. Um artesão passou 40 anos moldando as escamas em forma de arco — as escamas resistiam ao calor, ao frio e a qualquer ferramenta. Ele finalmente conseguiu curvá-las quando pediu ajuda em oração. No dia seguinte o arco estava pronto na sua bancada. O artesão nunca mais falou sobre como foi feito.",
    note: "🌟 DIVINO — Veneno Sagrado de Jurgmund: flechas feitas de qualquer material tornam-se flechas de veneno sagrado ao passar pelo arco. Dano: 1d12+1d10 + veneno (1d8/rodada, 4 rodadas). Resistência SAB (difícil) reduz o veneno à metade. Uma vez por combate: 'Alento da Cobra' — dispara uma flecha de veneno colossal que atravessa TODOS os inimigos em linha reta (linha de 12 hex de comprimento), causando dano completo a cada um.",
    curseDetails: "Localização: Câmara das Três Escamas (interior do Castelo da Cobra, Montanhas de Atrelon). Só pode ser empunhado por Serpentarianos ou por quem recebeu a bênção de Jurgmund." },

];

const SHIELDS = [
  /* --- COMUNS --- */
  { tier: "comum", name: "Broquel", physDefense: 1, weight: 2, penalty: "Nenhuma", slot: ["shield"], note: "Leve e discreto; não penaliza movimento." },
  { tier: "comum", name: "Escudo de Madeira", physDefense: 2, weight: 4, penalty: "Nenhuma", slot: ["shield"], note: "Simples e barato; pode ser destruído com ataques pesados." },
  { tier: "comum", name: "Escudo de Ferro", physDefense: 4, weight: 7, penalty: "−1 no Movimento", slot: ["shield"], note: "Resistente; penaliza levemente a mobilidade." },
  { tier: "comum", name: "Escudo de Torre", physDefense: 6, weight: 12, penalty: "−1 na Chance de Acerto, −1 Movimento", slot: ["shield"], note: "Máxima proteção; melhor para Guardiões estacionários." },

  /* --- RAROS --- */
  { tier: "raro", name: "Escudo do Centurião de Durrak", physDefense: 5, weight: 6, penalty: "Nenhuma", slot: ["shield"],
    story: "Fabricado nas forjas subterrâneas de Durrak para os guardas de elite que protegiam os portões durante a Grande Invasão. A liga especial de minério negro não foi reproduzida desde então.",
    note: "+1d4 de dano ao usar Escudo Bash (perícia de combate). Não penaliza Movimento apesar da proteção elevada." },

  /* --- MÁGICOS --- */
  { tier: "magico", name: "Aegis de Escamas da Cobra", physDefense: 4, weight: 5, penalty: "Nenhuma", slot: ["shield"],
    story: "Construído com escamas reais de uma Cobra Sagrada que se sacrificou para proteger o templo de Jurgmund durante o Saque de Serpentara. As escamas nunca perdem o brilho dourado.",
    note: "Passivo: +1d4 de Defesa Mágica contra magias de veneno e terra. Uma vez por combate, pode absorver automaticamente um ataque de veneno sem teste." },

  /* --- LENDÁRIOS --- */
  { tier: "lendario", name: "Muralha de Osso do Lobo", physDefense: 7, weight: 8, penalty: "Nenhuma", slot: ["shield"],
    story: "Forjado com o crânio de um Lobo do Vazio e reforçado com runas da Marca. O Deus Marcado abençoou este escudo para que nenhum de seus servos caísse enquanto o carregasse. Os três guardiões que o usaram na Grande Invasão sobreviveram quando todos ao redor morreram.",
    note: "Passivo: aliados adjacentes ganham +1d4 de Defesa Física enquanto você está de pé e consciente (stacks com Guardião de Flanco). Uma vez por dia: bloqueia automaticamente qualquer ataque que causaria dano mortal, reduzindo-o a 1 HP. O escudo racha mas não quebra." },
  /* --- SET integrado --- */
  { tier: "lendario", setName: "Muralha de Durrak", name: "Escudo da Vanguarda de Durrak (Muralha de Durrak)", physDefense: 6, weight: 9, penalty: "−1 Movimento", slot: ["shield"],
    story: "Um dos escudos sobreviventes das muralhas de Durrak. Cada arranhão representa um ataque que não chegou ao guerreiro atrás dele.",
    note: "Escudo Bash causa +1d6 extra. Aliados adjacentes ganham +1d4 Defesa Física. SET — Muralha de Durrak (1/3): Bastião Inabalável.",
    setBonus: { pieces: 3, ability: "Bastião Inabalável", effect: "Reação gratuita: ao aliado adjacente receber dano letal (reduziria a 0 HP), você absorve todo o dano. Teste Resistência normal: se passar, absorve metade. (1x/batalha)" } },

  /* --- LENDÁRIO: tema Aether --- */
  { tier: "lendario", name: "Casco de Magnalaga", physDefense: 8, weight: 10, penalty: "Nenhuma", slot: ["shield"],
    story: "Fragmento do casco de Magnalaga desprendido durante um de seus mergulhos e polido pelos Anões do Casco ao longo de 50 anos. A superfície é pedra-mas-viva: muda de temperatura, e em batalha parece pulsar levemente. O Rei Burrak o guardou por décadas antes de entregá-lo a aventureiros que protegeram a Cidadela.",
    note: "Passivo: imune a dano de ácido e veneno. Uma vez por combate, ao ser atingido por magia de qualquer tipo, absorve a magia completamente (sem dano) e converte em 1d8 de HP para o portador. Aliados em raio 2 hex ficam imunes a efeitos de Corrupção enquanto este escudo estiver levantado." },

  /* ══════════════════════════════════════════════════════════
     COMBOS DE SUBCLASSE — Escudos
     ══════════════════════════════════════════════════════════ */

  /* ── SET: Voto de Aço e Luz (peça 2) — Paladino ── */
  { tier: "lendario", subclass: "paladino", setName: "Voto de Aço e Luz",
    name: "Égide do Juramento (Voto de Aço e Luz)", physDefense: 5, magDefense: 3, weight: 6, req: "FOR/SAB",
    story: "Um escudo que não foi feito para atacar. Na borda, gravadas em latim sagrado de Sanctum: 'Eu paro o golpe que devia matar meu irmão.' O escudo tem marca de 43 golpes que pararam.",
    note: "Escudo da Fé conjurada no portador desta Égide: +1 de bônus em cada Defesa (+3/+3 em vez de +2/+2). Aura de Proteção: o raio da aura aumenta em +2 hex enquanto esta Égide estiver equipada.",
    setBonus: { pieces: 3, ability: "Golpe do Juramento Cumprido",
      effect: "Ver Martelo do Juramento (2 peças adicionais ativam o bônus completo)." } },

,

  /* ─── INSPIRADOS EM ELDEN RING — Escudos ────────────────────── */

  { tier: "lendario", name: "Escudo do Cavaleiro Sem Falha",
    physDefense: 8, magDefense: 4, weight: 4.5, req: "FOR",
    slot: ["shield"],
    magicBonus: { attr: "FOR", attrValue: 1 },
    effect: "Passivo: +1 FOR. Chance de Defesa: 7 ou menos (escudo mais confiável de Aether). Ao tirar 1 no d10 de defesa (defesa crítica): o atacante recebe o dano que causaria de volta (dano refletido, ignora Defesa do atacante). O nome é uma promessa — não foi quebrado em combate ainda.",
    note: "+1 FOR. Defesa 7 ou menos. Crítico de defesa (tirar 1): dano do ataque refletido de volta no atacante.",
    story: "Pertenceu ao único cavaleiro que nunca foi ferido em batalha. Não porque era invulnerável — porque cada golpe que chegava encontrava o escudo primeiro. Ele morreu em paz, de velhice. O escudo ficou sem propósito. Ainda procura um novo." },

  { tier: "lendario", name: "Escudo do Sangue de Dragão",
    physDefense: 7, magDefense: 6, weight: 5, req: "FOR",
    slot: ["shield"],
    effect: "Passivo: imune a dano de fogo (qualquer fonte). Ao receber dano de fogo (que seria ignorado): o escudo absorve e carrega a energia — próxima defesa libera essa energia no atacante (1d8 de fogo, automático). Ao usar Escudo Bash (perícia): o bash causa +1d6 de fogo extra e tem chance de Queimar o alvo (1d4/rodada, 2 rodadas).",
    note: "Imune a fogo. Absorve fogo → libera no próximo Bash. Bash: +1d6 fogo e Queimando.",
    story: "Feito do couro do ventre de um dragão vermelho morto na Batalha Colossal. O dragão não queria morrer mas o guerreiro não tinha escolha. O escudo guarda algo do arrependimento de ambos." },

  /* ── ESCUDOS MÍTICOS ─────────────────────────────────────────── */

  { tier:"lendario", name:"Escudo de Tartaruga-Colosso",
    physDefense:0, weight:8, penalty:"Nenhuma",
    story:"O casco de uma Tartaruga-Colosso adulta — criatura do tamanho de uma ilha que vive por milênios. Este fragmento de casco foi cedido pela própria criatura quando ela morreu de velhice natural. Quem o carrega sente uma calma inexplicável.",
    note:"Passivo: o portador regenera 1 HP por rodada passivamente (a vitalidade da Tartaruga-Colosso ainda mora no casco). Passivo: condições de Derrubado e Empurrado são imunes — o casco da Colosso não cede. Ativo (1x/combate): retrai completamente sob o casco por 1 turno — imune a todo dano neste turno, mas não pode agir. Ao sair da retração: todos os aliados em raio 3 hex curam 1d8+FOR HP (a Colosso protege o bando)." },

  { tier:"lendario", name:"Asa de Dragão Petrificado — Escudo",
    physDefense:0, weight:5, penalty:"Nenhuma",
    story:"Uma asa de Dragão que foi petrificada por um Basilisco antes de ser cortada — petrificada no meio do voo, capturada em pleno movimento. O artesão que a transformou em escudo disse que não teve escolha; a asa parecia querer isso.",
    note:"Passivo: 25% de chance (d10 ≤ 2 ou 3) de que qualquer magia que atinja o portador seja Refletida de volta ao conjurador com 50% do dano (a pedra desvia energia). Físico: imune. Ativo (1x/combate): a asa se abre — o portador pode voar por 2 rodadas (Movimento +4 hex, pode passar por obstáculos físicos abaixo de 3 metros de altura). Ao pousar após o voo: pode realizar 1 ataque com +2d6 de dano (o impacto da descida)." },

  { tier:"unico", name:"Concha da Sereia Ancestral",
    physDefense:0, weight:1, penalty:"Nenhuma",
    story:"Não é propriamente um escudo — é uma concha de um ser que existiu antes das Sereias como existem hoje. Antes das canções, antes dos naufrágilados, antes do oceano ser chamado de oceano. A concha ecoa com algo que não é som. Quem a segura ouve o oceano mesmo no deserto.",
    note:"Passivo: defesas com esta concha emitem uma nota de som subsônico — o atacante que errar deve testar SAB (normal) ou fica Abalado por 1 rodada (o som desoriente). Passivo: o portador nunca precisa respirar sob água e tem Percepção automática em ambientes aquáticos. Ativo (2x/combate): O Eco — emite o som original da Sereia Ancestral em raio 6 hex; todos os inimigos testam SAB (difícil) ou ficam Confusos por 1 rodada (atacam aliado mais próximo). Aliados na área curam 1d6 HP." }];

const ARMORS = [
  /* --- COMUNS --- */
  { tier: "comum", name: "Roupas Comuns", physDefense: 0, magDefense: 0, weight: 1, movePenalty: 0, req: "—" },
  { tier: "comum", name: "Armadura de Couro", physDefense: 2, magDefense: 0, weight: 5, movePenalty: 0, req: "—", note: "Leve e silenciosa; boa para exploração." },
  { tier: "comum", name: "Armadura de Couro Batido", physDefense: 3, magDefense: 0, weight: 7, movePenalty: 0, req: "DEX", note: "Camadas sobrepostas; melhor proteção sem perder mobilidade." },
  { tier: "comum", name: "Cota de Malha", physDefense: 5, magDefense: 0, weight: 14, movePenalty: 1, req: "FOR", note: "Padrão de infantaria pesada." },
  { tier: "comum", name: "Armadura de Placas Parcial", physDefense: 7, magDefense: 0, weight: 20, movePenalty: 2, req: "FOR", note: "Cobertura completa de torso e membros; movimento reduzido." },
  { tier: "comum", name: "Armadura de Placas Completa", physDefense: 9, magDefense: 0, weight: 28, movePenalty: 3, req: "FOR alto", note: "Proteção máxima; apenas para tanques de combate." },
  { tier: "comum", name: "Vestes Arcanas", physDefense: 1, magDefense: 4, weight: 2, movePenalty: 0, req: "INT/SAB", note: "Tecido encantado que desvia energias mágicas." },
  { tier: "comum", name: "Vestes Sagradas", physDefense: 2, magDefense: 3, weight: 3, movePenalty: 0, req: "SAB", note: "Usada por clérigos; equilíbrio entre proteção física e mágica." },
  { tier: "comum", name: "Manto das Sombras", physDefense: 2, magDefense: 1, weight: 2, movePenalty: 0, req: "AGI", note: "+1d4 em testes de Furtividade enquanto equipada." },
  { tier: "comum", name: "Roupagem do Andarilho", physDefense: 1, magDefense: 1, weight: 1, movePenalty: -1, req: "—", note: "Tecido leve; +1 Movimento em vez de penalidade." },

  /* --- RAROS --- */
  { tier: "raro", name: "Cota de Malha de Mithral", physDefense: 6, magDefense: 1, weight: 8, movePenalty: 0, req: "FOR",
    story: "Tecida a partir de elos de mithral extraído das minas seladas de Atrelon. O metal é tão leve e resistente que os antigos diziam ser tecido por espíritos, não por ferreiros.",
    note: "Mesma proteção que Armadura de Placas Parcial, mas sem penalidade de Movimento. Silenciosa como couro." },
  { tier: "raro", name: "Armadura de Escamas de Dragão (Réplica)", physDefense: 6, magDefense: 2, weight: 12, movePenalty: 1, req: "FOR",
    story: "Imitação cara de armadura draconiana; usa escamas de wyvern no lugar de dragão. O resultado é inferior ao original, mas ainda impressiona.",
    note: "Equilíbrio raro entre defesa física e mágica. +1d4 de resistência a dano de fogo." },

  /* --- MÁGICOS --- */
  { tier: "magico", name: "Couraça da Cobra-Rainha", physDefense: 4, magDefense: 5, weight: 5, movePenalty: 0, req: "SAB/DEX",
    story: "Moldada com a pele da última Cobra-Rainha de Jurgmund, criatura que viveu 400 anos antes de se oferecer voluntariamente ao Grande Sacerdote. A armadura carrega a sabedoria e a frieza da serpente.",
    note: "Passivo: imunidade a venenos naturais e +1d6 de Defesa Mágica contra magias de veneno. Uma vez por combate, ao ser atingido por um ataque físico, pode Esquivar automaticamente como Reação (sem gasto de ação)." },

  /* --- LENDÁRIOS --- */
  { tier: "lendario", name: "Couraça da Marca do Lobo", physDefense: 8, magDefense: 4, weight: 14, movePenalty: 1, req: "FOR/AGI",
    story: "Forjada no coração de uma montanha durante uma tempestade invocada pelo próprio Deus Marcado, esta couraça carrega a impressão de uma pata de lobo gravada no peito — que brilha vermelho quando o portador está em perigo real. Apenas três foram criadas; o paradeiro de duas é desconhecido.",
    note: "Passivo: ao cair abaixo de 25% HP, ganha +1d8 de Defesa Física e o dano natural do portador aumenta em +1d6 por 3 rodadas (ativa automaticamente). Uma vez por dia: ao morrer, o portador estabiliza em vez de morrer e recupera 1d10 HP." },
  { tier: "lendario", name: "Armadura da Muralha Viva de Sanctum", physDefense: 6, magDefense: 6, weight: 8, movePenalty: 0, req: "SAB/FOR",
    magicBonus: { hp: 30, carry: 15 },
    story: "A armadura que o Clérigo Sanctum usou na Batalha Colossal. Projetada para proteger sem impedir os movimentos de cura. As runas na superfície são orações gravadas pelo próprio Sanctum — que ainda funcionam após 500 anos.",
    note: "Passivo: magias de cura do portador adicionam +1d6 automaticamente. +30 HP máximo, +1 Reação e +15 Carga refletem ao equipar. A Reação extra permite usar Graça Divina e ainda agir normalmente no turno." },
  { tier: "lendario", name: "Vestes do Arquimago Supremo", physDefense: 2, magDefense: 10, weight: 2, movePenalty: 0, req: "INT",
    magicBonus: { spellActions: 2, hp: 15, slots: 1 },
    story: "Vestes que a Maga Arcath usou nos anos finais de sua vida. O tecido foi impregnado com décadas de conjuração até ganhar vida própria como canal mágico. Cada fio é uma runa diferente que canaliza energia arcana.",
    note: "+2 Ações de Magia por rodada, +15 HP máximo e +1 Slot de Magia. Ao conjurar uma magia de nível 3 ou superior com estas vestes, pode reduzir o custo em 1 nível (nível 4 torna-se nível 3, etc.)." },
  { tier: "lendario", name: "Couro da Salamandra Karlac", physDefense: 7, magDefense: 3, weight: 6, movePenalty: 0, req: "FOR/AGI",
    magicBonus: { hp: 20, carry: 20, actions: 1 },
    story: "Armadura feita com uma escama maior de Karlac que caiu naturalmente durante um de seus círculos. Os Karlacs consideram relíquia sagrada — a salamandra permite que seu povo colete escamas caídas, nunca as arrancadas. Carrega calor constante que fortalece o portador.",
    note: "+20 HP máximo, +20 Carga e +1 Ação de Combate por rodada. Imune a dano de fogo. O calor da armadura causa 1d4 de dano a quem ataca corpo a corpo (toca a armadura)." },
  /* --- SET integrado --- */
  { tier: "magico", setName: "Berserker", name: "Armadura de Placas Sangrentas (Berserker)", physDefense: 7, magDefense: 0, weight: 22, movePenalty: 2, req: "FOR",
    story: "Placas que absorveram tanto sangue que o metal mudou de cor permanentemente. Os usuários ouvem sussurros dos inimigos abatidos.",
    note: "A cada inimigo abatido, +1d4 de dano temporário (não acumula além +1d8). SET — Berserker (1/3): Ira Sem Limite.",
    setBonus: { pieces: 3, ability: "Ira Sem Limite", effect: "Ao abater um inimigo, repete o valor exato de dano num segundo alvo em alcance sem re-rolar dados. Sem custo de Ação. (1x/batalha)" } },

  { tier: "lendario", setName: "Muralha de Durrak", name: "Armadura de Ferro Negro de Durrak (Muralha de Durrak)", physDefense: 9, magDefense: 2, weight: 30, movePenalty: 3, req: "FOR alto",
    story: "Liga de minério negro extraído sob Durrak antes de cair. O ferreiro que a finalizou foi o último a sair das forjas enquanto a cidade ruía.",
    note: "HP < 25%: +1d8 Defesa Física automático até fim do combate. Imune a Derrubada enquanto de pé. SET — Muralha de Durrak (2/3): Bastião Inabalável.",
    setBonus: { pieces: 3, ability: "Bastião Inabalável", effect: "Reação gratuita: ao aliado adjacente receber dano letal, você absorve todo o dano (Resistência normal: metade). (1x/batalha)" } },

  /* --- LENDÁRIOS: tema Aether --- */
  { tier: "lendario", name: "Couro das Costas de Karlac", physDefense: 5, magDefense: 3, weight: 6, movePenalty: 0, req: "FOR/AGI",
    story: "Couro curtido de fragmentos de pele espontaneamente desprendidos de Karlac durante seus círculos. O povo Karlac coleta esses fragmentos com reverência — vesti-los é como carregar um pedaço do ser colossal. A armadura ainda retém calor.",
    note: "Passivo: resistência a dano de fogo (reduz em 1d6). Em ambientes quentes (vulcão, deserto, fogo), ganha +1d4 de Defesa Física bônus. Uma vez por combate, ao ser atingido por dano de fogo, pode absorver o calor e utilizá-lo como ação bônus: próximo ataque causa +1d8 de fogo." },

  { tier: "lendario", name: "Vestes de Escama Serpentariana", physDefense: 3, magDefense: 8, weight: 4, movePenalty: 0, req: "SAB/INT",
    story: "Tecidas pelas sacerdotisas Serpentarianas com escamas renovadas naturalmente pelo povo-cobra ao longo de décadas. Cada escama foi abençoada individualmente. A Alta Sacerdotisa Sss'era guardava estas vestes para o portador digno de carregá-las.",
    note: "Passivo: imune a venenos naturais. +1d6 em testes de SAB. Magias conjuradas pelo portador adicionam +1d4 ao efeito (dano, cura ou duração). Uma vez por combate, ao ser alvo de magia inimiga, pode como Reação gratuita realizar um Contra-feitiço (SAB difícil: magia falha)." },

  /* --- ÚNICO: tema Aether --- */
  { tier: "unico", name: "Couraça do Aralto Capturado", physDefense: 8, magDefense: 8, weight: 12, movePenalty: 1, req: "FOR/INT",
    story: "Armadura forjada com o fragmento da essência de um Aralto capturado e neutralizado — a primeira vez na história que isso aconteceu. O processo foi longo e perigoso; metade dos artesãos não sobreviveu. A armadura retém algo da natureza entre-planos do Aralto: quem a veste é parcialmente visível em ambos os planos simultaneamente.",
    uniqueAbility: "Forma Liminar (1x/dia, 4 rodadas): o portador existe em dois planos simultaneamente. Efeitos: ataques físicos têm 35% de chance de atravessar o portador sem causar dano; o portador pode ver e atacar criaturas invisíveis ou espectrais normalmente; criaturas do Deus Marcado testam SAB (difícil) ao início de cada turno ou ficam Aterrorizadas pelo portador por 1 rodada.",
    note: "Passivo: imune a efeitos de Corrupção da Marca. Detecta presença de Araltos em raio 50m (o portador sente um formigamento no pescoço)." },
  /* ── Raras com tradeoffs ── */
  { tier: "raro", name: "Armadura de Osso Reforçado", physDefense: 7, magDefense: 0, weight: 14, movePenalty: 2, req: "FOR",
    story: "Placas de osso de criatura colossal, reforçadas com metal. Extremamente resistente mas pesada e sem proteção mágica alguma.",
    note: "⚠ Defesa Física alta mas −2 em Movimento e vulnerabilidade mágica: dano mágico é aumentado em +1d4 (o osso conduz energia mágica)." },
  { tier: "raro", name: "Malha do Reflexo Invertido", physDefense: 4, magDefense: 4, weight: 7, movePenalty: 0, req: "AGI",
    story: "Malha encantada que absorve energia cinética e a redistribui — mas a redistribuição não é sempre previsível.",
    note: "⚠ Ao receber dano, rola 1d4: (1) 50% do dano é refletido ao atacante; (2-3) funciona normalmente; (4) o portador sofre +1d4 extra (o encantamento sobrecarrega). Defesa equilibrada mas imprevisível." },
  { tier: "raro", name: "Couro do Predador", physDefense: 3, magDefense: 2, weight: 4, movePenalty: -1, req: "AGI",
    story: "Couro de uma criatura das planícies que caçava em silêncio absoluto. Ao vestir, o portador herda parte do instinto do animal.",
    note: "+1 Movimento (movePenalty negativo = bônus). +1d6 em testes de Furtividade. MAS o portador fica levemente mais agressivo — ao receber dano em combate, faz Teste de Força de Vontade (normal) ou usa sua próxima Ação para atacar o agressor (não para mover ou usar habilidade)." },
  { tier: "raro", name: "Placa do Guardião Imóvel", physDefense: 9, magDefense: 1, weight: 20, movePenalty: 3, req: "FOR alto",
    story: "A armadura mais pesada que pode ser forjada sem magia. Um guerreiro que a usa é uma fortaleza — que não se move.",
    note: "⚠ Defesa Física máxima para tier raro, mas −3 Movimento e imobilidade parcial: se o portador não se mover neste turno, ganha +2 de Defesa Física adicional (bônus passivo de posição). Ideal para tanques que seguram linha." },


  /* ── AMALDIÇOADAS — Armaduras ── */
  { tier: "unico", cursed: true,
    name: "Armadura do Sofrimento", physDefense: 0, magDefense: 0, weight: 8, movePenalty: 0, req: "FOR/SAB",
    story: "Armadura sem placas visíveis — apenas superfície polida que reflete a dor do portador. Quem a usa não sente a armadura, mas sente tudo o que a armadura absorve de volta, dobrado. Construída por um clérigo que acreditava que sofrimento era o caminho para a divindade.",
    note: "⚠ AMALDIÇOADA — Dor Dobrada: HP máximo é DOBRADO enquanto equipada (os dois extras aparecem na ficha). MAS TODOS os recursos de combate são reduzidos pela metade arredondado para baixo: Ações÷2, Reações÷2, Ações de Reação÷2, Ações de Magia÷2, Movimento÷2. Além disso, todo dano sofrido causa dor real — o portador faz Força de Vontade (normal) ou fica Atordoado por 1 rodada (a dor é insuportável mesmo que a armadura aguente).",
    magicBonus: { hp: 999 },
    curseDetails: "Dungeon: Templo do Sofrimento Eterno (Deserto Carmesim, dif.4). O HP dobrado é calculado pelo app como +999 HP — o Mestre deve aplicar manualmente o dobro e reverter os recursos." },

  { tier: "lendario", cursed: true,
    name: "Casca do Caranguejo Primordial", physDefense: 12, magDefense: 0, weight: 25, movePenalty: 4, req: "FOR alto",
    story: "Não é uma armadura forjada — é a casca real de um Caranguejo Primordial que habitava o fundo do Grande Lago antes de Magnalaga existir. Quando o portador a veste, a casca se funde parcialmente com seu corpo. Difícil de tirar. Muito difícil.",
    note: "⚠ AMALDIÇOADA — Fusão Parcial: Defesa Física 12 (a maior do mundo). Mas −4 Movimento, imune a Empurrão e Derrubada (bom) E também imune a Recuar e Movimento Voluntário (ruim — o portador literalmente não consegue se mover mais de 1 hex por Ação de Movimento). Para TIRAR a armadura: requer 30 minutos e teste de FOR (crítico) ou assistência de um clérigo. Se forçar a remoção sem o teste, perde 2d10 HP máx permanentemente.",
    curseDetails: "Localização: Fundo do lago, na câmara do Caranguejo Primordial (dif.4, único encontro no jogo com esta criatura)." },


  /* ══════════════════════════════════════════════════════════
     ARMADURAS DIVINAS
     ══════════════════════════════════════════════════════════ */

  /* ── AETHEA ── */
  { tier: "ancestral", divine: "Aethea", race: "elfo",
    name: "Véu da Memória de Aethea", physDefense: 4, magDefense: 8, weight: 1, movePenalty: 0, req: "INT/SAB",
    story: "Não é uma armadura no sentido tradicional — é uma névoa de luz solidificada que se adapta ao corpo. Tecida por Aethea a partir de memórias dos elfos que morreram sob escravidão. O portador às vezes vê flashes das memórias dos mortos — não é assustador, é como estar cercado de família.",
    note: "🌟 DIVINO: Defesa Mágica 8 (a maior do jogo). Passivo: o portador não pode ser alvo de magia de ilusão, domínio ou controle mental — Aethea guarda a mente. Uma vez por combate: 'Véu dos Mortos' — por 2 rodadas torna-se parcialmente intangível, reduzindo dano físico em 75% (arredondado para baixo). Aliados em raio 4 hex veem as memórias dos elfos e ganham +1d6 em Força de Vontade." },

  /* ── THURGOMUR ── */
  { tier: "ancestral", divine: "Thurgomur", race: "anão",
    name: "Couraça de Pedra Viva de Thurgomur", physDefense: 11, magDefense: 3, weight: 22, movePenalty: 2, req: "FOR",
    story: "Thurgomur fundiu sua própria 'pele de rocha' — a camada de pedra que protege o núcleo da montanha — em forma de armadura para o primeiro Rei Anão. A armadura respira. Literalmente. O portador sente o ritmo de respiração da terra enquanto a usa.",
    note: "🌟 DIVINO: Defesa Física 11. Passivo: ao receber qualquer dano, a armadura gera 1 ponto de 'Pedra Acumulada'. A cada 5 pontos: a armadura lança uma réplica de pedra em um inimigo (2d8 dano, testa FOR dif.normal ou Derrubado). Não há limite de acúmulo. Uma vez por dia: 'Coração da Montanha' — torna-se completamente imune a dano por 1 rodada (a pedra absorve tudo)." },

  /* ── RAS'KURU ── */
  { tier: "lendario", divine: "Ras'kuru", race: "orc",
    name: "Capa de Sangue de Ras'kuru", physDefense: 5, magDefense: 2, weight: 3, movePenalty: 0, req: "FOR",
    story: "Não é armadura — é uma capa de couro de um ser que nunca existiu no plano material, presenteada a orcs que sobreviveram a batalhas impossíveis. A capa tem a cor do sangue seco e nunca mancha com sangue novo — simplesmente absorve e escurece. Orcs velhos dizem que cada mancha é uma batalha que a capa lembra.",
    note: "🌟 DIVINO: Passivo — a cada dano recebido, ganha +1 de Defesa Física temporária para o próximo ataque recebido (acumula até +6, reseta a cada turno). Quando ativada 'Clamor de Ras'kuru' (1x/combate): por 3 rodadas, todo dano sofrido é convertido em 50% de cura (sofre dano mas recupera metade como HP)." },

  /* ── TOBI ── */
  { tier: "lendario", divine: "Tobi", race: "goblin",
    name: "Capuz Invisível de Tobi", physDefense: 2, magDefense: 2, weight: 0.3, movePenalty: -1, req: "DEX/AGI",
    story: "Tobi desapareceu por 3 horas uma vez e voltou com este capuz. Ninguém sabe onde ele esteve. O capuz tem um remendo em formato de estrela que não combina com o resto do tecido — provavelmente de outro capuz completamente diferente. Goblins que o usaram relatam que às vezes o capuz ri baixinho no escuro.",
    note: "🌟 DIVINO: +1 Movimento. Passivo: a primeira vez que alguém ataca o portador em cada combate, o ataque tem 50% de chance de errar automaticamente (Tobi 'desvia' o portador sem ele perceber). Uma vez por combate: 'Sumiço do Tobi' — o portador se torna completamente invisível por 2 rodadas (ataques contra ele têm 75% de chance de errar; ele pode atacar normalmente)." },


  /* ══════════════════════════════════════════════════════════
     COMBOS DE SUBCLASSE — Armaduras
     ══════════════════════════════════════════════════════════ */

  /* ── SET: Manto do Necromante (peça 3) ── */
  { tier: "magico", subclass: "necromante", setName: "Manto do Necromante",
    name: "Manto de Névoa Cinza (Manto do Necromante)", physDefense: 1, magDefense: 4, weight: 1, movePenalty: 0, req: "SAB",
    story: "Um manto que não projeta sombra ao sol. A névoa que o compõe é real — partículas de ecto do plano dos mortos tecidas em fibra. Quem usa sente um frio suave no pescoço. Sempre.",
    note: "Passivo: o portador é considerado parcialmente etéreo — ataques de criaturas vivas têm 15% de chance de passar (rola 1d20, em 1-3 passa). Mortos-vivos e espíritos atacam normalmente.",
    setBonus: { pieces: 3, ability: "Colheita das Almas",
      effect: "Com as 3 peças do Manto: Colheita das Almas (ver Ceifador). Além disso: mortos-vivos inimigos em raio 3 hex têm −1d6 em todos os testes (o manto os desorienta — reconhecem o ecto)." } },

  /* ── SET: Raiz e Ramo (peça 2) — Druida ── */
  { tier: "magico", subclass: "druida", setName: "Raiz e Ramo",
    name: "Capa de Casca e Folha (Raiz e Ramo)", physDefense: 3, magDefense: 2, weight: 2, movePenalty: 0, req: "SAB",
    story: "Tecida com capas de árvores que morreram por causas naturais — nenhuma foi cortada. Druidas passam meses coletando as cascas. A capa eventualmente para de parecer feita por alguém: parece simplesmente que sempre existiu assim.",
    note: "Em terreno natural: Defesa Física +2 (a capa se adapta ao ambiente). Em forma de animal (Forma Selvagem): a capa incorpora-se à forma e mantém os bônus de defesa na forma animal.",
    setBonus: { pieces: 3, ability: "A Floresta Responde",
      effect: "Ver Cajado Raiz-Viva (2 peças adicionais ativam o bônus completo)." } },

  /* ── SET: Fúria Encadeada (peça 2) — Berserker ── */
  { tier: "lendario", subclass: "berserker", setName: "Fúria Encadeada",
    name: "Armadura da Cólera (Fúria Encadeada)", physDefense: 6, magDefense: 1, weight: 14, movePenalty: 1, req: "FOR",
    story: "Chapas de metal pintadas com o sangue do portador original. A pintura nunca seca. O sangue novo se adiciona ao velho. Ninguém sabe quantos portadores a usaram — cada ferida na armadura tem uma história que ela não conta.",
    note: "Ao receber dano: ganha 1 carga de Ira (máximo 5). Cada carga de Ira adiciona +1d4 de dano no próximo ataque. As cargas resetam ao fim do combate. Em Limiar da Morte: as cargas são dobradas automaticamente.",
    setBonus: { pieces: 3, ability: "Corrente Sem Fim",
      effect: "Ver Machado Correntes (2 peças adicionais ativam o bônus completo)." } },

  /* ── SET: Voto de Aço e Luz (peça 3) — Paladino ── */
  { tier: "lendario", subclass: "paladino", setName: "Voto de Aço e Luz",
    name: "Couraça do Juramento Eterno (Voto de Aço e Luz)", physDefense: 8, magDefense: 4, weight: 18, movePenalty: 1, req: "FOR/SAB",
    story: "Armadura forjada sobre um altar de Sanctum durante 7 dias de oração ininterrupta. Cada placa foi banhada em água benta. O ferreiro disse que quando a última placa resfriou, as outras ficaram quentes por 1 hora — como se a armadura estivesse viva.",
    note: "Passivo: ao receber dano abaixo de 50% HP, um escudo de luz surge — próximo ataque contra o portador tem −1d6 de dano (a luz absorve). Imposição das Mãos usada enquanto usa esta couraça recupera +1d6 HP extra.",
    setBonus: { pieces: 3, ability: "Golpe do Juramento Cumprido",
      effect: "Com as 3 peças: ao cumprir um Juramento Sagrado neste combate — próximo acerto é dano máximo + 3d8 sagrado, aliados em raio 5 hex curam 1d10 HP." } },

,

  /* ─── SET: Lâmina das Runas — Armadura ─────────────────────── */

  { tier: "raro", name: "Couraça das Runas Inscritas", physDefense: 5, magDefense: 4,
    movePenalty: 0, weight: 7, req: "FOR",
    setName: "Lâmina das Runas", subclass: "runa-lamina",
    effect: "Quando o portador recebe dano físico: 20% de chance de a armadura absorver o dano e converter em 1 Runa carregada gratuitamente (não gasta recurso). As runas na armadura brilham ao ativar Escudo Arcano Rúnico: o escudo absorve +4 de dano extra.",
    note: "20% chance de converter dano recebido em Runa gratuita. Escudo Arcano Rúnico +4 de absorção.",
    story: "Um ferreiro de Valdris passou 3 anos gravando runas nas placas uma a uma. A armadura aprendeu sozinha a completar as que ficaram incompletas." },

  /* ─── SET: Marca do Caçador — Armadura ─────────────────────── */

  { tier: "raro", name: "Couro do Caçador de Presas", physDefense: 4, magDefense: 2,
    movePenalty: 0, weight: 5, req: "FOR",
    setName: "Marca do Caçador", subclass: "cacador-gigantes",
    effect: "Em combate contra inimigos de tamanho Grande ou maior: +1 Def.Física adicional por cada hit recebido deles (até +3). O portador é imune a condição Derrubado causada por criaturas de tamanho Colossal. Ao usar Anatomia de Besta: percebe automaticamente se o alvo está abaixo de 50% HP.",
    note: "Acumula +Def.Física contra ataques de Grandes (até +3). Imune a Derrubado de criaturas Colossais.",
    story: "Cada remendo e costura desta armadura foi feito com material de uma criatura diferente. O Caçador que a usou antes matou 22 gigantes." },

  /* ─── SET: Véu das Sombras Sagradas — Sussurro Sombrio ─────── */

  { tier: "raro", name: "Manto do Deus Sombrio", physDefense: 3, magDefense: 5,
    movePenalty: 0, weight: 4, req: "SAB",
    setName: "Véu das Sombras Sagradas", subclass: "sussurro-sombrio",
    effect: "Passivo: +1 Carga de Veneno máxima adicional. Quando o portador aplica Veneno Sagrado: +1 rodada de duração (somando ao passivo da subclasse, total +2 rodadas extras). À noite ou em área escura: +1 Def.Física adicional.",
    note: "+1 Carga de Veneno máxima. Veneno Sagrado dura +1 rodada extra. Noite: +1 Def.Física.",
    story: "Tecido de seda negra abençoado em ritual de meia-noite por um sacerdote que não recorda o que disse. O deus lembra." },

  /* ─── SET: Sombra Dupla — Armadura ─────────────────────────── */

  { tier: "raro", name: "Armadura da Penumbra", physDefense: 3, magDefense: 3,
    movePenalty: 0, weight: 3.5, req: "DEX",
    setName: "Sombra Dupla", subclass: "cacador-sombrio",
    effect: "Em Furtividade: +2 Def.Física e +2 Def.Mágica adicionais. Ao sair de Furtividade para atacar (Emboscada Perfeita): o 1º ataque tem Def.Física do alvo reduzida em 2 (o portador sabe exatamente onde golpear). Movimento de Fantasma dura +1 rodada quando usada.",
    note: "Em Furtividade: +2 Def.Física e +2 Def.Mágica. Emboscada: alvo com −2 Def.Física. Fantasma +1 rodada.",
    story: "Confeccionada em tecido de Sombra Florestal — a criatura que os ladinos de Akaen chamam de 'quem andou aqui antes de você'." },

  /* ─── INSPIRADOS EM ELDEN RING — Armaduras ──────────────────── */

  { tier: "lendario", name: "Armadura do Cavaleiro da Lua Cheia",
    physDefense: 6, magDefense: 8, movePenalty: 0, weight: 8, req: "INT",
    magicBonus: { attr: "INT", attrValue: 1, slots: 1 },
    effect: "Passivo: +1 INT, +1 Slot. Magias de Nível 3+ lançadas pelo portador têm o custo de Ações de Magia reduzido em 1 (mínimo 1). À luz da lua ou em ambientes escuros: +1 Def.Física adicional e +1d4 em todos os testes de Arcanismo. Imune à condição Confuso.",
    note: "+1 INT, +1 Slot. Magias Nível 3+: −1 Ação de Magia. Noite/escuridão: +1 Def.Física e +1d4 Arcanismo.",
    story: "Usada pelos Cavaleiros de Rennala — magos que aprenderam a lutar, ou guerreiros que aprenderam a conjurar. A distinção importava para eles. O resultado importa para quem os enfrenta." },

  { tier: "lendario", name: "Couraça do Guerreiro Manchado",
    physDefense: 8, magDefense: 3, movePenalty: 0, weight: 9, req: "FOR",
    magicBonus: { attr: "FOR", attrValue: 1 },
    effect: "Passivo: +1 FOR. Cada vez que o portador cai abaixo de 50% HP pela primeira vez no combate: a armadura absorve o excesso de dano por 1 rodada completa (imunidade a dano nesta rodada). Isso ocorre uma vez por combate automaticamente. Cicatrizes visíveis na armadura aumentam em número — cada batalha sobrevivida deixa marca permanente no couro.",
    note: "+1 FOR. 1x/combate ao cair abaixo de 50% HP: 1 rodada de imunidade a dano automática.",
    story: "O Guerreiro Manchado sobreviveu a tudo. Batalhas, maldições, doenças, o próprio Deus Marcado. Eventualmente cansou de sobreviver e abandonou a armadura num campo vazio. Ela ainda está em pé. Esperando o próximo usuário." },

  { tier: "ancestral", name: "Vestes do Rei Elden",
    physDefense: 5, magDefense: 10, movePenalty: 0, weight: 4, req: "SAB",
    magicBonus: { attr: "INT", attrValue: 2, attr2: "SAB", attrValue2: 2, slots: 2 },
    effect: "Passivo: +2 INT, +2 SAB, +2 Slots. O portador nunca pode ser reduzido a 0 HP por um único ataque — qualquer golpe que causaria dano fatal deixa o portador com exatamente 1 HP em vez disso. Este efeito funciona 1x por combate. Após usar: as vestes ficam parcialmente translúcidas por 1d4 rodadas (o poder se recarrega). Imune a maldições de nível menor e médio.",
    note: "+2 INT, +2 SAB, +2 Slots. 1x/combate: qualquer golpe fatal → 1 HP em vez de morte. Imune a maldições menores/médias.",
    story: "As vestes do último Rei de Aether — antes de Aether ter reinos, quando havia apenas um. O rei desapareceu e as vestes ficaram dobradas sobre um trono que ninguém mais reconhece. Quem as usa sente o peso de decisões que nunca foram suas." },

  /* ─── LOOT DE MONSTROS — ARMADURAS ────────────────────── */

  { tier:"raro", name:"Armadura do Cavaleiro Sem Nome",
    physDefense:9, magDefense:1, movePenalty:1, weight:18,
    req:"FOR",
    effect:"Armadura negra de cavaleiro antigo. Altíssima proteção física. MALDITA: o portador tem pesadelos toda noite enquanto equipada (-1d4 em perícias no dia seguinte por cansaço). A maldição pode ser removida com Cura Mágica de Nível 4+ ou ritual especial.",
    note:"Def.Fís 9. Maldita: pesadelos (−1d4 em perícias no dia seguinte). Loot: Cavaleiro Sem Cabeça.",
    story:"Ninguém sabe o nome do cavaleiro. A armadura também não conta." },

  /* ─── ARMADURAS DE ORC ─────────────────────────────────────────── */

  /* COMUNS */
  { tier:"comum", name:"Couro de Porco-Espinho Orc",
    physDefense:2, magDefense:0, weight:5, movePenalty:0,
    req:"—",
    note:"Couro de porco-espinho das Planícies costurado à mão. Barata e funcional. Os espinhos externos causam 1d2 de dano reflexivo a quem atacar em melee sem luvas." },

  { tier:"comum", name:"Malha de Ferro Bruto Orc",
    physDefense:4, magDefense:0, weight:10, movePenalty:0,
    req:"FOR",
    note:"Anéis de ferro bruto forjados em forja de clã. Irregular e ruidosa — −1d4 em testes de Furtividade. Mas o ferro orc é mais grosso que o humano: +1 HP por nível enquanto equipada." },

  { tier:"comum", name:"Placas de Osso de Ogro",
    physDefense:5, magDefense:0, weight:14, movePenalty:1,
    req:"FOR",
    note:"Placas de osso de ogro amarradas com couro. Pesada e restritiva — −1 Movimento — mas resistente. Grude: ataques que tentem Desarmar o portador têm −2 de chance de sucesso (os ossos trancam a arma)." },

  /* RAROS */
  { tier:"raro", name:"Armadura do Campeão de Clã",
    physDefense:7, magDefense:2, weight:12, movePenalty:0,
    req:"FOR",
    story:"Armadura cerimonial do campeão do Clã Prateleira de Ossos. Mistura placas de ferro orc com couro de bestia e adornos de dentes dos inimigos derrotados pelo portador anterior.",
    note:"O rugido do portador (Ação Livre, 1x/combate) intimida todos os inimigos em raio 3 hex: testam SAB (normal) ou ficam Abalados por 1 rodada. A armadura ressoa o som." },

  { tier:"raro", name:"Pele de Ogro Curtida",
    physDefense:8, magDefense:1, weight:16, movePenalty:1,
    req:"FOR",
    story:"Curtida por métodos orc: sol, sal e tempo. A pele de ogro tem espessura incomum — o ferreiro que a preparou levou três semanas só no curtimento.",
    note:"−1 Movimento. Acertos físicos que causariam Sangramento no portador têm 50% de chance de ser absorvidos pela espessura da pele (não aplicam Sangramento). Imune a Derrubado causado por ataques físicos leves (dano < 10)." },

  { tier:"raro", name:"Armadura Talhada do Xamã-Ferreiro",
    physDefense:6, magDefense:5, weight:9, movePenalty:0,
    req:"FOR/SAB",
    story:"Criada pelo xamã-ferreiro Drak'ul com técnicas que mesclam metalurgia orc e rituais de proteção mágica. Os entalhes rúnicos na superfície queimam suavemente ao toque.",
    note:"Incomum para armadura orc: oferece proteção mágica sólida. Magias de área que atingirem o portador têm efeito reduzido em −INT do conjurador (mínimo 0). 1x/combate: ao ser acertado por magia, pode refletir 1d6 de dano mágico ao conjurador." },

  /* MÁGICAS */
  { tier:"magico", name:"Couraça de Sangue de Dragão Orc",
    physDefense:9, magDefense:4, weight:13, movePenalty:0,
    req:"FOR",
    magicBonus:{ attr:"FOR", attrValue:1 },
    story:"Forjada com escamas de dragão jovem caçado pelo Clã da Prateleira de Ossos e banhos em seu sangue. O processo de forja durou quarenta dias — o ferreiro não dormiu uma noite.",
    note:"+1 FOR enquanto equipada. Passivo: ao atingir HP ≤ 30%, o portador entra em Fúria de Dragão por 3 rodadas — +1d8 em todos os ataques, imune a Aterrorizado e Confuso. Pode ocorrer apenas 1x por combate." },

  { tier:"magico", name:"Armadura do Warchief Ancestral",
    physDefense:10, magDefense:5, weight:17, movePenalty:1,
    req:"FOR",
    magicBonus:{ attr:"FOR", attrValue:2 },
    story:"Passada de Warchief a Warchief por gerações do Grande Clã. Nenhum ferreiro sabe mais como foi criada. Os espíritos dos Warchiefs anteriores vivem no metal — e eles têm opiniões.",
    note:"+2 FOR enquanto equipada. −1 Movimento. Passivo: aliados em raio 3 hex ganham +1d4 em todos os testes de resistência (a presença do Warchief fortalece o clã). Ativo (1x/combate): os espíritos dos Warchiefs anteriores concedent proteção divina — o portador recebe Def.Física adicional igual ao FOR por 2 rodadas." },

  /* ── ARMADURAS SERPENTARIANAS ────────────────────────────────── */

  /* COMUNS */
  { tier:"comum", name:"Vestes de Iniciado Serpentariano",
    physDefense:1, magDefense:2, weight:2, movePenalty:0,
    req:"—",
    note:"Vestes de seda sagrada de Serpentara bordadas com padrões de escama. Baixa proteção física mas surpreendente resistência mágica para uma veste comum. Iniciados as recebem ao entrar no templo e as costuram eles mesmos." },

  { tier:"comum", name:"Couro de Cobra-das-Ruínas",
    physDefense:3, magDefense:1, weight:4, movePenalty:0,
    req:"—",
    note:"Couro de Serpente Constritora das Ruínas curtido com técnicas serpentarianas ancestrais. Silencioso ao movimento — sem penalidade em Furtividade. Resistente à umidade e venenos externos (o portador tem vantagem em testes de resistência a veneno ambiental)." },

  { tier:"comum", name:"Escamas de Patrulheiro",
    physDefense:4, magDefense:2, weight:6, movePenalty:0,
    req:"FOR/DEX",
    note:"Armadura de escamas serpentarianas costuradas em sobreposição — cada escama colocada manualmente pelo patrulheiro que a usa. Silenciosa, flexível e resistente. Padrão da infantaria leve de Serpentara." },

  /* RARAS */
  { tier:"raro", name:"Armadura do Guardião da Escama",
    physDefense:6, magDefense:5, weight:8, movePenalty:0,
    req:"FOR/DEX",
    story:"Armadura exclusiva dos Guardiões da Escama — a elite de combate de Serpentara que protege os santuários internos. Cada set demora seis meses para ser feito: as escamas são colhidas em vida das cobras sagradas, que as oferecem voluntariamente.",
    note:"Imune a veneno enquanto equipada (as escamas têm imunidade natural). Passivo: ataques melee que acertarem o portador têm 20% de chance (d10 ≤ 2) de ricochetearem nas escamas — o atacante sofre 1d4 de dano cortante. Em combate adjacente a aliado serpentariano: +1 Def.Física adicional (formação de escudo de escamas)." },

  { tier:"raro", name:"Vestes do Sacerdote Maior de Jurgmund",
    physDefense:3, magDefense:8, weight:3, movePenalty:0,
    req:"SAB/INT",
    story:"Tecidas com fios de seda de Cobra-Rainha e tingidas com o sangue purificado dos três rituais anuais de Jurgmund. O padrão de escamas desloca a luz levemente — em ambientes escuros, o portador parece levemente irreal.",
    note:"Magias de veneno lançadas pelo portador têm +1d6 de dano extra. Passivo: uma vez por turno, ao ser acertado por magia, pode fazer SAB (normal) para absorver parte da energia — reduz o dano em −SAB (mínimo 0). Ativo (2x/combate): Escudo de Fé Serpentariana — por 2 rodadas, toda magia que causar menos de 8 de dano após def. mágica é anulada." },

  { tier:"raro", name:"Couraça do Cavaleiro Serpentariano",
    physDefense:8, magDefense:4, weight:11, movePenalty:0,
    req:"FOR",
    story:"Usada pelos cavaleiros montados de Serpentara — elite que combate sobre cobras-montaria gigantes. A couraça é feita de escamas de Cobra-Rainha adulta temperadas em fogo sagrado de Jurgmund. Perfeita em aparência; assustadora em combate.",
    note:"Em crítico recebido: 30% de chance (d10 ≤ 3) de que as escamas desviem o golpe, convertendo o crítico em dano normal. Passivo: cobra-montaria ou aliado cobra em raio 3 hex ganha +1d4 em todos os ataques (o cavaleiro inspira as bestas de Jurgmund)." },

  /* MÁGICAS */
  { tier:"magico", name:"Armadura Sagrada do Sumo Sacerdote",
    physDefense:7, magDefense:12, weight:7, movePenalty:0,
    req:"SAB",
    magicBonus:{ attr:"SAB", attrValue:2 },
    story:"Existe apenas uma dúzia delas no mundo — uma para cada templo de Jurgmund reconhecido. Quando o Sumo Sacerdote morre, a armadura é dissolvida em ritual e reforjada para o sucessor. Não pode ser roubada sem consequências divinas.",
    note:"+2 SAB enquanto equipada. Imune a veneno e a maldições de origem serpentariana. Passivo: magias de cura lançadas pelo portador curam +SAB de HP adicional. Ativo (1x/combate): Graça de Jurgmund — emite aura em raio 4 hex por 3 rodadas. Aliados na aura: +1d6 em todos os testes. Inimigos: −1d4 em todos os testes e testam SAB (difícil) ou ficam Aterrorizados por 1 rodada." },

  { tier:"magico", name:"Escamas da Serpente Imortal",
    physDefense:10, magDefense:10, weight:9, movePenalty:0,
    req:"FOR/SAB",
    magicBonus:{ attr:"FOR", attrValue:1, attr2:"SAB", attrValue2:1 },
    story:"Fragmentos da pele da Serpente Imortal de Jurgmund — coletados durante os intervalos de muda, que ocorrem uma vez a cada cem anos. Tecidos em armadura por um ferreiro-oráculo em transe de sete dias. A armadura muda levemente de cor conforme a luz.",
    note:"+1 FOR, +1 SAB enquanto equipada. Imune a veneno e à condição Envenenado. Passivo: regenera 2 HP por rodada passivamente (a imortalidade da Serpente ressoa no portador). Ao atingir 0 HP pela primeira vez no combate: a armadura pulsa com energia divina — o portador sobrevive com 10 HP e fica imune a dano por 1 turno (a Serpente Imortal nega a morte uma vez). Funciona 1x por descanso longo." },

  /* ── ARMADURAS ÉLFICAS ───────────────────────────────────────── */

  /* LENDÁRIO */
  { tier:"lendario", divine:"Aethea", race:"elfo",
    name:"Vestes da Maga Primordial",
    physDefense:4, magDefense:14, weight:1.5, movePenalty:0,
    req:"INT/SAB",
    magicBonus:{ attr:"INT", attrValue:2, attr2:"SAB", attrValue2:1, slots:2, spellActions:1 },
    story:"Vestes de uma das sete Magas Primordiais — as elfas que sustentaram o céu durante a Grande Tempestade antes de qualquer deus intervir. Elas nunca receberam nomes nas histórias humanas. As vestes lembram o nome da delas.",
    note:"+2 INT, +1 SAB, +2 Slots, +1 Ação de Magia. Magias defensivas (proteção, cura, barreira) lançadas pelo portador custam −1 Slot (mínimo 1). Passivo: qualquer magia de área que atingir o portador sofre −INT de dano (o campo mágico antigo nas vestes dissipa energia). Ativo (1x/combate): As Sete Magas — o portador canaliza o espírito das sete e lança automaticamente Barreira Rúnica + Véu de Ilusão sem custo de Slot ou Ação Magia (os dois juntos, simultaneamente)." },

  { tier:"lendario", divine:"Aethea", race:"elfo",
    name:"Armadura do Cavaleiro Estelar",
    physDefense:9, magDefense:9, weight:5, movePenalty:0,
    req:"DEX/INT",
    magicBonus:{ attr:"DEX", attrValue:2, critChance:1, dodge:1 },
    story:"Os Cavaleiros Estelares eram os guerreiros-magos da corte de Akaen — os únicos que podiam lutar enquanto lançavam magias de nível 4 sem interrupção. Havia dezessete deles. Esta armadura pertenceu ao décimo quarto. Os outros dezesseis estão em tumbas que ninguém encontrou.",
    note:"+2 DEX, +1 Crit, +1 Esquiva. A armadura é tão fina que parece tecido — mas tem a resistência de aço encantado. Passivo: o portador pode lançar magias enquanto ataca fisicamente no mesmo turno sem penalidade (normalmente exigiria habilidade especial). Passivo: ricochete estelar — 15% de chance (d10 ≤ 1 ou 2 dependendo da sorte) de que dano mágico recebido seja parcialmente desviado, reduzindo em −DEX. Ativo (1x/combate): Bênção Estelar — todos os aliados em raio 4 hex ganham +1d6 em todos os ataques e esquivas por 2 rodadas." },

  /* ANCESTRAL */
  { tier:"ancestral", divine:"Aethea", race:"elfo",
    name:"Éter-Armadura dos Elfos Primordiais",
    physDefense:8, magDefense:16, weight:2, movePenalty:0,
    req:"INT/SAB",
    magicBonus:{ attr:"INT", attrValue:3, attr2:"SAB", attrValue2:2, slots:4, spellActions:2, dodge:2 },
    story:"Não é metal. Não é tecido. É éter solidificado — a substância do plano entre planos que os elfos primordiais aprenderam a tecer antes de descobrir o fogo. A armadura pré-existe ao mundo. Ela estava aqui antes dos elfos a encontrarem, e estará aqui quando todos partirem.",
    note:"+3 INT, +2 SAB, +4 Slots, +2 Ações de Magia, +2 Esquiva. Passivo: qualquer magia que atinja o portador tem 50% de ser absorvida pela éter-armadura (converte o dano em MP regenerado no próximo turno do portador — 1 MP para cada 5 de dano absorvido). Passivo: o portador não precisa dormir — a éter-armadura filtra as toxinas do cansaço. Ativo (1x/sessão): Forma Etérea — por 3 rodadas, o portador torna-se parcialmente imaterial: imune a dano físico, pode atravessar paredes, mas não pode atacar fisicamente (apenas magias). Aliados que tocarem o portador durante a Forma Etérea curam 2d6 HP." },

  { tier:"ancestral", divine:"Aethea", race:"elfo",
    name:"Couraça do Último Rei de Akaen",
    physDefense:12, magDefense:10, weight:6, movePenalty:0,
    req:"FOR/DEX/INT",
    magicBonus:{ attr:"FOR", attrValue:1, attr2:"DEX", attrValue2:2, attr3:"INT", attrValue3:2, critChance:2, dodge:2 },
    story:"Akaen era rei, mago e guerreiro — três funções que nenhum elfo ousaria combinar, e que ele carregou com graça insolente. Esta couraça foi forjada para ele no dia de sua coroação por ferreiros que morreram na mesma semana, o processo os esgotou. Ela lembra cada batalha que Akaen travou.",
    note:"+1 FOR, +2 DEX, +2 INT, +2 Crit, +2 Esquiva. Req: FOR ≥ 1, DEX ≥ 1, INT ≥ 1. Passivo: o portador ganha 1 Ação de Combate adicional no primeiro turno de cada combate (Akaen sempre atacou primeiro). Passivo: ao atingir HP ≤ 30%, a couraça emite pulso de energia élfica — todos os inimigos em raio 4 hex sofrem 2d8 de dano de luz e testam SAB (difícil) ou ficam Abalados por 2 rodadas (a dor de Akaen reage). Ativo (1x/combate): Memória de Rei — por 2 rodadas, o portador age duas vezes por turno (turno dobrado completo, não apenas ações extras)." },

  /* ── ARMADURAS MÍTICAS ───────────────────────────────────────── */

  { tier:"raro", name:"Couro de Basilisco Cego",
    physDefense:6, magDefense:3, weight:7, movePenalty:0,
    req:"FOR/DEX",
    story:"Um Basilisco cego — seja de nascença ou por intervenção — não tem o poder de petrificação no olhar. Mas a pele mantém parte da qualidade petrificante. Este couro foi curtido por um artesão que usou ácido de salamandra para neutralizar 90% do efeito. Os outros 10% ficaram propositalmente.",
    note:"Passivo: ataques melee que acertarem o portador têm 15% de chance (d10 ≤ 1) de que o atacante sinta rigidez momentânea — perde 1 Ação no turno seguinte (a pele ainda petrifica um pouco). Passivo: o portador é imune à habilidade Olhar Petrificante de qualquer criatura (a imunidade do couro se transfere). Resistente a veneno: venenos causam −2 de dano por dado enquanto esta armadura está equipada." },

  { tier:"raro", name:"Escamas de Leviatã — Armadura Parcial",
    physDefense:7, magDefense:4, weight:12, movePenalty:0,
    req:"FOR",
    story:"Escamas de Leviatã jovem coletadas por mergulhadores do fundo do oceano. Cada escama tem o tamanho de um prato. O processo de preparo envolve semanas de imersão em água salgada com ervas específicas para evitar que as escamas continuem crescendo (elas crescem durante 3 dias após a separação do corpo).",
    note:"Passivo: imune a dano de água e pressão. Passivo: ataques físicos que causariam Sangramento no portador têm 40% de chance de não aplicá-lo (as escamas bloqueiam os cortes superficiais). Em combate subaquático ou sob chuva intensa: +1 Def.Física adicional (as escamas se fecham mais hermeticamente em contato com água). O portador não afoga." },

  { tier:"magico", name:"Penas da Fênix — Vestes",
    physDefense:3, magDefense:8, weight:2, movePenalty:0,
    req:"—",
    magicBonus:{ attr:"SAB", attrValue:1 },
    story:"Penas de Fênix coletadas de um ninho abandonado. A Fênix não as perdeu por morte — ela simplesmente deixou o ninho e as penas ficaram. Quem trabalhou com elas afirma que as penas se recusaram a ser transformadas em qualquer coisa que não fosse para proteção.",
    note:"+1 SAB. Passivo: ao ser reduzido a 0 HP, as vestes explodem em chamas protetoras — o portador sobrevive com 1 HP e todos os inimigos adjacentes sofrem 1d8 de dano de fogo (a Fênix nega a morte uma vez por combate). Passivo: imune a fogo e dano de calor. Ativo (1x/combate): as penas flamejam — o portador emite luz em raio 4 hex por 2 rodadas; criaturas que dependem de escuridão (mortos-vivos, demônios, criaturas das sombras) sofrem −1d6 em todos os ataques enquanto na luz." },

  { tier:"lendario", name:"Couraça de Grifo Adulto",
    physDefense:10, magDefense:6, weight:9, movePenalty:0,
    req:"FOR/DEX",
    magicBonus:{ attr:"DEX", attrValue:1, dodge:1 },
    story:"O peito de um Grifo adulto — a parte mais dura do corpo da criatura, forjada por décadas de voo em velocidade extrema. Nenhum ferreiro sabe bem como fazer essa armadura funcionar sem que o peso a torne impraticável; quem a usa descobre que ela parece mais leve do que deveria. O Grifo ainda tem opiniões sobre isso.",
    note:"+1 DEX, +1 Chance de Esquiva. Passivo: o portador pode saltar até 4 hex verticalmente ou horizontalmente sem custo de Movimento adicional (os músculos do Grifo infundem). Em altura ou superfícies elevadas: +1d6 em todos os ataques físicos (o instinto de caça aéreo do Grifo). Ativo (1x/combate): Mergulho de Grifo — o portador corre e salta sobre um alvo até 6 hex de distância, causando 2d10+DEX de dano. O alvo testa AGI (difícil) ou fica Derrubado." },

  { tier:"lendario", name:"Armadura de Quimera — Três Naturezas",
    physDefense:9, magDefense:9, weight:11, movePenalty:0,
    req:"FOR/INT",
    story:"Três partes de três Quimeras diferentes: o peitoral de leão, os espaldares de cabra-montês, e a calda-proteção de serpente. Cada parte foi adquirida separadamente por um colecionador que morreu antes de ver a armadura completa. Seu herdeiro a completou. A armadura não combinou perfeitamente — as três naturezas ainda brigam entre si. O portador sente isso.",
    note:"Passivo: resistência a três tipos de dano simultaneamente — fogo (−2/dado), veneno (−2/dado), físico contundente (−2/dado). Passivo: ao início de cada turno, uma das três naturezas assume controle aleatoriamente (d6: 1-2 Leão=+1d6 ataque físico; 3-4 Cabra=+1 Esquiva; 5-6 Serpente=acertos aplicam Veneno leve 1d4/rodada por 2 rodadas). O portador não controla qual natureza — a armadura decide. Ativo (1x/combate): as três naturezas alinham-se por 2 rodadas — todos os três bônus ativos simultaneamente." }];

const ACCESSORIES = [
  /* --- COMUNS --- */
  { tier: "comum", name: "Anel de Vitalidade", weight: 0.1, effect: "+5 HP máximo." },
  { tier: "comum", name: "Anel de Foco Arcano", weight: 0.1, effect: "+1 Slot de Magia." },
  { tier: "comum", name: "Amuleto de Fé", weight: 0.5, effect: "+1d4 de Fé máxima ou +1 Defesa Mágica." },
  { tier: "comum", name: "Bracelete de Reflexos", weight: 0.3, effect: "+1 Reação por rodada." },
  { tier: "comum", name: "Botas Ágeis", weight: 1, effect: "+1 Movimento." },
  { tier: "comum", name: "Pedra de Mana", weight: 0.4, effect: "+1d4 de MP máximo." },
  { tier: "comum", name: "Frasco de Antídoto Permanente", weight: 0.5, effect: "Recarrega 1 Carga de Veneno por dia." },

  /* --- RAROS --- */
  { tier: "raro", name: "Capa Furtiva do Caçador", weight: 1, effect: "+1d4 em testes de Furtividade e Percepção.",
    story: "Tecida com fibras de planta noturna que cresce apenas em florestas onde o Lobo e a Cobra convivem. A capa muda ligeiramente de cor dependendo do ambiente." },
  { tier: "raro", name: "Cinto do Berserker da Lua", weight: 0.5, effect: "+1d4 de Fúria ao receber dano (em vez de +1). Máximo de Fúria +1d4.",
    story: "Gravado com fases da lua em couro de lobo, este cinto foi usado por um guerreiro que lutou sozinho contra um exército durante uma noite de lua cheia. Ele morreu no amanhecer, mas o exército também." },
  { tier: "raro", name: "Talismã do Guardião de Pedra", weight: 0.3, effect: "+1d4 de Defesa Física quando HP < 30%. Se HP < 15%, o bônus sobe para +1d6.",
    story: "Esculpido em pedra das ruínas de Durrak por um sobrevivente da Grande Invasão. O talismã absorveu tanto sangue de guerreiros que respondeu com vida própria." },
  { tier: "raro", name: "Pingente da Cura Acelerada", weight: 0.2, effect: "Magias e habilidades de cura do portador adicionam +1d4 aos dados de cura.",
    story: "Criado por um curandeiro de Serpentara que passava o dia inteiro curando feridos. O cristal absorveu tanto poder de cura que agora pulsa com luz dourada em campo de batalha." },

  /* --- MÁGICOS --- */
  { tier: "magico", name: "Olho da Serpente", weight: 0.2, effect: "Uma vez por dia: vê através de ilusões e mentiras mágicas por 1 hora. +1d4 em testes de Investigação.",
    story: "Um olho de vidro encantado com o sangue de uma cobra oracular de Jurgmund. Os sacerdotes dizem que, ao olhar pelo cristal, você vê o mundo como a Serpente Sagrada o vê — sem véus." },
  { tier: "magico", name: "Anel do Eco Distante", weight: 0.1, effect: "A primeira magia conjurada a cada combate não consome Slot de Magia. +1d4 em testes de Arcanismo.",
    story: "O mago Verath passou 20 anos tentando criar um anel que guardasse uma magia para emergências. Quando conseguiu, o primeiro feitiço guardado foi o de abrir uma porta trancada — e ele morreu achando que desperdiçara a vida toda." },
  { tier: "magico", name: "Braçadeira do Contra-Golpe da Loba", weight: 0.4, effect: "Uma vez por combate: ao sofrer um Erro Crítico do atacante, realiza um contra-ataque imediato como Reação gratuita causando +1d6 de dano extra.",
    story: "Usada por guerreiras do culto da Loba Branca, devotas do Deus Marcado que acreditam que a melhor defesa é deixar o inimigo se expor. A braçadeira registra cada golpe desviado em runas invisíveis." },

  /* --- LENDÁRIOS --- */
  { tier: "lendario", name: "Corrente da Serpente Imortal", weight: 0.3, effect: "Passivo: imunidade a venenos. +1d8 em testes de Resistência contra magia. Uma vez por dia: ao ser reduzido a 0 HP, regera 1d8 HP por rodada por 3 rodadas antes de cair.",
    story: "Tecida com elos de escamas da Serpente Imortal — cobra lendária que Jurgmund criou para testar seus devotos mais puros. Cada elo representa uma vida que a serpente devorou e devolveu transformada. A corrente pesa menos que ar, mas é indestrutível." },
  { tier: "lendario", name: "Dente do Primeiro Lobo", weight: 0.1, effect: "Passivo: +1d6 em todos os testes de Intimidação. Ataques corpo a corpo do portador aplicam Medo (alvo perde 1 Ação na próxima rodada, uma vez por combate). Uma vez por semana: convoca a presença do Deus Marcado — todos os inimigos visíveis testam Resistência difícil ou ficam Amedrontados por 3 rodadas.",
    story: "O primeiro dente do lobo primordial criado pelo Deus Marcado, antes de assumir sua forma divina. Foi enterrado nas fundações de Durrak como amuleto de proteção — e a cidade resistiu três séculos de ataques antes de finalmente cair." },


  /* --- MÁGICOS (novos) --- */
  { tier: "magico", name: "Amuleto do Lobo Guia", weight: 0.3, effect: "+1d8 em testes de Percepção e Pressentimento. Uma vez por dia: sente a direção de qualquer ser Marcado ou Amaldiçoado em até 1km.",
    story: "Esculpido em madeira de carvalho negro e envolto em pelo de lobo sagrado do Deus Marcado. Quem o usa relata sonhos com lobos durante a noite." },
  { tier: "magico", name: "Anel da Escama Iridescente", weight: 0.1, effect: "+1d6 de Defesa Mágica contra qualquer magia. Uma vez por sessão: reflete uma magia de volta ao conjurador (custa 1 Reação).",
    story: "Lapidado de uma escama da barriga de uma Cobra-Dragão — criatura rara que vive na fronteira entre o plano de Jurgmund e o mundo. A escama mudava de cor com a magia ambiente." },
  { tier: "magico", name: "Colar dos Ossos da Lua", weight: 0.4, effect: "+1d8 de dano natural corpo a corpo durante a noite. Durante o dia, o colar fica inerte mas não pode ser removido.",
    story: "Coleção de fragmentos de ossos deixados por Lobos do Vazio que foram mortos durante o ritual da Lua da Marca. O clero do Deus Marcado os ensartou como troféu e oferenda." },

  /* --- LENDÁRIOS (novos) --- */
  { tier: "lendario", name: "Coroa de Espinhos da Serpente", weight: 0.5, effect: "Passivo: +1d12 em testes de Arcanismo e Conhecimento. Magias de ilusão e charme custam 1 Slot a menos (mínimo 0). Uma vez por combate: ao ser atacado corpo a corpo, os espinhos refletem 1d8 de dano de veneno no atacante automaticamente.",
    story: "Criada para o Grande Sacerdote de Jurgmund que governou Serpentara por 80 anos sem envelhecer. Quando ele finalmente morreu — ou desapareceu, segundo outros relatos — a coroa foi escondida em três caixas separadas. Alguém a remontou." },
  { tier: "lendario", name: "Medalhão da Alcateia Eterna", weight: 0.3, effect: "Passivo: o portador sempre sabe a posição de aliados conhecidos em até 500m. +1d8 em testes de Atletismo e Resistência. Uma vez por semana: convoca 2 Lobos Fantasma (HP 20, Dano 1d8) que obedecem ao portador por 3 combates.",
    story: "Passado de campeão em campeão do Deus Marcado por gerações. Cada dono anterior gravou seu nome na borda interior — há 34 nomes, dos quais apenas 12 estão na história conhecida." },

  /* --- RAROS: Bônus de ações/reações/magia --- */
  { tier: "raro", name: "Bracelete de Combate Acelerado", weight: 0.3,
    magicBonus: { },
    effect: "+1 Reação por rodada. Reflete diretamente no campo Reações das Estatísticas de Combate.",
    story: "Bracelete com engrenagens mínimas de prata e ouro que respondem ao pulso do portador. Desenvolvido por engenheiros anões da Cidadela do Casco que precisavam reagir mais rapidamente durante os mergulhos de Magnalaga." },
  { tier: "raro", name: "Anel da Ação Dupla", weight: 0.1,
    magicBonus: { actions: 1 },
    effect: "+1 Ação de Combate por rodada. Passivo permanente.",
    story: "Anel com dois rubis sobrepostos — o segundo parece vibrar levemente. Usuários descrevem a sensação de que seu braço se move antes de decidirem mover." },
  { tier: "raro", name: "Amuleto do Conjurador Ágil", weight: 0.4,
    magicBonus: { spellActions: 1 },
    effect: "+1 Ação de Magia por rodada. Passivo permanente.",
    story: "Cristal de mana em forma de serpente em espiral — reminiscente dos cultos de Jurgmund, mas de origem pré-batalha. Amplifica os canais de energia mágica naturais do portador." },
  { tier: "raro", name: "Elmo do Reflexo Rápido", weight: 2.0,
    magicBonus: { },
    effect: "+1 Ação de Reação por rodada.",
    story: "Elmo com viseira dupla que amplia o campo de visão periférico. Guardas de fronteira de Valdris os usam para detectar ataques laterais. O encantamento adicional foi desenvolvido após a primeira aparição dos Cultistas do Aralto." },

  /* --- MÁGICOS: Múltiplos bônus de ações + atributos + vida --- */
  { tier: "magico", name: "Colar da Reação Arcana", weight: 0.3,
    magicBonus: { spellActions: 1 },
    effect: "+1 Reação, +1 Ação de Reação e +1 Ação de Magia por rodada. Permite conjurar magias como Reação sem custo extra de Ação.",
    story: "Criado pela Grande Maga Sela de Arcath para os poucos estudantes que conseguiam dividir atenção entre combate e conjuração. Apenas três foram feitos — e um está desaparecido junto com um estudante." },
  { tier: "magico", name: "Elmo do Herói Inabalável", weight: 2.5,
    magicBonus: { hp: 15 },
    effect: "+1 Reação por rodada e +15 HP máximo. Os +15 HP aparecem imediatamente na aba Vital ao equipar.",
    story: "Elmo forjado em honra ao Guerreiro Valdris, com seu brasão gravado na fronte. Versões menores são distribuídas para os campeões do Reino de Valdris. Esta versão foi encantada por um mago de Arcath para reforçar tanto a resistência quanto os reflexos." },
  { tier: "magico", name: "Botas da Investida Rápida", weight: 1.2,
    magicBonus: { actions: 1, move: 1 },
    effect: "+1 Ação de Combate e +1 Movimento por rodada. Passivo permanente.",
    story: "Botas de couro com solas de pele de Karlac Filhote. O calor residual da pele transmite urgência aos pés do portador — quem as usa raramente fica parado." },
  { tier: "magico", name: "Cinto da Capacidade Colossal", weight: 0.6,
    magicBonus: { carry: 20, hp: 5 },
    effect: "+20 de Carga máxima e +5 HP máximo. Ambos refletem nas Estatísticas de Combate ao equipar.",
    story: "Cinto com fivela no formato de tartaruga — inspirado na Tartaruga Magnalaga. Anões da Cidadela do Casco criaram estes cintos para carregar mais material durante expedições subaquáticas ao redor do casco." },
  { tier: "magico", name: "Anel do Sangue de Campeão", weight: 0.1,
    magicBonus: { attr: "FOR", attrValue: 1, hp: 10 },
    effect: "+1 FOR e +10 HP máximo. O bônus de FOR reflete em dano natural, carga e HP conforme os cálculos normais do atributo.",
    story: "Anel passado entre campeões do Reino de Valdris. Diz-se que foi selado com o sangue do próprio Guerreiro Valdris no dia em que fundou o reino. Cada portador que morreu em batalha deixou um fragmento de força no metal." },
  { tier: "magico", name: "Talismã da Mente Aguda", weight: 0.2,
    magicBonus: { attr: "INT", attrValue: 1, spellActions: 1 },
    effect: "+1 INT e +1 Ação de Magia por rodada. O bônus de INT afeta Slots de Magia e Ações de Magia normalmente.",
    story: "Talismã de cristal azul com veios dourados internos que parecem se mover. Pertenceu à linha de acadêmicos de Arcath e é dado a estudantes excepcionais na conclusão dos estudos avançados." },
  { tier: "magico", name: "Pingente da Serpente Vital", weight: 0.3,
    magicBonus: { hp: 20, attr: "SAB", attrValue: 1 },
    effect: "+20 HP máximo e +1 SAB. O bônus de SAB afeta cura, Fé e percepção normalmente. O +20 HP aparece na aba Vital imediatamente.",
    story: "Pingente com uma cobra enroscada em âmbar — fossilizado há milênios, antes da Batalha Colossal. Serpentarianos consideram este item uma relíquia sagrada de Jurgmund. Curadores de todas as classes o cobiçam." },
  { tier: "magico", name: "Pulseira da Destreza Arcana", weight: 0.2,
    magicBonus: { attr: "DEX", attrValue: 1 },
    effect: "+1 DEX e +1 Ação de Reação por rodada. Bônus de DEX afeta testes que usam o atributo.",
    story: "Pulseira de prata com runas de precisão gravadas na face interna. Originária da escola de Arcath — criada para conjuradores que precisavam de destreza para gestos mágicos complexos." },
  { tier: "magico", name: "Anel da Agilidade do Caçador", weight: 0.1,
    magicBonus: { attr: "AGI", attrValue: 1, actions: 1 },
    effect: "+1 AGI e +1 Ação de Combate por rodada. Bônus de AGI afeta Ações, Ações de Reação, Esquiva e Movimento.",
    story: "Anel forjado com liga de osso de Lobo Alfa e prata do deserto. Os Caçadores das Planícies o consideram o presente mais valioso que um mestre pode dar a um aprendiz que completou sua primeira caçada perigosa." },

  /* --- LENDÁRIOS: Bônus poderosos múltiplos --- */
  { tier: "lendario", name: "Coroa dos Cinco Heróis", weight: 0.8,
    magicBonus: { actions: 1, spellActions: 1, hp: 25 },
    effect: "+1 Ação, +1 Reação, +1 Ação de Reação, +1 Ação de Magia por rodada e +25 HP máximo. Todas as estatísticas refletem imediatamente ao equipar.",
    story: "Criada pelos cinco heróis fundadores no dia da vitória sobre o Deus Marcado como símbolo de sua aliança eterna. Cada gema representa um herói: rubi (Guerreiro Valdris), safira (Maga Arcath), esmeralda (Arqueiro Ferrath), ônix (Ladina Sombrath), opala (Clérigo Sanctum). Reaparece periodicamente nas mãos de quem 'precisa ser todos ao mesmo tempo'.",
    uniqueAbility: "Unidade dos Heróis (1x/dia): por 3 rodadas, o portador age com as capacidades combinadas dos cinco heróis — pode usar qualquer habilidade de qualquer classe como se fosse da sua. Ao fim das 3 rodadas, fica Exausto por 1 rodada." },
  { tier: "lendario", name: "Manoplas da Força do Orc", weight: 1.5,
    magicBonus: { attr: "FOR", attrValue: 2, hp: 20, carry: 25 },
    effect: "+2 FOR, +20 HP máximo e +25 Carga máxima. O +2 FOR afeta todos os cálculos que dependem do atributo — incluindo HP, dano e carga.",
    story: "Criadas pelos Orcs das Planícies em honra ao Grande Guerreiro Orc que lutou ao lado de Valdris na Batalha Colossal — um herói tão poderoso que foi ignorado pelos registros humanos mas lembrado eternamente por seu povo. Forjadas de metal das planícies e temperadas com sangue de Lobo do Vazio abatido." },
  { tier: "lendario", name: "Tomo do Arquimago Eterno", weight: 1.8,
    magicBonus: { attr: "INT", attrValue: 2, spellActions: 2, slots: 2 },
    effect: "+2 INT, +2 Ações de Magia por rodada e +2 Slots de Magia. O +2 INT reflete em Slots de Magia (cumulativo) e em todos os cálculos que usam INT.",
    story: "O grimório pessoal da Maga Arcath, que ela deixou selado na Torre antes de morrer. Apenas abre para quem demonstra conhecimento arcano genuíno (INT ≥ 4 ou Arcanismo Crítico). Contém anotações da própria Arcath — incluindo o sistema de magia original que ela desenvolveu ao aprender com os elfos." },
  { tier: "lendario", name: "Botas da Velocidade do Vazio", weight: 0.9,
    magicBonus: { actions: 2, move: 2 },
    effect: "+2 Ações de Combate, +2 Ações de Reação e +2 Movimento por rodada.",
    story: "Criadas por um Aralto que foi capturado e convertido — um raro caso de redenção. O ex-Aralto usou o conhecimento de movimento do Vazio para criar botas que permitem ao portador mover-se com a velocidade que os servos do Deus Marcado usavam para fugir. Foram deixadas como legado para 'aqueles que precisam alcançar o que o mal alcança'.",
    note: "Passivo: o portador nunca provoca Ataques de Oportunidade ao se mover." },

  /* ── Raros com tradeoffs ── */
  { tier: "raro", name: "Anel do Eco de Sangue", weight: 0.1,
    effect: "Uma vez por combate, quando reduzido a ≤ 25% HP, os próximos 2 ataques causam +1d10 de dano extra (raiva desesperada). Mas ao ativar, perde todas as Reações nesta rodada.",
    story: "Anel com pedra vermelha que pulsa quando o portador está perto da morte. Encontrado no cadáver de um gladiador que venceu 40 combates antes de perder o 41°." },
  { tier: "raro", name: "Amuleto da Memória de Batalha", weight: 0.3,
    effect: "Passivo: o portador nunca esquece a sequência de ataques que recebeu — após sofrer 2 ataques do mesmo inimigo, ganha +1d4 na Esquiva contra aquele inimigo específico pelo resto do combate. MAS o amuleto consome atenção: −1 em testes de Percepção durante todo o combate enquanto está focando no padrão.",
    story: "Amuleto com fragmento de espelho dentro do cristal — literalmente para 'enxergar os seus erros'. Criado por um duelista que sobreviveu ao primeiro golpe de todo combate por 20 anos." },
  { tier: "raro", name: "Cinto da Sobrecarga Controlada", weight: 0.5,
    magicBonus: { carry: 15 },
    effect: "+15 de Carga máxima. Uma vez por sessão, pode carregar o dobro do peso normal por 1 hora sem penalidade. Após a hora, fica Exausto (−1d4 em todos os testes) por 30 minutos.",
    story: "Cinto de anões da Cidadela do Casco, projetado para as corridas de evacuação durante os mergulhos de Magnalaga. Funciona em surtos." },
  { tier: "raro", name: "Luvas do Golpe Certeiro", weight: 0.4,
    effect: "Uma vez por turno, ao usar a primeira Ação de Combate para atacar, pode re-rolar o dado de acerto e usar o melhor resultado. MAS se ambos os resultados forem falha, a luva 'trava' — não pode usar esta habilidade novamente até o fim do combate.",
    story: "Luvas com mecanismo de mola na palma que aumenta a velocidade do primeiro soco ou golpe. Xingadas por seus donos tanto quanto amadas." },
  { tier: "raro", name: "Botas do Passo Tardio", weight: 0.9,
    effect: "+2 Movimento. Uma vez por turno, pode mover-se como Ação de Reação (fora do turno) para sair do alcance de um ataque antes que ele seja resolvido. MAS usar o Passo Tardio custa 1 Ação de Combate do seu próximo turno.",
    story: "Botas com solas encantadas para reagir ao perigo — mas o encantamento é antiquado e lento para se 'recarregar', custando energia do próximo turno." },
  { tier: "raro", name: "Capuz do Predador Noturno", weight: 0.5,
    effect: "Visão no escuro (enxerga até 10 hex em escuridão total). +1d6 em Furtividade. MAS em ambientes bem iluminados (luz solar ou mágica intensa), −1d4 em Percepção e Acerto (sensibilidade à luz).",
    story: "Capuz de um caçador que viveu nas cavernas sob as Montanhas de Atrelon por décadas. Os olhos se adaptaram. O portador herda a adaptação — e o custo." },
  { tier: "raro", name: "Elmo do Ódio Canalizado", weight: 2,
    magicBonus: { hp: 8 },
    effect: "+8 HP máximo. Passivo: ao receber qualquer dano, o próximo ataque do portador neste turno (ou no seguinte, se já atacou) adiciona +1d6 de dano. A raiva alimenta o golpe. MAS o portador tem −1d4 em testes de Força de Vontade enquanto o elmo está equipado — a raiva é difícil de controlar.",
    story: "Elmo com viseira que projeta a silhueta de quem causou dano. Portadores relatam que parece 'ensinar' quem merece sofrer em seguida." },

  /* --- ÚNICOS (novos) --- */
  { tier: "unico", name: "Olho de Jurgmund", weight: 0.1, effect: "Substitui um olho do portador permanentemente. Vê no escuro absoluto, vê através de invisibilidade e ilusão, e detecta mentiras automaticamente. Uma vez por dia: lança 'Visão do Abismo' — olha para além do plano físico por 1 minuto, vendo espíritos, entidades e segredos que o mundo material esconde.",
    story: "O próprio Jurgmund arrancou este olho de sua forma mortal e o deu a uma sacerdotisa que perdeu a visão protegendo seu templo. Quando ela morreu, o olho se fechou — e reapareceu décadas depois em outra pessoa que o encontrou dormindo. Dizem que o olho escolhe seu hospedeiro.",
    uniqueAbility: "Olhar da Serpente (1x/dia): fita um alvo visível por 1 rodada inteira sem agir. O alvo deve testar SAB (difícil) ou fica Paralisado por 1d4 rodadas, incapaz de se mover ou atacar. Se o alvo falhar por margem de 5+, fica Dominado pelo mesmo período." },

  /* --- ÚNICOS --- */
  { tier: "unico", name: "Máscara do Pregador da Cobra", weight: 0.5, effect: "Enquanto equipada: o portador fala com qualquer criatura serpentina naturalmente. Testes de Lábia e Persuasão contra humanos adicionam +1d8. Uma vez por sessão: pode lançar 'Hipnose da Cobra Sagrada' — um alvo visível fica Dominado por 3 rodadas, seguindo ordens simples.",
    story: "Pertencia ao Grande Pregador Vael'orn, que percorreu o continente por 40 anos convertendo cidades inteiras ao culto de Jurgmund com apenas palavras e o olhar desta máscara. Quando morreu, a máscara simplesmente desapareceu de seu rosto e reapareceu décadas depois nas ruínas de um templo destruído.",
    uniqueAbility: "Hipnose da Cobra Sagrada: 1 alvo visível a até 6 hex fica Dominado por 3 rodadas. Durante a dominação, segue ordens de uma frase simples ('Largue a arma', 'Durma', 'Proteja-me'). O efeito quebra se o alvo sofrer dano. Imune: criaturas cegas ou sem mente definida." },
  /* --- SETS integrados --- */
  { tier: "magico", setName: "Berserker", name: "Cinto de Garras de Lobo (Berserker)", weight: 0.5,
    effect: "Ao iniciar combate, ganha +1d4 de Fúria automático. Custo de habilidades de Fúria −1 (mín 1). SET — Berserker (3/3): Ira Sem Limite.",
    setBonus: { pieces: 3, ability: "Ira Sem Limite", effect: "Ao abater um inimigo, repete o valor exato de dano num segundo alvo em alcance sem re-rolar dados. Sem custo de Ação. (1x/batalha)" },
    story: "Presas de Lobo Alfa montadas em couro. Guerreiros que o usam relatam sentir o instinto de caça ativar antes de ver o inimigo." },

  { tier: "magico", setName: "Lâmina Livre", name: "Capa de Esgrima (Lâmina Livre)", weight: 1,
    effect: "+1d4 na Chance de Esquiva. Uma vez por combate, ao errar um ataque, pode imediatamente tentar segundo ataque no mesmo alvo como Reação (sem custo de Ação). SET — Lâmina Livre (2/2): Fluxo de Combate.",
    setBonus: { pieces: 2, ability: "Fluxo de Combate", effect: "Dois acertos no mesmo turno contra o mesmo inimigo → terceiro ataque causa dano máximo automático." },
    story: "Capa levíssima de escola de esgrima com forro de escamas de serpente. Se expande ao detectar impactos." },

  { tier: "raro", setName: "Muralha de Durrak", name: "Bracelete de Ferro do Guardião (Muralha de Durrak)", weight: 0.6,
    effect: "+1d4 Defesa Física. Uma vez por combate, ao ser alvo de Ataque de Oportunidade, cancela automaticamente (sem custo de Ação). SET — Muralha de Durrak (3/3): Bastião Inabalável.",
    setBonus: { pieces: 3, ability: "Bastião Inabalável", effect: "Reação gratuita: ao aliado adjacente receber dano letal, você absorve todo o dano (Resistência normal: metade). (1x/batalha)" },
    story: "Bracelete dos guardas de elite de Durrak. Cada soldado promovido recebia um." },

  { tier: "raro", setName: "Caçador da Marca", name: "Aljava do Caçador (Caçador da Marca)", weight: 1,
    effect: "Aljava mágica: nunca fica sem flechas (1 flecha/turno regenerada). Flechas geradas causam +1d4 contra alvos Marcados. SET — Caçador da Marca (3/3): Presa Marcada para Morte.",
    setBonus: { pieces: 3, ability: "Presa Marcada para Morte", effect: "Marcar Alvo dura o combate inteiro. Primeiro ataque à distância/turno contra o Marcado acerta automaticamente." },
    story: "Aljava que aprende os padrões de munição do portador e os replica. Criada por um arqueiro que ficou sem flechas no momento mais crítico." },

  /* --- LENDÁRIOS: tema Aether --- */
  { tier: "lendario", name: "Fragmento de Memória de Karlac", weight: 0.3,
    effect: "Cristal carmesim que vibra levemente. Passivo: o portador sente tremores e movimentos de criaturas colossais em raio de 1km. Uma vez por dia: ao meditar com o cristal por 10 minutos, recebe uma visão do passado recente da área (últimas 24h) através dos olhos de Karlac. Em batalha: uma vez por combate, ao ser atingido, pode converter o dano em calor e redistribuí-lo como 1d10 de fogo em todos os inimigos adjacentes.",
    story: "Cristal formado naturalmente nas entranhas de Karlac e expelido durante um círculo. O Grande Karlac Yorven os guarda como relíquias — mas este foi dado como pagamento por algo que o portador fez pela Cidade Viva." },

  { tier: "lendario", name: "Escama Dourada do Dragão", weight: 0.1,
    effect: "Escama concedida voluntariamente pelo Dragão Dourado de Karloth a quem ele considera digno. Passivo: o portador é imune a efeitos de Medo e Amedrontamento. +1d8 em testes de SAB. Auras negativas (Corrupção, Maldição da Marca) têm dificuldade dobrada para afetar o portador. Uma vez por semana: ao enfrentar criatura do Deus Marcado, pode invocar a Memória do Dragão — por 3 rodadas, todos os ataques do portador causam +1d10 de luz sagrada adicional.",
    story: "Nenhuma escama dourada é igual a outra — o dragão escolhe quando e para quem dar. Dizem que cada escama lembra a batalha que o receptor lutará no futuro, e foi escolhida especificamente para aquele momento." },

  { tier: "lendario", name: "Pedra do Casco Vivo de Magnalaga", weight: 0.4,
    effect: "Fragmento do casco de Magnalaga com musgo bioluminescente ainda vivo. Passivo: o portador regenera 1d4 HP por turno (ativo mesmo fora de combate, máx 1x/minuto). Imune a veneno e ácido. Uma vez por combate: ao ficar abaixo de 25% HP, o casco reage — forma uma carapaça que reduz todo dano sofrido em 1d8 por 2 rodadas (ativa automaticamente, sem custo de Ação).",
    story: "O Rei Burrak guardou esta pedra por 40 anos, dizendo que pertencia a quem realmente precisasse dela. O musgo não para de crescer — cada semana há mais um milímetro." },

  /* --- ÚNICOS: tema Aether --- */
  { tier: "unico", name: "Olho do Aralto Sussurrante", weight: 0.1,
    effect: "Olho de vidro negro retirado do Aralto Sussurrante após sua derrota. Substitui um olho do portador permanentemente. Vê no escuro absoluto; detecta disfarces e ilusões automaticamente (passivo); lê intenções hostis antes de qualquer ação (não pode ser surpreendido). Uma vez por dia: Olhar do Vazio — um alvo visível testa SAB (crítico) ou revela involuntariamente um segredo que guarda, falando em voz alta sem perceber.",
    story: "O Aralto Sussurrante usou este olho para observar e manipular o Rei Vassk por 15 anos. Após sua derrota, o olho sobreviveu — e parece ainda enxergar coisas que não deveriam ser visíveis. Ocasionalmente o portador vê flashes de memórias do Aralto: locais, planos, nomes.",
    uniqueAbility: "Visão Liminar permanente: enxerga entidades do Vazio e Araltos mesmo em disfarce perfeito. Se estiver em contato com outro olho do Aralto Sussurrante (se existir), ambos compartilham percepção instantânea de qualquer distância." },

  { tier: "unico", name: "Símbolo das Cinco Classes — Herança dos Heróis", weight: 0.3,
    effect: "Medalha que os cinco heróis fundadores criaram juntos no dia em que decidiram fundar reinos. Passou de mão em mão por 500 anos até encontrar o portador atual. Passivo: o portador conta como treinado em qualquer perícia de qualquer classe para fins de testes de Perícia (sem bônus de dano ou habilidade — só o +2 de treinado nos testes). Uma vez por semana: Chamado dos Heróis — por 5 rodadas, o portador acessa uma habilidade aleatória de uma classe que não é a sua (rola 1d4: 1=Golpe Pesado, 2=Tiro Certeiro, 3=Golpe Envenenado, 4=Repreensão Sagrada).",
    story: "Os Cinco Marcos dos Heróis começaram a brilhar quando este símbolo chegou às mãos do portador atual — como se reconhecessem que o ciclo estava se completando.",
    uniqueAbility: "Herança Completa (ativa quando os 5 Marcos são visitados com o símbolo): o portador recebe permanentemente a habilidade passiva de nível 1 de cada uma das outras 4 classes. Este efeito é permanente e não conta como equipamento." },

  /* ══════════════════════════════════════════════════════════
     ACESSÓRIOS AMALDIÇOADOS
     ══════════════════════════════════════════════════════════ */

  /* Amuleto da Muralha Imóvel */
  { tier: "magico", cursed: true,
    name: "Amuleto da Muralha Imóvel", weight: 0.4,
    magicBonus: { },
    effect: "+5 Defesa Física e +5 Defesa Mágica enquanto equipado.",
    story: "Amuleto com o símbolo de uma muralha inquebrável. Proteção absoluta — mas o preço é que a muralha não se move.",
    note: "⚠ AMALDIÇOADA: +5 Def. Física e +5 Def. Mágica (passivo). MAS o portador só pode ter 1 Ação de Combate e 1 Ação de Magia por turno, independente de outros bônus ou habilidades. Qualquer bônus de ação é ignorado. A muralha defende mas não ataca.",
    curseDetails: "Forjado pelos Construtores Anões de Durrak como teste. O arquiteto que o criou nunca se moveu de seu banco de trabalho — foi encontrado morto sentado, sorrindo, com o amuleto no pescoço." },

  /* Cinto da Brutalidade */
  { tier: "magico", cursed: true,
    name: "Cinto da Brutalidade", weight: 0.6,
    magicBonus: { actions: 2 },
    effect: "+2 Ações de Combate por turno enquanto equipado.",
    story: "Cinto de couro de Lobo do Vazio, cravejado com dentes do mesmo animal. Quem o usa sente a fome do lobo — a necessidade de atacar sobrepõe qualquer pensamento complexo.",
    note: "⚠ AMALDIÇOADA: +2 Ações de Combate por turno. MAS o portador PERDE TODAS as Ações de Magia (não pode conjurar nada enquanto equipado, independente de INT ou itens). Magias já ativas continuam, mas não pode iniciar novas. A brutalidade física suprime a mente arcana.",
    curseDetails: "Encontrado no pescoço do Alfa da Alcateia do Vazio (dif.4) — a criatura usava o cinto como troféu de uma batalha antiga." },

  /* Brincos da Dor Eterna */
  { tier: "unico", cursed: true,
    name: "Brincos da Dor Eterna", weight: 0.1,
    effect: "Permite conjurar magias sem gastar Slots de Magia. A magia ainda consome Ação de Magia, mas não usa Slot.",
    story: "Par de brincos de osso vermelho que parecem cobras enroscadas. Foram usados por uma maga que se recusou a parar de conjurar mesmo depois de esgotar toda sua mana — ela descobriu como fazê-lo. O custo foi deixar de dormir por 3 anos.",
    note: "⚠ AMALDIÇOADA — Incapacidade da Dor: Conjura sem gastar Slots. MAS antes de cada conjuração, faz Força de Vontade (normal). Se FALHAR: sente dor agonizante — perde TODAS as Ações deste turno (combate e magia) e fica Atordoado. Se PASSAR: conjura normalmente. A dor piora: a cada 3 magias conjuradas neste combate, a dificuldade sobe (normal→difícil→crítico).",
    curseDetails: "Localização: Câmaras da Maga Sem Sono (Montanhas de Atrelon, dif.3). A própria maga ainda está lá — não morreu, não dorme, apenas conjura eternamente, completamente louca." },

  /* Anel do Rito dos Pombos */
  { tier: "magico", cursed: true,
    name: "Anel do Rito dos Pombos", weight: 0.1,
    effect: "Ativa o Rito dos Pombos: garante Crítico automático no próximo ataque. Ver nota para custo.",
    story: "Anel com uma pomba gravada em posição estranha — de cabeça para baixo. O Rito dos Pombos é uma magia de inversão: para garantir que algo bom aconteça, você aceita que o oposto também seja garantido.",
    note: "⚠ AMALDIÇOADA — Inversão: Ao usar o Rito dos Pombos (1 Ação de Magia), o PRÓXIMO ataque do portador é Crítico Automático (dano máximo). MAS no turno SEGUINTE ao crítico, qualquer Crítico Natural (20) automaticamente vira Falha Crítica (1) — o equilíbrio se inverte. O anel pode ser usado novamente para garantir outro crítico, mas o ciclo de inversão persiste.",
    curseDetails: "Item comum em uma torre de magos excêntricos. Não tem dungeon associada — pode ser vendido por um comerciante que não sabe o que tem." },

  /* Broche do Pacto de Sangue */
  { tier: "lendario", cursed: true,
    name: "Broche do Pacto de Sangue", weight: 0.2,
    magicBonus: { hp: 30, spellActions: 2 },
    effect: "+30 HP máximo e +2 Ações de Magia enquanto equipado.",
    story: "Broche com uma gota de sangue cristalizado no centro. O sangue pertencia a um mago que fez um pacto com uma entidade do plano arcano: poder ilimitado em troca de cada gota de vida. O mago viveu 3 anos depois do pacto — os 3 anos mais produtivos da história arcana de Akaen.",
    note: "⚠ AMALDIÇOADA — Pacto de Sangue: +30 HP e +2 Ações de Magia. MAS a cada sessão (não combate — SESSÃO), o portador perde 5 HP MÁXIMO permanentemente enquanto o broche estiver equipado. O broche não pode ser removido voluntariamente sem um Ritual de Quebra de Pacto (nível 4, apenas Clérigos de Sanctum sabem fazer). Se o portador morrer com o broche, o HP máximo perdido não retorna na ressurreição.",
    curseDetails: "Localização: Biblioteca Proibida de Arcath (dif.3). O ritual de remoção custa 500 moedas de ouro e exige que o Clérigo seja de Sanctum." },

  /* Máscara do Doppelganger */
  { tier: "unico", cursed: true,
    name: "Máscara do Doppelganger", weight: 0.5,
    effect: "Transforma o portador em cópia perfeita de qualquer pessoa vista. A transformação é completa: voz, aparência, cheiro. Dura até ser voluntariamente encerrada.",
    story: "Ninguém sabe quem criou esta máscara — porque quem a usa esquece quem é. Encontrada em uma câmara com 7 espelhos, cada um mostrando um rosto diferente.",
    note: "⚠ AMALDIÇOADA — Identidade Dissolvida: A cada 24 horas disfarçado como outra pessoa, o portador faz Força de Vontade (difícil) ou esquece um detalhe da própria identidade (nome, relacionamento, memória). Acumula. Se acumular 5 esquecimentos, o portador PASSA A SER a pessoa imitada permanentemente — a memória original se dissolve. Cura: apenas Magia de Restauração de Memória (nível 5, raríssima).",
    curseDetails: "Dungeon: Câmara dos Sete Espelhos (em qualquer cidade grande — o Mestre escolhe). O item está lá desde antes da fundação dos reinos." },

  /* Sandálias do Passo Além */
  { tier: "lendario", cursed: true,
    name: "Sandálias do Passo Além", weight: 0.4,
    magicBonus: { move: 4 },
    effect: "+4 Movimento. Permite atravessar paredes e obstáculos sólidos durante o movimento.",
    story: "Sandálias feitas com couro de uma criatura que existe parcialmente em outro plano. Quem as usa literalmente toca dois mundos ao mesmo tempo — e dois mundos também tocam quem as usa.",
    note: "⚠ AMALDIÇOADA — Entre Mundos: +4 Movimento e atravessa paredes. MAS a cada vez que atravessa uma parede ou obstáculo sólido, faz SAB (normal) ou fica Preso Entre Planos por 1 rodada (não pode agir, atacar ou ser atacado — existe em outro estado). Além disso, o portador é parcialmente visível no plano das sombras: criaturas etéreas e espectrais podem atacá-lo normalmente.",
    curseDetails: "Localização: Fissura do Grande Lago (dif.4). As sandálias estão num pedestal no plano adjacente — só alguém parcialmente etéreo pode alcançá-las." },

  /* Coração de Cristal */
  { tier: "unico", cursed: true,
    name: "Coração de Cristal", weight: 0.3,
    magicBonus: { hp: 50 },
    effect: "+50 HP máximo e +2 Reações. Visualmente: cristal que pulsa como coração.",
    story: "O coração literalmente removido de um Golem de Cristal de Atrelon que havia desenvolvido consciência. O Golem pediu para ser desativado — mas seu coração continuou pulsando. Quem o carrega ouve, em momentos de silêncio, um segundo coração batendo.",
    note: "⚠ AMALDIÇOADA — Segundo Coração: +50 HP e +2 Reações. MAS o cristal sente dor. Cada vez que o portador recebe dano, o cristal emite um som suave. Ao chegar abaixo de 50% HP, o cristal chora — e o portador é compelido a se proteger (Força de Vontade difícil ou usa Reações apenas para se defender, nunca para atacar). Se o portador morrer, o cristal explode causando 3d10 em raio 3 hex.",
    curseDetails: "Localização: Núcleo do Golem Consciente (Ruínas de Atrelon, dif.4). O Golem pode ser encontrado antes de ser completamente desativado — e pode PEDIR que os aventureiros levem seu coração para alguém que o mereça." },


  /* ══════════════════════════════════════════════════════════
     ACESSÓRIOS DIVINOS
     ══════════════════════════════════════════════════════════ */

  /* ── AETHEA (Elfos) ── */
  { tier: "ancestral", divine: "Aethea", race: "elfo",
    name: "Lágrima de Aethea", weight: 0.1,
    magicBonus: { slots: 4, spellActions: 1 },
    effect: "+4 Slots de Magia e +1 Ação de Magia. Passivo: magias de cura conjuradas pelo portador curam +1d8 adicional. Uma vez por sessão: 'Restauração de Memória' — restaura um personagem inconsciente ou morto (dentro de 1 hora da morte) com metade do HP máximo. Aethea permite que a memória da pessoa retorne.",
    story: "Uma lágrima cristalizada de Aethea, colhida por uma elfa que estava presente quando a deusa chorou pela escravidão de seu povo. A lágrima nunca derreteu. Passa calor suave para quem a segura — como a mão de alguém que te conhece há muito tempo.",
    curseDetails: "Localização: Tumba da Última Sacerdotisa de Aethea (floresta queimada nos Reinos de Akaen). Só brilha quando uma elfa a toca ou quando está perto de uma memória feliz de elvos." },

  /* ── THURGOMUR (Anões) ── */
  { tier: "ancestral", divine: "Thurgomur", race: "anão",
    name: "Bigorna Miniatura de Thurgomur", weight: 0.8,
    magicBonus: { hp: 20, carry: 20 },
    effect: "+20 HP máximo e +20 Carga. Passivo: ao descansar em qualquer local, pode 'forjar' — conserta qualquer item danificado e pode aprimorar um item por sessão: adiciona +1d4 ao dano de uma arma ou +1 de Defesa a uma armadura (efeito permanente, máximo 3 aprimoramentos por item). Uma vez por dia: 'Bênção da Forja' — o próximo item forjado ou aprimorado pelo portador é abençoado por Thurgomur e ganha um bônus aleatório extra.",
    story: "Uma miniatura da bigorna original de Thurgomur. Quando usada para trabalho real, assume tamanho completo — depois volta ao normal. Anões tocam a bigorna antes de entrar em batalha como ritual. O metal tem a temperatura do centro da terra.",
    curseDetails: "Localização: Oficina de Thurgomur (interior da Tartaruga Magnalaga, câmara mais profunda). Só anões ou ferreiros dedicados podem encontrá-la." },

  /* ── THION (Humanos) ── */
  { tier: "ancestral", divine: "Thion", race: "humano",
    name: "Moeda da Ambição de Thion", weight: 0.1,
    effect: "Passivo: o portador pode aprender qualquer perícia de qualquer classe pagando o custo normal (Thion abre portas). Uma vez por sessão: 'Barganha de Thion' — o portador faz uma proposta a Thion (declarada em voz alta): 'Thion, faço X acontecer e em troca Y acontece'. Thion aceita se a proposta for interessante, ambiciosa e não garantida. O Mestre decide o que Thion acha interessante — geralmente envolve risco real.",
    story: "Uma moeda de ouro com um rosto diferente em cada lado — nunca o mesmo rosto duas vezes que olha. É a única coisa que Thion carrega pessoalmente. Ele a perdeu em uma aposta com outro deus e tem viajado de mortal em mortal esperando que alguém eventualmente a devolva. Ele nunca vai pedí-la de volta diretamente porque isso implicaria que ele quer algo.",
    magicBonus: {},
    curseDetails: "Localização: não tem dungeon — aparece 'por acidente'. Um mendigo a dá como troco. Um pássaro a deixa cair. Thion não tem paciência para dungeons." },

  /* ── RAS'KURU (Orcs) ── */
  { tier: "lendario", divine: "Ras'kuru", race: "orc",
    name: "Dente de Ras'kuru", weight: 0.3,
    magicBonus: { hp: 15 },
    effect: "+15 HP máximo e +1 Reação. Passivo: ao chegar abaixo de 30% HP, entra em 'Fúria de Guerra' automaticamente — +2d6 em todos os ataques por 2 rodadas (Ras'kuru admira quem luta até o fim). Uma vez por combate: 'Rugido de Ras'kuru' — emite um rugido que aplica Amedrontado a todos os inimigos em raio 5 hex por 2 rodadas (Força de Vontade difícil para resistir).",
    story: "Um dente de Ras'kuru que caiu durante a batalha que os orcs travaram pela primeira vez ao lado de Arcath. O deus não precisava de dentes para lutar, mas achou que dar um dente era mais honesto que dar uma espada. Orcs que empunham o dente não ficam com medo — o dente lembra que a morte já lutou ao lado deles antes.",
    curseDetails: "Localização: Pedra Sangrenta (monumento orc na Grande Planície). O Dente está dentro da pedra — só aparece para orcs ou aliados de orcs que derrotaram algo mais forte que eles." },

  /* ── TOBI (Goblins) ── */
  { tier: "lendario", divine: "Tobi", race: "goblin",
    name: "Dado Viciado de Tobi", weight: 0.1,
    effect: "Uma vez por sessão: role o dado de Tobi (o Mestre rola 1d20 em segredo). Resultado 1-5: algo muito ruim acontece para o portador (Tobi errou o alvo). 6-10: nada. 11-15: algo moderadamente bom acontece (item, informação, saída). 16-19: algo muito bom acontece (o Mestre define). 20: Tobi aparece pessoalmente por 1 rodada e resolve um problema à sua maneira — que pode ser pior que o problema original.",
    story: "Um dado de osso com a cara de um goblin em todos os lados — mas números diferentes em cada face. Tobi o usa para decidir praticamente tudo. Ele perde e reencontra este dado mais vezes do que qualquer divindade deveria. Goblins tratam este dado como relíquia sagrada. Não-goblins tratam como lixo perigoso.",
    magicBonus: {},
    curseDetails: "Localização: Mesa de jogo da Taverna Mais Animada de Aether (o Mestre define qual cidade). Tobi frequenta a taverna disfarçado de goblin comum — pode ser identificado porque nunca perde." },

  /* ── JURGMUND (Serpentarianos) ── */
  { tier: "ancestral", divine: "Jurgmund", race: "serpentariano",
    name: "Escama do Coração de Jurgmund", weight: 0.5,
    magicBonus: { hp: 25, slots: 3 },
    effect: "+25 HP máximo e +3 Slots de Magia. Passivo: o portador é imune a veneno natural e mágico — Jurgmund é a maior cobra, e cobra não envenena cobra. Magias de veneno e cura conjuradas pelo portador são amplificadas: +1d8 ao efeito. Uma vez por sessão: 'Sussurro de Jurgmund' — o portador recebe uma visão do futuro próximo (próximos 10 minutos de tempo real de jogo) como viu no momento em que Jurgmund partiu. O Mestre descreve um evento que VAI acontecer, sem garantir como.",
    story: "Uma escama do coração de Jurgmund, diferente das escamas externas — translúcida, com veias de ouro que pulsam levemente. Os Serpentarianos a guardam como objeto mais sagrado do mundo. A Alta Sacerdotisa sabe onde está mas nunca a tocou — Jurgmund deixou claro que a escama esperaria por quem fosse buscá-la, não por quem apenas a guardasse.",
    curseDetails: "Localização: Câmara do Coração (mais profunda do Castelo da Cobra, atrás de um quebra-cabeça de veneno e tempo, dif.4). Só pode ser carregada por alguém em paz com cobras — literalmente: cobras selvagens não atacam o portador." },

  /* ── VERMELHÃO (Karlacs) ── */
  { tier: "ancestral", divine: "Vermelhão", race: "karlac",
    name: "Cinzas de Karloth Sagrado", weight: 0.2,
    magicBonus: { hp: 20, spellActions: 2 },
    effect: "+20 HP máximo e +2 Ações de Magia. Passivo: o portador é imune a dano de fogo comum. Dano de fogo sagrado (do Vermelhão ou da Salamandra Karlac) ainda afeta. Ao receber dano de fogo de qualquer fonte: 25% do dano é convertido em cura. Uma vez por combate: 'Chama de Karloth' — envolve o portador em fogo sagrado por 3 rodadas, causando 1d8 a qualquer inimigo que o atacar corpo a corpo (o fogo defende).",
    story: "Cinzas do primeiro ponto que Karloth explodiu durante a Batalha Colossal. Os Karlacs as carregam em pequenos potes — mas este pote em particular tem cinzas que nunca esfriaram. O pote está morno ao toque. Os Karlacs acreditam que estas são as cinzas do momento exato em que Vermelhão acordou para defender seu povo.",
    curseDetails: "Localização: Primeiro Ponto de Erupção (no núcleo mais antigo do vulcão Karloth, dif.4). O Dragão Dourado guarda a entrada — não para impedir, mas para guiar quem merecedor." },


  /* ══════════════════════════════════════════════════════════
     COMBOS DE SUBCLASSE — Acessórios
     ══════════════════════════════════════════════════════════ */

  /* ── SET: Voz e Melodia (peça 2) — Bardo ── */
  { tier: "raro", subclass: "bardo", setName: "Voz e Melodia",
    name: "Brincos de Pena de Sereia (Voz e Melodia)", weight: 0.05,
    magicBonus: { spellActions: 1 },
    effect: "+1 Ação de Magia. Passivo: a voz do portador fica permanentemente mais persuasiva — +1d6 em todos os testes sociais (Persuasão, Sedução, Negociação). Palavras de Mel: a dificuldade do alvo sobe 1 grau (de normal para difícil).",
    story: "Penas de uma sereia que nunca existiu. Ou assim dizem. Os brincos chegam ao mercado periodicamente sem que ninguém saiba de onde vêm. Os anteriores donos não se lembram de onde os compraram.",
    setBonus: { pieces: 3, ability: "A Música que Move o Mundo",
      effect: "Ver Alaúde de Ossos de Dragão (2 peças adicionais ativam o bônus completo)." } },

  /* ── SET: Voz e Melodia (peça 3) — Bardo ── */
  { tier: "raro", subclass: "bardo", setName: "Voz e Melodia",
    name: "Capa de Palco (Voz e Melodia)", weight: 0.3,
    magicBonus: { move: 1 },
    effect: "+1 Movimento. Passivo: enquanto equipada, o portador nunca tropeça, escorrega ou perde equilíbrio involuntariamente — imune a Derrubado por terreno. Ao usar Inspiração Bárdica: o aliado afetado também ganha +1 Movimento por 2 rodadas.",
    story: "Capa de tecido que parece mudar de cor levemente dependendo da luz. Atores e bardos a chamam de 'a capa que lembra o palco'. Ninguém é desajeitado com ela — o tecido guia os movimentos.",
    note: "Parte do Set Voz e Melodia — ver Alaúde de Ossos de Dragão para o bônus completo.",
    setBonus: { pieces: 3, ability: "A Música que Move o Mundo",
      effect: "Ver Alaúde de Ossos de Dragão." } },

  /* ── SET: O Alquimista Errante (peça 2) — Alquimista ── */
  { tier: "raro", subclass: "alquimista", setName: "O Alquimista Errante",
    name: "Cinto de Frascos do Errante (O Alquimista Errante)", weight: 0.8,
    magicBonus: {},
    effect: "O cinto tem 6 compartimentos especiais para frascos — poções e bombas armazenadas nele podem ser usadas como Ação Livre (em vez de Ação de Combate). +1 slot de poção disponível por combate (pode usar 1 poção extra além do limite normal).",
    story: "Cinto de couro endurecido com fechos de latim. Cada compartimento tem amortecedor interno — o alquimista que o fez aprendeu da maneira difícil que frascos explodem quando você cai.",
    setBonus: { pieces: 3, ability: "Laboratório de Campo",
      effect: "Ver Daga de Extração (2 peças adicionais ativam o bônus completo)." } },

  /* ── SET: O Alquimista Errante (peça 3) — Alquimista ── */
  { tier: "magico", subclass: "alquimista", setName: "O Alquimista Errante",
    name: "Avental Alquímico (O Alquimista Errante)", weight: 0.5,
    magicBonus: { hp: 10 },
    effect: "+10 HP máximo. Passivo: imune a efeitos de ácido e veneno não-sagrado (o avental absorve respingos). Ao criar uma poção ou bomba: tem 25% de chance de criar 1 extra sem custo adicional (o processo produz mais do que esperado).",
    story: "Avental de couro tratado com reagentes que mudaram sua cor permanentemente para um amarelo-esverdeado que nenhum lavador consegue remover. Manchas de coisas indefinidas. Bolsos em lugares onde bolsos não deveriam estar.",
    setBonus: { pieces: 3, ability: "Laboratório de Campo",
      effect: "Com as 3 peças: pode criar qualquer poção nível 1-2 como Ação de Combate usando ingredientes coletados neste combate. 1x/combate." } },

  /* ── SET: Raiz e Ramo (peça 3) — Druida ── */
  { tier: "magico", subclass: "druida", setName: "Raiz e Ramo",
    name: "Anel da Besta Interior (Raiz e Ramo)", weight: 0.05,
    magicBonus: { hp: 15 },
    effect: "+15 HP máximo. Passivo: animais nunca atacam o portador voluntariamente (podem defender-se). Em Forma Selvagem: ganha +2 ao atributo físico primário da forma (urso +2 FOR, águia +2 DEX, lobo +2 AGI).",
    story: "Anel de madeira de árvore fulminada que brotou novamente. No centro, uma pedra verde que pulsa em ritmo diferente do coração do portador — como se houvesse um segundo coração mais lento, mais antigo.",
    setBonus: { pieces: 3, ability: "A Floresta Responde",
      effect: "Com as 3 peças: A Floresta Responde pode ser ativada como Ação Livre, e ao invocar qualquer animal com este set equipado, o animal aparece com +50% HP e +1d6 de dano." } },

  /* ── SET: Fúria Encadeada (peça 3) — Berserker ── */
  { tier: "lendario", subclass: "berserker", setName: "Fúria Encadeada",
    name: "Correntes de Sangue (Fúria Encadeada)", weight: 0.4,
    magicBonus: { },
    effect: "+1 Reação. Passivo: ao ativar Fúria de Batalha, as correntes se enrijecem em torno dos pulsos — o portador fica imune a Desarmado e Agarrado pela duração da Fúria. Sede de Sangue: a cura ao matar aumenta em +1d6 com estas correntes.",
    story: "Correntes de aço que se apertam levemente quando o portador sente raiva. Foram forjadas para conter — mas a raiva sempre ganha. O portador anterior as usou por 10 anos. Depois parou de conseguir tirá-las. Não reclamou.",
    setBonus: { pieces: 3, ability: "Corrente Sem Fim",
      effect: "Com as 3 peças: Fúria de Batalha dura +2 rodadas, ao sair pode entrar em Limiar da Morte sem custo. E o machado pode atacar 2 alvos por Ação durante toda a Fúria (não só 1x)." } },

,

  /* ═══ ACESSÓRIOS DAS 4 NOVAS SUBCLASSES ══════════════════════ */

  /* ─── SET: Lâmina das Runas — Anel (3ª peça) ───────────────── */

  { tier: "lendario", name: "Anel das Runas Vivas",
    slot: ["accessory"], weight: 0.1, req: "INT",
    setName: "Lâmina das Runas", subclass: "runa-lamina",
    magicBonus: { attr: "INT", attrValue: 1 },
    effect: "Passivo: +1 INT. Runas gravadas não se apagam ao detonar — ficam 'dormentes' e se recarregam ao fim de cada rodada (1 Runa recarrega por rodada). Com set completo (3p): Fúria Arcana em raio 4 hex; ao entrar em Transcendência Rúnica, todas as Runas dormentes detonam gratuitamente.",
    note: "+1 INT. Runas dormentes recarregam 1/rodada. SET COMPLETO: Fúria Arcana raio 4 e detonação automática ao entrar em Transcendência.",
    story: "O anel tem 8 faces, cada uma com uma runa diferente. Quando o usuário dorme, os rostos das runas mudam.",
    setBonus: "Lâmina das Runas (3p) — Detonação Total: Fúria Arcana raio 4 hex; Runas dormentes do Anel detonam ao entrar em Transcendência Rúnica; cada detivação do Escudo Arcano Rúnico cria automaticamente 1 Runa." },

  /* ─── SET: Marca do Caçador — Cinto (3ª peça) ──────────────── */

  { tier: "raro", name: "Cinto de Presas do Caçador",
    slot: ["accessory"], weight: 0.5, req: "FOR",
    setName: "Marca do Caçador", subclass: "cacador-gigantes",
    magicBonus: { carry: 10 },
    effect: "Passivo: +10kg de carga. Ao derrotar um inimigo Grande ou maior: guarda automaticamente 1 item de loot deste inimigo (não ocupa espaço de inventário — fica no cinto). Capacidade: até 3 itens de loot. Anatomia de Besta custa 0 Ações enquanto equipado.",
    note: "+10kg carga. Guarda até 3 itens de loot de criaturas grandes. Anatomia de Besta gratuita.",
    story: "Cheio de garras, dentes e pedaços de criaturas que não existem mais. Cada peça é troféu e ferramenta." },

  /* ─── SET: Véu das Sombras Sagradas — Amuleto (2ª peça) ────── */

  { tier: "raro", name: "Amuleto do Deus Proibido",
    slot: ["accessory"], weight: 0.2, req: "SAB",
    setName: "Véu das Sombras Sagradas", subclass: "sussurro-sombrio",
    magicBonus: { attr: "SAB", attrValue: 1 },
    effect: "Passivo: +1 SAB. Sussurro da Dúvida pode ser usado como Ação Livre 1x por combate sem gastar recurso. Execração Divina aplicada por portador com este amuleto: o efeito de chance de atacar aliados aumenta de 20% para 35%.",
    note: "+1 SAB. Sussurro da Dúvida 1x gratuito/combate. Execração Divina mais potente (35% vs 20%).",
    story: "O deus cujo nome está gravado no verso não tem templo. Tem seguidores que preferem assim." },

  { tier: "lendario", name: "Relíquia do Pacto Sombrio",
    slot: ["accessory"], weight: 0.3, req: "SAB",
    setName: "Véu das Sombras Sagradas", subclass: "sussurro-sombrio",
    magicBonus: { attr: "SAB", attrValue: 2, slots: 1 },
    effect: "Passivo: +2 SAB, +1 Slot de Magia. Ao aplicar Veneno Sagrado: 30% de chance de o efeito se propagar para o inimigo mais próximo do alvo original (mesmo dano e duração, sem custo). Bênção Negra: o aliado afetado não perde HP — em vez disso, você perde metade do HP que seria dele.",
    note: "+2 SAB, +1 Slot. 30% propagação de Veneno Sagrado. Bênção Negra: você absorve o custo de HP.",
    story: "O pacto está inscrito na relíquia. Qualquer um pode ler. Ninguém entende as implicações até ser tarde demais.",
    setBonus: "Véu das Sombras Sagradas (3p) — Corrupção Divina: Veneno Sagrado dura +3 rodadas no total; Execração Divina se torna passiva ao início de cada combate (gasta 1 Fé, aplica versão fraca automaticamente em todos os inimigos)." },

  /* ─── SET: Sombra Dupla — Capa (3ª peça) ───────────────────── */

  { tier: "lendario", name: "Manto da Névoa Caçadora",
    slot: ["accessory"], weight: 0.8, req: "AGI",
    setName: "Sombra Dupla", subclass: "cacador-sombrio",
    magicBonus: { move: 2, attr: "AGI", attrValue: 1 },
    effect: "Passivo: +2 Movimento, +1 AGI. Ao usar Movimento de Fantasma: pode atravessar paredes de até 1 hex de espessura. Após cada kill em Furtividade: o portador volta automaticamente à Furtividade (sem gastar Ação) se houver cobertura a 2 hex.",
    note: "+2 Mov, +1 AGI. Fantasma atravessa paredes. Após kill furtivo: re-entra em Furtividade automaticamente.",
    story: "A névoa que emite não é mágica — é real. A névoa só existe porque o manto quer existir. É uma distinção importante.",
    setBonus: "Sombra Dupla (3p) — Arte do Assassino: Tiro Mortal pode ser executado com 1 Ação (em vez de 2) se alvo estiver Preso ou Furtividade ativa; Emboscada Perfeita estende-se a todos os aliados adjacentes; Armadilha de Caçador pode ser instalada em movimento (Ação Livre durante Movimento de Fantasma)." },

  /* ═══ ITENS INDIVIDUAIS — Potencializam mecânicas específicas ═ */

  /* Runa-Lâmina */
  { tier: "magico", name: "Tinta Rúnica de Combate",
    slot: ["accessory"], weight: 0.2, req: "INT",
    subclass: "runa-lamina",
    effect: "Passivo: reduz o custo de Gravar Runa em 1 (mínimo 0 — primeira Runa é gratuita em vez de custar 1 recurso). Ao detonar 3 Runas no mesmo combate: a próxima Runa gravada causa +1d8 extra ao detonar.",
    note: "Reduz custo de Gravar Runa. Bônus após 3 detonações por combate.",
    story: "A tinta é de uma cor que não tem nome. Magos de Valdris discutem há décadas se é roxo ou azul ou algo entre os dois." },

  /* Caçador de Gigantes */
  { tier: "magico", name: "Lupa Tática de Rastreamento",
    slot: ["accessory"], weight: 0.3, req: "INT",
    subclass: "cacador-gigantes",
    effect: "Passivo: Anatomia de Besta concede +1d4 extra de dano no próximo ataque contra o alvo analisado. Ao Marcar Presa: o portador sente a direção da Presa mesmo através de paredes (Percepção mágica até 20 hex).",
    note: "Anatomia de Besta dá bônus de dano. Rastreamento mágico de Presa Marcada até 20 hex.",
    story: "Construída por um Alquimista que sobreviveu ao Mamute das Planícies mais de uma vez. Não na mesma batalha. São histórias diferentes." },

  /* Sussurro Sombrio */
  { tier: "magico", name: "Frasco do Veneno do Esquecimento",
    slot: ["accessory"], weight: 0.2, req: "SAB",
    subclass: "sussurro-sombrio",
    charges: { max: 3, label: "Doses", resetOn: "sessao" },
    effect: "3 doses por sessão. Ao aplicar: Veneno Sagrado normal, mas adiciona Amnésia — alvo testa SAB (difícil) ou esquece 1 habilidade especial por 3 rodadas (escolha aleatória ou do portador com SAB difícil+). Antídotos comuns ainda não funcionam (é Veneno Sagrado).",
    note: "3 usos/sessão. Adiciona Amnésia ao Veneno Sagrado: alvo perde 1 habilidade por 3 rodadas.",
    story: "O veneno que não mata. Só faz esquecer. Às vezes isso é pior." },

  /* Caçador Sombrio */
  { tier: "magico", name: "Gancho da Ascensão Sombria",
    slot: ["accessory"], weight: 0.4, req: "AGI",
    subclass: "cacador-sombrio",
    effect: "Passivo: pode se mover verticalmente (escalar, subir em estruturas) ao mesmo custo de Movimento horizontal. Ativo (1 Ação Livre, 1 uso/combate): dispara gancho a até 6 hex — puxa o portador ao hex escolhido instantaneamente. Se usado durante Movimento de Fantasma: o gancho não revela posição.",
    note: "Escalada gratuita. Gancho 6 hex como Ação Livre 1x/combate. Compatível com Fantasma (sem revelar).",
    story: "O gancho nunca falha. Alguns usuários levaram tempo demais para descobrir que às vezes deveriam." },

  /* ─── INSPIRADOS EM ELDEN RING — Talismãs/Acessórios ─────────── */

  { tier: "lendario", name: "Talismã do Punho Férreo",
    slot: ["accessory"], weight: 0.2, req: "FOR",
    magicBonus: { attr: "FOR", attrValue: 2 },
    effect: "Passivo: +2 FOR. Ataques físicos do portador nunca podem ser desviados por esquiva — o alvo pode apenas defender ou absorver o golpe. Se o alvo não tiver Ação de Defesa disponível, o ataque é sempre considerado acerto (sem rolar d10). O portador também fica imune a ser Desarmado.",
    note: "+2 FOR. Ataques não podem ser esquivados. Sem defesa disponível = acerto automático. Imune a Desarmamento.",
    story: "O punho que não erra. Não porque é preciso — porque é inevitável. Existe uma diferença entre as duas coisas que importa moralmente mas não mecanicamente." },

  { tier: "lendario", name: "Talismã dos Dois Dedos",
    slot: ["accessory"], weight: 0.1, req: "SAB",
    magicBonus: { attr: "SAB", attrValue: 1, slots: 1 },
    effect: "Passivo: +1 SAB, +1 Slot. O portador pode usar 2 Slots em qualquer magia para duplicar seu efeito: mesma magia atinge 2 alvos separados (se dano), ou área dobrada (se área), ou duração dobrada (se buff/debuff). A decisão de duplicar é tomada no momento do lançamento. 2 usos de duplicação por sessão.",
    note: "+1 SAB, +1 Slot. 2x/sessão: gastar 2 Slots → duplicar efeito de magia (2 alvos / área dupla / duração dupla).",
    story: "Os Dois Dedos eram entidades que guiavam reinos inteiros com gestos simples. Este talismã tem a forma de dois dedos entrelaçados. Quem o usa às vezes acorda com a sensação de ter feito uma escolha que não lembra de ter feito." },

  { tier: "lendario", name: "Talismã da Grande Espada de Pedra",
    slot: ["accessory"], weight: 0.5, req: "FOR",
    magicBonus: { attr: "FOR", attrValue: 1 },
    effect: "Passivo: +1 FOR. Ao acertar com arma de 2 mãos: chance de 25% de o golpe criar Onda de Impacto (d10 rola 1–2 automaticamente após o acerto): todos os inimigos em raio 2 hex sofrem 1d8 de dano de impacto e testam AGI (normal) ou ficam Derrubados. A Onda não gasta Ação e não pode ser bloqueada.",
    note: "+1 FOR. Arma 2M: 25% chance (tirar 1-2 no d10 após acerto) → Onda de Impacto: 1d8 + Derrubado em raio 2 hex.",
    story: "Esculpido da pedra do mesmo lugar onde a maior greatsword de Aether foi forjada. A pedra lembra o peso da espada e tenta replicar o impacto. Não consegue completamente. Mas 25% é suficiente." },

  { tier: "lendario", name: "Talismã do Dragão Verde",
    slot: ["accessory"], weight: 0.2, req: "SAB",
    magicBonus: { attr: "SAB", attrValue: 1 },
    effect: "Passivo: +1 SAB. O portador regenera 3 HP no início de cada turno enquanto estiver acima de 0 HP. Se o portador tiver uma Bênção ativa: a regeneração aumenta para 5 HP/turno. Fora de combate: regenera 5 HP/minuto (descanso ativo, não precisa estar parado).",
    note: "+1 SAB. Regenera 3 HP/turno. Com Bênção ativa: 5 HP/turno. Fora de combate: 5 HP/minuto.",
    story: "Os dragões verdes eram curandeiros. Não guerreiros — curandeiros. Quando o último morreu, seu coração virou este talismã. Ele ainda bate. Levemente. Em compasso com o portador." },

  { tier: "lendario", name: "Talismã do Escorpião Arcano",
    slot: ["accessory"], weight: 0.3, req: "INT",
    magicBonus: { attr: "INT", attrValue: 1 },
    effect: "Passivo: +1 INT. Todas as magias de dano do portador causam +25% de dano (arredonda para cima). Custo: o portador também recebe +25% de dano de todas as fontes (a arrogância tem preço). O talismã não pode ser removido durante combate — só fora dele.",
    note: "+1 INT. Dano de magias +25%. Dano recebido +25%. Não pode ser removido durante combate.",
    story: "O escorpião pica mesmo a si mesmo quando não há outra opção. O talismã funciona com a mesma lógica. A questão não é se o custo vale — é se o portador consegue sobreviver ao custo." },

  { tier: "ancestral", name: "Medalhão de Erd",
    slot: ["accessory"], weight: 0.4, req: "SAB",
    magicBonus: { attr: "SAB", attrValue: 2, attr2: "INT", attrValue2: 1 },
    effect: "Passivo: +2 SAB, +1 INT. 1x por sessão, ao cair a 0 HP: o medalhão ativa automaticamente — o portador revive com 50% HP e fica Imune a dano por 1 rodada completa. Após reviver: todos os aliados em raio 5 hex curam 2d8 HP (a ressurreição irradia). O medalhão então fica inativo até o próximo descanso longo.",
    note: "+2 SAB, +1 INT. 1x/sessão: morte → revive com 50% HP + imunidade 1 rodada + aliados curam 2d8. Recarrega em descanso longo.",
    story: "Erd não era um rei nem um deus — era um pai. Fez este medalhão para que o filho voltasse de qualquer guerra. O filho nunca voltou mesmo assim. O medalhão ficou tentando." },

  /* ─── ITENS COM BÔNUS DE CRÍTICO ─────────────────────────────── */

  { tier:"raro", name:"Anel do Olho Afiado",
    slot:["accessory"], weight:0.05,
    magicBonus:{ critChance:1 },
    effect:"Passivo: +1 na Chance de Crítico (d10). O crítico agora acerta em um resultado a mais no dado de crítico. Empilhável com o bônus de SAB.",
    note:"+1 Chance de Crítico. Empilha com SAB.",
    story:"Esculpido do olho vítreo de um Lagarto Venenoso Gigante. Quem o usa começa a perceber aberturas que antes não via." },

  { tier:"raro", name:"Anel do Golpe Brutal",
    slot:["accessory"], weight:0.05,
    magicBonus:{ critDamage:25 },
    effect:"Passivo: +25% de bônus de dano em acertos críticos (total: 75% em vez de 50%). O extra se aplica sobre o dano final já calculado.",
    note:"+25% dano crítico. Total: 75% (base 50% + 25% do anel).",
    story:"Forjado com o sangue de um Berserker de Sangue Corrompido que nunca aprendeu a controlar a fúria. O anel aprendeu." },

  { tier:"lendario", name:"Talismã do Assassino das Sombras",
    slot:["accessory"], weight:0.1,
    magicBonus:{ critChance:2, critDamage:50 },
    effect:"Passivo: +2 na Chance de Crítico e +50% de dano crítico extra (total: 100% — dano crítico DOBRADO). Em Furtividade: o primeiro ataque tem Chance de Crítico adicional de +3 (não se empilha, usa o maior valor).",
    note:"+2 Chance Crit. +50% dano crit (total 100%). Em Furtividade: +3 Crit no 1º ataque.",
    story:"Pertenceu ao único assassino que desafiou o Deus Marcado diretamente e sobreviveu. Não está claro por quê ele sobreviveu." },

  { tier:"raro", name:"Bracelete do Predador",
    slot:["accessory"], weight:0.15,
    magicBonus:{ critChance:1, attr:"DEX", attrValue:1 },
    effect:"Passivo: +1 DEX e +1 na Chance de Crítico. O predador identifica o ponto fraco antes de atacar.",
    note:"+1 DEX. +1 Chance de Crítico.",
    story:"Feito com a pata dianteira da Loba Alfa das Sombras Cinzentas. O movimento dela era calculado. O bracelete aprendeu." },

  /* ─── LOOT DE MONSTROS — ACESSÓRIOS ───────────────────── */

  { tier:"raro", name:"Anel do Gigante (redimensionado)",
    slot:["accessory"], weight:0.1,
    magicBonus:{ attr:"FOR", attrValue:1 },
    effect:"+1 FOR permanente. O anel pertenceu a um Gigante antigo — magicamente redimensionado para mãos humanas. Ao ser equipado, o usuário sente brevemente o peso do mundo nas costas.",
    note:"+1 FOR. Loot: Aranha dos Túmulos de Gigantes.",
    story:"O Gigante não tem nome registrado. O anel tem runas num idioma que ninguém lê mais." },

  { tier:"raro", name:"Lente de Foco Mágico",
    slot:["accessory"], weight:0.1,
    magicBonus:{ slots:1 },
    effect:"+1 Slot de Magia. Magias de dano direcionadas causam +1d4 extra de dano. Feita de fragmento do núcleo de um Golem de Espelhos — concentra energia mágica num ponto antes de liberá-la.",
    note:"+1 Slot. +1d4 em magias direcionadas. Loot: Golem de Espelhos.",
    story:"Olhar através dela mostra o mundo como o Golem via — linhas de energia em tudo." },

  { tier:"raro", name:"Manto das Sombras",
    slot:["accessory"], weight:0.5,
    effect:"Em áreas com pouca luz ou sombra: Furtividade automática ao mover-se (sem rolagem). Em luz plena: +1d4 em testes de Furtividade. Ao usar Furtividade com sucesso, o próximo ataque tem +2 na Chance de Crítico.",
    note:"Furtividade automática em sombra. +2 Crit no ataque após furtividade. Loot: A Executora Sem Nome.",
    story:"Tecido com sombras reais colhidas em noites sem lua. Esqueceu como refletir luz." },

  { tier:"raro", name:"Símbolo de Jurgmund Corrompido",
    slot:["accessory"], weight:0.2,
    magicBonus:{ attr:"SAB", attrValue:1 },
    effect:"+1 SAB. Sonhos perturbadores ao dormir com ele equipado — o portador não descansa completamente. Passivo: magias de cura lançadas pelo portador têm 10% de chance de aplicar 1 carga de Maldição no alvo em vez de curar.",
    note:"+1 SAB. Sonhos perturbadores. 10% cura vira Maldição. Loot: Sacerdote Corrompido de Jurgmund.",
    story:"A serpente do símbolo pisca quando ninguém está olhando." },

  { tier:"raro", name:"Olho de Corvino",
    slot:["accessory"], weight:0.1,
    magicBonus:{ attr:"SAB", attrValue:1 },
    effect:"+1 SAB. Percepção automática em raio 8 hex — o portador não pode ser surpreendido e emboscadas são impossíveis contra ele. Em áreas escuras: vê perfeitamente. Efeito colateral: o olho substitui visualmente o olho direito do portador (aparência intimidadora).",
    note:"+1 SAB. Sem surpresa. Visão no escuro. Loot: Caçador de Almas Corvino.",
    story:"O Corvino colhia olhos de seus alvos. Irônico que o olho dele se tornasse tão valioso." },

  { tier:"lendario", name:"Anel de Verdade",
    slot:["accessory"], weight:0.1,
    effect:"Passivo: desfaz automaticamente ilusões e disfarces em raio 2 hex do portador — invisibilidade, Véu de Ilusão, formas copiadas (como o Trocador de Pele) e Espelho de Batalha são inúteis perto dele. Ativo (1x/dia): o portador faz uma pergunta direta a alguém; o alvo testea SAB (crítico) para conseguir mentir.",
    note:"Desfaz ilusões em raio 2 hex. 1x/dia: SAB crítico para mentir. Loot: Trocador de Pele.",
    story:"Existe apenas um. O Trocador de Pele o carregava precisamente porque era o único ser que podia portá-lo sem nunca poder usá-lo." },

  { tier:"raro", name:"Colar de Identificação do Cavaleiro",
    slot:["accessory"], weight:0.1,
    effect:"Quest Item: revela o nome e a ordem do Cavaleiro Sem Cabeça ao ser segurado por 1 minuto. Pode ser entregue a um historiador, família nobre ou templo em troca de recompensa (50+ ouro). Magicamente inquebrável.",
    note:"Quest item. Revela identidade do Cavaleiro. Loot: Cavaleiro Sem Cabeça.",
    story:"Gravado com um nome que ainda não está pronto para ser revelado." },

  /* ── ACESSÓRIOS SERPENTARIANOS ───────────────────────────────── */

  { tier:"comum", name:"Amuleto da Escama de Jurgmund",
    slot:["accessory"], weight:0.1,
    effect:"Amuleto de escama de cobra-rainha benzido em templo de Jurgmund. Confere +1d4 em testes de resistência a veneno. Orcs, humanos e outros não-serpentarianos podem usá-lo sem efeitos colaterais, mas sacerdotes de Jurgmund reconhecem imediatamente quem o carrega.",
    story:"Vendido nos templos por 5 prata. Comum, mas genuinamente abençoado." },

  { tier:"raro", name:"Anel do Olho da Serpente",
    slot:["accessory"], weight:0.1,
    magicBonus:{ critChance:1 },
    effect:"+1 Chance de Crítico. O olho vertical da serpente gravado no anel parece mover-se quando observado de perto. Portadores relatam ver padrões de movimentos antes que aconteçam — especialmente em combate próximo.",
    story:"Forjado pelos ourives-sacerdotes com ouro do rio sagrado de Serpentara." },

  { tier:"raro", name:"Tornozeleira da Cobra Silenciosa",
    slot:["accessory"], weight:0.1,
    effect:"Furtividade automática ao mover-se em ambientes naturais (floresta, caverna, ruínas com vegetação). Em ambientes artificiais: +1d6 em testes de Furtividade. Passivo: imune à habilidade 'Sentido de Vibração' de monstros que detectam por vibração no solo — a tornozeleira neutraliza a presença do portador.",
    story:"Os caçadores serpentarianos a usam desde antes da fundação de Serpentara." },

  { tier:"raro", name:"Colar do Sacerdote Juiz",
    slot:["accessory"], weight:0.2,
    magicBonus:{ attr:"SAB", attrValue:1 },
    effect:"+1 SAB. Usado pelos sacerdotes que presidem os rituais de Julgamento de Jurgmund. Passivo: o portador detecta automaticamente mentiras flagrantes (não sutilezas — apenas afirmações diretamente falsas) em SAB (normal). Ativo (1x/dia): Palavras do Juiz — uma pergunta feita ao colar é respondida com Verdadeiro/Falso pelo espírito da serpente que habita o metal.",
    story:"Cada sacerdote-juiz tem o seu. Quando morre, o colar é enterrado com ele — exceto quando não é." },

  { tier:"magico", name:"Diadema do Oráculo Serpentariano",
    slot:["accessory"], weight:0.15,
    magicBonus:{ attr:"SAB", attrValue:2, attr2:"INT", attrValue2:1 },
    effect:"+2 SAB, +1 INT. Usado pelos Oráculos que interpretam os padrões das serpentes. Passivo: magias de adivinhação e visão lançadas pelo portador custam −1 Slot (mínimo 1). Ativo (1x/combate): Visão Oracular — antes de um ataque inimigo declarado, pode ver o resultado antes de acontecer e decidir se esquiva ou absorve o golpe conscientemente (pode trocar Esquiva por Def.Física e vice-versa).",
    story:"Os Oráculos nunca falam do que veem. Apenas de como deve ser evitado." },

  { tier:"magico", name:"Marcas Rituais Serpentarianas",
    slot:["accessory"], weight:0,
    magicBonus:{ attr:"DEX", attrValue:1 },
    effect:"Tatoo ritual inscrita em cerimônia de três dias pelos sacerdotes de Jurgmund. Não pode ser removida por meios físicos — faz parte da pele. +1 DEX permanente. Os padrões de escama nas marcas se movem levemente quando o portador está em perigo. Passivo: em combate, o portador recebe +1 em Chance de Esquiva (os padrões guiam o corpo instintivamente). Restrição: só pode ser feita por sacerdote de Jurgmund genuíno.",
    story:"Uma honra concedida. Jamais vendida." },

  /* ── ACESSÓRIOS ÉLFICOS ──────────────────────────────────────── */

  /* LENDÁRIO */
  { tier:"lendario", divine:"Aethea", race:"elfo",
    name:"Circlet dos Videntes de Akaen",
    slot:["accessory"], weight:0.1,
    magicBonus:{ attr:"INT", attrValue:2, attr2:"SAB", attrValue2:2, spellActions:1 },
    effect:"+2 INT, +2 SAB, +1 Ação de Magia. Os Videntes eram os profetas da corte de Akaen — elfos que liam o futuro nas estrelas e no movimento dos ventos. Passivo: magias de ilusão, visão e adivinhação têm alcance dobrado e duram o dobro do normal. Passivo: o portador nunca pode ser surpreendido e tem Percepção automática em raio 10 hex. Ativo (1x/combate): Visão dos Videntes — o portador vê os próximos 2 turnos do combate antes de acontecerem (o Mestre descreve o que os inimigos farão); o portador age com conhecimento perfeito, podendo agir antes ou preparar reação.",
    story:"O último Vidente usou o Circlet para prever a própria morte. Mesmo assim não fugiu — disse que a morte dele era necessária. O Circlet foi encontrado no chão ao lado do corpo, impecavelmente limpo." },

  { tier:"lendario", divine:"Aethea", race:"elfo",
    name:"Luvas da Arqueira Primordial",
    slot:["accessory"], weight:0.2,
    magicBonus:{ attr:"DEX", attrValue:2, critChance:2 },
    effect:"+2 DEX, +2 Chance de Crítico. Luvas de couro élfico primordial que nunca desgastam. As arqueiras que as usavam podiam disparar 12 flechas antes que a primeira tocasse o chão. Passivo: ataques à distância com o portador nunca sofrem penalidade por cobertura, vento, distância ou visibilidade reduzida. Passivo: ataques à distância do portador que acertam em crítico não gastam a flecha/projétil usados — eles retornam magicamente. Ativo (1x/combate): Flurry Élfico — realiza 4 ataques à distância imediatos como 1 Ação única, cada um com rolagem separada.",
    story:"Foram encontradas num quiver enterrado que tinha duzentas flechas que ainda funcionavam. As flechas se desmancharam ao contato com o ar moderno. As luvas não." },

  { tier:"lendario", divine:"Aethea", race:"elfo",
    name:"Capa do Exilado de Akaen",
    slot:["accessory"], weight:0.5,
    magicBonus:{ attr:"DEX", attrValue:1, attr2:"INT", attrValue2:1, dodge:2 },
    effect:"+1 DEX, +1 INT, +2 Chance de Esquiva. Usada pelos elfos exilados — os que saíram voluntariamente antes da escravidão, escolhendo o isolamento à capitulação. Passivo: o portador é impossível de rastrear por meios não-mágicos (sem pegadas, sem cheiro, sem rastro). Passivo: uma vez por turno, ao esquivar perfeitamente, pode mover-se até 3 hex adicionais sem custo de Ação (o exilado nunca para de se mover). Ativo (1x/combate): Passo do Exilado — desaparece completamente da percepção de todos os inimigos por 2 rodadas (não é invisibilidade — é ausência total de presença; Percepção mágica falha também).",
    story:"Os exilados nunca voltaram. Mas às vezes encontram-se capas assim em lugares que não fazem sentido." },

  /* ANCESTRAL */
  { tier:"ancestral", divine:"Aethea", race:"elfo",
    name:"Anel de Aethea — Fragmento da Deusa",
    slot:["accessory"], weight:0,
    magicBonus:{ attr:"DEX", attrValue:2, attr2:"INT", attrValue2:2, attr3:"SAB", attrValue3:2, critChance:2, dodge:2, spellActions:1, slots:2 },
    effect:"+2 DEX, +2 INT, +2 SAB, +2 Crit, +2 Esquiva, +1 Ação de Magia, +2 Slots. Este anel é um fragmento do próprio poder de Aethea, cristalizado quando ela ascendeu à divindade. Existem três — este é um deles. Passivo: o portador não pode ser morto enquanto abaixo de 10 HP — qualquer golpe que derrubaria o portador a 0 ou abaixo falha automaticamente (uma vez por combate). Passivo: magias do portador têm +INT de dano extra por dado (cada dado causa mais). Ativo (1x/sessão): Toque de Aethea — toca um aliado morto há menos de 1 hora. O aliado retorna com 50% HP e todos os seus recursos restaurados. Aethea sofre — usar este poder com frequência tem consequências narrativas.",
    story:"Aethea não sabe onde os três estão. Ela os escondeu de si mesma para não ser tentada a usá-los — um deus que usa seu próprio poder para ressuscitar mortais eventualmente esgota sua divindade." },

  { tier:"ancestral", divine:"Aethea", race:"elfo",
    name:"Elmo das Estrelas de Akaen",
    slot:["accessory"], weight:0.5,
    magicBonus:{ attr:"INT", attrValue:3, attr2:"SAB", attrValue2:2, spellActions:2, slots:3, critChance:1 },
    effect:"+3 INT, +2 SAB, +2 Ações de Magia, +3 Slots, +1 Crit. O elmo de Akaen — que ele usava em batalha mesmo quando os outros magos não usavam elmo algum. Os entalhes nas laterais são equações arcanas que nenhum matemático moderno resolveu completamente. Passivo: o portador pode lançar magias de qualquer nível sem gastar Slot (apenas uma vez por magia por combate — cada magia pode ser lançada gratuitamente 1x). Passivo: magias de controle (Aprisionamento, Distorção Temporal, Âncora do Plano, etc.) têm duração dobrada quando lançadas pelo portador. Ativo (1x/sessão): Mente de Akaen — por 5 rodadas, o portador pode lançar qualquer magia do compêndio que nunca aprendeu, uma vez cada, sem custo de Slot (Akaen conhecia todas).",
    story:"Akaen disse que usava o elmo não por proteção — mas para não ficar distraído pelos pensamentos dos outros enquanto calculava. O elmo, de alguma forma, ainda isola." },

  { tier:"ancestral", divine:"Aethea", race:"elfo",
    name:"Véu da Memória de Akaen — Completo",
    slot:["accessory"], weight:0.1,
    magicBonus:{ attr:"SAB", attrValue:3, attr2:"INT", attrValue2:2, dodge:3 },
    effect:"+3 SAB, +2 INT, +3 Chance de Esquiva. O Véu completo — não o fragmento. Os fragmentos do Véu existem espalhados pelo mundo; este é a peça original intacta, que Aethea teceu com a memória coletiva de todos os elfos que morreram na Era da Escravidão. Passivo: o portador acessa memórias élficas antigas — pode fazer perguntas ao Mestre sobre história, lore e segredos do mundo (até 3 perguntas por sessão; o Mestre responde com o que os elfos antigos sabiam). Passivo: +3 Esquiva nunca reduz por usos múltiplos — o portador esquiva infinitas vezes sem penalidade acumulada. Ativo (1x/semana): Todas as Memórias — o portador revive brevemente como o elfo cuja memória é mais relevante para o momento. Por 1 hora, tem as habilidades, conhecimentos e fluência daquele elfo (o Mestre interpreta quem ele foi). O portador não se lembra do que fez durante a hora ao voltar.",
    story:"Aethea o teceu durante a escravidão, enquanto seus filhos morriam um a um. Cada fio é uma vida. O véu tem mais fios do que qualquer contador poderia contar." },

  /* ── ACESSÓRIOS MÍTICOS ──────────────────────────────────────── */

  { tier:"raro", name:"Lágrima Cristalizada de Sereia",
    slot:["accessory"], weight:0,
    effect:"Uma lágrima de Sereia que cristalizou ao contato com o ar — as Sereias raramente choram fora da água, e quando choram no ar, as lágrimas congelam antes de cair. Esta foi encontrada flutuando. Passivo: o portador entende e fala o idioma aquático instintivamente. Passivo: em combate aquático, +1d4 em todos os testes e esquivas. Ativo (1x/combate): ao ser acertado por um golpe, pode desviar parte do dano — reduz o dano recebido em 1d8 (a lágrima absorve o impacto e racha levemente, se regenerando no próximo turno).",
    story:"Sereias não choram por tristeza. Choram por beleza. O que essa Sereia viu para chorar fora d'água, ninguém sabe." },

  { tier:"raro", name:"Pena da Harpia — Broche",
    slot:["accessory"], weight:0.1,
    magicBonus:{ attr:"AGI", attrValue:1 },
    effect:"+1 AGI. Pena de uma Harpia-Guerreira adulta — criaturas que voam em velocidade impossível para seu tamanho. A pena, mesmo estática, parece prestes a ser levada pelo vento. Passivo: o portador nunca fica Derrubado por ataques físicos leves (dano < 8). Passivo: ao usar toda a Ação de Movimento em linha reta, o próximo ataque tem +1d6 de dano extra (o momento cinético da Harpia). Ativo (1x/combate): Grito de Harpia — emite o grito em raio 4 hex; todos os inimigos testam SAB (normal) ou ficam Atordoados por 1 rodada.",
    story:"Harpias perdem penas durante os gritos de guerra. Esta foi encontrada cravada em um tronco de árvore — a pressão do grito a havia enterrado dois centímetros na madeira." },

  { tier:"magico", name:"Corno de Unicórnio — Pó",
    slot:["accessory"], weight:0.05,
    effect:"3 doses de pó de corno de unicórnio puro. Cada dose pode ser: (1) soprada sobre um aliado — remove instantaneamente qualquer veneno, maldição ou condição negativa; (2) misturada a água — cria Poção de Cura Potente (cura 3d6+SAB HP); (3) lançada em um inimigo corrompido ou morto-vivo (alcance 3 hex) — causa 2d8 de dano sagrado que ignora toda defesa. O pó não se repõe. Use com sabedoria.",
    story:"Este pó não vem de um unicórnio morto. Vem de um unicórnio que o doou voluntariamente em troca de uma promessa que o portador anterior não cumpriu. O unicórnio ainda espera." },

  { tier:"magico", name:"Olho de Basilisco — Preservado",
    slot:["accessory"], weight:0.2,
    magicBonus:{ attr:"INT", attrValue:1 },
    effect:"+1 INT. O olho de um Basilisco adulto, preservado em solução de óleo de salamandra para neutralizar 80% do poder petrificante. Os outros 20% ficaram. Passivo: o portador detecta automaticamente criaturas que usam disfarce mágico, ilusão ou invisibilidade em raio 5 hex (o olho ainda vê através de truques). Ativo (1x/combate): o portador remove o protetor do olho e olha diretamente para um alvo em raio 4 hex — o alvo testa FOR (difícil) ou fica Imóvel por 2 rodadas (versão enfraquecida da petrificação). Depois: o portador fica com −1d4 em Percepção por 1 rodada (o olho cansa os olhos do portador).",
    story:"O frasco tem uma trava tripla. O vendedor que o ofereceu não dizia o preço antes de o comprador demonstrar que entendia o que estava comprando." },

  { tier:"lendario", name:"Coração de Fênix — Amuleto",
    slot:["accessory"], weight:0.3,
    magicBonus:{ attr:"FOR", attrValue:1, attr2:"SAB", attrValue2:1 },
    effect:"+1 FOR, +1 SAB. O coração de uma Fênix jovem que morreu antes de renascer pela primeira vez — algo que não deveria ser possível, mas aconteceu. O coração ainda bate. Não para. Nunca para. Passivo: ao ser reduzido a 0 HP, o portador não morre — entra em Combustão de Fênix: fica intangível e imóvel por 1 turno, depois ressurge com 40% HP e todos os inimigos adjacentes sofrem 2d6 de dano de fogo. Ocorre 1x por descanso longo. Passivo: imune a dano de fogo. Ativo (1x/sessão): o coração pulsa intensamente — o portador e todos os aliados em raio 4 hex ficam imunes a morte por 1 turno (golpes que derrubariam a 0 HP causam 1 HP em vez disso).",
    story:"O coração não para porque a Fênix ainda não desistiu. Ela apenas está esperando a hora certa de renascer." },

  { tier:"lendario", name:"Escama do Leviatã — Medalha",
    slot:["accessory"], weight:0.5,
    magicBonus:{ attr:"FOR", attrValue:2 },
    effect:"+2 FOR. Uma única escama de Leviatã adulto, polida e perfurada para uso como medalha. O polimento levou 6 meses. A escama resistiu a todas as tentativas de entalhe — qualquer gravura foi feita a ácido. Passivo: o portador não pode ser empurrado, derrubado por impacto físico, ou movido involuntariamente (a massa do Leviatã ancora). Passivo: ataques físicos que causariam mais de 15 de dano ao portador têm esse excesso absorvido pela escama (dano máximo por ataque = 15, uma vez por rodada). Ativo (1x/combate): bate a medalha no chão — onda de pressão em raio 4 hex, 2d8 de dano a todos os inimigos (sem teste de resistência — a pressão simplesmente acontece).",
    story:"Leviatãs não foram vistos em terra. Esta escama foi encontrada no pico de uma montanha. Ninguém tentou explicar." }];

const ALL_WEAPONS = [...WEAPONS_ONE_HAND, ...WEAPONS_TWO_HAND, ...WEAPONS_MAGIC, ...WEAPONS_RANGED].filter(Boolean);


/* Itens gerais simples de inventário (não-equipáveis) sugeridos na criação */
const STARTER_GEAR = [
  { name: "Ração de Viagem (5 dias)", weight: 5 },
  { name: "Corda (15m)", weight: 4 },
  { name: "Kit de Primeiros Socorros", weight: 2 },
  { name: "Tocha (3 unidades)", weight: 3 },
  { name: "Cantil de Água", weight: 2 },
  { name: "Saco de Dormir", weight: 3 },
  { name: "Pederneira e Aço", weight: 0.5 },
  { name: "Bolsa de Moedas (10 ouro)", weight: 0.5 }
];

/* ---------------------------------------------------------------------- */
/* LISTA UNIFICADA DE MAGIAS (qualquer classe pode aprender qualquer uma) */
/* Cada magia carrega a tag de qual classe é "originária", só para exibição */
/* ---------------------------------------------------------------------- */


/* ================================================================
   MISCELÂNIAS — Consumíveis, equipamento geral e pergaminhos
   Categorias: potion | scroll | artefato | gear
   ================================================================ */
const MISC_ITEMS = [

  /* ── POÇÕES ──────────────────────────────────────────────── */
  { name: "Poção de Cura Menor",       category: "misc", subcategory: "potion", tier: "comum",   weight: 0.3, consumable: true,
    effect: "Recupera 2d6+2 HP ao beber. Usar como Ação de Combate ou fora de combate instantaneamente.",
    story: "Vermelho, cheiro de maçã podre. Vendida em qualquer entreposto — qualidade duvidosa, resultado razoável." },

  { name: "Poção de Cura",             category: "misc", subcategory: "potion", tier: "comum",   weight: 0.3, consumable: true,
    effect: "Recupera 3d8+4 HP ao beber.",
    story: "Vermelho escuro, brilha levemente. A escolha de qualquer aventureiro que sabe o que está fazendo." },

  { name: "Poção de Cura Superior",    category: "misc", subcategory: "potion", tier: "raro",    weight: 0.3, consumable: true,
    effect: "Recupera 6d8+8 HP ao beber.",
    story: "Carmesim com partículas douradas. Cara, mas vale a diferença quando o guerreiro está de joelhos." },

  { name: "Poção de Cura Suprema",     category: "misc", subcategory: "potion", tier: "magico",  weight: 0.3, consumable: true,
    effect: "Restaura HP máximo completo ao beber.",
    story: "Dourada, quase líquida-luz. Dizem que foi destilada da aurora de um dia em que nenhuma guerra aconteceu." },

  { name: "Poção de Mana",             category: "misc", subcategory: "potion", tier: "comum",   weight: 0.3, consumable: true,
    effect: "Restaura 3 Slots de Magia. Usar como Ação de Magia ou fora de combate.",
    story: "Azul translúcido, efervescente. Mágos a chamam de 'caldo de sonhos baratos'." },

  { name: "Poção de Mana Superior",    category: "misc", subcategory: "potion", tier: "raro",    weight: 0.3, consumable: true,
    effect: "Restaura todos os Slots de Magia.",
    story: "Azul-violeta, espessa. Cada gole sabe diferente — às vezes metal, às vezes relâmpago, às vezes nada." },

  { name: "Poção de Antídoto",         category: "misc", subcategory: "potion", tier: "comum",   weight: 0.3, consumable: true,
    effect: "Remove qualquer veneno não-sagrado do portador. Cancela Sangramento e para dano por veneno imediatamente.",
    story: "Verde-lima, amarga. O cheiro faz a maioria dos venenos recuarem por conta própria." },

  { name: "Poção de Antídoto Sagrado", category: "misc", subcategory: "potion", tier: "magico",  weight: 0.3, consumable: true,
    effect: "Remove venenos sagrados (de Jurgmund e similares) e venenos comuns. Restaura 1d8 HP por rodada de veneno que havia restado.",
    story: "Branca com veias douradas. Clérigos de Jurgmund a chamam de 'blasfêmia engarrafada' — mas a compram assim mesmo." },

  { name: "Poção de Força",            category: "misc", subcategory: "potion", tier: "raro",    weight: 0.3, consumable: true,
    effect: "+2 FOR temporariamente por 10 minutos (1 combate). O bônus conta para dano natural, HP e Carga.",
    story: "Laranja opaca, cheiro de terra molhada. Deixa os dentes levemente marrom por algumas horas." },

  { name: "Poção de Velocidade",       category: "misc", subcategory: "potion", tier: "raro",    weight: 0.3, consumable: true,
    effect: "+2 Ações de Combate e +3 Movimento por 3 rodadas. Após os efeitos: −1 Ação de Combate por 2 rodadas (queda do pico).",
    story: "Amarela, borbulhante. O sabor desaparece antes de chegar à garganta. Você só percebe que tomou quando já está correndo." },

  { name: "Poção de Invisibilidade",   category: "misc", subcategory: "potion", tier: "magico",  weight: 0.3, consumable: true,
    effect: "Torna o portador invisível por 5 rodadas ou até atacar/conjurar. Ataques contra o portador têm 75% de chance de errar enquanto invisível.",
    story: "Clara, inodora. Parece água. Vários aventureiros já tentaram economizar e beberam a versão errada." },

  { name: "Poção de Resistência ao Fogo", category: "misc", subcategory: "potion", tier: "comum", weight: 0.3, consumable: true,
    effect: "Imunidade a dano de fogo comum por 1 hora. Dano de fogo sagrado reduzido em 50%.",
    story: "Vermelha-tijolo, fria ao toque paradoxalmente. Inventada por Karlacs que vivem perto do vulcão." },

  { name: "Elixir da Ressurreição",    category: "misc", subcategory: "potion", tier: "lendario", weight: 0.4, consumable: true,
    effect: "Usada em alguém morto há menos de 1 hora: restaura a vida com 1 HP. Usada em alguém com 0 HP (inconsciente): restaura 3d10 HP. Não funciona em mortos-vivos ou mortes por causa divina.",
    story: "Dourada com luz própria. Existe em lendas há 300 anos. Alguns dizem que só funciona se a pessoa QUISER voltar." },

  { name: "Poção de Veneno",           category: "misc", subcategory: "potion", tier: "comum",   weight: 0.3, consumable: true,
    effect: "Pode ser aplicada em uma arma (próximo acerto: +2d6 veneno, 3 rodadas) ou jogada como projétil (1d8 dano de impacto + 1d6 veneno/rodada 3 rodadas). Resistência SAB normal anula o veneno contínuo.",
    story: "Preta esverdeada. Cheiro de cogumelo. Ladinos compram em dúzia." },

  /* ── PERGAMINHOS ─────────────────────────────────────────── */
  { name: "Pergaminho de Identificar",   category: "misc", subcategory: "scroll", tier: "comum",  weight: 0.1, consumable: true,
    effect: "Revela todas as propriedades de um item mágico tocado — bônus, maldições, história e divindade de origem. Equivale a conjurar Identificar (nível 2) sem custo de Slot.",
    story: "Couro de serpente com tinta que nunca seca. Ao ler, a tinta se reorganiza para descrever o item analisado." },

  { name: "Pergaminho de Teletransporte", category: "misc", subcategory: "scroll", tier: "magico", weight: 0.1, consumable: true,
    effect: "Teleporta o portador e até 4 aliados voluntários a qualquer local já visitado pelo conjurador. Falha crítica (1 natural no SAB para conjurar): teleporta para local aleatório no raio de 10 km.",
    story: "Cheiro de ozônio. As letras pulsam quando você pensa em um destino. O destino errado é possível se a concentração falhar." },

  { name: "Pergaminho de Mapa Arcano",   category: "misc", subcategory: "scroll", tier: "raro",   weight: 0.1, consumable: true,
    effect: "Ao destruir o pergaminho (queimar ou rasgar), cria um mapa mágico da área em raio 500m ao redor, revelando: salas, criaturas vivas (pontos luminosos), armadilhas (marcas vermelhas) e saídas. O mapa dura 10 minutos.",
    story: "Em branco até ser destruído. Um estudioso passou 20 anos tentando lê-lo sem destruí-lo. Falhou." },

  { name: "Pergaminho de Barreira",      category: "misc", subcategory: "scroll", tier: "raro",   weight: 0.1, consumable: true,
    effect: "Cria uma barreira mágica impassável de 3x3m por 5 rodadas. Física (Def.10) e mágica (Def.8). Pode ser criada em qualquer orientação. Inimigos empurradores testam FOR (crítico) para atravessar.",
    story: "Escrito em sangue de basilisco seco. O leitor não precisa saber o idioma — as palavras entram diretamente na mente." },

  { name: "Pergaminho de Maldição Menor", category: "misc", subcategory: "scroll", tier: "comum",  weight: 0.1, consumable: true,
    effect: "Aplica uma maldição menor a um alvo visível: −1d4 em todos os testes por 24 horas. Resistência SAB (normal) anula. Clérigos detectam a maldição automaticamente.",
    story: "Preto total, com símbolo vermelho. Vendido por magas ressentidas e lojas de bruxaria de beira de estrada." },

  { name: "Pergaminho de Proteção Divina", category: "misc", subcategory: "scroll", tier: "magico", weight: 0.1, consumable: true,
    effect: "Cria um escudo divino em torno do portador por 3 rodadas: +4 Def.Física e +4 Def.Mágica. Enquanto ativo, ataques de Araltos e criaturas corrompidas causam metade do dano.",
    story: "Brilha levemente no escuro. Selado com o símbolo de Sanctum. Clérigos os produzem como doação a aventureiros de confiança." },

  /* ── ARTEFATOS ───────────────────────────────────────────── */
  { name: "Fragmento do Deus Marcado",  category: "misc", subcategory: "artefato", tier: "unico",  weight: 0.5,
    effect: "⚠ PERIGOSO: Carregar este fragmento durante mais de 1 hora sem contenção (bolsa antimagia) causa Corrupção progressiva (−1 SAB por hora). Usos: 1) Atrai Araltos e criaturas corrompidas num raio de 1 km (perigoso mas pode ser usado como isca). 2) Usado em rituais de Clérigos: fornece energia para magias de nível 5 sem custo de recurso (1 uso por fragmento antes de ser consumido).",
    story: "Cristal carmesim que emite calor suave. Não pesa, mas parece sempre mais pesado do que deveria. Às vezes escuta-se um sussurro." },

  { name: "Escama de Jurgmund",         category: "misc", subcategory: "artefato", tier: "lendario", weight: 0.2,
    effect: "Pode ser usada por um ferreiro ou Clérigo de Jurgmund para forjar um item: adiciona propriedade divina permanente a qualquer arma ou armadura (o Mestre define o bônus, tipicamente +1d6 de veneno ou +2 Def. Mágica). Alternativa: pode ser presenteada a Serpentarianos como token de aliança — equivale a 3 meses de passagem livre pelo Castelo.",
    story: "Translúcida, com veios dourados que pulsam levemente. Quente ao toque, nunca esfria. Cheiro de chuva." },

  { name: "Cristal de Mana Bruta",      category: "misc", subcategory: "artefato", tier: "magico",  weight: 0.4,
    effect: "Pode ser usado de 3 formas: 1) Absorver: ao receber dano mágico, rola SAB (normal) para absorver até 1d10 do dano no cristal (armazena). 2) Liberar: libera toda a energia acumulada em 1d10 por ponto absorvido numa direção. 3) Catalisar: usar como material para criar itens mágicos menores (reduz custo em 50%).",
    story: "Faz a mão formigarem quem o toca. Conjuradores sentindo o cristal conseguem ouvir fragmentos de feitiços antigos." },

  { name: "Tinta de Sangue de Monstro", category: "misc", subcategory: "artefato", tier: "raro",    weight: 0.2,
    effect: "Um frasco de tinta feita de sangue de criatura mágica. Pode ser usada para: 1) Escrever Pergaminho de qualquer magia conhecida (equivale a criar uma cópia do pergaminho). 2) Marcar superfície com rastreador arcano (qualquer Clérigo ou Mago pode detectar a marca em raio 1 km). 3) Traçar runa de alarme simples (1 uso).",
    story: "A cor muda conforme o ângulo — nunca exatamente preta, nunca exatamente outra cor." },

  { name: "Ampulheta do Tempo Parado",  category: "misc", subcategory: "artefato", tier: "unico",   weight: 0.8,
    effect: "Ao virar: para o tempo por 6 segundos reais (1 rodada de jogo). O portador age normalmente; tudo ao redor congela. Após o uso: a ampulheta racha e fica inutilizável (item de uso único). O tempo parado não pode ser usado para causar dano direto (ética de Thion) — apenas para mover, falar, preparar.",
    story: "O areia dentro não cai. Nunca. Até ser girada pela primeira vez. Quem a encontrou não sabia que era de uso único. Aprendeu." },

  /* ── EQUIPAMENTO GERAL (GEAR) ────────────────────────────── */
  { name: "Corda (15m)",               category: "misc", subcategory: "gear", tier: "comum",   weight: 1.5,
    effect: "Corda resistente de 15 metros. Suporta até 200kg sem arrebentar. Pode ser usada para escalar (reduz dificuldade de Atletismo em 1 grau), amarrar (teste de FOR para escapar), ou construir armadilha simples.",
    story: "Cânhamo trançado. Sem história — é uma corda." },

  { name: "Corda de Seda Mágica",      category: "misc", subcategory: "gear", tier: "magico",  weight: 0.5,
    effect: "Corda de 20 metros que obedece comandos simples ('enrolar', 'segurar', 'soltar'). Resiste a qualquer peso (não tem limite). Pode ser ancorada a qualquer superfície por ordem verbal. Não pode ser cortada por armas não-mágicas.",
    story: "Suave, branca, nunca suja. Parece estar sempre levemente tensa, como se esperasse algo." },

  { name: "Bolsa de Guardar",           category: "misc", subcategory: "gear", tier: "magico",  weight: 0.5,
    effect: "+20 Carga máxima (o interior é maior que o exterior). Itens dentro não pesam para efeito de carga. Máximo de 100kg de objetos dentro. Atenção: se a bolsa for destruída, os itens aparecem em local aleatório em raio 1 km.",
    story: "Parece normal por fora. Por dentro: escuro, silencioso, ligeiramente frio. Itens às vezes mudam de posição sozinhos." },

  { name: "Kit de Escalada",            category: "misc", subcategory: "gear", tier: "comum",   weight: 2,
    effect: "Picaretas, grampos e cinto especializado. Reduz a dificuldade de testes de Atletismo para escalar em 1 grau. Em superfícies completamente lisas: permite a escalada com teste Normal em vez de Impossível.",
    story: "Surrado mas confiável. O grampo central tem uma marca de dente — o dono anterior teve um argumento com um penhasco." },

  { name: "Lanterna de Óleo",           category: "misc", subcategory: "gear", tier: "comum",   weight: 1,
    effect: "Ilumina raio 6 hex por até 6 horas com um frasco de óleo. Pode ser lançada como projétil (1d6 fogo, incendeia área 1 hex). Flame-sensitive: apaga em vento forte ou chuva.",
    story: "Latão amassado com vidro espesso. Funciona." },

  { name: "Lanterna de Cristal Arcano", category: "misc", subcategory: "gear", tier: "raro",    weight: 0.5,
    effect: "Ilumina raio 10 hex indefinidamente (sem óleo). A cor da luz pode ser ajustada por comando (branca, vermelha, azul). Modo 'sombra': emite luz apenas visível ao portador. Não apaga em nenhuma condição ambiental.",
    story: "Cristal aquecido por dentro, nunca queima. Anões de Thurgomur as vendem como 'ferramentas básicas'. Para não-anões, são relíquias." },

  { name: "Kits de Primeiros Socorros (×3)", category: "misc", subcategory: "gear", tier: "comum", weight: 1,
    effect: "3 usos. Cada uso: estabiliza um aliado Inconsciente (volta a 1 HP) sem teste. Fora de combate: cura 1d6 HP adicional com 10 minutos de tratamento. Requer 2 mãos livres.",
    story: "Bandagens, ervas secas, alfinetes. O manual de instruções está em anão." },

  { name: "Ferramentas de Ladrão",      category: "misc", subcategory: "gear", tier: "comum",   weight: 0.5,
    effect: "Reduz dificuldade de testes de Furtividade para abrir fechaduras e desativar mecanismos em 1 grau. Sem as ferramentas, esses testes sobem 1 grau. Em fechaduras mágicas: não reduz, mas permite tentativa.",
    story: "Estojo de couro com 12 ferramentas minúsculas. Quem sabe usá-las não precisa explicar. Quem não sabe, não consegue mesmo com a explicação." },

  { name: "Espelho de Bolso",           category: "misc", subcategory: "gear", tier: "comum",   weight: 0.1,
    effect: "Permite espiar ao redor de cantos sem expor o corpo. Usado para verificar armadilhas visuais. Reflete feitiços de olhar (Medusa, Basilisco, etc.) — o portador rola SAB Normal ou o efeito se volta ao criador.",
    story: "Cabo de osso, espelho de prata. Pequeno o suficiente para esconder em qualquer bolso. Essencial para exploradores cuidadosos." },

  { name: "Armadilha de Urso (×2)",     category: "misc", subcategory: "gear", tier: "comum",   weight: 3,
    effect: "Cada armadilha: posicionar leva 1 Ação. Acionada por peso (+10kg): prende o alvo (imóvel, FOR Difícil para escapar, 1 tentativa por turno). Causa 1d8 de dano ao acionar. Pode ser usada em combate mas ativa apenas no próximo turno de quem pisou.",
    story: "Ferro escurecido. Dedos de muitos ferreiros foram testados nessas molas. Involuntariamente." },

  { name: "Tenda para 4 Pessoas",       category: "misc", subcategory: "gear", tier: "comum",   weight: 5,
    effect: "Abrigo para até 4 pessoas. Permite Descanso Longo em condições adversas (chuva, vento, neve) sem penalidade. Montagem: 10 minutos. Em regiões de clima extremo: reduz o risco de condição climática por 1 grau de severidade.",
    story: "Lona encerada, hastes de madeira. Cheira a outras aventuras de quem a vendeu." },

  { name: "Rações de Viagem (7 dias)",  category: "misc", subcategory: "gear", tier: "comum",   weight: 3.5,
    effect: "Alimentação para 1 pessoa por 7 dias. Sem rações em viagem: testa FOR (Normal) após cada dia ou sofre −1d4 em todos os testes por exaustão (cumulativo). Rações impedem o teste.",
    story: "Carne seca, biscoito duro, nozes. Saboroso comparado com estar com fome. Insaboroso em qualquer outro contexto." },

  { name: "Sino de Aviso (×3)",         category: "misc", subcategory: "gear", tier: "comum",   weight: 0.3,
    effect: "Fio com sino que alarma quando cruzado. Configurar: 1 minuto. Detectar sem acionar: teste de Percepção Difícil. Bônus: inimigos que acionam o sino ficam Surpresos por 1 rodada (não agem no primeiro turno).",
    story: "Cobre barato que ressoa mais do que deveria. Ladinos odeiam. Todo mundo mais ama." },

  { name: "Luneta de Alcance",          category: "misc", subcategory: "gear", tier: "raro",    weight: 0.4,
    effect: "Triplica o alcance de visão. Permite identificar inimigos, lições de terreno e detalhes a grandes distâncias. Armas à distância usadas com a luneta têm alcance dobrado (1 turno para mirar antes de atirar). Não funciona no escuro.",
    story: "Latão e vidro, lentes de cristal de qualidade. Artesanato de anão — nunca fosca, nunca quebra facilmente." },

  { name: "Bolsa Antimagia",            category: "misc", subcategory: "gear", tier: "magico",  weight: 0.8,
    effect: "Contém qualquer artefato mágico ou item perigoso de forma segura. Itens dentro: não emitem energia (indetectáveis magicamente), não afetam o portador, não irradiam maldições. Capacidade: até 2kg de itens. Fechar leva 1 Ação.",
    story: "Pano cinza sem costura visível. O interior parece ligeiramente fora de foco quando aberto. Alquimistas usam para transportar reagentes instáveis." },

  { name: "Pedra de Afiação Rúnica",    category: "misc", subcategory: "gear", tier: "raro",    weight: 0.3,
    effect: "Afia uma arma entre combates: adiciona +1d4 de dano para o próximo combate (efeito se perde ao fim do combate, pode ser reaplicado). 10 usos. O bônus não se acumula — apenas 1 aplicação por arma por combate.",
    story: "Pedra negra com runa suave. Enquanto você afia, parece que a pedra aprende a arma — cada fio fica no ângulo certo sem que você precise calcular." },

  { name: "Mapa em Branco (cartografia)", category: "misc", subcategory: "gear", tier: "comum",  weight: 0.3,
    effect: "Papel de alta qualidade para cartografia. Mapas feitos com cuidado (10+ minutos) reduzem chance de se perder a zero na área mapeada. Mapas vendidos a guildas valem entre 5-50 moedas dependendo da raridade da área.",
    story: "Couro fino de animal tratado. Resistente à água e ao tempo. Espera para contar uma história." },

  { name: "Giz Arcano (×5)",            category: "misc", subcategory: "gear", tier: "magico",  weight: 0.2,
    effect: "Cada pedaço escreve marcas visíveis apenas para quem conjurou. Útil para: marcar passagens já exploradas, deixar mensagens para aliados específicos, traçar símbolos de alerta. Dura 24 horas ou até ser apagado com água benta.",
    story: "Branco, inodoro. Parece giz comum até a segunda olhada. Na segunda olhada, você percebe que estava olhando sem enxergar." },

  /* ── Itens de Recompensa de Missões ── */

  { name: "Kit de Ferramentas de Armadilha", category: "misc", subcategory: "gear",
    tier: "raro", weight: 1.2, consumable: false,
    magicBonus: {},
    effect: "+1d4 em todos os testes de armar ou desarmar armadilhas. Contém: snares, fio de tripwire, pontas, colas especiais (12 usos de componentes). Permite criar armadilhas simples durante descanso curto.",
    story: "Pertencia ao Goblin Armadilheiro líder do ninho. Cada peça foi roubada de um aventureiro diferente — e cada uma funciona melhor do que deveria." },

  { name: "Anel de Comunicação com Animais", category: "misc", subcategory: "gear",
    tier: "raro", weight: 0.05, consumable: false,
    magicBonus: {},
    effect: "Permite comunicação rudimentar com qualquer animal não-mágico — intenções simples, emoções, imagens recentes. 3 usos por dia. Em combate: pode pedir a animais na área que recuem ou se aproximem (SAB normal para o animal obedecer).",
    story: "Feito por encomendeiro que perdeu sua cachorra há 20 anos e queria entendê-la. A cachorra morreu antes de ele receber o anel. Ele nunca o usou." },

  { name: "Colar da Família Braun", category: "misc", subcategory: "gear",
    tier: "raro", weight: 0.1, consumable: false,
    magicBonus: { hp: 5 },
    effect: "+5 HP máximo. Passivo: sempre quente ao toque, mesmo no frio mais extremo. O portador tem +1 em testes de resistência contra maldições de frio e ambientes gelados. O calor é reconfortante — aliados adjacentes que estejam com menos de 30% HP recuperam 1 HP no início do turno do portador.",
    story: "Colar de prata da família Braun, passado de mãe para filho por três gerações. O moleiro o encontrou no bolso da mortalha do filho. Ficou guardado. Nunca deveria ter ficado." },

  { name: "Poção de Transmutação Metálica", category: "misc", subcategory: "potion",
    tier: "raro", weight: 0.4, consumable: true,
    effect: "Aplicada em até 1kg de metal comum (ferro, bronze, cobre): converte em metal de qualidade superior da mesma categoria. Ferro vira aço temperado, cobre vira latão reforçado. Um ferreiro pode usar isso para melhorar uma arma ou armadura: +1d4 de dano ou +1 Defesa por item. 1 uso.",
    story: "O Professor Venz a cria em 10 minutos de 'trabalho emergencial'. Cheira a enxofre e maçã. Funciona perfeitamente uma vez. Na segunda vez pode explodir — ele nunca testou duas vezes." },

  { name: "Varinha de Eldrath", category: "misc", subcategory: "gear",
    tier: "lendario", weight: 0.4, consumable: false,
    magicBonus: { spellActions: 1, slots: 2 },
    effect: "+1 Ação de Magia por turno. +2 Slots de Magia (temporários — retornam após combate). Magias de ataque mágico causam +1d10 de dano extra. Criada pelo Archmago Eldrath após 40 anos de refinamento — cada entalhe na madeira é uma magia diferente comprimida.",
    story: "Eldrath a deu de bom grado. 'Tenho outras. E francamente, ficar preso dentro de um cristal por um mês me fez repensar meus apegos a objetos materiais.'" },

  { name: "Medalhão de Controle do Golem", category: "misc", subcategory: "artefato",
    tier: "magico", weight: 0.2, consumable: false,
    magicBonus: {},
    effect: "Controla o Golem de Pedra Antiga ou Golem da Marca vinculado a ele. Comando de 1 Ação: o Golem age no turno do portador com 2 Ações. O Golem obedece comandos simples. Alcance de controle: 20 hex. Se o portador ficar Inconsciente: Golem fica inativo. 1 Golem vinculado por medalhão.",
    story: "O Lorde Marcino nunca imaginou que alguém fosse roubá-lo durante o combate de arena. Por isso não usava corrente." },

  { name: "Ficha de Agente Real", category: "misc", subcategory: "gear",
    tier: "raro", weight: 0.02, consumable: true,
    effect: "Apresentada a qualquer guarda, oficial ou funcionário real: garante passagem imediata para 1 local restrito à escolha. Guardas reconhecem o símbolo. 1 uso — a ficha é retida após uso. Alternativa: usada para solicitar audiência urgente com funcionário de alto escalão (sem espera).",
    story: "O mensageiro Rael tem 3 dessas. Deu uma ao grupo sem hesitar. 'Vocês salvaram minha vida. Uma ficha de papel é pouco.'" },

  { name: "Pele de Lobisomem (Cura Pendente)", category: "misc", subcategory: "gear",
    tier: "raro", weight: 3.0, consumable: false,
    magicBonus: {},
    effect: "Material raro com dupla utilidade. (1) Para Alquimistas: componente para Antídoto de Lycantrofia (junto com 2 ingredientes do Livro de Lycantrofia). (2) Para Ferreiros: pode ser processada em Armadura de Lobisomem (+2 Def.Física, regenera 2 HP/turno quando abaixo de 50% HP). Requer ferreiro especializado.",
    story: "Dron não sabia o que acontecia com seu corpo durante as noites de lua cheia. A pele que sobra ao amanhecer nunca estava onde ele havia dormido." },

  { name: "Livro de Lycantrofia", category: "misc", subcategory: "gear",
    tier: "raro", weight: 0.8, consumable: false,
    magicBonus: {},
    effect: "Contém: história completa da maldição lycântropa, 3 receitas de Antídoto (requerem ingredientes raros — Mestre define disponibilidade), e rituais de contenção. Qualquer personagem que o leia por 1 hora pode fazer testes de Conhecimento sobre Lycantrofia com +1d6. Clérigos podem usar o ritual de contenção como habilidade.",
    story: "O Padre Meln o escondeu por 15 anos. Conhecimento perigoso nas mãos erradas. Mais perigoso ainda nas mãos que não sabem o que têm." },

  { name: "Cristal da Marca Selado", category: "misc", subcategory: "artefato",
    tier: "unico", weight: 0.6, consumable: false,
    cursed: true,
    magicBonus: {},
    effect: "Contém um fragmento físico da energia do Deus Marcado, selado mas não destruído. AMALDIÇOADO: portador ganha +1d6 de dano em todos os ataques, mas criaturas santas a 3 hex sofrem 1d4 de dano sombrio passivo (involuntário). Clérigos de qualquer divindade sentem o cristal imediatamente. Pode ser usado como ingrediente para ritual de banimento ou como fonte de poder proibido.",
    story: "A fissura estava selada. O cristal estava no centro. Alguém tinha que carregá-lo." },

  { name: "Escama de Dracônico Adulto", category: "misc", subcategory: "gear",
    tier: "lendario", weight: 1.5, consumable: false,
    magicBonus: {},
    effect: "Material lendário doado voluntariamente por Tharak. Pode ser processada por ferreiro de elite em: (1) Armadura de Escama de Dragão (+5 Def.Física, resistência a fogo — reduz dano de fogo em 4/dado) ou (2) Escudo Dracônico (+4 Def.Física, +3 Def.Mágica, 1x/combate absorve sopro de dragão completamente). Requer 2 semanas de trabalho e 100 moedas.",
    story: "Tharak a arrancou do próprio flanco sem piscar. 'Doerá por uma semana. Mas minhas escamas crescem de volta. A amizade não cresce.'" }
,

  /* ═══════════════════════════════════════════════════════════════
     MATERIAIS DE CRAFTING — type:"material"
     Aparecem no painel de Alquimia como ingredientes.
     Peso sempre baixo (coleta de campo).
     ═══════════════════════════════════════════════════════════════ */

  // ── Plantas e Ervas ──────────────────────────────────────────
  { name:"Erva de Cura Menor", category:"misc", subcategory:"material",
    craftingMaterial:true, materialTag:"erva_cura_menor",
    tier:"comum", weight:0.05, consumable:true,
    effect:"Ingrediente de alquimia. Propriedades regenerativas leves.", story:"Comum em campos abertos. Cheiro suave de mel." },

  { name:"Raiz de Cura", category:"misc", subcategory:"material",
    craftingMaterial:true, materialTag:"raiz_cura",
    tier:"comum", weight:0.08, consumable:true,
    effect:"Ingrediente de alquimia. Propriedades regenerativas médias.", story:"Raiz vermelha com nervuras douradas. Mirna paga bem por ela." },

  { name:"Flor do Pântano Cinzento", category:"misc", subcategory:"material",
    craftingMaterial:true, materialTag:"flor_pantano",
    tier:"comum", weight:0.04, consumable:true,
    effect:"Ingrediente de alquimia. Propriedades purificantes.", story:"Cresce só no Pântano do Véu Cinzento. Petalas azul-acinzentadas." },

  { name:"Cogumelo Relâmpago", category:"misc", subcategory:"material",
    craftingMaterial:true, materialTag:"cogumelo_relampago",
    tier:"comum", weight:0.06, consumable:true,
    effect:"Ingrediente de alquimia. Propriedades elétricas latentes.", story:"Emite faíscas quando cortado. Não segurar por muito tempo." },

  { name:"Musgo Gelo-Eterno", category:"misc", subcategory:"material",
    craftingMaterial:true, materialTag:"musgo_gelo",
    tier:"comum", weight:0.05, consumable:true,
    effect:"Ingrediente de alquimia. Propriedades de resfriamento extremo.", story:"Frio ao toque mesmo no verão. Cresce em rochas de Atrelon." },

  { name:"Pimenta do Inferno", category:"misc", subcategory:"material",
    craftingMaterial:true, materialTag:"pimenta_inferno",
    tier:"comum", weight:0.04, consumable:true,
    effect:"Ingrediente de alquimia. Propriedades incendiárias concentradas.", story:"Vermelha e preta. Nunca lamber os dedos depois de manuseá-la." },

  { name:"Erva da Invisibilidade", category:"misc", subcategory:"material",
    craftingMaterial:true, materialTag:"erva_invisibilidade",
    tier:"raro", weight:0.04, consumable:true,
    effect:"Ingrediente de alquimia. Propriedades de ocultação mágica.", story:"Translúcida. Difícil de encontrar por razões óbvias." },

  { name:"Raiz de Velocidade", category:"misc", subcategory:"material",
    craftingMaterial:true, materialTag:"raiz_velocidade",
    tier:"raro", weight:0.06, consumable:true,
    effect:"Ingrediente de alquimia. Propriedades de aceleração do metabolismo.", story:"Treme levemente mesmo parada. Druidas a chamam de Raiz Inquieta." },

  // ── Reagentes de Criatura ─────────────────────────────────────
  { name:"Glândula de Veneno (Cobra)", category:"misc", subcategory:"material",
    craftingMaterial:true, materialTag:"glandula_veneno_cobra",
    tier:"comum", weight:0.08, consumable:true,
    effect:"Ingrediente de alquimia. Base para venenos e antídotos.", story:"Deve ser mantida fria ou perde potência em 12 horas." },

  { name:"Glândula de Veneno Paralisante", category:"misc", subcategory:"material",
    craftingMaterial:true, materialTag:"glandula_paralisia",
    tier:"raro", weight:0.08, consumable:true,
    effect:"Ingrediente de alquimia. Propriedades paralisantes concentradas.", story:"Do Lagarto Venenoso Gigante. Raramente coletada com sucesso." },

  { name:"Ácido de Slime", category:"misc", subcategory:"material",
    craftingMaterial:true, materialTag:"acido_slime",
    tier:"comum", weight:0.1, consumable:true,
    effect:"Ingrediente de alquimia. Ácido corrosivo de baixa estabilidade.", story:"Frasco selado com cera especial. O frasco comum dura 3 dias." },

  { name:"Núcleo de Relâmpago", category:"misc", subcategory:"material",
    craftingMaterial:true, materialTag:"nucleo_relampago",
    tier:"raro", weight:0.2, consumable:true,
    effect:"Ingrediente de alquimia. Energia elétrica cristalizada.", story:"Do Elemental de Relâmpago. Faísca ao toque. Armazenar em madeira seca." },

  { name:"Pena do Corvo Fantasma", category:"misc", subcategory:"material",
    craftingMaterial:true, materialTag:"pena_corvo_fantasma",
    tier:"raro", weight:0.01, consumable:true,
    effect:"Ingrediente de alquimia. Propriedades espectrais e de presságio.", story:"Levemente translúcida. Flutua se solta." },

  { name:"Essência do Eco", category:"misc", subcategory:"material",
    craftingMaterial:true, materialTag:"essencia_eco",
    tier:"raro", weight:0.05, consumable:true,
    effect:"Ingrediente de alquimia. Capta e reflete energias mágicas.", story:"Do Espectro do Eco. Parece mudar de cor conforme a luz." },

  { name:"Pó de Fada", category:"misc", subcategory:"material",
    craftingMaterial:true, materialTag:"po_fada",
    tier:"raro", weight:0.02, consumable:true,
    effect:"Ingrediente de alquimia. Propriedades ilusórias e de alteração de estado.", story:"Brilha no escuro. Pixies ficam bravíssimas se roubado." },

  { name:"Dente de Vampiro", category:"misc", subcategory:"material",
    craftingMaterial:true, materialTag:"dente_vampiro",
    tier:"raro", weight:0.05, consumable:true,
    effect:"Ingrediente de alquimia. Propriedades de drenagem e restauração.", story:"Ainda perfura vidro grosso. Armazenar em estojo de couro." },

  { name:"Escama de Karlac Juvenil", category:"misc", subcategory:"material",
    craftingMaterial:true, materialTag:"escama_karlac",
    tier:"raro", weight:0.3, consumable:true,
    effect:"Ingrediente de alquimia. Resistência extrema a calor.", story:"Quase impossível de cortar. Vorn pagaria bem por uma." },

  { name:"Núcleo de Magma Fundido", category:"misc", subcategory:"material",
    craftingMaterial:true, materialTag:"nucleo_magma",
    tier:"lendario", weight:0.5, consumable:true,
    effect:"Ingrediente de alquimia lendário. Calor permanente cristalizado.", story:"Brilha laranja no escuro. Queima madeira ao contato após 10 minutos." },

  // ── Reagentes Alquímicos Sintéticos ──────────────────────────
  { name:"Água Destilada Arcana", category:"misc", subcategory:"material",
    craftingMaterial:true, materialTag:"agua_arcana",
    tier:"comum", weight:0.2, consumable:true,
    effect:"Solvente base para poções. Necessário em quase todas as receitas.", story:"Agua comum purificada com magia menor. Alquimistas vendem em todo lugar." },

  { name:"Pó de Osso Sagrado", category:"misc", subcategory:"material",
    craftingMaterial:true, materialTag:"po_osso_sagrado",
    tier:"comum", weight:0.05, consumable:true,
    effect:"Ingrediente de alquimia. Propriedades purificantes e sagradas.", story:"Osso de criatura sagrada moído. Clérigos o usam em rituais menores." },

  { name:"Catalisador de Cristal", category:"misc", subcategory:"material",
    craftingMaterial:true, materialTag:"catalisador_cristal",
    tier:"raro", weight:0.1, consumable:true,
    effect:"Amplifica o efeito de qualquer poção. Usado como ingrediente final.", story:"Fragmento de cristal de Atrelon. Reage com magia de forma imprevisível." },

  /* ─── PERGAMINHOS DE RECEITA — type:"recipe_scroll" ─────────── */

  { name:"Pergaminho de Receita: Poção de Cura Menor",   category:"misc", subcategory:"recipe_scroll",
    recipeId:"rec_cura_menor",    tier:"comum",   weight:0.05, consumable:true,
    effect:"Usar este item: aprende permanentemente a receita da Poção de Cura Menor. Consumido ao usar.",
    story:"Escrito com tinta vermelha sobre pergaminho fino. Odor leve de ervas." },

  { name:"Pergaminho de Receita: Poção de Cura",         category:"misc", subcategory:"recipe_scroll",
    recipeId:"rec_cura_media",    tier:"comum",   weight:0.05, consumable:true,
    effect:"Usar este item: aprende permanentemente a receita da Poção de Cura. Consumido ao usar.",
    story:"Páginas duplas dobradas. A tinta muda de cor no meio — o alquimista trocou de caneta." },

  { name:"Pergaminho de Receita: Antídoto Aprimorado",   category:"misc", subcategory:"recipe_scroll",
    recipeId:"rec_cura_veneno",   tier:"comum",   weight:0.05, consumable:true,
    effect:"Usar este item: aprende permanentemente a receita do Antídoto Aprimorado. Consumido ao usar.",
    story:"Cheiro forte de flores do pântano. Levemente úmido." },

  { name:"Pergaminho de Receita: Poção de Purificação",  category:"misc", subcategory:"recipe_scroll",
    recipeId:"rec_purificacao",   tier:"raro",    weight:0.05, consumable:true,
    effect:"Usar este item: aprende permanentemente a receita da Poção de Purificação. Consumido ao usar.",
    story:"Escrita em dois idiomas — o segundo é ilegível mas o resultado final é claro." },

  { name:"Pergaminho de Receita: Frasco de Ácido",       category:"misc", subcategory:"recipe_scroll",
    recipeId:"rec_acido",         tier:"comum",   weight:0.05, consumable:true,
    effect:"Usar este item: aprende permanentemente a receita do Frasco de Ácido. Consumido ao usar.",
    story:"Tem marcas de respingos de ácido nas bordas. O autor sobreviveu — provavelmente." },

  { name:"Pergaminho de Receita: Coquetel de Fogo",      category:"misc", subcategory:"recipe_scroll",
    recipeId:"rec_fogo",          tier:"comum",   weight:0.05, consumable:true,
    effect:"Usar este item: aprende permanentemente a receita do Coquetel de Fogo. Consumido ao usar.",
    story:"Cuidado ao manusear perto de chamas. A tinta é levemente inflamável." },

  { name:"Pergaminho de Receita: Veneno de Contato",     category:"misc", subcategory:"recipe_scroll",
    recipeId:"rec_veneno_contato",tier:"comum",   weight:0.05, consumable:true,
    effect:"Usar este item: aprende permanentemente a receita do Veneno de Contato. Consumido ao usar.",
    story:"Embalado em linho duplo. A receita está correta mas o autor não assinou." },

  { name:"Pergaminho de Receita: Poção de Paralisia",    category:"misc", subcategory:"recipe_scroll",
    recipeId:"rec_paralisia",     tier:"raro",    weight:0.05, consumable:true,
    effect:"Usar este item: aprende permanentemente a receita da Poção de Paralisia. Consumido ao usar.",
    story:"Letra pequena e precisa. Este alquimista sabia o que estava fazendo." },

  { name:"Pergaminho de Receita: Bomba de Relâmpago",    category:"misc", subcategory:"recipe_scroll",
    recipeId:"rec_acido_relampago",tier:"raro",   weight:0.05, consumable:true,
    effect:"Usar este item: aprende permanentemente a receita da Bomba de Relâmpago. Consumido ao usar.",
    story:"Tem marcas de queimadura nas bordas. Por raios, não por ácido." },

  { name:"Pergaminho de Receita: Poção de Invisibilidade",category:"misc",subcategory:"recipe_scroll",
    recipeId:"rec_invisibilidade",tier:"raro",    weight:0.05, consumable:true,
    effect:"Usar este item: aprende permanentemente a receita da Poção de Invisibilidade. Consumido ao usar.",
    story:"O pergaminho parece translúcido quando segurado contra a luz." },

  { name:"Pergaminho de Receita: Poção de Velocidade",   category:"misc", subcategory:"recipe_scroll",
    recipeId:"rec_velocidade",    tier:"raro",    weight:0.05, consumable:true,
    effect:"Usar este item: aprende permanentemente a receita da Poção de Velocidade. Consumido ao usar.",
    story:"Escrito muito rápido — a letra é quase ilegível. Temático." },

  { name:"Pergaminho de Receita: Poção de Força",        category:"misc", subcategory:"recipe_scroll",
    recipeId:"rec_forca",         tier:"comum",   weight:0.05, consumable:true,
    effect:"Usar este item: aprende permanentemente a receita da Poção de Força. Consumido ao usar.",
    story:"Manchado de algo avermelhado. Provavelmente vinho. Provavelmente." },

  { name:"Pergaminho de Receita: Elixir de Resistência ao Fogo",category:"misc",subcategory:"recipe_scroll",
    recipeId:"rec_resistencia_fogo",tier:"raro",  weight:0.05, consumable:true,
    effect:"Usar este item: aprende permanentemente a receita do Elixir de Resistência ao Fogo. Consumido ao usar.",
    story:"Sobreviveu a um incêndio. O alquimista também, graças ao próprio elixir." },

  { name:"Pergaminho de Receita: Bomba de Névoa",        category:"misc", subcategory:"recipe_scroll",
    recipeId:"rec_neblina",       tier:"comum",   weight:0.05, consumable:true,
    effect:"Usar este item: aprende permanentemente a receita da Bomba de Névoa. Consumido ao usar.",
    story:"As instruções são simples mas a nota final diz: 'não testar em espaços fechados'." },

  { name:"Pergaminho de Receita: Grande Bomba de Magma", category:"misc", subcategory:"recipe_scroll",
    recipeId:"rec_magma",         tier:"lendario",weight:0.05, consumable:true,
    effect:"Usar este item: aprende permanentemente a receita da Grande Bomba de Magma. Consumido ao usar.",
    story:"Encadernado em couro de Karlac Juvenil. A tinta é laranja escuro. Nunca fica fria." },

  /* ─── MATERIAIS DE FORJA — smithingMaterial:true ─────────────── */

  { name:"Pedra de Afiar Rúnica", category:"misc", subcategory:"material",
    craftingMaterial:true, smithingMaterial:true, materialTag:"pedra_afia_runica",
    tier:"comum", weight:0.2, consumable:true,
    smeltingType:"weapon",
    effect:"Material de forja. Afiam e gravam runas básicas em armas de corte.",
    story:"Pedra cinza com veio dourado. Usada por ferreiros anões há séculos." },

  { name:"Óleo de Serpente Venenosa", category:"misc", subcategory:"material",
    craftingMaterial:true, smithingMaterial:true, materialTag:"oleo_serpente",
    tier:"comum", weight:0.15, consumable:true,
    smeltingType:"weapon",
    effect:"Material de forja. Infunde veneno duradouro em lâminas.",
    story:"Extraído da glândula de Cobras do Sangue de Jurgmund. Viscoso e escuro." },

  { name:"Pó de Osso de Wyvern", category:"misc", subcategory:"material",
    craftingMaterial:true, smithingMaterial:true, materialTag:"po_osso_wyvern",
    tier:"raro", weight:0.1, consumable:true,
    smeltingType:"weapon",
    effect:"Material de forja. Adiciona dureza sobrenatural e aura intimidadora à arma.",
    story:"Wyverns não existem mais em Aether. Este pó é de uma era anterior." },

  { name:"Cinzas de Karlac", category:"misc", subcategory:"material",
    craftingMaterial:true, smithingMaterial:true, materialTag:"cinzas_karlac",
    tier:"raro", weight:0.08, consumable:true,
    smeltingType:"weapon",
    effect:"Material de forja. Infunde fogo permanente na arma.",
    story:"Coletadas do rastro deixado por um Karlac Juvenil. Ainda quentes." },

  { name:"Cristal de Relâmpago Puro", category:"misc", subcategory:"material",
    craftingMaterial:true, smithingMaterial:true, materialTag:"cristal_relampago",
    tier:"raro", weight:0.25, consumable:true,
    smeltingType:"weapon",
    effect:"Material de forja. Encanta a arma com descargas elétricas em cada golpe.",
    story:"Formado no ponto exato onde um raio atingiu a rocha de Atrelon." },

  { name:"Sangue Congelado do Lich", category:"misc", subcategory:"material",
    craftingMaterial:true, smithingMaterial:true, materialTag:"sangue_lich",
    tier:"raro", weight:0.12, consumable:true,
    smeltingType:"weapon",
    effect:"Material de forja. Infunde gelo e necromancia na lâmina.",
    story:"Do Lich Varek, extraído antes da destruição do Filactério. Cristalizado." },

  { name:"Essência do Vazio Sombrio", category:"misc", subcategory:"material",
    craftingMaterial:true, smithingMaterial:true, materialTag:"essencia_vazio",
    tier:"lendario", weight:0.05, consumable:true,
    smeltingType:"weapon",
    effect:"Material de forja lendário. Infunde o Vazio na arma — dano sombrio que ignora defesas mágicas.",
    story:"Da Loba Alfa das Sombras, extraída por Clérigo. Quase impossível de segurar sem sentir o vazio." },

  { name:"Fragmento do Coração de Dragão", category:"misc", subcategory:"material",
    craftingMaterial:true, smithingMaterial:true, materialTag:"coracao_dragao",
    tier:"lendario", weight:0.3, consumable:true,
    smeltingType:"weapon",
    effect:"Material de forja lendário. A arma absorve e redireciona energia elemental.",
    story:"Do Filhote Dracônico de Tharak. Tharak sentiria a perda — não use perto dele." },

  /* ─── Materiais de forja para ARMADURAS ─────────────────────── */

  { name:"Couro Endurecido de Lobo", category:"misc", subcategory:"material",
    craftingMaterial:true, smithingMaterial:true, materialTag:"couro_lobo",
    tier:"comum", weight:0.3, consumable:true,
    smeltingType:"armor",
    effect:"Material de reforço. Adiciona resistência e furtividade à armadura.",
    story:"Da Alcateia das Sombras Cinzentas. Flexível e silencioso." },

  { name:"Placas de Golem de Pedra", category:"misc", subcategory:"material",
    craftingMaterial:true, smithingMaterial:true, materialTag:"placa_golem",
    tier:"raro", weight:0.8, consumable:true,
    smeltingType:"armor",
    effect:"Material de reforço. Adiciona defesa física massiva e resistência a impacto.",
    story:"Arrancadas de um Golem de Pedra Antiga. Pesadas mas quase indestrutíveis." },

  { name:"Escama de Cobra Guardiã", category:"misc", subcategory:"material",
    craftingMaterial:true, smithingMaterial:true, materialTag:"escama_cobra_guardia",
    tier:"raro", weight:0.25, consumable:true,
    smeltingType:"armor",
    effect:"Material de reforço. Adiciona resistência a veneno e magia.",
    story:"Da Cobra Guardiã de Jurgmund. Semi-translúcida e quase tão resistente quanto aço." },

  { name:"Teia de Aranha Abissal", category:"misc", subcategory:"material",
    craftingMaterial:true, smithingMaterial:true, materialTag:"teia_aranha_abissal",
    tier:"raro", weight:0.1, consumable:true,
    smeltingType:"armor",
    effect:"Material de reforço. Adiciona propriedades adesivas e resistência a projéteis.",
    story:"Da Aranha Abissal Tecelã. Mais forte que aço ao ser tecida." },

  { name:"Fragmento do Construto de Durrak", category:"misc", subcategory:"material",
    craftingMaterial:true, smithingMaterial:true, materialTag:"fragmento_construto",
    tier:"lendario", weight:1.0, consumable:true,
    smeltingType:"armor",
    effect:"Material de reforço lendário. Adiciona resistência mecânica absoluta e deflexão automática.",
    story:"Do Constructo da Forja de Durrak. O ferro-negro fundido não aceita calor nem frio." },

  { name:"Couro do Caçador de Gigantes", category:"misc", subcategory:"material",
    craftingMaterial:true, smithingMaterial:true, materialTag:"couro_cacador_gigantes",
    tier:"raro", weight:0.4, consumable:true,
    smeltingType:"armor",
    effect:"Material de reforço. Adiciona resistência e bônus contra criaturas grandes.",
    story:"Do couro recuperado de combates contra Gigantes. Cada marca conta uma história." },

  /* ─── LOOT DE MONSTROS — MATERIAIS E CONSUMÍVEIS ──────── */

  { name:"Glândula de Veneno do Túmulo", category:"misc", subcategory:"material",
    craftingMaterial:true, materialTag:"glandula_veneno_tumulo",
    tier:"raro", weight:0.1, consumable:false,
    effect:"Material alquímico raro. Usada para criar Veneno do Túmulo (imune a antídotos comuns). Também pode ser base para Poção de Resistência a Venenos avançada. Prazo de uso: 7 dias fora do corpo da aranha.",
    story:"Exsuda veneno lentamente. Mantenha em frasco lacrado." },

  { name:"Teia Endurecida", category:"misc", subcategory:"material",
    craftingMaterial:true, materialTag:"teia_endurecida",
    tier:"raro", weight:0.3, consumable:false,
    effect:"Material para armadura. Mais resistente que aço ao ser tecida. Receita de Armadura Tecida do Abismo usa este material. Também pode ser usada como corda mágica resistente (aguenta até 300kg).",
    story:"A Aranha dos Túmulos tecia por anos. Cada monstro no túmulo contribuiu com as fibras." },

  { name:"Fragmento do Núcleo de Espelho", category:"misc", subcategory:"material",
    craftingMaterial:true, materialTag:"nucleo_espelho",
    tier:"lendario", weight:0.15, consumable:false,
    effect:"Material lendário de forja. Usado em encantamentos de reflexo — qualquer arma ou armadura forjada com este fragmento ganha 20% de chance de refletir o próximo ataque recebido (1x/combate). Delicado: quebra se exposto a calor intenso.",
    story:"O Golem não foi criado assim. O fragmento de espelho que serve de núcleo tem origem mais antiga." },

  { name:"Pó de Espelho Arcano", category:"misc", subcategory:"material",
    craftingMaterial:true, materialTag:"po_espelho_arcano",
    tier:"raro", weight:0.05, consumable:true,
    effect:"Cada dose: lançada no ar cria uma superfície reflexiva temporária de 3 hex por 2 rodadas. Magias que passam pela superfície têm 30% de chance de desviar. Também revela criaturas invisíveis na área (o pó gruda nelas).",
    story:"Soa como cristais quando o frasco mexe." },

  { name:"Essência de Morto-vivo", category:"misc", subcategory:"material",
    craftingMaterial:true, materialTag:"essencia_morto_vivo",
    tier:"raro", weight:0.05, consumable:false,
    effect:"Usada em necromancia e alquimia. Pode ser componente de poção de Resistência à Morte (sobrevive a 1 golpe letal com 1 HP, 1x/dia). Mestre de Necromancia pode usá-la para reanimar um morto-vivo Dif.1 como aliado temporário.",
    story:"Não é sangue. Não é alma. É o que sobra quando ambos partem mas a vontade fica." },

  { name:"Veneno de Paralisação", category:"misc", subcategory:"potion",
    tier:"raro", weight:0.1, consumable:true,
    effect:"2 doses. Aplicado em arma: próximo acerto injeta o veneno. Alvo testea FOR (difícil) ou fica Paralisado por 1 turno inteiro (0 Ações, 0 Reações, não pode ser esquivado por ele). Após o turno: recupera automaticamente.",
    story:"A Executora encomendava doses em grandes quantidades. Ninguém sabe de quem." },

  { name:"Escamas de Serpente de Julgmund", category:"misc", subcategory:"material",
    craftingMaterial:true, materialTag:"escamas_serpente_julgmund",
    tier:"raro", weight:0.1, consumable:false,
    effect:"Cada dose: componente para poção de Resistência Mágica (−2 de dano por dado de magia por 3 combates). O sacerdote as cultivava com cuidado — têm resíduos de energia divina corrompida.",
    story:"Julgmund não sabe que suas serpentes foram corrompidas. Ou talvez saiba." },

  { name:"Coração Ainda Batendo", category:"misc", subcategory:"material",
    craftingMaterial:true, materialTag:"coracao_ainda_batendo",
    tier:"lendario", weight:0.4, consumable:false,
    effect:"Componente lendário de ritual de ressurreição. Um clérigo Nível 5+ pode realizar ritual de 1 hora usando este coração para ressuscitar um aliado morto há até 24 horas com 50% HP. Só funciona uma vez. Continua batendo até ser usado.",
    story:"O sacerdote o arrancou de alguém importante. O coração não parou porque a alma se recusou a partir." },

  { name:"Glândula de Mimetismo", category:"misc", subcategory:"material",
    craftingMaterial:true, materialTag:"glandula_mimetismo",
    tier:"raro", weight:0.1, consumable:false,
    effect:"Componente para Poção de Disfarce Perfeito (disfarça completamente por 1 hora, inclui voz e detalhes físicos — detectável apenas por Anel de Verdade ou Arcanismo crítico). Muito procurada por espiões.",
    story:"O Trocador de Pele tinha dezenas delas. Usava para aprimorar a própria habilidade." },

  { name:"Fragmento de Memória", category:"misc", subcategory:"artefato",
    tier:"raro", weight:0.05, consumable:true,
    effect:"Contém uma memória completa de uma vítima anterior do Trocador de Pele. Ao segurar e concentrar por 1 minuto: o portador experimenta a memória como se fosse sua (informações, localidades, segredos da vítima). Quebra após o uso.",
    story:"A pessoa que viveu esta memória provavelmente ainda não sabe que perdeu." },

  { name:"Pele Adaptável", category:"misc", subcategory:"material",
    craftingMaterial:true, materialTag:"pele_adaptavel",
    tier:"raro", weight:0.4, consumable:false,
    effect:"Tecido que muda de cor ao toque — se adapta ao ambiente em 1 rodada. Pode ser usado como material para Armadura Silenciosa (em conjunto com Couro de Lobo). Sozinho, funciona como capa que concede +1d6 em Furtividade.",
    story:"Quente. Levemente. Não é desconfortável. Apenas perturbador." },

  { name:"Núcleo de Animação", category:"misc", subcategory:"material",
    craftingMaterial:true, materialTag:"nucleo_animacao",
    tier:"lendario", weight:1.0, consumable:false,
    effect:"Componente lendário. Um Mago ou Clérigo Nível 5+ pode usá-lo em ritual de 4 horas para animar um construto de pedra, metal ou madeira como servo permanente (age como Golem Dif.2, segue ordens simples). Alternativa: pode ser decomposto em 3 doses de Pó de Espelho Arcano.",
    story:"O Guardião foi animado com um núcleo assim. Quem o fez não deixou assinatura." },

  { name:"Elos de Ferro Antigo", category:"misc", subcategory:"material",
    craftingMaterial:true, materialTag:"elos_ferro_antigo",
    tier:"raro", weight:0.3, consumable:false,
    effect:"Elos de metal pré-Lich de Atrelon — mais resistentes que aço moderno. Podem ser usados para reforçar armaduras (+1 Def.Física sem peso adicional) ou criar correntes/grilhões inquebrável por meios não-mágicos. Ferreiro especializado necessário.",
    story:"Não enferrujam. Não dobram fácil. Foram feitos para durar mais que o mundo." },

  { name:"Pena de Obsidiana", category:"misc", subcategory:"material",
    craftingMaterial:true, materialTag:"pena_obsidiana",
    tier:"raro", weight:0.05, consumable:true,
    effect:"Cada pena funciona como projétil de arremesso mágico: alcance 6 hex, 1d8 de dano, sem rolagem de esquiva (chegam rápido demais — mesmo efeito do Caçador). Podem ser usadas com arcos ou como dardos. Não podem ser encantadas mas também não perdem fio.",
    story:"Negras como void. Quando a luz atinge em certo ângulo, refletem estrelas que não existem." },

  { name:"Frasco de Alma Aprisionada", category:"misc", subcategory:"artefato",
    tier:"unico", weight:0.1, consumable:false,
    effect:"Contém a alma da última vítima do Caçador de Almas Corvino. A alma pode ser: liberada em ritual (ato de bondade, recompensa de quest), consumida por necromante para poder (moralmente questionável), ou usada como componente de Convergência do Destino. O frasco pulsa levemente no escuro.",
    story:"A alma dentro parece estar esperando. Não com medo. Com esperança." },

  { name:"Bico de Obsidiana", category:"misc", subcategory:"material",
    craftingMaterial:true, materialTag:"bico_obsidiana",
    tier:"raro", weight:0.2, consumable:false,
    effect:"Material para forja especial. Forjado com os outros ingredientes corretos, cria uma Adaga do Roubo de Vida (1d8, acertos curam o portador em 1d4 HP). Requer Ferreiro Especializado e Cinzas de Karlac como material adicional.",
    story:"O Corvino usava para colher almas. A ironia de transformá-lo em instrumento de cura não escapa a ninguém." },

  { name:"Chave da Passagem", category:"misc", subcategory:"artefato",
    tier:"raro", weight:0.2, consumable:false,
    effect:"Quest Item: abre a câmara, porta ou cofre que o Guardião das Correntes protegia. Inquebrável e insubstituível — se perdida, a câmara não pode ser aberta por meios normais. A câmara contém o que o Guardião protegia (Mestre decide o conteúdo).",
    story:"Sempre existiu apenas uma cópia. O Guardião morreu para garantir isso." }];


/* ================================================================
   SUBCLASSES — Escolhidas após a classe no wizard
   Cada subclasse tem 4 habilidades; o jogador escolhe 2 para
   adicionar à ficha como habilidades disponíveis para comprar.
   sinergyClasses: classes que têm bônus extras com esta subclasse
   commonToAll: true = qualquer classe pode pegar
   ================================================================ */
const SUBCLASSES = {

  /* ─────────────────────────────────────────────────────────────
     FORMATO DE CADA SUBCLASSE
     ─────────────────────────────────────────────────────────────
     passiveBonus: bônus recebido SOMENTE ao escolher a subclasse
     sinergyNote:  bônus extra para as 2 classes sinérgicas
     skills: 4 habilidades (2 comuns a qualquer classe, 2 só p/ sinergia)
     cost: sempre "2 pontos" (comum) ou "3 pontos" (sinérgica)
     Os recursos (Fúria / MP / Foco / Cargas / Fé) aparecem nos textos
     como custo de ativação — não como pontos de personagem.
     ───────────────────────────────────────────────────────────── */

  /* ── 1. NECROMANTE — Mago + Clérigo ─────────────────────────── */
  "necromante": {
    name: "Necromante",
    icon: "💀",
    description: "Dobra a linha entre vida e morte. Invoca mortos-vivos, drena a força vital dos inimigos e transforma o campo de batalha numa galeria de cadáveres obedientes.",
    sinergyClasses: ["mago", "clerigo"],
    passiveBonus: "Ao escolher: +1 Slot de Magia permanente. Magias de invocação de mortos-vivos não consomem Slot (apenas Ação de Magia).",
    sinergyNote: "Mago e Clérigo: mortos-vivos invocados têm +25% HP e +1d4 de dano. Drenar Essência recupera +1 MP ao acertar.",
    skills: [
      {
        id: "sub-necro-levanta", name: "Levantar das Cinzas",
        cost: "2 pontos", tier: 1, commonToAll: true,
        levels: [
          { level: 1, effect: "Ação de Magia: levanta 1 cadáver visível como Morto-Vivo Menor (HP 30, dano 1d6) aliado. Age no seu turno. Custa 1 Slot ou 2 MP (se Mago). Dura o combate ou até ser destruído." },
          { level: 2, effect: "Levanta 2 mortos simultaneamente. HP 40, dano 1d8 cada. Custo: 1 Slot ou 2 MP." },
          { level: 3, effect: "Levanta 3 mortos. HP 55, dano 1d10. Ao morrerem explodem causando 1d6 em inimigos adjacentes. Custo: 1 Slot ou 2 MP." }
        ],
        example: "O cadáver do guarda se levanta. Ainda usa o uniforme. Apenas os olhos mudaram."
      },
      {
        id: "sub-necro-drenar", name: "Drenar Essência",
        cost: "2 pontos", tier: 1, commonToAll: true,
        levels: [
          { level: 1, effect: "Ação de Magia (custa 2 MP ou 1 Fé): toque ou alcance 3 hex. 1d8+SAB de dano. Você cura metade do dano causado. Não funciona em Construtos." },
          { level: 2, effect: "1d10+SAB. Cura metade. Custa 2 MP ou 1 Fé. Funciona à distância até 6 hex." },
          { level: 3, effect: "1d12+SAB. Cura o total do dano. Custa 2 MP ou 1 Fé. Se matar o alvo: recupera 1 Slot ou 3 MP." }
        ],
        example: "A energia saiu do corpo do Kobold como névoa dourada e entrou nos pulmões do Necromante."
      },
      {
        id: "sub-necro-aura", name: "Aura dos Sepulcros",
        cost: "3 pontos", tier: 2, commonToAll: false,
        sinergyClasses: ["mago", "clerigo"],
        levels: [
          { level: 1, effect: "Ação de Magia (custa 3 MP ou 2 Fé): ativa aura de 3 hex. Inimigos na área: −1d4 em todos os testes. Mortos-vivos aliados na área: +2 Def.Física e regeneram 2 HP/rodada. Dura 4 rodadas." },
          { level: 2, effect: "Aura 4 hex. −1d6 nos testes. Mortos-vivos +3 Def e regen 3 HP/r. Custa 3 MP ou 2 Fé." },
          { level: 3, effect: "Aura 5 hex. −1d8 nos testes. Mortos-vivos +4 Def e regen 4 HP/r. Custo reduzido para 2 MP ou 1 Fé. Dura 5 rodadas." }
        ],
        example: "O ar ficou frio e pesado. Os esqueletos se endireitaram. Os soldados tropeçaram."
      },
      {
        id: "sub-necro-lich", name: "Forma Lich Parcial",
        cost: "3 pontos", tier: 2, commonToAll: false,
        sinergyClasses: ["mago", "clerigo"],
        levels: [
          { level: 1, effect: "Ação de Magia (custa 4 MP ou 3 Fé): entra em Forma Lich por 3 rodadas. Imune a veneno e dano psíquico. +1d6 em magias de necromancia. Aparência muda visivelmente — NPCs reagem com medo." },
          { level: 2, effect: "+1d8 em magias. Duração 4 rodadas. Imune a sangramento. Mortos-vivos na área ganham +1 Ação enquanto a Forma durar. Custa 4 MP ou 3 Fé." },
          { level: 3, effect: "+1d10 em magias. 5 rodadas. Imune a veneno, sangramento e medo. Ao sair da Forma: pulso de energia necrótica (2d6 em raio 3 hex). 1 uso por combate. Custa 4 MP ou 3 Fé." }
        ],
        example: "Por três segundos, não havia mais dúvida do que ele era — ou do que ele estava se tornando."
      }
    ]
  },

  /* ── 2. BARDO — Mago + Ladino ────────────────────────────────── */
  "bardo": {
    name: "Bardo",
    icon: "🎭",
    description: "Arte como arma. O bardo usa música, palavras e ilusão para inspirar aliados, desconcertar inimigos e dobrar a realidade ao redor de sua performance.",
    sinergyClasses: ["mago", "ladino"],
    passiveBonus: "Ao escolher: +1 Ação de Magia gratuita por combate (exclusiva para habilidades de Bardo). Testes sociais fora de combate ganham +1d4 permanente.",
    sinergyNote: "Mago e Ladino: bônus de buff dura +1 rodada. Após performance, Furtividade tem −1 grau de dificuldade na mesma rodada.",
    skills: [
      {
        id: "sub-bardo-inspira", name: "Inspiração Bárdica",
        cost: "2 pontos", tier: 1, commonToAll: true,
        levels: [
          { level: 1, effect: "Ação de Magia (custa 2 MP ou 1 Carga de Veneno): aliado visível ganha +1d6 em ataques e testes por 2 rodadas. 2 usos por combate." },
          { level: 2, effect: "+1d8. 3 usos. Pode afetar 2 aliados diferentes com o mesmo uso. Custa 2 MP ou 1 Carga." },
          { level: 3, effect: "+1d10. Ilimitado. Aliados afetados também curam 1d6 HP ao receber o bônus. Custa 2 MP ou 1 Carga." }
        ],
        example: "Uma frase no momento certo pode valer mais que qualquer espada."
      },
      {
        id: "sub-bardo-persuasao", name: "Palavras de Mel",
        cost: "2 pontos", tier: 1, commonToAll: true,
        levels: [
          { level: 1, effect: "Ação de Magia (sem custo de recurso): +1d6 em testes sociais fora de combate. Em combate: testa SAB (difícil) para convencer 1 inimigo a não atacar por 1 rodada. 2 usos de combate." },
          { level: 2, effect: "+1d8 social. SAB (normal) em combate. 3 usos. Funciona em até 2 inimigos." },
          { level: 3, effect: "+1d10 social. Automático em inimigos Dif.1-2. SAB (normal) para Dif.3+. Ilimitado." }
        ],
        example: "O Goblin baixou o machado, confuso. Não sabia exatamente por quê."
      },
      {
        id: "sub-bardo-performance", name: "Performance de Batalha",
        cost: "3 pontos", tier: 2, commonToAll: false,
        sinergyClasses: ["mago", "ladino"],
        levels: [
          { level: 1, effect: "Ação de Magia (custa 3 MP ou 2 Cargas de Veneno): aliados em raio 5 hex ganham +1 Ação de Combate e +1d4 na Chance de Esquiva por 3 rodadas. Você fica Revelado enquanto performa." },
          { level: 2, effect: "+1 Ação de Combate e +1d6 na Esquiva. 4 rodadas. Custa 3 MP ou 2 Cargas." },
          { level: 3, effect: "+1 Ação e +1d8 Esquiva. 5 rodadas. Você pode Perfomar enquanto oculto sem se revelar (AGI normal). Custa 3 MP ou 2 Cargas." }
        ],
        example: "Ele tocou o alaúde com um sorriso. O grupo inteiro sentiu algo mudar."
      },
      {
        id: "sub-bardo-ilusao", name: "Ilusão Magistral",
        cost: "3 pontos", tier: 2, commonToAll: false,
        sinergyClasses: ["mago", "ladino"],
        levels: [
          { level: 1, effect: "Ação de Magia (custa 3 MP ou 2 Cargas): cria ilusão visual perfeita em área 3x3 hex por 5 rodadas. Inimigos: 30% de chance de atacar a ilusão em vez do alvo real (rola 1d10, em 1-3 erra). INT difícil para detectar." },
          { level: 2, effect: "Área 4x4. 40% de desvio (1-4). INT difícil. A ilusão pode simular movimento e sons básicos. Custa 3 MP ou 2 Cargas." },
          { level: 3, effect: "Área 5x5. 50% de desvio (1-5). Pode criar cópia perfeita de aliado: o alvo ataca a cópia por 1d3 rodadas antes de perceber. Custa 3 MP ou 2 Cargas." }
        ],
        example: "O guerreiro atacou com tudo. A muralha de pedra não era uma muralha. Nem era pedra."
      }
    ]
  },

  /* ── 3. PALADINO — Guerreiro + Clérigo ───────────────────────── */
  "paladino": {
    name: "Paladino",
    icon: "⚔️",
    description: "Guerreiro consagrado por uma divindade. Combina brutalidade marcial com bênçãos sagradas, protegendo aliados com fé e destruindo o mal com julgamento divino.",
    sinergyClasses: ["guerreiro", "clerigo"],
    passiveBonus: "Ao escolher: +1 Ação de Magia gratuita por combate (exclusiva para habilidades de Paladino). +2 em Defesa Física quando abaixo de 50% HP (passivo permanente).",
    sinergyNote: "Guerreiro e Clérigo: Fúria e Fé podem ser gastos juntos — ao usar Fúria, ganha +1 Fé automaticamente. Curas feitas pelo Paladino curam +1d4 adicional.",
    skills: [
      {
        id: "sub-palad-escudo", name: "Escudo da Fé",
        cost: "2 pontos", tier: 1, commonToAll: true,
        levels: [
          { level: 1, effect: "Ação de Combate (custa 1 Fúria ou 1 Fé): +2 Def.Física e +2 Def.Mágica por 3 rodadas. Pode ser ativado como Reação ao ser atacado (gasta 1 Fúria extra ou 1 Fé extra)." },
          { level: 2, effect: "+3 Def.Física e +3 Def.Mágica. 4 rodadas. Ativar como Reação custa apenas o recurso base." },
          { level: 3, effect: "+4 Def.Física e +4 Def.Mágica. 5 rodadas. Ao ativar: aliados adjacentes recebem +2 Def.Física também. Custa 1 Fúria ou 1 Fé." }
        ],
        example: "A luz formou um contorno ao redor do escudo. O próximo golpe do Troll não chegou a nada."
      },
      {
        id: "sub-palad-slot", name: "Fervor Sagrado",
        cost: "2 pontos", tier: 1, commonToAll: true,
        levels: [
          { level: 1, effect: "Passivo permanente: +1 Slot de Magia fixo. Ativo (custa 2 Fé ou 1 Fúria): 1x por descanso longo, recupera todos os Slots de Magia gastos." },
          { level: 2, effect: "+2 Slots fixos. 1x por descanso longo: recupera todos os Slots. Curar aliados com Slot cura +1d6 extra." },
          { level: 3, effect: "+3 Slots fixos. 1x por descanso curto: recupera metade dos Slots. +2d6 em qualquer cura feita com Slot." }
        ],
        example: "A fé não se esgota. Apenas se transforma."
      },
      {
        id: "sub-palad-punir", name: "Punição Divina",
        cost: "3 pontos", tier: 2, commonToAll: false,
        sinergyClasses: ["guerreiro", "clerigo"],
        levels: [
          { level: 1, effect: "Ao acertar ataque físico (custa 1 Slot + 1 Fúria ou 1 Fé): adiciona +1d8+SAB de dano sagrado. Contra inimigos corrompidos ou mortos-vivos: dobra o dano sagrado. Não precisa de Ação extra." },
          { level: 2, effect: "+1d10+SAB sagrado. Dobro em corrompidos. Pode ser usado 2x por combate sem gastar Fúria/Fé — apenas o Slot." },
          { level: 3, effect: "+1d12+SAB sagrado. Dobro em corrompidos. Inimigos atingidos testam FOR (normal) ou ficam Cegos por 1 rodada (luz divina). Custo: 1 Slot apenas." }
        ],
        example: "Ele pronunciou o nome do seu deus ao golpear. O Aralto gritou de um jeito diferente."
      },
      {
        id: "sub-palad-aura", name: "Aura de Proteção",
        cost: "3 pontos", tier: 2, commonToAll: false,
        sinergyClasses: ["guerreiro", "clerigo"],
        levels: [
          { level: 1, effect: "Ação de Combate (custa 2 Fúria ou 2 Fé): ativa aura em raio 3 hex. Aliados: +1 em resistências e +1d4 em Força de Vontade. Dura 4 rodadas. O Paladino pode continuar lutando normalmente enquanto ativa." },
          { level: 2, effect: "Raio 4 hex. +2 resistências e +1d6 Força de Vontade. 5 rodadas. Aliados na aura recuperam 1 HP no início de cada turno. Custa 2 Fúria ou 2 Fé." },
          { level: 3, effect: "Raio 5 hex. +3 resistências e +1d8 Força de Vontade. Aliados que caírem a 0 HP na aura: estabilizam automaticamente com 1 HP em vez de desmaiar. 1x por ativação. Custa 2 Fúria ou 2 Fé." }
        ],
        example: "A aura não brilha. Ela aquece. Quem está dentro dela simplesmente sabe que vai sobreviver."
      }
    ]
  },

  /* ── 4. ALQUIMISTA — Mago + Arqueiro ─────────────────────────── */
  "alquimista": {
    name: "Alquimista",
    icon: "⚗️",
    description: "A ciência como magia. O Alquimista transforma componentes mundanos em bombas, poções e pergaminhos que amplificam todo o grupo.",
    sinergyClasses: ["mago", "arqueiro"],
    passiveBonus: "Ao escolher: inicia cada sessão com 2 Poções de Cura Menores criadas gratuitamente. Kit de Alquimia não ocupa slot de item (está sempre disponível).",
    sinergyNote: "Mago e Arqueiro: poções criadas têm +50% de efeito. Bombas Alquímicas podem ser disparadas com Foco de Arqueiro (mesma Ação de ataque à distância).",
    skills: [
      {
        id: "sub-alq-criacao", name: "Criação de Poções",
        cost: "2 pontos", tier: 1, commonToAll: true,
        levels: [
          { level: 1, effect: "Fora de combate (30 min) ou com 2 Ações: cria 1d3 poções simples. Tipos: Cura (2d6+INT HP), Força (+1d6 dano, 3 rodadas), Antídoto, Veneno de Contato (1d4/rodada, 3 rodadas). Duram até usar ou fim da sessão. Usa 2 MP (Mago) ou 2 Foco (Arqueiro) ou materiais coletados." },
          { level: 2, effect: "Cria 1d4 poções. Cura (3d8+INT), Força (+1d8), Velocidade (+2 Mov e +1 Ação, 3 rodadas). Custo: 2 MP ou 2 Foco ou materiais." },
          { level: 3, effect: "Cria 1d6 poções. Adiciona: Invisibilidade (2 rodadas), Regeneração (1d6 HP/rodada, 4 rodadas), Resistência (−4 de todo dano, 3 rodadas). Custo: 2 MP ou 2 Foco ou materiais." }
        ],
        example: "Frascos, fumaça e o cheiro de algo que pode curar ou matar, dependendo da dose."
      },
      {
        id: "sub-alq-pergaminho", name: "Inscrição de Pergaminhos",
        cost: "2 pontos", tier: 1, commonToAll: true,
        levels: [
          { level: 1, effect: "Fora de combate (1 hora) ou com 3 Ações: cria pergaminho de 1 magia nível 1-2 conhecida. Qualquer personagem pode usar gastando 1 Ação (sem precisar de INT ou MP). Custo: 3 MP ou 3 Foco. Dura até o fim da aventura." },
          { level: 2, effect: "Pergaminhos nível 1-3. Custo: 3 MP ou 3 Foco. Pode criar 2 pergaminhos por sessão de criação." },
          { level: 3, effect: "Pergaminhos nível 1-4. Custo: 3 MP ou 3 Foco. Quem usa o pergaminho pode usar como Ação Livre se o resultado rolar 1 no d10." }
        ],
        example: "Ele dobrou o papel com cuidado. 'Se as coisas ficarem ruins, rasgue isso.'"
      },
      {
        id: "sub-alq-bomba", name: "Bomba Alquímica",
        cost: "3 pontos", tier: 2, commonToAll: false,
        sinergyClasses: ["mago", "arqueiro"],
        levels: [
          { level: 1, effect: "Prepara 3 bombas por descanso. Arremessar: 1 Ação de Combate (alcance 8 hex, área 2x2 hex). Tipos à escolha: Fogo (2d6 + queima 1d4/r), Ácido (2d4 + −1 Def.Física por 2 rodadas), Concussão (1d8 + Derrubado AGI normal). Custa 2 MP ou 2 Foco por bomba ao criar." },
          { level: 2, effect: "4 bombas. Área 3x3. Fogo (3d6 + 1d6/r), Ácido (2d6 + −2 Def), Concussão (2d8 + Derrubado), Fumaça (cega 3 rodadas AGI normal). Custo: 2 MP ou 2 Foco." },
          { level: 3, effect: "5 bombas. Área 4x4. Dano aumentado em +1 dado. Pode detonar remotamente como Ação Livre. Bomba Maestral (1/sessão): escolhe 2 efeitos combinados na mesma explosão. Custo: 2 MP ou 2 Foco." }
        ],
        example: "O frasco vermelho descreveu um arco perfeito. Depois, o chão estava em chamas."
      },
      {
        id: "sub-alq-transmuta", name: "Transmutação Rápida",
        cost: "3 pontos", tier: 2, commonToAll: false,
        sinergyClasses: ["mago", "arqueiro"],
        levels: [
          { level: 1, effect: "Ação de Magia (custa 3 MP ou 3 Foco): transmuta objeto não-mágico simples (porta vira fumaça, pedra vira água). Em combate: arma inimiga testa AGI (difícil) ou vira objeto inútil por 2 rodadas. 2 usos por combate." },
          { level: 2, effect: "AGI (normal) para resistir. Pode transmutar objetos maiores (carroça, muro de pedra pequeno). Em combate: pode transmutar o chão (3x3 hex) em lama (custo extra de Mov). Custo: 3 MP ou 3 Foco." },
          { level: 3, effect: "Pode transmutar criaturas de tamanho Pequeno (AGI crítico para resistir). Transmutação de arma dura 4 rodadas. Pode transmutar própria arma: +1d8 de dano elemental à escolha por 3 rodadas. Custo: 3 MP ou 3 Foco." }
        ],
        example: "A espada do Mercenário virou peixe. Ele passou o resto do combate olhando para ela, confuso."
      }
    ]
  },

  /* ── 5. DRUIDA — Arqueiro + Clérigo ──────────────────────────── */
  "druida": {
    name: "Druida",
    icon: "🌿",
    description: "A natureza fala pelo Druida. Invoca animais, molda o terreno e cura com a força das raízes e da terra.",
    sinergyClasses: ["arqueiro", "clerigo"],
    passiveBonus: "Ao escolher: em terreno natural (floresta, campo, montanha), todos os testes de Percepção e Sobrevivência têm +1d4 automático. Animais não são hostis por padrão.",
    sinergyNote: "Arqueiro e Clérigo: animais invocados têm +50% HP. Pode invocar 1 animal como Ação Livre 1x por combate (em vez de Ação de Combate).",
    skills: [
      {
        id: "sub-druid-invocar", name: "Invocar Animal",
        cost: "2 pontos", tier: 1, commonToAll: true,
        levels: [
          { level: 1, effect: "Ação de Combate (custa 2 Foco ou 2 Fé): invoca 1 animal aliado. Escolhe: Lobo (HP 25, dano 1d8, Mov 6), Águia (HP 18, voo, 1d6, alcance 4 hex), Cobra (1d4+veneno 1d4/r), Urso (HP 35, dano 1d10, Def 3). Age no seu turno. Dura o combate." },
          { level: 2, effect: "Invoca 2 animais diferentes. HP +30%. Custa 2 Foco ou 2 Fé. Adiciona: Pantera (HP 30, 1d8, invisível em sombras)." },
          { level: 3, effect: "Invoca 3 animais. HP +50%. Adiciona: Crocodilo (HP 45, 1d10, agarra). Ao animal morrer: libera pulso natural (1d6 em raio 2 hex, inimigos). Custa 2 Foco ou 2 Fé." }
        ],
        example: "O Lobo emergiu da floresta como se sempre estivesse esperando o chamado."
      },
      {
        id: "sub-druid-terreno", name: "Moldar Terreno",
        cost: "2 pontos", tier: 1, commonToAll: true,
        levels: [
          { level: 1, effect: "Ação de Combate (custa 2 Foco ou 2 Fé): altera terreno em área 3x3 hex. Tipos: Raízes (Preso AGI normal), Bruma (−2 em ataques à distância na área), Pedras Elevadas (+1 vantagem de altitude para aliados). Dura 4 rodadas. 2 usos por combate." },
          { level: 2, effect: "Área 4x4. Dura 5 rodadas. Adiciona: Pântano (Mov −2), Parede de Espinhos (1d4 ao cruzar). 3 usos. Custa 2 Foco ou 2 Fé." },
          { level: 3, effect: "Área 5x5. Dura todo o combate. Pode combinar 2 efeitos na mesma área. Desfazer efeito de terreno inimigo como Ação Livre. Custa 2 Foco ou 2 Fé." }
        ],
        example: "As raízes do chão cresceram rápido demais para o Cavaleiro reagir."
      },
      {
        id: "sub-druid-forma", name: "Forma Selvagem",
        cost: "3 pontos", tier: 2, commonToAll: false,
        sinergyClasses: ["arqueiro", "clerigo"],
        levels: [
          { level: 1, effect: "Ação de Combate (custa 3 Foco ou 3 Fé): transforma-se em animal por 4 rodadas. Formas: Urso (HP +20, dano 1d10+1d6, Def 4), Lobo (velocidade +3, dano 1d8, flanqueio automático), Águia (voa, dano 1d6, invisível em altitude). Equipamentos ficam guardados. 1 uso por combate." },
          { level: 2, effect: "HP +30. 5 rodadas. Adiciona: Pantera das Sombras (invisível em sombras, 1d10, crítico automático no 1º ataque invisível). Custo: 3 Foco ou 3 Fé." },
          { level: 3, effect: "HP +40. 6 rodadas. Adiciona: Crocodilo (HP +50, dano 2d8, agarra automaticamente). Ao retornar à forma humana: cura 1d8 HP. Custo: 3 Foco ou 3 Fé." }
        ],
        example: "Onde estava o Druida, um Urso bufou — com os mesmos olhos inteligentes."
      },
      {
        id: "sub-druid-cura", name: "Cura da Natureza",
        cost: "3 pontos", tier: 2, commonToAll: false,
        sinergyClasses: ["arqueiro", "clerigo"],
        levels: [
          { level: 1, effect: "Ação de Combate (custa 3 Foco ou 3 Fé): cura 2d8+SAB HP em aliado tocado ou a 4 hex. Remove 1 condição à escolha (veneno, sangramento, paralisação). Efeito dobrado em terreno natural. 3 usos por combate." },
          { level: 2, effect: "3d8+SAB HP. Remove 2 condições. Em terreno natural: cura em raio 3 hex (todos os aliados). Custo: 3 Foco ou 3 Fé." },
          { level: 3, effect: "4d8+SAB HP. Remove todas as condições comuns. Em terreno natural: cura adicional de 1d8 por rodada por 3 rodadas (regeneração). Custo: 3 Foco ou 3 Fé." }
        ],
        example: "As folhas que caíram sobre o ferimento viraram luz. O ferimento sumiu com elas."
      }
    ]
  },

  /* ── 6. BERSERKER — Guerreiro + Ladino ────────────────────────── */
  "berserker": {
    name: "Berserker",
    icon: "🔥",
    description: "A raiva é a única estratégia. O Berserker entra em fúria, ignora a dor e devora inimigos até o último cair.",
    sinergyClasses: ["guerreiro", "ladino"],
    passiveBonus: "Ao escolher: Fúria de Batalha disponível desde o nível 1 mesmo sem pontos investidos nela (versão básica: +1d6 dano, 3 rodadas, −1 Def). Quando abaixo de 30% HP, ganha +1d4 em todos os ataques automaticamente.",
    sinergyNote: "Guerreiro e Ladino: habilidades de Fúria causam +1d6 de dano extra. Cargas de Veneno usadas durante Fúria causam +1d4 de dano adicional ao veneno.",
    skills: [
      {
        id: "sub-berserk-furia", name: "Fúria de Batalha",
        cost: "2 pontos", tier: 1, commonToAll: true,
        levels: [
          { level: 1, effect: "Ação Livre (custa toda a Fúria disponível, mín. 1): entra em Fúria por 4 rodadas. +1d8 dano em todos os ataques. +1 Ação de Combate por rodada. Perde 3 HP por rodada. Ao sair: Exausto 1 rodada (−1 Ação)." },
          { level: 2, effect: "+1d10 dano. +1 Ação. Perde 2 HP/rodada. Ao sair: recupera 1d6 HP em vez de Exausto." },
          { level: 3, effect: "+1d12 dano. +2 Ações durante a Fúria. Sem perda de HP. Ao sair: ganha 3d6 HP de adrenalina. Dura 5 rodadas." }
        ],
        example: "O grito não foi de raiva. Foi de alívio — como se a Fúria fosse a única coisa que fazia sentido."
      },
      {
        id: "sub-berserk-sangue", name: "Sede de Sangue",
        cost: "2 pontos", tier: 1, commonToAll: true,
        levels: [
          { level: 1, effect: "Passivo: ao derrotar um inimigo (0 HP), recupera 1d8 HP e o próximo ataque tem +1d6 de dano. Esse bônus não acumula — o próximo ataque o consome. Funciona mesmo fora da Fúria." },
          { level: 2, effect: "Recupera 1d10 HP. +1d8 no próximo ataque. Bônus pode ser guardado por 2 rodadas antes de expirar." },
          { level: 3, effect: "Recupera 2d8 HP. +1d10 no próximo ataque. Derrotar inimigo também dá +1 Fúria. Bônus dura 3 rodadas." }
        ],
        example: "Cada queda inimiga era combustível. Quanto mais caíam, mais ele queria que caíssem."
      },
      {
        id: "sub-berserk-escudo-carne", name: "Escudo de Carne",
        cost: "3 pontos", tier: 2, commonToAll: false,
        sinergyClasses: ["guerreiro", "ladino"],
        levels: [
          { level: 1, effect: "Reação (custa 1 Fúria ou 2 Cargas de Veneno): ao aliado adjacente receber ataque, interpõe o próprio corpo. Absorve até 10 HP do dano no lugar do aliado. O HP absorvido vai para você — mas o próximo ataque seu causa +1d6 extra (raiva pelo golpe). 2 usos por combate." },
          { level: 2, effect: "Absorve até 16 HP. +1d8 no próximo ataque. 3 usos. Custa 1 Fúria ou 2 Cargas." },
          { level: 3, effect: "Absorve até 22 HP. +1d10 no próximo ataque. Após absorver: ganha 1 Fúria de volta. Ilimitado." }
        ],
        example: "Ele deu um passo à frente. O machado o atingiu em vez do Clérigo. Ele sorriu. Errado alvo."
      },
      {
        id: "sub-berserk-limiar", name: "No Limiar da Morte",
        cost: "3 pontos", tier: 2, commonToAll: false,
        sinergyClasses: ["guerreiro", "ladino"],
        levels: [
          { level: 1, effect: "Passivo: quando HP cai abaixo de 30%, ativa automaticamente (sem custo). Por 3 rodadas: +2d6 de dano em todos os ataques, imune a condição Inconsciente, +2 Movimento. Efeito se encerra ao sair dos 30% ou ao fim das 3 rodadas." },
          { level: 2, effect: "+2d8 de dano. Imune a Inconsciente e Paralisado. +3 Movimento. 4 rodadas." },
          { level: 3, effect: "+2d10 de dano. Imune a Inconsciente, Paralisado e Medo. +4 Movimento. Ao sair do Limiar com HP > 30% (por cura): o grupo inteiro ganha +1d6 nos ataques por 2 rodadas. 5 rodadas." }
        ],
        example: "São os inimigos que começam a ter medo."
      }
    ]
  },

  /* ── 7. RUNA-LÂMINA — Guerreiro + Mago ───────────────────────── */
  "runa-lamina": {
    name: "Runa-Lâmina",
    icon: "🌩",
    description: "Inscreveu magia arcana diretamente no corpo e nas armas. Cada golpe carrega fragmentos de magia que explodem no contato — brutalidade física com potência arcana.",
    sinergyClasses: ["guerreiro", "mago"],
    passiveBonus: "Ao escolher: pode gravar 1 Runa gratuita por combate sem gastar recurso. Ataques físicos causam +1d4 de dano arcano passivo enquanto tiver pelo menos 1 MP ou 1 Fúria disponível.",
    sinergyNote: "Guerreiro e Mago: ao usar Fúria, ganha 2 MP temporários (duram o combate). Runas detonadas durante a Fúria causam +1d6 de dano adicional.",
    skills: [
      {
        id: "sub-runa-gravar", name: "Gravar Runa",
        cost: "2 pontos", tier: 1, commonToAll: true,
        levels: [
          { level: 1, effect: "Ação de Combate (custa 1 MP ou 1 Fúria): grava Runa em arma ou corpo. Na próxima vez que acertar um ataque, a Runa detona causando +1d8 de dano arcano no alvo (automático, sem rolar acerto extra). 3 Runas por combate (incluindo a gratuita do passivo)." },
          { level: 2, effect: "+1d10 ao detonar. Pode gravar em aliado (mesmo bônus no próximo ataque dele). 4 Runas por combate. Custa 1 MP ou 1 Fúria." },
          { level: 3, effect: "+1d12 ao detonar. Runa de Relâmpago: ao detonar, salta para 1 inimigo adjacente causando 1d8. Pode ter 2 Runas ativas ao mesmo tempo. Custa 1 MP ou 1 Fúria." }
        ],
        example: "A runa brilha laranja no punho da espada. Ao bater no escudo do Troll, explode com som de trovão."
      },
      {
        id: "sub-runa-escudo", name: "Escudo Arcano Rúnico",
        cost: "2 pontos", tier: 1, commonToAll: true,
        levels: [
          { level: 1, effect: "Ação de Combate (custa 2 MP ou 2 Fúria): cria escudo de runas que absorve até 10 de dano antes de quebrar. Dura até ser destruído ou fim do combate. Quando quebra: pulso arcano 1d6 em raio 2 hex (inimigos). 2 usos por combate." },
          { level: 2, effect: "Absorve 16 de dano. Pulso 1d8. 3 usos. Custa 2 MP ou 2 Fúria." },
          { level: 3, effect: "Absorve 22 de dano. Pulso 1d10 + Derrubado (AGI normal). Pode ser ativado como Reação ao receber dano. Custa 2 MP ou 2 Fúria." }
        ],
        example: "As runas no antebraço brilham azul enquanto o golpe do Ogro é absorvido — e então explode de volta."
      },
      {
        id: "sub-runa-furia-arcana", name: "Fúria Arcana",
        cost: "3 pontos", tier: 2, commonToAll: false,
        sinergyClasses: ["guerreiro", "mago"],
        levels: [
          { level: 1, effect: "Gatilho automático ao entrar em Fúria (custa 0 extra): todas as Runas gravadas detonam simultaneamente em todos os inimigos em raio 2 hex (1d8 cada). Mesmo inimigos sem Runa sofrem 1d6 de respingo arcano." },
          { level: 2, effect: "Detonação: 1d10 cada Runa. Respingo 1d8. Raio 3 hex. Inimigos atingidos: −1 Def.Mágica por 2 rodadas." },
          { level: 3, effect: "Detonação: 1d12. Respingo 1d10. Raio 4 hex. +1d8 extra de dano arcano em todos os ataques pela duração da Fúria. Reabastecer Runas custa 0 MP durante a Fúria Arcana." }
        ],
        example: "Quando a raiva veio, as runas em seus braços explodiram em azul — e tudo ao redor queimou."
      },
      {
        id: "sub-runa-transcendencia", name: "Transcendência Rúnica",
        cost: "3 pontos", tier: 2, commonToAll: false,
        sinergyClasses: ["guerreiro", "mago"],
        levels: [
          { level: 1, effect: "Ação de Combate + 1 Ação de Magia (custa 3 MP + 2 Fúria): Forma Rúnica por 3 rodadas. Ataques físicos causam +1d8 arcano. Magias custam 0 Ações de Magia (apenas Slot). +2 Def.Mágica. 1 uso por combate." },
          { level: 2, effect: "+1d10 arcano. 4 rodadas. Magias nível 1-3 não consomem Slot durante a Forma. Custo: 3 MP + 2 Fúria." },
          { level: 3, effect: "+1d12 arcano. 5 rodadas. Nenhuma magia consome Slot. Ao sair: explosão 3d8 em raio 3 hex. Custo: 3 MP + 2 Fúria. 1 uso por combate." }
        ],
        example: "Por um momento, ele não era guerreiro nem mago. Era ambos."
      }
    ]
  },

  /* ── 8. CAÇADOR DE GIGANTES — Guerreiro + Arqueiro ───────────── */
  "cacador-gigantes": {
    name: "Caçador de Gigantes",
    icon: "🏔",
    description: "Especialista em abater criaturas de grande porte. Combina resistência física de guerreiro com precisão de arqueiro para identificar e explorar pontos fracos em inimigos poderosos.",
    sinergyClasses: ["guerreiro", "arqueiro"],
    passiveBonus: "Ao escolher: contra inimigos de tamanho Grande ou maior, todos os ataques causam +1d6 de dano extra (passivo permanente). Imune a condição Derrubado causada por criaturas de tamanho Grande ou maior.",
    sinergyNote: "Guerreiro e Arqueiro: bônus de dano da Marca Presa é +1 dado adicional do mesmo tipo. Marcar Presa pode ser declarado como Ação Livre 1x por combate.",
    skills: [
      {
        id: "sub-cacador-marcar", name: "Marcar Presa",
        cost: "2 pontos", tier: 1, commonToAll: true,
        levels: [
          { level: 1, effect: "Ação Livre (custa 1 Fúria ou 1 Foco): marca inimigo visível como Presa. Todos os ataques do grupo contra a Presa têm +1d4 de dano. Persiste até a Presa ser derrotada ou fim do combate. 2 Presas por combate." },
          { level: 2, effect: "+1d6 de dano grupo. Aliados também ganham +1d4 à distância. 3 Presas. Custa 1 Fúria ou 1 Foco." },
          { level: 3, effect: "+1d8 de dano grupo. Ao derrotar a Presa: Marca nova Presa gratuitamente. Ilimitado. Custa 1 Fúria ou 1 Foco." }
        ],
        example: "Ele estudou o Dragão por dois segundos. 'Escama solta no pescoço. Todo mundo naquele ponto.'"
      },
      {
        id: "sub-cacador-anatomia", name: "Anatomia de Besta",
        cost: "2 pontos", tier: 1, commonToAll: true,
        levels: [
          { level: 1, effect: "Ação Livre (sem custo de recurso): testa INT (normal). Sucesso: revela Def.Física, HP atual e 1 habilidade especial do alvo. Automático contra criaturas já vistas antes. 2 usos por combate." },
          { level: 2, effect: "Revela tudo: Def.Física + Mágica + todas as habilidades + fraqueza elemental. Automático em Bestas e Dracônicos. 3 usos." },
          { level: 3, effect: "Gratuito, ilimitado. Revela ponto crítico: próximo ataque do revelador tem +1d10 de dano ao mirar o ponto." }
        ],
        example: "'Fogo ou ácido. Garganta não tem regeneração. Vão pela garganta.'"
      },
      {
        id: "sub-cacador-golpe-derrubar", name: "Golpe de Abatimento",
        cost: "3 pontos", tier: 2, commonToAll: false,
        sinergyClasses: ["guerreiro", "arqueiro"],
        levels: [
          { level: 1, effect: "Ação de Combate (custa 2 Fúria ou 2 Foco): ataque especial com −1 na chance de acerto que força alvo a testar FOR (normal) ou fica Derrubado por 1 rodada. +1d8 de dano se acertar. Funciona em alvos de qualquer tamanho." },
          { level: 2, effect: "+1d10 de dano. Alvos grandes: FOR (difícil). Aliados em 2 hex do alvo derrubado: +1 no acerto. Custa 2 Fúria ou 2 Foco." },
          { level: 3, effect: "+1d12. Derrubado 2 rodadas e −2 Def.Física caído. Inimigos colossos (antes imunes) testam FOR (normal). Custa 2 Fúria ou 2 Foco." }
        ],
        example: "Não é força que derruba um Mamute. É saber onde a força falha."
      },
      {
        id: "sub-cacador-executar", name: "Executar a Presa",
        cost: "3 pontos", tier: 2, commonToAll: false,
        sinergyClasses: ["guerreiro", "arqueiro"],
        levels: [
          { level: 1, effect: "Ação de Combate (custa 3 Fúria ou 3 Foco): ataque contra Presa Marcada com dano triplicado se abaixo de 25% HP. Não pode ser defendido — apenas esquivado. 1 uso por combate." },
          { level: 2, effect: "Funciona abaixo de 35% HP. Se Presa estiver Derrubada: não pode esquivar. 2 usos. Custa 3 Fúria ou 3 Foco." },
          { level: 3, effect: "Funciona abaixo de 50% HP. Dano ×4. Se matar: recupera 2d8 HP e Marcações de Presa usadas retornam. 1 uso por combate. Custa 3 Fúria ou 3 Foco." }
        ],
        example: "Caçadores de gigantes não esperam batalha justa. Esperam o momento certo."
      }
    ]
  },

  /* ── 9. SUSSURRO SOMBRIO — Ladino + Clérigo ──────────────────── */
  "sussurro-sombrio": {
    name: "Sussurro Sombrio",
    icon: "🌙",
    description: "Onde outros veem contradição entre fé e sombra, o Sussurro Sombrio encontrou um deus que habita nos dois. Usa bênçãos corrompidas, venenos sagrados e maldições divinas.",
    sinergyClasses: ["ladino", "clerigo"],
    passiveBonus: "Ao escolher: +1 Carga de Veneno máxima permanente. Venenos aplicados pelo personagem duram +1 rodada extra automaticamente. Antídotos comuns não funcionam em seus venenos.",
    sinergyNote: "Ladino e Clérigo: Veneno Sagrado dura +1 rodada extra. Testes de resistência contra efeitos do Sussurro Sombrio têm dificuldade aumentada em 1 grau.",
    skills: [
      {
        id: "sub-sombrio-veneno-sagrado", name: "Veneno Sagrado",
        cost: "2 pontos", tier: 1, commonToAll: true,
        levels: [
          { level: 1, effect: "Ação de Combate (custa 1 Carga de Veneno + 1 Fé): aplica veneno bênto em arma. 1d6 de dano/rodada por 2 rodadas. Diferente de venenos comuns: apenas bênção divina ou Purificação remove — antídoto normal falha. 2 usos por combate." },
          { level: 2, effect: "1d8/rodada, 3 rodadas. Drena 1d4 SAB temporariamente por rodada. Custa 1 Carga + 1 Fé. 3 usos." },
          { level: 3, effect: "1d10/rodada, 4 rodadas. SAB drenada −1d4. Se SAB chegar a 0: Dominado 1 rodada. Custa 1 Carga + 1 Fé. Ilimitado com descanso." }
        ],
        example: "Queima diferente. Como se uma divindade decidiu que aquela pessoa não merecia mais viver."
      },
      {
        id: "sub-sombrio-sussurro", name: "Sussurro da Dúvida",
        cost: "2 pontos", tier: 1, commonToAll: true,
        levels: [
          { level: 1, effect: "Ação de Combate (custa 1 Carga de Veneno ou 1 Fé): alvo visível em 6 hex testa SAB (normal) ou fica com −1d4 em todos os ataques por 2 rodadas. Não funciona em Construtos ou mortos-vivos. 2 usos por combate." },
          { level: 2, effect: "SAB (difícil) para resistir. −1d6 nos ataques. Defesa do alvo também −1 por 2 rodadas. Custa 1 Carga ou 1 Fé." },
          { level: 3, effect: "SAB (crítico) para resistir. −1d8. Pode ser usado como Ação Livre 1x por combate. Custa 1 Carga ou 1 Fé." }
        ],
        example: "Não é magia de mente. É a sensação de não ter certeza se você quer mesmo fazer aquilo."
      },
      {
        id: "sub-sombrio-bencao-negra", name: "Bênção Negra",
        cost: "3 pontos", tier: 2, commonToAll: false,
        sinergyClasses: ["ladino", "clerigo"],
        levels: [
          { level: 1, effect: "Ação de Combate (custa 2 Cargas de Veneno + 1 Fé): bênção corrompida num aliado por 3 rodadas. O aliado: +1d6 de dano em todos os ataques E perde 1 HP por rodada (o poder tem custo). O aliado decide se aceita. 2 usos." },
          { level: 2, effect: "+1d8 de dano. Perde 1 HP/rodada. Ladinos: o auto-dano gera +1 Carga de Veneno por rodada. Custa 2 Cargas + 1 Fé." },
          { level: 3, effect: "+1d10. Auto-dano reduzido a 1 HP fixo (simbólico). Afeta 2 aliados simultâneos. Clérigos: Fervor Sagrado e Bênção Negra se combinam no mesmo aliado. Custa 2 Cargas + 1 Fé." }
        ],
        example: "Ele tocou o ombro do guerreiro. 'Vai doer um pouco. Mas vai valer.'"
      },
      {
        id: "sub-sombrio-execracao", name: "Execração Divina",
        cost: "3 pontos", tier: 2, commonToAll: false,
        sinergyClasses: ["ladino", "clerigo"],
        levels: [
          { level: 1, effect: "Ação de Combate (custa 3 Cargas de Veneno ou 3 Fé): maldição sagrada em alvo a 8 hex. Por 4 rodadas: −1d6 em todos os testes e Def.Física −2. SAB (difícil) para resistir. 1 uso por combate." },
          { level: 2, effect: "−1d8 nos testes, Def −3. Se alvo morrer sob Execração: grupo ganha +1d10 no próximo ataque. Custa 3 Cargas ou 3 Fé." },
          { level: 3, effect: "−1d10 nos testes, Def −4. 20% de chance/rodada de atacar o aliado mais próximo. Custa 3 Cargas ou 3 Fé. 1 uso por sessão." }
        ],
        example: "Ela não gritou nenhuma maldição. Apenas murmurou o nome de seu deus. Foi suficiente."
      }
    ]
  },

  /* ── 10. CAÇADOR SOMBRIO — Ladino + Arqueiro ─────────────────── */
  "cacador-sombrio": {
    name: "Caçador Sombrio",
    icon: "🕸",
    description: "Mestre em rastreamento, armadilhas e eliminação silenciosa. Combina a precisão do Arqueiro com os truques do Ladino para criar emboscadas perfeitas.",
    sinergyClasses: ["ladino", "arqueiro"],
    passiveBonus: "Ao escolher: o primeiro ataque de cada combate tem +1d8 de dano e não pode ser defendido — apenas esquivado. Furtividade fora de combate tem +1d4 automático.",
    sinergyNote: "Ladino e Arqueiro: ataques em Furtividade causam +1 dado de dano extra do mesmo tipo. Cargas de Veneno se reabastecem +1 extra por descanso curto.",
    skills: [
      {
        id: "sub-sombrio-emboscada", name: "Emboscada Perfeita",
        cost: "2 pontos", tier: 1, commonToAll: true,
        levels: [
          { level: 1, effect: "Passivo + Ativo. Passivo: se agir antes do inimigo em posição oculta, 1º ataque é automático (sem rolagem) e causa +1d8 de dano. Ativo (custa 1 Carga de Veneno ou 1 Foco): grupo ganha +1d4 na Iniciativa se houver 1 rodada de preparação. 2 usos do Ativo por combate." },
          { level: 2, effect: "+1d10 automático. +1d6 Iniciativa para o grupo. Ativo custa 1 Carga ou 1 Foco." },
          { level: 3, effect: "+1d12. +1d8 Iniciativa grupo. Todos os aliados têm +1 no acerto na 1ª rodada de combate." }
        ],
        example: "Antes do inimigo saber que havia alguém, o inimigo já estava caindo."
      },
      {
        id: "sub-sombrio-armadilha", name: "Armadilha de Caçador",
        cost: "2 pontos", tier: 1, commonToAll: true,
        levels: [
          { level: 1, effect: "1 Ação de Combate (custa 1 Carga de Veneno ou 1 Foco): instala armadilha em hex visível. Qualquer inimigo que entrar: Preso (FOR normal para escapar, Ação) + 1d8 de dano. 2 armadilhas por combate." },
          { level: 2, effect: "1d10 de dano + Sangramento (1d4/rodada). Instalar como Ação Livre 1x/combate. 3 armadilhas. Custa 1 Carga ou 1 Foco." },
          { level: 3, effect: "1d12 + Sangramento + Envenenado (1d6/rodada). Detonação manual com 1 Ação à distância. Ilimitado com descanso. Custa 1 Carga ou 1 Foco." }
        ],
        example: "O Goblin olhou para o chão. Tarde demais."
      },
      {
        id: "sub-sombrio-tiro-mortal", name: "Tiro Mortal",
        cost: "3 pontos", tier: 2, commonToAll: false,
        sinergyClasses: ["ladino", "arqueiro"],
        levels: [
          { level: 1, effect: "2 Ações de Combate no mesmo turno (custa 2 Cargas de Veneno + 1 Foco): ataque que ignora Def.Física completamente + 2d6 de dano extra. Não funciona em Construtos. 2 usos por combate." },
          { level: 2, effect: "+2d8 extra. Pode ser feito com 1 Ação se o alvo estiver Preso ou Derrubado. Custa 2 Cargas + 1 Foco." },
          { level: 3, effect: "+2d10 extra. Ignora 50% Def.Mágica também. Se alvo estiver Preso: automático (sem rolagem de acerto). Custa 2 Cargas + 1 Foco." }
        ],
        example: "Dois segundos de silêncio. Um projétil. O chefe dos bandidos não chegou a saber que havia um atirador."
      },
      {
        id: "sub-sombrio-fantasma", name: "Movimento de Fantasma",
        cost: "3 pontos", tier: 2, commonToAll: false,
        sinergyClasses: ["ladino", "arqueiro"],
        levels: [
          { level: 1, effect: "1 Ação de Combate (custa 2 Cargas de Veneno ou 2 Foco): move até 4 hex sem ataques de oportunidade E fica invisível até início do próximo turno (ou até atacar). Ataques invisível: +1d8 de dano. 2 usos por combate." },
          { level: 2, effect: "6 hex. Invisibilidade não quebra ao atacar alvo Preso ou Derrubado. +1d10. 3 usos. Custa 2 Cargas ou 2 Foco." },
          { level: 3, effect: "8 hex. Passa através de inimigos sem reação. Após atacar invisível: AGI (normal) para manter invisibilidade 1 rodada extra. Custa 2 Cargas ou 2 Foco." }
        ],
        example: "Estava aqui. Depois não estava. Depois o guarda estava no chão."
      }
    ]
  }

,

  /* ═══════════════════════════════════════════════════════════════
     SUBCLASSES PURAS — Exclusivas de cada classe base.
     Aparecem SOMENTE para quem escolheu aquela classe.
     Têm 2 habilidades exclusivas de custo 2 pontos cada —
     habilidades poderosas e definidoras de estilo de combate.
     ═══════════════════════════════════════════════════════════════ */

  "guerreiro-puro": {
    name: "Guerreiro Puro",
    icon: "🗡",
    description: "O Guerreiro em sua forma mais completa — sem magia, sem veneno, sem truques. Apenas aço, força e a capacidade de absorver ou infligir punição além do limite humano. Duas especializações definem seu estilo: ser o muro intransponível ou o martelo que tudo destrói.",
    sinergyClasses: ["guerreiro"],
    passiveBonus: "+2 de FOR permanentes. +1 Ação de Combate no nível 3 e mais +1 no nível 6 (além do progressão normal). O Guerreiro Puro não usa Ações de Magia — qualquer bônus de Ação de Magia se converte em +1 Ação de Combate.",
    sinergyNote: "Exclusivo do Guerreiro. Nenhuma outra classe acessa estas habilidades.",
    skills: [
      {
        id: "sub-guerreiro-puro-fortaleza",
        name: "Fortaleza Inabalável",
        cost: "2 pontos",
        tier: 1,
        exclusive: true,
        levels: [
          { level: 1, effect: "Passivo: +2 Def.Física permanente. Ativo (gasta 3 Fúria, 1 Ação): ativa Postura de Fortaleza por 4 rodadas — fica imóvel (não pode mover) mas ganha Def.Física adicional igual ao próprio FOR, imunidade a Derrubado, e qualquer ataque que causar menos de 5 de dano após a defesa é completamente absorvido (resultado 0). Pode sair da postura gastando 1 Fúria." },
          { level: 2, effect: "+3 Def.Física permanente. Fortaleza: Def.Física +FOR, imune Derrubado e Empurrado, ataques abaixo de 8 de dano = 0. Pode atacar 1x por turno enquanto na postura (o corpo responde mesmo parado)." },
          { level: 3, effect: "+4 Def.Física permanente. Fortaleza: Def.Física +FOR+2, imune a condições físicas de controle, ataques abaixo de 12 = 0. Ao sair da postura voluntariamente: ataque imediato gratuito com +1d12 de dano extra (a energia represada explode no primeiro movimento)." }
        ],
        example: "Ele parou de recuar. O Elemental bateu nele quatro vezes. Nenhum dos quatro chegou a nada."
      },
      {
        id: "sub-guerreiro-puro-devastador",
        name: "Golpe Devastador",
        cost: "2 pontos",
        tier: 1,
        exclusive: true,
        levels: [
          { level: 1, effect: "Ativo (gasta 4 Fúria, 1 Ação): concentra toda a força num único golpe. O ataque causa dano TRIPLICADO (×3) se acertar. Se errar: perde 2 Fúria extra (desequilíbrio do esforço). 1x por combate. Não pode ser usado em conjunto com Fúria ativa." },
          { level: 2, effect: "Dano ×3. Em vez de 1x, pode ser usado até 2x por combate. Se for Crítico: dano ×4 (o crítico da concentração total). Se errar: perde apenas 1 Fúria extra." },
          { level: 3, effect: "Dano ×3 (×5 se Crítico). Sem limite de usos por combate — mas cada uso consecutivo custa +1 Fúria a mais. O Golpe Devastador escolhe automaticamente o ponto mais fraco do alvo: ignora metade da Def.Física (arredonda para cima)." }
        ],
        example: "O Colosso de Pedra tinha 12 de Defesa Física. Não importou."
      }
    ]
  },

  "mago-puro": {
    name: "Mago Puro",
    icon: "🔮",
    description: "O Mago que não dividiu sua mente com outro ofício. Cada Slot é uma câmara carregada. Cada magia é calculada para o máximo efeito. Duas rotas: canalizar toda a energia num único ponto de intensidade letal, ou expandir o domínio até cobrir o campo inteiro.",
    sinergyClasses: ["mago"],
    passiveBonus: "+2 de INT permanentes. +2 Slots de Magia adicionais. Regenera 1 MP por turno passivamente (o corpo do Mago Puro aprendeu a recuperar enquanto age).",
    sinergyNote: "Exclusivo do Mago. Nenhuma outra classe acessa estas habilidades.",
    skills: [
      {
        id: "sub-mago-puro-amplificacao",
        name: "Amplificação Canalizada",
        cost: "2 pontos",
        tier: 1,
        exclusive: true,
        levels: [
          { level: 1, effect: "Ativo (custa 4 MP + 1 Slot, 1 Ação de Magia extra): a próxima magia lançada neste turno tem seu dano DOBRADO (×2) e seu alcance aumentado em 3 hex. O alvo não pode usar Defesa Mágica completa — apenas metade funciona (o volume de energia supera a resistência). 1x por combate." },
          { level: 2, effect: "Dano ×2.5 (arredonda para cima por dado). Alcance +4 hex. Def.Mágica do alvo = 0 (a canalização supera qualquer resistência). A magia amplificada não pode ser interrompida neste turno. 1x por combate." },
          { level: 3, effect: "Dano ×3. Alcance +5 hex. Def.Mágica = 0. A magia amplificada atinge todos os alvos em raio 2 hex ao redor do ponto de impacto (sem custo extra de Slots) — a energia transborda. 1x por combate. Após usar: o Mago não pode lançar magias de dano na rodada seguinte (esgotamento canalizado)." }
        ],
        example: "Um Slot. Quatro MP. O Dragão jovem recebeu o equivalente a uma hora de bombardeio arcano em um instante."
      },
      {
        id: "sub-mago-puro-dominio",
        name: "Domínio de Área",
        cost: "2 pontos",
        tier: 1,
        exclusive: true,
        levels: [
          { level: 1, effect: "Passivo: toda magia de área do Mago tem o raio/alcance +2 hex automaticamente. Ativo (custa 3 MP, Ação Livre): por 3 rodadas, qualquer magia de área causa também metade do dano em todos os hexes adjacentes à área original (anel de transbordamento). 2x por combate." },
          { level: 2, effect: "Passivo: +3 hex em área. Ativo: 4 rodadas. O transbordamento causa 75% do dano (em vez de metade). O Mago pode escolher excluir aliados do dano de transbordamento (controle fino de energia). 2x por combate." },
          { level: 3, effect: "Passivo: +4 hex em área. Ativo: 5 rodadas. Transbordamento = dano total (as duas camadas de área causam o mesmo dano). Enquanto o Domínio está ativo: custo de Slots para magias de área é −1 (mínimo 1). Aliados excluídos automaticamente. 2x por combate." }
        ],
        example: "Ele errou o centro do grupo por dois hexes. Não fez diferença nenhuma."
      }
    ]
  },

  "arqueiro-puro": {
    name: "Arqueiro Puro",
    icon: "🏹",
    description: "O Arqueiro que não se desviou para a floresta nem para o clã. Apenas o arco, a flecha, a distância e o olho. Dois caminhos: o controle total do campo com múltiplos alvos simultâneos, ou o tiro que não pode ser esquivado nem defendido.",
    sinergyClasses: ["arqueiro"],
    passiveBonus: "+2 de DEX permanentes. +2 de Foco (além do máximo normal). Ataques à distância do Arqueiro Puro ignoram a penalidade de cobertura parcial — ele sempre encontra o ângulo.",
    sinergyNote: "Exclusivo do Arqueiro. Nenhuma outra classe acessa estas habilidades.",
    skills: [
      {
        id: "sub-arqueiro-puro-saraivada",
        name: "Saraivada de Flechas",
        cost: "2 pontos",
        tier: 1,
        exclusive: true,
        levels: [
          { level: 1, effect: "Ativo (gasta 3 Foco, 2 Ações): dispara uma saraivada que atinge TODOS os inimigos em cone 5 hex ou linha 8 hex (escolhe a forma). Cada inimigo recebe 1d8+DEX de dano. Nenhum pode esquivar (a quantidade de flechas não deixa espaço). Def.Física se aplica normalmente. 1x por combate." },
          { level: 2, effect: "Cone 6 hex ou linha 10 hex. Dano 1d10+DEX. Def.Física = metade (as flechas encontram frestas). Alvos atingidos ficam com −1 Movimento por 2 rodadas (flechas nas pernas). 1x por combate." },
          { level: 3, effect: "Cone 8 hex ou linha 12 hex. Dano 1d12+DEX. Def.Física = 0 (volume absoluto de flechas, impossível de defender). Alvos testam AGI (difícil) ou ficam Derrubados. O Arqueiro pode usar como Ação Livre uma vez nesta Saraivada para mudar a forma (cone→linha ou vice-versa) enquanto dispara. 1x por combate." }
        ],
        example: "Todos os seis goblins caíram no mesmo segundo. Ele ainda tinha flechas."
      },
      {
        id: "sub-arqueiro-puro-tiro-certeiro",
        name: "Tiro Indefensável",
        cost: "2 pontos",
        tier: 1,
        exclusive: true,
        levels: [
          { level: 1, effect: "Ativo (gasta 2 Foco, 1 Ação): o Arqueiro não se move neste turno. Mira por 1 Ação completa (gasta a segunda Ação do turno). No turno seguinte: o tiro é disparado — acerto automático (sem rolagem de d10), ignora Def.Física, alcance ilimitado em linha de visão. Dano normal +1d10 extra. O alvo pode tentar esquivar (d20) mas com −4 na rolagem." },
          { level: 2, effect: "Mira: 1 Ação. Disparo: automático, ignora Def.Física e Mágica. +1d12 extra. Esquiva: −6. O Tiro atravessa cobertura total (paredes finas, pilares de madeira — apenas rocha sólida bloqueia)." },
          { level: 3, effect: "Mira e disparo no mesmo turno (gasta todas as Ações do turno). Automático, ignora toda defesa. +2d10 extra. Esquiva impossível (o alvo não consegue reagir a tempo). Se for Crítico: o alvo perde também 1d4 de DEX permanente até cura mágica (o tiro acertou a articulação)." }
        ],
        example: "O Berserker estava atrás de um pilar de pedra. Não ajudou."
      }
    ]
  },

  "ladino-puro": {
    name: "Ladino Puro",
    icon: "🗡",
    description: "O Ladino que não precisou de aliado para se tornar completo. Velocidade e veneno — o que mais precisaria? Dois caminhos: desaparecer no meio do combate e reaparecer onde ninguém espera, ou tornar o veneno tão concentrado que um único acerto é sentença.",
    sinergyClasses: ["ladino"],
    passiveBonus: "+2 de AGI permanentes. +2 Cargas de Veneno (além do máximo normal). O Ladino Puro não faz barulho ao se mover — Furtividade é automática ao mover-se (sem rolagem), apenas Percepção ativa de inimigos pode detectá-lo.",
    sinergyNote: "Exclusivo do Ladino. Nenhuma outra classe acessa estas habilidades.",
    skills: [
      {
        id: "sub-ladino-puro-sombra",
        name: "Passo das Sombras",
        cost: "2 pontos",
        tier: 1,
        exclusive: true,
        levels: [
          { level: 1, effect: "Ativo (gasta 2 Cargas, Ação Livre): desaparece completamente em sombra — torna-se invisível e intangível por 2 rodadas. Durante este tempo: pode se mover até 6 hex sem acionar ataques de oportunidade, não pode ser alvo de ataques ou magias, e pode atravessar criaturas (mas não paredes sólidas). Ao reaparecer: próximo ataque é acerto automático + 1d8 extra (Impacto do Reaparecimento). 1x por combate." },
          { level: 2, effect: "3 rodadas de invisibilidade. Movimento 8 hex. Pode atravessar paredes finas (madeira, cortinas, portas). Ao reaparecer: acerto automático + 1d12 extra e alvo fica com −2 na Chance de Acerto por 2 rodadas (desorientação do reaparecimento). 1x por combate." },
          { level: 3, effect: "4 rodadas de invisibilidade. Movimento 10 hex. Atravessa qualquer obstáculo exceto campo mágico de contenção. Ao reaparecer: escolhe de qual hex reaparece (em raio 10 hex de onde entrou nas sombras). Acerto automático + 2d10 extra + alvo fica Atordoado por 1 rodada. Pode ser usado 2x por combate." }
        ],
        example: "Ele estava no centro do círculo. Três inimigos. Quando reapareceu, havia apenas dois — e um deles estava no chão."
      },
      {
        id: "sub-ladino-puro-veneno-mortal",
        name: "Veneno Mortal",
        cost: "2 pontos",
        tier: 1,
        exclusive: true,
        levels: [
          { level: 1, effect: "Passivo: os venenos do Ladino Puro ignoram resistência a veneno comum. Ativo (gasta 3 Cargas, 1 Ação): aplica Veneno Mortal numa arma. O primeiro acerto com esta arma: 2d8 de veneno imediato (ignora Def.Física e Mágica) + Envenenado Grave (1d8 de veneno por rodada por 4 rodadas, SAB difícil para resistir). O Veneno Mortal não pode ser removido com antídoto comum — requer Cura Mágica ou descanso longo. 1 carga de Veneno Mortal por combate." },
          { level: 2, effect: "Veneno Mortal: 2d10 imediato + Envenenado Grave 1d10/rodada por 5 rodadas. SAB crítico para resistir. Resistência mágica a veneno também ignorada. Ao aplicar: o Ladino recupera 1 Carga de Veneno (o processo de concentrar o veneno é eficiente). 1 carga por combate." },
          { level: 3, effect: "Veneno Mortal: 3d10 imediato + Envenenado Grave 1d12/rodada por 6 rodadas (irremovível em combate — nem Cura Mágica funciona durante o combate, apenas após). Ao matar com Veneno Mortal: o cadáver exala névoa venenosa em raio 1 hex (1d6 de veneno por 2 rodadas). 2 cargas de Veneno Mortal por combate." }
        ],
        example: "O antídoto não funcionou. O boticário disse que era impossível. O Ladino disse que dependia de quem fez o veneno."
      }
    ]
  },

  "clerigo-puro": {
    name: "Clérigo Puro",
    icon: "✝",
    description: "O Clérigo que não dividiu a Fé. Cada ponto de Fé é uma oração respondida. Dois caminhos: tornar a cura tão poderosa que ressuscita o que parecia perdido, ou canalizar a energia divina em ondas de purificação que destroem o que é corrompido.",
    sinergyClasses: ["clerigo"],
    passiveBonus: "+2 de SAB permanentes. +3 pontos de Fé (além do máximo normal). Curas do Clérigo Puro sempre curam pelo menos o valor máximo dos dados (sem rolar abaixo de 4 em nenhum dado de cura).",
    sinergyNote: "Exclusivo do Clérigo. Nenhuma outra classe acessa estas habilidades.",
    skills: [
      {
        id: "sub-clerigo-puro-cura-milagrosa",
        name: "Cura Milagrosa",
        cost: "2 pontos",
        tier: 1,
        exclusive: true,
        levels: [
          { level: 1, effect: "Ativo (gasta 5 Fé + 1 Slot, 1 Ação): cura um aliado tocado em 4d8+SAB HP. Se o aliado estiver a 0 HP, esta magia o estabiliza e cura adicionalmente 2d6 HP extra (ressurreição do limiar). Remove todos os venenos, maldições menores e condições negativas do alvo. 1x por combate." },
          { level: 2, effect: "5d10+SAB HP. A 0 HP: estabiliza + 3d8 extra. Remove também maldições maiores e condições permanentes. Se o alvo tiver morrido neste mesmo turno (não mais de 1 rodada atrás): a Cura Milagrosa pode ser usada para ressuscitá-lo com 1 HP (o milagre reverte a morte recente). 1x por combate." },
          { level: 3, effect: "6d12+SAB HP. Ressuscita aliados mortos neste combate (não importa há quantas rodadas) com 30% HP. Remove qualquer condição ou maldição. Ao curar: o Clérigo emite pulso de energia sagrada — todos os aliados em raio 3 hex curam 2d6 também (a divindade não é mesquinha). 1x por combate." }
        ],
        example: "Ela tinha parado de respirar há um minuto. O Clérigo colocou a mão sobre o peito dela e disse uma única frase. Ela abriu os olhos."
      },
      {
        id: "sub-clerigo-puro-onda-sagrada",
        name: "Onda de Purificação",
        cost: "2 pontos",
        tier: 1,
        exclusive: true,
        levels: [
          { level: 1, effect: "Ativo (gasta 4 Fé + 1 Slot, 1 Ação): emite onda divina em raio 5 hex. Inimigos corrompidos, mortos-vivos e servos de divindades malignas sofrem 3d8+SAB de dano sagrado (ignora Def.Física e Mágica deste tipo de criatura). Inimigos neutros sofrem metade. Aliados na área curam 1d6 HP. 2x por combate." },
          { level: 2, effect: "Raio 6 hex. Dano 3d10+SAB. Corrompidos e mortos-vivos testam Força de Vontade (difícil) ou ficam Aterrorizados por 2 rodadas (fogem do Clérigo). Aliados curam 2d6 HP. Pode ser ativada como Reação quando um aliado é atacado (a onda protetora é um reflexo da fé). 2x por combate." },
          { level: 3, effect: "Raio 8 hex. Dano 4d12+SAB. Criaturas do Deus Marcado e mortos-vivos Elite testam Força de Vontade (crítico) ou são banidas do plano material por 1d4 rodadas (desaparecem e reaparecem fora do raio). Aliados curam 3d6 HP e ficam imunes a medo e maldições por 3 rodadas. Pode ser ativada como Reação. 2x por combate." }
        ],
        example: "A cripta inteira ficou branca por um instante. Quando a luz sumiu, os esqueletos eram pó e os feridos estavam de pé."
      }
    ]
  }};


/* ================================================================
   MALDIÇÕES E BENÇÃOS — Sistema de Condições Permanentes
   Tier: menor | media | poderosa
   type: "curse" | "blessing"
   ================================================================ */

const CURSES = [

  /* ─── MALDIÇÕES MENORES ─────────────────────────────────────── */
  {
    id: "curse-olho-mau", name: "Olho Mau", tier: "menor",
    icon: "👁", origin: "Feitiço de bruxa ou inveja acumulada",
    effect: "O personagem tem −1d4 em todos os testes de sorte e em situações aleatórias (como rolagens de encontro ou eventos do mestre). Objetos que carrega têm 10% de chance de quebrar ao ser usados de forma intensa.",
    duration: "Permanente até ser removida por Clérigo ou ritual de purificação (nível 1+)",
    mechanical: { penalty: "-1d4 em testes de sorte", special: "10% de quebra de objetos" },
    removal: "Cura mágica (nível 1+), água benta, visita a santuário"
  },
  {
    id: "curse-pesadelos", name: "Pesadelos Perpétuos", tier: "menor",
    icon: "😴", origin: "Dormir em local amaldiçoado, trauma não resolvido, magia negra",
    effect: "A cada descanso longo, o personagem testa SAB (normal). Falha: não recupera HP durante o descanso (acorda exausto). Sucesso: descansa normalmente. Cumulativo — 3 falhas seguidas causam −1 em todos os atributos temporariamente (retorna com descanso curado).",
    duration: "Permanente até ser removida",
    mechanical: { penalty: "SAB normal para descansar" },
    removal: "Ritual de Sonho Claro (nível 1), poção de sono profundo, visita a Clérigo de Aethea"
  },
  {
    id: "curse-lingua-podre", name: "Língua Podre", tier: "menor",
    icon: "🗣", origin: "Maldição de bardo ofendido, juramento quebrado",
    effect: "Toda vez que o personagem tenta Persuadir, Seduzir ou Negociar com NPCs neutros ou positivos, rola com −1d6 adicional. Palavras saem erradas, tom é sempre inadequado. Animais reagem negativamente à presença do personagem.",
    duration: "Permanente até ser removida",
    mechanical: { penalty: "-1d6 em testes sociais", special: "Animais hostis" },
    removal: "Pedir desculpas formais ao ofendido, bênção de bardo de nível 3+, Clérigo de Tobi"
  },

  /* ─── MALDIÇÕES MÉDIAS ──────────────────────────────────────── */
  {
    id: "curse-toque-frio", name: "Toque do Frio Eterno", tier: "media",
    icon: "🧊", origin: "Contato com morto-vivo poderoso, Aura dos Sepulcros",
    effect: "O personagem irradia frio. Aliados adjacentes sofrem −1 em todos os testes (o frio distrai). Em combate, ao acertar um ataque corpo a corpo, o alvo testa FOR (normal) ou fica Lento (−2 Movimento) por 1 rodada. Porém: o personagem é vulnerável a fogo (+1d6 por dado de dano de fogo recebido).",
    duration: "Permanente até ser removida por Clérigo ou calor sagrado",
    mechanical: { penalty: "Aliados adj. -1 em testes, vulnerável a fogo", bonus: "Ataques corp. causam Lentidão" },
    removal: "Chama Sagrada de Vermelhão, Clérigo de nível 2+, Ritual do Calor (requer 3 tochas sagradas)"
  },
  {
    id: "curse-sombra-viva", name: "Sombra Viva", tier: "media",
    icon: "🌑", origin: "Magia de necromante, traição grave, área corrompida pelo Deus Marcado",
    effect: "A sombra do personagem age independente com intenções próprias. Em momentos de tensão (combate, negociação crucial), o Mestre pode fazer a sombra sabotar sutilmente: derrubar um objeto, gesticular de forma errada, assustar um NPC. O personagem nunca sabe quando a sombra vai agir. −2 em Percepção (a sombra distrai).",
    duration: "Permanente até exorcismo",
    mechanical: { penalty: "-2 em Percepção, sombra autônoma (Mestre controla)" },
    removal: "Exorcismo de Clérigo (nível 3+), luz solar direta por 7 dias seguidos, item Cristal da Luz Pura"
  },
  {
    id: "curse-marca-sangue", name: "Marca de Sangue", tier: "media",
    icon: "🩸", origin: "Ritual de vingança, maldição familiar, contrato quebrado",
    effect: "O personagem sangra magicamente quando usa poder — a cada uso de magia ou habilidade especial, perde 1d4 HP (o sangue é o custo). Aliados dentro de 2 hex do personagem em combate podem ser respingados (Mestre decide quando é dramático). A marca é visível: −1d4 em testes de interação com desconhecidos (assusta).",
    duration: "Permanente até ritual de purificação de sangue",
    mechanical: { penalty: "−1d4 HP por uso de magia/habilidade, −1d4 interação social" },
    removal: "Ritual de Purificação de Sangue (Clérigo nível 2), poção de cura ancestral, Clérigo de Jurgmund"
  },
  {
    id: "curse-azar-acumulado", name: "Azar Acumulado", tier: "media",
    icon: "🎲", origin: "Provocar uma divindade, maldição de mercador, quebrnar talismã",
    effect: "Todo resultado natural 20 nos dados do personagem é tratado como 1 (azar inverte os críticos positivos). Todo resultado natural 1 é tratado como 1 normalmente (os críticos negativos permanecem). Uma vez por sessão, um evento aleatório negativo ocorre — algo que o Mestre determina como consequência do azar acumulado.",
    duration: "Permanente até ser removida",
    mechanical: { penalty: "20 natural vira 1, evento negativo 1x/sessão" },
    removal: "Oferta em templo (50 moedas de ouro mínimo), bênção de divindade favorável, reverter o ato que causou a maldição"
  },

  /* ─── MALDIÇÕES PODEROSAS ───────────────────────────────────── */
  {
    id: "curse-consumido", name: "Consumido por Dentro", tier: "poderosa",
    icon: "💀", origin: "Magia de nível 5 de necromante, artefato amaldiçoado, sacrifício falho",
    effect: "O personagem perde 1d4 HP máximo permanentemente a cada semana de jogo (retira do máximo, não cura). Abaixo de 50% HP máximo original: começa a exalar fumaça negra — detectável por Clérigos e mortos-vivos (que o reconhecem como 'quase um deles'). A condição acelera se o personagem usar magia de necromância.",
    duration: "Progressiva — sem remoção simples",
    mechanical: { penalty: "−1d4 HP máximo/semana, detectável por mortos-vivos" },
    removal: "Ritual Maior de Purificação (Clérigo nível 5+), Cura Suprema usada por Clérigo de Aethea, sacrifício de item ancestral"
  },
  {
    id: "curse-espiral-loucura", name: "Espiral de Loucura", tier: "poderosa",
    icon: "🌀", origin: "Ver a forma verdadeira de uma entidade, área de corrupção máxima, falha em ritual proibido",
    effect: "A cada combate intenso (3+ rodadas), o personagem testa SAB (difícil) ou ganha 1 Nível de Instabilidade (máximo 3). Nível 1: age normalmente mas faz comentários erráticos. Nível 2: Mestre pode fazer o personagem agir de forma irracional 1x por combate. Nível 3: o Mestre controla 1 ação por rodada. Níveis reduzem com descanso longo e tratamento.",
    duration: "Progressiva — acumula com o tempo",
    mechanical: { penalty: "Teste SAB difícil ou +1 Instabilidade por combate" },
    removal: "Tratamento de Clérigo de Aethea por 7 dias, ritual de ancoragem mental (Nível 4), experiência que reverta o trauma"
  },
  {
    id: "curse-deus-marcado-olho", name: "Olhar do Deus Marcado", tier: "poderosa",
    icon: "⚫", origin: "Contato direto com Aralto de alto nível, fragmento da Marca, traição aos aliados do Deus Marcado",
    effect: "O personagem carrega a marca do Deus Marcado. Criaturas corrompidas o reconhecem como potencial aliado e hesitam 1 rodada antes de atacar. Clérigos de Sanctum e Aethea testam SAB ao ver o personagem (falha: tratam como inimigo). Uma vez por sessão, o Deus Marcado pode sussurrar algo verdadeiro ao personagem (o Mestre usa isso narrativamente). −2 em DEF Mágica contra magia sagrada.",
    duration: "Quase permanente",
    mechanical: { penalty: "−2 Def.Mágica vs. sagrado, hostilidade de Clérigos", bonus: "Criaturas corrompidas hesitam; sussurros do Deus Marcado" },
    removal: "Ritual de Exorcismo da Marca (nível 5, requer fragmento da Cruz Inversa de Sanctum), morte e ressurreição, remissão de divindade contrária"
  },



  /* ─── MALDIÇÕES MENORES ADICIONAIS ─────────────────────────── */
  {
    id: "curse-maos-frias", name: "Mãos de Gelo", tier: "menor",
    icon: "🖐", origin: "Toque de espectro, dormência mágica, feitiço de rival",
    effect: "As mãos do personagem estão permanentemente geladas e insensíveis. −1d4 em testes que exigem tato fino (abrir fechaduras, cirurgia, escrever magias em pergaminhos, desativar armadilhas). Armas escapam das mãos com 5% de chance por acerto crítico recebido — rola 1d20, em 1 ou 2 a arma cai.",
    duration: "Permanente até aquecimento mágico ou ritual de sensibilidade",
    mechanical: { penalty: "−1d4 em testes de tato fino, 5% de soltar arma ao receber crítico" },
    removal: "Ritual do Calor de Vermelhão, Clérigo de Thurgomur (forja sagrada), poção de circulação"
  },
  {
    id: "curse-sombra-nao-acompanha", name: "Sombra Atrasada", tier: "menor",
    icon: "🔆", origin: "Truque de feiticeiro, magia de ilusão mal direcionada",
    effect: "A sombra do personagem tem 1 segundo de atraso — se move depois do corpo. É inofensivo para o personagem mas NPCs que notem testam SAB (normal) ou ficam desconfiados/assustados. Testes de Furtividade em ambientes iluminados têm −1d4 (a sombra entrega a posição).",
    duration: "Permanente até exorcismo menor",
    mechanical: { penalty: "−1d4 Furtividade em áreas iluminadas, NPCs desconfiam" },
    removal: "Qualquer magia de luz de nível 1+, ritual simples de reancoragem de sombra"
  },
  {
    id: "curse-fome-insaciavel", name: "Fome Insaciável", tier: "menor",
    icon: "🍖", origin: "Maldição de cozinheiro ofendido, espírito de gulodice, área de escassez mágica",
    effect: "O personagem precisa comer o dobro do normal. Se não comer uma refeição completa antes de cada aventura: −1 em todos os atributos por 24h (fica distraído pela fome). Nunca sente satisfação — sempre parece levemente faminto. Em negociações sobre comida ou suprimentos: sempre perde o juízo (+1d4 na dificuldade de negociar sobre esses temas).",
    duration: "Permanente até purificação de cozinheiro ou Clérigo de Tobi",
    mechanical: { penalty: "−1 atributos sem refeição dupla, +1d4 dificuldade em negociações de suprimentos" },
    removal: "Banquete sagrado de Tobi (pelo menos 10 pessoas), bênção de cozinheiro goblin, poção de saciedade permanente"
  },
  {
    id: "curse-espelhos", name: "Maldição dos Espelhos", tier: "menor",
    icon: "🪞", origin: "Quebrar espelho mágico, olhar para reflectante amaldiçoado, vaidade punida",
    effect: "O personagem não tem reflexo — espelhos, água parada e superfícies polidas não o mostram. Inofensivo para ele, mas NPCs que notem ficam aterrorizados ou desconfiados. Vampiros e mortos-vivos reconhecem a semelhança e hesitam 1 rodada antes de atacar (acham que é um deles). Testes de autoimagem e disfarce que dependam de ver a própria aparência têm −1d6.",
    duration: "Permanente até ritual de restauração de reflexo",
    mechanical: { penalty: "Sem reflexo, −1d6 em disfarces, NPCs desconfiam; mortos-vivos hesitam" },
    removal: "Ritual com espelho não-quebrado e sangue do personagem, Clérigo de Aethea (magia de verdade)"
  },
  {
    id: "curse-som-errado", name: "Eco Maldito", tier: "menor",
    icon: "🔊", origin: "Blasfêmia num lugar sagrado, Bardo ofendido, área de ressonância mágica",
    effect: "Tudo que o personagem faz gera um eco levemente errado — passos um segundo atrasados, voz com harmônico estranhão. Em Furtividade: sempre −2 (o eco entrega). Em interações com músicos, bardos e criaturas sensíveis a som: −1d4 na reação inicial. Uma vez por sessão, o Mestre pode usar o eco para revelar a presença do personagem num momento inconveniente.",
    duration: "Permanente até silêncio mágico ou bênção de Bardo",
    mechanical: { penalty: "−2 permanente em Furtividade, −1d4 com criaturas auditivas, eco delata 1x/sessão" },
    removal: "Bênção de Bardo de nível 3+, Ritual do Silêncio (3 dias de silêncio absoluto), item Pedra do Silêncio"
  },

  /* ─── MALDIÇÕES MÉDIAS ADICIONAIS ──────────────────────────── */
  {
    id: "curse-dreno-mana", name: "Dreno Arcano", tier: "media",
    icon: "🔵", origin: "Sobrecarregar canal mágico, usar artefato corrompido, falha em ritual",
    effect: "O personagem tem −1 Slot de Magia permanente enquanto a maldição estiver ativa (mínimo 0 — não pode conjurar se chegar a 0). Toda vez que conjura uma magia, rola 1d6: em 1, a magia funciona mas drena 1d4 HP adicional (o canal mágico vaza energia vital). Magias de nível 4+ custam +1 Slot extra.",
    duration: "Permanente até purificação arcana",
    mechanical: { penalty: "−1 Slot de Magia, 1d4 HP extra em rolar 1 ao conjurar, magias nv4+ +1 Slot" },
    removal: "Ritual de Selagem de Canal (Mago de nível alto), poção de mana pura, descanso em área de magia forte"
  },
  {
    id: "curse-ferro-quente", name: "Ferro em Brasa", tier: "media",
    icon: "🔥", origin: "Maldição de ferreiro traído, item de Vermelhão mal manuseado, pacto de calor quebrado",
    effect: "Armas e armaduras metálicas ficam quentes ao toque do personagem — não causam dano, mas são desconfortáveis. Em situações de stress (combate, tensão), os metais aquecem o suficiente para queimar: −1d4 em ataques com armas metálicas. Em ambientes quentes (deserto, vulcão, perto de fogo grande): −2 em todos os testes. Mas em frio extremo: o personagem é imune a penalidades de frio.",
    duration: "Permanente — bônus e penalidades coexistem",
    mechanical: { penalty: "−1d4 ataques com armas metálicas, −2 em calor extremo", bonus: "Imune a penalidades de frio" },
    removal: "Mergulho em lago glacial sagrado, Ritual da Têmpera de Thurgomur, Clérigo de Vermelhão"
  },
  {
    id: "curse-olhos-mortos", name: "Olhos dos Mortos", tier: "media",
    icon: "👀", origin: "Ver algo que não deveria ser visto, magia de clarividência corrompida, Banshee",
    effect: "Os olhos do personagem mudam — ficam levemente opacos, esbranquiçados. Ele passa a ver espíritos e mortos-vivos invisíveis normalmente. Porém: visão no mundo real fica turva — Percepção visual −1d4. Em ambientes com muitos espíritos (cemitérios, dungeons antigas): é sobrecarregado por visões, −1d6 em todos os testes por estar distraído. Mortos-vivos sentem que ele os vê — reagem com hostilidade ou curiosidade (Mestre decide).",
    duration: "Permanente",
    mechanical: { penalty: "−1d4 Percepção visual, −1d6 em locais com espíritos", bonus: "Vê espíritos e mortos-vivos invisíveis" },
    removal: "Ritual de Purificação da Visão (Clérigo de Aethea nível 3+), lágrimas de espírito livre, poção de visão clara"
  },
  {
    id: "curse-peso-almas", name: "Peso das Almas", tier: "media",
    icon: "⚖", origin: "Matar inocentes, trair aliados de confiança, acumular dívidas kármicas",
    effect: "O personagem carrega o peso literal de seus atos. −1 em Movimento permanente (os pés pesam). Em descanso longo após combate onde inocentes foram prejudicados: não recupera HP normalmente (só recupera metade). Clérigos de qualquer divindade sentem a carga — −1d6 em interações com eles. Porém: esse peso o torna firme — imune a efeitos de Empurrão e Derrubada involuntária.",
    duration: "Progressiva — piora com cada ato moralmente pesado",
    mechanical: { penalty: "−1 Movimento, metade de HP em descanso pós-ato pesado, −1d6 com Clérigos", bonus: "Imune a Empurrão e Derrubada" },
    removal: "Ato de redenção genuíno reconhecido por divindade, penitência formal em templo, perdão do ofendido"
  },
  {
    id: "curse-lingua-verdade", name: "Língua da Verdade", tier: "media",
    icon: "🗨", origin: "Bênção de divindade que virou maldição, juramento de honestidade excessivo",
    effect: "O personagem é incapaz de mentir conscientmente — qualquer tentativa de mentira resulta em tosse, gaguejos ou saída da língua verdadeira. Pode omitir e silenciar, mas não inventar. Enganação e Blefe são impossíveis. Negociação e Persuasão têm +1d4 (as pessoas confiam em quem não consegue mentir), mas situações que exigem diplomacia falsa tornam-se muito mais complexas.",
    duration: "Permanente — considerada bênção por alguns, maldição por outros",
    mechanical: { penalty: "Incapaz de mentir, Enganação impossível", bonus: "+1d4 em Persuasão e Negociação (confiança)" },
    removal: "Ato deliberado de traição (quebra a maldição mas causa consequências), Ritual da Máscara de Mercúrio"
  },

  /* ─── MALDIÇÕES PODEROSAS ADICIONAIS ───────────────────────── */
  {
    id: "curse-sangue-frio", name: "Sangue Frio da Serpente", tier: "poderosa",
    icon: "🐍", origin: "Morder ou ser mordido por serpente sagrada de Jurgmund sem ser serpentariano, profanar templo",
    effect: "A temperatura do personagem cai gradualmente. Em uma semana: pele fica fria ao toque. Em um mês: começa a desenvolver escamas sutis nas extremidades. Mecanicamente: −2 AGI permanente (movimentos ficam rígidos no frio). Em ambientes quentes: volta a AGI normal. Aliados que dormem próximos notam o frio e acordam desconfortáveis. Clérigos de Jurgmund reconhecem a marca e podem tanto ajudar quanto explorar isso.",
    duration: "Progressiva — se não tratada, em 3 meses o personagem começa a hibernar",
    mechanical: { penalty: "−2 AGI (revertível em calor), aliados perturbados ao dormir próximo" },
    removal: "Ritual de Purificação de Jurgmund (requer Clérigo serpentariano de nível 4+), banho em fonte sagrada de calor, sangue de Serpente Dourada voluntariamente oferecido"
  },
  {
    id: "curse-eco-morte", name: "Eco da Morte", tier: "poderosa",
    icon: "🔔", origin: "Morrer e ser ressuscitado, visitar o plano dos mortos, falhar em ritual de necromância",
    effect: "O personagem tem um eco do plano dos mortos — mortos-vivos o reconhecem como 'parcialmente deles' e não atacam automaticamente (testam SAB, falha: tratam como aliado). Humanos sensíveis (Clérigos, bardos, crianças) sentem algo errado — −1d6 em interações espontâneas. Uma vez por sessão, o Mestre pode fazer o personagem ouvir vozes de mortos que conheceu. HP máximo reduzido em 10 permanentemente (parte dele ainda está no outro plano).",
    duration: "Permanente — parte do personagem ficou lá",
    mechanical: { penalty: "−10 HP máximo permanente, −1d6 interações espontâneas", bonus: "Mortos-vivos não atacam automaticamente" },
    removal: "Ritual de Âncora da Vida (exige presença de 3 Clérigos), item Chave do Retorno, ato de amor ou conexão profunda com um vivo"
  },
  {
    id: "curse-fragmento-marca", name: "Fragmento da Marca Negra", tier: "poderosa",
    icon: "⚠", origin: "Sobreviver a um Aralto Maior, tocar núcleo da Marca, ser usado como canal do Deus Marcado",
    effect: "Uma pequena porção da corrupção do Deus Marcado reside no personagem. Em situações de raiva ou desespero extremo, o Mestre pode ativar o fragmento — o personagem ganha +2d6 de dano por 2 rodadas mas perde controle de 1 ação por rodada (age de forma corruptamente). Criaturas santas sofrem 1d4 de dano sombrio ao tocar o personagem (involuntário). Araltos sentem a marca e podem tentar recrutar ao invés de matar.",
    duration: "Permanente — o fragmento cresce com o tempo se não removido",
    mechanical: { penalty: "+2d6 dano mas perde 1 ação (ativação Mestre), toque causa 1d4 sombrio a criaturas santas", bonus: "Araltos hesitam, tentam recrutar" },
    removal: "Exorcismo completo por Clérigo de Aethea nível 5 (processo de 3 sessões), destruir o Aralto que implantou, artefato sagrado específico"
  }
];

const BLESSINGS = [

  /* ─── BENÇÃOS MENORES ───────────────────────────────────────── */
  {
    id: "bless-sorte", name: "Toque de Boa Sorte", tier: "menor",
    icon: "🍀", origin: "Gratidão de NPC, favor de Tobi, completar uma missão honrosa",
    effect: "1 vez por sessão, o jogador pode re-rolar qualquer dado (inclusive do Mestre se afeta o personagem) e ficar com o melhor resultado. O dado re-rolado brilha levemente — efeito visual que NPCs próximos notam.",
    duration: "Até ser usada ou até o fim da campanha",
    mechanical: { bonus: "1x/sessão re-rola qualquer dado, melhor resultado" },
    removal: "Gasta ao ser usada (pode ser renovada)"
  },
  {
    id: "bless-vigor", name: "Vigor Abençoado", tier: "menor",
    icon: "💪", origin: "Bênção de Thurgomur, completar desafio físico extremo, ritual anão",
    effect: "+5 HP máximo permanente enquanto a bênção estiver ativa. Uma vez por combate, quando o personagem ficaria Derrubado, pode testar FOR (normal) para permanecer em pé com 1 HP.",
    duration: "Permanente enquanto honrar as tradições de Thurgomur (ou até ser removida)",
    mechanical: { bonus: "+5 HP máximo, 1x/combate: teste para não cair" }
  },
  {
    id: "bless-voz", name: "Voz Abençoada", tier: "menor",
    icon: "🎵", origin: "Bênção de Bardo famoso, gratidão de Tobi, performance em local sagrado",
    effect: "+1d6 em todos os testes de Persuasão, Sedução, Negociação e Performance. NPCs neutros começam com disposição ligeiramente positiva ao personagem. A voz tem uma qualidade que é difícil de descrever — simplesmente agradável de ouvir.",
    duration: "Permanente enquanto o personagem usar a voz honestamente",
    mechanical: { bonus: "+1d6 testes sociais, NPCs neutros começam positivos" }
  },

  /* ─── BENÇÃOS MÉDIAS ────────────────────────────────────────── */
  {
    id: "bless-escudo-fe", name: "Escudo de Fé Divina", tier: "media",
    icon: "✨", origin: "Bênção direta de Aethea ou Thion, ato de sacrifício genuíno",
    effect: "Passivo: +2 em Defesa Mágica. Uma vez por combate, ao receber dano mágico que reduziria o personagem a 0 HP, o escudo absorve todo o dano (fica a 1 HP). O escudo brilha visivelmente quando ativado. Clérigos de Aethea e Thion reconhecem a bênção.",
    duration: "Até ser usada 3 vezes ou até o fim da campanha",
    mechanical: { bonus: "+2 Def.Mágica, absorção total de dano 1x/combate (3 usos totais)" }
  },
  {
    id: "bless-lâmina-sagrada", name: "Lâmina Sagrada", tier: "media",
    icon: "⚔", origin: "Unção em altar de Sanctum, bênção de Paladino de nível alto, ritual de guerra",
    effect: "Ataques físicos do personagem causam +1d6 de dano sagrado adicional. Contra criaturas corrompidas (Araltos, mortos-vivos) e de origem demônica: +1d8 adicional em vez de +1d6. Uma vez por sessão: pode declarar um Golpe de Julgamento — o próximo ataque causa dano máximo em todos os dados automaticamente.",
    duration: "Permanente enquanto o personagem não cometer atos contra o código de Sanctum",
    mechanical: { bonus: "+1d6 sagrado (ou +1d8 vs. corrompidos), 1x/sessão dano máximo" }
  },
  {
    id: "bless-mente-acurada", name: "Mente Acurada", tier: "media",
    icon: "🧠", origin: "Bênção de sábio ancião, ritual de Aethea, completar estudo de grimório lendário",
    effect: "+2 em INT e SAB temporariamente (dura enquanto a bênção estiver ativa, não é permanente no atributo base mas conta para todos os cálculos). +1 Slot de Magia adicional. Magias de nível 1 e 2 custam 0 Slots (o conhecimento flui naturalmente).",
    duration: "Duração: 1 semana de jogo; renovável com rituais",
    mechanical: { bonus: "+2 INT e SAB, +1 Slot, magias nv1-2 sem custo de slot" }
  },
  {
    id: "bless-sombra-aliada", name: "Sombra Aliada", tier: "media",
    icon: "🌒", origin: "Bênção de espírito benevolente, pacto honrado com criatura das sombras, gratidão de Ladino lendário",
    effect: "Em áreas de sombra ou escuridão: +2 em Esquiva e +1d4 em todos os ataques (a sombra guia os movimentos). 1 vez por combate: pode desaparecer nas sombras como Ação Livre (invisível por 1 rodada, próximo ataque é Crítico automático). Detectável por visão de verdade ou magia de luz.",
    duration: "Permanente enquanto o personagem respeitar os acordos com espíritos",
    mechanical: { bonus: "+2 Esquiva e +1d4 ataques em sombra, 1x desaparece e crítico automático" }
  },

  /* ─── BENÇÃOS PODEROSAS ─────────────────────────────────────── */
  {
    id: "bless-sangue-heroi", name: "Sangue de Herói", tier: "poderosa",
    icon: "🔥", origin: "Ato de heroísmo genuíno testemunhado por divindade, sacrifício em campo de batalha",
    effect: "Passivo: o personagem tem +1d8 de dano em todos os ataques físicos. Quando chegar a 0 HP pela primeira vez por sessão: recupera automaticamente 3d10 HP (o sangue de herói recusa a morte fácil). Ao matar um inimigo de dificuldade 3+: recupera 1d8 HP. NPCs sentem algo especial no personagem — +1d4 em interações com guerreiros e soldados.",
    duration: "Permanente — parte do destino do personagem",
    mechanical: { bonus: "+1d8 dano, revive 1x/sessão (3d10 HP), +1d8 HP ao matar Dif.3+" }
  },
  {
    id: "bless-escolhido", name: "Escolhido da Divindade", tier: "poderosa",
    icon: "👑", origin: "Missão divina cumprida, salvação de algo sagrado, sacrifício pessoal de grande valor",
    effect: "O personagem é marcado por uma divindade específica (escolher qual). Ganha: +1 em todos os atributos (+1 FOR, DEX, AGI, INT, SAB), imunidade a maldições de tier menor e média, e uma habilidade única da divindade (Mestre e jogador criam juntos). Além disso: uma vez por sessão, pode pedir orientação à divindade — o Mestre dá uma pista ou ajuda narrativa.",
    duration: "Permanente — mas pode ser revogada por atos contrários à divindade",
    mechanical: { bonus: "+1 em todos os atributos, imune a maldições menores e médias, habilidade divina única" }
  },
  {
    id: "bless-imortal-vontade", name: "Vontade Imortal", tier: "poderosa",
    icon: "⚡", origin: "Sobreviver ao impossível, ser ressuscitado por ritual de nível máximo, contrato com entidade primordial",
    effect: "O personagem é incapaz de morrer de causas mundanas enquanto a bênção estiver ativa. Se chegar a 0 HP: fica Inconsciente mas estabiliza automaticamente (não morre). Recupera 1d6 HP por rodada enquanto Inconsciente. Para morrer de verdade: precisaria de uma causa de natureza divina ou mágica de nível 5. +2 em todos os testes de resistência. A presença do personagem impõe respeito involuntário (+1d6 em Intimidação).",
    duration: "Duração: 1 missão completa; renovável com grande ato",
    mechanical: { bonus: "Imune a morte mundana, regen 1d6/r Inconsciente, +2 resistências, +1d6 Intimidação" }
  }

  /* ─── BENÇÃOS MENORES ADICIONAIS ───────────────────────────── */
  ,{
    id: "bless-sono-cura", name: "Sono Reparador", tier: "menor",
    icon: "🌙", origin: "Bênção de Aethea, gratidão de espírito de sonho, poção consagrada",
    effect: "O personagem recupera HP adicional em cada descanso longo: +1d8 HP além do normal. Sonhos são sempre claros e informativos — o Mestre pode dar 1 pista ou informação relevante por semana de jogo como 'visão de sonho'. Imune à maldição Pesadelos Perpétuos enquanto esta bênção estiver ativa.",
    duration: "Permanente enquanto o personagem mantiver boa reputação com espíritos",
    mechanical: { bonus: "+1d8 HP por descanso longo, visão de sonho 1x/semana, imune a Pesadelos" }
  },
  {
    id: "bless-passos-leves", name: "Passos Leves", tier: "menor",
    icon: "🦶", origin: "Bênção de Ladino lendário, favor de espírito da floresta, treino espiritual",
    effect: "+1 em Movimento. Em terreno natural (floresta, montanha, campo): +2 em Furtividade. O personagem nunca escorrega em superfícies difíceis (gelo, lama, pedra molhada) — imune a penalidades de terreno para Movimento. Deixa pegadas menos profundas — rastreadores têm +1 grau de dificuldade para seguí-lo.",
    duration: "Permanente",
    mechanical: { bonus: "+1 Movimento, +2 Furtividade em terreno natural, imune a penalidades de terreno" }
  },
  {
    id: "bless-olhos-aguia", name: "Olhos de Águia", tier: "menor",
    icon: "🦅", origin: "Bênção de Druida, favor de Águia Trovejante invocada, ritual de visão",
    effect: "+1d6 em todos os testes de Percepção visual. Alcance de visão efetiva duplicado — enxerga o dobro da distância normal com clareza. Não é enganado por ilusões visuais simples (nível 1-2) — testa automaticamente para perceber. Em ambientes escuros: enxerga em penumbra como se fosse meia-luz.",
    duration: "Permanente",
    mechanical: { bonus: "+1d6 Percepção, alcance visual dobrado, resistência a ilusões nv1-2, visão em penumbra" }
  },
  {
    id: "bless-mao-firme", name: "Mão Firme", tier: "menor",
    icon: "🎯", origin: "Bênção de Arqueiro ancestral, favor de Thurgomur (artesanato), ritualde pontaria",
    effect: "+1d4 em todos os ataques à distância. Nunca sofre penalidade por movimento ao atirar (pode correr e atirar sem −1d4). Uma vez por combate: pode declarar um Tiro Perfeito — o próximo ataque à distância não pode errar por fator de cobertura (ignora cobertura parcial completamente).",
    duration: "Permanente enquanto o personagem não use ataques desonrosos",
    mechanical: { bonus: "+1d4 ataques à distância, sem penalidade ao mover, 1x/combate ignora cobertura" }
  },
  {
    id: "bless-sangue-quente", name: "Sangue Quente", tier: "menor",
    icon: "🌡", origin: "Bênção de Vermelhão, sobreviver a incêndio, ritual de iniciação de Karlac",
    effect: "Imune a penalidades de frio e ambientes gelados. Em temperatura muito baixa: em vez de penalidades, ganha +1d4 em testes de resistência física (o calor interno se intensifica). Testes de FOR têm +1d4 adicional em qualquer temperatura. Aliados que se aqueçam ao lado do personagem recuperam 1d4 HP por hora de descanso (o calor é reconfortante).",
    duration: "Permanente",
    mechanical: { bonus: "Imune a frio, +1d4 FOR, aliados recuperam 1d4 HP/hora de descanso próximos" }
  },

  /* ─── BENÇÃOS MÉDIAS ADICIONAIS ────────────────────────────── */
  {
    id: "bless-reflexo-predador", name: "Reflexo de Predador", tier: "media",
    icon: "⚡", origin: "Bênção de espírito animal, sobreviver a emboscada mortal, ritual de caçador",
    effect: "+2 em Iniciativa permanente. Nunca é surpreendido — mesmo em emboscadas, age normalmente no primeiro turno. 1 vez por combate: ao ser atacado, pode gastar 1 Ação para contra-atacar imediatamente (fora do turno) com dano normal. Percepção de ameaças à vida tem +1d6 — o personagem sente antes de ver.",
    duration: "Permanente",
    mechanical: { bonus: "+2 Iniciativa, imune a Surpresa, 1x/combate contra-ataque imediato, +1d6 percepção de ameaças" }
  },
  {
    id: "bless-cura-acelerada", name: "Cura Acelerada", tier: "media",
    icon: "💉", origin: "Bênção de Clérigo de Aethea, ritual de regeneração, poção ancestral de Thurgomur",
    effect: "O personagem regenera HP naturalmente em combate — recupera 2 HP no início de cada turno. Descanso curto (1 hora) recupera 2d8 HP em vez do normal. Ferimentos que deixariam cicatrizes em outros curam sem marca. Condições de Sangramento são removidas automaticamente no início do turno do personagem. Venenos comuns têm duração reduzida à metade.",
    duration: "Permanente",
    mechanical: { bonus: "Regen 2 HP/turno em combate, descanso curto +2d8 HP, Sangramento auto-removido, venenos comuns −50% duração" }
  },
  {
    id: "bless-armadura-luz", name: "Armadura de Luz", tier: "media",
    icon: "🛡", origin: "Bênção de Paladino ancestral, ato de proteção de inocente, Clérigo de Thion",
    effect: "+2 em Defesa Física permanente (bônusespiritual, não de armadura real). Uma vez por combate, ao receber um ataque que causaria 15+ de dano: reduz o dano à metade automaticamente (a luz absorve o excesso). Em ambientes de luz natural ou sagrada: +1 em todos os testes defensivos. Aliados adjacentes ao personagem têm +1 Defesa Física (a luz transborda).",
    duration: "Permanente enquanto o personagem proteger inocentes",
    mechanical: { bonus: "+2 Def.Física, 1x/combate metade do dano de ataques 15+, aliados adj. +1 Def.Física em luz" }
  },
  {
    id: "bless-mana-pura", name: "Canal de Mana Pura", tier: "media",
    icon: "🔮", origin: "Meditação em nodo de mana, bênção de Mago ancestral, completar grimório lendário",
    effect: "+1 Slot de Magia permanente. Magias de nível 1-3 têm custo de conjuração reduzido — não consomem Ação de Magia (são lançadas como Ação Livre, 1x cada por turno). Ao rolar 20 natural em qualquer teste de conjuração: a magia é lançada sem consumir Slot. A magia flui mais naturalmente — nunca falha por interferência mágica ambiental.",
    duration: "Permanente enquanto o personagem estudar regularmente",
    mechanical: { bonus: "+1 Slot, magias nv1-3 como Ação Livre 1x/turno, 20 natural = sem consumo de Slot" }
  },

  /* ─── BENÇÃOS PODEROSAS ADICIONAIS ─────────────────────────── */
  {
    id: "bless-avatar-guerra", name: "Avatar da Guerra", tier: "poderosa",
    icon: "🗡", origin: "Sobreviver a batalha impossível, ser o último de pé numa guerra, bênção de divindade marcial",
    effect: "Em combate: +1d8 de dano em todos os ataques, +1 Ação de Combate por turno, e a cada rodada que sobreviver (não ficou abaixo de 50% HP): ganha 1 carga de Momento (máximo 5). Cada carga de Momento adiciona +1d4 de dano. Ao chegar a 5 cargas: pode declarar Forma de Avatar por 3 rodadas — todas as estatísticas de combate dobradas. Após a Forma: fica Exausto por 2 rodadas (−1 Ação).",
    duration: "Permanente — a bênção cresce com vitórias em batalha",
    mechanical: { bonus: "+1d8 dano, +1 Ação, acumula Momento (+1d4/carga), Forma de Avatar (stats dobradas, 3r) 1x/combate" }
  },
  {
    id: "bless-toque-divino", name: "Toque Divino", tier: "poderosa",
    icon: "🌟", origin: "Contato físico com objeto verdadeiramente sagrado, presença direta de divindade, sacrifício de item ancestral",
    effect: "As mãos do personagem canalizam energia divina. Ataques físicos causam +1d6 sagrado adicional. Pode curar tocando aliados: 1 Ação = cura 2d8+SAB HP em aliado tocado (3x por combate, sem custo de Slot ou Magia). Mortos-vivos e criaturas corrompidas sofrem +2d6 extra ao ser tocados. Uma vez por sessão: pode purificar um item corrompido ou remover uma maldição de tier menor de um aliado pelo toque.",
    duration: "Permanente enquanto o personagem agir em nome da divindade que concedeu",
    mechanical: { bonus: "+1d6 sagrado, cura por toque 2d8+SAB (3x/combate), +2d6 vs. corrompidos, purificação 1x/sessão" }
  },
  {
    id: "bless-nome-lenda", name: "Nome que Vira Lenda", tier: "poderosa",
    icon: "📜", origin: "Completar missão de escala épica, ser cantado por Bardo famoso, marca de divindade confirmada",
    effect: "O nome do personagem começou a espalhar-se. NPCs que ouviram falar dele (Mestre determina quais) têm reação inicial positiva ou de respeito. Em negociações: +1d8 adicional simplesmente por ser identificado. Em combate: inimigos que o reconheçam testam SAB (normal) ou ficam com −1d4 em ataques (intimidados pela reputação). Uma vez por sessão: pode invocar a reputação para conseguir acesso, favor ou informação que normalmente exigiria esforço.",
    duration: "Permanente — e cresce com o tempo",
    mechanical: { bonus: "+1d8 negociações, −1d4 ataques de inimigos que reconheçam, favor de reputação 1x/sessão" }
  }

];

function getAllSpellsInGame() {
  const list = [];
  Object.keys(CLASSES).forEach(key => {
    const cls = CLASSES[key];
    if (cls.spellsFull) {
      cls.spellsFull.forEach(s => list.push({ ...s, origin: cls.name }));
    }
  });
  GENERAL_SPELLS.forEach(s => list.push({ ...s, origin: "Geral" }));
  return list;
}

/* Retorna apenas as magias que o personagem pode aprender:
   - Magias de Mago: só para Mago
   - Magias de Clérigo: só para Clérigo
   - GENERAL_SPELLS: para todas as classes */
function getSpellsForCharacter(character) {
  const charClassName = getClassDef(character.classKey)?.name || "";
  const list = [];
  Object.keys(CLASSES).forEach(key => {
    const cls = CLASSES[key];
    if (cls.spellsFull) {
      // Magias exclusivas só aparecem para a própria classe
      if (cls.name === charClassName) {
        cls.spellsFull.forEach(s => list.push({ ...s, origin: cls.name }));
      }
    }
  });
  GENERAL_SPELLS.forEach(s => list.push({ ...s, origin: "Geral" }));
  return list;
}

/* Categorias de item para o modal "Adicionar item do mundo" */
const WORLD_ITEM_CATALOG = {
  weapon: ALL_WEAPONS.filter(Boolean).map(w => ({ ...w, category: "weapon" })),
  shield: SHIELDS.map(s => ({ ...s, category: "shield" })),
  armor: ARMORS.map(a => ({ ...a, category: "armor" })),
  accessory: ACCESSORIES.map(a => ({ ...a, category: "accessory" }))
};

/* ---------------------------------------------------------------------- */
/* PÁGINAS DO MUNDO (menu de navegação do topo)                          */
/* `action` é o nome de uma função global em app.js a ser chamada ao     */
/* clicar. Páginas com `available: false` aparecem desabilitadas com a   */
/* etiqueta "Em breve" — basta trocar para `true` quando a página existir.*/
/* ---------------------------------------------------------------------- */

const NAV_PAGES = [
  { icon: "📖", label: "Glossário & Tutoriais", available: true,  action: "openGlossary" },
  { icon: "🐺", label: "Bestiário",             available: true,  action: "openBestiary" },
  { icon: "⚗️", label: "Alquimia & Crafting",   available: true,  action: "openCraft" },
  { icon: "📋", label: "Planejador de Sessão",  available: true,  action: "openSessionPlanner" },
  { icon: "🗺", label: "História do Mundo",     available: true,  action: "openHistory" },
  { icon: "📅", label: "Acompanhamento",        available: true,  action: "openCampaignLog" },
  { icon: "🏰", label: "Locais & Reinos",       available: true,  action: "openLocations" },
  { icon: "🗾", label: "Mapa de Aether",        available: true,  action: "openMap" },
  { icon: "⚔",  label: "Campo de Batalha",      available: true,  action: "openBattleMap" },
  { icon: "📄", label: "Ficha para Impressão",  available: true,  action: "openPrintSheet" }
];

/* ---------------------------------------------------------------------- */
/* SISTEMA DE TESTES DE PERÍCIA                                           */
/* Cada teste define: quais atributos somam ao resultado base (attrKeys), */
/* se é "learned" (requer treinamento p/ +2) e, se combate, o efeito.   */
/* As 3 dificuldades são calculadas automaticamente:                      */
/*   Normal = 10 + bônus    Difícil = 5 + bônus    Crítico = 1 + bônus  */
/* ---------------------------------------------------------------------- */

const SKILL_TESTS = [

  /* ════════════════════════════════════════════════════════════
     TESTES DE PERÍCIA GERAL
     Role 1d20: resultado ≤ valor = sucesso
     Normal = 10 + soma(attrKeys) + 2 se aprendida
     Difícil = 5 + bônus  |  Crítico = 1 + bônus
     ════════════════════════════════════════════════════════════ */

  /* ── Sentidos ──────────────────────────────────────────────── */

  { name: "Percepção",
    icon: "👁", attrKeys: ["SAB"],
    desc: "Notar detalhes ocultos, detectar emboscadas e criaturas furtivas. Passivo — o Mestre pode pedir sem aviso.",
    example: "Perceber o bandido atrás das caixas; ouvir passos no corredor; notar que a parede tem timbre oco.",
    learned: true },

  { name: "Pressentimento",
    icon: "🌀", attrKeys: ["SAB"],
    desc: "Intuição pura — sentir que algo está errado mesmo sem evidências concretas. Resiste a ilusões que enganam os outros sentidos.",
    example: "Sentir que o negociante está mentindo; pressentir que a sala está vigiada mesmo sem ver ninguém.",
    learned: false },

  { name: "Investigação",
    icon: "🔍", attrKeys: ["INT", "AGI"],
    desc: "Examinar ativamente uma área em busca de pistas, decifrar textos, analisar evidências. Diferente de Percepção: é ativa e deliberada.",
    example: "Examinar cena de crime; decifrar mapa cifrado; notar que a poeira na mesa foi perturbada recentemente.",
    learned: true },

  { name: "Conhecimento",
    icon: "📚", attrKeys: ["INT"],
    desc: "Recordar fatos históricos, lendas, propriedades de criaturas, itens e reinos de Aether. Quanto maior o INT, mais se sabe.",
    example: "Saber que Magnalaga é sensível a vibrações; identificar o brasão da família Braun; reconhecer runas de Durrak.",
    learned: true },

  { name: "Arcanismo",
    icon: "✨", attrKeys: ["INT", "SAB"],
    desc: "Identificar magias, itens mágicos, runas, criaturas arcanas e fenômenos sobrenaturais. Essencial para Magos e Clérigos.",
    example: "Identificar encantamento numa espada; reconhecer que a criatura é um Golem da Marca; sentir aura de portal.",
    learned: true },

  /* ── Social ────────────────────────────────────────────────── */

  { name: "Lábia",
    icon: "🗣", attrKeys: ["SAB", "DEX"],
    desc: "Convencer, enganar ou manipular por palavras — tanto honestidade estratégica quanto mentira direta. DEX reflete controle da linguagem corporal.",
    example: "Fingir ser mercador; convencer o guarda de que o grupo tem autorização; mentir sem suar frio.",
    learned: true },

  { name: "Persuasão",
    icon: "🤝", attrKeys: ["SAB"],
    desc: "Negociar de boa fé, fazer pedidos razoáveis e ganhar confiança com argumentos honestos e diplomacia.",
    example: "Negociar preço justo; convencer o guarda a deixar o grupo entrar; inspirar aldeões assustados.",
    learned: true },

  { name: "Intimidação",
    icon: "😤", attrKeys: ["FOR", "SAB"],
    desc: "Impor presença física ou psicológica para forçar cooperação pelo medo. FOR para ameaça física, SAB para pressão mental.",
    example: "Fazer mercenários recuarem; ameaçar informante; fazer inimigo hesitar antes de atacar.",
    learned: false },

  /* ── Furtividade e Destreza ────────────────────────────────── */

  { name: "Furtividade",
    icon: "🌑", attrKeys: ["AGI", "DEX"],
    desc: "Mover-se silenciosamente e permanecer oculto de observadores. AGI para movimento suave, DEX para ações manuais silenciosas.",
    example: "Passar pela guarda dormindo; abrir porta sem barulho; seguir alvo pela cidade sem ser visto.",
    learned: true },

  { name: "Acrobacia",
    icon: "🤸", attrKeys: ["AGI", "DEX"],
    desc: "Equilíbrio em superfícies instáveis, escapar de agarrões, rolar para esquivar, saltar com precisão.",
    example: "Caminhar sobre viga estreita; escapar de agarrão; rolar sob golpe de gigante; cruzar telhados.",
    learned: false },

  /* ── Físico ────────────────────────────────────────────────── */

  { name: "Atletismo",
    icon: "💪", attrKeys: ["FOR", "AGI"],
    desc: "Escalar, nadar, correr longas distâncias, arrombar portas, saltar distâncias e sustentar esforço físico.",
    example: "Escalar muralha com armadura; nadar contra correnteza; arrebentar correntes; carregar aliado incapacitado.",
    learned: false },

  { name: "Resistência",
    icon: "🦾", attrKeys: ["FOR"],
    desc: "Resistir a venenos, doenças, fadiga, tortura e efeitos físicos debilitantes pela dureza do corpo.",
    example: "Resistir ao veneno da Cobra Constritora; continuar lutando com febre; sobreviver 3 dias sem comida.",
    learned: false },

  { name: "Força de Vontade",
    icon: "🧠", attrKeys: ["INT", "SAB"],
    desc: "Resistir a efeitos mentais, dominação, ilusões e pressão psicológica. SAB para intuição, INT para análise racional.",
    example: "Resistir ao Sussurro da Dúvida; não ceder ao Lamento da Banshee; ignorar ilusão de chamas.",
    example: "Resistir ao domínio de um Aralto; continuar lutando com 1 HP por pura obstinação.",
    learned: false },

  { name: "Briga",
    icon: "👊", attrKeys: ["FOR", "AGI"],
    desc: "Lutar sem armas: socas, agarrões, chaves e quedas. Diferente de Atletismo — é combate corporal sem equipamento.",
    example: "Agarrar e imobilizar um ladrão; dar soco certeiro num guarda; escapar de presa enquanto desarmado.",
    learned: false },

  /* ════════════════════════════════════════════════════════════
     PERÍCIAS DE COMBATE
     Cada uma concede uma vantagem passiva situacional em combate.
     Aprendida durante criação ou por progressão de nível.
     Não são habilidades ativas — ativam em momentos específicos.
     ════════════════════════════════════════════════════════════ */

  /* ── Geral ─────────────────────────────────────────────────── */

  { name: "Retaliar",
    icon: "↩", attrKeys: ["AGI", "DEX"],
    learned: true, combat: true,
    desc: "Ao esquivar com sucesso por 5 ou mais abaixo do valor (d20), pode gastar 1 Reação para atacar o agressor imediatamente. O ataque não pode ser defendido — apenas esquivado.",
    combatDesc: "Ao esquivar com d20 ≤ (Esquiva − 5): gasta 1 Reação para contra-atacar o agressor. O contra-ataque não pode ser defendido, apenas esquivado.",
    example: "Esquiva com valor 10, tira 3 no d20 (margem de 7 — acima de 5): Retaliar ativa. O Goblin não pode defender o contra-ataque." },

  { name: "Esquivar Rolar",
    icon: "🌀", attrKeys: ["AGI"],
    learned: true, combat: true,
    desc: "Passivo permanente: +2 na Chance de Esquiva enquanto não empunha arma de duas mãos pesada sem a perícia de Defesa com Armas Pesadas.",
    combatDesc: "Passivo: +2 na Chance de Esquiva (ex: base 10 → 12). Não ativa se estiver empunhando arma 2M pesada sem perícia.",
    example: "Esquiva base 10 → vira 12. Tiros de d20 ≤ 12 esquivam em vez de ≤ 10." },

  { name: "Foco de Combate",
    icon: "🎯", attrKeys: ["SAB", "INT"],
    learned: true, combat: true,
    desc: "1x por combate: ao errar um ataque (tirar acima da Chance de Acerto), pode imediatamente rerolar o dado e ficar com o melhor resultado.",
    combatDesc: "1x por combate, ao errar: rerola o d10 de ataque e usa o melhor resultado. Não gasta Ação — reativo ao erro.",
    example: "Chance de acerto 6, tira 7 (errou). Foco de Combate: rerola e tira 4 — acertou." },

  { name: "Guardião de Flanco",
    icon: "🛡", attrKeys: ["FOR", "SAB"],
    learned: true, combat: true,
    desc: "Passivo permanente: aliados em hexes adjacentes ao seu ganham +1 na Chance de Defesa enquanto você estiver consciente e de pé.",
    combatDesc: "Passivo: aliados adjacentes ganham +1 na Chance de Defesa (ex: 5 → 6 ou 6 → 7). Não requer Ação.",
    example: "O Clérigo ao seu lado defende com 6 ou menos em vez de 5 ou menos." },

  /* ── Armas de 1 Mão ────────────────────────────────────────── */

  { name: "Desarmamento",
    icon: "🤚", attrKeys: ["DEX", "AGI"],
    learned: true, combat: true,
    desc: "Ao acertar um ataque com arma de 1 mão e tirar 1 ou 2 no d10 (ataque crítico ou quase): em vez do dano normal, pode optar por desarmar — o alvo derruba a arma no hex.",
    combatDesc: "Ao tirar 1 ou 2 no d10 de ataque com arma de 1 mão: pode escolher Desarmar em vez de causar dano. Alvo derruba a arma no hex adjacente. Sem resistência — é uma consequência do golpe preciso.",
    example: "Tira 2 no d10 (acertou). Escolhe Desarmar: o Mago inimigo derruba o cajado. Sem ele, perde Canalizar." },

  { name: "Duelista",
    icon: "⚔", attrKeys: ["DEX", "SAB"],
    learned: true, combat: true,
    desc: "Passivo: ao empunhar arma de 1 mão com a mão secundária completamente livre (sem escudo, sem arma, sem item), ganha +1 na Chance de Defesa com a arma.",
    combatDesc: "Passivo: mão secundária totalmente vazia → +1 na Chance de Defesa com arma de 1 mão. Perde o bônus se colocar qualquer coisa na mão secundária.",
    example: "Espada na direita, nada na esquerda: Chance de Defesa 6 em vez de 5. Pega um escudo: volta para 5." },

  /* ── Armas de 2 Mãos ───────────────────────────────────────── */

  { name: "Defesa com Armas Pesadas",
    icon: "🗡🛡", attrKeys: ["FOR", "AGI"],
    learned: true, combat: true,
    mechanicalEffect: "enable_two_hand_defense",
    desc: "Sem esta perícia, armas de 2 mãos não podem ser usadas para defender. Com ela: o portador pode defender com arma 2M, perdendo −2 na Chance de Defesa por ataque defendido (em vez de ser impossível).",
    combatDesc: "Habilita defesa com armas de 2 mãos. Cada ataque defendido reduz a Chance de Defesa em −2 (armas 1M perdem −1, 2M perdem −2). Sem a perícia: tentativas de defesa com arma 2M são automaticamente ignoradas.",
    example: "Com Claymore: sem perícia → não pode defender. Com perícia → defende com 5, próxima defesa com 3, depois 1." },

  { name: "Varredura",
    icon: "🌪", attrKeys: ["FOR", "AGI"],
    learned: true, combat: true,
    desc: "Ao acertar com arma de 2 mãos e tirar 1 no d10 (acerto crítico), o golpe alcança automaticamente 1 inimigo adjacente ao alvo principal com metade do dano.",
    combatDesc: "Ao tirar 1 no d10 de ataque com arma 2M (crítico de acerto): 1 inimigo adjacente ao alvo também sofre metade do dano rolado. Sem custo de Ação extra — acontece automaticamente.",
    example: "Crítico com Claymore no Orc. A Varredura atinge o Goblin ao lado por metade do dano automaticamente." },

  { name: "Ímpeto Brutal",
    icon: "💥", attrKeys: ["FOR"],
    learned: true, combat: true,
    desc: "Ao se mover 3 ou mais hexes em linha reta e atacar no mesmo turno com arma de 2 mãos: o ataque causa +1d6 de dano de impacto. Automático — não requer declaração.",
    combatDesc: "Ao mover 3+ hexes em linha reta E atacar com arma 2M no mesmo turno: +1d6 de dano de impacto. O movimento e o ataque devem ser na mesma ação de turno.",
    example: "Avança 3 hexes em linha reta e ataca com Maul: automaticamente +1d6 de dano cinético de momentum." },

  /* ── Escudo ─────────────────────────────────────────────────── */

  { name: "Escudo Bash",
    icon: "🛡💥", attrKeys: ["FOR", "DEX"],
    learned: true, combat: true,
    desc: "Ao usar a Ação de defesa com escudo e tirar 1 no d10 (defesa crítica): em vez de apenas bloquear, pode usar o próprio escudo para atacar o agressor. Causa 1d4 de dano e o agressor perde 1 de Chance de Defesa naquela rodada.",
    combatDesc: "Ao tirar 1 no d10 de defesa com escudo (defesa crítica): além de bloquear, contra-ataca o agressor com 1d4 de dano e −1 na Chance de Defesa dele nesta rodada.",
    example: "Defende com escudo, tira 1 no d10 (crítico de defesa). Bash: bloqueia o golpe E dá martelada que fragiliza a próxima defesa do Orc." },

  { name: "Muralha Viva",
    icon: "🧱", attrKeys: ["FOR", "SAB"],
    learned: true, combat: true,
    desc: "Passivo: enquanto tiver escudo equipado e estiver de pé, aliados no mesmo hex ou adjacentes podem usar sua Chance de Defesa de escudo no lugar da própria Chance de Defesa (se a sua for maior).",
    combatDesc: "Passivo: aliados adjacentes com Chance de Defesa menor que a sua (com escudo) passam a usar a sua Chance de Defesa quando forem atacados enquanto você estiver no hex adjacente.",
    example: "Você tem escudo pesado (Chance de Defesa 6). O Bardo ao lado tem 5. Com Muralha Viva, o Bardo usa 6." },

  /* ── Arco e Distância ───────────────────────────────────────── */

  { name: "Tiro em Movimento",
    icon: "🏃🏹", attrKeys: ["DEX", "AGI"],
    learned: true, combat: true,
    desc: "Passivo: remove a penalidade de −1 na Chance de Acerto ao atirar à distância no mesmo turno em que se moveu. Normalmente mover e atirar aplica −1.",
    combatDesc: "Passivo: atirar à distância após se mover no mesmo turno não aplica a penalidade de −1 na Chance de Acerto.",
    example: "Move 3 hexes e atira: Chance de Acerto 5 normal em vez de 4 com a penalidade padrão." },

  { name: "Pressão de Distância",
    icon: "🎯🛡", attrKeys: ["DEX", "INT"],
    learned: true, combat: true,
    desc: "Passivo situacional: ao inimigo avançar em linha reta em direção ao portador estando a 4+ hexes, o portador pode imediatamente atirar nele 1 vez. O inimigo não pode defender esse tiro — apenas esquivar.",
    combatDesc: "Ao inimigo se mover em linha reta em direção a você estando a 4+ hexes: 1 tiro imediato, sem custo de Ação extra. O inimigo não pode defender — só esquivar.",
    example: "O Gigante avança em linha reta de 5 hexes. Pressão de Distância: tiro automático que ele não pode defender." },

  { name: "Tiro Preciso",
    icon: "🎯⭐", attrKeys: ["DEX", "SAB"],
    learned: true, combat: true,
    desc: "Ao não se mover no turno inteiro e usar todas as Ações de Combate para atirar no mesmo alvo: cada tiro adicional no mesmo alvo ganha +1d4 de dano acumulado (2º tiro +1d4, 3º tiro +2d4).",
    combatDesc: "Sem se mover no turno: cada tiro extra no mesmo alvo ganha +1d4 acumulado. 2º tiro: +1d4. 3º tiro: +2d4. Mover-se cancela o bônus.",
    example: "2 Ações de Combate, imóvel, mesmo alvo: 1º tiro dano normal. 2º tiro +1d4. Total de concentração." },

  /* ── Armas Mágicas ──────────────────────────────────────────── */

  { name: "Conjuração Rápida",
    icon: "⚡✨", attrKeys: ["INT", "DEX"],
    learned: true, combat: true,
    desc: "Passivo situacional: ao ser atacado por um inimigo que você já acertou neste combate com magia, pode usar o conhecimento da luta para defender com a magia ainda em execução — a Def.Mágica conta como +1 contra esse inimigo específico.",
    combatDesc: "Passivo: contra inimigos que você já acertou com magia neste combate, sua Def.Mágica conta como +1. Representa antecipação da resposta do adversário.",
    example: "Acertou Bola de Fogo no Orc. Nas rodadas seguintes, Def.Mágica contra esse Orc é +1." },

  { name: "Canalizar pelo Cajado",
    icon: "🪄", attrKeys: ["INT", "SAB"],
    learned: true, combat: true,
    desc: "Ao acertar um ataque físico com cajado, varinha ou arma mágica e tirar 1 ou 2 no d10: o portador pode escolher converter o dano físico em dano mágico do tipo da arma (fogo, gelo, raio), ignorando Def.Física e usando Def.Mágica no lugar.",
    combatDesc: "Ao tirar 1 ou 2 no d10 de ataque com arma mágica: pode converter o dano físico em dano mágico do tipo da arma. O dano ignora Def.Física e usa Def.Mágica no lugar.",
    example: "Cajado de Raio acerta (d10 = 2). Canalizar: dano vira elétrico, ignora a Def.Física 5 do Golem e usa Def.Mágica 2." },

  { name: "Foco Ampliado",
    icon: "🔮", attrKeys: ["INT"],
    learned: true, combat: true,
    desc: "Passivo permanente: magias de ataque com alcance até 4 hex têm o alcance aumentado em +2 hex. Magias de área têm o raio aumentado em +1 hex.",
    combatDesc: "Passivo: magias de alcance ≤4 hex ganham +2 hex de alcance. Magias de área ganham +1 hex de raio. Não afeta magias de toque.",
    example: "Bola de Fogo (raio 3 hex) passa a 4 hex. Raio de Gelo (alcance 4 hex) passa a 6 hex." }

];



/* ======================================================================
   BESTIÁRIO — compêndio de criaturas e inimigos
   difficulty: 1 (fraco) → 5 (chefe / especial)
   size: "pequeno" | "normal" | "grande" | "colossal"
   loot: [ { item, chance (0-100), qty } ]
   ====================================================================== */
const BESTIARY = [

  /* ──────────────────────────────────────────────────────────────────
     DIFICULDADE 1 — combates rápidos, baixa defesa
  ────────────────────────────────────────────────────────────────── */
  {
    id: "rato-das-ruinas", name: "Rato das Ruínas", difficulty: 1,
    attrs: {FOR:0,DEX:1,AGI:1,INT:0,SAB:0}, size: "pequeno",
    category: "Besta", location: ["Cidade", "Ruínas"],
    hp: 15, physDefense: 2, magDefense: 0, dodge: 12,
    actions: 2,
    damage: "1d4 (mordida)",
    abilities: [
      { name: "Enxame", desc: "Se houver 3 ou mais Ratos das Ruínas no mesmo hexágono, cada um causa +1 de dano extra." }
    ],
    spells: [],
    behavior: "Atacam em grupos, focam no alvo mais ferido. Fogem se o grupo perder metade dos membros.",
    loot: [
      { item: "Pele de Rato", chance: 70, qty: "1d2" },
      { item: "Ossos pequenos (componente alquímico)", chance: 20, qty: "1" }
    ]
  },

  {
    id: "goblin-batedeira", name: "Goblin Batedeira", difficulty: 1,
    attrs: {FOR:0,DEX:1,AGI:1,INT:0,SAB:0}, size: "pequeno",
    category: "Humanoide", location: ["Caverna", "Floresta", "Ruínas"],
    hp: 25, physDefense: 2, magDefense: 0, dodge: 13,
    actions: 2,
    damage: "1d6 (faca enferrujada)",
    abilities: [
      { name: "Fuga Covarde", desc: "Se ficar abaixo de 5 HP, usa sua Ação de Movimento para correr, ignorando Ataques de Oportunidade." },
      { name: "Golpe Sujo", desc: "Uma vez por combate: ataque que aplica -1 na Chance de Acerto do alvo por 1 rodada (areia nos olhos, etc.)." }
    ],
    spells: [],
    behavior: "Preferem emboscadas. Raramente lutam honestamente — jogam objetos, criam distrações. Fogem se o líder cair.",
    loot: [
      { item: "Moedas de Bronze", chance: 60, qty: "1d6" },
      { item: "Faca enferrujada (arma comum danificada)", chance: 40, qty: "1" },
      { item: "Bugigangas sem valor", chance: 30, qty: "1d3" }
    ]
  },

  {
    id: "lobo-comum", name: "Lobo Comum", difficulty: 1,
    attrs: {FOR:1,DEX:0,AGI:1,INT:0,SAB:1}, size: "normal",
    category: "Besta", location: ["Floresta", "Montanha", "Planície"],
    hp: 30, physDefense: 2, magDefense: 0, dodge: 13,
    actions: 2,
    damage: "1d6+1d4 (mordida)",
    abilities: [
      { name: "Derrubada por Mordida", desc: "Ao acertar, o alvo testa Resistência (normal) ou cai Prostrado por 1 rodada." },
      { name: "Farejador", desc: "+1d4 em testes de Percepção baseados em olfato. Não pode ser surpreendido por criaturas que estejam a favor do vento." }
    ],
    spells: [],
    behavior: "Caçam em matilha. Um lobo distrai, os outros flanqueiam. Recuam se o Alfa for derrotado.",
    loot: [
      { item: "Pele de Lobo", chance: 65, qty: "1" },
      { item: "Presa de Lobo (material)", chance: 40, qty: "1d2" },
      { item: "Coração de Lobo (reagente raro)", chance: 10, qty: "1" }
    ]
  },

  {
    id: "serpente-comum", name: "Serpente Venenosa", difficulty: 1,
    attrs: {FOR:0,DEX:1,AGI:1,INT:0,SAB:0}, size: "pequeno",
    category: "Besta", location: ["Dungeon", "Floresta", "Pântano", "Ruínas", "Templo"],
    hp: 20, physDefense: 2, magDefense: 1, dodge: 13,
    actions: 2,
    damage: "1d4 (mordida) + Veneno: 1d4 por rodada, 2 rodadas",
    abilities: [
      { name: "Veneno Paralisante", desc: "O veneno pode causar -1 Movimento por rodada (cumulativo, máx. -2). Testa Resistência (normal) para resistir a cada aplicação." },
      { name: "Furtividade Natural", desc: "+1d4 em testes de Furtividade em ambientes naturais." }
    ],
    spells: [],
    behavior: "Atacam quando perturbadas ou com fome. Não perseguem alvos que fogem.",
    loot: [
      { item: "Veneno bruto (3 doses)", chance: 55, qty: "1" },
      { item: "Escamas de Serpente", chance: 45, qty: "1d4" },
      { item: "Presas (componente alquímico)", chance: 30, qty: "1" }
    ]
  },

  {
    id: "bandido-de-estrada", name: "Bandido de Estrada", difficulty: 1,
    attrs: {FOR:1,DEX:1,AGI:0,INT:0,SAB:0}, size: "normal",
    category: "Humanoide", location: ["Estrada", "Floresta", "Planície"],
    hp: 35, physDefense: 3, magDefense: 0, dodge: 11,
    actions: 2,
    damage: "1d8 (espada curta) ou 1d6 (arco curto, 8 hex)",
    abilities: [
      { name: "Rendição Tática", desc: "Se o grupo bandido perder 2/3 dos membros, os restantes podem se render e oferecer informações por misericórdia." }
    ],
    spells: [],
    behavior: "Pedem que vítimas se rendam antes de atacar. Preferem roubar a matar. Fogem em desvantagem numérica.",
    loot: [
      { item: "Moedas de Bronze", chance: 80, qty: "2d6" },
      { item: "Moedas de Prata", chance: 30, qty: "1d4" },
      { item: "Equipamento simples (espada, arco)", chance: 50, qty: "1" },
      { item: "Mapa de rota (pista de aventura)", chance: 15, qty: "1" }
    ]
  },

  /* ──────────────────────────────────────────────────────────────────
     DIFICULDADE 2 — combates equilibrados, alguma estratégia
  ────────────────────────────────────────────────────────────────── */
  {
    id: "guerreiro-cultista", name: "Guerreiro Cultista da Marca", difficulty: 2,
    attrs: {FOR:2,DEX:1,AGI:1,INT:0,SAB:1}, size: "normal",
    category: "Humanoide", location: ["Caverna", "Floresta", "Ruínas"],
    hp: 65, physDefense: 4, magDefense: 2, dodge: 12,
    actions: 2,
    damage: "1d8+1d4 (espada marcada)",
    abilities: [
      { name: "Frenesi da Marca", desc: "Ao ficar abaixo de 50% HP, entra em Frenesi: +1d4 de dano mas -1 na Chance de Defesa por 3 rodadas." },
      { name: "Símbolo de Intimidação", desc: "Tatuagens do Deus Marcado: inimigos que atacarem pela primeira vez testam Resistência (normal) ou ficam com -1d4 na Chance de Acerto por 1 rodada." }
    ],
    spells: [],
    behavior: "Fanáticos — não fogem, mesmo em desvantagem. Priorizam atacar conjuradores e curandeiros.",
    loot: [
      { item: "Moedas de Prata", chance: 50, qty: "1d6" },
      { item: "Símbolo do Deus Marcado (acessório simples)", chance: 40, qty: "1" },
      { item: "Carta cifrada (pista)", chance: 20, qty: "1" },
      { item: "Poção de Cura Menor (1d6)", chance: 15, qty: "1" }
    ]
  },

  {
    id: "lobo-das-trevas", name: "Lobo das Trevas", difficulty: 2,
    attrs: {FOR:2,DEX:1,AGI:2,INT:0,SAB:1}, size: "normal",
    category: "Besta Sombria", location: ["Caverna", "Floresta", "Planície"],
    hp: 60, physDefense: 4, magDefense: 2, dodge: 12,
    actions: 2,
    damage: "1d8+1d4 (mordida sombria)",
    abilities: [
      { name: "Mordida Sombria", desc: "Acertos aplicam Maldição Leve: -1d4 em todos os testes de Resistência por 2 rodadas." },
      { name: "Invisibilidade Sombria", desc: "Uma vez por combate: torna-se invisível por 1 rodada, ganhando vantagem no próximo ataque (+1d6 dano extra)." },
      { name: "Uivo Paralisante", desc: "1 Ação: todos os inimigos em raio 3 hex testam Resistência (normal) ou ficam Amedrontados por 1 rodada." }
    ],
    spells: [],
    behavior: "Criaturas de outro plano ligadas ao Deus Marcado. Atacam alvos solitários primeiro. Noturnos — +1d4 em todos os ataques à noite.",
    loot: [
      { item: "Pele Sombria (material raro)", chance: 45, qty: "1" },
      { item: "Essência das Trevas (reagente mágico)", chance: 30, qty: "1" },
      { item: "Coração de Lobo das Trevas (poderoso reagente)", chance: 15, qty: "1" }
    ]
  },

  {
    id: "sacerdote-cobra", name: "Sacerdote de Jurgmund", difficulty: 2,
    attrs: {FOR:1,DEX:1,AGI:1,INT:2,SAB:2}, size: "normal",
    category: "Humanoide", location: ["Cidade", "Dungeon", "Templo"],
    hp: 50, physDefense: 4, magDefense: 5, dodge: 12,
    actions: 2,
    damage: "1d6 (cajado sagrado)",
    abilities: [
      { name: "Bênção da Cobra", desc: "1 Ação: um aliado recupera 1d8 HP e fica imune a veneno por 2 rodadas." },
      { name: "Escamas Sagradas", desc: "Passivo: primeiro ataque físico de cada combate é reduzido em 1d6 (escudo místico)." }
    ],
    spells: [
      { name: "Nuvem de Veneno", desc: "Nível 2: área 3x3 hex; todos dentro sofrem 1d6 de veneno por rodada por 3 rodadas. Testa Resistência para sair da nuvem sem dano extra." }
    ],
    behavior: "Mantém distância e apoia aliados. Prioriza curar guerreiros do culto. Se sozinho, tenta negociar ou fugir.",
    loot: [
      { item: "Livro de Preces de Jurgmund (grimório nível 1)", chance: 35, qty: "1" },
      { item: "Frasco de Veneno Sagrado (2 doses)", chance: 40, qty: "1" },
      { item: "Moedas de Ouro", chance: 25, qty: "1d4" },
      { item: "Amuleto da Cobra (acessório comum)", chance: 20, qty: "1" }
    ]
  },

  {
    id: "golem-pedra", name: "Golem de Pedra Antiga", difficulty: 2,
    attrs: {FOR:3,DEX:0,AGI:0,INT:0,SAB:0}, size: "grande",
    category: "Construto", location: ["Dungeon", "Ruínas", "Templo"],
    hp: 100, physDefense: 7, magDefense: 1, dodge: 8,
    actions: 2,
    damage: "1d10+1d4 (soco de pedra)",
    abilities: [
      { name: "Casca Rochosa", desc: "Passivo: imune a veneno e doenças. Reduz dano cortante e perfurante em 2." },
      { name: "Golpe Devastador", desc: "Uma vez por combate: ataque que causa dano duplo e derruba o alvo (Prostrado, sem teste)." },
      { name: "Regeneração Rochosa", desc: "Recupera 2 HP por rodada enquanto estiver em contato com pedra ou terra." }
    ],
    spells: [],
    behavior: "Guardião programado — ataca qualquer intruso em sua área. Ignora ataques de veneno e magia de mente. Para se derrotado ou se os intrusos saírem do território.",
    loot: [
      { item: "Fragmento de Pedra Encantada (material)", chance: 70, qty: "1d3" },
      { item: "Núcleo de Golem (componente raro)", chance: 25, qty: "1" },
      { item: "Runa de Proteção (gravada na pedra)", chance: 15, qty: "1" }
    ]
  },

  /* ──────────────────────────────────────────────────────────────────
     DIFICULDADE 3 — inimigos fortes, possíveis chefes simples
  ────────────────────────────────────────────────────────────────── */
  {
    id: "alfa-matilha", name: "Lobo Alfa da Matilha", difficulty: 3,
    attrs: {FOR:3,DEX:2,AGI:3,INT:1,SAB:2}, size: "grande",
    category: "Besta", location: ["Floresta", "Montanha", "Planície"],
    hp: 135, physDefense: 7, magDefense: 2, dodge: 11,
    actions: 3,
    damage: "1d10+1d6 (mordida alfa)",
    abilities: [
      { name: "Comando da Matilha", desc: "Lobos aliados em raio de 6 hex ganham +1d4 de dano enquanto o Alfa estiver vivo." },
      { name: "Derrubada Poderosa", desc: "Ao acertar, teste de Resistência (difícil) ou o alvo fica Prostrado e Agarrado por 1 rodada." },
      { name: "Uivo de Guerra", desc: "1 Ação (1x/combate): todos os lobos aliados ganham 1 Ação extra neste turno." },
      { name: "Cicatrizes de Batalha", desc: "Passivo: ignora a primeira Condição negativa aplicada a ele em cada combate." }
    ],
    spells: [],
    behavior: "Comanda uma matilha de 3-6 lobos. Fica no centro-retaguarda inicialmente. Entra em combate direto se a matilha for reduzida a 2 ou menos. Defende seu território com a vida.",
    loot: [
      { item: "Pele de Alfa (material raro)", chance: 60, qty: "1" },
      { item: "Presas de Alfa (arma artesanal)", chance: 45, qty: "1d2" },
      { item: "Coração de Alfa (reagente lendário)", chance: 20, qty: "1" },
      { item: "Símbolo do Deus Marcado (Raro)", chance: 10, qty: "1" }
    ]
  },

  {
    id: "troll-das-cavernas", name: "Troll das Cavernas", difficulty: 3,
    attrs: {FOR:5,DEX:0,AGI:1,INT:0,SAB:1}, size: "grande",
    category: "Gigante", location: ["Caverna", "Dungeon", "Montanha"],
    hp: 160, physDefense: 7, magDefense: 1, dodge: 9,
    actions: 2,
    damage: "1d12+1d6 (garras) ou 1d10+1d4 (mordida)",
    abilities: [
      { name: "Regeneração Troll", desc: "Recupera 1d6 HP por rodada. Não regenera dano de fogo ou ácido. Se reduzido a 0 HP por dano normal, fica Inconsciente mas regenera até voltar." },
      { name: "Dois Ataques", desc: "Por turno: pode fazer 1 ataque de garras E 1 mordida como Ações separadas." },
      { name: "Arremesso", desc: "Alcance 4 hex: arremessa um alvo de tamanho normal ou menor causando 1d8 de dano de impacto." }
    ],
    spells: [],
    behavior: "Territorial e agressivo. Ataca o alvo mais próximo. A chave para derrotá-lo é usar fogo ou ácido para impedir a regeneração.",
    loot: [
      { item: "Pele de Troll (armadura artesanal)", chance: 55, qty: "1" },
      { item: "Bile de Troll (ácido, 2 doses)", chance: 40, qty: "1" },
      { item: "Dente de Troll (material resistente)", chance: 35, qty: "1d4" }
    ]
  },

  {
    id: "mago-renegado", name: "Mago Renegado de Atrelon", difficulty: 3,
    attrs: {FOR:0,DEX:1,AGI:1,INT:5,SAB:3}, size: "normal",
    category: "Humanoide", location: ["Dungeon", "Ruínas"],
    hp: 90, physDefense: 7, magDefense: 7, dodge: 11,
    actions: 2,
    damage: "1d8 (cajado) ou magias",
    abilities: [
      { name: "Barreira Arcana", desc: "Passivo: primeiro acerto de cada combate causa metade do dano (escudo mágico absorve)." },
      { name: "Teletransporte Curto", desc: "1 Ação de Reação (1x/combate): move-se instantaneamente até 4 hex quando atingido." },
      { name: "Amplificação", desc: "Uma vez por combate: próxima magia causa dano dobrado." }
    ],
    spells: [
      { name: "Raio Relâmpago", desc: "Nível 2: linha de 6 hex, 2d8 de dano elétrico, alvo testa Resistência ou fica Atordoado por 1 rodada." },
      { name: "Bola de Fogo", desc: "Nível 3: área 3x3 hex, 3d6 de dano de fogo. Resistência reduz à metade." },
      { name: "Escudo Arcano", desc: "Nível 1 (Reação): +1d6 de Defesa Mágica por 1 rodada." }
    ],
    behavior: "Mantém distância máxima. Prioriza conjuradores adversários. Usa Teletransporte para escapar se ficar abaixo de 20 HP. Pode negociar se encurralado.",
    story: "Sobrevivente da queda de Atrelon, corrompido pelo tempo e pelo isolamento. Busca o Cajado da Tormenta para restaurar o que perdeu.",
    loot: [
      { item: "Grimório Arcano (magias Nível 1-2)", chance: 55, qty: "1" },
      { item: "Varinha Encantada (arma mágica)", chance: 30, qty: "1" },
      { item: "Moedas de Ouro", chance: 60, qty: "2d8" },
      { item: "Componentes Mágicos Raros", chance: 35, qty: "1d4" },
      { item: "Fragmento do Cajado da Tormenta (pista)", chance: 20, qty: "1" }
    ]
  },

  {
    id: "cobra-rainha-jovem", name: "Cobra-Rainha Jovem", difficulty: 3,
    attrs: {FOR:3,DEX:2,AGI:2,INT:2,SAB:2}, size: "grande",
    category: "Besta Sagrada", location: ["Dungeon", "Pântano", "Templo"],
    hp: 145, physDefense: 7, magDefense: 6, dodge: 11,
    actions: 3,
    damage: "1d10+1d4 (mordida venenosa) ou 1d8 (constrição)",
    abilities: [
      { name: "Veneno da Rainha", desc: "Mordida aplica Veneno da Rainha: 1d8 por rodada por 3 rodadas. Teste Resistência (difícil) para resistir a cada dose." },
      { name: "Constrição", desc: "Agarrão: ao invés de morder, pode enrolar e imobilizar alvo normal ou menor. Agarrado sofre 1d8 por rodada automaticamente." },
      { name: "Hipnose de Cobra", desc: "1 Ação de Magia: alvo visível a até 6 hex testa SAB (difícil) ou fica Paralisado por 1 rodada." },
      { name: "Escamas Iridescentes", desc: "Passivo: magias de nível 1 e 2 têm 50% de chance de simplesmente ricochetear." }
    ],
    spells: [],
    behavior: "Predador de topo. Usa hipnose para paralisar o alvo mais forte, depois constricta o segundo mais ameaçador. Retrocede se dois ou mais membros do grupo usarem fogo.",
    loot: [
      { item: "Veneno da Rainha (5 doses)", chance: 50, qty: "1" },
      { item: "Escamas Iridescentes (material lendário)", chance: 40, qty: "1d4" },
      { item: "Presas da Rainha (arma única)", chance: 20, qty: "1" },
      { item: "Cristal de Veneno Solidificado (acessório raro)", chance: 15, qty: "1" }
    ]
  },

  /* ──────────────────────────────────────────────────────────────────
     DIFICULDADE 4 — muito fortes, exigem estratégia
  ────────────────────────────────────────────────────────────────── */
  {
    id: "lobo-do-vazio", name: "Lobo do Vazio", difficulty: 4,
    attrs: {FOR:4,DEX:3,AGI:4,INT:2,SAB:3}, size: "grande",
    category: "Entidade do Vazio", location: ["Cemitério", "Floresta", "Templo"],
    hp: 195, physDefense: 8, magDefense: 8, dodge: 12,
    actions: 3,
    damage: "1d12+1d8 (mordida do vazio) + 1d6 dano de vazio",
    abilities: [
      { name: "Imunidade ao Plano Físico", desc: "Passivo: reduz dano de armas não-mágicas à metade. Somente armas mágicas, sagradas ou de prata causam dano total." },
      { name: "Passo do Vazio", desc: "Ação de Reação: ao ser alvo de um ataque, pode se teletransportar para qualquer posição a até 6 hex (1x por turno)." },
      { name: "Uivo do Fim", desc: "1 Ação (1x/combate): todos os inimigos em raio 8 hex testam SAB (difícil) ou ficam Aterrorizados por 2 rodadas (−1d6 em todos os ataques e defesas)." },
      { name: "Mordida da Alma", desc: "Acertos causam Corrupção do Vazio: alvo perde 1 ponto máximo de HP por rodada por 3 rodadas (permanente até curado com magia sagrada)." },
      { name: "Regeneração do Vazio", desc: "Recupera 1d8 HP por rodada. Para permanentemente se atingido por luz sagrada ou fogo divino." }
    ],
    spells: [],
    behavior: "Criatura entre planos, semi-corpórea. Não persegue sem propósito — é enviada pelo Deus Marcado ou atraída por Maldições abertas. Prioriza o alvo com mais poder arcano para consumir a energia.",
    story: "Lobos do Vazio não nascem — são criados quando o Deus Marcado concentra suficiente energia do plano liminar em um único ponto. Cada um carrega um fragmento da vontade do deus.",
    loot: [
      { item: "Essência do Vazio (reagente lendário, se capturada)", chance: 40, qty: "1" },
      { item: "Fragmento de Presa do Vazio (item ancestral-fragmento)", chance: 25, qty: "1" },
      { item: "Cristal de Alma Corroída", chance: 30, qty: "1d2" }
    ]
  },

  {
    id: "grande-sacerdote-cobra", name: "Grande Sacerdote de Jurgmund", difficulty: 4,
    attrs: {FOR:2,DEX:2,AGI:2,INT:6,SAB:5}, size: "normal",
    category: "Humanoide Elite", location: ["Dungeon", "Templo"],
    hp: 165, physDefense: 8, magDefense: 10, dodge: 12,
    actions: 3,
    damage: "1d8+1d4 (cetro sagrado) ou magias",
    abilities: [
      { name: "Proteção Divina", desc: "Passivo: imune a venenos e charmes. Primeiro dano de magia de cada combate é absorvido completamente." },
      { name: "Invocação da Serpente", desc: "1 Ação (2x/combate): invoca uma Cobra-Rainha Jovem que age na iniciativa do sacerdote." },
      { name: "Maldição da Serpente", desc: "Ação de Reação: ao ser atingido, amaldiçoa o atacante — -1d4 em todos os ataques por 3 rodadas." },
      { name: "Cura Sagrada de Jurgmund", desc: "1 Ação de Magia (2x/combate): recupera 2d8+SAB de HP (próprio ou aliado)." }
    ],
    spells: [
      { name: "Praga de Serpentes", desc: "Nível 4: área 5x5 hex; cobras invisíveis atacam todos os inimigos por 3 rodadas, 1d8 de veneno por rodada cada." },
      { name: "Olho de Jurgmund", desc: "Nível 3: um alvo visível testa SAB (difícil) ou fica Dominado por 3 rodadas." },
      { name: "Véu da Cobra", desc: "Nível 2: toda a área de batalha fica coberta por névoa leve; inimigos do sacerdote têm -1d4 na Chance de Acerto." }
    ],
    behavior: "Líder religioso que raramente combate pessoalmente — quando o faz, usa cobras invocadas como escudo. Nunca recua enquanto puder invocar servos. Se reduzido a 20 HP, tenta negociar um acordo sagrado.",
    story: "Um dos cinco Grandes Sacerdotes que mantêm o Pacto de Jurgmund com o mundo dos vivos. Derrotá-lo não o mata — ele renasce no templo em 30 dias, mais forte e mais ressentido.",
    loot: [
      { item: "Cetro da Cobra Dourada (arma mágica)", chance: 45, qty: "1" },
      { item: "Grimório Sagrado de Jurgmund (magias nível 3-4)", chance: 35, qty: "1" },
      { item: "Amuleto do Grande Sacerdote (acessório lendário)", chance: 25, qty: "1" },
      { item: "Moedas de Ouro e Platina", chance: 70, qty: "3d10 ouro + 1d6 platina" }
    ]
  },

  {
    id: "general-fantasma", name: "General Elyon — O Traidor Fantasma", difficulty: 4,
    attrs: {FOR:4,DEX:3,AGI:3,INT:4,SAB:4}, size: "normal",
    category: "Morto-Vivo Elite", location: ["Cemitério", "Dungeon", "Planície", "Ruínas"],
    hp: 180, physDefense: 8, magDefense: 9, dodge: 12,
    actions: 3,
    damage: "1d12+1d6 (Lâmina Partida — espectral) + 1d6 dano sagrado/profano",
    abilities: [
      { name: "Forma Espectral", desc: "Passivo: 50% de chance de ignorar qualquer ataque físico (o golpe o atravessa). Ataques mágicos e sagrados sempre acertam." },
      { name: "Julgamento do Traidor", desc: "1 Ação (1x/combate): 3d10 de dano sagrado em um alvo; se matar, o alvo se levanta como Guerreiro Espectral sob comando de Elyon." },
      { name: "Lamento do Campo de Batalha", desc: "Passivo: enquanto estiver vivo, todos os mortos em raio de 10 hex têm chance de se levantar como Zumbis (1d4 por rodada)." },
      { name: "Memória da Traição", desc: "1 Ação de Reação: ao ser atingido, revela a fraqueza mais profunda do atacante — -1d8 em todos os testes daquele personagem por 2 rodadas." }
    ],
    spells: [
      { name: "Exército dos Caídos", desc: "Nível 4 (1x/combate): levanta todos os mortos no campo de batalha como servos imediatos por 5 rodadas." }
    ],
    behavior: "Age com honra — nunca ataca adversários que estejam prostrados ou feridos ao extremo. Busca combate nobre. Pode ser convencido a poupar o grupo se alguém aceitar um Julgamento de Combate singular.",
    story: "O general Elyon serviu ao Deus Marcado até trair seu senhor para proteger civis durante a Grande Invasão. Como punição, foi preso entre o mundo dos vivos e dos mortos, obrigado a guardar os campos onde caiu. Ele anseia pela morte verdadeira mas não pode se matar — apenas um golpe dado com a Lâmina Partida pode libertá-lo.",
    loot: [
      { item: "Fragmento da Armadura de Elyon (material lendário)", chance: 60, qty: "1d2" },
      { item: "Diário do General (pista de missão)", chance: 80, qty: "1" },
      { item: "Moedas de Ouro Antigas (Era da Invasão)", chance: 50, qty: "2d12" },
      { item: "Chave do Cofre de Durrak", chance: 30, qty: "1" }
    ]
  },

  /* ──────────────────────────────────────────────────────────────────
     DIFICULDADE 5 — chefes, monstros especiais com lore profundo
  ────────────────────────────────────────────────────────────────── */
  {
    id: "lich-atrelon", name: "O Lich das Montanhas de Atrelon", difficulty: 5,
    attrs: {FOR:2,DEX:3,AGI:3,INT:10,SAB:7}, size: "normal",
    category: "Morto-Vivo Lendário", location: ["Dungeon", "Montanha"],
    hp: 255, physDefense: 9, magDefense: 14, dodge: 13,
    actions: 4,
    damage: "1d10+1d6 (toque gélido) ou magias",
    abilities: [
      { name: "Filactério do Gelo", desc: "Passivo: quando reduzido a 0 HP, o corpo se dissolve em névoa gélida. Regenera completamente em 1d4 dias no Filactério (item escondido). Deve-se destruir o Filactério primeiro para matar permanentemente." },
      { name: "Aura de Inverno Eterno", desc: "Passivo: todos os inimigos em raio 4 hex sofrem 1d4 de dano de frio por rodada e têm -1 no Movimento." },
      { name: "Resistência Lendária", desc: "3x por combate: ao ser afetado por uma Condição (Prostrado, Paralisado, etc.), pode ignorá-la automaticamente." },
      { name: "Absorção Arcana", desc: "Ao ser atingido por magia de frio, cura HP equivalente ao dano ao invés de sofrer." }
    ],
    spells: [
      { name: "Nevasca de Atrelon", desc: "Nível 5: todo o campo de batalha vira Terreno Difícil, 1d6 de frio por rodada a todos os inimigos, por 5 rodadas. O mesmo efeito do Cajado da Tormenta." },
      { name: "Raio de Gelo Eterno", desc: "Nível 4: linha de 10 hex, 4d8 de frio. Alvo testa Resistência (difícil) ou fica Congelado (Imóvel) por 2 rodadas." },
      { name: "Invocar Mortos-Vivos", desc: "Nível 3 (a cada 2 rodadas): levanta 1d4 esqueletos que agem imediatamente." },
      { name: "Maldição do Invernos Sem Fim", desc: "Nível 5 (1x/combate): um alvo fica Amaldiçoado — perde 1d6 HP máximo por dia até a maldição ser quebrada por magia divina nível 4+." }
    ],
    behavior: "Inteligência superior — avalia o grupo antes de atacar. Prioriza eliminar conjuradores. Usa Nevasca como abertura do combate. Não negocia, mas pode interromper o combate para discursar sobre sua filosofia de morte e imortalidade.",
    story: "Antes chamado de Vaelris, o maior mago de Atrelon antes da queda da cidade. Fez um pacto com entidades do plano do gelo para viver além da morte e reconstruir o que foi destruído. O Cajado da Tormenta foi sua criação mais orgulhosa. Tem séculos de vida e guarda o segredo da queda de Atrelon — a cidade não foi destruída por invasores, mas por um experimento de Vaelris que saiu do controle.",
    loot: [
      { item: "Filactério de Gelo (deve ser destruído)", chance: 100, qty: "1" },
      { item: "Cajado da Tormenta (item único)", chance: 60, qty: "1" },
      { item: "Grimório de Atrelon (magias nível 4-5)", chance: 50, qty: "1" },
      { item: "Fragmento do Segredo de Atrelon (missão)", chance: 100, qty: "1" },
      { item: "Cristais de Gelo Eterno (material ancestral)", chance: 35, qty: "1d4" }
    ],
    isElite: true
  },

  {
    id: "cobra-imortal-jurgmund", name: "A Serpente Imortal de Jurgmund", difficulty: 5,
    attrs: {FOR:5,DEX:4,AGI:5,INT:7,SAB:8}, size: "colossal",
    category: "Divindade Menor", location: ["Dungeon", "Templo"],
    hp: 345, physDefense: 10, magDefense: 12, dodge: 13,
    actions: 4,
    damage: "2d12+1d8 (mordida colossal) ou 1d12+1d6 (cauda) ou 2d10 (constrição)",
    abilities: [
      { name: "Escamas Divinas", desc: "Passivo: imune a veneno, charme e medo. Dano de armas não-lendárias é reduzido em 3." },
      { name: "Três Ataques", desc: "Por turno: pode fazer mordida + cauda + constrição como ações separadas." },
      { name: "Veneno do Criador", desc: "Mordida injeta Veneno Divino: 2d8 por rodada por 5 rodadas. Somente magia de nível 4+ pode curar. Acumula." },
      { name: "Renovação Eterna", desc: "A cada 3 rodadas (automaticamente): recupera 2d10 HP. Para se atingida por uma arma Ancestral ou pelo Fogo Sagrado de Jurgmund." },
      { name: "Presença Divina", desc: "Passivo: ao entrar no combate, todos os inimigos testam SAB (difícil) ou ficam Prostrados por 1 rodada de temor." },
      { name: "Muda Sagrada", desc: "Uma vez (quando reduzida a 100 HP): troca completamente de escamas — recupera 50 HP, fica imune a dano por 1 rodada e remove todas as condições negativas." }
    ],
    spells: [
      { name: "Dilúvio de Veneno", desc: "Nível 5: toda a área 8x8 hex fica coberta de veneno por 3 rodadas. 2d6 de dano de veneno por rodada a todos os inimigos." },
      { name: "Olhar da Eternidade", desc: "Nível 4: um alvo testa SAB (crítico) ou fica petrificado permanentemente. Apenas um item Ancestral pode desfazer." }
    ],
    behavior: "Não é maligna — é a guardiã sagrada de Jurgmund. Ataca apenas quem profana o templo ou ameaça o culto. Pode ser pacificada por alguém que fale a Língua das Cobras ou que carregue um item sagrado de Jurgmund. Se pacificada, pode conceder uma bênção ou revelar um segredo do deus.",
    story: "A Serpente Imortal existia antes do próprio Jurgmund assumir sua forma divina. Quando o deus se tornou cobra, esta serpente o reconheceu como sua própria criatura e jurou-lhe lealdade eterna. Tem milênios de idade e guarda memórias do mundo antes dos humanos. Dizem que quem a vence em combate mas poupa sua vida recebe uma escama — material do qual os itens Ancestrais mais poderosos são feitos.",
    loot: [
      { item: "Escama Imortal (material ancestral — base para item Ancestral)", chance: 80, qty: "1" },
      { item: "Presas da Serpente Imortal (base para item Ancestral)", chance: 40, qty: "1" },
      { item: "Veneno Divino Concentrado (10 doses — reagente lendário)", chance: 55, qty: "1" },
      { item: "Bênção de Jurgmund (passiva permanente)", chance: 30, qty: "1" }
    ],
    isElite: true
  },

  {
    id: "deus-marcado-avatar", name: "Avatar do Deus Marcado", difficulty: 5,
    attrs: {FOR:8,DEX:5,AGI:5,INT:8,SAB:7}, size: "colossal",
    category: "Divindade — Avatar", location: ["Cemitério", "Templo"],
    hp: 400, physDefense: 12, magDefense: 15, dodge: 13,
    actions: 5,
    damage: "2d12+1d12 (garra divina) ou 3d10 (uivo sônico colossal)",
    abilities: [
      { name: "Presença Esmagadora", desc: "Passivo: qualquer criatura que entre no raio de 6 hex deve testar SAB (crítico) ou fica Aterrorizada pelo resto do combate (−1d8 em tudo)." },
      { name: "Invulnerabilidade Parcial", desc: "Passivo: imune a dano não-mágico. Dano mágico comum reduzido à metade. Somente armas Únicas ou Ancestrais causam dano total." },
      { name: "A Marca no Mundo", desc: "Passivo: a cada rodada, 1d4 aliados do Avatar aparecem (Lobos do Vazio, cultistas, Lobos das Trevas) até um máximo de 12 aliados simultâneos." },
      { name: "Resistência Divina", desc: "5x por combate: ignora qualquer efeito de Condição automaticamente." },
      { name: "Julgamento Divino", desc: "1 Ação (1x/combate): um alvo é banido para o Plano do Deus Marcado por 1d4 rodadas. Ao retornar, sofreu 4d10 de dano." },
      { name: "Regeneração Divina", desc: "Recupera 2d10 HP por rodada. Para apenas se confrontado com os 5 itens Ancestrais simultaneamente." }
    ],
    spells: [
      { name: "Crepúsculo da Marca", desc: "Nível 5 (1x/combate): escurece toda a região num raio de 1km por 1 hora. Dentro, todos os inimigos do Avatar ficam Cegos (−1d10 em ataques) e Lobos do Vazio ganham força dobrada." },
      { name: "Maldição Perpétua", desc: "Nível 5 (1x/combate): amaldiçoa permanentemente um alvo — a maldição só pode ser quebrada completando uma tarefa impossível designada pelo deus." }
    ],
    behavior: "O Avatar não é o deus em si — é uma fração de sua vontade materializada. Combate com inteligência suprema, adaptando-se constantemente. Nunca faz a mesma estratégia duas vezes. Pode falar durante o combate, fazendo ofertas e revelando segredos para criar divisão no grupo.",
    story: "O Avatar do Deus Marcado só se manifesta quando o equilíbrio entre Lobo e Cobra é rompido de forma catastrófica, ou quando alguém tenta destruir os fundamentos do Pacto que sustenta o mundo. Derrotá-lo não mata o deus — apenas força seu retorno ao plano divino por uma geração. Para matá-lo permanentemente, seria necessário reunir os 5 itens Ancestrais e realizar o Ritual do Fim da Marca — um conhecimento perdido.",
    loot: [
      { item: "Fragmento de Divindade (item de missão)", chance: 100, qty: "1" },
      { item: "Símbolo do Deus Marcado — Verdadeiro (acessório ancestral)", chance: 50, qty: "1" },
      { item: "Pele da Marca (material ancestral)", chance: 40, qty: "1" },
      { item: "Conhecimento Proibido (a localização de 1 item Ancestral)", chance: 100, qty: "1" }
    ],
    isElite: true
  },

  /* ── MONSTROS DO MUNDO DE AETHER (história integrada) ─────────── */

  /* --- Dif 1: Encontros comuns do mundo --- */
  {
    id: "karlac-filhote", name: "Karlac Filhote", difficulty: 1,
    attrs: {FOR:1,DEX:0,AGI:1,INT:0,SAB:0}, size: "pequeno",
    category: "Besta de Fogo", location: ["Deserto"],
    hp: 25, physDefense: 3, magDefense: 0, dodge: 12,
    actions: 2,
    damage: "1d6 (mordida ígnea)",
    abilities: [
      { name: "Pele Quente", desc: "Qualquer criatura que atacar corpo a corpo recebe 1d4 de dano de fogo ao acertar (o calor da pele queima quem toca)." },
      { name: "Rastreador de Calor", desc: "Não pode ser surpreendido por criaturas que emitem calor corporal (quase todos os seres vivos). +1d4 em testes de Percepção." }
    ],
    spells: [],
    behavior: "Filhotes da grande salamandra Karlac, nascidos do calor do deserto e dos restos do Deus Marcado absorvidos pela mãe. Atacam em grupo qualquer coisa que invada o raio de 200m de Karlac. Fogem se a mãe se mover para longe.",
    story: "Os Karlacs (povo) não sabem exatamente quando os filhotes apareceram — os primeiros foram vistos 80 anos após a Grande Salamandra iniciar seus círculos. A teoria mais aceita é que a salamandra reproduz-se pelo calor do deserto, usando o solo carmesim como incubadora.",
    loot: [
      { item: "Escama de Filhote Karlac (resistente ao fogo)", chance: 70, qty: "1d4" },
      { item: "Dente Ígneo (componente alquímico)", chance: 40, qty: "1d2" }
    ]
  },
  {
    id: "serpentariano-patrulheiro", name: "Serpentariano Patrulheiro", difficulty: 1,
    attrs: {FOR:1,DEX:1,AGI:1,INT:0,SAB:0}, size: "normal",
    category: "Humanoide Serpentariano", location: ["Dungeon", "Montanha", "Ruínas"],
    hp: 30, physDefense: 3, magDefense: 1, dodge: 13,
    actions: 2,
    damage: "1d6 (lança de osso) ou 1d4 (mordida venenosa)",
    abilities: [
      { name: "Mordida Venenosa", desc: "Ataque de mordida aplica veneno fraco: 1d4 por rodada por 2 rodadas. Resistência (normal) cancela." },
      { name: "Visão Termal", desc: "Enxerga em escuro total usando calor corporal. Não pode ser enganado por invisibilidade mágica se o alvo emitir calor." }
    ],
    spells: [],
    behavior: "Guardiões do perímetro do Castelo da Cobra. Não atacam imediatamente — tentam identificar a intenção do visitante primeiro. Somente atacam ao receber ordem ou ao detectar comportamento hostil. Atualmente mais agressivos por influência do Aralto Sussurrante sobre o Rei Vassk.",
    loot: [
      { item: "Escama Serpentariana (material)", chance: 60, qty: "1d3" },
      { item: "Lança de Osso (arma comum)", chance: 50, qty: "1" },
      { item: "Insígnia de Patrulha (pode facilitar acesso ao Castelo)", chance: 20, qty: "1" }
    ]
  },

  /* --- Dif 2: Encontros intermediários --- */
  {
    id: "anao-do-casco", name: "Anão Guardião do Casco", difficulty: 2,
    attrs: {FOR:3,DEX:1,AGI:0,INT:1,SAB:1}, size: "normal",
    category: "Humanoide Anão", location: ["Dungeon", "Pântano"],
    hp: 70, physDefense: 6, magDefense: 2, dodge: 10,
    actions: 2,
    damage: "1d10+1d4 (machado do casco)",
    abilities: [
      { name: "Âncora de Combate", desc: "Passivo: imune a qualquer efeito de empurrão, derrubada ou movimento forçado. Somos construídos para ficar de pé quando tudo se move." },
      { name: "Alarme de Mergulho", desc: "Se detectar perigo de mergulho iminente de Magnalaga (qualquer tremor no chão), emite grito de alerta que acelera o fechamento hermético da cidadela. Todos os aliados em raio 10 hex são avisados." },
      { name: "Fúria do Casco", desc: "Ao ver um aliado anão cair, ganha +1d6 de dano nos próximos 2 turnos." }
    ],
    spells: [],
    behavior: "Guardiões severos e pragmáticos da Cidadela do Casco. Não negociam com quem tenta entrar sem autorização. Respeitam força demonstrada e objetividade — enrolação os irrita. Se o combate ocorrer durante um mergulho de Magnalaga, ficam mais nervosos e menos dispostos a negociar.",
    loot: [
      { item: "Pedra Viva do Casco (material único)", chance: 40, qty: "1" },
      { item: "Machado do Casco (arma rara)", chance: 25, qty: "1" },
      { item: "Cerveja Anã do Casco (3 doses — resistência a dano aquático)", chance: 55, qty: "1" }
    ]
  },
  {
    id: "criatura-profundezas", name: "Criatura das Profundezas do Lago", difficulty: 2,
    attrs: {FOR:2,DEX:1,AGI:1,INT:0,SAB:2}, size: "normal",
    category: "Aberração Aquática", location: ["Pântano"],
    hp: 65, physDefense: 4, magDefense: 4, dodge: 12,
    actions: 3,
    damage: "1d8 (tentáculo) ou 1d6 (mordida ácida)",
    abilities: [
      { name: "Bioluminescência Hipnótica", desc: "1 Ação: emite padrão de luz. Alvos visíveis que falhem em SAB (normal) ficam Fascinados por 1 rodada (não podem atacar a criatura, apenas observar)." },
      { name: "Adaptação Pós-Contaminação", desc: "Imune a veneno e doenças. Resistência a dano mágico (reduz à metade)." },
      { name: "Agarrar com Tentáculo", desc: "Ao acertar, o alvo fica Agarrado automaticamente. Enquanto Agarrado, sofre 1d6 de ácido por rodada." }
    ],
    spells: [],
    behavior: "Evoluíram nas profundezas contaminadas durante 500 anos. Não são naturalmente agressivas — atacam quando perturbadas ou com fome. A contaminação da batalha as tornou parcialmente mágicas: podem perceber intenções hostis antes de qualquer ação.",
    story: "Konn, o Mergulhador Lendário, acredita que essas criaturas são os guardadores involuntários da Fissura no fundo do lago. Algumas são tão antigas que talvez tenham memórias da Batalha Colossal.",
    loot: [
      { item: "Essência Bioluminescente (componente alquímico)", chance: 55, qty: "1d3" },
      { item: "Tentáculo Conservado (material)", chance: 35, qty: "1" },
      { item: "Fragmento de Memória (cristal — contém imagem da Batalha Colossal, 10%)", chance: 10, qty: "1" }
    ]
  },
  {
    id: "cultista-aralto", name: "Cultista do Aralto", difficulty: 2,
    attrs: {FOR:1,DEX:1,AGI:1,INT:1,SAB:2}, size: "normal",
    category: "Humanoide Corrompido", location: ["Deserto", "Floresta", "Montanha", "Planície"],
    hp: 60, physDefense: 4, magDefense: 3, dodge: 12,
    actions: 2,
    damage: "1d8+1d4 (espada marcada pelo Deus Marcado)",
    abilities: [
      { name: "Marca do Deus", desc: "A tatuagem da Marca no peito: ao atingir 0 HP, pode gastar a Marca para recuperar 1d8 HP uma única vez no combate (os olhos ficam pretos por 1 rodada)." },
      { name: "Transmissão da Corrupção", desc: "Ao matar um aliado do grupo, esse aliado deve testar SAB (difícil) ou fica Corrompido: age contra o próprio grupo no próximo turno." }
    ],
    spells: [],
    behavior: "Humanos convertidos pelos Araltos. Vêm de todas as classes sociais — comerciantes, guardas, nobres. Identificáveis somente pela tatuagem da Marca, normalmente escondida. Fanáticos mas não estúpidos: fogem para preservar a rede quando em desvantagem, preferindo sobreviver e causar dano depois.",
    loot: [
      { item: "Carta cifrada para o Aralto (missão — revela plano)", chance: 40, qty: "1" },
      { item: "Símbolo do Deus Marcado (oculto)", chance: 80, qty: "1" },
      { item: "Veneno de Corrupção (2 doses)", chance: 30, qty: "1" }
    ]
  },

  /* --- Dif 3: Desafiadores --- */
  {
    id: "serpentariano-sacerdote", name: "Sacerdote Serpentariano da Cobra", difficulty: 3,
    attrs: {FOR:1,DEX:1,AGI:2,INT:4,SAB:4}, size: "normal",
    category: "Humanoide Serpentariano", location: ["Dungeon", "Montanha", "Ruínas"],
    hp: 115, physDefense: 7, magDefense: 8, dodge: 11,
    actions: 3,
    damage: "1d8 (cajado de cobra) ou magias",
    abilities: [
      { name: "Bênção de Jurgmund Corrupta", desc: "Passivo: aliados Serpentarianos em raio 4 hex ganham +1d4 de dano e são imunes a medo enquanto o sacerdote estiver vivo." },
      { name: "Escudo de Escamas", desc: "1 Reação: ao ser atingido por ataque físico, convoca escamas mágicas que absorvem 1d8+SAB de dano." },
      { name: "Hipnose da Cobra (Versão Corrompida)", desc: "1 Ação de Magia: alvo visível a até 8 hex testa SAB (difícil) ou fica Dominado por 2 rodadas. Diferente da versão sagrada original, não pode ser quebrado por dano." }
    ],
    spells: [
      { name: "Nuvem de Veneno Sagrado", desc: "Área 4x4 hex, 1d8 de veneno por rodada por 3 rodadas. Aliados Serpentarianos são imunes." },
      { name: "Invocação da Cobra de Jurgmund", desc: "Conjura 1d4 cobras sagradas (HP 12, dano 1d4+veneno) que agem no turno do sacerdote." }
    ],
    behavior: "Os sacerdotes acreditam genuinamente em Jurgmund mas suas orações foram sutilmente distorcidas pelo Aralto Sussurrante. Eles invocam cobras que são ligeiramente diferentes das cobras sagradas originais — mais agressivas, com veneno mais tóxico. O sacerdote não percebe a diferença.",
    loot: [
      { item: "Cajado Sagrado Corrupto (arma mágica — usável mas com efeito colateral)", chance: 35, qty: "1" },
      { item: "Veneno Serpentariano Sagrado (5 doses — mais potente que o normal)", chance: 50, qty: "1" },
      { item: "Texto das Orações Corrompidas (missão — prova da manipulação)", chance: 25, qty: "1" }
    ]
  },
  {
    id: "guardiao-fissura", name: "Guardião da Fissura", difficulty: 3,
    attrs: {FOR:4,DEX:1,AGI:1,INT:1,SAB:3}, size: "grande",
    category: "Aberração Aquática Ancestral", location: ["Pântano"],
    hp: 155, physDefense: 7, magDefense: 6, dodge: 11,
    actions: 3,
    damage: "1d12+1d6 (garra ancestral) ou 1d10 (jato de água pressurizada)",
    abilities: [
      { name: "Corpo de Água", desc: "Passivo: ataques cortantes e perfurantes causam metade do dano. Dano contundente normal. Magia de fogo causa dano dobrado." },
      { name: "Memória da Contaminação", desc: "Uma vez por combate: libera a energia contaminada absorvida há 500 anos. Área 3x3 hex centrada nele recebe efeito de Maldição — todos na área têm −1d6 em todos os testes por 3 rodadas." },
      { name: "Mergulho de Emergência", desc: "Se reduzido a menos de 30 HP, mergulha instantaneamente para 20m de profundidade como Reação gratuita. Só pode ser seguido por quem tem respiração aquática." }
    ],
    spells: [],
    behavior: "Criatura de 500 anos que evoluiu de algo menor durante a contaminação. Guarda a Fissura instintivamente — não por inteligência, mas porque é o que faz desde que existe. Não ataca quem não tenta se aproximar da Fissura. Se derrotado, a entrada da Fissura fica desprotegida.",
    story: "Konn o viu e nunca mais mergulhou. 'Não é uma criatura', ele disse. 'É uma decisão que o lago tomou de não ser explorado.'",
    loot: [
      { item: "Essência da Fissura (fragmento da energia da Batalha Colossal)", chance: 60, qty: "1" },
      { item: "Carapaça do Guardião (material único — absorve magia)", chance: 40, qty: "1" },
      { item: "Passagem para a Fissura (o acesso agora está livre)", chance: 100, qty: "—" }
    ]
  },
  {
    id: "aralto-menor", name: "Aralto da Marca — Forma Menor", difficulty: 3,
    attrs: {FOR:3,DEX:2,AGI:2,INT:3,SAB:3}, size: "normal",
    category: "Campeão do Deus Marcado", location: ["Deserto", "Floresta", "Montanha", "Planície"],
    hp: 145, physDefense: 7, magDefense: 7, dodge: 11,
    actions: 3,
    damage: "1d10+1d6 (lâmina da Marca) + 1d4 dano de vazio",
    abilities: [
      { name: "Presença Corrupta", desc: "Passivo: qualquer criatura que iniciar seu turno a 2 hex do Aralto deve testar SAB (normal) ou perde 1 Ação de Reação nessa rodada (a presença corrói a vontade)." },
      { name: "Forma Adaptada", desc: "O Aralto pode copiar a aparência de qualquer pessoa que já tocou. A cópia é perfeita visualmente mas falha em testes de INT (difícil) de quem o conhece bem." },
      { name: "Marca Transferida", desc: "1 Ação (2x/combate): ao acertar, transfere um fragmento da Marca para o alvo — ele sofre 1d6 de dano no início de cada turno por 3 rodadas e fica com olhos levemente vermelhos." }
    ],
    spells: [
      { name: "Chamado do Vazio", desc: "Nível 3: invoca 1d4 Lobos das Trevas que agem imediatamente." }
    ],
    behavior: "Araltos são os campeões sobreviventes do Deus Marcado. Esta é a forma que assumem quando agem abertamente — normalmente preferem disfarces. Em combate, são calculistas e procuram dividir o grupo, atacar o mais fraco primeiro e usar a Forma Adaptada para criar confusão de identidade.",
    story: "Existem um número desconhecido de Araltos no mundo — os jogadores da campanha anterior enfrentaram alguns. Os que sobreviveram ficaram quietos por 500 anos, reconstruindo poder. Agora agem novamente.",
    loot: [
      { item: "Fragmento da Marca (material perigoso — contém energia do Deus Marcado)", chance: 70, qty: "1" },
      { item: "Lâmina da Marca (arma mágica corrompida)", chance: 45, qty: "1" },
      { item: "Registros do Aralto (missão — planos e outros Araltos)", chance: 60, qty: "1" }
    ]
  },

  /* --- Dif 4: Muito fortes, estratégia necessária --- */
  {
    id: "serpentariano-rei-vassk", name: "Rei Vassk — O Corrompido", difficulty: 4,
    attrs: {FOR:4,DEX:3,AGI:3,INT:5,SAB:5}, size: "normal",
    category: "Humanoide Serpentariano Elite", location: ["Dungeon", "Ruínas"],
    hp: 175, physDefense: 8, magDefense: 9, dodge: 12,
    actions: 3,
    damage: "1d12+1d8 (Espada da Cobra Real) + 1d6 veneno sagrado corrompido",
    abilities: [
      { name: "Aura do Rei Corrompido", desc: "Passivo: todos os Serpentarianos em raio 8 hex agem com +1 Ação extra por turno enquanto Vassk estiver consciente. Se cair, todos os aliados ficam Abalados por 1 rodada." },
      { name: "Escamas de Ouro Corrupto", desc: "Passivo: imune a veneno comum. Reduz dano de magia de cobra em 3. Mas vulnerável a Luz Sagrada ou a magias conjuradas com item de Jurgmund puro (+1d8 de dano)." },
      { name: "Comando da Cobra (Corrompido)", desc: "1 Ação (2x/combate): ordena que 1d4 Serpentarianos aliados façam um ataque imediato gratuito contra um alvo à sua escolha." },
      { name: "Liberdade da Marca", desc: "Condição especial: se os jogadores mostrarem as Provas das Atividades do Aralto (item de missão), Vassk para de lutar e pode ser aliado. Ele não sabia que estava sendo manipulado." }
    ],
    spells: [
      { name: "Veneno Real de Jurgmund (Corrupto)", desc: "Nível 4: 3d8 de dano de veneno numa área 3x3 hex. Aliados Serpentarianos são imunes." }
    ],
    behavior: "Luta para defender o que acredita ser a vontade de Jurgmund. Não é vilão — é vítima. Sob a influência do Aralto, é determinado e perigoso. Se libertado da influência (as provas), torna-se aliado poderoso e revela informações sobre o Aralto Sussurrante.",
    story: "Vassk foi um rei justo por 30 anos antes do Aralto aparecer. Sua filha, a Sacerdotisa Sss'era, foi a primeira a perceber a mudança nele mas não tem poder para confrontá-lo diretamente.",
    loot: [
      { item: "Espada da Cobra Real (arma lendária — se Vassk morrer)", chance: 80, qty: "1" },
      { item: "Coroa Serpentariana (acessório — autoridade sobre os Serpentarianos)", chance: 100, qty: "1" },
      { item: "Diário de Vassk (missão — registra quando o Aralto apareceu e o que prometeu)", chance: 100, qty: "1" }
    ],
    isElite: true
  },
  {
    id: "aralto-sussurrante", name: "O Aralto Sussurrante", difficulty: 4,
    attrs: {FOR:3,DEX:3,AGI:4,INT:6,SAB:5}, size: "normal",
    category: "Campeão do Deus Marcado — Elite", location: ["Dungeon", "Ruínas"],
    hp: 195, physDefense: 8, magDefense: 10, dodge: 12,
    actions: 3,
    damage: "1d12+1d6 (Garra de Vazio) + 1d8 dano de vazio",
    abilities: [
      { name: "Máscara Perfeita", desc: "Pode copiar qualquer pessoa vista. Testes de INT para identificar a cópia têm dificuldade Crítica (≤ 1+bônus). A máscara cai somente ao meio-dia (sem sombra) ou com magia de Revelar Ilusão." },
      { name: "Sussurro da Marca", desc: "Aura passiva: qualquer aliado do grupo em raio 4 hex que falhe em SAB (difícil) no início do turno recebe uma 'sugestão' do Aralto — pode atacar o aliado mais próximo." },
      { name: "Passo do Vazio", desc: "Pode se teletransportar para qualquer ponto visível como Ação de Reação. Usa 1x por turno." },
      { name: "Forma Real", desc: "Quando reduzido a 50% HP, abandona o disfarce e revela sua forma real — Lobo colossal de sombra. Ganha +2 Ações e +1d10 de dano por 3 rodadas." }
    ],
    spells: [
      { name: "Invocação do Vazio", desc: "Nível 4 (1x/combate): invoca um Lobo do Vazio imediatamente." },
      { name: "Corrupção em Cascata", desc: "Nível 3: um alvo fica Corrompido permanentemente até curado com magia sagrada nível 3+. Corrompido: sofre 1d6 por turno e tem 20% de chance de atacar aliados." }
    ],
    behavior: "Age sempre de trás das cortinas quando possível. Em combate direto, prioriza criar confusão — Sussurro da Marca pode fazer o grupo lutar entre si. Usa Forma Real apenas quando encurralado. Se capturado em vez de morto, pode ser interrogado sobre outros Araltos e o plano maior.",
    story: "Um dos Araltos originais — estava presente na Batalha Colossal e fugiu antes do fim. 500 anos de espera o tornaram paciente e sádico. Considera a manipulação de Vassk sua obra-prima.",
    loot: [
      { item: "Máscara do Aralto (item único — permite copiar rostos uma vez)", chance: 60, qty: "1" },
      { item: "Diário do Aralto Sussurrante (missão — lista todos os Araltos e seus locais)", chance: 80, qty: "1" },
      { item: "Essência do Vazio (reagente lendário)", chance: 45, qty: "1d2" },
      { item: "Fragmento da Marca Real (material ancestral)", chance: 30, qty: "1" }
    ],
    isElite: true
  },

  /* --- Dif 5: Chefes únicos do mundo de Aether --- */
  {
    id: "grande-salamandra-karlac", name: "Grande Salamandra Karlac", difficulty: 5,
    attrs: {FOR:8,DEX:2,AGI:1,INT:2,SAB:2}, size: "colossal",
    category: "Criatura Colossal — Guardiã do Deserto", location: ["Deserto"],
    hp: 460, physDefense: 14, magDefense: 8, dodge: 8,
    actions: 4,
    damage: "3d12+1d10 (pisada) ou 2d12+1d8 (cauda) ou 2d10 (bafo de fogo)",
    abilities: [
      { name: "Corpo Colossal", desc: "Passivo: imune a condições de movimento forçado, derrubada e atordoamento. Ataques com armas não-lendárias causam no máximo 5 de dano por golpe." },
      { name: "Calor do Deus Marcado", desc: "Passivo: qualquer criatura em raio 4 hex sofre 1d6 de dano de fogo por turno automaticamente. Criaturas com resistência a fogo sofrem apenas 1d4." },
      { name: "Crescimento Contínuo", desc: "A cada 5 rodadas, Karlac ganha +2 em Defesa Física e +1d6 de dano (ela nunca para de crescer). Máx: +8 def e +3d6 dano no combate." },
      { name: "Consumir os Restos", desc: "Se houver fragmentos do Deus Marcado no campo de batalha (itens ou corpos de cultistas), Karlac os consome como Reação gratuita, recuperando 2d10 HP." },
      { name: "Não é Hostil por Natureza", desc: "Karlac não ataca sem ser provocada. Os Karlacs (povo) podem pacificá-la com rituais (teste SAB difícil + item sagrado do povo). Se pacificada, simplesmente ignora os aventureiros." }
    ],
    spells: [],
    behavior: "Karlac não é consciente da forma que humanos são conscientes — opera por instinto e fome (restos do Deus Marcado). Só ataca se diretamente ameaçada ou se alguém tentar interferir em seus círculos. Os Karlacs (povo) são a chave: com a ajuda deles, um confronto pode ser evitado completamente.",
    story: "Cresceu dos restos do Deus Marcado espalhados pelo deserto após a Batalha Colossal. Cada círculo que completa é um fragmento de energia absorvida. Quando absorver o último fragmento, ninguém sabe o que acontecerá — crescer indefinidamente, transmutar em algo novo, ou simplesmente parar.",
    loot: [
      { item: "Escama Maior de Karlac (material ancestral — base de armadura incomparável)", chance: 50, qty: "1" },
      { item: "Cristal de Calor Eterno (componente lendário)", chance: 40, qty: "1d3" },
      { item: "Memória de Karlac (cristal — contém 500 anos de absorção dos restos do Deus Marcado, informação crítica)", chance: 60, qty: "1" }
    ],
    isElite: true
  },
  {
    id: "dragao-dourado-karloth", name: "Dragão Dourado de Karloth", difficulty: 5,
    attrs: {FOR:7,DEX:4,AGI:4,INT:8,SAB:8}, size: "colossal",
    category: "Entidade Colossal — Guardião do Mundo", location: ["Montanha", "Planície"],
    hp: 575, physDefense: 16, magDefense: 16, dodge: 13,
    actions: 5,
    damage: "3d12+2d10 (garra/mordida) ou 4d10 (bafo de luz dourada, 8 hex de alcance)",
    abilities: [
      { name: "Presença Divina", desc: "Passivo: qualquer criatura dentro de 10 hex que não tenha intenção pura sofre Amedrontamento automático (−1d8 em tudo). Intenção pura: julgamento do Mestre. Aliados com objetivo nobre são imunes." },
      { name: "Invulnerabilidade Quase Total", desc: "Passivo: imune a todo dano não-mágico. Imune a veneno, doenças e efeitos de mente. Dano mágico reduzido a 1/4. Somente armas Ancestrais ou Únicas causam dano total." },
      { name: "Luz Dourada Curativa", desc: "1 Ação (a cada 3 rodadas): cura todos os aliados em raio 10 hex em 3d10 HP e remove qualquer Condição negativa." },
      { name: "Memória da Batalha", desc: "1 Ação (1x/combate): revela ao grupo uma visão da Batalha Colossal que revela a fraqueza do inimigo atual. Todos ganham +1d8 em ataques contra esse inimigo por 3 rodadas." },
      { name: "Não é um Encontro de Combate", desc: "O Dragão Dourado não luta com mortais. Se hostilizado por engano, simplesmente voa para longe. Só combate se literalmente não houver alternativa — e se isso acontecer, a situação já virou catástrofe global." }
    ],
    spells: [],
    behavior: "O Dragão não combate. Serve como oráculo e guardião passivo do equilíbrio. Pode ser encontrado no vulcão e conversado — em casos raríssimos e com abordagem correta (Xamã Erkha pode ajudar). Revela informações sobre os Araltos, os itens Ancestrais e a história da Batalha.",
    story: "A teoria mais aceita entre os sábios: o Dragão Dourado é a consciência de Jurgmund que ficou no mundo material enquanto o corpo da cobra partiu. Não confirma nem nega. Quando perguntado sobre sua origem, responde: 'Existo desde que existe algo a proteger.'",
    loot: [
      { item: "O Dragão nunca é derrotado em combate — seus presentes são dados voluntariamente", chance: 0, qty: "—" },
      { item: "Escama Dourada (dada voluntariamente a quem provar dignidade — material Ancestral)", chance: 100, qty: "1 (se digno)" },
      { item: "Chama da Memória (o dragão pode gravar uma informação em chama dourada que o grupo pode usar)", chance: 100, qty: "1 (se solicitado)" }
    ],
    isElite: true
  },
  {
    id: "magnalaga-acordada", name: "Tartaruga Magnalaga — Forma Acordada", difficulty: 5,
    attrs: {FOR:6,DEX:4,AGI:4,INT:9,SAB:8}, size: "colossal",
    category: "Ser Ancestral Transformado", location: ["Pântano"],
    hp: 435, physDefense: 15, magDefense: 12, dodge: 6,
    actions: 3,
    damage: "2d12+1d10 (mordida) ou 2d10 (jato d'água purgativa, 10 hex)",
    abilities: [
      { name: "Absorção Completa", desc: "Passivo: imune a veneno, ácido e qualquer efeito de contaminação. Se atingida por magia de água, cura HP em vez de sofrer dano." },
      { name: "Purificação do Jato", desc: "O jato d'água não é apenas dano — criaturas Corrompidas atingidas devem testar Resistência (difícil) ou são Purgadas (Corrupção removida mas ficam Atordoadas por 1 rodada)." },
      { name: "Casco Vivo", desc: "Passivo: a Cidadela Anã no dorso está protegida — dano a Magnalaga não afeta a Cidadela. Mas tremores por dano extremo (30+ em um golpe) causam estruturas da Cidadela caírem, prejudicando os anões." },
      { name: "Mergulho Total", desc: "1 Ação (1x/combate): mergulha para o fundo do lago. Qualquer criatura em seu dorso deve se segurar (AGI difícil) ou cai na água. Ressurge em 1d4 rodadas numa posição diferente." },
      { name: "Não é Hostil", desc: "Magnalaga não ataca ninguém que não tente atacá-la ou a Cidadela. Se algo ameaçar a Cidadela, reage com força total." }
    ],
    spells: [],
    behavior: "Magnalaga está 'acordando' — seus movimentos ficaram mais frequentes e ela começa a exibir comportamento mais consciente. Este encontro provavelmente ocorre se os jogadores tentam entrar na Fissura do fundo do lago sem permissão dos anões, ou se algo ameaça a Cidadela. Pode ser apaziguada pelo Rei Burrak com rituais específicos.",
    story: "Uma tartaruga comum que estava no fundo do lago quando a Batalha Colossal abriu a Fissura e contaminou as águas. Absorveu toda a contaminação por 500 anos e se transformou em algo completamente novo. Os anões acreditam que ela está acordando porque a contaminação que absorveu está sendo 'digerida' — e o que vai acontecer depois ninguém sabe.",
    loot: [
      { item: "Pedra do Casco Vivo (material ancestral — propriedades de purificação)", chance: 50, qty: "1d2" },
      { item: "Água Purgativa Coletada (cura qualquer veneno ou corrupção)", chance: 40, qty: "1d4 doses" },
      { item: "Memória da Contaminação (cristal — contém a experiência de absorver a batalha inteira)", chance: 35, qty: "1" }
    ],
    isElite: true
  },

  /* ══════════════════════════════════════════════════════════
     NOVOS MONSTROS — Categorias variadas
     ══════════════════════════════════════════════════════════ */

  /* ── MORTOS-VIVOS ── */
  { id:"zumbi-comum", name:"Zumbi Comum", difficulty:1,
    attrs: {FOR:2,DEX:0,AGI:0,INT:0,SAB:0}, size:"normal", category:"Morto-Vivo",
    location: ["Cemitério", "Dungeon", "Ruínas"], hp:50, physDefense:2, magDefense:0, dodge:8,
    actions:1, damage:"1d6 (mordida podre)",
    abilities:[
      { name:"Infatigável", desc:"Imune a Atordoado, Exaustão e Medo. Nunca foge." },
      { name:"Mordida Infecciosa", desc:"Acerto: alvo testa FOR (normal) ou fica Envenenado (1d4 por rodada, 4 rodadas). Cura mágica ou antídoto remove." },
      { name:"Resistência Morta", desc:"Recebe metade do dano de armas cortantes e perfurantes. Dano contundente e fogo são normais." }
    ],
    spells:[],
    behavior:"Age em grupos de 3-8. Lento (Movimento 2) mas incansável. Avança em linha reta para o alvo mais próximo. Não tem táticas.",
    loot:[{item:"Nada de valor",chance:100,qty:"—"},{item:"Fragmento de roupa com pista",chance:15,qty:"1"}] },

  { id:"zumbi-abissal", name:"Zumbi Abissal", difficulty:3,
    attrs: {FOR:4,DEX:0,AGI:1,INT:0,SAB:1}, size:"normal", category:"Morto-Vivo",
    location: ["Dungeon", "Pântano"], hp:145, physDefense:7, magDefense:3, dodge:10,
    actions:2, damage:"1d10+1d6 (garras abissais)",
    abilities:[
      { name:"Aura de Corrupção", desc:"Passivo: aliados em raio 2 hex têm −1 em todos os testes enquanto a aura estiver ativa. Clérigos imunes." },
      { name:"Morte Explosiva", desc:"Ao chegar a 0 HP, explode em energia abissal: 2d8 dano sombrio a todos em raio 2 hex (SAB normal para metade)." },
      { name:"Regeneração Sombria", desc:"Recupera 5 HP por rodada enquanto estiver em terreno escuro ou área corrompida. Fogo sagrado cancela por 3 rodadas." },
      { name:"Garras que Rasgam o Véu", desc:"Ataques ignoram 3 pontos de Defesa Física (as garras tocam parcialmente o plano espiritual)." }
    ],
    spells:[],
    behavior:"Guardião territorial. Protege áreas corrompidas. Ataca o alvo com mais luz ou energia divina (odeia clérigos). Não foge — morre no posto.",
    loot:[{item:"Cristal Abissal (reagente)",chance:40,qty:"1"},{item:"Pedaço de Armadura Corrompida",chance:25,qty:"1"}] },

  { id:"esqueleto-guerreiro", name:"Esqueleto Guerreiro", difficulty:1,
    attrs: {FOR:1,DEX:1,AGI:0,INT:0,SAB:0}, size:"normal", category:"Morto-Vivo",
    location: ["Cemitério", "Dungeon", "Ruínas"], hp:30, physDefense:3, magDefense:0, dodge:11,
    actions:2, damage:"1d8 (espada enferrujada)",
    abilities:[
      { name:"Osso Vazio", desc:"Imune a veneno, dano psíquico e condições mentais. Vulnerável a dano contundente (+1d4 extra)." },
      { name:"Sem Dor", desc:"Nunca sofre penalidade por HP baixo. Luta com 100% de eficiência até 0 HP." }
    ],
    spells:[],
    behavior:"Guarda tumbas e tesouros sem pensar. Ataca qualquer vivo que entrar na área. Pode ser comandado por um necromante — obedece ordens simples.",
    loot:[{item:"Osso de Qualidade (material)",chance:60,qty:"1d4"},{item:"Moedas Antigas",chance:30,qty:"1d8"},{item:"Arma Enferrujada Recuperável",chance:20,qty:"1"}] },

  { id:"esqueleto-gigante", name:"Esqueleto Colossal", difficulty:4,
    attrs: {FOR:7,DEX:0,AGI:0,INT:0,SAB:0}, size:"colossal", category:"Morto-Vivo",
    location: ["Cemitério", "Dungeon", "Ruínas"], hp:210, physDefense:8, magDefense:2, dodge:9,
    actions:3, damage:"2d10+1d8 (golpe de osso colossal)",
    abilities:[
      { name:"Pisar Esmagador", desc:"1 Ação: pisa em área 2x2 hex. Todos nessa área sofrem 2d8 dano contundente e testam AGI (difícil) ou ficam Derrubados." },
      { name:"Tamanho Colossal", desc:"Ocupa 3 hexágonos. Não pode ser Derrubado ou Empurrado por meios mundanos (apenas magia de nível 3+)." },
      { name:"Fragmentar", desc:"Ao chegar a 50% HP, perde o braço direito: −1 Ação mas partes dos ossos tornam-se 1d4 Esqueletos Guerreiros ativos." },
      { name:"Ossos Encantados", desc:"Imune a dano cortante. Resistência a perfurante (−2 dano por dado). Fogo e magia sagrada causam dano normal." }
    ],
    spells:[],
    behavior:"Guardião de tumbas antigas. Ignora criaturas pequenas (goblins, ratos) mas ataca humanoides. Movimento lento (3 hexágonos) mas alcance de 2 hexágonos nos ataques.",
    loot:[{item:"Osso Ancestral Encantado",chance:70,qty:"1d3"},{item:"Cristal de Alma Aprisionada",chance:30,qty:"1"},{item:"Artefato da Tumba",chance:20,qty:"1"}] },

  { id:"vampiro-nobre", name:"Vampiro Nobre", difficulty:4,
    attrs: {FOR:4,DEX:4,AGI:4,INT:6,SAB:5}, size:"normal", category:"Morto-Vivo",
    location: ["Cidade", "Ruínas"], hp:180, physDefense:8, magDefense:7, dodge:12,
    actions:3, damage:"1d10+1d8 (mordida drenante)",
    abilities:[
      { name:"Mordida Drenante", desc:"Cada mordida rouba 1d8 HP do alvo e cura o vampiro pelo mesmo valor. Alvos drenados 3x seguidas ficam sob Domínio Parcial." },
      { name:"Névoa Carmesim", desc:"1x/combate: transforma-se em névoa por 2 rodadas — imune a dano físico, pode se mover por frestas. Ao retornar, regenera 2d8 HP." },
      { name:"Domínio do Olhar", desc:"1 Ação: alvo visível a até 6 hex testa Força de Vontade (difícil) ou fica Dominado por 2 rodadas (age sob comando do vampiro)." },
      { name:"Regeneração Noturna", desc:"Regenera 10 HP por rodada enquanto não estiver exposto a luz solar ou fogo sagrado. Clérigos podem cancelar com Luz Sagrada." },
      { name:"Fraqueza à Luz", desc:"Em luz solar direta ou sob Claridade de Aethea: −2 em todos os testes e sem regeneração." }
    ],
    spells:["Névoa da Mente (controle, nível 3)","Chamar Morcegos (invocação, nível 2)"],
    behavior:"Inteligente e calculista. Tenta dominar um aliado primeiro, depois negocia com os demais. Foge se chegar a 30% HP para regenerar. Nunca subestima — se os jogadores sobrevivem ao primeiro encontro, prepara emboscada melhor no próximo.",
    loot:[{item:"Coração de Vampiro (ingrediente)",chance:80,qty:"1"},{item:"Manto Nobre (item raro)",chance:50,qty:"1"},{item:"Anel de Sigilo (acessório mágico)",chance:30,qty:"1"},{item:"Moedas de Ouro Antigas",chance:90,qty:"2d20"}] },

  { id:"lobisomem", name:"Lobisomem", difficulty:3,
    attrs: {FOR:4,DEX:2,AGI:3,INT:1,SAB:2}, size:"grande", category:"Metamorfo",
    location: ["Cidade", "Floresta", "Montanha"], hp:170, physDefense:7, magDefense:3, dodge:11,
    actions:3, damage:"1d10+1d8 (garras e mordida)",
    abilities:[
      { name:"Regeneração Selvagem", desc:"Regenera 8 HP por rodada. Prata, fogo e magia sagrada cancelam a regeneração por 2 rodadas. Dano de prata causa 1d4 extra permanente (não regenera)." },
      { name:"Mordida Lycântropa", desc:"Humanoides mordidos testam FOR (crítico). Falha: ficam Envenenados com Lycantrofia — precisam de cura sagrada dentro de 1 hora ou transformam-se na próxima lua cheia." },
      { name:"Faro Perfeito", desc:"Imune a Furtividade. Detecta criaturas invisíveis ou em sombras em raio 8 hex. Não pode ser surpreendido." },
      { name:"Fúria Lunar", desc:"Se estiver em noite de lua cheia (Mestre determina): +2 Ações, +1d8 de dano e Fúria passiva (não pode se render)." }
    ],
    spells:[],
    behavior:"Durante o dia: pode ser um humano normal (NPC aliado ou inocente). À noite transforma-se involuntariamente. Em combate: ataca o inimigo mais frágil primeiro, tenta morder ao invés de matar (instinto de propagar a maldição).",
    loot:[{item:"Pele de Lobisomem (material raro)",chance:50,qty:"1"},{item:"Amuleto de Prata (do humano que era)",chance:30,qty:"1"}] },

  /* ── HUMANOIDES COM HABILIDADES ── */
  { id:"kobold-armadilheiro", name:"Kobold Armadilheiro", difficulty:1,
    attrs: {FOR:0,DEX:2,AGI:1,INT:1,SAB:0}, size:"pequeno", category:"Humanoide",
    location: ["Caverna", "Dungeon", "Floresta"], hp:25, physDefense:2, magDefense:1, dodge:13,
    actions:2, damage:"1d4+1d4 (faca e armadilha)",
    abilities:[
      { name:"Armadilheiro Expert", desc:"Prepara armadilhas durante o combate (1 Ação). A armadilha ativa no próximo alvo que cruzar o hex: 1d6 dano + Preso (FOR normal para escapar). Pode ter até 3 armadilhas ativas." },
      { name:"Fuga Tática", desc:"Se ficar abaixo de 50% HP, usa 1 Reação para mover 3 hex sem provocar ataque de oportunidade e desaparecer em pequenos túneis." },
      { name:"Enxame de Kobolds", desc:"Por cada Kobold aliado em raio 2 hex: +1d4 de dano e +1 na Esquiva (acumula até +3d4/+3)." }
    ],
    spells:[],
    behavior:"Covardes em combate direto mas perigosos em grupos e com preparação. Fogem ao primeiro sinal de desvantagem para buscar reforços. Adoram emboscadas e terrenos armadilhados.",
    loot:[{item:"Kit de Ferramentas de Armadilha",chance:50,qty:"1"},{item:"Moedas de Cobre",chance:80,qty:"1d6"},{item:"Pedra de Sílex Especial",chance:20,qty:"1d3"}] },

  { id:"orc-berserker", name:"Orc Berserker", difficulty:2,
    attrs: {FOR:3,DEX:1,AGI:0,INT:0,SAB:0}, size:"grande", category:"Humanoide",
    location: ["Estrada", "Floresta", "Planície"], hp:100, physDefense:4, magDefense:1, dodge:11,
    actions:3, damage:"1d12+1d6 (machado de guerra)",
    abilities:[
      { name:"Fúria do Sangue", desc:"Ao receber qualquer dano: entra em Fúria automaticamente por 3 rodadas. Em Fúria: +1d8 de dano mas não pode recuar nem usar itens." },
      { name:"Sede de Sangue", desc:"Se matar um inimigo: recupera 1d10 HP imediatamente e ganha +1 Ação extra neste turno." },
      { name:"Provocação", desc:"1 Ação: força um alvo visível a testear Força de Vontade (normal) ou atacar somente o orc no próximo turno." }
    ],
    spells:[],
    behavior:"Combate frontal agressivo. Ignora aliados em desvantagem — foca no inimigo mais forte. Nunca recua voluntariamente. Pode ser convencido por um guerreiro orc de respeito.",
    loot:[{item:"Machado de Guerra Orc (arma rara)",chance:40,qty:"1"},{item:"Dente de Criatura Colossal (troféu)",chance:60,qty:"1d3"},{item:"Provisões de Acampamento",chance:70,qty:"1"}] },

  { id:"elfo-sombrio", name:"Elfo das Sombras", difficulty:3,
    attrs: {FOR:1,DEX:4,AGI:4,INT:2,SAB:2}, size:"normal", category:"Humanoide",
    location: ["Floresta", "Ruínas"], hp:120, physDefense:7, magDefense:6, dodge:11,
    actions:3, damage:"1d8+1d6 (lâmina da meia-luz)",
    abilities:[
      { name:"Passo das Sombras", desc:"Se estiver em área de sombra ou escuridão: teleporta para qualquer outra sombra em raio 8 hex como Ação gratuita (1x/turno)." },
      { name:"Flechas Envenenadas", desc:"Ataques à distância (alcance 10): adiciona veneno élfico (1d6/rodada, 3 rodadas). Resistência AGI (difícil) para anular." },
      { name:"Reflexos da Floresta", desc:"Passivo: 30% de chance de esquivar automaticamente de ataques à distância (rola 1d10 — em 1, 2 ou 3, esquiva)." },
      { name:"Sentinela Silenciosa", desc:"Em furtividade, primeiro ataque é Crítico automático e não revela posição (pode atacar de novo furtivamente na mesma rodada)." }
    ],
    spells:["Névoa das Sombras (obscurece área 3x3, nível 2)"],
    behavior:"Tático e paciente. Nunca entra em combate aberto — favorece emboscadas, veneno e retiradas estratégicas. Alvo prioritário: conjuradores e portadores de luz. Foge se a furtividade for quebrada.",
    loot:[{item:"Lâmina Élfica da Meia-Luz (raro)",chance:25,qty:"1"},{item:"Extrato de Veneno Élfico (×3)",chance:60,qty:"1"},{item:"Cristal de Memória Élfica",chance:15,qty:"1"}] },

  { id:"necromante-errante", name:"Necromante Errante", difficulty:3,
    attrs: {FOR:0,DEX:1,AGI:1,INT:5,SAB:3}, size:"normal", category:"Humanoide",
    location: ["Cemitério", "Dungeon", "Floresta"], hp:100, physDefense:7, magDefense:7, dodge:11,
    actions:2, damage:"1d6 (cajado ossado)",
    abilities:[
      { name:"Comandar Mortos", desc:"1 Ação: levanta até 2 esqueletos ou zumbis de cadáveres presentes no campo. Cada morto-vivo tem HP=20, dano=1d6. Máximo de 4 ativos." },
      { name:"Escudo de Ossos", desc:"Passivo: enquanto tiver mortos-vivos aliados ativos, recebe −2 dano de todos os ataques físicos (os ossos absorvem)." },
      { name:"Drenar Vital", desc:"1 Ação Mágica: drena 2d8 HP de um alvo visível a 6 hex. Cura o necromante pela metade. Resistência SAB (difícil) para metade." },
      { name:"Ritual de Sacrifício", desc:"Se um morto-vivo aliado for destruído: o necromante recupera 1d10 HP e ganha +1d6 no próximo ataque mágico." }
    ],
    spells:["Drenar Vital (nível 2)","Levantar Morto-Vivo (nível 3)"],
    behavior:"Usa mortos-vivos como escudo. Fica na retaguarda conjurando e drenando. Foge se ficar sem mortos-vivos aliados e abaixo de 40% HP. Barganha conhecimento proibido em troca da vida.",
    loot:[{item:"Grimório de Necromancia (magia proibida)",chance:40,qty:"1"},{item:"Pó de Osso (reagente ×5)",chance:80,qty:"1"},{item:"Amuleto de Osso (acessório mágico)",chance:30,qty:"1"}] },

  /* ── CRIATURAS DE FLORESTA ── */
  { id:"ent-guardiao", name:"Ent Guardião da Floresta", difficulty:4,
    attrs: {FOR:7,DEX:0,AGI:0,INT:2,SAB:3}, size:"colossal", category:"Planta Viva",
    location: ["Floresta"], hp:240, physDefense:9, magDefense:2, dodge:8,
    actions:3, damage:"2d8+1d10 (galhos colossais)",
    abilities:[
      { name:"Raízes Aprisionadoras", desc:"1 Ação: raízes emergem em área 3x3 hex. Todos no terreno testam AGI (difícil) ou ficam Presos (Imóveis) por 2 rodadas. Liberar: FOR (normal) por Ação." },
      { name:"Casca Invulnerável", desc:"Imune a dano cortante e perfurante. Dano por fogo é dobrado. Dano mágico de terra cura em vez de machucar (+1d8 por acerto terrestre)." },
      { name:"Chamado da Floresta", desc:"1x/combate: invoca 1d4 Treants Jovens (HP 30, dano 1d8, Dif.2) do terreno florestal. Só funciona em floresta real." },
      { name:"Pisoteio Colossal", desc:"Se mover pelo menos 2 hex: pode pisotear um hex no caminho — 2d10 dano a tudo nele, sem teste de resistência." }
    ],
    spells:[],
    behavior:"Protetor territorial, não predador. Avisa antes de atacar — dá 1 rodada de aviso visual (chacoalha galhos) antes de agir. Se o grupo recuar e não desmatar, para. Inimigo irreconciliável apenas de Karlacs e Salamandras.",
    loot:[{item:"Coração de Ent (material lendário)",chance:30,qty:"1"},{item:"Lenha Sagrada (material)",chance:90,qty:"1d6"},{item:"Resina Curativa (3 usos, cura 2d8)",chance:50,qty:"1"}] },

  { id:"treant-jovem", name:"Treant Jovem", difficulty:2,
    attrs: {FOR:3,DEX:0,AGI:0,INT:1,SAB:1}, size:"grande", category:"Planta Viva",
    location: ["Floresta"], hp:110, physDefense:6, magDefense:1, dodge:9,
    actions:2, damage:"1d10+1d6 (galho poderoso)",
    abilities:[
      { name:"Enraizar", desc:"1 Ação: cria raízes em 1 hex adjacente — terreno difícil que custa 2 Ações para cruzar. Persiste até o treant morrer." },
      { name:"Regeneração Vegetal", desc:"Recupera 4 HP por rodada em terreno natural (floresta, grama). Fogo cancela a regeneração por 2 rodadas." }
    ],
    spells:[],
    behavior:"Solitário ou sob comando de um Ent maior. Defende a área onde nasceu. Recua se receber dano de fogo (instinto de sobrevivência).",
    loot:[{item:"Casca de Treant (armadura material)",chance:50,qty:"1"},{item:"Resina Curativa (1 uso)",chance:40,qty:"1"}] },

  { id:"sombra-florestal", name:"Sombra Florestal", difficulty:2,
    attrs: {FOR:0,DEX:2,AGI:3,INT:1,SAB:1}, size:"normal", category:"Espírito",
    location: ["Floresta", "Planície"], hp:70, physDefense:4, magDefense:6, dodge:12,
    actions:2, damage:"1d8 (toque das sombras — dano sombrio)",
    abilities:[
      { name:"Intangível", desc:"Imune a dano físico de armas não-mágicas. Armas mágicas e magias causam dano normal. Fogo e luz sagrada causam 1d4 extra." },
      { name:"Drenar Força", desc:"Cada toque bem-sucedido reduz o atributo FOR do alvo em 1 temporariamente (retorna após descanso longo). Se FOR chegar a 0: alvo fica Incapacitado." },
      { name:"Fundir nas Sombras", desc:"Em áreas escuras: torna-se invisível como Ação gratuita. Ataques contra ela têm 50% de chance de errar automaticamente." }
    ],
    spells:[],
    behavior:"Predador silencioso. Ataca à noite, foge à luz do dia. Foca em alvos isolados. Não pode ser negociado — é puro instinto predatório.",
    loot:[{item:"Essência de Sombra (componente mágico)",chance:50,qty:"1"}] },

  /* ── CRIATURAS GRANDES ── */
  { id:"mamute-das-planícies", name:"Mamute das Planícies", difficulty:3,
    attrs: {FOR:6,DEX:0,AGI:0,INT:0,SAB:1}, size:"colossal", category:"Besta",
    location: ["Montanha", "Planície"], hp:235, physDefense:7, magDefense:1, dodge:8,
    actions:2, damage:"2d8+1d10 (chifres e pisoteio)",
    abilities:[
      { name:"Carga Imparável", desc:"Se mover 3+ hex em linha reta e atacar: dano dobrado e o alvo é Empurrado 3 hex e Derrubado (sem teste). Muro ou obstáculo: 1d10 para ambos." },
      { name:"Pisoteio em Área", desc:"1 Ação: pisa em 2 hexágonos adjacentes simultaneamente — 2d6 dano a cada criatura nesses hexágonos." },
      { name:"Pele Grossa", desc:"Reduz dano de projéteis em 4 por ataque. Flechas e lanças causam mínimo de dano a menos que acertem pontos vulneráveis (olhos, barriga: +1d6 se descrito)." },
      { name:"Brado Colossal", desc:"1x/combate: grunhido ensurdecedor em raio 5 hex — todos testam FOR (normal) ou ficam Atordoados por 1 rodada." }
    ],
    spells:[],
    behavior:"Passivo se não ameaçado. Se um aliado ou filhote for atacado, entra em modo de proteção total — prioriza ameaças maiores. Pode ser acalmado com um teste de SAB (difícil) se um xamã estiver presente.",
    loot:[{item:"Marfim de Mamute (material valioso)",chance:60,qty:"1d2"},{item:"Pele de Mamute (armadura material)",chance:50,qty:"1"},{item:"Músculo de Mamute (reagente de força)",chance:30,qty:"1"}] },

  { id:"gigante-das-pedras", name:"Gigante das Pedras", difficulty:4,
    attrs: {FOR:7,DEX:1,AGI:0,INT:1,SAB:1}, size:"colossal", category:"Gigante",
    location: ["Caverna", "Montanha", "Ruínas"], hp:270, physDefense:10, magDefense:3, dodge:9,
    actions:3, damage:"2d10+1d8 (punho de pedra)",
    abilities:[
      { name:"Arremesso de Pedra", desc:"1 Ação: arremessa pedra a até 12 hex. Dano: 2d8 + alvo e todos em raio 1 hex testam AGI (difícil) ou Derrubados." },
      { name:"Corpo de Pedra", desc:"Imune a dano perfurante. Resistência −3 a dano cortante. Vulnerável a dano de terra (magia de Thurgomur causa +1d10)." },
      { name:"Terremoto Local", desc:"1x/combate: soca o chão — todas as criaturas em raio 4 hex testam AGI (difícil) ou ficam Derrubadas. Estruturas frágeis colapsam." },
      { name:"Escudo de Pedra", desc:"1 Reação: ergue um bloco de pedra bloqueando 1 ataque completamente (absorve todo o dano). O bloco é destruído após isso." }
    ],
    spells:[],
    behavior:"Territorial e orgulhoso. Não ataca sem provocação mas não recua. Pode ser negociado com ofertas de alimentos raros ou itens de pedra valiosa (INT moderada). Em combate: primeiro arremessa pedras, depois corpo a corpo.",
    loot:[{item:"Coração de Pedra Viva (material divino de Thurgomur)",chance:20,qty:"1"},{item:"Ouro nas Veias da Pele",chance:40,qty:"1d10 moedas de ouro"},{item:"Pedra de Força (reagente)",chance:50,qty:"1d3"}] },

  /* ── CRIATURAS VOADORAS ── */
  { id:"harpia", name:"Harpia Caçadora", difficulty:2,
    attrs: {FOR:1,DEX:2,AGI:2,INT:1,SAB:0}, size:"normal", category:"Voadora",
    location: ["Floresta", "Montanha"], hp:80, physDefense:4, magDefense:3, dodge:12,
    actions:3, damage:"1d8+1d6 (garras cortantes)",
    abilities:[
      { name:"Voadora", desc:"Ocupa hex aéreo (altitude 3). Ataques corpo a corpo de aliados no chão têm −1d4 de acerto. Ataques à distância são normais. Pode mergulhar: +1d6 de dano num ataque por rodada." },
      { name:"Canto Encantador", desc:"1 Ação (1x/combate): todos em raio 5 hex testam SAB (difícil) ou ficam Enfeitiçados por 2 rodadas (não atacam a harpia, caminham em sua direção)." },
      { name:"Rasante Mortal", desc:"Voa sobre um hex adjacente sem custo de Ação e ataca — o alvo não pode usar Reação (o ataque vem de cima em alta velocidade)." },
      { name:"Vulnerabilidade ao Chão", desc:"Se forçada ao chão (magia, rede, projétil específico): Esquiva cai para 10 e perde voo por 1d3 rodadas." }
    ],
    spells:[],
    behavior:"Caçadora inteligente. Usa o Canto para separar o grupo, depois ataca isolados com rasantes. Trabalha em pares. Foge se uma parceira morrer.",
    loot:[{item:"Pena de Harpia (material mágico)",chance:80,qty:"1d6"},{item:"Ovo de Harpia (valioso para alquimistas)",chance:15,qty:"1"},{item:"Moedas (roubadas de vítimas)",chance:50,qty:"1d20"}] },

  { id:"grifo", name:"Grifo das Montanhas", difficulty:3,
    attrs: {FOR:4,DEX:3,AGI:3,INT:1,SAB:2}, size:"grande", category:"Voadora",
    location: ["Montanha", "Templo"], hp:160, physDefense:7, magDefense:3, dodge:11,
    actions:3, damage:"1d10+1d8 (bico de águia + garras de leão)",
    abilities:[
      { name:"Voador de Altitude", desc:"Ocupa hex aéreo altitude 5 (muito alto). Fora do alcance de ataques corpo a corpo. Projéteis têm −1d4. Magias de área alcançam normalmente." },
      { name:"Mergulho Devastador", desc:"1x/rodada: pode mergulhar de altitude máxima para atacar — dano triplo mas fica em altitude 0 após o ataque (no chão, vulnerável)." },
      { name:"Bico Perfurante", desc:"Ataques de bico ignoram 4 pontos de Defesa Física. Alvos com armadura pesada sofrem dano normal (o bico encontra frestas)." },
      { name:"Lealdade ao Cavaleiro", desc:"Se tiver um cavaleiro montado: o grifo tem +1 Ação e +1d6 de dano. Ambos atuam na mesma iniciativa. O cavaleiro pode redirecionar ataques do grifo." }
    ],
    spells:[],
    behavior:"Nobre e orgulhoso. Pode ser domado com tempo e respeito (missão secundária). Em estado selvagem: caça para alimentar filhotes. Não persegue presas que entram em cavernas.",
    loot:[{item:"Pena de Grifo (item lendário — sela de voar)",chance:30,qty:"1"},{item:"Garras de Grifo (arma material)",chance:50,qty:"1d4"},{item:"Ovo de Grifo (montaria potencial)",chance:10,qty:"1"}] },

  { id:"basilisco-asa", name:"Basilisco Voador", difficulty:4,
    attrs: {FOR:4,DEX:2,AGI:3,INT:1,SAB:2}, size:"grande", category:"Voadora",
    location: ["Dungeon", "Montanha", "Ruínas"], hp:165, physDefense:8, magDefense:4, dodge:12,
    actions:3, damage:"1d10+1d8 (mordida petrificante)",
    abilities:[
      { name:"Olhar Petrificante", desc:"1 Ação: todos em cone 4 hex à frente testam FOR (difícil) ou ficam Paralisados por 1 rodada. 1 falha acumulada = Paralisado 2 rodadas. 2 falhas = Petrificado permanente (reversível por magia de nível 4+)." },
      { name:"Couro Calcificado", desc:"Reduz dano de qualquer fonte em 2. Magia de terra ou dano sagrado ignora essa redução." },
      { name:"Voo Errático", desc:"Em altitude 3: difícil de prever trajetória — ataques à distância têm −1d6 de acerto. Magia de área é normal." },
      { name:"Mordida Calcificante", desc:"Mordida com sucesso: parte do corpo atingida começa a calcificar — −1 em ações que usem aquele membro por 3 rodadas (acumula)." }
    ],
    spells:[],
    behavior:"Solitário. Ataca qualquer coisa que entre em seu território. Usa Olhar primeiro para imobilizar, depois mergulha. Não foge — terreno é tudo para ele.",
    loot:[{item:"Olho de Basilisco (ingrediente petrificante)",chance:40,qty:"1"},{item:"Escama de Basilisco (armadura material)",chance:50,qty:"1d6"},{item:"Cristal de Carne Calcificada",chance:25,qty:"1"}] },

  /* ── CORROMPIDOS PELO DEUS MARCADO ── */
  { id:"urso-corrompido-marca", name:"Urso Corrompido pela Marca", difficulty:3,
    attrs: {FOR:4,DEX:1,AGI:1,INT:0,SAB:1}, size:"grande", category:"Besta Corrompida",
    location: ["Floresta", "Ruínas"], hp:180, physDefense:7, magDefense:3, dodge:11,
    actions:3, damage:"1d12+1d8 (garras corrompidas)",
    abilities:[
      { name:"Aura Corruptora", desc:"Passivo: aliados em raio 3 hex têm −1d4 em todos os testes. Clérigos de Jurgmund ou Sanctum imunes." },
      { name:"Garras do Deus Marcado", desc:"Cada acerto aplica 1 nível de Corrupção da Marca ao alvo (acumulável). 3 níveis = alvo começa a agir erráticamente (Mestre determina)." },
      { name:"Fúria Sombria", desc:"Ao ficar abaixo de 50% HP: a Corrupção toma controle total — +2 Ações, +1d10 de dano. Não foge mais. Ataca tudo incluindo outros corrompidos." },
      { name:"Regeneração Marcada", desc:"Regenera 6 HP por rodada. Magia sagrada ou fogo divino cancela por 2 rodadas." }
    ],
    spells:[],
    behavior:"Erratico e agressivo. Ataca aliados corrompidos se em Fúria Sombria. Araltos podem controlá-lo parcialmente com símbolo da Marca (teste de INT).",
    loot:[{item:"Pele Corrompida (material amaldiçoado)",chance:60,qty:"1"},{item:"Fragmento da Marca (cristal corrompido)",chance:40,qty:"1"}] },

  { id:"golem-marcado", name:"Golem da Marca", difficulty:4,
    attrs: {FOR:6,DEX:0,AGI:0,INT:0,SAB:1}, size:"grande", category:"Construto Corrompido",
    location: ["Dungeon", "Ruínas"], hp:225, physDefense:9, magDefense:5, dodge:9,
    actions:3, damage:"2d8+1d8 (punho marcado)",
    abilities:[
      { name:"Núcleo da Marca", desc:"No centro do peito há um cristal carmesim. Atacar o cristal (−2 para acerto, requer mira declarada): causa dano duplo e pode desestabilizar o golem (SAB difícil ou Atordoado 1 rodada)." },
      { name:"Pulso de Corrupção", desc:"1 Ação: emite pulso de energia corrompida em raio 3 hex — 2d6 dano sombrio a todos (SAB normal para metade)." },
      { name:"Inabalável", desc:"Imune a Derrubado, Empurrado e Paralisado. Efeitos de medo não funcionam." },
      { name:"Absorção Sombria", desc:"Ao receber dano mágico (exceto sagrado): absorve 25% como cura. Magia sagrada causa 1d6 extra." }
    ],
    spells:[],
    behavior:"Guardião autômato programado pelos Araltos. Protege áreas específicas ou portadores da Marca. Não negocia. Persegue indefinidamente se ativado.",
    loot:[{item:"Cristal da Marca (valioso e perigoso)",chance:80,qty:"1"},{item:"Peças de Metal Corrompido",chance:60,qty:"1d4"},{item:"Núcleo de Golem (pode ser reprogramado)",chance:20,qty:"1"}] },

  /* ── CORROMPIDOS PELO SANGUE DA SERPENTE (não agressivos) ── */
  { id:"cobra-sangue-Jurgmund", name:"Cobra do Sangue de Jurgmund", difficulty:2,
    attrs: {FOR:1,DEX:1,AGI:2,INT:1,SAB:2}, size:"normal", category:"Besta Sagrada",
    location: ["Dungeon", "Floresta", "Montanha", "Ruínas"], hp:80, physDefense:4, magDefense:5, dodge:12,
    abilities:[
      { name:"Não Agressiva por Natureza", desc:"Não ataca primeiro. Se atacada: defende-se e tenta se afastar. Apenas ataca 3x seguidas se encurralada." },
      { name:"Veneno Sagrado Passivo", desc:"Qualquer contato físico (atacar sem luvas, capturar): 1d6 de veneno sagrado por rodada por 3 rodadas. Antídoto mundano não funciona — precisa de cura mágica." },
      { name:"Guia de Jurgmund", desc:"Serpentarianos que a seguem (em vez de atacar) são guiados até um local de interesse próximo (tesouro, saída, área sagrada). O Mestre escolhe o destino." },
      { name:"Escamas Douradas", desc:"Suas escamas brilham levemente dourado. Clérigos de Jurgmund que a vejam ganham +1 Slot de Magia enquanto ela estiver visível." }
    ],
    spells:[],
    actions:2, damage:"1d8 + veneno sagrado (defensivo)",
    behavior:"Anda pelo mundo como mensageira de Jurgmund. Observa, guia, eventualmente some. Nunca é morta sem consequência — Serpentarianos ficam hostis se virem um grupo matar uma.",
    loot:[{item:"Escama Dourada de Jurgmund (material divino)",chance:70,qty:"1d3"},{item:"Veneno Sagrado Residual (frasco)",chance:30,qty:"1"}] },

  { id:"lagarto-cristal-cobra", name:"Lagarto de Cristal Cobriforme", difficulty:1,
    attrs: {FOR:0,DEX:1,AGI:1,INT:0,SAB:1}, size:"pequeno", category:"Besta Sagrada",
    location: ["Caverna", "Planície", "Pântano", "Ruínas"], hp:35, physDefense:4, magDefense:2, dodge:13,
    abilities:[
      { name:"Completamente Inofensivo", desc:"Nunca ataca voluntariamente. Foge de qualquer confronto. Se capturado e tratado bem: torna-se familiar (bônus de +1 em testes de Percepção e +1 Slot de Magia)." },
      { name:"Detector de Corrupção", desc:"Passivo: o lagarto brilha intensamente em vermelho ao detectar qualquer criatura corrompida pelo Deus Marcado em raio 10 hex. Excelente alarme." },
      { name:"Pele de Cristal", desc:"Passivo: dano físico causa 1d4 de dano reflexivo ao atacante (o cristal é muito afiado). Não intencional — é sua defesa natural." }
    ],
    spells:[],
    actions:1, damage:"— (não ataca)",
    behavior:"Curioso e dócil. Se os jogadores ficarem quietos por 1 rodada completa, ele se aproxima. Pode ser capturado sem combate com DEX (normal).",
    loot:[{item:"Escama de Cristal Cobra (material decorativo e mágico)",chance:90,qty:"1d4"}] },

  /* ── CRIATURAS COM MAGIAS ÚNICAS ── */
  { id:"maga-da-floresta", name:"Maga da Floresta Antiga", difficulty:3,
    attrs: {FOR:0,DEX:1,AGI:1,INT:4,SAB:5}, size:"normal", category:"Humanoide",
    location: ["Floresta", "Templo"], hp:115, physDefense:7, magDefense:8, dodge:11,
    actions:2, damage:"1d6 (cajado de madeira viva) + magia",
    abilities:[
      { name:"Controle da Flora", desc:"1 Ação: controla toda a vegetação em raio 6 hex por 3 rodadas. Pode: criar terreno difícil, fazer raízes aprisionarem (AGI difícil) ou criar paredes de galhos (Def.5, 20 HP)." },
      { name:"Forma Animal", desc:"1x/combate: transforma-se em animal selvagem (urso dif.2) por 4 rodadas. Mantém INT mas ganha todas as estatísticas da forma." },
      { name:"Cura da Terra", desc:"1 Ação Mágica: cura 3d8 HP em aliados que estiverem em contato com solo natural. Não funciona em dungeon ou pedra artificial." },
      { name:"Maldição da Floresta", desc:"1 Ação Mágica (1x/combate): maldição permanente até próximo descanso longo — alvo não consegue se mover mais de 2 hex por rodada sem força exterior." }
    ],
    spells:["Controle da Flora (nível 3)","Forma Animal (nível 3)","Cura da Terra (nível 2)","Maldição da Floresta (nível 3)"],
    behavior:"Protetora, não agressora. Ataca quem desmata ou polui a floresta. Pode ser aliada se o grupo mostrar respeito pela natureza. Oferece cura e informações em troca de promessas mantidas.",
    loot:[{item:"Cajado de Madeira Viva (arma mágica)",chance:30,qty:"1"},{item:"Sementes de Cura (3 usos — cura 2d8)",chance:60,qty:"1"},{item:"Mapa de Locais Sagrados",chance:40,qty:"1"}] },

  { id:"draconico-menor", name:"Dracônico Menor", difficulty:3,
    attrs: {FOR:3,DEX:2,AGI:2,INT:2,SAB:1}, size:"normal", category:"Dracônico",
    location: ["Caverna", "Montanha", "Ruínas"], hp:145, physDefense:7, magDefense:5, dodge:11,
    actions:3, damage:"1d10+1d6 (garras e chama)",
    abilities:[
      { name:"Sopro de Chama", desc:"1 Ação (1x a cada 2 rodadas): sopro de fogo em cone 4 hex — 3d8 dano de fogo, metade com AGI (normal). Imune a fogo próprio." },
      { name:"Escalas Dragonínicas", desc:"Resistência a fogo (-4 por dado). Vulnerável a frio (+1d4 por dado de dano de gelo)." },
      { name:"Voo de Combate", desc:"Pode voar em altitude 2 (acima do alcance corpo a corpo). Pousa para usar Sopro ou atacar com garras — ficar preso no chão por 1 rodada após pousar." },
      { name:"Orgulho Dracônico", desc:"Se receber um Crítico: fica Enraivecido por 3 rodadas — +1d8 de dano mas foca somente em quem acertou o crítico." }
    ],
    spells:[],
    behavior:"Quer tesouro e respeito, nesta ordem. Pode ser negociado com ofertas de ouro ou itens valiosos. É inimigo de quem invade sua caverna. Nunca se une a outros dracônicos menores (competição de território).",
    loot:[{item:"Escama de Dracônico (armadura material)",chance:60,qty:"1d6"},{item:"Garra de Dracônico (arma material)",chance:40,qty:"1d2"},{item:"Fragmento de Tesouro do Dracônico",chance:70,qty:"1d20 ouro"}] },

  { id:"espirito-fogo", name:"Espírito do Fogo Primordial", difficulty:4,
    attrs: {FOR:0,DEX:4,AGI:5,INT:2,SAB:2}, size:"normal", category:"Elemental",
    location: ["Deserto", "Montanha"], hp:145, physDefense:8, magDefense:8, dodge:12,
    actions:3, damage:"2d8 (toque de chama pura)",
    abilities:[
      { name:"Corpo de Fogo", desc:"Imune a fogo e dano físico mundano. Dano de gelo causa 1d6 extra e reduz 1 Ação por rodada por 2 rodadas. Água apaga temporariamente (1 rodada)." },
      { name:"Aura Flamejante", desc:"Passivo: qualquer criatura a 1 hex sofre 1d6 de calor por rodada. Objetos inflamáveis nos hexágonos adjacentes pegam fogo." },
      { name:"Explosão de Calor", desc:"1x/combate: libera toda a energia em raio 4 hex — 4d8 dano de fogo a todos (AGI difícil para metade). O espírito fica com −2 Ações por 2 rodadas após." },
      { name:"Dividir", desc:"Se receber 20+ de dano em 1 golpe: divide em 2 espíritos menores (HP 25, dano 1d8, Dif.2). Os dois somem se o espírito original tivesse sido derrotado." }
    ],
    spells:[],
    behavior:"Não tem intenção maligna — simplesmente existe e queima. Fica quieto se ninguém se aproximar demais (3 hex). Portadores de itens de Vermelhão: o espírito reconhece a divindade e não ataca.",
    loot:[{item:"Essência de Fogo Primordial (material divino)",chance:60,qty:"1"},{item:"Cristal de Calor Permanente (luz eterna)",chance:30,qty:"1"}] },

  /* ══════════════════════════════════════════════════════════
     NOVOS MONSTROS — Dificuldade 2 e 3
     ══════════════════════════════════════════════════════════ */

  /* ─── DIFICULDADE 2 ─────────────────────────────────────── */

  { id:"aranha-gigante", name:"Aranha Gigante da Caverna", difficulty:2,
    attrs: {FOR:2,DEX:2,AGI:1,INT:0,SAB:1}, size:"grande", category:"Besta",
    location: ["Caverna", "Dungeon", "Floresta"],
    hp:75, physDefense:4, magDefense:1, dodge:12,
    actions:2, damage:"1d8+1d4 (presas venenosas)",
    abilities:[
      { name:"Teia Aprisionadora", desc:"1 Ação: dispara teia a até 6 hex. Alvo testa AGI (normal) ou fica Preso (imóvel, pode gastar 1 Ação por turno para testar FOR normal e escapar). Pode ter até 3 teias ativas." },
      { name:"Veneno de Paralisia", desc:"Cada mordida aplica veneno: 1d4 de dano por rodada + reduz AGI em 1 por rodada (acumula). Se AGI chegar a 0: Paralisado por 2 rodadas. Antídoto ou cura mágica remove." },
      { name:"Andar pelas Paredes", desc:"Pode se mover em paredes e tetos sem penalidade. Alvos no chão que atacam uma aranha no teto têm -1d4 de acerto." },
      { name:"Sentido de Vibração", desc:"Detecta qualquer movimento em raio 8 hex via teia ou chão. Imune a Furtividade se estiver em teia ou área de teia." }
    ],
    spells:[], behavior:"Tece teias antes do combate para cobrir saídas. Usa Paralisia para prender presas e guarda para comer depois. Foge se perder mais da metade dos pontos de vida em 2 rodadas.",
    loot:[{item:"Seda de Aranha Gigante (material — corda ou roupa)",chance:70,qty:"1d4"},{item:"Veneno de Aranha (3 doses)",chance:40,qty:"1"},{item:"Casulo com item preso (variado)",chance:30,qty:"1"}] },

  { id:"gnoll-guerreiro", name:"Gnoll Guerreiro", difficulty:2,
    attrs: {FOR:2,DEX:1,AGI:1,INT:0,SAB:1}, size:"normal", category:"Humanoide",
    location: ["Cidade", "Deserto", "Planície"],
    hp:85, physDefense:4, magDefense:1, dodge:12,
    actions:2, damage:"1d10+1d4 (lança serrilhada)",
    abilities:[
      { name:"Riso de Hiena", desc:"Ao reduzir um inimigo a 0 HP: emite um grito/riso aterrorizante. Todos os inimigos em raio 4 hex testam SAB (normal) ou ficam com -1d4 em todos os testes por 1 rodada." },
      { name:"Faro de Sangue", desc:"Detecta criaturas com menos de 50% HP em raio 10 hex. Prioriza atacar alvos enfraquecidos — reorienta ataque automaticamente se alvo mais ferido aparecer." },
      { name:"Mochila de Trofeus", desc:"Carrega partes de vítimas anteriores como intimidação. Primeiros inimigos que o veem testam SAB (fácil) ou ficam com -1 na iniciativa (os trofeus são perturbadores)." }
    ],
    spells:[], behavior:"Caça em grupos de 3-6. O gnoll mais forte lidera. Foca em alvos caídos para garantir a morte. Foge se o líder morrer, mas volta com reforços.",
    loot:[{item:"Lança Serrilhada (arma comum)",chance:60,qty:"1"},{item:"Provisões (comida questionável)",chance:50,qty:"1d3"},{item:"Moedas Diversas",chance:40,qty:"1d10"},{item:"Trofeu de Osso (intimidação)",chance:30,qty:"1"}] },

  { id:"serpente-constritora", name:"Serpente Constritora das Ruínas", difficulty:2,
    attrs: {FOR:3,DEX:0,AGI:1,INT:0,SAB:1}, size:"grande", category:"Besta",
    location: ["Caverna", "Floresta", "Ruínas"],
    hp:90, physDefense:4, magDefense:2, dodge:12,
    actions:2, damage:"1d8+1d6 (mordida e constrição)",
    abilities:[
      { name:"Constrição Letal", desc:"Após qualquer mordida com acerto: a serpente envolve o alvo. Por rodada que permanecer envolvida: 1d8 de dano automático + alvo tem -1 Ação. Escapar: FOR (difícil) como Ação." },
      { name:"Resistência a Veneno", desc:"Imune a todos os venenos. Ataques com veneno aplicado não têm efeito sobre ela." },
      { name:"Engolir Inteiro", desc:"Se um alvo com menos de 25% HP for mordido: pode tentar engolir (FOR vs FOR do alvo). Se engolir: alvo fica Incapacitado e sofre 1d6 ácido por rodada até ser liberado (matar a serpente libera)." }
    ],
    spells:[], behavior:"Predadora oportunista. Espera imóvel até que algo passe a 2 hex. Foca em um alvo por vez até matar ou o alvo escapar.",
    loot:[{item:"Pele de Serpente Constritora",chance:60,qty:"1"},{item:"Veneno Constritora (2 doses, causa Lentidão)",chance:25,qty:"1"},{item:"Ovo de Serpente (incubado)",chance:15,qty:"1d3"}] },

  { id:"feiticeiro-goblin", name:"Feiticeiro Goblin", difficulty:2,
    attrs: {FOR:0,DEX:1,AGI:2,INT:2,SAB:1}, size:"pequeno", category:"Humanoide",
    location: ["Caverna", "Dungeon", "Floresta", "Planície"],
    hp:55, physDefense:4, magDefense:5, dodge:12,
    actions:2, damage:"1d4 (cajadinho) + magias",
    abilities:[
      { name:"Maldição do Azar", desc:"1 Ação Mágica: um alvo a até 8 hex fica Azarado por 3 rodadas — todo 20 natural nos dados desse alvo vira 1 (o azar inverte os críticos)." },
      { name:"Explosão Caótica", desc:"1 Ação Mágica: bola de energia instável lançada a 6 hex. Dano 2d6 em raio 2 hex. 1 em 6 chances do goblin também sofrer 1d6 (mira péssima)." },
      { name:"Invocar Trasgo", desc:"1 Ação Mágica (1x/combate): invoca 1d3 Goblins Batedeira (Dif.1) de um buraco no chão. Os goblins chegam no próximo turno." },
      { name:"Teleporte Pânico", desc:"Ao receber qualquer dano: 50% de chance de teleportar para hex aleatório em raio 4 hex (o pânico ativa a magia involuntariamente)." }
    ],
    spells:[], behavior:"Caótico e imprevisível. Fica na retaguarda lançando magias aleatórias. Invoca reforços ao sentir perigo. Foge se ficar sozinho.",
    loot:[{item:"Cajadinho Mágico Goblin (arma peculiar)",chance:30,qty:"1"},{item:"Poção Instável (efeito aleatório 1d6)",chance:50,qty:"1d2"},{item:"Moedas",chance:60,qty:"1d8"},{item:"Componente Mágico Roubado",chance:25,qty:"1"}] },

  { id:"mumia-menor", name:"Múmia Menor", difficulty:2,
    attrs: {FOR:2,DEX:0,AGI:0,INT:1,SAB:2}, size:"normal", category:"Morto-Vivo",
    location: ["Cemitério", "Deserto"],
    hp:80, physDefense:4, magDefense:3, dodge:10,
    actions:2, damage:"1d8+1d4 (golpe ressecante)",
    abilities:[
      { name:"Maldição da Múmia", desc:"Toque com acerto: alvo fica Amaldiçoado (Maldição da Ressecação) — recupera metade do HP de curas por 24 horas. Cura mágica de nível 2+ ou Clérigo remove." },
      { name:"Imune ao Fogo", desc:"Completamente imune a dano de fogo. Magia de água ou frio causa 1d6 extra (a umidade corrói as bandagens)." },
      { name:"Aura de Desespero", desc:"Passivo: primeira vez que alguém entra em raio 3 hex, testa SAB (normal) ou fica com -1d4 em testes de ataque por 2 rodadas (a presença da morte pesa)." }
    ],
    spells:[], behavior:"Guardião silencioso de tumbas. Não persegue além dos limites da tumba. Protege o sarcófago central acima de tudo.",
    loot:[{item:"Bandagem Impregnada (material alquímico)",chance:60,qty:"1d4"},{item:"Amuleto de Proteção Antigo",chance:30,qty:"1"},{item:"Ouro Funerário",chance:50,qty:"2d8"}] },

  { id:"doppelganger-menor", name:"Imitador (Doppelganger Menor)", difficulty:2,
    attrs: {FOR:1,DEX:2,AGI:2,INT:3,SAB:1}, size:"normal", category:"Aberração",
    location: ["Cidade", "Dungeon"],
    hp:70, physDefense:4, magDefense:4, dodge:12,
    actions:2, damage:"1d8 (golpe surpresa)",
    abilities:[
      { name:"Copiar Aparência", desc:"Pode copiar a aparência de qualquer humanoide que tenha observado por 1 rodada. A cópia é perfeita visualmente mas SAB (difícil) detecta algo errado no comportamento." },
      { name:"Golpe de Traição", desc:"Se estiver disfarçado de aliado: primeiro ataque é Crítico automático e causa Atordoado por 1 rodada (o choque da traição é devastador)." },
      { name:"Ler Superfície Mental", desc:"Pode sentir as emoções e pensamentos superficiais de qualquer criatura em raio 2 hex — usa isso para imitar melhor e antecipar ataques (+1d4 na Esquiva)." },
      { name:"Escorregadio", desc:"Se capturado ou Preso: escorrega automaticamente (corpo se deforma) sem custo de Ação. Imune a ser Agarrado." }
    ],
    spells:[], behavior:"Prefere infiltração a combate. Assume identidade de alguém do grupo e ataca quando menos esperam. Foge se a cobertura for exposta. Nunca luta se pode enganar.",
    loot:[{item:"Essência de Imitador (componente)",chance:50,qty:"1"},{item:"Itens da última vítima (variado)",chance:70,qty:"1d3"}] },

  { id:"golem-gelo", name:"Golem de Gelo", difficulty:2,
    attrs: {FOR:3,DEX:0,AGI:0,INT:0,SAB:0}, size:"grande", category:"Construto",
    location: ["Dungeon", "Montanha"],
    hp:100, physDefense:5, magDefense:2, dodge:8,
    actions:2, damage:"1d10+1d6 (soco de gelo)",
    abilities:[
      { name:"Aura de Frio", desc:"Passivo: criaturas a 1 hex sofrem 1d4 de frio por rodada. Líquidos nessa área congelam. Movimento de criaturas em raio 2 hex é reduzido em 1." },
      { name:"Fragmentação de Gelo", desc:"Ao receber dano contundente: explode em estilhaços — todos em raio 2 hex sofrem 1d6 de dano de gelo perfurante (AGI normal para metade)." },
      { name:"Vulnerabilidade ao Fogo", desc:"Dano de fogo causa 1d6 extra e derrete 1 hex do golem (reduz tamanho — perde 1 Ação quando abaixo de 50% HP)." },
      { name:"Imobilidade no Calor", desc:"Em ambientes quentes (próximo a chamas grandes, deserto): Movimento reduzido à metade e -1 Ação." }
    ],
    spells:[], behavior:"Guardião sem inteligência. Patrulha área designada. Não persegue além do território. Pode ser confundido com escultura até se mover.",
    loot:[{item:"Núcleo de Gelo Eterno (material mágico)",chance:40,qty:"1"},{item:"Água de Fonte de Gelo Puro",chance:60,qty:"1d4 frascos"}] },

  { id:"naiad-corrompida", name:"Náiade Corrompida", difficulty:2,
    attrs: {FOR:0,DEX:2,AGI:2,INT:1,SAB:3}, size:"normal", category:"Espírito",
    location: ["Planície", "Pântano"],
    hp:70, physDefense:4, magDefense:6, dodge:12,
    actions:2, damage:"1d6+1d4 (toque aquoso)",
    abilities:[
      { name:"Forma Aquosa", desc:"Em contato com água: regenera 3 HP por rodada e Esquiva +2. Fora da água: perde esses bônus e fica Enfraquecida (-1d4 nos ataques)." },
      { name:"Canção das Profundezas", desc:"1 Ação: canto que drena voluntade — alvo a 8 hex testa SAB (normal) ou caminha em direção à água mais próxima por 2 rodadas (como Enfeitiçado)." },
      { name:"Bolha de Afogamento", desc:"Toque com sucesso em alvo adjacente à água: envolve cabeça do alvo em bolha d'água. Alvo testa FOR (normal) por rodada ou sofre 1d8 de sufocação. A bolha estoura se o alvo receber 10+ dano em 1 golpe." },
      { name:"Merging", desc:"Pode entrar em qualquer corpo d'água como Ação livre e emergir de qualquer outro ponto com água no campo de batalha." }
    ],
    spells:[], behavior:"Outrora protetora de rios, corrompida pela energia do Grande Lago ou do Deus Marcado. Atrai viajantes para a água. Pode ser purificada por Clérigo de Jurgmund (missão secundária).",
    loot:[{item:"Lágrima de Náiade (componente mágico de água)",chance:60,qty:"1"},{item:"Pedra do Rio Polida (amuleto simples)",chance:40,qty:"1"}] },

  /* ─── DIFICULDADE 3 ─────────────────────────────────────── */

  { id:"minotauro-perdido", name:"Minotauro Perdido", difficulty:3,
    attrs: {FOR:5,DEX:1,AGI:1,INT:1,SAB:0}, size:"grande", category:"Humanoide",
    location: ["Dungeon", "Ruínas"],
    hp:170, physDefense:7, magDefense:2, dodge:11,
    actions:3, damage:"1d12+1d10 (machado colossal)",
    abilities:[
      { name:"Carga do Labirinto", desc:"Se mover 3+ hex em linha reta antes de atacar: dano dobrado + alvo testado AGI (difícil) ou Derrubado e Empurrado 2 hex. O minotauro não para — segue em frente 1 hex extra." },
      { name:"Sentido de Labirinto", desc:"Nunca se perde. Em dungeon ou labirinto: sempre sabe o caminho para qualquer ponto visitado. Imune a magias de desorientação ou névoa mental." },
      { name:"Fúria de Sangue", desc:"Ao receber qualquer crítico: entra em Fúria por 3 rodadas — +2 Ações, ignora penalidades de ferimento mas não pode usar Reações defensivas." },
      { name:"Brado Ensurdecedor", desc:"1x/combate: grito poderoso em raio 4 hex — todos testam FOR (normal) ou ficam Atordoados por 1 rodada e com -1d4 em Percepção por 2 rodadas." }
    ],
    spells:[], behavior:"Territorial e traumatizado. Patrulha seu labirinto com fúria silenciosa. Pode ser apaziguado por alguém que mostre respeito genuíno (SAB crítico + falar em Orc antigo).",
    loot:[{item:"Chifre de Minotauro (instrumento/arma)",chance:50,qty:"1"},{item:"Machado de Minotauro (arma grande)",chance:40,qty:"1"},{item:"Fio de Minotauro (sempre leva ao centro)",chance:20,qty:"1"}] },

  { id:"quimera-jovem", name:"Quimera Jovem", difficulty:3,
    attrs: {FOR:4,DEX:2,AGI:2,INT:1,SAB:1}, size:"grande", category:"Besta",
    location: ["Dungeon", "Montanha", "Planície"],
    hp:160, physDefense:7, magDefense:4, dodge:11,
    actions:3, damage:"1d10+1d6 (cabeças alternadas)",
    abilities:[
      { name:"Três Cabeças", desc:"Cada turno, a Quimera ataca com a cabeça dominante (Mestre escolhe ou rola 1d3): 1=Leão (mordida 1d10, Derruba), 2=Bode (chifrada 1d8, Empurra 2 hex), 3=Dragão (sopro 2d6 fogo cone 3 hex)." },
      { name:"Sopro de Dragão", desc:"Cabeça de Dragão: 1x a cada 2 rodadas — cone 4 hex, 2d8 de fogo, AGI normal para metade." },
      { name:"Confusão de Combate", desc:"Ao matar uma das cabeças (estrutura narrativa): a Quimera fica Atordoada por 1 rodada mas em compensação fica Enfurecida — +1d8 de dano pelas rodadas restantes." },
      { name:"Voar Pesado", desc:"Pode voar em altitude 2 mas é lenta — move apenas 2 hex ao voar. Ataques em voo reduzem para 2 Ações." }
    ],
    spells:[], behavior:"Caçadora territorial. Planeja atacar de cima com sopro, pousar para corpo a corpo. Não tem estratégia sofisticada — confia no poder bruto das três cabeças.",
    loot:[{item:"Escama de Quimera (material raro)",chance:60,qty:"1d6"},{item:"Garra de Quimera",chance:50,qty:"1d4"},{item:"Coração Triplo de Quimera (reagente lendário)",chance:20,qty:"1"}] },

  { id:"bruxa-das-ervas", name:"Bruxa das Ervas Venenosas", difficulty:3,
    attrs: {FOR:0,DEX:1,AGI:1,INT:4,SAB:5}, size:"normal", category:"Humanoide",
    location: ["Floresta", "Pântano", "Ruínas"],
    hp:110, physDefense:7, magDefense:8, dodge:11,
    actions:2, damage:"1d6 (cajado venenoso) + veneno",
    abilities:[
      { name:"Nuvem de Esporos", desc:"1 Ação Mágica: nuvem em raio 3 hex por 3 rodadas. Todos dentro testam SAB (normal) a cada rodada: falha = Envenenado (1d6/rodada) E Confuso (age aleatoriamente) por 2 rodadas." },
      { name:"Maldição do Espelho", desc:"1 Ação Mágica (1x/combate): reflete a próxima magia que atingir a bruxa de volta ao conjurador com dano dobrado. Dura até ser usada ou 3 rodadas." },
      { name:"Poções de Combate", desc:"Tem 3 poções especiais em cinturão que usa como Ação Livre: Fraqueza (alvo -2 FOR/AGI, 3 rodadas), Cegueira (alvo Cego, 2 rodadas), Sono (alvo SAB crítico ou dorme 1d4 rodadas)." },
      { name:"Familiar Venenoso", desc:"Acompanhada por cobra venenosa pequena (HP 12, dano 1d4+veneno 1d6/rodada). A bruxa ganha +1d4 em Percepção enquanto o familiar estiver vivo." }
    ],
    spells:["Nuvem de Esporos (nível 2)","Maldição do Espelho (nível 3)","Poção de Fraqueza (nível 1)"],
    behavior:"Hábil manipuladora. Tenta negociar primeiro (tem informações valiosas). Em combate: abre com Esporos para confundir, usa poções nos mais fortes, guarda Maldição do Espelho para o conjurador.",
    loot:[{item:"Grimório de Venenos (receitas raras)",chance:40,qty:"1"},{item:"Ervas Venenosas Raras (×5)",chance:70,qty:"1"},{item:"Poção Especial da Bruxa (efeito variado)",chance:50,qty:"1d2"},{item:"Olho de Bruxa (componente)",chance:25,qty:"1"}] },

  { id:"cavaleiro-sem-cabeca", name:"Cavaleiro Sem Cabeça", difficulty:3,
    attrs: {FOR:4,DEX:2,AGI:2,INT:2,SAB:0}, size:"normal", category:"Morto-Vivo",
    location: ["Estrada", "Floresta", "Pântano"],
    hp:155, physDefense:7, magDefense:3, dodge:11,
    actions:3, damage:"1d10+1d8 (espada do julgamento)",
    abilities:[
      { name:"Sem Cabeça", desc:"Imune a Cegueira, Atordoado por som e qualquer efeito que exija visão ou audição para funcionar. Veneno via mordida também não funciona (sem boca)." },
      { name:"Julgamento dos Mortos", desc:"Ao aproximar de um alvo a 1 hex: o alvo sente o peso do julgamento — testa SAB (normal) ou fica com -1d4 em todos os ataques enquanto o Cavaleiro estiver adjacente." },
      { name:"Cabeça Voadora", desc:"1x/combate: a cabeça destacada voa para um alvo a 8 hex e o morde (1d6 + Atordoado 1 rodada). A cabeça retorna no próximo turno. Sem a cabeça: o Cavaleiro perde o bônus de Julgamento dos Mortos." },
      { name:"Invulnerabilidade Parcial", desc:"Dano cortante é reduzido em 3 (a armadura espectral absorve). Fogo sagrado e magia divina causam 1d6 extra." }
    ],
    spells:[], behavior:"Busca quem fez algum juramento não cumprido — ataca priorizando personagens com dívidas de honra. Pode ser apaziguado se um juramento antigo for cumprido na sua presença.",
    loot:[{item:"Armadura do Cavaleiro (set incompleto, mágico)",chance:50,qty:"1"},{item:"Espada do Julgamento (arma lendária)",chance:20,qty:"1"},{item:"Medalhão da Ordem (identifica a nobreza que serviu)",chance:70,qty:"1"}] },

  { id:"escorpiao-gigante", name:"Escorpião Gigante do Deserto", difficulty:3,
    attrs: {FOR:4,DEX:2,AGI:1,INT:0,SAB:1}, size:"grande", category:"Besta",
    location: ["Caverna", "Deserto", "Planície"],
    hp:145, physDefense:7, magDefense:1, dodge:11,
    actions:3, damage:"1d10+1d6 (pinças) + 1d8 (ferrão)",
    abilities:[
      { name:"Dupla Pinça", desc:"Pode atacar com ambas as pinças em 1 Ação. Cada pinça que acerta: alvo testado FOR (normal) ou fica Agarrado. Se ambas agarrarem: alvo fica Imóvel." },
      { name:"Ferrão de Neurotoxina", desc:"O ferrão aplica neurotoxina — 1d8 por rodada, reduz 1 AGI por rodada (não regenera até antídoto). 3 rodadas de ferrão sem cura: alvo fica Paralisado. Resistência FOR (difícil) para metade." },
      { name:"Exoesqueleto Reforçado", desc:"Reduz todo dano perfurante em 4. Magia de terra ou dano contundente é normal." },
      { name:"Instinto de Enterrar", desc:"Em terreno arenoso ou de terra macia: pode enterrar-se como Ação (fica invisível até atacar). O próximo ataque de emboscada causa dano duplo." }
    ],
    spells:[], behavior:"Caçador paciente. Espera enterrado até que uma presa se aproxime. Sempre tenta prender com as pinças antes de usar o ferrão. Foge se perder ambas as pinças.",
    loot:[{item:"Veneno de Escorpião Gigante (componente raro, ×3)",chance:60,qty:"1"},{item:"Exoesqueleto (material de armadura)",chance:40,qty:"1"},{item:"Ferrão (arma improvisada)",chance:30,qty:"1"}] },

  { id:"esfinx-menor", name:"Esfinge Menor", difficulty:3,
    attrs: {FOR:3,DEX:2,AGI:2,INT:5,SAB:4}, size:"grande", category:"Besta Mística",
    location: ["Deserto", "Ruínas", "Templo"],
    hp:160, physDefense:7, magDefense:7, dodge:11,
    actions:3, damage:"1d10+1d8 (garras e bico)",
    abilities:[
      { name:"O Enigma", desc:"No início do combate: apresenta um enigma ao grupo. Se resolverem corretamente (1 minuto de discussão): a Esfinge para de atacar e responde 1 pergunta verdadeira. Se errarem: entra em Fúria por 3 rodadas (+1d8 de dano, +1 Ação)." },
      { name:"Olho do Destino", desc:"1 Ação Mágica: vê 1 rodada no futuro — o próximo ataque contra ela erra automaticamente (previsão perfeita). Usa 1x a cada 3 rodadas." },
      { name:"Rugido da Verdade", desc:"1 Ação Mágica (1x/combate): rugido em raio 4 hex — todos que mentiram nas últimas 24 horas testam SAB (crítico) ou ficam Atordoados 2 rodadas." },
      { name:"Voo Majestoso", desc:"Altitude 3. Ataques à distância têm -1d4. Pode atacar de altitude e retornar sem custo." }
    ],
    spells:["Olho do Destino (nível 3)","Rugido da Verdade (nível 3)"],
    behavior:"Prefere muito mais o enigma ao combate. Não luta se pode falar. Em combate: usa Olho do Destino defensivamente, mantém altitude e usa garras em mergulhos. Nunca persegue quem foge.",
    loot:[{item:"Pena de Esfinge (componente de magia de previsão)",chance:50,qty:"1d3"},{item:"Cristal de Conhecimento (responde 1 pergunta sim/não)",chance:25,qty:"1"},{item:"Ouro do Tesouro Guardado",chance:60,qty:"3d20"}] },

  { id:"elemental-terra", name:"Elemental de Terra", difficulty:3,
    attrs: {FOR:6,DEX:0,AGI:0,INT:0,SAB:1}, size:"grande", category:"Elemental",
    location: ["Caverna", "Montanha", "Planície"],
    hp:180, physDefense:9, magDefense:2, dodge:8,
    actions:2, damage:"2d8+1d6 (soco de pedra)",
    abilities:[
      { name:"Corpo de Rocha", desc:"Imune a dano cortante e perfurante. Resistência a dano contundente (-2 por dado). Fogo causa dano normal. Magia de terra cura (+1d8 por acerto de magia terrestre)." },
      { name:"Fundir no Chão", desc:"Em terreno natural (pedra, terra): pode submergir no chão como Ação livre. Emerge em qualquer ponto a até 8 hex no próximo turno. Enquanto submerso: imune a dano físico." },
      { name:"Tremor Local", desc:"1 Ação (1x/combate): soca o chão criando tremor em raio 3 hex — todos no chão testam AGI (normal) ou ficam Derrubados. Estruturas frágeis próximas tomam 10 de dano." },
      { name:"Golpe Sísmico", desc:"A cada 2 acertos consecutivos: o terceiro ataque causa +1d10 de dano extra (a força acumulada encontra o ponto fraco)." }
    ],
    spells:[], behavior:"Invocado ou guardião natural. Segue o caminho de menor resistência (vai pelo chão). Imperturbável e lento. Podem ser negociados por Clérigos de Thurgomur.",
    loot:[{item:"Coração de Pedra Viva (material divino)",chance:30,qty:"1"},{item:"Pedra Elemental (componente de magia de terra)",chance:70,qty:"1d4"},{item:"Cristal Geodo (decorativo e valioso)",chance:50,qty:"1d3"}] },

  { id:"gargoyle", name:"Gárgula Guardiã", difficulty:3,
    attrs: {FOR:3,DEX:1,AGI:2,INT:1,SAB:2}, size:"normal", category:"Construto",
    location: ["Planície", "Ruínas", "Templo"],
    hp:135, physDefense:8, magDefense:4, dodge:11,
    actions:3, damage:"1d8+1d6 (garras de pedra e chifres)",
    abilities:[
      { name:"Pedra Viva", desc:"Quando imóvel por 1 rodada completa: parece escultura de pedra (Percepção crítico para notar que está viva). Primeiro ataque após mimetismo: Crítico automático." },
      { name:"Voadora de Pedra", desc:"Altitude 2. Apesar do peso: voa de forma silenciosa. Ataques à distância têm -1d4 (corpo de pedra desvia projéteis). Pode carregar um alvo no voo (AGI difícil para escapar)." },
      { name:"Resistência Elemental", desc:"Reduz 3 pontos de todo dano físico. Dano de fogo reduzido pela metade. Magia de terra ou divina causa 1d6 extra (o encantamento que a criou é vulnerável)." },
      { name:"Guardiã Eterna", desc:"Nunca abandona o ponto que guarda. Persegue qualquer ameaça em raio 10 hex do ponto de guarda, mas para imediatamente se ultrapassar esse limite." }
    ],
    spells:[], behavior:"Guarda um ponto específico eternamente. Não ataca quem passa sem ameaçar o local. Pode ser confundida com decoração. Responde a palavra de comando de quem a criou.",
    loot:[{item:"Fragmento de Gárgula (material de pedra encantada)",chance:70,qty:"1d4"},{item:"Cristal de Encantamento (nucleo que a anima)",chance:30,qty:"1"}] },

  { id:"mercenario-elite", name:"Mercenário de Elite", difficulty:3,
    attrs: {FOR:3,DEX:3,AGI:3,INT:2,SAB:2}, size:"normal", category:"Humanoide",
    location: ["Cidade", "Dungeon", "Estrada"],
    hp:130, physDefense:7, magDefense:3, dodge:11,
    actions:3, damage:"1d10+1d6 (espada longa ou arco)",
    abilities:[
      { name:"Veterano de Batalha", desc:"Nunca entra em pânico ou fica Amedrontado. Imune à primeira Condição negativa de cada combate. +1d4 em todos os testes de combate." },
      { name:"Estrategista", desc:"1 Ação (1x/combate): analisa o campo de batalha — escolhe 1 alvo. Todos os ataques contra esse alvo pelo grupo ganham +1d4 de acerto por 2 rodadas." },
      { name:"Contra-Ataque Expert", desc:"Ao usar uma Reação defensiva com sucesso: pode imediatamente fazer 1 ataque contra o atacante sem custo adicional." },
      { name:"Arsenal Variado", desc:"Tem 3 opções de ataque disponíveis: (1) Espada + Escudo — +1 Def.Física, (2) Espada Dupla — +1 Ação de ataque, (3) Arco (alcance 10) — sem bonus/penalidade." }
    ],
    spells:[], behavior:"Profissional calculista. Avalia ameaças e prioriza as maiores. Pode ser corrompido por oferta maior que quem o contratou (INT alta). Em desvantagem clara: oferece trégua e informações.",
    loot:[{item:"Armadura de Mercenário (item raro)",chance:40,qty:"1"},{item:"Espada de Elite (arma rara)",chance:30,qty:"1"},{item:"Contrato de Contratante (pista)",chance:60,qty:"1"},{item:"Moedas de Ouro",chance:80,qty:"2d10"}] },

  { id:"serpente-vento", name:"Serpente do Vento", difficulty:3,
    attrs: {FOR:1,DEX:4,AGI:5,INT:1,SAB:2}, size:"normal", category:"Besta Elemental",
    location: ["Montanha", "Planície"],
    hp:115, physDefense:7, magDefense:6, dodge:11,
    actions:3, damage:"1d8+1d6 (mordida + vento cortante)",
    abilities:[
      { name:"Corpo de Vento", desc:"Pode se mover através de qualquer espaço não-sólido. Esquiva base 19 (o corpo é parcialmente intangível ao vento). Ataques físicos têm 25% de chance de passar sem dano (rola 1d4 — em 1, o golpe atravessa)." },
      { name:"Rajada Cegante", desc:"1 Ação: libera rajada em cone 3 hex — todos testam AGI (normal) ou ficam Cegos por 1 rodada e Empurrados 2 hex." },
      { name:"Corte de Vento", desc:"Pode atacar à distância de até 4 hex sem projétil — o vento que controla corta o ar. Alvo não pode usar escudo contra este ataque." },
      { name:"Véu de Ventos", desc:"Passivo: projéteis que a tenham como alvo têm 40% de chance de ser desviados pelo vento ao redor (rola 1d10 — em 1-4, o projétil desvia)." }
    ],
    spells:[], behavior:"Curiosa e fugaz. Ataca por breve períodos e recua. Nunca luta até a morte — foge quando abaixo de 40% HP. Serpentarianos que entendem Jurgmund podem comunicar-se com ela.",
    loot:[{item:"Escama de Vento (material leve, resistente)",chance:50,qty:"1d4"},{item:"Essência de Vento (componente mágico)",chance:40,qty:"1"}] },

  { id:"golem-carne", name:"Golem de Carne", difficulty:3,
    attrs: {FOR:5,DEX:0,AGI:0,INT:0,SAB:0}, size:"grande", category:"Construto",
    location: ["Dungeon"],
    hp:190, physDefense:7, magDefense:2, dodge:9,
    actions:2, damage:"1d12+1d8 (soco brutal)",
    abilities:[
      { name:"Tecido Morto", desc:"Imune a veneno e condições mentais. Vulnerável a fogo (+1d6 por dado). Dano cortante causa sangramento no golem — perde 1d4 HP por rodada por 3 rodadas (o sangue escorre)." },
      { name:"Partes Extras", desc:"Tem 6 braços adicionais costurados. Para cada 30 HP perdidos: perde 1 Ação mas ganha Reação de Agarrar automática quando atacado corpo a corpo." },
      { name:"Absorver Partes", desc:"Ao matar uma criatura adjacente: pode absorver parte do corpo — recupera 1d8 HP e ganha +1d4 no próximo ataque (a parte fresca adiciona força)." },
      { name:"Grito do Criador", desc:"Se o necromante que o criou estiver vivo e gritar uma ordem: o golem a obedece instantaneamente como Reação (mesmo que não seja seu turno)." }
    ],
    spells:[], behavior:"Robô de carne sem inteligência. Segue ordens simples do criador. Sem ordens: defende o espaço onde está. Foco em um alvo por vez até destruído.",
    loot:[{item:"Partes de Golem (material grotesco mas útil)",chance:60,qty:"1d4"},{item:"Núcleo de Animação (componente do necromante)",chance:30,qty:"1"},{item:"Diário do Criador (pista)",chance:20,qty:"1"}] }

,

  /* ══════════════════════════════════════════════════════════
     MONSTROS ADICIONAIS — Missões e Complementos
     ══════════════════════════════════════════════════════════ */

  /* ── Inimigos de missões faltantes ── */

  { id: "teldris-mago-traficante", name: "Teldris, o Mago Traficante", difficulty: 2, size: "normal", category: "Humanoide",
    location: ["Cidade", "Dungeon"],
    hp: 85, physDefense: 4, magDefense: 6, dodge: 12,
    attrs: {FOR:0,DEX:1,AGI:1,INT:4,SAB:3},
    actions: 2, damage: "1d6 (cajado) + magias",
    abilities: [
      { name: "Ilusionista", desc: "Cria duplicata ilusória de si mesmo (1 Ação de Magia). 50% de chance de ataques atingirem a ilusão. A ilusão desaparece ao receber qualquer dano." },
      { name: "Mente Fraturada", desc: "1 Ação de Magia: alvo testa SAB (normal) ou fica Confuso por 2 rodadas (age aleatoriamente)." }
    ],
    spells: ["Névoa Cinzenta (nível 2)", "Disfarce Menor (nível 3)"],
    behavior: "Usa capangas como escudo. Foge se capangas caírem. Negocia em posição de fraqueza — tem informações valiosas sobre redes de tráfico de criaturas. Nunca luta corpo a corpo.",
    loot: [{item:"Chave do Cofre",chance:100,qty:"1"},{item:"Documentos de Clientes",chance:100,qty:"1"},{item:"Poção de Invisibilidade",chance:60,qty:"1"},{item:"Ouro (2d20)",chance:100,qty:"1"}] },

  { id: "formiga-gigante-guerreira", name: "Formiga Gigante Guerreira", difficulty: 1, size: "normal", category: "Besta",
    location: ["Caverna", "Dungeon", "Floresta", "Planície"],
    hp: 40, physDefense: 3, magDefense: 0, dodge: 11,
    attrs: {FOR:2,DEX:1,AGI:1,INT:0,SAB:1},
    actions: 2, damage: "1d6+1d4 (mandíbulas cortantes)",
    abilities: [
      { name: "Exoesqueleto", desc: "Reduz dano cortante em 2 por ataque. Dano contundente é normal." },
      { name: "Ferômio de Alarme", desc: "Ao ser ferida abaixo de 50% HP: emite ferômio — todas as formigas aliadas em raio 8 hex ficam Alertas (+1d4 em Percepção e +1 Ação neste turno)." },
      { name: "Carga de Mandíbula", desc: "Se mover 2+ hexes e atacar: dano +1d4 e alvo testa AGI (normal) ou cai Derrubado." }
    ],
    spells: [],
    behavior: "Defensiva por natureza — não ataca quem não ameaçar o ninho ou a rainha. Em grupos de 3+: usam táticas de pinça (2 flanqueiam enquanto 1 ataca frontalmente, +1d4 de dano conjunto).",
    loot: [{item:"Mandíbula de Formiga Gigante (material resistente)",chance:50,qty:"1d2"},{item:"Mel Alquímico (ingrediente)",chance:30,qty:"1"}] },

  { id: "rainha-das-formigas", name: "Rainha das Formigas Gigantes", difficulty: 2, size: "grande", category: "Besta",
    location: ["Dungeon"],
    hp: 115, physDefense: 5, magDefense: 1, dodge: 8,
    attrs: {FOR:4,DEX:0,AGI:0,INT:2,SAB:3},
    actions: 2, damage: "1d10+1d6 (mandíbulas pesadas)",
    abilities: [
      { name: "Controle do Ninho", desc: "Enquanto viva: gera 1 Formiga Guerreira por rodada de qualquer cadáver de formiga adjacente (reconstitui as guardas)." },
      { name: "Ferômio Real", desc: "Todas as formigas em raio 10 hex têm +2 em todos os testes enquanto a rainha estiver viva e sem ameaça direta." },
      { name: "Presença Imponente", desc: "Qualquer criatura que se aproxime a 1 hex pela primeira vez testa SAB (normal) ou fica Intimidada por 1 rodada (−1d4 em ataques)." }
    ],
    spells: [],
    behavior: "Não ataca quem oferecer comida (qualquer item alimentar). Comunicável: pode ser negociada com Druida ou magia de comunicação animal. Se o ninho for ameaçado, combate sem recuo.",
    loot: [{item:"Mel Real de Formiga (componente mágico raro)",chance:80,qty:"1d3"},{item:"Cera da Rainha (selante mágico)",chance:40,qty:"1"}] },

  { id: "soldado-da-guarda", name: "Soldado da Guarda", difficulty: 2, size: "normal", category: "Humanoide",
    location: ["Cidade", "Dungeon", "Estrada", "Ruínas"],
    hp: 75, physDefense: 5, magDefense: 1, dodge: 12,
    attrs: {FOR:2,DEX:1,AGI:1,INT:1,SAB:1},
    actions: 2, damage: "1d8+1d4 (espada e escudo)",
    abilities: [
      { name: "Formação de Escudo", desc: "Se estiver adjacente a outro Soldado: ambos ganham +2 Defesa Física e +1 Ação de Reação compartilhada." },
      { name: "Brado de Alerta", desc: "1 Ação: grita chamando reforços — em 1d3 rodadas chegam 1d4 soldados adicionais se houver reservas disponíveis." },
      { name: "Disciplina Militar", desc: "Imune a Medo e Provocação. Segue ordens mesmo em desvantagem. Nunca foge sem ordem direta do superior." }
    ],
    spells: [],
    behavior: "Profissional e disciplinado. Não ataca inocentes mas não cede sem autoridade superior. Pode ser persuadido com credencial legítima (SAB difícil sem credencial, normal com).",
    loot: [{item:"Equipamento de Guarda (armadura e arma padrão)",chance:70,qty:"1"},{item:"Chave de Seção",chance:30,qty:"1"},{item:"Moedas (1d10 prata)",chance:60,qty:"1"}] },

  { id: "banshee-aliada", name: "Banshee", difficulty: 4, size: "normal", category: "Morto-Vivo",
    location: ["Cemitério", "Dungeon", "Pântano", "Ruínas"],
    hp: 85, physDefense: 8, magDefense: 7, dodge: 12,
    attrs: {FOR:0,DEX:3,AGI:5,INT:5,SAB:6},
    actions: 3, damage: "1d10 (toque psíquico — ignora Def Física)",
    abilities: [
      { name: "Intangível", desc: "Imune a todo dano físico de armas não-mágicas. Armas mágicas e magias causam dano normal. Fogo sagrado causa 1d8 extra." },
      { name: "Lamento da Banshee", desc: "1 Ação de Magia (1x a cada 2 rodadas): todos em raio 4 hex testam SAB (difícil) ou ficam Aterrorizados por 2 rodadas — só tentam fugir, nenhuma outra ação." },
      { name: "Toque de Dreno de Vida", desc: "Ataque bem-sucedido: além do dano, alvo perde 1d4 de SAB temporariamente (retorna após descanso longo). Se SAB chegar a 0: alvo cai Inconsciente." },
      { name: "Corpo de Névoa", desc: "Pode atravessar paredes e portas. Em área com muitos espíritos: regenera 5 HP por rodada." }
    ],
    spells: [],
    behavior: "Se aliada (invocada): foca no inimigo mais ameaçador ao conjurador. Se hostil: usa Lamento para paralisar e depois drena individualmente. Não persegue além de sua área territorial.",
    loot: [{item:"Essência de Banshee (componente para magias de medo)",chance:60,qty:"1"},{item:"Colar da Vítima (item da vida anterior)",chance:40,qty:"1"}] },

  { id: "tharak-draconico-adulto", name: "Tharak, Dracônico Vermelho Adulto", difficulty: 5, size: "colossal", category: "Dracônico",
    location: ["Caverna", "Montanha", "Ruínas"],
    hp: 320, physDefense: 10, magDefense: 6, dodge: 12,
    isElite: true,
    attrs: {FOR:8,DEX:4,AGI:3,INT:6,SAB:5},
    actions: 4, damage: "2d12+2d8 (garras + mordida) ou Sopro",
    abilities: [
      { name: "Sopro de Chamas (Doente)", desc: "Cone 6 hex: 4d10 de fogo. AGI (normal) para metade. Doente: 1 em 4 chances de o sopro falhar (rola 1d4, em 1 falha). Recarrega a cada 3 rodadas." },
      { name: "Escamas Dracônicas", desc: "Imune a fogo e calor. Resistência a dano cortante (−3 por dado). Vulnerável a frio (+1d8 por dado de frio)." },
      { name: "Ameaça Colossal", desc: "Ocupa 4 hexes. Qualquer criatura pequena ou normal em hexes adjacentes testa FOR (normal) por rodada ou é Empurrada 2 hexes (o corpo de Tharak pressiona)." },
      { name: "Doença Dracônica", desc: "Tharak está doente: HP máximo reduzido a 70% do normal, escamas caindo (Def Física 10 em vez de 12 normal). A condição é visível — Percepção (normal) detecta o sofrimento." },
      { name: "Pai Protetor", desc: "Se algum filhote estiver em perigo: +2d10 de dano em todos os ataques por 3 rodadas. Imune a Medo e qualquer efeito mental durante esse período." }
    ],
    spells: [],
    behavior: "Não é malévolo — está com medo e em dor. Comunica-se em dracônico antigo (SAB difícil para entender sem idioma). Se o grupo mostrar ausência de ameaça (embainhando armas, sentando): Tharak para de atacar e observa. Negociável se alguém oferecer cura ou proteção para os filhotes.",
    loot: [{item:"Escama de Dracônico Adulto (lendário)",chance:80,qty:"1d3"},{item:"Ouro do Tesouro de Tharak (4d20 moedas de ouro)",chance:100,qty:"1"},{item:"Gema Dracônica (decorativa e valiosa — 50 ouro cada)",chance:60,qty:"1d4"}] },

  { id: "cavaleiro-esqueletico-montado", name: "Cavaleiro Esquelético Montado", difficulty: 3, size: "grande", category: "Morto-Vivo",
    location: ["Cemitério", "Dungeon", "Planície", "Ruínas"],
    hp: 125, physDefense: 7, magDefense: 2, dodge: 11,
    attrs: {FOR:4,DEX:2,AGI:2,INT:1,SAB:0},
    actions: 3, damage: "1d10+1d8 (lança de osso + impacto do cavalo)",
    abilities: [
      { name: "Carga Mortal", desc: "Se mover 4+ hexes em linha reta e atacar: dano dobrado + alvo fica Derrubado automaticamente (sem teste). O cavalo continua até bater em obstáculo." },
      { name: "Cavaleiro e Montaria", desc: "O cavaleiro e o cavalo funcionam como uma unidade. Destruir o cavalo (HP 30, Def 3 separado): cavaleiro perde Carga Mortal e Movimento cai de 8 para 3, mas continua lutando." },
      { name: "Ossos da Guarda", desc: "Imune a veneno, medo e dano psíquico. Não sente dor — luta com 100% de eficiência até 0 HP." }
    ],
    spells: [],
    behavior: "Guardião de locais específicos. Usa Carga Mortal no primeiro turno se possível. Depois mantém pressão corpo a corpo com o cavaleiro. Focado em quem estiver mais perto do ponto que guarda.",
    loot: [{item:"Lança de Osso Encantado (arma rara)",chance:40,qty:"1"},{item:"Armadura do Cavaleiro (desgastada mas funcional)",chance:50,qty:"1"},{item:"Ferraduras do Cavalo Fantasma (material mágico)",chance:25,qty:"1"}] },

  { id: "espectro-faminto-invocado", name: "Espectro Faminto", difficulty: 2, size: "normal", category: "Morto-Vivo",
    location: ["Cemitério", "Dungeon", "Pântano", "Ruínas"],
    hp: 55, physDefense: 4, magDefense: 5, dodge: 12,
    attrs: {FOR:0,DEX:3,AGI:4,INT:2,SAB:3},
    actions: 2, damage: "1d8 (toque psíquico — ignora Def Física completamente)",
    abilities: [
      { name: "Intangível", desc: "Imune a dano físico de armas não-mágicas. Armas mágicas e magias causam dano normal." },
      { name: "Drenar SAB", desc: "Cada toque bem-sucedido drena 1d4 de SAB do alvo temporariamente (retorna após descanso longo). Se SAB chegar a 0: alvo fica Inconsciente por 2 rodadas." },
      { name: "Forma Sombria", desc: "Em escuridão total: invisível. Em penumbra: Esquiva +3. Luz sagrada cancela ambos os efeitos." }
    ],
    spells: [],
    behavior: "Predador de memórias e força vital. Foca em alvos com SAB mais alta (sente o potencial). Foge quando abaixo de 40% HP para área escura.",
    loot: [{item:"Essência de Espectro (componente mágico)",chance:50,qty:"1"}] }
,

  /* ═══════════════════════════════════════════════════════════════
     MONSTROS INSPIRADOS EM PATH OF EXILE
     Foco em mecânicas hexagonais: projéteis encadeados, auras de
     campo, totens, explosões de posição, portais, modifiers únicos
     ═══════════════════════════════════════════════════════════════ */

  /* ─── DIF 2 ──────────────────────────────────────────────────── */

  {
    id: "zumbi-explosivo",
    name: "Zumbi Explosivo",
    difficulty: 2,
    attrs: { FOR:3, DEX:0, AGI:0, INT:0, SAB:0 },
    size: "normal",
    category: "Morto-Vivo",
    location: ["Cemitério", "Dungeon", "Floresta", "Planície", "Ruínas"],
    hp: 75, physDefense: 4, magDefense: 0, dodge: 8,
    actions: 2,
    damage: "1d8+1d4 (soco podre) ou Explosão",
    isElite: false,
    abilities: [
      {
        name: "Explosão Cadavérica",
        desc: "Ao cair a 0 HP, o Zumbi explode imediatamente (sem Ação). Todos em raio 2 hex sofrem 2d6 de dano de putrefação (ignora Def.Física, usa Def.Mágica). AGI (normal) para metade. A explosão pode encadear — se outro Zumbi Explosivo morrer dentro do raio da explosão, ele também explode."
      },
      {
        name: "Avanço Imparável",
        desc: "Passivo: o Zumbi não para de avançar mesmo recebendo dano. Ao ser atingido, não é Derrubado nem Atordoado por qualquer efeito — apenas continua andando. Velocidade 4 em linha reta, nunca desvia."
      }
    ],
    hex: {
      layout: "Tático",
      hint: "Posicione Zumbis Explosivos próximos uns aos outros para criar reação em cadeia. Jogadores inteligentes tentarão empurrar um Zumbi para perto de outros antes de matar — o Mestre deve antecipar isso e posicioná-los espalhados. A ameaça real é o encadeamento, não o dano individual."
    },
    spells: [],
    behavior: "Avança em linha reta em direção ao inimigo mais próximo. Não tem inteligência tática — mas o agrupamento natural cria o perigo da cadeia explosiva. Necromantes usam eles como bombas humanas. Não comunicáveis.",
    loot: [{ item: "Fragmento de Osso Podre (ingrediente alquímico)", chance: 40, qty: "1d3" }]
  },

  {
    id: "arqueiro-glacial",
    name: "Arqueiro Glacial",
    difficulty: 2,
    attrs: { FOR:0, DEX:3, AGI:2, INT:1, SAB:1 },
    size: "normal",
    category: "Humanoide",
    location: ["Dungeon", "Floresta", "Montanha", "Planície"],
    hp: 70, physDefense: 4, magDefense: 3, dodge: 12,
    actions: 2,
    damage: "1d8+1d4 (flecha de gelo) — alcance 6 hex",
    abilities: [
      {
        name: "Rajada de Flechas de Gelo",
        desc: "1 Ação (1x/combate): dispara 3 flechas simultaneamente em 3 alvos diferentes a até 6 hex (ou no mesmo alvo 3 vezes). Cada flecha causa 1d6+DEX de frio. Todo alvo atingido acumula 1 carga de Gelo. Com 2 cargas: −2 Movimento. Com 3 cargas: Congelado (imóvel, FOR normal para escapar com 1 Ação)."
      },
      {
        name: "Flecha de Fuga",
        desc: "Reação ao ser atacado em corpo a corpo: pode imediatamente se mover 3 hex para trás (sem custo de Ação) antes de resolver o ataque. O ataque erra automaticamente se o movimento tirar o atacante do alcance."
      },
      {
        name: "Posição Elevada",
        desc: "Passivo: se estiver em hex de altitude maior que o alvo (plataforma, escada, colina), ganha +1 na Chance de Acerto e +1d4 de dano em todos os ataques à distância."
      }
    ],
    hex: {
      layout: "Preferência por altitude e distância",
      hint: "O Arqueiro Glacial deve sempre estar no hex mais alto disponível. Constrói cargas de Gelo sistematicamente — 3 cargas num alvo o congela. O grupo que não avançar rápido vai ser progressivamente imobilizado."
    },
    spells: [],
    behavior: "Mantém distância máxima e posição elevada. Alterna entre o alvo mais móvel (congelar o guerreiro veloz) e o mais vulnerável (destruir o mago). Se corpo a corpo é inevitável, usa Flecha de Fuga para reposicionar.",
    loot: [
      { item: "Flechas de Gelo (1d6 unidades)", chance: 60, qty: "1d6" },
      { item: "Arco Curto com Runa de Gelo (mágico fraco)", chance: 20, qty: "1" }
    ]
  },

  {
    id: "sacerdote-do-totem",
    name: "Sacerdote do Totem de Sangue",
    difficulty: 2,
    attrs: { FOR:0, DEX:1, AGI:1, INT:2, SAB:3 },
    size: "normal",
    category: "Humanoide",
    location: ["Cidade", "Floresta", "Pântano", "Ruínas"],
    hp: 60, physDefense: 4, magDefense: 5, dodge: 12,
    actions: 2,
    damage: "1d6+SAB (bastão ritual) ou Maldição",
    abilities: [
      {
        name: "Invocar Totem de Sangue",
        desc: "1 Ação: crava um Totem em qualquer hex vazio a até 4 hex. O Totem (HP 15, Def 0, imóvel) pulsa a cada rodada — todos os inimigos do Sacerdote em raio 3 hex do Totem sofrem 1d4 de dano de sangramento (cumulativo com outros sangramentos). O Sacerdote pode ter 2 Totens ativos simultaneamente. Destruir um Totem: 1 Ação de Combate adjacente."
      },
      {
        name: "Maldição do Sangramento",
        desc: "1 Ação de Magia: alvo a até 5 hex testea SAB (normal). Falha: Sangrando por 3 rodadas (1d6/rodada, não acumula com outras maldições de sangramento do mesmo sacerdote). O sacerdote cura 50% do dano de sangramento que o alvo sofrer enquanto estiver maldito."
      },
      {
        name: "Escudo de Totem",
        desc: "Passivo: enquanto houver pelo menos 1 Totem ativo em raio 6 hex, o Sacerdote recebe −2 de todos os danos (a energia dos Totens o protege). Se todos os Totens forem destruídos: o Sacerdote fica Vulnerável (+2 em todos os danos recebidos) por 2 rodadas."
      }
    ],
    hex: {
      layout: "Controle de zona com Totens",
      hint: "O Sacerdote deve colocar Totens nos hexes mais estratégicos — corredores que o grupo precisa cruzar, perto de aliados que precisam de suporte. A prioridade do grupo deve ser destruir os Totens antes de focar o Sacerdote."
    },
    spells: [],
    behavior: "Abre o combate com 2 Totens imediatamente. Depois aplica Maldição do Sangramento no alvo com mais HP. Se ameaçado em melee, recua para trás dos Totens usando-os como escudo zonal.",
    loot: [
      { item: "Totem Ritual (item de missão)", chance: 70, qty: "1" },
      { item: "Pó de Sangue Seco (componente alquímico)", chance: 50, qty: "1d4" }
    ]
  },

  /* ─── DIF 3 ──────────────────────────────────────────────────── */

  {
    id: "aranha-abissal-tecelã",
    name: "Aranha Abissal Tecelã",
    difficulty: 3,
    attrs: { FOR:2, DEX:4, AGI:4, INT:2, SAB:2 },
    size: "grande",
    category: "Besta Abissal",
    location: ["Caverna", "Dungeon", "Floresta"],
    hp: 145, physDefense: 7, magDefense: 4, dodge: 11,
    actions: 3,
    damage: "1d10+1d6 (garras aracnídeas) + veneno",
    abilities: [
      {
        name: "Teia do Abismo",
        desc: "1 Ação: lança teia que cobre área 3x3 hex a até 5 hex. Criaturas na área: Presas (FOR normal para escapar com 1 Ação). A teia persiste 4 rodadas. Criaturas Presas recebem +1d4 de dano acido por rodada (a teia corrói). Fogo destrói a teia instantaneamente em toda a área."
      },
      {
        name: "Passos Silenciosos",
        desc: "Passivo: move-se pelo teto e paredes sem custo extra de Movimento. Pode atacar de cima (altitude 4 hex) — ataques de cima causam +1d6 extra e os alvos não podem defender (apenas esquivar). Não pode ser Derrubada por efeitos de terreno."
      },
      {
        name: "Veneno Paralisante",
        desc: "A cada acerto com garras: alvo acumula 1 carga de Veneno Paralisante (máx 3). Com 1 carga: −1 Ação. Com 2 cargas: −2 Ações. Com 3 cargas: Paralizado completamente por 1 rodada, depois reseta para 0 cargas."
      },
      {
        name: "Invocar Filhotes",
        desc: "Ao cair abaixo de 40% HP (1x/combate): 1d4 Aranhas Filhotes (HP 10, Def 1, dano 1d4+veneno 1, Dif 1) emergem do abdômen. Cada filhote age independentemente mas herda o Veneno da mãe."
      }
    ],
    hex: {
      layout: "Combate tridimensional",
      hint: "A Aranha usa o teto como quinto eixo de movimento — marque altitude 4 nos hexes de teto disponíveis. O grupo precisa forçá-la para o chão (fogo na teia, magias de queda) ou alcançá-la com ataques à distância. Filhotes são prioridade de limpeza — cada um que acerta aplica veneno."
    },
    spells: [],
    behavior: "Abre com Teia do Abismo num corredor para bloquear o grupo. Ataca do teto quem ficar Preso. Quando abaixo de 40% HP, invoca filhotes e tenta reposicionar no teto atrás do grupo.",
    loot: [
      { item: "Glândula de Veneno Paralisante (componente raro)", chance: 60, qty: "1" },
      { item: "Fio de Teia Abissal (material mágico)", chance: 40, qty: "1d4" }
    ]
  },

  {
    id: "elemental-relampago-errante",
    name: "Elemental de Relâmpago Errante",
    difficulty: 3,
    attrs: { FOR:1, DEX:5, AGI:5, INT:2, SAB:1 },
    size: "normal",
    category: "Elemental",
    location: ["Dungeon", "Montanha", "Planície", "Ruínas"],
    hp: 115, physDefense: 7, magDefense: 8, dodge: 11,
    actions: 3,
    damage: "1d8+1d6 (descarga) — alcance 3 hex",
    abilities: [
      {
        name: "Salto do Relâmpago",
        desc: "Passivo de movimento: ao se mover, o Elemental não ocupa hexes intermediários — teleporta diretamente para o destino (até 6 hex) como relâmpago. Criaturas em qualquer hex pelo qual passaria (linha reta entre origem e destino) sofrem 1d4 de eletricidade. O salto não provoca Ataques de Oportunidade."
      },
      {
        name: "Cadeia de Relâmpagos",
        desc: "1 Ação (o ataque principal): dispara relâmpago em alvo a até 3 hex. O relâmpago encadeia — salta para o inimigo mais próximo do alvo inicial (até 2 hex de distância), depois encadeia de novo (até 2 hex do segundo). Máximo 4 alvos na cadeia. Dano: 1d8 no primeiro, −1d4 em cada salto subsequente. Criatura com armadura metálica não pode esquivar da cadeia."
      },
      {
        name: "Sobrecarga",
        desc: "Ao receber dano de fogo: dobra o próximo Salto do Relâmpago (12 hex em vez de 6) e a Cadeia de Relâmpagos afeta 6 alvos na próxima rodada. Ao receber dano de terra/pedra: Paralisado por 1 rodada (grounded)."
      },
      {
        name: "Forma de Tempestade",
        desc: "Passivo: imune a dano elétrico. Criaturas em hex adjacente ao Elemental recebem 1d4 de estática por rodada automaticamente (campo elétrico passivo). Armaduras metálicas: 1d6 em vez de 1d4."
      }
    ],
    hex: {
      layout: "Alta mobilidade e cadeia",
      hint: "O Elemental é mais perigoso quando o grupo está agrupado — a Cadeia de Relâmpagos pode atingir 4 personagens num único ataque. Grupos dispersos em 3+ hexes de separação cancelam a cadeia. Jogadores com armaduras metálicas (Cota de Malha, Armadura de Placas) são alvos prioritários — não podem esquivar."
    },
    spells: [],
    behavior: "Abre pulando para o centro do grupo para maximizar a cadeia. Foge para longe se atingido por pedra/terra (grounded). Se atingido por fogo aliado acidentalmente: dobra poder — o Mestre pode usar isso estrategicamente.",
    loot: [
      { item: "Núcleo de Relâmpago (material para armas elétricas)", chance: 50, qty: "1" },
      { item: "Essência Elétrica (componente mágico raro)", chance: 30, qty: "1" }
    ]
  },

  {
    id: "berseker-de-sangue-corrupto",
    name: "Berserker de Sangue Corrompido",
    difficulty: 3,
    attrs: { FOR:5, DEX:2, AGI:2, INT:0, SAB:0 },
    size: "normal",
    category: "Humanoide Corrompido",
    location: ["Dungeon", "Floresta", "Planície"],
    hp: 160, physDefense: 7, magDefense: 1, dodge: 11,
    actions: 3,
    damage: "1d12+1d8 (machado de sangue)",
    abilities: [
      {
        name: "Frenesi Sanguíneo",
        desc: "Passivo escalável: cada acerto que o Berserker sofre (sem matar) aumenta seu dano em +1d4 (máx +4d4). Ao ser curado por qualquer fonte: perde todas as cargas de Frenesi. 'Quanto mais sangra, mais mata.'"
      },
      {
        name: "Tornado de Machado",
        desc: "1 Ação (1x a cada 2 rodadas): gira com o machado, atingindo TODOS em raio 2 hex. Dano: 1d10+FOR+Frenesi atual. Cada criatura atingida testa FOR (normal) ou é empurrada 2 hex para fora do raio. Pode ser interrompido se o Berserker for Derrubado antes de completar (no início do turno)."
      },
      {
        name: "Carga Furiosa",
        desc: "1 Ação: move até 5 hex em linha reta e ataca o primeiro inimigo no caminho. Dano: 2d8+FOR. O alvo testa AGI (difícil) ou fica Derrubado. Criaturas no caminho (não o alvo final) sofrem 1d4 de atropelamento."
      },
      {
        name: "Desejo de Morte",
        desc: "Passivo: ao cair abaixo de 25% HP, entra em Êxtase de Morte — ataca 2 vezes por Ação (em vez de 1), mas qualquer dano recebido no Êxtase é dobrado. Dura até morrer ou combate terminar. Não pode ser curado durante o Êxtase."
      }
    ],
    hex: {
      layout: "Melee agressivo de alta pressão",
      hint: "O Tornado de Machado é a habilidade mais perigosa — empurra o grupo para fora de posição e causa dano em área. Personagens na borda de precipícios ou obstáculos devem tomar cuidado com o empurrão de 2 hex. Curar o Berserker reseta o Frenesi — isso pode ser usado estrategicamente se o grupo tiver acesso a magias de cura inimiga."
    },
    spells: [],
    behavior: "Abre com Carga Furiosa no alvo mais blindado. Usa Tornado de Machado quando 2+ inimigos estão em raio 2. No Êxtase de Morte: foca no alvo com menos HP para matar rápido antes de morrer.",
    loot: [
      { item: "Machado de Sangue (arma rara danificada)", chance: 30, qty: "1" },
      { item: "Cristal da Corrupção (material do Deus Marcado)", chance: 50, qty: "1d2" }
    ]
  },

  /* ─── DIF 4 ──────────────────────────────────────────────────── */

  {
    id: "lich-portais-fracturados",
    name: "Lich dos Portais Fraturados",
    difficulty: 4,
    attrs: { FOR:1, DEX:4, AGI:4, INT:7, SAB:6 },
    size: "normal",
    category: "Morto-Vivo Elite",
    location: ["Dungeon", "Ruínas", "Templo"],
    hp: 210, physDefense: 8, magDefense: 10, dodge: 12,
    actions: 4,
    damage: "1d8+INT (raio arcano) — alcance 5 hex",
    isElite: true,
    abilities: [
      {
        name: "Portal de Reposicionamento",
        desc: "1 Ação (ilimitado): cria par de portais em 2 hexes vazios a até 8 hex. Qualquer criatura que entrar num portal sai pelo outro imediatamente. O Lich usa isso para: se teletransportar para longe, reposicionar aliados, ou FORÇAR inimigos através do portal (alvo no hex do portal testa AGI difícil ou é sugado para o outro lado — para dentro de armadilha, precipício, ou grupo inimigo). Portais duram 2 rodadas."
      },
      {
        name: "Projéteis Orbitais",
        desc: "Passivo + Ativo. Passivo: 3 Orbes de energia orbitam o Lich — qualquer ataque físico que o acertar tem 30% de chance (d10 ≤ 3) de ser interceptado por um Orbe (anulado). Quando Orbe intercepta: é destruído. Ativo (1 Ação): dispara 1 Orbe em alvo a 6 hex (2d8+INT de dano arcano). Orbes se regeneram (1 por rodada, máx 3)."
      },
      {
        name: "Campo de Fragmentação",
        desc: "1 Ação de Magia (1x/combate): cria campo em área 5x5 hex que fragmenta o espaço por 3 rodadas. No campo: Movimento custa 2 por hex (em vez de 1), ataques à distância têm −2 na Chance de Acerto (o espaço distorce a trajetória), e portais do Lich custam 0 Ações (movimento livre). O campo é visível — névoa distorcida."
      },
      {
        name: "Absorção Arcana",
        desc: "Reação ao receber dano mágico: absorve 50% do dano e converte em 1 Orbe adicional (além dos 3 orbitais, máx 5 durante absorção). Se absorver 20+ pontos de dano mágico num turno: no turno seguinte lança Raio de Descarga usando todos os Orbes extras — 1d10 por Orbe, 1 alvo à escolha."
      }
    ],
    hex: {
      layout: "Controle dimensional de campo",
      hint: "Os Portais são a mecânica central — o Lich pode mover inimigos para dentro do Campo de Fragmentação ou separar o grupo. Identificar onde os portais vão aparecer e reposicionar antes é crucial. Orbes Orbitais: ataques rápidos (múltiplos por turno) esgotam os Orbes rapidamente — depois o Lich fica vulnerável a físico por 1-2 rodadas."
    },
    spells: [],
    behavior: "Abre com Campo de Fragmentação sobre o grupo inteiro. Usa portais para se manter a 5+ hex do grupo. Dispara Orbes nos conjuradores. Se o grupo se aproxima em melee: portal imediato para trocar de posição. Absorve magias de área deliberadamente para carregar a Descarga.",
    loot: [
      { item: "Olho de Portal (artefato dimensional raro)", chance: 40, qty: "1" },
      { item: "Cristal de Orbe Orbital (material mágico)", chance: 60, qty: "1d3" },
      { item: "Grimório Fraturado (magia de portal nível 4)", chance: 25, qty: "1" }
    ]
  },

  {
    id: "hidra-de-veneno-abissal",
    name: "Hidra de Veneno Abissal",
    difficulty: 4,
    attrs: { FOR:6, DEX:3, AGI:2, INT:2, SAB:3 },
    size: "colossal",
    category: "Besta Lendária",
    location: ["Caverna", "Pântano"],
    hp: 240, physDefense: 8, magDefense: 4, dodge: 10,
    actions: 4,
    damage: "1d12+1d8+FOR (mordida por cabeça ativa)",
    isElite: true,
    abilities: [
      {
        name: "Três Cabeças Ativas",
        desc: "A Hidra começa com 3 cabeças ativas. Cada cabeça tem HP independente de 30 e pode ser alvo separado (requer declarar 'ataco a Cabeça X' antes de rolar). Cabeça destruída: 1 Ação por rodada é perdida. Ao cortar uma cabeça sem fogo ou ácido: 2 novas cabeças crescem na próxima rodada (máx 5 cabeças). Fogo ou ácido na cabeça cortada: cauteriza (não regenera)."
      },
      {
        name: "Cuspe de Veneno em Área",
        desc: "1 Ação por cabeça ativa (1x/2 rodadas por cabeça): projeta veneno em cone 3 hex. Todos no cone: 1d8 de veneno imediato + Envenenado (1d6/rodada, 3 rodadas). SAB (difícil) para metade do imediato e resistir ao Envenenado."
      },
      {
        name: "Corpo Colossal",
        desc: "Passivo: ocupa 6 hexes. Criaturas adjacentes ao corpo (não às cabeças) sofrem 1d6 de esmagamento no início de cada turno delas (o peso do corpo pressiona o terreno). Não pode ser Derrubada ou Empurrada por qualquer fonte."
      },
      {
        name: "Regeneração Hidra",
        desc: "Passivo: regenera 8 HP no início de cada turno. Fogo cancela a regeneração por 1 rodada. Ácido cancela por 2 rodadas. Cabeças destruídas por fogo/ácido não regeneram mas o corpo continua regenerando HP."
      }
    ],
    hex: {
      layout: "Boss de múltiplos alvos",
      hint: "A decisão de cortar cabeças vs destruir o corpo é o dilema central. Cortar sem cauterizar cria mais cabeças e mais Ações. A estratégia correta: focar o corpo (mais HP, mais difícil) ou ter fogo/ácido preparado para cada cabeça cortada. Dividir o dano entre cabeças desperdiça — foque uma de cada vez."
    },
    spells: [],
    behavior: "Cabeças atacam alvos separados (maximiza pressão). Se o grupo se agrupa: Cuspe de Veneno em Área em área central. Mantém posição — não persegue inimigos além de 4 hex (o corpo é muito grande). Foca caçadores de cabeça (quem estiver atacando as cabeças mais frequentemente).",
    loot: [
      { item: "Veneno de Hidra Abissal (ingrediente lendário)", chance: 80, qty: "1d3" },
      { item: "Escama de Hidra (material de armadura rara)", chance: 60, qty: "1d6" },
      { item: "Dente de Cabeça Cauterizada (talismã de resistência)", chance: 30, qty: "1" }
    ]
  },

  /* ─── DIF 5 ──────────────────────────────────────────────────── */

  {
    id: "guardiao-do-nexo",
    name: "Guardião do Nexo",
    difficulty: 5,
    attrs: { FOR:6, DEX:5, AGI:5, INT:8, SAB:7 },
    size: "colossal",
    category: "Construto Lendário",
    location: ["Dungeon", "Planície", "Pântano", "Templo"],
    hp: 345, physDefense: 12, magDefense: 12, dodge: 13,
    isElite: true,
    actions: 5,
    damage: "2d10+1d8 (garras do nexo) ou Magias",
    abilities: [
      {
        name: "Fases do Nexo",
        desc: "O Guardião tem 3 Fases baseadas em HP: Fase 1 (300-200 HP): padrão. Fase 2 (199-100 HP): ganha +1 Ação por turno, Def.Física e Mágica aumentam +2, projéteis em todas as direções a cada 2 rodadas (1d8 arcano em raio 4 hex). Fase 3 (99-1 HP): mais 5 Ações por turno, imune a condições de controle, projéteis constantes (1d8 todo turno). Em cada transição de fase: todos os efeitos ativos no Guardião são removidos (buffs e debuffs)."
      },
      {
        name: "Raio do Nexo",
        desc: "1 Ação: dispara raio em linha reta de 10 hex de comprimento. Dano: 3d10+INT em qualquer criatura na linha. AGI (difícil) para metade. O raio não para em obstáculos — atravessa paredes, pilares e cobertura. Pode ser usado em qualquer direção."
      },
      {
        name: "Campo de Anulação",
        desc: "Passivo (Fase 2+): campo em raio 3 hex ao redor do Guardião. No campo: magias custam +1 Ação de Magia para lançar, Slots de Magia utilizados no campo causam 1d6 de dano ao conjurador (o Nexo drena energia arcana), e itens com Cargas perdem 1 Carga por rodada que o portador ficar no campo."
      },
      {
        name: "Reconfiguração do Terreno",
        desc: "1 Ação (Fase 1: 1x/combate, Fase 2: 1x/2 rodadas, Fase 3: 1x/rodada): reorganiza o campo de batalha. O Guardião escolhe: (A) eleva 3 hexes ao nível 2 de altitude (cria cobertura), (B) abre 3 hexes de abismo (queda 2d8, criaturas neles caem), ou (C) troca 2 criaturas de posição (ambas testam AGI difícil para resistir). Afeta tanto aliados quanto inimigos do Guardião."
      },
      {
        name: "Absorver e Refletir",
        desc: "Reação (Fase 3 apenas): ao receber magia de dano de área: absorve e relança a mesma magia centrada em outro ponto escolhido pelo Mestre (dentro do alcance original). O Guardião não sofre dano da magia absorvida."
      }
    ],
    hex: {
      layout: "Boss de campo completo — reorganiza o terreno",
      hint: "A Reconfiguração do Terreno é a mecânica mais caótica — o mapa muda durante o combate. Mantenha registro de altitude e abismos. Na Fase 3: o Guardião reage a magias de área relançando-as — magias de dano em área se tornam perigosas para o próprio grupo. A transição de fase remove todos os debuffs — não acumule efeitos de controle perto de 200 e 100 HP."
    },
    spells: ["Raio do Nexo (linha 10 hex, 3d10+INT)", "Projéteis do Nexo (raio 4 hex, 1d8 arcano)", "Absorver e Refletir (Fase 3)"],
    behavior: "Fase 1: testa o grupo com Raios e Reconfigurações defensivas. Fase 2: pressão constante — usa Campo de Anulação para neutralizar magos. Fase 3: modo caos — tudo na velocidade máxima. O Guardião nunca recua — é o Nexo. O Nexo não vai a lugar algum.",
    loot: [
      { item: "Núcleo do Nexo (artefato único — poder dimensional)", chance: 100, qty: "1" },
      { item: "Fragmento do Construto (material para armadura lendária)", chance: 100, qty: "1d4" },
      { item: "Essência do Campo de Anulação (magia de anel negação)", chance: 60, qty: "1" }
    ]
  },

  {
    id: "arauto-da-tormenta-negra",
    name: "Arauto da Tormenta Negra",
    difficulty: 5,
    attrs: { FOR:4, DEX:7, AGI:7, INT:8, SAB:8 },
    size: "grande",
    category: "Entidade do Caos",
    location: ["Montanha", "Planície", "Templo"],
    hp: 300, physDefense: 9, magDefense: 14, dodge: 13,
    isElite: true,
    actions: 5,
    damage: "2d8+1d10 (garras de tormenta) ou Magias de Tempestade",
    abilities: [
      {
        name: "Olho da Tormenta",
        desc: "Passivo permanente: o Arauto está sempre no centro de uma tempestade pessoal. Todos em raio 4 hex: −2 em testes de ataque à distância (vento), 1d4 de dano elétrico por rodada (estática), e Movimento custa +1 por hex (rajadas). O Arauto é imune a esses efeitos. Entrar no hex do Arauto (raio 0): 2d6 de raio automático."
      },
      {
        name: "Chamado da Tormenta",
        desc: "1 Ação (1x/2 rodadas): invoca Tormenta em hex escolhido a até 8 hex. No próximo turno do Arauto: 3 raios caem em hexes aleatórios dentro de raio 3 do ponto escolhido (2d8 cada, sem esquiva — apenas Def.Mágica). O ponto é marcado visivelmente — o grupo tem 1 turno inteiro para sair da área."
      },
      {
        name: "Velocidade Relâmpago",
        desc: "Passivo: o Arauto pode se mover como Ação Livre (sem custo de Ação) até 4 hex uma vez por rodada. Esta movimentação não provoca Ataques de Oportunidade e acontece DURANTE a rodada (pode ser feita entre Ações)."
      },
      {
        name: "Descarga Total",
        desc: "1 Ação (1 uso/combate): o Arauto sobe a altitude máxima disponível e libera toda a energia acumulada. Cone de 6 hex em todas as 6 direções simultaneamente (360°): 4d10+INT de dano elétrico. AGI (crítico) para metade. Imune a elétrico neste turno. Após a Descarga: Olho da Tormenta expande para raio 6 por 3 rodadas."
      },
      {
        name: "Relâmpago Encadeado Implacável",
        desc: "Substitui Ação de Ataque normal: dispara relâmpago que encadeia entre TODOS os inimigos visíveis (sem máximo de alvos). Dano inicial: 2d8+INT. Cada salto: −1d4 de dano (mínimo 1d4). O encadeamento para apenas quando não há mais alvos em raio 3 do último atingido."
      }
    ],
    hex: {
      layout: "Mobilidade extrema + dano de área em toda a grade",
      hint: "A dispersão máxima do grupo (5+ hex de separação) neutraliza o Relâmpago Encadeado mas expõe cada personagem à Tormenta individualmente. O Olho da Tormenta cria zona de exclusão constante — ninguém deve ficar em raio 4 por mais de 1 rodada. Chamado da Tormenta: identificar o marcador e TODOS saírem da área é prioridade absoluta."
    },
    spells: ["Chamado da Tormenta (raios aleatórios, área 3 hex)", "Descarga Total (360°, 4d10+INT)", "Relâmpago Encadeado Implacável (todos os alvos)"],
    behavior: "Nunca fica parado — usa Velocidade Relâmpago entre cada Ação para manter distância de melee. Usa Chamado da Tormenta em clusters do grupo. Reserva Descarga Total para quando 3+ personagens estão no cone. Prioriza conjuradores (anula vantagem mágica com o Olho da Tormenta).",
    loot: [
      { item: "Essência da Tormenta Negra (material lendário para armas)", chance: 80, qty: "1" },
      { item: "Olho do Arauto (talismã que concede Velocidade Relâmpago 1x/dia)", chance: 40, qty: "1" },
      { item: "Fragmento de Descarga Total (componente para magia de relâmpago 5)", chance: 30, qty: "1" }
    ]
  },

  /* ─── MINI-BOSS ESPECIAL — Dif 3 com mecânica única ─────────── */

  {
    id: "colosso-de-magma-fundido",
    name: "Colosso de Magma Fundido",
    difficulty: 3,
    attrs: { FOR:7, DEX:0, AGI:0, INT:1, SAB:1 },
    size: "colossal",
    category: "Elemental Lendário",
    location: ["Dungeon", "Montanha"],
    hp: 215, physDefense: 10, magDefense: 2, dodge: 6,
    actions: 2,
    damage: "2d8+1d10+FOR (soco de magma) — área 2 hex de respingo",
    isElite: true,
    abilities: [
      {
        name: "Rastro de Lava",
        desc: "Passivo: cada hex que o Colosso percorre vira Lava Ativa por 3 rodadas. Criaturas que entrarem ou terminarem turno em hex de lava: 2d6 de dano de fogo. O Colosso pode atravessar sua própria lava sem dano. O rastro de lava cria barreiras naturais no mapa conforme o Colosso se move."
      },
      {
        name: "Explosão Vulcânica",
        desc: "1 Ação (1x/combate): salta para hex a até 5 hex, causando ao pousar 3d8 de dano de impacto em raio 3 hex. O salto cria Lava Ativa em todos os hexes do raio 3. AGI (difícil) para metade do dano. O salto pode ser usado sobre obstáculos."
      },
      {
        name: "Armadura de Rocha Vulcânica",
        desc: "Passivo: imune a fogo e calor. Resistência a dano físico (−3 por dado de dano físico). Vulnerável a água e gelo (+1d8 por dado de dano de frio). Ao receber dano de gelo: perde 2 de Def.Física permanentemente (a rocha racha) até o fim do combate, cumulativo."
      },
      {
        name: "Respingo de Magma",
        desc: "Passivo em todos os ataques físicos do Colosso: ao acertar, magma respinga — todos em hexes adjacentes ao alvo (não o alvo principal) sofrem 1d6 de fogo. Inimigos com armadura metálica: 1d8 de fogo."
      }
    ],
    hex: {
      layout: "Controle de zona com lava",
      hint: "O Rastro de Lava é a mecânica mais impactante — o Colosso literalmente reduz o espaço navegável do mapa a cada turno. Após 4 rodadas, metade do mapa pode ser lava. Forçar o Colosso a se mover em círculos (usando obstáculos e paredes) cria mais lava em zonas menos importantes. Gelo é a fraqueza — cada hit de gelo enfraquece a armadura."
    },
    spells: [],
    behavior: "Avança em linha reta para o grupo mais denso. Usa Explosão Vulcânica para pular sobre obstáculos quando cercado. Não persegue inimigos que fogem — mas o rastro de lava fecha o mapa progressivamente, tornando a fuga impossível.",
    loot: [
      { item: "Núcleo de Magma Fundido (material para armas de fogo)", chance: 70, qty: "1" },
      { item: "Escama de Rocha Vulcânica (material de armadura)", chance: 60, qty: "1d4" },
      { item: "Cristal de Magma (gema decorativa valiosa — 30 ouro)", chance: 40, qty: "1d3" }
    ]
  },

  {
    id: "espectro-do-eco",
    name: "Espectro do Eco",
    difficulty: 3,
    attrs: { FOR:0, DEX:4, AGI:6, INT:5, SAB:5 },
    size: "normal",
    category: "Morto-Vivo Etéreo",
    location: ["Cemitério", "Dungeon", "Planície", "Templo"],
    hp: 110, physDefense: 7, magDefense: 9, dodge: 11,
    actions: 3,
    damage: "1d8+SAB (toque etéreo — ignora Def.Física)",
    abilities: [
      {
        name: "Cópia do Eco",
        desc: "1 Ação (1x/combate): o Espectro cria 2 cópias de si mesmo em hexes adjacentes. As cópias têm HP 1 e as mesmas estatísticas de ataque mas não têm habilidades especiais. O Espectro original se torna INDISTINGUÍVEL das cópias — mesmo com Percepção ou Arcanismo não é possível identificá-lo até que uma cópia seja destruída (Percepção difícil ao destruir: identifica se era a cópia ou o original pelo calor residual). As cópias atacam normalmente."
      },
      {
        name: "Eco do Último Feitiço",
        desc: "Passivo: toda vez que um conjurador usar uma magia de dano em raio 3 hex do Espectro, o Espectro 'memoriza' a magia. Na próxima rodada, pode reproduzir a magia como Ação (gratuitamente, sem Slot, mesmo que não conheça) centrada em qualquer hex a até 5 hex. O Eco causa 75% do dano original."
      },
      {
        name: "Atravessar",
        desc: "Passivo: pode se mover através de paredes, pilares e criaturas sem custo extra. Criaturas que o Espectro atravessa (hex passante) testam Força de Vontade (normal) ou ficam com −1d4 nos ataques por 1 rodada (o frio do espectro paralisa momentaneamente)."
      },
      {
        name: "Intangível",
        desc: "Passivo: imune a dano de armas não-mágicas. Vulnerável a dano sagrado (+1d8 por dado). Em luz direta (tocha, magia de luz): perde Atravessar e Cópia do Eco por 2 rodadas (luz o ancora ao plano físico)."
      }
    ],
    hex: {
      layout: "Ilusão e controle de identidade",
      hint: "As 3 cópias são o desafio principal — o grupo tem 1/3 de chance de acertar o original a cada ataque. Tocha ou magia de luz remove as habilidades especiais, tornando-o muito mais vulnerável. Eco do Último Feitiço: cuidado com magias de área próximas ao Espectro — ele pode devolvê-las. Magos devem usar ataques focados, não área."
    },
    spells: [],
    behavior: "Cria cópias imediatamente. Atravessa paredes para atacar o mago (alvo prioritário — para copiar magias). Se iluminado: retrocede para a escuridão usando Atravessar em paredes. Eco de magias de área poderosas é a maior ameaça que oferece.",
    loot: [
      { item: "Essência do Eco (componente para magia de cópia)", chance: 50, qty: "1" },
      { item: "Fragmento Etéreo (material mágico)", chance: 40, qty: "1d2" }
    ]
  },

  /* ═══════════════════════════════════════════════════════════════
     MONSTROS INSPIRADOS EM BALDUR'S GATE 3
     Mecânicas de arena: o campo é parte da solução.
     Cada monstro tem lore próprio de Aether e condição de encontro.
     ═══════════════════════════════════════════════════════════════ */

  /* ─── DIF 2 — Encontros com twist de arena ───────────────────── */

  {
    id: "bruxa-do-jardim-venenoso",
    name: "Velnara, a Herborista",
    difficulty: 3,
    attrs: { FOR:0, DEX:2, AGI:1, INT:5, SAB:6 },
    size: "normal",
    category: "Humanoide Corrompido",
    location: ["Cidade", "Floresta", "Planície"],
    hp: 125, physDefense: 7, magDefense: 8, dodge: 11,
    actions: 3,
    damage: "1d6+SAB (cajado envenenado) ou Magias de Veneno",
    isElite: true,
    lore: "Velnara era uma respeitada herborista em Margem das Pedras — mulher gentil, conhecida por suas poções de cura. Há dois anos desapareceu sem explicação. O que voltou usa seu rosto mas não tem sua voz. A herborista real, Mirna Voss, está presa numa gaiola de raízes no centro do jardim — viva, semiconsciente, sendo drenada lentamente. Se o grupo encontrar Mirna primeiro: ela sussurra 'a sombra no espelho... ela me usou... pegue a chave de marfim no vaso de rosas negras'. A chave de marfim desativa as Raízes do Jardim.",
    encounterSetup: "O grupo encontra a casa de Velnara através de: (A) Missão de Mirna — alguém quer saber onde ela está. (B) Viajantes que passaram pelo caminho que nunca chegaram ao destino. (C) O jardim em si — plantas de cores impossíveis visíveis da estrada. A 'Herborista' recebe o grupo normalmente com chá. O veneno do chá é lento — ativa apenas no segundo turno de combate se algum personagem bebeu.",
    abilities: [
      {
        name: "Jardim Venenoso — Aura de Campo",
        desc: "MECÂNICA DE ARENA: enquanto Velnara estiver viva, o jardim inteiro exala névoa tóxica. No início de cada rodada: todos (exceto Velnara) em qualquer hex do campo sofrem 1d4 de veneno de névoa. Não pode ser evitado — apenas resistido (Resistência difícil para imune nesta rodada, 1x por personagem). Destruir os 4 Vasos de Ervas Negras (HP 20 cada, Def 0 — nos quatro cantos do mapa) remove a névoa do campo inteiro. Com todos os 4 vasos destruídos: Velnara perde também o Escudo de Raízes."
      },
      {
        name: "Raízes do Jardim",
        desc: "1 Ação: invoca raízes de qualquer hex de terra a até 5 hex. Alvo no hex: Preso (FOR normal para escapar, 1 Ação). As raízes duram 3 rodadas. Vasos Negros destruídos reduzem o alcance (-1 hex por vaso). Com todos vasos destruídos: esta habilidade desativa. A chave de marfim (com Mirna) desativa imediatamente."
      },
      {
        name: "Escudo de Raízes",
        desc: "Passivo: enquanto os 4 Vasos estiverem intactos, Velnara é Intocável — ataques físicos a ricocheteiam em raízes (automaticamente deflectidos). Magias causam metade do dano. Com todos os vasos destruídos: perde completamente. Com 1-3 vasos destruídos: apenas metade dos ataques físicos passam."
      },
      {
        name: "Veneno da Transformação",
        desc: "1 Ação de Magia: projeta veneno especial em alvo a 4 hex. SAB (difícil) para resistir. Falha: alvo começa a se transformar — por 3 rodadas perde 1 SAB e 1 INT temporariamente (a transformação que ela fez em si mesma). Se SAB ou INT chegar a 0: fica confuso permanentemente até cura mágica."
      }
    ],
    hex: {
      layout: "Jardim 12x10 com 4 vasos nos cantos e gaiola central",
      terrain: [
        "Canteiros de flores (cobertura leve — +1 Furtividade)",
        "4 Vasos de Ervas Negras (nos 4 cantos — HP 20 cada, Def 0)",
        "Gaiola de Raízes (centro — Mirna dentro, Intocável enquanto Velnara viver)",
        "Fonte Envenenada (centro-norte — quem beber: Envenenado 3 rodadas)",
        "Estufa de Vidro (nordeste — cobertura pesada, Velnara começa aqui)"
      ],
      hint: "Dividir o grupo: metade destrói Vasos, metade pressiona Velnara. Com todos os vasos destruídos, ela perde o Escudo e as Raízes — fica vulnerável em 1 turno. Prioridade: VAsos primeiro, Velnara depois. Personagem com Resistência alta pode ignorar a névoa e focar em Velnara diretamente enquanto os outros destroem os vasos."
    },
    spells: ["Névoa Tóxica (campo inteiro, passivo)", "Raízes do Jardim (5 hex)", "Veneno da Transformação"],
    behavior: "Finge hospitalidade até o primeiro ataque. Imediatamente recua para a estufa (cobertura pesada). Usa Raízes para Prender quem se aproximar dos Vasos. Foca Veneno da Transformação no personagem com mais INT ou SAB. Se todos os Vasos caírem: entra em pânico e tenta negociar — mas está mentindo.",
    loot: [
      { item: "Chave de Marfim (liberta Mirna)", chance: 100, qty: "1" },
      { item: "Diário de Velnara (processo da transformação — informação de arco)", chance: 100, qty: "1" },
      { item: "Extrato do Jardim Negro (veneno raro — Veneno da Transformação 3 doses)", chance: 60, qty: "1" },
      { item: "Grimório de Herbalismo Corrompido (magia de Veneno Nível 3)", chance: 40, qty: "1" }
    ]
  },

  {
    id: "constructo-da-forja-antiga",
    name: "Constructo da Forja de Durrak",
    difficulty: 4,
    attrs: { FOR:8, DEX:0, AGI:0, INT:1, SAB:1 },
    size: "colossal",
    category: "Construto",
    location: ["Caverna", "Dungeon"],
    hp: 330, physDefense: 14, magDefense: 2, dodge: 5,
    actions: 3,
    damage: "2d10+1d8+FOR (braço de prensa) ou Jato de Fogo",
    isElite: true,
    lore: "Os anões de Durrak construíram este Constructo há 400 anos para guardar a câmara de fundição mais profunda — onde o Ferro Negro puro era processado. O Constructo nunca recebeu ordem de descansar. Seus criadores morreram, a forja foi abandonada, mas ele continua sua ronda há quatro séculos, aquecendo os fornos que não precisam mais funcionar, prensando metal que não existe mais. Encontrá-lo requer descer até o Nível 3 da Mina de Durrak (missão da cadeia Muralha de Durrak) — ele guarda a câmara que contém o Ferro Negro puro necessário para a armadura de Dunforge.",
    encounterSetup: "O grupo desce pela mina. Temperatura aumenta a cada nível. No Nível 3: o calor é sufocante (Resistência normal a cada 10 min ou −1 FOR temporária). A câmara tem teto alto (6 hex de altura) com uma Prensa Colossal no teto — cilindro de pedra e ferro de 8 toneladas suspenso por correntes envelhecidas. O Constructo patrulha. Há uma alavanca no lado norte da câmara. Os anões sabiam que precisariam de uma forma de destruí-lo se necessário.",
    abilities: [
      {
        name: "Prensa Colossal — Mecânica de Arena",
        desc: "MECÂNICA DE ARENA: No teto da câmara, há uma Prensa de 8 toneladas presa por 3 Correntes (HP 25 cada, Def 3). Destruir todas as 3 correntes faz a Prensa cair sobre o hex central da câmara. Se o Constructo estiver no hex central ou em qualquer hex adjacente (raio 2): sofre 8d10 de dano esmagamento — suficiente para destruí-lo se estiver abaixo de 180 HP. Com HP cheio: o golpe causa dano mas não o destrói (precisa ser enfraquecido primeiro). Há também uma ALAVANCA no norte (Percepção difícil para notar) — usá-la (1 Ação adjacente) faz a Prensa cair imediatamente, mas a Alavanca está do outro lado da câmara do Constructo."
      },
      {
        name: "Armadura Indestrutível",
        desc: "Passivo: Def.Física 14 — dificilmente penetrável. Imune a veneno, fogo, e condições mentais. Vulnerável a dano elétrico (+1d6 por dado) — o sistema elétrico interno é antiquado. Resistente a físico: qualquer arma não-mágica causa metade do dano."
      },
      {
        name: "Jato de Forno",
        desc: "1 Ação (1x/2 rodadas): abre o painel do peito e lança jato de fogo fundido em cone 4 hex. Dano: 3d8 de fogo. AGI (normal) para metade. Hexes atingidos ficam com Chão em Brasa por 2 rodadas (1d4 de fogo por rodada a quem estiver neles)."
      },
      {
        name: "Braço de Prensa",
        desc: "Ao acertar ataque físico: o alvo testea FOR (difícil) ou fica Preso sob o braço do Constructo (imóvel, 1 Ação para escapar). Enquanto Preso: o Constructo causa automaticamente 1d8 de esmagamento por rodada sem custo de Ação."
      },
      {
        name: "Protocolo de Emergência",
        desc: "Ao cair abaixo de 100 HP: ativa os Queimadores de Emergência — todos os hexes da borda do mapa ficam com Fogo por 3 rodadas (o Constructo tenta cozer tudo na câmara). O espaço navegável reduz drasticamente para o centro."
      }
    ],
    hex: {
      layout: "Câmara de forja 14x12 com teto alto (6 hex altitude)",
      terrain: [
        "Prensa Colossal (teto — 3 Correntes, HP 25 cada, Def 3)",
        "Alavanca (parede norte — Percepção difícil para notar, ativa Prensa)",
        "Fornos Laterais (leste e oeste — cobertura pesada mas Chão em Brasa adjacente)",
        "Hex Central (marcado com X no chão anão — ponto de queda da Prensa)",
        "Correntes (visíveis no teto — podem ser cortadas com armas ou atacadas à distância)"
      ],
      hint: "Estratégia A (direta): destruir 3 Correntes enquanto mantém o Constructo no centro. Ele sempre volta ao centro para patrulhar — empurrá-lo para longe dá tempo de cortar correntes. Estratégia B (alavanca): alguém precisa distrair o Constructo enquanto outro chega até a Alavanca no norte. O jato de fogo é o maior obstáculo para quem tenta acessar as correntes no teto (escalar: AGI normal, mas o calor aplica −1 Resistência)."
    },
    spells: [],
    behavior: "Patrulha em volta do hex central em ciclos de 4 hexes. Ao detectar intrusos: centra-se e usa Jato de Forno. Se inimigo adjacente: Braço de Prensa. Nunca sai de raio 5 do centro da câmara (a programação original o mantém na ronda). Esta previsibilidade pode ser explorada para posicioná-lo sob a Prensa.",
    loot: [
      { item: "Núcleo Mecânico Anão (componente de artesanato raro)", chance: 80, qty: "1" },
      { item: "Ferro Negro Puro (2kg — objetivo da missão Dunforge)", chance: 100, qty: "1" },
      { item: "Manual de Construção Anão (INT normal: aprende Artesanato)", chance: 50, qty: "1" },
      { item: "Engrenagem de Orichalco (material valioso — 20 ouro)", chance: 60, qty: "1d3" }
    ]
  },

  {
    id: "rei-dos-ratos-devorador",
    name: "Skrix, o Rei dos Ratos",
    difficulty: 2,
    attrs: { FOR:2, DEX:4, AGI:4, INT:3, SAB:2 },
    size: "normal",
    category: "Humanoide Corrompido",
    location: ["Cidade", "Dungeon"],
    hp: 100, physDefense: 4, magDefense: 4, dodge: 12,
    actions: 3,
    damage: "1d6+1d4+DEX (adaga envenenada)",
    isElite: true,
    lore: "Skrix era um ladrão comum de Margem das Pedras — até encontrar o Ninho. Em algum lugar nos esgotos existe um Ninho Primordial de ratos que pulsa com energia corrompida do Deus Marcado. Quem passa tempo suficiente lá começa a entender a linguagem dos ratos. Depois começa a gostar. Depois... muda. Skrix ainda parece humano mas suas pupas são verticais e ele cheira a esgoto mesmo após banho. Controla todos os ratos num raio de 100m. O grupo encontra ele quando investigam desaparecimentos na cidade — pessoas que foram ao porão e não voltaram, comida que some dos armazéns, um comerciante que quer saber onde foi seu estoque.",
    encounterSetup: "Skrix está no centro do Ninho — câmara circular nos esgotos com saída única. O chão da câmara central tem buracos de rato (raio 1 hex do centro) — por onde os ratos emergem. Paredes encharcadas. Teto baixo (2 hex de altura — sem voo eficaz). No fundo: gaiolas com os desaparecidos (3 PNJs — vivos, inconscientes). Skrix não ataca imediatamente — tenta negociar ('eles se juntaram ao Ninho voluntariamente') enquanto posiciona os ratos.",
    abilities: [
      {
        name: "Enxame do Ninho — Mecânica de Arena",
        desc: "MECÂNICA DE ARENA: o Ninho Primordial (hex central, HP 40, Def 0) pulsa e invoca 1d4 Ratos Comuns (HP 8, Def 0, dano 1d4, Dif 1) por rodada enquanto estiver intacto. Destruir o Ninho (40 HP de qualquer dano) para a invocação permanentemente e Skrix perde 'Linguagem dos Ratos' e 'Escudo do Enxame'. Com o Ninho destruído: Skrix fica desorientado por 1 rodada (perde todas as Ações) — a ligação quebrada o atordoa."
      },
      {
        name: "Escudo do Enxame",
        desc: "Passivo (requer Ninho intacto): enquanto houver 3+ Ratos ativos no campo, Skrix tem +2 Def.Física e +2 Def.Mágica (os ratos formam barreira viva). Com menos de 3 Ratos: perde o bônus. Os ratos podem ser mortos com ataques de área ou Dano de Área — mas o Ninho invoca mais."
      },
      {
        name: "Linguagem dos Ratos",
        desc: "Passivo (requer Ninho intacto): 1x por rodada como Ação Livre, Skrix direciona todos os ratos ativos a atacar 1 alvo específico — todos os ratos convergem para o mesmo hex neste turno, cada um atacando. Pode criar uma avalanche de 1d4+2 ataques simultâneos num único alvo."
      },
      {
        name: "Instinto do Predador",
        desc: "Passivo permanente: Skrix nunca pode ser surpreendido. Sempre age primeiro na Iniciativa se a rolagem empatar. Ao ser atacado em melee e tirar 4 ou menos na esquiva (d20): recua automaticamente 2 hexes antes de resolver o dano."
      }
    ],
    hex: {
      layout: "Câmara circular 8x8 com Ninho central e buracos de rato",
      terrain: [
        "Ninho Primordial (hex central — HP 40, Def 0, invoca ratos)",
        "Buracos de Rato (raio 1 hex do centro — ratos emergem por aqui)",
        "Gaiolas dos Reféns (parede norte — 3 PNJs inconscientes)",
        "Água do Esgoto (faixa sul — Movimento custa +1, Acrobacia normal para não cair)",
        "Teto Baixo (altura 2 — sem espaço para voo ou salto alto)"
      ],
      hint: "Prioridade absoluta: destruir o Ninho. Enquanto ele existe, Skrix regenera escudo e mais ratos surgem infinitamente. Um personagem vai direto ao Ninho enquanto os outros contêm Skrix e os ratos. Magia de área (Bola de Fogo, Campo de Relâmpagos) limpa os ratos mas pode acertar os reféns nas gaiolas — verificar posicionamento antes. Com o Ninho destruído: Skrix fica atordoado — 1 turno completo sem Ações é a janela para dano máximo."
    },
    spells: [],
    behavior: "Começa tentando negociar. Quando combate inicia: posiciona-se no hex oposto ao Ninho (para protegê-lo indiretamente). Usa Linguagem dos Ratos para focar o personagem mais próximo do Ninho. Se o Ninho cair: entra em pânico genuíno e tenta fugir pelo esgoto (saída secreta — Percepção difícil para notar antes dele escapar).",
    loot: [
      { item: "Chave das Gaiolas (liberta os reféns)", chance: 100, qty: "1" },
      { item: "Diário de Skrix (localização do Ninho original — info de arco)", chance: 80, qty: "1" },
      { item: "Adaga do Rato Rei (adaga rara, +1d4 veneno)", chance: 50, qty: "1" },
      { item: "Moedas roubadas (2d20 prata)", chance: 100, qty: "1" }
    ]
  },

  {
    id: "cavaleiro-renegado-invocador",
    name: "Ser-Aldric, o Cavaleiro Renegado",
    difficulty: 3,
    attrs: { FOR:5, DEX:3, AGI:2, INT:3, SAB:2 },
    size: "normal",
    category: "Humanoide Elite",
    location: ["Estrada", "Planície", "Ruínas"],
    hp: 180, physDefense: 8, magDefense: 5, dodge: 11,
    actions: 3,
    damage: "1d10+1d8+FOR (espada bastarda) ou Magia Proibida",
    isElite: true,
    lore: "Ser-Aldric foi o melhor cavaleiro dos Reinos de Akaen até descobrir que seu rei ordenou o massacre da aldeia onde nasceu — 'para eliminar uma praga de ratos'. Ele desertou na noite do massacre, pegou a espada sagrada do templo que protegia, e jurou que a usaria para acabar com os que abusam do poder. Vinte anos depois, 'os que abusam do poder' expandiu-se para incluir mercadores, cobradores de impostos, qualquer nobre, e eventualmente qualquer um que viaja com ouro suficiente. Ele acredita genuinamente que é justo. A sala do trono das ruínas onde vive foi decorada com os brasões de todos que 'julgou'. O grupo encontra ele após investigar desaparecimentos de caravanas na Estrada do Leste.",
    encounterSetup: "Ser-Aldric não ataca imediatamente — ele julga. Faz 3 perguntas ao grupo: 'De onde vieram? Para onde vão? O que carregam?' As respostas definem sua postura inicial. Se o grupo tem ex-escravos (como na Sessão 1): ele os considera inocentes e pode deixar passar — se não tiverem ouro suficiente para 'parecerem ricos'. A sala do trono tem uma grade mecanizada no teto (Investigação normal para notar) — Ser-Aldric pode ativá-la para dividir o campo ao meio como Ação.",
    abilities: [
      {
        name: "Grade do Julgamento — Mecânica de Arena",
        desc: "MECÂNICA DE ARENA: A sala tem uma Grade de Ferro no teto que pode ser soltada por uma alavanca atrás do trono (somente Ser-Aldric sabe, mas Investigação difícil revela). Quando ativada: a Grade cai e divide o mapa ao meio (norte-sul) — 6 hexes de barreira intransponível exceto por magia. Criaturas no hex de queda testam AGI (difícil) ou sofrem 2d8 de esmagamento. A Grade pode ser levantada novamente (Força normal, 2 Ações) ou destruída (HP 50, Def 4). Depois da queda, o combate acontece em dois lados separados."
      },
      {
        name: "Golpe do Traidor",
        desc: "1 Ação: ataque que ignora completamente a Def.Física se o alvo estiver de costas para Ser-Aldric ou flanqueado. Dano: 1d10+1d8+FOR+1d6 (o golpe pelas costas que ele recebeu uma vez). Ele só usa contra quem considera culpado — nunca contra quem declarou ser servo ou escravo."
      },
      {
        name: "Magia Proibida — Correntes do Julgamento",
        desc: "1 Ação de Magia (custa 1 Slot, roubado do templo): invoca Correntes de Luz em alvo a 5 hex. Alvo testea Força de Vontade (difícil). Falha: Preso por 3 rodadas e não pode atacar Ser-Aldric (as correntes julgam — quem é culpado fica imóvel). Sucesso: apenas −1 Movimento. Ele considera 'culpado' qualquer um que carregue mais de 20 moedas de ouro."
      },
      {
        name: "Último Julgamento",
        desc: "Passivo ao cair abaixo de 30% HP: Ser-Aldric para completamente por 1 rodada e olha para os brasões nas paredes. Qualquer personagem que falar com ele neste momento (SAB normal para abordagem correta) pode iniciar diálogo — ele pode ser convencido a parar se alguém conseguir fazê-lo questionar seus métodos (Persuasão difícil + mencionar a aldeia natal). Se convencido: larga a espada e se ajoelha. Se não convencido: volta a lutar com +1d8 de dano bônus (raiva)."
      }
    ],
    hex: {
      layout: "Sala do trono 14x8 com trono ao norte e Grade no teto",
      terrain: [
        "Trono (parede norte — cobertura pesada, alavanca da Grade atrás)",
        "Grade do Julgamento (teto — cai ao meio do mapa quando ativada)",
        "Brasões nas Paredes (decorativos — mencioná-los abre diálogo com Ser-Aldric)",
        "Tapete Central (indica área de queda da Grade — Percepção normal para notar desgaste no teto)",
        "Saída Sul (única saída — Ser-Aldric a bloqueia instintivamente)"
      ],
      hint: "A Grade divide o grupo — prepare-se antes que caia. Se cair com metade do grupo em cada lado: o lado com Ser-Aldric está em desvantagem numérica. Opção: deixar alguém próximo da alavanca do trono para desviar antes da queda. O Último Julgamento é a janela mais importante — Ser-Aldric é tecnicamente um aliado em potencial, não apenas um inimigo."
    },
    spells: ["Correntes do Julgamento (Slot, 5 hex)", "Ativação da Grade (Ação Livre, 1x/combate)"],
    behavior: "Começa distante, no trono. Ativa a Grade no 2º turno se o combate começar. Alterna entre Golpe do Traidor (quem estiver flanqueado) e Correntes (quem tiver mais ouro). Na janela do Último Julgamento: genuinamente para — não é fraqueza, é o único momento em que ainda é humano.",
    loot: [
      { item: "Espada do Templo de Thurgomur (lendária — sagrada, +1d8 sagrado vs corruptos)", chance: 80, qty: "1" },
      { item: "Diário do Julgamento (lista de todos que matou — info para NPCs)", chance: 100, qty: "1" },
      { item: "Brasão da Aldeia Natal (item emocional — missão futura)", chance: 60, qty: "1" }
    ]
  },

  {
    id: "curador-parasita",
    name: "Irmão Tolvan, o Curador",
    difficulty: 3,
    attrs: { FOR:1, DEX:2, AGI:1, INT:4, SAB:6 },
    size: "normal",
    category: "Humanoide Parasitado",
    location: ["Cidade", "Templo"],
    hp: 115, physDefense: 7, magDefense: 7, dodge: 11,
    actions: 3,
    damage: "1d6+SAB (toque de cura invertida) ou Magias",
    isElite: true,
    lore: "Irmão Tolvan era um Clérigo de Thurgomur — genuinamente bom, cuidando de refugiados da última incursão do Deus Marcado. Seis meses atrás curou um 'ferido' que encontrou na estrada. O ferido era um Aralto em disfarce que implantou um Parasita do Eco nele — uma criatura invisível que habita o sistema nervoso e redireciona a Fé para energia corrupta. Tolvan não sabe que está doente. Ele acha que está curando. Quando 'cura' alguém, o Parasita drena a vitalidade do paciente para alimentar a si mesmo. Os refugiados que 'melhoraram' ficaram mais fracos a cada dia. O grupo encontra Tolvan num acampamento de refugiados onde pessoas 'curadas' por ele estão morrendo lentamente.",
    encounterSetup: "O grupo não encontra um vilão — encontra um homem confuso e assustado que genuinamente acredita estar ajudando. Tolvan pode ser salvo: o Parasita do Eco pode ser expulso com Luz Sagrada de alta intensidade (magia de Nível 3 ou superior direcionada ao hospedeiro, causando 2d8 de dano sagrado ao Tolvan — o Parasita sai e materializa como criatura separada). Se o grupo matar Tolvan sem tentar salvar: o Parasita escapa e encontra um novo hospedeiro (potencialmente um dos personagens — SAB difícil para resistir).",
    abilities: [
      {
        name: "Parasita do Eco — A Verdadeira Ameaça",
        desc: "MECÂNICA DE ARENA: o Parasita do Eco (HP 30, Def 0, Esquiva 20, invisível) habita o corpo de Tolvan. Enquanto dentro: Tolvan recebe os efeitos das habilidades do Parasita involuntariamente. Se Tolvan cair a 0 HP OU receber 20+ de dano sagrado num turno: o Parasita materializa-se (força Tolvan a vomitá-lo literalmente) e age como criatura separada. O Parasita materializado tem: Toque de Drenagem (1d8+SAB, rouba HP e cura a si mesmo), Invisibilidade (se mover sem atacar), e busca imediatamente o hospedeiro com menor SAB."
      },
      {
        name: "Cura Invertida",
        desc: "1 Ação (Tolvan acredita que está curando): toca aliado ou inimigo a 2 hex. Em aliados: 'cura' 1d8 HP mas o alvo perde 1d6 de SAB temporária (o Parasita drena enquanto Tolvan alimenta — Tolvan não percebe). Em inimigos: causa 1d8 de dano de drenagem (acredita estar 'removendo corrupção'). Não pode ser revertida sem destruir o Parasita."
      },
      {
        name: "Campo de Purificação Corrompida",
        desc: "1 Ação de Magia: cria campo de 'purificação' em raio 3 hex. No campo: magias de cura causam metade do efeito (o Parasita interfere) e criaturas feridas dentro do campo sofrem 1d4 de drenagem por rodada (o campo puxa vitalidade). Tolvan está genuinamente tentando ajudar — o Parasita subverte tudo."
      },
      {
        name: "Súplica do Clérigo",
        desc: "Ao cair abaixo de 40% HP: Tolvan para de atacar e reza. SAB (normal) para perceber que a reza é genuína e ele não está fingindo. Neste momento: pode ser abordado com Persuasão (normal) ou Medicina (normal para identificar o Parasita com diagnóstico). Se identificado o Parasita: Tolvan para de resistir ao grupo e fica imóvel pedindo para ser salvo."
      }
    ],
    hex: {
      layout: "Acampamento de tendas 10x8 com reféns e pacientes",
      terrain: [
        "Tendas dos Refugiados (6 ao longo das bordas — pacientes dentro, podem ser acertados por área)",
        "Altar de Thurgomur (centro-norte — se Tolvan chegar a 1 hex: Purificação 1x gratuita — remove Parasita sem dano)",
        "Fogueira Central (centro — cobertura nula, iluminação, Luz Sagrada mais eficaz adjacente)",
        "Suprimentos Médicos (nordeste — Medicina normal revela Parasita antes do combate)"
      ],
      hint: "O Altar é a solução mais elegante: manobrar Tolvan (não matar, não derrubar) para o hex adjacente ao Altar ativa Purificação automática. Alternativamente: 20+ dano sagrado num turno força o Parasita para fora. Magia de área pode machucar refugiados nas tendas — cuidado com posicionamento. Se o Parasita escapar e tentar possuir um personagem: SAB difícil. Falha = aquele personagem 'ajuda' o Parasita até o grupo forçá-lo para fora."
    },
    spells: ["Cura Invertida (toque, 2 hex)", "Campo de Purificação Corrompida (raio 3)"],
    behavior: "Tolvan não quer lutar — defende-se enquanto tenta 'curar' o grupo. O Parasita usa ele como escudo (se ele morrer, o Parasita é exposto). Se o grupo for claramente superior: Tolvan faz Súplica e para. Se salvos: Tolvan fica devastado com o que fez involuntariamente e oferece seus serviços como aliado.",
    loot: [
      { item: "Parasita do Eco (amostra — informação sobre o Deus Marcado)", chance: 100, qty: "1" },
      { item: "Cajado de Thurgomur de Tolvan (lendário se purificado)", chance: 80, qty: "1" },
      { item: "Gratidão dos Refugiados (aliados ocasionais — safe house futura)", chance: 100, qty: "1" }
    ]
  },

  {
    id: "golem-de-gelo-puzzle",
    name: "Colosso de Gelo de Atrelon",
    difficulty: 3,
    attrs: { FOR:7, DEX:0, AGI:0, INT:1, SAB:2 },
    size: "colossal",
    category: "Elemental Construído",
    location: ["Cemitério", "Dungeon", "Montanha", "Ruínas"],
    hp: 235, physDefense: 9, magDefense: 3, dodge: 6,
    actions: 2,
    damage: "2d8+FOR (pancada de gelo) + Congelamento em área",
    isElite: true,
    lore: "Os Magos de Atrelon que se aliaram aos Serpentarianos antes da Batalha Colossal criaram três Colossos de Gelo para guardar suas torres. Dois foram destruídos na guerra. O terceiro ainda guarda a Torre Leste de Atrelon — uma câmara onde está selada informação sobre o paradeiro de Sss'era antes da Batalha. O grupo pode precisar desta informação durante a campanha principal. O Colosso não é maligno — é um guardião cumprindo ordens de Magos mortos há 500 anos.",
    encounterSetup: "A câmara tem quatro Cristais de Aquecimento nas paredes (criados pelos mesmos magos como sistema de segurança — se os Cristais fossem ativados, o Colosso congelaria). Os Cristais estão apagados mas funcionais. Ativar cada Cristal (Arcanismo normal + 1 Ação adjacente) aquece a câmara em 25%. Com 4 Cristais ativos: o Colosso congela completamente (imóvel, Def.Física reduzida a 0 por 3 rodadas — pode ser destruído facilmente ou simplesmente passar por ele).",
    abilities: [
      {
        name: "Cristais de Aquecimento — Solução da Arena",
        desc: "MECÂNICA DE ARENA: 4 Cristais nas paredes (Arcanismo normal + 1 Ação adjacente para ativar cada um). 1 Cristal: −2 Def.Física do Colosso. 2 Cristais: −4 Def.Física e −2 Ações. 3 Cristais: −6 Def.Física, −3 Ações, velocidade 1. 4 Cristais: Colosso congela completamente — Def.Física 0, imóvel 3 rodadas. O Colosso tenta destruir os Cristais (HP 20, Def 2 cada) — alcança apenas os da parede norte e sul (leste e oeste estão fora de alcance)."
      },
      {
        name: "Ventania de Gelo",
        desc: "1 Ação (1x/2 rodadas): expira ventania que empurra todas as criaturas em cone 5 hex. Empurrão: 3 hexes na direção da ventania. AGI (difícil) para resistir. Criaturas que baterem em parede: 1d6 extra de impacto. A ventania também apaga tochas e magias de luz menores — a câmara escurece se não houver fonte de luz mágica."
      },
      {
        name: "Braço Congelante",
        desc: "Ao acertar fisicamente: além do dano, o alvo acumula 1 carga de Congelamento. Com 3 cargas: Congelado (imóvel 1 rodada, FOR difícil para escapar por Ação). Cargas diminuem 1 por rodada naturalmente, mas a temperatura da câmara (muito baixa) impede que dimunuam mais de 1 por rodada."
      },
      {
        name: "Armadura de Gelo Regenerativa",
        desc: "Passivo: no início de cada turno, regenera 2 de Def.Física perdida (a câmara fria a mantém). Fogo cancela a regeneração e causa −3 de Def.Física adicional por turno de exposição. Com 4 Cristais ativos: a regeneração vira 0 e o processo inverte (+3 de vulnerabilidade por turno)."
      }
    ],
    hex: {
      layout: "Câmara circular 12x10 com 4 Cristais nas paredes cardeais",
      terrain: [
        "Cristal Norte (parede norte — ativável, destruível pelo Colosso)",
        "Cristal Sul (parede sul — ativável, destruível pelo Colosso)",
        "Cristal Leste (parede leste — ativável, FORA do alcance do Colosso)",
        "Cristal Oeste (parede oeste — ativável, FORA do alcance do Colosso)",
        "Chão Glacial (todo o mapa — Acrobacia normal para não cair ao correr)",
        "Câmara Selada (parede norte — atrás do Cristal Norte, contém as informações)"
      ],
      hint: "Estratégia A: ativar Cristais Leste e Oeste primeiro (fora do alcance do Colosso), depois Norte e Sul rapidamente. Isso requer dividir o grupo: 2 em cada lado. O Colosso vai focar em quem estiver perto dos Cristais norte/sul. Ventania de Gelo pode jogar personagens para longe dos Cristais — posição nos hexes centrais é mais segura. Estratégia B: focar nos Cristais e aceitar o dano até todos os 4 estarem ativos — brutal mas funciona."
    },
    spells: [],
    behavior: "Vai diretamente ao Cristal mais próximo que já estiver ativo e tenta destruí-lo. Nunca persegue quem se afasta — volta à posição central. Ventania de Gelo é usada quando 2+ inimigos estão no cone. Não pode processar múltiplas ameaças — foca uma de cada vez por ordem de proximidade.",
    loot: [
      { item: "Núcleo de Gelo Primordial (material lendário para armas de gelo)", chance: 70, qty: "1" },
      { item: "Informação Selada de Atrelon (localização de Sss'era antes da guerra)", chance: 100, qty: "1" },
      { item: "Cristal de Aquecimento (funcional — 3 usos de Fogo de Nível 2 armazenados)", chance: 40, qty: "1" }
    ]
  },

  /* ═══════════════════════════════════════════════════════════════
     DERIVADOS DE COLOSSAIS — Criaturas nascidas da influência,
     sangue ou corrupção dos grandes seres do mundo de Aether.
     Encontrados antes de chegar ao colossal pai.
     ═══════════════════════════════════════════════════════════════ */

  /* ─── DERIVADOS DE KARLAC — Grande Salamandra ───────────────── */

  { id: "karlac-juvenil",
    name: "Karlac Juvenil",
    difficulty: 2,
    attrs: { FOR:3, DEX:1, AGI:1, INT:0, SAB:1 },
    size: "grande",
    category: "Besta — Cria de Karlac",
    location: ["Deserto", "Montanha", "Ruínas"],
    hp: 100, physDefense: 5, magDefense: 1, dodge: 10,
    actions: 2,
    damage: "1d8+1d6+FOR (mordida ardente) + 1d4 fogo passivo",
    behavior: "Territorial e impulsivo — não é maligno, apenas imprevisível. Ataca qualquer coisa que entre em raio 5 hex sem aviso. Criança de 50-80 anos da Karlac adulta. Às vezes visto seguindo caravanas à distância, curioso. Um Druida com Manejo de Animais (difícil) pode acalmá-lo e até usá-lo como montaria temporária.",
    lore: "Karlac Juvenis são crias que a Grande Salamandra deixa vagar pelo Deserto depois de anos de criação. Cada um tem o calor corporal de uma fornalha — a terra ao redor deles racha de seca. Encontrar um é sinal de que a Grande Salamandra esteve ali recentemente.",
    abilities: [
      { name: "Calor Irradiante", desc: "Passivo: qualquer criatura que começar o turno em hex adjacente ao Karlac Juvenil sofre 1d4 de fogo automático (calor irradiado do corpo). Criaturas com armadura metálica: 1d6 em vez de 1d4." },
      { name: "Baforada de Brasas", desc: "1 Ação (1x/2 rodadas): expele cone de brasas 3 hex. Dano: 1d8+FOR de fogo. AGI (normal) para metade. Hexes atingidos ficam com Chão Quente por 2 rodadas (1d4 por rodada a quem estiver neles)." },
      { name: "Couro Endurecido", desc: "Resistência a fogo (imune). Dano cortante reduzido em 2 por dado (o couro grosso absorve lâminas). Vulnerável a água e gelo: +1d6 por dado de frio." }
    ],
    hex: { layout: "Terreno aberto do deserto", hint: "O Calor Irradiante força o grupo a manter distância — melee é arriscado. Água e gelo são a fraqueza óbvia. Um Druida pode tentar comunicação antes do combate — SAB (difícil) para interpretar a linguagem corporal do juvenil e identificar se está com fome, com medo, ou territorial." },
    spells: [],
    loot: [{ item: "Escama de Karlac Juvenil (material raro para armaduras resistentes a fogo)", chance: 70, qty: "1d3" }, { item: "Dente de Karlac (talismã de calor — resistência a frio)", chance: 40, qty: "1" }] },

  { id: "servo-da-salamandra",
    name: "Cultista do Calor — Servo de Karlac",
    difficulty: 2,
    attrs: { FOR:2, DEX:1, AGI:1, INT:2, SAB:3 },
    size: "normal",
    category: "Humanoide Corrompido — Servo de Karlac",
    location: ["Deserto", "Dungeon", "Floresta", "Montanha", "Ruínas"],
    hp: 75, physDefense: 4, magDefense: 4, dodge: 12,
    actions: 2,
    damage: "1d6+SAB (tocha ritual) ou Magia de Calor",
    behavior: "Fanático e calmo — não tem medo da morte, considera uma honra ser consumido por Karlac. Tentará sempre posicionar o grupo entre ele e o sol (ou qualquer fonte de calor). Nunca foge.",
    lore: "Humanos e serpentarianos que passaram tempo suficiente perto da Grande Salamandra desenvolveram devoção instintiva. A pele deles ficou ressecada e quente ao toque. Alguns conseguem canalizar o calor de Karlac como magia rudimentar. O grupo pode encontrá-los guardando os territórios externos antes de chegar à cratera central.",
    abilities: [
      { name: "Bênção de Karlac", desc: "Passivo: imune a fogo. Ao cair a 0 HP, explode em chamas — todos em raio 1 hex sofrem 1d6 de fogo (o calor absorvido ao longo dos anos é liberado)." },
      { name: "Invocar Calor", desc: "1 Ação de Magia: projeta onda de calor em alvo a 4 hex. Dano: 1d8+SAB de fogo. Se acertar: o alvo fica com sede intensa por 2 rodadas (−1 em todos os testes — o calor drena a concentração em ambiente de deserto)." },
      { name: "Ritual do Fogo Vivo", desc: "Se 3+ Cultistas do Calor estiverem vivos e adjacentes entre si: formam Círculo Ritual (1 Ação por todos). Por 3 rodadas: qualquer Karlac Juvenil aliado na área ganha +1d6 de dano e regenera 3 HP/rodada. O Círculo é quebrado se qualquer um dos 3 for morto ou movido." }
    ],
    hex: { layout: "Deserto aberto", hint: "Os Cultistas em grupo são mais perigosos que individualmente — o Círculo Ritual amplifica qualquer Karlac Juvenil presente. Isolar e separar o trio antes que formem o Círculo é prioritário. A explosão de morte em raio 1 é uma armadilha para quem usa melee sem planejamento." },
    spells: ["Invocar Calor (4 hex)"],
    loot: [{ item: "Tocha Ritual de Karlac (3 usos de Invocar Calor armazenados)", chance: 40, qty: "1" }, { item: "Diário do Culto (localização da cratera central)", chance: 60, qty: "1" }] },

  /* ─── DERIVADOS DE THARAK — Dracônico Vermelho Adulto ───────── */

  { id: "draconica-filhote-tharak",
    name: "Filhote Dracônico de Tharak",
    difficulty: 2,
    attrs: { FOR:2, DEX:2, AGI:2, INT:1, SAB:1 },
    size: "normal",
    category: "Dracônico — Filhote de Tharak",
    location: ["Caverna", "Montanha", "Ruínas"],
    hp: 70, physDefense: 4, magDefense: 2, dodge: 12,
    actions: 2,
    damage: "1d6+1d4+FOR (garras e mordida pequena)",
    behavior: "Protetor e assustado — os filhotes atacam o que ameaça o ninho, mas fogem se feridos acima de 50% HP (voltam para Tharak). Se o grupo não ameaçar o ninho, os filhotes observam à distância sem atacar. Matar um filhote na presença de Tharak ativa imediatamente sua habilidade Pai Protetor.",
    lore: "Os filhotes de Tharak nasceram há menos de 10 anos — ainda pequenos para um Dracônico, mas já capazes de resistência considerável. Tharak os protege com ferocidade, mesmo doente. O grupo encontrará os filhotes primeiro, guardando a entrada da caverna enquanto Tharak descansa mais fundo.",
    abilities: [
      { name: "Sopro Nascente", desc: "1 Ação (1x/combate): sopro de chamas em cone 2 hex. Dano: 1d6+FOR de fogo. AGI (normal) para metade. Menos poderoso que o pai mas surpreendente para criaturas pequenas." },
      { name: "Escamas Jovens", desc: "Resistência a fogo. Dano físico de armas sem bônus mágico: −1 por dado (as escamas jovens já endurecem). Vulnerável a frio: +1d4 por dado." },
      { name: "Vínculo com o Pai", desc: "Passivo: se Tharak estiver no mesmo campo de batalha, o Filhote tem +1 em tudo e não foge mesmo ferido. Se Tharak for ferido abaixo de 50%: todos os Filhotes atacam imediatamente o responsável independente de qualquer outra ordem ou situação." }
    ],
    hex: { layout: "Entrada de caverna com terreno irregular", hint: "Os Filhotes estão protegendo o acesso a Tharak — não são o objetivo, são o aviso. Causar dano a um Filhote na presença de Tharak (mesmo involuntariamente por área) desencadeia o Pai Protetor. A abordagem não-violenta é possível: Manejo de Animais (normal), ou simplesmente não avançar em direção ao ninho." },
    spells: [],
    loot: [{ item: "Escama de Filhote Dracônico (material raro — resiste a fogo)", chance: 50, qty: "1d2" }, { item: "Garra de Filhote (componente para encantamento de fogo)", chance: 30, qty: "1" }] },

  { id: "cavaleiro-draconico-tharak",
    name: "Cavaleiro Dracônico — Servo de Tharak",
    difficulty: 3,
    attrs: { FOR:4, DEX:3, AGI:2, INT:2, SAB:2 },
    size: "normal",
    category: "Humanoide Dracônico",
    location: ["Caverna", "Montanha", "Ruínas"],
    hp: 135, physDefense: 7, magDefense: 3, dodge: 11,
    actions: 3,
    damage: "1d10+1d6+FOR (lança com ponta dracônica) ou Sopro de Fogo (limitado)",
    behavior: "Leal e honrado — foi escolhido por Tharak como guardião por demonstrar coragem e lealdade genuínas, não fanatismo. Não é vilão. Protege Tharak porque acredita que o Dracônico Vermelho não deve morrer em sofrimento. Pode negociar se o grupo provar intenção pacífica (Persuasão difícil — ele é cético mas não irracional).",
    lore: "Havia um acampamento de guerreiros nômades nas montanhas do norte. Quando Tharak adoeceu, alguns deles não fugiram — ficaram, tentando entender o dragão. Tharak, surpreendido, não os matou. Eventualmente, alguns aprenderam a entender seus sinais. Os Cavaleiros Dracônicos são esses guerreiros — humanos que vivem na fronteira entre o mundo humano e o dracônico.",
    abilities: [
      { name: "Sopro Emprestado", desc: "1 Ação (2x/combate — concedido por Tharak): o Cavaleiro usa um fragmento do poder de Tharak para exhalar chamas. Cone 3 hex, 1d8+FOR de fogo. AGI (normal) para metade. Se Tharak não estiver vivo: esta habilidade não funciona." },
      { name: "Escudo Dracônico", desc: "Reação: ao aliado Filhote ou ao próprio Tharak receber ataque dentro de 3 hex: o Cavaleiro interpõe-se e absorve até 10 HP do dano no lugar. Este sacrifício não causa dano ao Cavaleiro além dos 10 HP absolvidos." },
      { name: "Resistência ao Fogo", desc: "Passivo: imune a dano de fogo (vivendo com Tharak, o corpo se adaptou). Ataques enquanto montado em Filhote (se conseguir montar): +1d6 de dano e +2 na Chance de Acerto (combate montado dracônico)." }
    ],
    hex: { layout: "Passagem de montanha com plataformas", hint: "O Cavaleiro Dracônico é um possível aliado — se o grupo demonstrar que não quer matar Tharak mas apenas ajudar. Persuasão (difícil) ou demonstrar conhecimento médico (Medicina normal para identificar a doença de Tharak) abre negociação. Em combate: foca defesa dos Filhotes, não ataque ao grupo." },
    spells: [],
    loot: [{ item: "Lança com Ponta Dracônica (arma rara — causa fogo)", chance: 50, qty: "1" }, { item: "Armadura de Escamas de Filhote (armadura rara — resistência a fogo)", chance: 30, qty: "1" }] },

  /* ─── DERIVADOS DO LICH DE ATRELON ──────────────────────────── */

  { id: "espectro-de-atrelon",
    name: "Espectro Congelado de Atrelon",
    difficulty: 2,
    attrs: { FOR:0, DEX:3, AGI:3, INT:4, SAB:3 },
    size: "normal",
    category: "Morto-Vivo — Servo do Lich",
    location: ["Montanha", "Ruínas"],
    hp: 65, physDefense: 4, magDefense: 6, dodge: 12,
    actions: 2,
    damage: "1d6+INT (toque glacial — ignora Def.Física)",
    behavior: "Silencioso e metódico — patrulha rotas ao Pico em padrão fixo. Não devia — simplesmente seguia a última ordem do Lich ('ninguém sobe'). Ao detectar intrusos: não grita nem alerta, apenas ataca em silêncio. O Lich não sabe de tudo que acontece nas encostas — cada Espectro age independentemente.",
    lore: "Os Espectros Congelados são os restos de Magos que tentaram chegar ao Lich ao longo dos séculos — alguns para estudar, alguns para combater, alguns por curiosidade. O Lich os matou e os manteve como sentinelas. Estão congelados em diferentes estágios de decomposição — alguns ainda usam roupas de eras passadas.",
    abilities: [
      { name: "Toque Glacial", desc: "Cada acerto: alvo acumula 1 carga de Gelo (máx 3). Com 3 cargas: Congelado por 1 rodada, depois reseta. As cargas diminuem 1 por rodada em temperatura normal mas NO ambiente de Atrelon (frio extremo): as cargas não diminuem naturalmente." },
      { name: "Forma Etérea", desc: "Passivo: imune a armas não-mágicas. Vulnerável a fogo (dobro de dano). A temperatura das Montanhas de Atrelon cancela parcialmente o fogo — dano de fogo é normal em vez de dobrado nos primeiros 2 hexes abaixo do Pico." },
      { name: "Memória Congelada", desc: "1x/combate: o Espectro mostra uma imagem do que viu em vida — Percepção (normal) para o grupo vê fragmento de memória (pista sobre o Lich ou o caminho para o topo). É involuntário e o Espectro não sabe que faz isso." }
    ],
    hex: { layout: "Trilha de montanha nevada", hint: "As Memórias Congeladas são pistas de navegação — cada Espectro derrotado pode revelar fragmento do caminho ou fraqueza do Lich. O acúmulo de Gelo sem diminuição natural (ambiente frio) torna cada acerto mais perigoso que parece. Fogo é eficaz mas o ambiente reduz o bônus." },
    spells: [],
    loot: [{ item: "Cristal de Memória (contém 1 visão do passado de Atrelon)", chance: 50, qty: "1" }, { item: "Fragmento de Gelo Eterno (material para armas de frio)", chance: 40, qty: "1d2" }] },

  { id: "golem-osso-gelo",
    name: "Golem de Osso e Gelo",
    difficulty: 3,
    attrs: { FOR:5, DEX:0, AGI:0, INT:1, SAB:1 },
    size: "grande",
    category: "Construto — Criação do Lich",
    location: ["Dungeon", "Montanha"],
    hp: 170, physDefense: 8, magDefense: 2, dodge: 7,
    actions: 2,
    damage: "1d10+1d8+FOR (punho de osso congelado) + respingo de gelo",
    behavior: "Guardião mecânico — patrulha as câmaras internas da Torre do Lich em rotas fixas. Ataca tudo que não emitir o 'sinal de servo' (um cristal que o Lich dá a seus servos — o grupo não tem). Pode ser enganado se alguém carregar um Cristal de Memória de um Espectro derrotado (o Golem o reconhece como servo morto — fica confuso por 1 rodada).",
    lore: "O Lich criou os Golens de Osso e Gelo com os esqueletos de guerreiros que tentaram destruir seu Filactério. Cada Golem contém 3-4 esqueletos fundidos com gelo e mantidos por magia de necromancia. Se destruído: os ossos ainda se movem por 1d4 rodadas tentando se remontar (podem ser mantidos separados ou queimados para prevenir isso).",
    abilities: [
      { name: "Respingo Glacial", desc: "Passivo em todos os ataques físicos: ao acertar, respingo de gelo atinge todos em hexes adjacentes ao alvo — 1d4 de frio (sem resistência). Criaturas com armadura metálica: 1d6." },
      { name: "Invulnerabilidade ao Frio", desc: "Imune a frio e gelo. Fogo causa +1d6 por dado. Em câmaras aquecidas (artificialmente acima de 0°C): perde 2 de Def.Física por rodada que permanecer no calor." },
      { name: "Remontagem", desc: "Ao cair a 0 HP: os ossos separados continuam se movendo por 1d4 rodadas (HP 1 cada fragmento, Def 0, dano 1d4). Se todos os fragmentos forem destruídos ou impedidos de se unir durante esse tempo: morte permanente. Fogo aplicado ao Golem caído impede a Remontagem automaticamente." },
      { name: "Peso Colossal", desc: "Passivo: ao se mover para hex adjacente a inimigo pequeno ou normal, o alvo testea FOR (normal) ou é empurrado 1 hex (o volume do Golem empurra). Terreno de neve ou gelo: o Golem não tem penalidade de Movimento." }
    ],
    hex: { layout: "Corredor glacial da Torre", hint: "A Remontagem é o elemento mais importante — equipas com fogo devem reservar uma aplicação para o Golem caído. O Cristal de Memória de Espectro derrotado pode comprar 1 rodada de confusão — suficiente para reposicionar. Fogo aquece a câmara gradualmente (-2 Def.Física por rodada de uso intenso de fogo na sala)." },
    spells: [],
    loot: [{ item: "Fragmento de Filactério Falso (isca — o Lich criou iscas)", chance: 40, qty: "1" }, { item: "Osso Glacial (material para armas de gelo)", chance: 60, qty: "1d4" }] },

  /* ─── DERIVADOS DA SERPENTE DE JURGMUND ─────────────────────── */

  { id: "sacerdote-escama-jurgmund",
    name: "Sacerdote da Escama — Servo de Jurgmund",
    difficulty: 2,
    attrs: { FOR:1, DEX:2, AGI:2, INT:3, SAB:4 },
    size: "normal",
    category: "Serpentariano Elite — Servo Divino",
    location: ["Dungeon", "Ruínas", "Templo"],
    hp: 80, physDefense: 4, magDefense: 6, dodge: 12,
    actions: 3,
    damage: "1d6+SAB (cajado de osso de serpente) ou Magia",
    behavior: "Calculado e sereno — não sente medo porque acredita genuinamente que morrer em serviço de Jurgmund é ascensão. Prioriza manter aliados vivos (buffando e curando) sobre atacar diretamente. Se capturado: não fala nada relevante — mas sua roupa tem marcas que indicam a hierarquia do Culto (Investigação normal para decifrar).",
    lore: "Quem serve a Serpente Imortal de Jurgmund por tempo suficiente começa a mudar fisicamente: a pele endurece levemente, os olhos ficam com pupila horizontal, e a língua se bifurca. Os Sacerdotes da Escama são o terceiro nível da hierarquia serpentariana — acima dos Patrulheiros mas abaixo do Grande Sacerdote. São encontrados no interior do Castelo da Cobra e nos templos regionais.",
    abilities: [
      { name: "Escama Abençoada", desc: "Passivo: pele parcialmente escamada concede Resistência a veneno (imune a venenos Dif.1-2). Venenos Dif.3+ causam metade do efeito." },
      { name: "Veneno Sagrado de Jurgmund", desc: "1 Ação de Magia: aplica bênção de veneno sagrado em aliado ou em si mesmo. Por 3 rodadas: próximos ataques causam +1d6 de veneno sagrado (só antídoto divino remove). Se aplicado em si mesmo e morrer enquanto ativo: o veneno se propaga em raio 2 hex (1d6 de veneno, SAB normal para resistir)." },
      { name: "Palavra da Serpente", desc: "1 Ação de Magia (1x/combate): pronuncia palavras sagradas em dracônico serpentariano. Aliados serpentarianos em raio 6 hex recuperam 1d8 HP e ganham +1 Ação neste turno. Inimigos testam Força de Vontade (normal) ou ficam com −1d4 nos ataques por 1 rodada (a língua da serpente corrói a confiança)." }
    ],
    hex: { layout: "Templo com pilares e altares", hint: "A Palavra da Serpente aplicada no momento certo pode dar Ações extras a um grupo inteiro de serpentarianos — matar o Sacerdote primeiro elimina esse multiplicador. A propagação do veneno na morte cria zona de risco — personagens de melee devem sair do raio 2 antes do Sacerdote cair." },
    spells: ["Veneno Sagrado de Jurgmund", "Palavra da Serpente"],
    loot: [{ item: "Escama de Sacerdote (material que resiste a veneno)", chance: 50, qty: "1d2" }, { item: "Cajado de Osso de Serpente (arma mágica — Veneno Sagrado 3 usos)", chance: 30, qty: "1" }, { item: "Símbolo da Hierarquia (revela estrutura do Culto)", chance: 80, qty: "1" }] },

  { id: "cobra-guardiao-julgmund",
    name: "Cobra Guardiã de Jurgmund",
    difficulty: 3,
    attrs: { FOR:4, DEX:4, AGI:4, INT:3, SAB:4 },
    size: "grande",
    category: "Serpentariano Sagrado — Criatura de Jurgmund",
    location: ["Dungeon", "Templo"],
    hp: 155, physDefense: 7, magDefense: 7, dodge: 11,
    actions: 3,
    damage: "1d8+1d6+DEX (mordida sagrada) + veneno divino",
    behavior: "Guardião puro — não tem personalidade, apenas propósito. Não negocia, não foge, não hesita. Exatamente como a Serpente Imortal, mas menor e mais rápida. Se o grupo estiver em missão com bênção de Jurgmund (impossível normalmente — apenas se aliados com o Culto): a Cobra os deixa passar sem atacar.",
    lore: "Cobras que viveram na presença da Serpente Imortal por décadas absorvem fragmentos de sua divindade. Crescem além do natural, ficam semi-translúcidas, e desenvolvem resistência mágica que não pertence a criaturas mortais. São a última defesa antes da câmara da Serpente Imortal — qualquer um que chegue até elas mereceu chegar até elas.",
    abilities: [
      { name: "Veneno Divino Menor", desc: "Cada mordida injeta veneno divino. SAB (difícil) para resistir. Falha: 1d8 de veneno por rodada por 4 rodadas. Antídotos comuns não funcionam — apenas magia sagrada ou a Bênção de Jurgmund. Acumula: segunda mordida não-resistida aumenta para 1d10/rodada." },
      { name: "Constrição Sagrada", desc: "Ao acertar 2 ataques no mesmo alvo no mesmo turno: o alvo fica Preso (enrolado). Enquanto Preso: a Cobra causa automaticamente 1d6+FOR de esmagamento por rodada sem custo. O alvo pode escapar com FOR (difícil) gastando 2 Ações. Aliados adjacentes podem ajudar: FOR (normal) em vez de difícil." },
      { name: "Escamas Translúcidas", desc: "Passivo: 30% de chance (d10 ≤ 3) de ataques passarem através das escamas sem causar dano (a semi-translucidez confunde a trajetória do golpe). Magias: 50% de chance (d10 ≤ 5). Não funciona contra dano sagrado ou armas de Thurgomur." }
    ],
    hex: { layout: "Corredor estreito antes da câmara sagrada", hint: "A Constrição é devastadora em corredores estreitos — o alvo Preso bloqueia o hex e impede que aliados passem facilmente. Liberar o alvo preso é prioridade antes de focar a Cobra. A resistência de 30-50% torna ataques imprecisos especialmente frustrantes — múltiplas Ações de Combate por turno reduzem o impacto da sorte." },
    spells: [],
    loot: [{ item: "Presa da Cobra Guardiã (reagente para Veneno Divino)", chance: 60, qty: "1d2" }, { item: "Escama Translúcida (material para item mágico de resistência)", chance: 40, qty: "1d3" }, { item: "Bênção Menor de Jurgmund (passiva: +1 SAB por 1 sessão)", chance: 30, qty: "1" }] },

  /* ─── DERIVADOS DE MAGNALAGA — Tartaruga Ancestral ──────────── */

  { id: "anao-casco-guardiao",
    name: "Guardião do Casco — Anão da Cidadela",
    difficulty: 2,
    attrs: { FOR:3, DEX:1, AGI:1, INT:2, SAB:2 },
    size: "normal",
    category: "Anão — Guardião de Magnalaga",
    location: ["Cidade", "Dungeon"],
    hp: 90, physDefense: 6, magDefense: 2, dodge: 10,
    actions: 2,
    damage: "1d8+1d4+FOR (martelo de casco)",
    behavior: "Suspeito mas justo — a Cidadela tem regras, não hostilidade. O Guardião pede senha ou identificação. Grupos sem apresentação válida são escoltados (não atacados) até um oficial. Se o grupo tentar forçar entrada: combate. Se tiver carta de Dunforge ou bênção de Thurgomur: acesso imediato.",
    lore: "Os anões que vivem no casco de Magnalaga há gerações desenvolveram relação simbiótica com a tartaruga — ela os protege com o casco, eles removem parasitas e detritos que se acumulam nela. Os Guardiões do Casco são a milícia desta cidade viva. Não são hostis — são cautelosos. A Cidadela recebe viajantes, mas com protocolo rigoroso.",
    abilities: [
      { name: "Formação do Casco", desc: "Se 2+ Guardiões do Casco estiverem adjacentes: ambos ganham +2 Def.Física e +1 na Chance de Defesa com escudo (a formação anã é defensiva por natureza). A formação não pode ser quebrada por Derrubada se ambos testarem FOR (normal) simultaneamente." },
      { name: "Martelar a Escama", desc: "Ao atacar inimigo com armadura metálica ou Def.Física 5+: +1d6 de dano extra (treinamento específico para criaturas do lago, que têm carapaças)." },
      { name: "Chamado de Reforço", desc: "1 Ação (1x/combate): grita chamada de alerta. Em 1d3 rodadas chegam 1d4 Guardiões adicionais se a luta for dentro da Cidadela. Fora da Cidadela: não há reforços — mas o grito pode alertar criatura do lago próxima (Mestre decide)." }
    ],
    hex: { layout: "Cidadela no casco de Magnalaga", hint: "Guardiões em formação são difíceis de quebrar — ataques de área são mais eficientes que físicos individuais. A janela de reforços de 1d3 rodadas é a urgência: terminar o combate antes de chegarem. A situação ideal é evitar o combate inteiramente com a carta de Dunforge." },
    spells: [],
    loot: [{ item: "Martelo do Casco (arma com bônus contra criaturas de carapaça)", chance: 40, qty: "1" }, { item: "Escudo de Casco de Magnalaga (escudo mágico — resiste a água)", chance: 25, qty: "1" }] },

  { id: "caranguejo-das-profundezas",
    name: "Caranguejo Colossal das Profundezas do Lago",
    difficulty: 3,
    attrs: { FOR:6, DEX:1, AGI:0, INT:0, SAB:2 },
    size: "colossal",
    category: "Besta Aquática — Parasita de Magnalaga",
    location: ["Caverna", "Dungeon", "Pântano"],
    hp: 180, physDefense: 9, magDefense: 1, dodge: 7,
    actions: 2,
    damage: "1d12+1d8+FOR (pinça colossal) + Esmagar",
    behavior: "Puramente instintivo — ataca qualquer movimento próximo. Parasita legítimo de Magnalaga (a própria tartaruga o tolera pois ele come outros parasitas menores). Os Guardiões do Casco às vezes contratam aventureiros para removê-lo quando fica grande demais e começa a arrancar placas do casco.",
    lore: "Caranguejos comuns do Lago Central que vivem na parte inferior do casco de Magnalaga há séculos crescem absurdamente — alimentados pelos nutrientes que a tartaruga absorve e pelos parasitas menores que caçam. Um Caranguejo das Profundezas adulto pode ser maior que uma carroça. Magnalaga os tolera até certo tamanho; depois de um certo ponto, é trabalho dos anões lidar com eles.",
    abilities: [
      { name: "Pinça de Abertura", desc: "Ao acertar ataque: além do dano, o alvo testea FOR (difícil) ou fica Preso na pinça. Enquanto Preso: 1d8+FOR de esmagamento automático por rodada. A pinça segura 1 criatura de cada vez. Libertar: FOR (difícil), 2 Ações. Aliados podem ajudar: FOR (normal)." },
      { name: "Carapaça Abissal", desc: "Resistência a dano físico de armas não-mágicas (−3 por dado). Imune a frio. Vulnerável a fogo (terreno subaquático torna improvável — mas magia de fogo funciona normalmente). Qualquer ataque que cause Perfurante em vez de Cortante ou Contundente ignora −1 da resistência da carapaça (perfura as juntas)." },
      { name: "Varredura de Pernas", desc: "1 Ação (1x/2 rodadas): varre o chão com as 8 pernas. Todos em raio 2 hex testam AGI (normal) ou caem Derrubados e são empurrados 2 hex. O Caranguejo então pode avançar para o hex desocupado." }
    ],
    hex: { layout: "Fundo do casco — terreno rochoso úmido", hint: "A Pinça é o maior perigo — um personagem Preso em combate subaquático (se aplicável) também pode estar se afogando. Ataques Perfurantes (adagas, lanças, flechas) são mais eficientes contra a carapaça. Forçar o Caranguejo para área estreita neutraliza a Varredura de Pernas." },
    spells: [],
    loot: [{ item: "Carapaça de Caranguejo das Profundezas (material raro para armadura aquática)", chance: 70, qty: "1d3" }, { item: "Pinça do Caranguejo (ferramenta de escalada — suporta 200kg)", chance: 40, qty: "1" }] },

  /* ─── DERIVADOS DO DEUS MARCADO — Avatar ─────────────────────── */

  { id: "arauto-menor-deus-marcado",
    name: "Arauto da Marca",
    difficulty: 3,
    attrs: { FOR:3, DEX:3, AGI:3, INT:4, SAB:4 },
    size: "normal",
    category: "Campeão do Deus Marcado",
    location: ["Cemitério", "Floresta", "Planície", "Templo"],
    hp: 145, physDefense: 7, magDefense: 6, dodge: 11,
    actions: 3,
    damage: "1d8+1d6 (lâmina da marca) ou Magias da Corrupção",
    behavior: "Metodicamente cruel — não tem emoções mas simula raiva, medo e alegria para manipular. Sempre está cumprindo um objetivo específico (rastrear Aela, destruir um santuário, corromper um NPC). O combate é apenas um obstáculo para ele — se o grupo for mais fraco, luta. Se for mais forte, foge para cumprir a missão de outra forma.",
    lore: "O Arauto da Marca que perseguiu Theodor é o mesmo que o grupo vê de longe no início da campanha. Não é único — há vários Arautos, cada um cumprindo missão separada do Deus Marcado. São humanos que cederam voluntariamente ao Deus Marcado em troca de poder. A Marca no pescoço é o símbolo do contrato. Matar um Arauto não quebra o contrato — outro toma o lugar na mesma missão.",
    abilities: [
      { name: "Marca Propagada", desc: "Ao acertar 3x o mesmo alvo no combate: tenta propagar a Marca. O alvo testea Força de Vontade (difícil). Falha: ganha Maldição da Marca (−1 em todos os testes por sessão, removível apenas em Santuário de Thurgomur ou Sss'era). O Arauto é avisado da localização do alvo marcado por 1 semana." },
      { name: "Escudo da Corrupção", desc: "Passivo: magias de cura causam metade do efeito no Arauto (a corrupção rejeita energia positiva). Maldições aplicadas nele não funcionam (já está comprometido). Ao receber dano sagrado: −2 Def.Física por turno afetado (ponto fraco genuíno)." },
      { name: "Fragmento do Avatar", desc: "1 Ação (1x/combate): canaliza brevemente o Avatar. Por 2 rodadas: +1d8 em todos os ataques, imune a Derrubado e Preso, e qualquer aliado corrompido em raio 6 hex recebe +2 em tudo. Após o Fragmento: o Arauto fica Exausto (−1 Ação) por 2 rodadas (o corpo mortal não suporta bem a canalização)." },
      { name: "Missão Prioritária", desc: "Passivo: o Arauto sempre tem um objetivo além de matar o grupo. Se o objetivo for cumprido durante o combate (ex: ele chegar ao Altar da Marca, ou tocar a menina Aela, ou destruir o item que protegem): ele recua imediatamente sem continuar lutando, mesmo se o grupo estiver vencendo." }
    ],
    hex: { layout: "Variável — segue o grupo para qualquer arena", hint: "A Missão Prioritária é a mecânica mais importante: identificar o que o Arauto está tentando fazer neste combate específico e impedi-lo é mais importante que matá-lo. Dano sagrado é a fraqueza principal. A Marca Propagada em 3 acertos sequenciais é prioridade de prevenção — não deixar o mesmo personagem ser alvo 3 vezes." },
    spells: ["Fragmento do Avatar (1x/combate, 2 rodadas)", "Marca Propagada (3 acertos)"],
    loot: [{ item: "Símbolo da Marca (item de missão — informação sobre o Deus Marcado)", chance: 100, qty: "1" }, { item: "Lâmina da Marca (arma mágica — +1d4 de corrupção por acerto)", chance: 40, qty: "1" }, { item: "Fragmento de Conhecimento do Arauto (pista sobre próximo objetivo)", chance: 70, qty: "1" }] },

  /* ═══════════════════════════════════════════════════════════════
     MONSTROS DE GRUPO — O nome do grupo aparece entre parênteses.
     Cada grupo tem lore compartilhado explicando por que são
     encontrados juntos. Grupos têm sinergia tática entre si.
     ═══════════════════════════════════════════════════════════════ */

  /* ══════════════════════════════════════════════════════════════
     GRUPO: Legião do Lich do Pântano
     Lore: O Pantano do Véu Cinzento, a leste do Rio Mara, esconde
     a cripita de Varek — um Necromante que morreu antes de terminar
     seu filactério. Seu espírito ficou preso num estado semi-lich,
     incapaz de descansar ou de viver. Por 200 anos ele criou uma
     Legião de mortos-vivos com os viajantes que se perderam no
     pântano. O grupo os encontra ao investigar desaparecimentos
     no caminho norte ou ao tentar atravessar o pântano.
     ══════════════════════════════════════════════════════════════ */

  { id: "esqueleto-arqueiro-lich-pantano",
    name: "Esqueleto Arqueiro (Legião do Lich do Pântano)",
    difficulty: 2,
    attrs: { FOR:1, DEX:3, AGI:1, INT:0, SAB:0 },
    size: "normal", category: "Morto-Vivo",
    location: ["Floresta", "Pântano"],
    hp: 50, physDefense: 4, magDefense: 1, dodge: 12,
    actions: 2, damage: "1d8+DEX (flecha podre) — alcance 6 hex",
    group: "Legião do Lich do Pântano",
    groupRole: "Ataque à distância — fica em posição elevada (árvores, troncos) e cobre os guerreiros com flechas.",
    groupSynergy: "Enquanto um Esqueleto Guerreiro da Legião estiver em combate melee com um alvo, o Arqueiro tem +1 na Chance de Acerto contra esse alvo (o guerreiro o mantém ocupado).",
    abilities: [
      { name: "Flecha de Osso Podre", desc: "A flecha tem veneno de pântano residual: acerto causa Infecção (−1 FOR temporária por rodada por 2 rodadas). Cumulativo: 3 acertos = −3 FOR. Antídoto ou Medicina (normal) interrompe." },
      { name: "Posição Elevada", desc: "Passivo: se estiver em hex acima do terreno (tronco, galho, plataforma): +1 Chance de Acerto e +1d4 de dano." },
      { name: "Imune a Condições Mortais", desc: "Imune a veneno, sangramento, medo e doenças. Armas não-mágicas causam −1 de dano por dado (ossos dispersam o impacto). Vulnerável a dano contundente: +1 por dado." }
    ],
    hex: { layout: "Pântano com névoa (visibilidade reduzida a 5 hex)", hint: "O Arqueiro usa névoa e posição elevada — Percepção (difícil) para localizá-lo na névoa do pântano. Com um Esqueleto Guerreiro na frente, o Arqueiro ganha vantagem. Magia de luz dissipa a névoa local por 3 rodadas, revelando posição." },
    spells: [], behavior: "Fica parado em posição elevada e atira. Nunca se move se tiver linha de visão. Se o guerreiro aliado cair: recua 3 hexes e continua atirando.", loot: [{ item: "Flechas Podres (1d6)", chance: 60, qty: "1d6" }, { item: "Fragmento de Osso do Pântano (ingrediente de poção)", chance: 30, qty: "1" }] },

  { id: "esqueleto-guerreiro-lich-pantano",
    name: "Esqueleto Guerreiro (Legião do Lich do Pântano)",
    difficulty: 2,
    attrs: { FOR:2, DEX:1, AGI:1, INT:0, SAB:0 },
    size: "normal", category: "Morto-Vivo",
    location: ["Floresta", "Pântano"],
    hp: 65, physDefense: 4, magDefense: 0, dodge: 11,
    actions: 2, damage: "1d8+1d4+FOR (espada enferrujada)",
    group: "Legião do Lich do Pântano",
    groupRole: "Combate corpo a corpo — avança em linha reta para o inimigo mais próximo. Tanque do grupo.",
    groupSynergy: "Se adjacente a um Zumbi Explosivo da Legião: empurra o Zumbi em direção ao inimigo como Ação Livre (o Guerreiro usa o Zumbi como arma viva). O Zumbi ainda explode normalmente ao morrer.",
    abilities: [
      { name: "Ossatura do Pântano", desc: "Os ossos encharcados do pântano são resilientes: armas cortantes causam −2 por dado. Contundente: dano normal. Fogo: +1d6 (os ossos ressecam e pegam fogo facilmente)." },
      { name: "Marcha Imparável", desc: "Passivo: não pode ser Derrubado ou Atordoado (o Lich o sustenta magicamente). Movimento sempre 4, mesmo em terreno de pântano (lama, água rasa)." },
      { name: "Reanimar", desc: "Se destruído com dano não-sagrado: 20% de chance (d10 ≤ 2) de se reanimar com 5 HP no próximo turno do Lich. Dano sagrado ou fogo: sem Reanimar." }
    ],
    hex: { layout: "Pântano com obstáculos de barro e raízes", hint: "A Marcha Imparável o torna inútil de empurrar ou derrubar — focar em dano e matar rápido é o caminho. Fogo é a fraqueza mais acessível. O Guerreiro empurrar o Zumbi Explosivo é a sinergia mais perigosa — reposicionar o Zumbi antes que o Guerreiro chegue perto é prioritário." },
    spells: [], behavior: "Avança direto sem desvio. Se houver Zumbi Explosivo aliado próximo: empurra-o na direção do grupo. Prioriza personagem que atacou o Arqueiro.", loot: [{ item: "Espada Enferrujada do Pântano (sucata — vale 1 bronze)", chance: 80, qty: "1" }, { item: "Osso do Pântano (material alquímico)", chance: 25, qty: "1" }] },

  { id: "zumbi-do-pantano-lich",
    name: "Zumbi Explosivo do Pântano (Legião do Lich do Pântano)",
    difficulty: 2,
    attrs: { FOR:3, DEX:0, AGI:0, INT:0, SAB:0 },
    size: "normal", category: "Morto-Vivo",
    location: ["Pântano"],
    hp: 70, physDefense: 4, magDefense: 0, dodge: 7,
    actions: 1, damage: "1d6+FOR (soco podre) ou Explosão",
    group: "Legião do Lich do Pântano",
    groupRole: "Arma viva — usado pelo Guerreiro como bomba. Funciona sozinho mas é devastador em combinação.",
    groupSynergy: "O Guerreiro da Legião pode empurá-lo como Ação Livre. Quando explode, os gases do pântano amplificam a explosão para raio 3 hex (em vez de 2) e causa veneno adicional (1d4/rodada, 2 rodadas).",
    abilities: [
      { name: "Explosão de Gás do Pântano", desc: "Ao morrer: explode. Raio 3 hex (amplificado pelo gás do pântano vs. raio 2 normal). Dano: 2d6 de putrefação + Envenenado (1d4/rodada, 2 rodadas). AGI (normal) para metade. Encadeia com outros Zumbis no raio." },
      { name: "Avanço Lento", desc: "Velocidade 3 em terra firme, 2 em lama. Nunca desvia. Sempre vai em direção ao inimigo mais próximo." }
    ],
    hex: { layout: "Pântano", hint: "O encadeamento de explosões é mais perigoso que qualquer ataque individual. Matar um Zumbi longe dos outros e do grupo é sempre a prioridade." },
    spells: [], behavior: "Avança lentamente. Se um Guerreiro Esqueleto empurrá-lo: vai até o destino. Se não: apenas avança.", loot: [{ item: "Gás do Pântano Engarrafado (2 doses — pode ser usado como bomba)", chance: 30, qty: "1" }] },

  { id: "varek-lich-semi",
    name: "Varek, o Lich Incompleto (Legião do Lich do Pântano)",
    difficulty: 4,
    attrs: { FOR:2, DEX:3, AGI:3, INT:7, SAB:5 },
    size: "normal", category: "Morto-Vivo Elite",
    location: ["Pântano"],
    hp: 195, physDefense: 8, magDefense: 10, dodge: 12,
    isElite: true,
    group: "Legião do Lich do Pântano",
    groupRole: "Líder e invocador — controla toda a Legião à distância.",
    groupSynergy: "Enquanto Varek viver: todos os mortos-vivos da Legião no campo têm Reanimar 40% (em vez de 20%) e agem com +1 Ação por turno. Ao morrer: todos os mortos-vivos da Legião presentes caem simultaneamente (o elo mágico se desfaz).",
    abilities: [
      { name: "Filactério Incompleto", desc: "Varek tentou criar um filactério mas falhou — o objeto existe (uma gema negra no altar central) mas está danificado. Ao cair a 0 HP: se o Filactério ainda existir no altar, Varek reconstitui com 40 HP em 2 rodadas. Destruir o Filactério (HP 20, Def 0) primeiro previne a reconstituição. O Filactério fica a 8 hex de Varek propositalmente." },
      { name: "Invocar do Pântano", desc: "1 Ação de Magia (1x/2 rodadas): invoca 1d4 Zumbis do Pântano de qualquer hex de água ou lama no campo. Dura enquanto o Filactério existir. Sem Filactério: não pode invocar." },
      { name: "Toque da Morte Incompleta", desc: "Ao acertar: alvo testea Resistência (difícil). Falha: inicia processo de necrose — perde 1d6 de FOR e 1d6 de SAB temporários por rodada por 3 rodadas. Se FOR ou SAB chegarem a 0: o alvo cai inconsciente e começa a se transformar em zumbi (Medicina difícil ou cura sagrada para reverter antes de 10 minutos)." },
      { name: "Presença do Lich Incompleto", desc: "Passivo: todos que entram no raio 4 hex de Varek testam Força de Vontade (normal). Falha: −1d4 nos ataques por 2 rodadas (a presença inacabada causa confusão, não medo genuíno — o Lich não consegue aterrorizar completamente)." }
    ],
    hex: { layout: "Cripta 12x10 com altar central, 4 colunas e Filactério ao norte", terrain: ["Altar Central (Filactério no topo — HP 20, Def 0)", "Colunas (cobertura pesada — 4 posições)", "Lama Profunda (sul — invocação de Zumbis possível)", "Varek começa ao norte, protegendo o Filactério"], hint: "Dois objetivos simultâneos: destruir o Filactério (para prevenir reconstituição) e matar Varek. Dividir o grupo: um foca o Filactério enquanto o outro contém Varek. Cuidado com o Invocar do Pântano — lama ao sul sempre gera novos Zumbis." },
    spells: ["Invocar do Pântano", "Toque da Morte Incompleta"],
    behavior: "Fica próximo ao Filactério (protegendo). Usa Invocar do Pântano para encher o campo. Toque da Morte em quem tiver mais FOR. Se o Filactério for destruído: entra em pânico e ataca com tudo — sem reconstituição possível, fica agressivo.", loot: [{ item: "Filactério Quebrado de Varek (fragmento — material de necromancia)", chance: 100, qty: "1" }, { item: "Grimório do Lich Incompleto (magias de invocação nível 2-3)", chance: 60, qty: "1" }, { item: "Gema do Fracasso (item de história — conta o que Varek tentou)", chance: 100, qty: "1" }] },

  /* ══════════════════════════════════════════════════════════════
     GRUPO: Alcateia das Sombras Cinzentas
     Lore: No coração da Floresta Negra, um Lobo do Vazio corrompeu
     uma alcateia inteira — não de propósito, mas por contato. Os
     lobos que viveram próximos ao Lobo do Vazio por anos absorveram
     fragmentos de sua energia. Agora têm pelagem escura e olhos
     brancos mas são menores e menos poderosos que ele. Encontrados
     em qualquer floresta densa perto de onde o Vazio está presente.
     ══════════════════════════════════════════════════════════════ */

  { id: "lobo-cinzento-alcateia",
    name: "Lobo Cinzento (Alcateia das Sombras Cinzentas)",
    difficulty: 2,
    attrs: { FOR:2, DEX:2, AGI:3, INT:1, SAB:1 },
    size: "normal", category: "Besta Corrompida",
    location: ["Floresta", "Planície"],
    hp: 60, physDefense: 4, magDefense: 2, dodge: 12,
    actions: 2, damage: "1d6+1d4+DEX (mordida sombria)",
    group: "Alcateia das Sombras Cinzentas",
    groupRole: "Flanqueador — circula o grupo enquanto o Alfa pressiona de frente.",
    groupSynergy: "Se 2+ Lobos Cinzentos estão adjacentes ao mesmo alvo: ambos ganham +1 Chance de Acerto e o alvo não pode Retaliar (a quantidade de lobos ao redor torna o contra-ataque inviável).",
    abilities: [
      { name: "Eco do Vazio", desc: "Cada mordida tem 20% de chance (d10 ≤ 2) de aplicar fragmento de corrupção: alvo perde 1 de SAB temporária. Cumulativo. Se SAB chegar a 0 por este efeito: o alvo vê alucinações do Vazio por 1 rodada (Confuso)." },
      { name: "Movimento de Sombra", desc: "Em hex com pouca luz (tocha a 4+ hex ou escuridão): o Lobo some visualmente até atacar. A posição dele é desconhecida — o atacante precisa declarar hex antes de rolar (Percepção difícil para localizar corretamente)." }
    ],
    hex: { layout: "Floresta densa com pouca luz", hint: "Manter tochas ou magia de luz é essencial — sem luz, os Lobos ficam invisíveis entre ataques. O flanqueio de 2+ Lobos no mesmo alvo é o padrão padrão da alcateia — dispersar o grupo para evitar ser rodeado." },
    spells: [], behavior: "Circula pelo exterior do campo em hex de sombra. Entra para atacar quando o Alfa tiver o alvo ocupado. Foge se mais da metade da alcateia cair.", loot: [{ item: "Pele do Lobo Cinzento (material — resistência a corrupção)", chance: 50, qty: "1" }] },

  { id: "loba-alfa-alcateia",
    name: "Loba Alfa das Sombras (Alcateia das Sombras Cinzentas)",
    difficulty: 3,
    attrs: { FOR:4, DEX:3, AGI:3, INT:2, SAB:3 },
    size: "normal", category: "Besta Corrompida",
    location: ["Floresta", "Templo"],
    hp: 135, physDefense: 7, magDefense: 3, dodge: 11,
    actions: 3, damage: "1d10+1d6+FOR (mordida do Vazio)",
    group: "Alcateia das Sombras Cinzentas",
    groupRole: "Líder e pressão central — mantém o alvo ocupado enquanto os Cinzentos flanqueiam.",
    groupSynergy: "Enquanto a Alfa viver: os Lobos Cinzentos da alcateia têm +2 em todas as rolagens e não fogem. Ao a Alfa morrer: os sobreviventes imediatamente tentam fugir (AGI (normal) para escapar nos próximos 2 rodadas).",
    abilities: [
      { name: "Chamado da Alcateia", desc: "1 Ação Livre (1x/combate): ulula. Todos os Lobos Cinzentos da Alcateia no campo ganham +1 Ação neste turno e se reposicionam 2 hex em direção ao alvo mais isolado do grupo." },
      { name: "Mordida do Vazio", desc: "Ao acertar: além do dano, o alvo testea Força de Vontade (normal). Falha: vê um fragmento do que o Lobo do Vazio viu — fica com −1d6 nos ataques por 2 rodadas (a visão do Vazio paralisa a mente momentaneamente)." },
      { name: "Resistência da Matriarca", desc: "Passivo: imune a Medo e Intimidação. Ao cair abaixo de 30% HP: entra em Fúria de Alcateia — velocidade +2 e ataques causam +1d6 de dano sombrio por 3 rodadas. Não pode ser negociada ou acalmada neste estado." }
    ],
    hex: { layout: "Floresta com área central aberta e bordas sombreadas", hint: "Matar a Alfa primeiro encerra o combate mais rapidamente que qualquer outra coisa — os Cinzentos fogem imediatamente. Porém a Alfa é mais difícil de acertar. Ordem de prioridade: eliminar 2 Cinzentos para reduzir a pressão de flanqueio, depois focar na Alfa." },
    spells: [], behavior: "Pressiona o alvo com mais HP de frente. Usa Chamado no turno 2 para reposicionar todos os Cinzentos. Quando abaixo de 30%: abandona a estratégia e ataca o alvo mais próximo com tudo.", loot: [{ item: "Pele da Loba Alfa (material raro — +1 AGI como acessório)", chance: 60, qty: "1" }, { item: "Garra do Vazio (componente — resistência a corrupção)", chance: 40, qty: "1" }] },

  /* ══════════════════════════════════════════════════════════════
     GRUPO: Clã dos Espinhos de Ferro
     Lore: Os Goblins dos Espinhos de Ferro não são tribais comuns.
     São goblins que foram capturados e treinados por um Mercenário
     Elite chamado Borkan há 40 anos — ensinados a usar táticas de
     soldado em vez de emboscada caótica. Borkan morreu, mas o
     sistema de treinamento sobreviveu: os filhos ensinaram os netos.
     Encontrados nas rotas comerciais da Grande Planície como
     mercenários de aluguel ou salteadores organizados.
     ══════════════════════════════════════════════════════════════ */

  { id: "goblin-atirador-espihos-ferro",
    name: "Goblin Atirador (Clã dos Espinhos de Ferro)",
    difficulty: 1,
    attrs: { FOR:0, DEX:2, AGI:2, INT:1, SAB:0 },
    size: "normal", category: "Humanoide",
    location: ["Estrada", "Floresta", "Planície"],
    hp: 30, physDefense: 2, magDefense: 0, dodge: 13,
    actions: 2, damage: "1d6+DEX (besta curta) — alcance 5 hex",
    group: "Clã dos Espinhos de Ferro",
    groupRole: "Suporte à distância — nunca entra em melee voluntariamente.",
    groupSynergy: "Se o alvo estiver Preso pela armadilha do Engenheiro do Clã: dano do Atirador é +1d6 (alvo imóvel é alvo fácil) e não pode esquivar.",
    abilities: [
      { name: "Tiro Coordenado", desc: "Se 2+ Atiradores atirarem no mesmo alvo no mesmo turno: o segundo tiro tem +1 Chance de Acerto (o primeiro tiro distraiu o alvo)." },
      { name: "Recuar e Atirar", desc: "Passivo: pode se mover 2 hex e atirar na mesma Ação sem penalidade. Usado para manter distância de melee." }
    ],
    hex: { layout: "Estrada com cobertura lateral", hint: "Atiradores em dupla são coordenados — o segundo sempre aproveita a distração do primeiro. Fechar o melee com um deles interrompe completamente sua eficácia (sem Tiro Coordenado, sem Recuar e Atirar eficiente)." },
    spells: [], behavior: "Fica em cobertura a 5+ hex. Se melee se aproxima: Recuar até hex seguro. Se sem saída: rende-se (Borkan ensinou que prisioneiros têm valor).", loot: [{ item: "Besta Curta Goblin (funcional)", chance: 50, qty: "1" }, { item: "Moedas (1d6 bronze)", chance: 70, qty: "1" }] },

  { id: "goblin-escudeiro-espinhos-ferro",
    name: "Goblin Escudeiro (Clã dos Espinhos de Ferro)",
    difficulty: 1,
    attrs: { FOR:1, DEX:1, AGI:1, INT:1, SAB:0 },
    size: "normal", category: "Humanoide",
    location: ["Estrada", "Floresta", "Planície"],
    hp: 40, physDefense: 4, magDefense: 0, dodge: 11,
    actions: 2, damage: "1d6+FOR (lança curta)",
    group: "Clã dos Espinhos de Ferro",
    groupRole: "Linha de frente — forma parede de escudos entre o grupo e os Atiradores.",
    groupSynergy: "Se 3+ Escudeiros estiverem em hexes adjacentes formando linha: ganham Formação de Espinhos — qualquer inimigo que entrar no hex adjacente à linha sofre 1d4 de dano de lança (reflexo defensivo coletivo).",
    abilities: [
      { name: "Formação Ensaiada", desc: "Passivo: se adjacente a outro Escudeiro, ambos têm +1 na Chance de Defesa com escudo (treinamento militar de Borkan). A formação de 3+ cria Formação de Espinhos." },
      { name: "Cobrir Retirada", desc: "Reação: ao aliado Atirador ser atingido em melee, o Escudeiro interpõe o escudo — absorve até 6 HP do dano no lugar do Atirador." }
    ],
    hex: { layout: "Estrada aberta", hint: "A linha de Escudeiros protege os Atiradores atrás deles. Quebrar a linha (matar 1 Escudeiro ou empurrar 1 para fora) elimina a Formação de Espinhos. Magia de área atinge linha e Atiradores ao mesmo tempo — eficiente contra a formação compacta." },
    spells: [], behavior: "Forma linha e avança lentamente. Cobre o Atirador se ameaçado. Se a linha quebrar: combate individual normal.", loot: [{ item: "Escudo de Madeira Reforçado (funcional)", chance: 40, qty: "1" }] },

  { id: "goblin-engenheiro-espinhos-ferro",
    name: "Goblin Engenheiro (Clã dos Espinhos de Ferro)",
    difficulty: 2,
    attrs: { FOR:0, DEX:3, AGI:1, INT:3, SAB:1 },
    size: "normal", category: "Humanoide",
    location: ["Estrada", "Floresta", "Planície"],
    hp: 45, physDefense: 4, magDefense: 2, dodge: 12,
    actions: 2, damage: "1d4+DEX (faca) ou Armadilha",
    group: "Clã dos Espinhos de Ferro",
    groupRole: "Suporte técnico — instala armadilhas antes e durante o combate.",
    groupSynergy: "Seus Espinhos de Ferro (a armadilha do grupo) beneficiam todos: ao Prender um alvo, todos os aliados do Clã no campo têm +1 Chance de Acerto contra ele. O nome do Clã vem dessas armadilhas.",
    abilities: [
      { name: "Espinhos de Ferro (Armadilha)", desc: "Antes do combate (colocada fora da visão) ou 1 Ação: instala armadilha de espinhos em hex. Primeiro inimigo que entrar: Preso (FOR normal para escapar, 1 Ação) + 1d6 de perfuração. A armadilha é visível com Percepção (normal) mas o Engenheiro instala em hexes de alta passagem naturalmente." },
      { name: "Bomba de Fumaça", desc: "1 Ação (2/combate): atira bomba a 4 hex. Área 2x2 hex fica coberta por fumaça por 3 rodadas — visibilidade 0 no interior. Ataques à distância na fumaça têm −3 na Chance de Acerto. O Clã usa a fumaça para reposicionar sem ser visto." }
    ],
    hex: { layout: "Estrada com pontos de passagem obrigatória", hint: "O Engenheiro instala os Espinhos de Ferro nos hexes que o grupo PRECISA cruzar — choke points naturais. Percepção (normal) antes de avançar detecta a armadilha. A Bomba de Fumaça cobre a retirada dos Atiradores." },
    spells: [], behavior: "Fica atrás de todos. Instala Espinhos de Ferro no primeiro turno em hex de choke point. Usa Bomba de Fumaça quando Atirador está ameaçado. Em combate direto: foge.", loot: [{ item: "Kit de Armadilhas de Espinhos (3 usos)", chance: 60, qty: "1" }, { item: "Bomba de Fumaça (2 usos)", chance: 40, qty: "1d2" }] },

  { id: "borkan-filho-capitan-espinhos",
    name: "Borkan Filho, Capitão dos Espinhos (Clã dos Espinhos de Ferro)",
    difficulty: 3,
    attrs: { FOR:3, DEX:3, AGI:2, INT:3, SAB:2 },
    size: "normal", category: "Humanoide Elite",
    location: ["Cidade", "Floresta", "Planície", "Ruínas"],
    hp: 140, physDefense: 7, magDefense: 3, dodge: 11,
    isElite: true,
    group: "Clã dos Espinhos de Ferro",
    groupRole: "Líder estratégico — coordena todos do Clã e adapta táticas ao que o grupo faz.",
    groupSynergy: "Enquanto Borkan Filho viver: o Clã inteiro ganha +1 em todas as rolagens. Ao morrer: Escudeiros recuam e Atiradores disparam uma última salva simultânea antes de fugir.",
    abilities: [
      { name: "Táticas de Borkan", desc: "1 Ação Livre (1x/rodada): ordena um movimento de repositcionamento. 1 aliado do Clã se move até 4 hex sem custo de Ação. Usado para: tirar Atirador de perigo, quebrar cerco, ou posicionar para Formação de Espinhos." },
      { name: "Golpe do Mercenário", desc: "Ao acertar: +1d6 de dano adicional se o alvo tiver Chance de Defesa abaixo de 4 nesta rodada (detecta fraqueza defensiva instintivamente — herança do treinamento de Borkan pai)." },
      { name: "Rendição Honrada", desc: "Se abaixo de 20% HP: oferece rendição formal. 'Borkan não ensinou a morrer por nada.' Pode ser negociado — o Clã presta serviços como guias ou informantes em troca de vida. SAB (normal) para perceber que a oferta é genuína." }
    ],
    hex: { layout: "Acampamento com posição elevada para Borkan (observação)", hint: "Borkan Filho dirige de posição elevada — pode ver todo o campo. Retirada dos Atiradores quando ameaçados é automática via Táticas de Borkan. Se o grupo negociar na Rendição Honrada: o Clã pode ser contratado (20 prata por dia — informação de rotas e proteção)." },
    spells: [], behavior: "Nunca entra em melee até metade do clã cair. Usa Táticas de Borkan todo turno para otimizar posições. Quando entra em melee: golpeia quem tiver menos Chance de Defesa.", loot: [{ item: "Manual de Táticas de Borkan (treinamento — aprende Pressão Tática como perícia)", chance: 50, qty: "1" }, { item: "Armadura do Capitão (armadura rara, funcional)", chance: 40, qty: "1" }, { item: "Contrato do Clã (oferta de aliança)", chance: 100, qty: "1" }] },

  /* ══════════════════════════════════════════════════════════════
     GRUPO: Colônia Subterrânea de Vorn
     Lore: Nas profundezas sob o Rio Mara existe uma colônia de
     Kobolds diferente das tribais comuns — fundada por um Kobold
     chamado Vorn que aprendeu alquimia básica com um Mago itinerante.
     A Colônia de Vorn sobrevive fabricando armadilhas e vendendo
     para bandidos. São tecnicamente neutros mas protegem o túnel
     com violência. O grupo os encontra ao tentar usar o atalho
     subterrâneo sob o Rio Mara.
     ══════════════════════════════════════════════════════════════ */

  { id: "kobold-armadilheiro-vorn",
    name: "Kobold Armadilheiro (Colônia Subterrânea de Vorn)",
    difficulty: 1,
    attrs: { FOR:0, DEX:3, AGI:2, INT:2, SAB:0 },
    size: "normal", category: "Humanoide",
    location: ["Caverna", "Dungeon"],
    hp: 25, physDefense: 2, magDefense: 0, dodge: 13,
    actions: 2, damage: "1d4+DEX (dardo envenenado) — alcance 4 hex",
    group: "Colônia Subterrânea de Vorn",
    groupRole: "Instalador de armadilhas e atirador à distância.",
    groupSynergy: "Conhece cada armadilha da Colônia — nunca as aciona acidentalmente. Pode reposicionar armadilha existente como Ação Livre 1x/rodada (move para hex adjacente).",
    abilities: [
      { name: "Dardo Alquímico", desc: "Dardo tem veneno de Vorn — fraco mas acessível em massa. Acerto: 1d4 de veneno imediato + Lento (−1 Movimento, 2 rodadas). Antídoto comum resolve. Cumulativo com outras fontes de Lento." },
      { name: "Desaparecer nos Túneis", desc: "Como Ação Livre: se estiver adjacente a uma passagem de túnel marcada, desaparece completamente (Furtividade automática). Reaparece em qualquer outra passagem marcada na próxima rodada. A Colônia tem túneis conectados em toda a caverna." }
    ],
    hex: { layout: "Caverna com múltiplas passagens e armadilhas pré-instaladas", hint: "Os Kobolds conhecem cada armadilha — o grupo não. Percepção (difícil) ou Ferramentas de Ladrão (normal) para detectar armadilha antes de pisar. Armadilheiros que desaparecem nos túneis podem reaparecer em qualquer ponto — fechar as passagens (bloco de pedra, magia) restringe a mobilidade." },
    spells: [], behavior: "Instala dardo, desaparece, reaparece em outro ponto, instala dardo. Nunca fica parado. Se capturado: fala de Vorn imediatamente (é a única moeda que tem).", loot: [{ item: "Dardos Alquímicos de Vorn (1d8 unidades)", chance: 70, qty: "1d8" }, { item: "Mapa dos Túneis da Colônia (valioso para quem usa o atalho)", chance: 30, qty: "1" }] },

  { id: "kobold-guardiao-vorn",
    name: "Kobold Guardião (Colônia Subterrânea de Vorn)",
    difficulty: 2,
    attrs: { FOR:2, DEX:1, AGI:2, INT:1, SAB:1 },
    size: "normal", category: "Humanoide",
    location: ["Caverna", "Dungeon"],
    hp: 50, physDefense: 4, magDefense: 0, dodge: 12,
    actions: 2, damage: "1d6+FOR (lança de osso) + armadilha próxima",
    group: "Colônia Subterrânea de Vorn",
    groupRole: "Linha de frente — usa as armadilhas do campo como extensão do combate.",
    groupSynergy: "Pode ativar deliberadamente qualquer armadilha em raio 2 hex como Ação Livre (mesmo com aliados no raio — os Guardiões sabem se esquivar, os inimigos não).",
    abilities: [
      { name: "Usar Armadilha como Arma", desc: "Ação Livre: aciona armadilha em raio 2 hex deliberadamente. Os Guardiões treinaram ao redor das armadilhas — testam AGI automaticamente com vantagem (+1d4 na rolagem) para evitar o próprio dano." },
      { name: "Retroceder e Redirecionar", desc: "Reação: ao ser atacado em melee, pode recuar 2 hex passando por hex de armadilha — o inimigo que seguir entra na armadilha. (O inimigo pode não saber que há armadilha no caminho.)" }
    ],
    hex: { layout: "Caverna com armadilhas visíveis e ocultas", hint: "Guardiões que ativam armadilhas deliberadamente são o pesadelo de grupos compactos — separe o grupo para não estar todos no raio de 2 hex de uma armadilha ao mesmo tempo. Retroceder e Redirecionar é uma armadilha comportamental — seguir o Guardião que recua pode ser perigoso." },
    spells: [], behavior: "Fica na entrada da câmara principal. Ao ser atacado: recua por hex de armadilha. A cada turno: ativa a armadilha mais perto de 2 inimigos.", loot: [{ item: "Lança de Osso (funcional, 1d4 dano)", chance: 60, qty: "1" }] },

  { id: "vorn-alquimista-kobold",
    name: "Vorn, o Alquimista (Colônia Subterrânea de Vorn)",
    difficulty: 2,
    attrs: { FOR:0, DEX:2, AGI:1, INT:4, SAB:2 },
    size: "normal", category: "Humanoide Elite",
    location: ["Dungeon"],
    hp: 65, physDefense: 4, magDefense: 4, dodge: 12,
    isElite: true,
    group: "Colônia Subterrânea de Vorn",
    groupRole: "Líder e inventor — raramente combate diretamente. Prefere negociar.",
    groupSynergy: "Vorn criou todas as armadilhas da Colônia. Enquanto estiver presente, pode criar nova armadilha em qualquer hex vazio como Ação (unlimited — ele é muito mais habilidoso que os Armadilheiros).",
    abilities: [
      { name: "Proposta de Negócio", desc: "Passivo: Vorn tenta negociar ANTES do combate. Se o grupo ouvir sua proposta (não atacar por 1 rodada): ele oferece passagem pelo túnel em troca de 5 prata por pessoa OU de um ingrediente alquímico que ele precise. SAB (normal) para perceber que a oferta é legítima. Se o grupo aceitar: nenhum kobold ataca." },
      { name: "Bomba Alquímica de Vorn", desc: "1 Ação (3/combate): lança bomba a 4 hex. Escolhe efeito: Ácido (1d8, −1 Def.Física por 2 rodadas), Paralítico (AGI normal ou Paralisado 1 rodada), Fumaça (área 3x3 hex, visibilidade 0 por 3 rodadas)." },
      { name: "Fuga Calculada", desc: "Ao cair abaixo de 30% HP: usa fumaça e desaparece pelos túneis. Pode ser encontrado novamente mas estará em local diferente — e mais defensivo." }
    ],
    hex: { layout: "Laboratório com bancadas (cobertura), armadilhas customizadas e saídas múltiplas", hint: "Vorn NÃO quer lutar — a negociação é genuína. Se o grupo atacar sem ouvir: ele combate eficientemente mas é mais valioso como aliado. Um Vorn aliado pode fabricar Poções e Bombas para o grupo a preço de custo." },
    spells: ["Bomba Alquímica de Vorn (3/combate)"],
    behavior: "Proposta de Negócio primeiro, sempre. Se o grupo atacar: bombas de fumaça para cobrir os Guardiões e escapar. Se encurralado: rende-se e negocia novamente.", loot: [{ item: "Livro de Alquimia de Vorn (receitas de 5 bombas — subclasse Alquimista aprende 2)", chance: 80, qty: "1" }, { item: "Bomba Alquímica Sortida (3 tipos, 1 cada)", chance: 60, qty: "1" }, { item: "Acordo de Passagem (acesso ao atalho subterrâneo permanentemente)", chance: 100, qty: "1" }] }

,



/* ── Sem grupo ───────────────────────────────────────────────── */

{ id: "slime-acido",
  name: "Slime Ácido",
  difficulty: 1,
  attrs: { FOR:1, DEX:0, AGI:0, INT:0, SAB:0 },
  size: "normal", category: "Aberração",
  location: ["Caverna", "Cidade", "Dungeon"],
  hp: 35, physDefense: 2, magDefense: 0, dodge: 5,
  actions: 1, damage: "1d4+FOR (corrosão ácida)",
  behavior: "Sem inteligência — move-se para qualquer coisa orgânica próxima. Não persegue se a presa sumir. Útil para ensinar que nem todo monstro pode ser cortado eficientemente.",
  abilities: [
    { name: "Corrosão Lenta", desc: "Cada acerto corrói 1 ponto de Def.Física do alvo (armadura se degrada). O dano de corrosão é permanente até reparar a armadura (Artesanato normal ou ferreiro). Sem armadura: o ácido causa +1d4 de queimadura adicional." },
    { name: "Divisão", desc: "Ao receber dano cortante ou perfurante: em vez de morrer, divide-se em 2 Slimes Menores (HP 10 cada, dano 1d4). Fogo e dano contundente: mata normalmente sem divisão." },
    { name: "Imune a Condições", desc: "Imune a veneno, sangramento, medo, paralisação e qualquer efeito mental. Sem sistema nervoso para afetar." }
  ],
  hex: { layout: "Qualquer dungeon", hint: "Ensinador de divisão — jogadores que cortam o Slime criam dois. Fogo ou contundente é a resposta correta. A Corrosão de armadura força decisões sobre quando parar de usar golpes físicos." },
  spells: [], loot: [{ item: "Ácido de Slime (frasco — 1d6 dano ácido, 1 uso)", chance: 40, qty: "1" }] },

{ id: "morcego-noite-comum",
  name: "Morcego da Noite",
  difficulty: 1,
  attrs: { FOR:0, DEX:2, AGI:3, INT:0, SAB:1 },
  size: "normal", category: "Besta",
  location: ["Caverna", "Dungeon", "Floresta", "Ruínas"],
  hp: 20, physDefense: 2, magDefense: 0, dodge: 13,
  actions: 2, damage: "1d4+DEX (mordida frenética)",
  behavior: "Em bando — nunca sozinho. Mais incômodo que perigoso individualmente. Desorientador em grande número.",
  abilities: [
    { name: "Ataque em Mergulho", desc: "Voa e mergulha de altitude: +1d4 de dano no primeiro ataque de cada turno se estiver em altitude maior que o alvo. Após o ataque: volta para altitude automaticamente (sem custo de Ação)." },
    { name: "Ultrassom Perturbador", desc: "Se 3+ Morcegos atacarem o mesmo alvo no mesmo turno: o alvo testea Resistência (normal) ou fica Desorientado por 1 rodada (−1d4 em todos os testes — o som de frequência alta prejudica a concentração)." }
  ],
  hex: { layout: "Caverna com teto alto", hint: "Sozinhos são fáceis. Em grupo de 3+ ativam o Ultrassom — o incômodo real não é o dano mas a Desorientação cumulativa. Dano em área limpa grupos de morcegos eficientemente." },
  spells: [], loot: [{ item: "Asa de Morcego (ingrediente alquímico)", chance: 30, qty: "1d3" }] },

{ id: "goblin-xamã-basico",
  name: "Goblin Xamã",
  difficulty: 1,
  attrs: { FOR:0, DEX:1, AGI:1, INT:2, SAB:2 },
  size: "normal", category: "Humanoide",
  location: ["Caverna", "Floresta", "Ruínas"],
  hp: 30, physDefense: 2, magDefense: 3, dodge: 12,
  actions: 2, damage: "1d4+SAB (bastão ritual) ou Magia Menor",
  behavior: "Fica atrás dos guerreiros. Prioriza buffar aliados acima de atacar. Foge se ficar sozinho.",
  abilities: [
    { name: "Benção Tribal", desc: "1 Ação de Magia (1x/combate): aplica bênção tribal em 1 aliado goblin. Por 2 rodadas: +1d4 de dano e +1 na Chance de Acerto. O Xamã não pode ser o alvo." },
    { name: "Maldição Menor", desc: "1 Ação de Magia: alvo a 4 hex testea SAB (normal). Falha: −1 em todos os ataques por 2 rodadas. Simples mas eficaz." }
  ],
  hex: { layout: "Atrás da linha de goblins", hint: "A Benção Tribal duplica a eficácia de qualquer aliado que recebe — eliminar o Xamã primeiro é sempre correto. Funciona como introdução ao conceito de 'matar o suporte antes do tank'." },
  spells: ["Benção Tribal", "Maldição Menor"],
  loot: [{ item: "Bastão Ritual (cajado funcional 1d4)", chance: 50, qty: "1" }, { item: "Ervas Rituais (componente de magia)", chance: 30, qty: "1d3" }] },

{ id: "corvo-fantasma",
  name: "Corvo Fantasma",
  difficulty: 1,
  attrs: { FOR:0, DEX:2, AGI:3, INT:1, SAB:2 },
  size: "normal", category: "Espírito",
  location: ["Cemitério", "Floresta", "Planície", "Ruínas"],
  hp: 25, physDefense: 2, magDefense: 4, dodge: 13,
  actions: 2, damage: "1d4+SAB (bicada espectral — ignora Def.Física)",
  behavior: "Assusta antes de atacar. Se o grupo mostrar medo (fugir ou recuar): persegue. Se o grupo avança: recua para distância segura e ataca à distância.",
  abilities: [
    { name: "Grasnido do Presságio", desc: "1 Ação Livre (1x/combate): grasna de forma sobrenatural. Todos no campo testam Força de Vontade (normal). Falha: −1d4 nos ataques por 1 rodada (o som arrepia e tira a concentração)." },
    { name: "Etéreo Parcial", desc: "Passivo: armas não-mágicas causam metade do dano. Vulnerável a luz: em raio 2 hex de tocha ou magia de luz, perde Etéreo Parcial e é afetado normalmente por armas físicas." }
  ],
  hex: { layout: "Qualquer área", hint: "Introdução ao combate contra espíritos — ensina que armas normais são menos eficientes. Solução simples: acender tocha antes de atacar." },
  spells: [], loot: [{ item: "Pena do Corvo Fantasma (componente — amuleto de presságio)", chance: 40, qty: "1d2" }] },

{ id: "goblin-batedora",
  name: "Goblin Batedora",
  difficulty: 1,
  attrs: { FOR:0, DEX:2, AGI:3, INT:1, SAB:1 },
  size: "normal", category: "Humanoide",
  location: ["Cidade", "Estrada", "Floresta", "Montanha"],
  hp: 25, physDefense: 2, magDefense: 0, dodge: 13,
  actions: 2, damage: "1d4+DEX (faca curta)",
  behavior: "Observa e foge — raramente combate sozinha. Se encontrada sozinha: estava espionando e tem informação. Capturá-la viva é mais valioso que matá-la.",
  abilities: [
    { name: "Fuga Rápida", desc: "Passivo: ao cair abaixo de 50% HP, pode se mover 4 hex adicionais sem custo de Ação como Reação. Faz isso uma vez por combate automaticamente." },
    { name: "Grito de Alerta", desc: "1 Ação Livre: grita para alertar aliados. Em 1d3 rodadas: 1d4 Goblins chegam ao combate (se houver acampamento próximo — Percepção normal do grupo para notar antes do grito)." }
  ],
  hex: { layout: "Borda do mapa — perto de saída", hint: "A ameaça real é o Grito de Alerta — silenciá-la antes que grite evita reforços. Capturar (derrubar e segurar em vez de matar) fornece informação sobre o acampamento próximo." },
  spells: [], loot: [{ item: "Mapa rabiscado (localização aproximada do acampamento goblin)", chance: 60, qty: "1" }] },

{ id: "esqueleto-mago-simples",
  name: "Esqueleto Mago",
  difficulty: 1,
  attrs: { FOR:0, DEX:1, AGI:0, INT:3, SAB:1 },
  size: "normal", category: "Morto-Vivo",
  location: ["Cemitério", "Dungeon", "Ruínas"],
  hp: 30, physDefense: 2, magDefense: 5, dodge: 10,
  actions: 2, damage: "1d4 (ossos) ou Magia",
  behavior: "Mantém distância e lança magias. A magia que usa depende do que o mago original sabia — o necromante que o criou gravou uma magia residual no esqueleto.",
  abilities: [
    { name: "Magia Residual", desc: "1 Ação de Magia (2x/combate): lança 1 magia gravada no esqueleto. O Mestre escolhe ou rola: 1-2 = Raio de Gelo (1d8+INT, alvo Lento), 3-4 = Projétil Mágico (1d6 automático, sem rolagem de acerto), 5-6 = Explosão Arcana menor (1d6 em raio 1 hex, AGI normal para metade)." },
    { name: "Fragilidade dos Ossos do Mago", desc: "O esqueleto de um mago tem ossos mais finos. Dano contundente: +1d4 extra. Mas Def.Mágica 5 — as magias ainda residem nos ossos e protegem de encantamentos." }
  ],
  hex: { layout: "Fundo de sala, atrás de esqueletos guerreiros", hint: "Introdução ao 'matar o mago primeiro'. A Magia Residual é imprevisível — o Mestre pode usar isso para surpreender jogadores experientes que pensam que sabem o que vem." },
  spells: ["Magia Residual (2x/combate — variável)"],
  loot: [{ item: "Osso Arcano Imbuído (componente de magia)", chance: 50, qty: "1" }, { item: "Fragmento de Grimório (1 magia de nível 1 danificada)", chance: 25, qty: "1" }] },

{ id: "gnomo-ladrão-novato",
  name: "Gnomo Ladrão",
  difficulty: 1,
  attrs: { FOR:0, DEX:3, AGI:2, INT:2, SAB:1 },
  size: "normal", category: "Humanoide",
  location: ["Cidade"],
  hp: 25, physDefense: 2, magDefense: 1, dodge: 13,
  actions: 2, damage: "1d4+DEX (punhal)",
  behavior: "Não quer combater — quer fugir com o que roubou. Só luta se encurralado. Preferência absoluta por Furtividade e fuga.",
  abilities: [
    { name: "Dedos Ágeis", desc: "Durante combate, se adjacente a inimigo distraído (atacando outro): pode tentar furtar 1 item do inventário do alvo como Ação Livre (DEX vs. Percepção do alvo). Se bem-sucedido: tem o item." },
    { name: "Sumir na Multidão", desc: "Em ambiente urbano ou com 3+ criaturas no campo: pode usar Furtividade automaticamente como Ação Livre uma vez por combate, mesmo sem cobertura (usa o caos como disfarce)." }
  ],
  hex: { layout: "Área urbana ou interior de taverna", hint: "O Gnomo Ladrão pode roubar itens durante o combate — jogadores com itens valiosos na bolsa devem ficar atentos. A mecânica de Dedos Ágeis ensina que estar distraído tem consequências além do dano." },
  spells: [], loot: [{ item: "Itens roubados de outros (1d4 moedas de prata + 1 item pequeno)", chance: 90, qty: "1" }, { item: "Ferramentas de Ladrão (kit básico)", chance: 40, qty: "1" }] },

{ id: "sapo-venenoso-gigante",
  name: "Sapo Venenoso Gigante",
  difficulty: 1,
  attrs: { FOR:2, DEX:0, AGI:1, INT:0, SAB:1 },
  size: "normal", category: "Besta",
  location: ["Caverna", "Floresta", "Pântano"],
  hp: 40, physDefense: 2, magDefense: 0, dodge: 11,
  actions: 2, damage: "1d6+FOR (mordida venenosa)",
  behavior: "Territorial mas lento. Não persegue por mais de 4 hex. Protege sua poça.",
  abilities: [
    { name: "Língua Pegajosa", desc: "1 Ação: dispara língua a 3 hex. Alvo testea FOR (normal) ou é puxado 2 hex em direção ao Sapo e fica Preso por 1 rodada (a língua mantém). O Sapo então morde automaticamente como Ação Livre." },
    { name: "Veneno Paralisante Leve", desc: "Toda mordida: alvo acumula 1 carga de Veneno (máx 2). Com 2 cargas: −1 Ação por rodada por 2 rodadas. Antídoto ou Medicina (normal) remove." }
  ],
  hex: { layout: "Pântano com terreno irregular", hint: "A Língua Pegajosa puxa um personagem para perto e garante mordida automática — um combo que pode pegar desprevenidos. Matar rapidamente evita acúmulo de veneno." },
  spells: [], loot: [{ item: "Glândula de Veneno do Sapo (ingrediente para poção)", chance: 50, qty: "1" }] },

{ id: "zumbi-arrastão",
  name: "Zumbi Arrastão",
  difficulty: 1,
  attrs: { FOR:3, DEX:0, AGI:0, INT:0, SAB:0 },
  size: "normal", category: "Morto-Vivo",
  location: ["Cemitério", "Dungeon", "Planície", "Ruínas"],
  hp: 50, physDefense: 2, magDefense: 0, dodge: 6,
  actions: 1, damage: "1d6+FOR (aperto de zumbi)",
  behavior: "Avança em linha reta. Nunca desvia. Lento mas persistente.",
  abilities: [
    { name: "Agarrar e Segurar", desc: "Ao acertar: além do dano, o alvo testea FOR (normal) ou fica Agarrado (pode agir mas não se mover). Enquanto Agarrado: o Zumbi causa 1d4 de esmagamento automático por rodada sem custo de Ação. Escapar: FOR (normal) gastando 1 Ação." },
    { name: "Resistência dos Mortos", desc: "Imune a veneno, medo, sangramento e condições mentais. Dano cortante: −1 por dado (partes se separam mas não param). Fogo e dano sagrado: normais. Contundente: +1 por dado (esmaga estrutura óssea)." }
  ],
  hex: { layout: "Corredor estreito ou dungeon", hint: "O Agarrar em corredor estreito pode bloquear completamente o avanço — um Zumbi Arrastão numa porta é um problema sério para o grupo inteiro. Empurrar ou puxar para espaço aberto e rodeá-lo resolve." },
  spells: [], loot: [{ item: "Osso de Zumbi (material alquímico básico)", chance: 20, qty: "1" }] },

{ id: "pixie-travessa",
  name: "Pixie Travessa",
  difficulty: 1,
  attrs: { FOR:0, DEX:4, AGI:4, INT:2, SAB:1 },
  size: "normal", category: "Fada",
  location: ["Floresta"],
  hp: 20, physDefense: 2, magDefense: 6, dodge: 13,
  actions: 2, damage: "1d4+DEX (agulha mágica) — alcance 3 hex",
  behavior: "Não é maliciosa — é travessa. Ataca quem entra em seu território mas sem intenção de matar. Acha o combate divertido. Para se o grupo mostrar humor ou fizer algo criativo.",
  abilities: [
    { name: "Pó de Fada", desc: "1 Ação (3/combate): joga pó em alvo a 3 hex. Efeito aleatório (d6): 1-2 = Sonolento (−1 Ação por 2 rodadas), 3-4 = Encolhido (−2 Def.Física, +2 Esquiva por 2 rodadas), 5-6 = Dança Involuntária (gasta 1 Ação dançando por 1 rodada — mas não sofre dano enquanto dança)." },
    { name: "Invisibilidade de Fada", desc: "Como Ação Livre: fica invisível até atacar novamente. Não quebra ao se mover. Percepção (difícil) para localizar." }
  ],
  hex: { layout: "Floresta com vegetação densa", hint: "Efeitos aleatórios do Pó criam situações inesperadas e divertidas. A invisibilidade constante frustra jogadores que tentam só acertar — pensar em área ou esperar ela atacar para revelar posição." },
  spells: [], loot: [{ item: "Pó de Fada (3 doses — efeito aleatório)", chance: 60, qty: "1" }, { item: "Asa de Pixie (talismã — +1d4 em Acrobacia)", chance: 30, qty: "1" }] },



/* ── Sem grupo ───────────────────────────────────────────────── */

{ id: "elemental-terra-menor",
  name: "Elemental de Terra Menor",
  difficulty: 2,
  attrs: { FOR:4, DEX:0, AGI:0, INT:0, SAB:1 },
  size: "grande", category: "Elemental",
  location: ["Caverna", "Dungeon", "Ruínas"],
  hp: 90, physDefense: 7, magDefense: 1, dodge: 7,
  actions: 2, damage: "1d10+FOR (punho de pedra)",
  behavior: "Guardião de local específico — não persegue além de raio 5 hex do ponto que guarda. Lento mas devastador em melee.",
  abilities: [
    { name: "Pele de Pedra", desc: "Resistência a dano físico não-mágico (−2 por dado). Imune a veneno e condições mentais. Vulnerável a dano elétrico: +1d6 por dado (a corrente atravessa a pedra). Vulnerável a água em quantidade (balde d'água, magia aquática): perde 2 Def.Física por turno de exposição." },
    { name: "Terremoto Local", desc: "1 Ação (1x/combate): bate no chão com ambos os punhos. Todos em raio 3 hex testam AGI (normal) ou caem Derrubados e perdem 1 Ação no próximo turno. Não afeta criaturas voadoras." },
    { name: "Soterrar", desc: "Ao acertar: 30% de chance (d10 ≤ 3) de soterrar o alvo sob pedras — além do dano, alvo fica Preso (FOR difícil para escapar, 2 Ações). Em caverna: o teto pode rachar." }
  ],
  hex: { layout: "Caverna ou dungeon com pedra no chão", hint: "O Terremoto Derruba múltiplos alvos — grupo compacto é ideal para ele. Elétrico é a fraqueza menos óbvia mas mais eficiente. Manter distância evita o Soterrar mas expõe ao Terremoto." },
  spells: [], loot: [{ item: "Núcleo de Terra (material para encantamentos de pedra)", chance: 50, qty: "1" }, { item: "Fragmento de Pedra Arcana (gema rústica — 5 prata)", chance: 60, qty: "1d3" }] },

{ id: "vampiro-bat-menor",
  name: "Vampiro Jovem",
  difficulty: 2,
  attrs: { FOR:2, DEX:3, AGI:3, INT:3, SAB:2 },
  size: "normal", category: "Morto-Vivo",
  location: ["Caverna", "Cemitério", "Cidade", "Planície"],
  hp: 75, physDefense: 4, magDefense: 4, dodge: 12,
  actions: 2, damage: "1d8+DEX (mordida drenante)",
  behavior: "Calculado e frio. Testa o grupo antes de engajar plenamente. Foge para sombra ao receber dano sagrado. Tem orgulho — se humilhado, ataca com raiva (comportamento previsível).",
  abilities: [
    { name: "Drenar Vida", desc: "Ao acertar mordida: cura HP igual a 50% do dano causado. Contra alvo Agarrado: cura 100% do dano. Este efeito não funciona contra mortos-vivos ou construtos." },
    { name: "Forma de Névoa", desc: "Reação ao receber dano letal (que levaria a 0 HP): em vez de morrer, transforma-se em névoa e escapa para um hex de sombra em raio 6. Volta com 5 HP no turno seguinte. Só funciona 1x por combate e não funciona contra dano sagrado." },
    { name: "Hipnose do Olhar", desc: "1 Ação de Magia (1x/combate): olha fixamente para um alvo a até 3 hex. Alvo testea Força de Vontade (difícil). Falha: perde sua próxima Ação (fica paralisado olhando). Luz intensa (tocha adjacente ou magia): torna o Hipnose automático a falhar." }
  ],
  hex: { layout: "Cripta escura com sombras", hint: "Forma de Névoa: o grupo precisa de dano sagrado preparado para o golpe final — caso contrário ele escapa com 5 HP sempre. Hipnose paralisa por 1 Ação — usar em quem tem mais Ações por turno é a jogada do Vampiro." },
  spells: [], loot: [{ item: "Capa de Vampiro Jovem (acessório — +1 SAB à noite)", chance: 40, qty: "1" }, { item: "Dente de Vampiro (ingrediente — poção de drenar vida)", chance: 60, qty: "1" }] },

{ id: "harpia-cantora",
  name: "Harpia Cantora",
  difficulty: 2,
  attrs: { FOR:2, DEX:2, AGI:3, INT:1, SAB:3 },
  size: "normal", category: "Humanoide Alado",
  location: ["Floresta", "Montanha", "Pântano", "Ruínas"],
  hp: 70, physDefense: 4, magDefense: 3, dodge: 12,
  actions: 2, damage: "1d6+DEX (garras) ou Canto",
  behavior: "Prefere atrair vítimas antes de atacar. Em combate: mantém altitude, usa o Canto e desce para atacar quem estiver encantado.",
  abilities: [
    { name: "Canto Encantador", desc: "1 Ação de Magia (1x/2 rodadas): todos os inimigos em raio 6 hex testam Força de Vontade (normal). Falha: ficam Encantados por 2 rodadas — perdem 1 Ação por rodada enquanto caminham lentamente em direção à Harpia (o canto compele). Dano interrompe o encanto." },
    { name: "Mergulho de Ataque", desc: "Ao atacar de altitude: +1d6 de dano e o alvo testea FOR (normal) ou é Derrubado. Após o mergulho: a Harpia volta para altitude como Ação Livre." }
  ],
  hex: { layout: "Área aberta com altitude disponível", hint: "O Canto encanta o grupo inteiro mas qualquer dano quebra o efeito — um aliado que resistiu pode atacar a Harpia para libertar os encantados. Fechar com ela em melee força-a a usar garras em vez do Canto." },
  spells: [], loot: [{ item: "Pena de Harpia (ingrediente para poção de Encanto)", chance: 60, qty: "1d3" }] },

{ id: "mimic-menor",
  name: "Mímico de Baú",
  difficulty: 2,
  attrs: { FOR:3, DEX:2, AGI:0, INT:2, SAB:2 },
  size: "normal", category: "Aberração",
  location: ["Dungeon", "Ruínas"],
  hp: 80, physDefense: 4, magDefense: 3, dodge: 8,
  actions: 2, damage: "1d8+FOR (mordida adesiva)",
  behavior: "Imóvel até ser aberto. Então ataca quem tentou abrir. Foca quem está mais próximo.",
  abilities: [
    { name: "Disfarce Perfeito", desc: "Passivo: parece um baú de tesouro normal. Investigação (difícil) para detectar antes de abrir. Percepção (normal) para notar que não tem dobradiças de baú normal. Ao ser aberto: combate começa automaticamente — o abridor está adjacente e é o primeiro alvo." },
    { name: "Cola Adesiva", desc: "Ao acertar: o alvo fica Preso (grudado no Mímico, FOR difícil para escapar, 1 Ação). Enquanto Preso: o Mímico morde automaticamente por 1d6 por rodada sem custo. Aliados podem ajudar (FOR normal, 1 Ação). Fogo ou óleo derrete a cola (termina o efeito)." },
    { name: "Psevdo-Tesouro", desc: "Se o abridor rolar Percepção (normal) ANTES de abrir: nota que o 'baú' está levemente quente. Se rolar Arcanismo (normal): reconhece a aura de criatura viva." }
  ],
  hex: { layout: "Sala de dungeon com outros baús reais", hint: "O humor do Mímico é parte da mecânica — jogadores que abrem baús sem checar merecem a surpresa. Introduz o hábito de 'Investigar antes de abrir'. A Cola Adesiva em corredor estreito pode prender um personagem sem que os aliados consigam ajudar." },
  spells: [], loot: [{ item: "Cristal de Mímico (material raro — imitação de qualquer gema)", chance: 50, qty: "1" }, { item: "Baú de Tesouro Real (o que o Mímico comia — 1d20 prata + 1 item menor)", chance: 70, qty: "1" }] },

{ id: "soldado-desertado-trauma",
  name: "Soldado Desertado",
  difficulty: 2,
  attrs: { FOR:3, DEX:2, AGI:1, INT:2, SAB:1 },
  size: "normal", category: "Humanoide",
  location: ["Cidade", "Estrada", "Floresta", "Ruínas"],
  hp: 70, physDefense: 5, magDefense: 2, dodge: 12,
  actions: 2, damage: "1d8+1d4+FOR (espada de combate)",
  behavior: "Traumatizado — ataca primeiro sem perguntar. Se o grupo não atacar de volta por 1 rodada: Percepção (normal) do grupo nota que ele está tremendo, não ameaçando. Pode ser abordado (Persuasão difícil — ele está com medo, não é malicioso).",
  abilities: [
    { name: "Treinamento de Soldado", desc: "Passivo: Formação básica — +1 na Chance de Defesa quando adjacente a 1 aliado. Disciplina: imune a Medo. Mas o trauma interfere: ao falhar um ataque, tem 20% de chance (d10 ≤ 2) de ficar paralisado por 1 rodada (flashback)." },
    { name: "Rendição", desc: "Ao cair abaixo de 30% HP: para de atacar e levanta as mãos. Se o grupo não atacar: pode ser conversado (Persuasão normal após parar). Pode se tornar informante ou aliado temporário. Tem informações sobre quem ele servia." }
  ],
  hex: { layout: "Estrada ou ruínas", hint: "Monstro que pode ser resolvido sem combate. O flashback em 20% é imprevisível — pode salvar o grupo por sorte. A Rendição ensina que nem todo confronto precisa terminar em morte." },
  spells: [], loot: [{ item: "Carta ao Familiar (item de missão — localização de quem ele servia)", chance: 80, qty: "1" }, { item: "Moedas (2d6 prata)", chance: 60, qty: "1" }] },

{ id: "lagarto-venenoso-gigante",
  name: "Lagarto Venenoso Gigante",
  difficulty: 2,
  attrs: { FOR:3, DEX:1, AGI:1, INT:0, SAB:2 },
  size: "grande", category: "Besta",
  location: ["Deserto", "Floresta", "Pântano", "Ruínas"],
  hp: 85, physDefense: 5, magDefense: 0, dodge: 11,
  actions: 2, damage: "1d8+1d4+FOR (mordida venenosa)",
  behavior: "Espera imóvel (camuflado) até a presa estar a 2 hex. Então ataca sem aviso. Após a emboscada: luta até a morte se a presa estiver envenenada.",
  abilities: [
    { name: "Camuflagem", desc: "Passivo: em terreno natural (areia, pedra, vegetação seca), o Lagarto fica invisível a criaturas que não estejam a 3 hex ou menos. Percepção (difícil) para detectar antes de estar no raio de 3 hex." },
    { name: "Veneno de Paralisação", desc: "Toda mordida injeta veneno. SAB (normal) para resistir. Falha: Paralisado por 2 rodadas (imóvel, pode agir mas não se mover). O Lagarto prefere alvos Paralisados — ganha +1d8 de dano contra eles." },
    { name: "Cauda de Varredura", desc: "Reação ao ser atacado em melee: cauda varre o hex do atacante. Atacante testea AGI (normal) ou cai Derrubado (1d4 de impacto + Derrubado)." }
  ],
  hex: { layout: "Terreno natural aberto", hint: "A Camuflagem é a mecânica principal — o grupo pode ser emboscado sem saber. Percepção preventiva antes de cruzar área suspeita. Paralisação + bônus de dano contra paralisado cria pressão para curar rápido." },
  spells: [], loot: [{ item: "Glândula de Veneno de Paralisação (ingrediente raro)", chance: 60, qty: "1" }, { item: "Escama de Lagarto Gigante (material — armadura de deserto)", chance: 40, qty: "1d3" }] },

{ id: "banshee-menor",
  name: "Banshee Menor",
  difficulty: 2,
  attrs: { FOR:0, DEX:2, AGI:2, INT:3, SAB:4 },
  size: "normal", category: "Morto-Vivo",
  location: ["Cemitério", "Cidade", "Floresta", "Planície", "Ruínas"],
  hp: 65, physDefense: 4, magDefense: 7, dodge: 12,
  actions: 2, damage: "1d6+SAB (toque fantasmal — ignora Def.Física)",
  behavior: "Grita antes de atacar. Mantém distância e usa o Lamento. Se o grupo usar magia de bênção ou luz sagrada: recua 3 hex automaticamente (instinto de auto-preservação).",
  abilities: [
    { name: "Lamento da Banshee", desc: "1 Ação (1x/2 rodadas): grito sobrenatural em raio 4 hex. Todos testam Força de Vontade (difícil). Falha: Aterrorizado por 2 rodadas (−1d6 em todos os testes e não pode se aproximar da Banshee voluntariamente). Criaturas que já resistiram ao Lamento neste combate: +1d4 à rolagem de resistência nas tentativas seguintes." },
    { name: "Forma Imaterial", desc: "Passivo: imune a armas não-mágicas. Vulnerável a prata (mesmo efeito de arma mágica) e a dano sagrado (+1d6 por dado). Em luz intensa: perde Forma Imaterial por 3 rodadas." }
  ],
  hex: { layout: "Área mal-iluminada", hint: "O Lamento em área pode Aterrorizar o grupo inteiro — evitar ficar em raio 4 de forma compacta é crucial. Prata é a fraqueza acessível para quem não tem armas mágicas. Luz intensa a torna vulnerável a físico." },
  spells: [], loot: [{ item: "Essência de Banshee (componente — Veneno Psíquico 1 dose)", chance: 40, qty: "1" }] },

{ id: "homem-peixe-da-costa",
  name: "Homem-Peixe das Profundezas",
  difficulty: 2,
  attrs: { FOR:3, DEX:2, AGI:2, INT:1, SAB:2 },
  size: "normal", category: "Aberração Aquática",
  location: ["Pântano", "Templo"],
  hp: 75, physDefense: 4, magDefense: 3, dodge: 12,
  actions: 2, damage: "1d8+1d4+FOR (tridentes e garras)",
  behavior: "Em grupo — nunca solo. Fora d'água: −1 Ação por turno (fica mais lento). Na água: +1 Ação e +2 Movimento.",
  abilities: [
    { name: "Anfibiose Tática", desc: "Passivo: em hex de água ou lama: +1 Ação de Combate e +2 Movimento. Em terreno seco por mais de 3 rodadas seguidas: −1 Ação (começa a desidratar). Jogam adversários na água quando possível." },
    { name: "Grito de Guerra Aquático", desc: "1 Ação (1x/combate): grito subsônico. Todos em raio 4 hex testam Resistência (normal). Falha: Enjoo por 2 rodadas (−1d4 em todos os testes — a frequência do grito desequilibra o ouvido interno)." },
    { name: "Triângulo de Ataque", desc: "Se 3 Homens-Peixe estiverem adjacentes ao mesmo alvo: o alvo não pode esquivar (a formação triangular não deixa espaço para recuar). Cada um causa dano normal mas a perda de esquiva é significativa." }
  ],
  hex: { layout: "Costa ou pântano com água acessível", hint: "Puxar o grupo para a água é a estratégia dos Homens-Peixe — jamais entrar na água voluntariamente. O Triângulo de Ataque (3 adjacentes, sem esquiva) é a sinergia principal — quebrar o cerco de 3 é prioridade." },
  spells: [], loot: [{ item: "Escama de Homem-Peixe (material — armadura aquática leve)", chance: 50, qty: "1d2" }, { item: "Tridente Ritual (arma funcional)", chance: 30, qty: "1" }] },

{ id: "druida-corrompido-menor",
  name: "Druida Corrompido do Bosque",
  difficulty: 2,
  attrs: { FOR:1, DEX:1, AGI:1, INT:2, SAB:5 },
  size: "normal", category: "Humanoide Corrompido",
  location: ["Floresta"],
  hp: 70, physDefense: 4, magDefense: 6, dodge: 12,
  actions: 2, damage: "1d6+SAB (cajado de galhos retorcidos) ou Magia",
  behavior: "Protege seu território. Não distingue mais entre inimigo e aliado — considera TUDO uma ameaça ao bosque. Um Druida verdadeiro do grupo pode tentar comunicação (SAB difícil).",
  abilities: [
    { name: "Controle da Natureza Corrompida", desc: "1 Ação de Magia (1x/2 rodadas): manipula o terreno em área 3x3 hex. Escolhe: Raízes (Preso, FOR normal), Espinhos (1d4 por rodada a quem estiver), ou Névoa (visibilidade −4 hex). O bosque obedece porque ele é parte do bosque — mesmo corrompido." },
    { name: "Forma Animal Parcial", desc: "1 Ação (1x/combate): transforma parcialmente — garras de animal, olhos de fera. Por 3 rodadas: +1d6 em ataques físicos e imune a Medo. A transformação é incompleta (corrompida), então volta com dano ao próprio corpo: perde 1d4 HP ao reverter." },
    { name: "Cura pela Terra", desc: "1 Ação (enquanto em terreno natural): cura 1d8+SAB HP em si mesmo ou aliado tocado. Esta cura funciona com energia corrompida — quem for curado sente náusea por 1 rodada (−1 em testes)." }
  ],
  hex: { layout: "Floresta com vegetação densa controlada por ele", hint: "O Controle da Natureza Corrompida muda o campo toda rodada — o terreno nunca é fixo. Força o grupo a se mover constantemente. Um Druida do grupo pode falar com ele e possivelmente revelar que ele pode ser salvo (Purificação Sagrada nível 3+ pode reverter a corrupção)." },
  spells: ["Controle da Natureza Corrompida", "Cura pela Terra"],
  loot: [{ item: "Cajado do Bosque Corrompido (arma mágica — Raízes 3 usos)", chance: 50, qty: "1" }, { item: "Amuleto Druídico Corrompido (pode ser purificado — vira bênção de natureza)", chance: 40, qty: "1" }] },

{ id: "espectro-da-vingança",
  name: "Espectro da Vingança",
  difficulty: 2,
  attrs: { FOR:0, DEX:3, AGI:3, INT:3, SAB:4 },
  size: "normal", category: "Morto-Vivo",
  location: ["Cemitério", "Cidade", "Dungeon"],
  hp: 70, physDefense: 4, magDefense: 8, dodge: 12,
  actions: 2, damage: "1d8+SAB (toque da vingança — ignora Def.Física)",
  behavior: "Tem um alvo específico — quem matou ou prejudicou em vida. Se o grupo NÃO for esse alvo: testa SAB (normal) do Espectro para perceber. Se perceber: ataca o grupo apenas se interferirem. Resolver o crime pode dissipar o Espectro sem combate.",
  abilities: [
    { name: "Alvo da Vingança", desc: "Passivo: tem 1 alvo predeterminado (o responsável pela morte injusta). Contra esse alvo: todos os ataques são automáticos (sem rolagem de acerto) e causam +1d8 extra. Se o alvo morrer ou for punido de forma que o Espectro considere justa: dissolve-se em paz." },
    { name: "Grilhões do Passado", desc: "1 Ação de Magia (1x/combate): projeta memória da morte em todos em raio 4 hex. Todos testam Força de Vontade (difícil). Falha: veem a morte do Espectro em primeira pessoa — ficam com −1d6 nos ataques por 2 rodadas (o choque emocional paralisa)." },
    { name: "Imaterial Parcial", desc: "Passivo: armas não-mágicas causam metade do dano. Prata e dano sagrado: dano normal. Em local de sua própria morte (hex específico): fica completamente material por 3 rodadas (vulnerável a tudo)." }
  ],
  hex: { layout: "Local específico da morte", hint: "Investigação (normal) antes do combate pode revelar a história do Espectro e como dissipá-lo sem luta. Forçá-lo para o hex de sua morte o torna material temporariamente — janela de dano máximo. O Alvo da Vingança pode criar situações interessantes se um NPC do grupo for o responsável." },
  spells: [], loot: [{ item: "Objeto do Crime (item de missão — prova de quem causou a morte injusta)", chance: 80, qty: "1" }] },



{ id: "zumbi-soldado-tumulo",
  name: "Zumbi Soldado (Horda dos Túmulos Abertos)",
  difficulty: 1,
  attrs: { FOR:2, DEX:1, AGI:1, INT:0, SAB:0 },
  size: "normal", category: "Morto-Vivo",
  location: ["Cemitério", "Dungeon", "Planície"],
  hp: 45, physDefense: 4, magDefense: 0, dodge: 10,
  actions: 2, damage: "1d6+FOR (espada enferrujada)",
  group: "Horda dos Túmulos Abertos",
  groupRole: "Linha de frente — forma linha de batalha como um soldado real faria.",
  groupSynergy: "Se 3+ Zumbis Soldados estiverem em linha adjacente: formam Muralha dos Mortos — qualquer ataque em área que atingir a linha tem −2 de dano por alvo (os corpos absorvem o impacto dos lados).",
  abilities: [
    { name: "Memória Muscular", desc: "Passivo: mesmo sem inteligência, o corpo lembra o treinamento. +1 na Chance de Defesa se adjacente a outro Zumbi Soldado (o reflexo defensivo militar persiste)." },
    { name: "Não Cai Facilmente", desc: "Imune a Derrubado por ataques simples. Contundente (maçã, martelo) pode Derrubá-lo normalmente." }
  ],
  hex: { layout: "Corredor de necrópole", hint: "A Muralha dos Mortos em corredor estreito é extremamente eficiente. Quebrar a linha é prioridade antes de usar área." },
  spells: [], behavior: "Forma linha com outros Soldados. Avança lentamente em formação.", loot: [{ item: "Espada Enferrujada Antiga (sucata — 2 bronze)", chance: 70, qty: "1" }] },

{ id: "esqueleto-arqueiro-tumulo",
  name: "Esqueleto Arqueiro Veterano (Horda dos Túmulos Abertos)",
  difficulty: 1,
  attrs: { FOR:0, DEX:3, AGI:1, INT:0, SAB:0 },
  size: "normal", category: "Morto-Vivo",
  location: ["Cemitério", "Dungeon", "Planície"],
  hp: 30, physDefense: 2, magDefense: 0, dodge: 13,
  actions: 2, damage: "1d8+DEX (flecha — alcance 5 hex)",
  group: "Horda dos Túmulos Abertos",
  groupRole: "Suporte à distância — fica atrás dos Soldados e atira sobre eles.",
  groupSynergy: "Pode atirar sobre aliados da Horda sem penalidade (os mortos-vivos não obstruem a linha de tiro magicamente). +1d4 de dano se o alvo estiver adjacente a um Zumbi Soldado (alvo contido).",
  abilities: [
    { name: "Tiro através da Muralha", desc: "Passivo: ignora cobertura de aliados mortos-vivos ao atirar. A flecha passa entre eles como se os ossos se abrissem para dar passagem." },
    { name: "Chuva de Flechas", desc: "1 Ação (1x/combate): atira 3 flechas no mesmo turno em até 3 alvos diferentes. Cada uma causa 1d6+DEX. Não tem bônus de Tiro através da Muralha neste modo." }
  ],
  hex: { layout: "Atrás da linha de Soldados", hint: "O Arqueiro Veterano é mais perigoso que o Arqueiro comum — atira sobre aliados sem problema. Focar nele requer quebrar a linha de Soldados primeiro ou usar magia de longo alcance." },
  spells: [], behavior: "Fica parado atrás da Muralha dos Mortos. Usa Chuva de Flechas no turno 2.", loot: [{ item: "Flechas Antigas (1d4 unidades, ainda funcionais)", chance: 60, qty: "1d4" }] },

{ id: "zumbi-sacerdote-tumulo",
  name: "Zumbi Sacerdote (Horda dos Túmulos Abertos)",
  difficulty: 2,
  attrs: { FOR:1, DEX:1, AGI:1, INT:1, SAB:3 },
  size: "normal", category: "Morto-Vivo",
  location: ["Cemitério", "Dungeon"],
  hp: 60, physDefense: 4, magDefense: 5, dodge: 12,
  actions: 2, damage: "1d6+SAB (cajado sagrado corrompido) ou Magia",
  group: "Horda dos Túmulos Abertos",
  groupRole: "Suporte mágico — reanima os caídos e amplifica a Horda.",
  groupSynergy: "1x por turno como Ação Livre: reanima 1 Zumbi Soldado ou Esqueleto Arqueiro destruído neste combate com 10 HP (a memória do feitiço de preservação ainda funciona nele). Só funciona enquanto o Sacerdote viver.",
  abilities: [
    { name: "Reanimar da Tumba", desc: "Ação Livre (1x/turno): reanima morto-vivo aliado caído com 10 HP. Isso transforma o combate numa corrida — matar o Sacerdote primeiro ou nunca terminar." },
    { name: "Praga Menor", desc: "1 Ação de Magia: alvo a 4 hex testea Resistência (normal). Falha: Doente por 3 rodadas (−1 FOR temporária por rodada). Medicina (normal) ou Cura Mágica remove." }
  ],
  hex: { layout: "Câmara central da necrópole", hint: "O Sacerdote que reanima é a razão pela qual a Horda nunca diminui de número. Matar o Sacerdote ANTES de qualquer outro é a prioridade absoluta — cada Soldado morto sem o Sacerdote é permanente." },
  spells: ["Reanimar da Tumba", "Praga Menor"],
  behavior: "Fica no fundo. Reanima todo turno. Ataca apenas se ameaçado diretamente.", loot: [{ item: "Amuleto do Sacerdote (item de história — conta o que aconteceu na necrópole)", chance: 100, qty: "1" }, { item: "Cajado Sagrado Corrompido (arma mágica — 2 usos de Praga)", chance: 40, qty: "1" }] },



{ id: "lobo-batedeiro-planicie",
  name: "Lobo Batedeiro (Alcateia dos Lobos da Planície)",
  difficulty: 1,
  attrs: { FOR:1, DEX:2, AGI:3, INT:1, SAB:2 },
  size: "normal", category: "Besta",
  location: ["Estrada", "Floresta", "Planície"],
  hp: 30, physDefense: 2, magDefense: 0, dodge: 13,
  actions: 2, damage: "1d4+DEX (mordida rápida)",
  group: "Alcateia dos Lobos da Planície",
  groupRole: "Explorador — circula o perímetro e identifica o alvo mais fraco.",
  groupSynergy: "O Batedeiro marca o alvo com uivo específico. Todos da Alcateia identificam o alvo marcado — ganham +1 Chance de Acerto contra ele neste combate.",
  abilities: [
    { name: "Marcação de Presa", desc: "1 Ação Livre (1x/combate): uiva para marcar 1 alvo. Todos os aliados da Alcateia no campo ganham +1 Chance de Acerto contra esse alvo." },
    { name: "Velocidade de Batedeiro", desc: "Passivo: Movimento 7 (mais rápido que lobos comuns). Nunca fica adjacente ao grupo voluntariamente — sempre mantém 2+ hex de distância." }
  ],
  hex: { layout: "Planície aberta", hint: "O Batedeiro nunca luta de perto — fica no perímetro marcando alvos. Matar ele requer alcance ou perseguição. A Marcação de Presa coordena toda a Alcateia num alvo." },
  spells: [], behavior: "Circula. Marca o alvo com menos HP ou menos mobilidade. Nunca fecha o combate.", loot: [{ item: "Pele de Lobo da Planície", chance: 50, qty: "1" }] },

{ id: "lobo-corredor-planicie",
  name: "Lobo Corredor (Alcateia dos Lobos da Planície)",
  difficulty: 1,
  attrs: { FOR:2, DEX:1, AGI:2, INT:1, SAB:1 },
  size: "normal", category: "Besta",
  location: ["Estrada", "Floresta", "Planície"],
  hp: 40, physDefense: 3, magDefense: 0, dodge: 13,
  actions: 2, damage: "1d6+FOR (mordida de perseguição)",
  group: "Alcateia dos Lobos da Planície",
  groupRole: "Perseguidor — fatiga o alvo que tenta fugir.",
  groupSynergy: "Se o alvo Marcado pelo Batedeiro tentar se mover mais de 2 hex: o Corredor pode fazer Ataque de Oportunidade automático (sem custo de reação) ao alvo em movimento.",
  abilities: [
    { name: "Perseguição Implacável", desc: "Passivo: ao alvo tentar Fugir (mover mais de 2 hex em direção oposta): o Corredor move junto gratuitamente (sem custo de Ação) e ataca imediatamente. Não funciona se o alvo usar magia de teletransporte." },
    { name: "Desgaste", desc: "Ao acertar 3x o mesmo alvo: o alvo fica Fatigado (−1 em todos os testes por 3 rodadas — o desgaste da perseguição). Cumulativo com outros Corredores: cada Corredor adicional que acerta 3x aplica Fatigado novamente." }
  ],
  hex: { layout: "Planície aberta com espaço para correr", hint: "O Corredor pune fuga — fugir do combate com essa Alcateia é quase impossível sem magia. O grupo que tenta recuar se expõe ao Ataque de Oportunidade automático." },
  spells: [], behavior: "Segue o alvo Marcado. Se o alvo ficar parado: morde. Se tentar fugir: persegue com Ataque de Oportunidade.", loot: [{ item: "Pele de Lobo Corredor (material — botas de movimento +1)", chance: 40, qty: "1" }] },

{ id: "lobo-alfa-planicie",
  name: "Lobo Alfa da Planície (Alcateia dos Lobos da Planície)",
  difficulty: 2,
  attrs: { FOR:3, DEX:2, AGI:2, INT:2, SAB:2 },
  size: "normal", category: "Besta",
  location: ["Floresta", "Planície"],
  hp: 80, physDefense: 4, magDefense: 1, dodge: 12,
  actions: 3, damage: "1d8+1d4+FOR (mordida do Alfa)",
  group: "Alcateia dos Lobos da Planície",
  groupRole: "Finalizador — entra apenas quando o alvo já está Fatigado ou Marcado.",
  groupSynergy: "Ao atacar alvo Fatigado (por Desgaste do Corredor): dano TRIPLICADO (em vez de dobrado de crítico). Ao alvo estar Marcado E Fatigado: dano ×4 no primeiro ataque.",
  abilities: [
    { name: "Faro Apurado", desc: "Passivo: não pode ser surpreendido. Detecta Furtividade automaticamente em raio 5 hex. Percepção (normal) para localizar criaturas invisíveis em raio 3 hex." },
    { name: "Derrubar e Segurar", desc: "Ao acertar: alvo testea FOR (normal) ou cai Derrubado (o Alfa joga o alvo no chão). Se Derrubado: o Alfa morde a garganta — próximo ataque automático causa +1d10 de dano." },
    { name: "Rugido de Dominância", desc: "1 Ação Livre (1x/combate): ruge. Todos os lobos aliados ganham +2 em todas as rolagens por 2 rodadas. Inimigos testam Intimidação (normal) ou ficam com −1 na Chance de Acerto por 1 rodada." }
  ],
  hex: { layout: "Centro do território, entra quando a caçada começa", hint: "O combo completo: Batedeiro Marca → Corredores Fatigam → Alfa ataca alvo Fatigado com ×4 de dano. O grupo que permite esse ciclo completar sofre as consequências. Matar o Batedeiro (impede Marcação) ou o Alfa (desbanda a Alcateia) são as melhores estratégias." },
  spells: [], behavior: "Espera longe até que 1+ Corredores tenham aplicado Fatigado. Então avança para o alvo Fatigado. Se o Batedeiro morrer: o Alfa uiva e recua — reavalia a situação antes de reengajar.", loot: [{ item: "Canino do Alfa da Planície (talismã — +1d4 em Intimidação)", chance: 50, qty: "1" }, { item: "Pele do Alfa (material premium — armadura de couro superior)", chance: 40, qty: "1" }] }


,

  /* ═══════════════════════════════════════════════════════════════
     NOVOS MONSTROS — DIFICULDADE 3
     Mecânicas únicas · Loot diferenciado · Lore de Aether
     ═══════════════════════════════════════════════════════════════ */

  {
    id: "aranha-tumulos-gigantes",
    name: "Aranha dos Túmulos de Gigantes",
    difficulty: 3,
    attrs: { FOR:4, DEX:4, AGI:3, INT:1, SAB:2 },
    size: "grande",
    category: "Besta Amaldiçoada",
    location: ["Dungeon", "Cemitério", "Ruínas"],
    hp: 155,
    physDefense: 6,
    magDefense: 4,
    dodge: 12,
    actions: 3,
    damage: "1d10+1d6 (mordida venenosa) ou 1d12+1d6 (espada nas costas — acesso especial)",
    abilities: [
      { name: "Espada nas Costas",
        desc: "Passivo: a espada cravada funciona como armamento. Qualquer personagem que acertar um ataque melee na aranha com rolagem ≤ 2 no d10 de acerto tem a mão rasgada pela lâmina — sofre 1d6 de dano e −1 na Chance de Acerto até cura. A espada pode ser REMOVIDA: requer 2 Ações adjacente + FOR (difícil). Removida, fica disponível como arma (1d12+FOR, mágica, nível raro)." },
      { name: "Teia Viscosa",
        desc: "1 Ação: cospe teia em cone de 3 hex. Alvos testam AGI (normal) ou ficam Presos por 2 rodadas. A teia é permanente no chão — qualquer criatura que entrar no hex sem testar AGI fica Presa automaticamente." },
      { name: "Veneno do Túmulo",
        desc: "Mordida aplica Veneno do Túmulo: 1d8 por rodada por 3 rodadas. SAB (difícil) para resistir. Antídotos comuns não funcionam — requer Cura Mágica ou Veneno Específico (item especial)." },
      { name: "Sentido de Vibração",
        desc: "Passivo: detecta qualquer criatura em raio 6 hex que toque o chão — invisibilidade e furtividade são inúteis contra ela." }
    ],
    spells: [],
    behavior: "Posiciona-se no centro do túmulo, coberto de teia. Começa com Teia Viscosa para criar obstáculos antes de atacar. Prioriza atacar alvo com a espada nas costas (usando o dano da espada quando flanqueia). Não recua — defende o túmulo até a morte.",
    loot: [
      { item: "A Espada do Gigante Caído (arma rara — 1d12, mágica, já encantada com toxina)", chance: 100, qty: "1" },
      { item: "Glândula de Veneno do Túmulo (material alquímico raro)", chance: 65, qty: "1d2" },
      { item: "Teia Endurecida (material — receita de armadura rara)", chance: 40, qty: "1d3" },
      { item: "Anel esquecido de um Gigante (acessório — FOR+1, tamanho reduzido magicamente)", chance: 15, qty: "1" }
    ]
  },

  {
    id: "cavaleiro-sem-cabeca",
    name: "Cavaleiro Sem Cabeça",
    difficulty: 3,
    attrs: { FOR:4, DEX:3, AGI:2, INT:0, SAB:0 },
    size: "medio",
    category: "Morto-vivo",
    location: ["Cemitério", "Ruínas", "Dungeon"],
    hp: 145,
    physDefense: 9,
    magDefense: 3,
    dodge: 9,
    actions: 2,
    damage: "1d12+1d8 (espada de duas mãos fantasmal)",
    abilities: [
      { name: "Imune a Críticos",
        desc: "Passivo: não tem cabeça — críticos de ataque causam dano normal (sem o bônus de 50%). Ataques à cabeça simplesmente passam pelo espaço vazio." },
      { name: "Maldição do Acéfalo",
        desc: "Ao acertar qualquer ataque: o alvo deve testar SAB (normal) ou fica Confuso por 1 rodada (a presença perturbadora da criatura sem cabeça desoriente a mente)." },
      { name: "Cabeça Fantasmal",
        desc: "1 Ação (2x/combate): arremessa a cabeça fantasmal como projétil — alcance 8 hex, 1d10 de dano sagrado invertido (ignora Def. Física). A cabeça retorna automaticamente no turno seguinte." },
      { name: "Último Ato",
        desc: "Ao cair a 0 HP: o cavaleiro realiza 1 ataque final gratuito no alvo mais próximo antes de desaparecer. Não pode ser esquivado." }
    ],
    spells: [],
    behavior: "Patrulha em silêncio absoluto. Não reage a sons — reage a luz e movimento. Foca no alvo de maior ameaça (maior dano causado). Usa Cabeça Fantasmal em alvos que tentam manter distância.",
    loot: [
      { item: "Armadura do Cavaleiro (armadura rara — Def.Física 9, penalidade −1 Movimento, maldita: pesadelos ao dormir)", chance: 70, qty: "1" },
      { item: "Espada Fantasmal (arma rara — 1d12, causa Confusão em críticos)", chance: 50, qty: "1" },
      { item: "Colar de Identificação (acessório — revela o nome do cavaleiro, quest item)", chance: 100, qty: "1" },
      { item: "Essência de Morto-vivo (material — usado em necromancia e alquimia)", chance: 55, qty: "1d2" }
    ]
  },

  {
    id: "golem-de-espelhos",
    name: "Golem de Espelhos",
    difficulty: 3,
    attrs: { FOR:3, DEX:4, AGI:2, INT:2, SAB:3 },
    size: "medio",
    category: "Construto",
    location: ["Dungeon", "Ruínas", "Templo"],
    hp: 140,
    physDefense: 7,
    magDefense: 10,
    dodge: 10,
    actions: 2,
    damage: "1d8+1d6 (fragmentos de espelho) + reflexo (ver habilidade)",
    abilities: [
      { name: "Reflexo Mágico",
        desc: "Passivo: qualquer magia de dano direcionada ao Golem tem 40% de chance (d10 ≤ 4) de ser refletida de volta ao conjurador com 75% do dano original. Magias de área não são refletidas." },
      { name: "Fragmentos Cortantes",
        desc: "Passivo: qualquer ataque melee que acerte o Golem causa 1d4 de dano reflexivo ao atacante (cacos de espelho voam). Escudo bloqueia esse dano." },
      { name: "Ilusão de Espelho",
        desc: "1 Ação (1x/combate): cria 2 cópias ilusórias idênticas. O alvo deve acertar o Golem real (33% de chance se houver 2 cópias, 50% com 1). Cópias são destruídas com 1 toque." },
      { name: "Explosão de Reflexos",
        desc: "Ao atingir 50% de HP: estoura fragmentos em todos os hex adjacentes — todos os personagens adjacentes sofrem 2d6 de dano cortante (AGI normal para metade)." }
    ],
    spells: [],
    behavior: "Fica imóvel até ser atacado. Após o primeiro ataque, avança devagar. Prioriza ficar adjacente a conjuradores (para o reflexo mágico ser mais letal). Usa Ilusão de Espelho quando estiver Derrubado ou Preso.",
    loot: [
      { item: "Fragmento do Núcleo de Espelho (material lendário — para encantamentos de reflexo)", chance: 75, qty: "1" },
      { item: "Espelho Intacto do Golem (item raro — mostra reflexo de 1 segundo no futuro, 1x/dia)", chance: 30, qty: "1" },
      { item: "Pó de Espelho Arcano (material — 1d4 doses, pode criar superfície reflexiva temporária)", chance: 60, qty: "1d4" },
      { item: "Lente de Foco Mágico (acessório raro — +1 Slot de Magia, +1d4 dano em magias direcionadas)", chance: 25, qty: "1" }
    ]
  },

  {
    id: "executora-sem-nome",
    name: "A Executora Sem Nome",
    difficulty: 3,
    attrs: { FOR:3, DEX:5, AGI:4, INT:2, SAB:3 },
    size: "medio",
    category: "Humanoide Corrompido",
    location: ["Dungeon", "Cidade", "Ruínas"],
    hp: 130,
    physDefense: 5,
    magDefense: 6,
    dodge: 14,
    actions: 3,
    damage: "1d8+1d6 (adaga geminada — ataca duas vezes por Ação)",
    abilities: [
      { name: "Adagas Geminadas",
        desc: "Passivo: cada Ação de ataque realiza 2 ataques com rolagens separadas. Com 3 Ações por turno, pode realizar 6 rolagens de ataque no mesmo turno." },
      { name: "Sombra de Lâmina",
        desc: "Reação (1x/turno): ao ser atacada e errar a esquiva, pode imediatamente contra-atacar com 1 adaga antes de receber o dano (1d8+DEX, sem custo de Ação)." },
      { name: "Marca do Alvo",
        desc: "Ação Livre (1x/combate): designa 1 alvo como Marcado. Todos os ataques contra o alvo marcado têm +2 na Chance de Crítico e ignoram metade da Def. Física. A marca dura até o alvo morrer ou o combate terminar." },
      { name: "Desaparecimento",
        desc: "Ao atingir 30% de HP: gasta 1 turno inteiro para desaparecer na sombra mais próxima. Reaparece no turno seguinte em qualquer hex de sombra em raio 10 hex com HP restaurado em 1d20." }
    ],
    spells: [],
    behavior: "Avalia o grupo por 1 turno sem atacar. Usa Marca do Alvo no conjurador ou no personagem com maior dano. Foca completamente no alvo marcado até morrer. Usa Desaparecimento como último recurso.",
    loot: [
      { item: "Adagas Geminadas (par de armas raras — 1d8 cada, +1 Chance de Crítico)", chance: 55, qty: "1 par" },
      { item: "Contrato sem nome (quest item — revela quem a contratou)", chance: 100, qty: "1" },
      { item: "Manto das Sombras (acessório raro — Furtividade automática em áreas escuras)", chance: 40, qty: "1" },
      { item: "Veneno de Paralisação (consumível raro — 2 doses, paralisa alvo por 1 turno)", chance: 65, qty: "1d2" }
    ]
  },

  {
    id: "sacerdote-corrompido-jurgmund",
    name: "Sacerdote Corrompido de Jurgmund",
    difficulty: 3,
    attrs: { FOR:1, DEX:2, AGI:1, INT:4, SAB:5 },
    size: "medio",
    category: "Humanoide / Morto-vivo",
    location: ["Templo", "Dungeon", "Pântano"],
    hp: 125,
    physDefense: 4,
    magDefense: 10,
    dodge: 9,
    actions: 2,
    damage: "1d6+INT (maldição canalizada — ignora Def. Física)",
    abilities: [
      { name: "Bênção Invertida",
        desc: "1 Ação de Magia (3x/combate): lança bênção corrompida em aliado do grupo — parece uma cura (o alvo sente calor) mas acumula 1 carga de Maldição. Com 3 cargas: o alvo sofre 2d10 de dano e fica Abalado por 2 rodadas. O sacerdote pode detonar todas as cargas como Ação Livre." },
      { name: "Cura Parasita",
        desc: "Passivo: cada 10 HP de dano que o sacerdote sofrer cura automaticamente 5 HP de um aliado aleatório visível. Aliados morrem de 'doença' que alimenta o sacerdote." },
      { name: "Serpente de Julgamento",
        desc: "1 Ação de Magia (2x/combate): invoca serpente fantasmal que persegue 1 alvo por 3 rodadas (move 6 hex/turno, Dif.2). Se tocar o alvo: 2d8 de veneno sagrado + Envenenado por 2 rodadas. A serpente é destruída por 1 golpe de dano sagrado." },
      { name: "Escudo de Fé Corrompida",
        desc: "Passivo: a primeira vez que atingir 0 HP em um combate, se levanta no turno seguinte com 30 HP (1x/combate). Ao se levantar, cura 1d6 de todos os aliados corrompidos visíveis." }
    ],
    spells: [],
    behavior: "Fica na retaguarda. Começa lançando Bênção Invertida em personagens que parecem aliados (ou em si mesmo para confundir). Usa Serpente de Julgamento no personagem com maior Defesa. Explode as cargas de maldição quando 2+ cargas acumularam.",
    loot: [
      { item: "Símbolo de Jurgmund Corrompido (acessório raro — SAB+1, mas sonhos perturbadores)", chance: 70, qty: "1" },
      { item: "Tomo da Bênção Invertida (livro — ensina Bênção Invertida como magia de nível 3)", chance: 35, qty: "1" },
      { item: "Escamas de Serpente de Julgmund (material raro — 1d6 doses)", chance: 60, qty: "1d6" },
      { item: "Coração Ainda Batendo (material lendário — componente de ritual de ressurreição)", chance: 20, qty: "1" }
    ]
  },

  {
    id: "troca-de-pele",
    name: "Trocador de Pele",
    difficulty: 3,
    attrs: { FOR:2, DEX:4, AGI:4, INT:3, SAB:2 },
    size: "medio",
    category: "Metamorfo / Aberração",
    location: ["Floresta", "Cidade", "Ruínas"],
    hp: 135,
    physDefense: 5,
    magDefense: 5,
    dodge: 13,
    actions: 2,
    damage: "1d10+1d6 (garra oculta) ou como forma copiada",
    abilities: [
      { name: "Forma Copiada",
        desc: "O Trocador começa o combate na forma de 1 dos personagens jogadores (aparência perfeita). É impossível distingui-lo sem magia de detecção ou o Trocador atacar. Quando ataca pela primeira vez, revela a forma verdadeira (aberrante, com membros extras)." },
      { name: "Membros Extras",
        desc: "Forma verdadeira: 6 membros extras. Ataque que acerta pode agarrar (FOR difícil para escapar gastando 1 Ação). Alvos agarrados sofrem 1d6 de dano no início de cada turno do Trocador." },
      { name: "Mimetismo de Voz",
        desc: "Passivo (forma copiada): pode imitar a voz e comportamento do alvo. Aliados do personagem copiado que interagirem com ele sem suspeitar podem revelar informações. Detectar requer SAB (difícil)." },
      { name: "Troca Rápida",
        desc: "1 Ação (1x/combate): ao receber dano que reduziria abaixo de 50% HP, pode imediatamente assumir a forma de outro personagem presente — o dano é absorvido pela transição. Aliados devem verificar qual é o real." }
    ],
    spells: [],
    behavior: "Infiltra o grupo como um dos personagens antes do combate, fingindo estar perdido ou separado. Fica perto do alvo mais valioso. Quando atacado ou quando acumular informações suficientes, revela a forma verdadeira e foca no mesmo alvo.",
    loot: [
      { item: "Glândula de Mimetismo (material raro — ingrediente de poção de disfarce perfeito)", chance: 75, qty: "1" },
      { item: "Fragmento de Memória (item raro — contém uma memória roubada de vítima anterior)", chance: 55, qty: "1d2" },
      { item: "Pele Adaptável (material — tecido que muda de cor ao toque, uso em armadura furtiva)", chance: 50, qty: "1" },
      { item: "Anel de Verdade (acessório lendário — desfaz ilusões e disfarces em raio 2 hex)", chance: 15, qty: "1" }
    ]
  },

  {
    id: "guardiao-correntes",
    name: "Guardião das Correntes",
    difficulty: 3,
    attrs: { FOR:5, DEX:1, AGI:1, INT:1, SAB:2 },
    size: "grande",
    category: "Construto / Morto-vivo",
    location: ["Dungeon", "Templo", "Cemitério"],
    hp: 170,
    physDefense: 10,
    magDefense: 4,
    dodge: 7,
    actions: 2,
    damage: "1d12+1d8 (corrente girante — alcance 3 hex)",
    abilities: [
      { name: "Alcance de Corrente",
        desc: "Passivo: os ataques têm alcance de 3 hex (correntes com 4 metros). Personagens que tentarem passar além de 3 hex do Guardião em linha reta sofrem ataque de oportunidade automático." },
      { name: "Agrilhoamento",
        desc: "Ao acertar: o alvo deve testar FOR (difícil) ou fica Acorrentado — Imóvel e com −2 Ações até escapar (FOR normal, 1 Ação). Máximo de 2 alvos acorrentados simultaneamente." },
      { name: "Redoma de Ferro",
        desc: "1 Ação (1x/combate): as correntes formam uma redoma esférica ao redor do Guardião em raio 2 hex. Por 2 rodadas: ninguém pode entrar ou sair dessa área. Personagens dentro ficam presos junto com ele." },
      { name: "Correntes Irrompíveis",
        desc: "Passivo: as correntes do Guardião são parte de seu corpo — não podem ser cortadas por armas comuns. Magias de fogo causam +50% de dano (o calor enfraquece o metal)." }
    ],
    spells: [],
    behavior: "Protege uma passagem, câmara ou artefato. Nunca persegue além de 6 hex do objeto guardado. Começa com Redoma de Ferro se o grupo tentar passar em massa. Prioriza Acorrentar personagens de suporte (mago, clérigo).",
    loot: [
      { item: "Corrente do Guardião (arma rara — 1d10 alcance 3 hex, pode agarrar com acerto crítico)", chance: 60, qty: "1" },
      { item: "Chave da Passagem (quest item — abre o que o Guardião protegia)", chance: 100, qty: "1" },
      { item: "Núcleo de Animação (material lendário — pode ser usado para animar construto)", chance: 25, qty: "1" },
      { item: "Elos de Ferro Antigo (material — 2d6 elos, mais resistentes que aço normal)", chance: 70, qty: "2d6" }
    ]
  },

  {
    id: "cacador-de-almas-corvino",
    name: "Caçador de Almas Corvino",
    difficulty: 3,
    attrs: { FOR:2, DEX:5, AGI:4, INT:3, SAB:4 },
    size: "medio",
    category: "Morto-vivo / Besta",
    location: ["Cemitério", "Floresta", "Planície"],
    hp: 130,
    physDefense: 5,
    magDefense: 8,
    dodge: 12,
    actions: 3,
    damage: "1d8+1d6 (bico de obsidiana) ou 1d10 (penas-lâmina, alcance 4 hex)",
    abilities: [
      { name: "Forma de Enxame",
        desc: "Passivo: quando atingir 60% de HP, fragmenta-se em 6 corvos menores que agem como 1 criatura (mesmo HP compartilhado). Na forma de enxame: imune a dano de armas de 1 hex (são pequenos demais), mas vulnerável a magias de área (+50% dano). Um Descanso o reagrupa." },
      { name: "Roubo de Alma",
        desc: "Ao matar um alvo: absorve a alma. O alvo não pode ser ressuscitado por meios comuns enquanto o Corvino viver. A alma é liberada ao Corvino morrer." },
      { name: "Penas-Lâmina",
        desc: "1 Ação (4x/combate): lança 3 penas de obsidiana em alvos diferentes (ou no mesmo). Cada pena: 1d10 de dano, alcance 4 hex, sem rolagem de esquiva (chegam rápido demais)." },
      { name: "Visão Compartilhada",
        desc: "Passivo: percebe todos os seus alvos através dos olhos dos corvos. Não pode ser surpreendido. Emboscadas são impossíveis enquanto houver corvos dentro de 12 hex." }
    ],
    spells: [],
    behavior: "Circula acima do grupo antes de atacar (3 turnos de observação). Usa Penas-Lâmina nos turnos de abertura. Foca no personagem com menor HP. Ao fragmentar-se em enxame, dispersa para dificultar ataques e reagrupa quando possível.",
    loot: [
      { item: "Pena de Obsidiana (material raro — 2d4 penas, podem ser usadas como projéteis mágicos)", chance: 80, qty: "2d4" },
      { item: "Olho de Corvino (acessório raro — SAB+1, Percepção automática em raio 8 hex)", chance: 40, qty: "1" },
      { item: "Frasco de Alma Aprisionada (item único — contém a alma da última vítima do Corvino)", chance: 100, qty: "1" },
      { item: "Bico de Obsidiana (material — pode ser forjado em adaga rara com efeito de Roubo de Vida)", chance: 30, qty: "1" }
    ]
  },

  /* ═══════════════════════════════════════════════════════════════
     MONSTROS INSPIRADOS EM DARK SOULS
     Mecânicas de padrão de ataque, postura, fases e punição por erro
     Dificuldades 2–5 · Loot temático
     ═══════════════════════════════════════════════════════════════ */

  /* ── DIF 2 — Inimigos comuns ─────────────────────────────────── */

  {
    id: "morto-oco-guerreiro",
    name: "Morto Oco — Guerreiro",
    difficulty: 2,
    attrs: { FOR:3, DEX:2, AGI:1, INT:0, SAB:0 },
    size: "medio",
    category: "Morto-vivo / Humanoide",
    location: ["Ruínas", "Dungeon", "Cemitério"],
    hp: 70,
    physDefense: 5,
    magDefense: 1,
    dodge: 10,
    actions: 2,
    damage: "1d10+1d6 (espada enferrujada) ou 1d8+1d4 (escudo de choque)",
    abilities: [
      { name: "Sequência de Dois Golpes",
        desc: "Passivo: quando acerta um ataque, pode gastar 1 Ação adicional automaticamente para realizar um segundo golpe imediato no mesmo alvo (sem rolagem nova de acerto — já tem o ritmo). O segundo golpe causa metade do dano." },
      { name: "Postura de Escudo",
        desc: "Passivo: se estiver com escudo equipado, ataques frontais sofrem −2 de dano (bloqueia parcialmente). Flancear o Oco remove esta proteção — atacar por trás ignora o escudo completamente." },
      { name: "Resistência Oca",
        desc: "Passivo: ao chegar a 0 HP tem 20% de chance (d10 ≤ 2) de continuar com 1 HP por mais 1 turno, em pé, olhando fixamente. No turno seguinte, cai." },
      { name: "Sem Medo",
        desc: "Passivo: imune a Aterrorizado, Confuso e Abalado. Não foge. Nunca." }
    ],
    spells: [],
    behavior: "Patrulha em rota fixa. Ao detectar o grupo (SAB 0 — detecta por som ou visão a 6 hex), avança sem hesitar. Ataca o alvo mais próximo. Muda de alvo apenas se o atual morrer ou sair do alcance.",
    loot: [
      { item: "Fragmento de Osso Humano (material — componente alquímico, 1d4 usos)", chance: 80, qty: "1d4" },
      { item: "Espada Enferrujada (arma comum deteriorada — 1d8, −1 Def por uso extra)", chance: 50, qty: "1" },
      { item: "Alma de Guerreiro Oco (artefato — pode ser trocada por XP ou usada em ritual)", chance: 100, qty: "1" },
      { item: "Escudo Rachado (escudo comum — defesa funcional mas com −1 permanente)", chance: 40, qty: "1" }
    ]
  },

  {
    id: "besta-oca-saltadora",
    name: "Besta Oca Saltadora",
    difficulty: 2,
    attrs: { FOR:2, DEX:4, AGI:5, INT:0, SAB:1 },
    size: "pequeno",
    category: "Morto-vivo / Besta",
    location: ["Dungeon", "Ruínas", "Caverna"],
    hp: 55,
    physDefense: 3,
    magDefense: 1,
    dodge: 14,
    actions: 3,
    damage: "1d6+1d4 (mordida) ou 1d8 (salto de abertura — ver habilidade)",
    abilities: [
      { name: "Salto de Abertura",
        desc: "Se a Besta ainda não foi detectada (Furtividade vs Percepção do alvo): no primeiro turno, pode saltar de até 6 hex e atacar com 1d8+AGI de dano. Se o salto acertar, o alvo testea FOR (normal) ou cai Derrubado." },
      { name: "Esquiva Instintiva",
        desc: "Passivo: não pode ser atingida por mais de 2 ataques no mesmo turno — ao terceiro ataque do mesmo alvo, esquiva automaticamente (o corpo morto ainda tem reflexos de sobrevivência)." },
      { name: "Uivo de Alerta",
        desc: "Ao receber dano: uiva imediatamente. Qualquer Morto Oco ou Besta Oca em raio 8 hex que não esteja em combate move-se em direção ao som (o Mestre pode usar para reforçar o encontro)." }
    ],
    spells: [],
    behavior: "Se esconde em fendas, tetos e cornijas. Aguarda o grupo passar embaixo antes de saltar. Após o primeiro ataque, ataca o alvo mais próximo alternando entre alvos para dificultar ataques concentrados.",
    loot: [
      { item: "Garra de Besta Oca (material — 1d4 garras, usadas em poções de Esquiva)", chance: 70, qty: "1d4" },
      { item: "Alma de Besta Oca (artefato — trocada por XP)", chance: 100, qty: "1" }
    ]
  },

  /* ── DIF 3 — Guardiões e inimigos nomeados ───────────────────── */

  {
    id: "cavaleiro-de-prata-oco",
    name: "Cavaleiro de Prata Oco",
    difficulty: 3,
    attrs: { FOR:4, DEX:3, AGI:2, INT:1, SAB:1 },
    size: "medio",
    category: "Morto-vivo / Cavaleiro",
    location: ["Dungeon", "Ruínas", "Templo"],
    hp: 150,
    physDefense: 9,
    magDefense: 5,
    dodge: 9,
    actions: 2,
    damage: "1d12+1d8 (lança de prata) ou 1d10+1d6 (estocada em arco — alcance 2 hex)",
    abilities: [
      { name: "Estocada em Arco",
        desc: "1 Ação: ataca em arco que alcança todos os hex em linha de 2 hex à frente. Todos os alvos na linha testam AGI (normal) ou recebem dano completo. Uso típico para punir grupos que avançam em coluna." },
      { name: "Escudo de Torre Perfeito",
        desc: "Passivo: reduções de dano do escudo são dobradas (bloqueia 8 de Def. em vez de 4). Flanquear remove completamente — ataques laterais ou traseiros ignoram o escudo e a alta Def. Física é reduzida em 4." },
      { name: "Combo de Três Golpes",
        desc: "1 Ação (2x/combate): realiza 3 ataques em sequência no mesmo alvo. O terceiro ataque, se acertar, tem +3 na Chance de Crítico (o padrão termina no ponto mais forte). Após o combo, o Cavaleiro fica sem Ações por 1 turno (esgotamento do padrão)." },
      { name: "Memória de Batalha",
        desc: "Passivo: aprende com o grupo. A cada turno que o mesmo personagem esquivar com sucesso, o Cavaleiro ganha +1 na Chance de Acerto contra aquele alvo (máx +3). Muda de padrão ao perceber que um ataque foi esquivado 3 vezes." }
    ],
    spells: [],
    behavior: "Patrulha câmaras internas. Posiciona-se em corredores estreitos para maximizar a Estocada em Arco. Usa Combo de Três Golpes no personagem com maior HP. Após o combo, recua 2 hex para recompor a postura.",
    loot: [
      { item: "Lança de Prata do Cavaleiro (arma rara — 1d12, alcance 2 hex, +1d4 vs mortos-vivos)", chance: 45, qty: "1" },
      { item: "Fragmento de Armadura de Prata (material raro — para reforço de armadura)", chance: 65, qty: "1d2" },
      { item: "Alma de Cavaleiro de Prata (artefato — alto valor em XP ou ritual)", chance: 100, qty: "1" },
      { item: "Escudo de Torre de Prata (escudo raro — defesa passiva, sem penalidade de esquiva)", chance: 35, qty: "1" }
    ]
  },

  {
    id: "gargoyla-de-pedra-viva",
    name: "Gárgula de Pedra Viva",
    difficulty: 3,
    attrs: { FOR:4, DEX:2, AGI:2, INT:1, SAB:2 },
    size: "grande",
    category: "Construto / Guardião",
    location: ["Templo", "Ruínas", "Dungeon"],
    hp: 160,
    physDefense: 10,
    magDefense: 4,
    dodge: 8,
    actions: 2,
    damage: "1d12+1d8 (garra de pedra) ou 2d8 (cauda de pedra — alcance 2 hex atrás)",
    abilities: [
      { name: "Postura de Pedra",
        desc: "Passivo: quando não atacou no último turno (ficou parado), parece uma estátua — Percepção (difícil) para identificá-la como ameaça. O primeiro ataque após 1 turno imóvel tem acerto automático (a surpresa é total)." },
      { name: "Cauda de Pedra",
        desc: "Reação (1x/turno): ao ser atacada por trás ou de lado: bate com a cauda de pedra em todos os hex adjacentes — 2d8 de dano, AGI (normal) para metade. A CAUDA PODE SER CORTADA: se receber 30+ de dano em um único golpe traseiro, cai. A cauda se torna item (material raro: Fragmento de Cauda de Gárgula)." },
      { name: "Voo de Investida",
        desc: "1 Ação (2x/combate): voa até 8 hex e mergulha no alvo — 2d10+FOR de dano, AGI (difícil) para esquivar. Todos os personagens em raio 1 hex do alvo sofrem 1d8 de dano de impacto (a pedra do chão estilhaça)." },
      { name: "Resistência de Pedra",
        desc: "Passivo: imune a veneno e sangramento. Dano de raio e trovão causa +50% (o metal condutor na pedra). Ataques com armas mágicas de fogo causam apenas metade do dano (a pedra aquece lentamente)." }
    ],
    spells: [],
    behavior: "Fica parada em posição de estátua até o grupo passar embaixo ou interagir com o ambiente. Abre com acerto automático. Usa Voo de Investida quando múltiplos alvos estão agrupados. Nunca persegue além de 12 hex do ponto que guarda.",
    loot: [
      { item: "Fragmento de Pedra Viva (material raro — para armadura de pedra ou forja)", chance: 75, qty: "1d2" },
      { item: "Fragmento de Cauda de Gárgula (material raro — só disponível se a cauda for cortada)", chance: 0, qty: "1" },
      { item: "Alma de Gárgula (artefato — alto valor)", chance: 100, qty: "1" },
      { item: "Olho de Pedra (acessório raro — imune a ilusões visuais, +1d4 em Percepção)", chance: 30, qty: "1" }
    ]
  },

  /* ── DIF 4 — Guardiões nomeados e mini-bosses ────────────────── */

  {
    id: "cavaleiro-negro-maldito",
    name: "Cavaleiro Negro — O Maldito",
    difficulty: 4,
    attrs: { FOR:5, DEX:3, AGI:2, INT:1, SAB:2 },
    size: "grande",
    category: "Morto-vivo / Cavaleiro Elite",
    location: ["Dungeon", "Ruínas", "Templo"],
    hp: 220,
    physDefense: 11,
    magDefense: 6,
    dodge: 10,
    actions: 3,
    damage: "2d10+1d8 (gládio negro) ou 1d12+1d6 (escudo de choque — empurra 2 hex)",
    abilities: [
      { name: "Combo Pesado — Três Fases",
        desc: "Passivo: o Cavaleiro tem 3 padrões de combo memorizados. Cada turno, usa um padrão diferente em sequência (o Mestre deve registrar qual fase está). Fase 1: 2 golpes verticais (+1d6 cada). Fase 2: 1 golpe horizontal que atinge raio 1 hex à frente. Fase 3: golpe de escudo (empurra 2 hex) + estocada imediata. Conhecer o padrão permite antecipar." },
      { name: "Punição de Abertura",
        desc: "Reação (ilimitada): sempre que um personagem errar um ataque corpo a corpo: o Cavaleiro realiza imediatamente 1 contra-ataque gratuito com +2 na Chance de Crítico. Não pode ser esquivado." },
      { name: "Perseguição Implacável",
        desc: "Passivo: se o grupo tentar fugir, o Cavaleiro persegue sem limite de distância na área atual. Só para se o grupo sair da área ou o Cavaleiro for morto. Move 5 hex por turno, nunca descansa." },
      { name: "Aura Negra",
        desc: "Passivo: presença corrói a magia. Magias de buff aplicadas em aliados adjacentes ao Cavaleiro têm duração reduzida em 1 turno. Magias de dano direcionadas a ele têm −1d4 no dano." }
    ],
    spells: [],
    behavior: "Encontrado sozinho, sempre em local dramático (fim de corredor, topo de escada). Avança devagar. Usa o padrão de combo na sequência correta — o Mestre DEVE anotar a fase. Nunca recua. Nunca mostra emoção.",
    loot: [
      { item: "Gládio Negro Maldito (arma rara — 2d10, mágico, causa Abalado em críticos)", chance: 40, qty: "1" },
      { item: "Armadura do Cavaleiro Negro (armadura rara — Def.Fís 11, maldição resistência: imune à primeira condição por combate)", chance: 30, qty: "1" },
      { item: "Alma do Cavaleiro Negro (artefato lendário — valor enorme em XP ou ritual)", chance: 100, qty: "1" },
      { item: "Fragmento de Aço Negro (material lendário — para forja de arma maldita)", chance: 55, qty: "1" }
    ]
  },

  {
    id: "sacerdotisa-dos-profundos",
    name: "Sacerdotisa dos Profundos",
    difficulty: 4,
    attrs: { FOR:1, DEX:3, AGI:2, INT:4, SAB:6 },
    size: "medio",
    category: "Humanoide Corrompido / Conjuradora",
    location: ["Dungeon", "Templo", "Pântano"],
    hp: 190,
    physDefense: 3,
    magDefense: 14,
    dodge: 11,
    actions: 2,
    damage: "1d6+SAB (tentáculo de luz corrompida — alcance 3 hex) ou magia",
    abilities: [
      { name: "Lágrimas Corrompidas",
        desc: "1 Ação de Magia (3x/combate): chora lágrimas negras que formam poça de 2 hex à frente. A poça dura 3 rodadas: qualquer personagem que pisar nela recebe 1d8 de dano de corrupção por rodada e tem −2 na Chance de Acerto enquanto dentro dela." },
      { name: "Bênção da Profundidade",
        desc: "1 Ação de Magia (2x/combate): marca 1 personagem com a Bênção Corrompida — por 4 rodadas, toda cura que o personagem receber é convertida em 50% do valor como dano (metade cura, metade corrói). O alvo não sente diferença — a bênção é sutil." },
      { name: "Eco das Profundezas",
        desc: "Passivo: toda magia de dano que acertar a Sacerdotisa é parcialmente refletida — 25% do dano causa Abalado nos aliados em raio 2 hex do conjurador (a energia ressoa). Não aplica dano refletido, apenas a condição." },
      { name: "Segundo Rosto",
        desc: "Ao atingir 40% de HP: revela o segundo rosto nas costas — um rosto grotesco que começa a conjurar independentemente. Ganha +1 Ação de Magia por turno e seus ataques passam a causar adicionalmente 1d6 de dano de corrupção." }
    ],
    spells: [],
    behavior: "Fica em posição de oração até ser atacada. Posiciona-se de costas para a parede — o segundo rosto não pode atacar se não tiver espaço atrás. Prioriza marcar o Clérigo com Bênção Corrompida primeiro (para sabotear curas). Usa Lágrimas para controlar o campo.",
    loot: [
      { item: "Véu da Sacerdotisa (acessório raro — SAB+2, mas reduz Def.Mágica em 3 — a sabedoria dela vem de corrupção)", chance: 45, qty: "1" },
      { item: "Lágrima das Profundezas (material raro — componente de magia de corrupção ou veneno avançado)", chance: 70, qty: "1d3" },
      { item: "Alma da Sacerdotisa (artefato lendário)", chance: 100, qty: "1" },
      { item: "Tomo da Bênção Corrompida (ensina Bênção Corrompida como magia Nível 4)", chance: 30, qty: "1" }
    ]
  },

  {
    id: "bestia-oca-gigante",
    name: "Besta Oca Gigante — O Fardo",
    difficulty: 4,
    attrs: { FOR:6, DEX:0, AGI:1, INT:0, SAB:1 },
    size: "colossal",
    category: "Morto-vivo / Colossal",
    location: ["Dungeon", "Planície", "Ruínas"],
    hp: 280,
    physDefense: 8,
    magDefense: 2,
    dodge: 7,
    actions: 2,
    damage: "3d10+1d12 (pisada colossal — raio 2 hex) ou 2d12 (cabeçada — 4 hex de linha)",
    abilities: [
      { name: "Fardo Imóvel",
        desc: "Passivo: a Besta se move apenas 2 hex por turno (corpo enorme demais). Porém, seus ataques alcançam raio 3 hex — nenhuma criatura de tamanho médio ou menor está segura perto dela." },
      { name: "Cabeças Parasitas",
        desc: "Passivo: 3 cabeças menores crescem do corpo principal. Cada cabeça têm 40 HP próprios e Def.Fís 4 — se destruídas, a Besta perde 1 Ação por combate. Cabeças são o ponto fraco (recebem +50% de dano). A Besta tem Def.Fís 8 no corpo, mas as cabeças têm 4." },
      { name: "Gritar das Entranhas",
        desc: "1 Ação (2x/combate): abre o torso revelando massa de tentáculos que golpeiam em raio 4 hex — 2d8 de dano, SAB (normal) ou os alvos ficam Aterrorizados por 1 rodada. O torso aberto reduz Def.Física para 4 por 1 turno (o interior é mole)." },
      { name: "Não Vai Morrer Fácil",
        desc: "Passivo: ao atingir 50% HP, as cabeças que restam fundem com o corpo principal — a Besta reganha 30 HP e ganha +2 de Def.Física (max 12). Fica mais lenta (1 hex por turno) mas mais resistente." }
    ],
    spells: [],
    behavior: "Vagante — pode aparecer em qualquer encontro como reforço se o grupo demorar muito. Foca no personagem mais próximo. Prioriza usar Gritar das Entranhas quando 3+ personagens estão em raio 4 hex. As cabeças podem ser alvo independente.",
    loot: [
      { item: "Alma da Besta Fardo (artefato lendário — valor muito alto)", chance: 100, qty: "1" },
      { item: "Fragmento de Cabeça Parasita (material — obtido apenas de cabeça destruída, lendário)", chance: 0, qty: "1" },
      { item: "Osso Colossal (material — 2d4, usado em forja de armas pesadas ou construto)", chance: 65, qty: "2d4" },
      { item: "Vísceras do Fardo (material raro — componente de ritual de fortalecimento)", chance: 50, qty: "1" }
    ]
  },

  /* ── DIF 5 — BOSSES ──────────────────────────────────────────── */

  {
    id: "senhor-dos-cinzas",
    name: "O Senhor das Cinzas",
    difficulty: 5,
    attrs: { FOR:5, DEX:4, AGI:3, INT:3, SAB:4 },
    size: "grande",
    category: "Morto-vivo Elite / Lorde",
    location: ["Dungeon", "Ruínas", "Templo"],
    hp: 380,
    physDefense: 10,
    magDefense: 10,
    dodge: 12,
    actions: 4,
    damage: "2d12+1d10 (greatsword de cinzas) ou 2d8+INT (cinzas ardentes — alcance 5 hex) ou 1d10 (rajada de cinzas em área — raio 4 hex)",
    abilities: [
      { name: "Fase 1 — O Rei Morto (HP > 50%)",
        desc: "Combate com espada. Usa 4 Ações: 2 ataques de espada + 1 arremesso de cinzas + 1 de posicionamento. Padrão: sempre ataca duas vezes seguidas no mesmo alvo antes de mudar. Cinzas ardentes aplicam Queimando por 2 rodadas." },
      { name: "Fase 2 — O Cinzas Desperto (HP ≤ 50%)",
        desc: "Ao atingir 50% HP: para completamente por 1 turno (invulnerável) e o ambiente pega fogo — todos os hex em raio 6 hex causam 1d4 de dano por turno. Ganha +1 Ação, +2 dano em todos os ataques, e começa a usar Rajada de Cinzas em área toda rodada como Ação Livre." },
      { name: "Punição do Rei",
        desc: "Reação (3x/combate): ao ser atingido por magia ou ataque à distância — absorve parte da energia e devolve como rajada de cinzas no conjurador (dano igual ao recebido, máx 20, AGI normal para metade)." },
      { name: "Memória de Mil Mortes",
        desc: "Passivo: cada turno, o Senhor fica marginalmente mais eficiente — ganha +1 na Chance de Acerto cumulativamente (máx +4). O combate deve ser rápido ou ele se torna imparável. Reinicia se o grupo fugir e voltar." },
      { name: "Lamento das Cinzas",
        desc: "1 Ação (1x/combate, apenas na Fase 2): a espada explode em pillar de cinzas — 3d12+FOR de dano em linha de 8 hex, sem rolagem de esquiva. O Senhor fica sem Ações no turno seguinte (o esforço o esgota)." }
    ],
    spells: [],
    behavior: "Encontrado no trono de cinzas no centro de uma sala circular. Não fala. Levanta devagar. Fase 1: metódico, calculado, ataca em padrões. Fase 2: agressivo, ambiente letal, pressa é essencial. Lamento das Cinzas é o ataque decisivo — usado quando o grupo está alinhado.",
    loot: [
      { item: "Alma do Senhor das Cinzas (artefato lendário único — poder imenso de XP ou ritual de ascensão)", chance: 100, qty: "1" },
      { item: "Greatsword das Cinzas (arma lendária — 2d12, aplica Queimando em críticos, cresce mais forte quando empunhada por quem já morreu antes)", chance: 60, qty: "1" },
      { item: "Coroa das Cinzas (acessório lendário — FOR+2, SAB+2, mas atrai inimigos — aparecem encontros aleatórios 50% mais frequentes)", chance: 40, qty: "1" },
      { item: "Cinzas do Rei (material lendário — componente de ritual para Convergência do Destino)", chance: 75, qty: "1" }
    ]
  },

  {
    id: "dragao-anciao-sem-escamas",
    name: "Ancião Sem Escamas — O Que Permaneceu",
    difficulty: 5,
    attrs: { FOR:6, DEX:2, AGI:2, INT:5, SAB:5 },
    size: "colossal",
    category: "Dragão / Ancião",
    location: ["Montanha", "Ruínas", "Dungeon"],
    hp: 450,
    physDefense: 13,
    magDefense: 16,
    dodge: 8,
    actions: 4,
    damage: "3d12+FOR (mordida colossal) ou 2d12+1d10 (garra) ou 3d10+INT (sopro de vazio — linha 10 hex)",
    abilities: [
      { name: "Pedra de Dragão — Invulnerabilidade Parcial",
        desc: "Passivo: o Ancião petrificou partes do próprio corpo. Dano físico direto no tronco e cabeça é reduzido em 6 adicionalmente (além da Def. Física normal). Fraquezas: as PATAS não estão petrificadas (Def.Fís 8 nas patas) e os OLHOS têm 0 de defesa — atacar os olhos (requer manobra de Percepção difícil para mirar) causa dano normal + cega por 1 rodada." },
      { name: "Sopro de Vazio",
        desc: "1 Ação (4x/combate): sopra energia de vazio em linha de 10 hex, largura 2 hex. 3d10+INT de dano de vazio (ignora Def. Física, usa Def. Mágica). AGI (crítico) para sair da linha a tempo. O sopro também destrói terreno — hexes atingidos tornam-se escombros (−2 Movimento para atravessar)." },
      { name: "Asa de Tempestade",
        desc: "1 Ação (3x/combate): bate as asas — todos em raio 6 hex testam FOR (difícil) ou são empurrados 4 hex e ficam Derrubados. Voar cancela este efeito. A batida de asas pode apagar fogueiras, torches e fontes de luz em raio 10 hex." },
      { name: "Sabedoria Anciã",
        desc: "Passivo: não pode ser surpreendido. Conhece todos os personagens que estão na área (SAB 5 — lembra de qualquer coisa que passou pelo território). Nomeia o personagem com maior ameaça e foca nele primeiro." },
      { name: "O Que Permaneceu",
        desc: "Ao atingir 25% de HP: compreende que vai morrer e para de atacar por 1 turno. Olha para cada personagem. Depois descarrega tudo — ganha +2 Ações e +3 em todos os ataques pelos 2 turnos finais. Morre no terceiro." }
    ],
    spells: [],
    behavior: "Não ataca imediatamente — examina o grupo por 2 turnos. Se o grupo tentar dialogar (INT ou SAB difícil), pode pausar o combate por 1d4 rodadas. Foca o alvo de maior ameaça. Usa Asa de Tempestade para separar o grupo. Sopro de Vazio em formações compactas.",
    loot: [
      { item: "Alma do Ancião (artefato lendário único — o maior valor de XP possível no sistema)", chance: 100, qty: "1" },
      { item: "Escama de Vazio (material lendário — para armadura lendária ou arma que ignora Def.Mágica)", chance: 80, qty: "1d3" },
      { item: "Dente do Ancião (arma lendária artesanal — pode ser forjada em adaga 2d8 que ignora toda Def.Mágica)", chance: 60, qty: "1" },
      { item: "Olho do Ancião (acessório lendário — INT+2, SAB+2, vê ilusões e mentiras automaticamente)", chance: 35, qty: "1" },
      { item: "Memória Anciã (artefato — contém todo o conhecimento do dragão, pode ser estudada por 1 semana para aprender 1 magia de nível 5 gratuitamente)", chance: 45, qty: "1" }
    ]
  },

  /* ═══════════════════════════════════════════════════════════════
     MONSTROS DARK SOULS — NOVOS
     ═══════════════════════════════════════════════════════════════ */

  /* ── DIF 2 ──────────────────────────────────────────────────── */

  {
    id: "cavaleiro-prata-oco",
    name: "Cavaleiro de Prata Oco",
    difficulty: 2,
    attrs: { FOR:3, DEX:3, AGI:1, INT:0, SAB:1 },
    size: "medio",
    category: "Morto-vivo / Cavaleiro",
    location: ["Dungeon","Ruínas","Cemitério"],
    hp: 80, physDefense: 7, magDefense: 3, dodge: 9, actions: 2,
    damage: "1d10+1d6 (lança de prata) ou 1d8+1d6 (espada curta)",
    abilities: [
      { name: "Postura de Lança",
        desc: "Passivo: mantém distância de 2 hex. Qualquer alvo que tente se aproximar provoca ataque de oportunidade com a lança (1d10, sem custo de Ação). Ao ser flanqueado, troca para espada curta automaticamente." },
      { name: "Escudo Branco",
        desc: "Passivo: o escudo branco oco absorve o primeiro ataque de magia por combate completamente (anula o dano). Após absorver, o escudo racha e perde essa função." },
      { name: "Combo de Três",
        desc: "Ativo (1x/combate): realiza sequência de 3 ataques rápidos no mesmo alvo. Primeiro: 1d8. Segundo: 1d8. Terceiro: 1d10+1d6 (golpe pesado que não pode ser esquivado se os dois anteriores acertaram)." }
    ],
    spells: [],
    behavior: "Patrulha portões e corredores. Mantém distância com a lança. Se o alvo se aproximar, recua 1 hex antes de atacar. Usa Combo de Três quando o alvo ficar com menos de 40% HP.",
    loot: [
      { item: "Lança de Prata Oca (arma rara — 1d10, alcance 2 hex, leve)", chance:55, qty:"1" },
      { item: "Fragmento de Escudo Branco (material — encantamento de absorção de magia)", chance:60, qty:"1" },
      { item: "Alma de Cavaleiro de Prata (artefato — troca por XP ou ritual)", chance:100, qty:"1" },
      { item: "Elmo de Prata Rachado (armadura parcial — +1 Def.Física, maldito)", chance:30, qty:"1" }
    ]
  },

  {
    id: "gargula-pedra-viva",
    name: "Gárgula de Pedra Viva",
    difficulty: 2,
    attrs: { FOR:3, DEX:2, AGI:2, INT:0, SAB:1 },
    size: "medio",
    category: "Construto / Besta",
    location: ["Ruínas","Templo","Dungeon"],
    hp: 75, physDefense: 8, magDefense: 2, dodge: 8, actions: 2,
    damage: "1d10+1d6 (garras de pedra) ou 1d8 (golpe de cauda — alcance 2 hex)",
    abilities: [
      { name: "Cauda Cortável",
        desc: "Passivo: a cauda da Gárgula é um ponto fraco. Se receber 15+ de dano num único golpe direcionado à cauda (mestre declara a intenção antes de rolar), a cauda é cortada. A Gárgula perde o ataque de cauda mas dropa Cauda de Pedra imediatamente. Cortar a cauda causa −1 Ação permanente ao monstro." },
      { name: "Estátua Perfeita",
        desc: "Passivo: enquanto imóvel e não ameaçada, parece uma estátua comum. Percepção (difícil) para identificar que está viva. Ataques surpresa têm +3 Chance de Crítico." },
      { name: "Mergulho de Pedra",
        desc: "1 Ação (2x/combate): voa e mergulha sobre um alvo em raio 5 hex. O alvo sofre 2d8 de dano e testa AGI (normal) ou fica Derrubado. A Gárgula não esquiva no turno em que usa esta habilidade." }
    ],
    spells: [],
    behavior: "Fica estacionada em posição de estátua. Quando o grupo passa a menos de 4 hex, desperta silenciosamente. Tenta o primeiro ataque como surpresa. Usa Mergulho de Pedra no personagem mais afastado.",
    loot: [
      { item: "Cauda de Pedra (material raro — só disponível se cortada em combate, forja arma especial)", chance:0, qty:"1" },
      { item: "Fragmento de Pedra Viva (material — 1d4 fragmentos, mais resistentes que pedra normal)", chance:75, qty:"1d4" },
      { item: "Alma de Gárgula (artefato)", chance:100, qty:"1" },
      { item: "Núcleo de Animação Menor (material — versão menor, anima objeto pequeno)", chance:20, qty:"1" }
    ]
  },

  /* ── DIF 3 ──────────────────────────────────────────────────── */

  {
    id: "cavaleiro-prata-oco-elite",
    name: "Cavaleiro de Prata Oco — Elite",
    difficulty: 3,
    attrs: { FOR:4, DEX:4, AGI:2, INT:1, SAB:2 },
    size: "medio",
    category: "Morto-vivo / Cavaleiro",
    location: ["Dungeon","Ruínas","Templo"],
    hp: 155, physDefense: 9, magDefense: 5, dodge: 11, actions: 3,
    damage: "1d12+1d8 (espadão de prata) ou 1d10+1d6 (escudo-lança)",
    abilities: [
      { name: "Combo Bruto — Três Fases",
        desc: "Passivo: quando ataca, realiza sempre sequência de 3 golpes por turno (1 por Ação). Fase 1: golpe horizontal (1d12). Fase 2: golpe diagonal (1d12). Fase 3: estocada (1d10+1d8, ignora metade da Def.Física). Se o alvo esquivar qualquer um, a fase seguinte tem −1 Chance de Acerto. Se as 3 fases acertarem: dano bônus +1d10." },
      { name: "Punição por Esquiva Atrasada",
        desc: "Passivo: se o alvo tentar esquivar e falhar (rolar acima da Chance de Esquiva), o Cavaleiro Elite detecta o padrão — o próximo ataque no mesmo turno tem +3 na Chance de Crítico." },
      { name: "Postura Real",
        desc: "1 Ação (1x/combate): assume postura imóvel por 1 turno. Não ataca. Na rodada seguinte: todos os ataques têm +2 Chance de Acerto e +1d12 de dano bônus. Aliados no combate ficam com −1 na Chance de Esquiva por 1 rodada (a presença impõe respeito)." },
      { name: "Não Cai Nunca",
        desc: "Passivo: imune a Derrubado. Ao receber dano que reduziria o HP abaixo de 25%: mantém 25% de HP mínimo por mais 1 turno (uma vez por combate). No turno seguinte, o limite some." }
    ],
    spells: [],
    behavior: "Guarda câmaras importantes. Inicia sempre com Postura Real se tiver tempo (detecta o grupo com 8+ hex). O combo de três fases é automático — adapta qual golpe usar baseado na posição do alvo. Troca de alvo apenas se o atual morrer.",
    loot: [
      { item: "Espadão de Prata Elite (arma rara — 1d12+1d4, Postura Real: +1 ação de combate 1x/combate)", chance:50, qty:"1" },
      { item: "Armadura de Prata Elite (armadura rara — Def.Física 9, Def.Mágica 5)", chance:45, qty:"1" },
      { item: "Alma de Cavaleiro Elite (artefato — valor dobrado em rituais)", chance:100, qty:"1" },
      { item: "Crest of the Silver Knight (emblema raro — abre portas seladas em templos antigos)", chance:35, qty:"1" }
    ]
  },

  {
    id: "demonio-touro-oco",
    name: "Demônio Touro Oco",
    difficulty: 3,
    attrs: { FOR:6, DEX:1, AGI:1, INT:0, SAB:1 },
    size: "enorme",
    category: "Demônio / Besta",
    location: ["Dungeon","Ruínas","Planície"],
    hp: 175, physDefense: 8, magDefense: 2, dodge: 7, actions: 2,
    damage: "1d12+1d12 (chifrada) ou 2d10+1d6 (esmagamento — área 2 hex)",
    abilities: [
      { name: "Chifrada Devastadora",
        desc: "Ativo (2x/combate): carga em linha reta de até 6 hex, atingindo todos os alvos no caminho. Cada alvo sofre 1d12+1d12 e testa FOR (difícil) ou é lançado 2 hex para trás (Derrubado). O Demônio não pode mudar de direção durante a carga." },
      { name: "Esmagamento de Área",
        desc: "Ativo (1x/combate): levanta os braços e esmaga o solo — todos os personagens em raio 2 hex sofrem 2d10+FOR de dano (AGI normal para metade). Cria crateras no chão: esses hexes custam 2 de Movimento para atravessar pelo restante do combate." },
      { name: "Fúria do Oco",
        desc: "Passivo: ao atingir 50% de HP, entra em Fúria. Ganha +1 Ação de ataque por turno e +1d6 de dano em todos os golpes. Perde −2 de Esquiva (fica imprudente). A Fúria dura o restante do combate." },
      { name: "Corpo Enorme",
        desc: "Passivo: tamanho enorme — não pode entrar em espaços menores que 3 hex de largura. Recebe +50% de dano de magias de área (o corpo grande é alvo fácil). Ataques melee contra ele têm +1 Chance de Acerto (área fácil de acertar)." }
    ],
    spells: [],
    behavior: "Patrulha uma grande área. Ao detectar o grupo, ruge (todos testam SAB normal ou ficam Abalados por 1 rodada). Usa Chifrada Devastadora imediatamente. Foca sempre no alvo com mais HP. Ao entrar em Fúria, ignora aliados e ataca o mais próximo.",
    loot: [
      { item: "Chifre de Demônio (material lendário — forja armas de chifre, +1d8 dano de fogo)", chance:65, qty:"1" },
      { item: "Alma de Demônio Touro (artefato lendário — poder mágico imenso)", chance:100, qty:"1" },
      { item: "Couro de Demônio (material — armadura de couro com Def.Física 8)", chance:50, qty:"1d2" },
      { item: "Pó de Osso de Demônio (material raro — componente de poção de força bruta)", chance:70, qty:"1d4" }
    ]
  },

  {
    id: "fantasma-de-pedra",
    name: "Fantasma de Pedra — Novo Londo",
    difficulty: 3,
    attrs: { FOR:1, DEX:5, AGI:5, INT:3, SAB:3 },
    size: "medio",
    category: "Fantasma / Aberração",
    location: ["Pântano","Dungeon","Cemitério"],
    hp: 120, physDefense: 0, magDefense: 12, dodge: 13, actions: 3,
    damage: "1d10+DEX (garra espectral — ignora Def.Física) ou 1d8 (maldição acumulativa)",
    abilities: [
      { name: "Intangível",
        desc: "Passivo: imune a dano físico comum — armas normais passam por ele sem efeito. Apenas armas encantadas (+mágico), armas rúnicas, ou magias causam dano. Exceção: armas banhadas em Água Transiente ou ungidas por um Clérigo (1x/combate) funcionam por 3 ataques." },
      { name: "Maldição Acumulativa",
        desc: "Cada acerto do Fantasma aplica 1 carga de Maldição no alvo. Com 3 cargas: o alvo é Petrificado por 1 turno (0 Ações, 0 Reações, Def.Física dobrada mas não pode mover ou agir). Com 5 cargas: o alvo sofre Petrificação Parcial permanente (−1 AGI) até Cura Mágica." },
      { name: "Atravessar Paredes",
        desc: "Passivo: pode mover-se através de paredes, pisos e obstáculos físicos. Só é bloqueado por barreiras mágicas (Muralha de Força, Barreira Rúnica, Âncora do Plano)." },
      { name: "Forma Verdadeira",
        desc: "Ao atingir 30% de HP: revela sua forma verdadeira — um rosto humano agonizante dentro da névoa. Ganha +2 Ações mas perde a capacidade de Atravessar Paredes (muito emocionalmente presente para ser intangível). Magia de Exorcismo ou SAB 5+ pode identificar o nome da alma e desfazer o Fantasma sem combate." }
    ],
    spells: [],
    behavior: "Flutua silenciosamente. Atravessa paredes para aparecer atrás do grupo. Prioriza alvos sem armas mágicas (mais fáceis de afetar com Maldição). Recua através de paredes se ficar abaixo de 50% HP, reagrupa e retorna pelo ângulo menos protegido.",
    loot: [
      { item: "Essência de Fantasma (material — Água Transiente: unge 1 arma por 3 ataques, 1d3 doses)", chance:80, qty:"1d3" },
      { item: "Fragmento de Maldição (material lendário — componente de magia de Petrificação)", chance:40, qty:"1" },
      { item: "Alma Perdida de Novo Londo (artefato — libera um espírito preso, quest item)", chance:100, qty:"1" },
      { item: "Cristal de Maldição (acessório raro — +1 INT, Maldições aplicadas pelo portador duram +1 rodada)", chance:25, qty:"1" }
    ]
  },

  /* ── DIF 4 ──────────────────────────────────────────────────── */

  {
    id: "cavaleiro-negro-maldito-v2",
    name: "Cavaleiro Negro — O Maldito",
    difficulty: 4,
    attrs: { FOR:5, DEX:4, AGI:2, INT:1, SAB:2 },
    size: "medio",
    category: "Morto-vivo / Cavaleiro",
    location: ["Dungeon","Ruínas","Templo"],
    hp: 230, physDefense: 10, magDefense: 6, dodge: 11, actions: 3,
    damage: "1d12+1d10 (Espada das Almas Negras) ou 1d10+1d8 (lança do caos)",
    abilities: [
      { name: "Padrão de Ataque Maldito",
        desc: "Passivo: o Cavaleiro Negro alterna entre dois modos por turno. Modo Pressão: 3 ataques rápidos de 1d12 cada. Modo Crítico: 1 ataque lento (gasta 2 Ações para preparar — visível), mas o golpe causa 3d12+FOR e ignora toda a Def.Física se acertar. O Mestre anuncia o modo no início do turno do Cavaleiro." },
      { name: "Punição por Rolar",
        desc: "Reação: se o alvo usar movimento de esquiva de mais de 2 hex (recuo rápido), o Cavaleiro Negro realiza 1 ataque gratuito de alcance. Este ataque não pode ser esquivado — foi feito para punir quem corre." },
      { name: "Chama do Caos",
        desc: "1 Ação de Magia (2x/combate): projeta chama negra em cone de 4 hex. Todos os alvos sofrem 2d10 de dano de fogo que ignora Def.Física (penetra armadura). Alvos que falhem em AGI (difícil) ficam Queimando por 2 rodadas." },
      { name: "Imortal por Maldição",
        desc: "Passivo: ao cair a 0 HP pela primeira vez, em vez de morrer, o Cavaleiro Negro se ajoelha por 1 turno (não age, não pode ser acertado adicionalmente). Levanta no turno seguinte com 40% HP e Modo Crítico ativado. Só morre na segunda vez que chegar a 0 HP." }
    ],
    spells: [],
    behavior: "Fica imóvel até o grupo entrar na câmara. Não avisa — simplesmente começa a atacar. Alterna modos com disciplina. Usa Chama do Caos quando 3+ personagens estão agrupados. Após ressurgir, foca exclusivamente no personagem que o derrubou.",
    loot: [
      { item: "Espada das Almas Negras (arma lendária — 1d12+1d10, Modo Crítico 1x/combate: 3d12 ignora def)", chance:30, qty:"1" },
      { item: "Armadura de Cavaleiro Negro (armadura lendária — Def.Física 12, Def.Mágica 8, −2 Movimento)", chance:25, qty:"1" },
      { item: "Alma de Cavaleiro Negro (artefato lendário — poder imenso)", chance:100, qty:"1" },
      { item: "Fragmento de Chama do Caos (material lendário — encanta arma com fogo negro)", chance:50, qty:"1" }
    ]
  },

  {
    id: "sacerdotisa-dos-profundos",
    name: "Sacerdotisa dos Profundos",
    difficulty: 4,
    attrs: { FOR:1, DEX:3, AGI:2, INT:5, SAB:6 },
    size: "medio",
    category: "Humanoide / Corrompido",
    location: ["Templo","Dungeon","Pântano"],
    hp: 195, physDefense: 4, magDefense: 14, dodge: 10, actions: 2,
    damage: "1d6+SAB (magia profunda — ignora Def.Física) ou 1d8+INT (raio de corrupção)",
    abilities: [
      { name: "Bênção dos Profundos",
        desc: "1 Ação de Magia (3x/combate): cura a si mesma ou aliado corrupto em 3d10+SAB HP. Se lançada em morto-vivo: em vez de curar, aumenta em +2 Ações e +1d10 dano por 2 rodadas (os profundos energizam os mortos)." },
      { name: "Maré de Corrupção",
        desc: "1 Ação de Magia (2x/combate): onda de energia corrompida em raio 5 hex. Todos os personagens testam SAB (difícil) ou ficam Corrompidos por 3 rodadas — Corrompidos têm −1d4 em todos os testes e curas recebidas são reduzidas em 50%." },
      { name: "Invocação dos Profundos",
        desc: "1 Ação de Magia (1x/combate): invoca 2 Mortos Ocos Guerreiros (Dif.2) imediatamente adjacentes. Os invocados agem no turno seguinte ao da Sacerdotisa. Se ela morrer, os invocados dissolvem." },
      { name: "Véu de Profundidade",
        desc: "Passivo: ao atingir 40% de HP, o véu cai e revela a face corrompida. Todos os personagens em raio 4 hex testam SAB (normal) ou ficam Abalados por 2 rodadas. Ela ganha +2 Def.Mágica e +1 Ação de Magia pelo restante do combate." }
    ],
    spells: [],
    behavior: "Mantém distância máxima. Começa invocando servos no primeiro turno. Usa Maré de Corrupção quando 3+ personagens agrupam. Cura a si mesma prioritariamente quando abaixo de 60% HP. Ao revelar o véu, usa Bênção nos servos invocados.",
    loot: [
      { item: "Símbolo dos Profundos (acessório lendário — SAB+2, magias de cura curam +50% mas curam também mortos-vivos aliados)", chance:35, qty:"1" },
      { item: "Véu da Sacerdotisa (acessório raro — INT+1, Maré de Corrupção reduzida a 1x/combate mas ignora Def.Mágica)", chance:50, qty:"1" },
      { item: "Alma de Sacerdotisa dos Profundos (artefato lendário)", chance:100, qty:"1" },
      { item: "Essência dos Profundos (material lendário — 3 doses, componente de magias de invocação)", chance:60, qty:"1d3" }
    ]
  },

  /* ── DIF 5 ──────────────────────────────────────────────────── */

  {
    id: "senhor-das-cinzas",
    name: "O Senhor das Cinzas",
    difficulty: 5,
    attrs: { FOR:6, DEX:4, AGI:3, INT:4, SAB:5 },
    size: "grande",
    category: "Sem-morte / Lendário",
    location: ["Dungeon","Templo","Ruínas"],
    hp: 480, physDefense: 12, magDefense: 10, dodge: 12, actions: 4,
    damage: "1d12+1d10+FOR (Espada da Primeira Chama) ou 3d8 (explosão de cinzas — área 3 hex)",
    abilities: [
      { name: "Primeira Fase — O Rei",
        desc: "Até 50% HP: 4 Ações por turno. Combo de espada (2d12+FOR por Ação). Ao final de cada turno: emite pulso de cinzas em raio 2 hex (1d6 de dano, todos os personagens adjacentes). Imune a fogo nesta fase." },
      { name: "Segunda Fase — A Cinza",
        desc: "Ao atingir 50% HP: o corpo fragmenta-se em cinza por 1 turno completo (intangível, não age). No turno seguinte: reagrupa com aspecto diferente — agora vulnerável a fogo (+50% dano), mas ganha +2 Ações (total 6), Def.Física cai para 8, mas Def.Mágica sobe para 16. Todos os ataques causam +1d10 de dano de fogo." },
      { name: "Chama da Primeira Centelha",
        desc: "1 Ação de Magia (3x/combate, apenas Fase 2): projeta cone de chama primordial de 6 hex. 3d10+INT de dano de fogo, ignora toda Def.Física. Alvos que falhem em AGI (crítico) ficam Queimando por 3 rodadas (1d8/rodada)." },
      { name: "Eu Fui o Primeiro",
        desc: "Passivo: se qualquer personagem tentar ressuscitar um aliado dentro de raio 6 hex enquanto o Senhor viver, a ressurreição falha automaticamente — a Primeira Chama devora a alma antes que ela retorne." }
    ],
    spells: [],
    behavior: "Senta em trono até o grupo entrar. Levanta sem pressa. Fase 1: metódico, poderoso, cada golpe calculado. Transição: solta um rugido que causa 1d10 de dano a todos em raio 8 hex (sem esquiva). Fase 2: errático, impulsivo, prioriza o conjurador.",
    loot: [
      { item: "Espada da Primeira Chama (arma lendária — 1d12+1d10, imune a fogo por 3 rodadas ao equipar)", chance:40, qty:"1" },
      { item: "Cinza da Primeira Centelha (material lendário — 1 dose, encanta arma com Primeiro Fogo permanente)", chance:50, qty:"1" },
      { item: "Coroa do Senhor das Cinzas (acessório lendário — FOR+2, SAB+1, Imune a fogo, maldita)", chance:30, qty:"1" },
      { item: "Grande Alma do Senhor (artefato lendário — o mais valioso de todos)", chance:100, qty:"1" }
    ]
  },

  {
    id: "anciao-sem-escamas",
    name: "O Ancião Sem Escamas",
    difficulty: 5,
    attrs: { FOR:8, DEX:2, AGI:1, INT:3, SAB:4 },
    size: "colossal",
    category: "Dragão / Sem-morte",
    location: ["Montanha","Dungeon","Planície"],
    hp: 580, physDefense: 16, magDefense: 8, dodge: 6, actions: 4,
    damage: "2d12+1d12+FOR (mordida/garra) ou 3d10 (sopro de gelo eterno — área 8 hex)",
    abilities: [
      { name: "Partes Vulneráveis",
        desc: "Passivo: o Ancião tem 3 pontos fracos declarados antes do combate: Olho Esquerdo (5 HP — dano direto ignora toda def), Ferida Antiga no Flanco (15 HP — recebe +100% dano), e Garras (10 HP — destruir remove 1 Ação permanente). Atacar ponto fraco requer intenção declarada + acerto. Quando destruídos: ficam marcados e o monstro reage de forma diferente." },
      { name: "Sopro de Gelo Eterno",
        desc: "1 Ação (4x/combate): sopro em cone de 8 hex. 3d10 de dano de gelo. Alvos que falhem em AGI (difícil) ficam Congelados por 2 rodadas (Imóveis, recebem +50% de dano físico). O chão nos hexes afetados fica escorregadio: custo de Movimento dobrado, AGI (normal) para não cair." },
      { name: "Colossal — Imune a Controle",
        desc: "Passivo: imune a Derrubado, Imobilizado, Acorrentado, Confuso e Aterrorizado. Feitiços de controle que funcionariam (Aprisionamento Arcano, Âncora do Plano) causam apenas −1 Ação por turno em vez de efeito completo." },
      { name: "Último Rugido",
        desc: "Ao atingir 20% de HP: rugido que causa 2d10 de dano a TODOS em raio 10 hex (sem esquiva). Nos 2 turnos seguintes: 6 Ações por turno e todos os ataques têm +3 Chance de Crítico — o dragão abandona toda prudência." }
    ],
    spells: [],
    behavior: "Dorme. Requer 2+ turnos de ruído ou 1 ataque direto para despertar. Ao acordar: Sopro de Gelo imediato. Prioriza o grupo inteiro com ataques de área. Ao Último Rugido: ignora estratégia, ataca o mais próximo com tudo.",
    loot: [
      { item: "Escama do Ancião (material lendário — armadura superior, Def.Física 14 — 3 escamas necessárias)", chance:70, qty:"1d3" },
      { item: "Olho do Ancião (material lendário — se o olho foi destruído: visão do futuro, 1x/semana)", chance:40, qty:"1" },
      { item: "Garra do Ancião (material lendário — arma ou escudo de garra, +2d10 dano de gelo)", chance:50, qty:"1" },
      { item: "Alma do Ancião Sem Escamas (artefato — o mais poderoso que existe)", chance:100, qty:"1" }
    ]
  },

  /* ══════════════════════════════════════════════════════════════
     NOVOS INIMIGOS — DIF 1 a 3
     Mecânicas únicas · Loot conectado ao compêndio existente
     ══════════════════════════════════════════════════════════════ */

  /* ── DIFICULDADE 1 ───────────────────────────────────────────── */

  {
    id: "tecelao-de-teias-menor",
    name: "Tecelão de Teias",
    difficulty: 1,
    attrs: { FOR:1, DEX:3, AGI:3, INT:1, SAB:2 },
    size: "pequeno",
    category: "Besta / Aracnídeo",
    location: ["Floresta", "Caverna", "Ruínas"],
    hp: 28, physDefense: 2, magDefense: 1, dodge: 13, actions: 2,
    damage: "1d6+1d4 (mordida) ou teia (sem dano)",
    abilities: [
      { name: "Teia de Contenção",
        desc: "1 Ação: lança teia em 1 alvo até 4 hex. O alvo testa AGI (normal) ou fica Preso por 2 rodadas (FOR normal + 1 Ação para escapar). O hex fica com teia permanente: qualquer criatura que entrar testa AGI ou fica Presa também." },
      { name: "Rede de Fuga",
        desc: "Passivo: pode se mover através de hexes com teia sem custo de Movimento (a própria teia acelera). Se houver 3+ hexes com teia no campo, o Tecelão pode teleportar entre eles como Ação Livre 1x por turno." },
      { name: "Instinto de Bando",
        desc: "Passivo: se houver outro Tecelão vivo no combate, ambos ganham +1 Chance de Acerto e +1d4 de dano. Tecelões raramente aparecem sozinhos." }
    ],
    spells: [],
    behavior: "Aparece em grupos de 2-4. Prioriza prender o alvo mais rápido do grupo (maior AGI) antes de atacar. Recua para hexes com teia quando ferido. Nunca ataca em melee direto se puder prender antes.",
    loot: [
      { item: "Teia Endurecida (material — receita de Armadura Tecida do Abismo)", chance:60, qty:"1d2" },
      { item: "Glândula de Seda (material comum — usado em Artesanato Geral)", chance:75, qty:"1d3" },
      { item: "Pergaminho de Magia: Orbe Congelante (nv1)", chance:15, qty:"1" }
    ]
  },

  {
    id: "acolito-faiscante",
    name: "Acólito Faiscante",
    difficulty: 1,
    attrs: { FOR:1, DEX:2, AGI:2, INT:3, SAB:2 },
    size: "medio",
    category: "Humanoide / Conjurador",
    location: ["Cidade", "Ruínas", "Estrada"],
    hp: 26, physDefense: 1, magDefense: 4, dodge: 12, actions: 2,
    damage: "1d6+INT (faísca arcana, alcance 5 hex)",
    abilities: [
      { name: "Faísca em Cadeia Menor",
        desc: "1 Ação de Magia (3x/combate): dispara faísca que ricocheteia entre até 2 alvos (saltos de 3 hex). Cada alvo sofre 1d6+INT. Versão simplificada de Faísca Ricochete — o Acólito ainda está aprendendo." },
      { name: "Escudo Estático",
        desc: "Passivo: enquanto tiver 50%+ de HP, o Acólito tem um campo estático. Atacantes melee sofrem 1d4 de dano elétrico ao acertá-lo. Abaixo de 50% HP o campo colapsa." },
      { name: "Fuga Relâmpago",
        desc: "Reação (1x/combate): ao receber dano que o reduziria abaixo de 30% HP, teleporta-se até 4 hex para longe do atacante. Não pode ser usado se estiver Preso ou Imobilizado." }
    ],
    spells: [],
    behavior: "Mantém distância de 4-5 hex. Usa Faísca em Cadeia quando 2+ inimigos estão agrupados. Foge ao ficar ferido. Se acuado, ataca desesperadamente em melee (com penalidade).",
    loot: [
      { item: "Pergaminho de Magia: Faísca Ricochete (nv1)", chance:45, qty:"1" },
      { item: "Cristal de Foco Menor (material — componente de crafting arcano)", chance:60, qty:"1d2" },
      { item: "Amuleto do Conjurador Ágil (acessório raro)", chance:12, qty:"1" }
    ]
  },

  {
    id: "guardiao-totem-antigo",
    name: "Guardião de Totem Antigo",
    difficulty: 1,
    attrs: { FOR:2, DEX:1, AGI:1, INT:1, SAB:3 },
    size: "medio",
    category: "Construto / Espírito",
    location: ["Ruínas", "Floresta", "Templo"],
    hp: 34, physDefense: 4, magDefense: 3, dodge: 9, actions: 1,
    damage: "1d8+1d4 (golpe de madeira encantada)",
    abilities: [
      { name: "Vínculo com o Totem",
        desc: "Passivo: o Guardião está vinculado a um Totem de madeira num hex fixo do mapa (o Mestre define). Enquanto o Totem existir (15 HP, Def.Física 3), o Guardião regenera 3 HP por rodada. Destruir o Totem interrompe a regeneração permanentemente." },
      { name: "Chamado de Raízes",
        desc: "1 Ação (2x/combate): raízes brotam em raio 2 hex ao redor do Totem. Inimigos na área testam AGI (normal) ou ficam Imobilizados por 1 rodada." },
      { name: "Último Guardião",
        desc: "Se o Totem for destruído: o Guardião entra em fúria — +1 Ação de combate e +1d6 de dano pelo restante do combate, mas perde toda a regeneração." }
    ],
    spells: [],
    behavior: "Nunca se afasta mais de 4 hex do seu Totem. Prioriza atacar quem se aproxima do Totem. Se o Totem for atacado, ignora todos os outros alvos e foca no atacante.",
    loot: [
      { item: "Pergaminho de Magia: Totem de Chamas Menor (nv1)", chance:40, qty:"1" },
      { item: "Madeira de Totem Antigo (material — usado em cajados e totens)", chance:70, qty:"1d3" },
      { item: "Talismã do Guardião de Pedra (acessório raro)", chance:15, qty:"1" }
    ]
  },

  /* ── DIFICULDADE 2 ───────────────────────────────────────────── */

  {
    id: "marcador-de-presas",
    name: "Marcador de Presas",
    difficulty: 2,
    attrs: { FOR:2, DEX:4, AGI:3, INT:2, SAB:3 },
    size: "medio",
    category: "Humanoide / Caçador",
    location: ["Floresta", "Planície", "Estrada"],
    hp: 72, physDefense: 4, magDefense: 3, dodge: 12, actions: 2,
    damage: "1d10+1d4 (besta pesada, alcance 6 hex)",
    abilities: [
      { name: "Marca de Caça",
        desc: "Ação Livre (1x/turno): marca 1 alvo visível em até 8 hex por 4 rodadas. O alvo marcado recebe +25% de dano de TODOS os inimigos no combate e não pode se tornar invisível. Se o alvo marcado morrer, a marca salta automaticamente para o inimigo vivo mais próximo." },
      { name: "Tiro Preparado",
        desc: "Passivo: se o Marcador não se mover no turno, o próximo tiro tem +2 Chance de Acerto e +1d8 de dano. Ele prefere posições fixas elevadas." },
      { name: "Recuo Calculado",
        desc: "Reação: se um inimigo entrar em hex adjacente, o Marcador recua 3 hex sem gastar Ação e dispara um tiro reflexo (1d10, sem bônus). 2x por combate." }
    ],
    spells: [],
    behavior: "Posiciona-se a 6-8 hex do grupo, preferindo elevação. Marca o alvo com maior dano do grupo e mantém a marca ativa. Recua se pressionado. Nunca engaja em melee voluntariamente.",
    loot: [
      { item: "Pergaminho de Magia: Marca do Caçador (nv2)", chance:50, qty:"1" },
      { item: "Besta Pesada de Caça (arma rara — 1d10, alcance 6 hex)", chance:35, qty:"1" },
      { item: "Capa Furtiva do Caçador (acessório raro)", chance:25, qty:"1" },
      { item: "Virotes Marcadores (consumível — 1d6 unidades, aplicam Marca por 2 rodadas)", chance:65, qty:"1d6" }
    ]
  },

  {
    id: "profanador-de-solo",
    name: "Profanador de Solo",
    difficulty: 2,
    attrs: { FOR:2, DEX:2, AGI:1, INT:4, SAB:3 },
    size: "medio",
    category: "Humanoide / Cultista",
    location: ["Cemitério", "Pântano", "Ruínas"],
    hp: 78, physDefense: 3, magDefense: 7, dodge: 10, actions: 2,
    damage: "1d8+INT (toque corrompido, ignora Def.Física)",
    abilities: [
      { name: "Terreno Profanado",
        desc: "1 Ação de Magia (3x/combate): corrompe área de raio 2 hex por 5 rodadas. Inimigos dentro sofrem 1d6 no início do turno e recebem −1d4 em testes. O Profanador e aliados corrompidos ganham +1d4 em resistências dentro da área. Conjurações adjacentes ESTENDEM a área em vez de criar nova." },
      { name: "Alimentado pela Corrupção",
        desc: "Passivo: enquanto estiver dentro de uma área de Terreno Profanado (própria ou de aliado), regenera 4 HP por rodada e ganha +1 Ação de Magia." },
      { name: "Colapso do Solo",
        desc: "Ativo (1x/combate): toda a área profanada explode. Todos os inimigos dentro sofrem 2d8+INT e testam AGI (difícil) ou ficam Derrubados. A área é consumida (deixa de existir)." }
    ],
    spells: [],
    behavior: "Começa profanando o terreno onde está. Expande a área a cada turno em direção ao grupo. Fica sempre dentro da própria corrupção. Usa Colapso do Solo quando 3+ inimigos estão na área ou quando abaixo de 30% HP.",
    loot: [
      { item: "Pergaminho de Magia: Terreno Profanado (nv2)", chance:55, qty:"1" },
      { item: "Essência de Morto-vivo (material raro)", chance:60, qty:"1d2" },
      { item: "Símbolo de Jurgmund Corrompido (acessório raro)", chance:20, qty:"1" },
      { item: "Solo Profanado Cristalizado (material — componente de magia de área)", chance:70, qty:"1d3" }
    ]
  },

  {
    id: "portador-de-aura",
    name: "Portador de Aura",
    difficulty: 2,
    attrs: { FOR:3, DEX:2, AGI:2, INT:3, SAB:4 },
    size: "medio",
    category: "Humanoide / Suporte",
    location: ["Cidade", "Templo", "Dungeon"],
    hp: 80, physDefense: 5, magDefense: 6, dodge: 11, actions: 2,
    damage: "1d8+1d4 (maça abençoada)",
    abilities: [
      { name: "Aura de Ódio",
        desc: "Passivo permanente: aura de raio 3 hex centrada no Portador, que se move com ele. TODOS os aliados dentro causam +1d6 de dano elemental adicional em todos os ataques. A aura não pode ser dissipada — apenas matar o Portador a encerra." },
      { name: "Alternar Aura",
        desc: "Ação Livre (1x/turno): troca a aura ativa. Opções: Aura de Ódio (+1d6 dano aliados), Aura de Determinação (+2 Def.Física aliados), Aura de Velocidade (+2 hex Movimento aliados). Apenas 1 aura ativa por vez." },
      { name: "Prioridade Tática",
        desc: "Passivo: o Portador sempre se posiciona no centro do grupo inimigo, maximizando cobertura da aura. Aliados o protegem instintivamente: ataques contra o Portador têm −1 Chance de Acerto enquanto houver 2+ aliados adjacentes a ele." }
    ],
    spells: [],
    behavior: "Nunca lidera o ataque. Fica no centro do grupo. Alterna auras conforme a situação (Ódio quando o grupo ataca, Determinação quando sob pressão). Foge se ficar sozinho.",
    loot: [
      { item: "Pergaminho de Magia: Aura de Ódio (nv2)", chance:50, qty:"1" },
      { item: "Símbolo de Aura (acessório raro — permite manter 1 aura sem custo de MP por 3 rodadas)", chance:30, qty:"1" },
      { item: "Amuleto da Memória de Batalha (acessório raro)", chance:20, qty:"1" },
      { item: "Óleo de Canalização (consumível — próxima magia custa −2 MP, 1d3 doses)", chance:65, qty:"1d3" }
    ]
  },

  {
    id: "espectro-de-corrente",
    name: "Espectro de Corrente",
    difficulty: 2,
    attrs: { FOR:1, DEX:4, AGI:4, INT:3, SAB:3 },
    size: "medio",
    category: "Morto-vivo / Espírito",
    location: ["Cemitério", "Ruínas", "Dungeon"],
    hp: 68, physDefense: 2, magDefense: 9, dodge: 13, actions: 3,
    damage: "1d8+INT (descarga espectral, ignora Def.Física)",
    abilities: [
      { name: "Corrente Espectral",
        desc: "1 Ação (3x/combate): descarga que salta entre até 3 alvos (saltos de 3 hex). 1d8+INT no primeiro, 1d6 no segundo, 1d4 no terceiro. Cada alvo testa INT (normal) ou perde 1 Ação no próximo turno (a descarga interfere na concentração)." },
      { name: "Fase Parcial",
        desc: "Passivo: 30% de chance (d10 ≤ 3) de que qualquer ataque físico simplesmente atravesse o Espectro sem causar dano. Magias sempre acertam normalmente." },
      { name: "Ressonância de Grupo",
        desc: "Passivo: se houver 2+ Espectros de Corrente no combate, eles compartilham dano — o dano é dividido igualmente entre todos. Matar um libera a divisão para os restantes." }
    ],
    spells: [],
    behavior: "Aparece em duplas ou trios. Move-se erraticamente (nunca em linha reta). Usa Corrente Espectral quando o grupo está agrupado. Prioriza conjuradores (que dependem de concentração).",
    loot: [
      { item: "Pergaminho de Magia: Corrente de Gelo (nv2)", chance:45, qty:"1" },
      { item: "Essência de Fantasma (material — Água Transiente)", chance:70, qty:"1d3" },
      { item: "Anel do Eco de Sangue (acessório raro)", chance:18, qty:"1" },
      { item: "Fragmento de Corrente Espectral (material — encanta arma com dano em cadeia)", chance:40, qty:"1" }
    ]
  },

  /* ── DIFICULDADE 3 ───────────────────────────────────────────── */

  {
    id: "mestre-de-totens",
    name: "Mestre de Totens",
    difficulty: 3,
    attrs: { FOR:2, DEX:3, AGI:2, INT:5, SAB:4 },
    size: "medio",
    category: "Humanoide / Xamã",
    location: ["Floresta", "Montanha", "Ruínas"],
    hp: 145, physDefense: 5, magDefense: 10, dodge: 11, actions: 2,
    damage: "1d8+INT (bastão xamânico) — mas raramente ataca diretamente",
    abilities: [
      { name: "Invocar Totem",
        desc: "1 Ação de Magia (por turno, sem limite): crava um totem em hex visível até 5 hex. Cada totem: 25 HP, Def.Física 4, dura até ser destruído. Tipos (o Mestre escolhe): Totem de Chamas (1d8+INT fogo por rodada em raio 5), Totem de Cura (cura 1d8 em 1 aliado por rodada), Totem de Barreira (aliados adjacentes ganham +3 Def.Física). Máximo 3 totens ativos." },
      { name: "Rede de Totens",
        desc: "Passivo: se houver 3 totens ativos formando um triângulo, todos os inimigos DENTRO do triângulo sofrem 2d6 de dano no início de cada turno e recebem −2 na Chance de Esquiva. Os jogadores podem quebrar a rede destruindo qualquer totem." },
      { name: "Transferência Vital",
        desc: "Reação (2x/combate): ao receber dano letal, transfere-o para um totem ativo — o totem é destruído e o Mestre sobrevive com 1 HP. Se não houver totens, a habilidade falha." },
      { name: "Fúria dos Ancestrais",
        desc: "Ativo (1x/combate): todos os totens ativos explodem simultaneamente. Cada totem causa 2d8 em raio 2 hex ao redor de si. O Mestre não pode invocar novos totens por 2 rodadas após usar." }
    ],
    spells: [],
    behavior: "Turno 1: invoca 2 totens imediatamente. Turno 2: invoca o terceiro formando triângulo ao redor do grupo. Depois: repõe totens destruídos prioritariamente. Recua constantemente, nunca fica adjacente. Usa Fúria dos Ancestrais quando abaixo de 25% HP.",
    loot: [
      { item: "Pergaminho de Magia: Totem de Ancestral (nv3)", chance:55, qty:"1" },
      { item: "Bastão do Mestre de Totens (arma 2M rara — permite invocar 1 totem por combate)", chance:35, qty:"1" },
      { item: "Madeira de Totem Antigo (material)", chance:80, qty:"2d3" },
      { item: "Colar de Vínculo Ancestral (acessório raro — INT+1, totens invocados duram +2 rodadas)", chance:25, qty:"1" }
    ]
  },

  {
    id: "arauto-da-vulnerabilidade",
    name: "Arauto da Vulnerabilidade",
    difficulty: 3,
    attrs: { FOR:3, DEX:3, AGI:2, INT:5, SAB:5 },
    size: "medio",
    category: "Humanoide / Amaldiçoador",
    location: ["Dungeon", "Templo", "Cemitério"],
    hp: 152, physDefense: 6, magDefense: 12, dodge: 10, actions: 3,
    damage: "1d10+INT (maldição direcionada, ignora Def.Física)",
    abilities: [
      { name: "Vulnerabilidade",
        desc: "1 Ação de Magia (2x/combate): maldição em raio 4 hex por 4 rodadas. Todos os inimigos na área: Def.Física reduzida pela METADE, +50% de dano de sangramento e veneno, e não podem curar acima de 50% do HP máximo. Novos alvos que entrarem na área são afetados imediatamente." },
      { name: "Amplificação de Maldição",
        desc: "Passivo: cada inimigo sob efeito de qualquer maldição (Vulnerabilidade, Marca, Corrompido, Envenenado) dá +1d6 de dano aos ataques do Arauto contra ele. Cumulativo: 3 condições = +3d6." },
      { name: "Colheita de Fraqueza",
        desc: "1 Ação (2x/combate): ataca 1 alvo amaldiçoado. Se acertar: rouba 1d10 HP do alvo e cura o Arauto na mesma quantidade. Se o alvo tiver 2+ maldições ativas: rouba 2d10." },
      { name: "Manto de Maldições",
        desc: "Passivo: ao atingir 40% de HP, todas as maldições ativas no campo se intensificam — duração renovada e efeitos aumentados em 50%. Ocorre 1x por combate." }
    ],
    spells: [],
    behavior: "Turno 1: lança Vulnerabilidade sobre o grupo agrupado. Depois: alterna entre Colheita de Fraqueza no alvo mais amaldiçoado e ataques normais. Mantém distância 4-6 hex. Renova Vulnerabilidade assim que expira.",
    loot: [
      { item: "Pergaminho de Magia: Vulnerabilidade (nv3)", chance:50, qty:"1" },
      { item: "Cetro do Arauto (arma rara — 1d10, acertos aplicam Vulnerabilidade menor por 1 rodada)", chance:35, qty:"1" },
      { item: "Cristal de Maldição (acessório raro — INT+1, maldições duram +1 rodada)", chance:30, qty:"1" },
      { item: "Fragmento de Maldição (material lendário)", chance:20, qty:"1" }
    ]
  },

  {
    id: "senhor-do-campo-estatico",
    name: "Senhor do Campo Estático",
    difficulty: 3,
    attrs: { FOR:3, DEX:4, AGI:3, INT:5, SAB:3 },
    size: "medio",
    category: "Humanoide / Elementalista",
    location: ["Montanha", "Dungeon", "Planície"],
    hp: 140, physDefense: 5, magDefense: 11, dodge: 12, actions: 3,
    damage: "1d10+INT (descarga direcionada, alcance 6 hex)",
    abilities: [
      { name: "Campo Estático",
        desc: "1 Ação de Magia (2x/combate): cria campo elétrico de raio 3 hex por 5 rodadas. Inimigos que se MOVEREM dentro do campo sofrem 1d8 por hex movido. Inimigos que ficarem PARADOS testam INT (normal) ou perdem 1 Ação por rodada. O Senhor e aliados são imunes ao próprio campo." },
      { name: "Dilema Elétrico",
        desc: "Passivo: enquanto houver um Campo Estático ativo, o Senhor ganha +2 Ações de combate. Ele força o grupo a escolher entre se mover (sofrer dano) ou ficar parado (perder ações) — e lucra com ambos." },
      { name: "Passo Relâmpago",
        desc: "Ação Livre (3x/combate): teleporta-se até 6 hex em linha reta. Todos os inimigos nos hexes atravessados sofrem 1d8+INT (AGI normal para metade). Pode terminar dentro do próprio campo estático sem sofrer dano." },
      { name: "Sobrecarga Final",
        desc: "Ao morrer: todos os Campos Estáticos ativos explodem. Todos os inimigos em raio 4 hex de cada campo sofrem 3d8 de dano elétrico (sem teste de resistência)." }
    ],
    spells: [],
    behavior: "Turno 1: cria Campo Estático sobre o grupo. Usa Passo Relâmpago para reposicionar e criar segundo campo em ângulo diferente. Ataca de dentro dos próprios campos. Nunca fica adjacente por mais de 1 turno.",
    loot: [
      { item: "Pergaminho de Magia: Campo Estático (nv3)", chance:50, qty:"1" },
      { item: "Pergaminho de Magia: Passo Relâmpago (nv2)", chance:40, qty:"1" },
      { item: "Cinto da Sobrecarga Controlada (acessório raro)", chance:30, qty:"1" },
      { item: "Núcleo Estático (material raro — encanta arma com dano elétrico em cadeia)", chance:45, qty:"1" }
    ]
  },

  {
    id: "coletor-de-espectros",
    name: "Coletor de Espectros",
    difficulty: 3,
    attrs: { FOR:2, DEX:3, AGI:2, INT:5, SAB:5 },
    size: "medio",
    category: "Humanoide / Necromante",
    location: ["Cemitério", "Dungeon", "Ruínas"],
    hp: 138, physDefense: 4, magDefense: 12, dodge: 10, actions: 2,
    damage: "1d8+INT (drenagem espectral, ignora Def.Física)",
    abilities: [
      { name: "Colheita de Almas",
        desc: "Passivo: sempre que qualquer criatura morre no combate (aliada ou inimiga), o Coletor absorve a alma. Cada alma coletada: +1d6 de dano em todos os ataques e +5 HP máximo (cumulativo, sem limite). As almas são perdidas ao fim do combate." },
      { name: "Convocação de Espectros",
        desc: "1 Ação de Magia (custa 2 almas coletadas): invoca 1 Espectro de um inimigo derrotado no combate. O Espectro tem 50% do HP original, mantém 1 habilidade do monstro original e dura 5 rodadas. Máximo 3 Espectros ativos." },
      { name: "Sacrifício Espectral",
        desc: "Ação Livre (sem limite): destrói 1 Espectro ativo para curar 2d10 HP ou recuperar 1 Ação imediatamente. O Espectro se dissolve." },
      { name: "Legião Final",
        desc: "Ao atingir 20% de HP: converte TODAS as almas coletadas em Espectros simultaneamente (1 Espectro por alma, máximo 6). Os Espectros duram 3 rodadas. O Coletor fica com 1 HP e não pode ser curado — mas ganha +3 Ações por turno." }
    ],
    spells: [],
    behavior: "Fica atrás dos próprios aliados, deixando-os morrer para coletar almas. Invoca Espectros assim que tem 2 almas. Sacrifica Espectros quando ferido. Usa Legião Final como último recurso — o combate fica caótico.",
    loot: [
      { item: "Pergaminho de Magia: Convocação de Espectros (nv4)", chance:40, qty:"1" },
      { item: "Frasco de Alma Aprisionada (item único)", chance:70, qty:"1d2" },
      { item: "Ceifador (Manto do Necromante) (arma mágica)", chance:25, qty:"1" },
      { item: "Essência de Morto-vivo (material raro)", chance:75, qty:"1d3" }
    ]
  },

  {
    id: "duelista-do-eco",
    name: "Duelista do Eco",
    difficulty: 3,
    attrs: { FOR:4, DEX:5, AGI:4, INT:2, SAB:3 },
    size: "medio",
    category: "Humanoide / Guerreiro",
    location: ["Cidade", "Dungeon", "Estrada"],
    hp: 150, physDefense: 7, magDefense: 5, dodge: 13, actions: 3,
    damage: "1d10+1d6 (espada do eco) — ver Eco de Golpe",
    abilities: [
      { name: "Eco de Golpe",
        desc: "Passivo: todo ataque do Duelista é ecoado 1 rodada depois. Se ele ataca no turno 1, o mesmo ataque (mesmo alvo, mesmo dano) se repete automaticamente no início do turno 2, sem gastar Ação. Os ecos acumulam: 3 ataques no turno 1 = 3 ecos no turno 2, mais os novos ataques do turno 2." },
      { name: "Duelo Declarado",
        desc: "Ação Livre (1x/combate): declara duelo contra 1 alvo. Contra esse alvo: +3 Chance de Crítico e +2 Chance de Acerto. Contra todos os outros: −3 Chance de Acerto. O duelo dura até um dos dois morrer." },
      { name: "Paradas Sucessivas",
        desc: "Reação (2x/turno): ao ser atacado em melee, pode aparar — role d10, se ≤ 5 o ataque é completamente bloqueado e o Duelista contra-ataca imediatamente (1d10+1d6, sem custo de Ação)." },
      { name: "Eco Final",
        desc: "Ao morrer: todos os ecos pendentes são disparados simultaneamente contra os alvos originais. Se ele tinha 4 ecos pendentes, todos acontecem de uma vez." }
    ],
    spells: [],
    behavior: "Declara Duelo contra o personagem de maior dano imediatamente. Foca exclusivamente nesse alvo. Usa Paradas agressivamente. O ritmo de combate é enganoso — o dano real chega 1 rodada atrasado.",
    loot: [
      { item: "Espada do Eco Duplo (arma rara)", chance:45, qty:"1" },
      { item: "Elmo do Reflexo Rápido (acessório raro)", chance:30, qty:"1" },
      { item: "Anel da Ação Dupla (acessório raro)", chance:20, qty:"1" },
      { item: "Fragmento de Eco (material — encanta arma para ecoar 1 ataque por combate)", chance:50, qty:"1" }
    ]
  }];

/* ================================================================
   MONTARIAS — Sistema de Montaria do Mundo de Aether
   tier: fraco | normal | forte
   Carga: fraco=25kg, normal=50kg, forte=75kg
   ================================================================ */

const MOUNTS = [
  {
    id: "mula",
    name: "Mula",
    icon: "🫏",
    species: "Mula",
    tier: "fraco",
    carryKg: 25,
    speed: 4,
    travel: "terrestre",
    magic: false,
    encounterMod: 0,
    cost: { prata: 15 },
    description: "Animal de carga resistente e teimoso. Não cansa em terrenos difíceis mas é lenta em planícies abertas.",
    traits: ["Terreno Difícil: sem penalidade de velocidade em lama, pedras ou montanha", "Não entra em pânico com cheiros fortes"],
    weakness: "Velocidade máxima 4 — nunca aumenta por bônus."
  },
  {
    id: "cavalo",
    name: "Cavalo de Guerra",
    icon: "🐴",
    species: "Cavalo",
    tier: "normal",
    carryKg: 50,
    speed: 7,
    travel: "terrestre",
    magic: false,
    encounterMod: 0,
    cost: { ouro: 3 },
    description: "Montaria padrão dos guerreiros e viajantes de Aether. Versátil e confiável em planícies e estradas.",
    traits: ["Carga de Cavalaria: se o portador atacar no mesmo turno em que o cavalo mover 3+ hexes, +1d6 de dano", "Pode ser equipado com armadura de cavalo (+2 Def.Física para o cavalo)"],
    weakness: "−2 de velocidade em terreno montanhoso ou floresta densa."
  },
  {
    id: "ave-atrelon",
    name: "Ave de Atrelon",
    icon: "🦅",
    species: "Ave de Atrelon",
    tier: "normal",
    carryKg: 50,
    speed: 6,
    travel: "terrestre_voador",
    magic: false,
    encounterMod: +1,
    cost: { ouro: 8 },
    description: "Grande ave das Montanhas de Atrelon, treinada por serpentarianos. Pode voar por distâncias curtas e escalar terrenos verticais.",
    traits: ["Voo Curto: pode voar até 5 hexes em linha reta por Ação (não carregando jinete pesado — até 60kg total)", "Escalar: sobe paredes e penhascos a velocidade normal", "Altitude: pode sobrevoar a 6m de altura, ignorando terreno"],
    weakness: "Atrai predadores voadores (Grifo, Harpia) — +1 de encontro em montanhas. Não voa sob chuva forte."
  },
  {
    id: "lagarto-sabaht",
    name: "Lagarto de Sabaht",
    icon: "🦎",
    species: "Lagarto de Sabaht",
    tier: "normal",
    carryKg: 50,
    speed: 5,
    travel: "terrestre_aquatico",
    magic: false,
    encounterMod: -1,
    cost: { ouro: 5 },
    description: "Lagarto robusto criado no Deserto Carmesim. Camuflagem natural, pode nadar e não atrai a atenção de criaturas selvagens.",
    traits: ["Camuflagem Passiva: grupo tem −1 em encontros com bestas selvagens enquanto estiver montado", "Natação: velocidade 4 em rios e lagos, pode mergulhar brevemente (3 rodadas)", "Resistência ao Calor: sem penalidade no Deserto Carmesim"],
    weakness: "Velocidade reduzida para 3 em ambientes frios (abaixo de 10°C). Não funciona em neve."
  },
  {
    id: "rinodonte",
    name: "Rinodonte",
    icon: "🦏",
    species: "Rinodonte",
    tier: "forte",
    carryKg: 75,
    speed: 5,
    travel: "terrestre",
    magic: false,
    encounterMod: +2,
    cost: { ouro: 12 },
    description: "Enorme besta blindada das Grandes Planícies. Aterrorizante, pode ser usada como arma de assalto em batalha. Atrai atenção de qualquer criatura no caminho.",
    traits: ["Carga de Ruptura: se mover 4+ hexes em linha reta, derruba automaticamente qualquer criatura de tamanho normal ou menor no caminho (FOR difícil para resistir)", "Couro Blindado: o Rinodonte tem 8 de Def.Física natural — pode ser montado em combate com segurança relativa", "Intimidação de Grupo: inimigos em raio 4 hex devem testar SAB (normal) ou ficam com −1d4 em ataques no primeiro turno"],
    weakness: "Muito barulhento — +2 de chance de encontro em viagem. Não entra em cavernas ou florestas densas."
  },
  {
    id: "grande-falcao",
    name: "Grande Falcão",
    icon: "🦆",
    species: "Grande Falcão",
    tier: "fraco",
    carryKg: 25,
    speed: 9,
    travel: "voador",
    magic: false,
    encounterMod: 0,
    cost: { ouro: 6 },
    description: "Falcão gigante capaz de carregar um jinete leve. Extremamente rápido em linha reta, ideal para reconhecimento e rotas aéreas. Carga limitada.",
    traits: ["Voo Completo: velocidade 9 no ar, ignora todo terreno terrestre", "Mergulho de Caça: se descer de altitude e atacar, +2d6 de dano no primeiro ataque do turno", "Altitude Máxima: pode voar a até 50m — fora do alcance da maioria dos arqueiros"],
    weakness: "Carga máxima 25kg — impossível carregar jinete com armadura pesada (+20kg). Não pode decolar em espaços fechados."
  },
  {
    id: "slipner",
    name: "Slipner",
    icon: "⚡",
    species: "Slipner",
    tier: "normal",
    carryKg: 50,
    speed: 12,
    travel: "terrestre",
    magic: true,
    encounterMod: -1,
    cost: { ouro: 20 },
    description: "Criatura mágica de origem desconhecida — parece um cavalo feito de névoa prateada com patas que mal tocam o chão. Rarissimo. Viaja a velocidade sobre-humana e aparece quando chamado.",
    traits: ["Velocidade Absurda: velocidade 12 — o dobro de qualquer montaria comum. Em estrada aberta: pode percorrer o dobro da distância diária", "Invocação: responde a um assobio específico em até 1km de distância. Aparece em 1d4 minutos", "Passagem Suave: não levanta poeira, não faz barulho — −1 de encontro em viagem", "Imune a Medo: não entra em pânico com magia ou monstros"],
    weakness: "Não pode ser comprado — deve ser encontrado, conquistado ou recebido como recompensa. Desaparece se maltratar."
  }
];


/* ═══════════════════════════════════════════════════════════════
   RECEITAS DE ALQUIMIA
   Cada receita é um item do tipo "recipe" que o personagem aprende
   ao usar/equipar um Pergaminho de Receita correspondente.
   ═══════════════════════════════════════════════════════════════ */

const ALCHEMY_RECIPES = [

  /* ── CURAS ─────────────────────────────────────────────────── */
  { id:"rec_cura_menor",
    name:"Poção de Cura Menor",
    icon:"🧪", tier:"comum", category:"cura",
    ingredients:[
      { tag:"erva_cura_menor", qty:2, label:"Erva de Cura Menor ×2" },
      { tag:"agua_arcana",     qty:1, label:"Água Destilada Arcana ×1" }
    ],
    skillTest: { attr:"INT", difficulty:"normal" },
    baseEffect:"Cura 2d6+2 HP ao beber.",
    critBonus:[
      "Também remove 1 condição de veneno.",
      "Cura 3d6+4 HP em vez do normal.",
      "O efeito persiste: +1d4 HP no turno seguinte.",
    ],
    critFailEffect:[
      "Cura apenas 1 HP — poção diluída demais.",
      "Causa 1d4 de náusea (−1 Ação por 1 rodada).",
      "Provoca sono leve: próxima Iniciativa com −2.",
    ],
    weight:0.3, story:"A mais básica de todas as poções. Cheiro de mel e algo metálico." },

  { id:"rec_cura_media",
    name:"Poção de Cura",
    icon:"🧪", tier:"comum", category:"cura",
    ingredients:[
      { tag:"raiz_cura",       qty:2, label:"Raiz de Cura ×2" },
      { tag:"erva_cura_menor", qty:1, label:"Erva de Cura Menor ×1" },
      { tag:"agua_arcana",     qty:1, label:"Água Destilada Arcana ×1" }
    ],
    skillTest: { attr:"INT", difficulty:"normal" },
    baseEffect:"Cura 3d8+4 HP ao beber.",
    critBonus:[
      "Também cura Sangramento e Veneno comuns.",
      "Cura 4d10+6 HP em vez do normal.",
      "Concede +1d4 HP de regeneração por 2 rodadas.",
    ],
    critFailEffect:[
      "Cura 1d4 HP apenas (instável).",
      "Causa enjôo: −1d4 em ataques por 2 rodadas.",
      "Efeito invertido: perde 1d6 HP (reação alérgica).",
    ],
    weight:0.3, story:"Vermelho escuro e levemente brilhante. Tem sabor de ferro." },

  { id:"rec_cura_veneno",
    name:"Antídoto Aprimorado",
    icon:"💚", tier:"comum", category:"cura",
    ingredients:[
      { tag:"glandula_veneno_cobra", qty:1, label:"Glândula de Veneno (Cobra) ×1" },
      { tag:"flor_pantano",          qty:1, label:"Flor do Pântano Cinzento ×1" },
      { tag:"agua_arcana",           qty:1, label:"Água Destilada Arcana ×1" }
    ],
    skillTest: { attr:"INT", difficulty:"normal" },
    baseEffect:"Remove todos os venenos comuns (Dif.1-2). Restaura SAB temporária perdida por veneno.",
    critBonus:[
      "Também remove venenos Dif.3 e paralisia de veneno.",
      "Concede imunidade a venenos Dif.1-2 por 4 horas.",
      "Cura também 2d6 HP de dano de veneno acumulado.",
    ],
    critFailEffect:[
      "Remove apenas 1 carga de veneno (incompleto).",
      "O veneno muda — ainda ativo mas diferente (Mestre decide).",
      "Causa coceira intensa: −1d4 em Furtividade por 1 hora.",
    ],
    weight:0.2, story:"Verde pálido. Amargo ao extremo. Funciona mesmo assim." },

  { id:"rec_purificacao",
    name:"Poção de Purificação",
    icon:"✨", tier:"raro", category:"cura",
    ingredients:[
      { tag:"flor_pantano",    qty:2, label:"Flor do Pântano Cinzento ×2" },
      { tag:"po_osso_sagrado", qty:1, label:"Pó de Osso Sagrado ×1" },
      { tag:"agua_arcana",     qty:1, label:"Água Destilada Arcana ×1" }
    ],
    skillTest: { attr:"SAB", difficulty:"normal" },
    baseEffect:"Remove maldições menores e médias. Remove todas as condições negativas (veneno, sangramento, paralisação, medo).",
    critBonus:[
      "Remove também maldições maiores (normalmente exige rituais).",
      "Concede +1d6 em todos os testes por 1 hora (pureza de corpo e mente).",
      "Cura 4d8 HP adicionalmente.",
    ],
    critFailEffect:[
      "Remove apenas 1 condição aleatória.",
      "A maldição é empurrada — reaparece em 1d4 horas.",
      "Causa desorientação: Confuso por 1 rodada.",
    ],
    weight:0.3, story:"Branca com partículas douradas. Quente ao toque mesmo fria." },

  /* ── OFENSIVAS ──────────────────────────────────────────────── */
  { id:"rec_acido",
    name:"Frasco de Ácido",
    icon:"🟢", tier:"comum", category:"ofensiva",
    ingredients:[
      { tag:"acido_slime",  qty:2, label:"Ácido de Slime ×2" },
      { tag:"agua_arcana",  qty:1, label:"Água Destilada Arcana ×1" }
    ],
    skillTest: { attr:"INT", difficulty:"normal" },
    baseEffect:"Arremessado (alcance 4 hex, 1 Ação): 2d6 de dano ácido no alvo + −1 Def.Física por 2 rodadas.",
    critBonus:[
      "Também causa −1 Def.Física extra (total −2) por 3 rodadas.",
      "Respingo: alvo adjacente ao principal sofre 1d6 de ácido.",
      "Área 2x2 hex em vez de alvo único.",
    ],
    critFailEffect:[
      "Dano ácido apenas 1d4 (frasco mal selado).",
      "Explode na mão: 1d6 de dano no lançador.",
      "O frasco falha ao quebrar — não causa dano, apenas molha.",
    ],
    weight:0.2, story:"Verde viscoso. O frasco corrói levemente se não for de vidro grau alquímico." },

  { id:"rec_fogo",
    name:"Coquetel de Fogo",
    icon:"🔥", tier:"comum", category:"ofensiva",
    ingredients:[
      { tag:"pimenta_inferno", qty:2, label:"Pimenta do Inferno ×2" },
      { tag:"agua_arcana",     qty:1, label:"Água Destilada Arcana ×1" }
    ],
    skillTest: { attr:"INT", difficulty:"normal" },
    baseEffect:"Arremessado (alcance 4 hex, 1 Ação): 2d8 de dano de fogo. O hex pega fogo por 2 rodadas (1d4 de dano por rodada a quem estiver nele).",
    critBonus:[
      "Fogo persiste 3 rodadas. +1d6 de dano de fogo imediato.",
      "Cone 3 hex em vez de ponto único.",
      "Alvos atingidos ficam Queimando (1d4/rodada) independente da área.",
    ],
    critFailEffect:[
      "Fogo por apenas 1 rodada. Dano reduzido a 1d6.",
      "Explode no lançador: 1d8 de fogo.",
      "Falha ao acender — apenas cria fumaça, cega 1 hex por 1 rodada.",
    ],
    weight:0.2, story:"Laranja opaco, levemente fumegante. Não agitar." },

  { id:"rec_veneno_contato",
    name:"Veneno de Contato",
    icon:"💜", tier:"comum", category:"ofensiva",
    ingredients:[
      { tag:"glandula_veneno_cobra", qty:1, label:"Glândula de Veneno ×1" },
      { tag:"flor_pantano",          qty:1, label:"Flor do Pântano Cinzento ×1" },
      { tag:"agua_arcana",           qty:1, label:"Água Destilada Arcana ×1" }
    ],
    skillTest: { attr:"INT", difficulty:"normal" },
    baseEffect:"Aplica em arma (1 Ação). Próximo acerto: 1d6/rodada de veneno por 3 rodadas. SAB (normal) para resistir.",
    critBonus:[
      "Veneno dura 4 rodadas em vez de 3.",
      "SAB (difícil) para resistir em vez de normal.",
      "Também causa −1 DEX temporária por rodada (veneno motor).",
    ],
    critFailEffect:[
      "Veneno dura só 1 rodada.",
      "O veneno contamina a arma de forma adversa: −1 no próximo ataque.",
      "Respinga: o alquimista sofre 1d4 de veneno.",
    ],
    weight:0.15, story:"Roxo escuro. Inodoro. Por isso é perigoso." },

  { id:"rec_paralisia",
    name:"Poção de Paralisia",
    icon:"🔵", tier:"raro", category:"ofensiva",
    ingredients:[
      { tag:"glandula_paralisia", qty:1, label:"Glândula de Veneno Paralisante ×1" },
      { tag:"cogumelo_relampago", qty:1, label:"Cogumelo Relâmpago ×1" },
      { tag:"agua_arcana",        qty:1, label:"Água Destilada Arcana ×1" }
    ],
    skillTest: { attr:"INT", difficulty:"dificil" },
    baseEffect:"Lançado ou aplicado: alvo testea Resistência (difícil) ou fica Paralisado por 2 rodadas.",
    critBonus:[
      "Paralisado por 3 rodadas sem resistência.",
      "Resistência (crítico) em vez de difícil — quase impossível de resistir.",
      "Também causa −1d4 FOR temporária durante a paralisia.",
    ],
    critFailEffect:[
      "Paralisia apenas 1 rodada.",
      "Não paralisa — apenas Lento (−2 Mov, 2 rodadas).",
      "Efeito no lançador: Lento por 1 rodada.",
    ],
    weight:0.2, story:"Azul cristalino. Cheiro nenhum, sabor de água — impossível de detectar em bebida." },

  { id:"rec_acido_relampago",
    name:"Bomba de Relâmpago",
    icon:"⚡", tier:"raro", category:"ofensiva",
    ingredients:[
      { tag:"nucleo_relampago",  qty:1, label:"Núcleo de Relâmpago ×1" },
      { tag:"cogumelo_relampago",qty:1, label:"Cogumelo Relâmpago ×1" },
      { tag:"catalisador_cristal",qty:1,label:"Catalisador de Cristal ×1" }
    ],
    skillTest: { attr:"INT", difficulty:"dificil" },
    baseEffect:"Arremessado (alcance 5 hex, 1 Ação): 3d8 de dano elétrico em área 2x2 hex. AGI (normal) para metade. Armadura metálica: sem resistência.",
    critBonus:[
      "Encadeia: salta para inimigo a 2 hex do primeiro por 1d8 extra.",
      "AGI (difícil) para metade em vez de normal.",
      "Eletrocuta: alvos atingidos perdem 1 Ação no próximo turno.",
    ],
    critFailEffect:[
      "Explode no lançador: 1d8 elétrico.",
      "Dano reduzido: 1d6 apenas, sem encadeamento.",
      "Chicoteia aleatoriamente: atinge alvo aleatório em raio 3 hex.",
    ],
    weight:0.25, story:"Amarela e zumbindo levemente. Faíscas visíveis no vidro. Manuseio com luva de couro." },

  /* ── UTILIDADE ──────────────────────────────────────────────── */
  { id:"rec_invisibilidade",
    name:"Poção de Invisibilidade",
    icon:"👁️", tier:"raro", category:"utilidade",
    ingredients:[
      { tag:"erva_invisibilidade", qty:2, label:"Erva da Invisibilidade ×2" },
      { tag:"po_fada",             qty:1, label:"Pó de Fada ×1" },
      { tag:"agua_arcana",         qty:1, label:"Água Destilada Arcana ×1" }
    ],
    skillTest: { attr:"INT", difficulty:"dificil" },
    baseEffect:"Invisível por 3 rodadas (ou até atacar). Furtividade automática enquanto invisível.",
    critBonus:[
      "Invisível por 5 rodadas e não quebra ao atacar (1x).",
      "Também silencia os passos: Furtividade automática também por som.",
      "Concede ao portador +1d8 no primeiro ataque invisível.",
    ],
    critFailEffect:[
      "Invisível por 1 rodada apenas.",
      "Efeito parcial: apenas 50% visível (−1 na Chance de Acerto dos inimigos, não invisibilidade total).",
      "Efeito no lançador involuntariamente: aliado aleatório fica visível (luzes ao redor).",
    ],
    weight:0.2, story:"Incolor. Levemente brilhante no escuro. Se mantiver no bolso por dias, o bolso também some." },

  { id:"rec_velocidade",
    name:"Poção de Velocidade",
    icon:"💨", tier:"raro", category:"utilidade",
    ingredients:[
      { tag:"raiz_velocidade",    qty:2, label:"Raiz de Velocidade ×2" },
      { tag:"cogumelo_relampago", qty:1, label:"Cogumelo Relâmpago ×1" },
      { tag:"agua_arcana",        qty:1, label:"Água Destilada Arcana ×1" }
    ],
    skillTest: { attr:"INT", difficulty:"dificil" },
    baseEffect:"+1 Ação de Combate e +3 Movimento por 3 rodadas.",
    critBonus:[
      "+1 Ação de Combate e +1 Ação de Magia por 4 rodadas.",
      "Também ignora terreno difícil durante o efeito.",
      "+4 Movimento em vez de +3 e dura 4 rodadas.",
    ],
    critFailEffect:[
      "+1 Ação apenas, sem bônus de Movimento. Dura 1 rodada.",
      "Agitação: +1 Ação mas −1d4 em todos os testes de precisão.",
      "Efeito oposto: −1 Movimento por 2 rodadas (coração acelerado demais).",
    ],
    weight:0.2, story:"Amarela brilhante. Fica levemente quente durante o efeito. O coração acelera." },

  { id:"rec_forca",
    name:"Poção de Força",
    icon:"💪", tier:"comum", category:"utilidade",
    ingredients:[
      { tag:"escama_karlac",  qty:1, label:"Escama de Karlac Juvenil ×1" },
      { tag:"raiz_cura",      qty:1, label:"Raiz de Cura ×1" },
      { tag:"agua_arcana",    qty:1, label:"Água Destilada Arcana ×1" }
    ],
    skillTest: { attr:"INT", difficulty:"normal" },
    baseEffect:"+2 FOR temporária por 4 rodadas. Cada acerto físico causa +1d6 de dano extra.",
    critBonus:[
      "+3 FOR e +1d8 de dano extra. Dura 5 rodadas.",
      "Também concede +1 Ação de Combate durante o efeito.",
      "+2 FOR e imunidade a Derrubado durante o efeito.",
    ],
    critFailEffect:[
      "+1 FOR apenas por 2 rodadas. Sem bônus de dano.",
      "+2 FOR mas causa dor muscular: −1d4 em AGI temporariamente.",
      "Força descalibrada: próximo ataque é automático (acerta) mas dano é 1 (força demais, sem controle).",
    ],
    weight:0.3, story:"Vermelha escura e densa. Cheiro de sangue quente. Tem gosto de cobre." },

  { id:"rec_resistencia_fogo",
    name:"Elixir de Resistência ao Fogo",
    icon:"🔴", tier:"raro", category:"utilidade",
    ingredients:[
      { tag:"escama_karlac",   qty:1, label:"Escama de Karlac Juvenil ×1" },
      { tag:"pimenta_inferno", qty:2, label:"Pimenta do Inferno ×2" },
      { tag:"catalisador_cristal",qty:1,label:"Catalisador de Cristal ×1" }
    ],
    skillTest: { attr:"INT", difficulty:"dificil" },
    baseEffect:"Resistência a fogo por 10 minutos: todo dano de fogo reduzido à metade.",
    critBonus:[
      "Imunidade completa a fogo (em vez de metade) por 10 min.",
      "Resistência ao fogo dura 1 hora.",
      "Também concede resistência a calor extremo e dano de magma.",
    ],
    critFailEffect:[
      "Resistência só por 2 rodadas de combate.",
      "Sensibilidade ao frio: +1d4 de dano por dano de gelo durante o efeito.",
      "Causa calafrios: −1 em todos os testes por 1 hora (corpo em choque térmico).",
    ],
    weight:0.25, story:"Laranja queimado. Quente ao toque. Quem bebe sente que o estômago é uma fornalha." },

  { id:"rec_neblina",
    name:"Bomba de Névoa",
    icon:"🌫️", tier:"comum", category:"utilidade",
    ingredients:[
      { tag:"flor_pantano",  qty:2, label:"Flor do Pântano Cinzento ×2" },
      { tag:"po_fada",       qty:1, label:"Pó de Fada ×1" },
      { tag:"agua_arcana",   qty:1, label:"Água Destilada Arcana ×1" }
    ],
    skillTest: { attr:"INT", difficulty:"normal" },
    baseEffect:"Arremessado (alcance 4 hex): névoa densa em área 3x3 hex por 3 rodadas. Visibilidade 0 na névoa. Ataques à distância: −4 na Chance de Acerto.",
    critBonus:[
      "Névoa dura 5 rodadas e área 4x4 hex.",
      "A névoa também causa Lento a inimigos nela (−1 Mov).",
      "Névoa espectal: apenas o lançador vê claramente através dela.",
    ],
    critFailEffect:[
      "Névoa area 1x1 hex apenas (inútil em combate aberto).",
      "Névoa irritante: todos na área espirram (barulho — Furtividade impossível).",
      "Névoa pegajosa: quem estiver na área fica Lento (−1 Mov) — inclusive aliados.",
    ],
    weight:0.2, story:"Cinza pálida e viscosa. Ao quebrar o frasco, a névoa se expande em segundos." },

  /* ── LENDÁRIA ───────────────────────────────────────────────── */
  { id:"rec_magma",
    name:"Grande Bomba de Magma",
    icon:"🌋", tier:"lendario", category:"ofensiva",
    ingredients:[
      { tag:"nucleo_magma",      qty:1, label:"Núcleo de Magma Fundido ×1" },
      { tag:"pimenta_inferno",   qty:3, label:"Pimenta do Inferno ×3" },
      { tag:"catalisador_cristal",qty:2,label:"Catalisador de Cristal ×2" }
    ],
    skillTest: { attr:"INT", difficulty:"critico" },
    baseEffect:"Arremessado (alcance 6 hex, 2 Ações): área 4x4 hex. 4d10 de dano de magma imediato + chão em brasa por 4 rodadas (2d6 de fogo por rodada a quem ficar). AGI (difícil) para metade do imediato.",
    critBonus:[
      "Erupção: magma sobe 2 hex de altitude, área 5x5 hex. Voadoras afetadas.",
      "Chão em brasa dura o combate inteiro.",
      "+2d10 de dano imediato e AGI (crítico) para metade.",
    ],
    critFailEffect:[
      "Explode no lançador: 2d10 de fogo (frasco defeituoso).",
      "Área 1x1 hex apenas — pouco magma escapou.",
      "Dud: o frasco não quebra. Fica no chão pegando fogo lentamente — explode em 1d3 rodadas onde caiu.",
    ],
    weight:0.5, story:"Laranja escuro e quase sólido. Borbulha levemente. Manuseio com pinça de ferro." }
];


/* ═══════════════════════════════════════════════════════════════
   RECEITAS DE FORJA — FORGE_RECIPES
   O personagem usa um item base (arma/armadura COMUM) +
   um material de forja. O resultado é o item base com
   propriedades encantadas (raro → lendário).
   ═══════════════════════════════════════════════════════════════ */

const FORGE_RECIPES = [

  /* ══════════════════════════════════════════════════════════════
     FORJA DE ARMAS
     skillTest: FOR (trabalho físico) + INT (gravura de runas)
     ══════════════════════════════════════════════════════════════ */

  { id:"forge_veneno",
    name:"Lâmina Envenenada",
    icon:"☠️", tier:"raro", category:"weapon",
    smeltingType:"weapon",
    description:"Infunde veneno duradouro na lâmina. Cada golpe aplica veneno ao alvo.",
    material: { tag:"oleo_serpente", qty:2, label:"Óleo de Serpente Venenosa ×2" },
    baseRequirement:"Qualquer arma de 1M ou 2M comum (exceto maça/martelo)",
    skillTest: { attr:"FOR", difficulty:"normal" },
    enchantEffect: "+1d4 de veneno por acerto (SAB normal para resistir, 2 rodadas). Armas contundentes não aceitam este encantamento.",
    dmgBonus:"1d4 veneno",
    critBonus:[
      "Veneno dura 3 rodadas em vez de 2.",
      "SAB (difícil) para resistir ao veneno.",
      "+1d6 de veneno em vez de +1d4.",
    ],
    critFailEffect:[
      "Veneno corrói a lâmina: −1 de dano base permanente na arma.",
      "Só o cabo ficou envenenado — você sofre 1d4 de veneno ao empunhá-la.",
      "Encantamento instável: 30% de chance por acerto de não aplicar veneno.",
    ],
    story:"A cobra não precisa morder duas vezes." },

  { id:"forge_fogo",
    name:"Lâmina de Chama",
    icon:"🔥", tier:"raro", category:"weapon",
    smeltingType:"weapon",
    description:"A arma arde em chamas. Cada golpe causa dano de fogo adicional.",
    material: { tag:"cinzas_karlac", qty:1, label:"Cinzas de Karlac ×1" },
    baseRequirement:"Qualquer arma comum (exceto arco)",
    skillTest: { attr:"FOR", difficulty:"normal" },
    enchantEffect: "+1d6 de dano de fogo por acerto. A arma ilumina num raio de 3 hex (funciona como tocha). Alvos inflamáveis podem pegar fogo.",
    dmgBonus:"1d6 fogo",
    critBonus:[
      "+1d8 de fogo em vez de +1d6.",
      "Chama persiste no alvo: Queimando (1d4/rodada, 2 rodadas).",
      "Fogo em área: acerto crítico de combate causa +1d4 em todos os hex adjacentes ao alvo.",
    ],
    critFailEffect:[
      "A chama é fraca: +1d4 de fogo em vez de +1d6.",
      "A arma arde a si mesma: −1 Def de arma por uso durante 3 combates.",
      "Chama invertida: 20% de chance por acerto de queimar o próprio usuário (1d4).",
    ],
    story:"O forjador sussurrou o nome de Karlac ao dar a última martelada. A arma respondeu." },

  { id:"forge_gelo",
    name:"Lâmina de Gelo Eterno",
    icon:"❄️", tier:"raro", category:"weapon",
    smeltingType:"weapon",
    description:"A arma congela o ponto de impacto. Acertos acumulam carga de frio.",
    material: { tag:"sangue_lich", qty:1, label:"Sangue Congelado do Lich ×1" },
    baseRequirement:"Qualquer arma de 1M ou 2M comum",
    skillTest: { attr:"FOR", difficulty:"dificil" },
    enchantEffect: "+1d4 de dano de gelo por acerto. Cada acerto acumula 1 carga de Frio no alvo (máx 3). Com 3 cargas: Congelado (imóvel 1 rodada, FOR normal para escapar).",
    dmgBonus:"1d4 gelo + cargas",
    critBonus:[
      "+1d6 de gelo em vez de +1d4.",
      "2 cargas de Frio por acerto em vez de 1.",
      "Congelamento requer FOR (difícil) para escapar em vez de normal.",
    ],
    critFailEffect:[
      "A arma fica tão fria que entorpece a mão: −1 AGI enquanto empunhada.",
      "Gelo instável: 25% de chance de as cargas de Frio não acumularem.",
      "Maldição do Lich: a arma sussurra ao ser empunhada — −1 Força de Vontade permanente enquanto equipada.",
    ],
    story:"O Lich não cedeu o sangue voluntariamente. A arma lembra disso." },

  { id:"forge_relampago",
    name:"Lâmina do Relâmpago",
    icon:"⚡", tier:"raro", category:"weapon",
    smeltingType:"weapon",
    description:"A arma conduz eletricidade. Golpes causam descarga elétrica e saltam para alvos próximos.",
    material: { tag:"cristal_relampago", qty:1, label:"Cristal de Relâmpago Puro ×1" },
    baseRequirement:"Qualquer arma metálica comum (exceto madeira/osso)",
    skillTest: { attr:"INT", difficulty:"dificil" },
    enchantEffect: "+1d6 de dano elétrico por acerto. 30% de chance (d10 ≤ 3) de o raio saltar para 1 inimigo adjacente ao alvo (1d4 de dano). Armaduras metálicas no alvo: sem resistência ao elétrico.",
    dmgBonus:"1d6 elétrico + salto",
    critBonus:[
      "+1d8 elétrico em vez de +1d6.",
      "Salto garantido (100%) em acertos.",
      "O relâmpago pode saltar até 2 vezes (2 alvos adjacentes, 1d4 cada).",
    ],
    critFailEffect:[
      "A descarga vai para o usuário: 1d4 de dano elétrico ao atacar.",
      "Condutor instável: apenas 10% de chance de dano elétrico.",
      "Sobrecarga: na primeira vez que matar inimigo, raio atinge aliado mais próximo (1d6).",
    ],
    story:"O cristal de Atrelon não foi domado — foi convencido." },

  { id:"forge_necro",
    name:"Lâmina do Ceifador",
    icon:"💀", tier:"raro", category:"weapon",
    smeltingType:"weapon",
    description:"A arma drena a força vital dos inimigos. Cada golpe restaura HP ao portador.",
    material: { tag:"po_osso_sagrado", qty:2, label:"Pó de Osso Sagrado ×2" },
    baseRequirement:"Qualquer arma de 1M ou 2M comum",
    skillTest: { attr:"SAB", difficulty:"normal" },
    enchantEffect: "Cada acerto restaura 1d4 HP ao portador (drena a vitalidade do alvo). Não funciona contra construtos ou mortos-vivos.",
    dmgBonus:"drenagem 1d4 HP",
    critBonus:[
      "Drena 1d6 HP em vez de 1d4.",
      "Também drena 1 de FOR temporária do alvo por 2 rodadas.",
      "Se matar o alvo: drena HP total do golpe final (em vez de 1d4).",
    ],
    critFailEffect:[
      "Drena vida do próprio portador: −1d4 HP por acerto.",
      "A arma se corrói: perde 1 de dano base permanentemente.",
      "Amaldiçoada: o portador não pode ser curado enquanto empunhada (a arma drena qualquer cura).",
    ],
    story:"O pó de osso sagrado corrompido não purifica — inverte. O ferreiro aprendeu isso tarde demais." },

  { id:"forge_intimidacao",
    name:"Arma do Terror",
    icon:"😱", tier:"raro", category:"weapon",
    smeltingType:"weapon",
    description:"A arma irradia presença aterrorizante. O simples ato de sacar causa hesitação nos inimigos.",
    material: { tag:"po_osso_wyvern", qty:1, label:"Pó de Osso de Wyvern ×1" },
    baseRequirement:"Qualquer arma de 2M comum (peso e tamanho amplificam o efeito)",
    skillTest: { attr:"FOR", difficulty:"normal" },
    enchantEffect: "Ao sacar em combate: inimigos em raio 3 hex testam Força de Vontade (normal) ou ficam com −1d4 nos ataques por 1 rodada (primeiro turno apenas). Inimigos Dif.1 testam Força de Vontade (difícil).",
    dmgBonus:"aura de terror",
    critBonus:[
      "Força de Vontade (difícil) para todos ao sacar.",
      "Inimigos Dif.1-2 automaticamente falham no teste.",
      "O efeito de intimidação dura 2 rodadas em vez de 1.",
    ],
    critFailEffect:[
      "A aura é confusa: aliados em raio 2 hex também testam (Força de Vontade normal).",
      "Fraca demais: apenas Dif.1 é afetado.",
      "Aura invertida: o portador fica com −1d4 nos ataques no primeiro turno (a arma intimida quem a usa).",
    ],
    story:"O Wyvern não precisava de presença mágica. Bastava aparecer. A arma aprendeu isso." },

  { id:"forge_vazio",
    name:"Lâmina do Vazio",
    icon:"🌑", tier:"lendario", category:"weapon",
    smeltingType:"weapon",
    description:"A arma foi tocada pelo Vazio. Dano sombrio que ignora Def.Mágica. Corrompe os que mata.",
    material: { tag:"essencia_vazio", qty:1, label:"Essência do Vazio Sombrio ×1" },
    baseRequirement:"Qualquer arma de 1M ou 2M comum de boa qualidade",
    skillTest: { attr:"INT", difficulty:"critico" },
    enchantEffect: "+1d8 de dano sombrio por acerto (ignora Def.Mágica completamente). Alvos mortos por esta arma: 30% de chance de se levantarem como Sombra Menor aliada por 3 rodadas. Portador sente o Vazio ao empunhá-la.",
    dmgBonus:"1d8 sombrio (ignora Def.Mágica)",
    critBonus:[
      "+1d10 sombrio em vez de +1d8.",
      "Levantamento de Sombra: 60% de chance em vez de 30%.",
      "A Sombra levantada dura o combate inteiro em vez de 3 rodadas.",
    ],
    critFailEffect:[
      "O Vazio é demais: portador perde 1 SAB temporária por combate enquanto a usa.",
      "A Sombra levantada é hostil ao portador (30% de chance).",
      "Maldição do Vazio: portador tem pesadelos — perde 1d4 HP ao acordar todo dia até cura sagrada (1 semana).",
    ],
    story:"O Vazio não foi adicionado à arma. Ele aceitou o convite." },

  { id:"forge_dragao",
    name:"Arma do Sangue de Dragão",
    icon:"🐉", tier:"lendario", category:"weapon",
    smeltingType:"weapon",
    description:"A arma foi temperada no coração de um Filhote Dracônico. Absorve e redireciona energia elemental.",
    material: { tag:"coracao_dragao", qty:1, label:"Fragmento do Coração de Dragão ×1" },
    baseRequirement:"Qualquer arma 2M comum (requer base sólida para absorver o poder)",
    skillTest: { attr:"FOR", difficulty:"critico" },
    enchantEffect: "+1d8 de dano elemental (tipo muda por sessão — fogo, gelo ou relâmpago, determinado ao equipar). Ao receber dano do tipo elemental ativo: absorve e adiciona +1d6 ao próximo ataque. 1x por combate, pode mudar o tipo elemental como Ação Livre.",
    dmgBonus:"1d8 elemental variável + absorção",
    critBonus:[
      "+1d10 elemental em vez de +1d8.",
      "Absorção eleva para +1d8 no próximo ataque.",
      "Pode mudar o tipo elemental 2x por combate em vez de 1x.",
    ],
    critFailEffect:[
      "O coração resiste: absorção não funciona — apenas o +1d6 elemental fraco.",
      "Elemento instável: o tipo muda aleatoriamente a cada turno (Mestre rola).",
      "Tharak sente a perda: se dentro de 10 dias o portador encontrar Tharak, ele estará hostil.",
    ],
    story:"Tharak notará. É apenas uma questão de quando." },

  /* ══════════════════════════════════════════════════════════════
     REFORÇO DE ARMADURAS
     skillTest: FOR (trabalho físico) ou DEX (precisão de costura/encaixe)
     ══════════════════════════════════════════════════════════════ */

  { id:"forge_armadura_furtiva",
    name:"Armadura Silenciosa",
    icon:"🌑", tier:"raro", category:"armor",
    smeltingType:"armor",
    description:"Reforço com couro de Lobo das Sombras. A armadura deixa de fazer barulho e melhora a Furtividade.",
    material: { tag:"couro_lobo", qty:2, label:"Couro Endurecido de Lobo ×2" },
    baseRequirement:"Qualquer armadura de couro comum (Armadura de Couro, Couro Batido, Manto das Sombras)",
    skillTest: { attr:"DEX", difficulty:"normal" },
    enchantEffect: "+1 Def.Física. Penalidade de Furtividade da armadura removida. Testes de Furtividade têm +1d4. Não soa ao mover-se.",
    defBonus:"+1 Def.Física",
    critBonus:[
      "+2 Def.Física em vez de +1.",
      "+1d6 em Furtividade em vez de +1d4.",
      "Camuflagem passiva em ambientes escuros: Percepção (difícil) para detectar.",
    ],
    critFailEffect:[
      "O couro foi mal costurado: −1 Def.Física permanente até reparar (Artesanato normal).",
      "A armadura range estranhamente: −1d4 em Furtividade (pior que antes).",
      "Pelagem instável: a armadura parece mudar de cor aleatoriamente (efeito visual, −1 em testes sociais formais).",
    ],
    story:"Os lobos se movem silenciosamente. O couro deles também." },

  { id:"forge_armadura_pedra",
    name:"Armadura de Pedra Viva",
    icon:"🪨", tier:"raro", category:"armor",
    smeltingType:"armor",
    description:"Placas do Golem são encaixadas na armadura. Resistência massiva mas reduz levemente a agilidade.",
    material: { tag:"placa_golem", qty:2, label:"Placas de Golem de Pedra ×2" },
    baseRequirement:"Armadura de Cota de Malha ou de Placas comum",
    skillTest: { attr:"FOR", difficulty:"dificil" },
    enchantEffect: "+3 Def.Física. −1 Ação de Combate (a armadura fica mais pesada). Imune a Derrubado por fontes físicas. Resistência a dano contundente (−2 por dado).",
    defBonus:"+3 Def.Física",
    critBonus:[
      "+4 Def.Física em vez de +3.",
      "A penalidade de Ação é removida (o ferreiro encontrou equilíbrio perfeito).",
      "Resistência a contundente ampliada: −3 por dado.",
    ],
    critFailEffect:[
      "As placas não encaixam bem: +3 Def.Física mas −1 AGI permanente enquanto equipada.",
      "Peso mal distribuído: o portador cai Derrubado uma vez no primeiro turno de combate (tropeça no próprio peso).",
      "As placas racham: apenas +1 Def.Física — mal aproveitou o material.",
    ],
    story:"O Golem foi destruído. Suas placas recusam-se a servir a um mestre mais fraco." },

  { id:"forge_armadura_veneno",
    name:"Armadura da Escama Sagrada",
    icon:"🐍", tier:"raro", category:"armor",
    smeltingType:"armor",
    description:"Escamas da Cobra Guardiã de Jurgmund forram a armadura. Resistência a veneno e magia.",
    material: { tag:"escama_cobra_guardia", qty:3, label:"Escama de Cobra Guardiã ×3" },
    baseRequirement:"Qualquer armadura comum (qualquer tipo)",
    skillTest: { attr:"DEX", difficulty:"normal" },
    enchantEffect: "+2 Def.Mágica. Imune a venenos Dif.1-2. Venenos Dif.3+ causam metade do efeito. 30% de chance (d10 ≤ 3) de refletir magia de veneno de volta ao lançador.",
    defBonus:"+2 Def.Mágica",
    critBonus:[
      "+3 Def.Mágica em vez de +2.",
      "Reflexo de veneno aumenta para 50% (d10 ≤ 5).",
      "Imune a venenos Dif.1-3. Dif.4+ causa metade.",
    ],
    critFailEffect:[
      "As escamas ficaram porosas: apenas +1 Def.Mágica.",
      "A energia de Jurgmund rejeita o portador: −1 SAB temporária enquanto equipada (a serpente não aprova).",
      "Reflexo errático: 10% de chance de refletir QUALQUER magia de volta ao lançador (incluindo curas de aliados).",
    ],
    story:"Jurgmund não se importa com quem usa as escamas de seus guardiões. A escama sim." },

  { id:"forge_armadura_teia",
    name:"Armadura Tecida do Abismo",
    icon:"🕸️", tier:"raro", category:"armor",
    smeltingType:"armor",
    description:"Teia de Aranha Abissal entrelaçada na armadura. Absorve projéteis e prende atacantes.",
    material: { tag:"teia_aranha_abissal", qty:2, label:"Teia de Aranha Abissal ×2" },
    baseRequirement:"Armadura de Couro, Vestes ou Manto comum",
    skillTest: { attr:"DEX", difficulty:"dificil" },
    enchantEffect: "+2 Def.Física contra ataques à distância (flechas, projéteis mágicos). Ao ser acertado em melee: 20% de chance (d10 ≤ 2) de o atacante ficar Preso pela teia (FOR normal para escapar, 1 Ação).",
    defBonus:"+2 Def.Fís (distância) + aprisionamento",
    critBonus:[
      "+3 Def.Física contra distância.",
      "Aprisionamento: 40% de chance (d10 ≤ 4).",
      "A teia estende: ao ficar Preso, o alvo fica Preso por 2 rodadas.",
    ],
    critFailEffect:[
      "A teia é fraca: apenas +1 Def contra distância, sem aprisionamento.",
      "A teia prende o próprio portador: −1 AGI enquanto equipada (move-se estranhamente).",
      "A teia atrai aranhas: em ambientes naturais, pequenas aranhas aparecem ao redor do portador (impreca −1d4 em testes sociais).",
    ],
    story:"A Aranha Abissal Tecelã não perdoou a perda da teia. O portador pode sentir isso." },

  { id:"forge_armadura_construto",
    name:"Armadura do Núcleo Mecânico",
    icon:"⚙️", tier:"lendario", category:"armor",
    smeltingType:"armor",
    description:"Fragmentos do Construto de Durrak fundidos na armadura. Resistência mecânica e deflexão automática.",
    material: { tag:"fragmento_construto", qty:1, label:"Fragmento do Construto de Durrak ×1" },
    baseRequirement:"Armadura de Placas Completa comum",
    skillTest: { attr:"FOR", difficulty:"critico" },
    enchantEffect: "+4 Def.Física. +2 Def.Mágica. Imune a fogo e dano de lava. 1x por combate, deflexão automática: quando receber ataque que causaria mais de 15 HP, pode deflectir automaticamente (nega completamente o dano, Ação Livre). Após deflectir: próxima Ação do portador tem +1d10 de dano (adrenalina mecânica).",
    defBonus:"+4 Def.Física, +2 Def.Mágica",
    critBonus:[
      "+5 Def.Física em vez de +4.",
      "Deflexão funciona 2x por combate em vez de 1x.",
      "O limiar de deflexão baixa para 10 HP (qualquer golpe acima de 10 pode ser deflectido).",
    ],
    critFailEffect:[
      "O núcleo resiste: apenas +2 Def.Física, sem deflexão e sem resistência a fogo.",
      "Sobrecarga mecânica: 1x por combate, a armadura trava o portador por 1 Ação (mecanismo falha).",
      "O espírito do Construto permanece: a armadura tenta às vezes guiar os movimentos do portador (Força de Vontade normal ou perde 1 Ação para resistir ao impulso mecânico).",
    ],
    story:"O Construto não foi destruído. Foi redistribuído. A distinção importa para ele." }
,

  { id:"forge_afiada",
    name:"Lâmina Rúnica Afiada",
    icon:"🔪", tier:"raro", category:"weapon",
    smeltingType:"weapon",
    description:"Runas de afiação gravadas na lâmina amplificam a força de corte e penetração.",
    material: { tag:"pedra_afia_runica", qty:2, label:"Pedra de Afiar Rúnica ×2" },
    baseRequirement:"Qualquer arma de corte comum (Adaga, Espada Curta, Espada Longa, Machado, Foice)",
    skillTest: { attr:"FOR", difficulty:"normal" },
    enchantEffect: "+1d4 de dano extra por acerto. A arma ignora 2 pontos de Def.Física do alvo (a lâmina rúnica penetra armaduras). Armas contundentes não aceitam este encantamento.",
    dmgBonus:"1d4 + −2 Def alvo",
    critBonus:[
      "+1d6 de dano extra em vez de +1d4.",
      "Ignora 3 pontos de Def.Física em vez de 2.",
      "A lâmina se torna magicamente afiada: nunca perde o fio (sem desgaste de Defesa).",
    ],
    critFailEffect:[
      "As runas fragmentam a lâmina: −1 de dano base permanente.",
      "Afiação unilateral: +1d4 só contra armaduras (sem bônus contra alvos sem armadura).",
      "Runa invertida: a lâmina perde 1 de dano base mas ganha +1 em defesa (agora é um escudo esquisito).",
    ],
    story:"As runas anãs de afiação têm 400 anos de história. Cada uma gravada por Dunforge leva 1 hora." },

  { id:"forge_cacador",
    name:"Armadura do Rastreador",
    icon:"🏔", tier:"raro", category:"armor",
    smeltingType:"armor",
    description:"O couro do Caçador de Gigantes reforça a armadura com resistência e bônus contra criaturas grandes.",
    material: { tag:"couro_cacador_gigantes", qty:1, label:"Couro do Caçador de Gigantes ×1" },
    baseRequirement:"Qualquer armadura de couro ou manto comum",
    skillTest: { attr:"FOR", difficulty:"normal" },
    enchantEffect: "+2 Def.Física. Passivo: contra inimigos de tamanho Grande ou maior, ganha +1d6 de dano em todos os ataques e +1 Def.Física adicional. Imune a condição Derrubado causada por criaturas Grandes+.",
    defBonus:"+2 Def.Física",
    critBonus:[
      "+3 Def.Física em vez de +2.",
      "+1d8 de dano contra Grandes em vez de +1d6.",
      "O bônus se estende para criaturas de qualquer tamanho (não só Grandes).",
    ],
    critFailEffect:[
      "O couro encolhe: apenas +1 Def.Física.",
      "O espírito do Caçador resiste: −1 SAB enquanto equipada (memórias do caçador interferem).",
      "Marca do Colosso: criaturas Grandes+ sentem a armadura — ficam Hostis se o portador não iniciar combate.",
    ],
    story:"O Caçador de Gigantes que usou este couro nunca perdeu uma batalha. Não por sorte." }
];
