import React, {Component} from 'react';
import './ActionModal.css';

export class ActionModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            action: "",
        };

        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleInputChange(event) {
        const target = event.target;
        let value = target.value;
        const name = target.name;
        this.setState({
            [name]: value
        });
    }


    handleSubmit(e) {
        e.preventDefault();
        const key = this.state.action;
        this.props.closeActionModal(key);
    }


    render() {
        let type = this.props.type;
        let title;
        switch (type) {
            case "attend":
                title = "Регистрация";
                break;
            case "check":
                title = "Проверка";
                break;
            case "add":
                title = "Новое событие";
                break;
            default:
                title = "Вопрос";
        }
        return (
            <div className="action_modal">
                <div className="action_modal_wrapper">
                    <div className="action_modal_title">
                        {title}
                    </div>
                    <form onSubmit={this.handleSubmit} autoComplete="off">
                        <input
                            className="action_input"
                            name="action"
                            placeholder={type === "add" ? "Название события" : "Номер паспорта"}
                            type="text"
                            value={this.state.action}
                            onChange={this.handleInputChange}
                            required/>
                        <div className="action_modal_btn">
                            <button onClick={this.props.closeActionModal}
                                    className="action_modal_cancel_btn"
                            >Отменить
                            </button>
                            <button
                                className="action_apply_btn"
                                type="submit"
                            >Подтвердить
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
}
