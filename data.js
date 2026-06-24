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
const CARRY_BASE = 15;
const CARRY_PER_FOR = 5;

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
    naturalDamageDie: "1d6",
    naturalDamageNote: "+1 dano natural a cada 2 pontos de FOR",
    forPerNaturalBonus: 2,
    skills: [
      { name: "Golpe Pesado", cost: "2 Fúria, 1 Ação", effect: "Próximo ataque corpo a corpo causa +1d6 de dano adicional." },
      { name: "Postura Defensiva", cost: "1 Fúria, 1 Ação", effect: "+2 na Chance de Defesa até o início do próximo turno; a 1ª defesa do turno não degrada." },
      { name: "Provocar", cost: "1 Fúria, 1 Reação", effect: "Um inimigo adjacente tem −2 na Chance de Acerto contra qualquer alvo que não seja você até o fim da próxima rodada." },
      { name: "Contra-ataque", cost: "2 Fúria, 1 Reação", effect: "Ao defender com sucesso um ataque corpo a corpo, ataca o atacante de volta sem gastar Ação." },
      { name: "Fúria Sangrenta", cost: "3 Fúria, 1 Ação", effect: "Por 2 turnos: +2 no Dano Natural, mas −1 na Chance de Defesa." },
      { name: "Grito de Guerra", cost: "3 Fúria, 1 Ação", effect: "Aliados em até 2 hexágonos ganham +1 na Chance de Acerto até o fim da próxima rodada." },
      { name: "Quebra-Guarda", cost: "2 Fúria, 1 Ação", effect: "Ataque que, se acertar, ignora a Defesa Física vinda de escudo do alvo." },
      { name: "Última Resistência", cost: "5 Fúria (todos), 1 Ação", effect: "Com HP ≤ 25%, gasta toda a Fúria para curar 1d10 + FOR. Uso único por combate." }
    ],
    skillsClass: [
      { name: "Combate com Armas Pesadas", attr: "FOR", desc: "Reduz as penalidades de manejo de armas grandes e pesadas, como machados de duas mãos e martelos de guerra, tornando os golpes mais precisos e firmes.", example: "Manejar um machado grande sem perder equilíbrio ao golpear, mesmo em espaço apertado." },
      { name: "Combate com Armas Leves", attr: "DEX", desc: "Melhora o manejo de espadas curtas e adagas, permitindo golpes mais rápidos e ajustes finos de ângulo durante o combate.", example: "Encaixar um golpe certeiro entre as placas de uma armadura inimiga usando uma adaga." },
      { name: "Resistência Física", attr: "FOR", desc: "Aumenta a capacidade de resistir a venenos, fadiga extrema e efeitos físicos debilitantes que afetam o corpo.", example: "Continuar lutando mesmo após ser envenenado por uma flecha, resistindo aos efeitos por mais tempo." },
      { name: "Intimidação", attr: "FOR/SAB", desc: "Permite ameaçar e impor presença física ou psicológica sobre outros, seja em combate ou em negociações tensas.", example: "Fazer um bandido desistir de um assalto só de erguer o machado e encarar o grupo." },
      { name: "Tática de Campo", attr: "INT", desc: "Avalia terreno, formações inimigas e pontos fracos estratégicos antes ou durante uma batalha.", example: "Notar que os arqueiros inimigos estão posicionados num morro e sugerir um flanco pela direita." },
      { name: "Atletismo", attr: "FOR/AGI", desc: "Permite escalar superfícies, saltar distâncias maiores e arrombar portas ou obstáculos com força física.", example: "Saltar de um telhado a outro durante uma perseguição, ou derrubar uma porta trancada com um chute." }
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
    naturalDamageDie: "1d4",
    naturalDamageNote: "Dano natural padrão, sem bônus de classe",
    forPerNaturalBonus: 0,
    skills: [
      { name: "Amplificar Dano", cost: "3 MP", effect: "A próxima magia ganha +1 dado extra do mesmo tipo já usado nela." },
      { name: "Conjuração Rápida", cost: "4 MP", effect: "A próxima magia é conjurada como Reação em vez de Ação (1x por turno)." },
      { name: "Eco Arcano", cost: "5 MP", effect: "A próxima magia de alvo único também atinge um alvo adjacente, com metade do dano." },
      { name: "Escudo Arcano", cost: "3 MP, 1 Reação", effect: "Cria uma barreira que absorve os próximos 1d8 + INT de dano." },
      { name: "Dreno de Mana", cost: "4 MP, 1 Ação", effect: "Toque (alcance 1): rouba 1d4 Slots de um inimigo conjurador, convertendo em 2 MP por slot." },
      { name: "Reciclagem Arcana", cost: "6 MP", effect: "Recupera 1 Slot de Magia já gasto neste combate. Uso único por combate." },
      { name: "Sobrecarga", cost: "8 MP", effect: "A próxima magia ignora metade da Defesa Mágica do alvo; você sofre 1d6 de dano de recuo." },
      { name: "Domínio dos Elementos", cost: "5 MP", effect: "Escolhe um elemento; por 3 rodadas, magias desse tipo causam +2 de dano fixo." },
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
    naturalDamageDie: "1d4",
    naturalDamageNote: "+1 dano natural a cada 3 pontos de FOR",
    forPerNaturalBonus: 3,
    skills: [
      { name: "Marcar Alvo", cost: "1 Foco, 1 Ação", effect: "Inimigo fica 'Marcado' por 3 rodadas; ataques à distância contra ele ganham +1 na Chance de Acerto." },
      { name: "Tiro Certeiro", cost: "2 Foco, 1 Ação", effect: "Próximo ataque à distância ignora metade da Defesa Física do alvo." },
      { name: "Disparo Múltiplo", cost: "3 Foco, 1 Ação", effect: "Dispara contra até 2 alvos diferentes, cada um resolvido separadamente." },
      { name: "Tiro de Precisão", cost: "2 Foco, 1 Reação", effect: "Dispara imediatamente quando um inimigo entra em linha de visão." },
      { name: "Flecha Imobilizante", cost: "2 Foco, 1 Ação", effect: "Se acertar, reduz o Movimento do alvo em 3 na próxima rodada." },
      { name: "Reposicionamento Tático", cost: "1 Foco, 1 Ação", effect: "Move até metade do Movimento e dispara ao final, sem penalidade." },
      { name: "Chuva de Flechas", cost: "4 Foco, 1 Ação", effect: "Ataque em área (raio 1); cada criatura sofre um ataque individual." },
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
    naturalDamageDie: "1d4",
    naturalDamageNote: "+1 dano natural a cada 3 pontos de FOR; +1d6 e bônus de AGI em Ataques Furtivos",
    forPerNaturalBonus: 3,
    skills: [
      { name: "Golpe Envenenado", cost: "1 Carga, 1 Ação", effect: "Ataque corpo a corpo que aplica Veneno: 1d4 de dano contínuo por 3 rodadas." },
      { name: "Passo nas Sombras", cost: "1 Ação", effect: "Move até o total sem provocar Ataques de Oportunidade, terminando em cobertura." },
      { name: "Emboscada", cost: "1 Ação", effect: "Se Oculto, move e ataca furtivamente sem revelar a posição antes do golpe." },
      { name: "Veneno Paralisante", cost: "2 Cargas, 1 Ação", effect: "Ataque que impõe −2 Movimento e −1 Chance de Defesa por 2 rodadas." },
      { name: "Reflexos de Gato", cost: "1 Reação", effect: "+2 na Chance de Defesa contra um ataque específico, mesmo desarmado." },
      { name: "Roubo Rápido", cost: "1 Ação", effect: "Furta item pequeno ou desarma armadilha simples sem provocar reação." },
      { name: "Golpe Duplo", cost: "1 Ação", effect: "2 ataques corpo a corpo no mesmo alvo, cada um com −1 na Chance de Acerto." },
      { name: "Sangramento Mortal", cost: "2 Cargas, 1 Ação", effect: "Se for Ataque Furtivo, aplica Sangramento: 1d6 contínuo por 3 rodadas." }
    ],
    skillsClass: [
      { name: "Furtividade", attr: "AGI/DEX", desc: "Permite permanecer Oculto e evitar detecção mesmo em ambientes com pouca cobertura.", example: "Atravessar uma sala vigiada por guardas sem que nenhum deles perceba sua presença." },
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
    naturalDamageDie: "1d4",
    naturalDamageNote: "Dano natural padrão, sem bônus de classe",
    forPerNaturalBonus: 0,
    skills: [
      { name: "Mãos Curativas", cost: "2 Fé, 1 Ação", effect: "Cura 1d6 + SAB de HP em alvo tocado (alcance 1)." },
      { name: "Palavra de Cura", cost: "3 Fé, 1 Ação", effect: "Cura 1d4 + SAB em até 2 alvos dentro de 4 hexágonos." },
      { name: "Bênção", cost: "2 Fé, 1 Ação", effect: "Aliado ganha +1 Chance de Acerto e +1 Chance de Defesa por 3 rodadas." },
      { name: "Repreensão Sagrada", cost: "3 Fé, 1 Ação", effect: "2d6 de dano sagrado contra mortos-vivos (1d6 contra outras criaturas)." },
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
      { name: "Proteção contra o Mal", level: 1, effect: "+2 na Chance de Defesa contra criaturas malignas por 3 rodadas.", castTime: "1 Ação (instantânea)", cooldown: "3 usos por sessão" },
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
  { name: "Resistência Elemental", level: 3, effect: "Concede resistência a um tipo de dano elemental (reduz à metade) a um alvo tocado por 3 rodadas.", castTime: "1 Ação (instantânea)", cooldown: "1 uso por dia" }
];

/* ---------------------------------------------------------------------- */
/* EQUIPAMENTOS                                                           */
/* slot: "primary" | "secondary" | "shield" | "armor" | "accessory"      */
/* defenseDegrade: null (não defende) | 0 (não degrada) | 1 | 2          */
/* ---------------------------------------------------------------------- */

const WEAPONS_ONE_HAND = [
  { name: "Adaga", dmg: "1d4", req: "DEX", weight: 1, defenseDegrade: 2, slot: ["primary","secondary"], note: "Leve; ideal para Ladino." },
  { name: "Espada Curta", dmg: "1d6", req: "DEX", weight: 3, defenseDegrade: 1, slot: ["primary","secondary"], note: "Equilibrada, boa para qualquer classe." },
  { name: "Espada Longa de Uma Mão", dmg: "1d8", req: "FOR/DEX", weight: 4, defenseDegrade: 1, slot: ["primary","secondary"], note: "Arma clássica de Guerreiro/Clérigo." },
  { name: "Machado de Uma Mão", dmg: "1d8", req: "FOR", weight: 5, defenseDegrade: 1, slot: ["primary","secondary"], note: "Bom contra escudos de madeira." },
  { name: "Maça/Clava", dmg: "1d6", req: "FOR", weight: 4, defenseDegrade: 1, slot: ["primary","secondary"], note: "Arma de impacto, sem penalidade para Clérigo." },
  { name: "Cetro/Cajado de Uma Mão", dmg: "1d6", req: "INT/SAB", weight: 2, defenseDegrade: 2, slot: ["primary","secondary"], note: "Canaliza magia sem penalidade." },
  { name: "Espada Curva do Vento", dmg: "1d6", req: "DEX", weight: 2, defenseDegrade: 1, slot: ["primary","secondary"], note: "Leve e veloz; +1 Movimento enquanto equipada como arma primária." },
  { name: "Picareta de Mineiro", dmg: "1d6", req: "FOR", weight: 4, defenseDegrade: 1, slot: ["primary","secondary"], note: "Ferramenta improvisada; também serve para escavar e quebrar pedra." },
  { name: "Machadinha Dupla", dmg: "1d8", req: "FOR/AGI", weight: 4, defenseDegrade: 1, slot: ["primary","secondary"], note: "Pode ser lançada como arma à distância de curto alcance (3 hexágonos) sem penalidade." }
];

const WEAPONS_TWO_HAND = [
  { name: "Espada Longa de Duas Mãos", dmg: "1d12", req: "FOR", weight: 7, defenseDegrade: null, slot: ["primary"], note: "Alto dano, sem defesa ativa." },
  { name: "Machado Grande", dmg: "1d12 + 1d4", req: "FOR (alto)", weight: 9, defenseDegrade: null, slot: ["primary"], note: "Dano altíssimo." },
  { name: "Martelo de Guerra", dmg: "1d10 + 1d4", req: "FOR", weight: 8, defenseDegrade: null, slot: ["primary"], note: "Bom contra armaduras pesadas." },
  { name: "Lança", dmg: "1d10", req: "FOR/DEX", weight: 6, defenseDegrade: null, slot: ["primary"], note: "Alcance 2 hexágonos corpo a corpo." },
  { name: "Cajado de Batalha (Mago)", dmg: "1d8", req: "INT", weight: 4, defenseDegrade: null, slot: ["primary"], note: "Conjura sem penalidade." },
  { name: "Foice de Guerra", dmg: "1d10 + 1d4", req: "FOR/AGI", weight: 6, defenseDegrade: null, slot: ["primary"], note: "Ao atingir um Acerto Crítico, atinge também um inimigo adjacente ao alvo com metade do dano." },
  { name: "Alabarda", dmg: "1d10 + 1d6", req: "FOR", weight: 8, defenseDegrade: null, slot: ["primary"], note: "Alcance 2 hexágonos; pode ser usada para Ataques de Oportunidade mesmo a 2 hexágonos de distância." }
];

const WEAPONS_MAGIC = [
  { name: "Varinha", dmg: "1d4 (toque)", req: "INT/SAB", weight: 1, defenseDegrade: 2, slot: ["primary","secondary"], note: "Canaliza magias menores." },
  { name: "Grimório", dmg: "—", req: "INT", weight: 2, defenseDegrade: 2, slot: ["secondary"], note: "+1 nível máximo de magia conjurável." },
  { name: "Orbe Arcano", dmg: "1d4 (toque)", req: "INT/SAB", weight: 1, defenseDegrade: 2, slot: ["secondary"], note: "+1 MP máximo (até 2 itens)." }
];

const WEAPONS_RANGED = [
  { name: "Arco Curto", dmg: "1d6", range: 8, req: "DEX", weight: 3, defenseDegrade: null, slot: ["primary"], note: "Recarga rápida." },
  { name: "Arco Longo", dmg: "1d8", range: 12, req: "DEX", weight: 4, defenseDegrade: null, slot: ["primary"], note: "Padrão do Arqueiro." },
  { name: "Besta", dmg: "1d10", range: 10, req: "DEX/FOR", weight: 6, defenseDegrade: null, slot: ["primary"], note: "Recarregar custa 1 Ação extra." },
  { name: "Adaga de Lançamento", dmg: "1d4", range: 4, req: "DEX", weight: 1, defenseDegrade: 2, slot: ["primary","secondary"], note: "Também usável corpo a corpo." },
  { name: "Funda", dmg: "1d4", range: 6, req: "DEX", weight: 1, defenseDegrade: null, slot: ["primary"], note: "Munição barata." },
  { name: "Besta de Repetição", dmg: "1d8", range: 9, req: "DEX", weight: 5, defenseDegrade: null, slot: ["primary"], note: "Não exige recarga entre disparos, mas causa 1 ponto de dano a menos que a Besta comum." },
  { name: "Arco Longo Élfico", dmg: "1d8 + 1d4", range: 14, req: "DEX (alto)", weight: 3, defenseDegrade: null, slot: ["primary"], note: "Construção élfica refinada; maior alcance e dano, porém rara e cara de substituir." }
];

const SHIELDS = [
  { name: "Escudo Leve (broquel)", physDefense: 1, weight: 3, penalty: "Nenhuma", slot: ["shield"] },
  { name: "Escudo Médio", physDefense: 3, weight: 6, penalty: "−1 no Movimento", slot: ["shield"] },
  { name: "Escudo Pesado", physDefense: 6, weight: 10, penalty: "−1 na Chance de Acerto", slot: ["shield"] },
  { name: "Escudo Rúnico", physDefense: 2, weight: 4, penalty: "Nenhuma", slot: ["shield"], note: "Gravado com runas; +1 Defesa Mágica além da Defesa Física." }
];

const ARMORS = [
  { name: "Roupas Comuns", physDefense: 0, magDefense: 0, weight: 1, movePenalty: 0, req: "—" },
  { name: "Armadura de Couro", physDefense: 2, magDefense: 0, weight: 5, movePenalty: 0, req: "—" },
  { name: "Armadura de Couro Batido", physDefense: 3, magDefense: 0, weight: 7, movePenalty: 0, req: "DEX" },
  { name: "Cota de Malha", physDefense: 5, magDefense: 0, weight: 14, movePenalty: 1, req: "FOR" },
  { name: "Armadura de Placas Parcial", physDefense: 7, magDefense: 0, weight: 20, movePenalty: 2, req: "FOR" },
  { name: "Armadura de Placas Completa", physDefense: 9, magDefense: 0, weight: 28, movePenalty: 3, req: "FOR alta" },
  { name: "Vestes Arcanas", physDefense: 1, magDefense: 4, weight: 2, movePenalty: 0, req: "INT/SAB" },
  { name: "Vestes Sagradas", physDefense: 2, magDefense: 3, weight: 3, movePenalty: 0, req: "SAB" },
  { name: "Manto das Sombras", physDefense: 2, magDefense: 1, weight: 2, movePenalty: 0, req: "Ladino (+1 Furtividade)" },
  { name: "Armadura de Escamas de Dragão (Réplica)", physDefense: 6, magDefense: 2, weight: 12, movePenalty: 1, req: "FOR", note: "Imitação cara de armadura draconiana; equilíbrio raro entre defesa física e mágica." },
  { name: "Roupagem do Andarilho", physDefense: 1, magDefense: 1, weight: 1, movePenalty: -1, req: "—", note: "Tecido leve e bem cortado; reduz o peso percebido, concedendo +1 Movimento em vez de penalidade." }
];

const ACCESSORIES = [
  { name: "Anel de Vitalidade", weight: 0.1, effect: "+5 HP máximo", rarity: "comum" },
  { name: "Anel de Foco Arcano", weight: 0.1, effect: "+1 Slot de Magia", rarity: "comum" },
  { name: "Amuleto de Fé", weight: 0.5, effect: "+2 Fé máxima (Clérigo) ou +1 Defesa Mágica", rarity: "comum" },
  { name: "Bracelete de Reflexos", weight: 0.3, effect: "+1 Reação por rodada", rarity: "incomum" },
  { name: "Botas Ágeis", weight: 1, effect: "+1 Movimento", rarity: "comum" },
  { name: "Cinto do Berserker", weight: 0.5, effect: "+1 ganho de Fúria ao receber dano", rarity: "comum" },
  { name: "Luvas do Caçador", weight: 0.3, effect: "+1 ganho de Foco ao acertar à distância", rarity: "comum" },
  { name: "Capa Furtiva", weight: 1, effect: "+2 em testes de Furtividade", rarity: "comum" },
  { name: "Pingente de Cura", weight: 0.2, effect: "Curas do portador +1 ponto fixo", rarity: "comum" },
  { name: "Pedra de Mana", weight: 0.4, effect: "+5 MP máximo", rarity: "comum" },
  { name: "Frasco de Antídoto Permanente", weight: 0.5, effect: "Recarrega 1 Carga de Veneno por dia", rarity: "comum" },
  { name: "Talismã do Guardião", weight: 0.3, effect: "+2 Defesa Física com HP < 30%", rarity: "incomum" },
  { name: "Olho de Vidro do Oráculo", weight: 0.2, effect: "Uma vez por dia, revela se um inimigo visível está acima ou abaixo de 50% do HP máximo.", rarity: "incomum" },
  { name: "Anel do Eco Distante", weight: 0.1, effect: "A primeira magia conjurada a cada combate não consome Slot de Magia (mas ainda respeita o cooldown normal).", rarity: "raro" },
  { name: "Corrente do Peso Leve", weight: -3, effect: "Reduz o peso efetivo do portador em 3kg (não pode deixar a carga total abaixo de 0).", rarity: "incomum" },
  { name: "Braçadeira do Contra-Golpe", weight: 0.4, effect: "Uma vez por combate, ao sofrer um Erro Crítico do atacante, pode realizar um ataque corpo a corpo imediato como Reação gratuita.", rarity: "raro" },
  { name: "Colar das Marés Calmas", weight: 0.2, effect: "+1 Defesa Mágica; o portador não sofre penalidade de Movimento em terrenos aquáticos ou pantanosos.", rarity: "incomum" },
  { name: "Anel do Último Suspiro", weight: 0.1, effect: "Quando o HP do portador chegar a 0 pela primeira vez no dia, ele estabiliza automaticamente com 1 HP em vez de cair inconsciente. Recarrega após um descanso longo.", rarity: "raro" },
  { name: "Luvas do Ladrão Silencioso", weight: 0.2, effect: "+2 em testes de Ladinagem; furtar um item pequeno nunca provoca Ataque de Oportunidade.", rarity: "incomum" },
  { name: "Diadema da Mente Serena", weight: 0.3, effect: "+2 de resistência a efeitos de medo, pânico ou controle mental.", rarity: "incomum" },
  { name: "Fragmento de Estrela Caída", weight: 0.3, effect: "+1 de dano fixo em todas as magias conjuradas, mas o portador sofre 1 ponto de dano não-letal sempre que conjura uma magia de Nível 4 ou 5.", rarity: "raro" },
  { name: "Pena da Fênix Menor", weight: 0.1, effect: "Item consumível: ao ser destruído (ação gratuita), cura instantaneamente 2d8 + nível de HP. Só pode ser usado uma vez antes de se desfazer em cinzas." }
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

/* Categorias de item para o modal "Adicionar item do mundo" */
const WORLD_ITEM_CATALOG = {
  weapon: ALL_WEAPONS.map(w => ({ ...w, category: "weapon" })),
  shield: SHIELDS.map(s => ({ ...s, category: "shield" })),
  armor: ARMORS.map(a => ({ ...a, category: "armor" })),
  accessory: ACCESSORIES.map(a => ({ ...a, category: "accessory" }))
};
