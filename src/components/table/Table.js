import React, {Component} from 'react';
import "./Table.css";

export class Table extends Component {
    constructor(props) {
        super(props);
        this.renderTableData = this.renderTableData.bind(this);
    }

    renderTableData() {
        return this.props.data.map((event_entry, index) => {
            const { id, name } = event_entry;
            return (
                <tr key={id} className="event_entry">
                    <td>{id}</td>
                    <td>{name}</td>
                    <td className="action_buttons">
                        <div className="check_attend_button"
                             onClick={() => {
                                 this.props.checkAttendance(event_entry)
                                }
                             }>
                            Проверка
                        </div>
                        <div className="attend_button"
                             onClick={() => {
                                 this.props.attend(event_entry)
                                }
                             }>
                            Регистрация
                        </div>
                    </td>
                </tr>
            )
        })
    }

    render() {
        return (
            <div className="events_table_container">
                {
                    this.props.data.length === 0 ? <div>Событий нет</div>
                        :
                        <table className="events_table" cellSpacing="0" cellPadding="0">
                            <tbody>
                            <tr>
                                <th key="1" className="id_column">id</th>
                                <th key="2" className="name_column">Название</th>
                                <th key="3"/>
                            </tr>
                            {this.renderTableData()}
                            </tbody>
                        </table>
                }
            </div>
        )
    }
}
