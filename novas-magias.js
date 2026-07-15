/* ======================================================================
   NOVAS MAGIAS — cole no data.js dentro do array GENERAL_SPELLS (ou
   como uma propriedade de classe em spellsFull, conforme preferir).

   Estrutura de cada magia:
   {
     name:     string  — nome da magia
     level:    1–5    — nível (1 fraco, 5 poderoso)
     category: string  — "buff" | "ritual" | "invocacao" | ...
     effect:   string  — o que a magia faz mecanicamente
     castTime: string  — custo de ação para conjurar
     cooldown: string  — frequência de uso
   }

   Mecânicas de INVOCAÇÃO — condições de dificuldade:
     Nível 1-2: sem condição especial.
     Nível 3: conjurador deve ter INT ou SAB ≥ 2.
     Nível 4: requer Foco contínuo (perder Ações de Magia quebra o vínculo).
     Nível 5: requer ritual de 1 turno completo E custo de recurso de classe.
   ====================================================================== */

/* ──────────────────────────────────────────────────────────────────────
   BUFFS — potencializam aliados com mais ações, danos, defesas e testes
   ────────────────────────────────────────────────────────────────────── */

const SPELLS_BUFF = [

  /* --- Nível 1 --- */
  {
    name: "Agilidade de Combate",
    level: 1,
    category: "buff",
    effect: "Alvo tocado ganha +1 Ação de Movimento extra neste turno e no próximo. Não acumula com si mesmo.",
    castTime: "1 Ação (instantânea)",
    cooldown: "3 usos por batalha"
  },
  {
    name: "Mãos Firmes",
    level: 1,
    category: "buff",
    effect: "Alvo tocado adiciona +1d4 ao próximo ataque corpo a corpo que fizer neste turno. Desaparece ao fim do turno.",
    castTime: "1 Reação",
    cooldown: "4 usos por batalha"
  },

  /* --- Nível 2 --- */
  {
    name: "Fúria Arcana",
    level: 2,
    category: "buff",
    effect: "Alvo tocado ganha +1d6 de dano em todos os ataques corpo a corpo por 3 rodadas. O alvo fica Vulnerável a dano mágico durante a duração.",
    castTime: "1 Ação (instantânea)",
    cooldown: "3 usos por batalha"
  },
  {
    name: "Escudo Arcano Aprimorado",
    level: 2,
    category: "buff",
    effect: "Alvo tocado ganha +1d4 de Defesa Física e +1d4 de Defesa Mágica por 4 rodadas. Os dados são rolados uma vez ao conjurar e o valor fica fixo durante a duração.",
    castTime: "1 Ação (instantânea)",
    cooldown: "3 usos por batalha"
  },
  {
    name: "Olhos do Predador",
    level: 2,
    category: "buff",
    effect: "Alvo tocado adiciona +1d6 em todos os testes de Percepção e Pressentimento por 1 hora. Em batalha, não pode ser surpreendido e enxerga criaturas invisíveis em raio de 4 hex.",
    castTime: "1 Ação (instantânea)",
    cooldown: "2 usos por sessão"
  },

  /* --- Nível 3 --- */
  {
    name: "Aceleração",
    level: 3,
    category: "buff",
    effect: "Alvo tocado ganha +1 Ação extra por turno e +2 Movimento por 3 rodadas. Ao final das 3 rodadas, o alvo fica Exausto (−1d4 em todos os testes) por 2 rodadas.",
    castTime: "1 Ação (instantânea)",
    cooldown: "2 usos por batalha"
  },
  {
    name: "Corpo de Ferro",
    level: 3,
    category: "buff",
    effect: "Alvo tocado ganha Resistência Física: todo dano físico sofrido é reduzido em 1d6 (rola a cada golpe). Dura 4 rodadas ou até ser interrompido por dano mágico.",
    castTime: "1 Ação (instantânea)",
    cooldown: "1 uso por batalha"
  },
  {
    name: "Amplificar",
    level: 3,
    category: "buff",
    effect: "Escolhe um aliado visível. A próxima magia que ele conjurar terá seu efeito dobrado (dano, cura ou duração, o que for mais relevante). Deve ser usada antes da magia alvo.",
    castTime: "1 Reação",
    cooldown: "1 uso por batalha"
  },

  /* --- Nível 4 --- */
  {
    name: "Forma de Guerra",
    level: 4,
    category: "buff",
    effect: "Alvo tocado assume uma forma de guerra por 5 rodadas: +1d8 de dano natural, +1 Ação de Combate extra por turno, Imunidade a Medo e +1d6 em todos os testes de Resistência. Ao fim da duração, o alvo fica Prostrado por 1 rodada de exaustão.",
    castTime: "1 turno completo de conjuração",
    cooldown: "1 uso por dia"
  },
  {
    name: "Aura de Dominância",
    level: 4,
    category: "buff",
    effect: "O conjurador emana uma aura por 4 rodadas: todos os aliados em raio 4 hex adicionam +1d6 de Defesa Física, +1d4 de dano e são imunes a Condições de medo e pânico durante a duração.",
    castTime: "2 turnos de concentração",
    cooldown: "1 uso por dia"
  },

  /* --- Nível 5 --- */
  {
    name: "Transcendência Marcial",
    level: 5,
    category: "buff",
    effect: "Um aliado escolhido recebe por 4 rodadas: +1 Ação extra por turno, +1d12 em todos os ataques, +1d8 em todas as defesas, Imunidade a dano não-mágico e Regeneração de 1d8 HP por rodada. Após o fim, o alvo cai a 1 HP e fica Inconsciente por 1 rodada.",
    castTime: "2 turnos de concentração ininterrupta",
    cooldown: "1 uso por semana"
  },
  {
    name: "Pacto de Sangue de Batalha",
    level: 5,
    category: "buff",
    effect: "Une o conjurador a até 3 aliados visíveis por 5 rodadas. Enquanto o Pacto durar: cada aliado no Pacto divide igualmente qualquer dano sofrido entre todos os membros. Se o conjurador cair, o Pacto se rompe. Qualquer cura recebida por um membro se propaga em 50% para os demais.",
    castTime: "2 turnos de concentração",
    cooldown: "1 uso por semana"
  },

];

/* ──────────────────────────────────────────────────────────────────────
   RITUAIS — magias poderosas com tempo e condições de conjuração
   ────────────────────────────────────────────────────────────────────── */

const SPELLS_RITUAL = [

  /* --- Nível 2 --- */
  {
    name: "Ritual da Chama Perpétua",
    level: 2,
    category: "ritual",
    effect: "Uma tocha, fogueira ou objeto tocado passa a emitir chamas que não se apagam por nenhum meio natural (vento, chuva, imersão) por 24 horas. As chamas causam 1d4 de dano a quem as tocar. Pode ser usado para marcar locais ou criar armadilhas simples.",
    castTime: "1 turno completo (fora de combate)",
    cooldown: "1 uso por sessão"
  },

  /* --- Nível 3 --- */
  {
    name: "Ritual do Olho que Tudo Vê",
    level: 3,
    category: "ritual",
    effect: "Cria um ponto de observação invisível em qualquer lugar que o conjurador já visitou e se lembra claramente, em até 1km de distância. O conjurador pode ver e ouvir por aquele ponto por até 10 minutos, em concentração total (não pode agir). O ponto se dissolve se for detectado por magia ou se o conjurador for interrompido.",
    castTime: "2 turnos de concentração ininterrupta (fora de combate)",
    cooldown: "1 uso por dia"
  },
  {
    name: "Ritual do Eco da Morte",
    level: 3,
    category: "ritual",
    effect: "Realizado sobre um cadáver morto há menos de 24 horas. O conjurador pode fazer até 3 perguntas ao espírito do morto — ele é obrigado a responder, mas pode omitir ou ser vago. O espírito então parte e não pode ser contactado novamente. Requer um objeto pessoal do morto.",
    castTime: "3 turnos ininterruptos (fora de combate)",
    cooldown: "1 uso por dia"
  },
  {
    name: "Ritual de Selamento",
    level: 3,
    category: "ritual",
    effect: "Sela uma porta, passagem, baú ou área (até 3x3 hex) com um glifo arcano. Qualquer criatura que cruzar o selo sem a senha recebe 2d8 de dano e fica Atordoada por 1 rodada. O selo dura até ser destruído (10 HP, Defesa 4) ou até 1 semana.",
    castTime: "2 turnos ininterruptos (fora de combate)",
    cooldown: "1 uso por dia"
  },

  /* --- Nível 4 --- */
  {
    name: "Ritual da Tempestade Interior",
    level: 4,
    category: "ritual",
    effect: "Canaliza energia elemental por 3 turnos de concentração total. Ao finalizar, descarrega uma tempestade de relâmpagos numa área de 5x5 hex visível, causando 4d10 de dano elétrico a todos os inimigos na área. Aliados na área sofrem apenas 1d6. Se o conjurador for interrompido durante os 3 turnos, sofre 2d8 de dano reflexivo e perde a magia.",
    castTime: "3 turnos de concentração ininterrupta",
    cooldown: "1 uso por 2 dias"
  },
  {
    name: "Ritual do Nome Verdadeiro",
    level: 4,
    category: "ritual",
    effect: "Exige pesquisa prévia (pelo menos 1 hora de estudo ou INT difícil). O conjurador pronuncia o Nome Verdadeiro de uma criatura inteligente visível. O alvo fica Dominado completamente por 1d4 rodadas (sem direito a teste). Funciona uma única vez por Nome — aprender outro Nome exige nova pesquisa.",
    castTime: "2 turnos de concentração ininterrupta",
    cooldown: "1 uso por semana por Nome"
  },

  /* --- Nível 5 --- */
  {
    name: "Ritual do Fim do Mundo Menor",
    level: 5,
    category: "ritual",
    effect: "O conjurador e até 2 ajudantes (que gastam 1 Ação de Magia cada) concentram-se por 4 turnos ininterruptos. Ao completar, invocam um evento catastrófico localizado: uma tempestade, um terremoto, uma erupção ou uma inundação em até 300 metros. O evento dura 10 minutos reais, destrói estruturas frágeis, altera o terreno permanentemente e causa 5d12 de dano a tudo na área (aliados incluídos). O conjurador fica Exausto por 24 horas após o ritual.",
    castTime: "4 turnos de concentração ininterrupta (+ 2 ajudantes)",
    cooldown: "1 uso por semana"
  },
  {
    name: "Ritual de Ligação de Alma",
    level: 5,
    category: "ritual",
    effect: "Liga permanentemente a vida do conjurador à de um aliado consentidor. Enquanto o vínculo existir: se qualquer um dos dois cair a 0 HP, o outro transfere automaticamente metade de seu HP atual para salvá-lo. Ambos compartilham percepção de distância (sabem se o outro está em perigo, ferido ou morto). Quebrar o vínculo voluntariamente custa 2d10 HP a ambos. Requer sangue de ambos e 10 minutos de ritual.",
    castTime: "10 minutos (fora de combate, com consentimento mútuo)",
    cooldown: "Permanente (1 vínculo ativo por conjurador)"
  },

];

/* ──────────────────────────────────────────────────────────────────────
   INVOCAÇÕES — criam aliados com condições por nível de poder
   Regra geral de condição:
     Nv1-2: sem condição especial além do custo normal.
     Nv3:   conjurador precisa de INT ou SAB ≥ 2.
     Nv4:   Foco contínuo — conjurador perde 1 Ação de Magia por turno
            para manter a invocação ativa (perder significa dissolução).
     Nv5:   1 turno completo de ritual + custo de recurso de classe
            (Mana, Fúria, Foco ou Fé conforme a classe).
   ────────────────────────────────────────────────────────────────────── */

const SPELLS_INVOCATION = [

  /* --- Nível 1 --- */
  {
    name: "Invocar Familiar Arcano",
    level: 1,
    category: "invocacao",
    condition: "Nenhuma condição especial.",
    effect: "Invoca um familiar de tamanho Pequeno (corvo, rato, gato, víbora) com HP 6, Defesa 1, sem ataques úteis em combate. O familiar pode explorar, escutar, carregar objetos leves e transmitir o que vê ao conjurador (raio 30 hex). Dissolve-se se reduzido a 0 HP ou ao fim da sessão.",
    castTime: "1 Ação (instantânea)",
    cooldown: "1 uso por sessão"
  },
  {
    name: "Invocar Guardião de Pedra",
    level: 1,
    category: "invocacao",
    condition: "Nenhuma condição especial. Requer um pedaço de pedra para servir de âncora.",
    effect: "Invoca um pequeno golem de pedra (HP 12, Defesa Física 4, sem Defesa Mágica) que ocupa um hexágono. O golem pode atacar (1d4 de dano de impacto), bloqueando passagem. Dissolve-se após 3 rodadas ou ao ser destruído.",
    castTime: "1 Ação (instantânea)",
    cooldown: "3 usos por batalha"
  },

  /* --- Nível 2 --- */
  {
    name: "Invocar Espírito Guerreiro",
    level: 2,
    category: "invocacao",
    condition: "Nenhuma condição especial.",
    effect: "Invoca um espírito em forma de guerreiro etéreo (HP 20, Defesa Física 2, Defesa Mágica 3). O espírito ataca com 1d8 de dano etéreo, imune a veneno. Age no turno do conjurador com 2 Ações. Dissolve-se após 4 rodadas ou ao ser reduzido a 0 HP.",
    castTime: "1 Ação (instantânea)",
    cooldown: "2 usos por batalha"
  },
  {
    name: "Invocar Enxame de Sombras",
    level: 2,
    category: "invocacao",
    condition: "Deve ser conjurada em ambiente de pouca luz ou sombra.",
    effect: "Invoca um enxame de criaturas sombrias que ocupa área 2x2 hex. Qualquer inimigo que iniciar ou terminar o turno na área sofre 1d6 de dano de sombra e fica com −1d4 na Chance de Acerto por 1 rodada. O enxame se move 2 hex por turno (controlado pelo conjurador). Dissolve-se após 3 rodadas ou à luz plena.",
    castTime: "1 Ação (instantânea)",
    cooldown: "2 usos por batalha"
  },

  /* --- Nível 3 --- */
  {
    name: "Invocar Lobo das Névoas",
    level: 3,
    category: "invocacao",
    condition: "Requer INT ou SAB ≥ 2. Funciona apenas à noite ou em locais sem luz solar direta.",
    effect: "Invoca um Lobo das Névoas (HP 45, Defesa Física 4, Defesa Mágica 4, Esquiva 14). O lobo ataca com 1d8+1d4 de dano e aplica Medo em alvos que errem um teste de Resistência (normal). Age no turno do conjurador com 2 Ações e 1 Reação. Dura 5 rodadas ou até ser destruído.",
    castTime: "1 turno completo de conjuração",
    cooldown: "1 uso por dia"
  },
  {
    name: "Invocar Elemental Menor",
    level: 3,
    category: "invocacao",
    condition: "Requer INT ou SAB ≥ 2. O conjurador escolhe fogo, água, terra ou ar. Requer um fragmento do elemento (cinzas, água, pedra ou vento capturado).",
    effect: "Invoca um elemental de tamanho Normal (HP 50, Defesa Física 5, Defesa Mágica 2, Esquiva 12). Ataque varia por elemento: Fogo 1d10 de fogo; Água 1d8 + Empurrar 2 hex; Terra 1d10 + Prostrado; Ar 1d6 + Cegante. Age com 2 Ações no turno do conjurador. Dura até ser destruído ou 4 rodadas.",
    castTime: "1 turno completo de conjuração",
    cooldown: "1 uso por dia"
  },

  /* --- Nível 4 --- */
  {
    name: "Invocar Guardião do Abismo",
    level: 4,
    category: "invocacao",
    condition: "Requer Foco contínuo: o conjurador gasta 1 Ação de Magia por turno para manter o Guardião ativo. Se não puder ou não quiser gastar, o Guardião se dissolve imediatamente.",
    effect: "Invoca um Guardião do Abismo de tamanho Grande (HP 90, Defesa Física 7, Defesa Mágica 6, Esquiva 13). Ataca com 1d12+1d6 de dano de vazio e pode usar Rugido do Abismo (1x por combate): todos os inimigos em raio 3 hex testam SAB (difícil) ou ficam Aterrorizados por 2 rodadas. Age com 3 Ações no turno do conjurador.",
    castTime: "2 turnos de concentração ininterrupta",
    cooldown: "1 uso por dia"
  },
  {
    name: "Invocar a Sombra do Rei Morto",
    level: 4,
    category: "invocacao",
    condition: "Requer Foco contínuo (1 Ação de Magia por turno). Só pode ser conjurada num local onde alguém morreu. O conjurador deve saber o nome de alguém que morreu no local.",
    effect: "Invoca a sombra de um guerreiro ou líder morto (HP 80, Defesa Física 3, Defesa Mágica 9, Esquiva 15, imune a dano físico não-mágico). A Sombra ataca com 1d10+1d6 de dano frio e aplica Corrupção: −1d4 em todos os atributos do alvo por 3 rodadas (não acumula). Age com 3 Ações no turno do conjurador.",
    castTime: "2 turnos de concentração ininterrupta",
    cooldown: "1 uso por 2 dias"
  },

  /* --- Nível 5 --- */
  {
    name: "Invocar Lobo do Vazio",
    level: 5,
    category: "invocacao",
    condition: "Ritual de 1 turno completo + custo de recurso de classe (4 Mana, 4 Fúria, 4 Foco ou 4 Fé). Apenas à noite ou em locais amaldiçoados. Se o conjurador tiver o Dente do Primeiro Lobo equipado, o custo de recurso cai para 2.",
    effect: "Invoca um Lobo do Vazio (HP 130, Defesa Física 7, Defesa Mágica 8, Esquiva 16). Passo do Vazio: pode se teletransportar 6 hex como Reação. Mordida do Vazio: 1d12+1d8 + Corrupção (−1 HP máximo por 3 rodadas). Uivo do Fim (1x/combate): Aterroriza todos os inimigos em raio 8 hex. Age com 3 Ações e 2 Reações. Dura 4 rodadas ou até ser destruído. Ao ser destruído, cria uma explosão de 1d10 de dano de vazio em raio 2 hex.",
    castTime: "1 turno completo de ritual + custo de recurso",
    cooldown: "1 uso por semana"
  },
  {
    name: "Invocar a Serpente Imortal",
    level: 5,
    category: "invocacao",
    condition: "Ritual de 1 turno completo + custo de recurso (4 de qualquer recurso). Apenas em templos de Jurgmund ou regiões de Serpentara. Se o conjurador carregar um item Mágico+ abençoado por Jurgmund, o ritual é apenas 2 turnos e não custa recurso.",
    effect: "Invoca uma manifestação menor da Serpente Imortal de tamanho Grande (HP 150, Defesa Física 8, Defesa Mágica 10, Esquiva 14, imune a veneno). Mordida Divina: 2d10+1d8 + Veneno Divino (2d6 por rodada, 3 rodadas, resistência SAB difícil). Constrição: Agarrada causa 1d12 por rodada. Muda Sagrada (1x): quando reduzida a 60 HP, cura 30 HP e remove condições. Age com 3 Ações e 1 Reação. Dura 5 rodadas.",
    castTime: "1 turno completo de ritual + custo de recurso",
    cooldown: "1 uso por semana"
  },
  {
    name: "Invocar o Avatar da Tempestade",
    level: 5,
    category: "invocacao",
    condition: "Ritual de 1 turno completo + custo de recurso (4 Mana ou INT ≥ 4 como pré-requisito permanente). Só pode ser invocado durante uma tempestade real ou com o Cajado da Tormenta equipado.",
    effect: "Invoca um Avatar da Tempestade de tamanho Colossal (HP 180, Defesa Física 6, Defesa Mágica 12, Esquiva 15). Relâmpago Contínuo: a cada turno, 2d10 de dano elétrico a um alvo automaticamente (sem custo de Ação). Trovão (1 Ação): 3d8 de dano em área 3x3 hex + Atordoado (SAB normal para resistir). Nevasca de Atrelon (1x, Ação de Magia): ativa o efeito de Nevasca em todo o campo por 5 turnos. Age com 2 Ações extras além das automáticas. Dura 4 rodadas ou até ser destruído.",
    castTime: "1 turno completo de ritual + custo de recurso",
    cooldown: "1 uso por semana"
  },

  /* --- Bônus: Nível 3 temático Lobo/Cobra --- */
  {
    name: "Invocar Cobras Sagradas de Jurgmund",
    level: 3,
    category: "invocacao",
    condition: "Requer SAB ≥ 2. O conjurador deve fazer um gesto de serpente e tocar o solo — se num local sagrado de Jurgmund, a conjuração é instantânea sem custo de turno.",
    effect: "Invoca 1d4+1 cobras sagradas (HP 10 cada, Defesa 2, Esquiva 14). Cada cobra ataca com 1d4 + Veneno Sagrado (1d6 por rodada, 2 rodadas). As cobras agem conjuntamente no turno do conjurador com 1 Ação cada. Se 3 ou mais atacam o mesmo alvo no mesmo turno, ele deve testar Resistência (difícil) ou fica Paralisado por 1 rodada. Dissolvem-se após 4 rodadas ou ao serem destruídas.",
    castTime: "1 turno completo de conjuração",
    cooldown: "1 uso por dia"
  },

];

/* ──────────────────────────────────────────────────────────────────────
   COMO ADICIONAR AO DATA.JS:

   Opção A — Magias gerais (disponíveis para qualquer classe via grimório):
   Dentro do array GENERAL_SPELLS, adicione os objetos desejados.
   O campo "category" é opcional mas recomendado para futura filtragem.
   O campo "condition" (nas invocações) pode ser incorporado ao "effect".

   Opção B — Magias exclusivas de classe:
   Dentro da propriedade spellsFull de uma classe, adicione os objetos.
   Buffs combinam melhor com Clérigo/Mago.
   Invocações combinam melhor com Mago ou um possível Invocador.
   Rituais combinam com qualquer conjurador de nível médio-alto.

   Opção C — Array separado (requer atualizar getAllSpellsInGame):
   Adicione como const SPELLS_BUFF, SPELLS_RITUAL, SPELLS_INVOCATION
   e inclua-os em getAllSpellsInGame() assim:
     [...SPELLS_BUFF, ...SPELLS_RITUAL, ...SPELLS_INVOCATION].forEach(s =>
       list.push({ ...s, origin: "Grimório Avançado" })
     );
   ────────────────────────────────────────────────────────────────────── */
