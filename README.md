## Documentação da API

### Visão Geral

Esta API gerencia a leitura individualizada de consumo de água e gás. Utiliza IA para obter medições através de imagens de medidores. A aplicação está desenvolvida com Node.js e TypeScript, e é dockerizada para fácil deploy. A aplicação expõe a API na porta 80.

### Endpoints

### 1. **Upload de Imagem**

- **Método:** `POST`
- **Caminho:** `/upload`
- **Descrição:** Recebe uma imagem em base64, consulta a API de IA para obter a medição, e retorna o valor lido.
- **Corpo da Requisição:**
    
    ```json
    jsonCopy code
    {
      "image": "BASE64",
      "customer_code": "string",
      "measure_datetime": "datetime",
      "measure_type": "WATER" ou "GAS"
    }
    
    ```
    
- **Respostas:**
    - `200 OK`:
        
        ```json
        jsonCopy code
        {
          "image_url": "string",
          "measure_value": integer,
          "measure_uuid": "string"
        }
        
        ```
        
    - `400 Bad Request`:
        
        ```json
        jsonCopy code
        {
          "error_code": "INVALID_DATA",
          "error_description": "Descrição do erro"
        }
        
        ```
        
    - `409 Conflict`:
        
        ```json
        jsonCopy code
        {
          "error_code": "DOUBLE_REPORT",
          "error_description": "Leitura do mês já realizada"
        }
        
        ```
        
- **Exemplo com cURL:**
    
    ```bash
    bashCopy code
    curl -X POST \
      'http://localhost:80/upload' \
      --header 'Accept: */*' \
      --header 'Content-Type: application/json' \
      --data-raw '{
        "image": "BASE64",
        "customer_code": "1",
        "measure_datetime": "2024-09-27T12:00:00Z",
        "measure_type": "GAS"
      }'
    
    ```
    

### 2. **Confirmação de Medida**

- **Método:** `PATCH`
- **Caminho:** `/confirm`
- **Descrição:** Confirma ou corrige o valor lido pela IA.
- **Corpo da Requisição:**
    
    ```json
    jsonCopy code
    {
      "measure_uuid": "string",
      "confirmed_value": integer
    }
    
    ```
    
- **Respostas:**
    - `200 OK`:
        
        ```json
        jsonCopy code
        {
          "success": true}
        
        ```
        
    - `400 Bad Request`:
        
        ```json
        jsonCopy code
        {
          "error_code": "INVALID_DATA",
          "error_description": "Descrição do erro"
        }
        
        ```
        
    - `404 Not Found`:
        
        ```json
        jsonCopy code
        {
          "error_code": "MEASURE_NOT_FOUND",
          "error_description": "Leitura não encontrada"
        }
        
        ```
        
    - `409 Conflict`:
        
        ```json
        jsonCopy code
        {
          "error_code": "CONFIRMATION_DUPLICATE",
          "error_description": "Leitura já confirmada"
        }
        
        ```
        
- **Exemplo com cURL:**
    
    ```bash
    bashCopy code
    curl -X PATCH \
      'http://localhost:80/confirm' \
      --header 'Accept: */*' \
      --header 'Content-Type: application/json' \
      --data-raw '{
        "measure_uuid": "3c56c237-bf13-4158-bd48-4a44edde379b",
        "confirmed_value": 100
      }'
    
    ```
    

### 3. **Listar Medidas**

- **Método:** `GET`
- **Caminho:** `/:customer_code/list`
- **Descrição:** Lista todas as medidas para um código de cliente específico. Pode filtrar por tipo de medida.
- **Parâmetros de Consulta:**
    - `measure_type` (opcional): Tipo da medida, pode ser "WATER" ou "GAS" (case insensitive).
- **Respostas:**
    - `200 OK`:
        
        ```json
        jsonCopy code
        {
          "customer_code": "string",
          "measures": [
            {
              "measure_uuid": "string",
              "measure_datetime": "datetime",
              "measure_type": "string",
              "has_confirmed": boolean,
              "image_url": "string"
            },
            {
              "measure_uuid": "string",
              "measure_datetime": "datetime",
              "measure_type": "string",
              "has_confirmed": boolean,
              "image_url": "string"
            }
          ]
        }
        
        ```
        
    - `400 Bad Request`:
        
        ```json
        jsonCopy code
        {
          "error_code": "INVALID_TYPE",
          "error_description": "Tipo de medição não permitido"
        }
        
        ```
        
    - `404 Not Found`:
        
        ```json
        jsonCopy code
        {
          "error_code": "MEASURES_NOT_FOUND",
          "error_description": "Nenhuma leitura encontrada"
        }
        
        ```
        
- **Exemplo com cURL:**
    
    ```bash
    bashCopy code
    curl -X GET \
      'http://localhost:80/1/list?measure_type=GAS' \
      --header 'Accept: */*' \
      --header 'Content-Type: application/json'
    
    ```
    

### 4. **Obter Imagem**

- **Método:** `GET`
- **Caminho:** `/images/:filename`
- **Descrição:** Obtém uma imagem com base no nome do arquivo.
- **Parâmetros de URL:**
    - `filename`: Nome do arquivo da imagem.
- **Exemplo de URL:**
    - `http://localhost:80/images/example.jpg`

### Dependências do Projeto

### Dependências

- **`@google/generative-ai`**: `^0.17.1` - Biblioteca para integração com API de IA generativa do Google.
- **`@prisma/client`**: `^5.12.1` - Cliente Prisma para manipulação de banco de dados.
- **`axios`**: `^1.7.5` - Biblioteca para fazer requisições HTTP.
- **`dotenv`**: `^16.4.5` - Carrega variáveis de ambiente a partir de um arquivo `.env`.
- **`express`**: `^4.19.2` - Framework para criar o servidor web.
- **`uuid`**: `^10.0.0` - Biblioteca para gerar identificadores únicos.

### Dependências de Desenvolvimento

- **`@types/dotenv`**: `^8.2.0` - Tipos TypeScript para o `dotenv`.
- **`@types/express`**: `^4.17.21` - Tipos TypeScript para o `express`.
- **`@types/node`**: `^20.12.7` - Tipos TypeScript para o Node.js.
- **`@types/uuid`**: `^10.0.0` - Tipos TypeScript para o `uuid`.
- **`prisma`**: `^5.12.1` - Ferramenta de ORM para o Prisma.
- **`ts-node`**: `^10.9.2` - Executa código TypeScript diretamente.
- **`typescript`**: `^5.4.5` - Compilador TypeScript.
- **`tsup`**: `^8.0.2` - Ferramenta para empacotar e compilar TypeScript.
- **`tsx`**: `^4.7.0` - Executa arquivos TypeScript diretamente com suporte a JSX.

### Estrutura do Projeto

- **Arquivos Principais:**

    - **`src/`**: Diretório principal contendo o código-fonte da aplicação.
    - **`domain/`**: Contém a lógica de domínio da aplicação. Aqui são definidos os modelos e as regras de negócio principais.
        - **`measure/`**: Subdiretório específico para a lógica de negócio relacionada a "measure".
            - **`entity/`**: Contém as entidades que representam os objetos de domínio.
                - **`measure.ts`**: Arquivo contendo a definição da entidade "measure".
    - **`infra/`**: Contém a implementação das interfaces com serviços externos, como APIs, banco de dados e outras dependências de infraestrutura.
        - **`api/`**: Contém a interface da API da aplicação.
            - **`express/`**: Implementação da API usando o framework Express.
                - **`routes/`**: Diretório contendo as rotas da API.
                    - **`measure/`**: Rotas relacionadas ao recurso "measure".
                        - **`confirm-measure.express.route.ts`**: Rota para confirmar uma "measure".
                        - **`create-measure.express.route.ts`**: Rota para criar uma nova "measure".
                        - **`list-measure.express.route.ts`**: Rota para listar "measures".
                        - **`view-measure.express.route.ts`**: Rota para visualizar uma "measure".
                - **`api.express.ts`**: Configuração principal da API usando Express.
        - **`repositories/`**: Implementações dos repositórios que interagem com o banco de dados.
            - **`measure/`**: Repositório relacionado ao recurso "measure".
                - **`measure.repository.ts`**: Implementação do repositório para "measure".
    - **`package/`**: Contém pacotes e utilitários que ajudam na organização e execução do código.
        - **`prisma/`**: Diretório relacionado ao ORM Prisma.
            - **`prisma.ts`**: Arquivo de configuração do Prisma.
    - **`usecases/`**: Contém os casos de uso da aplicação, agrupando a lógica de aplicação específica e a interação entre os componentes.
        - **`confirm-measure/`**: Caso de uso para confirmar uma "measure".
            - **`confirm-measure.usecase.ts`**: Implementação do caso de uso de confirmação.
        - **`list-measure/`**: Caso de uso para listar "measures".
            - **`list-measure.usecase.ts`**: Implementação do caso de uso de listagem.
        - **`upload-measure/`**: Caso de uso para upload de "measure".
            - **`upload-measure.usecase.ts`**: Implementação do caso de uso de upload.
        - **`usecases.ts`**: Arquivo principal que agrupa e exporta os casos de uso.
    - **`temp/`**: Diretório temporário usado para armazenar arquivos temporários durante o processamento.
    - **`main.ts`**: Arquivo principal para inicialização da aplicação.
- **`.env`**: Arquivo de configuração de variáveis de ambiente.
- **`docker-compose.yml`**: Arquivo de configuração do Docker Compose.
- **`Dockerfile`**: Arquivo de configuração para construir a imagem Docker da aplicação.
- **`package.json`**: Arquivo de configuração do npm, contendo as dependências e scripts do projeto.
- **`tsconfig.json`**: Arquivo de configuração do TypeScript.
- **`README.md`**: Arquivo de documentação do projeto.

- **Scripts do Package.json:**
    - **`dev`**: Inicia o projeto em modo de desenvolvimento com `tsx`.
    - **`start`**: Executa a migração e inicia o servidor.
    - **`build`**: Compila o projeto TypeScript e copia o arquivo `.env`.
    - **`migrate`**: Executa as migrações do Prisma.


- **Variáveis de Ambiente:**
    - `GEMINI_API_KEY`: Chave de API para integração com a funcionalidade do Gemini.
    - `DATABASE_URL`: URL do banco de dados para o Prisma.
    - `PORT`: Porta em que a aplicação deve ser exposta.
    - `BASE_URL`: Url base da aplicação.
