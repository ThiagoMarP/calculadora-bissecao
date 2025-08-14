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