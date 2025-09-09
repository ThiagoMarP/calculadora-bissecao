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

function decomposicaoLUComPivoteamento(A) {
    const n = A.length;
    let L = Array(n).fill(0).map(() => Array(n).fill(0));
    let U = JSON.parse(JSON.stringify(A)); 
    let P = Array(n).fill(0).map((_, i) => {
        let row = Array(n).fill(0);
        row[i] = 1;
        return row;
    });
    let p = Array(n).fill(0).map((_, i) => i); 

    for (let k = 0; k < n; k++) {
        let maxVal = 0;
        let maxIdx = k;
        for (let i = k; i < n; i++) {
            if (Math.abs(U[i][k]) > maxVal) {
                maxVal = Math.abs(U[i][k]);
                maxIdx = i;
            }
        }

        if (maxVal === 0) {
            throw new Error("Matriz singular. O sistema pode não ter solução única.");
        }

        [U[k], U[maxIdx]] = [U[maxIdx], U[k]];
        [p[k], p[maxIdx]] = [p[maxIdx], p[k]];
        [P[k], P[maxIdx]] = [P[maxIdx], P[k]];

        for (let i = 0; i < k; i++) {
            [L[k][i], L[maxIdx][i]] = [L[maxIdx][i], L[k][i]];
        }

        for (let i = k + 1; i < n; i++) {
            const fator = U[i][k] / U[k][k];
            L[i][k] = fator;
            for (let j = k; j < n; j++) {
                U[i][j] -= fator * U[k][j];
            }
        }
    }
    for (let i = 0; i < n; i++) {
        L[i][i] = 1;
    }

    return { L, U, P, p };
}

function forwardSubstitution(L, b) {
    const n = L.length;
    const y = new Array(n).fill(0);

    for (let i = 0; i < n; i++) {
        let sum = 0;
        for (let j = 0; j < i; j++) {
            sum += L[i][j] * y[j];
        }
        y[i] = b[i] - sum;
    }
    return y;
}

function backSubstitution(U, y) {
    const n = U.length;
    const x = new Array(n).fill(0);

    for (let i = n - 1; i >= 0; i--) {
        let sum = 0;
        for (let j = i + 1; j < n; j++) {
            sum += U[i][j] * x[j];
        }
        if (U[i][i] === 0) {
            throw new Error("Divisão por zero encontrada. A matriz é singular.");
        }
        x[i] = (y[i] - sum) / U[i][i];
    }
    return x;
}


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
            // Adiciona uma barra vertical para separar a matriz A do vetor b
            const style = (j === size) ? 'border-left: 2px solid #ccc;' : '';
            const placeholder = j < size ? `x${j + 1}` : `b${i + 1}`;
            table += `<td style="${style}"><input type="number" id="m${i}${j}" placeholder="${placeholder}"></td>`;
        }
        table += '</tr>';
    }
    table += '</table>';
    container.innerHTML = table;
    resolverBtn.style.display = 'block';
}

function formatarMatrizParaHTML(titulo, matriz) {
    let html = `<div class="matriz-resultado"><strong>${titulo}:</strong><table>`;
    for (const linha of matriz) {
        html += '<tr>';
        for (const val of linha) {
            html += `<td>${val.toFixed(4)}</td>`;
        }
        html += '</tr>';
    }
    html += '</table></div>';
    return html;
}

//lê a matriz da interface, resolve o sistema e exibe o resultado. 
function resolverSistema() {
    const size = parseInt(document.getElementById('matrixSize').value, 10);
    const matrizA = [];
    const vetorB = [];
    const resultadoDiv = document.getElementById('resultadoGauss');

    for (let i = 0; i < size; i++) {
        const linhaA = [];
        for (let j = 0; j < size; j++) {
            const input = document.getElementById(`m${i}${j}`);
            if (!input.value) {
                resultadoDiv.innerHTML = "Erro: Por favor, preencha todos os campos da matriz.";
                return;
            }
            linhaA.push(parseFloat(input.value));
        }
        matrizA.push(linhaA);

        const inputB = document.getElementById(`m${i}${size}`);
        if (!inputB.value) {
            resultadoDiv.innerHTML = "Erro: Por favor, preencha todos os campos da matriz.";
            return;
        }
        vetorB.push(parseFloat(inputB.value));
    }

    try {
        const { L, U, P, p } = decomposicaoLUComPivoteamento(matrizA);

        const Pb = new Array(size);
        for (let i = 0; i < size; i++) {
            Pb[i] = vetorB[p[i]];
        }

        const y = forwardSubstitution(L, Pb);

        const solucao = backSubstitution(U, y);

        let htmlResultado = formatarMatrizParaHTML("Matriz de Permutação (P)", P);
        htmlResultado += formatarMatrizParaHTML("Matriz Triangular Inferior (L)", L);
        htmlResultado += formatarMatrizParaHTML("Matriz Triangular Superior (U)", U);

        htmlResultado += '<div><strong>Solução do Sistema (x):</strong><br>';
        solucao.forEach((val, index) => {
            if (isNaN(val)) {
                throw new Error("Solução resultou em NaN. Verifique a matriz de entrada.");
            }
            htmlResultado += `<strong>x${index + 1} = ${val.toFixed(4)}</strong><br>`;
        });
        htmlResultado += '</div>';

        resultadoDiv.innerHTML = htmlResultado;

    } catch (error) {
        resultadoDiv.innerHTML = `Ocorreu um erro durante o cálculo: ${error.message}`;
    }
}
