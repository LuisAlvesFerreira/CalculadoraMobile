import AsyncStorage from '@react-native-async-storage/async-storage';

const CHAVE = 'historico';

export async function salvar(lista) {
  await AsyncStorage.setItem(CHAVE, JSON.stringify(lista));
}

export async function carregar() {
  const texto = await AsyncStorage.getItem(CHAVE);
  return texto ? JSON.parse(texto) : [];
}

//função async que limpa completamente a lista
export async function limpar() {
  await AsyncStorage.removeItem(CHAVE);
}

//função para excluir apenas 1 linha do histórico
export async function excluirLinha(id){

  //recebe a lista completa
  const listaAtual = await carregar();

  //cria uma nova lista que recebe a lista atual, onde tudo é adicionado exceto aquele que teve o ID passado por parâmetro, que é removido.
  const novaLista = listaAtual.filter((item) => item.id !== id);
  
  //salva e retorna a nova lista após remoção
  await salvar(novaLista);
  return novaLista
}
