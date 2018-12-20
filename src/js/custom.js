const {ipcRenderer} = require('electron');
let loader = document.getElementById("loader");
let content = document.getElementById("content");
let refresh = document.getElementById("refresh");
let skip = document.getElementById("skip");
let response = document.getElementById("response");

ipcRenderer.on('ready', (event, arg) => {
    console.log({'ready':arg});
    if (arg.success) {
        loader.style.display = 'none';
        content.style.display = 'block';
        if(arg.entry) {
            response.innerHTML = arg.entry;
        }
        if (!arg.emp) {
            return false;
        }
        emp = JSON.parse(arg.emp);
        if (emp.skip_limit>0) {
            skip.style.visibility = 'visible';
        }
    }
})

ipcRenderer.on('skip_response', (event, arg) => {
    console.log({ 'skip': arg });
    loader.style.display = 'none';
    content.style.display = 'block';
    if (arg.success) {
        if (arg.skip_limit < 1) {
            skip.style.visibility = 'none';
            return false;
        }
        // alert(arg.message)
    }
})

if (skip) {
    skip.addEventListener('click', (event) => {
        loader.style.display = 'block';
        content.style.display = 'none';
        ipcRenderer.send('skip', null);
    });
}