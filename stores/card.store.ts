import { Maybe } from "true-myth";
import { createCard, findAllByUser, deleteCard, updateCard } from "~~/api";
import { CardDTO } from "~~/api/dtos/card.dto";
import { ViewState } from "~~/utils/view-state";

export const useCardStore = defineStore("user", () => {
  const cards: CardDTO[] = reactive([]);
  const isFetching = ref(false);

  const create = async (card: CardDTO, screen: ViewState) => {
    const newCard = await screen.updateWith<CardDTO>(() => createCard(card));
    if (newCard.isJust) {
      cards.push(newCard.value);
      useRouter().replace("/app/cards");
    }
  };
  const fetchAll = async (screen: ViewState) => {
    isFetching.value = true;
    const result = await screen.updateWith<CardDTO[]>(() => findAllByUser());
    isFetching.value = false;
    if (result.isJust) {
      cards.splice(0, cards.length, ...result.value);
    }
  };
  const deleteById = async (id: string, screen: ViewState) => {
    const result = await screen.updateWith(() => deleteCard(id), false);
    if (result.isJust) {
      const newArray = cards.filter((entry) => entry.id !== id);
      cards.splice(0, cards.length, ...newArray);
    }
  };

  const getById = (id: string): Maybe<CardDTO> => {
    console.log(cards[0]);
    //return Maybe.of(cards.find((dto) => dto.id === id));
    return Maybe.of(cards[0]);
  };

  const updateById = async (card: CardDTO, screen: ViewState) => {
    const result = await screen.updateWith<CardDTO>(() => updateCard(card));
    if (result.isJust) {
      const i = cards.indexOf(card);
      if (i >= 0) {
        cards.splice(i, 1, result.value);
        useRouter().replace("/app/cards");
      }
    }
  };
  const waitUntilFetch = async () => {
    return new Promise<void>((resolve) => {
      const loop = setInterval(() => {
        if (!isFetching.value) {
          clearInterval(loop);
          resolve();
        }
      }, 150);
    });
  };
  return {
    cards: cards,
    fetchAll,
    create,
    deleteById,
    getById,
    updateById,
    waitUntilFetch,
  };
});
