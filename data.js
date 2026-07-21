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
      { name: "Provocar", cost: "1 Fúria, 1 Reação", effect: "Um inimigo adjacente tem −1d4 na Chance de Acerto contra qualquer alvo que não seja você até o fim da próxima rodada." },
      { name: "Contra-ataque", cost: "2 Fúria, 1 Reação", effect: "Ao defender com sucesso um ataque corpo a corpo, ataca o atacante de volta sem gastar Ação." },
      { name: "Fúria Sangrenta", cost: "3 Fúria, 1 Ação", effect: "Por 2 turnos: +1d6 no Dano Natural, mas −1d4 na Chance de Defesa." },
      { name: "Grito de Guerra", cost: "3 Fúria, 1 Ação", effect: "Aliados em até 2 hexágonos ganham +1d4 na Chance de Acerto até o fim da próxima rodada.",
        levels: [
          { cost: "3 Fúria, 1 Ação", effect: "Aliados em até 2 hexágonos ganham +1d4 na Chance de Acerto até o fim da próxima rodada." },
          { cost: "4 Fúria, 1 Ação", effect: "Aliados em até 3 hexágonos ganham +1d6 na Chance de Acerto até o fim da próxima rodada." },
          { cost: "5 Fúria, 1 Ação", effect: "Aliados em até 4 hexágonos ganham +1d6 na Chance de Acerto e +1d4 no Dano Natural até o fim da próxima rodada." }
        ] },
      { name: "Quebra-Guarda", cost: "2 Fúria, 1 Ação", effect: "Ataque que, se acertar, ignora a Defesa Física vinda de escudo do alvo." },
      { name: "Última Resistência", cost: "5 Fúria (todos), 1 Ação", effect: "Com HP ≤ 25%, gasta toda a Fúria para curar 1d10 + FOR. Uso único por combate." }
    ],
    skillsClass: [
      { name: "Combate com Armas Pesadas", attr: "FOR", desc: "Reduz as penalidades de manejo de armas grandes e pesadas, como machados de duas mãos e martelos de guerra, tornando os golpes mais precisos e firmes.", example: "Manejar um machado grande sem perder equilíbrio ao golpear, mesmo em espaço apertado." },
      { name: "Combate com Armas Leves", attr: "DEX", desc: "Melhora o manejo de espadas curtas e adagas, permitindo golpes mais rápidos e ajustes finos de ângulo durante o combate.", example: "Encaixar um golpe certeiro entre as placas de uma armadura inimiga usando uma adaga." },
      { name: "Resistência Física", attr: "FOR", desc: "Aumenta a capacidade de resistir a venenos, fadiga extrema e efeitos físicos debilitantes que afetam o corpo.", example: "Continuar lutando mesmo após ser envenenado por uma flecha, resistindo aos efeitos por mais tempo." },
      { name: "Intimidação", attr: "FOR/SAB", desc: "Permite ameaçar e impor presença física ou psicológica sobre outros, seja em combate ou em negociações tensas.", example: "Fazer um bandido desistir de um assalto só de erguer o machado e encarar o grupo." },
      { name: "Tática de Campo", attr: "INT", desc: "Avalia terreno, formações inimigas e pontos fracos estratégicos antes ou durante uma batalha.", example: "Notar que os arqueiros inimigos estão posicionados num morro e sugerir um flanco pela direita." },
      { name: "Atletismo", attr: "FOR/AGI", desc: "Permite escalar superfícies, saltar distâncias maiores e arrombar portas ou obstáculos com força física.", example: "Saltar de um telhado a outro durante uma perseguição, ou derrubar uma porta trancada com um chute." },
      { name: "Defesa com Armas Pesadas", attr: "FOR", desc: "Treino especializado em usar o próprio peso e comprimento de armas de duas mãos para interceptar golpes, algo que a maioria dos guerreiros não consegue fazer. Quem possui essa perícia pode tentar defender-se normalmente mesmo empunhando uma arma de duas mãos pesada, mas a Chance de Defesa sofre −2 (além de qualquer outra degradação por tentativa).", example: "Erguer um machado grande na diagonal bem a tempo de desviar o golpe de uma espada inimiga, algo que pareceria impossível para quem não treinou a manobra.", mechanicalEffect: "enable_two_hand_defense" }
    ],
    spellsFull: null
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
      { name: "Conjuração Rápida", cost: "4 MP", effect: "A próxima magia é conjurada como Reação em vez de Ação (1x por turno)." },
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
      { name: "Reserva Arcana Ampliada", cost: "6 MP, fora de combate", effect: "Escolhe 1 magia conhecida e concede a ela +1 uso na contagem de cooldown atual (por batalha, por dia, ou por semana, conforme a magia). Pode ser usada 1 vez por descanso longo." }
    ],
    skillsClass: [
      { name: "Arcanismo", attr: "INT", desc: "Permite identificar magias sendo conjuradas, reconhecer itens mágicos e decifrar runas e inscrições arcanas.", example: "Reconhecer que o brilho azulado na espada inimiga é um encantamento de gelo antes que ela seja usada." },
      { name: "Conhecimento Arcano Histórico", attr: "INT", desc: "Conhecimento sobre criaturas mágicas, ruínas antigas e eventos históricos relacionados à magia.", example: "Lembrar que a torre em ruínas era o antigo laboratório de um arquimago desaparecido séculos atrás." },
      { name: "Concentração", attr: "SAB", desc: "Resiste a ser interrompido enquanto conjura uma magia, mesmo sob dano ou pressão de combate.", example: "Terminar de conjurar uma Bola de Fogo mesmo levando um golpe de espada no ombro." },
      { name: "Investigação Mágica", attr: "INT", desc: "Detecta armadilhas mágicas, ilusões e efeitos arcanos ocultos que passariam despercebidos a olho nu.", example: "Notar que o corredor 'vazio' na verdade esconde uma ilusão sobre um precipício." },
      { name: "Alquimia Básica", attr: "INT", desc: "Permite criar componentes para magias e identificar poções e substâncias mágicas desconhecidas.", example: "Identificar que o líquido roxo no frasco é uma poção de invisibilidade antes de bebê-lo." }
    ],
    spellsFull: [
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
      { name: "Olho de Águia", cost: "3 Foco", effect: "Por 3 rodadas, alcance de ataques à distância +4 hexágonos; ignora cobertura parcial." }
    ],
    skillsClass: [
      { name: "Pontaria", attr: "DEX", desc: "Mantém a precisão de tiro mesmo em condições adversas, como vento forte, pouca luz ou alvos em movimento.", example: "Acertar um alvo a 30 metros mesmo com chuva forte e vento lateral atrapalhando a trajetória da flecha." },
      { name: "Sobrevivência", attr: "SAB", desc: "Rastreia pegadas, encontra comida e água em ambientes selvagens, e lê sinais sutis do terreno.", example: "Seguir o rastro de um lobo ferido através de uma floresta densa até sua toca." },
      { name: "Conhecimento de Fauna/Flora", attr: "INT", desc: "Identifica criaturas selvagens, venenos naturais e propriedades de plantas e ervas.", example: "Reconhecer que as bagas vermelhas no caminho são venenosas antes que alguém as coma." },
      { name: "Percepção", attr: "SAB", desc: "Detecta emboscadas, inimigos escondidos e detalhes sutis no ambiente que passariam despercebidos.", example: "Notar o brilho de uma lâmina escondida nos arbustos antes que a emboscada seja disparada." },
      { name: "Manutenção de Equipamento", attr: "DEX", desc: "Repara e produz flechas, cordas de arco e outros equipamentos de tiro com materiais disponíveis.", example: "Fabricar flechas novas a partir de madeira local durante uma pausa na viagem." },
      { name: "Furtividade Leve", attr: "AGI", desc: "Permite movimentação silenciosa pelo ambiente, sem o bônus de ataque furtivo que o Ladino possui.", example: "Se aproximar de um acampamento inimigo sem ser ouvido, para observar de perto antes de agir." }
    ],
    spellsFull: null
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
      { name: "Veneno Paralisante", cost: "2 Cargas, 1 Ação", effect: "Ataque que impõe −1d4 Movimento e −1d4 Chance de Defesa por 2 rodadas.",
        levels: [
          { cost: "2 Cargas, 1 Ação", effect: "Ataque que impõe −1d4 Movimento e −1d4 Chance de Defesa por 2 rodadas." },
          { cost: "3 Cargas, 1 Ação", effect: "Ataque que impõe −1d6 Movimento e −1d4 Chance de Defesa por 3 rodadas." },
          { cost: "3 Cargas, 1 Ação", effect: "Ataque que impõe −1d8 Movimento e −1d6 Chance de Defesa por 3 rodadas; o alvo não pode usar Reações na 1ª rodada." }
        ] },
      { name: "Reflexos de Gato", cost: "1 Reação", effect: "+2 na Chance de Defesa contra um ataque específico, mesmo desarmado." },
      { name: "Roubo Rápido", cost: "1 Ação", effect: "Furta item pequeno ou desarma armadilha simples sem provocar reação." },
      { name: "Golpe Duplo", cost: "1 Ação", effect: "2 ataques corpo a corpo no mesmo alvo, cada um com −1 na Chance de Acerto." },
      { name: "Sangramento Mortal", cost: "2 Cargas, 1 Ação", effect: "Se for Ataque Furtivo, aplica Sangramento: 1d6 contínuo por 3 rodadas.",
        levels: [
          { cost: "2 Cargas, 1 Ação", effect: "Se for Ataque Furtivo, aplica Sangramento: 1d6 contínuo por 3 rodadas." },
          { cost: "3 Cargas, 1 Ação", effect: "Se for Ataque Furtivo, aplica Sangramento: 1d8 contínuo por 3 rodadas." },
          { cost: "3 Cargas, 1 Ação", effect: "Se for Ataque Furtivo, aplica Sangramento: 2d6 contínuo por 4 rodadas." }
        ] }
    ],
    skillsClass: [
      { name: "Ladinagem", attr: "DEX", desc: "Arromba fechaduras, desarma armadilhas mecânicas e realiza furtos discretos.", example: "Abrir o cadeado de um baú do tesouro sem chave, em poucos segundos." },
      { name: "Investigação", attr: "INT", desc: "Encontra pistas, compartimentos secretos e detalhes escondidos em cenas e objetos.", example: "Descobrir uma passagem secreta atrás de uma estante ao notar marcas de atrito no chão." },
      { name: "Percepção de Mentiras", attr: "SAB", desc: "Detecta blefes, meias-verdades e sinais de traição na fala e no comportamento de outros.", example: "Perceber que o mercador está escondendo informações sobre a procedência de um item raro." },
      { name: "Acrobacia", attr: "AGI", desc: "Permite escapar de agarrões, manter o equilíbrio em superfícies instáveis e realizar saltos precisos.", example: "Se soltar do aperto de um troll e cair de pé após um salto de um telhado." },
      { name: "Conhecimento de Venenos", attr: "INT", desc: "Identifica e prepara venenos e seus antídotos a partir de ingredientes naturais ou alquímicos.", example: "Preparar um antídoto rápido após reconhecer o veneno usado contra um aliado." }
    ],
    spellsFull: null
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
      { name: "Estabilizar", cost: "1 Fé, 1 Ação", effect: "Aliado a 0 HP para de perder HP por efeitos contínuos." },
      { name: "Imposição de Mãos", cost: "4 Fé, 1 Ação", effect: "Remove veneno, doença ou maldição menor de um alvo tocado." },
      { name: "Ressurreição Menor", cost: "Toda a Fé (mín. 6), 1 Ação", effect: "1x/dia, restaura aliado caído há até 3 rodadas para 50% do HP máximo." }
    ],
    skillsClass: [
      { name: "Medicina", attr: "SAB", desc: "Presta primeiros socorros sem usar magia e diagnostica doenças e condições físicas.", example: "Identificar que a febre de um aldeão é causada por uma infecção, não por uma maldição." },
      { name: "Religião", attr: "INT", desc: "Conhecimento sobre doutrinas religiosas, rituais sagrados e hierarquias de templos e ordens.", example: "Reconhecer o símbolo de uma ordem religiosa rival gravado na porta de um templo abandonado." },
      { name: "Intuição", attr: "SAB", desc: "Percebe intenções ocultas, mentiras sutis e sinais de perigo iminente antes que se manifestem.", example: "Sentir que o sorriso do anfitrião escondia más intenções, momentos antes da traição." },
      { name: "Persuasão", attr: "SAB/FOR", desc: "Usa diplomacia, conforto emocional e liderança moral para guiar e unir o grupo ou convencer outros.", example: "Convencer um aldeão assustado a confiar no grupo e revelar onde os sequestradores se escondem." },
      { name: "Combate com Armas de Impacto", attr: "FOR", desc: "Reduz as penalidades de manejo de maças e martelos de guerra, armas tradicionalmente usadas por Clérigos.", example: "Golpear com firmeza usando uma maça pesada sem perder o equilíbrio entre os golpes." }
    ],
    spellsFull: [
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
];

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

  { name: "Aceleração", level: 3, category: "buff",
    effect: "Alvo tocado ganha +1 Ação extra por turno e +2 Movimento por 3 rodadas. Ao final das 3 rodadas, fica Exausto (−1d4 em todos os testes) por 2 rodadas.",
    castTime: "1 Ação (instantânea)", cooldown: "2 usos por batalha" },

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
    note: "🌟 Só conjurável por portadores da Chama-Viva de Karloth ou das Cinzas de Karloth Sagrado. O dano base é 3d10 mesmo sem rodadas acumuladas." }


];

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
  { tier: "lendario", name: "Grande Espada do Crepúsculo", dmg: "1d20 + 1d8", req: "FOR (alto)", weight: 6, defenseDegrade: 0, slot: ["primary"],
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
  { tier: "raro", name: "Maul da Pedra Viva", dmg: "2d10", req: "FOR alta", weight: 15, defenseDegrade: null, slot: ["primary"], heavyTwoHanded: true,
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
    name: "Garra de Ras'kuru", dmg: "2d8 + 1d10", req: "FOR alta", weight: 5, defenseDegrade: 3,
    slot: ["primary"],
    story: "Ras'kuru perdeu a mão direita na primeira batalha que os orcs travaram ao lado de humanos contra os elfos. A mão caiu e no chão se transformou em esta garra de metal que nunca enferruja. Orcs acreditam que a garra é literalmente a mão do deus — que ele escolheu um orc para empunhá-la cada geração. O portador atual sente os sonhos de todos os portadores anteriores.",
    note: "🌟 DIVINO — Resistência de Ras'kuru: ao receber dano que reduziria o portador abaixo de 50% HP, pode declarar 'Resistência' (1x/combate) — o dano é reduzido à metade e o portador ganha +1d10 de dano nos próximos 2 turnos (raiva purificada). Passivo: imune a Derrubada e Atordoado. Se o portador morrer empunhando a Garra, todos os aliados em raio 6 hex ganham +2d8 de dano por 1 rodada (sacrifício inspira).",
    curseDetails: "Localização: Tumba do Último Chefe Orc (Grande Planície, dif.3). O guardião é um Orc ancestral não-morto que só entrega a garra se for derrotado em combate singular." },

];

const WEAPONS_TWO_HAND = [
  /* --- COMUNS --- */
  { tier: "comum", name: "Espada de Duas Mãos", dmg: "1d12", req: "FOR", weight: 7, defenseDegrade: null, slot: ["primary"], note: "Alto dano, sem defesa ativa.", heavyTwoHanded: true },
  { tier: "comum", name: "Machado Grande", dmg: "1d12 + 1d4", req: "FOR (alto)", weight: 9, defenseDegrade: null, slot: ["primary"], note: "Dano altíssimo.", heavyTwoHanded: true },
  { tier: "comum", name: "Martelo de Guerra", dmg: "1d10 + 1d4", req: "FOR", weight: 8, defenseDegrade: null, slot: ["primary"], note: "Bom contra armaduras pesadas.", heavyTwoHanded: true },
  { tier: "comum", name: "Lança", dmg: "1d10", req: "FOR/DEX", weight: 6, defenseDegrade: null, slot: ["primary"], note: "Alcance 2 hexágonos corpo a corpo.", heavyTwoHanded: true },
  { tier: "comum", name: "Alabarda", dmg: "1d10 + 1d6", req: "FOR", weight: 8, defenseDegrade: null, slot: ["primary"], note: "Alcance 2 hex; Ataques de Oportunidade a 2 hex.", heavyTwoHanded: true },
  { tier: "comum", name: "Foice de Guerra", dmg: "1d10 + 1d4", req: "FOR/AGI", weight: 6, defenseDegrade: null, slot: ["primary"], note: "Acerto Crítico atinge também um inimigo adjacente com 1d6.", heavyTwoHanded: true },

  /* --- RAROS --- */
  { tier: "raro", name: "Maul de Pedra Negra", dmg: "1d12 + 1d6", req: "FOR (alto)", weight: 12, defenseDegrade: null, slot: ["primary"],
    story: "Esculpido de um único bloco de obsidiana das Cavernas de Durrak, onde o calor do subsolo impregna a rocha com energia bruta. O primeiro golpe de cada combate sempre causa Atordoamento.",
    note: "Primeiro ataque do combate: o alvo perde 1 Ação no próximo turno (independente de acertar).", heavyTwoHanded: true },

  /* --- MÁGICOS --- */
  { tier: "magico", name: "Foice da Lua da Marca", dmg: "1d10 + 1d6 + 1d4", req: "FOR/AGI", weight: 6, defenseDegrade: null, slot: ["primary"],
    story: "Forjada sob a única Lua Vermelha que ocorre a cada 100 anos, quando o Deus Marcado ganha força suficiente para tingir o céu de carmesim. A foice corta não só a carne, mas o elo entre alma e corpo.",
    note: "Acerto Crítico: além de atingir um adjacente, aplica Maldição da Marca — alvo sofre 1d6 de dano no início de cada turno por 3 rodadas e não pode se curar enquanto Maldito.", heavyTwoHanded: true },


  /* --- MÁGICOS (novos) --- */
  { tier: "magico", name: "Báculo do Abismo Serpentino", dmg: "1d12 + 1d8 + 1d4", req: "INT/SAB", weight: 5, defenseDegrade: null, slot: ["primary"],
    story: "Criado nas profundezas de Serpentara a partir do vértice de uma caverna onde cobras sagradas de Jurgmund se reuniam para hibernar. O centro do báculo pulsa com veneno purificado.",
    note: "Magias de veneno conjuradas com este báculo adicionam +1d12. Uma vez por sessão: ao acertar um ataque, injeta Veneno do Abismo — 1d20 de dano distribuído por 5 rodadas.", heavyTwoHanded: true },

  /* --- LENDÁRIOS (novos) --- */
  { tier: "lendario", name: "Malho do Trovão Petrificado", dmg: "1d12 + 1d12 + 1d6", req: "FOR (alto)", weight: 15, defenseDegrade: null, slot: ["primary"],
    story: "Um raio caiu no mesmo lugar por 40 dias consecutivos durante uma tempestade sobrenatural em Atrelon. Um anão encontrou o solo vitrificado e passou 10 anos moldando o martelo. A tormenta diz-se ter sido invocada pelo Lich das Montanhas como experimento.",
    note: "Ao acertar: cria uma onda de choque que empurra o alvo 2 hex e força todos os inimigos num raio de 2 hex a testar Resistência (difícil) ou cair prostrados. Dano de trovão +1d12 contra alvos usando armadura metálica.", heavyTwoHanded: true },


  /* --- RAROS/MÁGICOS: Ações de Magia e Combate (2M) --- */
  { tier: "raro", name: "Cajado do Trovador de Batalha", dmg: "1d8 + 1d6", req: "INT/SAB", weight: 3, defenseDegrade: null, slot: ["primary"], heavyTwoHanded: true,
    magicBonus: { spellActions: 1 },
    story: "Cajado que ecoa o som de batalha enquanto canaliza magia. Foi usado por um trovador-mago que compunha músicas durante os combates — e cada nota era uma magia.",
    note: "+1 Ação de Magia por rodada enquanto equipado. Todas as magias conjuradas com este cajado adicionam +1d4 ao efeito." },
  { tier: "magico", name: "Báculo do Feiticeiro Guerreiro", dmg: "1d10 + 1d8", req: "INT/FOR", weight: 5, defenseDegrade: null, slot: ["primary"], heavyTwoHanded: true,
    magicBonus: { spellActions: 1, actions: 1 },
    story: "Criado para guerreiros que aprenderam magia com Arcath mas não queriam abrir mão do combate corpo a corpo. O báculo pode ser usado como arma ou como foco mágico — e o portador pode fazer os dois no mesmo turno.",
    note: "+1 Ação de Magia e +1 Ação de Combate por rodada. Permite conjurar e atacar corpo a corpo no mesmo turno sem penalidade." },
  { tier: "lendario", name: "Lança do Herói Arqueiro — Réplica Enchanted", dmg: "1d12 + 1d8", req: "DEX/FOR", weight: 5, defenseDegrade: null, slot: ["primary"], heavyTwoHanded: true,
    magicBonus: { actions: 2, reactions: 1 },
    story: "Réplica encantada da lança do Herói Arqueiro Ferrath. O original foi destruído na Batalha Colossal, mas forjadores de Arcath conseguiram recriar parte do encantamento estudando fragmentos encontrados nas planícies.",
    note: "+2 Ações de Combate e +1 Reação por rodada. Ataques com esta lança alcançam 3 hexágonos em corpo a corpo e 12 hexágonos como arma arremessada (retorna ao portador)." },

  /* ── Raros 2M com alto dano e desvantagens ── */
  { tier: "raro", name: "Alabarda do Vento Cortante", dmg: "1d12 + 1d10", req: "FOR/AGI", weight: 8, defenseDegrade: null, slot: ["primary"], heavyTwoHanded: true,
    story: "Lâmina em crescente que cria vácuo de ar ao girar. O giro é poderoso demais para ser controlado com precisão.",
    note: "⚠ Ataques atingem uma área de arco (até 2 inimigos adjacentes com uma Ação), mas o portador não pode usar Reações na rodada em que atacar com esta arma — o giro o desprotege completamente." },
  { tier: "raro", name: "Claymore do Colapso", dmg: "2d8 + 1d8", req: "FOR alta", weight: 10, defenseDegrade: null, slot: ["primary"], heavyTwoHanded: true,
    story: "Espada de duas mãos com lâmina que aumenta de peso ao descer — a inércia é brutal mas incontrolável.",
    note: "⚠ Após cada ataque (acerto ou erro), o portador move-se obrigatoriamente 1 hexágono na direção do alvo (sem custo de Ação, mas involuntário). Se houver parede/obstáculo, para. Se acertar, o alvo é Derrubado automaticamente além do dano." },
  { tier: "raro", name: "Bazão da Cobra Invertida", dmg: "1d12 + 1d8", req: "INT/SAB", weight: 4, defenseDegrade: null, slot: ["primary"], heavyTwoHanded: true,
    story: "Cajado de um sacerdote de Jurgmund que inverteu os rituais — canaliza veneno em vez de cura. O símbolo da cobra está de cabeça para baixo.",
    note: "⚠ Magias conjuradas com este cajado adicionam +1d8 de veneno ao dano ou +1d8 à cura. MAS uma vez por combate, ao rolar 1 natural em qualquer teste enquanto o cajado está equipado, o veneno vaza e o portador sofre 1d8 de veneno (não evitável)." },

  /* --- ÚNICOS --- */
  { tier: "unico", name: "Cajado da Tormenta", dmg: "1d10 + 1d6", req: "INT", weight: 5, defenseDegrade: null, slot: ["primary"],
    story: "Pertencia ao Lich das Montanhas de Atrelon, um necromante que fez um pacto com entidades do plano do gelo para estender sua vida além da morte. O cajado absorveu séculos de magia glacial e agora respira frio por conta própria. Quando o Lich foi derrotado, o cajado foi selado — mas nunca destruído.",
    uniqueAbility: "Nevasca de Atrelon (2x/dia, 1 Ação de Magia): cria uma nevasca que dura 5 turnos em TODO o campo de batalha. Durante a nevasca: todos os hexágonos se tornam Terreno Difícil (custo dobrado de Movimento), Chance de Acerto à distância recebe −1d4, e qualquer criatura que terminar seu turno na neve sem proteção sofre 1d6 de dano de frio.",
    note: "Conjura magias de frio sem gastar Slot de Magia. Passivo: o portador é imune a efeitos de frio e neve.", heavyTwoHanded: true },
  /* --- SETS integrados --- */
  { tier: "magico", setName: "Cólera Arcana", name: "Cajado da Tempestade Arcana (Cólera Arcana)", dmg: "1d10 + 1d8", req: "INT", weight: 4, defenseDegrade: null, slot: ["primary"], heavyTwoHanded: true,
    story: "Derivado dos estudos sobre o Cajado da Tormenta do Lich de Atrelon. Replicação instável e perigosa — violento por natureza.",
    note: "Magias de área +1 hex de raio. Uma vez por sessão, ao errar uma magia, pode re-conjurar sem gastar Slot. SET — Cólera Arcana (1/3): Sobrecarga Elemental.",
    setBonus: { pieces: 3, ability: "Sobrecarga Elemental", effect: "Magia de dano Nv3+ ganha +1 dado extra do tipo maior que já usa. Você sofre 1d6 de retaliação arcana. (1x/batalha)" } },

  /* --- LENDÁRIOS: tema Aether --- */
  { tier: "lendario", name: "Malho dos Ossos de Magnalaga", dmg: "1d12 + 1d12 + 1d8", req: "FOR", weight: 14, defenseDegrade: null, slot: ["primary"], heavyTwoHanded: true,
    story: "Forjado a partir de um fragmento de osso que Magnalaga espontaneamente expeliu durante um mergulho. O anão Hrissa o reconheceu como sinal — levou 6 anos forjando. O martelo parece mais leve do que deveria e a superfície de contato muda de textura como pele viva.",
    note: "Ao acertar: onde o alvo impacta o chão ou parede, todos os inimigos em raio 2 hex testam Resistência (normal) ou ficam Prostrados. +1d8 de dano adicional contra construtos e criaturas com carapaça. Passivo: imune a efeitos de atordoamento por impacto." },

  { tier: "lendario", name: "Lança de Luz do Dragão Dourado", dmg: "1d12 + 1d10", req: "FOR/SAB", weight: 5, defenseDegrade: null, slot: ["primary"], heavyTwoHanded: true,
    story: "Segundo a lenda, a Xamã Erkha passou 30 dias meditando no topo do Vulcão de Karloth. No último dia, uma escama dourada rolou pela encosta até seus pés — e ela a fundiu em lança com a ajuda do Ferreiro Durn. O dragão nunca reclamou.",
    note: "Dano de luz: +1d6 de luz sagrada em cada acerto — causa dano dobrado contra criaturas do Deus Marcado, Araltos e mortos-vivos. Uma vez por dia: a lança emite um pulso de luz dourada (alcance 4 hex) que remove qualquer efeito de Corrupção ou Maldição da Marca de aliados na área." },

  /* --- ÚNICO: tema Aether --- */
  { tier: "unico", name: "Báculo do Crânio de Jurgmund", dmg: "1d12 + 1d8 + 1d6", req: "INT/SAB", weight: 5, defenseDegrade: null, slot: ["primary"], heavyTwoHanded: true,
    story: "Fragmento do próprio crânio de Jurgmund, moldado pelos primeiros Serpentarianos em forma de báculo. Pulsa com calor vivo e ocasionalmente emite sons que só quem empunha consegue ouvir — sussurros em língua de serpente que descrevem eventos que ainda não aconteceram.",
    uniqueAbility: "Profecia da Cobra (1x/sessão): ao conjurar uma magia, pode escolher ver o resultado antes de confirmar o gasto do Slot. Se o resultado não for satisfatório, pode cancelar a magia sem custo — mas fica Atordoado por 1 rodada pela sobrecarga profética. Não acumula com outras magias de visão.",
    note: "Magias de veneno e cobra conjuradas com este báculo adicionam +1d12. Imunidade completa a venenos enquanto equipado. Aliados em raio 3 hex ganham resistência a veneno (+1d4 de Defesa Mágica contra venenos)." },

  /* ── ÚNICOS AMALDIÇOADOS — Armas de 2M ── */
  { tier: "lendario", cursed: true,
    name: "Báculo da Explosão de Mana", dmg: "1d6 + 1d4", req: "INT alta", weight: 3,
    defenseDegrade: null, slot: ["primary"], heavyTwoHanded: true,
    story: "Criado por um mago que descobriu que HP é apenas mana condensada em carne. Usou o báculo durante 10 anos antes de morrer — não em batalha, mas de velhice precoce, com 34 anos de idade real mas aparência de 90. O báculo estava em perfeito estado ao seu lado.",
    note: "⚠ AMALDIÇOADA — Explosão de Mana: Ao conjurar a magia Explosão de Mana através deste báculo, o conjurador pode sacrificar HP permanentemente (não retorna com descanso — é HP máximo perdido para sempre). A cada 5 HP máx sacrificados, adiciona +1d20 de dano numa área 3x3 hex. Não há limite de sacrifício por conjuração. Se o conjurador chegar a 0 HP máx, morre instantaneamente e o báculo explode causando dano igual ao HP sacrificado em raio 10 hex.",
    curseDetails: "Localização: Torre do Arquimago Louco (Reinos de Akaen, dif.4). A magia Explosão de Mana só existe neste báculo — não pode ser aprendida por grimório." },

  { tier: "unico", cursed: true,
    name: "Arco Celeste de Akaen", dmg: "2d10 + 1d8", req: "DEX/AGI", weight: 2,
    defenseDegrade: null, slot: ["primary"], heavyTwoHanded: true, range: 18,
    story: "Arco sem corda — as flechas aparecem de energia pura quando a intenção de disparar é formada. Pertenceu ao Arqueiro Herói Ferrath, que o usou para disparar a flecha que destruiu o núcleo do Deus Marcado. Mas o poder de criar flechas do nada vem de uma âncora: o portador doa seu movimento ao arco.",
    note: "⚠ AMALDIÇOADA — Ancorado: Não requer flechas e tem alcance 18 hex. MAS enquanto equipado, Movimento = 0 (o portador não pode se mover em combate de nenhuma forma — incluindo habilidades de movimento, empurrão involuntário ou qualquer deslocamento). Reações de movimento também são bloqueadas.",
    curseDetails: "Item único do Herói Ferrath. Localização: Arquivo Secreto dos Arcanistas de Akaen (dif.3). Para recuperá-lo é preciso resolver o enigma dos Cinco Marcos." },


  /* ── THURGOMUR (Divindade dos Anões — Deus da Forja e da Terra) ── */
  { tier: "ancestral", divine: "Thurgomur", race: "anão",
    name: "Martelo de Thurgomur — O Primeiro Golpe", dmg: "2d10 + 1d8", req: "FOR", weight: 12, defenseDegrade: null,
    slot: ["primary"], heavyTwoHanded: true,
    story: "O primeiro martelo que existiu — ou pelo menos os anões acreditam nisso. Thurgomur usou este martelo para bater a primeira pedra e criar as Montanhas de Atrelon. Depois o enterrou no núcleo da montanha como semente. Quando a Tartaruga Magnalaga absoveu a contaminação do Grande Lago, o vibração do processo fez o martelo subir à superfície pela primeira vez em 500 anos.",
    note: "🌟 DIVINO — Golpe da Criação: acertos com este martelo deixam marcas permanentes no campo de batalha — cada acerto cria um obstáculo de pedra de 1 hex (impassável, pode ser destruído com 20+ de dano). Passivo: o portador não pode ser movido contra sua vontade (raízes de pedra seguram). Uma vez por dia: 'Forja Divina' — toca um aliado e repara magicamente uma armadura ou arma quebrada E adiciona +1d6 de dano permanente a ela.",
    curseDetails: "Localização: Núcleo da Tartaruga Magnalaga (acessível apenas durante um mergulho de Magnalaga, dif.4). Os Anões do Casco são os guardiões — podem ser aliados ou obstáculos." },

  /* ── TOBI (Divindade dos Goblins — Deus da Travessura e Oportunidade) ── */
  { tier: "lendario", divine: "Tobi", race: "goblin",
    name: "Estilingue de Oportunidade de Tobi", dmg: "1d6 + 1d6", req: "DEX", weight: 0.5, defenseDegrade: null,
    slot: ["primary"], range: 10,
    story: "Tobi não é um deus sério. Ele é o que os goblins chamam de deus mas que todos os outros chamariam de 'problema'. O estilingue foi construído pelo Goblin Mais Sortudo que Existiu, que nunca teve mais que 3 moedas mas sempre aparecia com comida, informações valiosas e às vezes cavalos que claramente não eram seus. Tobi abençoou o estilingue porque achou graça.",
    note: "🌟 DIVINO — Oportunidade de Tobi: cada projétil disparado tem 25% de chance (1d4=1) de acertar TAMBÉM um segundo alvo aleatório no raio (Tobi sempre aproveita oportunidades). Passivo: ao usar Furtividade no mesmo turno, o dano é triplicado (sneak attack divino). Uma vez por sessão: 'Sorte do Goblin' — troca qualquer resultado de dado (seu ou do inimigo) por outro resultado à sua escolha.",
    curseDetails: "Localização: Toca do Goblin Mais Sortudo (qualquer cidade — Tobi move o item aleatoriamente entre sessões). O Mestre joga 1d6 no início de cada sessão para determinar onde está." },

];

const WEAPONS_MAGIC = [
  /* --- COMUNS --- */
  { tier: "comum", name: "Cajado de Batalha", dmg: "1d8", req: "INT", weight: 4, defenseDegrade: null, slot: ["primary"], note: "Conjura sem penalidade.", heavyTwoHanded: true },
  { tier: "comum", name: "Varinha", dmg: "1d4", req: "INT/SAB", weight: 1, defenseDegrade: 2, slot: ["primary","secondary"], note: "Canaliza magias menores." },
  { tier: "comum", name: "Grimório de Combate", dmg: "—", req: "INT", weight: 2, defenseDegrade: 2, slot: ["secondary"], note: "+1 Slot de Magia enquanto equipado." },
  { tier: "comum", name: "Orbe Arcano", dmg: "1d4", req: "INT/SAB", weight: 1, defenseDegrade: 2, slot: ["secondary"], note: "+1d4 em testes de Arcanismo enquanto equipado." },

  /* --- MÁGICOS --- */
  { tier: "magico", name: "Cetro da Cobra Dourada", dmg: "1d6 + 1d4", req: "INT/SAB", weight: 2, defenseDegrade: 2, slot: ["primary","secondary"],
    story: "Moldado por sacerdotes de Jurgmund a partir da muda de uma cobra sagrada. A cada ano, a escama cobre da empunhadura se renova, e o cetro fica levemente mais poderoso.",
    note: "Magias conjuradas com este cetro adicionam +1d4 de dano. Uma vez por sessão, ao conjurar uma magia de cura, a cura é dobrada." },

  /* --- LENDÁRIOS --- */
  { tier: "lendario", name: "Bastão das Entranhas do Mundo", dmg: "1d8 + 1d6 + 1d4", req: "INT/SAB", weight: 4, defenseDegrade: null, slot: ["primary"],
    story: "Encontrado nas profundezas abaixo de Serpentara, onde o calor da terra se mistura com a energia primordial de Jurgmund. Os anéis de cobra que formam seu cabo nunca param de se mover levemente — como se estivessem vivos.",
    note: "Passivo: +1d6 em todas as magias de veneno, terra ou natureza. Três vezes por dia, ao conjurar qualquer magia, pode adicionar um efeito de paralisia leve (alvo perde 1 Ação de Reação).", heavyTwoHanded: true },

  /* ── DEUS DO VERMELHÃO (Divindade dos Karlacs — O Fogo que Cresce) ── */
  { tier: "ancestral", divine: "Vermelhão", race: "karlac",
    name: "Chama-Viva de Karloth", dmg: "2d8 + 1d12", req: "FOR/SAB", weight: 4, defenseDegrade: null,
    slot: ["primary"], heavyTwoHanded: true,
    story: "O Deus do Vermelhão não tem nome — os Karlacs o chamam de Vermelhão porque é a cor do fogo que consome os fragmentos do Deus Marcado. Este cajado foi formado espontaneamente na boca do Vulcão de Karloth quando a Grande Salamandra Karlac passou pela área pela primeira vez. Os Karlacs acreditam que o cajado é um pedaço do coração do vulcão que Vermelhão exteriorizou para o povo que vive nele.",
    note: "🌟 DIVINO — Fogo Crescente: a cada rodada de combate, o dano aumenta em +1d6 (acumula sem limite — rodada 1=+1d6, rodada 2=+2d6, rodada 3=+3d6...). Se o portador receber dano de fogo ou de fonte da Karlac: o acúmulo não é zerado — é dobrado (+2d6 por rodada no acúmulo). Uma vez por combate: 'Vermelhão Desperto' — libera todo o fogo acumulado em área 4x4 hex (dano = todo o dano acumulado até este momento).",
    curseDetails: "Localização: Boca do Vulcão de Karloth (acessível apenas durante erupção menor, dif.4). O Dragão Dourado é o guardião — não ataca, mas exige que o portador prove que entende a natureza do fogo crescente." },

];

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
  { tier: "magico", name: "Arco Élfico da Serpente Alada", dmg: "1d8 + 1d6", range: 16, req: "DEX (alto)", weight: 2, defenseDegrade: null, slot: ["primary"],
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
    note: "Passivo: imune a dano de ácido e veneno. Uma vez por combate, ao ser atingido por magia de qualquer tipo, absorve a magia completamente (sem dano) e converte em 1d8 de HP para o portador. Aliados em raio 2 hex ficam imunes a efeitos de Corrupção enquanto este escudo estiver levantado." }
];

const ARMORS = [
  /* --- COMUNS --- */
  { tier: "comum", name: "Roupas Comuns", physDefense: 0, magDefense: 0, weight: 1, movePenalty: 0, req: "—" },
  { tier: "comum", name: "Armadura de Couro", physDefense: 2, magDefense: 0, weight: 5, movePenalty: 0, req: "—", note: "Leve e silenciosa; boa para exploração." },
  { tier: "comum", name: "Armadura de Couro Batido", physDefense: 3, magDefense: 0, weight: 7, movePenalty: 0, req: "DEX", note: "Camadas sobrepostas; melhor proteção sem perder mobilidade." },
  { tier: "comum", name: "Cota de Malha", physDefense: 5, magDefense: 0, weight: 14, movePenalty: 1, req: "FOR", note: "Padrão de infantaria pesada." },
  { tier: "comum", name: "Armadura de Placas Parcial", physDefense: 7, magDefense: 0, weight: 20, movePenalty: 2, req: "FOR", note: "Cobertura completa de torso e membros; movimento reduzido." },
  { tier: "comum", name: "Armadura de Placas Completa", physDefense: 9, magDefense: 0, weight: 28, movePenalty: 3, req: "FOR alta", note: "Proteção máxima; apenas para tanques de combate." },
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
    magicBonus: { hp: 30, reactions: 1, carry: 15 },
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

  { tier: "lendario", setName: "Muralha de Durrak", name: "Armadura de Ferro Negro de Durrak (Muralha de Durrak)", physDefense: 9, magDefense: 2, weight: 30, movePenalty: 3, req: "FOR alta",
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
  { tier: "raro", name: "Placa do Guardião Imóvel", physDefense: 9, magDefense: 1, weight: 20, movePenalty: 3, req: "FOR alta",
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
    name: "Casca do Caranguejo Primordial", physDefense: 12, magDefense: 0, weight: 25, movePenalty: 4, req: "FOR alta",
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

];

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
    magicBonus: { reactions: 1 },
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
    magicBonus: { reactionActions: 1 },
    effect: "+1 Ação de Reação por rodada.",
    story: "Elmo com viseira dupla que amplia o campo de visão periférico. Guardas de fronteira de Valdris os usam para detectar ataques laterais. O encantamento adicional foi desenvolvido após a primeira aparição dos Cultistas do Aralto." },

  /* --- MÁGICOS: Múltiplos bônus de ações + atributos + vida --- */
  { tier: "magico", name: "Colar da Reação Arcana", weight: 0.3,
    magicBonus: { reactions: 1, reactionActions: 1, spellActions: 1 },
    effect: "+1 Reação, +1 Ação de Reação e +1 Ação de Magia por rodada. Permite conjurar magias como Reação sem custo extra de Ação.",
    story: "Criado pela Grande Maga Sela de Arcath para os poucos estudantes que conseguiam dividir atenção entre combate e conjuração. Apenas três foram feitos — e um está desaparecido junto com um estudante." },
  { tier: "magico", name: "Elmo do Herói Inabalável", weight: 2.5,
    magicBonus: { reactions: 1, hp: 15 },
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
    magicBonus: { attr: "DEX", attrValue: 1, reactionActions: 1 },
    effect: "+1 DEX e +1 Ação de Reação por rodada. Bônus de DEX afeta testes que usam o atributo.",
    story: "Pulseira de prata com runas de precisão gravadas na face interna. Originária da escola de Arcath — criada para conjuradores que precisavam de destreza para gestos mágicos complexos." },
  { tier: "magico", name: "Anel da Agilidade do Caçador", weight: 0.1,
    magicBonus: { attr: "AGI", attrValue: 1, actions: 1 },
    effect: "+1 AGI e +1 Ação de Combate por rodada. Bônus de AGI afeta Ações, Ações de Reação, Esquiva e Movimento.",
    story: "Anel forjado com liga de osso de Lobo Alfa e prata do deserto. Os Caçadores das Planícies o consideram o presente mais valioso que um mestre pode dar a um aprendiz que completou sua primeira caçada perigosa." },

  /* --- LENDÁRIOS: Bônus poderosos múltiplos --- */
  { tier: "lendario", name: "Coroa dos Cinco Heróis", weight: 0.8,
    magicBonus: { actions: 1, reactions: 1, reactionActions: 1, spellActions: 1, hp: 25 },
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
    magicBonus: { actions: 2, reactionActions: 2, move: 2 },
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
    magicBonus: { reactions: 0 },
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
    magicBonus: { hp: 50, reactions: 2 },
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
    magicBonus: { hp: 15, reactions: 1 },
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

];

const ALL_WEAPONS = [...WEAPONS_ONE_HAND, ...WEAPONS_TWO_HAND, ...WEAPONS_MAGIC, ...WEAPONS_RANGED];


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
    story: "Branco, inodoro. Parece giz comum até a segunda olhada. Na segunda olhada, você percebe que estava olhando sem enxergar." }
];


/* ================================================================
   SUBCLASSES — Escolhidas após a classe no wizard
   Cada subclasse tem 4 habilidades; o jogador escolhe 2 para
   adicionar à ficha como habilidades disponíveis para comprar.
   sinergyClasses: classes que têm bônus extras com esta subclasse
   commonToAll: true = qualquer classe pode pegar
   ================================================================ */
const SUBCLASSES = {

  necromante: {
    name: "Necromante",
    icon: "💀",
    description: "Estuda o limite entre vida e morte. Invoca aliados dos mortos, drena energia vital e comanda exércitos de ossos e carne corrompida.",
    sinergyClasses: ["mago", "clerigo"],
    sinergyNote: "Magos e Clérigos: mortos-vivos invocados têm +25% de HP e +1d4 de dano.",
    skills: [
      {
        id: "sub-necro-levanta",
        name: "Levantar das Cinzas",
        cost: "2 pontos",
        tier: 1,
        commonToAll: true,
        effect: "1 vez por combate: levanta um cadáver adjacente como Morto-Vivo Menor aliado (HP=30, dano=1d6, age no seu turno). Máximo de 1 morto ativo com este nível.",
        levels: [
          { level: 1, effect: "1 Morto-Vivo Menor (HP 30, dano 1d6, dura o combate)." },
          { level: 2, effect: "2 Mortos-Vivos simultaneamente. HP 40, dano 1d8." },
          { level: 3, effect: "3 Mortos. HP 55, dano 1d10. Ao morrer, cada um explode (1d6 raio 1 hex)." }
        ],
        example: "O feiticeiro aponta para o guarda caído — a carcaça se levanta como escudo de ossos."
      },
      {
        id: "sub-necro-drenar",
        name: "Drenar Essência",
        cost: "2 pontos",
        tier: 1,
        commonToAll: true,
        effect: "Ação de Magia: drena 1d8+SAB HP de um alvo vivo visível em até 6 hex. Cura o necromante pela metade (arredondado para cima). Resistência FOR (normal) para metade do dano.",
        levels: [
          { level: 1, effect: "1d8+SAB de dano, cura metade." },
          { level: 2, effect: "2d8+SAB de dano, cura metade. Falha na resistência: reduz 1 FOR temporariamente." },
          { level: 3, effect: "3d8+SAB, cura total (não metade). FOR afetada retorna só após descanso longo." }
        ],
        example: "A vitalidade da vítima flui como névoa dourada até as mãos do necromante."
      },
      {
        id: "sub-necro-aura",
        name: "Aura dos Sepulcros",
        cost: "3 pontos",
        tier: 2,
        commonToAll: false,
        sinergyClasses: ["mago", "clerigo"],
        effect: "Passivo: emana uma aura de 3 hex que causa −1d4 em todos os testes de inimigos nessa área. Mortos-vivos aliados no raio ganham +2 de Defesa Física e regeneram 2 HP/rodada.",
        levels: [
          { level: 1, effect: "Aura 3 hex. −1d4 nos testes de inimigos. Mortos: +2 Def e regen 2 HP/r." },
          { level: 2, effect: "Aura 5 hex. −1d6. Mortos: +3 Def e regen 4 HP/r." },
          { level: 3, effect: "Aura 7 hex. −1d8. Mortos ganham Imunidade a Medo e regeneram 6 HP/r." }
        ],
        example: "O ar ao redor do necromante cheira a tumba — os aliados mortos-vivos ficam mais eretos, mais fortes."
      },
      {
        id: "sub-necro-lich",
        name: "Forma Lich Parcial",
        cost: "4 pontos",
        tier: 2,
        commonToAll: false,
        sinergyClasses: ["mago"],
        effect: "Ativa por 3 rodadas (1x/combate): o necromante torna-se parcialmente não-morto — imune a veneno e dano psíquico, ganha +1d6 em magias de necromancia, e ao morrer durante a forma, pode rolar SAB (crítico) para estabilizar em 1 HP em vez de morrer.",
        levels: [
          { level: 1, effect: "3 rodadas. Imune a veneno e psíquico. +1d6 em magias de necromancia." },
          { level: 2, effect: "5 rodadas. +2d6. Ao estabilizar: retorna com 1d10 HP." },
          { level: 3, effect: "Combate inteiro. +3d6. Imune a Derrubado/Empurrado. Retorna com 2d10 HP." }
        ],
        example: "Seus olhos ficam ocos por um momento — nem vivo, nem morto. Uma fronteira que nenhum outro mortal cruza em vida."
      }
    ]
  },

  bardo: {
    name: "Bardo",
    icon: "🎭",
    description: "Arte como arma. O bardo usa música, palavras e ilusão para inspirar aliados, desconcertar inimigos e dobrar a realidade ao redor de sua performance.",
    sinergyClasses: ["mago", "ladino"],
    sinergyNote: "Magos e Ladinos: bônus de buff dura +1 rodada extra e Furtividade após performance tem −1 grau de dificuldade.",
    skills: [
      {
        id: "sub-bardo-inspira",
        name: "Inspiração Bardíca",
        cost: "2 pontos",
        tier: 1,
        commonToAll: true,
        effect: "Ação de Magia: escolhe um aliado visível. Ele ganha +1d6 em todos os ataques e testes por 2 rodadas. Pode ser usado no turno do aliado (como Reação).",
        levels: [
          { level: 1, effect: "+1d6 em ataques e testes por 2 rodadas. 2 usos/combate." },
          { level: 2, effect: "+1d8. 3 usos. Pode afetar 2 aliados diferentes por uso." },
          { level: 3, effect: "+1d10. Ilimitado. Aliados afetados também curam 1d6 HP ao receber o bônus." }
        ],
        example: "Uma frase no momento certo pode valer mais que qualquer espada."
      },
      {
        id: "sub-bardo-persuasao",
        name: "Palavras de Mel",
        cost: "2 pontos",
        tier: 1,
        commonToAll: true,
        effect: "Fora de combate: +1d6 em todos os testes de Persuasão, Sedução, Negociação e Enganação. Em combate: 1 Ação de Magia para tentar convencer 1 inimigo a não atacar por 1 rodada (SAB difícil para resistir).",
        levels: [
          { level: 1, effect: "+1d6 social. Convencer inimigo: SAB difícil." },
          { level: 2, effect: "+1d8 social. Pode convencer até 2 inimigos com 1 Ação. SAB difícil." },
          { level: 3, effect: "+1d10 social. Inimigos convencidos ficam Amistosos por 1d3 rodadas se não forem atacados." }
        ],
        example: "O guarda que deveria chamar reforços de repente acha que aqueles aventureiros são velhos amigos."
      },
      {
        id: "sub-bardo-performance",
        name: "Performance de Batalha",
        cost: "3 pontos",
        tier: 2,
        commonToAll: false,
        sinergyClasses: ["mago", "ladino"],
        effect: "1 Ação: performance que afeta todos os aliados em raio 5 hex por 3 rodadas. Eles ganham +1 Ação de Combate extra por turno E +1d4 em Esquiva. Enquanto durar: o bardo deve gastar ao menos 1 Ação por turno na performance (se não puder, ela encerra).",
        levels: [
          { level: 1, effect: "+1 Ação e +1d4 Esquiva para aliados em raio 5. Dura 3 rodadas." },
          { level: 2, effect: "Raio 7. Dura 4 rodadas. +1d6 Esquiva." },
          { level: 3, effect: "Raio 10. Dura combate inteiro. +1d8 Esquiva. Aliados também ficam imunes a Medo." }
        ],
        example: "A melodia cresce. Os aliados sentem cada movimento fluir — como dançar em combate."
      },
      {
        id: "sub-bardo-ilusao",
        name: "Ilusão Magistral",
        cost: "3 pontos",
        tier: 2,
        commonToAll: false,
        sinergyClasses: ["ladino"],
        effect: "Ação de Magia: cria uma ilusão perfeita (visual+sonora) de qualquer cena ou pessoa em raio 3 hex por 5 rodadas. Inimigos que interagem testam INT (normal) para perceber. Pode criar ilusão de si mesmo para confundir ataques (30% chance de o ataque acertar a ilusão em vez do bardo).",
        levels: [
          { level: 1, effect: "Ilusão área 3x3 hex, 5 rodadas. 30% desvio." },
          { level: 2, effect: "Área 5x5. 8 rodadas. 50% desvio. INT difícil para perceber." },
          { level: 3, effect: "Área livre. Combate inteiro. 60% desvio. Ilusão pode mover-se e agir." }
        ],
        example: "O dragão que os inimigos veem não existe. O medo, porém, é absolutamente real."
      }
    ]
  },

  paladino: {
    name: "Paladino",
    icon: "⚔️",
    description: "A fé como armadura. O paladino combina poder marcial com graça divina, protegendo aliados e punindo inimigos com magias sagradas.",
    sinergyClasses: ["guerreiro", "clerigo"],
    sinergyNote: "Guerreiros e Clérigos: +1 Ação de Magia gratuita por combate e +2 em Defesa Física quando abaixo de 50% HP.",
    skills: [
      {
        id: "sub-palad-escudo",
        name: "Escudo da Fé",
        cost: "2 pontos",
        tier: 1,
        commonToAll: true,
        effect: "Ação de Magia: cria um escudo de luz sagrada em si mesmo ou em um aliado. Concede +2 Defesa Física e +2 Defesa Mágica por 3 rodadas. Ataques de criaturas corrompidas (Araltos, mortos-vivos) são reduzidos em +1d4 adicional.",
        levels: [
          { level: 1, effect: "+2 Def.Fís e +2 Def.Mag por 3 rodadas." },
          { level: 2, effect: "+3/+3. 4 rodadas. O escudo devolve 1d4 de luz sagrada a quem atacar o portador." },
          { level: 3, effect: "+4/+4. 5 rodadas. Qualquer aliado que encostar no portador também recebe o bônus." }
        ],
        example: "A luz não cega. Ela só incomoda quem caminha nas trevas."
      },
      {
        id: "sub-palad-slot",
        name: "Fervor Sagrado",
        cost: "2 pontos",
        tier: 1,
        commonToAll: true,
        effect: "Passivo: +1 Slot de Magia permanente. Além disso, 1 vez por descanso longo: recupera todos os Slots de Magia instantaneamente por 1 turno de oração (não pode agir neste turno).",
        levels: [
          { level: 1, effect: "+1 Slot permanente. 1x/descanso longo: recupera todos os Slots." },
          { level: 2, effect: "+2 Slots permanentes. 1x/sessão: recupera Slots sem perder turno." },
          { level: 3, effect: "+3 Slots permanentes. 1x/combate: recupera metade dos Slots como Ação Livre." }
        ],
        example: "Onde outros ficam exaustos de magia, o paladino encontra mais uma reserva — a fé não esgota."
      },
      {
        id: "sub-palad-punir",
        name: "Punição Divina",
        cost: "3 pontos",
        tier: 2,
        commonToAll: false,
        sinergyClasses: ["guerreiro", "clerigo"],
        effect: "Ao acertar um ataque físico: pode gastar 1 Slot de Magia para adicionar 1d8+SAB de dano sagrado ao golpe. Criaturas corrompidas ou mortas-vivas sofrem 1d8+SAB extra (dobro deles). Resistência SAB (normal) para metade.",
        levels: [
          { level: 1, effect: "+1d8+SAB sagrado ao acertar (gasta 1 Slot). Dobro em corrompidos." },
          { level: 2, effect: "+2d8+SAB. Corrompidos ficam Cegos por 1 rodada." },
          { level: 3, effect: "+3d8+SAB. Corrompidos são Empurrados 3 hex e ficam Atordoados 1 rodada." }
        ],
        example: "O golpe não é do guerreiro. É da convicção que move o braço dele."
      },
      {
        id: "sub-palad-aura",
        name: "Aura de Proteção",
        cost: "3 pontos",
        tier: 2,
        commonToAll: false,
        sinergyClasses: ["clerigo"],
        effect: "Passivo: todos os aliados em raio 3 hex ganham +1 em todos os testes de Resistência e +1d4 em Força de Vontade. 1 vez por combate: pode absorver o próximo dano que um aliado adjacente sofreria (o paladino recebe o dano em vez do aliado).",
        levels: [
          { level: 1, effect: "Raio 3. +1 resistências e +1d4 Força de Vontade para aliados." },
          { level: 2, effect: "Raio 5. +1d6 Força de Vontade. Absorção 2x/combate." },
          { level: 3, effect: "Raio 7. +1d8. Absorção ilimitada. O paladino recebe 50% do dano absorvido (não total)." }
        ],
        example: "Eles não precisam saber que ele está absorvendo os golpes. Só precisam estar vivos."
      }
    ]
  },

  alquimista: {
    name: "Alquimista",
    icon: "⚗️",
    description: "Ciência como arte. O alquimista transforma ingredientes em poções, pergaminhos e artefatos — e usa esses itens com maestria que nenhum outro possui.",
    sinergyClasses: ["mago", "arqueiro"],
    sinergyNote: "Magos e Arqueiros: poções criadas têm +50% de efeito e pergaminhos criados podem conter magias de nível +1 acima do normal.",
    skills: [
      {
        id: "sub-alq-criacao",
        name: "Criação de Poções",
        cost: "2 pontos",
        tier: 1,
        commonToAll: true,
        effect: "Durante descanso longo: cria 1d3 poções de um tipo à escolha (cura menor, veneno básico, antídoto, força, velocidade). Requer ingredientes (ervas ou componentes — Mestre define disponibilidade). Poções criadas têm efeito +1d4 a mais que as padrão.",
        levels: [
          { level: 1, effect: "Cria 1d3 poções simples. +1d4 de efeito. Tipos: cura/veneno/antídoto/força." },
          { level: 2, effect: "Cria 1d4 poções. +1d6. Novos tipos: invisibilidade, mana, resistência a elemento." },
          { level: 3, effect: "Cria 1d6 poções. +1d8. Pode criar Elixir da Ressurreição (1x por semana, exige ingredientes raros)." }
        ],
        example: "Três ervas, um pouco de fel de dragão e dez minutos. O ferido vai estar de pé antes do amanhecer."
      },
      {
        id: "sub-alq-pergaminho",
        name: "Inscrição de Pergaminhos",
        cost: "2 pontos",
        tier: 1,
        commonToAll: true,
        effect: "Durante descanso longo: copia uma magia conhecida em um pergaminho (gasta 1 Slot de Magia permanentemente até o próximo descanso longo). O pergaminho pode ser usado por qualquer um — mesmo sem conhecer a magia. Pergaminhos duram até serem usados.",
        levels: [
          { level: 1, effect: "Cria pergaminho de magia nível 1-2. Qualquer um pode usar." },
          { level: 2, effect: "Magias nível 1-3. Pode criar 2 pergaminhos por descanso longo." },
          { level: 3, effect: "Magias nível 1-5. 3 pergaminhos por descanso. Não gasta Slot — é puro talento." }
        ],
        example: "O arqueiro não sabe conjurar. Mas sabe segurar o pergaminho certo na hora certa."
      },
      {
        id: "sub-alq-bomba",
        name: "Bomba Alquímica",
        cost: "3 pontos",
        tier: 2,
        commonToAll: false,
        sinergyClasses: ["arqueiro", "ladino"],
        effect: "Cria e lança bombas especiais em combate (Ação): alcance 8 hex, área 2x2 hex. Tipos: Ácido (2d6 imediato + 1d4/rodada 3r), Fogo (2d8 imediato + incendeia), Gelo (1d8 + Lentidão 2r), Fumaça (cria nuvem cegante 3 rodadas). 3 bombas por descanso longo.",
        levels: [
          { level: 1, effect: "3 bombas/descanso. Alcance 8. Área 2x2. Escolhe tipo." },
          { level: 2, effect: "4 bombas. Área 3x3. Pode misturar 2 tipos na mesma bomba (+1 ingrediente)." },
          { level: 3, effect: "5 bombas. Área 4x4 ou linha 8 hex. Bombas misturadas causam efeito extra único." }
        ],
        example: "Não é explosão. É precisão com resultados explosivos."
      },
      {
        id: "sub-alq-transmuta",
        name: "Transmutação Rápida",
        cost: "3 pontos",
        tier: 2,
        commonToAll: false,
        sinergyClasses: ["mago"],
        effect: "Ação de Magia: transmuta um objeto não-mágico tocado em outro de peso similar (madeira em metal, pedra em vidro, água em óleo). O efeito é permanente. Em combate: pode transmutir a arma de um inimigo adjacente (AGI difícil para resistir — a arma vira pão, chumbo etc.). Ou: transmuta veneno em antídoto (remove veneno de aliado).",
        levels: [
          { level: 1, effect: "Transmuta objetos simples. Arma inimiga: AGI difícil ou vira objeto inútil." },
          { level: 2, effect: "Objetos maiores. Pode transmutir armadura (vira pano por 2 rodadas)." },
          { level: 3, effect: "Transmuta qualquer não-mágico. Pode reverter transmutação com Ação livre." }
        ],
        example: "A espada do inimigo vira pão no meio do golpe. O ataque continua — o resultado, não."
      }
    ]
  },

  druida: {
    name: "Druida",
    icon: "🌿",
    description: "A voz da natureza. O druida invoca animais, manipula o terreno e transforma o campo de batalha numa extensão da floresta primordial.",
    sinergyClasses: ["arqueiro", "clerigo"],
    sinergyNote: "Arqueiros e Clérigos: animais invocados têm +50% de HP e o druida pode invocar um animal como Ação Livre (sem custo) 1x/combate.",
    skills: [
      {
        id: "sub-druid-invocar",
        name: "Invocar Animal",
        cost: "2 pontos",
        tier: 1,
        commonToAll: true,
        effect: "Ação de Magia: invoca um animal aliado que age no seu turno. Escolhe o tipo (lobo, águia, urso, cobra). O animal some ao morrer ou ao fim do combate. 2 usos por combate.",
        levels: [
          { level: 1, effect: "1 animal por vez. Lobo (HP 25, dano 1d8), Águia (HP 18, voa, 1d6), Cobra (1d4+veneno), Urso (HP 35, 1d10)." },
          { level: 2, effect: "2 animais simultâneos. Criaturas maiores: Grifo (HP 40, voa, 1d10), Leão (HP 45, 1d12)." },
          { level: 3, effect: "3 animais. Criatura especial: Elemental da Floresta (HP 80, 2d8, Raízes como Ação)." }
        ],
        example: "O druida assobia uma vez. Da floresta emergem olhos amarelos no escuro."
      },
      {
        id: "sub-druid-terreno",
        name: "Moldar Terreno",
        cost: "2 pontos",
        tier: 1,
        commonToAll: true,
        effect: "Ação de Magia: altera o terreno em área 3x3 hex ao redor de um ponto visível. Tipos: Raízes (terreno difícil, quem tentar correr testa AGI normal ou cai), Espinhos (1d4 dano ao cruzar), Névoa (visibilidade 1 hex), Água (lama — −2 Movimento). Efeito dura 4 rodadas.",
        levels: [
          { level: 1, effect: "Área 3x3. Duração 4 rodadas. 2 usos/combate." },
          { level: 2, effect: "Área 5x5. 5 rodadas. Pode combinar 2 efeitos na mesma área." },
          { level: 3, effect: "Área 7x7. Duração combate inteiro. 3 combinações simultâneas." }
        ],
        example: "O campo de batalha escolhido pelo inimigo. O campo de batalha que o druida remolda em segundos."
      },
      {
        id: "sub-druid-forma",
        name: "Forma Selvagem",
        cost: "3 pontos",
        tier: 2,
        commonToAll: false,
        sinergyClasses: ["arqueiro"],
        effect: "Ação: transforma-se em animal por 4 rodadas (1x/combate). Mantém INT e SAB; ganha todas as estatísticas físicas e habilidades do animal. Formas: Urso (HP +50, Dano 2d8, Garras), Lobo (Movimento +3, ataque derruba), Águia (voa altitude 4, 1d8+velocidade), Cobra Gigante (Constrição 1d8/r).",
        levels: [
          { level: 1, effect: "4 rodadas. 1x/combate. Formas básicas: urso, lobo, águia, cobra." },
          { level: 2, effect: "6 rodadas. 2x/combate. Formas avançadas: Tigre-Dente-de-Sabre (2d10, ignora 4 def.), Crocodilo (Agarrar automático)." },
          { level: 3, effect: "Combate inteiro. Ilimitado. Forma Híbrida: mantém equipamentos e pode conjurar magias na forma." }
        ],
        example: "O arqueiro abaixa o arco. O urso já não precisa de flechas."
      },
      {
        id: "sub-druid-cura",
        name: "Cura da Natureza",
        cost: "3 pontos",
        tier: 2,
        commonToAll: false,
        sinergyClasses: ["clerigo"],
        effect: "Ação de Magia: cura 2d8+SAB HP em 1 aliado tocado ou a até 4 hex. Remove 1 condição negativa (veneno, sangramento, paralisia). Em terreno natural (floresta, grama, rio): cura dobrada e remove 2 condições. 3 usos por combate.",
        levels: [
          { level: 1, effect: "2d8+SAB HP. Remove 1 condição. 3 usos. Dobro em terreno natural." },
          { level: 2, effect: "3d8+SAB HP. Remove 2 condições. Pode afetar 2 alvos com 1 uso em terreno natural." },
          { level: 3, effect: "4d8+SAB HP. Remove todas as condições. Em terreno natural: cura todos os aliados no raio 5 hex de uma vez." }
        ],
        example: "As raízes do chão reconhecem a mão do druida — e trazem vida de volta à superfície."
      }
    ]
  },

  berserker: {
    name: "Berserker",
    icon: "🔥",
    description: "Dor como combustível. O berserker troca vida por poder — quanto mais ferido, mais perigoso. A linha entre guerreiro e fera se apaga na fúria.",
    sinergyClasses: ["guerreiro", "ladino"],
    sinergyNote: "Guerreiros e Ladinos: habilidades de Fúria têm +1d6 de dano extra e penalidades de HP são reduzidas em 25%.",
    skills: [
      {
        id: "sub-berserk-furia",
        name: "Fúria de Batalha",
        cost: "2 pontos",
        tier: 1,
        commonToAll: true,
        effect: "Ação Livre (1x/combate): entra em Fúria por 4 rodadas. Em Fúria: +1d8 de dano em todos os ataques físicos, +1 Ação de Combate por turno, imune a Medo e Atordoado. Custo: perde 3 HP por rodada enquanto em Fúria (dano da adrenalina). Ao sair da Fúria: 1 rodada de Exaustão (−1 Ação).",
        levels: [
          { level: 1, effect: "4 rodadas. +1d8 dano, +1 Ação. Perde 3 HP/r. Exaustão 1 rodada." },
          { level: 2, effect: "5 rodadas. +1d10 dano. Sem penalidade de exaustão." },
          { level: 3, effect: "Combate inteiro. +1d12 dano, +2 Ações. Sem custo de HP por rodada." }
        ],
        example: "A ferida no ombro parou de doer. Isso nunca é bom sinal para quem está na frente."
      },
      {
        id: "sub-berserk-sangue",
        name: "Sede de Sangue",
        cost: "2 pontos",
        tier: 1,
        commonToAll: true,
        effect: "Passivo: ao reduzir um inimigo a 0 HP, recupera 1d8 HP imediatamente e ganha +1d6 no próximo ataque (o momentum da matança). Se em Fúria, recupera 1d10 HP e ganha +1 Ação extra neste turno.",
        levels: [
          { level: 1, effect: "Matar → +1d8 HP e +1d6 no próximo ataque." },
          { level: 2, effect: "+1d10 HP e +1d8. Em Fúria: +1 Ação e a Fúria é estendida em 1 rodada por morte." },
          { level: 3, effect: "+2d8 HP. Em Fúria: recupera HP igual ao dano do golpe final (câmbio total)." }
        ],
        example: "O corpo caiu. O berserker nem percebeu — já escolheu o próximo."
      },
      {
        id: "sub-berserk-escudo-carne",
        name: "Escudo de Carne",
        cost: "3 pontos",
        tier: 2,
        commonToAll: false,
        sinergyClasses: ["guerreiro"],
        effect: "Passivo: pode gastar HP próprio (até 10 por Ação de Reação) para reduzir o dano de um aliado adjacente pelo mesmo valor — o berserker absorve o golpe com o corpo. Ao fazer isso: ganha +1d6 de dano no próximo ataque (a dor se converte em raiva).",
        levels: [
          { level: 1, effect: "Absorve até 10 HP de dano de aliado por Reação. +1d6 no próximo ataque." },
          { level: 2, effect: "Absorve até 20 HP. +1d8. Pode absorver 2x por rodada." },
          { level: 3, effect: "Absorve qualquer valor. +1d10 por absorção. O aliado protegido ganha +1 Ação no próximo turno (por saber que alguém morreu pelo dele)." }
        ],
        example: "— Atrás de mim. / — Você vai— / — Atrás. De mim."
      },
      {
        id: "sub-berserk-limiar",
        name: "No Limiar da Morte",
        cost: "3 pontos",
        tier: 2,
        commonToAll: false,
        sinergyClasses: ["ladino"],
        effect: "Passivo: ao ficar abaixo de 30% HP, entra em estado de Limiar automaticamente — o dano de todos os ataques é aumentado em +2d6, ganha Imunidade a Inconsciente (não cai a 0 HP — fica a 1 HP em vez de cair) e Movimento +2. O estado dura até o combate acabar ou o berserker ser curado acima de 50% HP.",
        levels: [
          { level: 1, effect: "Abaixo de 30%: +2d6 dano, imune a Inconsciente, +2 Mov." },
          { level: 2, effect: "+3d6. Imunidade dura 2 rodadas após ser curado acima de 50%." },
          { level: 3, effect: "+4d6. Imune a Inconsciente o combate inteiro. Quando entra no Limiar: todos os inimigos em raio 3 hex testam SAB ou ficam Amedrontados por 2 rodadas." }
        ],
        example: "Ele sangra. Ele sorri. São os inimigos que começam a ter medo."
      }
    ]
  }

};

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
  weapon: ALL_WEAPONS.map(w => ({ ...w, category: "weapon" })),
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
  { icon: "🗺", label: "História do Mundo",     available: true,  action: "openHistory" },
  { icon: "📅", label: "Acompanhamento",        available: true,  action: "openCampaignLog" },
  { icon: "🏰", label: "Locais & Reinos",       available: true,  action: "openLocations" },
  { icon: "🗾", label: "Mapa de Aether",        available: true,  action: "openMap" },
  { icon: "⚔",  label: "Campo de Batalha",      available: true,  action: "openBattleMap" }
];

/* ---------------------------------------------------------------------- */
/* SISTEMA DE TESTES DE PERÍCIA                                           */
/* Cada teste define: quais atributos somam ao resultado base (attrKeys), */
/* se é "learned" (requer treinamento p/ +2) e, se combate, o efeito.   */
/* As 3 dificuldades são calculadas automaticamente:                      */
/*   Normal = 10 + bônus    Difícil = 5 + bônus    Crítico = 1 + bônus  */
/* ---------------------------------------------------------------------- */

const SKILL_TESTS = [
  /* ---- Percepção e Sentidos ---- */
  { name: "Percepção",          icon: "👁",  attrKeys: ["SAB","AGI"],  desc: "Detectar detalhes sutis no ambiente, emboscadas ocultas e criaturas furtivas.", learned: true },
  { name: "Pressentimento",     icon: "🌀",  attrKeys: ["SAB"],        desc: "Sentir quando algo está errado mesmo sem evidências concretas.", learned: false },

  /* ---- Investigação e Conhecimento ---- */
  { name: "Investigação",       icon: "🔍",  attrKeys: ["INT","AGI"],  desc: "Analisar pistas, cenas de crime, textos antigos e conexões ocultas.", learned: true },
  { name: "Conhecimento",       icon: "📚",  attrKeys: ["INT"],        desc: "Recordar fatos históricos, lendas, propriedades de criaturas e itens.", learned: true },
  { name: "Arcanismo",          icon: "✨",  attrKeys: ["INT","SAB"],  desc: "Identificar magias, itens mágicos, runas e fenômenos arcanos.", learned: true },

  /* ---- Social e Influência ---- */
  { name: "Lábia",              icon: "🗣",  attrKeys: ["SAB","DEX"],  desc: "Convencer, enganar ou manipular pessoas através de palavras.", learned: true },
  { name: "Persuasão",          icon: "🤝",  attrKeys: ["SAB"],        desc: "Negociar de boa fé, fazer pedidos razoáveis e ganhar confiança.", learned: true },
  { name: "Intimidação",        icon: "😤",  attrKeys: ["FOR","SAB"],  desc: "Impor presença física ou psicológica para forçar cooperação.", learned: false },

  /* ---- Furtividade e Destreza ---- */
  { name: "Furtividade",        icon: "🌑",  attrKeys: ["AGI","DEX"],  desc: "Mover-se silenciosamente e permanecer oculto de observadores.", learned: true },
  { name: "Acrobacia",          icon: "🤸",  attrKeys: ["AGI","DEX"],  desc: "Escapar de agarrões, manter equilíbrio em superfícies instáveis e saltar.", learned: false },

  /* ---- Físico e Força ---- */
  { name: "Atletismo",          icon: "💪",  attrKeys: ["FOR","AGI"],  desc: "Escalar, nadar, correr longas distâncias e arrombar portas.", learned: false },
  { name: "Resistência",        icon: "🦾",  attrKeys: ["FOR"],        desc: "Resistir a venenos, fadiga extrema e efeitos físicos debilitantes.", learned: false },
  { name: "Força de Vontade",   icon: "🧠",  attrKeys: ["INT","FOR"],  desc: "Resistir a efeitos mentais, manter-se firme sob pressão extrema e superar a exaustão pela determinação. Combina disciplina mental (INT) com teimosia física (FOR).", example: "Resistir ao domínio de um Aralto que tenta controlar sua mente, ou continuar lutando com 1 HP por pura obstinação.", learned: false },
  { name: "Briga",              icon: "👊",  attrKeys: ["FOR","AGI"],  desc: "Lutar sem armas: socas, agarrões, chaves e quedas.", learned: false },

  /* ---- Combate: Geral ---- */
  { name: "Retaliar",           icon: "↩",  attrKeys: ["AGI","DEX"],  desc: "Perícia de combate.", learned: true, combat: true, mechanicalEffect: "retaliate",
    combatDesc: "Ao inimigo deixar o hexágono adjacente ao seu voluntariamente, você pode gastar 1 Ação de Reação para fazer imediatamente 1 ataque corpo a corpo contra ele antes que ele complete o movimento." },
  { name: "Esquivar Rolar",     icon: "🌀",  attrKeys: ["AGI"],        desc: "Perícia de combate.", learned: true, combat: true, mechanicalEffect: "dodge_roll",
    combatDesc: "Enquanto não empunha arma de duas mãos pesada, sua Chance de Esquiva aumenta em +2 permanentemente. Reflete no campo 'Chance de Esquiva' das Estatísticas de Combate." },
  { name: "Foco de Combate",    icon: "🎯",  attrKeys: ["SAB","INT"],  desc: "Perícia de combate.", learned: true, combat: true, mechanicalEffect: "combat_focus",
    combatDesc: "Uma vez por combate, ao errar um ataque, você pode re-rolar o dado de ataque e ficar com o resultado mais alto. Sem custo de ação — ativa automaticamente ao anunciar que errou." },
  { name: "Guardião de Flanco", icon: "🛡",  attrKeys: ["FOR","SAB"],  desc: "Perícia de combate.", learned: true, combat: true, mechanicalEffect: "flank_guard",
    combatDesc: "Enquanto você está de pé e consciente, todos os aliados em hexágonos adjacentes ao seu ganham +1 na Chance de Defesa (passivo, sem custo de ação)." },
  { name: "Golpe de Derrubada", icon: "🔨",  attrKeys: ["FOR","AGI"],  desc: "Perícia de combate.", learned: true, combat: true, mechanicalEffect: "knockdown",
    combatDesc: "Ao acertar um ataque corpo a corpo, você pode declarar 'Derrubada' antes de rolar o dano. O alvo deve fazer um teste de Resistência (normal); se falhar, cai Prostrado por 1 rodada." },

  /* ---- Combate: Armas de Uma Mão ---- */
  { name: "Desarmamento",       icon: "🤚",  attrKeys: ["DEX","AGI"],  desc: "Perícia de combate.", learned: true, combat: true, mechanicalEffect: "disarm",
    combatDesc: "Ao acertar um ataque com arma de uma mão, você pode declarar 'Desarmamento' em vez de causar dano. O alvo deve passar num teste de Resistência (difícil) ou derruba a arma que estava segurando no hexágono adjacente." },
  { name: "Duelista",           icon: "⚔",  attrKeys: ["DEX","SAB"],  desc: "Perícia de combate.", learned: true, combat: true, mechanicalEffect: "duelist",
    combatDesc: "Se você não está usando a mão secundária para nada (sem escudo, sem arma secundária), ganha +1 na Chance de Defesa com arma de uma mão. Passivo, sem custo de ação." },

  /* ---- Combate: Armas de Duas Mãos ---- */
  { name: "Varredura",          icon: "🌪",  attrKeys: ["FOR","AGI"],  desc: "Perícia de combate.", learned: true, combat: true, mechanicalEffect: "sweep",
    combatDesc: "Uma vez por turno, ao acertar um ataque com arma de duas mãos, você pode gastar 1 Ação de Reação para fazer um segundo golpe contra um inimigo diferente adjacente ao seu. Esse segundo golpe causa apenas metade do dano." },
  { name: "Ímpeto Brutal",      icon: "💥",  attrKeys: ["FOR"],        desc: "Perícia de combate.", learned: true, combat: true, mechanicalEffect: "brutal_charge",
    combatDesc: "Se você se moveu pelo menos 2 hexágonos em linha reta antes do ataque neste turno, o próximo ataque com arma de duas mãos causa +1d6 de dano extra de impacto." },

  /* ---- Combate: Escudo ---- */
  { name: "Escudo Bash",        icon: "🛡💥", attrKeys: ["FOR","DEX"],  desc: "Perícia de combate.", learned: true, combat: true, mechanicalEffect: "shield_bash",
    combatDesc: "Ao usar um escudo como arma, você pode gastar 1 Ação para dar uma martelada com ele. Causa 1d4 de dano e força um teste de Resistência (difícil) no alvo; se falhar, ele perde 1 Ação no próximo turno." },
  { name: "Muralha Viva",       icon: "🧱",  attrKeys: ["FOR","SAB"],  desc: "Perícia de combate.", learned: true, combat: true, mechanicalEffect: "living_wall",
    combatDesc: "Enquanto tiver um escudo equipado, você pode usar uma Reação para interposar o escudo entre um aliado adjacente e um ataque a ele destinado, adicionando o bônus de Defesa Física do escudo à defesa do aliado contra esse ataque." },

  /* ---- Combate: Arco / Distância ---- */
  { name: "Tiro em Movimento",  icon: "🏃🏹", attrKeys: ["DEX","AGI"],  desc: "Perícia de combate.", learned: true, combat: true, mechanicalEffect: "moving_shot",
    combatDesc: "Você pode usar uma Ação de Movimento e uma Ação de Ataque à distância no mesmo turno sem penalidade. Normalmente, atacar à distância após se mover aplica −1 na Chance de Acerto." },
  { name: "Pressão de Distância", icon: "🎯🛡", attrKeys: ["DEX","INT"],  desc: "Perícia de combate.", learned: true, combat: true, mechanicalEffect: "ranged_pressure",
    combatDesc: "Inimigos que tentam se aproximar de você enquanto estão a mais de 3 hexágonos e você tem arma à distância equipada sofrem um Ataque de Oportunidade à distância seu." },

  /* ---- Combate: Armas Mágicas / Cajado ---- */
  { name: "Conjuração Rápida",  icon: "⚡✨", attrKeys: ["INT","DEX"],  desc: "Perícia de combate.", learned: true, combat: true, mechanicalEffect: "quick_cast",
    combatDesc: "Uma vez por combate, você pode conjurar uma magia de Nível 1 ou 2 como Ação de Reação em vez de como Ação normal. A magia ainda consome Slot e respeita seu cooldown." },
  { name: "Canalizar pelo Cajado", icon: "🪄", attrKeys: ["INT","SAB"],  desc: "Perícia de combate.", learned: true, combat: true, mechanicalEffect: "staff_channel",
    combatDesc: "Ao acertar um ataque com cajado ou arma mágica, você pode gastar 1 Ação de Reação para conjurar imediatamente uma magia de Nível 1 conhecida no mesmo alvo, sem gastar Ação de Magia para isso." }
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
    id: "rato-das-ruinas", name: "Rato das Ruínas", difficulty: 1, size: "pequeno",
    category: "Besta", location: ["Cidade", "Ruínas", "Esgoto"],
    hp: 8, physDefense: 1, magDefense: 0, dodge: 12,
    actions: 2, reactions: 1,
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
    id: "goblin-batedeira", name: "Goblin Batedeira", difficulty: 1, size: "pequeno",
    category: "Humanoide", location: ["Floresta", "Caverna", "Ruínas"],
    hp: 14, physDefense: 2, magDefense: 0, dodge: 13,
    actions: 2, reactions: 1,
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
    id: "lobo-comum", name: "Lobo Comum", difficulty: 1, size: "normal",
    category: "Besta", location: ["Floresta", "Planície", "Montanha"],
    hp: 18, physDefense: 2, magDefense: 0, dodge: 13,
    actions: 2, reactions: 1,
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
    id: "serpente-comum", name: "Serpente Venenosa", difficulty: 1, size: "pequeno",
    category: "Besta", location: ["Floresta", "Pântano", "Ruínas", "Serpentara"],
    hp: 10, physDefense: 1, magDefense: 1, dodge: 14,
    actions: 2, reactions: 1,
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
    id: "bandido-de-estrada", name: "Bandido de Estrada", difficulty: 1, size: "normal",
    category: "Humanoide", location: ["Estrada", "Floresta", "Planície"],
    hp: 20, physDefense: 3, magDefense: 0, dodge: 11,
    actions: 2, reactions: 1,
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
    id: "guerreiro-cultista", name: "Guerreiro Cultista da Marca", difficulty: 2, size: "normal",
    category: "Humanoide", location: ["Ruínas", "Caverna", "Floresta Profunda"],
    hp: 35, physDefense: 4, magDefense: 2, dodge: 12,
    actions: 2, reactions: 1,
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
    id: "lobo-das-trevas", name: "Lobo das Trevas", difficulty: 2, size: "normal",
    category: "Besta Sombria", location: ["Floresta Profunda", "Caverna", "Planície à Noite"],
    hp: 32, physDefense: 3, magDefense: 2, dodge: 14,
    actions: 2, reactions: 2,
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
    id: "sacerdote-cobra", name: "Sacerdote de Jurgmund", difficulty: 2, size: "normal",
    category: "Humanoide", location: ["Serpentara", "Templo", "Cidade"],
    hp: 28, physDefense: 2, magDefense: 5, dodge: 12,
    actions: 2, reactions: 1,
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
    id: "golem-pedra", name: "Golem de Pedra Antiga", difficulty: 2, size: "grande",
    category: "Construto", location: ["Ruínas", "Dungeon", "Templo Antigo"],
    hp: 55, physDefense: 7, magDefense: 1, dodge: 8,
    actions: 2, reactions: 0,
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
    id: "alfa-matilha", name: "Lobo Alfa da Matilha", difficulty: 3, size: "grande",
    category: "Besta", location: ["Floresta", "Montanha", "Planície"],
    hp: 75, physDefense: 5, magDefense: 2, dodge: 14,
    actions: 3, reactions: 2,
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
    id: "troll-das-cavernas", name: "Troll das Cavernas", difficulty: 3, size: "grande",
    category: "Gigante", location: ["Caverna", "Dungeon", "Montanha"],
    hp: 90, physDefense: 6, magDefense: 1, dodge: 9,
    actions: 2, reactions: 1,
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
    id: "mago-renegado", name: "Mago Renegado de Atrelon", difficulty: 3, size: "normal",
    category: "Humanoide", location: ["Ruínas de Atrelon", "Torre Abandonada", "Dungeon"],
    hp: 50, physDefense: 2, magDefense: 7, dodge: 13,
    actions: 2, reactions: 2,
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
    id: "cobra-rainha-jovem", name: "Cobra-Rainha Jovem", difficulty: 3, size: "grande",
    category: "Besta Sagrada", location: ["Serpentara", "Pântano", "Templo de Jurgmund"],
    hp: 80, physDefense: 4, magDefense: 6, dodge: 13,
    actions: 3, reactions: 2,
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
    id: "lobo-do-vazio", name: "Lobo do Vazio", difficulty: 4, size: "grande",
    category: "Entidade do Vazio", location: ["Plano Liminar", "Floresta Maldita", "Onde o Véu é Fino"],
    hp: 130, physDefense: 7, magDefense: 8, dodge: 16,
    actions: 3, reactions: 2,
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
    id: "grande-sacerdote-cobra", name: "Grande Sacerdote de Jurgmund", difficulty: 4, size: "normal",
    category: "Humanoide Elite", location: ["Serpentara", "Grande Templo de Jurgmund"],
    hp: 110, physDefense: 4, magDefense: 10, dodge: 14,
    actions: 3, reactions: 3,
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
    id: "general-fantasma", name: "General Elyon — O Traidor Fantasma", difficulty: 4, size: "normal",
    category: "Morto-Vivo Elite", location: ["Ruínas de Durrak", "Campo de Batalha Maldito"],
    hp: 120, physDefense: 6, magDefense: 9, dodge: 15,
    actions: 3, reactions: 3,
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
    id: "lich-atrelon", name: "O Lich das Montanhas de Atrelon", difficulty: 5, size: "normal",
    category: "Morto-Vivo Lendário", location: ["Pico de Atrelon", "Torre do Gelo Eterno"],
    hp: 220, physDefense: 8, magDefense: 14, dodge: 17,
    actions: 4, reactions: 3,
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
    id: "cobra-imortal-jurgmund", name: "A Serpente Imortal de Jurgmund", difficulty: 5, size: "colossal",
    category: "Divindade Menor", location: ["Núcleo de Serpentara", "Câmara Sagrada de Jurgmund"],
    hp: 300, physDefense: 10, magDefense: 12, dodge: 13,
    actions: 4, reactions: 2,
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
    id: "deus-marcado-avatar", name: "Avatar do Deus Marcado", difficulty: 5, size: "colossal",
    category: "Divindade — Avatar", location: ["Qualquer lugar com Maldição Aberta", "Altar da Marca"],
    hp: 350, physDefense: 12, magDefense: 15, dodge: 18,
    actions: 5, reactions: 4,
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
    id: "karlac-filhote", name: "Karlac Filhote", difficulty: 1, size: "pequeno",
    category: "Besta de Fogo", location: ["Deserto Carmesim"],
    hp: 14, physDefense: 3, magDefense: 0, dodge: 12,
    actions: 2, reactions: 1,
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
    id: "serpentariano-patrulheiro", name: "Serpentariano Patrulheiro", difficulty: 1, size: "normal",
    category: "Humanoide Serpentariano", location: ["Montanhas de Atrelon", "Castelo da Cobra"],
    hp: 18, physDefense: 3, magDefense: 1, dodge: 13,
    actions: 2, reactions: 1,
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
    id: "anao-do-casco", name: "Anão Guardião do Casco", difficulty: 2, size: "normal",
    category: "Humanoide Anão", location: ["Grande Lago Central", "Cidadela do Casco"],
    hp: 40, physDefense: 6, magDefense: 2, dodge: 10,
    actions: 2, reactions: 2,
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
    id: "criatura-profundezas", name: "Criatura das Profundezas do Lago", difficulty: 2, size: "normal",
    category: "Aberração Aquática", location: ["Grande Lago Central"],
    hp: 35, physDefense: 2, magDefense: 4, dodge: 14,
    actions: 3, reactions: 1,
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
    id: "cultista-aralto", name: "Cultista do Aralto", difficulty: 2, size: "normal",
    category: "Humanoide Corrompido", location: ["Montanhas de Atrelon", "Reinos de Akaen", "Deserto Carmesim"],
    hp: 32, physDefense: 3, magDefense: 3, dodge: 12,
    actions: 2, reactions: 1,
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
    id: "serpentariano-sacerdote", name: "Sacerdote Serpentariano da Cobra", difficulty: 3, size: "normal",
    category: "Humanoide Serpentariano", location: ["Montanhas de Atrelon", "Castelo da Cobra"],
    hp: 65, physDefense: 3, magDefense: 8, dodge: 13,
    actions: 3, reactions: 2,
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
    id: "guardiao-fissura", name: "Guardião da Fissura", difficulty: 3, size: "grande",
    category: "Aberração Aquática Ancestral", location: ["Grande Lago Central"],
    hp: 85, physDefense: 5, magDefense: 6, dodge: 11,
    actions: 3, reactions: 2,
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
    id: "aralto-menor", name: "Aralto da Marca — Forma Menor", difficulty: 3, size: "normal",
    category: "Campeão do Deus Marcado", location: ["Reinos de Akaen", "Montanhas de Atrelon", "Deserto Carmesim"],
    hp: 80, physDefense: 5, magDefense: 7, dodge: 14,
    actions: 3, reactions: 2,
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
    id: "serpentariano-rei-vassk", name: "Rei Vassk — O Corrompido", difficulty: 4, size: "normal",
    category: "Humanoide Serpentariano Elite", location: ["Castelo da Cobra — Trono"],
    hp: 115, physDefense: 6, magDefense: 9, dodge: 15,
    actions: 3, reactions: 3,
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
    id: "aralto-sussurrante", name: "O Aralto Sussurrante", difficulty: 4, size: "normal",
    category: "Campeão do Deus Marcado — Elite", location: ["Câmaras Profundas do Crânio", "Castelo da Cobra"],
    hp: 130, physDefense: 7, magDefense: 10, dodge: 17,
    actions: 3, reactions: 3,
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
    id: "grande-salamandra-karlac", name: "Grande Salamandra Karlac", difficulty: 5, size: "colossal",
    category: "Criatura Colossal — Guardiã do Deserto", location: ["Deserto Carmesim"],
    hp: 400, physDefense: 14, magDefense: 8, dodge: 8,
    actions: 4, reactions: 2,
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
    id: "dragao-dourado-karloth", name: "Dragão Dourado de Karloth", difficulty: 5, size: "colossal",
    category: "Entidade Colossal — Guardião do Mundo", location: ["Grande Planície Sudeste", "Vulcão de Karloth"],
    hp: 500, physDefense: 16, magDefense: 16, dodge: 20,
    actions: 5, reactions: 5,
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
    id: "magnalaga-acordada", name: "Tartaruga Magnalaga — Forma Acordada", difficulty: 5, size: "colossal",
    category: "Ser Ancestral Transformado", location: ["Grande Lago Central"],
    hp: 380, physDefense: 15, magDefense: 12, dodge: 6,
    actions: 3, reactions: 1,
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
  { id:"zumbi-comum", name:"Zumbi Comum", difficulty:1, size:"normal", category:"Morto-Vivo",
    location:["Cemitério","Ruínas","Dungeon"], hp:28, physDefense:1, magDefense:0, dodge:8,
    actions:1, reactions:0, damage:"1d6 (mordida podre)",
    abilities:[
      { name:"Infatigável", desc:"Imune a Atordoado, Exaustão e Medo. Nunca foge." },
      { name:"Mordida Infecciosa", desc:"Acerto: alvo testa FOR (normal) ou fica Envenenado (1d4 por rodada, 4 rodadas). Cura mágica ou antídoto remove." },
      { name:"Resistência Morta", desc:"Recebe metade do dano de armas cortantes e perfurantes. Dano contundente e fogo são normais." }
    ],
    spells:[],
    behavior:"Age em grupos de 3-8. Lento (Movimento 2) mas incansável. Avança em linha reta para o alvo mais próximo. Não tem táticas.",
    loot:[{item:"Nada de valor",chance:100,qty:"—"},{item:"Fragmento de roupa com pista",chance:15,qty:"1"}] },

  { id:"zumbi-abissal", name:"Zumbi Abissal", difficulty:3, size:"normal", category:"Morto-Vivo",
    location:["Fissura do Lago","Dungeon Profunda","Território do Deus Marcado"], hp:80, physDefense:4, magDefense:3, dodge:10,
    actions:2, reactions:1, damage:"1d10+1d6 (garras abissais)",
    abilities:[
      { name:"Aura de Corrupção", desc:"Passivo: aliados em raio 2 hex têm −1 em todos os testes enquanto a aura estiver ativa. Clérigos imunes." },
      { name:"Morte Explosiva", desc:"Ao chegar a 0 HP, explode em energia abissal: 2d8 dano sombrio a todos em raio 2 hex (SAB normal para metade)." },
      { name:"Regeneração Sombria", desc:"Recupera 5 HP por rodada enquanto estiver em terreno escuro ou área corrompida. Fogo sagrado cancela por 3 rodadas." },
      { name:"Garras que Rasgam o Véu", desc:"Ataques ignoram 3 pontos de Defesa Física (as garras tocam parcialmente o plano espiritual)." }
    ],
    spells:[],
    behavior:"Guardião territorial. Protege áreas corrompidas. Ataca o alvo com mais luz ou energia divina (odeia clérigos). Não foge — morre no posto.",
    loot:[{item:"Cristal Abissal (reagente)",chance:40,qty:"1"},{item:"Pedaço de Armadura Corrompida",chance:25,qty:"1"}] },

  { id:"esqueleto-guerreiro", name:"Esqueleto Guerreiro", difficulty:1, size:"normal", category:"Morto-Vivo",
    location:["Tumba","Dungeon","Ruínas Élficas"], hp:18, physDefense:3, magDefense:0, dodge:11,
    actions:2, reactions:1, damage:"1d8 (espada enferrujada)",
    abilities:[
      { name:"Osso Vazio", desc:"Imune a veneno, dano psíquico e condições mentais. Vulnerável a dano contundente (+1d4 extra)." },
      { name:"Sem Dor", desc:"Nunca sofre penalidade por HP baixo. Luta com 100% de eficiência até 0 HP." }
    ],
    spells:[],
    behavior:"Guarda tumbas e tesouros sem pensar. Ataca qualquer vivo que entrar na área. Pode ser comandado por um necromante — obedece ordens simples.",
    loot:[{item:"Osso de Qualidade (material)",chance:60,qty:"1d4"},{item:"Moedas Antigas",chance:30,qty:"1d8"},{item:"Arma Enferrujada Recuperável",chance:20,qty:"1"}] },

  { id:"esqueleto-gigante", name:"Esqueleto Colossal", difficulty:4, size:"colossal", category:"Morto-Vivo",
    location:["Tumba Ancestral","Dungeon Profunda","Ruínas Élficas"], hp:140, physDefense:8, magDefense:2, dodge:9,
    actions:3, reactions:1, damage:"2d10+1d8 (golpe de osso colossal)",
    abilities:[
      { name:"Pisar Esmagador", desc:"1 Ação: pisa em área 2x2 hex. Todos nessa área sofrem 2d8 dano contundente e testam AGI (difícil) ou ficam Derrubados." },
      { name:"Tamanho Colossal", desc:"Ocupa 3 hexágonos. Não pode ser Derrubado ou Empurrado por meios mundanos (apenas magia de nível 3+)." },
      { name:"Fragmentar", desc:"Ao chegar a 50% HP, perde o braço direito: −1 Ação mas partes dos ossos tornam-se 1d4 Esqueletos Guerreiros ativos." },
      { name:"Ossos Encantados", desc:"Imune a dano cortante. Resistência a perfurante (−2 dano por dado). Fogo e magia sagrada causam dano normal." }
    ],
    spells:[],
    behavior:"Guardião de tumbas antigas. Ignora criaturas pequenas (goblins, ratos) mas ataca humanoides. Movimento lento (3 hexágonos) mas alcance de 2 hexágonos nos ataques.",
    loot:[{item:"Osso Ancestral Encantado",chance:70,qty:"1d3"},{item:"Cristal de Alma Aprisionada",chance:30,qty:"1"},{item:"Artefato da Tumba",chance:20,qty:"1"}] },

  { id:"vampiro-nobre", name:"Vampiro Nobre", difficulty:4, size:"normal", category:"Morto-Vivo",
    location:["Castelo Abandonado","Cidade","Ruínas Nobres"], hp:120, physDefense:6, magDefense:7, dodge:16,
    actions:3, reactions:3, damage:"1d10+1d8 (mordida drenante)",
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

  { id:"lobisomem", name:"Lobisomem", difficulty:3, size:"grande", category:"Metamorfo",
    location:["Floresta","Aldeia","Montanha"], hp:95, physDefense:5, magDefense:3, dodge:14,
    actions:3, reactions:2, damage:"1d10+1d8 (garras e mordida)",
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
  { id:"kobold-armadilheiro", name:"Kobold Armadilheiro", difficulty:1, size:"pequeno", category:"Humanoide",
    location:["Caverna","Dungeon","Floresta Profunda"], hp:14, physDefense:2, magDefense:1, dodge:13,
    actions:2, reactions:1, damage:"1d4+1d4 (faca e armadilha)",
    abilities:[
      { name:"Armadilheiro Expert", desc:"Prepara armadilhas durante o combate (1 Ação). A armadilha ativa no próximo alvo que cruzar o hex: 1d6 dano + Preso (FOR normal para escapar). Pode ter até 3 armadilhas ativas." },
      { name:"Fuga Tática", desc:"Se ficar abaixo de 50% HP, usa 1 Reação para mover 3 hex sem provocar ataque de oportunidade e desaparecer em pequenos túneis." },
      { name:"Enxame de Kobolds", desc:"Por cada Kobold aliado em raio 2 hex: +1d4 de dano e +1 na Esquiva (acumula até +3d4/+3)." }
    ],
    spells:[],
    behavior:"Covardes em combate direto mas perigosos em grupos e com preparação. Fogem ao primeiro sinal de desvantagem para buscar reforços. Adoram emboscadas e terrenos armadilhados.",
    loot:[{item:"Kit de Ferramentas de Armadilha",chance:50,qty:"1"},{item:"Moedas de Cobre",chance:80,qty:"1d6"},{item:"Pedra de Sílex Especial",chance:20,qty:"1d3"}] },

  { id:"orc-berserker", name:"Orc Berserker", difficulty:2, size:"grande", category:"Humanoide",
    location:["Planície","Acampamento","Floresta"], hp:55, physDefense:3, magDefense:1, dodge:11,
    actions:3, reactions:1, damage:"1d12+1d6 (machado de guerra)",
    abilities:[
      { name:"Fúria do Sangue", desc:"Ao receber qualquer dano: entra em Fúria automaticamente por 3 rodadas. Em Fúria: +1d8 de dano mas não pode recuar nem usar itens." },
      { name:"Sede de Sangue", desc:"Se matar um inimigo: recupera 1d10 HP imediatamente e ganha +1 Ação extra neste turno." },
      { name:"Provocação", desc:"1 Ação: força um alvo visível a testear Força de Vontade (normal) ou atacar somente o orc no próximo turno." }
    ],
    spells:[],
    behavior:"Combate frontal agressivo. Ignora aliados em desvantagem — foca no inimigo mais forte. Nunca recua voluntariamente. Pode ser convencido por um guerreiro orc de respeito.",
    loot:[{item:"Machado de Guerra Orc (arma rara)",chance:40,qty:"1"},{item:"Dente de Criatura Colossal (troféu)",chance:60,qty:"1d3"},{item:"Provisões de Acampamento",chance:70,qty:"1"}] },

  { id:"elfo-sombrio", name:"Elfo das Sombras", difficulty:3, size:"normal", category:"Humanoide",
    location:["Floresta Profunda","Ruínas Élficas","Território Élfico"], hp:68, physDefense:3, magDefense:6, dodge:17,
    actions:3, reactions:3, damage:"1d8+1d6 (lâmina da meia-luz)",
    abilities:[
      { name:"Passo das Sombras", desc:"Se estiver em área de sombra ou escuridão: teleporta para qualquer outra sombra em raio 8 hex como Ação gratuita (1x/turno)." },
      { name:"Flechas Envenenadas", desc:"Ataques à distância (alcance 10): adiciona veneno élfico (1d6/rodada, 3 rodadas). Resistência AGI (difícil) para anular." },
      { name:"Reflexos da Floresta", desc:"Passivo: 30% de chance de esquivar automaticamente de ataques à distância (rola 1d10 — em 1, 2 ou 3, esquiva)." },
      { name:"Sentinela Silenciosa", desc:"Em furtividade, primeiro ataque é Crítico automático e não revela posição (pode atacar de novo furtivamente na mesma rodada)." }
    ],
    spells:["Névoa das Sombras (obscurece área 3x3, nível 2)"],
    behavior:"Tático e paciente. Nunca entra em combate aberto — favorece emboscadas, veneno e retiradas estratégicas. Alvo prioritário: conjuradores e portadores de luz. Foge se a furtividade for quebrada.",
    loot:[{item:"Lâmina Élfica da Meia-Luz (raro)",chance:25,qty:"1"},{item:"Extrato de Veneno Élfico (×3)",chance:60,qty:"1"},{item:"Cristal de Memória Élfica",chance:15,qty:"1"}] },

  { id:"necromante-errante", name:"Necromante Errante", difficulty:3, size:"normal", category:"Humanoide",
    location:["Cemitério","Dungeon","Floresta Sombria"], hp:55, physDefense:1, magDefense:7, dodge:12,
    actions:2, reactions:1, damage:"1d6 (cajado ossado)",
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
  { id:"ent-guardiao", name:"Ent Guardião da Floresta", difficulty:4, size:"colossal", category:"Planta Viva",
    location:["Floresta Ancestral","Floresta Profunda"], hp:160, physDefense:9, magDefense:2, dodge:8,
    actions:3, reactions:1, damage:"2d8+1d10 (galhos colossais)",
    abilities:[
      { name:"Raízes Aprisionadoras", desc:"1 Ação: raízes emergem em área 3x3 hex. Todos no terreno testam AGI (difícil) ou ficam Presos (Imóveis) por 2 rodadas. Liberar: FOR (normal) por Ação." },
      { name:"Casca Invulnerável", desc:"Imune a dano cortante e perfurante. Dano por fogo é dobrado. Dano mágico de terra cura em vez de machucar (+1d8 por acerto terrestre)." },
      { name:"Chamado da Floresta", desc:"1x/combate: invoca 1d4 Treants Jovens (HP 30, dano 1d8, Dif.2) do terreno florestal. Só funciona em floresta real." },
      { name:"Pisoteio Colossal", desc:"Se mover pelo menos 2 hex: pode pisotear um hex no caminho — 2d10 dano a tudo nele, sem teste de resistência." }
    ],
    spells:[],
    behavior:"Protetor territorial, não predador. Avisa antes de atacar — dá 1 rodada de aviso visual (chacoalha galhos) antes de agir. Se o grupo recuar e não desmatar, para. Inimigo irreconciliável apenas de Karlacs e Salamandras.",
    loot:[{item:"Coração de Ent (material lendário)",chance:30,qty:"1"},{item:"Lenha Sagrada (material)",chance:90,qty:"1d6"},{item:"Resina Curativa (3 usos, cura 2d8)",chance:50,qty:"1"}] },

  { id:"treant-jovem", name:"Treant Jovem", difficulty:2, size:"grande", category:"Planta Viva",
    location:["Floresta","Bosque","Planície com Árvores"], hp:60, physDefense:6, magDefense:1, dodge:9,
    actions:2, reactions:1, damage:"1d10+1d6 (galho poderoso)",
    abilities:[
      { name:"Enraizar", desc:"1 Ação: cria raízes em 1 hex adjacente — terreno difícil que custa 2 Ações para cruzar. Persiste até o treant morrer." },
      { name:"Regeneração Vegetal", desc:"Recupera 4 HP por rodada em terreno natural (floresta, grama). Fogo cancela a regeneração por 2 rodadas." }
    ],
    spells:[],
    behavior:"Solitário ou sob comando de um Ent maior. Defende a área onde nasceu. Recua se receber dano de fogo (instinto de sobrevivência).",
    loot:[{item:"Casca de Treant (armadura material)",chance:50,qty:"1"},{item:"Resina Curativa (1 uso)",chance:40,qty:"1"}] },

  { id:"sombra-florestal", name:"Sombra Florestal", difficulty:2, size:"normal", category:"Espírito",
    location:["Floresta Profunda","Área Corrompida","Noite"], hp:40, physDefense:0, magDefense:6, dodge:18,
    actions:2, reactions:2, damage:"1d8 (toque das sombras — dano sombrio)",
    abilities:[
      { name:"Intangível", desc:"Imune a dano físico de armas não-mágicas. Armas mágicas e magias causam dano normal. Fogo e luz sagrada causam 1d4 extra." },
      { name:"Drenar Força", desc:"Cada toque bem-sucedido reduz o atributo FOR do alvo em 1 temporariamente (retorna após descanso longo). Se FOR chegar a 0: alvo fica Incapacitado." },
      { name:"Fundir nas Sombras", desc:"Em áreas escuras: torna-se invisível como Ação gratuita. Ataques contra ela têm 50% de chance de errar automaticamente." }
    ],
    spells:[],
    behavior:"Predador silencioso. Ataca à noite, foge à luz do dia. Foca em alvos isolados. Não pode ser negociado — é puro instinto predatório.",
    loot:[{item:"Essência de Sombra (componente mágico)",chance:50,qty:"1"}] },

  /* ── CRIATURAS GRANDES ── */
  { id:"mamute-das-planícies", name:"Mamute das Planícies", difficulty:3, size:"colossal", category:"Besta",
    location:["Grande Planície","Estepe","Neve"], hp:130, physDefense:7, magDefense:1, dodge:8,
    actions:2, reactions:1, damage:"2d8+1d10 (chifres e pisoteio)",
    abilities:[
      { name:"Carga Imparável", desc:"Se mover 3+ hex em linha reta e atacar: dano dobrado e o alvo é Empurrado 3 hex e Derrubado (sem teste). Muro ou obstáculo: 1d10 para ambos." },
      { name:"Pisoteio em Área", desc:"1 Ação: pisa em 2 hexágonos adjacentes simultaneamente — 2d6 dano a cada criatura nesses hexágonos." },
      { name:"Pele Grossa", desc:"Reduz dano de projéteis em 4 por ataque. Flechas e lanças causam mínimo de dano a menos que acertem pontos vulneráveis (olhos, barriga: +1d6 se descrito)." },
      { name:"Brado Colossal", desc:"1x/combate: grunhido ensurdecedor em raio 5 hex — todos testam FOR (normal) ou ficam Atordoados por 1 rodada." }
    ],
    spells:[],
    behavior:"Passivo se não ameaçado. Se um aliado ou filhote for atacado, entra em modo de proteção total — prioriza ameaças maiores. Pode ser acalmado com um teste de SAB (difícil) se um xamã estiver presente.",
    loot:[{item:"Marfim de Mamute (material valioso)",chance:60,qty:"1d2"},{item:"Pele de Mamute (armadura material)",chance:50,qty:"1"},{item:"Músculo de Mamute (reagente de força)",chance:30,qty:"1"}] },

  { id:"gigante-das-pedras", name:"Gigante das Pedras", difficulty:4, size:"colossal", category:"Gigante",
    location:["Montanha","Caverna Grande","Ruínas"], hp:180, physDefense:10, magDefense:3, dodge:9,
    actions:3, reactions:1, damage:"2d10+1d8 (punho de pedra)",
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
  { id:"harpia", name:"Harpia Caçadora", difficulty:2, size:"normal", category:"Voadora",
    location:["Penhasco","Floresta","Montanha"], hp:45, physDefense:2, magDefense:3, dodge:16,
    actions:3, reactions:2, damage:"1d8+1d6 (garras cortantes)",
    abilities:[
      { name:"Voadora", desc:"Ocupa hex aéreo (altitude 3). Ataques corpo a corpo de aliados no chão têm −1d4 de acerto. Ataques à distância são normais. Pode mergulhar: +1d6 de dano num ataque por rodada." },
      { name:"Canto Encantador", desc:"1 Ação (1x/combate): todos em raio 5 hex testam SAB (difícil) ou ficam Enfeitiçados por 2 rodadas (não atacam a harpia, caminham em sua direção)." },
      { name:"Rasante Mortal", desc:"Voa sobre um hex adjacente sem custo de Ação e ataca — o alvo não pode usar Reação (o ataque vem de cima em alta velocidade)." },
      { name:"Vulnerabilidade ao Chão", desc:"Se forçada ao chão (magia, rede, projétil específico): Esquiva cai para 10 e perde voo por 1d3 rodadas." }
    ],
    spells:[],
    behavior:"Caçadora inteligente. Usa o Canto para separar o grupo, depois ataca isolados com rasantes. Trabalha em pares. Foge se uma parceira morrer.",
    loot:[{item:"Pena de Harpia (material mágico)",chance:80,qty:"1d6"},{item:"Ovo de Harpia (valioso para alquimistas)",chance:15,qty:"1"},{item:"Moedas (roubadas de vítimas)",chance:50,qty:"1d20"}] },

  { id:"grifo", name:"Grifo das Montanhas", difficulty:3, size:"grande", category:"Voadora",
    location:["Montanha","Penhasco Alto","Região de Atrelon"], hp:90, physDefense:5, magDefense:3, dodge:15,
    actions:3, reactions:2, damage:"1d10+1d8 (bico de águia + garras de leão)",
    abilities:[
      { name:"Voador de Altitude", desc:"Ocupa hex aéreo altitude 5 (muito alto). Fora do alcance de ataques corpo a corpo. Projéteis têm −1d4. Magias de área alcançam normalmente." },
      { name:"Mergulho Devastador", desc:"1x/rodada: pode mergulhar de altitude máxima para atacar — dano triplo mas fica em altitude 0 após o ataque (no chão, vulnerável)." },
      { name:"Bico Perfurante", desc:"Ataques de bico ignoram 4 pontos de Defesa Física. Alvos com armadura pesada sofrem dano normal (o bico encontra frestas)." },
      { name:"Lealdade ao Cavaleiro", desc:"Se tiver um cavaleiro montado: o grifo tem +1 Ação e +1d6 de dano. Ambos atuam na mesma iniciativa. O cavaleiro pode redirecionar ataques do grifo." }
    ],
    spells:[],
    behavior:"Nobre e orgulhoso. Pode ser domado com tempo e respeito (missão secundária). Em estado selvagem: caça para alimentar filhotes. Não persegue presas que entram em cavernas.",
    loot:[{item:"Pena de Grifo (item lendário — sela de voar)",chance:30,qty:"1"},{item:"Garras de Grifo (arma material)",chance:50,qty:"1d4"},{item:"Ovo de Grifo (montaria potencial)",chance:10,qty:"1"}] },

  { id:"basilisco-asa", name:"Basilisco Voador", difficulty:4, size:"grande", category:"Voadora",
    location:["Dungeon Alta","Penhasco","Ruína de Atrelon"], hp:110, physDefense:7, magDefense:4, dodge:13,
    actions:3, reactions:1, damage:"1d10+1d8 (mordida petrificante)",
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
  { id:"urso-corrompido-marca", name:"Urso Corrompido pela Marca", difficulty:3, size:"grande", category:"Besta Corrompida",
    location:["Floresta Corrompida","Território dos Araltos"], hp:100, physDefense:6, magDefense:3, dodge:11,
    actions:3, reactions:1, damage:"1d12+1d8 (garras corrompidas)",
    abilities:[
      { name:"Aura Corruptora", desc:"Passivo: aliados em raio 3 hex têm −1d4 em todos os testes. Clérigos de Jurgmund ou Sanctum imunes." },
      { name:"Garras do Deus Marcado", desc:"Cada acerto aplica 1 nível de Corrupção da Marca ao alvo (acumulável). 3 níveis = alvo começa a agir erráticamente (Mestre determina)." },
      { name:"Fúria Sombria", desc:"Ao ficar abaixo de 50% HP: a Corrupção toma controle total — +2 Ações, +1d10 de dano. Não foge mais. Ataca tudo incluindo outros corrompidos." },
      { name:"Regeneração Marcada", desc:"Regenera 6 HP por rodada. Magia sagrada ou fogo divino cancela por 2 rodadas." }
    ],
    spells:[],
    behavior:"Erratico e agressivo. Ataca aliados corrompidos se em Fúria Sombria. Araltos podem controlá-lo parcialmente com símbolo da Marca (teste de INT).",
    loot:[{item:"Pele Corrompida (material amaldiçoado)",chance:60,qty:"1"},{item:"Fragmento da Marca (cristal corrompido)",chance:40,qty:"1"}] },

  { id:"golem-marcado", name:"Golem da Marca", difficulty:4, size:"grande", category:"Construto Corrompido",
    location:["Fortaleza dos Araltos","Dungeon Corrompida"], hp:150, physDefense:9, magDefense:5, dodge:9,
    actions:3, reactions:2, damage:"2d8+1d8 (punho marcado)",
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
  { id:"cobra-sangue-Jurgmund", name:"Cobra do Sangue de Jurgmund", difficulty:2, size:"normal", category:"Besta Sagrada",
    location:["Montanhas de Atrelon","Castelo da Cobra","Florestas Próximas ao Lago"], hp:45, physDefense:3, magDefense:5, dodge:16,
    abilities:[
      { name:"Não Agressiva por Natureza", desc:"Não ataca primeiro. Se atacada: defende-se e tenta se afastar. Apenas ataca 3x seguidas se encurralada." },
      { name:"Veneno Sagrado Passivo", desc:"Qualquer contato físico (atacar sem luvas, capturar): 1d6 de veneno sagrado por rodada por 3 rodadas. Antídoto mundano não funciona — precisa de cura mágica." },
      { name:"Guia de Jurgmund", desc:"Serpentarianos que a seguem (em vez de atacar) são guiados até um local de interesse próximo (tesouro, saída, área sagrada). O Mestre escolhe o destino." },
      { name:"Escamas Douradas", desc:"Suas escamas brilham levemente dourado. Clérigos de Jurgmund que a vejam ganham +1 Slot de Magia enquanto ela estiver visível." }
    ],
    spells:[],
    actions:2, reactions:2, damage:"1d8 + veneno sagrado (defensivo)",
    behavior:"Anda pelo mundo como mensageira de Jurgmund. Observa, guia, eventualmente some. Nunca é morta sem consequência — Serpentarianos ficam hostis se virem um grupo matar uma.",
    loot:[{item:"Escama Dourada de Jurgmund (material divino)",chance:70,qty:"1d3"},{item:"Veneno Sagrado Residual (frasco)",chance:30,qty:"1"}] },

  { id:"lagarto-cristal-cobra", name:"Lagarto de Cristal Cobriforme", difficulty:1, size:"pequeno", category:"Besta Sagrada",
    location:["Cavernas de Atrelon","Beira do Lago","Perto do Castelo"], hp:20, physDefense:4, magDefense:2, dodge:15,
    abilities:[
      { name:"Completamente Inofensivo", desc:"Nunca ataca voluntariamente. Foge de qualquer confronto. Se capturado e tratado bem: torna-se familiar (bônus de +1 em testes de Percepção e +1 Slot de Magia)." },
      { name:"Detector de Corrupção", desc:"Passivo: o lagarto brilha intensamente em vermelho ao detectar qualquer criatura corrompida pelo Deus Marcado em raio 10 hex. Excelente alarme." },
      { name:"Pele de Cristal", desc:"Passivo: dano físico causa 1d4 de dano reflexivo ao atacante (o cristal é muito afiado). Não intencional — é sua defesa natural." }
    ],
    spells:[],
    actions:1, reactions:1, damage:"— (não ataca)",
    behavior:"Curioso e dócil. Se os jogadores ficarem quietos por 1 rodada completa, ele se aproxima. Pode ser capturado sem combate com DEX (normal).",
    loot:[{item:"Escama de Cristal Cobra (material decorativo e mágico)",chance:90,qty:"1d4"}] },

  /* ── CRIATURAS COM MAGIAS ÚNICAS ── */
  { id:"maga-da-floresta", name:"Maga da Floresta Antiga", difficulty:3, size:"normal", category:"Humanoide",
    location:["Floresta Ancestral","Círculo de Pedras","Bosque Sagrado"], hp:65, physDefense:2, magDefense:8, dodge:13,
    actions:2, reactions:2, damage:"1d6 (cajado de madeira viva) + magia",
    abilities:[
      { name:"Controle da Flora", desc:"1 Ação: controla toda a vegetação em raio 6 hex por 3 rodadas. Pode: criar terreno difícil, fazer raízes aprisionarem (AGI difícil) ou criar paredes de galhos (Def.5, 20 HP)." },
      { name:"Forma Animal", desc:"1x/combate: transforma-se em animal selvagem (urso dif.2) por 4 rodadas. Mantém INT mas ganha todas as estatísticas da forma." },
      { name:"Cura da Terra", desc:"1 Ação Mágica: cura 3d8 HP em aliados que estiverem em contato com solo natural. Não funciona em dungeon ou pedra artificial." },
      { name:"Maldição da Floresta", desc:"1 Ação Mágica (1x/combate): maldição permanente até próximo descanso longo — alvo não consegue se mover mais de 2 hex por rodada sem força exterior." }
    ],
    spells:["Controle da Flora (nível 3)","Forma Animal (nível 3)","Cura da Terra (nível 2)","Maldição da Floresta (nível 3)"],
    behavior:"Protetora, não agressora. Ataca quem desmata ou polui a floresta. Pode ser aliada se o grupo mostrar respeito pela natureza. Oferece cura e informações em troca de promessas mantidas.",
    loot:[{item:"Cajado de Madeira Viva (arma mágica)",chance:30,qty:"1"},{item:"Sementes de Cura (3 usos — cura 2d8)",chance:60,qty:"1"},{item:"Mapa de Locais Sagrados",chance:40,qty:"1"}] },

  { id:"draconico-menor", name:"Dracônico Menor", difficulty:3, size:"normal", category:"Dracônico",
    location:["Montanhas","Cavernas","Ruínas de Atrelon"], hp:80, physDefense:6, magDefense:5, dodge:14,
    actions:3, reactions:2, damage:"1d10+1d6 (garras e chama)",
    abilities:[
      { name:"Sopro de Chama", desc:"1 Ação (1x a cada 2 rodadas): sopro de fogo em cone 4 hex — 3d8 dano de fogo, metade com AGI (normal). Imune a fogo próprio." },
      { name:"Escalas Dragonínicas", desc:"Resistência a fogo (-4 por dado). Vulnerável a frio (+1d4 por dado de dano de gelo)." },
      { name:"Voo de Combate", desc:"Pode voar em altitude 2 (acima do alcance corpo a corpo). Pousa para usar Sopro ou atacar com garras — ficar preso no chão por 1 rodada após pousar." },
      { name:"Orgulho Dracônico", desc:"Se receber um Crítico: fica Enraivecido por 3 rodadas — +1d8 de dano mas foca somente em quem acertou o crítico." }
    ],
    spells:[],
    behavior:"Quer tesouro e respeito, nesta ordem. Pode ser negociado com ofertas de ouro ou itens valiosos. É inimigo de quem invade sua caverna. Nunca se une a outros dracônicos menores (competição de território).",
    loot:[{item:"Escama de Dracônico (armadura material)",chance:60,qty:"1d6"},{item:"Garra de Dracônico (arma material)",chance:40,qty:"1d2"},{item:"Fragmento de Tesouro do Dracônico",chance:70,qty:"1d20 ouro"}] },

  { id:"espirito-fogo", name:"Espírito do Fogo Primordial", difficulty:4, size:"normal", category:"Elemental",
    location:["Vulcão Karloth","Deserto Carmesim","Área de Erupção"], hp:95, physDefense:0, magDefense:8, dodge:17,
    actions:3, reactions:2, damage:"2d8 (toque de chama pura)",
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

  { id:"aranha-gigante", name:"Aranha Gigante da Caverna", difficulty:2, size:"grande", category:"Besta",
    location:["Caverna","Dungeon","Floresta Sombria"],
    hp:42, physDefense:3, magDefense:1, dodge:14,
    actions:2, reactions:2, damage:"1d8+1d4 (presas venenosas)",
    abilities:[
      { name:"Teia Aprisionadora", desc:"1 Ação: dispara teia a até 6 hex. Alvo testa AGI (normal) ou fica Preso (imóvel, pode gastar 1 Ação por turno para testar FOR normal e escapar). Pode ter até 3 teias ativas." },
      { name:"Veneno de Paralisia", desc:"Cada mordida aplica veneno: 1d4 de dano por rodada + reduz AGI em 1 por rodada (acumula). Se AGI chegar a 0: Paralisado por 2 rodadas. Antídoto ou cura mágica remove." },
      { name:"Andar pelas Paredes", desc:"Pode se mover em paredes e tetos sem penalidade. Alvos no chão que atacam uma aranha no teto têm -1d4 de acerto." },
      { name:"Sentido de Vibração", desc:"Detecta qualquer movimento em raio 8 hex via teia ou chão. Imune a Furtividade se estiver em teia ou área de teia." }
    ],
    spells:[], behavior:"Tece teias antes do combate para cobrir saídas. Usa Paralisia para prender presas e guarda para comer depois. Foge se perder mais da metade dos pontos de vida em 2 rodadas.",
    loot:[{item:"Seda de Aranha Gigante (material — corda ou roupa)",chance:70,qty:"1d4"},{item:"Veneno de Aranha (3 doses)",chance:40,qty:"1"},{item:"Casulo com item preso (variado)",chance:30,qty:"1"}] },

  { id:"gnoll-guerreiro", name:"Gnoll Guerreiro", difficulty:2, size:"normal", category:"Humanoide",
    location:["Planície","Deserto","Acampamento Nômade"],
    hp:48, physDefense:3, magDefense:1, dodge:12,
    actions:2, reactions:1, damage:"1d10+1d4 (lança serrilhada)",
    abilities:[
      { name:"Riso de Hiena", desc:"Ao reduzir um inimigo a 0 HP: emite um grito/riso aterrorizante. Todos os inimigos em raio 4 hex testam SAB (normal) ou ficam com -1d4 em todos os testes por 1 rodada." },
      { name:"Faro de Sangue", desc:"Detecta criaturas com menos de 50% HP em raio 10 hex. Prioriza atacar alvos enfraquecidos — reorienta ataque automaticamente se alvo mais ferido aparecer." },
      { name:"Mochila de Trofeus", desc:"Carrega partes de vítimas anteriores como intimidação. Primeiros inimigos que o veem testam SAB (fácil) ou ficam com -1 na iniciativa (os trofeus são perturbadores)." }
    ],
    spells:[], behavior:"Caça em grupos de 3-6. O gnoll mais forte lidera. Foca em alvos caídos para garantir a morte. Foge se o líder morrer, mas volta com reforços.",
    loot:[{item:"Lança Serrilhada (arma comum)",chance:60,qty:"1"},{item:"Provisões (comida questionável)",chance:50,qty:"1d3"},{item:"Moedas Diversas",chance:40,qty:"1d10"},{item:"Trofeu de Osso (intimidação)",chance:30,qty:"1"}] },

  { id:"serpente-constritora", name:"Serpente Constritora das Ruínas", difficulty:2, size:"grande", category:"Besta",
    location:["Ruínas","Floresta","Caverna"],
    hp:50, physDefense:3, magDefense:2, dodge:13,
    actions:2, reactions:1, damage:"1d8+1d6 (mordida e constrição)",
    abilities:[
      { name:"Constrição Letal", desc:"Após qualquer mordida com acerto: a serpente envolve o alvo. Por rodada que permanecer envolvida: 1d8 de dano automático + alvo tem -1 Ação. Escapar: FOR (difícil) como Ação." },
      { name:"Resistência a Veneno", desc:"Imune a todos os venenos. Ataques com veneno aplicado não têm efeito sobre ela." },
      { name:"Engolir Inteiro", desc:"Se um alvo com menos de 25% HP for mordido: pode tentar engolir (FOR vs FOR do alvo). Se engolir: alvo fica Incapacitado e sofre 1d6 ácido por rodada até ser liberado (matar a serpente libera)." }
    ],
    spells:[], behavior:"Predadora oportunista. Espera imóvel até que algo passe a 2 hex. Foca em um alvo por vez até matar ou o alvo escapar.",
    loot:[{item:"Pele de Serpente Constritora",chance:60,qty:"1"},{item:"Veneno Constritora (2 doses, causa Lentidão)",chance:25,qty:"1"},{item:"Ovo de Serpente (incubado)",chance:15,qty:"1d3"}] },

  { id:"feiticeiro-goblin", name:"Feiticeiro Goblin", difficulty:2, size:"pequeno", category:"Humanoide",
    location:["Caverna","Acampamento Goblin","Dungeon"],
    hp:30, physDefense:1, magDefense:5, dodge:14,
    actions:2, reactions:1, damage:"1d4 (cajadinho) + magias",
    abilities:[
      { name:"Maldição do Azar", desc:"1 Ação Mágica: um alvo a até 8 hex fica Azarado por 3 rodadas — todo 20 natural nos dados desse alvo vira 1 (o azar inverte os críticos)." },
      { name:"Explosão Caótica", desc:"1 Ação Mágica: bola de energia instável lançada a 6 hex. Dano 2d6 em raio 2 hex. 1 em 6 chances do goblin também sofrer 1d6 (mira péssima)." },
      { name:"Invocar Trasgo", desc:"1 Ação Mágica (1x/combate): invoca 1d3 Goblins Batedeira (Dif.1) de um buraco no chão. Os goblins chegam no próximo turno." },
      { name:"Teleporte Pânico", desc:"Ao receber qualquer dano: 50% de chance de teleportar para hex aleatório em raio 4 hex (o pânico ativa a magia involuntariamente)." }
    ],
    spells:[], behavior:"Caótico e imprevisível. Fica na retaguarda lançando magias aleatórias. Invoca reforços ao sentir perigo. Foge se ficar sozinho.",
    loot:[{item:"Cajadinho Mágico Goblin (arma peculiar)",chance:30,qty:"1"},{item:"Poção Instável (efeito aleatório 1d6)",chance:50,qty:"1d2"},{item:"Moedas",chance:60,qty:"1d8"},{item:"Componente Mágico Roubado",chance:25,qty:"1"}] },

  { id:"mumia-menor", name:"Múmia Menor", difficulty:2, size:"normal", category:"Morto-Vivo",
    location:["Tumba","Pirâmide","Deserto Carmesim"],
    hp:45, physDefense:4, magDefense:3, dodge:10,
    actions:2, reactions:1, damage:"1d8+1d4 (golpe ressecante)",
    abilities:[
      { name:"Maldição da Múmia", desc:"Toque com acerto: alvo fica Amaldiçoado (Maldição da Ressecação) — recupera metade do HP de curas por 24 horas. Cura mágica de nível 2+ ou Clérigo remove." },
      { name:"Imune ao Fogo", desc:"Completamente imune a dano de fogo. Magia de água ou frio causa 1d6 extra (a umidade corrói as bandagens)." },
      { name:"Aura de Desespero", desc:"Passivo: primeira vez que alguém entra em raio 3 hex, testa SAB (normal) ou fica com -1d4 em testes de ataque por 2 rodadas (a presença da morte pesa)." }
    ],
    spells:[], behavior:"Guardião silencioso de tumbas. Não persegue além dos limites da tumba. Protege o sarcófago central acima de tudo.",
    loot:[{item:"Bandagem Impregnada (material alquímico)",chance:60,qty:"1d4"},{item:"Amuleto de Proteção Antigo",chance:30,qty:"1"},{item:"Ouro Funerário",chance:50,qty:"2d8"}] },

  { id:"doppelganger-menor", name:"Imitador (Doppelganger Menor)", difficulty:2, size:"normal", category:"Aberração",
    location:["Cidade","Taverna","Dungeon Profunda"],
    hp:38, physDefense:2, magDefense:4, dodge:15,
    actions:2, reactions:2, damage:"1d8 (golpe surpresa)",
    abilities:[
      { name:"Copiar Aparência", desc:"Pode copiar a aparência de qualquer humanoide que tenha observado por 1 rodada. A cópia é perfeita visualmente mas SAB (difícil) detecta algo errado no comportamento." },
      { name:"Golpe de Traição", desc:"Se estiver disfarçado de aliado: primeiro ataque é Crítico automático e causa Atordoado por 1 rodada (o choque da traição é devastador)." },
      { name:"Ler Superfície Mental", desc:"Pode sentir as emoções e pensamentos superficiais de qualquer criatura em raio 2 hex — usa isso para imitar melhor e antecipar ataques (+1d4 na Esquiva)." },
      { name:"Escorregadio", desc:"Se capturado ou Preso: escorrega automaticamente (corpo se deforma) sem custo de Ação. Imune a ser Agarrado." }
    ],
    spells:[], behavior:"Prefere infiltração a combate. Assume identidade de alguém do grupo e ataca quando menos esperam. Foge se a cobertura for exposta. Nunca luta se pode enganar.",
    loot:[{item:"Essência de Imitador (componente)",chance:50,qty:"1"},{item:"Itens da última vítima (variado)",chance:70,qty:"1d3"}] },

  { id:"golem-gelo", name:"Golem de Gelo", difficulty:2, size:"grande", category:"Construto",
    location:["Neve","Montanha","Dungeon Gelada"],
    hp:55, physDefense:5, magDefense:2, dodge:8,
    actions:2, reactions:1, damage:"1d10+1d6 (soco de gelo)",
    abilities:[
      { name:"Aura de Frio", desc:"Passivo: criaturas a 1 hex sofrem 1d4 de frio por rodada. Líquidos nessa área congelam. Movimento de criaturas em raio 2 hex é reduzido em 1." },
      { name:"Fragmentação de Gelo", desc:"Ao receber dano contundente: explode em estilhaços — todos em raio 2 hex sofrem 1d6 de dano de gelo perfurante (AGI normal para metade)." },
      { name:"Vulnerabilidade ao Fogo", desc:"Dano de fogo causa 1d6 extra e derrete 1 hex do golem (reduz tamanho — perde 1 Ação quando abaixo de 50% HP)." },
      { name:"Imobilidade no Calor", desc:"Em ambientes quentes (próximo a chamas grandes, deserto): Movimento reduzido à metade e -1 Ação." }
    ],
    spells:[], behavior:"Guardião sem inteligência. Patrulha área designada. Não persegue além do território. Pode ser confundido com escultura até se mover.",
    loot:[{item:"Núcleo de Gelo Eterno (material mágico)",chance:40,qty:"1"},{item:"Água de Fonte de Gelo Puro",chance:60,qty:"1d4 frascos"}] },

  { id:"naiad-corrompida", name:"Náiade Corrompida", difficulty:2, size:"normal", category:"Espírito",
    location:["Rio","Grande Lago","Pântano"],
    hp:40, physDefense:1, magDefense:6, dodge:16,
    actions:2, reactions:2, damage:"1d6+1d4 (toque aquoso)",
    abilities:[
      { name:"Forma Aquosa", desc:"Em contato com água: regenera 3 HP por rodada e Esquiva +2. Fora da água: perde esses bônus e fica Enfraquecida (-1d4 nos ataques)." },
      { name:"Canção das Profundezas", desc:"1 Ação: canto que drena voluntade — alvo a 8 hex testa SAB (normal) ou caminha em direção à água mais próxima por 2 rodadas (como Enfeitiçado)." },
      { name:"Bolha de Afogamento", desc:"Toque com sucesso em alvo adjacente à água: envolve cabeça do alvo em bolha d'água. Alvo testa FOR (normal) por rodada ou sofre 1d8 de sufocação. A bolha estoura se o alvo receber 10+ dano em 1 golpe." },
      { name:"Merging", desc:"Pode entrar em qualquer corpo d'água como Ação livre e emergir de qualquer outro ponto com água no campo de batalha." }
    ],
    spells:[], behavior:"Outrora protetora de rios, corrompida pela energia do Grande Lago ou do Deus Marcado. Atrai viajantes para a água. Pode ser purificada por Clérigo de Jurgmund (missão secundária).",
    loot:[{item:"Lágrima de Náiade (componente mágico de água)",chance:60,qty:"1"},{item:"Pedra do Rio Polida (amuleto simples)",chance:40,qty:"1"}] },

  /* ─── DIFICULDADE 3 ─────────────────────────────────────── */

  { id:"minotauro-perdido", name:"Minotauro Perdido", difficulty:3, size:"grande", category:"Humanoide",
    location:["Labirinto","Dungeon","Ruínas"],
    hp:95, physDefense:6, magDefense:2, dodge:11,
    actions:3, reactions:1, damage:"1d12+1d10 (machado colossal)",
    abilities:[
      { name:"Carga do Labirinto", desc:"Se mover 3+ hex em linha reta antes de atacar: dano dobrado + alvo testado AGI (difícil) ou Derrubado e Empurrado 2 hex. O minotauro não para — segue em frente 1 hex extra." },
      { name:"Sentido de Labirinto", desc:"Nunca se perde. Em dungeon ou labirinto: sempre sabe o caminho para qualquer ponto visitado. Imune a magias de desorientação ou névoa mental." },
      { name:"Fúria de Sangue", desc:"Ao receber qualquer crítico: entra em Fúria por 3 rodadas — +2 Ações, ignora penalidades de ferimento mas não pode usar Reações defensivas." },
      { name:"Brado Ensurdecedor", desc:"1x/combate: grito poderoso em raio 4 hex — todos testam FOR (normal) ou ficam Atordoados por 1 rodada e com -1d4 em Percepção por 2 rodadas." }
    ],
    spells:[], behavior:"Territorial e traumatizado. Patrulha seu labirinto com fúria silenciosa. Pode ser apaziguado por alguém que mostre respeito genuíno (SAB crítico + falar em Orc antigo).",
    loot:[{item:"Chifre de Minotauro (instrumento/arma)",chance:50,qty:"1"},{item:"Machado de Minotauro (arma grande)",chance:40,qty:"1"},{item:"Fio de Minotauro (sempre leva ao centro)",chance:20,qty:"1"}] },

  { id:"quimera-jovem", name:"Quimera Jovem", difficulty:3, size:"grande", category:"Besta",
    location:["Montanha","Planície","Dungeon de Elite"],
    hp:88, physDefense:5, magDefense:4, dodge:13,
    actions:3, reactions:2, damage:"1d10+1d6 (cabeças alternadas)",
    abilities:[
      { name:"Três Cabeças", desc:"Cada turno, a Quimera ataca com a cabeça dominante (Mestre escolhe ou rola 1d3): 1=Leão (mordida 1d10, Derruba), 2=Bode (chifrada 1d8, Empurra 2 hex), 3=Dragão (sopro 2d6 fogo cone 3 hex)." },
      { name:"Sopro de Dragão", desc:"Cabeça de Dragão: 1x a cada 2 rodadas — cone 4 hex, 2d8 de fogo, AGI normal para metade." },
      { name:"Confusão de Combate", desc:"Ao matar uma das cabeças (estrutura narrativa): a Quimera fica Atordoada por 1 rodada mas em compensação fica Enfurecida — +1d8 de dano pelas rodadas restantes." },
      { name:"Voar Pesado", desc:"Pode voar em altitude 2 mas é lenta — move apenas 2 hex ao voar. Ataques em voo reduzem para 2 Ações." }
    ],
    spells:[], behavior:"Caçadora territorial. Planeja atacar de cima com sopro, pousar para corpo a corpo. Não tem estratégia sofisticada — confia no poder bruto das três cabeças.",
    loot:[{item:"Escama de Quimera (material raro)",chance:60,qty:"1d6"},{item:"Garra de Quimera",chance:50,qty:"1d4"},{item:"Coração Triplo de Quimera (reagente lendário)",chance:20,qty:"1"}] },

  { id:"bruxa-das-ervas", name:"Bruxa das Ervas Venenosas", difficulty:3, size:"normal", category:"Humanoide",
    location:["Pântano","Floresta Profunda","Ruínas"],
    hp:60, physDefense:1, magDefense:8, dodge:14,
    actions:2, reactions:2, damage:"1d6 (cajado venenoso) + veneno",
    abilities:[
      { name:"Nuvem de Esporos", desc:"1 Ação Mágica: nuvem em raio 3 hex por 3 rodadas. Todos dentro testam SAB (normal) a cada rodada: falha = Envenenado (1d6/rodada) E Confuso (age aleatoriamente) por 2 rodadas." },
      { name:"Maldição do Espelho", desc:"1 Ação Mágica (1x/combate): reflete a próxima magia que atingir a bruxa de volta ao conjurador com dano dobrado. Dura até ser usada ou 3 rodadas." },
      { name:"Poções de Combate", desc:"Tem 3 poções especiais em cinturão que usa como Ação Livre: Fraqueza (alvo -2 FOR/AGI, 3 rodadas), Cegueira (alvo Cego, 2 rodadas), Sono (alvo SAB crítico ou dorme 1d4 rodadas)." },
      { name:"Familiar Venenoso", desc:"Acompanhada por cobra venenosa pequena (HP 12, dano 1d4+veneno 1d6/rodada). A bruxa ganha +1d4 em Percepção enquanto o familiar estiver vivo." }
    ],
    spells:["Nuvem de Esporos (nível 2)","Maldição do Espelho (nível 3)","Poção de Fraqueza (nível 1)"],
    behavior:"Hábil manipuladora. Tenta negociar primeiro (tem informações valiosas). Em combate: abre com Esporos para confundir, usa poções nos mais fortes, guarda Maldição do Espelho para o conjurador.",
    loot:[{item:"Grimório de Venenos (receitas raras)",chance:40,qty:"1"},{item:"Ervas Venenosas Raras (×5)",chance:70,qty:"1"},{item:"Poção Especial da Bruxa (efeito variado)",chance:50,qty:"1d2"},{item:"Olho de Bruxa (componente)",chance:25,qty:"1"}] },

  { id:"cavaleiro-sem-cabeca", name:"Cavaleiro Sem Cabeça", difficulty:3, size:"normal", category:"Morto-Vivo",
    location:["Estrada","Floresta","Cemitério Nobre"],
    hp:85, physDefense:7, magDefense:3, dodge:13,
    actions:3, reactions:2, damage:"1d10+1d8 (espada do julgamento)",
    abilities:[
      { name:"Sem Cabeça", desc:"Imune a Cegueira, Atordoado por som e qualquer efeito que exija visão ou audição para funcionar. Veneno via mordida também não funciona (sem boca)." },
      { name:"Julgamento dos Mortos", desc:"Ao aproximar de um alvo a 1 hex: o alvo sente o peso do julgamento — testa SAB (normal) ou fica com -1d4 em todos os ataques enquanto o Cavaleiro estiver adjacente." },
      { name:"Cabeça Voadora", desc:"1x/combate: a cabeça destacada voa para um alvo a 8 hex e o morde (1d6 + Atordoado 1 rodada). A cabeça retorna no próximo turno. Sem a cabeça: o Cavaleiro perde o bônus de Julgamento dos Mortos." },
      { name:"Invulnerabilidade Parcial", desc:"Dano cortante é reduzido em 3 (a armadura espectral absorve). Fogo sagrado e magia divina causam 1d6 extra." }
    ],
    spells:[], behavior:"Busca quem fez algum juramento não cumprido — ataca priorizando personagens com dívidas de honra. Pode ser apaziguado se um juramento antigo for cumprido na sua presença.",
    loot:[{item:"Armadura do Cavaleiro (set incompleto, mágico)",chance:50,qty:"1"},{item:"Espada do Julgamento (arma lendária)",chance:20,qty:"1"},{item:"Medalhão da Ordem (identifica a nobreza que serviu)",chance:70,qty:"1"}] },

  { id:"escorpiao-gigante", name:"Escorpião Gigante do Deserto", difficulty:3, size:"grande", category:"Besta",
    location:["Deserto Carmesim","Planície Árida","Caverna"],
    hp:80, physDefense:7, magDefense:1, dodge:11,
    actions:3, reactions:1, damage:"1d10+1d6 (pinças) + 1d8 (ferrão)",
    abilities:[
      { name:"Dupla Pinça", desc:"Pode atacar com ambas as pinças em 1 Ação. Cada pinça que acerta: alvo testado FOR (normal) ou fica Agarrado. Se ambas agarrarem: alvo fica Imóvel." },
      { name:"Ferrão de Neurotoxina", desc:"O ferrão aplica neurotoxina — 1d8 por rodada, reduz 1 AGI por rodada (não regenera até antídoto). 3 rodadas de ferrão sem cura: alvo fica Paralisado. Resistência FOR (difícil) para metade." },
      { name:"Exoesqueleto Reforçado", desc:"Reduz todo dano perfurante em 4. Magia de terra ou dano contundente é normal." },
      { name:"Instinto de Enterrar", desc:"Em terreno arenoso ou de terra macia: pode enterrar-se como Ação (fica invisível até atacar). O próximo ataque de emboscada causa dano duplo." }
    ],
    spells:[], behavior:"Caçador paciente. Espera enterrado até que uma presa se aproxime. Sempre tenta prender com as pinças antes de usar o ferrão. Foge se perder ambas as pinças.",
    loot:[{item:"Veneno de Escorpião Gigante (componente raro, ×3)",chance:60,qty:"1"},{item:"Exoesqueleto (material de armadura)",chance:40,qty:"1"},{item:"Ferrão (arma improvisada)",chance:30,qty:"1"}] },

  { id:"esfinx-menor", name:"Esfinge Menor", difficulty:3, size:"grande", category:"Besta Mística",
    location:["Deserto","Ruínas Élficas","Templo"],
    hp:90, physDefense:6, magDefense:7, dodge:13,
    actions:3, reactions:2, damage:"1d10+1d8 (garras e bico)",
    abilities:[
      { name:"O Enigma", desc:"No início do combate: apresenta um enigma ao grupo. Se resolverem corretamente (1 minuto de discussão): a Esfinge para de atacar e responde 1 pergunta verdadeira. Se errarem: entra em Fúria por 3 rodadas (+1d8 de dano, +1 Ação)." },
      { name:"Olho do Destino", desc:"1 Ação Mágica: vê 1 rodada no futuro — o próximo ataque contra ela erra automaticamente (previsão perfeita). Usa 1x a cada 3 rodadas." },
      { name:"Rugido da Verdade", desc:"1 Ação Mágica (1x/combate): rugido em raio 4 hex — todos que mentiram nas últimas 24 horas testam SAB (crítico) ou ficam Atordoados 2 rodadas." },
      { name:"Voo Majestoso", desc:"Altitude 3. Ataques à distância têm -1d4. Pode atacar de altitude e retornar sem custo." }
    ],
    spells:["Olho do Destino (nível 3)","Rugido da Verdade (nível 3)"],
    behavior:"Prefere muito mais o enigma ao combate. Não luta se pode falar. Em combate: usa Olho do Destino defensivamente, mantém altitude e usa garras em mergulhos. Nunca persegue quem foge.",
    loot:[{item:"Pena de Esfinge (componente de magia de previsão)",chance:50,qty:"1d3"},{item:"Cristal de Conhecimento (responde 1 pergunta sim/não)",chance:25,qty:"1"},{item:"Ouro do Tesouro Guardado",chance:60,qty:"3d20"}] },

  { id:"elemental-terra", name:"Elemental de Terra", difficulty:3, size:"grande", category:"Elemental",
    location:["Montanha","Caverna","Planície Pedregosa"],
    hp:100, physDefense:9, magDefense:2, dodge:8,
    actions:2, reactions:1, damage:"2d8+1d6 (soco de pedra)",
    abilities:[
      { name:"Corpo de Rocha", desc:"Imune a dano cortante e perfurante. Resistência a dano contundente (-2 por dado). Fogo causa dano normal. Magia de terra cura (+1d8 por acerto de magia terrestre)." },
      { name:"Fundir no Chão", desc:"Em terreno natural (pedra, terra): pode submergir no chão como Ação livre. Emerge em qualquer ponto a até 8 hex no próximo turno. Enquanto submerso: imune a dano físico." },
      { name:"Tremor Local", desc:"1 Ação (1x/combate): soca o chão criando tremor em raio 3 hex — todos no chão testam AGI (normal) ou ficam Derrubados. Estruturas frágeis próximas tomam 10 de dano." },
      { name:"Golpe Sísmico", desc:"A cada 2 acertos consecutivos: o terceiro ataque causa +1d10 de dano extra (a força acumulada encontra o ponto fraco)." }
    ],
    spells:[], behavior:"Invocado ou guardião natural. Segue o caminho de menor resistência (vai pelo chão). Imperturbável e lento. Podem ser negociados por Clérigos de Thurgomur.",
    loot:[{item:"Coração de Pedra Viva (material divino)",chance:30,qty:"1"},{item:"Pedra Elemental (componente de magia de terra)",chance:70,qty:"1d4"},{item:"Cristal Geodo (decorativo e valioso)",chance:50,qty:"1d3"}] },

  { id:"gargoyle", name:"Gárgula Guardiã", difficulty:3, size:"normal", category:"Construto",
    location:["Castelo","Ruínas","Templo","Topo de Torre"],
    hp:75, physDefense:8, magDefense:4, dodge:13,
    actions:3, reactions:2, damage:"1d8+1d6 (garras de pedra e chifres)",
    abilities:[
      { name:"Pedra Viva", desc:"Quando imóvel por 1 rodada completa: parece escultura de pedra (Percepção crítico para notar que está viva). Primeiro ataque após mimetismo: Crítico automático." },
      { name:"Voadora de Pedra", desc:"Altitude 2. Apesar do peso: voa de forma silenciosa. Ataques à distância têm -1d4 (corpo de pedra desvia projéteis). Pode carregar um alvo no voo (AGI difícil para escapar)." },
      { name:"Resistência Elemental", desc:"Reduz 3 pontos de todo dano físico. Dano de fogo reduzido pela metade. Magia de terra ou divina causa 1d6 extra (o encantamento que a criou é vulnerável)." },
      { name:"Guardiã Eterna", desc:"Nunca abandona o ponto que guarda. Persegue qualquer ameaça em raio 10 hex do ponto de guarda, mas para imediatamente se ultrapassar esse limite." }
    ],
    spells:[], behavior:"Guarda um ponto específico eternamente. Não ataca quem passa sem ameaçar o local. Pode ser confundida com decoração. Responde a palavra de comando de quem a criou.",
    loot:[{item:"Fragmento de Gárgula (material de pedra encantada)",chance:70,qty:"1d4"},{item:"Cristal de Encantamento (nucleo que a anima)",chance:30,qty:"1"}] },

  { id:"mercenario-elite", name:"Mercenário de Elite", difficulty:3, size:"normal", category:"Humanoide",
    location:["Cidade","Dungeon Contratada","Estrada"],
    hp:72, physDefense:6, magDefense:3, dodge:15,
    actions:3, reactions:3, damage:"1d10+1d6 (espada longa ou arco)",
    abilities:[
      { name:"Veterano de Batalha", desc:"Nunca entra em pânico ou fica Amedrontado. Imune à primeira Condição negativa de cada combate. +1d4 em todos os testes de combate." },
      { name:"Estrategista", desc:"1 Ação (1x/combate): analisa o campo de batalha — escolhe 1 alvo. Todos os ataques contra esse alvo pelo grupo ganham +1d4 de acerto por 2 rodadas." },
      { name:"Contra-Ataque Expert", desc:"Ao usar uma Reação defensiva com sucesso: pode imediatamente fazer 1 ataque contra o atacante sem custo adicional." },
      { name:"Arsenal Variado", desc:"Tem 3 opções de ataque disponíveis: (1) Espada + Escudo — +1 Def.Física, (2) Espada Dupla — +1 Ação de ataque, (3) Arco (alcance 10) — sem bonus/penalidade." }
    ],
    spells:[], behavior:"Profissional calculista. Avalia ameaças e prioriza as maiores. Pode ser corrompido por oferta maior que quem o contratou (INT alta). Em desvantagem clara: oferece trégua e informações.",
    loot:[{item:"Armadura de Mercenário (item raro)",chance:40,qty:"1"},{item:"Espada de Elite (arma rara)",chance:30,qty:"1"},{item:"Contrato de Contratante (pista)",chance:60,qty:"1"},{item:"Moedas de Ouro",chance:80,qty:"2d10"}] },

  { id:"serpente-vento", name:"Serpente do Vento", difficulty:3, size:"normal", category:"Besta Elemental",
    location:["Montanhas de Atrelon","Penhasco","Planície Aberta"],
    hp:65, physDefense:3, magDefense:6, dodge:19,
    actions:3, reactions:3, damage:"1d8+1d6 (mordida + vento cortante)",
    abilities:[
      { name:"Corpo de Vento", desc:"Pode se mover através de qualquer espaço não-sólido. Esquiva base 19 (o corpo é parcialmente intangível ao vento). Ataques físicos têm 25% de chance de passar sem dano (rola 1d4 — em 1, o golpe atravessa)." },
      { name:"Rajada Cegante", desc:"1 Ação: libera rajada em cone 3 hex — todos testam AGI (normal) ou ficam Cegos por 1 rodada e Empurrados 2 hex." },
      { name:"Corte de Vento", desc:"Pode atacar à distância de até 4 hex sem projétil — o vento que controla corta o ar. Alvo não pode usar escudo contra este ataque." },
      { name:"Véu de Ventos", desc:"Passivo: projéteis que a tenham como alvo têm 40% de chance de ser desviados pelo vento ao redor (rola 1d10 — em 1-4, o projétil desvia)." }
    ],
    spells:[], behavior:"Curiosa e fugaz. Ataca por breve períodos e recua. Nunca luta até a morte — foge quando abaixo de 40% HP. Serpentarianos que entendem Jurgmund podem comunicar-se com ela.",
    loot:[{item:"Escama de Vento (material leve, resistente)",chance:50,qty:"1d4"},{item:"Essência de Vento (componente mágico)",chance:40,qty:"1"}] },

  { id:"golem-carne", name:"Golem de Carne", difficulty:3, size:"grande", category:"Construto",
    location:["Laboratório do Necromante","Dungeon Profunda"],
    hp:105, physDefense:5, magDefense:2, dodge:9,
    actions:2, reactions:1, damage:"1d12+1d8 (soco brutal)",
    abilities:[
      { name:"Tecido Morto", desc:"Imune a veneno e condições mentais. Vulnerável a fogo (+1d6 por dado). Dano cortante causa sangramento no golem — perde 1d4 HP por rodada por 3 rodadas (o sangue escorre)." },
      { name:"Partes Extras", desc:"Tem 6 braços adicionais costurados. Para cada 30 HP perdidos: perde 1 Ação mas ganha Reação de Agarrar automática quando atacado corpo a corpo." },
      { name:"Absorver Partes", desc:"Ao matar uma criatura adjacente: pode absorver parte do corpo — recupera 1d8 HP e ganha +1d4 no próximo ataque (a parte fresca adiciona força)." },
      { name:"Grito do Criador", desc:"Se o necromante que o criou estiver vivo e gritar uma ordem: o golem a obedece instantaneamente como Reação (mesmo que não seja seu turno)." }
    ],
    spells:[], behavior:"Robô de carne sem inteligência. Segue ordens simples do criador. Sem ordens: defende o espaço onde está. Foco em um alvo por vez até destruído.",
    loot:[{item:"Partes de Golem (material grotesco mas útil)",chance:60,qty:"1d4"},{item:"Núcleo de Animação (componente do necromante)",chance:30,qty:"1"},{item:"Diário do Criador (pista)",chance:20,qty:"1"}] }


];
