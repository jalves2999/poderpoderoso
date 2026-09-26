/* =========================================================
   data.js — Base de dados do RPG em Hexágonos
   Edite este arquivo para ajustar regras, itens e magias.
   ========================================================= */

/* ---------- REGRAS GERAIS ---------- */
const REGRAS = {
  nivelMax: 50,
  vidaBase: 200,               // vida = vidaBase + CON × fator da classe × nível
  mediaD10: 5.5,
  attrMin: 1,
  attrMax: 5,

  // Crítico: d10 separado
  critBase: 10,                // % (resultado 1)
  critComPER: 20,              // % (resultados 1 e 2)
  perLimiarCritico: 5,
  critBonusBase: 50,           // % de dano a mais no final do cálculo
  bonusDeItemContaParaPER: true,

  danoMinimoPct: 10,           // dano mínimo = 10% do dano antes da defesa

  // Carga (em kg)
  cargaBase: 20,
  cargaPorFOR: 5,
  pesoPorPenalidade: 5,        // cada 5 kg acima da carga = −1 movimento

  // Movimento (em hexágonos)
  movimentoBase: 4,
  movimentoPorAGI: 1,

  // Magias
  slotsPorINT: 2,
  custoSlotPorTier: { comum: 1, raro: 2, perfeito: 3, lendario: 5, unico: 7 },

  // Penalidade por FOR abaixo do mínimo da arma (por ponto que falta)
  penalidadeFOR: { dex: 1, movimento: 1 },

  // Ações por turno
  // ações de ataque físico = AGI (+ bônus da arma − perda do escudo)
  // ações de ataque mágico = INT
  // (a quantidade vem direto do atributo)

  // Habilidades de classe
  // pontos de habilidade = pontosIniciais + ⌊nível ÷ pontosACadaNiveis⌋; cada habilidade custa 1 ponto (campo "pontos")
  // novas habilidades aparecem nos níveis de 'niveisLiberacao'
  habilidades: {
    pontosIniciais: 1,           // ponto grátis no nível 1
    pontosACadaNiveis: 5,        // +1 ponto a cada 5 níveis
    niveisLiberacao: [5, 10, 15, 20, 30, 40, 50]   // níveis em que novas habilidades aparecem
  },

  // Perícias equipadas: só as equipadas dão bônus na ficha.
  // limiteEquipadas: null = sem limite; ou um número (ex.: 5)
  pericias: {
    limiteEquipadas: null
  },

  // Reações por turno (base; a evolução de AGI soma +1 por bolinha)
  reacoesBase: 1,

  // Evolução
  // peso de cada atributo: quanto MAIOR o atributo, MAIS BARATO evoluir
  // custo da 1ª bolinha = peso × gasto; cada bolinha seguinte custa o dobro da anterior
  evolucao: {
    pesos: { 1: 10, 2: 9, 3: 8, 4: 7, 5: 6, 6: 5, 7: 4, 8: 3, 9: 2, 10: 1 },
    pontosPorNivel: 5,         // pontos de evolução ganhos em cada nível (nível 1 incluso)
    maxBolinhas: 5,
    multiplicador: 2
  },

  // Duas armas: arma leve ou muito leve na mão secundária tira pontos da chance de defesa
  duasArmas: { penalidadeDefesa: 1 },

  // Chance de defesa: rola 1d10 e defende com resultado ≤ DEX + escudo
  defesaMaxD10: 9              // um 10 sempre falha
};

/* ---------- ATRIBUTOS ---------- */
// Ajuste os nomes completos de MOR e APA se forem diferentes no seu jogo.
const ATRIBUTOS = [
  { id: 'FOR', nome: 'Força',           grupo: 'fisico', desc: '+1d10 no dano físico e +5 kg de carga por ponto' },
  { id: 'CON', nome: 'Constituição',    grupo: 'fisico', desc: 'Multiplica a defesa física dos itens e dá vida por nível' },
  { id: 'DEX', nome: 'Destreza',        grupo: 'fisico', desc: 'Chance de acerto e de defesa (defende com DEX ou menos no d10)' },
  { id: 'AGI', nome: 'Agilidade',       grupo: 'fisico', desc: 'Ataques físicos por turno (1 por ponto) e +1 hexágono de movimento' },
  { id: 'INT', nome: 'Inteligência',    grupo: 'mental', desc: '+1d10 no dano mágico, 2 slots e 1 ataque mágico por turno por ponto' },
  { id: 'FDV', nome: 'Força de Vontade',grupo: 'mental', desc: 'Multiplica a defesa mágica dos itens e dá +1d10 na cura' },
  { id: 'PER', nome: 'Percepção',       grupo: 'mental', desc: 'Com 5 ou mais, o crítico sobe de 10% para 20%' },
  { id: 'CAR', nome: 'Carisma',         grupo: 'social', desc: 'Testes' },
  { id: 'MOR', nome: 'Moral',           grupo: 'social', desc: 'Testes' },
  { id: 'APA', nome: 'Aparência',       grupo: 'social', desc: 'Testes' }
];

const GRUPOS = {
  fisico: { nome: 'Atributos físicos' },
  mental: { nome: 'Atributos mentais' },
  social: { nome: 'Atributos sociais' }
};

const CATEGORIAS_CLASSE = {
  guerreira: { nome: 'Guerreira', pontos: { fisico: 12, mental: 6,  social: 5 } },
  destreza:  { nome: 'Destreza',  pontos: { fisico: 11, mental: 7,  social: 5 } },
  magica:    { nome: 'Mágica',    pontos: { fisico: 9,  mental: 10, social: 5 } }
};

/* ---------- CLASSES ---------- */
// "habilidades" fica vazio por enquanto: será preenchido na próxima etapa.
const CLASSES = [
  {
    id: 'guerreiro', nome: 'Guerreiro', categoria: 'guerreira', fatorVida: 40, recurso: 'Fúria',
    recursoBase: 5,
    recursoRegra: 'Começa cada combate com 0. Ganha 1 Fúria ao acertar um ataque (o inimigo falha na defesa) e 2 num acerto crítico. Ataques defendidos não dão Fúria.',
    recursoInicio: 0,            // valor no começo de cada combate (0 ou 'max')
    recursoGanhos: [ { rotulo: 'Acerto', valor: 1 }, { rotulo: 'Crítico', valor: 2 } ],
    papel: 'Linha de frente',
    descricao: 'Combatente de linha de frente que transforma cada golpe acertado em Fúria.',
    armas: 'Todas as armas físicas e escudos', armaduras: 'Todas; placas sem penalidade de movimento',
    passiva: { nome: 'Muralha', texto: 'Reduz em 10% o dano recebido de ataques físicos.' },
    // F = Fúria gasta. Quanto mais Fúria, mais forte a habilidade.
    // calc (opcional) mostra os dados para o personagem: tipo 'dano' soma ao dano físico, 'cura' é só F × porPonto.
    habilidades: [
      // ----- Nível 5 -----
      { id: 'golpe_furioso', nome: 'Golpe Furioso', nivel: 5, categoria: 'Dano', tipo: 'Ativa',
        custo: '1 ação de ataque', recursoGasto: '1 ou mais', recarga: 'nenhuma', alcance: 'Da arma',
        efeito: 'Um ataque com +1d10 para cada Fúria gasta, somados antes de multiplicar pelo nível.',
        calc: { tipo: 'dano', porPonto: 1 } },
      { id: 'postura_inabalavel', nome: 'Postura Inabalável', nivel: 5, categoria: 'Defesa', tipo: 'Ativa',
        custo: 'Nenhuma ação', recursoGasto: '1 ou mais', recarga: '2 turnos', alcance: 'Si mesmo',
        efeito: 'Até o início do seu próximo turno, reduz em 10% o dano físico recebido para cada Fúria gasta (5 Fúria = −50%).' },
      { id: 'segundo_folego', nome: 'Segundo Fôlego', nivel: 5, categoria: 'Cura própria', tipo: 'Ativa',
        custo: '1 ação de ataque', recursoGasto: '1 ou mais', recarga: '3 turnos', alcance: 'Si mesmo',
        efeito: 'Recupera 1d10 × nível de vida para cada Fúria gasta.',
        calc: { tipo: 'cura', porPonto: 1 } },

      // ----- Nível 10 -----
      { id: 'investida_brutal', nome: 'Investida Brutal', nivel: 10, categoria: 'Dano', tipo: 'Ativa',
        custo: '1 ação de ataque', recursoGasto: '1 ou mais', recarga: '2 turnos', alcance: '2 hex + 1 por Fúria, em linha reta',
        efeito: 'Avança em linha reta e ataca com +1d10 por Fúria gasta. Com 3 ou mais Fúria, empurra o alvo 1 hexágono.',
        calc: { tipo: 'dano', porPonto: 1 } },
      { id: 'provocacao_ferro', nome: 'Provocação de Ferro', nivel: 10, categoria: 'Defesa', tipo: 'Ativa',
        custo: '1 ação de ataque', recursoGasto: '1 ou mais', recarga: '3 turnos', alcance: 'Raio igual à Fúria gasta',
        efeito: 'Inimigos na área são obrigados a atacar você no próximo turno deles. Até lá, você recebe +1 DF de item por Fúria gasta.' },
      { id: 'golpe_sangue', nome: 'Golpe de Sangue', nivel: 10, categoria: 'Sacrifício', tipo: 'Ativa',
        custo: '1 ação de ataque', recursoGasto: '1 ou mais, e vida', recarga: '2 turnos', alcance: 'Da arma',
        efeito: 'Perde 5% da vida máxima para cada Fúria gasta. O ataque recebe +2d10 por Fúria gasta.',
        calc: { tipo: 'dano', porPonto: 2 } },

      // ----- Nível 15 -----
      { id: 'redemoinho_aco', nome: 'Redemoinho de Aço', nivel: 15, categoria: 'Dano', tipo: 'Ativa',
        custo: '1 ação de ataque', recursoGasto: '2 ou mais', recarga: '3 turnos', alcance: 'Todos os adjacentes',
        efeito: 'Faz um ataque contra cada inimigo adjacente, cada um com +1d10 por Fúria gasta.',
        calc: { tipo: 'dano', porPonto: 1, minimo: 2 } },
      { id: 'sede_batalha', nome: 'Sede de Batalha', nivel: 15, categoria: 'Cura própria', tipo: 'Ativa',
        custo: 'Nenhuma ação', recursoGasto: '1 ou mais', recarga: '4 turnos', alcance: 'Si mesmo',
        efeito: 'Por um número de turnos igual à Fúria gasta, cada ataque seu que acertar recupera 20% do dano causado.' },
      { id: 'frenesi', nome: 'Frenesi', nivel: 15, categoria: 'Sacrifício', tipo: 'Ativa',
        custo: 'Nenhuma ação', recursoGasto: '2 ou mais, e vida', recarga: '4 turnos', alcance: 'Si mesmo',
        efeito: 'Perde 10% da vida atual para cada Fúria gasta. Neste turno, ganha +1 ação de ataque a cada 2 Fúria gasta e +1d10 em todos os ataques.' },

      // ----- Nível 20 -----
      { id: 'baluarte_eterno', nome: 'Baluarte Eterno', nivel: 20, categoria: 'Defesa', tipo: 'Reação',
        custo: '1 reação', recursoGasto: '1 ou mais', recarga: '3 turnos', alcance: 'Você ou aliado adjacente',
        efeito: 'Quando você ou um aliado adjacente é atingido, reduz o dano desse ataque em 20% por Fúria gasta (5 Fúria anula o ataque).' },
      { id: 'renascer_furia', nome: 'Renascer da Fúria', nivel: 20, categoria: 'Cura própria', tipo: 'Ativa',
        custo: 'Nenhuma ação', recursoGasto: '3 ou mais', recarga: '1 vez por combate', alcance: 'Si mesmo',
        efeito: 'Recupera 10% da vida máxima para cada Fúria gasta e remove todas as condições negativas.' },
      { id: 'aniquilacao', nome: 'Aniquilação', nivel: 20, categoria: 'Sacrifício', tipo: 'Ativa',
        custo: '2 ações de ataque', recursoGasto: 'Toda (mínimo 5), e metade da vida atual', recarga: '1 vez por combate', alcance: 'Da arma',
        efeito: 'Um único ataque com +3d10 por Fúria gasta, que ignora 50% da defesa física do alvo.',
        calc: { tipo: 'dano', porPonto: 3, minimo: 5 } },

      { id: 'terremoto', nome: 'Terremoto', nivel: 30, categoria: 'Dano', tipo: 'Ativa',
        custo: '1 ação de ataque', recursoGasto: '2 ou mais', recarga: '3 turnos', alcance: 'Raio 1, +1 a cada 2 Fúria',
        efeito: 'Golpeia o chão: todos os inimigos na área sofrem um ataque com +1d10 por Fúria gasta e caem no chão.',
        calc: { tipo: 'dano', porPonto: 1, minimo: 2 } },
      { id: 'fortaleza_viva', nome: 'Fortaleza Viva', nivel: 30, categoria: 'Defesa', tipo: 'Ativa',
        custo: 'Nenhuma ação', recursoGasto: '3 ou mais', recarga: '4 turnos', alcance: 'Aliados adjacentes',
        efeito: 'Por 2 turnos, você recebe no lugar deles metade do dano que os aliados adjacentes sofreriam, e todo dano que chega em você é reduzido em 10% por Fúria gasta.' },
      { id: 'pacto_de_sangue', nome: 'Pacto de Sangue', nivel: 30, categoria: 'Sacrifício', tipo: 'Ativa',
        custo: 'Nenhuma ação', recursoGasto: 'nenhum, e vida', recarga: '1 vez por combate', alcance: 'Si mesmo',
        efeito: 'Perde 20% da vida atual e enche a Fúria até o máximo.' },
      { id: 'golpe_titanico', nome: 'Golpe Titânico', nivel: 40, categoria: 'Dano', tipo: 'Ativa',
        custo: '2 ações de ataque', recursoGasto: '3 ou mais', recarga: '3 turnos', alcance: 'Da arma',
        efeito: 'Um ataque com +2d10 por Fúria gasta que não pode ser defendido: ignora a defesa no d10 e os escudos do alvo.',
        calc: { tipo: 'dano', porPonto: 2, minimo: 3 } },
      { id: 'vigor_imortal', nome: 'Vigor Imortal', nivel: 40, categoria: 'Cura própria', tipo: 'Passiva',
        custo: '—', recursoGasto: 'nenhum', recarga: '—', alcance: 'Si mesmo',
        efeito: 'No início de cada turno seu, se tiver 3 ou mais Fúria, recupera 5% da vida máxima.' },
      { id: 'berserker_eterno', nome: 'Berserker Eterno', nivel: 40, categoria: 'Sacrifício', tipo: 'Ativa',
        custo: 'Nenhuma ação', recursoGasto: '5 ou mais', recarga: '1 vez por combate', alcance: 'Si mesmo',
        efeito: 'Por 3 turnos, a vida não cai abaixo de 1, você ganha +1 ação de ataque e cada acerto dá +1 Fúria extra. Quando acaba, perde 30% da vida máxima.' },
      { id: 'furia_dos_deuses', nome: 'Fúria dos Deuses', nivel: 50, categoria: 'Dano', tipo: 'Ativa',
        custo: '2 ações de ataque', recursoGasto: 'Toda (mínimo 5)', recarga: '1 vez por combate', alcance: 'Todos os inimigos a até 3 hex',
        efeito: 'Um ataque contra cada inimigo a até 3 hex, cada um com +3d10 por Fúria gasta.',
        calc: { tipo: 'dano', porPonto: 3, minimo: 5 } },
      { id: 'muralha_inquebravel', nome: 'Muralha Inquebrável', nivel: 50, categoria: 'Defesa', tipo: 'Reação',
        custo: '1 reação', recursoGasto: '5', recarga: '1 vez por combate', alcance: 'Você e aliados a até 2 hex',
        efeito: 'Anula todo o dano recebido por você e pelos aliados na área até o início do seu próximo turno.' },
      { id: 'renascimento_guerreiro', nome: 'Renascimento do Guerreiro', nivel: 50, categoria: 'Cura própria', tipo: 'Passiva',
        custo: '—', recursoGasto: 'nenhum', recarga: '1 vez por combate', alcance: 'Si mesmo',
        efeito: 'Na primeira vez que cair a 0 no combate, levanta na hora com 50% da vida máxima e a Fúria cheia.' }
    ]
  },
  {
    id: 'ladino', nome: 'Ladino', categoria: 'destreza', fatorVida: 30, recurso: 'Marca',
    recursoBase: 5,                // máximo de Marcas em cada inimigo
    recursoInicio: 0,
    recursoNoAlvo: true,           // as Marcas ficam nos inimigos, não no ladino
    recursoRegra: 'As Marcas ficam nos inimigos. Cada ataque seu que acerta (o inimigo falha na defesa) coloca 1 Marca no alvo, e um crítico coloca 2. As habilidades consomem as Marcas de um alvo: quanto mais Marcas consumidas, mais forte o efeito. Todas somem no fim do combate.',
    recursoGanhos: [ { rotulo: 'Acerto', valor: 1 }, { rotulo: 'Crítico', valor: 2 } ],
    papel: 'Assassino de alvos frágeis',
    descricao: 'Caçador paciente que marca a presa, some nas sombras e termina o serviço com lâmina ou veneno.',
    armas: 'Armas leves e muito leves, broquéis', armaduras: 'Leves',
    passiva: { nome: 'Golpe pelas Costas', texto: '+1 na chance de crítico ao atacar por um hexágono traseiro ou lateral.' },
    // M = Marcas consumidas do alvo.
    habilidades: [
      // ----- Nível 5 -----
      { id: 'passo_sombrio', nome: 'Passo Sombrio', nivel: 5, categoria: 'Furtividade', tipo: 'Ativa',
        custo: '1 ação de ataque', recursoGasto: '1 ou mais do alvo', recarga: '2 turnos', alcance: '2 hex por Marca',
        efeito: 'Você aparece num hexágono atrás de um inimigo marcado a até 2 hex por Marca consumida, sem ser interceptado, e fica oculto até o fim do turno.' },
      { id: 'golpe_certeiro', nome: 'Golpe Certeiro', nivel: 5, categoria: 'Assassinato', tipo: 'Ativa',
        custo: '1 ação de ataque', recursoGasto: '1 ou mais do alvo', recarga: 'nenhuma', alcance: 'Da arma',
        efeito: 'Um ataque com +1d10 para cada Marca consumida, somados antes de multiplicar pelo nível.',
        calc: { tipo: 'dano', porPonto: 1 } },
      { id: 'lamina_envenenada', nome: 'Lâmina Envenenada', nivel: 5, categoria: 'Veneno', tipo: 'Ativa',
        custo: 'Nenhuma ação', recursoGasto: '1 ou mais do alvo', recarga: '2 turnos', alcance: 'Alvo marcado adjacente',
        efeito: 'O alvo fica envenenado por 1 turno para cada Marca consumida: sofre 1d10 × nível no início de cada turno dele, ignorando a defesa.' },

      // ----- Nível 10 -----
      { id: 'bomba_fumaca', nome: 'Bomba de Fumaça', nivel: 10, categoria: 'Furtividade', tipo: 'Ativa',
        custo: '1 ação de ataque', recursoGasto: '1 a 3 de um alvo', recarga: '3 turnos', alcance: 'Raio 1 ao seu redor',
        efeito: 'Você e os aliados na fumaça ficam ocultos e recebem +1 na chance de defesa por Marca consumida, até o início do seu próximo turno.' },
      { id: 'emboscada', nome: 'Emboscada', nivel: 10, categoria: 'Assassinato', tipo: 'Ativa',
        custo: '1 ação de ataque', recursoGasto: '1 ou mais do alvo', recarga: '2 turnos', alcance: 'Da arma',
        efeito: 'Só estando oculto ou atacando pelas costas. O ataque é crítico automático e recebe +1d10 por Marca consumida.',
        calc: { tipo: 'dano', porPonto: 1 } },
      { id: 'toxina_paralisante', nome: 'Toxina Paralisante', nivel: 10, categoria: 'Veneno', tipo: 'Ativa',
        custo: 'Nenhuma ação', recursoGasto: '2 ou mais do alvo', recarga: '3 turnos', alcance: 'Alvo marcado adjacente',
        efeito: 'No próximo turno do alvo, ele perde 1 ação de ataque a cada 2 Marcas consumidas e 1 hexágono de movimento por Marca.' },

      // ----- Nível 15 -----
      { id: 'evasao_sombria', nome: 'Evasão Sombria', nivel: 15, categoria: 'Furtividade', tipo: 'Reação',
        custo: '1 reação', recursoGasto: '1 ou mais do atacante', recarga: '2 turnos', alcance: 'Si mesmo',
        efeito: 'Quando um inimigo marcado ataca você, consuma as Marcas dele: +2 na chance de defesa contra esse ataque por Marca. Se defender, você se move 1 hexágono e fica oculto.' },
      { id: 'execucao', nome: 'Execução', nivel: 15, categoria: 'Assassinato', tipo: 'Ativa',
        custo: '2 ações de ataque', recursoGasto: 'Todas do alvo (mínimo 3)', recarga: '3 turnos', alcance: 'Da arma',
        efeito: 'Um ataque com +2d10 por Marca consumida. Se depois dele o alvo ficar abaixo de 20% da vida máxima, ele cai na hora.',
        calc: { tipo: 'dano', porPonto: 2, minimo: 3 } },
      { id: 'veneno_contagioso', nome: 'Veneno Contagioso', nivel: 15, categoria: 'Veneno', tipo: 'Ativa',
        custo: '1 ação de ataque', recursoGasto: '2 ou mais do alvo', recarga: '3 turnos', alcance: 'Alvo marcado adjacente',
        efeito: 'Envenena o alvo por 1 turno por Marca consumida (1d10 × nível por turno, ignorando a defesa). O veneno passa para os inimigos adjacentes a ele, com metade dos turnos.' },

      // ----- Nível 20 -----
      { id: 'invisibilidade_perfeita', nome: 'Invisibilidade Perfeita', nivel: 20, categoria: 'Furtividade', tipo: 'Ativa',
        custo: 'Nenhuma ação', recursoGasto: '3 ou mais, de quaisquer inimigos', recarga: '1 vez por combate', alcance: 'Si mesmo',
        efeito: 'Você fica invisível por 1 turno a cada 2 Marcas consumidas (arredondado para cima): inimigos não podem mirar em você, e o primeiro ataque ao sair da invisibilidade é crítico.' },
      { id: 'marca_da_morte', nome: 'Marca da Morte', nivel: 20, categoria: 'Assassinato', tipo: 'Ativa',
        custo: '2 ações de ataque', recursoGasto: 'Todas do alvo (mínimo 5)', recarga: '1 vez por combate', alcance: 'Da arma',
        efeito: 'Um único ataque com +3d10 por Marca consumida que ignora toda a defesa física do alvo.',
        calc: { tipo: 'dano', porPonto: 3, minimo: 5 } },
      { id: 'praga_negra', nome: 'Praga Negra', nivel: 20, categoria: 'Veneno', tipo: 'Ativa',
        custo: '1 ação de ataque', recursoGasto: 'Todas, de todos os inimigos', recarga: '1 vez por combate', alcance: 'Todos os inimigos marcados',
        efeito: 'Cada inimigo marcado sofre 1d10 × nível de dano de veneno por Marca que tiver, ignorando a defesa. Todas as Marcas são consumidas.' },

      { id: 'mestre_sombras', nome: 'Mestre das Sombras', nivel: 30, categoria: 'Furtividade', tipo: 'Passiva',
        custo: '—', recursoGasto: 'nenhum', recarga: '—', alcance: 'Si mesmo',
        efeito: 'Se começar o turno oculto, ganha +1 ação de ataque. Passo Sombrio custa 1 Marca a menos (mínimo 1).' },
      { id: 'golpe_duplo', nome: 'Golpe Duplo', nivel: 30, categoria: 'Assassinato', tipo: 'Ativa',
        custo: '2 ações de ataque', recursoGasto: '2 ou mais do alvo', recarga: '2 turnos', alcance: 'Da arma',
        efeito: 'Dois ataques seguidos no mesmo alvo, cada um com +1d10 por Marca consumida.',
        calc: { tipo: 'dano', porPonto: 1, minimo: 2 } },
      { id: 'veneno_mortal', nome: 'Veneno Mortal', nivel: 30, categoria: 'Veneno', tipo: 'Ativa',
        custo: '1 ação de ataque', recursoGasto: '3 ou mais do alvo', recarga: '3 turnos', alcance: 'Alvo marcado adjacente',
        efeito: 'O alvo sofre 2d10 × nível de veneno no início de cada turno dele, por 1 turno por Marca consumida, ignorando a defesa.' },
      { id: 'clone_sombra', nome: 'Clone de Sombra', nivel: 40, categoria: 'Furtividade', tipo: 'Ativa',
        custo: 'Nenhuma ação', recursoGasto: '3 ou mais, de quaisquer inimigos', recarga: '4 turnos', alcance: 'Adjacente',
        efeito: 'Cria 1 cópia sua a cada 3 Marcas consumidas, por 3 turnos. Os inimigos não sabem qual é você; cada cópia some ao ser atingida.' },
      { id: 'assassinato_perfeito', nome: 'Assassinato Perfeito', nivel: 40, categoria: 'Assassinato', tipo: 'Ativa',
        custo: '2 ações de ataque', recursoGasto: 'Todas do alvo (mínimo 5)', recarga: '3 turnos', alcance: 'Da arma',
        efeito: 'Só contra alvos abaixo de 50% da vida. Ataque com +3d10 por Marca consumida; se derrubar o alvo, as Marcas usadas passam para o inimigo mais próximo.',
        calc: { tipo: 'dano', porPonto: 3, minimo: 5 } },
      { id: 'toxina_enfraquecedora', nome: 'Toxina Enfraquecedora', nivel: 40, categoria: 'Veneno', tipo: 'Ativa',
        custo: 'Nenhuma ação', recursoGasto: '2 ou mais do alvo', recarga: '3 turnos', alcance: 'Alvo marcado adjacente',
        efeito: 'Até o fim do combate, o alvo perde 1 CON e 1 FDV a cada 2 Marcas consumidas, o que baixa as defesas dele.' },
      { id: 'rei_das_sombras', nome: 'Rei das Sombras', nivel: 50, categoria: 'Furtividade', tipo: 'Ativa',
        custo: 'Nenhuma ação', recursoGasto: '3 ou mais, de quaisquer inimigos', recarga: '1 vez por combate', alcance: 'Si mesmo',
        efeito: 'Por 3 turnos, você fica oculto e pode atacar sem se revelar.' },
      { id: 'sentenca_de_morte', nome: 'Sentença de Morte', nivel: 50, categoria: 'Assassinato', tipo: 'Ativa',
        custo: '2 ações de ataque', recursoGasto: 'Todas do alvo (mínimo 5)', recarga: '1 vez por combate', alcance: 'Da arma',
        efeito: 'Se o alvo não for Chefe, ele cai na hora. Contra um Chefe, é um ataque com +4d10 por Marca consumida.',
        calc: { tipo: 'dano', porPonto: 4, minimo: 5 } },
      { id: 'pandemia', nome: 'Pandemia', nivel: 50, categoria: 'Veneno', tipo: 'Ativa',
        custo: '1 ação de ataque', recursoGasto: 'Todas, de todos os inimigos', recarga: '1 vez por combate', alcance: 'Todos os inimigos que você vê',
        efeito: 'Todos os inimigos à vista ganham 2 Marcas e ficam envenenados por 3 turnos, sofrendo 2d10 × nível por turno, ignorando a defesa.' }
    ]
  },
  {
    id: 'arqueiro', nome: 'Arqueiro', categoria: 'destreza', fatorVida: 30, recurso: 'Foco',
    recursoBase: 5,
    recursoInicio: 0,
    recursoPorAcao: true,          // o Foco vem das ações de ataque
    recursoRegra: 'O Foco vem das suas ações de ataque: cada ação gasta mirando, em vez de atirar, vira 1 Foco. Começa cada combate com 0 e pode ser guardado de um turno para o outro, até o máximo. As habilidades gastam Foco: quanto mais, mais forte.',
    recursoGanhos: [ { rotulo: 'Mirar', valor: 1 } ],
    papel: 'Controle à distância',
    descricao: 'Atirador paciente que troca tiros por mira: cada ação guardada vira um disparo mais preciso, mais penetrante ou mais ágil.',
    armas: 'Arcos, bestas e armas leves', armaduras: 'Leves e médias',
    passiva: { nome: 'Olho de Falcão', texto: '+1 hexágono de alcance e ignora cobertura parcial.' },
    // F = Foco gasto.
    habilidades: [
      // ----- Nível 5 -----
      { id: 'olho_treinado', nome: 'Olho Treinado', nivel: 5, categoria: 'Precisão', tipo: 'Ativa',
        custo: 'Junto com um tiro', recursoGasto: '1 ou mais', recarga: 'nenhuma', alcance: 'Da arma',
        efeito: 'O tiro ganha +1 na faixa de crítico do d10 para cada Foco gasto. Com 5 Foco, um arqueiro de faixa 1 crita de 1 a 6.' },
      { id: 'flecha_perfurante', nome: 'Flecha Perfurante', nivel: 5, categoria: 'Perfuração', tipo: 'Ativa',
        custo: 'Junto com um tiro', recursoGasto: '1 a 5', recarga: 'nenhuma', alcance: 'Da arma',
        efeito: 'O tiro ignora 10% da defesa física do alvo para cada Foco gasto (5 Foco = 50%).' },
      { id: 'passo_agil', nome: 'Passo Ágil', nivel: 5, categoria: 'Mobilidade', tipo: 'Ativa',
        custo: 'Nenhuma ação', recursoGasto: '1 ou mais', recarga: 'nenhuma', alcance: 'Si mesmo',
        efeito: 'Move +1 hexágono por Foco gasto sem ser interceptado, e ainda pode atirar no mesmo turno sem penalidade.' },

      // ----- Nível 10 -----
      { id: 'tiro_na_fresta', nome: 'Tiro na Fresta', nivel: 10, categoria: 'Precisão', tipo: 'Ativa',
        custo: 'Junto com um tiro', recursoGasto: '1 ou mais', recarga: '1 turno', alcance: 'Da arma',
        efeito: 'Se o tiro for crítico, o bônus de dano crítico aumenta em +20% para cada Foco gasto.' },
      { id: 'flecha_atravessadora', nome: 'Flecha Atravessadora', nivel: 10, categoria: 'Perfuração', tipo: 'Ativa',
        custo: 'Junto com um tiro', recursoGasto: '1 ou mais', recarga: '2 turnos', alcance: 'Linha até o fim do alcance',
        efeito: 'A flecha atravessa o alvo e acerta mais 1 inimigo na mesma linha para cada Foco gasto, cada um com o dano normal.' },
      { id: 'salto_para_tras', nome: 'Salto para Trás', nivel: 10, categoria: 'Mobilidade', tipo: 'Reação',
        custo: '1 reação', recursoGasto: '1 ou mais', recarga: '2 turnos', alcance: 'Si mesmo',
        efeito: 'Quando um inimigo chega adjacente a você, afaste-se 1 hexágono por Foco gasto. Com 2 ou mais Foco, dispare um tiro normal nele durante o salto.' },

      // ----- Nível 15 -----
      { id: 'mira_letal', nome: 'Mira Letal', nivel: 15, categoria: 'Precisão', tipo: 'Ativa',
        custo: '1 ação de ataque', recursoGasto: '3 ou mais', recarga: '2 turnos', alcance: 'Da arma',
        efeito: 'Um tiro crítico automático, com +1d10 para cada Foco gasto.',
        calc: { tipo: 'dano', porPonto: 1, minimo: 3 } },
      { id: 'quebra_armadura', nome: 'Flecha Quebra-Armadura', nivel: 15, categoria: 'Perfuração', tipo: 'Ativa',
        custo: 'Junto com um tiro', recursoGasto: '1 ou mais', recarga: '2 turnos', alcance: 'Da arma',
        efeito: 'Se acertar, o alvo perde 1 DF de item por Foco gasto até o fim do combate, para todos os atacantes (no máximo −5 por alvo).' },
      { id: 'disparo_corrido', nome: 'Disparo Corrido', nivel: 15, categoria: 'Mobilidade', tipo: 'Ativa',
        custo: 'Nenhuma ação', recursoGasto: '2 ou mais', recarga: '3 turnos', alcance: 'Seu movimento',
        efeito: 'Durante o seu movimento, faz 1 tiro normal a cada 2 Foco gasto, de qualquer hexágono do caminho, sem gastar ações de ataque.' },

      // ----- Nível 20 -----
      { id: 'tiro_do_falcao', nome: 'Tiro do Falcão', nivel: 20, categoria: 'Precisão', tipo: 'Ativa',
        custo: '1 ação de ataque', recursoGasto: 'Todo (mínimo 5)', recarga: '1 vez por combate', alcance: 'O dobro da arma',
        efeito: 'Um tiro crítico automático com +3d10 por Foco gasto e alcance dobrado.',
        calc: { tipo: 'dano', porPonto: 3, minimo: 5 } },
      { id: 'flecha_do_juizo', nome: 'Flecha do Juízo', nivel: 20, categoria: 'Perfuração', tipo: 'Ativa',
        custo: '1 ação de ataque', recursoGasto: 'Todo (mínimo 5)', recarga: '1 vez por combate', alcance: 'Linha até o fim do alcance',
        efeito: 'A flecha atinge todos os inimigos na linha e ignora toda a defesa física deles, com +1d10 por Foco gasto.',
        calc: { tipo: 'dano', porPonto: 1, minimo: 5 } },
      { id: 'vento_fugaz', nome: 'Vento Fugaz', nivel: 20, categoria: 'Mobilidade', tipo: 'Ativa',
        custo: 'Nenhuma ação', recursoGasto: '3 ou mais', recarga: '1 vez por combate', alcance: 'Si mesmo',
        efeito: 'Por 1 turno para cada Foco gasto: +2 de movimento, nenhum inimigo consegue interceptar você e, a cada turno, o primeiro tiro depois de mover ganha +1 na faixa de crítico.' },

      { id: 'olho_de_aguia', nome: 'Olho de Águia', nivel: 30, categoria: 'Precisão', tipo: 'Passiva',
        custo: '—', recursoGasto: 'nenhum', recarga: '—', alcance: 'Si mesmo',
        efeito: 'Seus tiros têm sempre +1 na faixa de crítico. Cada crítico com arco ou besta dá 1 Foco.' },
      { id: 'flecha_explosiva', nome: 'Flecha Explosiva', nivel: 30, categoria: 'Perfuração', tipo: 'Ativa',
        custo: 'Junto com um tiro', recursoGasto: '2 ou mais', recarga: '2 turnos', alcance: 'Da arma, raio 1 a cada 2 Foco',
        efeito: 'A flecha explode: todos na área sofrem o tiro com +1d10 por Foco gasto, ignorando 20% da defesa física.',
        calc: { tipo: 'dano', porPonto: 1, minimo: 2 } },
      { id: 'danca_do_vento', nome: 'Dança do Vento', nivel: 30, categoria: 'Mobilidade', tipo: 'Reação',
        custo: '1 reação', recursoGasto: '1 ou mais', recarga: '2 turnos', alcance: 'Si mesmo',
        efeito: 'Quando for alvo de um ataque, mova 2 hex por Foco gasto. Se sair do alcance do atacante, o ataque erra.' },
      { id: 'mil_flechas', nome: 'Chuva de Mil Flechas', nivel: 40, categoria: 'Precisão', tipo: 'Ativa',
        custo: '2 ações de ataque', recursoGasto: '4 ou mais', recarga: '3 turnos', alcance: 'Da arma, raio 2',
        efeito: 'Cada inimigo na área sofre um tiro com +1d10 por Foco gasto.',
        calc: { tipo: 'dano', porPonto: 1, minimo: 4 } },
      { id: 'flecha_fantasma', nome: 'Flecha Fantasma', nivel: 40, categoria: 'Perfuração', tipo: 'Ativa',
        custo: 'Junto com um tiro', recursoGasto: '3 ou mais', recarga: '2 turnos', alcance: 'Da arma',
        efeito: 'A flecha atravessa paredes e obstáculos, ignora cobertura e escudos, e o alvo não pode rolar defesa no d10.' },
      { id: 'posicao_perfeita', nome: 'Posição Perfeita', nivel: 40, categoria: 'Mobilidade', tipo: 'Ativa',
        custo: 'Nenhuma ação', recursoGasto: '3', recarga: '2 turnos', alcance: 'Até 10 hex que você veja',
        efeito: 'Você aparece no hexágono escolhido, inclusive em lugares altos, e o próximo tiro ganha +1 na faixa de crítico.' },
      { id: 'tiro_impossivel', nome: 'Tiro Impossível', nivel: 50, categoria: 'Precisão', tipo: 'Ativa',
        custo: '1 ação de ataque', recursoGasto: 'Todo (mínimo 5)', recarga: '1 vez por combate', alcance: 'Qualquer alvo que você veja',
        efeito: 'Um tiro crítico automático com +4d10 por Foco gasto, sem limite de alcance.',
        calc: { tipo: 'dano', porPonto: 4, minimo: 5 } },
      { id: 'lanca_do_ceu', nome: 'Lança do Céu', nivel: 50, categoria: 'Perfuração', tipo: 'Ativa',
        custo: '1 ação de ataque', recursoGasto: 'Todo (mínimo 5)', recarga: '1 vez por combate', alcance: 'Linha até onde a vista alcança',
        efeito: 'Atinge todos na linha com +2d10 por Foco gasto, ignorando toda a defesa física e mágica.',
        calc: { tipo: 'dano', porPonto: 2, minimo: 5 } },
      { id: 'vendaval', nome: 'Vendaval', nivel: 50, categoria: 'Mobilidade', tipo: 'Ativa',
        custo: 'Nenhuma ação', recursoGasto: '5', recarga: '1 vez por combate', alcance: 'Si mesmo',
        efeito: 'Por 3 turnos, seu movimento dobra, você ganha +1 ação de ataque e pode atirar em qualquer ponto do caminho.' }
    ]
  },
  {
    id: 'mago', nome: 'Mago', categoria: 'magica', fatorVida: 25, recurso: 'MP',
    recursoBase: 10,
    recursoInicio: 'max',
    recursoRegra: 'Começa cada combate com o MP cheio e não se regenera sozinho. Cada ataque mágico gasto em concentração, sem lançar magia, recupera 1 MP.',
    recursoGanhos: [ { rotulo: 'Concentrar', valor: 1 } ],
    papel: 'Mestre das magias',
    descricao: 'Estudioso que amplia, reescreve e funde magias, pagando cada truque com MP.',
    armas: 'Focos de destruição e focos arcanos', armaduras: 'Leves (mantos e tecidos)',
    passiva: { nome: 'Canalização', texto: 'Cada slot não usado no turno acumula +1d10 no próximo ataque mágico (máximo 3).' },
    // M = MP gasto. As habilidades de Ampliar e Modificar são aplicadas na hora de lançar uma magia equipada.
    // As de Fundir juntam magias equipadas numa só: soma os dados e os efeitos, e a defesa mágica do alvo é subtraída uma vez.
    habilidades: [
      // ----- Nível 5 -----
      { id: 'magia_potencializada', nome: 'Magia Potencializada', nivel: 5, categoria: 'Ampliar', tipo: 'Ativa',
        custo: 'Junto com a magia', recursoGasto: '1 ou mais', recarga: 'nenhuma', alcance: 'Da magia',
        efeito: 'A magia de dano ou cura lançada recebe +1d10 para cada MP gasto, somados antes de multiplicar pelo nível.',
        calc: { tipo: 'magia', porPonto: 1 } },
      { id: 'alcance_estendido', nome: 'Alcance Estendido', nivel: 5, categoria: 'Modificar', tipo: 'Ativa',
        custo: 'Junto com a magia', recursoGasto: '1 ou mais', recarga: 'nenhuma', alcance: 'Da magia + 2 hex por MP',
        efeito: 'A magia ganha +2 hexágonos de alcance por MP gasto. Magias de toque (adjacente) passam a alcançar 2 hex por MP.' },
      { id: 'meditacao_arcana', nome: 'Meditação Arcana', nivel: 5, categoria: 'Mana', tipo: 'Ativa',
        custo: 'Todos os ataques mágicos do turno', recursoGasto: 'nenhum', recarga: '3 turnos', alcance: 'Si mesmo',
        efeito: 'Sem se mover no turno, recupera 1 MP por ataque mágico gasto e mais 2 MP.' },

      // ----- Nível 10 -----
      { id: 'magia_penetrante', nome: 'Magia Penetrante', nivel: 10, categoria: 'Ampliar', tipo: 'Ativa',
        custo: 'Junto com a magia', recursoGasto: '1 a 5', recarga: 'nenhuma', alcance: 'Da magia',
        efeito: 'A magia de dano ignora 10% da defesa mágica do alvo por MP gasto (5 MP = 50%).' },
      { id: 'magia_em_area', nome: 'Magia em Área', nivel: 10, categoria: 'Modificar', tipo: 'Ativa',
        custo: 'Junto com a magia', recursoGasto: '3 ou 6', recarga: '2 turnos', alcance: 'Da magia',
        efeito: 'Uma magia de alvo único passa a atingir o alvo e os hexágonos ao redor: raio 1 com 3 MP, raio 2 com 6 MP. Atinge aliados também.' },
      { id: 'fusao_elemental', nome: 'Fusão Elemental', nivel: 10, categoria: 'Fundir', tipo: 'Ativa',
        custo: '2 ataques mágicos', recursoGasto: '3', recarga: '2 turnos', alcance: 'O menor das duas magias',
        efeito: 'Lança duas magias de dano equipadas como uma só: soma os dados e os efeitos das duas. A defesa mágica do alvo é subtraída uma única vez.',
        exemplos: [
          'Chama + Rajada de Gelo = Vapor Escaldante: 3d10 em cone de 3 hex, e os alvos ficam com −1 de movimento.',
          'Dardo Místico + Chama = Dardo Flamejante: 3d10 a 4 hex, que acerta automaticamente.',
          'Toque Chocante + Toque Vampírico = Dreno Voltaico: 4d10 no adjacente, curando 50% do dano causado.'
        ] },

      // ----- Nível 15 -----
      { id: 'runa_adiada', nome: 'Runa Adiada', nivel: 15, categoria: 'Modificar', tipo: 'Ativa',
        custo: 'Junto com a magia', recursoGasto: '2 ou mais', recarga: '3 turnos', alcance: 'Um hexágono a até 6 hex',
        efeito: 'Em vez de disparar, a magia fica gravada num hexágono e explode quando um inimigo entrar nele. A runa dura 1 turno por MP gasto.' },
      { id: 'convergencia', nome: 'Convergência', nivel: 15, categoria: 'Fundir', tipo: 'Ativa',
        custo: '2 ataques mágicos', recursoGasto: '4', recarga: '3 turnos', alcance: 'Das magias',
        efeito: 'Funde uma magia de dano com uma de proteção ou buff: a de dano atinge os inimigos, e a outra afeta você ou os aliados na mesma área.',
        exemplos: [
          'Toque Chocante + Barreira = Escudo de Faíscas: o alvo leva 2d10 de choque e você ganha a Barreira.',
          'Lança de Relâmpago + Pés Ligeiros = Passo do Relâmpago: o raio atravessa a linha e você se move junto com ele até o fim.',
          'Bola de Fogo + Égide Menor = Chama Protetora: aliados na explosão não levam dano e ganham +2 DM de item por 2 turnos.'
        ] },
      { id: 'eco_de_mana', nome: 'Eco de Mana', nivel: 15, categoria: 'Mana', tipo: 'Passiva',
        custo: '—', recursoGasto: 'nenhum', recarga: '1 vez por turno', alcance: 'Si mesmo',
        efeito: 'Quando uma magia sua derruba um inimigo, você recupera 2 MP.' },

      // ----- Nível 20 -----
      { id: 'magia_suprema', nome: 'Magia Suprema', nivel: 20, categoria: 'Ampliar', tipo: 'Ativa',
        custo: 'Junto com a magia', recursoGasto: 'Todo (mínimo 6)', recarga: '1 vez por combate', alcance: 'Da magia',
        efeito: 'A magia de dano recebe +3d10 por MP gasto e não pode ser defendida, refletida nem cancelada.',
        calc: { tipo: 'magia', porPonto: 3, minimo: 6 } },
      { id: 'triade_arcana', nome: 'Tríade Arcana', nivel: 20, categoria: 'Fundir', tipo: 'Ativa',
        custo: '3 ataques mágicos', recursoGasto: '8', recarga: '1 vez por combate', alcance: 'O maior das três magias',
        efeito: 'Funde três magias equipadas numa só: soma os dados e todos os efeitos, e usa o maior alcance e a maior área entre elas.',
        exemplos: [
          'Chama + Rajada de Gelo + Lança de Relâmpago = Tempestade Elemental: 6d10 numa linha de 5 hex, com −1 de movimento nos alvos.',
          'Bola de Fogo + Toque Vampírico + Prisão de Espinhos = Jardim Carmesim: 5d10 no alvo e ao redor, cura 50% do dano e prende o alvo principal.',
          'Dardo Místico + Chama + Toque Vampírico = Sanguessuga Arcana: 5d10 a 6 hex, acerta automaticamente e cura 50% do dano.'
        ] },
      { id: 'fonte_inesgotavel', nome: 'Fonte Inesgotável', nivel: 20, categoria: 'Mana', tipo: 'Ativa',
        custo: '1 ataque mágico', recursoGasto: 'nenhum', recarga: '1 vez por combate', alcance: 'Si mesmo',
        efeito: 'Recupera metade do MP máximo.' },

      { id: 'ressonancia_arcana', nome: 'Ressonância Arcana', nivel: 30, categoria: 'Ampliar', tipo: 'Ativa',
        custo: 'Junto com a magia', recursoGasto: '1 ou mais', recarga: 'nenhuma', alcance: 'Da magia',
        efeito: 'A magia de dano recebe +1d10 por MP gasto e atinge +1 alvo extra a cada 3 MP.',
        calc: { tipo: 'magia', porPonto: 1 } },
      { id: 'fusao_instavel', nome: 'Fusão Instável', nivel: 30, categoria: 'Fundir', tipo: 'Ativa',
        custo: '2 ataques mágicos', recursoGasto: '4', recarga: '3 turnos', alcance: 'Das magias',
        efeito: 'Funde duas magias de categorias diferentes, como dano com invocação ou utilidade, somando os efeitos.',
        exemplos: [
          'Lobo Espiritual + Chama = Lobo Flamejante: o lobo causa +2d10 de fogo em cada ataque.',
          'Passo Nebuloso + Bola de Fogo = Salto Explosivo: você se teleporta e explode no lugar de onde saiu.',
          'Invisibilidade + Dardo Místico = Dardo Oculto: o dardo vem de lugar nenhum e o alvo fica sem saber onde você está.'
        ] },
      { id: 'fluxo_continuo', nome: 'Fluxo Contínuo', nivel: 30, categoria: 'Mana', tipo: 'Passiva',
        custo: '—', recursoGasto: 'nenhum', recarga: '—', alcance: 'Si mesmo',
        efeito: 'No início de cada turno seu, recupera 1 MP.' },
      { id: 'magia_persistente', nome: 'Magia Persistente', nivel: 40, categoria: 'Modificar', tipo: 'Ativa',
        custo: 'Junto com a magia', recursoGasto: '4 ou mais', recarga: '3 turnos', alcance: 'Da magia',
        efeito: 'A magia de dano repete o efeito na mesma área no início dos seus próximos turnos, por 1 turno a cada 2 MP gastos.' },
      { id: 'grande_fusao', nome: 'Grande Fusão', nivel: 40, categoria: 'Fundir', tipo: 'Ativa',
        custo: '2 ataques mágicos', recursoGasto: '6', recarga: '3 turnos', alcance: 'O dobro da maior área',
        efeito: 'Funde duas magias de dano e dobra a área do resultado.',
        exemplos: [
          'Bola de Fogo + Lança de Relâmpago = Tempestade de Plasma: 5d10 em raio 2 a 6 hex.',
          'Chuva de Meteoros + Rajada de Gelo = Granizo de Pedra: 5d10 em raio 4, e os alvos ficam lentos.',
          'Tempestade de Raios + Toque Vampírico = Raios Famintos: 3 alvos e você cura 50% do dano total.'
        ] },
      { id: 'sifao_de_mana', nome: 'Sifão de Mana', nivel: 40, categoria: 'Mana', tipo: 'Ativa',
        custo: 'Junto com a magia', recursoGasto: 'nenhum', recarga: '2 turnos', alcance: 'Da magia',
        efeito: 'Cada inimigo atingido pela magia de dano devolve 1 MP a você (máximo 5 por magia).' },
      { id: 'arquimagia', nome: 'Arquimagia', nivel: 50, categoria: 'Ampliar', tipo: 'Ativa',
        custo: 'Junto com a magia', recursoGasto: 'Todo (mínimo 10)', recarga: '1 vez por combate', alcance: 'O dobro da magia',
        efeito: 'A magia de dano recebe +3d10 por MP gasto, ignora toda a defesa mágica e tem a área dobrada.',
        calc: { tipo: 'magia', porPonto: 3, minimo: 10 } },
      { id: 'magia_sem_limites', nome: 'Magia sem Limites', nivel: 50, categoria: 'Modificar', tipo: 'Ativa',
        custo: 'Nenhuma ação', recursoGasto: '8', recarga: '1 vez por combate', alcance: 'Si mesmo',
        efeito: 'Por 3 turnos, suas magias não gastam usos.' },
      { id: 'convergencia_absoluta', nome: 'Convergência Absoluta', nivel: 50, categoria: 'Fundir', tipo: 'Ativa',
        custo: '4 ataques mágicos', recursoGasto: '12', recarga: '1 vez por combate', alcance: 'A maior das magias',
        efeito: 'Funde até quatro magias equipadas numa só, somando todos os dados e efeitos.',
        exemplos: [
          'Chama + Rajada de Gelo + Lança de Relâmpago + Dardo Místico = Prisma Elemental: 7d10 em linha, acerta sempre e deixa os alvos lentos.',
          'Inferno + Chuva de Meteoros + Bola de Fogo + Chama = Fim do Mundo: 13d10 em raio 3, queimando o chão por 3 turnos.'
        ] }
    ]
  },
  {
    id: 'clerigo', nome: 'Clérigo', categoria: 'magica', fatorVida: 35, recurso: 'Fé',
    recursoBase: 10,
    recursoInicio: 'max',
    recursoRegra: 'Começa cada combate com a Fé cheia e ela não se regenera sozinha. Gastar juntos 1 ação de ataque e 1 ataque mágico, em oração, recupera 1 Fé.',
    recursoGanhos: [ { rotulo: 'Orar', valor: 1 } ],
    papel: 'Cura e proteção',
    descricao: 'Guardião da fé que fortalece curas e bênçãos, e se mantém de pé quando todos caem.',
    armas: 'Focos sagrados, maças e escudos', armaduras: 'Médias',
    passiva: { nome: 'Bênção', texto: 'Curas em aliados adjacentes também removem uma condição negativa.' },
    // F = Fé gasta. Ampliar e Modificar são usadas junto com uma magia de cura, proteção ou buff equipada.
    habilidades: [
      // ----- Nível 5 -----
      { id: 'graca_abundante', nome: 'Graça Abundante', nivel: 5, categoria: 'Ampliar', tipo: 'Ativa',
        custo: 'Junto com a magia', recursoGasto: '1 ou mais', recarga: 'nenhuma', alcance: 'Da magia',
        efeito: 'A magia de cura recebe +1d10 para cada Fé gasta, somados antes de multiplicar pelo nível.',
        calc: { tipo: 'curaMagia', porPonto: 1 } },
      { id: 'bencao_estendida', nome: 'Bênção Estendida', nivel: 5, categoria: 'Modificar', tipo: 'Ativa',
        custo: 'Junto com a magia', recursoGasto: '1 ou mais', recarga: 'nenhuma', alcance: 'Da magia',
        efeito: 'A magia de buff ou de proteção dura +1 turno para cada Fé gasta.' },
      { id: 'oracao_alivio', nome: 'Oração de Alívio', nivel: 5, categoria: 'Cura própria', tipo: 'Ativa',
        custo: '1 ataque mágico', recursoGasto: '1 ou mais', recarga: '2 turnos', alcance: 'Si mesmo',
        efeito: 'Recupera (FDV + foco + Fé gasta) d10 × nível da própria vida.',
        calc: { tipo: 'curaPropria', porPonto: 1 } },

      // ----- Nível 10 -----
      { id: 'bencao_fortalecida', nome: 'Bênção Fortalecida', nivel: 10, categoria: 'Ampliar', tipo: 'Ativa',
        custo: 'Junto com a magia', recursoGasto: '1 a 5', recarga: 'nenhuma', alcance: 'Da magia',
        efeito: 'O buff fica mais forte: para cada Fé gasta, soma +1 ao valor do efeito (+1d10, +1 hexágono, +1 DF ou DM de item, ou +5%, conforme o buff).' },
      { id: 'cura_irradiante', nome: 'Cura Irradiante', nivel: 10, categoria: 'Modificar', tipo: 'Ativa',
        custo: 'Junto com a magia', recursoGasto: '2 ou 4', recarga: '2 turnos', alcance: 'Da magia',
        efeito: 'Uma magia de cura ou buff de alvo único passa a afetar todos os aliados ao redor do alvo: raio 1 com 2 Fé, raio 2 com 4 Fé. Nunca afeta inimigos.' },
      { id: 'egide_da_fe', nome: 'Égide da Fé', nivel: 10, categoria: 'Proteção própria', tipo: 'Ativa',
        custo: 'Nenhuma ação', recursoGasto: '1 ou mais', recarga: '2 turnos', alcance: 'Si mesmo',
        efeito: 'Até o início do seu próximo turno, você recebe +1 DF e +1 DM de item para cada Fé gasta.' },

      // ----- Nível 15 -----
      { id: 'vinculo_sagrado', nome: 'Vínculo Sagrado', nivel: 15, categoria: 'Modificar', tipo: 'Ativa',
        custo: 'Junto com a magia', recursoGasto: '2', recarga: '2 turnos', alcance: 'Da magia',
        efeito: 'Uma magia de cura, proteção ou buff lançada num aliado também afeta você com o efeito completo.' },
      { id: 'fe_regeneradora', nome: 'Fé Regeneradora', nivel: 15, categoria: 'Cura própria', tipo: 'Ativa',
        custo: 'Nenhuma ação', recursoGasto: '1 ou mais', recarga: '4 turnos', alcance: 'Si mesmo',
        efeito: 'Por um número de turnos igual à Fé gasta, você recupera 1d10 × nível no início de cada turno seu.' },
      { id: 'manto_de_luz', nome: 'Manto de Luz', nivel: 15, categoria: 'Proteção própria', tipo: 'Reação',
        custo: '1 reação', recursoGasto: '1 a 5', recarga: '2 turnos', alcance: 'Si mesmo',
        efeito: 'Quando você é atingido, reduz o dano desse ataque em 20% para cada Fé gasta (5 Fé anula o ataque).' },

      // ----- Nível 20 -----
      { id: 'milagre', nome: 'Milagre', nivel: 20, categoria: 'Ampliar', tipo: 'Ativa',
        custo: 'Junto com a magia', recursoGasto: 'Toda (mínimo 6)', recarga: '1 vez por combate', alcance: 'Da magia',
        efeito: 'A magia de cura recebe +3d10 por Fé gasta, e aliados caídos na área voltam com a vida curada.',
        calc: { tipo: 'curaMagia', porPonto: 3, minimo: 6 } },
      { id: 'ascensao', nome: 'Ascensão', nivel: 20, categoria: 'Cura própria', tipo: 'Ativa',
        custo: 'Nenhuma ação', recursoGasto: '4 ou mais', recarga: '1 vez por combate', alcance: 'Si mesmo',
        efeito: 'Recupera 8% da vida máxima para cada Fé gasta. Por 2 turnos, toda cura que você lançar em aliados também cura você em 50% do valor.' },
      { id: 'santuario_inviolavel', nome: 'Santuário Inviolável', nivel: 20, categoria: 'Proteção própria', tipo: 'Ativa',
        custo: '1 ação de ataque e 1 ataque mágico', recursoGasto: '5 ou 8', recarga: '1 vez por combate', alcance: 'Si mesmo',
        efeito: 'Você não recebe dano nenhum por 1 turno (2 turnos com 8 Fé), mas também não pode atacar. Ainda pode lançar curas e buffs.' },

      { id: 'bencao_transbordante', nome: 'Bênção Transbordante', nivel: 30, categoria: 'Ampliar', tipo: 'Ativa',
        custo: 'Junto com a magia', recursoGasto: '1 ou mais', recarga: 'nenhuma', alcance: 'Da magia',
        efeito: 'A cura recebe +1d10 por Fé gasta, e o que passar da vida máxima vira um escudo que absorve dano até o fim do combate.',
        calc: { tipo: 'curaMagia', porPonto: 1 } },
      { id: 'coral_celeste', nome: 'Coral Celeste', nivel: 30, categoria: 'Modificar', tipo: 'Ativa',
        custo: 'Junto com a magia', recursoGasto: '5', recarga: '3 turnos', alcance: 'Aliados a até 6 hex',
        efeito: 'A próxima magia de cura ou buff afeta todos os aliados a até 6 hex.' },
      { id: 'egide_eterna', nome: 'Égide Eterna', nivel: 30, categoria: 'Proteção própria', tipo: 'Passiva',
        custo: '—', recursoGasto: 'nenhum', recarga: '—', alcance: 'Si mesmo',
        efeito: 'Cada cura que você lança num aliado dá a você +1 DF e +1 DM de item até o seu próximo turno (acumula até +5).' },
      { id: 'dadiva_divina', nome: 'Dádiva Divina', nivel: 40, categoria: 'Ampliar', tipo: 'Ativa',
        custo: 'Junto com a magia', recursoGasto: '6', recarga: '3 turnos', alcance: 'Da magia',
        efeito: 'O buff dura até o fim do combate.' },
      { id: 'coracao_sagrado', nome: 'Coração Sagrado', nivel: 40, categoria: 'Cura própria', tipo: 'Passiva',
        custo: '—', recursoGasto: 'nenhum', recarga: '—', alcance: 'Si mesmo',
        efeito: 'Enquanto tiver pelo menos 1 Fé, recupera 1d10 × nível no início de cada turno seu.' },
      { id: 'julgamento_ceus', nome: 'Julgamento dos Céus', nivel: 40, categoria: 'Proteção própria', tipo: 'Reação',
        custo: '1 reação', recursoGasto: '3 ou mais', recarga: '3 turnos', alcance: 'Si mesmo',
        efeito: 'Quando for atingido, anula o dano e devolve esse mesmo valor ao atacante como dano mágico sagrado.' },
      { id: 'milagre_coletivo', nome: 'Milagre Coletivo', nivel: 50, categoria: 'Modificar', tipo: 'Ativa',
        custo: 'Junto com a magia', recursoGasto: '10', recarga: '1 vez por combate', alcance: 'Da magia',
        efeito: 'A próxima magia de cura também levanta os aliados caídos na área e remove todas as condições negativas.' },
      { id: 'imortalidade_fe', nome: 'Imortalidade da Fé', nivel: 50, categoria: 'Cura própria', tipo: 'Passiva',
        custo: '—', recursoGasto: 'nenhum', recarga: '1 vez por combate', alcance: 'Si mesmo',
        efeito: 'Na primeira vez que cair a 0 no combate, volta na hora com a vida cheia.' },
      { id: 'avatar_da_luz', nome: 'Avatar da Luz', nivel: 50, categoria: 'Proteção própria', tipo: 'Ativa',
        custo: 'Nenhuma ação', recursoGasto: 'Toda (mínimo 8)', recarga: '1 vez por combate', alcance: 'Si mesmo',
        efeito: 'Por 3 turnos, o dano que você recebe cai 10% por Fé gasta (máximo 90%), e aliados adjacentes recuperam 1d10 × nível no início de cada turno seu.' }
    ]
  }
];

/* ---------- TIERS ---------- */
const TIERS = {
  comum:    { nome: 'Comum',    cor: '#6d5a40' },
  raro:     { nome: 'Raro',     cor: '#2c5a8c' },
  perfeito: { nome: 'Perfeito', cor: '#6a3d93' },
  lendario: { nome: 'Lendário', cor: '#a8761c' },
  unico:    { nome: 'Único',    cor: '#8e1b1b' }
};

/* ---------- CATEGORIAS DE ARMA ----------
   acoesExtra = ações de ataque a mais por turno
   custo      = ações de ataque gastas em cada ataque
------------------------------------------------ */
const CATEGORIAS_ARMA = {
  desarmado:    { nome: 'Desarmado',    acoesExtra: 0, custo: 1, forMin: 0 },
  muito_leve:   { nome: 'Muito leve',   acoesExtra: 1, custo: 1, forMin: 0 },
  leve:         { nome: 'Leve',         acoesExtra: 0, custo: 1, forMin: 0 },
  media:        { nome: 'Média',        acoesExtra: 0, custo: 1, forMin: 2 },
  pesada:       { nome: 'Pesada',       acoesExtra: 0, custo: 1, forMin: 4 },
  muito_pesada: { nome: 'Muito pesada', acoesExtra: 0, custo: 2, forMin: 5 },
  foco:         { nome: 'Foco mágico',  acoesExtra: 0, custo: 1, forMin: 0 }
};

/* Coleções de itens especiais (campo opcional "colecao"):
   'semideus' = itens dos semideuses de cada raça (raríssimos)
   'cidade'   = trabalho típico de cada cidade ou reino
   'monstro'  = itens únicos que caem de monstros de dificuldade 3 ou mais
   tema, historia e desvantagem também são opcionais. */
const COLECOES = { semideus: 'Semideuses', cidade: 'Cidades e lugares', monstro: 'Monstros' };

/* ---------- ARMAS ----------
   dados = quantidade de d10 do dano físico da arma
   foco  = 'destruicao' | 'arcano' | 'sagrado' (só para armas mágicas)
   bonus = { dadoMagico, dadoCura, slots, ignoraDF, ... }
------------------------------------------------ */
const ARMAS = [
  // Comuns
  { id: 'adaga',          nome: 'Adaga',              tier: 'comum', categoria: 'muito_leve',   maos: 1, dados: 1, peso: 1, alcance: 1, efeito: '' },
  { id: 'espada_curta',   nome: 'Espada Curta',       tier: 'comum', categoria: 'leve',         maos: 1, dados: 1, peso: 2, alcance: 1, efeito: '' },
  { id: 'espada_longa',   nome: 'Espada Longa',       tier: 'comum', categoria: 'media',        maos: 1, dados: 2, peso: 3, alcance: 1, efeito: '' },
  { id: 'maca_ferro',     nome: 'Maça de Ferro',      tier: 'comum', categoria: 'media',        maos: 1, dados: 2, peso: 3, alcance: 1, efeito: '' },
  { id: 'machado_batalha',nome: 'Machado de Batalha', tier: 'comum', categoria: 'pesada',       maos: 2, dados: 3, peso: 6, alcance: 1, efeito: '' },
  { id: 'martelo_guerra', nome: 'Martelo de Guerra',  tier: 'comum', categoria: 'muito_pesada', maos: 2, dados: 5, peso: 9, alcance: 1, efeito: '' },
  { id: 'arco_curto',     nome: 'Arco Curto',         tier: 'comum', categoria: 'leve',         maos: 2, dados: 1, peso: 2, alcance: 5, efeito: '' },
  { id: 'arco_longo',     nome: 'Arco Longo',         tier: 'comum', categoria: 'media',        maos: 2, dados: 2, peso: 3, alcance: 8, efeito: '' },
  { id: 'besta_pesada',   nome: 'Besta Pesada',       tier: 'comum', categoria: 'pesada',       maos: 2, dados: 3, peso: 6, alcance: 6, efeito: 'Não pode mover e atirar no mesmo turno.' },
  { id: 'cajado_carvalho',nome: 'Cajado de Carvalho', tier: 'comum', categoria: 'foco', foco: 'destruicao', maos: 2, dados: 1, peso: 3, alcance: 1, efeito: '+1d10 no dano mágico.', bonus: { dadoMagico: 1 } },
  { id: 'varinha_freixo', nome: 'Varinha de Freixo',  tier: 'comum', categoria: 'foco', foco: 'arcano',     maos: 1, dados: 0, peso: 1, alcance: 1, efeito: '+2 slots de magia.', bonus: { slots: 2 } },
  { id: 'simbolo_prata',  nome: 'Símbolo Sagrado de Prata', tier: 'comum', categoria: 'foco', foco: 'sagrado', maos: 1, dados: 0, peso: 1, alcance: 1, efeito: '+1d10 nas curas.', bonus: { dadoCura: 1 } },

  // Raras
  { id: 'presa_lobo',      nome: 'Presa do Lobo Cinzento', tier: 'raro', categoria: 'muito_leve',   maos: 1, dados: 2, peso: 1, alcance: 1, efeito: 'Em crítico, o alvo sangra 1d10 × nível por 2 turnos.' },
  { id: 'lamina_duelista', nome: 'Lâmina do Duelista',     tier: 'raro', categoria: 'leve',         maos: 1, dados: 2, peso: 2, alcance: 1, efeito: 'Ao derrubar um inimigo, ganha 1 ataque extra imediato.' },
  { id: 'espada_juramento',nome: 'Espada do Juramento',    tier: 'raro', categoria: 'media',        maos: 1, dados: 3, peso: 3, alcance: 1, efeito: '+10% de dano contra alvos acima de 50% da vida.' },
  { id: 'machado_fende',   nome: 'Machado Fende-Elmos',    tier: 'raro', categoria: 'pesada',       maos: 2, dados: 4, peso: 6, alcance: 1, efeito: 'Ignora 20% da defesa física.', bonus: { ignoraDF: 0.2 } },
  { id: 'martelo_terremoto',nome: 'Martelo do Terremoto',  tier: 'raro', categoria: 'muito_pesada', maos: 2, dados: 6, peso: 9, alcance: 1, efeito: 'Empurra o alvo 1 hexágono.' },
  { id: 'arco_teixo',      nome: 'Arco de Teixo Élfico',   tier: 'raro', categoria: 'media',        maos: 2, dados: 3, peso: 3, alcance: 9, efeito: 'Sem penalidade ao atirar depois de mover.' },
  { id: 'cajado_centelha', nome: 'Cajado da Centelha',     tier: 'raro', categoria: 'foco', foco: 'destruicao', maos: 2, dados: 1, peso: 3, alcance: 1, efeito: '+2d10 no dano mágico; magias de dano ganham +1 hexágono de alcance.', bonus: { dadoMagico: 2 } },
  { id: 'grimorio_viajante',nome: 'Grimório do Viajante',  tier: 'raro', categoria: 'foco', foco: 'arcano',     maos: 1, dados: 0, peso: 2, alcance: 1, efeito: '+3 slots de magia.', bonus: { slots: 3 } },
  { id: 'relicario_martir',nome: 'Relicário do Mártir',    tier: 'raro', categoria: 'foco', foco: 'sagrado',    maos: 1, dados: 0, peso: 1, alcance: 1, efeito: '+2d10 nas curas; ao curar um aliado, você recupera 25% do valor.', bonus: { dadoCura: 2 } },

  // ===== Semideuses =====
  { id: 'lamina_mil_formas', nome: 'Lâmina das Mil Formas', tier: 'unico', categoria: 'media', maos: 1, dados: 6, peso: 3, alcance: 1,
    colecao: 'semideus', tema: 'Valgor, semideus dos humanos', atributos: { DEX: 1, AGI: 1 },
    efeito: 'Uma vez por turno, o portador escolhe se ela conta como arma leve, média ou pesada, com as regras de ações da categoria. Nos 3 primeiros turnos de cada batalha, soma +2d10 no dano.',
    historia: 'Forjada para o semideus dos humanos, que nunca foi o mais forte, só o que mais rápido aprendia. A lâmina muda de forma como ele mudava de ideia.',
    desvantagem: 'A partir do 4º turno da batalha, o brilho apaga e ela causa −1d10 de dano.' },
  { id: 'bigorna_martelo', nome: 'Bigorna-Martelo da Forja Primeira', tier: 'unico', categoria: 'muito_pesada', maos: 2, dados: 9, peso: 25, alcance: 1,
    colecao: 'semideus', tema: 'Semideus dos anões', atributos: { FOR: 2 },
    efeito: 'Cada acerto reforja a armadura de um aliado adjacente: ele ganha +1 DF de item até o fim da batalha (máximo +5 por aliado).',
    historia: 'O semideus dos anões não lutava com espada. Lutava com a bigorna em que forjou as primeiras armas dos mortais.',
    desvantagem: 'Pesa 25 kg, e enquanto a empunha o portador não consegue lançar magias.' },
  { id: 'arco_da_recusa', nome: 'Arco da Recusa', tier: 'unico', categoria: 'media', maos: 2, dados: 6, peso: 2, alcance: 12,
    colecao: 'semideus', tema: 'Semideus dos elfos', atributos: { DEX: 2, PER: 1 },
    efeito: 'Criaturas da Marca do Deus Marcado não rolam defesa contra as flechas dele e sofrem +3d10.',
    historia: 'Quando o Deus Único mandou os elfos desaparecerem, este arco disparou a primeira flecha da rebelião. A madeira nunca apodreceu, como os elfos que o fizeram.',
    desvantagem: 'Criaturas da Marca do Deus Marcado sentem o arco a 1 km e sempre atacam o portador primeiro.' },
  { id: 'faca_sorridente', nome: 'Faca Sorridente de Tobi', tier: 'unico', categoria: 'muito_leve', maos: 1, dados: 5, peso: 1, alcance: 1,
    colecao: 'semideus', tema: 'Tobi, semideus dos goblins', atributos: { AGI: 1, PER: 2 },
    efeito: 'Cada crítico rouba do alvo um item pequeno ou 1d10 moedas, à escolha do mestre.',
    historia: 'Tobi foi o rascunho que os elfos esqueceram de apagar. Ninguém sabe como um goblin virou semideus, e Tobi prefere que continue assim.',
    desvantagem: 'A faca ri alto quando corta: o portador nunca consegue ficar oculto.' },
  { id: 'presa_lanca_serpente', nome: 'Presa-Lança da Primeira Muda', tier: 'unico', categoria: 'media', maos: 1, dados: 6, peso: 3, alcance: 2,
    colecao: 'semideus', tema: 'Semideus dos serpentarianos', atributos: { DEX: 1, AGI: 1 },
    obtencao: 'Relíquia do Templo de S\'ssara. Só sai de lá por ordem da sacerdotisa.',
    efeito: 'Alcance de 2 hex. Cada acerto envenena: 2d10 × nível no início dos próximos 2 turnos do alvo, ignorando a defesa.',
    historia: 'Feita da presa que o semideus serpentariano perdeu na primeira troca de pele, ainda perto da cabeça de Jurgmund.',
    desvantagem: 'O portador fica lento no frio: em lugares gelados, perde 1 ação de ataque por turno.' },
  { id: 'cetro_brasa_viva', nome: 'Cetro de Brasa Viva', tier: 'lendario', categoria: 'foco', foco: 'destruicao', maos: 2, dados: 1, peso: 3, alcance: 1,
    colecao: 'semideus', tema: 'Semideus dos karlachs', atributos: { INT: 1 }, bonus: { dadoMagico: 4 },
    obtencao: 'Relíquia sagrada da Cidade de Karlach. Só o conselho da cidade decide quem pode levá-la.',
    efeito: '+4d10 no dano mágico. Magias de dano deixam o chão queimando por 2 turnos: 1d10 × nível para quem começar o turno nele.' },

  // ===== Cidades =====
  { id: 'alabarda_verdom', nome: 'Alabarda da Guarda de Verdom', tier: 'perfeito', categoria: 'pesada', maos: 2, dados: 5, peso: 7, alcance: 2,
    colecao: 'cidade', tema: 'Verdom', atributos: { FOR: 1 },
    efeito: 'A arma das muralhas de Verdom. Alcance de 2 hex. Inimigos que entram no alcance sofrem um ataque de graça, uma vez por turno.' },
  { id: 'machado_grande_reino', nome: 'Machado do Grande Reino', tier: 'lendario', categoria: 'muito_pesada', maos: 2, dados: 8, peso: 10, alcance: 1,
    colecao: 'cidade', tema: 'Grande Reino dos Orcs', atributos: { FOR: 1, CON: 1 },
    efeito: 'Ao derrubar um inimigo, o portador solta o grito de guerra orc: todos os aliados a até 4 hex somam +1d10 no próximo ataque.' },
  { id: 'lanca_vidro_rubro', nome: 'Lança de Vidro Rubro', tier: 'perfeito', categoria: 'media', maos: 1, dados: 4, peso: 3, alcance: 2,
    colecao: 'cidade', tema: 'Cidade de Karlach', atributos: { PER: 1 }, bonus: { ignoraDF: 0.1 },
    efeito: 'Feita de cristal carmesim purificado. Ignora 10% da defesa física e causa +2d10 em constructos de cristal.' },
  { id: 'sabre_korgara', nome: 'Sabre do Corsário de Korgara', tier: 'perfeito', categoria: 'leve', maos: 1, dados: 3, peso: 2, alcance: 1,
    colecao: 'cidade', tema: 'Costa de Korgara', atributos: { AGI: 1 },
    efeito: 'Em barcos, na água rasa ou em terreno instável, o portador não sofre penalidade e ganha +1 na chance de defesa.' },

  // ===== Monstros =====
  { id: 'lanca_ferrao_wyvern', nome: 'Lança-Ferrão de Wyvern', tier: 'lendario', categoria: 'media', maos: 1, dados: 5, peso: 4, alcance: 2,
    colecao: 'monstro', tema: 'Wyvern',
    efeito: 'Alcance de 2 hex. Cada acerto envenena: 2d10 × nível no início dos próximos 2 turnos do alvo, ignorando a defesa.' },
  { id: 'arco_espinhos_manticora', nome: 'Arco de Espinhos da Mantícora', tier: 'lendario', categoria: 'media', maos: 2, dados: 5, peso: 3, alcance: 10,
    colecao: 'monstro', tema: 'Mantícora', atributos: { DEX: 1 },
    efeito: 'Duas vezes por batalha, dispara uma rajada de espinhos: um tiro completo em até 3 alvos diferentes.' },

  // ===== Reino de Verdom =====
  { id: 'espada_castelo_verdom', nome: 'Espada do Castelo de Verdom', tier: 'lendario', categoria: 'media', maos: 1, dados: 5, peso: 3, alcance: 1,
    colecao: 'cidade', tema: 'Verdom', atributos: { FOR: 1, CAR: 1 },
    obtencao: 'Recompensa do rei de Verdom por um grande serviço ao reino.',
    efeito: 'Dada aos cavaleiros da maior cidade humana. Aliados humanos a até 3 hex do portador recebem +1 na chance de defesa.' },
  { id: 'simbolo_igreja_jurgmund', nome: 'Símbolo da Igreja do Jurgmund', tier: 'perfeito', categoria: 'foco', foco: 'sagrado', maos: 1, dados: 0, peso: 1, alcance: 1,
    colecao: 'cidade', tema: 'Verdom, Igreja do Jurgmund', atributos: { FDV: 1 }, bonus: { dadoCura: 3 },
    efeito: '+3d10 nas curas. Curas também removem veneno, e criaturas da Marca do Deus Marcado a até 1 hex do alvo sofrem 1d10 × nível.' },
  { id: 'arco_guarda_vernand', nome: 'Arco dos Guardas-Florestais de Vernand', tier: 'perfeito', categoria: 'media', maos: 2, dados: 4, peso: 3, alcance: 10,
    colecao: 'cidade', tema: 'Vernand', atributos: { PER: 1 },
    efeito: 'Na floresta, o portador fica oculto até o primeiro tiro do combate e ignora a cobertura das árvores.' },
  { id: 'lamina_terra_perdida', nome: 'Lâmina da Terra Perdida', tier: 'lendario', categoria: 'leve', maos: 1, dados: 4, peso: 2, alcance: 1,
    colecao: 'cidade', tema: 'Vernand', atributos: { DEX: 1, AGI: 1 },
    obtencao: 'Dada pelo senhor de Vernand a quem ajudar a cidade a recuperar parte das terras perdidas.',
    efeito: 'Forjada em Vernand depois que a cidade perdeu terras para Verdom. Contra o último inimigo que causou dano ao portador, soma +2d10.' },
  { id: 'rubra_vermilion', nome: 'Rubra, a Última Espada de Vermilion', tier: 'unico', categoria: 'pesada', maos: 2, dados: 7, peso: 6, alcance: 1,
    colecao: 'cidade', tema: 'Ruínas de Vermilion', atributos: { FOR: 1, PER: 1 },
    efeito: 'Causa +2d10 em mortos-vivos, e contra eles o crítico sai de 1 a 3 no d10.',
    historia: 'A espada do último capitão de Vermilion, a cidade sobre a qual Verdom foi construída. Ninguém sabe o que destruiu Vermilion. A espada sabe, e às vezes tenta contar em sonhos.',
    desvantagem: 'Os mortos de Vermilion reconhecem a espada: nas ruínas, todos eles atacam o portador primeiro.' },

  // ===== Deserto de Karlach =====
  { id: 'arpao_kurnamin', nome: 'Arpão de Kurnamin', tier: 'perfeito', categoria: 'media', maos: 1, dados: 4, peso: 4, alcance: 3,
    colecao: 'cidade', tema: 'Kurnamin', atributos: { FOR: 1 },
    efeito: 'Alcance de 3 hex. Causa +2d10 em criaturas colossais e marinhas. Se acertar, uma corda prende o alvo: criaturas grandes ou menores não conseguem se afastar mais de 3 hex do portador.' },
  { id: 'cajado_volterion', nome: 'Cajado de Madeira Negra de Volterion', tier: 'lendario', categoria: 'foco', foco: 'destruicao', maos: 2, dados: 1, peso: 3, alcance: 1,
    colecao: 'monstro', tema: 'Árvore Oca de Volterion', atributos: { INT: 1 }, bonus: { dadoMagico: 3 },
    efeito: '+3d10 no dano mágico. Quando uma magia de dano crita, raízes prendem o alvo e ele não se move no próximo turno.' },

  // ===== Grande Reino dos Orcs =====
  { id: 'ancora_mangual', nome: 'Âncora-Mangual da Baía', tier: 'perfeito', categoria: 'muito_pesada', maos: 2, dados: 7, peso: 12, alcance: 2,
    colecao: 'cidade', tema: 'Baía de Lonk-Carn', atributos: { FOR: 1 },
    efeito: 'Uma âncora velha presa numa corrente. Alcance de 2 hex, e cada acerto puxa o alvo 1 hex para perto do portador.' },
  { id: 'correntes_carcereiro', nome: 'Correntes do Carcereiro', tier: 'lendario', categoria: 'leve', maos: 1, dados: 4, peso: 4, alcance: 3,
    colecao: 'monstro', tema: 'O Carcereiro de Gornark', atributos: { DEX: 1 },
    efeito: 'Alcance de 3 hex. Duas vezes por batalha, um acerto prende o alvo: ele não se move no próximo turno.' },
  { id: 'roca_bruxa', nome: 'Roca Maldita da Bruxa', tier: 'lendario', categoria: 'foco', foco: 'arcano', maos: 1, dados: 0, peso: 2, alcance: 1,
    colecao: 'monstro', tema: 'A Bruxa do Moinho', atributos: { INT: 1 }, bonus: { slots: 3, dadoMagico: 1 },
    efeito: '+3 slots de magia e +1d10 no dano mágico. Uma vez por batalha, fia uma maldição num alvo a até 6 hex: ele faz teste de FDV ou vira um sapo inofensivo até o fim do próximo turno.' },
  { id: 'relicario_deus_marcado', nome: 'Relicário do Deus Marcado', tier: 'unico', categoria: 'foco', foco: 'sagrado', maos: 1, dados: 0, peso: 2, alcance: 1,
    colecao: 'monstro', tema: 'O Grande Clérigo do Deus Marcado', atributos: { FDV: 2 }, bonus: { dadoCura: 5 },
    efeito: '+5d10 nas curas. Quando o portador cura alguém, todos os inimigos adjacentes ao alvo sofrem o mesmo valor como dano mágico.',
    historia: 'Um fragmento da essência do Deus Marcado, preso num relicário de ouro escurecido. O Grande Clérigo rezava para ele toda noite, e ele respondia.',
    desvantagem: 'Os Araltos e as criaturas carmesins sentem o fragmento. Uma vez por sessão, o portador faz um teste de FDV; se falhar, ganha 1 Marca Carmesim que só sai com Purificação.' },

  // ===== Grande Ilha de Tortumaga =====
  { id: 'martelo_estaleiro', nome: 'Martelo de Estaleiro de Porto Tortuoso', tier: 'perfeito', categoria: 'pesada', maos: 2, dados: 5, peso: 7, alcance: 1,
    colecao: 'cidade', tema: 'Porto Tortuoso', atributos: { CON: 1 },
    efeito: 'Os anões do casco pregam navios com ele. Causa +2d10 em constructos e em qualquer coisa de madeira, e um crítico derruba o alvo.' },
  { id: 'fisga_goblin_verde', nome: 'Fisga dos Goblins Verdes', tier: 'perfeito', categoria: 'muito_leve', maos: 1, dados: 2, peso: 1, alcance: 6,
    colecao: 'cidade', tema: 'Goblins Verdes', atributos: { AGI: 1 },
    efeito: 'Alcance de 6 hex. Atira pedras, frutas podres e o que mais tiver à mão. Um crítico acerta no olho: o alvo tem −2 na chance de defesa no próximo turno.' },
  { id: 'lanca_da_entrada', nome: 'Lança da Entrada', tier: 'lendario', categoria: 'media', maos: 1, dados: 5, peso: 3, alcance: 2,
    colecao: 'monstro', tema: 'A Guardiã da Entrada', atributos: { AGI: 1 },
    efeito: 'Feita de um dente da Guardiã. Alcance de 2 hex. O portador ataca normalmente debaixo da água e causa +2d10 em criaturas aquáticas.' },

  // ===== Montanhas de Atrelon =====
  { id: 'lanca_real_vassk', nome: 'Lança da Guarda Real de Vassk', tier: 'perfeito', categoria: 'media', maos: 1, dados: 4, peso: 3, alcance: 2,
    colecao: 'cidade', tema: 'Cidade de Atrelon', atributos: { DEX: 1 },
    efeito: 'Alcance de 2 hex. Em terreno de neve ou gelo, o portador não sofre penalidade de movimento e soma +1 na chance de defesa.' },
  { id: 'machado_forte_jurgmund', nome: 'Machado do Forte de Jurgmund', tier: 'perfeito', categoria: 'pesada', maos: 2, dados: 5, peso: 6, alcance: 1,
    colecao: 'cidade', tema: 'Forte de Jurgmund', atributos: { CON: 1 },
    efeito: 'Forjado dentro da montanha. Causa +2d10 em criaturas de gelo e de pedra.' },
  { id: 'lamina_batalha_colossal', nome: 'Lâmina da Batalha Colossal', tier: 'unico', categoria: 'media', maos: 1, dados: 7, peso: 3, alcance: 1,
    colecao: 'monstro', tema: 'O Aralto Ancião', atributos: { FOR: 1, FDV: 1 },
    efeito: 'Causa +3d10 em criaturas da Marca do Deus Marcado e em Araltos. Uma vez por batalha, um acerto apaga todas as Marcas Carmesins de um aliado adjacente.',
    historia: 'Um Aralto a empunhou contra os cinco heróis na Batalha Colossal, 500 anos atrás. Ele perdeu, fugiu, e guardou a espada para a revanche.',
    desvantagem: 'A espada ainda lembra do dono: uma vez por sessão, o portador sonha com o Deus Marcado e acorda sem o recurso da classe.' },

  // ===== Forja: raros e perfeitos =====
  { id: 'estilete_sombrio', nome: 'Estilete Sombrio', tier: 'raro', categoria: 'muito_leve', maos: 1, dados: 2, peso: 1, alcance: 1, efeito: 'Contra alvos que não viram o portador (oculto ou pelas costas), +1 na faixa de crítico.' },
  { id: 'sabre_vento', nome: 'Sabre do Vento', tier: 'raro', categoria: 'leve', maos: 1, dados: 2, peso: 2, alcance: 1, efeito: 'Depois de atacar, o portador pode mover 1 hex sem ser interceptado.' },
  { id: 'besta_mao', nome: 'Besta de Mão', tier: 'raro', categoria: 'leve', maos: 1, dados: 2, peso: 2, alcance: 5, efeito: 'Alcance de 5 hex. Pode atirar depois de mover sem penalidade.' },
  { id: 'espada_bastarda', nome: 'Espada Bastarda', tier: 'raro', categoria: 'media', maos: 1, dados: 3, peso: 4, alcance: 1, efeito: 'Se a mão secundária estiver vazia, empunhada com as duas mãos causa +1d10.' },
  { id: 'maca_consagrada', nome: 'Maça Consagrada', tier: 'raro', categoria: 'media', maos: 1, dados: 3, peso: 3, alcance: 1, efeito: 'Causa +1d10 em mortos-vivos e demônios.' },
  { id: 'arco_composto', nome: 'Arco Composto', tier: 'raro', categoria: 'media', maos: 2, dados: 3, peso: 3, alcance: 8, efeito: 'Alcance de 8 hex. Contra alvos a 6 hex ou mais, +1 na faixa de crítico.' },
  { id: 'lanca_cavaleiro', nome: 'Lança de Cavaleiro', tier: 'raro', categoria: 'pesada', maos: 2, dados: 4, peso: 6, alcance: 2, efeito: 'Alcance de 2 hex. Depois de mover 3 hex ou mais em linha reta no turno, o primeiro ataque causa +1d10.' },
  { id: 'marreta_quebra_escudo', nome: 'Marreta Quebra-Escudo', tier: 'raro', categoria: 'muito_pesada', maos: 2, dados: 6, peso: 10, alcance: 1, efeito: 'Se acertar um alvo com escudo, ele perde o bônus do escudo até o fim do próximo turno.' },
  { id: 'orbe_gelo', nome: 'Orbe de Gelo Eterno', tier: 'raro', categoria: 'foco', foco: 'destruicao', maos: 1, dados: 0, peso: 1, alcance: 1, bonus: { dadoMagico: 2 }, efeito: '+2d10 no dano mágico. Magias de dano deixam o alvo com −1 de movimento no próximo turno.' },
  { id: 'varinha_espinhos', nome: 'Varinha de Espinheiro', tier: 'raro', categoria: 'foco', foco: 'arcano', maos: 1, dados: 0, peso: 1, alcance: 1, bonus: { slots: 2, dadoMagico: 1 }, efeito: '+2 slots de magia e +1d10 no dano mágico.' },
  { id: 'rosario_peregrino', nome: 'Rosário do Peregrino', tier: 'raro', categoria: 'foco', foco: 'sagrado', maos: 1, dados: 0, peso: 1, alcance: 1, bonus: { dadoCura: 2 }, efeito: '+2d10 nas curas. Curas em alvos abaixo de 25% da vida recuperam mais 1d10.' },
  { id: 'punhal_gemeo', nome: 'Punhais Gêmeos', tier: 'perfeito', categoria: 'muito_leve', maos: 1, dados: 3, peso: 2, alcance: 1, atributos: { AGI: 1 }, efeito: 'Críticos causam sangramento: 1d10 × nível no início do próximo turno do alvo.' },
  { id: 'rapieira_duelista', nome: 'Rapieira de Duelo', tier: 'perfeito', categoria: 'leve', maos: 1, dados: 3, peso: 2, alcance: 1, atributos: { DEX: 1 }, efeito: '+1 na chance de defesa contra ataques corpo a corpo.' },
  { id: 'espada_runica', nome: 'Espada Rúnica', tier: 'perfeito', categoria: 'media', maos: 1, dados: 4, peso: 3, alcance: 1, atributos: { FOR: 1 }, efeito: 'Cada acerto causa +1d10 de dano mágico extra, calculado contra a DM do alvo.' },
  { id: 'mangual_espinhos', nome: 'Mangual de Espinhos', tier: 'perfeito', categoria: 'media', maos: 1, dados: 4, peso: 4, alcance: 1, atributos: { FOR: 1 }, efeito: 'A corrente contorna escudos: o alvo não soma o bônus de escudo na chance de defesa.' },
  { id: 'arco_cacador', nome: 'Arco do Caçador', tier: 'perfeito', categoria: 'media', maos: 2, dados: 4, peso: 3, alcance: 10, atributos: { PER: 1 }, efeito: 'Alcance de 10 hex. Causa +1d10 em feras e monstruosidades.' },
  { id: 'montante_carrasco', nome: 'Montante do Carrasco', tier: 'perfeito', categoria: 'pesada', maos: 2, dados: 5, peso: 7, alcance: 1, atributos: { FOR: 1 }, bonus: { ignoraDF: 0.1 }, efeito: 'Ignora 10% da defesa física. Contra alvos abaixo de 25% da vida, +1 na faixa de crítico.' },
  { id: 'besta_pesada_ana', nome: 'Besta Pesada Anã', tier: 'perfeito', categoria: 'pesada', maos: 2, dados: 5, peso: 6, alcance: 8, atributos: { DEX: 1 }, bonus: { ignoraDF: 0.2 }, efeito: 'Alcance de 8 hex. Ignora 20% da defesa física, mas não pode mover e atirar no mesmo turno.' },
  { id: 'martelo_trovao', nome: 'Martelo do Trovão', tier: 'perfeito', categoria: 'muito_pesada', maos: 2, dados: 7, peso: 10, alcance: 1, atributos: { FOR: 1 }, efeito: 'Um crítico atordoa: o alvo perde a próxima ação de ataque.' },
  { id: 'cajado_tempestade', nome: 'Cajado da Tempestade', tier: 'perfeito', categoria: 'foco', foco: 'destruicao', maos: 2, dados: 1, peso: 3, alcance: 1, atributos: { INT: 1 }, bonus: { dadoMagico: 3 }, efeito: '+3d10 no dano mágico. Magias de raio saltam para mais 1 inimigo adjacente ao alvo.' },
  { id: 'tomo_arcanista', nome: 'Tomo do Arcanista', tier: 'perfeito', categoria: 'foco', foco: 'arcano', maos: 1, dados: 0, peso: 2, alcance: 1, atributos: { INT: 1 }, bonus: { slots: 4, usosCusto1: 1 }, efeito: '+4 slots de magia, e magias de custo 1 ganham +1 uso por batalha.' },
  { id: 'calice_sagrado', nome: 'Cálice Sagrado', tier: 'perfeito', categoria: 'foco', foco: 'sagrado', maos: 1, dados: 0, peso: 1, alcance: 1, atributos: { FDV: 1 }, bonus: { dadoCura: 3 }, efeito: '+3d10 nas curas. Quem recebe uma cura sua ganha +1 DM de item por 2 turnos.' },

  // ===== Mais itens para magos e clérigos =====
  { id: 'orbe_vidro', nome: 'Orbe de Vidro Soprado', tier: 'comum', categoria: 'foco', foco: 'destruicao', maos: 1, dados: 0, peso: 1, alcance: 1, bonus: { dadoMagico: 1 }, efeito: '+1d10 no dano mágico. Cabe numa mão só, deixando a outra livre para um escudo.' },
  { id: 'caderno_feiticos', nome: 'Caderno de Feitiços', tier: 'comum', categoria: 'foco', foco: 'arcano', maos: 1, dados: 0, peso: 1, alcance: 1, bonus: { slots: 1, usosCusto1: 1 }, efeito: '+1 slot de magia, e magias de custo 1 ganham +1 uso por batalha.' },
  { id: 'incensario_bronze', nome: 'Incensário de Bronze', tier: 'comum', categoria: 'foco', foco: 'sagrado', maos: 1, dados: 0, peso: 1, alcance: 1, bonus: { dadoCura: 1 }, efeito: '+1d10 nas curas. A fumaça acalma animais comuns.' },
  { id: 'cetro_sangue', nome: 'Cetro de Sangue', tier: 'raro', categoria: 'foco', foco: 'destruicao', maos: 1, dados: 0, peso: 1, alcance: 1, bonus: { dadoMagico: 2 }, efeito: '+2d10 no dano mágico. Magias de dano curam o portador em 10% do dano causado.' },
  { id: 'varinha_eco', nome: 'Varinha do Eco', tier: 'raro', categoria: 'foco', foco: 'arcano', maos: 1, dados: 0, peso: 1, alcance: 1, bonus: { slots: 2 }, efeito: '+2 slots de magia. Uma vez por batalha, repete a última magia de custo 1 lançada sem gastar uso.' },
  { id: 'lanterna_devota', nome: 'Lanterna Devota', tier: 'raro', categoria: 'foco', foco: 'sagrado', maos: 1, dados: 0, peso: 1, alcance: 1, bonus: { dadoCura: 2 }, efeito: '+2d10 nas curas. Mortos-vivos adjacentes ao alvo de uma cura sofrem 1d10 × nível.' },
  { id: 'cajado_peregrino', nome: 'Cajado do Peregrino', tier: 'raro', categoria: 'foco', foco: 'sagrado', maos: 2, dados: 1, peso: 3, alcance: 1, bonus: { dadoCura: 2, recurso: 1 }, efeito: '+2d10 nas curas e +1 no máximo do recurso da classe (Fé, MP e outros).' },
  { id: 'cetro_arcano_duplo', nome: 'Cetro Arcano de Duas Pontas', tier: 'perfeito', categoria: 'foco', foco: 'arcano', maos: 1, dados: 0, peso: 2, alcance: 1, atributos: { INT: 1 }, bonus: { slots: 3, dadoMagico: 1 }, efeito: '+3 slots de magia e +1d10 no dano mágico.' },
  { id: 'livro_das_horas', nome: 'Livro das Horas', tier: 'perfeito', categoria: 'foco', foco: 'sagrado', maos: 1, dados: 0, peso: 2, alcance: 1, atributos: { FDV: 1 }, bonus: { dadoCura: 2, recurso: 2 }, efeito: '+2d10 nas curas e +2 no máximo do recurso da classe.' },
  { id: 'estandarte_sagrado', nome: 'Estandarte Sagrado', tier: 'perfeito', categoria: 'foco', foco: 'sagrado', maos: 2, dados: 1, peso: 4, alcance: 1, atributos: { FDV: 1 }, bonus: { dadoCura: 3 }, efeito: '+3d10 nas curas. Aliados a até 2 hex do portador somam +1 na chance de defesa.' },
  { id: 'cajado_primeiro_arquimago', nome: 'Cajado do Primeiro Arquimago', tier: 'lendario', categoria: 'foco', foco: 'destruicao', maos: 2, dados: 1, peso: 3, alcance: 1, atributos: { INT: 1 }, bonus: { dadoMagico: 4, slots: 2 }, efeito: '+4d10 no dano mágico e +2 slots. Uma vez por turno, uma magia de custo 1 não gasta uso.' },
  { id: 'baculo_luz_primeira', nome: 'Báculo da Luz Primeira', tier: 'lendario', categoria: 'foco', foco: 'sagrado', maos: 2, dados: 1, peso: 3, alcance: 1, atributos: { FDV: 1 }, bonus: { dadoCura: 4, recurso: 3 }, efeito: '+4d10 nas curas e +3 no máximo do recurso. Toda cura de alvo único também cura os aliados adjacentes ao alvo pela metade.' },
  { id: 'grimorio_arcath', nome: 'O Grimório de Arcath', tier: 'unico', categoria: 'foco', foco: 'arcano', maos: 1, dados: 0, peso: 2, alcance: 1, atributos: { INT: 2 }, bonus: { slots: 5, dadoMagico: 2 }, efeito: '+5 slots de magia e +2d10 no dano mágico. Uma magia equipada, de qualquer tier, não ocupa slots.', colecao: 'semideus', tema: 'Arcath, a maga da Primeira Era', historia: 'Arcath descobriu que a magia dos elfos não era dom, era método, e escreveu tudo neste livro para ensinar os escravizados. É daqui que nasceram as classes.', desvantagem: 'Os poucos elfos que restam e os Araltos querem o grimório. Quem o carrega é caçado pelos dois lados.', obtencao: 'Escondido num dos cinco Marcos dos Heróis. A Guardiã do Bastião sabe qual, mas só conta a quem já provou ser digno.' },
  { id: 'simbolo_sanctum', nome: 'O Símbolo de Sanctum', tier: 'unico', categoria: 'foco', foco: 'sagrado', maos: 1, dados: 0, peso: 1, alcance: 1, atributos: { FDV: 2 }, bonus: { dadoCura: 5, recurso: 2 }, efeito: '+5d10 nas curas e +2 no máximo do recurso. Uma vez por batalha, uma cura levanta um aliado caído.', colecao: 'semideus', tema: 'Sanctum, o clérigo da Primeira Era', historia: 'Sanctum curou os feridos dos dois lados da guerra da libertação, inclusive os elfos que se renderam. Na Batalha Colossal, curou a própria Jurgmund.', desvantagem: 'O símbolo não escolhe lados: curas em área também curam os inimigos que estiverem na área.', obtencao: 'Guardado no Bastião dos Heróis. Só é entregue a um clérigo que cure um inimigo diante da Guardiã.' },

  // ===== Recompensas de missões =====
  { id: 'lamina_eclipse', nome: 'Lâmina do Eclipse', tier: 'lendario', categoria: 'media', maos: 1, dados: 5, peso: 3, alcance: 1, atributos: { DEX: 1, PER: 1 }, efeito: 'À noite ou no escuro, soma +2d10 e o portador fica oculto até atacar. Forjada da sombra que a Fera do Eclipse deixou para trás.' },
  { id: 'tridente_afogados', nome: 'Tridente do Senhor dos Afogados', tier: 'lendario', categoria: 'media', maos: 2, dados: 5, peso: 4, alcance: 2, atributos: { FOR: 1 }, efeito: 'Alcance de 2 hex. Na água ou na chuva, cada acerto puxa o alvo 2 hex e ele faz teste de CON ou perde a próxima ação, se afogando.' },
  { id: 'diario_aldren', nome: 'O Diário de Aldren', tier: 'lendario', categoria: 'foco', foco: 'arcano', maos: 1, dados: 0, peso: 1, alcance: 1, atributos: { INT: 1, PER: 1 }, bonus: { slots: 3, dadoMagico: 2 }, efeito: '+3 slots e +2d10 no dano mágico. As páginas mostram o céu da noite: uma vez por sessão, o portador faz uma pergunta sobre o futuro ao mestre.' },

  // ===== Itens com mecânicas de vida =====
  { id: 'espada_sedenta', nome: 'Espada Sedenta', tier: 'raro', categoria: 'media', maos: 1, dados: 3, peso: 3, alcance: 1, efeito: 'Contra alvos abaixo de 50% da vida, cada acerto cura o portador em 10% do dano causado.' },
  { id: 'arco_gemeo', nome: 'Arco Gêmeo', tier: 'perfeito', categoria: 'media', maos: 2, dados: 4, peso: 3, alcance: 8, atributos: { DEX: 1 }, efeito: 'Alcance de 8 hex. Dispara duas flechas por ataque em alvos diferentes, a até 2 hex um do outro; a segunda causa metade do dano.' },
  { id: 'cajado_eco_sombrio', nome: 'Cajado do Eco Sombrio', tier: 'perfeito', categoria: 'foco', foco: 'destruicao', maos: 2, dados: 1, peso: 3, alcance: 1, atributos: { INT: 1 }, bonus: { dadoMagico: 2 }, efeito: '+2d10 no dano mágico. Uma vez por turno, quando uma magia de dano derruba um alvo, ela ecoa num inimigo a até 3 hex com metade do dano.' },
  { id: 'lamina_ultimo_folego', nome: 'Lâmina do Último Fôlego', tier: 'lendario', categoria: 'leve', maos: 1, dados: 4, peso: 2, alcance: 1, atributos: { AGI: 1, PER: 1 }, efeito: 'Quanto menos vida o portador tem, mais ela corta: abaixo de 50% da vida, +1d10; abaixo de 25%, +3d10 e +1 na faixa de crítico.' },
  { id: 'martelo_gigantes', nome: 'Martelo dos Gigantes Caídos', tier: 'lendario', categoria: 'muito_pesada', maos: 2, dados: 8, peso: 12, alcance: 1, atributos: { FOR: 2 }, efeito: 'Contra criaturas grandes ou colossais, cada acerto derruba e tira 1 ação de ataque do próximo turno delas.' },

  // ===== Ruínas de Valgor =====
  { id: 'martelo_forja_valgor', nome: 'Martelo da Forja Abandonada', tier: 'perfeito', categoria: 'pesada', maos: 2, dados: 5, peso: 7, alcance: 1, colecao: 'monstro', tema: 'Ruínas de Valgor', atributos: { FOR: 1 }, efeito: 'A cabeça do martelo ainda está em brasa. Cada acerto causa +1d10 de fogo e, num crítico, derrete a armadura do alvo: −2 DF de item até o fim da batalha.' },
  { id: 'lamina_silencio', nome: 'Lâmina do Silêncio', tier: 'lendario', categoria: 'leve', maos: 1, dados: 4, peso: 2, alcance: 1, colecao: 'monstro', tema: 'Ruínas de Valgor', atributos: { DEX: 1, AGI: 1 }, efeito: 'Não faz barulho nenhum. Quem for atingido por ela não consegue lançar magias nem usar habilidades de voz no próximo turno.' },
  { id: 'cetro_rei_despedacado', nome: 'Cetro do Rei Despedaçado', tier: 'lendario', categoria: 'foco', foco: 'sagrado', maos: 1, dados: 0, peso: 2, alcance: 1, colecao: 'monstro', tema: 'Ruínas de Valgor', atributos: { FDV: 1, CAR: 1 }, bonus: { dadoCura: 3, recurso: 2 }, efeito: '+3d10 nas curas e +2 no recurso máximo. Aliados humanos curados pelo portador ganham +1 ação de ataque no próximo turno.' },

  // ===== Ruínas do Abismo =====
  { id: 'foice_abismo', nome: 'Foice do Abismo', tier: 'lendario', categoria: 'pesada', maos: 2, dados: 6, peso: 6, alcance: 2, colecao: 'monstro', tema: 'Ruínas do Abismo', atributos: { FOR: 1, AGI: 1 }, efeito: 'Alcance de 2 hex. Cada inimigo derrubado por ela devolve 1 ponto do recurso da classe ao portador.' },

  // ===== Cavernas da Estrela Dourada =====
  { id: 'adaga_veneno_verde', nome: 'Adaga do Poço Verde', tier: 'perfeito', categoria: 'muito_leve', maos: 1, dados: 3, peso: 1, alcance: 1, colecao: 'monstro', tema: 'Cavernas da Estrela Dourada', atributos: { DEX: 1 }, efeito: 'A lâmina escorre veneno verde: cada acerto envenena, 1d10 × nível por 2 turnos, ignorando a defesa (não acumula).' },
  { id: 'arco_estrela_dourada', nome: 'Arco da Estrela Dourada', tier: 'lendario', categoria: 'media', maos: 2, dados: 5, peso: 3, alcance: 12, colecao: 'monstro', tema: 'Cavernas da Estrela Dourada', atributos: { PER: 1, DEX: 1 }, efeito: 'Alcance de 12 hex. As flechas viram riscos de luz dourada: ignoram cobertura e escuridão, e contra criaturas carmesins causam +2d10.' }
];

/* ---------- ESCUDOS ----------
   Vão na mão secundária (só com arma de uma mão).
   Não dão DF nem DM: aumentam a chance de defesa no d10.
   perdeAcao = ações de ataque perdidas por turno
------------------------------------------------ */
const ESCUDOS = [
  { id: 'broquel',         nome: 'Broquel',              tier: 'comum', tipoEscudo: 'leve',   defesa: 1, perdeAcao: 0, peso: 2, efeito: '' },
  { id: 'escudo_torre',    nome: 'Escudo Torre',         tier: 'comum', tipoEscudo: 'pesado', defesa: 2, perdeAcao: 1, peso: 8, efeito: '' },
  { id: 'broquel_duelista',nome: 'Broquel do Duelista',  tier: 'raro',  tipoEscudo: 'leve',   defesa: 1, perdeAcao: 0, peso: 2, efeito: 'Ao defender um ataque corpo a corpo, seu próximo ataque contra esse inimigo tem +1 na chance de crítico.' },
  { id: 'escudo_cruzado',  nome: 'Escudo do Cruzado',    tier: 'raro',  tipoEscudo: 'leve',   defesa: 1, perdeAcao: 0, peso: 4, efeito: 'Aliados adjacentes recebem +1 na chance de defesa.' },
  { id: 'muralha_ferro',   nome: 'Muralha de Ferro',     tier: 'raro',  tipoEscudo: 'pesado', defesa: 2, perdeAcao: 1, peso: 8, efeito: 'Aliados no hexágono atrás de você não podem ser alvo de ataques à distância.' },
  { id: 'escama_viva', nome: 'Escama Viva de Jurgmund', tier: 'lendario', tipoEscudo: 'leve', defesa: 2, perdeAcao: 0, peso: 5,
    colecao: 'monstro', tema: 'Carne Errante',
    efeito: 'Escudo leve com +2 na chance de defesa. A escama continua viva: o portador recupera 5% da vida máxima no início de cada turno, a não ser que tenha levado dano de fogo.' },
  { id: 'escama_abissal_murlach', nome: 'Escama Abissal de Murlach', tier: 'unico', tipoEscudo: 'pesado', defesa: 3, perdeAcao: 1, peso: 10,
    colecao: 'monstro', tema: 'Murlach',
    efeito: 'Escudo pesado com +3 na chance de defesa. O portador não pode ser empurrado nem derrubado, e respira e se move normalmente debaixo da água.',
    historia: 'Kurnamin guarda a costa contra Murlach há gerações. Esta escama é a única prova de que alguém já o feriu.',
    desvantagem: 'Murlach sente a própria escama: sempre que o portador estiver no mar ou na costa, ele vem buscá-la.' },
  { id: 'escudo_casco_magnalag', nome: 'Escudo-Casco de Magnalag', tier: 'lendario', tipoEscudo: 'leve', defesa: 2, perdeAcao: 0, peso: 6,
    colecao: 'cidade', tema: 'Reinado de Magnalag', atributos: { CON: 1 },
    obtencao: 'Presente do rei de Magnalag a quem proteger a ilha ou a Tartaruga.',
    efeito: 'Feito de uma lasca que a Tartaruga soltou do casco. +2 na chance de defesa. Uma vez por batalha, o portador se recolhe atrás dele e anula todo o dano de um ataque.' },
  { id: 'escama_turlach', nome: 'Escama Espelhada de Turlach', tier: 'unico', tipoEscudo: 'pesado', defesa: 3, perdeAcao: 1, peso: 9,
    colecao: 'monstro', tema: 'Turlach',
    efeito: 'Escudo pesado com +3 na chance de defesa. Uma vez por batalha, reflete uma magia de dano de volta para quem a lançou.',
    historia: 'Karlach, Murlach, Turlach. Os sábios de Nazarik acham que os nomes não são coincidência, mas ninguém voltou do Encontro de Turlach para perguntar.',
    desvantagem: 'Na água, a escama puxa o portador para o fundo: ele não consegue nadar.' },

  // ===== Forja: raros e perfeitos =====
  { id: 'escudo_espinhos', nome: 'Escudo de Espinhos', tier: 'raro', tipoEscudo: 'leve', defesa: 1, perdeAcao: 0, peso: 4, efeito: 'Quem atacar o portador corpo a corpo e for defendido sofre 1d10 × nível.' },
  { id: 'paves_arqueiro', nome: 'Pavês do Arqueiro', tier: 'raro', tipoEscudo: 'pesado', defesa: 2, perdeAcao: 1, peso: 9, efeito: 'Enquanto o portador não se mover, aliados atrás dele não podem ser alvo de ataques à distância.' },
  { id: 'escudo_runico', nome: 'Escudo Rúnico', tier: 'perfeito', tipoEscudo: 'leve', defesa: 2, perdeAcao: 0, peso: 5, atributos: { CON: 1 }, efeito: 'Uma vez por batalha, anula uma magia de dano de tier Raro ou inferior que atinja o portador.' },
  { id: 'escudo_ferro_negro', nome: 'Escudo Torre de Ferro Negro', tier: 'perfeito', tipoEscudo: 'pesado', defesa: 3, perdeAcao: 1, peso: 12, atributos: { CON: 1 }, efeito: 'O portador não pode ser empurrado nem derrubado.' },

  // ===== Recompensas de missões =====
  { id: 'espelho_guardiao', nome: 'Espelho do Guardião', tier: 'lendario', tipoEscudo: 'leve', defesa: 2, perdeAcao: 0, peso: 4, atributos: { FDV: 1 }, efeito: '+2 na chance de defesa. Duas vezes por batalha, reflete uma magia de dano de volta para quem lançou.' },

  // ===== Itens com mecânicas de vida =====
  { id: 'escudo_contra_ataque', nome: 'Escudo do Contra-Ataque', tier: 'perfeito', tipoEscudo: 'leve', defesa: 1, perdeAcao: 0, peso: 4, atributos: { DEX: 1 }, efeito: 'Quando o portador defende um ataque corpo a corpo, faz um ataque de graça contra quem atacou (uma vez por turno).' },

  // ===== Ruínas de Valgor =====
  { id: 'escudo_guarda_valgor', nome: 'Escudo da Guarda de Valgor', tier: 'perfeito', tipoEscudo: 'leve', defesa: 2, perdeAcao: 0, peso: 5, colecao: 'monstro', tema: 'Ruínas de Valgor', atributos: { CON: 1 }, efeito: '+2 na chance de defesa. Tem o brasão de uma chama sobre uma coroa. Mortos-vivos das Ruínas de Valgor hesitam: o primeiro ataque deles contra o portador em cada batalha erra.' },

  // ===== Cavernas da Estrela Dourada =====
  { id: 'escudo_escama_dourada', nome: 'Escudo de Escama Dourada', tier: 'lendario', tipoEscudo: 'pesado', defesa: 3, perdeAcao: 1, peso: 8, colecao: 'monstro', tema: 'Cavernas da Estrela Dourada', atributos: { CON: 1, FDV: 1 }, efeito: '+3 na chance de defesa. Feito de uma escama que o Dragão Dourado deixou cair. Imune a fogo e a sopros de dragão enquanto o escudo estiver erguido.' }
];

/* ---------- ARMADURAS ----------
   slot: 'elmo' | 'peitoral' | 'luvas' | 'botas'
   tipo: placas, malha, couro, brocado, tecido
   df/dm = defesa física / mágica do item
------------------------------------------------ */
const TIPOS_ARMADURA = {
  placas:  'Placas (pesada)',
  malha:   'Malha (média)',
  couro:   'Couro (leve)',
  brocado: 'Brocado rúnico (média)',
  tecido:  'Tecido encantado (leve)',
  runica:  'Malha rúnica (média, equilibrada)'
};

const ARMADURAS = [
  // Comuns — Placas
  { id: 'elmo_ferro',      nome: 'Elmo de Ferro',      tier: 'comum', tipo: 'placas', slot: 'elmo',     df: 3, dm: 0, peso: 4 },
  { id: 'couraca_ferro',   nome: 'Couraça de Ferro',   tier: 'comum', tipo: 'placas', slot: 'peitoral', df: 6, dm: 0, peso: 10 },
  { id: 'manoplas_ferro',  nome: 'Manoplas de Ferro',  tier: 'comum', tipo: 'placas', slot: 'luvas',    df: 3, dm: 0, peso: 3 },
  { id: 'grevas_ferro',    nome: 'Grevas de Ferro',    tier: 'comum', tipo: 'placas', slot: 'botas',    df: 3, dm: 0, peso: 4 },
  // Comuns — Malha
  { id: 'coifa_malha',     nome: 'Coifa de Malha',     tier: 'comum', tipo: 'malha', slot: 'elmo',     df: 2, dm: 1, peso: 3 },
  { id: 'cota_malha',      nome: 'Cota de Malha',      tier: 'comum', tipo: 'malha', slot: 'peitoral', df: 4, dm: 2, peso: 7 },
  { id: 'luvas_malha',     nome: 'Luvas de Malha',     tier: 'comum', tipo: 'malha', slot: 'luvas',    df: 2, dm: 1, peso: 2 },
  { id: 'botas_malha',     nome: 'Botas de Malha',     tier: 'comum', tipo: 'malha', slot: 'botas',    df: 2, dm: 1, peso: 3 },
  // Comuns — Couro
  { id: 'capuz_couro',     nome: 'Capuz de Couro',     tier: 'comum', tipo: 'couro', slot: 'elmo',     df: 2, dm: 0, peso: 1 },
  { id: 'gibao_couro',     nome: 'Gibão de Couro',     tier: 'comum', tipo: 'couro', slot: 'peitoral', df: 4, dm: 0, peso: 3 },
  { id: 'luvas_couro',     nome: 'Luvas de Couro',     tier: 'comum', tipo: 'couro', slot: 'luvas',    df: 2, dm: 0, peso: 1 },
  { id: 'botas_couro',     nome: 'Botas de Couro',     tier: 'comum', tipo: 'couro', slot: 'botas',    df: 2, dm: 0, peso: 1 },
  // Comuns — Brocado rúnico
  { id: 'mitra_bordada',   nome: 'Mitra Bordada',      tier: 'comum', tipo: 'brocado', slot: 'elmo',     df: 0, dm: 3, peso: 3 },
  { id: 'vestes_rituais',  nome: 'Vestes Rituais',     tier: 'comum', tipo: 'brocado', slot: 'peitoral', df: 0, dm: 6, peso: 7 },
  { id: 'luvas_rituais',   nome: 'Luvas Rituais',      tier: 'comum', tipo: 'brocado', slot: 'luvas',    df: 0, dm: 3, peso: 2 },
  { id: 'botas_rituais',   nome: 'Botas Rituais',      tier: 'comum', tipo: 'brocado', slot: 'botas',    df: 0, dm: 3, peso: 3 },
  // Comuns — Tecido encantado
  { id: 'chapeu_linho',    nome: 'Chapéu de Linho',    tier: 'comum', tipo: 'tecido', slot: 'elmo',     df: 0, dm: 2, peso: 1 },
  { id: 'tunica_encantada',nome: 'Túnica Encantada',   tier: 'comum', tipo: 'tecido', slot: 'peitoral', df: 0, dm: 4, peso: 2 },
  { id: 'luvas_seda',      nome: 'Luvas de Seda',      tier: 'comum', tipo: 'tecido', slot: 'luvas',    df: 0, dm: 2, peso: 1 },
  { id: 'sapatos_feltro',  nome: 'Sapatos de Feltro',  tier: 'comum', tipo: 'tecido', slot: 'botas',    df: 0, dm: 2, peso: 1 },

  // Raras
  { id: 'elmo_sentinela',   nome: 'Elmo do Sentinela',        tier: 'raro', tipo: 'placas',  slot: 'elmo',     df: 4, dm: 0, peso: 4,  efeito: 'Ataques pelas costas não recebem bônus contra você.' },
  { id: 'couraca_baluarte', nome: 'Couraça do Baluarte',      tier: 'raro', tipo: 'placas',  slot: 'peitoral', df: 8, dm: 0, peso: 10, efeito: 'Aliados adjacentes recebem +1 DF de item.' },
  { id: 'manoplas_carrasco',nome: 'Manoplas do Carrasco',     tier: 'raro', tipo: 'placas',  slot: 'luvas',    df: 4, dm: 0, peso: 3,  efeito: '+1d10 de dano com armas muito pesadas.' },
  { id: 'cota_mercenario',  nome: 'Cota do Mercenário',       tier: 'raro', tipo: 'malha',   slot: 'peitoral', df: 6, dm: 2, peso: 7,  efeito: 'Conta como 5 a menos de peso para a carga.', bonus: { carga: 5 } },
  { id: 'bracadeiras_arqueiro',nome: 'Braçadeiras do Arqueiro',tier: 'raro', tipo: 'malha',  slot: 'luvas',    df: 3, dm: 1, peso: 2,  efeito: '+1 hexágono de alcance com arcos.', bonus: { alcanceArco: 1 } },
  { id: 'gibao_corvo',      nome: 'Gibão do Corvo',           tier: 'raro', tipo: 'couro',   slot: 'peitoral', df: 6, dm: 0, peso: 3,  efeito: 'Ataques pelas costas causam +10% de dano.' },
  { id: 'botas_andarilho',  nome: 'Botas do Andarilho Noturno',tier: 'raro', tipo: 'couro',  slot: 'botas',    df: 3, dm: 0, peso: 1,  efeito: '+1 hexágono de movimento.', bonus: { mov: 1 } },
  { id: 'mitra_peregrino',  nome: 'Mitra do Peregrino',       tier: 'raro', tipo: 'brocado', slot: 'elmo',     df: 0, dm: 4, peso: 3,  efeito: 'Curas recebidas +10%.' },
  { id: 'manto_aprendiz',   nome: 'Manto do Aprendiz Rúnico', tier: 'raro', tipo: 'tecido',  slot: 'peitoral', df: 0, dm: 6, peso: 2,  efeito: 'Magias de custo 1 ganham +1 uso por batalha.', bonus: { usosCusto1: 1 } },
  { id: 'sapatilhas_vento', nome: 'Sapatilhas do Vento',      tier: 'raro', tipo: 'tecido',  slot: 'botas',    df: 0, dm: 3, peso: 1,  efeito: '+1 hexágono de movimento no turno em que lançar magia.' },

  // ===== Semideuses =====
  { id: 'grevas_pedra', nome: 'Grevas da Paciência de Pedra', tier: 'lendario', tipo: 'placas', slot: 'botas', df: 5, dm: 1, peso: 5,
    colecao: 'semideus', tema: 'Semideus dos anões', atributos: { CON: 1 },
    obtencao: 'Guardadas no fundo do Forte Anão da Guarda, atrás de portas que só um anão abre.',
    efeito: 'Se o portador não se mover no turno, ganha +2 na chance de defesa e não pode ser empurrado nem derrubado.' },
  { id: 'manto_centelha', nome: 'Manto da Centelha Élfica', tier: 'lendario', tipo: 'tecido', slot: 'peitoral', df: 0, dm: 12, peso: 2,
    colecao: 'semideus', tema: 'Semideus dos elfos', atributos: { INT: 1, FDV: 1 }, bonus: { slots: 2 },
    efeito: '+2 slots de magia. Magias de tier Comum não gastam usos.' },
  { id: 'escamas_primeira_muda', nome: 'Escamas da Primeira Muda', tier: 'lendario', tipo: 'malha', slot: 'peitoral', df: 8, dm: 4, peso: 6,
    colecao: 'semideus', tema: 'Semideus dos serpentarianos', atributos: { CON: 1 },
    obtencao: 'Pode cair do Eco de Semideus, nas Ruínas do Templo dos Semideuses.',
    efeito: 'Uma vez por batalha, ao cair a 0, o portador troca de pele e volta com 30% da vida, sem condições negativas.' },

  // ===== Cidades =====
  { id: 'couraca_verdom', nome: 'Couraça da Guarda de Verdom', tier: 'perfeito', tipo: 'placas', slot: 'peitoral', df: 10, dm: 0, peso: 10,
    colecao: 'cidade', tema: 'Verdom', atributos: { CON: 1 },
    efeito: 'Aliados adjacentes ao portador recebem +1 na chance de defesa.' },
  { id: 'elmo_castelo_cobra', nome: 'Elmo do Castelo da Cobra', tier: 'perfeito', tipo: 'malha', slot: 'elmo', df: 3, dm: 2, peso: 3,
    colecao: 'cidade', tema: 'Atrelon', atributos: { PER: 1 },
    efeito: 'Imune a olhares hipnóticos, sussurros e outras condições de mente causadas por serpentes.' },
  { id: 'botas_atrelon', nome: 'Botas de Escalada de Atrelon', tier: 'perfeito', tipo: 'couro', slot: 'botas', df: 4, dm: 1, peso: 1,
    colecao: 'cidade', tema: 'Atrelon', bonus: { mov: 1 },
    efeito: '+1 hexágono de movimento. Sem penalidade em montanhas, gelo e paredes de pedra.' },
  { id: 'manto_cinzas_frias', nome: 'Manto de Cinzas Frias', tier: 'perfeito', tipo: 'tecido', slot: 'peitoral', df: 2, dm: 8, peso: 2,
    colecao: 'cidade', tema: 'Cidade de Karlach', atributos: { FDV: 1 },
    efeito: 'O portador não sofre com calor do ambiente, e dano de fogo contra ele cai pela metade.' },

  // ===== Monstros =====
  { id: 'punhos_refratores', nome: 'Punhos Refratores', tier: 'lendario', tipo: 'placas', slot: 'luvas', df: 5, dm: 1, peso: 4,
    colecao: 'monstro', tema: 'Golem de Cristal Carmesim', atributos: { FOR: 1 },
    efeito: 'Uma vez por batalha, quando uma magia de dano atinge o portador, metade do dano volta para quem lançou.' },
  { id: 'veu_do_lamento', nome: 'Véu do Lamento', tier: 'lendario', tipo: 'tecido', slot: 'elmo', df: 0, dm: 6, peso: 1,
    colecao: 'monstro', tema: 'Banshee', atributos: { FDV: 1 },
    efeito: 'Uma vez por batalha, o portador solta o lamento: inimigos a até 4 hex fazem teste de FDV ou perdem 1 ação de ataque no próximo turno.' },
  { id: 'luvas_de_brasa', nome: 'Luvas de Brasa', tier: 'lendario', tipo: 'couro', slot: 'luvas', df: 4, dm: 2, peso: 1,
    colecao: 'monstro', tema: 'Cria de Karlach',
    efeito: 'Calor Crescente: no início de cada turno de combate, o portador soma +1d10 em todos os ataques, acumulando até +3d10. Molhar as luvas zera o acúmulo.' },
  { id: 'mascara_sussurrante', nome: 'Máscara do Sussurrante', tier: 'unico', tipo: 'tecido', slot: 'elmo', df: 1, dm: 6, peso: 1,
    colecao: 'monstro', tema: 'O Aralto Sussurrante', atributos: { INT: 1, CAR: 2 },
    efeito: 'Uma vez por batalha, sussurra para um alvo a até 8 hex: se ele falhar num teste de FDV, o portador decide o movimento e o ataque dele no próximo turno. Fora de combate, o portador pode parecer outra pessoa por 1 hora.',
    historia: 'A máscara de escamas douradas enganou um rei inteiro. Ela ainda lembra de cada mentira.',
    desvantagem: 'A máscara sussurra de volta: uma vez por sessão, o portador faz um teste de FDV; se falhar, o mestre decide uma ação dele.' },
  { id: 'escama_muralha_karlach', nome: 'Escama-Muralha de Karlach', tier: 'unico', tipo: 'placas', slot: 'peitoral', df: 12, dm: 4, peso: 20,
    colecao: 'monstro', tema: 'A Salamandra Karlach', atributos: { CON: 2 },
    efeito: 'O portador é imune a fogo e a efeitos de chão queimando.',
    historia: 'Uma escama que Karlach trocou, grande o bastante para servir de peitoral. Os ferreiros da cidade nas costas dela levaram um ano para moldar.',
    desvantagem: 'Pesa 20 kg e deixa o portador com −1 de movimento.' },

  // ===== Reino de Verdom =====
  { id: 'coroa_vermilion', nome: 'Coroa Enferrujada de Vermilion', tier: 'lendario', tipo: 'placas', slot: 'elmo', df: 5, dm: 1, peso: 3,
    colecao: 'cidade', tema: 'Ruínas de Vermilion', atributos: { CAR: 1, FDV: 1 },
    efeito: 'Os mortos de Vermilion ainda obedecem à coroa: no primeiro turno de cada combate, mortos-vivos não atacam o portador.' },

  // ===== Deserto de Karlach =====
  { id: 'coroa_soberano', nome: 'Coroa do Soberano Enterrado', tier: 'unico', tipo: 'tecido', slot: 'elmo', df: 2, dm: 6, peso: 2,
    colecao: 'monstro', tema: 'O Soberano Enterrado', atributos: { INT: 1, FDV: 1, CAR: 1 },
    efeito: 'Uma vez por batalha, o portador dá uma ordem a um morto-vivo de dificuldade 2 ou menor: ele luta ao lado do grupo até o fim da batalha.',
    historia: 'O último rei da cidade antiga do deserto mandou ser enterrado com a coroa na cabeça e os servos ao lado. Ainda espera que eles obedeçam.',
    desvantagem: 'A maldição da múmia vem junto: curas recebidas pelo portador recuperam 25% a menos.' },

  // ===== Grande Ilha de Tortumaga =====
  { id: 'tabardo_magnalag', nome: 'Tabardo da Guarda de Magnalag', tier: 'perfeito', tipo: 'malha', slot: 'peitoral', df: 7, dm: 3, peso: 7,
    colecao: 'cidade', tema: 'Reinado de Magnalag', atributos: { FDV: 1 },
    efeito: 'Quando a ilha treme ou afunda, o portador não perde o equilíbrio e não pode ser derrubado.' },
  { id: 'botas_asas_gemeas', nome: 'Botas das Asas Gêmeas', tier: 'lendario', tipo: 'couro', slot: 'botas', df: 4, dm: 2, peso: 1,
    colecao: 'monstro', tema: 'As Wyverns Gêmeas', bonus: { mov: 2 },
    efeito: '+2 hexágonos de movimento. O portador plana: cai de qualquer altura sem se ferir e pode atravessar até 3 hex de vazio ou água num salto.' },

  // ===== Montanhas de Atrelon =====
  { id: 'veu_sacerdotisa', nome: 'Véu das Escamas Sagradas', tier: 'lendario', tipo: 'brocado', slot: 'elmo', df: 1, dm: 5, peso: 2,
    colecao: 'cidade', tema: "Templo de S'ssara", atributos: { FDV: 1, CAR: 1 },
    obtencao: 'Dado por S\'ssara aos fiéis de confiança do culto de Jurgmund.',
    efeito: 'Usado pelos fiéis do culto de Jurgmund. Serpentarianos tratam o portador como sacerdote, e magias de cura dele recuperam +1d10.' },
  { id: 'manto_pele_yeti', nome: 'Manto de Pele de Yeti', tier: 'lendario', tipo: 'couro', slot: 'peitoral', df: 8, dm: 2, peso: 5,
    colecao: 'monstro', tema: 'Yeti', atributos: { CON: 1 },
    efeito: 'Imune a frio e a nevasca. Na neve, o portador fica oculto até atacar.' },

  // ===== Forja: raros e perfeitos =====
  { id: 'elmo_cavaleiro', nome: 'Elmo de Cavaleiro', tier: 'raro', tipo: 'placas', slot: 'elmo', df: 4, dm: 0, peso: 4, efeito: 'O portador não pode ser atordoado.' },
  { id: 'capuz_sombras', nome: 'Capuz das Sombras', tier: 'raro', tipo: 'couro', slot: 'elmo', df: 3, dm: 0, peso: 1, efeito: 'Na sombra, se não se mover no turno, o portador fica oculto.' },
  { id: 'coifa_runica', nome: 'Coifa Rúnica', tier: 'raro', tipo: 'malha', slot: 'elmo', df: 3, dm: 1, peso: 3, efeito: 'Uma vez por batalha, o portador ignora uma condição de mente (medo, sussurro, hipnose).' },
  { id: 'couraca_escamas', nome: 'Couraça de Escamas', tier: 'raro', tipo: 'placas', slot: 'peitoral', df: 8, dm: 0, peso: 10, efeito: 'Dano de fogo contra o portador cai 10%.' },
  { id: 'brigantina', nome: 'Brigantina de Viagem', tier: 'raro', tipo: 'malha', slot: 'peitoral', df: 6, dm: 2, peso: 6, bonus: { carga: 5 }, efeito: 'Bolsos por dentro do forro: +5 kg de carga.' },
  { id: 'vestes_eremita', nome: 'Vestes do Eremita', tier: 'raro', tipo: 'brocado', slot: 'peitoral', df: 0, dm: 8, peso: 6, bonus: { dadoCura: 1 }, efeito: '+1d10 nas curas.' },
  { id: 'manoplas_duelista', nome: 'Manoplas do Duelista', tier: 'raro', tipo: 'couro', slot: 'luvas', df: 3, dm: 0, peso: 1, bonus: { critDano: 10 }, efeito: '+10% de bônus de dano crítico.' },
  { id: 'luvas_conjurador', nome: 'Luvas do Conjurador', tier: 'raro', tipo: 'tecido', slot: 'luvas', df: 0, dm: 3, peso: 1, bonus: { slots: 1 }, efeito: '+1 slot de magia.' },
  { id: 'botas_pantano', nome: 'Botas de Pântano', tier: 'raro', tipo: 'couro', slot: 'botas', df: 3, dm: 0, peso: 1, efeito: 'Sem penalidade de movimento em lama, neve e água rasa.' },
  { id: 'grevas_investida', nome: 'Grevas de Investida', tier: 'raro', tipo: 'placas', slot: 'botas', df: 4, dm: 0, peso: 4, efeito: '+1 hexágono de movimento quando o portador anda em linha reta.' },
  { id: 'elmo_leao', nome: 'Elmo do Leão', tier: 'perfeito', tipo: 'placas', slot: 'elmo', df: 5, dm: 0, peso: 4, atributos: { CON: 1 }, efeito: 'O portador é imune a medo, e aliados adjacentes a ele também.' },
  { id: 'coroa_arcanista', nome: 'Tiara do Arcanista', tier: 'perfeito', tipo: 'tecido', slot: 'elmo', df: 0, dm: 4, peso: 1, atributos: { INT: 1 }, bonus: { slots: 1 }, efeito: '+1 slot de magia.' },
  { id: 'couraca_guardiao', nome: 'Couraça do Guardião', tier: 'perfeito', tipo: 'placas', slot: 'peitoral', df: 10, dm: 0, peso: 10, atributos: { CON: 1 }, efeito: 'Aliados adjacentes ao portador recebem 10% a menos de dano físico.' },
  { id: 'cota_mithril', nome: 'Cota de Mithril', tier: 'perfeito', tipo: 'malha', slot: 'peitoral', df: 7, dm: 3, peso: 3, atributos: { AGI: 1 }, efeito: 'Tão leve que pesa como couro, e não atrapalha magias nem furtividade.' },
  { id: 'gibao_cacador', nome: 'Gibão do Caçador', tier: 'perfeito', tipo: 'couro', slot: 'peitoral', df: 8, dm: 0, peso: 3, atributos: { DEX: 1 }, bonus: { alcanceArco: 1 }, efeito: '+1 hex de alcance com arcos e bestas.' },
  { id: 'vestes_sumo_sacerdote', nome: 'Vestes do Sumo Sacerdote', tier: 'perfeito', tipo: 'brocado', slot: 'peitoral', df: 0, dm: 10, peso: 7, atributos: { FDV: 1 }, bonus: { dadoCura: 1 }, efeito: '+1d10 nas curas.' },
  { id: 'manto_arquimago', nome: 'Manto do Arquimago', tier: 'perfeito', tipo: 'tecido', slot: 'peitoral', df: 0, dm: 8, peso: 2, atributos: { INT: 1 }, bonus: { dadoMagico: 1 }, efeito: '+1d10 no dano mágico.' },
  { id: 'manoplas_tita', nome: 'Manoplas do Titã', tier: 'perfeito', tipo: 'placas', slot: 'luvas', df: 5, dm: 0, peso: 4, atributos: { FOR: 1 }, bonus: { carga: 10 }, efeito: '+10 kg de carga.' },
  { id: 'luvas_ladrao', nome: 'Luvas do Ladrão', tier: 'perfeito', tipo: 'couro', slot: 'luvas', df: 4, dm: 0, peso: 1, atributos: { DEX: 1 }, bonus: { critDano: 10 }, efeito: '+10% de bônus de dano crítico e +2 em testes de abrir fechaduras e roubar.' },
  { id: 'botas_vento_perfeitas', nome: 'Botas de Sete Léguas', tier: 'perfeito', tipo: 'couro', slot: 'botas', df: 4, dm: 0, peso: 1, atributos: { AGI: 1 }, bonus: { mov: 1 }, efeito: '+1 hexágono de movimento. Em viagem, o portador anda o dobro sem se cansar.' },
  { id: 'grevas_ferro_negro', nome: 'Grevas de Ferro Negro', tier: 'perfeito', tipo: 'placas', slot: 'botas', df: 5, dm: 0, peso: 5, atributos: { CON: 1 }, efeito: 'O portador não pode ser empurrado nem derrubado.' },

  // ===== Mais itens para magos e clérigos =====
  { id: 'chapeu_astrologo', nome: 'Chapéu do Astrólogo', tier: 'raro', tipo: 'tecido', slot: 'elmo', df: 0, dm: 3, peso: 1, efeito: 'Magias de utilidade duram o dobro do tempo.' },
  { id: 'luvas_ouro_rituais', nome: 'Luvas de Fio de Ouro', tier: 'raro', tipo: 'brocado', slot: 'luvas', df: 0, dm: 4, peso: 2, bonus: { dadoCura: 1 }, efeito: '+1d10 nas curas.' },
  { id: 'botas_peregrino', nome: 'Botas do Peregrino', tier: 'raro', tipo: 'brocado', slot: 'botas', df: 0, dm: 4, peso: 3, efeito: 'Depois de lançar uma cura, o portador pode mover 1 hex sem ser interceptado.' },
  { id: 'sandalias_meditacao', nome: 'Sandálias da Meditação', tier: 'raro', tipo: 'tecido', slot: 'botas', df: 0, dm: 3, peso: 1, efeito: 'Uma vez por batalha, ao recuperar recurso (Concentrar ou Orar), recupera 1 a mais.' },
  { id: 'manto_mana', nome: 'Manto de Mana', tier: 'raro', tipo: 'tecido', slot: 'peitoral', df: 0, dm: 6, peso: 2, bonus: { recurso: 2 }, efeito: '+2 no máximo do recurso da classe.' },
  { id: 'capuz_vidente', nome: 'Capuz do Vidente', tier: 'perfeito', tipo: 'tecido', slot: 'elmo', df: 0, dm: 4, peso: 1, atributos: { PER: 1 }, efeito: 'O portador enxerga magia sem precisar lançar Detectar Magia, e não pode ser surpreendido por inimigos invisíveis.' },
  { id: 'mitra_bispo', nome: 'Mitra do Bispo', tier: 'perfeito', tipo: 'brocado', slot: 'elmo', df: 0, dm: 5, peso: 3, atributos: { FDV: 1 }, bonus: { dadoCura: 1 }, efeito: '+1d10 nas curas.' },
  { id: 'luvas_tecelao', nome: 'Luvas do Tecelão de Feitiços', tier: 'perfeito', tipo: 'tecido', slot: 'luvas', df: 0, dm: 4, peso: 1, atributos: { INT: 1 }, bonus: { slots: 1 }, efeito: '+1 slot de magia.' },
  { id: 'luvas_bencao', nome: 'Luvas da Bênção', tier: 'perfeito', tipo: 'brocado', slot: 'luvas', df: 0, dm: 5, peso: 2, atributos: { FDV: 1 }, efeito: 'Buffs lançados pelo portador duram +1 turno.' },
  { id: 'botas_levitacao', nome: 'Botas da Levitação', tier: 'perfeito', tipo: 'tecido', slot: 'botas', df: 0, dm: 4, peso: 1, atributos: { AGI: 1 }, bonus: { mov: 1 }, efeito: '+1 hexágono de movimento. O portador flutua um palmo acima do chão: ignora armadilhas de pressão, lama e água rasa.' },
  { id: 'sandalias_romeiro', nome: 'Sandálias do Romeiro', tier: 'perfeito', tipo: 'brocado', slot: 'botas', df: 0, dm: 5, peso: 3, atributos: { CON: 1 }, bonus: { recurso: 1 }, efeito: '+1 no máximo do recurso da classe.' },
  { id: 'vestes_vigilia', nome: 'Vestes da Vigília', tier: 'perfeito', tipo: 'brocado', slot: 'peitoral', df: 0, dm: 10, peso: 7, atributos: { FDV: 1 }, bonus: { recurso: 2 }, efeito: '+2 no máximo do recurso da classe.' },
  { id: 'manto_estrelas', nome: 'Manto das Estrelas', tier: 'perfeito', tipo: 'tecido', slot: 'peitoral', df: 0, dm: 8, peso: 2, atributos: { INT: 1 }, bonus: { slots: 2 }, efeito: '+2 slots de magia.' },
  { id: 'vestes_tecidas_luz', nome: 'Vestes Tecidas de Luz', tier: 'lendario', tipo: 'brocado', slot: 'peitoral', df: 0, dm: 12, peso: 6, atributos: { FDV: 2 }, bonus: { dadoCura: 2, recurso: 2 }, efeito: '+2d10 nas curas e +2 no máximo do recurso. Uma vez por batalha, o portador brilha: aliados a até 3 hex recuperam 2d10 × nível.' },
  { id: 'manto_noite_arcana', nome: 'Manto da Noite Arcana', tier: 'lendario', tipo: 'tecido', slot: 'peitoral', df: 0, dm: 10, peso: 2, atributos: { INT: 2 }, bonus: { dadoMagico: 2, slots: 2 }, efeito: '+2d10 no dano mágico e +2 slots. No escuro, o portador fica oculto até lançar uma magia.' },

  // ===== Recompensas de missões =====
  { id: 'coroa_rei_ratos', nome: 'Coroa do Rei dos Ratos', tier: 'lendario', tipo: 'couro', slot: 'elmo', df: 4, dm: 2, peso: 1, atributos: { DEX: 1, PER: 1 }, efeito: 'Ratos comuns obedecem ao portador e contam o que viram. Em esgotos e porões, ele fica oculto até atacar.' },
  { id: 'manto_seda_rainha', nome: 'Manto de Seda da Rainha', tier: 'lendario', tipo: 'couro', slot: 'peitoral', df: 8, dm: 4, peso: 2, atributos: { AGI: 1 }, efeito: 'Quem atacar o portador corpo a corpo e errar fica preso na seda e não se move no próximo turno. O portador anda por paredes e tetos.' },
  { id: 'botas_armadilheiro', nome: 'Botas do Armadilheiro', tier: 'perfeito', tipo: 'couro', slot: 'botas', df: 4, dm: 0, peso: 1, atributos: { DEX: 1 }, efeito: '+2 em testes para perceber e escapar de armadilhas. O portador nunca ativa placas de pressão sem querer.' },

  // ===== Itens com mecânicas de vida =====
  { id: 'couraca_martir', nome: 'Couraça do Mártir', tier: 'lendario', tipo: 'placas', slot: 'peitoral', df: 12, dm: 2, peso: 10, atributos: { CON: 1 }, efeito: 'Quanto mais ferido, mais resistente: abaixo de 50% da vida, +3 DF de item; abaixo de 25%, +6 DF de item e imune a atordoamento.' },
  { id: 'capa_mil_penas', nome: 'Capa das Mil Penas', tier: 'raro', tipo: 'tecido', slot: 'peitoral', df: 0, dm: 6, peso: 1, efeito: 'O portador cai de qualquer altura como uma pena, e ataques à distância contra ele têm −1 na faixa de crítico.' },
  { id: 'botas_salto', nome: 'Botas do Salto Longo', tier: 'raro', tipo: 'couro', slot: 'botas', df: 3, dm: 0, peso: 1, efeito: 'Uma vez por turno, o portador salta até 3 hex por cima de inimigos, buracos ou obstáculos, sem ser interceptado.' },
  { id: 'mascara_coragem', nome: 'Máscara da Coragem', tier: 'perfeito', tipo: 'couro', slot: 'elmo', df: 4, dm: 1, peso: 1, atributos: { MOR: 1 }, efeito: 'Imune a medo. Aliados a até 2 hex somam +1 em testes de Vontade.' },

  // ===== Malha rúnica: defesa equilibrada =====
  { id: 'elmo_malha_runica', nome: 'Elmo de Malha Rúnica', tier: 'comum', tipo: 'runica', slot: 'elmo', df: 2, dm: 2, peso: 4 },
  { id: 'cota_malha_runica', nome: 'Cota de Malha Rúnica', tier: 'comum', tipo: 'runica', slot: 'peitoral', df: 3, dm: 3, peso: 8 },
  { id: 'luvas_malha_runica', nome: 'Luvas de Malha Rúnica', tier: 'comum', tipo: 'runica', slot: 'luvas', df: 1, dm: 1, peso: 2 },
  { id: 'botas_malha_runica', nome: 'Botas de Malha Rúnica', tier: 'comum', tipo: 'runica', slot: 'botas', df: 2, dm: 2, peso: 3 },
  { id: 'elmo_crepusculo', nome: 'Elmo do Crepúsculo', tier: 'raro', tipo: 'runica', slot: 'elmo', df: 2, dm: 2, peso: 4, efeito: 'Na penumbra (amanhecer, anoitecer, cavernas com tochas), o portador enxerga como se fosse dia.' },
  { id: 'couraca_crepusculo', nome: 'Couraça do Crepúsculo', tier: 'raro', tipo: 'runica', slot: 'peitoral', df: 4, dm: 4, peso: 8, efeito: 'Quando recebe dano físico, ganha +1 DM de item até o próximo turno; quando recebe dano mágico, ganha +1 DF de item.' },
  { id: 'manoplas_crepusculo', nome: 'Manoplas do Crepúsculo', tier: 'raro', tipo: 'runica', slot: 'luvas', df: 2, dm: 2, peso: 3, efeito: 'Armas empunhadas pelo portador causam dano físico e mágico ao mesmo tempo: o alvo usa a menor das duas defesas.' },
  { id: 'grevas_crepusculo', nome: 'Grevas do Crepúsculo', tier: 'raro', tipo: 'runica', slot: 'botas', df: 2, dm: 2, peso: 4, efeito: 'O portador não pode ser derrubado por magia.' },
  { id: 'elmo_equinocio', nome: 'Elmo do Equinócio', tier: 'perfeito', tipo: 'runica', slot: 'elmo', df: 3, dm: 3, peso: 4, atributos: { PER: 1 }, efeito: 'O portador é imune a cegueira.' },
  { id: 'couraca_equinocio', nome: 'Couraça do Equinócio', tier: 'perfeito', tipo: 'runica', slot: 'peitoral', df: 5, dm: 5, peso: 8, atributos: { CON: 1 }, efeito: 'Uma vez por batalha, iguala a defesa física e a mágica pelo maior valor das duas até o fim do turno.' },
  { id: 'manoplas_equinocio', nome: 'Manoplas do Equinócio', tier: 'perfeito', tipo: 'runica', slot: 'luvas', df: 2, dm: 2, peso: 3, atributos: { FOR: 1 }, bonus: { slots: 1 }, efeito: '+1 slot de magia.' },
  { id: 'grevas_equinocio', nome: 'Grevas do Equinócio', tier: 'perfeito', tipo: 'runica', slot: 'botas', df: 3, dm: 3, peso: 4, atributos: { FDV: 1 }, bonus: { mov: 1 }, efeito: '+1 hexágono de movimento.' },
  { id: 'vestes_balanca', nome: 'Vestes da Balança Eterna', tier: 'lendario', tipo: 'runica', slot: 'peitoral', df: 6, dm: 6, peso: 8, atributos: { CON: 1, FDV: 1 }, efeito: 'Dano recebido é dividido: metade usa a defesa física, metade usa a mágica. Uma vez por batalha, anula o maior dano recebido no turno.' },
  { id: 'elmo_juiz', nome: 'Elmo do Juiz Neutro', tier: 'lendario', tipo: 'runica', slot: 'elmo', df: 4, dm: 4, peso: 4, atributos: { PER: 1, FDV: 1 }, efeito: 'O portador sabe quando alguém mente para ele, e é imune a controle da mente.' },

  // ===== Ruínas de Valgor =====
  { id: 'elmo_salas_ancestrais', nome: 'Elmo das Salas Ancestrais', tier: 'perfeito', tipo: 'runica', slot: 'elmo', df: 3, dm: 3, peso: 4, colecao: 'monstro', tema: 'Ruínas de Valgor', atributos: { PER: 1 }, efeito: 'O portador enxerga no escuro e percebe passagens secretas: +2 em testes de PER para achá-las.' },
  { id: 'manto_torre_esquecida', nome: 'Manto da Torre Esquecida', tier: 'lendario', tipo: 'tecido', slot: 'peitoral', df: 2, dm: 10, peso: 2, colecao: 'monstro', tema: 'Ruínas de Valgor', atributos: { INT: 2 }, bonus: { slots: 2 }, efeito: '+2 slots de magia. As estrelas bordadas se movem: uma vez por batalha, o portador lança uma magia de custo 1 sem gastar ataque mágico.' },
  { id: 'botas_raiz_jardim', nome: 'Botas de Raiz do Jardim', tier: 'perfeito', tipo: 'couro', slot: 'botas', df: 4, dm: 1, peso: 1, colecao: 'monstro', tema: 'Ruínas de Valgor', atributos: { CON: 1 }, efeito: 'O portador não pode ser preso por raízes, teias ou espinhos, e recupera 5% da vida por turno se estiver sobre terra ou plantas.' },

  // ===== Ruínas do Abismo =====
  { id: 'asas_petreas', nome: 'Manto das Asas de Pedra', tier: 'lendario', tipo: 'runica', slot: 'peitoral', df: 6, dm: 6, peso: 9, colecao: 'monstro', tema: 'Ruínas do Abismo', atributos: { CON: 1 }, efeito: 'Uma vez por batalha, as asas de pedra se fecham em volta do portador: anula todo o dano até o início do próximo turno, mas ele não pode se mover nem atacar.' },

  // ===== Cavernas da Estrela Dourada =====
  { id: 'manto_gelo_cristal', nome: 'Manto de Gelo Cristalino', tier: 'perfeito', tipo: 'tecido', slot: 'peitoral', df: 0, dm: 8, peso: 2, colecao: 'monstro', tema: 'Cavernas da Estrela Dourada', atributos: { INT: 1 }, bonus: { dadoMagico: 1 }, efeito: '+1d10 no dano mágico. Imune a frio. Magias de gelo do portador deixam o alvo com −2 de movimento.' }
];

/* ---------- ACESSÓRIOS ---------- */
// Comuns e raros não dão atributos. Use "atributos: { FOR: 1 }" em itens Perfeitos ou acima.
const ACESSORIOS = [
  { id: 'anel_ferro',      nome: 'Anel de Ferro',            tier: 'comum', df: 1, dm: 0, peso: 0, efeito: '+1 DF de item.' },
  { id: 'anel_prata',      nome: 'Anel de Prata Rúnica',     tier: 'comum', df: 0, dm: 1, peso: 0, efeito: '+1 DM de item.' },
  { id: 'cinto_couro',     nome: 'Cinto de Couro Reforçado', tier: 'comum', df: 0, dm: 0, peso: 0, efeito: '+5 de carga.', bonus: { carga: 5 } },
  { id: 'talisma_apostador',nome: 'Talismã do Apostador',    tier: 'comum', df: 0, dm: 0, peso: 0, efeito: '+10% de bônus de dano crítico.', bonus: { critDano: 10 } },
  { id: 'anel_guarda',     nome: 'Anel de Guarda',           tier: 'raro',  df: 2, dm: 0, peso: 0, efeito: '+2 DF de item.' },
  { id: 'anel_runico',     nome: 'Anel Rúnico',              tier: 'raro',  df: 0, dm: 2, peso: 0, efeito: '+2 DM de item.' },
  { id: 'brinco_foco',     nome: 'Brinco de Foco',           tier: 'raro',  df: 0, dm: 0, peso: 0, efeito: '+1 slot de magia.', bonus: { slots: 1 } },
  { id: 'amuleto_cacador', nome: 'Amuleto do Caçador',       tier: 'raro',  df: 0, dm: 0, peso: 0, efeito: '+25% de bônus de dano crítico.', bonus: { critDano: 25 } },
  { id: 'cinto_tita',      nome: 'Cinto do Titã',            tier: 'raro',  df: 0, dm: 0, peso: 0, efeito: '+10 de carga.', bonus: { carga: 10 } },
  { id: 'broche_vento',    nome: 'Broche do Vento',          tier: 'raro',  df: 0, dm: 0, peso: 0, efeito: '+1 hexágono de movimento.', bonus: { mov: 1 } },

  // ===== Semideuses =====
  { id: 'coroa_chama_breve', nome: 'Coroa da Chama Breve', tier: 'lendario', df: 0, dm: 0, peso: 0,
    colecao: 'semideus', tema: 'Valgor, semideus dos humanos', atributos: { CAR: 1, PER: 1 }, bonus: { critDano: 25 },
    efeito: '+25% de bônus de dano crítico. Uma vez por batalha, o portador pode rolar de novo um d10 de ataque, defesa ou crítico.' },
  { id: 'bolsa_sem_fundo', nome: 'Bolsa Sem Fundo de Tobi', tier: 'lendario', df: 0, dm: 0, peso: 0,
    colecao: 'semideus', tema: 'Tobi, semideus dos goblins', bonus: { carga: 30 },
    obtencao: 'Pode estar nas Tumbas de Tobi, ou em qualquer lugar onde Tobi tenha passado.',
    efeito: '+30 kg de carga. Uma vez por dia, o portador tira da bolsa um objeto comum qualquer, se o mestre achar que Tobi guardaria algo assim.' },
  { id: 'coracao_magma', nome: 'Coração de Magma', tier: 'unico', df: 2, dm: 2, peso: 1,
    colecao: 'semideus', tema: 'Semideus dos karlachs', atributos: { CON: 2, FDV: 1 },
    obtencao: 'Escondido sob a primeira forja da Cidade de Karlach. Ninguém lembra de onde exatamente.',
    efeito: 'Imune a fogo. Uma vez por batalha, abaixo de 25% da vida, o portador explode em chamas: 4d10 × nível em todos a até 2 hex, e recupera 30% da vida.',
    historia: 'O semideus dos karlachs arrancou o próprio coração para acender a primeira forja da cidade. O coração ainda bate.',
    desvantagem: 'Esquenta demais: depois do 3º turno de combate, o portador sofre 5% da vida máxima no início de cada turno.' },

  // ===== Cidades =====
  { id: 'talisma_presas_orc', nome: 'Talismã de Presas Orc', tier: 'perfeito', df: 1, dm: 0, peso: 0,
    colecao: 'cidade', tema: 'Grande Reino dos Orcs', atributos: { FOR: 1 }, bonus: { carga: 10 },
    efeito: '+10 kg de carga. Abaixo de 50% da vida, o portador soma +1d10 em todos os ataques.' },
  { id: 'colar_perolas_korgara', nome: 'Colar de Pérolas de Korgara', tier: 'perfeito', df: 0, dm: 2, peso: 0,
    colecao: 'cidade', tema: 'Costa de Korgara', atributos: { CAR: 1 },
    efeito: '+2 DM de item. O portador respira debaixo da água por até 1 hora por dia.' },

  // ===== Monstros =====
  { id: 'selo_pacto_rompido', nome: 'Selo do Pacto Rompido', tier: 'unico', df: 0, dm: 2, peso: 0,
    colecao: 'monstro', tema: 'Aralto do Pacto', atributos: { FOR: 1, FDV: 1 },
    efeito: 'O portador recupera 15% de todo dano físico que causar.',
    historia: 'O selo de um Aralto que tentou quebrar o próprio juramento. A cicatriz vermelha ainda arde na prata.',
    desvantagem: 'Os Araltos sentem o selo: sempre que houver um por perto, ele sabe onde o portador está.' },
  { id: 'coracao_troll', nome: 'Coração de Troll', tier: 'lendario', df: 0, dm: 0, peso: 1,
    colecao: 'monstro', tema: 'Troll',
    efeito: 'O portador recupera 5% da vida máxima no início de cada turno, a não ser que tenha levado dano de fogo ou ácido no turno anterior.' },
  { id: 'perola_fissura', nome: 'Pérola da Fissura', tier: 'unico', df: 3, dm: 3, peso: 0,
    colecao: 'monstro', tema: 'Nascido da Fissura', atributos: { INT: 1, CON: 1 },
    efeito: 'Dupla natureza: no início de cada turno de combate, o portador escolhe ficar imune a dano físico ou a dano mágico até o próximo turno.',
    historia: 'Nas águas escuras da Fissura, o sangue de Jurgmund e a essência do Deus Marcado se misturaram. Esta pérola é o que sobrou quando pararam de brigar.',
    desvantagem: 'Enquanto estiver imune a um tipo, o portador recebe o dobro de dano do outro.' },
  { id: 'nucleo_runico', nome: 'Núcleo Rúnico Anão', tier: 'lendario', df: 2, dm: 2, peso: 3,
    colecao: 'monstro', tema: 'Golem de Ferro Anão', atributos: { CON: 1 },
    efeito: 'O portador é imune a magias de tier Comum.' },
  { id: 'filacterio_vazio', nome: 'Filactério Vazio', tier: 'unico', df: 0, dm: 3, peso: 1,
    colecao: 'monstro', tema: 'Lich', atributos: { INT: 2 }, bonus: { slots: 2 },
    efeito: '+2 slots de magia. Uma vez por sessão, quando o portador morrer, volta 3 turnos depois com 50% da vida.',
    historia: 'O Lich guardava a alma nele. Agora está vazio, e procura outra para guardar.',
    desvantagem: 'O portador conta como morto-vivo: magias sagradas causam o dobro de dano nele e curas recuperam só metade.' },

  // ===== Reino de Verdom =====
  { id: 'selo_guilda_verdom', nome: 'Selo da Guilda de Verdom', tier: 'perfeito', df: 0, dm: 0, peso: 0,
    colecao: 'cidade', tema: 'Verdom, Sede da Guilda', atributos: { CAR: 1 }, bonus: { critDano: 10 },
    efeito: '+10% de bônus de dano crítico. Dá 10% de desconto nas lojas do reino, e uma vez por sessão a Sede da Guilda ajuda o portador com informação, abrigo ou um contrato.' },
  { id: 'anel_juramento_vassalo', nome: 'Anel do Juramento Vassalo', tier: 'perfeito', df: 0, dm: 1, peso: 0,
    colecao: 'cidade', tema: 'Vernand', atributos: { FDV: 1 },
    efeito: '+1 DM de item. Enquanto estiver adjacente ao líder do grupo ou a um nobre que jurou proteger, o portador soma +1 na chance de defesa. Vernand honra o juramento, mesmo sem ter escolhido fazê-lo.' },

  // ===== Deserto de Karlach =====
  { id: 'frasco_gota_jurgmund', nome: 'Frasco da Gota de Jurgmund', tier: 'lendario', df: 0, dm: 1, peso: 1,
    colecao: 'cidade', tema: 'Lago da Gota de Jurgmund', atributos: { CON: 1 },
    obtencao: 'Encontrado na ilhota do Lago da Gota de Jurgmund, por quem vence o teste dos guardiões do oásis.',
    efeito: 'Enche sozinho a cada amanhecer. Uma vez por dia, beber recupera 50% da vida máxima e remove venenos e Marcas Carmesins.' },
  { id: 'lanterna_perdicao', nome: 'Lanterna da Perdição', tier: 'lendario', df: 0, dm: 2, peso: 1,
    colecao: 'monstro', tema: 'O Faroleiro Afogado', atributos: { FDV: 1 },
    efeito: 'Uma vez por batalha, a luz verde se acende: inimigos a até 4 hex fazem teste de FDV. Quem falhar gasta o próximo turno andando em direção ao portador.' },
  { id: 'chifre_quimera', nome: 'Chifre da Quimera', tier: 'lendario', df: 1, dm: 1, peso: 1,
    colecao: 'monstro', tema: 'A Quimera', atributos: { FOR: 1 }, bonus: { critDano: 20 },
    efeito: '+20% de bônus de dano crítico. Uma vez por batalha, o portador sopra fogo como a cabeça de dragão da Quimera: 3d10 × nível de dano mágico num cone de 3 hex.' },
  { id: 'contrato_arquidemonio', nome: 'Contrato do Arquidemônio', tier: 'unico', df: 0, dm: 0, peso: 0,
    colecao: 'monstro', tema: 'O Arquidemônio', atributos: { FOR: 2, INT: 2 }, bonus: { dadoMagico: 2 },
    efeito: '+2d10 no dano mágico, e o portador soma +2d10 em todos os ataques físicos.',
    historia: 'Um pergaminho de pele assinado com sangue. O nome do portador aparece nele sozinho, na primeira vez que ele o toca.',
    desvantagem: 'Uma vez por sessão, o Arquidemônio pede um favor. Se o portador recusar, perde todos os bônus até a próxima sessão e sofre 50% da vida máxima de dano.' },

  // ===== Grande Reino dos Orcs =====
  { id: 'marca_desafio_poder', nome: 'Marca do Desafio de Poder', tier: 'lendario', df: 1, dm: 1, peso: 0,
    colecao: 'cidade', tema: 'Área do Desafio de Poder', atributos: { FOR: 1, CON: 1 },
    obtencao: 'Dada a quem vence o Espírito Ancestral Orc na Área do Desafio de Poder.',
    efeito: 'Dada a quem vence o Desafio de Poder. Todo orc reconhece a marca: nenhum orc ataca o portador sem antes desafiá-lo para um duelo.' },
  { id: 'cinturao_campeao', nome: 'Cinturão do Campeão de Lonk-Carn', tier: 'lendario', df: 2, dm: 0, peso: 2,
    colecao: 'monstro', tema: 'O Campeão de Lonk-Carn', atributos: { FOR: 1 }, bonus: { carga: 20 },
    efeito: '+20 kg de carga. Em duelos de um contra um, o portador soma +2d10 em todos os ataques.' },

  // ===== Grande Ilha de Tortumaga =====
  { id: 'luneta_ana', nome: 'Luneta Anã de Porto Tortuoso', tier: 'perfeito', df: 0, dm: 0, peso: 1,
    colecao: 'cidade', tema: 'Porto Tortuoso', atributos: { PER: 1 },
    efeito: 'Enxerga até 5 vezes mais longe. Em combate, o portador soma +2 hex de alcance em armas à distância e magias.' },
  { id: 'polvora_cinza', nome: 'Bolsa de Pólvora Cinza', tier: 'perfeito', df: 0, dm: 0, peso: 2,
    colecao: 'cidade', tema: 'Goblins Cinzas', atributos: { INT: 1 },
    efeito: 'Duas vezes por batalha, o portador joga uma bomba a até 5 hex: 2d10 × nível em raio 1, inclusive em aliados. Os Goblins Cinzas juram que quase nunca explode na mão.' },
  { id: 'nucleo_contaminado', nome: 'Núcleo Contaminado do Casco', tier: 'unico', df: 2, dm: 4, peso: 1,
    colecao: 'monstro', tema: 'O Verme do Casco', atributos: { CON: 1, FDV: 2 },
    efeito: 'O portador absorve contaminação como a Tartaruga: é imune a Marcas Carmesins, venenos e doenças, e cada efeito desses que tentarem aplicar nele cura 5% da vida máxima.',
    historia: 'A Tartaruga Magnalaga absorveu a contaminação da Batalha Colossal. Parte dela endureceu dentro do casco, e o Verme cresceu comendo isso.',
    desvantagem: 'O núcleo pesa na alma: o portador não pode receber buffs de magias sagradas.' },

  // ===== Montanhas de Atrelon =====
  { id: 'simbolo_vontade_jurgmund', nome: 'Símbolo da Vontade de Jurgmund', tier: 'perfeito', df: 0, dm: 2, peso: 0,
    colecao: 'cidade', tema: "Templo de S'ssara", atributos: { FDV: 1 },
    efeito: '+2 DM de item. Uma vez por dia, o portador pede um sinal a Jurgmund: faz uma pergunta de sim ou não ao mestre, que responde como a Cobra responderia.' },
  { id: 'astrolabio_estelar', nome: 'Astrolábio da Torre Estelar', tier: 'perfeito', df: 0, dm: 1, peso: 1,
    colecao: 'cidade', tema: 'Torre de Observação Estelar', atributos: { PER: 1, INT: 1 },
    efeito: 'À noite, com céu limpo, o portador nunca se perde e sabe a hora exata. Em combate noturno, soma +1 na faixa de crítico.' },
  { id: 'estandarte_bastiao', nome: 'Estandarte do Bastião dos Heróis', tier: 'lendario', df: 1, dm: 1, peso: 3,
    colecao: 'cidade', tema: 'Bastião dos Heróis', atributos: { CAR: 1, FDV: 1 },
    obtencao: 'Guardado no Bastião dos Heróis; entregue a quem provar ser digno dos cinco heróis.',
    efeito: 'Tem as cores dos cinco heróis da Primeira Era. Aliados a até 3 hex do portador somam +1 na chance de defesa e são imunes a medo.' },
  { id: 'ovo_estrela_dourada', nome: 'A Estrela Dourada', tier: 'unico', df: 2, dm: 2, peso: 2,
    colecao: 'monstro', tema: 'A Matriarca Rubra', atributos: { FDV: 1, PER: 1 },
    efeito: 'Uma pedra dourada e quente que brilha como o Dragão Dourado. Dragões e dracos não atacam o portador enquanto ele a mostrar. Uma vez por sessão, o brilho cura 50% da vida de todos os aliados a até 3 hex.',
    historia: 'A Matriarca Rubra guardava a pedra no fundo das cavernas. Os dracos dizem que ela caiu do céu no dia em que Jurgmund partiu.',
    desvantagem: 'Todos os dragões de Aether sentem quando ela troca de mãos, e alguns querem de volta.' },

  // ===== Forja: raros e perfeitos =====
  { id: 'amuleto_cura', nome: 'Amuleto do Curandeiro', tier: 'raro', df: 0, dm: 0, peso: 0, bonus: { dadoCura: 1 }, efeito: '+1d10 nas curas.' },
  { id: 'anel_foco_arcano', nome: 'Anel do Foco Arcano', tier: 'raro', df: 0, dm: 0, peso: 0, bonus: { dadoMagico: 1 }, efeito: '+1d10 no dano mágico.' },
  { id: 'colar_dentes', nome: 'Colar de Dentes', tier: 'raro', df: 0, dm: 0, peso: 0, bonus: { critDano: 15 }, efeito: '+15% de bônus de dano crítico.' },
  { id: 'pulseira_esquiva', nome: 'Pulseira da Esquiva', tier: 'raro', df: 0, dm: 0, peso: 0, efeito: 'Uma vez por batalha, +2 na chance de defesa contra um ataque, depois de ver o resultado do ataque.' },
  { id: 'anel_brasa_fria', nome: 'Anel da Brasa Fria', tier: 'raro', df: 0, dm: 1, peso: 0, efeito: 'Dano de fogo contra o portador cai pela metade.' },
  { id: 'amuleto_antidoto', nome: 'Amuleto do Antídoto', tier: 'raro', df: 0, dm: 0, peso: 0, efeito: 'O portador é imune a veneno.' },
  { id: 'bolsa_alquimista', nome: 'Bolsa do Alquimista', tier: 'raro', df: 0, dm: 0, peso: 1, bonus: { carga: 5 }, efeito: '+5 kg de carga. Uma vez por dia, prepara um tônico que cura 2d10 × nível.' },
  { id: 'brinco_raposa', nome: 'Brinco da Raposa', tier: 'raro', df: 0, dm: 0, peso: 0, efeito: '+2 em testes de CAR para enganar ou negociar.' },
  { id: 'anel_forca', nome: 'Anel da Força Bruta', tier: 'perfeito', df: 0, dm: 0, peso: 0, atributos: { FOR: 1 }, bonus: { carga: 10 }, efeito: '+10 kg de carga.' },
  { id: 'anel_agilidade', nome: 'Anel da Agilidade', tier: 'perfeito', df: 0, dm: 0, peso: 0, atributos: { AGI: 1 }, bonus: { mov: 1 }, efeito: '+1 hexágono de movimento.' },
  { id: 'anel_destreza', nome: 'Anel da Mão Firme', tier: 'perfeito', df: 0, dm: 0, peso: 0, atributos: { DEX: 1 }, efeito: 'Uma vez por batalha, rola de novo um d10 de defesa.' },
  { id: 'amuleto_sabio', nome: 'Amuleto do Sábio', tier: 'perfeito', df: 0, dm: 0, peso: 0, atributos: { INT: 1 }, bonus: { slots: 1 }, efeito: '+1 slot de magia.' },
  { id: 'amuleto_devoto', nome: 'Amuleto do Devoto', tier: 'perfeito', df: 0, dm: 0, peso: 0, atributos: { FDV: 1 }, bonus: { dadoCura: 1 }, efeito: '+1d10 nas curas.' },
  { id: 'anel_olho_aguia', nome: 'Anel do Olho de Águia', tier: 'perfeito', df: 0, dm: 0, peso: 0, atributos: { PER: 1 }, bonus: { critDano: 15 }, efeito: '+15% de bônus de dano crítico.' },
  { id: 'colar_constituicao', nome: 'Colar do Carvalho', tier: 'perfeito', df: 1, dm: 0, peso: 0, atributos: { CON: 1 }, efeito: '+1 DF de item. O portador tem +2 em testes contra doenças e cansaço.' },
  { id: 'amuleto_guarda_dupla', nome: 'Amuleto da Guarda Dupla', tier: 'perfeito', df: 2, dm: 2, peso: 0, atributos: { FDV: 1 }, efeito: '+2 DF e +2 DM de item.' },
  { id: 'broche_diplomata', nome: 'Broche do Diplomata', tier: 'perfeito', df: 0, dm: 0, peso: 0, atributos: { CAR: 1 }, efeito: 'Nobres e comerciantes tratam o portador como alguém importante: +2 em testes de CAR com eles.' },

  // ===== Mais itens para magos e clérigos =====
  { id: 'fita_oracao', nome: 'Fita de Oração', tier: 'comum', df: 0, dm: 1, peso: 0, efeito: 'Curas que o portador lança em si mesmo recuperam +1d10.' },
  { id: 'colar_contas', nome: 'Colar de Contas de Estudo', tier: 'comum', df: 0, dm: 1, peso: 0, efeito: '+2 em testes de INT para lembrar de magias, runas e lendas.' },
  { id: 'anel_mana', nome: 'Anel de Mana', tier: 'raro', df: 0, dm: 0, peso: 0, bonus: { recurso: 1 }, efeito: '+1 no máximo do recurso da classe.' },
  { id: 'pingente_eco', nome: 'Pingente do Eco', tier: 'raro', df: 0, dm: 0, peso: 0, efeito: 'Uma vez por batalha, uma magia de custo 1 não gasta uso.' },
  { id: 'broche_luz', nome: 'Broche da Luz', tier: 'raro', df: 0, dm: 1, peso: 0, efeito: 'O portador lança Luz à vontade, sem gastar usos nem slots.' },
  { id: 'anel_fonte', nome: 'Anel da Fonte', tier: 'perfeito', df: 0, dm: 0, peso: 0, atributos: { FDV: 1 }, bonus: { recurso: 2 }, efeito: '+2 no máximo do recurso da classe.' },
  { id: 'amuleto_duplo_conjuro', nome: 'Amuleto do Duplo Conjuro', tier: 'perfeito', df: 0, dm: 0, peso: 0, atributos: { INT: 1 }, bonus: { slots: 1 }, efeito: '+1 slot de magia. Uma vez por batalha, lança duas magias de custo 1 com um único ataque mágico.' },
  { id: 'broche_sanador', nome: 'Broche do Sanador', tier: 'perfeito', df: 0, dm: 1, peso: 0, atributos: { FDV: 1 }, bonus: { dadoCura: 1 }, efeito: '+1 DM de item e +1d10 nas curas.' },
  { id: 'anel_poco_sem_fundo', nome: 'Anel do Poço Sem Fundo', tier: 'lendario', df: 0, dm: 0, peso: 0, atributos: { INT: 1, FDV: 1 }, bonus: { recurso: 4 }, efeito: '+4 no máximo do recurso da classe. No início de cada batalha, o recurso começa com +2, mesmo para classes que começam com 0.' },

  // ===== Recompensas de missões =====
  { id: 'luneta_aldren', nome: 'Luneta de Aldren', tier: 'lendario', df: 0, dm: 2, peso: 1, atributos: { PER: 2 }, bonus: { critDano: 25 }, efeito: '+25% de bônus de dano crítico. Enxerga até 20 vezes mais longe e vê as estrelas mesmo de dia.' },
  { id: 'ampulheta_partida', nome: 'A Ampulheta Partida', tier: 'unico', df: 0, dm: 3, peso: 1, atributos: { AGI: 1, INT: 1 }, efeito: 'Uma vez por sessão, o portador vira a ampulheta e o último turno inteiro acontece de novo: todos voltam para onde estavam, com a vida e os recursos de antes.', historia: 'A areia desta ampulheta era a do tempo da cidade antiga do deserto. Quando ela quebrou, a cidade parou de envelhecer, e o rei parou de morrer.', desvantagem: 'Cada vez que é usada, o portador envelhece um ano, e o mestre anota. Com dez anos a mais, os atributos físicos caem 1.' },
  { id: 'bussola_carmesim', nome: 'Bússola Carmesim', tier: 'perfeito', df: 0, dm: 1, peso: 0, atributos: { PER: 1 }, efeito: 'A agulha aponta para o fragmento de cristal carmesim mais próximo, a até 10 km. Treme quando um Aralto está a menos de 100 metros.' },
  { id: 'bencao_casco', nome: 'Bênção do Casco', tier: 'lendario', df: 3, dm: 3, peso: 1, atributos: { CON: 1 }, efeito: 'Uma lasca do casco da Tartaruga presa num cordão. O portador respira debaixo da água, não pode ser derrubado nem empurrado, e dano de ácido e veneno cai pela metade.' },
  { id: 'anel_cinco_marcos', nome: 'O Anel dos Cinco Marcos', tier: 'unico', df: 1, dm: 1, peso: 0, atributos: { FOR: 1, DEX: 1, INT: 1, FDV: 1, CAR: 1 }, efeito: 'Um aro de cinco metais, um de cada Marco dos Heróis. O portador ganha um pouco de cada herói da Primeira Era.', historia: 'Arcath, Valdris, Ferrath, Sombrath e Sanctum deixaram um sinal em cada Marco. Juntos, os sinais se fundem neste anel.', desvantagem: 'Os Araltos sabem o que o anel significa: enquanto o portador viver, eles vão persegui-lo como perseguiram os cinco.' },

  // ===== Itens com mecânicas de vida =====
  { id: 'amuleto_ultimo_suspiro', nome: 'Amuleto do Último Suspiro', tier: 'perfeito', df: 0, dm: 1, peso: 0, atributos: { CON: 1 }, efeito: 'Uma vez por batalha, quando a vida do portador cai abaixo de 25%, ele ganha +2 ações de ataque e +1 ataque mágico no próximo turno.' },
  { id: 'luvas_alquimista', nome: 'Anel do Alquimista', tier: 'raro', df: 0, dm: 0, peso: 0, efeito: 'Poções e tônicos que o portador bebe ou prepara duram o dobro do tempo, e curas de poções recuperam +1d10 × nível.' },
  { id: 'pedra_do_limiar', nome: 'Pedra do Limiar', tier: 'lendario', df: 2, dm: 2, peso: 1, atributos: { FDV: 1 }, efeito: 'Uma vez por sessão, quando o portador cairia a 0, fica com 1 de vida e todos os inimigos a até 3 hex são empurrados 2 hex.' },
  { id: 'coroa_tirano', nome: 'A Coroa do Tirano', tier: 'unico', df: 3, dm: 3, peso: 1, atributos: { CAR: 2, MOR: 2 }, efeito: 'Uma vez por batalha, o portador dá uma ordem a um inimigo abaixo de 25% da vida que não seja Chefe nem Colosso: ele passa a lutar pelo grupo até o fim da batalha.', historia: 'Pertenceu a um rei humano que governou antes da Primeira Era terminar. Dizem que ele nunca matava inimigos derrotados: fazia deles soldados.', desvantagem: 'Quem usa a coroa não consegue aceitar ordens: o portador falha automaticamente em testes para obedecer, negociar em desvantagem ou recuar.' },

  // ===== Defesa equilibrada =====
  { id: 'anel_bronze_duplo', nome: 'Anel de Bronze Duplo', tier: 'comum', df: 1, dm: 1, peso: 0, efeito: '+1 DF e +1 DM de item.' },
  { id: 'bracelete_equilibrio', nome: 'Bracelete do Equilíbrio', tier: 'raro', df: 1, dm: 1, peso: 0, efeito: '+1 DF e +1 DM de item. Uma vez por batalha, troca a defesa física e a mágica de lugar até o fim do turno.' },
  { id: 'medalhao_equinocio', nome: 'Medalhão do Equinócio', tier: 'perfeito', df: 2, dm: 2, peso: 0, atributos: { CON: 1 }, efeito: '+2 DF e +2 DM de item.' },

  // ===== Ruínas de Valgor =====
  { id: 'anel_santuario', nome: 'Anel do Santuário', tier: 'perfeito', df: 1, dm: 1, peso: 0, atributos: { FDV: 1 }, efeito: 'Descansar num santuário (fogueira sagrada) recupera também todos os usos de magias por dia e todo o recurso da classe.' },
  { id: 'coracao_valgor', nome: 'O Coração Despedaçado de Valgor', tier: 'unico', df: 3, dm: 3, peso: 1, colecao: 'semideus', tema: 'Valgor, semideus dos humanos', efeito: 'A cada amanhecer, o portador escolhe três atributos diferentes e soma +1 em cada um até o próximo amanhecer. Uma vez por sessão, pode trocar a escolha no meio do dia.', historia: 'Valgor não era o semideus mais forte, era o que mais rápido aprendia. Quando caiu, o coração se partiu em mil formas. Este é o último pedaço que ainda bate.', desvantagem: 'Ambição breve: depois do 3º turno de cada combate, os três atributos escolhidos perdem o bônus e caem 1 até o fim da batalha.', obtencao: 'Cai do Rei Despedaçado, no fim das Ruínas de Valgor.' },

  // ===== Ruínas do Abismo =====
  { id: 'olho_abismo', nome: 'O Olho do Abismo', tier: 'unico', df: 2, dm: 4, peso: 0, colecao: 'monstro', tema: 'Azhrak, o que Jaz sob as Pedras', atributos: { PER: 2, INT: 1 }, efeito: 'O portador enxerga através de paredes de até 1 hex e sabe onde estão todas as criaturas a até 8 hex, mesmo invisíveis. Uma vez por batalha, olha nos olhos de um inimigo: ele fica paralisado no próximo turno (teste de FDV para resistir).', historia: 'Azhrak foi um dos primeiros Araltos, enterrado vivo pelos cinco heróis sob as pedras do deserto. Não morreu. Ficou quinhentos anos olhando para o escuro, e o escuro olhou de volta.', desvantagem: 'O Olho nunca fecha: o portador não consegue dormir de verdade. Cada noite, faz um teste de CON; se falhar, começa o dia com −1 ação de ataque.', obtencao: 'Cai de Azhrak, no fim das Ruínas do Abismo.' },

  // ===== Cavernas da Estrela Dourada =====
  { id: 'escama_estrela_dourada', nome: 'A Escama da Estrela Dourada', tier: 'unico', df: 4, dm: 4, peso: 0, colecao: 'semideus', tema: 'O Grande Dragão Dourado, aspecto de Jurgmund', atributos: { CON: 1, FDV: 1, CAR: 1 }, efeito: 'Uma escama que brilha como uma estrela. O portador é imune a fogo e a Marcas Carmesins, e uma vez por sessão pode chamar o Dragão Dourado: ele sobrevoa a batalha por 1 turno e sopra luz dourada (8d10 × nível em todos os inimigos, curando os aliados na mesma área em 4d10 × nível).', historia: 'O Grande Dragão Dourado é o que restou da luz de Jurgmund depois da Batalha Colossal. Ele não dá esta escama: deixa que alguém a mereça.', desvantagem: 'Criaturas do Deus Marcado sentem a escama de longe: Araltos e crias carmesins sempre sabem onde o portador está, e o atacam primeiro.', obtencao: 'Dada pelo Grande Dragão Dourado, no Pico da Estrela, a quem passar pela prova dele.' }
];

/* ---------- MAGIAS ----------
   categoria: 'dano' | 'cura' | 'buff' | 'ritual' | 'invocacao' | 'utilidade'
   resumo:    texto curto e objetivo mostrado ao lado do nome
   calc:      'dano' (INT + foco + dado) | 'cura' (FDV + foco + dado) | 'absorve' (FDV + dado) | null
   dado:      quantidade de d10 da própria magia
   usos:      { qtd, por: 'batalha' | 'dia' | 'sessao' }
   conjuracao (opcional): tempo para lançar, usado em rituais e invocações longas
   historia, desvantagem (opcional): usados nas magias Únicas
   O custo em slots vem do tier: quanto mais poderosa, mais slots (REGRAS.custoSlotPorTier).
------------------------------------------------ */
const CATEGORIAS_MAGIA = {
  dano:      'Dano',
  cura:      'Cura',
  buff:      'Buff',
  ritual:    'Ritual',
  invocacao: 'Invocação',
  utilidade: 'Utilidade'
};
const DESCRICAO_CATEGORIA_MAGIA = {
  dano:      'Ferem inimigos com dano mágico, calculado contra a defesa mágica.',
  cura:      'Recuperam vida e removem condições.',
  buff:      'Proteção, ações extras, aumento de dano, movimento e crítico.',
  ritual:    'Levam minutos ou horas para lançar e são feitas fora de combate.',
  invocacao: 'Chamam criaturas que lutam ou trabalham por você.',
  utilidade: 'Resolvem problemas fora do dano: luz, idiomas, teleporte curto, invisibilidade.'
};
const USOS_POR = { batalha: 'por batalha', dia: 'por dia', sessao: 'por sessão' };

const MAGIAS = [
  // ===== Dano =====
  { id: 'dardo_mistico',   nome: 'Dardo Místico',       categoria: 'dano', tier: 'comum',    resumo: 'Dano 1d10, acerta sempre',
    calc: 'dano', dado: 1, alcance: '6 hex, 1 alvo', usos: { qtd: 6, por: 'batalha' },
    efeito: 'Um projétil de energia que acerta automaticamente, sem chance de defesa.' },
  { id: 'toque_chocante',  nome: 'Toque Chocante',      categoria: 'dano', tier: 'comum',    resumo: 'Dano 2d10, toque',
    calc: 'dano', dado: 2, alcance: 'Adjacente', usos: { qtd: 4, por: 'batalha' },
    efeito: 'Uma descarga elétrica no inimigo ao seu lado.' },
  { id: 'chama',           nome: 'Chama',               categoria: 'dano', tier: 'comum',    resumo: 'Dano 2d10, 4 hex',
    calc: 'dano', dado: 2, alcance: '4 hex, 1 alvo', usos: { qtd: 4, por: 'batalha' },
    efeito: 'Um jato de fogo contra um único alvo.' },
  { id: 'rajada_gelo',     nome: 'Rajada de Gelo',      categoria: 'dano', tier: 'comum',    resumo: 'Dano em cone, lentidão',
    calc: 'dano', dado: 1, alcance: 'Cone de 3 hex', usos: { qtd: 3, por: 'batalha' },
    efeito: 'Todos no cone sofrem o dano e ficam com −1 de movimento por 1 turno.' },
  { id: 'bola_fogo',       nome: 'Bola de Fogo',        categoria: 'dano', tier: 'raro',     resumo: 'Dano em área',
    calc: 'dano', dado: 2, alcance: '6 hex, alvo + 6 hex ao redor', usos: { qtd: 2, por: 'batalha' },
    efeito: 'Uma explosão que atinge todos na área, inclusive aliados.' },
  { id: 'lanca_relampago', nome: 'Lança de Relâmpago',  categoria: 'dano', tier: 'raro',     resumo: 'Dano 3d10 em linha',
    calc: 'dano', dado: 3, alcance: 'Linha de 5 hex', usos: { qtd: 2, por: 'batalha' },
    efeito: 'Um raio que atinge todos na linha.' },
  { id: 'toque_vampirico', nome: 'Toque Vampírico',     categoria: 'dano', tier: 'raro',     resumo: 'Dano e cura própria',
    calc: 'dano', dado: 2, alcance: 'Adjacente', usos: { qtd: 2, por: 'batalha' },
    efeito: 'Você recupera 50% do dano causado.' },
  { id: 'prisao_espinhos', nome: 'Prisão de Espinhos',  categoria: 'dano', tier: 'raro',     resumo: 'Dano por turno, prende',
    calc: null, dado: 1, alcance: '5 hex, 1 alvo', usos: { qtd: 2, por: 'batalha' },
    efeito: 'Espinhos causam 1d10 × nível no início de cada turno do alvo, por 3 turnos. O alvo não se move no primeiro turno.' },
  { id: 'chuva_meteoros',  nome: 'Chuva de Meteoros',   categoria: 'dano', tier: 'perfeito', resumo: 'Dano 4d10 em área grande',
    calc: 'dano', dado: 4, alcance: '8 hex, raio 2', usos: { qtd: 1, por: 'dia' },
    efeito: 'Meteoros caem sobre uma área de raio 2 (19 hexágonos), atingindo todos, inclusive aliados.' },
  { id: 'julgamento_celeste', nome: 'Julgamento Celeste', categoria: 'dano', tier: 'lendario', resumo: 'Dano 6d10, ignora DM',
    calc: 'dano', dado: 6, alcance: '10 hex, 1 alvo', usos: { qtd: 1, por: 'sessao' },
    efeito: 'Uma coluna de luz atinge um único alvo e ignora toda a defesa mágica dele.' },

  // ===== Cura =====
  { id: 'cura_menor',   nome: 'Cura Menor',     categoria: 'cura', tier: 'comum',    resumo: 'Cura 1 aliado',
    calc: 'cura', dado: 1, alcance: '3 hex', usos: { qtd: 4, por: 'batalha' },
    efeito: 'Cura um aliado ou você mesmo.' },
  { id: 'cura_grupo',   nome: 'Cura em Grupo',  categoria: 'cura', tier: 'raro',     resumo: 'Cura em área',
    calc: 'cura', dado: 0, alcance: 'Raio 2', usos: { qtd: 2, por: 'batalha' },
    efeito: 'Cura todos os aliados na área.' },
  { id: 'regeneracao',  nome: 'Regeneração',    categoria: 'cura', tier: 'raro',     resumo: 'Cura por turno',
    calc: null, dado: 1, alcance: '3 hex', usos: { qtd: 2, por: 'batalha' },
    efeito: 'O alvo recupera 1d10 × nível no início de cada turno dele, por 3 turnos.' },
  { id: 'restauracao',  nome: 'Restauração',    categoria: 'cura', tier: 'perfeito', resumo: 'Cura 3d10, limpa condições',
    calc: 'cura', dado: 3, alcance: 'Adjacente', usos: { qtd: 1, por: 'dia' },
    efeito: 'Cura um aliado e remove todas as condições negativas dele.' },
  { id: 'ressurreicao', nome: 'Ressurreição',   categoria: 'cura', tier: 'lendario', resumo: 'Revive um aliado',
    calc: null, dado: 0, alcance: 'Adjacente', usos: { qtd: 1, por: 'sessao' },
    efeito: 'Gasta 2 ataques mágicos. Um aliado caído há no máximo 1 minuto volta com 50% da vida máxima.' },

  // ===== Buff =====
  { id: 'pele_pedra',     nome: 'Pele de Pedra',    categoria: 'buff', tier: 'comum', resumo: 'Proteção física',
    calc: null, dado: 0, alcance: 'Adjacente', usos: { qtd: 3, por: 'batalha' },
    efeito: '+2 DF de item por 2 turnos.' },
  { id: 'egide_menor',    nome: 'Égide Menor',      categoria: 'buff', tier: 'comum', resumo: 'Proteção mágica',
    calc: null, dado: 0, alcance: 'Adjacente', usos: { qtd: 3, por: 'batalha' },
    efeito: '+2 DM de item por 2 turnos.' },
  { id: 'barreira',       nome: 'Barreira',         categoria: 'buff', tier: 'comum', resumo: 'Escudo que absorve dano',
    calc: 'absorve', dado: 0, alcance: 'Si mesmo', usos: { qtd: 2, por: 'batalha' },
    efeito: 'Absorve dano até o fim do seu próximo turno.' },
  { id: 'bencao_forca',   nome: 'Bênção de Força',  categoria: 'buff', tier: 'comum', resumo: 'Aumento de dano físico',
    calc: null, dado: 0, alcance: '3 hex', usos: { qtd: 3, por: 'batalha' },
    efeito: '+1d10 no dano físico por 2 turnos.' },
  { id: 'foco_arcano',    nome: 'Foco Arcano',      categoria: 'buff', tier: 'comum', resumo: 'Aumento de dano mágico',
    calc: null, dado: 0, alcance: 'Si mesmo', usos: { qtd: 3, por: 'batalha' },
    efeito: 'A próxima magia de dano ganha +1d10.' },
  { id: 'pes_ligeiros',   nome: 'Pés Ligeiros',     categoria: 'buff', tier: 'comum', resumo: 'Movimento +2',
    calc: null, dado: 0, alcance: '3 hex', usos: { qtd: 3, por: 'batalha' },
    efeito: '+2 hexágonos de movimento por 2 turnos.' },
  { id: 'olhar_agucado',  nome: 'Olhar Aguçado',    categoria: 'buff', tier: 'comum', resumo: 'Crítico +1',
    calc: null, dado: 0, alcance: 'Si mesmo', usos: { qtd: 3, por: 'batalha' },
    efeito: '+1 na faixa de crítico do d10 por 2 turnos.' },
  { id: 'santuario',      nome: 'Santuário',        categoria: 'buff', tier: 'raro',  resumo: 'Proteção em área, −25% dano',
    calc: null, dado: 0, alcance: 'Raio 1', usos: { qtd: 1, por: 'batalha' },
    efeito: 'Aliados na área recebem −25% de dano por 1 turno.' },
  { id: 'reflexo_arcano', nome: 'Reflexo Arcano',   categoria: 'buff', tier: 'raro',  resumo: 'Reflete uma magia',
    calc: null, dado: 0, alcance: 'Si mesmo', usos: { qtd: 1, por: 'batalha' },
    efeito: 'A próxima magia de dano recebida volta ao conjurador com 50% do dano.' },
  { id: 'arma_encantada', nome: 'Arma Encantada',   categoria: 'buff', tier: 'raro',  resumo: 'Dano mágico na arma',
    calc: null, dado: 0, alcance: 'Adjacente', usos: { qtd: 2, por: 'batalha' },
    efeito: 'Ataques físicos causam +1d10 de dano mágico extra por 3 turnos (contra a DM do alvo).' },
  { id: 'furia_batalha',  nome: 'Fúria de Batalha', categoria: 'buff', tier: 'raro',  resumo: 'Ações de ataque +1',
    calc: null, dado: 0, alcance: 'Si mesmo', usos: { qtd: 1, por: 'batalha' },
    efeito: '+1 ação de ataque por 2 turnos, mas você recebe +10% de dano.' },
  { id: 'cancao_guerra',  nome: 'Canção de Guerra', categoria: 'buff', tier: 'raro',  resumo: 'Aumento de dano em grupo',
    calc: null, dado: 0, alcance: 'Raio 2', usos: { qtd: 1, por: 'batalha' },
    efeito: 'Aliados na área causam +10% de dano por 2 turnos.' },
  { id: 'aceleracao',     nome: 'Aceleração',       categoria: 'buff', tier: 'raro',  resumo: '+1 ação de ataque e de magia',
    calc: null, dado: 0, alcance: '3 hex', usos: { qtd: 1, por: 'batalha' },
    efeito: 'O alvo ganha +1 ação de ataque e +1 ataque mágico no próximo turno.' },

  // ===== Ritual =====
  { id: 'circulo_vigilia', nome: 'Círculo de Vigília', categoria: 'ritual', tier: 'comum',    resumo: 'Alarme no acampamento',
    calc: null, dado: 0, alcance: 'Raio 5 hex', conjuracao: '10 minutos', usos: { qtd: 1, por: 'dia' },
    efeito: 'Por 8 horas, qualquer criatura que entrar no círculo acorda você e seus aliados com um sino fantasma.' },
  { id: 'purificacao',     nome: 'Purificação',        categoria: 'ritual', tier: 'raro',     resumo: 'Purifica e quebra maldição',
    calc: null, dado: 0, alcance: 'Toque', conjuracao: '10 minutos', usos: { qtd: 1, por: 'dia' },
    efeito: 'Torna comida e água seguras para até 10 pessoas e remove uma maldição de tier Raro ou inferior de uma pessoa ou objeto.' },
  { id: 'portal_retorno',  nome: 'Portal de Retorno',  categoria: 'ritual', tier: 'perfeito', resumo: 'Teleporte do grupo',
    calc: null, dado: 0, alcance: 'Você e até 6 aliados', conjuracao: '1 hora', usos: { qtd: 1, por: 'sessao' },
    efeito: 'Leva o grupo a um lugar que você já visitou e marcou com uma runa.' },

  // ===== Invocação =====
  { id: 'familiar',        nome: 'Familiar',           categoria: 'invocacao', tier: 'comum',    resumo: 'Batedor que não luta',
    calc: null, dado: 0, alcance: 'Adjacente', conjuracao: '1 minuto', usos: { qtd: 1, por: 'dia' },
    efeito: 'Um pequeno espírito animal (coruja, gato ou rato) obedece você. Você enxerga pelos olhos dele. Ele não luta.',
    criatura: { nome: 'Familiar', tamanho: 'pequeno', dificuldade: 1, atributos: { FOR: 1, CON: 1, DEX: 4, AGI: 4, INT: 2, FDV: 2, PER: 4 }, defesaNatural: { df: 0, dm: 1 }, ataques: [  ], duracao: '1 hora', quantidade: 1, naoLuta: true } },
  { id: 'lobo_espiritual', nome: 'Lobo Espiritual',    categoria: 'invocacao', tier: 'raro',     resumo: 'Lobo aliado por 3 turnos',
    calc: null, dado: 2, alcance: '3 hex', usos: { qtd: 1, por: 'batalha' },
    efeito: 'Um lobo feito de luz azul aparece e luta ao seu lado.',
    criatura: { nome: 'Lobo Espiritual', tamanho: 'medio', dificuldade: 2, atributos: { FOR: 2, CON: 2, DEX: 3, AGI: 2, INT: 1, FDV: 2, PER: 3 }, defesaNatural: { df: 2, dm: 1 }, ataques: [ { nome: 'Mordida', dados: 2, tipo: 'fisico', alcance: 'Adjacente', efeito: 'O alvo faz teste de FOR ou cai.' } ], duracao: '3 turnos', quantidade: 1 } },
  { id: 'elemental_fogo',  nome: 'Elemental de Fogo',  categoria: 'invocacao', tier: 'perfeito', resumo: 'Aliado com dano em área',
    calc: null, dado: 3, alcance: '4 hex', usos: { qtd: 1, por: 'dia' },
    efeito: 'Um elemental de chamas vivas sobe do chão e queima tudo ao redor.',
    criatura: { nome: 'Elemental de Fogo', tamanho: 'grande', dificuldade: 2, atributos: { FOR: 3, CON: 3, DEX: 2, AGI: 2, INT: 3, FDV: 2, PER: 2 }, defesaNatural: { df: 2, dm: 4 }, ataques: [ { nome: 'Toque Flamejante', dados: 3, tipo: 'magico', alcance: 'Todos os adjacentes', efeito: 'Atinge todos os adjacentes ao elemental.' } ], duracao: '4 turnos', quantidade: 1, habilidades: [ { nome: 'Corpo de Chamas', efeito: 'Imune a fogo. Quem o atacar corpo a corpo sofre 1d10 × nível.' } ] } },

  // ===== Utilidade =====
  { id: 'luz',              nome: 'Luz',               categoria: 'utilidade', tier: 'comum', resumo: 'Ilumina 4 hex',
    calc: null, dado: 0, alcance: 'Toque', usos: { qtd: 5, por: 'dia' },
    efeito: 'Um objeto brilha como uma tocha, num raio de 4 hex, por 1 hora.' },
  { id: 'detectar_magia',   nome: 'Detectar Magia',    categoria: 'utilidade', tier: 'comum', resumo: 'Revela encantamentos',
    calc: null, dado: 0, alcance: 'Raio 6 hex', usos: { qtd: 3, por: 'dia' },
    efeito: 'Por 10 minutos, você enxerga uma aura em itens, pessoas e lugares encantados e sabe o tier da magia.' },
  { id: 'lingua_universal', nome: 'Língua Universal',  categoria: 'utilidade', tier: 'comum', resumo: 'Entende qualquer idioma',
    calc: null, dado: 0, alcance: 'Si mesmo', usos: { qtd: 1, por: 'dia' },
    efeito: 'Por 1 hora, você entende e fala qualquer idioma falado.' },
  { id: 'passo_nebuloso',   nome: 'Passo Nebuloso',    categoria: 'utilidade', tier: 'raro',  resumo: 'Teleporte de 4 hex',
    calc: null, dado: 0, alcance: 'Si mesmo', usos: { qtd: 2, por: 'batalha' },
    efeito: 'Você some e reaparece num hexágono livre que consiga ver, a até 4 hex, sem ser interceptado.' },
  { id: 'invisibilidade',   nome: 'Invisibilidade',    categoria: 'utilidade', tier: 'raro',  resumo: 'Fica invisível',
    calc: null, dado: 0, alcance: 'Toque', usos: { qtd: 1, por: 'dia' },
    efeito: 'Você ou um aliado fica invisível por 10 minutos, ou até atacar ou lançar uma magia.' },
  // =====================================================================
  // Magias de tiers altos. Únicas têm nome próprio, história e desvantagem.
  // =====================================================================

  // ----- Dano -----
  { id: 'tempestade_raios', nome: 'Tempestade de Raios', categoria: 'dano', tier: 'perfeito', resumo: 'Dano 3d10 em até 3 alvos',
    calc: 'dano', dado: 3, alcance: '8 hex, até 3 alvos', usos: { qtd: 1, por: 'batalha' },
    efeito: 'Três raios caem do céu em até 3 alvos diferentes, cada um com o dano completo.' },
  { id: 'inferno', nome: 'Inferno', categoria: 'dano', tier: 'lendario', resumo: 'Dano 5d10 em área, queima 3 turnos',
    calc: 'dano', dado: 5, alcance: '10 hex, raio 3', usos: { qtd: 1, por: 'dia' },
    efeito: 'Uma área de raio 3 (37 hexágonos) explode em chamas, atingindo todos, inclusive aliados. O chão queima por 3 turnos: quem começar o turno nele sofre 1d10 × nível.' },
  { id: 'ultima_estrela', nome: 'A Última Estrela de Aldren', categoria: 'dano', tier: 'unico', resumo: 'Dano 10d10 em área enorme',
    calc: 'dano', dado: 10, alcance: '15 hex, raio 3', usos: { qtd: 1, por: 'sessao' },
    efeito: 'Você arranca uma estrela do céu e a derruba sobre uma área de raio 3. Todos na área sofrem o dano, e o terreno vira uma cratera intransponível.',
    historia: 'Aldren, o astrônomo louco, passou quarenta anos contando as estrelas. Quando uma sumiu, ele descobriu que podia chamá-la.',
    desvantagem: 'Você perde metade da vida máxima e não pode lançar magias no seu próximo turno.' },

  // ----- Cura -----
  { id: 'estancar', nome: 'Estancar Feridas', categoria: 'cura', tier: 'comum', resumo: 'Cura e remove veneno',
    calc: 'cura', dado: 0, alcance: 'Adjacente', usos: { qtd: 3, por: 'batalha' },
    efeito: 'Cura um aliado e remove sangramento e veneno dele.' },
  { id: 'cura_em_massa', nome: 'Cura em Massa', categoria: 'cura', tier: 'perfeito', resumo: 'Cura 2d10 em área grande',
    calc: 'cura', dado: 2, alcance: 'Raio 3', usos: { qtd: 1, por: 'batalha' },
    efeito: 'Cura todos os aliados num raio de 3 hexágonos ao seu redor.' },
  { id: 'fonte_vida', nome: 'Fonte da Vida', categoria: 'cura', tier: 'lendario', resumo: 'Zona de cura por 5 turnos',
    calc: null, dado: 2, alcance: '6 hex, raio 2', usos: { qtd: 1, por: 'dia' },
    efeito: 'Uma fonte de luz brota do chão por 5 turnos. Aliados que começam o turno na área recuperam 2d10 × nível.' },
  { id: 'lagrimas_ilse', nome: 'Lágrimas de Santa Ilse', categoria: 'cura', tier: 'unico', resumo: 'Vida cheia e revive o grupo',
    calc: null, dado: 0, alcance: 'Aliados a até 10 hex', usos: { qtd: 1, por: 'sessao' },
    efeito: 'Todos os aliados a até 10 hex voltam com a vida cheia, sem condições negativas. Quem caiu nesta batalha se levanta.',
    historia: 'Santa Ilse chorou sobre o campo de Varn depois da última batalha da Guerra dos Reis. Onde as lágrimas caíram, ninguém morreu.',
    desvantagem: 'Você fica com 1 de vida e perde todo o recurso da sua classe.' },

  // ----- Buff -----
  { id: 'armadura_divina', nome: 'Armadura Divina', categoria: 'buff', tier: 'perfeito', resumo: 'Proteção +4 DF e +4 DM',
    calc: null, dado: 0, alcance: '3 hex', usos: { qtd: 1, por: 'batalha' },
    efeito: 'Um aliado recebe +4 DF e +4 DM de item por 3 turnos.' },
  { id: 'celeridade', nome: 'Celeridade', categoria: 'buff', tier: 'perfeito', resumo: '+1 ação de ataque no grupo',
    calc: null, dado: 0, alcance: 'Raio 2', usos: { qtd: 1, por: 'dia' },
    efeito: 'Você e os aliados na área ganham +1 ação de ataque por 2 turnos.' },
  { id: 'invulnerabilidade', nome: 'Invulnerabilidade', categoria: 'buff', tier: 'lendario', resumo: 'Imune a dano por 2 turnos',
    calc: null, dado: 0, alcance: '3 hex', usos: { qtd: 1, por: 'dia' },
    efeito: 'Um aliado não recebe dano de nenhuma fonte por 2 turnos. Condições negativas ainda funcionam.' },
  { id: 'aura_heroica', nome: 'Aura Heroica', categoria: 'buff', tier: 'lendario', resumo: '+2d10 de dano e +1 defesa no grupo',
    calc: null, dado: 0, alcance: 'Raio 3', usos: { qtd: 1, por: 'sessao' },
    efeito: 'Por 3 turnos, você e os aliados na área somam +2d10 no dano físico e mágico e +1 na chance de defesa.' },
  { id: 'coroa_rei_sol', nome: 'A Coroa do Rei-Sol', categoria: 'buff', tier: 'unico', resumo: 'Dobra as ações do grupo',
    calc: null, dado: 0, alcance: 'Raio 3', usos: { qtd: 1, por: 'sessao' },
    efeito: 'Por 3 turnos, você e os aliados na área dobram as ações de ataque e os ataques mágicos.',
    historia: 'O Rei-Sol conquistou sete reinos em sete dias. No oitavo, não conseguiu mais levantar da cama.',
    desvantagem: 'Quando o efeito acaba, todos que o receberam ficam sem nenhuma ação no turno seguinte.' },

  // ----- Ritual -----
  { id: 'bencao_viagem', nome: 'Bênção da Estrada', categoria: 'ritual', tier: 'comum', resumo: 'Viagem sem cansaço',
    calc: null, dado: 0, alcance: 'Você e até 6 aliados', conjuracao: '10 minutos', usos: { qtd: 1, por: 'dia' },
    efeito: 'Por 8 horas, o grupo viaja o dobro da distância normal sem se cansar.' },
  { id: 'terra_consagrada', nome: 'Terra Consagrada', categoria: 'ritual', tier: 'perfeito', resumo: 'Protege o acampamento por 24 h',
    calc: null, dado: 0, alcance: 'Raio 6 hex', conjuracao: '1 hora', usos: { qtd: 1, por: 'dia' },
    efeito: 'Por 24 horas, mortos-vivos e demônios não entram na área, e aliados que descansam 1 hora nela recuperam 20% da vida máxima.' },
  { id: 'comunhao', nome: 'Comunhão', categoria: 'ritual', tier: 'lendario', resumo: '3 perguntas aos deuses',
    calc: null, dado: 0, alcance: 'Si mesmo', conjuracao: '1 hora', usos: { qtd: 1, por: 'sessao' },
    efeito: 'Você faz até 3 perguntas de sim ou não ao mestre, que responde com a verdade como os deuses a conhecem.' },
  { id: 'pacto_morvath', nome: 'O Pacto de Morvath', categoria: 'ritual', tier: 'unico', resumo: 'Traz um morto de volta',
    calc: null, dado: 0, alcance: 'Toque, sobre o corpo ou as cinzas', conjuracao: '8 horas', usos: { qtd: 1, por: 'sessao' },
    efeito: 'Uma pessoa morta há até 1 ano volta à vida, com a vida cheia e todas as lembranças.',
    historia: 'Morvath trouxe a filha de volta. Ela voltou. O que ele deu em troca, ninguém sabe.',
    desvantagem: 'Você perde permanentemente 1 ponto num atributo escolhido pelo mestre.' },

  // ----- Invocação -----
  { id: 'servo_invisivel', nome: 'Servo Invisível', categoria: 'invocacao', tier: 'comum', resumo: 'Ajudante que carrega 20 kg',
    calc: null, dado: 0, alcance: '6 hex', conjuracao: '1 minuto', usos: { qtd: 1, por: 'dia' },
    efeito: 'Uma força invisível obedece ordens simples: carrega até 20 kg, abre portas, limpa e busca objetos. Não luta.',
    criatura: { nome: 'Servo Invisível', tamanho: 'medio', dificuldade: 1, atributos: { FOR: 2, CON: 1, DEX: 2, AGI: 2, INT: 1, FDV: 1, PER: 1 }, defesaNatural: { df: 0, dm: 0 }, ataques: [  ], duracao: '1 hora', quantidade: 1, naoLuta: true } },
  { id: 'guardioes_espectrais', nome: 'Guardiões Espectrais', categoria: 'invocacao', tier: 'perfeito', resumo: '2 cavaleiros aliados por 4 turnos',
    calc: null, dado: 2, alcance: '4 hex', usos: { qtd: 1, por: 'batalha' },
    efeito: 'Dois cavaleiros fantasmas aparecem e protegem o grupo.',
    criatura: { nome: 'Guardião Espectral', tamanho: 'medio', dificuldade: 2, atributos: { FOR: 3, CON: 3, DEX: 2, AGI: 2, INT: 1, FDV: 3, PER: 2 }, defesaNatural: { df: 4, dm: 3 }, ataques: [ { nome: 'Espada Fantasma', dados: 2, tipo: 'fisico', alcance: 'Adjacente', efeito: '' } ], duracao: '4 turnos', quantidade: 2, habilidades: [ { nome: 'Incorpóreo', efeito: 'Atravessa paredes. Armas comuns causam metade do dano nele.' } ] } },
  { id: 'dragao_jovem', nome: 'Invocar Dragão Jovem', categoria: 'invocacao', tier: 'lendario', resumo: 'Dragão com sopro 5d10',
    calc: null, dado: 5, alcance: '6 hex', usos: { qtd: 1, por: 'sessao' },
    efeito: 'Um dragão jovem atende ao chamado e luta pelo grupo.',
    criatura: { nome: 'Dragão Jovem', tamanho: 'grande', dificuldade: 3, atributos: { FOR: 5, CON: 5, DEX: 3, AGI: 3, INT: 3, FDV: 3, PER: 3 }, defesaNatural: { df: 4, dm: 4 }, ataques: [ { nome: 'Mordida', dados: 4, tipo: 'fisico', alcance: 'Adjacente', efeito: '' }, { nome: 'Sopro de Fogo', dados: 5, tipo: 'magico', alcance: 'Cone de 5 hex', efeito: 'Uma vez só durante a invocação.' } ], duracao: '5 turnos', quantidade: 1, habilidades: [ { nome: 'Voo', efeito: 'Voa 8 hex por turno.' } ], voa: true } },
  { id: 'avatar_kaelthar', nome: 'O Avatar de Kaelthar', categoria: 'invocacao', tier: 'unico', resumo: 'Titã aliado por 3 turnos',
    calc: null, dado: 6, alcance: '6 hex', usos: { qtd: 1, por: 'sessao' },
    efeito: 'O titã esquecido Kaelthar se ergue da terra e luta por você.',
    criatura: { nome: 'Avatar de Kaelthar', tamanho: 'colossal', dificuldade: 4, atributos: { FOR: 8, CON: 7, DEX: 2, AGI: 2, INT: 2, FDV: 5, PER: 3 }, defesaNatural: { df: 6, dm: 5 }, ataques: [ { nome: 'Punho do Titã', dados: 6, tipo: 'fisico', alcance: 'Todos os adjacentes', efeito: 'Atinge todos os adjacentes.' } ], duracao: '3 turnos', quantidade: 1 },
    historia: 'Kaelthar dormia sob a montanha antes de existirem reis. Ele não serve a ninguém; só aceita emprestar a força por um instante.',
    desvantagem: 'Ao sumir, o titã faz um último ataque contra a criatura mais próxima, seja aliada ou inimiga.' },

  // ----- Utilidade -----
  { id: 'voo', nome: 'Voo', categoria: 'utilidade', tier: 'perfeito', resumo: 'Voa por 10 minutos',
    calc: null, dado: 0, alcance: 'Toque', usos: { qtd: 1, por: 'dia' },
    efeito: 'Você ou um aliado voa por 10 minutos: ignora terreno e obstáculos no chão e ganha +2 de movimento.' },
  { id: 'porta_dimensional', nome: 'Porta Dimensional', categoria: 'utilidade', tier: 'perfeito', resumo: 'Teleporte de 20 hex com aliados',
    calc: null, dado: 0, alcance: 'Até 20 hex', usos: { qtd: 1, por: 'dia' },
    efeito: 'Você e até 2 aliados adjacentes aparecem num lugar que você consiga ver ou já conheça, a até 20 hex.' },
  { id: 'parar_tempo', nome: 'Parar o Tempo', categoria: 'utilidade', tier: 'lendario', resumo: '2 turnos seguidos só seus',
    calc: null, dado: 0, alcance: 'Si mesmo', usos: { qtd: 1, por: 'sessao' },
    efeito: 'O tempo para para todos menos você por 2 turnos. Você pode se mover, se curar, se proteger e preparar Runas, mas nada que faça afeta outra criatura até o tempo voltar.' },
  { id: 'olho_oraculo', nome: 'O Olho do Oráculo Cego', categoria: 'utilidade', tier: 'unico', resumo: 'Vê qualquer lugar ou pessoa',
    calc: null, dado: 0, alcance: 'Ilimitado', conjuracao: '1 minuto', usos: { qtd: 1, por: 'sessao' },
    efeito: 'Por 10 minutos, você vê e ouve qualquer lugar ou pessoa que já tenha visto ao menos uma vez, não importa a distância.',
    historia: 'O Oráculo arrancou os próprios olhos para ver tudo. Dizem que ainda enxerga através de quem lança esta magia.',
    desvantagem: 'Você fica cego por 1 hora depois.' },

  // ===== Magias novas =====
  { id: 'pedrada_arcana', nome: 'Pedrada Arcana', categoria: 'dano', tier: 'comum', resumo: 'Dano 2d10, derruba', calc: 'dano', dado: 2, alcance: '4 hex, 1 alvo', usos: { qtd: 4, por: 'batalha' }, efeito: 'Uma pedra de energia bate no alvo. Se ele falhar num teste de FOR, cai no chão.' },
  { id: 'agulhas_sombra', nome: 'Agulhas de Sombra', categoria: 'dano', tier: 'comum', resumo: 'Dano 1d10 em até 3 alvos', calc: 'dano', dado: 1, alcance: '6 hex, até 3 alvos', usos: { qtd: 3, por: 'batalha' }, efeito: 'Três agulhas escuras, cada uma num alvo diferente. A defesa mágica é subtraída de cada uma.' },
  { id: 'cone_de_frio', nome: 'Cone de Frio', categoria: 'dano', tier: 'raro', resumo: 'Dano 2d10 em cone, lentidão 2 turnos', calc: 'dano', dado: 2, alcance: 'Cone de 4 hex', usos: { qtd: 2, por: 'batalha' }, efeito: 'Todos no cone sofrem o dano e ficam com −2 de movimento por 2 turnos.' },
  { id: 'raio_solar', nome: 'Raio Solar', categoria: 'dano', tier: 'raro', resumo: 'Dano 3d10 em linha, cega', calc: 'dano', dado: 3, alcance: 'Linha de 6 hex', usos: { qtd: 2, por: 'batalha' }, efeito: 'Um raio de luz atinge todos na linha. Quem for atingido fica com −2 na chance de defesa no próximo turno. Mortos-vivos sofrem +1d10.' },
  { id: 'explosao_trovao', nome: 'Explosão de Trovão', categoria: 'dano', tier: 'raro', resumo: 'Dano 2d10 ao redor, empurra', calc: 'dano', dado: 2, alcance: 'Raio 1 ao seu redor', usos: { qtd: 2, por: 'batalha' }, efeito: 'Um estrondo sai do conjurador: todos a até 1 hex sofrem o dano e são empurrados 2 hex.' },
  { id: 'desintegrar', nome: 'Desintegrar', categoria: 'dano', tier: 'perfeito', resumo: 'Dano 5d10, ignora metade da DM', calc: 'dano', dado: 5, alcance: '6 hex, 1 alvo', usos: { qtd: 1, por: 'batalha' }, efeito: 'Um raio verde fino num único alvo. Ignora 50% da defesa mágica. Se derrubar o alvo, sobra só pó.' },
  { id: 'tempestade_gelo', nome: 'Tempestade de Gelo', categoria: 'dano', tier: 'perfeito', resumo: 'Dano 3d10 em área, chão escorregadio', calc: 'dano', dado: 3, alcance: '8 hex, raio 2', usos: { qtd: 1, por: 'dia' }, efeito: 'Granizo cai numa área de raio 2. O chão fica escorregadio por 3 turnos: quem se mover nele faz teste de DEX ou cai.' },
  { id: 'palavra_de_poder', nome: 'Palavra de Poder: Cair', categoria: 'dano', tier: 'lendario', resumo: 'Derruba de vez quem está fraco', calc: 'dano', dado: 4, alcance: '6 hex, 1 alvo', usos: { qtd: 1, por: 'dia' }, efeito: 'Uma palavra antiga. Se o alvo estiver abaixo de 20% da vida máxima e não for Chefe nem Colosso, ele cai na hora. Se não, sofre 4d10.' },
  { id: 'toque_revigorante', nome: 'Toque Revigorante', categoria: 'cura', tier: 'comum', resumo: 'Cura pequena, tira cansaço', calc: 'cura', dado: 0, alcance: 'Adjacente', usos: { qtd: 4, por: 'batalha' }, efeito: 'Cura o alvo e remove o cansaço de uma noite mal dormida ou de uma marcha forçada.' },
  { id: 'raio_cura', nome: 'Raio de Cura', categoria: 'cura', tier: 'raro', resumo: 'Cura 2d10 à distância', calc: 'cura', dado: 2, alcance: '8 hex', usos: { qtd: 3, por: 'batalha' }, efeito: 'Um feixe de luz cura um aliado longe.' },
  { id: 'vinculo_vital', nome: 'Vínculo Vital', categoria: 'cura', tier: 'perfeito', resumo: 'Divide o dano entre dois aliados', calc: 'cura', dado: 1, alcance: '6 hex, 2 aliados', usos: { qtd: 1, por: 'batalha' }, efeito: 'Liga dois aliados por 3 turnos: todo dano que um deles recebe é dividido igualmente entre os dois. Ao lançar, cura os dois.' },
  { id: 'aura_vida', nome: 'Aura da Vida', categoria: 'cura', tier: 'lendario', resumo: 'Cura 2d10 por turno em área', calc: 'cura', dado: 2, alcance: 'Raio 3 ao seu redor', usos: { qtd: 1, por: 'dia' }, efeito: 'Por 3 turnos, no início de cada turno seu, todos os aliados a até 3 hex recuperam o valor da cura.' },
  { id: 'escudo_arcano', nome: 'Escudo Arcano', categoria: 'buff', tier: 'comum', resumo: '+2 de defesa contra um ataque', calc: null, dado: 0, alcance: 'Si mesmo', usos: { qtd: 3, por: 'batalha' }, efeito: 'Reação: quando for atacado, lance para somar +2 na chance de defesa contra aquele ataque.' },
  { id: 'protecao_elemental', nome: 'Proteção Elemental', categoria: 'buff', tier: 'raro', resumo: 'Metade do dano de um elemento', calc: null, dado: 0, alcance: 'Toque', usos: { qtd: 2, por: 'dia' }, efeito: 'Escolha fogo, frio, raio ou ácido: por 1 hora, o alvo recebe metade do dano desse elemento.' },
  { id: 'heroismo', nome: 'Heroísmo', categoria: 'buff', tier: 'perfeito', resumo: 'Imune a medo e vida extra', calc: null, dado: 0, alcance: 'Raio 2', usos: { qtd: 1, por: 'batalha' }, efeito: 'Por 3 turnos, os aliados na área ficam imunes a medo e ganham um escudo que absorve 2d10 × nível de dano.' },
  { id: 'pressa_maior', nome: 'Pressa Maior', categoria: 'buff', tier: 'lendario', resumo: '+2 ações de ataque e movimento dobrado', calc: null, dado: 0, alcance: 'Toque', usos: { qtd: 1, por: 'dia' }, efeito: 'Por 2 turnos, o alvo ganha +2 ações de ataque e o movimento dobra. Quando acaba, ele perde o turno seguinte de cansaço.' },
  { id: 'mensageiro_vento', nome: 'Mensageiro do Vento', categoria: 'ritual', tier: 'raro', resumo: 'Mensagem a 100 km', calc: null, dado: 0, alcance: 'Até 100 km', conjuracao: '10 minutos', usos: { qtd: 1, por: 'dia' }, efeito: 'Um pássaro de vento leva uma mensagem de até 25 palavras para uma pessoa que você conheça, a até 100 km.' },
  { id: 'clarividencia', nome: 'Clarividência', categoria: 'ritual', tier: 'perfeito', resumo: 'Vê um lugar distante', calc: null, dado: 0, alcance: 'Qualquer lugar conhecido', conjuracao: '10 minutos', usos: { qtd: 1, por: 'dia' }, efeito: 'Por 10 minutos, você vê e ouve um lugar que já visitou, como se estivesse lá.' },
  { id: 'selo_carmesim', nome: 'Selo Carmesim', categoria: 'ritual', tier: 'lendario', resumo: 'Sela um fragmento do Deus Marcado', calc: null, dado: 0, alcance: 'Toque, sobre o cristal', conjuracao: '1 hora', usos: { qtd: 1, por: 'sessao' }, efeito: 'Prende um cristal carmesim num selo de prata e runas. Criaturas carmesins e Araltos não conseguem mais senti-lo nem usá-lo.' },
  { id: 'revoada_corvos', nome: 'Revoada de Corvos', categoria: 'invocacao', tier: 'comum', resumo: 'Enxame que cega', calc: null, dado: 0, alcance: '6 hex', usos: { qtd: 1, por: 'batalha' }, efeito: 'Uma nuvem de corvos cerca um ponto e atrapalha quem estiver ali.', criatura: { nome: 'Revoada de Corvos', tamanho: 'medio', dificuldade: 1, atributos: { FOR: 1, CON: 1, DEX: 3, AGI: 3, INT: 1, FDV: 1, PER: 3 }, defesaNatural: { df: 0, dm: 0 }, ataques: [ { nome: 'Bicadas', dados: 1, tipo: 'fisico', alcance: 'Mesmo hexágono e adjacentes', efeito: 'Quem for atingido tem −1 na chance de defesa no próximo turno.' } ], duracao: '2 turnos', quantidade: 1, habilidades: [ { nome: 'Enxame', efeito: 'Ataques de alvo único causam metade do dano nele.' } ], voa: true } },
  { id: 'levantar_mortos', nome: 'Levantar Mortos', categoria: 'invocacao', tier: 'raro', resumo: '2 esqueletos aliados', calc: null, dado: 0, alcance: '4 hex', usos: { qtd: 1, por: 'batalha' }, efeito: 'Dois esqueletos saem do chão e obedecem até o fim da batalha. Precisa de ossos ou túmulos por perto.', criatura: { nome: 'Esqueleto Servo', tamanho: 'medio', dificuldade: 1, atributos: { FOR: 2, CON: 2, DEX: 2, AGI: 2, INT: 1, FDV: 1, PER: 1 }, defesaNatural: { df: 2, dm: 0 }, ataques: [ { nome: 'Espada Enferrujada', dados: 2, tipo: 'fisico', alcance: 'Adjacente', efeito: '' } ], duracao: 'até o fim da batalha', quantidade: 2 } },
  { id: 'golem_barro', nome: 'Golem de Barro', categoria: 'invocacao', tier: 'raro', resumo: 'Guarda-costas lento e resistente', calc: null, dado: 0, alcance: '3 hex', usos: { qtd: 1, por: 'batalha' }, efeito: 'Um golem de barro se ergue e protege quem você mandar.', criatura: { nome: 'Golem de Barro', tamanho: 'grande', dificuldade: 2, atributos: { FOR: 4, CON: 4, DEX: 1, AGI: 1, INT: 1, FDV: 2, PER: 1 }, defesaNatural: { df: 4, dm: 2 }, ataques: [ { nome: 'Punho de Barro', dados: 2, tipo: 'fisico', alcance: 'Adjacente', efeito: '' } ], duracao: '4 turnos', quantidade: 1, habilidades: [ { nome: 'Guarda-costas', efeito: 'Aliados adjacentes a ele recebem +1 na chance de defesa.' } ] } },
  { id: 'aguia_gigante', nome: 'Águia Gigante', categoria: 'invocacao', tier: 'perfeito', resumo: 'Montaria voadora que ataca', calc: null, dado: 0, alcance: '4 hex', usos: { qtd: 1, por: 'dia' }, efeito: 'Uma águia gigante aparece. Ela luta, ou carrega um aliado médio pelo ar.', criatura: { nome: 'Águia Gigante', tamanho: 'grande', dificuldade: 2, atributos: { FOR: 3, CON: 3, DEX: 4, AGI: 4, INT: 1, FDV: 2, PER: 5 }, defesaNatural: { df: 2, dm: 2 }, ataques: [ { nome: 'Garras', dados: 3, tipo: 'fisico', alcance: 'Adjacente', efeito: '' }, { nome: 'Bico', dados: 2, tipo: 'fisico', alcance: 'Adjacente', efeito: '' } ], duracao: '1 hora', quantidade: 1, habilidades: [ { nome: 'Montaria', efeito: 'Carrega um aliado médio ou menor. Voa 10 hex por turno.' } ], voa: true } },
  { id: 'guardiao_celestial', nome: 'Guardião Celestial', categoria: 'invocacao', tier: 'lendario', resumo: 'Protetor alado que cura', calc: null, dado: 0, alcance: '6 hex', usos: { qtd: 1, por: 'sessao' }, efeito: 'Um guerreiro de luz com asas desce e protege o grupo.', criatura: { nome: 'Guardião Celestial', tamanho: 'grande', dificuldade: 3, atributos: { FOR: 5, CON: 5, DEX: 3, AGI: 3, INT: 3, FDV: 6, PER: 4 }, defesaNatural: { df: 5, dm: 5 }, ataques: [ { nome: 'Lâmina de Luz', dados: 4, tipo: 'fisico', alcance: 'Adjacente', efeito: 'Contra mortos-vivos e criaturas carmesins, +2d10.' } ], duracao: '5 turnos', quantidade: 1, habilidades: [ { nome: 'Luz Curadora', efeito: 'No fim de cada turno dele, cura 2d10 × nível no aliado mais ferido a até 4 hex.' } ], voa: true } },
  { id: 'mao_arcana', nome: 'Mão Arcana', categoria: 'utilidade', tier: 'comum', resumo: 'Mão invisível que pega coisas', calc: null, dado: 0, alcance: '6 hex', usos: { qtd: 5, por: 'dia' }, efeito: 'Uma mão de energia pega, puxa ou empurra um objeto de até 5 kg a até 6 hex, por 1 minuto.' },
  { id: 'reparar', nome: 'Consertar', categoria: 'utilidade', tier: 'comum', resumo: 'Conserta objetos pequenos', calc: null, dado: 0, alcance: 'Toque', conjuracao: '1 minuto', usos: { qtd: 3, por: 'dia' }, efeito: 'Conserta uma corda, um frasco, uma fechadura ou uma peça de equipamento rachada. Não recupera itens destruídos.' },
  { id: 'guelras', nome: 'Guelras', categoria: 'utilidade', tier: 'raro', resumo: 'Respirar debaixo da água', calc: null, dado: 0, alcance: 'Toque, até 4 alvos', usos: { qtd: 1, por: 'dia' }, efeito: 'Até 4 pessoas respiram e falam normalmente debaixo da água por 1 hora.' },
  { id: 'falar_animais', nome: 'Falar com Animais', categoria: 'utilidade', tier: 'raro', resumo: 'Conversa com animais', calc: null, dado: 0, alcance: 'Si mesmo', usos: { qtd: 2, por: 'dia' }, efeito: 'Por 10 minutos, você entende e fala com animais comuns. Eles não ficam mais espertos por isso.' },
  { id: 'forma_animal', nome: 'Metamorfose', categoria: 'utilidade', tier: 'perfeito', resumo: 'Vira um animal', calc: null, dado: 0, alcance: 'Si mesmo', usos: { qtd: 1, por: 'dia' }, efeito: 'Você vira um animal comum de tamanho médio ou menor por até 1 hora. Mantém a mente, mas não pode lançar magias.' },
  { id: 'visao_verdadeira', nome: 'Visão da Verdade', categoria: 'utilidade', tier: 'lendario', resumo: 'Vê através de ilusões e disfarces', calc: null, dado: 0, alcance: 'Si mesmo', usos: { qtd: 1, por: 'dia' }, efeito: 'Por 10 minutos, você vê invisíveis, ilusões, disfarces e a forma verdadeira de quem mudou de corpo. Máscaras mágicas não enganam você.' },

  // ===== Recompensas de missões =====
  { id: 'olhar_eclipse', nome: 'Olhar do Eclipse', categoria: 'dano', tier: 'lendario', resumo: 'Dano 4d10 em área, escuridão', calc: 'dano', dado: 4, alcance: '8 hex, raio 2', usos: { qtd: 1, por: 'dia' }, efeito: 'Um disco negro engole a luz da área. Todos sofrem o dano e ficam cegos (−3 na chance de defesa e sem ataques à distância) até o fim do próximo turno.' },
  { id: 'cancao_afogados', nome: 'Canção dos Afogados', categoria: 'dano', tier: 'perfeito', resumo: 'Dano 3d10, afoga, perde ação', calc: 'dano', dado: 3, alcance: '6 hex, raio 1', usos: { qtd: 1, por: 'batalha' }, efeito: 'Os pulmões dos alvos se enchem de água. Quem falhar num teste de CON perde a próxima ação de ataque.' },
  { id: 'bencao_tartaruga', nome: 'Bênção da Tartaruga', categoria: 'buff', tier: 'perfeito', resumo: '+3 DF de item no grupo, respirar água', calc: null, dado: 0, alcance: 'Raio 2', usos: { qtd: 1, por: 'dia' }, efeito: 'Por 1 hora, você e os aliados na área recebem +3 DF de item, respiram debaixo da água e não podem ser derrubados.' },
  { id: 'espelho_magico', nome: 'Imagens Espelhadas', categoria: 'buff', tier: 'perfeito', resumo: 'Cópias falsas que atraem ataques', calc: null, dado: 0, alcance: 'Si mesmo', usos: { qtd: 1, por: 'batalha' }, efeito: 'Três cópias suas aparecem por 3 turnos. Cada ataque contra você rola 1d10: de 1 a 3 (enquanto houver cópias) acerta uma cópia, que some.' },
  { id: 'teia_rainha', nome: 'Teia da Rainha', categoria: 'utilidade', tier: 'raro', resumo: 'Prende todos numa área', calc: null, dado: 0, alcance: '6 hex, raio 1', usos: { qtd: 2, por: 'batalha' }, efeito: 'Uma teia grossa cobre a área. Quem estiver nela faz teste de DEX ou fica preso até passar num teste de FOR. Fogo queima a teia na hora.' },
  { id: 'rastro_carmesim', nome: 'Rastro Carmesim', categoria: 'ritual', tier: 'raro', resumo: 'Acha fragmentos a 10 km', calc: null, dado: 0, alcance: '10 km', conjuracao: '10 minutos', usos: { qtd: 1, por: 'dia' }, efeito: 'Você sente a direção e a distância de todos os fragmentos de cristal carmesim a até 10 km, e sabe se algum Aralto tocou neles nos últimos dias.' },
  { id: 'voltar_tempo', nome: 'Retroceder', categoria: 'utilidade', tier: 'lendario', resumo: 'Desfaz o último turno de um aliado', calc: null, dado: 0, alcance: '6 hex', usos: { qtd: 1, por: 'sessao' }, efeito: 'Reação: logo depois do turno de um aliado (ou de um inimigo contra ele), desfaça esse turno. Tudo volta a como estava, e o turno é jogado de novo.' },
  { id: 'enxame_ratos', nome: 'Chamado do Rei dos Ratos', categoria: 'invocacao', tier: 'raro', resumo: 'Enxame de ratos aliado', calc: null, dado: 0, alcance: '4 hex', usos: { qtd: 1, por: 'batalha' }, efeito: 'Um mar de ratos sai das frestas e ataca quem você mandar.', criatura: { nome: 'Enxame de Ratos', tamanho: 'medio', dificuldade: 1, atributos: { FOR: 2, CON: 2, DEX: 3, AGI: 3, INT: 1, FDV: 1, PER: 3 }, defesaNatural: { df: 1, dm: 0 }, ataques: [ { nome: 'Mordidas', dados: 2, tipo: 'fisico', alcance: 'Mesmo hexágono e adjacentes', efeito: 'Atinge todos os inimigos no mesmo hexágono e adjacentes.' } ], duracao: '4 turnos', quantidade: 1, habilidades: [ { nome: 'Enxame', efeito: 'Ataques de alvo único causam metade do dano; área causa o dobro.' } ] } },

  // ===== Magias interessantes =====
  { id: 'executar', nome: 'Executar', categoria: 'dano', tier: 'raro', resumo: 'Dano 2d10, dobro abaixo de 25%', calc: 'dano', dado: 2, alcance: '4 hex, 1 alvo', usos: { qtd: 2, por: 'batalha' }, efeito: 'Se o alvo estiver abaixo de 25% da vida, o dano é dobrado.' },
  { id: 'espinhos_sangue', nome: 'Espinhos de Sangue', categoria: 'dano', tier: 'raro', resumo: 'Paga 10% da vida, dano 3d10+', calc: 'dano', dado: 3, alcance: '5 hex, raio 1', usos: { qtd: 2, por: 'batalha' }, efeito: 'Você perde 10% da vida máxima; espinhos de sangue saem do chão na área. Se você estiver abaixo de 50% da vida, soma +2d10.' },
  { id: 'bola_fogo_retardada', nome: 'Bola de Fogo Retardada', categoria: 'dano', tier: 'perfeito', resumo: 'Explode no próximo turno com +2d10', calc: 'dano', dado: 4, alcance: '8 hex, raio 2', usos: { qtd: 1, por: 'batalha' }, efeito: 'Uma brasa fica pairando no ponto escolhido e explode no início do seu próximo turno. Os inimigos veem a brasa e podem tentar sair da área.' },
  { id: 'transferir_vida', nome: 'Transferir Vida', categoria: 'cura', tier: 'raro', resumo: 'Dá a sua vida em dobro a um aliado', calc: null, dado: 0, alcance: '6 hex', usos: { qtd: 2, por: 'batalha' }, efeito: 'Você perde até 20% da sua vida máxima, e um aliado recupera o dobro do que você perdeu.' },
  { id: 'corrente_vital', nome: 'Corrente Vital', categoria: 'cura', tier: 'perfeito', resumo: 'Cura salta entre 3 aliados', calc: 'cura', dado: 2, alcance: '6 hex, até 3 aliados', usos: { qtd: 1, por: 'batalha' }, efeito: 'A cura atinge um aliado e salta para mais dois a até 3 hex, com metade do valor a cada salto. Aliados abaixo de 25% da vida recebem o valor cheio.' },
  { id: 'ultimo_recurso', nome: 'Último Recurso', categoria: 'buff', tier: 'perfeito', resumo: 'Abaixo de 25%: cura 50% e +1 ação', calc: null, dado: 0, alcance: 'Si mesmo', usos: { qtd: 1, por: 'dia' }, efeito: 'Só pode ser lançada com menos de 25% da vida. Você recupera 50% da vida máxima e ganha +1 ação de ataque e +1 ataque mágico neste turno.' },
  { id: 'troca_lugar', nome: 'Troca de Lugar', categoria: 'utilidade', tier: 'comum', resumo: 'Troca de posição com um aliado', calc: null, dado: 0, alcance: '8 hex', usos: { qtd: 2, por: 'batalha' }, efeito: 'Você e um aliado que você veja trocam de lugar na hora, sem serem interceptados.' },
  { id: 'chao_gelo', nome: 'Chão de Gelo', categoria: 'utilidade', tier: 'comum', resumo: 'Área escorregadia', calc: null, dado: 0, alcance: '6 hex, raio 1', usos: { qtd: 2, por: 'batalha' }, efeito: 'O chão da área congela por 3 turnos. Quem entrar ou começar o turno nele faz teste de DEX ou cai.' },
  { id: 'silencio', nome: 'Silêncio', categoria: 'utilidade', tier: 'raro', resumo: 'Ninguém lança magia na área', calc: null, dado: 0, alcance: '8 hex, raio 2', usos: { qtd: 1, por: 'batalha' }, efeito: 'Por 2 turnos, nenhum som existe na área: ninguém dentro dela consegue lançar magias nem usar habilidades de voz.' },
  { id: 'enfraquecer', nome: 'Enfraquecer', categoria: 'utilidade', tier: 'raro', resumo: 'Alvo perde 2 FOR e 1 ação', calc: null, dado: 0, alcance: '6 hex, 1 alvo', usos: { qtd: 2, por: 'batalha' }, efeito: 'O alvo faz teste de FDV. Se falhar, perde 2 de FOR (menos dados de dano) e 1 ação de ataque por 2 turnos.' },
  { id: 'espada_dancante', nome: 'Espada Dançante', categoria: 'invocacao', tier: 'perfeito', resumo: 'Espada que luta sozinha', calc: null, dado: 0, alcance: '3 hex', usos: { qtd: 1, por: 'batalha' }, efeito: 'Uma espada de luz aparece e ataca quem você apontar.', criatura: { nome: 'Espada Dançante', tamanho: 'pequeno', dificuldade: 2, atributos: { FOR: 3, CON: 2, DEX: 4, AGI: 3, INT: 1, FDV: 3, PER: 3 }, defesaNatural: { df: 4, dm: 4 }, ataques: [ { nome: 'Corte de Luz', dados: 3, tipo: 'fisico', alcance: 'Adjacente', efeito: 'Contra alvos abaixo de 50% da vida, +1d10.' } ], duracao: '4 turnos', quantidade: 1, voa: true, habilidades: [ { nome: 'Voo', efeito: 'Voa 6 hex por turno.' } ] } },
  { id: 'ressonancia', nome: 'Ressonância', categoria: 'dano', tier: 'lendario', resumo: 'Repete a última magia de dano de um aliado', calc: null, dado: 0, alcance: 'Da magia repetida', usos: { qtd: 1, por: 'dia' }, efeito: 'Reação: logo depois que um aliado lança uma magia de dano, você a lança de novo, com os mesmos dados dele e no mesmo alvo ou área.' }
];

/* ---------- EVOLUÇÃO ----------
   attr   = atributo que define o peso (valor distribuído no nível 1)
   gasto  = multiplicador do custo
   bonus  = o que cada bolinha soma:
     dadoFisico, dadoMagico (d10), carga (kg), vida (PV), acoesAtaque, reacoes,
     critFaixa (+1 no d10 de crítico), maestria, recurso,
     pericia: { ATR: n }, teste: { ATR: n }
------------------------------------------------ */
const EVOLUCOES = [
  // FOR
  { id: 'for_dano',    attr: 'FOR', nome: 'Dano natural',        efeito: '+1d10 no dano físico',                          gasto: 5,  bonus: { dadoFisico: 1 } },
  { id: 'for_carga',   attr: 'FOR', nome: 'Capacidade de carga', efeito: '+20 kg de carga',                               gasto: 4,  bonus: { carga: 20 } },
  { id: 'for_teste',   attr: 'FOR', nome: 'Atributo FOR',        efeito: '+2 em testes de FOR',                           gasto: 3,  bonus: { teste: { FOR: 2 } } },
  // CON
  { id: 'con_pericia', attr: 'CON', nome: 'Perícia de CON',      efeito: '+1 na chance de acerto de perícias de CON',     gasto: 5,  bonus: { pericia: { CON: 1 } } },
  { id: 'con_vida',    attr: 'CON', nome: 'Pontos de vida',      efeito: '+20 PV',                                        gasto: 5,  bonus: { vida: 20 } },
  { id: 'con_teste',   attr: 'CON', nome: 'Atributo CON',        efeito: '+2 em testes de CON',                           gasto: 3,  bonus: { teste: { CON: 2 } } },
  // DEX
  { id: 'dex_pericia', attr: 'DEX', nome: 'Perícia de DEX',      efeito: '+1 na chance de acerto de perícias de DEX',     gasto: 5,  bonus: { pericia: { DEX: 1 } } },
  { id: 'dex_maestria',attr: 'DEX', nome: 'Maestria',            efeito: '−1 no poder de inimigos sem maestria',          gasto: 20, bonus: { maestria: 1 } },
  { id: 'dex_teste',   attr: 'DEX', nome: 'Atributo DEX',        efeito: '+2 em testes de DEX',                           gasto: 3,  bonus: { teste: { DEX: 2 } } },
  // AGI
  { id: 'agi_acoes',   attr: 'AGI', nome: 'Ações de ataque',     efeito: '+1 ação de ataque físico por turno',            gasto: 5,  bonus: { acoesAtaque: 1 } },
  { id: 'agi_reacao',  attr: 'AGI', nome: 'Ação de reação',      efeito: '+1 reação por turno',                           gasto: 20, bonus: { reacoes: 1 } },
  { id: 'agi_teste',   attr: 'AGI', nome: 'Atributo AGI',        efeito: '+2 em testes de AGI',                           gasto: 5,  bonus: { teste: { AGI: 2 } } },
  // INT
  { id: 'int_pericia', attr: 'INT', nome: 'Perícia de INT',      efeito: '+1 na chance de acerto de perícias de INT',     gasto: 5,  bonus: { pericia: { INT: 1 } } },
  { id: 'int_poder',   attr: 'INT', nome: 'Poder mágico',        efeito: '+1d10 no dano mágico',                          gasto: 5,  bonus: { dadoMagico: 1 } },
  { id: 'int_teste',   attr: 'INT', nome: 'Atributo INT',        efeito: '+2 em testes de INT',                           gasto: 3,  bonus: { teste: { INT: 2 } } },
  // FDV
  { id: 'fdv_recurso', attr: 'FDV', nome: 'Pontos de recurso',   efeito: '+1 ponto do recurso da classe',                 gasto: 5,  bonus: { recurso: 1 } },
  { id: 'fdv_teste',   attr: 'FDV', nome: 'Atributo FDV',        efeito: '+2 em testes de FDV',                           gasto: 3,  bonus: { teste: { FDV: 2 } } },
  // PER
  { id: 'per_pericia', attr: 'PER', nome: 'Perícia de PER',      efeito: '+1 na chance de acerto de perícias de PER',     gasto: 5,  bonus: { pericia: { PER: 1 } } },
  { id: 'per_critico', attr: 'PER', nome: 'Chance de crítico',   efeito: '+1 no d10 de crítico (+10%)',                   gasto: 10, bonus: { critFaixa: 1 } },
  { id: 'per_teste',   attr: 'PER', nome: 'Atributo PER',        efeito: '+1 em testes de PER',                           gasto: 5,  bonus: { teste: { PER: 1 } } },
  // CAR
  { id: 'car_teste',   attr: 'CAR', nome: 'Atributo CAR',        efeito: '+2 em testes de CAR',                           gasto: 5,  bonus: { teste: { CAR: 2 } } },
  { id: 'car_pericia', attr: 'CAR', nome: 'Perícia de CAR',      efeito: '+1 na chance de acerto de perícias de CAR',     gasto: 3,  bonus: { pericia: { CAR: 1 } } },
  // MOR
  { id: 'mor_teste',   attr: 'MOR', nome: 'Atributo MOR',        efeito: '+2 em testes de MOR',                           gasto: 5,  bonus: { teste: { MOR: 2 } } },
  { id: 'mor_pericia', attr: 'MOR', nome: 'Perícia de MOR',      efeito: '+1 na chance de acerto de perícias de MOR',     gasto: 3,  bonus: { pericia: { MOR: 1 } } },
  // APA
  { id: 'apa_teste',   attr: 'APA', nome: 'Atributo APA',        efeito: '+2 em testes de APA',                           gasto: 5,  bonus: { teste: { APA: 2 } } },
  { id: 'apa_pericia', attr: 'APA', nome: 'Perícia de APA',      efeito: '+1 na chance de acerto de perícias de APA',     gasto: 3,  bonus: { pericia: { APA: 1 } } }
];

/* =========================================================
   BESTIÁRIO
   Os monstros usam as mesmas regras dos personagens:
     vida   = (vida base do tamanho + CON × fator do tamanho × nível) × multiplicador da dificuldade
     defesa = (defesa natural + armaduras) × CON (ou FDV) × ⌈nível ÷ 2⌉ × multiplicador da dificuldade
     dano   = (FOR + dado do ataque + dados da dificuldade) d10 × nível
   ========================================================= */
const DIFICULDADES = {
  1: { nome: 'Muito fácil',      cor: '#4a6b2e', vida: 0.6, defesa: 0.6, dano: -1 },
  2: { nome: 'Normal',           cor: '#2c5a8c', vida: 1.0, defesa: 1.0, dano: 0 },
  3: { nome: 'Difícil',          cor: '#a8761c', vida: 1.5, defesa: 1.5, dano: 1 },
  4: { nome: 'Muito difícil',    cor: '#8e1b1b', vida: 2.5, defesa: 2.2, dano: 2 },
  5: { nome: 'Quase impossível', cor: '#4b1f5e', vida: 4.0, defesa: 3.2, dano: 4 }
};

/* Quando um monstro é usado numa dificuldade diferente da original, os atributos mudam.
   Cada nível de dificuldade acima da original soma os valores de porPasso
   (e abaixo, subtrai, sem passar de 1):
   - AGI a mais = mais ataques físicos por turno
   - INT a mais (só em quem usa magia) = mais ataques mágicos e dano mágico
   - CON e FDV a mais = mais vida e defesas (elas multiplicam a defesa dos itens)
   - FOR a mais = mais dados de dano físico; DEX a mais = mais chance de defesa
   - PER sobe 1 a cada 'perACada' níveis
   - a defesa natural (DF e DM) sobe conforme defesaPorPasso */
const ESCALA_DIFICULDADE = {
  porPasso: { FOR: 1, CON: 1, DEX: 1, AGI: 1, FDV: 1 },
  intConjurador: 1,
  perACada: 2,
  defesaPorPasso: { df: 1, dm: 1 }   // soma na defesa natural a cada nível acima (e tira abaixo, sem passar de 0)
};

const TAMANHOS = {
  pequeno:  { nome: 'Pequeno',  vidaBase: 100, fatorVida: 20, movimento: 0 },
  medio:    { nome: 'Médio',    vidaBase: 200, fatorVida: 30, movimento: 0 },
  grande:   { nome: 'Grande',   vidaBase: 400, fatorVida: 45, movimento: 1 },
  colossal: { nome: 'Colossal', vidaBase: 800, fatorVida: 70, movimento: 2 }
};

const ORIGENS = {
  comum:        { nome: 'Comum',                 cor: '#6d5a40', desc: 'Criaturas do mundo, sem ligação com as guerras dos deuses.' },
  deus_marcado: { nome: 'Marca do Deus Marcado', cor: '#8e1b1b', desc: 'Consumiram a carne, o sangue ou os cristais carmesins do Deus Marcado. Carregam o ódio para o qual ele foi criado.' },
  jurgmund:     { nome: 'Sangue de Jurgmund',    cor: '#a8761c', desc: 'Tocados pelo sangue, pela carne ou pela luz da Cobra Colossal. Crescem, trocam de pele e se recusam a morrer.' },
  desconhecida: { nome: 'Origem desconhecida',  cor: '#2b2b2b', desc: 'Ninguém sabe de onde veio. Talvez seja mais antigo que as guerras dos deuses.' },
  fissura:      { nome: 'Nascidos da Fissura',   cor: '#4b1f5e', desc: 'Formados onde as duas essências se misturaram, no fundo do Grande Lago Central.' }
};

/* ---------- MONSTROS ----------
   atributos:      FOR, CON, DEX, AGI, INT, FDV, PER (os que faltarem valem 1)
   defesaNatural:  { df, dm } como se fosse um item (couro grosso, ossos, forma etérea...)
   equip:          humanoides usam itens do jogo: { arma, secundaria, elmo, peitoral, luvas, botas }
   ataques:        ataques naturais { nome, dados, tipo: 'fisico' | 'magico', alcance, efeito }
   magias:         ids de MAGIAS (usam INT e os dados da dificuldade)
   habilidades:    { nome, tipo, usos, efeito }
   drops:          { item: id, chance } ou { texto, chance }. Lista vazia = sem drop.
   especial:       rótulo para monstros especiais (Chefe, Elite, Lendário...)
   origem:         chave de ORIGENS (padrão: comum)
   historia:       texto de ambientação mostrado na ficha
   local:          onde o monstro costuma ser encontrado
   fases:          mudanças por porcentagem de vida: { abaixoDe: 75, nome, efeito, mod?: { ataques, dados, df, dm } }
                   mod.ataques soma ações de ataque, mod.dados soma d10 em todos os ataques, mod.df e mod.dm multiplicam as defesas.
                   Na batalha do Bestiário, as fases ligam sozinhas quando a vida cai abaixo do limite.
------------------------------------------------ */
const MONSTROS = [
  // ================= Dificuldade 1 =================
  { id: 'rato_gigante', nome: 'Rato Gigante', tipo: 'Fera', tamanho: 'pequeno', dificuldade: 1, local: 'Cidade Baixa (Verdom)',
    descricao: 'Do tamanho de um cachorro, vive em porões, esgotos e masmorras. Ataca em bando.',
    atributos: { FOR: 1, CON: 1, DEX: 2, AGI: 2, INT: 1, FDV: 1, PER: 2 },
    defesaNatural: { df: 1, dm: 0 },
    ataques: [ { nome: 'Mordida', dados: 1, efeito: '' } ],
    habilidades: [],
    drops: [ { texto: 'Cauda de rato gigante', chance: 50 } ] },

  { id: 'morcego_gigante', nome: 'Morcego Gigante', tipo: 'Fera', tamanho: 'pequeno', dificuldade: 1, local: 'Grutas do Troll',
    descricao: 'Caça no escuro guiado pelo som. Ataca e volta para o teto.',
    atributos: { FOR: 1, CON: 1, DEX: 3, AGI: 3, INT: 1, FDV: 1, PER: 3 },
    defesaNatural: { df: 0, dm: 0 },
    ataques: [ { nome: 'Mordida', dados: 1, efeito: '' } ],
    habilidades: [ { nome: 'Voo Errático', tipo: 'Passiva', usos: '—', efeito: 'Voa por cima de obstáculos e não pode ser interceptado.' } ],
    drops: [] },

  { id: 'goblin', nome: 'Goblin', tipo: 'Humanoide', tamanho: 'pequeno', dificuldade: 1, local: 'Esgotos de Verdom',
    descricao: 'Pequeno, covarde e ganancioso. Sozinho foge; em grupo, cerca e esfaqueia.',
    atributos: { FOR: 1, CON: 2, DEX: 3, AGI: 2, INT: 1, FDV: 1, PER: 2 },
    defesaNatural: { df: 0, dm: 0 },
    equip: { arma: 'adaga', elmo: 'capuz_couro' },
    ataques: [],
    habilidades: [ { nome: 'Fuga Rápida', tipo: 'Reação', usos: '1 por batalha', efeito: 'Quando fica abaixo de 30% da vida, move 3 hex sem ser interceptado.' } ],
    drops: [ { item: 'adaga', chance: 20 }, { item: 'capuz_couro', chance: 10 }, { texto: '1d10 moedas de bronze', chance: 80 } ] },

  { id: 'kobold', nome: 'Kobold', tipo: 'Humanoide', tamanho: 'pequeno', dificuldade: 1, local: 'Forte Anão da Guarda',
    descricao: 'Parente distante dos dragões, adora armadilhas e ataques à distância.',
    atributos: { FOR: 1, CON: 1, DEX: 3, AGI: 2, INT: 1, FDV: 1, PER: 3 },
    defesaNatural: { df: 1, dm: 0 },
    equip: { arma: 'arco_curto' },
    ataques: [],
    habilidades: [ { nome: 'Armadilheiro', tipo: 'Passiva', usos: '1 por batalha', efeito: 'Antes do combate, prepara uma armadilha num hexágono: quem pisa sofre 1d10 × nível e perde 1 de movimento no turno.' } ],
    drops: [ { item: 'arco_curto', chance: 15 }, { texto: 'Escamas de kobold', chance: 40 } ] },

  { id: 'esqueleto', nome: 'Esqueleto', tipo: 'Morto-vivo', tamanho: 'medio', dificuldade: 1, local: 'Ruínas de Vermilion',
    descricao: 'Ossos de um soldado antigo, erguidos por magia. Obedece e não sente medo.',
    atributos: { FOR: 2, CON: 2, DEX: 2, AGI: 2, INT: 1, FDV: 1, PER: 1 },
    defesaNatural: { df: 1, dm: 0 },
    equip: { arma: 'espada_curta', secundaria: 'broquel' },
    ataques: [],
    habilidades: [],
    fraquezas: 'Maças e martelos causam +1d10. Magias de luz e sagradas causam o dobro.',
    resistencias: 'Imune a veneno e a sangramento.',
    drops: [ { item: 'espada_curta', chance: 25 }, { item: 'broquel', chance: 15 }, { texto: 'Ossos antigos', chance: 60 } ] },

  { id: 'zumbi', nome: 'Zumbi', tipo: 'Morto-vivo', tamanho: 'medio', dificuldade: 1, local: 'Ruínas de Vermilion',
    descricao: 'Lento e fedorento, mas não para até ser destruído.',
    atributos: { FOR: 2, CON: 3, DEX: 1, AGI: 1, INT: 1, FDV: 1, PER: 1 },
    defesaNatural: { df: 1, dm: 1 },
    ataques: [ { nome: 'Pancada', dados: 1, efeito: '' },
               { nome: 'Mordida', dados: 1, efeito: 'Doença: o alvo tem −2 em testes de CON até descansar.' } ],
    habilidades: [ { nome: 'Teimosia dos Mortos', tipo: 'Passiva', usos: '1 por batalha', efeito: 'Na primeira vez que cairia a 0, fica com 1 de vida, a não ser que o golpe seja crítico ou de fogo.' } ],
    fraquezas: 'Fogo causa +1d10.',
    resistencias: 'Imune a veneno.',
    drops: [] },

  { id: 'lodo_verde', nome: 'Lodo Verde', tipo: 'Aberração', tamanho: 'pequeno', dificuldade: 1, local: 'Ruínas de Vermilion',
    descricao: 'Uma poça de gosma ácida que se arrasta pelos corredores e dissolve o que toca.',
    atributos: { FOR: 1, CON: 3, DEX: 1, AGI: 1, INT: 1, FDV: 2, PER: 1 },
    defesaNatural: { df: 3, dm: 0 },
    ataques: [ { nome: 'Pseudópode Ácido', dados: 1, efeito: 'Corrosão: o alvo perde 1 DF de item até o fim da batalha (máximo −3).' } ],
    habilidades: [],
    resistencias: 'Imune a veneno e a críticos. Resistente a armas físicas pela defesa natural alta.',
    fraquezas: 'Frio e fogo causam +1d10.',
    drops: [ { texto: 'Gosma ácida (frasco)', chance: 40 } ] },

  // ================= Dificuldade 2 =================
  { id: 'lobo', nome: 'Lobo', tipo: 'Fera', tamanho: 'medio', dificuldade: 2, local: 'Florestas de Vernand',
    descricao: 'Caça em matilha e sempre tenta cercar a presa.',
    atributos: { FOR: 2, CON: 2, DEX: 3, AGI: 3, INT: 1, FDV: 1, PER: 3 },
    defesaNatural: { df: 1, dm: 0 },
    ataques: [ { nome: 'Mordida', dados: 2, efeito: 'Se acertar, o alvo faz teste de FOR ou cai no chão.' } ],
    habilidades: [ { nome: 'Tática de Matilha', tipo: 'Passiva', usos: '—', efeito: '+1d10 no dano se outro lobo estiver adjacente ao alvo.' } ],
    drops: [ { texto: 'Pele de lobo', chance: 70 }, { texto: 'Presas de lobo', chance: 30 } ] },

  { id: 'bandido', nome: 'Bandido', tipo: 'Humanoide', tamanho: 'medio', dificuldade: 2, local: 'Caminho para o Deserto de Karlach',
    descricao: 'Salteador de estrada. Prefere assustar a lutar, mas luta sujo quando precisa.',
    atributos: { FOR: 2, CON: 2, DEX: 3, AGI: 2, INT: 1, FDV: 1, PER: 3 },
    defesaNatural: { df: 0, dm: 0 },
    equip: { arma: 'espada_curta', secundaria: 'broquel', peitoral: 'gibao_couro', botas: 'botas_couro' },
    ataques: [],
    habilidades: [ { nome: 'Golpe Sujo', tipo: 'Ativa', usos: '1 por batalha', efeito: 'Joga areia nos olhos: o alvo tem −2 na chance de defesa contra o próximo ataque.' } ],
    drops: [ { item: 'presa_lobo', chance: 10 }, { item: 'couraca_baluarte', chance: 10 }, { item: 'couraca_escamas', chance: 10 }, { item: 'escudo_espinhos', chance: 10 }, { item: 'espada_curta', chance: 20 }, { item: 'broquel', chance: 10 }, { item: 'gibao_couro', chance: 15 }, { texto: '3d10 moedas de prata', chance: 90 } ] },

  { id: 'orc', nome: 'Orc', tipo: 'Humanoide', tamanho: 'medio', dificuldade: 2, local: 'Acampamentos Orcs',
    descricao: 'Guerreiro brutal que vive para a batalha. Fica mais perigoso quando ferido.',
    atributos: { FOR: 4, CON: 3, DEX: 2, AGI: 2, INT: 1, FDV: 2, PER: 2 },
    defesaNatural: { df: 1, dm: 0 },
    equip: { arma: 'machado_batalha', elmo: 'elmo_ferro', peitoral: 'gibao_couro' },
    ataques: [],
    habilidades: [ { nome: 'Sangue Quente', tipo: 'Passiva', usos: '—', efeito: 'Abaixo de 50% da vida, soma +1d10 em todos os ataques.' } ],
    drops: [ { item: 'estilete_sombrio', chance: 10 }, { item: 'cota_mercenario', chance: 10 }, { item: 'botas_pantano', chance: 10 }, { item: 'machado_batalha', chance: 15 }, { item: 'elmo_ferro', chance: 10 }, { texto: 'Presa de orc', chance: 40 }, { texto: '2d10 moedas de prata', chance: 60 } ] },

  { id: 'aranha_gigante', nome: 'Aranha Gigante', tipo: 'Fera', tamanho: 'grande', dificuldade: 2, local: 'Florestas de Vernand',
    descricao: 'Tece teias entre as árvores e espera. Sobe paredes e tetos.',
    atributos: { FOR: 3, CON: 2, DEX: 3, AGI: 3, INT: 1, FDV: 1, PER: 3 },
    defesaNatural: { df: 2, dm: 0 },
    ataques: [ { nome: 'Picada', dados: 2, efeito: 'Veneno: 1d10 × nível no início dos próximos 2 turnos do alvo, ignorando a defesa.' } ],
    habilidades: [ { nome: 'Teia', tipo: 'Ativa', usos: '1 por batalha', efeito: 'Alcance 4 hex: o alvo fica preso e não se move no próximo turno.' },
                   { nome: 'Escaladora', tipo: 'Passiva', usos: '—', efeito: 'Anda por paredes e tetos sem penalidade.' } ],
    drops: [ { texto: 'Seda de aranha', chance: 60 }, { texto: 'Glândula de veneno', chance: 30 } ] },

  { id: 'urso_pardo', nome: 'Urso Pardo', tipo: 'Fera', tamanho: 'grande', dificuldade: 2, local: 'Florestas de Vernand',
    descricao: 'Territorial e muito forte. Quase nunca foge de uma luta.',
    atributos: { FOR: 4, CON: 4, DEX: 1, AGI: 2, INT: 1, FDV: 1, PER: 2 },
    defesaNatural: { df: 2, dm: 1 },
    ataques: [ { nome: 'Garras', dados: 2, efeito: '' }, { nome: 'Mordida', dados: 2, efeito: '' } ],
    habilidades: [ { nome: 'Abraço de Urso', tipo: 'Passiva', usos: '—', efeito: 'Se acertar os dois ataques no mesmo alvo no turno, o alvo fica agarrado e não se move até passar num teste de FOR.' } ],
    drops: [ { texto: 'Pele de urso', chance: 80 }, { texto: 'Garras de urso', chance: 40 } ] },

  { id: 'cultista', nome: 'Cultista', tipo: 'Humanoide', tamanho: 'medio', dificuldade: 2, local: 'Cidade Baixa (Verdom)',
    descricao: 'Seguidor de um deus proibido. Fraco no corpo, perigoso com magia.',
    atributos: { FOR: 1, CON: 2, DEX: 2, AGI: 2, INT: 3, FDV: 3, PER: 2 },
    defesaNatural: { df: 0, dm: 0 },
    equip: { arma: 'adaga', elmo: 'chapeu_linho', peitoral: 'tunica_encantada' },
    ataques: [],
    magias: [ 'dardo_mistico', 'chama', 'cura_menor' ],
    habilidades: [],
    drops: [ { item: 'cetro_sangue', chance: 10 }, { item: 'machado_fende', chance: 10 }, { item: 'orbe_gelo', chance: 10 }, { item: 'brigantina', chance: 10 }, { item: 'paves_arqueiro', chance: 10 }, { item: 'varinha_freixo', chance: 10 }, { item: 'tunica_encantada', chance: 15 }, { texto: 'Símbolo profano', chance: 50 }, { texto: '2d10 moedas de prata', chance: 50 } ] },

  { id: 'fantasma', nome: 'Fantasma', tipo: 'Morto-vivo', tamanho: 'medio', dificuldade: 2, local: 'Antigo Navio de Guerra',
    descricao: 'Alma presa a um lugar pela dor ou por uma promessa quebrada.',
    atributos: { FOR: 1, CON: 1, DEX: 3, AGI: 2, INT: 2, FDV: 3, PER: 2 },
    defesaNatural: { df: 5, dm: 1 },
    ataques: [ { nome: 'Toque Gélido', dados: 2, tipo: 'magico', efeito: 'Dano mágico: usa INT e é calculado contra a DM do alvo.' } ],
    habilidades: [ { nome: 'Incorpóreo', tipo: 'Passiva', usos: '—', efeito: 'Atravessa paredes e criaturas. Armas comuns, sem encanto, causam metade do dano.' } ],
    fraquezas: 'Magias sagradas e armas de prata causam o dano completo e +1d10.',
    resistencias: 'Imune a veneno, sangramento e agarrão.',
    drops: [ { item: 'martelo_terremoto', chance: 10 }, { item: 'cota_mercenario', chance: 10 }, { item: 'manoplas_duelista', chance: 10 },] },

  // ================= Especial =================
  { id: 'grakk', nome: 'Grakk, o Rei dos Esgotos', tipo: 'Humanoide', tamanho: 'pequeno', dificuldade: 2, local: 'Esgotos de Verdom', especial: 'Chefe',
    descricao: 'O maior e mais esperto goblin da cidade subterrânea. Usa uma coroa de lata e nunca luta sozinho.',
    atributos: { FOR: 3, CON: 3, DEX: 2, AGI: 2, INT: 2, FDV: 2, PER: 3 },
    defesaNatural: { df: 0, dm: 0 },
    equip: { arma: 'espada_longa', secundaria: 'broquel', elmo: 'coifa_malha', peitoral: 'cota_malha' },
    ataques: [],
    habilidades: [
      { nome: 'Líder da Tribo', tipo: 'Passiva', usos: '—', efeito: 'Goblins a até 3 hex de Grakk somam +1d10 no dano.' },
      { nome: 'Grito de Guerra', tipo: 'Ativa', usos: '1 por batalha', efeito: 'Todos os goblins ganham +1 ação de ataque no próximo turno.' },
      { nome: 'Fuga Covarde', tipo: 'Reação', usos: '1 por batalha', efeito: 'Abaixo de 25% da vida, move 4 hex sem ser interceptado e chama 2 goblins de reforço.' } ],
    drops: [ { item: 'arco_teixo', chance: 10 }, { item: 'varinha_espinhos', chance: 10 }, { item: 'vestes_eremita', chance: 10 }, { item: 'cota_malha', chance: 50 }, { item: 'espada_longa', chance: 40 }, { texto: 'Coroa de lata do Rei Goblin', chance: 100 }, { texto: '5d10 moedas de prata', chance: 100 } ] },
  // =====================================================================
  // MARCA DO DEUS MARCADO
  // =====================================================================
  { id: 'escaravelho_carmesim', nome: 'Escaravelho Carmesim', tipo: 'Inseto', tamanho: 'pequeno', dificuldade: 1, local: 'Deserto de Karlach', origem: 'deus_marcado',
    descricao: 'Besouro do tamanho de um gato, com a carapaça cheia de lascas vermelhas que brilham no escuro.',
    historia: 'No Deserto Carmesim, os escaravelhos roem os cristais onde a essência do Deus Marcado caiu. O ódio veio junto: eles atacam qualquer coisa que se mexa, e com fúria dobrada qualquer um que tenha sangue élfico.',
    atributos: { FOR: 1, CON: 2, DEX: 2, AGI: 2, INT: 1, FDV: 1, PER: 2 },
    defesaNatural: { df: 2, dm: 0 },
    ataques: [ { nome: 'Mandíbulas', dados: 1, efeito: '' } ],
    habilidades: [
      { nome: 'Estilhaço Final', tipo: 'Passiva', usos: '—', efeito: 'Quando morre, a carapaça explode: todos os adjacentes sofrem 1d10 × nível, ignorando a defesa.' },
      { nome: 'Ódio Antigo', tipo: 'Passiva', usos: '—', efeito: 'Contra elfos e meio-elfos, soma +2d10 no dano.' } ],
    drops: [ { texto: 'Lasca de cristal carmesim', chance: 50 } ] },

  { id: 'abutre_rubro', nome: 'Abutre Rubro', tipo: 'Fera', tamanho: 'medio', dificuldade: 2, local: 'Deserto de Karlach', origem: 'deus_marcado',
    descricao: 'Ave de rapina com penas de vidro vermelho que tilintam quando ela mergulha.',
    historia: 'Os abutres comeram os restos de quem morreu tocando os cristais carmesins. As penas viraram vidro, e o faro virou obsessão por sangue.',
    atributos: { FOR: 2, CON: 2, DEX: 3, AGI: 3, INT: 1, FDV: 1, PER: 4 },
    defesaNatural: { df: 1, dm: 1 },
    ataques: [ { nome: 'Bicada', dados: 2, efeito: '' },
               { nome: 'Chuva de Penas', dados: 1, alcance: 'Linha de 4 hex', efeito: 'Atinge todos na linha. Cada alvo atingido começa a sangrar: 1d10 × nível no próximo turno.' } ],
    habilidades: [
      { nome: 'Faro de Sangue', tipo: 'Passiva', usos: '—', efeito: 'Ganha +1 ação de ataque contra alvos abaixo de 50% da vida ou sangrando.' },
      { nome: 'Voo', tipo: 'Passiva', usos: '—', efeito: 'Voa por cima de obstáculos. Ataques corpo a corpo contra ele só funcionam no turno em que ele mergulhou.' } ],
    drops: [ { texto: 'Pena de vidro rubro', chance: 60 }, { texto: 'Lasca de cristal carmesim', chance: 25 } ] },

  { id: 'carnical_marcado', nome: 'Carniçal Marcado', tipo: 'Morto-vivo', tamanho: 'medio', dificuldade: 2, local: 'Ruínas da Antiga Cidade', origem: 'deus_marcado',
    descricao: 'Um corpo seco de pele rachada, com veias vermelhas que pulsam como brasas.',
    historia: 'Caravanas que beberam do oásis de Sethar, onde os cristais carmesins se dissolveram na água, não chegaram ao destino. Continuam andando pelo deserto, procurando alguém para passar a marca adiante.',
    atributos: { FOR: 3, CON: 3, DEX: 2, AGI: 2, INT: 1, FDV: 2, PER: 2 },
    defesaNatural: { df: 1, dm: 1 },
    ataques: [ { nome: 'Garras', dados: 2, efeito: 'Coloca 1 Marca Carmesim no alvo.' } ],
    habilidades: [
      { nome: 'Marca Carmesim', tipo: 'Passiva', usos: '—', efeito: 'Um alvo com 3 Marcas Carmesins perde 1 ação de ataque por turno até ser curado. Qualquer cura remove todas as Marcas.' },
      { nome: 'Fome Contagiosa', tipo: 'Passiva', usos: '—', efeito: 'Quem cair com 3 Marcas e não for curado até o fim da batalha se levanta como Carniçal na noite seguinte.' } ],
    fraquezas: 'Magias de cura causam dano nele em vez de curar.',
    resistencias: 'Imune a veneno e a sangramento.',
    drops: [ { item: 'machado_fende', chance: 10 }, { item: 'couraca_baluarte', chance: 10 }, { item: 'brigantina', chance: 10 }, { item: 'paves_arqueiro', chance: 10 }, { texto: 'Cantil de água do oásis de Sethar (contaminada)', chance: 30 }, { texto: '1d10 moedas de prata antigas', chance: 60 } ] },

  { id: 'golem_carmesim', nome: 'Golem de Cristal Carmesim', tipo: 'Constructo', tamanho: 'grande', dificuldade: 3, local: 'Lago Corrompido', origem: 'deus_marcado',
    descricao: 'Uma massa de cristais vermelhos presa numa forma vagamente humana, que ressoa como um sino rachado.',
    historia: 'Onde muitos cristais caíram juntos, a essência do Deus Marcado tentou se reconstruir. Não conseguiu um corpo de deus, mas conseguiu um corpo.',
    atributos: { FOR: 5, CON: 4, DEX: 1, AGI: 2, INT: 1, FDV: 4, PER: 1 },
    defesaNatural: { df: 4, dm: 3 },
    ataques: [ { nome: 'Punho de Cristal', dados: 3, efeito: '' } ],
    habilidades: [
      { nome: 'Refração', tipo: 'Reação', usos: '2 por batalha', efeito: 'Quando uma magia de dano o atinge, metade do dano volta para quem lançou.' },
      { nome: 'Partir-se', tipo: 'Passiva', usos: '1 por batalha', efeito: 'Ao cair abaixo de 50% da vida, se divide em 2 Fragmentos Carmesins (tamanho médio), cada um com metade da vida que restava e 2d10 de ataque.' } ],
    fraquezas: 'Maças, martelos e armas muito pesadas causam +2d10.',
    resistencias: 'Imune a veneno, sangramento e condições de mente.',
    fases: [ { abaixoDe: 50, nome: 'Partir-se', efeito: 'Se divide em 2 Fragmentos Carmesins (tamanho médio), cada um com metade da vida que restava.' } ],
    drops: [ { item: 'arco_composto', chance: 15 }, { item: 'elmo_cavaleiro', chance: 15 }, { item: 'escudo_cruzado', chance: 15 }, { item: 'punhos_refratores', chance: 5 }, { texto: 'Núcleo de cristal carmesim', chance: 70 }, { texto: 'Lasca de cristal carmesim', chance: 100 } ] },

  { id: 'aralto_do_pacto', nome: 'Aralto do Pacto', tipo: 'Humanoide', tamanho: 'medio', dificuldade: 3, local: 'Cavernas do Pacto', origem: 'deus_marcado', especial: 'Elite',
    descricao: 'Um campeão de armadura escura com uma cicatriz vermelha em forma de olho na palma da mão.',
    historia: 'Os Araltos juraram lealdade ao Deus Marcado em troca de poder. Depois de 500 anos de silêncio, voltaram a se mover: recolhem os fragmentos da essência e preparam o retorno do seu senhor.',
    atributos: { FOR: 4, CON: 3, DEX: 3, AGI: 3, INT: 3, FDV: 3, PER: 3 },
    defesaNatural: { df: 1, dm: 2 },
    equip: { arma: 'espada_juramento', secundaria: 'broquel_duelista', elmo: 'elmo_sentinela', peitoral: 'cota_mercenario' },
    ataques: [],
    magias: [ 'toque_vampirico', 'prisao_espinhos' ],
    habilidades: [
      { nome: 'Pacto de Sangue', tipo: 'Passiva', usos: '—', efeito: 'Recupera 20% de todo dano físico que causar.' },
      { nome: 'Voz do Marcado', tipo: 'Ativa', usos: '1 por batalha', efeito: 'Um alvo a até 6 hex faz teste de FDV. Se falhar, usa a próxima ação de ataque contra um aliado.' },
      { nome: 'Juramento Final', tipo: 'Passiva', usos: '1 por batalha', efeito: 'Ao cair, explode em chamas vermelhas: todos a até 2 hex sofrem 3d10 × nível de dano mágico.' } ],
    drops: [ { item: 'relicario_martir', chance: 15 }, { item: 'bracadeiras_arqueiro', chance: 15 }, { item: 'luvas_conjurador', chance: 15 }, { item: 'selo_pacto_rompido', chance: 5 }, { item: 'espada_juramento', chance: 30 }, { item: 'broquel_duelista', chance: 20 }, { texto: 'Selo de juramento do Aralto', chance: 100 }, { texto: 'Mapa com a localização de um fragmento', chance: 25 } ] },

  { id: 'cria_de_karlac', nome: 'Cria de Karlach', tipo: 'Réptil', tamanho: 'grande', dificuldade: 4, local: 'Deserto de Karlach', origem: 'deus_marcado',
    descricao: 'Uma salamandra do tamanho de um cavalo, com a pele rachada deixando ver brasas vermelhas por dentro.',
    historia: 'Enquanto a Salamandra Karlach consome os cristais, a pele que ela troca ganha vida. As crias vagam pelo deserto atrás do mesmo alimento, e esquentam a cada fragmento que devoram.',
    atributos: { FOR: 5, CON: 5, DEX: 2, AGI: 3, INT: 2, FDV: 3, PER: 3 },
    defesaNatural: { df: 3, dm: 3 },
    ataques: [ { nome: 'Mordida Incandescente', dados: 3, efeito: '' },
               { nome: 'Cuspe de Magma', dados: 2, tipo: 'magico', alcance: '5 hex, raio 1', efeito: 'O chão da área queima por 2 turnos: 1d10 × nível para quem começar o turno nele.' } ],
    habilidades: [
      { nome: 'Calor Crescente', tipo: 'Passiva', usos: '—', efeito: 'No começo de cada turno dela, soma +1d10 em todos os ataques, acumulando até +5d10. Água ou magia de gelo zera o acúmulo.' },
      { nome: 'Devorar Fragmento', tipo: 'Ativa', usos: '1 por batalha', efeito: 'Se houver cristal carmesim a até 2 hex, gasta 1 ação para comê-lo: recupera 20% da vida máxima e ganha +2d10 de Calor.' } ],
    fraquezas: 'Frio e água causam +2d10 e zeram o Calor Crescente.',
    resistencias: 'Imune a fogo.',
    drops: [ { item: 'anel_forca', chance: 8 }, { item: 'anel_destreza', chance: 8 }, { item: 'colar_constituicao', chance: 8 }, { item: 'luvas_de_brasa', chance: 5 }, { texto: 'Pele de brasa da Cria', chance: 60 }, { texto: 'Núcleo de cristal carmesim', chance: 40 }, { item: 'cajado_centelha', chance: 10 } ] },

  { id: 'aralto_sussurrante', nome: 'O Aralto Sussurrante', tipo: 'Humanoide', tamanho: 'medio', dificuldade: 4, local: 'Cidade de Atrelon', origem: 'deus_marcado', especial: 'Chefe',
    descricao: 'Um homem esguio em mantos cor de areia, com máscara de escamas douradas. A voz parece vir de dentro da cabeça de quem escuta.',
    historia: 'Disfarçado de emissário de Jurgmund, ele manipula Vassk, o rei dos Serpentarianos, para usar o povo da cobra como exército contra os reinos vizinhos. Ninguém nas Montanhas de Atrelon sabe que a máscara esconde uma marca vermelha.',
    atributos: { FOR: 2, CON: 3, DEX: 4, AGI: 4, INT: 5, FDV: 5, PER: 4 },
    defesaNatural: { df: 1, dm: 3 },
    equip: { arma: 'lamina_duelista', peitoral: 'gibao_corvo', elmo: 'mitra_peregrino' },
    ataques: [],
    magias: [ 'invisibilidade', 'passo_nebuloso', 'toque_vampirico', 'egide_menor', 'lanca_relampago' ],
    habilidades: [
      { nome: 'Máscara do Emissário', tipo: 'Passiva', usos: '—', efeito: 'Serpentarianos e cultistas nunca o atacam. Até ser desmascarado (teste de PER difícil ou dano crítico), parece um aliado.' },
      { nome: 'Sussurro', tipo: 'Ativa', usos: '2 por batalha', efeito: 'Um alvo a até 8 hex faz teste de FDV. Se falhar, no próximo turno ele só se move e ataca como o Aralto mandar.' },
      { nome: 'Forma Revelada', tipo: 'Passiva', usos: '1 por batalha', efeito: 'Abaixo de 50% da vida, a máscara quebra: recupera 30% da vida, ganha +1 ação de ataque e +2d10 em todos os ataques até o fim da batalha.' } ],
    fases: [ { abaixoDe: 50, nome: 'Forma Revelada', efeito: 'A máscara quebra: recupera 30% da vida, +1 ação de ataque e +2d10 em todos os ataques até o fim da batalha.', mod: { ataques: 1, dados: 2 } } ],
    drops: [ { item: 'varinha_eco', chance: 15 }, { item: 'manto_estrelas', chance: 8 }, { item: 'mangual_espinhos', chance: 8 }, { item: 'couraca_guardiao', chance: 8 }, { item: 'amuleto_sabio', chance: 8 }, { item: 'mascara_sussurrante', chance: 100 }, { item: 'lamina_duelista', chance: 40 }, { texto: 'Cartas ao rei Vassk', chance: 100 } ] },

  { id: 'salamandra_karlac', nome: 'A Salamandra Karlach', tipo: 'Réptil', tamanho: 'colossal', dificuldade: 5, local: 'Cidade de Karlach', origem: 'deus_marcado', especial: 'Colosso',
    descricao: 'Uma salamandra do tamanho de uma colina, cujo corpo é mais cristal vermelho que carne. Nas costas dela existe uma cidade inteira.',
    historia: 'Karlach consome os cristais carmesins onde a essência do Deus Marcado se dispersou, e cresce sem parar. O círculo que ela traça no deserto está se fechando. O que acontece quando ela comer o último fragmento, ninguém sabe. Ela não é má: é fome. Lutar contra ela é pôr em risco a cidade que vive nas costas dela, e isso só deve acontecer se algo a enlouquecer.',
    atributos: { FOR: 8, CON: 8, DEX: 2, AGI: 3, INT: 4, FDV: 6, PER: 4 },
    defesaNatural: { df: 5, dm: 5 },
    ataques: [ { nome: 'Mordida Colossal', dados: 5, efeito: 'O alvo é engolido se falhar num teste de FOR: sofre 3d10 × nível por turno até que alguém cause 20% da vida máxima dela em dano.' },
               { nome: 'Cauda de Cristal', dados: 4, alcance: 'Cone de 4 hex', efeito: 'Todos no cone caem no chão.' },
               { nome: 'Sopro Carmesim', dados: 4, tipo: 'magico', alcance: 'Linha de 10 hex', efeito: 'Quem sobreviver ganha 1 Marca Carmesim.' } ],
    habilidades: [
      { nome: 'Três Fases', tipo: 'Passiva', usos: '—', efeito: 'Em 75% da vida, o chão da arena vira brasa (1d10 × nível por turno para todos). Em 50%, ganha +1 ação de ataque. Em 25%, cada ataque dela também cura 10% do dano causado.' },
      { nome: 'Banquete de Cristal', tipo: 'Ativa', usos: '2 por batalha', efeito: 'Come um fragmento enterrado na arena: recupera 15% da vida máxima e todos os inimigos perdem 1 ação de ataque no próximo turno por causa do tremor.' },
      { nome: 'Pele de Magma', tipo: 'Passiva', usos: '—', efeito: 'Quem a atacar corpo a corpo sofre 1d10 × nível de fogo.' } ],
    fraquezas: 'Magias de gelo causam +3d10. Destruir os fragmentos da arena antes que ela os coma impede o Banquete.',
    resistencias: 'Imune a fogo, veneno e condições de mente.',
    fases: [ { abaixoDe: 75, nome: 'Chão de Brasa', efeito: 'O chão da arena vira brasa: 1d10 × nível por turno para todos.' }, { abaixoDe: 50, nome: 'Fome', efeito: 'Ganha +1 ação de ataque.', mod: { ataques: 1 } }, { abaixoDe: 25, nome: 'Banquete Final', efeito: 'Cada ataque dela também cura 10% do dano causado.', mod: { dados: 1 } } ],
    drops: [ { item: 'escama_muralha_karlach', chance: 25 }, { texto: 'Coração de cristal de Karlach', chance: 100 }, { texto: 'Escama de magma (material lendário)', chance: 100 }, { item: 'cajado_centelha', chance: 50 } ] },

  // =====================================================================
  // SANGUE DE JURGMUND
  // =====================================================================
  { id: 'mariposas_douradas', nome: 'Enxame de Mariposas Douradas', tipo: 'Inseto', tamanho: 'medio', dificuldade: 1, local: 'Vulcão de Karloth', origem: 'jurgmund',
    descricao: 'Uma nuvem de centenas de mariposas com asas que brilham como folha de ouro.',
    historia: 'Atraídas pelo brilho do Dragão Dourado no Vulcão de Karloth, as mariposas beberam da luz de Jurgmund. Agora brilham como ela, e o pó das asas cega quem respira.',
    atributos: { FOR: 1, CON: 2, DEX: 3, AGI: 3, INT: 1, FDV: 2, PER: 2 },
    defesaNatural: { df: 0, dm: 1 },
    ataques: [ { nome: 'Nuvem de Asas', dados: 1, alcance: 'Todos no mesmo hexágono ou adjacentes', efeito: '' } ],
    habilidades: [
      { nome: 'Enxame', tipo: 'Passiva', usos: '—', efeito: 'Ataques contra um único alvo causam metade do dano. Magias e ataques em área causam o dobro. Pode ocupar o mesmo hexágono de outras criaturas.' },
      { nome: 'Pó Dourado', tipo: 'Passiva', usos: '—', efeito: 'Quem começar o turno dentro do enxame tem −2 na chance de defesa até o fim do turno.' } ],
    drops: [ { texto: 'Pó dourado (frasco)', chance: 50 } ] },

  { id: 'caranguejo_escama', nome: 'Caranguejo de Escama Velha', tipo: 'Fera', tamanho: 'grande', dificuldade: 2, local: 'Grande Lago Central', origem: 'jurgmund',
    descricao: 'Um caranguejo do tamanho de uma carroça, cuja carapaça é feita de escamas verde-escuras sobrepostas.',
    historia: 'Quando Jurgmund partiu, escamas soltas afundaram no Grande Lago Central. Os caranguejos cresceram em volta delas até que as escamas viraram as carapaças deles.',
    atributos: { FOR: 3, CON: 3, DEX: 1, AGI: 2, INT: 1, FDV: 2, PER: 2 },
    defesaNatural: { df: 5, dm: 2 },
    ataques: [ { nome: 'Pinça', dados: 2, efeito: 'Se acertar as duas pinças no mesmo alvo, ele fica preso até passar num teste de FOR.' },
               { nome: 'Pinça', dados: 2, efeito: '' } ],
    habilidades: [
      { nome: 'Carapaça de Escama', tipo: 'Passiva', usos: '—', efeito: 'A defesa natural alta vem da carapaça. Um crítico ou um teste de FOR bem-sucedido de alguém adjacente vira o caranguejo de costas: ele perde toda a DF e não ataca por 2 turnos.' },
      { nome: 'Recuar para a Água', tipo: 'Reação', usos: '1 por batalha', efeito: 'Abaixo de 30% da vida, entra na água e recupera 10% por turno se ninguém o seguir.' } ],
    drops: [ { texto: 'Escama de Jurgmund', chance: 60 }, { texto: 'Carne de caranguejo (3 refeições)', chance: 90 } ] },

  { id: 'serpentariano', nome: 'Guerreiro Serpentariano', tipo: 'Humanoide', tamanho: 'medio', dificuldade: 2, local: 'Cidade de Atrelon', origem: 'jurgmund',
    descricao: 'Um humano transformado em algo parecido com uma serpente: corpo alongado, pele escamosa e língua bifurcada, mas ainda com braços, pernas e cabelo. Luta com espada e escudo.',
    historia: 'Os Serpentarianos são humanos transformados pela proximidade da cabeça de Jurgmund, nas Montanhas de Atrelon. Leais ao rei Vassk, lutam acreditando obedecer à própria Cobra.',
    atributos: { FOR: 3, CON: 3, DEX: 3, AGI: 2, INT: 2, FDV: 2, PER: 3 },
    defesaNatural: { df: 1, dm: 1 },
    equip: { arma: 'espada_longa', secundaria: 'broquel', elmo: 'coifa_malha', peitoral: 'gibao_couro' },
    ataques: [],
    habilidades: [
      { nome: 'Trocar de Pele', tipo: 'Passiva', usos: '1 por batalha', efeito: 'Na primeira vez que cairia a 0, deixa a pele para trás e levanta com 25% da vida, sem condições negativas.' },
      { nome: 'Olhar Hipnótico', tipo: 'Ativa', usos: '1 por batalha', efeito: 'Um alvo adjacente faz teste de FDV. Se falhar, não se move no próximo turno.' } ],
    drops: [ { item: 'estilete_sombrio', chance: 10 }, { item: 'bracadeiras_arqueiro', chance: 10 }, { item: 'botas_pantano', chance: 10 }, { item: 'espada_longa', chance: 20 }, { item: 'broquel', chance: 15 }, { texto: 'Pele trocada de Serpentariano', chance: 50 }, { texto: '2d10 moedas de prata', chance: 60 } ] },

  { id: 'carne_errante', nome: 'Carne Errante', tipo: 'Aberração', tamanho: 'grande', dificuldade: 3, local: 'Grande Lago Central', origem: 'jurgmund',
    descricao: 'Uma massa de carne verde-acinzentada, cheia de escamas e bocas, que rasteja devagar e nunca para de comer.',
    historia: 'Pedaços do corpo de Jurgmund que não se dissiparam por completo. Eles se juntam ao que encontram e absorvem: bichos, árvores, viajantes. Cada coisa engolida deixa uma parte de si na Carne.',
    atributos: { FOR: 4, CON: 6, DEX: 1, AGI: 2, INT: 1, FDV: 3, PER: 2 },
    defesaNatural: { df: 2, dm: 2 },
    ataques: [ { nome: 'Tentáculo', dados: 2, alcance: '2 hex', efeito: 'Puxa o alvo 1 hex para perto.' } ],
    habilidades: [
      { nome: 'Regeneração de Jurgmund', tipo: 'Passiva', usos: '—', efeito: 'Recupera 10% da vida máxima no início de cada turno dela. Fogo ou ácido impedem a regeneração no turno seguinte.' },
      { nome: 'Absorver', tipo: 'Ativa', usos: '—', efeito: 'Engole uma criatura adjacente caída. A Carne ganha um dos ataques dela até o fim da batalha e recupera 20% da vida.' } ],
    fraquezas: 'Fogo e ácido causam +1d10 e param a regeneração.',
    resistencias: 'Imune a críticos: não tem órgãos vitais.',
    drops: [ { item: 'besta_mao', chance: 15 }, { item: 'botas_andarilho', chance: 15 }, { item: 'anel_runico', chance: 15 }, { item: 'escama_viva', chance: 5 }, { texto: 'Escama de Jurgmund', chance: 80 }, { texto: 'Um item aleatório de alguém que ela engoliu', chance: 50 } ] },

  // =====================================================================
  // NASCIDOS DA FISSURA
  // =====================================================================
  { id: 'nascido_da_fissura', nome: 'Nascido da Fissura', tipo: 'Aberração', tamanho: 'grande', dificuldade: 4, local: 'Grande Lago Central', origem: 'fissura',
    descricao: 'Uma criatura de metade escamas verdes, metade cristal vermelho, que se contorce como se as duas partes brigassem entre si.',
    historia: 'Na Fissura, a cicatriz que a Batalha Colossal deixou no fundo do Grande Lago, o sangue de Jurgmund e a essência do Deus Marcado se misturaram. Das águas escuras sobem coisas que não deveriam existir. É isso que a Tartaruga Magnalaga procura?',
    atributos: { FOR: 5, CON: 5, DEX: 3, AGI: 3, INT: 3, FDV: 5, PER: 3 },
    defesaNatural: { df: 3, dm: 3 },
    ataques: [ { nome: 'Garra de Escama', dados: 3, efeito: '' },
               { nome: 'Raio Carmesim', dados: 3, tipo: 'magico', alcance: '6 hex', efeito: '' } ],
    habilidades: [
      { nome: 'Dupla Natureza', tipo: 'Passiva', usos: '—', efeito: 'Troca de lado no início de cada turno dela. Lado Escama: imune a dano mágico, recebe o dobro de dano físico. Lado Carmesim: imune a dano físico, recebe o dobro de dano mágico. O mestre anuncia o lado no início do turno.' },
      { nome: 'Grito das Duas Essências', tipo: 'Ativa', usos: '1 por batalha', efeito: 'Todos a até 4 hex fazem teste de FDV. Quem falhar perde 1 ação de ataque e 1 ataque mágico no próximo turno.' } ],
    drops: [ { item: 'cajado_tempestade', chance: 8 }, { item: 'vestes_sumo_sacerdote', chance: 8 }, { item: 'perola_fissura', chance: 5 }, { texto: 'Escama de Jurgmund', chance: 70 }, { texto: 'Núcleo de cristal carmesim', chance: 70 }, { texto: 'Pérola da Fissura (material raro)', chance: 20 } ] },

  // =====================================================================
  // COMUNS COM MECÂNICAS
  // =====================================================================
  { id: 'harpia', nome: 'Harpia', tipo: 'Monstruosidade', tamanho: 'medio', dificuldade: 2, local: 'Antigo Navio de Guerra',
    descricao: 'Metade mulher, metade ave, com garras sujas e uma voz linda demais.',
    atributos: { FOR: 2, CON: 2, DEX: 3, AGI: 3, INT: 2, FDV: 2, PER: 3 },
    defesaNatural: { df: 1, dm: 1 },
    ataques: [ { nome: 'Garras', dados: 2, efeito: '' } ],
    habilidades: [
      { nome: 'Canto Encantador', tipo: 'Ativa', usos: '2 por batalha', efeito: 'Todos a até 6 hex fazem teste de FDV. Quem falhar gasta o próximo turno andando em direção à harpia.' },
      { nome: 'Voo', tipo: 'Passiva', usos: '—', efeito: 'Voa por cima de obstáculos.' } ],
    drops: [ { item: 'amuleto_cacador', chance: 10 }, { item: 'colar_dentes', chance: 10 }, { item: 'amuleto_antidoto', chance: 10 }, { texto: 'Pena de harpia', chance: 60 }, { texto: 'Bugiganga roubada', chance: 40 } ] },

  { id: 'mimico', nome: 'Mímico', tipo: 'Aberração', tamanho: 'medio', dificuldade: 2, local: 'Antigo Navio de Guerra',
    descricao: 'Parece um baú, uma porta ou uma mesa. Até abrir a boca.',
    atributos: { FOR: 3, CON: 3, DEX: 1, AGI: 2, INT: 1, FDV: 2, PER: 3 },
    defesaNatural: { df: 2, dm: 1 },
    ataques: [ { nome: 'Mordida', dados: 2, efeito: '' },
               { nome: 'Pseudópode Grudento', dados: 1, efeito: 'A arma de quem atacou o mímico corpo a corpo fica grudada nele até um teste de FOR.' } ],
    habilidades: [
      { nome: 'Disfarce Perfeito', tipo: 'Passiva', usos: '—', efeito: 'Parado, é indistinguível de um objeto. O primeiro ataque dele no combate é crítico automático.' },
      { nome: 'Adesivo', tipo: 'Passiva', usos: '—', efeito: 'Quem tocar nele fica grudado e não pode se mover até passar num teste de FOR.' } ],
    drops: [ { item: 'arco_teixo', chance: 10 }, { item: 'rosario_peregrino', chance: 10 }, { item: 'manoplas_duelista', chance: 10 }, { texto: 'Tesouro de verdade que ele guardava (3d10 moedas de ouro)', chance: 70 }, { item: 'anel_guarda', chance: 15 } ] },

  { id: 'cubo_gelatinoso', nome: 'Cubo Gelatinoso', tipo: 'Aberração', tamanho: 'grande', dificuldade: 3, local: 'Ruínas de Vermilion',
    descricao: 'Um bloco transparente que ocupa o corredor inteiro. Dá para ver ossos e moedas boiando lá dentro.',
    atributos: { FOR: 3, CON: 5, DEX: 1, AGI: 1, INT: 1, FDV: 2, PER: 1 },
    defesaNatural: { df: 2, dm: 1 },
    ataques: [ { nome: 'Toque Ácido', dados: 2, efeito: '' } ],
    habilidades: [
      { nome: 'Engolfar', tipo: 'Ativa', usos: '—', efeito: 'Anda por cima de um alvo. Se ele falhar num teste de DEX, fica dentro do cubo: sofre 2d10 × nível de ácido por turno e não consegue agir. Um aliado adjacente pode puxá-lo com um teste de FOR.' },
      { nome: 'Transparente', tipo: 'Passiva', usos: '—', efeito: 'Num corredor escuro, só é notado com um teste de PER ou quando alguém esbarra nele.' } ],
    resistencias: 'Imune a críticos e a condições de mente.',
    drops: [ { item: 'espada_bastarda', chance: 15 }, { item: 'mitra_peregrino', chance: 15 }, { item: 'anel_runico', chance: 15 }, { texto: 'Moedas e ossos de vítimas antigas (2d10 moedas de ouro)', chance: 80 }, { item: 'espada_longa', chance: 20 }, { item: 'anel_prata', chance: 15 } ] },

  { id: 'troll', nome: 'Troll', tipo: 'Gigante', tamanho: 'grande', dificuldade: 3, local: 'Grutas do Troll',
    descricao: 'Alto, magro e verde, com braços longos demais e dentes tortos. Ri enquanto apanha.',
    atributos: { FOR: 5, CON: 5, DEX: 2, AGI: 2, INT: 1, FDV: 2, PER: 2 },
    defesaNatural: { df: 2, dm: 1 },
    ataques: [ { nome: 'Garras', dados: 2, efeito: '' }, { nome: 'Mordida', dados: 2, efeito: '' } ],
    habilidades: [
      { nome: 'Regeneração', tipo: 'Passiva', usos: '—', efeito: 'Recupera 15% da vida máxima no início de cada turno. Só para de regenerar no turno depois de levar dano de fogo ou ácido.' },
      { nome: 'Não Fica Morto', tipo: 'Passiva', usos: '—', efeito: 'Ao cair a 0 sem fogo ou ácido, levanta no terceiro turno com 25% da vida. Só morre de vez se o corpo for queimado.' } ],
    fraquezas: 'Fogo e ácido.',
    drops: [ { item: 'broche_vento', chance: 15 }, { item: 'anel_brasa_fria', chance: 15 }, { item: 'coracao_troll', chance: 5 }, { texto: 'Sangue de troll (poção de cura instável)', chance: 40 }, { texto: 'Dente de troll', chance: 70 } ] },

  { id: 'banshee', nome: 'Banshee', tipo: 'Morto-vivo', tamanho: 'medio', dificuldade: 3, local: 'Lago do Pobre',
    descricao: 'O espírito de uma mulher de cabelos brancos que flutua chorando sobre o lugar onde morreu.',
    atributos: { FOR: 1, CON: 2, DEX: 3, AGI: 3, INT: 3, FDV: 5, PER: 3 },
    defesaNatural: { df: 5, dm: 2 },
    ataques: [ { nome: 'Toque do Luto', dados: 3, tipo: 'magico', efeito: 'Dano mágico, calculado contra a DM do alvo.' } ],
    habilidades: [
      { nome: 'Lamento', tipo: 'Ativa', usos: '1 por batalha', efeito: 'Todos a até 6 hex fazem teste de FDV. Quem falhar cai para 1 de vida se estiver abaixo de 25%; os outros perdem 1 ação de ataque no próximo turno.' },
      { nome: 'Incorpórea', tipo: 'Passiva', usos: '—', efeito: 'Atravessa paredes. Armas comuns, sem encanto, causam metade do dano.' } ],
    fraquezas: 'Magias sagradas causam o dobro.',
    resistencias: 'Imune a veneno, sangramento e agarrão.',
    drops: [ { item: 'sabre_vento', chance: 15 }, { item: 'gibao_corvo', chance: 15 }, { item: 'grevas_investida', chance: 15 }, { item: 'veu_do_lamento', chance: 5 } ] },

  { id: 'wyvern', nome: 'Wyvern', tipo: 'Dragão menor', tamanho: 'grande', dificuldade: 3, local: 'Picos de Atrelon',
    descricao: 'Um parente pequeno e burro dos dragões, com asas no lugar dos braços e uma cauda com ferrão.',
    atributos: { FOR: 4, CON: 4, DEX: 3, AGI: 3, INT: 1, FDV: 2, PER: 3 },
    defesaNatural: { df: 3, dm: 2 },
    ataques: [ { nome: 'Mordida', dados: 2, efeito: '' },
               { nome: 'Ferrão', dados: 2, efeito: 'Veneno: 2d10 × nível no início dos próximos 2 turnos do alvo, ignorando a defesa.' } ],
    habilidades: [
      { nome: 'Voo Rasante', tipo: 'Ativa', usos: '—', efeito: 'Voa em linha reta até 8 hex e ataca qualquer um no caminho sem ser interceptado.' },
      { nome: 'Agarrar e Soltar', tipo: 'Ativa', usos: '1 por batalha', efeito: 'Pega um alvo médio ou menor, sobe e solta: 3d10 × nível de queda.' } ],
    drops: [ { item: 'broche_vento', chance: 15 }, { item: 'anel_brasa_fria', chance: 15 }, { item: 'lanca_ferrao_wyvern', chance: 5 }, { texto: 'Ferrão de wyvern', chance: 60 }, { texto: 'Couro de wyvern', chance: 50 } ] },

  { id: 'manticora', nome: 'Mantícora', tipo: 'Monstruosidade', tamanho: 'grande', dificuldade: 4, local: 'Ruínas Grúticas',
    descricao: 'Corpo de leão, asas de morcego, rosto quase humano e uma cauda cheia de espinhos de ferro.',
    atributos: { FOR: 5, CON: 4, DEX: 4, AGI: 3, INT: 2, FDV: 3, PER: 4 },
    defesaNatural: { df: 3, dm: 2 },
    ataques: [ { nome: 'Garras', dados: 3, efeito: '' },
               { nome: 'Rajada de Espinhos', dados: 2, alcance: '8 hex, até 3 alvos', efeito: 'Até 3 alvos diferentes, cada um com o dano completo.' } ],
    habilidades: [
      { nome: 'Espinhos Limitados', tipo: 'Passiva', usos: '4 por batalha', efeito: 'A Rajada de Espinhos só pode ser usada 4 vezes; depois ela precisa lutar de perto.' },
      { nome: 'Voo', tipo: 'Passiva', usos: '—', efeito: 'Voa e prefere ficar fora do alcance de ataques corpo a corpo enquanto tiver espinhos.' },
      { nome: 'Esperta e Cruel', tipo: 'Passiva', usos: '—', efeito: 'Fala e negocia. Às vezes aceita comida ou ouro para deixar o grupo passar.' } ],
    drops: [ { item: 'anel_agilidade', chance: 8 }, { item: 'anel_olho_aguia', chance: 8 }, { item: 'arco_espinhos_manticora', chance: 5 }, { texto: 'Espinhos de mantícora (12 flechas raras)', chance: 60 }, { texto: 'Juba de mantícora', chance: 40 } ] },

  { id: 'golem_de_ferro', nome: 'Golem de Ferro Anão', tipo: 'Constructo', tamanho: 'grande', dificuldade: 4, local: 'Forte Anão da Guarda',
    descricao: 'Um guardião de ferro rebitado, com runas anãs brilhando no peito e vapor saindo das juntas.',
    atributos: { FOR: 6, CON: 5, DEX: 1, AGI: 2, INT: 1, FDV: 5, PER: 2 },
    defesaNatural: { df: 5, dm: 4 },
    ataques: [ { nome: 'Punho de Ferro', dados: 3, efeito: '' },
               { nome: 'Jato de Vapor', dados: 2, tipo: 'magico', alcance: 'Cone de 3 hex', efeito: '' } ],
    habilidades: [
      { nome: 'Runas de Proteção', tipo: 'Passiva', usos: '—', efeito: 'Imune a magias de tier Comum e Raro. Magias de raio o deixam lento (−1 ação de ataque no próximo turno).' },
      { nome: 'Sobrecarga', tipo: 'Passiva', usos: '1 por batalha', efeito: 'Abaixo de 50% da vida, as runas ficam vermelhas: +2d10 em todos os ataques, mas ele sofre 5% da vida máxima por turno.' },
      { nome: 'Palavra de Comando', tipo: 'Passiva', usos: '—', efeito: 'Quem souber a palavra anã gravada nele (teste de INT difícil) pode desligá-lo por 1 turno.' } ],
    resistencias: 'Imune a veneno, sangramento, condições de mente e críticos.',
    drops: [ { item: 'besta_pesada_ana', chance: 8 }, { item: 'manoplas_tita', chance: 8 }, { item: 'broche_diplomata', chance: 8 }, { item: 'nucleo_runico', chance: 5 }, { texto: 'Núcleo rúnico anão', chance: 60 }, { texto: 'Placas de ferro rúnico', chance: 80 }, { item: 'manoplas_carrasco', chance: 15 } ] },

  { id: 'lich', nome: 'Lich', tipo: 'Morto-vivo', tamanho: 'medio', dificuldade: 5, local: 'Ruínas de Vermilion', especial: 'Chefe',
    descricao: 'Um mago esquelético de coroa e mantos apodrecidos. As órbitas vazias brilham com luz fria.',
    atributos: { FOR: 1, CON: 4, DEX: 3, AGI: 3, INT: 8, FDV: 7, PER: 5 },
    defesaNatural: { df: 3, dm: 4 },
    equip: { arma: 'cajado_centelha', peitoral: 'manto_aprendiz' },
    ataques: [ { nome: 'Toque Paralisante', dados: 2, tipo: 'magico', efeito: 'O alvo faz teste de CON ou não age no próximo turno.' } ],
    magias: [ 'bola_fogo', 'lanca_relampago', 'reflexo_arcano', 'chuva_meteoros', 'passo_nebuloso', 'prisao_espinhos' ],
    habilidades: [
      { nome: 'Filactério', tipo: 'Passiva', usos: '—', efeito: 'Enquanto o filactério estiver inteiro (escondido em outro lugar da masmorra), o Lich volta 3 turnos depois de cair, com 50% da vida.' },
      { nome: 'Ciclo de Magias', tipo: 'Passiva', usos: '—', efeito: 'Recupera 1 uso de uma magia por batalha no início de cada turno dele.' },
      { nome: 'Legião', tipo: 'Ativa', usos: '1 por batalha', efeito: 'Levanta 4 Esqueletos em hexágonos livres a até 5 hex, no nível dele.' } ],
    fraquezas: 'Magias sagradas causam +2d10. Destruir o filactério impede que ele volte.',
    resistencias: 'Imune a veneno, sangramento, frio e condições de mente.',
    fases: [ { abaixoDe: 50, nome: 'Legião', efeito: 'Levanta 4 Esqueletos no nível dele.' }, { abaixoDe: 25, nome: 'Desespero Imortal', efeito: 'Lança uma magia a mais por turno e todas as magias dele ignoram 50% da defesa mágica.', mod: { ataques: 1 } } ],
    drops: [ { item: 'cajado_primeiro_arquimago', chance: 15 }, { item: 'manto_noite_arcana', chance: 10 }, { item: 'rapieira_duelista', chance: 12 }, { item: 'elmo_leao', chance: 12 }, { item: 'botas_vento_perfeitas', chance: 12 }, { item: 'filacterio_vazio', chance: 10 }, { item: 'cajado_centelha', chance: 60 }, { item: 'grimorio_viajante', chance: 40 }, { texto: 'Grimório do Lich (magia lendária à escolha do mestre)', chance: 100 }, { texto: '10d10 moedas de ouro', chance: 100 } ] },

  // =====================================================================
  // RUÍNAS DE VERMILION
  // =====================================================================
  { id: 'sentinela_vermilion', nome: 'Sentinela de Vermilion', tipo: 'Constructo', tamanho: 'medio', dificuldade: 3, local: 'Ruínas de Vermilion',
    descricao: 'Uma armadura vazia, vermelha de ferrugem, que ainda marcha pelas muralhas caídas.',
    historia: 'Os guardas de Vermilion juraram proteger a cidade para sempre. A cidade acabou. O juramento, não.',
    atributos: { FOR: 4, CON: 3, DEX: 2, AGI: 2, INT: 1, FDV: 3, PER: 3 },
    defesaNatural: { df: 2, dm: 1 },
    equip: { arma: 'machado_batalha', elmo: 'elmo_ferro', peitoral: 'couraca_ferro' },
    ataques: [],
    habilidades: [
      { nome: 'Guarda Eterna', tipo: 'Reação', usos: '—', efeito: 'Quem passar adjacente à sentinela sofre um ataque de graça, uma vez por turno.' },
      { nome: 'Remontar', tipo: 'Passiva', usos: '1 por batalha', efeito: 'Ao cair, as peças se juntam de novo 2 turnos depois, com 50% da vida. Destruir o elmo caído (um ataque que acerte) impede.' } ],
    resistencias: 'Imune a veneno, sangramento e condições de mente.',
    drops: [ { item: 'couraca_crepusculo', chance: 10 }, { item: 'elmo_sentinela', chance: 15 }, { item: 'coifa_runica', chance: 15 }, { item: 'muralha_ferro', chance: 15 }, { item: 'couraca_ferro', chance: 20 }, { texto: 'Placa de armadura com o brasão de Vermilion', chance: 60 }, { item: 'coroa_vermilion', chance: 3 } ] },

  { id: 'nobre_espectral', nome: 'Nobre Espectral de Vermilion', tipo: 'Morto-vivo', tamanho: 'medio', dificuldade: 3, local: 'Ruínas de Vermilion',
    descricao: 'O fantasma de um nobre em roupas de festa, que ainda espera reverência dos vivos.',
    historia: 'Os nobres de Vermilion morreram no meio de um banquete. Acham que a festa continua, e que os visitantes chegaram sem convite.',
    atributos: { FOR: 1, CON: 2, DEX: 3, AGI: 2, INT: 4, FDV: 4, PER: 3 },
    defesaNatural: { df: 5, dm: 2 },
    ataques: [ { nome: 'Toque da Corte', dados: 2, tipo: 'magico', efeito: 'Dano mágico, calculado contra a DM do alvo.' } ],
    magias: [ 'dardo_mistico', 'reflexo_arcano' ],
    habilidades: [
      { nome: 'Etiqueta da Corte', tipo: 'Ativa', usos: '2 por batalha', efeito: 'Um alvo a até 6 hex faz teste de CAR. Se falhar, se curva e perde a próxima ação de ataque.' },
      { nome: 'Incorpóreo', tipo: 'Passiva', usos: '—', efeito: 'Atravessa paredes. Armas comuns, sem encanto, causam metade do dano.' } ],
    fraquezas: 'Magias sagradas causam o dobro. Quem usar a Coroa Enferrujada de Vermilion é tratado como rei, e o nobre não o ataca.',
    drops: [ { item: 'capuz_vidente', chance: 5 }, { item: 'luvas_tecelao', chance: 5 }, { item: 'lanca_cavaleiro', chance: 15 }, { item: 'sapatilhas_vento', chance: 15 }, { item: 'amuleto_cura', chance: 15 }, { texto: 'Joia antiga de Vermilion (vale 3d10 moedas de ouro)', chance: 50 }, { item: 'coroa_vermilion', chance: 5 } ] },

  { id: 'devorador_do_fosso', nome: 'O Devorador do Fosso', tipo: 'Aberração', tamanho: 'grande', dificuldade: 4, especial: 'Perigo local', origem: 'desconhecida', local: 'Ruínas de Vermilion',
    descricao: 'Tentáculos escuros saindo de um fosso sem fundo no centro das ruínas. Ninguém viu o corpo inteiro.',
    historia: 'Verdom foi construída em cima de Vermilion, mas ninguém constrói perto do fosso. Os mais velhos dizem que foi a coisa lá embaixo que acabou com a cidade antiga. Os mais velhos também dizem para não falar alto nas ruínas.',
    atributos: { FOR: 5, CON: 5, DEX: 3, AGI: 3, INT: 2, FDV: 4, PER: 5 },
    defesaNatural: { df: 3, dm: 3 },
    ataques: [ { nome: 'Tentáculo', dados: 3, alcance: '4 hex', efeito: 'Puxa o alvo 2 hex em direção ao fosso.' },
               { nome: 'Tentáculo', dados: 3, alcance: '4 hex', efeito: '' } ],
    habilidades: [
      { nome: 'Fome Paciente', tipo: 'Passiva', usos: '—', efeito: 'Só sai do fosso quando alguém faz barulho nas ruínas: combate, magias de som ou um teste de furtividade que falhe.' },
      { nome: 'Engolir', tipo: 'Ativa', usos: '—', efeito: 'Quem for puxado até a beira do fosso faz teste de FOR. Se falhar, cai e sofre 4d10 × nível por turno até alguém causar 20% da vida máxima do Devorador.' },
      { nome: 'Escuridão do Fosso', tipo: 'Passiva', usos: '—', efeito: 'A até 3 hex do fosso, luzes e magias de Luz não funcionam.' } ],
    resistencias: 'Imune a condições de mente. Só pode ser morto de vez se o fosso for selado.',
    drops: [ { item: 'montante_carrasco', chance: 8 }, { item: 'cota_mithril', chance: 8 }, { item: 'amuleto_devoto', chance: 8 }, { item: 'rubra_vermilion', chance: 10 }, { texto: 'Ossos e tesouros das vítimas (5d10 moedas de ouro)', chance: 100 } ] },

  // =====================================================================
  // DESERTO DE KARLACH
  // =====================================================================
  { id: 'diabrete', nome: 'Diabrete', tipo: 'Demônio', tamanho: 'pequeno', dificuldade: 1, origem: 'desconhecida', local: 'Acampamento do Arquidemônio',
    descricao: 'Um demônio do tamanho de uma criança, com asas de morcego e um riso irritante.',
    atributos: { FOR: 1, CON: 1, DEX: 3, AGI: 3, INT: 2, FDV: 2, PER: 3 },
    defesaNatural: { df: 1, dm: 2 },
    ataques: [ { nome: 'Ferrão', dados: 1, efeito: '' } ],
    habilidades: [
      { nome: 'Sumir', tipo: 'Reação', usos: '2 por batalha', efeito: 'Quando é atacado, fica invisível e reaparece a até 4 hex. O ataque erra.' },
      { nome: 'Provocação', tipo: 'Ativa', usos: '—', efeito: 'Xinga um alvo a até 6 hex: ele faz teste de FDV ou só pode atacar o diabrete no próximo turno.' } ],
    resistencias: 'Imune a fogo.',
    drops: [ { texto: 'Enxofre (frasco)', chance: 40 } ] },

  { id: 'sapo_boi_pantano', nome: 'Sapo-Boi dos Pântanos', tipo: 'Fera', tamanho: 'grande', dificuldade: 2, local: 'Pântanos de Vermilion',
    descricao: 'Um sapo do tamanho de um boi, que fica parado na lama até a presa chegar perto demais.',
    atributos: { FOR: 3, CON: 3, DEX: 2, AGI: 2, INT: 1, FDV: 1, PER: 2 },
    defesaNatural: { df: 1, dm: 1 },
    ataques: [ { nome: 'Língua', dados: 1, alcance: '3 hex', efeito: 'Puxa o alvo até ficar adjacente ao sapo.' },
               { nome: 'Mordida', dados: 2, efeito: '' } ],
    habilidades: [
      { nome: 'Engolir', tipo: 'Ativa', usos: '—', efeito: 'Engole um alvo médio ou menor adjacente que falhe num teste de DEX. Dentro, sofre 1d10 × nível por turno. Sai se causar 20% da vida máxima do sapo de dentro, ou se o sapo cair.' },
      { nome: 'Camuflagem na Lama', tipo: 'Passiva', usos: '—', efeito: 'Parado no pântano, só é notado com um teste de PER.' } ],
    drops: [ { texto: 'Pele de sapo-boi', chance: 60 }, { texto: 'Glândula alucinógena', chance: 30 } ] },

  { id: 'faroleiro_afogado', nome: 'O Faroleiro Afogado', tipo: 'Morto-vivo', tamanho: 'medio', dificuldade: 3, especial: 'Perigo local', local: 'Farol da Perdição',
    descricao: 'Um homem inchado e pingando água salgada, com uma lanterna de luz verde na mão.',
    historia: 'O Farol da Perdição não guia navios para o porto. Guia para as pedras. O faroleiro que acendia a luz se afogou com o primeiro navio que afundou, e continua acendendo.',
    atributos: { FOR: 2, CON: 3, DEX: 2, AGI: 2, INT: 3, FDV: 4, PER: 3 },
    defesaNatural: { df: 2, dm: 2 },
    ataques: [ { nome: 'Gancho Enferrujado', dados: 2, efeito: '' } ],
    habilidades: [
      { nome: 'Luz da Perdição', tipo: 'Ativa', usos: '2 por batalha', efeito: 'Todos a até 8 hex que enxergam a luz fazem teste de FDV. Quem falhar gasta o próximo turno andando em direção às pedras ou ao mar.' },
      { nome: 'Chamar a Maré', tipo: 'Ativa', usos: '1 por batalha', efeito: 'Dois Zumbis afogados sobem do mar em hexágonos da costa, no mesmo nível do faroleiro.' } ],
    fraquezas: 'Apagar a lanterna (um ataque que acerte a mão dele, com teste de DEX) cancela a Luz da Perdição.',
    resistencias: 'Imune a veneno e a afogamento.',
    drops: [ { item: 'broche_luz', chance: 15 }, { item: 'maca_consagrada', chance: 15 }, { item: 'manto_aprendiz', chance: 15 }, { item: 'brinco_foco', chance: 15 }, { item: 'lanterna_perdicao', chance: 10 }, { texto: 'Diário de bordo encharcado', chance: 60 } ] },

  { id: 'arvore_oca', nome: 'Árvore Oca de Volterion', tipo: 'Planta', tamanho: 'grande', dificuldade: 3, local: 'Floresta de Volterion',
    descricao: 'Uma árvore morta e retorcida, igual a todas as outras da floresta. Até se mexer.',
    historia: 'Nada cresce verde em Volterion. As árvores morreram há muito tempo, mas algumas não perceberam.',
    atributos: { FOR: 4, CON: 5, DEX: 1, AGI: 1, INT: 1, FDV: 3, PER: 2 },
    defesaNatural: { df: 3, dm: 1 },
    ataques: [ { nome: 'Galho', dados: 3, alcance: '2 hex', efeito: '' } ],
    habilidades: [
      { nome: 'Raízes', tipo: 'Ativa', usos: '2 por batalha', efeito: 'Todos a até 3 hex fazem teste de DEX. Quem falhar fica preso e não se move no próximo turno.' },
      { nome: 'Sugar Vida', tipo: 'Passiva', usos: '—', efeito: 'Recupera 10% do dano que causar em alvos presos pelas raízes.' },
      { nome: 'Floresta Morta', tipo: 'Passiva', usos: '—', efeito: 'Parada, é igual às árvores mortas ao redor. O primeiro ataque dela no combate é crítico automático.' } ],
    fraquezas: 'Fogo causa o dobro.',
    drops: [ { texto: 'Madeira negra de Volterion', chance: 70 }, { item: 'cajado_volterion', chance: 5 } ] },

  { id: 'gargula_grutica', nome: 'Gárgula Grútica', tipo: 'Constructo', tamanho: 'medio', dificuldade: 3, local: 'Ruínas Grúticas',
    descricao: 'Uma estátua de pedra com asas e garras, igual a dezenas de outras espalhadas pelas ruínas.',
    atributos: { FOR: 4, CON: 4, DEX: 2, AGI: 3, INT: 1, FDV: 2, PER: 3 },
    defesaNatural: { df: 4, dm: 2 },
    ataques: [ { nome: 'Garras de Pedra', dados: 2, efeito: '' }, { nome: 'Mergulho', dados: 3, efeito: 'Só depois de voar pelo menos 3 hex no turno. O alvo cai no chão.' } ],
    habilidades: [
      { nome: 'Estátua', tipo: 'Passiva', usos: '—', efeito: 'Se não se moveu no turno, recebe metade do dano físico.' },
      { nome: 'Bando de Pedra', tipo: 'Passiva', usos: '—', efeito: 'Quase nunca aparece sozinha: quando uma acorda, outras 1d10 ÷ 3 (arredondado para cima) acordam no turno seguinte.' },
      { nome: 'Voo', tipo: 'Passiva', usos: '—', efeito: 'Voa por cima de obstáculos.' } ],
    fraquezas: 'Maças e martelos causam +1d10.',
    resistencias: 'Imune a veneno, sangramento e condições de mente.',
    drops: [ { item: 'maca_consagrada', chance: 15 }, { item: 'elmo_cavaleiro', chance: 15 }, { item: 'brinco_raposa', chance: 15 }, { texto: 'Olho de pedra-lume', chance: 30 } ] },

  { id: 'sanguessuga_carmesim', nome: 'Sanguessuga Carmesim', tipo: 'Fera', tamanho: 'grande', dificuldade: 3, origem: 'deus_marcado', local: 'Lago Corrompido',
    descricao: 'Uma sanguessuga do tamanho de um barco, vermelha e translúcida, com cristais crescendo nas costas.',
    historia: 'Cristais carmesins caíram no lago e o apodreceram. As sanguessugas que beberam da água cresceram, e agora bebem de quem se aproxima.',
    atributos: { FOR: 4, CON: 5, DEX: 2, AGI: 2, INT: 1, FDV: 2, PER: 2 },
    defesaNatural: { df: 2, dm: 1 },
    ataques: [ { nome: 'Ventosa', dados: 3, efeito: 'Gruda no alvo e coloca 1 Marca Carmesim. Grudada, recupera 20% do dano que causa.' } ],
    habilidades: [
      { nome: 'Submersa', tipo: 'Passiva', usos: '—', efeito: 'Dentro do lago, só pode ser atacada por quem estiver na água ou adjacente à margem.' },
      { nome: 'Marca Carmesim', tipo: 'Passiva', usos: '—', efeito: 'Com 3 Marcas, o alvo perde 1 ação de ataque por turno até ser curado.' } ],
    fraquezas: 'Sal e fogo causam +1d10; ela se solta na hora.',
    drops: [ { texto: 'Lasca de cristal carmesim', chance: 80 }, { texto: 'Bolsa de sangue carmesim (ingrediente)', chance: 40 } ] },

  { id: 'soberano_enterrado', nome: 'O Soberano Enterrado', tipo: 'Morto-vivo', tamanho: 'medio', dificuldade: 4, especial: 'Chefe', local: 'Ruínas da Antiga Cidade',
    descricao: 'Uma múmia de mantos dourados e coroa, que se levanta do trono cercada de areia.',
    historia: 'Antes do deserto, havia uma cidade aqui. Quando os cristais caíram, o rei mandou fechar as portas e esperar. Continua esperando.',
    atributos: { FOR: 3, CON: 4, DEX: 2, AGI: 2, INT: 4, FDV: 5, PER: 3 },
    defesaNatural: { df: 2, dm: 3 },
    ataques: [ { nome: 'Toque da Maldição', dados: 3, efeito: 'Maldição da múmia: o alvo tem −2 em todos os testes e curas recuperam 25% a menos nele, até receber uma magia de Purificação ou Restauração.' } ],
    magias: [ 'prisao_espinhos', 'regeneracao' ],
    habilidades: [
      { nome: 'Tempestade de Areia', tipo: 'Ativa', usos: '1 por batalha', efeito: 'Por 3 turnos, ninguém enxerga além de 2 hex e ataques à distância têm −2 na chance de acerto.' },
      { nome: 'Servos do Rei', tipo: 'Ativa', usos: '1 por batalha', efeito: 'Três Esqueletos saem da areia em volta do trono, no nível dele.' } ],
    fraquezas: 'Fogo causa +2d10.',
    resistencias: 'Imune a veneno, sangramento e condições de mente.',
    drops: [ { item: 'anel_poco_sem_fundo', chance: 8 }, { item: 'vestes_vigilia', chance: 8 }, { item: 'cajado_tempestade', chance: 8 }, { item: 'manto_arquimago', chance: 8 }, { item: 'escudo_ferro_negro', chance: 8 }, { item: 'coroa_soberano', chance: 30 }, { texto: 'Tesouro real da cidade antiga (8d10 moedas de ouro)', chance: 100 } ] },

  { id: 'eco_semideus', nome: 'Eco de Semideus', tipo: 'Constructo', tamanho: 'grande', dificuldade: 4, especial: 'Guardião', local: 'Ruínas do Templo dos Semideuses',
    descricao: 'Uma estátua enorme de um semideus, rachada, que se move com a voz de alguém que morreu há milênios.',
    historia: 'O templo guardava as relíquias dos semideuses. Os guardiões ainda não sabem que o templo caiu, e testam quem entra como testariam um peregrino.',
    atributos: { FOR: 5, CON: 5, DEX: 3, AGI: 2, INT: 3, FDV: 5, PER: 3 },
    defesaNatural: { df: 4, dm: 4 },
    ataques: [ { nome: 'Punho do Semideus', dados: 4, efeito: '' },
               { nome: 'Voz Antiga', dados: 3, tipo: 'magico', alcance: 'Raio 3', efeito: 'Todos na área sofrem o dano.' } ],
    habilidades: [
      { nome: 'Espelho da Raça', tipo: 'Passiva', usos: '—', efeito: 'No início do combate, assume a forma do semideus da raça do herói de maior nível e fica imune ao tipo de dano que esse herói mais usa (físico ou mágico).' },
      { nome: 'Teste do Peregrino', tipo: 'Passiva', usos: '—', efeito: 'Se um herói se ajoelhar e passar num teste de FDV, o Eco para de atacá-lo pelo resto do combate.' } ],
    resistencias: 'Imune a veneno, sangramento e condições de mente.',
    drops: [ { item: 'baculo_luz_primeira', chance: 5 }, { item: 'montante_carrasco', chance: 8 }, { item: 'gibao_cacador', chance: 8 }, { item: 'amuleto_guarda_dupla', chance: 8 }, { item: 'coroa_chama_breve', chance: 5 }, { item: 'manto_centelha', chance: 5 }, { item: 'escamas_primeira_muda', chance: 5 },
             { item: 'bigorna_martelo', chance: 3 }, { item: 'arco_da_recusa', chance: 3 }, { item: 'faca_sorridente', chance: 3 },
             { texto: 'Fragmento de estátua de semideus', chance: 80 } ] },

  { id: 'quimera', nome: 'A Quimera', tipo: 'Monstruosidade', tamanho: 'grande', dificuldade: 4, especial: 'Perigo local', local: 'Covil da Quimera',
    descricao: 'Corpo de leão, uma cabeça de leão, uma de bode e uma de dragão, cada uma com vontade própria.',
    atributos: { FOR: 5, CON: 5, DEX: 3, AGI: 3, INT: 2, FDV: 3, PER: 4 },
    defesaNatural: { df: 3, dm: 2 },
    ataques: [ { nome: 'Cabeça de Leão (mordida)', dados: 3, efeito: '' },
               { nome: 'Cabeça de Bode (chifrada)', dados: 2, efeito: 'O alvo é empurrado 2 hex.' },
               { nome: 'Cabeça de Dragão (sopro)', dados: 3, tipo: 'magico', alcance: 'Cone de 3 hex', efeito: 'Todos no cone sofrem o dano.' } ],
    habilidades: [
      { nome: 'Três Cabeças', tipo: 'Passiva', usos: '—', efeito: 'Cada cabeça faz 1 ataque por turno, além das ações normais, e cada uma tem a própria chance de defesa.' },
      { nome: 'Cortar Cabeças', tipo: 'Passiva', usos: '—', efeito: 'A cada 30% da vida perdida, uma cabeça cai (a do alvo do golpe que passou do limite) e a Quimera perde aquele ataque.' } ],
    drops: [ { item: 'martelo_trovao', chance: 8 }, { item: 'vestes_sumo_sacerdote', chance: 8 }, { item: 'escudo_runico', chance: 8 }, { item: 'chifre_quimera', chance: 15 }, { texto: 'Juba da Quimera', chance: 60 } ] },

  { id: 'murlach', nome: 'Murlach', tipo: 'Dragão marinho', tamanho: 'colossal', dificuldade: 5, especial: 'Colosso', origem: 'desconhecida', local: 'Mar de Murlach',
    descricao: 'Um dragão marinho escuro, de escamas cor de piche e olhos vermelhos, maior que qualquer navio.',
    historia: 'Kurnamin existe para vigiar o mar contra Murlach. Ninguém sabe de onde ele veio. Os velhos da costa reparam que o nome dele parece com o de Karlach, e mudam de assunto.',
    atributos: { FOR: 8, CON: 8, DEX: 3, AGI: 3, INT: 3, FDV: 5, PER: 4 },
    defesaNatural: { df: 5, dm: 4 },
    ataques: [ { nome: 'Mordida Abissal', dados: 5, efeito: '' },
               { nome: 'Cauda', dados: 4, alcance: 'Linha de 6 hex', efeito: 'Todos na linha caem na água ou no convés.' },
               { nome: 'Onda', dados: 3, tipo: 'magico', alcance: 'Cone de 8 hex', efeito: 'Empurra todos 3 hex e apaga fogueiras, tochas e magias de fogo em área.' } ],
    habilidades: [
      { nome: 'Senhor do Mar', tipo: 'Passiva', usos: '—', efeito: 'Só luta no mar ou na costa. Submerso, não pode ser alvo de ataques corpo a corpo, e emerge no começo do próprio turno.' },
      { nome: 'Afundar Navio', tipo: 'Ativa', usos: '1 por batalha', efeito: 'Enrola-se num navio: se ninguém causar 15% da vida máxima dele antes do próximo turno, o navio afunda.' },
      { nome: 'As Defesas de Kurnamin', tipo: 'Passiva', usos: '—', efeito: 'Perto de Kurnamin, os arpões da cidade tiram 1 ação de ataque dele por turno.' } ],
    resistencias: 'Imune a afogamento e frio.',
    drops: [ { item: 'espada_runica', chance: 12 }, { item: 'coroa_arcanista', chance: 12 }, { item: 'grevas_ferro_negro', chance: 12 }, { item: 'escama_abissal_murlach', chance: 25 }, { texto: 'Dente de Murlach (material lendário)', chance: 100 } ] },

  { id: 'arquidemonio', nome: 'O Arquidemônio', tipo: 'Demônio', tamanho: 'grande', dificuldade: 5, especial: 'Chefe', origem: 'desconhecida', local: 'Acampamento do Arquidemônio',
    descricao: 'Um demônio alto de chifres curvos e pele de brasa, sentado numa tenda como um mercador que espera fregueses.',
    historia: 'Montou o acampamento no fim do deserto, perto das montanhas. Não ataca quem passa: oferece negócios. Alguns dizem que os pactos das Cavernas do Pacto passam pelas mãos dele.',
    atributos: { FOR: 6, CON: 6, DEX: 4, AGI: 4, INT: 7, FDV: 6, PER: 5 },
    defesaNatural: { df: 4, dm: 5 },
    ataques: [ { nome: 'Garras Infernais', dados: 4, efeito: '' },
               { nome: 'Chama Negra', dados: 4, tipo: 'magico', alcance: '8 hex, raio 1', efeito: '' } ],
    magias: [ 'bola_fogo', 'reflexo_arcano', 'passo_nebuloso', 'invisibilidade' ],
    habilidades: [
      { nome: 'Proposta', tipo: 'Ativa', usos: '1 por batalha', efeito: 'Oferece um contrato a um herói no meio da luta: ele recupera toda a vida e ganha +2d10 nos ataques até o fim do combate, mas deve um favor. Aceitar é escolha do jogador.' },
      { nome: 'Aura Infernal', tipo: 'Passiva', usos: '—', efeito: 'Quem começa o turno a até 2 hex dele sofre 1d10 × nível de fogo.' },
      { nome: 'Corte de Diabretes', tipo: 'Ativa', usos: '2 por batalha', efeito: 'Chama 3 Diabretes em hexágonos livres a até 4 hex.' },
      { nome: 'Forma Verdadeira', tipo: 'Passiva', usos: '1 por batalha', efeito: 'Abaixo de 40% da vida, a tenda pega fogo e ele cresce: tamanho colossal, +1 ação de ataque e +2d10 em todos os ataques.' } ],
    resistencias: 'Imune a fogo e a condições de mente.',
    fraquezas: 'Magias sagradas causam +2d10.',
    fases: [ { abaixoDe: 70, nome: 'Corte de Diabretes', efeito: 'Chama 3 Diabretes no início de cada fase nova.' }, { abaixoDe: 40, nome: 'Forma Verdadeira', efeito: 'A tenda pega fogo e ele cresce: tamanho colossal, +1 ação de ataque e +2d10 em todos os ataques.', mod: { ataques: 1, dados: 2 } } ],
    drops: [ { item: 'anel_poco_sem_fundo', chance: 12 }, { item: 'cajado_primeiro_arquimago', chance: 8 }, { item: 'punhal_gemeo', chance: 12 }, { item: 'calice_sagrado', chance: 12 }, { item: 'luvas_ladrao', chance: 12 }, { item: 'contrato_arquidemonio', chance: 25 }, { texto: 'Chifre do Arquidemônio', chance: 100 }, { texto: 'Mercadorias infernais da tenda (10d10 moedas de ouro)', chance: 100 } ] },

  // =====================================================================
  // GRANDE REINO DOS ORCS
  // =====================================================================
  { id: 'xama_orc', nome: 'Xamã Orc', tipo: 'Humanoide', tamanho: 'medio', dificuldade: 2, local: 'Acampamentos Orcs',
    descricao: 'Um orc velho coberto de ossos e tinta vermelha, que fala com os espíritos dos antepassados.',
    atributos: { FOR: 2, CON: 2, DEX: 2, AGI: 2, INT: 2, FDV: 4, PER: 3 },
    defesaNatural: { df: 1, dm: 1 },
    equip: { arma: 'simbolo_prata', peitoral: 'gibao_couro' },
    ataques: [ { nome: 'Cajado de Osso', dados: 1, efeito: '' } ],
    magias: [ 'bencao_forca', 'cura_menor', 'pele_pedra' ],
    habilidades: [
      { nome: 'Tambores de Guerra', tipo: 'Ativa', usos: '1 por batalha', efeito: 'Todos os orcs a até 6 hex ganham +1 ação de ataque no próximo turno.' } ],
    drops: [ { item: 'cajado_peregrino', chance: 10 }, { item: 'relicario_martir', chance: 10 }, { item: 'rosario_peregrino', chance: 10 }, { item: 'luvas_conjurador', chance: 10 }, { texto: 'Colar de ossos do xamã', chance: 60 }, { item: 'simbolo_prata', chance: 15 } ] },

  { id: 'orc_sem_cla', nome: 'Orc Sem-Clã', tipo: 'Humanoide', tamanho: 'medio', dificuldade: 3, local: 'Caminho de Planatux',
    descricao: 'Um orc de cicatrizes na testa onde o sinal do clã foi arrancado. Anda em bandos pelas estradas.',
    historia: 'Quem perde o Desafio de Poder por covardia é expulso do clã. Os expulsos se juntam no Caminho de Planatux e cobram pedágio de quem passa.',
    atributos: { FOR: 4, CON: 3, DEX: 3, AGI: 3, INT: 1, FDV: 2, PER: 3 },
    defesaNatural: { df: 1, dm: 0 },
    equip: { arma: 'machado_batalha', peitoral: 'cota_malha', elmo: 'elmo_ferro' },
    ataques: [],
    habilidades: [
      { nome: 'Nada a Perder', tipo: 'Passiva', usos: '—', efeito: 'Abaixo de 50% da vida, ganha +1 ação de ataque.' },
      { nome: 'Emboscada da Estrada', tipo: 'Passiva', usos: '1 por batalha', efeito: 'Se o grupo não perceber a emboscada (teste de PER), os Sem-Clã agem duas vezes no primeiro turno.' } ],
    drops: [ { item: 'marreta_quebra_escudo', chance: 15 }, { item: 'capuz_sombras', chance: 15 }, { item: 'muralha_ferro', chance: 15 }, { item: 'machado_batalha', chance: 20 }, { item: 'cota_malha', chance: 15 }, { texto: 'Pedágio roubado (4d10 moedas de prata)', chance: 80 } ] },

  { id: 'carcereiro_gornark', nome: 'O Carcereiro de Gornark', tipo: 'Humanoide', tamanho: 'grande', dificuldade: 3, especial: 'Perigo local', local: 'Dungeons dos de Gornark',
    descricao: 'Um meio-ogro enorme com um molho de chaves no cinto e correntes enroladas nos braços.',
    historia: 'Os de Gornark trancam nas masmorras da montanha tudo o que não querem ver: inimigos, dívidas, parentes. O carcereiro não sabe mais quem prendeu nem por quê, mas não deixa ninguém sair.',
    atributos: { FOR: 5, CON: 4, DEX: 3, AGI: 2, INT: 1, FDV: 3, PER: 3 },
    defesaNatural: { df: 2, dm: 1 },
    ataques: [ { nome: 'Correntes', dados: 3, alcance: '3 hex', efeito: 'Prende o alvo: ele não se move no próximo turno.' },
               { nome: 'Punho', dados: 2, efeito: '' } ],
    habilidades: [
      { nome: 'Abrir as Celas', tipo: 'Ativa', usos: '1 por batalha', efeito: 'Solta 3 prisioneiros enlouquecidos (use Bandidos) que atacam qualquer um, inclusive ele.' },
      { nome: 'Molho de Chaves', tipo: 'Passiva', usos: '—', efeito: 'Quem pegar as chaves dele (um crítico ou um teste de DEX adjacente) pode abrir qualquer porta das masmorras.' } ],
    drops: [ { item: 'sabre_vento', chance: 15 }, { item: 'gibao_corvo', chance: 15 }, { item: 'grevas_investida', chance: 15 }, { item: 'correntes_carcereiro', chance: 10 }, { texto: 'Chaves das masmorras de Gornark', chance: 100 } ] },

  { id: 'campeao_lonkcarn', nome: 'O Campeão de Lonk-Carn', tipo: 'Humanoide', tamanho: 'medio', dificuldade: 4, especial: 'Chefe', local: 'Grande Cidade Orc Lonk-Carn',
    descricao: 'O orc mais forte da capital, com um machado nas costas e um cinturão cheio de troféus.',
    historia: 'Os orcs foram feitos pelos elfos para a força e a resistência, e passaram eras guardando fronteiras que não eram suas. Em Lonk-Carn, força é lei: quem vence o Campeão fala com o rei.',
    atributos: { FOR: 6, CON: 5, DEX: 3, AGI: 3, INT: 2, FDV: 4, PER: 3 },
    defesaNatural: { df: 2, dm: 1 },
    equip: { arma: 'machado_grande_reino', elmo: 'elmo_sentinela', peitoral: 'couraca_baluarte' },
    ataques: [],
    habilidades: [
      { nome: 'Duelo de Honra', tipo: 'Passiva', usos: '—', efeito: 'Só luta contra um herói por vez. Se outro herói interferir, a cidade inteira passa a ser inimiga do grupo.' },
      { nome: 'Grito do Campeão', tipo: 'Ativa', usos: '1 por batalha', efeito: 'Recupera 25% da vida e soma +2d10 no próximo ataque.' },
      { nome: 'Respeito', tipo: 'Passiva', usos: '—', efeito: 'Se for derrotado num duelo justo, não morre: entrega o cinturão e passa a respeitar o vencedor.' } ],
    drops: [ { item: 'arco_cacador', chance: 8 }, { item: 'cota_mithril', chance: 8 }, { item: 'colar_constituicao', chance: 8 }, { item: 'cinturao_campeao', chance: 100 }, { item: 'machado_grande_reino', chance: 20 } ] },

  { id: 'espirito_ancestral_orc', nome: 'Espírito Ancestral Orc', tipo: 'Morto-vivo', tamanho: 'grande', dificuldade: 4, especial: 'Guardião', local: 'Área do Desafio de Poder',
    descricao: 'Um orc gigante feito de fumaça vermelha, com olhos de brasa, que aparece entre as pedras do desafio.',
    historia: 'Os campeões orcs mortos voltam para as pedras do Desafio de Poder e testam quem vem provar o próprio valor. Vencer é ser reconhecido por todos os clãs.',
    atributos: { FOR: 6, CON: 5, DEX: 3, AGI: 3, INT: 2, FDV: 5, PER: 3 },
    defesaNatural: { df: 4, dm: 2 },
    ataques: [ { nome: 'Machado Espiritual', dados: 4, efeito: 'Ignora escudos.' } ],
    habilidades: [
      { nome: 'Desafio', tipo: 'Passiva', usos: '—', efeito: 'Soma +1d10 em todos os ataques para cada herói além do primeiro que estiver lutando contra ele.' },
      { nome: 'Prova de Força', tipo: 'Ativa', usos: '1 por batalha', efeito: 'Desafia um herói num teste de FOR contra ele. Se o herói vencer, o espírito perde 25% da vida; se perder, o herói fica sem ações no próximo turno.' } ],
    resistencias: 'Imune a veneno, sangramento e agarrão.',
    drops: [ { item: 'estandarte_sagrado', chance: 8 }, { item: 'besta_pesada_ana', chance: 8 }, { item: 'gibao_cacador', chance: 8 }, { item: 'amuleto_guarda_dupla', chance: 8 }, { item: 'marca_desafio_poder', chance: 100 }, { item: 'machado_grande_reino', chance: 10 } ] },

  { id: 'bruxa_do_moinho', nome: 'A Bruxa do Moinho', tipo: 'Humanoide', tamanho: 'medio', dificuldade: 4, especial: 'Chefe', local: 'Antigo Moinho da Bruxa',
    descricao: 'Uma velha de nariz torto e dedos longos, que fia na roca enquanto as pás do moinho giram sem vento.',
    historia: 'O moinho parou de moer trigo há muito tempo. Agora mói outras coisas, e os corvos em volta dele são grandes demais para serem só corvos.',
    atributos: { FOR: 1, CON: 3, DEX: 3, AGI: 3, INT: 6, FDV: 5, PER: 4 },
    defesaNatural: { df: 2, dm: 3 },
    equip: { peitoral: 'vestes_rituais' },
    ataques: [ { nome: 'Unhas Envenenadas', dados: 2, efeito: 'Veneno: 1d10 × nível por 2 turnos, ignorando a defesa.' } ],
    magias: [ 'prisao_espinhos', 'rajada_gelo', 'invisibilidade', 'regeneracao' ],
    habilidades: [
      { nome: 'Maldição da Forma', tipo: 'Ativa', usos: '2 por batalha', efeito: 'Um alvo a até 6 hex faz teste de FDV. Se falhar, vira um sapo até o fim do próximo turno: sem ações, movimento 1.' },
      { nome: 'Corvos da Bruxa', tipo: 'Ativa', usos: '1 por batalha', efeito: 'Uma revoada cobre um raio de 2 hex: todos ali sofrem 2d10 × nível e têm −2 na chance de defesa por 1 turno.' },
      { nome: 'Pás do Moinho', tipo: 'Passiva', usos: '—', efeito: 'Quem estiver adjacente ao moinho no início do turno é empurrado 2 hex.' } ],
    fraquezas: 'Ferro frio: armas de ferro comuns causam +1d10.',
    drops: [ { item: 'manto_noite_arcana', chance: 8 }, { item: 'amuleto_duplo_conjuro', chance: 10 }, { item: 'arco_cacador', chance: 8 }, { item: 'couraca_guardiao', chance: 8 }, { item: 'amuleto_devoto', chance: 8 }, { item: 'roca_bruxa', chance: 20 }, { texto: 'Caldeirão com ingredientes raros', chance: 70 } ] },

  { id: 'acolito_carmesim', nome: 'Acólito Carmesim', tipo: 'Humanoide', tamanho: 'medio', dificuldade: 2, origem: 'deus_marcado', local: 'Floresta Morta do Clérigo',
    descricao: 'Um fiel de túnica vermelha, com o rosto pintado com o olho do Deus Marcado.',
    atributos: { FOR: 1, CON: 2, DEX: 2, AGI: 2, INT: 3, FDV: 3, PER: 2 },
    defesaNatural: { df: 0, dm: 1 },
    equip: { arma: 'adaga', peitoral: 'tunica_encantada' },
    ataques: [],
    magias: [ 'chama', 'toque_vampirico' ],
    habilidades: [
      { nome: 'Oferenda', tipo: 'Reação', usos: '1 por batalha', efeito: 'Quando cai, o sangue dele cura o Grande Clérigo em 10% da vida máxima, se ele estiver a até 10 hex.' } ],
    drops: [ { item: 'lanterna_devota', chance: 10 }, { item: 'presa_lobo', chance: 10 }, { item: 'orbe_gelo', chance: 10 }, { item: 'couraca_escamas', chance: 10 }, { item: 'anel_foco_arcano', chance: 10 }, { texto: 'Túnica vermelha com o olho marcado', chance: 50 }, { texto: 'Lasca de cristal carmesim', chance: 30 } ] },

  { id: 'cavaleiro_carmesim', nome: 'Cavaleiro Carmesim', tipo: 'Humanoide', tamanho: 'medio', dificuldade: 3, origem: 'deus_marcado', local: 'Floresta Morta do Clérigo',
    descricao: 'Um guerreiro de armadura vermelho-escura, com cristais crescendo nas juntas.',
    historia: 'Os guardas do Grande Clérigo beberam da mesma essência que ele adora. Não sentem dor, e as feridas deles brilham em vez de sangrar.',
    atributos: { FOR: 4, CON: 4, DEX: 2, AGI: 2, INT: 1, FDV: 3, PER: 2 },
    defesaNatural: { df: 1, dm: 1 },
    equip: { arma: 'espada_longa', secundaria: 'escudo_torre', elmo: 'elmo_ferro', peitoral: 'couraca_ferro' },
    ataques: [],
    habilidades: [
      { nome: 'Marca Carmesim', tipo: 'Passiva', usos: '—', efeito: 'Cada acerto coloca 1 Marca Carmesim. Com 3, o alvo perde 1 ação de ataque por turno até ser curado.' },
      { nome: 'Sem Dor', tipo: 'Passiva', usos: '—', efeito: 'Não sofre efeitos de sangramento e não pode ser derrubado.' } ],
    drops: [ { item: 'besta_mao', chance: 15 }, { item: 'botas_andarilho', chance: 15 }, { item: 'amuleto_antidoto', chance: 15 }, { item: 'couraca_ferro', chance: 20 }, { item: 'escudo_torre', chance: 15 }, { texto: 'Lasca de cristal carmesim', chance: 60 } ] },

  { id: 'grande_clerigo', nome: 'O Grande Clérigo do Deus Marcado', tipo: 'Humanoide', tamanho: 'medio', dificuldade: 5, especial: 'Chefe', origem: 'deus_marcado', local: 'Castelo do Grande Clérigo do Deus-Marcado',
    descricao: 'Um homem alto de vestes vermelhas e coroa de cristal, com um relicário brilhando no peito.',
    historia: 'Enquanto os Araltos procuram os fragmentos do Deus Marcado, o Grande Clérigo reza para eles. Do castelo cercado pela floresta morta, prepara a igreja que vai receber o seu deus quando ele voltar.',
    atributos: { FOR: 2, CON: 5, DEX: 3, AGI: 3, INT: 5, FDV: 8, PER: 4 },
    defesaNatural: { df: 3, dm: 5 },
    equip: { arma: 'relicario_deus_marcado', peitoral: 'vestes_rituais', elmo: 'mitra_peregrino' },
    ataques: [ { nome: 'Toque da Marca', dados: 3, tipo: 'magico', efeito: 'Coloca 2 Marcas Carmesins.' } ],
    magias: [ 'cura_grupo', 'santuario', 'reflexo_arcano', 'lanca_relampago', 'restauracao' ],
    habilidades: [
      { nome: 'Fé Invertida', tipo: 'Passiva', usos: '—', efeito: 'Curas lançadas pelos heróis a até 4 hex dele também curam ele pela metade do valor.' },
      { nome: 'Sermão', tipo: 'Ativa', usos: '1 por batalha', efeito: 'Um herói a até 8 hex faz teste de FDV. Se falhar, luta ao lado do Clérigo por 2 turnos.' },
      { nome: 'Altar Carmesim', tipo: 'Passiva', usos: '—', efeito: 'Enquanto o fragmento do altar do castelo estiver inteiro, recupera 10% da vida máxima por turno. Destruir o altar exige 3 ataques que acertem.' },
      { nome: 'Avatar da Marca', tipo: 'Passiva', usos: '1 por batalha', efeito: 'Abaixo de 30% da vida, a essência toma o corpo dele: vira tamanho grande, ganha +2 ações de ataque e todos os ataques colocam Marcas Carmesins.' } ],
    fraquezas: 'Magias sagradas de quem não é marcado causam +2d10.',
    resistencias: 'Imune a condições de mente.',
    fases: [ { abaixoDe: 50, nome: 'Fé Desesperada', efeito: 'Os acólitos que ainda estiverem de pé se sacrificam: cada um cura o Clérigo em 10%.' }, { abaixoDe: 30, nome: 'Avatar da Marca', efeito: 'A essência toma o corpo dele: tamanho grande, +2 ações de ataque, e todos os ataques colocam Marcas Carmesins.', mod: { ataques: 2, dados: 2 } } ],
    drops: [ { item: 'baculo_luz_primeira', chance: 15 }, { item: 'vestes_tecidas_luz', chance: 10 }, { item: 'rapieira_duelista', chance: 12 }, { item: 'calice_sagrado', chance: 12 }, { item: 'botas_vento_perfeitas', chance: 12 }, { item: 'relicario_deus_marcado', chance: 60 }, { texto: 'Escrituras da Igreja do Deus Marcado', chance: 100 }, { texto: 'Lista de fragmentos já recolhidos pelos Araltos', chance: 50 } ] },

  // =====================================================================
  // GRANDE ILHA DE TORTUMAGA
  // =====================================================================
  { id: 'goblin_verde', nome: 'Goblin Verde', tipo: 'Humanoide', tamanho: 'pequeno', dificuldade: 1, local: 'Goblins Verdes',
    descricao: 'Um goblin de pele verde-musgo, pintado com lama, que ataca da mata alta.',
    historia: 'Os Goblins Verdes e os Goblins Cinzas vivem em lados opostos da ilha e brigam desde que alguém lembra. Cada tribo jura que Tobi preferia a outra.',
    atributos: { FOR: 1, CON: 2, DEX: 3, AGI: 3, INT: 1, FDV: 1, PER: 3 },
    defesaNatural: { df: 0, dm: 0 },
    equip: { arma: 'fisga_goblin_verde', elmo: 'capuz_couro' },
    ataques: [],
    habilidades: [
      { nome: 'Rixa Antiga', tipo: 'Passiva', usos: '—', efeito: 'Se houver Goblins Cinzas na batalha, ele ataca os Cinzas primeiro, mesmo que os heróis estejam mais perto.' },
      { nome: 'Sumir na Mata', tipo: 'Reação', usos: '1 por batalha', efeito: 'No mato alto, fica oculto e se move 3 hex sem ser interceptado.' } ],
    drops: [ { item: 'fisga_goblin_verde', chance: 10 }, { texto: '1d10 moedas de bronze e uma pedra bonita', chance: 80 } ] },

  { id: 'goblin_cinza', nome: 'Goblin Cinza', tipo: 'Humanoide', tamanho: 'pequeno', dificuldade: 2, local: 'Goblins Cinzas',
    descricao: 'Um goblin de pele cinza, sobrancelhas queimadas e óculos de solda, sempre com alguma bomba no cinto.',
    historia: 'Os Goblins Cinzas aprenderam a fazer pólvora com os anões de Porto Tortuoso, e os anões se arrependem até hoje.',
    atributos: { FOR: 1, CON: 2, DEX: 3, AGI: 2, INT: 3, FDV: 1, PER: 2 },
    defesaNatural: { df: 1, dm: 0 },
    equip: { arma: 'adaga', elmo: 'capuz_couro' },
    ataques: [ { nome: 'Bomba', dados: 2, tipo: 'magico', alcance: '5 hex, raio 1', efeito: 'Atinge todos na área, inclusive outros goblins. Num 10 no d10, explode na mão dele.' } ],
    habilidades: [
      { nome: 'Rixa Antiga', tipo: 'Passiva', usos: '—', efeito: 'Se houver Goblins Verdes na batalha, ele ataca os Verdes primeiro.' },
      { nome: 'Explosão Final', tipo: 'Passiva', usos: '—', efeito: 'Ao cair, as bombas do cinto explodem: 2d10 × nível em todos os adjacentes.' } ],
    drops: [ { item: 'martelo_terremoto', chance: 10 }, { item: 'varinha_espinhos', chance: 10 }, { item: 'vestes_eremita', chance: 10 }, { item: 'polvora_cinza', chance: 10 }, { texto: 'Óculos de solda goblin', chance: 40 } ] },

  { id: 'carrapato_do_casco', nome: 'Carrapato do Casco', tipo: 'Fera', tamanho: 'medio', dificuldade: 2, origem: 'deus_marcado', local: 'Subterrâneo do Casco',
    descricao: 'Um carrapato do tamanho de um porco, de carapaça avermelhada, que vive grudado nas paredes dos túneis.',
    historia: 'Os túneis sob a ilha são as frestas do casco da Tartaruga. Os carrapatos bebem dela, e junto bebem a contaminação que ela absorveu.',
    atributos: { FOR: 2, CON: 3, DEX: 2, AGI: 2, INT: 1, FDV: 2, PER: 2 },
    defesaNatural: { df: 3, dm: 1 },
    ataques: [ { nome: 'Picada Sugadora', dados: 2, efeito: 'Gruda no alvo. Grudado, recupera 20% do dano que causa e coloca 1 Marca Carmesim por turno.' } ],
    habilidades: [
      { nome: 'Teto e Paredes', tipo: 'Passiva', usos: '—', efeito: 'Anda pelo teto dos túneis e cai sobre a presa: o primeiro ataque do combate é crítico automático.' } ],
    drops: [ { texto: 'Carapaça de carrapato (vira escudo com um ferreiro)', chance: 40 } ] },

  { id: 'verme_do_casco', nome: 'O Verme do Casco', tipo: 'Aberração', tamanho: 'colossal', dificuldade: 4, especial: 'Perigo local', origem: 'deus_marcado', local: 'Subterrâneo do Casco',
    descricao: 'Um verme branco e cego, do tamanho de um túnel inteiro, com veias vermelhas brilhando sob a pele.',
    historia: 'A Tartaruga Magnalaga absorveu a contaminação da Batalha Colossal para salvar o lago. O Verme cresceu nas frestas do casco comendo essa contaminação. Talvez seja ele que faz a Tartaruga mergulhar cada vez mais.',
    atributos: { FOR: 6, CON: 7, DEX: 1, AGI: 2, INT: 1, FDV: 4, PER: 4 },
    defesaNatural: { df: 3, dm: 3 },
    ataques: [ { nome: 'Engolir Túnel', dados: 4, alcance: 'Linha de 4 hex', efeito: 'Avança pelo túnel: todos na linha sofrem o dano, e quem falhar num teste de DEX é engolido (3d10 × nível por turno, até causar 20% da vida dele de dentro).' } ],
    habilidades: [
      { nome: 'Cego, Não Surdo', tipo: 'Passiva', usos: '—', efeito: 'Não enxerga: sente vibração. Quem não se mover no turno fica invisível para ele.' },
      { nome: 'Cavar', tipo: 'Ativa', usos: '2 por batalha', efeito: 'Some na rocha e reaparece a até 8 hex, derrubando todos adjacentes ao ponto de saída.' },
      { nome: 'A Tartaruga Sente', tipo: 'Passiva', usos: '—', efeito: 'Cada vez que ele perde 25% da vida, a ilha inteira treme: todos fazem teste de DEX ou caem.' } ],
    resistencias: 'Imune a condições de mente e a Marcas Carmesins.',
    drops: [ { item: 'anel_agilidade', chance: 8 }, { item: 'anel_olho_aguia', chance: 8 }, { item: 'nucleo_contaminado', chance: 30 }, { texto: 'Lasca de casco da Tartaruga (material lendário)', chance: 100 } ] },

  { id: 'guardia_da_entrada', nome: 'A Guardiã da Entrada', tipo: 'Serpente marinha', tamanho: 'grande', dificuldade: 4, especial: 'Guardião', local: 'Entrada da Turtumaga',
    descricao: 'Uma serpente marinha azul-esverdeada, de barbatanas finas, que nada em círculos em volta de uma abertura submersa no casco.',
    historia: 'A Entrada da Turtumaga leva para dentro da Tartaruga. Ninguém sabe se a Guardiã foi posta ali pelos anões, pelos antigos, ou pela própria Magnalaga.',
    atributos: { FOR: 5, CON: 4, DEX: 4, AGI: 4, INT: 2, FDV: 3, PER: 4 },
    defesaNatural: { df: 3, dm: 3 },
    ataques: [ { nome: 'Mordida', dados: 3, efeito: '' },
               { nome: 'Jato de Água', dados: 3, tipo: 'magico', alcance: 'Linha de 6 hex', efeito: 'Empurra todos na linha 3 hex.' } ],
    habilidades: [
      { nome: 'Nascida na Água', tipo: 'Passiva', usos: '—', efeito: 'Debaixo da água, soma +1 ação de ataque e +2 na chance de defesa.' },
      { nome: 'Enrolar', tipo: 'Ativa', usos: '—', efeito: 'Enrola um alvo adjacente: ele fica preso e sofre 2d10 × nível por turno até passar num teste de FOR.' },
      { nome: 'Deixar Passar', tipo: 'Passiva', usos: '—', efeito: 'Quem trouxer uma Lasca de casco da Tartaruga ou for anão do casco pode passar sem luta.' } ],
    drops: [ { item: 'anel_forca', chance: 8 }, { item: 'anel_destreza', chance: 8 }, { item: 'broche_diplomata', chance: 8 }, { item: 'lanca_da_entrada', chance: 20 }, { texto: 'Escamas azuis da Guardiã', chance: 70 } ] },

  { id: 'draco_das_mares', nome: 'Draco das Marés', tipo: 'Dragão menor', tamanho: 'grande', dificuldade: 3, local: 'Ilha Direita',
    descricao: 'Um dragão comprido e sem asas, de escamas vermelhas, que dorme enrolado nas pedras da Ilha Direita.',
    atributos: { FOR: 4, CON: 4, DEX: 3, AGI: 3, INT: 2, FDV: 2, PER: 3 },
    defesaNatural: { df: 3, dm: 2 },
    ataques: [ { nome: 'Mordida', dados: 3, efeito: '' }, { nome: 'Cauda', dados: 2, efeito: 'Derruba o alvo.' } ],
    habilidades: [
      { nome: 'Sopro de Vapor', tipo: 'Ativa', usos: '2 por batalha', efeito: 'Cone de 4 hex: 3d10 × nível de dano mágico e ninguém enxerga dentro do vapor até o fim do próximo turno.' },
      { nome: 'Tesouro do Ninho', tipo: 'Passiva', usos: '—', efeito: 'Luta com +2d10 em todos os ataques enquanto alguém estiver a até 2 hex do ninho dele.' } ],
    drops: [ { item: 'espada_bastarda', chance: 15 }, { item: 'mitra_peregrino', chance: 15 }, { item: 'brinco_foco', chance: 15 }, { texto: 'Escamas vermelhas de draco', chance: 70 }, { texto: 'Tesouro do ninho (4d10 moedas de ouro)', chance: 60 } ] },

  { id: 'wyverns_gemeas', nome: 'As Wyverns Gêmeas', tipo: 'Dragão menor', tamanho: 'grande', dificuldade: 4, especial: 'Perigo local', local: 'Ilhas Gemia',
    descricao: 'Duas wyverns, uma rubra e uma dourada, cada uma com ninho numa das Ilhas Gemia. Esta ficha vale para cada uma delas.',
    historia: 'Nasceram do mesmo ovo e foram separadas pelo mar quando a Tartaruga mergulhou. Desde então, cada uma guarda uma ilha e grita para a outra ao pôr do sol.',
    atributos: { FOR: 4, CON: 4, DEX: 4, AGI: 4, INT: 2, FDV: 3, PER: 4 },
    defesaNatural: { df: 3, dm: 2 },
    ataques: [ { nome: 'Mordida', dados: 3, efeito: '' },
               { nome: 'Ferrão', dados: 2, efeito: 'Veneno: 2d10 × nível no início dos próximos 2 turnos do alvo, ignorando a defesa.' } ],
    habilidades: [
      { nome: 'Vínculo Gêmeo', tipo: 'Passiva', usos: '—', efeito: 'Quando uma é atacada, a outra chega voando 2 turnos depois. Se uma cair, a outra ganha +1 ação de ataque e +2d10 em todos os ataques até o fim da batalha.' },
      { nome: 'Voo Rasante', tipo: 'Ativa', usos: '—', efeito: 'Voa em linha reta até 8 hex e ataca qualquer um no caminho sem ser interceptada.' } ],
    drops: [ { item: 'tomo_arcanista', chance: 8 }, { item: 'manto_arquimago', chance: 8 }, { item: 'escudo_ferro_negro', chance: 8 }, { item: 'botas_asas_gemeas', chance: 10 }, { texto: 'Ferrão de wyvern', chance: 60 } ] },

  { id: 'drake_fogo', nome: 'Drake de Fogo', tipo: 'Dragão menor', tamanho: 'medio', dificuldade: 3, local: 'Ilha Esquerda',
    descricao: 'Um dragãozinho vermelho do tamanho de um cavalo, agressivo e barulhento, que caça peixes e marinheiros.',
    atributos: { FOR: 3, CON: 3, DEX: 3, AGI: 3, INT: 1, FDV: 2, PER: 3 },
    defesaNatural: { df: 2, dm: 2 },
    ataques: [ { nome: 'Mordida', dados: 2, efeito: '' },
               { nome: 'Cuspe de Fogo', dados: 2, tipo: 'magico', alcance: '5 hex', efeito: 'O alvo pega fogo: 1d10 × nível no próximo turno.' } ],
    habilidades: [
      { nome: 'Bando', tipo: 'Passiva', usos: '—', efeito: 'Na Ilha Esquerda vivem 1d10 ÷ 2 (arredondado para cima) drakes, que atacam juntos.' } ],
    resistencias: 'Imune a fogo.',
    drops: [ { item: 'cinto_tita', chance: 15 }, { item: 'pulseira_esquiva', chance: 15 }, { item: 'bolsa_alquimista', chance: 15 }, { texto: 'Glândula de fogo de drake', chance: 40 } ] },

  { id: 'tartaruga_magnalaga', nome: 'A Tartaruga Magnalaga', tipo: 'Colosso', tamanho: 'colossal', dificuldade: 5, especial: 'Colosso', origem: 'jurgmund', local: 'Grande Lago Central',
    descricao: 'Uma tartaruga tão grande que carrega uma ilha inteira nas costas, com cidades, florestas e tribos.',
    historia: 'Na Batalha Colossal, ela absorveu a contaminação que caiu no lago. Agora está acordando: os mergulhos ficaram mais frequentes, e os anões do casco notam que ela procura algo no fundo da Fissura. Não é inimiga, mas ninguém sabe o que ela faria se fosse atacada.',
    atributos: { FOR: 10, CON: 10, DEX: 1, AGI: 1, INT: 5, FDV: 8, PER: 5 },
    defesaNatural: { df: 8, dm: 8 },
    ataques: [ { nome: 'Mordida', dados: 6, efeito: '' },
               { nome: 'Pata', dados: 5, alcance: 'Cone de 6 hex', efeito: 'Todos no cone são jogados na água.' } ],
    habilidades: [
      { nome: 'Mergulho', tipo: 'Ativa', usos: '1 por batalha', efeito: 'Afunda por 3 turnos: tudo na ilha que não estiver preso fica na água, e ninguém consegue atacá-la.' },
      { nome: 'Casco Absorvente', tipo: 'Passiva', usos: '—', efeito: 'Magias de dano contra o casco são absorvidas e curam metade do valor. Só a cabeça e as patas recebem dano normal.' },
      { nome: 'A Ilha Viva', tipo: 'Passiva', usos: '—', efeito: 'Se ela for ferida, a ilha inteira sente: Magnalag e Porto Tortuoso passam a ser inimigos de quem a atacou.' } ],
    resistencias: 'Imune a Marcas Carmesins, venenos e condições de mente.',
    drops: [ { texto: 'Lasca de casco da Tartaruga (material lendário)', chance: 100 } ] },

  // =====================================================================
  // MONTANHAS DE ATRELON
  // =====================================================================
  { id: 'guarda_real_vassk', nome: 'Guarda Real de Vassk', tipo: 'Humanoide', tamanho: 'medio', dificuldade: 3, origem: 'jurgmund', local: 'Cidade de Atrelon', especial: 'Elite',
    descricao: 'Um serpentariano alto, de corpo longo e escamas polidas, com lança e armadura de malha pintada de verde.',
    historia: 'A guarda pessoal do rei Vassk. Obedecem ao rei como obedeceriam à própria Cobra, e o rei ouve demais o emissário de máscara dourada.',
    atributos: { FOR: 4, CON: 3, DEX: 4, AGI: 3, INT: 2, FDV: 3, PER: 3 },
    defesaNatural: { df: 1, dm: 1 },
    equip: { arma: 'lanca_real_vassk', secundaria: 'broquel', elmo: 'coifa_malha', peitoral: 'cota_malha' },
    ataques: [],
    habilidades: [
      { nome: 'Trocar de Pele', tipo: 'Passiva', usos: '1 por batalha', efeito: 'Na primeira vez que cairia a 0, levanta com 25% da vida, sem condições negativas.' },
      { nome: 'Corpo de Serpente', tipo: 'Reação', usos: '1 por batalha', efeito: 'Contorce o corpo alongado para desviar: +3 na chance de defesa contra um ataque.' },
      { nome: 'Muralha de Escamas', tipo: 'Passiva', usos: '—', efeito: 'Dois guardas adjacentes somam +1 na chance de defesa um do outro.' } ],
    drops: [ { item: 'grevas_equinocio', chance: 6 }, { item: 'arco_composto', chance: 15 }, { item: 'capuz_sombras', chance: 15 }, { item: 'escudo_cruzado', chance: 15 }, { item: 'lanca_real_vassk', chance: 15 }, { item: 'cota_malha', chance: 15 }, { texto: 'Insígnia da Guarda Real', chance: 60 } ] },

  { id: 'yeti', nome: 'Yeti', tipo: 'Fera', tamanho: 'grande', dificuldade: 3, local: 'Domínios dos Yets',
    descricao: 'Um gigante peludo e branco, com braços enormes, que some na neve como se fosse parte dela.',
    atributos: { FOR: 5, CON: 5, DEX: 2, AGI: 3, INT: 1, FDV: 2, PER: 3 },
    defesaNatural: { df: 2, dm: 2 },
    ataques: [ { nome: 'Garras', dados: 3, efeito: '' },
               { nome: 'Bloco de Gelo', dados: 2, alcance: '6 hex', efeito: 'Derruba o alvo.' } ],
    habilidades: [
      { nome: 'Rugido Gelado', tipo: 'Ativa', usos: '1 por batalha', efeito: 'Todos a até 4 hex fazem teste de FDV. Quem falhar fica paralisado de medo e perde a próxima ação de ataque.' },
      { nome: 'Branco na Neve', tipo: 'Passiva', usos: '—', efeito: 'Na neve, só é notado com um teste de PER. O primeiro ataque dele no combate é crítico automático.' } ],
    resistencias: 'Imune a frio.',
    fraquezas: 'Fogo causa +1d10.',
    drops: [ { item: 'manto_pele_yeti', chance: 8 }, { texto: 'Pele de yeti', chance: 70 } ] },

  { id: 'mamute_tundra', nome: 'Mamute da Tundra', tipo: 'Fera', tamanho: 'grande', dificuldade: 3, local: 'Tundra de Atrelon',
    descricao: 'Um elefante de pelo longo e presas curvas, que anda em manadas pela tundra.',
    atributos: { FOR: 5, CON: 5, DEX: 1, AGI: 2, INT: 1, FDV: 2, PER: 2 },
    defesaNatural: { df: 3, dm: 1 },
    ataques: [ { nome: 'Presas', dados: 3, efeito: '' } ],
    habilidades: [
      { nome: 'Atropelar', tipo: 'Ativa', usos: '—', efeito: 'Corre até 6 hex em linha reta. Todos no caminho sofrem 3d10 × nível e caem, a não ser que passem num teste de DEX.' },
      { nome: 'Manada', tipo: 'Passiva', usos: '—', efeito: 'Pacífico se deixado em paz. Se um mamute for atacado, a manada inteira ataca.' } ],
    drops: [ { texto: 'Marfim de mamute', chance: 70 }, { texto: 'Carne para uma semana', chance: 100 } ] },

  { id: 'draco_rubro', nome: 'Draco Rubro de Atrelon', tipo: 'Dragão menor', tamanho: 'medio', dificuldade: 3, local: 'Picos de Atrelon',
    descricao: 'Um dragão vermelho do tamanho de um cavalo, que voa em bandos entre os picos nevados.',
    atributos: { FOR: 3, CON: 3, DEX: 4, AGI: 4, INT: 2, FDV: 2, PER: 4 },
    defesaNatural: { df: 2, dm: 2 },
    ataques: [ { nome: 'Garras', dados: 2, efeito: '' },
               { nome: 'Sopro de Fogo', dados: 2, tipo: 'magico', alcance: 'Cone de 3 hex', efeito: '' } ],
    habilidades: [
      { nome: 'Bando', tipo: 'Passiva', usos: '—', efeito: 'Caçam em grupos de 3 a 5 e cercam a presa pelo ar.' },
      { nome: 'Voo', tipo: 'Passiva', usos: '—', efeito: 'Voa por cima de obstáculos.' } ],
    resistencias: 'Imune a fogo.',
    drops: [ { item: 'amuleto_cacador', chance: 15 }, { item: 'colar_dentes', chance: 15 }, { item: 'bolsa_alquimista', chance: 15 }, { texto: 'Escamas rubras de draco', chance: 60 } ] },

  { id: 'matriarca_rubra', nome: 'A Matriarca Rubra', tipo: 'Dragão', tamanho: 'colossal', dificuldade: 5, especial: 'Chefe', local: 'Cavernas da Estrela Dourada',
    descricao: 'A mãe de todos os dracos rubros de Atrelon, com escamas da cor de brasa e uma cicatriz dourada no peito.',
    historia: 'Guarda no fundo das Cavernas da Estrela Dourada uma pedra que brilha como o Dragão Dourado. Alguns dizem que o dragão dourado visto sobre os picos vem visitá-la.',
    atributos: { FOR: 7, CON: 7, DEX: 3, AGI: 4, INT: 4, FDV: 5, PER: 5 },
    defesaNatural: { df: 5, dm: 4 },
    ataques: [ { nome: 'Mordida', dados: 5, efeito: '' },
               { nome: 'Garras', dados: 4, efeito: '' },
               { nome: 'Sopro de Magma', dados: 5, tipo: 'magico', alcance: 'Cone de 6 hex', efeito: 'O chão queima por 2 turnos: 1d10 × nível para quem começar o turno nele.' } ],
    habilidades: [
      { nome: 'Chamar os Filhos', tipo: 'Ativa', usos: '1 por batalha', efeito: 'Quatro Dracos Rubros chegam voando no turno seguinte.' },
      { nome: 'Fúria de Mãe', tipo: 'Passiva', usos: '—', efeito: 'Cada draco que cair na batalha dá a ela +1d10 em todos os ataques (máximo +4d10).' },
      { nome: 'Voo', tipo: 'Passiva', usos: '—', efeito: 'Voa. Dentro das cavernas, só consegue voar na câmara central.' } ],
    resistencias: 'Imune a fogo e a condições de mente.',
    drops: [ { item: 'espada_runica', chance: 12 }, { item: 'elmo_leao', chance: 12 }, { item: 'grevas_ferro_negro', chance: 12 }, { item: 'ovo_estrela_dourada', chance: 100 }, { texto: 'Tesouro da Matriarca (15d10 moedas de ouro)', chance: 100 } ] },

  { id: 'turlach', nome: 'Turlach', tipo: 'Serpente marinha', tamanho: 'colossal', dificuldade: 5, especial: 'Colosso', origem: 'desconhecida', local: 'Encontro de Turlach',
    descricao: 'Uma serpente marinha vermelha de escamas espelhadas, que vive onde o rio da montanha encontra o mar.',
    historia: 'Karlach, Murlach, Turlach. Os sábios de Nazarik acham que os nomes não são coincidência. Turlach não ataca barcos que passam em silêncio.',
    atributos: { FOR: 8, CON: 7, DEX: 4, AGI: 4, INT: 3, FDV: 5, PER: 4 },
    defesaNatural: { df: 4, dm: 6 },
    ataques: [ { nome: 'Mordida', dados: 5, efeito: '' },
               { nome: 'Esmagar', dados: 4, efeito: 'Enrola o alvo: preso e sofrendo 2d10 × nível por turno até passar num teste de FOR.' } ],
    habilidades: [
      { nome: 'Escamas Espelhadas', tipo: 'Passiva', usos: '—', efeito: 'Magias de dano de tier Comum e Raro batem nas escamas e voltam para quem lançou.' },
      { nome: 'Encontro das Águas', tipo: 'Ativa', usos: '1 por batalha', efeito: 'A correnteza vira: todos na água ou na ponte são levados 4 hex rio abaixo.' },
      { nome: 'Silêncio', tipo: 'Passiva', usos: '—', efeito: 'Não ataca quem passa pela água em silêncio. Barulho, fogo ou magia chamam Turlach.' } ],
    drops: [ { item: 'mangual_espinhos', chance: 12 }, { item: 'coroa_arcanista', chance: 12 }, { item: 'amuleto_sabio', chance: 12 }, { item: 'escama_turlach', chance: 25 }, { texto: 'Dente de Turlach (material lendário)', chance: 100 } ] },

  { id: 'guardiao_risonho', nome: 'O Guardião Risonho', tipo: 'Morto-vivo', tamanho: 'pequeno', dificuldade: 3, especial: 'Guardião', local: 'Tumbas de Tobi',
    descricao: 'Uma múmia de goblin enfaixada até as orelhas, que ri sozinha e anda por paredes cheias de alavancas.',
    historia: 'Ninguém sabe se Tobi está mesmo enterrado nas tumbas, ou se construiu o lugar só para ver quem cai nas armadilhas. O Guardião também não sabe, e acha isso muito engraçado.',
    atributos: { FOR: 2, CON: 3, DEX: 4, AGI: 4, INT: 4, FDV: 3, PER: 4 },
    defesaNatural: { df: 2, dm: 2 },
    equip: { arma: 'adaga' },
    ataques: [],
    habilidades: [
      { nome: 'Alavancas de Tobi', tipo: 'Ativa', usos: '—', efeito: 'Gasta 1 ação para puxar uma alavanca: uma armadilha dispara num hexágono a até 6 hex (lâminas, fosso ou dardos): 2d10 × nível para quem estiver lá.' },
      { nome: 'Piada Pronta', tipo: 'Reação', usos: '2 por batalha', efeito: 'Quando é atingido, troca de lugar com um boneco de palha. O ataque acerta o boneco.' },
      { nome: 'Respeito ao Mestre', tipo: 'Passiva', usos: '—', efeito: 'Não ataca quem carrega um item de Tobi, e mostra o caminho seguro a quem contar uma piada que o faça rir (teste de CAR).' } ],
    drops: [ { item: 'lanca_cavaleiro', chance: 15 }, { item: 'manto_aprendiz', chance: 15 }, { item: 'amuleto_cura', chance: 15 }, { item: 'faca_sorridente', chance: 3 }, { item: 'bolsa_sem_fundo', chance: 5 }, { texto: 'Mapa das armadilhas das tumbas', chance: 60 } ] },

  { id: 'juramentado_deus_humano', nome: 'Juramentado do Deus-Humano', tipo: 'Morto-vivo', tamanho: 'medio', dificuldade: 4, especial: 'Guardião', local: 'Ruínas do Deus-Humano',
    descricao: 'Um cavaleiro fantasma de armadura antiga, com o rosto sempre na sombra do elmo.',
    historia: 'Juraram proteger o templo do semideus dos humanos até o fim dos tempos. O templo caiu; os juramentos não.',
    atributos: { FOR: 5, CON: 4, DEX: 3, AGI: 3, INT: 2, FDV: 5, PER: 3 },
    defesaNatural: { df: 4, dm: 3 },
    ataques: [ { nome: 'Espada Juramentada', dados: 4, efeito: 'Ignora escudos.' } ],
    habilidades: [
      { nome: 'Três Perguntas', tipo: 'Passiva', usos: '—', efeito: 'Antes de lutar, faz três perguntas sobre o que é ser humano. Quem responder com honestidade (a critério do mestre) pode passar.' },
      { nome: 'Juramento Eterno', tipo: 'Passiva', usos: '1 por batalha', efeito: 'Ao cair, levanta no turno seguinte com 50% da vida, a não ser que receba uma magia sagrada enquanto está caído.' } ],
    resistencias: 'Imune a veneno, sangramento e condições de mente.',
    drops: [ { item: 'elmo_juiz', chance: 10 }, { item: 'vestes_tecidas_luz', chance: 6 }, { item: 'estandarte_sagrado', chance: 8 }, { item: 'martelo_trovao', chance: 8 }, { item: 'manoplas_tita', chance: 8 }, { item: 'escudo_runico', chance: 8 }, { item: 'coroa_chama_breve', chance: 5 }, { item: 'lamina_mil_formas', chance: 3 }, { texto: 'Placa com uma oração ao Deus-Humano', chance: 60 } ] },

  { id: 'sentinela_elfica', nome: 'Sentinela Élfica de Cristal', tipo: 'Constructo', tamanho: 'medio', dificuldade: 3, local: 'Ruína Élfica',
    descricao: 'Uma estátua de cristal azul em forma de elfo, que acorda quando alguém que não é elfo entra nas ruínas.',
    historia: 'Os elfos construíram as sentinelas quando dominavam o mundo. Elas nunca foram avisadas de que os elfos quase desapareceram.',
    atributos: { FOR: 3, CON: 3, DEX: 4, AGI: 3, INT: 3, FDV: 4, PER: 4 },
    defesaNatural: { df: 3, dm: 4 },
    ataques: [ { nome: 'Lâmina de Cristal', dados: 3, efeito: '' },
               { nome: 'Raio Prismático', dados: 3, tipo: 'magico', alcance: '8 hex', efeito: '' } ],
    habilidades: [
      { nome: 'Senha Élfica', tipo: 'Passiva', usos: '—', efeito: 'Não ataca elfos nem quem falar a senha antiga. Tharion, o último elfo conhecido, talvez a saiba.' },
      { nome: 'Prisma', tipo: 'Reação', usos: '1 por batalha', efeito: 'Divide uma magia de dano recebida: metade vai para cada herói adjacente a ela.' } ],
    fraquezas: 'Maças e martelos causam +2d10.',
    resistencias: 'Imune a veneno, sangramento e condições de mente.',
    drops: [ { item: 'manto_mana', chance: 12 }, { item: 'marreta_quebra_escudo', chance: 15 }, { item: 'sapatilhas_vento', chance: 15 }, { item: 'anel_foco_arcano', chance: 15 }, { texto: 'Cristal élfico (foco mágico bruto)', chance: 50 }, { item: 'manto_centelha', chance: 2 } ] },

  { id: 'espreitador_obscuro', nome: 'Espreitador Obscuro', tipo: 'Aberração', tamanho: 'medio', dificuldade: 3, local: 'Floresta Obscura',
    descricao: 'Uma forma escura que só se vê de relance, sempre no canto do olho.',
    atributos: { FOR: 3, CON: 3, DEX: 4, AGI: 4, INT: 2, FDV: 3, PER: 5 },
    defesaNatural: { df: 2, dm: 3 },
    ataques: [ { nome: 'Toque Sombrio', dados: 3, efeito: 'O alvo perde 1 ponto de recurso da classe.' } ],
    habilidades: [
      { nome: 'Só no Escuro', tipo: 'Passiva', usos: '—', efeito: 'Na sombra, não pode ser alvo de ataques à distância. Luz forte (magia Luz, fogo grande) o deixa visível e com −2 na chance de defesa.' },
      { nome: 'Sussurros da Floresta', tipo: 'Ativa', usos: '1 por batalha', efeito: 'Todos a até 6 hex fazem teste de FDV. Quem falhar ataca a sombra errada: o próximo ataque vai num aliado adjacente.' } ],
    drops: [ { item: 'cinto_tita', chance: 15 }, { item: 'pulseira_esquiva', chance: 15 }, { item: 'brinco_raposa', chance: 15 }, { texto: 'Essência de sombra (frasco)', chance: 40 } ] },

  { id: 'turgu', nome: 'Turgu, o Chefe do Acampamento', tipo: 'Humanoide', tamanho: 'medio', dificuldade: 3, especial: 'Chefe', local: 'Acampamento Orc de Turgu',
    descricao: 'Um orc grisalho de um olho só, que manda no acampamento do sudoeste de Atrelon.',
    historia: 'Turgu levou o clã para longe do Grande Reino para não ter que responder a Lonk-Carn. Negocia com quem paga e luta com quem não paga.',
    atributos: { FOR: 5, CON: 4, DEX: 2, AGI: 2, INT: 2, FDV: 3, PER: 3 },
    defesaNatural: { df: 1, dm: 1 },
    equip: { arma: 'machado_batalha', secundaria: 'broquel', elmo: 'elmo_ferro', peitoral: 'cota_malha' },
    ataques: [],
    habilidades: [
      { nome: 'Negociante', tipo: 'Passiva', usos: '—', efeito: 'Aceita trocar a luta por ouro, comida ou informação. Um teste de CAR bom baixa o preço.' },
      { nome: 'Chamar o Clã', tipo: 'Ativa', usos: '1 por batalha', efeito: 'Três Orcs chegam no turno seguinte.' },
      { nome: 'Sangue Quente', tipo: 'Passiva', usos: '—', efeito: 'Abaixo de 50% da vida, soma +1d10 em todos os ataques.' } ],
    drops: [ { item: 'elmo_sentinela', chance: 15 }, { item: 'coifa_runica', chance: 15 }, { item: 'escudo_espinhos', chance: 15 }, { item: 'talisma_presas_orc', chance: 20 }, { texto: 'Cofre do acampamento (6d10 moedas de prata)', chance: 100 } ] },

  { id: 'aralto_anciao', nome: 'O Aralto Ancião', tipo: 'Humanoide', tamanho: 'medio', dificuldade: 5, especial: 'Chefe', origem: 'deus_marcado', local: 'Última Fortaleza do Deus-Marcado',
    descricao: 'Um homem que deveria ter morrido há séculos, com a pele rachada de cristais e uma espada antiga na mão.',
    historia: 'Lutou ao lado do Deus Marcado na Batalha Colossal, 500 anos atrás. Sobreviveu escondido na última fortaleza, e é um dos Araltos que voltaram a se mover. Dizem que ele sabe onde estão todos os fragmentos que faltam.',
    atributos: { FOR: 6, CON: 6, DEX: 4, AGI: 4, INT: 5, FDV: 6, PER: 4 },
    defesaNatural: { df: 3, dm: 3 },
    equip: { arma: 'lamina_batalha_colossal', elmo: 'elmo_sentinela', peitoral: 'couraca_baluarte' },
    ataques: [ { nome: 'Toque dos 500 Anos', dados: 3, tipo: 'magico', efeito: 'Coloca 2 Marcas Carmesins.' } ],
    magias: [ 'toque_vampirico', 'reflexo_arcano', 'lanca_relampago', 'aceleracao' ],
    habilidades: [
      { nome: 'Veterano da Batalha Colossal', tipo: 'Passiva', usos: '—', efeito: 'Conhece as táticas dos heróis: ataques de guerreiros, arqueiros, magos, ladinos e clérigos contra ele têm −1 na faixa de crítico.' },
      { nome: 'Pacto Antigo', tipo: 'Passiva', usos: '—', efeito: 'Recupera 20% de todo dano que causar.' },
      { nome: 'Chamado da Fortaleza', tipo: 'Ativa', usos: '1 por batalha', efeito: 'Dois Cavaleiros Carmesins saem das ruínas.' },
      { nome: 'Não Hoje', tipo: 'Passiva', usos: '1 por batalha', efeito: 'Abaixo de 20% da vida, some numa nuvem vermelha e foge para lutar outro dia, a não ser que alguém tenha colocado nele uma magia que prenda.' } ],
    resistencias: 'Imune a condições de mente e a Marcas Carmesins.',
    drops: [ { item: 'punhal_gemeo', chance: 12 }, { item: 'tomo_arcanista', chance: 12 }, { item: 'luvas_ladrao', chance: 12 }, { item: 'lamina_batalha_colossal', chance: 100 }, { texto: 'Mapa dos fragmentos do Deus Marcado', chance: 100 } ] },

  // ===== Monstros de missões =====
  { id: 'rei_dos_ratos', nome: 'O Rei dos Ratos', tipo: 'Fera', tamanho: 'medio', dificuldade: 3, especial: 'Raro', local: 'Esgotos de Verdom', descricao: 'Dezenas de ratos com os rabos presos num nó, andando juntos como uma criatura só. No meio, uma coroa de lata.', historia: 'Nos esgotos de Verdom se conta que, quando os rabos dos ratos se prendem, eles passam a pensar juntos. Grakk jura que o Rei é súdito dele. O Rei acha o contrário.', atributos: { FOR: 2, CON: 4, DEX: 3, AGI: 3, INT: 3, FDV: 2, PER: 4 }, defesaNatural: { df: 2, dm: 1 }, ataques: [ { nome: 'Mil Mordidas', dados: 2, tipo: 'fisico', alcance: 'Todos os adjacentes', efeito: 'Doença: −2 em testes de CON até descansar.' } ], habilidades: [ { nome: 'Mente Coletiva', tipo: 'Passiva', usos: '—', efeito: 'Não pode ser surpreendido nem ficar oculto dele.' }, { nome: 'Desfazer o Nó', tipo: 'Reação', usos: '1 por batalha', efeito: 'Abaixo de 30% da vida, se espalha em 4 Ratos Gigantes que fogem em direções diferentes.' } ], drops: [ { item: 'coroa_rei_ratos', chance: 30 }, { texto: 'Coroa de lata dos ratos', chance: 100 } ] },
  { id: 'rainha_aranhas', nome: 'A Rainha das Aranhas', tipo: 'Fera', tamanho: 'grande', dificuldade: 4, especial: 'Chefe', local: 'Florestas de Vernand', descricao: 'Uma aranha do tamanho de uma casa, com o corpo coberto de ovos brilhantes.', historia: 'Veio das terras que Vernand perdeu para Verdom, onde ninguém mais patrulha. Os lenhadores que desapareceram estão nos casulos do ninho, alguns ainda vivos.', atributos: { FOR: 5, CON: 5, DEX: 3, AGI: 3, INT: 2, FDV: 3, PER: 4 }, defesaNatural: { df: 3, dm: 2 }, ataques: [ { nome: 'Picada Real', dados: 4, tipo: 'fisico', alcance: 'Adjacente', efeito: 'Veneno: 2d10 × nível por 2 turnos, ignorando a defesa.' }, { nome: 'Jato de Teia', dados: 2, tipo: 'fisico', alcance: '6 hex, raio 1', efeito: 'Prende quem falhar num teste de DEX.' } ], habilidades: [ { nome: 'Ninhada', tipo: 'Ativa', usos: '2 por batalha', efeito: 'Os ovos se abrem: 2 Aranhas Gigantes nascem ao lado dela.' }, { nome: 'Teto do Ninho', tipo: 'Passiva', usos: '—', efeito: 'Anda pelo teto do ninho. Ataques corpo a corpo só a alcançam quando ela desce para morder.' } ], fraquezas: 'Fogo causa +2d10 e queima as teias.', drops: [ { item: 'manto_seda_rainha', chance: 40 }, { texto: 'Seda real de aranha', chance: 100 } ] },
  { id: 'cacador_fragmentos', nome: 'Caçador de Fragmentos', tipo: 'Humanoide', tamanho: 'medio', dificuldade: 3, especial: 'Raro', origem: 'deus_marcado', local: 'Lago Corrompido', descricao: 'Um Aralto magro de capa cinza, com uma bolsa de couro cheia de cristais vermelhos.', historia: 'Os Araltos mandam caçadores recolher os fragmentos que sumiram dos bolsões. Este não luta se puder fugir: o que ele carrega vale mais que a vida dele.', atributos: { FOR: 3, CON: 3, DEX: 4, AGI: 4, INT: 3, FDV: 3, PER: 4 }, defesaNatural: { df: 1, dm: 2 }, equip: { arma: 'besta_mao', peitoral: 'gibao_corvo', botas: 'botas_andarilho' }, ataques: [  ], magias: [ 'passo_nebuloso', 'invisibilidade' ], habilidades: [ { nome: 'Fuga Planejada', tipo: 'Reação', usos: '1 por batalha', efeito: 'No primeiro turno em que ficar abaixo de 50% da vida, fica invisível e foge. Se fugir, os fragmentos vão com ele.' }, { nome: 'Cristal Instável', tipo: 'Ativa', usos: '2 por batalha', efeito: 'Joga um cristal que explode em raio 1: 3d10 × nível e 1 Marca Carmesim.' } ], drops: [ { item: 'bussola_carmesim', chance: 40 }, { texto: 'Bolsa com 1d10 fragmentos de cristal carmesim', chance: 100 } ] },
  { id: 'guardiao_espelhos', nome: 'O Guardião dos Espelhos', tipo: 'Constructo', tamanho: 'grande', dificuldade: 4, especial: 'Guardião', local: 'Ruína Élfica', descricao: 'Um gigante de vidro prateado. Você se vê refletido nele, só que mais velho.', historia: 'Os elfos guardavam no Salão dos Espelhos o que não queriam esquecer. O Guardião só deixa passar quem olhar para o próprio reflexo e disser uma verdade.', atributos: { FOR: 4, CON: 5, DEX: 3, AGI: 2, INT: 4, FDV: 5, PER: 4 }, defesaNatural: { df: 6, dm: 6 }, ataques: [ { nome: 'Punho Espelhado', dados: 3, tipo: 'fisico', alcance: 'Adjacente', efeito: '' }, { nome: 'Raio Refletido', dados: 3, tipo: 'magico', alcance: '8 hex', efeito: '' } ], habilidades: [ { nome: 'Superfície Perfeita', tipo: 'Passiva', usos: '—', efeito: 'Toda magia de dano contra ele volta para quem lançou. Só luz refletida pelos espelhos do salão o fere com magia.' }, { nome: 'Reflexo Vivo', tipo: 'Ativa', usos: '1 por batalha', efeito: 'Cria uma cópia de um herói, com a mesma ficha, que luta contra o grupo por 3 turnos.' } ], fraquezas: 'Martelos e maças causam +2d10. Um crítico racha o vidro: ele perde 20% da vida na hora.', drops: [ { item: 'vestes_balanca', chance: 12 }, { item: 'espelho_guardiao', chance: 35 }, { texto: 'Caco de espelho élfico', chance: 100 } ] },
  { id: 'senhor_afogados', nome: 'O Senhor dos Afogados', tipo: 'Morto-vivo', tamanho: 'grande', dificuldade: 4, especial: 'Chefe', local: 'Pântanos de Vermilion', descricao: 'Um gigante inchado de pele azulada, coberto de algas, com uma coroa de conchas e um tridente enferrujado.', historia: 'Era o capitão do navio que o Farol da Perdição afundou primeiro. Juntou os afogados do pântano num reino debaixo da lama, e manda os sinos submersos tocarem quando quer mais súditos.', atributos: { FOR: 5, CON: 5, DEX: 2, AGI: 2, INT: 3, FDV: 4, PER: 3 }, defesaNatural: { df: 3, dm: 3 }, ataques: [ { nome: 'Tridente', dados: 4, tipo: 'fisico', alcance: '2 hex', efeito: 'Puxa o alvo 2 hex para a água.' }, { nome: 'Onda Podre', dados: 3, tipo: 'magico', alcance: 'Cone de 4 hex', efeito: 'Quem falhar num teste de CON perde a próxima ação.' } ], magias: [ 'cancao_afogados' ], habilidades: [ { nome: 'Chamar os Afogados', tipo: 'Ativa', usos: '2 por batalha', efeito: 'Três Zumbis sobem da lama.' }, { nome: 'Reino de Lama', tipo: 'Passiva', usos: '—', efeito: 'Na água ou na lama, recupera 5% da vida por turno.' } ], fraquezas: 'Fogo e sal causam +2d10. Tirá-lo da água (derrubar ou empurrar para terra firme) corta a regeneração.', resistencias: 'Imune a afogamento, veneno e frio.', drops: [ { item: 'tridente_afogados', chance: 40 }, { texto: 'Coroa de conchas do Senhor dos Afogados', chance: 100 } ] },
  { id: 'sombra_aldren', nome: 'A Sombra de Aldren', tipo: 'Morto-vivo', tamanho: 'medio', dificuldade: 4, especial: 'Chefe', local: 'Ruínas Grúticas', descricao: 'O fantasma de um velho de barba branca, com os olhos brilhando como estrelas e um diário preso ao peito.', historia: 'Aldren, o astrônomo louco, contou as estrelas por quarenta anos. Quando uma sumiu, ele descobriu que podia chamá-la. Morreu tentando, e continua fazendo as contas.', atributos: { FOR: 1, CON: 3, DEX: 3, AGI: 3, INT: 7, FDV: 5, PER: 6 }, defesaNatural: { df: 5, dm: 3 }, ataques: [ { nome: 'Toque Estelar', dados: 4, tipo: 'magico', alcance: 'Adjacente', efeito: '' } ], magias: [ 'dardo_mistico', 'lanca_relampago', 'aceleracao' ], habilidades: [ { nome: 'Chuva de Estrelas', tipo: 'Ativa', usos: '1 por batalha', efeito: 'Estrelas pequenas caem em 5 hexágonos escolhidos: 3d10 × nível em cada um.' }, { nome: 'A Conta Certa', tipo: 'Passiva', usos: '—', efeito: 'Se alguém disser o número de estrelas certo (a resposta do enigma da missão), a Sombra para de lutar e entrega o diário.' }, { nome: 'Incorpóreo', tipo: 'Passiva', usos: '—', efeito: 'Armas comuns causam metade do dano.' } ], drops: [ { item: 'diario_aldren', chance: 60 }, { item: 'luneta_aldren', chance: 25 } ] },
  { id: 'fera_eclipse', nome: 'A Fera do Eclipse', tipo: 'Aberração', tamanho: 'grande', dificuldade: 5, especial: 'Chefe', origem: 'desconhecida', local: 'Torre de Observação Estelar', descricao: 'Uma forma de lobo sem pelo e sem olhos, feita da escuridão entre as estrelas. Só existe durante o eclipse.', historia: 'O Astromante sabe que ela vem a cada eclipse e tenta apagar a torre. Ninguém sabe o que acontece se ela conseguir.', atributos: { FOR: 6, CON: 6, DEX: 4, AGI: 4, INT: 3, FDV: 6, PER: 5 }, defesaNatural: { df: 4, dm: 5 }, ataques: [ { nome: 'Mordida do Vazio', dados: 5, tipo: 'fisico', alcance: 'Adjacente', efeito: 'O alvo perde 1 ponto de recurso da classe.' }, { nome: 'Uivo Negro', dados: 3, tipo: 'magico', alcance: 'Raio 3', efeito: 'Apaga luzes e magias de Luz na área.' } ], habilidades: [ { nome: 'Enquanto Durar a Sombra', tipo: 'Passiva', usos: '—', efeito: 'O eclipse dura 6 turnos. Se a Fera não for derrotada até lá, ela some e volta no próximo eclipse com a vida cheia.' }, { nome: 'Medo do Escuro', tipo: 'Passiva', usos: '—', efeito: 'Luz forte a enfraquece: dentro de uma área iluminada por magia, ela recebe +2d10 de dano.' }, { nome: 'Devorar Estrelas', tipo: 'Ativa', usos: '2 por batalha', efeito: 'Tenta apagar o espelho do topo da torre. Se conseguir 3 vezes, a torre escurece para sempre.' } ], resistencias: 'Imune a condições de mente e a veneno.', drops: [ { item: 'lamina_eclipse', chance: 40 }, { texto: 'Fragmento de noite (material lendário)', chance: 100 } ] },
  { id: 'golem_ampulheta', nome: 'O Golem da Ampulheta', tipo: 'Constructo', tamanho: 'grande', dificuldade: 4, especial: 'Chefe', local: 'Ruínas da Antiga Cidade', descricao: 'Um gigante de vidro e bronze com uma ampulheta enorme no lugar do peito. A areia corre para cima.', historia: 'O rei da cidade antiga mandou construí-lo para guardar a Ampulheta Partida. Enquanto a areia dele correr, o tempo na sala não passa direito.', atributos: { FOR: 5, CON: 5, DEX: 2, AGI: 3, INT: 3, FDV: 5, PER: 3 }, defesaNatural: { df: 5, dm: 4 }, ataques: [ { nome: 'Punho de Bronze', dados: 4, tipo: 'fisico', alcance: 'Adjacente', efeito: '' }, { nome: 'Areia do Tempo', dados: 3, tipo: 'magico', alcance: 'Cone de 3 hex', efeito: 'Os alvos envelhecem um pouco: −1 ação de ataque no próximo turno.' } ], habilidades: [ { nome: 'Voltar a Areia', tipo: 'Ativa', usos: '2 por batalha', efeito: 'Desfaz o último turno do golem: ele volta à vida que tinha no começo do turno anterior.' }, { nome: 'Ampulheta no Peito', tipo: 'Passiva', usos: '—', efeito: 'Quem virar a ampulheta dele (teste de FOR adjacente, gastando 2 ações) cancela o Voltar a Areia pelo resto da batalha.' } ], resistencias: 'Imune a veneno, sangramento e condições de mente.', drops: [ { item: 'ampulheta_partida', chance: 25 }, { texto: 'Areia que corre para cima (frasco)', chance: 100 } ] },

  // ===== Monstros com fases de vida =====
  { id: 'ogro_berserker', nome: 'Ogro Berserker', tipo: 'Gigante', tamanho: 'grande', dificuldade: 2, local: 'Florestas de Vernand', descricao: 'Um ogro enorme com um tronco de árvore como porrete, que fica mais perigoso quanto mais apanha.', atributos: { FOR: 4, CON: 4, DEX: 1, AGI: 1, INT: 1, FDV: 1, PER: 2 }, defesaNatural: { df: 2, dm: 0 }, ataques: [ { nome: 'Porrete de Tronco', dados: 3, tipo: 'fisico', alcance: 'Adjacente', efeito: 'Derruba o alvo se ele falhar num teste de FOR.' } ], habilidades: [  ], fases: [ { abaixoDe: 50, nome: 'Fúria', efeito: 'O ogro urra e bate em tudo: +1 ação de ataque e +1d10 em todos os ataques.', mod: { ataques: 1, dados: 1 } }, { abaixoDe: 25, nome: 'Desespero', efeito: 'Arranca pedras do chão e arremessa a até 6 hex. Ignora a própria defesa: recebe +25% de dano.', mod: { dados: 1, df: 0.75, dm: 0.75 } } ], drops: [ { item: 'botas_salto', chance: 10 }, { texto: 'Dente de ogro', chance: 60 } ] },
  { id: 'bufao_de_tobi', nome: 'O Bufão de Tobi', tipo: 'Humanoide', tamanho: 'pequeno', dificuldade: 3, especial: 'Raro', local: 'Tumbas de Tobi', descricao: 'Um goblin de roupa de bobo da corte, com guizos, que ri de tudo e troca de lugar com qualquer coisa.', historia: 'Ninguém sabe se ele é um fiel de Tobi, um filho de Tobi ou o próprio Tobi disfarçado. Ele diz as três coisas no mesmo dia.', atributos: { FOR: 2, CON: 3, DEX: 5, AGI: 4, INT: 3, FDV: 3, PER: 4 }, defesaNatural: { df: 3, dm: 3 }, equip: { arma: 'punhal_gemeo' }, ataques: [  ], magias: [ 'troca_lugar', 'chao_gelo' ], habilidades: [ { nome: 'Piada Pronta', tipo: 'Reação', usos: '2 por batalha', efeito: 'Troca de lugar com um boneco de palha e o ataque acerta o boneco.' } ], fases: [ { abaixoDe: 75, nome: 'Troca-troca', efeito: 'Uma vez por turno, troca de lugar com qualquer criatura a até 6 hex, amiga ou inimiga.' }, { abaixoDe: 50, nome: 'Chuva de Guizos', efeito: 'Cada guizo que cai explode: 1d10 × nível em todos os adjacentes a ele no fim do turno.', mod: { dados: 1 } }, { abaixoDe: 25, nome: 'A Última Piada', efeito: 'Conta uma piada. Quem não rir (teste de FDV para segurar) fica atordoado de raiva. Quem rir fica atordoado de rir. Todo mundo perde a próxima ação, menos ele.', mod: { ataques: 1 } } ], drops: [ { item: 'punhal_gemeo', chance: 20 }, { item: 'luvas_alquimista', chance: 15 }, { texto: 'Chapéu de guizos (irritante)', chance: 100 } ] },
  { id: 'golem_magma', nome: 'Golem de Magma', tipo: 'Constructo', tamanho: 'grande', dificuldade: 3, local: 'Cidade de Karlach', descricao: 'Um gigante de rocha preta com rachaduras de onde escorre lava.', historia: 'Os ferreiros da Cidade de Karlach usam golens de magma como fornalhas vivas. Quando um se solta, a cidade inteira sabe.', atributos: { FOR: 5, CON: 5, DEX: 1, AGI: 2, INT: 1, FDV: 3, PER: 2 }, defesaNatural: { df: 5, dm: 3 }, ataques: [ { nome: 'Punho de Rocha', dados: 3, tipo: 'fisico', alcance: 'Adjacente', efeito: '' } ], habilidades: [  ], fases: [ { abaixoDe: 75, nome: 'A casca racha', efeito: 'A rocha de fora se parte: a defesa física cai, mas os socos passam a queimar (+1d10 de fogo).', mod: { dados: 1, df: 0.7 } }, { abaixoDe: 50, nome: 'Lava vaza', efeito: 'Todo hexágono por onde ele passa queima por 2 turnos: 1d10 × nível para quem começar o turno nele.' }, { abaixoDe: 25, nome: 'Núcleo exposto', efeito: 'O núcleo aparece: as defesas caem quase a nada, mas quando ele cair, explode e causa 4d10 × nível em todos a até 2 hex.', mod: { df: 0.3, dm: 0.5 } } ], resistencias: 'Imune a fogo.', fraquezas: 'Água e gelo causam +2d10 e esfriam uma fase (a casca volta por 1 turno).', drops: [ { item: 'couraca_escamas', chance: 15 }, { texto: 'Núcleo de magma resfriado', chance: 70 } ] },
  { id: 'cavaleiro_sem_cabeca', nome: 'O Cavaleiro Sem Cabeça', tipo: 'Morto-vivo', tamanho: 'grande', dificuldade: 3, especial: 'Perigo local', local: 'Caminho da Morte', descricao: 'Um cavaleiro de armadura negra montado num cavalo esquelético, com a própria cabeça presa na sela, acesa como lanterna.', historia: 'Guardava a trilha estreita das montanhas até alguém cortar a cabeça dele. Continua guardando.', atributos: { FOR: 4, CON: 4, DEX: 3, AGI: 3, INT: 2, FDV: 4, PER: 4 }, defesaNatural: { df: 3, dm: 2 }, equip: { arma: 'lanca_cavaleiro', peitoral: 'couraca_ferro' }, ataques: [  ], habilidades: [ { nome: 'Galope', tipo: 'Passiva', usos: '—', efeito: 'Enquanto montado, move 8 hex e o primeiro ataque do turno causa +1d10.' } ], fases: [ { abaixoDe: 50, nome: 'Sem Cavalo', efeito: 'O cavalo esquelético cai: o movimento cai pela metade, mas ele desce e luta com duas armas (+1 ação de ataque).', mod: { ataques: 1 } }, { abaixoDe: 25, nome: 'A Cabeça em Chamas', efeito: 'Arremessa a própria cabeça acesa: explosão de fogo azul em raio 1 a até 6 hex, 3d10 × nível. Depois disso, ele não enxerga: −2 na chance de defesa.', mod: { dados: 2 } } ], resistencias: 'Imune a medo, veneno e sangramento.', drops: [ { item: 'mascara_coragem', chance: 15 }, { item: 'espada_sedenta', chance: 15 } ] },
  { id: 'treant_anciao', nome: 'O Treant Ancião', tipo: 'Planta', tamanho: 'colossal', dificuldade: 4, especial: 'Guardião', local: 'Floresta Obscura', descricao: 'Uma árvore gigantesca com rosto no tronco, coberta de musgo escuro, que acorda quando alguém corta a floresta.', historia: 'Viu os elfos passarem, os humanos chegarem e a Batalha Colossal escurecer o céu. Não gosta de nenhum deles.', atributos: { FOR: 6, CON: 7, DEX: 1, AGI: 2, INT: 3, FDV: 5, PER: 4 }, defesaNatural: { df: 5, dm: 2 }, ataques: [ { nome: 'Galho Esmagador', dados: 4, tipo: 'fisico', alcance: '3 hex', efeito: '' } ], habilidades: [  ], fases: [ { abaixoDe: 75, nome: 'Raízes', efeito: 'As raízes saem do chão: todos a até 4 hex fazem teste de DEX ou ficam presos.' }, { abaixoDe: 50, nome: 'Folhas Caem', efeito: 'Perde as folhas: a defesa mágica despenca, mas ele fica mais rápido e mais bravo.', mod: { ataques: 1, dados: 1, dm: 0.5 } }, { abaixoDe: 25, nome: 'Semente', efeito: 'Deixa cair uma semente brilhante. Se ele cair e a semente não for destruída em 3 turnos, um novo treant brota com 50% da vida.' } ], fraquezas: 'Fogo causa o dobro. Machados causam +1d10.', drops: [ { item: 'cajado_volterion', chance: 15 }, { texto: 'Madeira anciã (material lendário)', chance: 100 } ] },
  { id: 'colosso_ossos', nome: 'O Colosso de Ossos', tipo: 'Morto-vivo', tamanho: 'colossal', dificuldade: 4, especial: 'Chefe', local: 'Última Fortaleza do Deus-Marcado', descricao: 'Milhares de ossos dos que morreram na última fortaleza, juntos numa forma gigante com um crânio de dragão no alto.', historia: 'Os Araltos que ficaram na fortaleza juntaram os mortos da Batalha Colossal para guardar a entrada.', atributos: { FOR: 6, CON: 6, DEX: 2, AGI: 2, INT: 2, FDV: 4, PER: 3 }, defesaNatural: { df: 4, dm: 3 }, ataques: [ { nome: 'Braço de Ossos', dados: 4, tipo: 'fisico', alcance: '2 hex', efeito: '' }, { nome: 'Mordida do Crânio', dados: 3, tipo: 'fisico', alcance: 'Adjacente', efeito: '' } ], habilidades: [  ], fases: [ { abaixoDe: 75, nome: 'Costelas Soltas', efeito: 'As costelas caem e viram 3 Esqueletos, que lutam ao lado dele.' }, { abaixoDe: 50, nome: 'O Crânio Gira', efeito: 'O crânio de dragão gira e sopra ossos em cone de 5 hex: 3d10 × nível. Ganha +1 ação de ataque.', mod: { ataques: 1 } }, { abaixoDe: 25, nome: 'Colapso', efeito: 'Começa a desmoronar: cada turno, todos adjacentes sofrem 2d10 × nível de ossos caindo, mas ele também perde 5% da vida por turno.', mod: { dados: 1 } } ], resistencias: 'Imune a veneno, sangramento, medo e condições de mente.', fraquezas: 'Maças, martelos e magias sagradas causam +2d10.', drops: [ { item: 'vestes_balanca', chance: 8 }, { item: 'martelo_gigantes', chance: 15 }, { item: 'couraca_martir', chance: 10 }, { texto: 'Crânio de dragão antigo', chance: 100 } ] },
  { id: 'elemental_tempestade', nome: 'O Elemental da Tempestade', tipo: 'Elemental', tamanho: 'colossal', dificuldade: 4, especial: 'Chefe', origem: 'desconhecida', local: 'Encontro de Turlach', descricao: 'Uma nuvem negra com braços de chuva e olhos de relâmpago, que desce da montanha para o mar.', atributos: { FOR: 4, CON: 5, DEX: 4, AGI: 4, INT: 6, FDV: 5, PER: 4 }, defesaNatural: { df: 6, dm: 3 }, ataques: [ { nome: 'Relâmpago', dados: 4, tipo: 'magico', alcance: '8 hex', efeito: '' } ], habilidades: [  ], fases: [ { abaixoDe: 75, nome: 'Chuva Forte', efeito: 'Chove em todo o campo: ataques à distância têm −2 na chance de acerto e fogo apaga.' }, { abaixoDe: 50, nome: 'Raios Duplos', efeito: 'Cada relâmpago salta para mais um alvo a até 3 hex.', mod: { ataques: 1 } }, { abaixoDe: 25, nome: 'O Olho da Tempestade', efeito: 'A tempestade para de repente. Por 2 turnos ele não ataca e suas defesas somem; depois, explode em 6d10 × nível em todo o campo, a não ser que seja derrubado antes.', mod: { df: 0.1, dm: 0.1 } } ], resistencias: 'Imune a raio, veneno e agarrão.', drops: [ { item: 'cajado_tempestade', chance: 25 }, { texto: 'Frasco de tempestade engarrafada', chance: 100 } ] },
  { id: 'vorthax', nome: 'Vorthax, o Dragão Carmesim', tipo: 'Dragão', tamanho: 'colossal', dificuldade: 5, especial: 'Chefe', origem: 'deus_marcado', local: 'Deserto de Karlach', descricao: 'Um dragão vermelho-escuro cujas escamas viraram cristal carmesim. Os olhos brilham com o mesmo ódio do Deus Marcado.', historia: 'Vorthax comeu cristais carmesins por um século, disputando os fragmentos com a Salamandra Karlach. O ódio do Deus Marcado entrou nele: odeia elfos, e odeia quem protege elfos.', atributos: { FOR: 8, CON: 8, DEX: 4, AGI: 4, INT: 5, FDV: 6, PER: 5 }, defesaNatural: { df: 6, dm: 5 }, ataques: [ { nome: 'Mordida', dados: 5, tipo: 'fisico', alcance: 'Adjacente', efeito: '' }, { nome: 'Garras', dados: 4, tipo: 'fisico', alcance: 'Adjacente', efeito: '' }, { nome: 'Sopro Carmesim', dados: 5, tipo: 'magico', alcance: 'Cone de 8 hex', efeito: 'Cada alvo atingido ganha 1 Marca Carmesim.' } ], habilidades: [ { nome: 'Ódio Antigo', tipo: 'Passiva', usos: '—', efeito: 'Contra elfos e quem carrega itens élficos, soma +2d10.' } ], fases: [ { abaixoDe: 100, nome: 'No Céu', efeito: 'Começa voando: só ataques à distância e magias o alcançam. Mergulha para morder e volta a subir.' }, { abaixoDe: 66, nome: 'Asa Quebrada', efeito: 'Cai no chão: agora pode ser atacado corpo a corpo, mas bate a cauda em cone de 4 hex a cada turno (+1 ação).', mod: { ataques: 1 } }, { abaixoDe: 33, nome: 'Cristalizado', efeito: 'Os cristais tomam conta do corpo: a defesa física dobra, a mágica cai pela metade, e cada ataque dele coloca 1 Marca Carmesim.', mod: { dados: 2, df: 2, dm: 0.5 } } ], resistencias: 'Imune a fogo e a Marcas Carmesins.', drops: [ { item: 'coroa_tirano', chance: 15 }, { item: 'pedra_do_limiar', chance: 20 }, { item: 'lamina_ultimo_folego', chance: 20 }, { texto: 'Escamas de cristal carmesim (material lendário)', chance: 100 } ] },

  // ===== Ruínas de Valgor =====
  { id: 'soldado_valgor', nome: 'Soldado de Valgor', tipo: 'Morto-vivo', tamanho: 'medio', dificuldade: 3, local: 'Ruínas do Deus-Humano', descricao: 'Um guerreiro humano de armadura antiga, com a chama de Valgor ainda acesa dentro do elmo.', historia: 'Juraram servir Valgor para sempre. Quando o semideus se despedaçou, continuaram de pé, esperando uma ordem que nunca veio.', atributos: { FOR: 4, CON: 3, DEX: 3, AGI: 2, INT: 1, FDV: 3, PER: 2 }, defesaNatural: { df: 2, dm: 2 }, equip: { arma: 'espada_longa', secundaria: 'broquel', peitoral: 'cota_malha' }, ataques: [  ], habilidades: [ { nome: 'Formação', tipo: 'Passiva', usos: '—', efeito: 'Com outro soldado adjacente, os dois somam +1 na chance de defesa.' } ], drops: [ { item: 'escudo_guarda_valgor', chance: 6 }, { item: 'elmo_salas_ancestrais', chance: 5 }, { texto: 'Insígnia da chama coroada', chance: 60 } ] },
  { id: 'espinheiro_vivo', nome: 'Espinheiro Vivo', tipo: 'Planta', tamanho: 'grande', dificuldade: 3, local: 'Ruínas do Deus-Humano', descricao: 'Uma moita de espinhos negros do tamanho de uma carroça, que se arrasta pelo Jardim Destruído.', atributos: { FOR: 3, CON: 4, DEX: 2, AGI: 2, INT: 1, FDV: 2, PER: 3 }, defesaNatural: { df: 3, dm: 1 }, ataques: [ { nome: 'Chicote de Espinhos', dados: 2, tipo: 'fisico', alcance: '3 hex', efeito: 'Sangramento: 1d10 × nível no próximo turno.' } ], habilidades: [ { nome: 'Enraizar', tipo: 'Ativa', usos: '2 por batalha', efeito: 'Raízes prendem todos a até 2 hex que falharem num teste de DEX.' } ], fases: [ { abaixoDe: 50, nome: 'Florada', efeito: 'Abre flores vermelhas que soltam pólen: todos a até 2 hex fazem teste de CON ou perdem a próxima ação.' } ], fraquezas: 'Fogo causa o dobro.', drops: [ { item: 'botas_raiz_jardim', chance: 10 }, { texto: 'Semente de espinheiro', chance: 50 } ] },
  { id: 'guardiao_silencio', nome: 'O Guardião do Silêncio', tipo: 'Constructo', tamanho: 'grande', dificuldade: 4, especial: 'Guardião', local: 'Ruínas do Deus-Humano', descricao: 'Uma estátua sem boca, com as mãos sobre os ouvidos. Acorda com qualquer som.', historia: 'Na Câmara do Silêncio, os sacerdotes de Valgor meditavam sem dizer nada por anos. A estátua ainda guarda o silêncio deles.', atributos: { FOR: 5, CON: 5, DEX: 2, AGI: 2, INT: 2, FDV: 5, PER: 5 }, defesaNatural: { df: 5, dm: 5 }, ataques: [ { nome: 'Punho Mudo', dados: 4, tipo: 'fisico', alcance: 'Adjacente', efeito: 'O alvo fica mudo: não lança magias no próximo turno.' } ], habilidades: [ { nome: 'Ouvido Absoluto', tipo: 'Passiva', usos: '—', efeito: 'Só ataca quem fez barulho no turno anterior (falou, lançou magia com voz, correu de armadura, errou teste de Furtividade). Quem ficar em silêncio fica invisível para ele.' } ], fases: [ { abaixoDe: 50, nome: 'Grito de Pedra', efeito: 'A boca se abre pela primeira vez: todos na câmara sofrem 3d10 × nível e ficam surdos por 1 turno (ele passa a enxergar todo mundo).', mod: { ataques: 1 } } ], resistencias: 'Imune a condições de mente.', drops: [ { item: 'lamina_silencio', chance: 12 }, { texto: 'Pedra muda (absorve som)', chance: 60 } ] },
  { id: 'arquimago_esquecido', nome: 'O Arquimago Esquecido', tipo: 'Humanoide', tamanho: 'medio', dificuldade: 4, especial: 'Elite', local: 'Ruínas do Deus-Humano', descricao: 'Um velho de manto azul coberto de estrelas bordadas que se movem. Não lembra do próprio nome.', historia: 'Era o conselheiro de Valgor. Prendeu-se na Torre Esquecida para não ver o fim do mestre, e o tempo o esqueceu lá dentro.', atributos: { FOR: 1, CON: 3, DEX: 3, AGI: 3, INT: 6, FDV: 5, PER: 4 }, defesaNatural: { df: 2, dm: 5 }, equip: { arma: 'cajado_tempestade' }, ataques: [  ], magias: [ 'lanca_relampago', 'reflexo_arcano', 'passo_nebuloso', 'silencio', 'bola_fogo_retardada' ], habilidades: [ { nome: 'Memória Falha', tipo: 'Passiva', usos: '—', efeito: 'No início de cada turno, role 1d10: com 1 ou 2, ele esquece quem são os inimigos e não ataca.' } ], fases: [ { abaixoDe: 50, nome: 'Lembrança', efeito: 'Lembra de Valgor e chora: lança duas magias por ataque mágico até o fim da batalha.', mod: { ataques: 1 } } ], drops: [ { item: 'manto_torre_esquecida', chance: 15 }, { item: 'tomo_arcanista', chance: 15 } ] },
  { id: 'ferreiro_valgor', nome: 'O Ferreiro de Valgor', tipo: 'Constructo', tamanho: 'grande', dificuldade: 4, especial: 'Chefe', local: 'Ruínas do Deus-Humano', descricao: 'Um gigante de ferro e brasa, com um martelo no lugar de uma das mãos e uma bigorna presa às costas.', historia: 'Forjou as armas dos campeões de Valgor. Continua martelando na Forja Abandonada, fazendo armas para um exército que não existe mais.', atributos: { FOR: 6, CON: 5, DEX: 2, AGI: 2, INT: 2, FDV: 4, PER: 3 }, defesaNatural: { df: 5, dm: 3 }, ataques: [ { nome: 'Martelo em Brasa', dados: 4, tipo: 'fisico', alcance: 'Adjacente', efeito: 'Queima: 1d10 × nível no próximo turno.' }, { nome: 'Chuva de Fagulhas', dados: 2, tipo: 'magico', alcance: 'Cone de 4 hex', efeito: '' } ], habilidades: [  ], fases: [ { abaixoDe: 75, nome: 'Forjar Aliados', efeito: 'Tira 2 Soldados de Valgor de dentro da forja.' }, { abaixoDe: 50, nome: 'Metal Rubro', efeito: 'A armadura dele fica em brasa: quem o atacar corpo a corpo sofre 1d10 × nível de fogo.', mod: { dados: 1 } }, { abaixoDe: 25, nome: 'Última Têmpera', efeito: 'Mergulha na lava da forja: recupera 15% da vida uma vez, mas a defesa física cai à metade.', mod: { ataques: 1, df: 0.5 } } ], resistencias: 'Imune a fogo.', fraquezas: 'Água e gelo causam +2d10.', drops: [ { item: 'martelo_forja_valgor', chance: 40 }, { item: 'grevas_ferro_negro', chance: 15 }, { texto: 'Chave rubra do trono', chance: 100 } ] },
  { id: 'rei_despedacado', nome: 'O Rei Despedaçado', tipo: 'Semideus caído', tamanho: 'colossal', dificuldade: 5, especial: 'Chefe', local: 'Ruínas do Deus-Humano', descricao: 'Uma figura gigante feita de pedaços de armadura, pedra e luz vermelha, sentada num trono partido. Cada pedaço parece de uma época diferente.', historia: 'O que sobrou de Valgor, o semideus dos humanos. Despedaçado na guerra contra o Deus Marcado, ele se remontou com o que encontrou, e cada pedaço trouxe uma lembrança diferente. Diz que só um será lembrado.', atributos: { FOR: 7, CON: 7, DEX: 4, AGI: 3, INT: 5, FDV: 6, PER: 5 }, defesaNatural: { df: 5, dm: 5 }, ataques: [ { nome: 'Espada das Mil Formas', dados: 5, tipo: 'fisico', alcance: 'Adjacente', efeito: 'Muda de forma a cada turno: o mestre escolhe se ignora escudos, se tem alcance 3 ou se ataca em cone.' }, { nome: 'Chama Breve', dados: 4, tipo: 'magico', alcance: '8 hex, raio 1', efeito: '' } ], magias: [ 'aura_heroica', 'invulnerabilidade' ], habilidades: [ { nome: 'Cada Caminho uma Escolha', tipo: 'Passiva', usos: '—', efeito: 'No início da batalha, pergunta a cada herói o que ele faria se fosse um deus. Quem responder com sinceridade (a critério do mestre) recebe +1 em todos os testes até o fim da batalha.' } ], fases: [ { abaixoDe: 75, nome: 'A Forma da Espada', efeito: 'Os pedaços se juntam numa armadura: +1 ação de ataque, e a Espada das Mil Formas corta duas vezes.', mod: { ataques: 1 } }, { abaixoDe: 50, nome: 'A Forma da Coroa', efeito: 'A luz sobe para a cabeça: ele chama 3 Soldados de Valgor e todos os aliados dele ganham +1d10.', mod: { dados: 1 } }, { abaixoDe: 25, nome: 'A Chama Breve', efeito: 'Tudo arde: +3d10 em todos os ataques e +1 ação, mas ele perde 10% da vida máxima por turno. Ambição breve.', mod: { ataques: 1, dados: 3, df: 0.7, dm: 0.7 } } ], resistencias: 'Imune a condições de mente e a Marcas Carmesins.', fraquezas: 'Quem estiver usando um item de Valgor causa +1d10.', drops: [ { item: 'coracao_valgor', chance: 100 }, { item: 'cetro_rei_despedacado', chance: 30 }, { item: 'lamina_mil_formas', chance: 10 }, { item: 'coroa_chama_breve', chance: 15 }, { texto: 'Tesouro do trono de Valgor (3 platina)', chance: 100 } ] },

  // ===== Ruínas do Abismo =====
  { id: 'gargula_abismo', nome: 'Gárgula do Abismo', tipo: 'Constructo', tamanho: 'medio', dificuldade: 3, local: 'Ruínas do Abismo', descricao: 'Uma gárgula de pedra rachada, com olhos vermelhos, empoleirada nos arcos das ruínas.', atributos: { FOR: 4, CON: 4, DEX: 3, AGI: 3, INT: 1, FDV: 3, PER: 4 }, defesaNatural: { df: 4, dm: 3 }, ataques: [ { nome: 'Garras de Pedra', dados: 3, tipo: 'fisico', alcance: 'Adjacente', efeito: '' }, { nome: 'Mergulho', dados: 3, tipo: 'fisico', alcance: 'Adjacente', efeito: 'Só depois de voar 3 hex. Derruba o alvo.' } ], habilidades: [ { nome: 'Estátua', tipo: 'Passiva', usos: '—', efeito: 'Se não se moveu no turno, recebe metade do dano físico.' } ], drops: [ { item: 'asas_petreas', chance: 4 }, { texto: 'Olho de rubi da gárgula', chance: 40 } ] },
  { id: 'azhrak', nome: 'Azhrak, o que Jaz sob as Pedras', tipo: 'Aralto antigo', tamanho: 'grande', dificuldade: 5, especial: 'Chefe', origem: 'deus_marcado', local: 'Ruínas do Abismo', descricao: 'Um ser alado de pele de pedra e rachaduras de brasa, preso por correntes a um altar vermelho. Os olhos brilham como cristais carmesins.', historia: 'Um dos primeiros Araltos. Na Batalha Colossal, os cinco heróis não conseguiram matá-lo, então o enterraram vivo sob as pedras do deserto. O que jaz sob as pedras nunca morre, e agora os cristais carmesins do nível inferior estão devolvendo a força a ele.', atributos: { FOR: 7, CON: 7, DEX: 4, AGI: 4, INT: 5, FDV: 6, PER: 6 }, defesaNatural: { df: 5, dm: 5 }, ataques: [ { nome: 'Garras de Brasa', dados: 5, tipo: 'fisico', alcance: 'Adjacente', efeito: '' }, { nome: 'Asas Cortantes', dados: 4, tipo: 'fisico', alcance: 'Todos os adjacentes', efeito: '' }, { nome: 'Olhar do Abismo', dados: 4, tipo: 'magico', alcance: '8 hex', efeito: 'O alvo faz teste de FDV ou fica paralisado no próximo turno.' } ], magias: [ 'olhar_eclipse', 'silencio' ], habilidades: [ { nome: 'Correntes Antigas', tipo: 'Passiva', usos: '—', efeito: 'Começa acorrentado ao altar: não sai de 2 hex do centro. Cada Selo Carmesim destruído no nível inferior (A3 e A6) solta uma corrente e tira 15% da vida máxima dele.' } ], fases: [ { abaixoDe: 75, nome: 'As Correntes Cedem', efeito: 'Uma corrente quebra: agora voa por toda a sala. +1 ação de ataque.', mod: { ataques: 1 } }, { abaixoDe: 50, nome: 'Pedra e Brasa', efeito: 'As rachaduras se abrem: quem o atacar corpo a corpo sofre 2d10 × nível de fogo. Chama 2 Gárgulas do Abismo.', mod: { dados: 1 } }, { abaixoDe: 25, nome: 'O que Nunca Morre', efeito: 'Se cair nesta fase, levanta uma vez com 20% da vida, a não ser que os dois Selos Carmesins do nível inferior tenham sido destruídos.', mod: { ataques: 1, dados: 2 } } ], resistencias: 'Imune a fogo, medo, condições de mente e Marcas Carmesins.', fraquezas: 'Magias sagradas causam +2d10.', drops: [ { item: 'olho_abismo', chance: 100 }, { item: 'foice_abismo', chance: 30 }, { item: 'asas_petreas', chance: 25 }, { texto: 'Tesouro do altar (2 platina)', chance: 100 } ] },

  // ===== Cavernas da Estrela Dourada =====
  { id: 'lodo_venenoso', nome: 'Lodo Venenoso', tipo: 'Aberração', tamanho: 'medio', dificuldade: 3, local: 'Cavernas da Estrela Dourada', descricao: 'Uma massa verde brilhante que escorre dos poços de veneno das cavernas.', atributos: { FOR: 3, CON: 4, DEX: 1, AGI: 2, INT: 1, FDV: 2, PER: 2 }, defesaNatural: { df: 1, dm: 3 }, ataques: [ { nome: 'Toque Corrosivo', dados: 2, tipo: 'fisico', alcance: 'Adjacente', efeito: 'Veneno: 1d10 × nível por 2 turnos, ignorando a defesa.' } ], habilidades: [ { nome: 'Divisão', tipo: 'Reação', usos: '1 por batalha', efeito: 'Ao receber um acerto de arma cortante, se divide em dois lodos, cada um com metade da vida restante.' } ], fraquezas: 'Fogo e gelo causam +2d10.', resistencias: 'Imune a veneno.', drops: [ { item: 'adaga_veneno_verde', chance: 8 }, { texto: 'Frasco de veneno verde', chance: 60 } ] },
  { id: 'espectro_gelo', nome: 'Espectro de Gelo', tipo: 'Morto-vivo', tamanho: 'medio', dificuldade: 3, local: 'Cavernas da Estrela Dourada', descricao: 'A sombra congelada de um explorador que morreu nas grutas, com cristais de gelo no lugar dos olhos.', atributos: { FOR: 2, CON: 3, DEX: 3, AGI: 3, INT: 3, FDV: 4, PER: 4 }, defesaNatural: { df: 3, dm: 3 }, ataques: [ { nome: 'Toque Congelante', dados: 3, tipo: 'magico', alcance: 'Adjacente', efeito: 'O alvo perde 2 de movimento no próximo turno.' } ], magias: [ 'rajada_gelo', 'chao_gelo' ], habilidades: [ { nome: 'Incorpóreo', tipo: 'Passiva', usos: '—', efeito: 'Armas comuns causam metade do dano.' } ], resistencias: 'Imune a frio.', fraquezas: 'Fogo causa +2d10.', drops: [ { item: 'manto_gelo_cristal', chance: 8 }, { texto: 'Cristal de gelo eterno', chance: 50 } ] },
  { id: 'guardiao_dourado', nome: 'O Guardião da Escadaria Dourada', tipo: 'Constructo', tamanho: 'grande', dificuldade: 5, especial: 'Chefe', local: 'Cavernas da Estrela Dourada', descricao: 'Um gigante de armadura escura com chifres, uma estrela dourada cravada no peito, sentado entre duas velas na base da escadaria.', historia: 'Os serpentarianos do culto de Jurgmund o construíram para que ninguém indigno subisse ao pico. Ele pergunta a cada um por que quer ver o dragão, e escuta a resposta antes de lutar.', atributos: { FOR: 7, CON: 6, DEX: 3, AGI: 3, INT: 3, FDV: 6, PER: 5 }, defesaNatural: { df: 6, dm: 5 }, ataques: [ { nome: 'Punho de Obsidiana', dados: 5, tipo: 'fisico', alcance: 'Adjacente', efeito: 'Derruba quem falhar num teste de FOR.' }, { nome: 'Chifres', dados: 4, tipo: 'fisico', alcance: 'Todos os adjacentes', efeito: '' } ], habilidades: [ { nome: 'A Pergunta', tipo: 'Passiva', usos: '—', efeito: 'Antes de lutar, pergunta a cada herói por que quer ver o dragão. Quem responder com verdade (a critério do mestre) recebe +1 em todos os testes até o fim da batalha. Quem mentir, ele ataca primeiro.' } ], fases: [ { abaixoDe: 75, nome: 'As Velas Queimam', efeito: 'As velas dos lados acendem: ele recupera 5% da vida por turno enquanto as duas estiverem acesas. Apagar cada vela gasta 1 ação.' }, { abaixoDe: 50, nome: 'A Estrela Desperta', efeito: 'A estrela no peito brilha: +1 ação de ataque, e cada ataque dele cega por 1 turno (−2 na chance de defesa).', mod: { ataques: 1 } }, { abaixoDe: 25, nome: 'Último Degrau', efeito: 'Bloqueia a escadaria com o corpo: a defesa física dobra, mas ele não sai mais do lugar e perde uma ação.', mod: { ataques: -1, dados: 2, df: 2 } } ], resistencias: 'Imune a condições de mente, veneno e fogo.', fraquezas: 'Martelos e maças causam +1d10.', drops: [ { item: 'escudo_escama_dourada', chance: 35 }, { item: 'arco_estrela_dourada', chance: 20 }, { texto: 'Estrela de ouro do peito do Guardião', chance: 100 } ] },
  { id: 'grande_dragao_dourado', nome: 'O Grande Dragão Dourado', tipo: 'Dragão (aspecto de Jurgmund)', tamanho: 'colossal', dificuldade: 5, especial: 'Colosso', origem: 'jurgmund', local: 'Cavernas da Estrela Dourada', descricao: 'Um dragão imenso de escamas douradas que brilham como uma estrela na noite. Onde ele pousa, a neve derrete.', historia: 'Depois da Batalha Colossal, Jurgmund deixou no Vulcão de Karloth um dragão dourado feito da própria luz. Nas noites de lua cheia, ele voa até o Pico da Estrela Dourada para ver o ovo que deixou aos cuidados da Matriarca Rubra. Não é inimigo de ninguém, mas não fala com quem não foi provado.', atributos: { FOR: 9, CON: 9, DEX: 5, AGI: 5, INT: 7, FDV: 8, PER: 7 }, defesaNatural: { df: 7, dm: 7 }, ataques: [ { nome: 'Garras de Luz', dados: 6, tipo: 'fisico', alcance: 'Adjacente', efeito: '' }, { nome: 'Sopro da Estrela', dados: 7, tipo: 'magico', alcance: 'Cone de 10 hex', efeito: 'Luz dourada: criaturas carmesins sofrem o dobro.' } ], habilidades: [ { nome: 'Não é Inimigo', tipo: 'Passiva', usos: '—', efeito: 'Só luta se o grupo pedir a prova, ou se atacarem primeiro. Com quem vem em paz, conversa.' }, { nome: 'Voo', tipo: 'Passiva', usos: '—', efeito: 'Voa 20 hex por turno.' } ], fases: [ { abaixoDe: 100, nome: 'A Prova', efeito: 'Começa a luta medindo o grupo: ataca uma vez por herói, sem usar o sopro.' }, { abaixoDe: 50, nome: 'Basta', efeito: 'O dragão para de lutar. Ele diz o que viu em cada herói e entrega a Escama da Estrela Dourada a quem ele achar digno. Se o grupo continuar atacando, ele voa embora e nunca mais volta.', mod: { ataques: -9 } } ], resistencias: 'Imune a fogo, veneno, condições de mente e Marcas Carmesins.', drops: [ { item: 'escama_estrela_dourada', chance: 100 } ] }
];


/* =========================================================
   ATLAS
   Cada região tem um mapa (imagem na pasta mapas/) e uma lista de lugares.
   Os monstros aparecem no lugar cujo nome é igual ao "local" deles.
   Os itens aparecem no lugar que lista o "tema" deles em "temas".
   ========================================================= */
const REGIOES = [
  { id: 'verdom', nome: 'Reino de Verdom', imagem: 'mapas/reino_de_verdom.jpg',
    descricao: 'A maior cidade humana de Aether, construída sobre as ruínas da antiga Vermilion. Vernand, ao sul, é cidade vassala desde que perdeu terras para Verdom.',
    lugares: [
      { nome: 'Castelo de Verdom', temas: ['Verdom'], desc: 'O coração do reino humano, cercado por muralhas e torres de vigia.' },
      { nome: 'Igreja do Jurgmund', temas: ['Verdom, Igreja do Jurgmund'], desc: 'Templo dedicado à Cobra Colossal, dentro das muralhas.' },
      { nome: 'Sede da Guilda de Verdom', temas: ['Verdom, Sede da Guilda'], desc: 'Onde aventureiros pegam contratos, vendem achados e ouvem boatos.' },
      { nome: 'Cidade Baixa (Verdom)', desc: 'Casas, moinhos e mercados fora das muralhas. Onde os ratos e os cultistas se escondem.' },
      { nome: 'Esgotos de Verdom', desc: 'Túneis sob a cidade, reino de Grakk e dos goblins.' },
      { nome: 'Forte Anão da Guarda', desc: 'Fortaleza anã encravada na montanha, ao norte.' },
      { nome: 'Grutas do Troll', desc: 'Cavernas nas montanhas a noroeste. O nome não é exagero.' },
      { nome: 'Ruínas de Vermilion', temas: ['Ruínas de Vermilion'], desc: 'O que sobrou da cidade antiga sob Verdom. Há um fosso no centro onde ninguém constrói.' },
      { nome: 'Lago do Pobre', desc: 'Um lago escuro cercado de floresta, onde à noite se ouve alguém chorando.' },
      { nome: 'Fazendas', desc: 'Os campos que alimentam Verdom, a leste das muralhas.' },
      { nome: 'Caminho para o Deserto de Karlach', desc: 'A estrada que sai do reino rumo ao deserto. Salteadores esperam as caravanas.' },
      { nome: 'Castelo de Vernand', temas: ['Vernand'], desc: 'O castelo de telhados verdes no meio da floresta, sede da cidade vassala.' },
      { nome: 'Florestas de Vernand', desc: 'Matas fechadas ao redor de Vernand.' },
      { nome: 'Antigo Navio de Guerra', desc: 'Um navio encalhado na névoa, a sudeste. Ninguém sabe como chegou ali.' } ] },

  { id: 'karlach', nome: 'Deserto de Karlach', imagem: 'mapas/deserto_de_karlach.jpg',
    descricao: 'O deserto onde a essência do Deus Marcado caiu em cristais carmesins. A Salamandra Karlach caminha por ele com uma cidade inteira nas costas.',
    lugares: [
      { nome: 'Forte de Verdom', desc: 'O posto avançado de Verdom na entrada do deserto, último lugar seguro antes da areia.' },
      { nome: 'Deserto de Karlach', desc: 'As areias abertas entre os lugares marcados no mapa. Qualquer caminho pode ter encontros.' },
      { nome: 'Pântanos de Vermilion', desc: 'Charcos ao noroeste, na costa.' },
      { nome: 'Farol da Perdição', desc: 'Um farol que guia navios para as pedras.' },
      { nome: 'Kurnamin', temas: ['Kurnamin'], desc: 'Cidade costeira que existe para vigiar o mar contra Murlach.' },
      { nome: 'Mar de Murlach', desc: 'As águas ao norte de Kurnamin, onde Murlach caça.' },
      { nome: 'Floresta de Volterion', desc: 'Uma floresta inteira de árvores mortas entre o deserto e as montanhas.' },
      { nome: 'Ruínas do Templo dos Semideuses', desc: 'O templo caído onde as relíquias dos semideuses eram guardadas.' },
      { nome: 'Ruínas da Antiga Cidade', desc: 'O que sobrou da cidade que existia antes do deserto.' },
      { nome: 'Ruínas Grúticas', desc: 'Pedras e arcos cheios de estátuas. Algumas não são estátuas.' },
      { nome: 'Lago Corrompido', desc: 'Um lago vermelho e turvo, apodrecido pelos cristais carmesins.' },
      { nome: 'Cidade de Karlach', temas: ['Cidade de Karlach'], desc: 'A cidade construída nas costas da Salamandra Karlach, que anda com ela pelo deserto.' },
      { nome: 'Cavernas do Pacto', desc: 'Cavernas nas montanhas a leste. Os Araltos fazem ali os seus juramentos.' },
      { nome: 'Lago da Gota de Jurgmund', temas: ['Lago da Gota de Jurgmund'], desc: 'Um oásis verde no sul do deserto. Dizem que a água nasceu de uma gota do sangue de Jurgmund.' },
      { nome: 'Covil da Quimera', desc: 'Pedras em pé no sul do deserto, onde a Quimera faz o ninho.' },
      { nome: 'Acampamento do Arquidemônio', desc: 'Uma tenda solitária ao pé das montanhas do sudeste.' },
      { nome: 'Ruínas do Abismo', desc: 'Ruínas afundadas numa fenda do deserto, em dois níveis: cavernas e salões em cima, lava e maldições embaixo. O que jaz sob as pedras nunca morre.' } ] },

  { id: 'orcs', nome: 'Grande Reino dos Orcs', imagem: 'mapas/grande_reino_orc.jpg',
    descricao: 'A terra dos orcs, criados pelos elfos para a força e a resistência e que por eras guardaram fronteiras que não eram suas. Hoje o reino é deles, e a capital é a Grande Cidade Orc Lonk-Carn.',
    lugares: [
      { nome: 'Grande Cidade Orc Lonk-Carn', temas: ['Grande Reino dos Orcs'], desc: 'A capital do reino, onde força é lei. Quem quer falar com o rei precisa antes vencer o Campeão.' },
      { nome: 'Baía de Lonk-Carn', temas: ['Baía de Lonk-Carn'], desc: 'O porto do reino, a oeste da capital.' },
      { nome: 'Acampamentos Orcs', desc: 'Tendas de clãs espalhadas pelas colinas do reino.' },
      { nome: 'Torres de Observação', desc: 'Torres de vigia no norte e no sul, de onde os orcs guardam as próprias fronteiras.' },
      { nome: 'Caminho de Planatux', desc: 'A estrada do norte, entre a costa e as colinas. Os orcs expulsos dos clãs cobram pedágio ali.' },
      { nome: 'Dungeons dos de Gornark', desc: 'Masmorras escavadas na montanha do noroeste.' },
      { nome: 'Área do Desafio de Poder', temas: ['Área do Desafio de Poder'], desc: 'Pedras e arcos antigos no sudeste, onde os orcs provam o próprio valor diante dos antepassados.' },
      { nome: 'Antigo Moinho da Bruxa', desc: 'Um moinho isolado na costa leste, cujas pás giram sem vento.' },
      { nome: 'Floresta Morta do Clérigo', desc: 'A mata seca e enevoada em volta do castelo do Grande Clérigo, patrulhada por seus fiéis.' },
      { nome: 'Castelo do Grande Clérigo do Deus-Marcado', desc: 'O castelo no nordeste de onde o Grande Clérigo prepara a volta do Deus Marcado.' } ] },

  { id: 'tortumaga', nome: 'Grande Ilha de Tortumaga', imagem: 'mapas/ilha_de_tortumaga.jpg',
    descricao: 'A ilha nas costas da Tartaruga Magnalaga, no meio do Grande Lago Central. Tem um reino, uma cidade de anões, duas tribos de goblins que se odeiam e túneis que descem para dentro do casco.',
    lugares: [
      { nome: 'Reinado de Magnalag', temas: ['Reinado de Magnalag'], desc: 'O reino murado no centro da ilha.' },
      { nome: 'Porto Tortuoso (Cidade dos Anões)', temas: ['Porto Tortuoso'], desc: 'A cidade dos anões do casco, com moinho e estaleiro, no lado leste da ilha. O único porto de verdade.' },
      { nome: 'Goblins Verdes', temas: ['Goblins Verdes'], desc: 'A aldeia dos Goblins Verdes, no noroeste da ilha.' },
      { nome: 'Goblins Cinzas', temas: ['Goblins Cinzas'], desc: 'A aldeia dos Goblins Cinzas, no sudoeste. Eles e os Verdes brigam desde sempre.' },
      { nome: 'Subterrâneo do Casco', desc: 'Uma caverna ao norte que desce pelas frestas do casco da Tartaruga.' },
      { nome: 'Farol do Grande Lago Central', desc: 'O farol na ilhota a oeste, ligado à ilha por uma ponte de pedra. Guia os barcos do lago.' },
      { nome: 'Entrada da Turtumaga', desc: 'Uma abertura submersa no casco, a sudoeste, que leva para dentro da Tartaruga.' },
      { nome: 'Ilha Direita', desc: 'Ilhota ao norte, ninho de um draco.' },
      { nome: 'Ilhas Gemia', desc: 'Duas ilhotas a leste, cada uma com o ninho de uma das Wyverns Gêmeas.' },
      { nome: 'Ilha Esquerda', desc: 'Ilhota ao sul, tomada por drakes de fogo.' },
      { nome: 'Grande Lago Central', desc: 'A abertura do continente deixada pela Batalha Colossal. A Tartaruga nada nele, e no fundo fica a Fissura.' } ] },

  { id: 'atrelon', nome: 'Montanhas de Atrelon', imagem: 'mapas/montanhas_de_atrelon.jpg',
    descricao: 'As montanhas onde está a cabeça de Jurgmund. Ali vivem os serpentarianos, humanos transformados em algo parecido com serpentes, e o culto da Cobra liderado pela sacerdotisa S\'ssara.',
    lugares: [
      { nome: "Templo da Sacerdotisa S'ssara", temas: ["Templo de S'ssara"], desc: "O templo verde no alto das montanhas. S'ssara, uma serpentariana, representa a vontade de Jurgmund e lidera o culto à Cobra, assim como existe o culto do Deus Marcado. É para lá que o grupo leva a garota do colar misterioso." },
      { nome: 'Cidade de Atrelon', temas: ['Cidade de Atrelon', 'Atrelon'], desc: 'A capital dos serpentarianos, com o castelo do rei Vassk cercado por um abismo.' },
      { nome: 'Picos de Atrelon', desc: 'Os picos nevados onde os dracos rubros e as wyverns fazem ninho.' },
      { nome: 'Cavernas da Estrela Dourada', desc: 'Cavernas no noroeste dos picos, lar da Matriarca Rubra, com grutas de gelo e poços de veneno. Uma escadaria atrás do Guardião Dourado sobe até o Pico da Estrela, onde o Grande Dragão Dourado pousa.' },
      { nome: 'Tundra de Atrelon', desc: 'A planície gelada e cheia de pinheiros aos pés das montanhas.' },
      { nome: 'Castelo Solitário', desc: 'Um castelo pequeno numa ilhota do lago gelado da tundra. Ninguém sabe quem mora lá.' },
      { nome: 'Domínios dos Yets', desc: 'As florestas nevadas a leste da cidade, território dos yetis.' },
      { nome: 'Torre de Observação Estelar', temas: ['Torre de Observação Estelar'], desc: 'Uma torre antiga usada para observar as estrelas e vigiar a estrada.' },
      { nome: 'Ruína Élfica', desc: 'Restos de uma cidade élfica do tempo do Domínio dos Elfos, ainda guardada por sentinelas de cristal.' },
      { nome: 'Encontro de Turlach', desc: 'Onde o rio da montanha encontra o mar. Turlach vive ali.' },
      { nome: 'Tumbas de Tobi', desc: 'Tumbas cavadas na montanha marrom, cheias de armadilhas. Tobi está enterrado lá, ou pelo menos é o que ele quer que pensem.' },
      { nome: 'Caminho da Morte', desc: 'A trilha estreita pela encosta leste das montanhas.' },
      { nome: 'Ruínas do Deus-Humano', desc: 'As Ruínas de Valgor, o semideus dos humanos, no extremo nordeste. Salas suspensas sobre o abismo, ligadas por pontes quebradas, que terminam no trono do Rei Despedaçado.' },
      { nome: 'Planícies de Atrelon', desc: 'Campos abertos entre a floresta e o mar, com acampamentos de viajantes.' },
      { nome: 'Floresta Obscura', desc: 'Uma mata fechada e escura a leste, onde a luz não entra direito.' },
      { nome: 'Última Fortaleza do Deus-Marcado', desc: 'As ruínas da última fortaleza que resistiu na Batalha Colossal. Alguns Araltos nunca saíram de lá.' },
      { nome: 'Cidade de Nazarik', desc: 'Cidade portuária no centro da baía, com moinho, igreja e navios que cruzam o mar.' },
      { nome: 'Bastião dos Heróis', temas: ['Bastião dos Heróis'], desc: 'Um forte numa ilha coberta de floresta, dedicado aos cinco heróis da Primeira Era.' },
      { nome: 'Forte de Jurgmund', temas: ['Forte de Jurgmund'], desc: 'Uma fortaleza escavada na montanha do oeste.' },
      { nome: 'Acampamento Orc de Turgu', desc: 'O acampamento de um clã orc que saiu do Grande Reino, no sudoeste.' } ] },

  { id: 'outras', nome: 'Outras terras', imagem: null,
    descricao: 'Lugares da história de Aether que ainda não têm mapa no app.',
    lugares: [
      { nome: 'Vulcão de Karloth', desc: 'Onde repousa o Dragão Dourado, aspecto de Jurgmund, com um brilho visível de toda a planície. Nas noites de lua cheia, ele voa até o Pico da Estrela Dourada, em Atrelon.' },
      { nome: 'Costa de Korgara', temas: ['Costa de Korgara'], desc: 'Terra de corsários e pescadores de pérolas.' } ] }
];


/* =========================================================
   COMÉRCIO E APRENDIZADO
   Dinheiro: 10 bronze = 1 prata, 100 prata = 1 ouro, 1000 ouro = 1 platina.
   Todos os valores abaixo estão em BRONZE (a menor moeda).
   Preço de um item = valor do tier × fator do tipo de item × multiplicador da loja.
   Itens Lendários e Únicos não são vendidos: o valor serve de referência para trocas e recompensas.
   ========================================================= */
const MOEDAS = [
  { nome: 'platina', valor: 1000000 },
  { nome: 'ouro',    valor: 1000 },
  { nome: 'prata',   valor: 10 },
  { nome: 'bronze',  valor: 1 }
];
// comum: poucas pratas | raro: algum ouro | perfeito: muito ouro | lendário e único: platina
const PRECOS_ITEM  = { comum: 150, raro: 5000, perfeito: 120000, lendario: 2000000, unico: 8000000 };
const PRECOS_MAGIA = { comum: 300, raro: 8000, perfeito: 150000 };
// o tipo do item ajusta o preço
const FATOR_PRECO = {
  categoria: { muito_leve: 0.6, leve: 0.8, media: 1, pesada: 1.3, muito_pesada: 1.6, foco: 1.2 },
  slot:      { elmo: 0.7, luvas: 0.6, botas: 0.7, peitoral: 1.5 },
  tipo:      { placas: 1.3, malha: 1.1, couro: 0.8, brocado: 1.1, tecido: 0.9, runica: 1.2 },
  escudo: 1, acessorio: 1.2
};
const FORMAS_ENSINO = { venda: 'Venda', troca: 'Troca', missao: 'Missão' };

const LOJAS = [
  // ----- Reino de Verdom -----
  { id: 'forja_bran', nome: 'Forja do Velho Bran', lugar: 'Cidade Baixa (Verdom)', dono: 'Bran, ferreiro humano', mult: 1,
    descricao: 'A forja mais movimentada da Cidade Baixa. Tudo o que um aventureiro iniciante precisa.',
    itens: ['elmo_malha_runica','cota_malha_runica','luvas_malha_runica','botas_malha_runica','anel_bronze_duplo','adaga','espada_curta','espada_longa','maca_ferro','machado_batalha','martelo_guerra','arco_curto','arco_longo','besta_pesada',
            'elmo_ferro','couraca_ferro','manoplas_ferro','grevas_ferro','coifa_malha','cota_malha','luvas_malha','botas_malha',
            'capuz_couro','gibao_couro','luvas_couro','botas_couro','broquel','escudo_torre'] },
  { id: 'armazem_guilda', nome: 'Armazém da Guilda', lugar: 'Sede da Guilda de Verdom', dono: 'Mestra-intendente Oriane', mult: 1.1,
    descricao: 'Equipamento testado em campo. Quem tem o Selo da Guilda paga 10% a menos.',
    itens: ['bracelete_equilibrio','couraca_crepusculo','espada_sedenta','botas_salto','escudo_contra_ataque','anel_ferro','anel_prata','cinto_couro','talisma_apostador','espada_bastarda','arco_composto','lanca_cavaleiro','besta_mao',
            'elmo_cavaleiro','brigantina','botas_pantano','grevas_investida','anel_guarda','anel_runico','cinto_tita','amuleto_antidoto',
            'bolsa_alquimista','pulseira_esquiva','escudo_espinhos','paves_arqueiro','selo_guilda_verdom','rapieira_duelista','couraca_guardiao','anel_forca','broche_diplomata'] },
  { id: 'armaria_castelo', nome: 'Armaria do Castelo', lugar: 'Castelo de Verdom', dono: 'Capitão da Guarda', mult: 1,
    descricao: 'Só vende para quem serve ao reino ou tem uma carta da guilda.',
    itens: ['alabarda_verdom','couraca_verdom','couraca_baluarte','elmo_sentinela','muralha_ferro'] },
  { id: 'relicario_igreja', nome: 'Relicário da Igreja', lugar: 'Igreja do Jurgmund', dono: 'Irmão Tobias', mult: 1,
    descricao: 'Símbolos, vestes e relíquias abençoadas.',
    itens: ['incensario_bronze','fita_oracao','lanterna_devota','cajado_peregrino','luvas_ouro_rituais','botas_peregrino','mitra_bispo','broche_sanador','simbolo_prata','mitra_bordada','vestes_rituais','luvas_rituais','botas_rituais','maca_consagrada','rosario_peregrino',
            'amuleto_cura','vestes_eremita','simbolo_igreja_jurgmund','amuleto_devoto','calice_sagrado'] },
  { id: 'posto_florestal', nome: 'Posto dos Guardas-Florestais', lugar: 'Castelo de Vernand', dono: 'Guarda-florestal Aldric', mult: 1,
    descricao: 'Arcos e couro das matas de Vernand.',
    itens: ['arco_curto','arco_longo','gibao_couro','capuz_couro','botas_couro','arco_teixo','bracadeiras_arqueiro','capuz_sombras',
            'botas_andarilho','amuleto_cacador','arco_guarda_vernand','anel_juramento_vassalo','gibao_cacador','arco_cacador'] },
  // ----- Deserto de Karlach -----
  { id: 'intendencia_forte', nome: 'Intendência do Forte', lugar: 'Forte de Verdom', dono: 'Sargento Hald', mult: 1.3,
    descricao: 'O último lugar para comprar antes da areia. Caro, mas é o que tem.',
    itens: ['incensario_bronze','cota_malha','gibao_couro','botas_couro','cinto_couro','escudo_torre','anel_brasa_fria','amuleto_antidoto','bolsa_alquimista'] },
  { id: 'arsenal_kurnamin', nome: 'Arsenal de Kurnamin', lugar: 'Kurnamin', dono: 'Mestre-arpoador Vel', mult: 1.1,
    descricao: 'Armas feitas para caçar coisas grandes no mar.',
    itens: ['besta_pesada','besta_mao','paves_arqueiro','colar_dentes','arpao_kurnamin'] },
  { id: 'forja_brasa', nome: 'Forja de Brasa Viva', lugar: 'Cidade de Karlach', dono: 'Os ferreiros do conselho', mult: 1.2,
    descricao: 'Forjada no calor que sobe das costas da Salamandra.',
    itens: ['cajado_eco_sombrio','orbe_vidro','cetro_sangue','cajado_carvalho','cajado_centelha','anel_brasa_fria','couraca_escamas','manoplas_carrasco','martelo_terremoto',
            'lanca_vidro_rubro','manto_cinzas_frias','cajado_tempestade','manto_arquimago'] },
  // ----- Grande Reino dos Orcs -----
  { id: 'mercado_guerra', nome: 'Mercado de Guerra', lugar: 'Grande Cidade Orc Lonk-Carn', dono: 'Grakha, a Vendedora de Machados', mult: 1,
    descricao: 'Orcs não pechincham. Quem pede desconto precisa ganhar uma queda de braço.',
    itens: ['mascara_coragem','machado_batalha','martelo_guerra','machado_fende','marreta_quebra_escudo','muralha_ferro','cinto_tita','talisma_presas_orc',
            'montante_carrasco','martelo_trovao','manoplas_tita'] },
  { id: 'tenda_corsario', nome: 'Tenda do Corsário Orc', lugar: 'Baía de Lonk-Carn', dono: 'Olho-Torto', mult: 1,
    descricao: 'Mercadoria de navios que afundaram. Não pergunte como.',
    itens: ['sabre_vento','colar_dentes','brinco_raposa','ancora_mangual','luvas_ladrao'] },
  // ----- Grande Ilha de Tortumaga -----
  { id: 'oficina_casco', nome: 'Oficina dos Anões do Casco', lugar: 'Porto Tortuoso (Cidade dos Anões)', dono: 'Mestre Dorgan Pé-de-Casco', mult: 1,
    descricao: 'O melhor trabalho anão fora das montanhas: runas, mithril e ferro negro.',
    itens: ['elmo_malha_runica','cota_malha_runica','elmo_crepusculo','couraca_crepusculo','manoplas_crepusculo','grevas_crepusculo','elmo_equinocio','couraca_equinocio','medalhao_equinocio','martelo_estaleiro','luneta_ana','besta_pesada_ana','escudo_ferro_negro','grevas_ferro_negro','elmo_leao','cota_mithril',
            'coifa_runica','escudo_runico','espada_runica'] },
  { id: 'loja_real_magnalag', nome: 'Loja Real de Magnalag', lugar: 'Reinado de Magnalag', dono: 'Dama Ysolde', mult: 1,
    descricao: 'Tecidos finos e objetos de estudo para os magos do reino.',
    itens: ['orbe_vidro','caderno_feiticos','colar_contas','chapeu_astrologo','manto_mana','anel_mana','chapeu_linho','tunica_encantada','luvas_seda','sapatos_feltro','varinha_freixo','luvas_conjurador','anel_foco_arcano','brinco_foco','tabardo_magnalag'] },
  { id: 'barraca_fuzz', nome: 'Barraca do Fuzz', lugar: 'Goblins Cinzas', dono: 'Fuzz, o Pirotécnico', mult: 0.8,
    descricao: 'Barato, às vezes chamuscado. Nenhuma devolução.',
    itens: ['adaga','capuz_couro','talisma_apostador','anel_ferro','polvora_cinza'] },
  { id: 'troca_verdes', nome: 'Troca dos Goblins Verdes', lugar: 'Goblins Verdes', dono: 'A Tia Musgo', mult: 0.8,
    descricao: 'Aceitam moedas, mas preferem trocas. Qualquer coisa brilhante serve.',
    itens: ['fita_oracao','arco_curto','fisga_goblin_verde','botas_couro','sapatos_feltro'] },
  // ----- Montanhas de Atrelon -----
  { id: 'armaria_atrelon', nome: 'Armaria Real de Atrelon', lugar: 'Cidade de Atrelon', dono: "S'teph, armeira serpentariana", mult: 1.1,
    descricao: 'Aço para escamas, malha para corpos longos.',
    itens: ['manoplas_equinocio','grevas_equinocio','bracelete_equilibrio','coifa_malha','cota_malha','broquel','lanca_real_vassk','cota_mercenario','escudo_cruzado','elmo_sentinela','couraca_baluarte','elmo_castelo_cobra','botas_atrelon'] },
  { id: 'loja_templo', nome: 'Oferendas do Templo', lugar: "Templo da Sacerdotisa S'ssara", dono: 'Os fiéis do culto', mult: 1,
    descricao: 'Não se compra: se oferta. O valor é o mesmo.',
    itens: ['incensario_bronze','broche_luz','livro_das_horas','luvas_bencao','sandalias_romeiro','vestes_vigilia','anel_fonte','mitra_peregrino','relicario_martir','simbolo_vontade_jurgmund','vestes_sumo_sacerdote'] },
  { id: 'forja_jurgmund', nome: 'Forja do Forte', lugar: 'Forte de Jurgmund', dono: 'Os ferreiros do forte', mult: 1,
    descricao: 'Machados e placas feitos dentro da montanha.',
    itens: ['manoplas_ferro','grevas_ferro','machado_batalha','machado_forte_jurgmund'] },
  { id: 'emporio_nazarik', nome: 'Empório de Nazarik', lugar: 'Cidade de Nazarik', dono: 'A família Vorne', mult: 1.1,
    descricao: 'Tudo que chega pelo mar passa por aqui: anéis, amuletos e livros de toda Aether.',
    itens: ['capa_mil_penas','luvas_alquimista','arco_gemeo','amuleto_ultimo_suspiro','caderno_feiticos','varinha_eco','pingente_eco','sandalias_meditacao','cetro_arcano_duplo','luvas_tecelao','botas_levitacao','manto_estrelas','capuz_vidente','amuleto_duplo_conjuro','varinha_espinhos','grimorio_viajante','manto_aprendiz','sapatilhas_vento','coroa_arcanista','tomo_arcanista','amuleto_sabio',
            'anel_agilidade','anel_destreza','anel_olho_aguia','amuleto_guarda_dupla','colar_constituicao','botas_vento_perfeitas'] },
  { id: 'observatorio', nome: 'Instrumentos do Observatório', lugar: 'Torre de Observação Estelar', dono: 'O Astromante', mult: 1,
    descricao: 'Poucos instrumentos, todos muito precisos.',
    itens: ['astrolabio_estelar','orbe_gelo'] },
  // ----- Outras terras -----
  { id: 'mercado_korgara', nome: 'Mercado dos Corsários', lugar: 'Costa de Korgara', dono: 'Capitã Meresh', mult: 1,
    descricao: 'Pérolas, sabres e mapas de tesouro que quase sempre são falsos.',
    itens: ['sabre_korgara','colar_perolas_korgara','estilete_sombrio','punhal_gemeo','manoplas_duelista'] }
];

const MESTRES = [
  { id: 'arquivista_guilda', nome: 'Arquivista Arcana da Guilda', lugar: 'Sede da Guilda de Verdom',
    descricao: 'Ensina as magias de combate que todo aventureiro precisa.',
    ensina: [ { magia: 'executar' }, { magia: 'troca_lugar' }, { magia: 'chao_gelo' }, { magia: 'pedrada_arcana' }, { magia: 'agulhas_sombra' }, { magia: 'escudo_arcano' }, { magia: 'mao_arcana' }, { magia: 'reparar' }, { magia: 'cone_de_frio' }, { magia: 'raio_solar' }, { magia: 'dardo_mistico' }, { magia: 'toque_chocante' }, { magia: 'chama' }, { magia: 'rajada_gelo' }, { magia: 'luz' },
              { magia: 'detectar_magia' }, { magia: 'bola_fogo' }, { magia: 'lanca_relampago' }, { magia: 'passo_nebuloso' } ] },
  { id: 'sacerdote_igreja', nome: 'Sacerdotisa Maelis', lugar: 'Igreja do Jurgmund',
    descricao: 'Ensina curas e proteções a quem jura usá-las pelos outros.',
    ensina: [ { magia: 'transferir_vida' }, { magia: 'corrente_vital' }, { magia: 'toque_revigorante' }, { magia: 'raio_cura' }, { magia: 'protecao_elemental' }, { magia: 'heroismo' }, { magia: 'cura_menor' }, { magia: 'estancar' }, { magia: 'pele_pedra' }, { magia: 'egide_menor' }, { magia: 'barreira' },
              { magia: 'cura_grupo' }, { magia: 'regeneracao' }, { magia: 'santuario' }, { magia: 'purificacao' }, { magia: 'restauracao' },
              { magia: 'ressurreicao', missao: 'Trazer de volta o corpo de um fiel perdido nas Ruínas de Vermilion.' } ] },
  { id: 'piromante', nome: 'Piromante da Forja Viva', lugar: 'Cidade de Karlach',
    descricao: 'Aprendeu magia no calor das costas da Salamandra.',
    ensina: [ { magia: 'bola_fogo_retardada' }, { magia: 'explosao_trovao' }, { magia: 'protecao_elemental' }, { magia: 'chama' }, { magia: 'foco_arcano' }, { magia: 'bola_fogo' }, { magia: 'arma_encantada' }, { magia: 'chuva_meteoros' },
              { magia: 'elemental_fogo' }, { magia: 'inferno', missao: 'Trazer um Núcleo de cristal carmesim de uma Cria de Karlach sem deixar que ela o coma.' } ] },
  { id: 'bruxa_mares', nome: 'Velha Nhara das Marés', lugar: 'Kurnamin',
    descricao: 'Bruxa do mar que protege Kurnamin contra Murlach há quarenta anos.',
    ensina: [ { magia: 'cone_de_frio' }, { magia: 'tempestade_gelo' }, { magia: 'guelras' }, { magia: 'mensageiro_vento' }, { magia: 'rajada_gelo' }, { magia: 'lingua_universal' }, { magia: 'reflexo_arcano' }, { magia: 'passo_nebuloso' },
              { magia: 'tempestade_raios' }, { magia: 'porta_dimensional' } ] },
  { id: 'runico_anao', nome: 'Rúnico Barruk', lugar: 'Porto Tortuoso (Cidade dos Anões)',
    descricao: 'Gravador de runas dos anões do casco. Ensina proteção e rituais.',
    ensina: [ { magia: 'selo_carmesim', missao: 'Selar um fragmento de cristal carmesim diante dele, sem que nenhum Aralto perceba.' }, { magia: 'golem_barro' }, { magia: 'reparar' }, { magia: 'escudo_arcano' }, { magia: 'pele_pedra' }, { magia: 'egide_menor' }, { magia: 'circulo_vigilia' }, { magia: 'bencao_viagem' }, { magia: 'servo_invisivel' },
              { magia: 'armadura_divina' }, { magia: 'terra_consagrada' },
              { magia: 'invulnerabilidade', missao: 'Descer ao Subterrâneo do Casco e trazer uma Lasca de casco da Tartaruga.' } ] },
  { id: 'xama_mor', nome: 'Xamã-Mor Urgha', lugar: 'Grande Cidade Orc Lonk-Carn',
    descricao: 'Fala com os antepassados e ensina as magias de guerra dos clãs.',
    ensina: [ { magia: 'revoada_corvos' }, { magia: 'falar_animais' }, { magia: 'heroismo' }, { magia: 'forma_animal' }, { magia: 'bencao_forca' }, { magia: 'pes_ligeiros' }, { magia: 'olhar_agucado' }, { magia: 'furia_batalha' }, { magia: 'cancao_guerra' },
              { magia: 'lobo_espiritual' }, { magia: 'celeridade' },
              { magia: 'aura_heroica', missao: 'Vencer o Desafio de Poder diante do Espírito Ancestral Orc.' } ] },
  { id: 'ssara', nome: "S'ssara, a Sacerdotisa", lugar: "Templo da Sacerdotisa S'ssara",
    descricao: 'A voz da vontade de Jurgmund. Só ensina a quem o culto confia.',
    ensina: [ { magia: 'ultimo_recurso' }, { magia: 'aura_vida', missao: 'Curar os doentes da Cidade de Atrelon durante uma semana, sem cobrar nada.' }, { magia: 'raio_cura' }, { magia: 'vinculo_vital' }, { magia: 'cura_menor' }, { magia: 'regeneracao' }, { magia: 'purificacao' }, { magia: 'cura_em_massa' }, { magia: 'restauracao' },
              { magia: 'fonte_vida', missao: 'Encher um frasco no Lago da Gota de Jurgmund e trazê-lo ao templo.' },
              { magia: 'comunhao', missao: 'Servir ao culto numa missão escolhida pela sacerdotisa.' },
              { magia: 'lagrimas_ilse', missao: 'Uma prova que só S\'ssara conhece. Ela diz que ainda não chegou a hora.' } ] },
  { id: 'astromante', nome: 'O Astromante', lugar: 'Torre de Observação Estelar',
    descricao: 'Estuda as estrelas e sabe coisas demais sobre a que caiu.',
    ensina: [ { magia: 'ressonancia', missao: 'Ajudar um aprendiz da torre a lançar a primeira magia sem explodir nada.' }, { magia: 'visao_verdadeira', missao: 'Descobrir quem está por trás da máscara dourada na corte do rei Vassk.' }, { magia: 'palavra_de_poder', missao: 'Trazer uma página do diário de Aldren que fala da palavra antiga.' }, { magia: 'raio_solar' }, { magia: 'clarividencia' }, { magia: 'dardo_mistico' }, { magia: 'luz' }, { magia: 'detectar_magia' }, { magia: 'aceleracao' }, { magia: 'portal_retorno' }, { magia: 'voo' },
              { magia: 'julgamento_celeste', missao: 'Observar com ele um eclipse inteiro do alto da torre, protegendo-a do que vier.' },
              { magia: 'ultima_estrela', missao: 'Encontrar o diário de Aldren, o astrônomo louco.' } ] },
  { id: 'eremita', nome: 'O Eremita do Castelo Solitário', lugar: 'Castelo Solitário',
    descricao: 'Ninguém sabe o nome dele, nem há quanto tempo mora no castelo. Ensina coisas que ninguém mais ensina.',
    ensina: [ { magia: 'espinhos_sangue' }, { magia: 'enfraquecer' }, { magia: 'silencio' }, { magia: 'pressa_maior', missao: 'Trazer areia de uma ampulheta quebrada das Ruínas da Antiga Cidade.' }, { magia: 'levantar_mortos' }, { magia: 'clarividencia' }, { magia: 'revoada_corvos' }, { magia: 'familiar' }, { magia: 'servo_invisivel' }, { magia: 'lobo_espiritual' }, { magia: 'toque_vampirico' }, { magia: 'prisao_espinhos' },
              { magia: 'invisibilidade' }, { magia: 'guardioes_espectrais' },
              { magia: 'dragao_jovem', missao: 'Trazer uma escama da Matriarca Rubra.' },
              { magia: 'parar_tempo', missao: 'Descobrir por que o relógio do castelo anda para trás.' },
              { magia: 'pacto_morvath', missao: 'Ele só ensina a quem já perdeu alguém. E cobra algo que não diz o que é.' },
              { magia: 'avatar_kaelthar', missao: 'Levar um fragmento de estátua de semideus até a montanha de Kaelthar.' },
              { magia: 'olho_oraculo', missao: 'Trazer um olho de pedra-lume das Ruínas Grúticas.' } ] },
  { id: 'academia_nazarik', nome: 'Academia de Nazarik', lugar: 'Cidade de Nazarik',
    descricao: 'Escola de magia aberta a quem pagar. Os professores mudam todo ano.',
    ensina: [ { magia: 'espada_dancante' }, { magia: 'silencio' }, { magia: 'troca_lugar' }, { magia: 'agulhas_sombra' }, { magia: 'mao_arcana' }, { magia: 'guelras' }, { magia: 'falar_animais' }, { magia: 'desintegrar' }, { magia: 'tempestade_gelo' }, { magia: 'aguia_gigante' }, { magia: 'forma_animal' }, { magia: 'mensageiro_vento' }, { magia: 'dardo_mistico' }, { magia: 'toque_chocante' }, { magia: 'lingua_universal' }, { magia: 'foco_arcano' }, { magia: 'bencao_viagem' },
              { magia: 'arma_encantada' }, { magia: 'invisibilidade' }, { magia: 'aceleracao' }, { magia: 'voo' }, { magia: 'porta_dimensional' } ] },
  { id: 'guardia_bastiao', nome: 'A Guardiã do Bastião', lugar: 'Bastião dos Heróis',
    descricao: 'Guarda a memória dos cinco heróis e ensina as magias que eles usavam.',
    ensina: [ { magia: 'guardiao_celestial', missao: 'Defender o Bastião dos Heróis durante uma noite inteira de ataque.' }, { magia: 'santuario' }, { magia: 'cancao_guerra' }, { magia: 'armadura_divina' }, { magia: 'celeridade' },
              { magia: 'coroa_rei_sol', missao: 'Visitar os cinco Marcos dos Heróis e trazer um sinal de cada um.' } ] }
];

const ESPECIALISTAS = [
  { id: 'marta_dedos', nome: 'Marta Dedos-Leves', lugar: 'Cidade Baixa (Verdom)', descricao: 'Ex-ladra que agora vende o que sabe.',
    ensina: [ { pericia: 'Arrombamento', attr: 'DEX', forma: 'venda', custo: '4 ouro' },
              { pericia: 'Prestidigitação', attr: 'DEX', forma: 'missao', custo: 'Pegar de volta um anel roubado dela nos Esgotos de Verdom.' } ] },
  { id: 'irma_ondina', nome: 'Irmã Ondina', lugar: 'Igreja do Jurgmund', descricao: 'Cuida dos feridos da Cidade Baixa há trinta anos.',
    ensina: [ { pericia: 'Medicina', attr: 'FDV', forma: 'venda', custo: '3 ouro, doados aos pobres' },
              { pericia: 'Religião', attr: 'INT', forma: 'missao', custo: 'Levar remédios às Fazendas durante uma semana.' } ] },
  { id: 'aldric', nome: 'Guarda-florestal Aldric', lugar: 'Castelo de Vernand', descricao: 'Conhece cada trilha das matas de Vernand, inclusive as que hoje são de Verdom.',
    ensina: [ { pericia: 'Natureza', attr: 'INT', forma: 'venda', custo: '3 ouro' }, { pericia: 'Rastreamento', attr: 'PER', forma: 'missao', custo: 'Caçar as Aranhas Gigantes que atacam os lenhadores.' },
              { pericia: 'Sobrevivência', attr: 'CON', forma: 'troca', custo: 'Uma pele de urso ou de lobo.' } ] },
  { id: 'dorgan', nome: 'Mestre Dorgan Pé-de-Casco', lugar: 'Porto Tortuoso (Cidade dos Anões)', descricao: 'Ferreiro e engenheiro. Ensina quem aguenta o calor da forja.',
    ensina: [ { pericia: 'Ferraria', attr: 'FOR', forma: 'troca', custo: 'Três placas de ferro rúnico ou metal raro.' },
              { pericia: 'Engenharia', attr: 'INT', forma: 'venda', custo: '6 ouro' } ] },
  { id: 'fuzz', nome: 'Fuzz, o Pirotécnico', lugar: 'Goblins Cinzas', descricao: 'Goblin sem sobrancelhas e com todos os dedos, o que é raro.',
    ensina: [ { pericia: 'Explosivos', attr: 'INT', forma: 'troca', custo: 'Um segredo dos Goblins Verdes.' } ] },
  { id: 'baleeiro_ossk', nome: 'Velho Baleeiro Ossk', lugar: 'Kurnamin', descricao: 'Perdeu um braço para Murlach e nunca parou de pescar.',
    ensina: [ { pericia: 'Sobrevivência', attr: 'CON', forma: 'venda', custo: '2 ouro' }, { pericia: 'Navegação', attr: 'PER', forma: 'venda', custo: '3 ouro' },
              { pericia: 'Natação', attr: 'FOR', forma: 'troca', custo: 'Um barril de rum de Korgara.' } ] },
  { id: 'alquimista_brasa', nome: 'Alquimista Seraph', lugar: 'Cidade de Karlach', descricao: 'Estuda os cristais carmesins com luvas de três camadas.',
    ensina: [ { pericia: 'Alquimia', attr: 'INT', forma: 'venda', custo: '8 ouro' },
              { pericia: 'Conhecimento dos Cristais', attr: 'INT', forma: 'missao', custo: 'Trazer uma Bolsa de sangue carmesim do Lago Corrompido.' } ] },
  { id: 'grukka', nome: 'Mestre de Guerra Grukka', lugar: 'Grande Cidade Orc Lonk-Carn', descricao: 'Treina os guerreiros da capital. Não ensina quem nunca apanhou.',
    ensina: [ { pericia: 'Fortitude', attr: 'CON', forma: 'missao', custo: 'Passar uma noite inteira de pé, sem comer, na Área do Desafio de Poder.' }, { pericia: 'Reflexos', attr: 'AGI', forma: 'venda', custo: '4 ouro' }, { pericia: 'Atletismo', attr: 'FOR', forma: 'missao', custo: 'Aguentar três rodadas de luta contra ele sem cair.' },
              { pericia: 'Intimidação', attr: 'MOR', forma: 'venda', custo: '5 ouro' } ] },
  { id: 'mestre_etiqueta', nome: "Mestre de Corte S'lorn", lugar: 'Cidade de Atrelon', descricao: 'Ensina a falar com reis serpentarianos sem ofendê-los.',
    ensina: [ { pericia: 'Etiqueta da Corte', attr: 'APA', forma: 'venda', custo: '6 ouro' },
              { pericia: 'Persuasão', attr: 'CAR', forma: 'missao', custo: 'Entregar uma carta ao Templo de S\'ssara sem abri-la.' } ] },
  { id: 'bibliotecaria', nome: 'Bibliotecária Ilen de Nazarik', lugar: 'Cidade de Nazarik', descricao: 'Guarda livros de toda Aether e empresta a quem devolve.',
    ensina: [ { pericia: 'História', attr: 'INT', forma: 'troca', custo: 'Um livro ou diário antigo encontrado em ruínas.' },
              { pericia: 'Idiomas Antigos', attr: 'INT', forma: 'venda', custo: '7 ouro' } ] },
  { id: 'astromante_pericia', nome: 'O Astromante', lugar: 'Torre de Observação Estelar', descricao: 'Também ensina a ler o céu.',
    ensina: [ { pericia: 'Navegação pelas Estrelas', attr: 'PER', forma: 'missao', custo: 'Passar três noites vigiando a torre com ele.' } ] },
  { id: 'turgu_pericia', nome: 'Turgu', lugar: 'Acampamento Orc de Turgu', descricao: 'Negocia tudo, inclusive o que sabe.',
    ensina: [ { pericia: 'Intuição', attr: 'PER', forma: 'troca', custo: 'Contar a ele um segredo verdadeiro.' }, { pericia: 'Negociação', attr: 'CAR', forma: 'troca', custo: 'Qualquer coisa que valha pelo menos 5 ouro.' } ] },
  { id: 'trupe_nazarik', nome: 'Trupe dos Irmãos Volteio', lugar: 'Cidade de Nazarik', descricao: 'Artistas de rua que passam o ano entre Nazarik e os portos do lago.',
    ensina: [ { pericia: 'Acrobacia', attr: 'AGI', forma: 'venda', custo: '3 ouro' },
              { pericia: 'Atuação', attr: 'CAR', forma: 'missao', custo: 'Se apresentar com a trupe numa noite de festa em Nazarik.' },
              { pericia: 'Arte da Fuga', attr: 'AGI', forma: 'troca', custo: 'Um par de algemas ou correntes de verdade, para o número novo.' } ] },
  { id: 'voz_esgotos', nome: 'A Voz dos Esgotos', lugar: 'Esgotos de Verdom', descricao: 'Ninguém viu o rosto dela. Ensina a quem acha o caminho até o ponto de encontro.',
    ensina: [ { pericia: 'Furtividade', attr: 'DEX', forma: 'missao', custo: 'Chegar até ela sem ser visto pelos goblins de Grakk.' },
              { pericia: 'Disfarce', attr: 'APA', forma: 'venda', custo: '5 ouro' },
              { pericia: 'Enganação', attr: 'CAR', forma: 'troca', custo: 'Uma informação sobre alguém importante de Verdom.' },
              { pericia: 'Rumores', attr: 'CAR', forma: 'venda', custo: '2 ouro' } ] },
  { id: 'professor_arcanismo', nome: 'Professor Aurelian', lugar: 'Cidade de Nazarik', descricao: 'Leciona na Academia de Nazarik. Distraído, mas sabe tudo sobre magia.',
    ensina: [ { pericia: 'Arcanismo', attr: 'INT', forma: 'venda', custo: '6 ouro' },
              { pericia: 'Usar Item Mágico', attr: 'INT', forma: 'missao', custo: 'Trazer um item mágico desconhecido para ele estudar (e devolver depois).' },
              { pericia: 'Concentração', attr: 'FDV', forma: 'venda', custo: '4 ouro' } ] },
  { id: 'inspetora_verdom', nome: 'Inspetora Calla', lugar: 'Castelo de Verdom', descricao: 'Investiga crimes para a coroa de Verdom. Desconfia de todo mundo, inclusive de você.',
    ensina: [ { pericia: 'Investigação', attr: 'INT', forma: 'missao', custo: 'Ajudar a resolver um desaparecimento na Cidade Baixa.' },
              { pericia: 'Percepção', attr: 'PER', forma: 'venda', custo: '4 ouro' },
              { pericia: 'Intuição', attr: 'PER', forma: 'venda', custo: '5 ouro' } ] },
  { id: 'estrebaria', nome: 'Estrebaria da Velha Hanna', lugar: 'Fazendas', descricao: 'Cria cavalos para a guarda de Verdom e conversa mais com os bichos do que com gente.',
    ensina: [ { pericia: 'Cavalgar', attr: 'AGI', forma: 'venda', custo: '2 ouro' },
              { pericia: 'Adestrar Animais', attr: 'CAR', forma: 'troca', custo: 'Uma semana de trabalho na fazenda.' } ] },
  { id: 'guia_tundra', nome: 'Guia Serpentariano Ssivor', lugar: 'Tundra de Atrelon', descricao: 'Leva viajantes pelas montanhas. Odeia o frio, mas conhece cada trilha.',
    ensina: [ { pericia: 'Escalar', attr: 'FOR', forma: 'venda', custo: '3 ouro' },
              { pericia: 'Rastreamento', attr: 'PER', forma: 'venda', custo: '4 ouro' } ] },
  { id: 'capitao_bastiao', nome: 'Capitão Theron do Bastião', lugar: 'Bastião dos Heróis', descricao: 'Comanda a pequena guarda do Bastião e estuda as batalhas dos cinco heróis.',
    ensina: [ { pericia: 'Liderança', attr: 'MOR', forma: 'missao', custo: 'Comandar a defesa do Bastião numa noite de ataque.' },
              { pericia: 'Tática de Guerra', attr: 'INT', forma: 'venda', custo: '6 ouro' } ] },
  { id: 'avaliador_korgara', nome: 'Velho Pim, o Avaliador', lugar: 'Costa de Korgara', descricao: 'Sabe o preço de tudo em Korgara, inclusive o das pessoas.',
    ensina: [ { pericia: 'Avaliação', attr: 'INT', forma: 'venda', custo: '4 ouro' },
              { pericia: 'Jogatina', attr: 'CAR', forma: 'troca', custo: 'Ganhar dele uma partida de dados (ou perder 5 ouro tentando).' } ] },
  { id: 'armadilheiro_verde', nome: 'Pitoco, o Armadilheiro', lugar: 'Goblins Verdes', descricao: 'O goblin verde que monta as armadilhas da aldeia. Tem orgulho de nunca ter caído numa.',
    ensina: [ { pericia: 'Desarmar Armadilhas', attr: 'DEX', forma: 'troca', custo: 'Um mecanismo de armadilha dos Goblins Cinzas.' } ] },
  { id: 'faroleira', nome: 'Faroleira Mira', lugar: 'Farol do Grande Lago Central', descricao: 'Mantém a luz acesa há vinte anos e aprendeu a ficar horas sem piscar.',
    ensina: [ { pericia: 'Concentração', attr: 'FDV', forma: 'missao', custo: 'Manter a luz do farol acesa durante uma noite de tempestade.' },
              { pericia: 'Vontade', attr: 'FDV', forma: 'missao', custo: 'Passar uma noite no farol ouvindo o que a névoa sussurra, sem responder.' } ] },
  { id: 'dama_ysolde', nome: 'Dama Ysolde', lugar: 'Reinado de Magnalag', descricao: 'Cuida da loja real e das festas da corte de Magnalag.',
    ensina: [ { pericia: 'Encanto', attr: 'APA', forma: 'venda', custo: '5 ouro' },
              { pericia: 'Etiqueta da Corte', attr: 'APA', forma: 'troca', custo: 'Um tecido raro de Korgara ou de Nazarik.' } ] },
  { id: 'oriane_rumores', nome: 'Mestra-intendente Oriane', lugar: 'Sede da Guilda de Verdom', descricao: 'Sabe de todos os contratos da guilda e de metade dos segredos da cidade.',
    ensina: [ { pericia: 'Rumores', attr: 'CAR', forma: 'venda', custo: '3 ouro' },
              { pericia: 'Negociação', attr: 'CAR', forma: 'missao', custo: 'Fechar um contrato da guilda com lucro.' } ] },
  { id: 'mestre_natacao', nome: 'Os Anões do Casco', lugar: 'Porto Tortuoso (Cidade dos Anões)', descricao: 'Anões que nasceram numa ilha que às vezes afunda. Todos sabem nadar.',
    ensina: [ { pericia: 'Natação', attr: 'FOR', forma: 'venda', custo: '2 ouro' },
              { pericia: 'Navegação', attr: 'PER', forma: 'venda', custo: '3 ouro' } ] },
  { id: 'alquimista_religiao', nome: 'Irmão Tobias', lugar: 'Igreja do Jurgmund', descricao: 'Cuida do relicário da igreja e dos livros sagrados.',
    ensina: [ { pericia: 'História', attr: 'INT', forma: 'venda', custo: '3 ouro' },
              { pericia: 'Religião', attr: 'INT', forma: 'venda', custo: '3 ouro' } ] }
];


/* =========================================================
   PERÍCIAS
   Perícias usam o atributo indicado. Cada perícia aprendida (com um especialista)
   soma +1, e a evolução "Perícia de ATRIBUTO" soma nas perícias daquele atributo.
   somenteTreinada: só pode ser usada por quem aprendeu.
   tambem: nomes parecidos em D&D, Pathfinder e Tormenta.
   ========================================================= */
const PERICIAS = [
  { id: 'atletismo', nome: 'Atletismo', attr: 'FOR', descricao: 'Correr, saltar, empurrar, levantar peso e forçar portas.', usos: [ 'Pular um abismo de 2 hex', 'Arrombar uma porta no ombro', 'Segurar um aliado que está caindo' ], tambem: 'Atletismo (D&D, Tormenta), Força bruta' },
  { id: 'escalar', nome: 'Escalar', attr: 'FOR', descricao: 'Subir paredes, cordas, árvores e encostas.', usos: [ 'Subir a muralha de uma fortaleza', 'Escalar os picos de Atrelon', 'Descer um poço com corda' ], tambem: 'Escalar (Pathfinder), parte de Atletismo (D&D, Tormenta)' },
  { id: 'natacao', nome: 'Natação', attr: 'FOR', descricao: 'Nadar contra a correnteza, mergulhar e resgatar alguém da água.', usos: [ 'Atravessar o rio no Encontro de Turlach', 'Mergulhar atrás de um tesouro', 'Não afundar de armadura leve' ], tambem: 'Natação (Pathfinder), parte de Atletismo (D&D, Tormenta)' },
  { id: 'ferraria', nome: 'Ferraria', attr: 'FOR', descricao: 'Forjar, consertar e reforçar armas e armaduras de metal.', usos: [ 'Consertar uma espada rachada', 'Reforçar um escudo antes da batalha', 'Avaliar a qualidade de uma armadura' ], tambem: 'Ofício: ferreiro (Pathfinder, Tormenta), Ferramentas de ferreiro (D&D)', somenteTreinada: true },
  { id: 'fortitude', nome: 'Fortitude', attr: 'CON', descricao: 'Aguentar veneno, doença, fome, frio, calor e cansaço.', usos: [ 'Resistir ao veneno de uma aranha', 'Marchar dois dias sem dormir', 'Não passar mal no Deserto de Karlach' ], tambem: 'Fortitude (Tormenta, Pathfinder), teste de resistência de Constituição (D&D)' },
  { id: 'sobrevivencia', nome: 'Sobrevivência', attr: 'CON', descricao: 'Achar comida, água e abrigo, e se orientar em lugares selvagens.', usos: [ 'Montar acampamento na tundra', 'Achar água no deserto', 'Prever uma tempestade' ], tambem: 'Sobrevivência (D&D, Pathfinder, Tormenta)' },
  { id: 'furtividade', nome: 'Furtividade', attr: 'DEX', descricao: 'Andar sem ser visto nem ouvido e se esconder.', usos: [ 'Passar pelas Ruínas de Vermilion sem acordar o Devorador', 'Seguir alguém pela Cidade Baixa', 'Se esconder numa emboscada' ], tambem: 'Furtividade (D&D, Pathfinder, Tormenta)' },
  { id: 'prestidigitacao', nome: 'Prestidigitação', attr: 'DEX', descricao: 'Mãos rápidas: bater carteira, esconder objetos e fazer truques.', usos: [ 'Tirar a chave do cinto do carcereiro', 'Trocar um frasco sem ninguém ver', 'Esconder uma adaga na manga' ], tambem: 'Prestidigitação (D&D), Ladinagem (Tormenta), Truques de Mãos (Pathfinder)', somenteTreinada: true },
  { id: 'arrombamento', nome: 'Arrombamento', attr: 'DEX', descricao: 'Abrir fechaduras, cadeados e baús sem a chave.', usos: [ 'Abrir a cela das masmorras de Gornark', 'Abrir um baú trancado', 'Abrir uma porta sem barulho' ], tambem: 'Ladinagem (Tormenta), Desativar Dispositivo (Pathfinder), Ferramentas de ladrão (D&D)', somenteTreinada: true },
  { id: 'desarmar_armadilhas', nome: 'Desarmar Armadilhas', attr: 'DEX', descricao: 'Achar o mecanismo de uma armadilha e desativá-lo.', usos: [ 'Passar pelas Tumbas de Tobi', 'Desarmar um fosso com lâminas', 'Travar uma alavanca' ], tambem: 'Desativar Dispositivo (Pathfinder), Ladinagem (Tormenta), Ferramentas de ladrão (D&D)', somenteTreinada: true },
  { id: 'acrobacia', nome: 'Acrobacia', attr: 'AGI', descricao: 'Equilíbrio, cambalhotas, cair sem se machucar e passar por inimigos.', usos: [ 'Andar numa viga estreita', 'Rolar por baixo de um inimigo', 'Cair de um telhado em pé' ], tambem: 'Acrobacia (D&D, Pathfinder, Tormenta)' },
  { id: 'arte_da_fuga', nome: 'Arte da Fuga', attr: 'AGI', descricao: 'Escapar de cordas, correntes, redes e agarrões.', usos: [ 'Se soltar das correntes do Carcereiro', 'Sair de um Abraço de Urso', 'Passar por uma grade estreita' ], tambem: 'Arte da Fuga (Pathfinder), parte de Acrobacia (D&D, Tormenta)' },
  { id: 'cavalgar', nome: 'Cavalgar', attr: 'AGI', descricao: 'Montar, controlar e lutar em cima de cavalos e outras montarias.', usos: [ 'Galopar numa perseguição', 'Controlar o cavalo assustado', 'Montar a Águia Gigante' ], tambem: 'Cavalgar (Tormenta), Montaria (Pathfinder), Lidar com Animais montado (D&D)' },
  { id: 'reflexos', nome: 'Reflexos', attr: 'AGI', descricao: 'Reagir rápido: pular para longe de explosões, armadilhas e desabamentos.', usos: [ 'Sair do chão que desaba', 'Desviar de uma bomba goblin', 'Pegar um objeto no ar' ], tambem: 'Reflexos (Tormenta, Pathfinder), teste de resistência de Destreza (D&D)' },
  { id: 'arcanismo', nome: 'Arcanismo', attr: 'INT', descricao: 'Conhecer magias, runas, itens mágicos e criaturas mágicas.', usos: [ 'Identificar uma magia sendo lançada', 'Ler as runas do Golem de Ferro', 'Descobrir o que um item mágico faz' ], tambem: 'Arcanismo (D&D), Misticismo (Tormenta), Conhecimento arcano (Pathfinder)' },
  { id: 'historia', nome: 'História', attr: 'INT', descricao: 'Lembrar de reinos, guerras, heróis e lendas.', usos: [ 'Saber quem foi Arcath', 'Reconhecer o brasão de Vermilion', 'Lembrar da Batalha Colossal' ], tambem: 'História (D&D), Conhecimento (Tormenta, Pathfinder)' },
  { id: 'investigacao', nome: 'Investigação', attr: 'INT', descricao: 'Procurar pistas, deduzir o que aconteceu e achar coisas escondidas.', usos: [ 'Achar a porta secreta', 'Descobrir quem mexeu no altar', 'Ligar as pistas de um crime' ], tambem: 'Investigação (D&D, Tormenta), Percepção para busca (Pathfinder)' },
  { id: 'natureza', nome: 'Natureza', attr: 'INT', descricao: 'Conhecer plantas, animais, clima e terrenos.', usos: [ 'Saber se um cogumelo é venenoso', 'Reconhecer pegadas de yeti', 'Achar ervas de cura' ], tambem: 'Natureza (D&D), Conhecimento natureza (Pathfinder), Sobrevivência (Tormenta)' },
  { id: 'religiao', nome: 'Religião', attr: 'INT', descricao: 'Conhecer deuses, cultos, rituais e símbolos sagrados.', usos: [ 'Reconhecer o olho do Deus Marcado', 'Entender os ritos do culto de Jurgmund', 'Saber o que fere um morto-vivo' ], tambem: 'Religião (D&D, Tormenta, Pathfinder)' },
  { id: 'alquimia', nome: 'Alquimia', attr: 'INT', descricao: 'Preparar poções, venenos, ácidos e antídotos.', usos: [ 'Fazer um antídoto', 'Identificar um veneno', 'Preparar fogo alquímico' ], tambem: 'Ofício: alquimia (Pathfinder, Tormenta), Suprimentos de alquimista (D&D)', somenteTreinada: true },
  { id: 'engenharia', nome: 'Engenharia', attr: 'INT', descricao: 'Entender e montar mecanismos, pontes, máquinas e construções.', usos: [ 'Consertar a roda do moinho', 'Achar o ponto fraco de uma muralha', 'Montar uma balista' ], tambem: 'Ofício: engenharia (Pathfinder, Tormenta), Ferramentas de funileiro (D&D)', somenteTreinada: true },
  { id: 'explosivos', nome: 'Explosivos', attr: 'INT', descricao: 'Fazer, colocar e desarmar bombas e pólvora.', usos: [ 'Derrubar um túnel', 'Desarmar uma bomba goblin', 'Abrir uma porta de pedra' ], tambem: 'Ofício: explosivos (Tormenta), Alquimia (Pathfinder)', somenteTreinada: true },
  { id: 'idiomas_antigos', nome: 'Idiomas Antigos', attr: 'INT', descricao: 'Ler e falar línguas mortas, como o élfico antigo e as runas anãs.', usos: [ 'Ler a senha das Sentinelas Élficas', 'Traduzir o diário de Aldren', 'Entender uma placa de Vermilion' ], tambem: 'Linguística (Pathfinder), Conhecimento (Tormenta), Idiomas (D&D)', somenteTreinada: true },
  { id: 'conhecimento_cristais', nome: 'Conhecimento dos Cristais', attr: 'INT', descricao: 'Entender os cristais carmesins do Deus Marcado: onde nascem, o que fazem e como selá-los.', usos: [ 'Saber se um cristal está ativo', 'Perceber que um Aralto passou por ali', 'Achar um fragmento enterrado' ], tambem: 'Perícia própria de Aether', somenteTreinada: true },
  { id: 'avaliacao', nome: 'Avaliação', attr: 'INT', descricao: 'Saber o valor de joias, arte, armas e mercadorias.', usos: [ 'Perceber que o mapa de Korgara é falso', 'Saber quanto vale o tesouro do dragão', 'Pechinchar com base no valor real' ], tambem: 'Avaliação (Pathfinder), Ofício (Tormenta), Investigação (D&D)' },
  { id: 'tatica_guerra', nome: 'Tática de Guerra', attr: 'INT', descricao: 'Planejar batalhas, ler o terreno e prever o movimento do inimigo.', usos: [ 'Escolher o melhor lugar para a emboscada', 'Perceber que o inimigo está recuando de propósito', 'Organizar a defesa de um forte' ], tambem: 'Guerra (Tormenta), Conhecimento: guerra (Pathfinder)' },
  { id: 'usar_item_magico', nome: 'Usar Item Mágico', attr: 'INT', descricao: 'Ativar itens mágicos que não foram feitos para a sua classe.', usos: [ 'Usar uma varinha sendo guerreiro', 'Ativar um pergaminho estranho', 'Descobrir a palavra de comando de um item' ], tambem: 'Usar Instrumento Mágico (Pathfinder), Misticismo (Tormenta), Arcanismo (D&D)', somenteTreinada: true },
  { id: 'medicina', nome: 'Medicina', attr: 'FDV', descricao: 'Tratar feridas, estabilizar quem caiu e cuidar de doentes.', usos: [ 'Estancar um sangramento', 'Estabilizar um aliado caído', 'Tratar a doença do Zumbi' ], tambem: 'Medicina (D&D), Cura (Tormenta, Pathfinder)' },
  { id: 'vontade', nome: 'Vontade', attr: 'FDV', descricao: 'Resistir a medo, controle da mente, sussurros e tentações.', usos: [ 'Resistir ao Sermão do Grande Clérigo', 'Não ceder à Proposta do Arquidemônio', 'Ignorar o Canto da Harpia' ], tambem: 'Vontade (Tormenta, Pathfinder), teste de resistência de Sabedoria (D&D)' },
  { id: 'concentracao', nome: 'Concentração', attr: 'FDV', descricao: 'Manter o foco numa magia ou tarefa mesmo sob pressão.', usos: [ 'Lançar uma magia apanhando', 'Terminar um ritual durante uma tempestade', 'Meditar para recuperar recurso' ], tambem: 'Concentração (Pathfinder 1e), teste de Concentração (D&D), Vontade (Tormenta)' },
  { id: 'percepcao', nome: 'Percepção', attr: 'PER', descricao: 'Ver, ouvir e sentir o que está ao redor.', usos: [ 'Notar a emboscada no Caminho de Planatux', 'Ouvir passos no corredor', 'Perceber o Mímico' ], tambem: 'Percepção (D&D, Pathfinder, Tormenta)' },
  { id: 'rastreamento', nome: 'Rastreamento', attr: 'PER', descricao: 'Seguir pegadas, rastros e sinais de passagem.', usos: [ 'Seguir os goblins até o esconderijo', 'Saber quantos lobos passaram', 'Achar o caminho de volta' ], tambem: 'Sobrevivência para rastrear (D&D, Tormenta, Pathfinder)' },
  { id: 'intuicao', nome: 'Intuição', attr: 'PER', descricao: 'Perceber mentiras, intenções e o clima de uma conversa.', usos: [ 'Perceber que o emissário está mentindo', 'Saber se o mercador está nervoso', 'Sentir que algo está errado' ], tambem: 'Intuição (D&D, Tormenta), Sentir Motivação (Pathfinder)' },
  { id: 'navegacao', nome: 'Navegação', attr: 'PER', descricao: 'Pilotar barcos, ler correntes e ventos, e se orientar no mar.', usos: [ 'Atravessar o Grande Lago Central', 'Fugir de Murlach com o barco', 'Achar a Entrada da Turtumaga' ], tambem: 'Pilotagem (Tormenta), Profissão: marinheiro (Pathfinder), Veículos aquáticos (D&D)' },
  { id: 'navegacao_estrelas', nome: 'Navegação pelas Estrelas', attr: 'PER', descricao: 'Se orientar e saber a hora pelo céu da noite.', usos: [ 'Achar o caminho no deserto à noite', 'Saber quando começa o eclipse', 'Prever o dia de uma conjunção' ], tambem: 'Perícia própria de Aether, parte de Sobrevivência (D&D)', somenteTreinada: true },
  { id: 'persuasao', nome: 'Persuasão', attr: 'CAR', descricao: 'Convencer pela conversa, com argumentos e boas maneiras.', usos: [ 'Convencer o guarda a deixar passar', 'Pedir ajuda a S\'ssara', 'Acalmar uma multidão' ], tambem: 'Persuasão (D&D), Diplomacia (Tormenta, Pathfinder)' },
  { id: 'enganacao', nome: 'Enganação', attr: 'CAR', descricao: 'Mentir, blefar e fingir sem ser pego.', usos: [ 'Fingir ser um Aralto', 'Blefar que tem reforços', 'Contar uma história falsa ao rei' ], tambem: 'Enganação (D&D, Tormenta), Blefar (Pathfinder)' },
  { id: 'atuacao', nome: 'Atuação', attr: 'CAR', descricao: 'Cantar, tocar, dançar, contar histórias e entreter.', usos: [ 'Ganhar dinheiro na taverna', 'Distrair os guardas com uma apresentação', 'Fazer o Guardião Risonho rir' ], tambem: 'Atuação (D&D, Tormenta, Pathfinder)' },
  { id: 'negociacao', nome: 'Negociação', attr: 'CAR', descricao: 'Pechinchar, fechar acordos e trocar favores.', usos: [ 'Baixar o preço na loja', 'Convencer Turgu a não lutar', 'Negociar a recompensa de uma missão' ], tambem: 'Diplomacia (Tormenta, Pathfinder), Persuasão (D&D)' },
  { id: 'adestrar_animais', nome: 'Adestrar Animais', attr: 'CAR', descricao: 'Acalmar, treinar e comandar animais.', usos: [ 'Acalmar o mamute', 'Treinar um cão de guarda', 'Fazer a águia obedecer' ], tambem: 'Adestramento (Tormenta), Lidar com Animais (D&D, Pathfinder)' },
  { id: 'jogatina', nome: 'Jogatina', attr: 'CAR', descricao: 'Apostar, jogar dados e cartas, e perceber trapaças.', usos: [ 'Ganhar uma aposta em Korgara', 'Perceber o dado viciado', 'Ganhar informação numa mesa de jogo' ], tambem: 'Jogatina (Tormenta), Profissão: jogador (Pathfinder), Jogos (D&D)' },
  { id: 'rumores', nome: 'Rumores', attr: 'CAR', descricao: 'Ouvir boatos e descobrir coisas conversando com as pessoas certas.', usos: [ 'Descobrir onde está o Aralto', 'Saber quem compra cristais carmesins', 'Achar um contato nos esgotos' ], tambem: 'Diplomacia para obter informação (Pathfinder), Investigação (Tormenta)' },
  { id: 'intimidacao', nome: 'Intimidação', attr: 'MOR', descricao: 'Assustar, ameaçar e impor respeito.', usos: [ 'Fazer o bandido entregar o chefe', 'Encarar o Campeão de Lonk-Carn', 'Espantar os goblins sem lutar' ], tambem: 'Intimidação (D&D, Pathfinder, Tormenta)' },
  { id: 'lideranca', nome: 'Liderança', attr: 'MOR', descricao: 'Comandar, inspirar e manter um grupo unido sob pressão.', usos: [ 'Segurar a linha quando todos querem fugir', 'Comandar os guardas de um forte', 'Dar coragem a aldeões' ], tambem: 'Guerra/Nobreza (Tormenta), Liderança (Pathfinder)' },
  { id: 'disfarce', nome: 'Disfarce', attr: 'APA', descricao: 'Mudar a aparência para se passar por outra pessoa.', usos: [ 'Entrar no castelo como servo', 'Parecer um fiel do culto', 'Esconder as escamas de um serpentariano' ], tambem: 'Disfarce (Pathfinder), Enganação (Tormenta), Kit de disfarce (D&D)' },
  { id: 'etiqueta_corte', nome: 'Etiqueta da Corte', attr: 'APA', descricao: 'Saber se vestir, falar e agir diante de nobres e reis.', usos: [ 'Falar com o rei Vassk sem ofendê-lo', 'Participar de um banquete em Verdom', 'Reconhecer a hierarquia de uma corte' ], tambem: 'Nobreza (Tormenta), Conhecimento: nobreza (Pathfinder), História (D&D)' },
  { id: 'encanto', nome: 'Encanto', attr: 'APA', descricao: 'Causar boa primeira impressão, seduzir e ganhar simpatia.', usos: [ 'Conseguir um quarto numa estalagem cheia', 'Chamar a atenção certa num baile', 'Fazer um NPC gostar de você' ], tambem: 'Persuasão (D&D), Diplomacia (Tormenta, Pathfinder)' }
];


/* =========================================================
   MISSÕES
   etapas.tipo: exploracao | combate | armadilha | puzzle | bencao | maldicao | social | raro | chefe
   armadilha: teste e falha. puzzle: enigma e solucao (só para o mestre). raro: chance (%) de aparecer.
   recompensas: itens [{ id, chance? }], magias [ids], pericias [nomes], dinheiro (em bronze), extra (texto)
   ========================================================= */
const TIPOS_ETAPA = {
  exploracao: { nome: 'Exploração', ic: '🧭' }, combate: { nome: 'Combate', ic: '⚔️' }, armadilha: { nome: 'Armadilha', ic: '🪤' },
  puzzle: { nome: 'Enigma', ic: '🧩' }, bencao: { nome: 'Bênção', ic: '✨' }, maldicao: { nome: 'Maldição', ic: '☠️' },
  social: { nome: 'Social', ic: '🗣️' }, raro: { nome: 'Inimigo raro', ic: '💎' }, chefe: { nome: 'Chefe', ic: '👑' }
};
const MISSOES = [
  { id: 'anel_marta', nome: 'O Anel Roubado', lugar: 'Esgotos de Verdom', nivel: 3, dificuldade: 2, npc: { nome: 'Marta Dedos-Leves', descricao: 'Ex-ladra da Cidade Baixa. Diz que o anel é uma lembrança; na verdade, é a chave de um cofre.' }, gancho: 'Os goblins de Grakk roubaram um anel de Marta. Ela ensina Prestidigitação a quem trouxer o anel de volta, sem abri-lo.', etapas: [ { tipo: 'exploracao', titulo: 'Descida pelos bueiros', texto: 'Os esgotos sob a Cidade Baixa são um labirinto. Um teste de PER encontra marcas de giz goblin que apontam o caminho.' }, { tipo: 'armadilha', titulo: 'Fosso de lodo', texto: 'Uma passarela podre sobre um fosso.', teste: 'DEX para atravessar', falha: 'Cai no lodo: 2d10 × nível e perde o próximo turno saindo.' }, { tipo: 'combate', titulo: 'Sentinelas', texto: 'Goblins de guarda na entrada do salão de Grakk.', inimigos: [ 'goblin', 'rato_gigante' ] }, { tipo: 'puzzle', titulo: 'As três comportas', texto: 'Três válvulas controlam a água do salão. Abrir na ordem errada inunda a sala.', enigma: 'Na parede, alguém escreveu: "Primeiro o que sobe, depois o que desce, por último o que nunca para."', solucao: 'Abrir a válvula do cano que vai para o teto, depois a do chão, e por último a do rio (a água que nunca para).' }, { tipo: 'raro', titulo: 'O Rei dos Ratos', texto: 'Se o grupo fizer muito barulho, o Rei dos Ratos aparece e ataca todos, inclusive os goblins.', inimigos: [ 'rei_dos_ratos' ], chance: 25 }, { tipo: 'chefe', titulo: 'O trono de lata', texto: 'Grakk usa o anel como parte da coroa.', inimigos: [ 'grakk' ] } ], recompensas: { pericias: [ 'Prestidigitação' ], magias: [ 'enxame_ratos' ], itens: [ { id: 'estilete_sombrio' } ], dinheiro: 300, extra: 'Se o anel for aberto, Marta nunca mais confia no grupo, mas o cofre dela está cheio.' } },
  { id: 'queda_de_braco', nome: 'A Queda de Braço de Grukka', lugar: 'Grande Cidade Orc Lonk-Carn', nivel: 4, dificuldade: 2, npc: { nome: 'Mestre de Guerra Grukka', descricao: 'Treina os guerreiros da capital. Respeita quem aguenta apanhar.' }, gancho: 'Grukka só ensina a quem sobreviver a três rodadas de treino e ganhar uma queda de braço na frente do mercado.', etapas: [ { tipo: 'combate', titulo: 'Três rodadas', texto: 'Luta de treino contra orcs da guarda. Ninguém morre: quem cai, perde a rodada.', inimigos: [ 'orc', 'xama_orc' ] }, { tipo: 'social', titulo: 'A multidão', texto: 'Um teste de MOR (Intimidação) ou CAR faz a multidão torcer pelo grupo: +1 no próximo teste.' }, { tipo: 'bencao', titulo: 'Grito dos antepassados', texto: 'Se o grupo vencer as três rodadas, o Xamã-Mor abençoa o vencedor: +1 FOR até o fim da sessão.' }, { tipo: 'social', titulo: 'A queda de braço', texto: 'Teste de FOR contra Grukka (FOR 6). Três vitórias antes de três derrotas.' } ], recompensas: { pericias: [ 'Atletismo', 'Fortitude' ], itens: [ { id: 'talisma_presas_orc' } ], dinheiro: 0, extra: 'Grukka passa a chamar o vencedor de "irmão de braço". Os preços do Mercado de Guerra caem 10%.' } },
  { id: 'aranhas_vernand', nome: 'Os Lenhadores Sumidos', lugar: 'Florestas de Vernand', nivel: 6, dificuldade: 3, npc: { nome: 'Guarda-florestal Aldric', descricao: 'Conhece as trilhas de Vernand, inclusive as das terras perdidas.' }, gancho: 'Lenhadores de Vernand estão sumindo perto da fronteira com Verdom. Aldric acha que são aranhas, e que Verdom não vai mandar ajuda.', etapas: [ { tipo: 'exploracao', titulo: 'Rastros na mata', texto: 'Teste de PER (Rastreamento) segue os fios de teia até o ninho. Falhar custa um dia e um encontro com lobos.', inimigos: [ 'lobo' ] }, { tipo: 'bencao', titulo: 'O santuário da clareira', texto: 'Uma pedra antiga coberta de musgo. Quem deixar uma oferenda ganha +1 PER até o fim da missão.' }, { tipo: 'armadilha', titulo: 'Cortina de teia', texto: 'Fios invisíveis entre as árvores.', teste: 'PER para ver, DEX para passar', falha: 'Preso, e 2 Aranhas Gigantes descem.' }, { tipo: 'combate', titulo: 'A guarda do ninho', texto: 'Aranhas protegem os casulos.', inimigos: [ 'aranha_gigante' ] }, { tipo: 'chefe', titulo: 'A Rainha', texto: 'Os lenhadores estão nos casulos. Cada turno de luta, role 1d10: com 1, um casulo para de se mexer.', inimigos: [ 'rainha_aranhas' ] } ], recompensas: { pericias: [ 'Rastreamento' ], magias: [ 'teia_rainha' ], itens: [ { id: 'arco_guarda_vernand' }, { id: 'manto_seda_rainha', chance: 40 } ], dinheiro: 5000, extra: 'O senhor de Vernand fica devendo um favor ao grupo.' } },
  { id: 'luz_verde', nome: 'A Luz Verde', lugar: 'Farol da Perdição', nivel: 6, dificuldade: 3, npc: { nome: 'Velho Baleeiro Ossk', descricao: 'Perdeu um braço para Murlach e o filho para o Farol da Perdição.' }, gancho: 'O filho de Ossk afundou seguindo a luz verde. Ele quer o farol apagado para sempre.', etapas: [ { tipo: 'armadilha', titulo: 'A escada podre', texto: 'A escada em espiral do farol tem degraus soltos.', teste: 'DEX ou AGI em três pontos da subida', falha: 'Cai 2 andares: 2d10 × nível.' }, { tipo: 'maldicao', titulo: 'A voz do mar', texto: 'Quem olhar para a luz sem proteger os olhos faz teste de FDV. Falha: até o fim da missão, ouve o mar e tem −1 em testes de PER.' }, { tipo: 'puzzle', titulo: 'Os espelhos da lanterna', texto: 'A luz é feita de quatro espelhos que giram. Só dá para apagá-la virando todos para dentro.', enigma: 'Cada espelho tem uma palavra: MAR, PEDRA, CASA, NAVIO. Uma placa diz: "Guie cada um para o lugar de onde nunca deveria ter saído."', solucao: 'NAVIO para o mar, PEDRA para a costa, CASA para a terra e MAR para o próprio mar: todos virados para dentro da lanterna, apagando a luz.' }, { tipo: 'chefe', titulo: 'O faroleiro', texto: 'Ele sobe as escadas quando a luz começa a apagar.', inimigos: [ 'faroleiro_afogado' ] } ], recompensas: { pericias: [ 'Navegação' ], itens: [ { id: 'lanterna_perdicao', chance: 100 } ], dinheiro: 3000, extra: 'Ossk dá ao grupo o mapa das correntes da costa: +2 em testes de Navegação perto de Kurnamin.' } },
  { id: 'cacador_fragmentos_m', nome: 'Os Cristais do Lago', lugar: 'Lago Corrompido', nivel: 9, dificuldade: 3, npc: { nome: 'Alquimista Seraph', descricao: 'Estuda os cristais carmesins na Cidade de Karlach, com luvas de três camadas.' }, gancho: 'Alguém está tirando cristais do Lago Corrompido. Seraph quer uma amostra de sangue carmesim e quer saber quem é.', etapas: [ { tipo: 'exploracao', titulo: 'A margem vermelha', texto: 'Pegadas de botas finas na lama. Teste de INT (Conhecimento dos Cristais) mostra que alguém sabe exatamente onde cavar.' }, { tipo: 'armadilha', titulo: 'Cristais instáveis', texto: 'A margem está cheia de cristais que explodem quando pisados.', teste: 'PER para ver, DEX para desviar', falha: '3d10 × nível e 1 Marca Carmesim.' }, { tipo: 'combate', titulo: 'O que vive na água', texto: 'As sanguessugas atacam quem entra no lago.', inimigos: [ 'sanguessuga_carmesim' ] }, { tipo: 'raro', titulo: 'O Caçador', texto: 'Um Aralto colhe cristais do outro lado do lago. Se o grupo for visto, ele foge com os fragmentos.', inimigos: [ 'cacador_fragmentos' ], chance: 60 }, { tipo: 'maldicao', titulo: 'Água carmesim', texto: 'Quem ficar mais de 3 turnos na água ganha 1 Marca Carmesim por turno, que não sai com cura comum até o fim da missão.' } ], recompensas: { pericias: [ 'Conhecimento dos Cristais' ], magias: [ 'rastro_carmesim' ], itens: [ { id: 'bussola_carmesim', chance: 40 } ], dinheiro: 8000, extra: 'Se o grupo pegar a bolsa do Caçador, descobre que os fragmentos iam para o Castelo do Grande Clérigo.' } },
  { id: 'lasca_casco', nome: 'A Lasca do Casco', lugar: 'Subterrâneo do Casco', nivel: 10, dificuldade: 4, npc: { nome: 'Rúnico Barruk', descricao: 'Gravador de runas dos anões do casco de Porto Tortuoso.' }, gancho: 'Barruk precisa de uma lasca do casco da Tartaruga para gravar a runa da Invulnerabilidade. A lasca só pode ser tirada lá de dentro.', etapas: [ { tipo: 'exploracao', titulo: 'As frestas do casco', texto: 'Os túneis mudam de forma quando a Tartaruga se mexe. Teste de PER a cada hora para não se perder.' }, { tipo: 'combate', titulo: 'Carrapatos', texto: 'Caem do teto em grupos.', inimigos: [ 'carrapato_do_casco' ] }, { tipo: 'armadilha', titulo: 'O mergulho', texto: 'A Tartaruga mergulha: os túneis inundam em 3 turnos.', teste: 'FOR (Natação) ou achar uma bolha de ar com PER', falha: '3d10 × nível de afogamento e o grupo é levado para outro túnel.' }, { tipo: 'bencao', titulo: 'O coração da Tartaruga', texto: 'Numa câmara quente, dá para ouvir o coração dela. Quem descansar ali recupera toda a vida e ganha a Bênção da Tartaruga por 1 dia.' }, { tipo: 'chefe', titulo: 'O Verme', texto: 'O Verme do Casco guarda a parte mais contaminada do casco.', inimigos: [ 'verme_do_casco' ] } ], recompensas: { magias: [ 'invulnerabilidade', 'bencao_tartaruga' ], itens: [ { id: 'bencao_casco', chance: 100 }, { id: 'nucleo_contaminado', chance: 30 } ], dinheiro: 20000, extra: 'O rei de Magnalag passa a considerar o grupo amigo da ilha.' } },
  { id: 'piada_tobi', nome: 'A Piada de Tobi', lugar: 'Tumbas de Tobi', nivel: 10, dificuldade: 3, npc: { nome: 'Pitoco, o Armadilheiro', descricao: 'Goblin verde que jura que Tobi é o avô do avô do avô dele.' }, gancho: 'Pitoco quer que o grupo entre nas Tumbas de Tobi e traga "a piada que Tobi deixou para os netos". Ninguém sabe o que isso quer dizer.', etapas: [ { tipo: 'armadilha', titulo: 'O corredor das lâminas', texto: 'Lâminas saem das paredes a cada passo errado.', teste: 'PER para ver o padrão, DEX para passar', falha: '2d10 × nível por lâmina, até 3.' }, { tipo: 'armadilha', titulo: 'A porta que ri', texto: 'Uma porta com um sorriso de pedra. Tocar sem responder a pergunta dispara dardos envenenados.', teste: 'CAR ou INT', falha: 'Veneno: 1d10 × nível por 3 turnos.' }, { tipo: 'puzzle', titulo: 'O enigma da porta', texto: 'A porta pergunta.', enigma: '"Quanto mais você tira de mim, maior eu fico. O que eu sou?"', solucao: 'Um buraco (ou um fosso). Dizer a resposta, ou cavar um buraco no chão na frente dela, abre a porta.' }, { tipo: 'maldicao', titulo: 'O riso contagioso', texto: 'Quem pegar qualquer objeto da tumba sem pedir desculpas a Tobi em voz alta começa a rir sem parar: −2 em testes de Furtividade até o fim da sessão.' }, { tipo: 'chefe', titulo: 'O Guardião Risonho', texto: 'Ele só luta se ninguém fizer ele rir.', inimigos: [ 'guardiao_risonho' ] } ], recompensas: { pericias: [ 'Desarmar Armadilhas' ], itens: [ { id: 'botas_armadilheiro', chance: 100 }, { id: 'bolsa_sem_fundo', chance: 10 }, { id: 'faca_sorridente', chance: 5 } ], dinheiro: 5000, extra: 'A "piada" é uma carta de Tobi dizendo que nunca morreu. Os goblins das duas tribos vão querer saber disso.' } },
  { id: 'salao_espelhos', nome: 'O Salão dos Espelhos', lugar: 'Ruína Élfica', nivel: 11, dificuldade: 4, npc: { nome: 'Tharion, o último elfo', descricao: 'Escondido nas margens do Grande Lago. Fala pouco e desconfia de todos.' }, gancho: 'Tharion pede que o grupo recupere uma memória élfica guardada no Salão dos Espelhos. Ele não pode ir: as sentinelas o reconheceriam, e os Araltos o encontrariam.', etapas: [ { tipo: 'combate', titulo: 'As sentinelas', texto: 'Guardam a entrada. Com a senha que Tharion ensina, não atacam.', inimigos: [ 'sentinela_elfica' ] }, { tipo: 'puzzle', titulo: 'A luz dos espelhos', texto: 'O salão é escuro. Cinco espelhos móveis e uma janela de luz.', enigma: 'Na parede, em élfico antigo: "Só a luz que passa por todos os olhos acorda a memória."', solucao: 'Girar os cinco espelhos para que o raio de sol passe por todos antes de chegar no espelho central. Um teste de Idiomas Antigos lê a frase; sem ela, o grupo tenta às cegas.' }, { tipo: 'bencao', titulo: 'A memória élfica', texto: 'Quem tocar o espelho central vê o Domínio dos Elfos por um instante: +1 INT até o fim da sessão e uma pista sobre os Vasos do Passado.' }, { tipo: 'chefe', titulo: 'O Guardião', texto: 'Só a luz refletida pelos espelhos o fere com magia.', inimigos: [ 'guardiao_espelhos' ] } ], recompensas: { pericias: [ 'Idiomas Antigos' ], magias: [ 'espelho_magico' ], itens: [ { id: 'espelho_guardiao', chance: 35 } ], dinheiro: 0, extra: 'Tharion passa a confiar no grupo e revela onde fica um dos Marcos dos Heróis.' } },
  { id: 'senhor_afogados_m', nome: 'Os Sinos Submersos', lugar: 'Pântanos de Vermilion', nivel: 12, dificuldade: 4, npc: { nome: 'Mestre-arpoador Vel', descricao: 'Comanda o Arsenal de Kurnamin.' }, gancho: 'Sinos tocam debaixo da água nos Pântanos de Vermilion, e pescadores de Kurnamin andam até o pântano dormindo. Vel quer os sinos calados.', etapas: [ { tipo: 'exploracao', titulo: 'A procissão', texto: 'À noite, pescadores sonâmbulos entram no pântano. Segui-los sem acordá-los leva ao reino debaixo da lama.' }, { tipo: 'combate', titulo: 'Sapos-boi e afogados', texto: 'A lama está cheia.', inimigos: [ 'sapo_boi_pantano', 'zumbi' ] }, { tipo: 'maldicao', titulo: 'Água negra', texto: 'Enquanto estiverem no pântano, curas recuperam só metade.' }, { tipo: 'puzzle', titulo: 'Os sinos', texto: 'Sete sinos de bronze, cada um com um nome de navio afundado.', enigma: 'O diário de bordo encharcado (do Farol da Perdição) lista os navios na ordem em que afundaram.', solucao: 'Tocar os sinos na ordem inversa, do último navio ao primeiro, "devolve" os afogados e cala os sinos. Sem o diário, cada erro chama mais 2 Zumbis.' }, { tipo: 'chefe', titulo: 'O Senhor dos Afogados', texto: 'Sobe da lama quando os sinos param.', inimigos: [ 'senhor_afogados' ] } ], recompensas: { pericias: [ 'Natação' ], magias: [ 'cancao_afogados' ], itens: [ { id: 'tridente_afogados', chance: 40 }, { id: 'arpao_kurnamin', chance: 100 } ], dinheiro: 15000, extra: 'Kurnamin dá ao grupo passagem livre nos barcos da cidade.' } },
  { id: 'diario_aldren_m', nome: 'O Diário de Aldren', lugar: 'Ruínas Grúticas', nivel: 12, dificuldade: 4, npc: { nome: 'O Astromante', descricao: 'Estuda as estrelas na Torre de Observação Estelar.' }, gancho: 'O Astromante ensina A Última Estrela de Aldren a quem trouxer o diário do astrônomo louco. Ele sabe que Aldren morreu nas Ruínas Grúticas, contando estrelas.', etapas: [ { tipo: 'combate', titulo: 'As estátuas acordam', texto: 'As gárgulas das ruínas não gostam de visitas.', inimigos: [ 'gargula_grutica' ] }, { tipo: 'puzzle', titulo: 'O céu de pedra', texto: 'Numa câmara, o teto é um mapa de estrelas com um buraco onde falta uma.', enigma: 'Aldren escreveu na parede: "Eram mil e uma. Contei mil. Onde está a que falta?"', solucao: 'A estrela que falta é a que caiu: apontar o buraco no teto e dizer "mil e uma". Essa é a Conta Certa que acalma a Sombra de Aldren.' }, { tipo: 'bencao', titulo: 'Poeira de estrela', texto: 'Onde a estrela caiu, o chão brilha. Quem tocar recupera todos os usos de magias por dia.' }, { tipo: 'chefe', titulo: 'A Sombra de Aldren', texto: 'Continua contando. Se ouvir a Conta Certa, para de lutar.', inimigos: [ 'sombra_aldren' ] } ], recompensas: { magias: [ 'ultima_estrela', 'palavra_de_poder' ], itens: [ { id: 'diario_aldren', chance: 60 }, { id: 'luneta_aldren', chance: 25 } ], dinheiro: 0, extra: 'O Astromante passa a avisar o grupo de todo eclipse.' } },
  { id: 'areia_ampulheta', nome: 'A Areia da Ampulheta', lugar: 'Ruínas da Antiga Cidade', nivel: 14, dificuldade: 4, npc: { nome: 'O Eremita do Castelo Solitário', descricao: 'Ninguém sabe o nome dele. O relógio do castelo anda para trás.' }, gancho: 'O Eremita quer areia de uma ampulheta quebrada das Ruínas da Antiga Cidade. Em troca, ensina a Pressa Maior.', etapas: [ { tipo: 'armadilha', titulo: 'Areia movediça', texto: 'O pátio da cidade antiga afunda.', teste: 'AGI (Acrobacia) ou FOR', falha: 'Afunda até o peito: preso e 1d10 × nível por turno até alguém puxar.' }, { tipo: 'combate', titulo: 'Os servos do rei', texto: 'Mortos-vivos guardam o caminho para o palácio.', inimigos: [ 'esqueleto', 'carnical_marcado' ] }, { tipo: 'raro', titulo: 'O Soberano acorda', texto: 'Se o grupo passar pela sala do trono, o Soberano Enterrado se levanta.', inimigos: [ 'soberano_enterrado' ], chance: 40 }, { tipo: 'puzzle', titulo: 'A sala das ampulhetas', texto: 'Doze ampulhetas, cada uma com uma hora. Só uma porta abre, na hora certa.', enigma: 'Uma inscrição: "O rei morreu quando a sombra do trono tocou a porta. Desde então, é sempre essa hora."', solucao: 'Observar a sombra do trono (teste de PER) e virar a ampulheta da hora que ela marca: a sexta. As outras disparam a areia do tempo (−1 ação no próximo turno).' }, { tipo: 'chefe', titulo: 'O Golem da Ampulheta', texto: 'Guarda a Ampulheta Partida.', inimigos: [ 'golem_ampulheta' ] } ], recompensas: { magias: [ 'pressa_maior', 'voltar_tempo' ], itens: [ { id: 'ampulheta_partida', chance: 25 } ], dinheiro: 30000, extra: 'O Eremita revela que já foi o rei da cidade antiga. Ou que é o filho dele. Ele muda a história toda vez.' } },
  { id: 'eclipse', nome: 'A Noite do Eclipse', lugar: 'Torre de Observação Estelar', nivel: 15, dificuldade: 5, npc: { nome: 'O Astromante', descricao: 'Estuda as estrelas e sabe coisas demais sobre a que caiu.' }, gancho: 'Um eclipse vem aí. O Astromante precisa de gente para proteger a torre enquanto ele observa, e promete ensinar o Julgamento Celeste.', etapas: [ { tipo: 'exploracao', titulo: 'Preparar a torre', texto: 'O grupo tem uma tarde para montar defesas. Cada teste bem-sucedido (Engenharia, Arcanismo, Tática de Guerra) dá +1 turno de luz no topo.' }, { tipo: 'combate', titulo: 'As sombras menores', texto: 'Com o céu escurecendo, criaturas sobem a colina.', inimigos: [ 'espreitador_obscuro' ] }, { tipo: 'bencao', titulo: 'A luz das estrelas', texto: 'Enquanto o espelho do topo estiver aceso, magias de Luz e sagradas causam +1d10.' }, { tipo: 'chefe', titulo: 'A Fera do Eclipse', texto: 'O eclipse dura 6 turnos. Se ela apagar o espelho 3 vezes, a torre escurece para sempre.', inimigos: [ 'fera_eclipse' ] } ], recompensas: { magias: [ 'julgamento_celeste', 'olhar_eclipse' ], itens: [ { id: 'lamina_eclipse', chance: 40 } ], dinheiro: 50000, extra: 'O Astromante mostra ao grupo onde vai cair a próxima estrela.' } },
  { id: 'cinco_marcos', nome: 'Os Cinco Marcos dos Heróis', lugar: 'Bastião dos Heróis', nivel: 20, dificuldade: 5, npc: { nome: 'A Guardiã do Bastião', descricao: 'Guarda a memória dos cinco heróis da Primeira Era.' }, gancho: 'Para aprender a Coroa do Rei-Sol, o grupo precisa visitar os cinco Marcos dos Heróis espalhados por Akaen e trazer um sinal de cada. Os Araltos também querem os sinais.', etapas: [ { tipo: 'puzzle', titulo: 'Marco de Arcath', texto: 'Um livro de pedra que só abre para quem ensinar algo a alguém ali, na hora.', enigma: 'A inscrição diz: "O que dei de graça me fez mais rica."', solucao: 'Conhecimento. Um herói precisa ensinar uma perícia ou magia a um aliado ou NPC diante do marco.' }, { tipo: 'combate', titulo: 'Marco de Valdris', texto: 'Um campo de batalha antigo. Os ecos dos soldados testam a coragem do grupo.', inimigos: [ 'juramentado_deus_humano' ] }, { tipo: 'armadilha', titulo: 'Marco de Ferrath', texto: 'Um alvo a 30 hex, no alto de um penhasco.', teste: 'Um único tiro ou magia de ataque à distância que acerte', falha: 'Quem errar cai do penhasco: 3d10 × nível.' }, { tipo: 'maldicao', titulo: 'Marco de Sombrath', texto: 'Uma sala escura onde a própria sombra ataca o dono. Quem falhar num teste de FDV luta contra uma cópia de si mesmo.' }, { tipo: 'bencao', titulo: 'Marco de Sanctum', texto: 'Uma fonte que só cura quem já curou um inimigo. Quem puder beber recupera tudo e remove todas as maldições.' }, { tipo: 'chefe', titulo: 'A emboscada', texto: 'Na volta ao Bastião, os Araltos atacam para roubar os sinais.', inimigos: [ 'aralto_anciao', 'cavaleiro_carmesim' ] } ], recompensas: { magias: [ 'coroa_rei_sol', 'guardiao_celestial' ], itens: [ { id: 'anel_cinco_marcos', chance: 100 }, { id: 'estandarte_bastiao', chance: 100 }, { id: 'grimorio_arcath', chance: 50 }, { id: 'simbolo_sanctum', chance: 50 } ], dinheiro: 0, extra: 'O grupo passa a ser conhecido como herdeiros dos cinco. Isso abre portas, e põe alvos nas costas.' } }
];


/* =========================================================
   DUNGEONS
   tipo: caverna | ruina | templo | cidade | fosso | cidade_subterranea
   salas: { id, nome, tipo, x, y (posição no mapa), texto, inimigos?, teste?, falha?, tesouro? { dinheiro (bronze), itens [{ id, chance? }] },
            efeito? (bênção, maldição, descanso), enigma?, solucao?, segredo?, oculta? (passagem secreta) }
   tipos de sala: entrada, exploracao, combate, armadilha, tesouro, bencao, maldicao, segredo, enigma, descanso, social, chefe
   conexoes: [salaA, salaB, rótulo opcional]
   imagem (opcional): mapa desenhado; cada sala usa px e py (% da largura e da altura da imagem) para o marcador
   npc (opcional): quem oferece a dungeon, com lugar, gancho, dicas e recompensa
   ========================================================= */
const TIPOS_DUNGEON = {
  caverna:            { nome: 'Caverna',            ic: '🪨' },
  ruina:              { nome: 'Ruína',              ic: '🏚️' },
  templo:             { nome: 'Templo',             ic: '🛕' },
  cidade:             { nome: 'Cidade',             ic: '🏘️' },
  fosso:              { nome: 'Fosso',              ic: '🕳️' },
  cidade_subterranea: { nome: 'Cidade subterrânea', ic: '⛏️' }
};
const TIPOS_SALA = {
  entrada:   { nome: 'Entrada',     ic: '🚪' }, exploracao: { nome: 'Exploração', ic: '🧭' }, combate: { nome: 'Combate', ic: '⚔️' },
  armadilha: { nome: 'Armadilha',   ic: '🪤' }, tesouro:    { nome: 'Tesouro',    ic: '💰' }, bencao:  { nome: 'Bênção',  ic: '✨' },
  maldicao:  { nome: 'Maldição',    ic: '☠️' }, segredo:    { nome: 'Segredo',    ic: '📜' }, enigma:  { nome: 'Enigma',  ic: '🧩' },
  descanso:  { nome: 'Descanso',    ic: '🔥' }, social:     { nome: 'Encontro',   ic: '🗣️' }, chefe:   { nome: 'Chefe',   ic: '👑' }
};
// Eventos aleatórios por tipo de dungeon, rolados em 1d10: [mínimo, máximo, texto, inimigos?]
const EVENTOS_DUNGEON = { caverna: [ { min: 1, max: 4, texto: 'Nada: só o som da água pingando.' }, { min: 5, max: 6, texto: 'Um tremor solta pedras do teto: teste de DEX ou 1d10 × nível.' }, { min: 7, max: 8, texto: 'Morcegos acordam e atacam.', inimigos: [ 'morcego_gigante', 'morcego_gigante' ] }, { min: 9, max: 9, texto: 'Um bicho saiu da toca.', inimigos: [ 'urso_pardo' ] }, { min: 10, max: 10, texto: 'Uma bolsa esquecida numa fenda: 2d10 prata.' } ], ruina: [ { min: 1, max: 4, texto: 'Nada além de poeira e ecos.' }, { min: 5, max: 6, texto: 'Um pedaço do teto desaba: teste de AGI ou 2d10 × nível.' }, { min: 7, max: 8, texto: 'Mortos da ruína se levantam.', inimigos: [ 'esqueleto', 'zumbi' ] }, { min: 9, max: 9, texto: 'Algo gelatinoso bloqueia o corredor.', inimigos: [ 'cubo_gelatinoso' ] }, { min: 10, max: 10, texto: 'Uma moeda antiga no chão: vale 1d10 ouro para colecionadores.' } ], templo: [ { min: 1, max: 4, texto: 'Silêncio. Só as velas apagadas.' }, { min: 5, max: 6, texto: 'Um sussurro em língua antiga: teste de FDV ou fica com medo por 1 turno.' }, { min: 7, max: 8, texto: 'Guardiões do templo aparecem.', inimigos: [ 'sentinela_elfica' ] }, { min: 9, max: 9, texto: 'Um espírito vem ver quem entrou.', inimigos: [ 'banshee' ] }, { min: 10, max: 10, texto: 'Uma oferenda antiga esquecida: um item comum à escolha do mestre.' } ], cidade: [ { min: 1, max: 4, texto: 'Ninguém na rua.' }, { min: 5, max: 6, texto: 'A guarda passa. Teste de DEX (Furtividade) ou é preciso explicar o que o grupo faz ali.' }, { min: 7, max: 8, texto: 'Salteadores atacam.', inimigos: [ 'bandido', 'bandido' ] }, { min: 9, max: 9, texto: 'Um fiel do culto vigia a rua.', inimigos: [ 'cultista' ] }, { min: 10, max: 10, texto: 'Um bêbado dá uma pista sem querer.' } ], fosso: [ { min: 1, max: 4, texto: 'A escuridão continua.' }, { min: 5, max: 6, texto: 'Uma corrente puxa para baixo: teste de FOR ou desce um nível sem querer.' }, { min: 7, max: 8, texto: 'Algo sobe do fundo.', inimigos: [ 'sanguessuga_carmesim' ] }, { min: 9, max: 9, texto: 'Tentáculos saem da parede.', inimigos: [ 'carne_errante' ] }, { min: 10, max: 10, texto: 'Um brilho na parede: uma lasca de material raro.' } ], cidade_subterranea: [ { min: 1, max: 4, texto: 'Os túneis estão vazios.' }, { min: 5, max: 6, texto: 'Uma porta se fecha sozinha atrás do grupo.' }, { min: 7, max: 8, texto: 'Ratos e goblins disputam um corredor.', inimigos: [ 'rato_gigante', 'goblin' ] }, { min: 9, max: 9, texto: 'Um prisioneiro fugido ataca por desespero.', inimigos: [ 'orc_sem_cla' ] }, { min: 10, max: 10, texto: 'Um esconderijo de contrabando: 3d10 prata.' } ] };
const DUNGEONS = [
  { id: 'ruinas_valgor', nome: 'As Ruínas de Valgor', tipo: 'ruina', dificuldade: 5, nivel: 16, lugar: 'Ruínas do Deus-Humano', imagem: 'mapas/dungeons/ruinas_de_valgor.jpg', proporcao: 0.9138719512195121, descricao: 'O caminho para o que restou dos deuses. Salas suspensas sobre o abismo, ligadas por pontes quebradas, onde Valgor, o semideus dos humanos, se despedaçou. Cada sala é um teste. Cada caminho, uma escolha. E no fim, apenas um será lembrado.', segredoFinal: 'Valgor não morreu na guerra contra o Deus Marcado: se despedaçou de propósito, espalhando pedaços de si em cada humano nascido depois. É por isso que os humanos aprendem tão rápido. O Rei Despedaçado é só o que sobrou para guardar o coração.', npc: { nome: 'Irmã Elowen, a Última Valgoriana', lugar: 'Cidade Baixa (Verdom)', descricao: 'Uma senhora de cabelo branco e olhos muito atentos, que vende velas numa travessa da Cidade Baixa. É a última sacerdotisa de Valgor, e guarda um mapa das ruínas que ninguém mais tem.', gancho: 'Elowen sonha com o Rei Despedaçado toda noite. Ela pede ao grupo que vá às Ruínas de Valgor, nas Montanhas de Atrelon, e traga o coração de Valgor antes que os Araltos o encontrem. Ela entrega o mapa e uma vela que não apaga com vento.', dicas: 'Nas Salas Ancestrais há uma chave de bronze. A Câmara do Silêncio pune quem fala. A Torre Esquecida guarda um velho que não lembra quem é: não o obriguem a lembrar.', recompensa: { pericias: [ 'História' ], itens: [ { id: 'anel_santuario' } ], dinheiro: 50000, extra: 'Se o grupo devolver o Coração a ela em vez de usá-lo, Elowen acende a última chama de Valgor e todos ganham +1 permanente num atributo à escolha.' } }, salas: [ { id: 'entrada', nome: 'Entrada: a Ponte Quebrada', tipo: 'entrada', x: 0, y: 4, px: 10.7, py: 83.8, texto: 'A ponte de pedra sobre o abismo está partida no meio. Do outro lado, a luz fraca das Salas Ancestrais.', teste: 'AGI (Acrobacia) para pular o vão, ou prender uma corda com um teste de DEX', falha: 'Cai e se segura na borda: 2d10 × nível e perde o próximo turno subindo.' }, { id: 'salas', nome: 'Salas Ancestrais', tipo: 'combate', x: 2, y: 3, px: 37.1, py: 69.1, texto: 'Salões com estátuas de reis humanos sem rosto e uma fogueira sagrada ainda acesa. Soldados de Valgor fazem a ronda.', inimigos: [ 'soldado_valgor', 'soldado_valgor' ], efeito: 'Santuário: descansar junto à fogueira sagrada recupera metade da vida e dos usos de magias por batalha. Só uma vez por visita.', tesouro: { dinheiro: 8000, itens: [ { id: 'elmo_salas_ancestrais', chance: 20 } ] }, segredo: 'Num baú, uma chave de bronze com a chama coroada: abre a porta para o Jardim Destruído.' }, { id: 'galeria', nome: 'Galeria dos Estandartes', tipo: 'tesouro', x: 4, y: 3, px: 70.1, py: 71.7, texto: 'Uma galeria de estandartes rasgados com os nomes dos campeões de Valgor. No fim, um baú e uma porta trancada que sobe para a Torre.', tesouro: { dinheiro: 12000, itens: [ { id: 'escudo_guarda_valgor', chance: 30 }, { id: 'couraca_equinocio', chance: 15 } ] }, inimigos: [ 'soldado_valgor' ] }, { id: 'jardim', nome: 'Jardim Destruído', tipo: 'armadilha', x: 1, y: 2, px: 30.0, py: 51.0, texto: 'O que era um jardim sagrado virou um emaranhado de espinhos negros. As trilhas escondem armadilhas antigas.', teste: 'PER para ver as placas de pressão, DEX para passar', falha: 'Espinhos saem do chão: 3d10 × nível e fica preso até passar num teste de FOR.', inimigos: [ 'espinheiro_vivo', 'espinheiro_vivo' ], efeito: 'Santuário: a fogueira no centro do jardim ainda arde. Descansar aqui recupera metade da vida.' }, { id: 'secreta', nome: 'Área Secreta: o Túnel Oculto', tipo: 'segredo', x: 0, y: 2, px: 6.3, py: 58.0, texto: 'Atrás de uma parede coberta de espinhos, um túnel leva a uma plataforma esquecida com um baú e um altar pequeno.', oculta: true, segredo: 'Uma inscrição no altar: "Valgor se partiu para que cada um de nós carregasse um pedaço." No baú, a Chave da Torre.', tesouro: { dinheiro: 15000, itens: [ { id: 'botas_raiz_jardim', chance: 40 }, { id: 'amuleto_ultimo_suspiro', chance: 25 } ] } }, { id: 'camara', nome: 'Câmara do Silêncio', tipo: 'enigma', x: 3, y: 2, px: 53.8, py: 43.0, texto: 'Uma câmara circular com uma fogueira no centro e uma estátua sem boca. Qualquer som ecoa como um trovão.', enigma: 'Na porta de saída, gravado: "Fale meu nome e eu desapareço." Quem falar em voz alta acorda o Guardião.', solucao: 'O silêncio. O grupo precisa atravessar a câmara sem dizer nada (os jogadores também!) e tocar a porta em silêncio. Cada palavra dita em voz alta dá um turno de ataque do Guardião.', inimigos: [ 'guardiao_silencio' ], efeito: 'Santuário: depois de resolvida, a fogueira permite descansar em paz.' }, { id: 'cofre', nome: 'Cofre do Passadiço', tipo: 'tesouro', x: 4, y: 2, px: 67.5, py: 45.9, texto: 'Um passadiço estreito sobre o abismo com um baú preso por correntes.', teste: 'DEX para soltar o baú sem que as correntes o derrubem', falha: 'O baú cai no abismo com metade do tesouro.', tesouro: { dinheiro: 20000, itens: [ { id: 'tomo_arcanista', chance: 25 }, { id: 'arco_gemeo', chance: 25 } ] } }, { id: 'torre', nome: 'Torre Esquecida', tipo: 'combate', x: 5, y: 2, px: 81.3, py: 49.4, texto: 'Uma torre azul, fria, cheia de livros que se escrevem sozinhos. No topo, o Arquimago Esquecido conversa com as estrelas.', inimigos: [ 'arquimago_esquecido', 'soldado_valgor', 'soldado_valgor' ], efeito: 'Santuário: a fogueira azul da torre. Descansar aqui recupera todos os usos de magias por batalha.' }, { id: 'mirante', nome: 'Mirante da Torre', tipo: 'tesouro', x: 6, y: 2, px: 93.4, py: 53.1, texto: 'Um mirante com a vista de todas as ruínas. Um baú esquecido e um telescópio quebrado.', tesouro: { dinheiro: 10000, itens: [ { id: 'manto_torre_esquecida', chance: 25 }, { id: 'astrolabio_estelar', chance: 50 } ] }, segredo: 'Pelo telescópio, dá para ver que a Forja e o Trono estão ligados por correntes, não por pedra: são pedaços flutuando.' }, { id: 'forja', nome: 'Forja Abandonada', tipo: 'chefe', x: 2, y: 0, px: 46.0, py: 20.7, texto: 'A forja ainda arde, iluminando tudo de vermelho. Martelos batem sozinhos em bigornas vazias.', inimigos: [ 'ferreiro_valgor' ], efeito: 'Santuário: depois de derrotar o Ferreiro, a fogueira da forja permite um último descanso antes do trono.', tesouro: { dinheiro: 25000, itens: [ { id: 'martelo_forja_valgor', chance: 40 } ] } }, { id: 'ponte', nome: 'Ponte das Correntes', tipo: 'armadilha', x: 3, y: 0, px: 67.0, py: 26.0, texto: 'Uma passarela longa presa por correntes sobre o vazio. Algumas correntes estão podres.', teste: 'AGI ou DEX, três vezes ao longo da travessia', falha: 'Uma corrente cede: 3d10 × nível e o herói fica pendurado até alguém puxá-lo (FOR).' }, { id: 'trono', nome: 'O Rei Despedaçado', tipo: 'chefe', x: 5, y: 0, px: 84.2, py: 13.3, texto: 'Um salão vermelho flutuando no abismo. No trono partido, algo gigante feito de pedaços se levanta.', inimigos: [ 'rei_despedacado' ], tesouro: { dinheiro: 3000000, itens: [ { id: 'coracao_valgor' }, { id: 'cetro_rei_despedacado', chance: 30 } ] } } ], conexoes: [ [ 'entrada', 'salas' ], [ 'salas', 'jardim', 'Porta trancada: Chave de Bronze das Salas Ancestrais (ou FOR difícil)' ], [ 'salas', 'galeria', 'Caminho opcional' ], [ 'jardim', 'secreta', 'Túnel oculto atrás dos espinhos' ], [ 'jardim', 'camara', 'Escadas' ], [ 'galeria', 'torre', 'Porta trancada: Chave da Torre (da Área Secreta)' ], [ 'camara', 'cofre', 'Caminho opcional' ], [ 'cofre', 'torre', 'Caminho opcional' ], [ 'torre', 'mirante', 'Caminho opcional' ], [ 'camara', 'forja', 'Escadas para a forja' ], [ 'forja', 'ponte' ], [ 'ponte', 'trono', 'Porta do trono: Chave Rubra do Ferreiro' ] ] },
  { id: 'ruinas_abismo', nome: 'As Ruínas do Abismo', tipo: 'ruina', dificuldade: 4, nivel: 12, lugar: 'Ruínas do Abismo', imagem: 'mapas/dungeons/ruinas_do_abismo.jpg', descricao: 'Ruínas afundadas numa fenda do Deserto de Karlach. Em cima, cavernas e salões com tesouros e armadilhas. Embaixo, lava, cristais carmesins e maldições. O que jaz sob as pedras, nunca morre.', segredoFinal: 'Os cinco heróis não mataram todos os Araltos na Batalha Colossal: enterraram alguns vivos, em lugares onde ninguém devia cavar. As Ruínas do Abismo são uma dessas prisões, e os cristais que a Salamandra Karlach ainda não comeu estão acordando os prisioneiros.', npc: { nome: 'Kesh, o Cavador', lugar: 'Forte de Verdom', descricao: 'Um anão de barba chamuscada que vende mapas no Forte de Verdom. Diz que achou a entrada das ruínas cavando atrás de água.', gancho: 'Kesh desceu até o primeiro salão, ouviu algo respirando lá embaixo e voltou correndo. Ele vende o mapa e paga bem por qualquer tesouro que o grupo trouxer, desde que ninguém solte "a coisa acorrentada".', dicas: 'O baú mais bonito do salão dourado morde. Tem uma passagem atrás da parede do salão das máscaras. E dizem que os selos vermelhos lá embaixo seguram alguma coisa.', recompensa: { pericias: [ 'Avaliação' ], dinheiro: 30000, extra: 'Kesh compra qualquer tesouro das ruínas por 20% a mais que o valor de referência.' } }, salas: [ { id: 'entrada', nome: 'Entrada: a Porta Soterrada', tipo: 'entrada', x: 0, y: 2, px: 20.0, py: 41.5, texto: 'Uma porta de pedra meio enterrada na areia, no fundo da fenda. Do lado de dentro, tochas que ninguém acendeu.' }, { id: 'gruta', nome: '1 · Gruta das Estalactites', tipo: 'exploracao', x: 0, y: 1, px: 22.9, py: 26.4, texto: 'Uma gruta alta, com estalactites que pingam água salgada.', teste: 'PER para notar as estalactites soltas', falha: 'Uma cai: 2d10 × nível.' }, { id: 'cristal', nome: '3 · Caverna de Cristal Azul', tipo: 'tesouro', x: 1, y: 0, px: 38.6, py: 14.0, texto: 'Cristais azuis iluminam uma caverna com um baú antigo.', tesouro: { dinheiro: 8000, itens: [ { id: 'anel_foco_arcano', chance: 50 }, { id: 'capa_mil_penas', chance: 30 } ] } }, { id: 'mascaras', nome: '2 · Salão das Máscaras', tipo: 'combate', x: 2, y: 1, px: 44.5, py: 31.4, texto: 'O salão principal: paredes cobertas de máscaras de pedra que viram para quem passa. Gárgulas nos arcos.', inimigos: [ 'gargula_abismo', 'gargula_abismo' ], segredo: 'Uma das máscaras tem os olhos vazados: empurrá-la abre uma passagem secreta para o Salão Dourado.' }, { id: 'dourado', nome: '4 · Salão Dourado', tipo: 'tesouro', x: 3, y: 0, px: 59.6, py: 11.5, texto: 'Um salão cheio de ouro, taças e baús. O maior baú, perto da parede, respira.', oculta: true, inimigos: [ 'mimico' ], tesouro: { dinheiro: 40000, itens: [ { id: 'coroa_tirano', chance: 5 }, { id: 'amuleto_guarda_dupla', chance: 40 }, { id: 'anel_olho_aguia', chance: 40 } ] }, segredo: 'O Mímico é o baú maior. Os outros são de verdade.' }, { id: 'pontes', nome: '5 · Encruzilhada das Pontes', tipo: 'armadilha', x: 3, y: 1, px: 61.7, py: 40.4, texto: 'Um cruzamento de pontes suspensas. O chão do meio é falso.', teste: 'PER para ver o piso falso, AGI para pular', falha: 'Cai até uma saliência: 3d10 × nível e perde o turno subindo.' }, { id: 'guarita', nome: '5 · Guarita dos Carcereiros', tipo: 'tesouro', x: 4, y: 1, px: 70.1, py: 30.0, texto: 'A guarita de quem vigiava a prisão. Armas enferrujadas, um baú e uma porta pesada para o altar.', tesouro: { dinheiro: 15000, itens: [ { id: 'escudo_contra_ataque', chance: 30 } ] }, inimigos: [ 'sentinela_vermilion' ], segredo: 'No diário do último carcereiro: "Os selos lá embaixo seguram as correntes. Se alguém quebrar os selos, que os cinco nos perdoem."' }, { id: 'altar', nome: '10 · O Altar Acorrentado', tipo: 'chefe', x: 5, y: 0, px: 87.4, py: 14.9, texto: 'Um salão vermelho com um altar no centro. Acorrentado a ele, algo alado abre os olhos.', inimigos: [ 'azhrak' ], tesouro: { dinheiro: 2000000, itens: [ { id: 'olho_abismo' }, { id: 'foice_abismo', chance: 30 } ] } }, { id: 'passagem', nome: '7 · Passagem do Alerta', tipo: 'armadilha', x: 5, y: 1, px: 80.7, py: 45.0, texto: 'Um corredor verde de musgo com um símbolo de alerta pintado no chão.', teste: 'DEX (Desarmar Armadilhas) na placa central', falha: 'Gás verde: 2d10 × nível e envenenado por 2 turnos.' }, { id: 'mimico6', nome: '6 · Depósito dos Baús', tipo: 'combate', x: 6, y: 1, px: 87.0, py: 37.8, texto: 'Um depósito cheio de baús empilhados. Um deles tem dentes.', inimigos: [ 'mimico' ], tesouro: { dinheiro: 6000 } }, { id: 'escondida', nome: '? · A Sala Escondida', tipo: 'segredo', x: 7, y: 1, px: 92.4, py: 38.1, texto: 'Atrás de uma pilha de baús, uma saleta com o mapa das prisões dos Araltos pintado na parede.', oculta: true, segredo: 'O mapa mostra outras prisões: uma sob a Última Fortaleza do Deus-Marcado e outra no fundo do Grande Lago Central.', tesouro: { itens: [ { id: 'bussola_carmesim', chance: 60 } ] } }, { id: 'lagoa', nome: '8 · Lagoa Azul', tipo: 'combate', x: 2, y: 2, px: 40.8, py: 52.5, texto: 'Uma lagoa subterrânea azul cercada de estalagmites. Algo se mexe na água.', inimigos: [ 'sanguessuga_carmesim', 'escaravelho_carmesim' ], efeito: 'Depois de limpa, a água da lagoa cura 25% da vida de quem beber (uma vez).' }, { id: 'tesouros9', nome: '9 · Sala dos Tributos', tipo: 'tesouro', x: 3, y: 2, px: 62.1, py: 55.3, texto: 'Uma sala com tributos deixados para o prisioneiro: ouro, joias e armas. Uma escada desce para o nível inferior.', tesouro: { dinheiro: 20000, itens: [ { id: 'arco_gemeo', chance: 30 }, { id: 'lamina_ultimo_folego', chance: 8 } ] } }, { id: 'a1', nome: 'A1 · Poço das Lâminas', tipo: 'armadilha', x: 0, y: 3, px: 13.7, py: 72.1, texto: 'O primeiro salão do nível inferior: lâminas giram nas paredes a cada respiração do abismo.', teste: 'AGI três vezes, uma por lâmina', falha: '2d10 × nível por lâmina que acertar.' }, { id: 'a2', nome: 'A2 · Rio de Lava', tipo: 'combate', x: 1, y: 3, px: 30.3, py: 72.3, texto: 'Um salão cortado por um rio de lava. Criaturas de brasa nadam nele.', inimigos: [ 'cria_de_karlac', 'golem_magma' ] }, { id: 'a3', nome: 'A3 · Primeiro Selo Carmesim', tipo: 'maldicao', x: 2, y: 3, px: 49.2, py: 76.2, texto: 'Um selo de cristal vermelho no chão, com runas dos cinco heróis. Uma porta pesada atrás dele.', efeito: 'Quem tocar o selo ganha 2 Marcas Carmesins. Destruí-lo (3 acertos, ou a magia Selo Carmesim) solta uma corrente de Azhrak e tira 15% da vida máxima dele.' }, { id: 'a4', nome: 'A4 · Câmara das Oferendas', tipo: 'tesouro', x: 3, y: 3, px: 57.3, py: 70.3, texto: 'Oferendas antigas deixadas pelos Araltos que visitavam o prisioneiro.', tesouro: { dinheiro: 25000, itens: [ { id: 'cetro_sangue', chance: 40 }, { id: 'contrato_arquidemonio', chance: 3 } ] } }, { id: 'a5', nome: 'A5 · Os Carcereiros Caídos', tipo: 'combate', x: 4, y: 3, px: 73.3, py: 80.9, texto: 'Os carcereiros das ruínas viraram o que vigiavam: mortos-vivos marcados pelos cristais.', inimigos: [ 'carnical_marcado', 'cavaleiro_carmesim', 'carnical_marcado' ] }, { id: 'a6', nome: 'A6 · Segundo Selo Carmesim', tipo: 'maldicao', x: 1, y: 4, px: 24.0, py: 87.7, texto: 'Um selo igual ao primeiro, escondido no fim de uma trilha secreta sobre a lava.', oculta: true, efeito: 'Tocar o selo dá a Maldição do Abismo: −1 em todos os testes até sair das ruínas. Destruí-lo solta a segunda corrente de Azhrak (−15% da vida máxima dele) e impede que ele levante na última fase.' } ], conexoes: [ [ 'entrada', 'mascaras', 'Caminho principal' ], [ 'entrada', 'gruta', 'Caminho opcional' ], [ 'gruta', 'cristal', 'Caminho opcional' ], [ 'mascaras', 'dourado', 'Passagem secreta atrás da máscara' ], [ 'mascaras', 'pontes', 'Caminho principal' ], [ 'pontes', 'guarita' ], [ 'dourado', 'guarita', 'Passagem secreta' ], [ 'guarita', 'altar', 'Porta pesada do altar' ], [ 'pontes', 'passagem' ], [ 'passagem', 'mimico6' ], [ 'mimico6', 'escondida', 'Passagem secreta atrás dos baús' ], [ 'mascaras', 'lagoa', 'Ponte de madeira' ], [ 'pontes', 'tesouros9' ], [ 'tesouros9', 'a4', 'Escada para o nível inferior' ], [ 'entrada', 'a1', 'Escada secreta para o nível inferior' ], [ 'a1', 'a2' ], [ 'a2', 'a3' ], [ 'a3', 'a4', 'Porta pesada' ], [ 'a4', 'a5', 'Passagem secreta sobre a lava' ], [ 'a1', 'a6', 'Trilha secreta sobre a lava' ] ] },
  { id: 'cavernas_estrela', nome: 'As Cavernas da Estrela Dourada', tipo: 'caverna', dificuldade: 5, nivel: 18, lugar: 'Cavernas da Estrela Dourada', imagem: 'mapas/dungeons/cavernas_estrela_dourada.jpg', descricao: 'O caminho até o Grande Dragão Dourado. Grutas de gelo, poços de veneno, o ninho da Matriarca Rubra e uma escadaria guardada que sobe até o topo da montanha. Nem todo brilho é um presente. Às vezes, é um aviso.', segredoFinal: 'A estrela dourada no centro das cavernas não é uma pedra: é o ovo que o Dragão Dourado deixou com a Matriarca Rubra. Jurgmund está se preparando para voltar, e quer que alguém esteja pronto para cuidar do que vai nascer.', npc: { nome: 'Irmão Sesk, o Peregrino', lugar: 'Templo da Sacerdotisa S\'ssara', descricao: 'Um serpentariano velho, de escamas desbotadas, que já tentou subir ao Pico da Estrela três vezes. Voltou das três com menos dedos.', gancho: 'S\'ssara quer saber se o Dragão Dourado ainda pousa no pico. Sesk guia o grupo até a entrada das cavernas e conta o que sabe sobre o caminho.', dicas: 'O gelo engana: onde parece chão firme, é lago. O veneno verde não mata na hora, mas não para. E o Guardião da escadaria sempre pergunta a mesma coisa: responda a verdade.', recompensa: { pericias: [ 'Religião' ], dinheiro: 40000, extra: 'Se o grupo trouxer notícias do Dragão, S\'ssara passa a confiar neles como fiéis do culto.' } }, salas: [ { id: 'entrada', nome: 'Entrada da Caverna', tipo: 'entrada', x: 0, y: 4, px: 8.3, py: 75.5, texto: 'Uma boca de caverna iluminada por tochas antigas do culto de Jurgmund. O ar é gelado.' }, { id: 'cascatas', nome: 'Salão das Cascatas', tipo: 'combate', x: 1, y: 3, px: 20.4, py: 60.3, texto: 'Cascatas congeladas descem por um salão azul. Formas brancas flutuam entre elas.', inimigos: [ 'espectro_gelo', 'espectro_gelo' ] }, { id: 'gelo', nome: 'Câmara do Chão de Gelo', tipo: 'armadilha', x: 2, y: 3, px: 29.3, py: 56.4, texto: 'O chão é um lago congelado. Algumas placas são finas.', teste: 'PER para ver as placas finas, AGI para atravessar', falha: 'O gelo quebra: 2d10 × nível de frio, −2 de movimento por 2 turnos e o grupo perde o turno tirando o herói da água.' }, { id: 'congelada', nome: 'Gruta Congelada', tipo: 'tesouro', x: 0, y: 2, px: 13.0, py: 44.0, texto: 'Uma gruta cheia de estalactites de gelo. Um baú preso no gelo e um yeti dormindo ao lado.', inimigos: [ 'yeti' ], tesouro: { dinheiro: 10000, itens: [ { id: 'manto_pele_yeti', chance: 40 }, { id: 'orbe_gelo', chance: 40 } ] } }, { id: 'oficina', nome: 'Oficina do Culto', tipo: 'segredo', x: 0, y: 1, px: 17.1, py: 27.1, texto: 'Uma saleta com ferramentas de entalhe e uma estátua de dragão inacabada.', segredo: 'Os serpentarianos do culto construíram o Guardião da Escadaria aqui, com uma estrela de ouro que caiu do pico.', tesouro: { dinheiro: 5000 } }, { id: 'jardim_verde', nome: 'Jardim Verde Oculto', tipo: 'tesouro', x: 1, y: 0, px: 30.5, py: 17.9, texto: 'Uma gruta coberta de musgo que brilha em verde, escondida atrás de uma cortina de raízes.', oculta: true, tesouro: { dinheiro: 15000, itens: [ { id: 'adaga_veneno_verde', chance: 40 }, { id: 'botas_raiz_jardim', chance: 30 } ] } }, { id: 'ossos', nome: 'Ninho dos Ossos', tipo: 'combate', x: 1, y: 2, px: 24.1, py: 38.3, texto: 'Ossos de cabras e aventureiros. Dracos rubros jovens brigam pelos restos.', inimigos: [ 'draco_rubro', 'draco_rubro' ] }, { id: 'poco_verde', nome: 'Poço Verde', tipo: 'tesouro', x: 2, y: 1, px: 30.9, py: 32.2, texto: 'Um poço de veneno verde com um baú na borda.', teste: 'DEX para pegar o baú sem encostar no veneno', falha: 'Veneno: 2d10 × nível por 2 turnos.', tesouro: { dinheiro: 12000, itens: [ { id: 'amuleto_antidoto', chance: 60 } ] } }, { id: 'estrela', nome: 'Câmara da Estrela', tipo: 'chefe', x: 3, y: 1, px: 44.8, py: 32.7, texto: 'Uma câmara enorme com uma estrela dourada gigante no centro, brilhando sobre um altar. É o ninho da Matriarca Rubra.', inimigos: [ 'matriarca_rubra' ], segredo: 'A estrela é um ovo dourado. A Matriarca não o protege por ser dela: protege porque o Dragão Dourado pediu.', tesouro: { itens: [ { id: 'ovo_estrela_dourada', chance: 100 } ] } }, { id: 'santuario_gelo', nome: 'Santuário de Gelo', tipo: 'bencao', x: 4, y: 0, px: 55.9, py: 15.6, texto: 'Um templo de gelo com uma fonte que nunca congela.', efeito: 'Quem beber da fonte recupera toda a vida e fica imune a frio até o fim da dungeon. Uma vez por visita.' }, { id: 'cofre_violeta', nome: 'Cofre Violeta', tipo: 'tesouro', x: 6, y: 0, px: 72.2, py: 25.6, texto: 'Uma gruta escondida, iluminada por cristais roxos, com um baú do culto.', oculta: true, tesouro: { dinheiro: 30000, itens: [ { id: 'arco_estrela_dourada', chance: 25 }, { id: 'pedra_do_limiar', chance: 15 } ] } }, { id: 'pilares', nome: 'Salão dos Pilares', tipo: 'armadilha', x: 5, y: 1, px: 65.2, py: 48.2, texto: 'Pilares com dragões entalhados. Os olhos deles acompanham quem passa.', teste: 'DEX (Furtividade) ou quebrar os olhos de rubi (3 acertos)', falha: 'Os pilares cospem fogo: 3d10 × nível em quem estiver na frente.', tesouro: { dinheiro: 20000 } }, { id: 'fonte_veneno', nome: 'Fonte de Veneno', tipo: 'combate', x: 3, y: 2, px: 45.8, py: 60.4, texto: 'Uma fonte que borbulha veneno verde. Lodos saem dela sem parar.', inimigos: [ 'lodo_venenoso', 'lodo_venenoso', 'lodo_venenoso' ], efeito: 'Enquanto a fonte borbulhar, um Lodo novo sai a cada 2 turnos. Tampar a fonte (FOR, 2 ações) para de vez.' }, { id: 'lago_veneno', nome: 'Lago Venenoso', tipo: 'maldicao', x: 2, y: 4, px: 31.3, py: 85.3, texto: 'Um lago verde enorme. Uma porta secreta brilha do outro lado.', efeito: 'Quem entrar na água fica com o Veneno Lento: −5% da vida máxima por hora até tomar um antídoto ou Purificação.', tesouro: { dinheiro: 18000, itens: [ { id: 'amuleto_ultimo_suspiro', chance: 30 } ] } }, { id: 'lago_gelado', nome: 'Lago Gelado', tipo: 'bencao', x: 6, y: 3, px: 70.6, py: 77.0, texto: 'Um lago azul com uma fonte congelada no meio e uma porta secreta na parede.', efeito: 'Mergulhar no lago (teste de CON) cura todas as maldições e venenos.', tesouro: { itens: [ { id: 'manto_gelo_cristal', chance: 25 } ] } }, { id: 'espectros', nome: 'Covil dos Espectros', tipo: 'combate', x: 5, y: 4, px: 54.7, py: 85.9, texto: 'Uma gruta funda onde os espectros de gelo se juntam.', inimigos: [ 'espectro_gelo', 'espectro_gelo', 'espectro_gelo' ] }, { id: 'guardiao', nome: 'Salão do Guardião', tipo: 'chefe', x: 7, y: 1, px: 83.5, py: 42.2, texto: 'Entre duas velas, na base de uma escadaria que sobe pela montanha, um gigante de armadura se levanta e pergunta: "Por que querem ver o dragão?"', inimigos: [ 'guardiao_dourado' ] }, { id: 'pico', nome: 'Pico da Estrela Dourada', tipo: 'chefe', x: 7, y: 0, px: 83.3, py: 6.3, texto: 'O topo da montanha. A neve derrete em volta de uma luz dourada. Nas noites de lua cheia, o Grande Dragão Dourado pousa aqui.', inimigos: [ 'grande_dragao_dourado' ], efeito: 'O Dragão não é inimigo: ele conversa com quem vem em paz. Se o grupo pedir a prova, ele luta até 50% da vida e para (fase Basta).', tesouro: { itens: [ { id: 'escama_estrela_dourada' } ] } } ], conexoes: [ [ 'entrada', 'cascatas', 'Caminho principal' ], [ 'entrada', 'congelada', 'Caminho opcional' ], [ 'cascatas', 'gelo' ], [ 'congelada', 'oficina', 'Escadas' ], [ 'congelada', 'ossos' ], [ 'oficina', 'jardim_verde', 'Cortina de raízes' ], [ 'ossos', 'poco_verde' ], [ 'poco_verde', 'estrela' ], [ 'gelo', 'fonte_veneno', 'Ponte de corda' ], [ 'fonte_veneno', 'estrela', 'Escadas para a câmara' ], [ 'fonte_veneno', 'lago_veneno', 'Descida' ], [ 'jardim_verde', 'santuario_gelo', 'Passarela no alto' ], [ 'estrela', 'santuario_gelo', 'Escadas' ], [ 'santuario_gelo', 'cofre_violeta', 'Passagem secreta de cristais' ], [ 'estrela', 'pilares', 'Caminho principal' ], [ 'pilares', 'guardiao', 'Ponte da escadaria' ], [ 'cofre_violeta', 'guardiao', 'Passagem secreta' ], [ 'pilares', 'lago_gelado', 'Passagem secreta pela cascata' ], [ 'fonte_veneno', 'lago_gelado', 'Caminho opcional' ], [ 'lago_gelado', 'espectros', 'Escadas' ], [ 'guardiao', 'pico', 'A Escadaria Dourada' ] ] }
];


/* =========================================================
   RETRATOS DOS PERSONAGENS (pasta imagens/retratos, arquivos .jpg)
   ========================================================= */
const RETRATOS = {
  guerreiro: ['guerreiro1', 'guerreiro2', 'guerreiro3'],
  ladino:    ['ladino1', 'ladino2', 'ladino3'],
  arqueiro:  ['arqueiro1', 'arqueiro2', 'arqueiro3'],
  mago:      ['mago1', 'mago2', 'mago3'],
  clerigo:   ['clerigo1', 'clerigo2', 'clerigo3']
};
