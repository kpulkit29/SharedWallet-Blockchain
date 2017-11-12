var mywal=artifacts.require("./multi.sol");
////testing contract for sending money
contract("multi",function(acc){
 it("should be able to put money",function(){
return mywal.deployed().then(function(ins){
   contract_obj=ins;
  return contract_obj.sendTransaction({value:web3.toWei(10,"ether"),address:contract_obj.address,from:acc[0]});
}).then(function(hash){
    console.log(hash);
   assert.equal(web3.eth.getBalance(contract_obj.address).toNumber(),web3.toWei(10,"ether"),"eq they are");
});
 });
 //test to tranfer funds
 it("should be able to transfer",function(){
    return mywal.deployed().then(function(ins){
     contract_obj=ins;
     return contract_obj.send_money(acc[1],web3.toWei(10,"ether"),"mari marzi",{from:acc[1]});
    }).then(function(res){
      console.log(res);
    });
 });
 //to confirm the transaction
 it("confirmation",function(){
   return mywal.deployed().then(function(ins){
      return ins.confirm(1)
   }).then(function(res){
    console.log(res);
   });
 });
});