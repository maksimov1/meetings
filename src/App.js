import React from 'react';
import { Header } from "./components/header/Header";
import { MainView } from "./components/main_view/MainView";
import {BlockchainHandler} from "./blockchain/BlockchainHandler";

function App() {
  return (
      <>
        <Header/>
        <MainView/>
      </>
  );
}

export default App;
