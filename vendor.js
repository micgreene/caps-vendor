'use strict';

//3rd part dependencies
const faker = require('faker');
const io = require('socket.io-client');

//internal modules
const eventMessage = require('./event-message.js');

//configure .env variables
require('dotenv').config();

 let port = process.env.PORT;
 let host = `http://localhost:${port}`;
 
let STORENAME = process.env.STORENAME;

//causes first order to always start at id: 0
let orderNumTracker = -1;

//connect to socket
const socket = io.connect(`${host}/caps`);

//call each event emitter explicitly
//after the vendor has connected to the host, enter a unique room and search for backlogged 'delivered' messages
socket.emit('enter-room', { type:'delivered', storeName:STORENAME });

//listeners
socket.on('delivered', deliveryComplete);
socket.on('connectToRoom', payload => {
  //if you have successfully connected to your room, then you should receive welcome message 
  console.log(payload);
});

//outlines properties of object for new order details and assign it a new id
function fakeorder(){  
  orderNumTracker++;
 let newOrder = {
    storeName: STORENAME,
    orderId: orderNumTracker,
    customerName: faker.name.findName(),
    address: faker.fake('{{address.streetAddress}}, {{address.cityName}},{{address.stateAbbr}}, {{address.zipCode}}')
  }
  console.log('******************New Order!******************');
  return newOrder;
}

//creates and returns a new order detail
function createNewOrder(){
  let newOrder = fakeorder();

  return newOrder;
}

function deliveryComplete(payload){
  //update live status message
  console.log(`Vendor: "Order #${payload.orderId} has been successfully delivered. ${STORENAME} thanks you for your patronage!"`);
}

function setPickup(newOrder){  
  let eventType = {
    event: 'Pick-Up',
    time: new Date()
  }

  //update the messaging system for new event
  eventMessage(eventType, newOrder);

  //how to call by using emitters
  socket.emit('create-pickup', newOrder);
}

// setInterval(()=> {
//   //create a new fake order and set the event status type to 'pickup'
//   let newOrder = createNewOrder();
//   setPickup(newOrder);    
// }, 500);

module.exports = { setPickup };
