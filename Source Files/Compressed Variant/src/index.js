import './style.css'
import * as tf from '@tensorflow/tfjs';
//import * as tfn from '@tensorflow/tfjs-node'
import { Random } from 'random'
import excel  from './excel/cleanData.xlsx'
import excel2 from './excel/testData.xlsx'
import excel3 from './excel/SOXLcateg.xlsx'
import image1 from './images/test.jpg'
import image2 from './images/testimage.jpg'
import image3 from './images/blue.jpg'
import image4 from './images/car.jpg'
import image5 from './images/panda.jpg'
import image6 from './images/correct.png'

var model
//training variables
const status = document.getElementById("status")
const lossOutput = document.getElementById('lossOutput');

const rng = new Random()
const { ssim } = require('image-ssim');
const XLSX = require("xlsx");
//const fs = require('fs');
let randomFlag = false
let compressedFlag = true

let width = []
let height = []
let dimension = []
let scale = []

let testWidth = []
let testHeight = []
let testScale = []

let dataArray = []
let imageArray = []
let imageArrayCompressed = []
let imageArrayNonCompressed = []
let cancelled = false
let globalDataset = null

var limit = 40
var counter = 0

//non-related tfjs things

async function testDataset(){
  // const csvUrl = 'SOXLcateg.csv';
  // const trainingData = tf.data.csv(csvUrl, {
  //     columnConfigs: {
  //         next_day_inc: {
  //             isLabel: true
  //         }
  //     }
  // });
  // const convertedData = trainingData.map(({ xs, ys }) => {
  //     const labels = [
  //         ys.next_day_inc == "profit" ? 1 : 0,
  //         ys.next_day_inc == "loss" ? 1 : 0]
  //     return { xs: Object.values(xs), ys: Object.values(labels) };
  // }).batch(300);
 
  // const model = tf.sequential();
  // model.add(tf.layers.dense({
  //     inputShape: [1],
  //     activation: "sigmoid", units: 5
  // }));
  // model.add(tf.layers.dense({ activation: "softmax", units: 2 }));
  // model.compile({
  //     loss: "binaryCrossentropy",
  //     optimizer: tf.train.adam(0.0006),
  //     metrics: "accuracy"
  // })
  // await model.fitDataset(
  //     convertedData,
  //     {
  //         shuffle: true,
  //         epochs: 50,
  //         callbacks: {
  //             onEpochEnd: async (epoch, logs) => {
  //                 console.log("E: " + epoch + " Loss: " + logs.loss + " Accuracy: " + logs.acc);
  //             }
  //         }
  //     }
  // )
    }
  // const testVal = tf.tensor2d([2.383,2.619,2.383,2.599,15642000.000,0.102], [1, 6]);
  // const prediction = model.predict(testVal);
  // const pIndex = tf.argMax(prediction, axis = 1).dataSync();
  // const classNames = ["Profit", "Loss"];
  // alert(classNames[pIndex]);


function reloadModel() {
  var selectElement = document.querySelector('#select1');
  var output = selectElement.value;
  if (output == "sequential") {
    sequential()
  } else if (output == "functional") {
    functional()
  } else if (output == "cnn") {
    CNN()
  }
}

function trainModel() {
  var selectElement = document.querySelector('#select1');
  var output = selectElement.value;
  if (output == "sequential") {
    sequentialTraining()
  } else if (output == "functional") {
    functionalTraining()
  } else if (output == "cnn") {
    CNNTraining()
  }
}

//for training dataset
function buttonClick($event) {

  console.log($event)
  //console.log($event.srcElement.previousSibling.previousSibling)
  var data = ""
  var criteria = ''
  if ($event.target.innerText == "Yes") {
    criteria = "Yes"
    data = $event.srcElement.previousSibling.previousSibling.previousSibling.previousSibling.previousSibling
  } else {
    criteria = "No"
    data = $event.srcElement.previousSibling.previousSibling.previousSibling.previousSibling.previousSibling.previousSibling.previousSibling
  }

  var string = data.src.split("data:image/jpeg;base64,").join("")
  //console.log(string)

  var decoded = atob(string);
  var fileSize = decoded.length / 1000
  var originalSize = data.className

  if (fileSize > originalSize) {
    criteria = "No"
  }

  dataArray.push({
    Width: data.naturalWidth,
    Height: data.naturalHeight,
    OriginalSize: originalSize,
    CompressedSize: fileSize,
    Scale: data.id,
    Criteria: criteria

  }
  )
  //console.log("type: " + typeof data)
  console.log(dataArray)
  data.parentNode.remove()
  counter = counter + 1
  if (counter == limit) {
    writeExcel(dataArray)
  }
}

function setImageArray() {
  var test = new Image()
  test.crossOrigin = "anonymous"
  test.src = document.getElementById("test").src
  var testimage = new Image()
  testimage.crossOrigin = "anonymous"
  testimage.src = document.getElementById("testimage").src
  var blue = new Image()
  blue.crossOrigin = "anonymous"
  blue.src = document.getElementById("blue").src
  var car = new Image()
  car.crossOrigin = "anonymous"
  car.src = document.getElementById('car').src
  var panda = new Image()
  panda.crossOrigin = "anonymous"
  panda.src = document.getElementById('panda').src
  var correct = new Image()
  correct.crossOrigin = "anonymous"
  correct.src = document.getElementById('correct').src


  imageArray = [[test, 210], [testimage, 257], [blue, 42], [car, 226], [panda, 121], [correct, 15]]
  console.log(imageArray)
  //imageArray = [[image1, 210], [image2, 257], [image3, 42], [image4, 226], [image5, 121], [image6, 15]] 
  // imageArrayCompressed = [["https://i.imgur.com/cRJaNUg.jpg", 1], ["https://i.imgur.com/oFv8EM0.jpg", 1], ["https://i.imgur.com/moiLga4.jpg?1", 1],
  // ["https://i.imgur.com/PfLsiBN.jpg", 1], ["https://i.imgur.com/R7wpmtD.jpg", 1], ["https://i.imgur.com/mQWXSte.jpg", 1]]
  imageArrayNonCompressed = [["https://i.imgur.com/G5OMSlw.jpg", 208], ["https://i.imgur.com/qMZ7CeW.jpg", 263], ["https://i.imgur.com/i1HAyDb.jpg", 43.2],
  ["https://i.imgur.com/WCtjxN0.jpg", 231], ["https://i.imgur.com/TAkKc9x.jpg", 125], ["https://i.imgur.com/p9kQs1i.png", 15.5], ["https://i.imgur.com/BPvsOBU.jpg", 1630],
  ["https://i.imgur.com/rlldhC9.jpg", 50.6], ["https://i.imgur.com/bpjw9xi.png", 1.98], ["https://i.imgur.com/QKOu04U.jpg", 7.02]]

  // for(let i = 0; i<imageArray.length; i++){
  //   compression(imageArray[i][0])
  // }
  //imageArray = [[correct, 15]]
  console.log("running")




}

function excelData() {

  var workbook = excel;
  var testworkbook = excel2

  let worksheet = workbook.Sheets[workbook.SheetNames[0]];
  let testWorksheet = testworkbook.Sheets[workbook.SheetNames[0]];

  var arr = XLSX.utils.sheet_to_row_object_array(worksheet, { blankrows: false, defval: '' });
  const totalRows = arr.length + 1;

  var testarr = XLSX.utils.sheet_to_row_object_array(testWorksheet, { blankrows: false, defval: '' });
  const testTotalRows = testarr.length+1

  console.log(totalRows)

  for (let index = 2; index <= totalRows; index++) {
    var w = parseInt(worksheet[`A${index}`].v);
    var h = parseInt(worksheet[`B${index}`].v);
    var s = parseFloat([worksheet[`C${index}`].v]);
    dimension.push([w, h])
    width.push(w)
    height.push(h)
    scale.push(s)
  }

  for (let index = 2; index<= testTotalRows; index++){
    var w = parseInt(testWorksheet[`A${index}`].v);
    var h = parseInt(testWorksheet[`B${index}`].v);
    var s = parseFloat([testWorksheet[`C${index}`].v]);
    testWidth.push(w)
    testHeight.push(h)
    testScale.push(s)
  }
  
  console.log(testWidth)

}

function writeExcel(data) {
  //Reading our test file
  const file = excel2

  const ws = XLSX.utils.json_to_sheet(data)

  XLSX.utils.book_append_sheet(file, ws, "Sheet2")

  // Writing to our file
  XLSX.writeFile(file, './excel/file.xlsx')

}
/////////////////////////////////////////////////////////////////////////////////
// Take an image URL, downscale it to the given width, and return a new image URL.
//img.src = "//i.imgur.com/SHo6Fub.jpg";
//}
async function compression(image) {

  let width = image.width
  let height = image.height

  if (model.name == "sequential") {
    var prediction = model.predict(tf.tensor([[width, height]]));
    var scale = prediction.arraySync()[0][0]
  } else if (model.name == "functional") {
    var prediction = model.predict([tf.tensor([[width]]), tf.tensor([[height]])])
    var scale = prediction.arraySync()[0][0]
  }

  scale = 1.1231945843938

  console.log(scale)

  // Create a temporary canvas to draw the downscaled image on.
  var canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;

  var ctx = canvas.getContext("2d");

  ctx.drawImage(image, 0, 0);
  var newDataUrl = canvas.toDataURL("image/jpeg", scale);
  console.log(newDataUrl)
  var newSize = newDataUrl.split("data:image/jpeg;base64,").join("")

  if (newSize == "data:,") {
    newSize = ""
  }
  var decoded = atob(newSize)
  var newFileSize = decoded.length / 1000

  var originalDataUrl;

  return [newDataUrl, scale, originalDataUrl, newFileSize, image.width, image.height]
}

async function randomImage(imageArray) {
  for (var i = 0; i < limit; i++) {
    if (cancelled == true) {
      return
    }
    //make div
    console.log("iteration: "+i)
    var random = Math.floor(Math.random() * imageArray.length);
    var baseImage = await load_pic(imageArray[i % 10][0])
    //console.log(baseImage)
    const newDiv = document.createElement('div')
    newDiv.id = "div"
    const referenceNode = document.getElementById("insertion")
    //make image
    var newImage = document.createElement('img')
    if (compressedFlag == true) {
      //compresssed//
      console.log("compressing...")
      let data = await compression(baseImage)
      newImage.src = data[0]
      newImage.id = data[1]
      var originalSize = imageArray[i % 10][1]
      var fileSize = data[3]
      var sizeText = ("Original: " + originalSize + " Compressed: " + fileSize)
      var dimensionText = ("Width: " + data[4] + " Height: " + data[5])
      newImage.className = originalSize
      var scale = document.createElement('p')
      var size = document.createElement('p')
      var dimension = document.createElement('p')

      scale.innerText = data[1]
      size.innerText = sizeText
      dimension.innerText = dimensionText
    } else if (compressedFlag == false) {
      //non compressed//
      console.log("not compressing...")
      newImage.src = baseImage.src
      newImage.setAttribute("name", imageArray[random][1])
      var scale = document.createElement('p')
      var size = document.createElement('p')
      var dimension = document.createElement('p')
      scale.innerText = "original"
      size.innerText = "original"
      dimension.innerText = ""
    }

    //make button
    const yes = document.createElement('button')
    yes.innerHTML = "Yes"
    yes.onclick = buttonClick
    const no = document.createElement('button')
    no.innerHTML = "No"
    no.onclick = buttonClick

    //combine
    referenceNode.parentNode.insertBefore(newDiv, referenceNode.nextSibling);
    newDiv.appendChild(newImage)
    newDiv.appendChild(scale)
    newDiv.appendChild(size)
    newDiv.appendChild(dimension)
    //newDiv.appendChild(originalImage)
    newDiv.appendChild(document.createElement("br"))
    newDiv.appendChild(yes)
    newDiv.appendChild(document.createElement("br"))
    newDiv.appendChild(no)
    newDiv.appendChild(document.createElement("br"))
    newDiv.appendChild(document.createElement("br"))
  }
  console.log("finished executing")

}





async function initialization() {
  console.log("initialization")

  //console.log(trainingData.input.url.Sheets.Sheet2)

  const reload = document.getElementById("reload")
  reload.onclick = reloadModel
  const train = document.getElementById("train")
  train.onclick = trainModel
  // const showDataset = document.getElementById("showDataset")
  // showDataset.onclick = testDataset


  try {
    model = await tf.loadLayersModel('localstorage://model');
    console.log("loaded ")
    console.log(model)
  } catch (err) {
    console.log(err)
    //default model used will be sequential
    await sequential()
  }

}



//sequential model
async function sequential() {
  cancelled = true
  console.log("sequential")
  model = tf.sequential();

  model.add(tf.layers.dense({ units: 64, activation: 'relu', inputShape: [1] }));  // Input layer with 2 features
  model.add(tf.layers.dense({ units: 64, activation: 'relu', inputShape: [1] }));  // Input layer with 2 features
  model.add(tf.layers.dense({ units: 64, activation: 'relu', inputShape: [1] }));  // Input layer with 2 features
  model.add(tf.layers.dense({ units: 1, activation: 'linear' }));
  model.name = "sequential"
  await model.save('localstorage://model')
  sequentialTraining()

}

async function sequentialTraining() {
  cancelled = true
  console.log("sequential train")
  model = await tf.loadLayersModel('localstorage://model');
  const trainedDataInputTensor = tf.tensor(dimension);
  const trainedDataOutputTensor = tf.tensor(scale);
  model.compile({
    loss: "meanSquaredError",
    optimizer: "adam"
  })
  await model.fitDataset(ds,
    {
      epochs: 200,
      shuffle: true,
      callbacks: {
        onEpochEnd: async (epoch, logs) => {
          status.innerHTML = `${epoch + 1}`;
          lossOutput.innerHTML = 'Loss: ' + logs.loss
          // await tf.nextFrame();

        }
      }
    });
  console.log("sequential: " + model.predict(tf.tensor([[1920, 1080]])));
  await model.save('localstorage://model')
  console.log(model)
}
//functional model (CNN)
function CNN() {
  // console.log("CNN")
  cancelled = true
  // let activationMethod = 'relu'

  // let myInput1 = tf.input({ shape: [1, 1], name: 'myInput1' })
  // let myInput1Dense1 = tf.conv2d({ activation: activationMethod })

}

async function CNNTraining() {
  cancelled = true
}

//functional model (multiple input variant)
async function functional() {

  cancelled = true
  let activationMethod = 'mish'
  console.log("functional")
  let myInput1 = tf.input({ shape: [1], name: 'myInput1' });
  let myInput1Dense1 = tf.layers.dense({ units: 30, name: 'myInput1Dense1', activation: activationMethod  }).apply(myInput1);
  let myInput1Dense2 = tf.layers.dense({ units: 20, name: 'myInput1Dense2', activation: activationMethod }).apply(myInput1Dense1);
  let myInput1Dense3 = tf.layers.dense({ units: 10, name: 'myInput1Dense3', activation: activationMethod }).apply(myInput1Dense2)
  //const myInput1Dense3 = tf.layers.flatten().apply(myInput1Dense2)

  let myInput2 = tf.input({ shape: [1], name: 'myInput2' });
  let myInput2Dense1 = tf.layers.dense({ units: 30, name: 'myInput2Dense1', activation: activationMethod }).apply(myInput2);
  let myInput2Dense2 = tf.layers.dense({ units: 20, name: 'myInput2Dense2', activation: activationMethod }).apply(myInput2Dense1);
  let myInput2Dense3 = tf.layers.dense({ units: 10, name: 'myInput2Dense3', activation: activationMethod }).apply(myInput2Dense2);
  //const myInput2Dense3 = tf.layers.flatten().apply(myInput2Dense2)

  let myConcatenate1 = tf.layers.concatenate({ axis: 1, name: 'myConcatenate1', activation: 'linear' }).apply([myInput1Dense3, myInput2Dense3]);
  let myConcatenate1Dense4 = tf.layers.dense({ units: 1, name: 'myConcatenate1Dense4', activation: 'linear' }).apply(myConcatenate1)

  model = tf.model({ inputs: [myInput1, myInput2], outputs: myConcatenate1Dense4 });
  model.name = "functional"
  await model.save('localstorage://model')
  functionalTraining()
}

async function functionalTraining() {
  cancelled = true
  model = await tf.loadLayersModel('localstorage://model')
  console.log("functional training")
  model.compile({
    loss: "meanSquaredError",
    optimizer: "adam",
    metrics: "accuracy" 
  })
  let trainedDataInputTensorWidth = tf.tensor(width);
  let trainedDataInputTensorHeight = tf.tensor(height);
  let trainedDataOutputTensor = tf.tensor(scale);

  let testDataInputTensorWidth = tf.tensor(testWidth)
  let testDataInputTensorWHeight= tf.tensor(testHeight)
  let testDataOutputTensor = tf.tensor(testScale)

  let status = document.getElementById("status")
  let lossOutput = document.getElementById('lossOutput');
  await model.fit([trainedDataInputTensorWidth, trainedDataInputTensorHeight], trainedDataOutputTensor,
  //await model.fitDataset(globalDataset,

    {

      epochs: 200,
      shuffle: true,
      callbacks: {
        onEpochEnd: async (epoch, logs) => {
          console.log(logs)
          status.innerHTML = `${epoch + 1}`;
          lossOutput.innerHTML = 'Loss: ' + logs.loss 
          // await tf.nextFrame();

        }
      }

    });
  console.log(model.summary());
  //console.log(output[1].dataSync()[0])
  //console.log(output)
  await model.save('localstorage://model')
}

function functionalPredict() {
  let width = parseInt(document.getElementById("width").value)
  let height = parseInt(document.getElementById("height").value)

  console.log(width, height)
  console.log("Width: " + width + " Height: " + height + " Scale: " + functionalModel.predict([tf.tensor([[width]]), tf.tensor([[height]])]))
}


//load pic
function blobToBase64(blob) {
  return new Promise((resolve, _) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}

async function load_pic(url) {


  const options = {
    method: "GET"
  }

  let response = await fetch(url, options)

  if (response.status === 200) {

    const imageBlob = await response.blob()
    //temp section
    var base64data = await blobToBase64(imageBlob)



    const image = new Image()
    image.crossOrigin = "anonymous"
    image.src = base64data


    // const container = document.getElementById("your-container")
    // container.append(image)
    return image
  }
  else {
    console.log("HTTP-Error: " + response.status)
  }
}

async function checkImagesLoaded() {
  Promise.all(Array.from(document.images).filter(img => !img.complete).map(img => new Promise(resolve => { img.onload = img.onerror = resolve; }))).then(async () => {
    console.log('images finished loading');
    excelData()
    await initialization()
    setImageArray()
    randomImage(imageArrayNonCompressed)
  });
}

//functional()  
checkImagesLoaded()
// excelData()
// multiLinearRegression()

