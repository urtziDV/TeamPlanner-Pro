const { exec } = require("child_process");
const { promisify } = require("util");
const execAsync = promisify(exec);

async function test() {
    const script = `
      Add-Type -AssemblyName System.Windows.Forms;
      $f = New-Object System.Windows.Forms.FolderBrowserDialog;
      $f.Description = "Selecciona la carpeta de destino";
      $f.ShowNewFolderButton = $true;
      $result = $f.ShowDialog();
      if ($result -eq 'OK') { Write-Output $f.SelectedPath }
    `;
    console.log("Running...");
    const { stdout } = await execAsync(`powershell -Command "${script.replace(/\n/g, ' ')}"`);
    console.log("Result:", stdout.trim());
}
test();
