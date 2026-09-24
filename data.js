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
    colecao: 'semideus', tema: 'Semideus dos humanos', atributos: { DEX: 1, AGI: 1 },
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
  { id: 'simbolo_sanctum', nome: 'O Símbolo de Sanctum', tier: 'unico', categoria: 'foco', foco: 'sagrado', maos: 1, dados: 0, peso: 1, alcance: 1, atributos: { FDV: 2 }, bonus: { dadoCura: 5, recurso: 2 }, efeito: '+5d10 nas curas e +2 no máximo do recurso. Uma vez por batalha, uma cura levanta um aliado caído.', colecao: 'semideus', tema: 'Sanctum, o clérigo da Primeira Era', historia: 'Sanctum curou os feridos dos dois lados da guerra da libertação, inclusive os elfos que se renderam. Na Batalha Colossal, curou a própria Jurgmund.', desvantagem: 'O símbolo não escolhe lados: curas em área também curam os inimigos que estiverem na área.', obtencao: 'Guardado no Bastião dos Heróis. Só é entregue a um clérigo que cure um inimigo diante da Guardiã.' }
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
  { id: 'escudo_ferro_negro', nome: 'Escudo Torre de Ferro Negro', tier: 'perfeito', tipoEscudo: 'pesado', defesa: 3, perdeAcao: 1, peso: 12, atributos: { CON: 1 }, efeito: 'O portador não pode ser empurrado nem derrubado.' }
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
  tecido:  'Tecido encantado (leve)'
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
  { id: 'manto_noite_arcana', nome: 'Manto da Noite Arcana', tier: 'lendario', tipo: 'tecido', slot: 'peitoral', df: 0, dm: 10, peso: 2, atributos: { INT: 2 }, bonus: { dadoMagico: 2, slots: 2 }, efeito: '+2d10 no dano mágico e +2 slots. No escuro, o portador fica oculto até lançar uma magia.' }
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
    colecao: 'semideus', tema: 'Semideus dos humanos', atributos: { CAR: 1, PER: 1 }, bonus: { critDano: 25 },
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
  { id: 'anel_poco_sem_fundo', nome: 'Anel do Poço Sem Fundo', tier: 'lendario', df: 0, dm: 0, peso: 0, atributos: { INT: 1, FDV: 1 }, bonus: { recurso: 4 }, efeito: '+4 no máximo do recurso da classe. No início de cada batalha, o recurso começa com +2, mesmo para classes que começam com 0.' }
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
  { id: 'visao_verdadeira', nome: 'Visão da Verdade', categoria: 'utilidade', tier: 'lendario', resumo: 'Vê através de ilusões e disfarces', calc: null, dado: 0, alcance: 'Si mesmo', usos: { qtd: 1, por: 'dia' }, efeito: 'Por 10 minutos, você vê invisíveis, ilusões, disfarces e a forma verdadeira de quem mudou de corpo. Máscaras mágicas não enganam você.' }
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
  1: { nome: 'Muito fácil',      cor: '#4a6b2e', vida: 0.6, defesa: 0.5, dano: -1 },
  2: { nome: 'Normal',           cor: '#2c5a8c', vida: 1.0, defesa: 1.0, dano: 0 },
  3: { nome: 'Difícil',          cor: '#a8761c', vida: 1.5, defesa: 1.3, dano: 1 },
  4: { nome: 'Muito difícil',    cor: '#8e1b1b', vida: 2.5, defesa: 1.7, dano: 2 },
  5: { nome: 'Quase impossível', cor: '#4b1f5e', vida: 4.0, defesa: 2.2, dano: 4 }
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
    drops: [ { item: 'elmo_sentinela', chance: 15 }, { item: 'coifa_runica', chance: 15 }, { item: 'muralha_ferro', chance: 15 }, { item: 'couraca_ferro', chance: 20 }, { texto: 'Placa de armadura com o brasão de Vermilion', chance: 60 }, { item: 'coroa_vermilion', chance: 3 } ] },

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
    drops: [ { item: 'arco_composto', chance: 15 }, { item: 'capuz_sombras', chance: 15 }, { item: 'escudo_cruzado', chance: 15 }, { item: 'lanca_real_vassk', chance: 15 }, { item: 'cota_malha', chance: 15 }, { texto: 'Insígnia da Guarda Real', chance: 60 } ] },

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
    drops: [ { item: 'vestes_tecidas_luz', chance: 6 }, { item: 'estandarte_sagrado', chance: 8 }, { item: 'martelo_trovao', chance: 8 }, { item: 'manoplas_tita', chance: 8 }, { item: 'escudo_runico', chance: 8 }, { item: 'coroa_chama_breve', chance: 5 }, { item: 'lamina_mil_formas', chance: 3 }, { texto: 'Placa com uma oração ao Deus-Humano', chance: 60 } ] },

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
    drops: [ { item: 'punhal_gemeo', chance: 12 }, { item: 'tomo_arcanista', chance: 12 }, { item: 'luvas_ladrao', chance: 12 }, { item: 'lamina_batalha_colossal', chance: 100 }, { texto: 'Mapa dos fragmentos do Deus Marcado', chance: 100 } ] }
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
      { nome: 'Acampamento do Arquidemônio', desc: 'Uma tenda solitária ao pé das montanhas do sudeste.' } ] },

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
      { nome: 'Cavernas da Estrela Dourada', desc: 'Cavernas no noroeste dos picos, lar da Matriarca Rubra.' },
      { nome: 'Tundra de Atrelon', desc: 'A planície gelada e cheia de pinheiros aos pés das montanhas.' },
      { nome: 'Castelo Solitário', desc: 'Um castelo pequeno numa ilhota do lago gelado da tundra. Ninguém sabe quem mora lá.' },
      { nome: 'Domínios dos Yets', desc: 'As florestas nevadas a leste da cidade, território dos yetis.' },
      { nome: 'Torre de Observação Estelar', temas: ['Torre de Observação Estelar'], desc: 'Uma torre antiga usada para observar as estrelas e vigiar a estrada.' },
      { nome: 'Ruína Élfica', desc: 'Restos de uma cidade élfica do tempo do Domínio dos Elfos, ainda guardada por sentinelas de cristal.' },
      { nome: 'Encontro de Turlach', desc: 'Onde o rio da montanha encontra o mar. Turlach vive ali.' },
      { nome: 'Tumbas de Tobi', desc: 'Tumbas cavadas na montanha marrom, cheias de armadilhas. Tobi está enterrado lá, ou pelo menos é o que ele quer que pensem.' },
      { nome: 'Caminho da Morte', desc: 'A trilha estreita pela encosta leste das montanhas.' },
      { nome: 'Ruínas do Deus-Humano', desc: 'O templo caído do semideus dos humanos, no extremo nordeste.' },
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
      { nome: 'Vulcão de Karloth', desc: 'Onde repousa o Dragão Dourado, aspecto de Jurgmund, com um brilho visível de toda a planície.' },
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
  tipo:      { placas: 1.3, malha: 1.1, couro: 0.8, brocado: 1.1, tecido: 0.9 },
  escudo: 1, acessorio: 1.2
};
const FORMAS_ENSINO = { venda: 'Venda', troca: 'Troca', missao: 'Missão' };

const LOJAS = [
  // ----- Reino de Verdom -----
  { id: 'forja_bran', nome: 'Forja do Velho Bran', lugar: 'Cidade Baixa (Verdom)', dono: 'Bran, ferreiro humano', mult: 1,
    descricao: 'A forja mais movimentada da Cidade Baixa. Tudo o que um aventureiro iniciante precisa.',
    itens: ['adaga','espada_curta','espada_longa','maca_ferro','machado_batalha','martelo_guerra','arco_curto','arco_longo','besta_pesada',
            'elmo_ferro','couraca_ferro','manoplas_ferro','grevas_ferro','coifa_malha','cota_malha','luvas_malha','botas_malha',
            'capuz_couro','gibao_couro','luvas_couro','botas_couro','broquel','escudo_torre'] },
  { id: 'armazem_guilda', nome: 'Armazém da Guilda', lugar: 'Sede da Guilda de Verdom', dono: 'Mestra-intendente Oriane', mult: 1.1,
    descricao: 'Equipamento testado em campo. Quem tem o Selo da Guilda paga 10% a menos.',
    itens: ['anel_ferro','anel_prata','cinto_couro','talisma_apostador','espada_bastarda','arco_composto','lanca_cavaleiro','besta_mao',
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
    itens: ['orbe_vidro','cetro_sangue','cajado_carvalho','cajado_centelha','anel_brasa_fria','couraca_escamas','manoplas_carrasco','martelo_terremoto',
            'lanca_vidro_rubro','manto_cinzas_frias','cajado_tempestade','manto_arquimago'] },
  // ----- Grande Reino dos Orcs -----
  { id: 'mercado_guerra', nome: 'Mercado de Guerra', lugar: 'Grande Cidade Orc Lonk-Carn', dono: 'Grakha, a Vendedora de Machados', mult: 1,
    descricao: 'Orcs não pechincham. Quem pede desconto precisa ganhar uma queda de braço.',
    itens: ['machado_batalha','martelo_guerra','machado_fende','marreta_quebra_escudo','muralha_ferro','cinto_tita','talisma_presas_orc',
            'montante_carrasco','martelo_trovao','manoplas_tita'] },
  { id: 'tenda_corsario', nome: 'Tenda do Corsário Orc', lugar: 'Baía de Lonk-Carn', dono: 'Olho-Torto', mult: 1,
    descricao: 'Mercadoria de navios que afundaram. Não pergunte como.',
    itens: ['sabre_vento','colar_dentes','brinco_raposa','ancora_mangual','luvas_ladrao'] },
  // ----- Grande Ilha de Tortumaga -----
  { id: 'oficina_casco', nome: 'Oficina dos Anões do Casco', lugar: 'Porto Tortuoso (Cidade dos Anões)', dono: 'Mestre Dorgan Pé-de-Casco', mult: 1,
    descricao: 'O melhor trabalho anão fora das montanhas: runas, mithril e ferro negro.',
    itens: ['martelo_estaleiro','luneta_ana','besta_pesada_ana','escudo_ferro_negro','grevas_ferro_negro','elmo_leao','cota_mithril',
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
    itens: ['coifa_malha','cota_malha','broquel','lanca_real_vassk','cota_mercenario','escudo_cruzado','elmo_sentinela','couraca_baluarte','elmo_castelo_cobra','botas_atrelon'] },
  { id: 'loja_templo', nome: 'Oferendas do Templo', lugar: "Templo da Sacerdotisa S'ssara", dono: 'Os fiéis do culto', mult: 1,
    descricao: 'Não se compra: se oferta. O valor é o mesmo.',
    itens: ['incensario_bronze','broche_luz','livro_das_horas','luvas_bencao','sandalias_romeiro','vestes_vigilia','anel_fonte','mitra_peregrino','relicario_martir','simbolo_vontade_jurgmund','vestes_sumo_sacerdote'] },
  { id: 'forja_jurgmund', nome: 'Forja do Forte', lugar: 'Forte de Jurgmund', dono: 'Os ferreiros do forte', mult: 1,
    descricao: 'Machados e placas feitos dentro da montanha.',
    itens: ['manoplas_ferro','grevas_ferro','machado_batalha','machado_forte_jurgmund'] },
  { id: 'emporio_nazarik', nome: 'Empório de Nazarik', lugar: 'Cidade de Nazarik', dono: 'A família Vorne', mult: 1.1,
    descricao: 'Tudo que chega pelo mar passa por aqui: anéis, amuletos e livros de toda Aether.',
    itens: ['caderno_feiticos','varinha_eco','pingente_eco','sandalias_meditacao','cetro_arcano_duplo','luvas_tecelao','botas_levitacao','manto_estrelas','capuz_vidente','amuleto_duplo_conjuro','varinha_espinhos','grimorio_viajante','manto_aprendiz','sapatilhas_vento','coroa_arcanista','tomo_arcanista','amuleto_sabio',
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
    ensina: [ { magia: 'pedrada_arcana' }, { magia: 'agulhas_sombra' }, { magia: 'escudo_arcano' }, { magia: 'mao_arcana' }, { magia: 'reparar' }, { magia: 'cone_de_frio' }, { magia: 'raio_solar' }, { magia: 'dardo_mistico' }, { magia: 'toque_chocante' }, { magia: 'chama' }, { magia: 'rajada_gelo' }, { magia: 'luz' },
              { magia: 'detectar_magia' }, { magia: 'bola_fogo' }, { magia: 'lanca_relampago' }, { magia: 'passo_nebuloso' } ] },
  { id: 'sacerdote_igreja', nome: 'Sacerdotisa Maelis', lugar: 'Igreja do Jurgmund',
    descricao: 'Ensina curas e proteções a quem jura usá-las pelos outros.',
    ensina: [ { magia: 'toque_revigorante' }, { magia: 'raio_cura' }, { magia: 'protecao_elemental' }, { magia: 'heroismo' }, { magia: 'cura_menor' }, { magia: 'estancar' }, { magia: 'pele_pedra' }, { magia: 'egide_menor' }, { magia: 'barreira' },
              { magia: 'cura_grupo' }, { magia: 'regeneracao' }, { magia: 'santuario' }, { magia: 'purificacao' }, { magia: 'restauracao' },
              { magia: 'ressurreicao', missao: 'Trazer de volta o corpo de um fiel perdido nas Ruínas de Vermilion.' } ] },
  { id: 'piromante', nome: 'Piromante da Forja Viva', lugar: 'Cidade de Karlach',
    descricao: 'Aprendeu magia no calor das costas da Salamandra.',
    ensina: [ { magia: 'explosao_trovao' }, { magia: 'protecao_elemental' }, { magia: 'chama' }, { magia: 'foco_arcano' }, { magia: 'bola_fogo' }, { magia: 'arma_encantada' }, { magia: 'chuva_meteoros' },
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
    ensina: [ { magia: 'aura_vida', missao: 'Curar os doentes da Cidade de Atrelon durante uma semana, sem cobrar nada.' }, { magia: 'raio_cura' }, { magia: 'vinculo_vital' }, { magia: 'cura_menor' }, { magia: 'regeneracao' }, { magia: 'purificacao' }, { magia: 'cura_em_massa' }, { magia: 'restauracao' },
              { magia: 'fonte_vida', missao: 'Encher um frasco no Lago da Gota de Jurgmund e trazê-lo ao templo.' },
              { magia: 'comunhao', missao: 'Servir ao culto numa missão escolhida pela sacerdotisa.' },
              { magia: 'lagrimas_ilse', missao: 'Uma prova que só S\'ssara conhece. Ela diz que ainda não chegou a hora.' } ] },
  { id: 'astromante', nome: 'O Astromante', lugar: 'Torre de Observação Estelar',
    descricao: 'Estuda as estrelas e sabe coisas demais sobre a que caiu.',
    ensina: [ { magia: 'visao_verdadeira', missao: 'Descobrir quem está por trás da máscara dourada na corte do rei Vassk.' }, { magia: 'palavra_de_poder', missao: 'Trazer uma página do diário de Aldren que fala da palavra antiga.' }, { magia: 'raio_solar' }, { magia: 'clarividencia' }, { magia: 'dardo_mistico' }, { magia: 'luz' }, { magia: 'detectar_magia' }, { magia: 'aceleracao' }, { magia: 'portal_retorno' }, { magia: 'voo' },
              { magia: 'julgamento_celeste', missao: 'Observar com ele um eclipse inteiro do alto da torre, protegendo-a do que vier.' },
              { magia: 'ultima_estrela', missao: 'Encontrar o diário de Aldren, o astrônomo louco.' } ] },
  { id: 'eremita', nome: 'O Eremita do Castelo Solitário', lugar: 'Castelo Solitário',
    descricao: 'Ninguém sabe o nome dele, nem há quanto tempo mora no castelo. Ensina coisas que ninguém mais ensina.',
    ensina: [ { magia: 'pressa_maior', missao: 'Trazer areia de uma ampulheta quebrada das Ruínas da Antiga Cidade.' }, { magia: 'levantar_mortos' }, { magia: 'clarividencia' }, { magia: 'revoada_corvos' }, { magia: 'familiar' }, { magia: 'servo_invisivel' }, { magia: 'lobo_espiritual' }, { magia: 'toque_vampirico' }, { magia: 'prisao_espinhos' },
              { magia: 'invisibilidade' }, { magia: 'guardioes_espectrais' },
              { magia: 'dragao_jovem', missao: 'Trazer uma escama da Matriarca Rubra.' },
              { magia: 'parar_tempo', missao: 'Descobrir por que o relógio do castelo anda para trás.' },
              { magia: 'pacto_morvath', missao: 'Ele só ensina a quem já perdeu alguém. E cobra algo que não diz o que é.' },
              { magia: 'avatar_kaelthar', missao: 'Levar um fragmento de estátua de semideus até a montanha de Kaelthar.' },
              { magia: 'olho_oraculo', missao: 'Trazer um olho de pedra-lume das Ruínas Grúticas.' } ] },
  { id: 'academia_nazarik', nome: 'Academia de Nazarik', lugar: 'Cidade de Nazarik',
    descricao: 'Escola de magia aberta a quem pagar. Os professores mudam todo ano.',
    ensina: [ { magia: 'agulhas_sombra' }, { magia: 'mao_arcana' }, { magia: 'guelras' }, { magia: 'falar_animais' }, { magia: 'desintegrar' }, { magia: 'tempestade_gelo' }, { magia: 'aguia_gigante' }, { magia: 'forma_animal' }, { magia: 'mensageiro_vento' }, { magia: 'dardo_mistico' }, { magia: 'toque_chocante' }, { magia: 'lingua_universal' }, { magia: 'foco_arcano' }, { magia: 'bencao_viagem' },
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
    ensina: [ { pericia: 'Rastreamento', attr: 'PER', forma: 'missao', custo: 'Caçar as Aranhas Gigantes que atacam os lenhadores.' },
              { pericia: 'Sobrevivência', attr: 'CON', forma: 'troca', custo: 'Uma pele de urso ou de lobo.' } ] },
  { id: 'dorgan', nome: 'Mestre Dorgan Pé-de-Casco', lugar: 'Porto Tortuoso (Cidade dos Anões)', descricao: 'Ferreiro e engenheiro. Ensina quem aguenta o calor da forja.',
    ensina: [ { pericia: 'Ferraria', attr: 'FOR', forma: 'troca', custo: 'Três placas de ferro rúnico ou metal raro.' },
              { pericia: 'Engenharia', attr: 'INT', forma: 'venda', custo: '6 ouro' } ] },
  { id: 'fuzz', nome: 'Fuzz, o Pirotécnico', lugar: 'Goblins Cinzas', descricao: 'Goblin sem sobrancelhas e com todos os dedos, o que é raro.',
    ensina: [ { pericia: 'Explosivos', attr: 'INT', forma: 'troca', custo: 'Um segredo dos Goblins Verdes.' } ] },
  { id: 'baleeiro_ossk', nome: 'Velho Baleeiro Ossk', lugar: 'Kurnamin', descricao: 'Perdeu um braço para Murlach e nunca parou de pescar.',
    ensina: [ { pericia: 'Navegação', attr: 'PER', forma: 'venda', custo: '3 ouro' },
              { pericia: 'Natação', attr: 'FOR', forma: 'troca', custo: 'Um barril de rum de Korgara.' } ] },
  { id: 'alquimista_brasa', nome: 'Alquimista Seraph', lugar: 'Cidade de Karlach', descricao: 'Estuda os cristais carmesins com luvas de três camadas.',
    ensina: [ { pericia: 'Alquimia', attr: 'INT', forma: 'venda', custo: '8 ouro' },
              { pericia: 'Conhecimento dos Cristais', attr: 'INT', forma: 'missao', custo: 'Trazer uma Bolsa de sangue carmesim do Lago Corrompido.' } ] },
  { id: 'grukka', nome: 'Mestre de Guerra Grukka', lugar: 'Grande Cidade Orc Lonk-Carn', descricao: 'Treina os guerreiros da capital. Não ensina quem nunca apanhou.',
    ensina: [ { pericia: 'Atletismo', attr: 'FOR', forma: 'missao', custo: 'Aguentar três rodadas de luta contra ele sem cair.' },
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
    ensina: [ { pericia: 'Negociação', attr: 'CAR', forma: 'troca', custo: 'Qualquer coisa que valha pelo menos 5 ouro.' } ] }
];
