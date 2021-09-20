App = {
  contracts: {},
  init: async () => {
    await App.loadEthereum();
    await App.loadAccount();
    await App.loadContracts();
    App.render();
    await App.renderTasks();
  },

  loadEthereum: async () => {
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      await window.ethereum.request({ method: "eth_requestAccounts" });
      //   console.log("Ethereum existe");
    } else if (window.web3) {
      web3 = new Web3(window.web3.currentProvider);
    } else {
      console.log("No Etherium Browaer is installed. Try installed Metamask");
    }
  },

  loadAccount: async () => {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    console.log("acount ", accounts[0]);
    App.account = accounts[0];
  },

  loadContracts: async () => {
    const res = await fetch("TasksContract.json");
    const tasksContractJSON = await res.json();
    // console.log(tasksContractsJSON);

    App.contracts.tasksContract = TruffleContract(tasksContractJSON);

    App.contracts.tasksContract.setProvider(App.web3Provider);

    App.tasksContract = await App.contracts.tasksContract.deployed();
  },

  render: () => {
    console.log(App.account);
    document.getElementById("account").innerText = App.account;
  },

  renderTasks: async () => {
    const taskCounter = await App.tasksContract.taskCounter();
    const taskCounterNumber = taskCounter.toNumber();
    // console.log(taskCounterNumber);

    let html = "";

    for (let i = 1; i <= taskCounterNumber; i++) {
      const task = await App.tasksContract.tasks(i);
      const taskId = task[0];
      const taskTitle = task[1];
      const taskDescription = task[2];
      const taskDone = task[3];
      const taskCreated = task[4];

      let taskElement = `<div class="card bg-dark rounded-0 mb-2">
      <div class="card-header d-flex justify-content-between align-items-center">
        <span>${taskTitle}</span>
        <div class="form-check form-switch">
          <input class="form-check-input" data-id="${taskId}" type="checkbox" onchange="App.toggleDone(this)" ${
        taskDone === true && "checked"
      }>
        </div>
      </div>
      <div class="card-body">
        <span>${taskDescription}</span>
        <span>${taskDone}</span>
        <p class="text-muted">Task was created ${new Date(
          taskCreated * 1000
        ).toLocaleString()}</p>
        </label>
      </div>
    </div>`;
      html += taskElement;
    }

    document.querySelector("#tasksList").innerHTML = html;
  },

  createTask: async (title, description) => {
    try {
      const result = await App.tasksContract.createTask(title, description, {
        from: App.account,
      });
      console.log(result.logs[0].args);
      window.location.reload();
    } catch (error) {
      console.log(error);
    }
  },
  toggleDone: async (element) => {
    const taskId = element.dataset.id;
    await App.tasksContract.toggleDone(taskId, {
      from: App.account,
    });
    window.location.reload();
  },
};
