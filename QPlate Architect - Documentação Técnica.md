# QPlate Architect - Documentação Técnica

## Visão Geral

O **QPlate Architect** é uma aplicação web profissional desenvolvida especificamente para pesquisadores de laboratório, cientistas e estudantes de biologia molecular. A ferramenta simplifica e padroniza o processo de design e execução de experimentos baseados em microplacas, oferecendo funcionalidades específicas para qPCR, PCR, ELISA e outros ensaios.

## Funcionalidades Principais

### 1. Módulo de Design de Placa
- **Formatos de Placa Suportados**: 96 poços (8x12), 384 poços (16x24), 48 poços (6x8)
- **Tipos de Poços**: Amostra (azul), Padrão (verde), Controle Positivo (vermelho), Controle Negativo (amarelo), NTC (roxo), Branco (cinza)
- **Interação Intuitiva**: Clique nos poços para atribuir tipos
- **Contador de Reações**: Atualização automática do total de reações
- **Ferramentas de Preenchimento**: Duplicatas, triplicatas e limpeza rápida

### 2. Calculadora de Master Mix
- **Integração Automática**: Usa o número de reações da placa
- **Reagentes Pré-configurados**: Lista padrão de reagentes para PCR/qPCR
- **Margem de Segurança**: Opções de amostras extras ou porcentagem extra
- **Cálculos em Tempo Real**: Volumes totais calculados automaticamente
- **Tabela de Resultados**: Exibição clara dos volumes por reagente

### 3. Checklist Interativo (Mini-POP)
- **8 Etapas Padrão**: Desde o descongelamento até a corrida no termociclador
- **Progresso Visual**: Contador de itens concluídos
- **Marcação Interativa**: Checkboxes para cada etapa
- **Funcionalidades de Edição**: Botões para editar e resetar

## Tecnologias Utilizadas

- **React 18**: Framework JavaScript para interface de usuário
- **Vite**: Ferramenta de build rápida e moderna
- **Tailwind CSS**: Framework CSS para estilização
- **shadcn/ui**: Biblioteca de componentes UI profissionais
- **Lucide Icons**: Ícones modernos e consistentes

## Estrutura do Projeto

```
qplate-architect/
├── public/                 # Arquivos públicos
├── src/
│   ├── components/
│   │   └── ui/            # Componentes UI (shadcn/ui)
│   ├── assets/            # Recursos estáticos
│   ├── App.jsx            # Componente principal
│   ├── App.css            # Estilos principais
│   ├── main.jsx           # Ponto de entrada
│   └── index.css          # Estilos globais
├── dist/                  # Build de produção
├── package.json           # Dependências e scripts
└── vite.config.js         # Configuração do Vite
```

## Como Usar

### Design da Placa
1. Selecione o formato da placa (96, 384 ou 48 poços)
2. Escolha o tipo de poço desejado no painel lateral
3. Clique nos poços da grade para atribuir o tipo selecionado
4. Use as ferramentas de preenchimento rápido para duplicatas/triplicatas
5. Observe o contador de reações sendo atualizado automaticamente

### Calculadora de Master Mix
1. Navegue para a aba "Master Mix"
2. O número de reações será importado automaticamente da placa
3. Ajuste os reagentes e volumes conforme necessário
4. Configure a margem de segurança (amostras extras ou porcentagem)
5. Visualize os volumes totais calculados na tabela de resultados

### Mini-POP (Checklist)
1. Acesse a aba "Mini-POP"
2. Siga os 8 passos do checklist de preparação
3. Marque cada item conforme for completando
4. Acompanhe o progresso no contador
5. Use os botões "Editar" ou "Resetar" conforme necessário

## Estrutura de Dados

### Tipos de Poços
```javascript
{
  sample: { name: 'Amostra', color: 'bg-blue-500' },
  standard: { name: 'Padrão', color: 'bg-green-500' },
  positive: { name: 'Controle +', color: 'bg-red-500' },
  negative: { name: 'Controle -', color: 'bg-yellow-500' },
  ntc: { name: 'NTC', color: 'bg-purple-500' },
  blank: { name: 'Branco', color: 'bg-gray-300' }
}
```

### Reagentes Padrão
- Taq DNA Polimerase (0.2 µL/reação)
- Buffer de Reação 10X (2.0 µL/reação)
- dNTPs 10mM (0.4 µL/reação)
- Primer Forward 10µM (0.5 µL/reação)
- Primer Reverse 10µM (0.5 µL/reação)
- Água livre de nucleases (16.4 µL/reação)

## Fórmulas de Cálculo

### Amostras Extras
```
Volume Total = Volume por Reação × (Número de Reações + Amostras Extras)
```

### Porcentagem Extra
```
Volume Total = Volume por Reação × Número de Reações × (1 + Porcentagem/100)
```

## Recursos Avançados

- **Interface Responsiva**: Funciona em desktops, tablets e dispositivos móveis
- **Feedback Visual**: Estados de hover, transições suaves e micro-interações
- **Navegação por Abas**: Sistema intuitivo para alternar entre módulos
- **Cálculos Automáticos**: Integração perfeita entre design da placa e calculadora
- **Design Profissional**: Interface limpa e moderna adequada para ambiente laboratorial

## Suporte e Compatibilidade

- **Navegadores**: Chrome, Firefox, Safari, Edge (versões modernas)
- **Dispositivos**: Desktop, tablet, mobile
- **Performance**: Otimizada para cálculos em tempo real
- **Acessibilidade**: Labels apropriados e navegação por teclado

## Conclusão

O QPlate Architect representa uma solução completa e profissional para design de experimentos em microplacas. Com sua interface intuitiva, funcionalidades avançadas e design responsivo, a ferramenta atende às necessidades de pesquisadores experientes e estudantes iniciantes, contribuindo para maior eficiência e reprodutibilidade nos experimentos de laboratório.

