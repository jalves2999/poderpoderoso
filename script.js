'use strict';
// ============================================================
//  FERRO & SANGUE — script.js
// ============================================================

// ===================== DATA =====================
const DATA = {
  classes: {
    guerreiro: {
      label: 'Guerreiro', icon: '⚔️',
      recommended: { FOR: 15, AGI: 12, DEX: 11, INT: 8, SAB: 10 },
      armorAllowed: 'Todas',
      skills: 'guerreiro'
    },
    mago: {
      label: 'Mago', icon: '🔮',
      recommended: { FOR: 8, AGI: 9, DEX: 10, INT: 16, SAB: 12 },
      armorAllowed: 'Nenhuma',
      skills: 'mago'
    },
    arqueiro: {
      label: 'Arqueiro', icon: '🏹',
      recommended: { FOR: 10, AGI: 13, DEX: 16, INT: 8, SAB: 9 },
      armorAllowed: 'Leve e Média',
      skills: 'arqueiro'
    },
    ladino: {
      label: 'Ladino', icon: '🗡️',
      recommended: { FOR: 9, AGI: 14, DEX: 16, INT: 9, SAB: 8 },
      armorAllowed: 'Leve',
      skills: 'ladino'
    },
    clerigo: {
      label: 'Clérigo', icon: '✝',
      recommended: { FOR: 12, AGI: 10, DEX: 9, INT: 8, SAB: 16 },
      armorAllowed: 'Leve e Média',
      skills: 'clerigo'
    }
  },

  backgrounds: {
    'Nobre Decaído':        { FOR:0, AGI:0, DEX:0, INT:1, SAB:1 },
    'Soldado Veterano':     { FOR:2, AGI:0, DEX:0, INT:0, SAB:0 },
    'Eremita das Montanhas':{ FOR:0, AGI:1, DEX:0, INT:0, SAB:1 },
    'Ladrão de Mercado':    { FOR:0, AGI:0, DEX:2, INT:0, SAB:0 },
    'Aprendiz de Mago':     { FOR:0, AGI:0, DEX:0, INT:2, SAB:0 },
    'Devoto da Fé':         { FOR:0, AGI:0, DEX:0, INT:0, SAB:2 },
    'Mercenário':           { FOR:1, AGI:1, DEX:0, INT:0, SAB:0 },
    'Camponês Resiliente':  { FOR:1, AGI:0, DEX:0, INT:0, SAB:1 }
  },

  pericias: [
    { id:'atletismo',   name:'Atletismo',          attr:'FOR' },
    { id:'acrobacia',   name:'Acrobacia',           attr:'AGI' },
    { id:'furtividade', name:'Furtividade',         attr:'DEX' },
    { id:'percepcao',   name:'Percepção',           attr:'SAB' },
    { id:'persuasao',   name:'Persuasão',           attr:'SAB' },
    { id:'intimidacao', name:'Intimidação',         attr:'FOR' },
    { id:'enganacao',   name:'Enganação',           attr:'INT' },
    { id:'arcano',      name:'Conhecimento Arcano', attr:'INT' },
    { id:'medicina',    name:'Medicina',            attr:'SAB' },
    { id:'sobreviv',    name:'Sobrevivência',       attr:'SAB' },
    { id:'furt_comb',   name:'Furtividade de Combate', attr:'DEX' },
    { id:'intim_comb',  name:'Intimidação de Combate', attr:'FOR' }
  ],

  skills: {
    guerreiro: [
      { id:'gp', name:'Golpe Poderoso',       tier:'basic',    cost:'6 ST',       desc:'Dano +FOR inteiro. Alvo testa FOR DIF 15 ou recua 1 hex.' },
      { id:'gua',name:'Guardião',             tier:'basic',    cost:'3 ST/turno', desc:'Protege aliado adjacente, pode fazer reações em nome dele neste turno.' },
      { id:'inv',name:'Investida',            tier:'basic',    cost:'5 ST',       desc:'Move até 3 hexes em linha reta e ataca com +3 no dano.' },
      { id:'cg', name:'Corte Giratório',      tier:'advanced', cost:'10 ST',      desc:'Ataca todos os inimigos adjacentes. Uma rolagem, dano separado para cada.' },
      { id:'pb', name:'Postura de Batalha',   tier:'advanced', cost:'8 ST',       desc:'Por 3 turnos: +2 ataque, –2 defesa. ST regenera +2/turno.' },
      { id:'fg', name:'Fúria Guerreira',      tier:'advanced', cost:'12 ST',      desc:'Próximos 2 ataques automáticos (sem rolar). Fica exposto: –4 Defesa.' },
      { id:'lh', name:'Lâmina do Herói',      tier:'master',   cost:'20 ST',      desc:'Ataque localizado em qualquer parte + dano máximo garantido.' },
      { id:'fi', name:'Fortaleza Inabalável', tier:'master',   cost:'15 ST',      desc:'Por 1 turno: ignora todo dano ≤ 10 e não pode ser derrubado.' }
    ],
    mago: [
      { id:'fa', name:'Foco Arcano',          tier:'basic',    cost:'3 ST',       desc:'Concentra 1 ação; próxima magia custa –2 MP.' },
      { id:'ee', name:'Escudo Etéreo',        tier:'basic',    cost:'5 MP',       desc:'Barreira que absorve até 8 de dano. Dura 1 turno.' },
      { id:'cd', name:'Canal Duplo',          tier:'advanced', cost:'+4 MP',      desc:'Lança 2 magias de tier 1 em 1 ação.' },
      { id:'sa', name:'Sobrecarga Arcana',    tier:'advanced', cost:'10 MP+8 ST', desc:'Próxima magia ignora resistências e tem DIF de defesa +5.' },
      { id:'ma', name:'Metamagia: Alargamento',tier:'advanced',cost:'+3 MP',      desc:'Aumenta área da magia em +1 hex de raio.' },
      { id:'rd', name:'Ruptura Dimensional',  tier:'master',   cost:'25 MP',      desc:'Teletransporta inimigo 1d6 hexes em direção aleatória. INT DIF 18 para controlar.' },
      { id:'ga', name:'Grande Arcano',        tier:'master',   cost:'30 MP+15 ST',desc:'Magia de tier 4 sem gasto de slot. Efeito devastador.' }
    ],
    arqueiro: [
      { id:'tp', name:'Tiro Preciso',         tier:'basic',    cost:'4 ST',       desc:'+4 em ataques localizados à distância. Sem penalidade de range longo.' },
      { id:'dr', name:'Disparo Rápido',       tier:'basic',    cost:'5 ST',       desc:'Atira 2 flechas em 1 ação (rola separado para cada).' },
      { id:'cn', name:'Camuflagem Natural',   tier:'basic',    cost:'3 ST',       desc:'Em terreno coberto, muito difícil de localizar (DIF 18 para inimigos).' },
      { id:'fa2',name:'Flecha de Ancoragem',  tier:'advanced', cost:'8 ST',       desc:'Prende parte do corpo. Alvo perde 1 ação/turno por 2 turnos ou FOR DIF 16.' },
      { id:'cf', name:'Chuva de Flechas',     tier:'advanced', cost:'12 ST',      desc:'Atinge todos em raio 2 hexes. DIF 13 para esquivar.' },
      { id:'tl', name:'Tiro Letal',           tier:'master',   cost:'18 ST',      desc:'Ataque localizado com dano ×2. Se matar: todos os inimigos que viram testam moral.' },
      { id:'ep', name:'Emboscada Perfeita',   tier:'master',   cost:'20 ST',      desc:'Do estado oculto: DEX×2 bônus e dano máximo garantido.' }
    ],
    ladino: [
      { id:'af', name:'Ataque Furtivo',       tier:'basic',    cost:'5 ST',       desc:'Se oculto ou flanqueando: +2d6 dano extra.' },
      { id:'sa2',name:'Sombra Ágil',          tier:'basic',    cost:'4 ST',       desc:'Mover sem gastar ação de movimento (1 vez/turno).' },
      { id:'de', name:'Desengajar',           tier:'basic',    cost:'3 ST',       desc:'Sai do alcance corpo-a-corpo sem provocar reação de oportunidade.' },
      { id:'gr', name:'Golpe nos Rins',       tier:'advanced', cost:'9 ST',       desc:'Ataque pelas costas ao tronco: DIF de defesa +6 e dano +FOR.' },
      { id:'vr', name:'Veneno Rápido',        tier:'advanced', cost:'6 ST',       desc:'Aplica veneno na arma. Próximo acerto: –2 ST/turno por 3 turnos.' },
      { id:'mt', name:'Miragem Tática',       tier:'advanced', cost:'8 ST',       desc:'Finge recuar: inimigo que avançar recebe ataque de oportunidade gratuito.' },
      { id:'dd', name:'Dança da Morte',       tier:'master',   cost:'22 ST',      desc:'Move até 4 hexes atacando 1 inimigo diferente por hex, sem ação extra.' },
      { id:'ex', name:'Execução',             tier:'master',   cost:'20 ST',      desc:'Se alvo com ≤ 25% PV: mata automaticamente. SAB DIF 14 do alvo anula.' }
    ],
    clerigo: [
      { id:'cm', name:'Cura Menor',           tier:'basic',    cost:'5 MP',       desc:'Toque: restaura 1d8 + SAB PV em aliado.' },
      { id:'au', name:'Aura Sagrada',         tier:'basic',    cost:'4 MP/turno', desc:'Aliados adjacentes: +2 em testes de Moral e Medo.' },
      { id:'ss', name:'Smite Sagrado',        tier:'basic',    cost:'6 ST+4 MP',  desc:'Ataque c/c com +2d6 sagrado. Dobrado contra mortos-vivos.' },
      { id:'bb', name:'Bênção de Batalha',    tier:'advanced', cost:'10 MP',      desc:'Até 3 aliados: +3 em todos os ataques por 2 turnos.' },
      { id:'rt', name:'Repelir Trevas',       tier:'advanced', cost:'12 MP',      desc:'Mortos-vivos e demônios em 3 hexes testam SAB DIF 15 ou fogem por 2 turnos.' },
      { id:'cma',name:'Cura Maior',           tier:'advanced', cost:'12 MP',      desc:'Restaura 3d8 + SAB PV e remove 1 condição (veneno, sangramento etc).' },
      { id:'mi', name:'Milagre',             tier:'master',   cost:'30 MP',      desc:'Efeito à escolha do Mestre: retorno de morto, cura total, bênção em todos.' },
      { id:'ms', name:'Martírio Sagrado',     tier:'master',   cost:'25 MP',      desc:'Gasta metade do PV atual: converte em dano sagrado ou cura distribuída.' }
    ]
  },

  spells: [
    // Arcana
    { id:'chama1',  name:'Chama Menor',       type:'arcane', tier:1, mp:3,  desc:'1 alvo, 4 hex. 1d8 fogo. Pode incendiar material seco.' },
    { id:'acido1',  name:'Raio Ácido',        type:'arcane', tier:1, mp:4,  desc:'1d6+INT dano. Corrói armadura: –1 Def por 2 turnos.' },
    { id:'gelo2',   name:'Gelo Explosivo',    type:'arcane', tier:2, mp:8,  desc:'2d6. AGI DIF 14 ou fica lento (–2 Movimento) por 1 turno.' },
    { id:'fogo3',   name:'Bola de Fogo',      type:'arcane', tier:3, mp:14, desc:'Raio 2 hex, 4d6 fogo. AGI DIF 16 para metade do dano.' },
    { id:'raio3',   name:'Raio de Relâmpago', type:'arcane', tier:3, mp:16, desc:'Linha 10 hex, 3d8 elétrico. d10 ≥ 7 → atordoa 1 turno.' },
    { id:'gelo3',   name:'Parede de Gelo',    type:'arcane', tier:3, mp:15, desc:'Barreira de 4 hex. Bloqueia passagem (30 PV para destruir).' },
    { id:'meteoro4',name:'Meteoro',           type:'arcane', tier:4, mp:28, desc:'Raio 3 hex, 7d6 fogo+impacto. Cria cratera (terreno difícil).' },
    { id:'ilusao2', name:'Ilusão Perfeita',   type:'arcane', tier:2, mp:10, desc:'Cópia visual do mago por 3 turnos. INT DIF 15 para notar.' },
    { id:'maocong2',name:'Tentáculo de Sombra',type:'arcane',tier:2, mp:8,  desc:'3 hex: imobiliza alvo 1 turno, –2 DEF.' },
    { id:'conf2',   name:'Névoa de Confusão', type:'arcane', tier:2, mp:10, desc:'Área 3 hex: INT DIF 14 ou ataca aliado aleatório.' },
    // Divine
    { id:'cura1',   name:'Curar Ferida',      type:'divine', tier:1, mp:4,  desc:'Toque: 1d8+SAB PV. Remove sangramentos menores.' },
    { id:'benc1',   name:'Bênção',            type:'divine', tier:1, mp:3,  desc:'1 aliado adjacente: +2 em todos os testes por 2 turnos.' },
    { id:'luz2',    name:'Luz Sagrada',       type:'divine', tier:2, mp:7,  desc:'Raio 3 hex: mortos-vivos 2d6+SAB. Ilumina 10 min.' },
    { id:'esc2',    name:'Escudo da Fé',      type:'divine', tier:2, mp:8,  desc:'Aliado tocado: +4 Defesa e imune a medo por 3 turnos.' },
    { id:'renv3',   name:'Renovar',           type:'divine', tier:3, mp:14, desc:'3d8+SAB PV. Remove qualquer veneno ou maldição.' },
    { id:'pun3',    name:'Punição Divina',    type:'divine', tier:3, mp:16, desc:'Raio sagrado: 4d6 sagrado. Inimigos veem pilar de luz.' },
    { id:'ressg4',  name:'Ressurgir',         type:'divine', tier:4, mp:25, desc:'Aliado com 0 PV retorna com SAB×3 PV. Até 1 min após a queda.' }
  ],

  items: {
    weapons: [
      { id:'adaga',   name:'Adaga',         icon:'🗡️', type:'weapon', damage:'2d4+1d6', weight:0.5, price:5,    rarity:'common',    desc:'Arma pequena e furtiva. +2 dano furtivo para Ladino.',       slot:'weapon', stats:['+2 Furtivo (Ladino)'] },
      { id:'espCurta',name:'Espada Curta',  icon:'⚔️', type:'weapon', damage:'1d4+2d6', weight:1.2, price:15,   rarity:'common',    desc:'Ágil e equilibrada. Pode ser usada em par (–2 ataque).',    slot:'weapon', stats:['Dual Wield'] },
      { id:'espLonga',name:'Espada Longa',  icon:'⚔️', type:'weapon', damage:'1d4+2d6', weight:1.8, price:25,   rarity:'common',    desc:'Versátil. Pode bloquear como escudo (–1 DIF defesa).',      slot:'weapon', stats:['Versátil','Bloquear'] },
      { id:'espadao', name:'Espadão',       icon:'🗡️', type:'weapon', damage:'1d4+3d6', weight:4.0, price:40,   rarity:'common',    desc:'Devastador. +2 dano no Golpe Poderoso. –1 Iniciativa.',    slot:'weapon', stats:['+2 Golpe Poderoso','–1 Ini'] },
      { id:'machado', name:'Machado',       icon:'🪓', type:'weapon', damage:'2d6+1d4', weight:2.5, price:20,   rarity:'common',    desc:'Ignora 1 RD de armadura a cada golpe.',                    slot:'weapon', stats:['Ignora 1 RD'] },
      { id:'lanca',   name:'Lança',         icon:'🏹', type:'weapon', damage:'1d4+1d6', weight:2.0, price:12,   rarity:'common',    desc:'Alcance 2 hex. +3 Defesa vs investida. Pode ser jogada.',  slot:'weapon', stats:['Alcance 2 hex','+3 Def vs Investida'] },
      { id:'alabarda',name:'Alabarda',      icon:'⚔️', type:'weapon', damage:'2d6+1d4', weight:4.5, price:35,   rarity:'common',    desc:'2 mãos. +4 dano vs alvos maiores. Anti-cavalaria.',        slot:'weapon', stats:['2 mãos','Anti-cavalaria'] },
      { id:'arcoCurto',name:'Arco Curto',   icon:'🏹', type:'weapon', damage:'1d4+1d6', weight:1.0, price:18,   rarity:'common',    desc:'Alcance 8 hex. Disparo Rápido sem penalidade.',             slot:'weapon', stats:['Alcance 8 hex','Disparo Rápido'] },
      { id:'arcoLongo',name:'Arco Longo',   icon:'🏹', type:'weapon', damage:'2d6',     weight:2.0, price:30,   rarity:'common',    desc:'Alcance 20 hex. +2 em localizações longas.',               slot:'weapon', stats:['Alcance 20 hex','+2 Localização'] },
      { id:'besta',   name:'Besta Pesada',  icon:'🏹', type:'weapon', damage:'1d4+3d6', weight:5.0, price:50,   rarity:'common',    desc:'Ignora 2 RD. Recarregar = 1 ação completa.',               slot:'weapon', stats:['Ignora 2 RD','Recarregar=1 Ação'] },
      { id:'lamSang', name:'Lâmina Sangrenta',icon:'🗡️',type:'weapon',damage:'1d4+2d6', weight:1.8, price:120,  rarity:'uncommon',  desc:'Cada acerto causa sangramento (2 PV/turno).',               slot:'weapon', stats:['Sangramento por acerto'], magic:true },
      { id:'mtrTrov', name:'Martelo do Trovão',icon:'🔨',type:'weapon',damage:'2d6+2d6',weight:3.5, price:250,  rarity:'rare',      desc:'+2d6 elétrico. Alvo atordoa em 1 turno (d10 ≥ 8).',       slot:'weapon', stats:['+2d6 Elétrico','Atordoa d10≥8'], magic:true },
      { id:'espadJuiz',name:'Espadão do Juízo',icon:'⚔️',type:'weapon',damage:'1d4+3d6',weight:4.0,price:500,  rarity:'very-rare', desc:'FOR dobrado no dano. +1d8 vs aterrorizados.',              slot:'weapon', stats:['FOR×2 dano','+1d8 vs Terror'], magic:true }
    ],
    armor: [
      { id:'couroSimp',name:'Couro Simples', icon:'🧥', type:'armor', rd:1, defBonus:1, agiPen:0, weight:3,  price:8,   rarity:'common',  desc:'Proteção mínima. Sem penalidade de agilidade.',  slot:'armor' },
      { id:'couroBat', name:'Couro Batido',  icon:'🧥', type:'armor', rd:2, defBonus:2, agiPen:0, weight:6,  price:18,  rarity:'common',  desc:'Couro endurecido. Bom custo-benefício.',         slot:'armor' },
      { id:'couroRef', name:'Couro Reforçado',icon:'🧥',type:'armor', rd:3, defBonus:3, agiPen:1, weight:9,  price:35,  rarity:'common',  desc:'–1 AGI enquanto vestido.',                       slot:'armor' },
      { id:'cotaMalha',name:'Cota de Malha', icon:'🪖', type:'armor', rd:4, defBonus:4, agiPen:1, weight:14, price:60,  rarity:'common',  desc:'–1 AGI. Boa proteção para aventureiros.',        slot:'armor' },
      { id:'brigand',  name:'Brigandina',    icon:'🪖', type:'armor', rd:5, defBonus:5, agiPen:2, weight:18, price:90,  rarity:'common',  desc:'–2 AGI. Placas de metal sobre couro.',           slot:'armor' },
      { id:'meiaPlaca',name:'Meia Armadura', icon:'🛡️', type:'armor', rd:6, defBonus:6, agiPen:3, weight:22, price:150, rarity:'common',  desc:'–3 AGI. Proteção de cavaleiro.',                 slot:'armor' },
      { id:'placa',    name:'Armadura de Placa',icon:'🛡️',type:'armor',rd:7,defBonus:7, agiPen:4, weight:30, price:250, rarity:'uncommon',desc:'–4 AGI. Alta proteção.',                         slot:'armor' },
      { id:'placaComp',name:'Placa Completa+Elmo',icon:'🛡️',type:'armor',rd:9,defBonus:8,agiPen:5,weight:38,price:500, rarity:'rare',    desc:'–5 AGI. Máxima proteção física.',                slot:'armor' },
      { id:'malhSpec', name:'Malha do Espectro',icon:'🧥',type:'armor', rd:4, defBonus:4, agiPen:0, weight:14, price:400,rarity:'rare',    desc:'Sem penalidade AGI. +1 em esquivas.',            slot:'armor', magic:true },
      { id:'plImort',  name:'Placa do Imortal',icon:'🛡️',type:'armor', rd:7, defBonus:7, agiPen:4, weight:30, price:800,rarity:'very-rare',desc:'Quando PV ≤ 25%: RD +2 automaticamente.',        slot:'armor', magic:true }
    ],
    magic: [
      { id:'amulRes',  name:'Amuleto da Resiliência',  icon:'📿', type:'accessory', slot:'neck',  price:80,  rarity:'uncommon',  desc:'+4 PV máximos. –1 à DIF de Ferimento Grave.',  stats:['+4 PV máx','–1 DIF Ferimento'] },
      { id:'anelAgi',  name:'Anel de Agilidade',       icon:'💍', type:'accessory', slot:'ring1', price:100, rarity:'uncommon',  desc:'+1 AGI permanente enquanto equipado.',          stats:['+1 AGI'], bonuses:{ AGI:1 } },
      { id:'cintoTita',name:'Cinto do Titã',           icon:'🔗', type:'accessory', slot:'belt',  price:200, rarity:'rare',      desc:'+3 FOR. Ignora –1 de penalidade de armadura pesada.', stats:['+3 FOR','Ignora –1 AGI'], bonuses:{ FOR:3 } },
      { id:'braArcano',name:'Bracelete do Arcano',     icon:'🔮', type:'accessory', slot:'ring1', price:150, rarity:'uncommon',  desc:'+8 MP máximos. Tier 1 custa –1 MP.',           stats:['+8 MP máx','Tier 1 –1 MP'] },
      { id:'anelSombr',name:'Anel de Sombra',          icon:'💍', type:'accessory', slot:'ring2', price:180, rarity:'rare',      desc:'Furtividade +3. Custo de Ataque Furtivo –2 ST.', stats:['Furtividade +3','Furtivo –2 ST'] },
      { id:'gorjalHer',name:'Gorjal do Herói',         icon:'📿', type:'accessory', slot:'neck',  price:220, rarity:'rare',      desc:'Imune sangramento cervical. +2 SAB.',           stats:['Imune Sangr. Cervical','+2 SAB'], bonuses:{ SAB:2 } },
      { id:'cintoArq', name:'Cinto do Arqueiro Veloz', icon:'🔗', type:'accessory', slot:'belt',  price:200, rarity:'rare',      desc:'Disparo Rápido –2 ST. +2 DEX permanente.',     stats:['Disparo Rápido –2 ST','+2 DEX'], bonuses:{ DEX:2 } },
      { id:'capaS',    name:'Capa de Sombra',          icon:'🧥', type:'accessory', slot:'cloak', price:350, rarity:'rare',      desc:'+3 Furtividade. Desengajar sem custo de ST.',  stats:['Furtividade +3','Desengajar grátis'] },
      // Very Rare & Legendary — strong attr bonuses
      { id:'coroDrag',  name:'Coroa do Dragão Ancião', icon:'👑', type:'accessory', slot:'neck',  price:1200, rarity:'very-rare', desc:'+3 INT, +2 SAB, +10 MP máx. Resistência a fogo.', stats:['+3 INT','+2 SAB','+10 MP','Resist. Fogo'], bonuses:{ INT:3, SAB:2 } },
      { id:'luvasGigan',name:'Luvas do Gigante',        icon:'🥊', type:'accessory', slot:'ring1', price:800,  rarity:'very-rare', desc:'+4 FOR. Ataque corpo-a-corpo: +1d6 dano extra.',   stats:['+4 FOR','+1d6 dano c/c'], bonuses:{ FOR:4 } },
      { id:'anelDestino',name:'Anel do Destino',        icon:'💍', type:'accessory', slot:'ring2', price:1500, rarity:'legendary', desc:'+2 em TODOS os atributos. 1×/dia: ignore uma morte (retorne com 1 PV).', stats:['+2 a todos os atributos','1×/dia: ignore morte'], bonuses:{ FOR:2, AGI:2, DEX:2, INT:2, SAB:2 } },
      { id:'capaSombEt',name:'Manto das Tumbas',        icon:'🧥', type:'accessory', slot:'cloak', price:900,  rarity:'very-rare', desc:'RD 3 em TODOS locais. Imune a sangramento e veneno. +1 DEX.', stats:['RD 3 universal','Imune sangr./veneno','+1 DEX'], bonuses:{ DEX:1 } },
      { id:'elmoLend',  name:'Elmo do Herói Lendário',  icon:'🪖', type:'accessory', slot:'neck',  price:1000, rarity:'legendary', desc:'+3 SAB, +2 AGI. Imune a Atordoamento e Medo. +20 PV máx.', stats:['+3 SAB','+2 AGI','Imune Atordoam./Medo','+20 PV'], bonuses:{ SAB:3, AGI:2 } }
    ],
    consumable: [
      { id:'pocaoVida1',name:'Poção de Cura Menor',   icon:'🧪', type:'consumable', weight:0.3, price:15,  rarity:'common',   desc:'Restaura 2d8+5 PV ao beber.' },
      { id:'pocaoVida2',name:'Poção de Cura Maior',   icon:'🧪', type:'consumable', weight:0.3, price:40,  rarity:'uncommon', desc:'Restaura 4d8+10 PV ao beber.' },
      { id:'pocaoST',   name:'Poção de Vigor',        icon:'🧪', type:'consumable', weight:0.3, price:25,  rarity:'common',   desc:'Restaura 20 ST imediatamente.' },
      { id:'pocaoMP',   name:'Poção de Mana',         icon:'🔮', type:'consumable', weight:0.3, price:30,  rarity:'uncommon', desc:'Restaura 25 MP imediatamente.' },
      { id:'antivenom', name:'Antídoto',              icon:'💊', type:'consumable', weight:0.2, price:20,  rarity:'common',   desc:'Remove veneno e condição envenenado.' },
      { id:'bandagem',  name:'Bandagem',              icon:'🩹', type:'consumable', weight:0.1, price:3,   rarity:'common',   desc:'Estanca sangramentos. Requer 1 ação.' },
      { id:'tocha',     name:'Tocha (x5)',            icon:'🔥', type:'consumable', weight:1.0, price:2,   rarity:'common',   desc:'Ilumina 5 hexes por 1 hora cada.' },
      { id:'corda',     name:'Corda (15m)',           icon:'🪢', type:'consumable', weight:1.5, price:5,   rarity:'common',   desc:'Resistência 300 kg. Útil em escaladas.' },
      { id:'racao',     name:'Ração de Viagem (3d)', icon:'🍖', type:'consumable', weight:1.0, price:4,   rarity:'common',   desc:'Alimento para 3 dias de viagem.' },
      { id:'oleo',      name:'Óleo de Fogo',          icon:'🔥', type:'consumable', weight:0.5, price:10,  rarity:'common',   desc:'Aplicar na arma: +1d4 fogo por 3 acertos.' },
      { id:'pocaoFor',  name:'Poção de Força',        icon:'🧪', type:'consumable', weight:0.3, price:60,  rarity:'rare',     desc:'+3 FOR por 1 hora. Não cumulativo.' },
      { id:'pocaRegen', name:'Poção de Regeneração',  icon:'🧪', type:'consumable', weight:0.3, price:80,  rarity:'rare',     desc:'Recupera 4 PV/turno por 3 turnos.' },
      { id:'escudo',    name:'Escudo Redondo',        icon:'🛡️', type:'consumable', weight:3.0, price:30,  rarity:'common',   desc:'+3 Defesa. 2 ST para bloquear ativamente.' },
      { id:'pocaoInv',  name:'Poção de Invisibilidade',icon:'🫧',type:'consumable', weight:0.3, price:150, rarity:'rare',     desc:'Invisibilidade por 3 turnos (quebra ao atacar).' }
    ]
  },

  encounters: {
    encounter: [
      { range:[1,1],   label:'FADO NEGRO',     color:'#8B0000', body:'Encontro Nível 4–5. Vantagem posicional do inimigo. +1 Dado de Terreno (pior resultado).' },
      { range:[2,2],   label:'Encontro Difícil',color:'#C0392B', body:'Criatura Nível 3–4. Inimigos já perceberam o grupo — sem surpresa possível.' },
      { range:[3,4],   label:'Encontro Moderado-Difícil',color:'#E65100',body:'Criatura Nível 3. Inimigos em posição defensiva ou caçando ativamente.' },
      { range:[5,7],   label:'Encontro Moderado',color:'#F57F17',body:'Criatura Nível 2–3. Encontro neutro no início — pode virar combate.' },
      { range:[8,10],  label:'Encontro Leve',  color:'#7D6608', body:'Criatura Nível 1–2. d6: 1–3 foge ao ver o grupo, 4–6 investiga.' },
      { range:[11,13], label:'Sem Combate',    color:'#5A5A5A', body:'Rastros, ossos, fogueira apagada. Apenas atmosfera.' },
      { range:[14,16], label:'Caminho Limpo',  color:'#2E7D32', body:'Sem encontro. Movimento livre.' },
      { range:[17,18], label:'Descoberta Passiva',color:'#1565C0',body:'Sem inimigos. Algo de interesse encontrado.' },
      { range:[19,19], label:'GOLPE DE SORTE', color:'#2E7D32', body:'Encontro favorável: mercador, guarda aliado ou NPC prestativo.' },
      { range:[20,20], label:'FORTUNA LENDÁRIA',color:'#C9A84C',body:'Sem encontro + Descoberta Especial: tesouro, atalho ou aliado improvável.' }
    ],
    terrain: [
      { range:[1,1],   label:'CALAMIDADE',     color:'#8B0000', body:'d4: 1=Colapso, 2=Gases Tóxicos, 3=Inundação, 4=Avalanche.' },
      { range:[2,2],   label:'Armadilha Complexa',color:'#C0392B',body:'Armadilha avançada E terreno difícil em todos os hexes.' },
      { range:[3,4],   label:'Armadilha + Obstáculo',color:'#E65100',body:'1 armadilha + obstáculo físico (muro 3m, abismo 2 hex, rio forte).' },
      { range:[5,6],   label:'Terreno Muito Difícil',color:'#E65100',body:'Todos os hexes custam 2 de Movimento (pântano, escombros, floresta).' },
      { range:[7,8],   label:'Armadilha Simples',color:'#F57F17',body:'1 armadilha oculta. Percepção DIF 14 para detectar.' },
      { range:[9,10],  label:'Terreno Parcialmente Difícil',color:'#7D6608',body:'Metade dos hexes com custo duplo de Movimento.' },
      { range:[11,13], label:'Cobertura Favorável',color:'#5A5A5A',body:'Pontos de cobertura disponíveis para todos.' },
      { range:[14,15], label:'Terreno Normal',  color:'#2E7D32', body:'Sem obstáculos. Movimento padrão.' },
      { range:[16,17], label:'Terreno Favorável',color:'#2E7D32',body:'Elevação estratégica ou posição que dá +2 Defesa.' },
      { range:[18,19], label:'Terreno Muito Favorável',color:'#1B5E20',body:'Cobertura total + elevação para arqueiro (+3 ataques à distância).' },
      { range:[20,20], label:'BÊNÇÃO DO CAMINHO',color:'#C9A84C',body:'Atalho descoberto! –50% tempo de viagem + ponto de descanso seguro (recupera 25% ST/PV).' }
    ],
    biomeCreatures: {
      floresta:        ['Javali Gigante','Goblins Batedores (3d4)','Lobisomem das Colinas','Esqueleto Guerreiro (1d4+1)','Maga das Sombras','Troll das Cavernas','Vampiro Nobre + Servos','Ogro Taticista + Goblins'],
      floresta_sombria:['Lobisomem das Colinas','Mortos-vivos Errantes','Maga das Sombras','Vampiro Nobre','Fantasma Guerreiro','Troll das Cavernas','Vampiro Ancião','Lich Subordinado'],
      caverna:         ['Ratos Gigantes (2d6)','Esqueleto Guerreiro (2d4)','Morcego Gigante (1d6)','Golem de Ferro','Troll das Cavernas','Maga das Sombras + Esqueletos','Vampiro Nobre','Lich Demoníaco'],
      masmorra:        ['Esqueleto Guerreiro (2d6)','Zumbis Lentos (3d4)','Armadilha Viva','Golem de Ferro','Vampiro Nobre','Ogro Taticista','Dragão Jovem','Lich Demoníaco Vel\'Zaroth'],
      planicie:        ['Goblins (2d6) + Líder','Lobo das Estepes (1d4+2)','Cavaleiro Renegado','Esqueletos + Arqueiro','Ogro Solitário','Bandidos Organizados (2d4+Líder)','Ogro Taticista','Dragão Cinza em Patrulha'],
      pantano:         ['Víboras Pântano (1d4)','Ratos Gigantes (3d4)','Lobisomem das Colinas','Mortos-vivos Pântano (2d4)','Bruxa do Brejo','Troll Aquático','Espírito do Pântano','Serpente Gigante Anciã'],
      montanha:        ['Águia Gigante','Bandidos de Montanha','Ogro das Pedras','Gigante de Gelo','Dragão Jovem','Grifo','Ogro Taticista + Servos','Dragão Ancião Kyrathos'],
      ruinas:          ['Goblins Exploradores','Esqueleto Guerreiro (2d4)','Cult Fanatics','Golem de Pedra','Maga das Sombras','Vampiro Nobre','Lich Subordinado','Vel\'Zaroth (câmara secreta)'],
      cidade:          ['Batedores de Carteira','Guarda Corrupto','Informante Perigoso','Gangue Local','Assassino de Guilda','Nobre Conspirando','Espião Estrangeiro','Grande Mestre da Guilda do Crime']
    }
  },

  npcNames: ['Aldric','Branwen','Corvus','Dorin','Elara','Faolin','Greth','Hilda','Idris','Jara','Kael','Lyra','Mordain','Nira','Oskar','Pyra','Quinn','Rova','Seren','Thane','Ursa','Vex','Wren','Xyla','Yorn','Zara'],
  npcTitles: { humanoid:['o Mercenário','a Caçadora','o Renegado','a Capitã','o Desertor'], beast:['Selvagem','das Trevas','das Colinas','do Norte','Sanguinário'], undead:['Maldito','das Sombras','da Tumba','Eterno','sem Descanso'], giant:['das Pedras','do Norte','Taticista','Furioso','Ancião'], mage:['das Chamas','das Sombras','do Vazio','Arcano','Corrompido'], dragon:['Jovem','Ancião','das Cinzas','do Gelo','do Trovão'] },
  npcAbilities: {
    humanoid: ['Golpe Traiçoeiro','Esquiva Rápida','Grito de Batalha','Corte em Arco'],
    beast:    ['Mordida Feroz','Carga Brutal','Rugido Aterrorizante','Garras Dilacerantes'],
    undead:   ['Toque Necrótico','Reconstituição','Aura de Medo','Drenar Vida'],
    giant:    ['Pancada Esmagadora','Arremesso de Pedra','Pele de Pedra','Grito de Comando'],
    mage:     ['Raio de Energia','Escudo Arcano','Teletransporte','Explosão de Área'],
    dragon:   ['Bafo Devastador','Escamas Milenares','Voo','Rugido Lendário']
  }
};

// ===================== APP STATE =====================
let State = {
  char: null,
  diceHistory: [],
  npcs: [],
  quests: [],
  lore: { backstory:'', traits:'', ideals:'', bonds:'', flaws:'', goals:'', notes:'', relations:[], sessions:[] },
  currentPage: 'dashboard'
};

// ===================== UTILITY =====================
const $ = id => document.getElementById(id);
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const rollDie = sides => rand(1, sides);
const mod = val => Math.floor((val - 10) / 2);
const modStr = val => { const m = mod(val); return m >= 0 ? `+${m}` : `${m}`; };
const clamp = (v, mn, mx) => Math.max(mn, Math.min(mx, v));
const calcDerived = (attrs) => ({
  PV:  attrs.FOR * 4 + attrs.SAB * 2,
  ST:  attrs.AGI * 3 + attrs.FOR,
  MP:  attrs.INT * 4 + attrs.SAB,
  DEF: 10 + Math.floor(attrs.AGI / 2),
  MOV: 3 + Math.floor(attrs.AGI / 4),
  INI: attrs.AGI + Math.floor(attrs.DEX / 2),
  CARGA: attrs.FOR * 3
});

// ===================== LOCALSTORAGE =====================
const SAVE_KEY = 'ferro_sangue_v2';
function saveState() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(State));
}
function loadState() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (raw) {
    try {
      const saved = JSON.parse(raw);
      State = { ...State, ...saved };
    } catch(e) { console.warn('Erro ao carregar estado:', e); }
  }
}

// ===================== TOAST =====================
function toast(msg, type = 'info', duration = 3000) {
  const t = $('toast');
  t.textContent = msg;
  t.className = `toast show ${type}`;
  setTimeout(() => t.className = 'toast', duration);
}

// ===================== APP OBJECT =====================
const App = window.App || {};

// ===================== MODAL =====================
function openModal(title, bodyHTML, footerHTML = '') {
  $('modalTitle').textContent = title;
  $('modalBody').innerHTML = bodyHTML;
  $('modalFooter').innerHTML = footerHTML;
  $('modalOverlay').classList.add('open');
}
function closeModal(e) {
  if (e && e.target && e.target !== $('modalOverlay')) return;
  $('modalOverlay').classList.remove('open');
}
App.closeModal = closeModal;

// ===================== NAVIGATION =====================

App.navigate = function(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const el = $(`page-${page}`);
  if (el) el.classList.add('active');
  const nav = document.querySelector(`[data-page="${page}"]`);
  if (nav) nav.classList.add('active');
  State.currentPage = page;
  renderPage(page);
  // Close sidebar on mobile
  if (window.innerWidth <= 768) $('sidebar').classList.remove('open');
};

App.toggleSidebar = function() {
  $('sidebar').classList.toggle('open');
};

App.saveAll = function() {
  saveState();
  toast('⚔ Pergaminhos salvos com sucesso!', 'success');
};

// ===================== PAGE RENDERER =====================
function renderPage(page) {
  switch(page) {
    case 'dashboard': renderDashboard(); break;
    case 'character': renderCharacterPage(); break;
    case 'skills':    renderSkillsPage(); break;
    case 'inventory': renderInventory(); break;
    case 'spells':    renderSpells(); break;
    case 'encounters':renderEncountersPage(); break;
    case 'quests':    renderQuests(); break;
    case 'lore':      renderLore(); break;
    case 'dice':      break;
  }
}

// ===================== DASHBOARD =====================
function renderDashboard() {
  if (!State.char) {
    $('dashboardNoChar').style.display = '';
    $('dashboardChar').style.display = 'none';
    return;
  }
  const c = State.char;
  $('dashboardNoChar').style.display = 'none';
  $('dashboardChar').style.display = '';

  const letter = c.name.charAt(0).toUpperCase();
  $('dashAvatar').textContent = letter;
  $('sidebarAvatar').textContent = letter;
  $('dashName').textContent = c.name;
  $('dashClass').textContent = `${DATA.classes[c.cls]?.icon || ''} ${DATA.classes[c.cls]?.label || c.cls}`;
  $('dashBackground').textContent = `${c.background} · ${c.alignment}`;
  $('sidebarName').textContent = c.name;
  $('sidebarClass').textContent = DATA.classes[c.cls]?.label || c.cls;
  $('dashboardNoChar').style.display = 'none';

  // Stats
  $('dashPVval').textContent = `${c.currentPV}/${c.maxPV}`;
  $('dashSTval').textContent = `${c.currentST}/${c.maxST}`;
  $('dashMPval').textContent = `${c.currentMP}/${c.maxMP}`;

  // Quick attrs
  ['FOR','AGI','DEX','INT','SAB'].forEach(a => {
    const el = $(`q${a}`);
    if (el) {
      el.querySelector('.qattr-val').textContent = c.attrs[a];
      el.onclick = () => App.showAttrUpgradeModal(a);
    }
  });

  // XP
  renderXP();

  // Conditions
  renderConditions();
}

function renderXP() {
  if (!State.char) return;
  const xp = State.char.xp || 0;
  $('dashXP').textContent = `${xp} XP`;
  const milestones = [50, 100, 150, 200, 300, 400, 600, 800, 1000];
  const next = milestones.find(m => m > xp) || 1000;
  const prev = milestones[milestones.indexOf(next) - 1] || 0;
  const pct = Math.min(100, ((xp - prev) / (next - prev)) * 100);
  $('dashXPbar').style.width = pct + '%';
  $('dashXPmilestone').textContent = xp >= 1000 ? 'Herói Lendário — domínio máximo' : `Próximo marco em ${next} XP`;
}

function renderConditions() {
  if (!State.char) return;
  const row = $('conditionsRow');
  const conds = State.char.conditions || [];
  row.innerHTML = conds.length
    ? conds.map(c => `<span class="condition-tag cond-${c.type}" title="Clique para remover" onclick="App.removeCondition('${c.id}')">${c.label} ✕</span>`).join('')
    : '<span style="font-size:0.78rem;color:var(--text-m);font-style:italic;">Nenhuma condição ativa</span>';
}

// ===================== CHARACTER PAGE =====================
function renderCharacterPage() {
  if (State.char) {
    renderExistingChar();
    return;
  }
  // Build pericias grid
  buildPericiasGrid();
  updateAttrDisplay();
}

function renderExistingChar() {
  const c = State.char;
  // Calculate equipped bonuses
  const equipped = c.equipped || {};
  let bonusAttr = { FOR:0, AGI:0, DEX:0, INT:0, SAB:0 };
  let armorRD = 0, armorDef = 0, armorAgiPen = 0;
  Object.values(equipped).forEach(id => {
    const item = findItemById(id);
    if (!item) return;
    if (item.bonuses) Object.entries(item.bonuses).forEach(([k,v]) => { if (bonusAttr[k] !== undefined) bonusAttr[k] += v; });
    if (item.rd) armorRD = Math.max(armorRD, item.rd);
    if (item.defBonus) armorDef = Math.max(armorDef, item.defBonus);
    if (item.agiPen) armorAgiPen = Math.max(armorAgiPen, item.agiPen);
  });
  const effAttrs = {};
  ['FOR','AGI','DEX','INT','SAB'].forEach(a => { effAttrs[a] = c.attrs[a] + (bonusAttr[a]||0) - (a==='AGI'?armorAgiPen:0); });
  const totalDEF = 10 + Math.floor(effAttrs.AGI/2) + armorDef;
  const atkBonus = effAttrs.DEX; // d10+DEX for attack
  const defBonus = effAttrs.AGI; // d10+AGI for defense
  const initiative = effAttrs.AGI + Math.floor(effAttrs.DEX/2);
  const maxPericias = 3 + Math.floor(c.attrs.INT/4) + Math.floor(c.attrs.SAB/4);

  const page = $('page-character');
  page.innerHTML = `
    <div class="page-header">
      <h2 class="page-title">Ficha do Herói</h2>
      <p class="page-sub">${c.name} · ${DATA.classes[c.cls]?.icon||''} ${DATA.classes[c.cls]?.label || c.cls}</p>
    </div>

    <!-- COMBAT STATS -->
    <div class="form-card">
      <div class="form-card-title">⚔ Chances de Combate</div>
      <div class="derived-grid">
        <div class="derived-item" title="Rolagem base de ataque: d10 + DEX. Quanto maior, mais fácil acertar.">
          <div class="derived-val" style="color:var(--blood-b)">d10+${atkBonus}</div>
          <div class="derived-name">Ataque Base</div><div class="derived-formula">d10 + DEX</div>
        </div>
        <div class="derived-item" title="Defesa base: quanto o inimigo precisa tirar para acertar você.">
          <div class="derived-val" style="color:var(--gold-b)">${totalDEF}</div>
          <div class="derived-name">Defesa Total</div><div class="derived-formula">10 + AGI÷2 + armadura</div>
        </div>
        <div class="derived-item" title="Rolagem de defesa ativa (aparar/esquivar): d10 + AGI.">
          <div class="derived-val" style="color:#7B8ED8">d10+${defBonus}</div>
          <div class="derived-name">Defesa Ativa</div><div class="derived-formula">d10 + AGI</div>
        </div>
        <div class="derived-item" title="Iniciativa: rola d10 e soma. Maior age primeiro.">
          <div class="derived-val">+${initiative}</div>
          <div class="derived-name">Iniciativa</div><div class="derived-formula">AGI + DEX÷2</div>
        </div>
        <div class="derived-item" title="Redução de Dano da armadura equipada.">
          <div class="derived-val" style="color:#4CAF50">${armorRD}</div>
          <div class="derived-name">RD Armadura</div><div class="derived-formula">da armadura equipada</div>
        </div>
        <div class="derived-item" title="Carga máxima em kg. Acima disso: –2 Movimento e –1 em testes físicos.">
          <div class="derived-val">${c.attrs.FOR * 3}</div>
          <div class="derived-name">Carga Máx.</div><div class="derived-formula">FOR × 3 kg</div>
        </div>
      </div>
      ${Object.values(bonusAttr).some(v=>v!==0) || armorAgiPen > 0 ? `
        <div style="margin-top:0.75rem;padding:0.5rem 0.75rem;background:rgba(201,168,76,0.06);border:1px solid rgba(201,168,76,0.2);border-radius:4px;font-size:0.75rem;color:var(--text-m);">
          ✨ Bônus de itens equipados: ${Object.entries(bonusAttr).filter(([,v])=>v!==0).map(([k,v])=>`${k} ${v>0?'+':''}${v}`).join(', ')}${armorAgiPen>0?` | –${armorAgiPen} AGI (armadura)`:''}
        </div>` : ''}
    </div>

    <!-- ATTR UPGRADE -->
    <div class="attr-upgrade-section">
      <div class="form-card-title" style="margin-bottom:1rem;">⚔ Atributos — Custo: 100 XP cada +1 (máx 20) · XP disponível: <span style="color:var(--gold-b)">${c.xp||0}</span></div>
      <div class="attr-upgrade-grid">
        ${['FOR','AGI','DEX','INT','SAB'].map(a => {
          const eff = effAttrs[a];
          const bonus = bonusAttr[a]||0;
          return `<div class="attr-upgrade-card tooltip-wrap" data-tooltip="${ATTR_TIPS[a]||''}">
            <span class="attr-upgrade-name">${a}</span>
            <span class="attr-upgrade-val">${c.attrs[a]}${bonus!==0?`<sup style="font-size:0.6rem;color:var(--gold)">${bonus>0?'+':''}${bonus}</sup>`:''}</span>
            <span class="attr-upgrade-mod">${modStr(eff)} efetivo</span>
            <button class="attr-upgrade-btn" onclick="App.upgradeAttr('${a}')" ${c.attrs[a] >= 20 || (c.xp||0) < 100 ? 'disabled style="opacity:0.4"' : ''}>
              +1 (100 XP)
            </button>
            <span class="attr-upgrade-cost">${c.attrs[a] >= 20 ? 'Máximo!' : (c.xp||0) < 100 ? `Faltam ${100-(c.xp||0)} XP` : '✓ Disponível'}</span>
          </div>`;
        }).join('')}
      </div>
    </div>

    <div class="form-card">
      <div class="form-card-title">📊 Derivados Atuais</div>
      <div class="derived-grid">
        ${Object.entries(calcDerived(effAttrs)).map(([k,v]) => `<div class="derived-item"><div class="derived-val">${v}</div><div class="derived-name">${k}</div></div>`).join('')}
      </div>
    </div>

    <div class="form-card">
      <div class="form-card-title">📜 Informações</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;font-size:0.85rem;color:var(--text-s);">
        <div>Origem: <strong style="color:var(--parch)">${c.background}</strong></div>
        <div>Alinhamento: <strong style="color:var(--parch)">${c.alignment}</strong></div>
        <div>Idade: <strong style="color:var(--parch)">${c.age}</strong></div>
        <div>Ouro: <strong style="color:var(--gold-b)">🪙 ${c.gold || 0}</strong></div>
        <div>Armadura Permitida: <strong style="color:var(--parch)">${DATA.classes[c.cls]?.armorAllowed||'—'}</strong></div>
        <div>XP Total: <strong style="color:var(--gold-b)">⭐ ${c.xp||0}</strong></div>
      </div>
    </div>

    <div class="form-card">
      <div class="form-card-title">📜 Perícias <span style="font-size:0.72rem;font-weight:400;color:var(--text-m)">(${(c.pericias||[]).length}/${maxPericias} · 3 base + INT÷4 + SAB÷4)</span></div>
      <div style="display:flex;flex-wrap:wrap;gap:0.5rem;margin-bottom:0.75rem;">
        ${(c.pericias||[]).map(pid => {
          const p = DATA.pericias.find(x=>x.id===pid);
          return p ? `<span class="badge badge-advanced" style="font-size:0.7rem;padding:0.25rem 0.7rem;">${p.name} <span style="opacity:0.6">(${p.attr})</span></span>` : '';
        }).join('')}
        ${(c.pericias||[]).length === 0 ? '<span style="color:var(--text-m);font-size:0.8rem;font-style:italic;">Nenhuma perícia.</span>' : ''}
      </div>
      ${(c.pericias||[]).length < maxPericias ? `<button class="btn-sm" onclick="App.openAddPericia()">+ Adicionar Perícia</button>` : ''}
    </div>

    <div class="form-card">
      <div class="form-card-title">💰 Moeda</div>
      <div style="display:flex;align-items:center;gap:1rem;flex-wrap:wrap;">
        <button class="btn-sm" onclick="App.adjustGold(-1)">–1</button>
        <button class="btn-sm" onclick="App.adjustGold(-5)">–5</button>
        <span style="font-family:'Cinzel',serif;font-size:1.3rem;color:var(--gold-b);">🪙 ${c.gold||0}</span>
        <button class="btn-sm" onclick="App.adjustGold(1)">+1</button>
        <button class="btn-sm" onclick="App.adjustGold(5)">+5</button>
        <button class="btn-sm" onclick="App.adjustGold(10)">+10</button>
        <button class="btn-sm" onclick="App.openSetGold()">Definir</button>
      </div>
    </div>

    <div class="form-actions" style="padding-top:1rem;">
      <button class="btn-secondary" onclick="App.newChar()">🔄 Criar Novo Personagem</button>
    </div>`;
}

App.upgradeAttr = function(attr) {
  const c = State.char;
  if (!c || (c.xp||0) < 100 || c.attrs[attr] >= 20) return;
  c.xp -= 100;
  c.attrs[attr]++;
  // Recalc derived
  const d = calcDerived(c.attrs);
  c.maxPV = d.PV; c.maxST = d.ST; c.maxMP = d.MP;
  c.currentPV = Math.min(c.currentPV, c.maxPV);
  c.currentST = Math.min(c.currentST, c.maxST);
  c.currentMP = Math.min(c.currentMP, c.maxMP);
  saveState();
  toast(`✨ ${attr} aumentado para ${c.attrs[attr]}! (–100 XP)`, 'success');
  renderExistingChar();
  renderDashboard();
};

App.adjustGold = function(amt) {
  if (!State.char) return;
  State.char.gold = Math.max(0, (State.char.gold||0) + amt);
  saveState();
  renderExistingChar();
  toast(amt > 0 ? `+${amt} ouro!` : `${amt} ouro.`, 'info');
};

App.newChar = function() {
  if (State.char && !confirm('Criar novo personagem apagará o atual. Continuar?')) return;
  State.char = null;
  saveState();
  App.navigate('character');
  renderDashboard();
};

// ===================== ATTR BUILDER =====================
let _pointsLeft = 27;  // Standard 27-point buy (attrs start at 8, cost 1pt each up to 13, 2pts above 13)
let _attrs = { FOR:8, AGI:8, DEX:8, INT:8, SAB:8 };

App.adjAttr = function(attr, delta) {
  const cur = _attrs[attr];
  const newVal = cur + delta;
  if (newVal < 8 || newVal > 15) return; // 8 min (no lowering below 8), 15 max at creation
  // Point cost: each step 8→13 costs 1pt, 13→14 costs 2pts, 14→15 costs 2pts
  const ptCost = (v) => v >= 14 ? 2 : 1;
  const cost = delta > 0 ? ptCost(newVal) : -ptCost(cur);
  if (delta > 0 && _pointsLeft < ptCost(newVal)) { toast(`Sem pontos suficientes! (custa ${ptCost(newVal)}pt)`,'error'); return; }
  _attrs[attr] = newVal;
  _pointsLeft -= cost;
  updateAttrDisplay();
};

function updateAttrDisplay() {
  const ptEl = $('pointsLeft');
  if (ptEl) {
    ptEl.textContent = _pointsLeft;
    ptEl.parentElement.style.color = _pointsLeft < 0 ? 'var(--blood-b)' : '';
  }
  ['FOR','AGI','DEX','INT','SAB'].forEach(a => {
    const vEl = $(`val${a}`); const mEl = $(`mod${a}`);
    if (vEl) vEl.textContent = _attrs[a];
    if (mEl) mEl.textContent = modStr(_attrs[a]);
    // Color high attrs
    if (vEl) vEl.style.color = _attrs[a] >= 14 ? 'var(--gold-b)' : _attrs[a] <= 8 ? 'var(--text-m)' : 'var(--parch)';
  });
  // Update pericias max display
  const maxP = 3 + Math.floor(_attrs.INT / 4) + Math.floor(_attrs.SAB / 4);
  const pLabel = $('periciasMaxLabel');
  if (pLabel) pLabel.textContent = `Máximo: ${maxP} perícias`;
  // Derived preview
  const d = calcDerived(_attrs);
  $('dPV') && ($('dPV').textContent = d.PV);
  $('dST') && ($('dST').textContent = d.ST);
  $('dMP') && ($('dMP').textContent = d.MP);
  $('dDEF') && ($('dDEF').textContent = d.DEF);
  $('dMOV') && ($('dMOV').textContent = d.MOV + ' hex');
  $('dINI') && ($('dINI').textContent = '+' + d.INI);
  $('dCARGA') && ($('dCARGA').textContent = d.CARGA + ' kg');
}

App.onClassChange = function() {
  const cls = $('charClass').value;
  const preview = $('classPreview');
  const skillsCard = $('skillsSelCard');
  if (!cls) { preview.style.display='none'; skillsCard.style.display='none'; return; }
  const info = DATA.classes[cls];
  $('previewClassName').textContent = info.label;
  const attrs = info.recommended;
  $('previewAttrs').innerHTML = Object.entries(attrs).map(([k,v]) => `<span class="preview-attr-badge">${k}: ${v}</span>`).join('');
  preview.style.display = '';
  // Show skills
  skillsCard.style.display = '';
  buildInitSkillsGrid(cls);
};

function buildInitSkillsGrid(cls) {
  const grid = $('initSkillsGrid');
  const skills = DATA.skills[cls] || [];
  grid.innerHTML = skills.filter(s => s.tier === 'basic').map(s => `
    <div class="skill-card tier-basic" id="initsk-${s.id}" onclick="App.toggleInitSkill('${s.id}')">
      <div class="skill-header">
        <span class="skill-name">${s.name}</span>
        <div class="skill-badges">
          <span class="badge badge-basic">BÁSICO</span>
          <span class="badge badge-st">${s.cost}</span>
        </div>
      </div>
      <div class="skill-desc">${s.desc}</div>
    </div>
  `).join('');
}

let _selectedInitSkills = [];
App.toggleInitSkill = function(id) {
  const el = $(`initsk-${id}`);
  if (_selectedInitSkills.includes(id)) {
    _selectedInitSkills = _selectedInitSkills.filter(x => x !== id);
    el.classList.remove('owned');
  } else {
    if (_selectedInitSkills.length >= 3) { toast('Máximo 3 habilidades iniciais!','error'); return; }
    _selectedInitSkills.push(id);
    el.classList.add('owned');
  }
};

function buildPericiasGrid() {
  const grid = $('periciasGrid');
  grid.innerHTML = DATA.pericias.map(p => `
    <div class="pericia-item" id="pitem-${p.id}" onclick="App.togglePericia('${p.id}')">
      <div class="pericia-check" id="pcheck-${p.id}"></div>
      <span class="pericia-name">${p.name}</span>
      <span class="pericia-attr">${p.attr}</span>
    </div>
  `).join('');
}

let _selectedPericias = [];
App.togglePericia = function(id) {
  const maxPericias = 3 + Math.floor(_attrs.INT / 4) + Math.floor(_attrs.SAB / 4);
  if (_selectedPericias.includes(id)) {
    _selectedPericias = _selectedPericias.filter(x => x !== id);
    $(`pitem-${id}`)?.classList.remove('selected');
    const chk = $(`pcheck-${id}`); if (chk) chk.textContent = '';
  } else {
    if (_selectedPericias.length >= maxPericias) { toast(`Máximo ${maxPericias} perícias! (3 base + INT÷4 + SAB÷4)`,'error'); return; }
    _selectedPericias.push(id);
    $(`pitem-${id}`)?.classList.add('selected');
    const chk = $(`pcheck-${id}`); if (chk) chk.textContent = '✓';
  }
};

App.randomizeChar = function() {
  const names = DATA.npcNames;
  $('charName').value = names[rand(0, names.length-1)];
  const classes = Object.keys(DATA.classes);
  const cls = classes[rand(0, classes.length-1)];
  $('charClass').value = cls;
  App.onClassChange();
  // Budget: 27 points, each point = +1 attr (above 13 costs 2)
  _attrs = { FOR:8, AGI:8, DEX:8, INT:8, SAB:8 };
  _pointsLeft = 27;
  // Distribute based on class recommendation priorities
  const rec = DATA.classes[cls].recommended;
  const priorities = Object.entries(rec).sort((a,b) => b[1]-a[1]).map(e => e[0]);
  let attempts = 0;
  while (_pointsLeft > 0 && attempts < 200) {
    attempts++;
    const attr = priorities[rand(0, Math.min(2, priorities.length-1))];
    if (_attrs[attr] >= 15) continue;
    const cost = _attrs[attr] >= 13 ? 2 : 1;
    if (_pointsLeft >= cost) { _attrs[attr]++; _pointsLeft -= cost; }
  }
  updateAttrDisplay();
  toast('🎲 Personagem aleatório gerado!','info');
};

App.createCharacter = function() {
  const name = $('charName').value.trim();
  const cls = $('charClass').value;
  const background = $('charBackground').value;
  const alignment = $('charAlignment').value;
  const age = parseInt($('charAge').value) || 25;
  const gold = parseInt($('charGold').value) || 10;

  if (!name) { toast('Dê um nome ao seu herói!','error'); return; }
  if (!cls) { toast('Escolha uma classe!','error'); return; }
  if (!background) { toast('Escolha uma origem!','error'); return; }
  if (_pointsLeft < 0) { toast('Pontos de atributo excedidos!','error'); return; }

  const bgBonus = DATA.backgrounds[background] || {};
  const finalAttrs = {};
  ['FOR','AGI','DEX','INT','SAB'].forEach(a => {
    finalAttrs[a] = clamp((_attrs[a] || 8) + (bgBonus[a] || 0), 5, 18);
  });

  const derived = calcDerived(finalAttrs);
  const maxPericias = 3 + Math.floor(finalAttrs.INT / 4) + Math.floor(finalAttrs.SAB / 4);

  State.char = {
    name, cls, background, alignment, age, gold,
    attrs: finalAttrs,
    maxPV: derived.PV, currentPV: derived.PV,
    maxST: derived.ST, currentST: derived.ST,
    maxMP: derived.MP, currentMP: derived.MP,
    xp: 0,
    conditions: [],
    skills: [],           // No free skills — must earn XP first
    spells: [],
    inventory: [],
    equipped: {},
    pericias: _selectedPericias.slice(0, maxPericias),
  };

  _selectedInitSkills = [];
  _selectedPericias = [];
  saveState();
  toast(`⚔ ${name} forjado(a) com sucesso!`, 'success');
  App.navigate('dashboard');
};

// ===================== SKILLS PAGE =====================
function renderSkillsPage() {
  if (!State.char) { $('skillsGrid').innerHTML = '<p style="color:var(--text-m)">Crie um personagem primeiro.</p>'; return; }
  const c = State.char;
  const classSkills = DATA.skills[c.cls] || [];
  const xpLeft = c.xp || 0;
  $('skillsXPInfo').textContent = `XP disponível: ${xpLeft} | Habilidades aprendidas: ${c.skills.length}`;
  App._currentSkillFilter = App._currentSkillFilter || 'all';
  renderSkillCards(App._currentSkillFilter);
}

function renderSkillCards(filter) {
  const c = State.char;
  const classSkills = DATA.skills[c.cls] || [];
  let filtered = classSkills;
  if (filter === 'basic') filtered = classSkills.filter(s => s.tier === 'basic');
  else if (filter === 'advanced') filtered = classSkills.filter(s => s.tier === 'advanced');
  else if (filter === 'master') filtered = classSkills.filter(s => s.tier === 'master');
  else if (filter === 'owned') filtered = classSkills.filter(s => c.skills.includes(s.id));

  const xpCost = { basic:50, advanced:100, master:200 };
  $('skillsGrid').innerHTML = filtered.map(s => {
    const owned = c.skills.includes(s.id);
    const cost = xpCost[s.tier];
    const canBuy = !owned && (c.xp||0) >= cost;
    const prereq = s.tier === 'advanced' && classSkills.filter(x=>x.tier==='basic').every(b => !c.skills.includes(b.id));
    return `
    <div class="skill-card tier-${s.tier} ${owned?'owned':''}" data-tooltip="Custo: ${s.cost} | ${s.tier==='basic'?'50 XP':s.tier==='advanced'?'100 XP':'200 XP'} para aprender | Classe: ${c.cls}">
      <div class="skill-header">
        <span class="skill-name">${s.name}</span>
        <div class="skill-badges">
          <span class="badge badge-${s.tier}">${s.tier==='basic'?'BÁSICO':s.tier==='advanced'?'AVANÇADO':'MESTRE'}</span>
          <span class="badge badge-st">${s.cost}</span>
        </div>
      </div>
      <div class="skill-desc">${s.desc}</div>
      <div class="skill-footer">
        ${owned
          ? '<span style="color:var(--gold-b);font-size:0.72rem;font-family:Cinzel,serif;">✓ Aprendida</span>'
          : `<button class="btn-sm" ${canBuy?'':'disabled style="opacity:0.4"'} onclick="App.buySkill('${s.id}')">
               ${canBuy ? `Aprender (${cost} XP)` : `${cost} XP necessários`}
             </button>`}
      </div>
    </div>`;
  }).join('') || '<p style="color:var(--text-m);padding:1rem;">Nenhuma habilidade nesta categoria.</p>';
}

App.filterSkills = function(f) {
  document.querySelectorAll('.skills-filter .filter-btn').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
  App._currentSkillFilter = f;
  renderSkillCards(f);
};

App.buySkill = function(id) {
  const c = State.char;
  if (!c || c.skills.includes(id)) return;
  const allSkills = DATA.skills[c.cls] || [];
  const skill = allSkills.find(s => s.id === id);
  if (!skill) return;
  const cost = { basic:50, advanced:100, master:200 }[skill.tier];
  if ((c.xp||0) < cost) { toast('XP insuficiente!','error'); return; }
  c.xp -= cost;
  c.skills.push(id);
  saveState();
  toast(`✨ Habilidade "${skill.name}" aprendida!`, 'success');
  renderSkillsPage();
  renderXP();
};

// ===================== INVENTORY =====================
function renderInventory() {
  if (!State.char) return;
  const c = State.char;
  const totalWeight = (c.inventory||[]).reduce((acc,i) => {
    const item = findItemById(i.id);
    return acc + ((item?.weight||0) * (i.qty||1));
  }, 0);
  const maxLoad = c.attrs.FOR * 3;
  $('invGold').textContent = `🪙 ${c.gold||0} ouro`;
  $('invLoad').textContent = `⚖️ ${totalWeight.toFixed(1)} / ${maxLoad} kg`;

  renderEquippedSlots();
  renderBagGrid();
  renderShops();
}

function renderEquippedSlots() {
  const c = State.char;
  const slots = ['weapon','offhand','armor','neck','ring1','ring2','belt','cloak'];
  slots.forEach(slot => {
    const el = $(`slot-${slot}`);
    if (!el) return;
    const equipped = c.equipped?.[slot];
    if (equipped) {
      const item = findItemById(equipped);
      el.classList.add('has-item');
      el.innerHTML = `
        <div class="slot-icon">${item?.icon||'📦'}</div>
        <div class="slot-item-name">${item?.name||equipped}</div>
        <div class="slot-label" onclick="App.unequipSlot('${slot}')">✕ Remover</div>`;
    } else {
      el.classList.remove('has-item');
      el.innerHTML = `<div class="slot-icon">${getSlotIcon(slot)}</div><div class="slot-label">${getSlotLabel(slot)}</div>`;
    }
  });
}

function getSlotIcon(s) { const m={weapon:'⚔️',offhand:'🛡️',armor:'🪖',neck:'📿',ring1:'💍',ring2:'💍',belt:'🔗',cloak:'🧥'}; return m[s]||'📦'; }
function getSlotLabel(s) { const m={weapon:'Arma',offhand:'Mão Off',armor:'Armadura',neck:'Pescoço',ring1:'Anel 1',ring2:'Anel 2',belt:'Cinto',cloak:'Capa'}; return m[s]||s; }

function renderBagGrid() {
  const c = State.char;
  const inv = c.inventory || [];
  $('bagGrid').innerHTML = inv.length === 0
    ? '<p style="color:var(--text-m);font-style:italic;padding:1rem;">A bolsa está vazia.</p>'
    : inv.map((entry, idx) => {
        const item = findItemById(entry.id) || { name: entry.id, icon:'📦', desc:'', weight:0, price:0 };
        return `<div class="item-card rarity-${item.rarity||'common'}">
          <div class="item-header">
            <span class="item-icon">${item.icon||'📦'}</span>
            <span class="item-name">${item.name}</span>
            ${entry.qty > 1 ? `<span class="badge badge-basic">×${entry.qty}</span>` : ''}
          </div>
          <div class="item-desc">${item.desc||''}</div>
          ${item.stats ? `<div class="item-stats">${item.stats.map(s=>`<span class="item-stat">${s}</span>`).join('')}</div>` : ''}
          <div class="item-actions">
            ${item.slot ? `<button class="btn-sm" onclick="App.equipItem('${entry.id}','${item.slot}')">Equipar</button>` : ''}
            <button class="btn-sm danger" onclick="App.removeFromBag(${idx})">Descartar</button>
            ${item.type==='consumable' ? `<button class="btn-sm" onclick="App.useConsumable('${entry.id}')">Usar</button>` : ''}
          </div>
        </div>`;
      }).join('');
}

function renderShops() {
  Object.entries(DATA.items).forEach(([cat, items]) => {
    const el = $(`shop${capitalize(cat)}`);
    if (!el) return;
    el.innerHTML = items.map(item => {
      const rarityLabel = { common:'Comum', uncommon:'Incomum', rare:'Raro', 'very-rare':'Muito Raro', legendary:'Lendário' }[item.rarity] || '';
      const tipText = `${rarityLabel} · Peso: ${item.weight||0}kg · Preço: ${item.price} ouro${item.magic?' · ✨ Item Mágico':''}${item.bonuses?` · Bônus: ${Object.entries(item.bonuses).map(([k,v])=>`+${v} ${k}`).join(', ')}`:''} `;
      return `
      <div class="item-card rarity-${item.rarity||'common'}" data-tooltip="${tipText.replace(/"/g,'&quot;')}">
        <div class="item-header">
          <span class="item-icon">${item.icon||'📦'}</span>
          <span class="item-name">${item.name}</span>
          ${item.magic ? `<span class="badge badge-advanced">✨</span>` : ''}
          <span class="item-rarity" style="font-family:Cinzel,serif;font-size:0.55rem;padding:0.1rem 0.35rem;border-radius:3px;background:rgba(255,255,255,0.05);color:var(--text-m);">${rarityLabel}</span>
        </div>
        <div class="item-desc">${item.desc}</div>
        ${item.damage ? `<div style="margin-top:0.25rem;"><span class="item-stat">Dano: ${item.damage}</span></div>` : ''}
        ${item.rd !== undefined ? `<div style="margin-top:0.25rem;"><span class="item-stat">RD: ${item.rd}</span> <span class="item-stat">+${item.defBonus} Def</span> ${item.agiPen>0?`<span class="item-stat" style="color:#EF9A9A">–${item.agiPen} AGI</span>`:''}` : ''}
        ${item.stats ? `<div class="item-stats">${item.stats.map(s=>`<span class="item-stat">${s}</span>`).join('')}</div>` : ''}
        ${item.bonuses ? `<div class="item-stats">${Object.entries(item.bonuses).map(([k,v])=>`<span class="item-stat" style="color:var(--gold-b)">+${v} ${k}</span>`).join('')}</div>` : ''}
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:0.5rem;">
          <span class="item-price">🪙 ${item.price} ouro</span>
          <span class="item-weight">⚖ ${item.weight||0} kg</span>
        </div>
        <div class="item-actions">
          <button class="btn-sm" onclick="App.buyItem('${item.id}')">Comprar</button>
          <button class="btn-sm" onclick="App.addToBagFree('${item.id}')">+ Bolsa</button>
        </div>
      </div>
    `}).join('');
  });
}

App.invTab = function(tab) {
  document.querySelectorAll('.inv-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.inv-panel').forEach(p => p.classList.remove('active'));
  event.target.classList.add('active');
  $(`inv-${tab}`)?.classList.add('active');
};

App.filterShop = function(cat, q) {
  const items = DATA.items[cat] || [];
  const filtered = q ? items.filter(i => i.name.toLowerCase().includes(q.toLowerCase())) : items;
  // Re-render filtered
};

App.buyItem = function(id) {
  const c = State.char;
  const item = findItemById(id);
  if (!item) return;
  if ((c.gold||0) < item.price) { toast('Ouro insuficiente!','error'); return; }
  c.gold -= item.price;
  addToBag(id, 1);
  toast(`Comprado: ${item.name} (–${item.price} ouro)`, 'success');
  renderInventory();
};

App.addToBagFree = function(id) {
  addToBag(id, 1);
  toast('Item adicionado à bolsa!', 'success');
  renderInventory();
};

function addToBag(id, qty = 1) {
  const c = State.char;
  if (!c.inventory) c.inventory = [];
  const existing = c.inventory.find(e => e.id === id);
  if (existing) existing.qty = (existing.qty||1) + qty;
  else c.inventory.push({ id, qty });
  saveState();
}

App.removeFromBag = function(idx) {
  const c = State.char;
  c.inventory.splice(idx, 1);
  saveState();
  renderInventory();
};

App.equipItem = function(id, slot) {
  const c = State.char;
  if (!c.equipped) c.equipped = {};
  c.equipped[slot] = id;
  saveState();
  toast('Item equipado!', 'success');
  renderInventory();
};

App.unequipSlot = function(slot) {
  const c = State.char;
  delete c.equipped[slot];
  saveState();
  renderInventory();
};

App.useConsumable = function(id) {
  const c = State.char;
  const item = findItemById(id);
  if (!item) return;
  const entry = c.inventory.find(e => e.id === id);
  if (!entry) return;

  let msg = `Usado: ${item.name}`;
  // Apply effects
  if (id === 'pocaoVida1') { const h = rollDie(8)+rollDie(8)+5; c.currentPV = Math.min(c.maxPV, c.currentPV+h); msg+=` (+${h} PV)`; }
  else if (id === 'pocaoVida2') { const h = rollDie(8)+rollDie(8)+rollDie(8)+rollDie(8)+10; c.currentPV = Math.min(c.maxPV, c.currentPV+h); msg+=` (+${h} PV)`; }
  else if (id === 'pocaoST') { c.currentST = Math.min(c.maxST, c.currentST+20); msg+=` (+20 ST)`; }
  else if (id === 'pocaoMP') { c.currentMP = Math.min(c.maxMP, c.currentMP+25); msg+=` (+25 MP)`; }
  else if (id === 'antivenom') { c.conditions = (c.conditions||[]).filter(x=>x.type!=='poison'); msg+=' (Veneno removido)'; }
  else if (id === 'bandagem') { c.conditions = (c.conditions||[]).filter(x=>x.type!=='bleed'); msg+=' (Sangramento estancado)'; }

  entry.qty = (entry.qty||1) - 1;
  if (entry.qty <= 0) App.removeFromBag(c.inventory.indexOf(entry));
  saveState();
  toast(msg, 'success');
  renderDashboard();
  renderInventory();
};

App.clearBag = function() {
  if (!confirm('Limpar toda a bolsa?')) return;
  State.char.inventory = [];
  saveState();
  renderInventory();
};

App.addCustomItem = function() {
  openModal('Adicionar Item Personalizado',
    `<div class="modal-field"><label>Nome do Item</label><input id="ciName" placeholder="Ex: Espada Lendária Antiga"></div>
     <div class="modal-field"><label>Ícone (emoji)</label><input id="ciIcon" value="📦" maxlength="2"></div>
     <div class="modal-field"><label>Descrição</label><textarea id="ciDesc" placeholder="O que o item faz..."></textarea></div>`,
    `<button class="btn-secondary" onclick="closeModal()">Cancelar</button>
     <button class="btn-primary" onclick="App.saveCustomItem()">Adicionar</button>`);
};

App.saveCustomItem = function() {
  const name = $('ciName')?.value.trim();
  if (!name) return;
  const id = 'custom_' + Date.now();
  const icon = $('ciIcon')?.value || '📦';
  const desc = $('ciDesc')?.value || '';
  // Store custom items in a simple way
  if (!State.customItems) State.customItems = {};
  State.customItems[id] = { id, name, icon, desc, weight:0, price:0, rarity:'common' };
  addToBag(id, 1);
  saveState();
  closeModal();
  renderInventory();
  toast(`Item "${name}" adicionado!`, 'success');
};

function findItemById(id) {
  if (State.customItems && State.customItems[id]) return State.customItems[id];
  for (const cat of Object.values(DATA.items)) {
    const found = cat.find(i => i.id === id);
    if (found) return found;
  }
  return null;
}

// ===================== SPELLS =====================
function renderSpells() {
  if (!State.char) return;
  const c = State.char;
  $('spellsMPInfo').textContent = `MP: ${c.currentMP} / ${c.maxMP}`;
  App._spellFilter = App._spellFilter || 'all';
  renderSpellCards(App._spellFilter);
}

function renderSpellCards(filter) {
  const c = State.char;
  let spells = DATA.spells;
  if (filter === 'known') spells = spells.filter(s => (c.spells||[]).includes(s.id));
  else if (['1','2','3','4'].includes(filter)) spells = spells.filter(s => s.tier === parseInt(filter));
  // Filter by class: arcane for mago, divine for clerigo, both for others
  if (c.cls === 'mago') spells = spells.filter(s => s.type === 'arcane');
  else if (c.cls === 'clerigo') spells = spells.filter(s => s.type === 'divine');

  $('spellsGrid').innerHTML = spells.map(s => {
    const known = (c.spells||[]).includes(s.id);
    const mp10 = (c.xp||0) >= 50;
    return `
    <div class="spell-card ${s.type==='divine'?'divine':''} ${known?'known':''}" data-tooltip="Tier ${s.tier} · Custo: ${s.mp} MP · Tipo: ${s.type==='arcane'?'Arcana':'Divina'} | ${known?'Aprendida':'50 XP para aprender'}">
      <div class="spell-header">
        <span class="spell-name">${s.name}</span>
        <div class="spell-meta">
          <span class="spell-tier">Tier ${s.tier}</span>
          <span class="spell-mp">${s.mp} MP</span>
        </div>
      </div>
      <div class="spell-desc">${s.desc}</div>
      <div class="skill-footer" style="margin-top:0.5rem;">
        ${known
          ? `<div style="display:flex;gap:0.5rem;">
               <span style="color:var(--gold-b);font-size:0.72rem;font-family:Cinzel,serif;">✓ Aprendida</span>
               <button class="btn-sm" onclick="App.castSpell('${s.id}')">Lançar (${s.mp} MP)</button>
             </div>`
          : `<button class="btn-sm" ${mp10?'':'disabled style="opacity:0.4"'} onclick="App.learnSpell('${s.id}')">
               Aprender (50 XP)
             </button>`}
      </div>
    </div>`;
  }).join('') || '<p style="color:var(--text-m);padding:1rem;">Nenhuma magia disponível.</p>';
}

App.filterSpells = function(f) {
  document.querySelectorAll('.spells-tabs .filter-btn').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
  App._spellFilter = f;
  renderSpellCards(f);
};

App.learnSpell = function(id) {
  const c = State.char;
  if (!c || (c.spells||[]).includes(id)) return;
  if ((c.xp||0) < 50) { toast('Você precisa de 50 XP!','error'); return; }
  c.xp -= 50;
  if (!c.spells) c.spells = [];
  c.spells.push(id);
  saveState();
  toast('✨ Magia aprendida!', 'success');
  renderSpells();
};

App.castSpell = function(id) {
  const c = State.char;
  const spell = DATA.spells.find(s => s.id === id);
  if (!spell) return;
  if (c.currentMP < spell.mp) { toast('MP insuficiente!','error'); return; }
  c.currentMP -= spell.mp;
  saveState();
  toast(`🔮 ${spell.name} lançada! (–${spell.mp} MP)`, 'info');
  renderSpells();
  renderDashboard();
};

// ===================== ENCOUNTERS =====================
function renderEncountersPage() {
  renderNPCList();
}

App.rollEncounter = function() {
  let d1 = rollDie(20);
  let d2 = rollDie(20);
  const biome = $('encBiome').value;

  // Modifiers
  let mod1 = 0;
  if ($('encFurtive').checked) mod1 += 3;
  if ($('encTorch').checked) mod1 -= 4;
  if ($('encDawn').checked) mod1 -= 2;
  if ($('encRun').checked) mod1 -= 5;
  if ($('encAfterBattle').checked) mod1 -= 3;
  if ($('encSentinel').checked) mod1 += 2;

  // Biome mods
  const biomeMods = { floresta:0, floresta_sombria:-3, caverna:-1, masmorra:-4, planicie:2, pantano:-2, montanha:-1, ruinas:-2, cidade:4 };
  const terrainBiomeMods = { floresta:0, floresta_sombria:-2, caverna:-2, masmorra:-4, planicie:3, pantano:-3, montanha:-4, ruinas:-3, cidade:4 };
  mod1 += biomeMods[biome] || 0;
  const mod2 = terrainBiomeMods[biome] || 0;

  const finalD1 = clamp(d1 + mod1, 1, 20);
  const finalD2 = clamp(d2 + mod2, 1, 20);

  // Animate dice
  $('encDie1').textContent = finalD1;
  $('encDie2').textContent = finalD2;
  $('encResult').style.display = '';

  const encResult = DATA.encounters.encounter.find(r => finalD1 >= r.range[0] && finalD1 <= r.range[1]);
  const terrResult = DATA.encounters.terrain.find(r => finalD2 >= r.range[0] && finalD2 <= r.range[1]);

  // Encounter card
  const ec = $('encCard1');
  ec.className = 'enc-card enc-encounter';
  ec.querySelector('.enc-card-title').textContent = `🗡 Encontro: ${encResult?.label || '?'}`;
  ec.querySelector('.enc-card-body').textContent = encResult?.body || '';

  const tc = $('encCard2');
  tc.className = 'enc-card enc-terrain';
  tc.querySelector('.enc-card-title').textContent = `🗺 Terreno: ${terrResult?.label || '?'}`;
  tc.querySelector('.enc-card-body').textContent = terrResult?.body || '';

  // Show creature if combat
  if (finalD1 <= 10) {
    const creatures = DATA.encounters.biomeCreatures[biome] || DATA.encounters.biomeCreatures.floresta;
    const level = finalD1 <= 2 ? 4 : finalD1 <= 4 ? 3 : finalD1 <= 7 ? 2 : 1;
    const idx = clamp(Math.floor((11-finalD1)/2), 0, creatures.length-1);
    const creature = creatures[idx] || creatures[0];
    $('encCreature').style.display = '';
    $('creatureHeader').innerHTML = `<span style="font-family:Cinzel,serif;font-size:1rem;color:var(--gold-b);">⚔ ${creature}</span> <span class="badge badge-${level>=4?'master':level>=3?'advanced':'basic'}" style="font-size:0.65rem;">Nível ${level}</span>`;
    $('creatureBody').innerHTML = `<p style="font-size:0.82rem;color:var(--text-s);">Encontro de nível ${level} — consulte o Bestiário para estatísticas completas.<br>XP estimado: ${[0,15,40,120,300,800][level]}</p>`;
  } else {
    $('encCreature').style.display = 'none';
  }
};

// ===================== NPC GENERATOR =====================
App.generateNPC = function() {
  const level = parseInt($('npcLevel').value);
  const type = $('npcType').value;
  const name = DATA.npcNames[rand(0, DATA.npcNames.length-1)];
  const titles = DATA.npcTitles[type] || DATA.npcTitles.humanoid;
  const title = titles[rand(0, titles.length-1)];
  const fullName = `${name}, ${title}`;

  // Generate attrs based on level
  const base = [4,8,10,14,18,22][level];
  const attrs = {
    FOR: base + rand(-2,3),
    AGI: base + rand(-2,2),
    DEX: base + rand(-2,2),
    INT: Math.max(2, (type==='mage' ? base+2 : base-2) + rand(-1,2)),
    SAB: base + rand(-1,2)
  };
  const d = calcDerived(attrs);
  const pvMult = [1,1,1.1,1.2,1.3,1.5][level];
  const pv = Math.floor(d.PV * pvMult);

  const abilities = DATA.npcAbilities[type] || DATA.npcAbilities.humanoid;
  const picked = [];
  const numAbil = [1,1,2,3,4,5][level];
  while(picked.length < numAbil && picked.length < abilities.length) {
    const a = abilities[rand(0, abilities.length-1)];
    if (!picked.includes(a)) picked.push(a);
  }

  const xpReward = [0,15,40,120,300,800][level];

  const npc = { id: Date.now(), name:fullName, level, type, attrs, pv, abilities:picked, xp:xpReward };

  $('npcResult').style.display = '';
  $('npcResult').innerHTML = `
    <div class="npc-card-name">${fullName}</div>
    <div style="font-size:0.75rem;color:var(--text-m);margin-bottom:0.5rem;">Nível ${level} · ${capitalize(type)} · XP: ${xpReward}</div>
    <div class="npc-attrs">
      <span class="npc-attr-badge">FOR ${attrs.FOR}</span>
      <span class="npc-attr-badge">AGI ${attrs.AGI}</span>
      <span class="npc-attr-badge">DEX ${attrs.DEX}</span>
      <span class="npc-attr-badge">INT ${attrs.INT}</span>
      <span class="npc-attr-badge">SAB ${attrs.SAB}</span>
      <span class="npc-attr-badge">PV ${pv}</span>
      <span class="npc-attr-badge">DEF ${d.DEF}</span>
    </div>
    <div class="npc-abilities">
      ${picked.map(a => `<div class="npc-ability">⚔ <strong>${a}</strong></div>`).join('')}
    </div>
    <button class="btn-sm npc-save-btn" onclick="App.saveNPC(${JSON.stringify(npc).replace(/"/g,'&quot;')})">💾 Salvar NPC</button>
  `;
};

App.saveNPC = function(npc) {
  State.npcs = State.npcs || [];
  State.npcs.push(npc);
  saveState();
  renderNPCList();
  toast(`NPC "${npc.name}" salvo!`, 'success');
};

function renderNPCList() {
  const list = $('npcList');
  const npcs = State.npcs || [];
  list.innerHTML = npcs.length === 0
    ? '<p style="color:var(--text-m);font-style:italic;">Nenhum NPC salvo.</p>'
    : npcs.map((npc, i) => `
      <div class="npc-list-item" onclick="App.viewNPC(${i})">
        <span class="npc-list-name">${npc.name}</span>
        <span class="npc-list-meta">Nível ${npc.level} · ${npc.xp} XP</span>
        <button class="btn-xs danger" onclick="event.stopPropagation();App.deleteNPC(${i})">✕</button>
      </div>
    `).join('');
}

App.viewNPC = function(idx) {
  const npc = State.npcs[idx];
  if (!npc) return;
  openModal(npc.name,
    `<div class="npc-attrs" style="margin-bottom:0.75rem;">
       ${Object.entries(npc.attrs).map(([k,v])=>`<span class="npc-attr-badge">${k} ${v}</span>`).join('')}
       <span class="npc-attr-badge">PV ${npc.pv}</span>
     </div>
     <div class="npc-abilities">
       ${npc.abilities.map(a=>`<div class="npc-ability">⚔ <strong>${a}</strong></div>`).join('')}
     </div>
     <p style="margin-top:0.75rem;font-size:0.8rem;color:var(--text-m);">XP ao derrotar: ${npc.xp}</p>`);
};

App.deleteNPC = function(idx) {
  State.npcs.splice(idx, 1);
  saveState();
  renderNPCList();
};

// ===================== QUESTS =====================
function renderQuests() {
  const filter = App._questFilter || 'all';
  let quests = State.quests || [];
  if (filter !== 'all') quests = quests.filter(q => q.status === filter);
  $('questsList').innerHTML = quests.length === 0
    ? '<p style="color:var(--text-m);font-style:italic;padding:1rem;">Nenhuma missão encontrada.</p>'
    : quests.map((q, i) => `
      <div class="quest-card status-${q.status}" onclick="App.openQuestDetail(${i})">
        <div class="quest-header">
          <span class="quest-title">${q.title}</span>
          <span class="quest-status status-${q.status}">${q.status === 'active' ? 'Ativa' : q.status === 'completed' ? 'Concluída' : 'Falha'}</span>
        </div>
        <div class="quest-desc">${q.desc}</div>
        <div class="quest-objectives">
          ${(q.objectives||[]).map(obj => `<div class="quest-obj-item ${obj.done?'done':''}">
            <input type="checkbox" class="quest-obj-check" ${obj.done?'checked':''} onclick="event.stopPropagation();App.toggleObjective(${State.quests.indexOf(q)},${q.objectives.indexOf(obj)})">
            ${obj.text}
          </div>`).join('')}
        </div>
        <div class="quest-meta">
          <span>Dificuldade: ${q.difficulty || '—'}</span>
          <span>Recompensa: ${q.reward || '—'}</span>
          ${q.xp ? `<span>XP: +${q.xp}</span>` : ''}
        </div>
      </div>
    `).join('');
}

App.filterQuests = function(f) {
  document.querySelectorAll('.quest-filter .filter-btn').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
  App._questFilter = f;
  renderQuests();
};

App.openQuestModal = function(idx) {
  const q = idx !== undefined ? State.quests[idx] : null;
  openModal(q ? 'Editar Missão' : 'Nova Missão',
    `<div class="modal-field"><label>Título</label><input id="qtitle" value="${q?.title||''}" placeholder="Ex: A Caverna dos Mortos-Vivos"></div>
     <div class="modal-field"><label>Descrição</label><textarea id="qdesc" placeholder="O que o grupo deve fazer...">${q?.desc||''}</textarea></div>
     <div class="modal-field"><label>Objetivo 1</label><input id="qobj1" value="${q?.objectives?.[0]?.text||''}" placeholder="Encontrar o artefato"></div>
     <div class="modal-field"><label>Objetivo 2</label><input id="qobj2" value="${q?.objectives?.[1]?.text||''}" placeholder="Derrotar o guardião"></div>
     <div class="modal-field"><label>Objetivo 3</label><input id="qobj3" value="${q?.objectives?.[2]?.text||''}" placeholder="Retornar com prova"></div>
     <div class="modal-field"><label>Dificuldade</label><select id="qdiff">
       <option ${q?.difficulty==='Fácil'?'selected':''}>Fácil</option>
       <option ${q?.difficulty==='Moderada'||!q?'selected':''}>Moderada</option>
       <option ${q?.difficulty==='Difícil'?'selected':''}>Difícil</option>
       <option ${q?.difficulty==='Épica'?'selected':''}>Épica</option>
     </select></div>
     <div class="modal-field"><label>Recompensa</label><input id="qreward" value="${q?.reward||''}" placeholder="Ex: 50 ouro + item mágico"></div>
     <div class="modal-field"><label>XP ao completar</label><input id="qqxp" type="number" value="${q?.xp||100}"></div>
     <div class="modal-field"><label>Status</label><select id="qstatus">
       <option value="active" ${!q||q.status==='active'?'selected':''}>Ativa</option>
       <option value="completed" ${q?.status==='completed'?'selected':''}>Concluída</option>
       <option value="failed" ${q?.status==='failed'?'selected':''}>Falha</option>
     </select></div>`,
    `<button class="btn-secondary" onclick="App.closeModal()">Cancelar</button>
     ${q ? `<button class="btn-sm danger" onclick="App.deleteQuest(${idx});App.closeModal()">Excluir</button>` : ''}
     <button class="btn-primary" onclick="App.saveQuest(${idx})">Salvar</button>`);
};

App.saveQuest = function(idx) {
  const title = $('qtitle')?.value.trim();
  if (!title) return;
  const objs = [];
  ['qobj1','qobj2','qobj3'].forEach(oid => {
    const v = $(oid)?.value.trim();
    if (v) objs.push({ text:v, done: idx!==undefined ? (State.quests[idx]?.objectives?.find(o=>o.text===v)?.done||false) : false });
  });
  const q = { title, desc: $('qdesc')?.value||'', objectives:objs, difficulty:$('qdiff')?.value, reward:$('qreward')?.value, xp:parseInt($('qqxp')?.value)||0, status:$('qstatus')?.value };
  if (!State.quests) State.quests = [];
  if (idx !== undefined) State.quests[idx] = q;
  else State.quests.push(q);
  if (q.status === 'completed' && State.char) {
    State.char.xp = (State.char.xp||0) + q.xp;
    toast(`+${q.xp} XP pela missão concluída!`, 'success');
  }
  saveState();
  App.closeModal();
  renderQuests();
  renderXP();
};

App.openQuestDetail = function(idx) { App.openQuestModal(idx); };
App.deleteQuest = function(idx) { State.quests.splice(idx,1); saveState(); renderQuests(); };

App.toggleObjective = function(qi, oi) {
  State.quests[qi].objectives[oi].done = !State.quests[qi].objectives[oi].done;
  saveState();
  renderQuests();
};

// ===================== LORE =====================
function renderLore() {
  const l = State.lore;
  if (!l) return;
  ['backstory','traits','ideals','bonds','flaws','goals','notes'].forEach(k => {
    const el = $(`txt-${k}`);
    if (el) el.value = l[k] || '';
  });
  if ($('relationsList')) renderRelations();
  if ($('sessionList')) renderSessions();
}

App.saveLore = function() {
  const l = State.lore;
  ['backstory','traits','ideals','bonds','flaws','goals','notes'].forEach(k => {
    const el = $(`txt-${k}`);
    if (el) l[k] = el.value;
  });
  saveState();
};

App.loreTab = function(tab) {
  document.querySelectorAll('.lore-tabs .filter-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.lore-panel').forEach(p => p.classList.remove('active'));
  event.target.classList.add('active');
  $(`lore-${tab}`)?.classList.add('active');
};

App.addRelation = function() {
  openModal('Nova Relação',
    `<div class="modal-field"><label>Nome</label><input id="rname" placeholder="Ex: Aldric, o Ferreiro"></div>
     <div class="modal-field"><label>Tipo de Relação</label><select id="rtype">
       <option>Aliado</option><option>Inimigo</option><option>Mentor</option><option>Família</option><option>Amigo</option><option>Rival</option><option>Amado(a)</option><option>Contato</option>
     </select></div>
     <div class="modal-field"><label>Descrição</label><textarea id="rdesc" placeholder="Quem é essa pessoa e qual é a relação com seu personagem..."></textarea></div>`,
    `<button class="btn-secondary" onclick="App.closeModal()">Cancelar</button>
     <button class="btn-primary" onclick="App.saveRelation()">Adicionar</button>`);
};

App.saveRelation = function() {
  const name = $('rname')?.value.trim();
  if (!name) return;
  State.lore.relations.push({ name, type:$('rtype')?.value||'Aliado', desc:$('rdesc')?.value||'' });
  saveState();
  App.closeModal();
  renderRelations();
};

function renderRelations() {
  const list = $('relationsList');
  const rels = State.lore.relations || [];
  list.innerHTML = rels.length === 0
    ? '<p style="color:var(--text-m);font-style:italic;">Nenhuma relação registrada.</p>'
    : rels.map((r,i) => `
      <div class="relation-item">
        <div class="relation-avatar">${r.name.charAt(0)}</div>
        <div class="relation-info">
          <div class="relation-name">${r.name}</div>
          <div class="relation-type">${r.type}</div>
          ${r.desc ? `<div class="relation-desc">${r.desc}</div>` : ''}
        </div>
        <button class="btn-xs danger" onclick="App.deleteRelation(${i})">✕</button>
      </div>
    `).join('');
}

App.deleteRelation = function(i) {
  State.lore.relations.splice(i,1);
  saveState();
  renderRelations();
};

App.addSessionEntry = function() {
  openModal('Nova Entrada de Sessão',
    `<div class="modal-field"><label>Data / Sessão</label><input id="sdate" value="Sessão ${(State.lore.sessions.length||0)+1} — ${new Date().toLocaleDateString('pt-BR')}"></div>
     <div class="modal-field"><label>O que aconteceu</label><textarea id="stext" placeholder="Escreva os eventos mais importantes desta sessão..." style="min-height:180px;"></textarea></div>`,
    `<button class="btn-secondary" onclick="App.closeModal()">Cancelar</button>
     <button class="btn-primary" onclick="App.saveSession()">Salvar</button>`);
};

App.saveSession = function() {
  const text = $('stext')?.value.trim();
  if (!text) return;
  State.lore.sessions.unshift({ date:$('sdate')?.value||'Sessão', text });
  saveState();
  App.closeModal();
  renderSessions();
};

function renderSessions() {
  const list = $('sessionList');
  const sessions = State.lore.sessions || [];
  list.innerHTML = sessions.length === 0
    ? '<p style="color:var(--text-m);font-style:italic;">Nenhuma sessão registrada.</p>'
    : sessions.map((s,i) => `
      <div class="session-entry">
        <div class="session-date">${s.date} <button class="btn-xs danger" onclick="App.deleteSession(${i})">✕</button></div>
        <div class="session-text">${s.text}</div>
      </div>
    `).join('');
}

App.deleteSession = function(i) { State.lore.sessions.splice(i,1); saveState(); renderSessions(); };

// ===================== DICE PAGE =====================
App.rollDie = function(sides) {
  const result = rollDie(sides);
  const isCrit = result === sides;
  const isFumble = sides >= 10 && result === 1;
  const valEl = $('diceResultVal');
  valEl.textContent = result;
  valEl.className = 'dice-result-val' + (isCrit?' crit':'') + (isFumble?' fumble':'');
  $('diceResultDetail').textContent = `d${sides}` + (isCrit?' — CRÍTICO!':(isFumble?' — FUMBLE!':''));
  addDiceHistory(`d${sides}`, result, '', isCrit, isFumble);
};

App.rollCustom = function() {
  const count = parseInt($('diceCount').value) || 1;
  const sides = parseInt($('diceSides').value) || 6;
  const bonus = parseInt($('diceBonus').value) || 0;
  const rolls = [];
  for (let i=0; i<count; i++) rolls.push(rollDie(sides));
  const sum = rolls.reduce((a,b)=>a+b,0) + bonus;
  const detail = `${count}d${sides}${bonus!==0?(bonus>0?'+'+bonus:bonus):''} = [${rolls.join(', ')}]${bonus!==0?(bonus>0?' +'+bonus:' '+bonus):''}`;
  $('diceResultVal').textContent = sum;
  $('diceResultVal').className = 'dice-result-val';
  $('diceResultDetail').textContent = detail;
  addDiceHistory(`${count}d${sides}`, sum, detail);
};

App.rollAttr = function(attr) {
  if (!State.char) { toast('Crie um personagem primeiro!','error'); return; }
  const attrVal = State.char.attrs[attr];
  const die = rollDie(20);
  const result = die + attrVal;
  $('diceResultVal').textContent = result;
  $('diceResultVal').className = 'dice-result-val' + (die===20?' crit':'') + (die===1?' fumble':'');
  $('diceResultDetail').textContent = `d20(${die}) + ${attr}(${attrVal}) = ${result}`;
  addDiceHistory(`d20+${attr}`, result, `d20(${die})+${attr}(${attrVal})`, die===20, die===1);
};

App.rollInitiative = function() {
  if (!State.char) { toast('Crie um personagem primeiro!','error'); return; }
  const c = State.char;
  const ini = c.attrs.AGI + Math.floor(c.attrs.DEX/2);
  const die = rollDie(10);
  const result = die + ini;
  $('diceResultVal').textContent = result;
  $('diceResultVal').className = 'dice-result-val' + (die===10?' crit':'');
  $('diceResultDetail').textContent = `d10(${die}) + INI(${ini}) = ${result}`;
  addDiceHistory('Iniciativa', result, `d10(${die})+INI(${ini})`);
};

App.rollAttack = function() {
  if (!State.char) return;
  const c = State.char;
  const die = rollDie(10);
  const dex = c.attrs.DEX;
  const result = die + dex;
  $('diceResultVal').textContent = result;
  $('diceResultVal').className = 'dice-result-val' + (die===10?' crit':'') + (die===1?' fumble':'');
  $('diceResultDetail').textContent = `d10(${die}) + DEX(${dex}) = ${result}`;
  addDiceHistory('Ataque', result, `d10(${die})+DEX(${dex})`, die===10, die===1);
};

App.rollDefense = function() {
  if (!State.char) return;
  const c = State.char;
  const die = rollDie(10);
  const agi = c.attrs.AGI;
  const result = die + agi;
  $('diceResultVal').textContent = result;
  $('diceResultVal').className = 'dice-result-val' + (die===10?' crit':'') + (die===1?' fumble':'');
  $('diceResultDetail').textContent = `d10(${die}) + AGI(${agi}) = ${result}`;
  addDiceHistory('Defesa', result, `d10(${die})+AGI(${agi})`, die===10, die===1);
};

App.quickRoll = function() {
  const sides = [4,6,8,10,12,20][rand(0,5)];
  App.rollDie(sides);
  App.navigate('dice');
};

function addDiceHistory(die, result, detail, isCrit=false, isFumble=false) {
  State.diceHistory.unshift({ die, result, detail, isCrit, isFumble, time: new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}) });
  if (State.diceHistory.length > 20) State.diceHistory.pop();
  renderDiceHistory();
  saveState();
}

function renderDiceHistory() {
  const hist = $('diceHistory');
  if (!hist) return;
  hist.innerHTML = (State.diceHistory||[]).map(h =>
    `<div class="history-entry">
       <span class="history-die">${h.die}</span>
       <span class="history-result ${h.isCrit?'history-crit':h.isFumble?'history-fumble':''}">${h.result}</span>
       <span class="history-detail">${h.detail||''} ${h.isCrit?'★ CRÍTICO':h.isFumble?'💀 FUMBLE':''}</span>
       <span style="font-size:0.6rem;color:var(--text-m);margin-left:auto;">${h.time}</span>
     </div>`).join('') || '<p style="color:var(--text-m);font-size:0.78rem;">Nenhuma rolagem ainda.</p>';
}

App.clearDiceHistory = function() { State.diceHistory = []; saveState(); renderDiceHistory(); };

// ===================== QUICK ACTIONS =====================
App.showXPModal = function() {
  openModal('Ganhar XP',
    `<p style="color:var(--text-s);margin-bottom:1rem;">Adicione XP por combate, missão ou roleplay.</p>
     <div class="modal-number-input"><button class="attr-btn" onclick="document.getElementById('xpAmt').value=Math.max(0,parseInt(document.getElementById('xpAmt').value)-10)">−</button>
     <input id="xpAmt" type="number" value="50" min="0">
     <button class="attr-btn" onclick="document.getElementById('xpAmt').value=parseInt(document.getElementById('xpAmt').value)+10">+</button></div>`,
    `<button class="btn-secondary" onclick="App.closeModal()">Cancelar</button>
     <button class="btn-primary" onclick="App.applyXP()">⭐ Ganhar XP</button>`);
};

App.applyXP = function() {
  const amt = parseInt($('xpAmt')?.value) || 0;
  if (!State.char || amt <= 0) return;
  State.char.xp = (State.char.xp||0) + amt;
  saveState();
  App.closeModal();
  toast(`+${amt} XP ganhos!`, 'success');
  renderDashboard();
};

App.showHealModal = function() {
  openModal('Curar Personagem',
    `<p style="color:var(--text-s);margin-bottom:1rem;">PV atual: ${State.char?.currentPV} / ${State.char?.maxPV}</p>
     <div class="modal-number-input"><button class="attr-btn" onclick="document.getElementById('healAmt').value=Math.max(1,parseInt(document.getElementById('healAmt').value)-5)">−</button>
     <input id="healAmt" type="number" value="10" min="1">
     <button class="attr-btn" onclick="document.getElementById('healAmt').value=parseInt(document.getElementById('healAmt').value)+5">+</button></div>`,
    `<button class="btn-secondary" onclick="App.closeModal()">Cancelar</button>
     <button class="btn-primary" onclick="App.applyHeal()">💊 Curar</button>`);
};

App.applyHeal = function() {
  const amt = parseInt($('healAmt')?.value) || 0;
  if (!State.char || amt <= 0) return;
  State.char.currentPV = Math.min(State.char.maxPV, State.char.currentPV + amt);
  saveState();
  App.closeModal();
  toast(`+${amt} PV recuperados!`, 'success');
  renderDashboard();
};

App.showDamageModal = function() {
  openModal('Aplicar Dano',
    `<p style="color:var(--text-s);margin-bottom:1rem;">PV atual: ${State.char?.currentPV} / ${State.char?.maxPV}</p>
     <div class="modal-number-input"><button class="attr-btn" onclick="document.getElementById('dmgAmt').value=Math.max(1,parseInt(document.getElementById('dmgAmt').value)-5)">−</button>
     <input id="dmgAmt" type="number" value="10" min="1">
     <button class="attr-btn" onclick="document.getElementById('dmgAmt').value=parseInt(document.getElementById('dmgAmt').value)+5">+</button></div>`,
    `<button class="btn-secondary" onclick="App.closeModal()">Cancelar</button>
     <button class="btn-primary" style="background:linear-gradient(135deg,var(--blood-d),var(--blood-b));" onclick="App.applyDamage()">🩸 Aplicar</button>`);
};

App.applyDamage = function() {
  const amt = parseInt($('dmgAmt')?.value) || 0;
  if (!State.char || amt <= 0) return;
  State.char.currentPV = Math.max(0, State.char.currentPV - amt);
  if (State.char.currentPV === 0) {
    if (!(State.char.conditions||[]).find(c=>c.type==='down')) {
      if (!State.char.conditions) State.char.conditions = [];
      State.char.conditions.push({ id:'c_down_'+Date.now(), type:'down', label:'Caído' });
    }
    toast('💀 Personagem caiu! (0 PV)', 'error', 5000);
  } else {
    toast(`–${amt} PV sofridos!`, 'error');
  }
  saveState();
  App.closeModal();
  renderDashboard();
};

App.showRestModal = function() {
  openModal('Descanso',
    `<p style="color:var(--text-s);margin-bottom:1.25rem;">Escolha o tipo de descanso:</p>
     <div style="display:flex;flex-direction:column;gap:0.75rem;">
       <button class="dash-btn" onclick="App.doRest('short')">🌅 Descanso Curto (10 min) — Recupera 50% ST</button>
       <button class="dash-btn" onclick="App.doRest('long')">🌙 Descanso Longo (8h) — Recupera 100% ST e PV</button>
     </div>`);
};

App.doRest = function(type) {
  const c = State.char;
  if (!c) return;
  if (type === 'short') {
    c.currentST = Math.min(c.maxST, c.currentST + Math.floor(c.maxST * 0.5));
    toast('🌅 Descansado. ST parcialmente restaurada.', 'success');
  } else {
    c.currentPV = c.maxPV;
    c.currentST = c.maxST;
    c.currentMP = c.maxMP;
    c.conditions = (c.conditions||[]).filter(cond => cond.type === 'curse');
    toast('🌙 Descansado profundamente. Tudo restaurado!', 'success');
  }
  saveState();
  App.closeModal();
  renderDashboard();
};

App.showConditionModal = function() {
  const conditions = [
    { type:'bleed', label:'🩸 Sangrando' },
    { type:'stun', label:'⚡ Atordoado' },
    { type:'fear', label:'👁️ Aterrorizado' },
    { type:'slow', label:'🧊 Lento' },
    { type:'exhaust', label:'😓 Exausto' },
    { type:'poison', label:'🐍 Envenenado' },
    { type:'burn', label:'🔥 Em Chamas' },
    { type:'frozen', label:'❄️ Congelado' }
  ];
  openModal('Adicionar Condição',
    `<div style="display:flex;flex-wrap:wrap;gap:0.5rem;">
       ${conditions.map(c=>`<button class="condition-tag cond-${c.type}" style="cursor:pointer;padding:0.4rem 0.8rem;" onclick="App.addCondition('${c.type}','${c.label}');App.closeModal()">${c.label}</button>`).join('')}
     </div>`);
};

App.addCondition = function(type, label) {
  const c = State.char;
  if (!c) return;
  if (!c.conditions) c.conditions = [];
  if (c.conditions.find(x=>x.type===type)) return;
  c.conditions.push({ id:'c_'+type+'_'+Date.now(), type, label });
  saveState();
  renderConditions();
};

App.removeCondition = function(id) {
  const c = State.char;
  c.conditions = (c.conditions||[]).filter(x=>x.id!==id);
  saveState();
  renderConditions();
};

App.showAttrUpgradeModal = function(attr) {
  App.navigate('character');
};

// ===================== HELPERS =====================
function capitalize(str) { return str.charAt(0).toUpperCase() + str.slice(1); }

const ATTR_TIPS = {
  FOR: 'FORÇA: governa dano corpo-a-corpo, capacidade de carga e testes de força bruta. Fórmula PV: FOR×4+SAB×2',
  AGI: 'AGILIDADE: governa Stamina (AGI×3+FOR), Movimento (3+AGI÷4), Defesa (10+AGI÷2) e Iniciativa.',
  DEX: 'DESTREZA: governa precisão de ataque (d10+DEX), furtividade e testes de habilidades finas.',
  INT: 'INTELIGÊNCIA: governa Pontos de Magia (INT×4+SAB), número de magias aprendidas e perícias extras.',
  SAB: 'SABEDORIA: governa percepção, resistência ao medo, testes de moral e fé. Também contribui para PV e MP.'
};

// Add pericia from char sheet
App.openAddPericia = function() {
  const c = State.char;
  if (!c) return;
  const maxP = 3 + Math.floor(c.attrs.INT/4) + Math.floor(c.attrs.SAB/4);
  const owned = c.pericias || [];
  const available = DATA.pericias.filter(p => !owned.includes(p.id));
  if (available.length === 0) { toast('Você já aprendeu todas as perícias!','info'); return; }
  openModal(`Adicionar Perícia (${owned.length}/${maxP})`,
    `<div style="display:flex;flex-direction:column;gap:0.5rem;max-height:320px;overflow-y:auto;">
      ${available.map(p => `
        <div class="pericia-item" style="cursor:pointer" onclick="App.addPericia('${p.id}')">
          <div class="pericia-check">+</div>
          <span class="pericia-name">${p.name}</span>
          <span class="pericia-attr">${p.attr}</span>
        </div>`).join('')}
     </div>`,
    `<button class="btn-secondary" onclick="App.closeModal()">Cancelar</button>`);
};

App.addPericia = function(id) {
  const c = State.char;
  if (!c) return;
  const maxP = 3 + Math.floor(c.attrs.INT/4) + Math.floor(c.attrs.SAB/4);
  if ((c.pericias||[]).length >= maxP) { toast('Limite de perícias atingido!','error'); return; }
  if (!c.pericias) c.pericias = [];
  c.pericias.push(id);
  saveState();
  App.closeModal();
  renderExistingChar();
  toast('Perícia adicionada!','success');
};

App.openSetGold = function() {
  openModal('Definir Ouro',
    `<div class="modal-field"><label>Quantidade de Ouro</label><input id="goldSet" type="number" value="${State.char?.gold||0}" min="0"></div>`,
    `<button class="btn-secondary" onclick="App.closeModal()">Cancelar</button>
     <button class="btn-primary" onclick="App.setGold()">Definir</button>`);
};
App.setGold = function() {
  const v = parseInt($('goldSet')?.value)||0;
  if (State.char) { State.char.gold = Math.max(0,v); saveState(); App.closeModal(); renderExistingChar(); }
};

// ===================== TOOLTIP SYSTEM =====================
function initTooltips() {
  document.addEventListener('mouseover', e => {
    const el = e.target.closest('[data-tooltip]');
    if (!el) return;
    let tip = document.getElementById('_tooltip');
    if (!tip) {
      tip = document.createElement('div');
      tip.id = '_tooltip';
      tip.style.cssText = 'position:fixed;z-index:9000;max-width:260px;background:#1C160E;border:1px solid rgba(201,168,76,0.4);border-radius:6px;padding:0.6rem 0.85rem;font-size:0.75rem;color:#BFA882;line-height:1.5;pointer-events:none;box-shadow:0 4px 20px rgba(0,0,0,0.7);transition:opacity 0.15s;font-family:"IM Fell English",serif;';
      document.body.appendChild(tip);
    }
    tip.textContent = el.dataset.tooltip;
    tip.style.opacity = '1';
    const rect = el.getBoundingClientRect();
    let top = rect.bottom + 8;
    let left = rect.left;
    if (top + 100 > window.innerHeight) top = rect.top - 110;
    if (left + 270 > window.innerWidth) left = window.innerWidth - 275;
    tip.style.top = top + 'px';
    tip.style.left = Math.max(8, left) + 'px';
  });
  document.addEventListener('mouseout', e => {
    if (!e.target.closest('[data-tooltip]')) return;
    const tip = document.getElementById('_tooltip');
    if (tip) tip.style.opacity = '0';
  });
}

// ===================== CONFIG MENU =====================
App.openConfig = function() {
  const cfg = State.config || {};
  openModal('⚙ Configurações da Campanha',
    `<div class="modal-field"><label>Nome da Campanha</label><input id="cfgCamp" value="${cfg.campaign||''}" placeholder="Ex: A Queda de Varanthos"></div>
     <div class="modal-field"><label>Nome do Mestre</label><input id="cfgGM" value="${cfg.gm||''}" placeholder="Ex: Rodrigo"></div>
     <div class="modal-field"><label>Dificuldade Global</label>
       <select id="cfgDiff">
         <option value="easy" ${cfg.diff==='easy'?'selected':''}>Fácil (–2 em todas as DIF)</option>
         <option value="normal" ${!cfg.diff||cfg.diff==='normal'?'selected':''}>Normal</option>
         <option value="hard" ${cfg.diff==='hard'?'selected':''}>Difícil (+2 em todas as DIF)</option>
         <option value="brutal" ${cfg.diff==='brutal'?'selected':''}>Brutal (+4, morte permanente)</option>
       </select></div>
     <div class="modal-field"><label>Sistema de Moral</label>
       <select id="cfgMoral">
         <option value="on" ${!cfg.moral||cfg.moral==='on'?'selected':''}>Ativado</option>
         <option value="off" ${cfg.moral==='off'?'selected':''}>Desativado</option>
       </select></div>
     <div class="modal-field"><label>Críticos e Fumbles</label>
       <select id="cfgCrit">
         <option value="on" ${!cfg.crit||cfg.crit==='on'?'selected':''}>Ativados</option>
         <option value="off" ${cfg.crit==='off'?'selected':''}>Desativados</option>
       </select></div>
     <div class="modal-field"><label>XP por Sessão (sugestão)</label>
       <input id="cfgXPSess" type="number" value="${cfg.xpPerSession||50}" min="10" max="500"></div>
     <div class="modal-field"><label>Moeda Inicial (novo personagem)</label>
       <input id="cfgStartGold" type="number" value="${cfg.startGold||10}" min="0"></div>
     <div class="modal-field"><label>Notas da Campanha</label>
       <textarea id="cfgNotes" style="min-height:80px;" placeholder="Regras da casa, avisos...">${cfg.notes||''}</textarea></div>`,
    `<button class="btn-secondary" onclick="App.closeModal()">Cancelar</button>
     <button class="btn-primary" onclick="App.saveConfig()">💾 Salvar</button>`);
};

App.saveConfig = function() {
  State.config = {
    campaign: $('cfgCamp')?.value||'',
    gm: $('cfgGM')?.value||'',
    diff: $('cfgDiff')?.value||'normal',
    moral: $('cfgMoral')?.value||'on',
    crit: $('cfgCrit')?.value||'on',
    xpPerSession: parseInt($('cfgXPSess')?.value)||50,
    startGold: parseInt($('cfgStartGold')?.value)||10,
    notes: $('cfgNotes')?.value||''
  };
  saveState();
  App.closeModal();
  toast('⚙ Configurações salvas!','success');
};

// ===================== RULES MENU =====================
App.openRules = function() {
  const sections = [
    { title:'⚔ Combate — Ordem do Turno', content:`<b>1.</b> Role d10 + Iniciativa (AGI + DEX÷2) → maior age primeiro.<br><b>2.</b> Cada turno: 1 Ação de Movimento + 1 Ação de Combate + 1 Ação Bônus + 1 Reação.<br><b>3.</b> Ataque simples: d10 + DEX vs Defesa inimiga (10 + AGI÷2 + armadura). Custa 1 ST.<br><b>4.</b> Se resultado ≥ Defesa: acertou → role dano da arma + FOR (corpo-a-corpo) ou DEX (distância).` },
    { title:'🎯 Ataques Localizados', content:`Declare a localização ANTES de rolar. Custo extra de ST:<br>• Cabeça: +4 ST → dano ×1,5, possível atordoamento<br>• Pescoço: +5 ST → sangramento 2 PV/turno<br>• Tronco: +2 ST → dano normal<br>• Braço Armado: +3 ST → FOR DIF 14 ou solta arma<br>• Perna: +3 ST → Movimento ÷2 por 1d4 turnos<br>• Pé: +4 ST → imóvel 1 turno<br><br>Teste de ataque localizado: d10 + AGI + DEX. Defesa: d10 + AGI (+ perícia se tiver).` },
    { title:'🛡️ Defesa e Reações', content:`<b>Defesa Passiva:</b> Defesa Base = 10 + AGI÷2 + armadura. Inimigo precisa superar este valor.<br><b>Aparar (reação):</b> 3 ST — d10 + DEX. Se ≥ ataque: cancela dano.<br><b>Esquivar (reação):</b> 4 ST — d10 + AGI. Se ≥ ataque: cancela dano.<br><b>Recuar (reação):</b> 2 ST — move 1 hex sem provocar ataque de oportunidade.<br><b>Contra-ataque (Guerreiro):</b> 5 ST — após aparar com sucesso: role dano imediatamente.` },
    { title:'⚡ Stamina (ST)', content:`ST representa vigor de curto prazo. <b>Regenera AGI÷3 por turno</b> (início do seu turno).<br>• ST zerada: age normalmente mas não pode gastar ST<br>• Descanso Curto (10 min): recupera 50% da ST máxima<br>• Descanso Longo (8h): recupera 100% ST e PV<br><br><b>Custos comuns:</b><br>• Ataque simples: 1 ST<br>• Aparar: 3 ST | Esquivar: 4 ST | Recuar: 2 ST<br>• Habilidades Básicas: 3–6 ST | Avançadas: 8–12 ST | Mestre: 15–22 ST` },
    { title:'🗺️ Movimentação e Hexágonos', content:`Cada hex ≈ 1,5 metro. 6 direções de movimento.<br><b>Movimento base:</b> 3 + AGI÷4 hexes/turno.<br>• <b>Terreno difícil:</b> custa 2 Mov por hex<br>• <b>Correr:</b> dobra Mov, proíbe ataque no turno<br>• <b>Charge:</b> 5 ST — move até 3 hexes + ataque (+3 dano)<br>• <b>Flanquear:</b> 2 aliados em lados opostos → +2 ataque cada<br>• <b>Cobertura parcial:</b> +2 Defesa | Cobertura total: +6 Defesa<br>• <b>Ataque de oportunidade:</b> inimigo sai sem Desengajar → gaste 3 ST para atacar de graça.` },
    { title:'🎲 Dados e Dificuldades', content:`<b>Dado de combate:</b> d10 (ataque, defesa, localização)<br><b>Dado de perícia/roleplay:</b> d20 + atributo + bônus de perícia<br><b>Dado de dano:</b> d4 (armas pequenas) e d6 (armas médias/grandes)<br><br><b>Tabela de Dificuldade:</b><br>• DIF 8: Fácil (qualquer um consegue)<br>• DIF 12: Moderado (requer preparo)<br>• DIF 16: Difícil (desafia especialistas)<br>• DIF 20: Muito Difícil (feito heroico)<br>• DIF 25+: Épico (quase impossível)<br><br><b>Crítico</b> (natural máximo): efeito excepcional. <b>Fumble</b> (d10=1): falha grave.` },
    { title:'💀 Ferimentos e Condições', content:`<b>PV ≤ 50%:</b> Exausto → –1 em todos os testes<br><b>PV ≤ 25%:</b> Crítico → –2 testes, ST regenera metade<br><b>PV = 0:</b> Caído → FOR DIF 12 por turno ou morre em 3 falhas<br><br><b>Condições:</b><br>• <b>Sangrando:</b> –2 PV/turno até estancar (ação bônus ou Curar Ferida)<br>• <b>Atordoado:</b> perde 1 ação, –3 Defesa (dura 1 turno)<br>• <b>Aterrorizado:</b> –4 em testes, não pode se aproximar da fonte<br>• <b>Envenenado:</b> –1 atributo/turno por X turnos<br><br><b>Ferimento Grave</b> (dano único ≥ 15 na localização): –1 no atributo da parte atingida até curar.` },
    { title:'⭐ Progressão e XP', content:`Personagens ganham XP e usam para aprender habilidades — <b>não há níveis</b>.<br><br><b>Custo de habilidades:</b><br>• Básicas: 50 XP (disponíveis desde o início)<br>• Avançadas: 100 XP (requer 1 Básica da linha)<br>• Mestre: 200 XP (requer 2 Avançadas)<br>• Magias: 50 XP cada<br>• +1 Atributo: 100 XP (máx 20)<br><br><b>Fontes de XP:</b> combate (XP do inimigo), missões concluídas, roleplay notável, descobertas.` },
    { title:'🔮 Magia e MP', content:`Pontos de Magia (MP) = INT×4 + SAB. Recuperam 100% com descanso longo (8h) ou INT com meditação de 1h.<br><br><b>Tiers de magia:</b><br>• Tier 1 (2–4 MP): instantâneo, 1 alvo<br>• Tier 2 (6–10 MP): 1 ação de Concentração antes de lançar<br>• Tier 3 (12–18 MP): Concentração obrigatória; área possível<br>• Tier 4 (22–30 MP): 2 turnos de Concentração; devastador<br><br><b>Interrupção:</b> sofrer dano durante Concentração → INT DIF (12 + dano÷5) ou a magia é perdida.` },
    { title:'👁️ Moral e Medo', content:`Inimigos e PNJs testam SAB contra DIF quando:<br>• Aliado cai: DIF 10 → recua 1d4 hexes, –1 ataque<br>• Metade do grupo caiu: DIF 14 → foge ou paralisa<br>• Líder abatido: DIF 16 → todos debandam<br>• Magia devastadora: DIF 15 → aterrorizado<br>• Execução do Ladino: DIF 15 → –2 ataque por 2 turnos<br><br>Clérigo com Aura Sagrada: +2 em testes de moral para aliados adjacentes.` }
  ];

  openModal('📖 Regras de Ferro & Sangue',
    `<div style="max-height:65vh;overflow-y:auto;padding-right:0.25rem;">
      ${sections.map((s,i) => `
        <div style="margin-bottom:1rem;">
          <div style="font-family:Cinzel,serif;font-size:0.82rem;font-weight:700;color:var(--gold-b);padding:0.5rem 0.75rem;background:rgba(201,168,76,0.08);border-left:3px solid var(--gold);border-radius:0 4px 4px 0;cursor:pointer;margin-bottom:0.4rem;" onclick="this.nextElementSibling.style.display=this.nextElementSibling.style.display==='none'?'block':'none'">
            ${s.title} ▾
          </div>
          <div style="font-size:0.8rem;line-height:1.7;color:var(--text-s);padding:0.5rem 0.75rem;background:var(--bg2);border-radius:4px;${i>0?'display:none':''}">
            ${s.content}
          </div>
        </div>`).join('')}
     </div>`,
    `<button class="btn-primary" onclick="App.closeModal()">Fechar</button>`);
};

// Tooltip for skills/spells/items
function makeTooltip(text) {
  return `data-tooltip="${text.replace(/"/g,'&quot;')}"`;
}

// ===================== INIT =====================
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => App.navigate(item.dataset.page));
});

// Setup attr builder starting values
_attrs = { FOR:8, AGI:8, DEX:8, INT:8, SAB:8 };
_pointsLeft = 27;

// Init tooltips
initTooltips();

window.addEventListener('load', () => {
  try { loadState(); } catch(e) { console.warn('loadState error:', e); }
  setTimeout(() => {
    try {
      $('loadingScreen').classList.add('hidden');
      App.navigate(State.currentPage || 'dashboard');
      renderDiceHistory();
      if (State.lore) renderLore();
    } catch(e) {
      console.error('Init error:', e);
      $('loadingScreen').classList.add('hidden');
      App.navigate('dashboard');
    }
  }, 2000);
});

// Keyboard shortcut: S to save
document.addEventListener('keydown', e => {
  if (e.ctrlKey && e.key === 's') { e.preventDefault(); App.saveAll(); }
});

// Auto-save every 3 minutes
setInterval(() => { if (State.char) saveState(); }, 180000);
