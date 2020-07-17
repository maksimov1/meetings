import React from 'react';
import './Header.css';

export const Header = () => {
    const word1 = "Тестовое";
    const word2 = "Задание";
    return (
        <header className="header">
            <div className="header_container">
                <div className="header_title_container">
                    <div id="word1">{word1}</div>
                    <div id="word2">{word2}</div>
                </div>
            </div>
        </header>
    );
}
