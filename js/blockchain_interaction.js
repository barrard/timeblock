if (typeof web3 !== 'undefined') {
  web3 = new Web3(web3.currentProvider);
} else {
  // set the provider you want from Web3.providers
  // web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:9545"));
}

//check for metamask
if(!web3.currentProvider.isMetaMask){
  $('#metaMask').css({'display':'block'})
  // var metaUrl = 'https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en'
  // alert('this website is best used with MetaMask '+metaUrl)
}


web3.eth.getAccounts(function(e, r){
    console.log(r)
    $('#ethAccountID').html(r)
    web3.eth.getBalance(r.toString(),function(e, r){
      console.log(e)
      console.log(r.toNumber())
      $('#currentBalance').html(web3.fromWei(r.toNumber()))

    })
  })


//Thanks stackoverflow
//http://stackoverflow.com/questions/3745666/how-to-convert-from-hex-to-ascii-in-javascript

function a2hex(str) {
  var arr = [];
  for (var i = 0, l = str.length; i < l; i ++) {
    var hex = Number(str.charCodeAt(i)).toString(16);
    arr.push(hex);
  }
  return arr.join('');
}

function hex2a(hexx) {
    var hex = hexx.toString();//force conversion
    var str = '';
    for (var i = 0; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}

// var Time_clock_contract = web3.eth.contract()
var timeclockContract = web3.eth.contract([ { "constant": true, "inputs": [ { "name": "_index", "type": "uint256" } ], "name": "get_employee", "outputs": [ { "name": "", "type": "bytes32", "value": "0x" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "_name", "type": "bytes32" } ], "name": "employee_exists", "outputs": [ { "name": "", "type": "bool", "value": false } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "_name", "type": "bytes32" } ], "name": "clock_in", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "_name", "type": "bytes32" } ], "name": "add_employee", "outputs": [ { "name": "", "type": "bytes32[]" }, { "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "list_all_employees", "outputs": [ { "name": "", "type": "bytes32[]", "value": [] }, { "name": "", "type": "uint256", "value": "0" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "_name", "type": "bytes32" } ], "name": "clock_out", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [ { "name": "_name", "type": "bytes32" } ], "name": "get_time_stamps_for_name", "outputs": [ { "name": "", "type": "uint256[]", "value": [] } ], "payable": false, "stateMutability": "view", "type": "function" }, { "anonymous": false, "inputs": [ { "indexed": false, "name": "_from", "type": "address" }, { "indexed": false, "name": "_name", "type": "bytes32" }, { "indexed": false, "name": "_time", "type": "uint256" } ], "name": "clock_in_event", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "name": "_from", "type": "address" }, { "indexed": false, "name": "_name", "type": "bytes32" }, { "indexed": false, "name": "_time", "type": "uint256" } ], "name": "clock_out_event", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "name": "_from", "type": "address" }, { "indexed": false, "name": "_name", "type": "bytes32" }, { "indexed": false, "name": "_time", "type": "uint256" } ], "name": "employee_added_event", "type": "event" } ]);
var timeclock = timeclockContract.at("0xDBE68a77c36759315BCd317612E12E4a609A6111")
var clock_in_event = timeclock.clock_in_event({}, {fromBlock:0, toBlock:'latest'})
clock_in_event.watch(function(e, r){
  if(e){
    console.log('error')
    console.log(e)
  }else if (r){
    console.log(r)
  }
})

var clock_out_event = timeclock.clock_out_event({}, {fromBlock:0, toBlock:'latest'})
clock_out_event.watch(function(e, r){
  if(e){
    console.log('error')
    console.log(e)
  }else if (r){
    console.log(r)
  }
})

var employee_added_event = timeclock.employee_added_event({}, {fromBlock:0, toBlock:'latest'})
employee_added_event.watch(function(e, r){
  if(e){
    console.log('error')
    console.log(e)
  }else if (r){
    console.log(r)
  }
})

init()
//init with this function
function init(){
  list_all_employees()

}
function list_all_employees(){//returns array, and array length
  timeclock.list_all_employees(function(e, r){
    if(e){
      toastr.error(e, 'Failed to get all employees')
    }else if (r){
      toastr.success('Employee list populated')
      var emp_array = r[0]
      for(let x = 0; x<emp_array.length;x++){
        var emp = emp_array[x].slice(2)
        emp = emp.slice(0, emp.indexOf(0))
        emp = hex2a(emp)
        $('#employee_list').append(`
          <li onclick=get_time_stamps_for_name("${emp}")>${emp}</li>
          <button onclick=clock_in("${emp}")>Clock in</button>
          <button onclick=clock_out("${emp}")>Clock out</button>

          `)
      }
    }
  })
}

function clock_in(_name){
  timeclock.clock_in(_name, function(e, r){
  console.log(e)
  console.log(r)
  })


}
function clock_out(_name){
  timeclock.clock_out(_name, function(e, r){
  console.log(e)
  console.log(r)
  })



}

var time_stamp_list = $('#time_stamps_for_current_selected_employee')
function get_time_stamps_for_name(_name){
  time_stamp_list.html('')
  $('#current_selected_employee').text(_name)
  timeclock.get_time_stamps_for_name(_name, function(e, r){
    if(e){
      console.log(e)
      toastr.warning(e, 'failed to get time stamps for '+_name)

    }else if(r){
      console.log(r)
      toastr.success('successfuly got time stamps for '+_name)
      for(let x = 0 ; x < r.length ; x++){
        var color;
        if(x%2==0){
          color = 'class=clock-in'
        }else{
          color = 'class=clock-out'
        }
        var time = r[x].toNumber() * 1000
        time = new Date(time)
        time_stamp_list.append(`<li ${color}>${time}</li>`)

        console.log()
      }



    }
  })


}

var add_emp_btn = $('#add_employee_btn')
var emp_name_input = $('#employee_name_input')
$(add_emp_btn).on('click', function(){add_employee(emp_name_input.val())})

function add_employee(_name){
  timeclock.add_employee(_name, function(e, r){
    if(e){
      console.log(e)
      toastr.warning(e, `failed to add ${_name}`)
    }else if(r){
      console.log(r)
      toastr.success(e, `successfully added ${_name}`)

    }
  })

 
}










function handleBasicCallback(e, r, options){
  for (let k in options){
    $('#'+k).html(options[k])
  }
  if(e){
    console.log(e)

  }else if(r){
    console.log(r)

  }else{
    console.log('error getting peer count')
  }
}


web3.net.getPeerCount(function(e, r){
  handleBasicCallback(e, r, {peerCount:r})
})

$('#web3APIVersion').html(web3.version.api)

web3.version.getNetwork(function(e, r){
    handleBasicCallback(e, r, {web3versionNetwork:r})

})

web3.version.getEthereum(function(e, r){    //parse the returned hexedecimal
    handleBasicCallback(e, r, {web3EthereumVersion:parseInt(r, 16)})
})


$('#web3ConnectionStatus').html(web3.isConnected())



web3.net.getListening(function(e, r){
  handleBasicCallback(e, r, {webisListening:r})

})



var ethFunction = web3.eth
for(let k in ethFunction){
  var option = "<option value='"+k+"'>"+k+"</option>"
  $('#ethFunctions').append(option)
}


//see latest block and time since last block
var newestBlockTimer;
var blockTimerStart=0;
var currentBlockID;
$('#timeSinceLastBlock').html(blockTimerStart);
initLatestBlockTimer()
function initLatestBlockTimer(){
  newestBlockTimer = setInterval(function(){
    web3.eth.getBlockNumber(function(e, r){

      if(r==$('#currentBlockID').html()){

        $('#timeSinceLastBlock').html(blockTimerStart);
        blockTimerStart++
      }else{

        $('#currentBlockID').html(r)
        clearInterval(newestBlockTimer)
        blockTimerStart=0
        initLatestBlockTimer()

      }
      })

  }, 1000)
}





