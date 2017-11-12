// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";
import "bootstrap/dist/css/bootstrap.css";
// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import multi_artifacts from '../../build/contracts/multi.json'
var Multi_wallet = contract(multi_artifacts);

var accounts;
var account;

window.App = {
  start: function() {
    var self = this;

    // Bootstrap the MetaCoin abstraction for Use.
    Multi_wallet.setProvider(web3.currentProvider);

    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function(err, accs) {
      if (err != null) {
        alert("There was an error fetching your accounts.");
        return;
      }

      if (accs.length == 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
        return;
      }
      console.log(accs);
      accounts = accs;
      account = accounts[0];

      self.getBalance();
      self.listenEvents();
      document.getElementById("addresses").innerHTML=accounts.join("<br />");
    });
  },
  getBalance:function () {
    var bal=0;
    Multi_wallet.deployed().then(function(ins){
      document.getElementById("acc_no").innerHTML=ins.address;
      web3.eth.getBalance(ins.address, function(err, balance) {
        if(err) throw err;
         bal=balance;
         document.getElementById("bal").innerHTML=web3.fromWei(bal.toNumber(),"ether");
        });
      
    });
    },
  sendEther:function(){
    Multi_wallet.deployed().then(function(ins){
      return ins.sendTransaction({from:account,to:ins.address,value:web3.toWei(5,"ether")});
    }).then(function(hash){
      console.log(hash);
      App.getBalance();
    });
  },
  //to transfer money from one acc to another
  transfer:function(){
    var _to=document.getElementById("addr").value;
    var amount=document.getElementById("amt").value;
    var reason=document.getElementById("reason").value;
    Multi_wallet.deployed().then(function(ins){
    return ins.send_money(_to,web3.toWei(amount,"ether"),reason,{from:document.getElementById("addr_send").value,gas:500000});
 }).then(function(res){
    console.log(res);
    App.getBalance();
 });
  },
  //confirm event
  confirm:function(){
    Multi_wallet.deployed().then(function(ins){
     return ins.confirm(1,{from:accounts[0]});
    }).then(function(res){
       console.log(res);
       App.getBalance();
    });
  },
  //to listen to events
  listenEvents:function(){
    Multi_wallet.deployed().then(function(ins){
     ins.rFund({},{fromBlock:0,toBlock:'latest'}).watch(function(err,ev){
        if(err){throw err;}
        document.getElementById("fund").innerHTML+="<li>"+JSON.stringify(ev.args)+"</li><br>"
     });
     ins.prop_receive({},{fromBlock:0,toBlock:'latest'}).watch(function(err,ev){
      if(err){throw err;}
      document.getElementById("prop").innerHTML+="<li>"+JSON.stringify(ev.args)+"</li><br>"
   });
   ins.confirmEvent({},{fromBlock:0,toBlock:'latest'}).watch(function(err,ev){
    if(err){throw err;}
    document.getElementById("confirm").innerHTML+="<li>"+JSON.stringify(ev.args)+"</li><br>"
 });
    });
    
  }
};

window.addEventListener('load', function() {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }

  App.start();
});
