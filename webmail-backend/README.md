# Projeto Webmail com .NET 6

O projeto visa criar um sistema de webmail robusto utilizando a tecnologia .NET 6. Essa versão do framework traz melhorias significativas, proporcionando uma experiência de desenvolvimento moderna e eficiente.

## Pré-requisitos

Antes de começar, certifique-se de ter os seguintes pré-requisitos instalados em sua máquina:

- [.NET 6 SDK](https://dotnet.microsoft.com/download/dotnet/6.0)

- [Visual Studio 2022](https://visualstudio.microsoft.com/pt-br/vs/) (opcional)

- A instação do Visual Studio 2022 não é necessária, mas preferível por facilitar a execução do projeto, dito isso, é possivel utilizar algum outro editor como o [Visual Studio Code](https://code.visualstudio.com/download) instalando apenas o .NET 6 SDK.

- Caso opte por instalar o Visual Studio 2022 a instação do .NET 6 SDK pode não ser necessário caso inclua o SDK na instalação da IDE.

## Configuração do Projeto

1. **Clone o repositório (caso não exista):**

```bash
git clone https://github.com/FelipeValentim/webmail.git
```

2. **Abra a solução no Visual Studio:**

- Abra o Visual Studio e selecione "Arquivo" -> "Abrir" -> "Projeto/Solução" e escolha o arquivo webmail-backend.sln

3. **Configure a API e a aplicação web:**

- Certifique-se de que o projeto webmail-backend está definido como projeto de inicialização.

4. **Execute o projeto:**

- Execute a aplicação utilizando o Visual Studio 2022 ou o CLI do .NET (dotnet run). Caso opte por utilizar o Visual Studio 2022 basta clicar com o botão direito no projeto (não na solução) e "Depurar" -> "Iniciar Nova Instância"

- A aplicação web estará disponível em `https://localhost:5000`.
