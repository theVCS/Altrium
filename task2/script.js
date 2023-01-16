const grpType = ["bar", "line", "scatter", "doughnut", "polarArea", "radar"];
const sz = grpType.length;
let index = 0;
let flag=true;
let currId = "dragGrp";

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
    },
  });
}

async function InitDashBoard() {
  const data = await getDashBoardData();
  grid.load(data.gridData);

  for (item of data.metaData) {
    addDataToGraph(item.id, item.type);
  }

  addDataToGraph(currId, grpType[index]);
}

function addNested() {
  const newId = makeid(20);
  const content = `<canvas id="${newId}"></canvas>`;
  grid.addWidget({ x: 0, y: 100, w: 4, h: 3, content: content });
  addDataToGraph(newId, grpType[index]);
  index = (index + 1) % sz;
  addDataToGraph(currId, grpType[index]);
  flag=false;
}

function compact()
{
  grid.compact();
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

  flag=true;

  let str = "";
  items.forEach(function (item) {
    str += " (x,y)=" + item.x + "," + item.y;
  });
  console.log(e.type + " " + items.length + " items:" + str);
});

async function saveConfiguration() {
  var items = [];

  for (const ele of $(".grid-stack-item")) {
    const canvas = ele
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
  $.post(
    "http://127.0.0.1:8080/saveConfig",
    { data: items },
    function (data, status, jqXHR) {
      alert("configuration saved to database");
    }
  );
}

InitDashBoard();
