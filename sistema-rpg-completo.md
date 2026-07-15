# Sistema de RPG de Mesa — Manual de Combate e Classes

> Versão 1.0 — Documento de regras, classes, habilidades, magias, perícias, equipamentos e sistema de combate em grid hexagonal.

---

## 1. Visão Geral do Sistema

Este é um RPG tático que utiliza **dados variados (d4, d6, d8, d10, d12, d20)** para resolver dano, e o **d10** como dado universal de resolução de ações (acerto, defesa, perícias). O combate ocorre em um **campo hexagonal**, favorecendo posicionamento, alcance e controle de espaço.

Os cinco atributos do sistema são:

| Atributo | Sigla | Domínio geral |
|---|---|---|
| Força | FOR | Dano físico bruto, capacidade de carga, vida |
| Destreza | DEX | Precisão de ataque, defesa contra ataques, iniciativa parcial |
| Agilidade | AGI | Movimento, número de ações, esquiva |
| Inteligência | INT | Slots de magia, dano arcano, perícias de conhecimento |
| Sabedoria | SAB | Slots de magia, resistência mental, percepção, cura |

Cada classe interage de forma diferente com esses cinco atributos — isso é detalhado na seção 6 (Classes).

---

## 2. Atributos: Efeitos Mecânicos Gerais

Estes são os efeitos **base**, válidos para todos os personagens independente de classe. As classes adicionam bônus *extras* em cima destes (ver seção 6).

### 2.1 Força (FOR)
- **+3 HP** por ponto de FOR (base universal; classes marciais ganham mais — ver seção 6).
- Define o **dano natural mínimo** em combate desarmado e bônus de dano corpo a corpo com armas pesadas (ver seção 8).
- Determina capacidade de carga de equipamento (itens pesados, armaduras pesadas, escudos pesados).
- Pré-requisito para empunhar armas de FOR alta (machados grandes, martelos, escudos pesados) sem penalidade.

### 2.2 Destreza (DEX)
- Define a **Chance de Acerto** em ataques corpo a corpo e à distância (ver seção 3).
- Define a **Chance de Defesa** base contra ataques físicos (ver seção 4).
- Contribui para o número de **Ações por turno** (junto com AGI).
- Pré-requisito para armas leves/de precisão (adagas, arcos, varinhas) com bônus de acerto.

### 2.3 Agilidade (AGI)
- Define o **Movimento** em hexágonos: Movimento = 4 (base) + 1 por ponto de AGI.
- Contribui para o número de **Ações por turno** (junto com DEX).
- Define a ordem de **Iniciativa** (quem age primeiro no turno, em conjunto com DEX).
- Permite reações extras (esquivas, ataques de oportunidade) em níveis altos — ver seção 5.

### 2.4 Inteligência (INT)
- Contribui para os **Slots de Magia** (junto com SAB).
- Define dano de magias arcanas e perícias de conhecimento técnico/erudito.
- Reduz custo de algumas habilidades de amplificação de magia (mago).

### 2.5 Sabedoria (SAB)
- Contribui para os **Slots de Magia** (junto com INT).
- Define poder de cura, resistência a efeitos mentais/ilusórios, e percepção (detectar emboscadas, furtividade inimiga).
- Base de dano para magias de cura e suporte (clérigo).

---

## 3. Chance de Acerto (Ataque)

A resolução de ataque usa **1d10**. O atacante acerta se o resultado for **igual ou menor** que sua Chance de Acerto.

### 3.1 Cálculo da Chance de Acerto

```
Chance de Acerto = 5 (base) + (DEX do atacante − DEX do defensor)
```

- Se o atacante tiver **mais DEX** que o defensor, sua chance de acerto **sobe** acima de 5.
- Se o atacante tiver **menos DEX**, sua chance de acerto **cai** abaixo de 5.
- **Limite máximo: 8.** Não importa a diferença de DEX, a chance de acerto nunca passa de 8-ou-menos no d10.
- **Limite mínimo: 2.** A chance de acerto nunca cai abaixo de 2-ou-menos (sempre existe uma chance mínima de acerto), exceto em condições especiais (cegueira, alvo invisível, etc., a critério do mestre).

**Exemplo do sistema-base:** Personagem com DEX 3 ataca um inimigo com DEX 4. Como o inimigo tem mais DEX, é o inimigo quem teria a chance ampliada se fosse ele o atacante; quando o **inimigo ataca o personagem**, sua chance de acerto é 5 + (4−3) = **6 ou menos no d10**.

### 3.2 Resultados no dado de ataque

| Resultado no d10 | Efeito |
|---|---|
| 1 até a Chance de Acerto | **Acerto** |
| 9 | **Erro normal** |
| 10 | **Erro crítico** (ver efeitos abaixo) |

> Atenção: 9 e 10 são **sempre erro**, mesmo que a Chance de Acerto calculada fosse maior que 8 — por isso o limite máximo de 8 garante que sempre reste ao menos a chance de 9 e 10 falharem.

**Erro Crítico (10 no d10):** o atacante sofre uma consequência negativa adicional, a critério do mestre — pode incluir: perder a arma (precisa gastar 1 ação para recuperá-la), abrir a guarda (próximo ataque contra ele tem +2 na Chance de Acerto do oponente), tropeçar (cai sentado, gasta 1 ação para se levantar), ou atingir um alvo aliado próximo, se houver.

**Acerto Crítico (resultado = 1):** dano dobrado da fonte de dano da arma (não dobra o dano natural nem reduções de defesa). Opcional: o mestre pode também tratar "1" como crítico automático mesmo se a Chance de Acerto calculada for menor que 1 (o que nunca ocorre, já que o mínimo é 2).

### 3.3 Múltiplos Ataques no Turno

Um personagem pode realizar múltiplos ataques no mesmo turno, desde que tenha Ações suficientes (ver seção 5). Cada ataque é resolvido **individualmente** com seu próprio d10 de acerto, e cada ataque que acerta soma à quantidade de "ataques acertados" usada no cálculo de dano final (ver seção 7).

---

## 4. Chance de Defesa

Quando um personagem é atacado, ele pode tentar se **defender** ativamente (anular o ataque) em vez de simplesmente confiar na Chance de Acerto do oponente falhar. A defesa ativa consome **reações** (ver seção 5.3) e depende do tipo de equipamento usado para defender.

### 4.1 Defesa Base

```
Chance de Defesa Base = 5 ou menos no d10
```

Esse valor é **modificado pelo tipo de equipamento usado para defender** e **degrada a cada tentativa de defesa adicional no mesmo turno** (fadiga de reação):

| Equipamento de defesa | Chance de Defesa inicial | Degradação por tentativa adicional no turno |
|---|---|---|
| Arma de uma mão (espada, machado de uma mão, etc.) | 5 ou menos | **−1** por tentativa (5 → 4 → 3 → 2...) |
| Adaga, varinha, grimório, orbe | 5 ou menos | **−2** por tentativa (5 → 3 → 1...) |
| Escudo (padrão) | 5 ou menos | **Não degrada** (sempre 5 ou menos) |
| Escudo pesado | 5 ou menos | Não degrada. Veja penalidade abaixo. |
| Desarmado / arma de duas mãos | — | **Não pode defender ativamente** (apenas esquiva passiva via AGI, a critério do mestre) |

**Exemplo do sistema-base:** Um personagem com espada de uma mão é atacado 3 vezes no mesmo turno e tenta defender todas. Ele defende o 1º ataque com 5-ou-menos, o 2º com 4-ou-menos, o 3º com 3-ou-menos.

**Escudos pesados:** concedem **+6 de Defesa Física fixa** (reduz o dano recebido em 6, antes da fórmula final de dano — ver seção 7), mas impõem **−1 na Chance de Acerto** de quem os porta enquanto equipados (escudos pesados são lentos para atacar com a mão livre).

### 4.2 Resultado da Defesa

| Resultado no d10 | Efeito |
|---|---|
| 1 até a Chance de Defesa atual | **Defesa bem-sucedida** — o ataque é anulado, dano = 0 (não entra na contagem de "ataques acertados" da seção 7) |
| Acima da Chance de Defesa | **Defesa falha** — o ataque segue para o cálculo normal de dano |

A defesa ativa é **opcional por ataque recebido**: o jogador escolhe, a cada ataque sofrido, se quer gastar uma reação para tentar defender ou simplesmente sofrer o dano (ou já não ter reações disponíveis).

---
## 5. Movimento, Ações e Grid Hexagonal

### 5.1 Movimento

```
Movimento (em hexágonos) = 4 (base) + 1 por ponto de AGI
```

Mover-se por um hexágono adjacente custa **1 ponto de movimento**. Terreno difícil (a critério do mestre: escombros, neve funda, lama) custa **2 pontos de movimento** por hexágono. Mover-se não custa Ações diretamente, mas movimento e ações compartilham o mesmo turno — um personagem pode mover e agir no mesmo turno, mas mover-se através de **hexágonos adjacentes a inimigos** pode provocar **Ataques de Oportunidade** (ver 5.4).

### 5.2 Ações por Turno

```
Ações por Turno = AGI + DEX
```

Cada Ação pode ser usada para:

| Tipo de ação | Custo |
|---|---|
| Ataque corpo a corpo ou à distância | 1 Ação |
| Usar uma habilidade de classe | 1 Ação (salvo indicação contrária na habilidade) |
| Conjurar uma magia | 1 Ação + custo de Slot correspondente |
| Trocar de arma / sacar item da mochila | 1 Ação |
| Ajudar um aliado (ex.: erguer, estabilizar) | 1 Ação |
| Recarregar/preparar (armas de recarga lenta, a critério do mestre) | 1 Ação |

Ações não usadas em um turno **não acumulam** para o turno seguinte.

### 5.3 Reações

Reações são um **subconjunto separado de Ações** usado *fora do próprio turno do personagem*, geralmente para se defender ou aproveitar uma brecha criada por outro personagem.

```
Reações disponíveis por rodada = 1 (base) + 1 reação adicional a cada 4 pontos de AGI (arredondado para baixo)
```

Exemplos de uso de Reação:
- **Defender-se** de um ataque (seção 4).
- **Ataque de Oportunidade** (seção 5.4).
- **Habilidades reativas** específicas de classe (ex.: Contra-ataque do guerreiro, Esquiva Felina do ladino — ver seção 6).

Reações não usadas se perdem ao fim da rodada (não acumulam).

### 5.4 Ataques de Oportunidade

Quando um personagem (ou inimigo) se move **saindo de um hexágono adjacente** a um oponente sem usar uma ação específica de "recuo cauteloso" ou similar, o oponente pode gastar **1 Reação** para realizar um **Ataque de Oportunidade**:

- Resolvido como um ataque corpo a corpo normal (Chance de Acerto conforme seção 3), mas com a arma que o personagem está empunhando no momento.
- Pode ser feito mesmo que o personagem já tenha usado todas suas Ações naquele turno, desde que tenha Reação disponível.
- **Movimento Cauteloso (ação especial):** ao custo de 1 Ação adicional, um personagem pode se retirar de um hexágono adjacente a um inimigo **sem provocar** Ataque de Oportunidade (recuo controlado, escudo erguido, etc.).
- Personagens que terminam o movimento **passando por** (não apenas saindo de) um hexágono adjacente a um inimigo também expõem-se a **um único** Ataque de Oportunidade por inimigo adjacente durante a passagem (não um por hexágono percorrido).

### 5.5 Outras Reações de Combate no Grid

- **Avanço de Flanco:** se dois aliados estão em hexágonos adjacentes opostos (ou quase opostos, a critério do mestre — separados por no máximo 1 hexágono de diferença angular) ao mesmo inimigo, ambos ganham **+1 na Chance de Acerto** contra esse inimigo (bônus de flanqueamento).
- **Bloqueio de Passagem:** um personagem com escudo equipado pode gastar 1 Reação para impor **Movimento Difícil (custo dobrado)** a um inimigo que tente atravessar um hexágono adjacente a ele.
- **Provocar (Guerreiro, ver seção 6):** força um inimigo a preferir atacá-lo no próximo turno, abrindo brechas para os aliados.
- **Cobertura à Distância (Arqueiro/Ladino):** ao gastar 1 Reação quando um aliado se move para fora do alcance visual de um inimigo, o atacante à distância pode realizar um ataque imediato contra esse inimigo se ele tentar perseguir o aliado (interceptação).

---

## 6. Sistema de Dano

### 6.1 Fórmula de Dano

```
Dano por ataque = (Dano da Arma + Dano Natural) − Defesa (Física ou Mágica, conforme o ataque)

Dano Total no turno = Dano por ataque × Quantidade de Ataques Acertados
```

- **Dano da Arma:** soma de dados conforme a arma equipada (d4 a d20, podendo ser múltiplos dados de fontes diferentes — ex.: 1d12 + 2d4 de um encantamento).
- **Dano Natural:** dano inerente ao personagem (postura, força física, garras, etc.), normalmente um dado pequeno (1d4 a 1d6) somado conforme FOR ou classe.
- **Defesa Física:** reduz dano de ataques físicos (corpo a corpo e à distância não-mágicos). Vem de armadura + escudo + bônus de classe.
- **Defesa Mágica:** reduz dano de magias e ataques mágicos. Vem de itens mágicos, resistências e bônus de classe (mago/clérigo costumam ter mais).
- O resultado mínimo de **Dano por ataque é 0** (dano não fica negativo quando a Defesa supera o total ofensivo).
- Quando há **múltiplos ataques acertados no mesmo turno contra o mesmo alvo**, o dano de cada ataque é calculado individualmente (a Defesa se aplica a cada acerto), e depois somados — na prática, multiplicar pela "quantidade de ataques acertados" só é um atalho válido quando todos os ataques usam a mesma arma e mesmo dano natural; ataques com fontes diferentes (ex.: espada + magia no mesmo turno) devem ser calculados separadamente e depois somados.

### 6.2 Exemplo Completo de Resolução de Combate

> **Cenário:** Theron (Guerreiro, DEX 4, FOR 5) ataca Grokk (orc inimigo, DEX 3, Defesa Física 4) duas vezes no turno, usando uma espada longa de uma mão (1d10 de dano da arma) + dano natural 1d4 (de FOR).

**Passo 1 — Chance de Acerto:**
Chance de Acerto de Theron = 5 + (4 − 3) = 6 ou menos no d10 (dentro do limite de 8).

**Passo 2 — Rolagens de Acerto (1d10 por ataque):**
- Ataque 1: rola 4 → **acerto** (4 ≤ 6).
- Ataque 2: rola 7 → **erro** (7 > 6).

**Passo 3 — Grokk tenta se defender do Ataque 1 (ele tem escudo):**
Chance de Defesa de Grokk = 5 ou menos. Rola 1d10, resultado 8 → **defesa falha**, o ataque 1 causa dano.

**Passo 4 — Cálculo de Dano (apenas o Ataque 1 acertou e não foi defendido):**
- Dano da Arma: 1d10 → resultado 7.
- Dano Natural: 1d4 → resultado 3.
- Defesa Física de Grokk: 4.
- Dano do ataque = (7 + 3) − 4 = **6 de dano**.

**Passo 5 — Total do turno:**
Como apenas 1 ataque acertou e não foi defendido, o Dano Total no turno = 6.

---
## 7. Vida (HP) e Slots de Magia

### 7.1 Vida (HP)

```
HP = 20 (base) + (FOR × 3) + Bônus de Classe por FOR + Bônus de Nível
```

O **Bônus de Classe por FOR** varia por classe (detalhado na seção 8) — classes marciais (Guerreiro, Clérigo) convertem FOR em vida de forma mais eficiente que classes frágeis (Mago, Arqueiro, Ladino).

| Classe | HP por ponto de FOR (além da base de +3) |
|---|---|
| Guerreiro | +2 extra (total +5 por ponto de FOR) |
| Clérigo | +1 extra (total +4 por ponto de FOR) |
| Arqueiro | +0 extra (total +3 por ponto de FOR) |
| Ladino | +0 extra (total +3 por ponto de FOR) |
| Mago | −1 (total +2 por ponto de FOR) |

**Bônus de Nível:** a cada nível de personagem, some +5 HP (todas as classes), além do recálculo de FOR caso o atributo aumente.

### 7.2 Slots de Magia

```
Slots de Magia = INT + SAB
```

Os slots representam a "energia mágica" disponível por **dia** (ou por "descanso longo", a critério do mestre). Magias têm um **Nível de Força** de 1 a 5, e cada nível consome uma quantidade de slots ao ser conjurada:

| Nível da Magia | Custo em Slots |
|---|---|
| Nível 1 (menor) | 1 slot |
| Nível 2 | 2 slots |
| Nível 3 | 3 slots |
| Nível 4 | 4 slots |
| Nível 5 (maior) | 5 slots |

Um personagem só pode conjurar magias de Nível igual ou inferior ao permitido por sua classe/nível de personagem (ver progressão na seção de cada classe). Slots gastos voltam após um descanso longo.

**Habilidades que consomem Mana/Fúria/Foco** (recursos de classe específicos, como MP de mago ou Fúria de guerreiro) são **separadas** dos Slots de Magia — ver seção 8.

---

## 8. Classes — Visão Geral

O sistema possui 5 classes: **Guerreiro, Mago, Arqueiro, Ladino e Clérigo**. Cada uma tem:

- Um **recurso de classe** próprio para ativar habilidades (Fúria, Mana, Foco, Furtividade/Veneno, Fé).
- Uma interação distinta com os 5 atributos.
- Uma árvore de **6 a 8 habilidades**.
- Uma lista de **magias** (quando aplicável) e **perícias** próprias.

### 8.1 Tabela-Resumo de Interação com Atributos

| Classe | FOR | DEX | AGI | INT | SAB |
|---|---|---|---|---|---|
| **Guerreiro** | +2 HP extra por ponto; +1 dano natural a cada 2 pontos | Acerto/Defesa padrão | Movimento padrão | Sem uso direto | Resistência mental leve |
| **Mago** | −1 HP por ponto (frágil) | Acerto/Defesa padrão (penalizado em combate corpo a corpo) | Movimento padrão | Slots + dano de magia + reduz custo de Mana das habilidades | Slots + resistência a controle mental |
| **Arqueiro** | Dano natural leve | **+1 Chance de Acerto à distância a cada 2 pontos** | Movimento + bônus de reposicionamento (recarregar grátis ao mover) | Perícias de natureza/identificação | Percepção/pontaria fina (marcar alvos) |
| **Ladino** | Dano natural leve | Acerto/Defesa padrão; furtividade (parcial) | **+1 dano em ataques furtivos a cada 2 pontos de AGI**; AGI conta em dano de ataque furtivo | Perícias de investigação | Perícia de detectar armadilhas/mentiras |
| **Clérigo** | +1 HP extra por ponto | Acerto/Defesa padrão | Movimento padrão | Sem uso direto | Slots + poder de cura + dano de magia sagrada |

> Esta tabela resume; os detalhes completos de cada bônus estão na seção da respectiva classe (9 a 13).

### 8.2 Recursos de Classe (Resumo)

| Classe | Recurso | Como recupera |
|---|---|---|
| Guerreiro | **Fúria** (0 a 5, ganha em combate) | Ganha ao acertar/receber golpes; reseta a 0 fora de combate |
| Mago | **MP** (Mana) | Recupera com descanso curto/longo, separado dos Slots de Magia |
| Arqueiro | **Foco** (0 a 5, ganha ao acertar à distância) | Ganha ao acertar ataques à distância; reseta fora de combate |
| Ladino | **Furtividade/Veneno** (cargas) | Recupera cargas de veneno com descanso; furtividade depende de não ser detectado |
| Clérigo | **Fé** (separada dos Slots de Magia, usada para curas menores rápidas) | Recupera com descanso curto/longo |

---
## 9. Classe: Guerreiro

**Papel:** dano físico sustentado, resistência, controle de linha de frente.
**Recurso de classe:** **Fúria** (0 a 5 pontos).

### 9.1 Fúria

- Começa cada combate em **0**.
- Ganha **+1 Fúria** ao acertar um ataque corpo a corpo.
- Ganha **+1 Fúria** ao receber dano de um ataque (independente de bloquear ou não).
- Fúria máxima: **5**.
- Habilidades de guerreiro consomem Fúria conforme indicado em cada uma.
- Fúria não usada se perde ao fim do combate (não acumula entre combates).

### 9.2 Interação com Atributos

| Atributo | Efeito específico do Guerreiro |
|---|---|
| FOR | +2 HP extra por ponto (total +5 HP/ponto); a cada 2 pontos de FOR, +1 no Dano Natural |
| DEX | Padrão (acerto/defesa) |
| AGI | Padrão (movimento/ações); reações extras ajudam no Bloqueio de Passagem |
| INT | Sem uso direto |
| SAB | A cada 3 pontos, +1 de Defesa Mágica fixa (resistência mental de guerreiro endurecido) |

### 9.3 Árvore de Habilidades (Fúria)

| Habilidade | Custo | Efeito |
|---|---|---|
| **Golpe Pesado** | 2 Fúria, 1 Ação | Próximo ataque corpo a corpo causa +1d6 de dano adicional. |
| **Postura Defensiva** | 1 Fúria, 1 Ação | Até o início do próximo turno, ganha +2 na Chance de Defesa (todas as tentativas) e não degrada na primeira defesa do turno. |
| **Provocar** | 1 Fúria, 1 Reação | Força um inimigo em alcance corpo a corpo a ter −2 na Chance de Acerto contra qualquer alvo que não seja o Guerreiro até o fim da próxima rodada. |
| **Contra-ataque** | 2 Fúria, 1 Reação | Quando defende com sucesso um ataque corpo a corpo, pode imediatamente realizar 1 ataque corpo a corpo contra o atacante sem gastar Ação. |
| **Fúria Sangrenta** | 3 Fúria, 1 Ação | Pelos próximos 2 turnos, +2 no Dano Natural, mas −1 na Chance de Defesa (o Guerreiro abre a guarda para golpear com mais força). |
| **Grito de Guerra** | 3 Fúria, 1 Ação | Todos os aliados em até 2 hexágonos ganham +1 na Chance de Acerto até o fim da próxima rodada. |
| **Quebra-Guarda** | 2 Fúria, 1 Ação | Ataque corpo a corpo que, se acertar, ignora Defesa Física do alvo proveniente de escudo (a defesa de armadura ainda se aplica). |
| **Última Resistência** | 5 Fúria (todos), 1 Ação | Quando o HP do Guerreiro está em 25% ou menos, pode gastar toda a Fúria para curar 1d10 + FOR de HP imediatamente. Uso único por combate. |

### 9.4 Perícias

| Perícia | Atributo associado | Uso típico |
|---|---|---|
| **Combate com Armas Pesadas** | FOR | Reduz penalidades de armas grandes (machados de duas mãos, martelos); facilita testes de manejo. |
| **Combate com Armas Leves** | DEX | Melhora manejo de espadas curtas, adagas usadas pelo guerreiro. |
| **Resistência Física** | FOR | Testes para resistir a venenos, fadiga, efeitos físicos debilitantes. |
| **Intimidação** | FOR ou SAB (à escolha) | Testes sociais de ameaça e imposição em combate ou diálogo. |
| **Tática de Campo** | INT | Avaliar terreno, identificar pontos fracos de formação inimiga. |
| **Atletismo** | FOR/AGI | Escalar, saltar entre hexágonos elevados, arrombar portas. |

---
## 10. Classe: Mago

**Papel:** dano arcano em área/single-target de alto impacto, controle de campo de batalha.
**Recurso de classe:** **MP (Mana)** — separado dos Slots de Magia, usado para **habilidades de amplificação**.

### 10.1 MP (Mana)

```
MP Máximo = 10 + (INT × 2)
```

- MP recupera totalmente em descanso longo; recupera 25% (arredondado para baixo) em descanso curto.
- MP é consumido **apenas pelas habilidades de amplificação** abaixo — conjurar a magia em si consome **Slots de Magia** (seção 7.2), não MP.

### 10.2 Interação com Atributos

| Atributo | Efeito específico do Mago |
|---|---|
| FOR | −1 HP por ponto (total +2 HP/ponto — o mago é fisicamente frágil) |
| DEX | Padrão, mas o Mago sofre −2 na Chance de Acerto em combate corpo a corpo (não é treinado em luta próxima) |
| AGI | Padrão (movimento/ações) |
| INT | Cada ponto: Slots de Magia, +1 de dano em magias de dano por ponto a cada 2 pontos, reduz custo de MP das habilidades em 1 a cada 5 pontos (mín. custo 1) |
| SAB | Cada ponto: Slots de Magia, +1 Defesa Mágica a cada 2 pontos |

### 10.3 Árvore de Habilidades (MP — Amplificação de Magias)

| Habilidade | Custo | Efeito |
|---|---|---|
| **Amplificar Dano** | 3 MP | A próxima magia conjurada causa +1 dado extra do mesmo tipo de dano já usado na magia (ex.: magia de 2d6 vira 3d6). |
| **Conjuração Rápida** | 4 MP | A próxima magia é conjurada como Reação em vez de Ação (uma vez por turno). |
| **Eco Arcano** | 5 MP | A próxima magia de alvo único também atinge um segundo alvo adjacente ao primeiro, com metade do dano. |
| **Escudo Arcano** | 3 MP, 1 Reação | Cria uma barreira que absorve os próximos 1d8 + INT de dano (físico ou mágico) antes de se dissipar. |
| **Dreno de Mana** | 4 MP, 1 Ação | Ataque mágico de toque (alcance 1 hexágono): rouba 1d4 Slots de Magia de um inimigo conjurador e os converte em 2 MP por slot roubado. |
| **Reciclagem Arcana** | 6 MP | Recupera 1 Slot de Magia já gasto neste combate (uso único por combate). |
| **Sobrecarga** | 8 MP | A próxima magia ignora metade da Defesa Mágica do alvo, mas o Mago sofre 1d6 de dano de recuo. |
| **Domínio dos Elementos** | 5 MP | Escolhe um tipo de dano elemental (fogo, gelo, raio, etc.); pelas próximas 3 rodadas, magias desse tipo ganham +2 de dano fixo. |

### 10.4 Magias (consomem Slots de Magia, não MP)

| Magia | Nível (custo em Slots) | Dano/Efeito |
|---|---|---|
| **Mísseis Arcanos** | 1 | 1d6 + 1d4 de dano mágico em alvo único (alcance 6 hexágonos). |
| **Toque Gélido** | 1 | 1d8 de dano mágico (toque, alcance 1); reduz Movimento do alvo em 2 na próxima rodada. |
| **Bola de Fogo** | 2 | 2d6 de dano mágico em área (raio de 1 hexágono ao redor do ponto de impacto). |
| **Lança Elétrica** | 2 | 1d10 + 1d6 de dano mágico; atinge em linha reta por 3 hexágonos. |
| **Muralha de Gelo** | 3 | Cria uma barreira física de 3 hexágonos de comprimento que bloqueia movimento e linha de visão por 3 rodadas. |
| **Tempestade de Lâminas Arcanas** | 3 | 2d8 + 2d4 de dano em área (raio de 2 hexágonos), mas conjuração leva a rodada toda (não pode agir mais naquele turno). |
| **Meteoro Menor** | 4 | 3d10 de dano em área (raio de 2 hexágonos), com 1 rodada de "preparação" anunciada antes do impacto. |
| **Anulação Mágica** | 4 | Remove 1 efeito mágico ativo de um alvo (buff ou debuff) à escolha do conjurador. |
| **Cataclismo Arcano** | 5 | 4d10 + 4d6 de dano em área (raio de 3 hexágonos); custa todos os slots restantes se o conjurador tiver menos de 5 disponíveis (não pode ser conjurada com menos de 5 slots). |
| **Portal Instantâneo** | 5 | Teletransporta o conjurador e até 2 aliados adjacentes para qualquer ponto visível dentro de 10 hexágonos. |

### 10.5 Perícias

| Perícia | Atributo associado | Uso típico |
|---|---|---|
| **Arcanismo** | INT | Identificar magias, itens mágicos, runas. |
| **Conhecimento Arcano Histórico** | INT | Lore de criaturas mágicas, ruínas, eventos arcanos. |
| **Concentração** | SAB | Resistir a ser interrompido ao conjurar sob dano/pressão. |
| **Investigação Mágica** | INT | Detectar armadilhas mágicas, ilusões, portas secretas arcanas. |
| **Alquimia Básica** | INT | Criar componentes de magia, identificar poções/venenos mágicos. |

---
## 11. Classe: Arqueiro

**Papel:** dano à distância sustentado, controle de posicionamento, marcação de alvos prioritários.
**Recurso de classe:** **Foco** (0 a 5 pontos).

### 11.1 Foco

- Começa cada combate em **0**.
- Ganha **+1 Foco** ao acertar um ataque à distância.
- Ganha **+1 Foco** ao permanecer no mesmo hexágono por uma rodada inteira sem se mover (postura de tiro estável) — opcional, a critério do mestre.
- Foco máximo: **5**. Não usado se perde ao fim do combate.

### 11.2 Interação com Atributos

| Atributo | Efeito específico do Arqueiro |
|---|---|
| FOR | Dano natural leve (+1 a cada 3 pontos, usado em ataques corpo a corpo de emergência) |
| DEX | **+1 na Chance de Acerto à distância a cada 2 pontos** (além do cálculo padrão da seção 3) |
| AGI | Movimento padrão; **recarregar/preparar não consome Ação extra ao se mover** (reposicionamento ágil) |
| INT | Perícias de natureza e conhecimento orgânico |
| SAB | Percepção fina — base de "Marcar Alvo" e detecção de inimigos furtivos |

### 11.3 Árvore de Habilidades (Foco)

| Habilidade | Custo | Efeito |
|---|---|---|
| **Marcar Alvo** | 1 Foco, 1 Ação | Designa um inimigo visível como "Marcado" por 3 rodadas; todos os ataques à distância contra ele ganham +1 na Chance de Acerto. |
| **Tiro Certeiro** | 2 Foco, 1 Ação | Próximo ataque à distância ignora metade da Defesa Física do alvo. |
| **Disparo Múltiplo** | 3 Foco, 1 Ação | Dispara contra até 2 alvos diferentes em alcance, cada um resolvido como ataque separado com a Chance de Acerto normal. |
| **Tiro de Precisão** | 2 Foco, 1 Reação | Quando um inimigo entra em alcance de visão direta, pode disparar imediatamente como Reação (antes dele agir). |
| **Flecha Imobilizante** | 2 Foco, 1 Ação | Se acertar, reduz o Movimento do alvo em 3 na próxima rodada (flecha na perna/equipamento). |
| **Reposicionamento Tático** | 1 Foco, 1 Ação | Move até metade do Movimento total e dispara um ataque à distância ao final do movimento, sem penalidade. |
| **Chuva de Flechas** | 4 Foco, 1 Ação | Ataque em área (1 hexágono de raio); cada criatura na área sofre um ataque resolvido individualmente. |
| **Olho de Águia** | 3 Foco | Pelas próximas 3 rodadas, o alcance de todos os ataques à distância do Arqueiro aumenta em 4 hexágonos e ele ignora penalidades de cobertura parcial. |

### 11.4 Perícias

| Perícia | Atributo associado | Uso típico |
|---|---|---|
| **Pontaria** | DEX | Testes de precisão em condições adversas (vento, pouca luz, alvo em movimento). |
| **Sobrevivência** | SAB | Rastrear, encontrar comida/água, ler o terreno. |
| **Conhecimento de Fauna/Flora** | INT | Identificar criaturas, venenos naturais, ervas. |
| **Percepção** | SAB | Detectar emboscadas, inimigos furtivos, armadilhas físicas. |
| **Manutenção de Equipamento** | DEX | Reparar/produzir flechas, cordas de arco, armadilhas simples. |
| **Furtividade Leve** | AGI | Movimentação silenciosa (menor que a do Ladino, sem bônus de ataque furtivo). |

---
## 12. Classe: Ladino

**Papel:** dano explosivo em alvo único, furtividade, controle de informação (armadilhas, fechaduras), mobilidade.
**Recurso de classe:** **Furtividade / Cargas de Veneno**.

### 12.1 Furtividade e Cargas de Veneno

- **Furtividade** não é um "medidor" numérico — é um **estado** (Oculto / Detectado), determinado por testes de Furtividade vs. Percepção dos inimigos. Enquanto Oculto, o Ladino pode se mover e agir sem ser alvo de reações/ataques de oportunidade, e seu primeiro ataque ao saltar da furtividade é automaticamente um **Ataque Furtivo** (ver 12.3).
- **Cargas de Veneno:** o Ladino começa cada dia/descanso longo com **3 Cargas de Veneno**. Cada habilidade que aplica veneno consome 1 carga. Cargas extras podem ser obtidas comprando/preparando doses (a critério do mestre, fora de combate).

### 12.2 Interação com Atributos

| Atributo | Efeito específico do Ladino |
|---|---|
| FOR | Dano natural leve (+1 a cada 3 pontos) |
| DEX | Acerto/Defesa padrão; base de muitas perícias de ladinagem |
| AGI | **+1 de dano em Ataques Furtivos a cada 2 pontos de AGI**; AGI também conta para esquiva extra (perícia Reflexos) |
| INT | Perícias de investigação, identificação de mecanismos/armadilhas |
| SAB | Detectar mentiras, armadilhas ocultas, emboscadas inimigas |

### 12.3 Ataque Furtivo

Quando o Ladino ataca um alvo que está **Desprevenido** (não sabe da presença do Ladino) ou que está **flanqueado por um aliado do Ladino**, o ataque é um **Ataque Furtivo**:

```
Dano de Ataque Furtivo = Dano da Arma + Dano Natural + 1d6 (base) + bônus de AGI (ver tabela acima) − Defesa do alvo
```

### 12.4 Árvore de Habilidades

| Habilidade | Custo | Efeito |
|---|---|---|
| **Golpe Envenenado** | 1 Carga de Veneno, 1 Ação | Ataque corpo a corpo que, se acertar, aplica Veneno: 1d4 de dano contínuo por 3 rodadas. |
| **Passo nas Sombras** | 1 Ação | Move até seu Movimento total sem provocar Ataques de Oportunidade, desde que termine em área com cobertura/sombra. |
| **Emboscada** | 1 Ação | Se estiver Oculto, pode se mover e realizar 1 Ataque Furtivo no mesmo turno sem revelar sua posição antes do ataque. |
| **Veneno Paralisante** | 2 Cargas de Veneno, 1 Ação | Ataque corpo a corpo que, se acertar, impõe −2 no Movimento e −1 na Chance de Defesa do alvo por 2 rodadas. |
| **Reflexos de Gato** | 1 Reação | Quando seria alvo de um ataque (mesmo sem defender ativamente com arma), pode gastar 1 Reação para ganhar +2 na Chance de Defesa daquele ataque específico, mesmo desarmado. |
| **Roubo Rápido** | 1 Ação | Tenta furtar um item pequeno ou desarmar uma armadilha de gatilho simples sem provocar reação do alvo (teste de perícia Ladinagem). |
| **Golpe Duplo** | 1 Ação | Realiza 2 ataques corpo a corpo contra o mesmo alvo, cada um com −1 na Chance de Acerto, mas ambos podem ser Furtivos se as condições forem atendidas. |
| **Sangramento Mortal** | 2 Cargas de Veneno, 1 Ação | Ataque corpo a corpo que, se for um Ataque Furtivo, aplica Sangramento: 1d6 de dano contínuo por 3 rodadas (não cumulativo com Veneno comum no mesmo alvo). |

### 12.5 Perícias

| Perícia | Atributo associado | Uso típico |
|---|---|---|
| **Furtividade** | AGI ou DEX | Permanecer Oculto, evitar detecção. |
| **Ladinagem** | DEX | Arrombar fechaduras, desarmar armadilhas, furtar. |
| **Investigação** | INT | Encontrar pistas, compartimentos secretos, falsificações. |
| **Percepção de Mentiras** | SAB | Detectar blefes, traições, informações falsas. |
| **Acrobacia** | AGI | Escapar de agarrões, equilibrar-se em superfícies estreitas, saltos. |
| **Conhecimento de Venenos** | INT | Identificar/preparar venenos e antídotos. |

---
## 13. Classe: Clérigo

**Papel:** cura, suporte de equipe, dano sagrado moderado, resiliência em linha de frente leve.
**Recurso de classe:** **Fé** (separada dos Slots de Magia).

### 13.1 Fé

```
Fé Máxima = 8 + SAB
```

- Fé recupera totalmente em descanso longo; recupera 50% (arredondado para baixo) em descanso curto.
- Usada para **habilidades de cura/suporte rápidas** que não consomem Slots de Magia, permitindo ao Clérigo intercalar curas pequenas sem esgotar magias maiores.

### 13.2 Interação com Atributos

| Atributo | Efeito específico do Clérigo |
|---|---|
| FOR | +1 HP extra por ponto (total +4 HP/ponto); permite uso de armas de impacto (maças, cajados pesados) sem penalidade |
| DEX | Acerto/Defesa padrão |
| AGI | Movimento padrão |
| INT | Sem uso direto |
| SAB | Slots de Magia, poder de cura (+1 nos dados de cura a cada 3 pontos), +1 Defesa Mágica a cada 2 pontos |

### 13.3 Árvore de Habilidades (Fé)

| Habilidade | Custo | Efeito |
|---|---|---|
| **Mãos Curativas** | 2 Fé, 1 Ação | Cura 1d6 + SAB de HP em um alvo tocado (alcance 1 hexágono). |
| **Palavra de Cura** | 3 Fé, 1 Ação | Cura 1d4 + SAB em até 2 alvos dentro de 4 hexágonos, sem necessidade de toque. |
| **Bênção** | 2 Fé, 1 Ação | Um aliado ganha +1 na Chance de Acerto e +1 na Chance de Defesa por 3 rodadas. |
| **Repreensão Sagrada** | 3 Fé, 1 Ação | Ataque mágico de toque ou alcance curto (3 hexágonos) contra mortos-vivos/criaturas profanas: 2d6 de dano sagrado (dano normal contra outras criaturas: 1d6). |
| **Escudo da Fé** | 2 Fé, 1 Reação | Concede a um aliado (ou a si mesmo) +3 de Defesa Física e Mágica fixa contra o próximo ataque. |
| **Estabilizar** | 1 Fé, 1 Ação | Um aliado caído (0 HP) para de perder HP por sangramento/efeitos contínuos e fica estável, sem recuperar consciência. |
| **Imposição de Mãos** | 4 Fé, 1 Ação | Remove um efeito de veneno, doença ou maldição menor de um alvo tocado. |
| **Ressurreição Menor** | Toda a Fé (mínimo 6), 1 Ação | Uma vez por dia, restaura 1 aliado caído (0 HP) há no máximo 3 rodadas para 50% do HP máximo. |

### 13.4 Magias (consomem Slots de Magia)

| Magia | Nível (custo em Slots) | Dano/Efeito |
|---|---|---|
| **Luz Sagrada** | 1 | 1d6 de dano sagrado em alvo único; cega criaturas das trevas por 1 rodada. |
| **Curar Feridas** | 1 | 2d6 + SAB de cura em alvo único tocado. |
| **Proteção contra o Mal** | 1 | Por 3 rodadas, o alvo ganha +2 na Chance de Defesa contra criaturas de alinhamento maligno. |
| **Círculo de Cura** | 2 | 1d8 + SAB de cura distribuído entre até 3 aliados em raio de 2 hexágonos. |
| **Punição Divina** | 2 | 2d8 de dano sagrado em alvo único; dano dobrado contra mortos-vivos. |
| **Purificar** | 3 | Remove todos os efeitos negativos contínuos (veneno, sangramento, medo) de até 2 aliados. |
| **Muralha Sagrada** | 3 | Cria uma barreira que bloqueia passagem de criaturas malignas por 3 rodadas (criaturas comuns podem passar). |
| **Cura Maior** | 4 | 4d8 + SAB de cura em um único alvo; pode reanimar um aliado a 0 HP (mas não morto) sem gastar a habilidade de Ressurreição Menor. |
| **Julgamento** | 4 | 3d10 de dano sagrado em área (raio de 1 hexágono ao redor do alvo). |
| **Intervenção Divina** | 5 | Cura completa (HP máximo) em todos os aliados em raio de 3 hexágonos; uso único por dia. |

### 13.5 Perícias

| Perícia | Atributo associado | Uso típico |
|---|---|---|
| **Medicina** | SAB | Primeiros socorros sem magia, diagnosticar doenças/venenos. |
| **Religião** | INT | Conhecimento de doutrinas, rituais, hierarquias religiosas. |
| **Intuição** | SAB | Perceber intenções, mentiras, perigo iminente. |
| **Persuasão** | SAB ou FOR (à escolha) | Diplomacia, conforto, liderança moral do grupo. |
| **Combate com Armas de Impacto** | FOR | Reduz penalidades de maças, cajados e martelos de guerra usados pelo Clérigo. |

---
## 14. Equipamentos

As listas abaixo são sugestões balanceadas em torno da fórmula de dano (seção 6) e das regras de defesa (seção 4). O mestre pode ajustar preços/disponibilidade conforme a economia da campanha.

### 14.1 Armas Corpo a Corpo — Uma Mão (podem ser usadas para defender)

| Arma | Dano da Arma | Requisito recomendado | Pode Defender? | Observação |
|---|---|---|---|---|
| Adaga | 1d4 | DEX | Sim (degrada −2/tentativa) | Leve, ideal para Ladino; +1d6 extra em Ataque Furtivo já incluso na regra de classe |
| Espada Curta | 1d6 | DEX | Sim (degrada −1/tentativa) | Equilibrada, boa para qualquer classe |
| Espada Longa de Uma Mão | 1d8 | FOR ou DEX | Sim (degrada −1/tentativa) | Arma clássica de Guerreiro/Clérigo |
| Machado de Uma Mão | 1d8 | FOR | Sim (degrada −1/tentativa) | +1 dano natural fixo contra escudos de madeira (regra opcional) |
| Maça/Clava | 1d6 | FOR | Sim (degrada −1/tentativa) | Arma de impacto, sem penalidade para Clérigo |
| Cetro/Cajado de Uma Mão | 1d6 | INT/SAB | Sim (degrada −2/tentativa) | Pode canalizar magia sem penalidade |

### 14.2 Armas Corpo a Corpo — Duas Mãos (não podem defender ativamente)

| Arma | Dano da Arma | Requisito recomendado | Observação |
|---|---|---|---|
| Espada Longa de Duas Mãos | 1d12 | FOR | Alto dano, sem defesa ativa |
| Machado Grande | 1d12 + 1d4 | FOR (alto) | Dano altíssimo, exige FOR elevada para evitar penalidade de manejo |
| Martelo de Guerra | 1d10 + 1d4 | FOR | Bom contra armaduras pesadas (regra opcional: ignora 1 ponto de Defesa Física) |
| Lança | 1d10 | FOR ou DEX | Alcance 2 hexágonos em ataques corpo a corpo (regra de alcance estendido) |
| Cajado de Batalha (Mago) | 1d8 | INT | Pode ser usado para conjurar sem penalidade; sem bônus de defesa |

### 14.3 Armas de Defesa Mágica (degradam −2/tentativa ao defender)

| Item | Dano da Arma (se usado para atacar) | Observação |
|---|---|---|
| Varinha | 1d4 (dano mágico de toque) | Defesa −2/tentativa; usada por Mago para canalizar magias menores |
| Grimório | — (não ataca diretamente) | Defesa −2/tentativa; aumenta em +1 o nível máximo de magia que pode ser conjurada (item de classe do Mago) |
| Orbe Arcano | 1d4 (dano mágico de toque) | Defesa −2/tentativa; +1 MP máximo a cada item equipado (até 2) |

### 14.4 Armas à Distância

| Arma | Dano da Arma | Alcance (hexágonos) | Requisito recomendado | Observação |
|---|---|---|---|---|
| Arco Curto | 1d6 | 8 | DEX | Recarga rápida, bom para mobilidade |
| Arco Longo | 1d8 | 12 | DEX | Padrão do Arqueiro |
| Besta | 1d10 | 10 | DEX ou FOR | Dano maior, mas recarregar custa 1 Ação extra após cada disparo (regra opcional) |
| Adaga de Lançamento | 1d4 | 4 | DEX | Pode ser usada também corpo a corpo (1d4, defende −2/tentativa) |
| Funda | 1d4 | 6 | DEX | Munição barata e abundante |

### 14.5 Escudos

| Escudo | Defesa Física fixa adicional | Chance de Defesa | Penalidade |
|---|---|---|---|
| Escudo Leve (broquel) | +1 | 5 ou menos (não degrada) | Nenhuma |
| Escudo Médio | +3 | 5 ou menos (não degrada) | −1 no Movimento |
| Escudo Pesado | +6 | 5 ou menos (não degrada) | −1 na Chance de Acerto enquanto equipado |

---

## 15. Armaduras

A Defesa Física de um personagem é a soma de: **Defesa Base da Armadura + Defesa do Escudo (se houver) + bônus de classe/habilidades**. Armaduras mais pesadas reduzem Movimento, refletindo o peso.

| Armadura | Defesa Física | Defesa Mágica | Penalidade de Movimento | Requisito recomendado |
|---|---|---|---|---|
| Roupas Comuns | 0 | 0 | Nenhuma | — |
| Armadura de Couro | 2 | 0 | Nenhuma | — |
| Armadura de Couro Batido | 3 | 0 | Nenhuma | DEX recomendado (Ladino/Arqueiro) |
| Cota de Malha | 5 | 0 | −1 | FOR recomendado |
| Armadura de Placas Parcial | 7 | 0 | −2 | FOR recomendado |
| Armadura de Placas Completa | 9 | 0 | −3 | FOR alta recomendada |
| Vestes Arcanas | 1 | 4 | Nenhuma | INT/SAB (Mago/Clérigo) |
| Vestes Sagradas | 2 | 3 | Nenhuma | SAB (Clérigo) |
| Manto das Sombras | 2 | 1 | Nenhuma | +1 em testes de Furtividade (Ladino) |

> **Nota de balanceamento:** armaduras pesadas (Cota de Malha em diante) favorecem Guerreiro/Clérigo, que têm FOR alta e não dependem de Movimento extra. Vestes leves/arcanas favorecem classes de Slots de Magia, que precisam de Defesa Mágica em vez de Física.

---

## 16. Acessórios

| Acessório | Efeito |
|---|---|
| **Anel de Vitalidade** | +5 HP máximo |
| **Anel de Foco Arcano** | +1 Slot de Magia |
| **Amuleto de Fé** | +2 Fé máxima (Clérigo) ou +1 Defesa Mágica (qualquer classe) |
| **Bracelete de Reflexos** | +1 Reação disponível por rodada |
| **Botas Ágeis** | +1 Movimento |
| **Cinto do Berserker** | +1 ganho de Fúria ao receber dano (Guerreiro) |
| **Luvas do Caçador** | +1 ganho de Foco ao acertar à distância (Arqueiro) |
| **Capa Furtiva** | +2 em testes de Furtividade; não acumula com Manto das Sombras |
| **Pingente de Cura** | Habilidades de cura do portador curam +1 ponto fixo adicional |
| **Pedra de Mana** | +5 MP máximo (Mago) |
| **Frasco de Antídoto Permanente** | Cargas de Veneno do Ladino não se esgotam no primeiro uso do dia (1x por dia, recarrega automaticamente 1 carga) |
| **Talismã do Guardião** | +2 Defesa Física fixa quando o HP do portador está abaixo de 30% |

---
## 17. Estrutura de um Turno Completo (Grid Hexagonal)

### 17.1 Ordem de Iniciativa

```
Iniciativa = 1d10 + AGI + DEX
```

Personagens agem em ordem decrescente de Iniciativa. Em caso de empate, quem tiver maior DEX age primeiro; se ainda houver empate, role 1d10 simples entre os empatados.

### 17.2 Sequência de um Turno (por personagem)

1. **Início do turno:** recursos de classe são avaliados (ex.: degradação de Defesa reseta para o valor inicial; Fúria/Foco permanecem do turno anterior).
2. **Movimento e Ações são gastos livremente, em qualquer ordem**, dentro do limite de Movimento e Ações disponíveis:
   - Mover-se entre hexágonos (gasta Movimento).
   - Atacar, usar habilidade, conjurar magia, trocar de item (gasta Ações).
   - Sair de hexágonos adjacentes a inimigos pode provocar Ataques de Oportunidade (gastam Reação do oponente, não do personagem ativo).
3. **Fim do turno:** passa a vez ao próximo na ordem de Iniciativa.

### 17.3 Sequência de uma Rodada Completa

Uma **Rodada** termina quando todos os personagens (jogadores e inimigos) tiverem agido uma vez, seguindo a ordem de Iniciativa. Reações não usadas na rodada se perdem; uma nova rodada concede novas Reações (seção 5.3).

### 17.4 Resolvendo um Ataque, Passo a Passo (Resumo Operacional)

1. Atacante declara o ataque e o alvo.
2. Calcula-se a **Chance de Acerto** (seção 3.1).
3. Rola-se **1d10**. Compara-se ao resultado (acerto / erro normal / erro crítico).
4. Se acertou, o defensor decide se quer gastar uma **Reação** para se **Defender** (seção 4). Se sim, rola-se a Chance de Defesa atual (considerando degradação por tentativas anteriores na rodada).
5. Se a defesa falhar (ou não for tentada), calcula-se o **Dano** (seção 6.1): Dano da Arma + Dano Natural − Defesa correspondente.
6. Aplica-se o dano ao HP do alvo. Reduz-se a 0 se negativo.
7. Habilidades/efeitos contínuos (veneno, sangramento, marcações) são anotados para resolução no início do próximo turno do alvo ou do atacante, conforme o efeito.

---

## 18. Tabela-Resumo Rápida (Cheat Sheet)

| Cálculo | Fórmula |
|---|---|
| HP | 20 + (FOR × 3) + bônus de classe por FOR + (5 × nível) |
| Slots de Magia | INT + SAB |
| Movimento | 4 + AGI |
| Ações por turno | AGI + DEX |
| Reações por rodada | 1 + 1 a cada 4 pontos de AGI (arredondado para baixo) |
| Chance de Acerto | 5 + (DEX atacante − DEX defensor); mínimo 2, máximo 8 |
| Chance de Defesa (arma 1 mão) | 5, depois −1 por tentativa adicional na rodada |
| Chance de Defesa (adaga/varinha/grimório/orbe) | 5, depois −2 por tentativa adicional na rodada |
| Chance de Defesa (escudo) | 5, fixo, não degrada |
| Resultado 9 no d10 (acerto ou defesa) | Erro normal |
| Resultado 10 no d10 (acerto ou defesa) | Erro crítico |
| Resultado 1 no d10 de ataque | Acerto crítico (dano da arma dobrado) |
| Dano por ataque | (Dano da Arma + Dano Natural) − Defesa, mínimo 0 |
| Iniciativa | 1d10 + AGI + DEX |

---

## 19. Magias e Perícias Gerais (Universais)

Diferente das magias e perícias de classe (seções 9 a 13), as magias e perícias abaixo **não pertencem a nenhuma classe específica** — qualquer personagem pode aprendê-las, desde que cumpra o requisito de atributo indicado.

- **Magias gerais** são aprendidas através de **grimórios e livros de magia** encontrados, comprados ou estudados em bibliotecas/academias. Aprender uma magia geral normalmente exige tempo de estudo (a critério do mestre, ex.: alguns dias de descanso) e consome Slots de Magia normalmente quando conjurada (seção 7.2).
- **Perícias gerais** são aprendidas através de **treinamento com NPCs especialistas** (mestres, instrutores, guildas). O mestre pode exigir um custo em tempo e/ou recursos (ouro, favores) para o treinamento.
- Magias gerais ocupam vagas de magias conhecidas como qualquer outra magia da classe do personagem — não existe limite separado "geral vs. classe", a menos que o mestre decida o contrário.

### 19.1 Magias Gerais de Utilidade

Estas magias são de baixo impacto em combate e voltadas para exploração, utilidade e conveniência no dia a dia — o tom *mid-fantasy* do sistema, com mágica presente mas não onipotente.

| Magia | Nível (custo em Slots) | Efeito |
|---|---|---|
| **Mão Distante** | 1 | Traz um objeto pequeno e desacompanhado (até o tamanho de uma maçã) à mão do conjurador, desde que esteja visível e a até 6 hexágonos de distância. |
| **Reparo Menor** | 1 | Conserta um objeto pequeno quebrado ou danificado (ferramenta, utensílio, fivela, corda cortada) — não funciona em itens mágicos ou de grande porte (armaduras completas, portas). |
| **Luz** | 1 | Faz um objeto tocado emitir luz suave por 1 hora, iluminando um raio de 3 hexágonos. |
| **Mensagem** | 1 | Envia uma frase curta (até 25 palavras) a um alvo conhecido em até 15 hexágonos de distância; o alvo ouve a mensagem na sua própria voz. |
| **Limpeza** | 1 | Remove sujeira, poeira, cheiro leve ou líquido não-mágico de uma criatura ou objeto tocado. |
| **Mãos Hábeis** | 1 | Por 10 minutos, o conjurador ganha +2 em testes de perícias manuais (Ladinagem, Manutenção de Equipamento, Alquimia Básica). |
| **Passo Silencioso** | 1 | Por 10 minutos, os passos do conjurador não produzem som audível além de 1 hexágono. |
| **Vínculo de Carga** | 2 | Reduz o peso efetivo de um item ou pilha de itens carregados pelo conjurador em até 50% por 1 hora (não afeta combate, apenas exploração/carga). |
| **Identificar** | 2 | Revela as propriedades mágicas básicas de um item tocado (se é mágico, e qual sua função geral — não revela maldições ocultas). |
| **Comunicação com Animais** | 2 | Permite conversar de forma simples com um animal comum por 10 minutos (não garante cooperação, apenas compreensão mútua). |
| **Trancar/Destrancar** | 2 | Tranca ou destranca magicamente uma porta, baú ou portão comum tocado; fechaduras mágicas resistem com um teste de Arcanismo ou Ladinagem oposto. |
| **Pequeno Conforto** | 2 | Cria um abrigo temporário (barraca leve ou fogueira sem combustível) que dura até o próximo descanso longo. |
| **Visão Noturna Arcana** | 2 | Concede visão no escuro a um alvo tocado por 1 hora. |
| **Disfarce Menor** | 3 | Altera levemente a aparência do conjurador (cor de cabelo, rosto, roupas) por 1 hora; não resiste a exame detalhado. |
| **Purificar Água e Comida** | 1 | Remove venenos não-mágicos e torna água/comida deterioradas seguras para consumo. |
| **Sussurro do Vento** | 3 | Permite ouvir conversas em um raio de até 10 hexágonos ao redor de um ponto visível, por 1 minuto. |

> **Nota de tom:** estas magias foram desenhadas para reforçar o tom *mid-fantasy* — a magia resolve pequenas conveniências e mistérios, mas não substitui exploração, negociação ou combate. Evite magias gerais de Nível 4-5; utilidades de alto nível devem ficar restritas às magias de classe (seções 10 e 13), que já cobrem efeitos maiores como teletransporte e cura em massa.

---

### 19.2 Perícias Gerais

Estas perícias representam conhecimentos e talentos comuns que qualquer aventureiro pode desenvolver, independente de classe, normalmente através de treinamento com NPCs especializados.

| Perícia | Atributo associado | Uso típico |
|---|---|---|
| **Montaria** | DEX ou AGI (à escolha) | Cavalgar, controlar montarias em combate ou viagem, realizar manobras montadas. |
| **Ocultismo** | INT ou SAB (à escolha) | Reconhecer rituais profanos, símbolos amaldiçoados, criaturas sobrenaturais raras (diferente de Arcanismo, focado no lado obscuro/oculto do mundo, não na magia acadêmica). |
| **Negociação** | SAB ou FOR (à escolha) | Barganhar preços, fechar acordos, mediar disputas — mais focada em transações que persuasão emocional. |
| **Culinária** | INT ou SAB (à escolha) | Preparar refeições que concedem pequenos bônus temporários (ex.: +1 HP máximo por algumas horas) durante descansos. |
| **Navegação** | INT ou SAB (à escolha) | Orientar-se por mapas, estrelas ou correntes marítimas; evitar se perder em viagens longas. |
| **Idiomas e Linguística** | INT | Aprender e reconhecer idiomas, decifrar inscrições antigas e códigos simples. |
| **Jogos de Azar** | DEX ou SAB (à escolha) | Vencer apostas, identificar trapaças em jogos de cartas/dados, ganhar dinheiro ou informação em tavernas. |
| **Etiqueta e Nobreza** | SAB ou INT (à escolha) | Comportar-se adequadamente em cortes, banquetes e ambientes da aristocracia. |
| **Primeiros Socorros de Campo** | SAB | Estabilizar feridos levemente fora de combate sem exigir treinamento médico completo (diferente de Medicina do Clérigo, mais básica e genérica). |
| **Artesanato Geral** | FOR ou DEX (à escolha) | Produzir e reparar itens comuns não-mágicos: ferramentas, móveis simples, roupas, selas. |
| **Conhecimento de Mercado** | INT | Avaliar valor justo de itens, identificar falsificações comerciais, encontrar compradores/vendedores. |
| **Resistência a Intempéries** | FOR ou SAB (à escolha) | Suportar frio, calor extremo, fome e privação de sono sem penalidades severas. |
| **Domesticação Animal** | SAB | Amansar e treinar animais comuns (não criaturas mágicas ou monstruosas) para tarefas simples. |
| **Escalada e Rapel** | FOR ou AGI (à escolha) | Superar terrenos verticais com equipamento apropriado (cordas, ganchos), reduzindo risco de queda. |

> Estas perícias **não substituem** as perícias de classe (seções 9 a 13) — funcionam como complemento, permitindo que qualquer personagem desenvolva uma identidade fora do combate (ex.: um Guerreiro que também é exímio cavaleiro, um Mago que também joga cartas na taverna). O mestre pode limitar quantas perícias gerais um personagem aprende por nível, conforme o ritmo de progressão da campanha.

---
## 20. Notas de Balanceamento e Recomendações ao Mestre

- **Limite de 8 na Chance de Acerto** garante que mesmo um personagem com DEX muito superior ao oponente nunca acerte automaticamente — sempre existe 20% de chance de falha (9 e 10), preservando tensão em todos os combates.
- **Defesa com escudo não degradar** torna escudos atrativos para personagens que esperam sofrer múltiplos ataques por rodada (tanques), enquanto **armas leves degradando mais rápido** (adaga/varinha/grimório/orbe) incentiva esses personagens a evitar ficar cercados, reforçando o papel de Mago/Ladino como classes de posicionamento cuidadoso.
- **Escudo pesado (+6 Defesa Física, −1 Acerto)** é uma escolha forte para Guerreiros/Clérigos que priorizam sobrevivência sobre dano — vale a pena revisar esse valor em playtest, pois +6 fixo pode ser muito forte em níveis baixos (dano de arma pequena praticamente anulado). Sugestão: considerar escalar o bônus do escudo pesado com o nível de personagem, começando menor (+3) e crescendo (+1 a cada 3 níveis até +6).
- **Ataques de Oportunidade dependem de Reações limitadas** — isso impede que um único inimigo "tanque" todos os Ataques de Oportunidade da rodada ao se mover por múltiplos hexágonos adjacentes a vários inimigos; cada inimigo só usa 1 Reação por movimento de "saída", evitando combos punitivos demais.
- **Fúria/Foco resetando fora de combate** mantém os recursos de Guerreiro e Arqueiro relevantes apenas durante a luta, sem exigir gerenciamento de "long rest" como Mana/Slots — isso simplifica a contabilidade entre combates.
- **Slots de Magia vs. MP/Fé:** a separação entre "conjurar magia" (Slots) e "amplificar/usar habilidades de suporte" (MP/Fé) permite que Mago e Clérigo tenham gameplay tático em duas camadas, sem que um recurso único limite todas as ações da classe.
- **Recomenda-se testar o sistema em combates de 3 a 5 rodadas** contra um grupo de 4 jogadores (1 de cada classe + 1 repetida) versus 2-3 inimigos de dificuldade média, ajustando a Defesa Física/Mágica de monstros conforme o tempo médio de combate desejado pela mesa (combates muito longos sugerem Defesa alta demais; combates muito curtos sugerem Defesa baixa demais).

---

## 21. Índice de Seções

1. Visão Geral do Sistema
2. Atributos: Efeitos Mecânicos Gerais
3. Chance de Acerto (Ataque)
4. Chance de Defesa
5. Movimento, Ações e Grid Hexagonal
6. Sistema de Dano
7. Vida (HP) e Slots de Magia
8. Classes — Visão Geral
9. Classe: Guerreiro
10. Classe: Mago
11. Classe: Arqueiro
12. Classe: Ladino
13. Classe: Clérigo
14. Equipamentos
15. Armaduras
16. Acessórios
17. Estrutura de um Turno Completo (Grid Hexagonal)
18. Tabela-Resumo Rápida (Cheat Sheet)
19. Magias e Perícias Gerais (Universais)
20. Notas de Balanceamento e Recomendações ao Mestre

---

*Fim do documento.*
