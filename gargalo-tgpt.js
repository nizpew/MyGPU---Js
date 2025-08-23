const os = require('os');
const si = require('systeminformation');
const { spawn } = require('child_process');

async function getHardwareInfo() {
    const cpuData = await si.cpu();
    const memData = await si.mem();
    const gpuData = await si.graphics();
    const osData = await si.osInfo();

    return {
        cpu: cpuData.brand,
        cores: cpuData.cores,
        ram: `${(memData.total / 1024 / 1024 / 1024).toFixed(2)} GB`,
        gpu: gpuData.controllers.length > 0 ? gpuData.controllers[0].model : 'Não detectada',
        os: `${osData.distro} ${osData.arch}`
    };
}

// Função para verificar se tgpt está no PATH
function isTGPTInstalled() {
    return new Promise((resolve) => {
        const cmd = process.platform === 'win32' ? 'where' : 'which';
        const tgptCheck = spawn(cmd, ['tgpt']);

        tgptCheck.on('close', code => {
            resolve(code === 0);
        });
    });
}

function installTGPT() {
    return new Promise((resolve, reject) => {
        console.log('TGPT não encontrado, fazendo download...');
        const isWin = process.platform === 'win32';

        const download = isWin
            ? spawn('powershell.exe', [
                '-Command',
                `irm https://raw.githubusercontent.com/aandrew-me/tgpt/refs/heads/main/install-win.ps1 | iex`
            ], { stdio: 'inherit' })
            : spawn('bash', [
                '-c',
                `curl -sSL https://raw.githubusercontent.com/aandrew-me/tgpt/main/install | bash -s /usr/local/bin`
            ], { stdio: 'inherit' });

        download.on('close', code => code === 0 ? resolve() : reject('Falha ao baixar TGPT'));
    });
}

async function ensureTGPT() {
    const installed = await isTGPTInstalled();
    if (!installed) await installTGPT();
    return 'tgpt';
}

async function callTGPT(prompt) {
    const tgptCmd = await ensureTGPT();

    console.log('\n=== Resposta do TGPT ===\n');
    const tgpt = spawn(tgptCmd, ['-q', '-w', prompt], { stdio: 'inherit' });

    tgpt.on('close', code => {
        console.log(`\nProcesso TGPT finalizado com código ${code}`);
    });
}

async function main() {
    const hardware = await getHardwareInfo();
    console.log('Informações do hardware:\n', hardware);

    const prompt = `Estas são as informações do meu computador: ${JSON.stringify(hardware)}. 
Forneça recomendações práticas de melhoria de hardware, otimizações de software e ajustes de desempenho em formato de lista numerada. Escreva no maximo 400 caracteres. na primeira linha fale o gargalo principal. e quantos por cento ele limita apenas do potencial máximo. depois adicione mais 200 linhas falando recomendacoes de melhoras de oque comprar. e de links de compras dessas coisas. coloca tambem o preço e preço/resultado pra calcular custo beneficio. nao esqueca dos links no final`;

    await callTGPT(prompt);
}

main();

