import { useEffect, useState, forwardRef } from 'react';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalTrigger,
} from './ui/animated-modal';

import InputMask, {
  Props as InputMaskProps,
} from 'react-input-mask-next';

const MaskedInput = forwardRef<
  HTMLInputElement,
  InputMaskProps
>((props, ref) => <InputMask {...props} inputRef={ref} />);

export function AddExpense() {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [date, setDate] = useState('');

  const getCurrentDateTime = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(
      2,
      '0'
    );
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(
      2,
      '0'
    );
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  useEffect(() => {
    setDate(getCurrentDateTime());
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          'http://localhost:8080/categories',
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            mode: 'cors',
          }
        );

        if (!response.ok) {
          throw new Error(
            `Erro ao buscar categorias: ${response.statusText}`
          );
        }

        const data = await response.json();
        setCategories(data);
      } catch (error) {
        alert(
          'Erro ao carregar as categorias: ' + error.message
        );
      }
    };

    fetchCategories();
  }, []);

  const handleSubmit = async () => {
    if (!amount || !description || !categoryId || !date) {
      alert('Preencha todos os campos antes de enviar.');
      return;
    }

    const payload = {
      user_id: 1,
      amount: parseFloat(amount),
      description,
      category_id: parseInt(categoryId),
      date: new Date(date).toISOString(),
    };

    try {
      const response = await fetch(
        'http://localhost:8080/transactions',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          mode: 'cors',
        }
      );

      if (!response.ok) {
        const errorMsg = await response.text();
        throw new Error(
          `Erro na resposta do servidor: ${response.status} - ${errorMsg}`
        );
      }

      alert('Despesa adicionada com sucesso!');
      setAmount('');
      setDescription('');
      setCategoryId('');
      setDate(getCurrentDateTime());
    } catch (error) {
      alert('Erro ao adicionar despesa: ' + error.message);
    }
  };

  return (
    <div className="py-4 flex items-center justify-center">
      <Modal>
        <ModalTrigger className="bg-black dark:bg-white dark:text-black text-white flex justify-center group/modal-btn">
          <span className="group-hover/modal-btn:translate-x-40 text-center transition duration-500">
            Adicionar Despesa
          </span>
          <div className="-translate-x-40 group-hover/modal-btn:translate-x-0 flex items-center justify-center absolute inset-0 transition duration-500 text-white z-20">
            💸
          </div>
        </ModalTrigger>
        <ModalBody>
          <ModalContent>
            <h4 className="text-lg md:text-2xl text-neutral-600 dark:text-neutral-100 font-bold text-center mb-8">
              Adicione uma nova despesa
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
                {categories.map(category => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                ))}
              </select>

              <div className="w-full relative">
                <MaskedInput
                  mask="99/99/9999 99:99"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  placeholder="DD/MM/AAAA HH:mm"
                />
              </div>
            </div>

            <ModalFooter>
              <button
                onClick={() =>
                  setDate(getCurrentDateTime())
                }
              >
                Cancelar
              </button>
              <button onClick={handleSubmit}>
                Confirmar
              </button>
            </ModalFooter>
          </ModalContent>
        </ModalBody>
      </Modal>
    </div>
  );
}
