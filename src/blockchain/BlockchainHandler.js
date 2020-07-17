import Web3 from 'web3'
import contractABI from './contract/MeetingContract';
import { v4 as uuid } from 'uuid';
export class BlockchainHandler {
    #contract;
    #web3_window;
    #browserStatus;
    #contract_address;
    #address;
    #meetings;
    #passports;
    #role;
    #createKeccakHash
    constructor() {
        this.#createKeccakHash = require('keccak');
        if (window.ethereum) {
            window.ethereum.enable();
            window.ethereum.autoRefreshOnNetworkChange = false;
            this.freshBrowserInit();
        } else if (window.web3) {// Legacy dapp browsers...
            this.legacyBrowserInit();
        } else {// Non-dapp browsers...
            console.log("No metamask");
            throw new Error();
        }
    }

    getMetamaskAddress() {  //Получение адреса в контракте
        return this.#web3_window.eth.getAccounts().then((val, err) => this.onGettingAddress(val, err));
    }

    onGettingAddress(addr) {
        this.#address = addr[0];
        //console.log(this.#address);
        return Promise.resolve(this.#address);
    }

    generateSalt() {
        let salt = "";
        for (let i = 0; i < 100; i++) {
            salt+=uuid();
        }
        return salt;
    }

    computeHash(string) {
        return this.#createKeccakHash('keccak256').update(string).digest('hex');
    }

    newPassport(numberOfMeeting, passport) { //Регистрация нового паспорта
        let salt = this.generateSalt();
        let hash = this.computeHash(salt + passport);
        return this.#contract.methods.participate(numberOfMeeting, salt, hash).send({
            from: this.#address,
            value : 0
        });
    }

    checkPassport(numberOfMeeting, passport) {   //Проверка участника по номеру пасорта
        return this.loadPassports(numberOfMeeting).then(() => Promise.resolve(this.checkPasswordHashes(this.getPassports(), passport)))
    }

    checkPasswordHashes(passports, passport) {   //Проверка хэшей
        for (let i = 0; i < passports.length; i++) {
            if (this.computeHash(passports[i].salt + passport) === passports[i].hash) {
                return Promise.resolve(true);
            }
        }
        return Promise.resolve(false);
    }


    newMeeting(nameOfMeeting) {   //Создание новой встречи деплоером контракта
        return this.#contract.methods.newMeeting(nameOfMeeting).send({
            from: this.#address,
            value : 0
        });
    }

    setup(address) {    //Получение адреса и роли
        this.#contract_address = address;
        this.#contract = new this.#web3_window.eth.Contract(contractABI.abi, this.#contract_address);
        return this.getMetamaskAddress().then((val) => this.#contract.methods.getRole(val).call().then(((val) => this.setRole(val))))
    }

    setRole(user_role) {
        this.#role = user_role;
        return Promise.resolve(this.#role);
    }

    getRole() {
        return this.#role;
    }

    loadMeetings() { //Загрузка описаний встреч в контракте
        let contract = this.#contract;
        let callback = this.onLoadMeetings;
        let storage = this.#meetings;
        return this.#contract.methods.getAmountOfMeetings().call().then(function (val) {
            if (val === 0) {
                return Promise.resolve(null);
            } else {
                return contract.getPastEvents('onNewMeeting', {
                    fromBlock : 0,
                    toBlock : 'latest'
                }, (error, events) => callback(events, storage));
            }
        })
    }

    loadPassports(id) { //Загрузка хэшей пасортов по номеру встречи
        this.#passports = [];
        let contract = this.#contract;
        let callback = this.onLoadPassports;
        let storage = this.#passports;
        return contract.getPastEvents('onAddPassportInfo', {
            filter : {
                numberOfMeeting : id
            },
            fromBlock : 0,
            toBlock : 'latest'
        }, (error, events) => callback(events, storage));
    }

    onLoadPassports(events, storage) {
        events.forEach(element => storage.push({
            salt : element.returnValues[2],
            hash : element.returnValues[3]
        }));
        return Promise.resolve(storage);
    }

    getPassports() {
        return this.#passports;
    }

    onLoadMeetings(events, storage) {
        events.forEach(element => storage.push({
            id : element.returnValues[0],
            name : element.returnValues[1]
        }));
        //console.log(this.#meetings)
        return Promise.resolve(storage);
    }

    newContract(callback) {
        let ret_addr;
        this.#contract = new this.#web3_window.eth.Contract(contractABI.abi);
        let contract = this.#contract;
        let self = this;
        return this.getMetamaskAddress().then((addr) => {
            contract.deploy({
                data : contractABI.bytecode
            }).send({
                from : addr,
                value : 0
            }).on('receipt', function(receipt) {
                //console.log(receipt.contractAddress) // contains the new contract address
                ret_addr = receipt.contractAddress;
                callback(receipt.contractAddress);
            }).then((val) => {return Promise.resolve(ret_addr)});
        })
    }

    getContractAddress() {
        return this.#contract_address;
    }


    getMeetings() {
        return this.#meetings;
    }


    freshBrowserInit() {
        this.#web3_window = new Web3(window.ethereum);
        this.#browserStatus = 1;
        this.#meetings = [];
    }

    legacyBrowserInit() {
        this.#browserStatus = 2;
        this.#web3_window = new Web3(window.web3.currentProvider);
    }
}
