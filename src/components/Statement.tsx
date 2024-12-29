const Statement = () => {
  const transactions = [
    {
      id: 1,
      type: 'Despesa',
      description: 'Aluguel',
      amount: -1500,
    },
    {
      id: 2,
      type: 'Renda',
      description: 'Salário',
      amount: 5000,
    },
    {
      id: 3,
      type: 'Investimento',
      description: 'Ações',
      amount: 1000,
    },
  ];

  return (
    <div className="min-h-screen bg-foreground text-foreground flex flex-col items-center">
      <header className="w-full py-4 bg-primary text-primary-foreground shadow-lg">
        <h1 className="text-center text-2xl font-bold">
          Extrato de Bruno
        </h1>
      </header>
      <main className="w-full max-w-2xl p-6 flex flex-col items-center">
        <ul className="w-full bg-card shadow-md rounded-lg p-4">
          {transactions.map(transaction => (
            <li
              key={transaction.id}
              className={`flex justify-between py-2 border-b ${
                transaction.amount > 0
                  ? 'text-green-500'
                  : 'text-red-500'
              }`}
            >
              <span>{transaction.description}</span>
              <span>
                {transaction.amount.toLocaleString(
                  'pt-BR',
                  { style: 'currency', currency: 'BRL' }
                )}
              </span>
            </li>
          ))}
        </ul>
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
