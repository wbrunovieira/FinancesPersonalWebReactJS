import { Button } from '@/components/ui/button';
import './App.css';
import { AddExpense } from './components/AddExpense';
import { AddIncome } from './components/AddIncome';

function App() {
  return (
    <div className="min-h-screen h-full w-full flex flex-col items-center justify-center bg-foreground text-foreground">
      <header className="w-full py-4 bg-primary text-primary-foreground shadow-lg">
        <h1 className="text-center text-2xl font-bold">
          Finanças Pessoais
        </h1>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center w-full p-6">
        <section className="bg-card shadow-md rounded-lg p-8 w-full max-w-md text-center">
          <Button
            className="w-full bg-primary text-primary-foreground hover:bg-primary-foreground hover:text-primary py-3 rounded-lg transition-colors"
            onClick={() => alert('Adicionar Transação')}
          >
            Visualizar Extrato
          </Button>
          <AddExpense />
          <AddIncome />
        </section>
      </main>

      <footer className="w-full py-4 bg-secondary text-secondary-foreground text-center">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} WB Digital
          Solutions. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
}

export default App;
