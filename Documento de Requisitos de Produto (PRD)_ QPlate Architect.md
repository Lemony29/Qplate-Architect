# Documento de Requisitos de Produto (PRD): QPlate Architect

## 1. Introdução

Este Documento de Requisitos de Produto (PRD) detalha as especificações para o desenvolvimento do **QPlate Architect**, um novo aplicativo SaaS (Software as a Service) projetado para revolucionar o design, gerenciamento e documentação de experimentos em microplacas. O objetivo principal é fornecer uma ferramenta intuitiva e poderosa que atenda às necessidades de pesquisadores de laboratório, cientistas e estudantes de biologia molecular, que frequentemente realizam ensaios como qPCR, PCR e ELISA. Atualmente, muitos desses profissionais dependem de planilhas genéricas, como o Microsoft Excel, para planejar seus experimentos em placas. Essa abordagem, embora comum, é propensa a erros, ineficiente e carece de funcionalidades específicas que são cruciais para a reprodutibilidade e a precisão em ambientes de laboratório. O QPlate Architect visa preencher essa lacuna, oferecendo uma solução especializada que otimiza o fluxo de trabalho, minimiza erros e maximiza a eficiência na pesquisa científica.

## 2. Visão Geral e Objetivo do Projeto

O QPlate Architect será uma plataforma web robusta e fácil de usar, desenvolvida para simplificar o processo complexo de design e execução de experimentos baseados em microplacas. A visão é criar uma ferramenta indispensável que não apenas substitua as planilhas genéricas, mas também adicione camadas de inteligência e automação que são impossíveis de alcançar com métodos manuais. Nosso objetivo é capacitar os usuários a:

*   **Reduzir Erros:** Minimizar falhas humanas nos cálculos de Master Mix e no layout da placa através de automação e validação inteligente.
*   **Aumentar a Eficiência:** Acelerar o processo de design experimental e preparação, liberando tempo valioso para a análise de dados e outras atividades de pesquisa.
*   **Melhorar a Reprodutibilidade:** Padronizar os protocolos e a documentação dos experimentos, garantindo que os resultados possam ser replicados com confiança.
*   **Otimizar o Uso de Reagentes:** Evitar o desperdício de reagentes caros através de cálculos precisos de Master Mix, incluindo margens de segurança adequadas.
*   **Facilitar a Colaboração:** Fornecer uma plataforma centralizada para o gerenciamento de experimentos, permitindo que equipes compartilhem e revisem designs de placas e protocolos.

Em última análise, o QPlate Architect se tornará a ferramenta de referência para qualquer cientista que trabalhe com microplacas, elevando o padrão de planejamento experimental e contribuindo para avanços mais rápidos e confiáveis na pesquisa biológica.

## 3. Público-Alvo

O QPlate Architect é projetado para atender a uma ampla gama de profissionais e estudantes na área de biologia molecular e ciências da vida. As personas principais incluem:

*   **Pesquisadores de Laboratório:** Cientistas experientes que realizam experimentos complexos e de alto rendimento. Eles precisam de flexibilidade para projetar layouts de placas personalizados, ferramentas avançadas para cálculos de Master Mix e funcionalidades robustas para documentação e exportação de dados. A precisão e a capacidade de salvar templates são cruciais para eles.
*   **Cientistas:** Profissionais que gerenciam projetos de pesquisa e equipes. Eles valorizam a reprodutibilidade, a padronização de protocolos e a capacidade de revisar e aprovar designs de placas. A funcionalidade de checklist interativo será particularmente útil para garantir a conformidade com os POPs (Procedimentos Operacionais Padrão) do laboratório.
*   **Estudantes de Pós-Graduação:** Indivíduos que estão aprendendo e executando experimentos sob supervisão. Eles se beneficiarão de uma interface intuitiva que os guie através do processo de design da placa e da preparação do Master Mix, minimizando a chance de erros e o desperdício de reagentes caros. O checklist interativo servirá como um guia valioso para garantir a execução correta dos protocolos.
*   **Técnicos de Laboratório:** Profissionais que executam rotineiramente um grande volume de experimentos padronizados. Eles precisam de ferramentas de preenchimento rápido, cálculos eficientes de Master Mix e acesso fácil a protocolos padronizados para maximizar a produtividade e a consistência.

Todos esses usuários compartilham a necessidade de uma ferramenta que simplifique o planejamento experimental, reduza a carga cognitiva e aumente a confiança nos resultados obtidos em ensaios baseados em microplacas.

## 4. Requisitos Funcionais Core

### 4.1. Módulo de Design de Placa Dinâmico e Editável

Este módulo é o coração do QPlate Architect, fornecendo aos usuários a capacidade de visualizar, projetar e manipular layouts de microplacas de forma intuitiva e flexível. Ele deve replicar e aprimorar a experiência de um caderno de laboratório digital, permitindo a criação de qualquer tipo de experimento, desde os mais simples até os mais complexos.

**User Story:** "Como pesquisador, eu quero poder escolher entre diferentes formatos de placa e modificar livremente o layout para que eu possa planejar qualquer tipo de experimento, desde um simples screening até uma curva de quantificação complexa."

**Especificações Detalhadas:**

*   **Suporte a Múltiplos Formatos de Placa:** O sistema deve oferecer uma seleção pré-definida de formatos de placa padrão da indústria. Isso inclui, mas não se limita a:
    *   **Placas de 96 poços (8x12):** O formato mais comum, ideal para uma ampla gama de ensaios.
    *   **Placas de 384 poços (16x24):** Para experimentos de alto rendimento, onde a miniaturização e a automação são essenciais.
    *   **Placas de 48 poços:** Para ensaios que requerem volumes maiores ou menor número de amostras.
    *   **Tiras de 8 ou 12 poços (strips):** Essenciais para ensaios menores ou para otimização de reagentes, com suporte para orientação vertical e horizontal.
    A arquitetura subjacente deve ser modular e extensível, permitindo a fácil adição de novos formatos de placa customizados no futuro, sem a necessidade de grandes refatorações. Isso pode ser alcançado através de um sistema de configuração baseado em metadados para cada tipo de placa.

*   **Interface de Interação com Poços:** A interação com os poços da placa deve ser altamente intuitiva e visual. Serão implementadas funcionalidades de "arrastar e soltar" (drag-and-drop) e "clique e pinte" (click-and-paint) para atribuir rapidamente conteúdos ou propriedades a poços individuais ou a grupos de poços. Isso permitirá que os usuários selecionem um tipo de poço (amostra, controle, padrão) e o apliquem a múltiplas células da placa com facilidade, simulando a ação de preencher uma placa física.

*   **Definição e Coloração de Tipos de Poços:** Para clareza visual e organização, os usuários devem ser capazes de definir e diferenciar visualmente os tipos de poços. Cada tipo de poço terá uma cor associada e um rótulo personalizável:
    *   **Amostras:** Poços contendo amostras experimentais. Os usuários devem poder atribuir nomes editáveis a cada amostra (ex: "Cérebro-1", "Fígado-2", "Paciente A"), que serão exibidos sobre o poço ou em um tooltip ao passar o mouse.
    *   **Padrões:** Poços utilizados para a construção de curvas de quantificação. Os rótulos podem ser sequenciais (ex: "P1", "P2", "P3") e os usuários devem poder especificar as concentrações correspondentes.
    *   **Controles:** Poços dedicados a controles experimentais cruciais:
        *   **Positivo:** Para verificar a funcionalidade do ensaio.
        *   **Negativo:** Para avaliar a especificidade e a presença de contaminação.
        *   **NTC (No Template Control):** Essencial em PCR/qPCR para detectar contaminação de reagentes.
    *   **Brancos (Blanks):** Poços contendo apenas o diluente ou reagentes sem a amostra alvo, usados para subtrair o ruído de fundo.
    A interface deve permitir que os usuários criem seus próprios tipos de poços personalizados, com cores e rótulos definidos pelo usuário, para acomodar ensaios específicos de seus laboratórios.

*   **Ferramentas de Preenchimento Rápido:** Para otimizar o tempo de design e reduzir a repetição, o módulo incluirá ferramentas inteligentes de preenchimento automático:
    *   **Replicatas Automáticas:** Capacidade de preencher automaticamente duplicatas, triplicatas ou mais replicatas de uma amostra ou padrão, tanto na vertical (colunas) quanto na horizontal (linhas). Por exemplo, selecionar um poço e arrastar para o lado para preencher automaticamente com a mesma amostra em triplicata.
    *   **Preenchimento de Séries:** Ferramenta para criar diluições em série ou gradientes de concentração. O usuário define o poço inicial, a concentração inicial, o fator de diluição e a direção (linha ou coluna), e o sistema preenche automaticamente os poços subsequentes com as concentrações calculadas.
    *   **Preenchimento por Padrão:** Os usuários podem definir um padrão de preenchimento para uma seção da placa e replicá-lo em outras seções, ideal para ensaios com layouts repetitivos.

### 4.2. Módulo de Calculadora de Master Mix Inteligente

Este módulo visa eliminar a complexidade e os erros associados aos cálculos manuais de Master Mix, garantindo que os usuários sempre preparem a quantidade correta de reagentes, com uma margem de segurança adequada para perdas durante a pipetagem. A calculadora será integrada diretamente ao design da placa, utilizando o número de reações definidas na placa como base para os cálculos.

**User Story:** "Como gerente de laboratório, eu quero que o sistema calcule automaticamente o volume de reagentes para o meu Master Mix, incluindo uma margem de segurança para erros de pipetagem, para que eu evite o desperdício de reagentes caros e garanta que nunca falte mix durante a montagem do experimento."

**Especificações Detalhadas:**

*   **População Automática Baseada na Placa:** A calculadora será automaticamente populada com o número total de reações necessárias, derivado do layout da placa. Por exemplo, se o usuário designar 25 amostras em triplicata, o sistema identificará 75 reações como o número base para o cálculo do Master Mix. Isso elimina a necessidade de contagem manual e reduz a chance de erros.

*   **Entrada de Reagentes Personalizável:** Os usuários devem poder inserir uma lista de reagentes que compõem seu Master Mix. Esta lista será dinâmica, permitindo adicionar ou remover reagentes conforme a necessidade do protocolo. Exemplos de reagentes incluem:
    *   Taq DNA Polimerase
    *   Buffer de Reação
    *   dNTPs
    *   Primer Forward (Fwd)
    *   Primer Reverse (Rev)
    *   Sonda (Probe)
    *   Água livre de nucleases (Nuclease-Free Water)
    Para cada reagente, o usuário especificará o volume por reação (1x), por exemplo, 0.2 µL/reação para a Taq Polimerase. O sistema deve permitir a entrada de volumes com precisão de duas casas decimais ou mais, dependendo da necessidade.

*   **Inclusão de Margem de Segurança (Overage):** Para compensar perdas inevitáveis durante a pipetagem e garantir que sempre haja Master Mix suficiente, o sistema oferecerá duas opções configuráveis de margem de segurança:
    *   **Porcentagem Extra:** O usuário pode especificar uma porcentagem (ex: 10%, 15%) que será adicionada ao volume total calculado. Se o cálculo base for para 100 µL, e uma margem de 10% for aplicada, o sistema calculará para 110 µL.
    *   **Número de Reações Extras:** Alternativamente, o usuário pode definir um número fixo de reações extras (ex: +1, +2 reações). Se o cálculo base for para 75 reações e o usuário adicionar +2 reações extras, o Master Mix será calculado para 77 reações. Esta opção é particularmente útil para garantir que sempre haja um pequeno excesso, independentemente do volume total.
    A escolha entre as duas opções deve ser clara e fácil de alternar, e a lógica de cálculo deve ser transparente para o usuário.

*   **Saída Clara e Detalhada:** O resultado da calculadora será apresentado em uma tabela clara e fácil de ler, contendo as seguintes informações para cada reagente:
    *   **Volume por Reação (1x):** O volume individual de cada reagente necessário para uma única reação, conforme inserido pelo usuário.
    *   **Volume Total Final (µL):** O volume total de cada reagente a ser adicionado ao Master Mix, considerando o número total de reações (incluindo a margem de segurança). Este valor será o mais proeminente, pois é o que o usuário pipetará.
    Além da tabela, um campo de destaque exibirá o **Volume Total Final do Master Mix** (a soma de todos os volumes totais dos reagentes), fornecendo uma visão geral rápida da quantidade total a ser preparada. Os resultados devem ser atualizados em tempo real à medida que o usuário ajusta os parâmetros (número de amostras, margem de segurança, volumes por reação).

### 4.3. Módulo de Checklist Interativo (Mini-POP)

Este módulo serve como um guia passo a passo para a preparação física da placa, garantindo que os usuários, especialmente os menos experientes, sigam o protocolo corretamente e minimizem erros. Ele atua como um Procedimento Operacional Padrão (POP) digital e interativo, acessível no momento crítico da montagem do experimento.

**User Story:** "Como um novo estudante no laboratório, eu quero um guia passo a passo que apareça quando eu estiver pronto para montar minha placa, para que eu possa seguir o protocolo corretamente e reduzir a chance de erros."

**Especificações Detalhadas:**

*   **Gatilho de Acesso:** Após a finalização do design da placa e dos cálculos do Master Mix, um botão claramente visível, como "Preparar Placa" ou "Iniciar Montagem", deve estar disponível na interface principal. Este botão servirá como o gatilho para ativar o Mini-POP.

*   **Interface do Mini-POP:** Ao ser clicado, um pop-up (modal) ou um painel lateral deslizante (sidebar) deve surgir, exibindo uma checklist interativa das etapas de preparação. A escolha entre modal e sidebar dependerá da análise de UX para garantir que não obstrua informações críticas da placa, mas seja facilmente acessível.

*   **Checklist Editável/Customizável:** A flexibilidade é fundamental. O checklist deve ser totalmente editável e customizável pelos usuários ou, idealmente, por um administrador do laboratório. Isso permitirá que cada laboratório adapte o Mini-POP aos seus próprios Procedimentos Operacionais Padrão (POPs) específicos, reagentes e equipamentos. As opções de customização devem incluir:
    *   Adicionar, remover e reordenar itens da lista.
    *   Editar o texto de cada etapa.
    *   Adicionar notas ou avisos importantes a etapas específicas.
    *   Salvar diferentes versões de checklists para diferentes tipos de ensaios ou usuários.

*   **Exemplo de Checklist Padrão (Pré-carregado):** Para uma experiência de primeiro uso suave, o sistema virá com um checklist padrão pré-carregado, que pode ser editado ou substituído. Um exemplo de checklist padrão incluiria:
    *   `[ ] Degelar todos os reagentes e mantê-los no gelo.`
    *   `[ ] Vortexar e centrifugar brevemente todos os reagentes.`
    *   `[ ] Preparar o Master Mix na bancada (em um microtubo) conforme a calculadora.`
    *   `[ ] Homogeneizar o Master Mix e distribuir o volume 'X' em cada poço/tira.` (O 'X' deve ser automaticamente preenchido com o volume por poço do Master Mix calculado).
    *   `[ ] Adicionar amostras/padrões/controles nos poços correspondentes.`
    *   `[ ] Selar a placa/tiras com filme adesivo óptico.`
    *   `[ ] Centrifugar a placa brevemente para remover bolhas.`
    *   `[ ] Colocar a placa no termociclador e iniciar a corrida.`

*   **Interatividade:** Cada item da checklist deve ter uma caixa de seleção (`checkbox`) que o usuário pode marcar como concluído. O progresso deve ser salvo automaticamente (localmente ou na nuvem, dependendo da arquitetura de persistência de dados do usuário) para que o usuário possa pausar e retomar a montagem da placa. O sistema pode oferecer um feedback visual (ex: item riscado, cor diferente) para etapas concluídas.

## 5. Requisitos Não Funcionais e UX/UI

### 5.1. Requisitos Não Funcionais

*   **Exportação de Dados:** A capacidade de exportar os dados do experimento é crucial para documentação, arquivamento e análise posterior. O sistema deve permitir a exportação de:
    *   **Layout da Placa:** Em formato PDF (para relatórios e documentação física) e CSV/XLSX (para importação em softwares de análise de dados ou para manipulação em planilhas).
    *   **Cálculos do Master Mix:** Em formato PDF (para registro de laboratório) e CSV/XLSX (para verificação ou integração com outros sistemas).
*   **Templates de Placa:** Usuários devem poder salvar layouts de placa frequentemente usados como templates. Isso permitirá a reutilização rápida de configurações experimentais padronizadas (ex: "Template de Curva Padrão Gene X", "Template de Screening de Drogas"), economizando tempo e garantindo consistência entre experimentos.
*   **Segurança:** Como um aplicativo SaaS, a segurança dos dados do usuário (designs de placas, protocolos, etc.) é primordial. Isso inclui autenticação robusta, autorização baseada em funções, criptografia de dados em trânsito e em repouso, e conformidade com regulamentações de privacidade de dados (ex: GDPR, HIPAA, se aplicável).
*   **Performance:** A aplicação deve ser rápida e responsiva, mesmo com designs de placas complexos (ex: 384 poços com muitos tipos de amostras). As operações de arrastar e soltar, cálculos em tempo real e carregamento de templates devem ocorrer sem atrasos perceptíveis.
*   **Escalabilidade:** A arquitetura deve ser projetada para escalar horizontalmente, suportando um número crescente de usuários e projetos simultâneos sem degradação de performance.
*   **Confiabilidade:** O sistema deve ser altamente disponível, com tempo de inatividade mínimo. Mecanismos de backup e recuperação de desastres devem estar em vigor.

### 5.2. Requisitos de UX/UI

*   **Interface Limpa e Intuitiva:** O design deve ser minimalista, sem poluição visual, com foco total na placa e nos dados relevantes. A navegação deve ser lógica e direta, com elementos de interface claramente rotulados e de fácil compreensão. O uso de cores deve ser funcional, auxiliando na diferenciação de tipos de poços e no feedback visual, sem ser distrativo.
*   **Responsividade:** O aplicativo deve ser totalmente responsivo, funcionando perfeitamente em uma variedade de dispositivos, desde desktops de laboratório até tablets (iPad, Android) e, idealmente, smartphones. Isso permitirá que os usuários acessem e manipulem seus designs de placas diretamente na bancada, sem a necessidade de retornar a um computador fixo. A interação touch-friendly será uma prioridade.
*   **Feedback Visual:** O sistema deve fornecer feedback visual claro para todas as interações do usuário (ex: realce de poços selecionados, animações suaves ao arrastar e soltar, mensagens de sucesso/erro). Isso aumenta a confiança do usuário e melhora a usabilidade.
*   **Acessibilidade:** O design deve considerar princípios de acessibilidade, como contraste de cores adequado, suporte a navegação por teclado e compatibilidade com leitores de tela, para garantir que o aplicativo seja utilizável por uma gama mais ampla de usuários.
*   **Consistência:** A interface deve manter uma consistência visual e funcional em todos os módulos, garantindo uma experiência de usuário coesa e previsível.

## 6. User Flow (Fluxo do Usuário)

O fluxo do usuário para o QPlate Architect será projetado para ser o mais intuitivo e eficiente possível, guiando o pesquisador desde a concepção do experimento até a preparação física da placa e a documentação. Abaixo, descrevemos um fluxo típico:

1.  **Login/Registro:** O usuário acessa a plataforma e faz login ou cria uma nova conta.
2.  **Dashboard/Página Inicial:** O usuário é direcionado para um dashboard onde pode ver projetos recentes, templates salvos e a opção de iniciar um novo projeto.
3.  **Iniciar Novo Projeto:** O usuário clica em "Novo Projeto" e é solicitado a nomear o projeto e, opcionalmente, adicionar uma descrição.
4.  **Seleção do Formato da Placa:** Na tela de design da placa, o usuário escolhe o formato da microplaca (ex: 96 poços, 384 poços) a partir de um menu suspenso ou galeria visual.
5.  **Design da Placa:**
    *   O usuário utiliza as ferramentas de "clique e pinte" ou "arrastar e soltar" para atribuir tipos de poços (amostra, padrão, controle, branco) aos poços da placa.
    *   Nomes de amostras, concentrações de padrões e tipos de controle são inseridos conforme necessário.
    *   Ferramentas de preenchimento rápido (replicatas, séries de diluição) são utilizadas para acelerar o processo.
    *   O sistema exibe o número total de reações em tempo real.
6.  **Cálculo do Master Mix:**
    *   O usuário navega para a seção da calculadora de Master Mix (ou ela é exibida em um painel lateral).
    *   A calculadora é automaticamente preenchida com o número total de reações da placa.
    *   O usuário insere os reagentes e seus volumes por reação.
    *   Define a margem de segurança (amostras extras ou porcentagem).
    *   O sistema calcula e exibe os volumes totais de cada reagente e o volume total final do Master Mix.
7.  **Preparação da Placa (Mini-POP):**
    *   O usuário clica no botão "Preparar Placa".
    *   O Mini-POP (checklist interativo) é exibido, guiando o usuário através das etapas físicas de montagem da placa.
    *   O usuário marca cada etapa como concluída.
8.  **Salvamento e Exportação:**
    *   O projeto é salvo automaticamente ou o usuário pode salvá-lo manualmente.
    *   O usuário pode exportar o layout da placa e os cálculos do Master Mix em formatos como PDF, CSV ou XLSX.
    *   Opcionalmente, o usuário pode salvar o layout da placa como um template para uso futuro.
9.  **Gerenciamento de Projetos:** O usuário pode retornar ao dashboard para acessar projetos anteriores, editar templates ou iniciar novos experimentos.

## 7. Mockups de Baixo Nível (Wireframes)

Para ilustrar as principais interfaces do QPlate Architect, apresentamos abaixo mockups de baixo nível (wireframes) para as telas cruciais. Estes wireframes focam na estrutura e no posicionamento dos elementos, sem detalhes de estilo visual, que serão definidos na fase de UI/UX Design.

### 7.1. Tela de Design da Placa

```mermaid
graph TD
    A[Header: QPlate Architect | Projeto: [Nome do Projeto] | Salvar | Exportar] --> B(Painel Lateral Esquerdo: Ferramentas de Design)
    B --> B1(Seleção de Formato de Placa: [96 poços] [384 poços] [48 poços] [Tiras])
    B --> B2(Tipos de Poços: Amostra [Cor] | Padrão [Cor] | Controle Positivo [Cor] | Controle Negativo [Cor] | NTC [Cor] | Branco [Cor] | + Novo Tipo)
    B --> B3(Ferramentas de Preenchimento: Replicatas (Vertical/Horizontal) | Série de Diluição | Preencher Tudo)
    B --> B4(Detalhes do Poço Selecionado: [Nome da Amostra] | [Concentração] | [Notas])
    B --> B5(Número Total de Reações: [X])

    A --> C(Área Central: Visualização da Placa)
    C --> C1(Grade da Placa: A1, A2... H12 para 96 poços)
    C1 --> C2(Poço A1: [Tipo/Cor] [Nome/Concentração])
    C1 --> C3(Poço A2: [Tipo/Cor] [Nome/Concentração])
    C1 --> C4(Poço B1: [Tipo/Cor] [Nome/Concentração])
    C --> C5(Controles de Zoom/Pan)

    C --> D(Botão: Calcular Master Mix)
    C --> E(Botão: Salvar Template de Placa)
```

**Descrição:**

*   **Header:** Contém o título do aplicativo, o nome do projeto atual, e botões de ação global como Salvar e Exportar.
*   **Painel Lateral Esquerdo (Ferramentas de Design):** Agrupa todas as opções para configurar a placa. Inclui a seleção do formato da placa, a paleta de tipos de poços com suas cores e rótulos, ferramentas de preenchimento rápido para agilizar o layout, e um painel de detalhes que exibe informações do poço atualmente selecionado (ou múltiplos poços).
*   **Área Central (Visualização da Placa):** É a representação visual interativa da microplaca. Os poços são exibidos em uma grade, e cada poço reflete o tipo e o conteúdo atribuído pelo usuário (cor, nome da amostra, concentração). Controles de zoom e pan permitirão navegar por placas maiores.
*   **Botões de Ação:** "Calcular Master Mix" levará o usuário ao próximo passo crucial, e "Salvar Template de Placa" permitirá a reutilização do layout.

### 7.2. Tela da Calculadora de Master Mix

```mermaid
graph TD
    A[Header: QPlate Architect | Projeto: [Nome do Projeto] | Voltar ao Design da Placa] --> B(Painel Central: Calculadora de Master Mix)
    B --> B1(Título: Calculadora de Master Mix)
    B --> B2(Número Total de Reações na Placa: [X] reações)
    B --> B3(Seção: Reagentes do Master Mix)
    B3 --> B3_1(Tabela de Entrada de Reagentes)
    B3_1 --> B3_1_1(Coluna: Reagente | Input: [Nome do Reagente])
    B3_1 --> B3_1_2(Coluna: Volume por Reação (1x) (µL) | Input: [Volume])
    B3_1 --> B3_1_3(Botão: + Adicionar Reagente | Botão: - Remover Reagente)
    B --> B4(Seção: Margem de Segurança)
    B4 --> B4_1(Radio: Amostras Extras | Input: [Número de Amostras Extras])
    B4 --> B4_2(Radio: Porcentagem Extra (%) | Input: [Porcentagem])
    B --> B5(Seção: Resultados do Master Mix)
    B5 --> B5_1(Tabela de Saída de Volumes)
    B5_1 --> B5_1_1(Coluna: Reagente)
    B5_1 --> B5_1_2(Coluna: Volume por Reação (1x) (µL))
    B5_1 --> B5_1_3(Coluna: Volume Total (µL))
    B --> B6(Destaque: Volume Total Final do Master Mix: [Y] µL)
    B --> B7(Botão: Preparar Placa (Ativa Mini-POP))
```

**Descrição:**

*   **Header:** Mantém a navegação consistente, permitindo ao usuário retornar ao design da placa.
*   **Painel Central (Calculadora de Master Mix):** Contém todos os elementos para configurar e visualizar os cálculos.
*   **Número Total de Reações:** Exibe claramente o número de reações importado do design da placa.
*   **Seção de Reagentes:** Uma tabela dinâmica onde o usuário insere cada reagente e seu volume por reação. Botões para adicionar/remover linhas facilitam a customização.
*   **Seção de Margem de Segurança:** Permite ao usuário escolher entre adicionar amostras extras ou uma porcentagem extra ao cálculo total, com campos de entrada correspondentes.
*   **Seção de Resultados:** Uma tabela de saída que mostra o volume por reação (1x) e o volume total necessário para cada reagente, já considerando a margem de segurança. O "Volume Total Final do Master Mix" é exibido em destaque.
*   **Botão "Preparar Placa":** O ponto de entrada para o módulo Mini-POP, guiando o usuário para a etapa de preparação física.

### 7.3. Pop-up do Mini-POP (Checklist Interativo)

```mermaid
graph TD
    A[Pop-up/Modal: Preparação da Placa (Mini-POP)] --> B(Título: Checklist de Preparação da Placa)
    B --> B1(Descrição: Siga os passos abaixo para montar sua placa.)
    B --> B2(Lista de Itens da Checklist)
    B2 --> B2_1(Checkbox: [ ] Degelar todos os reagentes e mantê-los no gelo.)
    B2 --> B2_2(Checkbox: [ ] Vortexar e centrifugar brevemente todos os reagentes.)
    B2 --> B2_3(Checkbox: [ ] Preparar o Master Mix na bancada (em um microtubo) conforme a calculadora.)
    B2 --> B2_4(Checkbox: [ ] Homogeneizar o Master Mix e distribuir [X] µL em cada poço/tira.)
    B2 --> B2_5(Checkbox: [ ] Adicionar amostras/padrões/controles nos poços correspondentes.)
    B2 --> B2_6(Checkbox: [ ] Selar a placa/tiras com filme adesivo óptico.)
    B2 --> B2_7(Checkbox: [ ] Centrifugar a placa brevemente para remover bolhas.)
    B2 --> B2_8(Checkbox: [ ] Colocar a placa no termociclador e iniciar a corrida.)
    B --> B3(Botão: Editar Checklist | Botão: Fechar)
```

**Descrição:**

*   **Pop-up/Modal:** Surge sobre a interface principal, focando a atenção do usuário na tarefa de preparação.
*   **Título e Descrição:** Informam o propósito do Mini-POP.
*   **Lista de Itens da Checklist:** Apresenta cada etapa como um item interativo com uma caixa de seleção. O volume 'X' no item de distribuição do Master Mix será preenchido dinamicamente com o valor calculado pela calculadora.
*   **Botão "Editar Checklist":** Permite que usuários autorizados customizem a lista de passos.
*   **Botão "Fechar":** Para dispensar o Mini-POP após a conclusão ou para pausar a preparação.

## 8. Conclusão

O QPlate Architect será uma ferramenta transformadora para a comunidade científica, oferecendo uma solução integrada e inteligente para o design e gerenciamento de experimentos em microplacas. Ao abordar as deficiências das ferramentas genéricas e incorporar funcionalidades específicas para o laboratório, o aplicativo não apenas economizará tempo e reagentes, mas também elevará a qualidade e a reprodutibilidade da pesquisa. Este PRD serve como a base para o desenvolvimento, fornecendo uma visão clara dos requisitos funcionais, não funcionais, UX/UI e o fluxo do usuário, juntamente com os mockups de baixo nível para guiar as equipes de design e engenharia. Estamos confiantes de que o QPlate Architect se tornará um recurso indispensável em laboratórios de biologia molecular em todo o mundo.

---

**Autor:** Manus AI
**Data:** 21 de setembro de 2025
**Versão:** 1.0




### 7.1. Tela de Design da Placa

![Mockup da Tela de Design da Placa](https://private-us-east-1.manuscdn.com/sessionFile/MJaZEnSsnaZugFRBD1nqUu/sandbox/bwp8l6G4V3690ViRQNm6W6-images_1758736819562_na1fn_L2hvbWUvdWJ1bnR1L3BsYXRlX2Rlc2lnbl9tb2NrdXA.png?Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvTUphWkVuU3NuYVp1Z0ZSQkQxbnFVdS9zYW5kYm94L2J3cDhsNkc0VjM2OTBWaVJRTm02VzYtaW1hZ2VzXzE3NTg3MzY4MTk1NjJfbmExZm5fTDJodmJXVXZkV0oxYm5SMUwzQnNZWFJsWDJSbGMybG5ibDl0YjJOcmRYQS5wbmciLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=Lmcfsa82-m18C7P7rc8O9ULeIau4yjmZLhQnxDZjd7pnwES9fYquzRHzUSwr-krOAUyQrW~ErTl47daayANVfrH3TaoATPbzHJSUrQdnY2TTVDaoNsDZoW16Pr5NFC-4YHXKc7P6HN7zPwPdtpVv1n23hZYFxc4bAqcfwyASbSPRTBrip51EFDDl2ds~orzKDYGVzsey2LbLenhR-o66xt91Iuo1hjbYbXLiTwlzacNDZUctQb5R-MuJ9K1I6Fhno-Ll5SLGBMzg8F0TB9NnP~40E1Eugm5fkcw~9CBjWUeBGIOr0c~qxM-KN-vm~qc2fV9DhE~eKiJ6qSVNSL8PQQ__)

**Descrição:**

*   **Header:** Contém o título do aplicativo, o nome do projeto atual, e botões de ação global como Salvar e Exportar.
*   **Painel Lateral Esquerdo (Ferramentas de Design):** Agrupa todas as opções para configurar a placa. Inclui a seleção do formato da placa, a paleta de tipos de poços com suas cores e rótulos, ferramentas de preenchimento rápido para agilizar o layout, e um painel de detalhes que exibe informações do poço atualmente selecionado (ou múltiplos poços).
*   **Área Central (Visualização da Placa):** É a representação visual interativa da microplaca. Os poços são exibidos em uma grade, e cada poço reflete o tipo e o conteúdo atribuído pelo usuário (cor, nome da amostra, concentração). Controles de zoom e pan permitirão navegar por placas maiores.
*   **Botões de Ação:** "Calcular Master Mix" levará o usuário ao próximo passo crucial, e "Salvar Template de Placa" permitirá a reutilização do layout.

### 7.2. Tela da Calculadora de Master Mix

![Mockup da Tela da Calculadora de Master Mix](https://private-us-east-1.manuscdn.com/sessionFile/MJaZEnSsnaZugFRBD1nqUu/sandbox/bwp8l6G4V3690ViRQNm6W6-images_1758736819566_na1fn_L2hvbWUvdWJ1bnR1L21hc3Rlcl9taXhfY2FsY3VsYXRvcl9tb2NrdXA.png?Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvTUphWkVuU3NuYVp1Z0ZSQkQxbnFVdS9zYW5kYm94L2J3cDhsNkc0VjM2OTBWaVJRTm02VzYtaW1hZ2VzXzE3NTg3MzY4MTk1NjZfbmExZm5fTDJodmJXVXZkV0oxYm5SMUwyMWhjM1JsY2w5dGFYaGZZMkZzWTNWc1lYUnZjbDl0YjJOcmRYQS5wbmciLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=kkfr27uX0NUdvzlpg2AonKrdny~AEriYK7HKcuyHG20btuhP7RmMAl8WAsB-1DBBrH9vdup8pn4qnYHOR4oDzq563lhY5MG10AA4MCbkhQ2inifJUjZ4VnXR3Vi1-7AMIiCRCRLqZp29NvfaUmpx1xcWOaSOLUqvzB9Si1D68d7mqL9hxJwvGcRhypRbZmocBWCa0SEel8YsY3ypcEK4gQNnxEa2dkRuSh9GZaHqSadDKhnDpsIdBdQvZCSZy6OfE-7nR72uwSQd6PLn5DGFxYyF8PpqUXuZjaibKqqpE8BoQTXIYZaKgx~qUBVUwiBd7RlujAAmqg9z2VQqnxLr2w__)

**Descrição:**

*   **Header:** Mantém a navegação consistente, permitindo ao usuário retornar ao design da placa.
*   **Painel Central (Calculadora de Master Mix):** Contém todos os elementos para configurar e visualizar os cálculos.
*   **Número Total de Reações:** Exibe claramente o número de reações importado do design da placa.
*   **Seção de Reagentes:** Uma tabela dinâmica onde o usuário insere cada reagente e seu volume por reação. Botões para adicionar/remover linhas facilitam a customização.
*   **Seção de Margem de Segurança:** Permite ao usuário escolher entre adicionar amostras extras ou uma porcentagem extra ao cálculo total, com campos de entrada correspondentes.
*   **Seção de Resultados:** Uma tabela de saída que mostra o volume por reação (1x) e o volume total necessário para cada reagente, já considerando a margem de segurança. O "Volume Total Final do Master Mix" é exibido em destaque.
*   **Botão "Preparar Placa":** O ponto de entrada para o módulo Mini-POP, guiando o usuário para a etapa de preparação física.

### 7.3. Pop-up do Mini-POP (Checklist Interativo)

![Mockup do Pop-up do Mini-POP (Checklist Interativo)](https://private-us-east-1.manuscdn.com/sessionFile/MJaZEnSsnaZugFRBD1nqUu/sandbox/bwp8l6G4V3690ViRQNm6W6-images_1758736819569_na1fn_L2hvbWUvdWJ1bnR1L21pbmlfcG9wX21vY2t1cA.png?Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvTUphWkVuU3NuYVp1Z0ZSQkQxbnFVdS9zYW5kYm94L2J3cDhsNkc0VjM2OTBWaVJRTm02VzYtaW1hZ2VzXzE3NTg3MzY4MTk1NjlfbmExZm5fTDJodmJXVXZkV0oxYm5SMUwyMXBibWxmY0c5d1gyMXZZMnQxY0EucG5nIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzk4NzYxNjAwfX19XX0_&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=PI5bze3Jqy5qUnrsjgzdZKcgYEFeYLSYuR7Osn5Ql109jCCSboaqteyc4RAjPLZvvJGTRyRjM9eGgUofUqmZgL1UELNRnvrNM23W6xSoyypdUeVBLrErgvu88zbsvAsxR0xNS1XciYj0omz91brPacYwMHl5st16o5bdW5ZmQ8SAlSjrIFK3f8X4MOhlMoVlJG8b2uajo1XNJXToJxKyhweCHFdCufYSJrzfUgaIOmnV-LJwMqDpgI85wKObKEP-AdAK3V2U5xOtMKIRh1t2NseYf9m0V~4gLkNJ9d1lRMh4Pk0UO3KlTcYwjnSvfN316c83lWkUUfHjLnTKWYV1fw__)

**Descrição:**

*   **Pop-up/Modal:** Surge sobre a interface principal, focando a atenção do usuário na tarefa de preparação.
*   **Título e Descrição:** Informam o propósito do Mini-POP.
*   **Lista de Itens da Checklist:** Apresenta cada etapa como um item interativo com uma caixa de seleção. O volume 'X' no item de distribuição do Master Mix será preenchido dinamicamente com o valor calculado pela calculadora.
*   **Botão "Editar Checklist":** Permite que usuários autorizados customizem a lista de passos.
*   **Botão "Fechar":** Para dispensar o Mini-POP após a conclusão ou para pausar a preparação.

## 8. Conclusão

O QPlate Architect será uma ferramenta transformadora para a comunidade científica, oferecendo uma solução integrada e inteligente para o design e gerenciamento de experimentos em microplacas. Ao abordar as deficiências das ferramentas genéricas e incorporar funcionalidades específicas para o laboratório, o aplicativo não apenas economizará tempo e reagentes, mas também elevará a qualidade e a reprodutibilidade da pesquisa. Este PRD serve como a base para o desenvolvimento, fornecendo uma visão clara dos requisitos funcionais, não funcionais, UX/UI e o fluxo do usuário, juntamente com os mockups de baixo nível para guiar as equipes de design e engenharia. Estamos confiantes de que o QPlate Architect se tornará um recurso indispensável em laboratórios de biologia molecular em todo o mundo.

---

**Autor:** Manus AI
**Data:** 21 de setembro de 2025
**Versão:** 1.0


