# Progetto Ethereum Advanced - Demetra Shoes
<a name="readme-top"></a>

## Introduzione

**DemetraShoes** è una collezione esclusiva di NFT basata su Ethereum, in cui ogni token rappresenta un paio di scarpe digitali con caratteristiche uniche. Il progetto utilizza Chainlink VRF per generare attributi casuali come durabilità, comfort, sostenibilità e biodegradabilità, rendendo ogni NFT unico e collezionabile.

## Sommario

- [Prerequisiti](#prerequisiti)
- [Installazione](#installazione)
- [Struttura del progetto](#struttura-del-progetto)
- [Tecnologie Utilizzate](#tecnologie-utilizzate)
- [Funzionalità](#funzionalità)
- [Link Progetto](#link-progetto)
- [Contatti](#contatti)

---

## Prerequisiti

Prima di eseguire l'applicazione, assicurati di avere installati i seguenti strumenti:

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/) o [yarn](https://yarnpkg.com/)

Puoi verificare se hai già questi strumenti con i seguenti comandi:

```bash
node -v
npm -v
```

## Installazione

Segui questi passaggi per configurare e avviare il progetto **Demetra Shoes** nel tuo ambiente locale:

1. **Clona il repository**  
   Utilizza Git per clonare il repository del progetto:  
   ```bash
   git clone https://github.com/tuo-username/demetrashoes.git
   cd demetrashoes
   ```

2. **Installa le dipendenze**  
   Assicurati di avere `npm` installato, quindi esegui:  
   ```bash
   npm install
   ```

3. **Configura l'ambiente**    
   - Inserisci la tua private key e API Key di Infuria nel hardhat.config.js:
     ```plaintext
     PRIVATE_KEY=<la tua chiave privata>
     INFURA_API_KEY=<il tuo Infura API Key>
     ```
   - Sostituisci `<la tua chiave privata>` e `<il tuo Infura API Key>` con i valori corretti.

   - Inserisci la tua API Key di Etherscan nel hardhat.config.js:
     ```plaintext
     const ETHERSCAN_API_KEY = '<La tua Etherscan API Key>'.
     ```

4. **Compila i contratti**  
   Compila gli smart contract con Hardhat:  
   ```bash
   npx hardhat compile
   ```

5. **Esegui i test (opzionale)**  
   Per assicurarti che tutto funzioni correttamente, esegui i test:  
   ```bash
   npx hardhat test
   ```

7. **Esegui il Deployment**

   Esegui il deployment dei contratti seguendo questi passaggi:

   1. **Deploy del contratto Demetra Shoes**:  
      Per eseguire il deploy del contratto **DemetraShoes**, è necessario eseguire il seguente comando:

      ```bash
      npx hardhat run scripts/deploy.js --network <network_name>
      ```

### Struttura del progetto

Ogni cartella ha uno scopo specifico:
- **`contracts/`**: Contiene gli smart contract Solidity statici, accessibili direttamente per interazioni con la blockchain.
- **`scripts/`**: Contiene le istruzioni di deploy per l'ambiente hardhat.
  - **`tests/`**: Contiene i test per il contratto DemetraShoes.
  - **`hardhat.config.js/`**: File di configurazione di Hardhat che contiene informazioni di rete e dati statici, come le API key e le configurazioni dei contratti.
  - **`package.json/`**: Contiene le dipendenze del progetto.


## Tecnologie Utilizzate

- **Hardhat**: Framework di sviluppo per Ethereum che permette di compilare, testare e distribuire smart contract in modo facile e veloce. Utilizzato per la gestione e il deployment degli smart contract.
- **Solidity**: Linguaggio di programmazione per la scrittura degli smart contract su blockchain Ethereum.
- **Ethereum**: Blockchain utilizzata per l'esecuzione degli smart contract e per la gestione delle transazioni decentralizzate.
- **Ether.js**: Libreria JavaScript per interagire con la blockchain Ethereum. Utilizzata per gestire transazioni, smart contract e wallet in modo sicuro e semplice.
- **VRF Chainlink**: Sistema di generazione di numeri casuali verificabili che assicura assegnazioni trasparenti e imparziali degli attributi degli NFT.

## Funzionalità

Il contratto DemetraShoes è un ERC721 con caratteristiche uniche per ogni NFT generate casualmente tramite Chainlink VRF. Ecco le sue funzionalità:

- **Minting con richiesta di casualità**: Gli utenti possono minare un NFT inviando 0.001 ETH e ottenendo un numero casuale che determina le caratteristiche del token.
- **Attributi personalizzati**: Ogni NFT ha parametri unici come durability, comfort, sustainability e biodegradability.
- **Sistema di sconti**: Basato sugli attributi dell’NFT, è possibile ottenere fino al 20% di sconto.
- **Golden Pass**: 1 su 50 NFT ottiene uno status speciale.
- **Gestione dei metadati**: Gli URI dei token vengono generati dinamicamente.
- **Funzione di burn**: Un proprietario può bruciare il proprio NFT.
- **Possibilità di prelievo**: Il proprietario del contratto può ritirare i fondi accumulati.


## Realizzato con:
- Visual Studio Code

## Link progetto:

- Repo GitHub: https://github.com/StefanoRimoldi/Progetto-Ethereum-Advanced.git

## Contatti
- Email: rimoldistefano@gmail.com
- Linkedin: www.linkedin.com/in/stefano-rimoldi

<p align="right">(<a href="#readme-top">back to top</a>)</p>
