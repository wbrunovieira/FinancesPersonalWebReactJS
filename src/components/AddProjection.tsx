import { useState, useEffect } from 'react';

interface Category {
  id: number;
  name: string;
  type: string; // Adicionando o tipo à categoria
}

export function AddProjection(): JSX.Element {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [endMonth, setEndMonth] = useState('');
  const [categories, setCategories] = useState<Category[]>(
    []
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/categories`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          }
        );
        console.log('response', response);
        if (!response.ok) {
          throw new Error('Erro ao buscar categorias');
        }
        const data: Category[] = await response.json();
        console.log('data', data);
        setCategories(data);
      } catch (error) {
        console.error(
          'Erro ao carregar categorias:',
          error
        );
      }
    };

    fetchCategories();
  }, []);

  const handleSubmit = async () => {
    if (!amount || !description || !type || !categoryId) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }

    const payload = {
      user_id: 1, // Ajuste conforme necessário
      amount: parseFloat(amount),
      description,
      type,
      category_id: parseInt(categoryId, 10),
      is_recurring: isRecurring,
      end_month: isRecurring ? endMonth : null,
      date: new Date().toISOString(),
    };

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/projections`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      console.log('post do projection', response);

      if (!response.ok) {
        const errorMsg = await response.text();
        throw new Error(
          `Erro na resposta do servidor: ${response.status} - ${errorMsg}`
        );
      }

      alert('Projeção adicionada com sucesso!');
      resetForm();
    } catch (error) {
      console.error('Erro ao adicionar projeção:', error);
    }
  };

  const resetForm = () => {
    setAmount('');
    setDescription('');
    setType('');
    setCategoryId('');
    setIsRecurring(false);
    setEndMonth('');
    setIsModalOpen(false);
  };

  const filteredCategories = categories.filter(
    category => category.type === type
  );

  return (
    <div className="py-4 flex items-center justify-center">
      <button
        className="bg-black text-white p-2 rounded-md hover:bg-gray-800 transition duration-300"
        onClick={() => setIsModalOpen(true)}
      >
        Adicionar Projeção
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
            <h4 className="text-lg font-bold mb-4">
              Adicione uma nova projeção
            </h4>
            <div className="flex flex-col gap-4">
              <input
                type="number"
                placeholder="Valor"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
              <input
                type="text"
                placeholder="Descrição"
                value={description}
                onChange={e =>
                  setDescription(e.target.value)
                }
                className="w-full p-2 border border-gray-300 rounded-md"
              />
              <select
                value={type}
                onChange={e => setType(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Selecione o tipo</option>
                <option value="income">Renda</option>
                <option value="expense">Despesa</option>
                <option value="investment">
                  Investimento
                </option>
              </select>
              <select
                value={categoryId}
                onChange={e =>
                  setCategoryId(e.target.value)
                }
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">
                  Selecione uma categoria
                </option>
                {filteredCategories.map(category => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={e =>
                    setIsRecurring(e.target.checked)
                  }
                  className="w-5 h-5"
                />
                <label>Projeção recorrente?</label>
              </div>
              {isRecurring && (
                <input
                  type="month"
                  value={endMonth}
                  onChange={e =>
                    setEndMonth(e.target.value)
                  }
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              )}
            </div>
            <div className="flex justify-end gap-4 mt-4">
              <button
                className="bg-gray-300 text-black p-2 rounded-md hover:bg-gray-400 transition duration-300"
                onClick={resetForm}
              >
                Cancelar
              </button>
              <button
                className="bg-neutral-800 text-neutral-100 p-2 rounded-md hover:bg-neutral-700 transition duration-300"
                onClick={handleSubmit}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
