import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import Display from '../components/Display';
import Teclado from '../components/Teclado';
import {
  calcular,
  ehOperador,
  ultimoNumero,
  alternarSinal,
  porcentagem,
} from '../utils/calcular';
import { carregar, salvar } from '../storage/historico';

export default function HomeScreen({ navigation }) {
  const [expressao, setExpressao] = useState('');
  const [resultado, setResultado] = useState('');
  const [calculado, setCalculado] = useState(false); // acabou de apertar =
  const [memoria, setMemoria] = useState(0);
  const [historico, setHistorico] = useState([]);

  // Atualiza a cópia local sempre que a Home volta a ficar visível.
  //(Alteração) useEffect foi alterado para apagar dados do histórico que foram salvos em memória
  useEffect(() => {
    let ativo = true;

    async function atualizarHistorico() {
      try {
        const itens = await carregar();
        if (ativo) setHistorico(itens);
      } catch (erro) {
        console.error('Não foi possível carregar o histórico:', erro);
      }
    }
    //A variável abaixo é responsável por atualizar o histórico toda vez que o mesmo ganha foco, para apagar completamente registros do histórico.
    const cancelarFoco = navigation.addListener('focus', atualizarHistorico);
    if (navigation.isFocused()) atualizarHistorico();

    return () => {
      ativo = false;
      cancelarFoco();
    };
  }, [navigation]);

  function limpar() {
    setExpressao('');
    setResultado('');
    setCalculado(false);
  } 

  function valorAtual() {
    const v = calcular(expressao);
    return typeof v === 'number' ? v : null;
  }

  async function aoIgual() {
    if (expressao === '') return;
    const valor = String(calcular(expressao));
    setResultado(valor);
    setCalculado(true);
    if (valor === 'Erro') return;

    const item = {
      id: Date.now().toString(),
      conta: expressao,
      resultado: valor,
    };
    // Leia o armazenamento antes de acrescentar para não salvar uma cópia
    // antiga do estado caso a tela tenha acabado de voltar do histórico.
    const historicoAtual = await carregar();
    const novo = [item, ...historicoAtual];
    setHistorico(novo);
    await salvar(novo);
  }

  function aoTocar(tecla) {
    if (tecla === 'AC') return limpar();

    if (tecla === 'OFF') {
      limpar();
      setMemoria(0);
      return;
    }

    if (tecla === 'C') {
      setExpressao(expressao.slice(0, -1));
      setResultado('');
      setCalculado(false);
      return;
    }

    if (tecla === '=') return aoIgual();

    if (tecla === '+/-') {
      setExpressao(alternarSinal(expressao));
      return;
    }

    if (tecla === '%') {
      setExpressao(porcentagem(expressao));
      return;
    }

    if (tecla === 'Raiz') {
      if (expressao === '') return;
      const v = valorAtual();
      if (v === null || v < 0) {
        setResultado('Erro');
        setCalculado(true);
        return;
      }
      setExpressao(String(parseFloat(Math.sqrt(v).toFixed(10))));
      setResultado('');
      setCalculado(false);
      return;
    }

    if (tecla === 'M+' || tecla === 'M-') {
      const v = valorAtual();
      if (v === null) return;
      const novo = tecla === 'M+' ? memoria + v : memoria - v;
      setMemoria(parseFloat(novo.toFixed(10)));
      return;
    }

    if (tecla === 'MRC') {
      const base = calculado ? '' : expressao;
      setExpressao(base.slice(0, ultimoNumero(base).inicio) + String(memoria));
      setResultado('');
      setCalculado(false);
      return;
    }

    if (ehOperador(tecla)) {
      // depois do =, continua a conta a partir do resultado
      let base = calculado ? (resultado === 'Erro' ? '' : resultado) : expressao;
      if (base === '' && tecla !== '-') return;
      if (base.length > 1 && ehOperador(base.slice(-1))) {
        base = base.slice(0, -1); // troca o operador anterior
      }
      setExpressao(base + tecla);
      setResultado('');
      setCalculado(false);
      return;
    }

    // dígito ou ponto
    const base = calculado ? '' : expressao;
    const atual = ultimoNumero(base).texto;
    if (tecla === '.' && atual.includes('.')) return;
    const novo = tecla === '.' && (atual === '' || atual === '-') ? '0.' : tecla;
    setExpressao(base + novo);
    setResultado('');
    setCalculado(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Calculadora do Fukuta</Text>

      <Display expressao={expressao} resultado={resultado} memoria={memoria} />
      <Teclado onPress={aoTocar} />

      <View style={styles.botaoHistorico}>
        <Button
          title="Ver histórico"
          onPress={() => navigation.navigate('Historico')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4a0303',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  titulo: {
    textAlign: 'center',
    backgroundColor: 'gray',
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    height: 35,
    width: '100%',
  },
  botaoHistorico: {
    marginTop: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
  },
});
