$(document).ready(function(){
	
	$("#search-currency").on("keyup", function() {
    var value = $(this).val().toLowerCase();
    $("#currencyTable tr").filter(function() {
      $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
    });
  });
	
	var urls=[{"exchange":"coindelta","class":"warning","apiUrl":"https://api.coindelta.com/api/v1/public/getticker/"},
	{"exchange":"koinex","class":"info","apiUrl":"https://koinex.in/api/ticker"}];
	var price={};
	var oldPrice = {};
    $("button").click(function(){
       parsecoindelt();
	});

	var parsecoindelt = function(){
		console.log("loading .. ")
		$.ajax({url: "https://api.coindelta.com/api/v1/public/getticker/", success: function(result){
			Object.keys(result).forEach(function(key){
				var value = result[key];
				if(value.MarketName.indexOf("-inr")>-1){
					var crType= value.MarketName.replace("-inr",'').toUpperCase()
					loadPrices(crType,value.Ask,value.Bid,0,"",value.Last);
				}
			});
			parsekoinex();
        }});
	};

	var loadPrices= function(currency,ask,bid,index,name,lasttraded){
			if(price[currency] !=null){
				price[currency].buy[index]	= ask;
				price[currency].sell[index]	= bid;
				price[currency].last[index]	= lasttraded;
				price[currency].name=name;
			}else{
				
				price[currency]={"buy":[],"sell":[],"name":"",last:[]};
				price[currency].name=name;
				for(var i=0;i<index;i++){
					price[currency].buy[i]	=0;
					price[currency].sell[i]	= 0;
					price[currency].last[i]	= 0;	
				}
				price[currency].buy[index]	=ask;
				price[currency].sell[index]	= bid;
				price[currency].last[index]	= lasttraded;
				
			}
	};
	var parsekoinex =function(){
		$.ajax({url: "https://koinex.in/api/ticker", success: function(result){
			var stats= result.stats.inr;
			Object.keys(stats).forEach (function(key){
				var value = stats[key];
				loadPrices(key,value.lowest_ask,value.highest_bid,1,value.currency_full_form.toUpperCase(),value.last_traded_price);
			});
			console.log(price);
			getHTML();
        }});
	};
	
	var createTDElement=function(className, value,oldValue){
		if(oldValue!=null){
			if(value > oldValue){
				debugger;
				className="success";
			}else if(value < oldValue){
				debugger;
				className = "danger";
			}
		}
		
		if(className!=null){
			var td="<TD class='"+className+"'>"+value+"</TD>";	
		}else{
			var td="<TD>"+value+"</TD>";	
		}
		return td;
	};
	
	var isBuygtSell=function(buy,sell){
		
		if(buy!=null && sell != null){
		  for(var i=0;i< buy.length;i++){
			for(var j=0;j<sell.length;j++){
				if (i!=j && buy[i]!=0 && sell[j]!=0 && buy[i] <= sell[j]){
					return true;
				}	
			}	
		  }	
		}
	}	
	var getHTML=function(){
		var html= "<TABLE class='table table-bordered'>";
			html=html+"<THEAD><TR>"
			html=html+"<TH rowspan=2 style='vertical-align:center;'>Currency</TD><TH COLSPAN=2 style='align:center'>BUY</TH><TH COLSPAN=2 style='align:center'>SELL</TH><TH COLSPAN=2 style='align:center'>Last traded</TH></TR><TR><TH>Coin delta</TH><TH>Koinex</TH><TH>Coin delta</TH><TH>Koinex</TH><TH>Coin delta</TH><TH>Koinex</TH>"
			html=html+"</TR></THEAD><TBODY id='currencyTable'>"
			Object.keys(price).forEach (function(key){
				var value = price[key];
				var oldValue= oldPrice[key];
				html=html+"<TR>";
				var highlightClass=null;
				if(isBuygtSell(value.buy,value.sell)==true){
					highlightClass= "success";
				}				
				html=html+createTDElement(highlightClass,key+"("+value.name+")");
				for(var i=0;i<urls.length;i++){ // buy prices
					var val= (oldValue!=null)?oldValue.buy[i]:null;
					if(value.buy[i]!=null)
						html=html+createTDElement(urls[i].class,value.buy[i],val);
					else{
						html=html+createTDElement(urls[i].class,0,null);
					}
				}
				for(var i=0;i<urls.length;i++){  // sell prices
				var val= (oldValue!=null)?oldValue.sell[i]:null;
					if(value.sell[i]!=null)
						html=html+createTDElement(urls[i].class,value.sell[i],val);
					else{
						html=html+createTDElement(urls[i].class,0,null);
					}
				}
				for(var i=0;i<urls.length;i++){  // sell prices
					if(value.last[i]!=null)
						html=html+createTDElement(urls[i].class,value.last[i]);
					else{
						html=html+createTDElement(urls[i].class,0);
					}
				}
				html=html+"</TR>";
			});
			
		html=html+ "</TBODY></TABLE>"
		$("#div1").html(html);
		oldPrice = JSON.parse(JSON.stringify(price));
		setTimeout(function(){
			parsecoindelt();
		}, 30000);
	};
	parsecoindelt();	
});