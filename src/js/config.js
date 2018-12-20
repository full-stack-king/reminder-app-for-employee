const { ipcRenderer } = require('electron');
let loader = document.getElementById("loader");
let content = document.getElementById("content");
let save = document.getElementById("save");

ipcRenderer.on('save_config_response', (event, arg) => {
    console.log({ 'save': arg });
    loader.style.display = 'none';
    content.style.display = 'block';
    alert(arg.message)
})

if (save) {
    save.addEventListener('click', (event) => {
        loader.style.display = 'block';
        content.style.display = 'none';
        employee_id = document.getElementById('emp_id').value;
        ipcRenderer.send('save_config', {employee_id});
    });
}