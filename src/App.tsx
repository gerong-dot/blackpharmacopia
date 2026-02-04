import { Route, Routes } from 'react-router';
import Enter from './pages/Enter/Enter';
function App() {
  return (
    <Routes>
      <Route index element={<Enter />} />
    </Routes>
  );
}

export default App;
