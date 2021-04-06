//Libraries
const DiscordJS = require('discord.js');
require('dotenv').config()
var auth = require('./auth.json');
var fs = require('fs');

//Constants and variables
const bot = new DiscordJS.Client()
const guildID = '695094566923010089';
var Shops = fs.readdirSync("Shops");

//Functions
function RandInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}
const getApp = (guildID) => {
	const app = bot.api.applications(bot.user.id);
	if (guildID){
		app.guilds(guildID);
	}
	return app
}

// Initialize Discord Bot
bot.on('ready', async()=>{
    console.log('Anna is ready for service.');

	const commands = await getApp(guildID).commands.get();
	//console.log(commands);
	

	await getApp(guildID).commands.post({
		data:{
			name: 'r',
			description: 'Roll a dice',
			options:[
				{
					name: 'Dice',
					description: 'The amount and type of dice to roll (Ex: 1d20)',
					required: false,
					type: 3
				},
				{
					name:'Advantage_or_Disadvantage',
					description:'Is the roll made at advantage or disadvantage?',
					required:false,
					type: 4,
					choices:[
						{
							name:'Advantage',
							value: 2
						},
						{
							name:'Disadvantage',
							value: 1
						}
					]
				},
				{
					name: 'Modifier',
					description: 'Add or subtract from the total (Ex: +2 or -1).',
					required: false,
					type: 3
				}
			]
		},
	});

	await getApp(guildID).commands.post({
		data:{
			name:'s',
			description:'Ask about a specific Spell',
			options:[
				{
					name:'Spell',
					description:'The name of the Spell.',
					required:true,
					type: 3
				}
			]
		}
	});

	await getApp(guildID).commands.post({
		data:{
			name:'i',
			description:'Ask about a specific Item',
			options:[
				{
					name:'Item',
					description:'The name of the Item.',
					required:true,
					type: 3
				}
			]
		}
	});

	await getApp(guildID).commands.post({
		data:{
			name:'f',
			description:'Ask about a specific Feat or Feature',
			options:[
				{
					name:'Feat_or_Feature',
					description:'The name of the Feat/Feature.',
					required:true,
					type: 3
				}
			]
		}
	});

	await getApp(guildID).commands.post({
		data:{
			name:'shop',
			description:'Ask about a specific Shop',
			options:[
				{
					name:'Shop',
					description:'The name of the Shop.',
					required:true,
					type: 3
				}
			]
		}
	});

});

//Bot Login
bot.login(process.env.TOKEN);

//Bot functions
bot.ws.on('INTERACTION_CREATE',async(interaction)=>{
	try{
		var userID = interaction.member.user.id;
	}
	catch{
		var userID = interaction.user.id;
	}
	var { name, options } = interaction.data
	const command = name.toLowerCase();
	const args = {};
	if (options){
		for(var option of options){
			var { name, value} = option;
			args[name] = value;
		}
	}
/************************************Roll******************************************************/
	if (command === 'r'){
		var Stupid = 0;
		var msg = '<@'+userID+'>\n';
		var RollsF=[];
		try{
			if (!args.dice || !args.dice.match(/[0-9]+d[0-9]+/)){
				args.dice = '1d20';
			}
			var cmd1 = args.dice.match(/[0-9]+/g);
			var cmd2 = args.dice.match(/[+-]|[A-z]+/g);
			var cmd = [];
			if (parseInt(cmd1[0])>20 | parseInt(cmd1[1])<2){
				Stupid=1;
			}
			for (let i = 0; i < cmd1.length; i++) {
				cmd.push(parseInt(cmd1[i]));
				cmd.push(cmd2[i]);
			}
			cmd=cmd.filter(function (el) {
				return el != null;
			});
			var Rolls=[];
			if (!Stupid){
				for (let i = 0; i < cmd[0]; i++) {
					Rolls.push(RandInt(cmd[2])+1);
				}
				msg=msg+'Rolls: '+args.dice+' ('+Rolls+')';
				if (args.advantage_or_disadvantage){
					RollsF=[];
					if(args.advantage_or_disadvantage==2){
						var max=Math.max(...Rolls);
						RollsF.push(max);
					}
					else{
						var min=Math.min(...Rolls);
 						RollsF.push(min);
					}
					Rolls = RollsF;
				}
				if (args.modifier){
					RollsF=[];
					var Mods = args.modifier.match(/[+-][0-9]+/g);
					RollsF.push(Rolls.reduce(function(a, b){
						return a + b;
						}, 0));
					for(let i=0 ;i<Mods.length;i++){
						RollsF[0] += parseInt(Mods[i]);
					}
					Rolls=RollsF
				}
				if (args.modifier || args.advantage_or_disadvantage){
					msg=msg+"\nEnd Result: ("+Rolls+")";
				}
			}

			else{
				msg = msg+"Tried to do something very stupid.";
			}

		}
		catch(err){
			msg = "It seems I've run into a small problem. Please contact the developer.";
		}
		bot.api.interactions(interaction.id,interaction.token).callback.post({
			data:{
				type: 4,
				data:{
					content:msg,
				}
			}
		});
	}

/********************************************Spells*********************************************/
	else if (command === 's'){
		var cmd = args.spell.replace('\'','').replace('  ',' ')+'.txt';
		var Initial = cmd.substring(0,1);
		var Path="Spells/"+Initial+"/"+cmd
		var data = fs.readFile(Path,function(err,data){
			if(err){
				var msg = "Sorry, I don't know about that spell";
			}
			else{
				var Spell = JSON.parse(data);
				var msg = Spell.Lv+' '+Spell.Range;
				if (Spell.Mat != 'Nothing'){
					msg=msg+' Needs '+Spell.Mat;
				}
				msg=msg+'\n'+Spell.Desc;
			}
			bot.api.interactions(interaction.id,interaction.token).callback.post({
				data:{
					type: 4,
					data:{
						content:msg,
					}
				}
			});
		});
	}
/********************************************Items*********************************************/
	else if(command === 'i'){
		var cmd = args.item.toUpperCase().replace('\'','')+".txt";
		var Initial = cmd.substring(0,1);
		var Path="Items/"+Initial+"/"+cmd
		var data = fs.readFile(Path,function(err,data){
			if(err){
				var msg = "Sorry, I don't carry that stuff";
			}
			else{
			var Item = JSON.parse(data);
			var msg = "This item costs "+Item.Price+"\n"+Item.Desc;
			}
			bot.api.interactions(interaction.id,interaction.token).callback.post({
				data:{
					type: 4,
					data:{
						content:msg,
					}
				}
			});	
		});
	}
/********************************************Feats*********************************************/
	else if(command === 'f'){
		var cmd = args.feat_or_feature.toUpperCase().replace('\'','')+".txt";
		var Initial = cmd.substring(0,1);
		var Path="Feats/"+Initial+"/"+cmd;
		var data = fs.readFile(Path,function(err,data){
			if(err){
				var msg = "Sorry, I don't know about that feat";
			}
			else{
				var Feat = JSON.parse(data);
				var msg = Feat.Desc;
			}
			bot.api.interactions(interaction.id,interaction.token).callback.post({
				data:{
					type: 4,
					data:{
						content:msg,
					}
				}
			});
		});
	}
/********************************************Shop*********************************************/
	else if(command === 'shop'){
		var cmd = args.shop.toUpperCase().replace('\'','').split(" ");
		var Path="Shops/"+cmd[0]+".txt";
		var data = fs.readFile(Path,function(err,data){
			if(err){
				var msg = "Sorry, I don't know about that store";
			}
			else{
				var msg="Here is what I have in stock at the moment";
				data = data.filter(function(value, index, arr){ 
					return value != 13;
				}).toString().split("\n");
				var pages = Math.ceil(data.length/34)
				cmd[1]=parseInt(cmd[1])
				if (cmd[1]<1 | isNaN(cmd[1])){
					cmd[1]=1;
				}
				if (cmd[1]<pages){
					page=(cmd[1]-1)*34
					for (let i = 0; i < 34; i+=2) {
						data[page+i]=data[page+i]+"-";
						while ((data[page+i]+data[page+i+1]).length < 40){
							data[page+i]=data[page+i]+"-";
						}
						msg=msg+"\n"+data[page+i]+data[page+i+1];   
					}
					msg=msg+"\nPage "+parseInt(cmd[1])+"/"+parseInt(pages);
				}
				else if (cmd[1]==pages){
					for (let i = 34*(pages-1); i < data.length; i+=2) {
						data[i]=data[i]+"-";
						while ((data[i]+data[i+1]).length < 40){
							data[i]=data[i]+"-";
						}
						msg=msg+"\n"+data[i]+data[i+1];
					}
					msg=msg+"\nPage "+parseInt(pages)+"/"+parseInt(pages);
				}
				else{
					msg="You think you're funny?";
				}
		}
		bot.api.interactions(interaction.id,interaction.token).callback.post({
			data:{
				type: 4,
				data:{
					content:msg,
				}
			}
		});
		});
	}
});