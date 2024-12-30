import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Transaction {
  id: number;
  user_id: number;
  amount: number;
  description: string;
  category_id: number;
  category: string;
  type: string;
  date: string;
  created_at: string;
  updated_at: string;
}

const Statement = () => {
  const [transactions, setTransactions] = useState<
    Transaction[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchTransactions = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/transactions`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao buscar as transações');
      }

      const data = await response.json();
      setTransactions(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <div className="min-h-screen bg-foreground text-foreground flex flex-col items-center">
      <header className="w-full py-4 bg-primary text-primary-foreground shadow-lg flex justify-between items-center px-4">
        <h1 className="text-2xl font-bold">
          Extrato de Bruno
        </h1>
        <button
          className="bg-secondary text-secondary-foreground py-2 px-4 rounded-lg hover:bg-secondary-foreground hover:text-secondary transition-colors"
          onClick={() => navigate('/')}
        >
          Voltar para Home
        </button>
      </header>
      <main className="w-full max-w-4xl p-6 flex flex-col items-center">
        {loading && <p>Carregando transações...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading &&
          !error &&
          transactions.length === 0 && (
            <p>Nenhuma transação encontrada.</p>
          )}
        {!loading && !error && transactions.length > 0 && (
          <table className="w-full bg-card shadow-md rounded-lg p-4">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 px-4">ID</th>
                <th className="py-2 px-4">Descrição</th>
                <th className="py-2 px-4">Categoria</th>
                <th className="py-2 px-4">Tipo</th>
                <th className="py-2 px-4">Valor</th>
                <th className="py-2 px-4">Data</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(transaction => (
                <tr
                  key={transaction.id}
                  className="border-b hover:bg-gray-100 transition"
                >
                  <td className="py-2 px-4">
                    {transaction.id}
                  </td>
                  <td className="py-2 px-4">
                    {transaction.description}
                  </td>
                  <td className="py-2 px-4">
                    {transaction.category}
                  </td>
                  <td
                    className={`py-2 px-4 ${
                      transaction.type === 'income'
                        ? 'text-green-500'
                        : transaction.type === 'expense'
                        ? 'text-red-500'
                        : 'text-blue-500'
                    }`}
                  >
                    {transaction.type === 'income'
                      ? 'Renda'
                      : transaction.type === 'expense'
                      ? 'Despesa'
                      : 'Investimento'}
                  </td>
                  <td className="py-2 px-4">
                    {transaction.amount.toLocaleString(
                      'pt-BR',
                      {
                        style: 'currency',
                        currency: 'BRL',
                      }
                    )}
                  </td>
                  <td className="py-2 px-4">
                    {new Date(
                      transaction.date
                    ).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
      <footer className="w-full py-4 bg-secondary text-secondary-foreground text-center">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} WB Digital
          Solutions. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
};

export default Statement;
