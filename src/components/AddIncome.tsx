import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalTrigger,
} from './ui/animated-modal';

import { useState } from 'react';

export function AddIncome() {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');

  const handleSubmit = async () => {
    if (!amount || !description || !category || !date) {
      alert('Preencha todos os campos antes de enviar.');
      return;
    }

    const payload = {
      user_id: 7,
      amount: parseFloat(amount),
      description,
      category,
      date: new Date(date).toISOString(),
    };

    try {
      const response = await fetch(
        'http://localhost:8080/incomes',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Erro na resposta do servidor: ${response.statusText}`
        );
      }

      alert('Rendimento adicionado com sucesso!');
      setAmount('');
      setDescription('');
      setCategory('');
      setDate('');
    } catch (error) {
      alert(
        'Erro ao adicionar rendimento: ' + error.message
      );
    }
  };

  return (
    <div className="py-4 flex items-center justify-center">
      <Modal>
        <ModalTrigger className="bg-black dark:bg-white dark:text-black text-white flex justify-center group/modal-btn">
          <span className="group-hover/modal-btn:translate-x-40 text-center transition duration-500">
            Adicionar Rendimento
          </span>
          <div className="-translate-x-40 group-hover/modal-btn:translate-x-0 flex items-center justify-center absolute inset-0 transition duration-500 text-white z-20">
            💰
          </div>
        </ModalTrigger>
        <ModalBody>
          <ModalContent>
            <h4 className="text-lg md:text-2xl text-neutral-600 dark:text-neutral-100 font-bold text-center mb-8">
              Adicione um novo rendimento
            </h4>
            <div className="py-10 flex flex-col gap-6 items-start justify-start max-w-sm mx-auto">
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
              <input
                type="text"
                placeholder="Categoria"
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
              <input
                type="datetime-local"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <ModalFooter className="gap-1">
              <button
                className="px-2 py-1 bg-gray-200 text-black dark:bg-black dark:border-black dark:text-white border border-gray-300 rounded-md text-sm w-28"
                onClick={() => {
                  setAmount('');
                  setDescription('');
                  setCategory('');
                  setDate('');
                }}
              >
                Cancelar
              </button>
              <button
                className="bg-black text-white dark:bg-white dark:text-black text-sm px-2 py-1 rounded-md border border-black w-28"
                onClick={handleSubmit}
              >
                Confirmar
              </button>
            </ModalFooter>
          </ModalContent>
        </ModalBody>
      </Modal>
    </div>
  );
}
