async function updateInfo() {
  const $ = require('jquery');
  const si = require('systeminformation');
  const os = require('os');

  // CPU / RAM sempre disponíveis
  $("#cpu").text(`Uso CPU (fallback): ${os.cpus().map(c => c.times.user).reduce((a,b)=>a+b,0)}`);
  $("#ram").text(`RAM usada: ${(os.totalmem()-os.freemem())/1024/1024/1024} GB / ${(os.totalmem()/1024/1024/1024).toFixed(2)} GB`);

  // Disco
  try {
    const disk = await si.diskLayout();
    $("#disk").html(disk.map(d => `${d.name} - ${(d.size/1024/1024/1024).toFixed(2)} GB`).join("<br>"));
  } catch {
    $("#disk").text("Disco: não disponível sem root");
  }

  // GPU
  try {
    const gpu = await si.graphics();
    $("#gpu").html(gpu.controllers.map(g => `${g.model} - ${g.memoryTotal || '?'} MB`).join("<br>"));
  } catch {
    $("#gpu").text("GPU: não disponível sem root ou driver");
  }
}

setInterval(updateInfo, 2000);
updateInfo();

