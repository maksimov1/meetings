import React, {Component} from 'react';
import { Table } from "../table/Table";
import { ModalWindow } from "./ModalWindow";
import { ActionModal } from "../action_modal/ActionModal";
import {Transition, animated} from 'react-spring/renderprops';
import "./MainView.css";
import {BlockchainHandler} from "../../blockchain/BlockchainHandler";

export class MainView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showActionModal: false,
            modalType: null,
            action: false,
            handler: null,
            role: null,
            contract_addr: "",
            selectedEvent: null,
            data: []
        };
        this.handleFindContract = this.handleFindContract.bind(this);
        this.handleNewContract = this.handleNewContract.bind(this);
        this.handleAddEvent = this.handleAddEvent.bind(this);
        this.handleAttend = this.handleAttend.bind(this);
        this.handleCheckAttendance = this.handleCheckAttendance.bind(this);
        this.handleOpenActionModal = this.handleOpenActionModal.bind(this);
        this.handleCloseActionModal = this.handleCloseActionModal.bind(this);
        this.setupFromAddr = this.setupFromAddr.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
    }

    componentDidMount() {
        let handler = new BlockchainHandler();
        this.setState({
            handler: handler
        })
    }

    handleFindContract() {
        let addr = this.state.contract_addr;
        this.setupFromAddr(addr);
    }

    handleNewContract() {
        this.state.handler.newContract(this.setupFromAddr)
    }

    handleAddEvent() {
        this.setState({
            modalType: "add",
            showActionModal: true
        });
    }

    handleCheckAttendance() {
        this.setState({
            modalType: "check",
            showActionModal: true
        });
    }

    handleAttend(account) {
        this.setState({
            modalType: "attend",
            showActionModal: true,
            selectedEvent: account.id
        });
    }

    handleOpenActionModal() {
        this.setState({showActionModal: true});
    }

    handleCloseActionModal(action_string) {
        this.setState({showActionModal: false});
        switch (this.state.modalType) {
            case "attend":
                this.state.handler.newPassport(this.state.selectedEvent, action_string)
                    .then(() => alert("Вы успешно зарегистрировались на встречу"));
                break;
            case "check":
                this.state.handler.checkPassport(this.state.selectedEvent, action_string)
                    .then((val) => val ? alert("Пользователь с паспортом " + action_string + " зарегистрирован на встречу")
                                        : alert("Пользователь с паспортом " + action_string + " не зарегистрирован на встречу"));
                break;
            case "add":
                this.state.handler.newMeeting(action_string)
                    .then(() => {
                        this.setState({
                            data: [...this.state.data, {id: this.state.data.length, name: action_string}]
                        })
                    });
                break;
            default:
                break;
        }
    }

    handleInputChange(event) {
        const target = event.target;
        let value = target.value;
        const name = target.name;
        this.setState({
            [name]: value
        });
    }

    setupFromAddr(addr) {
        let data;
        let role;
        let handler = new BlockchainHandler();
        handler.setup(addr)
            .then(() => handler.loadMeetings())
            .then(() => {
                data = handler.getMeetings();
                role = handler.getRole();
            })
            .then(() => this.setState({
                handler: handler,
                data: data,
                role: role,
                contract_addr: addr
            }));
    }

    render() {
        return (
            <div className="main_view">
                <>
                    <div className="navi_block">
                        <div className="find_contract">
                            <form onSubmit={this.handleFindContract} autoComplete="off" className="frm">
                                <input
                                    className="text_input"
                                    name="contract_addr"
                                    placeholder="Адрес контракта"
                                    type="text"
                                    value={this.state.contract_addr}
                                    onChange={this.handleInputChange}
                                    required/>
                            </form>
                            <button
                                className="action_button"
                                onClick={this.handleFindContract}
                            >Найти
                            </button>
                        </div>
                        <div className="new_contract">
                            <button
                                className="action_button"
                                onClick={this.handleNewContract}
                            >Новый
                            </button>
                        </div>
                    </div>
                    { this.state.role === "1" ?
                        <button
                            style={{marginBottom: "20px"}}
                            className="action_button new_event"
                            onClick={this.handleAddEvent}
                        >Создать событие
                        </button>
                        : null
                    }
                    <Table data={this.state.data}
                           attend={this.handleAttend}
                           checkAttendance={this.handleCheckAttendance}
                    />
                </>
                <ModalWindow>
                    <Transition
                        native
                        items={this.state.showActionModal}
                        from={{
                            opacity: 0, transform: "translateY(1000px)",
                        }}
                        enter={{
                            opacity: 1, transform: "translateY(0px)",
                        }}
                        leave={{
                            opacity: 0, transform: "translateY(1000px)",
                        }}
                    >
                        {show => show && (props =>
                            <animated.div style={props} className="modal_container">
                                <ActionModal
                                    closeActionModal={this.handleCloseActionModal}
                                    handler={this.state.handler}
                                    type={this.state.modalType}
                                    selectedEvent={this.state.selectedEvent}
                                />
                            </animated.div>)}
                    </Transition>
                </ModalWindow>
            </div>
        );
    }
}
