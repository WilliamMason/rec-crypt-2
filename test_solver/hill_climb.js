// hill-climber with log trigraph scoring
importScripts('tritable.js'); 

//postMessage("tri_values loaded");
var tri_table = new Array();
var alpha="ABCDEFGHIJKLMNOPQRSTUVWXYZ";	
var buffer = new Array();
var plain_text = new Array();
var key = new Array();
var max_trials;

function initialize_tri_table(){
	var i,c,n,v;

	for ( i = 0; i<26*26*26;i++)
		tri_table[i] = 0.0;
	for ( c in tri_values){
		n = alpha.indexOf(tri_values[c].charAt(0))+	26*alpha.indexOf(tri_values[c].charAt(1))
			+ 26*26*alpha.indexOf(tri_values[c].charAt(2));
		v = parseFloat(tri_values[c].slice(3));
		tri_table[n] = v;
	}
	//alert("tri_table initialized");
	postMessage("0tri table initialized");
}	
initialize_tri_table();
max_trials = 1000000;

function get_score(buf_len){
	var score,i,n;

	// decode using key
	for (i=0;i<buf_len;i++)
		plain_text[i] = key[ buffer[i] ];	
	// get trigraph score
	score = 0.0;
	for (i=0;i<buf_len-2;i++){
		n = plain_text[i]+26*plain_text[i+1]+26*26*plain_text[i+2];
		score += tri_table[n];
	}
	return(score);
}	

function do_hill_climbing(str){
	var  out_str,c,n,v,buf_len,score,i,j,trial;
	var n1,n2,v1,v2,max_score,current_hc_score;
	var mut_count;
	//var max_trials; // now global
	var s;
  
	str = str.toUpperCase();
	buf_len = 0;
	for ( i=0;i<str.length;i++){
		c = str.charAt(i);
		n = alpha.indexOf(c);
		if ( n>=0)
			buffer[buf_len++] = n;
			//plain_text[buf_len++] = n;
	}
	for (i=0;i<26;i++)
		key[i] = i;
	// random start;
	for (i=25;i>0;i--) {
		j = Math.floor( Math.random()*i);
		c = key[j];
		key[j]=key[i];
		key[i] = c;
	}
	max_score = current_hc_score = score = get_score(buf_len);	
	out_str = '0';
	for (i=0;i<buf_len;i++)
		out_str += alpha.charAt(plain_text[i]).toLowerCase();
	out_str += "\n score of plaintext is "+score;
	//document.getElementById('output_area').value = out_str;	
	postMessage(out_str);
	mut_count = 0;

	for (trial = 0;trial < max_trials;trial++){
		n1 = Math.floor(Math.random()*26);
		n2 = Math.floor(Math.random()*26);
		v1 = key[n1];
		v2 = key[n2];
		key[n1]=v2;
		key[n2]=v1;
		score = get_score(buf_len);
		if ( score>max_score){
			max_score = score;
			out_str = '0'; // 0 at beginning is signal to post message in output box
			for (i=0;i<buf_len;i++)
				out_str += alpha.charAt(plain_text[i]).toLowerCase();
			out_str += "\n score of plaintext is "+score;
			//document.getElementById('output_area').value = out_str;	
			postMessage(out_str);
		}
		if ( score > current_hc_score){
			current_hc_score = score;
			mut_count = 0;
		}
		else {
			key[n1]=v1;
			key[n2]=v2;
			mut_count++;
			if ( mut_count > 500)
				current_hc_score = -100.0
		}
	} // next trial
}	
onmessage = function(event) { //receiving a message with the string to decode, start hill-climbing
	var  out_str,c,n,v,buf_len,score,i,j,trial;
	var n1,n2,v1,v2,max_score,current_hc_score;
	var mut_count;

  var str = event.data; // string to decode
  if (str.charAt(0)  == '@')
  	max_trials = parseInt(str.slice(1));
  else if (str.charAt(0)  == '~') {// redo the random seed
  	trial = parseInt(str.slice(1));
  	Math.random(trial);
  }
  else {
		postMessage("1working...");
		do_hill_climbing(str);
			//alert("done");
			postMessage("1DONE"); // 1 at beginning is signal not to post in output box
			//close();  
  }
};  
