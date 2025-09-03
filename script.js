function calcularRaiz() {
    const funcaoStr = document.getElementById('funcao').value;
    const casasDecimais = parseInt(document.getElementById('precisao').value, 10);

    let a = -1000;
    let b = 1000;

    const precisao = Math.pow(10, -casasDecimais);

    const resultadoDiv = document.getElementById('resultado');
    resultadoDiv.innerHTML = "";

    let f;
    try {
        const node = math.parse(funcaoStr);
        f = x => node.evaluate({ x: x });
    } catch (error) {
        resultadoDiv.innerHTML = `Erro na função: ${error.message}`;
        return;
    }

    if (f(a) * f(b) >= 0) {
        resultadoDiv.innerHTML = "Não é possível garantir uma raiz no intervalo [" + a + ", " + b + "] com f(a) * f(b) >= 0.";
        return;
    }

    let iteracoes = 1;
    const maxIteracoes = 1000; 
    let pontoMedio;

    while ((b - a) >= precisao && iteracoes < maxIteracoes) {
        pontoMedio = (a + b) / 2;

        if (f(pontoMedio) === 0.0) {
            break;
        }

        if (f(a) * f(pontoMedio) < 0) {
            b = pontoMedio;
        } else {
            a = pontoMedio;
        }
        iteracoes++;
    }

    resultadoDiv.innerHTML = `O ponto de intersecção (raiz) é aproximadamente: <strong>${pontoMedio.toFixed(casasDecimais + 1)}</strong><br>
        (Encontrado em ${iteracoes} iterações com precisão de ${precisao})`;
}

function eliminacaoDeGauss(inputMatriz) {
  const matriz = inputMatriz.map(row => [...row]);
  const numLinhas = matriz.length;
  const numCols = matriz[0].length;

  let lead = 0;
  for (let r = 0; r < numLinhas; r++) {
    if (lead >= numCols) {
      break;
    }

    let i = r;
    while (matriz[i][lead] === 0) {
      i++;
      if (i === numLinhas) {
        i = r;
        lead++;
        if (numCols === lead) {
          return matriz;
        }
      }
    }
    [matriz[i], matriz[r]] = [matriz[r], matriz[i]];
    let val = matriz[r][lead];
    for (let j = 0; j < numCols; j++) {
      matriz[r][j] /= val;
    }

    for (let i = 0; i < numLinhas; i++) {
      if (i !== r) {
        let val = matriz[i][lead];
        for (let j = 0; j < numCols; j++) {
          matriz[i][j] -= val * matriz[r][j];
        }
      }
    }
    lead++;
  }
  return matriz;
}

function backSubstitution(matriz) {
  const numLinhas = matriz.length;
  const solucao = new Array(numLinhas).fill(0);

  for (let i = numLinhas - 1; i >= 0; i--) {
    solucao[i] = matriz[i][numLinhas];
    for (let j = i + 1; j < numLinhas; j++) {
      solucao[i] -= matriz[i][j] * solucao[j];
    }
  }
  return solucao;
}

//cria a interface para entrada de info da matriz
function gerarMatrizInputs() {
    const size = parseInt(document.getElementById('matrixSize').value, 10);
    const container = document.getElementById('matrizInput');
    const resolverBtn = document.getElementById('resolverBtn');
    const resultadoDiv = document.getElementById('resultadoGauss');

    container.innerHTML = '';
    resultadoDiv.innerHTML = '';

    if (size < 2 || size > 10) {
        resultadoDiv.innerHTML = "Por favor, insira um número de equações entre 2 e 10.";
        resolverBtn.style.display = 'none';
        return;
    }

    let table = '<table>';
    for (let i = 0; i < size; i++) {
        table += '<tr>';
        for (let j = 0; j <= size; j++) {
            let placeholder = j < size ? `x${j + 1}` : `b${i + 1}`;
            table += `<td><input type="number" id="m${i}${j}" placeholder="${placeholder}"></td>`;
        }
        table += '</tr>';
    }
    table += '</table>';
    container.innerHTML = table;
    resolverBtn.style.display = 'block';
}

//lê a matriz da interface, resolve o sistema e exibe o resultado. 
function resolverSistema() {
    const size = parseInt(document.getElementById('matrixSize').value, 10);
    const matriz = [];
    const resultadoDiv = document.getElementById('resultadoGauss');

    for (let i = 0; i < size; i++) {
        const linha = [];
        for (let j = 0; j <= size; j++) {
            const input = document.getElementById(`m${i}${j}`);
            if (!input.value) {
                resultadoDiv.innerHTML = "Erro: Por favor, preencha todos os campos da matriz.";
                return;
            }
            linha.push(parseFloat(input.value));
        }
        matriz.push(linha);
    }
    
    try {
        const matrizEscalonada = eliminacaoDeGauss(matriz);
        const solucao = backSubstitution(matrizEscalonada);
        
        let htmlResultado = 'Solução encontrada: <br>';
        solucao.forEach((val, index) => {
            if(isNaN(val)){
               htmlResultado = "Não foi possível encontrar uma solução única para o sistema."
               return;
            }
            htmlResultado += `<strong>x${index + 1} = ${val.toFixed(4)}</strong><br>`;
        });
        resultadoDiv.innerHTML = htmlResultado;

    } catch (error) {
        resultadoDiv.innerHTML = `Ocorreu um erro durante o cálculo: ${error.message}`;
    }
}