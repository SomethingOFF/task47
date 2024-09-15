import { PrimeReactProvider } from "primereact/api";
import Table from "./components/table";
function App() {
  return (
    <PrimeReactProvider>
      <Table />
    </PrimeReactProvider>
  );
}

export default App;
