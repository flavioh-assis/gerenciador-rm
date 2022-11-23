# Gerenciador de RM
Gerenciador de Registro de Matrícula para a EMEB. Maria Virgínia Matarazzo Ippólito

## O Projeto
* Objetivos:
  * Criar um programa desktop que auxilie na gestão de dados
  * Ser fácil de usar, rápido de executar e responsivo
  * Ajudar a reduzir os erros mais comuns do usuário

* Ferramentas/Tecnologias:
  * [Electron](https://www.electronjs.org/): aplicação desktop
  * [React](https://reactjs.org/): interface gráfica
  * [Node.js](https://nodejs.org/en/): back-end
  * [SQLite](https://www.sqlite.org/index.html): banco de dados

* Criado, codificado e testado por:
  * [Flavio Assis](https://github.com/flavioh-assis)
  
* Licença:
  * [MIT](./LICENSE)
  
## Como usar

Clone o repositório
```bash
git clone --depth=1 https://github.com/flavioh-assis/rm_manager
```

Instale as dependências
```bash
cd rm_manager & yarn install
```

Inicialize a aplicação em dev
```bash
yarn dev
```

## DevTools

Abrir DevTools:

* Linux/Windows: <kbd>Ctrl</kbd> <kbd>Shift</kbd> <kbd>I</kbd> or <kbd>F12</kbd>

## Criar pacote para distribuição
  * Para Windows:
```bash
yarn dist:win
```
  * Para Linux:
```bash
yarn dist:lin
```
