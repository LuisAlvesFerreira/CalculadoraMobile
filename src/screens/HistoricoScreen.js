import { useCallback, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { carregar, limpar } from '../storage/historico';

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

  return (
    <View style={styles.container}>
      <FlatList
        style={styles.lista}
        data={lista}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Text style={styles.linha}>
            {item.conta} = {item.resultado}
          </Text>
        )}
        ListEmptyComponent={
          <Text style={styles.linha}>Nenhuma conta ainda</Text>
        }
      />

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
});
