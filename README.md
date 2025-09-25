QPlate Architect
<!-- Substitua este link por uma URL de uma screenshot do seu app -->

Uma aplicação web intuitiva e moderna para o design, gerenciamento e documentação de experimentos em microplacas (qPCR, PCR, ELISA, etc.). Desenvolvido para agilizar o trabalho de pesquisadores e estudantes, substituindo planilhas genéricas por uma ferramenta especializada.

Link para a aplicação ao vivo: https://qplate-architect.vercel.app/

✨ Funcionalidades Principais
Design de Placa Interativo:

Suporte para múltiplos formatos (96, 384, 48 poços).

Atribuição de tipos de poços com código de cores (Amostra, Padrão, Controles, etc.).

Ferramentas de preenchimento rápido para Duplicatas e Triplicatas.

Edição de detalhes por poço (Rótulo, Concentração) com duplo clique.

Calculadora de Master Mix Inteligente:

Cálculo automático de reagentes com base no número de reações da placa.

Opções de margem de segurança (reações extras ou porcentagem).

Tabela de resultados clara com volumes por reação e totais.

Mini-POP (Checklist de Protocolo):

Checklist interativo e editável para guiar o usuário na preparação da placa.

Contador de progresso para acompanhar as etapas.

Persistência e Gerenciamento:

Salvamento Automático: O seu trabalho é salvo automaticamente no navegador (localStorage).

Exportar/Importar: Salve e carregue seus projetos em arquivos .json.

🛠️ Tecnologias Utilizadas
Frontend: React + Vite

Estilização: Tailwind CSS

Componentes UI: shadcn/ui

Ícones: Lucide React

Deploy: Vercel

🚀 Como Executar o Projeto Localmente
Para rodar este projeto na sua máquina, siga os passos abaixo.

Clone o repositório:

git clone [https://github.com/Lemony29/Qplate-Architect.git](https://github.com/Lemony29/Qplate-Architect.git)

Navegue até a pasta do projeto:

cd Qplate-Architect

Instale as dependências:

npm install

Inicie o servidor de desenvolvimento:

npm run dev

Abra http://localhost:5173 no seu navegador para ver a aplicação.