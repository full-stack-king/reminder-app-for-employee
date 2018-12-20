'use strict';

// Modules to control application life and create native browser window
const electron = require('electron');
const { app, ipcMain, BrowserWindow } = electron;
const axios = require('axios');
const employeeModel = require('./src/models/employee');
const database = require('./src/database');
const Store = require('electron-store');
const localDB = new Store({
    defaults: {
        employee: null
    },
    encryptionKey: "p4Fv!m[^h(IdV%;"
});
let mongoose = require('mongoose');

let localEmp = null;
const base_url = 'http://13.232.210.44:8000/api/check_time_entry/'

function startApp () {
    console.log('retrieving employee info from : ' + localDB.path)
    const emp_local = localDB.get('employee');
    console.log(emp_local);
    // console.log('deleting emp');
    // localDB.delete('employee');
    if (!emp_local) {
        console.log('show config window')
        createConfigWindow();
        return false;
    }
    createWindow();
    mongoose.connection.on('connected', function () {
        getLocalData(emp_local);
    });
}

// keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;
// defines percentage of app screen size
let progress=20;

function createWindow() {
    // get primary display
    let display = electron.screen.getPrimaryDisplay();
    // const { width, height } = display.workAreaSize;
    // get actual boundaries of the primary screen
    const { width, height } = display.bounds;
    const appWidth = Math.floor(width/100*progress);
    const appHeight = Math.floor(height/100*progress);
    // create new browser window
    const options = {
        devTools: false,
        width: appWidth,
        height: appHeight,
        frame: false,
        x: width - appWidth,
        y: height - appHeight,
        resizable: false,
        movable: false,
        minimizable: false,
        maximizable: false,
        closable: false,
        alwaysOnTop: true,
        skipTaskbar: true,
    }
    win = new BrowserWindow(options);
    // Hide default app menu
    win.setMenu(null);

    // load the index.html of the app
    win.loadFile('index.html');

    // open dev tools
    // win.webContents.openDevTools();

    // emitted when the window is closed
    win.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null;
    });

    win.onbeforeunload = (e) => {
        return true;
        console.log('I do not want to be closed')
        return false;

        // Unlike usual browsers that a message box will be prompted to users, returning
        // a non-void value will silently cancel the close.
        // It is recommended to use the dialog API to let the user confirm closing the
        // application.
        e.returnValue = false // equivalent to `return false` but not recommended
    }
}

function createConfigWindow() {
    const options = {
        // devTools: false,
        x: 0,
        y: 0,
        width: 400,
        height: 400,
        resizable: false,
        /* minimizable: false,
        maximizable: false,
        closable: false, */
        // alwaysOnTop: true,
        // skipTaskbar: true,
    }
    win = new BrowserWindow(options);
    // Hide default app menu
    // win.setMenu(null);

    // load the index.html of the app
    win.loadFile('config.html');

    // open dev tools
    // win.webContents.openDevTools();

    // emitted when the window is closed
    win.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null;
    });

    win.onbeforeunload = (e) => {
        return true;
        console.log('I do not want to be closed')
        return false;

        // Unlike usual browsers that a message box will be prompted to users, returning
        // a non-void value will silently cancel the close.
        // It is recommended to use the dialog API to let the user confirm closing the
        // application.
        e.returnValue = false // equivalent to `return false` but not recommended
    }
}

function getLocalData(emp_local) {
    if (emp_local) {
        localEmp = emp_local;
        getEmployee(emp_local.employee_id)
            .then(emp => {
                console.log('found employee: ' + emp)
                localDB.set('employee', emp)
                process(emp);
                // adminWin.webContents.send('emp_list', { success: true, emp: JSON.stringify(empList) });
            }).catch(err => {
                console.log(err)
                console.log('error finding employee')
                process(emp_local);
                // ipcMain.send('emp_list', { success: false, message: 'Error fetching employees list' });
            })
    }
    // localDB.set('employee', { "employee_id": 100604, "elapsed_date_limit": 4, "fullname": "Raja K", "skip_limit": 5 })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', startApp);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    console.log('closed all windows');
    if (process.platform !== 'darwin') {
        // console.log('calling app relaunch');
        // app.relaunch();
        console.log('calling app quit');
        app.quit();
    }
});

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win===null) {
        createWindow();
    }
});

app.on('will-quit', (event) => {
    database.disconnect();
    console.log('app about to quit');
    // event.preventDefault();
});

app.on('quit', (event, exitCode) => {
    console.log('app is quit: ',exitCode);
    // event.preventDefault();
});

app.on('gpu-process-crashed', (event) => {
    console.log('app crashed');
    console.log('relaunch after crash');
    app.relaunch();
    console.log('calling app quit2');
    app.quit();
});

function process(emp) {
    console.log('processing');
    // return true;
    axios.get(base_url + `${localEmp.employee_id}/${emp.elapsed_date_limit}`)
        .then(response => {
            if(!response || !response.data || !response.data.result
                || response.data.result == 'time_entry_proper'
                ) {
                app.exit(0);
            }
            console.log(response.data.result)
            win.webContents.send('ready', { success: true, emp: JSON.stringify(emp), entry: response.data.result });
        })
        .catch(error => {
            app.exit(0);
        });
}
function getEmployee(emp_id) {
    console.log('fetching employee: ' + emp_id)
    return employeeModel.findOne({ employee_id: parseInt(emp_id) })
}

async function skipToday(event) {
    if (!localEmp || localEmp.skip_limit < 1) {
        event.sender.send('skip_response', {success: false, message: 'Sorry you cannot skip anymore!'});
        return false;
    }
    let emp = await employeeModel.findOneAndUpdate({
        employee_id: localEmp.employee_id
    },
    localEmp);

    localEmp.skip_limit-=1;

    localDB.set('employee', localEmp)

    event.sender.send('skip_response', { success: true, skip_limit: localEmp.skip_limit, message: `Skipped successfully, you can skip ${localEmp.skip_limit} more times` });
    app.exit(0);
}

ipcMain.on('skip', (event, arg) => {
    console.log('skipping today');
    console.log({ arg });
    skipToday(event);
    // event.sender.send('emp_added', 'received: ' + arg);
})

ipcMain.on('save_config', (event, arg) => {
    if (!arg || !arg.employee_id) {
        console.log('invalid input');
        event.sender.send('save_config_response', { success: false, message: 'Please verify input!' });
        return false;
    }
    console.log('saving config');
    localDB.set('employee', {employee_id: arg.employee_id})
    event.sender.send('save_config_response', { success: true, message: 'Config saved successfully!' });
    console.log('relaunch after config save');
    app.relaunch();
    console.log('calling app exit');
    app.exit(0);
})
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
