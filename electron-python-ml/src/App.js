import "./App.css";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import ImportPage from "./pages/ImportPage";
import EditPage from "./pages/EditPage";
import Navbar from "./components/Navbar";
import ChartsPage from "./pages/ChartsPage";
import { absoluteRoutes } from "./routes";
import AiModelsPage from "./pages/AiModelsPage";
// import { useMemo, useState, useEffect } from "react";
// const { fs } = window;
// const { pathModule } = window;
// const { app } = window;
// const {ipcRenderer} = window;

function App() {
  return (
    <BrowserRouter>
        <Routes>
          <Route element={<Navbar/>}>
            <Route index element={<ImportPage />} />
            <Route path={absoluteRoutes.EDIT_BASE + "/:fileId"} element={<EditPage />} />
            <Route path={absoluteRoutes.CHARTS} element={<ChartsPage />} />
            <Route path={absoluteRoutes.AIMODELS} element={<AiModelsPage />} />
          </Route>
        </Routes>
    </BrowserRouter>
  );
}

export default App;
