console.log("g works");

const topCanvas = document.getElementById("topCanvas");
topCanvas.width = window.innerWidth;
topCanvas.height = window.innerHeight;
const tc = topCanvas.getContext("2d");
tc.strokeStyle = "white";
tc.fillStyle = "white";

//centers the origin in canvas
tc.translate(0.5 * window.innerWidth, 0.5 * window.innerHeight);
//flips the canvas vertically, so the +ve y direction is up (against the default direction)
tc.scale(1, -1);
// used to scale up line segments in many pixels
const SU = 75;

const clearScreen = function () {
  tc.clearRect(
    -window.innerWidth,
    -window.innerHeight,
    2 * window.innerWidth,
    2 * window.innerHeight
  );
};

let drawangle = 0;
const drawVector = function (vector1, vector2, color) {
  drawangle += 0.00002;
  //vector =  scalar + ke1 + ke2 + ke1e2
  if (vector2 == false) vector2 = newmv([0, "e1"], [0, "e2"], [0, "e3"]);

  let anglexy = (0 * Math.PI) / 2;
  let anglexz = (-0.2 * Math.PI) / 2 + 5 * drawangle;
  let angleyz = (0.1 * Math.PI) / 2 + 0 * drawangle;

  let xy = newmv(
    [Math.cos(0.5 * anglexy), "sc"],
    [Math.sin(0.5 * anglexy), "e1e2"]
  );
  let cxy = newmv(
    [Math.cos(0.5 * anglexy), "sc"],
    [-Math.sin(0.5 * anglexy), "e1e2"]
  );

  let yz = newmv(
    [Math.cos(0.5 * angleyz), "sc"],
    [Math.sin(0.5 * angleyz), "e2e3"]
  );
  let cyz = newmv(
    [Math.cos(0.5 * angleyz), "sc"],
    [-Math.sin(0.5 * angleyz), "e2e3"]
  );

  let xz = newmv(
    [Math.cos(0.5 * anglexz), "sc"],
    [Math.sin(0.5 * anglexz), "e1e3"]
  );
  let cxz = newmv(
    [Math.cos(0.5 * anglexz), "sc"],
    [-Math.sin(0.5 * anglexz), "e1e3"]
  );

  let printVect1 = product(cxz, cyz, cxy, vector1, xy, yz, xz);
  let printVect2 = product(cxz, cyz, cxy, vector2, xy, yz, xz);
  let moveBy = newmv([-0.5, "e1"], [-1, "e2"]);

  printVect1 = add(printVect1, moveBy);
  printVect2 = add(printVect2, moveBy);

  let x1 = printVect1.get(en.get("e1"));
  let y1 = printVect1.get(en.get("e2"));

  let x2 = printVect2.get(en.get("e1"));
  let y2 = printVect2.get(en.get("e2"));

  if (color) {
    tc.fillStyle = color;
    tc.strokeStyle = color;
  }

  tc.beginPath();
  tc.moveTo(x1 * SU, y1 * SU);
  tc.lineTo(x2 * SU, y2 * SU);
  tc.stroke();

  tc.beginPath();
  tc.arc(x1 * SU, y1 * SU, 3, 0, 2 * Math.PI, true);
  tc.fill();
  tc.beginPath();
  tc.arc(x2 * SU, y2 * SU, 3, 0, 2 * Math.PI, true);
  tc.fill();
  //reset to default color
  if (color) {
    tc.fillStyle = "white";
    tc.strokeStyle = "white";
  }
};

// sets up grids
const drawGrids = function () {
  for (let i = 0; i < 10; i++) {
    let a = newmv([i, "e1"], [0, "e2"]);
    let b = newmv([-i, "e1"], [0, "e2"]);
    let c = newmv([0, "e1"], [i, "e2"]);
    let d = newmv([0, "e1"], [-i, "e2"]);
    let e = newmv([0, "e1"], [0, "e2"], [i, "e3"]);

    drawVector(a, false, "lightblue");
    drawVector(b, false, "blue");
    drawVector(c, false, "lightgreen");
    drawVector(d, false, "green");
    drawVector(e, false, "red");
  }
};

// tire region
let tireList = [];
let ftlplus = [];
let ftlminus = [];
let numOfVs = 10;
let fofi = (2 * Math.PI) / numOfVs;
for (let i = 0; i < numOfVs; i++) {
  tireList.push(
    newmv([Math.cos(i * fofi), "e1"], [Math.sin(i * fofi), "e2"], [0, "e3"])
  );
}
for (let i = 0; i < numOfVs; i++) {
  let plus = newmv([1, "e3"]);
  let minus = newmv([-1, "e3"]);
  ftlplus.push(add(tireList[i], plus));
  ftlminus.push(add(tireList[i], minus));
}

let leftTire = newmv([-1.5, "e1"]);
let rightTire = newmv([1.5, "e1"]);

//car head part
let yheadList = [
  newmv([1, "e2"]),
  newmv([2, "e2"]),
  newmv([2, "e2"]),
  newmv([3, "e2"]),
  newmv([3, "e2"]),
];
let xheadList = [
  newmv([-2, "e1"]),
  newmv([-2, "e1"]),
  newmv([-1, "e1"]),
  newmv([-1, "e1"]),
  newmv([0, "e1"]),
];
let headList = [];
let fhlplus = [];
let fhlminus = [];
for (let i = 0; i < yheadList.length; i++) {
  headList.push(add(yheadList[i], xheadList[i]));
}
for (let i = yheadList.length - 1; i >= 0; i--) {
  let reversedX = scale(xheadList[i], -1);
  headList.push(add(yheadList[i], reversedX));
}

for (let i = 0; i < headList.length; i++) {
  let plus = newmv([1, "e3"]);
  let minus = newmv([-1, "e3"]);
  fhlplus.push(add(headList[i], plus));
  fhlminus.push(add(headList[i], minus));
}
let carBump = newmv([0.05, "e1"]);

//rotation part
let angle = -Math.PI / 100;
let rotor = newmv([Math.cos(angle), "sc"], [Math.sin(angle), "e1e2"]);
let crotor = newmv([Math.cos(angle), "sc"], [-Math.sin(angle), "e1e2"]);

const loop = function () {
  clearScreen();
  //drawGrids();
  // rotate all at once
  for (let i = 0; i < numOfVs; i++) {
    ftlplus[i] = product(crotor, ftlplus[i], rotor);
    ftlminus[i] = product(crotor, ftlminus[i], rotor);
    carBump = product(crotor, carBump, rotor);
  }

  //display all at once
  //draw car head
  for (let i = 0; i < headList.length; i++) {
    let ii = i;
    if (i == headList.length - 1) ii = -1;
    drawVector(add(fhlplus[i], carBump), add(fhlplus[ii + 1], carBump));
    drawVector(add(fhlminus[i], carBump), add(fhlminus[ii + 1], carBump));

    drawVector(add(fhlplus[i], carBump), add(fhlminus[i], carBump));
  }
  //draw tires
  for (let i = 0; i < numOfVs; i++) {
    let ii = i;
    //last point connected to the first point
    if (i == numOfVs - 1) ii = -1;
    drawVector(add(ftlplus[i], leftTire), add(ftlplus[ii + 1], leftTire));
    drawVector(add(ftlplus[i], rightTire), add(ftlplus[ii + 1], rightTire));

    drawVector(add(ftlminus[i], leftTire), add(ftlminus[ii + 1], leftTire));
    drawVector(add(ftlminus[i], rightTire), add(ftlminus[ii + 1], rightTire));

    drawVector(add(ftlplus[i], leftTire), add(ftlminus[i], leftTire));
    drawVector(add(ftlplus[i], rightTire), add(ftlminus[i], rightTire));
  }

  setTimeout(loop, 30);
};
loop();
