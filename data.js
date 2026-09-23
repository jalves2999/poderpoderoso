/* =========================================================
   data.js — Base de dados do RPG em Hexágonos
   Edite este arquivo para ajustar regras, itens e magias.
   ========================================================= */

/* ---------- REGRAS GERAIS ---------- */
const REGRAS = {
  nivelMax: 20,
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
  // novas habilidades são liberadas a cada 'intervaloNiveis' níveis
  habilidades: {
    pontosIniciais: 1,           // ponto grátis no nível 1
    pontosACadaNiveis: 5,        // +1 ponto a cada 5 níveis (5, 10, 15, 20)
    intervaloNiveis: 5           // novas habilidades a cada 5 níveis
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
        calc: { tipo: 'dano', porPonto: 3, minimo: 5 } }
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
        efeito: 'Cada inimigo marcado sofre 1d10 × nível de dano de veneno por Marca que tiver, ignorando a defesa. Todas as Marcas são consumidas.' }
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
        efeito: 'Por 1 turno para cada Foco gasto: +2 de movimento, nenhum inimigo consegue interceptar você e, a cada turno, o primeiro tiro depois de mover ganha +1 na faixa de crítico.' }
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
        efeito: 'Recupera metade do MP máximo.' }
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
        efeito: 'Você não recebe dano nenhum por 1 turno (2 turnos com 8 Fé), mas também não pode atacar. Ainda pode lançar curas e buffs.' }
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
  { id: 'relicario_martir',nome: 'Relicário do Mártir',    tier: 'raro', categoria: 'foco', foco: 'sagrado',    maos: 1, dados: 0, peso: 1, alcance: 1, efeito: '+2d10 nas curas; ao curar um aliado, você recupera 25% do valor.', bonus: { dadoCura: 2 } }
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
  { id: 'muralha_ferro',   nome: 'Muralha de Ferro',     tier: 'raro',  tipoEscudo: 'pesado', defesa: 2, perdeAcao: 1, peso: 8, efeito: 'Aliados no hexágono atrás de você não podem ser alvo de ataques à distância.' }
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
  { id: 'manto_aprendiz',   nome: 'Manto do Aprendiz Rúnico', tier: 'raro', tipo: 'tecido',  slot: 'peitoral', df: 0, dm: 6, peso: 2,  efeito: 'Magias de custo 1 têm recarga −1 turno.' },
  { id: 'sapatilhas_vento', nome: 'Sapatilhas do Vento',      tier: 'raro', tipo: 'tecido',  slot: 'botas',    df: 0, dm: 3, peso: 1,  efeito: '+1 hexágono de movimento no turno em que lançar magia.' }
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
  { id: 'broche_vento',    nome: 'Broche do Vento',          tier: 'raro',  df: 0, dm: 0, peso: 0, efeito: '+1 hexágono de movimento.', bonus: { mov: 1 } }
];

/* ---------- MAGIAS ----------
   tipo: 'dano' | 'protecao' | 'buff'
   calc: 'dano' (INT + foco + dado) | 'cura' (FDV + foco + dado) | 'absorve' (FDV + dado) | null (efeito em texto)
   dado: quantidade de d10 da própria magia
   O custo em slots vem do tier (REGRAS.custoSlotPorTier).
------------------------------------------------ */
const MAGIAS = [
  // Dano
  { id: 'dardo_mistico',   nome: 'Dardo Místico',     tipo: 'dano', tier: 'comum', calc: 'dano', dado: 1, alcance: '6 hex, 1 alvo',            recarga: 0, efeito: 'Acerta automaticamente.' },
  { id: 'toque_chocante',  nome: 'Toque Chocante',    tipo: 'dano', tier: 'comum', calc: 'dano', dado: 2, alcance: 'Adjacente',                recarga: 1, efeito: '' },
  { id: 'chama',           nome: 'Chama',             tipo: 'dano', tier: 'comum', calc: 'dano', dado: 2, alcance: '4 hex, 1 alvo',            recarga: 1, efeito: '' },
  { id: 'rajada_gelo',     nome: 'Rajada de Gelo',    tipo: 'dano', tier: 'comum', calc: 'dano', dado: 1, alcance: 'Cone de 3 hex',            recarga: 2, efeito: 'Alvos têm −1 movimento por 1 turno.' },
  { id: 'bola_fogo',       nome: 'Bola de Fogo',      tipo: 'dano', tier: 'raro',  calc: 'dano', dado: 2, alcance: '6 hex, alvo + 6 hex ao redor', recarga: 3, efeito: 'Atinge aliados também.' },
  { id: 'lanca_relampago', nome: 'Lança de Relâmpago',tipo: 'dano', tier: 'raro',  calc: 'dano', dado: 3, alcance: 'Linha de 5 hex',           recarga: 2, efeito: '' },
  { id: 'toque_vampirico', nome: 'Toque Vampírico',   tipo: 'dano', tier: 'raro',  calc: 'dano', dado: 2, alcance: 'Adjacente',                recarga: 2, efeito: 'Cura 50% do dano causado.' },
  { id: 'prisao_espinhos', nome: 'Prisão de Espinhos',tipo: 'dano', tier: 'raro',  calc: null,   dado: 1, alcance: '5 hex, 1 alvo',            recarga: 3, efeito: '1d10 de dano por turno durante 3 turnos; o alvo não se move no 1º turno.' },

  // Proteção e cura
  { id: 'cura_menor',   nome: 'Cura Menor',     tipo: 'protecao', tier: 'comum', calc: 'cura',    dado: 1, alcance: '3 hex',     recarga: 1, efeito: 'Cura um aliado.' },
  { id: 'pele_pedra',   nome: 'Pele de Pedra',  tipo: 'protecao', tier: 'comum', calc: null,      dado: 0, alcance: 'Adjacente', recarga: 3, efeito: '+2 DF de item por 2 turnos.' },
  { id: 'egide_menor',  nome: 'Égide Menor',    tipo: 'protecao', tier: 'comum', calc: null,      dado: 0, alcance: 'Adjacente', recarga: 3, efeito: '+2 DM de item por 2 turnos.' },
  { id: 'barreira',     nome: 'Barreira',       tipo: 'protecao', tier: 'comum', calc: 'absorve', dado: 0, alcance: 'Si mesmo',  recarga: 3, efeito: 'Absorve dano até o fim do próximo turno.' },
  { id: 'cura_grupo',   nome: 'Cura em Grupo',  tipo: 'protecao', tier: 'raro',  calc: 'cura',    dado: 0, alcance: 'Raio 2',    recarga: 3, efeito: 'Cura todos os aliados na área.' },
  { id: 'regeneracao',  nome: 'Regeneração',    tipo: 'protecao', tier: 'raro',  calc: null,      dado: 1, alcance: '3 hex',     recarga: 3, efeito: 'Cura 1d10 × nível no início de cada turno do alvo, por 3 turnos.' },
  { id: 'santuario',    nome: 'Santuário',      tipo: 'protecao', tier: 'raro',  calc: null,      dado: 0, alcance: 'Raio 1',    recarga: 4, efeito: 'Aliados na área recebem −25% de dano por 1 turno.' },
  { id: 'reflexo_arcano',nome: 'Reflexo Arcano',tipo: 'protecao', tier: 'raro',  calc: null,      dado: 0, alcance: 'Si mesmo',  recarga: 4, efeito: 'A próxima magia de dano recebida volta ao conjurador com 50% do dano.' },

  // Buff
  { id: 'bencao_forca',   nome: 'Bênção de Força',  tipo: 'buff', tier: 'comum', calc: null, dado: 0, alcance: '3 hex',     recarga: 3, efeito: '+1d10 no dano físico por 2 turnos.' },
  { id: 'pes_ligeiros',   nome: 'Pés Ligeiros',     tipo: 'buff', tier: 'comum', calc: null, dado: 0, alcance: '3 hex',     recarga: 3, efeito: '+2 hexágonos de movimento por 2 turnos.' },
  { id: 'olhar_agucado',  nome: 'Olhar Aguçado',    tipo: 'buff', tier: 'comum', calc: null, dado: 0, alcance: 'Si mesmo',  recarga: 3, efeito: 'Crítico em 1 e 2 por 2 turnos (1 a 3 se já tiver PER 5).' },
  { id: 'foco_arcano',    nome: 'Foco Arcano',      tipo: 'buff', tier: 'comum', calc: null, dado: 0, alcance: 'Si mesmo',  recarga: 2, efeito: 'A próxima magia de dano ganha +1d10.' },
  { id: 'arma_encantada', nome: 'Arma Encantada',   tipo: 'buff', tier: 'raro',  calc: null, dado: 0, alcance: 'Adjacente', recarga: 3, efeito: 'Ataques físicos causam +1d10 de dano mágico extra por 3 turnos (contra a DM do alvo).' },
  { id: 'furia_batalha',  nome: 'Fúria de Batalha', tipo: 'buff', tier: 'raro',  calc: null, dado: 0, alcance: 'Si mesmo',  recarga: 4, efeito: '+1 ataque por ação por 2 turnos, mas recebe +10% de dano.' },
  { id: 'cancao_guerra',  nome: 'Canção de Guerra', tipo: 'buff', tier: 'raro',  calc: null, dado: 0, alcance: 'Raio 2',    recarga: 4, efeito: 'Aliados na área causam +10% de dano por 2 turnos.' },
  { id: 'aceleracao',     nome: 'Aceleração',       tipo: 'buff', tier: 'raro',  calc: null, dado: 0, alcance: '3 hex',     recarga: 5, efeito: 'O alvo ganha +1 ação no próximo turno.' }
];

const TIPOS_MAGIA = {
  dano:     'Magias de dano',
  protecao: 'Proteção e cura',
  buff:     'Buffs'
};

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
