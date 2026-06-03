import { Routes, Route } from "react-router";
import routes from "./pages/routes";
import MainLayout from "./layouts/MainLayout";
import { AuthGate } from "./auth/AuthGate";

function App() {
  return (
    <AuthGate>
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
    </AuthGate>
  );
}

export default App;
