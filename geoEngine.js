console.log("geoEngine works");
// aim: to be able to calculate geometric products
//eg: (e1 + 2e2 + e3 + 9e1e2) * (e4 + 10e1)

// kinda the theory...
// consider e1e2 * e1e3
// maximum about of double ens = 2, in this case the double is e1
// its taken for granted that each term doesnt have doubles inside itself. eg: no e1 e4 e1
// it is also take for granted that each term is ordered. eg: no e3 e1 e2 but e1 e2 e3

// so when multiplying...
// e1 e2 e1 e3
//-e1 e1 e2 e3
// we can see that e2 is the only one who migrated to the right
// also notice that e2 came from the left term
// so the general pattern is, the es that migrate to the right only come from the left terms
// by counting the number of "jumps" of these lefty es, we get the rotations that have happened upto now.
// so since e2 jumped once to the right = one rotation

//odd rotations bring a -1
//even rotations bring a +1

//chooseProduct() is the main function, the heart of this module, and the rest supplement it

// say multivector has ["e1","e3"] =>5
// since multivector.get(["e1","e3"]) wont ever work since js sees both lists as different(they dont have the same reference),
// we need to get the list from the same source... something close to:
//      let a = ["e1","e3"], then do multivector.get(a);

//the following en object acts as a central list reference storage, so that en.e1e3 = the same ["e1","e3"] can be used every where
const en = {
  // by default e1, e2 and e3 are supported
  e1: ["e1"],
  e2: ["e2"],
  e3: ["e3"],
  get: function (eNumber) {
    //eNumber can be "e4e5" this functions returns ["e4","e5"]
    //it checks if ["e4","e5"] exists: return the list if exists | create it and return the list if not

    if (this[eNumber] != undefined) {
      return this[eNumber];
    } else {
      //eg: e1e22e3 to ["","1","22","3"]
      let listOfEs = eNumber.split("e");

      for (let i = 0; i < listOfEs.length; i++) {
        listOfEs[i] = "e" + listOfEs[i];
      }

      //eg: ["e","e1","e22","e3"] to ["e1","e22","e3"]
      listOfEs.splice(0, 1);
      this[eNumber] = listOfEs;

      return this[eNumber];
    }
  },
  getButThroughList: function (eNumberInAList) {
    //its basically the same as get
    // but it takes in a list, to save some energy spent on making a string and splitting it again
    let eNumberInString = eNumberInAList.toString();
    if (this[eNumberInString] != undefined) {
      return this[eNumberInString];
    } else {
      this[eNumberInString] = eNumberInAList;
      return this[eNumberInString];
    }
  },
};

// functions concerened with chooseProduct() ---
const PlusMinusOne = function (firstBasis, orderedBasis) {
  //the es are ordered in ordered basis, this is almost the final simplified product. but lacks +or-1
  //eg: e1 e1 e3 e4 e4 e5
  let totalRotations = 0;
  let plusOrMinus = 1;

  for (let i = 0; i < firstBasis.length; i++) {
    let eInBasis1 = firstBasis[i];
    let finalPosition = orderedBasis.indexOf(eInBasis1);
    let jumps = finalPosition - i;
    totalRotations += jumps;
  }
  //even number of rotations bring a net +1, odd rotations give -1
  if (totalRotations % 2 != 0) plusOrMinus = -1;
  return plusOrMinus;
};

const finalizeBasis = function (orderedBasis) {
  //start one step away from last element to check the number in front of it
  for (let i = orderedBasis.length - 2; i >= 0; i--) {
    if (orderedBasis[i] == orderedBasis[i + 1]) orderedBasis.splice(i, 2);
  }
  return orderedBasis;
};
const addToProductMV = function (
  finalBasis,
  finalCoefficient,
  productMultiVector
) {
  // if the product gives scalars eg: e5 * e5 = 1
  // then the finalBasis will be an empty set eg: []
  // [] is not pretty so, we will name it "sc" kinda like "scalar"

  if (finalBasis.length == 0) finalBasis = "sc";

  if (productMultiVector.has(finalBasis)) {
    // simmilar to += the new final coefficient eg: 7e1e2 + 8e1e2 = 15e1e2
    let oldk = productMultiVector.get(finalBasis);
    let newk = finalCoefficient;
    productMultiVector.set(finalBasis, oldk + newk);
  } else {
    productMultiVector.set(finalBasis, finalCoefficient);
  }
};

const chooseProduct = function (listOfMultiVectors, isdot, iswedge) {
  let previousMultiVector = new Map();

  for (let mvno = 1; mvno < listOfMultiVectors.length; mvno++) {
    // multiplies multivectors(dot, wedge, geometric product) in geometric algebra like (2e1 + e2 + 4e1e2) * (e1e2 + -9e5)
    // find the product of the first two multi vectors, hold the result and continue on with multiplying with the next multi vectors

    // productMV= mv1 * mv2
    //at the end of a product cycle, set previousMV and start with a fresh productMV
    let multiVectorOne;

    if (mvno == 1) multiVectorOne = listOfMultiVectors[0];
    else multiVectorOne = previousMultiVector;

    let multiVectorTwo = listOfMultiVectors[mvno];

    let productMultiVector = new Map();

    for (let [basisOne, coefficientOne] of multiVectorOne) {
      for (let [basisTwo, coefficientTwo] of multiVectorTwo) {
        // if dot, then multiply only similar basis, if wedge then dont do that, else it must be geometric product its fine
        if (isdot && !iswedge && basisOne != basisTwo) continue;
        else if (!isdot && iswedge && basisOne == basisTwo) continue;

        // find new coeficient, find new combination of basis, add it to the product multivector. eg: e1e2 * 8 e1e2e3 = -8, e3, product multivector += -8e3
        let finalCoefficient = coefficientOne * coefficientTwo;

        //if scalars happen: scalars dont act like basis es(eg: 8*e1 != -e1*8), so follow this simple path
        if (basisOne == "sc") {
          addToProductMV(basisTwo, finalCoefficient, productMultiVector);
        } else if (basisTwo == "sc") {
          addToProductMV(basisOne, finalCoefficient, productMultiVector);
        } else {
          let orderedBasis = [...basisOne, ...basisTwo].sort();

          //+or- sign should be determined eg: e1e2 e1e2 e3 = -e3
          let plusOrMinus = PlusMinusOne(basisOne, orderedBasis);
          finalCoefficient *= plusOrMinus;

          let finalBasis = finalizeBasis(orderedBasis); //doubles need to be simplified eg:e1e1e2 to e2 and
          //incase a new basis like["e99","e199"] is created (the above cases WILL NOT, ONLY THIS ONE CAN), make sure it is regestered in en object
          finalBasis = en.getButThroughList(finalBasis);

          addToProductMV(finalBasis, finalCoefficient, productMultiVector);
        }
      }
    }
    previousMultiVector = productMultiVector;
  }
  return previousMultiVector;
};
// middle man functions for wedge, dot, or the whole geometric product ---
const wedge = function (...multiVectorList) {
  return chooseProduct(multiVectorList, false, true);
};
const dot = function (...multiVectorList) {
  return chooseProduct(multiVectorList, true, false);
};
const product = function (...multiVectorList) {
  return chooseProduct(multiVectorList, false, false);
};

// non product functions
const add = function (...multiVectorList) {
  let finalMultiVector = new Map();
  for (multiVector of multiVectorList) {
    for ([basis, coefficient] of multiVector) {
      if (finalMultiVector.has(basis)) {
        // simmilar to += the new final coefficient eg: 7e1e2 + 8e1e2 = 15e1e2
        let oldk = finalMultiVector.get(basis);
        let newk = coefficient;
        finalMultiVector.set(basis, oldk + newk);
      } else {
        finalMultiVector.set(basis, coefficient);
      }
    }
  }
  return finalMultiVector;
};

const subtract = function (mv1, mv2) {
  let finalMultiVector = new Map();
  for ([basis1, coefficient1] of mv1) {
    if (mv2.has(basis1)) {
      let k1 = coefficient1;
      let k2 = mv2.get(basis1);

      finalMultiVector.set(basis1, k1 - k2);
    } else {
      finalMultiVector.set(basis1, 0 - k1);
    }
  }
  return finalMultiVector;
};

const scale = function (multiVector, scalar) {
  let finalMultiVector = new Map();
  for ([basis, coefficient] of multiVector) {
    finalMultiVector.set(basis, coefficient * scalar);
  }
  return finalMultiVector;
};
const magnitude = function (multiVector) {
  let mag = 0;
  for ([basis, coefficient] of multiVector) {
    mag += coefficient ** 2;
  }
  mag = Math.sqrt(mag);
  return mag;
};

//-- convinience functions
const printmv = function (multiVector) {
  let components = [...multiVector.keys()];

  if (components.length == 0) {
    console.log("Empty MultiVector!");
    return;
  }
  let inStrings = "";

  for (let i = 0; i < components.length; i++) {
    let key = components[i];
    let value = multiVector.get(key);
    let keyToString = ""; //remember the key is a list eg:["e1","e3"]
    for (let j = 0; j < key.length; j++) keyToString += key[j];

    inStrings += value + keyToString + " + ";
  }
  // remove the last " + "
  let result = inStrings.substring(0, inStrings.length - 2);
  console.log(result);
  return;
};

const newmv = function (...kXens) {
  let newMultiVector = new Map();
  for (let i = 0; i < kXens.length; i++) {
    let kXen = kXens[i]; //eg: [9,"e1e3"] from [[9,"e1e3"],[12,"e1"]]
    let coefficient = kXen[0];
    let basis = kXen[1];
    basis = en.get(basis);
    newMultiVector.set(basis, coefficient);
  }
  return newMultiVector;
};
