pragma solidity ^0.4.0;
import "./mortal.sol";
contract multi is mortal {
    event rFund(address from,uint amount);
    event prop_receive(address frm,address to,uint amount,string reason,uint count);
    event confirmEvent(address from,uint id);
     struct proposal{
        address frm;
        address to;
        string res;
        uint amt;
        bool sent;
    }
    mapping(uint=>proposal) myprop;
   
    uint prop_count;
    function send_money(address _to,uint amt,string reason) returns (uint) {
        if(owner==msg.sender) {
            bool sent=_to.send(amt);
            prop_receive(msg.sender,_to,amt,reason,0);
            if(!sent) {
                throw;
            }
        }
        else {
            prop_count++;
            myprop[prop_count]=proposal(msg.sender,_to,reason,amt,false);
            prop_receive(msg.sender,_to,amt,reason,prop_count);
            return prop_count;
        }
    }
    function confirm(uint id) onlyowner {
        proposal obj=myprop[id];
        if(obj.frm!=address(0)) {
            if(obj.sent!=true) {
            obj.sent=true;
            obj.to.send(obj.amt);
                confirmEvent(obj.frm,id);
            }
        }
        //confirmEvent(obj.frm,id);
    }
    function() payable {
        if(msg.value>0) {
            rFund(msg.sender,msg.value);
        }
    }
}