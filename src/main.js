import Web3 from "web3"
import { newKitFromWeb3 } from "@celo/contractkit"
import BigNumber from "bignumber.js"
import marketplaceAbi from "../contract/rener.abi.json"
import erc20Abi from "../contract/erc20.abi.json"

const ERC20_DECIMALS = 18
const MPContractAddress = "0x96Ace1Ad99953eF1189e697d8be5482B374bb664"
const cUSDContractAddress = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1"

let kit
let contract
let products = []
let rentIndex 
let editIndex

const connectCeloWallet = async function () {
  if (window.celo) {
    notification("⚠️ Please approve this DApp to use it.")
    try {
      await window.celo.enable()
      notificationOff()

      const web3 = new Web3(window.celo)
      kit = newKitFromWeb3(web3)

      const accounts = await kit.web3.eth.getAccounts()
      kit.defaultAccount = accounts[0]

      contract = new kit.web3.eth.Contract(marketplaceAbi, MPContractAddress)
    } catch (error) {
      notification(`⚠️ ${error}.`)
    }
  } else {
    notification("⚠️ Please install the CeloExtensionWallet.")
  }
}

async function approve(_price) {
  const cUSDContract = new kit.web3.eth.Contract(erc20Abi, cUSDContractAddress)

  const result = await cUSDContract.methods
    .approve(MPContractAddress, _price)
    .send({ from: kit.defaultAccount })
  return result
}

const getBalance = async function () {
  const totalBalance = await kit.getTotalBalance(kit.defaultAccount)
  const cUSDBalance = totalBalance.cUSD.shiftedBy(-ERC20_DECIMALS).toFixed(2)
  document.querySelector("#balance").textContent = cUSDBalance
}

const getProducts = async function() {
  const _productsLength = await contract.methods.getProductsLength().call()
  const _products = []
  for (let i = 0; i < _productsLength; i++) {
    let _product = new Promise(async (resolve, reject) => {
      let p = await contract.methods.readProduct(i).call()
      resolve({
        index: i,
        owner: p[0],
        name: p[1],
        image: p[2],
        description: p[3],
        date: p[4],
        price: new BigNumber(p[5])
      })
    })
    _products.push(_product)
  }
  products = await Promise.all(_products)
  renderProducts()
}

const getUserProducts = async function(ownerAddress) {
  const _productsLength = await contract.methods.getProductsLength().call()
  const _products = []
  for (let i = 0; i < _productsLength; i++) {
    let _product = new Promise(async (resolve, reject) => {
      let p = await contract.methods.readProduct(i).call()
      resolve({
        index: i,
        owner: p[0],
        name: p[1],
        image: p[2],
        description: p[3],
        date: p[4],
        price: new BigNumber(p[5])
      })
    })
    _products.push(_product)
  }
  products = await Promise.all(_products)
  products = products.filter(_product => _product.owner == ownerAddress)
  renderProducts()
}

async function renderProducts() {
  document.getElementById("show").innerHTML = ""
  var fecha = new Date();
  products.forEach((_product) => {
    const newDiv = document.createElement("div")
    newDiv.className = "col-md-4"

    if (Date.parse(fecha) < Date.parse(_product.date)){
      newDiv.innerHTML = productTemplateRented(_product)
    }
    else if (_product.owner == kit.defaultAccount) {
      newDiv.innerHTML = productTemplateSelf(_product)
    }
    else {
      newDiv.innerHTML = productTemplate(_product)
    }

    
    document.getElementById("show").appendChild(newDiv)
  })
}

function productTemplate(_product) {
  return `
  <div class="col">
    <div class="card shadow-sm">
        <img src="${_product.image}" style="height: 200px; width: 100%; object-fit: cover;"/>
        <div class="card-body">
        <h3 class="card-text">${_product.name} <span class="d-inline-block text-truncate" style="max-width: 100px; font-size: medium; font-weight: 400;">by <a class="byReference" style="cursor: pointer; text-decoration: none;" id="${_product.index}">${_product.owner}</a> </span></h3>
        <p class="card-text">${_product.description}</p>
        <div class="d-flex justify-content-between align-items-center">
            <div class="btn-group">
            <button type="button" class="btn btn-sm btn-outline-secondary buyBtn" data-bs-toggle="modal"
            data-bs-target="#rentModal" id="${_product.index}">Rent for ${_product.price.shiftedBy(-ERC20_DECIMALS).toFixed(2)} cUSD a day</button>
            </div>
        </div>
        </div>
    </div>
    </div>
  `
}

function productTemplateSelf(_product) {
  return `
  <div class="col">
    <div class="card shadow-sm">
        <img src="${_product.image}" style="height: 200px; width: 100%; object-fit: cover;"/>
        <div class="card-body">
        <h3 class="card-text">${_product.name} <span class="d-inline-block text-truncate" style="max-width: 100px; font-size: medium; font-weight: 400;">by <a class="byReference" style="cursor: pointer; text-decoration: none;" id="${_product.index}">${_product.owner}</a> </span></h3>
        <p class="card-text">${_product.description}</p>
        <div class="d-flex justify-content-between align-items-center">
            <button type="button" class="btn btn-sm btn-outline-secondary rentProduct" data-bs-toggle="modal"
            data-bs-target="#editModal" id="${_product.index}">Edit</button>
        </div>
        </div>
    </div>
    </div>
  `
}

function productTemplateRented(_product) {
  return `
  <div class="col">
    <div class="card shadow-sm">
        <img src="${_product.image}" style="height: 200px; width: 100%; object-fit: cover;"/>
        <div class="card-body">
        <h3 class="card-text">${_product.name} <span class="d-inline-block text-truncate" style="max-width: 100px; font-size: medium; font-weight: 400;">by <a class="byReference" style="cursor: pointer; text-decoration: none;" id="${_product.index}">${_product.owner}</a> </span></h3>
        <p class="card-text">${_product.description}</p>
        <div class="d-flex justify-content-between align-items-center">
            <div class="btn-group">
            <button type="button" class="btn btn-sm btn-outline-secondary" disabled>Rented</button>
            </div>
        </div>
        </div>
    </div>
    </div>
  `
}

function identiconTemplate(_address) {
  const icon = blockies
    .create({
      seed: _address,
      size: 8,
      scale: 16,
    })
    .toDataURL()

  return `
  <div class="rounded-circle overflow-hidden d-inline-block border border-white border-2 shadow-sm m-0">
    <a href="https://alfajores-blockscout.celo-testnet.org/address/${_address}/transactions"
        target="_blank">
        <img src="${icon}" width="48" alt="${_address}">
    </a>
  </div>
  `
}

function notification(_text) {
  document.querySelector(".alert").style.display = "block"
  document.querySelector("#notification").textContent = _text
}

function notificationOff() {
  document.querySelector(".alert").style.display = "none"
}

window.addEventListener("load", async () => {
  notification("⌛ Loading...")
  await connectCeloWallet()
  await getBalance()
  await getProducts()
  notificationOff()
});

document
  .querySelector("#newProductBtn")
  .addEventListener("click", async (e) => {
    const params = [
      document.getElementById("newProductName").value,
      document.getElementById("newImgUrl").value,
      document.getElementById("newProductDescription").value,
      new Date(),
      new BigNumber(document.getElementById("newPrice").value).shiftedBy(ERC20_DECIMALS).toString()
    ]
    notification(`⌛ Adding "${params[0]}"...`)
    try {
      const result = await contract.methods
        .addProduct(...params)
        .send({ from: kit.defaultAccount })
    } catch (error) {
      notification(`⚠️ ${error}.`)
    }
    notification(`🎉 You successfully added "${params[0]}".`)
    getProducts()
  })

document.querySelector("#show").addEventListener("click", async (e) => {
  if (e.target.className.includes("buyBtn")) {
    rentIndex = e.target.id
  }
  if (e.target.className.includes("rentProduct")) {
    editIndex = e.target.id
    document.getElementById("editProductName").value = products[editIndex].name
    document.getElementById("editImgUrl").value = products[editIndex].image
    document.getElementById("editProductDescription").value = products[editIndex].description
    document.getElementById("editPrice").value = products[editIndex].price / 1000000000000000000
  }
  if (e.target.className.includes("byReference")) {
    const ownerAddress = products[e.target.id].owner
    console.log(ownerAddress);
    getUserProducts(ownerAddress)
  }
})

document.getElementById("getAll").addEventListener("click", async (e) => {
  getProducts()
})

document.querySelector("#editProductBtn").addEventListener("click", async (e) => {
  const params = [
    editIndex,
    document.getElementById("editProductName").value,
    document.getElementById("editImgUrl").value,
    document.getElementById("editProductDescription").value,
    new Date(),
    new BigNumber(document.getElementById("editPrice").value).shiftedBy(ERC20_DECIMALS).toString()
  ]
  notification(`⌛ Editing "${params[1]}"...`)
  try {
    const result = await contract.methods
      .editProduct(...params)
      .send({ from: kit.defaultAccount })
  } catch (error) {
    notification(`⚠️ ${error}.`)
  }
  notification(`🎉 You successfully edited "${params[1]}".`)
  getProducts()
})

document.querySelector("#rentar").addEventListener("click", async (e) => {
  const days = document.getElementById("days").value

  var actual = Date.parse(new Date());
  var toRent = Date.parse(days);

  const total = (toRent - actual) / 86400000;

  console.log(rentIndex, days, Math.floor(total + 1));

  console.log(Math.floor(total + 1));

  if (total > 0) {
    notification("⌛ Waiting for payment approval...")
    try {
      await approve(products[rentIndex].price)
    } catch (error) {
      notification(`⚠️ ${error}.`)
    }
    notification(`⌛ Awaiting payment for "${products[rentIndex].name}"...`)
    try {
      const result = await contract.methods
        .rentProduct(rentIndex, days, Math.floor(total + 1))
        .send({ from: kit.defaultAccount })
      notification(`🎉 You successfully rented "${products[rentIndex].name}".`)
      getProducts()
      getBalance()
    } catch (error) {
      notification(`⚠️ ${error}.`)
    }
  }
  else {
    notification(`⚠️ Invalid Date.`)
  }

  
})

