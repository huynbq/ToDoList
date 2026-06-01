import { Routes, Route } from "react-router";
import routes from "./pages/routes";
import MainLayout from "./layouts/MainLayout";

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {routes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={<route.component />}
            index={route.index}
          />
        ))}
      </Route>
    </Routes>
  );
}

export default App;
