import { useCallback, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { carregar, limpar, excluirLinha } from '../storage/historico';

export default function HistoricoScreen({ route }) {
  const [lista, setLista] = useState(route.params?.historico ?? []);
  const versaoLeitura = useRef(0);

  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      const versaoAtual = ++versaoLeitura.current;
      carregar().then((itens) => {
        if (ativo && versaoLeitura.current === versaoAtual) setLista(itens);
      }).catch((erro) => {
        console.error('Não foi possível carregar o histórico:', erro);
      });
      return () => {
        ativo = false;
      };
    }, [])
  );

  //função que chama o limpar e atualiza a lista, além de fazer verificação do funcionamento do botão e previnir erros.
  //Preferi criar  funções próprias ao invés de adicionar diretamente para deixar o código mais limpo.
  async function aoLimparHistorico() {  
    console.log('Botão Deletar histórico pressionado');
    // Invalida uma leitura iniciada antes do toque em deletar.
    ++versaoLeitura.current;
    try {
      await limpar();
      setLista([]);
    } catch (erro) {
      console.error('Não foi possível apagar o histórico:', erro);
    }
  }

  //função que executa a função de exclusão e mostra mensagem de erro.
  async function aoExcluir(id) {
    ++versaoLeitura.current;

    try{

      const novaLista = await excluirLinha(id);
      setLista(novaLista);

    } catch(erro){
      console.error('Não foi possível excluir a conta', erro)
    }
    
  }


  return (
    <View style={styles.container}>
      <FlatList
        style={styles.lista}
        data={lista}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
           <View style = {styles.linhaItem}> 
            <Text style={styles.linha}>
              {item.conta} = {item.resultado}
            </Text>

            {/*Botão de exclusão da conta*/}
            <Pressable
              accessibilityRole='button'
              onPress={() => aoExcluir(item.id)}
              style ={styles.botaoExcluir}

            >
              <Text style={styles.textoBotao}>Excluir</Text>
              
            </Pressable>
          </View>

        )}
        ListEmptyComponent={
          <Text style={styles.linha}>Nenhuma conta ainda</Text>
        }
      />
      
      {/*Eu tive problemas no funcionamento do Button, por isso preferi utilizar Pressable */}
      <View style={styles.botaoDeletarHistorico}>
        <Pressable
          accessibilityRole="button"
          onPress={aoLimparHistorico}
          style={({ pressed }) => [
            styles.botao,
            pressed && styles.botaoPressionado,
          ]}
        >
          <Text style={styles.textoBotao}>Deletar histórico</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  lista: {
    flex: 1,
    backgroundColor: '#4a0303',
  },
  linha: {
    fontSize: 24,
    padding: 12,
    color: 'white',
  },
  botaoDeletarHistorico: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f0f0f0',
  },
  botao: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8b0000',
    borderRadius: 8,
  },
  botaoPressionado: {
    opacity: 0.65,
  },
  textoBotao: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },

  linhaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  }
});
