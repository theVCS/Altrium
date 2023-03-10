const grpType = ["bar", "line", "scatter", "doughnut", "polarArea", "radar"];
const sz = grpType.length;
let index = 0;
let flag = true;
let currId = "dragGrp";

function getTableData(row, col) {
  let content = `<table class="table" row=${row} col=${col}>
    <thead>
      <tr>`;

  for (let index = 0; index < col; index++) {
    content += `<th scope="col">col${index + 1}</th>`;
  }

  content += `</tr>
    </thead>
    <tbody>`;

  for (let index = 0; index < row; index++) {
    content += `<tr>`;
    for (let index2 = 0; index2 < col; index2++) {
      content += `<th scope="row">data${index2 + 1}</th>`;
    }
    content += `</tr>`;
  }

  content += `</tbody></table>`;
  return content;
}

function makeid(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

let grid = GridStack.init({
  cellHeight: 70,
  acceptWidgets: true,
  dragIn: ".newWidget",
  dragInOptions: { appendTo: "body", helper: "clone" },
  removable: "#trash",
});

async function getDashBoardData() {
  return await $.post(
    "http://127.0.0.1:8080/getData",
    function (data, status, jqXHR) {
      return data;
    }
  );
}

async function getData(length) {
  return await $.post(
    "http://127.0.0.1:8080",
    { length: length },
    function (data, status, jqXHR) {
      return data;
    }
  );
}

async function addDataToGraph(id, type) {
  let point = await getData(30);
  const x = point.x;
  const y = point.y;

  let chartStatus = Chart.getChart(id);
  if (chartStatus != undefined) {
    chartStatus.destroy();
  }

  const ctx = document.getElementById(id);
  const chart = new Chart(ctx, {
    type: type,
    data: {
      labels: x,
      datasets: [
        {
          label: "# of Votes",
          data: y,
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
      responsive: true,
      maintainAspectRatio: false,
    },
  });
}

async function InitDashBoard() {
  const data = await getDashBoardData();

  for (let index = 0; index < data.gridData.length; index++) {
    if (data.metaData[index].type == "table") {
      const element = data.gridData[index];
      console.log(element);
      data.gridData[index].content = getTableData(
        data.metaData[index].row,
        data.metaData[index].col
      );
    }else if(data.metaData[index].type == "text")
    {
      data.gridData[index].content = `<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Suscipit maiores tempora aliquid saepe consequuntur nemo, tenetur pariatur dolore sunt accusamus reiciendis soluta ut. Dolores vel doloribus quisquam, quis assumenda qui eos, possimus enim tempora voluptatem itaque cum quos quia commodi nemo dolorum, animi porro maxime.</p>`;
    }
  }

  grid.load(data.gridData);

  for (item of data.metaData) {
    if (item.type == "table") {
      continue;
    } else {
      addDataToGraph(item.id, item.type);
    }
  }

  addDataToGraph(currId, grpType[index]);
}

function addNested(type) {
  const newId = makeid(20);
  const content = `<canvas id="${newId}"></canvas>`;
  grid.addWidget({ x: 0, y: 100, w: 4, h: 3, content: content });
  addDataToGraph(newId, type);
  flag = false;
}

grid.on("added removed change", function (e, items) {
  if (e.type == "added" && flag) {
    const ele = document.getElementById(currId);
    const newId = makeid(20);
    ele.id = newId;
    const dragEle = document.getElementById(currId);
    if (dragEle != null) addDataToGraph(currId, grpType[index]);
    currId = newId;
    index = (index + 1) % sz;
    addDataToGraph(currId, grpType[index]);
  }

  flag = true;

  let str = "";
  items.forEach(function (item) {
    str += " (x,y)=" + item.x + "," + item.y;
  });
  console.log(e.type + " " + items.length + " items:" + str);
});

async function saveConfiguration() {
  var items = [];

  for (const ele of $(".grid-stack-item")) {
    // table
    if (ele.querySelector(".grid-stack-item-content").querySelector("table")) {
      const content = ele
        .querySelector(".grid-stack-item-content")
        .querySelector("table");

      items.push({
        x: ele.getAttribute("gs-x"),
        y: ele.getAttribute("gs-y"),
        w: ele.getAttribute("gs-w"),
        h: ele.getAttribute("gs-h"),
        row: content.getAttribute("row"),
        col: content.getAttribute("col"),
        type: "table",
      });
    } else if (
      // graph
      ele.querySelector(".grid-stack-item-content").querySelector("canvas")
    ) {
      let canvas = ele
        .querySelector(".grid-stack-item-content")
        .querySelector("canvas");
      const id = canvas.id;
      let graph = Chart.getChart(id);
      if (id == currId) continue;
      const type = graph.config._config.type;

      items.push({
        x: ele.getAttribute("gs-x"),
        y: ele.getAttribute("gs-y"),
        w: ele.getAttribute("gs-w"),
        h: ele.getAttribute("gs-h"),
        content: `<canvas id="${id}"></canvas>`,
        id: id,
        type: type,
      });
    }
    else{
      items.push({
        x: ele.getAttribute("gs-x"),
        y: ele.getAttribute("gs-y"),
        w: ele.getAttribute("gs-w"),
        h: ele.getAttribute("gs-h"),
        type: "text",
      });
    }
  }

  $.post(
    "http://127.0.0.1:8080/saveConfig",
    { data: items },
    function (data, status, jqXHR) {
      alert("configuration saved to database");
    }
  );
}

function compact() {
  grid.compact();
}

function addTable() {
  const constriant = 10;
  const row = prompt("enter row count");
  const col = prompt("enter col count");

  if (
    !parseInt(row) ||
    !parseInt(col) ||
    row > constriant ||
    col > constriant
  ) {
    alert(`please enter an integer and must be less than ${constriant}`);
  } else {
    let content = `<table class="table" row=${row} col=${col}>
    <thead>
      <tr>`;

    for (let index = 0; index < col; index++) {
      content += `<th scope="col">col${index + 1}</th>`;
    }

    content += `</tr>
    </thead>
    <tbody>`;

    for (let index = 0; index < row; index++) {
      content += `<tr>`;
      for (let index2 = 0; index2 < col; index2++) {
        content += `<th scope="row">data${index2 + 1}</th>`;
      }
      content += `</tr>`;
    }

    content += `</tbody></table>`;
    grid.addWidget({ x: 0, y: 100, w: 4, h: 3, content: content });
    flag = false;
  }
}

function addText() {
  let content = `<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Suscipit maiores tempora aliquid saepe consequuntur nemo, tenetur pariatur dolore sunt accusamus reiciendis soluta ut. Dolores vel doloribus quisquam, quis assumenda qui eos, possimus enim tempora voluptatem itaque cum quos quia commodi nemo dolorum, animi porro maxime.</p>`;
  grid.addWidget({ x: 0, y: 100, w: 4, h: 3, content: content });
  flag = false;
}

// InitDashBoard();
addNested('line')