# Back-end - API em NestJS

Este repositório contém a API desenvolvida em **NestJS** para o projeto, integrando com **MongoDB** e **Firebase** para autenticação e funcionalidades complementares.

---

## 🚀 Tecnologias Utilizadas
- [NestJS](https://nestjs.com/) - Framework Node.js para construção de APIs escaláveis
- [MongoDB](https://www.mongodb.com/) - Banco de dados NoSQL
- [Firebase](https://firebase.google.com/) - Autenticação e serviços em nuvem
- [TypeScript](https://www.typescriptlang.org/) - Superset de JavaScript com tipagem estática
- [Yarn](https://yarnpkg.com/) - Gerenciador de pacotes

---

## 📦 Pré-requisitos

Antes de iniciar, você precisará ter instalado:
- [Node.js](https://nodejs.org/) (versão LTS recomendada)
- [Yarn](https://yarnpkg.com/)
- Conta no [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (ou instância local)
- Projeto no [Firebase Console](https://console.firebase.google.com/)

---

## ⚙️ Configuração do Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis (existe um arquivo .env.example para ter como base):

```env
DATABASE_URL=sua_string_de_conexao_mongodb
JWT_SECRET=uma_chave_secreta_segura
FIREBASE_API_KEY=sua_chave_api
FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
FIREBASE_PROJECT_ID=seu_id_projeto
FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
FIREBASE_APP_ID=sua_app_id
```

---

## 🛠️ Instalação e Execução

1. Clonar o repositório

```bash
git clone https://github.com/andre-reder/constalent-api.git
```

2. Instalar as dependências

```bash
yarn install
```

3. Configurar as variáveis de ambiente
Crie o arquivo .env conforme descrito acima.

4. Iniciar o servidor

```bash
yarn start:dev
```

---

## 🌐 Acesso ao sistema completo
Para facilitar a validação, o sistema está disponível no seguinte link:

https://netlify.constalent.com

Acesse o site se autenticando com as seguintes Credenciais:

Visão Empresa R&S:
Email: testers@tcc.com
Senha: senha123

Visão Cliente:
Email: testecliente@tcc.com
Senha: senha123

Este link já está configurado e integrado com o front-end do projeto, não sendo necessário criar conta no Firebase ou configurar banco de dados localmente.

